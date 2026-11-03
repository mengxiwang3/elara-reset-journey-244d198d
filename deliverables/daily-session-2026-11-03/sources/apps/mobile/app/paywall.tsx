import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter, type Href } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, BackHandler, ScrollView, StyleSheet, View } from "react-native";
import { weekIsFree, weekOf, type AreaKey } from "@elara/shared";
import {
  AppText,
  Badge,
  ElaraMark,
  PrimaryPill,
  Icon,
  Screen,
} from "@/components";
import { StickyFooter } from "@/components/system/StickyFooter";
import { TertiaryAction } from "@/components/system/TertiaryAction";
import { useSession } from "@/lib/authClient";
import {
  CrossFade,
  duration as dur,
  FadeIn,
  haptics,
  PressableScale,
  pressOpacity,
  Reveal,
  Skeleton,
  stagger,
  staggerDelay,
  useAnimatedTo,
} from "@/motion";
import {
  hasPrivacyPolicy,
  openLink,
  PRIVACY_URL,
  termsUrl,
} from "@/lib/legal";
import { finalizeOnboarding } from "@/lib/onboarding";
import {
  getOfferings,
  isConfigured,
  notConfiguredMessage,
  packageLabel,
  type PackageLabelKey,
  purchasePackage,
  restorePurchases,
  type PurchasesPackage,
} from "@/lib/purchases";
import { usePathsMap } from "@/hooks/usePaths";
import { useT } from "@/i18n";
import type { Strings } from "@/i18n/types";
import { api } from "@/lib/api";
import { qk, queryClient } from "@/lib/query";
import { useAppStore } from "@/store/useAppStore";
import { colors, layout, radius, spacing, tabular, withAlpha } from "@/theme";

type PlanRow = {
  id: string;
  /** A catalogue key, plus the store's own title when it had a usable one. */
  label: { key: PackageLabelKey; title?: string };
  price: string;
  unit: UnitKey;
  pkg?: PurchasesPackage;
};

/** The store's period units, as the catalogue keys them. */
type PeriodUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

function periodUnit(value: unknown): PeriodUnit | null {
  const u = String(value ?? "").toUpperCase();
  return u === "DAY" || u === "WEEK" || u === "MONTH" || u === "YEAR" ? u : null;
}

/**
 * Everything a plan card says, worked out from the store's own numbers.
 *
 * Nothing here is authored: an intro offer appears because the store product
 * carries one, the "Save 30%" because the annual price really is 30% under
 * twelve months of the monthly one. A card with none of that just says what it
 * costs and how often — never a badge the store can't back.
 */
type PlanCopy = {
  name: string;
  badge: { label: string; tone: "solid" | "onDark" } | null;
  line: string;
  /** The big figure on the right, and the small line under it. */
  figure: string;
  figureNote: string;
  intro: "trial" | "paid" | null;
  /** The trial's length, for the CTA ("Start my 7 days free"). */
  trialPeriod: string | null;
};

function planCopy(p: PlanRow, monthly: PlanRow | undefined, t: Strings): PlanCopy {
  const pw = t.account.paywall;
  const name = p.label.title ?? pw.planNames[p.label.key];
  const unitWord = p.unit ? pw[p.unit] : "";
  const intro = p.pkg?.product?.introPrice ?? null;
  const unit = periodUnit(intro?.periodUnit);
  if (intro && unit) {
    // A three-cycle "first month" offer is three months at that price.
    const n = Math.max(1, (intro.periodNumberOfUnits || 1) * (intro.cycles || 1));
    if (intro.price === 0) {
      const period = pw.periods[unit](n);
      return {
        name,
        badge: { label: pw.trialBadge(period), tone: "solid" },
        line: pw.trialLine(period, p.price, unitWord),
        figure: period,
        figureNote: pw.free,
        intro: "trial",
        trialPeriod: period,
      };
    }
    const first = pw.firstPeriod[unit](n);
    return {
      name,
      badge: { label: pw.introBadge, tone: "solid" },
      line: pw.introLine(intro.priceString, first, p.price, unitWord),
      figure: intro.priceString,
      figureNote: first,
      intro: "paid",
      trialPeriod: null,
    };
  }
  // The annual saving, against twelve of the monthly plan on the same screen.
  const annual = p.pkg?.product;
  const month = monthly?.pkg?.product;
  if (p.unit === "perYear" && annual && month && month.price > 0) {
    const pct = Math.round((1 - annual.price / (month.price * 12)) * 100);
    if (pct >= 5) {
      return {
        name,
        badge: { label: pw.saveBadge(pct), tone: "onDark" },
        line: annual.pricePerMonthString
          ? pw.annualLine(p.price, annual.pricePerMonthString)
          : pw.billed.perYear,
        figure: pw.percentOff(pct),
        figureNote: pw.billedYearly,
        intro: null,
        trialPeriod: null,
      };
    }
  }
  return {
    name,
    badge: null,
    line: p.unit ? pw.billed[p.unit] : pw.billed.once,
    figure: p.price,
    figureNote: unitWord,
    intro: null,
    trialPeriod: null,
  };
}

/**
 * The billing unit beside a price, as a *key* rather than a phrase — same rule
 * as `packageLabel`: a `packageType` carries no language, so the classification
 * happens here and the wording happens in the catalogue.
 */
type UnitKey = "perYear" | "perMonth" | "perWeek" | null;

function unitFor(pkg: PurchasesPackage): UnitKey {
  const type = String(pkg?.packageType ?? "").toUpperCase();
  if (type.includes("ANNUAL")) return "perYear";
  if (type.includes("MONTH")) return "perMonth";
  if (type.includes("WEEK")) return "perWeek";
  return null;
}

/**
 * A `returnTo` that is safe to navigate to.
 *
 * The parameter reaches this screen from a deep link as readily as from an
 * in-app gate, so it is treated as untrusted: only a relative in-app path is
 * honoured, and anything carrying a scheme or a host is dropped in favour of
 * the default. Without this, a crafted link could park an external URL on the
 * far side of a purchase.
 */
function safeReturnTo(value: string | undefined): Href | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes(":")) return null;
  return value as Href;
}

/**
 * Check if a returnTo URL points to a locked (non-free) week.
 * Used to detect if a free user would be immediately bounced back by the gate.
 */
function returnToIsLockedWeek(returnTo: string | undefined, pathsMap: ReturnType<typeof usePathsMap>): boolean {
  if (!returnTo) return false;
  try {
    const url = new URL("http://example.com" + returnTo);
    const dayStr = url.searchParams.get("day");
    const areaParam = url.searchParams.get("area");
    if (!dayStr || !areaParam) return false;
    const area = areaParam as AreaKey;
    const dayNum = Number(dayStr);
    const path = pathsMap[area];
    if (!path) return false;
    const content = path.days[dayNum - 1];
    if (!content) return false;
    const week = weekOf(dayNum, content.config);
    return !weekIsFree(week);
  } catch {
    return false;
  }
}

export default function Paywall() {
  const t = useT();
  const router = useRouter();
  const { data: session } = useSession();
  /**
   * `returnTo` is where an upgrade should land.
   *
   * The default — the tabs — is right for the paywall at the end of
   * onboarding, and wrong for every in-app gate: someone who upgraded to read
   * one locked article has to land back on *that article*, with the thing they
   * were trying to do still in front of them, not on a home screen holding the
   * membership they just bought and no idea where the piece went. Both new
   * specs require it, and it is the part most likely to be skipped, because
   * the purchase itself works either way.
   *
   * Only in-app routes are honoured — see `safeReturnTo`.
   */
  const { resume, returnTo } = useLocalSearchParams<{ resume?: string; returnTo?: string }>();
  const configured = isConfigured();
  // The one area a free account keeps. Named here so "continue with the free
  // path" can say which path that actually is.
  const recommendedArea = useAppStore((s) => s.onboarding.recommendedArea);
  // False while this paywall is the last onboarding beat (see `close`).
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const navigation = useNavigation();
  // Read once per render: `proceed` runs after an await, where a hook call throws.
  const pathsMap = usePathsMap();
  const freeAreaName = pathsMap[recommendedArea]?.areaName ?? null;
  // Sent here by a day in a week her membership does not cover (Hoy, the
  // Atlas, a locked day), rather than at the end of onboarding.
  const isPremium = useAppStore((s) => s.isPremium);
  const lockedWeek = hasOnboarded && !isPremium && returnToIsLockedWeek(returnTo, pathsMap);

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  // Prices only ever come from the store. When payments aren't configured the
  // screen shows no plans at all rather than invented numbers.
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [plan, setPlan] = useState<string>("");
  const [loadingOfferings, setLoadingOfferings] = useState(configured);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(configured ? null : notConfiguredMessage());
  // What "Try again" beside the message repeats: loading the plans, or the
  // purchase itself. Null when the message is not a failure (nothing to
  // restore, payments not configured) — those have nothing to retry.
  const [retry, setRetry] = useState<"load" | "purchase" | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    if (!configured) return;
    // `.catch` as well as `.then`: without it a rejected fetch left
    // `loadingOfferings` true and the paywall sat on a spinner with no way
    // out. Every branch below leaves the screen in a state a person can act on.
    setLoadingOfferings(true);
    getOfferings()
      .then((pkgs) => {
        if (!active) return;
        setLoadingOfferings(false);
        setRetry(null);
        setMessage(null);
        if (!pkgs.length) {
          setMessage(t.account.paywall.noPlans);
          return;
        }
        setPackages(pkgs);
        const rows: PlanRow[] = pkgs.map((p, i) => ({
          id: p.identifier ?? String(i),
          // Never `product.title` — see `packageLabel`. Store titles carry dev
          // copy ("PREVIEW PRODUCT" on a test key) straight onto the paywall.
          label: packageLabel(p),
          price: p.product?.priceString ?? "",
          unit: unitFor(p),
          pkg: p,
        }));
        setPlans(rows);
        // Monthly is preselected (Interaction States spec §13), whatever
        // order the store lists the packages in.
        setPlan((rows.find((r) => r.unit === "perMonth") ?? rows[0])?.id ?? "");
      })
      .catch(() => {
        if (!active) return;
        setLoadingOfferings(false);
        setMessage(t.account.paywall.loadFailed);
        setRetry("load");
      });
    return () => {
      active = false;
    };
  }, [configured, t, loadAttempt]);

  /**
   * Enter the app. After a purchase or a restore (`confirm`), pull the
   * freshest entitlement from the server first.
   */
  const proceed = useCallback(async (opts?: { confirm?: boolean }) => {
    // The purchase is confirmed by the store before RevenueCat's webhook
    // reaches us, so poll briefly rather than reading once and calling the
    // paying user "free". Only then: "Continue with the free path" has
    // nothing to confirm, and polling for a membership she never bought held
    // her on a spinner for five seconds or more.
    let sub: Awaited<ReturnType<typeof api.getSubscription>> | null = null;
    if (opts?.confirm) {
      for (const wait of [0, 700, 1500, 3000]) {
        if (wait) await new Promise((r) => setTimeout(r, wait));
        try {
          // The first read asks the server to check RevenueCat itself; the
          // rest are plain reads while a webhook may still be on its way.
          sub = wait ? await api.getSubscription() : await api.syncSubscription();
        } catch {
          continue;
        }
        if (sub.isPremium) break;
      }
    }
    if (sub) {
      useAppStore.getState().setSubscription(sub);
      queryClient.setQueryData(qk.subscription, sub);
    }
    // Only run the onboarding finalize when the user is still onboarding; users
    // who reach the paywall from an in-app upsell are already onboarded.
    //
    // Caught, not awaited bare: this ran last, after the purchase had already
    // gone through, and a throw here left `busy` true forever — the CTA spun
    // and the screen never moved, which is exactly the frozen spinner the
    // prototype recording ends on. Finalizing is bookkeeping the server also
    // does on its own; it must never strand someone who has just paid outside
    // the app they paid for.
    const wasOnboarding = !useAppStore.getState().hasOnboarded;
    if (wasOnboarding) {
      await finalizeOnboarding().catch(() => {});
    }
    // The poll above can run ~5s while the user stares at a spinner — the
    // longest blind wait in the app. This is the payoff.
    haptics.success();
    const isPremium = sub?.isPremium ?? useAppStore.getState().isPremium;
    // If not premium and the returnTo points to a locked week, skip it.
    // A free user who continues free would be bounced back by the gate anyway.
    const isLockedWeek = !isPremium && returnToIsLockedWeek(returnTo, pathsMap);
    const back = isLockedWeek ? null : safeReturnTo(returnTo);
    if (back) {
      // `dismissTo`, not `replace`. The gated item is almost always already on
      // the stack — she opened the article, hit the gate, and came here — so a
      // `replace` swaps the paywall for a *second* copy of the article and
      // leaves her needing two taps to get back out of one screen. `dismissTo`
      // pops back to the copy that is already there, and falls back to a
      // replace when it isn't (a deep link straight to the paywall).
      router.dismissTo(back);
    } else if (!wasOnboarding && router.canGoBack()) {
      // No item named, but she came from somewhere (Membership, the Paths
      // callout): back to it, which is where the Interaction States spec
      // returns her after a purchase. Landing on Today instead dropped her
      // somewhere she hadn't been.
      router.back();
    } else if (wasOnboarding) {
      // The trial decision is the last onboarding beat. Whether she starts it
      // or chooses the free path, deliver the promise immediately: her first
      // practice, not a generic home tab.
      const st = useAppStore.getState();
      const area = st.onboarding.recommendedArea ?? st.activeArea;
      st.startPath(area);
      router.replace("/(tabs)");
      router.push({ pathname: "/path/day", params: { area, day: "1" } });
    } else {
      // A deep link with no prior screen lands in the app, and can't be swiped
      // back into the purchase screen.
      router.replace("/(tabs)");
    }
  }, [router, returnTo, pathsMap]);

  /**
   * Send her to make an account, then back to *this* paywall.
   *
   * `next` is this paywall's own `returnTo` (the locked day or article), which
   * create-account hands back when it returns here with `dismissTo`. Without
   * it the paywall came back as a second copy that had forgotten the item,
   * and after the purchase "back" landed on this one, still selling.
   */
  const needAccountFirst = useCallback(
    (resumeWith: "1" | "restore" | null) => {
      if (session?.user && !useAppStore.getState().user?.isAnonymous) return false;
      router.push({
        pathname: "/(auth)/create-account",
        params: {
          returnTo: "/paywall",
          ...(resumeWith ? { resume: resumeWith } : {}),
          ...(returnTo ? { next: returnTo } : {}),
        },
      });
      return true;
    },
    [router, session?.user, returnTo],
  );

  const handleStart = useCallback(async () => {
    if (busy) return;
    // Purchases happen against an authenticated account; create one first and
    // come straight back here so the purchase isn't silently abandoned. A
    // "Skip for now" guest counts as no account: a membership she can't sign
    // back in to would be lost with the phone.
    if (needAccountFirst("1")) return;
    // No payments configured → let the free path continue, no fake grant.
    if (!configured) {
      setBusy(true);
      setMessage(notConfiguredMessage());
      try {
        await proceed();
      } catch {
        setBusy(false);
        haptics.error();
        setMessage(t.account.paywall.continueFailed);
      }
      return;
    }
    const selected = packages.find((p) => (p.identifier ?? "") === plan) ?? packages[0];
    if (!selected) {
      // The store answered with no plans, or could not be reached (a build
      // installed outside the store, products not live yet). The button reads
      // "Continue" here and there is no "continue free" link (that shows only
      // beside plans), so refusing left her on this screen with no way into
      // the free path she was just promised. Same as no payments configured.
      setBusy(true);
      try {
        await proceed();
      } catch {
        setBusy(false);
        haptics.error();
        setMessage(t.account.paywall.continueFailed);
      }
      return;
    }
    setBusy(true);
    setMessage(null);
    setRetry(null);
    const res = await purchasePackage(selected);
    if (res.ok) {
      try {
        await proceed({ confirm: true });
      } catch {
        // Entering the app failed after a successful purchase. Release the
        // button and say so, rather than spinning on a screen with no exit.
        setBusy(false);
        haptics.error();
        setMessage(t.account.paywall.activeButStuck);
      }
      return;
    }
    setBusy(false);
    // Backing out of the store sheet is a decision, not a failure — it stays
    // silent. Only a real refusal reports itself.
    if (!res.cancelled && res.message) {
      haptics.error();
      setMessage(res.message);
      setRetry("purchase");
    }
  }, [busy, configured, packages, plan, proceed, needAccountFirst, t]);

  /**
   * Restore moves a store membership onto the signed-in account. A guest's
   * account is one she cannot sign back in to, so restoring onto it could
   * strand a real membership on an anonymous id: account first, like Start.
   */
  const handleRestore = useCallback(async () => {
    if (busy) return;
    if (needAccountFirst("restore")) return;
    setBusy(true);
    setMessage(null);
    setRetry(null);
    const res = await restorePurchases();
    if (res.ok && res.isPremium) {
      try {
        await proceed({ confirm: true });
      } catch {
        setBusy(false);
        haptics.error();
        setMessage(t.account.paywall.activeButStuck);
      }
      return;
    }
    setBusy(false);
    if (res.message) {
      haptics.error();
      setMessage(res.message);
    } else {
      // Nothing to restore isn't an error — the request simply came up empty.
      haptics.warning();
      setMessage(t.account.paywall.nothingToRestore);
    }
  }, [busy, needAccountFirst, proceed, t]);

  // Resuming after account creation: she tapped "Start my Membership" (or
  // Restore) before signing up, so pick it back up as soon as we can. Keyed
  // by the value, because create-account hands the params back to this same
  // screen (`dismissTo`) rather than opening a new one.
  const resumed = useRef<string | null>(null);
  useEffect(() => {
    if ((resume !== "1" && resume !== "restore") || resumed.current === resume) return;
    if (!session?.user || useAppStore.getState().user?.isAnonymous) return;
    if (configured && (loadingOfferings || !packages.length)) return;
    resumed.current = resume;
    if (resume === "restore") void handleRestore();
    else void handleStart();
  }, [resume, session?.user, configured, loadingOfferings, packages.length, handleStart, handleRestore]);

  async function continueFree() {
    if (busy) return;
    if (!session?.user) {
      // Not busy: this screen stays under create-account, and its close and
      // CTA have to work when she comes back to it.
      router.push({
        pathname: "/(auth)/create-account",
        params: { returnTo: "/paywall", ...(returnTo ? { next: returnTo } : {}) },
      });
      return;
    }
    setBusy(true);
    try {
      await proceed();
    } catch {
      setBusy(false);
      haptics.error();
      setMessage(t.account.paywall.continueFailed);
    }
  }

  const canBuy = configured && plans.length > 0;

  // Light status-bar ink on forest — set on focus and handed back on blur
  // rather than mounted as a <StatusBar>, which would stay light over the
  // warm Create Account screen the paywall pushes on top of itself.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  // The monthly plan, which the annual card measures its saving against.
  const monthlyRow = plans.find((p) => p.unit === "perMonth");
  const copies = useMemo(
    () => new Map(plans.map((p) => [p.id, planCopy(p, monthlyRow, t)])),
    [plans, monthlyRow, t],
  );
  const selected = copies.get(plan);
  // The CTA names what she is about to start, so a trial reads as a trial.
  const startLabel =
    selected?.intro === "trial" && selected.trialPeriod
      ? t.account.paywall.startTrial(selected.trialPeriod)
      : selected?.intro === "paid"
        ? t.account.paywall.startIntro
        : t.account.paywall.start;

  /**
   * The close control the design puts top-left. Wherever she came from, that
   * is where "close" goes. Only a paywall with nothing under it (a deep link
   * straight here) falls through to the free path — the same thing "Continue
   * with the free path" does, which is the only other way out.
   */
  function close() {
    if (busy) return;
    // At the end of onboarding, closing is choosing the free path. "Back"
    // from here was the letter, whose button led to create-account for an
    // account she already had: a loop with no way into the app.
    if (!hasOnboarded) void continueFree();
    else if (router.canGoBack()) router.back();
    else void continueFree();
  }
  const closeRef = useRef(close);
  closeRef.current = close;

  // The same for Android's back button and the iOS edge swipe while she is
  // still onboarding: either would pop to the letter.
  useFocusEffect(
    useCallback(() => {
      if (hasOnboarded) return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        closeRef.current();
        return true;
      });
      return () => sub.remove();
    }, [hasOnboarded]),
  );
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: hasOnboarded });
  }, [navigation, hasOnboarded]);

  return (
    <View style={styles.root}>
      <Screen background="transparent" edges={["top"]}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <PressableScale
              size="circle"
              onPress={close}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t.account.paywall.closeA11y}
              style={styles.close}
            >
              <Icon name="solar:close-circle-linear" size={20} color={colors.textSecondary} />
            </PressableScale>
            <AppText variant="label" color={colors.secondary}>
              {t.account.paywall.eyebrow}
            </AppText>
            <View style={styles.topSpacer} />
          </View>

          <FadeIn duration={dur.slow} style={styles.head}>
            <FadeIn duration={dur.slower} scaleFrom={0.96}>
              {/* Her, not a gold star. A membership screen that opens on a
                  trophy is selling a tier; this one is asking someone to keep
                  going with a guide they have just met. */}
              <ElaraMark size={48} />
            </FadeIn>
            <AppText variant="screenTitle" center color={colors.foreground}>
              {t.account.paywall.title}
            </AppText>
            <AppText variant="body" center color={colors.textSecondary}>
              {t.account.paywall.body}
            </AppText>
          </FadeIn>

          {/* What the money is for, before the prices. */}
          <FadeIn delay={stagger.group} duration={dur.slow} style={styles.included}>
            {t.account.paywall.included.items.map((line) => (
              <View key={line} style={styles.includedRow}>
                <Icon name="solar:check-circle-bold" size={18} color={colors.secondary} />
                <AppText variant="body" color={colors.foreground} style={{ flex: 1 }}>
                  {line}
                </AppText>
              </View>
            ))}
          </FadeIn>

          {/* Plan-shaped placeholders while the store answers, so the prices
              land in the slots the skeletons were already holding. */}
          <CrossFade
            contentKey={loadingOfferings ? "loading" : plans.length ? "plans" : "free"}
            style={{ marginTop: spacing[6] }}
          >
            {loadingOfferings ? (
              <View style={{ gap: spacing[3] }}>
                <Skeleton height={84} radiusSize={radius.content} style={styles.skeleton} />
                <Skeleton height={84} radiusSize={radius.content} style={styles.skeleton} />
              </View>
            ) : plans.length ? (
              <View style={{ gap: spacing[3] }} accessibilityRole="radiogroup">
                {plans.map((p, i) => {
                  const active = plan === p.id;
                  const c = copies.get(p.id);
                  if (!c) return null;
                  return (
                    <FadeIn key={p.id} delay={staggerDelay(i)}>
                      <PlanCard
                        active={active}
                        onPress={() => setPlan(p.id)}
                        accessibilityLabel={`${c.name}. ${c.line}`}
                      >
                        <View style={styles.planRow}>
                          <Icon name={active ? "solar:check-circle-bold" : "solar:record-circle-linear"} size={20} color={active ? colors.primary : colors.textSecondary} />
                          <View style={styles.planText}>
                            <View style={styles.planNameRow}>
                              <AppText variant="cardTitle" color={colors.foreground}>
                                {c.name}
                              </AppText>
                              {c.badge ? (
                                <Badge
                                  label={c.badge.label}
                                  // A solid ember badge on the peach of the
                                  // chosen card; the translucent one on forest.
                                  tone={c.badge.tone === "solid" ? "solid" : "ember"}
                                />
                              ) : null}
                            </View>
                            <AppText
                              variant="body"
                              color={active ? colors.textSecondary : colors.textSecondary}
                            >
                              {c.line}
                            </AppText>
                          </View>
                          <View style={styles.planFigure}>
                            <AppText
                              variant="sectionTitle"
                              color={colors.foreground}
                              style={tabular}
                            >
                              {c.figure}
                            </AppText>
                            {c.figureNote ? (
                              <AppText
                                variant="caption"
                                color={active ? colors.textSecondary : colors.textSecondary}
                              >
                                {c.figureNote}
                              </AppText>
                            ) : null}
                          </View>
                        </View>
                      </PlanCard>
                    </FadeIn>
                  );
                })}
              </View>
            ) : lockedWeek ? (
              // Sent here by a week her membership does not cover, with nothing
              // to buy: «Tu camino gratis está listo» was untrue (her free week
              // is behind her) and «Continuar» led back to the same locked day.
              // Say what the free plan holds, and give her a person to ask.
              <View style={styles.freeNote}>
                <AppText variant="cardTitle" center color={colors.foreground}>
                  {t.account.membership.notOnSale}
                </AppText>
                <AppText variant="bodySmall" center color={colors.textSecondary}>
                  {freeAreaName ? t.account.paywall.freeNoteWithArea(freeAreaName) : t.account.paywall.freeNote}
                </AppText>
                <TertiaryAction
                  label={t.account.settings.contactSupport}
                  onPress={() => router.push("/support")}
                  style={{ alignSelf: "center" }}
                />
              </View>
            ) : (
              <View style={styles.freeNote}>
                <AppText variant="cardTitle" center color={colors.foreground}>
                  {t.account.paywall.freeTitle}
                </AppText>
                <AppText variant="bodySmall" center color={colors.textSecondary}>
                  {t.account.paywall.freeBody}
                </AppText>
              </View>
            )}
          </CrossFade>

          {canBuy ? (
            // "Continue with the free path" quietly decides the shape of the
            // whole app — one of six areas, no Circle, no guide. It should say
            // so here rather than let people discover it as a series of locks.
            <AppText variant="bodySmall" center color={colors.textSecondary} style={styles.freeScope}>
              {freeAreaName ? t.account.paywall.freeNoteWithArea(freeAreaName) : t.account.paywall.freeNote}
            </AppText>
          ) : null}

          {/* Guideline 3.1.2: length, auto-renew terms, and both policy links
              must appear with the purchase, not buried in a settings screen. */}
          {canBuy ? (
            <AppText variant="bodySmall" center color={colors.textSecondary} style={styles.disclosure}>
              {t.account.paywall.autoRenewDisclosure}
            </AppText>
          ) : null}
            {/* Restore and policy links sit with the full billing disclosure. */}
              <View style={styles.legalRow}>
                <PressableScale
                  size="chip"
                  dim={pressOpacity}
                  onPress={handleRestore}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t.account.paywall.restore}
                >
                  <AppText variant="label" color={colors.secondary}>
                    {t.account.paywall.restore}
                  </AppText>
                </PressableScale>
                <AppText variant="label" color={colors.textSecondary}>
                  ·
                </AppText>
                <PressableScale
                  size="chip"
                  dim={pressOpacity}
                  onPress={() => openLink(termsUrl())}
                  hitSlop={8}
                  accessibilityRole="link"
                  accessibilityLabel={t.account.paywall.terms}
                >
                  <AppText variant="label" color={colors.secondary}>
                    {t.account.paywall.terms}
                  </AppText>
                </PressableScale>
                <AppText variant="label" color={colors.textSecondary}>
                  ·
                </AppText>
                <PressableScale
                  size="chip"
                  dim={pressOpacity}
                  onPress={() => openLink(PRIVACY_URL)}
                  hitSlop={8}
                  disabled={!hasPrivacyPolicy()}
                  accessibilityRole="link"
                  accessibilityLabel={t.account.paywall.privacyPolicy}
                >
                  <AppText
                    variant="label"
                    color={hasPrivacyPolicy() ? colors.secondary : colors.textSecondary}
                  >
                    {t.account.paywall.privacyPolicy}
                  </AppText>
                </PressableScale>
              </View>

        </ScrollView>

        {/* The purchase, pinned: plans, what's included and the terms scroll
            above it, so choosing a plan never carries the button away. The
            quiet ways out — restore, stay free — sit under it. */}
        <StickyFooter style={styles.footer}>
          <Reveal visible={!!message} style={styles.messageRow}>
            <AppText variant="bodySmall" center color={colors.textSecondary}>
              {message}
            </AppText>
            {/* Global States: what happened, and what she can do now. */}
            {retry ? (
              <DarkLink
                label={t.common.action.retry}
                onPress={() => {
                  if (retry === "load") {
                    setMessage(null);
                    setRetry(null);
                    setLoadAttempt((n) => n + 1);
                  } else void handleStart();
                }}
              />
            ) : null}
          </Reveal>
          <FadeIn delay={stagger.group * 2} style={styles.actions}>
            {canBuy && copies.get(plan) ? (
              <AppText variant="caption" center color={colors.textSecondary}>
                {copies.get(plan)?.line}
              </AppText>
            ) : null}
            <PrimaryPill
              variant="onDark"
              case="gentle"
              label={busy ? t.account.paywall.working : canBuy ? startLabel : t.account.paywall.continue}
              iconRight={busy ? undefined : "solar:arrow-right-linear"}
              loading={busy}
              onPress={handleStart}
            />

            {canBuy ? (
              <View style={styles.secondaryRow}>
                <DarkLink label={t.account.paywall.continueFree} onPress={continueFree} />
              </View>
            ) : null}
          </FadeIn>
        </StickyFooter>
      </Screen>
    </View>
  );
}

/** A quiet text action on forest — Restore, Continue free. */
function DarkLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale
      size="chip"
      dim={pressOpacity}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppText variant="control" color={colors.textSecondary}>
        {label}
      </AppText>
    </PressableScale>
  );
}

/**
 * One plan card. The chosen state is a second surface — peach, with the ember
 * edge — faded over the resting translucent one, so switching plans looks like
 * the highlight moving between two cards rather than both repainting.
 *
 * A visible check, border, and radio state communicate the selected plan.
 */
function PlanCard({
  active,
  onPress,
  accessibilityLabel,
  children,
}: {
  active: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  const on = useAnimatedTo(active ? 1 : 0);
  return (
    <PressableScale
      size="card"
      haptic="select"
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active, checked: active }}
      style={[styles.plan, active && { borderColor: colors.primary }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.planActive, { opacity: on }]}
      />
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundWarm },
  fill: { flex: 1 },
  scroll: { paddingHorizontal: layout.screenMargin, paddingBottom: spacing[6] },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing[2],
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  // The close button's width, so the eyebrow sits on the true centre line.
  topSpacer: { width: 40 },
  head: { alignItems: "center", gap: spacing[3], marginTop: spacing[4], paddingBottom: spacing[2] },
  // Benefits stay on the canvas so only selectable plans look like cards.
  included: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[1],
    gap: spacing[3],
  },
  includedRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing[3] },
  skeleton: { backgroundColor: colors.card },
  plan: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.content,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    overflow: "hidden",
  },
  planActive: {
    backgroundColor: withAlpha(colors.peach, 0.45),
    borderRadius: radius.content,
    borderColor: colors.primary,
    borderWidth: 2,
    margin: -1,
  },
  planRow: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  planText: { flex: 1, gap: spacing[1] },
  planNameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing[2] },
  planFigure: { alignItems: "flex-end", gap: spacing[0.5] },
  freeNote: {
    gap: spacing[2],
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.feature,
    padding: spacing[6],
  },
  footer: { backgroundColor: colors.backgroundWarm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  actions: { gap: spacing[3] },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    columnGap: spacing[6],
    rowGap: spacing[2],
    marginTop: spacing[2],
  },
  freeScope: { paddingHorizontal: spacing[4], marginTop: spacing[6] },
  disclosure: { marginTop: spacing[4], marginBottom: spacing[4] },
  messageRow: { alignItems: "center", gap: spacing[1] },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: spacing[3],
  },
});
