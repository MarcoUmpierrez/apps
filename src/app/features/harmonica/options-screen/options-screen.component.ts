import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { DifficultyLevel, HarmonicaKey } from '../harmonica.data';
import { GameService } from '../game.service';

@Component({
  selector: 'app-options-screen',
  templateUrl: './options-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsScreenComponent {
  private readonly gameService = inject(GameService);

  readonly back = output<void>();

  readonly currentKey    = this.gameService.currentKey;
  readonly difficulty    = this.gameService.difficulty;
  readonly availableKeys = this.gameService.availableKeys;

  isKeyActive(key: HarmonicaKey) {
    return key === this.currentKey();
  };

  isDifficulty(difficulty: DifficultyLevel) {
    return difficulty === this.difficulty();
  };

  setKey(key: HarmonicaKey): void {
    this.gameService.setHarmonicaKey(key);
  }

  setDifficulty(level: DifficultyLevel): void {
    this.gameService.setDifficulty(level);
  }
}
