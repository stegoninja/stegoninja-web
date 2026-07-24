import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { StegoApiError, mapServerMessage } from '../api/stego-error';

/**
 * Normalizes transport-level HTTP failures into StegoApiError so the UI has a
 * single, presentable error type:
 *  - status 0            → network error (retryable)
 *  - 404 on a download   → "result unavailable" (backend returns plain-text 404
 *                          with no envelope; we classify by URL, not body)
 *  - 400 JSON envelope   → mapped friendly copy (validation / corrupt-payload)
 *  - anything else        → generic unknown error
 *
 * Envelope-level errors returned with HTTP 200 (`{status:"error"}`) are handled
 * in StegoApiService, not here.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        return throwError(() => normalize(err));
      }
      return throwError(() => err);
    }),
  );

function normalize(err: HttpErrorResponse): StegoApiError {
  if (err.status === 0) {
    return new StegoApiError(
      'network',
      "Couldn't reach the service. Check your connection and try again.",
      err.message,
      0,
    );
  }

  const isDownload = /\/(results|extracts)\//.test(err.url ?? '');
  if (err.status === 404 && isDownload) {
    return new StegoApiError(
      'not-found',
      'That result is no longer available. Please run the operation again and download promptly.',
      typeof err.error === 'string' ? err.error : undefined,
      404,
    );
  }

  // Backend error envelope (JSON) carries a `message`.
  const serverMessage =
    err.error && typeof err.error === 'object' && typeof err.error.message === 'string'
      ? (err.error.message as string)
      : undefined;

  if (err.status === 400 || serverMessage) {
    const mapped = mapServerMessage(serverMessage);
    return new StegoApiError(mapped.kind, mapped.userMessage, serverMessage, err.status);
  }

  return new StegoApiError(
    'unknown',
    'Something went wrong. Please try again.',
    serverMessage ?? err.message,
    err.status,
  );
}
