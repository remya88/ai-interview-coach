import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../app/prisma.service';
import { PerformanceSummary } from '../interfaces/analytics.interface';
import {
  AnalyticsDashboardDto,
  PerformanceTrendDto,
  SkillAnalyticsDto,
  TechnologyAnalyticsDto,
  InterviewHistoryItemDto,
  AnalyticsHistoryQueryDto,
} from '../dto/analytics.dto';
import { ANALYTICS_CONSTANTS, SKILL_MAPPING } from '../constants/analytics.constants';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard summary for user
   */
  async getDashboard(userId: string): Promise<AnalyticsDashboardDto> {
    try {
      const interviews = await this.prisma.interview.findMany({
        where: { userId },
        include: {
          questions: {
            select: {
              evaluation: {
                select: {
                  overallScore: true,
                  technicalScore: true,
                  architectureScore: true,
                  communicationScore: true,
                  problemSolvingScore: true,
                  codeQualityScore: true,
                },
              },
            },
          },
          technology: {
            select: { name: true },
          },
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      const completedInterviews = interviews.filter(
        (i: typeof interviews[0]) => i.status === 'COMPLETED',
      );

      // Calculate metrics
      const totalInterviews = interviews.length;
      const completedCount = completedInterviews.length;

      // Average score from all evaluations
      const allScores = completedInterviews
        .flatMap((i: typeof interviews[0]) => i.questions)
        .map((q: any) => q.evaluation?.overallScore)
        .filter((s: number | null | undefined): s is number => s !== null && s !== undefined);

      const averageScore =
        allScores.length > 0
          ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
          : 0;

      // Practice hours (estimate: 30 min per interview)
      const totalPracticeHours = Math.round(totalInterviews * 0.5);

      // Current streak (consecutive days with interview)
      const currentStreak = this.calculateStreak(interviews);

      // Skill analysis
      const skillScores = this.analyzeSkills(completedInterviews);
      const strongestSkills = Object.entries(skillScores)
        .sort((a: [string, any], b: [string, any]) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([skill, score]) => ({ skill, score: score as number }));

      const weakestSkills = Object.entries(skillScores)
        .sort((a: [string, any], b: [string, any]) => (a[1] as number) - (b[1] as number))
        .slice(0, 3)
        .map(([skill, score]) => ({ skill, score: score as number }));

      // Recent interviews
      const recentInterviews = completedInterviews
        .slice(0, 5)
        .map((i: typeof interviews[0]) => ({
          id: i.id,
          technology: i.technology?.name || 'Unknown',
          score: i.overallScore || 0,
          date: i.createdAt,
          difficulty: i.difficulty || 'Medium',
        }));

      return {
        totalInterviews,
        completedInterviews: completedCount,
        averageScore,
        totalPracticeHours,
        currentStreak,
        strongestSkills,
        weakestSkills,
        recentInterviews,
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard:', error);
      throw new HttpException(
        'Failed to fetch dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get performance trend over time
   */
  async getPerformanceTrend(
    userId: string,
    periodDays: number = ANALYTICS_CONSTANTS.PERIODS.MONTH,
  ): Promise<PerformanceTrendDto[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const interviews = await this.prisma.interview.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          questions: {
            select: {
              evaluation: { select: { overallScore: true } },
            },
          },
        },
      });

      // Group by date and calculate daily averages
      const dailyScores = new Map<string, number[]>();

      interviews.forEach((interview: typeof interviews[0]) => {
        const dateStr = interview.createdAt.toISOString().split('T')[0];
        const scores = interview.questions
          .map((q: any) => q.evaluation?.overallScore)
          .filter((s: number | null | undefined): s is number => s !== null && s !== undefined);

        if (scores.length > 0) {
          const dailyAvg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          if (!dailyScores.has(dateStr)) {
            dailyScores.set(dateStr, []);
          }
          dailyScores.get(dateStr)!.push(dailyAvg);
        }
      });

      // Convert to trend data
      const trend = Array.from(dailyScores.entries())
        .sort(([dateA]: [string, number[]], [dateB]: [string, number[]]) => dateA.localeCompare(dateB))
        .map(([date, scores]: [string, number[]]) => ({
          date: new Date(date),
          averageScore: Math.round(
            scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
          ),
          interviewCount: scores.length,
        }));

      return trend;
    } catch (error) {
      this.logger.error('Failed to get performance trend:', error);
      throw new HttpException(
        'Failed to fetch performance data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get skill analytics
   */
  async getSkillAnalytics(userId: string): Promise<SkillAnalyticsDto[]> {
    try {
      const interviews = await this.prisma.interview.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        include: {
          questions: {
            select: {
              evaluation: {
                select: {
                  technicalScore: true,
                  architectureScore: true,
                  communicationScore: true,
                  problemSolvingScore: true,
                  codeQualityScore: true,
                  createdAt: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const skillData: { [key: string]: number[] } = {
        technicalKnowledge: [],
        architecture: [],
        communication: [],
        problemSolving: [],
        codeQuality: [],
      };

      interviews.forEach((interview: typeof interviews[0]) => {
        interview.questions.forEach((q: any) => {
          const eval_ = q.evaluation;
          if (eval_) {
            if (eval_.technicalScore)
              skillData.technicalKnowledge.push(eval_.technicalScore);
            if (eval_.architectureScore)
              skillData.architecture.push(eval_.architectureScore);
            if (eval_.communicationScore)
              skillData.communication.push(eval_.communicationScore);
            if (eval_.problemSolvingScore)
              skillData.problemSolving.push(eval_.problemSolvingScore);
            if (eval_.codeQualityScore)
              skillData.codeQuality.push(eval_.codeQualityScore);
          }
        });
      });

      // Calculate analytics for each skill
      const analytics: SkillAnalyticsDto[] = Object.entries(skillData).map(
        ([skill, scores]: [string, number[]]) => {
          const sorted = scores.sort((a: number, b: number) => a - b);
          const current = sorted[sorted.length - 1] || 0;
          const baseline = sorted[0] || 0;
          const improvement = current - baseline;

          return {
            skillName: SKILL_MAPPING[skill as keyof typeof SKILL_MAPPING],
            currentScore: current,
            improvement,
            attempts: scores.length,
            category:
              current >= ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.EXCELLENT
                ? 'strong'
                : current >= ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.GOOD
                  ? 'improving'
                  : 'weak',
          };
        },
      );

      return analytics.sort((a, b) => b.currentScore - a.currentScore);
    } catch (error) {
      this.logger.error('Failed to get skill analytics:', error);
      throw new HttpException(
        'Failed to fetch skill analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get technology performance analytics
   */
  async getTechnologyAnalytics(userId: string): Promise<TechnologyAnalyticsDto[]> {
    try {
      const interviews = await this.prisma.interview.findMany({
        where: { userId, status: 'COMPLETED' },
        include: {
          technology: { select: { name: true } },
          questions: {
            select: {
              id: true,
              evaluation: { select: { overallScore: true } },
            },
          },
        },
      });

      // Group by technology
      const techMap = new Map<string, number[]>();

      interviews.forEach((interview: typeof interviews[0]) => {
        const techName = interview.technology?.name || 'Unknown';
        const scores = interview.questions
          .map((q: any) => q.evaluation?.overallScore)
          .filter((s: number | null | undefined): s is number => s !== null && s !== undefined);

        if (!techMap.has(techName)) {
          techMap.set(techName, []);
        }
        techMap.get(techName)!.push(...scores);
      });

      // Calculate analytics
      const analytics: TechnologyAnalyticsDto[] = Array.from(techMap.entries()).map(
        ([tech, scores]: [string, number[]]) => {
          const sorted = scores.sort((a: number, b: number) => a - b);
          const avg = Math.round(
            scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
          );
          const best = sorted[sorted.length - 1];
          const worst = sorted[0];

          // Calculate improvement trend
          const recent = scores.slice(-5);
          const older = scores.slice(-10, -5);
          const recentAvg =
            recent.length > 0
              ? recent.reduce((a: number, b: number) => a + b, 0) / recent.length
              : 0;
          const olderAvg =
            older.length > 0
              ? older.reduce((a: number, b: number) => a + b, 0) / older.length
              : 0;
          const trend =
            olderAvg > 0
              ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
              : 0;

          return {
            technology: tech,
            interviews: scores.length,
            averageScore: avg,
            bestScore: best,
            worstScore: worst,
            improvementTrend: trend,
          };
        },
      );

      return analytics.sort((a: TechnologyAnalyticsDto, b: TechnologyAnalyticsDto) => b.averageScore - a.averageScore);
    } catch (error) {
      this.logger.error('Failed to get technology analytics:', error);
      throw new HttpException(
        'Failed to fetch technology analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get interview history with pagination and filtering
   */
  async getInterviewHistory(
    userId: string,
    query: AnalyticsHistoryQueryDto,
  ): Promise<{
    data: InterviewHistoryItemDto[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const page = query.page || 1;
      const limit = Math.min(query.limit || 10, ANALYTICS_CONSTANTS.MAX_LIMIT);
      const skip = (page - 1) * limit;

      const where: any = { userId };

      if (query.technology) {
        where.technology = { name: { contains: query.technology, mode: 'insensitive' } };
      }

      if (query.difficulty) {
        where.difficulty = query.difficulty;
      }

      if (query.fromDate || query.toDate) {
        where.createdAt = {};
        if (query.fromDate) {
          where.createdAt.gte = new Date(query.fromDate);
        }
        if (query.toDate) {
          where.createdAt.lte = new Date(query.toDate);
        }
      }

      const [interviews, total] = await Promise.all([
        this.prisma.interview.findMany({
          where,
          include: {
            technology: { select: { name: true } },
            category: { select: { name: true } },
            questions: {
              select: {
                id: true,
                evaluation: { select: { overallScore: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.interview.count({ where }),
      ]);

      const data = interviews.map((i: typeof interviews[0]) => {
        const scores = i.questions
          .map((q: any) => q.evaluation?.overallScore)
          .filter((s: number | null | undefined): s is number => s !== null && s !== undefined);
        const avgScore =
          scores.length > 0
            ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
            : 0;

        return {
          id: i.id,
          technology: i.technology?.name || 'Unknown',
          score: avgScore,
          date: i.createdAt,
          difficulty: i.difficulty || 'Medium',
          type: i.interviewType || 'Standard',
          questionsCount: i.questions.length,
        };
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get interview history:', error);
      throw new HttpException(
        'Failed to fetch interview history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary(userId: string): Promise<PerformanceSummary> {
    try {
      const trend = await this.getPerformanceTrend(userId, 30);

      if (trend.length < 2) {
        return {
          overallTrend: 'stable',
          trendPercentage: 0,
          nextLevelThreshold: ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.GOOD,
          estimatedDaysToNextLevel: 0,
        };
      }

      const recent = trend.slice(-7);
      const older = trend.slice(-14, -7);

      const recentAvg =
        recent.reduce((sum, t) => sum + t.averageScore, 0) / recent.length;
      const olderAvg =
        older.length > 0
          ? older.reduce((sum, t) => sum + t.averageScore, 0) / older.length
          : recentAvg;

      const trendPercentage = olderAvg > 0 
        ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
        : 0;

      const overallTrend: 'improving' | 'stable' | 'declining' =
        trendPercentage > 2
          ? 'improving'
          : trendPercentage < -2
            ? 'declining'
            : 'stable';

      let nextLevelThreshold =
        ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.EXCELLENT;
      if (recentAvg < ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.GOOD) {
        nextLevelThreshold = ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.GOOD;
      } else if (recentAvg < ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.EXCELLENT) {
        nextLevelThreshold = ANALYTICS_CONSTANTS.SCORE_THRESHOLDS.EXCELLENT;
      }

      const pointsNeeded = Math.max(0, nextLevelThreshold - recentAvg);
      const improvementRate = 
        trendPercentage > 0 ? trendPercentage / 100 : 0.5; // 0.5% per day default
      const estimatedDays =
        improvementRate > 0
          ? Math.ceil(pointsNeeded / improvementRate)
          : 365;

      return {
        overallTrend,
        trendPercentage,
        nextLevelThreshold,
        estimatedDaysToNextLevel: Math.min(estimatedDays, 365),
      };
    } catch (error) {
      this.logger.error('Failed to get performance summary:', error);
      throw new HttpException(
        'Failed to fetch performance summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Private helper: Calculate current streak
   */
  private calculateStreak(interviews: any[]): number {
    const completedInterviews = interviews
      .filter((i) => i.status === 'COMPLETED')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    if (completedInterviews.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastDate = new Date(completedInterviews[0].createdAt);
    lastDate.setHours(0, 0, 0, 0);

    // Check if last interview was today or yesterday
    const daysDiff = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff > 1) {
      return 0;
    }

    for (let i = 1; i < completedInterviews.length; i++) {
      const currentDate = new Date(completedInterviews[i].createdAt);
      currentDate.setHours(0, 0, 0, 0);

      const diff = Math.floor(
        (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diff === 1) {
        streak++;
        lastDate = currentDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Private helper: Analyze skills from interviews
   */
  private analyzeSkills(interviews: any[]): Record<string, number> {
    const skillScores: Record<string, number[]> = {
      technicalKnowledge: [],
      architecture: [],
      communication: [],
      problemSolving: [],
      codeQuality: [],
    };

    interviews.forEach((interview) => {
      interview.questions.forEach((q: any) => {
        const eval_ = q.evaluation;
        if (!eval_) return;
        if (eval_.technicalScore)
          skillScores.technicalKnowledge.push(eval_.technicalScore);
        if (eval_.architectureScore)
          skillScores.architecture.push(eval_.architectureScore);
        if (eval_.communicationScore)
          skillScores.communication.push(eval_.communicationScore);
        if (eval_.problemSolvingScore)
          skillScores.problemSolving.push(eval_.problemSolvingScore);
        if (eval_.codeQualityScore)
          skillScores.codeQuality.push(eval_.codeQualityScore);
      });
    });

    const result: Record<string, number> = {};
    for (const [skill, scores] of Object.entries(skillScores)) {
      if (scores.length > 0) {
        result[SKILL_MAPPING[skill as keyof typeof SKILL_MAPPING]] =
          Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }

    return result;
  }
}
