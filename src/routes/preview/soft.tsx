import { createFileRoute } from "@tanstack/react-router";
import { LandingES } from "@/components/landing/LandingES";

export const Route = createFileRoute("/preview/soft")({
  head: () => ({
    meta: [
      { title: "Elara: Opción B" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <LandingES variant="soft" />,
});
