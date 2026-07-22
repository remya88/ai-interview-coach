import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ResumeFile,
  ResumeAnalysis,
  ResumeReport,
  JobMatchRequest,
  JobMatchResult,
} from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeAnalysisService {
  private readonly resumeApi = '/api/resume';
  private readonly jobApi = '/api/job-analysis';

  constructor(private readonly http: HttpClient) {}

  // ─── Resume APIs ────────────────────────────────────────────────────────

  uploadResume(file: File): Observable<ResumeFile> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ResumeFile>(`${this.resumeApi}/upload`, formData);
  }

  getResumes(): Observable<ResumeFile[]> {
    return this.http.get<ResumeFile[]>(this.resumeApi);
  }

  getResume(id: string): Observable<ResumeFile> {
    return this.http.get<ResumeFile>(`${this.resumeApi}/${id}`);
  }

  analyzeResume(id: string): Observable<ResumeAnalysis> {
    return this.http.post<ResumeAnalysis>(`${this.resumeApi}/${id}/analyze`, {});
  }

  getResumeReport(id: string): Observable<ResumeReport> {
    return this.http.get<ResumeReport>(`${this.resumeApi}/${id}/report`);
  }

  // ─── Job Match APIs ──────────────────────────────────────────────────────

  matchJob(request: JobMatchRequest): Observable<JobMatchResult> {
    return this.http.post<JobMatchResult>(`${this.jobApi}/match`, request);
  }

  getMatchResult(id: string): Observable<JobMatchResult> {
    return this.http.get<JobMatchResult>(`${this.jobApi}/${id}`);
  }

  getMatchHistory(): Observable<JobMatchResult[]> {
    return this.http.get<JobMatchResult[]>(this.jobApi);
  }
}
