"use client";

import { levelFromXp, useGamification } from "@/lib/runtime/gamification";

export function XpBar() {
  const xp = useGamification((s) => s.xp);
  const streak = useGamification((s) => s.streakDays);
  const badges = useGamification((s) => s.badges);
  const level = levelFromXp(xp);
  const mute = useGamification((s) => s.settings.mute);
  const setMute = useGamification((s) => s.setMute);
  const consecutive = streak.length >= 2 ? streak.slice(-7).length : streak.length;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-slate-50 px-4 py-3 text-sm">
      <span>
        Level {level} · {xp} XP
      </span>
      <span>Streak: {consecutive} day{consecutive === 1 ? "" : "s"}</span>
      <span>Badges: {badges.size}</span>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={mute} onChange={(e) => setMute(e.target.checked)} />
        Mute sounds
      </label>
    </div>
  );
}
