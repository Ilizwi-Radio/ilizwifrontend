/**
 * Web Audio Engine for Presenter Studio
 * Handles real-time microphone stream, spectrum analysis, synthesized backing tracks,
 * uploaded audio playback, soundboard effects, and intelligent mic-over-music auto ducking.
 */

import { SoundEffect } from './types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Music channel
  private musicGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;
  private activeMusicSource: AudioBufferSourceNode | OscillatorNode | null = null;
  private activeMusicInterval: number | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioMediaSource: MediaElementAudioSourceNode | null = null;

  // Sound FX channel
  private sfxGain: GainNode | null = null;

  // Master out
  private masterGain: GainNode | null = null;

  // State
  public isMicActive: boolean = false;
  public isMuted: boolean = false;
  public isSimulated: boolean = false;
  public isMusicPlaying: boolean = false;
  public activeTrackId: string | null = null;
  public autoDucking: boolean = true;
  public duckingThreshold: number = 25; // 0-100%
  public baseMusicVolume: number = 0.7; // 0-1
  public micVolume: number = 1.0;

  // Listeners
  private intensityListeners: ((intensity: number, peak: number) => void)[] = [];
  private animFrameId: number | null = null;
  private simTime: number = 0;

  constructor() {
    // Lazy init audio context on user interaction
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Mic Analyser & Gain
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.micGain = this.ctx.createGain();
      this.micGain.gain.setValueAtTime(this.micVolume, this.ctx.currentTime);
      this.micGain.connect(this.analyser);
      // Note: we don't connect mic to destination by default to prevent speaker feedback loop,
      // unless broadcast monitor is explicitly wired.

      // Music Channel with Ducking
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.baseMusicVolume, this.ctx.currentTime);

      this.duckingGain = this.ctx.createGain();
      this.duckingGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.musicGain.connect(this.duckingGain);
      this.duckingGain.connect(this.masterGain);

      // SFX Channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Start capturing real microphone
   */
  public async startMicrophone(): Promise<{ success: boolean; simulated: boolean; error?: string }> {
    try {
      const ctx = this.getContext();
      if (this.micStream) {
        this.stopMicrophone();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.micStream = stream;
      this.micSource = ctx.createMediaStreamSource(stream);
      if (this.micGain) {
        this.micSource.connect(this.micGain);
      }

      this.isMicActive = true;
      this.isSimulated = false;
      this.startMeterLoop();

      return { success: true, simulated: false };
    } catch (err: unknown) {
      console.warn('Microphone permission not granted or device not available, switching to Studio Simulation Mode.', err);
      // Enable simulation mode so user can test the visualizer immediately
      this.isMicActive = true;
      this.isSimulated = true;
      this.startMeterLoop();
      return { success: true, simulated: true, error: (err as Error).message };
    }
  }

  public stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    this.isMicActive = false;
    this.isSimulated = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.micGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.micVolume;
      this.micGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public setMicVolume(vol: number) {
    this.micVolume = Math.max(0, Math.min(2, vol));
    if (this.micGain && this.ctx && !this.isMuted) {
      this.micGain.gain.setTargetAtTime(this.micVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.baseMusicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.baseMusicVolume, this.ctx.currentTime, 0.05);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.baseMusicVolume;
    }
  }

  public subscribeIntensity(cb: (intensity: number, peak: number) => void) {
    this.intensityListeners.push(cb);
    return () => {
      this.intensityListeners = this.intensityListeners.filter((l) => l !== cb);
    };
  }

  public getFrequencyData(array: Uint8Array): void {
    
    if (this.analyser && !this.isSimulated && this.isMicActive && !this.isMuted) {
      this.analyser.getByteFrequencyData(array as Uint8Array<ArrayBuffer>);
    } else if (this.isSimulated && this.isMicActive && !this.isMuted) {
      // Generate synthetic frequency bands
      const time = this.simTime * 0.05;
      for (let i = 0; i < array.length; i++) {
        const base = Math.sin(time * 3 + i * 0.2) * 0.5 + 0.5;
        const sub = Math.cos(time * 1.5 + i * 0.1) * 0.3;
        const envelope = Math.max(0, 1 - i / (array.length * 0.8));
        const val = Math.floor(Math.min(255, Math.max(0, (base + sub) * 200 * envelope)));
        array[i] = val;
      }
    } else {
      array.fill(0);
    }
  }

  public getTimeDomainData(array: Uint8Array): void {
    if (this.analyser && !this.isSimulated && this.isMicActive && !this.isMuted) {
      this.analyser.getByteTimeDomainData(array as Uint8Array<ArrayBuffer>);
    } else if (this.isSimulated && this.isMicActive && !this.isMuted) {
      const time = this.simTime * 0.1;
      for (let i = 0; i < array.length; i++) {
        const wave = Math.sin(time * 2 + i * 0.08) * Math.cos(time * 0.5) * 40;
        array[i] = Math.min(255, Math.max(0, Math.floor(128 + wave)));
      }
    } else {
      array.fill(128);
    }
  }

  private startMeterLoop() {
    if (this.animFrameId) return;

    const dataArray = new Uint8Array(this.analyser ? this.analyser.frequencyBinCount : 128);

    const loop = () => {
      this.simTime += 1;
      let currentIntensity = 0;
      let peak = 0;

      if (this.isMicActive && !this.isMuted) {
        if (!this.isSimulated && this.analyser) {
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const val = dataArray[i];
            sum += val * val;
            if (val > peak) peak = val;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          currentIntensity = Math.min(100, Math.round((rms / 128) * 100 * this.micVolume));
          peak = Math.min(100, Math.round((peak / 255) * 100));
        } else if (this.isSimulated) {
          // Dynamic conversational speaking rhythm simulation
          const cadence = Math.sin(this.simTime * 0.08);
          const talkBurst = Math.sin(this.simTime * 0.02) > -0.2;
          const noise = Math.random() * 18;
          if (talkBurst) {
            currentIntensity = Math.min(100, Math.max(15, Math.round((Math.abs(cadence) * 60 + noise) * this.micVolume)));
            peak = Math.min(100, Math.round(currentIntensity * 1.25));
          } else {
            currentIntensity = Math.round(noise * 0.5);
            peak = Math.round(noise * 0.7);
          }
        }
      }

      // Auto ducking logic
      if (this.autoDucking && this.duckingGain && this.ctx) {
        if (currentIntensity > this.duckingThreshold && this.isMicActive && !this.isMuted) {
          // Duck music down to 25%
          this.duckingGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.1);
        } else {
          // Restore full music gain smoothly
          this.duckingGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.4);
        }
      }

      // Notify listeners
      for (const listener of this.intensityListeners) {
        listener(currentIntensity, peak);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------
  // MUSIC & AUDIO TRACK PLAYBACK
  // -------------------------------------------------------------

  public playPresetMusic(preset: 'lofi' | 'house' | 'ambient' | 'jazz' | 'synthwave' | 'news' | string, trackId: string) {
    this.stopMusic();
    const ctx = this.getContext();

    this.activeTrackId = trackId;
    this.isMusicPlaying = true;

    // Build synthesized rhythmic track loops using Web Audio nodes
    if (preset === 'lofi' || preset === 'jazz') {
      this.startLofiGroove(ctx);
    } else if (preset === 'house' || preset === 'synthwave') {
      this.startHouseBeat(ctx);
    } else if (preset === 'news') {
      this.startNewsBed(ctx);
    } else {
      this.startAmbientBed(ctx);
    }
  }

  public playCustomAudioUrl(url: string, trackId: string, onEnded?: () => void) {
    this.stopMusic();
    this.getContext();

    this.activeTrackId = trackId;
    this.isMusicPlaying = true;

    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.volume = this.baseMusicVolume;

    this.audioElement.onended = () => {
      this.isMusicPlaying = false;
      this.activeTrackId = null;
      if (onEnded) onEnded();
    };

    this.audioElement.play().catch((err) => {
      console.warn('Audio play prevented:', err);
    });
  }

  public stopMusic() {
    if (this.activeMusicInterval) {
      clearInterval(this.activeMusicInterval);
      this.activeMusicInterval = null;
    }
    if (this.activeMusicSource) {
      try {
        this.activeMusicSource.stop();
        this.activeMusicSource.disconnect();
      } catch {
        // ignore already stopped
      }
      this.activeMusicSource = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    this.isMusicPlaying = false;
    this.activeTrackId = null;
  }

  // Synthesized Radio Music Loops
  private startLofiGroove(ctx: AudioContext) {
    if (!this.musicGain) return;

    // Chords progression: Dm7 -> G7 -> Cmaj7 -> Am7
    const chords = [
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [392.0, 493.88, 587.33, 698.46], // G7
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
    ];
    let step = 0;

    const playChordStep = () => {
      if (!this.isMusicPlaying) return;
      const currentChord = chords[step % chords.length];
      step++;

      currentChord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const chordGain = ctx.createGain();

        // Warm filtered Rhodes-like tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);

        chordGain.gain.setValueAtTime(0.001, ctx.currentTime);
        chordGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        chordGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc.connect(filter);
        filter.connect(chordGain);
        if (this.musicGain) chordGain.connect(this.musicGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.9);
      });

      // Subtle warm sub-bass
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(currentChord[0] / 2, ctx.currentTime);

      bassGain.gain.setValueAtTime(0.001, ctx.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      bassOsc.connect(bassGain);
      if (this.musicGain) bassGain.connect(this.musicGain);
      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 1.9);
    };

    playChordStep();
    this.activeMusicInterval = window.setInterval(playChordStep, 1900);
  }

  private startHouseBeat(ctx: AudioContext) {
    if (!this.musicGain) return;
    let beat = 0;

    const playBeat = () => {
      if (!this.isMusicPlaying) return;
      const now = ctx.currentTime;

      // 4 on the floor Kick
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.frequency.setValueAtTime(130, now);
      kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.35);

      kickGain.gain.setValueAtTime(0.25, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      kickOsc.connect(kickGain);
      if (this.musicGain) kickGain.connect(this.musicGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.35);

      // Offbeat Hi-hat
      if (beat % 2 === 1) {
        this.playNoiseSnippet(0.04, 0.06, 6000);
      }

      // Synth stab
      if (beat % 4 === 0) {
        const stabFreqs = [440, 554.37, 659.25];
        stabFreqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(filter);
          filter.connect(gain);
          if (this.musicGain) gain.connect(this.musicGain);
          osc.start(now);
          osc.stop(now + 0.22);
        });
      }

      beat++;
    };

    playBeat();
    this.activeMusicInterval = window.setInterval(playBeat, 480); // ~125 BPM
  }

  private startNewsBed(ctx: AudioContext) {
    if (!this.musicGain) return;
    let step = 0;

    const playPulse = () => {
      if (!this.isMusicPlaying) return;
      const now = ctx.currentTime;

      // Urgent radar pulse synth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(step % 2 === 0 ? 880 : 1108.73, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      if (this.musicGain) gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.18);

      step++;
    };

    playPulse();
    this.activeMusicInterval = window.setInterval(playPulse, 400);
  }

  private startAmbientBed(ctx: AudioContext) {
    if (!this.musicGain) return;
    const freqs = [174.61, 220.0, 261.63, 349.23]; // F major soothing pad

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slow LFO modulation for warmth
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(3, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.0);

      osc.connect(gain);
      if (this.musicGain) gain.connect(this.musicGain);
      osc.start(ctx.currentTime);
    });
  }

  private playNoiseSnippet(duration: number, volume: number, highpassFreq: number = 4000) {
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpassFreq, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    if (this.musicGain) gain.connect(this.musicGain);

    whiteNoise.start(ctx.currentTime);
  }

  // -------------------------------------------------------------
  // SOUND EFFECTS (SFX SOUNDBOARD)
  // -------------------------------------------------------------

  public triggerSoundEffect(type: SoundEffect['type']) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'airhorn':
        this.playAirhorn(ctx, now);
        break;
      case 'applause':
        this.playApplause(ctx, now);
        break;
      case 'chime':
        this.playRadioChime(ctx, now);
        break;
      case 'drumroll':
        this.playDrumroll(ctx, now);
        break;
      case 'scratch':
        this.playVinylScratch(ctx, now);
        break;
      case 'laser':
        this.playLaser(ctx, now);
        break;
      case 'censor':
        this.playCensorBeep(ctx, now);
        break;
      case 'station_id':
      default:
        this.playStationId(ctx, now);
        break;
    }
  }

  private playAirhorn(ctx: AudioContext, now: number) {
    const notes = [
      { f: 587.33, dur: 0.12 }, // D5
      { f: 587.33, dur: 0.12 },
      { f: 587.33, dur: 0.12 },
      { f: 440.0, dur: 0.12 },  // A4
      { f: 587.33, dur: 0.45 }, // D5 sustained
    ];

    let delay = 0;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, now + delay);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(n.f * 1.01, now + delay); // slightly detuned for brass punch

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + n.dur);

      osc.connect(gain);
      osc2.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);

      osc.start(now + delay);
      osc.stop(now + delay + n.dur + 0.05);
      osc2.start(now + delay);
      osc2.stop(now + delay + n.dur + 0.05);

      delay += n.dur * 0.9;
    });
  }

  private playApplause(ctx: AudioContext, now: number) {
    // Generate filtered pink noise burst with clap envelopes
    const duration = 2.5;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    noise.start(now);
  }

  private playRadioChime(ctx: AudioContext, now: number) {
    const tones = [523.25, 659.25, 783.99, 1046.5]; // C E G C bell
    tones.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.12);

      gain.gain.setValueAtTime(0.18, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.2);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 1.3);
    });
  }

  private playDrumroll(ctx: AudioContext, now: number) {
    const hits = 18;
    for (let i = 0; i < hits; i++) {
      const t = now + (i * 0.06);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

      gain.gain.setValueAtTime(0.05 + (i / hits) * 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.06);
    }

    // Final crash
    setTimeout(() => {
      this.playNoiseSnippet(0.8, 0.25, 3000);
    }, hits * 60);
  }

  private playVinylScratch(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.08);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.16);
    osc.frequency.linearRampToValueAtTime(100, now + 0.26);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playLaser(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.27);
  }

  private playCensorBeep(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0.2, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.68);
  }

  private playStationId(ctx: AudioContext, now: number) {
    // 3-note signature station stinger
    const chords = [
      { f: 440.0, d: 0.18 }, // A4
      { f: 554.37, d: 0.18 }, // C#5
      { f: 659.25, d: 0.5 }, // E5
    ];
    let offset = 0;
    chords.forEach((c) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, now + offset);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + c.d);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(now + offset);
      osc.stop(now + offset + c.d + 0.05);

      offset += 0.15;
    });
  }
}

export const audioEngine = new AudioEngine();
