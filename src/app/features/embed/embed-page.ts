import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmbedData, StegoOptions, defaultOptions } from '../../core/api/api.models';
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
import { stegoFilename, embedMetrics } from '../shared/result-helpers';

type RunStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

/**
 * Standalone embed tool: choose a technique, attach a cover and a secret, set
 * options, then embed and download the produced stego file. Enforces the
 * 256 MB cap client-side and surfaces every async state.
 */
@Component({
  selector: 'app-embed-page',
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
  templateUrl: './embed-page.html',
  styleUrl: './embed-page.scss',
})
export class EmbedPage {
  private readonly api = inject(StegoApiService);
  private readonly downloader = inject(FileDownloadService);
  private readonly health = inject(HealthService);

  /** Optional ?technique= query param preselects the technique. */
  readonly technique = input<string | undefined>(undefined);

  protected readonly selectedId = linkedSignal(() => {
    const param = this.technique();
    return param && findTechnique(param) ? param : TECHNIQUES[0].id;
  });
  protected readonly current = computed(() => findTechnique(this.selectedId())!);

  protected readonly cover = signal<File | null>(null);
  protected readonly secret = signal<File | null>(null);
  protected readonly options = signal<StegoOptions>(defaultOptions());

  protected readonly status = signal<RunStatus>('idle');
  protected readonly progress = signal(0);
  protected readonly result = signal<EmbedData | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly downloading = signal(false);

  protected readonly apiDown = computed(() => this.health.status() === 'down');
  protected readonly busy = computed(
    () => this.status() === 'uploading' || this.status() === 'processing',
  );

  /** Hard validation that blocks submission. */
  protected readonly sizeError = computed(() => {
    const res = validateUploadSize([this.cover(), this.secret()]);
    return res.ok ? null : res.message!;
  });

  protected readonly canSubmit = computed(
    () => !!this.cover() && !!this.secret() && !this.sizeError() && !this.busy() && !this.apiDown(),
  );

  protected readonly metrics = computed<ResultMetric[]>(() => {
    const data = this.result();
    return data ? embedMetrics(this.current(), data) : [];
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
      .runEmbed(this.current(), {
        cover: this.cover()!,
        secret: this.secret()!,
        options: this.options(),
      })
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
            err instanceof StegoApiError ? err.userMessage : 'Something went wrong. Please try again.',
          );
          this.status.set('error');
        },
      });
  }

  protected downloadStego(): void {
    const data = this.result();
    if (!data) {
      return;
    }
    this.downloading.set(true);
    this.api.fetchBlob(data.result).subscribe({
      next: (blob) => {
        this.downloader.save(blob, stegoFilename(this.current(), this.cover()?.name));
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
