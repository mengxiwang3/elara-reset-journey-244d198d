import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../../AppText";
import { Icon } from "../../Icon";
import { KeyboardAvoider } from "../../KeyboardAvoider";
import type { SceneState, WorldId, WorldResponse } from "@/components/world/types";
import { paperFor, useWorld25d, week25dFor } from "@/components/world25d";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useScreenReader } from "@/hooks/useScreenReader";
import { useT } from "@/i18n";
import {
  duration as dur,
  ease,
  FadeIn,
  interaction,
  PressableScale,
  stagger,
  travel,
  useReducedMotion,
  world as worldMotion,
} from "@/motion";
import { colors, radius, spacing } from "@/theme";
import type { TakeawaySlotView } from "../TakeawayCard";
import { ArrivalPanel } from "./ArrivalPanel";
import { BandDay, type BandExtras } from "./BandDay";
import { INPUT_LOCK_MS } from "./journey";
import { LandscapeScene, type SceneHandle } from "./LandscapeScene";
import { cardFrameFor, foldTransform, FrameGround, NextHorizon, WeekClose, type CloseStage } from "./WeekClose";
import { PaperSheet, SavingChip, SceneLine, WorldHeader } from "./WorldChrome";

/**
 * One day inside a world: the live scene, and everything that sets down over
 * it. The scene never remounts between a question, its response, the next
 * question and the day's close (Motion system, "Continuity"), so the
 * questions, the arrival and the world's close are all layers here, over one
 * scene instance.
 *
 * The day screen owns the data (answers, replies, what to save and when);
 * this owns time. The day screen saves first, then calls one of the handle's
 * three verbs, and this plays it:
 *
 * - `beat`: an activity answered. The sheet sets down, the camera takes one
 *   step deeper with exactly one response, the response's line rises over the
 *   art, and the next sheet rises after the beat or on a tap on the world
 *   (allowed after 600 ms). Input is never held longer than that.
 * - `arrive`: the day's last answer, sent with an ordinary tap on Finish
 *   today. The viewpoint settles at the landmark, then the forest ground
 *   rises and the words follow.
 * - `closeWorld`: the world's last day. The arrival at its close, the fold
 *   into a paper card, the stitch, the resolved art, then two equal ways on.
 *
 * Reduce Motion: the sheet stays put and its content cross-fades; the scene
 * cuts with a 200 ms cross-fade (the engine's own rule); the response line is
 * shown in the sheet and announced. With a screen reader on nothing waits on a
 * timer: every beat lands at once and she moves on with the next CTA.
 */
export interface WorldDayHandle {
  beat(response: WorldResponse, opts: { caption: string; beatMs: number; onRise: () => void }): void;
  arrive(opts: { replay: boolean }): void;
  closeWorld(opts: { replay: boolean }): void;
  /**
   * Put the scene where the sheet now is, with no camera move: back inside
   * the day, or a resume on a step other than the first unanswered one. A
   * beat only ever moves the scene one step on from where it stands, so a
   * cursor moved without this walked the scene too far.
   */
  settle(state: SceneState): void;
}

export type Opening =
  | {
      kind: "poster";
      eyebrow: string;
      title: string;
      body: string;
      /** Day 1's line on where the week is going, under the body. */
      payoff?: string | null;
      begin: string;
      beginA11y: string;
      name: string;
      line: string;
    }
  | { kind: "name"; name: string; line: string }
  | { kind: "return"; line: string; small: string; reducedLine: string; today: SceneState }
  | null;

type Phase =
  | "poster"
  | "opening"
  | "walk"
  | "beat"
  | "arrive"
  | "arrived"
  | "closing"
  | "revealed"
  | "horizon";

export interface ArrivalContent {
  eyebrow: string;
  title: string;
  elara: string | null;
  tomorrow: string | null;
  cta: string;
  announce: string;
  /** The landmark line over the art during the arrival. */
  line: string;
  lineSmall: string;
  onDone: () => void;
  /** Walk this finished day again from its first question. */
  again?: { label: string; onPress: () => void } | null;
  /** What she did today ("You answered 2 of 2 questions."), on the completion screen. Null on a redo. */
  summary?: string | null;
  /** What is kept, said plainly (or that it is still on this phone, offline). */
  saved?: string | null;
  /** `saved` says something was NOT kept (a refused answer): no check mark beside it. */
  notSaved?: boolean;
  /** The quiet asks (`CompletionAsks`): inline, skippable, never a sheet. */
  asks?: ReactNode;
  /**
   * No line from Elara at all: the day's last step was skipped, and a skip is
   * never answered (daily session rules). Otherwise `elara` null means hers is
   * still on its way.
   */
  elaraHidden?: boolean;
  /** The close's own layout on a day with a takeaway card (photo band only). */
  session?: SessionClose | null;
}

/**
 * The daily session's close (Nov 2026), in the photo band: «Hoy te llevas»
 * and her filled card with «Editar», Elara's note under it, set second.
 */
export interface SessionClose {
  /** The card's slots. Empty when nothing of hers was answered: then there is no card. */
  slots: readonly TakeawaySlotView[];
  /** «Editar»: back to the step her takeaway came from, with her words in it. */
  edit: { label: string; a11y: string; onPress: () => void } | null;
  /** Elara's note to her takeaway, with its label; null when there is none to show (a skip). */
  note: { label: string; text: string | null; pending: boolean } | null;
  /** «Pedir la nota de Elara»: offered once, online, when her answer has no written note. */
  askNote: { label: string; busy: boolean; onPress: () => void } | null;
  /** Said when the one ask did not bring a note. */
  askNoteFailed: string | null;
}

export interface CloseContent {
  line: string;
  lineSmall: string;
  title: string;
  rule: string | null;
  ruleWhere: string | null;
  nextStep?: string | null;
  seeAtlas: string;
  nextWorld: string;
  announce: string;
  resolvedArt: (width: number, height: number) => ReactNode;
  onShown: () => void;
  onSeeAtlas: () => void;
  onNextWorld: () => void;
  horizon: {
    distant: (width: number, height: number) => ReactNode;
    near: (width: number, height: number) => ReactNode;
    ahead: string;
    line: string | null;
    /** What she carries into it from the world behind her, when the art carries something. */
    carried?: string | null;
    opens: string;
    done: string;
    onDone: () => void;
  } | null;
  /**
   * The week revealed in the photo band (`BandDay`): "Money Clarity · Week 1 ·
   * Look without judging", Elara's line, and "What shifted" (up to three of her
   * own answers of the week). The full-screen close does not show it.
   */
  week?: { line: string; elara: string; shifted: readonly { question: string; answer: string }[] } | null;
}

/** What a day inside a world is given: the full-screen world (`WorldDay`) and the photo band (`BandDay`) take the same. */
export interface WorldDayProps {
  world: WorldId;
  dark: boolean;
  /** The state the scene mounts at (yesterday's arrival on a return). */
  initial: SceneState;
  /** Where the day stands now; the scene settles here when it changes outside a beat. */
  opening: Opening;
  onOpened?: () => void;
  /** The arrival's words are up (the day's asks may follow). Not called when opening already arrived. */
  onArrived?: () => void;
  header: {
    toward: string;
    placeDay: string;
    steps: number;
    on: number;
    /** The step's own question, for the short line kept above the field while she types (photo band). */
    title?: string;
    /** The step opens on Elara's reply to the step before (photo band: the compact band). */
    reply?: boolean;
  };
  backLabel: string;
  onBack: () => void;
  trailing?: ReactNode;
  /** The sheet's content. `caption` is the last response, shown in the sheet under Reduce Motion. */
  children: (caption: string | null) => ReactNode;
  /** The sheet's content is a breathing moment: no header dashes yet. */
  arrival: ArrivalContent;
  close: CloseContent | null;
  saving: boolean;
  /** The day was already complete on arrival: open at the landmark with its panel. */
  startArrived: boolean;
  /** The world was already revealed on arrival: open on the resolved card. */
  startRevealed: boolean;
  /**
   * Walk the day in the photo band (Money Journey prototype, `BandDay`)
   * instead of the full-screen world. Same handle, same data.
   */
  band?: BandExtras | null;
}

/** The day inside a world: in the photo band when `band` is given, else the full-screen world. */
export const WorldDay = forwardRef<WorldDayHandle, WorldDayProps>(function WorldDay(props, ref) {
  const { band, ...rest } = props;
  return band ? <BandDay ref={ref} {...rest} {...band} /> : <FullWorldDay ref={ref} {...rest} />;
});

const FullWorldDay = forwardRef<WorldDayHandle, WorldDayProps>(function FullWorldDay(
  { world, dark, initial, opening, onOpened, onArrived, header, backLabel, onBack, trailing, children, arrival, close, saving, startArrived, startRevealed },
  ref,
) {
  const t = useT();
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  const reduced = useReducedMotion();
  const screenReader = useScreenReader();
  const instant = reduced || screenReader;
  const scene = useRef<SceneHandle>(null);
  useWorld25d();
  // 2.5D worlds put rock and sky of every tone under the header, so it sits on a paper plate.
  const world25d = paperFor(world) !== null || week25dFor(world) !== null;

  const initialPhase: Phase = startRevealed
    ? "revealed"
    : startArrived
      ? "arrived"
      : opening?.kind === "poster"
        ? "poster"
        : opening
          ? "opening"
          : "walk";
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const sheetUp = phase === "walk" || phase === "beat";

  // Animated values. Native driver throughout: opacity and transform only.
  const [sheetY] = useState(() => new Animated.Value(initialPhase === "walk" ? 0 : 1));
  const [content] = useState(() => new Animated.Value(1));
  const [chrome] = useState(() => new Animated.Value(initialPhase === "walk" ? 1 : 0));
  const [line] = useState(() => new Animated.Value(0));
  const [ground] = useState(() => new Animated.Value(initialPhase === "arrived" ? 1 : 0));
  const [fold] = useState(() => new Animated.Value(initialPhase === "revealed" || initialPhase === "poster" ? 1 : 0));
  const [closeGround] = useState(() => new Animated.Value(initialPhase === "revealed" ? 1 : 0));
  const [posterWords] = useState(() => new Animated.Value(1));

  const [lineText, setLineText] = useState<{ line: string; small?: string | null } | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [words, setWords] = useState(initialPhase === "arrived");
  const [stage, setStage] = useState<CloseStage>(initialPhase === "revealed" ? "words" : "ground");
  const [skippable, setSkippable] = useState(false);
  const [reducedReturn, setReducedReturn] = useState<string | null>(null);
  // The sheet's content mounts with the first sheet that rises: a breathing
  // moment must not start (and finish) behind the poster or a return line.
  const [sheetMounted, setSheetMounted] = useState(initialPhase === "walk");

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const after = useCallback((ms: number, run: () => void) => {
    timers.current.push(setTimeout(run, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);
  const rising = useRef<(() => void) | null>(null);

  const timing = (value: Animated.Value, toValue: number, duration: number, easing = ease.standard) =>
    Animated.timing(value, { toValue, duration: instant ? interaction.reducedFade : duration, easing, useNativeDriver: true });

  const showLine = useCallback(
    (text: string, small?: string | null) => {
      setLineText({ line: text, small });
      line.setValue(0);
      timing(line, 1, dur.slow, ease.entrance).start();
    },
    [line], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const hideLine = useCallback(() => {
    timing(line, 0, dur.fast, ease.exit).start();
  }, [line]); // eslint-disable-line react-hooks/exhaustive-deps

  const announce = (text: string) => {
    AccessibilityInfo.announceForAccessibilityWithOptions?.(text, { queue: true }) ??
      AccessibilityInfo.announceForAccessibility(text);
  };

  // ---------- the opening: poster, the place naming itself, or a return ----------

  const raiseSheet = useCallback(() => {
    setPhase("walk");
    setSheetMounted(true);
    if (instant) {
      sheetY.setValue(0);
      chrome.setValue(1);
      content.setValue(0);
      timing(content, 1, interaction.reducedFade).start();
      return;
    }
    content.setValue(1);
    timing(chrome, 1, dur.slow).start();
    timing(sheetY, 0, dur.slower, ease.entrance).start();
  }, [chrome, content, instant, sheetY]); // eslint-disable-line react-hooks/exhaustive-deps

  const runOpening = useCallback(() => {
    if (!opening || opening.kind === "poster") return;
    if (opening.kind === "name") {
      if (instant) {
        raiseSheet();
        onOpened?.();
        return;
      }
      after(0, () => scene.current?.enter?.());
      after(400, () => showLine(opening.name, null));
      after(400 + 1800, hideLine);
      after(400 + 1800 + dur.fast, () => {
        raiseSheet();
        onOpened?.();
      });
      return;
    }
    // A return: yesterday's landmark, one line, then the walk on to today.
    if (instant) {
      scene.current?.settleTo(opening.today);
      setReducedReturn(opening.reducedLine);
      announce(opening.reducedLine);
      raiseSheet();
      onOpened?.();
      return;
    }
    after(600, () => showLine(opening.line, opening.small));
    after(600 + 1200, hideLine);
    after(600 + 1200 + dur.fast, () => scene.current?.walkTo(opening.today));
    after(600 + 1200 + dur.fast + worldMotion.step - 200, () => {
      raiseSheet();
      onOpened?.();
    });
  }, [after, hideLine, instant, onOpened, opening, raiseSheet, showLine]);

  useEffect(() => {
    if (initialPhase === "opening") runOpening();
    // Once, on mount: the opening is the way in, not a reaction to state.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const begin = () => {
    if (opening?.kind !== "poster") return;
    if (instant) {
      fold.setValue(0);
      raiseSheet();
      onOpened?.();
      return;
    }
    setPhase("opening");
    timing(posterWords, 0, dur.fast, ease.exit).start();
    after(dur.fast, () => {
      timing(fold, 0, worldMotion.fold, ease.walk).start();
      scene.current?.enter?.();
    });
    after(dur.fast + worldMotion.fold, () => showLine(opening.name, opening.line));
    after(dur.fast + worldMotion.fold + 1800, hideLine);
    after(dur.fast + worldMotion.fold + 1800 + dur.fast, () => {
      raiseSheet();
      onOpened?.();
    });
  };

  // ---------- the beat ----------

  const rise = useCallback(() => {
    const done = rising.current;
    if (!done) return;
    rising.current = null;
    clearTimers();
    setSkippable(false);
    hideLine();
    done();
    setPhase("walk");
    phaseRef.current = "walk";
    content.setValue(1);
    chrome.setValue(1);
    timing(sheetY, 0, dur.slower, ease.entrance).start();
  }, [chrome, clearTimers, content, hideLine, sheetY]); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    beat(response, { caption: text, beatMs, onRise }) {
      // A beat still playing ends at its final state: only the latest plays.
      if (rising.current) rise();
      // Only a sheet she is looking at can start a beat.
      if (phaseRef.current !== "walk") {
        onRise();
        return;
      }
      if (instant) {
        // The sheet stays; its content cross-fades to the next question with
        // the response's line above it, and the line is announced.
        scene.current?.advance(response);
        timing(content, 0, interaction.reducedFade).start(() => {
          onRise();
          setCaption(text);
          timing(content, 1, interaction.reducedFade).start();
        });
        announce(text);
        return;
      }
      setCaption(null);
      setPhase("beat");
      phaseRef.current = "beat";
      rising.current = onRise;
      timing(content, 0, dur.fast, ease.exit).start();
      timing(sheetY, 1, dur.slower, ease.exit).start();
      after(dur.slower / 2, () => scene.current?.advance(response));
      after(dur.slower / 2 + worldMotion.response, () => {
        if (text) showLine(text);
      });
      after(INPUT_LOCK_MS, () => setSkippable(true));
      after(Math.max(beatMs, dur.slower + dur.fast), rise);
    },
    arrive({ replay }) {
      clearTimers();
      rising.current = null;
      setCaption(null);
      if (replay || instant) {
        // Under Reduce Motion the engine's arrive() is itself a 200 ms cross-fade.
        if (instant && !replay) scene.current?.arrive();
        setPhase("arrived");
        timing(sheetY, 1, interaction.reducedFade).start();
        timing(chrome, 0, interaction.reducedFade).start();
        timing(ground, 1, interaction.reducedFade).start();
        setWords(true);
        announce(arrival.announce);
        if (!replay) onArrived?.();
        return;
      }
      setPhase("arrive");
      timing(content, 0, dur.fast, ease.exit).start();
      timing(sheetY, 1, dur.slower, ease.exit).start();
      timing(chrome, 0, dur.slow, ease.exit).start();
      after(dur.slower * 0.75, () => scene.current?.arrive());
      after(1700, () => showLine(arrival.line, arrival.lineSmall));
      after(3500, hideLine);
      after(3700, () => timing(ground, 1, worldMotion.ground).start());
      after(3700 + worldMotion.ground / 2, () => {
        setPhase("arrived");
        setWords(true);
        announce(arrival.announce);
        onArrived?.();
      });
    },
    settle(state) {
      // A beat still playing ends first, so its rise cannot move the cursor on after this.
      if (rising.current) {
        rising.current = null;
        clearTimers();
        setSkippable(false);
        hideLine();
        setPhase("walk");
        phaseRef.current = "walk";
        content.setValue(1);
        chrome.setValue(1);
        sheetY.setValue(0);
      }
      scene.current?.settleTo(state);
    },
    closeWorld({ replay }) {
      if (!close) return;
      clearTimers();
      rising.current = null;
      setCaption(null);
      close.onShown();
      if (replay || instant) {
        if (!replay) scene.current?.completeWorld();
        sheetY.setValue(1);
        chrome.setValue(0);
        fold.setValue(1);
        closeGround.setValue(1);
        setStage("words");
        setPhase("revealed");
        announce(close.announce);
        return;
      }
      setPhase("closing");
      timing(content, 0, dur.fast, ease.exit).start();
      timing(sheetY, 1, dur.slower, ease.exit).start();
      timing(chrome, 0, dur.slow, ease.exit).start();
      after(dur.slower * 0.75, () => scene.current?.completeWorld());
      after(1400, () => showLine(close.line, close.lineSmall));
      after(3400, hideLine);
      after(3600, () => {
        timing(fold, 1, worldMotion.fold, ease.walk).start();
        timing(closeGround, 1, worldMotion.fold, ease.walk).start();
      });
      after(3600 + worldMotion.fold, () => setStage("stitch"));
      after(3600 + worldMotion.fold + worldMotion.stitch, () => setStage("art"));
      after(3600 + worldMotion.fold + worldMotion.stitch + worldMotion.crossfade / 2, () => {
        setStage("words");
        setPhase("revealed");
        announce(close.announce);
      });
    },
  }));

  /** Any tap after a commit jumps to the end state; a tap during a beat (after 600 ms) skips to the next sheet. */
  const onWorldTap = () => {
    if (phase === "beat") {
      if (skippable) rise();
      return;
    }
    if (phase === "arrive") {
      clearTimers();
      scene.current?.finish();
      line.setValue(0);
      sheetY.setValue(1);
      chrome.setValue(0);
      ground.setValue(1);
      setPhase("arrived");
      setWords(true);
      announce(arrival.announce);
      onArrived?.();
      return;
    }
    if (phase === "closing" && close) {
      clearTimers();
      line.setValue(0);
      fold.setValue(1);
      closeGround.setValue(1);
      setStage("words");
      setPhase("revealed");
      announce(close.announce);
    }
  };

  // The strip of world that shows above the sheet: the canyon keeps its orb inside it while she practises.
  const bandHeight = screen.height * (1 - SHEET_SHARE);
  useEffect(() => {
    // While she practises the strip is the one above the sheet; once the day is done the words stand on the lower half.
    const arrived = phase === "arrive" || phase === "arrived";
    scene.current?.setBand?.(phase === "walk" || phase === "beat" ? bandHeight : arrived ? screen.height * 0.55 : null);
  }, [bandHeight, phase, screen.height]);

  const card = cardFrameFor(screen, insets.top);
  const posterFrame = { left: card.left, top: card.top + spacing[12], width: card.width, height: card.height * 1.03 };
  const frameFor = phase === "poster" || (phase === "opening" && opening?.kind === "poster") ? posterFrame : card;
  const sheetHeight = keyboard.visible ? "auto" : Math.round(screen.height * SHEET_SHARE);
  const headerTop = insets.top;

  return (
    <View style={[styles.root, { backgroundColor: dark ? colors.midnightBottom : colors.background }]}>
      {/* The scene. Folding (week close, poster) moves this container only. */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: foldTransform(fold, screen, frameFor) }]} pointerEvents="none">
        <LandscapeScene ref={scene} world={world} initial={initial} />
      </Animated.View>

      {/* The poster: the scene seen through a window on cream paper. The
          paper falls away as the window opens to the full screen. */}
      {opening?.kind === "poster" && (phase === "poster" || phase === "opening") ? <FrameGround frame={posterFrame} opacity={fold} /> : null}

      {/* The world takes a tap: skip a beat, or jump a sequence to its end. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onWorldTap}
        disabled={!(phase === "beat" || phase === "arrive" || phase === "closing")}
        accessible={phase === "beat" && skippable}
        accessibilityRole="button"
        accessibilityLabel={t.day.nextA11y}
      />

      {lineText ? (
        <SceneLine line={lineText.line} small={lineText.small} progress={line} dark={dark} style={{ top: screen.height * LINE_AT }} />
      ) : null}

      {/* The paper sheet: questions always sit here, never on the art. */}
      {/* Off duty (a beat, an arrival) the sheet's container lets every touch
          through to the world, which skips the beat or jumps to the end. */}
      <View style={StyleSheet.absoluteFill} pointerEvents={phase === "walk" ? "box-none" : "none"}>
        <KeyboardAvoider>
          <View style={styles.sheetSlot} pointerEvents="box-none">
            <PaperSheet
              height={sheetHeight}
              fillFrom={headerTop + HEADER_H}
              translateY={sheetY.interpolate({ inputRange: [0, 1], outputRange: [0, screen.height * (SHEET_SHARE + 0.07)] })}
              opacity={content}
              style={!sheetUp ? styles.inert : undefined}
            >
              <View style={styles.sheetInner} pointerEvents={phase === "walk" ? "auto" : "none"}>
                {caption ? (
                  <View style={styles.caption} accessibilityLiveRegion="polite">
                    <AppText variant="body" center color={dark ? colors.cream : colors.foreground}>
                      {caption}
                    </AppText>
                  </View>
                ) : null}
                {sheetMounted ? children(caption) : null}
              </View>
            </PaperSheet>
          </View>
        </KeyboardAvoider>
      </View>

      {/* The header leads with the landmark; "Question 1 of 2" is the only progress.
          Drawn over the sheet's keyboard container, which spans the screen. */}
      <Animated.View style={[styles.header, { top: headerTop, opacity: chrome }]} pointerEvents={sheetUp ? "box-none" : "none"}>
        <WorldHeader
          toward={header.toward}
          placeDay={reducedReturn ?? header.placeDay}
          steps={header.steps}
          on={header.on}
          onBack={onBack}
          backLabel={backLabel}
          trailing={trailing}
          dark={dark}
          plate={world25d}
        />
        <SavingChip visible={saving} dark={dark} />
      </Animated.View>

      {phase === "arrive" || phase === "arrived" ? (
        <ArrivalPanel
          eyebrow={arrival.eyebrow}
          title={arrival.title}
          elara={arrival.elara}
          tomorrow={arrival.tomorrow}
          ctaLabel={arrival.cta}
          onDone={arrival.onDone}
          again={arrival.again}
          ground={ground}
          words={words}
          bottomInset={insets.bottom}
          topInset={insets.top}
        />
      ) : null}

      {close && (phase === "closing" || phase === "revealed") ? (
        <WeekClose
          stage={stage}
          card={card}
          ground={closeGround}
          resolvedArt={close.resolvedArt}
          title={close.title}
          rule={close.rule}
          ruleWhere={close.ruleWhere}
          nextStep={close.nextStep}
          seeAtlas={close.seeAtlas}
          nextWorld={close.nextWorld}
          onSeeAtlas={close.onSeeAtlas}
          onNextWorld={() => {
            close.onNextWorld();
            if (close.horizon) setPhase("horizon");
          }}
          reduced={instant}
        />
      ) : null}

      {close?.horizon && phase === "horizon" ? (
        <NextHorizon
          {...close.horizon}
          onDone={close.horizon.onDone}
          reduced={instant}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      ) : null}

      {phase === "poster" && opening?.kind === "poster" ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: posterWords }]} pointerEvents="box-none">
          <View style={[styles.posterHead, { top: insets.top + spacing[4] }]}>
            <FadeIn>
              <AppText variant="label" center color={colors.primary}>
                {opening.eyebrow}
              </AppText>
            </FadeIn>
            <FadeIn delay={stagger.group}>
              <AppText variant="screenTitle" center color={colors.foreground} accessibilityRole="header">
                {opening.title}
              </AppText>
            </FadeIn>
          </View>
          <View style={[styles.posterFoot, { paddingBottom: insets.bottom + spacing[6] }]}>
            <FadeIn delay={stagger.group * 2} distance={travel.rise}>
              <AppText variant="body" center color={colors.textSecondary}>
                {opening.body}
              </AppText>
              {opening.payoff ? (
                <AppText variant="control" center color={colors.foreground} style={styles.payoff}>
                  {opening.payoff}
                </AppText>
              ) : null}
            </FadeIn>
            <FadeIn delay={stagger.group * 3} distance={travel.rise}>
              <PressableScale
                size="pill"
                onPress={begin}
                style={styles.begin}
                accessibilityRole="button"
                accessibilityLabel={opening.beginA11y}
              >
                <AppText variant="control" color={colors.cream}>
                  {opening.begin}
                </AppText>
              </PressableScale>
            </FadeIn>
          </View>
          <View style={[styles.posterBack, { top: insets.top }]}>
            <PressableScale size="circle" onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} style={styles.posterBackHit}>
              <Icon name="solar:arrow-left-linear" size={17} color={colors.foreground} />
            </PressableScale>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
});

/** The sheet's share of the screen at rest (prototype: 53%, then 64%). Raised
 *  again to 75% so a question with chips and a field fits without scrolling;
 *  the art above gets shorter. */
const SHEET_SHARE = 0.75;
/** Where the line over the landscape sits (prototype: 44% from the top). */
const LINE_AT = 0.38;
/** Room the header takes, so a sheet grown for the keyboard stops under it. */
const HEADER_H = 76;

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  header: { position: "absolute", left: 0, right: 0, gap: spacing[1] },
  sheetSlot: { flex: 1, justifyContent: "flex-end" },
  sheetInner: { flex: 1, minHeight: 0, paddingTop: spacing[2] },
  inert: {},
  caption: { paddingHorizontal: spacing[6], paddingTop: spacing[4] },
  posterHead: { position: "absolute", left: spacing[6], right: spacing[6], gap: spacing[1.5] },
  posterFoot: { flex: 1, justifyContent: "flex-end", paddingHorizontal: spacing[7], gap: spacing[4] },
  payoff: { marginTop: spacing[3] },
  begin: {
    minHeight: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.buttonForest,
  },
  posterBack: { position: "absolute", left: spacing[4] },
  posterBackHit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
