"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface ProfileData {
  email: string;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  isAdmin: boolean;
}

interface ProgressContextValue extends ProfileData {
  completedLeconIds: Set<string>;
  applyCompletion: (
    profile: {
      xp_total: number;
      current_streak: number;
      longest_streak: number;
    },
    leconId: string,
  ) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  initialProfile,
  initialCompletedLeconIds,
  children,
}: {
  initialProfile: ProfileData;
  initialCompletedLeconIds: string[];
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [completedLeconIds, setCompletedLeconIds] = useState(
    () => new Set(initialCompletedLeconIds),
  );

  function applyCompletion(
    updated: {
      xp_total: number;
      current_streak: number;
      longest_streak: number;
    },
    leconId: string,
  ) {
    setProfile((prev) => ({
      ...prev,
      xpTotal: updated.xp_total,
      currentStreak: updated.current_streak,
      longestStreak: updated.longest_streak,
    }));
    setCompletedLeconIds((prev) => new Set(prev).add(leconId));
  }

  const value = useMemo(
    () => ({ ...profile, completedLeconIds, applyCompletion }),
    [profile, completedLeconIds],
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
