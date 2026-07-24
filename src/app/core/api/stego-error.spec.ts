import { mapServerMessage } from './stego-error';

describe('mapServerMessage', () => {
  it('flags corrupt-payload with a symmetry hint', () => {
    const { kind, userMessage } = mapServerMessage('Corrupt payload: missing filename length');
    expect(kind).toBe('corrupt-payload');
    expect(userMessage.toLowerCase()).toContain('match');
  });

  it('maps BMP conversion failure to friendly copy', () => {
    const { kind, userMessage } = mapServerMessage('Failed to convert image to BMP!');
    expect(kind).toBe('validation');
    expect(userMessage.toLowerCase()).toContain('image');
  });

  it('maps unsupported video format', () => {
    const { userMessage } = mapServerMessage('Failed to open video (unsupported format?)');
    expect(userMessage.toLowerCase()).toContain('avi');
  });

  it('maps missing file parts', () => {
    expect(mapServerMessage('No Cover Image Sent').userMessage.toLowerCase()).toContain('attach');
  });

  it('falls back to the raw message when unknown', () => {
    expect(mapServerMessage('Some novel error').userMessage).toContain('Some novel error');
  });

  it('handles an empty message', () => {
    expect(mapServerMessage(undefined).kind).toBe('validation');
  });
});
