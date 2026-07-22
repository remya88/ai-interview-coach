import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InterviewService } from './interview.service';
import { Technology, InterviewCategory, InterviewSetupConfig } from '../models/interview.model';

describe('InterviewService', () => {
  let service: InterviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InterviewService],
    });
    service = TestBed.inject(InterviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTechnologies', () => {
    it('should fetch technologies', () => {
      const mockTechs: Technology[] = [
        { id: '1', name: 'Angular', slug: 'angular' },
        { id: '2', name: 'React', slug: 'react' },
      ];

      service.getTechnologies().subscribe(techs => {
        expect(techs).toEqual(mockTechs);
      });

      const req = httpMock.expectOne('/api/technologies');
      expect(req.request.method).toBe('GET');
      req.flush(mockTechs);
    });
  });

  describe('getCategories', () => {
    it('should fetch categories', () => {
      const mockCats: InterviewCategory[] = [
        { id: '1', name: 'Frontend', slug: 'frontend' },
        { id: '2', name: 'Backend', slug: 'backend' },
      ];

      service.getCategories().subscribe(cats => {
        expect(cats).toEqual(mockCats);
      });

      const req = httpMock.expectOne('/api/categories');
      expect(req.request.method).toBe('GET');
      req.flush(mockCats);
    });
  });

  describe('createInterview', () => {
    it('should create interview with config', () => {
      const config: InterviewSetupConfig = {
        technologyId: 'tech-1',
        categoryId: 'cat-1',
        difficulty: 'INTERMEDIATE' as any,
        interviewType: 'TECHNICAL' as any,
        questionCount: 10,
      };

      const mockInterview = {
        id: 'interview-1',
        status: 'CREATED',
        ...config,
        createdAt: new Date().toISOString(),
        technology: { id: 'tech-1', name: 'Angular', slug: 'angular' },
        category: { id: 'cat-1', name: 'Frontend', slug: 'frontend' },
      };

      service.createInterview(config).subscribe(interview => {
        expect(interview.id).toBe('interview-1');
        expect(interview.questionCount).toBe(10);
      });

      const req = httpMock.expectOne('/api/interviews');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(config);
      req.flush(mockInterview);
    });
  });

  describe('getDashboard', () => {
    it('should fetch dashboard data', () => {
      const mockDashboard = {
        totalInterviews: 5,
        completedInterviews: 3,
        averageScore: 75,
      };

      service.getDashboard().subscribe(data => {
        expect(data.totalInterviews).toBe(5);
      });

      const req = httpMock.expectOne('/api/interviews/dashboard');
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);
    });
  });

  describe('startInterview', () => {
    it('should start interview session', () => {
      const interviewId = 'interview-1';

      service.startInterview(interviewId).subscribe(result => {
        expect(result.status).toBe('IN_PROGRESS');
      });

      const req = httpMock.expectOne(`/api/interviews/${interviewId}/start`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'IN_PROGRESS' });
    });
  });
});
