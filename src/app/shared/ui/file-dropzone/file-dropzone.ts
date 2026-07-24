import { Component, ElementRef, computed, input, model, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { formatBytes } from '../../../core/validation/file-validation';

/**
 * Accessible drag-and-drop file input. Two-way binds the selected `file`,
 * supports click-to-browse and keyboard activation, and shows the chosen
 * file's name and size with a remove control.
 */
@Component({
  selector: 'app-file-dropzone',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './file-dropzone.html',
  styleUrl: './file-dropzone.scss',
})
export class FileDropzone {
  readonly label = input('File');
  readonly accept = input('');
  readonly hint = input('');
  readonly disabled = input(false);
  readonly file = model<File | null>(null);

  protected readonly dragging = signal(false);
  protected readonly sizeLabel = computed(() => {
    const f = this.file();
    return f ? formatBytes(f.size) : '';
  });

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');

  protected open(): void {
    if (!this.disabled()) {
      this.inputEl()?.nativeElement.click();
    }
  }

  protected onSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.[0] ?? null);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (this.disabled()) {
      return;
    }
    const dropped = event.dataTransfer?.files?.[0];
    if (dropped) {
      this.file.set(dropped);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.dragging.set(true);
    }
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.file.set(null);
    const el = this.inputEl()?.nativeElement;
    if (el) {
      el.value = '';
    }
  }
}
