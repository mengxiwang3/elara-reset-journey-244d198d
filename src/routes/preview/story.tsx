import { createFileRoute } from "@tanstack/react-router";
import { LandingES } from "@/components/landing/LandingES";

export const Route = createFileRoute("/preview/story")({
  head: () => ({ meta: [
    { title: "Elara: Opción C" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <LandingES variant="story" />,
});
