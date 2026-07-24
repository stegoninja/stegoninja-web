import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StegoApiService } from './stego-api.service';
import { StegoApiError } from './stego-error';
import { findTechnique } from './techniques';
import { EmbedData, Envelope, StegoOptions } from './api.models';

function file(name: string, type = 'application/octet-stream'): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type });
}

const options: StegoOptions = { password: 'hunter2', encrypt: true, randomize: false };

describe('StegoApiService', () => {
  let service: StegoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StegoApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StegoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts embed with the right parts and string flags, then resolves data', () => {
    const technique = findTechnique('image-lsb')!;
    const results: string[] = [];
    let done: EmbedData | undefined;

    service.runEmbed(technique, { cover: file('c.png'), secret: file('s.txt'), options }).subscribe((p) => {
      results.push(p.phase);
      if (p.data) {
        done = p.data;
      }
    });

    const req = httpMock.expectOne('/image/lsb/embed');
    const body = req.request.body as FormData;
    expect(body.get('cover')).toBeInstanceOf(File);
    expect(body.get('secret')).toBeInstanceOf(File);
    expect(body.get('encrypt')).toBe('true');
    expect(body.get('randomize')).toBe('false');
    expect(body.get('password')).toBe('hunter2');

    const envelope: Envelope<EmbedData> = {
      status: 'success',
      message: 'ok',
      data: { result: '/results/abc', originalFilename: 's.txt', psnr: '76.35' },
    };
    req.flush(envelope);

    expect(results).toContain('done');
    expect(done?.result).toBe('/results/abc');
    expect(done?.psnr).toBe('76.35');
  });

  it('throws StegoApiError on an error envelope returned with 200', () => {
    const technique = findTechnique('image-lsb')!;
    let caught: unknown;

    service
      .runEmbed(technique, { cover: file('c.png'), secret: file('s.txt'), options })
      .subscribe({ error: (e) => (caught = e) });

    httpMock.expectOne('/image/lsb/embed').flush({
      status: 'error',
      message: 'Corrupt payload: invalid filename',
      data: {},
    });

    expect(caught).toBeInstanceOf(StegoApiError);
    expect((caught as StegoApiError).kind).toBe('corrupt-payload');
  });

  it('omits password when blank and fetches a blob for the second step', () => {
    const technique = findTechnique('video-lsb')!;
    service
      .runExtract(technique, { stego: file('x.avi'), options: { password: '', encrypt: false, randomize: false } })
      .subscribe();
    const req = httpMock.expectOne('/video/lsb/extract');
    const body = req.request.body as FormData;
    expect(body.has('password')).toBe(false);
    expect(body.get('stego')).toBeInstanceOf(File);
    req.flush({ status: 'success', message: 'ok', data: { result: '/extracts/z', originalFilename: 's.txt' } });

    service.fetchBlob('/extracts/z').subscribe();
    const dl = httpMock.expectOne('/extracts/z');
    expect(dl.request.responseType).toBe('blob');
    dl.flush(new Blob(['secret']));
  });
});
