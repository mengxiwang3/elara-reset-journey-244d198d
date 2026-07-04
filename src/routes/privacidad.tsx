import { createFileRoute } from "@tanstack/react-router";
import { Privacidad } from "@/components/legal/Privacidad";

export const Route = createFileRoute("/privacidad")({
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return <Privacidad />;
}
