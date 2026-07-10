import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgressProvider } from "@/lib/progress-context";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const [{ data: profile }, { data: completions }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "email, display_name, xp_total, current_streak, longest_streak, is_admin, energy, energy_updated_at",
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_lecons")
      .select("lecon_id, completed_at, xp_earned")
      .eq("user_id", user.id),
  ]);

  return (
    <ProgressProvider
      initialProfile={{
        email: profile?.email ?? user.email ?? "",
        displayName: profile?.display_name ?? "",
        xpTotal: profile?.xp_total ?? 0,
        currentStreak: profile?.current_streak ?? 0,
        longestStreak: profile?.longest_streak ?? 0,
        isAdmin: profile?.is_admin ?? false,
        energy: profile?.energy ?? 25,
        energyUpdatedAt: profile?.energy_updated_at ?? new Date().toISOString(),
      }}
      initialCompletedLeconIds={completions?.map((c) => c.lecon_id) ?? []}
      initialCompletions={
        completions?.map((c) => ({
          leconId: c.lecon_id,
          completedAt: c.completed_at,
          xpEarned: c.xp_earned,
        })) ?? []
      }
    >
      <div className="min-h-screen bg-cream dark:bg-black">
        <Header />
        <div className="pb-24">{children}</div>
        <BottomNav />
      </div>
    </ProgressProvider>
  );
}
