import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ResumeAnalysisService } from '../../services/resume-analysis.service';
import { ResumeStore } from '../../store/resume.store';
import { GapAnalysisComponent } from '../../components/gap-analysis/gap-analysis.component';
import { RecommendationCardComponent } from '../../components/recommendation-card/recommendation-card.component';
import { SkillChipListComponent } from '../../components/skill-chip/skill-chip.component';

@Component({
  selector: 'app-job-match',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    GapAnalysisComponent,
    RecommendationCardComponent,
    SkillChipListComponent,
  ],
  template: `
    <div class="page-shell">
      <div class="page-content">
        <div class="page-header-card">
          <div class="header-title-block">
            <p class="eyebrow">Job Match</p>
            <h1>Match your resume to a role</h1>
            <p class="subtitle">Compare your resume against a job description and uncover the gaps.</p>
          </div>
          <div class="header-actions">
            <button mat-stroked-button class="back-button dashboard-btn" (click)="router.navigate(['/dashboard'])">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
          </div>
        </div>

        <mat-card *ngIf="!store.hasMatchResult()" class="glass-card form-card">
          <mat-card-header>
            <mat-card-title>Enter Job Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="job-form">
              <div class="form-row">
                <mat-form-field appearance="fill" subscriptSizing="dynamic" class="auth-field styled-field">
                  <mat-label>Job Title *</mat-label>
                  <input matInput formControlName="jobTitle" placeholder="e.g. Senior Frontend Engineer" />
                  <mat-error *ngIf="form.get('jobTitle')?.errors?.['required']">Job title is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="fill" subscriptSizing="dynamic" class="auth-field styled-field">
                  <mat-label>Company Name</mat-label>
                  <input matInput formControlName="companyName" placeholder="e.g. Google" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="fill" subscriptSizing="dynamic" class="auth-field full-width styled-field">
                <mat-label>Job Description *</mat-label>
                <textarea
                  matInput
                  formControlName="jobDescription"
                  rows="10"
                  placeholder="Paste the full job description here..."
                ></textarea>
                <mat-hint>Minimum 50 characters</mat-hint>
                <mat-error *ngIf="form.get('jobDescription')?.errors?.['required']">Job description is required</mat-error>
                <mat-error *ngIf="form.get('jobDescription')?.errors?.['minlength']">Description is too short</mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button
                  mat-raised-button
                  color="primary"
                  class="submit-button"
                  type="submit"
                  [disabled]="form.invalid || store.loading()"
                >
                  <mat-spinner *ngIf="store.loading()" [diameter]="20"></mat-spinner>
                  <ng-container *ngIf="!store.loading()">
                    <mat-icon>psychology</mat-icon> Analyze Match
                  </ng-container>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <ng-container *ngIf="store.hasMatchResult() && store.matchResult() as result">
          <mat-card class="glass-card match-score-card">
            <mat-card-content>
              <div class="match-layout">
                <div class="match-circle" [style.border-color]="getMatchColor(result.matchPercentage)">
                  <span class="match-value" [style.color]="getMatchColor(result.matchPercentage)">
                    {{ result.matchPercentage }}%
                  </span>
                  <span class="match-label">Match</span>
                </div>
                <div class="match-meta">
                  <h2>{{ result.jobDescription.jobTitle }}</h2>
                  <p *ngIf="result.jobDescription.companyName" class="company">
                    <mat-icon>business</mat-icon>
                    {{ result.jobDescription.companyName }}
                  </p>
                  <p *ngIf="result.overallAssessment" class="assessment">{{ result.overallAssessment }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="skills-grid">
            <mat-card class="glass-card">
              <mat-card-content>
                <app-skill-chip-list
                  title="Matched Skills"
                  [skills]="result.matchedSkills"
                  bgColor="rgba(16, 185, 129, 0.18)"
                  textColor="#6ee7b7"
                ></app-skill-chip-list>
              </mat-card-content>
            </mat-card>

            <mat-card class="glass-card">
              <mat-card-content>
                <app-skill-chip-list
                  title="Missing Skills"
                  [skills]="result.missingSkills"
                  bgColor="rgba(248, 113, 113, 0.16)"
                  textColor="#fda4af"
                ></app-skill-chip-list>
              </mat-card-content>
            </mat-card>
          </div>

          <app-gap-analysis [gap]="result.skillGap"></app-gap-analysis>

          <app-recommendation-card
            title="How to Improve Your Match"
            [items]="result.recommendations"
            icon="trending_up"
            iconColor="#38bdf8"
          ></app-recommendation-card>

          <app-recommendation-card
            title="Interview Preparation Topics"
            [items]="result.interviewPreparationTips"
            icon="school"
            iconColor="#a78bfa"
          ></app-recommendation-card>

          <div class="re-analyze">
            <button mat-stroked-button class="re-analyze-button" (click)="store.setMatchResult(null)">
              <mat-icon>add</mat-icon> Analyze Another Job
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .page-shell {
      min-height: 100vh;
      background: linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%);
      padding: 2rem 1rem;
      color: #f8fafc;
    }

    .page-content {
      max-width: 72rem;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header-card {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 1.5rem;
      border: 1px solid rgba(34, 211, 238, 0.2);
      background: rgba(15, 23, 42, 0.7);
      box-shadow: 0 25px 50px rgba(2, 6, 23, 0.25);
      backdrop-filter: blur(16px);
    }

    .header-title-block {
      flex: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-shrink: 0;
      margin-left: auto;
    }

    .back-button {
      color: #f8fafc;
      border: 1px solid rgba(34, 211, 238, 0.4);
      background: rgba(8, 47, 73, 0.4);
      border-radius: 999px;
    }

    .dashboard-btn {
      padding: 0 1rem;
      height: 40px;
      font-weight: 600;
      color: #f8fafc;
    }

    .eyebrow {
      margin: 0 0 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #67e8f9;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      color: #f8fafc;
    }

    .subtitle {
      margin: 6px 0 0;
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.6;
    }

    .glass-card {
      border-radius: 20px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.74);
      box-shadow: 0 20px 45px rgba(2, 6, 23, 0.32);
      backdrop-filter: blur(16px);
      color: #f8fafc;
    }

    .form-card {
      padding: 8px 0;
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
    }

    .job-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .full-width { width: 100%; }

    .styled-field {
      width: 100%;
      display: block;

      ::ng-deep .mat-mdc-form-field-infix {
        display: flex;
        flex-direction: column;
      }

      ::ng-deep .mat-mdc-text-field-wrapper {
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.25) !important;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.7));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
      }

      ::ng-deep .mdc-text-field--focused .mat-mdc-text-field-wrapper {
        border-color: rgba(34, 211, 238, 0.9) !important;
        box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.18);
        transform: translateY(-1px);
      }

      ::ng-deep .mdc-floating-label,
      ::ng-deep .mat-mdc-form-field-hint,
      ::ng-deep .mat-mdc-form-field-error,
      ::ng-deep .mat-mdc-form-field-icon-suffix {
        color: rgba(226, 232, 240, 0.86) !important;
      }

      ::ng-deep .mat-mdc-input-element {
        width: 100%;
        color: #f8fafc !important;
        caret-color: #22d3ee;
      }

      ::ng-deep .mat-mdc-input-element::placeholder,
      ::ng-deep textarea::placeholder {
        color: rgba(203, 213, 225, 0.72) !important;
        opacity: 1 !important;
      }

      ::ng-deep .mat-mdc-form-field-flex,
      ::ng-deep .mat-mdc-form-field-infix,
      ::ng-deep .mdc-text-field {
        width: 100% !important;
      }

      ::ng-deep .mat-mdc-input-element:-webkit-autofill,
      ::ng-deep .mat-mdc-input-element:-webkit-autofill:hover,
      ::ng-deep .mat-mdc-input-element:-webkit-autofill:focus {
        -webkit-text-fill-color: #f8fafc;
        transition: background-color 9999s ease-out 0s;
      }

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        padding-top: 2px;
      }

      ::ng-deep .mdc-line-ripple,
      ::ng-deep .mat-mdc-form-field-outline {
        display: none !important;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .submit-button {
      min-width: 180px;
      border-radius: 999px;
      padding: 0 22px;
      font-weight: 700;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%) !important;
      color: white !important;
      box-shadow: 0 12px 25px rgba(6, 182, 212, 0.25);
    }

    .match-score-card {
      background: linear-gradient(135deg, rgba(8, 47, 73, 0.95) 0%, rgba(15, 23, 42, 0.96) 100%);
    }

    .match-layout {
      display: flex;
      align-items: center;
      gap: 32px;
      padding: 6px 2px;
    }

    .match-circle {
      width: 108px;
      height: 108px;
      border-radius: 50%;
      border: 6px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(2, 6, 23, 0.4);
    }

    .match-value { font-size: 28px; font-weight: 800; line-height: 1; }
    .match-label { font-size: 12px; color: #cbd5e1; }

    .match-meta {
      h2 { font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #f8fafc; }

      .company {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #94a3b8;
        font-size: 14px;
        margin: 0 0 8px;
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }

      .assessment { font-size: 14px; color: #e2e8f0; line-height: 1.6; margin: 0; }
    }

    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .re-analyze {
      display: flex;
      justify-content: center;
    }

    .re-analyze-button {
      color: #e0f2fe;
      border-color: rgba(34, 211, 238, 0.35);
      border-radius: 999px;
      padding: 0 20px;
      font-weight: 700;
    }
  `],
})
export class JobMatchComponent implements OnInit {
  readonly store = inject(ResumeStore);
  private readonly service = inject(ResumeAnalysisService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  resumeId = '';

  form = this.fb.group({
    jobTitle: ['', [Validators.required, Validators.minLength(3)]],
    companyName: [''],
    jobDescription: ['', [Validators.required, Validators.minLength(50)]],
  });

  ngOnInit(): void {
    this.resumeId = this.resolveResumeId();
    this.store.setMatchResult(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (!this.resumeId) {
      this.snackBar.open('Resume context is missing. Please return to the resume analysis page and try again.', 'Close', {
        duration: 5000,
      });
      return;
    }

    this.store.setLoading(true);
    this.store.setError(null);

    const values = this.form.getRawValue();
    const jobTitle = values.jobTitle?.trim();
    const jobDescription = values.jobDescription?.trim();

    if (!jobTitle || !jobDescription || jobDescription.length < 50) {
      this.form.markAllAsTouched();
      this.store.setLoading(false);
      return;
    }

    this.service.matchJob({
      resumeId: this.resumeId,
      jobTitle,
      jobDescription,
      companyName: values.companyName?.trim() || undefined,
    }).subscribe({
      next: (result) => {
        this.store.setMatchResult(result);
        this.store.setLoading(false);
        this.snackBar.open('Match analysis complete!', 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.store.setLoading(false);
        this.store.setError(err.error?.message ?? 'Match analysis failed');
        this.snackBar.open('Match analysis failed. Please try again.', 'Close', { duration: 5000 });
      },
    });
  }

  private resolveResumeId(): string {
    return this.route.snapshot.paramMap.get('id') ?? this.route.parent?.snapshot.paramMap.get('id') ?? '';
  }

  getMatchColor(percentage: number): string {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  }
}
