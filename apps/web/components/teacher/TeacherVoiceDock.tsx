"use client";

import { useTeacherVoice } from "@/lib/teacherVoice/TeacherVoiceProvider";

const STATE_LABEL: Record<string, string> = {
  idle: "Ready",
  waiting: "Listening",
  speaking: "Speaking",
  cooldown: "Waiting for your next step",
  stopped: "Off",
};

export function TeacherVoiceDock({ className = "" }: { className?: string }) {
  const voice = useTeacherVoice();
  if (!voice) return null;

  const { snapshot, enabled, volume, setEnabled, setVolume, replay, unlock } = voice;
  const status = enabled ? (snapshot.blocked ? "Tap to enable" : STATE_LABEL[snapshot.state] ?? "Ready") : "Off";

  return (
    <section
      className={`grid gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}
      aria-label="Ms. Ada teacher voice"
      data-testid="teacher-voice-dock"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`size-2 shrink-0 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden />
          <span className="text-xs font-semibold text-slate-800">Ms. Ada voice</span>
          <span className="truncate text-[11px] text-slate-500" aria-live="polite">
            {status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {snapshot.blocked ? (
            <button
              type="button"
              onClick={unlock}
              className="min-h-8 rounded-md bg-teal-700 px-2.5 text-[11px] font-semibold text-white hover:bg-teal-800"
            >
              Enable voice
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            aria-pressed={enabled}
            className="min-h-8 rounded-md border border-slate-300 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            {enabled ? "Mute" : "Unmute"}
          </button>
          <button
            type="button"
            onClick={replay}
            disabled={!enabled}
            className="min-h-8 rounded-md border border-slate-300 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Replay
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
        Volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="h-1.5 flex-1 accent-teal-700"
          aria-label="Teacher voice volume"
        />
        <span className="w-8 tabular-nums text-slate-500">{Math.round(volume * 100)}%</span>
      </label>

      <p className="min-h-8 rounded-md bg-slate-50 px-2 py-1.5 text-xs leading-snug text-slate-700" aria-live="polite">
        {snapshot.caption ?? "Captions for spoken guidance appear here."}
      </p>
    </section>
  );
}
