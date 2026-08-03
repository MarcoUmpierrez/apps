import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CornerFlourishComponent } from './corner-flourish/corner-flourish.component';
import { DebugPanelComponent } from './debug-panel/debug-panel.component';
import { EpilogueComponent } from './finale/epilogue/epilogue.component';
import { FinaleVideoComponent } from './finale/finale-video/finale-video.component';
import { PhotoMontageComponent } from './finale/photo-montage/photo-montage.component';
import { ProposalQuestionComponent } from './finale/proposal-question/proposal-question.component';
import { CoverScreenComponent } from './cover-screen/cover-screen.component';
import { GeoCheckComponent } from './geo-check/geo-check.component';
import { MinigamePhaseComponent } from './minigame-phase/minigame-phase.component';
import { PersonalQuestionPhaseComponent } from './personal-question-phase/personal-question-phase.component';
import { PhotoCheckpointComponent } from './photo-checkpoint/photo-checkpoint.component';
import { HuntStoreService } from './services/hunt-store.service';
import { StopIntroComponent } from './stop-intro/stop-intro.component';
import { StopStampComponent } from './stop-stamp/stop-stamp.component';

/**
 * Single lazy-loaded entry point for the entire hunt. Everything past this
 * initial load is client-side signal state, driven by HuntStoreService's
 * persisted phase — no further Angular Router navigation happens inside,
 * so losing signal mid-hunt (a real risk outdoors) can never strand her on
 * a broken route.
 */
@Component({
  selector: 'app-scavenger-hunt',
  imports: [
    CornerFlourishComponent,
    CoverScreenComponent,
    StopIntroComponent,
    GeoCheckComponent,
    MinigamePhaseComponent,
    PhotoCheckpointComponent,
    PersonalQuestionPhaseComponent,
    StopStampComponent,
    DebugPanelComponent,
    PhotoMontageComponent,
    FinaleVideoComponent,
    ProposalQuestionComponent,
    EpilogueComponent,
  ],
  templateUrl: './scavenger-hunt.component.html',
  styleUrl: './scavenger-hunt.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScavengerHuntComponent {
  protected readonly store = inject(HuntStoreService);

  readonly phase = computed(() => this.store.progress().currentPhase);
  readonly devModeUnlocked = computed(() => this.store.progress().devModeUnlocked);
}
