import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  GameStoreService,
  GameMode,
  DEFAULT_TIMERS,
  GAME_MENU_ITEMS,
} from '../services/game-store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  readonly store  = inject(GameStoreService);
  private readonly router = inject(Router);

  readonly menuItems = GAME_MENU_ITEMS;

  onSlider(mode: GameMode, event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.store.updateTimer(mode, value);
  }

  resetDefaults(): void {
    (Object.keys(DEFAULT_TIMERS) as GameMode[]).forEach((mode) => {
      this.store.updateTimer(mode, DEFAULT_TIMERS[mode]);
    });
  }

  close(): void {
    this.router.navigate(['/brain']);
  }
}
