import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResumeAnalysisService } from './resume-analysis.service';

describe('ResumeAnalysisService', () => {
  let service: ResumeAnalysisService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResumeAnalysisService],
    });
    service = TestBed.inject(ResumeAnalysisService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uploadResume should POST to /api/resume/upload with FormData', () => {
    const file = new File(['content'], 'cv.pdf', { type: 'application/pdf' });
    service.uploadResume(file).subscribe();
    const req = httpMock.expectOne('/api/resume/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ id: 'r-1' });
  });

  it('getResumes should GET /api/resume', () => {
    service.getResumes().subscribe((r) => expect(Array.isArray(r)).toBe(true));
    const req = httpMock.expectOne('/api/resume');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getResume should GET /api/resume/:id', () => {
    service.getResume('r-1').subscribe();
    const req = httpMock.expectOne('/api/resume/r-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'r-1' });
  });

  it('analyzeResume should POST to /api/resume/:id/analyze', () => {
    service.analyzeResume('r-1').subscribe();
    const req = httpMock.expectOne('/api/resume/r-1/analyze');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'a-1', overallScore: 85 });
  });

  it('getResumeReport should GET /api/resume/:id/report', () => {
    service.getResumeReport('r-1').subscribe();
    const req = httpMock.expectOne('/api/resume/r-1/report');
    expect(req.request.method).toBe('GET');
    req.flush({ resume: {}, analysis: null });
  });

  it('matchJob should POST to /api/job-analysis/match', () => {
    const payload = {
      resumeId: 'r-1',
      jobTitle: 'Engineer',
      jobDescription: 'Full stack role',
    };
    service.matchJob(payload).subscribe();
    const req = httpMock.expectOne('/api/job-analysis/match');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'jm-1', matchPercentage: 80 });
  });

  it('getMatchResult should GET /api/job-analysis/:id', () => {
    service.getMatchResult('jm-1').subscribe();
    const req = httpMock.expectOne('/api/job-analysis/jm-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'jm-1' });
  });

  it('getMatchHistory should GET /api/job-analysis', () => {
    service.getMatchHistory().subscribe();
    const req = httpMock.expectOne('/api/job-analysis');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
