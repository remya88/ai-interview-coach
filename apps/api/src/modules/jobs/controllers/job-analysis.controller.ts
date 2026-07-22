import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JobAnalysisService } from '../services/job-analysis.service';
import { JobMatchRequestDto } from '../dto/job-analysis.dto';

@Controller('job-analysis')
@ApiTags('Job Analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobAnalysisController {
  constructor(private readonly jobAnalysisService: JobAnalysisService) {}

  /**
   * POST /api/job-analysis/match
   */
  @Post('match')
  @ApiOperation({ summary: 'Match a resume against a job description using AI' })
  @ApiResponse({ status: 201, description: 'Job match analysis result' })
  async matchJob(@Request() req: any, @Body() dto: JobMatchRequestDto) {
    return this.jobAnalysisService.matchResumeToJob(req.user.id, dto);
  }

  /**
   * GET /api/job-analysis
   */
  @Get()
  @ApiOperation({ summary: 'Get all job match results for the authenticated user' })
  async getResults(@Request() req: any) {
    return this.jobAnalysisService.getUserMatchResults(req.user.id);
  }

  /**
   * GET /api/job-analysis/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific job match result' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async getResult(@Request() req: any, @Param('id') id: string) {
    return this.jobAnalysisService.getMatchResult(id, req.user.id);
  }
}
