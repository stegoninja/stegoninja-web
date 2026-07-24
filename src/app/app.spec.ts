import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { environment } from '../environments/environment';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  function flushHealth(): void {
    // The shell probes health on init; satisfy that request in tests.
    httpMock.expectOne(environment.healthPath).flush({ status: 'ok' });
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
    flushHealth();
  });

  it('should render a router outlet and brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    flushHealth();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.textContent).toContain('StegoNinja');
  });
});
