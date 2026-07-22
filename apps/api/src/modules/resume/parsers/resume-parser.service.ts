import { Injectable, Logger } from '@nestjs/common';
// pdf-parse exports a CJS module; use require for compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';
import { ParsedResume } from '../interfaces/resume.interface';

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  async parseFile(
    buffer: Buffer,
    mimeType: string,
  ): Promise<ParsedResume> {
    let rawText = '';

    try {
      if (mimeType === 'application/pdf') {
        rawText = await this.parsePdf(buffer);
      } else if (
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        rawText = await this.parseDocx(buffer);
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      this.logger.error('Failed to parse resume file:', error);
      throw error;
    }

    return this.extractStructuredData(rawText);
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async parseDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  private extractStructuredData(rawText: string): ParsedResume {
    return {
      rawText,
      email: this.extractEmail(rawText),
      phone: this.extractPhone(rawText),
      skills: this.extractSkills(rawText),
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };
  }

  private extractEmail(text: string): string | undefined {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match?.[0];
  }

  private extractPhone(text: string): string | undefined {
    const match = text.match(
      /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/,
    );
    return match?.[0];
  }

  private extractSkills(text: string): string[] {
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'NestJS', 'Express',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
      'Git', 'CI/CD', 'REST', 'GraphQL', 'gRPC',
      'HTML', 'CSS', 'SCSS', 'Tailwind',
      'Jest', 'Cypress', 'Playwright',
      'Prisma', 'TypeORM', 'Sequelize',
      'Microservices', 'Event-Driven', 'CQRS', 'DDD',
      'Agile', 'Scrum', 'Kanban',
    ];

    const found = skillKeywords.filter((skill) =>
      new RegExp(`\\b${skill}\\b`, 'i').test(text),
    );

    return [...new Set(found)];
  }
}
