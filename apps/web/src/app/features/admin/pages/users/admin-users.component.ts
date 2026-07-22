import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { AdminStore } from '../../store/admin.store';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { AdminUserSummary } from '../../models/admin.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    UserTableComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>User Management</h1>
        <p class="subtitle">{{ store.users()?.pagination?.total ?? 0 }} total users</p>
      </div>

      <div *ngIf="store.loading()" class="loading-center">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <app-user-table
        *ngIf="!store.loading() && store.users()"
        [users]="store.users()?.data ?? []"
        [totalItems]="store.users()?.pagination?.total ?? 0"
        [pageSize]="currentQuery.limit ?? 20"
        (search)="onSearch($event)"
        (filter)="onFilter($event)"
        (pageChange)="onPageChange($event)"
        (toggleStatus)="onToggleStatus($event)"
        (changeRole)="onChangeRole($event)"
      ></app-user-table>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
    .page-header {
      margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; margin: 0; }
      .subtitle { color: #6b7280; margin: 6px 0 0; }
    }
    .loading-center { display: flex; justify-content: center; padding: 64px; }
  `],
})
export class AdminUsersComponent implements OnInit {
  readonly store = inject(AdminStore);
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  currentQuery: { page?: number; limit?: number; search?: string; role?: string } = {
    page: 1,
    limit: 20,
  };

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.currentQuery = { ...this.currentQuery, search: term, page: 1 };
        this.loadUsers();
      });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.store.setLoading(true);
    this.adminService.getUsers(this.currentQuery).subscribe({
      next: (u) => { this.store.setUsers(u); this.store.setLoading(false); },
      error: () => { this.store.setLoading(false); },
    });
  }

  onSearch(term: string): void { this.searchSubject.next(term); }

  onFilter(f: { role?: string }): void {
    this.currentQuery = { ...this.currentQuery, ...f, page: 1 };
    this.loadUsers();
  }

  onPageChange(e: { page: number; limit: number }): void {
    this.currentQuery = { ...this.currentQuery, ...e };
    this.loadUsers();
  }

  onToggleStatus(user: AdminUserSummary): void {
    this.adminService.updateUserStatus(user.id, !user.isActive).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.isActive ? 'deactivated' : 'activated'}`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: () => this.snackBar.open('Failed to update user status', 'Close', { duration: 4000 }),
    });
  }

  onChangeRole(user: AdminUserSummary): void {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.snackBar.open(`Role changed to ${newRole}`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: () => this.snackBar.open('Failed to update role', 'Close', { duration: 4000 }),
    });
  }
}
