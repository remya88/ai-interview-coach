import { TestBed } from '@angular/core/testing';
import { AdminStore } from './admin.store';
import { AdminDashboard, AIConfiguration, SystemError } from '../models/admin.model';

describe('AdminStore', () => {
  let store: AdminStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminStore] });
    store = TestBed.inject(AdminStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have default empty state', () => {
    expect(store.dashboard()).toBeNull();
    expect(store.users()).toBeNull();
    expect(store.aiUsage()).toBeNull();
    expect(store.aiConfigs()).toEqual([]);
    expect(store.errors()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('setDashboard should update dashboard signal', () => {
    const mockDash: AdminDashboard = {
      totalUsers: 100,
      activeUsers: 80,
      newUsersThisWeek: 5,
      totalInterviews: 500,
      completedInterviews: 400,
      completionRate: 80,
      averageScore: 78,
      totalResumes: 50,
      totalAIRequests: 1000,
      criticalErrorsLast24h: 2,
    };
    store.setDashboard(mockDash);
    expect(store.dashboard()).toEqual(mockDash);
  });

  it('setAIConfigs should update and activeConfig computed', () => {
    const configs: AIConfiguration[] = [
      {
        id: 'c-1',
        modelName: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 2000,
        systemPromptVersion: '1.0',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'c-2',
        modelName: 'gpt-4',
        temperature: 0.5,
        maxTokens: 4000,
        systemPromptVersion: '1.0',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    store.setAIConfigs(configs);
    expect(store.aiConfigs()).toEqual(configs);
    expect(store.activeConfig()?.id).toBe('c-2');
  });

  it('updateConfig should update existing config', () => {
    const configs: AIConfiguration[] = [
      {
        id: 'c-1',
        modelName: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 2000,
        systemPromptVersion: '1.0',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    store.setAIConfigs(configs);

    const updated = { ...configs[0], temperature: 0.5 };
    store.updateConfig(updated);

    expect(store.aiConfigs()[0].temperature).toBe(0.5);
  });

  it('activateConfig should set isActive on specified config', () => {
    const configs: AIConfiguration[] = [
      { id: 'c-1', modelName: 'gpt-4o-mini', isActive: true } as any,
      { id: 'c-2', modelName: 'gpt-4', isActive: false } as any,
    ];
    store.setAIConfigs(configs);
    store.activateConfig('c-2');

    expect(store.aiConfigs()[0].isActive).toBe(false);
    expect(store.aiConfigs()[1].isActive).toBe(true);
  });

  it('setErrors and criticalErrors computed should filter HIGH+CRITICAL', () => {
    const errors: SystemError[] = [
      { id: 'e-1', service: 'api', errorMessage: 'error', severity: 'LOW', createdAt: new Date() },
      { id: 'e-2', service: 'api', errorMessage: 'error', severity: 'CRITICAL', createdAt: new Date() },
      { id: 'e-3', service: 'api', errorMessage: 'error', severity: 'HIGH', createdAt: new Date() },
    ];
    store.setErrors(errors);

    expect(store.criticalErrors().length).toBe(2);
    expect(store.criticalErrors().every(e => e.severity === 'CRITICAL' || e.severity === 'HIGH')).toBe(true);
  });

  it('reset should clear all state', () => {
    store.setDashboard({ totalUsers: 100 } as any);
    store.setLoading(true);
    store.setError('test error');

    store.reset();

    expect(store.dashboard()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('hasError computed should return true when error is set', () => {
    expect(store.hasError()).toBe(false);
    store.setError('Test error');
    expect(store.hasError()).toBe(true);
  });
});
