import { focusManager, useQuery } from "@tanstack/react-query";
import { legacyExplorePath } from "@/lib/exploreRoutes";
import { exploreOnFrom } from "@/lib/exploreSwitch";
import { DEFAULT_GUIDE_VOICE } from "@elara/shared";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useExplainerStore } from "@/explainers";
import { useAppStatus } from "@/lib/appStatus";
import { flushAtlasEdits } from "@/hooks/useAtlas";
import { setWorld25dEnabled } from "@/components/world25d/flag";
import { api } from "@/lib/api";
import { useSession } from "@/lib/authClient";
import { dayKey } from "@/lib/dates";
import {
  getNotificationPermission,
  listenForNotificationTaps,
  registerForPush,
  syncReminder,
} from "@/lib/notifications";
import { syncWorkshopReminders } from "@/lib/workshopReminders";
import { flushPendingOnboarding } from "@/lib/onboarding";
import { configurePurchases, loginPurchases } from "@/lib/purchases";
import { refreshForLanguage } from "@/lib/languageSwitch";
import { routeForTap } from "@/lib/notificationRoute";
import { clearAccountQueries, profileFor, qk, queryClient, readFor, reconnected, reconnectRefetch } from "@/lib/query";
import { classifySessionEnd } from "@/store/accountState";
import { adoptRecommendedArea } from "@/store/activeArea";
import { keepPending, prefPending } from "@/store/prefWrites";
import { retryLocaleSync, sessionUserFrom, useAppStore } from "@/store/useAppStore";
import { deliberateEnd } from "./sessionEnd";
import { useSigningOut } from "./signingOut";

/**
 * The device's IANA zone, reported to the server so anything that reasons about
 * *when* something happened — the check-in's date, the guide's sense of the
 * hour, the nightly rollups — agrees with the person living it.
 *
 * Read fresh on every check rather than cached: people fly.
 */
function deviceZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/**
 * Bridges the better-auth session + API into the Zustand UI store: hydrates the
 * user, onboarding flag, active area, path progress, subscription/entitlement,
 * preferences, and today's check-in from the server once a session exists, and
 * clears them on sign-out. Also configures RevenueCat and aligns its
 * app_user_id with the better-auth user id. Mounted once at the app root.
 * Renders nothing.
 */
export function SessionSync() {
  const router = useRouter();
  const { data: session, isPending, error: sessionError, refetch: refetchSession } = useSession();
  const authed = !!session?.user;
  const userId = session?.user?.id;

  const setSessionUser = useAppStore((s) => s.setSessionUser);
  const endSession = useAppStore((s) => s.endSession);
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);
  const setAuthLoaded = useAppStore((s) => s.setAuthLoaded);
  const setActiveArea = useAppStore((s) => s.setActiveArea);
  const hydrateProgress = useAppStore((s) => s.hydrateProgress);
  const setSubscription = useAppStore((s) => s.setSubscription);
  const setFreeArea = useAppStore((s) => s.setFreeArea);
  const setBetaOpenAreas = useAppStore((s) => s.setBetaOpenAreas);
  const setSettings = useAppStore((s) => s.setSettings);
  const hydrateTodayCheckIn = useAppStore((s) => s.hydrateTodayCheckIn);
  const setNotificationPermission = useAppStore((s) => s.setNotificationPermission);

  // A different account on a session that never went through "no session"
  // (a sign-in straight over another): nothing cached for the last one is
  // read as hers. Declared before the queries below so it runs before they
  // subscribe and start fetching for the new account.
  const cacheOwner = useRef<string | null>(null);
  useEffect(() => {
    if (!userId) {
      cacheOwner.current = null;
      return;
    }
    if (cacheOwner.current && cacheOwner.current !== userId) clearAccountQueries(queryClient);
    cacheOwner.current = userId;
  }, [userId]);

  // React Query's "focus" is the browser's; on a phone it is the app coming to
  // the foreground. Only queries that opt in (`refetchOnWindowFocus`, off by
  // default in `lib/query.ts`) refetch on it, and only once stale.
  useEffect(() => {
    focusManager.setEventListener((setFocused) => {
      const sub = AppState.addEventListener("change", (state) => setFocused(state === "active"));
      return () => sub.remove();
    });
  }, []);

  const meQ = useQuery({ queryKey: qk.me, queryFn: api.getMe, enabled: authed });
  // Only this session's account's profile. A cache that outlived a session
  // (expired, revoked) holds the last account's, and acting on it restored and
  // sent that person's held answers under the next person's session.
  const me = profileFor(meQ.data, userId);
  // A launch with no connection settles `/api/me` as an error and lets her in
  // on the persisted profile. Nothing else refetches it (focus refetch is off),
  // so ask again the moment the phone is back online.
  const networkOffline = useAppStatus((s) => s.networkOffline);
  const meFailed = meQ.isError;
  const refetchMe = meQ.refetch;
  useEffect(() => {
    if (!networkOffline && meFailed && authed) void refetchMe();
  }, [networkOffline, meFailed, authed, refetchMe]);
  // The same for the session itself. A launch that could not read it (web
  // has no cached session) keeps her signed in on the persisted profile
  // (`unreachable`), and nothing else asks again: no flush runs and an
  // expired session would never be noticed. Ask once the phone is back online.
  const sessionUnread = !authed && !!sessionError;
  useEffect(() => {
    if (!networkOffline && sessionUnread) void refetchSession();
  }, [networkOffline, sessionUnread, refetchSession]);
  // Everything else a launch without signal failed to read (the CMS paths the
  // day screen walks, Hoy's guide and rhythm, the app's switches) stayed failed
  // after the connection came back: React Query is not told about the phone's
  // connection, so nothing asked again until a screen remounted. Ask once for
  // whatever is on screen and failed, on the way back online (`reconnectRefetch`).
  const wasOffline = useRef(networkOffline);
  useEffect(() => {
    const back = reconnected(wasOffline.current, networkOffline);
    wasOffline.current = networkOffline;
    if (back) void queryClient.refetchQueries(reconnectRefetch);
  }, [networkOffline]);
  // App-wide switches. Not tied to the session, and re-read on a foreground
  // once stale (the focus wiring above) so a flipped switch, the Circle kill
  // switch included, lands without a relaunch.
  const configQ = useQuery({
    queryKey: qk.appConfig,
    queryFn: api.getAppConfig,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
  const setCircleEnabled = useAppStore((s) => s.setCircleEnabled);
  const setBeta = useAppStore((s) => s.setBeta);
  const setExploreEnabled = useAppStore((s) => s.setExploreEnabled);
  const setCircleFeed = useAppStore((s) => s.setCircleFeed);
  const setCircleTopics = useAppStore((s) => s.setCircleTopics);
  const setWorld25d = useAppStore((s) => s.setWorld25d);
  const world25d = useAppStore((s) => s.world25d);
  const setRemoteConfig = useAppStore((s) => s.setRemoteConfig);
  useEffect(() => {
    if (!configQ.data) return;
    setCircleEnabled(configQ.data.features.circle);
    setBeta(configQ.data.features.beta === true);
    setExploreEnabled(exploreOnFrom(configQ.data.features));
    setCircleFeed(configQ.data.features.circleFeed === true);
    setCircleTopics(configQ.data.features.circleTopics === true);
    setWorld25d(configQ.data.features.world25d === true);
    setRemoteConfig({
      dayUnlock: configQ.data.practice?.dayUnlock ?? { kind: "open" },
      links: configQ.data.links ?? { supportEmail: null, betaFeedbackUrl: null },
      workshopRecording: configQ.data.features.workshopRecording === true,
    });
  }, [configQ.data, setCircleEnabled, setBeta, setExploreEnabled, setCircleFeed, setCircleTopics, setWorld25d, setRemoteConfig]);
  // The persisted value is what the 2.5D worlds read; it is applied here so a relaunch keeps the last known switch.
  useEffect(() => {
    setWorld25dEnabled(world25d);
  }, [world25d]);
  // Her progress, tagged with the account it was read for: it is what lets
  // Hoy offer her day (`progressSyncedFor`), and a read that lands after the
  // session changed hands is never taken for the next account's.
  const pathsQ = useQuery({
    queryKey: qk.myPaths,
    queryFn: async () => ({ owner: userId ?? null, list: await api.getMyPaths() }),
    enabled: authed,
  });
  const obQ = useQuery({ queryKey: qk.onboarding, queryFn: api.getOnboarding, enabled: authed });
  const subQ = useQuery({
    queryKey: qk.subscription,
    queryFn: api.getSubscription,
    enabled: authed,
  });
  const checkinsQ = useQuery({
    queryKey: qk.checkins,
    queryFn: api.getCheckIns,
    enabled: authed,
  });
  const explainersQ = useQuery({
    queryKey: qk.explainersFor(userId ?? ""),
    queryFn: api.getExplainers,
    enabled: authed && !!userId,
  });

  // Account-scoped hints are gated on this landing, so nothing re-teaches a
  // returning user in the moment before the server's view arrives. The flush
  // is for anything dismissed while offline on a previous run.
  useEffect(() => {
    if (!userId || !explainersQ.data) return;
    const store = useExplainerStore.getState();
    store.hydrate(userId, explainersQ.data);
    void store.flush(userId);
  }, [userId, explainersQ.data]);

  // Initialize payments once, and align the RevenueCat identity with the user.
  useEffect(() => {
    configurePurchases().then(() => {
      if (userId) loginPurchases(userId);
    });
  }, [userId]);

  useEffect(() => {
    if (isPending) return;
    if (!authed) {
      // Why there is no session decides what happens to what she has not
      // sent (R2-L3). Offline: nothing ended. Expired: held for her account.
      // Log out or deletion: cleared, as their own flows also do.
      const deliberate = deliberateEnd() ?? (useSigningOut.getState().active ? "signedOut" : null);
      const reason = classifySessionEnd({ error: sessionError, deliberate });
      const held = useAppStore.getState();
      const hadAccount = !!(held.lastUserId ?? held.user);
      endSession(reason);
      // Whatever was cached is the account that just left. Log out and
      // deletion clear it themselves; an expired or revoked session did not,
      // and the next account was handed the last one's profile.
      if (reason !== "unreachable" && hadAccount) clearAccountQueries(queryClient);
      setAuthLoaded(true);
      return;
    }
    if (me) {
      setSessionUser(sessionUserFrom(me));
      // A finalize that never landed leaves the server saying "not onboarded"
      // while the member has demonstrably finished. Trusting the server here
      // dropped them back at step 1 of a flow they'd just completed; the local
      // flag holds until `flushPendingOnboarding` gets the write through.
      const pendingOnboarding = useAppStore.getState().onboarding.pendingSync;
      setHasOnboarded(me.hasOnboarded || pendingOnboarding);
      setFreeArea(me.freeArea);
      // The closed beta's rule for her, as the server enforces it. Absent from a
      // server that predates it: then the app draws the rule it always drew.
      setBetaOpenAreas(me.betaOpenAreas);
      const server = {
        showCity: me.prefs.showCity,
        showSeason: me.prefs.showSeason,
        allowMessages: me.prefs.allowMessages,
        eveningCheckIn: me.prefs.eveningCheckIn,
        pushEnabled: me.prefs.pushEnabled,
        push: me.prefs.push,
        reminderTime: me.prefs.reminderTime || "20:00",
        guidePersonality: me.prefs.guidePersonality ?? "sage",
        guideVoice: me.prefs.guideVoice ?? DEFAULT_GUIDE_VOICE,
      };
      // A field she changed whose write has not landed keeps her value: this
      // profile may have been read before it (`prefWrites.ts`).
      const next = keepPending(server, useAppStore.getState().settings, prefPending);
      setSettings(next);
      // Reconcile the on-device daily reminder with the saved preference, then
      // her workshop reminders (which read the push switches just set).
      void syncReminder(next.eveningCheckIn, next.reminderTime).then(() => syncWorkshopReminders());
      setAuthLoaded(true);
      return;
    }
    /**
     * The session is real but the profile did not come back.
     *
     * `authLoaded` used to be set only on `meQ.data`, so a failed or
     * never-settling `/api/me` left it false forever — and `app/index.tsx`
     * renders an empty canvas until it flips. One failed request on a flaky
     * connection was therefore a permanently blank app, with no error, no
     * retry and nothing on screen to explain it. It is the same class of hole
     * as the missing offline and maintenance fallbacks, on the one screen that
     * every launch passes through.
     *
     * So the gate opens when the query *settles*, either way. The session is
     * what says who is signed in; `/api/me` only fills in their profile, and
     * the persisted store already holds the last copy of it. Being let into a
     * slightly stale app beats being held outside a blank one — and the offline
     * banner is now there to say why nothing is fresh.
     */
    if (meQ.isError) {
      // The persisted copy only counts if it is this session's account. If it
      // is missing or someone else's, the session itself says enough to keep
      // her signed in until `/api/me` answers.
      const held = useAppStore.getState().user;
      const su = session?.user as
        | { id: string; name?: string | null; email?: string | null; image?: string | null; isAnonymous?: boolean | null }
        | undefined;
      if (su && held?.id !== su.id) {
        setSessionUser({
          id: su.id,
          name: su.name ?? "",
          email: su.email ?? "",
          avatar: su.image ?? null,
          isAnonymous: su.isAnonymous === true,
        });
      }
      setAuthLoaded(true);
    }
  }, [
    isPending,
    authed,
    session,
    sessionError,
    me,
    meQ.isError,
    endSession,
    setSessionUser,
    setHasOnboarded,
    setFreeArea,
    setBetaOpenAreas,
    setSettings,
    setAuthLoaded,
  ]);

  /**
   * Tell the server which language this app is in.
   *
   * The app is the source of truth: it opens in Spanish and changes only when
   * she toggles English, so the account is made to agree with it rather than the
   * other way round. (An account's stored value may be a guess from an earlier
   * build that read the phone's language, and adopting that would put a
   * Spanish-first app back into English.) It is sent once per launch per
   * account, and writing the value the server already holds is a no-op there.
   * Push, email and the guide's replies all read the saved value, so this is
   * what keeps them in the language she sees.
   */
  const localeSentFor = useRef<string | null>(null);
  useEffect(() => {
    if (!authed || !me) return;
    const { locale } = useAppStore.getState();
    const id = userId ?? null;
    if (me.prefs.locale === locale && localeSentFor.current === id) return;
    localeSentFor.current = id;
    const differed = !!me.prefs.locale && me.prefs.locale !== locale;
    api
      .updateMe({ locale })
      // The server answers in the saved language, so anything this launch
      // already fetched came back in the old one: ask again now it agrees.
      .then(() => (differed ? refreshForLanguage(queryClient, locale) : undefined))
      .catch(() => {});
  }, [authed, me, userId]);

  // Keep the server's copy of the zone current. Fires only on a real change,
  // so it costs one PATCH at first sign-in and then nothing until someone
  // travels. Failures are ignored: every server-side reader falls back to UTC,
  // which is the same place it was before this ever ran.
  useEffect(() => {
    if (!authed || !me) return;
    const zone = deviceZone();
    if (!zone || zone === me.prefs.timezone) return;
    api.updateMe({ timezone: zone }).catch(() => {});
  }, [authed, me]);

  // Register this device for server-sent push (DMs, requests, event reminders)
  // once a session exists and the user hasn't muted them.
  //
  // `registerForPush` no longer raises the OS dialog — it returns null unless
  // permission has already been granted. Asking here is what put the system
  // prompt in front of a brand-new account seconds after signup, with no
  // context and nothing yet to notify them about. The ask now belongs to the
  // Notifications and Daily reminder screens, and to `NotificationPrimer`.
  useEffect(() => {
    if (!authed || !me?.prefs.pushEnabled) return;
    void registerForPush();
  }, [authed, me?.prefs.pushEnabled]);

  // Keep the store's view of the OS permission current, so every screen that
  // reports notification state reports the same thing. Re-read on foreground:
  // the member may have just changed it in the Settings app.
  useEffect(() => {
    const read = () => void getNotificationPermission().then(setNotificationPermission);
    read();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") read();
    });
    return () => sub.remove();
  }, [setNotificationPermission]);

  // The moment the phone says yes, act on it: schedule the reminder she already
  // asked for and register for push. Without this a grant changed nothing
  // until the next launch re-read `/api/me` — the primer's "Remind me" was
  // answered, and no reminder came that evening. Keyed on the permission, so it
  // covers every route to a grant: the primer, the reminder and notification
  // screens, Settings' "Turn on", and a return from the phone's Settings app.
  const notificationPermission = useAppStore((s) => s.notificationPermission);
  useEffect(() => {
    if (!authed || notificationPermission !== "granted") return;
    const { eveningCheckIn, reminderTime, pushEnabled } = useAppStore.getState().settings;
    void syncReminder(eveningCheckIn, reminderTime).then(() => syncWorkshopReminders());
    if (pushEnabled) void registerForPush();
  }, [authed, notificationPermission]);

  // The daily and workshop reminders on the phone are written out in the
  // language that was on when they were scheduled (`strings()` at schedule
  // time), and nothing re-wrote them when she changed it: after switching to
  // Spanish in Settings, that evening's reminder still arrived in English,
  // until a relaunch re-read `/api/me`. So a change of language re-schedules
  // them, the same way a permission grant does.
  const locale = useAppStore((s) => s.locale);
  const remindersLocale = useRef(locale);
  useEffect(() => {
    if (remindersLocale.current === locale) return;
    remindersLocale.current = locale;
    if (!authed || useAppStore.getState().notificationPermission !== "granted") return;
    const { eveningCheckIn, reminderTime } = useAppStore.getState().settings;
    void syncReminder(eveningCheckIn, reminderTime).then(() => syncWorkshopReminders());
  }, [authed, locale]);

  // Her paths, Elara's replies, events, memory and the rest are re-asked for
  // on a language change by `setLocale` itself, once the server has heard about
  // it (`languageSwitch.createLocaleSync`); a switch it never heard about is
  // sent again on the next foreground (the flush below).

  // Retry an onboarding finalize that never reached the server — on the launch
  // that finds a session, and on every return to the foreground, which is the
  // cheapest proxy for "the connection may have come back".
  useEffect(() => {
    if (!authed) return;
    void flushPendingOnboarding();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void flushPendingOnboarding();
    });
    return () => sub.remove();
  }, [authed]);

  // Same shape, same reason, for a check-in written while offline. It shares
  // the onboarding flush's trigger rather than adding a network listener: a
  // return to the foreground is the cheapest honest proxy for "the connection
  // may have come back", and the queue is idempotent per date, so an extra
  // attempt costs one request that the server resolves as an update.
  //
  // This one matters more than it looks. The streak, the milestone ladder and
  // the beat that celebrates crossing one are all derived from these rows, so a
  // check-in that never lands is a day of her rhythm that silently never
  // happened.
  useEffect(() => {
    if (!authed || !userId) return;
    const flush = () => {
      const store = useAppStore.getState();
      void store.flushCheckIns();
      // Step answers given offline ride the same trigger (see `pendingSteps`),
      // and so do Atlas reflection edits (see `useAtlasCache.pending`): only
      // this session's account's own.
      void store.flushSteps();
      void store.flushFeedback();
      void flushAtlasEdits(userId);
      void retryLocaleSync();
    };
    flush();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") flush();
    });
    return () => sub.remove();
  }, [authed, userId]);

  // Route a tapped notification to the screen its payload names. Only while
  // signed in — a deep link into Circle would bounce off the auth gate anyway,
  // and routing an unauthenticated app somewhere it can't render is worse than
  // doing nothing.
  useEffect(() => {
    if (!authed) return;
    return listenForNotificationTaps((path) => {
      // Circle switched off: a push about it opens nothing, rather than a
      // Circle screen the switch is meant to hide. Read at tap time.
      const route = routeForTap(path, { circleEnabled: useAppStore.getState().circleEnabled });
      if (!route) return;
      // A malformed or stale path must never take the app down with it.
      try {
        // Pushes sent before Explore's pages moved into its tab still say
        // `/event-detail?id=…`; send those to where the page lives now.
        router.push(legacyExplorePath(route) as never);
      } catch {
        // ignore
      }
    });
  }, [authed, router]);

  // Applied again when the store changes hands: a sign-in that resets the
  // store after her read has landed would otherwise leave it empty. Only a
  // read made for the account signed in now: never one that outlived a
  // Log out (the store would take back the last account's progress) or a
  // change of account.
  const storeUserId = useAppStore((s) => s.user?.id ?? null);
  useEffect(() => {
    const read = readFor(pathsQ.data, userId);
    if (read) hydrateProgress(read.list, read.owner);
  }, [pathsQ.data, hydrateProgress, storeUserId, userId]);

  // Onboarding's recommended Area, only while she has not started another
  // (`adoptRecommendedArea`): applied on every read, it put a member who had
  // moved to a second path back on her first at every relaunch.
  useEffect(() => {
    const recommended = obQ.data?.recommendedArea;
    if (!recommended || !pathsQ.data) return;
    const { activeArea, progress } = useAppStore.getState();
    const adopt = adoptRecommendedArea({
      activeArea,
      recommended,
      serverAreas: pathsQ.data.list.map((p) => p.area),
      local: progress[activeArea],
    });
    if (adopt) setActiveArea(recommended);
  }, [obQ.data, pathsQ.data, setActiveArea]);

  useEffect(() => {
    if (subQ.data) setSubscription(subQ.data);
  }, [subQ.data, setSubscription]);

  // Which day it is, moved on a return to the foreground and at midnight, so
  // nothing keeps showing yesterday as today: a phone left with the app open
  // overnight, or brought back in the morning. A new day re-reads the
  // check-ins and the streak, which are both counted per day.
  const setTodayKey = useAppStore((s) => s.setTodayKey);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      const now = new Date();
      const key = dayKey(now);
      const changed = useAppStore.getState().todayKey !== key;
      setTodayKey(key);
      if (changed) {
        void queryClient.invalidateQueries({ queryKey: qk.checkins });
        void queryClient.invalidateQueries({ queryKey: qk.streak });
      }
      if (timer) clearTimeout(timer);
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timer = setTimeout(check, midnight.getTime() - now.getTime());
    };
    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, [setTodayKey]);

  const todayKey = useAppStore((s) => s.todayKey);
  useEffect(() => {
    if (checkinsQ.data) {
      // `dayKey` and not `toISOString()`: the server now stamps check-ins with
      // the member's *local* date, so a UTC read here would fail to find
      // today's row for part of every day outside UTC. See lib/dates.ts.
      const today = checkinsQ.data.find((c) => c.date === todayKey);
      hydrateTodayCheckIn(todayKey, today?.mood ?? null);
    }
  }, [checkinsQ.data, todayKey, hydrateTodayCheckIn]);

  return null;
}
