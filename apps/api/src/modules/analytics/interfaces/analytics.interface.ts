/**
 * Analytics module interfaces
 */

export interface DashboardData {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  totalPracticeHours: number;
  currentStreak: number;
  strongestSkills: Array<{ skill: string; score: number }>;
  weakestSkills: Array<{ skill: string; score: number }>;
  recentInterviews: Array<{
    id: string;
    technology: string;
    score: number;
    date: Date;
    difficulty: string;
  }>;
}

export interface PerformanceTrend {
  date: Date;
  averageScore: number;
  interviewCount: number;
}

export interface SkillMetrics {
  skillName: string;
  currentScore: number;
  previousScore: number;
  improvement: number;
  attempts: number;
  category: 'strong' | 'weak' | 'improving';
  trend: 'up' | 'down' | 'stable';
}

export interface TechnologyMetrics {
  technology: string;
  interviews: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementTrend: number;
  lastAttempt: Date;
}

export interface InterviewHistoryItem {
  id: string;
  technology: string;
  score: number;
  date: Date;
  difficulty: string;
  type: string;
  questionsCount: number;
  status: 'completed' | 'partial' | 'failed';
}

export interface AnalyticsQuery {
  userId: string;
  page?: number;
  limit?: number;
  technology?: string;
  difficulty?: string;
  fromDate?: Date;
  toDate?: Date;
  periodDays?: number;
}

export interface SkillImprovement {
  skill: string;
  baseline: number;
  current: number;
  percentageChange: number;
  daysToImprove: number;
}

export interface PerformanceSummary {
  overallTrend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
  nextLevelThreshold: number;
  estimatedDaysToNextLevel: number;
}

export interface AggregationResult {
  userId: string;
  metric: string;
  value: number;
  date: Date;
}
