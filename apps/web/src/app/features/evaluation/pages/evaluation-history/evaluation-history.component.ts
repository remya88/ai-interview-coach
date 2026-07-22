import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationHistory } from '../../models/evaluation.model';

@Component({
  selector: 'app-evaluation-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    FormsModule,
  ],
  template: `
    <div class="container mx-auto py-8 px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Evaluation History</h1>
        <p class="text-gray-600">View your past interview evaluations and track your progress</p>
      </div>

      <!-- Filters -->
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Technology</label>
            <input
              [(ngModel)]="selectedTechnology"
              placeholder="Filter by technology"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              [(ngModel)]="fromDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              [(ngModel)]="toDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button (click)="applyFilters()" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Apply Filters
          </button>
          <button (click)="resetFilters()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Reset
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-16">
        <mat-spinner [diameter]="50"></mat-spinner>
      </div>

      <!-- Table -->
      <div *ngIf="!loading() && evaluations().length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <table mat-table [dataSource]="evaluations()" class="w-full">
          <!-- Date Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Date
            </th>
            <td mat-cell *matCellDef="let element" class="px-6 py-4 text-sm text-gray-500">
              {{ element.date | date: 'MMM dd, yyyy' }}
            </td>
          </ng-container>

          <!-- Technology Column -->
          <ng-container matColumnDef="technology">
            <th mat-header-cell *matHeaderCellDef class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Technology
            </th>
            <td mat-cell *matCellDef="let element" class="px-6 py-4 text-sm">
              <mat-chip class="bg-blue-100 text-blue-700">{{ element.technology }}</mat-chip>
            </td>
          </ng-container>

          <!-- Difficulty Column -->
          <ng-container matColumnDef="difficulty">
            <th mat-header-cell *matHeaderCellDef class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Difficulty
            </th>
            <td mat-cell *matCellDef="let element" class="px-6 py-4 text-sm">
              <mat-chip
                [class]="
                  element.difficulty === 'ADVANCED' || element.difficulty === 'SENIOR' || element.difficulty === 'ARCHITECT'
                    ? 'bg-red-100 text-red-700'
                    : element.difficulty === 'INTERMEDIATE'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                "
              >
                {{ element.difficulty }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Score Column -->
          <ng-container matColumnDef="score">
            <th mat-header-cell *matHeaderCellDef class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Score
            </th>
            <td mat-cell *matCellDef="let element" class="px-6 py-4 text-sm font-semibold">
              <span [class]="getScoreClass(element.overallScore)">
                {{ element.overallScore | number: '1.0-0' }}/100
              </span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Actions
            </th>
            <td mat-cell *matCellDef="let element" class="px-6 py-4 text-sm">
              <button
                mat-icon-button
                [routerLink]="['/evaluation', element.interviewId]"
                matTooltip="View Details"
                class="text-blue-500 hover:text-blue-700"
              >
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <!-- Paginator -->
        <mat-paginator
          [pageSizeOptions]="[5, 10, 20]"
          [pageSize]="pageSize()"
          [length]="totalCount()"
          (page)="onPageChange($event)"
        ></mat-paginator>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && evaluations().length === 0" class="text-center py-16">
        <mat-icon class="text-6xl text-gray-300 mb-4">assessment</mat-icon>
        <h3 class="text-lg font-semibold text-gray-600 mb-2">No Evaluations Found</h3>
        <p class="text-gray-500 mb-6">You haven't completed any interviews yet.</p>
        <button routerLink="/interview/setup" mat-raised-button color="primary">
          Start an Interview
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .container {
      max-width: 1200px;
    }
  `],
})
export class EvaluationHistoryComponent implements OnInit, OnDestroy {
  private readonly evaluationService = inject(EvaluationService);
  private destroy$ = new Subject<void>();

  evaluations = signal<EvaluationHistory[]>([]);
  loading = signal<boolean>(false);
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);
  totalCount = signal<number>(0);

  selectedTechnology = '';
  fromDate = '';
  toDate = '';

  displayedColumns: string[] = ['date', 'technology', 'difficulty', 'score', 'actions'];

  ngOnInit() {
    this.loadHistory();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory() {
    this.loading.set(true);

    const fromDateObj = this.fromDate ? new Date(this.fromDate) : undefined;
    const toDateObj = this.toDate ? new Date(this.toDate) : undefined;

    this.evaluationService
      .getEvaluationHistory(
        this.currentPage(),
        this.pageSize(),
        this.selectedTechnology || undefined,
        fromDateObj,
        toDateObj,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.evaluations.set(response.data);
          this.totalCount.set(response.pagination.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadHistory();
  }

  resetFilters() {
    this.selectedTechnology = '';
    this.fromDate = '';
    this.toDate = '';
    this.currentPage.set(1);
    this.loadHistory();
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadHistory();
  }

  getScoreClass(score: number): string {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
}
