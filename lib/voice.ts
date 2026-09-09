"use client";

/**
 * lib/voice.ts
 * Cross-Platform Web Speech API wrapper for Indonesian AI voice narration.
 * Engineered for iOS Safari, macOS Safari (Damayanti/Siri), Android Chrome (Google TTS),
 * and Windows/Edge (Microsoft Natural).
 */

let synth: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let isUnlocked = false;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

function getSynth(): SpeechSynthesis | null {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    if (!synth) {
      synth = window.speechSynthesis;
      initVoices();
    }
    return synth;
  }
  return null;
}

function initVoices(): void {
  if (!synth) return;
  cachedVoices = synth.getVoices() || [];
  if (typeof synth.onvoiceschanged !== "undefined") {
    synth.onvoiceschanged = () => {
      if (synth) {
        cachedVoices = synth.getVoices() || [];
      }
    };
  }
}

/**
 * Unlock Web Speech API on user gesture (required for iOS Safari & Android Chrome autoplay policies).
 */
export function unlockVoiceEngine(): void {
  if (isUnlocked) return;
  const s = getSynth();
  if (!s) return;

  try {
    const dummy = new SpeechSynthesisUtterance(" ");
    dummy.volume = 0.01;
    dummy.rate = 10;
    dummy.onend = () => {
      isUnlocked = true;
    };
    dummy.onerror = () => {
      isUnlocked = true;
    };
    s.speak(dummy);
    isUnlocked = true;
  } catch {
    isUnlocked = true;
  }
}

// Auto-register touch/click unlock for iOS Safari and mobile browsers on first interaction
if (typeof window !== "undefined") {
  const handleFirstInteraction = () => {
    unlockVoiceEngine();
    window.removeEventListener("touchstart", handleFirstInteraction);
    window.removeEventListener("click", handleFirstInteraction);
  };
  window.addEventListener("touchstart", handleFirstInteraction, { once: true, passive: true });
  window.addEventListener("click", handleFirstInteraction, { once: true, passive: true });
}

/**
 * Find the highest fidelity Indonesian voice available across all OS & browsers:
 * 1. Apple Damayanti / Siri (macOS Safari & iOS Safari)
 * 2. Microsoft Natural (Edge / Windows 11)
 * 3. Google Bahasa Indonesia (Android Chrome / Desktop Chrome)
 * 4. Exact id-ID / id_ID locale voices
 * 5. Generic id prefix / Indonesian keyword
 */
export function getBestIndonesianVoice(): SpeechSynthesisVoice | null {
  const s = getSynth();
  if (!s) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : s.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Apple Damayanti / Siri (iOS Safari, macOS Safari)
  const appleVoice = voices.find(
    (v) =>
      v.name.toLowerCase().includes("damayanti") ||
      (v.name.toLowerCase().includes("siri") && v.lang.toLowerCase().startsWith("id"))
  );
  if (appleVoice) return appleVoice;

  // 2. Microsoft Natural Online Voice (Windows Edge)
  const msNatural = voices.find(
    (v) =>
      v.name.toLowerCase().includes("natural") &&
      (v.lang.toLowerCase().startsWith("id") || v.name.toLowerCase().includes("indonesia"))
  );
  if (msNatural) return msNatural;

  // 3. Google Bahasa Indonesia (Android Chrome / Desktop Chrome)
  const googleIndo = voices.find(
    (v) =>
      (v.lang.toLowerCase().startsWith("id") || v.name.toLowerCase().includes("indonesia")) &&
      v.name.toLowerCase().includes("google")
  );
  if (googleIndo) return googleIndo;

  // 4. Exact id-ID or id_ID locale tag
  const exactLocale = voices.find((v) => {
    const norm = v.lang.replace("_", "-").toLowerCase();
    return norm === "id-id";
  });
  if (exactLocale) return exactLocale;

  // 5. Any voice with Indonesian language code or label
  const anyIndo = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith("id") ||
      v.name.toLowerCase().includes("indonesia")
  );
  if (anyIndo) return anyIndo;

  return null;
}

/**
 * Keepalive interval for Chromium speech synthesis bug (freezing after 15s)
 */
function startKeepAlive(): void {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    const s = getSynth();
    if (!s) return;
    if (s.speaking) {
      s.pause();
      s.resume();
    } else {
      stopKeepAlive();
    }
  }, 10000);
}

function stopKeepAlive(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/**
 * Speak text in natural Indonesian with cross-platform resilience.
 */
export function speakIndonesian(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
): void {
  const s = getSynth();
  if (!s) return;

  // Ensure speech synthesis is not frozen in paused state (Android Chrome fix)
  if (s.paused) {
    try {
      s.resume();
    } catch {
      // ignore
    }
  }

  // Stop previous speech cleanly
  stopSpeaking();

  const { rate = 1.0, pitch = 1.02, onStart, onEnd } = options;

  // Clean text from Markdown or special symbols for natural pronunciation
  const cleanedText = text
    .replace(/[#*_`~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) return;

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = "id-ID";
  utterance.rate = rate;
  utterance.pitch = pitch;

  const bestVoice = getBestIndonesianVoice();
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.onstart = () => {
    startKeepAlive();
    onStart?.();
  };

  utterance.onend = () => {
    stopKeepAlive();
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    stopKeepAlive();
    currentUtterance = null;
    if (e.error !== "canceled" && e.error !== "interrupted") {
      console.warn("SpeechSynthesis error:", e.error);
    }
  };

  currentUtterance = utterance;

  // Small timeout helps Safari & Chrome process queue smoothly
  setTimeout(() => {
    try {
      s.speak(utterance);
    } catch (err) {
      console.warn("SpeechSynthesis speak error:", err);
    }
  }, 30);
}

/**
 * Stop any ongoing speech narration immediately.
 */
export function stopSpeaking(): void {
  stopKeepAlive();
  const s = getSynth();
  if (s) {
    try {
      s.cancel();
    } catch {
      // ignore
    }
  }
  currentUtterance = null;
}
