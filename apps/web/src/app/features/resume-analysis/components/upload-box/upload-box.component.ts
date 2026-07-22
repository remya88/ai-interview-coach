import {
  Component,
  Output,
  EventEmitter,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-upload-box',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule, MatButtonModule],
  template: `
    <div
      class="upload-zone"
      [class.drag-over]="isDragging()"
      [class.has-file]="selectedFile()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
    >
      <input
        #fileInput
        type="file"
        accept=".pdf,.docx"
        (change)="onFileSelect($event)"
        style="display: none"
      />

      <ng-container *ngIf="!selectedFile(); else fileSelected">
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-cyan-200">
            <mat-icon class="!text-5xl">cloud_upload</mat-icon>
          </div>
          <h3 class="text-xl font-semibold text-white">Drag & Drop your resume here</h3>
          <p class="text-sm text-slate-300">Supports PDF and DOCX (max 5 MB)</p>
          <button mat-raised-button color="primary" (click)="fileInput.click()">
            Browse Files
          </button>
        </div>
      </ng-container>

      <ng-template #fileSelected>
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-200">
            <mat-icon class="!text-5xl">description</mat-icon>
          </div>
          <p class="text-lg font-semibold text-white">{{ selectedFile()!.name }}</p>
          <p class="text-sm text-slate-400">{{ formatSize(selectedFile()!.size) }}</p>
          <div class="flex flex-wrap justify-center gap-3">
            <button mat-button color="primary" (click)="fileInput.click()">
              Change File
            </button>
            <button mat-raised-button color="primary" (click)="onUpload()">
              Upload Resume
            </button>
          </div>
        </div>
      </ng-template>

      <p *ngIf="error()" class="mt-4 text-sm text-rose-300">{{ error() }}</p>
    </div>
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed rgba(34, 211, 238, 0.25);
      border-radius: 20px;
      padding: 36px 24px;
      text-align: center;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .upload-zone.drag-over {
      border-color: #22d3ee;
      background: rgba(8, 47, 73, 0.7);
    }

    .upload-zone.has-file {
      border-color: #34d399;
      background: rgba(6, 78, 59, 0.55);
    }
  `],
})
export class UploadBoxComponent {
  @Output() fileUploaded = new EventEmitter<File>();

  selectedFile = signal<File | null>(null);
  isDragging = signal(false);
  error = signal<string | null>(null);

  private readonly MAX_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('button')) {
      // clicking the zone itself (not a button) — do nothing; buttons handle their own click
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.validateAndSetFile(file);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.validateAndSetFile(file);
  }

  onUpload(): void {
    const file = this.selectedFile();
    if (file) this.fileUploaded.emit(file);
  }

  private validateAndSetFile(file: File): void {
    this.error.set(null);

    if (!this.ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      this.error.set('Only PDF and DOCX files are supported.');
      return;
    }

    if (file.size > this.MAX_SIZE) {
      this.error.set('File size must not exceed 5 MB.');
      return;
    }

    this.selectedFile.set(file);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
