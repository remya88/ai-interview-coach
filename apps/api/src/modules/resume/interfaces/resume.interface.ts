export interface ParsedResume {
  rawText: string;
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  summary?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  graduationYear?: string;
}

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
}

export interface ResumeAnalysisResult {
  overallScore: number;
  atsScore: number;
  skillScore: number;
  experienceScore: number;
  formatScore: number;
  experienceLevel: string;
  detectedSkills: string[];
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendations: string[];
  improvedSummary: string;
  summary: string;
}

export interface ResumeAnalysisResponse {
  id: string;
  resumeId: string;
  userId: string;
  overallScore: number;
  atsScore: number;
  skillScore: number;
  experienceScore: number;
  formatScore: number;
  experienceLevel: string;
  detectedSkills: string[];
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendations: string[];
  improvedSummary: string;
  summary: string;
  createdAt: Date;
}
