import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Guided } from './guided';

function file(name: string, size = 1000, type = ''): File {
  const f = new File([new Uint8Array(4)], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('Guided', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guided],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('carries the produced stego file and options from embed into extract', async () => {
    const fixture = TestBed.createComponent(Guided);
    const cmp = fixture.componentInstance as any;
    fixture.componentRef.setInput('technique', 'image-lsb');
    cmp.cover.set(file('cover.png', 1000, 'image/png'));
    cmp.secret.set(file('secret.txt', 100, 'text/plain'));
    cmp.options.set({ password: 'pw', encrypt: true, randomize: true });
    await fixture.whenStable();

    // Embed.
    cmp.embed();
    httpMock.expectOne('/image/lsb/embed').flush({
      status: 'success',
      message: 'ok',
      data: { result: '/results/abc', originalFilename: 'secret.txt', psnr: '80.1' },
    });
    await fixture.whenStable();

    // The wizard fetches the stego bytes to carry into extract.
    httpMock.expectOne('/results/abc').flush(new Blob(['stego-bytes']));
    await fixture.whenStable();

    expect(cmp.embedDone()).toBe(true);
    expect(cmp.stegoFile()?.name).toBe('cover-stego.bmp');
    expect(cmp.stepIndex()).toBe(1);

    // Move to the extract step.
    cmp.continueToExtract();
    expect(cmp.stepIndex()).toBe(2);

    // Extract uses the carried file + same options.
    cmp.extract();
    const req = httpMock.expectOne('/image/lsb/extract');
    const body = req.request.body as FormData;
    expect(body.get('encrypt')).toBe('true');
    expect(body.get('randomize')).toBe('true');
    expect(body.get('password')).toBe('pw');
    expect(body.get('stego')).toBeInstanceOf(File);
    req.flush({
      status: 'success',
      message: 'ok',
      data: { result: '/extracts/z', originalFilename: 'secret.txt' },
    });
    await fixture.whenStable();

    expect(cmp.extractDone()).toBe(true);
    expect(cmp.stepIndex()).toBe(3);
  });
});
