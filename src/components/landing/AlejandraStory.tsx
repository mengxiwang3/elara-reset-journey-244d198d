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
          <h2 id="alejandra-title">Escuchamos antes<br /><span>de construir.</span></h2>
          <div className="alejandra-rule" aria-hidden="true" />
          <p>Alejandra veía la misma necesidad en su vida y en su comunidad: mujeres sosteniendo mucho, sin un lugar para sí mismas.</p>
          <p>Elara nace de esas conversaciones. No para tener todo resuelto, sino para encontrar un lugar por donde empezar.</p>
          <a href="https://instagram.com/alejandra.travels" target="_blank" rel="noreferrer" className="alejandra-link">Conoce a Alejandra <span aria-hidden="true">↗</span></a>
        </Reveal>
      </div>
    </section>
  );
}
