/**
 * Web Audio API based harmonic chime synthesizer.
 * Generates subtle, soothing notification tones for study sessions and breaks
 * without external audio dependencies or network latency.
 */

class AudioChimeService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    try {
      const stored = localStorage.getItem('studysphere_sound_enabled');
      this.soundEnabled = stored !== null ? stored === 'true' : true;
    } catch {
      this.soundEnabled = true;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn('Web Audio API not supported in this environment', e);
      return null;
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('studysphere_sound_enabled', enabled ? 'true' : 'false');
    } catch {}
  }

  public toggleSound(): boolean {
    this.setSoundEnabled(!this.soundEnabled);
    if (this.soundEnabled) {
      this.playGentleChime();
    }
    return this.soundEnabled;
  }

  /**
   * Plays a resonant harmonic single bell / note with soft envelope
   */
  private playTone(freq: number, startTime: number, duration: number, volume: number = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Master gain for this note
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Primary sine oscillator (pure fundamental)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Secondary overtone oscillator for warm singing-bowl shimmer
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, startTime);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(volume * 0.25, startTime);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7);

    // Lowpass filter for smooth, warm acoustic feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, startTime);

    osc1.connect(gainNode);
    osc2.connect(overtoneGain);
    overtoneGain.connect(filter);
    gainNode.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  /**
   * Soothing 3-bell Major chord progression (E5 -> G#5 -> B5 -> high E6)
   * Triggered when a deep work study timer completes or session ends.
   */
  public playSessionCompleteChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // E major meditative chime sequence (E5: 659.25Hz, G#5: 830.61Hz, B5: 987.77Hz, E6: 1318.51Hz)
    this.playTone(659.25, now, 1.2, 0.16);
    this.playTone(830.61, now + 0.22, 1.4, 0.16);
    this.playTone(987.77, now + 0.44, 1.6, 0.18);
    this.playTone(1318.51, now + 0.72, 2.0, 0.20);
  }

  /**
   * Gentle 2-bell alert for eye-rest and mindful pause reminders
   */
  public playBreakReminderChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // F#5 (739.99Hz) -> A#5 (932.33Hz) soft bell
    this.playTone(739.99, now, 1.0, 0.14);
    this.playTone(932.33, now + 0.25, 1.5, 0.16);
  }

  /**
   * Quick preview / toggle test chime
   */
  public playGentleChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    this.playTone(880, now, 0.8, 0.15); // A5
    this.playTone(1174.66, now + 0.18, 1.2, 0.15); // D6
  }

  public playPreset(preset: 'focus' | 'bell' | 'break' | 'complete') {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    switch (preset) {
      case 'focus':
        this.playTone(523.25, now, 0.6, 0.14); // C5
        this.playTone(659.25, now + 0.12, 0.8, 0.16); // E5
        break;
      case 'bell':
        this.playTone(880, now, 0.7, 0.14); // A5
        break;
      case 'break':
        this.playBreakReminderChime();
        break;
      case 'complete':
        this.playSessionCompleteChime();
        break;
      default:
        this.playGentleChime();
        break;
    }
  }
}

export const audioChime = new AudioChimeService();
