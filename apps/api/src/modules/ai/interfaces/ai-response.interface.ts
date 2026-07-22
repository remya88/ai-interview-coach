/**
 * AI Response interfaces for structured OpenAI outputs
 */

export interface EvaluationScore {
  technicalKnowledge: number;
  architecture: number;
  communication: number;
  problemSolving: number;
  codeQuality: number;
}

export interface AIEvaluationResponse {
  overallScore: number;
  scores: EvaluationScore;
  strengths: string[];
  weaknesses: string[];
  missedConcepts: string[];
  idealAnswer: string;
  improvedAnswer: string;
  learningRecommendations: string[];
  followUpQuestions: string[];
}

export interface AIErrorResponse {
  error: string;
  code: string;
  retryable: boolean;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
