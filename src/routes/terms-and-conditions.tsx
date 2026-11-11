import { createFileRoute } from "@tanstack/react-router";
import { LegalSnapshot } from "@/components/legal/LegalSnapshot";
import html from "@/components/legal/snapshots/terms-and-conditions.html?raw";

const TITLE = "Términos y condiciones · Elara";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Terms and conditions for the Hola Elara app and holaelara.com." },
      { property: "og:title", content: TITLE },
      { property: "og:url", content: "https://holaelara.com/terms-and-conditions" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "/home/page.css" },
      { rel: "stylesheet", href: "/home/legal.css" },
      { rel: "canonical", href: "https://holaelara.com/terms-and-conditions" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return <LegalSnapshot html={html} />;
}
