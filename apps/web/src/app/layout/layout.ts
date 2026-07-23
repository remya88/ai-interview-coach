import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../features/auth/services/auth.service';
import { AuthStore } from '../features/auth/store/auth.store';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="shell">
      <header class="topbar" *ngIf="authStore.isAuthenticated()">
        <div class="brand-block">
          <span class="brand-pill">AI Interview Coach</span>
          <span class="brand-subtitle">Interview prep workspace</span>
        </div>

        <nav class="nav-links">
          <a routerLink="/dashboard">Dashboard</a>
          <a routerLink="/resume-analysis">Resume Analysis</a>
          <a routerLink="/interview/setup">Interview</a>
        </nav>

        <button mat-stroked-button class="logout-btn" (click)="logout()">
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </header>

      <main class="content-shell">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `.shell { min-height: 100vh; background: #020617; color: #f8fafc; }`,
    `.topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid rgba(148, 163, 184, 0.2); background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 20; }`,
    `.brand-block { display: flex; flex-direction: column; gap: 0.2rem; }`,
    `.brand-pill { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #67e8f9; }`,
    `.brand-subtitle { font-size: 0.95rem; color: #cbd5e1; }`,
    `.nav-links { display: flex; flex-wrap: wrap; gap: 1rem; margin-left: auto; margin-right: 0.75rem; justify-content: flex-start; }`,
    `.nav-links a { color: #e2e8f0; text-decoration: none; font-weight: 600; }`,
    `.logout-btn { border-radius: 999px; color: #ffffff !important; border-color: rgba(34, 211, 238, 0.35); margin-left: 0; }`,
    `.logout-btn .mdc-button__label { color: #ffffff !important; }`,
    `.content-shell { min-height: calc(100vh - 80px); }`,
  ],
})
export class LayoutComponent {
  readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authStore.setLoading(true);
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        this.authStore.clearAuth();
        this.router.navigate(['/']);
      },
      error: () => {
        this.authService.clearSession();
        this.authStore.clearAuth();
        this.router.navigate(['/']);
      },
    });
  }
}
