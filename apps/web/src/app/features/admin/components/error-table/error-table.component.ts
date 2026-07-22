import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { SystemError } from '../../models/admin.model';

@Component({
  selector: 'app-error-table',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatChipsModule],
  template: `
    <mat-card class="error-card">
      <mat-card-header>
        <mat-card-title>System Error Logs</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="errors" class="error-table">

          <ng-container matColumnDef="severity">
            <th mat-header-cell *matHeaderCellDef>Severity</th>
            <td mat-cell *matCellDef="let e">
              <span class="severity-badge" [class]="'sev-' + e.severity.toLowerCase()">
                {{ e.severity }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="service">
            <th mat-header-cell *matHeaderCellDef>Service</th>
            <td mat-cell *matCellDef="let e">{{ e.service }}</td>
          </ng-container>

          <ng-container matColumnDef="message">
            <th mat-header-cell *matHeaderCellDef>Message</th>
            <td mat-cell *matCellDef="let e" class="message-cell">{{ e.errorMessage }}</td>
          </ng-container>

          <ng-container matColumnDef="time">
            <th mat-header-cell *matHeaderCellDef>Time</th>
            <td mat-cell *matCellDef="let e">{{ e.createdAt | date:'short' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>

        <p *ngIf="errors.length === 0" class="no-errors">
          No errors found in the selected period.
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .error-card { border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    mat-card-title { font-size: 18px; font-weight: 600; }

    .error-table { width: 100%; }

    .message-cell {
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
    }

    .severity-badge {
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;

      &.sev-critical { background: #fee2e2; color: #dc2626; }
      &.sev-high { background: #ffedd5; color: #c2410c; }
      &.sev-medium { background: #fef9c3; color: #ca8a04; }
      &.sev-low { background: #dcfce7; color: #16a34a; }
    }

    .no-errors { text-align: center; color: #6b7280; padding: 24px; }
  `],
})
export class ErrorTableComponent {
  @Input() errors: SystemError[] = [];
  columns = ['severity', 'service', 'message', 'time'];
}
