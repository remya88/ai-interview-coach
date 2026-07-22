import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsUUID, Max, Min } from 'class-validator';
import { DifficultyLevel, InterviewType } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty({ description: 'Technology UUID' })
  @IsUUID()
  technologyId!: string;

  @ApiProperty({ description: 'Category UUID' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  difficulty!: DifficultyLevel;

  @ApiProperty({ enum: InterviewType })
  @IsEnum(InterviewType)
  interviewType!: InterviewType;

  @ApiProperty({ minimum: 1, maximum: 20, default: 5 })
  @IsInt()
  @Min(1)
  @Max(20)
  questionCount!: number;
}
