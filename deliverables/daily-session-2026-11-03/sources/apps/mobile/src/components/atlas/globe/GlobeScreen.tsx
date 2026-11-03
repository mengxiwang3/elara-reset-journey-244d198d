import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AREA_KEYS, dayPosition, type AreaKey, type AtlasDTO } from "@elara/shared";
import { CONTINENTS, GLOBE_AREAS, placeById, WEEKS_PER_AREA, type PlaceId } from "@/content/places";
import { PLACE_THUMB } from "@/content/placeImages";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { useTodayEntry } from "@/hooks/useTodayEntry";
import { trackAtlas, trackContinueFromAtlas } from "@/hooks/useAtlas";
import { useT } from "@/i18n";
import { TornEdge } from "@/components/explore/Catalogue";
import { useReducedMotion } from "@/motion";
import { continueTarget } from "../continueTarget";
import { canRedoWeek, redoTarget, redoWeekDays } from "../redo";
import { placeFor } from "@/store/dayPlace";
import { useAppStore, useAreaAvailability, useIsPremium } from "@/store/useAppStore";
import { useDayPlace } from "@/store/useDayPlace";
import { nextRedoDay } from "@/store/redoWeek";
import { claimRedoWeek, useMyRedoWeek, useRedoWeek } from "@/store/useRedoWeek";
import { fontFamily } from "@/theme";
import { AtlasGlobe, GLOBE_START, type GlobeHandle } from "./AtlasGlobe";
import { placeCopy } from "./copy";
import { setGlobeLabels, setGlobePlaceNames } from "./paintGlobe";
import { buildGlobe, currentPlace, pathFor, totals, traySlots, type GlobeArea, type GlobePlace } from "./model";
import { Postcard, SoonCard, CARD_W } from "./Postcard";
import { Arrival, arrivalDay, PlaceList, PlaceSheet } from "./Sheets";

/**
 * Your Atlas, Level 1: the paper globe ("Atlas Sorpresa final", Oct 2026).
 * Turn it, tap a place (or an area below) and its zone tray rises with that
 * area's weekly places as postcards; tap one and its sheet opens; the place in
 * progress is one tap away at the bottom. A place still to come is a surprise:
 * only the next one or two show, blurred, with a "?".
 */

const FOREST = "#1F3A2E";
/** The header band (Elara A): forest sheet under the status bar, then the torn edge. */
const BAND_H = 64;
const TEAR_H = 24;
const BAND_PAPER = require("../../../../assets/images/explore-band-paper-v3.webp");
const TERRA = "#A13A12";
const INK = "#26231d";
const MUTED = "#5e5650";
const TRAY_H = 278;
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

export function GlobeScreen({ atlas, prompt }: { atlas: AtlasDTO; /** The kept-words offer (return prompt): it takes the hint's line while it is there. */ prompt?: ReactNode }) {
  const t = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const motion = !useReducedMotion();
  const clearance = useTabBarClearance(0);
  const areas = useMemo(() => buildGlobe(atlas), [atlas]);
  const { done, total } = totals(areas);
  const walking = atlas.path?.area ?? null;
  const current = currentPlace(areas, walking);
  // The same rule Hoy and the Pregunta tab use: today's practice at the saved step, the review, or the week.
  const entry = useTodayEntry({ source: "atlas", area: walking ?? undefined });

  const [zone, setZone] = useState<AreaKey | null>(null);
  const [sel, setSel] = useState<PlaceId | null>(null);
  const [sheet, setSheet] = useState<PlaceId | null>(null);
  const [arrival, setArrival] = useState<PlaceId | null>(null);
  const [list, setList] = useState(false);
  const [failed, setFailed] = useState(false);
  const globe = useRef<GlobeHandle>(null);
  const tray = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setGlobePlaceNames(
      Object.fromEntries(
        Object.entries(t.globe.places as Record<string, { name: string } | undefined>).map(([id, p]) => [id, p?.name ?? ""]),
      ) as Partial<Record<PlaceId, string>>,
    );
    setGlobeLabels(
      Object.fromEntries(GLOBE_AREAS.map((a) => [a, { theme: t.globe.areas[a].theme, name: t.globe.areas[a].continent }])) as Record<AreaKey, { theme: string; name: string }>,
    );
  }, [t]);

  useEffect(() => {
    Animated.timing(tray, { toValue: zone ? 1 : 0, duration: motion ? 380 : 0, easing: EASE, useNativeDriver: true }).start();
  }, [zone, motion, tray]);

  const byId = useCallback(
    (id: PlaceId | null): GlobePlace | null => {
      if (!id) return null;
      for (const a of areas) for (const p of a.places) if (p.def.id === id) return p;
      return null;
    },
    [areas],
  );

  const enter = useCallback(
    (area: AreaKey, id?: PlaceId) => {
      setZone(area);
      setSel(id ?? null);
      const p = id ? placeById(id) : null;
      const c = CONTINENTS[area];
      globe.current?.turnTo(p ? p.lon : c.lon, p ? p.lat : c.lat, 900);
      trackAtlas("atlas_open", { entry: "globe_zone" });
    },
    [],
  );
  const exit = useCallback(() => {
    setZone(null);
    setSel(null);
  }, []);

  const pick = useCallback(
    (id: PlaceId) => {
      const p = placeById(id);
      if (!p) return;
      if (!zone) enter(p.area, id);
      else {
        setSel(id);
        setSheet(id);
      }
    },
    [zone, enter],
  );

  const openPlace = useCallback((p: GlobePlace) => {
    setSel(p.def.id);
    setList(false);
    setSheet(p.def.id);
  }, []);

  // Where the primary button goes: the place in progress continues today's step; a walked place opens its record.
  const goContinue = useCallback(
    (p: GlobePlace) => {
      // The shared entry rule is for the path she is walking; a place in another path continues that path.
      if (entry && p.def.area === walking) {
        trackContinueFromAtlas("atlas_globe");
        entry.go();
        return;
      }
      const path = pathFor(atlas, p.def.area);
      const cur = path?.current;
      const place = useDayPlace.getState();
      const mine = place.owner != null && place.owner === (useAppStore.getState().user?.id ?? null);
      const remembered = path && cur && mine ? placeFor(place.places, path.area, cur.day) : null;
      const target = continueTarget(path, remembered);
      if (!target) return;
      trackContinueFromAtlas("atlas_globe");
      router.push(target);
    },
    [atlas, router, entry, walking],
  );
  const worldOf = useCallback(
    (p: GlobePlace | null) => (p ? (pathFor(atlas, p.def.area)?.worlds.find((w) => w.week === p.def.week) ?? null) : null),
    [atlas],
  );
  const openRecord = useCallback(
    (p: GlobePlace) => {
      const world = worldOf(p)?.id;
      setSheet(null);
      if (world) router.push({ pathname: "/(tabs)/atlas/world/[worldId]", params: { worldId: world, entry: "globe" } });
    },
    [router, worldOf],
  );
  // A walked place redoes its week (Day 1 to 7, in order; a redo under way
  // picks up where she left it). The record stays one tap away beside it.
  const availability = useAreaAvailability();
  const premiumNow = useIsPremium();
  const entitlementKnown = useAppStore((s) => s.subscription !== null);
  const sheetWorld = worldOf(byId(sheet));
  const sheetRedo = useMyRedoWeek(sheetWorld ? byId(sheet)?.def.area : null, sheetWorld?.id);
  const sheetRedoNext = nextRedoDay(sheetRedo);
  const onPrimary = useCallback(
    (p: GlobePlace) => {
      if (p.state === "lock") {
        // The first place of an Area that is open: begin its path, as the Area screen does.
        const state = availability(p.def.area);
        setSheet(null);
        if (state === "membership") {
          router.push({ pathname: "/paywall", params: { returnTo: `/path/${p.def.area}` } });
        } else if (state === "open") {
          useAppStore.getState().startPath(p.def.area);
          router.push({ pathname: "/path/day", params: { area: p.def.area, day: "1", from: "paths" } });
        }
        return;
      }
      if (p.state === "cur") {
        setSheet(null);
        setArrival(p.def.id);
      } else if (p.state === "done") {
        const world = worldOf(p);
        if (!world || !canRedoWeek(world)) {
          openRecord(p);
          return;
        }
        const days = redoWeekDays(world);
        claimRedoWeek();
        const resume = sheetWorld?.id === world.id ? sheetRedoNext : null;
        if (resume == null) useRedoWeek.getState().start(p.def.area, world.id, days);
        const day = resume ?? days[0];
        setSheet(null);
        if (day == null) return;
        router.push(redoTarget({ area: p.def.area, day, premium: entitlementKnown ? premiumNow : null, redoWeek: world.id }));
      }
    },
    [availability, entitlementKnown, openRecord, premiumNow, router, sheetRedoNext, sheetWorld, worldOf],
  );

  const headH = BAND_H + TEAR_H;
  const top = insets.top;
  const bottom = clearance;
  // The prototype's canvas: 44 below the header and about 500 tall on a 780 screen.
  const canvasTop = top + 44;
  const canvasH = Math.round(Math.max(360, Math.min(560, height - canvasTop - bottom - 236)));
  const slide = tray.interpolate({ inputRange: [0, 1], outputRange: [0, 160] });
  const fade = tray.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const zoneArea = zone ? areas.find((a) => a.area === zone) ?? null : null;
  const selPlace = byId(sel);
  const sheetPlace = byId(sheet);

  // A place she has not reached: she can begin its Area (its first place, when the Area is open to her),
  // or the closed beta says plainly that it is not open yet. Never a dead "surprise" button.
  const sheetAccess = (() => {
    if (!sheetPlace || sheetPlace.state !== "lock") return null;
    const state = availability(sheetPlace.def.area);
    const areaStarted = areas.find((a) => a.area === sheetPlace.def.area)?.started ?? false;
    if (state === "beta") {
      const open = AREA_KEYS.find((a) => availability(a) === "open");
      return {
        mode: "beta" as const,
        label: t.globe.sheet.cta.beta,
        note: t.globe.sheet.betaNote(open ? t.globe.areas[open].theme : t.globe.areas.money.theme),
      };
    }
    if (!areaStarted && sheetPlace.def.week === 1) {
      return { mode: "start" as const, label: t.globe.sheet.cta.start(t.globe.areas[sheetPlace.def.area].theme), note: t.globe.sheet.startNote };
    }
    return null;
  })();

  const arrivalPlace = byId(arrival);

  // The sheet and arrival are drawn over the screen's whole content area (above the tab bar).
  const [box, setBox] = useState({ w: width, h: height - bottom });

  return (
    <View style={styles.root} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <LinearGradient colors={["#F9F5EF", "#F4ECDF", "#EFE6D6"]} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />

      {/* The globe. */}
      <View style={{ position: "absolute", left: 0, top: canvasTop, width, height: canvasH }} accessibilityLabel={t.globe.globeA11y}>
        {failed ? null : (
          <AtlasGlobe
            ref={globe}
            width={width}
            height={canvasH}
            areas={areas}
            sel={sel}
            zone={zone}
            motion={motion}
            onPickPlace={pick}
            onFail={() => setFailed(true)}
          />
        )}
      </View>

      {/* The header: the forest band, its paper corner and the torn edge. */}
      <View style={[styles.band, { height: top + BAND_H }]} pointerEvents="none">
        <View style={styles.corner} accessible={false} importantForAccessibility="no-hide-descendants">
          <Image source={BAND_PAPER} style={styles.cornerImg} resizeMode="cover" />
        </View>
        <View style={[styles.head, { paddingTop: top + 12 }]}>
          <Text accessibilityRole="header" style={styles.title}>
            {t.atlas.masthead.title}
          </Text>
          <Text style={styles.progress}>{t.globe.header.progress(done, total)}</Text>
        </View>
      </View>
      <View style={[styles.tear, { top: top + BAND_H }]} pointerEvents="none">
        <TornEdge />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setList((v) => !v);
          setSheet(null);
        }}
        style={[styles.listBtn, { top: top + 10 }]}
      >
        <Text style={styles.listBtnText}>{list ? t.globe.header.viewMap : t.globe.header.viewList}</Text>
      </Pressable>

      {/* The hint, the place in progress and the areas: they slide away while a tray is up. */}
      <Animated.View
        pointerEvents={zone ? "none" : "box-none"}
        style={[styles.bottom, { bottom, transform: [{ translateY: slide }], opacity: fade }]}
      >
        {prompt ? <View style={styles.prompt}>{prompt}</View> : <Text style={styles.hint}>{t.globe.hint}</Text>}
        {current ? <Resume p={current} areas={areas} onPress={() => openPlace(current)} /> : null}
        <Chips areas={areas} onPick={(a) => enter(a)} />
      </Animated.View>

      {/* The zone tray. */}
      <Animated.View
        pointerEvents={zone ? "auto" : "none"}
        style={[
          styles.tray,
          { bottom: 0, height: TRAY_H + bottom, paddingBottom: bottom, transform: [{ translateY: tray.interpolate({ inputRange: [0, 1], outputRange: [TRAY_H + bottom + 20, 0] }) }] },
        ]}
      >
        {zoneArea ? <Tray area={zoneArea} sel={selPlace} onBack={exit} onPick={openPlace} /> : null}
      </Animated.View>

      {/* The list view covers the globe and the bottom. */}
      <PlaceList areas={areas} open={list} top={top + headH} onOpen={openPlace} />

      {/* Sheet and arrival over everything, down to the tab bar. */}
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 20, elevation: 20 }]}>
        <PlaceSheet
          place={sheetPlace}
          areas={areas}
          open={!!sheetPlace}
          motion={motion}
          containerH={box.h}
          bottomInset={bottom}
          onClose={() => setSheet(null)}
          onPrimary={onPrimary}
          access={sheetAccess}
          redo={
            sheetPlace?.state === "done" && canRedoWeek(sheetWorld)
              ? {
                  label: sheetRedoNext != null ? t.atlas.redo.continueWeek : t.atlas.redo.week,
                  hint:
                    sheetRedoNext != null
                      ? t.atlas.redo.continueWeekA11y(dayPosition(sheetRedoNext).dayInWeek)
                      : t.atlas.redo.weekNote,
                  note: t.atlas.revisitNote,
                  recordLabel: t.atlas.redo.seeRecord,
                  onRecord: openRecord,
                }
              : null
          }
        />
        <Arrival
          place={arrivalPlace}
          open={!!arrivalPlace}
          motion={motion}
          day={arrivalPlace ? arrivalDay(atlas, arrivalPlace) : 1}
          bottomInset={bottom}
          onBack={() => setArrival(null)}
          onGo={(p) => {
            setArrival(null);
            goContinue(p);
          }}
        />
      </View>
    </View>
  );
}

function Resume({ p, areas, onPress }: { p: GlobePlace; areas: readonly GlobeArea[]; onPress: () => void }) {
  const t = useT();
  const c = placeCopy(t, p.def);
  const col = CONTINENTS[p.def.area].col;
  const src = PLACE_THUMB[p.def.id];
  void areas;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t.globe.resume.eyebrow}. ${c.name}`}
      style={[styles.resume, { borderBottomColor: col }]}
    >
      {src ? (
        <Image source={src} style={[styles.resumeImg, { borderColor: col }]} />
      ) : (
        <View style={[styles.resumeImg, { borderColor: col, backgroundColor: CONTINENTS[p.def.area].tint, alignItems: "center", justifyContent: "center" }]}>
          <Text style={{ fontFamily: fontFamily.editorial, fontSize: 22, color: col }}>{p.def.week}</Text>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.resumeSmall}>{t.globe.resume.eyebrow}</Text>
        <Text numberOfLines={1} style={styles.resumeName}>
          {c.name}
        </Text>
        <Text numberOfLines={1} style={[styles.resumeSmall, { color: MUTED }]}>
          {`${t.globe.areas[p.def.area].continent} · ${t.globe.week(p.def.week, WEEKS_PER_AREA)}`}
        </Text>
      </View>
      <View style={styles.resumeGo}>
        <Text style={styles.resumeGoText}>{t.globe.resume.go}</Text>
      </View>
    </Pressable>
  );
}

function Chips({ areas, onPick }: { areas: readonly GlobeArea[]; onPick: (a: AreaKey) => void }) {
  const t = useT();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="toolbar"
      contentContainerStyle={styles.chips}
      style={{ flexGrow: 0 }}
    >
      {areas.map((a) => {
        const def = CONTINENTS[a.area];
        const col = a.started ? def.col : "#8d8576";
        const tint = a.started ? def.tint : "#e4ded0";
        const cont = t.globe.areas[a.area];
        return (
          <Pressable
            key={a.area}
            onPress={() => onPick(a.area)}
            accessibilityRole="button"
            accessibilityLabel={`${cont.theme}, ${cont.continent}`}
            style={[styles.area, { borderColor: col, backgroundColor: a.started ? tint : "#ece7dc" }, !a.started && { borderStyle: "dashed" }]}
          >
            <Text numberOfLines={1} style={[styles.areaTitle, !a.started && { color: "#6f685a" }]}>
              {cont.theme}
            </Text>
            <Text numberOfLines={1} style={styles.areaSub}>
              {`${cont.continent} · ${t.globe.chip.count(a.done, WEEKS_PER_AREA)}${a.started ? "" : ` · ${t.globe.chip.notStarted}`}`}
            </Text>
            <Segments area={a} col={col} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Segments({ area, col }: { area: GlobeArea; col: string }) {
  return (
    <View style={styles.seg}>
      {traySlots(area)
        .slice(0, WEEKS_PER_AREA)
        .map((s, i) => {
          const st = s.kind === "place" ? s.place.state : "e";
          return (
            <View
              key={i}
              style={[styles.segI, st === "done" ? { backgroundColor: col } : st === "cur" ? { backgroundColor: col, opacity: 0.55 } : null]}
            />
          );
        })}
    </View>
  );
}

function Tray({ area, sel, onBack, onPick }: { area: GlobeArea; sel: GlobePlace | null; onBack: () => void; onPick: (p: GlobePlace) => void }) {
  const t = useT();
  const def = CONTINENTS[area.area];
  const col = area.started ? def.col : "#8d8576";
  const tint = area.started ? def.tint : "#e4ded0";
  const cont = t.globe.areas[area.area];
  const slots = traySlots(area);
  const scroller = useRef<ScrollView>(null);
  const w = useWindowDimensions().width;
  // Bring the chosen card to the middle.
  useEffect(() => {
    if (!sel) return;
    let x = 16;
    for (const s of slots) {
      const cw = s.kind === "place" ? CARD_W : 104;
      if (s.kind === "place" && s.place.def.id === sel.def.id) {
        scroller.current?.scrollTo({ x: Math.max(0, x - (w - cw) / 2), animated: true });
        return;
      }
      x += cw + 11;
    }
  }, [sel?.def.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <View style={styles.zh}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t.globe.zone.back} style={[styles.zback, { backgroundColor: tint }]}>
          <Text style={[styles.zbackText, { color: col }]}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} accessibilityRole="header" style={styles.zTitle}>
            {cont.theme}
          </Text>
          <Text style={[styles.zt, { color: col }]}>{`${cont.continent}${area.started ? "" : ` · ${t.globe.zone.notStarted}`}`}</Text>
        </View>
        <View style={styles.zp}>
          <Text style={styles.zpB}>{t.globe.chip.count(area.done, WEEKS_PER_AREA)}</Text>
          <Text style={styles.zpS}>{t.globe.zone.weeksWalked}</Text>
        </View>
      </View>
      <View style={styles.zdots}>
        {slots.slice(0, WEEKS_PER_AREA).map((s, i) => {
          const st = s.kind === "place" ? s.place.state : "e";
          return <View key={i} style={[styles.zdot, st === "done" ? { backgroundColor: col } : st === "cur" ? { backgroundColor: col, opacity: 0.6 } : null]} />;
        })}
      </View>
      <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zcar}>
        {slots.map((s, i) => {
          if (s.kind === "soon") return <SoonCard key={`soon-${s.week}`} week={s.week} col={col} tint={tint} label={t.globe.weekShort(s.week)} soon={t.globe.zone.soon} />;
          const p = s.place;
          const c = placeCopy(t, p.def);
          const pc = { col: area.started || p.tease ? def.col : "#9a9182", tint: area.started || p.tease ? def.tint : "#ece6d8" };
          const label = t.globe.state;
          const card =
            p.state === "lock"
              ? p.tease
                ? ({ kind: "tease", title: t.globe.card.toDiscover, sub: `${p.rank === 0 ? t.globe.card.next : t.globe.card.later} · ${c.country}` } as const)
                : ({ kind: "surprise", title: t.globe.weekShort(p.def.week), sub: t.globe.card.surprise } as const)
              : ({ kind: "photo", locked: false, title: c.name, sub: `${c.country} · ${p.state === "done" ? label.done : label.cur}` } as const);
          return (
            <Pressable
              key={p.def.id}
              onPress={() => onPick(p)}
              accessibilityRole="button"
              accessibilityLabel={card.kind === "photo" ? `${c.name}, ${t.globe.week(p.def.week, WEEKS_PER_AREA)}` : `${card.title}, ${card.sub}`}
            >
              <Postcard place={p.def} index={i} card={card} col={pc.col} tint={pc.tint} selected={sel?.def.id === p.def.id} />
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  band: { position: "absolute", left: 0, right: 0, top: 0, backgroundColor: FOREST, overflow: "hidden", zIndex: 14 },
  corner: { position: "absolute", top: 0, right: 0, width: 124, height: 56, overflow: "hidden" },
  cornerImg: { position: "absolute", top: 0, right: 0, width: 124, height: 124 },
  tear: { position: "absolute", left: 0, right: 0, zIndex: 14 },
  head: { paddingHorizontal: 18, paddingRight: 130 },
  title: { fontFamily: fontFamily.editorial, fontSize: 26, lineHeight: 29, color: "#F7F1E8" },
  progress: { fontFamily: fontFamily.sans, fontSize: 13, color: "#C9D4CD", marginTop: 2 },
  listBtn: { position: "absolute", right: 12, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: "#9FB3A8", backgroundColor: FOREST, alignItems: "center", justifyContent: "center", zIndex: 16 },
  listBtnText: { fontFamily: fontFamily.sansSemibold, fontSize: 13, color: "#F7F1E8" },
  bottom: { position: "absolute", left: 0, right: 0, zIndex: 3 },
  prompt: { marginHorizontal: 18, marginBottom: 8 },
  hint: { textAlign: "center", fontFamily: fontFamily.sans, fontSize: 12.5, color: MUTED, marginBottom: 8 },
  resume: { marginHorizontal: 14, marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingLeft: 8, paddingRight: 12, backgroundColor: "#fff", borderRadius: 18, borderBottomWidth: 5, shadowColor: "rgb(60,40,20)", shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 5 } },
  resumeImg: { width: 56, height: 56, borderRadius: 28, borderWidth: 3 },
  resumeSmall: { fontFamily: fontFamily.sans, fontSize: 11.5, color: TERRA },
  resumeName: { fontFamily: fontFamily.editorial, fontSize: 16, lineHeight: 20, color: INK },
  resumeGo: { backgroundColor: FOREST, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  resumeGoText: { fontFamily: fontFamily.sansSemibold, fontSize: 13.5, color: "#F7F1E8" },
  chips: { gap: 9, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 14 },
  area: { minHeight: 60, minWidth: 138, paddingVertical: 7, paddingHorizontal: 13, borderWidth: 2, borderRadius: 16, gap: 1 },
  areaTitle: { fontFamily: fontFamily.editorial, fontSize: 13.5, lineHeight: 16, color: INK },
  areaSub: { fontFamily: fontFamily.sans, fontSize: 11, color: MUTED },
  seg: { flexDirection: "row", gap: 2, marginTop: 3 },
  segI: { flex: 1, height: 5, borderRadius: 2, backgroundColor: "rgba(255,255,255,.75)" },
  tray: { position: "absolute", left: 0, right: 0, backgroundColor: "#fffaf0", borderTopLeftRadius: 22, borderTopRightRadius: 22, zIndex: 8, shadowColor: "rgb(60,40,20)", shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: -8 } },
  zh: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingTop: 10 },
  zback: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  zbackText: { fontSize: 28, lineHeight: 30, marginTop: -2 },
  zTitle: { fontFamily: fontFamily.editorial, fontSize: 17, color: INK },
  zt: { fontFamily: fontFamily.sansSemibold, fontSize: 13 },
  zp: { maxWidth: 66, alignItems: "flex-end" },
  zpB: { fontFamily: fontFamily.sansSemibold, fontSize: 11.5, color: MUTED, textAlign: "right" },
  zpS: { fontFamily: fontFamily.sans, fontSize: 11.5, lineHeight: 14, color: MUTED, textAlign: "right" },
  zdots: { flexDirection: "row", gap: 5, marginHorizontal: 16, marginTop: 4, marginBottom: 6 },
  zdot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#eadfca" },
  zcar: { gap: 11, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, alignItems: "flex-start" },
});
