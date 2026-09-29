import { useEffect, useRef, useState } from "react";
import appToday from "@/assets/app-today.png";
import appPath from "@/assets/app-path.png";
import appClarity from "@/assets/app-clarity.png";

const SCREENS = [
  {
    image: appToday,
    short: "Hoy",
    eyebrow: "Un momento diario",
    title: "Empieza por algo pequeño.",
    note: "Una pregunta y un paso que cabe en tu día.",
    tone: "today",
  },
  {
    image: appPath,
    short: "Camino",
    eyebrow: "Siete días contigo",
    title: "Sigue un hilo, sin presión.",
    note: "Un camino que parte de lo que estás viviendo ahora.",
    tone: "path",
  },
  {
    image: appClarity,
    short: "Claridad",
    eyebrow: "La foto completa",
    title: "Mira dónde estás.",
    note: "Seis áreas de tu vida, vistas con más suavidad.",
    tone: "clarity",
  },
] as const;

export function EditorialScreenDeck() {
  const [active, setActive] = useState(0);
  const [cycling, setCycling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!cycling || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timerRef.current = setInterval(() => setActive((current) => (current + 1) % SCREENS.length), 1900);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [cycling]);

  const screen = SCREENS[active];

  return (
    <div
      className="editorial-deck"
      onMouseEnter={() => setCycling(true)}
      onMouseLeave={() => setCycling(false)}
      onFocus={() => setCycling(false)}
    >
      <div className={`editorial-deck-stage tone-${screen.tone}`} aria-live="polite">
        <div className="editorial-deck-card" key={screen.short}>
          <div className="editorial-deck-copy">
            <p className="uppercase">{screen.eyebrow}</p>
            <strong>{screen.title}</strong>
            <span>{screen.note}</span>
          </div>
          <div className="editorial-deck-phone">
            <img src={screen.image} alt={`Elara: ${screen.short}`} width="1446" height="2862" fetchPriority={active === 0 ? "high" : "auto"} />
          </div>
        </div>
      </div>

      <div className="editorial-deck-controls" aria-label="Pantallas de Elara">
        {SCREENS.map((item, index) => (
          <button
            key={item.short}
            type="button"
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.short}
          </button>
        ))}
      </div>
      <p className="editorial-deck-hint">Pasa el cursor para recorrer Elara.</p>
    </div>
  );
}
