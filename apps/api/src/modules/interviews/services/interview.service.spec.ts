import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InterviewStatus, DifficultyLevel, InterviewType } from '@prisma/client';
import { InterviewService } from './interview.service';
import { PrismaService } from '../../../app/prisma.service';

const mockInterview = {
  id: 'interview-1',
  userId: 'user-1',
  technologyId: 'tech-1',
  categoryId: 'cat-1',
  difficulty: DifficultyLevel.INTERMEDIATE,
  interviewType: InterviewType.TECHNICAL,
  status: InterviewStatus.CREATED,
  questionCount: 3,
  startedAt: null,
  completedAt: null,
  durationMinutes: null,
  overallScore: null,
  aiModel: 'gpt-4o',
  promptVersion: '1.0',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [],
};

const mockPrisma = {
  technology: { findUnique: jest.fn() },
  interviewCategory: { findUnique: jest.fn() },
  interview: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  interviewSession: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  interviewQuestion: {
    findFirst: jest.fn(),
    createMany: jest.fn(),
  },
  interviewAnswer: { upsert: jest.fn() },
  skillScore: { findMany: jest.fn() },
  $transaction: jest.fn(),
};

describe('InterviewService', () => {
  let service: InterviewService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
  });

  // ── createInterview ───────────────────────────────────────────────────────

  describe('createInterview', () => {
    it('creates and returns a new interview', async () => {
      mockPrisma.technology.findUnique.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.interviewCategory.findUnique.mockResolvedValue({ id: 'cat-1' });
      mockPrisma.interview.create.mockResolvedValue({ ...mockInterview, technology: {}, category: {} });

      const result = await service.createInterview('user-1', {
        technologyId: 'tech-1',
        categoryId: 'cat-1',
        difficulty: DifficultyLevel.INTERMEDIATE,
        interviewType: InterviewType.TECHNICAL,
        questionCount: 3,
      });

      expect(mockPrisma.interview.create).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when technology is not found', async () => {
      mockPrisma.technology.findUnique.mockResolvedValue(null);
      mockPrisma.interviewCategory.findUnique.mockResolvedValue({ id: 'cat-1' });

      await expect(
        service.createInterview('user-1', {
          technologyId: 'missing',
          categoryId: 'cat-1',
          difficulty: DifficultyLevel.INTERMEDIATE,
          interviewType: InterviewType.TECHNICAL,
          questionCount: 3,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when category is not found', async () => {
      mockPrisma.technology.findUnique.mockResolvedValue({ id: 'tech-1' });
      mockPrisma.interviewCategory.findUnique.mockResolvedValue(null);

      await expect(
        service.createInterview('user-1', {
          technologyId: 'tech-1',
          categoryId: 'missing',
          difficulty: DifficultyLevel.INTERMEDIATE,
          interviewType: InterviewType.TECHNICAL,
          questionCount: 3,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── startInterview ────────────────────────────────────────────────────────

  describe('startInterview', () => {
    it('starts an interview and creates a session', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);
      mockPrisma.interviewSession.findUnique.mockResolvedValue(null);
      mockPrisma.interviewQuestion.createMany.mockResolvedValue({ count: 3 });
      mockPrisma.$transaction.mockResolvedValue([
        { ...mockInterview, status: InterviewStatus.IN_PROGRESS, startedAt: new Date() },
        { id: 'session-1', sessionToken: 'token-1', interviewId: 'interview-1', currentQuestion: 1, startedAt: new Date() },
      ]);

      const result = await service.startInterview('user-1', 'interview-1');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result.sessionId).toBe('session-1');
    });

    it('throws ConflictException if active session already exists', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);
      mockPrisma.interviewSession.findUnique.mockResolvedValue({ completed: false });

      await expect(service.startInterview('user-1', 'interview-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws BadRequestException for a completed interview', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue({
        ...mockInterview,
        status: InterviewStatus.COMPLETED,
      });

      await expect(service.startInterview('user-1', 'interview-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── submitAnswer ──────────────────────────────────────────────────────────

  describe('submitAnswer', () => {
    it('saves an answer and advances the session', async () => {
      const inProgress = { ...mockInterview, status: InterviewStatus.IN_PROGRESS };
      mockPrisma.interview.findFirst.mockResolvedValue(inProgress);
      mockPrisma.interviewQuestion.findFirst.mockResolvedValue({ id: 'q-1', interviewId: 'interview-1' });
      mockPrisma.interviewAnswer.upsert.mockResolvedValue({ id: 'ans-1', answerText: 'My answer' });
      mockPrisma.interviewSession.findUnique.mockResolvedValue({ currentQuestion: 1 });
      mockPrisma.interviewSession.update.mockResolvedValue({});

      const result = await service.submitAnswer('user-1', 'interview-1', 'q-1', {
        answerText: 'My answer',
      });

      expect(mockPrisma.interviewAnswer.upsert).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it('throws BadRequestException when interview is not in progress', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview); // CREATED

      await expect(
        service.submitAnswer('user-1', 'interview-1', 'q-1', { answerText: 'answer' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── completeInterview ─────────────────────────────────────────────────────

  describe('completeInterview', () => {
    it('marks interview as completed', async () => {
      const inProgress = {
        ...mockInterview,
        status: InterviewStatus.IN_PROGRESS,
        startedAt: new Date(Date.now() - 1800000),
      };
      mockPrisma.interview.findFirst.mockResolvedValue(inProgress);
      mockPrisma.$transaction.mockResolvedValue([
        { id: 'interview-1', status: InterviewStatus.COMPLETED, completedAt: new Date(), durationMinutes: 30 },
        {},
      ]);

      const result = await service.completeInterview('user-1', 'interview-1');

      expect(result.status).toBe(InterviewStatus.COMPLETED);
    });

    it('throws BadRequestException for already-completed interview', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue({
        ...mockInterview,
        status: InterviewStatus.COMPLETED,
      });

      await expect(service.completeInterview('user-1', 'interview-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── Authorization ─────────────────────────────────────────────────────────

  describe('authorization', () => {
    it('throws ForbiddenException when user does not own the interview', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue({ ...mockInterview, userId: 'other-user' });

      await expect(service.startInterview('user-1', 'interview-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
