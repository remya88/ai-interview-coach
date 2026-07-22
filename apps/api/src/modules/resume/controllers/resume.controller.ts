import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ResumeService } from '../services/resume.service';
import { RESUME_CONSTANTS, RESUME_MESSAGES } from '../constants/resume.constants';

@Controller('resume')
@ApiTags('Resume')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * POST /api/resume/upload
   */
  @Post('upload')
  @ApiOperation({ summary: 'Upload a resume (PDF or DOCX)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Resume uploaded successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: RESUME_CONSTANTS.MAX_FILE_SIZE },
      fileFilter: (_, file, cb) => {
        if (RESUME_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
          cb(null, true);
        } else {
          cb(new HttpException(RESUME_MESSAGES.INVALID_FILE_TYPE, HttpStatus.BAD_REQUEST), false);
        }
      },
    }),
  )
  async uploadResume(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: RESUME_CONSTANTS.MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /(pdf|docx|vnd.openxmlformats)/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.resumeService.uploadResume(req.user.id, file);
  }

  /**
   * GET /api/resume
   */
  @Get()
  @ApiOperation({ summary: 'Get all resumes for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user resumes' })
  async getResumes(@Request() req: any) {
    return this.resumeService.getUserResumes(req.user.id);
  }

  /**
   * GET /api/resume/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific resume by ID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async getResume(@Request() req: any, @Param('id') id: string) {
    return this.resumeService.getResumeById(id, req.user.id);
  }

  /**
   * POST /api/resume/:id/analyze
   */
  @Post(':id/analyze')
  @ApiOperation({ summary: 'Trigger AI analysis for a resume' })
  @ApiResponse({ status: 200, description: 'Analysis result' })
  async analyzeResume(@Request() req: any, @Param('id') id: string) {
    return this.resumeService.analyzeResume(id, req.user.id);
  }

  /**
   * GET /api/resume/:id/report
   */
  @Get(':id/report')
  @ApiOperation({ summary: 'Get the full analysis report for a resume' })
  @ApiResponse({ status: 200, description: 'Resume analysis report' })
  async getReport(@Request() req: any, @Param('id') id: string) {
    return this.resumeService.getResumeReport(id, req.user.id);
  }
}
