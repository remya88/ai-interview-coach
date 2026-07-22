import { Component, input, output, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-interview-timer',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="flex items-center gap-3 p-3 rounded-lg" [class]="timerClass()">
      <mat-icon>schedule</mat-icon>
      <div class="text-center">
        <div class="text-2xl font-mono font-bold">
          {{ formatTime(remainingSeconds()) }}
        </div>
        <div class="text-xs text-gray-600">session remaining</div>
      </div>
    </div>
  `,
})
export class InterviewTimerComponent implements OnDestroy {
  remainingSeconds = input<number>(0);
  isRunning = input<boolean>(false);
  warningThreshold = input<number>(60); // Show warning at 1 minute

  tick = output<number>(); // Emit remaining seconds

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const running = this.isRunning();
      const remaining = this.remainingSeconds();

      if (running && remaining > 0) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private startTimer() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      const remaining = Math.max(0, this.remainingSeconds() - 1);
      this.tick.emit(remaining);
      if (remaining <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer() {
    if (!this.intervalId) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  timerClass(): string {
    const remaining = this.remainingSeconds();
    if (remaining <= 0) {
      return 'bg-red-100 text-red-900';
    } else if (remaining <= this.warningThreshold()) {
      return 'bg-yellow-100 text-yellow-900';
    }
    return 'bg-blue-50 text-blue-900';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
