import type { ReflectMode } from "@elara/shared";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Linking, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "../AppText";
import { Icon } from "../Icon";
import { RecordingMeter } from "../RecordingMeter";
import { VoiceButton } from "../VoiceButton";
import { FlowOrb } from "../FlowOrb";
import { useVoiceCapture } from "@/hooks/useVoiceCapture";
import { useT } from "@/i18n";
import {
  CrossFade,
  interaction,
  PressableScale,
  Reveal,
  useAnimatedTo,
  useLoopProgress,
} from "@/motion";
import { colors, radius, spacing, type, withAlpha } from "@/theme";
import { DrawPad } from "./DrawPad";
import { ShapePicker } from "./ShapePicker";
import type { ReflectDraft } from "./draft";
import { usePracticeTheme } from "./theme";

const REFLECTION_SHEET = require("../../../assets/images/daily-path-reflection-sheet-v1.png");

/**
 * A reflection, answered in words, out loud, or in ink.
 *
 * ## One answer, three ways in
 *
 * Write and Say produce the same thing — her sentence — so switching between
 * them keeps it: say something, switch to Write, fix a word. Draw produces a
 * drawing *and* a caption, and the caption is the part Elara and the memory
 * tiers read, which is why the field under the paper asks for "a few words so
 * Elara can respond" rather than a title.
 *
 * Say is the existing transcription path (`useVoiceCapture` → Whisper), drawn
 * as the export draws it: the orb as the button, "Elara is listening…" while
 * it records, and the words it heard shown back before she moves on — a
 * transcript she has not seen is not an answer she gave.
 */
export function ReflectInput({
  modes,
  draft,
  onChange,
  placeholder,
  ideas,
  onError,
  palette = false,
  askCaption = true,
  shapes = false,
  editInPlace = false,
  editorial = false,
  shortHint = null,
  compact = false,
}: {
  modes: ReflectMode[];
  draft: ReflectDraft;
  onChange: (draft: ReflectDraft) => void;
  placeholder?: string;
  ideas?: string[];
  onError: (message: string | null) => void;
  /** The pad's inks and nibs. */
  palette?: boolean;
  /** Ask for words under the drawing. Off when the next step titles it. */
  askCaption?: boolean;
  /**
   * A drafted sentence she confirms rather than writes (the compass, "Make it
   * yours"): shown as her sentence with an Edit link that turns it into a
   * field in place.
   */
  editInPlace?: boolean;
  /** Day 1 uses an underlined mode picker and a more spacious writing page. */
  editorial?: boolean;
  /** Offer "Choose a shape instead". */
  shapes?: boolean;
  /**
   * Why Next is still waiting while her words are there (too few of them):
   * shown under the field in place of the sentence count, and announced.
   */
  shortHint?: string | null;
  /**
   * She is typing on a screen that has to hold more than the field (a daily
   * session's second question, keyboard up): the field starts short and its
   * foot (the count, the mic) steps aside, unless it is saying why Next waits.
   */
  compact?: boolean;
}) {
  const t = useT();
  const theme = usePracticeTheme();
  const [shapeMode, setShapeMode] = useState(() => !!draft.drawing?.shape);
  // Write and Say are intentionally separate drafts while she is choosing a
  // mode. A typed thought is not a voice transcript, and it must not make the
  // Say CTA look complete before she has actually recorded anything.
  const modeText = useRef<Record<"write" | "say", string>>({
    write: draft.mode === "write" ? draft.text : "",
    say: draft.mode === "say" ? draft.text : "",
  });
  // Whichever of ink / shape is not showing is set aside, not thrown away:
  // "Draw instead" swaps back and keeps the drawing (Interaction States spec).
  type Kept = { drawing: typeof draft.drawing; caption: string } | null;
  const setAside = useRef<{ ink: Kept; shape: Kept }>({ ink: null, shape: null });
  const set = (patch: Partial<ReflectDraft>) => onChange({ ...draft, ...patch });
  const label: Record<ReflectMode, string> = {
    write: t.practice.reflect.write,
    say: t.practice.reflect.say,
    draw: t.practice.reflect.draw,
  };
  const changeMode = (next: ReflectMode) => {
    const current = draft.mode;
    if (current === next) return;
    if (current === "write" || current === "say") modeText.current[current] = draft.text;
    set({ mode: next, text: next === "write" || next === "say" ? modeText.current[next] : draft.text });
  };
  const changeText = (text: string) => {
    if (draft.mode === "write" || draft.mode === "say") modeText.current[draft.mode] = text;
    set({ text });
  };

  return (
    <View style={styles.wrap}>
      {modes.length > 1 ? (
        <View style={[styles.modes, editorial && styles.editorialModes]} accessibilityRole="tablist" accessibilityLabel={t.practice.reflect.modesA11y}>
          {modes.map((m) => {
            const on = draft.mode === m;
            return (
              <PressableScale
                key={m}
                size="chip"
                haptic="select"
                onPress={() => changeMode(m)}
                style={[
                  styles.mode,
                  // On midnight the selected tab is the ember outline the rest
                  // of the week selects with; forest would be a second night.
                  editorial
                    ? { backgroundColor: "transparent", borderColor: "transparent", borderBottomColor: on ? theme.selectedBorder : theme.cardBorder, borderRadius: 0, borderWidth: 0, borderBottomWidth: on ? 3 : 1 }
                    : theme.dark
                    ? {
                        backgroundColor: on ? theme.selectedFill : theme.card,
                        borderColor: on ? theme.selectedBorder : withAlpha(theme.ink, 0.28),
                        borderWidth: on ? 2 : 1,
                      }
                    : {
                        backgroundColor: on ? colors.secondary : theme.card,
                        borderColor: on ? colors.secondary : theme.cardBorder,
                      },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={label[m]}
              >
                {/* The chosen tab wears a check, not only a fill: never
                    colour alone (Interaction States spec). */}
                {on && !editorial ? (
                  <Icon
                    name="solar:check-read-bold"
                    size={14}
                    color={theme.dark ? theme.ink : colors.white}
                  />
                ) : null}
                <AppText
                  variant={on ? "control" : "body"}
                  color={
                    editorial
                      ? on
                        ? theme.selectedSubline
                        : theme.muted
                      : on
                        ? theme.dark
                          ? theme.ink
                          : colors.white
                        : theme.dark
                          ? withAlpha(theme.ink, 0.82)
                          : theme.muted
                  }
                >
                  {label[m]}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
      ) : null}

      <CrossFade contentKey={draft.mode}>
        {draft.mode === "draw" ? (
          <View style={styles.drawBlock}>
            <CrossFade contentKey={shapes && shapeMode ? "shape" : "draw"}>
              {shapes && shapeMode ? (
                <ShapePicker
                  value={draft.drawing?.shape}
                  onPick={(drawing, name) =>
                    // Without a caption field the shape's name is her words for
                    // it until the next step asks her to title it.
                    set({ drawing, caption: askCaption ? draft.caption : name })
                  }
                />
              ) : (
                <DrawPad
                  value={draft.drawing}
                  onChange={(drawing) => set({ drawing, caption: askCaption ? draft.caption : "" })}
                  palette={palette}
                />
              )}
            </CrossFade>
            {shapes ? (
              <PressableScale
                size="chip"
                dim={0.6}
                onPress={() => {
                  // A shape and a drawing are two different answers, not
                  // layers of one — the one showing is the answer. The other
                  // waits, and comes back when she switches back.
                  const current = { drawing: draft.drawing, caption: draft.caption };
                  if (shapeMode) setAside.current.shape = current;
                  else setAside.current.ink = current;
                  const back = shapeMode ? setAside.current.ink : setAside.current.shape;
                  set({
                    drawing: back?.drawing ?? null,
                    caption: askCaption ? draft.caption : (back?.caption ?? ""),
                  });
                  setShapeMode((v) => !v);
                }}
                style={styles.shapeToggle}
                accessibilityRole="button"
              >
                <AppText variant="caption" color={theme.accent} style={styles.underline}>
                  {shapeMode ? t.practice.reflect.pad.drawInstead : t.practice.reflect.pad.chooseShape}
                </AppText>
              </PressableScale>
            ) : null}
            {askCaption ? (
              <TextInput
                value={draft.caption}
                onChangeText={(caption) => set({ caption })}
                placeholder={t.practice.reflect.pad.caption}
                placeholderTextColor={theme.muted}
                maxLength={280}
                style={[styles.caption, { color: theme.ink, borderColor: theme.cardBorder, backgroundColor: theme.card }]}
                accessibilityLabel={t.practice.reflect.pad.caption}
              />
            ) : null}
          </View>
        ) : draft.mode === "say" ? (
          <SayPanel
            text={draft.text}
            onText={changeText}
            ideas={ideas}
            onTypeInstead={modes.includes("write") ? () => set({ mode: "write" }) : undefined}
            onError={onError}
          />
        ) : (
          <WritePanel
            text={draft.text}
            onText={changeText}
            placeholder={placeholder}
            ideas={ideas}
            onError={onError}
            editInPlace={editInPlace}
            editorial={editorial}
            shortHint={shortHint}
            compact={compact}
          />
        )}
      </CrossFade>
    </View>
  );
}

function WritePanel({
  text,
  onText,
  placeholder,
  ideas,
  onError,
  editInPlace = false,
  editorial = false,
  shortHint = null,
  compact = false,
}: {
  text: string;
  onText: (text: string) => void;
  placeholder?: string;
  ideas?: string[];
  onError: (message: string | null) => void;
  editInPlace?: boolean;
  editorial?: boolean;
  shortHint?: string | null;
  compact?: boolean;
}) {
  const t = useT();
  const theme = usePracticeTheme();
  const [editing, setEditing] = useState(() => !editInPlace || !text.trim());
  if (!editing) {
    // Her sentence as a sentence first; Edit makes it a field in place.
    return (
      <View style={[styles.field, styles.readOnly, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
        <AppText variant="body" color={theme.ink}>
          {t.common.format.quote(text.trim())}
        </AppText>
        <PressableScale
          size="chip"
          dim={0.6}
          onPress={() => setEditing(true)}
          style={styles.editLink}
          accessibilityRole="button"
          accessibilityLabel={t.common.action.edit}
        >
          <Icon name="solar:pen-linear" size={14} color={theme.accent} />
          <AppText variant="control" color={theme.accent}>
            {t.common.action.edit}
          </AppText>
        </PressableScale>
      </View>
    );
  }
  const sentences = text.trim() ? text.trim().split(/(?<=[.!?…])\s+/).filter(Boolean).length : 0;
  return (
    <View style={styles.writeBlock}>
      {ideas?.length ? (
        <IdeaChips
          caption={t.practice.reflect.ideas}
          ideas={ideas}
          text={text}
          onPick={onText}
          a11y={t.practice.reflect.ideaA11y}
        />
      ) : null}

      <View style={[styles.field, editorial && styles.editorialField, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
        {/* The paper art covers the writing area only: stretched under the footer, its ink line struck through the count. */}
        <View style={editorial ? styles.writeArea : undefined}>
          {editorial ? <Image source={REFLECTION_SHEET} resizeMode="stretch" style={styles.reflectionSheet} /> : null}
          <TextInput
            value={text}
            onChangeText={onText}
            placeholder={placeholder}
            placeholderTextColor={theme.muted}
            multiline
            maxLength={2000}
            autoFocus={editInPlace}
            style={[styles.input, compact && styles.inputCompact, { color: theme.ink }]}
            accessibilityLabel={placeholder}
          />
        </View>
        {compact && !shortHint ? null : (
        <View style={[styles.fieldFoot, { borderTopColor: theme.cardBorder }]}>
          <AppText variant="caption" color={theme.muted} accessibilityLiveRegion="polite" style={styles.footNote}>
            {shortHint ?? (sentences ? t.practice.reflect.sentences(sentences) : "")}
          </AppText>
          <VoiceButton
            // 44: the smallest touch target on the session's screens (P1-9).
            size={44}
            tone="soft"
            onText={(spoken) => {
              onError(null);
              onText(text.trim() ? `${text.trim()} ${spoken}` : spoken);
            }}
            onError={onError}
          />
        </View>
        )}
      </View>
      <RecordingMeter />
    </View>
  );
}

/** Say: the orb is the button. The words it heard come back before she moves on. */
function SayPanel({
  text,
  onText,
  ideas,
  onTypeInstead,
  onError,
}: {
  text: string;
  onText: (text: string) => void;
  /** Suggestion chips under the recorder; tapping one is the answer. */
  ideas?: string[];
  onTypeInstead?: () => void;
  onError: (message: string | null) => void;
}) {
  const t = useT();
  const theme = usePracticeTheme();
  const [heard, setHeard] = useState(!!text.trim());
  // A chip is a whole answer, not the start of one: speaking after picking
  // one replaces it instead of tacking her words onto ours.
  const fromChip = useRef(!!ideas?.some((idea) => idea.trim() === text.trim()));
  const voice = useVoiceCapture((spoken) => {
    onError(null);
    const keep = fromChip.current ? "" : text.trim();
    fromChip.current = false;
    onText(keep ? `${keep} ${spoken}` : spoken);
    setHeard(true);
  });
  const { error, clearError } = voice;
  useEffect(() => {
    if (!error) return;
    onError(error);
    clearError();
  }, [error, clearError, onError]);

  const pulse = useLoopProgress({ duration: 1400, enabled: voice.isRecording, pingPong: true });
  const ring = useAnimatedTo(voice.isRecording ? 1 : 0);
  const status = voice.isRecording
    ? t.practice.reflect.listening
    : voice.isTranscribing
      ? t.practice.reflect.transcribing
      : t.practice.reflect.tapToSpeak;

  return (
    <View style={styles.sayBlock}>
      <View style={[styles.statusPill, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
        <AppText variant="control" color={theme.dark ? theme.ink : colors.secondary}>
          {status}
        </AppText>
      </View>

      <PressableScale
        size="circle"
        haptic="commit"
        onPress={voice.toggle}
        disabled={voice.isTranscribing}
        style={styles.orbButton}
        accessibilityRole="button"
        accessibilityLabel={voice.isRecording ? t.practice.reflect.orbStopA11y : t.practice.reflect.orbA11y}
        accessibilityState={{ busy: voice.isTranscribing }}
      >
        <View
          style={[
            styles.orbDisc,
            { backgroundColor: theme.dark ? theme.card : colors.white, borderColor: withAlpha(theme.accent, 0.15) },
          ]}
        >
          {/* The orb listens: it flows and glows with her voice. */}
          <FlowOrb
            size={ORB * 0.55 * (0.8 / 0.7)}
            listening={voice.isRecording}
            showGlow={voice.isRecording}
            glowIntensity={voice.isRecording ? 0.4 : 0}
          />
        </View>
        {/* The ember ring grows while the mic is open and breathes with it. */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <AnimatedRing opacity={ring} scale={pulse} color={theme.cta} />
        </View>
      </PressableScale>

      <RecordingMeter style={styles.meter} />

      {/* Mic access is off: one way to Settings, next to the screen's own
          escape (Type instead / Skip). The OS prompt is never looped. */}
      {voice.denied ? (
        <PressableScale
          size="chip"
          dim={0.6}
          onPress={() => void Linking.openSettings()}
          accessibilityRole="link"
          accessibilityLabel={t.practice.photo.openSettings}
        >
          <AppText variant="control" color={theme.accent} style={styles.underline}>
            {t.practice.photo.openSettings}
          </AppText>
        </PressableScale>
      ) : null}

      {/* "Or tap one that fits": a chip counts as the answer (Interaction
          States spec). Picking one replaces what was heard rather than
          appending to it, and hides "What Elara heard", which it is not. */}
      {ideas?.length ? (
        <IdeaChips
          caption={t.practice.reflect.sayIdeas}
          ideas={ideas}
          text={text}
          onPick={(idea) => {
            onError(null);
            fromChip.current = true;
            setHeard(false);
            onText(idea);
          }}
          center
          disabled={voice.busy}
        />
      ) : null}

      <Reveal visible={heard && !!text.trim() && !voice.busy} style={styles.heardWrap}>
        <View style={[styles.heard, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
          <AppText variant="label" color={theme.muted}>
            {t.practice.reflect.heard}
          </AppText>
          <TextInput
            value={text}
            onChangeText={onText}
            multiline
            maxLength={2000}
            style={[styles.input, styles.heardInput, { color: theme.ink }]}
            accessibilityLabel={t.practice.reflect.heard}
          />
        </View>
      </Reveal>

      {onTypeInstead ? (
        <PressableScale
          size="chip"
          dim={0.6}
          onPress={onTypeInstead}
          style={styles.typeInstead}
          accessibilityRole="button"
          accessibilityLabel={t.practice.reflect.typeInstead}
        >
          <Icon name="solar:pen-linear" size={16} color={theme.muted} />
          <AppText variant="control" color={theme.muted}>
            {t.practice.reflect.typeInstead}
          </AppText>
        </PressableScale>
      ) : null}
    </View>
  );
}

/**
 * Tappable answers under a reflection: starting points in Write, whole
 * answers under the recorder in Say. The chosen one wears a check as well as
 * the fill, so the choice never rests on colour alone.
 */
function IdeaChips({
  caption,
  ideas,
  text,
  onPick,
  a11y,
  center = false,
  disabled = false,
}: {
  caption: string;
  ideas: string[];
  text: string;
  onPick: (idea: string) => void;
  a11y?: (idea: string) => string;
  center?: boolean;
  disabled?: boolean;
}) {
  const theme = usePracticeTheme();
  const current = text.trim();
  return (
    <View style={[styles.ideasBlock, center && styles.ideasCenter]}>
      <AppText variant="label" color={theme.muted} center={center}>
        {caption}
      </AppText>
      <View style={[styles.ideas, center && styles.ideasRowCenter]}>
        {ideas.map((idea) => {
          const on = current === idea.trim();
          return (
            <PressableScale
              key={idea}
              size="chip"
              haptic="answer"
              onPress={() => onPick(idea)}
              disabled={disabled}
              containerStyle={disabled ? { opacity: interaction.disabledOpacity } : undefined}
              style={[
                styles.idea,
                {
                  borderColor: on ? theme.selectedBorder : theme.cardBorder,
                  backgroundColor: on ? theme.selectedFill : theme.card,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled }}
              accessibilityLabel={a11y ? a11y(idea) : idea}
            >
              {on ? <Icon name="solar:check-read-bold" size={14} color={theme.accent} /> : null}
              <AppText variant="body" color={theme.ink}>
                {idea}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

function AnimatedRing({
  opacity,
  scale,
  color,
}: {
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}) {
  return (
    <Animated.View
      style={[
        styles.ring,
        {
          borderColor: color,
          opacity,
          transform: [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
        },
      ]}
    />
  );
}

const ORB = 176;

const styles = StyleSheet.create({
  readOnly: { padding: spacing[4], gap: spacing[3] },
  editLink: { flexDirection: "row", alignItems: "center", gap: spacing[1], alignSelf: "flex-start" },
  wrap: { width: "100%", gap: spacing[4] },
  modes: { flexDirection: "row", gap: spacing[2] },
  editorialModes: { justifyContent: "space-around", gap: 0 },
  mode: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1.5],
    paddingHorizontal: spacing[5],
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  drawBlock: { gap: spacing[3] },
  shapeToggle: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: spacing[3] },
  underline: { textDecorationLine: "underline" },
  caption: {
    ...type.body,
    borderWidth: 1,
    borderRadius: radius.content,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3.5],
    minHeight: 52,
  },
  writeBlock: { gap: spacing[3] },
  ideasBlock: { gap: spacing[2.5] },
  ideasCenter: { alignSelf: "stretch", alignItems: "center" },
  ideas: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  ideasRowCenter: { justifyContent: "center" },
  idea: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1.5],
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    minHeight: 44,
    justifyContent: "center",
  },
  // A reflection should feel like a small page to return to, not a chat
  // composer. The extra inset and rounder edge echo the editorial cards while
  // preserving the familiar input behaviour.
  field: { borderWidth: 1, borderRadius: radius.feature, overflow: "hidden" },
  editorialField: { minHeight: 280 },
  writeArea: { flex: 1, minHeight: 200, overflow: "hidden" },
  // Taller than the writing area and pinned to its foot: the art's ink wave sits in its top third, out of view, so it never strikes through her words.
  reflectionSheet: { position: "absolute", left: 0, right: 0, bottom: 0, height: "160%", opacity: 0.96 },
  input: {
    ...type.body,
    // Her words at the session's reading size (P1-9): 16, never the 15 of helper copy.
    fontSize: 16,
    lineHeight: 23,
    color: colors.textBody,
    // Above the paper art (`reflectionSheet`, absolute) on web too. Native draws
    // the later sibling on top and is unchanged (relative is Yoga's default);
    // react-native-web stacked the art over the field, words included.
    position: "relative",
    minHeight: 148,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
    textAlignVertical: "top",
  },
  // Typing with the question, her choice and the button all to keep in view
  // (360 wide with the keyboard up): two lines and a half to start with,
  // growing as she writes.
  inputCompact: { minHeight: 84, paddingTop: spacing[3], paddingBottom: spacing[3] },
  /** The count, or why Next waits; never pushes the mic button off the row. */
  // The count (or why Next waits) at the readable floor for meta, 14 (P1-9).
  footNote: { flex: 1, minWidth: 0, paddingRight: spacing[2], fontSize: 14, lineHeight: 19 },
  fieldFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    marginHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  sayBlock: { alignItems: "center", gap: spacing[5], paddingTop: spacing[4] },
  statusPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2.5],
  },
  orbButton: { width: ORB, height: ORB, alignItems: "center", justifyContent: "center" },
  orbDisc: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ORB / 2,
    borderWidth: 3,
  },
  meter: { alignSelf: "stretch" },
  heardWrap: { alignSelf: "stretch" },
  heard: { borderWidth: 1, borderRadius: radius.content, padding: spacing[4], gap: spacing[2] },
  heardInput: { minHeight: 60, paddingHorizontal: 0, paddingTop: 0 },
  typeInstead: { flexDirection: "row", alignItems: "center", gap: spacing[2], minHeight: 44, paddingHorizontal: spacing[3] },
});
