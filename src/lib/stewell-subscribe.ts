export interface StewellEnv {
  DB: D1Database;
  STEWELL_LOOPS_API_KEY?: string;
}

interface StewellPayload {
  name?: unknown;
  email?: unknown;
}

export async function handleStewellSubscribe(request: Request, env: StewellEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: StewellPayload;
  try {
    payload = (await request.json()) as StewellPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!name || !email) {
    return Response.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (name.length > 80) {
    return Response.json({ error: "Name is too long" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO stewell_subscribers (name, email) VALUES (?, ?)`,
    )
      .bind(name, email)
      .run();
  } catch (e) {
    console.error("D1 error:", e);
    return Response.json({ error: "Database error" }, { status: 500 });
  }

  if (env.STEWELL_LOOPS_API_KEY) {
    try {
      await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.STEWELL_LOOPS_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          firstName: name,
          source: "stewell-waitlist",
          userGroup: "stewell-waitlist",
        }),
      });
    } catch (e) {
      console.error("Loops error:", e);
    }
  }

  return Response.json({ success: true });
}
