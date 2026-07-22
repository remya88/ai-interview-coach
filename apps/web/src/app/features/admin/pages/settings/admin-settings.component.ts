import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { AdminStore } from '../../store/admin.store';
import { AIConfiguration } from '../../models/admin.model';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>AI Configuration</h1>
        <p class="subtitle">Manage AI model settings</p>
      </div>

      <div *ngIf="store.loading()" class="loading-center">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <div *ngIf="!store.loading()" class="settings-layout">

        <!-- Current Configs List -->
        <mat-card class="config-list-card">
          <mat-card-header>
            <mat-card-title>AI Configurations</mat-card-title>
            <button mat-icon-button (click)="showCreateForm = !showCreateForm" class="add-btn">
              <mat-icon>add</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="config-list">
              <div
                *ngFor="let config of store.aiConfigs()"
                class="config-item"
                [class.active]="config.isActive"
              >
                <div class="config-info">
                  <p class="model-name">
                    {{ config.modelName }}
                    <span *ngIf="config.isActive" class="active-badge">ACTIVE</span>
                  </p>
                  <p class="config-detail">
                    temp: {{ config.temperature }} |
                    tokens: {{ config.maxTokens }} |
                    v{{ config.systemPromptVersion }}
                  </p>
                  <p *ngIf="config.description" class="config-desc">{{ config.description }}</p>
                </div>
                <div class="config-actions">
                  <button mat-button color="primary"
                    *ngIf="!config.isActive"
                    (click)="activateConfig(config)">
                    Set Active
                  </button>
                  <button mat-icon-button (click)="editConfig(config)">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
              </div>

              <p *ngIf="store.aiConfigs().length === 0" class="empty">
                No configurations yet. Create one below.
              </p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Create / Edit Form -->
        <mat-card *ngIf="showCreateForm || editingConfig" class="config-form-card">
          <mat-card-header>
            <mat-card-title>{{ editingConfig ? 'Edit Configuration' : 'New Configuration' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="config-form">
              <mat-form-field appearance="outline">
                <mat-label>Model Name</mat-label>
                <input matInput formControlName="modelName" placeholder="gpt-4o-mini" />
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Temperature (0-2)</mat-label>
                  <input matInput type="number" formControlName="temperature" min="0" max="2" step="0.1" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Max Tokens</mat-label>
                  <input matInput type="number" formControlName="maxTokens" min="100" max="8000" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" *ngIf="editingConfig">
                <mat-label>System Prompt Version</mat-label>
                <input matInput formControlName="systemPromptVersion" placeholder="1.0" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description (optional)</mat-label>
                <input matInput formControlName="description" />
              </mat-form-field>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancelForm()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="configForm.invalid">
                  {{ editingConfig ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; font-weight: 700; margin: 0; } .subtitle { color: #6b7280; margin: 6px 0 0; } }
    .loading-center { display: flex; justify-content: center; padding: 64px; }

    .settings-layout { display: flex; flex-direction: column; gap: 24px; }

    .config-list-card, .config-form-card { border-radius: 12px; }
    mat-card-title { font-size: 18px; font-weight: 600; }

    mat-card-header { display: flex; justify-content: space-between; align-items: center; }

    .config-list { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }

    .config-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;

      &.active { border-color: #3b82f6; background: #eff6ff; }
    }

    .model-name { font-weight: 600; font-size: 15px; margin: 0 0 4px; }
    .config-detail { font-size: 12px; color: #6b7280; margin: 0 0 2px; font-family: monospace; }
    .config-desc { font-size: 12px; color: #6b7280; margin: 0; }

    .active-badge {
      display: inline-block;
      background: #3b82f6;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }

    .config-actions { display: flex; align-items: center; gap: 8px; }

    .empty { text-align: center; color: #6b7280; padding: 24px; }

    .config-form { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
  `],
})
export class AdminSettingsComponent implements OnInit {
  readonly store = inject(AdminStore);
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  showCreateForm = false;
  editingConfig: AIConfiguration | null = null;

  configForm = this.fb.group({
    modelName: ['', Validators.required],
    temperature: [0.3, [Validators.min(0), Validators.max(2)]],
    maxTokens: [2000, [Validators.min(100), Validators.max(8000)]],
    systemPromptVersion: ['1.0'],
    description: [''],
  });

  ngOnInit(): void {
    this.store.setLoading(true);
    this.adminService.getAIConfigs().subscribe({
      next: (c) => { this.store.setAIConfigs(c); this.store.setLoading(false); },
      error: () => this.store.setLoading(false),
    });
  }

  editConfig(config: AIConfiguration): void {
    this.editingConfig = config;
    this.showCreateForm = false;
    this.configForm.patchValue({
      modelName: config.modelName,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      systemPromptVersion: config.systemPromptVersion,
      description: config.description ?? '',
    });
  }

  activateConfig(config: AIConfiguration): void {
    this.adminService.activateAIConfig(config.id).subscribe({
      next: () => {
        this.store.activateConfig(config.id);
        this.snackBar.open(`${config.modelName} is now active`, 'Close', { duration: 3000 });
      },
    });
  }

  saveConfig(): void {
    if (this.configForm.invalid) return;

    const values = this.configForm.value;

    if (this.editingConfig) {
      this.adminService.updateAIConfig(this.editingConfig.id, {
        modelName: values.modelName!,
        temperature: values.temperature!,
        maxTokens: values.maxTokens!,
        systemPromptVersion: values.systemPromptVersion!,
      }).subscribe({
        next: (c) => {
          this.store.updateConfig(c);
          this.snackBar.open('Configuration updated', 'Close', { duration: 3000 });
          this.cancelForm();
        },
      });
    } else {
      this.adminService.createAIConfig({
        modelName: values.modelName!,
        temperature: values.temperature!,
        maxTokens: values.maxTokens!,
        description: values.description ?? undefined,
      }).subscribe({
        next: (c) => {
          this.store.setAIConfigs([...this.store.aiConfigs(), c]);
          this.snackBar.open('Configuration created', 'Close', { duration: 3000 });
          this.cancelForm();
        },
      });
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingConfig = null;
    this.configForm.reset({ temperature: 0.3, maxTokens: 2000, systemPromptVersion: '1.0' });
  }
}
