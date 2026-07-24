import { TECHNIQUES, findTechnique } from '../api/techniques';
import { formatBytes, validateCoverType, validateUploadSize } from './file-validation';

function fakeFile(name: string, sizeBytes: number, type = ''): File {
  const blob = new Blob([new Uint8Array(Math.min(sizeBytes, 8))], { type });
  const file = new File([blob], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

describe('formatBytes', () => {
  it('formats across units', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('validateUploadSize', () => {
  it('accepts within the cap', () => {
    expect(validateUploadSize([fakeFile('a', 10), fakeFile('b', 20)], 100).ok).toBe(true);
  });

  it('blocks over the cap', () => {
    const res = validateUploadSize([fakeFile('a', 80), fakeFile('b', 40)], 100);
    expect(res.ok).toBe(false);
    expect(res.severity).toBe('error');
  });

  it('ignores nulls', () => {
    expect(validateUploadSize([null, undefined, fakeFile('a', 10)], 100).ok).toBe(true);
  });
});

describe('validateCoverType', () => {
  const imageLsb = findTechnique('image-lsb')!;
  const audioLsb = findTechnique('audio-lsb')!;

  it('errors on missing file', () => {
    expect(validateCoverType(imageLsb, null).ok).toBe(false);
  });

  it('errors on empty file', () => {
    expect(validateCoverType(imageLsb, fakeFile('x.png', 0, 'image/png')).ok).toBe(false);
  });

  it('accepts a matching type', () => {
    const res = validateCoverType(imageLsb, fakeFile('cover.png', 1000, 'image/png'));
    expect(res.ok).toBe(true);
    expect(res.severity).toBeUndefined();
  });

  it('warns (but allows) a mismatched type', () => {
    const res = validateCoverType(audioLsb, fakeFile('song.mp3', 1000, 'audio/mpeg'));
    expect(res.ok).toBe(true);
    expect(res.severity).toBe('warning');
  });

  it('covers all four techniques by extension', () => {
    expect(TECHNIQUES.length).toBe(4);
    expect(validateCoverType(findTechnique('video-lsb')!, fakeFile('clip.avi', 1000)).ok).toBe(true);
  });
});
