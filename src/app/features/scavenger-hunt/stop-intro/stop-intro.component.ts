import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isAnswerCorrect } from '../fuzzy-match.util';
import { HintPanelComponent } from '../hint-panel/hint-panel.component';
import { phaseAfterArrival } from '../phase-flow.util';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

@Component({
  selector: 'app-stop-intro',
  imports: [FormsModule, HintPanelComponent],
  templateUrl: './stop-intro.component.html',
  styleUrl: './stop-intro.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StopIntroComponent {
  private readonly store = inject(HuntStoreService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  readonly riddleWrongFlash = signal(false);
  readonly riddleAttemptCount = signal(0);
  riddleInput = '';

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onContinue(): void {
    const stop = this.stop();
    if (!stop.location) {
      // No new location to travel to (the finale) — skip the geo-check phase entirely.
      this.store.markArrived(stop.id);
      this.store.setPhase(phaseAfterArrival(stop));
      return;
    }
    this.store.setPhase('geo-check');
  }

  onSubmitRiddle(): void {
    const riddle = this.stop().narrativeRiddle;
    if (!riddle) return;

    if (isAnswerCorrect(this.riddleInput, riddle.acceptedAnswers, this.lang())) {
      this.onContinue();
      return;
    }
    this.riddleAttemptCount.update((n) => n + 1);
    this.riddleWrongFlash.set(true);
    setTimeout(() => this.riddleWrongFlash.set(false), 1200);
  }
}
