import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../app/prisma.service';

export type AIFeature = 'INTERVIEW_EVALUATION' | 'RESUME_ANALYSIS' | 'JOB_MATCHING' | 'QUESTION_GENERATION';

@Injectable()
export class AIUsageLogService {
  private readonly logger = new Logger(AIUsageLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logUsage(params: {
    userId?: string;
    feature: AIFeature;
    model: string;
    tokensUsed: number;
    requestDuration?: number;
    status?: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId: params.userId,
          feature: params.feature as any,
          model: params.model,
          tokensUsed: params.tokensUsed,
          requestDuration: params.requestDuration,
          status: params.status ?? 'SUCCESS',
          errorMessage: params.errorMessage,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log AI usage:', error);
    }
  }

  async logError(params: {
    service: string;
    errorMessage: string;
    stackTrace?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    context?: object;
  }): Promise<void> {
    try {
      await this.prisma.systemErrorLog.create({
        data: {
          service: params.service,
          errorMessage: params.errorMessage,
          stackTrace: params.stackTrace,
          severity: (params.severity ?? 'MEDIUM') as any,
          context: params.context as any,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log system error:', error);
    }
  }
}
