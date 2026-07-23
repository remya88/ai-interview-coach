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
      border-radius: 20px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.74);
      box-shadow: 0 20px 45px rgba(2, 6, 23, 0.32);
      backdrop-filter: blur(16px);
      color: #f8fafc;
    }

    mat-card-title { font-size: 18px; font-weight: 700; color: #f8fafc; }

    .gap-section {
      margin-bottom: 20px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(2, 6, 23, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.16);

      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
        margin: 0 0 12px;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 4px 0;
          font-size: 14px;
          color: #e2e8f0;

          &::before { content: '• '; color: #38bdf8; }
        }
      }
    }

    .critical {
      border-left: 3px solid #fb7185;

      h4 { color: #fda4af; }
      mat-icon { color: #fb7185; }
    }

    .optional {
      border-left: 3px solid #fbbf24;

      h4 { color: #fde68a; }
      mat-icon { color: #fbbf24; }
    }

    .no-gap {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #a7f3d0;
      padding: 16px;
      background: rgba(16, 185, 129, 0.12);
      border-radius: 12px;
      border: 1px solid rgba(16, 185, 129, 0.2);

      mat-icon { color: #34d399; }
      p { margin: 0; font-weight: 600; }
    }
  `],
})
export class GapAnalysisComponent {
  @Input() gap: SkillGap = { critical: [], optional: [] };
}
