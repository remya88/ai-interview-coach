import { DifficultyLevel, QuestionType } from '@prisma/client';

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  category?: string;
  technology?: string;
  examples?: string[];
  timeLimit?: number;
}

export interface InterviewAnswer {
  questionId: string;
  answerText: string;
  codeAnswer?: string;
  timeTakenSeconds?: number;
  language?: string;
}

export interface InterviewSessionData {
  interviewId: string;
  sessionId: string;
  status: 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  currentQuestionNumber: number;
  totalQuestions: number;
  createdAt: Date;
  startedAt?: Date;
  resumedAt?: Date;
  completedAt?: Date;
  answers: InterviewAnswer[];
  totalDurationMinutes?: number;
}

export interface QuestionNavigationState {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
}

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export const ANSWER_LIMITS = {
  TEXT: 10000,
  CODE: 20000,
  MIN_WORDS: 10,
} as const;

export const SUPPORTED_LANGUAGES = ['TypeScript', 'JavaScript', 'Java', 'Python', 'SQL'] as const;

export const QUESTION_TYPES_DISPLAY = {
  TECHNICAL: 'Technical Question',
  CODING: 'Coding Challenge',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral Question',
} as const;
