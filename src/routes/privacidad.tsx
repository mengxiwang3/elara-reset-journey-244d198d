import { createFileRoute } from "@tanstack/react-router";
import { Privacidad } from "@/components/legal/Privacidad";

const TITLE = "Política de Privacidad · Elara";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Qué datos recopila Elara, para qué los usa y cómo puedes pedir que los eliminemos." },
      { property: "og:title", content: TITLE },
      { property: "og:url", content: "https://holaelara.com/privacidad" },
    ],
    links: [
      { rel: "canonical", href: "https://holaelara.com/privacidad" },
      { rel: "alternate", hrefLang: "es", href: "https://holaelara.com/privacidad" },
      { rel: "alternate", hrefLang: "en", href: "https://holaelara.com/privacy" },
    ],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return <Privacidad lang="es" />;
}
