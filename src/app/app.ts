import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from './core/theme/theme.service';
import { HealthService } from './core/api/health.service';
import { ApiStatusBanner } from './shared/ui/api-status-banner/api-status-banner';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    ApiStatusBanner,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly theme = inject(ThemeService);
  protected readonly health = inject(HealthService);

  protected readonly isDark = this.theme.isDark;

  constructor() {
    this.health.check();
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }
}
