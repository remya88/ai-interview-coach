import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SkillGap } from '../../models/resume.model';

@Component({
  selector: 'app-gap-analysis',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="gap-card">
      <mat-card-header>
        <mat-card-title>Skill Gap Analysis</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="gap-section critical" *ngIf="gap.critical.length > 0">
          <h4><mat-icon>warning</mat-icon> Critical Missing Skills</h4>
          <ul>
            <li *ngFor="let skill of gap.critical">{{ skill }}</li>
          </ul>
        </div>

        <div class="gap-section optional" *ngIf="gap.optional.length > 0">
          <h4><mat-icon>info</mat-icon> Nice-to-Have Skills</h4>
          <ul>
            <li *ngFor="let skill of gap.optional">{{ skill }}</li>
          </ul>
        </div>

        <div class="no-gap" *ngIf="gap.critical.length === 0 && gap.optional.length === 0">
          <mat-icon>check_circle</mat-icon>
          <p>No significant skill gaps detected!</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .gap-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    mat-card-title { font-size: 18px; font-weight: 600; }

    .gap-section {
      margin-bottom: 20px;
      padding: 16px;
      border-radius: 8px;

      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 12px;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 4px 0;
          font-size: 14px;

          &::before { content: '• '; }
        }
      }
    }

    .critical {
      background: #fff1f2;
      border-left: 3px solid #ef4444;

      h4 { color: #dc2626; }
      mat-icon { color: #ef4444; }
      li { color: #7f1d1d; }
    }

    .optional {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;

      h4 { color: #d97706; }
      mat-icon { color: #f59e0b; }
      li { color: #78350f; }
    }

    .no-gap {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #059669;
      padding: 16px;
      background: #ecfdf5;
      border-radius: 8px;

      mat-icon { color: #10b981; }
      p { margin: 0; font-weight: 600; }
    }
  `],
})
export class GapAnalysisComponent {
  @Input() gap: SkillGap = { critical: [], optional: [] };
}
