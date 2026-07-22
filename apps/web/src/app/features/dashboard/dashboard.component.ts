import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
      <div class="mx-auto flex max-w-6xl flex-col gap-6">
        <div class="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-900/20 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.3em] text-cyan-300">AI Career Workspace</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Welcome back</h1>
          <p class="mt-3 max-w-2xl text-slate-300">Jump into interview prep, resume review, and job-match insights from one place.</p>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <mat-card class="overflow-hidden border border-slate-700/60 bg-slate-900/75 shadow-xl">
            <mat-card-content class="p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Resume Analyzer</p>
                  <h2 class="mt-2 text-2xl font-semibold text-white">Review your resume with AI</h2>
                  <p class="mt-3 text-sm leading-6 text-slate-300">Upload a resume, get a score, uncover gaps, and improve your profile for target roles.</p>
                </div>
                <div class="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-200">
                  <mat-icon>description</mat-icon>
                </div>
              </div>
              <button mat-raised-button color="primary" class="mt-6" (click)="goToResumeAnalyzer()">
                <mat-icon>launch</mat-icon>
                Open Resume Analyzer
              </button>
            </mat-card-content>
          </mat-card>

          <mat-card class="overflow-hidden border border-slate-700/60 bg-slate-900/75 shadow-xl">
            <mat-card-content class="p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Interview Prep</p>
                  <h2 class="mt-2 text-2xl font-semibold text-white">Run your next mock interview</h2>
                  <p class="mt-3 text-sm leading-6 text-slate-300">Practice live technical and behavioral questions and review instant feedback.</p>
                </div>
                <div class="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-200">
                  <mat-icon>psychology</mat-icon>
                </div>
              </div>
              <button mat-stroked-button class="mt-6 !border-cyan-400/40 !text-cyan-100" routerLink="/interview/setup">
                <mat-icon>arrow_forward</mat-icon>
                Start Interview
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private readonly router = inject(Router);

  goToResumeAnalyzer(): void {
    this.router.navigate(['/resume-analysis']);
  }
}
