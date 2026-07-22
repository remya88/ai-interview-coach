import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../services/analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getDashboard: jest.fn(),
    getPerformanceTrend: jest.fn(),
    getSkillAnalytics: jest.fn(),
    getTechnologyAnalytics: jest.fn(),
    getInterviewHistory: jest.fn(),
    getPerformanceSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      const mockDashboard = {
        totalInterviews: 10,
        completedInterviews: 9,
        averageScore: 85,
        totalPracticeHours: 5,
        currentStreak: 3,
        strongestSkills: [{ skill: 'JavaScript', score: 90 }],
        weakestSkills: [{ skill: 'System Design', score: 65 }],
        recentInterviews: [],
      };

      mockAnalyticsService.getDashboard.mockResolvedValue(mockDashboard);

      const result = await controller.getDashboard({
        user: { id: 'user-1' },
      });

      expect(result).toEqual(mockDashboard);
      expect(mockAnalyticsService.getDashboard).toHaveBeenCalledWith('user-1');
    });

    it('should handle service errors', async () => {
      mockAnalyticsService.getDashboard.mockRejectedValue(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      await expect(
        controller.getDashboard({ user: { id: 'user-1' } }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getPerformance', () => {
    it('should return performance trend', async () => {
      const mockPerformance = [
        {
          date: new Date(),
          averageScore: 85,
          interviewCount: 1,
        },
      ];

      mockAnalyticsService.getPerformanceTrend.mockResolvedValue(
        mockPerformance,
      );

      const result = await controller.getPerformance(
        { user: { id: 'user-1' } },
        '30',
      );

      expect(Array.isArray(result)).toBe(true);
      expect(mockAnalyticsService.getPerformanceTrend).toHaveBeenCalledWith(
        'user-1',
        30,
      );
    });

    it('should use default days if not provided', async () => {
      mockAnalyticsService.getPerformanceTrend.mockResolvedValue([]);

      await controller.getPerformance({ user: { id: 'user-1' } });

      expect(mockAnalyticsService.getPerformanceTrend).toHaveBeenCalledWith(
        'user-1',
        30,
      );
    });
  });

  describe('getSkills', () => {
    it('should return skill analytics', async () => {
      const mockSkills = [
        {
          skillName: 'Technical Knowledge',
          currentScore: 85,
          improvement: 10,
          attempts: 5,
          category: 'strong',
        },
      ];

      mockAnalyticsService.getSkillAnalytics.mockResolvedValue(mockSkills);

      const result = await controller.getSkills({ user: { id: 'user-1' } });

      expect(Array.isArray(result)).toBe(true);
      expect(mockAnalyticsService.getSkillAnalytics).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('getTechnology', () => {
    it('should return technology analytics', async () => {
      const mockTech = [
        {
          technology: 'JavaScript',
          interviews: 5,
          averageScore: 85,
          bestScore: 90,
          worstScore: 75,
          improvementTrend: 5,
        },
      ];

      mockAnalyticsService.getTechnologyAnalytics.mockResolvedValue(mockTech);

      const result = await controller.getTechnology({
        user: { id: 'user-1' },
      });

      expect(Array.isArray(result)).toBe(true);
      expect(mockAnalyticsService.getTechnologyAnalytics).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('getHistory', () => {
    it('should return interview history', async () => {
      const mockHistory = {
        data: [
          {
            id: 'interview-1',
            technology: 'JavaScript',
            score: 85,
            date: new Date(),
            difficulty: 'Medium',
            type: 'Technical',
            questionsCount: 5,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      mockAnalyticsService.getInterviewHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory(
        { user: { id: 'user-1' } },
        { page: 1, limit: 10 },
      );

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(mockAnalyticsService.getInterviewHistory).toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should return performance summary', async () => {
      const mockSummary = {
        overallTrend: 'improving',
        trendPercentage: 5,
        nextLevelThreshold: 85,
        estimatedDaysToNextLevel: 10,
      };

      mockAnalyticsService.getPerformanceSummary.mockResolvedValue(
        mockSummary,
      );

      const result = await controller.getSummary({ user: { id: 'user-1' } });

      expect(result.data).toEqual(mockSummary);
      expect(result.timestamp).toBeDefined();
    });
  });
});
