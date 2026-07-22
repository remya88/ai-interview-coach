import { Injectable, signal, computed } from '@angular/core';
import {
  ResumeFile,
  ResumeAnalysis,
  ResumeReport,
  JobMatchResult,
} from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeStore {
  // ─── State ───────────────────────────────────────────────────────────────
  private readonly _resumes = signal<ResumeFile[]>([]);
  private readonly _selectedResume = signal<ResumeFile | null>(null);
  private readonly _analysis = signal<ResumeAnalysis | null>(null);
  private readonly _report = signal<ResumeReport | null>(null);
  private readonly _matchResult = signal<JobMatchResult | null>(null);
  private readonly _matchHistory = signal<JobMatchResult[]>([]);
  private readonly _loading = signal(false);
  private readonly _uploadProgress = signal(0);
  private readonly _error = signal<string | null>(null);

  // ─── Selectors ───────────────────────────────────────────────────────────
  readonly resumes = this._resumes.asReadonly();
  readonly selectedResume = this._selectedResume.asReadonly();
  readonly analysis = this._analysis.asReadonly();
  readonly report = this._report.asReadonly();
  readonly matchResult = this._matchResult.asReadonly();
  readonly matchHistory = this._matchHistory.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasResumes = computed(() => this._resumes().length > 0);
  readonly hasAnalysis = computed(() => this._analysis() !== null);
  readonly hasMatchResult = computed(() => this._matchResult() !== null);
  readonly hasError = computed(() => this._error() !== null);
  readonly errorMessage = computed(() => this._error());

  readonly latestAnalysis = computed(
    () => this._report()?.analysis ?? this._analysis(),
  );

  // ─── Mutations ───────────────────────────────────────────────────────────
  setResumes(resumes: ResumeFile[]): void { this._resumes.set(resumes); }
  addResume(resume: ResumeFile): void {
    this._resumes.update((r) => [resume, ...r]);
  }
  setSelectedResume(resume: ResumeFile | null): void { this._selectedResume.set(resume); }
  setAnalysis(analysis: ResumeAnalysis | null): void { this._analysis.set(analysis); }
  setReport(report: ResumeReport | null): void { this._report.set(report); }
  setMatchResult(result: JobMatchResult | null): void { this._matchResult.set(result); }
  setMatchHistory(history: JobMatchResult[]): void { this._matchHistory.set(history); }
  setLoading(loading: boolean): void { this._loading.set(loading); }
  setUploadProgress(progress: number): void { this._uploadProgress.set(progress); }
  setError(error: string | null): void { this._error.set(error); }

  reset(): void {
    this._resumes.set([]);
    this._selectedResume.set(null);
    this._analysis.set(null);
    this._report.set(null);
    this._matchResult.set(null);
    this._loading.set(false);
    this._error.set(null);
  }
}
