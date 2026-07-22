import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminService } from '../services/admin.service';
import {
  AdminUserListQueryDto,
  AdminInterviewQueryDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  CreateTechnologyDto,
  UpdateTechnologyDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateAIConfigDto,
  CreateAIConfigDto,
} from '../dto/admin.dto';

@Controller('admin')
@ApiTags('Admin')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ─── User Management ─────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users with pagination and filters' })
  getUsers(@Query() query: AdminUserListQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get detailed user profile' })
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, dto.isActive);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role (USER / ADMIN)' })
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  // ─── Interview Management ─────────────────────────────────────────────────

  @Get('interviews')
  @ApiOperation({ summary: 'List all interviews with filters' })
  getInterviews(@Query() query: AdminInterviewQueryDto) {
    return this.adminService.getInterviews(query);
  }

  // ─── AI Usage Monitoring ──────────────────────────────────────────────────

  @Get('ai-usage')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  getAIUsage(@Query('days') days?: string) {
    return this.adminService.getAIUsage(days ? parseInt(days) : 30);
  }

  // ─── AI Configuration ─────────────────────────────────────────────────────

  @Get('ai-config')
  @ApiOperation({ summary: 'List all AI configurations' })
  getAIConfigs() {
    return this.adminService.getAIConfigurations();
  }

  @Post('ai-config')
  @ApiOperation({ summary: 'Create a new AI configuration' })
  createAIConfig(@Body() dto: CreateAIConfigDto) {
    return this.adminService.createAIConfig(dto);
  }

  @Patch('ai-config/:id/activate')
  @ApiOperation({ summary: 'Set an AI configuration as active' })
  activateAIConfig(@Param('id') id: string) {
    return this.adminService.activateAIConfig(id);
  }

  @Patch('ai-config/:id')
  @ApiOperation({ summary: 'Update an AI configuration' })
  updateAIConfig(@Param('id') id: string, @Body() dto: UpdateAIConfigDto) {
    return this.adminService.updateAIConfig(id, dto);
  }

  // ─── Technologies ─────────────────────────────────────────────────────────

  @Get('technologies')
  @ApiOperation({ summary: 'List all technologies' })
  getTechnologies() {
    return this.adminService.getTechnologies();
  }

  @Post('technologies')
  @ApiOperation({ summary: 'Create a new technology' })
  createTechnology(@Body() dto: CreateTechnologyDto) {
    return this.adminService.createTechnology(dto);
  }

  @Patch('technologies/:id')
  @ApiOperation({ summary: 'Update a technology' })
  updateTechnology(@Param('id') id: string, @Body() dto: UpdateTechnologyDto) {
    return this.adminService.updateTechnology(id, dto);
  }

  @Delete('technologies/:id')
  @ApiOperation({ summary: 'Soft-delete (deactivate) a technology' })
  deleteTechnology(@Param('id') id: string) {
    return this.adminService.deleteTechnology(id);
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'List all interview categories' })
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new interview category' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update an interview category' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Soft-delete (deactivate) a category' })
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Error Logs ───────────────────────────────────────────────────────────

  @Get('errors')
  @ApiOperation({ summary: 'Get system error logs' })
  getErrors(
    @Query('severity') severity?: string,
    @Query('days') days?: string,
  ) {
    return this.adminService.getErrorLogs(severity, days ? parseInt(days) : 7);
  }
}
