import community from "@/assets/community-circle.jpg";
import appToday from "@/assets/app-today.png";

export function StoryHero() {
  return (
    <section id="top" className="story-hero">
      <div className="story-intro">
        <p className="uppercase text-accent">Elara · Un espacio para ti</p>
        <h1>No tienes que<br />sostenerlo todo<br /><span>sola.</span></h1>
        <p className="story-description">Para los días en que por fuera todo parece estar bien,
          pero por dentro necesitas un poco de espacio. Empieza con claridad y un camino guiado de 7 días, a tu ritmo.</p>
        <a href="#lista" className="bg-primary text-primary-foreground hover:bg-accent inline-flex items-center justify-center gap-3 px-7 py-3.5 transition-colors">
          Encontrar mi primer paso <span aria-hidden="true">→</span>
        </a>
        <p className="story-note">Lista de espera abierta. Gratis para fundadoras.</p>
      </div>
      <div className="story-photo-panel">
        <img className="story-photo" src={community} alt="Mujeres compartiendo una conversación alrededor de una mesa" fetchPriority="high" />
        <div className="story-photo-caption">
          <span className="uppercase">Construido desde adentro</span>
          <p>Tu vida real.<br />Con espacio para ti.</p>
        </div>
        <a href="#producto" className="story-app-card" aria-label="Ver las pantallas de Elara">
          <img src={appToday} alt="Pantalla de inicio de Elara" width="1446" height="2862" />
          <span>Un pequeño paso<br /><strong>cada día.</strong><span aria-hidden="true"> ↗</span></span>
        </a>
      </div>
      <div className="story-proof">
        <p><strong>4,601</strong><span>respuestas a la encuesta que nos ayudan a construir Elara</span></p>
        <a href="#como">Conoce cómo funciona <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
