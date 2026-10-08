import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old Spanish URL. Spanish now lives at the root; the Worker also 301s this. */
export const Route = createFileRoute("/es")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
