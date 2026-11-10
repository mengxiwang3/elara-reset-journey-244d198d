# Review branch: new homepage inside the site

Not deployed. This branch is `main` plus the changes below. Run `npm ci && npm run dev`.

## What changed
- `/` and `/en` render the new interactive homepage (`src/components/home/HomeV4.tsx`). The page body is server-rendered in the right language; its behaviour is in plain scripts under `public/home/`.
- The waitlist form is inside the page (`WaitlistV4.tsx`): same fields, honeypot, validation, `/api/subscribe` payload, error text, consent sentence and privacy link as `components/landing/Waitlist.tsx`. `src/lib/subscribe.ts` and `src/server.ts` are untouched.
- `/nosotras` is new (founders).
- `/terms-and-conditions`, `/support`, `/request-account-deletion` are restored. They are live on holaelara.com but their source was never committed, so `main` would have removed them on the next deploy. The markup here is the deployed page captured on 10 Nov 2026 (Spanish and English, `#en` switches). Two missing CSS rules were copied from the live stylesheet.
- `public/robots.txt` and `public/sitemap.xml` now match the live site; the sitemap also lists `/nosotras`.
- Unchanged: `/privacidad`, `/privacy`, `/es` redirect, `/admin`, the 404 page, the old landing components (kept in the repo, no longer routed).

## Verified locally (Chromium, `vite dev`)
- All routes answer: `/`, `/en`, `/es` (301), `/nosotras`, `/privacidad`, `/privacy`, the three legal pages, `sitemap.xml`, `robots.txt`; unknown paths give the 404 page.
- Signup: empty and invalid input blocked; a server error shows the error message and no success; a 200 shows the success state and the optional questions; the payload equals the live form's.
- The real database write could not be exercised: the local dev server has no D1 binding, so `/api/subscribe` answers 500 locally. The handler code is unchanged. Test one real signup on a Cloudflare preview before going live.
- ES/EN buttons navigate between `/` and `/en` and keep the demo state.

## Before deploying
- Replace the three captured legal pages with their original source from the machine they were deployed from, or confirm the captures are acceptable.
- The homepage copy outside the Kioto example is draft; English is draft.
- Decide whether the old landing components should be deleted.
