import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly currentUser = signal<unknown>(null);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);



  setUser(user: unknown) {
    this.currentUser.set(user);
    this.isAuthenticated.set(Boolean(user));
  }

  setLoading(value: boolean) {
    this.isLoading.set(value);
  }

  setError(message: string | null) {
    this.error.set(message);
  }
}
