import { Injectable } from '@angular/core';

interface Draft {
  text: string;
  savedAt: string;
}

@Injectable({ providedIn: 'root' })
export class InterviewDraftService {
  private readonly storagePrefix = 'interview_draft_';

  /**
   * Save a draft answer for a specific question
   */
  saveDraft(interviewId: string, questionId: string, text: string): void {
    const key = this.getDraftKey(interviewId, questionId);
    const draft: Draft = {
      text,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(draft));
      localStorage.setItem(`${key}_lastSave`, Date.now().toString());
    } catch (e) {
      console.warn('Failed to save draft to localStorage', e);
    }
  }

  /**
   * Load a draft answer for a specific question
   */
  loadDraft(interviewId: string, questionId: string): string | null {
    const key = this.getDraftKey(interviewId, questionId);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const draft: Draft = JSON.parse(stored);
        return draft.text;
      }
    } catch (e) {
      console.warn('Failed to load draft from localStorage', e);
    }
    return null;
  }

  /**
   * Get the timestamp of when a draft was last saved
   */
  getLastSaveTime(interviewId: string, questionId: string): Date | null {
    const key = this.getDraftKey(interviewId, questionId);
    try {
      const timeStr = localStorage.getItem(`${key}_lastSave`);
      if (timeStr) {
        return new Date(parseInt(timeStr, 10));
      }
    } catch (e) {
      console.warn('Failed to get draft timestamp', e);
    }
    return null;
  }

  /**
   * Check if a draft exists
   */
  hasDraft(interviewId: string, questionId: string): boolean {
    return this.loadDraft(interviewId, questionId) !== null;
  }

  /**
   * Clear draft for a specific question
   */
  clearDraft(interviewId: string, questionId: string): void {
    const key = this.getDraftKey(interviewId, questionId);
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_lastSave`);
    } catch (e) {
      console.warn('Failed to clear draft', e);
    }
  }

  /**
   * Clear all drafts for an interview
   */
  clearAllDrafts(interviewId: string): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.storagePrefix}${interviewId}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Failed to clear all drafts', e);
    }
  }

  /**
   * Export all drafts for an interview
   */
  exportDrafts(interviewId: string): { [questionId: string]: string } {
    const drafts: { [questionId: string]: string } = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.storagePrefix}${interviewId}`)) {
          const stored = localStorage.getItem(key);
          if (stored && !key.endsWith('_lastSave')) {
            const draft: Draft = JSON.parse(stored);
            const questionId = key.replace(`${this.storagePrefix}${interviewId}_`, '');
            drafts[questionId] = draft.text;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to export drafts', e);
    }
    return drafts;
  }

  private getDraftKey(interviewId: string, questionId: string): string {
    return `${this.storagePrefix}${interviewId}_${questionId}`;
  }
}
