import { EditorialScreenDeck } from "./EditorialScreenDeck";
import alejandra from "@/assets/founder-alejandra.jpg";

export function SoftHero() {
  return (
    <section id="top" className="soft-hero editorial-hero">
      <div className="editorial-kicker uppercase text-muted-foreground">
        <span>Elara</span>
        <span>Hecha primero en español</span>
      </div>

      <div className="editorial-hero-grid">
        <div className="soft-hero-copy soft-entrance">
          <h1>
            Un lugar para todo lo que llevas
            <span> por dentro.</span>
          </h1>
          <p className="soft-hero-description">
            Una app para entender cómo estás y encontrar tu siguiente paso, con un camino de siete días a tu ritmo.
          </p>
          <div className="soft-hero-actions">
            <a href="#lista" className="bg-primary text-primary-foreground hover:bg-accent transition-colors inline-flex items-center justify-center gap-3 px-7 py-3.5">
              Quiero conocer Elara <span aria-hidden="true">→</span>
            </a>
          </div>
          <a href="#alejandra" className="soft-founder-link">
            <img src={alejandra} alt="Alejandra" width="52" height="52" />
            <span><strong>Creada por Alejandra y Mengxi.</strong><span>Conoce nuestra historia ↗</span></span>
          </a>
        </div>

        <EditorialScreenDeck />
      </div>

      <div className="editorial-proof">
        <span>Escuchamos antes de construir.</span>
        <strong>4,601</strong>
        <p>respuestas de mujeres sobre lo que están cargando y lo que necesitan ahora.</p>
      </div>
    </section>
  );
}
