# «Anónima» in Circles: who can see the real author (22 Oct 2026)

For Kara, at her request. Read from the branch `ux/circles-clarity-2026-10-21` at `1d96cff` (read only; nothing in
the branch was changed, including its test). Line numbers are from that commit. API paths are under `apps/api/src/`.

## 1. Who can see the real author, when, and through what

The author is always stored: `topic_post.user_id` and `topic_reply.user_id` are required columns, with `anonymous` as
a separate flag ("Kept for safety review and her own lists; never sent to others when `anonymous`",
`db/schema/circleTopics.ts`, `topicPost`). What differs is who can read it.

| Who | When | What they get | Through | Refs |
|---|---|---|---|---|
| **Other members** | Never | `author: { id: null, name: null }`, shown as «Anónima» | Member endpoints (feed, circle, thread) | `services/circleTopics.ts` (`authorOf`, C3); API test `test/circle-topics.test.ts:158-160` (feed returns no author id or name) |
| **The author herself** | Always | Her own items, shown as «Tú (Anónima)» | Member endpoints, «Tu actividad» | `services/circleTopics.ts:205`, `:552-559` |
| **Any account with role `admin`** | When the item **has been reported** by a member | `targetAuthorId` (the real user id), `targetAnonymous: true`, the text and status, plus the reporter's name | `GET /api/admin/moderation/reports` (latest 100 reports) | `routes/admin/moderation.ts:32-49` (query), `:61-68` (`topicReportTargets`), `:82-90` (fields); `services/circleTopics.ts:717-740`; API test `test/circle-topics.test.ts:162-168` |
| **Named safety readers** (an admin whose email is in `SAFETY_READERS`) | When the safety screen **flagged the text at tier 1 or higher, or detection failed**. That includes posts and replies that were published normally (tier 1 is recorded but not held), not only held ones, and needs no report | The flag row: `userId` (the real author), the full text, tier, matches, `refId` (the post or reply id) and the audit trail | `GET /api/admin/safety/flags`; decided with `POST /api/admin/safety/flags/:id/resolve` (restore or remove a held item) | `routes/circleTopics.ts:149-159` (posts), `:188-194` (replies); `services/safety/index.ts:159` (`needsRecord = failed or tier >= 1`), `:271-285` (flag insert with `userId` and `content`); `routes/admin/safety.ts:27-32` (`assertReader`), `:79-90`, `:160-200`; `env.ts:113-118` |
| **Whoever receives safety alerts** (moderator email, moderator Slack; for tier 3 or failed detection also Kara's email and Slack) | When the screen gives **tier 2 or 3, or fails** (these items are held) | An email or Slack message with `User: <real user id>` and the full message text | `SAFETY_MODERATOR_EMAIL`, `SAFETY_SLACK_WEBHOOK_URL`, `SAFETY_KARA_EMAIL`, `SAFETY_T3_SLACK_WEBHOOK_URL` | `services/safety/index.ts:311-313`, `:384-404` (alert body, line 388 `["User", ctx.userId]`), `:409-427` |
| Report alerts (email, Slack) | When a member reports an item | Report id, reason, priority, target type. **No author, no text** | `services/reportAlert.ts` `messageFor` | `services/reportAlert.ts:163-176` |
| People with database or log access (engineering) | Any time | Everything stored, including `user_id` on every anonymous item | Direct D1 access; not an app endpoint | `db/schema/circleTopics.ts` |

**Who counts as admin.** `requireAdmin` checks only `user.role === "admin"` (`middleware/admin.ts:6-11`) and guards
every `/api/admin/*` route (`routes/admin/index.ts:42-54`, mounted at `index.ts:208`). The role is granted by the
bootstrap endpoint with `ADMIN_BOOTSTRAP_SECRET` (`index.ts:151-169`) or by any admin via
`POST /api/admin/users/:id/role` (`routes/admin/users.ts:165-175`). An admin can also read any user's account by id
(`GET /api/admin/users/:id`, `routes/admin/users.ts:114`), so a `targetAuthorId` resolves to a name and email.

**Not in place:** no access rule beyond the admin role for the report queue (any admin, not a named list); no log of
who read an author (the safety audit trail records decisions such as restore or remove, `safetyAction`, not reads;
the report queue records nothing); no purpose limit in code; no notice to the author. The admin web page
(`apps/admin/src/pages/Moderation.tsx`) does not display `targetAuthorId` today, but the API returns it to any admin.

**So, to the question "only when reported?": no.** The team can see the author of an anonymous item when it is
reported (any admin), when the safety screen flags it at tier 1 or more, published or held (named safety readers),
and when it is held at tier 2 or 3 or the screen fails (alert recipients), and engineering can see it at any time in
the database.

## 2. What the app copy says today (branch)

- Composer, under «Anónima»: «Las demás ven «Anónima».» (`apps/mobile/src/i18n/locales/es/circleTopics.ts:214`;
  EN "Other women see “Anonymous”.")
- Help sheet: «Cada publicación y cada respuesta muestra tu nombre o «Anónima». Tú eliges cada vez.» (`:75`)
- Before joining: «… Tú eliges si apareces con tu nombre o como «Anónima».» (`:119`)
- Nothing in the circles copy mentions the team. The guidelines (`locales/es/circle.ts`) say reports are read by a
  person and «Reportar es anónimo para quien reportas», and the report sheet says «A nadie se le dice quién
  reportó.» (`locales/es/common.ts`). Related: the admin queue shows the reporter's name to admins
  (`routes/admin/moderation.ts:38-39`, `reporterName`); the copy is true for members only.
- History: an earlier draft said «…si la reportan», then «solo para una revisión de seguridad»; both were removed on
  19 Oct 2026: "no team-access sentence is shown anywhere in the app until the rule and its logging are built and
  verified" (`docs/COPY-DRAFT-CIRCLES-V6-2.md:18`, `:209-210`).

## 3. What the test enforces

`apps/mobile/src/i18n/circleTopics.test.ts:35-40`, «anonymity copy says only what members see: her name or «Anónima»
(no team access, no logging promise)»:

- the whole `es.circleTopics` and `en.circleTopics` namespaces must not match
  `/quién la escribió|quién escribió|who wrote it|who wrote this|moderator|moderadora|auditor|audit|access log|registro de acceso|identidad/i`;
- `es.circleTopics.compose.nameAnonNote` must be exactly «Las demás ven «Anónima».» and the EN one exactly
  "Other women see “Anonymous”.".

The API side has its own test that the admin queue **does** return the author (`apps/api/test/circle-topics.test.ts:162-168`),
so the two tests together encode "the access exists, the app does not say so".

## 4. Discrepancies

1. **The copy is true but incomplete.** «Las demás ven «Anónima».» is accurate for members, and silent about the
   team, which can see the author in the three ways above. A woman choosing «Anónima» for a sensitive post is not told
   that Elara staff can identify her.
2. **Access is wider than "safety review of a report".** `docs/CIRCLE.md:349-350` (C3) says the admin report queue
   shows the author. In code, the safety flags (tier 1 and up, including published items) and the alert emails and
   Slack messages also carry the author id. Tier 1 flags exist for items nobody reported and that were never held.
3. **No rule and no log.** The 19 Oct decision made the copy wait for "the rule and its logging". Neither exists:
   any admin can read report targets, and no read is logged.
4. **"A nadie se le dice quién reportó"** is true for members; admins see the reporter's name.
5. **Database access** is unlimited for engineering, as for all data; no copy covers it (normal, but relevant if
   the copy ever says "nobody").

## 5. v2 copy (BORRADOR, pendiente de Alejandra)

Written to match what the backend does today. It states the access, does not claim any restriction that is not
built (no «solo si», no access rule, no log), and uses "por ejemplo" because the list of paths is not closed.

| Where | es | en |
|---|---|---|
| Composer, «Anónima» chosen (`v2.compose.nameAnonNote`) | Las demás ven «Anónima». El equipo de Elara puede ver quién la escribió, por ejemplo si alguien la reporta o si la revisión de seguridad la marca. | Other women see “Anonymous”. The Elara team can see who wrote it, for example if someone reports it or the safety review flags it. |
| Reply bar, «Anónima» chosen (`v2.post.replyAnonNote`) | same as above | same as above |
| Help sheet «Cómo funcionan los círculos» (`v2.help.anonymity`, added after the branch's «Cada publicación…» line) | «Anónima» oculta tu nombre a las demás mujeres, no al equipo de Elara. El equipo puede ver quién escribió algo, por ejemplo al revisar un reporte o una alerta de seguridad. | “Anonymous” hides your name from other women, not from the Elara team. The team can see who wrote something, for example when reviewing a report or a safety alert. |
| Rules, «Lo que puedes esperar» (`v2.guidelines.promises[2]`) | «Anónima» tiene un límite: Si publicas como «Anónima», las demás mujeres no ven tu nombre. El equipo de Elara sí puede ver quién lo escribió, por ejemplo al revisar un reporte o una alerta de seguridad. | “Anonymous” has a limit: If you post as “Anonymous”, other women don't see your name. The Elara team can still see who wrote it, for example when reviewing a report or a safety alert. |

The prototype keeps these in `strings.js` under `v2`, not in the branch's `circleTopics` namespace. **If moved into
the app's `circleTopics` namespace they would fail the branch test** at `circleTopics.test.ts:35`: they contain
«quién la escribió» / «quién escribió» and "who wrote it", and `nameAnonNote` would no longer equal «Las demás ven
«Anónima».». The test was not edited. An earlier v2 draft today said «el equipo de moderación … si alguien reporta
la publicación»; it was replaced because it implied the access happens only on a report and only by moderators.

## 6. Owner's options

| Option | What it means | Copy | Test |
|---|---|---|---|
| A. Keep the access as built, tell women | Adopt the v2 copy above | As in section 5 | Change `circleTopics.test.ts:35` to require the team sentence instead of forbidding it |
| B. Build a rule and a log, then tell women | For example: only named safety readers (not every admin) can see an anonymous author; only for reported or held items; every read written to an access log; a retention limit. Then decide whether alerts should carry the user id | Copy written for the rule actually built (for example "solo si alguien la reporta o la revisión de seguridad la retiene, y queda registrado") | Rewrite the test to check the agreed sentence |
| C. Collect or show less | For example: drop `User:` from alert emails and Slack, drop `userId` from tier 1 flag views, return `targetAuthorId` only on an explicit per-item reveal | Copy for the reduced access | Rewrite the test |
| D. Keep the current copy | Members-only sentence, team access unstated | Unchanged | Unchanged. Not recommended: women choosing «Anónima» are not told staff can identify them |

Whichever is chosen, legal should confirm the wording against the privacy policy, and Alejandra the Spanish.
