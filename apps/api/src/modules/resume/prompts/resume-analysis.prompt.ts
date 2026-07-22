export const RESUME_ANALYSIS_PROMPT = (resumeText: string): string => `
You are an expert resume analyst and career advisor with 15+ years of experience in technical recruiting.

Analyze the following resume and provide a comprehensive evaluation.

RESUME:
${resumeText}

Return ONLY valid JSON matching this exact structure:

{
  "overallScore": 0-100,
  "atsScore": 0-100,
  "skillScore": 0-100,
  "experienceScore": 0-100,
  "formatScore": 0-100,
  "experienceLevel": "JUNIOR" | "MID_LEVEL" | "SENIOR" | "LEAD" | "PRINCIPAL",
  "detectedSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "improvedSummary": "An improved professional summary for this candidate",
  "summary": "Brief 2-3 sentence analysis of this resume"
}

Scoring Guidelines:
- overallScore: Holistic resume quality
- atsScore: How well the resume passes Applicant Tracking Systems (keywords, formatting, structure)
- skillScore: Depth and relevance of technical skills
- experienceScore: Relevance and quality of work experience
- formatScore: Clarity, readability, and professional presentation

Be specific, actionable, and constructive in your feedback.
Return ONLY the JSON object. No markdown, no explanation.
`;

export const SKILL_EXTRACTION_PROMPT = (resumeText: string): string => `
Extract all technical skills from this resume. Return a JSON array of skill names only.

RESUME:
${resumeText}

Return ONLY: ["skill1", "skill2", "skill3"]
No markdown, no explanation, just the JSON array.
`;
