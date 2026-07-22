import { Injectable, signal, computed } from '@angular/core';
import {
  AnalyticsDashboard,
  PerformanceTrend,
  SkillAnalytics,
  TechnologyAnalytics,
  PerformanceSummary,
  AnalyticsHistory,
} from '../models/analytics.model';

interface AnalyticsState {
  dashboard: AnalyticsDashboard | null;
  performanceData: PerformanceTrend[];
  skillData: SkillAnalytics[];
  technologyData: TechnologyAnalytics[];
  historyData: AnalyticsHistory | null;
  performanceSummary: PerformanceSummary | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsStore {
  private readonly state = signal<AnalyticsState>({
    dashboard: null,
    performanceData: [],
    skillData: [],
    technologyData: [],
    historyData: null,
    performanceSummary: null,
    loading: false,
    error: null,
  });

  // Selectors
  dashboard = computed(() => this.state().dashboard);
  performanceData = computed(() => this.state().performanceData);
  skillData = computed(() => this.state().skillData);
  technologyData = computed(() => this.state().technologyData);
  historyData = computed(() => this.state().historyData);
  performanceSummary = computed(() => this.state().performanceSummary);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  // Computed properties
  averageScore = computed(() => this.dashboard()?.averageScore || 0);
  totalInterviews = computed(() => this.dashboard()?.totalInterviews || 0);
  completedInterviews = computed(() => this.dashboard()?.completedInterviews || 0);
  currentStreak = computed(() => this.dashboard()?.currentStreak || 0);
  totalPracticeHours = computed(
    () => this.dashboard()?.totalPracticeHours || 0,
  );

  strongestSkills = computed(() => this.dashboard()?.strongestSkills || []);
  weakestSkills = computed(() => this.dashboard()?.weakestSkills || []);
  recentInterviews = computed(() => this.dashboard()?.recentInterviews || []);

  topTechnologies = computed(() =>
    this.technologyData()
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5),
  );

  improvingSkills = computed(() =>
    this.skillData().filter((s) => s.category === 'improving'),
  );

  overallTrend = computed(() => this.performanceSummary()?.overallTrend || 'stable');
  trendPercentage = computed(
    () => this.performanceSummary()?.trendPercentage || 0,
  );
  nextLevelThreshold = computed(
    () => this.performanceSummary()?.nextLevelThreshold || 0,
  );
  estimatedDaysToNextLevel = computed(
    () => this.performanceSummary()?.estimatedDaysToNextLevel || 0,
  );

  isLoading = computed(() => this.loading());
  hasError = computed(() => !!this.error());
  errorMessage = computed(() => this.error());

  // Mutations
  setDashboard(dashboard: AnalyticsDashboard): void {
    this.state.update((state) => ({ ...state, dashboard }));
  }

  setPerformanceData(data: PerformanceTrend[]): void {
    this.state.update((state) => ({ ...state, performanceData: data }));
  }

  setSkillData(data: SkillAnalytics[]): void {
    this.state.update((state) => ({ ...state, skillData: data }));
  }

  setTechnologyData(data: TechnologyAnalytics[]): void {
    this.state.update((state) => ({ ...state, technologyData: data }));
  }

  setHistoryData(data: AnalyticsHistory): void {
    this.state.update((state) => ({ ...state, historyData: data }));
  }

  setPerformanceSummary(summary: PerformanceSummary): void {
    this.state.update((state) => ({ ...state, performanceSummary: summary }));
  }

  setLoading(loading: boolean): void {
    this.state.update((state) => ({ ...state, loading }));
  }

  setError(error: string | null): void {
    this.state.update((state) => ({ ...state, error }));
  }

  reset(): void {
    this.state.set({
      dashboard: null,
      performanceData: [],
      skillData: [],
      technologyData: [],
      historyData: null,
      performanceSummary: null,
      loading: false,
      error: null,
    });
  }
}
