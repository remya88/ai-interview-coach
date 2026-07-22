/**
 * Evaluation-specific interfaces
 */

export interface EvaluationInput {
  questionId: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  technology: string;
  expectedAnswer?: string;
  answer: string;
  timeTaken?: number;
  interviewType?: string;
}

export interface QuestionFeedbackSummary {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  answer: string;
  evaluation: EvaluationResult;
}

export interface EvaluationResult {
  evaluationId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  overallScore?: number;
  technicalScore?: number;
  architectureScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  codeQualityScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  missedConcepts?: string[];
  idealAnswer?: string;
  improvedAnswer?: string;
  learningRecommendations?: string[];
  followUpQuestions?: string[];
  aiResponseJson?: Record<string, unknown>;
  completedAt?: Date;
  errorMessage?: string;
  questions?: QuestionFeedbackSummary[];
}

export interface EvaluationJob {
  jobId: string;
  interviewId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalQuestions: number;
  completedQuestions: number;
  failedQuestions: number;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}
