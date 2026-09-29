import { useState } from "react";
import appToday from "@/assets/app-today.png";
import appPath from "@/assets/app-path.png";
import appClarity from "@/assets/app-clarity.png";

export function SoftHero() {
  const [motionPaused, setMotionPaused] = useState(false);
  return (
    <section id="top" className={`soft-hero ${motionPaused ? "motion-paused" : ""}`}>
      <div className="soft-ambient-glow" aria-hidden="true" />
      <div className="soft-hero-copy soft-entrance">
        <p className="uppercase text-muted-foreground">Primera en español · Hecha para tu vida real</p>
        <h1>Para la mujer que sostiene todo.<br /><span>Aquí también hay lugar para ti.</span></h1>
        <p className="soft-hero-description">
          Entiende qué te está pesando y encuentra un pequeño lugar por donde empezar,
          con compañía y pasos sencillos durante siete días.
        </p>
        <div className="soft-hero-actions">
          <a href="#lista" className="bg-primary text-primary-foreground hover:bg-accent transition-colors inline-flex items-center justify-center gap-3 px-7 py-3.5">
            Unirme a la lista <span aria-hidden="true">→</span>
          </a>
          <a href="#alejandra" className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground">Conoce a Alejandra</a>
        </div>
        <p className="soft-hero-note">Gratis para fundadoras. Un primer paso, a tu ritmo.</p>
      </div>
      <div className="soft-preview-strip" aria-label="Un vistazo a Elara">
        <figure className="soft-preview-side soft-screen-enter">
          <img src={appPath} alt="Elara: tu camino personalizado" width="1446" height="2862" />
          <figcaption>Un camino para tu momento</figcaption>
        </figure>
        <figure className="soft-preview-main soft-screen-enter">
          <img src={appToday} alt="Elara: tu día, con un poco más de claridad" width="1446" height="2862" fetchPriority="high" />
          <figcaption>Un pequeño paso cada día</figcaption>
        </figure>
        <figure className="soft-preview-side soft-screen-enter">
          <img src={appClarity} alt="Elara: claridad sobre tus seis áreas" width="1446" height="2862" />
          <figcaption>Espacio para ver dónde estás</figcaption>
        </figure>
      </div>
      <button type="button" className="soft-motion-toggle" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>
        {motionPaused ? "Activar animación de portada" : "Pausar animación de portada"}
      </button>
    </section>
  );
}
