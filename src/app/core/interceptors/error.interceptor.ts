import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Normalizes backend errors for the UI. Expanded with envelope/plain-text-404
 * mapping in a later checkpoint; currently a transparent pass-through so the
 * HTTP client is wired from the start.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => next(req);
