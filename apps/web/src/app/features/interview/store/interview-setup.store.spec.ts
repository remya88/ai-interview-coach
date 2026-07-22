import { TestBed } from '@angular/core/testing';
import { InterviewSetupStore } from './interview-setup.store';
import { DifficultyLevel, InterviewType } from '@prisma/client';

describe('InterviewSetupStore', () => {
  let store: InterviewSetupStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InterviewSetupStore],
    });
    store = TestBed.inject(InterviewSetupStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have initial default values', () => {
      expect(store.technologyId()).toBeNull();
      expect(store.categoryId()).toBeNull();
      expect(store.difficulty()).toBeNull();
      expect(store.interviewType()).toBeNull();
      expect(store.questionCount()).toBe(5);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should be invalid initially', () => {
      expect(store.isValid()).toBe(false);
    });
  });

  describe('setTechnology', () => {
    it('should update technology', () => {
      store.setTechnology('tech-1');
      expect(store.technologyId()).toBe('tech-1');
    });

    it('should clear technology', () => {
      store.setTechnology('tech-1');
      store.setTechnology(null);
      expect(store.technologyId()).toBeNull();
    });
  });

  describe('setCategory', () => {
    it('should update category', () => {
      store.setCategory('cat-1');
      expect(store.categoryId()).toBe('cat-1');
    });
  });

  describe('setDifficulty', () => {
    it('should update difficulty', () => {
      store.setDifficulty('INTERMEDIATE' as DifficultyLevel);
      expect(store.difficulty()).toBe('INTERMEDIATE');
    });
  });

  describe('setInterviewType', () => {
    it('should update interview type', () => {
      store.setInterviewType('TECHNICAL' as InterviewType);
      expect(store.interviewType()).toBe('TECHNICAL');
    });
  });

  describe('setQuestionCount', () => {
    it('should update question count', () => {
      store.setQuestionCount(15);
      expect(store.questionCount()).toBe(15);
    });

    it('should enforce minimum of 1', () => {
      store.setQuestionCount(0);
      expect(store.questionCount()).toBe(1);
    });

    it('should enforce maximum of 20', () => {
      store.setQuestionCount(25);
      expect(store.questionCount()).toBe(20);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);
      store.setLoading(false);
      expect(store.loading()).toBe(false);
    });
  });

  describe('setError', () => {
    it('should update error message', () => {
      store.setError('Test error');
      expect(store.error()).toBe('Test error');
    });

    it('should clear error', () => {
      store.setError('Test error');
      store.setError(null);
      expect(store.error()).toBeNull();
    });
  });

  describe('config', () => {
    it('should return config when all fields valid', () => {
      store.setTechnology('tech-1');
      store.setCategory('cat-1');
      store.setDifficulty('INTERMEDIATE' as DifficultyLevel);
      store.setInterviewType('TECHNICAL' as InterviewType);
      store.setQuestionCount(10);

      const config = store.config();
      expect(config.technologyId).toBe('tech-1');
      expect(config.categoryId).toBe('cat-1');
      expect(config.difficulty).toBe('INTERMEDIATE');
      expect(config.interviewType).toBe('TECHNICAL');
      expect(config.questionCount).toBe(10);
    });
  });

  describe('isValid', () => {
    it('should be invalid with missing fields', () => {
      store.setTechnology('tech-1');
      expect(store.isValid()).toBe(false);
    });

    it('should be valid with all fields', () => {
      store.setTechnology('tech-1');
      store.setCategory('cat-1');
      store.setDifficulty('INTERMEDIATE' as DifficultyLevel);
      store.setInterviewType('TECHNICAL' as InterviewType);
      store.setQuestionCount(10);

      expect(store.isValid()).toBe(true);
    });

    it('should be invalid if any field is null', () => {
      store.setTechnology('tech-1');
      store.setCategory('cat-1');
      store.setDifficulty('INTERMEDIATE' as DifficultyLevel);
      store.setInterviewType('TECHNICAL' as InterviewType);
      expect(store.isValid()).toBe(true);

      store.setCategory(null);
      expect(store.isValid()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      store.setTechnology('tech-1');
      store.setCategory('cat-1');
      store.setDifficulty('INTERMEDIATE' as DifficultyLevel);
      store.setInterviewType('TECHNICAL' as InterviewType);
      store.setQuestionCount(15);
      store.setLoading(true);
      store.setError('Test error');

      store.reset();

      expect(store.technologyId()).toBeNull();
      expect(store.categoryId()).toBeNull();
      expect(store.difficulty()).toBeNull();
      expect(store.interviewType()).toBeNull();
      expect(store.questionCount()).toBe(5);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });
});
