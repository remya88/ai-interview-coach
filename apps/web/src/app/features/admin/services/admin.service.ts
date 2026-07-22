import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminDashboard,
  AdminUserList,
  AdminUserDetail,
  AIUsageStats,
  AIConfiguration,
  SystemError,
  UserListQuery,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = '/api/admin';

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.api}/dashboard`);
  }

  getUsers(query?: UserListQuery): Observable<AdminUserList> {
    let params = new HttpParams();
    if (query?.page) params = params.set('page', query.page);
    if (query?.limit) params = params.set('limit', query.limit);
    if (query?.search) params = params.set('search', query.search);
    if (query?.role) params = params.set('role', query.role);
    if (query?.isActive !== undefined) params = params.set('isActive', query.isActive);
    return this.http.get<AdminUserList>(`${this.api}/users`, { params });
  }

  getUserDetail(id: string): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.api}/users/${id}`);
  }

  updateUserStatus(id: string, isActive: boolean): Observable<unknown> {
    return this.http.patch(`${this.api}/users/${id}/status`, { isActive });
  }

  updateUserRole(id: string, role: string): Observable<unknown> {
    return this.http.patch(`${this.api}/users/${id}/role`, { role });
  }

  getInterviews(page = 1, limit = 20, filters?: object): Observable<unknown> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params = params.set(k, v);
      });
    }
    return this.http.get(`${this.api}/interviews`, { params });
  }

  getAIUsage(days = 30): Observable<AIUsageStats> {
    return this.http.get<AIUsageStats>(`${this.api}/ai-usage`, {
      params: new HttpParams().set('days', days),
    });
  }

  getAIConfigs(): Observable<AIConfiguration[]> {
    return this.http.get<AIConfiguration[]>(`${this.api}/ai-config`);
  }

  createAIConfig(data: Partial<AIConfiguration>): Observable<AIConfiguration> {
    return this.http.post<AIConfiguration>(`${this.api}/ai-config`, data);
  }

  activateAIConfig(id: string): Observable<AIConfiguration> {
    return this.http.patch<AIConfiguration>(`${this.api}/ai-config/${id}/activate`, {});
  }

  updateAIConfig(id: string, data: Partial<AIConfiguration>): Observable<AIConfiguration> {
    return this.http.patch<AIConfiguration>(`${this.api}/ai-config/${id}`, data);
  }

  getTechnologies(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.api}/technologies`);
  }

  createTechnology(data: object): Observable<unknown> {
    return this.http.post(`${this.api}/technologies`, data);
  }

  updateTechnology(id: string, data: object): Observable<unknown> {
    return this.http.patch(`${this.api}/technologies/${id}`, data);
  }

  deleteTechnology(id: string): Observable<unknown> {
    return this.http.delete(`${this.api}/technologies/${id}`);
  }

  getCategories(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.api}/categories`);
  }

  createCategory(data: object): Observable<unknown> {
    return this.http.post(`${this.api}/categories`, data);
  }

  updateCategory(id: string, data: object): Observable<unknown> {
    return this.http.patch(`${this.api}/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<unknown> {
    return this.http.delete(`${this.api}/categories/${id}`);
  }

  getErrors(severity?: string, days = 7): Observable<SystemError[]> {
    let params = new HttpParams().set('days', days);
    if (severity) params = params.set('severity', severity);
    return this.http.get<SystemError[]>(`${this.api}/errors`, { params });
  }
}
