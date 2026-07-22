import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Application health check' })
  check() {
    return {
      status: 'ok',
      application: 'AI Interview Coach API',
      timestamp: new Date().toISOString(),
    };
  }
}
