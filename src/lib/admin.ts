import type { Env as SubscribeEnv } from "./subscribe";

export interface AdminEnv extends SubscribeEnv {
  ADMIN_PASSWORD?: string;
}

interface SubscriberRow {
  id: number;
  name: string;
  email: string;
  whatsapp: string | null;
  instagram: string | null;
  pain: string | null;
  language: string;
  created_at: string;
}

const ADMIN_USER = "admin";

/** Constant-time string comparison to avoid auth timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function unauthorized(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Elara Admin", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function checkAuth(request: Request, password: string): boolean {
  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep === -1) return false;
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);
  return safeEqual(user, ADMIN_USER) && safeEqual(pass, password);
}

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Guard against CSV formula injection in spreadsheet apps. */
function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

async function fetchSubscribers(env: AdminEnv): Promise<SubscriberRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, name, email, whatsapp, instagram, pain, language, created_at
     FROM subscribers
     ORDER BY created_at DESC, id DESC`,
  ).all<SubscriberRow>();
  return results ?? [];
}

function toCsv(rows: SubscriberRow[]): string {
  const header = ["id", "name", "email", "whatsapp", "instagram", "pain", "language", "created_at"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [r.id, r.name, r.email, r.whatsapp, r.instagram, r.pain, r.language, r.created_at]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\r\n");
}

function fmtDate(iso: string): string {
  // D1 stores UTC "YYYY-MM-DD HH:MM:SS"; render readable UTC.
  if (!iso) return "";
  return iso.replace("T", " ").replace("Z", "") + " UTC";
}

function renderPage(rows: SubscriberRow[]): string {
  const total = rows.length;
  const es = rows.filter((r) => r.language === "es").length;
  const en = total - es;

  const body =
    total === 0
      ? `<tr><td colspan="8" class="empty">No signups yet. Submissions will appear here.</td></tr>`
      : rows
          .map(
            (r, i) => `<tr>
      <td class="num">${total - i}</td>
      <td class="date">${escapeHtml(fmtDate(r.created_at))}</td>
      <td>${escapeHtml(r.name)}</td>
      <td><a href="mailto:${escapeHtml(r.email)}">${escapeHtml(r.email)}</a></td>
      <td>${escapeHtml(r.whatsapp)}</td>
      <td>${
        r.instagram
          ? `<a href="https://instagram.com/${escapeHtml(String(r.instagram).replace(/^@/, ""))}" target="_blank" rel="noreferrer">${escapeHtml(r.instagram)}</a>`
          : ""
      }</td>
      <td class="pain">${escapeHtml(r.pain)}</td>
      <td><span class="lang lang-${escapeHtml(r.language)}">${escapeHtml(r.language)}</span></td>
    </tr>`,
          )
          .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Elara — Waitlist Admin</title>
<style>
  :root {
    --bg: #faf6ef; --card: #fffdf9; --ink: #2a2018; --muted: #8a7d6e;
    --line: #e7ded0; --accent: #b5623f; --gold: #c79a4e;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; }
  header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; }
  h1 {
    font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600;
    font-size: 40px; margin: 0; letter-spacing: -0.02em;
  }
  h1 .dot { color: var(--accent); }
  .sub { color: var(--muted); margin: 4px 0 0; font-size: 14px; }
  .stats { display: flex; gap: 28px; }
  .stat .n { font-family: "Cormorant Garamond", Georgia, serif; font-size: 30px; line-height: 1; }
  .stat .l { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin-top: 4px; }
  .actions { margin: 24px 0; display: flex; gap: 12px; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
    background: var(--ink); color: var(--bg); padding: 10px 18px; border-radius: 10px;
    font-size: 14px; font-weight: 500; border: none; cursor: pointer;
  }
  .btn.secondary { background: transparent; color: var(--ink); border: 1px solid var(--line); }
  .tablewrap { background: var(--card); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px -24px rgba(80,50,30,0.25); }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); background: #f4ecdf; position: sticky; top: 0; }
  tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #f9f3e9; }
  td a { color: var(--accent); text-decoration: none; }
  td a:hover { text-decoration: underline; }
  .num { color: var(--muted); font-variant-numeric: tabular-nums; }
  .date { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .pain { max-width: 280px; color: #5b4f42; }
  .empty { text-align: center; color: var(--muted); padding: 48px 16px; }
  .lang { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--line); }
  .lang-es { color: var(--accent); border-color: var(--accent); }
  .lang-en { color: var(--gold); border-color: var(--gold); }
  @media (max-width: 640px) { .pain, .date { display: none; } h1 { font-size: 32px; } }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>elara<span class="dot">.</span> waitlist</h1>
        <p class="sub">Founding signups, newest first.</p>
      </div>
      <div class="stats">
        <div class="stat"><div class="n">${total}</div><div class="l">Total</div></div>
        <div class="stat"><div class="n">${es}</div><div class="l">Español</div></div>
        <div class="stat"><div class="n">${en}</div><div class="l">English</div></div>
      </div>
    </header>
    <div class="actions">
      <a class="btn" href="/admin?format=csv">↓ Download CSV</a>
      <a class="btn secondary" href="/admin">↻ Refresh</a>
    </div>
    <div class="tablewrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Joined</th><th>Name</th><th>Email</th>
            <th>WhatsApp</th><th>Instagram</th><th>What's loudest</th><th>Lang</th>
          </tr>
        </thead>
        <tbody>
${body}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

export async function handleAdmin(request: Request, env: AdminEnv): Promise<Response> {
  // Never expose data if no password is configured.
  if (!env.ADMIN_PASSWORD) {
    return new Response("Admin is not configured. Set the ADMIN_PASSWORD secret.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (!checkAuth(request, env.ADMIN_PASSWORD)) {
    return unauthorized();
  }

  let rows: SubscriberRow[];
  try {
    rows = await fetchSubscribers(env);
  } catch (e) {
    console.error("Admin D1 error:", e);
    return new Response("Database error", { status: 500 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("format") === "csv") {
    return new Response(toCsv(rows), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="elara-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
        "cache-control": "no-store",
      },
    });
  }

  return new Response(renderPage(rows), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
