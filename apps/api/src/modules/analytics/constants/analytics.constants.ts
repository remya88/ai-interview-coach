export const ANALYTICS_CONSTANTS = {
  // Time periods for analysis
  PERIODS: {
    WEEK: 7,
    MONTH: 30,
    QUARTER: 90,
    YEAR: 365,
  },

  // Score thresholds
  SCORE_THRESHOLDS: {
    EXCELLENT: 85,
    GOOD: 75,
    AVERAGE: 65,
    NEEDS_IMPROVEMENT: 50,
  },

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Skill categories
  SKILL_CATEGORIES: {
    TECHNICAL: 'technical',
    BEHAVIORAL: 'behavioral',
    SYSTEM_DESIGN: 'system_design',
    CODING: 'coding',
  },

  // Performance levels
  PERFORMANCE_LEVELS: {
    BEGINNER: 0,
    INTERMEDIATE: 65,
    ADVANCED: 80,
    EXPERT: 90,
  },

  // Streak calculation
  MIN_STREAK_DAYS: 1,

  // Caching
  CACHE_TTL: 3600, // 1 hour
  CACHE_KEYS: {
    DASHBOARD: 'analytics:dashboard:',
    PERFORMANCE: 'analytics:performance:',
    SKILLS: 'analytics:skills:',
    TECHNOLOGY: 'analytics:technology:',
  },

  // Batch processing
  BATCH_SIZE: 100,
};

export const SKILL_MAPPING = {
  technicalKnowledge: 'Technical Knowledge',
  architecture: 'System Architecture',
  communication: 'Communication',
  problemSolving: 'Problem Solving',
  codeQuality: 'Code Quality',
};

export const PERFORMANCE_COLORS = {
  excellent: '#10b981', // green
  good: '#3b82f6', // blue
  average: '#f59e0b', // amber
  needsImprovement: '#ef4444', // red
};
