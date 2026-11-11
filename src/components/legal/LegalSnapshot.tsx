import { useEffect, useState } from "react";

/**
 * Terms, Support and Account deletion, in the homepage's design.
 *
 * The wording comes from the three pages as deployed (captured 10 Nov 2026; their original source
 * was never committed). Only the shell is new: plain white page, one reading column, a language
 * switch that is easy to see, and a language picked from the visitor's browser so a reviewer or
 * visitor who reads English lands on English. Both languages stay in the HTML so the text is
 * readable without JavaScript.
 */
const strip = (s: string) => s.replace(/\sclass="[^"]*"/g, "").replace(/\starget="_blank"/g, ' target="_blank"');

function split(html: string) {
  const es = /<div id="es"><div lang="es">([\s\S]*?)<\/div><\/div><div id="en"/.exec(html)?.[1] ?? "";
  const en = /<div id="en" hidden=""><div lang="en">([\s\S]*?)<\/div><\/div><\/div><\/article>/.exec(html)?.[1] ?? "";
  // The captured pages wrap the rules and sections in one extra div; flatten it.
  const flat = (x: string) => strip(x.replace(/<div class="e-rule[^"]*">/, "<div>"));
  return { es: flat(es), en: flat(en) };
}

const UI = {
  home: ["/", "/en"],
  back: ["Volver al inicio", "Back to the homepage"],
  pv: [["Privacidad", "/privacidad"], ["Privacy", "/privacy"]],
  tm: ["Términos", "Terms"],
  sp: ["Soporte", "Support"],
  del: ["Eliminar cuenta", "Delete account"],
  note: ["Elara no es terapia ni un servicio médico.", "Elara is not therapy or a medical service."],
} as const;

export function LegalSnapshot({ html }: { html: string }) {
  const { es, en: enHtml } = split(html);
  const [en, setEn] = useState(false);

  useEffect(() => {
    let stored = "";
    try {
      stored = sessionStorage.getItem("elara-lang") || "";
    } catch {
      /* storage unavailable */
    }
    const h = window.location.hash;
    if (h === "#en") setEn(true);
    else if (h === "#es") setEn(false);
    else if (stored) setEn(stored === "en");
    else setEn(!/^es\b/i.test(navigator.language || "es"));
    const onHash = () => setEn(window.location.hash === "#en");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = en ? "en" : "es";
  }, [en]);

  const i = en ? 1 : 0;
  const pick = (v: boolean) => {
    setEn(v);
    try {
      sessionStorage.setItem("elara-lang", v ? "en" : "es");
    } catch {
      /* fine */
    }
    history.replaceState(null, "", window.location.pathname + (v ? "#en" : "#es"));
  };

  return (
    <div className="v4 legal" lang={en ? "en" : "es"}>
      <header className="top">
        <a className="brand" href={UI.home[i]}>
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
      </header>
      <main className="doc">
        <div lang="es" hidden={en} dangerouslySetInnerHTML={{ __html: es }} />
        <div lang="en" hidden={!en} dangerouslySetInnerHTML={{ __html: enHtml }} />
        <a className="back" href={UI.home[i]}>
          {UI.back[i]}
        </a>
      </main>
      <footer className="foot">
        <a className="brand" href={UI.home[i]}>
          <img src="/home/assets/orb.png" alt="" width={22} height={22} />
          elara
        </a>
        <p className="foot-note">{UI.note[i]}</p>
        <nav aria-label="Legal">
          <a href={UI.pv[i][1]}>{UI.pv[i][0]}</a>
          <a href="/terms-and-conditions">{UI.tm[i]}</a>
          <a href="/support">{UI.sp[i]}</a>
          <a href="/request-account-deletion">{UI.del[i]}</a>
          <a href="mailto:hola@holaelara.com">hola@holaelara.com</a>
        </nav>
      </footer>
    </div>
  );
}
