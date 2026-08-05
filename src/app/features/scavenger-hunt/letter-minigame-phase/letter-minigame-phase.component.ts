import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { phaseAfterLetterMinigame } from '../phase-flow.util';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { BurgerBuildGameComponent } from './burger-build-game/burger-build-game.component';
import { ColorSequenceGameComponent } from './color-sequence-game/color-sequence-game.component';
import { DirtWipeGameComponent } from './dirt-wipe-game/dirt-wipe-game.component';
import { LaserReflectorGameComponent } from './laser-reflector-game/laser-reflector-game.component';
import { MazeGameComponent } from './maze-game/maze-game.component';
import { TowerOfHanoiGameComponent } from './tower-of-hanoi-game/tower-of-hanoi-game.component';
import { WallBreakGameComponent } from './wall-break-game/wall-break-game.component';

@Component({
  selector: 'app-letter-minigame-phase',
  imports: [
    WallBreakGameComponent,
    DirtWipeGameComponent,
    TowerOfHanoiGameComponent,
    BurgerBuildGameComponent,
    MazeGameComponent,
    LaserReflectorGameComponent,
    ColorSequenceGameComponent,
  ],
  templateUrl: './letter-minigame-phase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LetterMinigamePhaseComponent {
  private readonly store = inject(HuntStoreService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  onSolved(): void {
    this.store.setPhase(phaseAfterLetterMinigame(this.stop()));
  }
}
