import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InterviewService } from '../services/interview.service';

@ApiTags('interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InterviewReferenceController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get('technologies')
  @ApiOperation({ summary: 'Get available technologies for interview setup' })
  @ApiResponse({ status: 200, description: 'List of active technologies' })
  getTechnologies() {
    return this.interviewService.getTechnologies();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get available categories for interview setup' })
  @ApiResponse({ status: 200, description: 'List of active categories' })
  getCategories() {
    return this.interviewService.getCategories();
  }
}
