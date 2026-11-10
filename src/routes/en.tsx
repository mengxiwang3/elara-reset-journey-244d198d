import { createFileRoute } from "@tanstack/react-router";
import { HomeV4, homeHead } from "@/components/home/HomeV4";

export const Route = createFileRoute("/en")({
  head: () => homeHead("en"),
  component: EnPage,
});

function EnPage() {
  return <HomeV4 lang="en" />;
}
