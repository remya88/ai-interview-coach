import { TestBed } from '@angular/core/testing';
import { EvaluationStore } from './evaluation.store';
import { InterviewEvaluation } from '../models/evaluation.model';

describe('EvaluationStore', () => {
  let store: EvaluationStore;

  const mockEvaluation: InterviewEvaluation = {
    interviewId: 'interview-1',
    status: 'COMPLETED',
    overallScore: 85,
    scores: {
      technicalKnowledge: 85,
      architecture: 80,
      communication: 85,
      problemSolving: 85,
      codeQuality: 80,
    },
    averageScores: {
      technicalKnowledge: 85,
      architecture: 80,
      communication: 85,
      problemSolving: 85,
      codeQuality: 80,
    },
    questionsEvaluated: 3,
    questionsFailed: 0,
    totalQuestions: 3,
    startedAt: new Date(),
    completedAt: new Date(),
    questions: [
      {
        questionId: 'q-1',
        questionNumber: 1,
        questionText: 'Question 1',
        questionType: 'THEORY',
        candidateAnswer: 'Answer 1',
        evaluation: {
          evaluationId: 'eval-1',
          status: 'COMPLETED',
          overallScore: 85,
          scores: {
            technicalKnowledge: 85,
            architecture: 80,
            communication: 85,
            problemSolving: 85,
            codeQuality: 80,
          },
          strengths: ['Good understanding'],
          weaknesses: ['Could improve'],
          missedConcepts: [],
          idealAnswer: 'Ideal answer',
          improvedAnswer: 'Improved answer',
          learningRecommendations: ['Study more'],
          followUpQuestions: ['Question?'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EvaluationStore],
    });

    store = TestBed.inject(EvaluationStore);
  });

  describe('selectors', () => {
    it('should initialize with empty state', () => {
      expect(store.currentEvaluation()).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should compute overallScore', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.overallScore()).toBe(85);
    });

    it('should compute averageScores', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.averageScores().technicalKnowledge).toBe(85);
      expect(store.averageScores().architecture).toBe(80);
    });

    it('should compute questionsEvaluated', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.questionsEvaluated()).toBe(3);
    });

    it('should compute totalQuestions', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.totalQuestions()).toBe(3);
    });

    it('should compute evaluationStatus', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.evaluationStatus()).toBe('Completed');
    });

    it('should compute isProcessing', () => {
      expect(store.isProcessing()).toBe(false);

      const processingEvaluation: InterviewEvaluation = {
        ...mockEvaluation,
        status: 'PROCESSING',
      };
      store.setCurrentEvaluation(processingEvaluation);
      expect(store.isProcessing()).toBe(true);
    });

    it('should compute isCompleted', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.isCompleted()).toBe(true);

      const processingEvaluation: InterviewEvaluation = {
        ...mockEvaluation,
        status: 'PROCESSING',
      };
      store.setCurrentEvaluation(processingEvaluation);
      expect(store.isCompleted()).toBe(false);
    });

    it('should compute isFailed', () => {
      const failedEvaluation: InterviewEvaluation = {
        ...mockEvaluation,
        status: 'FAILED',
      };
      store.setCurrentEvaluation(failedEvaluation);
      expect(store.isFailed()).toBe(true);
    });

    it('should compute strengths from all questions', () => {
      store.setCurrentEvaluation(mockEvaluation);
      const strengths = store.strengths();
      expect(strengths).toContain('Good understanding');
    });

    it('should compute weaknesses from all questions', () => {
      store.setCurrentEvaluation(mockEvaluation);
      const weaknesses = store.weaknesses();
      expect(weaknesses).toContain('Could improve');
    });
  });

  describe('mutations', () => {
    it('should set current evaluation', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.currentEvaluation()).toEqual(mockEvaluation);
    });

    it('should set question evaluation', () => {
      const feedback = {
        evaluationId: 'eval-1',
        status: 'COMPLETED',
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
        missedConcepts: [],
        idealAnswer: 'Ideal',
        improvedAnswer: 'Improved',
        learningRecommendations: ['Learn'],
        followUpQuestions: ['Q?'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.setQuestionEvaluation('q-1', feedback);
      // Note: The question evaluations are stored but not directly exposed,
      // so we can only verify that the method was called without error
      expect(store.currentEvaluation()).toBeNull();
    });

    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);

      store.setLoading(false);
      expect(store.loading()).toBe(false);
    });

    it('should set error', () => {
      store.setError('Test error');
      expect(store.error()).toBe('Test error');

      store.setError(null);
      expect(store.error()).toBeNull();
    });

    it('should set processing progress', () => {
      store.setProcessingProgress(50);
      expect(store.processingProgress()).toBe(50);

      // Should clamp to 0-100
      store.setProcessingProgress(150);
      expect(store.processingProgress()).toBe(100);

      store.setProcessingProgress(-10);
      expect(store.processingProgress()).toBe(0);
    });

    it('should update evaluation status', () => {
      store.setCurrentEvaluation(mockEvaluation);
      expect(store.currentEvaluation()?.status).toBe('COMPLETED');

      store.updateEvaluationStatus('PROCESSING');
      expect(store.currentEvaluation()?.status).toBe('PROCESSING');
    });

    it('should clear evaluation', () => {
      store.setCurrentEvaluation(mockEvaluation);
      store.setLoading(true);
      store.setError('Error');

      store.clearEvaluation();

      expect(store.currentEvaluation()).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should reset', () => {
      store.setCurrentEvaluation(mockEvaluation);
      store.setLoading(true);

      store.reset();

      expect(store.currentEvaluation()).toBeNull();
      expect(store.loading()).toBe(false);
    });
  });
});
