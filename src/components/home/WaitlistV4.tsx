import { useState } from "react";
import { COPY } from "@/components/landing/Waitlist";

/**
 * The waitlist form inside the new homepage.
 *
 * Same fields, validation, honeypot, endpoint (/api/subscribe), payload, error text, consent
 * sentence and privacy link as components/landing/Waitlist.tsx. Only the markup and styling differ.
 */
export function WaitlistV4({ lang }: { lang: "es" | "en" }) {
  const t = COPY[lang];
  const [submitted, setSubmitted] = useState(false);
  const [extrasState, setExtrasState] = useState<"idle" | "saving" | "saved" | "skipped">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", instagram: "", pain: "", website: "" });

  async function post(extra: { whatsapp?: string; instagram?: string; pain?: string }) {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        ...extra,
        language: lang,
        website: form.website,
      }),
    });
    if (!res.ok) throw new Error();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError(false);
    try {
      await post({});
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function onExtras(e: React.FormEvent) {
    e.preventDefault();
    const extra = {
      whatsapp: form.whatsapp.trim() || undefined,
      instagram: form.instagram.trim() || undefined,
      pain: form.pain || undefined,
    };
    if (!extra.whatsapp && !extra.instagram && !extra.pain) return setExtrasState("skipped");
    setExtrasState("saving");
    try {
      await post(extra);
      setExtrasState("saved");
    } catch {
      setExtrasState("idle");
      setError(true);
    }
  }

  const errorLine = error && (
    <p className="err" role="alert">
      {t.error} <a href="mailto:hola@holaelara.com">hola@holaelara.com</a>
    </p>
  );

  return (
    <div className="join wl">
      <h2>
        {lang === "es" ? "Tu próxima parada: " : "Your next stop: "}
        <em>{lang === "es" ? "algo para ti." : "something for you."}</em>
      </h2>

      {submitted ? (
        <div className="wl" role="status">
          <p className="done">{t.doneTitle}</p>
          <p>{t.doneBody}</p>
          {extrasState === "saved" && <p>{t.extrasSaved}</p>}
          {(extrasState === "idle" || extrasState === "saving") && (
            <form onSubmit={onExtras} className="extras">
              <p>
                <b>{t.extrasTitle}</b> {t.extrasBody}
              </p>
              <label>
                <span>
                  {t.whatsapp} <small>{t.optional}</small>
                </span>
                <input
                  id="wl-whatsapp"
                  maxLength={30}
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+1 555 000 0000"
                />
              </label>
              <label>
                <span>
                  {t.instagram} <small>{t.optional}</small>
                </span>
                <input
                  id="wl-instagram"
                  maxLength={60}
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@usuario"
                />
              </label>
              <label>
                <span>
                  {t.pain} <small>{t.optional}</small>
                </span>
                <select id="wl-pain" value={form.pain} onChange={(e) => setForm({ ...form, pain: e.target.value })}>
                  <option value="">{t.painPlaceholder}</option>
                  {t.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              {errorLine}
              <div className="row">
                <button type="submit" disabled={extrasState === "saving"} className="btn small">
                  {extrasState === "saving" ? t.loading : t.extrasSave}
                </button>
                <button type="button" className="skip-x" onClick={() => setExtrasState("skipped")}>
                  {t.extrasSkip}
                </button>
              </div>
            </form>
          )}
          <p className="fine">
            {t.followBefore}
            <a href="https://instagram.com/holaelara" target="_blank" rel="noreferrer">
              Instagram
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="wl">
          {/* Honeypot: people never see it; bots fill it. */}
          <div aria-hidden="true" className="hp">
            <label>
              Website
              <input
                type="text"
                name="hp_check"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>
          </div>
          <label>
            {t.name}
            <input
              id="wl-name"
              required
              maxLength={80}
              autoComplete="given-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.namePlaceholder}
            />
          </label>
          <label>
            {t.email}
            <input
              id="wl-email"
              required
              type="email"
              maxLength={120}
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t.emailPlaceholder}
            />
          </label>
          {errorLine}
          <button type="submit" disabled={loading} className="btn primary">
            {loading ? t.loading : t.submit}
          </button>
          <p className="fine">
            {t.note} {t.privacy}
          </p>
          <p className="fine">
            {t.consentBefore}
            <a href={t.consentHref}>{t.consentLink}</a>.
          </p>
        </form>
      )}
    </div>
  );
}
