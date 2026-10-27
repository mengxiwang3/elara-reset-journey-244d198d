# Review notes and implementation limits

## Evidence already gathered

The latest build was syntax-checked and visually inspected in a Chromium preview. During development, browser interactions checked circle entry, public posting, named/anonymous selection, explicit destination selection, draft preservation across reactions, correct reply attachment, member profile opening, connection-request state, private request creation, inbox persistence, and a pending request disabling follow-up sending. Narrow-view measurements found no horizontal overflow in the tested 320 px screens. The last messaging update was checked at 320 px. These are scoped checks, not a comprehensive test suite or real-phone validation.

## Specific issues Claude should assess

1. **Prototype architecture.** The HTML accumulated CSS overrides and multiple event listeners over iterations. The older modal composer remains as dead/legacy code behind a newer capturing handler. Refactor carefully; a renderer that rebuilds innerHTML can lose focus and scroll context even though text drafts are saved. Some app controls have small visible areas; measure actual hit targets rather than assuming they are all 44 px.
2. **State and navigation.** Back navigation does not comprehensively restore prior feed scroll positions. The toolbar mode indicator is a demo control and does not always match the deeper in-app route. A composer draft persists, but reopening from home intentionally clears its destination; assess whether restoring a previously chosen destination would be less confusing without silently choosing one on a new post.
3. **Membership and profiles.** The New Message directory currently collects sample names across all fixture posts, rather than filtering strictly to joined circles. Connection state supports a seeded accepted connection and outgoing pending/cancelled requests; real incoming acceptance/decline is not implemented. Connections cannot yet be removed once accepted. Shared-circle calculation only examines direct replies, so deeper participation may be omitted.
4. **Messaging.** There is no real recipient, delivery, read receipt, incoming-message stream or acceptance workflow. Request status and blocking are local flags. A blocked chat retains its local history. Production needs recipient-controlled requests, authenticated identity, authorization, rate limits and moderation flows designed with the team; do not infer that these already exist.
5. **Anonymous identity.** Anonymous authors are not linked to a profile. That UI rule does not constitute a server-side anonymity guarantee. Several named fixture replies still use initials where no portrait was assigned. Profile data is intentionally minimal and sample-based.
6. **Ranking and chronology.** `Más útiles` uses local sample scores even though public numeric badges were removed. `Nuevas` orders root replies by fixture IDs/timestamps rather than real server dates; children retain branch order. Relative timestamps are fixed demo strings. Do not present these as a production ranking/notification system.
7. **Privacy wording.** The composer says Elara chats and personal responses are not shared into circles. The prototype contains no integration with those systems. Verify production data boundaries before retaining that statement in a real app. No encryption or complete anonymity claim is warranted from this prototype.
8. **Visual completeness.** Circle artwork was deliberately removed; empty circleArt helpers and old CSS may remain. Do not reintroduce it. Preserve the small photos, quiet colors and dense text layout. Help and some non-Círculos global navigation items are demo explanations, not fully implemented destinations.
9. **Accessibility/device coverage.** Real iOS keyboard behavior, VoiceOver, TalkBack, OS Dynamic Type, reduced-motion behavior, focus restoration after every render, contrast of every muted label and actual screen-reader reading order still require testing. A browser iPhone frame is not a native iOS app.

## Focused manual checks

- First-use home: can she find a conversation and the writing action immediately?
- Tap circle name vs personal reply notice: do the destinations match their labels?
- Draft a public reply → react/sort/collapse → verify draft and recipient survive.
- Reply to a nested comment → check the saved message is under the selected parent.
- Start public post from home → publish disabled until circle selected; selecting circle preserves text.
- Select anonymous → post → no identifying profile link appears on that anonymous author.
- Open named profile → request connection → confirm pending/cancel behavior.
- Open private request → send one message → pending disables additional sending.
- Open Lucía's seeded accepted chat → send a message → revisit/reload → history persists locally.
- Save a private draft → navigate away → return → draft persists independently of public reply drafts.
- Block messages → confirm sending is disabled; unblock → inspect restored behavior.
- Narrow/large-text views: verify no content obscured by footer or keyboard; keep compact standard mode as default.

## Asset notes

Profile photos are AI-generated fictional portraits for sample participants. They are not testimonials or actual users. Fonts were supplied in the user's earlier prototype archives. Interface SVGs come from Phosphor Icons. Unused topic image files were excluded from this handoff because the user rejected that visual direction.
