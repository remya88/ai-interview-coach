import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { InterviewController } from './controllers/interview.controller';
import { InterviewReferenceController } from './controllers/interview-reference.controller';
import { InterviewService } from './services/interview.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [InterviewController, InterviewReferenceController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewsModule {}
