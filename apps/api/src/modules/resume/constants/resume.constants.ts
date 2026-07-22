export const RESUME_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx'],
  UPLOAD_DIR: 'uploads/resumes',

  SCORE_THRESHOLDS: {
    EXCELLENT: 85,
    GOOD: 70,
    AVERAGE: 55,
    POOR: 40,
  },

  AI_MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.3,
} as const;

export const RESUME_MESSAGES = {
  UPLOAD_SUCCESS: 'Resume uploaded successfully',
  ANALYSIS_STARTED: 'Resume analysis started',
  ANALYSIS_COMPLETE: 'Resume analysis complete',
  NOT_FOUND: 'Resume not found',
  FORBIDDEN: 'Access denied to this resume',
  INVALID_FILE_TYPE: 'Only PDF and DOCX files are allowed',
  FILE_TOO_LARGE: 'File size must not exceed 5 MB',
  PARSE_FAILED: 'Failed to extract text from resume',
  AI_ANALYSIS_FAILED: 'AI analysis failed. Please try again.',
} as const;
