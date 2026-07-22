import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { InterviewHistoryItem } from '../../models/analytics.model';

@Component({
  selector: 'app-interview-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
  ],
  template: `
    <mat-card class="history-card">
      <mat-card-header>
        <mat-card-title>Interview History</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="interviews" class="history-table">
            <!-- Technology Column -->
            <ng-container matColumnDef="technology">
              <th mat-header-cell *matHeaderCellDef>Technology</th>
              <td mat-cell *matCellDef="let element">
                {{ element.technology }}
              </td>
            </ng-container>

            <!-- Score Column -->
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef>Score</th>
              <td mat-cell *matCellDef="let element" class="score-cell">
                <span
                  class="score-badge"
                  [style.backgroundColor]="getScoreColor(element.score)"
                >
                  {{ element.score }}
                </span>
              </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let element">
                {{ element.date | date: 'short' }}
              </td>
            </ng-container>

            <!-- Difficulty Column -->
            <ng-container matColumnDef="difficulty">
              <th mat-header-cell *matHeaderCellDef>Difficulty</th>
              <td mat-cell *matCellDef="let element">
                {{ element.difficulty }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20]"
          (page)="onPageChange($event)"
        ></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .history-card {
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.78);
      box-shadow: 0 20px 50px rgba(2, 8, 23, 0.24);
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 600;
      color: #f8fafc;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      font-weight: 600;
      color: #cbd5e1;
      background-color: rgba(15, 23, 42, 0.9);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    tr:hover {
      background-color: rgba(30, 41, 59, 0.55);
    }

    .score-cell {
      text-align: center;
    }

    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      color: white;
      font-weight: 600;
      font-size: 13px;
    }

    ::ng-deep .mat-paginator {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: transparent;
      color: #cbd5e1;
    }
  `],
})
export class InterviewHistoryComponent {
  @Input() interviews: InterviewHistoryItem[] = [];
  @Input() totalItems = 0;
  @Input() pageSize = 10;

  displayedColumns: string[] = ['technology', 'score', 'date', 'difficulty'];

  onPageChange(event: PageEvent): void {
    // Will be handled by parent component
  }

  getScoreColor(score: number): string {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 65) return '#f59e0b';
    return '#ef4444';
  }
}
