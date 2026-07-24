import { Technique } from './api.models';

/**
 * The four supported techniques. This is the single registry consumed by the
 * home picker, embed/extract tools, and the wizard, so route names, accepted
 * inputs, and output extensions never drift between screens.
 */
export const TECHNIQUES: readonly Technique[] = [
  {
    id: 'image-lsb',
    medium: 'image',
    algorithm: 'lsb',
    label: 'Image LSB',
    icon: 'image',
    description: 'Hide data in the least-significant bits of an image. Any image is accepted; the stego output is a lossless BMP.',
    coverAccept: 'image/*',
    coverHint: 'Any common image (PNG, JPG, BMP…). Output is a lossless BMP.',
    stegoExtension: '.bmp',
    stegoMime: 'image/bmp',
    embedPath: '/image/lsb/embed',
    extractPath: '/image/lsb/extract',
    hasPsnr: true,
  },
  {
    id: 'image-bpcs',
    medium: 'image',
    algorithm: 'bpcs',
    label: 'Image BPCS',
    icon: 'grid_view',
    description: 'Bit-Plane Complexity Segmentation over a 24-bit BMP cover. Higher capacity than LSB; output is a BMP.',
    coverAccept: 'image/*',
    coverHint: 'A 24-bit image (converted to BMP). Output is a lossless BMP.',
    stegoExtension: '.bmp',
    stegoMime: 'image/bmp',
    embedPath: '/image/bpcs/embed',
    extractPath: '/image/bpcs/extract',
    hasPsnr: true,
  },
  {
    id: 'audio-lsb',
    medium: 'audio',
    algorithm: 'lsb',
    label: 'Audio LSB',
    icon: 'graphic_eq',
    description: 'Hide data in the least-significant bits of PCM WAV samples. Output is a WAV file.',
    coverAccept: 'audio/wav,audio/x-wav,.wav',
    coverHint: 'A PCM WAV file. Output is a WAV.',
    stegoExtension: '.wav',
    stegoMime: 'audio/wav',
    embedPath: '/audio/lsb/embed',
    extractPath: '/audio/lsb/extract',
    hasPsnr: true,
  },
  {
    id: 'video-lsb',
    medium: 'video',
    algorithm: 'lsb',
    label: 'Video LSB',
    icon: 'movie',
    description: 'Hide data in video frame pixels. Output is a lossless FFV1/AVI file — re-upload that exact AVI to extract.',
    coverAccept: 'video/*',
    coverHint: 'Any readable video. Output is a lossless FFV1/AVI (re-upload the exact AVI to extract).',
    stegoExtension: '.avi',
    stegoMime: 'video/x-msvideo',
    embedPath: '/video/lsb/embed',
    extractPath: '/video/lsb/extract',
    hasPsnr: false,
  },
];

export function findTechnique(id: string | null | undefined): Technique | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}
