import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TECHNIQUES } from '../../core/api/techniques';

/** Help page: explains techniques, options, the key rules, and privacy. */
@Component({
  selector: 'app-about',
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly techniques = TECHNIQUES;
}
