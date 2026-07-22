import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JobAnalysisService } from './job-analysis.service';
import { PrismaService } from '../../../app/prisma.service';
import { OpenAIService } from '../../ai/services/openai.service';

describe('JobAnalysisService', () => {
  let service: JobAnalysisService;

  const mockOpenAIService = {
    sendMessage: jest.fn().mockResolvedValue(JSON.stringify({
      matchPercentage: 82,
      matchedSkills: ['TypeScript', 'Angular', 'Node.js'],
      missingSkills: ['Kubernetes', 'Terraform'],
      skillGap: { critical: ['Kubernetes'], optional: ['Terraform'] },
      recommendations: ['Learn Kubernetes basics'],
      interviewPreparationTips: ['Study system design patterns'],
      experienceGap: 'Candidate has relevant experience but lacks DevOps skills',
      overallAssessment: 'Strong frontend match with minor backend gaps.',
    })),
  };

  const mockPrisma = {
    resume: { findFirst: jest.fn() },
    jobDescription: {
      upsert: jest.fn(),
      create: jest.fn(),
    },
    jobMatchAnalysis: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJobDto = {
    resumeId: 'r-1',
    jobTitle: 'Senior Frontend Engineer',
    jobDescription:
      'We are looking for a Senior Frontend Engineer with 5+ years experience in TypeScript and Angular to build scalable web applications with modern tooling.',
    companyName: 'TechCorp',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobAnalysisService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OpenAIService, useValue: mockOpenAIService },
      ],
    }).compile();

    service = module.get<JobAnalysisService>(JobAnalysisService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('matchResumeToJob', () => {
    it('should return match result on success', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        extractedText: 'John Doe\n5 years TypeScript Angular experience',
      });
      mockPrisma.jobDescription.upsert.mockRejectedValue(new Error('no match'));
      mockPrisma.jobDescription.create.mockResolvedValue({
        id: 'jd-1',
        jobTitle: 'Senior Frontend Engineer',
        companyName: 'TechCorp',
      });
      mockPrisma.jobMatchAnalysis.deleteMany.mockResolvedValue({});
      mockPrisma.jobMatchAnalysis.create.mockResolvedValue({
        id: 'jm-1',
        resumeId: 'r-1',
        jobDescriptionId: 'jd-1',
        matchPercentage: 82,
        matchedSkills: ['TypeScript', 'Angular'],
        missingSkills: ['Kubernetes'],
        skillGap: { critical: ['Kubernetes'], optional: [] },
        recommendations: ['Learn Kubernetes'],
        interviewPreparationTips: ['Study system design'],
        createdAt: new Date(),
      });

      const result = await service.matchResumeToJob('u-1', mockJobDto);
      expect(result.matchPercentage).toBe(82);
      expect(result.jobDescription.jobTitle).toBe('Senior Frontend Engineer');
    });

    it('should throw NotFoundException for unknown resume', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue(null);
      await expect(service.matchResumeToJob('u-1', mockJobDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own resume', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'other-user',
        extractedText: 'resume text',
      });
      await expect(service.matchResumeToJob('u-1', mockJobDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when resume has no extracted text', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        extractedText: null,
      });
      await expect(service.matchResumeToJob('u-1', mockJobDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for short job description', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        extractedText: 'resume text',
      });
      await expect(
        service.matchResumeToJob('u-1', { ...mockJobDto, jobDescription: 'too short' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMatchResult', () => {
    it('should return match result by ID', async () => {
      mockPrisma.jobMatchAnalysis.findFirst.mockResolvedValue({
        id: 'jm-1',
        userId: 'u-1',
        resume: { originalFilename: 'cv.pdf', processingStatus: 'COMPLETED' },
        jobDescription: { jobTitle: 'Engineer', companyName: 'Corp' },
      });

      const result = await service.getMatchResult('jm-1', 'u-1');
      expect(result.id).toBe('jm-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.jobMatchAnalysis.findFirst.mockResolvedValue(null);
      await expect(service.getMatchResult('jm-1', 'u-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different user', async () => {
      mockPrisma.jobMatchAnalysis.findFirst.mockResolvedValue({
        id: 'jm-1',
        userId: 'other-user',
        resume: {},
        jobDescription: {},
      });
      await expect(service.getMatchResult('jm-1', 'u-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUserMatchResults', () => {
    it('should return all match results for a user', async () => {
      mockPrisma.jobMatchAnalysis.findMany.mockResolvedValue([
        { id: 'jm-1', matchPercentage: 80, resume: {}, jobDescription: {} },
        { id: 'jm-2', matchPercentage: 65, resume: {}, jobDescription: {} },
      ]);

      const result = await service.getUserMatchResults('u-1');
      expect(result.length).toBe(2);
    });
  });
});
