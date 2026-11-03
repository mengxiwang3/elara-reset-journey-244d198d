/**
 * Small pieces every Círculos screen shares: the reading sizes, a byline with
 * a tappable name, the row actions, the pushed bar, the Undo notice and the
 * «Compartir» button. The client's prototype is translated into our tokens
 * (Instrument Sans, forest and ember from `@elara/tokens`): no Figtree, no
 * Newsreader, no sage palette.
 *
 * Sizes follow the client's acceptance list: body 16, metadata 14 to 15,
 * action labels 14 or more, every control 44 x 44 pt or larger.
 */
import type { TopicAuthorDTO } from "@elara/shared";
import { useEffect, useState, type ReactNode } from "react";
import { Animated, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { AppText } from "@/components/AppText";
import { Icon } from "@/components/Icon";
import { Face } from "@/components/circles/Face";
import { circleInk } from "@/components/circles/tokens";
import { authorName } from "@/components/circles/topics/ui";
import { useT } from "@/i18n";
import { timeAgo } from "@/lib/dates";
import { ease, haptics, interaction, PressableScale, useReducedMotion } from "@/motion";
import { colors, layout, radius, shadow, spacing } from "@/theme";
import { canContact, undoLeft } from "./model";
import { useBlockUndo, useCirculosBlocks } from "./seams/blocks";
import { showToast } from "@/components/Toast";

/** The client's reading sizes, on our type roles. */
export const READ: TextStyle = { fontSize: 16, lineHeight: 23 };
export const META: TextStyle = { fontSize: 14, lineHeight: 19 };

export const ink = {
  ink: circleInk.ink,
  ink2: circleInk.ink2,
  hair: circleInk.hair,
  rule: circleInk.rule,
  forest: colors.buttonForest,
  cream: colors.cream,
  /** Terracotta as text on the page (the band's `terra`). */
  terra: circleInk.terra,
  ember: colors.ring,
  paper: colors.bubbleMember,
  /** The warm seal behind the personal news row. */
  seal: colors.accent,
  sealEdge: colors.sand,
  disabled: colors.disabledBg,
  danger: colors.destructive,
} as const;

export const DOT = " · ";

/** A screen's side margin: the app's screen margin token (24), the same gutter as Hoy and the day screens. */
export const GUT = layout.screenMargin;

/**
 * Her name and how long ago. The name is a button to the profile only for
 * another named member (never herself, never «Anónima», C3); its 44pt target
 * reaches above and below without moving the line.
 */
export function Byline({
  author,
  createdAt,
  onProfile,
  size = 24,
  extra,
}: {
  author: TopicAuthorDTO;
  createdAt: number;
  onProfile?: (id: string, name: string) => void;
  size?: number;
  extra?: string | null;
}) {
  const t = useT();
  const name = authorName(author, t);
  const contact = canContact(author) && !!onProfile;
  const face = author.anonymous && !author.you ? (
    <View style={[styles.anon, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon name="solar:user-linear" size={Math.round(size * 0.62)} color={ink.ink2} />
    </View>
  ) : (
    <Face name={author.name ?? name} size={size} me={author.you} />
  );
  return (
    <View style={styles.byline}>
      {contact ? (
        <PressableScale
          size="chip"
          dim={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
          onPress={() => onProfile!(author.id!, author.name!)}
          accessibilityRole="button"
          accessibilityLabel={t.circleTopics.circulos.row.profileA11y(name)}
          style={styles.person}
        >
          {face}
          <AppText variant="control" color={ink.ink} style={META} numberOfLines={1}>
            {name}
          </AppText>
        </PressableScale>
      ) : (
        <View style={styles.person}>
          {face}
          <AppText variant="control" color={ink.ink} style={META} numberOfLines={1}>
            {name}
          </AppText>
        </View>
      )}
      <AppText variant="bodySmall" color={ink.ink2} style={[META, styles.shrink]} numberOfLines={1}>
        {[timeAgo(createdAt, t), extra].filter(Boolean).join(DOT)}
      </AppText>
    </View>
  );
}

/** A row action: an icon and a word, 44pt tall, pressed state read out. */
export function Action({
  icon,
  label,
  on,
  onPress,
  accessibilityLabel,
  color,
}: {
  icon?: string;
  label: string;
  on?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  color?: string;
}) {
  const tint = color ?? (on ? ink.terra : ink.forest);
  return (
    <PressableScale
      size="chip"
      dim={0.6}
      haptic={on === undefined ? undefined : "select"}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={on === undefined ? undefined : { selected: on }}
      style={styles.action}
    >
      {icon ? <Icon name={icon} size={18} color={tint} /> : null}
      <AppText variant="control" color={tint} style={styles.actionLabel}>
        {label}
      </AppText>
    </PressableScale>
  );
}

/** The bar of a pushed Círculos screen: «Volver», a short title that ends in «…», and one trailing control. */
export function Bar({ onBack, title, trailing, backLabel }: { onBack: () => void; title?: string; trailing?: ReactNode; backLabel?: string }) {
  const t = useT();
  return (
    <View style={styles.bar}>
      <PressableScale
        size="chip"
        dim={0.6}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel ?? t.circleTopics.back}
        style={styles.back}
      >
        <Icon name="solar:arrow-left-linear" size={20} color={ink.terra} />
        <AppText variant="control" color={ink.terra} numberOfLines={1}>
          {t.circleTopics.back}
        </AppText>
      </PressableScale>
      <AppText variant="cardTitle" color={ink.forest} numberOfLines={1} style={styles.barTitle} accessibilityRole="header">
        {title ?? ""}
      </AppText>
      <View style={styles.barEnd}>{trailing ?? null}</View>
    </View>
  );
}

/** An icon-only control with its label for VoiceOver. */
export function IconAction({ icon, label, onPress, color = ink.ink2 }: { icon: string; label: string; onPress: () => void; color?: string }) {
  return (
    <PressableScale size="circle" dim={0.6} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.iconBtn}>
      <Icon name={icon} size={22} color={color} />
    </PressableScale>
  );
}

/** A section's own words in a row: heading text left, one control right. */
export function Line({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.line, style]}>{children}</View>;
}

/**
 * «Bloqueaste a Marina.» with «Deshacer», for six seconds. Mounted once per
 * screen; it reads the one module-wide Undo, so it is still there on the
 * screen she lands on when a blocked author's conversation closes itself.
 */
export function UndoBar({ bottom = spacing[4] }: { bottom?: number }) {
  const t = useT();
  const k = t.circleTopics.circulos.block;
  const { undo, dismiss } = useBlockUndo();
  const { unblock } = useCirculosBlocks();
  const reduced = useReducedMotion();
  const [shown] = useState(() => new Animated.Value(0));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!undo) return;
    const left = undoLeft(undo, Date.now());
    if (!left) {
      dismiss();
      return;
    }
    shown.setValue(0);
    Animated.timing(shown, { toValue: 1, duration: reduced ? interaction.reducedFade : interaction.tab, easing: ease.entrance, useNativeDriver: true }).start();
    const timer = setTimeout(dismiss, left);
    return () => clearTimeout(timer);
  }, [undo, dismiss, shown, reduced]);

  if (!undo) return null;
  const translateY = reduced ? 0 : shown.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  return (
    <Animated.View
      style={[styles.undo, { bottom, opacity: shown, transform: [{ translateY }] }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <AppText variant="control" color={ink.cream} style={styles.flex}>
        {k.done(undo.name)}
      </AppText>
      <PressableScale
        size="chip"
        dim={0.6}
        disabled={busy}
        onPress={() => {
          const who = undo;
          setBusy(true);
          unblock(who.memberId).then(
            () => {
              setBusy(false);
              dismiss();
              haptics.success();
              showToast(k.undone(who.name));
            },
            () => setBusy(false),
          );
        }}
        accessibilityRole="button"
        accessibilityLabel={`${k.undo}. ${k.done(undo.name)}`}
        style={styles.undoBtn}
      >
        <AppText variant="control" color={ink.cream} style={styles.underline}>
          {k.undo}
        </AppText>
      </PressableScale>
    </Animated.View>
  );
}

/** «Compartir»: the filled forest button, bottom right, above the tab bar when there is one. */
export function ShareFab({ onPress, bottom, compact }: { onPress: () => void; bottom: number; compact?: boolean }) {
  const t = useT();
  const c = t.circleTopics.circulos;
  return (
    <PressableScale
      size="pill"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={c.shareA11y}
      containerStyle={[styles.fabWrap, { bottom }]}
      style={[styles.fab, compact && styles.fabCompact]}
    >
      <Icon name="solar:pen-new-square-linear" size={22} color={ink.cream} />
      {compact ? null : (
        <AppText variant="control" color={ink.cream} numberOfLines={1}>
          {c.share}
        </AppText>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  byline: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 6, minHeight: 28 },
  person: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 28, maxWidth: "100%" },
  anon: { backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" },
  action: { minHeight: 44, minWidth: 44, flexDirection: "row", alignItems: "center", gap: 5, paddingRight: 4 },
  actionLabel: { fontSize: 14, lineHeight: 19 },
  bar: { flexDirection: "row", alignItems: "center", minHeight: 52, paddingHorizontal: 8, gap: 4 },
  back: { minHeight: 44, minWidth: 44, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, flexShrink: 0 },
  barTitle: { flex: 1, minWidth: 0, textAlign: "center" },
  barEnd: { minWidth: 44, alignItems: "flex-end", flexShrink: 0 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  line: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  undo: {
    position: "absolute",
    left: GUT,
    right: GUT,
    zIndex: 30,
    minHeight: 52,
    borderRadius: radius.content,
    backgroundColor: ink.forest,
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    ...shadow("md"),
  },
  undoBtn: { minHeight: 44, minWidth: 44, paddingHorizontal: spacing[3], alignItems: "center", justifyContent: "center" },
  underline: { textDecorationLine: "underline" },
  fabWrap: { position: "absolute", right: GUT, zIndex: 15, ...shadow("md") },
  fab: {
    minHeight: 56,
    minWidth: 56,
    borderRadius: 28,
    paddingLeft: 18,
    paddingRight: 22,
    backgroundColor: ink.forest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fabCompact: { paddingLeft: 0, paddingRight: 0, width: 56 },
});
