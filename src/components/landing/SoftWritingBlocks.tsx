import community from "@/assets/community-circle.jpg";
import { Reveal } from "./Reveal";
import { ProductWalkthrough } from "./ProductWalkthrough";

const steps = [
  { number: "01", title: "Haz una pausa", body: "Cuéntale a Elara qué está ocupando espacio." },
  { number: "02", title: "Mira dónde estás", body: "Reconoce qué se siente firme y qué necesita atención." },
  { number: "03", title: "Empieza pequeño", body: "Sigue un camino de siete días, a tu ritmo." },
];

export function SoftWritingBlocks() {
  return (
    <>
      <section className="writing-block writing-block-insight" aria-labelledby="insight-title">
        <Reveal className="writing-block-grid">
          <div>
            <p className="uppercase text-accent">Lo que escuchamos</p>
            <h2 id="insight-title">No era falta de ganas.<br />Era demasiado peso.</h2>
          </div>
          <div className="writing-block-body">
            <p>Mujeres capaces, ambiciosas y cansadas de sostenerlo todo sin un lugar donde aterrizar.</p>
            <div className="writing-stat"><strong>4,601</strong><span>respuestas que ayudaron a dar forma a Elara.</span></div>
          </div>
        </Reveal>
      </section>

      <section id="como" className="writing-block writing-block-steps" aria-labelledby="steps-title">
        <Reveal className="writing-block-heading">
          <p className="uppercase text-accent">Cómo funciona</p>
          <h2 id="steps-title">Primero, escucha.<br />Después, un paso.</h2>
        </Reveal>
        <div className="writing-steps">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 90} className="writing-step">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="writing-ai-note">
          <span>Sobre la tecnología</span>
          <p>Elara usa inteligencia artificial para responder a lo que compartes. No diagnostica ni reemplaza apoyo profesional.</p>
        </Reveal>
      </section>

      <ProductWalkthrough />

      <section className="writing-block writing-block-outcome" aria-labelledby="outcome-title">
        <Reveal>
          <p className="uppercase">Al terminar tus siete días</p>
          <h2 id="outcome-title">No sales con más tareas.<br />Sales sabiendo por dónde seguir.</h2>
          <ul>
            <li>Palabras para lo que estás sintiendo</li>
            <li>Una prioridad para este momento</li>
            <li>Pequeños pasos que sí caben en tu vida</li>
          </ul>
        </Reveal>
      </section>

      <section id="comunidad" className="writing-block writing-block-community" aria-labelledby="community-title">
        <Reveal className="writing-community-image">
          <img src={community} alt="Mujeres conversando alrededor de una mesa" loading="lazy" />
        </Reveal>
        <Reveal delay={120} className="writing-community-copy">
          <p className="uppercase">Primero en español</p>
          <h2 id="community-title">Tu idioma.<br />Tu contexto.<br />Tu manera.</h2>
          <p>Familia, ambición, identidad y descanso pueden vivir en la misma conversación.</p>
          <a href="#lista">Quiero estar entre las primeras <span aria-hidden="true">→</span></a>
        </Reveal>
      </section>
    </>
  );
}
