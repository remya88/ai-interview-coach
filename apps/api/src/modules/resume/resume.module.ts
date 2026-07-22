import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../shared/prisma.module';
import { ResumeController } from './controllers/resume.controller';
import { ResumeService } from './services/resume.service';
import { ResumeParserService } from './parsers/resume-parser.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, AIModule, PrismaModule],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeParserService],
  exports: [ResumeService, ResumeParserService],
})
export class ResumeModule {}
