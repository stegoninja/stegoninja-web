import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ExtractPage } from './extract-page';

function file(name: string, size = 1000): File {
  const f = new File([new Uint8Array(4)], name);
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('ExtractPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('extracts and exposes the recovered filename', async () => {
    const fixture = TestBed.createComponent(ExtractPage);
    const cmp = fixture.componentInstance as any;
    fixture.componentRef.setInput('technique', 'image-lsb');
    cmp.stego.set(file('cover-stego.bmp'));
    await fixture.whenStable();

    cmp.submit();
    httpMock.expectOne('/image/lsb/extract').flush({
      status: 'success',
      message: 'ok',
      data: { result: '/extracts/z', originalFilename: 'secret.txt' },
    });
    await fixture.whenStable();

    expect(cmp.status()).toBe('done');
    expect(cmp.metrics()[0]).toEqual({ label: 'Recovered file', value: 'secret.txt' });
  });

  it('shows a symmetry hint on a corrupt-payload error', async () => {
    const fixture = TestBed.createComponent(ExtractPage);
    const cmp = fixture.componentInstance as any;
    cmp.stego.set(file('x.bmp'));
    await fixture.whenStable();

    cmp.submit();
    httpMock.expectOne('/image/lsb/extract').flush({
      status: 'error',
      message: 'Corrupt payload: secret data truncated',
      data: {},
    });
    await fixture.whenStable();

    expect(cmp.status()).toBe('error');
    expect((cmp.errorMessage() as string).toLowerCase()).toContain('match');
  });
});
