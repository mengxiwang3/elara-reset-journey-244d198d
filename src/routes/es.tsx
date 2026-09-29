import { createFileRoute } from "@tanstack/react-router";
import { LandingES } from "@/components/landing/LandingES";

export const Route = createFileRoute("/es")({
  head: () => ({
    meta: [
      { title: "Elara: Un lugar para todo lo que llevas por dentro" },
      { name: "description", content: "Haz una pausa, encuentra claridad y empieza con pequeños pasos. Un camino de siete días, a tu ritmo y primero en español." },
      { property: "og:title", content: "Elara: Un lugar para todo lo que llevas por dentro" },
      { property: "og:description", content: "Haz una pausa, encuentra claridad y empieza con pequeños pasos. Un camino de siete días, a tu ritmo y primero en español." },
      { name: "twitter:title", content: "Elara: Un lugar para todo lo que llevas por dentro" },
      { name: "twitter:description", content: "Un camino de siete días para encontrar claridad, a tu ritmo y primero en español." },
    ],
  }),
  component: EsPage,
});

function EsPage() {
  return <LandingES variant="soft" />;
}
