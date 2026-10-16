/**
 * KisanSaathi Audio & Sound Utilities
 * Provides resilient Web Audio chimes and SpeechSynthesis voice matching.
 */

// Play an instant audible feedback chime using browser's Web Audio API
export function playChime(type: "start" | "stop" | "success" = "start") {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "start") {
      // Warm agricultural 2-tone chime (523Hz C5 -> 659Hz E5)
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "stop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Success tri-tone
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.warn("Web Audio chime error:", e);
  }
}

// Find the best available TTS voice across platforms (Windows, Android, iOS)
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLang: "mr" | "hi" | "en"
): { voice: SpeechSynthesisVoice | null; langTag: string } {
  if (!voices || voices.length === 0) {
    return {
      voice: null,
      langTag: targetLang === "mr" ? "mr-IN" : targetLang === "hi" ? "hi-IN" : "en-IN",
    };
  }

  // 1. Direct match for target language
  if (targetLang === "mr") {
    const mrVoice = voices.find((v) => v.lang.startsWith("mr") || v.name.toLowerCase().includes("marathi"));
    if (mrVoice) return { voice: mrVoice, langTag: mrVoice.lang };

    // Fallback: Hindi voice can read Devanagari script phonetically!
    const hiVoice = voices.find((v) => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi"));
    if (hiVoice) return { voice: hiVoice, langTag: "hi-IN" };
  } else if (targetLang === "hi") {
    const hiVoice = voices.find((v) => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi"));
    if (hiVoice) return { voice: hiVoice, langTag: hiVoice.lang };
  }

  // 2. Indian English voice (e.g. Google Indian English or Microsoft Ravi/Heera)
  const inVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en_IN"));
  if (inVoice) return { voice: inVoice, langTag: inVoice.lang };

  // 3. Any English voice
  const enVoice = voices.find((v) => v.lang.startsWith("en"));
  if (enVoice) return { voice: enVoice, langTag: enVoice.lang };

  // 4. Default system voice
  const defaultVoice = voices.find((v) => v.default) || voices[0];
  return {
    voice: defaultVoice || null,
    langTag: defaultVoice ? defaultVoice.lang : "en-US",
  };
}

// Speak text using SpeechSynthesis with smart language and platform fallback
export function speakWithFallback(text: string, lang: string = "mr") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();

    // 60ms delay prevents Chromium race condition where immediate .speak() gets cancelled
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = (lang === "mr" ? "mr" : lang === "hi" ? "hi" : "en") as "mr" | "hi" | "en";
      const voices = window.speechSynthesis.getVoices();
      const match = findBestVoice(voices, targetLang);

      if (match.voice) {
        utterance.voice = match.voice;
      }
      utterance.lang = match.langTag;
      utterance.rate = 0.95; // Slightly slower, clearer tempo for rural farmers

      window.speechSynthesis.speak(utterance);
    }, 60);
  } catch (e) {
    console.warn("SpeechSynthesis error:", e);
  }
}

