import { useEffect, useMemo, useRef, useState } from "react";
import { AREAS, buildLayout, checkLayout, fitHeight, type MapArea, type MapState, type Pt } from "./layout";
import moneyNow from "@/assets/atlas/money-now.webp";
import moneyWalked from "@/assets/atlas/money-walked.webp";
import selfWalked from "@/assets/atlas/self-walked.webp";
import energyWalked from "@/assets/atlas/energy-walked.webp";
import purposeWalked from "@/assets/atlas/purpose-walked.webp";
import loveWalked from "@/assets/atlas/love-walked.webp";
import everydayWalked from "@/assets/atlas/everyday-walked.webp";
import orb from "@/assets/atlas/orb.webp";

/**
 * The Atlas, as on the phone (same layout engine, same world renders): one sand
 * landform, one thread, one current territory. Hover = a quiet response, click
 * (or tap) = a compact detail. Labels are real text, never below 12 px.
 */
type Lang = "en" | "es";

const COPY = {
  en: {
    state: { walked: "Walked", now: "Now", ahead: "Far off" } as Record<MapState, string>,
    names: { self: "Self-Trust", purpose: "Purpose Finding", love: "Love & Boundaries", money: "Money Clarity", energy: "Energy Reset", everyday: "Daily Rhythm" } as Record<MapArea, string>,
    worldNow: "Celestial Night · Day 3",
    detail: {
      walked: "A path you have walked. Its five worlds are kept in your Atlas.",
      now: "Where you are walking now.",
      ahead: "Further along. It opens when its time comes.",
    } as Record<MapState, string>,
    cta: "Join the waitlist",
    close: "Close",
    label: "Your Atlas: six areas, one thread",
  },
  es: {
    state: { walked: "Recorrido", now: "Ahora", ahead: "A lo lejos" } as Record<MapState, string>,
    names: { self: "Confianza en ti", purpose: "Encontrar propósito", love: "Amor y límites", money: "Claridad financiera", energy: "Reinicio de energía", everyday: "Ritmo diario" } as Record<MapArea, string>,
    worldNow: "Celestial Night · Día 3",
    detail: {
      walked: "Un camino que ya recorriste. Sus cinco mundos se guardan en tu Atlas.",
      now: "Donde caminas ahora.",
      ahead: "Más adelante. Se abre cuando llegue su momento.",
    } as Record<MapState, string>,
    cta: "Unirme a la lista de espera",
    close: "Cerrar",
    label: "Tu Atlas: seis áreas, un solo hilo",
  },
};

const STATES: Record<MapArea, MapState> = { money: "now", self: "walked", energy: "walked", purpose: "ahead", love: "ahead", everyday: "ahead" };
const IMG: Record<MapArea, string> = { money: moneyWalked, self: selfWalked, energy: energyWalked, purpose: purposeWalked, love: loveWalked, everyday: everydayWalked };
const LAND = "#E8DCC3";
const PAPER = "#F3EBDC";
const INK = "#1A1615";
const LABEL: Record<MapState, { name: string; word: string }> = {
  now: { name: INK, word: "#9E3A15" },
  walked: { name: "#4E4642", word: "#5E5348" },
  ahead: { name: "#5F5448", word: "#62564A" },
};

const d = (pts: readonly Pt[], close = false) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}${close ? " Z" : ""}`;

export function AtlasMap({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  const [selected, setSelected] = useState<MapArea | null>(null);
  const [hover, setHover] = useState<MapArea | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.round(el.clientWidth)));
    ro.observe(el);
    setWidth(Math.round(el.clientWidth));
    return () => ro.disconnect();
  }, []);

  const wide = width >= 720;
  const layout = useMemo(() => {
    const input = { width, states: STATES, names: t.names, words: t.state, padTop: 16, padBottom: 16 };
    const height = wide ? Math.round(Math.min(600, Math.max(480, width * 0.56))) : fitHeight(input, 640, 1000);
    const l = buildLayout({ ...input, height });
    if (import.meta.env.DEV) {
      const bad = checkLayout(l, STATES);
      if (bad.length) console.warn("[atlas] layout rules broken:\n" + bad.join("\n"));
    }
    return l;
  }, [width, wide, t]);
  const { height } = layout;
  const active = hover ?? selected;
  const quiet = (a: MapArea) => (active && active !== a ? 0.55 : 1);
  const now = layout.fragments.money;

  return (
    <div ref={box} className="relative w-full overflow-hidden rounded-[2rem] border border-border/60 shadow-card" style={{ height, background: PAPER }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={t.label} className="absolute inset-0">
        <defs>
          <filter id="atlas-walked" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.5" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.74" intercept="0.21" />
              <feFuncG type="linear" slope="0.74" intercept="0.2" />
              <feFuncB type="linear" slope="0.72" intercept="0.19" />
            </feComponentTransfer>
          </filter>
          {AREAS.map((a) => (
            <clipPath key={a} id={`atlas-c-${a}`}>
              <path d={d(layout.fragments[a].poly, true)} />
            </clipPath>
          ))}
        </defs>
        <rect width={width} height={height} fill={LAND} />
        {layout.bays.map((b, i) => (
          <path key={i} d={d(b, true)} fill={PAPER} />
        ))}
        {layout.coast.map((c, i) => (
          <path key={i} d={d(c)} fill="none" stroke="#FBF6EC" strokeWidth={1.4} opacity={0.85} />
        ))}
        {layout.contours.map((c, i) => (
          <path key={i} d={d(c.pts)} fill="none" stroke="#8C7C63" strokeWidth={c.index ? 0.9 : 0.6} strokeOpacity={c.index ? 0.34 : 0.24} strokeLinejoin="round" />
        ))}
        {AREAS.map((a) => {
          const f = layout.fragments[a];
          const op = quiet(a);
          if (f.state === "ahead") {
            const [cx, cy] = f.center;
            const ring = (k: number) => d(f.poly.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as Pt), true);
            return (
              <g key={a} style={{ opacity: op, transition: "opacity 700ms cubic-bezier(.2,.7,.2,1)" }}>
                <path d={d(f.poly, true)} fill="#F7F0E3" fillOpacity={0.5} />
                {[0.74, 0.5, 0.26].map((k) => (
                  <path key={k} d={ring(k)} fill="none" stroke="#7D6D5C" strokeWidth={0.6} strokeOpacity={0.5} />
                ))}
                <path d={d(f.poly, true)} fill="none" stroke="#7D6D5C" strokeWidth={0.9} strokeDasharray="3 4" strokeOpacity={0.8} />
              </g>
            );
          }
          const bb = f.bbox;
          const now = f.state === "now";
          return (
            <g key={a} style={{ opacity: op, transition: "opacity 700ms cubic-bezier(.2,.7,.2,1)" }}>
              <path d={d(f.poly, true)} transform={`translate(0 ${now ? 2.2 : 1})`} fill="#3C2814" fillOpacity={now ? 0.26 : 0.14} />
              <g clipPath={`url(#atlas-c-${a})`}>
                <image
                  href={now ? moneyNow : IMG[a]}
                  x={bb.x}
                  y={bb.y}
                  width={bb.w}
                  height={bb.h}
                  preserveAspectRatio="xMidYMid slice"
                  filter={now ? undefined : "url(#atlas-walked)"}
                />
              </g>
              <path d={d(f.poly, true)} fill="none" stroke="#FBF6EC" strokeWidth={1.2} opacity={0.85} />
              {active === a ? <path d={d(f.poly, true)} fill="none" stroke={INK} strokeWidth={1.6} /> : null}
            </g>
          );
        })}
        {layout.threads.map((th) =>
          th.kind === "walked" ? (
            <path key={th.from + th.to} d={d(th.pts)} fill="none" stroke="#3B2F28" strokeWidth={1.8} strokeDasharray="7 2.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path key={th.from + th.to} d={d(th.pts)} fill="none" stroke="#6F604F" strokeWidth={1.3} strokeDasharray="2.5 6" strokeLinecap="round" />
          ),
        )}
        <image href={orb} x={now.center[0] - 17} y={now.center[1] - 4} width={34} height={34} />
        {AREAS.map((a) => {
          const l = layout.labels[a];
          const c = LABEL[layout.fragments[a].state];
          const right = l.align === "right";
          const x = right ? l.rect.x + l.rect.w : l.rect.x;
          const common = { textAnchor: right ? ("end" as const) : ("start" as const), stroke: LAND, strokeWidth: 3, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
          return (
            <g key={a} style={{ opacity: quiet(a), transition: "opacity 700ms cubic-bezier(.2,.7,.2,1)" }} aria-hidden="true">
              <text x={x} y={l.rect.y + l.nameSize} fontSize={l.nameSize} fontWeight={600} fill={c.name} className="font-serif" {...common}>
                {t.names[a]}
              </text>
              <text x={x} y={l.rect.y + l.nameSize + 3 + l.subSize} fontSize={l.subSize} fontWeight={600} fill={c.word} letterSpacing={0.3} {...common}>
                {t.state[layout.fragments[a].state]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Real controls, fixed reading order, each at least 88 x 88. */}
      {AREAS.map((a) => {
        const f = layout.fragments[a];
        return (
          <button
            key={a}
            type="button"
            aria-pressed={selected === a}
            aria-label={`${t.names[a]}, ${t.state[f.state]}${f.state === "now" ? `, ${t.worldNow}` : ""}`}
            onClick={() => setSelected(selected === a ? null : a)}
            onMouseEnter={() => setHover(a)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(a)}
            onBlur={() => setHover(null)}
            className="absolute rounded-md cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1615]"
            style={{ left: f.hit.x, top: f.hit.y, width: f.hit.w, height: f.hit.h }}
          />
        );
      })}

      {selected ? (
        <div
          role="dialog"
          aria-label={t.names[selected]}
          className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-[22rem] rounded-2xl bg-card border border-border/70 shadow-card p-5 animate-[atlas-rise_700ms_cubic-bezier(.2,.7,.2,1)] motion-reduce:animate-none"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: LABEL[STATES[selected]].word }}>
              {t.state[STATES[selected]]}
            </p>
            <button type="button" onClick={() => setSelected(null)} aria-label={t.close} className="-mr-2 -mt-2 h-11 w-11 grid place-items-center text-muted-foreground">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <h3 className="font-serif text-2xl text-foreground">{t.names[selected]}</h3>
          {STATES[selected] === "now" ? <p className="mt-1 text-sm font-medium text-foreground">{t.worldNow}</p> : null}
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.detail[STATES[selected]]}</p>
          <a href="#waitlist" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4">
            {t.cta}
          </a>
        </div>
      ) : null}
      <style>{`@keyframes atlas-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
