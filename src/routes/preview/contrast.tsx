import { createFileRoute } from "@tanstack/react-router";
import { LandingES } from "@/components/landing/LandingES";

export const Route = createFileRoute("/preview/contrast")({
  head: () => ({ meta: [
    { title: "Elara: Verde, crema y naranja" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <LandingES variant="soft" colorway="contrast" />,
});
