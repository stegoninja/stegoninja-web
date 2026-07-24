import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ResultMetric {
  label: string;
  value: string;
  /** 'good' highlights a favorable value (e.g. high PSNR). */
  tone?: 'default' | 'good';
}

/**
 * Success panel for an embed/extract result: a heading, optional metric chips
 * (PSNR, format, frames…), a primary download action, and an optional
 * secondary action (e.g. "Continue to extract").
 */
@Component({
  selector: 'app-result-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './result-card.html',
  styleUrl: './result-card.scss',
})
export class ResultCard {
  readonly heading = input('Done');
  readonly metrics = input<ResultMetric[]>([]);
  readonly downloadLabel = input('Download');
  readonly secondaryLabel = input<string | null>(null);
  readonly downloading = input(false);

  readonly download = output<void>();
  readonly secondary = output<void>();
}
