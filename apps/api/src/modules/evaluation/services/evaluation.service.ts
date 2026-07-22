import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../../../app/prisma.service';
import { OpenAIService } from '../../ai/services/openai.service';
import {
  EvaluationResult,
  EvaluationInput,
} from '../interfaces/evaluation.interface';
import {
  getEvaluationPrompt,
  renderPrompt,
} from '../prompts/evaluation.prompts';
import { AIEvaluationResponse } from '../../ai/interfaces/ai-response.interface';
import { EvaluationStatus } from '@prisma/client';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openaiService: OpenAIService,
  ) {}

  /**
   * Start evaluation of a complete interview
   */
  async evaluateInterview(interviewId: string): Promise<EvaluationResult> {
    try {
      // Load interview with all questions and answers
      const interview = await this.prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          questions: {
            include: {
              answer: true,
              evaluation: true,
            },
            orderBy: { questionNumber: 'asc' },
          },
          technology: true,
          category: true,
        },
      });

      if (!interview) {
        throw new HttpException('Interview not found', HttpStatus.NOT_FOUND);
      }

      if (interview.status !== 'COMPLETED') {
        throw new HttpException(
          'Interview must be completed before evaluation',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if evaluation already exists
      const existingEvaluations = await this.prisma.interviewEvaluation.findMany(
        {
          where: {
            question: {
              interviewId,
            },
          },
        },
      );

      const existingByQuestionId = new Map(
        existingEvaluations.map((evaluation: any) => [evaluation.questionId, evaluation]),
      );

      const questionsToEvaluate = interview.questions.filter((question: any) => {
        const existing = existingByQuestionId.get(question.id);
        return (
          !existing ||
          existing.overallScore === null ||
          existing.evaluationStatus !== EvaluationStatus.COMPLETED
        );
      });

      if (questionsToEvaluate.length === 0 && existingEvaluations.length > 0) {
        return this.buildEvaluationResult(existingEvaluations, interview);
      }

      // Process only missing/incomplete questions
      const evaluationPromises = questionsToEvaluate.map((question: any) =>
        this.evaluateQuestion({
          questionId: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          difficulty: interview.difficulty,
          technology: interview.technology.name,
          answer: question.answer?.answerText || question.answer?.codeAnswer || '',
          expectedAnswer: question.referenceAnswer,
          timeTaken: question.answer?.timeTakenSeconds,
          interviewType: interview.interviewType,
        }),
      );

      const results = await Promise.allSettled(evaluationPromises);

      // Save all evaluations
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value) {
          successCount++;
        } else {
          failureCount++;
          this.logger.error(
            `Failed to evaluate question ${questionsToEvaluate[i].id}`,
            (result as any).reason,
          );
        }
      }

      // Fetch all saved evaluations
      const savedEvaluations =
        await this.prisma.interviewEvaluation.findMany({
          where: {
            question: {
              interviewId,
            },
          },
        });

      // Update interview overall score
      const scores = savedEvaluations
        .map((e: any) => e.overallScore)
        .filter((s: number | null): s is number => s !== null);

      if (scores.length > 0) {
        const overallScore =
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        await this.prisma.interview.update({
          where: { id: interviewId },
          data: { overallScore },
        });
      }

      return this.buildEvaluationResult(savedEvaluations, interview);
    } catch (error) {
      this.logger.error(`Failed to evaluate interview ${interviewId}:`, error);
      throw error;
    }
  }

  /**
   * Evaluate a single question
   */
  async evaluateQuestion(input: EvaluationInput): Promise<EvaluationResult> {
    try {
      // Check if evaluation already exists
      const existingEvaluation =
        await this.prisma.interviewEvaluation.findUnique({
          where: { questionId: input.questionId },
        });

      if (existingEvaluation && existingEvaluation.overallScore !== null) {
        return this.mapEvaluationToResult(existingEvaluation);
      }

      // Get or create evaluation record
      let evaluation = existingEvaluation;
      if (!evaluation) {
        evaluation = await this.prisma.interviewEvaluation.create({
          data: {
            questionId: input.questionId,
            evaluationStatus: EvaluationStatus.PROCESSING,
          },
        });
      } else {
        evaluation = await this.prisma.interviewEvaluation.update({
          where: { questionId: input.questionId },
          data: { evaluationStatus: EvaluationStatus.PROCESSING },
        });
      }

      // Get evaluation prompt based on question type
      const promptTemplate = getEvaluationPrompt(input.questionType);

      // Render prompt with actual values
      const userPrompt = renderPrompt(promptTemplate, {
        QUESTION: input.questionText,
        ANSWER: input.answer,
        EXPECTED_CONCEPTS: input.expectedAnswer || 'See reference answer',
        EXPECTED_COMPLEXITY: 'Not specified',
        INTERVIEW_TYPE: input.interviewType || 'Technical',
        DIFFICULTY: input.difficulty,
        REQUIREMENTS: 'Not specified',
      });

      let aiResponse: AIEvaluationResponse;

      try {
        // Call OpenAI
        const response = await this.openaiService.sendMessage(
          [{ role: 'user', content: userPrompt }],
          'You are an expert technical interviewer providing detailed evaluation feedback.',
        );

        // Parse and validate response
        aiResponse =
          this.openaiService.parseJSONResponse<AIEvaluationResponse>(response);
        this.openaiService.validateEvaluationResponse(aiResponse);
      } catch (error) {
        this.logger.warn(
          `OpenAI evaluation unavailable for question ${input.questionId}; using heuristic fallback`,
          error,
        );
        aiResponse = this.buildHeuristicEvaluation(input);
      }

      // Save evaluation to database
      evaluation = await this.prisma.interviewEvaluation.update({
        where: { id: evaluation.id },
        data: {
          technicalScore: aiResponse.scores.technicalKnowledge,
          architectureScore: aiResponse.scores.architecture,
          communicationScore: aiResponse.scores.communication,
          problemSolvingScore: aiResponse.scores.problemSolving,
          codeQualityScore: aiResponse.scores.codeQuality,
          overallScore: aiResponse.overallScore,
          strengths: aiResponse.strengths.join('\n'),
          weaknesses: aiResponse.weaknesses.join('\n'),
          correctAnswer: aiResponse.idealAnswer,
          improvedAnswer: aiResponse.improvedAnswer,
          learningRecommendations: aiResponse.learningRecommendations.join('\n'),
          aiResponseJson: (aiResponse as Record<string, any>),
          evaluationStatus: EvaluationStatus.COMPLETED,
        },
      });

      return this.mapEvaluationToResult(evaluation);
    } catch (error) {
      this.logger.error(
        `Failed to evaluate question ${input.questionId}:`,
        error,
      );

      // Mark evaluation as failed
      await this.prisma.interviewEvaluation.update({
        where: { questionId: input.questionId },
        data: {
          evaluationStatus: EvaluationStatus.FAILED,
        },
      }).catch((err: any) => this.logger.error('Failed to mark evaluation as failed:', err));

      throw error;
    }
  }

  private buildHeuristicEvaluation(input: EvaluationInput): AIEvaluationResponse {
    const answer = (input.answer || '').trim();
    const questionText = (input.questionText || '').toLowerCase();
    const expectedAnswer = (input.expectedAnswer || '').toLowerCase();
    const answerText = `${questionText} ${answer} ${expectedAnswer}`;

    const keywords = Array.from(
      new Set(
        (input.expectedAnswer || input.questionText || '')
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((word: string) => word.length > 3 && !['this','that','with','from','your','about','answer','question','should','could'].includes(word)),
      ),
    ).slice(0, 8);

    const matchedKeywords = keywords.filter((keyword: string) => answer.toLowerCase().includes(keyword));
    const hasSubstance = answer.length > 40;
    const hasConcreteExample = /example|because|since|for instance|however|scenario|trade-off|tradeoff/i.test(answer);
    const hasStructure = /first|second|next|therefore|in short|step|finally|because|however/i.test(answer);
    const hasTechnicalTerms = /(api|database|service|architecture|cache|micro|thread|async|promise|function|class|design|system|scalability|latency|security)/i.test(answer);
    const coverage = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0.5;

    const technicalKnowledge = Math.min(100, Math.round(55 + coverage * 25 + (hasTechnicalTerms ? 8 : 0) + (hasSubstance ? 5 : 0)));
    const architecture = Math.min(100, Math.round(56 + coverage * 18 + (hasConcreteExample ? 8 : 0) + (hasStructure ? 4 : 0)));
    const communication = Math.min(100, Math.round(60 + (hasStructure ? 8 : 0) + (hasSubstance ? 7 : 0)));
    const problemSolving = Math.min(100, Math.round(58 + coverage * 16 + (hasConcreteExample ? 8 : 0)));
    const codeQuality = Math.min(100, Math.round(57 + (hasStructure ? 6 : 0) + (hasSubstance ? 5 : 0)));

    const overallScore = Math.round(
      (technicalKnowledge + architecture + communication + problemSolving + codeQuality) / 5,
    );

    const strengths = [
      hasSubstance
        ? 'The answer is relevant and explains the topic with enough detail to be useful.'
        : 'The response addresses the question and gives a starting point for discussion.',
      matchedKeywords.length > 0
        ? `The answer touches on key ideas such as ${matchedKeywords.slice(0, 3).join(', ')}.`
        : 'The answer shows an initial attempt to reason through the problem.',
      hasConcreteExample || hasStructure
        ? 'The explanation is reasonably structured and easy to follow.'
        : 'The response could be made clearer with a more explicit structure.',
    ].filter(Boolean);

    const weaknesses = [
      matchedKeywords.length < Math.max(1, Math.ceil(keywords.length / 2))
        ? 'The answer could cover more of the important concepts from the question.'
        : 'The answer would be stronger if it added a sharper example or trade-off discussion.',
      !hasConcreteExample
        ? 'A concrete example or scenario would make the response more convincing.'
        : 'The explanation would benefit from a bit more depth around trade-offs and implications.',
      !hasStructure
        ? 'The response would be easier to evaluate if it were organized into clear steps or points.'
        : 'The answer could be improved by linking the explanation more directly to the core requirement.',
    ].filter(Boolean);

    return {
      overallScore,
      scores: {
        technicalKnowledge,
        architecture,
        communication,
        problemSolving,
        codeQuality,
      },
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      missedConcepts: keywords.length > 0 ? keywords.filter((term: string) => !answer.toLowerCase().includes(term)).slice(0, 3) : ['A more complete explanation of the core concept'],
      idealAnswer: `A strong answer to "${input.questionText}" should explain the concept clearly, mention the key ideas from the expected answer, and include an example or trade-off discussion where relevant.`,
      improvedAnswer: `A stronger response would explain the core idea in more detail, connect it to the question context, and include a practical example.\n\nOriginal answer: ${answer || 'No answer provided.'}`,
      learningRecommendations: [
        'Practice explaining the concept in a structured way.',
        'Add one concrete example or trade-off to strengthen the answer.',
      ],
      followUpQuestions: [
        `Can you expand on your answer to ${input.questionText}?`,
        'How would you explain this to a beginner?',
      ],
    };
  }

  /**
   * Get evaluation for a question
   */
  async getEvaluation(questionId: string): Promise<EvaluationResult | null> {
    const evaluation = await this.prisma.interviewEvaluation.findUnique({
      where: { questionId },
    });

    if (!evaluation) {
      return null;
    }

    return this.mapEvaluationToResult(evaluation);
  }

  /**
   * Get evaluation for an interview
   */
  async getInterviewEvaluation(interviewId: string): Promise<EvaluationResult> {
    const evaluations = await this.prisma.interviewEvaluation.findMany({
      where: {
        question: {
          interviewId,
        },
      },
    });

    if (evaluations.length === 0) {
      throw new HttpException(
        'No evaluations found for this interview',
        HttpStatus.NOT_FOUND,
      );
    }

    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: {
          include: {
            answer: true,
          },
          orderBy: { questionNumber: 'asc' },
        },
      },
    });

    if (!interview) {
      throw new HttpException('Interview not found', HttpStatus.NOT_FOUND);
    }

    return this.buildEvaluationResult(evaluations, interview);
  }

  /**
   * Get evaluation history with pagination
   */
  async getEvaluationHistory(
    userId: string,
    page = 1,
    limit = 10,
    technology?: string,
    fromDate?: Date,
    toDate?: Date,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      question: {
        interview: {
          userId,
        },
      },
    };

    if (technology) {
      where.question.interview.technology = {
        name: technology,
      };
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = fromDate;
      }
      if (toDate) {
        where.createdAt.lte = toDate;
      }
    }

    const [evaluations, total] = await Promise.all([
      this.prisma.interviewEvaluation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          question: {
            include: {
              interview: {
                include: {
                  technology: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.interviewEvaluation.count({ where }),
    ]);

    return {
      data: evaluations.map((e: any) => this.mapEvaluationToResult(e)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Map database evaluation to result DTO
   */
  private mapEvaluationToResult(
    evaluation: any,
  ): EvaluationResult {
    return {
      evaluationId: evaluation.id,
      status:
        evaluation.evaluationStatus === 'COMPLETED'
          ? 'COMPLETED'
          : evaluation.evaluationStatus === 'FAILED'
            ? 'FAILED'
            : 'PROCESSING',
      overallScore: evaluation.overallScore,
      technicalScore: evaluation.technicalScore,
      architectureScore: evaluation.architectureScore,
      communicationScore: evaluation.communicationScore,
      problemSolvingScore: evaluation.problemSolvingScore,
      codeQualityScore: evaluation.codeQualityScore,
      strengths: evaluation.strengths ? evaluation.strengths.split('\n') : [],
      weaknesses: evaluation.weaknesses ? evaluation.weaknesses.split('\n') : [],
      idealAnswer: evaluation.correctAnswer,
      improvedAnswer: evaluation.improvedAnswer,
      learningRecommendations: evaluation.learningRecommendations
        ? evaluation.learningRecommendations.split('\n')
        : [],
      aiResponseJson: evaluation.aiResponseJson,
    };
  }

  /**
   * Build evaluation result from array of evaluations
   */
  private buildEvaluationResult(
    evaluations: any[],
    interview: any,
  ): EvaluationResult {
    const totalQuestions = Array.isArray(interview?.questions)
      ? interview.questions.length
      : evaluations.length;

    const completedEvaluations = evaluations.filter(
      (e: any) => e.evaluationStatus === EvaluationStatus.COMPLETED && e.overallScore !== null,
    );
    const failedEvaluations = evaluations.filter(
      (e: any) => e.evaluationStatus === EvaluationStatus.FAILED,
    );

    const overallScores = evaluations
      .map((e: any) => e.overallScore)
      .filter((s: number | null): s is number => s !== null);

    const technicalScores = evaluations
      .map((e: any) => e.technicalScore)
      .filter((s: number | null): s is number => s !== null);

    const architectureScores = evaluations
      .map((e: any) => e.architectureScore)
      .filter((s: number | null): s is number => s !== null);

    const communicationScores = evaluations
      .map((e: any) => e.communicationScore)
      .filter((s: number | null): s is number => s !== null);

    const problemSolvingScores = evaluations
      .map((e: any) => e.problemSolvingScore)
      .filter((s: number | null): s is number => s !== null);

    const codeQualityScores = evaluations
      .map((e: any) => e.codeQualityScore)
      .filter((s: number | null): s is number => s !== null);

    const avgScore =
      overallScores.length > 0
        ? overallScores.reduce((a: number, b: number) => a + b, 0) /
          overallScores.length
        : 0;

    const avgTechnical =
      technicalScores.length > 0
        ? technicalScores.reduce((a: number, b: number) => a + b, 0) /
          technicalScores.length
        : 0;

    const avgArchitecture =
      architectureScores.length > 0
        ? architectureScores.reduce((a: number, b: number) => a + b, 0) /
          architectureScores.length
        : 0;

    const avgCommunication =
      communicationScores.length > 0
        ? communicationScores.reduce((a: number, b: number) => a + b, 0) /
          communicationScores.length
        : 0;

    const avgProblemSolving =
      problemSolvingScores.length > 0
        ? problemSolvingScores.reduce((a: number, b: number) => a + b, 0) /
          problemSolvingScores.length
        : 0;

    const avgCodeQuality =
      codeQualityScores.length > 0
        ? codeQualityScores.reduce((a: number, b: number) => a + b, 0) /
          codeQualityScores.length
        : 0;

    const strengths = evaluations
      .flatMap((e: any) => (typeof e.strengths === 'string' ? e.strengths.split('\n') : []))
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .slice(0, 8);

    const weaknesses = evaluations
      .flatMap((e: any) => (typeof e.weaknesses === 'string' ? e.weaknesses.split('\n') : []))
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .slice(0, 8);

    const learningRecommendations = evaluations
      .flatMap((e: any) =>
        typeof e.learningRecommendations === 'string'
          ? e.learningRecommendations.split('\n')
          : [],
      )
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .slice(0, 8);

    const completedCount = completedEvaluations.length;
    const failedCount = failedEvaluations.length;

    const status: EvaluationResult['status'] =
      completedCount >= totalQuestions
        ? 'COMPLETED'
        : failedCount > 0 && completedCount === 0
          ? 'FAILED'
          : 'PROCESSING';

    const questionSummaries = (interview?.questions || [])
      .map((question: any) => {
        const evaluation = evaluations.find((entry: any) => entry.questionId === question.id);
        if (!evaluation) {
          return null;
        }

        return {
          questionId: question.id,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          questionType: question.questionType,
          answer: question.answer?.answerText || question.answer?.codeAnswer || '',
          evaluation: this.mapEvaluationToResult(evaluation),
        };
      })
      .filter(Boolean);

    return {
      evaluationId: `interview-${interview.id}`,
      status,
      overallScore: avgScore,
      technicalScore: avgTechnical,
      architectureScore: avgArchitecture,
      communicationScore: avgCommunication,
      problemSolvingScore: avgProblemSolving,
      codeQualityScore: avgCodeQuality,
      strengths,
      weaknesses,
      learningRecommendations,
      aiResponseJson: {
        evaluationCount: totalQuestions,
        completedCount,
        failedCount,
        completedAt: new Date(),
      },
      questions: questionSummaries as any,
    };
  }
}
