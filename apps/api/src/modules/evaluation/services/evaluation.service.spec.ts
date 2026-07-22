import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../app/prisma.service';
import { OpenAIService } from '../../ai/services/openai.service';
import { EvaluationService } from './evaluation.service';
import { EvaluationStatus } from '@prisma/client';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let prismaService: PrismaService;
  let openaiService: OpenAIService;

  const mockPrismaService = {
    interview: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    interviewEvaluation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockOpenAIService = {
    sendMessage: jest.fn(),
    parseJSONResponse: jest.fn(),
    validateEvaluationResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: OpenAIService,
          useValue: mockOpenAIService,
        },
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
    prismaService = module.get<PrismaService>(PrismaService);
    openaiService = module.get<OpenAIService>(OpenAIService);

    jest.clearAllMocks();
  });

  describe('evaluateQuestion', () => {
    it('should evaluate a question successfully', async () => {
      const mockInput = {
        questionId: 'q-1',
        questionText: 'What is a closure?',
        questionType: 'THEORY',
        difficulty: 'INTERMEDIATE',
        technology: 'JavaScript',
        answer: 'A closure is a function that has access to variables from its outer scope.',
      };

      const mockEvaluation = {
        id: 'eval-1',
        questionId: 'q-1',
        evaluationStatus: EvaluationStatus.PENDING,
      };

      const mockAIResponse = {
        overallScore: 80,
        scores: {
          technicalKnowledge: 85,
          architecture: 75,
          communication: 80,
          problemSolving: 80,
          codeQuality: 75,
        },
        strengths: ['Good explanation', 'Accurate understanding'],
        weaknesses: ['Could provide examples'],
        missedConcepts: [],
        idealAnswer: 'A closure is...',
        improvedAnswer: 'Your answer was good...',
        learningRecommendations: ['Practice more examples'],
        followUpQuestions: ['What about arrow functions?'],
      };

      mockPrismaService.interviewEvaluation.findUnique.mockResolvedValue(null);
      mockPrismaService.interviewEvaluation.create.mockResolvedValue(mockEvaluation);
      mockPrismaService.interviewEvaluation.update.mockResolvedValue({
        ...mockEvaluation,
        overallScore: 80,
        technicalScore: 85,
      });

      mockOpenAIService.sendMessage.mockResolvedValue(
        JSON.stringify(mockAIResponse),
      );
      mockOpenAIService.parseJSONResponse.mockReturnValue(mockAIResponse);
      mockOpenAIService.validateEvaluationResponse.mockReturnValue(
        mockAIResponse,
      );

      const result = await service.evaluateQuestion(mockInput);

      expect(result).toBeDefined();
      expect(result.overallScore).toBe(80);
      expect(result.technicalScore).toBe(85);
    });

    it('should handle existing evaluation', async () => {
      const mockInput = {
        questionId: 'q-1',
        questionText: 'What is a closure?',
        questionType: 'THEORY',
        difficulty: 'INTERMEDIATE',
        technology: 'JavaScript',
        answer: 'A closure is a function...',
      };

      const existingEvaluation = {
        id: 'eval-1',
        questionId: 'q-1',
        overallScore: 85,
        technicalScore: 88,
      };

      mockPrismaService.interviewEvaluation.findUnique.mockResolvedValue(
        existingEvaluation,
      );

      const result = await service.evaluateQuestion(mockInput);

      expect(result.overallScore).toBe(85);
      expect(mockPrismaService.interviewEvaluation.create).not.toHaveBeenCalled();
    });

    it('should fall back to a heuristic evaluation when OpenAI is unavailable', async () => {
      const mockInput = {
        questionId: 'q-1',
        questionText: 'What is a closure?',
        questionType: 'THEORY',
        difficulty: 'INTERMEDIATE',
        technology: 'JavaScript',
        answer: 'A closure is a function that retains access to its parent scope.',
      };

      mockPrismaService.interviewEvaluation.findUnique.mockResolvedValue(null);
      mockPrismaService.interviewEvaluation.create.mockResolvedValue({
        id: 'eval-1',
        questionId: 'q-1',
        evaluationStatus: EvaluationStatus.PENDING,
      });
      mockPrismaService.interviewEvaluation.update.mockResolvedValue({
        id: 'eval-1',
        questionId: 'q-1',
        evaluationStatus: EvaluationStatus.COMPLETED,
        overallScore: 72,
        technicalScore: 74,
        architectureScore: 69,
        communicationScore: 76,
        problemSolvingScore: 70,
        codeQualityScore: 73,
        strengths: 'Clear explanation\nGood reasoning',
        weaknesses: 'Could include a practical example',
        correctAnswer: 'A closure is a function that remembers variables from its lexical scope.',
        improvedAnswer: 'A closure allows a function to retain access to variables from its outer scope.',
        learningRecommendations: 'Practice with concrete examples\nReview scope behavior',
        aiResponseJson: {},
      });
      mockOpenAIService.sendMessage.mockRejectedValue(
        new Error('Missing credentials. Please pass an apiKey'),
      );

      const result = await service.evaluateQuestion(mockInput);

      expect(result.status).toBe('COMPLETED');
      expect(result.overallScore).toBeGreaterThan(0);
      expect(mockPrismaService.interviewEvaluation.update).toHaveBeenCalled();
    });
  });

  describe('evaluateInterview', () => {
    it('should evaluate all questions in an interview', async () => {
      const mockInterview = {
        id: 'interview-1',
        status: 'COMPLETED',
        difficulty: 'INTERMEDIATE',
        interviewType: 'TECHNICAL',
        questions: [
          {
            id: 'q-1',
            questionNumber: 1,
            questionText: 'Q1',
            questionType: 'THEORY',
            referenceAnswer: 'Answer 1',
            answer: {
              answerText: 'My answer 1',
              codeAnswer: null,
              timeTakenSeconds: 60,
            },
            evaluation: null,
          },
          {
            id: 'q-2',
            questionNumber: 2,
            questionText: 'Q2',
            questionType: 'CODING',
            referenceAnswer: 'Answer 2',
            answer: {
              answerText: null,
              codeAnswer: 'const x = 1;',
              timeTakenSeconds: 120,
            },
            evaluation: null,
          },
        ],
        technology: { name: 'JavaScript' },
        category: { name: 'Web Development' },
      };

      mockPrismaService.interview.findUnique.mockResolvedValue(mockInterview);
      mockPrismaService.interviewEvaluation.findMany.mockResolvedValue([]);

      // Mock evaluateQuestion to return a promise
      jest.spyOn(service, 'evaluateQuestion').mockResolvedValue({
        evaluationId: 'eval-1',
        status: 'COMPLETED',
        overallScore: 80,
      } as any);

      mockPrismaService.interviewEvaluation.findMany.mockResolvedValue([
        {
          id: 'eval-1',
          overallScore: 80,
          technicalScore: 85,
          architectureScore: 80,
          communicationScore: 75,
          problemSolvingScore: 80,
          codeQualityScore: 80,
        },
        {
          id: 'eval-2',
          overallScore: 75,
          technicalScore: 75,
          architectureScore: 75,
          communicationScore: 75,
          problemSolvingScore: 75,
          codeQualityScore: 75,
        },
      ]);

      mockPrismaService.interview.update.mockResolvedValue(mockInterview);

      const result = await service.evaluateInterview('interview-1');

      expect(result).toBeDefined();
      expect(result.evaluationId).toBe('interview-interview-1');
    });

    it('should include question-by-question feedback in the evaluation result', async () => {
      const mockInterview = {
        id: 'interview-1',
        status: 'COMPLETED',
        difficulty: 'INTERMEDIATE',
        interviewType: 'TECHNICAL',
        questions: [
          {
            id: 'q-1',
            questionNumber: 1,
            questionText: 'What is a closure?',
            questionType: 'THEORY',
            referenceAnswer: 'A closure retains access to parent scope.',
            answer: {
              answerText: 'A closure is a function that remembers its outer scope.',
              codeAnswer: null,
              timeTakenSeconds: 60,
            },
            evaluation: null,
          },
        ],
        technology: { name: 'JavaScript' },
        category: { name: 'Web Development' },
      };

      mockPrismaService.interview.findUnique.mockResolvedValue(mockInterview);
      mockPrismaService.interviewEvaluation.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'eval-1',
            questionId: 'q-1',
            evaluationStatus: EvaluationStatus.COMPLETED,
            overallScore: 82,
            technicalScore: 84,
            architectureScore: 78,
            communicationScore: 80,
            problemSolvingScore: 82,
            codeQualityScore: 80,
            strengths: 'Clear explanation\nUses relevant terminology',
            weaknesses: 'Could give a concrete example',
            learningRecommendations: 'Practice with examples',
            correctAnswer: 'A closure retains access to its lexical scope.',
            improvedAnswer: 'A stronger answer includes a practical example.',
            aiResponseJson: {},
          },
        ]);
      mockPrismaService.interview.update.mockResolvedValue(mockInterview);
      jest.spyOn(service, 'evaluateQuestion').mockResolvedValue({
        evaluationId: 'eval-1',
        status: 'COMPLETED',
        overallScore: 82,
      } as any);

      const result = await service.evaluateInterview('interview-1');

      expect(result.questions).toBeDefined();
      expect(result.questions).toHaveLength(1);
      expect(result.questions?.[0].questionText).toBe('What is a closure?');
      expect(result.questions?.[0].evaluation.strengths).toContain('Clear explanation');
    });

    it('should throw error when interview not found', async () => {
      mockPrismaService.interview.findUnique.mockResolvedValue(null);

      await expect(
        service.evaluateInterview('non-existent'),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when interview not completed', async () => {
      const mockInterview = {
        id: 'interview-1',
        status: 'IN_PROGRESS',
      };

      mockPrismaService.interview.findUnique.mockResolvedValue(mockInterview);

      await expect(
        service.evaluateInterview('interview-1'),
      ).rejects.toThrow();
    });
  });

  describe('getInterviewEvaluation', () => {
    it('should include question feedback when loading an interview evaluation', async () => {
      const mockInterview = {
        id: 'interview-1',
        questions: [
          {
            id: 'q-1',
            questionNumber: 1,
            questionText: 'What is a closure?',
            questionType: 'THEORY',
            answer: {
              answerText: 'A closure remembers its lexical scope.',
            },
          },
        ],
      };

      mockPrismaService.interview.findUnique.mockResolvedValue(mockInterview);
      mockPrismaService.interviewEvaluation.findMany.mockResolvedValue([
        {
          id: 'eval-1',
          questionId: 'q-1',
          evaluationStatus: EvaluationStatus.COMPLETED,
          overallScore: 84,
          strengths: 'Clear explanation\nUses relevant terminology',
          weaknesses: 'Could include a concrete example',
          learningRecommendations: 'Practice with examples',
          correctAnswer: 'A closure preserves access to its parent scope.',
          improvedAnswer: 'A stronger answer adds a concrete example.',
          aiResponseJson: {},
        },
      ]);

      const result = await service.getInterviewEvaluation('interview-1');

      expect(result.questions).toHaveLength(1);
      expect(result.questions?.[0].evaluation.strengths).toContain('Clear explanation');
    });
  });

  describe('getEvaluation', () => {
    it('should get evaluation for a question', async () => {
      const mockEvaluation = {
        id: 'eval-1',
        questionId: 'q-1',
        overallScore: 85,
        technicalScore: 88,
        architectureScore: 80,
      };

      mockPrismaService.interviewEvaluation.findUnique.mockResolvedValue(
        mockEvaluation,
      );

      const result = await service.getEvaluation('q-1');

      expect(result).toBeDefined();
      expect(result?.overallScore).toBe(85);
    });

    it('should return null when evaluation not found', async () => {
      mockPrismaService.interviewEvaluation.findUnique.mockResolvedValue(null);

      const result = await service.getEvaluation('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getEvaluationHistory', () => {
    it('should get evaluation history with pagination', async () => {
      const mockEvaluations = [
        {
          id: 'eval-1',
          overallScore: 85,
          createdAt: new Date(),
          question: {
            interview: {
              technology: { name: 'JavaScript' },
            },
          },
        },
      ];

      mockPrismaService.interviewEvaluation.findMany.mockResolvedValue(
        mockEvaluations,
      );
      mockPrismaService.interviewEvaluation.count.mockResolvedValue(1);

      const result = await service.getEvaluationHistory('user-1', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by technology', async () => {
      const mockEvaluations = [];

      mockPrismaService.interviewEvaluation.findMany.mockResolvedValue(
        mockEvaluations,
      );
      mockPrismaService.interviewEvaluation.count.mockResolvedValue(0);

      await service.getEvaluationHistory(
        'user-1',
        1,
        10,
        'JavaScript',
        undefined,
        undefined,
      );

      expect(
        mockPrismaService.interviewEvaluation.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            question: expect.objectContaining({
              interview: expect.objectContaining({
                technology: { name: 'JavaScript' },
              }),
            }),
          }),
        }),
      );
    });
  });
});
