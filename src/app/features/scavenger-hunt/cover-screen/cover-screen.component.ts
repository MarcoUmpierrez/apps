import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

const DEBUG_LONG_PRESS_MS = 10000;
const DEBUG_TOAST_MS = 2000;

@Component({
  selector: 'app-cover-screen',
  templateUrl: './cover-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverScreenComponent {
  private readonly store = inject(HuntStoreService);

  readonly selectedLanguage = signal<Language>('es');
  readonly devModeToastVisible = signal(false);

  private longPressTimeoutId: ReturnType<typeof setTimeout> | null = null;

  t(key: UiStringKey): string {
    return translateUi(this.selectedLanguage(), key);
  }

  selectLanguage(lang: Language): void {
    this.selectedLanguage.set(lang);
  }

  onBeginPointerDown(): void {
    this.longPressTimeoutId = setTimeout(() => {
      this.longPressTimeoutId = null;
      this.store.unlockDevMode();
      this.devModeToastVisible.set(true);
      setTimeout(() => this.devModeToastVisible.set(false), DEBUG_TOAST_MS);
    }, DEBUG_LONG_PRESS_MS);
  }

  onBeginPointerUp(): void {
    if (this.longPressTimeoutId !== null) {
      clearTimeout(this.longPressTimeoutId);
      this.longPressTimeoutId = null;
    }
    this.store.beginHunt(this.selectedLanguage());
  }

  onBeginPointerCancel(): void {
    if (this.longPressTimeoutId !== null) {
      clearTimeout(this.longPressTimeoutId);
      this.longPressTimeoutId = null;
    }
  }
}
