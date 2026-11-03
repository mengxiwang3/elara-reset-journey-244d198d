/**
 * The Circles tab with public circles (Circles v6.2), when the server's
 * `circleTopics` flag is on. Two views: «Mis círculos» (new replies first, then
 * recent conversations from the circles she joined) and «Descubrir» (find a
 * circle: search, a short suggested set, one way to the full list).
 *
 * The sequence this screen serves: find a circle, understand it, join it,
 * write in it, come back to the replies. Writing starts inside a circle
 * (`topic.tsx`), so its destination is already clear.
 *
 * Owner decisions this screen carries:
 *  - C1: only members read; Descubrir shows circles, never their posts, and
 *    asks the server for no post at all.
 *  - C4: no Premium gate anywhere here.
 *  - C5: no counts of anyone; «Solo tú ves a qué círculos te uniste» lives in
 *    the help sheet and the join confirmation.
 *  - C8: the first-visit interests are read and written on the phone only
 *    (`useCircleInterests`); nothing here sends them.
 *  - The view is «Descubrir» (it replaces «Explorar círculos», C10, so it is not
 *    confused with the bottom-nav Explore tab).
 *  - Private rooms are deferred: nothing on this screen links to them.
 */
import type { TopicDTO, TopicInterestId, TopicSeedId } from "@elara/shared";
import { TOPIC_INTEREST_IDS, TOPIC_STAGES } from "@elara/shared";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { ScreenShell } from "@/components";
import { AppText } from "@/components/AppText";
import { PrimaryPill } from "@/components/system/PrimaryPill";
import { SectionHeading } from "@/components/system/SectionHeading";
import { TabMasthead } from "@/components/system/TabMasthead";
import { TertiaryAction } from "@/components/system/TertiaryAction";
import { TextField } from "@/components/TextField";
import { useCircleInterests } from "@/hooks/useCircleInterests";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { topicKeys, useTopicFeed, useTopicList, useTopicMembership } from "@/hooks/useTopics";
import { formatLocale, useT } from "@/i18n";
import { api, writeErrorMessage } from "@/lib/api";
import { suggestedTopicIds, type CircleInterests } from "@/lib/circleInterests";
import { searchTopics, shortlist, totalUnread, unreadConversations } from "@/lib/circleDiscovery";
import { colors, radius, spacing, withAlpha } from "@/theme";
import { HelpPill } from "../feed/ui";
import { Chip, CircleRow, DOT, HelpSheet, LeaveSheet, paperSheet, PostRow } from "./ui";

const CHEVRON = "›";
const OPEN = "▾";
const CLOSED = "▸";

type ViewKey = "mine" | "explore";

export function CirclesTopicsScreen() {
  const t = useT();
  const c = t.circleTopics;
  const { width } = useWindowDimensions();
  const g = width < 340 ? 16 : 20;
  const interests = useCircleInterests();
  const [chosenView, setView] = useState<ViewKey | null>(null);
  const [editingInterests, setEditingInterests] = useState(false);
  const topics = useTopicList();
  const joinedAny = (topics.data ?? []).some((x) => x.joined);
  // First visit (nothing joined, no interests decided yet) opens on Descubrir with the welcome.
  const firstVisit = interests.loaded && !!topics.data && !joinedAny && !interests.value.decided;
  const view: ViewKey = chosenView ?? (firstVisit ? "explore" : "mine");

  const showWelcome = interests.loaded && (!interests.value.decided || editingInterests);

  return (
    <ScreenShell level={3} edges={["top"]} padded={false}>
      <TabMasthead title={c.title} trailing={<HelpPill />} style={{ paddingHorizontal: g }} />
      <View accessibilityRole="tablist" accessibilityLabel={c.views.label} style={[styles.track, { marginHorizontal: g }]}>
        {(["mine", "explore"] as const).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === v }}
            onPress={() => setView(v)}
            style={[styles.segment, view === v && styles.segmentOn]}
          >
            <AppText variant="label" color={view === v ? colors.foreground : colors.textSecondary} center>
              {v === "mine" ? c.views.mine : c.views.explore}
            </AppText>
          </Pressable>
        ))}
      </View>
      {view === "mine" ? (
        <Mine
          g={g}
          topics={topics.data ?? []}
          loading={topics.isPending}
          error={topics.isError && !topics.data}
          onRetry={() => void topics.refetch()}
          onExplore={() => setView("explore")}
        />
      ) : (
        <Explore
          g={g}
          topics={topics.data ?? []}
          loading={topics.isPending}
          error={topics.isError}
          onRetry={() => void topics.refetch()}
          interests={interests.value}
          welcome={showWelcome}
          onSaveInterests={async (next) => {
            await interests.save(next);
            setEditingInterests(false);
          }}
          onEditInterests={() => setEditingInterests(true)}
        />
      )}
    </ScreenShell>
  );
}

/* ── Mis círculos ─────────────────────────────────────────────────────── */

function Mine({
  g,
  topics,
  loading,
  error,
  onRetry,
  onExplore,
}: {
  g: number;
  topics: TopicDTO[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onExplore: () => void;
}) {
  const t = useT();
  const c = t.circleTopics;
  const router = useRouter();
  const clearance = useTabBarClearance(0);
  const mine = topics.filter((x) => x.joined);
  // The conversations feed is only asked for once she has joined something (C1).
  const feed = useTopicFeed(mine.length > 0);
  const locale = formatLocale();
  const activity = useQuery({ queryKey: topicKeys.activity(locale), queryFn: api.getMyTopicActivity, staleTime: 0 });
  const unreadItems = unreadConversations(activity.data);
  const unread = totalUnread(activity.data);

  const header = (
    <View style={{ paddingHorizontal: g, paddingTop: spacing[3], gap: spacing[4] }}>
      {mine.length ? (
        <View style={{ gap: spacing[2] }}>
          <SectionHeading label={c.mine.yourCircles} actionLabel={c.mine.manage} onAction={() => router.push("/topic-manage")} />
          <View style={styles.chips}>
            {mine.map((x) => (
              <Chip key={x.id} label={x.name} on={false} a11yRole="button" onPress={() => router.push({ pathname: "/topic", params: { id: x.id } })} />
            ))}
          </View>
        </View>
      ) : null}
      {/* Replies first, and only when something is genuinely unseen: no badge or dot otherwise. */}
      {unreadItems.length ? (
        <View>
          <SectionHeading label={c.mine.newReplies} />
          {unreadItems.slice(0, 3).map((x) => (
            <Pressable
              key={x.postId}
              accessibilityRole="button"
              accessibilityLabel={`${x.preview}. ${x.topicName}. ${c.activity.unread(x.unreadCount)}`}
              onPress={() => router.push({ pathname: "/topic-post", params: { id: x.postId } })}
              style={styles.row}
            >
              <AppText variant="detail" color={colors.buttonForest}>
                {[x.topicName, c.activity.unread(x.unreadCount)].join(DOT)}
              </AppText>
              <AppText variant="label">{x.preview}</AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unread ? `${c.activity.row}. ${c.activity.unread(unread)}` : c.activity.row}
        onPress={() => router.push("/topic-activity")}
        style={styles.linkRow}
      >
        <AppText variant="label" style={{ flexShrink: 1 }}>
          {c.activity.row}
        </AppText>
        <AppText variant="label" color={colors.textSecondary}>
          {CHEVRON}
        </AppText>
      </Pressable>
      {mine.length && feed.data?.items.length ? <SectionHeading label={c.mine.feedTitle} style={{ marginBottom: -spacing[2] }} /> : null}
    </View>
  );

  if (!mine.length) {
    // "You haven't joined a circle yet" only once the list has actually
    // arrived: while it loads, or when it failed, that would be untrue.
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: clearance + spacing[5] }}>
        {loading || error ? null : header}
        <View style={{ paddingHorizontal: g, paddingTop: spacing[3], gap: spacing[2] }}>
          {error ? (
            <>
              <AppText variant="body">{[c.topic.loadError, c.topic.loadErrorBody].join(" ")}</AppText>
              <TertiaryAction wrap label={c.topic.retry} onPress={onRetry} style={{ alignSelf: "flex-start" }} />
            </>
          ) : loading ? (
            <AppText variant="body" accessibilityLiveRegion="polite">
              {t.common.state.loading}
            </AppText>
          ) : (
            <>
              <AppText variant="hero">{c.mine.emptyTitle}</AppText>
              <AppText variant="body">{c.mine.emptyBody}</AppText>
              <PrimaryPill slim case="gentle" variant="forest" label={c.mine.emptyCta} onPress={onExplore} style={{ marginTop: spacing[2] }} />
            </>
          )}
        </View>
      </ScrollView>
    );
  }
  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: clearance + spacing[5] }}
      data={feed.data?.items ?? []}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={header}
      refreshControl={<RefreshControl refreshing={feed.isRefetching && !feed.isPending} onRefresh={() => void feed.refetch()} tintColor={colors.brand} />}
      renderItem={({ item }) => <PostRow post={item} g={g} showCircle onOpen={() => router.push({ pathname: "/topic-post", params: { id: item.id } })} />}
      // No empty «conversations» block: a joined circle with nothing yet simply shows her circles, and each circle invites the first post.
      ListEmptyComponent={
        feed.isError ? (
          <View style={{ padding: g, gap: spacing[2] }}>
            <AppText variant="body">{c.topic.loadError}</AppText>
            <TertiaryAction wrap label={c.topic.retry} onPress={() => void feed.refetch()} style={{ alignSelf: "flex-start" }} />
          </View>
        ) : feed.isLoading ? (
          <View style={{ padding: g }}>
            <AppText variant="body" accessibilityLiveRegion="polite">
              {t.common.state.loading}
            </AppText>
          </View>
        ) : null
      }
      ListFooterComponent={
        feed.data?.items.length ? (
          <View style={{ padding: g }}>
            <AppText variant="detail">{c.mine.feedEnd}</AppText>
          </View>
        ) : null
      }
    />
  );
}

/* ── Descubrir ────────────────────────────────────────────────────────── */

/** «Descubrir»: also the second view of the revised Círculos tab (`circulos/CirculosHome.tsx`). */
export function Explore({
  g,
  topics,
  loading,
  error,
  onRetry,
  interests,
  welcome,
  onSaveInterests,
  onEditInterests,
}: {
  g: number;
  topics: TopicDTO[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  interests: CircleInterests;
  welcome: boolean;
  onSaveInterests: (v: CircleInterests) => Promise<void>;
  onEditInterests: () => void;
}) {
  const t = useT();
  const c = t.circleTopics;
  const router = useRouter();
  const clearance = useTabBarClearance(0);
  // The search field raises the keyboard over the results; the last of them
  // must still scroll above it.
  const keyboard = useKeyboard();
  const bottomClearance = Math.max(clearance, keyboard.visible ? keyboard.height : 0) + spacing[5];
  const { join, leave } = useTopicMembership();
  const [leaving, setLeaving] = useState<TopicDTO | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [help, setHelp] = useState(false);
  const suggestions = useQuery({ queryKey: ["topics", "suggestions"], queryFn: api.getMyTopicSuggestions, staleTime: 0 });
  const { ids: suggestedIds, fromInterests } = suggestedTopicIds(interests);
  const suggested = useMemo(() => shortlist(suggestedIds, topics), [suggestedIds, topics]);
  const byId = useMemo(() => new Map(topics.map((x) => [x.id, x])), [topics]);
  const interestNames = interests.interests.map((i) => c.interest[i]).concat(interests.stages.map((s) => byId.get(s)?.name ?? s));
  const searching = query.trim().length > 0;
  const results = useMemo(() => searchTopics(topics, query), [topics, query]);

  const row = (x: TopicDTO) => (
    <CircleRow
      key={x.id}
      topic={x}
      busy={join.isPending && join.variables === x.id}
      onOpen={() => router.push({ pathname: "/topic", params: { id: x.id } })}
      onJoin={() =>
        join.mutate(x.id, {
          onSuccess: () => setNote(c.topic.joinedToast(x.name)),
          onError: (e) => setNote(writeErrorMessage(e, c.topic.loadError)),
        })
      }
      onJoinedPress={() => setLeaving(x)}
    />
  );

  if (welcome) {
    return <Welcome g={g} initial={interests} topics={topics} onSave={onSaveInterests} clearance={clearance} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: g, paddingTop: spacing[3], paddingBottom: spacing[1] }}>
        <TextField
          icon="solar:magnifer-linear"
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          placeholder={c.explore.searchPlaceholder}
          accessibilityLabel={c.explore.searchA11y}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: g, paddingTop: spacing[2], paddingBottom: bottomClearance, gap: spacing[3] }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        {note ? (
          <AppText variant="label" color={colors.buttonForest}>
            {note}
          </AppText>
        ) : null}
        {error ? (
          <View style={{ gap: spacing[2] }}>
            <AppText variant="body">{[c.topic.loadError, c.topic.loadErrorBody].join(" ")}</AppText>
            <TertiaryAction wrap label={c.topic.retry} onPress={onRetry} />
          </View>
        ) : loading ? (
          <AppText variant="body">{t.common.state.loading}</AppText>
        ) : searching ? (
          results.length ? (
            <View>{results.map(row)}</View>
          ) : (
            <AppText variant="body">{c.explore.noResults}</AppText>
          )
        ) : (
          <>
            {/* One heading, then her interests in one quiet line with Edit as a
                small link beside it: the list leads, not the settings. */}
            <View>
              <SectionHeading label={fromInterests ? c.explore.suggestedTitle : c.explore.startTitle} />
              <View style={styles.interestsRow}>
                <AppText variant="bodySmall" color={colors.textSecondary} numberOfLines={1} style={styles.interestsText}>
                  {fromInterests ? c.explore.yourInterests(interestNames.join(", ")) : c.explore.noInterests}
                </AppText>
                <TertiaryAction
                  wrap={false}
                  label={fromInterests ? c.explore.editInterests : c.explore.pickInterests}
                  color={fromInterests ? colors.textSecondary : colors.buttonForest}
                  accessibilityHint={fromInterests ? c.explore.editInterestsA11y : undefined}
                  onPress={onEditInterests}
                />
              </View>
              {suggested.map(row)}
              <AppText variant="bodySmall" color={colors.textSecondary} style={styles.membersOnly}>
                {c.membersOnly}
              </AppText>
            </View>
            {/* The one way to the full list. */}
            <PrimaryPill slim case="gentle" variant="outline" label={showAll ? c.explore.hideAll : c.explore.showAll(topics.length)} onPress={() => setShowAll((s) => !s)} />
            {showAll ? (
              <View>
                <SectionHeading label={c.explore.areas} />
                {topics.filter((x) => x.group === "area").map(row)}
                <SectionHeading label={c.explore.stages} style={{ marginTop: spacing[3] }} />
                {topics.filter((x) => x.group === "stage").map(row)}
              </View>
            ) : null}
            <View style={styles.card}>
              <View style={styles.between}>
                <View style={{ flexShrink: 1 }}>
                  <AppText variant="label">{c.suggest.lead}</AppText>
                </View>
                <TertiaryAction wrap label={c.suggest.open} color={colors.buttonForest} onPress={() => router.push("/topic-suggest")} />
              </View>
              {(suggestions.data ?? []).map((s) => (
                <AppText key={s.id} variant="detail" style={{ paddingBottom: spacing[2] }}>
                  {[s.name, s.status === "pending" ? c.suggest.pending : s.status === "approved" ? c.suggest.approved : c.suggest.declined].join(DOT)}
                </AppText>
              ))}
            </View>
            <TertiaryAction wrap label={c.help.link} color={colors.buttonForest} onPress={() => setHelp(true)} style={{ alignSelf: "flex-start" }} />
          </>
        )}
      </ScrollView>
      <HelpSheet visible={help} onClose={() => setHelp(false)} />
      <LeaveSheet
        topic={leaving}
        visible={!!leaving}
        busy={leave.isPending}
        onClose={() => setLeaving(null)}
        onConfirm={() =>
          leaving &&
          leave.mutate(leaving.id, {
            onSuccess: () => {
              setNote(c.topic.leftToast(leaving.name));
              setLeaving(null);
            },
            onError: (e) => {
              setNote(writeErrorMessage(e, c.topic.loadError));
              setLeaving(null);
            },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", marginTop: spacing[2], padding: 3, gap: 2, borderRadius: radius.pill, backgroundColor: withAlpha(colors.mutedForeground, 0.1) },
  segment: { flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing[2] },
  segmentOn: { backgroundColor: colors.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  row: { minHeight: 48, paddingVertical: spacing[2], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 2 },
  linkRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[2] },
  between: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: spacing[2] },
  interestsRow: { flexDirection: "row", alignItems: "center", gap: spacing[2], marginBottom: spacing[1] },
  interestsText: { flex: 1, minWidth: 0 },
  membersOnly: { marginTop: spacing[3] },
  card: { ...paperSheet, paddingHorizontal: spacing[4], paddingVertical: spacing[1] },
});

/** The optional first visit. Choices stay on the phone (C8) and never join her. */
function Welcome({ g, initial, topics, onSave, clearance }: { g: number; initial: CircleInterests; topics: TopicDTO[]; onSave: (v: CircleInterests) => Promise<void>; clearance: number }) {
  const t = useT();
  const c = t.circleTopics;
  const [picked, setPicked] = useState<TopicInterestId[]>(initial.interests);
  const [stages, setStages] = useState<TopicSeedId[]>(initial.stages);
  const [showStages, setShowStages] = useState(initial.stages.length > 0);
  const [hint, setHint] = useState<string | null>(null);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const nameOf = (id: string) => topics.find((x) => x.id === id)?.name ?? id;
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: g, paddingTop: spacing[4], paddingBottom: clearance + spacing[6], gap: spacing[3] }}>
      <AppText variant="hero" accessibilityRole="header">
        {initial.decided ? c.welcome.changeTitle : c.welcome.title}
      </AppText>
      {initial.decided ? null : <AppText variant="body">{c.welcome.lead}</AppText>}
      <AppText variant="label">{c.welcome.legend}</AppText>
      <View style={styles.chips}>
        {TOPIC_INTEREST_IDS.map((i) => (
          <Chip key={i} label={c.interest[i]} on={picked.includes(i)} onPress={() => setPicked((p) => toggle(p, i))} />
        ))}
      </View>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showStages }} onPress={() => setShowStages((s) => !s)} style={{ minHeight: 44, justifyContent: "center" }}>
        <AppText variant="label" color={colors.buttonForest}>
          {[showStages ? OPEN : CLOSED, c.welcome.stages].join(" ")}
        </AppText>
      </Pressable>
      {showStages ? (
        <View style={{ gap: spacing[2] }}>
          <AppText variant="body">{c.welcome.stagesHint}</AppText>
          <View style={styles.chips}>
            {TOPIC_STAGES.map((s) => (
              <Chip key={s} label={nameOf(s)} on={stages.includes(s)} onPress={() => setStages((p) => toggle(p, s))} />
            ))}
          </View>
        </View>
      ) : null}
      <AppText variant="body">{c.welcome.hint}</AppText>
      {hint ? (
        <AppText variant="body" color={colors.destructive}>
          {hint}
        </AppText>
      ) : null}
      <View style={{ gap: spacing[2], marginTop: spacing[1] }}>
        <PrimaryPill
          slim
          case="gentle"
          variant="forest"
          label={initial.decided ? c.welcome.save : c.welcome.go}
          onPress={() => {
            if (!initial.decided && !picked.length && !stages.length) {
              setHint(c.welcome.pickOne);
              return;
            }
            void onSave({ decided: true, interests: picked, stages: showStages ? stages : [] });
          }}
        />
        {initial.decided ? null : <PrimaryPill slim case="gentle" variant="outline" label={c.welcome.skip} onPress={() => void onSave({ decided: true, interests: [], stages: [] })} />}
      </View>
    </ScrollView>
  );
}
