"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { createTeacherAudioPlayer } from "./audioPlayer";
import { subscribeTeacherEvents } from "./events";
import { createTeacherVoiceService } from "./TeacherVoiceService";
import { getTeacherVoiceSettings, useTeacherVoiceSettings } from "./settings";
import type { TeacherMessageCatalog, TeacherVoiceSnapshot } from "./types";

type TeacherVoiceContextValue = {
  snapshot: TeacherVoiceSnapshot;
  enabled: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  replay: () => void;
  unlock: () => void;
};

const TeacherVoiceContext = createContext<TeacherVoiceContextValue | null>(null);

const INITIAL_SNAPSHOT: TeacherVoiceSnapshot = {
  state: "idle",
  caption: null,
  messageId: null,
  promptCount: 0,
  blocked: false,
  enabled: true,
};

export function TeacherVoiceProvider({ catalog, children }: { catalog: TeacherMessageCatalog; children: ReactNode }) {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const [snapshot, setSnapshot] = useState<TeacherVoiceSnapshot>(INITIAL_SNAPSHOT);
  const snapshotRef = useRef(setSnapshot);
  snapshotRef.current = setSnapshot;

  const serviceRef = useRef<ReturnType<typeof createTeacherVoiceService> | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = createTeacherVoiceService({
      messages: catalog.messages,
      player: createTeacherAudioPlayer(),
      settings: getTeacherVoiceSettings,
      allowUnapproved: process.env.NODE_ENV !== "production",
      onSnapshot: (next) => snapshotRef.current(next),
    });
  }
  const service = serviceRef.current;

  const enabled = useTeacherVoiceSettings((state) => state.enabled);
  const volume = useTeacherVoiceSettings((state) => state.volume);
  const setEnabled = useTeacherVoiceSettings((state) => state.setEnabled);
  const setVolume = useTeacherVoiceSettings((state) => state.setVolume);

  useEffect(() => {
    const unsubscribe = subscribeTeacherEvents((event) => service.handle(event));
    void Promise.resolve(useTeacherVoiceSettings.persist.rehydrate()).then(() =>
      service.handle({ type: "settingsChanged" }),
    );
    return () => {
      unsubscribe();
      service.stop();
    };
  }, [service]);

  useEffect(() => {
    service.handle({ type: "settingsChanged" });
  }, [service, enabled]);

  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    service.handle({ type: "routeChanged", pathname });
  }, [pathname, service]);

  const replay = useCallback(() => service.replay(), [service]);
  const unlock = useCallback(() => service.unlock(), [service]);

  const value = useMemo<TeacherVoiceContextValue>(
    () => ({
      snapshot: { ...snapshot, enabled },
      enabled,
      volume,
      setEnabled,
      setVolume,
      replay,
      unlock,
    }),
    [enabled, replay, setEnabled, setVolume, snapshot, unlock, volume],
  );

  return <TeacherVoiceContext.Provider value={value}>{children}</TeacherVoiceContext.Provider>;
}

export function useTeacherVoice() {
  return useContext(TeacherVoiceContext);
}
