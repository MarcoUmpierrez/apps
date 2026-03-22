import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  GameStoreService,
  GAME_MENU_ITEMS,
  GameMode,
} from '../services/game-store.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.component.html',
})
export class MenuComponent {
  readonly store     = inject(GameStoreService);
  private readonly router = inject(Router);

  readonly menuItems = GAME_MENU_ITEMS;

  startGame(mode: GameMode): void {
    this.router.navigate(['/brain/game', mode]);
  }
}
