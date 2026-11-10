import { createFileRoute } from "@tanstack/react-router";
import { LegalSnapshot } from "@/components/legal/LegalSnapshot";
import html from "@/components/legal/snapshots/request-account-deletion.html?raw";

const TITLE = "Eliminar tu cuenta · Elara";

export const Route = createFileRoute("/request-account-deletion")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "How to delete your Hola Elara account, what is deleted and what may be kept." },
      { property: "og:title", content: TITLE },
      { property: "og:url", content: "https://holaelara.com/request-account-deletion" },
    ],
    links: [{ rel: "canonical", href: "https://holaelara.com/request-account-deletion" }],
  }),
  component: DeletionPage,
});

function DeletionPage() {
  return <LegalSnapshot html={html} />;
}
