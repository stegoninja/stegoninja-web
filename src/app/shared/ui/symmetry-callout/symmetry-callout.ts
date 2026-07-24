import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Warning banner restating the extraction symmetry rule (and the video
 * lossless re-upload requirement). Shown on embed results and extract entry.
 */
@Component({
  selector: 'app-symmetry-callout',
  imports: [MatIconModule],
  template: `
    <aside class="callout" role="note">
      <mat-icon aria-hidden="true">key</mat-icon>
      <p>{{ message() }}</p>
    </aside>
  `,
  styles: `
    :host {
      display: block;
    }
    .callout {
      display: flex;
      gap: var(--sp-3);
      align-items: flex-start;
      padding: var(--sp-3) var(--sp-4);
      border: 1px solid color-mix(in srgb, var(--warning) 40%, var(--border));
      border-radius: var(--radius-md);
      background: color-mix(in srgb, var(--warning) 12%, var(--surface));
    }
    mat-icon {
      color: var(--warning);
      flex-shrink: 0;
    }
    p {
      margin: 0;
      font-size: var(--fs-small);
      line-height: 1.4;
    }
  `,
})
export class SymmetryCallout {
  /** 'embed' emphasizes remembering options; 'extract' emphasizes matching. */
  readonly mode = input<'embed' | 'extract'>('extract');
  /** When true, appends the video-specific exact-AVI reminder. */
  readonly video = input(false);

  protected readonly message = computed(() => {
    const base =
      this.mode() === 'embed'
        ? 'Remember the technique, encryption, randomization, and password you used — extraction needs the exact same combination.'
        : 'Use the same technique, encryption, randomization, and password that were used to embed. A mismatch produces corrupt output, not a clear error.';
    return this.video()
      ? `${base} For video, upload the exact AVI produced by the embed step (never a re-encoded copy).`
      : base;
  });
}
