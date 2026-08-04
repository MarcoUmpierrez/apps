import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';

/** A one-time framing screen shown once, right after language selection, before the first chapter. */
@Component({
  selector: 'app-diary-intro',
  templateUrl: './diary-intro.component.html',
  styleUrl: './diary-intro.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiaryIntroComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  onContinue(): void {
    this.store.setPhase('stop-intro');
  }
}
