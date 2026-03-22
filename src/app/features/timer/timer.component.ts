import { Component, signal, computed, OnDestroy, type Signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-timer',
  imports: [RouterLink],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent implements OnDestroy {
  // State Signals
  private readonly currentTime  = signal<number>(0);
  protected readonly isRunning  = signal<boolean>(false);
  protected readonly isResting  = signal<boolean>(false);
  protected readonly volume     = signal<number>(1);
  protected readonly cycleCount = signal<number>(1);

  public readonly workSeconds   = signal<number>(30);
  public readonly restSeconds   = signal<number>(15);

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private audioCtx     : AudioContext | null                   = null;

  // Computed Values
  public readonly displayTime: Signal<string> = computed(() => {
    const seconds = this.currentTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });

  public readonly phaseLabel: Signal<string> = computed(() => {
    if (!this.isRunning()) return 'Ready';
    return this.isResting() ? 'Recovery' : 'Action';
  });

  public readonly progressOffset: Signal<string> = computed(() => {
    const total = this.isResting() ? this.restSeconds() : this.workSeconds();
    if (total <= 0) return '282.74%';
    const progressPercent = (this.currentTime() / total) * 100;
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // Approx 282.74
    const offset = circumference - (progressPercent / 100) * circumference;
    return `${offset}%`;
  });

  public readonly themeClass: Signal<string> = computed(() =>
    this.isResting() ? 'bg-emerald-500' : 'bg-indigo-500'
  );

  /**
   * Initializes the audio context if not already created.
   */
  private initAudio(): void {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Updates the volume multiplier from the range input.
   */
  public updateVolume(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.volume.set(parseFloat(val));
  }

  public updateWorkSeconds(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.workSeconds.set(parseInt(val, 10) || 0);
  }

  public updateRestSeconds(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.restSeconds.set(parseInt(val, 10) || 0);
  }

  /**
   * Triggers the start of the timer session.
   */
  public startTimer(): void {
    this.initAudio();
    this.isRunning.set(true);
    this.isResting.set(false);
    this.cycleCount.set(1);
    this.currentTime.set(this.workSeconds());
    this.runTick();
  }

  /**
   * Sets up the interval logic for the countdown.
   */
  private runTick(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.currentTime() > 1) {
        this.currentTime.update(v => v - 1);
        this.playSound(this.isResting() ? 'rest' : 'work');
      } else {
        if (!this.isResting()) {
          this.playSound('bell');
          this.isResting.set(true);
          this.currentTime.set(this.restSeconds());
        } else {
          this.playSound('switch');
          this.isResting.set(false);
          this.cycleCount.update(v => v + 1);
          this.currentTime.set(this.workSeconds());
        }
      }
    }, 1000);
  }

  /**
   * Stops the timer and resets state.
   */
  public stopTimer(): void {
    this.isRunning.set(false);
    this.currentTime.set(0);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Handles audio feedback using the volume signal as a multiplier.
   */
  private playSound(type: 'work' | 'rest' | 'switch' | 'bell'): void {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const masterVol = this.volume();

    const playTone = (freq: number, duration: number, startTime: number, gainVal: number = 0.1, type: OscillatorType = 'sine') => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = type;
      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);

      osc.frequency.setValueAtTime(freq, startTime);

      const finalGain = gainVal * masterVol;
      gain.gain.setValueAtTime(finalGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    switch (type) {
      case 'work':
        playTone(900, 0.08, now, 0.15);
        break;
      case 'rest':
        playTone(400, 0.1, now, 0.12);
        break;
      case 'switch':
        [0, 0.12, 0.24].forEach((offset, i) => {
          playTone(i === 2 ? 1400 : 1000, 0.3, now + offset, 0.25);
        });
        break;
      case 'bell':
        // Boxing Bell Synthesis: Layered frequencies for a metallic "cling"
        const frequencies = [880, 1320, 1760]; // Harmonics
        frequencies.forEach(f => {
          playTone(f, 0.8, now, 0.2, 'triangle');
        });
        // Sharp transient
        playTone(2200, 0.1, now, 0.3, 'sine');
        break;
    }
  }

  public ngOnDestroy(): void {
    this.stopTimer();
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }
}
