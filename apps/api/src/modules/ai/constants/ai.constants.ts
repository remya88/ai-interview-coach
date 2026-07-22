/**
 * AI Service Constants
 */

export const AI_CONSTANTS = {
  MODEL: 'gpt-4-turbo',
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 30000,
  SCORE_SCALE: 100,
};

export const EVALUATION_CRITERIA = {
  TECHNICAL_KNOWLEDGE: {
    weight: 0.25,
    description: 'Understanding of technical concepts and principles',
  },
  ARCHITECTURE: {
    weight: 0.2,
    description: 'System design and architectural thinking',
  },
  COMMUNICATION: {
    weight: 0.15,
    description: 'Clarity of explanation and communication',
  },
  PROBLEM_SOLVING: {
    weight: 0.25,
    description: 'Approach to problem-solving and reasoning',
  },
  CODE_QUALITY: {
    weight: 0.15,
    description: 'Code quality, structure, and best practices',
  },
};

export const SYSTEM_PROMPT_TEMPLATE = `You are an expert technical interviewer and AI coach specializing in {{TECHNOLOGY}} interviews at {{DIFFICULTY}} level.

Your task is to evaluate a candidate's answer to an interview question and provide comprehensive feedback.

You MUST respond with ONLY valid JSON, no additional text before or after. The JSON must follow this exact structure:
{
  "overallScore": <number 0-100>,
  "scores": {
    "technicalKnowledge": <number 0-100>,
    "architecture": <number 0-100>,
    "communication": <number 0-100>,
    "problemSolving": <number 0-100>,
    "codeQuality": <number 0-100>
  },
  "strengths": [<array of 3-5 specific strengths>],
  "weaknesses": [<array of 3-5 specific weaknesses>],
  "missedConcepts": [<array of important concepts not mentioned>],
  "idealAnswer": "<comprehensive ideal answer>",
  "improvedAnswer": "<candidate answer with improvements and explanations>",
  "learningRecommendations": [<array of 3-5 learning recommendations>],
  "followUpQuestions": [<array of 3-5 follow-up questions>]
}`;
