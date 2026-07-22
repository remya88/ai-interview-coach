import { IsOptional, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class AnalyticsDashboardDto {
  totalInterviews!: number;
  completedInterviews!: number;
  averageScore!: number;
  totalPracticeHours!: number;
  currentStreak!: number;
  strongestSkills!: Array<{ skill: string; score: number }>;
  weakestSkills!: Array<{ skill: string; score: number }>;
  recentInterviews!: Array<{
    id: string;
    technology: string;
    score: number;
    date: Date;
    difficulty: string;
  }>;
}

export class PerformanceTrendDto {
  date!: Date;
  averageScore!: number;
  interviewCount!: number;
}

export class SkillAnalyticsDto {
  skillName!: string;
  currentScore!: number;
  improvement!: number;
  attempts!: number;
  category!: 'strong' | 'weak' | 'improving';
}

export class TechnologyAnalyticsDto {
  technology!: string;
  interviews!: number;
  averageScore!: number;
  bestScore!: number;
  worstScore!: number;
  improvementTrend!: number;
}

export class InterviewHistoryItemDto {
  id!: string;
  technology!: string;
  score!: number;
  date!: Date;
  difficulty!: string;
  type!: string;
  questionsCount!: number;
}

export class AnalyticsHistoryQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  technology?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class AnalyticsResponseDto<T> {
  data!: T;
  timestamp!: Date;
  period?: {
    start: Date;
    end: Date;
  };
}

export class AnalyticsPaginatedResponseDto<T> {
  data!: T[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp!: Date;
}

export class SkillImprovementDto {
  skill!: string;
  baseline!: number;
  current!: number;
  percentageChange!: number;
  daysToImprove!: number;
}

export class PerformanceSummaryDto {
  overallTrend!: 'improving' | 'stable' | 'declining';
  trendPercentage!: number;
  nextLevelThreshold!: number;
  estimatedDaysToNextLevel!: number;
}
