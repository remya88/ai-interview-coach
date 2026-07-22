export interface JobMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillGap: {
    critical: string[];
    optional: string[];
  };
  recommendations: string[];
  interviewPreparationTips: string[];
  experienceGap: string;
  overallAssessment: string;
}
