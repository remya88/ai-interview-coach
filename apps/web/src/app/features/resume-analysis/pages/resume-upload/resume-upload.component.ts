import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResumeAnalysisService } from '../../services/resume-analysis.service';
import { ResumeStore } from '../../store/resume.store';
import { UploadBoxComponent } from '../../components/upload-box/upload-box.component';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    UploadBoxComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
      <div class="mx-auto flex max-w-5xl flex-col gap-6">
        <div class="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.3em] text-cyan-300">Resume Analyzer</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Upload your resume for AI review</h1>
          <p class="mt-3 max-w-2xl text-slate-300">Get a score, improve weak areas, and compare your profile against target job descriptions.</p>
        </div>

        <div *ngIf="store.loading()" class="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-8 text-center shadow-xl">
          <div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
            <mat-spinner [diameter]="42"></mat-spinner>
          </div>
          <p class="mt-4 text-lg font-semibold text-white">Uploading and processing your resume...</p>
        </div>

        <div *ngIf="!store.loading()" class="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-4 shadow-xl sm:p-6">
          <app-upload-box (fileUploaded)="onFileUploaded($event)"></app-upload-box>
        </div>

        <div *ngIf="store.hasError()" class="rounded-xl border border-rose-300/40 bg-rose-500/10 p-4 text-rose-100">
          <div class="flex items-center gap-2">
            <mat-icon>error</mat-icon>
            <span>{{ store.errorMessage() }}</span>
          </div>
        </div>

        <div *ngIf="store.hasResumes()" class="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">Your Resumes</h2>
            <span class="text-sm text-slate-400">Recent uploads</span>
          </div>
          <div class="flex flex-col gap-3">
            <mat-card
              *ngFor="let resume of store.resumes()"
              class="cursor-pointer overflow-hidden border border-slate-700/60 bg-slate-950/60 transition hover:border-cyan-400/40"
              (click)="viewResume(resume.id)"
            >
              <mat-card-content>
                <div class="flex items-center gap-3">
                  <div class="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-200">
                    <mat-icon>description</mat-icon>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-semibold text-white">{{ resume.originalFilename }}</p>
                    <p class="mt-1 text-sm text-slate-400">
                      {{ resume.fileType.includes('pdf') ? 'PDF' : 'DOCX' }} •
                      {{ formatSize(resume.fileSize) }} •
                      Uploaded {{ resume.uploadedAt | date:'mediumDate' }}
                    </p>
                  </div>
                  <span class="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    {{ resume.processingStatus }}
                  </span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``],
})
export class ResumeUploadComponent implements OnInit {
  readonly store = inject(ResumeStore);
  private readonly service = inject(ResumeAnalysisService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadResumes();
  }

  private loadResumes(): void {
    this.service.getResumes().subscribe({
      next: (resumes) => this.store.setResumes(resumes),
      error: () => { /* silent – new users have no resumes */ },
    });
  }

  onFileUploaded(file: File): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.service.uploadResume(file).subscribe({
      next: (resume) => {
        this.store.setLoading(false);
        this.store.addResume(resume);
        this.snackBar.open('Resume uploaded successfully!', 'Close', { duration: 4000 });
        this.router.navigate(['/resume-analysis', resume.id]);
      },
      error: (err) => {
        this.store.setLoading(false);
        this.store.setError(err.error?.message ?? 'Upload failed. Please try again.');
      },
    });
  }

  viewResume(id: string): void {
    this.router.navigate(['/resume-analysis', id]);
  }

  formatSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
