import { TestBed } from '@angular/core/testing';
import { FileDropzone } from './file-dropzone';

describe('FileDropzone', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('shows the label and hint when empty', async () => {
    const fixture = TestBed.createComponent(FileDropzone);
    fixture.componentRef.setInput('label', 'Cover file');
    fixture.componentRef.setInput('hint', 'Any image');
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Cover file');
    expect(text).toContain('Any image');
  });

  it('reflects a bound file with its name and size', async () => {
    const fixture = TestBed.createComponent(FileDropzone);
    const file = new File([new Uint8Array(2048)], 'secret.pdf', { type: 'application/pdf' });
    fixture.componentRef.setInput('file', file);
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('secret.pdf');
    expect(text).toContain('2.0 KB');
  });
});
