import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="on-field bg-forest px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="e-label text-cream-72">Elara</p>
          <h1 className="e-h1 mt-2">Esta página no existe.</h1>
          <p className="e-body mt-3 max-w-md">
            El enlace puede haber cambiado, o quizá nunca estuvo aquí. Volvamos a un lugar
            conocido.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/" className="e-btn e-btn--onfield">
              Ir al inicio
            </Link>
            <a href="mailto:hola@holaelara.com" className="e-btn e-btn--ghostfield">
              Escríbenos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream">
      <div className="on-field bg-forest px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="e-label text-cream-72">Elara</p>
          <h1 className="e-h1 mt-2">Esta página no cargó.</h1>
          <p className="e-body mt-3 max-w-md">
            Algo falló de nuestro lado. Puedes intentarlo otra vez o volver al inicio.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="e-btn e-btn--onfield"
            >
              Intentar otra vez
            </button>
            <a href="/" className="e-btn e-btn--ghostfield">
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Primary
      { title: "Elara · Claridad en español para la mujer que sostiene todo" },
      { name: "description", content: "Elara es tu compañera de IA en español: te ayuda a ver dónde estás, qué está pidiendo atención y cuál es tu siguiente paso pequeño. Creada con Alejandra. Únete a la lista de espera." },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://holaelara.com/" },
      { property: "og:site_name", content: "Elara" },
      { property: "og:title", content: "Elara · Claridad en español para la mujer que sostiene todo" },
      { property: "og:description", content: "Tu compañera de IA en español. Únete a la lista de espera." },
      // TODO: og-image.jpg doesn't exist yet — design and export a real 1200×630 image
      // (photo of Ale + wordmark) and host it at this path before sharing links publicly.
      { name: "theme-color", content: "#F6EEDF" },
      { property: "og:image", content: "https://holaelara.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "es_MX" },
      { property: "og:locale:alternate", content: "en_US" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Elara · Claridad en español para la mujer que sostiene todo" },
      { name: "twitter:description", content: "Tu compañera de IA en español. Únete a la lista de espera." },
      { name: "twitter:image", content: "https://holaelara.com/og-image.jpg" },
      // twitter:site / twitter:creator intentionally omitted — no confirmed Elara/Ale handle yet
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        // Paper at dusk §03: Fraunces 600 edits (titles, numbers, wordmark),
        // Fraunces italic 400 is Elara speaking, Instrument Sans does the
        // quiet work. opsz lets Fraunces tighten at display sizes.
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Instrument+Sans:wght@400;500;600&display=swap",
      },
      // The painted orb is the app icon and avatar (Paper at dusk §01).
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/favicon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "alternate", hrefLang: "es", href: "https://holaelara.com/" },
      { rel: "alternate", hrefLang: "en", href: "https://holaelara.com/en" },
      { rel: "alternate", hrefLang: "x-default", href: "https://holaelara.com/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const lang = path === "/en" || path.startsWith("/en/") ? "en" : "es";
  return (
    <html lang={lang}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
