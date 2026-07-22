import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PrismaModule } from '../modules/shared/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { InterviewsModule } from '../modules/interviews/interviews.module';
import { QuestionsModule } from '../modules/questions/questions.module';
import { AIModule } from '../modules/ai/ai.module';
import { EvaluationModule } from '../modules/evaluation/evaluation.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { ResumeModule } from '../modules/resume/resume.module';
import { JobAnalysisModule } from '../modules/jobs/job-analysis.module';
import { AdminModule } from '../modules/admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    InterviewsModule,
    QuestionsModule,
    AIModule,
    EvaluationModule,
    AnalyticsModule,
    ResumeModule,
    JobAnalysisModule,
    AdminModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
