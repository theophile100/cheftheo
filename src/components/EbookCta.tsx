"use client";

import { buttonClasses } from "@/lib/button-styles";
import { createClient } from "@/lib/supabase/client";
import { TrustedEmbed } from "@/components/TrustedEmbed";

export function EbookCta({
  ebookId,
  ctaType,
  chariowUrl,
  chariowEmbedCode,
}: {
  ebookId: string;
  ctaType: "url" | "embed";
  chariowUrl: string | null;
  chariowEmbedCode: string | null;
}) {
  function trackClick() {
    const supabase = createClient();
    void supabase.rpc("increment_ebook_click", { p_ebook_id: ebookId });
  }

  if (ctaType === "embed" && chariowEmbedCode) {
    return (
      <div onClickCapture={trackClick} className="mt-2">
        <TrustedEmbed html={chariowEmbedCode} />
      </div>
    );
  }

  return (
    <a
      href={chariowUrl ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
      className={buttonClasses("primary", "mt-2 w-full")}
    >
      Obtenir
    </a>
  );
}
