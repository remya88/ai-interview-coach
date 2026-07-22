/**
 * Evaluation models and types for frontend
 */

export interface EvaluationScore {
  technicalKnowledge: number;
  architecture: number;
  communication: number;
  problemSolving: number;
  codeQuality: number;
}

export interface EvaluationFeedback {
  evaluationId?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  overallScore?: number;
  scores?: EvaluationScore;
  strengths?: string[];
  weaknesses?: string[];
  missedConcepts?: string[];
  idealAnswer?: string;
  improvedAnswer?: string;
  learningRecommendations?: string[];
  followUpQuestions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionEvaluation {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  candidateAnswer: string;
  evaluation: EvaluationFeedback;
}

export interface InterviewEvaluation {
  evaluationId?: string;
  interviewId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  overallScore: number;
  scores: EvaluationScore;
  averageScores: EvaluationScore;
  questionsEvaluated: number;
  questionsFailed: number;
  totalQuestions: number;
  startedAt: Date;
  completedAt?: Date;
  questions: QuestionEvaluation[];
  strengths?: string[];
  weaknesses?: string[];
  learningRecommendations?: string[];
  errorMessage?: string;
}

export interface EvaluationHistory {
  evaluationId: string;
  interviewId: string;
  technology: string;
  difficulty: string;
  overallScore: number;
  date: Date;
}

export const EVALUATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  THEORY: 'Theory Question',
  CODING: 'Coding Question',
  DEBUGGING: 'Debugging Question',
  SCENARIO: 'Scenario Question',
  ARCHITECTURE: 'Architecture Question',
  BEHAVIORAL: 'Behavioral Question',
};
