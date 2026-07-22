export interface ResumeFile {
  id: string;
  userId: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  processingStatus: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  atsScore?: number;
  aiSummary?: string;
  uploadedAt: Date;
  processedAt?: Date;
  resumeAnalyses?: ResumeAnalysisSummary[];
}

export interface ResumeAnalysisSummary {
  id: string;
  overallScore: number;
  atsScore: number;
  experienceLevel: string;
  createdAt: Date;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  overallScore: number;
  atsScore: number;
  skillScore: number;
  experienceScore: number;
  formatScore: number;
  experienceLevel: ExperienceLevel;
  detectedSkills: string[];
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendations: string[];
  improvedSummary: string;
  summary: string;
  createdAt: Date;
}

export interface ResumeReport {
  resume: {
    id: string;
    originalFilename: string;
    processingStatus: string;
    uploadedAt: Date;
  };
  analysis: ResumeAnalysis | null;
}

export interface JobMatchRequest {
  resumeId: string;
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
}

export interface SkillGap {
  critical: string[];
  optional: string[];
}

export interface JobMatchResult {
  id: string;
  resumeId: string;
  jobDescriptionId: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillGap: SkillGap;
  recommendations: string[];
  interviewPreparationTips: string[];
  overallAssessment?: string;
  experienceGap?: string;
  jobDescription: {
    id: string;
    jobTitle: string;
    companyName?: string;
  };
  createdAt: Date;
}

export type ExperienceLevel = 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';

export function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#3b82f6';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Average';
  return 'Needs Work';
}
