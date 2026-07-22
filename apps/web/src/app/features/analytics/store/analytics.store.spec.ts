import { TestBed } from '@angular/core/testing';
import { AnalyticsStore } from './analytics.store';
import {
  AnalyticsDashboard,
  PerformanceTrend,
  SkillAnalytics,
  TechnologyAnalytics,
  PerformanceSummary,
} from '../models/analytics.model';

describe('AnalyticsStore', () => {
  let store: AnalyticsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsStore],
    });
    store = TestBed.inject(AnalyticsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('Selectors', () => {
    it('should return dashboard data', () => {
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

      store.setDashboard(mockDashboard);
      expect(store.dashboard()).toEqual(mockDashboard);
    });

    it('should return default values when no data', () => {
      expect(store.totalInterviews()).toBe(0);
      expect(store.averageScore()).toBe(0);
      expect(store.loading()).toBe(false);
      expect(store.hasError()).toBe(false);
    });
  });

  describe('Mutations', () => {
    it('should set dashboard data', () => {
      const mockDashboard: AnalyticsDashboard = {
        totalInterviews: 10,
        completedInterviews: 9,
        averageScore: 85,
        totalPracticeHours: 5,
        currentStreak: 3,
        strongestSkills: [{ skill: 'JavaScript', score: 90 }],
        weakestSkills: [{ skill: 'System Design', score: 65 }],
        recentInterviews: [],
      };

      store.setDashboard(mockDashboard);
      expect(store.averageScore()).toBe(85);
      expect(store.totalInterviews()).toBe(10);
    });

    it('should set performance data', () => {
      const mockTrend: PerformanceTrend[] = [
        { date: new Date(), averageScore: 85, interviewCount: 1 },
      ];

      store.setPerformanceData(mockTrend);
      expect(store.performanceData()).toEqual(mockTrend);
    });

    it('should set skill data', () => {
      const mockSkills: SkillAnalytics[] = [
        {
          skillName: 'Technical',
          currentScore: 85,
          improvement: 10,
          attempts: 5,
          category: 'strong',
        },
      ];

      store.setSkillData(mockSkills);
      expect(store.skillData()).toEqual(mockSkills);
    });

    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);

      store.setLoading(false);
      expect(store.loading()).toBe(false);
    });

    it('should set error message', () => {
      const errorMsg = 'Test error';
      store.setError(errorMsg);
      expect(store.error()).toBe(errorMsg);
      expect(store.hasError()).toBe(true);

      store.setError(null);
      expect(store.hasError()).toBe(false);
    });

    it('should reset store', () => {
      store.setDashboard({
        totalInterviews: 10,
        completedInterviews: 9,
        averageScore: 85,
        totalPracticeHours: 5,
        currentStreak: 3,
        strongestSkills: [],
        weakestSkills: [],
        recentInterviews: [],
      });
      store.setLoading(true);

      store.reset();

      expect(store.dashboard()).toBeNull();
      expect(store.loading()).toBe(false);
    });
  });

  describe('Computed Selectors', () => {
    it('should compute strongest skills correctly', () => {
      const mockDashboard: AnalyticsDashboard = {
        totalInterviews: 10,
        completedInterviews: 9,
        averageScore: 85,
        totalPracticeHours: 5,
        currentStreak: 3,
        strongestSkills: [
          { skill: 'JavaScript', score: 90 },
          { skill: 'TypeScript', score: 88 },
        ],
        weakestSkills: [],
        recentInterviews: [],
      };

      store.setDashboard(mockDashboard);
      expect(store.strongestSkills().length).toBe(2);
    });

    it('should compute overall trend correctly', () => {
      const mockSummary: PerformanceSummary = {
        overallTrend: 'improving',
        trendPercentage: 5,
        nextLevelThreshold: 85,
        estimatedDaysToNextLevel: 10,
      };

      store.setPerformanceSummary(mockSummary);
      expect(store.overallTrend()).toBe('improving');
      expect(store.trendPercentage()).toBe(5);
    });
  });
});
