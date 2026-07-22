import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class NavigateQuestionDto {
  @ApiProperty({ description: 'Target question number (1-based index)', minimum: 1 })
  @IsInt()
  @Min(1)
  questionNumber!: number;
}
