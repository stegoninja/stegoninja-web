import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

function createLocalStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, String(value)),
  } as Storage;
}

describe('ThemeService', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to system mode with no data-theme attribute', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(service.mode()).toBe('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('setMode("dark") marks the root and reports isDark', () => {
    const service = TestBed.inject(ThemeService);
    service.setMode('dark');
    TestBed.tick();
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('stegoninja.theme')).toBe('dark');
  });

  it('toggle flips from dark to light', () => {
    const service = TestBed.inject(ThemeService);
    service.setMode('dark');
    service.toggle();
    TestBed.tick();
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
