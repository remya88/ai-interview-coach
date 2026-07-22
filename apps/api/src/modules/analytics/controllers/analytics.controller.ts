import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AnalyticsService } from '../services/analytics.service';
import {
  AnalyticsDashboardDto,
  PerformanceTrendDto,
  SkillAnalyticsDto,
  TechnologyAnalyticsDto,
  AnalyticsHistoryQueryDto,
} from '../dto/analytics.dto';

@Controller('analytics')
@ApiTags('Analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get dashboard summary
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard summary',
    description:
      'Returns user dashboard data including statistics and recent interviews',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary',
    type: AnalyticsDashboardDto,
  })
  async getDashboard(@Request() req: any): Promise<AnalyticsDashboardDto> {
    try {
      const userId = req.user.id;
      return await this.analyticsService.getDashboard(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get performance trend
   */
  @Get('performance')
  @ApiOperation({
    summary: 'Get performance trend',
    description: 'Returns score trends over time (last 7 days, 30 days, or 6 months)',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance trend data',
    type: [PerformanceTrendDto],
  })
  async getPerformance(
    @Request() req: any,
    @Query('days') days = '30',
  ): Promise<PerformanceTrendDto[]> {
    try {
      const userId = req.user.id;
      const periodDays = Math.min(parseInt(days) || 30, 365);
      return await this.analyticsService.getPerformanceTrend(
        userId,
        periodDays,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get performance data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get skill analytics
   */
  @Get('skills')
  @ApiOperation({
    summary: 'Get skill analytics',
    description:
      'Returns skill analysis with scores, improvements, and categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill analytics',
    type: [SkillAnalyticsDto],
  })
  async getSkills(@Request() req: any): Promise<SkillAnalyticsDto[]> {
    try {
      const userId = req.user.id;
      return await this.analyticsService.getSkillAnalytics(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get skill analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get technology performance
   */
  @Get('technology')
  @ApiOperation({
    summary: 'Get technology performance',
    description:
      'Returns performance analytics by technology with scores and trends',
  })
  @ApiResponse({
    status: 200,
    description: 'Technology analytics',
    type: [TechnologyAnalyticsDto],
  })
  async getTechnology(@Request() req: any): Promise<TechnologyAnalyticsDto[]> {
    try {
      const userId = req.user.id;
      return await this.analyticsService.getTechnologyAnalytics(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get technology analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get interview history with pagination and filtering
   */
  @Get('history')
  @ApiOperation({
    summary: 'Get interview history',
    description:
      'Returns paginated interview history with filtering by technology, difficulty, and date range',
  })
  async getHistory(
    @Request() req: any,
    @Query() query: AnalyticsHistoryQueryDto,
  ): Promise<any> {
    try {
      const userId = req.user.id;
      return await this.analyticsService.getInterviewHistory(userId, query);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get interview history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get performance summary
   */
  @Get('summary')
  @ApiOperation({
    summary: 'Get performance summary',
    description:
      'Returns performance summary with trends and next level estimate',
  })
  async getSummary(@Request() req: any): Promise<any> {
    try {
      const userId = req.user.id;
      const summary = await this.analyticsService.getPerformanceSummary(userId);
      return {
        data: summary,
        timestamp: new Date(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get performance summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
