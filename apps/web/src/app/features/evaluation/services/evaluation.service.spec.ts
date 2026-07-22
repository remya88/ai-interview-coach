import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EvaluationService } from './evaluation.service';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvaluationService],
    });

    service = TestBed.inject(EvaluationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('startEvaluation', () => {
    it('should call POST endpoint', (done) => {
      const mockResponse = { evaluationId: 'eval-1', status: 'PROCESSING' };

      service.startEvaluation('interview-1').subscribe(result => {
        expect(result.evaluationId).toBe('eval-1');
        expect(result.status).toBe('PROCESSING');
        done();
      });

      const req = httpMock.expectOne('/api/evaluation/interview/interview-1');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getEvaluation', () => {
    it('should call GET endpoint', (done) => {
      const mockResponse = {
        evaluationId: 'eval-1',
        status: 'COMPLETED',
        overallScore: 85,
      };

      service.getEvaluation('interview-1').subscribe(result => {
        expect(result.overallScore).toBe(85);
        done();
      });

      const req = httpMock.expectOne('/api/evaluation/interview/interview-1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getQuestionEvaluation', () => {
    it('should call GET endpoint for question', (done) => {
      const mockResponse = {
        evaluationId: 'eval-1',
        status: 'COMPLETED',
        overallScore: 85,
      };

      service.getQuestionEvaluation('q-1').subscribe(result => {
        expect(result.overallScore).toBe(85);
        done();
      });

      const req = httpMock.expectOne('/api/evaluation/question/q-1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getEvaluationHistory', () => {
    it('should call GET endpoint with pagination', (done) => {
      const mockResponse = {
        data: [
          { evaluationId: 'eval-1', overallScore: 85, date: new Date() },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      service.getEvaluationHistory(1, 10).subscribe(result => {
        expect(result.data).toHaveLength(1);
        expect(result.pagination.page).toBe(1);
        done();
      });

      const req = httpMock.expectOne(
        r =>
          r.url === '/api/evaluation/history' &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '10',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include filter parameters', (done) => {
      const mockResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };

      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-01-31');

      service
        .getEvaluationHistory(1, 10, 'JavaScript', fromDate, toDate)
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === '/api/evaluation/history' &&
          r.params.get('technology') === 'JavaScript' &&
          r.params.get('fromDate') !== null &&
          r.params.get('toDate') !== null,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
      done();
    });
  });

  describe('buildReportContent', () => {
    it('should create a report with the current evaluation summary', () => {
      const evaluation = {
        interviewId: 'interview-1',
        status: 'COMPLETED' as const,
        overallScore: 84,
        scores: {
          technicalKnowledge: 82,
          architecture: 80,
          communication: 86,
          problemSolving: 84,
          codeQuality: 85,
        },
        averageScores: {
          technicalKnowledge: 82,
          architecture: 80,
          communication: 86,
          problemSolving: 84,
          codeQuality: 85,
        },
        questionsEvaluated: 3,
        questionsFailed: 0,
        totalQuestions: 3,
        startedAt: new Date(),
        questions: [],
        strengths: ['Clear explanation'],
        weaknesses: ['Needs more examples'],
        learningRecommendations: ['Practice structure'],
      };

      const report = service.buildReportContent('interview-1', evaluation as any);

      expect(report).toContain('AI Interview Evaluation Report');
      expect(report).toContain('Overall Score: 84/100');
      expect(report).toContain('Clear explanation');
      expect(report).toContain('Practice structure');
    });
  });

  describe('pollEvaluationStatus', () => {
    it('should poll until completion', (done) => {
      const mockResponse1 = {
        evaluationId: 'eval-1',
        status: 'PROCESSING',
        overallScore: 0,
      };
      const mockResponse2 = {
        evaluationId: 'eval-1',
        status: 'COMPLETED',
        overallScore: 85,
      };

      let callCount = 0;

      service.pollEvaluationStatus('interview-1', 100, 10).subscribe({
        next: result => {
          expect(result).toBeDefined();
          callCount++;

          if (callCount === 1) {
            expect(result.status).toBe('PROCESSING');
          } else if (callCount === 2) {
            expect(result.status).toBe('COMPLETED');
          }
        },
        complete: () => {
          expect(callCount).toBe(2);
          done();
        },
      });

      // First poll
      const req1 = httpMock.expectOne('/api/evaluation/interview/interview-1');
      req1.flush(mockResponse1);

      // Second poll (after delay)
      setTimeout(() => {
        const req2 = httpMock.expectOne(
          '/api/evaluation/interview/interview-1',
        );
        req2.flush(mockResponse2);
      }, 150);
    });

    it('should handle polling timeout', (done) => {
      const mockResponse = {
        evaluationId: 'eval-1',
        status: 'PROCESSING',
        overallScore: 0,
      };

      service
        .pollEvaluationStatus('interview-1', 50, 2)
        .subscribe({
          error: err => {
            expect(err.message).toContain('timeout');
            done();
          },
        });

      // First poll
      const req1 = httpMock.expectOne('/api/evaluation/interview/interview-1');
      req1.flush(mockResponse);

      // Second poll
      setTimeout(() => {
        const req2 = httpMock.expectOne(
          '/api/evaluation/interview/interview-1',
        );
        req2.flush(mockResponse);
      }, 100);
    });
  });
});
