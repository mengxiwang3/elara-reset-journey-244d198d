import { createFileRoute } from "@tanstack/react-router";
import { Nosotras } from "@/components/home/Nosotras";

const TITLE = "Nosotras · Elara";

export const Route = createFileRoute("/nosotras")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Quiénes hacemos Elara y por qué: Mengxi Wang y Alejandra Ramirez." },
      { property: "og:title", content: TITLE },
      { property: "og:url", content: "https://holaelara.com/nosotras" },
      { name: "theme-color", content: "#FFFFFF" },
    ],
    links: [
      { rel: "canonical", href: "https://holaelara.com/nosotras" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@1&display=swap",
      },
      { rel: "stylesheet", href: "/home/page.css" },
    ],
  }),
  component: Nosotras,
});
