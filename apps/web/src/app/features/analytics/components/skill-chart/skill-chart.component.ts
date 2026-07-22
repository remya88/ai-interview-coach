import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

export interface SkillChartData {
  name: string;
  score: number;
  color: string;
}

@Component({
  selector: 'app-skill-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="skill-chart-card">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="skills-list">
          <div *ngFor="let skill of skills" class="skill-item">
            <div class="skill-header">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-score">{{ skill.score }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="skill.score"
                [style.backgroundColor]="skill.color"
              ></div>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .skill-chart-card {
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

    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .skill-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .skill-name {
      font-size: 14px;
      font-weight: 500;
      color: #cbd5e1;
    }

    .skill-score {
      font-size: 14px;
      font-weight: 700;
      color: #f8fafc;
    }

    .progress-bar {
      height: 8px;
      background-color: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }
  `],
})
export class SkillChartComponent implements OnInit {
  @Input() title = 'Skills Assessment';
  @Input() skills: SkillChartData[] = [];

  ngOnInit(): void {
    // Ensure colors are set
    this.skills = this.skills.map((skill) => ({
      ...skill,
      color: skill.color || this.getColorForScore(skill.score),
    }));
  }

  private getColorForScore(score: number): string {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 65) return '#f59e0b';
    return '#ef4444';
  }
}
