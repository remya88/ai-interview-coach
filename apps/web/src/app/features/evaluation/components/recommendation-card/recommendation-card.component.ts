import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-card class="recommendation-card">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2">
          <mat-icon class="text-blue-600">lightbulb</mat-icon>
          {{ title() }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item *ngFor="let rec of recommendations(); let i = index" class="rec-item">
            <div matListItemTitle class="flex items-start gap-3">
              <span class="badge">{{ i + 1 }}</span>
              <span>{{ rec }}</span>
            </div>
          </mat-list-item>
        </mat-list>
        <div *ngIf="recommendations().length === 0" class="empty-state">
          No recommendations available
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .recommendation-card {
      @apply h-full;
    }

    mat-card-header {
      @apply mb-4;
    }

    mat-card-title {
      @apply text-base font-semibold text-gray-800;
    }

    .rec-item {
      @apply py-3 border-b last:border-b-0;
    }

    .badge {
      @apply inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex-shrink-0;
    }

    .empty-state {
      @apply text-center py-8 text-gray-400;
    }
  `],
})
export class RecommendationCardComponent {
  recommendations = input<string[]>([]);
  title = input<string>('Learning Recommendations');
}
