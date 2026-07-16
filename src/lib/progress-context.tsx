"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type NiveauEtude = "cap" | "bts";

export interface ProfileData {
  email: string;
  displayName: string;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  isAdmin: boolean;
  energy: number;
  energyUpdatedAt: string;
  unlimitedEnergyUntil: string | null;
  niveauEtude: NiveauEtude;
}

export interface CompletionRecord {
  leconId: string;
  completedAt: string;
  xpEarned: number;
}

interface ProgressContextValue extends ProfileData {
  completedLeconIds: Set<string>;
  completions: CompletionRecord[];
  applyCompletion: (
    profile: {
      xp_total: number;
      current_streak: number;
      longest_streak: number;
    },
    leconId: string,
    xpEarned: number,
  ) => void;
  setEnergy: (energy: number, energyUpdatedAt?: string) => void;
  setDisplayName: (displayName: string) => void;
  setNiveauEtude: (niveauEtude: NiveauEtude) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  initialProfile,
  initialCompletedLeconIds,
  initialCompletions,
  children,
}: {
  initialProfile: ProfileData;
  initialCompletedLeconIds: string[];
  initialCompletions: CompletionRecord[];
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [completedLeconIds, setCompletedLeconIds] = useState(
    () => new Set(initialCompletedLeconIds),
  );
  const [completions, setCompletions] = useState(initialCompletions);

  function applyCompletion(
    updated: {
      xp_total: number;
      current_streak: number;
      longest_streak: number;
    },
    leconId: string,
    xpEarned: number,
  ) {
    setProfile((prev) => ({
      ...prev,
      xpTotal: updated.xp_total,
      currentStreak: updated.current_streak,
      longestStreak: updated.longest_streak,
    }));
    setCompletedLeconIds((prev) => new Set(prev).add(leconId));
    setCompletions((prev) => [
      ...prev,
      { leconId, completedAt: new Date().toISOString(), xpEarned },
    ]);
  }

  function setEnergy(energy: number, energyUpdatedAt?: string) {
    setProfile((prev) => ({
      ...prev,
      energy,
      energyUpdatedAt: energyUpdatedAt ?? prev.energyUpdatedAt,
    }));
  }

  function setDisplayName(displayName: string) {
    setProfile((prev) => ({ ...prev, displayName }));
  }

  function setNiveauEtude(niveauEtude: NiveauEtude) {
    setProfile((prev) => ({ ...prev, niveauEtude }));
  }

  const value = useMemo(
    () => ({
      ...profile,
      completedLeconIds,
      completions,
      applyCompletion,
      setEnergy,
      setDisplayName,
      setNiveauEtude,
    }),
    [profile, completedLeconIds, completions],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
