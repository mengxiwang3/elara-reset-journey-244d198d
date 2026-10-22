# Circles v2: new and changed copy

Every string here is **BORRADOR · pendiente de Alejandra**. None is in the branch. No em dashes. No quotes from
Alejandra or anyone real. Source in the prototype: `artifact/strings.js` (`window.STRINGS.es.v2`, `.en.v2`). Branch
strings the screens still use are unchanged and not listed.

## Changed (replaces branch copy)

| Key | Branch (es) | v2 (es) | v2 (en) | Why |
|---|---|---|---|---|
| `compose.nameAnonNote` | Las demás ven «Anónima». | Las demás ven «Anónima». El equipo de Elara puede ver quién la escribió, por ejemplo si alguien la reporta o si la revisión de seguridad la marca. | Other women see “Anonymous”. The Elara team can see who wrote it, for example if someone reports it or the safety review flags it. | States the real team access (report queue, safety flags, alerts; ANONYMITY.md) and claims no restriction that is not built. **Fails the branch test** `circleTopics.test.ts:35` if moved into the app namespace: owner decision |
| `post.replyAnonNote` | (none) | Las demás ven «Anónima». El equipo de Elara puede ver quién la escribió, por ejemplo si alguien la reporta o si la revisión de seguridad la marca. | Other women see “Anonymous”. The Elara team can see who wrote it, for example if someone reports it or the safety review flags it. | Same for replies; same test conflict |
| `help.anonymity` (new line in «Cómo funcionan los círculos») | (none) | «Anónima» oculta tu nombre a las demás mujeres, no al equipo de Elara. El equipo puede ver quién escribió algo, por ejemplo al revisar un reporte o una alerta de seguridad. | “Anonymous” hides your name from other women, not from the Elara team. The team can see who wrote something, for example when reviewing a report or a safety alert. | Help sheet; same test conflict |
| `compose.nameNamed` | (none) | Las demás ven tu nombre, {nombre}. | Other women see your name, {name}. | Says what the named choice means |
| `block.confirmBody` | Dejarán de ver las reflexiones de la otra, y ninguna de las dos podrá escribirle a la otra. | Dejarás de ver sus publicaciones y respuestas, y ella dejará de ver las tuyas. Ninguna de las dos podrá escribirle a la otra. | You'll stop seeing her posts and replies, and she'll stop seeing yours. Neither of you can message the other. | Public circles have posts and replies, not reflections; the block applies both ways (`canSee`) |
| `compose.prompt` (was `bodyLabel`) | ¿Qué quieres compartir? | ¿Qué te está pasando o qué estás intentando resolver? | What's happening, or what are you trying to work out? | Owner's brief |
| `compose.placeholder` | Cuenta lo que pasó o haz una pregunta… | Cuéntalo con tus palabras. La primera frase se verá como inicio de tu publicación. | Tell it in your own words. Your first sentence becomes the opening of your post. | No title field; the first sentence leads |
| `guidelines.title` | Cómo funciona este círculo | Normas de los círculos | Circle rules | One name for the rules everywhere |
| `guidelines.intro` | Un círculo es un espacio donde la gente dice cosas verdaderas sobre semanas difíciles… | Un círculo es un grupo de mujeres que hablan de algo que están viviendo. Para que funcione, esto es lo que pedimos y lo que puedes esperar. | A circle is a group of women talking about something they are living through. For it to work, this is what we ask and what you can expect. | Describes public circles |
| `guidelines.asks[0..3]` | (older Circle wording: «reflexión», «semana») | Amabilidad antes que ingenio / Lo que se cuenta aquí se queda aquí / Habla desde tu experiencia / Sin diagnósticos, ventas ni reclutamiento (bodies in strings.js) | Kindness before cleverness / What is shared here stays here / Speak from your own experience / No diagnoses, selling or recruiting | Same asks, worded for posts and replies |
| `guidelines.promises[1]` | Retira una reflexión o una respuesta … y sale de todos los feeds y todos los recuentos … | Quita una publicación o una respuesta cuando quieras y desaparece para todas. También puedes bloquear a alguien o salir de un círculo sin decírselo a nadie. | Take down a post or a reply whenever you like and it disappears for everyone. You can also block someone or leave a circle without telling anyone. | No «recuentos» exist |
| `guidelines.promises[2]` (new) | (none) | «Anónima» tiene un límite: Si publicas como «Anónima», las demás mujeres no ven tu nombre. El equipo de Elara sí puede ver quién lo escribió, por ejemplo al revisar un reporte o una alerta de seguridad. | “Anonymous” has a limit: … The Elara team can still see who wrote it, for example when reviewing a report or a safety alert. | Accurate anonymity (ANONYMITY.md) |
| `guidelines.promises[3]` | Tú eliges qué te llega: Las notificaciones son por círculo y por tipo, y puedes apagar cualquiera sin salir del círculo. | Qué avisos te llegan: Te avisamos cuando alguien responde a tu publicación o en una conversación donde respondiste, según el interruptor «Actividad del círculo» en Ajustes. Por ahora no se puede silenciar un solo círculo. | Which notifications you get: … You can't mute a single circle yet. | The promised per-circle control does not exist (`replyRecipients`, `PUSH_KIND_PREF`) |

## New

| Key | es | en | Where |
|---|---|---|---|
| `discover.firstTitle` | Encuentra tus círculos | Find your circles | Descubrir, first visit |
| `discover.firstLead` | Cada círculo reúne conversaciones entre mujeres sobre un tema de la vida. Únete para leer, preguntar y responder. | Each circle gathers conversations between women about one part of life. Join to read, ask and reply. | Descubrir, first visit |
| `discover.allTitle` | Todos los círculos | All circles | Descubrir |
| `discover.filterAll` | Todos | All | Descubrir filter |
| `discover.personalize` | ¿Quieres sugerencias según tus intereses? | Want suggestions based on your interests? | Descubrir, secondary |
| `discover.personalizeCta` | Elegir intereses (opcional) | Choose interests (optional) | Descubrir |
| `discover.member` | Ya eres parte | You're a member | Circle card status |
| `discover.enter` | Entrar | Enter | Circle card, joined |
| `discover.suggestRow` | ¿Falta un círculo? Sugiérelo | Missing a circle? Suggest one | Descubrir |
| `discover.previewA11y`, `joinA11y` | Ver de qué trata {círculo} / Unirme a {círculo} | See what {circle} is about / Join {circle} | Screen reader labels |
| `joinSheet.title` | Antes de unirte a {círculo} | Before you join {circle} | Join sheet |
| `joinSheet.lead` | Lo esencial, en cuatro puntos: | The essentials, in four points: | Join sheet |
| `joinSheet.rules[0]` | Responde con amabilidad. Estás leyendo la vida real de otra mujer. | Reply with kindness. You are reading another woman's real life. | Join sheet |
| `joinSheet.rules[1]` | Lo que se cuenta aquí se queda aquí. No compartas fuera lo que otras escriben. | What is shared here stays here. Don't share what others write outside the circle. | Join sheet |
| `joinSheet.rules[2]` | Habla desde tu experiencia. Sin diagnósticos, ventas ni consejos médicos o financieros presentados como hechos. | Speak from your own experience. No diagnoses, selling, or medical or financial advice presented as fact. | Join sheet |
| `joinSheet.rules[3]` | Si algo te preocupa, repórtalo. Una persona del equipo de Elara lo lee. | If something worries you, report it. A person on the Elara team reads it. | Join sheet |
| `joinSheet.full` | Ver las normas completas | Read the full rules | Join sheet |
| `joinSheet.confirm` / `cancel` | Unirme / Ahora no | Join / Not now | Join sheet |
| `joinSheet.note` | Solo tú ves que te uniste. Puedes salir cuando quieras. | Only you see that you joined. You can leave any time. | Join sheet |
| `mine.addMore` | Descubrir más círculos | Discover more circles | Mis círculos |
| `mine.feedTitle` | Conversaciones recientes | Recent conversations | Mis círculos |
| `mine.moreTitle` | Más opciones | More options | Mis círculos |
| `card.reply` | Responder | Reply | Post cards |
| `card.newOnCard` | 1 nueva / {n} nuevas | {n} new | Post card marker |
| `card.newOnCardA11y` | 1 respuesta nueva / {n} respuestas nuevas | 1 new reply / {n} new replies | Screen reader |
| `card.photoA11y` | Ver la foto en grande | Open the photo larger | Photo button |
| `card.sample` | Foto de muestra | Sample photo | Sample photos only |
| `circle.rules` / `settings` | Normas / Ajustes | Rules / Settings | Circle header |
| `circle.preJoinTitle` | De qué se habla aquí | What women talk about here | Circle before joining |
| `circle.preJoinCard` | Únete para leer las conversaciones y participar. | Join to read the conversations and take part. | Circle before joining |
| `circle.continueDraft` | Seguir con tu borrador | Continue your draft | Circle, when a draft exists |
| `settings.title` | Ajustes de {círculo} | {circle} settings | Settings sheet |
| `settings.notifTitle` | Notificaciones | Notifications | Settings sheet |
| `settings.notifBody` | Te avisamos cuando alguien responde a tu publicación o en una conversación donde respondiste. Estos avisos siguen el interruptor «Actividad del círculo» en Ajustes de la app. Por ahora no se puede silenciar un solo círculo. | We let you know when someone replies to your post or in a conversation you replied in. These follow the “Circle activity” switch in the app's Settings. You can't mute a single circle yet. | Settings sheet |
| `settings.rulesRow` | Normas del círculo | Circle rules | Settings sheet, post menu |
| `post.replyAs` | Respondes como {nombre} | Replying as {name} | Reply bar (one line) |
| `post.change` | Cambiar | Change | Reply bar |
| `post.hideKb`, `compose.hideKb` | Ocultar teclado | Hide keyboard | Reply bar, composer bar |
| `compose.sectionLabel` | Sección (opcional) | Section (optional) | Composer |
| `compose.addPhoto` | Añadir foto (opcional) | Add a photo (optional) | Composer |
| `compose.photoReplace` / `photoRemove` | Cambiar foto / Quitar foto | Change photo / Remove photo | Composer |
| `compose.photoUploading` | Subiendo la foto… | Uploading the photo… | Composer |
| `compose.photoFailed` | No se pudo subir la foto. | The photo didn't upload. | Composer |
| `compose.photoRetry` | Reintentar | Try again | Composer |
| `compose.photoBlocks` | La foto todavía no se subió. Reinténtalo o quítala para publicar. | The photo hasn't uploaded yet. Try again or remove it to post. | Composer bar |
| `compose.photoNote` | Las mujeres del círculo verán la foto. Evita caras, documentos o datos que te identifiquen. | Women in the circle will see the photo. Avoid faces, documents or details that identify you. | Composer |
| `compose.photoInvalid` | Elige una foto JPG, PNG o WebP de menos de 10 MB. | Choose a JPG, PNG or WebP photo under 10 MB. | Composer |
| `compose.photoAlt` | Tu foto | Your photo | Screen reader |
| `compose.discard` | Descartar | Discard | Composer header |
| `compose.discardTitle` | ¿Descartar este borrador? | Discard this draft? | Confirm sheet |
| `compose.discardBody` | Se borran el texto y la foto. No se puede deshacer. | The text and the photo are deleted. This can't be undone. | Confirm sheet |
| `compose.discardConfirm` / `discardKeep` | Descartar borrador / Seguir escribiendo | Discard draft / Keep writing | Confirm sheet |
| `compose.discarded` | Borrador descartado. | Draft discarded. | Toast |
| `compose.draftSaved` | Guardamos tu borrador. | Your draft is saved. | Toast on back |
| `compose.draftRestored` | Recuperamos tu borrador para {círculo}. | Your draft for {circle} is back. | Composer notice |
| `compose.draftOther` | Tu borrador es para {círculo}. Puedes cambiar el destino con «Cambiar». | Your draft is for {circle}. You can change where it goes with “Change”. | Composer notice |

Tab labels (Hoy, Atlas, Pregunta, Explorar, Círculos) are verbatim from the branch (`common.tabs`).
