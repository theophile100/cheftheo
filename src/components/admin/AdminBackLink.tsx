import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export function AdminBackLink({ href, label = "Retour" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-orange-500 dark:text-zinc-400"
    >
      <IconArrowLeft size={16} stroke={2} />
      {label}
    </Link>
  );
}
