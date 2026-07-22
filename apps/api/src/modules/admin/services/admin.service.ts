import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../app/prisma.service';
import { ADMIN_CONSTANTS } from '../constants/admin.constants';
import {
  AdminUserListQueryDto,
  AdminInterviewQueryDto,
  UpdateAIConfigDto,
  CreateAIConfigDto,
} from '../dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────

  async getDashboard() {
    const [
      totalUsers,
      activeUsers,
      totalInterviews,
      completedInterviews,
      totalResumes,
      totalAIRequests,
      recentErrors,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.interview.count({ where: { deletedAt: null } }),
      this.prisma.interview.count({ where: { status: 'COMPLETED', deletedAt: null } }),
      this.prisma.resume.count({ where: { deletedAt: null } }),
      this.prisma.aIUsageLog.count(),
      this.prisma.systemErrorLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          severity: { in: ['HIGH', 'CRITICAL'] },
        },
      }),
    ]);

    const scoreAggregate = await this.prisma.interview.aggregate({
      _avg: { overallScore: true },
      where: { status: 'COMPLETED', overallScore: { not: null } },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await this.prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
    });

    return {
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      totalInterviews,
      completedInterviews,
      completionRate: totalInterviews > 0
        ? Math.round((completedInterviews / totalInterviews) * 100)
        : 0,
      averageScore: Math.round(scoreAggregate._avg.overallScore ?? 0),
      totalResumes,
      totalAIRequests,
      criticalErrorsLast24h: recentErrors,
    };
  }

  // ─── User Management ─────────────────────────────────────────────────────

  async getUsers(query: AdminUserListQueryDto) {
    const page = query.page ?? ADMIN_CONSTANTS.DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? ADMIN_CONSTANTS.DEFAULT_LIMIT, ADMIN_CONSTANTS.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { interviews: true, resumes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getUserDetail(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        profile: true,
        interviews: {
          select: { id: true, status: true, overallScore: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        resumes: {
          select: { id: true, originalFilename: true, processingStatus: true, uploadedAt: true },
          orderBy: { uploadedAt: 'desc' },
          take: 5,
        },
        aiUsageLogs: {
          select: { feature: true, tokensUsed: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { interviews: true, resumes: true, aiUsageLogs: true } },
      },
    });
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, isActive: true, role: true },
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, email: true, role: true, isActive: true },
    });
  }

  // ─── Interview Management ─────────────────────────────────────────────────

  async getInterviews(query: AdminInterviewQueryDto) {
    const page = query.page ?? ADMIN_CONSTANTS.DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? ADMIN_CONSTANTS.DEFAULT_LIMIT, ADMIN_CONSTANTS.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.technology) {
      where.technology = { name: { contains: query.technology, mode: 'insensitive' } };
    }
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          technology: { select: { name: true } },
          category: { select: { name: true } },
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      data: interviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ─── AI Usage ─────────────────────────────────────────────────────────────

  async getAIUsage(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      total,
      byFeature,
      dailyUsage,
      tokenAggregate,
    ] = await Promise.all([
      this.prisma.aIUsageLog.count({ where: { createdAt: { gte: since } } }),
      this.prisma.aIUsageLog.groupBy({
        by: ['feature'],
        _count: { id: true },
        _sum: { tokensUsed: true },
        where: { createdAt: { gte: since } },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.aIUsageLog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        _sum: { tokensUsed: true },
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.aIUsageLog.aggregate({
        _sum: { tokensUsed: true },
        where: { createdAt: { gte: since } },
      }),
    ]);

    const totalTokens = tokenAggregate._sum.tokensUsed ?? 0;
    const estimatedCost = (totalTokens / 1000) * ADMIN_CONSTANTS.AI_COST_PER_1K_TOKENS;

    const mostUsedFeature = byFeature[0]?.feature ?? 'N/A';

    return {
      totalRequests: total,
      totalTokens,
      estimatedCostUsd: Math.round(estimatedCost * 10000) / 10000,
      mostUsedFeature,
      byFeature: byFeature.map((f: any) => ({
        feature: f.feature,
        requests: f._count.id,
        tokens: f._sum.tokensUsed ?? 0,
      })),
      dailyUsage: dailyUsage.map((d: any) => ({
        date: d.createdAt,
        requests: d._count.id,
        tokens: d._sum.tokensUsed ?? 0,
      })),
    };
  }

  // ─── AI Configuration ─────────────────────────────────────────────────────

  async getAIConfigurations() {
    return this.prisma.aIConfiguration.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getActiveAIConfig() {
    return this.prisma.aIConfiguration.findFirst({ where: { isActive: true } });
  }

  async createAIConfig(dto: CreateAIConfigDto) {
    return this.prisma.aIConfiguration.create({
      data: {
        modelName: dto.modelName,
        temperature: dto.temperature ?? 0.3,
        maxTokens: dto.maxTokens ?? 2000,
        description: dto.description,
        isActive: false,
      },
    });
  }

  async activateAIConfig(id: string) {
    // Deactivate all, then activate selected
    await this.prisma.aIConfiguration.updateMany({ data: { isActive: false } });
    return this.prisma.aIConfiguration.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async updateAIConfig(id: string, dto: UpdateAIConfigDto) {
    return this.prisma.aIConfiguration.update({
      where: { id },
      data: {
        ...(dto.modelName && { modelName: dto.modelName }),
        ...(dto.temperature !== undefined && { temperature: dto.temperature }),
        ...(dto.maxTokens && { maxTokens: dto.maxTokens }),
        ...(dto.systemPromptVersion && { systemPromptVersion: dto.systemPromptVersion }),
      },
    });
  }

  // ─── Technologies Management ───────────────────────────────────────────────

  async getTechnologies() {
    return this.prisma.technology.findMany({
      include: { _count: { select: { interviews: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createTechnology(data: { name: string; slug: string; description?: string; icon?: string; color?: string }) {
    return this.prisma.technology.create({ data: { ...data, isActive: true } });
  }

  async updateTechnology(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return this.prisma.technology.update({ where: { id }, data });
  }

  async deleteTechnology(id: string) {
    return this.prisma.technology.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Categories Management ────────────────────────────────────────────────

  async getCategories() {
    return this.prisma.interviewCategory.findMany({
      include: { _count: { select: { interviews: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: { name: string; slug: string; description?: string }) {
    return this.prisma.interviewCategory.create({ data: { ...data, isActive: true } });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return this.prisma.interviewCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.interviewCategory.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Error Logs ───────────────────────────────────────────────────────────

  async getErrorLogs(severity?: string, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const where: any = { createdAt: { gte: since } };
    if (severity) where.severity = severity;

    return this.prisma.systemErrorLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
