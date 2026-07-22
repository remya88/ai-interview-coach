import { Injectable, signal, computed } from '@angular/core';
import {
  EvaluationFeedback,
  InterviewEvaluation,
  EVALUATION_STATUS_LABELS,
} from '../models/evaluation.model';

interface EvaluationState {
  currentEvaluation: InterviewEvaluation | null;
  questionEvaluations: Map<string, EvaluationFeedback>;
  loading: boolean;
  error: string | null;
  processingProgress: number; // 0-100
}

const initialState: EvaluationState = {
  currentEvaluation: null,
  questionEvaluations: new Map(),
  loading: false,
  error: null,
  processingProgress: 0,
};

@Injectable({
  providedIn: 'root',
})
export class EvaluationStore {
  // State
  private state = signal<EvaluationState>(initialState);

  // Selectors
  currentEvaluation = computed(() => this.state().currentEvaluation);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  processingProgress = computed(() => this.state().processingProgress);

  // Computed selectors
  overallScore = computed(() =>
    this.state().currentEvaluation?.overallScore || 0,
  );

  averageScores = computed(() =>
    this.state().currentEvaluation?.averageScores || {
      technicalKnowledge: 0,
      architecture: 0,
      communication: 0,
      problemSolving: 0,
      codeQuality: 0,
    },
  );

  questionsEvaluated = computed(
    () => this.state().currentEvaluation?.questionsEvaluated || 0,
  );

  totalQuestions = computed(
    () => this.state().currentEvaluation?.totalQuestions || 0,
  );

  evaluationStatus = computed(
    () =>
      EVALUATION_STATUS_LABELS[
        this.state().currentEvaluation?.status || 'PENDING'
      ],
  );

  isProcessing = computed(
    () =>
      this.state().currentEvaluation?.status === 'PROCESSING' ||
      this.state().loading,
  );

  isCompleted = computed(
    () => this.state().currentEvaluation?.status === 'COMPLETED',
  );

  isFailed = computed(
    () => this.state().currentEvaluation?.status === 'FAILED',
  );

  strengths = computed(() => {
    const questions = this.state().currentEvaluation?.questions;
    if (Array.isArray(questions) && questions.length > 0) {
      return questions.flatMap(q => q.evaluation?.strengths ?? []).slice(0, 5);
    }

    const topLevelStrengths = this.state().currentEvaluation?.strengths;
    return Array.isArray(topLevelStrengths) ? topLevelStrengths.slice(0, 5) : [];
  });

  weaknesses = computed(() => {
    const questions = this.state().currentEvaluation?.questions;
    if (Array.isArray(questions) && questions.length > 0) {
      return questions.flatMap(q => q.evaluation?.weaknesses ?? []).slice(0, 5);
    }

    const topLevelWeaknesses = this.state().currentEvaluation?.weaknesses;
    return Array.isArray(topLevelWeaknesses) ? topLevelWeaknesses.slice(0, 5) : [];
  });

  // Mutations
  setCurrentEvaluation(evaluation: InterviewEvaluation) {
    this.state.update(s => ({
      ...s,
      currentEvaluation: evaluation,
    }));
  }

  setQuestionEvaluation(
    questionId: string,
    evaluation: EvaluationFeedback,
  ) {
    this.state.update(s => {
      const newMap = new Map(s.questionEvaluations);
      newMap.set(questionId, evaluation);
      return {
        ...s,
        questionEvaluations: newMap,
      };
    });
  }

  setLoading(loading: boolean) {
    this.state.update(s => ({
      ...s,
      loading,
    }));
  }

  setError(error: string | null) {
    this.state.update(s => ({
      ...s,
      error,
    }));
  }

  setProcessingProgress(progress: number) {
    this.state.update(s => ({
      ...s,
      processingProgress: Math.max(0, Math.min(100, progress)),
    }));
  }

  updateEvaluationStatus(
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
  ) {
    this.state.update(s => {
      if (!s.currentEvaluation) return s;
      return {
        ...s,
        currentEvaluation: {
          ...s.currentEvaluation,
          status,
        },
      };
    });
  }

  clearEvaluation() {
    this.state.set(initialState);
  }

  reset() {
    this.clearEvaluation();
  }
}
