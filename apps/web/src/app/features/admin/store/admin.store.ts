import { Injectable, signal, computed } from '@angular/core';
import {
  AdminDashboard,
  AdminUserList,
  AIUsageStats,
  AIConfiguration,
  SystemError,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminStore {
  private readonly _dashboard = signal<AdminDashboard | null>(null);
  private readonly _users = signal<AdminUserList | null>(null);
  private readonly _aiUsage = signal<AIUsageStats | null>(null);
  private readonly _aiConfigs = signal<AIConfiguration[]>([]);
  private readonly _errors = signal<SystemError[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly dashboard = this._dashboard.asReadonly();
  readonly users = this._users.asReadonly();
  readonly aiUsage = this._aiUsage.asReadonly();
  readonly aiConfigs = this._aiConfigs.asReadonly();
  readonly errors = this._errors.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasError = computed(() => this._error() !== null);
  readonly errorMessage = computed(() => this._error());
  readonly activeConfig = computed(() =>
    this._aiConfigs().find((c) => c.isActive) ?? null,
  );
  readonly criticalErrors = computed(() =>
    this._errors().filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH'),
  );

  setDashboard(d: AdminDashboard): void { this._dashboard.set(d); }
  setUsers(u: AdminUserList): void { this._users.set(u); }
  setAIUsage(u: AIUsageStats): void { this._aiUsage.set(u); }
  setAIConfigs(c: AIConfiguration[]): void { this._aiConfigs.set(c); }
  setErrors(e: SystemError[]): void { this._errors.set(e); }
  setLoading(v: boolean): void { this._loading.set(v); }
  setError(e: string | null): void { this._error.set(e); }

  updateConfig(updated: AIConfiguration): void {
    this._aiConfigs.update((configs) =>
      configs.map((c) => (c.id === updated.id ? updated : c)),
    );
  }

  activateConfig(id: string): void {
    this._aiConfigs.update((configs) =>
      configs.map((c) => ({ ...c, isActive: c.id === id })),
    );
  }

  reset(): void {
    this._dashboard.set(null);
    this._users.set(null);
    this._aiUsage.set(null);
    this._aiConfigs.set([]);
    this._errors.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
