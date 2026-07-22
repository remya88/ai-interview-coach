import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { InterviewQuestion } from '../../models/interview-session.model';

import { CurrentQuestionResponse, InterviewService } from '../../services/interview.service';
import { InterviewSessionStore } from '../../store/interview-session.store';
import { InterviewHeaderComponent } from '../../components/interview-header/interview-header.component';
import { InterviewProgressComponent } from '../../components/interview-progress/interview-progress.component';
import { QuestionCardComponent } from '../../components/question-card/question-card.component';
import { AnswerEditorComponent } from '../../components/answer-editor/answer-editor.component';
import { QuestionNavigationComponent } from '../../components/question-navigation/question-navigation.component';
import { InterviewTimerComponent } from '../../components/interview-timer/interview-timer.component';
import { SubmitConfirmationComponent } from '../../components/submit-confirmation/submit-confirmation.component';

@Component({
  selector: 'app-interview-session',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    InterviewHeaderComponent,
    InterviewProgressComponent,
    QuestionCardComponent,
    AnswerEditorComponent,
    QuestionNavigationComponent,
    InterviewTimerComponent,
    SubmitConfirmationComponent,
  ],
  template: `
    <!-- Loading State -->
    <div *ngIf="store.loading() && !store.currentQuestion()" class="flex justify-center items-center min-h-screen bg-slate-950">
      <mat-spinner diameter="50"></mat-spinner>
    </div>

    <!-- Error State -->
    <div *ngIf="store.error()" class="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div class="container mx-auto py-8 px-4">
        <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <h2 class="text-red-600 text-lg font-bold mb-2">Error Loading Interview</h2>
          <p class="text-gray-600 mb-4">{{ store.error() }}</p>
          <button (click)="retry()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Active Interview -->
    <div *ngIf="store.currentQuestion() && !store.error()" class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <!-- Header -->
      <app-interview-header
        [technologyName]="technologyName()"
        [categoryName]="categoryName()"
        [isPaused]="store.status() === 'PAUSED'"
        (togglePause)="togglePause()"
        (exit)="exitInterview()"
      ></app-interview-header>

      <!-- Main Content -->
      <div class="container mx-auto py-6 px-4">
        <div class="mb-4 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-cyan-100">
          Session status: <span class="font-semibold">{{ store.status() }}</span>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <!-- Sidebar: Progress and Timer -->
          <div class="lg:col-span-1 space-y-4 rounded-2xl border border-white/10 bg-slate-900/65 p-4 backdrop-blur">
            <app-interview-progress
              [currentQuestion]="store.questionNumber()"
              [totalQuestions]="store.totalQuestions()"
              [answeredQuestions]="store.answeredCount()"
            ></app-interview-progress>

            <app-interview-timer
              [remainingSeconds]="store.timerState().remainingSeconds"
              [isRunning]="store.timerState().isRunning"
              (tick)="onTimerTick($event)"
            ></app-interview-timer>
          </div>

          <!-- Main: Question and Answer -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Question Card -->
            <app-question-card
              [question]="store.currentQuestion()"
              [questionNumber]="store.questionNumber()"
              [totalQuestions]="store.totalQuestions()"
            ></app-question-card>

            <!-- Answer Editor -->
            <app-answer-editor
              [questionType]="store.currentQuestion()?.type"
              [currentAnswer]="store.currentAnswer()"
              (answered)="onAnswerChange($event)"
              (submit)="onSubmitClick()"
            ></app-answer-editor>

            <!-- Submit Confirmation (if in progress) -->
            <app-submit-confirmation
              *ngIf="store.submitted()"
              [charCount]="store.answerStats().characters"
              [wordCount]="store.answerStats().words"
              [timeSpent]="getQuestionTimeSpent()"
              (confirm)="submitAnswer()"
              (cancel)="cancelSubmit()"
            ></app-submit-confirmation>

            <!-- Navigation -->
            <app-question-navigation
              *ngIf="!store.submitted()"
              [currentQuestion]="store.questionNumber()"
              [totalQuestions]="store.totalQuestions()"
              [canGoNext]="store.canGoNext()"
              [canGoPrevious]="store.canGoPrevious()"
              (next)="goToNextQuestion()"
              (previous)="goToPreviousQuestion()"
            ></app-question-navigation>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InterviewSessionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interviewService = inject(InterviewService);
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(InterviewSessionStore);

  private interviewId: string | null = null;
  private questionStartTime = 0;

  technologyName = signal('Interview');
  categoryName = signal('');

  ngOnInit() {
    this.interviewId = this.route.snapshot.paramMap.get('id');
    if (this.interviewId) {
      this.loadInterview();
    }
  }

  ngOnDestroy() {
    this.store.resetSession();
  }

  private loadInterview() {
    if (!this.interviewId) return;

    this.store.setLoading(true);
    this.store.setInterviewId(this.interviewId);

    this.interviewService.getInterview(this.interviewId).subscribe({
      next: interview => {
        this.technologyName.set(interview.technology?.name || 'Interview');
        this.categoryName.set(interview.category?.name || '');
        this.startInterviewSession();
      },
      error: err => {
        this.store.setLoading(false);
        this.store.setError('Failed to load interview. Please try again.');
        console.error('Failed to load interview', err);
      },
    });
  }

  private startInterviewSession() {
    if (!this.interviewId) return;

    this.interviewService.startInterview(this.interviewId).subscribe({
      next: sessionData => {
        this.store.setSessionId(sessionData.sessionId);
        this.store.setStatus('IN_PROGRESS');
        this.loadCurrentQuestion();
      },
      error: err => {
        this.store.setLoading(false);
        this.store.setError('Failed to start interview session');
        console.error('Failed to start interview', err);
      },
    });
  }

  private loadCurrentQuestion() {
    if (!this.interviewId) return;

    this.interviewService.getCurrentQuestion(this.interviewId).subscribe({
      next: response => {
        this.applyCurrentQuestionResponse(response);
      },
      error: err => {
        this.store.setLoading(false);
        this.store.setError('Failed to load question');
        console.error('Failed to load question', err);
      },
    });
  }

  onAnswerChange(answer: string) {
    this.store.updateCurrentAnswer(answer);
    this.saveDraft();
  }

  onSubmitClick() {
    this.store.setSubmitted(true);
  }

  cancelSubmit() {
    this.store.setSubmitted(false);
  }

  submitAnswer() {
    if (!this.interviewId || !this.store.currentQuestion()) return;

    const question = this.store.currentQuestion()!;
    const answer = {
      answerText: this.store.currentAnswer(),
      timeTakenSeconds: this.getQuestionTimeSpent(),
    };

    this.store.setLoading(true);
    this.interviewService.submitAnswer(this.interviewId, question.id, answer).subscribe({
      next: () => {
        this.store.recordAnswer(question.id, {
          questionId: question.id,
          answerText: this.store.currentAnswer(),
          timeTakenSeconds: this.getQuestionTimeSpent(),
        });
        this.store.setSubmitted(false);
        this.store.setLoading(false);
        this.snackBar.open('Answer submitted successfully', 'Close', { duration: 3000 });
        this.goToNextQuestion();
      },
      error: err => {
        this.store.setLoading(false);
        this.store.setError('Failed to submit answer. Please try again.');
        console.error('Failed to submit answer', err);
      },
    });
  }

  goToNextQuestion() {
    if (this.store.canGoNext()) {
      if (!this.interviewId) return;

      const targetQuestion = this.store.questionNumber() + 1;
      this.store.moveToQuestion(targetQuestion);
      this.store.setLoading(true);

      this.interviewService.navigateQuestion(this.interviewId, targetQuestion).subscribe({
        next: response => this.applyCurrentQuestionResponse(response),
        error: err => {
          this.store.setLoading(false);
          this.store.setError('Failed to navigate to the next question.');
          console.error('Failed to navigate to next question', err);
        },
      });
    } else {
      this.completeInterview();
    }
  }

  goToPreviousQuestion() {
    if (this.store.canGoPrevious()) {
      if (!this.interviewId) return;

      const targetQuestion = this.store.questionNumber() - 1;
      this.store.moveToQuestion(targetQuestion);
      this.store.setLoading(true);

      this.interviewService.navigateQuestion(this.interviewId, targetQuestion).subscribe({
        next: response => this.applyCurrentQuestionResponse(response),
        error: err => {
          this.store.setLoading(false);
          this.store.setError('Failed to navigate to the previous question.');
          console.error('Failed to navigate to previous question', err);
        },
      });
    }
  }

  togglePause() {
    if (this.store.status() === 'IN_PROGRESS') {
      this.store.setStatus('PAUSED');
      this.store.updateTimerState({ isRunning: false, isPaused: true });
      this.snackBar.open('Interview paused', 'Close', { duration: 2000 });
    } else if (this.store.status() === 'PAUSED') {
      this.store.setStatus('IN_PROGRESS');
      this.store.updateTimerState({ isRunning: true, isPaused: false });
      this.snackBar.open('Interview resumed', 'Close', { duration: 2000 });
    }
  }

  exitInterview() {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      this.router.navigate(['/dashboard']);
    }
  }

  completeInterview() {
    if (!this.interviewId) return;

    this.store.setStatus('COMPLETED');
    this.store.updateTimerState({ isRunning: false, isPaused: false });
    this.interviewService.completeInterview(this.interviewId).subscribe({
      next: () => {
        this.snackBar.open('Interview completed!', 'Close', { duration: 3000 });
        this.router.navigate(['/evaluation', this.interviewId]);
      },
      error: err => {
        console.error('Error completing interview', err);
        this.router.navigate(['/evaluation', this.interviewId]);
      },
    });
  }

  onTimerTick(remaining: number) {
    this.store.updateTimerState({
      remainingSeconds: remaining,
      isRunning: remaining > 0 && this.store.status() === 'IN_PROGRESS',
    });

    if (remaining === 0 && !this.store.loading() && !this.store.submitted()) {
      this.snackBar.open('Time is up! Submitting your answer...', 'Close', { duration: 3000 });
      this.submitAnswer();
    }
  }

  getQuestionTimeSpent(): number {
    return Math.floor((Date.now() - this.questionStartTime) / 1000);
  }

  saveDraft() {
    if (!this.interviewId || !this.store.currentQuestion()) return;
    const draftKey = `interview_${this.interviewId}_q${this.store.currentQuestion()!.id}`;
    localStorage.setItem(draftKey, this.store.currentAnswer());
    localStorage.setItem(`${draftKey}_time`, new Date().toISOString());
  }

  retry() {
    this.store.setError(null);
    this.store.setLoading(true);
    this.loadInterview();
  }

  private applyCurrentQuestionResponse(response: CurrentQuestionResponse) {
    const mappedQuestion: InterviewQuestion = {
      id: response.question.id,
      questionNumber: response.question.questionNumber,
      text: response.question.text ?? response.question.questionText ?? '',
      type: response.question.type ?? response.question.questionType ?? 'THEORY',
      difficulty: response.question.difficulty ?? 'INTERMEDIATE',
      timeLimit: response.question.timeLimit ?? response.question.expectedDuration,
    };

    const existingAnswer = this.store.getAnswerForQuestion(mappedQuestion.id);
    const backendAnswer = response.question.answer?.answerText ?? '';
    const draftKey = this.interviewId
      ? `interview_${this.interviewId}_q${mappedQuestion.id}`
      : null;
    const draftAnswer = draftKey ? localStorage.getItem(draftKey) ?? '' : '';
    const restoredAnswer =
      existingAnswer?.answerText ??
      (backendAnswer.trim() ? backendAnswer : '') ??
      (draftAnswer.trim() ? draftAnswer : '');

    this.store.setCurrentQuestion(
      mappedQuestion,
      response.currentNumber,
      response.totalQuestions,
    );
    this.store.updateCurrentAnswer(restoredAnswer);

    if (!existingAnswer && backendAnswer.trim()) {
      this.store.recordAnswer(mappedQuestion.id, {
        questionId: mappedQuestion.id,
        answerText: backendAnswer,
        codeAnswer: response.question.answer?.codeAnswer ?? undefined,
        timeTakenSeconds: response.question.answer?.timeTakenSeconds ?? undefined,
      });
    }

    this.store.setLoading(false);
    this.store.setError(null);
    this.questionStartTime = Date.now();

    // Initialize once: session-wide timer should not reset per question.
    if (this.store.timerState().totalSeconds <= 0) {
      const perQuestionMinutes = mappedQuestion.timeLimit ?? 5;
      const totalSeconds = Math.max(60, response.totalQuestions * perQuestionMinutes * 60);
      this.store.updateTimerState({
        totalSeconds,
        remainingSeconds: totalSeconds,
        isRunning: this.store.status() === 'IN_PROGRESS',
        isPaused: this.store.status() === 'PAUSED',
      });
      return;
    }

    this.store.updateTimerState({
      isRunning: this.store.status() === 'IN_PROGRESS' && this.store.timerState().remainingSeconds > 0,
      isPaused: this.store.status() === 'PAUSED',
    });
  }
}

