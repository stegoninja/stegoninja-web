import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExtractData, StegoOptions, defaultOptions } from '../../core/api/api.models';
import { StegoApiService } from '../../core/api/stego-api.service';
import { HealthService } from '../../core/api/health.service';
import { StegoApiError } from '../../core/api/stego-error';
import { TECHNIQUES, findTechnique } from '../../core/api/techniques';
import { FileDownloadService } from '../../core/api/file-download.service';
import { validateUploadSize } from '../../core/validation/file-validation';
import { FileDropzone } from '../../shared/ui/file-dropzone/file-dropzone';
import { OptionsForm } from '../../shared/ui/options-form/options-form';
import { ResultCard, ResultMetric } from '../../shared/ui/result-card/result-card';
import { SymmetryCallout } from '../../shared/ui/symmetry-callout/symmetry-callout';
import { TechniqueSelect } from '../../shared/ui/technique-select/technique-select';

type RunStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

/**
 * Standalone extract tool: choose the technique that produced the stego file,
 * attach it, provide the same options/password used at embed, then extract and
 * download the recovered secret (named via the server's originalFilename).
 */
@Component({
  selector: 'app-extract-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    FileDropzone,
    OptionsForm,
    ResultCard,
    SymmetryCallout,
    TechniqueSelect,
  ],
  templateUrl: './extract-page.html',
  styleUrl: './extract-page.scss',
})
export class ExtractPage {
  private readonly api = inject(StegoApiService);
  private readonly downloader = inject(FileDownloadService);
  private readonly health = inject(HealthService);

  readonly technique = input<string | undefined>(undefined);

  protected readonly selectedId = linkedSignal(() => {
    const param = this.technique();
    return param && findTechnique(param) ? param : TECHNIQUES[0].id;
  });
  protected readonly current = computed(() => findTechnique(this.selectedId())!);

  protected readonly stego = signal<File | null>(null);
  protected readonly options = signal<StegoOptions>(defaultOptions());

  protected readonly status = signal<RunStatus>('idle');
  protected readonly progress = signal(0);
  protected readonly result = signal<ExtractData | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly downloading = signal(false);

  protected readonly apiDown = computed(() => this.health.status() === 'down');
  protected readonly busy = computed(
    () => this.status() === 'uploading' || this.status() === 'processing',
  );

  protected readonly sizeError = computed(() => {
    const res = validateUploadSize([this.stego()]);
    return res.ok ? null : res.message!;
  });

  protected readonly canSubmit = computed(
    () => !!this.stego() && !this.sizeError() && !this.busy() && !this.apiDown(),
  );

  protected readonly metrics = computed<ResultMetric[]>(() => {
    const data = this.result();
    return data ? [{ label: 'Recovered file', value: data.originalFilename }] : [];
  });

  protected setSelected(id: string): void {
    this.selectedId.set(id);
    this.reset();
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.errorMessage.set(null);
    this.result.set(null);
    this.status.set('uploading');
    this.progress.set(0);

    this.api
      .runExtract(this.current(), { stego: this.stego()!, options: this.options() })
      .subscribe({
        next: (p) => {
          this.progress.set(p.progress);
          if (p.data) {
            this.result.set(p.data);
            this.status.set('done');
          } else {
            this.status.set(p.phase === 'uploading' ? 'uploading' : 'processing');
          }
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            err instanceof StegoApiError
              ? err.userMessage
              : 'Something went wrong. Please try again.',
          );
          this.status.set('error');
        },
      });
  }

  protected downloadSecret(): void {
    const data = this.result();
    if (!data) {
      return;
    }
    this.downloading.set(true);
    this.api.fetchBlob(data.result).subscribe({
      next: (blob) => {
        this.downloader.save(blob, data.originalFilename || 'recovered-secret');
        this.downloading.set(false);
      },
      error: (err: unknown) => {
        this.downloading.set(false);
        this.errorMessage.set(
          err instanceof StegoApiError ? err.userMessage : 'The download failed. Please try again.',
        );
      },
    });
  }

  protected reset(): void {
    this.status.set('idle');
    this.result.set(null);
    this.errorMessage.set(null);
    this.progress.set(0);
  }
}
