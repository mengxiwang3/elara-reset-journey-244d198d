import { createFileRoute } from "@tanstack/react-router";
import { LegalSnapshot } from "@/components/legal/LegalSnapshot";
import html from "@/components/legal/snapshots/support.html?raw";

const TITLE = "Soporte · Elara";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Help with the Hola Elara app: how to contact us, memberships, passwords and more." },
      { property: "og:title", content: TITLE },
      { property: "og:url", content: "https://holaelara.com/support" },
    ],
    links: [{ rel: "canonical", href: "https://holaelara.com/support" }],
  }),
  component: SupportPage,
});

function SupportPage() {
  return <LegalSnapshot html={html} />;
}
