/**
 * Procedural sound: every effect is synthesized with Web Audio, so nothing is downloaded.
 * Browsers only allow audio after a click or key press, so `unlock()` must run inside one.
 * One instance per page (Vite shares this module between islands).
 */

type Listener = (on: boolean) => void;
export type Sfx = 'switch' | 'key' | 'enter' | 'click' | 'thock';

const PREF_KEY = 'sound';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private amb: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private drops = 0;
  private plucks = new Map<number, AudioBuffer>();
  private listeners = new Set<Listener>();
  private ambLevel = 0;
  on = false;

  /** What the visitor chose last time (null = never chose). */
  get pref(): boolean | null {
    if (typeof localStorage === 'undefined') return null;
    const v = localStorage.getItem(PREF_KEY);
    return v === null ? null : v === 'on';
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  /** Must be called from a user gesture. */
  async setOn(on: boolean) {
    this.on = on;
    localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
    if (on) {
      this.init();
      await this.ctx!.resume();
    }
    if (this.ctx && this.master) this.ramp(this.master.gain, on ? 1 : 0, 0.25);
    this.listeners.forEach((l) => l(on));
  }

  /** Room ambience (rain, PC hum). 0 = silent. Kept even while muted so toggling restores it. */
  ambience(level: number, seconds = 1.2) {
    this.ambLevel = level;
    if (!this.ctx || !this.amb) return;
    this.ramp(this.amb.gain, level, seconds);
    if (level > 0 && !this.drops) this.startDrops();
  }

  play(name: Sfx) {
    const ctx = this.ctx;
    if (!ctx || !this.on || !this.master) return;
    const t = ctx.currentTime;
    switch (name) {
      case 'switch':
        this.tick(t, 1900, 0.5, 0.018);
        this.tick(t + 0.07, 1400, 0.3, 0.025);
        this.thump(t, 140, 0.25, 0.04);
        break;
      case 'key':
        this.tick(t, 2600 + Math.random() * 1600, 0.16, 0.022);
        this.thump(t, 110 + Math.random() * 40, 0.14, 0.035);
        break;
      case 'enter':
        this.tick(t, 2000, 0.24, 0.03);
        this.thump(t, 85, 0.3, 0.06);
        break;
      case 'click':
        this.tick(t, 4200, 0.2, 0.012);
        this.tick(t + 0.045, 3600, 0.12, 0.012);
        break;
      case 'thock':
        this.tick(t, 1500, 0.3, 0.04);
        this.thump(t, 70, 0.45, 0.09);
        break;
    }
  }

  /** Plucked string (Karplus-Strong), e.g. hovering the guitar. */
  pluck(freq: number, gain = 0.35) {
    const ctx = this.ctx;
    if (!ctx || !this.on || !this.master) return;
    let buf = this.plucks.get(freq);
    if (!buf) {
      buf = karplus(ctx.sampleRate, freq, 2.4);
      this.plucks.set(freq, buf);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(this.master);
    src.start();
  }

  // ---------------------------------------------------------------- internals

  private init() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    // 4 s of white noise, reused by every noisy sound
    const len = ctx.sampleRate * 4;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    this.amb = ctx.createGain();
    this.amb.gain.value = 0;
    this.amb.connect(this.master);

    // rain: broadband hiss, plus a low rumble on the roof/window
    this.loopNoise('highpass', 700, 0.05, this.amb, 'lowpass', 7000);
    this.loopNoise('lowpass', 380, 0.12, this.amb);
    // PC: mains hum and a soft fan
    for (const [f, v] of [[60, 0.012], [120, 0.006]] as const) {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = v;
      o.connect(g).connect(this.amb);
      o.start();
    }
    this.loopNoise('bandpass', 260, 0.035, this.amb);

    if (this.ambLevel > 0) this.ambience(this.ambLevel);
  }

  private loopNoise(type: BiquadFilterType, freq: number, gain: number, out: AudioNode, type2?: BiquadFilterType, freq2?: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.loopStart = Math.random() * 2;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    let node: AudioNode = src.connect(f);
    if (type2) {
      const f2 = ctx.createBiquadFilter();
      f2.type = type2;
      f2.frequency.value = freq2!;
      node = node.connect(f2);
    }
    const g = ctx.createGain();
    g.gain.value = gain;
    node.connect(g).connect(out);
    src.start(0, src.loopStart);
  }

  /** Random droplets hitting the window while the ambience is audible. */
  private startDrops() {
    const loop = () => {
      const ctx = this.ctx;
      if (!ctx || this.ambLevel <= 0) {
        this.drops = 0;
        return;
      }
      if (this.on) {
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        o.frequency.setValueAtTime(2200 + Math.random() * 2600, t);
        o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.012 * this.ambLevel * Math.random(), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        o.connect(g).connect(this.amb!);
        o.start(t);
        o.stop(t + 0.05);
      }
      this.drops = window.setTimeout(loop, 40 + Math.random() * 180);
    };
    this.drops = window.setTimeout(loop, 100);
  }

  /** Short filtered noise burst: the "click" part of a switch or key. */
  private tick(t: number, freq: number, gain: number, dur: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t, Math.random() * 3);
    src.stop(t + dur + 0.01);
  }

  /** Low sine drop: the body ("thock") of a key or switch. */
  private thump(t: number, freq: number, gain: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(freq * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + dur * 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.01);
  }

  private ramp(p: AudioParam, v: number, s: number) {
    const t = this.ctx!.currentTime;
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
    p.linearRampToValueAtTime(v, t + s);
  }
}

function karplus(rate: number, freq: number, seconds: number) {
  const n = Math.floor(rate * seconds);
  const period = Math.round(rate / freq);
  const out = new Float32Array(n);
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const next = (idx + 1) % period;
    const v = (ring[idx] + ring[next]) * 0.4985; // averaging = string damping
    out[i] = ring[idx];
    ring[idx] = v;
    idx = next;
  }
  const buf = new AudioBuffer({ length: n, sampleRate: rate });
  buf.copyToChannel(out, 0);
  return buf;
}

export const sound = new SoundEngine();
