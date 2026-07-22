import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InterviewType } from '@prisma/client';
import { INTERVIEW_TYPES } from '../../models/interview.model';

interface InterviewTypeOption {
  value: InterviewType;
  label: string;
  description: string;
}

@Component({
  selector: 'app-interview-type-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
      <div
        *ngFor="let option of interviewTypeOptions"
        class="cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 hover:-translate-y-0.5"
        [class.border-fuchsia-500]="isSelected(option.value)"
        [class.shadow-lg]="isSelected(option.value)"
        [class.shadow-fuchsia-200]="isSelected(option.value)"
        [class.bg-fuchsia-50]="isSelected(option.value)"
        [class.border-slate-300]="!isSelected(option.value)"
        (click)="selectType(option.value)"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</span>
          <mat-icon *ngIf="isSelected(option.value)" class="text-fuchsia-600">check_circle</mat-icon>
        </div>
        <h3 class="font-semibold text-slate-900">{{ option.label }}</h3>
        <p class="mt-2 text-xs text-slate-600">{{ option.description }}</p>
      </div>
    </div>
  `,
})
export class InterviewTypeSelectorComponent {
  selected = output<InterviewType>();
  selectedValue = input<InterviewType | null>(null);

  readonly interviewTypeOptions: InterviewTypeOption[] = INTERVIEW_TYPES as any;

  isSelected(type: InterviewType): boolean {
    return this.selectedValue() === type;
  }

  selectType(type: InterviewType) {
    this.selected.emit(type);
  }
}
