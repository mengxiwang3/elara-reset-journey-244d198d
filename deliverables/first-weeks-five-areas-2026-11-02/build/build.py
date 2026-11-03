# -*- coding: utf-8 -*-
"""Builds the first-week deliverables from content.py and the app's live curriculum (source-week1.json)."""
import json, html, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from content import AREAS, LOVE_W2_D6

HERE = os.path.dirname(__file__)
OUT = os.path.dirname(HERE)
SRC = {x["id"]: x for x in json.load(open(os.path.join(HERE, "source-week1.json"), encoding="utf-8"))}

FORMAT_KIND = {"Una opción": "choose", "Varias opciones": "multi", "Texto abierto": "reflect (write)",
               "Voz o texto": "reflect (say, write)", "Dibujo o texto": "reflect (draw, write)", "Lista breve": "blanks"}

def kind(fmt):
    return FORMAT_KIND.get(fmt.split(" / ")[0], fmt)

def opt_text(s):
    return s.split(":", 1)[1].strip() if ":" in s else s

def rows():
    for a in AREAS:
        for dd in a["days"]:
            sid = f'{a["code"]}-W1-D{dd["d"]}'
            src = SRC[sid]
            yield a, dd, sid, src

# ---------- JSON ----------
data = []
for a, dd, sid, src in rows():
    take_step = dict(id="take", optional=True, prompt_es=dd.get("take_proposed") or opt_text(src["es"]["opt"]),
                     prompt_status="PROPOSED" if dd.get("take_proposed") else "live")
    data.append(dict(
        area=a["app"], areaName=a["es"], week=1, day=dd["d"], curriculumId=sid,
        config=dict(purpose=dd["purpose"], takeaway=dd["takeaway"], nextBenefit=dd["next"]),
        steps=[
            dict(id="ask", kind=kind(src["format"]), question_es=src["es"]["title"], format_es=src["es"]["rest"],
                 question_status="live", guidance=dd["guidance"],
                 examples=[dict(answer=x, reply_direction=y) for x, y in dd["ex"]], avoid=dd["bad"]),
            dict(take_step, guidance="Devuelve su frase en sus palabras; si saltó el paso, propón una desde la respuesta anterior."),
        ],
        gapReturn=a["gap"], lowCapacity=a["low"], skip="Saltar termina el paso sin respuesta ni insistencia; el día se puede cerrar igual.",
        flags=[f for f in [dd.get("flag"), dd.get("take_note"), dd.get("review_note")] if f],
        safety=a.get("safety_global"),
        status="PROPOSED (all Spanish in config, guidance and examples awaits María and Alejandra)"))
json.dump(dict(source="vasantakmr/Elara tools/curriculum/curriculum-210.json (review draft 21 Oct 2026)",
               fields="config.purpose / config.takeaway / config.nextBenefit (path_day.config) and step guidance (DayConfig.guidance), as in the developer handoff of 30 Oct 2026",
               love_w2_d6=LOVE_W2_D6, days=data),
          open(os.path.join(OUT, "first-weeks.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ---------- Markdown per area ----------
for a in AREAS:
    L = [f'# {a["es"]} · semana 1: {a["week_title"]}', "",
         f'**Para qué sirve el camino:** {a["job"]}', "",
         f'**Resultado de la semana (app):** {a["week_take"]}', "",
         f'**Veredicto:** {a["verdict"]}', "",
         f'**Primer resultado útil:** día {a["first_result"]}.', "",
         f'**Volver tras una pausa:** {a["gap"]}', "",
         f'**Poca energía:** {a["low"]}', ""]
    if a.get("safety_global"):
        L += [f'**Seguridad:** {a["safety_global"]}', ""]
    L += ["Todo el texto nuevo es **PROPUESTO**. La pregunta y el formato vienen de la app (curriculum-210.json).", ""]
    for dd in a["days"]:
        sid = f'{a["code"]}-W1-D{dd["d"]}'; src = SRC[sid]
        L += [f'## Día {dd["d"]} · `{sid}`', "",
              f'- **Para qué sirve hoy:** {dd["purpose"]}',
              f'- **Pregunta (app):** {src["es"]["title"]}',
              f'- **Formato:** {src["format"]} · `{kind(src["format"])}` · {src["es"]["rest"]}',
              f'- **Paso opcional:** ' + (f'PROPUESTO: «{dd["take_proposed"]}» (app: {opt_text(src["es"]["opt"])})' if dd.get("take_proposed") else opt_text(src["es"]["opt"])),
              f'- **Guía para la respuesta de Elara:** {dd["guidance"]}']
        for i, (x, y) in enumerate(dd["ex"], 1):
            L.append(f'  - Respuesta {i}: «{x}» → {y}')
        L += [f'  - Evitar: {dd["bad"]}',
              f'- **Te llevas:** {dd["takeaway"]}',
              f'- **Próxima vez:** {dd["next"]}']
        for k, lab in (("flag", "Atención"), ("take_note", "Nota"), ("review_note", "Revisión")):
            if dd.get(k):
                L.append(f'- **{lab}:** {dd[k]}')
        L.append("")
    if a["key"] == "love":
        L += ["## Revisión de LOVE-W2-D6 (semana 2, fuera de esta semana)", "",
              f'- **App:** {LOVE_W2_D6["live"]}', f'- {LOVE_W2_D6["note"]} «{LOVE_W2_D6["proposed"]}»', ""]
    open(os.path.join(OUT, f'{a["key"]}-semana-1.md'), "w", encoding="utf-8").write("\n".join(L))

# ---------- COPY-FOR-APPROVAL ----------
C = ["# Texto nuevo para aprobar (María y Alejandra)", "",
     "Todo es PROPUESTO. Las preguntas del día no cambian (vienen del PDF del 21 oct). Cambian o se añaden: la frase «Para qué sirve hoy», «Te llevas», «Próxima vez», un paso opcional (Propósito día 1) y una redacción para LOVE-W2-D6.", ""]
for a in AREAS:
    C += [f'## {a["es"]}', "", "| Día | Para qué sirve hoy | Te llevas | Próxima vez |", "|---|---|---|---|"]
    for dd in a["days"]:
        C.append(f'| {dd["d"]} | {dd["purpose"]} | {dd["takeaway"]} | {dd["next"]} |')
    C.append("")
    for dd in a["days"]:
        if dd.get("take_proposed"):
            C += [f'- Paso opcional, día {dd["d"]}: «{dd["take_proposed"]}»', ""]
C += ["## Amor y límites · LOVE-W2-D6", "", f'- App: «{LOVE_W2_D6["live"]}»', f'- Propuesta: «{LOVE_W2_D6["proposed"]}»', "",
      "La guía de respuesta y los ejemplos son instrucciones internas para Elara; no se muestran a la usuaria, pero conviene que María revise el tono.", ""]
open(os.path.join(OUT, "COPY-FOR-APPROVAL.md"), "w", encoding="utf-8").write("\n".join(C))

# ---------- README ----------
R = ["# Primera semana para cinco caminos", "",
     "2 nov 2026. Diseño editorial para probar la primera semana de Propósito, Confianza en ti, Amor y límites, Ritmo diario y Energía, con el mismo modelo que las siete sesiones de Dinero: frase de propósito, pregunta, guía para la respuesta de Elara, «Te llevas» y «Próxima vez».", "",
     "**Fuente:** las preguntas vivas de la app (`vasantakmr/Elara`, `tools/curriculum/curriculum-210.json`, borrador del 21 oct). No se usaron las reescrituras A/B: esos archivos ya no están disponibles en este entorno.", "",
     "**Estado:** todo el texto nuevo es propuesta. Nada se publicó ni se cambió en la app.", "",
     "## Veredicto por camino", "", "| Camino | Primer resultado útil | Veredicto |", "|---|---|---|"]
for a in AREAS:
    R.append(f'| {a["es"]} | Día {a["first_result"]} | {a["verdict"]} |')
R += ["", "## Preguntas cambiadas", "",
      "- Ninguna pregunta del día cambia.",
      "- Propósito día 1: paso opcional propuesto («Escribe una pregunta pequeña que ese tema te despierta») en lugar de «pon un título».",
      f'- LOVE-W2-D6 (semana 2): redacción propuesta «{LOVE_W2_D6["proposed"]}», para recuperar la seguridad.', "",
      "## Revisión de los ítems de Amor marcados antes", "",
      "- LOVE-W1-D4 conserva «qué necesitas más»: sí.",
      "- LOVE-W1-D6 debía admitir «los dos»: la pregunta viva es abierta (dibujo o texto), así que no excluye ninguna respuesta; la guía cubre el caso.",
      "- LOVE-W2-D6 debía conservar «necesidad y seguridad»: la versión viva no nombra la seguridad (solo el paso opcional). Propuesta incluida.", "",
      "## Para desarrollo", "",
      "- `first-weeks.json`: un objeto por día con `config.purpose`, `config.takeaway`, `config.nextBenefit` y `guidance` por paso, como en el handoff del 30 oct.",
      "- Estos campos solo sirven si la respuesta diaria los recibe (cambio propuesto en `stepReply.ts`, aún no hecho en la app).",
      "- Dependencias entre días: cada día marcado con «Atención» necesita una vía con ejemplo nuevo tras una pausa.", "",
      "## Archivos", "",
      "- `first-weeks.html`: página de revisión (abrir en el navegador).",
      "- `purpose-semana-1.md`, `self-semana-1.md`, `love-semana-1.md`, `rhythm-semana-1.md`, `energy-semana-1.md`.",
      "- `first-weeks.json`, `COPY-FOR-APPROVAL.md`, `build/` (datos y generador).", ""]
open(os.path.join(OUT, "README.md"), "w", encoding="utf-8").write("\n".join(R))

# ---------- HTML ----------
e = html.escape
def area_html(a):
    h = [f'<section class="area" id="a-{a["key"]}" aria-labelledby="h-{a["key"]}">',
         f'<h2 id="h-{a["key"]}">{e(a["es"])} <span class="wk">Semana 1 · {e(a["week_title"])}</span></h2>',
         f'<p class="job">{e(a["job"])}</p>',
         f'<div class="verdict"><p><b>Veredicto.</b> {e(a["verdict"])}</p><p><b>Primer resultado útil:</b> día {a["first_result"]}. {e(a["gap"])}</p>']
    if a.get("safety_global"):
        h.append(f'<p class="safe"><b>Seguridad.</b> {e(a["safety_global"])}</p>')
    h.append('</div><ol class="days">')
    for dd in a["days"]:
        sid = f'{a["code"]}-W1-D{dd["d"]}'; src = SRC[sid]
        tk = (f'<span class="prop">Propuesto</span> {e(dd["take_proposed"])} <span class="was">App: {e(opt_text(src["es"]["opt"]))}</span>'
              if dd.get("take_proposed") else e(opt_text(src["es"]["opt"])))
        ex = "".join(f'<li><q>{e(x)}</q><span>{e(y)}</span></li>' for x, y in dd["ex"])
        flags = "".join(f'<p class="flag"><b>{lab}.</b> {e(dd[k])}</p>' for k, lab in (("flag", "Atención"), ("take_note", "Nota"), ("review_note", "Revisión")) if dd.get(k))
        h.append(f'''<li class="day"><div class="dhead"><span class="dn">Día {dd["d"]}</span><code>{sid}</code><span class="fmt">{e(src["format"].split(" / ")[0])}</span></div>
<p class="purpose">{e(dd["purpose"])}</p>
<p class="q">{e(src["es"]["title"])}</p><p class="rest">{e(src["es"]["rest"])}</p>
<dl><dt>Paso opcional</dt><dd>{tk}</dd>
<dt>Guía para Elara</dt><dd>{e(dd["guidance"])}<ul class="ex">{ex}<li class="bad"><b>Evitar:</b> {e(dd["bad"])}</li></ul></dd>
<dt>Te llevas</dt><dd>{e(dd["takeaway"])}</dd><dt>Próxima vez</dt><dd>{e(dd["next"])}</dd></dl>{flags}</li>''')
    h.append("</ol>")
    if a["key"] == "love":
        h.append(f'<p class="flag"><b>LOVE-W2-D6 (semana 2).</b> App: «{e(LOVE_W2_D6["live"])}». {e(LOVE_W2_D6["note"])} «{e(LOVE_W2_D6["proposed"])}»</p>')
    h.append("</section>")
    return "\n".join(h)

tabs = "".join(f'<a href="#{a["key"]}" data-k="{a["key"]}">{e(a["es"])}</a>' for a in AREAS)
page = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Primeras semanas Elara</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Instrument+Sans:wght@400;600&display=swap">
<style>
/* Layout: one reading column, sticky area tabs (hash routed), one card per day. */
:root{{--bg:#F2F5EE;--surface:#FFFCF6;--fg:#17241C;--mute:#46564C;--line:#D3DCCF;--forest:#2C4A3A;--terra:#B3542F;--warn:#8A6414;
--serif:'Fraunces',Georgia,serif;--sans:'Instrument Sans',system-ui,-apple-system,'Segoe UI',sans-serif;color-scheme:light}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#121A15;--surface:#1A241E;--fg:#E7EEE6;--mute:#A7B6AC;--line:#2E3C34;--forest:#9CC7AE;--terra:#E39272;--warn:#E3C273;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#121A15;--surface:#1A241E;--fg:#E7EEE6;--mute:#A7B6AC;--line:#2E3C34;--forest:#9CC7AE;--terra:#E39272;--warn:#E3C273;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 var(--sans);padding-block:24px 56px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
main{{max-width:820px;margin:0 auto;display:grid;gap:24px}}
h1,h2{{font-family:var(--serif);font-weight:600;color:var(--forest);margin:0;text-wrap:balance;line-height:1.2}}
h1{{font-size:2rem}}h2{{font-size:1.5rem}}.wk{{display:block;font:600 .85rem var(--sans);color:var(--mute);letter-spacing:.04em;margin-top:4px}}
p{{margin:0;max-width:70ch}}.lede{{color:var(--mute)}}
nav{{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);padding-block:8px;border-bottom:1px solid var(--line);display:flex;gap:6px;overflow-x:auto}}
nav a{{flex:none;min-height:44px;display:inline-flex;align-items:center;padding:0 14px;border-radius:999px;border:1px solid var(--line);color:var(--forest);font-weight:600;text-decoration:none;background:var(--surface)}}
nav a[aria-current="true"]{{background:var(--forest);color:var(--bg);border-color:var(--forest)}}
a:focus-visible{{outline:3px solid var(--terra);outline-offset:2px}}
.area{{display:grid;gap:16px}}.area[hidden]{{display:none}}
.job{{color:var(--mute)}}
.verdict{{display:grid;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px}}
.safe{{color:var(--terra)}}
.days{{list-style:none;margin:0;padding:0;display:grid;gap:14px}}
.day{{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px;display:grid;gap:8px;min-width:0}}
.dhead{{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline}}.dn{{font:600 1.1rem var(--serif);color:var(--forest)}}
.dhead code,.fmt{{font-size:.8rem;color:var(--mute)}}
.purpose{{font-weight:600}}.q{{font:600 1.08rem var(--serif)}}.rest{{color:var(--mute);font-size:.92rem}}
dl{{margin:0;display:grid;gap:4px}}dt{{font-size:.76rem;text-transform:uppercase;letter-spacing:.07em;color:var(--mute);font-weight:600;margin-top:6px}}dd{{margin:0}}
.ex{{margin:6px 0 0;padding-left:18px;display:grid;gap:6px;font-size:.94rem}}.ex q{{font-style:italic}}.ex span{{display:block;color:var(--mute)}}
.bad{{color:var(--terra)}}.flag{{color:var(--warn);font-size:.94rem}}
.prop{{font-size:.72rem;font-weight:600;border:1px solid currentColor;border-radius:999px;padding:1px 7px;color:var(--terra)}}.was{{display:block;color:var(--mute);font-size:.88rem}}
</style></head><body><main>
<header style="display:grid;gap:8px"><h1>Primeras semanas Elara</h1>
<p class="lede">Primera semana de cinco caminos con el modelo de las sesiones de Dinero. Las preguntas son las de la app (borrador del 21 oct). Todo el texto nuevo es propuesta para María y Alejandra. 2 nov 2026.</p></header>
<nav aria-label="Caminos">{tabs}</nav>
{"".join(area_html(a) for a in AREAS)}
</main>
<script>
(function(){{var keys={json.dumps([a["key"] for a in AREAS])};
function show(){{var k=(location.hash||'').slice(1);if(keys.indexOf(k)<0)k=keys[0];
keys.forEach(function(x){{document.getElementById('a-'+x).hidden=(x!==k)}});
document.querySelectorAll('nav a').forEach(function(a){{var on=a.dataset.k===k;a.setAttribute('aria-current',on?'true':'false');if(on)a.scrollIntoView({{block:'nearest',inline:'center'}})}});setTimeout(function(){{window.scrollTo(0,0)}},0);}}
window.addEventListener('hashchange',show);show();}})();
</script></body></html>'''
open(os.path.join(OUT, "first-weeks.html"), "w", encoding="utf-8").write(page)
print("ok", len(data))
