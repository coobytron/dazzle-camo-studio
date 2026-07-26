# Dazzle Camo Studio

A historically grounded WebGL design instrument for creating, studying, mapping, and publishing First World War–inspired dazzle camouflage.

[Open the GitHub Pages build](https://coobytron.github.io/dazzle-camo-studio/) · [Open the current studio](https://dazzle-camo-studio.coobytron.chatgpt.site)

## What it does

Dazzle Camo Studio treats camouflage as a vessel-specific design system rather than a repeating “zebra” texture. One deterministic pattern document drives the flat artwork, the mapped 3D vessel, the learning tools, and the poster output. Port and starboard remain independent.

The experience is organized into four connected rooms:

- **Studio** — linked 2D composition and 3D evaluation.
- **Poster Press** — borderless typographic artifacts, raw pattern fields, generated ship silhouettes, and mesh-wrapped graphics.
- **Archive Room** — searchable source records with provenance and rights notes.
- **Field Notes** — interactive explanations of the visual-deception logic behind dazzle.

Historical reconstruction, historically informed generation, and contemporary art are labeled separately. Dazzle was intended to confuse estimates of course, range, speed, bow, stern, and silhouette—not to make a ship invisible.

## Highlights

- Nine deterministic procedural pattern grammars
- Independent port and starboard generation
- 2D Compose, Split, and 3D Preview workspaces
- Four generated vessel classes
- Bundled Giulio Cesare, Alien Stinger, Battleship Beta, and self-portrait GLB studies
- Local GLB import with automatic axis detection
- UV-independent, surface-normal-aware port/starboard/deck mapping
- Generated poster vessels with 20 hulls, 10 gun configurations, 13 mast rigs, and 20 optional fittings
- Masked ship, raw field, and rotatable mesh-wrap poster treatments
- Editable poster typography, formats, palettes, custom font loading, and PNG export
- Silhouette-distance-field pattern spill
- Archive-informed palettes, references, and confidence framing
- Halftone, gradient, noise, sea, periscope, and value-check treatments
- PNG, SVG, 3D still, and JSON recipe exports
- Responsive touch interface with a 2D fallback when WebGL is unavailable

## Bundled 3D studies

The Studio viewport and Poster Press UV Mesh Studio include five ready-to-use surfaces:

- **Generated hull** — the procedural period-vessel study with a live Dazzle field.
- **Giulio Cesare** — the supplied fast-dreadnought GLB, normalized and remapped with a side-aware planar/normal projection.
- **Alien Stinger** — the supplied experimental battleship GLB. Missing and fragmented source UVs are bypassed by a coherent longitudinal/vertical surface projection.
- **Battleship Beta** — the supplied high-detail battleship GLB, rebuilt as a lightweight Dazzle surface with a side-aware planar/normal projection.
- **Self portrait** — the supplied textured GLB. Its embedded albedo, metal/roughness, and normal maps are preserved in the 3D viewport, with an optional live Dazzle surface. Poster Press exposes the same geometry as a rotatable UV mesh.

The separately supplied portrait albedo and metal/roughness images are already embedded byte-for-byte in the self-portrait GLB, so the app uses the embedded maps rather than shipping duplicate copies.

## Run locally

Requirements:

- Node.js 22.13 or newer
- npm

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

For the static GitHub Pages build:

```bash
npm run build:pages
```

## Tech

- React 19
- TypeScript
- Three.js / WebGL
- Canvas 2D
- Vinext + Vite
- Cloudflare-compatible server output

## Project structure

```text
app/
  page.tsx                Core generator, renderer, controls, and exports
  dazzle-expansion.tsx    Poster Press, Archive Room, Field Notes, and GLB tools
  globals.css             Interface and responsive styling
  layout.tsx              App metadata and document shell
public/
  models/                 Bundled GLB model studies
tests/           Rendered-output checks
```

The researched product and historical specification lives in [`DAZZLE_CAMO_STUDIO.md`](./DAZZLE_CAMO_STUDIO.md).

## Historical framing

The generator focuses on the visual logic associated with 1917–1918 dazzle practice: large silhouette-breaking masses, forceful directional cues, disrupted waterlines and upperworks, strong tonal separation, and different treatments for each side of a vessel. Contemporary print effects remain explicitly separated from the archive-informed system.

## Author

Created by [Colson Knight](https://github.com/coobytron).
