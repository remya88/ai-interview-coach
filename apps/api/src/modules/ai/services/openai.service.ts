import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AI_CONSTANTS, SYSTEM_PROMPT_TEMPLATE } from '../constants/ai.constants';
import {
  AIEvaluationResponse,
  OpenAIMessage,
} from '../interfaces/ai-response.interface';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI | null = null;
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!this.apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured. AI features will not work.',
      );
    }
  }

  private getOpenAIClient(): OpenAI {
    if (!this.openai && this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
    return this.openai!;
  }

  /**
   * Send a message to OpenAI and get a structured response
   */
  async sendMessage(
    messages: OpenAIMessage[],
    systemPrompt: string,
    retryCount = 0,
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new HttpException(
          'OpenAI API key is not configured',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const response = await this.getOpenAIClient().chat.completions.create({
        model: AI_CONSTANTS.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: AI_CONSTANTS.MAX_TOKENS,
        temperature: AI_CONSTANTS.TEMPERATURE,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new HttpException(
          'No response from OpenAI',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return content;
    } catch (error) {
      this.logger.error(
        `OpenAI API error (attempt ${retryCount + 1}):`,
        error,
      );

      // Retry logic for transient errors
      if (retryCount < AI_CONSTANTS.MAX_RETRIES) {
        const delay = AI_CONSTANTS.RETRY_DELAY_MS * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendMessage(messages, systemPrompt, retryCount + 1);
      }

      if (error instanceof OpenAI.APIError) {
        throw new HttpException(
          `OpenAI API error: ${error.message}`,
          error.status || HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(
        'Failed to process AI request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Parse and validate JSON response from OpenAI
   */
  parseJSONResponse<T>(content: string): T {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
      this.logger.error('Failed to parse JSON response:', error);
      throw new HttpException(
        'Invalid response format from AI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Validate evaluation response structure
   */
  validateEvaluationResponse(
    response: AIEvaluationResponse,
  ): AIEvaluationResponse {
    // Validate required fields
    const requiredFields: (keyof AIEvaluationResponse)[] = [
      'overallScore',
      'scores',
      'strengths',
      'weaknesses',
      'missedConcepts',
      'idealAnswer',
      'improvedAnswer',
      'learningRecommendations',
      'followUpQuestions',
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new HttpException(
          `Missing required field: ${field}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // Validate scores
    const scores = response.scores;
    const scoreFields: (keyof typeof scores)[] = [
      'technicalKnowledge',
      'architecture',
      'communication',
      'problemSolving',
      'codeQuality',
    ];

    for (const field of scoreFields) {
      const score = scores[field];
      if (typeof score !== 'number' || score < 0 || score > 100) {
        throw new HttpException(
          `Invalid score for ${field}: ${score}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // Validate overall score
    if (
      typeof response.overallScore !== 'number' ||
      response.overallScore < 0 ||
      response.overallScore > 100
    ) {
      throw new HttpException(
        `Invalid overall score: ${response.overallScore}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Validate arrays
    if (
      !Array.isArray(response.strengths) ||
      !Array.isArray(response.weaknesses) ||
      !Array.isArray(response.missedConcepts) ||
      !Array.isArray(response.learningRecommendations) ||
      !Array.isArray(response.followUpQuestions)
    ) {
      throw new HttpException(
        'Invalid response arrays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Validate strings
    if (
      typeof response.idealAnswer !== 'string' ||
      typeof response.improvedAnswer !== 'string'
    ) {
      throw new HttpException(
        'Invalid answer strings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return response;
  }

  /**
   * Create system prompt with substitutions
   */
  createSystemPrompt(technology: string, difficulty: string): string {
    return SYSTEM_PROMPT_TEMPLATE.replace('{{TECHNOLOGY}}', technology).replace(
      '{{DIFFICULTY}}',
      difficulty,
    );
  }

  /**
   * Test OpenAI connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }
      const response = await this.openai.models.retrieve('gpt-4-turbo');
      return !!response;
    } catch (error) {
      this.logger.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}
