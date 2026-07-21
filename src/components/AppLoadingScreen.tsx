import { Mascot } from "@/components/Mascot";

export function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream px-6 text-center dark:bg-black">
      <div className="animate-bounce">
        <Mascot mood="idle" size={88} />
      </div>
      <div className="h-1.5 w-32 animate-pulse rounded-full bg-orange-300 dark:bg-orange-800" />
    </div>
  );
}
