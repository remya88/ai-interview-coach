export const JOB_MATCH_PROMPT = (
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  companyName?: string,
): string => `
You are an expert technical recruiter and career coach with 15+ years of experience.

Analyze the match between this candidate's resume and the job description.

JOB POSITION: ${jobTitle}${companyName ? ` at ${companyName}` : ''}

JOB DESCRIPTION:
${jobDescription.substring(0, 3000)}

CANDIDATE RESUME:
${resumeText.substring(0, 4000)}

Return ONLY valid JSON matching this exact structure:

{
  "matchPercentage": 0-100,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "skillGap": {
    "critical": ["must-have missing skills"],
    "optional": ["nice-to-have missing skills"]
  },
  "recommendations": [
    "Specific action the candidate should take to improve their match"
  ],
  "interviewPreparationTips": [
    "Topic or question the candidate should prepare for"
  ],
  "experienceGap": "Brief description of experience alignment or gap",
  "overallAssessment": "2-3 sentence holistic assessment"
}

Be specific and actionable. Focus on technical skills, experience level, and domain knowledge.
Return ONLY the JSON object. No markdown, no explanation.
`;
