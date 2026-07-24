import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'stegoninja.theme';

/**
 * Manages the light/dark theme. `system` follows the OS preference (no
 * data-theme attribute, CSS media query decides); `light`/`dark` force a
 * choice via `data-theme` on the document root. The selection is persisted.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.readStoredMode());

  /** The user's selection: 'light' | 'dark' | 'system'. */
  readonly mode = this._mode.asReadonly();

  /** The effective theme after resolving 'system' against the OS preference. */
  readonly isDark = computed(() => {
    const mode = this._mode();
    if (mode === 'system') {
      return this.prefersDark();
    }
    return mode === 'dark';
  });

  constructor() {
    effect(() => {
      const mode = this._mode();
      this.applyMode(mode);
      this.storeMode(mode);
    });
  }

  /** Explicitly set the theme mode. */
  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  /** Flip between light and dark based on the current effective theme. */
  toggle(): void {
    this._mode.set(this.isDark() ? 'light' : 'dark');
  }

  private applyMode(mode: ThemeMode): void {
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    if (!root) {
      return;
    }
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
  }

  private prefersDark(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  private readStoredMode(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // localStorage unavailable (e.g. privacy mode) — fall back to system.
    }
    return 'system';
  }

  private storeMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore persistence failures.
    }
  }
}
