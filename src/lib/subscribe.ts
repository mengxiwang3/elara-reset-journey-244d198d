export interface Env {
  DB: D1Database;
  LOOPS_API_KEY?: string;
}

interface SubscribePayload {
  name?: unknown;
  email?: unknown;
  whatsapp?: unknown;
  instagram?: unknown;
  pain?: unknown;
  language?: unknown;
}

export async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: SubscribePayload;
  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const whatsapp = typeof payload.whatsapp === "string" && payload.whatsapp.trim() ? payload.whatsapp.trim() : null;
  const instagram = typeof payload.instagram === "string" && payload.instagram.trim() ? payload.instagram.trim() : null;
  const pain = typeof payload.pain === "string" && payload.pain.trim() ? payload.pain.trim() : null;
  const language = typeof payload.language === "string" && ["en", "es"].includes(payload.language) ? payload.language : "en";

  if (!name || !email) {
    return Response.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO subscribers (name, email, whatsapp, instagram, pain, language)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(name, email, whatsapp, instagram, pain, language)
      .run();
  } catch (e) {
    console.error("D1 error:", e);
    return Response.json({ error: "Database error" }, { status: 500 });
  }

  if (env.LOOPS_API_KEY) {
    try {
      await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.LOOPS_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          firstName: name,
          source: "elara-waitlist",
          userGroup: "waitlist",
          language,
          ...(whatsapp && { whatsapp }),
          ...(instagram && { instagram }),
          ...(pain && { pain }),
        }),
      });
    } catch (e) {
      console.error("Loops error:", e);
    }
  }

  return Response.json({ success: true });
}
