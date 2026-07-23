import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-skill-chip-list',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <div class="chip-wrapper">
      <p class="chip-title" *ngIf="title">{{ title }}</p>
      <mat-chip-set>
        <mat-chip
          *ngFor="let skill of skills"
          [style.background-color]="bgColor"
          [style.color]="textColor"
        >
          {{ skill }}
        </mat-chip>
        <span *ngIf="skills.length === 0" class="empty-text">None detected</span>
      </mat-chip-set>
    </div>
  `,
  styles: [`
    .chip-wrapper { margin-bottom: 8px; }
    .chip-title {
      font-size: 13px;
      font-weight: 700;
      color: #e2e8f0;
      margin: 0 0 8px;
      letter-spacing: 0.01em;
    }
    .empty-text { font-size: 13px; color: #94a3b8; }
    mat-chip-set { display: flex; flex-wrap: wrap; gap: 6px; }
    ::ng-deep .mdc-evolution-chip { border: 1px solid rgba(148, 163, 184, 0.18); }
  `],
})
export class SkillChipListComponent {
  @Input() title = '';
  @Input() skills: string[] = [];
  @Input() bgColor = '#dbeafe';
  @Input() textColor = '#1d4ed8';
}
