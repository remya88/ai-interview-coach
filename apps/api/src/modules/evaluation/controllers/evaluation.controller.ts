import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EvaluationService } from '../services/evaluation.service';
import {
  EvaluationResultDto,
  EvaluationHistoryQueryDto,
} from '../dto/evaluation.dto';

@ApiTags('Evaluation')
@Controller('evaluation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  /**
   * Start evaluation of an interview
   */
  @Post('interview/:id')
  @ApiOperation({
    summary: 'Start evaluation of an interview',
    description: 'Initiates AI evaluation of all questions in a completed interview',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation started successfully',
    type: EvaluationResultDto,
  })
  async startEvaluation(
    @Param('id') interviewId: string,
    @Request() req: any,
  ): Promise<any> {
    try {
      const result =
        await this.evaluationService.evaluateInterview(interviewId);
      return {
        evaluationId: result.evaluationId,
        status: result.status,
        overallScore: result.overallScore,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to start evaluation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get evaluation result for an interview
   */
  @Get('interview/:id')
  @ApiOperation({
    summary: 'Get evaluation result for an interview',
    description: 'Returns the AI evaluation feedback for a completed interview',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation result',
    type: EvaluationResultDto,
  })
  async getEvaluation(
    @Param('id') interviewId: string,
    @Request() req: any,
  ): Promise<any> {
    try {
      const result =
        await this.evaluationService.getInterviewEvaluation(interviewId);
      return {
        evaluationId: result.evaluationId,
        status: result.status,
        overallScore: result.overallScore,
        scores: {
          technical: result.technicalScore,
          architecture: result.architectureScore,
          communication: result.communicationScore,
          problemSolving: result.problemSolvingScore,
          codeQuality: result.codeQualityScore,
        },
        totalQuestions: (result.aiResponseJson as any)?.evaluationCount ?? 0,
        questionsEvaluated: (result.aiResponseJson as any)?.completedCount ?? 0,
        questionsFailed: (result.aiResponseJson as any)?.failedCount ?? 0,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        idealAnswer: result.idealAnswer,
        improvedAnswer: result.improvedAnswer,
        learningRecommendations: result.learningRecommendations,
        questions: (result.questions || []).map((question: any) => ({
          questionId: question.questionId,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          questionType: question.questionType,
          candidateAnswer: question.answer,
          evaluation: {
            evaluationId: question.evaluation?.evaluationId,
            status: question.evaluation?.status,
            overallScore: question.evaluation?.overallScore,
            scores: question.evaluation?.scores,
            strengths: question.evaluation?.strengths || [],
            weaknesses: question.evaluation?.weaknesses || [],
            learningRecommendations: question.evaluation?.learningRecommendations || [],
            idealAnswer: question.evaluation?.idealAnswer,
            improvedAnswer: question.evaluation?.improvedAnswer,
          },
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get evaluation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get evaluation history with pagination
   */
  @Get('history')
  @ApiOperation({
    summary: 'Get evaluation history',
    description: 'Returns paginated evaluation history for the current user',
  })
  async getHistory(
    @Query() query: EvaluationHistoryQueryDto,
    @Request() req: any,
  ): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;

      const result = await this.evaluationService.getEvaluationHistory(
        req.user.id,
        page,
        limit,
        query.technology,
        query.fromDate,
        query.toDate,
      );

      return {
        data: result.data.map((e: any) => ({
          evaluationId: e.evaluationId,
          status: e.status,
          overallScore: e.overallScore,
          strengths: e.strengths,
          weaknesses: e.weaknesses,
        })),
        pagination: result.pagination,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get evaluation for a specific question
   */
  @Get('question/:questionId')
  @ApiOperation({
    summary: 'Get evaluation for a specific question',
    description: 'Returns AI evaluation feedback for a single question',
  })
  async getQuestionEvaluation(
    @Param('questionId') questionId: string,
    @Request() req: any,
  ): Promise<any> {
    try {
      const result =
        await this.evaluationService.getEvaluation(questionId);

      if (!result) {
        throw new HttpException(
          'Evaluation not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        evaluationId: result.evaluationId,
        status: result.status,
        overallScore: result.overallScore,
        scores: {
          technical: result.technicalScore,
          architecture: result.architectureScore,
          communication: result.communicationScore,
          problemSolving: result.problemSolvingScore,
          codeQuality: result.codeQualityScore,
        },
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        idealAnswer: result.idealAnswer,
        improvedAnswer: result.improvedAnswer,
        learningRecommendations: result.learningRecommendations,
        followUpQuestions: result.aiResponseJson?.followUpQuestions || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get question evaluation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
