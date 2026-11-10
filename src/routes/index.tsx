import { createFileRoute } from "@tanstack/react-router";
import { HomeV4, homeHead } from "@/components/home/HomeV4";

/** The root is Spanish for everyone. English lives at /en. */
export const Route = createFileRoute("/")({
  head: () => homeHead("es"),
  component: Index,
});

function Index() {
  return <HomeV4 lang="es" />;
}
