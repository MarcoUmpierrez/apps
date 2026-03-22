import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { SONGS } from '../harmonica.data';

export interface SongEntry {
  key: string;
  name: string;
  desc: string;
}

@Component({
  selector: 'app-songs-screen',
  templateUrl: './songs-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongsScreenComponent {
  readonly back       = output<void>();
  readonly selectSong = output<string>();

  readonly songs: SongEntry[] = Object.entries(SONGS).map(([key, song]) => ({
    key,
    name: song.name,
    desc: song.desc,
  }));
}
