import { api } from "@/lib/api";
import { queryClient, qk } from "@/lib/query";
import { useAppStore } from "@/store/useAppStore";

/**
 * Push the locally-captured onboarding draft (concern, the clarity-audit
 * answers and the area the member chose) to the API and finalize.
 *
 * Returns true if the server accepted it. On failure the draft is *kept* and
 * flagged `pendingSync`, and `flushPendingOnboarding()` retries it. Nothing
 * here throws — onboarding must never dead-end on a bad connection.
 */
async function pushDraft(): Promise<boolean> {
  const st = useAppStore.getState();
  const { concern, answers, recommendedArea, areaConfirmed, statedArea } = st.onboarding;
  try {
    await api.saveOnboarding({
      concern: concern || undefined,
      // `onboarding.answers` is a real column; these were collected and dropped.
      answers: Object.keys(answers).length ? answers : undefined,
      // Step 2 tells the member "you know better than we do" — this is the line
      // that makes that true. Without it the server re-ran its keyword guess
      // over the concern text and provisioned *that* path, so someone who
      // picked Health & Body could land on Money Clarity.
      chosenArea: areaConfirmed ? recommendedArea : undefined,
      // What she said matters, as she said it. While the beta has only Money
      // open, `chosenArea` is where she starts; this is what she told us.
      statedArea: statedArea ?? undefined,
    });
    const done = await api.completeOnboarding();
    // The server has the last word on where she starts (during the beta it
    // keeps everyone in Money Clarity, whatever this phone drew before the
    // app's config arrived). The paywall starts *this* area's Day 1, so adopt
    // it here rather than open a path the server will not let her answer.
    const area = done?.recommendedArea;
    if (area && area !== useAppStore.getState().onboarding.recommendedArea) {
      useAppStore.getState().setRecommendedArea(area, true);
      useAppStore.getState().setActiveArea(area);
    }
    return true;
  } catch {
    return false;
  }
}

/** Together, not one after another: each waits on its own refetch. */
async function refetchAccount(): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: qk.me }),
    queryClient.invalidateQueries({ queryKey: qk.myPaths }),
    queryClient.invalidateQueries({ queryKey: qk.onboarding }),
  ]);
}

/**
 * Finish onboarding.
 *
 * The member is let through either way — holding someone on a spinner because
 * their train went into a tunnel is worse than letting them start. But "let
 * through" is no longer the same as "done": a failed write leaves `pendingSync`
 * set, the app says so on the home screen, and every later launch and
 * foreground retries it. Previously the local flag was set unconditionally with
 * nothing tracking the failure, so the answers were simply lost and `/api/me`
 * later put the member back at step 1.
 */
export async function finalizeOnboarding(): Promise<boolean> {
  const st = useAppStore.getState();
  const ok = await pushDraft();
  // `syncedAt` is left alone on failure: it records when the draft last reached
  // the server, and a failed attempt doesn't unmake an earlier success.
  st.setOnboardingSync(ok ? { pendingSync: false, syncedAt: Date.now() } : { pendingSync: true });
  st.setHasOnboarded(true);
  // Today's first visit opens with a line from her summary (spec §3).
  st.setTodayWelcomePending(true);
  await refetchAccount();
  // Her account is brand new, so the path this phone starts for her is all
  // the progress there is: Hoy may offer it without waiting on a read, which
  // offline would never come (`accountState.progressReady`).
  const owner = useAppStore.getState().user?.id;
  if (owner && useAppStore.getState().progressSyncedFor !== owner) {
    useAppStore.getState().markProgressSynced(owner);
  }
  return ok;
}

let flushing = false;

/**
 * Retry a finalize that never landed. Safe to call on every launch, every
 * foreground, and whenever a session appears — it no-ops unless there is a
 * pending draft, and it will not run twice at once.
 */
export async function flushPendingOnboarding(): Promise<boolean> {
  const st = useAppStore.getState();
  if (!st.onboarding.pendingSync || !st.user || flushing) return false;
  flushing = true;
  try {
    const ok = await pushDraft();
    if (!ok) return false;
    useAppStore.getState().setOnboardingSync({ pendingSync: false, syncedAt: Date.now() });
    await refetchAccount();
    return true;
  } finally {
    flushing = false;
  }
}
