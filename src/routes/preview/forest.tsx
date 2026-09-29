import { createFileRoute } from "@tanstack/react-router";
import { LandingES } from "@/components/landing/LandingES";

export const Route = createFileRoute("/preview/forest")({
  head: () => ({ meta: [
    { title: "Elara: Verde profundo" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <LandingES variant="soft" colorway="forest" />,
});
