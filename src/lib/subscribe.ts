export interface Env {
  DB: D1Database;
  LOOPS_API_KEY?: string;
}

interface SubscribePayload {
  followupToken?: unknown;
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

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if ("followupToken" in payload) {
    if (typeof payload.followupToken !== "string" || !/^[a-f0-9]{64}$/.test(payload.followupToken)) {
      return Response.json({ error: "Invalid follow-up session" }, { status: 400 });
    }
    const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) || null : null;
    try {
      const result = await env.DB.prepare(`UPDATE subscribers SET whatsapp = ?, instagram = ?, pain = ?
        WHERE email = (SELECT email FROM subscriber_followups WHERE token = ? AND expires_at > ?)`)
        .bind(clean(payload.whatsapp, 30), clean(payload.instagram, 60), clean(payload.pain, 200), payload.followupToken, Date.now()).run();
      if (!result.meta.changes) return Response.json({ error: "La sesión ha caducado. Tu lugar en la lista sigue guardado." }, { status: 410 });
      await env.DB.prepare("DELETE FROM subscriber_followups WHERE token = ?").bind(payload.followupToken).run();
      return Response.json({ success: true });
    } catch {
      return Response.json({ error: "No pudimos guardar las respuestas. Tu lugar en la lista sigue guardado." }, { status: 500 });
    }
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

  let followupToken: string | undefined;
  try {
    const inserted = await env.DB.prepare(
      `INSERT OR IGNORE INTO subscribers (name, email, whatsapp, instagram, pain, language)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(name, email, whatsapp, instagram, pain, language)
      .run();
    // Only a newly inserted subscriber can edit optional details in this session.
    // Re-entering someone else's email must never grant access to their record.
    if (inserted.meta.changes) {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
      try {
        await env.DB.prepare("INSERT INTO subscriber_followups (token, email, expires_at) VALUES (?, ?, ?)")
          .bind(token, email, Date.now() + 3600000).run();
        followupToken = token;
        await env.DB.prepare("DELETE FROM subscriber_followups WHERE expires_at <= ?").bind(Date.now()).run();
      } catch {
        // Optional questions must never prevent a successful signup.
        console.error("Could not create optional follow-up session");
      }
    }
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

  return Response.json({ success: true, ...(followupToken && { followupToken }) }, { headers: { "Cache-Control": "no-store" } });
}
