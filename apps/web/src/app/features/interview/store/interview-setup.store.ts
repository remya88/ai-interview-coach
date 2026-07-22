import { Injectable, signal, computed } from '@angular/core';
import { DifficultyLevel, InterviewType } from '@prisma/client';
import { InterviewSetupConfig } from '../models/interview.model';

interface InterviewSetupState {
  technologyId: string | null;
  categoryId: string | null;
  difficulty: DifficultyLevel | null;
  interviewType: InterviewType | null;
  questionCount: number;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class InterviewSetupStore {
  private readonly state = signal<InterviewSetupState>({
    technologyId: null,
    categoryId: null,
    difficulty: null,
    interviewType: null,
    questionCount: 5,
    loading: false,
    error: null,
  });

  // Selectors
  readonly technologyId = computed(() => this.state().technologyId);
  readonly categoryId = computed(() => this.state().categoryId);
  readonly difficulty = computed(() => this.state().difficulty);
  readonly interviewType = computed(() => this.state().interviewType);
  readonly questionCount = computed(() => this.state().questionCount);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly isValid = computed(() => {
    const s = this.state();
    return !!(s.technologyId && s.categoryId && s.difficulty && s.interviewType && s.questionCount);
  });

  readonly config = computed(() => {
    const s = this.state();
    return {
      technologyId: s.technologyId!,
      categoryId: s.categoryId!,
      difficulty: s.difficulty!,
      interviewType: s.interviewType!,
      questionCount: s.questionCount,
    } as InterviewSetupConfig;
  });

  // Mutations
  setTechnology(id: string | null) {
    this.state.update(s => ({ ...s, technologyId: id }));
  }

  setCategory(id: string | null) {
    this.state.update(s => ({ ...s, categoryId: id }));
  }

  setDifficulty(difficulty: DifficultyLevel | null) {
    this.state.update(s => ({ ...s, difficulty }));
  }

  setInterviewType(type: InterviewType | null) {
    this.state.update(s => ({ ...s, interviewType: type }));
  }

  setQuestionCount(count: number) {
    this.state.update(s => ({ ...s, questionCount: Math.max(1, Math.min(20, count)) }));
  }

  setLoading(loading: boolean) {
    this.state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null) {
    this.state.update(s => ({ ...s, error }));
  }

  reset() {
    this.state.set({
      technologyId: null,
      categoryId: null,
      difficulty: null,
      interviewType: null,
      questionCount: 5,
      loading: false,
      error: null,
    });
  }
}
