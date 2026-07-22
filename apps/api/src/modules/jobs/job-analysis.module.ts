import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../shared/prisma.module';
import { JobAnalysisController } from './controllers/job-analysis.controller';
import { JobAnalysisService } from './services/job-analysis.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, AIModule, PrismaModule],
  controllers: [JobAnalysisController],
  providers: [JobAnalysisService],
  exports: [JobAnalysisService],
})
export class JobAnalysisModule {}
