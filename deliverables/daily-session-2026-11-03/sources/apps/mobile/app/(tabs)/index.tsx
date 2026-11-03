import { useQuery } from "@tanstack/react-query";
import { dayPosition, isAside, pickFeaturedResource, stepsOf } from "@elara/shared";
import { useIsFocused, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  AppText,
  EyebrowLabel,
  Icon,
  MastheadProfileButton,
  NotificationPrimer,
  PendingSyncNotice,
  PrimaryPill,
  ScreenShell,
  TabMasthead,
} from "@/components";
import { DoneLine, HoyPostcard, SavedNote } from "@/components/hoy/HoyPostcard";
import { ForTodayRow, HelpNowLink, HoySection, SixAreasMark, TakeawayRow } from "@/components/hoy/HoyRows";
import { WeekDiscs, type WeekDisc } from "@/components/hoy/WeekDiscs";
import { useWeekWorld } from "@/components/journey/useWeekWorld";
import { landmark } from "@/components/practice/landscape/useWorldDay";
import type { WorldId } from "@/components/world/types";
import { worldOrder } from "@/components/world/worlds";
import { keepsakeArt } from "@/content/keepsakeImages";
import { dayPhoto } from "@/content/dayImages";
import { dayPlaceWords, lowerFirst } from "@/content/placeDay";
import { PLACE_HERO, PLACE_THUMB } from "@/content/placeImages";
import { placeById } from "@/content/places";
import { seedMilestoneLedger } from "@/celebration";
import { useScreenExplainer } from "@/explainers/useExplainer";
import { useAssessments } from "@/hooks/useAssessments";
import { useResources } from "@/hooks/useResources";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { calendarDaysBetween, promisesNextWeek, type ResolvedEntry } from "@/hooks/todayEntry";
import { hoyTakeaway, type HoyTakeaway } from "@/lib/session";
import { placeWordsFor, useProgressStatus, useTodayEntry, type TodayEntry } from "@/hooks/useTodayEntry";
import { formatLocale, useT, type Strings } from "@/i18n";
import { api } from "@/lib/api";
import { mastheadParts } from "@/lib/dates";
import { greetingName } from "@/lib/greetingName";
import { HELP_NOW_ROUTE } from "@/lib/helpNow";
import { welcomeLine } from "@/lib/onboardingAnswers";
import { qk, queryClient } from "@/lib/query";
import { DelayedLoader, FadeIn, PressableScale, SkeletonCard, stagger, useFocusEntrance } from "@/motion";
import { TertiaryAction } from "@/components/system/TertiaryAction";
import { useAppStore } from "@/store/useAppStore";
import { isRefusedDraft, stepDraftKey } from "@/components/practice/draft";
import { colors, fontFamily, padding, radius, spacing, withAlpha } from "@/theme";

/**
 * Hoy (Option B "Hoy" and the Final Pass, Oct 2026).
 *
 * One postcard of today's place, then the week, then her own words, then
 * what else today holds. Everything is read from the day state; nothing on
 * this screen is typed in:
 *
 * - The postcard's action is today's entry (`useTodayEntry`), the same rule
 *   the Pregunta tab and the Atlas use: today's practice at the step she was
 *   on, today's review once it is done, the week once the week is done.
 * - The discs and the counts come from her completed days; what she took
 *   away («Hoy te llevas», «La última vez anotaste») is her own takeaway,
 *   quoted as she wrote it (one account everywhere, Final Pass FX 5).
 * - A missed day keeps waiting with no penalty; nothing here counts what she
 *   did not do.
 *
 * Our fonts and palette, the board's layout: Fraunces only for the greeting
 * and today's question, Instrument Sans for the rest, ember only for "today".
 */
export default function TodayScreen() {
  const t = useT();
  const router = useRouter();
  const entry = useTodayEntry({ source: "today" });
  // Until her own progress is read (a new phone, a sign-in after her session
  // ended) there is no day to offer: a placeholder, or a retry if the read failed.
  const progressRead = useProgressStatus();
  // Membership, `null` while it loads: a week it does not cover is said to be
  // one, rather than promised to open.
  const premium = useAppStore((s) => (s.subscription === null ? null : s.isPremium));
  const { area, path, progress } = useWeekWorld();
  const user = useAppStore((s) => s.user);
  const { data: resources, refetch: refetchResources } = useResources();
  const { data: pictures, refetch: refetchPictures } = useAssessments();
  const latestPicture = pictures?.[0] ?? null;
  // The rhythm, only to seed the milestone ledger the first time this
  // account's rhythm is known (a reinstall at thirty days stays quiet).
  const { data: rhythm, refetch: refetchRhythm } = useQuery({ queryKey: qk.streak, queryFn: api.getStreak });
  useEffect(() => {
    if (user?.id && rhythm) seedMilestoneLedger(user.id, rhythm);
  }, [user?.id, rhythm]);

  // Pull to refresh: everything Hoy reads, with what is on screen kept in place.
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      refetchResources(),
      refetchPictures(),
      refetchRhythm(),
      queryClient.invalidateQueries({ queryKey: qk.myPaths }),
      queryClient.invalidateQueries({ queryKey: qk.appConfig }),
    ]);
    setRefreshing(false);
  };

  // The first Hoy after onboarding opens with one line of her own summary,
  // once (`finalizeOnboarding` raises the flag). Taken only after Hoy has held
  // focus for a beat: onboarding pushes Day 1 over the tabs in the same tick.
  const focused = useIsFocused();
  const welcomePending = useAppStore((s) => s.todayWelcomePending);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [explainerHeld, setExplainerHeld] = useState(false);
  useEffect(() => {
    if (!focused || !welcomePending || !user) return;
    const id = setTimeout(() => {
      const st = useAppStore.getState();
      const { recommendedArea, answers, concern } = st.onboarding;
      const line = welcomeLine(t, recommendedArea, answers, concern);
      st.setTodayWelcomePending(false);
      if (line) {
        setWelcome(line);
        setExplainerHeld(true);
      }
    }, WELCOME_SETTLE_MS);
    return () => clearTimeout(id);
  }, [focused, welcomePending, user, t]);
  useEffect(() => {
    if (focused) return;
    setWelcome(null);
    setExplainerHeld(false);
  }, [focused]);
  useScreenExplainer("today.welcome", !!user && focused && !welcomePending && !explainerHeld);

  // The notification ask waits for a first completed practice.
  const anyDayDone = useAppStore((st) => Object.values(st.progress).some((p) => (p?.completedDays.length ?? 0) > 0));

  const tabClearance = useTabBarClearance();
  const entrance = useFocusEntrance();
  const { height: windowHeight } = useWindowDimensions();
  const now = new Date();
  const locale = formatLocale();

  // «Buenas noches, Lucía»: or just «Buenas noches» with no name yet.
  const firstName = greetingName(user?.name) || t.home.today.friend;
  const hello = t.home.today.greeting[daypartFor(now.getHours())];
  const greeting = firstName ? `${hello}, ${firstName}` : hello;
  const md = mastheadParts(now, locale);
  const mastheadDate = t.home.today.mastheadDate(md.weekday, md.day, md.month);

  const days = path?.days ?? NO_DAYS;
  const content = entry ? days.find((d) => d.day === entry.day) : undefined;
  const question = useMemo(() => {
    if (!content) return "";
    const first = stepsOf(content).find((s) => !isAside(s));
    return first?.title || content.title;
  }, [content]);
  // What she took away (daily session, P0-7): today's at the top once today
  // is done, else the last one under today's day. Her words only, and only
  // once her own progress is read: never the store's empty progress.
  const drafts = useAppStore((s) => s.drafts);
  const kept =
    progressRead.status === "ready"
      ? hoyTakeaway(entry, days, progress, now.getTime(), (day, stepId) => isRefusedDraft(drafts[stepDraftKey(area, day, stepId)]))
      : null;
  const keptCard = kept && entry ? (
    <FadeIn runKey={entrance} delay={kept.placement === "top" ? stagger.step : stagger.group}>
      <TakeawayRow
        label={takeawayLabel(kept, entry, t)}
        quote={t.home.hoy.takeaway.quoted(kept.text)}
        hint={t.home.hoy.takeaway.openHint}
        onPress={() =>
          kept.placement === "top"
            ? entry.go()
            : router.push({ pathname: "/path/day", params: { area, day: String(kept.day), from: "today" } })
        }
      />
    </FadeIn>
  ) : null;
  const weekTitle = entry
    ? days.find((d) => entry.weekDays.includes(d.day) && d.config?.weekTitle)?.config?.weekTitle
    : undefined;

  // «Para hoy»: one piece to read (a guide first), and where she stands.
  const guide = useMemo(() => {
    const list = resources ?? [];
    const reads = list.filter((r) => r.format === "article" || r.format === "worksheet");
    return pickFeaturedResource(reads.length ? reads : list, area);
  }, [resources, area]);
  const openClarity = () =>
    latestPicture
      ? router.push({ pathname: "/assessment/saved", params: { id: latestPicture.id } })
      : router.push("/clarity-assessment");

  const place = entry?.place ?? null;
  // The day's own photograph, and the place it shows (a different one each day outside Money). A finished
  // week's card shows the week's place instead, the one its line names.
  const placeDef = place?.placeId ? placeById(place.placeId) : null;
  const dayPlace = entry && placeDef && entry.kind !== "week" ? dayPlaceWords(t.dayPlaces, placeDef.area, entry.dayInWeek) : null;
  // The card names the day in short; the full question waits inside the session.
  const dayTitle = shortDayTitle(content?.title, question, place?.worldId && entry ? landmark(t, place.worldId, entry.dayInWeek).toward : null);
  const card = entry
    ? postcardWords(entry, t, dayTitle, content?.config?.minutes, now.getTime(), locale, dayPlace?.name ?? place?.name, premium)
    : null;
  const photo =
    entry && placeDef
      ? entry.kind === "week"
        ? PLACE_HERO[placeDef.id]
        : dayPhoto(placeDef.area, placeDef.week, entry.dayInWeek).source
      : null;
  const ownStamp = entry ? keepsakeArt(place?.placeId, entry.dayInWeek) : null;
  const stampArt = ownStamp ?? (place?.placeId ? (PLACE_THUMB[place.placeId] ?? null) : null);

  const discs: WeekDisc[] = entry
    ? entry.weekDays.map((d, i) => {
        const n = i + 1;
        const done = progress.completedDays.includes(d);
        if (!done && entry.kind === "practice" && d === entry.day) {
          return { n, status: "today", art: null, a11y: t.home.hoy.week.discToday(n) };
        }
        if (!done) return { n, status: "ahead", art: null, a11y: t.home.hoy.week.discAhead(n) };
        const art = keepsakeArt(place?.placeId, n);
        return {
          n,
          status: "done",
          art: art ?? (place?.placeId ? (PLACE_THUMB[place.placeId] ?? null) : null),
          photo: !art,
          a11y: t.home.hoy.week.discDone(n, keepsakeName(t, place?.placeId ?? null, place?.worldId ?? null, n)),
        };
      })
    : [];

  return (
    <ScreenShell
      level={2}
      scroll
      scrollToTopOnTabPress
      edges={["top"]}
      contentContainerStyle={{ paddingBottom: tabClearance, gap: spacing[6] }}
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.brand} />
        ),
      }}
    >
      {/* Something she did that is not saved yet outranks the greeting. Renders nothing otherwise. */}
      <PendingSyncNotice />
      <NotificationPrimer enabled={!!user && anyDayDone} />

      <FadeIn runKey={entrance}>
        <TabMasthead eyebrow={mastheadDate} title={greeting} titleLines={3} trailing={<MastheadProfileButton />} />
      </FadeIn>

      {welcome ? (
        <FadeIn style={styles.welcome}>
          <View style={styles.welcomeText}>
            <EyebrowLabel label={t.home.today.welcomeEyebrow} tone="brand" />
            <AppText variant="body" color={colors.foreground}>
              {welcome}
            </AppText>
          </View>
          <PressableScale
            size="circle"
            hitSlop={12}
            onPress={() => setWelcome(null)}
            accessibilityRole="button"
            accessibilityLabel={t.home.today.welcomeDismiss}
          >
            <Icon name="solar:close-circle-linear" size={20} color={colors.textSecondary} />
          </PressableScale>
        </FadeIn>
      ) : null}

      {/* Her progress is not read yet: hold the postcard's place rather than
          offer a day that may not be hers to start. */}
      {progressRead.status === "loading" ? (
        <DelayedLoader active>
          <SkeletonCard />
        </DelayedLoader>
      ) : progressRead.status === "failed" ? (
        <View style={styles.progressFailed}>
          <AppText variant="body" center color={colors.textSecondary}>
            {t.common.state.loadFailed}
          </AppText>
          <TertiaryAction label={t.common.action.retry} onPress={progressRead.retry} />
        </View>
      ) : null}

      {/* Today is done: what she took away leads, above the day's card. */}
      {kept?.placement === "top" ? keptCard : null}

      {/* The postcard: today's place and the one action. */}
      {entry && card && place ? (
        <FadeIn runKey={entrance} delay={stagger.step} from="none" duration={450}>
          <HoyPostcard
            photo={photo}
            worldId={place.worldId}
            photoLabel={t.home.hoy.photoA11y(dayPlace?.where ?? place.full)}
            stamp={stampArt ? { art: stampArt, photo: !ownStamp } : null}
            stampName={place.name}
            compact={windowHeight < 700}
          >
            <AppText variant="bodySmall" color={colors.secondary} style={styles.placeLine} numberOfLines={1}>
              {card.placeLine}
            </AppText>
            {card.done ? <DoneLine label={card.done} /> : null}
            <AppText variant="editorialTitle" accessibilityRole="header" numberOfLines={3}>
              {card.title}
            </AppText>
            {card.meta ? (
              <AppText variant="bodySmall" color={colors.textSecondary}>
                {card.meta}
              </AppText>
            ) : null}
            {entry.hint ? <SavedNote label={entry.hint} /> : null}
            <PrimaryPill
              label={entry.label}
              variant={entry.kind === "review" ? "outline" : "forest"}
              iconRight={entry.kind === "practice" ? "solar:arrow-right-linear" : undefined}
              onPress={entry.go}
              style={styles.action}
            />
          </HoyPostcard>
        </FadeIn>
      ) : null}

      {/* A new day: the last thing she noted sits right under it. */}
      {kept?.placement === "underHero" ? keptCard : null}

      {/* «Tu semana en Wuzhen»: seven discs, the count, the week's theme. */}
      {entry && place ? (
        <FadeIn runKey={entrance} delay={stagger.group}>
          <HoySection
            title={t.home.hoy.week.title(place.name)}
            aside={t.home.hoy.week.count(entry.doneInWeek, entry.daysInWeek)}
            asideA11y={t.home.hoy.week.countA11y(entry.doneInWeek, entry.daysInWeek)}
          >
            <WeekDiscs discs={discs} todayLabel={t.home.hoy.week.today} />
            {weekTitle ? (
              <AppText variant="body" color={colors.foreground}>
                {t.home.hoy.week.theme(locale.startsWith("es") ? lowerFirst(weekTitle) : weekTitle)}
              </AppText>
            ) : null}
          </HoySection>
        </FadeIn>
      ) : null}

      {/* «Para hoy»: a guide, where she is, and Elara. */}
      <FadeIn runKey={entrance} delay={stagger.group * 3}>
        <HoySection title={t.home.hoy.forToday.title}>
          <View>
            {guide ? (
              <ForTodayRow
                first
                title={guide.title}
                meta={
                  guide.minutes
                    ? `${t.home.hoy.forToday.kinds[guide.format]} · ${t.library.minutes[guide.format](guide.minutes)}`
                    : t.home.hoy.forToday.kinds[guide.format]
                }
                onPress={() => router.push({ pathname: "/resource/[id]", params: { id: guide.id } })}
              />
            ) : null}
            <ForTodayRow
              first={!guide}
              leading={<SixAreasMark />}
              title={t.home.hoy.forToday.whereTitle}
              meta={t.home.hoy.forToday.whereMeta}
              onPress={openClarity}
            />
            {/* The conversation with Elara. The orb opens today's entry now, so this is her door from Hoy. */}
            <ForTodayRow
              title={t.home.hoy.forToday.talkTitle}
              meta={t.home.hoy.forToday.talkMeta}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/ask",
                  params: entry ? { area, day: String(entry.day), from: "today" } : {},
                })
              }
            />
          </View>
        </HoySection>
      </FadeIn>

      <HelpNowLink label={t.home.helpNow.title} a11y={t.home.helpNow.a11y} onPress={() => router.push(HELP_NOW_ROUTE)} />
    </ScreenShell>
  );
}

const NO_DAYS: never[] = [];

/** How long Hoy must hold focus before the first-visit welcome is taken. */
const WELCOME_SETTLE_MS = 600;

type Daypart = "morning" | "afternoon" | "evening" | "night";
function daypartFor(hour: number): Daypart {
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

/** Longest day title the postcard shows as is; past it, the day's place line stands in. */
const SHORT_TITLE_MAX = 48;

/**
 * The postcard's title: the day in a few words, never the full question (that
 * opens the session). The shortest of the day's own title and its first
 * question when either is short, else the day's "Toward …" line from the
 * session header, else the question as before.
 */
function shortDayTitle(dayTitle: string | undefined, question: string, toward: string | null): string {
  const short = [dayTitle, question]
    .filter((x): x is string => !!x && x.length <= SHORT_TITLE_MAX)
    .sort((a, b) => a.length - b.length)[0];
  return short ?? toward ?? question;
}

/** The postcard's words for the entry's state. */
function postcardWords(
  entry: TodayEntry,
  t: Strings,
  question: string,
  minutes: number | undefined,
  now: number,
  locale: string,
  /** The place the day's photograph shows, when it is not the week's own ("Paris, France"). */
  dayWhere?: string,
  /** Membership, `null` while it loads. */
  premium: boolean | null = null,
): { placeLine: string; done?: string; title: string; meta?: string } {
  const h = t.home.hoy;
  if (entry.kind === "week") {
    const weeks = Math.max(worldOrder(entry.area).length, entry.week);
    return {
      placeLine: h.placeWeek(entry.place.full, entry.week, weeks),
      title: entry.state === "pathDone" ? h.pathDoneTitle : h.weekDoneTitle(entry.place.name),
      // A next week her membership does not cover does not open for her.
      meta: promisesNextWeek(entry, premium) ? (opensLine(entry, t, now, locale) ?? undefined) : undefined,
    };
  }
  const line = h.placeLine(dayWhere ?? entry.place.full, entry.week, entry.dayInWeek);
  // A week her membership does not cover says so where the path page does
  // ("Semana 2 · Premium"): its button opens the membership screen, not the day.
  const placeLine = entry.membershipRequired ? `${line} · ${t.account.membership.premiumBadge}` : line;
  if (entry.kind === "review") {
    return {
      placeLine,
      done: h.dayDone(entry.dayInWeek),
      title: question,
      meta: opensLine(entry, t, now, locale) ?? undefined,
    };
  }
  return {
    placeLine,
    title: question,
    meta:
      entry.state === "missed" ? h.missed(entry.dayInWeek) : minutes ? h.intro(minutes) : undefined,
  };
}

/** «El día 4 se abre mañana, miércoles.» / «La semana 3, Terrazas de Yuanyang, se abre mañana, sábado.» */
function opensLine(entry: ResolvedEntry, t: Strings, now: number, locale: string): string | null {
  if (entry.opensAt === null || entry.nextDay === null) return null;
  const o = t.home.hoy.opens;
  const when = new Date(entry.opensAt);
  const weekday = when.toLocaleDateString(locale, { weekday: "long" });
  const time = when.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  const days = calendarDaysBetween(now, entry.opensAt);
  if (entry.kind === "week") {
    const week = entry.week + 1;
    const place = placeWordsFor(t, entry.area, week).name;
    if (days <= 0) return o.weekToday(week, place, time);
    return days === 1 ? o.weekTomorrow(week, place, weekday) : o.weekOn(week, place, weekday);
  }
  const day = dayPosition(entry.nextDay).dayInWeek;
  if (days <= 0) return o.dayToday(day, time);
  return days === 1 ? o.dayTomorrow(day, weekday) : o.dayOn(day, weekday);
}

/** «Hoy te llevas · Día 1», «La última vez anotaste · Día 1», «La última vez anotaste · Semana 1 · Día 7». */
function takeawayLabel(kept: HoyTakeaway, entry: ResolvedEntry, t: Strings): string {
  const w = t.home.hoy.takeaway;
  if (kept.placement === "top" && kept.today) return w.today(kept.dayInWeek);
  return kept.week === entry.week ? w.last(kept.dayInWeek) : w.lastWeek(kept.week, kept.dayInWeek);
}

/** What day `n` of a place keeps, by name: its own keepsake, else the day's stop. */
function keepsakeName(t: Strings, placeId: string | null, worldId: WorldId | null, n: number): string {
  const own = placeId ? (t.home.hoy.keepsakes as Record<string, readonly string[] | undefined>)[placeId]?.[n - 1] : undefined;
  if (own) return own;
  return worldId ? lowerFirst(landmark(t, worldId, n).at) : "";
}

const styles = StyleSheet.create({
  welcome: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    paddingHorizontal: padding.content,
    paddingVertical: spacing[4],
    borderRadius: radius["2xl"],
    borderWidth: 1,
    backgroundColor: colors.peach,
    borderColor: withAlpha(colors.brand, 0.18),
  },
  welcomeText: { flex: 1, gap: spacing[2] },
  progressFailed: { alignItems: "center", gap: spacing[3], paddingVertical: spacing[6] },
  // Clear of the stamp, which hangs over the top of the card's words.
  placeLine: { paddingRight: 66, fontFamily: fontFamily.sansSemibold },
  action: { marginTop: spacing[1.5] },
});
