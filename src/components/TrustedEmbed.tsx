"use client";

import { useEffect, useRef } from "react";

// Executes admin-provided embed codes (e.g. a Chariow Snap widget). Scripts
// inserted via innerHTML never run, so each <script> is rebuilt and
// re-appended to force the browser to execute it.
export function TrustedEmbed({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const template = document.createElement("template");
    template.innerHTML = html;

    template.content.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });

    container.appendChild(template.content);
  }, [html]);

  return <div ref={containerRef} />;
}
