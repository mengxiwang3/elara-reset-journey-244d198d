import alejandra from "@/assets/founder-alejandra.jpg";
import { Reveal } from "./Reveal";

/** Preview copy uses existing founder context, not an invented first-person testimonial. */
export function AlejandraStory() {
  return (
    <section id="alejandra" className="alejandra-section" aria-labelledby="alejandra-title">
      <div className="alejandra-grid">
        <Reveal className="alejandra-portrait">
          <figure>
            <div className="alejandra-photo"><img src={alejandra} alt="Alejandra Ramirez, cofundadora de Elara" loading="lazy" /></div>
            <figcaption><strong>Alejandra Ramirez</strong><span>Cofundadora · Creadora y comunidad</span></figcaption>
          </figure>
        </Reveal>
        <Reveal delay={140} className="alejandra-copy">
          <p className="uppercase text-accent">Una de las mujeres detrás de Elara</p>
          <h2 id="alejandra-title">Antes de hablar de una app,<br /><span>hablemos de nosotras.</span></h2>
          <div className="alejandra-rule" aria-hidden="true" />
          <p>Alejandra es creadora y cofundadora de Elara. Junto a Mengxi, está construyendo un espacio para las mujeres que sostienen mucho y también necesitan un lugar para sí mismas.</p>
          <p>El punto de partida está en la vida real: lo que compartimos con amigas, lo que nos cuesta decir y lo que tantas mujeres han contado en la comunidad. Las <strong>4,601 respuestas a la encuesta</strong> nos ayudan a escuchar con más atención.</p>
          <p>No se trata de tener todo resuelto. Se trata de encontrar un pequeño lugar por donde empezar, con compañía y a tu ritmo.</p>
          <a href="https://instagram.com/alejandra.travels" target="_blank" rel="noreferrer" className="alejandra-link">Conoce a Alejandra <span aria-hidden="true">↗</span></a>
        </Reveal>
      </div>
    </section>
  );
}
