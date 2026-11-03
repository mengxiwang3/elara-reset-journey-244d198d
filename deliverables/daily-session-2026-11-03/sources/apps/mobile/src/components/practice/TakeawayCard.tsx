import { StyleSheet, View } from "react-native";
import { AppText } from "../AppText";
import { Icon } from "../Icon";
import { PressableScale } from "@/motion";
import { colors, fontFamily, radius, spacing } from "@/theme";

/**
 * «Hoy te llevas»: the day's takeaway card (daily session, Nov 2026).
 *
 * One slot per step that has a place on it (`DayConfig.card`): its label, and
 * then her words exactly as she wrote them, wrapping in full. Before she has
 * answered, a slot is an empty line holding its hint (the opening shows the
 * card empty, so the purpose is concrete before any effort). A slot she passed
 * says so, and nothing is ever written there for her.
 *
 * Plain paper, not one of Elara's cards: these are her words.
 */
export interface TakeawaySlotView {
  key: string;
  /** «Tu elección», «Para llevarte». */
  label: string;
  /** Her words, or the option she chose. */
  text: string | null;
  /** What stands where her words would: «Pasaste esta pregunta», «Sin nota por hoy», a state's words, or the hint. */
  stand?: string | null;
  /** The slot is still to be filled: `stand` is its hint, drawn as an empty line. */
  empty?: boolean;
  /** Read aloud for the empty slot ("Para llevarte: todavía vacío. Una pregunta o un pequeño paso"). */
  a11y?: string;
}

export function TakeawayCard({
  slots,
  edit,
  preview = false,
}: {
  slots: readonly TakeawaySlotView[];
  /** «Editar»: reopens the step her words came from. */
  edit?: { label: string; a11y: string; onPress: () => void } | null;
  /**
   * The empty card on the session's opening, kept small (a preview of what
   * she will take, not a form): tighter lines, and a slot with no hint is one
   * row, its label beside the line to fill.
   */
  preview?: boolean;
}) {
  return (
    <View style={styles.card}>
      {slots.map((slot, i) => {
        const inline = preview && slot.empty && !slot.text && !slot.stand;
        return (
        <View
          key={slot.key}
          style={[styles.slot, preview && styles.slotPreview, inline && styles.slotInline, i > 0 && styles.rule]}
          accessible
          accessibilityLabel={slot.a11y ?? `${slot.label}: ${slot.text ?? slot.stand ?? ""}`}
        >
          <AppText style={styles.label}>{slot.label}</AppText>
          {slot.text ? (
            <AppText style={styles.value} selectable>
              {slot.text}
            </AppText>
          ) : slot.empty ? (
            <View style={[styles.blank, preview && styles.blankPreview, inline && styles.blankInline]}>
              {slot.stand ? <AppText style={styles.hint}>{slot.stand}</AppText> : null}
            </View>
          ) : slot.stand ? (
            <AppText style={styles.stand}>{slot.stand}</AppText>
          ) : null}
        </View>
        );
      })}
      {edit ? (
        <PressableScale
          size="chip"
          onPress={edit.onPress}
          style={styles.edit}
          accessibilityRole="button"
          accessibilityLabel={edit.a11y}
        >
          <Icon name="solar:pen-linear" size={16} color={colors.secondary} />
          <AppText style={styles.editLabel}>{edit.label}</AppText>
        </PressableScale>
      ) : null}
    </View>
  );
}

/** The card's paper and its rules: the photo band's own (`BandDay`). */
const PAPER = "#FFFEFB";
const LINE = "#DDD3BD";

const styles = StyleSheet.create({
  card: {
    backgroundColor: PAPER,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: radius.feature,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
  },
  slot: { paddingVertical: spacing[3], gap: spacing[1] },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: LINE },
  // 14 / 16 at the smallest (session readability floor, P1-9).
  label: { fontFamily: fontFamily.sansSemibold, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  value: { fontFamily: fontFamily.sans, fontSize: 17, lineHeight: 25, color: colors.foreground },
  stand: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textSecondary },
  // An empty line to fill: a dashed frame around the hint.
  blank: {
    marginTop: spacing[1],
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#B9AE9C",
    borderRadius: radius.content,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    // A slot with no hint is still a line to fill, not a box of nothing.
    minHeight: 20,
  },
  hint: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textSecondary },
  // The opening's preview: the same card, closer set.
  slotPreview: { paddingVertical: spacing[2] },
  slotInline: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  blankPreview: { paddingVertical: spacing[1] },
  blankInline: { flex: 1, marginTop: 0, minHeight: 24 },
  edit: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1.5],
    minHeight: 44,
    paddingHorizontal: spacing[2],
    marginBottom: spacing[1],
  },
  editLabel: { fontFamily: fontFamily.sansSemibold, fontSize: 16, lineHeight: 22, color: colors.secondary },
});
