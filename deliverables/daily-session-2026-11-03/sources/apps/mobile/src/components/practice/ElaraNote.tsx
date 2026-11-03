import { Image, StyleSheet, View } from "react-native";
import { AppText } from "../AppText";
import { ELARA_ORB } from "../system/ElaraMark";
import { ElaraShimmer } from "../system/ElaraShimmer";
import { useT } from "@/i18n";
import { colors, fontFamily, radius, spacing } from "@/theme";

/**
 * Elara's note, set second (daily session, Nov 2026): under the field on the
 * question after hers, and under the takeaway card on the close. Her line is
 * there to read, never the first thing on the screen and never the loudest:
 * a small orb, its label («Elara notó» over words written from hers, «De
 * Elara» over an authored line), and the line, on a quiet paper.
 *
 * The line is kept at the session's reading size (16) and made secondary by
 * place, weight and ink, not by shrinking it below the floor.
 */
export function ElaraNote({
  label,
  text,
  pending = false,
}: {
  /** «Elara notó» or «De Elara». */
  label: string;
  text: string | null;
  /** Her line is on its way. */
  pending?: boolean;
}) {
  const t = useT();
  const waiting = pending && !text;
  return (
    <View
      style={styles.note}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={waiting ? t.practice.elara.thinking : `${label}. ${text ?? ""}`}
    >
      <View style={styles.head}>
        {waiting ? (
          <ElaraShimmer active size={22} />
        ) : (
          <Image source={ELARA_ORB} style={styles.orb} accessibilityIgnoresInvertColors />
        )}
        <AppText style={styles.label}>{label}</AppText>
      </View>
      <AppText style={waiting ? styles.pending : styles.text}>{waiting ? t.practice.elara.thinking : text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    gap: spacing[1.5],
    paddingHorizontal: spacing[3.5],
    paddingVertical: spacing[3],
    borderRadius: radius.content * 1.5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DED5C7",
    backgroundColor: "#F2ECE1",
  },
  head: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  orb: { width: 22, height: 22, borderRadius: 11 },
  label: { fontFamily: fontFamily.sansSemibold, fontSize: 14, lineHeight: 20, color: colors.secondary },
  text: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textBody },
  pending: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
});
