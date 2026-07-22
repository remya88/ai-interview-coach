import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../app/prisma.service';
import { OpenAIService } from '../../ai/services/openai.service';
import { JobMatchRequestDto } from '../dto/job-analysis.dto';
import { JOB_MATCH_PROMPT } from '../prompts/job-match.prompt';
import { JOB_ANALYSIS_CONSTANTS } from '../constants/job-analysis.constants';
import { JobMatchResult } from '../interfaces/job-analysis.interface';

@Injectable()
export class JobAnalysisService {
  private readonly logger = new Logger(JobAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openaiService: OpenAIService,
  ) {}

  /**
   * Match a resume against a job description using AI
   */
  async matchResumeToJob(userId: string, dto: JobMatchRequestDto) {
    // Validate ownership of resume
    const resume = await this.prisma.resume.findFirst({
      where: { id: dto.resumeId, deletedAt: null },
    });

    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException('Access denied to this resume');

    if (!resume.extractedText) {
      throw new BadRequestException(
        'Resume has no extracted text. Please upload and analyze the resume first.',
      );
    }

    // Validate job description length
    if (dto.jobDescription.length < JOB_ANALYSIS_CONSTANTS.MIN_JOB_DESCRIPTION_LENGTH) {
      throw new BadRequestException('Job description is too short. Provide more detail.');
    }

    try {
      // Save/upsert the job description
      const jobDesc = await this.prisma.jobDescription.upsert({
        where: {
          // Use userId+jobTitle+createdAt-based strategy – create a new record each time
          // We use a synthetic unique field: create always, so use a workaround
          id: 'new-record-sentinel', // this will never match, always create
        },
        create: {
          userId,
          jobTitle: dto.jobTitle,
          companyName: dto.companyName,
          description: dto.jobDescription,
          requiredSkills: dto.requiredSkills ?? [],
          preferredSkills: dto.preferredSkills ?? [],
        },
        update: {},
      }).catch(async () => {
        // Fallback: just create if upsert fails
        return this.prisma.jobDescription.create({
          data: {
            userId,
            jobTitle: dto.jobTitle,
            companyName: dto.companyName,
            description: dto.jobDescription,
            requiredSkills: dto.requiredSkills ?? [],
            preferredSkills: dto.preferredSkills ?? [],
          },
        });
      });

      // Run AI matching
      const matchResult = await this.runAiMatch(
        resume.extractedText,
        dto.jobDescription,
        dto.jobTitle,
        dto.companyName,
      );

      // Delete previous match for this resume+job combo if exists
      await this.prisma.jobMatchAnalysis.deleteMany({
        where: { resumeId: dto.resumeId, jobDescriptionId: jobDesc.id },
      });

      // Save result
      const analysis = await this.prisma.jobMatchAnalysis.create({
        data: {
          resumeId: dto.resumeId,
          jobDescriptionId: jobDesc.id,
          userId,
          matchPercentage: matchResult.matchPercentage,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          skillGap: matchResult.skillGap,
          recommendations: matchResult.recommendations,
          interviewPreparationTips: matchResult.interviewPreparationTips,
          aiResponseJson: matchResult as any,
        },
      });

      return {
        ...analysis,
        jobDescription: {
          id: jobDesc.id,
          jobTitle: jobDesc.jobTitle,
          companyName: jobDesc.companyName,
        },
        overallAssessment: matchResult.overallAssessment,
        experienceGap: matchResult.experienceGap,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Job match analysis failed:', error);
      throw new HttpException(
        'AI job matching failed. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a job match result by ID
   */
  async getMatchResult(id: string, userId: string) {
    const result = await this.prisma.jobMatchAnalysis.findFirst({
      where: { id },
      include: {
        resume: { select: { originalFilename: true, processingStatus: true } },
        jobDescription: { select: { jobTitle: true, companyName: true } },
      },
    });

    if (!result) throw new NotFoundException('Match result not found');
    if (result.userId !== userId) throw new ForbiddenException('Access denied');

    return result;
  }

  /**
   * Get all job match results for a user
   */
  async getUserMatchResults(userId: string) {
    return this.prisma.jobMatchAnalysis.findMany({
      where: { userId },
      include: {
        resume: { select: { originalFilename: true } },
        jobDescription: { select: { jobTitle: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async runAiMatch(
    resumeText: string,
    jobDescription: string,
    jobTitle: string,
    companyName?: string,
  ): Promise<JobMatchResult> {
    const prompt = JOB_MATCH_PROMPT(resumeText, jobDescription, jobTitle, companyName);

    const content = await this.openaiService.sendMessage(
      [{ role: 'user', content: prompt }],
      'You are an expert technical recruiter. Return only valid JSON.',
    );

    const parsed = JSON.parse(content) as JobMatchResult;

    if (parsed.matchPercentage === undefined || !Array.isArray(parsed.matchedSkills)) {
      throw new Error('Invalid AI response structure');
    }

    return parsed;
  }
}
