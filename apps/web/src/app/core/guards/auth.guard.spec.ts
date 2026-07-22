import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../../features/auth/store/auth.store';

describe('authGuard', () => {
  it('should allow access when authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: { isAuthenticated: () => true } },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const guard = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(guard).toBe(true);
  });
});
