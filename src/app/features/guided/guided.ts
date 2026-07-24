import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmbedData, ExtractData, StegoOptions, defaultOptions } from '../../core/api/api.models';
import { StegoApiService } from '../../core/api/stego-api.service';
import { HealthService } from '../../core/api/health.service';
import { StegoApiError } from '../../core/api/stego-error';
import { TECHNIQUES, findTechnique } from '../../core/api/techniques';
import { FileDownloadService } from '../../core/api/file-download.service';
import { validateCoverType, validateUploadSize } from '../../core/validation/file-validation';
import { FileDropzone } from '../../shared/ui/file-dropzone/file-dropzone';
import { OptionsForm } from '../../shared/ui/options-form/options-form';
import { ResultCard, ResultMetric } from '../../shared/ui/result-card/result-card';
import { SymmetryCallout } from '../../shared/ui/symmetry-callout/symmetry-callout';
import { TechniqueSelect } from '../../shared/ui/technique-select/technique-select';
import { embedMetrics, stegoFilename } from '../shared/result-helpers';

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

/**
 * Guided round-trip wizard. Runs embed, then carries the technique, options,
 * and the exact produced stego file into extract — so a correct extraction is
 * satisfied by construction (no re-entry, no mismatch).
 */
@Component({
  selector: 'app-guided',
  imports: [
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    FileDropzone,
    OptionsForm,
    ResultCard,
    SymmetryCallout,
    TechniqueSelect,
  ],
  templateUrl: './guided.html',
  styleUrl: './guided.scss',
})
export class Guided {
  private readonly api = inject(StegoApiService);
  private readonly downloader = inject(FileDownloadService);
  private readonly health = inject(HealthService);

  readonly technique = input<string | undefined>(undefined);

  /** Controls the stepper position (0=Configure … 3=Recovered). */
  protected readonly stepIndex = signal(0);

  protected readonly selectedId = linkedSignal(() => {
    const param = this.technique();
    return param && findTechnique(param) ? param : TECHNIQUES[0].id;
  });
  protected readonly current = computed(() => findTechnique(this.selectedId())!);

  // Embed inputs.
  protected readonly cover = signal<File | null>(null);
  protected readonly secret = signal<File | null>(null);
  protected readonly options = signal<StegoOptions>(defaultOptions());

  // Embed run state.
  protected readonly embedPhase = signal<Phase>('idle');
  protected readonly embedProgress = signal(0);
  protected readonly embedResult = signal<EmbedData | null>(null);
  protected readonly embedError = signal<string | null>(null);

  // The produced stego file, carried into the extract step.
  protected readonly stegoFile = signal<File | null>(null);
  protected readonly downloadingStego = signal(false);

  // Extract run state.
  protected readonly extractPhase = signal<Phase>('idle');
  protected readonly extractProgress = signal(0);
  protected readonly extractResult = signal<ExtractData | null>(null);
  protected readonly extractError = signal<string | null>(null);
  protected readonly downloadingSecret = signal(false);

  protected readonly apiDown = computed(() => this.health.status() === 'down');
  protected readonly embedBusy = computed(
    () => this.embedPhase() === 'uploading' || this.embedPhase() === 'processing',
  );
  protected readonly extractBusy = computed(
    () => this.extractPhase() === 'uploading' || this.extractPhase() === 'processing',
  );

  protected readonly sizeError = computed(() => {
    const res = validateUploadSize([this.cover(), this.secret()]);
    return res.ok ? null : res.message!;
  });
  private readonly coverCheck = computed(() => {
    const f = this.cover();
    return f ? validateCoverType(this.current(), f) : null;
  });
  protected readonly coverWarning = computed(() => this.coverCheck()?.message ?? null);
  protected readonly canEmbed = computed(
    () =>
      !!this.cover() &&
      !!this.secret() &&
      !this.sizeError() &&
      (this.coverCheck() ? this.coverCheck()!.ok : true) &&
      !(this.secret() && this.secret()!.size === 0) &&
      !this.embedBusy() &&
      !this.apiDown(),
  );

  protected readonly embedDone = computed(() => this.embedPhase() === 'done');
  protected readonly extractDone = computed(() => this.extractPhase() === 'done');

  protected readonly embedMetricsList = computed<ResultMetric[]>(() => {
    const data = this.embedResult();
    return data ? embedMetrics(this.current(), data) : [];
  });
  protected readonly secretMetrics = computed<ResultMetric[]>(() => {
    const data = this.extractResult();
    return data ? [{ label: 'Recovered file', value: data.originalFilename }] : [];
  });

  protected embed(): void {
    if (!this.canEmbed()) {
      return;
    }
    this.embedError.set(null);
    this.embedPhase.set('uploading');
    this.embedProgress.set(0);

    this.api
      .runEmbed(this.current(), {
        cover: this.cover()!,
        secret: this.secret()!,
        options: this.options(),
      })
      .subscribe({
        next: (p) => {
          this.embedProgress.set(p.progress);
          if (p.data) {
            this.embedResult.set(p.data);
            this.fetchStego(p.data.result);
          } else {
            this.embedPhase.set(p.phase === 'uploading' ? 'uploading' : 'processing');
          }
        },
        error: (err: unknown) => {
          this.embedError.set(this.messageOf(err));
          this.embedPhase.set('error');
        },
      });
  }

  /** Download the produced stego bytes and keep them as the extract input. */
  private fetchStego(resultPath: string): void {
    this.api.fetchBlob(resultPath).subscribe({
      next: (blob) => {
        const name = stegoFilename(this.current(), this.cover()?.name);
        this.stegoFile.set(new File([blob], name, { type: this.current().stegoMime }));
        this.embedPhase.set('done');
        this.advance();
      },
      error: (err: unknown) => {
        this.embedError.set(this.messageOf(err));
        this.embedPhase.set('error');
      },
    });
  }

  protected downloadStego(): void {
    const file = this.stegoFile();
    if (!file) {
      return;
    }
    this.downloadingStego.set(true);
    this.downloader.save(file, file.name);
    this.downloadingStego.set(false);
  }

  protected continueToExtract(): void {
    this.advance();
  }

  protected extract(): void {
    const stego = this.stegoFile();
    if (!stego || this.extractBusy() || this.apiDown()) {
      return;
    }
    this.extractError.set(null);
    this.extractPhase.set('uploading');
    this.extractProgress.set(0);

    // Same technique and options as embed — symmetry guaranteed.
    this.api.runExtract(this.current(), { stego, options: this.options() }).subscribe({
      next: (p) => {
        this.extractProgress.set(p.progress);
        if (p.data) {
          this.extractResult.set(p.data);
          this.extractPhase.set('done');
          this.advance();
        } else {
          this.extractPhase.set(p.phase === 'uploading' ? 'uploading' : 'processing');
        }
      },
      error: (err: unknown) => {
        this.extractError.set(this.messageOf(err));
        this.extractPhase.set('error');
      },
    });
  }

  protected downloadSecret(): void {
    const data = this.extractResult();
    if (!data) {
      return;
    }
    this.downloadingSecret.set(true);
    this.api.fetchBlob(data.result).subscribe({
      next: (blob) => {
        this.downloader.save(blob, data.originalFilename || 'recovered-secret');
        this.downloadingSecret.set(false);
      },
      error: (err: unknown) => {
        this.downloadingSecret.set(false);
        this.extractError.set(this.messageOf(err));
      },
    });
  }

  protected restart(): void {
    this.cover.set(null);
    this.secret.set(null);
    this.options.set(defaultOptions());
    this.embedPhase.set('idle');
    this.embedResult.set(null);
    this.embedError.set(null);
    this.stegoFile.set(null);
    this.extractPhase.set('idle');
    this.extractResult.set(null);
    this.extractError.set(null);
    this.stepIndex.set(0);
  }

  private advance(): void {
    this.stepIndex.update((i) => Math.min(i + 1, 3));
  }

  private messageOf(err: unknown): string {
    return err instanceof StegoApiError
      ? err.userMessage
      : 'Something went wrong. Please try again.';
  }
}
