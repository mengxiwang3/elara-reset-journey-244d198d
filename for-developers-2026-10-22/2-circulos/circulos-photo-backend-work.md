# Circles v2: backend work before photos (and the other v2 proposals) can ship

For Kara. Written 22 Oct 2026 from the branch `ux/circles-clarity-2026-10-21` at `1d96cff` (read only). The v2
prototype **simulates** photo upload: a chosen file is shown from a local object URL in the browser and is never sent
anywhere. Nothing below exists yet unless it says "exists".

## 1. What the branch has today (verified)

**Circle posts have no photo support.**

- `apps/api/src/db/schema/circleTopics.ts` (`topicPost`): columns are id, topicId, sectionId, userId, kind, title,
  body, anonymous, status, clientKey, createdAt. No photo, media or attachment column; `topicReply` likewise.
- `apps/api/src/routes/circleTopics.ts`: no upload route and no photo field on the create-post body.
- `apps/mobile/app/topic-compose.tsx`: no picker, no attachment state.

**Pieces that exist elsewhere and can be reused:**

| Piece | Where | Reuse for circles |
|---|---|---|
| Picking and re-encoding | `apps/mobile/src/lib/imagePicker.ts` `pickPracticePhoto` (camera or library, permission "denied" kept apart from "cancelled", JPEG re-encode, max 1280 px wide, quality 0.78) | Yes, as is. The re-encode probably drops EXIF, but that is not verified; the server must strip it anyway (section 4) |
| Upload status model | `apps/mobile/src/components/practice/PhotoInput.tsx` (`idle`, `preparing`, `preview`, `uploading`, `failed`, `denied`; "Try again" re-sends the same photo) | Yes: v2's composer copies this model (upload starts on pick, the post waits, retry re-sends) |
| Upload schema | `packages/shared/src/schemas.ts:569` `uploadImageInput` (base64 up to about 7 MB, jpeg/png/webp) | Yes for type and size; add dimension checks |
| Allowed types | `apps/api/src/lib/assets.ts` `IMAGE_TYPES` (jpeg, png, webp) | Yes |
| Private storage | `apps/api/src/services/photos.ts` (practice photos under `practice-photos/{userId}/{id}`, read back only for the session's own user; `photoPrefix` for account deletion) | **Pattern only.** The key contains the user id, which an anonymous circle post must not expose (section 6). Circle photos are read by other members, so the "only her" read rule does not fit either |
| Public assets | `GET /api/assets/:key` (avatars, event covers), public and immutable | **Do not use** for circle photos: anyone with the URL could read them |

## 2. Data model

- New table `topic_photo` (one row per photo): `id` (random, unguessable), `topicId`, `postId` (null until the post is
  created), `uploaderId` (kept for moderation and deletion, never sent to members), `status`
  (`pending_review`, `active`, `held`, `removed`), `width`, `height`, `bytes`, `contentType`, `createdAt`.
- `topic_post.photoId` (nullable, one photo per post). Replies stay text only.
- Orphan rule: photos uploaded but never attached are deleted after a short time (for example 24 h).

## 3. Storage and access control

- A **private** R2 prefix for circle photos, separate from `avatars/` and `practice-photos/`, with no public route.
- Members fetch photos through **signed URLs with a short life** (minutes), issued only to a viewer who is a member
  of the post's circle and who can see the post under the existing rules (`canSee`, `visiblePost`: not blocked,
  not reported by her, not taken down; held posts only for their author).
- Signing is per viewer and per request; no long-lived or shareable links. Leaving the circle stops new links.
- Thumbnails (feed size) and the full image are separate objects so the feed never downloads the full photo.

## 4. Validation and metadata

- Type: jpeg, png, webp only (`IMAGE_TYPES`), checked by magic bytes, not by the declared type.
- Size: a cap on bytes (the shared schema allows about 5 MB decoded; v2's phone-side check is 10 MB before
  re-encode). Dimensions: a minimum (for example 200 px) and a maximum (for example 4000 px on the long side).
- Count: **one photo per post** (v2 design). Reject a second.
- **Strip all metadata (EXIF, GPS, camera, timestamps) and re-encode on the server**, whatever the phone did. Store
  only the re-encoded file.

## 5. Image moderation

- Automated screening on upload (sexual content, violence, self-harm imagery, faces of minors, documents and visible
  personal data where feasible). Results set `pending_review`, `active` or `held`.
- A **held** state like text posts have today: the author sees «Una persona de nuestro equipo la lee antes de que
  se vea», others see nothing. The post can be held because of its photo alone.
- A human queue in the admin tools for held photos and reported photos, next to the existing report queue
  (`apps/api/src/routes/admin/moderation.ts`).
- Decide whether a post with a photo is held until the photo is screened, or published text-first with the photo
  added after screening (owner decision).

## 6. Anonymous posts must not expose identity through the photo

- Object keys and URLs must not contain the user id, the account name or anything derived from them (unlike
  `practice-photos/{userId}/…`). Use the random photo id only.
- No uploader metadata in the stored object (custom headers, filenames, EXIF).
- The member-facing API returns the photo id and dimensions only, never `uploaderId`.
- The team can see the uploader in the same ways it can see the author of anonymous text today (report queue for any
  admin, safety flags for named readers, alert emails and Slack; ANONYMITY.md). Decide with the anonymity decision
  whether photos follow the same access or a narrower one, and log reads if a rule is adopted.
- The composer copy also warns: avoid faces, documents or details that identify you.

## 7. Deletion

- Author takes the post down (`status: hidden`): the photo becomes unreadable at once (no new signed URLs) and is
  deleted from storage after a short grace period.
- Moderator removal (`removed`): same, keeping only what the moderation record needs, for the documented retention.
- Account deletion: delete all her circle photos (add the new prefix or table to the deletion job that already uses
  `photoPrefix` for practice photos).
- Leaving a circle does not delete her photos (her posts stay, as the leave copy says).

## 8. Reporting a photo

- Reporting a post covers its photo; add an optional reason «La foto» or a target type `topic_photo` so the queue
  shows which part was reported.
- A reported post (and so its photo) disappears for the reporter, as text does today.

## 9. Rate limits and abuse

- Per user: uploads per hour and per day; posts with photos per day.
- Per circle: a burst limit on photo posts.
- Reject repeated identical files (hash) across circles to slow spam.

## 10. Other v2 proposals that need server work

- **Drafts**: kept on the phone only (no server). Needs local storage that survives the app closing.
- **Rules acknowledgment at join**: no server change if it stays a reading step; a stored acceptance (with the rules
  version) needs a column and a re-ask rule.
- **Sections before joining**: the topic endpoint already returns sections for members; it would need to return the
  section names to non-members too (names only, no posts, no counts).
- **Notification copy**: no change; the copy now describes the single «Actividad del círculo» switch
  (`packages/shared/src/enums.ts:289`). Its hint in Ajustes (`locales/es/account.ts:312`) still needs rewriting.
- **Retry key with photo**: optionally have the server compare key plus destination plus photo, to remove the
  "second post after a silent success" case.
