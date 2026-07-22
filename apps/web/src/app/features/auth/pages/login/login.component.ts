import { Component, DestroyRef, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { merge } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div class="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"></div>

      <mat-card class="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/85 p-7 text-slate-100 shadow-2xl shadow-black/40 backdrop-blur">
        <div class="mb-6">
          <p class="mb-2 inline-block rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">AI Interview Coach</p>
          <h2 class="mb-1 text-3xl font-semibold tracking-tight">Welcome back</h2>
          <p class="text-sm text-slate-400">Sign in to continue your interview prep journey.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">
          <mat-form-field appearance="fill" subscriptSizing="dynamic" class="auth-field w-full">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" />
            <mat-error *ngIf="form.controls.email.invalid && form.controls.email.touched">Enter a valid email address.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" subscriptSizing="dynamic" class="auth-field w-full">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" />
            <mat-error *ngIf="form.controls.password.hasError('required') && form.controls.password.touched">Password is required.</mat-error>
            <mat-error *ngIf="form.controls.password.hasError('serverAuth')">{{ form.controls.password.getError('serverAuth') }}</mat-error>
          </mat-form-field>

          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || authStore.isLoading()" class="auth-submit mt-1 h-12 rounded-xl text-base font-semibold">
            {{ authStore.isLoading() ? 'Signing in...' : 'Sign in' }}
          </button>

          <a routerLink="/auth/register" class="auth-link-btn mt-2 text-center text-sm font-medium text-cyan-200 transition hover:text-cyan-100">
            Create an account
          </a>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .auth-field .mat-mdc-text-field-wrapper {
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.7));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
      }

      :host ::ng-deep .auth-field .mdc-text-field--focused .mat-mdc-text-field-wrapper {
        border-color: rgba(34, 211, 238, 0.9);
        box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.18);
        transform: translateY(-1px);
      }

      :host ::ng-deep .auth-field .mdc-floating-label,
      :host ::ng-deep .auth-field .mat-mdc-form-field-icon-suffix {
        color: rgba(226, 232, 240, 0.86) !important;
      }

      :host ::ng-deep .auth-field input.mat-mdc-input-element {
        width: 100%;
        color: #f8fafc;
        caret-color: #22d3ee;
      }

      :host ::ng-deep .auth-field .mat-mdc-form-field-flex,
      :host ::ng-deep .auth-field .mat-mdc-form-field-infix,
      :host ::ng-deep .auth-field .mdc-text-field {
        width: 100% !important;
      }

      :host ::ng-deep .auth-field input.mat-mdc-input-element:-webkit-autofill,
      :host ::ng-deep .auth-field input.mat-mdc-input-element:-webkit-autofill:hover,
      :host ::ng-deep .auth-field input.mat-mdc-input-element:-webkit-autofill:focus {
        -webkit-text-fill-color: #f8fafc;
        transition: background-color 9999s ease-out 0s;
      }

      :host ::ng-deep .auth-field .mat-mdc-form-field-subscript-wrapper {
        padding-top: 2px;
      }

      :host ::ng-deep .auth-field .mdc-line-ripple {
        display: none;
      }

      :host ::ng-deep .auth-submit.mdc-button {
        border: 1px solid rgba(34, 211, 238, 0.45);
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.92), rgba(34, 211, 238, 0.9));
        box-shadow: 0 10px 22px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        letter-spacing: 0.01em;
        transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
      }

      :host ::ng-deep .auth-submit.mdc-button:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.04);
        box-shadow: 0 14px 28px rgba(6, 182, 212, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      :host ::ng-deep .auth-submit.mdc-button:disabled {
        opacity: 0.55;
        box-shadow: none;
      }

      .auth-link-btn {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(6px);
      }

      .auth-link-btn:hover {
        border-color: rgba(34, 211, 238, 0.55);
        background: rgba(8, 47, 73, 0.5);
      }
    `,
  ],
})
export class LoginComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    this.authStore.setError(null);

    merge(this.form.controls.email.valueChanges, this.form.controls.password.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.clearPasswordServerError();
        if (this.authStore.error()) {
          this.authStore.setError(null);
        }
      });

    this.destroyRef.onDestroy(() => {
      this.authStore.setError(null);
      this.authStore.setLoading(false);
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.clearPasswordServerError();
    this.authStore.setError(null);
    this.authStore.setLoading(true);
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.authStore.setUser(response.user);
        this.authStore.setLoading(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err: HttpErrorResponse) => {
        let message = 'Unable to sign in. Please try again.';
        if (err.status === 401) {
          message = 'Invalid email or password. Please try again.';
        } else if (err.status === 404) {
          message = 'Account not found. Please create an account.';
        } else if (err.status === 0) {
          message = 'Unable to reach the server. Please try again.';
        }

        this.form.controls.password.setErrors({
          ...(this.form.controls.password.errors ?? {}),
          serverAuth: message,
        });
        this.form.controls.password.markAsTouched();
        this.authStore.setError(message);
        this.authStore.setLoading(false);
      },
    });
  }

  private clearPasswordServerError() {
    const errors = this.form.controls.password.errors;
    if (!errors || !errors['serverAuth']) {
      return;
    }

    const { serverAuth, ...rest } = errors;
    void serverAuth;
    this.form.controls.password.setErrors(Object.keys(rest).length ? rest : null);
  }
}
