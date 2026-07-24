import { environment } from '../../../environments/environment';
import { Technique } from '../api/api.models';

export interface ValidationResult {
  ok: boolean;
  /** Present when `ok` is false (hard block) or as a soft warning. */
  message?: string;
  /** A soft warning still allows submission; a hard failure does not. */
  severity?: 'error' | 'warning';
}

const OK: ValidationResult = { ok: true };

/** Human-readable byte size, e.g. "1.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/**
 * Hard-blocks combined uploads over the backend's request-body cap (256 MB),
 * so oversize submissions never leave the browser.
 */
export function validateUploadSize(
  files: Array<File | null | undefined>,
  maxBytes = environment.maxUploadBytes,
): ValidationResult {
  const total = files.reduce((sum, f) => sum + (f?.size ?? 0), 0);
  if (total > maxBytes) {
    return {
      ok: false,
      severity: 'error',
      message: `Combined upload is ${formatBytes(total)}, over the ${formatBytes(maxBytes)} limit. Use smaller files.`,
    };
  }
  return OK;
}

/**
 * Soft-warns when a cover/stego file's type looks wrong for the technique. The
 * backend does no format allow-listing, so this is guidance, not a hard block —
 * except that an empty file is always an error.
 */
export function validateCoverType(technique: Technique, file: File | null | undefined): ValidationResult {
  if (!file) {
    return { ok: false, severity: 'error', message: 'Please choose a file.' };
  }
  if (file.size === 0) {
    return { ok: false, severity: 'error', message: 'This file is empty.' };
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  const matches = (): boolean => {
    switch (technique.medium) {
      case 'image':
        return type.startsWith('image/') || /\.(png|jpe?g|bmp|gif|webp|tiff?)$/.test(name);
      case 'audio':
        return type.includes('wav') || /\.wav$/.test(name);
      case 'video':
        return type.startsWith('video/') || /\.(avi|mp4|mkv|mov|webm)$/.test(name);
    }
  };

  if (!matches()) {
    return {
      ok: true,
      severity: 'warning',
      message: `This file may not be a valid ${technique.medium} for ${technique.label}. ${technique.coverHint}`,
    };
  }
  return OK;
}
