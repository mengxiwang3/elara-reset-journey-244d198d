import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import manifestJson from "@/assets/meadow/manifest.json";
import orbUrl from "@/assets/meadow/elara-orb.webp";
import toothUrl from "@/assets/meadow/tooth.webp";

/**
 * Mist Meadow as a product explainer: one 7-day chapter told with the real
 * world layers. Every image under assets/meadow is one element of the app's
 * world engine (apps/mobile/src/components/world/engine/meadow.ts), rasterised
 * as a transparent bitmap. This file only moves them the way the engine's own
 * camera does: each depth layer is scaled about the vanishing point (150,196)
 * by (D - arrive) / (D - z) and fades as she walks through it.
 *
 * Desktop: sticky stage, scroll drives the camera z (rAF-throttled, transforms
 * and opacity only). Mobile: five static crops that fade in. Reduced motion
 * (and the server render): the finished Day 7 scene, with all captions listed.
 */

type Interval = [number, number];
type PartM = {
  id: string;
  mode: "paper" | "sketch";
  flag: string | null;
  region: [number, number, number, number];
  on: Interval[];
  rise: boolean;
};
type LayerM = { id: string; D: number | null; arrive: number; floor: number; parts: PartM[] };
type Manifest = {
  VP: [number, number];
  route: [number, number][];
  haze: number[];
  glow: number[];
  sunDy: number[];
  layers: LayerM[];
};
const M = manifestJson as unknown as Manifest;

const urls = import.meta.glob("/src/assets/meadow/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const urlOf = (id: string) => urls[`/src/assets/meadow/${id}.webp`];

const Z0 = 0.3;
const ZSTEP = 0.05;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
function tab(arr: number[], z: number) {
  const f = clamp((z - Z0) / ZSTEP, 0, arr.length - 1);
  const i = Math.floor(f);
  return lerp(arr[i], arr[Math.min(arr.length - 1, i + 1)], f - i);
}

/* ---------- the engine's camera (layerView in meadow.ts) ---------- */
function layerLook(l: LayerM, z: number, p: number) {
  let s = 1;
  let o = 1;
  if (l.D !== null) {
    const dist = l.D - z;
    s = (l.D - l.arrive) / Math.max(dist, 0.05);
    const pass = clamp((dist - 0.22) / 0.4, 0, 1);
    const far = clamp(1.15 - (dist - 1) / 7, 0.45, 1);
    o = dist < 0.24 ? 0 : pass * far;
    if (l.floor) o *= clamp((s - (l.floor - 0.08)) / 0.08, 0, 1);
  }
  if (l.id === "haze") o *= tab(M.haze, z);
  // The last veils lift as she reaches the clearing, so Day 7 reads clearly.
  if (/^(hill|strip|mist)/.test(l.id)) o *= 1 - 0.7 * smoothstep(clamp((z - 6.45) / 0.5, 0, 1));
  // A little extra depth: near layers drift further than far ones (art units).
  const k =
    l.id === "near"
      ? 7
      : l.id === "birds"
        ? 4
        : l.D !== null && l.id !== "far"
          ? (1 - l.D / 9) * 3
          : 0;
  const shift = -(p - 0.5) * k;
  const sun = l.id === "sun" ? tab(M.sunDy, z) : 0;
  const sx = l.id === "ground" || l.id === "haze" ? 1.3 : 1;
  return {
    o,
    transform: `translateY(calc(${(shift + sun).toFixed(2)} * var(--u))) scale(${sx}, ${s.toFixed(4)})`,
  };
}
function layerCss(l: LayerM, z: number, p: number): CSSProperties {
  const v = layerLook(l, z, p);
  return {
    opacity: v.o < 0.004 ? 0 : v.o,
    visibility: v.o < 0.01 ? "hidden" : "visible",
    transform: v.transform,
  };
}

function partOpacity(pt: PartM, z: number): number {
  let best = 0;
  for (const [a, b] of pt.on) {
    const up = a <= Z0 + 1e-6 ? 1 : clamp((z - (a - 0.12)) / 0.12, 0, 1);
    const w = Math.min(0.12, 7 - b);
    const down = b >= 6.999 ? 1 : clamp((b + w - z) / w, 0, 1);
    best = Math.max(best, Math.min(up, down));
  }
  return best;
}
function partCss(pt: PartM, z: number): CSSProperties {
  let o = partOpacity(pt, z);
  if (pt.flag === "glow") o *= tab(M.glow, z);
  const dy = pt.rise ? (1 - o) * 6 : 0;
  const css: CSSProperties = {
    opacity: o < 0.004 ? 0 : o,
    transform: dy ? `translateY(calc(${dy.toFixed(2)} * var(--u)))` : undefined,
  };
  if (pt.flag === "thread")
    css.clipPath = `inset(calc((${threadTop(z).toFixed(1)} - ${pt.region[1]}) * var(--u)) 0 0 0)`;
  return css;
}

/* ---------- the orb on the route, and the thread sewn behind it ---------- */
const orbY = (z: number) => lerp(331, 308, clamp((z - 0.5) / 6.5, 0, 1));
function threadTop(z: number) {
  // Up to the orb through the week; on Day 7 it is sewn through the whole route.
  return lerp(orbY(z), 200, smoothstep(clamp((z - 6.2) / 0.8, 0, 1)));
}
function routeX(y: number) {
  const r = M.route;
  for (let i = 0; i < r.length - 1; i++) {
    const [x0, y0] = r[i];
    const [x1, y1] = r[i + 1];
    if ((y <= y0 && y >= y1) || (y >= y0 && y <= y1))
      return lerp(x0, x1, y1 === y0 ? 0 : (y - y0) / (y1 - y0));
  }
  return 150;
}
function orbCss(z: number): CSSProperties {
  const y = orbY(z);
  const w = lerp(15, 12, clamp((z - 0.5) / 6.5, 0, 1));
  return {
    left: `calc(50% + ${(routeX(y) - 150).toFixed(2)} * var(--u))`,
    top: `calc(100% - (var(--yb) - ${y.toFixed(2)}) * var(--u))`,
    width: `calc(${w.toFixed(2)} * var(--u))`,
  };
}

/* ---------- the scene ---------- */
type SceneProps = { z: number; p?: number; live?: boolean; variant: "stage" | "frame" };

function Scene({ z, p = 0.5, live = false, variant }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  // Static scenes render only what is visible at z; a live scene renders every part.
  const layers = useMemo(() => {
    if (live) return M.layers;
    return M.layers
      .map((l) => ({
        ...l,
        parts: l.parts.filter(
          (pt) => layerCss(l, z, p).visibility !== "hidden" && partOpacity(pt, z) > 0.01,
        ),
      }))
      .filter((l) => l.parts.length);
  }, [live, z, p]);

  useEffect(() => {
    const el = root.current;
    if (!el || !live) return;
    const layerEls = Array.from(el.querySelectorAll<HTMLElement>("[data-layer]"));
    const partEls = Array.from(el.querySelectorAll<HTMLElement>("[data-part]"));
    const orb = el.querySelector<HTMLElement>("[data-orb]");
    const update = (zz: number, pp: number) => {
      M.layers.forEach((l, i) => Object.assign(layerEls[i].style, layerCss(l, zz, pp)));
      let k = 0;
      M.layers.forEach((l) =>
        l.parts.forEach((pt) => {
          const css = partCss(pt, zz);
          const st = partEls[k++].style;
          st.opacity = String(css.opacity);
          st.transform = (css.transform as string) ?? "";
          st.clipPath = (css.clipPath as string) ?? "";
        }),
      );
      if (orb) Object.assign(orb.style, orbCss(zz));
    };
    (el as HTMLElement & { __update?: typeof update }).__update = update;
  }, [live]);

  return (
    <div
      ref={root}
      className={`mm-art mm-art-${variant}`}
      role="img"
      aria-label="Mist Meadow, hecho de capas de papel"
      data-live={live ? "1" : undefined}
    >
      {layers.map((l) => (
        <div key={l.id} data-layer={l.id} className="mm-layer" style={layerCss(l, z, p)}>
          {l.parts.map((pt) => (
            <img
              key={pt.id}
              data-part={pt.id}
              src={urlOf(pt.id)}
              alt=""
              draggable={false}
              decoding="async"
              className={l.id === "haze" ? "mm-part mm-haze" : "mm-part"}
              style={{
                left: `calc(50% + ${(pt.region[0] - 150).toFixed(2)} * var(--u))`,
                top: `calc(100% - (var(--yb) - ${pt.region[1]}) * var(--u))`,
                width: `calc(${pt.region[2]} * var(--u))`,
                height: `calc(${pt.region[3]} * var(--u))`,
                ...partCss(pt, z),
              }}
            />
          ))}
        </div>
      ))}
      <img data-orb src={orbUrl} alt="" draggable={false} className="mm-orb" style={orbCss(z)} />
      <div className="mm-tooth" style={{ backgroundImage: `url(${toothUrl})` }} aria-hidden />
    </div>
  );
}

/** Bridge for the desktop scroller: call the live scene's imperative update. */
function updateScene(host: HTMLElement | null, z: number, p: number) {
  const art = host?.querySelector<HTMLElement & { __update?: (z: number, p: number) => void }>(
    ".mm-art",
  );
  art?.__update?.(z, p);
}

/* ---------- copy ---------- */
type Lang = "es" | "en";
type Beat = { day: string; z: number; z2: number; m: number; title: string; text: string };
const COPY: Record<
  Lang,
  {
    eyebrow: string;
    title: string;
    lead: string;
    hint: string;
    chapter: string;
    end: string;
    cta: string;
    beats: Beat[];
    of: string;
  }
> = {
  es: {
    eyebrow: "Dentro de Elara · Mist Meadow",
    title: "Siete días, un solo paisaje.",
    lead: "Cada día de práctica coloca una pieza de papel en tu mundo. Mist Meadow es el primero: un prado cubierto de niebla que se aclara a medida que caminas hacia el claro.",
    hint: "Baja para recorrer el capítulo, día por día.",
    chapter: "Un capítulo de siete días",
    of: "de 7",
    beats: [
      {
        day: "Día 1",
        z: 0.5,
        z2: 0.9,
        m: 0.5,
        title: "El seto",
        text: "La niebla cubre el prado y, a lo lejos, aparece el primer lugar del camino: el seto.",
      },
      {
        day: "Días 2 y 3",
        z: 2.2,
        z2: 2.8,
        m: 0.85,
        title: "Amapolas y puerta",
        text: "Ya estás más cerca. Se abren las amapolas y aparece una puerta, huella de alguien que pasó antes: un lugar para hacer una pausa.",
      },
      {
        day: "Día 4",
        z: 3.6,
        z2: 4.0,
        m: 0.5,
        title: "El muro",
        text: "Cambia la luz y la niebla se levanta un poco. Un muro bajo cruza el prado y deja ver más.",
      },
      {
        day: "Días 5 y 6",
        z: 4.6,
        z2: 5.5,
        m: 0.15,
        title: "El roble y la ladera",
        text: "Dos alondras cruzan el cielo, una señal de vida. El roble y la ladera de semillas se ven juntos en el horizonte.",
      },
      {
        day: "Día 7",
        z: 6.6,
        z2: 7,
        m: 1,
        title: "El claro",
        text: "Llegas al claro. El hilo cose todo el camino y la luz se asienta.",
      },
    ],
    end: "Esto es lo que ves en la app al terminar una semana.",
    cta: "Unirme a la lista",
  },
  en: {
    eyebrow: "Inside Elara · Mist Meadow",
    title: "Seven days, one landscape.",
    lead: "Each day of practice lays one piece of paper into your world. Mist Meadow is the first: a hazy meadow that clears as you walk toward the clearing.",
    hint: "Scroll to walk the chapter, day by day.",
    chapter: "A seven-day chapter",
    of: "of 7",
    beats: [
      {
        day: "Day 1",
        z: 0.5,
        z2: 0.9,
        m: 0.5,
        title: "The hedge",
        text: "Haze covers the meadow and, far ahead, the first place on the path appears: the hedge.",
      },
      {
        day: "Days 2 and 3",
        z: 2.2,
        z2: 2.8,
        m: 0.85,
        title: "Poppies and gate",
        text: "You are closer now. The poppies open and a gate appears, a trace of someone who passed before: a place to pause.",
      },
      {
        day: "Day 4",
        z: 3.6,
        z2: 4.0,
        m: 0.5,
        title: "The wall",
        text: "The light shifts and the haze lifts a little. A low wall crosses the meadow and shows you more.",
      },
      {
        day: "Days 5 and 6",
        z: 4.6,
        z2: 5.5,
        m: 0.15,
        title: "The oak and the slope",
        text: "Two larks cross the sky, a sign of life. The oak and the seeded slope come into view together.",
      },
      {
        day: "Day 7",
        z: 6.6,
        z2: 7,
        m: 1,
        title: "The clearing",
        text: "You reach the clearing. The thread is sewn through the whole route and the light settles.",
      },
    ],
    end: "This is what you see in the app when a week is done.",
    cta: "Join the waitlist",
  },
};

/* ---------- layout modes ---------- */
type Mode = "static" | "desktop" | "mobile";
function useMode(): Mode {
  const [mode, setMode] = useState<Mode>("static");
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 768px)");
    const set = () => setMode(rm.matches ? "static" : mobile.matches ? "mobile" : "desktop");
    set();
    rm.addEventListener("change", set);
    mobile.addEventListener("change", set);
    return () => {
      rm.removeEventListener("change", set);
      mobile.removeEventListener("change", set);
    };
  }, []);
  return mode;
}

/** Scroll progress p in [0,1] -> camera z, resting on each beat so a caption can be read. */
const ANCHORS = [0.08, 0.3, 0.52, 0.74, 0.93];
const HOLD = 0.05;
function zAt(p: number, beats: Beat[]): number {
  for (let i = 0; i < ANCHORS.length; i++) {
    const a = ANCHORS[i] - HOLD;
    const b = ANCHORS[i] + HOLD;
    if (p < a)
      return i === 0
        ? beats[0].z
        : lerp(
            beats[i - 1].z2,
            beats[i].z,
            smoothstep(clamp((p - (ANCHORS[i - 1] + HOLD)) / (a - (ANCHORS[i - 1] + HOLD)), 0, 1)),
          );
    if (p <= b) return lerp(beats[i].z, beats[i].z2, (p - a) / (b - a));
  }
  return beats[beats.length - 1].z2;
}
const beatAt = (p: number) =>
  ANCHORS.reduce((best, a, i) => (Math.abs(p - a) < Math.abs(p - ANCHORS[best]) ? i : best), 0);

function Captions({ beats, active, of }: { beats: Beat[]; active: number; of: string }) {
  return (
    <div className="mm-band">
      <div className="mm-band-inner">
        <ol className="mm-rail" aria-hidden>
          {beats.map((b, i) => (
            <li key={b.day} className={i === active ? "is-on" : i < active ? "is-past" : ""}>
              {b.day}
            </li>
          ))}
        </ol>
        <div className="mm-caps">
          {beats.map((b, i) => (
            <div
              key={b.day}
              className={`mm-cap ${i === active ? "is-on" : ""}`}
              aria-hidden={i !== active}
            >
              <p className="mm-day">{b.day}</p>
              <p className="mm-text">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Desktop({ beats, of }: { beats: Beat[]; of: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    let frozen = false;
    const tick = () => {
      raf = 0;
      if (frozen) return;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
      if (Math.abs(p - last) < 0.0004) return;
      last = p;
      updateScene(el, zAt(p, beats), p);
      setActive((a) => {
        const n = beatAt(p);
        return a === n ? a : n;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    if (import.meta.env.DEV)
      (window as unknown as Record<string, unknown>).__mmSet = (z: number, p: number) => {
        frozen = true;
        updateScene(el, z, p);
      };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [beats]);
  return (
    <div ref={track} className="mm-track" data-mm-track>
      <div className="mm-sticky">
        <div className="mm-stage">
          <Scene z={beats[0].z} p={0} live variant="stage" />
        </div>
        <Captions beats={beats} active={active} of={of} />
      </div>
    </div>
  );
}

function Mobile({ beats }: { beats: Beat[] }) {
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [seen, setSeen] = useState<boolean[]>(() => beats.map(() => false));
  const [near, setNear] = useState<boolean[]>(() => beats.map(() => false));
  useEffect(() => {
    const fade = new IntersectionObserver(
      (es) =>
        es.forEach(
          (e) =>
            e.isIntersecting &&
            setSeen((s) => s.map((v, i) => (refs.current[i] === e.target ? true : v))),
        ),
      { threshold: 0.25 },
    );
    const load = new IntersectionObserver(
      (es) =>
        es.forEach(
          (e) =>
            e.isIntersecting &&
            setNear((s) => s.map((v, i) => (refs.current[i] === e.target ? true : v))),
        ),
      { rootMargin: "100% 0px" },
    );
    refs.current.forEach((el) => el && (fade.observe(el), load.observe(el)));
    return () => (fade.disconnect(), load.disconnect());
  }, []);
  return (
    <ol className="mm-beats">
      {beats.map((b, i) => (
        <li
          key={b.day}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`mm-beat ${seen[i] ? "is-in" : ""}`}
        >
          <div className="mm-frame">
            {near[i] && <Scene z={lerp(b.z, b.z2, b.m)} p={0.5} variant="frame" />}
          </div>
          <p className="mm-day">{b.day}</p>
          <p className="mm-text">{b.text}</p>
        </li>
      ))}
    </ol>
  );
}

function Static({ beats }: { beats: Beat[] }) {
  return (
    <div className="mm-static">
      <div className="mm-stage mm-stage-static">
        <Scene z={7} p={0.5} variant="stage" />
      </div>
      <ol className="mm-list">
        {beats.map((b) => (
          <li key={b.day}>
            <p className="mm-day">{b.day}</p>
            <p className="mm-text">{b.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function MeadowExplainer({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const mode = useMode();
  return (
    <section id="prado" lang={lang} aria-labelledby="mm-title" className="mm">
      <div className="mm-intro">
        <p className="mm-eyebrow">{c.eyebrow}</p>
        <h2 id="mm-title" className="mm-h2">
          {c.title}
        </h2>
        <p className="mm-lead">{c.lead}</p>
        {mode === "desktop" && <p className="mm-hint">{c.hint}</p>}
      </div>
      {mode === "desktop" ? (
        <Desktop beats={c.beats} of={c.of} />
      ) : mode === "mobile" ? (
        <Mobile beats={c.beats} />
      ) : (
        <Static beats={c.beats} />
      )}
    </section>
  );
}
