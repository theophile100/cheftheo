export type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "dark";

const base =
  "inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-base font-bold transition-all duration-100 ease-out active:translate-y-1 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-500 text-white shadow-[0_4px_0_0_#c2410c] hover:bg-orange-400 active:shadow-[0_1px_0_0_#c2410c]",
  secondary:
    "bg-white text-zinc-900 shadow-[0_4px_0_0_#e4e4e7] hover:bg-zinc-50 active:shadow-[0_1px_0_0_#e4e4e7] dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-[0_4px_0_0_#3f3f46] dark:hover:bg-zinc-800 dark:active:shadow-[0_1px_0_0_#3f3f46]",
  success:
    "bg-green-500 text-white shadow-[0_4px_0_0_#15803d] hover:bg-green-400 active:shadow-[0_1px_0_0_#15803d]",
  danger:
    "bg-red-500 text-white shadow-[0_4px_0_0_#b91c1c] hover:bg-red-400 active:shadow-[0_1px_0_0_#b91c1c]",
  dark: "bg-zinc-900 text-white shadow-[0_4px_0_0_#000000] hover:bg-zinc-800 active:shadow-[0_1px_0_0_#000000] dark:bg-zinc-50 dark:text-zinc-900 dark:shadow-[0_4px_0_0_#a1a1aa] dark:hover:bg-white",
};

export function buttonClasses(variant: ButtonVariant = "primary", className = "") {
  return `${base} ${variants[variant]}${className ? ` ${className}` : ""}`;
}
