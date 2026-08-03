import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { phaseAfterMinigame } from '../phase-flow.util';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { JigsawPuzzleComponent } from './jigsaw-puzzle/jigsaw-puzzle.component';
import { MemoryMatchComponent } from './memory-match/memory-match.component';
import { RiddleMcComponent } from './riddle-mc/riddle-mc.component';
import { SequenceReorderComponent } from './sequence-reorder/sequence-reorder.component';
import { ShakeToRevealComponent } from './shake-to-reveal/shake-to-reveal.component';
import { SlidingTilePuzzleComponent } from './sliding-tile-puzzle/sliding-tile-puzzle.component';
import { WordScrambleComponent } from './word-scramble/word-scramble.component';
import { WordleGuessComponent } from './wordle-guess/wordle-guess.component';

@Component({
  selector: 'app-minigame-phase',
  imports: [
    RiddleMcComponent,
    WordScrambleComponent,
    WordleGuessComponent,
    SequenceReorderComponent,
    SlidingTilePuzzleComponent,
    ShakeToRevealComponent,
    JigsawPuzzleComponent,
    MemoryMatchComponent,
  ],
  templateUrl: './minigame-phase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinigamePhaseComponent {
  private readonly store = inject(HuntStoreService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  onSolved(): void {
    const stop = this.stop();
    this.store.markMinigameSolved(stop.id);
    this.store.setPhase(phaseAfterMinigame(stop));
  }
}
