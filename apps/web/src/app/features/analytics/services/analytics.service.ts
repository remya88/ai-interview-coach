import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AnalyticsDashboard,
  PerformanceTrend,
  SkillAnalytics,
  TechnologyAnalytics,
  AnalyticsHistory,
  PerformanceSummary,
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly apiUrl = '/api/analytics';

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard data
   */
  getDashboard(): Observable<AnalyticsDashboard> {
    return this.http.get<AnalyticsDashboard>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Get performance trend
   */
  getPerformanceTrend(days = 30): Observable<PerformanceTrend[]> {
    let params = new HttpParams();
    params = params.set('days', days.toString());
    return this.http.get<PerformanceTrend[]>(`${this.apiUrl}/performance`, {
      params,
    });
  }

  /**
   * Get skill analytics
   */
  getSkillAnalytics(): Observable<SkillAnalytics[]> {
    return this.http.get<SkillAnalytics[]>(`${this.apiUrl}/skills`);
  }

  /**
   * Get technology analytics
   */
  getTechnologyAnalytics(): Observable<TechnologyAnalytics[]> {
    return this.http.get<TechnologyAnalytics[]>(`${this.apiUrl}/technology`);
  }

  /**
   * Get interview history with filters
   */
  getInterviewHistory(
    page = 1,
    limit = 10,
    technology?: string,
    difficulty?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Observable<AnalyticsHistory> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (technology) {
      params = params.set('technology', technology);
    }
    if (difficulty) {
      params = params.set('difficulty', difficulty);
    }
    if (fromDate) {
      params = params.set('fromDate', fromDate.toISOString());
    }
    if (toDate) {
      params = params.set('toDate', toDate.toISOString());
    }

    return this.http.get<AnalyticsHistory>(`${this.apiUrl}/history`, {
      params,
    });
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Observable<{ data: PerformanceSummary; timestamp: Date }> {
    return this.http.get<{
      data: PerformanceSummary;
      timestamp: Date;
    }>(`${this.apiUrl}/summary`);
  }
}
