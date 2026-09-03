/**
 * lib/soundEffects.ts
 *
 * Professional Camera Shutter & Voice Audio System
 * Fully optimized for Safari iOS (iPhone 17 Pro Max), macOS Safari/Chrome, and Android.
 */

let audioCtx: AudioContext | null = null;

/**
 * Explicitly unlocks Web Audio API and Speech Synthesis on Safari (iOS / macOS).
 * Must be called on user gesture (e.g., button click / touch start).
 */
export function unlockAudio() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx && !audioCtx) {
      audioCtx = new AudioCtx();
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    // Warm-up SpeechSynthesis for Safari iOS
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const silentUtterance = new SpeechSynthesisUtterance("");
      silentUtterance.volume = 0;
      window.speechSynthesis.speak(silentUtterance);
    }
  } catch (err) {
    // Ignore unlock errors
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a crisp, ultra-realistic dual-stage DSLR camera shutter sound ("CEK-REK!")
 */
export function playShutterSound(enabled: boolean = true) {
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // ── STAGE 1: Front Curtain Snap ("CEK!") ──────────────────────────────────
    const snapLen = Math.floor(ctx.sampleRate * 0.04); // 40ms
    const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
    const snapData = snapBuf.getChannelData(0);
    for (let i = 0; i < snapLen; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.2));
    }

    const snapSource = ctx.createBufferSource();
    snapSource.buffer = snapBuf;

    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = "highpass";
    snapFilter.frequency.value = 1800;

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.9, t);
    snapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    snapSource.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapSource.start(t);

    // Mechanical Pop (Mirror Lift)
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = "sine";
    popOsc.frequency.setValueAtTime(750, t);
    popOsc.frequency.exponentialRampToValueAtTime(150, t + 0.035);

    popGain.gain.setValueAtTime(0.6, t);
    popGain.gain.exponentialRampToValueAtTime(0.01, t + 0.035);

    popOsc.connect(popGain);
    popGain.connect(ctx.destination);
    popOsc.start(t);
    popOsc.stop(t + 0.035);

    // ── STAGE 2: Rear Curtain Release ("REK!") ──────────────────────────────
    const relTime = t + 0.055; // 55ms after initial snap
    const relLen = Math.floor(ctx.sampleRate * 0.06);
    const relBuf = ctx.createBuffer(1, relLen, ctx.sampleRate);
    const relData = relBuf.getChannelData(0);
    for (let i = 0; i < relLen; i++) {
      relData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (relLen * 0.25));
    }

    const relSource = ctx.createBufferSource();
    relSource.buffer = relBuf;

    const relFilter = ctx.createBiquadFilter();
    relFilter.type = "bandpass";
    relFilter.frequency.value = 1400;
    relFilter.Q.value = 1.5;

    const relGain = ctx.createGain();
    relGain.gain.setValueAtTime(0.85, relTime);
    relGain.gain.exponentialRampToValueAtTime(0.01, relTime + 0.06);

    relSource.connect(relFilter);
    relFilter.connect(relGain);
    relGain.connect(ctx.destination);
    relSource.start(relTime);

    // Low Thump (Mirror return)
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = "triangle";
    thumpOsc.frequency.setValueAtTime(280, relTime);
    thumpOsc.frequency.exponentialRampToValueAtTime(60, relTime + 0.05);

    thumpGain.gain.setValueAtTime(0.5, relTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, relTime + 0.05);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thumpOsc.start(relTime);
    thumpOsc.stop(relTime + 0.05);
  } catch (err) {
    // Audio Fallback
  }
}

/**
 * Plays countdown sound using pure AudioContext tones.
 * Supports all timer values 1–10. No SpeechSynthesis (unreliable on tablets).
 * - Final second (1): bright high-pitched double beep
 * - Last 3 seconds (2-3): medium-high beep
 * - Earlier seconds (4+): soft medium beep
 */
export function speakCountdownNumber(num: number, enabled: boolean = true) {
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone parameters based on number
    const isFinal = num === 1;
    const isNearEnd = num <= 3;
    const freq = isFinal ? 1050 : isNearEnd ? 820 : 660;
    const gain = isFinal ? 0.5 : 0.38;
    const duration = isFinal ? 0.18 : 0.13;

    const playTone = (startTime: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      // Slight frequency drop for natural feel
      osc.frequency.exponentialRampToValueAtTime(freq * 0.92, startTime + duration);

      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(gain, startTime + 0.012); // fast attack
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    };

    // Final second → double beep (bip-bip!)
    if (isFinal) {
      playTone(now);
      playTone(now + 0.22);
    } else {
      playTone(now);
    }
  } catch (err) {
    // Ignore audio error
  }
}

/**
 * Plays an instant melodic chime when a hand gesture is recognized.
 */
export function playGestureTriggerSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Dual-tone high chime (880Hz then 1320Hz)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    g1.gain.setValueAtTime(0.3, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.07);
    g2.gain.setValueAtTime(0.35, now + 0.07);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.22);
  } catch {
    // Ignore audio error
  }
}

