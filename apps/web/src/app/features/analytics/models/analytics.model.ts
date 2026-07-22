export interface AnalyticsDashboard {
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
    type: string;
    questionsCount: number;
  }>;
}

export interface PerformanceTrend {
  date: Date;
  averageScore: number;
  interviewCount: number;
}

export interface SkillAnalytics {
  skillName: string;
  currentScore: number;
  improvement: number;
  attempts: number;
  category: 'strong' | 'weak' | 'improving';
}

export interface TechnologyAnalytics {
  technology: string;
  interviews: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementTrend: number;
}

export interface InterviewHistoryItem {
  id: string;
  technology: string;
  score: number;
  date: Date;
  difficulty: string;
  type: string;
  questionsCount: number;
}

export interface AnalyticsHistory {
  data: InterviewHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PerformanceSummary {
  overallTrend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
  nextLevelThreshold: number;
  estimatedDaysToNextLevel: number;
}

export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface SkillChartData {
  skill: string;
  score: number;
  color?: string;
}

export enum ScoreLevelEnum {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  AVERAGE = 'Average',
  NEEDS_IMPROVEMENT = 'Needs Improvement',
}

export const SCORE_LEVELS = {
  EXCELLENT: 85,
  GOOD: 75,
  AVERAGE: 65,
  NEEDS_IMPROVEMENT: 50,
};

export const SCORE_COLORS = {
  excellent: '#10b981',
  good: '#3b82f6',
  average: '#f59e0b',
  needsImprovement: '#ef4444',
};

export function getScoreLevel(score: number): ScoreLevelEnum {
  if (score >= SCORE_LEVELS.EXCELLENT) return ScoreLevelEnum.EXCELLENT;
  if (score >= SCORE_LEVELS.GOOD) return ScoreLevelEnum.GOOD;
  if (score >= SCORE_LEVELS.AVERAGE) return ScoreLevelEnum.AVERAGE;
  return ScoreLevelEnum.NEEDS_IMPROVEMENT;
}

export function getScoreColor(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case ScoreLevelEnum.EXCELLENT:
      return SCORE_COLORS.excellent;
    case ScoreLevelEnum.GOOD:
      return SCORE_COLORS.good;
    case ScoreLevelEnum.AVERAGE:
      return SCORE_COLORS.average;
    default:
      return SCORE_COLORS.needsImprovement;
  }
}
