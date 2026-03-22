import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HomeScreenComponent } from './home-screen/home-screen.component';
import { OptionsScreenComponent } from './options-screen/options-screen.component';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { SongsScreenComponent } from './song-screen/songs-screen.component';

export type AppScreen = 'home' | 'songs' | 'options' | 'game';

@Component({
  selector: 'app-harmonica-hero',
  templateUrl: './harmonica-hero.component.html',
  styleUrl:'./harmonica-hero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeScreenComponent, SongsScreenComponent, OptionsScreenComponent, GameScreenComponent],
})
export class HarmonicaHeroComponent {
  readonly currentScreen = signal<AppScreen>('home');
  readonly activeSongKey = signal<string>('free');

  navigate(screen: AppScreen): void {
    this.currentScreen.set(screen);
  }

  startGame(songKey: string): void {
    this.activeSongKey.set(songKey);
    this.currentScreen.set('game');
  }
}
