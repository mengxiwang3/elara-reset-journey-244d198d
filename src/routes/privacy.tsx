import { createFileRoute } from "@tanstack/react-router";
import { Privacidad } from "@/components/legal/Privacidad";

const TITLE = "Privacy Policy · Elara";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "What data Elara collects, what it is used for, and how you can ask us to delete it." },
      { property: "og:title", content: TITLE },
      { property: "og:url", content: "https://holaelara.com/privacy" },
      { property: "og:locale", content: "en_US" },
    ],
    links: [
      { rel: "canonical", href: "https://holaelara.com/privacy" },
      { rel: "alternate", hrefLang: "es", href: "https://holaelara.com/privacidad" },
      { rel: "alternate", hrefLang: "en", href: "https://holaelara.com/privacy" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <Privacidad lang="en" />;
}
