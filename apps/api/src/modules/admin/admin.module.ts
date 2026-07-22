import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../shared/prisma.module';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AIUsageLogService } from './services/ai-usage-log.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, AIUsageLogService],
  exports: [AIUsageLogService],
})
export class AdminModule {}
