import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ResumeAnalysisService } from '../../services/resume-analysis.service';
import { ResumeStore } from '../../store/resume.store';
import { ScoreCardComponent } from '../../components/score-card/score-card.component';
import { SkillChipListComponent } from '../../components/skill-chip/skill-chip.component';
import { RecommendationCardComponent } from '../../components/recommendation-card/recommendation-card.component';

@Component({
  selector: 'app-resume-analysis-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    ScoreCardComponent,
    SkillChipListComponent,
    RecommendationCardComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
      <div class="mx-auto flex max-w-6xl flex-col gap-6">
        <div class="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-cyan-300">Resume Analysis</p>
              <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Resume insights</h1>
              <p class="mt-2 text-slate-300">{{ store.report()?.resume?.originalFilename }}</p>
            </div>
            <button mat-stroked-button class="!border-cyan-400/40 !text-cyan-100" (click)="router.navigate(['/resume-analysis'])">
              <mat-icon>arrow_back</mat-icon>
              Back to uploads
            </button>
          </div>
        </div>

        <div *ngIf="store.loading()" class="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-8 text-center shadow-xl">
          <div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
            <mat-spinner [diameter]="42"></mat-spinner>
          </div>
          <p class="mt-4 text-lg font-semibold text-white">Analyzing your resume with AI...</p>
        </div>

        <div *ngIf="!store.loading() && !store.latestAnalysis()" class="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-8 shadow-xl">
          <div class="flex flex-col items-center gap-3 text-center">
            <div class="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-5 text-cyan-200">
              <mat-icon class="!text-5xl">analytics</mat-icon>
            </div>
            <h3 class="text-2xl font-semibold text-white">No analysis yet</h3>
            <p class="max-w-xl text-slate-300">Run an AI analysis to get detailed feedback on your resume.</p>
            <button mat-raised-button color="primary" (click)="runAnalysis()">
              <mat-icon>psychology</mat-icon>
              Analyze with AI
            </button>
          </div>
        </div>

        <ng-container *ngIf="!store.loading() && store.latestAnalysis() as analysis">
          <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <app-score-card [score]="analysis.overallScore" label="Overall Score"></app-score-card>
            <app-score-card [score]="analysis.atsScore" label="ATS Score"></app-score-card>
            <app-score-card [score]="analysis.skillScore" label="Skill Score"></app-score-card>
            <app-score-card [score]="analysis.experienceScore" label="Experience"></app-score-card>
          </section>

          <mat-card class="overflow-hidden border border-slate-700/60 bg-slate-900/75 shadow-xl">
            <mat-card-content class="flex items-center justify-between gap-3 p-5">
              <div class="flex items-center gap-3">
                <div class="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-200">
                  <mat-icon>badge</mat-icon>
                </div>
                <div>
                  <p class="text-sm text-slate-400">Experience level</p>
                  <p class="text-lg font-semibold text-white">{{ analysis.experienceLevel }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-tab-group class="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-2 shadow-xl">
            <mat-tab label="Skills">
              <div class="flex flex-col gap-4 p-4 md:p-6">
                <app-skill-chip-list title="Detected Technical Skills" [skills]="analysis.detectedSkills" bgColor="#0f172a" textColor="#e2e8f0"></app-skill-chip-list>
                <app-skill-chip-list title="Missing Keywords" [skills]="analysis.missingKeywords" bgColor="#1f2937" textColor="#fda4af"></app-skill-chip-list>
              </div>
            </mat-tab>

            <mat-tab label="Feedback">
              <div class="grid gap-4 p-4 md:grid-cols-2 md:p-6">
                <mat-card class="overflow-hidden border border-emerald-400/20 bg-slate-950/60">
                  <mat-card-header>
                    <mat-card-title class="flex items-center gap-2 text-white"><mat-icon class="text-emerald-400">thumb_up</mat-icon> Strengths</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <ul class="ml-5 list-disc space-y-2 text-sm leading-6 text-slate-300">
                      <li *ngFor="let s of analysis.strengths">{{ s }}</li>
                    </ul>
                  </mat-card-content>
                </mat-card>

                <mat-card class="overflow-hidden border border-rose-400/20 bg-slate-950/60">
                  <mat-card-header>
                    <mat-card-title class="flex items-center gap-2 text-white"><mat-icon class="text-rose-400">thumb_down</mat-icon> Weaknesses</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <ul class="ml-5 list-disc space-y-2 text-sm leading-6 text-slate-300">
                      <li *ngFor="let w of analysis.weaknesses">{{ w }}</li>
                    </ul>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>

            <mat-tab label="Recommendations">
              <div class="flex flex-col gap-4 p-4 md:p-6">
                <app-recommendation-card title="Improvement Recommendations" [items]="analysis.recommendations" icon="lightbulb" iconColor="#f59e0b"></app-recommendation-card>

                <mat-card *ngIf="analysis.improvedSummary" class="overflow-hidden border border-cyan-400/20 bg-slate-950/60">
                  <mat-card-header>
                    <mat-card-title class="flex items-center gap-2 text-white"><mat-icon class="text-cyan-400">auto_fix_high</mat-icon> Suggested Professional Summary</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="whitespace-pre-line text-sm leading-7 text-slate-300">{{ analysis.improvedSummary }}</p>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>
          </mat-tab-group>

          <div class="flex flex-wrap justify-end gap-3">
            <button mat-stroked-button class="!border-cyan-400/40 !text-cyan-100" (click)="runAnalysis()">
              <mat-icon>refresh</mat-icon>
              Re-analyze
            </button>
            <button mat-raised-button color="primary" (click)="goToJobMatch()">
              <mat-icon>work</mat-icon>
              Match with Job Description
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [``],
})
export class ResumeAnalysisPageComponent implements OnInit {
  readonly store = inject(ResumeStore);
  private readonly service = inject(ResumeAnalysisService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private resumeId = '';

  ngOnInit(): void {
    this.resumeId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadReport();
  }

  private loadReport(): void {
    if (!this.resumeId) return;
    this.service.getResumeReport(this.resumeId).subscribe({
      next: (report) => this.store.setReport(report),
      error: () => this.store.setError('Failed to load resume report'),
    });
  }

  runAnalysis(): void {
    this.store.setLoading(true);
    this.service.analyzeResume(this.resumeId).subscribe({
      next: (analysis) => {
        this.store.setAnalysis(analysis);
        this.store.setLoading(false);
        this.snackBar.open('Analysis complete!', 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.store.setLoading(false);
        this.store.setError(err.error?.message ?? 'Analysis failed');
      },
    });
  }

  goToJobMatch(): void {
    this.router.navigate(['/resume-analysis', this.resumeId, 'job-match']);
  }
}
