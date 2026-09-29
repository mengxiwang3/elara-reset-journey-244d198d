# September 2026 website brand application

Source: `ELARA Brand System - September 2026.pdf`, supplied by the project owner.

Both landing-page languages use the same brand tokens and components:

- Ground #F9F5EF, white cards, nested fields #FAF6F0, hairlines #E8E0D5.
- Ink #1A1615 and secondary text #635A54.
- Forest #133226 for the community surface, with mint #A3E5C7 accents.
- Terracotta #E65A28 for signal; the source's accessible variants #C94A1C for white-label buttons and #B8441A for text.
- Instrument Sans, the source's first recommended substitute. The original app typeface is not identified in the PDF.
- Sans headings and marketing copy; retired Cormorant/Caveat fonts, serif italics, grain, and heavy shadows removed.
- 52px pill actions, 44px outlined header action, 16px card and 12px field radii; restrained peach wash at arrival and signup.
- A 28px Elara avatar uses a white well and a 0.44× gold sphere, without a ring or dot at this size.

`public/elara-mark.svg` is a new scalable interpretation of the described forest disc with gold starburst, not an extracted official vector. Review its geometry against a master logo if one becomes available. It appears in the wordmark and favicon; the orb is not used as the brand logo.

The five supplied screenshot files are used unchanged. Brand inconsistencies baked into those raster exports are outside this website styling change.

## Preview

Run `npm ci` and `npm run dev -- --host 127.0.0.1 --port 4173`. Open `/es` for Spanish or `/` for English in the local development server.

Production build succeeds. Full TypeScript checking reports an existing implicit-any parameter in `src/lib/error-capture.ts:13`, which this change does not modify. Browser visual inspection could not be completed because the browser tool could not verify its required security policy.

Review follow-up: scoped brand styles now share Tailwind's utilities layer so higher-specificity brand rules reliably override utility defaults. Full navigation begins at desktop width to avoid crowding tablet headers. Avatar initials use neutral sans-serif styling instead of legacy gold/brown gradients, and decorative founder glows are removed. GitHub reported a failed Cloudflare Workers build for commit `023ab61`; the check provides only a dashboard link, not error logs, so the hosted-build cause remains unverified.
