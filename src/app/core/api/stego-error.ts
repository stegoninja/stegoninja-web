export type StegoErrorKind =
  | 'validation' // bad/missing input, capacity, conversion failure (HTTP 400)
  | 'corrupt-payload' // extract with mismatched technique/options/password
  | 'not-found' // download endpoint returned a plain-text 404
  | 'network' // no response / transport failure
  | 'unknown';

/** A normalized, user-presentable error for any StegoNinja API failure. */
export class StegoApiError extends Error {
  constructor(
    readonly kind: StegoErrorKind,
    /** Friendly, user-facing message. */
    readonly userMessage: string,
    /** Raw backend message, when available (for logs/debug, not for users). */
    readonly serverMessage?: string,
    readonly status?: number,
  ) {
    super(userMessage);
    this.name = 'StegoApiError';
  }
}

/**
 * Maps a raw backend error message to friendly copy. Matching is by substring
 * because the backend emits fixed strings (see PRD 05). Returns the kind so the
 * UI can react (e.g. show the symmetry checklist for corrupt payloads).
 */
export function mapServerMessage(raw: string | undefined): {
  kind: StegoErrorKind;
  userMessage: string;
} {
  const msg = (raw ?? '').trim();
  const has = (needle: string) => msg.toLowerCase().includes(needle.toLowerCase());

  if (has('Corrupt payload')) {
    return {
      kind: 'corrupt-payload',
      userMessage:
        "Couldn't recover the secret. Check that the technique, encryption, randomization, and password exactly match the ones used to embed.",
    };
  }
  if (has('Invalid content type') || has('multipart boundary')) {
    return {
      kind: 'validation',
      userMessage: 'Something went wrong sending your files. Please try again.',
    };
  }
  if (has('Missing or empty file part') || has('No Cover') || has('No Secret') || has('No Stego')) {
    return { kind: 'validation', userMessage: 'Please attach the required file(s) and try again.' };
  }
  if (has('Failed to save')) {
    return { kind: 'validation', userMessage: "We couldn't process your upload. Please retry." };
  }
  if (has('convert') && has('BMP')) {
    return {
      kind: 'validation',
      userMessage: "This image couldn't be processed. Try a standard PNG, BMP, or JPG.",
    };
  }
  if (has('unsupported format') || has('Failed to open video')) {
    return {
      kind: 'validation',
      userMessage:
        "This video format isn't supported. For extraction, upload the exact AVI you downloaded from the embed step.",
    };
  }
  if (has('Infinite dB') || has('no changes made')) {
    return {
      kind: 'validation',
      userMessage:
        'No changes were made to the cover — the secret may be empty or the cover unsuitable.',
    };
  }
  return {
    kind: 'validation',
    userMessage:
      msg || 'The request could not be completed. Please check your input and try again.',
  };
}
