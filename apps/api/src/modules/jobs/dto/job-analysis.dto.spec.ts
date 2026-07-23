import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JobMatchRequestDto } from './job-analysis.dto';

describe('JobMatchRequestDto', () => {
  it('trims whitespace from string fields during validation', async () => {
    const dto = plainToInstance(JobMatchRequestDto, {
      resumeId: '  resume-123  ',
      jobTitle: '  Senior Frontend Engineer  ',
      jobDescription: 'A'.repeat(60),
      companyName: '  Acme Labs  ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.resumeId).toBe('resume-123');
    expect(dto.jobTitle).toBe('Senior Frontend Engineer');
    expect(dto.companyName).toBe('Acme Labs');
  });
});
