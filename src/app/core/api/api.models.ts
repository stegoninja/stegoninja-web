// Domain model for the StegoNinja API. Field names and shapes mirror the
// backend contract (openapi.yaml). See PRD 05 for the grounded reference.

export type Medium = 'image' | 'audio' | 'video';
export type Algorithm = 'lsb' | 'bpcs';

/** A steganography technique: one medium + algorithm, with its API routes. */
export interface Technique {
  /** Stable id, e.g. 'image-lsb'. */
  id: string;
  medium: Medium;
  algorithm: Algorithm;
  /** Display name, e.g. 'Image LSB'. */
  label: string;
  /** Material Symbols icon name. */
  icon: string;
  /** One-line description for cards/help. */
  description: string;
  /** `accept` attribute for the cover/stego file input. */
  coverAccept: string;
  /** Human-readable hint about acceptable cover formats. */
  coverHint: string;
  /** Extension of the produced stego artifact. */
  stegoExtension: '.bmp' | '.wav' | '.avi';
  /** MIME type used when saving the stego artifact. */
  stegoMime: string;
  /** POST route for embedding. */
  embedPath: string;
  /** POST route for extracting. */
  extractPath: string;
  /** Whether embed responses include a PSNR value (image/audio yes, video no). */
  hasPsnr: boolean;
}

/** Protection options shared by embed and extract; must match between them. */
export interface StegoOptions {
  password: string;
  encrypt: boolean;
  randomize: boolean;
}

export function defaultOptions(): StegoOptions {
  return { password: '', encrypt: false, randomize: false };
}

/** Uniform response envelope from embed/extract endpoints. */
export interface Envelope<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

/** `data` for an embed response. `psnr` for image/audio; `format`/`frames` for video. */
export interface EmbedData {
  result: string;
  originalFilename?: string;
  psnr?: string;
  format?: string;
  frames?: string;
}

/** `data` for an extract response. */
export interface ExtractData {
  result: string;
  originalFilename: string;
}

export interface EmbedInput {
  cover: File;
  secret: File;
  options: StegoOptions;
}

export interface ExtractInput {
  stego: File;
  options: StegoOptions;
}

/** Phases of a two-step (upload → process → download) operation. */
export type StegoPhase = 'uploading' | 'processing' | 'done';

/** Progress emitted while an embed/extract request is in flight. */
export interface StegoProgress<T> {
  phase: StegoPhase;
  /** Upload completion 0–100 (100 once fully sent / processing). */
  progress: number;
  /** Present only on the terminal `done` emission. */
  data?: T;
}
