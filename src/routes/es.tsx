import { createFileRoute } from "@tanstack/react-router";
import { LandingES } from "@/components/landing/LandingES";

export const Route = createFileRoute("/es")({
  component: EsPage,
});

function EsPage() {
  return <LandingES />;
}
