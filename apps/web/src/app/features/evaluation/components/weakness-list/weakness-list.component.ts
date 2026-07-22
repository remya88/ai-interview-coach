import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-weakness-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule],
  template: `
    <mat-card class="feedback-card">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2">
          <mat-icon class="text-orange-600">warning</mat-icon>
          {{ title() }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item *ngFor="let item of items()" class="weakness-item">
            <mat-icon matListItemIcon class="text-orange-600">info</mat-icon>
            <div matListItemTitle>{{ item }}</div>
          </mat-list-item>
        </mat-list>
        <div *ngIf="items().length === 0" class="empty-state text-gray-400">
          No items to display
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .feedback-card {
      @apply h-full;
    }

    mat-card-header {
      @apply mb-4;
    }

    mat-card-title {
      @apply text-base font-semibold text-gray-800;
    }

    .weakness-item {
      @apply py-2 border-b last:border-b-0;
    }

    .empty-state {
      @apply text-center py-8;
    }
  `],
})
export class WeaknessListComponent {
  items = input<string[]>([]);
  title = input<string>('Areas for Improvement');
}
