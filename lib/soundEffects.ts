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
 * Speaks countdown number ("3, 2, 1") using female voice + audio tone
 */
export function speakCountdownNumber(num: number, enabled: boolean = true) {
  if (!enabled) return;

  // 1. Play audio tick beep tone
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(num === 1 ? 920 : 680, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    // Ignore synth error
  }

  // 2. Female Voice Speech Synthesis
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const numText = num === 3 ? "Tiga" : num === 2 ? "Dua" : "Satu";
      const utterance = new SpeechSynthesisUtterance(numText);
      utterance.lang = "id-ID";
      utterance.rate = 1.15;
      utterance.pitch = 1.25; // female voice pitch

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          (v.lang.startsWith("id") || v.lang.startsWith("en")) &&
          (v.name.includes("Female") ||
            v.name.includes("Google") ||
            v.name.includes("Gadis") ||
            v.name.includes("Damayanti") ||
            v.name.includes("Zira") ||
            v.name.includes("Samantha"))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Speech synthesis fallback
    }
  }
}
