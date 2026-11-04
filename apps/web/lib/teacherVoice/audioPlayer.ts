import { TEACHER_VOICE_CONFIG } from "./config";
import type { TeacherAudioPlayer, TeacherMessage } from "./types";

const FADE_MS = 120;
const FADE_STEPS = 4;

function fade(audio: HTMLAudioElement, from: number, to: number, onDone?: () => void) {
  const stepMs = FADE_MS / FADE_STEPS;
  let step = 0;
  const timer = window.setInterval(() => {
    step += 1;
    const next = from + ((to - from) * step) / FADE_STEPS;
    audio.volume = Math.max(0, Math.min(1, next));
    if (step >= FADE_STEPS) {
      window.clearInterval(timer);
      onDone?.();
    }
  }, stepMs);
  return timer;
}

export function createTeacherAudioPlayer(): TeacherAudioPlayer {
  let generation = 0;
  let audio: HTMLAudioElement | null = null;
  let fadeTimer: number | null = null;

  const stop = () => {
    generation += 1;
    if (fadeTimer !== null) {
      window.clearInterval(fadeTimer);
      fadeTimer = null;
    }
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const play = async (message: TeacherMessage, volume: number) => {
    stop();
    const currentGeneration = generation;
    const safeVolume = Math.max(0, Math.min(1, volume));

    if (message.audio) {
      const element = new Audio(message.audio);
      element.preload = "auto";
      element.volume = 0;
      audio = element;
      try {
        await element.play();
      } catch (error) {
        if (currentGeneration === generation) {
          audio = null;
          throw error;
        }
        return;
      }
      if (currentGeneration !== generation) {
        element.pause();
        return;
      }
      fadeTimer = fade(element, 0, safeVolume);
      await new Promise<void>((resolve, reject) => {
        element.onended = () => {
          if (fadeTimer !== null) {
            window.clearInterval(fadeTimer);
            fadeTimer = null;
          }
          if (audio === element) audio = null;
          resolve();
        };
        element.onerror = () => {
          if (fadeTimer !== null) {
            window.clearInterval(fadeTimer);
            fadeTimer = null;
          }
          if (audio === element) audio = null;
          reject(new Error("The teacher audio clip could not be played."));
        };
      });
      return;
    }

    if (typeof window === "undefined" || typeof SpeechSynthesisUtterance === "undefined" || !("speechSynthesis" in window)) {
      throw new Error("Speech synthesis is not available in this browser.");
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = TEACHER_VOICE_CONFIG.speech.lang;
    utterance.rate = TEACHER_VOICE_CONFIG.speech.rate;
    utterance.pitch = TEACHER_VOICE_CONFIG.speech.pitch;
    utterance.volume = safeVolume;

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        utterance.onend = null;
        utterance.onerror = null;
      };
      utterance.onend = () => {
        cleanup();
        resolve();
      };
      utterance.onerror = (event) => {
        cleanup();
        if (currentGeneration !== generation || event.error === "canceled" || event.error === "interrupted") {
          resolve();
          return;
        }
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };
      window.speechSynthesis.speak(utterance);
    });
  };

  return { play, stop };
}
