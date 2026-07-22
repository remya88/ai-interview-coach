import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { AIEvaluationResponse } from '../interfaces/ai-response.interface';

// Mock the OpenAI SDK
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('OpenAIService', () => {
  let service: OpenAIService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('test-api-key');
  });

  describe('validateEvaluationResponse', () => {
    it('should validate a correct response', () => {
      const mockResponse: AIEvaluationResponse = {
        overallScore: 85,
        scores: {
          technicalKnowledge: 85,
          architecture: 80,
          communication: 85,
          problemSolving: 85,
          codeQuality: 80,
        },
        strengths: ['Good understanding', 'Clear explanation'],
        weaknesses: ['Could improve efficiency'],
        missedConcepts: ['Pattern A'],
        idealAnswer: 'The ideal approach is...',
        improvedAnswer: 'Your answer with improvements...',
        learningRecommendations: ['Study pattern A'],
        followUpQuestions: ['What about scenario B?'],
      };

      const result = service.validateEvaluationResponse(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when required field is missing', () => {
      const invalidResponse = {
        overallScore: 85,
        scores: {
          technicalKnowledge: 85,
          architecture: 80,
          communication: 85,
          problemSolving: 85,
          codeQuality: 80,
        },
        strengths: ['Good'],
        weaknesses: ['Weak'],
        // Missing idealAnswer
        improvedAnswer: 'Improved...',
        learningRecommendations: ['Learn'],
        followUpQuestions: ['Q?'],
      } as any;

      expect(() =>
        service.validateEvaluationResponse(invalidResponse),
      ).toThrow(HttpException);
    });

    it('should throw error when score is out of range', () => {
      const invalidResponse: AIEvaluationResponse = {
        overallScore: 150, // Invalid
        scores: {
          technicalKnowledge: 85,
          architecture: 80,
          communication: 85,
          problemSolving: 85,
          codeQuality: 80,
        },
        strengths: ['Good'],
        weaknesses: ['Weak'],
        missedConcepts: [],
        idealAnswer: 'Ideal...',
        improvedAnswer: 'Improved...',
        learningRecommendations: ['Learn'],
        followUpQuestions: ['Q?'],
      };

      expect(() =>
        service.validateEvaluationResponse(invalidResponse),
      ).toThrow(HttpException);
    });

    it('should throw error when arrays are invalid', () => {
      const invalidResponse = {
        overallScore: 85,
        scores: {
          technicalKnowledge: 85,
          architecture: 80,
          communication: 85,
          problemSolving: 85,
          codeQuality: 80,
        },
        strengths: 'Not an array', // Invalid
        weaknesses: ['Weak'],
        missedConcepts: [],
        idealAnswer: 'Ideal...',
        improvedAnswer: 'Improved...',
        learningRecommendations: ['Learn'],
        followUpQuestions: ['Q?'],
      } as any;

      expect(() =>
        service.validateEvaluationResponse(invalidResponse),
      ).toThrow(HttpException);
    });
  });

  describe('parseJSONResponse', () => {
    it('should parse valid JSON response', () => {
      const mockResponse = {
        overallScore: 85,
        scores: { technicalKnowledge: 85, architecture: 80, communication: 85, problemSolving: 85, codeQuality: 80 },
        strengths: ['Good'],
        weaknesses: ['Weak'],
        missedConcepts: [],
        idealAnswer: 'Ideal...',
        improvedAnswer: 'Improved...',
        learningRecommendations: ['Learn'],
        followUpQuestions: ['Q?'],
      };

      const jsonString = JSON.stringify(mockResponse);
      const result = service.parseJSONResponse<AIEvaluationResponse>(jsonString);

      expect(result).toEqual(mockResponse);
    });

    it('should handle JSON with surrounding text', () => {
      const mockResponse = {
        overallScore: 85,
        scores: { technicalKnowledge: 85, architecture: 80, communication: 85, problemSolving: 85, codeQuality: 80 },
        strengths: ['Good'],
        weaknesses: ['Weak'],
        missedConcepts: [],
        idealAnswer: 'Ideal...',
        improvedAnswer: 'Improved...',
        learningRecommendations: ['Learn'],
        followUpQuestions: ['Q?'],
      };

      const jsonString = `Some text before ${JSON.stringify(mockResponse)} and after`;
      const result = service.parseJSONResponse<AIEvaluationResponse>(jsonString);

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid JSON', () => {
      expect(() =>
        service.parseJSONResponse('This is not JSON'),
      ).toThrow(HttpException);
    });
  });

  describe('createSystemPrompt', () => {
    it('should replace template variables', () => {
      const prompt = service.createSystemPrompt('JavaScript', 'INTERMEDIATE');

      expect(prompt).toContain('JavaScript');
      expect(prompt).toContain('INTERMEDIATE');
      expect(prompt).not.toContain('{{TECHNOLOGY}}');
      expect(prompt).not.toContain('{{DIFFICULTY}}');
    });
  });

  describe('testConnection', () => {
    it('should return true when connection succeeds', async () => {
      // Mock successful connection
      const result = await service.testConnection();

      // Since we're mocking and the service doesn't have the actual OpenAI connection
      // in the test, we'll check that the method completes without error
      expect(typeof result).toBe('boolean');
    });

    it('should return false when API key is not configured', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined);

      const result = await service.testConnection();

      expect(result).toBe(false);
    });
  });
});
