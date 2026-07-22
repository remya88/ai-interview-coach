import { DifficultyLevel, InterviewType } from '@prisma/client';

export interface Technology {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface InterviewCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface InterviewSetupConfig {
  technologyId: string;
  categoryId: string;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  questionCount: number;
}

export interface Interview {
  id: string;
  status: string;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  questionCount: number;
  createdAt: string;
  technology: Technology;
  category: InterviewCategory;
}

export const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', description: '0-2 years experience' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: '2-5 years experience' },
  { value: 'ADVANCED', label: 'Advanced', description: '5-8 years experience' },
  { value: 'SENIOR', label: 'Senior', description: '8+ years experience' },
  { value: 'ARCHITECT', label: 'Architect', description: 'System design & leadership' },
] as const;

export const INTERVIEW_TYPES = [
  { value: 'TECHNICAL', label: 'Technical', description: 'Theory and concepts' },
  { value: 'CODING', label: 'Coding', description: 'Write code solutions' },
  { value: 'SYSTEM_DESIGN', label: 'System Design', description: 'Architecture design' },
  { value: 'BEHAVIORAL', label: 'Behavioral', description: 'Soft skills' },
  { value: 'MIXED', label: 'Mixed', description: 'Combination of all types' },
] as const;

export const QUESTION_COUNTS = [5, 10, 15, 20] as const;
