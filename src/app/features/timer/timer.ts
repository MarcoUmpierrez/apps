import { Component, signal, computed, effect, OnDestroy, type Signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-timer',
  imports: [RouterLink],
  templateUrl: './timer.html',
  styleUrl: './timer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timer implements OnDestroy {
  // State Signals
  protected readonly isRunning = signal<boolean>(false);
  protected readonly isResting = signal<boolean>(false);
  private readonly currentTime = signal<number>(0);
  protected readonly cycleCount = signal<number>(1);

  public readonly workSeconds = signal<number>(20);
  public readonly restSeconds = signal<number>(5);

  private timerInterval: any = null;
  private audioCtx: AudioContext | null = null;

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
    if (total === 0) return '0%';
    const progressPercent = (this.currentTime() / total) * 100;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
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
        this.playSound('switch');
        if (!this.isResting()) {
          this.isResting.set(true);
          this.currentTime.set(this.restSeconds());
        } else {
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
   * Handles audio feedback for various timer events.
   */
  private playSound(type: 'work' | 'rest' | 'switch'): void {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const playTone = (freq: number, duration: number, startTime: number) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    if (type === 'work') playTone(900, 0.1, now);
    else if (type === 'rest') playTone(400, 0.1, now);
    else {
      [0, 0.15, 0.3].forEach((offset, i) => playTone(i === 2 ? 1200 : 800, 0.2, now + offset));
    }
  }

  public ngOnDestroy(): void {
    this.stopTimer();
    if (this.audioCtx) this.audioCtx.close();
  }
}
