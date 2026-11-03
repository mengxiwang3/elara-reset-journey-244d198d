import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { AppText } from "../../AppText";
import { Icon } from "../../Icon";
import { KeyboardAvoider } from "../../KeyboardAvoider";
import { ELARA_ORB } from "../../system/ElaraMark";
import { ElaraShimmer } from "../../system/ElaraShimmer";
import { TertiaryAction } from "../../system/TertiaryAction";
import { PracticeCta } from "../DayChrome";
import { ElaraNote } from "../ElaraNote";
import { TakeawayCard, type TakeawaySlotView } from "../TakeawayCard";
import type { DayImage } from "@/content/dayImages";
import type { PlaceId } from "@/content/places";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useScreenReader } from "@/hooks/useScreenReader";
import { useT } from "@/i18n";
import { duration as dur, ease, FadeIn, PressableScale, useLoopProgress, useReducedMotion } from "@/motion";
import { colors, fontFamily, layout, shellHitTarget, spacing, withAlpha } from "@/theme";
import { LandscapeScene, type SceneHandle } from "./LandscapeScene";
import {
  BAND_MS,
  BREATHE_MS,
  bandHeight,
  bandMax,
  bandSize,
  CIRCLE,
  DRIFT_MS,
  GLOW_MS,
  PAN_BEZIER,
  PAN_MS,
  panFraction,
  photoFit,
  sessionBand,
  stripFor,
  TALL_PAN,
  tallFrame,
  tornOverlay,
  type BandState,
} from "./photoDay";
import { DayScrollContext } from "../dayScroll";
import { NextHorizon } from "./WeekClose";
import { SavingChip } from "./WorldChrome";
import type { SessionClose, WorldDayHandle, WorldDayProps } from "./WorldDay";

/**
 * One day inside a world, in the photo band (Oct 2026 "Money Journey"
 * prototype). The production Step screen's chrome around a realistic
 * photograph: the scene band at the top with a torn paper edge and the
 * darker sheet showing under it, Elara's orb on the edge, back, "Where is
 * this?" and sound circles over the picture, the place pill ("Toward the
 * cave", "Question 1 of 2", "Lan Hạ Bay · Day 1"), and the plain cream page
 * below with the question.
 *
 * The pill sits on the band's foot only while the page is at rest. As soon as
 * the page scrolls or the keyboard opens it folds into one line in the header
 * row, so it never covers a heading; and "Saving your place" has its own slot
 * in the page, above the question, so no notice is ever drawn over the pill.
 *
 * The band keeps the day's own photograph (`dayPhoto`) for the whole day and
 * slides it one step at a time as she answers: 0 at the arrival, a step of
 * `1 / (steps + 1)` per question, all the way when the day is done, and a slow
 * drift on the week's reveal. A wide picture (Lan Hạ Bay's panoramas, a
 * landscape photo) pans sideways; a tall one is laid at the window's width and
 * pans down its middle (`photoFit`). A world with no place keeps its own art.
 *
 * Same handle and props as `WorldDay`, so the day screen saves first and then
 * calls `beat`, `arrive`, `closeWorld` or `settle` exactly as before. The
 * states: `arrive` (the way in, with Start), `walk` (the questions), `done`
 * (the day done), `revealed` (the week revealed), `horizon` (the next place).
 *
 * Motion: the pan (1.8 s), the band's height (0.5 s), the slow breathe and
 * the reveal's drift all run on the native driver. Under Reduce Motion, or
 * with a screen reader on, everything lands at once and nothing loops.
 */
export interface BandPlace {
  id: PlaceId;
  /** The place the day's photograph shows ("Lan Hạ Bay", "Moraine Lake"). */
  name: string;
  /** The "Where is this?" card's title ("Lan Hạ Bay, Vietnam", "Moraine Lake, Banff, Canada"). */
  where: string;
  /** The card's line: where the picture stands ("The rafts"), or the client's line about the day's place. */
  line: string;
  /** The day's own photograph. */
  photo: DayImage;
}

export interface BandArrive {
  /** "Lan Hạ Bay · Day 1" */
  eyebrow: string;
  title: string;
  body: string | null;
  payoff?: string | null;
  start: string;
  /** The daily session's opening, for a day with a `purpose`: drawn instead of the lines above. */
  session?: SessionOpening | null;
}

/**
 * The daily session's opening (Nov 2026): why today matters and what she
 * will leave with, before any effort. Shown only on the way into a day with a
 * `purpose`, never on a resume (`opensOnSession`).
 */
export interface SessionOpening {
  /** «Wuzhen · Día 1 · Unos 3 minutos». */
  eyebrow: string;
  /** The day's stop («Hacia el camino adelante»). */
  title: string;
  /** «Por qué hoy». */
  whyLabel: string;
  purpose: string;
  /** «Hoy te llevas». */
  cardLabel: string;
  /** The empty card: one slot per step with a place on it, its hint in the slot. */
  slots: readonly TakeawaySlotView[];
  /** The week's note, on the first day of a week («Semana 2 · Ingresos y posibilidades»). */
  weekNote: { title: string; body: string | null } | null;
  /** «La última vez anotaste»: her last takeaway, verbatim, and the day she wrote it. */
  last: { label: string; text: string; where: string } | null;
}

/** What the photo band adds to a world day's props. */
export interface BandExtras {
  /** The photographed place, or null: the world's own art in the band (a world with no place). */
  place: BandPlace | null;
  /** The way in, for a day that opens on its arrival (a world's first day). */
  arriveScreen: BandArrive;
  /** The week's last day: the done screen's way on to the reveal. */
  seeWhere: string;
  /** Out of the day from the done and revealed screens (their back circle). */
  onLeave: () => void;
}

export type BandDayProps = Omit<WorldDayProps, "band"> & BandExtras;

type Phase = "arrive" | "walk" | "done" | "revealed" | "horizon";

const HERO_ASPECT = 680 / 400;
const SHEET = "#e9dfc8";
const LINE = "#ddd3bd";
const WHITE = "#fffefb";
const SCENE_BG = "#8a8f84";
const GLOW = "#ffb06e";

export const BandDay = forwardRef<WorldDayHandle, BandDayProps>(function BandDay(
  {
    world,
    initial,
    opening,
    onOpened,
    onArrived,
    header,
    backLabel,
    onBack,
    trailing,
    children,
    arrival,
    close,
    saving,
    startArrived,
    startRevealed,
    place,
    arriveScreen,
    seeWhere,
    onLeave,
  },
  ref,
) {
  const t = useT();
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const reduced = useReducedMotion();
  const screenReader = useScreenReader();
  const instant = reduced || screenReader;
  const scene = useRef<SceneHandle>(null);

  const initialPhase: Phase = startRevealed
    ? "revealed"
    : startArrived
      ? "done"
      : opening && opening.kind !== "return"
        ? "arrive"
        : "walk";
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  /** The week's last day: the done screen leads on to the reveal. */
  const [closing, setClosing] = useState(false);
  const [tip, setTip] = useState(false);
  /** "Back at the rafts.": said in the pill on a day she comes back to, until she moves on. */
  const [returnLine, setReturnLine] = useState<string | null>(opening?.kind === "return" ? opening.line : null);

  const announce = useCallback((text: string) => {
    if (!text) return;
    AccessibilityInfo.announceForAccessibilityWithOptions?.(text, { queue: true }) ??
      AccessibilityInfo.announceForAccessibility(text);
  }, []);

  // ---------- the band: its height in each state ----------

  const state: BandState = phase === "arrive" ? "arrive" : phase === "walk" ? "step" : phase === "done" ? "done" : "atlas";
  const dims = { height: win.height, fontScale: win.fontScale, topInset: insets.top };
  // The session's opening and close have more to say than a title and a
  // button: the picture steps down (`sessionBand`) so «Por qué hoy»,
  // the card and the week's note or her last takeaway are read before
  // «Empezar», and her card with Elara's note under it before «Volver a Hoy».
  const sessionOpening = phase === "arrive" && !!arriveScreen.session;
  const sessionClose = phase === "done" && !!arrival.session;
  const target = sessionOpening || sessionClose
    ? sessionBand(dims)
    : bandHeight(state, {
        ...dims,
        keyboard: keyboard.visible && phase === "walk",
        reply: !!header.reply && phase === "walk",
      });
  const hMax = bandMax(dims);
  const compact = bandSize(dims) === "compact";
  const [band] = useState(() => new Animated.Value(target));
  useEffect(() => {
    if (instant) {
      band.setValue(target);
      return;
    }
    const anim = Animated.timing(band, { toValue: target, duration: BAND_MS, easing: Easing.ease, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [band, instant, target]);

  // ---------- the pan: how far along the picture the day stands ----------

  const stepIndex = Math.max(0, header.on - 1);
  const frac = state === "step" && header.on <= 0 ? 0 : panFraction(state, stepIndex, header.steps);
  const along = frac;
  const [pan] = useState(() => new Animated.Value(place ? (opening?.kind === "return" && initialPhase === "walk" ? 0 : frac) : 0));
  const hasPhoto = !!place;
  const drifting = phase === "revealed" || phase === "horizon";
  useEffect(() => {
    if (!hasPhoto) return;
    if (drifting) {
      // The week revealed: the picture drifts end to end and back (26 s each way).
      if (instant) return;
      const there = Animated.timing(pan, { toValue: 0, duration: DRIFT_MS, easing: Easing.linear, useNativeDriver: true });
      const back = Animated.timing(pan, { toValue: 1, duration: DRIFT_MS, easing: Easing.linear, useNativeDriver: true });
      const drift = Animated.loop(Animated.sequence([there, back]));
      drift.start();
      return () => drift.stop();
    }
    if (instant) {
      pan.setValue(along);
      return;
    }
    const anim = Animated.timing(pan, {
      toValue: along,
      duration: PAN_MS,
      easing: Easing.bezier(...PAN_BEZIER),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
    // Primitives only: the day screen hands down a new `place` object on every render, and a restarted pan never lands.
  }, [along, drifting, hasPhoto, instant, pan]);

  // The slow breathe of the picture (16 s each way) and the orb's glow.
  const breathe = useLoopProgress({ duration: BREATHE_MS * 2, pingPong: true, enabled: !instant, easing: ease.standard });
  const glow = useLoopProgress({ duration: GLOW_MS, pingPong: true, enabled: !instant && !!place });

  // ---------- the opening ----------

  useEffect(() => {
    if (opening?.kind !== "return" || initialPhase !== "walk") return;
    // A day she comes back to: the line is said once, the scene walks on to today.
    announce(opening.reducedLine);
    onOpened?.();
    if (!place) {
      const id = setTimeout(() => scene.current?.walkTo(opening.today), instant ? 0 : 600);
      return () => clearTimeout(id);
    }
    // Once, on mount: the opening is the way in, not a reaction to state.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!returnLine) return;
    const id = setTimeout(() => setReturnLine(null), RETURN_LINE_MS);
    return () => clearTimeout(id);
  }, [returnLine]);

  const begin = () => {
    setTip(false);
    setPhase("walk");
    if (!place) scene.current?.enter?.();
    onOpened?.();
  };

  // ---------- the handle ----------

  const [content] = useState(() => new Animated.Value(1));
  const rising = useRef<(() => void) | null>(null);
  const finishRise = useCallback(() => {
    const done = rising.current;
    rising.current = null;
    done?.();
  }, []);

  const reveal = useCallback(() => {
    if (!close) return;
    close.onShown();
    setClosing(false);
    setPhase("revealed");
    announce(close.announce);
  }, [announce, close]);

  useImperativeHandle(ref, () => ({
    beat(response, { caption, onRise }) {
      // A beat still fading ends first: only the latest plays.
      if (rising.current) finishRise();
      if (phaseRef.current !== "walk") {
        onRise();
        return;
      }
      setTip(false);
      setReturnLine(null);
      if (!place) scene.current?.advance(response);
      if (instant) {
        onRise();
        if (!place && caption) announce(caption);
        return;
      }
      // The question fades, the next one comes up as the picture slides on.
      rising.current = onRise;
      Animated.timing(content, { toValue: 0, duration: dur.fast, easing: ease.exit, useNativeDriver: true }).start(() => {
        finishRise();
        Animated.timing(content, { toValue: 1, duration: dur.slow, easing: ease.entrance, useNativeDriver: true }).start();
      });
    },
    arrive({ replay }) {
      rising.current = null;
      content.setValue(1);
      Keyboard.dismiss();
      if (!place && !replay) scene.current?.arrive();
      setTip(false);
      setPhase("done");
      announce(arrival.announce);
      if (!replay) onArrived?.();
    },
    closeWorld({ replay }) {
      if (!close) return;
      rising.current = null;
      content.setValue(1);
      Keyboard.dismiss();
      setTip(false);
      if (replay) {
        reveal();
        return;
      }
      // The week's last day: the day done first, then "See where I walked" opens the reveal.
      if (!place) scene.current?.completeWorld();
      setClosing(true);
      setPhase("done");
      announce(arrival.announce);
    },
    settle(next) {
      // A beat still fading is dropped, so its rise cannot move the cursor on after this.
      rising.current = null;
      content.setValue(1);
      if (!place) scene.current?.settleTo(next);
    },
  }));

  // ---------- geometry ----------

  const W = win.width;
  const source: ImageSourcePropType | null = place?.photo.source ?? null;
  const aspect = place?.photo.aspect ?? HERO_ASPECT;
  const fit = photoFit(aspect, W, hMax);
  const strip = useMemo(() => stripFor({ width: W, hMax, aspect }), [W, aspect, hMax]);
  const frame = useMemo(() => tallFrame({ width: W, hMax, aspect }), [W, aspect, hMax]);
  const torn = useMemo(() => tornOverlay(W, target), [W, target]);
  const topY = Math.max(insets.top, spacing[3]);
  const pad = compact ? COMPACT_PAD : PAD;

  // The body follows the band: laid out at the band's target, moved on the native driver from where it stood.
  const bodyY = band.interpolate({ inputRange: [0, 1], outputRange: [-target, 1 - target] });

  const toward = header.toward;
  const pillSmall = returnLine ?? header.placeDay;
  // "Question 1 of 2", in words, while she is on a question; the week's seven
  // days are counted on Today and the week screens, never here.
  const question = phase === "walk" && header.on > 0 && header.steps > 0 ? t.practice.header.questionOf(header.on, header.steps) : null;
  // Scrolled or typing: the pill folds into the header row (with a little
  // hysteresis so a page resting at a few points does not flicker it).
  const [scrolled, setScrolled] = useState(false);
  const onPageScroll = useCallback((y: number) => {
    setScrolled((was) => (was ? y > 4 : y > 12));
  }, []);
  const folded = phase === "walk" && (keyboard.visible || scrolled);
  // Typing with the question scrolled away: a short version of it stays above
  // the field (two lines at most), so she never writes without seeing what
  // she is answering. Under the folded strip, never over the picture.
  const questionLine = phase === "walk" && keyboard.visible && scrolled && header.title ? header.title : null;
  const showControls = phase !== "horizon";
  const backPress = phase === "done" || phase === "revealed" ? onLeave : onBack;

  return (
    <View style={styles.root}>
      {/* The scene band. Laid out once at its tallest; the page covers what is below the band. */}
      <View style={[styles.scene, { height: hMax + spacing[4] }]} pointerEvents="none">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transformOrigin: ["60%", "60%", 0],
              transform: [
                { translateY: breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
                { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
              ],
            },
          ]}
        >
          {place && source && fit === "tall" ? (
            <PhotoTall source={source} frame={frame} band={band} pan={pan} label={t.photoDay.sceneA11y(place.name, place.line)} />
          ) : place && source ? (
            <PhotoStrip source={source} strip={strip} band={band} pan={pan} width={W} label={t.photoDay.sceneA11y(place.name, place.line)} />
          ) : (
            <Animated.View
              style={{
                width: W,
                height: hMax,
                // Laid out at the band's tallest; the window shows its middle.
                transform: [{ translateY: band.interpolate({ inputRange: [0, hMax], outputRange: [-hMax / 2, 0] }) }],
              }}
            >
              <LandscapeScene ref={scene} world={world} initial={initial} size={{ width: W, height: hMax }} />
            </Animated.View>
          )}
        </Animated.View>
      </View>

      {/* The page, with the torn foot of the band drawn over its top edge. */}
      <Animated.View style={[styles.body, { top: target, transform: [{ translateY: bodyY }] }]}>
        <View style={styles.page} />
        <Svg width={W} height={torn.height} style={[styles.torn, { top: -(target - torn.top) }]} pointerEvents="none">
          <Path d={torn.sheet} fill={SHEET} />
          <Path d={torn.page} fill={colors.cream} />
        </Svg>

        <Animated.View style={[styles.content, { opacity: content }]}>
          {phase === "arrive" ? (
            arriveScreen.session ? (
              <SessionOpeningScreen
                content={arriveScreen.session}
                start={arriveScreen.start}
                pad={pad}
                bottom={insets.bottom}
                onStart={begin}
              />
            ) : (
              <ArriveScreen content={arriveScreen} pad={pad} bottom={insets.bottom} onStart={begin} />
            )
          ) : phase === "walk" ? (
            <KeyboardAvoider toScreenBottom>
              <View style={[styles.steps, { paddingTop: pad.top - STEP_TOP }]}>
                {questionLine ? (
                  <View style={styles.questionLine} pointerEvents="none">
                    <AppText variant="label" color={colors.foreground} numberOfLines={2} accessibilityRole="header" style={styles.min14}>
                      {questionLine}
                    </AppText>
                  </View>
                ) : null}
                {/* "Saving your place": its own slot in the page, under the
                    pill's overhang, never drawn over the pill or a heading. */}
                <View style={[styles.savingSlot, saving && { paddingTop: folded ? spacing[2] : PILL_OVERHANG }]} pointerEvents="none">
                  <SavingChip visible={saving} />
                </View>
                <DayScrollContext.Provider value={onPageScroll}>{children(null)}</DayScrollContext.Provider>
              </View>
            </KeyboardAvoider>
          ) : phase === "done" ? (
            // The one completion screen: what she did, what is kept, one way on.
            <KeyboardAvoider toScreenBottom>
              <DoneScreen
                eyebrow={arrival.eyebrow}
                title={arrival.title}
                summary={arrival.summary ?? null}
                saved={arrival.saved ?? null}
                notSaved={!!arrival.notSaved}
                elara={arrival.elara}
                elaraHidden={!!arrival.elaraHidden}
                session={arrival.session ?? null}
                tomorrow={closing ? null : arrival.tomorrow}
                cta={closing ? seeWhere : arrival.cta}
                onCta={closing ? reveal : arrival.onDone}
                again={closing ? null : arrival.again}
                asks={arrival.asks}
                pad={pad}
                bottom={insets.bottom}
              />
            </KeyboardAvoider>
          ) : close && (phase === "revealed" || phase === "horizon") ? (
            <RevealedScreen
              title={close.title}
              line={close.week?.line ?? null}
              elara={close.week?.elara ?? t.photoDay.kept}
              shifted={close.week?.shifted ?? []}
              next={close.nextWorld}
              onNext={() => {
                close.onNextWorld();
                if (close.horizon) setPhase("horizon");
              }}
              seeAtlas={close.seeAtlas}
              onSeeAtlas={close.onSeeAtlas}
              pad={pad}
              bottom={insets.bottom}
            />
          ) : null}
        </Animated.View>

        {/* The pill and the orb sit on the band's torn foot, while the page is at rest. */}
        {/* The session's screens carry the place and day in their own eyebrow. */}
        {folded || sessionOpening || sessionClose ? null : (
          <View style={styles.footRow} pointerEvents="box-none">
            <Pill toward={toward} small={pillSmall} question={question} />
          </View>
        )}
        {/* Folded, the band is a strip for the controls: the orb would sit on the back circle. */}
        {place && !folded ? <Orb glow={glow} /> : null}
      </Animated.View>

      {showControls ? (
        <>
          <View style={[styles.controls, { top: topY }]} pointerEvents="box-none">
            <PressableScale
              size="circle"
              onPress={backPress}
              hitSlop={Math.max(0, (shellHitTarget - CIRCLE) / 2)}
              style={styles.circle}
              accessibilityRole="button"
              accessibilityLabel={backLabel}
            >
              <Icon name="solar:arrow-left-linear" size={20} color={colors.foreground} />
            </PressableScale>
            {place ? (
              <PressableScale
                size="circle"
                onPress={() => setTip((open) => !open)}
                style={[styles.circle, styles.pin]}
                accessibilityRole="button"
                accessibilityLabel={tip ? t.photoDay.whereA11yOpen : t.globe.tip.label}
                accessibilityState={{ expanded: tip }}
              >
                <MapGlyph />
              </PressableScale>
            ) : null}
            <View style={styles.flex}>
              {folded ? <FoldedPill toward={toward} small={pillSmall} question={question} /> : null}
            </View>
            {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
          </View>
          {place && tip ? (
            <FadeIn style={[styles.tip, { top: topY + CIRCLE + 6 }]} duration={instant ? 0 : dur.fast}>
              <View style={styles.tipRow} accessible accessibilityLiveRegion="polite">
                <FaceGlyph />
                <View style={styles.flex}>
                  <AppText variant="cardTitle" color={colors.foreground}>
                    {place.where}
                  </AppText>
                  <AppText variant="bodySmall" color={colors.foreground}>
                    {place.line}
                  </AppText>
                </View>
              </View>
            </FadeIn>
          ) : null}
        </>
      ) : null}

      {close?.horizon && phase === "horizon" ? (
        <NextHorizon {...close.horizon} onDone={close.horizon.onDone} reduced={instant} topInset={insets.top} bottomInset={insets.bottom} />
      ) : null}
    </View>
  );
});

/** The picture on its strip: scaled to the band's height, panned `-(strip - window) * along`. */
function PhotoStrip({
  source,
  strip,
  band,
  pan,
  width,
  label,
}: {
  source: ImageSourcePropType;
  strip: ReturnType<typeof stripFor>;
  band: Animated.Value;
  pan: Animated.Value;
  width: number;
  label: string;
}) {
  const { aspect, width: SW, height: H, image } = strip;
  // Native nodes, built once per geometry rather than on every render of the day.
  const { scale, translateX, translateY } = useMemo(() => {
    // Below `b0` the strip would be narrower than the window: it stops shrinking there and is centred instead.
    const b0 = Math.min(H - 1, Math.max(1, width / aspect));
    const minScale = width / SW;
    const over = band.interpolate({ inputRange: [0, b0, H], outputRange: [0, 0, SW - width] });
    return {
      scale: band.interpolate({ inputRange: [0, b0, H], outputRange: [minScale, minScale, 1] }),
      translateX: Animated.multiply(over, pan.interpolate({ inputRange: [0, 1], outputRange: [0, -1] })),
      translateY: band.interpolate({ inputRange: [0, b0, H], outputRange: [-width / (2 * aspect), 0, 0] }),
    };
  }, [H, SW, aspect, band, pan, width]);
  return (
    <Animated.View
      style={[styles.strip, { width: SW, height: H, transform: [{ translateX }, { translateY }] }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <Animated.View style={{ width: SW, height: H, overflow: "hidden", transformOrigin: [0, 0, 0], transform: [{ scale }] }}>
        <Image
          source={source}
          style={{ position: "absolute", left: image.left, top: image.top, width: image.width, height: image.height }}
          resizeMode="cover"
          fadeDuration={0}
        />
      </Animated.View>
    </Animated.View>
  );
}

/**
 * A tall picture at the window's width, slid up by `(frame - band) * along`
 * between `TALL_PAN.from` and `TALL_PAN.to`, so the band shows its middle as
 * the day goes on, at whatever height the band stands.
 */
function PhotoTall({
  source,
  frame,
  band,
  pan,
  label,
}: {
  source: ImageSourcePropType;
  frame: ReturnType<typeof tallFrame>;
  band: Animated.Value;
  pan: Animated.Value;
  label: string;
}) {
  const translateY = useMemo(
    () =>
      Animated.multiply(
        Animated.subtract(frame.height, band),
        pan.interpolate({ inputRange: [0, 1], outputRange: [-TALL_PAN.from, -TALL_PAN.to] }),
      ),
    [band, frame.height, pan],
  );
  return (
    <Animated.View
      style={[styles.strip, { left: frame.left, width: frame.width, height: frame.height, transform: [{ translateY }] }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <Image source={source} style={{ width: frame.width, height: frame.height }} resizeMode="cover" fadeDuration={0} />
    </Animated.View>
  );
}

/** "Toward the mist pass", "Question 1 of 2", "Lan Hạ Bay · Day 1". */
function Pill({ toward, small, question }: { toward: string; small: string; question: string | null }) {
  return (
    <View
      style={styles.pill}
      accessible
      accessibilityRole="header"
      accessibilityLabel={[toward, question, small].filter(Boolean).join(". ")}
    >
      <AppText variant="control" center color={colors.foreground} numberOfLines={2} style={styles.pillTitle}>
        {toward}
      </AppText>
      {question ? (
        <AppText variant="label" center color={colors.buttonForest} numberOfLines={1} style={[styles.pillQuestion, styles.min14]}>
          {question}
        </AppText>
      ) : null}
      <AppText variant="bodySmall" center color={colors.textSecondary} numberOfLines={2}>
        {small}
      </AppText>
    </View>
  );
}

/**
 * The pill folded into the header row while the page scrolls or she types:
 * one line, the question first because that is what changes as she goes.
 */
function FoldedPill({ toward, small, question }: { toward: string; small: string; question: string | null }) {
  return (
    <View
      style={styles.folded}
      accessible
      accessibilityRole="header"
      accessibilityLabel={[toward, question, small].filter(Boolean).join(". ")}
    >
      <AppText variant="label" center color={colors.foreground} numberOfLines={2} style={styles.min14}>
        {question ?? toward}
      </AppText>
    </View>
  );
}

/** Elara's orb on the band's edge: a cream ring and a warm glow that breathes. */
function Orb({ glow }: { glow: Animated.Value }) {
  return (
    <View style={styles.orb} pointerEvents="none">
      <Animated.View
        style={[
          styles.orbGlow,
          {
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.75] }),
            transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
          },
        ]}
      />
      <View style={styles.orbRing}>
        <Image source={ELARA_ORB} style={styles.orbImage} />
      </View>
    </View>
  );
}

function ArriveScreen({ content, pad, bottom, onStart }: { content: BandArrive; pad: Pad; bottom: number; onStart: () => void }) {
  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex} contentContainerStyle={[styles.scroll, { paddingTop: pad.top, paddingHorizontal: pad.side }]} showsVerticalScrollIndicator={false}>
        <FadeIn>
          <AppText variant="bodySmall" color={colors.textSecondary}>
            {content.eyebrow}
          </AppText>
          <AppText variant="screenTitle" color={colors.foreground} accessibilityRole="header" style={styles.title}>
            {content.title}
          </AppText>
          {/* A title, one short line, and Start: the week's takeaway when it
              has one, else the note; the note's reassurance stays as one small
              line under it. Nothing long to read before the first question. */}
          {content.payoff ? (
            <AppText variant="body" color={colors.foreground}>
              {content.payoff}
            </AppText>
          ) : null}
          {content.body ? (
            <AppText
              variant={content.payoff ? "bodySmall" : "body"}
              color={colors.textSecondary}
              style={content.payoff ? styles.payoff : undefined}
            >
              {content.body}
            </AppText>
          ) : null}
        </FadeIn>
      </ScrollView>
      <View style={[styles.foot, { paddingHorizontal: pad.side, paddingBottom: bottom + spacing[3.5] }]}>
        <PracticeCta label={content.start} icon={null} onPress={onStart} />
      </View>
    </View>
  );
}

function SessionOpeningScreen({
  content,
  start,
  pad,
  bottom,
  onStart,
}: {
  content: SessionOpening;
  start: string;
  pad: Pad;
  bottom: number;
  onStart: () => void;
}) {
  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, styles.sessionScroll, { paddingTop: pad.top - spacing[2], paddingHorizontal: pad.side }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn>
          <AppText style={styles.eyebrow}>{content.eyebrow}</AppText>
          <AppText variant="screenTitle" color={colors.foreground} accessibilityRole="header" style={[styles.title, styles.sessionTitle]}>
            {content.title}
          </AppText>
        </FadeIn>
        <FadeIn delay={dur.fast} style={styles.section}>
          <AppText style={styles.sectionLabel} accessibilityRole="header">
            {content.whyLabel}
          </AppText>
          <AppText style={styles.purpose}>{content.purpose}</AppText>
        </FadeIn>
        <FadeIn delay={dur.fast * 2} style={styles.section}>
          <AppText style={styles.sectionLabel} accessibilityRole="header">
            {content.cardLabel}
          </AppText>
          <TakeawayCard slots={content.slots} preview />
        </FadeIn>
        {content.last ? (
          <FadeIn delay={dur.fast * 3} style={styles.section}>
            <AppText style={styles.sectionLabel} accessibilityRole="header">
              {content.last.label}
            </AppText>
            <View style={styles.lastCard} accessible accessibilityLabel={`${content.last.text}. ${content.last.where}`}>
              <AppText style={styles.lastText}>{content.last.text}</AppText>
              <AppText style={styles.lastWhere}>{content.last.where}</AppText>
            </View>
          </FadeIn>
        ) : null}
        {content.weekNote ? (
          <FadeIn delay={dur.fast * 3} style={styles.section}>
            <AppText style={styles.sectionLabel} accessibilityRole="header">
              {content.weekNote.title}
            </AppText>
            {content.weekNote.body ? <AppText style={styles.weekNote}>{content.weekNote.body}</AppText> : null}
          </FadeIn>
        ) : null}
      </ScrollView>
      <View style={[styles.foot, { paddingHorizontal: pad.side, paddingBottom: bottom + spacing[3.5] }]}>
        <PracticeCta label={start} icon={null} onPress={onStart} />
      </View>
    </View>
  );
}

function DoneScreen({
  eyebrow,
  title,
  summary,
  saved,
  notSaved = false,
  elara,
  elaraHidden = false,
  session = null,
  tomorrow,
  cta,
  onCta,
  again,
  asks,
  pad,
  bottom,
}: {
  eyebrow: string;
  title: string;
  /** What she did today. */
  summary: string | null;
  /** What is kept. */
  saved: string | null;
  /** `saved` says something was not kept: an info mark, not a check. */
  notSaved?: boolean;
  elara: string | null;
  /** No line from Elara at all (the last step was skipped). */
  elaraHidden?: boolean;
  /** The daily session's close: her card first, Elara's note under it. */
  session?: SessionClose | null;
  tomorrow: string | null;
  cta: string;
  onCta: () => void;
  again?: { label: string; onPress: () => void } | null;
  /** The quiet asks, inline under the rest and skippable. */
  asks?: ReactNode;
  pad: Pad;
  bottom: number;
}) {
  const t = useT();
  if (session) {
    return (
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, styles.sessionScroll, { paddingTop: pad.top - spacing[2], paddingHorizontal: pad.side }]}
          showsVerticalScrollIndicator={false}
        >
          <FadeIn>
            <AppText style={styles.eyebrow}>{eyebrow}</AppText>
            <AppText variant="editorialTitle" color={colors.foreground} accessibilityRole="header" style={styles.title}>
              {title}
            </AppText>
            {summary ? <AppText style={styles.summary}>{summary}</AppText> : null}
          </FadeIn>
          {session.slots.length ? (
            <FadeIn delay={dur.fast}>
              <TakeawayCard slots={session.slots} edit={session.edit} />
            </FadeIn>
          ) : null}
          {session.note ? (
            <FadeIn delay={dur.fast * 2}>
              <ElaraNote label={session.note.label} text={session.note.text} pending={session.note.pending} />
            </FadeIn>
          ) : null}
          {session.askNote ? (
            <PressableScale
              size="chip"
              onPress={session.askNote.onPress}
              disabled={session.askNote.busy}
              style={styles.askNote}
              accessibilityRole="button"
              accessibilityLabel={session.askNote.label}
              accessibilityState={{ busy: session.askNote.busy }}
            >
              {session.askNote.busy ? <ElaraShimmer active size={20} /> : <Image source={ELARA_ORB} style={styles.askOrb} />}
              <AppText style={styles.askLabel}>{session.askNote.busy ? t.practice.elara.thinking : session.askNote.label}</AppText>
            </PressableScale>
          ) : null}
          {session.askNoteFailed ? (
            <AppText style={styles.sessionMeta} accessibilityLiveRegion="polite">
              {session.askNoteFailed}
            </AppText>
          ) : null}
          {saved ? (
            <View style={styles.savedRow} accessible accessibilityLiveRegion="polite">
              <Icon
                name={notSaved ? "solar:info-circle-linear" : "solar:check-circle-bold"}
                size={18}
                color={notSaved ? colors.secondary : colors.buttonForest}
              />
              <AppText style={[styles.sessionMeta, styles.flex]}>{saved}</AppText>
            </View>
          ) : null}
          {tomorrow ? (
            <FadeIn delay={dur.fast * 3}>
              <AppText style={styles.sessionTomorrow}>{tomorrow}</AppText>
            </FadeIn>
          ) : null}
          {asks ? (
            <FadeIn delay={dur.fast * 3} style={styles.sessionAsks}>
              {asks}
            </FadeIn>
          ) : null}
        </ScrollView>
        <View style={[styles.foot, { paddingHorizontal: pad.side, paddingBottom: bottom + spacing[3.5] }]}>
          <PracticeCta label={cta} onPress={onCta} />
          {again ? <TertiaryAction label={again.label} color={colors.textSecondary} onPress={again.onPress} style={styles.again} /> : null}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex} contentContainerStyle={[styles.scroll, { paddingTop: pad.top, paddingHorizontal: pad.side }]} showsVerticalScrollIndicator={false}>
        <FadeIn>
          <AppText variant="bodySmall" color={colors.textSecondary}>
            {eyebrow}
          </AppText>
          <AppText variant="editorialTitle" color={colors.foreground} accessibilityRole="header" style={styles.title}>
            {title}
          </AppText>
          {summary ? (
            <AppText variant="body" color={colors.foreground}>
              {summary}
            </AppText>
          ) : null}
          {saved ? (
            <View style={styles.savedRow} accessible accessibilityLiveRegion="polite">
              <Icon
                name={notSaved ? "solar:info-circle-linear" : "solar:check-circle-bold"}
                size={16}
                color={notSaved ? colors.secondary : colors.buttonForest}
              />
              <AppText variant="bodySmall" color={colors.textSecondary} style={styles.flex}>
                {saved}
              </AppText>
            </View>
          ) : null}
        </FadeIn>
        {elaraHidden ? null : (
          <FadeIn delay={dur.fast} style={styles.elara}>
            {elara !== null ? (
              <Image source={ELARA_ORB} style={styles.elaraOrb} accessibilityIgnoresInvertColors />
            ) : (
              <ElaraShimmer active size={28} />
            )}
            <View style={styles.flex}>
              {elara !== null ? (
                <AppText variant="body" color={colors.foreground} accessibilityLiveRegion="polite">
                  {elara}
                </AppText>
              ) : (
                <AppText variant="bodySmall" color={colors.textSecondary}>
                  {t.practice.elara.thinking}
                </AppText>
              )}
            </View>
          </FadeIn>
        )}
        {tomorrow ? (
          <FadeIn delay={dur.fast * 2}>
            <AppText variant="bodySmall" color={colors.textSecondary} style={styles.tomorrow}>
              {tomorrow}
            </AppText>
          </FadeIn>
        ) : null}
        {asks ? (
          <FadeIn delay={dur.fast * 3} style={styles.asks}>
            {asks}
          </FadeIn>
        ) : null}
      </ScrollView>
      <View style={[styles.foot, { paddingHorizontal: pad.side, paddingBottom: bottom + spacing[3.5] }]}>
        <PracticeCta label={cta} onPress={onCta} />
        {again ? <TertiaryAction label={again.label} color={colors.textSecondary} onPress={again.onPress} style={styles.again} /> : null}
      </View>
    </View>
  );
}

function RevealedScreen({
  title,
  line,
  elara,
  shifted,
  next,
  onNext,
  seeAtlas,
  onSeeAtlas,
  pad,
  bottom,
}: {
  title: string;
  line: string | null;
  elara: string;
  shifted: readonly { question: string; answer: string }[];
  next: string;
  onNext: () => void;
  seeAtlas: string;
  onSeeAtlas: () => void;
  pad: Pad;
  bottom: number;
}) {
  const t = useT();
  return (
    <View style={styles.flex}>
      <ScrollView style={styles.flex} contentContainerStyle={[styles.scroll, { paddingTop: pad.top, paddingHorizontal: pad.side }]} showsVerticalScrollIndicator={false}>
        <FadeIn>
          <AppText variant="screenTitle" color={colors.foreground} accessibilityRole="header">
            {title}
          </AppText>
          {line ? (
            <AppText variant="bodySmall" color={colors.textSecondary} style={styles.weekLine}>
              {line}
            </AppText>
          ) : null}
        </FadeIn>
        <FadeIn delay={dur.fast} style={styles.says}>
          <Image source={ELARA_ORB} style={styles.saysOrb} accessibilityIgnoresInvertColors />
          <AppText variant="cardTitle" color={colors.foreground} style={styles.flex}>
            {elara}
          </AppText>
        </FadeIn>
        <FadeIn delay={dur.fast * 2}>
          <AppText variant="control" color={colors.foreground} accessibilityRole="header" style={styles.shiftedTitle}>
            {t.photoDay.shifted}
          </AppText>
          {shifted.length ? (
            shifted.map((row, i) => (
              <View key={i} style={styles.row} accessible accessibilityLabel={`${row.question} ${row.answer}`}>
                <AppText variant="caption" color={colors.textSecondary}>
                  {row.question}
                </AppText>
                <AppText variant="bodySmall" color={colors.foreground}>
                  {row.answer}
                </AppText>
              </View>
            ))
          ) : (
            <View style={styles.row}>
              <AppText variant="caption" color={colors.textSecondary}>
                {t.photoDay.shiftedNone}
              </AppText>
            </View>
          )}
        </FadeIn>
      </ScrollView>
      <View style={[styles.foot, { paddingHorizontal: pad.side, paddingBottom: bottom + spacing[3.5] }]}>
        <PracticeCta label={next} onPress={onNext} />
        <TertiaryAction label={seeAtlas} color={colors.textSecondary} onPress={onSeeAtlas} style={styles.again} />
      </View>
    </View>
  );
}

/** The prototype's folded map: "Where is this?". */
function MapGlyph() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke={colors.foreground} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2.5 5 7 3l6 2 4.5-2v12L13 17l-6-2-4.5 2z" />
      <Path d="M7 3v12M13 5v12" />
    </Svg>
  );
}

/** The prototype's small sun face on the "Where is this?" card. */
function FaceGlyph() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none" stroke={colors.foreground} strokeWidth={1.6} strokeLinecap="round">
      <Circle cx={15} cy={15} r={12.5} fill="#f4c986" />
      <Circle cx={10.5} cy={12.5} r={1.3} fill={colors.foreground} stroke="none" />
      <Circle cx={19.5} cy={12.5} r={1.3} fill={colors.foreground} stroke="none" />
      <Path d="M9.5 18c1.4 2.6 9.6 2.6 11 0" />
    </Svg>
  );
}

type Pad = { top: number; side: number };
/** The page's padding under the band (prototype: 42 / 22, and 38 / 16 in its 320 mode). */
const PAD: Pad = { top: 42, side: layout.screenMargin };
const COMPACT_PAD: Pad = { top: 38, side: 16 };
/** The step screen's own top padding, taken off the page's so the question sits where the prototype's does. */
const STEP_TOP = spacing[6];
/** How far the resting pill reaches down into the page (the foot row's 22pt below the band). */
const PILL_OVERHANG = 22 + spacing[2];
const ORB = 46;
const RETURN_LINE_MS = 4000;

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden", backgroundColor: colors.cream },
  flex: { flex: 1, minWidth: 0 },
  scene: { position: "absolute", left: 0, right: 0, top: 0, overflow: "hidden", backgroundColor: SCENE_BG },
  strip: { position: "absolute", left: 0, top: 0 },
  body: { position: "absolute", left: 0, right: 0, bottom: 0 },
  page: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.cream },
  torn: { position: "absolute", left: 0 },
  content: { flex: 1, minHeight: 0 },
  steps: { flex: 1, minHeight: 0 },
  scroll: { flexGrow: 1, paddingBottom: spacing[4] },
  foot: { paddingTop: spacing[2], gap: spacing[1.5] },
  title: { marginTop: spacing[1.5], marginBottom: spacing[2] },
  payoff: { marginTop: spacing[3] },
  footRow: { position: "absolute", left: 14, right: 14, top: -84, height: 84 + 22, alignItems: "center", justifyContent: "flex-end" },
  pill: {
    maxWidth: "100%",
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 8,
    borderRadius: 18,
    backgroundColor: withAlpha(WHITE, 0.9),
    shadowColor: colors.foreground,
    shadowOpacity: 0.06,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 1 },
  },
  // The stop's line on the pill: 14 at the smallest, like every label on the session's screens (P1-9).
  pillTitle: { fontSize: 14, lineHeight: 19 },
  pillQuestion: { marginTop: 3, marginBottom: 2 },
  // In the header row, between the circles: as tall as they are, never past them sideways.
  folded: {
    alignSelf: "center",
    maxWidth: "100%",
    minHeight: CIRCLE,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: CIRCLE / 2,
    backgroundColor: withAlpha(WHITE, 0.9),
  },
  savingSlot: { alignItems: "center" },
  // The step page's own gutter (StepScreen), so the line sits over the question it shortens.
  questionLine: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: LINE,
    backgroundColor: colors.cream,
  },
  savedRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing[2], marginTop: spacing[2] },
  min14: { fontSize: 14, lineHeight: 19 },
  // ── The daily session's opening and close (Nov 2026). 14 for labels and
  // meta, 16 and up for what she reads (P1-9).
  sessionScroll: { gap: spacing[4], paddingBottom: spacing[6] },
  // The scroll's gap is the space under the title here.
  sessionTitle: { marginBottom: 0 },
  eyebrow: { fontFamily: fontFamily.sansMedium, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  section: { gap: spacing[2] },
  sectionLabel: { fontFamily: fontFamily.sansSemibold, fontSize: 14, lineHeight: 20, color: colors.secondary },
  purpose: { fontFamily: fontFamily.sans, fontSize: 17, lineHeight: 25, color: colors.foreground },
  weekNote: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textBody },
  lastCard: {
    gap: spacing[1],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    backgroundColor: WHITE,
  },
  lastText: { fontFamily: fontFamily.sans, fontSize: 17, lineHeight: 25, color: colors.foreground },
  lastWhere: { fontFamily: fontFamily.sansMedium, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  summary: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textBody },
  sessionMeta: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  sessionTomorrow: { fontFamily: fontFamily.sansMedium, fontSize: 16, lineHeight: 23, color: colors.foreground },
  sessionAsks: { marginTop: spacing[1] },
  askNote: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    minHeight: 44,
    paddingHorizontal: spacing[3.5],
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#B9AE9C",
    backgroundColor: WHITE,
  },
  askOrb: { width: 20, height: 20, borderRadius: 10 },
  askLabel: { fontFamily: fontFamily.sansSemibold, fontSize: 15, lineHeight: 20, color: colors.secondary },
  asks: { marginTop: spacing[5] },
  orb: { position: "absolute", left: 22, top: 24 - ORB, width: ORB, height: ORB },
  orbGlow: { position: "absolute", left: -8, top: -8, width: ORB + 16, height: ORB + 16, borderRadius: (ORB + 16) / 2, backgroundColor: withAlpha(GLOW, 0.45) },
  orbRing: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    borderWidth: 3,
    borderColor: colors.cream,
    overflow: "hidden",
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  orbImage: { width: ORB - 6, height: ORB - 6, borderRadius: (ORB - 6) / 2 },
  controls: { position: "absolute", left: 14, right: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(WHITE, 0.78),
  },
  pin: {},
  trailing: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  tip: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 5,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  elara: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: spacing[3],
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: SHEET,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomLeftRadius: 14,
  },
  elaraOrb: { width: 28, height: 28 },
  tomorrow: { marginTop: spacing[3] },
  again: { alignSelf: "center", minHeight: 44, justifyContent: "center" },
  weekLine: { marginTop: spacing[1], marginBottom: spacing[3] },
  says: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  saysOrb: { width: 52, height: 52 },
  shiftedTitle: { marginBottom: 6 },
  row: { paddingVertical: 9, borderTopWidth: 1, borderTopColor: LINE, gap: 2 },
});

