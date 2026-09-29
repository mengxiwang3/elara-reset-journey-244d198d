import { useState } from "react";
import clarity from "@/assets/app-clarity.png";
import path from "@/assets/app-path.png";
import today from "@/assets/app-today.png";
import { Reveal } from "./Reveal";

const moments = [
  {
    number: "01",
    label: "Mira",
    title: "Ve la foto completa.",
    body: "Elara te ayuda a reconocer qué se siente firme y qué lleva tiempo pidiendo atención.",
    image: clarity,
    alt: "Elara mostrando una vista de claridad de seis áreas de la vida",
  },
  {
    number: "02",
    label: "Elige",
    title: "Empieza donde más importa.",
    body: "Tu camino parte de una sola área, para que no tengas que arreglarlo todo al mismo tiempo.",
    image: path,
    alt: "Elara mostrando un camino guiado para el momento actual",
  },
  {
    number: "03",
    label: "Camina",
    title: "Haz algo pequeño hoy.",
    body: "Cada día trae una pregunta, una práctica breve y un momento para notar lo que cambia.",
    image: today,
    alt: "Elara mostrando la pantalla diaria con un pequeño paso",
  },
] as const;

export function ProductWalkthrough() {
  const [active, setActive] = useState(0);
  const moment = moments[active];

  return (
    <section id="recorrido" className="product-walkthrough" aria-labelledby="walkthrough-title">
      <Reveal className="walkthrough-heading">
        <p className="uppercase text-accent">Un vistazo por dentro</p>
        <h2 id="walkthrough-title">De sentirlo todo<br />a saber por dónde empezar.</h2>
      </Reveal>

      <div className="walkthrough-layout">
        <Reveal className="walkthrough-visual">
          <div className="walkthrough-phone" key={moment.number}>
            <span className="walkthrough-island" aria-hidden="true" />
            <div className="walkthrough-screen">
              <img src={moment.image} alt={moment.alt} width="1446" height="2862" />
            </div>
          </div>
          <span className="walkthrough-screen-label">Pantalla {active + 1} de {moments.length}</span>
        </Reveal>

        <div className="walkthrough-moments" role="tablist" aria-label="Recorrido por Elara">
          {moments.map((item, index) => (
            <button
              key={item.number}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-controls="walkthrough-panel"
              onClick={() => setActive(index)}
              className="walkthrough-moment"
            >
              <span className="walkthrough-number">{item.number}</span>
              <span className="walkthrough-moment-copy">
                <small>{item.label}</small>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </span>
            </button>
          ))}
          <div id="walkthrough-panel" className="walkthrough-next" role="tabpanel">
            <button type="button" onClick={() => setActive((active + 1) % moments.length)}>
              {active === moments.length - 1 ? "Volver al inicio" : "Ver el siguiente momento"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
