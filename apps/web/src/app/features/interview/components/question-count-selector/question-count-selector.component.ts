import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { QUESTION_COUNTS } from '../../models/interview.model';

@Component({
  selector: 'app-question-count-selector',
  standalone: true,
  imports: [CommonModule, MatSliderModule, MatButtonModule, FormsModule],
  template: `
    <div class="space-y-6 rounded-2xl border border-slate-200 bg-white p-4">
      <!-- Button Group -->
      <div class="flex flex-wrap gap-2">
        <button
          *ngFor="let count of QUESTION_COUNTS"
          mat-raised-button
          (click)="selectCount(count)"
          [class.bg-emerald-600]="isSelected(count)"
          [class.text-white]="isSelected(count)"
          [class.bg-slate-200]="!isSelected(count)"
        >
          {{ count }} Q
        </button>
      </div>

      <!-- Slider -->
      <div class="mt-6">
        <div class="mb-2 flex justify-between">
          <label class="text-sm font-medium text-slate-700">Number of Questions: <strong>{{ value() }}</strong></label>
          <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Flexible</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          [value]="value()"
          (change)="onSliderChange($event)"
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-300"
        />
        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      <!-- Info -->
      <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
        <p><strong>{{ value() }} questions</strong> will take approximately <strong>{{ estimatedTime() }} minutes</strong></p>
      </div>
    </div>
  `,
})
export class QuestionCountSelectorComponent {
  selected = output<number>();
  value = input<number>(5);

  readonly QUESTION_COUNTS = QUESTION_COUNTS;

  isSelected(count: number): boolean {
    return this.value() === count;
  }

  onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectCount(+target.value);
  }

  selectCount(count: number) {
    if (count >= 1 && count <= 20) {
      this.selected.emit(count);
    }
  }

  estimatedTime(): number {
    return this.value() * 3; // ~3 minutes per question
  }
}
