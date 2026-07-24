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

  /** Fetch health once and update the status signal. */
  check(): void {
    this.http
      .get<{ status?: string }>(environment.healthPath)
      .pipe(
        map((body): HealthStatus => (body?.status === 'ok' ? 'ok' : 'down')),
        catchError(() => of<HealthStatus>('down')),
      )
      .subscribe((status) => this._status.set(status));
  }
}
