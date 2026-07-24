import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TECHNIQUES } from '../../core/api/techniques';

/**
 * Landing page: introduces the product, lets the user pick a technique (which
 * starts the guided round-trip pre-scoped to it), and offers direct entry to
 * the standalone Embed and Extract tools.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly techniques = TECHNIQUES;
}
