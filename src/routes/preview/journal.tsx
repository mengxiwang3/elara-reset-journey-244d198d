import { createFileRoute } from "@tanstack/react-router";
import { JournalLanding } from "@/components/landing/JournalLanding";

export const Route = createFileRoute("/preview/journal")({
  head: () => ({ meta: [
    { title: "Elara: Una historia más personal" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: JournalLanding,
});
