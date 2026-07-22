import {
  Component,
  input,
  output,
  OnInit,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, startWith } from 'rxjs/operators';
import { Technology } from '../../models/interview.model';

@Component({
  selector: 'app-technology-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Technology</h3>
        <span class="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">Required</span>
      </div>

      <mat-form-field class="w-full">
        <mat-label>Select Technology</mat-label>
        <input
          matInput
          [matAutocomplete]="auto"
          [formControl]="searchControl"
          placeholder="Try Angular, React, Node.js..."
        />
        <mat-icon matPrefix class="mr-2 text-slate-400">search</mat-icon>
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onTechSelect($event.option.value)">
          <mat-optgroup *ngFor="let tech of filteredTechs$ | async" [label]="tech.name">
            <mat-option [value]="tech">
              <div class="flex items-center gap-2">
                <span
                  *ngIf="tech.color"
                  class="h-3 w-3 rounded-full"
                  [style.backgroundColor]="tech.color"
                ></span>
                {{ tech.name }}
              </div>
            </mat-option>
          </mat-optgroup>
        </mat-autocomplete>
      </mat-form-field>
    </div>

    <div *ngIf="selectedTech(); let tech" class="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-50 p-4">
      <div class="flex items-start gap-3">
        <span
          *ngIf="tech.color"
          class="mt-1 h-4 w-4 flex-shrink-0 rounded-full"
          [style.backgroundColor]="tech.color"
        ></span>
        <div>
          <p class="text-xs uppercase tracking-wide text-emerald-700">Selected Stack</p>
          <h3 class="font-semibold text-slate-900">{{ tech.name }}</h3>
          <p *ngIf="tech.description" class="mt-1 text-sm text-slate-600">{{ tech.description }}</p>
        </div>
      </div>
    </div>
  `,
})
export class TechnologySelectorComponent implements OnInit {
  technologies = input<Technology[]>([]);
  selected = output<Technology>();

  searchControl = new FormControl('');
  loading = signal(false);
  selectedTech = signal<Technology | null>(null);

  filteredTechs$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    map((value) => this.filterTechs(value)),
  );

  constructor() {
    effect(() => {
      this.filteredTechs$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterTechs(value)),
      );
    });
  }

  ngOnInit() {
    // Technologies are passed as input
  }

  onTechSelect(tech: Technology) {
    this.selectedTech.set(tech);
    this.selected.emit(tech);
    this.searchControl.setValue(tech.name);
  }

  private filterTechs(value: string | Technology | null): Technology[] {
    const query =
      typeof value === 'string'
        ? value
        : value && typeof value === 'object'
          ? value.name
          : '';

    if (!query) {
      return this.technologies();
    }

    const lower = query.toLowerCase();
    return this.technologies().filter(
      t => t.name.toLowerCase().includes(lower) || t.slug.toLowerCase().includes(lower),
    );
  }
}
