import {
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InterviewCategory } from '../../models/interview.model';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <mat-card
        *ngFor="let category of categories()"
        class="cursor-pointer border-2 border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"
        [class.ring-2]="isSelected(category.id)"
        [class.ring-cyan-500]="isSelected(category.id)"
        [class.border-cyan-400]="isSelected(category.id)"
        [class.bg-cyan-50]="isSelected(category.id)"
        (click)="selectCategory(category)"
      >
        <mat-card-content class="p-4">
          <div class="mb-2 flex items-center justify-between gap-2">
            <h3 class="text-lg font-semibold text-slate-900">{{ category.name }}</h3>
            <mat-icon *ngIf="isSelected(category.id)" class="text-cyan-600">
              check_circle
            </mat-icon>
          </div>
          <p *ngIf="category.description" class="mt-2 text-sm text-slate-600">
            {{ category.description }}
          </p>
          <div class="mt-4 flex justify-between text-xs">
            <span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Role Track</span>
            <span *ngIf="isSelected(category.id)" class="font-semibold text-cyan-700">Selected</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CategorySelectorComponent {
  categories = input<InterviewCategory[]>([]);
  selected = output<InterviewCategory>();
  selectedId = input<string | null>(null);

  isSelected(categoryId: string): boolean {
    return this.selectedId() === categoryId;
  }

  selectCategory(category: InterviewCategory) {
    this.selected.emit(category);
  }
}
