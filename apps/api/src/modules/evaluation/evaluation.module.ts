import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/prisma.module';
import { AIModule } from '../ai/ai.module';
import { EvaluationService } from './services/evaluation.service';
import { EvaluationController } from './controllers/evaluation.controller';

@Module({
  imports: [AIModule, PrismaModule],
  providers: [EvaluationService],
  controllers: [EvaluationController],
  exports: [EvaluationService],
})
export class EvaluationModule {}
