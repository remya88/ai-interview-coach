import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-interview-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-toolbar color="primary" class="sticky top-0 z-10">
      <div class="flex justify-between items-center w-full">
        <!-- Left: Interview Info -->
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold">{{ technologyName() }}</h1>
          <span class="text-sm opacity-80">{{ categoryName() }}</span>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <button
            mat-icon-button
            [matTooltip]="isPaused() ? 'Resume Interview' : 'Pause Interview'"
            (click)="togglePause.emit()"
            class="hover:bg-white hover:bg-opacity-20"
          >
            <mat-icon>{{ isPaused() ? 'play_arrow' : 'pause' }}</mat-icon>
          </button>

          <button
            mat-icon-button
            matTooltip="Exit Interview"
            (click)="exit.emit()"
            class="hover:bg-white hover:bg-opacity-20"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>
  `,
})
export class InterviewHeaderComponent {
  technologyName = input<string>('Interview');
  categoryName = input<string>('');
  isPaused = input<boolean>(false);

  togglePause = output<void>();
  exit = output<void>();
}
