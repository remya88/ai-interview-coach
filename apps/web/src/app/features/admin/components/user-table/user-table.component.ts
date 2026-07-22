import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { AdminUserSummary } from '../../models/admin.model';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
  ],
  template: `
    <div class="table-wrapper">
      <!-- Filters -->
      <div class="filters-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search users</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)"
            placeholder="Name or email" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Role</mat-label>
          <mat-select [(ngModel)]="roleFilter" (ngModelChange)="onFilter()">
            <mat-option value="">All</mat-option>
            <mat-option value="USER">User</mat-option>
            <mat-option value="ADMIN">Admin</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Table -->
      <table mat-table [dataSource]="users" class="user-table">

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let u">
            {{ u.firstName }} {{ u.lastName }}
          </td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let u">{{ u.email }}</td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let u">
            <mat-chip [class]="'role-' + u.role.toLowerCase()">{{ u.role }}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let u">
            <span class="status-dot" [class.active]="u.isActive"></span>
            {{ u.isActive ? 'Active' : 'Inactive' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="interviews">
          <th mat-header-cell *matHeaderCellDef>Interviews</th>
          <td mat-cell *matCellDef="let u">{{ u._count?.interviews ?? 0 }}</td>
        </ng-container>

        <ng-container matColumnDef="joined">
          <th mat-header-cell *matHeaderCellDef>Joined</th>
          <td mat-cell *matCellDef="let u">{{ u.createdAt | date:'mediumDate' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let u">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu>
              <button mat-menu-item (click)="onToggleStatus(u)">
                <mat-icon>{{ u.isActive ? 'block' : 'check_circle' }}</mat-icon>
                {{ u.isActive ? 'Deactivate' : 'Activate' }}
              </button>
              <button mat-menu-item (click)="onChangeRole(u)">
                <mat-icon>manage_accounts</mat-icon>
                Make {{ u.role === 'ADMIN' ? 'User' : 'Admin' }}
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <mat-paginator
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 20, 50]"
        (page)="onPageChange($event)"
      ></mat-paginator>
    </div>
  `,
  styles: [`
    .table-wrapper {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      overflow: hidden;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      padding: 16px 24px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .search-field { flex: 1; }
    .filter-field { width: 160px; }

    .user-table { width: 100%; }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d1d5db;
      margin-right: 6px;

      &.active { background: #10b981; }
    }

    ::ng-deep .role-admin { background: #ede9fe !important; color: #7c3aed !important; }
    ::ng-deep .role-user { background: #dbeafe !important; color: #1d4ed8 !important; }
  `],
})
export class UserTableComponent {
  @Input() users: AdminUserSummary[] = [];
  @Input() totalItems = 0;
  @Input() pageSize = 20;

  @Output() search = new EventEmitter<string>();
  @Output() filter = new EventEmitter<{ role?: string }>();
  @Output() pageChange = new EventEmitter<{ page: number; limit: number }>();
  @Output() toggleStatus = new EventEmitter<AdminUserSummary>();
  @Output() changeRole = new EventEmitter<AdminUserSummary>();

  displayedColumns = ['name', 'email', 'role', 'status', 'interviews', 'joined', 'actions'];
  searchTerm = '';
  roleFilter = '';

  onSearch(value: string): void { this.search.emit(value); }
  onFilter(): void { this.filter.emit({ role: this.roleFilter || undefined }); }
  onPageChange(e: PageEvent): void {
    this.pageChange.emit({ page: e.pageIndex + 1, limit: e.pageSize });
  }
  onToggleStatus(user: AdminUserSummary): void { this.toggleStatus.emit(user); }
  onChangeRole(user: AdminUserSummary): void { this.changeRole.emit(user); }
}
