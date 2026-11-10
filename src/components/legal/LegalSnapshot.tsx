import { useEffect, useRef } from "react";
import orb from "@/assets/paper/orb-sm.webp";

/**
 * Terms, Support and Account deletion.
 *
 * These three pages are live on holaelara.com but their source was never committed.
 * The markup here is the deployed page itself, captured on 10 Nov 2026 (both languages
 * are in it; `#en` shows English). Replace with the original components when they are
 * committed; until then this keeps the pages, their text and their links intact.
 */
export function LegalSnapshot({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const apply = () => {
      const en = window.location.hash === "#en";
      const es = root.querySelector<HTMLElement>("#es");
      const enEl = root.querySelector<HTMLElement>("#en");
      if (es) es.hidden = en;
      if (enEl) enEl.hidden = !en;
      root.querySelector("main")?.setAttribute("lang", en ? "en" : "es");
      const seg = root.querySelector(".e-seg");
      if (seg) {
        seg.innerHTML = en
          ? '<a href="#es" lang="es" class="e-seg__off">ES</a><span class="e-seg__on" aria-current="true">EN</span>'
          : '<span class="e-seg__on" aria-current="true">ES</span><a href="#en" lang="en" class="e-seg__off">EN</a>';
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html.replaceAll("__ORB__", orb) }} />;
}
