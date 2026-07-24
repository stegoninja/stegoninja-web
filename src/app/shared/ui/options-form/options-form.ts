import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StegoOptions, defaultOptions } from '../../../core/api/api.models';

/**
 * Protection options shared by embed and extract: Vigenère encryption,
 * carrier-position randomization, and the password. Two-way binds `options`.
 * `readonly` locks the controls (used when the wizard carries embed settings
 * into extract) while keeping them visible.
 */
@Component({
  selector: 'app-options-form',
  imports: [
    FormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './options-form.html',
  styleUrl: './options-form.scss',
})
export class OptionsForm {
  readonly options = model<StegoOptions>(defaultOptions());
  readonly disabled = input(false);
  readonly readonly = input(false);

  protected readonly showPassword = signal(false);

  protected setEncrypt(value: boolean): void {
    this.options.update((o) => ({ ...o, encrypt: value }));
  }

  protected setRandomize(value: boolean): void {
    this.options.update((o) => ({ ...o, randomize: value }));
  }

  protected setPassword(value: string): void {
    this.options.update((o) => ({ ...o, password: value }));
  }

  protected toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }
}
