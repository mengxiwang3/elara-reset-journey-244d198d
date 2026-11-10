import { useEffect } from "react";
import topEs from "./home.es.top.html?raw";
import topEn from "./home.en.top.html?raw";
import footEs from "./home.es.footer.html?raw";
import footEn from "./home.en.footer.html?raw";
import { WaitlistV4 } from "./WaitlistV4";

/**
 * The interactive homepage.
 *
 * The page body is server-rendered from prepared markup (Spanish at /, English at /en), so it is
 * readable without JavaScript. Its behaviour (traveler, practice, passport, globe, Circles) lives
 * in plain scripts under /home/, loaded here in order. The waitlist form is a real React component.
 */
const SCRIPTS = ["destinations.js", "stage.js", "globe.js", "app.js"];
const RECAP = '<div class="recap" id="recap" aria-live="polite"></div>';

export function HomeV4({ lang }: { lang: "es" | "en" }) {
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    document.documentElement.classList.add("js");
    w.ELARA_BASE = "/home/";
    w.ELARA_SITE = { lang };
    const added: HTMLScriptElement[] = [];
    for (const name of SCRIPTS) {
      const s = document.createElement("script");
      s.src = "/home/" + name;
      s.async = false; // keep the order
      document.body.appendChild(s);
      added.push(s);
    }
    return () => {
      added.forEach((s) => s.remove());
      document.documentElement.classList.remove("js", "ready");
    };
  }, [lang]);

  return (
    <div className="v4" lang={lang}>
      <div dangerouslySetInnerHTML={{ __html: (lang === "en" ? topEn : topEs) + "</main>" }} />
      <section className="close" id={lang === "es" ? "lista" : "waitlist"}>
        <div dangerouslySetInnerHTML={{ __html: RECAP }} />
        <WaitlistV4 lang={lang} />
      </section>
      <div dangerouslySetInnerHTML={{ __html: lang === "en" ? footEn : footEs }} />
    </div>
  );
}

const FONTS =
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@1&display=swap";

/** Head entries shared by / and /en. */
export function homeHead(lang: "es" | "en") {
  const es = lang === "es";
  const title = es
    ? "Elara · Una pregunta al día para dar tu siguiente paso"
    : "Elara · One question a day to take your next step";
  const description = es
    ? "Elige un destino, responde una pregunta sobre algo que estás viviendo y llévate una herramienta para usar en tu vida. Únete a la lista de espera."
    : "Choose a destination, answer one question about something you are living through, and leave with a tool you can use in your life. Join the waitlist.";
  const url = es ? "https://holaelara.com/" : "https://holaelara.com/en";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:locale", content: es ? "es_MX" : "en_US" },
      { property: "og:locale:alternate", content: es ? "en_US" : "es_MX" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "theme-color", content: "#FFFFFF" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "stylesheet", href: FONTS },
      { rel: "stylesheet", href: "/home/page.css" },
    ],
  };
}
