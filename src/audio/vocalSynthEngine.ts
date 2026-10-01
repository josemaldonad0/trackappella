// Web Audio Multi-Track Vocal Synthesizer & Harmonizer Engine
import * as Tone from 'tone';

export interface AudioNoteEvent {
  partId: string;
  noteName: string;
  midi: number;
  time: number;
  duration: number;
}

export const NOTE_TO_MIDI: Record<string, number> = {
  'C2': 36, 'C#2': 37, 'Db2': 37, 'D2': 38, 'D#2': 39, 'Eb2': 39, 'E2': 40, 'F2': 41, 'F#2': 42, 'Gb2': 42, 'G2': 43, 'G#2': 44, 'Ab2': 44, 'A2': 45, 'A#2': 46, 'Bb2': 46, 'B2': 47,
  'C3': 48, 'C#3': 49, 'Db3': 49, 'D3': 50, 'D#3': 51, 'Eb3': 51, 'E3': 52, 'F3': 53, 'F#3': 54, 'Gb3': 54, 'G3': 55, 'G#3': 56, 'Ab3': 56, 'A3': 57, 'A#3': 58, 'Bb3': 58, 'B3': 59,
  'C4': 60, 'C#4': 61, 'Db4': 61, 'D4': 62, 'D#4': 63, 'Eb4': 63, 'E4': 64, 'F4': 65, 'F#4': 66, 'Gb4': 66, 'G4': 67, 'G#4': 68, 'Ab4': 68, 'A4': 69, 'A#4': 70, 'Bb4': 70, 'B4': 71,
  'C5': 72, 'C#5': 73, 'Db5': 73, 'D5': 74, 'D#5': 75, 'Eb5': 75, 'E5': 76, 'F5': 77, 'F#5': 78, 'Gb5': 78, 'G5': 79, 'G#5': 80, 'Ab5': 80, 'A5': 81, 'A#5': 82, 'Bb5': 82, 'B5': 83,
  'C6': 84
};

export const MIDI_TO_NAME: Record<number, string> = {
  36: 'C2', 37: 'Db2', 38: 'D2', 39: 'Eb2', 40: 'E2', 41: 'F2', 42: 'Gb2', 43: 'G2', 44: 'Ab2', 45: 'A2', 46: 'Bb2', 47: 'B2',
  48: 'C3', 49: 'Db3', 50: 'D3', 51: 'Eb3', 52: 'E3', 53: 'F3', 54: 'Gb3', 55: 'G3', 56: 'Ab3', 57: 'A3', 58: 'Bb3', 59: 'B3',
  60: 'C4', 61: 'Db4', 62: 'D4', 63: 'Eb4', 64: 'E4', 65: 'F4', 66: 'Gb4', 67: 'G4', 68: 'Ab4', 69: 'A4', 70: 'Bb4', 71: 'B4',
  72: 'C5', 73: 'Db5', 74: 'D5', 75: 'Eb5', 76: 'E5', 77: 'F5', 78: 'Gb5', 79: 'G5', 80: 'Ab5', 81: 'A5', 82: 'Bb5', 83: 'B5',
  84: 'C6'
};

export function midiToFrequency(midi: number, semitoneOffset = 0): number {
  return 440 * Math.pow(2, (midi + semitoneOffset - 69) / 12);
}

export function frequencyToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

export class VocalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterVolume: number = 0.85;
  private partGains: Map<string, GainNode> = new Map();
  private partPanners: Map<string, StereoPannerNode> = new Map();

  // Decoded AudioBuffer cache & in-flight requests: url -> AudioBuffer
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private bufferLoadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();

  // Active playing AudioBufferSourceNode instances: partId -> AudioBufferSourceNode
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();

  // Engine playback state tracking
  private isPlaying = false;
  private playbackSessionId = 0;
  private currentSong: any = null;
  private currentSongId: string | null = null;
  private playbackContextStartTime = 0;
  private playbackTrackStartOffset = 0;
  private currentSpeed = 1.0;
  private currentKeyOffset = 0;
  private currentMutes: Record<string, boolean> = {};
  private currentSolos: Record<string, boolean> = {};
  private currentVolumes: Record<string, number> = {};
  private lastPartIdsKey = '';
  private partSyncOffsets: Record<string, number> = {};

  // Pitch pipe reference tone
  private pitchPipeNode: { oscs: OscillatorNode[]; gain: GainNode } | null = null;
  
  // Real-time Pitch Shifter for independent pitch transposition and speed regulation
  private pitchShifter: Tone.PitchShift | null = null;

  // Microphone pitch detection
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isDetectingPitch = false;
  private detectionAnimFrame: number | null = null;
  private onPitchDetectedCallback: ((pitch: { freq: number; midi: number; noteName: string; cents: number; clarity: number } | null) => void) | null = null;

  // MediaRecorder for performance take
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingDest: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    // Lazy initialized on user action
  }

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      Tone.setContext(this.ctx);
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getContext(): AudioContext {
    return this.initContext();
  }

  public async init() {
    this.initContext();
  }

  /**
   * Sets the master volume for the entire engine (affects all stems together)
   */
  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1.5, vol));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      } catch {
        this.masterGain.gain.value = this.masterVolume;
      }
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Check whether arrangement has playable recorded audio tracks
   * (per-part stems, full mix track, or part audioUrl).
   */
  public hasAudioTracks(song?: any): boolean {
    if (!song) return false;
    if (song.assets?.fullMixAudioUrl || song.fullMixAudioUrl || song.fullMixUrl || song.audioUrl) {
      return true;
    }
    if (song.assets?.audioStems && typeof song.assets.audioStems === 'object') {
      const values = Object.values(song.assets.audioStems) as string[];
      if (values.some(url => Boolean(url && typeof url === 'string' && url.trim().length > 0))) {
        return true;
      }
    }
    if (Array.isArray(song.parts) && song.parts.some((p: any) => Boolean(p.audioUrl || song.assets?.audioStems?.[p.id]))) {
      return true;
    }
    return false;
  }

  /**
   * Asynchronously fetches and decodes an audio file into an AudioBuffer
   */
  public async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (!url || typeof url !== 'string') return null;
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }
    if (this.bufferLoadingPromises.has(url)) {
      return this.bufferLoadingPromises.get(url)!;
    }

    const loadPromise = (async () => {
      try {
        const ctx = this.initContext();
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`[AudioEngine] Failed to fetch audio stem at ${url}: HTTP ${response.status}`);
          return null;
        }
        const arrayBuffer = await response.arrayBuffer();

        // decodeAudioData detaches the ArrayBuffer in WebKit and standard browsers,
        // so we clone with slice(0) and support both Promise and callback resolutions
        const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
          const bufferCopy = arrayBuffer.slice(0);
          const res = ctx.decodeAudioData(
            bufferCopy,
            (decoded) => resolve(decoded),
            (err) => reject(err)
          );
          if (res && typeof (res as Promise<AudioBuffer>).then === 'function') {
            (res as Promise<AudioBuffer>).then(resolve).catch(reject);
          }
        });

        this.audioBufferCache.set(url, audioBuffer);
        return audioBuffer;
      } catch (err) {
        console.warn(`[AudioEngine] Error decoding audio stem from ${url}:`, err);
        return null;
      } finally {
        this.bufferLoadingPromises.delete(url);
      }
    })();

    this.bufferLoadingPromises.set(url, loadPromise);
    return loadPromise;
  }

  /**
   * Retrieves the true duration in seconds from the loaded AudioBuffer stems
   */
  public getTrackDuration(): number | null {
    for (const source of this.activeSources.values()) {
      if (source.buffer && source.buffer.duration > 0) {
        return source.buffer.duration;
      }
    }
    for (const buf of this.audioBufferCache.values()) {
      if (buf && buf.duration > 0) {
        return buf.duration;
      }
    }
    return null;
  }

  /**
   * Sets manual sync offsets for vocal stems (e.g. from Contributor Studio stem alignment)
   */
  public setPartSyncOffsets(offsets: Record<string, number>) {
    this.partSyncOffsets = { ...offsets };
  }

  public getPartSyncOffsets(): Record<string, number> {
    return { ...this.partSyncOffsets };
  }

  /**
   * Preloads all audio stems and full mix for a song into memory buffers
   */
  public setupStems(song: { id?: string; parts?: { id: string; audioUrl?: string }[]; assets?: { audioStems?: Record<string, string>; fullMixAudioUrl?: string; partSyncOffsets?: Record<string, number> }; audioUrl?: string; fullMixUrl?: string; partSyncOffsets?: Record<string, number> }) {
    if (!song) return;
    const songId = song.id || 'current_song';
    this.currentSong = song;

    if (this.currentSongId !== songId) {
      this.currentSongId = songId;
    }

    // Load saved or configured sync offsets
    if (song.id) {
      try {
        const saved = localStorage.getItem(`trackappella_sync_offsets_${song.id}`);
        if (saved) {
          this.partSyncOffsets = JSON.parse(saved);
        } else if (song.assets?.partSyncOffsets) {
          this.partSyncOffsets = { ...song.assets.partSyncOffsets };
        } else if (song.partSyncOffsets) {
          this.partSyncOffsets = { ...song.partSyncOffsets };
        }
      } catch {
        this.partSyncOffsets = song.partSyncOffsets || song.assets?.partSyncOffsets || {};
      }
    } else if (song.partSyncOffsets) {
      this.partSyncOffsets = { ...song.partSyncOffsets };
    }

    if (Array.isArray(song.parts)) {
      this.setupParts(song.parts.map(p => p.id));
      song.parts.forEach(part => {
        const stemUrl = song.assets?.audioStems?.[part.id] || part.audioUrl;
        if (stemUrl && typeof stemUrl === 'string') {
          // Immediately pre-fetch and decode AudioBuffer into memory cache
          this.loadAudioBuffer(stemUrl);
        }
      });
    }

    const fullMixUrl = song.assets?.fullMixAudioUrl || song.fullMixUrl || song.audioUrl;
    if (fullMixUrl && typeof fullMixUrl === 'string') {
      this.loadAudioBuffer(fullMixUrl);
    }
  }

  /**
   * Returns current playhead track position in seconds with sub-millisecond precision.
   * Regulated strictly by speed (tempo), independent of key transposition.
   */
  public getCurrentTrackTime(): number | null {
    if (!this.isPlaying) return null;

    if (this.ctx && this.activeSources.size > 0) {
      // If we are within the hardware scheduling cushion before sound begins, return start offset
      if (this.ctx.currentTime < this.playbackContextStartTime) {
        return this.playbackTrackStartOffset;
      }
      // Elapsed track time depends solely on playback speed (tempo), preserving intended tempo regardless of key shift
      const elapsed = (this.ctx.currentTime - this.playbackContextStartTime) * this.currentSpeed;
      return Math.max(0, this.playbackTrackStartOffset + elapsed);
    }

    return this.playbackTrackStartOffset;
  }

  /**
   * Seeks to a specific timestamp in the audio track
   */
  public seek(currentTime: number) {
    const targetTime = Math.max(0, currentTime);
    this.playbackTrackStartOffset = targetTime;

    if (this.isPlaying && this.currentSong) {
      this.startPlayback(
        this.currentSong,
        targetTime,
        this.currentMutes,
        this.currentSolos,
        this.currentKeyOffset,
        this.currentSpeed,
        this.currentVolumes
      );
    }
  }

  /**
   * Configures independent pitch shifting and tempo/speed regulation:
   * 1. Changing playback speed (e.g. 0.5x, 1.5x) regulates tempo via buffer playbackRate.
   *    The pitch shifter applies an inverse transposition (-12 * log2(speed)) to completely neutralize
   *    the speed's pitch deviation, strictly preserving the intended musical key.
   * 2. Changing musical key sets the pitch shifter transposition directly (+keyOffset semitones).
   *    Playback speed is unaffected, preserving the exact intended tempo.
   */
  private updatePitchShift(keyOffset: number, speed: number) {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    // Pitch deviation introduced by changing buffer playbackRate: +12 * log2(speed)
    const speedPitchDeviation = 12 * Math.log2(Math.max(0.1, speed));
    // Required pitch transposition to achieve exact keyOffset at the current speed:
    const targetSemitones = keyOffset - speedPitchDeviation;

    // If target pitch shift is negligibly close to 0 (keyOffset is 0 and speed is 1.0)
    if (Math.abs(targetSemitones) < 0.02) {
      this.cleanupPitchShifter();
      return;
    }

    try {
      Tone.setContext(ctx);
      if (!this.pitchShifter) {
        try {
          this.masterGain.disconnect();
        } catch {}

        this.pitchShifter = new Tone.PitchShift({
          pitch: targetSemitones,
          windowSize: 0.06,
          feedback: 0
        });

        Tone.connect(this.masterGain, this.pitchShifter);
        Tone.connect(this.pitchShifter, ctx.destination);
        if (this.recordingDest) {
          Tone.connect(this.pitchShifter, this.recordingDest);
        }
      } else {
        this.pitchShifter.pitch = targetSemitones;
      }
    } catch (err) {
      console.warn('[AudioEngine] PitchShift update failed, falling back to direct playback:', err);
      this.cleanupPitchShifter();
    }
  }

  private cleanupPitchShifter() {
    if (this.pitchShifter) {
      try {
        if (this.masterGain) {
          Tone.disconnect(this.masterGain);
        }
        this.pitchShifter.disconnect();
        this.pitchShifter.dispose();
      } catch {}
      this.pitchShifter = null;
    }

    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      try {
        this.masterGain.connect(this.ctx.destination);
        if (this.recordingDest) {
          this.masterGain.connect(this.recordingDest);
        }
      } catch {}
    }
  }

  /**
   * Dynamically adjusts playback speed (tempo) while strictly preserving key
   */
  public setSpeed(speed: number) {
    const clampedSpeed = Math.max(0.25, Math.min(3.0, speed));
    if (this.currentSpeed === clampedSpeed) return;

    if (this.isPlaying && this.ctx && this.activeSources.size > 0) {
      // Update track position reference before changing rate
      const currentTrackPos = this.getCurrentTrackTime() ?? this.playbackTrackStartOffset;
      this.playbackTrackStartOffset = currentTrackPos;
      this.playbackContextStartTime = this.ctx.currentTime;
      this.currentSpeed = clampedSpeed;

      // Update playback rate on all active buffer sources
      this.activeSources.forEach(source => {
        try {
          source.playbackRate.setValueAtTime(clampedSpeed, this.ctx!.currentTime);
        } catch {}
      });

      // Counteract the speed pitch shift to preserve musical key
      this.updatePitchShift(this.currentKeyOffset, this.currentSpeed);
    } else {
      this.currentSpeed = clampedSpeed;
    }
  }

  /**
   * Dynamically adjusts key offset (pitch) while strictly preserving playback speed/tempo
   */
  public setKeyOffset(keyOffset: number) {
    if (this.currentKeyOffset === keyOffset) return;
    this.currentKeyOffset = keyOffset;

    if (this.isPlaying && this.ctx && this.activeSources.size > 0) {
      // Key change does NOT touch buffer playbackRate (tempo is preserved)
      // Only updates the pitch shifter
      this.updatePitchShift(this.currentKeyOffset, this.currentSpeed);
    }
  }

  /**
   * Starts simultaneous, sample-accurate multi-stem audio playback.
   * Ensures all stem buffers are ready in memory before scheduling every source
   * to the exact same audio hardware clock time (scheduleTime).
   * Decouples speed (tempo) from key (pitch):
   * - Speed sets buffer playback rate and the pitch shifter counteracts speed pitch shift.
   * - Key sets pitch shifter transposition without altering buffer playback rate.
   */
  public async startPlayback(
    song: { id?: string; parts?: { id: string; audioUrl?: string }[]; assets?: { audioStems?: Record<string, string>; fullMixAudioUrl?: string }; audioUrl?: string; fullMixUrl?: string },
    currentTime: number,
    partMutes: Record<string, boolean> = {},
    partSolos: Record<string, boolean> = {},
    keyOffset = 0,
    speed = 1.0,
    partVolumes?: Record<string, number>
  ) {
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }

    const clampedSpeed = Math.max(0.25, Math.min(3.0, speed));

    // If already playing the same song and continuing near current position, smoothly update without restarting stems
    const currentTrackTime = this.getCurrentTrackTime();
    const isSameSongAndContinuous = (
      this.isPlaying &&
      this.currentSongId === (song.id || 'current_song') &&
      this.activeSources.size > 0 &&
      currentTrackTime !== null &&
      Math.abs(currentTime - currentTrackTime) < 0.4
    );

    if (isSameSongAndContinuous) {
      this.setSpeed(clampedSpeed);
      this.setKeyOffset(keyOffset);
      this.updateMix(partMutes, partSolos, partVolumes);
      return;
    }

    this.isPlaying = true;
    this.currentSong = song;
    this.currentSongId = song.id || 'current_song';
    this.playbackTrackStartOffset = Math.max(0, currentTime);
    this.currentSpeed = clampedSpeed;
    this.currentKeyOffset = keyOffset;
    this.currentMutes = { ...partMutes };
    this.currentSolos = { ...partSolos };
    if (partVolumes) {
      this.currentVolumes = { ...partVolumes };
    }

    // Configure pitch shifter for target key offset & speed
    this.updatePitchShift(this.currentKeyOffset, this.currentSpeed);

    // Capture unique session ID to invalidate superseded/stale asynchronous starts
    const sessionId = ++this.playbackSessionId;

    // Stop previous buffer sources
    this.stopActiveSources();

    const parts = Array.isArray(song.parts) ? song.parts : [];
    this.setupParts(parts.map(p => p.id));

    // Gather stem tasks
    const stemTasks: { partId: string; url: string }[] = [];
    parts.forEach(part => {
      const stemUrl = song.assets?.audioStems?.[part.id] || part.audioUrl;
      if (stemUrl && typeof stemUrl === 'string') {
        stemTasks.push({ partId: part.id, url: stemUrl });
      }
    });

    const fullMixUrl = song.assets?.fullMixAudioUrl || song.fullMixUrl || song.audioUrl;
    if (stemTasks.length === 0 && fullMixUrl && typeof fullMixUrl === 'string') {
      stemTasks.push({ partId: '__full_mix__', url: fullMixUrl });
    }

    // Await all required stem buffers in parallel before starting ANY audio
    const loadedStems = await Promise.all(
      stemTasks.map(async task => {
        const buffer = await this.loadAudioBuffer(task.url);
        return { partId: task.partId, buffer };
      })
    );

    // Abort if playback was stopped or a newer play/seek was requested while loading
    if (!this.isPlaying || this.playbackSessionId !== sessionId || this.currentSong !== song) {
      return;
    }

    // Clean any residual sources
    this.stopActiveSources();

    // Playback rate is regulated SOLELY by speed (tempo), independent of key
    const scheduleTime = ctx.currentTime + 0.025;
    this.playbackContextStartTime = scheduleTime;
    this.playbackTrackStartOffset = Math.max(0, currentTime);

    loadedStems.forEach(({ partId, buffer }) => {
      if (!buffer) return;

      // Apply manual sync offset if calibrated
      const syncOffset = partId === '__full_mix__' ? 0 : (this.partSyncOffsets[partId] || (song as any)?.partSyncOffsets?.[partId] || 0);

      let partScheduleTime = scheduleTime;
      let partBufferOffset = currentTime - syncOffset;

      if (partBufferOffset < 0) {
        // Track is delayed relative to playhead: starts in future
        partScheduleTime = scheduleTime + ((-partBufferOffset) / clampedSpeed);
        partBufferOffset = 0;
      }

      // Do not schedule if target offset is beyond buffer duration
      if (partBufferOffset >= buffer.duration) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.setValueAtTime(clampedSpeed, partScheduleTime);

      if (partId === '__full_mix__') {
        source.connect(this.masterGain!);
      } else {
        const gainNode = this.getOrCreatePartGain(partId);
        source.connect(gainNode);
      }

      const safeOffset = Math.max(0, Math.min(partBufferOffset, buffer.duration - 0.01));
      source.start(partScheduleTime, safeOffset);
      this.activeSources.set(partId, source);
    });

    // Apply mute, solo, and volume states to the active audio graph
    this.updateMix(partMutes, partSolos, partVolumes);
  }

  private stopActiveSources() {
    this.activeSources.forEach(source => {
      try {
        source.onended = null;
        source.stop();
        source.disconnect();
      } catch {}
    });
    this.activeSources.clear();
  }

  private getOrCreatePartGain(partId: string): GainNode {
    const ctx = this.initContext();
    let gain = this.partGains.get(partId);
    if (!gain) {
      gain = ctx.createGain();
      gain.gain.value = 0.85;

      let panner: StereoPannerNode;
      try {
        panner = ctx.createStereoPanner();
      } catch {
        panner = { pan: { value: 0 } } as unknown as StereoPannerNode;
      }

      gain.connect(panner);
      panner.connect(this.masterGain!);
      this.partGains.set(partId, gain);
      this.partPanners.set(partId, panner);
    }
    return gain;
  }

  /**
   * Dynamically adjusts volume, mute, and solo across all stems in real-time
   */
  public updateMix(
    partMutes: Record<string, boolean> = {},
    partSolos: Record<string, boolean> = {},
    partVolumes?: Record<string, number>
  ) {
    this.currentMutes = { ...partMutes };
    this.currentSolos = { ...partSolos };
    if (partVolumes) {
      this.currentVolumes = { ...this.currentVolumes, ...partVolumes };
    }

    const hasAnySolo = Object.values(this.currentSolos).some(Boolean);
    const now = this.ctx ? this.ctx.currentTime : 0;

    this.partGains.forEach((gainNode, partId) => {
      const isMuted = Boolean(this.currentMutes[partId]);
      const isSolo = Boolean(this.currentSolos[partId]);
      const shouldMute = isMuted || (hasAnySolo && !isSolo);

      let targetGain = shouldMute ? 0 : 0.85;
      if (typeof this.currentVolumes[partId] === 'number') {
        targetGain = shouldMute ? 0 : this.currentVolumes[partId];
      }

      if (this.ctx) {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setTargetAtTime(targetGain, now, 0.015);
      } else {
        gainNode.gain.value = targetGain;
      }
    });
  }

  public stopPlayback() {
    this.isPlaying = false;
    this.playbackSessionId++;
    this.stopActiveSources();
    this.cleanupPitchShifter();
  }

  public setupParts(partIds: string[]) {
    const key = partIds.join(',');
    if (this.lastPartIdsKey === key && this.partGains.size === partIds.length) {
      return;
    }
    this.lastPartIdsKey = key;

    const ctx = this.initContext();
    if (!this.masterGain) return;

    partIds.forEach((id, idx) => {
      if (!this.partGains.has(id)) {
        const gain = ctx.createGain();
        gain.gain.value = 0.85;
        
        let panner: StereoPannerNode;
        try {
          panner = ctx.createStereoPanner();
        } catch {
          panner = { pan: { value: 0 } } as unknown as StereoPannerNode;
        }

        const defaultPans = [-0.35, -0.1, 0.1, 0.35];
        if (panner.pan) {
          panner.pan.value = defaultPans[idx % defaultPans.length] || 0;
        }

        gain.connect(panner);
        panner.connect(this.masterGain!);

        this.partGains.set(id, gain);
        this.partPanners.set(id, panner);
      }
    });
  }

  /**
   * Applies complete mixer faders, dominant stereo panning, and solo/mute states
   */
  public applyMixState(
    selectedPartId: string,
    dominantEnabled: boolean,
    partStates: Record<string, { isMuted: boolean; isSolo: boolean; volume?: number; pan?: number }>
  ) {
    const muteMap: Record<string, boolean> = {};
    const soloMap: Record<string, boolean> = {};
    const volMap: Record<string, number> = {};

    Object.entries(partStates).forEach(([id, st]) => {
      muteMap[id] = st.isMuted;
      soloMap[id] = st.isSolo;
      if (typeof st.volume === 'number') {
        volMap[id] = st.volume;
      }
    });

    this.updateMix(muteMap, soloMap, volMap);

    const now = this.ctx ? this.ctx.currentTime : 0;
    this.partPanners.forEach((panner, partId) => {
      if (!panner || !panner.pan || !this.ctx) return;
      const isSelected = partId === selectedPartId;

      let targetPan = 0;
      if (dominantEnabled) {
        // Dominant mode: target voice panned hard Left, accompaniment panned hard Right
        targetPan = isSelected ? -0.95 : 0.95;
      } else if (typeof partStates[partId]?.pan === 'number') {
        targetPan = partStates[partId].pan!;
      } else {
        const defaultPans: Record<string, number> = {
          tenor: -0.35,
          lead: -0.1,
          baritone: 0.1,
          bass: 0.35
        };
        targetPan = defaultPans[partId.toLowerCase()] ?? 0;
      }

      panner.pan.cancelScheduledValues(now);
      panner.pan.setTargetAtTime(targetPan, now, 0.02);
    });
  }

  // Strictly no-op: synthesis is completely eliminated; all playback uses recorded audio stems.
  public playSynthesizedNotes(_notes: { partId: string; midi: number; duration: number }[], _keyOffset = 0, _speed = 1.0) {
    this.stopSynthesizedNotes();
  }

  public stopSynthesizedNotes() {
    this.stopActiveSources();
  }

  // Pitch pipe tone preview (Blow / sustain key tonic)
  public startPitchPipeTone(keyName: string, keyOffset = 0) {
    const ctx = this.initContext();
    this.stopPitchPipeTone();

    // Map base key to appropriate tonic MIDI
    const baseMidiMap: Record<string, number> = {
      'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
      'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
      'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
    };

    const cleanKey = keyName.replace(/m|maj|min|7/gi, '').trim();
    const baseMidi = baseMidiMap[cleanKey] || 63; // Eb default
    const freq = midiToFrequency(baseMidi, keyOffset);
    const now = ctx.currentTime;

    // Rich Reed / Brass pitch pipe acoustic profile:
    // Fundamental + 2nd & 3rd harmonics + warm resonant filter
    const osc1 = ctx.createOscillator(); // Fundamental
    const osc2 = ctx.createOscillator(); // 2nd harmonic
    const osc3 = ctx.createOscillator(); // 3rd harmonic
    const pipeGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc3.type = 'sine';

    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);
    osc3.frequency.setValueAtTime(freq * 3, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2.8, now);
    filter.Q.value = 4.0; // resonant pipe chime

    pipeGain.gain.setValueAtTime(0.001, now);
    pipeGain.gain.exponentialRampToValueAtTime(0.5, now + 0.05);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(pipeGain);
    pipeGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    this.pitchPipeNode = {
      oscs: [osc1, osc2, osc3],
      gain: pipeGain
    };
  }

  public stopPitchPipeTone() {
    if (this.pitchPipeNode && this.ctx) {
      const { oscs, gain } = this.pitchPipeNode;
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      setTimeout(() => {
        oscs.forEach(o => {
          try {
            o.stop();
            o.disconnect();
          } catch {}
        });
        gain.disconnect();
      }, 150);
      this.pitchPipeNode = null;
    }
  }

  // Real-time Pitch Detection (Autocorrelation) for Coach mode
  public async startPitchDetection(
    callback: (pitch: { freq: number; midi: number; noteName: string; cents: number; clarity: number } | null) => void
  ) {
    this.stopPitchDetection();
    const ctx = this.initContext();
    this.onPitchDetectedCallback = callback;
    
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micSource = ctx.createMediaStreamSource(this.micStream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.micSource.connect(this.analyser);

      this.isDetectingPitch = true;
      const buffer = new Float32Array(this.analyser.fftSize);
      let lastDetectTime = 0;

      const detectLoop = (nowTime: number) => {
        if (!this.isDetectingPitch || !this.analyser) return;

        // Throttle to 15 fps (~66ms) to keep CPU usage negligible
        if (nowTime - lastDetectTime >= 66) {
          lastDetectTime = nowTime;
          this.analyser.getFloatTimeDomainData(buffer);
          const pitchData = this.autoCorrelate(buffer, ctx.sampleRate);

          if (pitchData && pitchData.freq > 50 && pitchData.freq < 1500) {
            const rawMidi = frequencyToMidi(pitchData.freq);
            const roundMidi = Math.round(rawMidi);
            const cents = (rawMidi - roundMidi) * 100;
            const noteName = MIDI_TO_NAME[roundMidi] || 'A4';

            this.onPitchDetectedCallback?.({
              freq: pitchData.freq,
              midi: roundMidi,
              noteName,
              cents,
              clarity: pitchData.clarity
            });
          } else {
            this.onPitchDetectedCallback?.(null);
          }
        }

        this.detectionAnimFrame = requestAnimationFrame(detectLoop);
      };

      this.detectionAnimFrame = requestAnimationFrame(detectLoop);
    } catch (err) {
      console.warn('Microphone permission denied or unavailable for pitch detection:', err);
    }
  }

  public stopPitchDetection() {
    this.isDetectingPitch = false;
    if (this.detectionAnimFrame) {
      cancelAnimationFrame(this.detectionAnimFrame);
      this.detectionAnimFrame = null;
    }
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(t => t.stop());
      } catch {}
      this.micStream = null;
    }
    if (this.micSource) {
      try { this.micSource.disconnect(); } catch {}
      this.micSource = null;
    }
    this.analyser = null;
    this.onPitchDetectedCallback = null;
  }

  private autoCorrelate(buf: Float32Array, sampleRate: number): { freq: number; clarity: number } | null {
    let sumSquares = 0;
    const len = buf.length;
    for (let i = 0; i < len; i++) {
      sumSquares += buf[i] * buf[i];
    }
    const rms = Math.sqrt(sumSquares / len);
    if (rms < 0.015) return null; // Signal too quiet

    // Bounded search for vocal frequencies (65 Hz to 1100 Hz)
    const minPeriod = Math.max(10, Math.floor(sampleRate / 1100));
    const maxPeriod = Math.min(len - 2, Math.floor(sampleRate / 65));

    let maxCorrelation = -1;
    let bestPeriod = -1;

    // Coarse pass: step by 3 for extreme speed and low CPU
    for (let period = minPeriod; period <= maxPeriod; period += 3) {
      let correlation = 0;
      const maxI = len - period;
      for (let i = 0; i < maxI; i += 4) {
        correlation += buf[i] * buf[i + period];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }

    if (bestPeriod <= 0 || maxCorrelation <= 0) return null;

    // Fine pass: refine within ±3 of best period
    const fineStart = Math.max(minPeriod, bestPeriod - 3);
    const fineEnd = Math.min(maxPeriod, bestPeriod + 3);
    let fineMax = -1;
    let fineBest = bestPeriod;

    for (let p = fineStart; p <= fineEnd; p++) {
      let c = 0;
      const maxI = len - p;
      for (let i = 0; i < maxI; i += 2) {
        c += buf[i] * buf[i + p];
      }
      if (c > fineMax) {
        fineMax = c;
        fineBest = p;
      }
    }

    const freq = sampleRate / fineBest;
    const clarity = Math.min(1.0, (fineMax * 2) / (sumSquares + 0.0001));
    return { freq, clarity };
  }

  // Performance Audio Recording
  public async startPerformanceRecording() {
    const ctx = this.initContext();
    this.recordedChunks = [];

    this.recordingDest = ctx.createMediaStreamDestination();
    if (this.pitchShifter) {
      Tone.connect(this.pitchShifter, this.recordingDest);
    } else {
      this.masterGain?.connect(this.recordingDest);
    }

    // Mix in user's microphone
    let micStreamForRecord: MediaStream | null = null;
    try {
      micStreamForRecord = await navigator.mediaDevices.getUserMedia({ audio: true });
      const micSource = ctx.createMediaStreamSource(micStreamForRecord);
      const micGain = ctx.createGain();
      micGain.gain.value = 1.1;
      micSource.connect(micGain);
      micGain.connect(this.recordingDest);
    } catch {
      // Record backing tracks only if mic denied
    }

    this.mediaRecorder = new MediaRecorder(this.recordingDest.stream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };
    this.mediaRecorder.start(100);
  }

  public async stopPerformanceRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedChunks = [];
        this.mediaRecorder = null;
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch {
        resolve(null);
      }
    });
  }
}

export const vocalEngine = new VocalAudioEngine();
