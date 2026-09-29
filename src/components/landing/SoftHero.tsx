import appToday from "@/assets/app-today.png";
import appPath from "@/assets/app-path.png";
import appClarity from "@/assets/app-clarity.png";

export function SoftHero() {
  return (
    <section id="top" className="soft-hero">
      <div className="soft-hero-copy">
        <p className="uppercase text-muted-foreground">Primera en español · Hecha para tu vida real</p>
        <h1>Para la mujer que sostiene todo.<br /><span>Aquí también hay lugar para ti.</span></h1>
        <p className="soft-hero-description">
          Un camino guiado de 7 días para entender qué necesita atención,
          encontrar un poco de claridad y empezar desde donde estás.
        </p>
        <div className="soft-hero-actions">
          <a href="#lista" className="bg-primary text-primary-foreground hover:bg-accent transition-colors inline-flex items-center justify-center gap-3 px-7 py-3.5">
            Unirme a la lista <span aria-hidden="true">→</span>
          </a>
          <a href="#como" className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground">Ver cómo funciona</a>
        </div>
        <p className="soft-hero-note">Gratis para fundadoras. Un primer paso, a tu ritmo.</p>
      </div>
      <div className="soft-preview-strip" aria-label="Un vistazo a Elara">
        <figure className="soft-preview-side">
          <img src={appPath} alt="Elara — tu camino personalizado" width="1446" height="2862" />
          <figcaption>Un camino para tu momento</figcaption>
        </figure>
        <figure className="soft-preview-main">
          <img src={appToday} alt="Elara — tu día, con un poco más de claridad" width="1446" height="2862" fetchPriority="high" />
          <figcaption>Un pequeño paso cada día</figcaption>
        </figure>
        <figure className="soft-preview-side">
          <img src={appClarity} alt="Elara — claridad sobre tus seis áreas" width="1446" height="2862" />
          <figcaption>Espacio para ver dónde estás</figcaption>
        </figure>
      </div>
    </section>
  );
}
