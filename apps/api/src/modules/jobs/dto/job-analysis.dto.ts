import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class JobMatchRequestDto {
  @ApiProperty({ description: 'Resume ID to match against the job' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  declare resumeId: string;

  @ApiProperty({ description: 'Job title' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  declare jobTitle: string;

  @ApiProperty({ description: 'Full job description text', minLength: 50 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(50)
  declare jobDescription: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  requiredSkills?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  preferredSkills?: string[];
}

export class JobMatchResponseDto {
  @ApiProperty() declare id: string;
  @ApiProperty() declare resumeId: string;
  @ApiProperty() declare jobDescriptionId: string;
  @ApiProperty() declare matchPercentage: number;
  @ApiProperty({ type: [String] }) declare matchedSkills: string[];
  @ApiProperty({ type: [String] }) declare missingSkills: string[];
  @ApiProperty() declare skillGap: object;
  @ApiProperty({ type: [String] }) declare recommendations: string[];
  @ApiProperty({ type: [String] }) declare interviewPreparationTips: string[];
  @ApiProperty() declare createdAt: Date;
}
