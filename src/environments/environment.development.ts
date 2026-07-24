/**
 * Development environment (used via fileReplacements in angular.json).
 *
 * `apiBaseUrl` stays empty so requests are relative and hit the Angular
 * dev-server proxy (see proxy.conf.json), which forwards to the backend on
 * http://localhost:8080. The backend sends no CORS headers, so the proxy is
 * mandatory — never call the backend origin directly from the browser.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
  healthPath: '/api-health',
  maxUploadBytes: 256 * 1024 * 1024,
};
