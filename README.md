# Dazzle Camo Studio

An interactive WebGL design instrument for building dazzle camouflage systems inspired by First World War ship painting.

[Open the live studio](https://dazzle-camo-studio.coobytron.chatgpt.site)

## What it does

Dazzle Camo Studio uses one deterministic pattern document to drive a flat 2D composition and a procedural 3D merchant steamer at the same time. Port and starboard schemes are generated independently, so the ship behaves like a vessel-specific camouflage study rather than a mirrored texture.

The studio separates two visual approaches:

- **Archive mode** keeps the work within period-informed geometric, tonal, and palette constraints.
- **Expanded mode** unlocks contemporary halftone, gradient, noise, and print treatments.

This is an archive-informed creative study, not a reconstruction of one documented vessel. Historical dazzle was intended to confuse estimates of course, range, and speed—not to make ships invisible.

## Features

- Dedicated **2D Compose**, **Split**, and **3D Preview** workspaces
- Nine procedural pattern grammars
- Independent port and starboard generation
- Deterministic seeds and controlled variation
- Full-field artwork and ship-mask views
- Archive-informed presets and palettes
- Shape, density, scale, overlap, asymmetry, angularity, waterline, detail, and upperworks controls
- Dot, line, and crosshatch halftone screens
- Linear, radial, vignette, and noise gradient fields
- Semantic layer toggles
- Pan, zoom, orbit, and fit controls
- Sea, periscope, and value-check viewing modes
- PNG, SVG, 3D still, and JSON recipe exports
- Responsive touch interface with a 2D fallback when WebGL is unavailable

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
  page.tsx       Generator, 2D renderer, Three.js scene, controls, and exports
  globals.css    Interface and responsive styling
  layout.tsx     App metadata and document shell
public/          Static assets
tests/           Rendered-output checks
```

## Historical framing

The generator focuses on the visual logic associated with 1917–1918 dazzle practice: large silhouette-breaking masses, forceful directional cues, disrupted waterlines and upperworks, strong tonal separation, and different treatments for each side of a vessel. Contemporary print effects remain explicitly separated from the archive-informed system.

## Author

Created by [Colson Knight](https://github.com/coobytron).
