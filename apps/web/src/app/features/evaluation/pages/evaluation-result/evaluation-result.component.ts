import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, interval, takeUntil, takeWhile } from 'rxjs';

import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationStore } from '../../store/evaluation.store';
import { ScoreCardComponent } from '../../components/score-card/score-card.component';
import { StrengthListComponent } from '../../components/strength-list/strength-list.component';
import { WeaknessListComponent } from '../../components/weakness-list/weakness-list.component';
import { RecommendationCardComponent } from '../../components/recommendation-card/recommendation-card.component';

@Component({
  selector: 'app-evaluation-result',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ScoreCardComponent,
    StrengthListComponent,
    WeaknessListComponent,
    RecommendationCardComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8 rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-cyan-300">Interview Insights</p>
              <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Evaluation Report</h1>
            </div>
            <button mat-stroked-button class="!border-cyan-400/40 !text-cyan-100" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back to Dashboard
            </button>
          </div>
          <p class="text-slate-300">Your AI-powered interview feedback and performance breakdown.</p>
        </div>

        <div *ngIf="store.loading() || store.isProcessing()" class="rounded-2xl border border-white/10 bg-slate-900/75 p-8 text-center shadow-xl">
          <div class="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
            <mat-spinner [diameter]="44"></mat-spinner>
          </div>
          <div class="mt-6">
            <p class="mb-2 text-lg font-semibold text-white">Analyzing your interview...</p>
            <p class="mb-4 text-sm text-slate-300">{{ store.processingProgress() }}% complete</p>
            <div class="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-700">
              <div class="h-full bg-cyan-400 transition-all duration-300" [style.width.%]="store.processingProgress()"></div>
            </div>
            <div class="mx-auto mt-5 max-w-md space-y-1 rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-left text-xs text-slate-300">
              <p *ngIf="currentStep() <= 1">Collecting answers...</p>
              <p *ngIf="currentStep() <= 2">Evaluating technical skills...</p>
              <p *ngIf="currentStep() <= 3">Reviewing architecture and problem solving...</p>
              <p *ngIf="currentStep() <= 4">Generating recommendations...</p>
            </div>
          </div>
        </div>

        <div *ngIf="store.error(); let err" class="mb-6 rounded-xl border border-rose-300/50 bg-rose-500/10 p-4 text-rose-100">
          <div class="flex items-start">
            <mat-icon class="mr-3 mt-1 text-rose-300">error</mat-icon>
            <div>
              <p class="font-semibold">Evaluation Failed</p>
              <p class="mt-1 text-sm">{{ err }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="store.isCompleted() && !store.loading()" class="space-y-8">
          <mat-card class="overview-card">
            <mat-card-header class="border-b border-slate-700/60 !pb-4">
              <mat-card-title class="text-2xl !font-bold !text-white">Overall Performance</mat-card-title>
            </mat-card-header>
            <mat-card-content class="!p-6">
              <div class="mb-6 flex items-center justify-center">
                <div class="relative h-48 w-48">
                  <svg class="h-full w-full -rotate-90 transform">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="#334155" stroke-width="8"></circle>
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      [attr.stroke]="getScoreColor()"
                      stroke-width="8"
                      stroke-dasharray="552"
                      [style.stroke-dashoffset]="552 - (552 * store.overallScore()) / 100"
                      class="transition-all duration-500"
                    ></circle>
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-5xl font-bold" [style.color]="getScoreColor()">
                        {{ store.overallScore() | number: '1.0-0' }}
                      </div>
                      <div class="text-sm text-slate-400">out of 100</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <app-score-card [score]="store.averageScores().technicalKnowledge" title="Technical Knowledge" scoreLabel="Technical"></app-score-card>
                <app-score-card [score]="store.averageScores().architecture" title="Architecture" scoreLabel="Architecture"></app-score-card>
                <app-score-card [score]="store.averageScores().communication" title="Communication" scoreLabel="Communication"></app-score-card>
                <app-score-card [score]="store.averageScores().problemSolving" title="Problem Solving" scoreLabel="Problem Solving"></app-score-card>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="grid grid-cols-1 gap-6">
            <mat-card class="question-feedback-card" *ngFor="let question of questionFeedback(); let i = index">
              <mat-card-header>
                <mat-card-title class="!text-white">{{ i + 1 }}. {{ question.questionText }}</mat-card-title>
              </mat-card-header>
              <mat-card-content class="!pt-2">
                <div class="question-metadata">
                  <span class="question-pill">{{ question.questionType || 'Question' }}</span>
                  <span class="score-pill">{{ question.evaluation.overallScore ?? 0 }}/100</span>
                </div>
                <div class="question-answer">
                  <p class="question-answer-label">Candidate answer</p>
                  <p class="question-answer-text">{{ question.candidateAnswer || 'No answer recorded for this question.' }}</p>
                </div>
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <app-strength-list [items]="question.evaluation.strengths ?? []" title="Strengths"></app-strength-list>
                  <app-weakness-list [items]="question.evaluation.weaknesses ?? []" title="Weaknesses"></app-weakness-list>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <app-recommendation-card [recommendations]="learningRecommendations()"></app-recommendation-card>

          <mat-card class="questions-card">
            <mat-card-header>
              <mat-card-title class="!text-white">Questions Evaluation</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="question-stats">
                <div class="stat">
                  <span class="stat-label">Total Questions</span>
                  <span class="stat-value">{{ store.totalQuestions() }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Evaluated</span>
                  <span class="stat-value text-emerald-300">{{ store.questionsEvaluated() }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="flex flex-wrap justify-center gap-3 pt-4">
            <button mat-stroked-button class="!border-cyan-400/40 !text-cyan-100" (click)="downloadReport()">
              <mat-icon>download</mat-icon>
              Download Report
            </button>
            <button mat-raised-button color="primary" (click)="startNewInterview()">
              <mat-icon>add</mat-icon>
              New Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .container {
        max-width: 1200px;
      }

      .overview-card {
        @apply overflow-hidden border border-slate-700/60 bg-slate-900/75 text-slate-100 shadow-xl;
      }

      .questions-card {
        @apply overflow-hidden border border-cyan-400/20 bg-gradient-to-r from-slate-900 to-slate-800;
      }

      .question-feedback-card {
        @apply overflow-hidden border border-slate-700/60 bg-slate-900/75 text-slate-100 shadow-xl;
      }

      .question-metadata {
        @apply mb-4 flex flex-wrap items-center gap-2;
      }

      .question-pill,
      .score-pill {
        @apply rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200;
      }

      .score-pill {
        @apply border-emerald-400/30 bg-emerald-500/10 text-emerald-200;
      }

      .question-answer {
        @apply mb-5 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4 text-sm text-slate-300;
      }

      .question-answer-label {
        @apply mb-2 text-xs uppercase tracking-[0.2em] text-slate-400;
      }

      .question-answer-text {
        @apply whitespace-pre-wrap text-sm leading-6 text-slate-300;
      }

      .question-stats {
        @apply grid grid-cols-2 gap-8;
      }

      .stat {
        @apply flex flex-col;
      }

      .stat-label {
        @apply text-sm font-medium text-slate-300;
      }

      .stat-value {
        @apply mt-1 text-3xl font-bold text-white;
      }

      button {
        @apply flex items-center gap-2;
      }
    `,
  ],
})
export class EvaluationResultComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evaluationService = inject(EvaluationService);
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(EvaluationStore);

  private readonly destroy$ = new Subject<void>();
  readonly interviewId = signal<string>('');
  readonly currentStep = signal<number>(1);

  readonly questionFeedback = computed(() => {
    const current = this.store.currentEvaluation();
    return Array.isArray(current?.questions) ? current.questions : [];
  });

  readonly learningRecommendations = computed(
    () => {
      const current = this.store.currentEvaluation();
      const questions = current?.questions;
      if (Array.isArray(questions) && questions.length > 0) {
        return questions
          .flatMap(q => q.evaluation?.learningRecommendations ?? [])
          .slice(0, 5);
      }

      const topLevelRecommendations = current?.learningRecommendations;
      return Array.isArray(topLevelRecommendations)
        ? topLevelRecommendations.slice(0, 5)
        : [];
    },
  );

  ngOnInit() {
    this.store.reset();

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.interviewId.set(id);
        this.loadEvaluation(id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvaluation(interviewId: string) {
    this.store.setLoading(true);
    this.store.setError(null);
    this.store.setProcessingProgress(5);

    this.evaluationService
      .startEvaluation(interviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.pollEvaluation(interviewId),
        error: error => {
          this.store.setLoading(false);
          this.store.setError(error?.error?.message || 'Failed to start evaluation');
          this.snackBar.open('Failed to start evaluation', 'Close', { duration: 5000 });
        },
      });
  }

  private pollEvaluation(interviewId: string) {
    let attempts = 0;
    const maxAttempts = 150;

    interval(2000)
      .pipe(
        takeUntil(this.destroy$),
        takeWhile(() => attempts < maxAttempts && this.store.loading()),
      )
      .subscribe({
        next: () => {
          attempts++;
          this.updateProgress();

          this.evaluationService
            .getEvaluation(interviewId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: evaluation => {
                this.store.setCurrentEvaluation(evaluation);

                if (evaluation.status === 'COMPLETED' || evaluation.status === 'FAILED') {
                  this.store.setLoading(false);
                  this.store.setProcessingProgress(100);
                  if (evaluation.status === 'FAILED') {
                    this.store.setError(
                      evaluation.errorMessage || 'Evaluation failed. Please try again.',
                    );
                  }
                }
              },
              error: error => {
                this.store.setLoading(false);
                this.store.setError(error?.error?.message || 'Failed to get evaluation');
              },
            });
        },
        complete: () => {
          if (this.store.loading() && !this.store.isCompleted()) {
            this.store.setLoading(false);
            this.store.setError(
              'Evaluation is taking longer than expected. Please refresh in a moment.',
            );
          }
        },
      });
  }

  private updateProgress() {
    let progress = this.store.processingProgress();
    if (progress < 50) {
      progress += Math.random() * 10;
    } else if (progress < 90) {
      progress += Math.random() * 5;
    }
    this.store.setProcessingProgress(Math.min(progress, 95));
    this.currentStep.set(Math.ceil((progress / 100) * 4));
  }

  getScoreColor(): string {
    const score = this.store.overallScore();
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  downloadReport() {
    const evaluation = this.store.currentEvaluation();
    if (!evaluation) {
      this.snackBar.open('No evaluation data is available to download yet.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const blob = this.evaluationService.createReportBlob(this.interviewId(), evaluation);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-report-${this.interviewId()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Report downloaded successfully', 'Close', {
      duration: 3000,
    });
  }

  startNewInterview() {
    this.router.navigate(['/interview/setup']);
  }
}
