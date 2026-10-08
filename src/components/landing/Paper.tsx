import { useEffect, useRef } from "react";

/**
 * A fragment of the app's own paper art, set loose on the page.
 *
 * Fragments are cut-outs (transparent), so they can sit behind text, behind
 * product UI, or straddle the line between two sections. Each one drifts by a
 * few pixels as it passes through the viewport: slow and physical, never a
 * parallax show. One shared scroll listener drives all of them, and only the
 * ones near the screen are touched.
 *
 *   depth  px of travel across a full pass (kept under ~24)
 *   sway   px of sideways travel across a pass
 *
 * No drift under prefers-reduced-motion. Always decorative (alt="").
 */
const live = new Set<HTMLElement>();
let raf = 0;
let bound = false;

function update() {
  raf = 0;
  const vh = window.innerHeight;
  live.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
    // -1 when the fragment is at the bottom of the screen, +1 at the top
    const t = Math.max(-1.2, Math.min(1.2, 1 - (2 * (r.top + r.height / 2)) / vh));
    el.style.setProperty("--p", t.toFixed(3));
  });
}
function onScroll() {
  if (!raf) raf = requestAnimationFrame(update);
}
function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}
function unbind() {
  if (!bound || live.size) return;
  bound = false;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
}

export function Paper({
  src,
  className = "",
  style,
  depth = 12,
  sway = 0,
  eager = false,
  mask,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  depth?: number;
  sway?: number;
  eager?: boolean;
  /** CSS mask-image, to melt an edge into the page paper. */
  mask?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    live.add(el);
    bind();
    onScroll();
    return () => {
      live.delete(el);
      unbind();
    };
  }, []);
  return (
    <img
      ref={ref}
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`e-paper-frag ${className}`.trim()}
      style={
        {
          "--depth": `${depth}px`,
          "--sway": `${sway}px`,
          ...(mask ? { WebkitMaskImage: mask, maskImage: mask } : null),
          ...style,
        } as React.CSSProperties
      }
    />
  );
}
