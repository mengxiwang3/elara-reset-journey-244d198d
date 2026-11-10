import { useEffect, useState } from "react";

const S = {
  h: ["Nosotras", "About us"],
  note: [
    "Lo veíamos en nuestra vida y en miles de mensajes: mujeres que por fuera parecen tenerlo todo resuelto y por dentro funcionan en vacío. Elara es para ti. (La verdad, también para nosotras.)",
    "We saw it in our own lives and in thousands of messages: women who look like they have it all together and are running on empty inside. Elara is for you. (Honestly, for us too.)",
  ],
  sign: ["Mengxi y Ale", "Mengxi and Ale"],
  r1: ["Producto y diseño", "Product and design"],
  r2: ["Creadora y comunidad", "Creator and community"],
  b1: [
    "Mengxi construye el producto: lo que ves, cómo se siente y cómo funciona cada día.",
    "Mengxi builds the product: what you see, how it feels and how each day works.",
  ],
  b2: [
    "Alejandra crea con la comunidad: más de 80 000 mujeres la siguen, y sus mensajes son el punto de partida de Elara.",
    "Alejandra creates with the community: more than 80,000 women follow her, and their messages are where Elara starts.",
  ],
  fh: ["Cómo nos ayuda lo que nos cuentas", "How what you tell us shapes Elara"],
  fp: [
    "Más de 4600 mujeres nos contaron, con honestidad, lo que estaban cargando. El dinero fue lo que más salió: casi 1 de cada 3 lo eligió como lo primero que resolvería. Por eso Elara empieza ahí. Leemos cada respuesta, de verdad.",
    "More than 4,600 women told us, honestly, what they were carrying. Money came up most: almost 1 in 3 chose it as the first thing they would fix. So Elara starts there. We read every reply, really.",
  ],
  back: ["Volver al inicio", "Back to the homepage"],
  cta: ["Unirme a la lista", "Join the list"],
  pv: ["Privacidad", "Privacy"],
  tm: ["Términos", "Terms"],
  sp: ["Soporte", "Support"],
} as const;

/** Founders page. Spanish by default; #en, or the language chosen on the homepage, shows English. */
export function Nosotras() {
  const [en, setEn] = useState(false);
  useEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem("elara-lang") === "en";
    } catch {
      /* storage unavailable */
    }
    setEn(window.location.hash === "#en" || stored);
  }, []);
  const i = en ? 1 : 0;
  const pick = (v: boolean) => {
    setEn(v);
    try {
      sessionStorage.setItem("elara-lang", v ? "en" : "es");
    } catch {
      /* fine */
    }
  };
  const home = en ? "/en" : "/";
  return (
    <div className="v4" lang={en ? "en" : "es"}>
      <header className="top">
        <a className="brand" href={home}>
          <img src="/home/assets/orb.png" alt="" width={26} height={26} />
          elara
        </a>
        <div className="lang" role="group" aria-label="Idioma / Language" style={{ marginLeft: "auto" }}>
          <button type="button" aria-pressed={!en} lang="es" onClick={() => pick(false)}>
            ES
          </button>
          <button type="button" aria-pressed={en} lang="en" onClick={() => pick(true)}>
            EN
          </button>
        </div>
        <a className="btn primary small" href={en ? "/en#waitlist" : "/#lista"}>
          {S.cta[i]}
        </a>
      </header>
      <main className="about">
        <h1>{S.h[i]}</h1>
        <blockquote className="bignote">
          <span>{S.note[i]}</span>
          <cite>{S.sign[i]}</cite>
        </blockquote>
        <ul className="who">
          <li>
            <img src="/home/assets/founder-mengxi.jpg" alt="Mengxi Wang" width={96} height={96} />
            <div>
              <b>Mengxi Wang</b>
              <span>{S.r1[i]}</span>
              <p className="bio">{S.b1[i]}</p>
              <a className="ig" href="https://instagram.com/karawang">
                @karawang
              </a>
            </div>
          </li>
          <li>
            <img src="/home/assets/founder-alejandra.jpg" alt="Alejandra Ramirez" width={96} height={96} />
            <div>
              <b>Alejandra Ramirez</b>
              <span>{S.r2[i]}</span>
              <p className="bio">{S.b2[i]}</p>
              <a className="ig" href="https://instagram.com/alejandra.travels">
                @alejandra.travels
              </a>
            </div>
          </li>
        </ul>
        <h2>{S.fh[i]}</h2>
        <p>{S.fp[i]}</p>
        <a className="back" href={home}>
          {S.back[i]}
        </a>
      </main>
      <footer className="foot">
        <a className="brand" href={home}>
          <img src="/home/assets/orb.png" alt="" width={22} height={22} />
          elara
        </a>
        <nav aria-label="Legal">
          <a href={en ? "/privacy" : "/privacidad"}>{S.pv[i]}</a>
          <a href="/terms-and-conditions">{S.tm[i]}</a>
          <a href="/support">{S.sp[i]}</a>
        </nav>
      </footer>
    </div>
  );
}
