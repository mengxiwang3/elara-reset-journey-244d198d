import alejandra from "@/assets/founder-alejandra.jpg";
import mengxi from "@/assets/founder-mengxi.jpg";
import today from "@/assets/app-today.png";
import { BrandMark } from "./Brand";
import { ProductWalkthrough } from "./ProductWalkthrough";
import { Waitlist } from "./LandingES";
import "./journal.css";

export function JournalLanding() {
  return (
    <main className="journal" lang="es">
      <header className="journal-nav">
        <a href="#top" aria-label="Elara, inicio"><BrandMark /></a>
        <nav aria-label="Navegación principal">
          <a href="#nosotras">Nuestra historia</a>
          <a href="#recorrido">Dentro de Elara</a>
          <a href="#lista">Quiero conocerla <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="journal-opening" id="top">
        <div className="journal-intro">
          <p className="journal-eyebrow">Una pausa para ti. Primero en español.</p>
          <h1>Has estado<br />para todos.<br /><em>Ahora, para ti.</em></h1>
          <p className="journal-deck">Un lugar para escucharte, entender qué necesitas y dar un pequeño paso. Eso es Elara.</p>
          <a className="journal-action" href="#lista">Quiero conocer Elara <span aria-hidden="true">↗</span></a>
          <p className="journal-small">Estamos preparando nuestro primer grupo.</p>
        </div>
        <figure className="journal-cover">
          <img src={alejandra} alt="Alejandra Ramirez, cofundadora de Elara, al aire libre" fetchPriority="high" />
          <figcaption><span>Alejandra Ramirez</span><span>Cofundadora de Elara</span></figcaption>
        </figure>
      </section>

      <section className="journal-letter" id="nosotras" aria-labelledby="letter-title">
        <div className="journal-margin"><span>01 / Nuestra historia</span><p>De conversaciones<br />a un lugar propio.</p></div>
        <div className="journal-letter-body">
          <h2 id="letter-title">Antes de ser una app,<br />fueron muchas conversaciones.</h2>
          <p>Alejandra veía la misma necesidad en su vida y en su comunidad: mujeres sosteniendo mucho, sin un lugar para sí mismas.</p>
          <p>Elara nace de esas conversaciones. No para tener todo resuelto, sino para encontrar un lugar por donde empezar.</p>
          <div className="journal-founders">
            <img src={mengxi} alt="Mengxi, cofundadora de Elara" loading="lazy" />
            <div><strong>Mengxi y Alejandra</strong><span>Las mujeres detrás de Elara</span></div>
            <a href="https://instagram.com/alejandra.travels" target="_blank" rel="noreferrer">Conoce a Alejandra ↗</a>
          </div>
        </div>
      </section>

      <aside className="journal-research" aria-label="Nuestra investigación">
        <span>Escuchamos antes<br />de construir.</span>
        <strong>4,601</strong>
        <p>respuestas de mujeres que ayudaron a dar forma a Elara.</p>
      </aside>

      <section className="journal-product" aria-labelledby="daily-title">
        <div className="journal-product-copy">
          <p className="journal-eyebrow">02 / Un momento cotidiano</p>
          <h2 id="daily-title">No tienes que<br />resolverlo todo hoy.</h2>
          <p>Empieza por lo que está ocupando espacio. Elara te ayuda a reconocer una prioridad y seguir un camino de siete días, a tu ritmo.</p>
          <a href="#recorrido">Mira cómo se siente por dentro <span aria-hidden="true">↓</span></a>
        </div>
        <figure className="journal-screen">
          <img src={today} alt="Pantalla de Elara con una pregunta y una práctica para hoy" loading="lazy" />
          <figcaption>Una pregunta. Una práctica. Un paso.</figcaption>
        </figure>
      </section>

      <ProductWalkthrough />
      <p className="journal-disclosure">Elara usa inteligencia artificial para responder a lo que compartes. No diagnostica ni reemplaza apoyo profesional.</p>
      <Waitlist />
      <footer className="journal-footer"><BrandMark /><p>Hecho por Mengxi y Alejandra.</p><span>© {new Date().getFullYear()} Elara</span></footer>
    </main>
  );
}
