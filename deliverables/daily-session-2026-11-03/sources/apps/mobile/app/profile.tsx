import { useQuery } from "@tanstack/react-query";
import { weekOf } from "@elara/shared";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, FloatingBack, Icon, IconButton, ScreenShell } from "@/components";
import { DrawerTab, KeptNote, PaperEnvelope, PaperLabel, PAPER, PathMark } from "@/components/drawer/Paper";
import type { AreaKey } from "@/content/types";
import { useAssessments } from "@/hooks/useAssessments";
import { useDayGate } from "@/hooks/useDayGate";
import { useActivePath, usePathsMap } from "@/hooks/usePaths";
import { FadeIn, PressableScale, pressOpacity, stagger, useFocusEntrance } from "@/motion";
import { formatLocale, useT } from "@/i18n";
import { api } from "@/lib/api";
import { toSecondPerson, whenPhrase } from "@/lib/memoryDisplay";
import { isGrantedMembership } from "@/lib/planLabels";
import { planIntervalKey } from "@/lib/purchases";
import { qk } from "@/lib/query";
import { useAppStore, useExploreEnabled } from "@/store/useAppStore";
import { colors, layout, radius, spacing } from "@/theme";

/**
 * The Clarity Assessment's routes. Built by the assessment flow, not here, so
 * they are cast the same way `clarity-assessment.tsx` casts its retake link —
 * the typed-routes manifest only learns a route once its file exists.
 */
const ASSESSMENT_HREF = "/assessment" as Href;
const HISTORY_HREF = "/assessment/history" as Href;

export default function ProfileScreen() {
  const t = useT();
  const router = useRouter();
  const exploreOn = useExploreEnabled();
  const user = useAppStore((s) => s.user);
  const isPremium = useAppStore((s) => s.isPremium);
  const subscription = useAppStore((s) => s.subscription);
  const allProgress = useAppStore((s) => s.progress);
  const { area, path, progress } = useActivePath();
  const paths = usePathsMap();
  // `title` and `city` live on the server profile only — the session user
  // the store keeps has name, email and avatar and nothing else.
  const { data: me } = useQuery({ queryKey: qk.me, queryFn: api.getMe });
  // The assessment flow's own list (newest first), on its own key — a retake
  // prepends into that cache, so this row re-dates the moment it lands. A
  // failed or absent list (an older API, offline) leaves `data` empty, which
  // this row reads the same as never taken: nothing to date it by.
  const { data: assessments } = useAssessments();
  const lastTaken = assessments?.[0]?.createdAt ?? null;
  // Her current day, unless the path is finished or the next day hasn't
  // opened yet (then "Continue" would only say when it does).
  const pathTotal = path.days.length;
  const pathDay = Math.min(progress.currentDay, pathTotal);
  const gate = useDayGate(progress, pathTotal, area);
  const pathOpen = progress.completedDays.length < pathTotal && !gate;
  const pathWeek = weekOf(pathDay, path.days[pathDay - 1]?.config);
  const pathDayInWeek = Math.max(
    1,
    path.days.filter((d) => weekOf(d.day, d.config) === pathWeek).findIndex((d) => d.day === pathDay) + 1,
  );

  const subtitle = [me?.title, me?.city].filter((v) => v && v.trim()).join(" · ");

  // The membership row says what the Membership screen would, in one line.
  const status = subscription?.status ?? "none";
  const intervalKey = planIntervalKey(subscription?.productId);
  // A tester's granted months are "Beta access", as Settings says — not a
  // plan she bought.
  const planName = isGrantedMembership(isPremium, subscription?.source)
    ? t.account.settings.betaAccess
    : isPremium
      ? intervalKey
        ? t.account.profile.membershipRow.plan(t.account.membership.intervals[intervalKey])
        : t.account.membership.premiumName
      : t.account.membership.freeName;

  const entrance = useFocusEntrance();

  // What Elara remembers: the newest note she still holds, and how many. Only
  // real notes, never a sample: a day-one drawer says it is empty.
  const { data: memory } = useQuery({ queryKey: qk.memory, queryFn: api.getMemory });
  const lang = formatLocale().startsWith("es") ? "es" : "en";
  const kept = useMemo(
    () => (memory?.notes ?? []).filter((n) => !n.superseded).sort((a, b) => b.firstSeenAt - a.firstSeenAt),
    [memory?.notes],
  );
  const latestNote = kept[0] ?? null;
  const [now] = useState(() => Date.now());
  const noteWhen = latestNote ? whenPhrase(latestNote.firstSeenAt, now, t.account.memory.when) : "";
  const noteText = latestNote ? toSecondPerson(latestNote.text, lang).text : "";

  // Opened paths: at most three, the one she is on first. Nothing opened, no marks.
  const opened = useMemo(() => {
    const keys = (Object.keys(allProgress) as AreaKey[]).filter((a) => {
      const p = allProgress[a];
      return !!p && !!paths[a] && (p.completedDays.length > 0 || a === area);
    });
    keys.sort((a, b) => (a === area ? -1 : b === area ? 1 : 0));
    return keys.slice(0, 3).map((a) => {
      const p = allProgress[a]!;
      const pd = paths[a]!;
      const day = Math.min(p.currentDay, pd.days.length);
      return { area: a, name: pd.name, week: weekOf(day, pd.days[day - 1]?.config) };
    });
  }, [allProgress, paths, area]);

  const d = t.account.profile.drawer;
  const pictures = assessments?.length ?? 0;

  return (
    // Profile is a pushed screen, not a tab: the shell's own bottom inset is
    // what the last row needs.
    <ScreenShell
      level={1}
      scroll
      edges={["top", "bottom"]}
      contentContainerStyle={{ paddingBottom: spacing[8], gap: layout.blockGap }}
    >
      <FloatingBack onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />
      <FadeIn runKey={entrance} style={styles.header}>
        <View style={styles.headerActions}>
          <IconButton
            name="solar:pen-new-square-linear"
            onPress={() => router.push("/edit-profile")}
            color={colors.primary}
            accessibilityLabel={t.account.profile.editA11y}
          />
          <IconButton
            name="solar:settings-linear"
            onPress={() => router.push("/settings")}
            color={colors.textSecondary}
            accessibilityLabel={t.account.profile.sections.settings}
          />
        </View>

        {/* Your Letter Drawer: the envelope addressed to her. Tapping it edits
            who it is addressed to. */}
        <PaperEnvelope
          onPress={() => router.push("/edit-profile")}
          accessibilityLabel={user?.name ? t.account.profile.editA11yNamed(user.name) : t.account.profile.editA11y}
        >
          <AppText variant="screenTitle">
            {user?.name ? d.greeting(user.name) : d.greetingNoName}
          </AppText>
          <AppText variant="body">{latestNote ? d.line : d.lineEmpty}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {subtitle ? `${subtitle} · ${d.privateNote}` : d.privateNote}
          </AppText>
        </PaperEnvelope>
      </FadeIn>

      {/* One note Elara kept. One, never a feed: the rest is in Memory. */}
      <FadeIn runKey={entrance} delay={stagger.step}>
        {latestNote ? (
          <KeptNote
            eyebrow={d.noteEyebrow}
            onPress={() => router.push("/memory")}
            accessibilityLabel={d.noteA11y(noteText, noteWhen)}
            footer={
              <AppText variant="caption" color={colors.textSecondary}>
                {d.noticed(noteWhen)}
              </AppText>
            }
          >
            <AppText variant="body" color={colors.foreground} numberOfLines={4}>
              {noteText}
            </AppText>
          </KeptNote>
        ) : (
          <KeptNote eyebrow={d.noteEyebrow}>
            <AppText variant="cardTitle">{d.noteEmptyTitle}</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {d.noteEmptyBody}
            </AppText>
          </KeptNote>
        )}
      </FadeIn>

      {/* What Elara remembers: plain rows under one paper label. */}
      <FadeIn runKey={entrance} delay={stagger.step * 2} style={styles.section}>
        <PaperLabel label={d.remembers} />
        <View>
          <DrawerRow
            label={d.notes}
            value={kept.length ? d.notesCount(kept.length) : undefined}
            onPress={() => router.push("/memory")}
          />
          <DrawerRow
            label={d.pictures}
            value={pictures ? d.picturesCount(pictures) : assessments ? d.picturesNone : undefined}
            onPress={() => router.push(lastTaken != null ? HISTORY_HREF : ASSESSMENT_HREF)}
          />
          <DrawerRow label={d.phrases} onPress={() => router.push("/collection")} last />
        </View>
      </FadeIn>

      {/* Your path: one tap back into the exact step. */}
      {pathOpen ? (
        <FadeIn runKey={entrance} delay={stagger.step * 3}>
          <PressableScale
            size="card"
            dim={pressOpacity}
            onPress={() => router.push({ pathname: "/path/day", params: { area, day: String(pathDay) } })}
            accessibilityRole="button"
            accessibilityLabel={`${path.name}. ${t.account.profile.pathDay(pathWeek, pathDayInWeek)}. ${t.home.paths.continueToday}`}
            style={styles.pathRow}
          >
            <View style={styles.rowText}>
              <AppText variant="cardTitle">{path.name}</AppText>
              <AppText variant="caption">{t.account.profile.pathDay(pathWeek, pathDayInWeek)}</AppText>
              <AppText variant="control" color={colors.primary}>
                {t.home.paths.continueToday}
              </AppText>
            </View>
            <Icon name="solar:arrow-right-linear" size={18} color={colors.primary} />
          </PressableScale>
        </FadeIn>
      ) : null}

      {/* Opened paths: a few pressed marks, not a second map. */}
      {opened.length ? (
        <FadeIn runKey={entrance} delay={stagger.step * 3} style={styles.section}>
          <PaperLabel label={d.openedPaths} />
          <View style={styles.marks}>
            {opened.map((o) => (
              <PathMark
                key={o.area}
                title={o.name}
                kicker={d.weekWord}
                value={String(o.week)}
                accessibilityLabel={d.pathA11y(o.name, o.week)}
                onPress={() => router.push({ pathname: "/(tabs)/atlas/[area]", params: { area: o.area } })}
              />
            ))}
          </View>
        </FadeIn>
      ) : null}

      {/* The rest of the drawer, kept short: three things she opens often.
          Everything else lives where it belongs (Circle in its own tab,
          preferences in Settings). */}
      <FadeIn runKey={entrance} delay={stagger.group} style={styles.section}>
        <PaperLabel label={d.more} />
        <View>
          <DrawerRow label={t.account.profile.rows.howYouveBeen} onPress={() => router.push("/progress")} />
          {/* Saved lives in Explore; hidden with it (`features.explore`). */}
          {exploreOn ? (
            <DrawerRow label={t.explore.saved.title} onPress={() => router.push("/explore/saved" as never)} />
          ) : null}
          <DrawerRow label={t.account.profile.rows.myPaths} onPress={() => router.push("/(tabs)/atlas")} last />
        </View>
      </FadeIn>

      {/* The drawer's two tabs: where settings and membership live. */}
      <FadeIn runKey={entrance} delay={stagger.group * 2} style={styles.tabs}>
        <DrawerTab label={d.settingsTab} onPress={() => router.push("/settings")} />
        <DrawerTab
          label={d.membershipTab}
          detail={`${t.account.membership.statusLabels[status]} · ${planName}`}
          onPress={() => router.push("/membership")}
        />
      </FadeIn>
    </ScreenShell>
  );
}

/** A plain drawer row: a hairline, the label, an optional value, a chevron. 56pt tall. */
function DrawerRow({
  label,
  value,
  onPress,
  last,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <PressableScale
      size="card"
      dim={pressOpacity}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      style={[styles.drawerRow, last && styles.drawerRowLast]}
    >
      <AppText variant="cardTitle" style={{ flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="body" color={colors.textActionTertiary} numberOfLines={1} style={{ flexShrink: 1 }}>
          {value}
        </AppText>
      ) : null}
      <Icon name="solar:alt-arrow-right-linear" size={18} color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing[3] },
  headerActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing[2] },
  section: { gap: spacing[2] },
  rowText: { flex: 1, gap: spacing[0.5] },
  pathRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.content,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  marks: { flexDirection: "row", justifyContent: "flex-start", gap: spacing[4], paddingTop: spacing[2] },
  drawerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 56,
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PAPER.rule,
  },
  drawerRowLast: { borderBottomWidth: 0 },
  tabs: { flexDirection: "row", alignItems: "stretch", gap: spacing[3], marginTop: spacing[2] },
});
