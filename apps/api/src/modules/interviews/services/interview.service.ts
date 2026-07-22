import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewStatus, QuestionType, DifficultyLevel } from '@prisma/client';
import { PrismaService } from '../../../app/prisma.service';
import { CreateInterviewDto } from '../dto/create-interview.dto';
import { InterviewFilterDto } from '../dto/interview-filter.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';

@Injectable()
export class InterviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getTechnologies() {
    return this.prisma.technology.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
      },
    });
  }

  async getCategories() {
    return this.prisma.interviewCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  // ─── Create ──────────────────────────────────────────────────────────────

  async createInterview(userId: string, dto: CreateInterviewDto) {
    const [technology, category] = await Promise.all([
      this.prisma.technology.findUnique({ where: { id: dto.technologyId } }),
      this.prisma.interviewCategory.findUnique({ where: { id: dto.categoryId } }),
    ]);

    if (!technology) throw new NotFoundException('Technology not found');
    if (!category) throw new NotFoundException('Category not found');

    const interview = await this.prisma.interview.create({
      data: {
        userId,
        technologyId: dto.technologyId,
        categoryId: dto.categoryId,
        difficulty: dto.difficulty,
        interviewType: dto.interviewType,
        questionCount: dto.questionCount,
        status: InterviewStatus.CREATED,
        aiModel: 'gpt-4o',
        promptVersion: '1.0',
      },
      select: {
        id: true,
        status: true,
        difficulty: true,
        interviewType: true,
        questionCount: true,
        createdAt: true,
        technology: { select: { id: true, name: true, slug: true, color: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return interview;
  }

  // ─── Read one ─────────────────────────────────────────────────────────────

  async getInterview(userId: string, interviewId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, deletedAt: null },
      include: {
        technology: { select: { id: true, name: true, slug: true, color: true } },
        category: { select: { id: true, name: true, slug: true } },
        questions: {
          orderBy: { questionNumber: 'asc' },
          include: {
            answer: true,
            evaluation: {
              select: {
                overallScore: true,
                technicalScore: true,
                communicationScore: true,
                evaluationStatus: true,
              },
            },
          },
        },
        session: true,
      },
    });

    if (!interview) throw new NotFoundException('Interview not found');
    this.assertOwner(interview.userId, userId);

    return interview;
  }

  // ─── Start ────────────────────────────────────────────────────────────────

  async startInterview(userId: string, interviewId: string) {
    const interview = await this.findOwnedInterview(userId, interviewId);

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new BadRequestException('Interview is already completed');
    }
    if (interview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException('Interview is cancelled');
    }

    // Prevent duplicate active sessions
    const existing = await this.prisma.interviewSession.findUnique({
      where: { interviewId },
    });
    if (existing && !existing.completed) {
      throw new ConflictException('An active session already exists – use resume instead');
    }

    // Generate placeholder questions if not yet created
    if (interview.questionCount > 0 && interview.questions.length === 0) {
      await this.generateInitialQuestions(
        interviewId,
        interview.questionCount,
        interview.difficulty,
        interview.technology?.name,
        interview.category?.name,
      );
    }

    const [updatedInterview, session] = await this.prisma.$transaction([
      this.prisma.interview.update({
        where: { id: interviewId },
        data: { status: InterviewStatus.IN_PROGRESS, startedAt: new Date() },
      }),
      this.prisma.interviewSession.create({
        data: { interviewId, currentQuestion: 1, startedAt: new Date() },
      }),
    ]);

    return {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      interviewId: updatedInterview.id,
      status: updatedInterview.status,
      startedAt: updatedInterview.startedAt,
    };
  }

  // ─── Current question ─────────────────────────────────────────────────────

  async getCurrentQuestion(userId: string, interviewId: string) {
    const interview = await this.findOwnedInterview(userId, interviewId);

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Interview is not in progress');
    }

    const session = await this.prisma.interviewSession.findUnique({
      where: { interviewId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const question = await this.prisma.interviewQuestion.findFirst({
      where: { interviewId, questionNumber: session.currentQuestion },
      include: { answer: true },
    });
    if (!question) throw new NotFoundException('Question not found');

    const resolvedQuestion = await this.ensureQuestionTextResolved(question, interview);

    // Update last-activity timestamp
    await this.prisma.interviewSession.update({
      where: { interviewId },
      data: { lastActivity: new Date() },
    });

    return {
      question: resolvedQuestion,
      currentNumber: session.currentQuestion,
      totalQuestions: interview.questionCount,
    };
  }

  async navigateQuestion(
    userId: string,
    interviewId: string,
    questionNumber: number,
  ) {
    const interview = await this.findOwnedInterview(userId, interviewId);

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Interview is not in progress');
    }

    if (questionNumber < 1 || questionNumber > interview.questionCount) {
      throw new BadRequestException('Invalid question number');
    }

    const session = await this.prisma.interviewSession.findUnique({
      where: { interviewId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const question = await this.prisma.interviewQuestion.findFirst({
      where: { interviewId, questionNumber },
      include: { answer: true },
    });
    if (!question) throw new NotFoundException('Question not found');

    const resolvedQuestion = await this.ensureQuestionTextResolved(question, interview);

    await this.prisma.interviewSession.update({
      where: { interviewId },
      data: {
        currentQuestion: questionNumber,
        lastActivity: new Date(),
      },
    });

    return {
      question: resolvedQuestion,
      currentNumber: questionNumber,
      totalQuestions: interview.questionCount,
    };
  }

  // ─── Submit answer ────────────────────────────────────────────────────────

  async submitAnswer(
    userId: string,
    interviewId: string,
    questionId: string,
    dto: SubmitAnswerDto,
  ) {
    const interview = await this.findOwnedInterview(userId, interviewId);

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Interview is not in progress');
    }

    const question = await this.prisma.interviewQuestion.findFirst({
      where: { id: questionId, interviewId },
    });
    if (!question) throw new NotFoundException('Question not found');

    const answerText = dto.answerText ?? '';
    const codeAnswer = dto.codeAnswer ?? '';
    const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
    const charCount = answerText.length + codeAnswer.length;

    const answer = await this.prisma.interviewAnswer.upsert({
      where: { questionId },
      update: {
        answerText: dto.answerText,
        codeAnswer: dto.codeAnswer,
        timeTakenSeconds: dto.timeTakenSeconds,
        submittedAt: new Date(),
        wordCount,
        characterCount: charCount,
      },
      create: {
        questionId,
        answerText: dto.answerText,
        codeAnswer: dto.codeAnswer,
        timeTakenSeconds: dto.timeTakenSeconds,
        submittedAt: new Date(),
        wordCount,
        characterCount: charCount,
      },
    });

    // Advance session to next question
    const session = await this.prisma.interviewSession.findUnique({
      where: { interviewId },
    });
    if (session && session.currentQuestion < interview.questionCount) {
      await this.prisma.interviewSession.update({
        where: { interviewId },
        data: {
          currentQuestion: session.currentQuestion + 1,
          lastActivity: new Date(),
        },
      });
    }

    return answer;
  }

  // ─── Complete ─────────────────────────────────────────────────────────────

  async completeInterview(userId: string, interviewId: string) {
    const interview = await this.findOwnedInterview(userId, interviewId);

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new BadRequestException('Interview is already completed');
    }
    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Interview must be in progress to complete');
    }

    const completedAt = new Date();
    const durationMinutes = interview.startedAt
      ? Math.round((completedAt.getTime() - interview.startedAt.getTime()) / 60000)
      : null;

    const [updated] = await this.prisma.$transaction([
      this.prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: InterviewStatus.COMPLETED,
          completedAt,
          durationMinutes,
        },
      }),
      this.prisma.interviewSession.update({
        where: { interviewId },
        data: { completed: true },
      }),
    ]);

    return {
      id: updated.id,
      status: updated.status,
      completedAt: updated.completedAt,
      durationMinutes: updated.durationMinutes,
    };
  }

  // ─── Resume ───────────────────────────────────────────────────────────────

  async resumeInterview(userId: string, interviewId: string) {
    const interview = await this.findOwnedInterview(userId, interviewId);

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress interviews can be resumed');
    }

    const session = await this.prisma.interviewSession.findUnique({
      where: { interviewId },
    });
    if (!session || session.completed) {
      throw new NotFoundException('No active session found for this interview');
    }

    await this.prisma.interviewSession.update({
      where: { interviewId },
      data: { lastActivity: new Date() },
    });

    const currentQuestion = await this.prisma.interviewQuestion.findFirst({
      where: { interviewId, questionNumber: session.currentQuestion },
    });

    return {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      currentQuestion: session.currentQuestion,
      totalQuestions: interview.questionCount,
      question: currentQuestion,
    };
  }

  // ─── Soft delete ──────────────────────────────────────────────────────────

  async deleteInterview(userId: string, interviewId: string) {
    const interview = await this.findOwnedInterview(userId, interviewId);

    if (interview.status === InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete an in-progress interview – complete or cancel it first');
    }

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Interview deleted' };
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async getHistory(userId: string, filter: InterviewFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      deletedAt: null,
      ...(filter.technologyId && { technologyId: filter.technologyId }),
      ...(filter.difficulty && { difficulty: filter.difficulty }),
      ...(filter.status && { status: filter.status }),
      ...(filter.dateFrom || filter.dateTo
        ? {
            createdAt: {
              ...(filter.dateFrom && { gte: new Date(filter.dateFrom) }),
              ...(filter.dateTo && { lte: new Date(filter.dateTo) }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          difficulty: true,
          interviewType: true,
          questionCount: true,
          overallScore: true,
          durationMinutes: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          technology: { select: { id: true, name: true, slug: true, color: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.interview.count({ where }),
    ]);

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const [
      totalInterviews,
      completedInterviews,
      inProgressInterviews,
      recentInterviews,
      scoreAgg,
      skillScores,
    ] = await Promise.all([
      this.prisma.interview.count({ where: { userId, deletedAt: null } }),
      this.prisma.interview.count({
        where: { userId, status: InterviewStatus.COMPLETED, deletedAt: null },
      }),
      this.prisma.interview.count({
        where: { userId, status: InterviewStatus.IN_PROGRESS, deletedAt: null },
      }),
      this.prisma.interview.findMany({
        where: { userId, deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          difficulty: true,
          overallScore: true,
          createdAt: true,
          technology: { select: { name: true, color: true } },
          category: { select: { name: true } },
        },
      }),
      this.prisma.interview.aggregate({
        where: { userId, status: InterviewStatus.COMPLETED, overallScore: { not: null }, deletedAt: null },
        _avg: { overallScore: true },
        _sum: { durationMinutes: true },
      }),
      this.prisma.skillScore.findMany({
        where: { userId },
        orderBy: { currentScore: 'desc' },
        take: 10,
        include: { skill: { select: { name: true, technology: { select: { name: true } } } } },
      }),
    ]);

    const avgScore = scoreAgg._avg.overallScore
      ? Math.round(scoreAgg._avg.overallScore * 10) / 10
      : null;
    const hoursPracticed = scoreAgg._sum.durationMinutes
      ? Math.round((scoreAgg._sum.durationMinutes / 60) * 10) / 10
      : 0;

    return {
      totalInterviews,
      completedInterviews,
      inProgressInterviews,
      averageScore: avgScore,
      hoursPracticed,
      recentInterviews,
      topSkills: skillScores.slice(0, 3),
      weakestSkills: [...skillScores].reverse().slice(0, 3),
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async findOwnedInterview(userId: string, interviewId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: interviewId, deletedAt: null },
      include: {
        questions: true,
        technology: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    if (!interview) throw new NotFoundException('Interview not found');
    this.assertOwner(interview.userId, userId);
    return interview;
  }

  private assertOwner(ownerId: string, requesterId: string) {
    if (ownerId !== requesterId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async generateInitialQuestions(
    interviewId: string,
    count: number,
    difficulty: DifficultyLevel,
    technology?: string,
    category?: string,
  ) {
    const questionTypes: QuestionType[] = [
      QuestionType.THEORY,
      QuestionType.SCENARIO,
      QuestionType.CODING,
      QuestionType.BEHAVIORAL,
      QuestionType.ARCHITECTURE,
      QuestionType.DEBUGGING,
    ];

    const questions = Array.from({ length: count }, (_, i) => ({
      interviewId,
      questionNumber: i + 1,
      questionText: this.buildQuestionText(
        i + 1,
        questionTypes[i % questionTypes.length],
        difficulty,
        technology,
        category,
      ),
      questionType: questionTypes[i % questionTypes.length],
      difficulty,
      generatedByAI: true,
      promptVersion: '1.0',
    }));

    await this.prisma.interviewQuestion.createMany({ data: questions });
  }

  private buildQuestionText(
    questionNumber: number,
    questionType: QuestionType,
    difficulty: DifficultyLevel,
    technology?: string,
    category?: string,
  ): string {
    const tech = technology || 'your chosen technology';
    const domain = category || 'technical interviews';
    const level = difficulty.toLowerCase().replace('_', ' ');

    switch (questionType) {
      case QuestionType.THEORY:
        return `Question ${questionNumber}: Explain a core ${tech} concept that is critical for ${domain}. Describe when to use it, common mistakes, and a real-world example.`;
      case QuestionType.SCENARIO:
        return `Question ${questionNumber}: You are building a ${tech} feature for a ${domain} application and performance has degraded. Walk through how you would diagnose the issue, prioritize fixes, and validate improvements.`;
      case QuestionType.CODING:
        return `Question ${questionNumber}: Write a ${level}-level ${tech} solution for ${domain}. Explain your approach first, then provide code/pseudocode, and discuss time and space complexity.`;
      case QuestionType.BEHAVIORAL:
        return `Question ${questionNumber}: Describe a situation where you had to make a difficult technical trade-off in a ${tech} project. What options did you consider, what did you choose, and what was the outcome?`;
      case QuestionType.ARCHITECTURE:
        return `Question ${questionNumber}: Design a scalable ${tech}-based component for ${domain}. Cover data flow, error handling, scalability concerns, and monitoring strategy.`;
      case QuestionType.DEBUGGING:
        return `Question ${questionNumber}: A ${tech} module in ${domain} fails intermittently in production. Describe a step-by-step debugging plan, including logs/metrics you would inspect and how you would isolate root cause.`;
      default:
        return `Question ${questionNumber}: Explain how you would solve a ${level} ${tech} problem in the context of ${domain}.`;
    }
  }

  private async ensureQuestionTextResolved(
    question: {
      id: string;
      questionNumber: number;
      questionText: string;
      questionType: QuestionType;
      difficulty: DifficultyLevel;
      generatedByAI: boolean;
    },
    interview: {
      technology?: { name: string } | null;
      category?: { name: string } | null;
    },
  ) {
    if (!question.questionText.includes('will be generated by AI when the session begins')) {
      return question;
    }

    const repairedText = this.buildQuestionText(
      question.questionNumber,
      question.questionType,
      question.difficulty,
      interview.technology?.name,
      interview.category?.name,
    );

    return this.prisma.interviewQuestion.update({
      where: { id: question.id },
      data: {
        questionText: repairedText,
        generatedByAI: true,
      },
    });
  }
}
