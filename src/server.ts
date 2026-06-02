import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleSubscribe } from "./lib/subscribe";
import type { Env } from "./lib/subscribe";
import { handleAdmin } from "./lib/admin";
import type { AdminEnv } from "./lib/admin";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname === "/api/subscribe") {
      return handleSubscribe(request, env as Env);
    }
    if (url.pathname === "/admin") {
      return handleAdmin(request, env as AdminEnv);
    }

    // Language routing for the root: Spanish is the primary market, so
    // Spanish-preferring browsers (or anyone who chose ES) land on /es.
    // An explicit choice is remembered via the elara_lang cookie, set by the
    // nav toggle — so this never fights a user who picked a language.
    if (request.method === "GET" && url.pathname === "/") {
      const cookie = request.headers.get("Cookie") ?? "";
      const pref = cookie.match(/(?:^|;)\s*elara_lang=(es|en)\b/)?.[1];
      let preferSpanish: boolean;
      if (pref === "es") preferSpanish = true;
      else if (pref === "en") preferSpanish = false;
      else {
        const first = (request.headers.get("Accept-Language") ?? "")
          .split(",")[0]
          .trim()
          .toLowerCase();
        preferSpanish = first.split("-")[0] === "es";
      }
      if (preferSpanish) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/es" + url.search,
            "Cache-Control": "no-store",
            Vary: "Accept-Language, Cookie",
          },
        });
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
