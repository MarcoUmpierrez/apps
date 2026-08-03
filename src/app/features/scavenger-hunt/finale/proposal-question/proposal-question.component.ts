import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HuntStoreService } from '../../services/hunt-store.service';
import { Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-proposal-question',
  templateUrl: './proposal-question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposalQuestionComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onYes(): void {
    this.store.unlockEpilogue();
    this.store.setPhase('epilogue');
  }
}
