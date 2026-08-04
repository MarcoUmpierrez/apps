import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { phaseAfterPersonalQuestion } from '../phase-flow.util';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { FreeTextQuestionComponent } from './free-text-question/free-text-question.component';
import { MultipleChoiceQuestionComponent } from './multiple-choice-question/multiple-choice-question.component';
import { NotebookCodeQuestionComponent } from './notebook-code-question/notebook-code-question.component';

@Component({
  selector: 'app-personal-question-phase',
  imports: [
    MultipleChoiceQuestionComponent,
    FreeTextQuestionComponent,
    NotebookCodeQuestionComponent,
  ],
  templateUrl: './personal-question-phase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalQuestionPhaseComponent {
  private readonly store = inject(HuntStoreService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  onSolved(): void {
    const stop = this.stop();
    this.store.markPersonalQuestionSolved(stop.id);
    this.store.setPhase(phaseAfterPersonalQuestion(stop));
  }
}
