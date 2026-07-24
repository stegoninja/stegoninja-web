import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HealthService } from '../../../core/api/health.service';

/**
 * Non-blocking banner shown when the backend health check reports the service
 * is unreachable. Offers a retry that re-runs the check.
 */
@Component({
  selector: 'app-api-status-banner',
  imports: [MatIconModule, MatButtonModule],
  template: `
    @if (health.status() === 'down') {
      <div class="banner" role="alert">
        <mat-icon aria-hidden="true">cloud_off</mat-icon>
        <span class="text">
          The steganography service is unreachable. Embedding and extracting are unavailable until it
          responds.
        </span>
        <button mat-button type="button" (click)="retry()">Retry</button>
      </div>
    }
  `,
  styles: `
    .banner {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-2) var(--sp-4);
      background: color-mix(in srgb, var(--danger) 14%, var(--surface));
      border-bottom: 1px solid color-mix(in srgb, var(--danger) 40%, var(--border));
      color: var(--text);
    }
    mat-icon {
      color: var(--danger);
      flex-shrink: 0;
    }
    .text {
      flex: 1;
      font-size: var(--fs-small);
    }
  `,
})
export class ApiStatusBanner {
  protected readonly health = inject(HealthService);

  protected retry(): void {
    this.health.check();
  }
}
