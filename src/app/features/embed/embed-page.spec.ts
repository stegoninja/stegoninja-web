import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EmbedPage } from './embed-page';

function file(name: string, size: number, type = ''): File {
  const f = new File([new Uint8Array(4)], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('EmbedPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('preselects the technique from the input and defaults otherwise', async () => {
    const fixture = TestBed.createComponent(EmbedPage);
    fixture.componentRef.setInput('technique', 'audio-lsb');
    await fixture.whenStable();
    expect((fixture.componentInstance as any).current().id).toBe('audio-lsb');
  });

  it('embeds and exposes PSNR metric on success', async () => {
    const fixture = TestBed.createComponent(EmbedPage);
    const cmp = fixture.componentInstance as any;
    cmp.cover.set(file('cover.png', 1000, 'image/png'));
    cmp.secret.set(file('secret.txt', 100, 'text/plain'));
    await fixture.whenStable();

    cmp.submit();
    const req = httpMock.expectOne('/image/lsb/embed');
    req.flush({
      status: 'success',
      message: 'ok',
      data: { result: '/results/abc', originalFilename: 'secret.txt', psnr: '76.35' },
    });
    await fixture.whenStable();

    expect(cmp.status()).toBe('done');
    expect(cmp.metrics()[0]).toEqual({ label: 'PSNR', value: '76.35 dB', tone: 'good' });
  });

  it('blocks submission when combined upload exceeds the cap', async () => {
    const fixture = TestBed.createComponent(EmbedPage);
    const cmp = fixture.componentInstance as any;
    cmp.cover.set(file('cover.png', 200 * 1024 * 1024, 'image/png'));
    cmp.secret.set(file('secret.bin', 100 * 1024 * 1024));
    await fixture.whenStable();
    expect(cmp.sizeError()).toBeTruthy();
    expect(cmp.canSubmit()).toBe(false);
  });

  afterEach(() => httpMock.verify());
});
