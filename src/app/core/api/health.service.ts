import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type HealthStatus = 'unknown' | 'ok' | 'down';

/**
 * Tracks backend availability via the health endpoint (the backend's `GET /`,
 * exposed to the browser at a dedicated proxied path). Drives the API-status
 * banner and lets the UI disable submits when the service is unreachable.
 */
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly _status = signal<HealthStatus>('unknown');

  readonly status = this._status.asReadonly();

  /**
   * Fetch health once and update the status signal. Any successful 2xx response
   * means the service is reachable — we deliberately do not require a specific
   * body shape, so the app isn't hard-disabled against a healthy backend whose
   * root returns something other than `{status:"ok"}`.
   */
  check(): void {
    this.http
      .get(environment.healthPath, { responseType: 'text' })
      .pipe(
        map((): HealthStatus => 'ok'),
        catchError(() => of<HealthStatus>('down')),
      )
      .subscribe((status) => this._status.set(status));
  }
}
