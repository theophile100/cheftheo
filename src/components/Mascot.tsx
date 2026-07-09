import Image from "next/image";

export type MascotMood = "idle" | "correct" | "incorrect" | "celebrate";

const moodAnimation: Record<MascotMood, string> = {
  idle: "animate-mascot-float",
  correct: "animate-mascot-bounce",
  incorrect: "animate-mascot-tilt",
  celebrate: "animate-mascot-jump",
};

export function Mascot({
  mood = "idle",
  size = 72,
  className = "",
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="Chef Théo"
      width={size}
      height={size}
      className={`shrink-0 ${moodAnimation[mood]} ${className}`}
    />
  );
}
