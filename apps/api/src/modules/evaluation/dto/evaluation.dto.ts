import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for starting evaluation of an interview
 */
export class StartEvaluationDto {
  @IsUUID()
  @IsNotEmpty()
  interviewId!: string;
}

/**
 * DTO for evaluating a single question
 */
export class EvaluateQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  answer!: string;

  @IsString()
  @IsOptional()
  technology?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;
}

/**
 * Response DTO for evaluation result
 */
export class EvaluationResultDto {
  evaluationId!: string;
  status!: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  overallScore?: number;
  technicalScore?: number;
  architectureScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  codeQualityScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  idealAnswer?: string;
  improvedAnswer?: string;
  learningRecommendations?: string[];
  followUpQuestions?: string[];
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * Response DTO for evaluation status
 */
export class EvaluationStatusDto {
  evaluationId!: string;
  status!: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  errorMessage?: string;
  completedAt?: Date;
}

/**
 * DTO for pagination query
 */
export class EvaluationHistoryQueryDto {
  page = 1;
  limit = 10;
  technology?: string;
  fromDate?: Date;
  toDate?: Date;
}
