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
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <button mat-icon-button (click)="router.navigate(['/resume-analysis', resumeId])">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>Job Match</h1>
          <p class="subtitle">Compare your resume against a job description</p>
        </div>
      </div>

      <!-- Input Form (show only when no result yet) -->
      <mat-card *ngIf="!store.hasMatchResult()" class="form-card">
        <mat-card-header>
          <mat-card-title>Enter Job Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="job-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Job Title *</mat-label>
                <input matInput formControlName="jobTitle" placeholder="e.g. Senior Frontend Engineer" />
                <mat-error *ngIf="form.get('jobTitle')?.errors?.['required']">Job title is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Company Name</mat-label>
                <input matInput formControlName="companyName" placeholder="e.g. Google" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
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

      <!-- Match Results -->
      <ng-container *ngIf="store.hasMatchResult() && store.matchResult() as result">

        <!-- Match Score Header -->
        <mat-card class="match-score-card">
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

        <!-- Skills Breakdown -->
        <div class="skills-grid">
          <mat-card>
            <mat-card-content>
              <app-skill-chip-list
                title="✅ Matched Skills"
                [skills]="result.matchedSkills"
                bgColor="#dcfce7"
                textColor="#16a34a"
              ></app-skill-chip-list>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content>
              <app-skill-chip-list
                title="❌ Missing Skills"
                [skills]="result.missingSkills"
                bgColor="#fee2e2"
                textColor="#dc2626"
              ></app-skill-chip-list>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Gap Analysis -->
        <app-gap-analysis [gap]="result.skillGap"></app-gap-analysis>

        <!-- Recommendations -->
        <app-recommendation-card
          title="How to Improve Your Match"
          [items]="result.recommendations"
          icon="trending_up"
          iconColor="#3b82f6"
        ></app-recommendation-card>

        <!-- Interview Prep -->
        <app-recommendation-card
          title="Interview Preparation Topics"
          [items]="result.interviewPreparationTips"
          icon="school"
          iconColor="#8b5cf6"
        ></app-recommendation-card>

        <!-- New Analysis -->
        <div class="re-analyze">
          <button mat-stroked-button (click)="store.setMatchResult(null)">
            <mat-icon>add</mat-icon> Analyze Another Job
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;

      h1 { font-size: 26px; font-weight: 700; margin: 0; }
      .subtitle { color: #6b7280; margin: 4px 0 0; }
    }

    .form-card { border-radius: 12px; }
    mat-card-title { font-size: 18px; font-weight: 600; }

    .job-form { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .full-width { width: 100%; }

    .form-actions { display: flex; justify-content: flex-end; }

    .match-score-card {
      border-radius: 12px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }

    .match-layout {
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .match-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 6px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .match-value { font-size: 28px; font-weight: 800; line-height: 1; }
    .match-label { font-size: 12px; color: #6b7280; }

    .match-meta {
      h2 { font-size: 20px; font-weight: 700; margin: 0 0 8px; }

      .company {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #6b7280;
        font-size: 14px;
        margin: 0 0 8px;
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }

      .assessment { font-size: 14px; color: #374151; line-height: 1.6; margin: 0; }
    }

    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 600px) { grid-template-columns: 1fr; }

      mat-card { border-radius: 10px; }
    }

    .re-analyze { display: flex; justify-content: center; }
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
    this.resumeId = this.route.snapshot.paramMap.get('id') ?? '';
    this.store.setMatchResult(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.store.setLoading(true);
    this.store.setError(null);

    const values = this.form.value;

    this.service.matchJob({
      resumeId: this.resumeId,
      jobTitle: values.jobTitle!,
      jobDescription: values.jobDescription!,
      companyName: values.companyName || undefined,
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

  getMatchColor(percentage: number): string {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  }
}
