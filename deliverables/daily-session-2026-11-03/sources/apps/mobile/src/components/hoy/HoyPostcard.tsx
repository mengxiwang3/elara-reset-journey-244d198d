import { useMemo, useState, type ReactNode } from "react";
import { Image, StyleSheet, Text, View, type ImageSourcePropType, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Defs, G, Mask, Path, Rect } from "react-native-svg";
import { AppText } from "@/components/AppText";
import { PAPER, tornPath } from "@/components/drawer/Paper";
import { Icon } from "@/components/Icon";
import { tornDepths } from "@/components/practice/landscape/photoDay";
import { WorldArt } from "@/components/world";
import type { WorldId } from "@/components/world/types";
import { colors, fontFamily, spacing } from "@/theme";

/**
 * Hoy's postcard (Option B "Hoy"): today's place as a torn print on a sheet
 * of torn paper, a perforated stamp with the day's keepsake, a postmark, and
 * under them where she is, today's question, one line and the one action.
 *
 * Paper is drawn, not imported: the sheet is `tornPath` (the drawer's torn
 * edge), the print's foot the day band's tear (`tornDepths`), both seeded so
 * the tear is the same on every render. The card leans 0.4 degrees, as the
 * board's does. Decoration stays on the travel objects (Final Pass FX 10).
 */

/** The sheet's paper: our ivory, not the board's. */
const SHEET = colors.atlasPaper;
const PRINT_SEED = 11;

export function HoyPostcard({
  photo,
  worldId,
  photoLabel,
  stamp,
  stampName,
  compact,
  children,
}: {
  /** The day's own photograph (`dayPhoto`), or null for a world with no place (its art stands in). */
  photo: ImageSourcePropType | null;
  worldId: WorldId | null;
  photoLabel: string;
  /** The day's keepsake on the stamp, or the place's photograph when it has none. */
  stamp: { art: ImageSourcePropType | null; photo: boolean } | null;
  /** The place's name on the stamp's foot. */
  stampName: string;
  /** A short screen: a lower print, so the action stays in the first screen. */
  compact?: boolean;
  children: ReactNode;
}) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.w - width) > 0.5 || Math.abs(size.h - height) > 0.5) setSize({ w: width, h: height });
  };
  const outline = useMemo(
    () =>
      size
        ? tornPath(
            [
              [0, 0],
              [size.w, 0],
              [size.w, size.h],
              [0, size.h],
            ],
            23,
            1.4,
            6,
          )
        : null,
    [size],
  );
  const printW = size ? size.w - PAD * 2 : 0;
  // A landscape strip, not a square: the day's title and its action stay in the first screen.
  const printH = Math.round(Math.min(200, Math.max(132, printW * (compact ? 0.42 : 0.52))));

  return (
    <View style={styles.lean}>
      <View onLayout={onLayout} style={styles.card}>
        {outline && size ? (
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* A soft shadow that follows the tear: two offset, faint copies, no blur. */}
            <Path d={outline} fill={PAPER.shadow} fillOpacity={0.05} transform="translate(0 5)" />
            <Path d={outline} fill={PAPER.shadow} fillOpacity={0.1} transform="translate(0 1.5)" />
            <Path d={outline} fill={SHEET} />
          </Svg>
        ) : null}

        <View style={[styles.print, { height: printH }]}>
          {photo ? (
            // The print lets the stamp hang over its edge, so the picture is clipped in its own box: a wide photo would spill out otherwise.
            <View style={[StyleSheet.absoluteFill, styles.clip]}>
              <Image
                source={photo}
                resizeMode="cover"
                style={StyleSheet.absoluteFill}
                accessible
                accessibilityRole="image"
                accessibilityLabel={photoLabel}
              />
            </View>
          ) : worldId && printW > 0 ? (
            <WorldArt worldId={worldId} variant="distant" width={printW} height={printH} accessibilityLabel={photoLabel} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.sagePale }]} />
          )}
          {printW > 0 ? <PrintTear width={printW} /> : null}
          <Postmark />
          {stamp ? <Stamp art={stamp.art} photo={stamp.photo} name={stampName} /> : null}
        </View>

        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );
}

const PAD = 12;

/** The print's torn foot: the sheet's paper over a jagged line. */
function PrintTear({ width }: { width: number }) {
  const d = useMemo(() => {
    const depths = tornDepths(PRINT_SEED, 3);
    const h = TEAR_H;
    const n = depths.length - 1;
    const pts = depths.map((dep, i) => `L${((i / n) * width).toFixed(1)} ${(h - 2 - dep * 100 * 1.6).toFixed(1)}`);
    return `M0 ${h} ${pts.join(" ")} L${width.toFixed(1)} ${h} Z`;
  }, [width]);
  return (
    <Svg width={width} height={TEAR_H} style={styles.tear} pointerEvents="none">
      <Path d={d} fill={SHEET} />
    </Svg>
  );
}
const TEAR_H = 10;

const STAMP_W = 62;
const STAMP_H = 76;
const PERF_R = 2.4;

/** A perforated stamp: the keepsake (or the place) in a pale square, the place's name under it. */
function Stamp({ art, photo, name }: { art: ImageSourcePropType | null; photo: boolean; name: string }) {
  const holes = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = 4; x < STAMP_W; x += 7) out.push([x, 0], [x, STAMP_H]);
    for (let y = 5; y < STAMP_H; y += 7) out.push([0, y], [STAMP_W, y]);
    return out;
  }, []);
  return (
    <View style={styles.stamp} accessible={false} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width={STAMP_W} height={STAMP_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <Mask id="hoy-perf">
            <Rect width={STAMP_W} height={STAMP_H} fill="#fff" />
            <G fill="#000">
              {holes.map(([cx, cy], i) => (
                <Circle key={i} cx={cx} cy={cy} r={PERF_R} />
              ))}
            </G>
          </Mask>
        </Defs>
        <Rect width={STAMP_W} height={STAMP_H} fill={colors.atlasMount} mask="url(#hoy-perf)" />
        <Rect x={5} y={5} width={STAMP_W - 10} height={STAMP_W - 10} fill={colors.sagePale} />
      </Svg>
      {art ? (
        <Image
          source={art}
          resizeMode={photo ? "cover" : "contain"}
          style={photo ? styles.stampPhoto : styles.stampArt}
        />
      ) : null}
      {/* The stamp's printed name: a postal motif, set like the Circles stamp. */}
      <Text style={styles.stampName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} allowFontScaling={false}>
        {name.toLocaleUpperCase()}
      </Text>
    </View>
  );
}

/** The postmark: a ring and three waves, half-inked, across the print's corner. */
function Postmark() {
  return (
    <View style={styles.postmark} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width={74} height={40} viewBox="0 0 74 40">
        <Circle cx={20} cy={20} r={15} fill="none" stroke={colors.secondary} strokeWidth={1.3} />
        <Circle cx={20} cy={20} r={9} fill="none" stroke={colors.secondary} strokeWidth={1} />
        <Path
          d="M38 12c6-3 12 3 18 0s12 3 18 0M38 20c6-3 12 3 18 0s12 3 18 0M38 28c6-3 12 3 18 0s12 3 18 0"
          fill="none"
          stroke={colors.secondary}
          strokeWidth={1.3}
        />
      </Svg>
    </View>
  );
}

/** "✓ Day 3 done", in the card. */
export function DoneLine({ label }: { label: string }) {
  return (
    <View style={styles.doneLine}>
      <Icon name="ph:check-bold" size={18} color={colors.secondary} />
      <AppText variant="control" color={colors.secondary} style={styles.flex}>
        {label}
      </AppText>
    </View>
  );
}

/** "✓ You're on step 2 of 3. What you wrote is saved." */
export function SavedNote({ label }: { label: string }) {
  return (
    <View style={styles.doneLine}>
      <Icon name="ph:check-bold" size={16} color={colors.secondary} />
      <AppText variant="body" color={colors.secondary} style={styles.flex}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  lean: { transform: [{ rotate: "-0.4deg" }] },
  card: { paddingTop: PAD, paddingHorizontal: PAD, paddingBottom: spacing[5], gap: spacing[5] },
  print: { overflow: "visible", backgroundColor: colors.sagePale },
  clip: { overflow: "hidden" },
  tear: { position: "absolute", left: 0, bottom: -1 },
  stamp: {
    position: "absolute",
    right: 14,
    bottom: -36,
    width: STAMP_W,
    height: STAMP_H,
    transform: [{ rotate: "5deg" }],
    shadowColor: PAPER.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  stampArt: { position: "absolute", left: 7, top: 7, width: STAMP_W - 14, height: STAMP_W - 14 },
  stampPhoto: { position: "absolute", left: 5, top: 5, width: STAMP_W - 10, height: STAMP_W - 10 },
  stampName: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 7,
    textAlign: "center",
    fontFamily: fontFamily.sansSemibold,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.secondary,
  },
  postmark: { position: "absolute", right: 52, bottom: -18, opacity: 0.55, transform: [{ rotate: "-6deg" }] },
  body: { paddingHorizontal: spacing[2.5], gap: spacing[2.5] },
  doneLine: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  flex: { flex: 1, minWidth: 0 },
});
