import { TestBed } from '@angular/core/testing';
import { ResumeStore } from './resume.store';
import { ResumeFile, ResumeAnalysis, JobMatchResult } from '../models/resume.model';

describe('ResumeStore', () => {
  let store: ResumeStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ResumeStore] });
    store = TestBed.inject(ResumeStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have default empty state', () => {
    expect(store.resumes()).toEqual([]);
    expect(store.selectedResume()).toBeNull();
    expect(store.analysis()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.hasResumes()).toBe(false);
    expect(store.hasAnalysis()).toBe(false);
    expect(store.hasError()).toBe(false);
  });

  it('setResumes should update resumes signal', () => {
    const mockResumes: ResumeFile[] = [
      {
        id: 'r-1',
        userId: 'u-1',
        originalFilename: 'cv.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        processingStatus: 'COMPLETED',
        uploadedAt: new Date(),
      },
    ];
    store.setResumes(mockResumes);
    expect(store.resumes()).toEqual(mockResumes);
    expect(store.hasResumes()).toBe(true);
  });

  it('addResume should prepend to list', () => {
    store.setResumes([{ id: 'r-1', userId: 'u-1', originalFilename: 'old.pdf', fileType: 'application/pdf', fileSize: 500, processingStatus: 'COMPLETED', uploadedAt: new Date() }]);
    store.addResume({ id: 'r-2', userId: 'u-1', originalFilename: 'new.pdf', fileType: 'application/pdf', fileSize: 800, processingStatus: 'UPLOADED', uploadedAt: new Date() });
    expect(store.resumes()[0].id).toBe('r-2');
    expect(store.resumes().length).toBe(2);
  });

  it('setAnalysis should update analysis and hasAnalysis', () => {
    const mockAnalysis: ResumeAnalysis = {
      id: 'a-1',
      resumeId: 'r-1',
      overallScore: 85,
      atsScore: 88,
      skillScore: 82,
      experienceScore: 80,
      formatScore: 90,
      experienceLevel: 'SENIOR',
      detectedSkills: ['TypeScript'],
      strengths: ['Good'],
      weaknesses: ['Cloud gap'],
      missingKeywords: ['k8s'],
      recommendations: ['Learn cloud'],
      improvedSummary: 'Better summary',
      summary: 'Strong developer',
      createdAt: new Date(),
    };
    store.setAnalysis(mockAnalysis);
    expect(store.hasAnalysis()).toBe(true);
    expect(store.analysis()?.overallScore).toBe(85);
  });

  it('setLoading and setError should update state', () => {
    store.setLoading(true);
    expect(store.loading()).toBe(true);

    store.setError('Test error');
    expect(store.hasError()).toBe(true);
    expect(store.errorMessage()).toBe('Test error');
  });

  it('setMatchResult should update matchResult and hasMatchResult', () => {
    const mockMatch: JobMatchResult = {
      id: 'jm-1',
      resumeId: 'r-1',
      jobDescriptionId: 'jd-1',
      matchPercentage: 80,
      matchedSkills: ['TypeScript'],
      missingSkills: ['k8s'],
      skillGap: { critical: ['k8s'], optional: [] },
      recommendations: ['Learn k8s'],
      interviewPreparationTips: ['Study system design'],
      jobDescription: { id: 'jd-1', jobTitle: 'Engineer' },
      createdAt: new Date(),
    };
    store.setMatchResult(mockMatch);
    expect(store.hasMatchResult()).toBe(true);
    expect(store.matchResult()?.matchPercentage).toBe(80);
  });

  it('reset should clear all state', () => {
    store.setLoading(true);
    store.setError('error');
    store.setResumes([{ id: 'r-1', userId: 'u-1', originalFilename: 'cv.pdf', fileType: 'application/pdf', fileSize: 500, processingStatus: 'COMPLETED', uploadedAt: new Date() }]);

    store.reset();

    expect(store.resumes()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.hasResumes()).toBe(false);
  });
});
