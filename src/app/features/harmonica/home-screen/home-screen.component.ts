import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeScreenComponent {
  readonly startFreePlay = output<void>();
  readonly showSongs     = output<void>();
  readonly showOptions   = output<void>();
}
