# Mist Meadow layers for the homepage

The chapter under the hero uses the app's own Mist Meadow world, drawn by the
app's engine (`apps/mobile/src/components/world/engine/meadow.ts` in
github.com/vasantakmr/Elara). Current layers: `upstream/main @ 5032e03`.

To regenerate after the app's meadow changes:

1. Pull the engine (pure TS, no React Native in the paint path):
   `meadow.ts paint.ts composites.ts layers.ts` into `scripts/meadow/engine/`, and
   `types.ts` into `scripts/meadow/` with its `@elara/shared` import replaced by
   `type WorldId = string;` (type-only).
2. `node_modules/.bin/esbuild scripts/meadow/export.ts --bundle --platform=node --format=esm --outfile=/tmp/export.mjs && node /tmp/export.mjs <outdir>`
3. Rasterise each `<band>.svg` at 1120x1344 on a transparent background
   (`shoot.sh <file.html> <out.png> 1120 1344 transparent`), crop to alpha,
   save WebP into `src/assets/meadow/`, and update the boxes in
   `src/components/landing/meadowLayout.ts`.
4. Check fidelity: recomposite at the engine's Day 1 values and diff against
   `meadowFrameSvg` (last run: 0.07% of pixels off by more than 8/255).
