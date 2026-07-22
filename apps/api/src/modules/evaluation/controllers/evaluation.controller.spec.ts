import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from '../services/evaluation.service';

describe('EvaluationController', () => {
  let controller: EvaluationController;
  let service: EvaluationService;

  const mockEvaluationService = {
    evaluateInterview: jest.fn(),
    getInterviewEvaluation: jest.fn(),
    getEvaluation: jest.fn(),
    getEvaluationHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationController],
      providers: [
        {
          provide: EvaluationService,
          useValue: mockEvaluationService,
        },
      ],
    }).compile();

    controller = module.get<EvaluationController>(EvaluationController);
    service = module.get<EvaluationService>(EvaluationService);

    jest.clearAllMocks();
  });

  describe('startEvaluation', () => {
    it('should start evaluation successfully', async () => {
      const mockResult = {
        evaluationId: 'eval-1',
        status: 'PROCESSING',
        overallScore: undefined,
      };

      mockEvaluationService.evaluateInterview.mockResolvedValue(mockResult);

      const result = await controller.startEvaluation('interview-1', {
        user: { id: 'user-1' },
      });

      expect(result.evaluationId).toBe('eval-1');
      expect(result.status).toBe('PROCESSING');
      expect(mockEvaluationService.evaluateInterview).toHaveBeenCalledWith(
        'interview-1',
      );
    });

    it('should handle service errors', async () => {
      mockEvaluationService.evaluateInterview.mockRejectedValue(
        new HttpException('Interview not found', HttpStatus.NOT_FOUND),
      );

      await expect(
        controller.startEvaluation('non-existent', { user: { id: 'user-1' } }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getEvaluation', () => {
    it('should get evaluation successfully', async () => {
      const mockEvaluation = {
        evaluationId: 'eval-1',
        status: 'COMPLETED',
        overallScore: 85,
        technicalScore: 85,
        architectureScore: 80,
        communicationScore: 85,
        problemSolvingScore: 85,
        codeQualityScore: 80,
        strengths: ['Good', 'Excellent'],
        weaknesses: ['Could improve'],
        idealAnswer: 'The ideal approach...',
        improvedAnswer: 'Your improved answer...',
        learningRecommendations: ['Study pattern A'],
      };

      mockEvaluationService.getInterviewEvaluation.mockResolvedValue(
        mockEvaluation,
      );

      const result = await controller.getEvaluation('interview-1', {
        user: { id: 'user-1' },
      });

      expect(result.overallScore).toBe(85);
      expect(result.scores.technical).toBe(85);
      expect(mockEvaluationService.getInterviewEvaluation).toHaveBeenCalledWith(
        'interview-1',
      );
    });

    it('should handle not found error', async () => {
      mockEvaluationService.getInterviewEvaluation.mockRejectedValue(
        new HttpException('Evaluation not found', HttpStatus.NOT_FOUND),
      );

      await expect(
        controller.getEvaluation('non-existent', { user: { id: 'user-1' } }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getHistory', () => {
    it('should get evaluation history', async () => {
      const mockHistory = {
        data: [
          {
            evaluationId: 'eval-1',
            status: 'COMPLETED',
            overallScore: 85,
            strengths: ['Good'],
            weaknesses: ['Weak'],
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      mockEvaluationService.getEvaluationHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory(
        { page: 1, limit: 10 },
        { user: { id: 'user-1' } },
      );

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockEvaluationService.getEvaluationHistory).toHaveBeenCalledWith(
        'user-1',
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should handle filtering', async () => {
      mockEvaluationService.getEvaluationHistory.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      });

      await controller.getHistory(
        {
          page: 1,
          limit: 10,
          technology: 'JavaScript',
        },
        { user: { id: 'user-1' } },
      );

      expect(mockEvaluationService.getEvaluationHistory).toHaveBeenCalledWith(
        'user-1',
        1,
        10,
        'JavaScript',
        undefined,
        undefined,
      );
    });
  });

  describe('getQuestionEvaluation', () => {
    it('should get question evaluation', async () => {
      const mockEvaluation = {
        evaluationId: 'eval-1',
        status: 'COMPLETED',
        overallScore: 85,
        scores: {
          technical: 85,
          architecture: 80,
          communication: 85,
          problemSolving: 85,
          codeQuality: 80,
        },
        strengths: ['Good'],
        weaknesses: ['Weak'],
        idealAnswer: 'Ideal...',
        improvedAnswer: 'Improved...',
        learningRecommendations: ['Learn'],
        followUpQuestions: ['Question?'],
        aiResponseJson: { followUpQuestions: ['Question?'] },
      };

      mockEvaluationService.getEvaluation.mockResolvedValue(mockEvaluation);

      const result = await controller.getQuestionEvaluation('q-1', {
        user: { id: 'user-1' },
      });

      expect(result.overallScore).toBe(85);
      expect(result.followUpQuestions).toEqual(['Question?']);
      expect(mockEvaluationService.getEvaluation).toHaveBeenCalledWith('q-1');
    });

    it('should handle not found', async () => {
      mockEvaluationService.getEvaluation.mockResolvedValue(null);

      await expect(
        controller.getQuestionEvaluation('q-1', { user: { id: 'user-1' } }),
      ).rejects.toThrow(HttpException);
    });
  });
});
