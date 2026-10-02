/**
 * Audio Engine for Birthday Storybook
 * Plays continuous playlist:
 *   Track 1: "Mi Amor" by Mr. Wealth & Team Rem (starts at 0:48)
 *   Track 2: "Owo Oluwa Nbe Lori Aiye Mi" by P. Daniel Olawande (plays after Track 1 ends)
 * Includes realistic paper-rustle Web Audio effects for page turning.
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  startOffset?: number;
  infoSubtitle: string;
}

export const PLAYLIST: Track[] = [
  {
    id: 'mi_amor',
    title: 'Mi Amor',
    artist: 'Mr. Wealth & Team Rem',
    url: '/audio/mi_amor.mp3',
    startOffset: 48.0, // Starts at 0:48
    infoSubtitle: 'Mr. Wealth · Track 1/2',
  },
  {
    id: 'owo_oluwa',
    title: 'Owo Oluwa Nbe Lori Aiye Mi',
    artist: 'P. Daniel Olawande',
    url: '/audio/owo_oluwa.mp3',
    startOffset: 0,
    infoSubtitle: 'P. Daniel · Track 2/2',
  },
];

export interface AudioEngineState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrack: Track;
  currentTrackIndex: number;
  totalTracks: number;
}

type AudioStateListener = (state: AudioEngineState) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private currentTrackIndex: number = 0;
  private listeners: Set<AudioStateListener> = new Set();
  private hasInitialized: boolean = false;

  constructor() {
    // Lazily initialized on first user gesture
  }

  public getCurrentTrack(): Track {
    return PLAYLIST[this.currentTrackIndex] || PLAYLIST[0];
  }

  public subscribe(listener: AudioStateListener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      listener(state);
    });
  }

  private loadTrack(index: number, autoPlay: boolean = true) {
    const validIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    this.currentTrackIndex = validIndex;
    const track = PLAYLIST[validIndex];

    if (!this.audio) {
      this.audio = new Audio();
    } else {
      this.audio.pause();
    }

    this.audio.src = track.url;
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;
    this.audio.muted = this.isMuted;
    this.audio.loop = false; // Sequence handled via 'ended' event

    const startOffset = track.startOffset || 0;

    const onMeta = () => {
      if (this.audio && startOffset > 0 && this.audio.currentTime < startOffset) {
        try {
          this.audio.currentTime = startOffset;
        } catch {
          // Handled on canplay
        }
      }
    };

    this.audio.onloadedmetadata = onMeta;
    this.audio.oncanplay = onMeta;

    // Transition to next track when current one finishes
    this.audio.onended = () => {
      if (this.isPlaying) {
        // Automatically play the next song in the playlist
        const nextIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
        this.playTrackIndex(nextIndex);
      }
    };

    // Safety guard for track with startOffset (prevent rewinding before offset)
    this.audio.ontimeupdate = () => {
      if (this.audio && this.isPlaying && startOffset > 0) {
        if (this.audio.currentTime < startOffset - 0.5) {
          this.audio.currentTime = startOffset;
        }
      }
    };

    this.audio.onplay = () => {
      this.isPlaying = true;
      this.notify();
    };

    this.audio.onpause = () => {
      this.isPlaying = false;
      this.notify();
    };

    if (autoPlay) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch((e) => {
        console.warn('Playback awaiting user gesture:', e);
      });
    } else {
      this.notify();
    }
  }

  private initAudio() {
    if (this.hasInitialized && this.audio) return;
    this.loadTrack(0, false);
    this.hasInitialized = true;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public async start() {
    this.initContext();
    this.initAudio();
    this.isMuted = false;

    if (this.audio) {
      this.audio.muted = false;
      this.audio.volume = this.volume;
      const track = this.getCurrentTrack();
      const startOffset = track.startOffset || 0;
      if (startOffset > 0 && this.audio.currentTime < startOffset) {
        try {
          this.audio.currentTime = startOffset;
        } catch {
          // Handled in loadedmetadata
        }
      }
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.notify();
      } catch (err) {
        console.warn('Audio playback waiting for user gesture or policy:', err);
      }
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggleMute() {
    if (!this.audio || !this.isPlaying) {
      this.start();
      return;
    }
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.muted = this.isMuted;
    }
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }
    this.notify();
  }

  public playTrackIndex(index: number) {
    this.initContext();
    this.loadTrack(index, true);
  }

  public nextTrack() {
    this.playTrackIndex(this.currentTrackIndex + 1);
  }

  public prevTrack() {
    this.playTrackIndex(this.currentTrackIndex - 1);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public getState(): AudioEngineState {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrack: this.getCurrentTrack(),
      currentTrackIndex: this.currentTrackIndex,
      totalTracks: PLAYLIST.length,
    };
  }

  public playPageTurnSound() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;

      // 1. Heavy Archival Paper Whoosh & Surface Friction
      const duration1 = 0.55;
      const bufferSize1 = Math.floor(sampleRate * duration1);
      const buffer1 = this.ctx.createBuffer(1, bufferSize1, sampleRate);
      const data1 = buffer1.getChannelData(0);
      let lastVal = 0.0;
      for (let i = 0; i < bufferSize1; i++) {
        const white = Math.random() * 2 - 1;
        data1[i] = (lastVal + (0.05 * white)) / 1.05;
        lastVal = data1[i];
        data1[i] *= 3.8;
      }

      const noise1 = this.ctx.createBufferSource();
      noise1.buffer = buffer1;

      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(1500, now);
      filter1.frequency.exponentialRampToValueAtTime(360, now + duration1);
      filter1.Q.setValueAtTime(1.6, now);

      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.38, now + 0.12);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration1);

      noise1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.masterGain || this.ctx.destination);

      noise1.start(now);
      noise1.stop(now + duration1);

      // 2. High-Frequency Crisp Parchment Edge Crinkle & Flutter
      const durationCrinkle = 0.42;
      const bufferSizeCrinkle = Math.floor(sampleRate * durationCrinkle);
      const bufferCrinkle = this.ctx.createBuffer(1, bufferSizeCrinkle, sampleRate);
      const dataCrinkle = bufferCrinkle.getChannelData(0);
      for (let i = 0; i < bufferSizeCrinkle; i++) {
        const burst = Math.random() > 0.45 ? (Math.random() * 2 - 1) : 0;
        dataCrinkle[i] = burst * 0.5;
      }

      const noiseCrinkle = this.ctx.createBufferSource();
      noiseCrinkle.buffer = bufferCrinkle;

      const filterCrinkle = this.ctx.createBiquadFilter();
      filterCrinkle.type = 'highpass';
      filterCrinkle.frequency.setValueAtTime(1600, now + 0.04);

      const gainCrinkle = this.ctx.createGain();
      gainCrinkle.gain.setValueAtTime(0.001, now + 0.04);
      gainCrinkle.gain.linearRampToValueAtTime(0.24, now + 0.14);
      gainCrinkle.gain.exponentialRampToValueAtTime(0.001, now + durationCrinkle);

      noiseCrinkle.connect(filterCrinkle);
      filterCrinkle.connect(gainCrinkle);
      gainCrinkle.connect(this.masterGain || this.ctx.destination);

      noiseCrinkle.start(now + 0.04);
      noiseCrinkle.stop(now + durationCrinkle);

      // 3. Stage 2: Gentle Landing Thud & Settling Flutter
      const landingTime = now + 0.65;
      const duration2 = 0.38;
      const bufferSize2 = Math.floor(sampleRate * duration2);
      const buffer2 = this.ctx.createBuffer(1, bufferSize2, sampleRate);
      const data2 = buffer2.getChannelData(0);
      for (let i = 0; i < bufferSize2; i++) {
        data2[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise2 = this.ctx.createBufferSource();
      noise2.buffer = buffer2;

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(620, landingTime);
      filter2.frequency.exponentialRampToValueAtTime(180, landingTime + duration2);

      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.001, landingTime);
      gain2.gain.linearRampToValueAtTime(0.3, landingTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.0001, landingTime + duration2);

      noise2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(this.masterGain || this.ctx.destination);

      noise2.start(landingTime);
      noise2.stop(landingTime + duration2);
    } catch {
      // Audio buffer fallback
    }
  }
}

export const globalAudioEngine = new AudioEngine();
