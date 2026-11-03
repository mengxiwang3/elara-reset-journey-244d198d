import { dayPosition, weekIsFree, weekOf } from "@elara/shared";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, ElaraMark, FloatingBack, VideoPlayer } from "@/components";
import { PracticeCta, PracticeThemeContext, themeForWeek } from "@/components/practice";
import { WorldArt } from "@/components/world/WorldArt";
import { initialSceneState } from "@/components/world/scene";
import { worldForWeek } from "@/components/world/worlds";
import type { AreaKey } from "@/content/types";
import { useDayGate } from "@/hooks/useDayGate";
import { isAheadOfGate } from "@/lib/dayEntry";
import { usePathsMap } from "@/hooks/usePaths";
import { useT } from "@/i18n";
import { duration as dur, FadeIn, PressableScale, stagger } from "@/motion";
import { useAppStore, useAreaAvailability, useIsPremium } from "@/store/useAppStore";
import { colors, gradients, radius, shadow, spacing, withAlpha } from "@/theme";

/**
 * Before a week begins: its name, and a short note from a human guide.
 *
 * ## The video
 *
 * Plays in the app (`VideoPlayer`): on tap, with sound, Subtítulos on unless
 * she turned them off, and the still frame with a line if it hasn't loaded in
 * 5 seconds. Close / Begin / Skip sit outside the player and always work.
 *
 * A week with no video yet shows the note in words on the card instead. The
 * screen is never a play button that plays nothing.
 *
 * ## Getting here and away
 *
 * The day screen routes here on the first open of a week's first day, until she
 * has answered anything that day. "Begin" and "Skip for now" both go on to the
 * day, marked `introSeen` so it does not bounce straight back; skipping keeps
 * the note for next time, which is what "for now" promises.
 */
function WeekIntroInner() {
  const t = useT();
  const router = useRouter();
  const { area, day, preview, from } = useLocalSearchParams<{
    area: AreaKey;
    week?: string;
    day?: string;
    /** Handed on to the day, so leaving it returns to the surface that opened it. */
    from?: string;
    /** Opened from the Paths card to watch again: it closes, it does not begin. */
    preview?: string;
  }>();
  const path = usePathsMap()[area];
  const dayNum = Number(day ?? 1);
  const content = path?.days[dayNum - 1];
  const intro = content?.config?.intro;
  const week = content ? weekOf(dayNum, content.config) : 1;
  const theme = themeForWeek(week, area);
  // A week with a world: the poster is a window onto the place itself, at
  // the start of its trail (Motion system, moment 9).
  const world = worldForWeek(week, area);
  const screen = useWindowDimensions();
  const posterW = Math.round((screen.width - spacing[6] * 2) * 0.82);

  const premium = useIsPremium();
  const entitlementKnown = useAppStore((s) => s.subscription !== null);
  const weekLocked = !!content && entitlementKnown && !premium && !weekIsFree(week);

  // Check gate: if the week is locked for non-premium members, route to paywall
  useEffect(() => {
    if (!weekLocked || preview) return;
    router.replace({ pathname: "/paywall", params: { returnTo: `/path/day?area=${area}&day=${dayNum}` } });
  }, [weekLocked, router, area, dayNum, preview]);

  // A week whose first day has not opened yet (a notification, a stale link):
  // the day screen says when it opens. "Begin" is never offered early.
  const progress = useAppStore((s) => s.progress[area]);
  const gate = useDayGate(progress, path?.days.length ?? 0, area);
  const aheadOfGate = isAheadOfGate(gate, dayNum, !!progress?.stepAnswers?.[dayNum]);
  useEffect(() => {
    if (!aheadOfGate || preview) return;
    router.replace({ pathname: "/path/day", params: { area, day: String(dayNum), introSeen: "1", ...(from ? { from } : {}) } });
  }, [aheadOfGate, preview, router, area, dayNum]);

  const begin = () =>
    router.replace({ pathname: "/path/day", params: { area, day: String(dayNum), introSeen: "1", ...(from ? { from } : {}) } });

  if (!path || !content) return null;

  const title = intro?.title ?? content.config?.weekTitle ?? content.title;
  const guide = intro?.guide;
  const video = intro?.videoUrl;

  return (
    <PracticeThemeContext.Provider value={theme}>
      <LinearGradient colors={theme.canvas} style={styles.root}>
        <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
          <View style={styles.top}>
            <FloatingBack />
          </View>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <FadeIn style={styles.head}>
              <AppText variant="label" color={theme.accent} center>
                {t.practice.weekIntro.week(week)}
                {!weekIsFree(week) && ` · ${t.account.membership.premiumBadge}`}
              </AppText>
              <AppText variant="screenTitle" color={theme.ink} center accessibilityRole="header">
                {title}
              </AppText>
            </FadeIn>

            <FadeIn delay={stagger.group} duration={dur.slow} scaleFrom={0.96} style={styles.posterWrap}>
              {video ? (
                <View style={[styles.posterFrame, shadow("md")]}>
                  <VideoPlayer
                    videoUrl={video}
                    posterUrl={intro?.posterUrl}
                    captionsUrl={intro?.captionsUrl}
                    who={guide ?? t.common.guide.name}
                    style={styles.video}
                  />
                  {intro?.length ? (
                    <View style={[styles.badge, styles.length]} pointerEvents="none">
                      <AppText variant="caption" color={colors.white}>
                        {intro.length}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={[styles.poster, shadow("md")]}>
                  {world ? (
                    <WorldArt
                      worldId={world}
                      variant="active"
                      state={initialSceneState(world, 1)}
                      width={posterW}
                      height={Math.round(posterW / 0.64)}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : intro?.posterUrl ? (
                    <Image source={{ uri: intro.posterUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={[gradients.headerWash[0], colors.peach, gradients.canvasWarm[2]]}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  {/* No video yet: the note itself, in her guide's words, in
                      the upright voice, because it is somebody speaking. */}
                  {world && !intro?.note ? null : (
                    <View style={[styles.note, world && styles.noteOnArt]}>
                      {world ? null : <ElaraMark size={44} glow={false} />}
                      {intro?.note ? (
                        // On the slip the note scrolls once large text outgrows
                        // the poster, rather than running off its top edge.
                        world ? (
                          <ScrollView style={styles.noteScroll} showsVerticalScrollIndicator={false}>
                            <AppText variant="body" center color={colors.foreground}>
                              {intro.note}
                            </AppText>
                          </ScrollView>
                        ) : (
                          <AppText variant="body" center color={colors.foreground}>
                            {intro.note}
                          </AppText>
                        )
                      ) : null}
                    </View>
                  )}
                </View>
              )}
              {guide ? (
                <AppText variant="body" color={theme.muted} center>
                  {intro?.duration
                    ? t.practice.weekIntro.noteFrom(guide, intro.duration)
                    : t.practice.weekIntro.noteFromShort(guide)}
                </AppText>
              ) : null}
            </FadeIn>
          </ScrollView>

          <View style={styles.footer}>
            {preview ? (
              <PracticeCta
                label={t.common.action.close}
                icon={null}
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/atlas"))}
              />
            ) : (
              <>
            <PracticeCta
              label={t.practice.weekIntro.begin(week, dayPosition(dayNum, path?.days).dayInWeek)}
              onPress={begin}
            />
            <PressableScale
              size="chip"
              dim={0.6}
              onPress={begin}
              style={styles.skip}
              accessibilityRole="button"
              accessibilityLabel={t.practice.weekIntro.skip}
            >
              <AppText variant="control" color={theme.muted}>
                {t.practice.weekIntro.skip}
              </AppText>
            </PressableScale>
              </>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </PracticeThemeContext.Provider>
  );
}

/**
 * The week's note, behind the closed beta's rule: a link can name an Area the
 * beta has not opened, and its "Begin" leads into a day she could not answer.
 * She is taken to the Area's own screen instead (see `DayScreen`).
 */
export default function WeekIntro() {
  const router = useRouter();
  const { area } = useLocalSearchParams<{ area: AreaKey }>();
  const availability = useAreaAvailability();
  const closed = !!area && availability(area) === "beta";
  useEffect(() => {
    if (closed) router.replace({ pathname: "/path/[area]", params: { area } });
  }, [closed, router, area]);
  if (closed) return null;
  return <WeekIntroInner />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { paddingHorizontal: spacing[6], paddingTop: spacing[2] },
  scroll: { flexGrow: 1, paddingHorizontal: spacing[6], paddingVertical: spacing[4], gap: spacing[6] },
  head: { gap: spacing[3], alignItems: "center" },
  posterWrap: { alignItems: "center", gap: spacing[3] },
  poster: {
    width: "82%",
    aspectRatio: 0.64,
    borderRadius: radius.feature,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withAlpha(colors.border, 0.9),
  },
  posterFrame: { width: "82%", aspectRatio: 0.64, borderRadius: radius.feature },
  video: { flex: 1 },
  note: { alignItems: "center", gap: spacing[5], paddingHorizontal: spacing[6] },
  // Over the world's art the guide's note sits on a paper slip at the foot.
  noteOnArt: {
    position: "absolute",
    left: spacing[3],
    right: spacing[3],
    bottom: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: radius.content,
    backgroundColor: withAlpha(colors.cream, 0.92),
    maxHeight: "92%",
  },
  noteScroll: { maxHeight: "100%" },
  badge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1.5],
    backgroundColor: withAlpha(colors.black, 0.45),
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  captions: { top: spacing[3], right: spacing[3] },
  length: { bottom: spacing[3], left: spacing[3] },
  footer: { paddingHorizontal: spacing[6], paddingBottom: spacing[4], gap: spacing[2] },
  skip: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: spacing[4] },
});
