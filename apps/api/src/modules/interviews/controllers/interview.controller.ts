import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateInterviewDto } from '../dto/create-interview.dto';
import { InterviewFilterDto } from '../dto/interview-filter.dto';
import { NavigateQuestionDto } from '../dto/navigate-question.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { InterviewService } from '../services/interview.service';

@ApiTags('interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  // ── Dashboard summary ─────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Get personalised dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  getDashboard(@CurrentUser() user: { id: string }) {
    return this.interviewService.getDashboard(user.id);
  }

  // ── History ───────────────────────────────────────────────────────────────

  @Get('history')
  @ApiOperation({ summary: 'Paginated interview history with filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of interviews' })
  getHistory(
    @CurrentUser() user: { id: string },
    @Query() filter: InterviewFilterDto,
  ) {
    return this.interviewService.getHistory(user.id, filter);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new interview' })
  @ApiResponse({ status: 201, description: 'Interview created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Technology or category not found' })
  createInterview(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateInterviewDto,
  ) {
    return this.interviewService.createInterview(user.id, dto);
  }

  // ── Get one ───────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get interview details including questions and answers' })
  @ApiResponse({ status: 200, description: 'Interview details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  getInterview(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewService.getInterview(user.id, id);
  }

  // ── Start ─────────────────────────────────────────────────────────────────

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start an interview and create an active session' })
  @ApiResponse({ status: 200, description: 'Session started' })
  @ApiResponse({ status: 400, description: 'Invalid interview state' })
  @ApiResponse({ status: 409, description: 'Active session already exists' })
  startInterview(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewService.startInterview(user.id, id);
  }

  // ── Current question ──────────────────────────────────────────────────────

  @Get(':id/current-question')
  @ApiOperation({ summary: 'Get the current question for an in-progress interview' })
  @ApiResponse({ status: 200, description: 'Current question' })
  @ApiResponse({ status: 400, description: 'Interview not in progress' })
  getCurrentQuestion(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewService.getCurrentQuestion(user.id, id);
  }

  @Post(':id/navigate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Navigate to a specific question in the active interview session' })
  @ApiResponse({ status: 200, description: 'Question loaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid question number or interview state' })
  navigateQuestion(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: NavigateQuestionDto,
  ) {
    return this.interviewService.navigateQuestion(user.id, id, dto.questionNumber);
  }

  // ── Submit answer ─────────────────────────────────────────────────────────

  @Post(':id/questions/:questionId/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit an answer for a question' })
  @ApiResponse({ status: 200, description: 'Answer saved' })
  @ApiResponse({ status: 400, description: 'Interview not in progress' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  submitAnswer(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.interviewService.submitAnswer(user.id, id, questionId, dto);
  }

  // ── Complete ──────────────────────────────────────────────────────────────

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an interview as completed' })
  @ApiResponse({ status: 200, description: 'Interview completed' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  completeInterview(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewService.completeInterview(user.id, id);
  }

  // ── Resume ────────────────────────────────────────────────────────────────

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume an in-progress interview session' })
  @ApiResponse({ status: 200, description: 'Session resumed' })
  @ApiResponse({ status: 400, description: 'Interview is not in progress' })
  @ApiResponse({ status: 404, description: 'No active session found' })
  resumeInterview(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewService.resumeInterview(user.id, id);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an interview' })
  @ApiResponse({ status: 200, description: 'Interview deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete in-progress interview' })
  deleteInterview(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewService.deleteInterview(user.id, id);
  }
}
