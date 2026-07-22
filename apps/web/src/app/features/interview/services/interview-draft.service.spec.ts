import { TestBed } from '@angular/core/testing';
import { InterviewDraftService } from './interview-draft.service';

describe('InterviewDraftService', () => {
  let service: InterviewDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InterviewDraftService],
    });
    service = TestBed.inject(InterviewDraftService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveDraft and loadDraft', () => {
    it('should save and load a draft', () => {
      service.saveDraft('interview-1', 'question-1', 'My answer');
      const loaded = service.loadDraft('interview-1', 'question-1');
      expect(loaded).toBe('My answer');
    });

    it('should handle multiple drafts for same interview', () => {
      service.saveDraft('interview-1', 'question-1', 'Answer 1');
      service.saveDraft('interview-1', 'question-2', 'Answer 2');

      expect(service.loadDraft('interview-1', 'question-1')).toBe('Answer 1');
      expect(service.loadDraft('interview-1', 'question-2')).toBe('Answer 2');
    });

    it('should overwrite existing draft', () => {
      service.saveDraft('interview-1', 'question-1', 'First answer');
      service.saveDraft('interview-1', 'question-1', 'Updated answer');

      expect(service.loadDraft('interview-1', 'question-1')).toBe('Updated answer');
    });

    it('should return null for non-existent draft', () => {
      const result = service.loadDraft('interview-1', 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('hasDraft', () => {
    it('should check if draft exists', () => {
      expect(service.hasDraft('interview-1', 'question-1')).toBe(false);

      service.saveDraft('interview-1', 'question-1', 'Answer');

      expect(service.hasDraft('interview-1', 'question-1')).toBe(true);
    });
  });

  describe('getLastSaveTime', () => {
    it('should get last save time', () => {
      const before = new Date();
      service.saveDraft('interview-1', 'question-1', 'Answer');
      const after = new Date();

      const saveTime = service.getLastSaveTime('interview-1', 'question-1');
      expect(saveTime).not.toBeNull();
      expect(saveTime!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(saveTime!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should return null for non-existent draft', () => {
      expect(service.getLastSaveTime('interview-1', 'non-existent')).toBeNull();
    });
  });

  describe('clearDraft', () => {
    it('should clear a specific draft', () => {
      service.saveDraft('interview-1', 'question-1', 'Answer 1');
      service.saveDraft('interview-1', 'question-2', 'Answer 2');

      service.clearDraft('interview-1', 'question-1');

      expect(service.loadDraft('interview-1', 'question-1')).toBeNull();
      expect(service.loadDraft('interview-1', 'question-2')).toBe('Answer 2');
    });

    it('should handle clearing non-existent draft gracefully', () => {
      expect(() => service.clearDraft('interview-1', 'non-existent')).not.toThrow();
    });
  });

  describe('clearAllDrafts', () => {
    it('should clear all drafts for an interview', () => {
      service.saveDraft('interview-1', 'question-1', 'Answer 1');
      service.saveDraft('interview-1', 'question-2', 'Answer 2');
      service.saveDraft('interview-2', 'question-1', 'Answer 3');

      service.clearAllDrafts('interview-1');

      expect(service.loadDraft('interview-1', 'question-1')).toBeNull();
      expect(service.loadDraft('interview-1', 'question-2')).toBeNull();
      expect(service.loadDraft('interview-2', 'question-1')).toBe('Answer 3');
    });
  });

  describe('exportDrafts', () => {
    it('should export all drafts for an interview', () => {
      service.saveDraft('interview-1', 'question-1', 'Answer 1');
      service.saveDraft('interview-1', 'question-2', 'Answer 2');

      const exported = service.exportDrafts('interview-1');

      expect(Object.keys(exported).length).toBe(2);
      // The exported keys are question IDs extracted from the storage key
      expect(Object.keys(exported)).toContain('question-1');
      expect(Object.keys(exported)).toContain('question-2');
      expect(exported['question-1']).toBe('Answer 1');
      expect(exported['question-2']).toBe('Answer 2');
    });

    it('should return empty object for interview with no drafts', () => {
      const exported = service.exportDrafts('interview-1');
      expect(Object.keys(exported).length).toBe(0);
    });

    it('should not export drafts from other interviews', () => {
      service.saveDraft('interview-1', 'question-1', 'Answer 1');
      service.saveDraft('interview-2', 'question-1', 'Answer 2');

      const exported = service.exportDrafts('interview-1');

      expect(Object.keys(exported).length).toBe(1);
    });
  });

  describe('localStorage error handling', () => {
    it('should handle localStorage quota exceeded', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => service.saveDraft('interview-1', 'question-1', 'Answer')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should handle localStorage access denied', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Access denied');
      });

      const result = service.loadDraft('interview-1', 'question-1');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });
});
