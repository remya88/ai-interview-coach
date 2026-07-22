import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { DifficultyLevel } from '@prisma/client';
import { DIFFICULTY_LEVELS } from '../../models/interview.model';

interface DifficultyOption {
  value: DifficultyLevel;
  label: string;
  description: string;
}

@Component({
  selector: 'app-difficulty-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatRadioModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
      <div
        *ngFor="let option of difficultyOptions"
        class="cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 hover:-translate-y-0.5"
        [class.border-cyan-500]="isSelected(option.value)"
        [class.shadow-lg]="isSelected(option.value)"
        [class.shadow-cyan-200]="isSelected(option.value)"
        [class.bg-cyan-50]="isSelected(option.value)"
        [class.border-slate-300]="!isSelected(option.value)"
        (click)="selectDifficulty(option.value)"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Level</span>
          <mat-icon *ngIf="isSelected(option.value)" class="text-cyan-600">check_circle</mat-icon>
        </div>
        <h3 class="font-semibold text-slate-900">{{ option.label }}</h3>
        <p class="mt-2 text-xs text-slate-600">{{ option.description }}</p>
      </div>
    </div>
  `,
})
export class DifficultySelectorComponent {
  selected = output<DifficultyLevel>();
  selectedValue = input<DifficultyLevel | null>(null);

  readonly difficultyOptions: DifficultyOption[] = DIFFICULTY_LEVELS as any;

  isSelected(difficulty: DifficultyLevel): boolean {
    return this.selectedValue() === difficulty;
  }

  selectDifficulty(difficulty: DifficultyLevel) {
    this.selected.emit(difficulty);
  }
}
