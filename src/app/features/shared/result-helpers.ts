import { EmbedData, Technique } from '../../core/api/api.models';
import { ResultMetric } from '../../shared/ui/result-card/result-card';

/**
 * Builds a download filename for a produced stego artifact. The backend sends
 * no Content-Disposition, so the client names it — derived from the cover name
 * with the technique's correct extension (.bmp/.wav/.avi).
 */
export function stegoFilename(technique: Technique, coverName?: string): string {
  const base = coverName ? coverName.replace(/\.[^.]+$/, '') : 'stego';
  return `${base}-stego${technique.stegoExtension}`;
}

/** Result-card metrics for an embed response (PSNR for image/audio; format/frames for video). */
export function embedMetrics(technique: Technique, data: EmbedData): ResultMetric[] {
  const metrics: ResultMetric[] = [];
  if (technique.hasPsnr && data.psnr != null) {
    const noChange = /inf/i.test(data.psnr);
    metrics.push({
      label: 'PSNR',
      value: noChange ? '∞ dB (no change)' : `${data.psnr} dB`,
      tone: noChange ? 'default' : 'good',
    });
  }
  if (data.format) {
    metrics.push({ label: 'Format', value: data.format });
  }
  if (data.frames) {
    metrics.push({ label: 'Frames', value: data.frames });
  }
  return metrics;
}
