import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitAnswerDto {
  @ApiPropertyOptional({ description: 'Prose answer text' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  answerText?: string;

  @ApiPropertyOptional({ description: 'Code answer' })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  codeAnswer?: string;

  @ApiPropertyOptional({ description: 'Seconds taken to answer' })
  @IsOptional()
  timeTakenSeconds?: number;
}
