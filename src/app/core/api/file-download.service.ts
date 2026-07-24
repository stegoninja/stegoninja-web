import { Injectable } from '@angular/core';

/**
 * Triggers a browser download for a blob. The backend sets no
 * Content-Disposition, so the caller always supplies the filename (the
 * recovered secret's originalFilename, or a client-built stego name with the
 * technique's extension). Object URLs are revoked after the click.
 */
@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  save(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      // Revoke on the next tick so the download has a chance to start.
      setTimeout(() => URL.revokeObjectURL(url));
    }
  }
}
