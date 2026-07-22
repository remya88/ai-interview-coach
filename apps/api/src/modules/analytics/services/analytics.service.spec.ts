import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../../app/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    interview: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          userId: 'user-1',
          status: 'COMPLETED',
          createdAt: new Date(),
          difficulty: 'Medium',
          overallScore: 85,
          technology: { name: 'JavaScript' },
          category: { name: 'Web Development' },
          questions: [
            {
              evaluation: {
                overallScore: 85,
                technicalScore: 85,
                architectureScore: 80,
                communicationScore: 85,
                problemSolvingScore: 85,
                codeQualityScore: 80,
              },
            },
          ],
        },
      ];

      mockPrismaService.interview.findMany.mockResolvedValue(mockInterviews);

      const result = await service.getDashboard('user-1');

      expect(result.totalInterviews).toBe(1);
      expect(result.completedInterviews).toBe(1);
      expect(result.averageScore).toBe(85);
      expect(result.strongestSkills).toBeDefined();
      expect(result.weakestSkills).toBeDefined();
      expect(result.recentInterviews).toBeDefined();
    });

    it('should handle empty interviews', async () => {
      mockPrismaService.interview.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-1');

      expect(result.totalInterviews).toBe(0);
      expect(result.completedInterviews).toBe(0);
      expect(result.averageScore).toBe(0);
    });

    it('should throw error on database failure', async () => {
      mockPrismaService.interview.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getDashboard('user-1')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getPerformanceTrend', () => {
    it('should return performance trend', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          status: 'COMPLETED',
          createdAt: new Date(),
          questions: [
            { evaluation: { overallScore: 80 } },
            { evaluation: { overallScore: 85 } },
          ],
        },
        {
          id: 'interview-2',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 86400000), // yesterday
          questions: [{ evaluation: { overallScore: 75 } }],
        },
      ];

      mockPrismaService.interview.findMany.mockResolvedValue(mockInterviews);

      const result = await service.getPerformanceTrend('user-1', 30);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('averageScore');
    });
  });

  describe('getSkillAnalytics', () => {
    it('should return skill analytics', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          status: 'COMPLETED',
          questions: [
            {
              evaluation: {
                technicalScore: 85,
                architectureScore: 80,
                communicationScore: 85,
                problemSolvingScore: 90,
                codeQualityScore: 80,
              },
            },
          ],
        },
      ];

      mockPrismaService.interview.findMany.mockResolvedValue(mockInterviews);

      const result = await service.getSkillAnalytics('user-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('skillName');
      expect(result[0]).toHaveProperty('currentScore');
      expect(result[0]).toHaveProperty('attempts');
    });
  });

  describe('getTechnologyAnalytics', () => {
    it('should return technology analytics', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          status: 'COMPLETED',
          technology: { name: 'JavaScript' },
          questions: [{ evaluation: { overallScore: 85 } }],
        },
        {
          id: 'interview-2',
          status: 'COMPLETED',
          technology: { name: 'TypeScript' },
          questions: [{ evaluation: { overallScore: 90 } }],
        },
      ];

      mockPrismaService.interview.findMany.mockResolvedValue(mockInterviews);

      const result = await service.getTechnologyAnalytics('user-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('technology');
      expect(result[0]).toHaveProperty('averageScore');
      expect(result[0]).toHaveProperty('interviews');
    });
  });

  describe('getInterviewHistory', () => {
    it('should return paginated interview history', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          status: 'COMPLETED',
          createdAt: new Date(),
          difficulty: 'Medium',
          interviewType: 'Technical',
          technology: { name: 'JavaScript' },
          questions: [
            { id: 'q-1', evaluation: { overallScore: 85 } },
          ],
        },
      ];

      mockPrismaService.interview.findMany.mockResolvedValue(mockInterviews);
      mockPrismaService.interview.count.mockResolvedValue(1);

      const result = await service.getInterviewHistory('user-1', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle filtering by technology', async () => {
      mockPrismaService.interview.findMany.mockResolvedValue([]);
      mockPrismaService.interview.count.mockResolvedValue(0);

      await service.getInterviewHistory('user-1', {
        page: 1,
        limit: 10,
        technology: 'JavaScript',
      });

      expect(mockPrismaService.interview.findMany).toHaveBeenCalled();
      const callArg = mockPrismaService.interview.findMany.mock.calls[0][0];
      expect(callArg.where.technology).toBeDefined();
    });
  });

  describe('getPerformanceSummary', () => {
    it('should return performance summary', async () => {
      mockPrismaService.interview.findMany.mockResolvedValue([
        {
          id: 'interview-1',
          status: 'COMPLETED',
          createdAt: new Date(),
          questions: [{ evaluation: { overallScore: 85 } }],
        },
      ]);

      const result = await service.getPerformanceSummary('user-1');

      expect(result).toHaveProperty('overallTrend');
      expect(result).toHaveProperty('trendPercentage');
      expect(result).toHaveProperty('nextLevelThreshold');
      expect(result).toHaveProperty('estimatedDaysToNextLevel');
    });
  });
});
