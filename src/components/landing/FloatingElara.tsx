import { useEffect, useRef, useState, type PointerEvent } from "react";

const MOMENTS = [
  "¿Qué parte de ti necesita un poco de espacio hoy?",
  "No tienes que resolverlo todo ahora.",
  "Podemos empezar por algo pequeño.",
];

export function FloatingElara() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [moment, setMoment] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const progress = available > 0 ? window.scrollY / available : 0;
      root.style.setProperty("--orb-travel", `${Math.sin(progress * Math.PI * 3) * 54}px`);
      root.style.setProperty("--orb-rise", `${(progress - 0.5) * 120}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const moveTowardPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--pointer-x", `${x * 10}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${y * 10}px`);
  };

  const resetPointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--pointer-x", "0px");
    event.currentTarget.style.setProperty("--pointer-y", "0px");
  };

  return (
    <div ref={rootRef} className={`floating-elara ${open ? "is-open" : ""}`}>
      <div className="floating-elara-card" id="elara-moment" aria-live="polite">
        <button className="floating-elara-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
        <p className="uppercase">Un momento con Elara</p>
        <strong>{MOMENTS[moment]}</strong>
        <button type="button" className="floating-elara-next" onClick={() => setMoment((moment + 1) % MOMENTS.length)}>
          Otra pregunta <span aria-hidden="true">→</span>
        </button>
      </div>
      <button
        type="button"
        className="floating-elara-orb"
        aria-expanded={open}
        aria-controls="elara-moment"
        aria-label={open ? "Cerrar momento con Elara" : "Abrir un momento con Elara"}
        onClick={() => setOpen(!open)}
        onPointerMove={moveTowardPointer}
        onPointerLeave={resetPointer}
      >
        <span className="floating-elara-well"><span className="floating-elara-sphere" /></span>
        <span className="floating-elara-label">Tócame</span>
      </button>
    </div>
  );
}
