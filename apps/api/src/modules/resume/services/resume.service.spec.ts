import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { PrismaService } from '../../../app/prisma.service';
import { ResumeParserService } from '../parsers/resume-parser.service';
import { OpenAIService } from '../../ai/services/openai.service';

describe('ResumeService', () => {
  let service: ResumeService;

  const mockOpenAIService = {
    sendMessage: jest.fn().mockResolvedValue(JSON.stringify({
      overallScore: 85,
      atsScore: 88,
      skillScore: 82,
      experienceScore: 80,
      formatScore: 90,
      experienceLevel: 'SENIOR',
      detectedSkills: ['TypeScript', 'Angular'],
      strengths: ['Strong TypeScript skills'],
      weaknesses: ['Limited cloud experience'],
      missingKeywords: ['Kubernetes'],
      recommendations: ['Learn cloud infrastructure'],
      improvedSummary: 'Experienced full-stack engineer...',
      summary: 'Strong developer with 5 years experience.',
    })),
  };

  const mockPrisma = {
    resume: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    resumeAnalysis: {
      create: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockParser = {
    parseFile: jest.fn().mockResolvedValue({
      rawText: 'John Doe\nAngular Developer\n5 years experience',
      skills: ['Angular', 'TypeScript'],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ResumeParserService, useValue: mockParser },
        { provide: OpenAIService, useValue: mockOpenAIService },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserResumes', () => {
    it('should return user resumes', async () => {
      const mockResumes = [
        { id: 'r-1', userId: 'u-1', originalFilename: 'cv.pdf', resumeAnalyses: [] },
      ];
      mockPrisma.resume.findMany.mockResolvedValue(mockResumes);

      const result = await service.getUserResumes('u-1');
      expect(result).toEqual(mockResumes);
      expect(mockPrisma.resume.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId: 'u-1' }) }),
      );
    });
  });

  describe('getResumeById', () => {
    it('should return resume when found and owned', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        resumeAnalyses: [],
      });

      const result = await service.getResumeById('r-1', 'u-1');
      expect(result.id).toBe('r-1');
    });

    it('should throw NotFoundException when resume not found', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue(null);
      await expect(service.getResumeById('r-1', 'u-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own resume', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'other-user',
        resumeAnalyses: [],
      });
      await expect(service.getResumeById('r-1', 'u-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('analyzeResume', () => {
    it('should fall back to heuristic analysis when parsing or AI access fails', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        storagePath: 'uploads/resumes/test.pdf',
        fileType: 'application/pdf',
        extractedText: '',
        resumeAnalyses: [],
      });
      mockParser.parseFile.mockRejectedValueOnce(new Error('parse failed'));
      mockOpenAIService.sendMessage.mockRejectedValueOnce(new Error('OpenAI unavailable'));
      mockPrisma.resume.update.mockResolvedValue({});
      mockPrisma.resumeAnalysis.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.resumeAnalysis.create.mockResolvedValue({ id: 'a-1' });

      const result = await service.analyzeResume('r-1', 'u-1');

      expect(result).toBeDefined();
      expect(mockPrisma.resumeAnalysis.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ experienceLevel: 'MID_LEVEL' }),
        }),
      );
    });
  });

  describe('getResumeReport', () => {
    it('should return resume with latest analysis', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        originalFilename: 'cv.pdf',
        processingStatus: 'COMPLETED',
        uploadedAt: new Date(),
        resumeAnalyses: [],
      });
      mockPrisma.resumeAnalysis.findFirst.mockResolvedValue({
        id: 'a-1',
        overallScore: 85,
      });

      const result = await service.getResumeReport('r-1', 'u-1');
      expect(result.resume).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should return null analysis when no analysis exists', async () => {
      mockPrisma.resume.findFirst.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        originalFilename: 'cv.pdf',
        processingStatus: 'UPLOADED',
        uploadedAt: new Date(),
        resumeAnalyses: [],
      });
      mockPrisma.resumeAnalysis.findFirst.mockResolvedValue(null);

      const result = await service.getResumeReport('r-1', 'u-1');
      expect(result.analysis).toBeNull();
    });
  });
});
