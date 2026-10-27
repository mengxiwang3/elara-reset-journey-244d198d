# Elara Círculos — Claude review handoff

Snapshot: 26 October 2026. Source commit: 66e112a592ca45cadff045556d6e68fc0301af1c.

## Open this first

- `Elara_Circulos_Standalone.html`: the full interactive prototype, with images and fonts embedded. Open directly in a browser, or use it as the starting point for a single HTML artifact.
- `source/index.html`: the editable source with separate `assets/` and `fonts/`. Run `python3 -m http.server 8000 --directory source` if a local server is preferred.
- `CLAUDE_REVIEW_PROMPT.txt`: the review/build instruction to paste alongside this package.
- `REVIEW_NOTES.md`: honest implementation limits and focused verification tasks.

The standalone HTML and source directory implement the same screens. Choose ONE as the editing source. Do not edit both independently.

The private hosted prototype is https://elara-circulos-prototype-oct26.goodsnail128.chatgpt.site. The host requires the owner's sign-in, so use the included files rather than depending on that URL.

## What the product is

A Spanish-language peer community within Elara. Women can join topic circles, share a question or experience, reply to a particular woman, connect with her, and send a private message request. The intended feeling is a warm, readable community with the scanning efficiency of a compact forum.

## Agreed design decisions — preserve these

1. Compact first. Body text 14 px, feed titles 15 px, page headings 20 px, thread title 17 px in standard mode. Keep the optional large-text preview available.
2. Use spacing, font weight, dividers and muted color for hierarchy. Do not solve hierarchy by enlarging headings.
3. Preserve the iPhone presentation and the Elara cream/forest palette, Instrument Sans and Fraunces assets. The app primarily uses the sans font for compact reading.
4. Keep women's profile photos. These are AI-generated fictional demo portraits, not beta testers. Do not replace anonymous identities with photos.
5. Do NOT restore area-of-life illustrations or topic photographs. The user explicitly found them excessive. Circle names and subtle color accents are enough.
6. No large featured post, torn-paper feed cards, dashboard grid, public reply counts on feed rows, or repeated answer previews on every row.
7. Circle-name shortcuts always open their circle. The personal new-reply notice is a separate action.
8. Keep `Mis círculos`, `Descubrir`, and `Mensajes` as sections within Círculos. Do not add a sixth global navigation item.
9. Profiles open from a named author's photo or name. Keep `Conectar`, private `Mensaje`, and public `Responder` distinct.
10. Anonymous posts do not expose a member profile or private message action.
11. Posting from home requires explicitly choosing a destination circle. Posting from inside a circle can preselect that circle. Keep the named/anonymous choice and preserve drafts.
12. Preserve complete reply branches and correct reply targeting. Never remove a reply's children when highlighting or sorting it.
13. Spanish copy remains a draft for Alejandra to review.

## How to explore

- Use `1 · Mis círculos` to browse, open a circle, or select `Descubrir`.
- Click a woman's name/photo → profile → `Conectar` or `Mensaje`.
- `Mensajes` contains `Chats` and `Conexiones`; `Nuevo` lists sample participants.
- Lucía is a pre-existing example connection with one seeded example incoming message.
- Messaging someone new creates a request. After the first message, further sending is disabled while it is pending. No automatic acceptance or fake reply is generated.
- `Publicar` opens the public composer. In a thread, `Responder` targets that comment and `Cancelar` returns to a top-level response.
- `320 px` and `Texto grande` test the preview's narrow/large-text modes.
- `Restablecer demo` clears this prototype's saved data in the browser.

## Privacy and behavior

This is a browser-local prototype using localStorage. Posts, replies, connections, messages, block states and drafts do not reach other people. There is no authentication, server database, real message delivery, moderation service, connection acceptance service, or push notification system. Seeded personal activity and incoming messages are examples. Do not present any simulated behavior as production-ready functionality.
