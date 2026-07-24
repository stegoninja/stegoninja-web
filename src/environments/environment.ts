/**
 * Base (production) environment.
 *
 * `apiBaseUrl` is intentionally empty so all API requests are same-origin and
 * relative. In production a reverse proxy must serve this SPA and forward the
 * API path prefixes (/image, /audio, /video, /results, /extracts, /api-health)
 * to the backend. Never hardcode the backend origin in components.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
  /** Health check path; a proxy maps this to the backend's `GET /`. */
  healthPath: '/api-health',
  /** Max combined upload size the backend accepts (256 MB). */
  maxUploadBytes: 256 * 1024 * 1024,
};
