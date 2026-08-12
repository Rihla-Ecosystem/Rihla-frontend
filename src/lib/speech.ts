'use client';

/**
 * Shared text-to-speech for the app, tuned for the emergency experience.
 *
 * Strategy (most reliable first):
 *  1. Web Speech API (speechSynthesis) — works offline, no CORS, instant.
 *  2. Google Translate TTS audio — higher quality when online; the old
 *     `translate_tts` endpoint is used only as an enhancement because it can
 *     be flaky.
 *
 * The `speak()` callbacks mirror the audio/utterance lifecycle so callers can
 * show live speaking state without caring which engine is playing.
 */

let currentController: { cancel: () => void } | null = null;

export type SpeakOptions = {
  lang?: 'auto' | 'ar' | 'en';
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export function detectLang(text: string): 'ar' | 'en' {
  return isArabic(text) ? 'ar' : 'en';
}

/** Stop whatever is currently being spoken. Safe to call anytime. */
export function stopSpeaking(): void {
  if (currentController) {
    currentController.cancel();
    currentController = null;
  }
}

/** List the speechSynthesis voices that can actually read a given language. */
function voicesFor(lang: 'ar' | 'en', synth: SpeechSynthesis): SpeechSynthesisVoice[] {
  const voices = synth.getVoices();
  const prefix = lang === 'ar' ? 'ar' : 'en';
  const matching = voices.filter((v) => (v.lang || '').toLowerCase().startsWith(prefix));
  return matching;
}

function pickVoice(lang: 'ar' | 'en', synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const candidates = voicesFor(lang, synth);
  if (candidates.length === 0) return null;
  // Prefer a region-exact voice (ar-EG / en-US), then any regional, then first.
  const regionExact =
    lang === 'ar'
      ? candidates.find((v) => (v.lang || '').toLowerCase().startsWith('ar-eg'))
      : candidates.find((v) => (v.lang || '').toLowerCase().startsWith('en-us'));
  return regionExact ?? candidates[0];
}

/** Speak via the Web Speech API. Returns a cancel handle. */
function speakViaSynthesis(
  text: string,
  lang: 'ar' | 'en',
  opts: Required<Pick<SpeakOptions, 'rate' | 'onStart' | 'onEnd' | 'onError'>>,
): { cancel: () => void } {
  const synth = window.speechSynthesis;
  let cancelled = false;
  let finished = false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
  utterance.rate = opts.rate;

  const applyVoice = () => {
    const voice = pickVoice(lang, synth);
    if (voice) utterance.voice = voice;
  };
  applyVoice();

  const finish = (ok: boolean) => {
    if (finished) return;
    finished = true;
    if (cancelled) return;
    if (ok) opts.onEnd();
    else opts.onError();
  };

  utterance.onstart = () => {
    if (!cancelled) opts.onStart();
  };
  utterance.onend = () => finish(true);
  utterance.onerror = (e) => {
    // Chrome fires an error for some voices when cancelled — treat as silent.
    if (e?.error === 'canceled' || e?.error === 'interrupted') return;
    finish(false);
  };

  // Some engines load voices asynchronously; pick again once they arrive.
  if (synth.getVoices().length === 0) {
    const onVoices = () => {
      applyVoice();
      window.removeEventListener('voiceschanged', onVoices);
    };
    window.addEventListener('voiceschanged', onVoices);
  }

  synth.speak(utterance);

  return {
    cancel: () => {
      cancelled = true;
      synth.cancel();
    },
  };
}

/**
 * Speak via the Google Translate TTS endpoint (better audio quality when the
 * network is available). Returns a cancel handle.
 */
function speakViaGoogle(text: string, lang: 'ar' | 'en', opts: {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}): { cancel: () => void } {
  let cancelled = false;
  let finished = false;
  const audio = new Audio(
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`
  );

  const finish = (ok: boolean) => {
    if (finished) return;
    finished = true;
    if (cancelled) return;
    if (ok) opts.onEnd?.();
    else opts.onError?.();
  };

  audio.onplaying = () => {
    if (!cancelled) opts.onStart?.();
  };
  audio.onended = () => finish(true);
  audio.onerror = () => finish(false);

  audio.play().catch(() => finish(false));

  return {
    cancel: () => {
      cancelled = true;
      audio.pause();
      audio.src = '';
    },
  };
}

/**
 * Speak `text`. The engine choice is automatic: the Web Speech API is used
 * first (works offline), and Google TTS is used as a fallback when the browser
 * has no usable voice for the language or speech synthesis errors out.
 *
 * Returns a cancel handle; calling it stops the audio. Only one utterance
 * plays at a time — starting a new one cancels the previous.
 */
export function speak(text: string, options: SpeakOptions = {}): { cancel: () => void } {
  stopSpeaking();

  const trimmed = (text || '').trim();
  if (typeof window === 'undefined' || !trimmed) {
    return { cancel: () => {} };
  }

  const lang = options.lang === 'auto' || !options.lang ? detectLang(trimmed) : options.lang;
  const rate = options.rate ?? (lang === 'ar' ? 0.95 : 1.02);

  const callbacks = {
    onStart: options.onStart ?? (() => {}),
    onEnd: options.onEnd ?? (() => {}),
    onError: options.onError ?? (() => {}),
  };

  let controller: { cancel: () => void };

  if (!('speechSynthesis' in window) || !window.speechSynthesis) {
    controller = speakViaGoogle(trimmed, lang, callbacks);
  } else {
    // Always use the Web Speech API when available. Voices load asynchronously,
    // so a synchronous `getVoices()` check at call time is unreliable (empty on
    // first click in Chrome) and would wrongly send us to the now-blocked
    // Google Translate TTS endpoint (ERR_BLOCKED_BY_ORB). speakViaSynthesis
    // picks a voice lazily via the 'voiceschanged' listener.
    controller = speakViaSynthesis(trimmed, lang, { rate, ...callbacks });
  }

  currentController = controller;
  return controller;
}
