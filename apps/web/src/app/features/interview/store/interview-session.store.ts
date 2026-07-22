import { Injectable, signal, computed } from '@angular/core';
import { InterviewQuestion, InterviewAnswer, TimerState } from '../models/interview-session.model';

interface SessionState {
  interviewId: string | null;
  sessionId: string | null;
  currentQuestion: InterviewQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  answers: Map<string, InterviewAnswer>;
  currentAnswer: string;
  submitted: boolean;
  loading: boolean;
  error: string | null;
  timerState: TimerState;
  status: 'INIT' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ERROR';
}

@Injectable({ providedIn: 'root' })
export class InterviewSessionStore {
  private readonly state = signal<SessionState>({
    interviewId: null,
    sessionId: null,
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,
    answers: new Map(),
    currentAnswer: '',
    submitted: false,
    loading: false,
    error: null,
    timerState: {
      totalSeconds: 0,
      remainingSeconds: 0,
      isRunning: false,
      isPaused: false,
    },
    status: 'INIT',
  });

  // Selectors
  readonly interviewId = computed(() => this.state().interviewId);
  readonly sessionId = computed(() => this.state().sessionId);
  readonly currentQuestion = computed(() => this.state().currentQuestion);
  readonly questionNumber = computed(() => this.state().questionNumber);
  readonly totalQuestions = computed(() => this.state().totalQuestions);
  readonly currentAnswer = computed(() => this.state().currentAnswer);
  readonly submitted = computed(() => this.state().submitted);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly status = computed(() => this.state().status);
  readonly timerState = computed(() => this.state().timerState);

  readonly progress = computed(() => {
    const total = this.state().totalQuestions;
    const current = this.state().questionNumber;
    return total > 0 ? Math.round((current / total) * 100) : 0;
  });

  readonly answeredCount = computed(() => this.state().answers.size);

  readonly canGoNext = computed(() => {
    return this.state().questionNumber < this.state().totalQuestions;
  });

  readonly canGoPrevious = computed(() => {
    return this.state().questionNumber > 1;
  });

  readonly isAnswerValid = computed(() => {
    const answer = this.state().currentAnswer.trim();
    return answer.length > 0;
  });

  readonly answerStats = computed(() => {
    const answer = this.state().currentAnswer;
    const words = answer
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
    return {
      characters: answer.length,
      words: words.length,
      lines: answer.split('\n').length,
    };
  });

  // Mutations
  setInterviewId(id: string) {
    this.state.update(s => ({ ...s, interviewId: id }));
  }

  setSessionId(id: string) {
    this.state.update(s => ({ ...s, sessionId: id }));
  }

  setCurrentQuestion(question: InterviewQuestion, number: number, total: number) {
    this.state.update(s => ({
      ...s,
      currentQuestion: question,
      questionNumber: number,
      totalQuestions: total,
      submitted: false,
    }));
  }

  updateCurrentAnswer(text: string) {
    this.state.update(s => ({ ...s, currentAnswer: text }));
  }

  setSubmitted(submitted: boolean) {
    this.state.update(s => ({ ...s, submitted }));
  }

  recordAnswer(questionId: string, answer: InterviewAnswer) {
    this.state.update(s => {
      const answers = new Map(s.answers);
      answers.set(questionId, answer);
      return { ...s, answers };
    });
  }

  setLoading(loading: boolean) {
    this.state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null) {
    this.state.update(s => ({ ...s, error }));
  }

  setStatus(status: SessionState['status']) {
    this.state.update(s => ({ ...s, status }));
  }

  updateTimerState(timerState: Partial<TimerState>) {
    this.state.update(s => ({
      ...s,
      timerState: { ...s.timerState, ...timerState },
    }));
  }

  moveToQuestion(questionNumber: number) {
    // Save current answer before moving
    const q = this.state().currentQuestion;
    if (q && this.state().currentAnswer.trim()) {
      this.recordAnswer(q.id, {
        questionId: q.id,
        answerText: this.state().currentAnswer,
      });
    }
    // Clear for new question
    this.state.update(s => ({
      ...s,
      questionNumber,
      currentAnswer: '',
      submitted: false,
    }));
  }

  resetSession() {
    this.state.set({
      interviewId: null,
      sessionId: null,
      currentQuestion: null,
      questionNumber: 0,
      totalQuestions: 0,
      answers: new Map(),
      currentAnswer: '',
      submitted: false,
      loading: false,
      error: null,
      timerState: {
        totalSeconds: 0,
        remainingSeconds: 0,
        isRunning: false,
        isPaused: false,
      },
      status: 'INIT',
    });
  }

  getAnswerForQuestion(questionId: string): InterviewAnswer | undefined {
    return this.state().answers.get(questionId);
  }

  getAllAnswers(): InterviewAnswer[] {
    return Array.from(this.state().answers.values());
  }
}
