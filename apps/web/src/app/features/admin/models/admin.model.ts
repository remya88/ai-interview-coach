export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalInterviews: number;
  completedInterviews: number;
  completionRate: number;
  averageScore: number;
  totalResumes: number;
  totalAIRequests: number;
  criticalErrorsLast24h: number;
}

export interface AdminUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  _count: { interviews: number; resumes: number };
}

export interface AdminUserList {
  data: AdminUserSummary[];
  pagination: Pagination;
}

export interface AdminUserDetail extends AdminUserSummary {
  profile: unknown;
  interviews: unknown[];
  resumes: unknown[];
  aiUsageLogs: unknown[];
}

export interface AdminInterviewSummary {
  id: string;
  difficulty: string;
  interviewType: string;
  status: string;
  overallScore: number | null;
  createdAt: Date;
  user: { firstName: string; lastName: string; email: string };
  technology: { name: string };
  category: { name: string };
  _count: { questions: number };
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  estimatedCostUsd: number;
  mostUsedFeature: string;
  byFeature: { feature: string; requests: number; tokens: number }[];
  dailyUsage: { date: Date; requests: number; tokens: number }[];
}

export interface AIConfiguration {
  id: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPromptVersion: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemError {
  id: string;
  service: string;
  errorMessage: string;
  stackTrace?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context?: unknown;
  createdAt: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}
