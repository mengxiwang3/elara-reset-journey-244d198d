import { useEffect, useRef } from "react";

/**
 * Layered paper water for the indigo section. Five torn bands, each in four
 * keyframes (turbulent -> settled). Scroll fades between neighbouring keyframes and
 * slides each band sideways at its own rate, so the section enters rough and
 * leaves calm. One pass, no loop. Reduced motion shows the calm state, still.
 *
 * Art lives in "art units" (800 across the viewport, 1200 across the layer so
 * there is room to slide); --u is one unit in CSS pixels.
 */
const FILES = import.meta.glob("@/assets/env/wave-*.webp", { eager: true, import: "default" }) as Record<string, string>;
const src = (b: number, k: number) => Object.entries(FILES).find(([p]) => p.endsWith(`wave-${b}_${k}.webp`))?.[1] ?? "";

const BASE = [96, 126, 156, 188, 222];
/** Total sideways travel per band across the whole pass, in art units. */
const DRIFT = [30, 50, 75, 105, 140];
const KEYS = 4;

export function WaveField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = ref.current;
    const section = field?.parentElement;
    if (!field || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const imgs = Array.from(field.querySelectorAll<HTMLImageElement>("img[data-k]"));
    let raf = 0;
    let visible = false;
    const smooth = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const draw = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const t = smooth(0.1, 0.78, p);
      section.style.setProperty("--wp", p.toFixed(4));
      const at = t * (KEYS - 1);
      for (const im of imgs) {
        const k = Number(im.dataset.k);
        im.style.opacity = Math.max(0, 1 - Math.abs(at - k)).toFixed(3);
      }
    };
    const queue = () => {
      if (!raf && visible) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        queue();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(section);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    draw();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="e-waves" aria-hidden>
      {BASE.map((base, b) => (
        <div key={b} className="e-waves__band" style={{ top: `calc(${base - 34} * var(--u))`, ["--wr" as string]: DRIFT[b] }}>
          {Array.from({ length: KEYS }, (_, k) => (
            <img key={k} data-k={k} src={src(b, k)} alt="" width={2400} height={220} loading="lazy" decoding="async" style={{ opacity: k === KEYS - 1 ? 1 : 0 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
