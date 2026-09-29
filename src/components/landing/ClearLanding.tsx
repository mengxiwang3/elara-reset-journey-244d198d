import clarity from "@/assets/app-clarity.png";
import alejandra from "@/assets/founder-alejandra.jpg";
import { BrandMark } from "./Brand";
import { ProductWalkthrough } from "./ProductWalkthrough";
import { Waitlist } from "./LandingES";
import "./clear.css";

export function ClearLanding() {
  return (
    <main className="clear-landing" lang="es">
      <header className="clear-nav">
        <a href="#top" aria-label="Elara, inicio"><BrandMark /></a>
        <nav aria-label="Navegación principal">
          <a href="#recorrido">Cómo funciona</a>
          <a href="#historia">Nuestra historia</a>
          <a className="clear-nav-cta" href="#lista">Unirme a la lista</a>
        </nav>
      </header>

      <section className="clear-hero" id="top">
        <div className="clear-hero-copy">
          <p className="clear-eyebrow">Tu espacio. En español.</p>
          <h1>Entiende cómo estás.<br /><span>Encuentra tu<br className="clear-desktop-break" /> siguiente paso.</span></h1>
          <p className="clear-description">Elara es una app para hacer una pausa, reconocer qué necesita atención y empezar un camino de siete días, a tu ritmo.</p>
          <div className="clear-actions"><a className="clear-button" href="#lista">Quiero probar Elara <span aria-hidden="true">↗</span></a><a href="#recorrido">Ver cómo funciona <span aria-hidden="true">↓</span></a></div>
          <p className="clear-caption">Únete a la lista para nuestro primer grupo.</p>
        </div>
        <figure className="clear-app">
          <img src={clarity} alt="Pantalla real de Elara: una vista de claridad sobre seis áreas de tu vida" fetchPriority="high" width="1446" height="2862" />
          <figcaption>Empieza por ver dónde estás.</figcaption>
        </figure>
      </section>

      <div className="clear-proof"><strong>4,601</strong><p>respuestas de mujeres nos ayudaron a entender<br />qué hacía falta antes de construir Elara.</p><span>Escuchar fue el primer paso.</span></div>

      <section className="clear-story" id="historia" aria-labelledby="clear-story-title">
        <figure><img src={alejandra} alt="Alejandra Ramirez, cofundadora de Elara" loading="lazy" /><figcaption>Alejandra Ramirez · Cofundadora</figcaption></figure>
        <div><p className="clear-eyebrow">Por qué la estamos creando</p><h2 id="clear-story-title">También lo necesitábamos.</h2><p>Alejandra veía la misma necesidad en su vida y en su comunidad: mujeres sosteniendo mucho, sin un lugar para sí mismas.</p><p>De esas conversaciones nace Elara. Un espacio para empezar por lo que necesitas tú.</p><a href="https://instagram.com/alejandra.travels" target="_blank" rel="noreferrer">Conoce a Alejandra <span aria-hidden="true">↗</span></a></div>
      </section>

      <ProductWalkthrough />
      <p className="clear-disclosure">Elara usa inteligencia artificial para responder a lo que compartes. No diagnostica ni reemplaza apoyo profesional.</p>
      <Waitlist />
      <footer className="clear-footer"><BrandMark /><p>Hecho por Mengxi y Alejandra.</p><span>© {new Date().getFullYear()} Elara</span></footer>
    </main>
  );
}
