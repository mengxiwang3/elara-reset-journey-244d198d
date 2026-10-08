import { createFileRoute } from "@tanstack/react-router";
import { LandingES } from "@/components/landing/LandingES";

/** The root is Spanish for everyone. English lives at /en. */
export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://holaelara.com/" }],
  }),
  component: Index,
});

function Index() {
  return <LandingES />;
}
