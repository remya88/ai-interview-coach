import {
  Component,
  OnInit,
  signal,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatStepperModule,
  MatStepper,
} from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InterviewService } from '../../services/interview.service';
import { InterviewSetupStore } from '../../store/interview-setup.store';
import { Technology, InterviewCategory } from '../../models/interview.model';
import { TechnologySelectorComponent } from '../../components/technology-selector/technology-selector.component';
import { CategorySelectorComponent } from '../../components/category-selector/category-selector.component';
import { DifficultySelectorComponent } from '../../components/difficulty-selector/difficulty-selector.component';
import { InterviewTypeSelectorComponent } from '../../components/interview-type-selector/interview-type-selector.component';
import { QuestionCountSelectorComponent } from '../../components/question-count-selector/question-count-selector.component';
import { SetupSummaryComponent } from '../../components/setup-summary/setup-summary.component';

@Component({
  selector: 'app-interview-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TechnologySelectorComponent,
    CategorySelectorComponent,
    DifficultySelectorComponent,
    InterviewTypeSelectorComponent,
    QuestionCountSelectorComponent,
    SetupSummaryComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="mb-8 grid gap-4 rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-cyan-300">AI Interview Coach</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Build Your Interview Session</h1>
            <p class="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Pick your stack, role focus, and challenge level. The interview will be generated instantly based on your configuration.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl border border-white/10 bg-slate-800/70 p-3">
              <p class="text-slate-400">Questions</p>
              <p class="mt-1 text-xl font-bold text-white">{{ store.questionCount() }}</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-slate-800/70 p-3">
              <p class="text-slate-400">Est. Duration</p>
              <p class="mt-1 text-xl font-bold text-white">~{{ store.questionCount() * 3 }} min</p>
            </div>
            <div class="col-span-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">
              <p class="text-xs uppercase tracking-wide text-cyan-200">Current Selection</p>
              <p class="mt-1 text-sm font-semibold text-cyan-100">
                {{ selectedTechnology()?.name || 'Choose technology' }} • {{ selectedCategory()?.name || 'Choose category' }}
              </p>
            </div>
          </div>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <span class="rounded-full border px-3 py-1 text-xs font-semibold" [class]="store.technologyId() ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900/60 text-slate-400'">Technology</span>
          <span class="rounded-full border px-3 py-1 text-xs font-semibold" [class]="store.categoryId() ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900/60 text-slate-400'">Category</span>
          <span class="rounded-full border px-3 py-1 text-xs font-semibold" [class]="store.difficulty() ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900/60 text-slate-400'">Difficulty</span>
          <span class="rounded-full border px-3 py-1 text-xs font-semibold" [class]="store.interviewType() ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900/60 text-slate-400'">Interview Type</span>
          <span class="rounded-full border px-3 py-1 text-xs font-semibold" [class]="store.questionCount() ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900/60 text-slate-400'">Question Count</span>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white p-3 shadow-2xl sm:p-5">
          <div class="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 sm:p-6">
            <!-- Error Message -->
            <div *ngIf="store.error(); let err" class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              <div class="flex items-start justify-between gap-3">
                <span>{{ err }}</span>
                <button (click)="store.setError(null)" class="text-rose-500 hover:text-rose-700" aria-label="Dismiss error">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>

            <!-- Stepper -->
            <mat-stepper #stepper linear>
              <!-- Step 1: Technology -->
              <mat-step [stepControl]="form.get('technology')!" label="Technology">
                <ng-template matStepLabel>Technology</ng-template>

                <div class="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <h2 class="text-xl font-bold text-slate-900">Pick your primary technology</h2>
                  <p class="mt-1 text-sm text-slate-600">Start with the stack you want to practice today.</p>
                </div>
                <div class="py-3">
                  <app-technology-selector
                    [technologies]="technologies()"
                    (selected)="onTechSelect($event, stepper)"
                  />
                </div>

                <div class="mt-4 flex gap-2">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext>Next</button>
                </div>
              </mat-step>

              <!-- Step 2: Category -->
              <mat-step [stepControl]="form.get('category')!" label="Category">
                <ng-template matStepLabel>Category</ng-template>

                <div class="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <h2 class="text-xl font-bold text-slate-900">Choose your interview focus</h2>
                  <p class="mt-1 text-sm text-slate-600">Select a domain to shape question intent.</p>
                </div>
                <div class="py-3">
                  <app-category-selector
                    [categories]="categories()"
                    [selectedId]="store.categoryId()"
                    (selected)="onCategorySelect($event, stepper)"
                  />
                </div>

                <div class="mt-4 flex gap-2">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext>Next</button>
                </div>
              </mat-step>

              <!-- Step 3: Difficulty -->
              <mat-step [stepControl]="form.get('difficulty')!" label="Difficulty">
                <ng-template matStepLabel>Difficulty</ng-template>

                <div class="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <h2 class="text-xl font-bold text-slate-900">Set your challenge level</h2>
                  <p class="mt-1 text-sm text-slate-600">Match the interview depth to your preparation stage.</p>
                </div>
                <div class="py-3">
                  <app-difficulty-selector
                    [selectedValue]="store.difficulty()"
                    (selected)="onDifficultySelect($event, stepper)"
                  />
                </div>

                <div class="mt-4 flex gap-2">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext>Next</button>
                </div>
              </mat-step>

              <!-- Step 4: Interview Type -->
              <mat-step [stepControl]="form.get('interviewType')!" label="Interview Type">
                <ng-template matStepLabel>Interview Type</ng-template>

                <div class="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <h2 class="text-xl font-bold text-slate-900">Select interview mode</h2>
                  <p class="mt-1 text-sm text-slate-600">Technical, coding, design, behavioral, or mixed flow.</p>
                </div>
                <div class="py-3">
                  <app-interview-type-selector
                    [selectedValue]="store.interviewType()"
                    (selected)="onInterviewTypeSelect($event, stepper)"
                  />
                </div>

                <div class="mt-4 flex gap-2">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext>Next</button>
                </div>
              </mat-step>

              <!-- Step 5: Question Count -->
              <mat-step [stepControl]="form.get('questionCount')!" label="Questions">
                <ng-template matStepLabel>Questions</ng-template>

                <div class="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <h2 class="text-xl font-bold text-slate-900">Tune session length</h2>
                  <p class="mt-1 text-sm text-slate-600">Choose how long you want to practice right now.</p>
                </div>
                <div class="py-3">
                  <app-question-count-selector
                    [value]="store.questionCount()"
                    (selected)="onQuestionCountSelect($event)"
                  />
                </div>

                <div class="mt-4 flex gap-2">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext>Next</button>
                </div>
              </mat-step>

              <!-- Step 6: Review -->
              <mat-step label="Review">
                <ng-template matStepLabel>Review</ng-template>

                <div class="py-3">
                  <app-setup-summary
                    [config]="store.config()"
                    [technology]="selectedTechnology()"
                    [category]="selectedCategory()"
                    [loading]="store.loading()"
                    [isValid]="store.isValid()"
                    (start)="startInterview()"
                    (cancel)="onCancel()"
                    (editStep)="stepper.selectedIndex = $event"
                  />
                </div>
              </mat-step>
            </mat-stepper>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep {
        .mat-step-header .mat-step-label {
          font-weight: 600;
        }

        .mat-step-header .mat-step-icon-selected {
          background-color: #0f766e;
        }

        .mat-step-header .mat-step-icon-state-done {
          background-color: #15803d;
        }

        .mat-mdc-stepper-vertical {
          @apply max-w-5xl mx-auto;
        }
      }
    `,
  ],
})
export class InterviewSetupComponent implements OnInit {
  private readonly interviewService = inject(InterviewService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly store = inject(InterviewSetupStore);

  form: FormGroup;

  technologies = signal<Technology[]>([]);
  categories = signal<InterviewCategory[]>([]);

  selectedTechnology = signal<Technology | null>(null);
  selectedCategory = signal<InterviewCategory | null>(null);

  constructor() {
    this.form = this.fb.group({
      technology: [null, Validators.required],
      category: [null, Validators.required],
      difficulty: [null, Validators.required],
      interviewType: [null, Validators.required],
      questionCount: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
    });

    // Load data when component initializes
    effect(() => {
      this.loadData();
    });
  }

  ngOnInit() {
    this.store.reset();
    this.loadData();
  }

  private loadData() {
    this.interviewService.getTechnologies().subscribe({
      next: techs => this.technologies.set(techs),
      error: err => {
        console.error('Failed to load technologies', err);
        this.store.setError('Failed to load technologies. Please try again.');
      },
    });

    this.interviewService.getCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: err => {
        console.error('Failed to load categories', err);
        this.store.setError('Failed to load categories. Please try again.');
      },
    });
  }

  onTechSelect(tech: Technology, stepper: MatStepper) {
    this.selectedTechnology.set(tech);
    this.store.setTechnology(tech.id);
    this.form.get('technology')?.setValue(tech.id);
    this.form.get('technology')?.markAsTouched();
    this.form.get('technology')?.updateValueAndValidity();
    stepper.next();
  }

  onCategorySelect(category: InterviewCategory, stepper: MatStepper) {
    this.selectedCategory.set(category);
    this.store.setCategory(category.id);
    this.form.get('category')?.setValue(category.id);
    this.form.get('category')?.markAsTouched();
    this.form.get('category')?.updateValueAndValidity();
    stepper.next();
  }

  onDifficultySelect(difficulty: any, stepper: MatStepper) {
    this.store.setDifficulty(difficulty);
    this.form.get('difficulty')?.setValue(difficulty);
    this.form.get('difficulty')?.markAsTouched();
    this.form.get('difficulty')?.updateValueAndValidity();
    stepper.next();
  }

  onInterviewTypeSelect(type: any, stepper: MatStepper) {
    this.store.setInterviewType(type);
    this.form.get('interviewType')?.setValue(type);
    this.form.get('interviewType')?.markAsTouched();
    this.form.get('interviewType')?.updateValueAndValidity();
    stepper.next();
  }

  onQuestionCountSelect(count: number) {
    this.store.setQuestionCount(count);
    this.form.get('questionCount')?.setValue(count);
  }

  startInterview() {
    if (!this.store.isValid()) {
      this.store.setError('Please complete all required fields');
      return;
    }

    this.store.setLoading(true);
    this.store.setError(null);

    this.interviewService.createInterview(this.store.config()).subscribe({
      next: interview => {
        this.store.setLoading(false);
        this.snackBar.open('Interview created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/interview', interview.id]);
      },
      error: err => {
        this.store.setLoading(false);
        console.error('Failed to create interview', err);
        this.store.setError(
          err.error?.message || 'Failed to create interview. Please try again.',
        );
      },
    });
  }

  onCancel() {
    if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
      this.router.navigate(['/dashboard']);
    }
  }
}
