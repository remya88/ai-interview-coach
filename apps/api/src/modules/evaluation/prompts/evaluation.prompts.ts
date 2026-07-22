/**
 * Technical evaluation prompt template
 */
export const technicalEvaluationPrompt = `You are evaluating a technical interview question. The candidate provided an answer that needs evaluation based on technical correctness, depth of understanding, and clarity.

Question: {{QUESTION}}
Candidate's Answer: {{ANSWER}}
Expected Concepts: {{EXPECTED_CONCEPTS}}
Interview Type: {{INTERVIEW_TYPE}}
Difficulty Level: {{DIFFICULTY}}

Evaluate the answer and provide structured feedback in JSON format with the following fields:
- overallScore (0-100)
- scores object with technicalKnowledge, architecture, communication, problemSolving, codeQuality (each 0-100)
- strengths (array of 3-5 specific strengths)
- weaknesses (array of 3-5 specific weaknesses)
- missedConcepts (array of important concepts not mentioned)
- idealAnswer (comprehensive ideal answer)
- improvedAnswer (candidate answer with improvements and explanations)
- learningRecommendations (array of 3-5 learning recommendations)
- followUpQuestions (array of 3-5 follow-up questions)`;

/**
 * Coding evaluation prompt template
 */
export const codingEvaluationPrompt = `You are evaluating a coding interview answer. The candidate provided code that needs evaluation based on correctness, efficiency, code quality, and problem-solving approach.

Question: {{QUESTION}}
Candidate's Code: {{ANSWER}}
Expected Time Complexity: {{EXPECTED_COMPLEXITY}}
Interview Type: {{INTERVIEW_TYPE}}
Difficulty Level: {{DIFFICULTY}}

Evaluate the code and provide structured feedback in JSON format. Focus on:
- Correctness of the solution
- Algorithm efficiency
- Code quality and readability
- Edge case handling
- Best practices adherence

Provide the feedback with these JSON fields:
- overallScore (0-100)
- scores object with technicalKnowledge, architecture, communication, problemSolving, codeQuality (each 0-100)
- strengths (array of 3-5 specific strengths)
- weaknesses (array of 3-5 specific weaknesses)
- missedConcepts (array of important concepts not mentioned)
- idealAnswer (optimal solution with explanation)
- improvedAnswer (candidate code with improvements and inline comments)
- learningRecommendations (array of 3-5 learning recommendations)
- followUpQuestions (array of 3-5 follow-up questions)`;

/**
 * System design evaluation prompt template
 */
export const systemDesignEvaluationPrompt = `You are evaluating a system design interview answer. The candidate provided a design that needs evaluation based on scalability, architectural decisions, trade-offs, and completeness.

Question: {{QUESTION}}
Candidate's Answer: {{ANSWER}}
Scale/Requirements: {{REQUIREMENTS}}
Interview Type: {{INTERVIEW_TYPE}}
Difficulty Level: {{DIFFICULTY}}

Evaluate the design and provide structured feedback in JSON format. Focus on:
- Understanding of requirements
- Architecture soundness
- Scalability considerations
- Technology choices and justifications
- Trade-offs discussion
- Completeness of the design

Provide the feedback with these JSON fields:
- overallScore (0-100)
- scores object with technicalKnowledge, architecture, communication, problemSolving, codeQuality (each 0-100)
- strengths (array of 3-5 specific strengths)
- weaknesses (array of 3-5 specific weaknesses)
- missedConcepts (array of important design patterns or considerations not mentioned)
- idealAnswer (comprehensive ideal design approach)
- improvedAnswer (candidate answer with improvements and additional considerations)
- learningRecommendations (array of 3-5 learning recommendations)
- followUpQuestions (array of 3-5 follow-up questions)`;

/**
 * Behavioral evaluation prompt template
 */
export const behavioralEvaluationPrompt = `You are evaluating a behavioral interview answer. The candidate provided a response to a behavioral question that needs evaluation based on clarity, leadership qualities, problem-solving approach, and communication.

Question: {{QUESTION}}
Candidate's Answer: {{ANSWER}}
Interview Type: {{INTERVIEW_TYPE}}
Difficulty Level: {{DIFFICULTY}}

Evaluate the answer and provide structured feedback in JSON format. Focus on:
- Clarity and structure of the response
- Leadership and initiative demonstrated
- Conflict resolution ability
- Learning from experiences
- Communication effectiveness

Provide the feedback with these JSON fields:
- overallScore (0-100)
- scores object with technicalKnowledge, architecture, communication, problemSolving, codeQuality (each 0-100)
- strengths (array of 3-5 specific strengths)
- weaknesses (array of 3-5 specific weaknesses)
- missedConcepts (array of important soft skills or leadership qualities not demonstrated)
- idealAnswer (example of an ideal response)
- improvedAnswer (candidate answer with improvements for clarity and impact)
- learningRecommendations (array of 3-5 learning recommendations)
- followUpQuestions (array of 3-5 follow-up questions)`;

/**
 * Get evaluation prompt based on question type
 */
export function getEvaluationPrompt(questionType: string): string {
  const type = questionType.toUpperCase();

  switch (type) {
    case 'CODING':
    case 'DEBUGGING':
      return codingEvaluationPrompt;
    case 'ARCHITECTURE':
    case 'SCENARIO':
      return systemDesignEvaluationPrompt;
    case 'BEHAVIORAL':
      return behavioralEvaluationPrompt;
    case 'THEORY':
    default:
      return technicalEvaluationPrompt;
  }
}

/**
 * Replace placeholders in prompt template
 */
export function renderPrompt(
  template: string,
  data: Record<string, string | undefined>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key.toUpperCase()}}}`;
    result = result.replace(placeholder, value || '');
  }
  return result;
}
