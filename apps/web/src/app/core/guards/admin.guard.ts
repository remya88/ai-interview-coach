import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/auth/store/auth.store';

/**
 * Guards routes to ADMIN-role users only.
 * Redirects unauthenticated users to /login and non-admins to /dashboard.
 */
export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authStore.currentUser() as { role?: string } | null;
  if (!user || user.role !== 'ADMIN') {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
