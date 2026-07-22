import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../../app/prisma.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrisma = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    interview: {
      count: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    resume: { count: jest.fn() },
    aIUsageLog: {
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    systemErrorLog: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    aIConfiguration: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    technology: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    interviewCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboard', () => {
    it('should return dashboard metrics', async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(100)   // total
        .mockResolvedValueOnce(80)    // active
        .mockResolvedValueOnce(5);    // new this week
      mockPrisma.interview.count
        .mockResolvedValueOnce(500)   // total
        .mockResolvedValueOnce(400);  // completed
      mockPrisma.resume.count.mockResolvedValue(50);
      mockPrisma.aIUsageLog.count.mockResolvedValue(1000);
      mockPrisma.systemErrorLog.count.mockResolvedValue(2);
      mockPrisma.interview.aggregate.mockResolvedValue({ _avg: { overallScore: 78 } });

      const result = await service.getDashboard();

      expect(result.totalUsers).toBe(100);
      expect(result.activeUsers).toBe(80);
      expect(result.totalInterviews).toBe(500);
      expect(result.completedInterviews).toBe(400);
      expect(result.totalResumes).toBe(50);
      expect(result.totalAIRequests).toBe(1000);
      expect(result.criticalErrorsLast24h).toBe(2);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [{ id: 'u-1', email: 'test@test.com', _count: { interviews: 5 } }];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by role', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getUsers({ role: 'ADMIN' });

      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where.role).toBe('ADMIN');
    });

    it('should search by email/name', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getUsers({ search: 'john' });

      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
    });
  });

  describe('updateUserStatus', () => {
    it('should deactivate a user', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u-1', isActive: false });

      const result = await service.updateUserStatus('u-1', false);
      expect(result.isActive).toBe(false);
    });
  });

  describe('updateUserRole', () => {
    it('should promote user to admin', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u-1', role: 'ADMIN' });

      const result = await service.updateUserRole('u-1', 'ADMIN');
      expect(result.role).toBe('ADMIN');
    });
  });

  describe('getAIUsage', () => {
    it('should return AI usage statistics', async () => {
      mockPrisma.aIUsageLog.count.mockResolvedValue(100);
      mockPrisma.aIUsageLog.groupBy
        .mockResolvedValueOnce([{ feature: 'RESUME_ANALYSIS', _count: { id: 50 }, _sum: { tokensUsed: 25000 } }])
        .mockResolvedValueOnce([]);
      mockPrisma.aIUsageLog.aggregate.mockResolvedValue({ _sum: { tokensUsed: 50000 } });

      const result = await service.getAIUsage(30);

      expect(result.totalRequests).toBe(100);
      expect(result.totalTokens).toBe(50000);
      expect(result.byFeature[0].feature).toBe('RESUME_ANALYSIS');
    });
  });

  describe('AI Configuration', () => {
    it('should return configurations', async () => {
      mockPrisma.aIConfiguration.findMany.mockResolvedValue([
        { id: 'c-1', modelName: 'gpt-4o-mini', isActive: true },
      ]);

      const result = await service.getAIConfigurations();
      expect(result[0].modelName).toBe('gpt-4o-mini');
    });

    it('should activate a configuration', async () => {
      mockPrisma.aIConfiguration.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.aIConfiguration.update.mockResolvedValue({ id: 'c-1', isActive: true });

      const result = await service.activateAIConfig('c-1');
      expect(result.isActive).toBe(true);
      expect(mockPrisma.aIConfiguration.updateMany).toHaveBeenCalled();
    });
  });
});
