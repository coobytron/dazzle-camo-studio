"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";

export type StudioSection = "studio" | "poster" | "archive" | "learn";

type PatternShape = {
  points: Array<[number, number]>;
  color: string;
  opacity?: number;
};

type PatternDocument = {
  shapes: PatternShape[];
  palette: string[];
  majorMasses: number;
  secondaryMarks: number;
  dominantAngle: number;
};

type SharedProps = {
  seed: string;
  side: "port" | "starboard";
  familyLabel: string;
  pattern: PatternDocument;
};

type PosterFormat = "portrait" | "landscape" | "square";
type PosterLayout = "field-note" | "signal" | "registry" | "overprint";
type PosterTypeface = "helvetica" | "johnston" | "grotesk" | "slab" | "custom";
type GraphicMode = "ship" | "raw" | "mesh";

type HullProfile = {
  label: string;
  bow: number;
  stern: number;
  deck: number;
  sheer: number;
  keel: number;
  fullness: number;
  houseX: number;
  houseWidth: number;
};

type GunMount = {
  x: number;
  barrels: number;
  scale: number;
  direction?: -1 | 1;
};

type GunConfiguration = {
  label: string;
  mounts: GunMount[];
};

type Mast = {
  x: number;
  height: number;
  rake: number;
  yards: number;
  tripod?: boolean;
};

type MastConfiguration = {
  label: string;
  masts: Mast[];
};

type ShipConfiguration = {
  hull: number;
  guns: number;
  masts: number;
  fittings: string[];
};

type MeshPoint = [number, number, number];
type MeshUv = [number, number];
type MeshTriangle = {
  points: [MeshPoint, MeshPoint, MeshPoint];
  uvs: [MeshUv, MeshUv, MeshUv];
};
type PosterMesh = {
  name: string;
  triangles: MeshTriangle[];
};
type MeshLibraryId =
  | "procedural"
  | "dreadnought"
  | "battleship"
  | "portrait"
  | "custom";

const MESH_LIBRARY: Record<
  MeshLibraryId,
  {
    label: string;
    path?: string;
    axes?: { length: number; vertical: number; side: number };
    projectUvs?: boolean;
  }
> = {
  procedural: { label: "Generated hull UV" },
  dreadnought: {
    label: "Giulio Cesare UV",
    path: "models/giulio-cesare-dreadnought.glb",
    projectUvs: true,
  },
  battleship: {
    label: "Battleship Beta UV",
    path: "models/battleship-beta.glb",
    projectUvs: true,
  },
  portrait: {
    label: "Self portrait UV",
    path: "models/self-portrait.glb",
    axes: { length: 0, vertical: 1, side: 2 },
  },
  custom: { label: "Local GLB" },
};

function publicAssetUrl(path: string) {
  return new URL(`./${path}`, window.location.href).toString();
}

const TYPEFACES: Record<
  PosterTypeface,
  { label: string; family: string; note: string; tracking: number }
> = {
  helvetica: {
    label: "Helvetica / 1957",
    family: "Helvetica, Arial, sans-serif",
    note: "The postwar Swiss lens used in the contemporary poster references.",
    tracking: -0.055,
  },
  johnston: {
    label: "Johnston-inspired / 1916",
    family: '"Gill Sans", "Avenir Next", Helvetica, sans-serif',
    note: "Humanist transport lettering contemporary with the first dazzle schemes.",
    tracking: 0.015,
  },
  grotesk: {
    label: "Grotesk / c. 1910",
    family: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
    note: "Compressed industrial display type for plan labels and registry marks.",
    tracking: -0.02,
  },
  slab: {
    label: "Engineer's slab / c. 1917",
    family: 'Rockwell, "Roboto Slab", Georgia, serif',
    note: "A period-adjacent technical voice for dockyard and Shipping Board matter.",
    tracking: 0.005,
  },
  custom: {
    label: "Custom loaded font",
    family: "PosterCustom, Helvetica, Arial, sans-serif",
    note: "A local font loaded for this session. It is used only in your browser.",
    tracking: 0,
  },
};

const HULL_PROFILES: HullProfile[] = [
  { label: "01 / EFC freighter", bow: 0.92, stern: 0.18, deck: 0.24, sheer: 0.04, keel: 0.82, fullness: 0.72, houseX: 0.49, houseWidth: 0.18 },
  { label: "02 / Flush-deck destroyer", bow: 0.98, stern: 0.08, deck: 0.18, sheer: 0.01, keel: 0.7, fullness: 0.42, houseX: 0.42, houseWidth: 0.12 },
  { label: "03 / Admiral battlecruiser", bow: 0.86, stern: 0.12, deck: 0.2, sheer: 0.03, keel: 0.78, fullness: 0.6, houseX: 0.52, houseWidth: 0.14 },
  { label: "04 / Argus conversion", bow: 0.74, stern: 0.16, deck: 0.14, sheer: 0, keel: 0.8, fullness: 0.78, houseX: 0.57, houseWidth: 0.08 },
  { label: "05 / Monitor low freeboard", bow: 0.62, stern: 0.1, deck: 0.32, sheer: 0.01, keel: 0.76, fullness: 0.86, houseX: 0.48, houseWidth: 0.1 },
  { label: "06 / Armed trawler", bow: 0.82, stern: 0.3, deck: 0.27, sheer: 0.08, keel: 0.84, fullness: 0.8, houseX: 0.57, houseWidth: 0.22 },
  { label: "07 / Sloop", bow: 0.9, stern: 0.12, deck: 0.21, sheer: 0.05, keel: 0.74, fullness: 0.54, houseX: 0.45, houseWidth: 0.13 },
  { label: "08 / Light cruiser", bow: 0.94, stern: 0.1, deck: 0.2, sheer: 0.03, keel: 0.77, fullness: 0.55, houseX: 0.51, houseWidth: 0.13 },
  { label: "09 / Protected cruiser", bow: 0.8, stern: 0.2, deck: 0.22, sheer: 0.06, keel: 0.81, fullness: 0.72, houseX: 0.5, houseWidth: 0.17 },
  { label: "10 / Dreadnought", bow: 0.78, stern: 0.12, deck: 0.19, sheer: 0.02, keel: 0.8, fullness: 0.75, houseX: 0.48, houseWidth: 0.14 },
  { label: "11 / Coastal battleship", bow: 0.7, stern: 0.17, deck: 0.24, sheer: 0.04, keel: 0.8, fullness: 0.9, houseX: 0.49, houseWidth: 0.18 },
  { label: "12 / Ocean liner", bow: 0.9, stern: 0.24, deck: 0.15, sheer: 0.04, keel: 0.86, fullness: 0.76, houseX: 0.52, houseWidth: 0.28 },
  { label: "13 / Collier", bow: 0.72, stern: 0.28, deck: 0.25, sheer: 0.02, keel: 0.84, fullness: 0.88, houseX: 0.68, houseWidth: 0.17 },
  { label: "14 / Tanker", bow: 0.76, stern: 0.22, deck: 0.18, sheer: 0.01, keel: 0.82, fullness: 0.82, houseX: 0.79, houseWidth: 0.13 },
  { label: "15 / Troop transport", bow: 0.88, stern: 0.2, deck: 0.17, sheer: 0.05, keel: 0.84, fullness: 0.74, houseX: 0.55, houseWidth: 0.23 },
  { label: "16 / Submarine tender", bow: 0.68, stern: 0.18, deck: 0.23, sheer: 0.02, keel: 0.8, fullness: 0.84, houseX: 0.58, houseWidth: 0.24 },
  { label: "17 / Minelayer", bow: 0.91, stern: 0.09, deck: 0.21, sheer: 0.04, keel: 0.76, fullness: 0.52, houseX: 0.56, houseWidth: 0.15 },
  { label: "18 / Q-ship merchant", bow: 0.84, stern: 0.25, deck: 0.23, sheer: 0.05, keel: 0.85, fullness: 0.79, houseX: 0.48, houseWidth: 0.2 },
  { label: "19 / River gunboat", bow: 0.58, stern: 0.08, deck: 0.3, sheer: 0, keel: 0.72, fullness: 0.92, houseX: 0.5, houseWidth: 0.16 },
  { label: "20 / Experimental wedge", bow: 1, stern: 0.03, deck: 0.16, sheer: 0.09, keel: 0.72, fullness: 0.38, houseX: 0.38, houseWidth: 0.11 },
];

const GUN_CONFIGURATIONS: GunConfiguration[] = [
  { label: "00 / Unarmed merchant", mounts: [] },
  { label: "01 / Aft defensive", mounts: [{ x: 0.17, barrels: 1, scale: 0.72, direction: -1 }] },
  { label: "02 / Fore + aft singles", mounts: [{ x: 0.16, barrels: 1, scale: 0.7, direction: -1 }, { x: 0.84, barrels: 1, scale: 0.7 }] },
  { label: "03 / Twin bow", mounts: [{ x: 0.82, barrels: 2, scale: 0.82 }] },
  { label: "04 / Twin ends", mounts: [{ x: 0.15, barrels: 2, scale: 0.82, direction: -1 }, { x: 0.84, barrels: 2, scale: 0.82 }] },
  { label: "05 / Cruiser four", mounts: [{ x: 0.1, barrels: 1, scale: 0.65, direction: -1 }, { x: 0.28, barrels: 1, scale: 0.62, direction: -1 }, { x: 0.72, barrels: 1, scale: 0.62 }, { x: 0.88, barrels: 1, scale: 0.65 }] },
  { label: "06 / Capital triples", mounts: [{ x: 0.17, barrels: 3, scale: 1, direction: -1 }, { x: 0.76, barrels: 3, scale: 1 }, { x: 0.88, barrels: 3, scale: 0.92 }] },
  { label: "07 / Casemate rhythm", mounts: [{ x: 0.18, barrels: 1, scale: 0.48 }, { x: 0.31, barrels: 1, scale: 0.48 }, { x: 0.68, barrels: 1, scale: 0.48, direction: -1 }, { x: 0.8, barrels: 1, scale: 0.48, direction: -1 }] },
  { label: "08 / Monitor pair", mounts: [{ x: 0.42, barrels: 2, scale: 1.18, direction: -1 }, { x: 0.62, barrels: 2, scale: 1.18 }] },
  { label: "09 / Abstract battery", mounts: [{ x: 0.12, barrels: 2, scale: 0.7, direction: -1 }, { x: 0.38, barrels: 3, scale: 0.84 }, { x: 0.65, barrels: 1, scale: 0.62, direction: -1 }, { x: 0.9, barrels: 2, scale: 0.76 }] },
];

const MAST_CONFIGURATIONS: MastConfiguration[] = [
  { label: "00 / No mast", masts: [] },
  { label: "01 / Single pole", masts: [{ x: 0.54, height: 0.9, rake: -0.03, yards: 0 }] },
  { label: "02 / Merchant pair", masts: [{ x: 0.29, height: 1, rake: -0.04, yards: 0 }, { x: 0.74, height: 0.96, rake: 0.03, yards: 0 }] },
  { label: "03 / Foremast + yard", masts: [{ x: 0.68, height: 1.05, rake: -0.02, yards: 1 }] },
  { label: "04 / Twin naval", masts: [{ x: 0.36, height: 1.08, rake: -0.02, yards: 2 }, { x: 0.67, height: 0.9, rake: 0.02, yards: 1 }] },
  { label: "05 / Tripod foremast", masts: [{ x: 0.61, height: 1.1, rake: -0.01, yards: 2, tripod: true }] },
  { label: "06 / Tripod pair", masts: [{ x: 0.36, height: 0.93, rake: 0.01, yards: 1, tripod: true }, { x: 0.65, height: 1.1, rake: -0.02, yards: 2, tripod: true }] },
  { label: "07 / Raked destroyer", masts: [{ x: 0.58, height: 0.96, rake: 0.12, yards: 1 }] },
  { label: "08 / Cage abstraction", masts: [{ x: 0.63, height: 1.1, rake: 0, yards: 3, tripod: true }] },
  { label: "09 / Liner pair", masts: [{ x: 0.2, height: 0.9, rake: -0.07, yards: 0 }, { x: 0.81, height: 0.9, rake: 0.07, yards: 0 }] },
  { label: "10 / Wireless array", masts: [{ x: 0.27, height: 1.02, rake: -0.03, yards: 2 }, { x: 0.75, height: 1.02, rake: 0.03, yards: 2 }] },
  { label: "11 / Offset carrier", masts: [{ x: 0.69, height: 0.66, rake: -0.04, yards: 1 }] },
  { label: "12 / Four-pole experimental", masts: [{ x: 0.18, height: 0.72, rake: -0.06, yards: 0 }, { x: 0.39, height: 0.9, rake: -0.02, yards: 1 }, { x: 0.64, height: 0.9, rake: 0.02, yards: 1 }, { x: 0.84, height: 0.72, rake: 0.06, yards: 0 }] },
];

const SHIP_FITTINGS = [
  ["single-funnel", "Single funnel"],
  ["twin-funnels", "Twin funnels"],
  ["triple-funnels", "Triple funnels"],
  ["bridge-wings", "Bridge wings"],
  ["aft-house", "Aft deckhouse"],
  ["lifeboats", "Lifeboats"],
  ["davits", "Boat davits"],
  ["deck-cranes", "Deck cranes"],
  ["cargo-booms", "Cargo booms"],
  ["searchlights", "Searchlights"],
  ["rangefinder", "Rangefinder"],
  ["torpedo-tubes", "Torpedo tubes"],
  ["ventilators", "Vent cowls"],
  ["observation-top", "Observation top"],
  ["wireless-array", "Wireless array"],
  ["signal-flags", "Signal flags"],
  ["catwalk", "Raised catwalk"],
  ["hull-ports", "Hull portholes"],
  ["stack-bands", "Funnel bands"],
  ["stern-rail", "Stern rail"],
] as const;

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function traceShipSilhouette(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  configuration: ShipConfiguration,
) {
  const profile = HULL_PROFILES[configuration.hull] ?? HULL_PROFILES[0];
  const guns = GUN_CONFIGURATIONS[configuration.guns] ?? GUN_CONFIGURATIONS[0];
  const has = (id: string) => configuration.fittings.includes(id);
  const deckY = y + height * (profile.deck + profile.sheer * 0.35);
  const sternDeckY = deckY + height * profile.sheer;
  const bottomY = y + height * profile.keel;

  context.beginPath();
  context.moveTo(x + width * 0.012, sternDeckY + height * profile.stern * 0.12);
  context.lineTo(x + width * (0.075 + profile.stern * 0.075), sternDeckY);
  context.lineTo(x + width * (0.82 + (1 - profile.fullness) * 0.055), deckY);
  context.quadraticCurveTo(
    x + width * (0.93 + profile.bow * 0.035),
    deckY + height * (0.015 - profile.sheer * 0.2),
    x + width * 0.992,
    y + height * (0.3 + (1 - profile.bow) * 0.16),
  );
  context.lineTo(
    x + width * (0.93 - (1 - profile.fullness) * 0.035),
    bottomY - height * (1 - profile.bow) * 0.07,
  );
  context.quadraticCurveTo(
    x + width * 0.7,
    y + height * (0.94 - profile.fullness * 0.045),
    x + width * (0.18 + (1 - profile.fullness) * 0.06),
    bottomY,
  );
  context.lineTo(x + width * (0.04 + profile.stern * 0.05), y + height * (0.62 + profile.stern * 0.1));
  context.closePath();

  const houseWidth = width * profile.houseWidth;
  const houseX = x + width * profile.houseX - houseWidth / 2;
  context.rect(houseX, deckY - height * 0.21, houseWidth, height * 0.215);
  context.rect(
    houseX + houseWidth * 0.2,
    deckY - height * 0.29,
    houseWidth * 0.64,
    height * 0.085,
  );
  if (has("aft-house")) {
    context.rect(x + width * 0.19, sternDeckY - height * 0.13, width * 0.13, height * 0.135);
  }
  if (has("catwalk")) {
    context.rect(x + width * 0.27, deckY - height * 0.055, width * 0.42, height * 0.04);
  }

  const funnelXs = has("triple-funnels")
    ? [0.43, 0.51, 0.59]
    : has("twin-funnels")
      ? [0.46, 0.57]
      : has("single-funnel")
        ? [0.52]
        : [];
  funnelXs.forEach((position) => {
    context.rect(
      x + width * position - width * 0.018,
      deckY - height * 0.23,
      width * 0.036,
      height * 0.235,
    );
  });

  guns.mounts.forEach((mount) => {
    const mountX = x + width * mount.x;
    const scale = mount.scale;
    context.rect(
      mountX - width * 0.026 * scale,
      deckY - height * 0.055 * scale,
      width * 0.052 * scale,
      height * 0.058 * scale,
    );
    const direction = mount.direction ?? 1;
    for (let barrel = 0; barrel < mount.barrels; barrel += 1) {
      const offset = (barrel - (mount.barrels - 1) / 2) * height * 0.014;
      const barrelX = direction > 0 ? mountX : mountX - width * 0.092 * scale;
      context.rect(
        barrelX,
        deckY - height * 0.052 * scale + offset,
        width * 0.092 * scale,
        height * 0.012 * scale,
      );
    }
  });
}

function drawShipDetails(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  configuration: ShipConfiguration,
  ink: string,
) {
  const profile = HULL_PROFILES[configuration.hull] ?? HULL_PROFILES[0];
  const mastConfiguration =
    MAST_CONFIGURATIONS[configuration.masts] ?? MAST_CONFIGURATIONS[0];
  const has = (id: string) => configuration.fittings.includes(id);
  const deckY = y + height * (profile.deck + profile.sheer * 0.35);
  const line = Math.max(1.5, width * 0.0022);
  context.save();
  context.strokeStyle = ink;
  context.fillStyle = ink;
  context.lineWidth = line;
  context.lineCap = "square";
  context.lineJoin = "miter";

  mastConfiguration.masts.forEach((mast) => {
    const baseX = x + width * mast.x;
    const topX = baseX + width * mast.rake;
    const topY = deckY - height * (0.24 + mast.height * 0.46);
    context.beginPath();
    context.moveTo(baseX, deckY);
    context.lineTo(topX, topY);
    if (mast.tripod) {
      context.moveTo(baseX - width * 0.025, deckY);
      context.lineTo(topX, topY);
      context.moveTo(baseX + width * 0.025, deckY);
      context.lineTo(topX, topY);
    }
    for (let yard = 0; yard < mast.yards; yard += 1) {
      const yardY = topY + height * (0.065 + yard * 0.055);
      const yardWidth = width * (0.075 - yard * 0.012);
      context.moveTo(topX - yardWidth, yardY);
      context.lineTo(topX + yardWidth, yardY);
    }
    context.stroke();
  });

  if (mastConfiguration.masts.length > 1 || has("wireless-array")) {
    const first = mastConfiguration.masts[0];
    const last = mastConfiguration.masts.at(-1);
    if (first && last) {
      context.beginPath();
      context.moveTo(
        x + width * first.x + width * first.rake,
        deckY - height * (0.18 + first.height * 0.43),
      );
      context.lineTo(
        x + width * last.x + width * last.rake,
        deckY - height * (0.18 + last.height * 0.43),
      );
      context.stroke();
    }
  }

  if (has("bridge-wings")) {
    const cx = x + width * profile.houseX;
    context.fillRect(cx - width * 0.105, deckY - height * 0.22, width * 0.21, height * 0.018);
  }
  if (has("lifeboats")) {
    [0.34, 0.66].forEach((position) => {
      context.beginPath();
      context.ellipse(x + width * position, deckY - height * 0.045, width * 0.048, height * 0.024, 0, 0, Math.PI * 2);
      context.stroke();
    });
  }
  if (has("davits")) {
    [0.3, 0.38, 0.62, 0.7].forEach((position) => {
      context.beginPath();
      context.moveTo(x + width * position, deckY);
      context.quadraticCurveTo(x + width * (position + 0.01), deckY - height * 0.1, x + width * (position + 0.035), deckY - height * 0.08);
      context.stroke();
    });
  }
  if (has("deck-cranes") || has("cargo-booms")) {
    [0.27, 0.73].forEach((position, index) => {
      context.beginPath();
      context.moveTo(x + width * position, deckY);
      context.lineTo(x + width * (position + (index ? -0.1 : 0.1)), deckY - height * 0.18);
      if (has("deck-cranes")) {
        context.lineTo(x + width * (position + (index ? -0.14 : 0.14)), deckY - height * 0.17);
      }
      context.stroke();
    });
  }
  if (has("searchlights")) {
    [0.43, 0.61].forEach((position) => {
      context.beginPath();
      context.arc(x + width * position, deckY - height * 0.25, height * 0.025, 0, Math.PI * 2);
      context.stroke();
    });
  }
  if (has("rangefinder")) {
    context.fillRect(x + width * (profile.houseX - 0.045), deckY - height * 0.32, width * 0.09, height * 0.017);
  }
  if (has("torpedo-tubes")) {
    [0.45, 0.5, 0.55].forEach((position) => {
      context.beginPath();
      context.ellipse(x + width * position, deckY - height * 0.04, width * 0.028, height * 0.015, -0.12, 0, Math.PI * 2);
      context.stroke();
    });
  }
  if (has("ventilators")) {
    [0.39, 0.62, 0.67].forEach((position, index) => {
      context.beginPath();
      context.moveTo(x + width * position, deckY);
      context.lineTo(x + width * position, deckY - height * (0.07 + index * 0.01));
      context.arc(x + width * (position + 0.012), deckY - height * (0.07 + index * 0.01), height * 0.013, Math.PI, 0);
      context.stroke();
    });
  }
  if (has("observation-top")) {
    const mast = mastConfiguration.masts[Math.floor(mastConfiguration.masts.length / 2)];
    if (mast) {
      const mx = x + width * mast.x + width * mast.rake * 0.75;
      const my = deckY - height * (0.18 + mast.height * 0.34);
      context.fillRect(mx - width * 0.032, my, width * 0.064, height * 0.025);
    }
  }
  if (has("signal-flags") && mastConfiguration.masts[0]) {
    const mast = mastConfiguration.masts[0];
    const fx = x + width * mast.x + width * mast.rake;
    const fy = deckY - height * (0.2 + mast.height * 0.4);
    context.beginPath();
    context.moveTo(fx, fy);
    context.lineTo(fx + width * 0.036, fy + height * 0.025);
    context.lineTo(fx, fy + height * 0.05);
    context.closePath();
    context.fill();
  }
  if (has("hull-ports")) {
    for (let index = 0; index < 15; index += 1) {
      context.beginPath();
      context.arc(x + width * (0.14 + index * 0.048), deckY + height * 0.17, height * 0.008, 0, Math.PI * 2);
      context.fill();
    }
  }
  if (has("stack-bands")) {
    const stacks = has("triple-funnels") ? [0.43, 0.51, 0.59] : has("twin-funnels") ? [0.46, 0.57] : has("single-funnel") ? [0.52] : [];
    stacks.forEach((position) => context.fillRect(x + width * position - width * 0.019, deckY - height * 0.18, width * 0.038, height * 0.025));
  }
  if (has("stern-rail")) {
    context.beginPath();
    context.moveTo(x + width * 0.06, deckY - height * 0.03);
    context.lineTo(x + width * 0.22, deckY - height * 0.03);
    for (let index = 0; index < 5; index += 1) {
      const px = x + width * (0.07 + index * 0.032);
      context.moveTo(px, deckY - height * 0.03);
      context.lineTo(px, deckY);
    }
    context.stroke();
  }

  context.restore();
}

function drawPatternField(
  context: CanvasRenderingContext2D,
  shapes: PatternShape[],
  palette: string[],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.fillStyle = palette[Math.min(1, palette.length - 1)] || "#e9e5da";
  context.fillRect(x, y, width, height);
  shapes.forEach((shape) => {
    if (!shape.points.length) return;
    context.beginPath();
    shape.points.forEach(([px, py], index) => {
      const vx = x + px * width;
      const vy = y + py * height;
      if (index === 0) context.moveTo(vx, vy);
      else context.lineTo(vx, vy);
    });
    context.closePath();
    context.globalAlpha = shape.opacity ?? 1;
    context.fillStyle = shape.color;
    context.fill();
  });
  context.globalAlpha = 1;
}

function distanceTransform(mask: Uint8Array, width: number, height: number, target: 0 | 1) {
  const diagonal = Math.SQRT2;
  const distance = new Float32Array(width * height);
  for (let index = 0; index < distance.length; index += 1) {
    distance[index] = mask[index] === target ? 0 : 1e6;
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      if (x > 0) distance[i] = Math.min(distance[i], distance[i - 1] + 1);
      if (y > 0) distance[i] = Math.min(distance[i], distance[i - width] + 1);
      if (x > 0 && y > 0) distance[i] = Math.min(distance[i], distance[i - width - 1] + diagonal);
      if (x < width - 1 && y > 0)
        distance[i] = Math.min(distance[i], distance[i - width + 1] + diagonal);
    }
  }
  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = width - 1; x >= 0; x -= 1) {
      const i = y * width + x;
      if (x < width - 1) distance[i] = Math.min(distance[i], distance[i + 1] + 1);
      if (y < height - 1) distance[i] = Math.min(distance[i], distance[i + width] + 1);
      if (x < width - 1 && y < height - 1)
        distance[i] = Math.min(distance[i], distance[i + width + 1] + diagonal);
      if (x > 0 && y < height - 1)
        distance[i] = Math.min(distance[i], distance[i + width - 1] + diagonal);
    }
  }
  return distance;
}

function createSpillMask(spill: number, configuration: ShipConfiguration) {
  const width = 320;
  const height = 150;
  const canvas = window.document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#fff";
  traceShipSilhouette(context, 12, 28, width - 24, height - 38, configuration);
  context.fill("nonzero");
  const pixels = context.getImageData(0, 0, width, height);
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i += 1) mask[i] = pixels.data[i * 4] > 127 ? 1 : 0;
  const outsideDistance = distanceTransform(mask, width, height, 1);
  const output = context.createImageData(width, height);
  const radius = 2 + spill * 0.21;
  for (let i = 0; i < mask.length; i += 1) {
    const alpha =
      mask[i] === 1
        ? 255
        : Math.round(255 * Math.max(0, Math.min(1, 1 - outsideDistance[i] / radius)));
    output.data[i * 4] = 255;
    output.data[i * 4 + 1] = 255;
    output.data[i * 4 + 2] = 255;
    output.data[i * 4 + 3] = alpha;
  }
  context.putImageData(output, 0, 0);
  return canvas;
}

function pointInPolygon(point: [number, number], polygon: Array<[number, number]>) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const crosses =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi || 0.000001) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function samplePattern(pattern: PatternDocument, u: number, v: number) {
  let color = pattern.palette[Math.min(1, pattern.palette.length - 1)] || "#e9e5da";
  pattern.shapes.forEach((shape) => {
    if (shape.points.length > 2 && pointInPolygon([u, v], shape.points)) color = shape.color;
  });
  return color;
}

function shadeHex(color: string, light: number) {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hex) return color;
  const value =
    hex[1].length === 3
      ? hex[1]
          .split("")
          .map((character) => character + character)
          .join("")
      : hex[1];
  const channel = (offset: number) =>
    Math.max(0, Math.min(255, Math.round(Number.parseInt(value.slice(offset, offset + 2), 16) * light)));
  return `rgb(${channel(0)}, ${channel(2)}, ${channel(4)})`;
}

function createProceduralMesh(profile: HullProfile): PosterMesh {
  const triangles: MeshTriangle[] = [];
  const columns = 30;
  const rows = 10;
  const point = (u: number, v: number): MeshPoint => {
    const tip = Math.pow(Math.sin(Math.PI * u), 0.3 + (1 - profile.fullness) * 0.45);
    const top = 0.32 + profile.sheer * (0.5 - u);
    const bottom = -0.48 * tip - (profile.keel - 0.72) * 0.35;
    const y = top + (bottom - top) * v;
    const z = Math.sin(Math.PI * v) * tip * (0.18 + profile.fullness * 0.28);
    return [(u - 0.5) * 3.1, -y * 1.7, z];
  };
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u0 = column / columns;
      const u1 = (column + 1) / columns;
      const v0 = row / rows;
      const v1 = (row + 1) / rows;
      triangles.push({
        points: [point(u0, v0), point(u1, v0), point(u1, v1)],
        uvs: [[u0, v0], [u1, v0], [u1, v1]],
      });
      triangles.push({
        points: [point(u0, v0), point(u1, v1), point(u0, v1)],
        uvs: [[u0, v0], [u1, v1], [u0, v1]],
      });
    }
  }
  return { name: "Procedural hull surface", triangles };
}

function drawMeshField(
  context: CanvasRenderingContext2D,
  mesh: PosterMesh,
  pattern: PatternDocument,
  rect: { x: number; y: number; w: number; h: number },
  turn: number,
  tilt: number,
  wire: number,
  ink: string,
) {
  const turnRadians = (turn * Math.PI) / 180;
  const tiltRadians = (tilt * Math.PI) / 180;
  const cosY = Math.cos(turnRadians);
  const sinY = Math.sin(turnRadians);
  const cosX = Math.cos(tiltRadians);
  const sinX = Math.sin(tiltRadians);
  const projected = mesh.triangles.map((triangle) => {
    const transformed = triangle.points.map(([x, y, z]) => {
      const rx = x * cosY + z * sinY;
      const rz = -x * sinY + z * cosY;
      const ry = y * cosX - rz * sinX;
      const rz2 = y * sinX + rz * cosX;
      const perspective = 1.9 / Math.max(0.55, 2.25 - rz2);
      return {
        x: rect.x + rect.w * 0.5 + rx * rect.w * 0.27 * perspective,
        y: rect.y + rect.h * 0.51 + ry * rect.h * 0.62 * perspective,
        z: rz2,
        source: [rx, ry, rz2] as MeshPoint,
      };
    }) as [
      { x: number; y: number; z: number; source: MeshPoint },
      { x: number; y: number; z: number; source: MeshPoint },
      { x: number; y: number; z: number; source: MeshPoint },
    ];
    const a = transformed[0].source;
    const b = transformed[1].source;
    const c = transformed[2].source;
    const ab: MeshPoint = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac: MeshPoint = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const normal: MeshPoint = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ];
    const length = Math.hypot(...normal) || 1;
    const facing = Math.abs(normal[2] / length);
    return {
      points: transformed,
      depth: transformed.reduce((sum, point) => sum + point.z, 0) / 3,
      u: triangle.uvs.reduce((sum, uv) => sum + uv[0], 0) / 3,
      v: triangle.uvs.reduce((sum, uv) => sum + uv[1], 0) / 3,
      light: 0.58 + facing * 0.42,
    };
  });
  projected.sort((a, b) => a.depth - b.depth);

  context.save();
  context.lineJoin = "round";
  projected.forEach((triangle) => {
    context.beginPath();
    triangle.points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.closePath();
    context.fillStyle = shadeHex(samplePattern(pattern, triangle.u, triangle.v), triangle.light);
    context.fill();
    if (wire > 0) {
      context.globalAlpha = Math.min(0.68, wire / 125);
      context.strokeStyle = ink;
      context.lineWidth = Math.max(0.45, rect.w * 0.0008);
      context.stroke();
      context.globalAlpha = 1;
    }
  });
  context.restore();
}

async function loadPosterMeshFromBuffer(
  name: string,
  arrayBuffer: ArrayBuffer,
  axes?: { length: number; vertical: number; side: number },
  projectUvs = false,
): Promise<PosterMesh> {
  const Three = await import("three");
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) =>
    loader.parse(arrayBuffer, "", resolve, reject),
  );
  gltf.scene.updateMatrixWorld(true);

  const rawTriangles: Array<{
    points: [MeshPoint, MeshPoint, MeshPoint];
    uvs?: [MeshUv, MeshUv, MeshUv];
  }> = [];
  const bounds = new Three.Box3();
  gltf.scene.traverse((object: THREE.Object3D) => {
    if (!(object instanceof Three.Mesh) || !object.geometry) return;
    const position = object.geometry.getAttribute("position");
    const uv = object.geometry.getAttribute("uv");
    const index = object.geometry.getIndex();
    const triangleCount = index ? index.count / 3 : position.count / 3;
    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
      const indices = [0, 1, 2].map((corner) =>
        index ? index.getX(triangleIndex * 3 + corner) : triangleIndex * 3 + corner,
      );
      const points = indices.map((vertexIndex) => {
        const point = new Three.Vector3().fromBufferAttribute(position, vertexIndex).applyMatrix4(object.matrixWorld);
        bounds.expandByPoint(point);
        return [point.x, point.y, point.z] as MeshPoint;
      }) as [MeshPoint, MeshPoint, MeshPoint];
      const uvs = uv && !projectUvs
        ? (indices.map((vertexIndex) => [uv.getX(vertexIndex), 1 - uv.getY(vertexIndex)] as MeshUv) as [MeshUv, MeshUv, MeshUv])
        : undefined;
      rawTriangles.push({ points, uvs });
    }
  });
  if (!rawTriangles.length || bounds.isEmpty()) throw new Error("No mesh geometry found");

  const size = bounds.getSize(new Three.Vector3());
  const min = [bounds.min.x, bounds.min.y, bounds.min.z];
  const max = [bounds.max.x, bounds.max.y, bounds.max.z];
  const center = bounds.getCenter(new Three.Vector3());
  const centers = [center.x, center.y, center.z];
  const dimensions = [size.x, size.y, size.z];
  const inferredLength = dimensions.indexOf(Math.max(...dimensions));
  const inferredSide = dimensions.indexOf(Math.min(...dimensions));
  const inferredVertical =
    [0, 1, 2].find((axis) => axis !== inferredLength && axis !== inferredSide) ?? 1;
  const lengthAxis = axes?.length ?? inferredLength;
  const sideAxis = axes?.side ?? inferredSide;
  const verticalAxis = axes?.vertical ?? inferredVertical;
  const longest = Math.max(0.0001, dimensions[lengthAxis]);
  const stride = Math.max(1, Math.ceil(rawTriangles.length / 9000));
  const triangles = rawTriangles
    .filter((_, index) => index % stride === 0)
    .map((triangle) => {
      const points = triangle.points.map((point) => [
        ((point[lengthAxis] - centers[lengthAxis]) / longest) * 3.2,
        ((point[verticalAxis] - centers[verticalAxis]) / longest) * -3.2,
        ((point[sideAxis] - centers[sideAxis]) / longest) * 3.2,
      ] as MeshPoint) as [MeshPoint, MeshPoint, MeshPoint];
      const uvs =
        triangle.uvs ??
        (triangle.points.map((point) => [
          (point[lengthAxis] - min[lengthAxis]) / Math.max(0.0001, max[lengthAxis] - min[lengthAxis]),
          1 - (point[verticalAxis] - min[verticalAxis]) / Math.max(0.0001, max[verticalAxis] - min[verticalAxis]),
        ] as MeshUv) as [MeshUv, MeshUv, MeshUv]);
      return { points, uvs };
    });
  return { name, triangles };
}

async function loadPosterMesh(file: File): Promise<PosterMesh> {
  return loadPosterMeshFromBuffer(file.name, await file.arrayBuffer());
}

function renderPoster(
  canvas: HTMLCanvasElement,
  props: SharedProps,
  options: {
    format: PosterFormat;
    layout: PosterLayout;
    typeface: PosterTypeface;
    title: string;
    subtitle: string;
    spill: number;
    ink: string;
    paper: string;
    graphicMode: GraphicMode;
    ship: ShipConfiguration;
    mesh: PosterMesh;
    meshTurn: number;
    meshTilt: number;
    meshWire: number;
    rawAngle: number;
    rawScale: number;
  },
) {
  const dimensions: Record<PosterFormat, [number, number]> = {
    portrait: [900, 1200],
    landscape: [1400, 900],
    square: [1080, 1080],
  };
  const [width, height] = dimensions[options.format];
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = options.paper;
  context.fillRect(0, 0, width, height);
  const unit = Math.min(width, height);
  const margin = unit * 0.055;
  const family = TYPEFACES[options.typeface].family;
  const landscape = width > height;
  const shipRect = landscape
    ? { x: width * 0.12, y: height * 0.29, w: width * 0.79, h: height * 0.43 }
    : { x: width * 0.08, y: height * 0.36, w: width * 0.86, h: height * 0.31 };

  if (options.graphicMode === "ship") {
    const patternLayer = window.document.createElement("canvas");
    patternLayer.width = width;
    patternLayer.height = height;
    const patternContext = patternLayer.getContext("2d");
    if (patternContext) {
      const expansion = unit * (0.015 + options.spill * 0.0022);
      drawPatternField(
        patternContext,
        props.pattern.shapes,
        props.pattern.palette,
        shipRect.x - expansion,
        shipRect.y - expansion,
        shipRect.w + expansion * 2,
        shipRect.h + expansion * 2,
      );
      const mask = createSpillMask(options.spill, options.ship);
      patternContext.globalCompositeOperation = "destination-in";
      patternContext.imageSmoothingEnabled = true;
      patternContext.drawImage(
        mask,
        shipRect.x - expansion,
        shipRect.y - expansion * 0.4,
        shipRect.w + expansion * 2,
        shipRect.h + expansion * 0.9,
      );
      patternContext.globalCompositeOperation = "source-over";
    }
    context.drawImage(patternLayer, 0, 0);
    context.save();
    context.strokeStyle = options.ink;
    context.lineWidth = Math.max(2, unit * 0.0026);
    traceShipSilhouette(context, shipRect.x, shipRect.y, shipRect.w, shipRect.h, options.ship);
    context.stroke();
    context.restore();
    drawShipDetails(
      context,
      shipRect.x,
      shipRect.y,
      shipRect.w,
      shipRect.h,
      options.ship,
      options.ink,
    );
  } else if (options.graphicMode === "raw") {
    const rawWidth = shipRect.w * (0.82 + options.rawScale * 0.006);
    const rawHeight = shipRect.h * (1.22 + options.rawScale * 0.004);
    context.save();
    context.translate(shipRect.x + shipRect.w * 0.5, shipRect.y + shipRect.h * 0.56);
    context.rotate((options.rawAngle * Math.PI) / 180);
    drawPatternField(
      context,
      props.pattern.shapes,
      props.pattern.palette,
      -rawWidth * 0.5,
      -rawHeight * 0.5,
      rawWidth,
      rawHeight,
    );
    context.globalAlpha = 0.18;
    context.globalCompositeOperation = "multiply";
    context.translate(unit * 0.035, unit * 0.025);
    drawPatternField(
      context,
      props.pattern.shapes,
      props.pattern.palette,
      -rawWidth * 0.5,
      -rawHeight * 0.5,
      rawWidth,
      rawHeight,
    );
    context.restore();
  } else {
    drawMeshField(
      context,
      options.mesh,
      props.pattern,
      {
        x: shipRect.x - shipRect.w * 0.08,
        y: shipRect.y - shipRect.h * 0.38,
        w: shipRect.w * 1.16,
        h: shipRect.h * 1.7,
      },
      options.meshTurn,
      options.meshTilt,
      options.meshWire,
      options.ink,
    );
  }

  const titleSize =
    options.layout === "signal"
      ? unit * 0.162
      : options.layout === "overprint"
        ? unit * 0.125
        : unit * 0.092;
  context.fillStyle = options.ink;
  context.font = `700 ${titleSize}px ${family}`;
  context.textBaseline = "top";
  if (options.layout === "signal") {
    context.fillText(options.title.toUpperCase(), margin * 1.15, margin * 1.12);
    context.font = `600 ${unit * 0.038}px ${family}`;
    context.fillText(options.subtitle, margin * 1.18, margin * 1.15 + titleSize * 0.97);
  } else if (options.layout === "registry") {
    context.fillText(options.title, margin * 1.12, margin * 1.05);
    context.font = `500 ${unit * 0.027}px ${family}`;
    context.fillText(options.subtitle, margin * 1.15, margin * 1.2 + titleSize);
  } else if (options.layout === "overprint") {
    context.save();
    context.translate(width - margin * 1.2, margin * 1.1);
    context.rotate(Math.PI / 2);
    context.fillText(options.title.toUpperCase(), 0, 0);
    context.restore();
  } else {
    context.fillText(options.title, margin * 1.12, margin * 1.05);
    context.font = `500 ${unit * 0.025}px ${family}`;
    context.fillText(options.subtitle, margin * 1.15, margin * 1.17 + titleSize);
  }

  context.font = `500 ${unit * 0.014}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.fillStyle = options.ink;
  context.fillText(`STUDY ${props.seed}`, margin * 1.15, height - margin * 1.85);
  context.textAlign = "center";
  context.fillText(
    `${props.side.toUpperCase()} / ${props.familyLabel.toUpperCase()} / ${
      options.graphicMode === "ship"
        ? `HULL ${String(options.ship.hull + 1).padStart(2, "0")} · SDF ${options.spill}`
        : options.graphicMode === "mesh"
          ? `UV MESH · TURN ${options.meshTurn}°`
          : `RAW FIELD · ANGLE ${options.rawAngle}°`
    }`,
    width / 2,
    height - margin * 1.85,
  );
  context.textAlign = "right";
  context.fillText("DAZZLE PRESS / 1917 → NOW", width - margin * 1.15, height - margin * 1.85);
  context.textAlign = "left";

  if (options.layout === "field-note") {
    context.save();
    context.translate(width - margin * 1.5, height * 0.23);
    context.rotate(Math.PI / 2);
    context.font = `700 ${unit * 0.016}px ${family}`;
    context.fillText("CONFUSE COURSE · SPEED · RANGE", 0, 0);
    context.restore();
  }
}

export function PosterPress(props: SharedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<PosterFormat>("portrait");
  const [layout, setLayout] = useState<PosterLayout>("field-note");
  const [typeface, setTypeface] = useState<PosterTypeface>("helvetica");
  const [graphicMode, setGraphicMode] = useState<GraphicMode>("ship");
  const [title, setTitle] = useState("Dazzle");
  const [subtitle, setSubtitle] = useState("Optical disruption studies");
  const [spill, setSpill] = useState(46);
  const [ink, setInk] = useState("#171914");
  const [paper, setPaper] = useState("#eee9dc");
  const [ship, setShip] = useState<ShipConfiguration>({
    hull: 0,
    guns: 2,
    masts: 2,
    fittings: [
      "twin-funnels",
      "bridge-wings",
      "lifeboats",
      "davits",
      "cargo-booms",
      "rangefinder",
      "hull-ports",
      "stack-bands",
    ],
  });
  const [loadedMesh, setLoadedMesh] = useState<PosterMesh | null>(null);
  const [meshLibraryId, setMeshLibraryId] = useState<MeshLibraryId>("procedural");
  const [meshStatus, setMeshStatus] = useState("Procedural hull surface · UV projection active");
  const [meshTurn, setMeshTurn] = useState(-18);
  const [meshTilt, setMeshTilt] = useState(7);
  const [meshWire, setMeshWire] = useState(34);
  const [rawAngle, setRawAngle] = useState(-6);
  const [rawScale, setRawScale] = useState(62);
  const mesh = useMemo(
    () => loadedMesh ?? createProceduralMesh(HULL_PROFILES[ship.hull] ?? HULL_PROFILES[0]),
    [loadedMesh, ship.hull],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    renderPoster(canvasRef.current, props, {
      format,
      layout,
      typeface,
      title,
      subtitle,
      spill,
      ink,
      paper,
      graphicMode,
      ship,
      mesh,
      meshTurn,
      meshTilt,
      meshWire,
      rawAngle,
      rawScale,
    });
  }, [
    format,
    graphicMode,
    ink,
    layout,
    mesh,
    meshTilt,
    meshTurn,
    meshWire,
    paper,
    props,
    rawAngle,
    rawScale,
    ship,
    spill,
    subtitle,
    title,
    typeface,
  ]);

  const loadFont = async (file?: File) => {
    if (!file) return;
    const font = new FontFace("PosterCustom", await file.arrayBuffer());
    await font.load();
    window.document.fonts.add(font);
    setTypeface("custom");
  };

  const importMesh = async (file?: File) => {
    if (!file) return;
    setMeshStatus("Reading mesh geometry…");
    try {
      const nextMesh = await loadPosterMesh(file);
      setLoadedMesh(nextMesh);
      setMeshLibraryId("custom");
      setMeshStatus(`${nextMesh.name} · ${nextMesh.triangles.length.toLocaleString()} projected faces`);
      setGraphicMode("mesh");
    } catch {
      setMeshStatus("Could not read this GLB · procedural hull remains active");
    }
  };

  const loadLibraryMesh = async (id: MeshLibraryId) => {
    setMeshLibraryId(id);
    if (id === "custom") return;
    if (id === "procedural") {
      setLoadedMesh(null);
      setMeshStatus("Procedural hull surface · UV projection active");
      setGraphicMode("mesh");
      return;
    }
    const item = MESH_LIBRARY[id];
    setMeshStatus(`Loading ${item.label}…`);
    try {
      const response = await fetch(publicAssetUrl(item.path!));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const nextMesh = await loadPosterMeshFromBuffer(
        item.label,
        await response.arrayBuffer(),
        item.axes,
        item.projectUvs,
      );
      setLoadedMesh(nextMesh);
      setMeshStatus(`${nextMesh.name} · ${nextMesh.triangles.length.toLocaleString()} projected faces`);
      setGraphicMode("mesh");
    } catch {
      setMeshStatus(`Could not load ${item.label} · procedural hull remains available`);
    }
  };

  const randomizeShip = () => {
    const shuffled = SHIP_FITTINGS.map(([id]) => id).sort(() => Math.random() - 0.5);
    const count = 4 + Math.floor(Math.random() * 7);
    setShip({
      hull: Math.floor(Math.random() * HULL_PROFILES.length),
      guns: Math.floor(Math.random() * GUN_CONFIGURATIONS.length),
      masts: Math.floor(Math.random() * MAST_CONFIGURATIONS.length),
      fittings: shuffled.slice(0, count),
    });
    setLoadedMesh(null);
    setMeshLibraryId("procedural");
  };

  const toggleFitting = (id: string) => {
    setShip((current) => ({
      ...current,
      fittings: current.fittings.includes(id)
        ? current.fittings.filter((item) => item !== id)
        : [...current.fittings, id],
    }));
  };

  return (
    <section className="expansion-page poster-page">
      <div className="expansion-intro">
        <span className="eyebrow">Instrument 02 / Take-away</span>
        <h2>Poster Press</h2>
        <p>
          Use the live scheme as a generated vessel, an unmasked graphic field, or a surface-aware
          mesh study. Upload a GLB to turn the artwork across its real triangles and UVs.
        </p>
      </div>

      <div className="poster-workspace">
        <aside className="poster-controls" aria-label="Poster controls">
          <label className="field-control">
            <span>Graphic treatment</span>
            <select
              value={graphicMode}
              onChange={(event) => setGraphicMode(event.target.value as GraphicMode)}
            >
              <option value="ship">Generated ship / SDF</option>
              <option value="raw">Raw graphic / unmasked</option>
              <option value="mesh">UV mesh / surface turn</option>
            </select>
          </label>

          {graphicMode === "ship" && (
            <details className="poster-control-group" open>
              <summary>
                Vessel grammar <span>20 × 10 × 13</span>
              </summary>
              <button className="poster-randomize" onClick={randomizeShip}>
                Generate new outline
              </button>
              <label className="field-control">
                <span>Hull profile / 20</span>
                <select
                  value={ship.hull}
                  onChange={(event) => {
                    setShip((current) => ({ ...current, hull: Number(event.target.value) }));
                    setLoadedMesh(null);
                  }}
                >
                  {HULL_PROFILES.map((profile, index) => (
                    <option value={index} key={profile.label}>
                      {profile.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-control">
                <span>Gun abstraction / 10</span>
                <select
                  value={ship.guns}
                  onChange={(event) =>
                    setShip((current) => ({ ...current, guns: Number(event.target.value) }))
                  }
                >
                  {GUN_CONFIGURATIONS.map((configuration, index) => (
                    <option value={index} key={configuration.label}>
                      {configuration.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-control">
                <span>Mast configuration / 13</span>
                <select
                  value={ship.masts}
                  onChange={(event) =>
                    setShip((current) => ({ ...current, masts: Number(event.target.value) }))
                  }
                >
                  {MAST_CONFIGURATIONS.map((configuration, index) => (
                    <option value={index} key={configuration.label}>
                      {configuration.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="poster-range">
                <span>
                  SDF pattern spill <strong>{spill}</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={spill}
                  onChange={(event) => setSpill(Number(event.target.value))}
                />
              </div>
              <div className="fitting-heading">
                <span>Fittings / 20</span>
                <strong>{ship.fittings.length} active</strong>
              </div>
              <div className="fitting-grid" role="group" aria-label="Ship fittings">
                {SHIP_FITTINGS.map(([id, label], index) => (
                  <button
                    className={ship.fittings.includes(id) ? "active" : ""}
                    aria-pressed={ship.fittings.includes(id)}
                    onClick={() => toggleFitting(id)}
                    key={id}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {label}
                  </button>
                ))}
              </div>
            </details>
          )}

          {graphicMode === "raw" && (
            <details className="poster-control-group" open>
              <summary>
                Raw artwork <span>no mask</span>
              </summary>
              <label className="poster-range">
                <span>
                  Graphic angle <strong>{rawAngle}°</strong>
                </span>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={rawAngle}
                  onChange={(event) => setRawAngle(Number(event.target.value))}
                />
              </label>
              <label className="poster-range">
                <span>
                  Field scale <strong>{rawScale}</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rawScale}
                  onChange={(event) => setRawScale(Number(event.target.value))}
                />
              </label>
            </details>
          )}

          {graphicMode === "mesh" && (
            <details className="poster-control-group" open>
              <summary>
                UV mesh studio <span>GLB</span>
              </summary>
              <label className="mesh-library">
                <span>Mesh library</span>
                <select
                  value={meshLibraryId}
                  onChange={(event) =>
                    void loadLibraryMesh(event.target.value as MeshLibraryId)
                  }
                >
                  {(Object.entries(MESH_LIBRARY) as Array<
                    [MeshLibraryId, (typeof MESH_LIBRARY)[MeshLibraryId]]
                  >)
                    .filter(([id]) => id !== "custom" || meshLibraryId === "custom")
                    .map(([id, item]) => (
                      <option value={id} key={id}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="mesh-upload">
                <span>Upload local GLB</span>
                <input
                  type="file"
                  accept=".glb,model/gltf-binary"
                  onChange={(event) => void importMesh(event.target.files?.[0])}
                />
              </label>
              <p className="mesh-status">{meshStatus}</p>
              <label className="poster-range">
                <span>
                  Surface turn <strong>{meshTurn}°</strong>
                </span>
                <input
                  type="range"
                  min="-75"
                  max="75"
                  value={meshTurn}
                  onChange={(event) => setMeshTurn(Number(event.target.value))}
                />
              </label>
              <label className="poster-range">
                <span>
                  Surface tilt <strong>{meshTilt}°</strong>
                </span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={meshTilt}
                  onChange={(event) => setMeshTilt(Number(event.target.value))}
                />
              </label>
              <label className="poster-range">
                <span>
                  UV wire <strong>{meshWire}</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={meshWire}
                  onChange={(event) => setMeshWire(Number(event.target.value))}
                />
              </label>
              {loadedMesh && (
                <button
                  className="mesh-reset"
                  onClick={() => {
                    setLoadedMesh(null);
                    setMeshStatus("Procedural hull surface · UV projection active");
                  }}
                >
                  Return to generated hull mesh
                </button>
              )}
            </details>
          )}

          <details className="poster-control-group" open>
            <summary>
              Typography <span>press</span>
            </summary>
          <label className="field-control">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field-control">
            <span>Descriptor</span>
            <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
          </label>
          <label className="field-control">
            <span>Composition</span>
            <select value={layout} onChange={(event) => setLayout(event.target.value as PosterLayout)}>
              <option value="field-note">Field note</option>
              <option value="signal">Signal block</option>
              <option value="registry">Archive registry</option>
              <option value="overprint">Rotated overprint</option>
            </select>
          </label>
          <label className="field-control">
            <span>Typeface</span>
            <select
              value={typeface}
              onChange={(event) => setTypeface(event.target.value as PosterTypeface)}
            >
              {Object.entries(TYPEFACES)
                .filter(([id]) => id !== "custom" || typeface === "custom")
                .map(([id, item]) => (
                  <option value={id} key={id}>
                    {item.label}
                  </option>
                ))}
            </select>
          </label>
          <p className="control-explainer">{TYPEFACES[typeface].note}</p>
          <label className="font-upload">
            <span>Load a local font</span>
            <input
              type="file"
              accept=".otf,.ttf,.woff,.woff2"
              onChange={(event) => void loadFont(event.target.files?.[0])}
            />
          </label>
          </details>

          <details className="poster-control-group">
            <summary>
              Output <span>format + ink</span>
            </summary>
          <label className="field-control">
            <span>Format</span>
            <select value={format} onChange={(event) => setFormat(event.target.value as PosterFormat)}>
              <option value="portrait">Portrait / 3:4</option>
              <option value="landscape">Landscape / 14:9</option>
              <option value="square">Square / 1:1</option>
            </select>
          </label>
          <div className="poster-color-row">
            <label>
              <span>Ink</span>
              <input type="color" value={ink} onChange={(event) => setInk(event.target.value)} />
            </label>
            <label>
              <span>Paper</span>
              <input type="color" value={paper} onChange={(event) => setPaper(event.target.value)} />
            </label>
          </div>
          </details>
          <button
            className="poster-export"
            onClick={() =>
              canvasRef.current &&
              downloadCanvas(canvasRef.current, `dazzle-poster-${props.seed.toLowerCase()}.png`)
            }
          >
            Export poster PNG
          </button>
        </aside>
        <div className={`poster-preview format-${format}`}>
          <canvas ref={canvasRef} aria-label="Generated Dazzle poster preview" />
        </div>
      </div>
    </section>
  );
}

type ArchiveType = "Plan" | "Photograph" | "Model" | "Artwork";

type ArchiveRecord = {
  id: string;
  title: string;
  vessel: string;
  year: string;
  country: "United Kingdom" | "United States" | "International";
  type: ArchiveType;
  institution: string;
  rights: string;
  source: string;
  image?: string;
  note: string;
};

const ARCHIVE_RECORDS: ArchiveRecord[] = [
  {
    id: "LOC-ARGUS-29186",
    title: "HMS Argus in dazzle camouflage",
    vessel: "HMS Argus",
    year: "1918",
    country: "United Kingdom",
    type: "Photograph",
    institution: "Library of Congress",
    rights: "No known restrictions",
    source: "https://www.loc.gov/pictures/item/2014709344/",
    image: "https://cdn.loc.gov/service/pnp/ggbain/29100/29186v.jpg",
    note: "Early aircraft carrier photographed in a high-contrast dazzle scheme.",
  },
  {
    id: "LOC-MAURETANIA-27963",
    title: "RMS Mauretania returning troops",
    vessel: "RMS Mauretania",
    year: "1918",
    country: "United Kingdom",
    type: "Photograph",
    institution: "Library of Congress",
    rights: "No known restrictions",
    source: "https://www.loc.gov/pictures/item/2014708124/",
    image: "https://cdn.loc.gov/service/pnp/ggbain/27900/27963v.jpg",
    note: "Bain News Service view showing the liner in New York on 2 December 1918.",
  },
  {
    id: "NHHC-WAR-PENGUIN",
    title: "S.S. War Penguin evidence cluster",
    vessel: "S.S. War Penguin / Lakeport",
    year: "1918",
    country: "United Kingdom",
    type: "Plan",
    institution: "Naval History and Heritage Command",
    rights: "Verify item record",
    source:
      "https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/NH-94000/NH-94487.html",
    note: "Named-vessel cluster connecting a painted plan, photograph and later Lakeport identity.",
  },
  {
    id: "NHHC-TYPE-11-JX",
    title: "British Type 11 · Design JX",
    vessel: "Ministry Shipping Type 11",
    year: "1917",
    country: "United Kingdom",
    type: "Plan",
    institution: "Naval History and Heritage Command",
    rights: "U.S. Navy collection",
    source:
      "https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-/british-dazzle-camouflage-for-type-11--design-jx--ministry-shipp.html",
    note: "Gouache, pen and ink side-elevation study measuring roughly 9 × 36 inches.",
  },
  {
    id: "NHHC-TYPE-3-J",
    title: "Type 3 · Design J · Port",
    vessel: "U.S. Shipping Board Type 3",
    year: "1918",
    country: "United States",
    type: "Plan",
    institution: "Naval History and Heritage Command",
    rights: "U.S. Navy collection",
    source:
      "https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-/type-3-design-j-port-side-camouflage.html",
    note: "Bureau of Construction and Repair gouache plan for a port elevation.",
  },
  {
    id: "NHHC-TYPE-6-T-PORT",
    title: "Type 6 · Design T · Port",
    vessel: "U.S. Shipping Board Type 6",
    year: "1918",
    country: "United States",
    type: "Plan",
    institution: "Naval History and Heritage Command",
    rights: "U.S. Navy collection",
    source:
      "https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-/type-6-design-t-port-side-camouflage.html",
    note: "A grey, white, black, green and blue-grey plan with a strong asymmetric read.",
  },
  {
    id: "NHHC-TYPE-6-K-STARBOARD",
    title: "Type 6 · Design K · Starboard",
    vessel: "U.S. Shipping Board Type 6",
    year: "1918",
    country: "United States",
    type: "Plan",
    institution: "Naval History and Heritage Command",
    rights: "U.S. Navy collection",
    source:
      "https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-/type-6-design-k-starboard-side-camouflage.html",
    note: "Six-part technical plan documenting both broadside pattern and transition details.",
  },
  {
    id: "RISD-EFC-1020",
    title: "Emergency Fleet Corporation Design 1020",
    vessel: "EFC Design 1020",
    year: "1918",
    country: "United States",
    type: "Plan",
    institution: "RISD Digital Commons",
    rights: "Consult repository record",
    source: "https://digitalcommons.risd.edu/dazzleprints/",
    note: "A useful hull family for connecting ship construction type to camouflage plan.",
  },
  {
    id: "NARA-BRITISH-TEMPLATE",
    title: "Hand-painted British dazzle templates",
    vessel: "Multiple merchant types",
    year: "1917–18",
    country: "United Kingdom",
    type: "Model",
    institution: "U.S. National Archives",
    rights: "Public-domain federal record context",
    source:
      "https://unwritten-record.blogs.archives.gov/2017/09/05/now-you-see-me-now-you-still-see-me-hand-painted-british-dazzle-camouflage-templates-from-wwi/",
    note: "Painted miniature ship templates used to inspect patterns as dimensional objects.",
  },
  {
    id: "WADSWORTH-DAZZLE-SHIPS",
    title: "Dazzle-ships in Drydock at Liverpool",
    vessel: "Multiple vessels",
    year: "1919",
    country: "United Kingdom",
    type: "Artwork",
    institution: "National Gallery of Canada",
    rights: "Source record governs reuse",
    source: "https://www.gallery.ca/magazine/artists/dazzle-ships",
    note: "Edward Wadsworth translates the industrial scene into a Vorticist woodcut.",
  },
  {
    id: "LISMER-OLYMPIC",
    title: "Olympic with Returned Soldiers",
    vessel: "RMS Olympic",
    year: "1919",
    country: "International",
    type: "Artwork",
    institution: "Canadian war art context",
    rights: "Source record governs reuse",
    source: "https://www.warmuseum.ca/collections/artifact/1015690/",
    note: "A major artistic record of dazzle as monument, surface and national image.",
  },
  {
    id: "HMS-PRESIDENT-2014",
    title: "HMS President centenary commission",
    vessel: "HMS President",
    year: "2014",
    country: "United Kingdom",
    type: "Artwork",
    institution: "14–18 NOW",
    rights: "Contemporary commission",
    source: "https://www.1418now.org.uk/commissions/dazzle-ship-london/",
    note: "Tobias Rehberger’s contemporary re-dazzling separates tribute from reconstruction.",
  },
  {
    id: "MERSEY-PETER-BLAKE",
    title: "Everybody Razzle Dazzle",
    vessel: "Mersey Ferry Snowdrop",
    year: "2015",
    country: "United Kingdom",
    type: "Artwork",
    institution: "Liverpool Biennial / 14–18 NOW",
    rights: "Contemporary commission",
    source: "https://www.liverpoolmuseums.org.uk/artifact/everybody-razzle-dazzle",
    note: "Peter Blake’s pop translation makes the historical/contemporary boundary explicit.",
  },
  {
    id: "MOUNT-VERNON-PANORAMA",
    title: "USS Mount Vernon panorama",
    vessel: "USS Mount Vernon",
    year: "1918",
    country: "United States",
    type: "Photograph",
    institution: "Library of Congress",
    rights: "Consult item record",
    source:
      "https://blogs.loc.gov/picturethis/2021/10/new-research-guide-navigating-for-images-of-ships/",
    note: "Large crew panorama documenting a complete dazzle-painted troop transport.",
  },
  {
    id: "LOC-VICTORY-LOAN",
    title: "Invest in the Victory Liberty Loan",
    vessel: "Graphic vessel",
    year: "1919",
    country: "United States",
    type: "Artwork",
    institution: "Library of Congress",
    rights: "Consult item record",
    source: "https://www.loc.gov/pictures/item/96507107/",
    note: "A period poster showing how ship imagery moved from camouflage into mass communication.",
  },
  {
    id: "MODEL-MAURETANIA",
    title: "Mauretania dazzle comparison models",
    vessel: "RMS Mauretania",
    year: "1918",
    country: "United Kingdom",
    type: "Model",
    institution: "Naval History and Heritage Command",
    rights: "U.S. Navy collection",
    source: "https://www.history.navy.mil/search.html?q=DAZZLE&start=0",
    note: "Comparison models demonstrate why a three-dimensional evaluation belongs in the studio.",
  },
];

function PatternThumbnail({ pattern, index }: { pattern: PatternDocument; index: number }) {
  const clipId = `archive-ship-${index}`;
  return (
    <svg viewBox="0 0 720 360" role="img" aria-label="Procedural dazzle plan thumbnail">
      <defs>
        <clipPath id={clipId}>
          <path d="M20 130 L92 92 L596 92 Q680 94 706 150 L655 288 Q500 328 118 296 L45 240 Z" />
          <rect x="210" y="45" width="134" height="61" />
          <rect x="372" y="55" width="145" height="54" />
        </clipPath>
      </defs>
      <rect width="720" height="360" fill="#e9e5da" />
      <g clipPath={`url(#${clipId})`}>
        <rect width="720" height="360" fill={pattern.palette[1]} />
        {pattern.shapes.slice(0, 18).map((shape, shapeIndex) => (
          <polygon
            key={shapeIndex}
            points={shape.points.map(([x, y]) => `${x * 720},${y * 360}`).join(" ")}
            fill={shape.color}
            opacity={shape.opacity ?? 1}
            transform={`translate(${(index % 3) * 18 - 18} ${(index % 2) * 10 - 5})`}
          />
        ))}
      </g>
      <path
        d="M20 130 L92 92 L596 92 Q680 94 706 150 L655 288 Q500 328 118 296 L45 240 Z"
        fill="none"
        stroke="#171914"
        strokeWidth="4"
      />
      <path d="M220 96 L205 18 M500 96 L512 26 M205 18 L512 26" stroke="#171914" strokeWidth="3" />
    </svg>
  );
}

export function ArchiveRoom(props: SharedProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ArchiveType | "All">("All");
  const [selected, setSelected] = useState(ARCHIVE_RECORDS[0]);
  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return ARCHIVE_RECORDS.filter((record) => {
      const typeMatch = type === "All" || record.type === type;
      const queryMatch =
        !needle ||
        `${record.title} ${record.vessel} ${record.institution} ${record.country}`
          .toLowerCase()
          .includes(needle);
      return typeMatch && queryMatch;
    });
  }, [query, type]);

  return (
    <section className="expansion-page archive-room-page">
      <div className="archive-hero">
        <div>
          <span className="eyebrow">Archive Room / Seed catalog 001–016</span>
          <h2>The evidence, connected.</h2>
        </div>
        <p>
          Plans, photographs, models and later artworks are grouped as vessel-centered evidence—not
          an uncredited mood board. Every record carries source and rights context.
        </p>
      </div>
      <div className="catalog-toolbar">
        <label>
          <span>Search catalog</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Vessel, plan, institution…"
          />
        </label>
        <div className="catalog-types" role="group" aria-label="Archive type">
          {(["All", "Plan", "Photograph", "Model", "Artwork"] as const).map((item) => (
            <button
              key={item}
              className={type === item ? "active" : ""}
              onClick={() => setType(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="catalog-count">{filtered.length} records visible</span>
      </div>

      <div className="archive-layout">
        <div className="catalog-grid">
          {filtered.map((record, index) => (
            <button
              className={`archive-card ${selected.id === record.id ? "selected" : ""}`}
              key={record.id}
              onClick={() => setSelected(record)}
            >
              <div className={`archive-image type-${record.type.toLowerCase()}`}>
                {record.image ? (
                  <img src={record.image} alt="" loading="lazy" />
                ) : (
                  <PatternThumbnail pattern={props.pattern} index={index} />
                )}
                <span>{record.type}</span>
              </div>
              <div className="archive-card-copy">
                <span>
                  {record.id} · {record.year}
                </span>
                <strong>{record.title}</strong>
                <small>{record.institution}</small>
              </div>
            </button>
          ))}
        </div>

        <aside className="archive-inspector">
          <span className="eyebrow">Selected record</span>
          <h3>{selected.title}</h3>
          <dl>
            <div>
              <dt>Vessel</dt>
              <dd>{selected.vessel}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{selected.year}</dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>{selected.country}</dd>
            </div>
            <div>
              <dt>Holding</dt>
              <dd>{selected.institution}</dd>
            </div>
            <div>
              <dt>Rights note</dt>
              <dd>{selected.rights}</dd>
            </div>
          </dl>
          <p>{selected.note}</p>
          <a href={selected.source} target="_blank" rel="noreferrer">
            Open source record ↗
          </a>
          <div className="evidence-status">
            <span />
            Human review required before publication reuse
          </div>
        </aside>
      </div>
    </section>
  );
}

export function FieldNotes(props: SharedProps) {
  const [distance, setDistance] = useState(38);
  const scale = 1 - distance * 0.0058;
  const blur = distance * 0.055;
  return (
    <section className="expansion-page learn-page">
      <div className="learn-hero">
        <span className="eyebrow">Field Notes / Why dazzle worked</span>
        <h2>Do not hide the ship.<br />Break the estimate.</h2>
        <p>
          Dazzle was built to interfere with an observer’s reading of course, speed, range and
          vessel type. It was an optical targeting problem, not invisibility.
        </p>
      </div>

      <div className="distance-lab">
        <div className="distance-copy">
          <span className="eyebrow">Distance test</span>
          <h3>{distance < 32 ? "Structure is legible" : distance < 68 ? "Course cues begin to conflict" : "Silhouette collapses into value masses"}</h3>
          <p>
            Move the observer away. Fine detail disappears first; the large directional masses
            remain and continue to compete with the vessel’s real geometry.
          </p>
          <label>
            <span>Observer distance</span>
            <input
              type="range"
              min="0"
              max="100"
              value={distance}
              onChange={(event) => setDistance(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="distance-view">
          <div
            className="distance-ship"
            style={{ filter: `blur(${blur}px)`, transform: `scale(${scale})` }}
          >
            <PatternThumbnail pattern={props.pattern} index={2} />
          </div>
          <div className="range-lines" aria-hidden="true" />
          <span>{Math.round(400 + distance * 26)} m simulated</span>
        </div>
      </div>

      <div className="truth-modes">
        <article>
          <span>01 / Reconstruction</span>
          <h3>Archive reconstruction</h3>
          <p>
            One named vessel, one documented side, one traceable plan. No invented pattern claims.
          </p>
        </article>
        <article>
          <span>02 / System</span>
          <h3>Historically informed</h3>
          <p>
            Period rules guide new deterministic schemes while the interface states what is inferred.
          </p>
        </article>
        <article>
          <span>03 / Art</span>
          <h3>Contemporary response</h3>
          <p>
            Helvetica, halftone, gradients and pattern spill become deliberate translations, clearly labeled.
          </p>
        </article>
      </div>

      <section className="mapping-note">
        <div>
          <span className="eyebrow">3D mapping method</span>
          <h2>Geometry decides where paint belongs.</h2>
        </div>
        <div className="mapping-flow">
          <article>
            <strong>Surface normals</strong>
            <p>Side-facing normals receive port or starboard fields; upward normals keep deck material.</p>
          </article>
          <span>→</span>
          <article>
            <strong>Object-space projection</strong>
            <p>The longest axis becomes vessel length, so imported GLB geometry does not need authored UVs.</p>
          </article>
          <span>→</span>
          <article>
            <strong>Silhouette SDF</strong>
            <p>A 2D signed-distance field controls poster spill, edge bands and mask expansion.</p>
          </article>
        </div>
      </section>

      <div className="source-ledger">
        <span className="eyebrow">Start with primary records</span>
        <a href="https://www.loc.gov/pictures/collection/ggbain/" target="_blank" rel="noreferrer">
          Library of Congress / Bain Collection ↗
        </a>
        <a
          href="https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-.html"
          target="_blank"
          rel="noreferrer"
        >
          Naval History and Heritage Command ↗
        </a>
        <a href="https://digitalcommons.risd.edu/dazzleprints/" target="_blank" rel="noreferrer">
          RISD / U.S. Shipping Board plans ↗
        </a>
      </div>
    </section>
  );
}
