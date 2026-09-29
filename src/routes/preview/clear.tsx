import { createFileRoute } from "@tanstack/react-router";
import { ClearLanding } from "@/components/landing/ClearLanding";

export const Route = createFileRoute("/preview/clear")({
  head: () => ({ meta: [
    { title: "Elara: Claridad, paso a paso" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ClearLanding,
});
