import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

interface ComboShout {
  id: number;
  text: string;
}

@Component({
  selector: 'app-game-hud',
  templateUrl: './game-hud.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes shout-pop {
      0%   { transform: scale(0.5); opacity: 0; }
      20%  { transform: scale(1.1); opacity: 1; }
      80%  { transform: scale(1);   opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
  `],
})
export class GameHudComponent {
  readonly songTitle  = input.required<string>();
  readonly nextGuide  = input.required<string>();
  readonly currentKey = input.required<string>();
  readonly combo      = input.required<number>();
  readonly score      = input.required<number>();

  protected readonly comboShouts = signal<ComboShout[]>([]);
  private shoutIdCounter = 0;

  get formattedScore(): string {
    return this.score().toString().padStart(6, '0');
  }

  triggerShout(text: string): void {
    const shout: ComboShout = { id: this.shoutIdCounter++, text };
    this.comboShouts.update(s => [...s, shout]);
    setTimeout(() => {
      this.comboShouts.update(s => s.filter(c => c.id !== shout.id));
    }, 1000);
  }
}