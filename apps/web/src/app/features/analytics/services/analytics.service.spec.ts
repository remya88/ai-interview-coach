import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsDashboard,
  PerformanceTrend,
  SkillAnalytics,
  TechnologyAnalytics,
  AnalyticsHistory,
} from '../models/analytics.model';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsService],
    });

    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboard', () => {
    it('should fetch dashboard data', () => {
      const mockDashboard: AnalyticsDashboard = {
        totalInterviews: 10,
        completedInterviews: 9,
        averageScore: 85,
        totalPracticeHours: 5,
        currentStreak: 3,
        strongestSkills: [],
        weakestSkills: [],
        recentInterviews: [],
      };

      service.getDashboard().subscribe((data) => {
        expect(data).toEqual(mockDashboard);
      });

      const req = httpMock.expectOne('/api/analytics/dashboard');
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);
    });
  });

  describe('getPerformanceTrend', () => {
    it('should fetch performance trend with default days', () => {
      const mockTrend: PerformanceTrend[] = [
        { date: new Date(), averageScore: 85, interviewCount: 1 },
      ];

      service.getPerformanceTrend().subscribe((data) => {
        expect(data).toEqual(mockTrend);
      });

      const req = httpMock.expectOne(
        (r) => r.url === '/api/analytics/performance' && r.params.get('days') === '30',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTrend);
    });

    it('should fetch performance trend with custom days', () => {
      const mockTrend: PerformanceTrend[] = [];

      service.getPerformanceTrend(7).subscribe((data) => {
        expect(data).toEqual(mockTrend);
      });

      const req = httpMock.expectOne(
        (r) => r.url === '/api/analytics/performance' && r.params.get('days') === '7',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTrend);
    });
  });

  describe('getSkillAnalytics', () => {
    it('should fetch skill analytics', () => {
      const mockSkills: SkillAnalytics[] = [
        {
          skillName: 'Technical Knowledge',
          currentScore: 85,
          improvement: 10,
          attempts: 5,
          category: 'strong',
        },
      ];

      service.getSkillAnalytics().subscribe((data) => {
        expect(data).toEqual(mockSkills);
      });

      const req = httpMock.expectOne('/api/analytics/skills');
      expect(req.request.method).toBe('GET');
      req.flush(mockSkills);
    });
  });

  describe('getTechnologyAnalytics', () => {
    it('should fetch technology analytics', () => {
      const mockTech: TechnologyAnalytics[] = [
        {
          technology: 'JavaScript',
          interviews: 5,
          averageScore: 85,
          bestScore: 90,
          worstScore: 75,
          improvementTrend: 5,
        },
      ];

      service.getTechnologyAnalytics().subscribe((data) => {
        expect(data).toEqual(mockTech);
      });

      const req = httpMock.expectOne('/api/analytics/technology');
      expect(req.request.method).toBe('GET');
      req.flush(mockTech);
    });
  });

  describe('getInterviewHistory', () => {
    it('should fetch interview history with default params', () => {
      const mockHistory: AnalyticsHistory = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };

      service.getInterviewHistory().subscribe((data) => {
        expect(data).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === '/api/analytics/history' &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '10',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should fetch interview history with filters', () => {
      const mockHistory: AnalyticsHistory = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };

      service
        .getInterviewHistory(1, 20, 'JavaScript', 'Hard')
        .subscribe((data) => {
          expect(data).toEqual(mockHistory);
        });

      const req = httpMock.expectOne(
        (r) =>
          r.url === '/api/analytics/history' &&
          r.params.get('technology') === 'JavaScript' &&
          r.params.get('difficulty') === 'Hard',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });
  });

  describe('getPerformanceSummary', () => {
    it('should fetch performance summary', () => {
      const mockSummary = {
        data: {
          overallTrend: 'improving' as const,
          trendPercentage: 5,
          nextLevelThreshold: 85,
          estimatedDaysToNextLevel: 10,
        },
        timestamp: new Date(),
      };

      service.getPerformanceSummary().subscribe((data) => {
        expect(data.data).toEqual(mockSummary.data);
        expect(data.timestamp).toBeDefined();
      });

      const req = httpMock.expectOne('/api/analytics/summary');
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });
  });
});
