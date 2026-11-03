import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Keyboard, Linking, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "../AppText";
import { Icon } from "../Icon";
import { useT } from "@/i18n";
import { api, photoSource } from "@/lib/api";
import { pickPracticePhoto } from "@/lib/imagePicker";
import { FadeIn, haptics, PressableScale } from "@/motion";
import { colors, radius, spacing, type, withAlpha } from "@/theme";
import type { PhotoDraft } from "./draft";
import { usePracticeTheme } from "./theme";

/** `preview`: chosen, shown with Use photo / Retake, not uploaded yet. */
export type PhotoStatus = "idle" | "preparing" | "preview" | "uploading" | "failed" | "denied";

/**
 * Taking, uploading and re-taking a practice photo.
 *
 * Lifted out of the input so the day's one forward button can *be* "Take
 * photo" until there is a photo — the client asked for the orange button to
 * live in the same place on every screen, and on this one the way forward is
 * the camera. The upload starts the moment a photo is chosen, so by the time
 * she has given it a few words it is usually already saved.
 */
export function usePracticePhoto(draft: PhotoDraft, onChange: (next: PhotoDraft) => void) {
  const [status, setStatus] = useState<PhotoStatus>("idle");
  const latest = useRef(draft);
  // Read by the upload's continuation, which lands after she may have typed.
  useEffect(() => {
    latest.current = draft;
  });
  const lastSource = useRef<"camera" | "library">("camera");
  // The picture she chose, kept until it lands — so "Try again" re-sends the
  // same photo instead of sending her back to the camera.
  const chosen = useRef<Extract<Awaited<ReturnType<typeof pickPracticePhoto>>, { status: "picked" }> | null>(null);

  const upload = useCallback(async () => {
    const result = chosen.current;
    if (!result) return;
    Keyboard.dismiss();
    setStatus("uploading");
    try {
      const { id } = await api.uploadPhoto(result.image.base64, result.image.mimeType);
      onChange({ ...latest.current, photo: { id, w: result.w, h: result.h }, uri: result.uri, describe: false });
      chosen.current = null;
      setStatus("idle");
    } catch {
      setStatus("failed");
    }
  }, [onChange]);

  const pick = useCallback(
    async (source: "camera" | "library") => {
      lastSource.current = source;
      setStatus("preparing");
      const result = await pickPracticePhoto(source).catch(() => ({ status: "cancelled" as const }));
      if (result.status === "denied") {
        setStatus("denied");
        return;
      }
      if (result.status !== "picked") { setStatus(chosen.current ? "preview" : "idle"); return; }
      haptics.select();
      chosen.current = result;
      onChange({ ...latest.current, photo: null, uri: result.uri, describe: false });
      // Previewed first: "Use photo" uploads it, "Retake" goes back.
      setStatus("preview");
    },
    [onChange],
  );

  return { status, pick, use: upload, retry: upload, retake: () => pick(lastSource.current) };
}

export function PhotoInput({
  draft,
  onChange,
  status,
  onPick,
  onRetake,
  onRetry,
  captionPlaceholder,
}: {
  draft: PhotoDraft;
  onChange: (next: PhotoDraft) => void;
  status: PhotoStatus;
  onPick: (source: "camera" | "library") => void;
  onRetake: () => void;
  /** Re-send the photo she already chose. */
  onRetry: () => void;
  captionPlaceholder?: string;
}) {
  const t = useT();
  const theme = usePracticeTheme();
  const has = !!(draft.uri || draft.photo);
  const set = (patch: Partial<PhotoDraft>) => onChange({ ...draft, ...patch });

  if (draft.describe) {
    return (
      <FadeIn style={styles.stack}>
        <AppText variant="label" color={theme.accent}>
          {t.practice.photo.describeLabel}
        </AppText>
        <TextInput
          value={draft.caption}
          onChangeText={(caption) => set({ caption })}
          placeholder={t.practice.photo.describePlaceholder}
          placeholderTextColor={withAlpha(theme.muted, 0.6)}
          multiline
          maxLength={400}
          autoFocus={!draft.caption}
          style={[styles.describe, { color: theme.ink, borderColor: theme.cardBorder, backgroundColor: theme.card }]}
          accessibilityLabel={t.practice.photo.describeLabel}
        />
        <Link label={t.practice.photo.addInstead} onPress={() => set({ describe: false })} />
      </FadeIn>
    );
  }

  if (status === "preparing") {
    return <View style={[styles.empty, { minHeight: 180 }]} accessibilityLiveRegion="polite"><ActivityIndicator color={theme.accent} /><AppText variant="body" color={theme.ink}>{t.ux.preparingPhoto}</AppText></View>;
  }
  if (!has) {
    return (
      <View style={[styles.empty, { borderColor: withAlpha(theme.accent, 0.35), backgroundColor: withAlpha(theme.card, 0.5) }]}>
        <View style={[styles.cameraDisc, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Icon name="solar:camera-linear" size={28} color={theme.accent} />
        </View>
        <View style={styles.emptyText}>
          <AppText variant="control" color={theme.ink} center>
            {t.practice.photo.add}
          </AppText>
          <AppText variant="caption" color={theme.muted} center>
            {t.practice.photo.hint}
          </AppText>
        </View>
        <PressableScale
          size="pill"
          onPress={() => onPick("library")}
          containerStyle={styles.libraryWrap}
          style={[styles.library, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}
          accessibilityRole="button"
          accessibilityLabel={t.practice.photo.library}
        >
          <Icon name="solar:gallery-wide-linear" size={18} color={theme.accent} />
          <AppText variant="control" color={theme.ink}>
            {t.practice.photo.library}
          </AppText>
        </PressableScale>
        <Link label={t.practice.photo.describe} onPress={() => set({ describe: true })} />
        {status === "denied" ? (
          <View style={styles.denied}>
            <AppText variant="caption" color={theme.muted} center>
              {t.practice.photo.denied}
            </AppText>
            <Link label={t.practice.photo.openSettings} onPress={() => Linking.openSettings()} />
          </View>
        ) : null}
      </View>
    );
  }

  const source = draft.uri ? { uri: draft.uri } : draft.photo ? photoSource(draft.photo.id) : null;
  const captionMissing = !draft.caption.trim();
  // The photo and the words it needs sit together: a compact thumbnail with
  // Retake / Library beside it, and the required caption straight under them,
  // so the caption is never pushed below the fold and the disabled Next always
  // has its reason on screen.
  return (
    <FadeIn style={styles.stack}>
      <View style={styles.photoRow}>
        <View style={[styles.preview, { backgroundColor: theme.card }]}>
          {source ? (
            <Image
              source={source}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              accessibilityLabel={draft.caption || t.practice.photo.yourPhoto}
            />
          ) : null}
          {status === "uploading" ? (
            <View style={styles.overlay}>
              <ActivityIndicator color={theme.ctaInk} />
            </View>
          ) : null}
        </View>
        <View style={styles.photoSide}>
          {status === "uploading" ? (
            <AppText variant="caption" color={theme.muted} accessibilityLiveRegion="polite">
              {t.practice.photo.uploading}
            </AppText>
          ) : null}
          {status === "failed" ? (
            <>
              <AppText variant="caption" color={theme.accent}>
                {t.practice.photo.failed}
              </AppText>
              <Link label={t.practice.photo.retry} onPress={onRetry} start />
            </>
          ) : null}
          {/* "Photo saved. Tap Next" only once Next can actually be tapped. */}
          {draft.photo && status === "idle" && !captionMissing ? (
            <AppText variant="caption" color={theme.muted} accessibilityLiveRegion="polite">
              {t.ux.photoSaved}
            </AppText>
          ) : null}
          <Link label={t.practice.photo.retake} onPress={onRetake} start />
          <Link label={t.practice.photo.library} onPress={() => onPick("library")} start />
        </View>
      </View>
      <View style={styles.captionBlock}>
        <AppText variant="label" color={theme.accent}>
          {t.practice.photo.captionLabel}
        </AppText>
        <TextInput
          value={draft.caption}
          onChangeText={(caption) => set({ caption })}
          placeholder={captionPlaceholder ?? t.practice.photo.captionPlaceholder}
          placeholderTextColor={withAlpha(theme.muted, 0.6)}
          maxLength={120}
          style={[styles.caption, { color: theme.ink, borderColor: theme.cardBorder, backgroundColor: theme.card }]}
          accessibilityLabel={t.practice.photo.captionLabel}
        />
      </View>
    </FadeIn>
  );
}

function Link({ label, onPress, start }: { label: string; onPress: () => void; start?: boolean }) {
  const theme = usePracticeTheme();
  return (
    <PressableScale
      size="chip"
      dim={0.6}
      onPress={onPress}
      style={[styles.link, start && styles.linkStart]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppText variant="control" color={theme.accent} style={styles.underline}>
        {label}
      </AppText>
    </PressableScale>
  );
}

/** The chosen photo's thumbnail (spacing[24] + spacing[4]). */
const PREVIEW = spacing[24] + spacing[4];

const styles = StyleSheet.create({
  stack: { gap: spacing[3], width: "100%" },
  empty: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: radius.feature,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[6],
    alignItems: "center",
    gap: spacing[4],
  },
  cameraDisc: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { gap: spacing[1], alignItems: "center" },
  library: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    borderWidth: 1,
    borderRadius: radius.pill,
    minHeight: 52,
    alignSelf: "stretch",
    paddingHorizontal: spacing[5],
  },
  libraryWrap: { width: "100%", maxWidth: 320, alignSelf: "center" },
  denied: { gap: spacing[1], alignItems: "center" },
  photoRow: { flexDirection: "row", alignItems: "center", gap: spacing[4] },
  /** A thumbnail, not a hero: the caption it needs stays in the first screen. */
  preview: {
    width: PREVIEW,
    height: PREVIEW,
    borderRadius: radius.content,
    overflow: "hidden",
  },
  photoSide: { flex: 1, minWidth: 0, gap: spacing[1] },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  captionBlock: { gap: spacing[2] },
  caption: {
    ...type.body,
    borderWidth: 1,
    borderRadius: radius.content,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3.5],
    minHeight: 52,
  },
  describe: {
    ...type.body,
    color: colors.textBody,
    borderWidth: 1,
    borderRadius: radius.content,
    padding: spacing[4],
    minHeight: 120,
    textAlignVertical: "top",
  },
  link: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing[2], alignSelf: "center" },
  linkStart: { alignSelf: "flex-start", paddingHorizontal: 0 },
  underline: { textDecorationLine: "underline" },
});
