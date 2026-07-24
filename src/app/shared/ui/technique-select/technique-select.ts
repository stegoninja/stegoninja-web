import { Component, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Technique } from '../../../core/api/api.models';
import { TECHNIQUES } from '../../../core/api/techniques';

/** Dropdown for choosing a steganography technique. Two-way binds the id. */
@Component({
  selector: 'app-technique-select',
  imports: [MatFormFieldModule, MatSelectModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline" class="field">
      <mat-label>Technique</mat-label>
      <mat-select [value]="selectedId()" [disabled]="disabled()" (selectionChange)="selectedId.set($event.value)">
        @for (t of techniques(); track t.id) {
          <mat-option [value]="t.id">
            <mat-icon aria-hidden="true">{{ t.icon }}</mat-icon>
            {{ t.label }}
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }
    .field {
      width: 100%;
      max-width: 360px;
    }
    mat-icon {
      vertical-align: middle;
      margin-right: var(--sp-2);
      color: var(--text-muted);
    }
  `,
})
export class TechniqueSelect {
  readonly selectedId = model.required<string>();
  readonly disabled = input(false);
  readonly techniques = input<readonly Technique[]>(TECHNIQUES);
}
