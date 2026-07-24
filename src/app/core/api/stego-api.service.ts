import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EmbedData,
  EmbedInput,
  Envelope,
  ExtractData,
  ExtractInput,
  StegoOptions,
  StegoProgress,
  Technique,
} from './api.models';
import { StegoApiError, mapServerMessage } from './stego-error';

/**
 * Talks to the StegoNinja backend. `runEmbed`/`runExtract` post multipart form
 * data and surface upload progress, then hand back the parsed envelope `data`.
 * `fetchBlob` performs the second step of the flow (downloading the artifact at
 * the returned `result` path). All origins are relative so requests go through
 * the proxy (the backend sends no CORS headers).
 */
@Injectable({ providedIn: 'root' })
export class StegoApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  runEmbed(technique: Technique, input: EmbedInput): Observable<StegoProgress<EmbedData>> {
    const form = new FormData();
    form.append('cover', input.cover);
    form.append('secret', input.secret);
    this.appendOptions(form, input.options);
    return this.post<EmbedData>(technique.embedPath, form);
  }

  runExtract(technique: Technique, input: ExtractInput): Observable<StegoProgress<ExtractData>> {
    const form = new FormData();
    form.append('stego', input.stego);
    this.appendOptions(form, input.options);
    return this.post<ExtractData>(technique.extractPath, form);
  }

  /** Second step: download the produced artifact bytes from a `result` path. */
  fetchBlob(resultPath: string): Observable<Blob> {
    return this.http.get(this.base + resultPath, { responseType: 'blob' });
  }

  private post<T>(path: string, form: FormData): Observable<StegoProgress<T>> {
    return this.http
      .post<Envelope<T>>(this.base + path, form, { reportProgress: true, observe: 'events' })
      .pipe(map((event) => this.toProgress<T>(event)));
  }

  private toProgress<T>(event: HttpEvent<Envelope<T>>): StegoProgress<T> {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        const progress = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
        // Below 100 the client is still uploading; at 100 the server is working.
        return progress >= 100
          ? { phase: 'processing', progress: 100 }
          : { phase: 'uploading', progress };
      }
      case HttpEventType.Response: {
        const body = event.body;
        if (!body || body.status === 'error') {
          const mapped = mapServerMessage(body?.message);
          throw new StegoApiError(mapped.kind, mapped.userMessage, body?.message, event.status);
        }
        return { phase: 'done', progress: 100, data: body.data };
      }
      default:
        return { phase: 'processing', progress: 100 };
    }
  }

  private appendOptions(form: FormData, options: StegoOptions): void {
    // The backend compares these as the literal strings "true"/"false".
    form.append('encrypt', options.encrypt ? 'true' : 'false');
    form.append('randomize', options.randomize ? 'true' : 'false');
    if (options.password) {
      form.append('password', options.password);
    }
  }
}
