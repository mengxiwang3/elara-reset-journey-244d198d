import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AppText } from "@/components/AppText";
import { Icon } from "@/components/Icon";
import { CONTINENTS, GLOBE_AREAS } from "@/content/places";
import { PressableScale } from "@/motion";
import { colors, fontFamily, radius, spacing } from "@/theme";

/** A Hoy section heading ("Tu semana en Wuzhen", "Para retomar", "Para hoy"), with an optional count. */
export function HoySection({ title, aside, asideA11y, children }: { title: string; aside?: string; asideA11y?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <AppText variant="sectionTitle" accessibilityRole="header" style={styles.flex}>
          {title}
        </AppText>
        {aside ? (
          <AppText variant="bodySmall" color={colors.textSecondary} accessibilityLabel={asideA11y}>
            {aside}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/**
 * What she took away (the daily session, Nov 2026): «Hoy te llevas · Día 1» at
 * the top once today is done, «La última vez anotaste · Día 1» under a new
 * day. Her words, three lines at most; the whole card opens that day's close.
 */
export function TakeawayRow({ label, quote, hint, onPress }: { label: string; quote: string; hint: string; onPress: () => void }) {
  return (
    <PressableScale
      size="card"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${quote}`}
      accessibilityHint={hint}
      style={styles.takeaway}
    >
      <View style={styles.takeawayHead}>
        <AppText variant="bodySmall" color={colors.secondary} style={[styles.semibold, styles.flex]}>
          {label}
        </AppText>
        <Icon name="solar:alt-arrow-right-linear" size={18} color={colors.textSecondary} />
      </View>
      <AppText color={colors.foreground} numberOfLines={3} style={styles.takeawayQuote}>
        {quote}
      </AppText>
    </PressableScale>
  );
}

/** A «Para hoy» row: a title, one line under it, a chevron. At least 68pt tall. */
export function ForTodayRow({
  title,
  meta,
  leading,
  onPress,
  first,
}: {
  title: string;
  meta: string;
  leading?: ReactNode;
  onPress: () => void;
  /** The first row also draws the rule above it. */
  first?: boolean;
}) {
  return (
    <PressableScale
      size="card"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${meta}`}
      style={[styles.row, first && styles.rowFirst]}
    >
      {leading}
      <View style={styles.rowText}>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText variant="bodySmall" color={colors.textSecondary}>
          {meta}
        </AppText>
      </View>
      <Icon name="solar:alt-arrow-right-linear" size={18} color={colors.textSecondary} />
    </PressableScale>
  );
}

/** The six Areas as six dots, in each continent's colour: "your six areas". Decorative. */
export function SixAreasMark() {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width={64} height={32} viewBox="0 0 64 32">
        {GLOBE_AREAS.map((area, i) => (
          <Circle key={area} cx={7 + i * 10} cy={i % 2 ? 19 : 12} r={4.6} fill={CONTINENTS[area].col} />
        ))}
      </Svg>
    </View>
  );
}

/** «Buscar ayuda ahora»: quiet, always there, never the headline. */
export function HelpNowLink({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  return (
    <PressableScale size="chip" onPress={onPress} accessibilityRole="link" accessibilityLabel={a11y} style={styles.help}>
      <Icon name="solar:heart-linear" size={18} color={colors.textSecondary} />
      <AppText variant="body" color={colors.textSecondary} style={styles.medium}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing[3] },
  head: { flexDirection: "row", alignItems: "baseline", gap: spacing[3] },
  flex: { flex: 1, minWidth: 0 },
  takeaway: {
    backgroundColor: colors.atlasPaper,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    borderRadius: radius["2xl"],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[5],
    gap: spacing[1.5],
  },
  takeawayHead: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  // Her words at the session's reading size (P1-9).
  takeawayQuote: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23 },
  semibold: { fontFamily: fontFamily.sansSemibold },
  medium: { fontFamily: fontFamily.sansMedium },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3.5],
    minHeight: 68,
    paddingVertical: spacing[3],
    paddingHorizontal: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowFirst: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  help: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing[2] },
});
