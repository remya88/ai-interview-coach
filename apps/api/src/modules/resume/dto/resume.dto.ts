import { ApiProperty } from '@nestjs/swagger';

export class UploadResumeDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  declare file: Express.Multer.File;
}

export class ResumeResponseDto {
  @ApiProperty() declare id: string;
  @ApiProperty() declare userId: string;
  @ApiProperty() declare originalFilename: string;
  @ApiProperty() declare fileType: string;
  @ApiProperty() declare fileSize: number;
  @ApiProperty() declare processingStatus: string;
  @ApiProperty() declare uploadedAt: Date;
  @ApiProperty({ required: false }) atsScore?: number;
  @ApiProperty({ required: false }) aiSummary?: string;
}

export class ResumeAnalysisResponseDto {
  @ApiProperty() declare id: string;
  @ApiProperty() declare resumeId: string;
  @ApiProperty() declare overallScore: number;
  @ApiProperty() declare atsScore: number;
  @ApiProperty() declare skillScore: number;
  @ApiProperty() declare experienceScore: number;
  @ApiProperty() declare formatScore: number;
  @ApiProperty() declare experienceLevel: string;
  @ApiProperty({ type: [String] }) declare detectedSkills: string[];
  @ApiProperty({ type: [String] }) declare strengths: string[];
  @ApiProperty({ type: [String] }) declare weaknesses: string[];
  @ApiProperty({ type: [String] }) declare missingKeywords: string[];
  @ApiProperty({ type: [String] }) declare recommendations: string[];
  @ApiProperty() declare improvedSummary: string;
  @ApiProperty() declare summary: string;
  @ApiProperty() declare createdAt: Date;
}
