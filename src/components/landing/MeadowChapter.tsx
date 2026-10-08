import { useEffect, useRef, useState } from "react";
import { MEADOW_LAYOUT, MEADOW_VIEW, MEADOW_VP, type Box } from "./meadowLayout";
import { look } from "./meadowTimeline";

import back from "@/assets/meadow/back.webp";
import sun from "@/assets/meadow/sun.webp";
import glow from "@/assets/meadow/glow.webp";
import hills from "@/assets/meadow/hills.webp";
import hedgeSketch from "@/assets/meadow/hedge-sketch.webp";
import hedgePaper from "@/assets/meadow/hedge-paper.webp";
import hillsNear from "@/assets/meadow/hills-near.webp";
import mist from "@/assets/meadow/mist.webp";
import haze from "@/assets/meadow/haze.webp";
import trail from "@/assets/meadow/trail.webp";
import ahead from "@/assets/meadow/ahead.webp";
import marker from "@/assets/meadow/marker.webp";
import near from "@/assets/meadow/near.webp";
import tooth from "@/assets/meadow/tooth-tile.webp";
import dayEs from "@/assets/app/daycard-es.webp";
import dayEn from "@/assets/app/daycard-en.webp";
import stop2 from "@/assets/meadow/stop2.webp";
import stop3 from "@/assets/meadow/stop3.webp";
import stop4 from "@/assets/meadow/stop4.webp";
import stop5 from "@/assets/meadow/stop5.webp";
import stop6 from "@/assets/meadow/stop6.webp";
import stop7 from "@/assets/meadow/stop7.webp";

const STOPS = [stop2, stop3, stop4, stop5, stop6, stop7];

/**
 * How a 7-day Elara path works, told by the app's own Mist Meadow.
 *
 * The art is the app's (see meadowLayout.ts); the scroll teaches the mechanic
 * and the meadow shows it, in the engine's own terms:
 *   Day 1        she begins where she is: the mist at its heaviest, one marker
 *   Days 2-3     one small practice a day: the way ahead and the first stops
 *   Days 4-5     Elara keeps what she notices: the mist thins, more path
 *   Days 6-7     the path becomes clearer: the hedge resolves, the light warms
 *   Completion   the week is set down and kept (the stitched edge): Atlas
 *
 * There is exactly one "you are here" marker, the one the art draws. The six
 * small ink stops are the days still to come, painted by the same engine on
 * the same dashed line.
 *
 * Desktop: one pinned scene. Phone: the picture stays put while five lines
 * light up in turn (fades only, no camera). Reduced motion: the finished scene
 * and all five lines, listed.
 */

type Lang = "es" | "en";

const COPY = {
  es: {
    eyebrow: "Claridad con el dinero · Un camino de 7 días",
    label: "Cómo funciona un camino de 7 días",
    art: "Mist Meadow: un prado de papel. Un camino sube desde ti hacia un seto entre la niebla.",
    beats: [
      { when: "Día 1", line: "Empiezas donde estás." },
      { when: "Días 2 y 3", line: "Cada día, una práctica pequeña." },
      { when: "Días 4 y 5", line: "Elara guarda lo que vas notando." },
      { when: "Días 6 y 7", line: "La niebla baja. El camino aparece." },
      { when: "Al final", line: "Tu Atlas recuerda lo que caminaste." },
    ],
    kept: "Guardado en tu Atlas",
    dayAlt: "La tarjeta de Hoy en la app: Día 4 de 7 y los siete días del camino, con el de mañana ya esbozado.",
  },
  en: {
    eyebrow: "Money Clarity · A 7-day path",
    label: "How a 7-day path works",
    art: "Mist Meadow: a paper meadow. A path runs up from you toward a hedge in the mist.",
    beats: [
      { when: "Day 1", line: "You begin where you are." },
      { when: "Days 2 and 3", line: "One small practice each day." },
      { when: "Days 4 and 5", line: "Elara keeps what you notice." },
      { when: "Days 6 and 7", line: "The mist lowers. The path appears." },
      { when: "At the end", line: "Your Atlas remembers what you walked." },
    ],
    kept: "Kept in your Atlas",
    dayAlt: "Today's card in the app: Day 4 of 7 and the seven days of the path, tomorrow's already sketched.",
  },
} as const;

/* -- Layers ----------------------------------------------------------------- */
const [VX, VY, VW, VH] = MEADOW_VIEW;
/** The vanishing point as % of the frame. */
const VPX = ((MEADOW_VP[0] - VX) / VW) * 100;
const VPY = ((MEADOW_VP[1] - VY) / VH) * 100;

/** The look as CSS variables, written straight onto the section each frame so
 *  scrolling never re-renders React. */
function vars(v: ReturnType<typeof look>): Record<string, string> {
  const ty = (h: number) => `${((v.sunY / VH) * 100 * (100 / h)).toFixed(3)}%`;
  const o: Record<string, string> = {
    "--m-haze": v.haze.toFixed(4),
    "--m-mist": v.mist.toFixed(4),
    "--m-glow": v.glow.toFixed(4),
    "--m-ahead": v.ahead.toFixed(4),
    "--m-sketch": v.sketch.toFixed(4),
    "--m-paper": v.paper.toFixed(4),
    "--m-atlas": v.atlas.toFixed(4),
    "--m-sun-ty": ty(MEADOW_LAYOUT.sun.h),
    "--m-glow-ty": ty(MEADOW_LAYOUT.glow.h),
    "--m-mk-ty": `${((v.mkY / VH) * 100 * (100 / MEADOW_LAYOUT.marker.h)).toFixed(3)}%`,
    "--m-mk-tx": `${((v.mkX / VW) * 100 * (100 / MEADOW_LAYOUT.marker.w)).toFixed(3)}%`,
    "--m-s-hills": v.s.hills.toFixed(5),
    "--m-s-hedge": v.s.hedge.toFixed(5),
    "--m-s-near": v.s.hillsNear.toFixed(5),
    "--m-s-mist": v.s.mist.toFixed(5),
  };
  v.c.forEach((c, i) => (o[`--m-c${i}`] = c.toFixed(4)));
  v.stops.forEach((s, i) => (o[`--m-stop${i + 2}`] = s.toFixed(4)));
  v.days.forEach((d, i) => (o[`--m-d${i + 1}`] = d.toFixed(4)));
  return o;
}

/** A layer's box, with its transform origin set to the vanishing point. */
function place(b: Box): React.CSSProperties {
  return {
    left: `${b.x}%`,
    top: `${b.y}%`,
    width: `${b.w}%`,
    height: `${b.h}%`,
    transformOrigin: `${((VPX - b.x) / b.w) * 100}% ${((VPY - b.y) / b.h) * 100}%`,
  };
}

/** Far layers are drawn small at the start of the journey (the engine's depth
 *  scale), so in a wide window their side edges would show as hard boxes. They
 *  feather out sideways instead: mist and distance, not a rectangle. */
function Layer({ src, name, style, feather = false }: { src: string; name: string; style?: React.CSSProperties; feather?: boolean }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      decoding="async"
      draggable={false}
      className={`e-meadow__layer${feather ? " e-meadow__layer--feather" : ""}`}
      style={{ ...place(MEADOW_LAYOUT[name]), ...style }}
    />
  );
}

function Meadow({ label }: { label: string }) {
  return (
    <div className="e-meadow" role="img" aria-label={label}>
      {/* Backdrop: sky, the far range, the ground. Still. */}
      <Layer src={back} name="back" />
      <Layer src={sun} name="sun" style={{ transform: "translateY(var(--m-sun-ty))" }} />
      <Layer src={glow} name="glow" style={{ opacity: "var(--m-glow)", transform: "translateY(var(--m-glow-ty))" }} />
      <Layer src={hills} name="hills" feather style={{ transform: "scale(var(--m-s-hills))" }} />
      <Layer src={hedgeSketch} name="hedge-sketch" style={{ opacity: "var(--m-sketch)", transform: "scale(var(--m-s-hedge))" }} />
      <Layer src={hedgePaper} name="hedge-paper" style={{ opacity: "var(--m-paper)", transform: "scale(var(--m-s-hedge))" }} />
      <Layer src={hillsNear} name="hills-near" feather style={{ transform: "scale(var(--m-s-near))" }} />
      <Layer src={mist} name="mist" feather style={{ opacity: "var(--m-mist)", transform: "scale(var(--m-s-mist))" }} />
      <Layer src={haze} name="haze" style={{ opacity: "var(--m-haze)" }} />
      {/* Camera-fixed in the engine: the ground under her, her way, her mark. */}
      <Layer src={trail} name="trail" />
      <Layer src={ahead} name="ahead" style={{ opacity: "var(--m-ahead)" }} />
      {/* The days still to come, laid on the dashed way as each is reached. */}
      {STOPS.map((src, i) => (
        <Layer key={i} src={src} name={`stop${i + 2}`} style={{ opacity: `var(--m-stop${i + 2})` }} />
      ))}
      {/* The one marker, the one the art draws. It walks a little way up the path. */}
      <Layer src={marker} name="marker" style={{ transform: "translate(var(--m-mk-tx), var(--m-mk-ty))" }} />
      <Layer src={near} name="near" />
      {/* The engine's paper tooth, laid over everything. */}
      <span className="e-meadow__tooth" style={{ backgroundImage: `url(${tooth})` }} aria-hidden />
      {/* Completion: the week is stitched down at the edge. */}
      <span className="e-chapter__stitch" aria-hidden />
    </div>
  );
}

/* -- Chapter ---------------------------------------------------------------- */
export function MeadowChapter({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"full" | "lite" | "still">("full");

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqSmall = window.matchMedia("(max-width: 767px)");
    const pick = () => setMode(mqReduce.matches ? "still" : mqSmall.matches ? "lite" : "full");
    pick();
    mqReduce.addEventListener("change", pick);
    mqSmall.addEventListener("change", pick);
    return () => {
      mqReduce.removeEventListener("change", pick);
      mqSmall.removeEventListener("change", pick);
    };
  }, []);

  useEffect(() => {
    if (mode === "still") return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let live = false;
    const camera = mode === "full";
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      for (const [k, val] of Object.entries(vars(look(p, camera)))) el.style.setProperty(k, val);
    };
    const onScroll = () => {
      if (live && !raf) raf = requestAnimationFrame(measure);
    };
    // Only listen while the chapter is near the viewport.
    const io = new IntersectionObserver(
      ([e]) => {
        live = e.isIntersecting;
        if (live) measure();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode]);

  const still = mode === "still";
  // Server render and first paint: the misty start, or the finished scene.
  const initial = vars(look(still ? 1 : 0, false));

  return (
    <section
      ref={ref}
      className={`e-chapter ${still ? "e-chapter--still" : ""}`}
      style={initial as React.CSSProperties}
      aria-label={t.label}
    >
      <div className="e-chapter__stage">
        {/* Full-bleed art band. Nothing is ever written on it. */}
        <div className="e-chapter__art">
          <div className="e-chapter__frame">
            <Meadow label={t.art} />
          </div>
        </div>

        {/* Captions live in their own clean area under the art. */}
        <div className="e-chapter__caption mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div>
            <p className="e-eyebrow">{t.eyebrow}</p>
            {/* All five beats stay in the document, in order. On scroll they take
                turns; reduced motion lists them. */}
            <ol className="e-chapter__beats mt-4">
              {t.beats.map((b, i) => (
                <li key={b.line} style={still ? undefined : ({ "--c": `var(--m-c${i})` } as React.CSSProperties)}>
                  <p className="e-eyebrow e-chapter__when">{b.when}</p>
                  <p className="e-h1 mt-2 text-ink">{b.line}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            {/* Evidence: the app's own day card, from the current build. */}
            <img src={lang === "es" ? dayEs : dayEn} alt={t.dayAlt} width={900} height={259} loading="lazy" decoding="async" className="e-daycard" />
            {/* Seven days. Day 1 is lit from the start; each later day as it lands. */}
            <div className="e-dashes e-dashes--days mt-3" aria-hidden>
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} style={{ "--d": `var(--m-d${i + 1})` } as React.CSSProperties} />
              ))}
            </div>
            <p className="e-chapter__kept e-caption mt-3 flex items-center gap-2.5">
              <span className="e-dot" aria-hidden />
              {t.kept}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
