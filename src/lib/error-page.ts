/**
 * The last-resort 500. It renders without React, without the stylesheet and
 * without the webfonts, so it hard-codes the Paper at dusk palette and falls
 * back to Georgia / system sans.
 *
 * Forest paper, soft cream type (10.9 : 1), one terracotta pill and a cream
 * outline beside it — the brand's dark-paper controls.
 */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Esta página no cargó — Elara</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: only light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background: #f6eedf;
        color: #22201c;
        font: 400 16px/1.55 "Instrument Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .field { background: #1f3a2e; color: #f3eadb; padding: 72px 20px; }
      .wrap { max-width: 40rem; margin: 0 auto; }
      .label { font-size: 12.5px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #e3a385; margin: 0; }
      h1 { font: 600 32px/1.08 "Fraunces", Georgia, serif; letter-spacing: -0.015em; margin: 12px 0 0; }
      p.body { color: rgba(243,234,219,0.78); margin: 14px 0 0; max-width: 28rem; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
      .btn {
        display: inline-flex; align-items: center; justify-content: center;
        min-height: 48px; padding: 0 24px; border-radius: 999px;
        font: 600 15px/1 inherit;
        cursor: pointer; text-decoration: none; border: 1px solid transparent;
      }
      .primary { background: #b24b26; color: #f3eadb; }
      .secondary { background: transparent; color: #f3eadb; border-color: rgba(243,234,219,0.7); }
      .btn:focus-visible { outline: 2px solid #f3eadb; outline-offset: 3px; }
    </style>
  </head>
  <body>
    <div class="field">
      <div class="wrap">
        <p class="label">Elara</p>
        <h1>Esta página no cargó.</h1>
        <p class="body">Algo falló de nuestro lado. Puedes intentarlo otra vez o volver al inicio.</p>
        <div class="actions">
          <button class="btn primary" onclick="location.reload()">Intentar otra vez</button>
          <a class="btn secondary" href="/">Ir al inicio</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
