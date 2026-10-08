import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

const TITLE = "Elara · Spanish-first clarity for the woman who holds everything";
const DESCRIPTION =
  "Elara is a Spanish-first AI companion that helps you see where you are, what is asking for attention, and your next small step. Built with Alejandra. Join the waitlist.";

export const Route = createFileRoute("/en")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:url", content: "https://holaelara.com/en" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: "A Spanish-first AI companion. Join the waitlist." },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "es_MX" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: "A Spanish-first AI companion. Join the waitlist." },
    ],
    links: [{ rel: "canonical", href: "https://holaelara.com/en" }],
  }),
  component: EnPage,
});

function EnPage() {
  return <Landing />;
}
