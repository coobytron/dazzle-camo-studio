"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type * as THREE from "three";
import type { OrbitControls as OrbitControlsInstance } from "three/examples/jsm/controls/OrbitControls.js";
import {
  ArchiveRoom,
  FieldNotes,
  PosterPress,
  type StudioSection,
} from "./dazzle-expansion";

type ThreeModule = typeof import("three");

let threeModulePromise: Promise<ThreeModule> | null = null;

function loadThree() {
  threeModulePromise ??= import("three");
  return threeModulePromise;
}

type Side = "port" | "starboard";
type Environment = "studio" | "sea" | "periscope" | "value";
type MobileView = "plan" | "ship";
type WorkspaceView = "compose" | "split" | "ship";
type PlanMode = "elevation" | "field";
type TreatmentMode = "archive" | "expanded";
type VesselClass = "merchant" | "destroyer" | "battlecruiser" | "carrier";
type PatternFamily =
  | "broadside"
  | "splinter"
  | "broken"
  | "stepped"
  | "radiating"
  | "counter"
  | "reversal"
  | "perspective"
  | "mixed";
type HalftoneStyle = "dots" | "lines" | "crosshatch";
type HalftoneGradient = "linear" | "radial" | "vignette" | "noise";

type DazzleSpec = {
  seed: string;
  preset: PresetId;
  family: PatternFamily;
  treatment: TreatmentMode;
  side: Side;
  scale: number;
  density: number;
  direction: number;
  fragmentation: number;
  curvature: number;
  angularity: number;
  asymmetry: number;
  overlap: number;
  edgeBreak: number;
  fineDetail: number;
  waterline: number;
  contrast: number;
  bowAmbiguity: number;
  superstructure: number;
  paintCount: number;
  showMasses: boolean;
  showBands: boolean;
  showCuts: boolean;
  halftoneEnabled: boolean;
  halftoneStyle: HalftoneStyle;
  halftoneGradient: HalftoneGradient;
  halftoneScale: number;
  halftoneDensity: number;
  halftoneAngle: number;
  halftoneJitter: number;
  printTexture: number;
  autoRotate: boolean;
  environment: Environment;
  vessel: VesselClass;
};

type PresetId = "type14" | "type17" | "type10" | "type11";

type Preset = {
  id: PresetId;
  name: string;
  shortName: string;
  origin: string;
  colors: string[];
  family: PatternFamily;
  direction: number;
  scale: number;
  fragmentation: number;
  curvature: number;
  bowAmbiguity: number;
  note: string;
};

type PatternShape = {
  points: Array<[number, number]>;
  color: string;
  kind: "mass" | "band" | "anchor" | "curve" | "wedge" | "step" | "cut";
  opacity?: number;
};

type PatternDocument = {
  shapes: PatternShape[];
  palette: string[];
  majorMasses: number;
  secondaryMarks: number;
  dominantAngle: number;
  family: PatternFamily;
};

type ExportHandle = {
  exportPNG: () => void;
};

const PRESETS: Record<PresetId, Preset> = {
  type14: {
    id: "type14",
    name: "British Type 14 · Design E study",
    shortName: "Type 14 E",
    origin: "United Kingdom · 1917–18",
    colors: ["#111315", "#e7e3d6", "#91a2ac", "#83876c", "#5873a8"],
    family: "broadside",
    direction: 35,
    scale: 66,
    fragmentation: 38,
    curvature: 42,
    bowAmbiguity: 78,
    note: "Broad obliques, olive-blue masses and strong bridge interruption.",
  },
  type17: {
    id: "type17",
    name: "British Type 17 · Design B study",
    shortName: "Type 17 B",
    origin: "United Kingdom · 1918",
    colors: ["#111315", "#b7b6aa", "#c77e70", "#627ead", "#e7e3d6"],
    family: "stepped",
    direction: -32,
    scale: 58,
    fragmentation: 50,
    curvature: 34,
    bowAmbiguity: 68,
    note: "Muted pink and blue fields with stepped, disruptive transitions.",
  },
  type10: {
    id: "type10",
    name: "U.S. Type 10 · Design C study",
    shortName: "U.S. 10 C",
    origin: "United States · 1918",
    colors: ["#111315", "#e7e3d6", "#9baab0", "#627ca7", "#6e7677"],
    family: "broken",
    direction: 22,
    scale: 72,
    fragmentation: 30,
    curvature: 18,
    bowAmbiguity: 84,
    note: "Block-led Bureau scheme with a restrained blue-grey paint set.",
  },
  type11: {
    id: "type11",
    name: "U.S. Type 11 · Design D study",
    shortName: "U.S. 11 D",
    origin: "United States · 1918",
    colors: ["#111315", "#ddd9ce", "#7e8970", "#c3a5a1", "#7f8c9a"],
    family: "perspective",
    direction: -20,
    scale: 62,
    fragmentation: 44,
    curvature: 24,
    bowAmbiguity: 72,
    note: "Grey-pink and green masses derived from Shipping Board plans.",
  },
};

const DEFAULT_SPEC: DazzleSpec = {
  seed: "WILKINSON-1917",
  preset: "type14",
  family: PRESETS.type14.family,
  treatment: "archive",
  side: "port",
  scale: PRESETS.type14.scale,
  density: 56,
  direction: PRESETS.type14.direction,
  fragmentation: PRESETS.type14.fragmentation,
  curvature: PRESETS.type14.curvature,
  angularity: 72,
  asymmetry: 68,
  overlap: 42,
  edgeBreak: 64,
  fineDetail: 28,
  waterline: 74,
  contrast: 88,
  bowAmbiguity: PRESETS.type14.bowAmbiguity,
  superstructure: 74,
  paintCount: 5,
  showMasses: true,
  showBands: true,
  showCuts: true,
  halftoneEnabled: false,
  halftoneStyle: "dots",
  halftoneGradient: "linear",
  halftoneScale: 44,
  halftoneDensity: 58,
  halftoneAngle: 26,
  halftoneJitter: 8,
  printTexture: 0,
  autoRotate: true,
  environment: "sea",
  vessel: "merchant",
};

const VESSEL_INFO: Record<
  VesselClass,
  { label: string; era: string; note: string }
> = {
  merchant: {
    label: "EFC merchant steamer",
    era: "1917–1919",
    note: "Emergency Fleet Corporation proportions with two holds and central machinery.",
  },
  destroyer: {
    label: "V/W-type destroyer study",
    era: "1917–1918",
    note: "A low, narrow military silhouette with compact upperworks and gun positions.",
  },
  battlecruiser: {
    label: "Admiral-class study",
    era: "1916–1920",
    note: "Long capital-ship proportions with large turrets and a high visual mass.",
  },
  carrier: {
    label: "HMS Argus study",
    era: "1918",
    note: "Early flush-deck carrier proportions derived from a converted liner hull.",
  },
};

const FAMILY_INFO: Record<
  PatternFamily,
  { label: string; archive: boolean; note: string }
> = {
  broadside: {
    label: "Broadside blocks",
    archive: true,
    note: "Large silhouette-breaking masses crossed by broad oblique bands.",
  },
  splinter: {
    label: "Splinter wedges",
    archive: true,
    note: "Triangular wedges and hard counter-angles fracture the hull reading.",
  },
  broken: {
    label: "Broken diagonals",
    archive: true,
    note: "Interrupted diagonal runs create conflicting course cues.",
  },
  stepped: {
    label: "Stepped cubist",
    archive: true,
    note: "Block-led, stair-stepped transitions inspired by surviving plan studies.",
  },
  radiating: {
    label: "Radiating wedges",
    archive: true,
    note: "Converging wedges exaggerate false perspective around bow and bridge.",
  },
  counter: {
    label: "Counter-rhythm",
    archive: true,
    note: "Alternating stripe rhythms break continuity across deck and waterline.",
  },
  reversal: {
    label: "Bow reversal",
    archive: true,
    note: "Dark and light anchors relocate the apparent bow and wake.",
  },
  perspective: {
    label: "False perspective",
    archive: true,
    note: "Converging planes imply misleading scale, heading and superstructure.",
  },
  mixed: {
    label: "Mixed scheme",
    archive: true,
    note: "Controlled hybrid of masses, wedges, bands and stepped cuts.",
  },
};

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const parsed = Number.parseInt(value, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function adjustContrast(color: string, contrast: number, valueMode = false) {
  const rgb = hexToRgb(color);
  const amount = 0.35 + contrast / 100;
  let r = 128 + (rgb.r - 128) * amount;
  let g = 128 + (rgb.g - 128) * amount;
  let b = 128 + (rgb.b - 128) * amount;
  if (valueMode) {
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    r = luminance;
    g = luminance;
    b = luminance;
  }
  return rgbToHex(r, g, b);
}

function buildPattern(spec: DazzleSpec, side: Side): PatternDocument {
  const preset = PRESETS[spec.preset];
  const random = mulberry32(hashString(`${spec.seed}/${side}/v2/${spec.family}`));
  const palette = preset.colors
    .slice(0, Math.max(2, spec.paintCount))
    .map((color) => adjustContrast(color, spec.contrast, spec.environment === "value"));
  const shapes: PatternShape[] = [];
  const direction = side === "starboard" ? -spec.direction * 0.82 : spec.direction;
  const slope = Math.tan((direction * Math.PI) / 180);
  const density = 0.72 + spec.density / 90;
  const overlap = spec.overlap / 100;
  const angularity = spec.angularity / 100;
  const asymmetry = (spec.asymmetry - 50) / 240;
  let majorMasses = 0;
  let secondaryMarks = 0;
  const colorFor = (index: number, offset = 0) =>
    palette[(index + offset + Math.floor(random() * palette.length)) % palette.length];
  const push = (
    points: Array<[number, number]>,
    color: string,
    kind: PatternShape["kind"],
    opacity = 1,
  ) => {
    shapes.push({ points, color, kind, opacity });
    if (kind === "mass" || kind === "band" || kind === "wedge" || kind === "step") {
      majorMasses += 1;
    } else {
      secondaryMarks += 1;
    }
  };

  const addMasses = (baseCount: number, stepped = false) => {
    if (!spec.showMasses) return;
    const count = Math.max(2, Math.round(baseCount * density));
    for (let i = 0; i < count; i += 1) {
      const centerX = clamp(random() + (i % 2 === 0 ? asymmetry : -asymmetry), -0.08, 1.08);
      const centerY = 0.04 + random() * 0.92;
      const width =
        0.1 +
        random() * (0.12 + (100 - spec.scale) / 300) +
        overlap * 0.075;
      const height =
        0.12 +
        random() * (0.18 + spec.fragmentation / 300) +
        overlap * 0.055;
      const skew = (random() - 0.5) * (0.12 + angularity * 0.18) + slope * 0.07;
      if (stepped) {
        const notch = 0.18 + random() * 0.34;
        push(
          [
            [centerX - width * 0.62, centerY - height * 0.52],
            [centerX + width * notch, centerY - height * 0.52],
            [centerX + width * notch, centerY - height * 0.12 + skew],
            [centerX + width * 0.72, centerY - height * 0.12 + skew],
            [centerX + width * 0.72, centerY + height * 0.56],
            [centerX - width * 0.25, centerY + height * 0.56],
            [centerX - width * 0.25, centerY + height * 0.18],
            [centerX - width * 0.62, centerY + height * 0.18],
          ],
          colorFor(i, 2),
          "step",
        );
      } else {
        const points: Array<[number, number]> = [
          [centerX - width * 0.58, centerY - height * 0.52],
          [centerX + width * 0.48, centerY - height * 0.5 + skew],
          [centerX + width * (0.7 + random() * 0.32), centerY + height * 0.1],
          [centerX + width * 0.3, centerY + height * 0.58],
          [centerX - width * 0.68, centerY + height * 0.34 - skew],
        ];
        if (random() < spec.edgeBreak / 110) {
          points.splice(3, 0, [centerX + width * 0.02, centerY + height * (0.05 + random() * 0.18)]);
        }
        push(points, colorFor(i, 2), "mass");
      }
    }
  };

  const addBands = (baseCount: number, broken = false, counter = false) => {
    if (!spec.showBands) return;
    const count = Math.max(2, Math.round(baseCount * density));
    for (let i = 0; i < count; i += 1) {
      const width = 0.055 + random() * 0.095 + overlap * 0.04;
      const y = 0.02 + random() * 0.9;
      const segmentStart = broken ? -0.08 + random() * 0.46 : -0.14 + random() * 0.12;
      const segmentLength = broken ? 0.36 + random() * 0.48 : 0.88 + random() * 0.38;
      const x0 = segmentStart;
      const x1 = segmentStart + segmentLength;
      const counterSlope = counter && i % 2 === 1 ? -slope * 0.8 : slope;
      const y1 = y + counterSlope * (x1 - x0) * (0.24 + angularity * 0.2);
      const breakInset = broken ? (random() - 0.5) * 0.08 : 0;
      push(
        [
          [x0, y],
          [x1, y1],
          [x1 + 0.05 + random() * 0.12, y1 + width],
          [x0 - 0.04 + breakInset, y + width * (0.82 + random() * 0.38)],
        ],
        colorFor(i, 1),
        "band",
      );
    }
  };

  const addWedges = (baseCount: number, radiating = false) => {
    if (!spec.showMasses) return;
    const count = Math.max(2, Math.round(baseCount * density));
    const bowAtRight = side === "port";
    const originX = radiating
      ? bowAtRight
        ? 0.82 + random() * 0.12
        : 0.18 - random() * 0.12
      : 0.2 + random() * 0.6;
    const originY = 0.18 + random() * 0.58;
    for (let i = 0; i < count; i += 1) {
      const span = 0.16 + random() * (0.24 + spec.scale / 280);
      const angle = ((direction + (random() - 0.5) * (42 + spec.angularity * 0.5)) * Math.PI) / 180;
      const tipX = radiating ? originX : random();
      const tipY = radiating ? originY : 0.08 + random() * 0.84;
      const dx = Math.cos(angle) * span;
      const dy = Math.sin(angle) * span;
      const breadth = 0.07 + random() * (0.11 + spec.fragmentation / 520);
      push(
        [
          [tipX, tipY],
          [tipX - dx + Math.sin(angle) * breadth, tipY - dy - Math.cos(angle) * breadth],
          [tipX - dx * (1.12 + overlap * 0.3), tipY - dy * (1.12 + overlap * 0.3)],
          [tipX - dx - Math.sin(angle) * breadth, tipY - dy + Math.cos(angle) * breadth],
        ],
        colorFor(i, 1),
        "wedge",
      );
    }
  };

  switch (spec.family) {
    case "splinter":
      addMasses(4);
      addWedges(10);
      break;
    case "broken":
      addMasses(5);
      addBands(7, true);
      break;
    case "stepped":
      addMasses(9, true);
      addBands(3, true);
      break;
    case "radiating":
      addMasses(3);
      addWedges(12, true);
      break;
    case "counter":
      addMasses(4);
      addBands(9, false, true);
      break;
    case "reversal":
      addMasses(6);
      addWedges(7, true);
      break;
    case "perspective":
      addMasses(4, true);
      addWedges(9, true);
      addBands(3, true);
      break;
    case "mixed":
      addMasses(6);
      addMasses(3, true);
      addBands(4, true, true);
      addWedges(5, true);
      break;
    case "broadside":
    default:
      addMasses(8);
      addBands(5);
      break;
  }

  const bowAtRight = side === "port";
  const bowX = bowAtRight ? 1.03 : -0.03;
  const inwardX = bowAtRight ? 0.7 : 0.3;
  const bowHeight = 0.2 + spec.bowAmbiguity / 250;
  push(
    [
      [bowX, 0.03],
      [inwardX, 0.12],
      [bowAtRight ? 0.82 : 0.18, 0.48],
      [inwardX + (bowAtRight ? -0.08 : 0.08), bowHeight],
      [bowX, 0.82],
    ],
    palette[0],
    "anchor",
  );

  push(
    [
      [bowAtRight ? 0.02 : 0.98, 0.1],
      [bowAtRight ? 0.31 : 0.69, 0.27],
      [bowAtRight ? 0.24 : 0.76, 0.72],
      [bowAtRight ? -0.03 : 1.03, 0.9],
    ],
    palette[Math.min(1, palette.length - 1)],
    "anchor",
  );

  if (spec.showBands && spec.waterline > 8) {
    const waterY = 0.68 + (random() - 0.5) * 0.1;
    const breakAmount = 0.08 + spec.waterline / 420;
    push(
      [
        [-0.05, waterY],
        [0.34, waterY - breakAmount],
        [0.56, waterY + breakAmount * 0.52],
        [1.05, waterY - breakAmount * 0.38],
        [1.05, waterY + 0.045],
        [0.54, waterY + breakAmount * 0.94],
        [0.31, waterY - breakAmount * 0.42],
        [-0.05, waterY + 0.07],
      ],
      palette[(spec.family === "reversal" ? 0 : 2) % palette.length],
      "anchor",
    );
  }

  if (spec.curvature > 16) {
    const waveX = bowAtRight ? 0.72 : 0.08;
    const width = 0.19 + spec.bowAmbiguity / 500;
    const segments = 12;
    const outer: Array<[number, number]> = [];
    const inner: Array<[number, number]> = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const x = waveX + t * width;
      const arc = Math.sin(t * Math.PI);
      outer.push([x, 0.72 - arc * (0.32 + spec.curvature / 400)]);
      inner.unshift([x, 0.82 - arc * (0.2 + spec.curvature / 600)]);
    }
    push(
      bowAtRight ? [...outer, ...inner] : [...outer, ...inner].map(([x, y]) => [1 - x, y]),
      palette[Math.min(1, palette.length - 1)],
      "curve",
    );
  }

  if (spec.showCuts) {
    const cutCount = Math.round((2 + spec.fineDetail / 9) * density);
    for (let i = 0; i < cutCount; i += 1) {
      const x = random();
      const y = 0.05 + random() * 0.88;
      const length = 0.035 + random() * (0.055 + spec.fineDetail / 700);
      const width = 0.012 + random() * 0.035;
      const angle = ((direction * (i % 2 === 0 ? -0.7 : 0.5) + (random() - 0.5) * 70) * Math.PI) / 180;
      const dx = Math.cos(angle) * length;
      const dy = Math.sin(angle) * length;
      push(
        [
          [x - dx, y - dy],
          [x + dx, y + dy],
          [x + dx - Math.sin(angle) * width, y + dy + Math.cos(angle) * width],
          [x - dx - Math.sin(angle) * width, y - dy + Math.cos(angle) * width],
        ],
        colorFor(i, 3),
        "cut",
        0.84,
      );
    }
  }

  if (spec.showBands && spec.superstructure > 5) {
    const upperCount = Math.round(1 + spec.superstructure / 24);
    for (let i = 0; i < upperCount; i += 1) {
      const x = 0.22 + random() * 0.52;
      const y = 0.01 + random() * 0.22;
      const width = 0.08 + random() * 0.16;
      const rake = (0.05 + spec.superstructure / 520) * (i % 2 === 0 ? -1 : 1);
      push(
        [
          [x - width * 0.5, y],
          [x + width * 0.5, y + rake],
          [x + width * 0.42, y + 0.12 + rake],
          [x - width * 0.58, y + 0.12],
        ],
        colorFor(i, 1),
        "cut",
      );
    }
  }

  return {
    shapes,
    palette,
    majorMasses,
    secondaryMarks,
    dominantAngle: Math.round(direction),
    family: spec.family,
  };
}

function polygonPath(
  context: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  width: number,
  height: number,
) {
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x * width, y * height);
    else context.lineTo(x * width, y * height);
  });
  context.closePath();
}

function drawPattern(
  context: CanvasRenderingContext2D,
  document: PatternDocument,
  spec: DazzleSpec,
  width: number,
  height: number,
) {
  context.fillStyle = document.palette[Math.min(1, document.palette.length - 1)];
  context.fillRect(0, 0, width, height);
  document.shapes.forEach((shape) => {
    polygonPath(context, shape.points, width, height);
    context.fillStyle = shape.color;
    context.globalAlpha = shape.opacity ?? 1;
    context.fill();
  });
  context.globalAlpha = 1;

  if (spec.treatment === "expanded" && spec.halftoneEnabled) {
    const angle = (spec.halftoneAngle * Math.PI) / 180;
    const cell = Math.max(9, 31 - spec.halftoneScale * 0.22);
    const diagonal = Math.hypot(width, height);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const random = mulberry32(hashString(`${spec.seed}/halftone/${spec.side}`));
    const gradientValue = (x: number, y: number) => {
      const nx = x / width;
      const ny = y / height;
      if (spec.halftoneGradient === "radial") {
        return clamp(1 - Math.hypot(nx - 0.5, (ny - 0.5) * 1.35) * 1.55, 0, 1);
      }
      if (spec.halftoneGradient === "vignette") {
        return clamp(Math.hypot(nx - 0.5, (ny - 0.5) * 1.25) * 1.8, 0, 1);
      }
      if (spec.halftoneGradient === "noise") {
        const field =
          Math.sin(nx * 11.7 + Math.cos(ny * 7.1) * 2.4) * 0.28 +
          Math.cos(ny * 9.3 - nx * 4.2) * 0.22;
        return clamp(0.5 + field, 0, 1);
      }
      const directional = nx * Math.cos(angle) + ny * Math.sin(angle);
      return clamp(directional * 0.9 + 0.05, 0, 1);
    };
    const density = spec.halftoneDensity / 100;
    const jitterAmount = (spec.halftoneJitter / 100) * cell * 0.65;
    const ink = document.palette[0];

    const drawScreen = (rotation: number, lineMode: boolean) => {
      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);
      context.fillStyle = ink;
      context.globalAlpha = 0.22 + density * 0.58;
      for (let y = -diagonal; y <= diagonal; y += cell) {
        for (let x = -diagonal; x <= diagonal; x += cell) {
          const cos = Math.cos(rotation);
          const sin = Math.sin(rotation);
          const screenX = centerX + x * cos - y * sin;
          const screenY = centerY + x * sin + y * cos;
          if (screenX < -cell || screenX > width + cell || screenY < -cell || screenY > height + cell) {
            continue;
          }
          const tone = gradientValue(screenX, screenY);
          const jitterX = (random() - 0.5) * jitterAmount;
          const jitterY = (random() - 0.5) * jitterAmount;
          if (lineMode) {
            const thickness = Math.max(0.7, cell * (0.04 + tone * 0.32) * density);
            context.fillRect(
              x - cell * 0.48 + jitterX,
              y - thickness * 0.5 + jitterY,
              cell * 0.96,
              thickness,
            );
          } else {
            const radius = Math.max(0.55, cell * (0.05 + tone * 0.4) * density);
            context.beginPath();
            context.arc(x + jitterX, y + jitterY, radius, 0, Math.PI * 2);
            context.fill();
          }
        }
      }
      context.restore();
    };

    if (spec.halftoneStyle === "dots") {
      drawScreen(angle, false);
    } else {
      drawScreen(angle, true);
      if (spec.halftoneStyle === "crosshatch") {
        drawScreen(angle + Math.PI / 2, true);
      }
    }
    context.globalAlpha = 1;
  }

  if (spec.treatment === "expanded" && spec.printTexture > 0) {
    const random = mulberry32(hashString(`${spec.seed}/print/${document.family}`));
    const markCount = Math.round(120 + spec.printTexture * 15);
    context.save();
    context.globalCompositeOperation = "multiply";
    for (let i = 0; i < markCount; i += 1) {
      const x = random() * width;
      const y = random() * height;
      const size = 0.35 + random() * (0.7 + spec.printTexture / 36);
      context.globalAlpha = (0.015 + random() * 0.05) * (spec.printTexture / 35);
      context.fillStyle = random() > 0.32 ? document.palette[0] : document.palette[1];
      context.fillRect(x, y, size, size * (0.45 + random()));
    }
    context.restore();
  }
}

function getShipMask(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.beginPath();
  context.moveTo(x + width * 0.015, y + height * 0.29);
  context.lineTo(x + width * 0.13, y + height * 0.18);
  context.lineTo(x + width * 0.82, y + height * 0.18);
  context.quadraticCurveTo(
    x + width * 0.95,
    y + height * 0.19,
    x + width * 0.985,
    y + height * 0.37,
  );
  context.lineTo(x + width * 0.91, y + height * 0.79);
  context.quadraticCurveTo(
    x + width * 0.74,
    y + height * 0.94,
    x + width * 0.2,
    y + height * 0.86,
  );
  context.lineTo(x + width * 0.06, y + height * 0.64);
  context.closePath();
  context.rect(x + width * 0.26, y + height * 0.01, width * 0.19, height * 0.22);
  context.rect(x + width * 0.49, y + height * 0.04, width * 0.19, height * 0.2);
}

function renderPlanBoard(
  canvas: HTMLCanvasElement,
  spec: DazzleSpec,
  document: PatternDocument,
  mode: PlanMode = "elevation",
  scale = 1,
) {
  const width = Math.round(1280 * scale);
  const height = Math.round(720 * scale);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;

  const ivory = spec.environment === "value" ? "#e7e7e2" : "#e9e5da";
  const ink = "#171914";
  context.fillStyle = ivory;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(23,25,20,.10)";
  context.lineWidth = Math.max(1, scale);
  const grid = 40 * scale;
  for (let x = 0; x <= width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  if (mode === "field") {
    const fieldX = width * 0.036;
    const fieldY = height * 0.16;
    const fieldW = width * 0.928;
    const fieldH = height * 0.7;
    context.save();
    context.translate(fieldX, fieldY);
    context.beginPath();
    context.rect(0, 0, fieldW, fieldH);
    context.clip();
    drawPattern(context, document, spec, fieldW, fieldH);
    context.restore();
    context.strokeStyle = ink;
    context.lineWidth = 2 * scale;
    context.strokeRect(fieldX, fieldY, fieldW, fieldH);

    context.save();
    context.strokeStyle = "rgba(243,240,231,.48)";
    context.lineWidth = Math.max(1, scale);
    context.setLineDash([8 * scale, 8 * scale]);
    [0.25, 0.5, 0.75].forEach((division) => {
      context.beginPath();
      context.moveTo(fieldX + fieldW * division, fieldY);
      context.lineTo(fieldX + fieldW * division, fieldY + fieldH);
      context.stroke();
    });
    context.beginPath();
    context.moveTo(fieldX, fieldY + fieldH * 0.5);
    context.lineTo(fieldX + fieldW, fieldY + fieldH * 0.5);
    context.stroke();
    context.restore();

    context.fillStyle = ink;
    context.font = `${13 * scale}px Helvetica, Arial, sans-serif`;
    context.textBaseline = "top";
    context.fillText("DAZZLE CAMOUFLAGE // 2D COMPOSITION FIELD", fieldX, height * 0.045);
    context.textAlign = "right";
    context.fillText(`${spec.side.toUpperCase()} SOURCE ARTWORK`, fieldX + fieldW, height * 0.045);
    context.font = `${10 * scale}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    context.fillStyle = "rgba(23,25,20,.72)";
    context.textAlign = "left";
    context.fillText(`PLAN ${spec.seed}`, fieldX, height * 0.1);
    context.fillText(
      `${FAMILY_INFO[spec.family].label.toUpperCase()} / ${spec.treatment.toUpperCase()} MODE`,
      fieldX + width * 0.25,
      height * 0.1,
    );
    context.textAlign = "right";
    context.fillText(
      `${document.majorMasses} MAJOR / ${document.secondaryMarks} SECONDARY`,
      fieldX + fieldW,
      height * 0.1,
    );
    context.textAlign = "left";
    context.fillText("FULL FIELD · SHIP MASK APPLIED IN ELEVATION + 3D", fieldX, height * 0.9);
    return;
  }

  const shipX = width * 0.055;
  const shipY = height * 0.24;
  const shipW = width * 0.89;
  const shipH = height * 0.53;

  context.save();
  getShipMask(context, shipX, shipY, shipW, shipH);
  context.clip("nonzero");
  context.save();
  context.translate(shipX, shipY);
  drawPattern(context, document, spec, shipW, shipH);
  context.restore();
  context.restore();

  context.save();
  context.strokeStyle = ink;
  context.lineWidth = 2.2 * scale;
  getShipMask(context, shipX, shipY, shipW, shipH);
  context.stroke();

  const mastColor = ink;
  context.strokeStyle = mastColor;
  context.lineWidth = 2 * scale;
  const mastXs = [0.31, 0.73];
  mastXs.forEach((position, index) => {
    const mx = shipX + shipW * position;
    const deckY = shipY + shipH * 0.19;
    context.beginPath();
    context.moveTo(mx, deckY);
    context.lineTo(mx + (index === 0 ? -0.025 : 0.015) * shipW, shipY - shipH * 0.34);
    context.stroke();
    context.beginPath();
    context.moveTo(mx, shipY - shipH * 0.21);
    context.lineTo(mx + (index === 0 ? 0.12 : -0.11) * shipW, deckY);
    context.stroke();
  });

  const funnelX = shipX + shipW * 0.53;
  context.save();
  context.translate(funnelX, shipY + shipH * 0.06);
  context.rotate((-6 * Math.PI) / 180);
  context.fillStyle = document.palette[Math.min(2, document.palette.length - 1)];
  context.fillRect(-shipW * 0.022, -shipH * 0.28, shipW * 0.055, shipH * 0.3);
  context.fillStyle = ink;
  context.fillRect(-shipW * 0.022, -shipH * 0.28, shipW * 0.055, shipH * 0.09);
  context.strokeStyle = ink;
  context.strokeRect(-shipW * 0.022, -shipH * 0.28, shipW * 0.055, shipH * 0.3);
  context.restore();
  context.restore();

  context.fillStyle = ink;
  context.font = `${13 * scale}px Helvetica, Arial, sans-serif`;
  context.textBaseline = "top";
  context.fillText("DAZZLE CAMOUFLAGE // PERIOD-CONSTRAINED STUDY", width * 0.036, height * 0.045);
  context.textAlign = "right";
  context.fillText(`${spec.side.toUpperCase()} ELEVATION`, width * 0.964, height * 0.045);
  context.textAlign = "left";

  context.font = `${10 * scale}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.fillStyle = "rgba(23,25,20,.72)";
  context.fillText(`PLAN ${spec.seed}`, width * 0.036, height * 0.09);
  context.fillText(`DOMINANT EDGE ${document.dominantAngle}°`, width * 0.036, height * 0.115);
  context.fillText(`${document.majorMasses} PRIMARY MASSES / ${document.palette.length} PAINTS`, width * 0.036, height * 0.14);
  context.textAlign = "right";
  context.fillText("WATERLINE 0.00", width * 0.964, height * 0.87);
  context.fillText("SCALE 1:200", width * 0.964, height * 0.895);
  context.textAlign = "left";

  const measureY = height * 0.91;
  context.strokeStyle = ink;
  context.lineWidth = scale;
  context.beginPath();
  context.moveTo(shipX, measureY);
  context.lineTo(shipX + shipW, measureY);
  context.stroke();
  [0, 0.25, 0.5, 0.75, 1].forEach((tick) => {
    const x = shipX + shipW * tick;
    context.beginPath();
    context.moveTo(x, measureY - 7 * scale);
    context.lineTo(x, measureY + 7 * scale);
    context.stroke();
  });
}

function renderPatternTexture(
  canvas: HTMLCanvasElement,
  document: PatternDocument,
  spec: DazzleSpec,
  width = 1536,
  height = 512,
) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  drawPattern(context, document, spec, width, height);
}

function supportsWebGL() {
  const probe = window.document.createElement("canvas");
  return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
}

function renderShipFallback(
  canvas: HTMLCanvasElement,
  spec: DazzleSpec,
  document: PatternDocument,
) {
  canvas.width = 1280;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) return;
  const valueMode = spec.environment === "value";
  const sky = valueMode ? "#d8d8d2" : spec.environment === "periscope" ? "#aeb5ad" : "#d8d4c8";
  const sea = valueMode ? "#70736f" : "#405d61";
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = sea;
  context.fillRect(0, 430, canvas.width, 290);

  context.strokeStyle = valueMode ? "rgba(255,255,255,.2)" : "rgba(213,232,228,.22)";
  context.lineWidth = 2;
  for (let y = 452; y < 720; y += 26) {
    context.beginPath();
    for (let x = -40; x <= 1320; x += 28) {
      const waveY = y + Math.sin(x * 0.022 + y * 0.01) * 5;
      if (x === -40) context.moveTo(x, waveY);
      else context.lineTo(x, waveY);
    }
    context.stroke();
  }

  const x = 118;
  const y = 286;
  const w = 1010;
  const h = 250;
  context.save();
  getShipMask(context, x, y, w, h);
  context.clip("nonzero");
  context.translate(x, y);
  drawPattern(context, document, spec, w, h);
  context.restore();
  context.strokeStyle = "#171914";
  context.lineWidth = 3;
  getShipMask(context, x, y, w, h);
  context.stroke();

  context.fillStyle = "#3f443c";
  context.fillRect(x + w * 0.12, y + h * 0.14, w * 0.72, 11);
  context.fillStyle = document.palette[Math.min(2, document.palette.length - 1)];
  context.fillRect(x + w * 0.28, y - 12, w * 0.18, 62);
  context.fillStyle = document.palette[Math.min(3, document.palette.length - 1)];
  context.fillRect(x + w * 0.5, y - 5, w * 0.18, 57);
  context.strokeStyle = "#171914";
  context.strokeRect(x + w * 0.28, y - 12, w * 0.18, 62);
  context.strokeRect(x + w * 0.5, y - 5, w * 0.18, 57);

  context.save();
  context.translate(x + w * 0.53, y - 10);
  context.rotate(-0.08);
  context.fillStyle = document.palette[Math.min(2, document.palette.length - 1)];
  context.fillRect(-23, -108, 49, 108);
  context.fillStyle = "#171914";
  context.fillRect(-23, -108, 49, 34);
  context.strokeRect(-23, -108, 49, 108);
  context.restore();

  context.strokeStyle = "#252922";
  context.lineWidth = 3;
  [
    [x + w * 0.31, y + 8],
    [x + w * 0.73, y + 8],
  ].forEach(([mx, my], index) => {
    context.beginPath();
    context.moveTo(mx, my);
    context.lineTo(mx + (index === 0 ? -10 : 9), my - 220);
    context.stroke();
  });
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(x + w * 0.3 - 10, y - 212);
  context.lineTo(x + w * 0.73 + 9, y - 212);
  context.stroke();

  context.fillStyle = "rgba(23,25,20,.72)";
  context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillText("STATIC COMPATIBILITY VIEW", 24, 32);
  context.textAlign = "right";
  context.fillText("WEBGL RESUMES WHEN GPU ACCESS IS AVAILABLE", 1256, 32);
  context.textAlign = "left";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadText(text: string, filename: string, type: string) {
  downloadBlob(new Blob([text], { type }), filename);
}

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeXML(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function exportPlanSVG(spec: DazzleSpec, document: PatternDocument) {
  const width = 1280;
  const height = 560;
  const x = 64;
  const y = 130;
  const w = 1152;
  const h = 310;
  const hull = `M ${x + w * 0.015} ${y + h * 0.29}
    L ${x + w * 0.13} ${y + h * 0.18}
    L ${x + w * 0.82} ${y + h * 0.18}
    Q ${x + w * 0.95} ${y + h * 0.19} ${x + w * 0.985} ${y + h * 0.37}
    L ${x + w * 0.91} ${y + h * 0.79}
    Q ${x + w * 0.74} ${y + h * 0.94} ${x + w * 0.2} ${y + h * 0.86}
    L ${x + w * 0.06} ${y + h * 0.64} Z`;
  const polygons = document.shapes
    .map((shape) => {
      const points = shape.points.map(([px, py]) => `${x + px * w},${y + py * h}`).join(" ");
      return `<polygon points="${points}" fill="${shape.color}" fill-opacity="${shape.opacity ?? 1}"/>`;
    })
    .join("");
  const screenCell = Math.max(8, 36 - spec.halftoneScale * 0.27);
  const screenWeight = Math.max(1, screenCell * (0.06 + (spec.halftoneDensity / 100) * 0.34));
  const screenMark =
    spec.halftoneStyle === "dots"
      ? `<circle cx="${screenCell / 2}" cy="${screenCell / 2}" r="${screenWeight}" fill="${document.palette[0]}"/>`
      : spec.halftoneStyle === "crosshatch"
        ? `<rect width="${screenCell}" height="${screenWeight}" y="${screenCell / 2 - screenWeight / 2}" fill="${document.palette[0]}"/><rect width="${screenWeight}" height="${screenCell}" x="${screenCell / 2 - screenWeight / 2}" fill="${document.palette[0]}"/>`
        : `<rect width="${screenCell}" height="${screenWeight}" y="${screenCell / 2 - screenWeight / 2}" fill="${document.palette[0]}"/>`;
  const gradientDefinition =
    spec.halftoneGradient === "radial"
      ? `<radialGradient id="tone"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient>`
      : spec.halftoneGradient === "vignette"
        ? `<radialGradient id="tone"><stop offset="0" stop-color="black"/><stop offset="1" stop-color="white"/></radialGradient>`
        : `<linearGradient id="tone" gradientTransform="rotate(${spec.halftoneAngle} .5 .5)"><stop offset="0" stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient>`;
  const halftone =
    spec.treatment === "expanded" && spec.halftoneEnabled
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#screen)" mask="url(#tone-mask)" opacity="${0.25 + spec.halftoneDensity / 180}"/>`
      : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <title>${escapeXML(PRESETS[spec.preset].name)} — ${spec.side} — ${escapeXML(spec.seed)}</title>
  <desc>${spec.treatment === "archive" ? "Archive-informed, period-constrained dazzle study." : "Expanded studio treatment with contemporary halftone effects."} Screen colors are approximate.</desc>
  <metadata>DAZZLE-V2 / ${spec.treatment.toUpperCase()} / ${spec.family.toUpperCase()}</metadata>
  <defs>
    <clipPath id="ship">
      <path d="${hull}"/>
      <rect x="${x + w * 0.26}" y="${y + h * 0.01}" width="${w * 0.19}" height="${h * 0.22}"/>
      <rect x="${x + w * 0.49}" y="${y + h * 0.04}" width="${w * 0.19}" height="${h * 0.20}"/>
    </clipPath>
    <pattern id="screen" width="${screenCell}" height="${screenCell}" patternUnits="userSpaceOnUse" patternTransform="rotate(${spec.halftoneAngle})">
      ${screenMark}
    </pattern>
    ${gradientDefinition}
    <mask id="tone-mask"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#tone)"/></mask>
  </defs>
  <g clip-path="url(#ship)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${document.palette[Math.min(1, document.palette.length - 1)]}"/>
    ${polygons}
    ${halftone}
  </g>
  <g fill="none" stroke="#111315" stroke-width="2">
    <path d="${hull}"/>
    <rect x="${x + w * 0.26}" y="${y + h * 0.01}" width="${w * 0.19}" height="${h * 0.22}"/>
    <rect x="${x + w * 0.49}" y="${y + h * 0.04}" width="${w * 0.19}" height="${h * 0.20}"/>
  </g>
  <g fill="#111315" font-family="Helvetica,Arial,sans-serif">
    <text x="64" y="58" font-size="18">DAZZLE CAMOUFLAGE // ${spec.treatment === "archive" ? "ARCHIVE-INFORMED STUDY" : "EXPANDED STUDIO TREATMENT"}</text>
    <text x="64" y="88" font-size="13">PLAN ${escapeXML(spec.seed)} · ${spec.side.toUpperCase()} · ${document.dominantAngle}° · ${document.palette.length} PAINTS</text>
  </g>
</svg>`;
  downloadText(svg, `dazzle-${safeFilename(spec.seed)}-${spec.side}.svg`, "image/svg+xml");
}

const PlanCanvas = forwardRef<
  ExportHandle,
  { spec: DazzleSpec; document: PatternDocument; mode: PlanMode }
>(function PlanCanvas({ spec, document, mode }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const fallbackRef = useRef(false);
  const specRef = useRef(spec);
  const documentRef = useRef(document);
  const modeRef = useRef(mode);
  const resetViewRef = useRef<() => void>(() => undefined);

  const render = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  useEffect(() => {
    specRef.current = spec;
    documentRef.current = document;
    modeRef.current = mode;
  }, [document, mode, spec]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    if (!supportsWebGL()) {
      fallbackRef.current = true;
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void loadThree()
      .then((THREE) => {
        if (cancelled) return;
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
        camera.position.z = 2;
        const source = window.document.createElement("canvas");
        sourceRef.current = source;
        renderPlanBoard(source, specRef.current, documentRef.current, modeRef.current);
        const texture = new THREE.CanvasTexture(source);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.125), material);
        scene.add(plane);
        rendererRef.current = renderer;
        materialRef.current = material;
        sceneRef.current = scene;
        cameraRef.current = camera;
        planeRef.current = plane;

        const resize = () => {
          const rect = host.getBoundingClientRect();
          renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
          const hostAspect = rect.width / Math.max(rect.height, 1);
          const artAspect = 16 / 9;
          if (hostAspect > artAspect) {
            plane.scale.set(artAspect / hostAspect, 1, 1);
          } else {
            plane.scale.set(1, hostAspect / artAspect, 1);
          }
          plane.position.set(0, 0, 0);
          renderer.render(scene, camera);
        };
        resetViewRef.current = resize;
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        resize();

        const onLost = (event: Event) => event.preventDefault();
        let pointerId: number | null = null;
        let lastX = 0;
        let lastY = 0;
        const onPointerDown = (event: PointerEvent) => {
          pointerId = event.pointerId;
          lastX = event.clientX;
          lastY = event.clientY;
          canvas.setPointerCapture(event.pointerId);
        };
        const onPointerMove = (event: PointerEvent) => {
          if (pointerId !== event.pointerId) return;
          const rect = host.getBoundingClientRect();
          plane.position.x += ((event.clientX - lastX) / Math.max(1, rect.width)) * 2;
          plane.position.y -= ((event.clientY - lastY) / Math.max(1, rect.height)) * 2;
          lastX = event.clientX;
          lastY = event.clientY;
          renderer.render(scene, camera);
        };
        const onPointerUp = (event: PointerEvent) => {
          if (pointerId === event.pointerId) pointerId = null;
        };
        const onWheel = (event: WheelEvent) => {
          event.preventDefault();
          const factor = Math.exp(-event.deltaY * 0.0012);
          const nextX = clamp(plane.scale.x * factor, 0.38, 4.5);
          const ratio = nextX / plane.scale.x;
          plane.scale.multiplyScalar(ratio);
          renderer.render(scene, camera);
        };
        const onDoubleClick = () => resize();
        canvas.addEventListener("webglcontextlost", onLost);
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);
        canvas.addEventListener("wheel", onWheel, { passive: false });
        canvas.addEventListener("dblclick", onDoubleClick);
        cleanup = () => {
          observer.disconnect();
          canvas.removeEventListener("webglcontextlost", onLost);
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerup", onPointerUp);
          canvas.removeEventListener("pointercancel", onPointerUp);
          canvas.removeEventListener("wheel", onWheel);
          canvas.removeEventListener("dblclick", onDoubleClick);
          plane.geometry.dispose();
          material.dispose();
          texture.dispose();
          renderer.dispose();
        };
      })
      .catch(() => {
        if (cancelled) return;
        fallbackRef.current = true;
        renderPlanBoard(canvas, specRef.current, documentRef.current, modeRef.current);
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    if (fallbackRef.current && canvasRef.current) {
      renderPlanBoard(canvasRef.current, spec, document, mode);
      return;
    }
    const source = sourceRef.current;
    const material = materialRef.current;
    if (!source || !material?.map) return;
    renderPlanBoard(source, spec, document, mode);
    material.map.needsUpdate = true;
    render();
  }, [document, mode, render, spec]);

  useImperativeHandle(
    ref,
    () => ({
      exportPNG: () => {
        const source = window.document.createElement("canvas");
        renderPlanBoard(source, spec, document, mode, 2);
        source.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, `dazzle-${safeFilename(spec.seed)}-${spec.side}-plan.png`);
          }
        }, "image/png");
      },
    }),
    [document, mode, spec],
  );

  return (
    <div className="canvas-host plan-host" ref={hostRef}>
      <canvas
        ref={canvasRef}
        aria-label={`${spec.side} dazzle camouflage ${mode === "field" ? "composition field" : "elevation plan"}; ${FAMILY_INFO[spec.family].label}; ${document.majorMasses} major forms`}
      />
      <button className="canvas-fit" onClick={() => resetViewRef.current()} aria-label="Fit 2D artwork">
        Fit
      </button>
      <div className="canvas-label">
        <span>01 / {mode === "field" ? "Composition field" : "Elevation plan"}</span>
        <span>Drag to pan · wheel to zoom · double-click to fit</span>
      </div>
    </div>
  );
});

function makeHullSideGeometry(THREE: ThreeModule) {
  const shape = new THREE.Shape();
  shape.moveTo(-5, 0.22);
  shape.lineTo(-4.35, 0.5);
  shape.lineTo(3.85, 0.5);
  shape.quadraticCurveTo(4.78, 0.45, 5, 0.05);
  shape.lineTo(4.2, -0.68);
  shape.quadraticCurveTo(1.2, -1.02, -3.8, -0.72);
  shape.lineTo(-5, -0.22);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 16);
  const position = geometry.attributes.position;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i += 1) {
    uv[i * 2] = (position.getX(i) + 5) / 10;
    uv[i * 2 + 1] = (position.getY(i) + 1.02) / 1.54;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function makeDeckGeometry(THREE: ThreeModule) {
  const shape = new THREE.Shape();
  shape.moveTo(-4.72, 0);
  shape.lineTo(-3.9, -0.64);
  shape.lineTo(3.85, -0.64);
  shape.lineTo(4.95, 0);
  shape.lineTo(3.85, 0.64);
  shape.lineTo(-3.9, 0.64);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function addRigging(
  THREE: ThreeModule,
  group: THREE.Group,
  points: Array<[number, number, number]>,
  color = 0x22251f,
) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.84 });
  const line = new THREE.Line(geometry, material);
  group.add(line);
}

function buildMerchantSteamer(
  THREE: ThreeModule,
  portMaterial: THREE.MeshStandardMaterial,
  starboardMaterial: THREE.MeshStandardMaterial,
  deckMaterial: THREE.MeshStandardMaterial,
) {
  const group = new THREE.Group();
  const hullGeometry = makeHullSideGeometry(THREE);
  const port = new THREE.Mesh(hullGeometry, portMaterial);
  port.position.z = 0.62;
  const starboard = new THREE.Mesh(hullGeometry.clone(), starboardMaterial);
  starboard.position.z = -0.62;
  starboard.rotation.y = Math.PI;
  starboard.scale.x = -1;
  group.add(port, starboard);

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x252922,
    roughness: 0.88,
    metalness: 0.02,
  });
  const core = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.55, 1.18), darkMaterial);
  core.position.set(-0.1, -0.22, 0);
  group.add(core);

  const deck = new THREE.Mesh(makeDeckGeometry(THREE), deckMaterial);
  deck.position.y = 0.51;
  group.add(deck);

  const sideMaterials: THREE.Material[] = [
    darkMaterial,
    darkMaterial,
    deckMaterial,
    darkMaterial,
    portMaterial,
    starboardMaterial,
  ];

  const aftHouse = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.78, 1.02), sideMaterials);
  aftHouse.position.set(-2.25, 0.89, 0);
  group.add(aftHouse);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.72, 1.06), sideMaterials);
  bridge.position.set(0.48, 0.9, 0);
  group.add(bridge);
  const bridgeTop = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.14, 1.24), deckMaterial);
  bridgeTop.position.set(0.48, 1.33, 0);
  group.add(bridgeTop);

  const funnelBlue = new THREE.MeshStandardMaterial({
    color: 0x7e8e98,
    roughness: 0.9,
    metalness: 0.01,
  });
  const funnelDark = new THREE.MeshStandardMaterial({
    color: 0x171915,
    roughness: 0.92,
    metalness: 0,
  });
  const funnel = new THREE.Group();
  const funnelBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 1.28, 20), funnelBlue);
  funnelBody.position.y = 0.42;
  const funnelCap = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.25, 0.38, 20), funnelDark);
  funnelCap.position.y = 1.18;
  funnel.add(funnelBody, funnelCap);
  funnel.position.set(-0.32, 1.32, 0);
  funnel.rotation.z = -0.075;
  group.add(funnel);

  const mastMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c3029,
    roughness: 0.8,
  });
  [
    [-2.85, 0.52],
    [2.2, 0.52],
  ].forEach(([x, y], index) => {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 3.2, 8), mastMaterial);
    mast.position.set(x, y + 1.4, 0);
    mast.rotation.z = index === 0 ? 0.035 : -0.025;
    group.add(mast);
  });

  const boatMaterial = new THREE.MeshStandardMaterial({
    color: 0xdad6c9,
    roughness: 0.9,
  });
  [-1.35, 1.45].forEach((x) => {
    [-0.55, 0.55].forEach((z) => {
      const boat = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.62, 4, 8), boatMaterial);
      boat.rotation.z = Math.PI / 2;
      boat.position.set(x, 1.02, z);
      boat.scale.set(1, 0.62, 0.72);
      group.add(boat);
    });
  });

  addRigging(THREE, group, [
    [-2.85, 3.4, 0],
    [-4.25, 0.55, 0],
  ]);
  addRigging(THREE, group, [
    [-2.85, 3.4, 0],
    [-0.55, 0.55, 0],
  ]);
  addRigging(THREE, group, [
    [2.2, 3.4, 0],
    [0.75, 0.55, 0],
  ]);
  addRigging(THREE, group, [
    [2.2, 3.4, 0],
    [4.2, 0.5, 0],
  ]);
  addRigging(THREE, group, [
    [-2.85, 3.4, 0],
    [2.2, 3.4, 0],
  ]);

  group.rotation.y = -0.28;
  group.position.y = -0.05;
  return group;
}

function addTurret(
  THREE: ThreeModule,
  group: THREE.Group,
  x: number,
  y: number,
  scale: number,
  material: THREE.Material,
) {
  const turret = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34 * scale, 0.42 * scale, 0.22 * scale, 16),
    material,
  );
  const house = new THREE.Mesh(
    new THREE.BoxGeometry(0.66 * scale, 0.25 * scale, 0.58 * scale),
    material,
  );
  house.position.y = 0.18 * scale;
  [-0.12, 0.12].forEach((z) => {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035 * scale, 0.045 * scale, 0.95 * scale, 8),
      material,
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(0.48 * scale, 0.25 * scale, z * scale);
    turret.add(barrel);
  });
  turret.add(base, house);
  turret.position.set(x, y, 0);
  group.add(turret);
}

function buildVesselStudy(
  THREE: ThreeModule,
  vessel: VesselClass,
  portMaterial: THREE.MeshStandardMaterial,
  starboardMaterial: THREE.MeshStandardMaterial,
  deckMaterial: THREE.MeshStandardMaterial,
) {
  const group = buildMerchantSteamer(THREE, portMaterial, starboardMaterial, deckMaterial);
  const gunMaterial = new THREE.MeshStandardMaterial({
    color: 0x31362f,
    roughness: 0.88,
    metalness: 0.03,
  });

  if (vessel === "destroyer") {
    group.scale.set(1.08, 0.72, 0.7);
    group.position.y = -0.13;
    addTurret(THREE, group, 3.6, 0.62, 0.62, gunMaterial);
    addTurret(THREE, group, -3.75, 0.62, 0.58, gunMaterial);
    [-0.52, 0.28].forEach((x) => {
      const funnel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.19, 0.92, 14),
        gunMaterial,
      );
      funnel.position.set(x, 1.45, 0);
      funnel.rotation.z = -0.08;
      group.add(funnel);
    });
  }

  if (vessel === "battlecruiser") {
    group.scale.set(1.24, 0.96, 1.15);
    group.position.y = -0.07;
    [-3.25, 2.55, 3.4].forEach((x, index) =>
      addTurret(THREE, group, x, 0.63, index === 0 ? 0.86 : 0.78, gunMaterial),
    );
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.22, 0.7), gunMaterial);
    tower.position.set(0.9, 1.52, 0);
    group.add(tower);
  }

  if (vessel === "carrier") {
    group.scale.set(1.08, 0.82, 1.02);
    group.position.y = -0.15;
    const flightDeck = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 0.16, 1.52),
      new THREE.MeshStandardMaterial({
        color: 0x353a34,
        roughness: 0.96,
        metalness: 0,
      }),
    );
    flightDeck.position.set(0.15, 1.52, 0);
    group.add(flightDeck);
    const island = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.6, 0.44), gunMaterial);
    island.position.set(1.2, 1.88, -0.54);
    group.add(island);
  }

  return group;
}

const ShipCanvas = forwardRef<
  ExportHandle,
  { spec: DazzleSpec; portDocument: PatternDocument; starboardDocument: PatternDocument }
>(function ShipCanvas({ spec, portDocument, starboardDocument }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const shipRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControlsInstance | null>(null);
  const threeRef = useRef<ThreeModule | null>(null);
  const portCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const starboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const portTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const starboardTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const waterRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null>(null);
  const animationRef = useRef<number | null>(null);
  const fallbackRef = useRef(false);
  const specRef = useRef(spec);
  const portDocumentRef = useRef(portDocument);
  const starboardDocumentRef = useRef(starboardDocument);
  const [modelStatus, setModelStatus] = useState("Built-in study · mapped UV field");

  useEffect(() => {
    specRef.current = spec;
  }, [spec]);

  useEffect(() => {
    portDocumentRef.current = portDocument;
    starboardDocumentRef.current = starboardDocument;
  }, [portDocument, starboardDocument]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    if (!supportsWebGL()) {
      fallbackRef.current = true;
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([
      loadThree(),
      import("three/examples/jsm/controls/OrbitControls.js"),
    ])
      .then(([THREE, { OrbitControls }]) => {
        if (cancelled) return;
        threeRef.current = THREE;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd8d4c8);
    scene.fog = new THREE.FogExp2(0xbac3c2, 0.018);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
    camera.position.set(9.4, 5.2, 11.8);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 7;
    controls.maxDistance = 24;
    controls.minPolarAngle = 0.42;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0.7, 0);
    controls.autoRotateSpeed = 0.42;

    const hemi = new THREE.HemisphereLight(0xf4f0e4, 0x45565c, 2.3);
    const key = new THREE.DirectionalLight(0xfff2d7, 3.4);
    key.position.set(-5, 9, 8);
    scene.add(hemi, key);

    const portCanvas = window.document.createElement("canvas");
    const starboardCanvas = window.document.createElement("canvas");
    portCanvasRef.current = portCanvas;
    starboardCanvasRef.current = starboardCanvas;
    renderPatternTexture(portCanvas, portDocumentRef.current, specRef.current);
    renderPatternTexture(starboardCanvas, starboardDocumentRef.current, specRef.current);
    const portTexture = new THREE.CanvasTexture(portCanvas);
    const starboardTexture = new THREE.CanvasTexture(starboardCanvas);
    [portTexture, starboardTexture].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    });
    portTextureRef.current = portTexture;
    starboardTextureRef.current = starboardTexture;

    const portMaterial = new THREE.MeshStandardMaterial({
      map: portTexture,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const starboardMaterial = new THREE.MeshStandardMaterial({
      map: starboardTexture,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const deckMaterial = new THREE.MeshStandardMaterial({
      color: 0x3f443c,
      roughness: 0.96,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const ship = buildVesselStudy(
      THREE,
      specRef.current.vessel,
      portMaterial,
      starboardMaterial,
      deckMaterial,
    );
    shipRef.current = ship;
    scene.add(ship);

    const waterMaterial = new THREE.ShaderMaterial({
      transparent: false,
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color(0x22383c) },
        uShallow: { value: new THREE.Color(0x71898a) },
      },
      vertexShader: `
        uniform float uTime;
        varying float vWave;
        varying vec2 vUv2;
        void main() {
          vec3 p = position;
          float wave = sin(p.x * .52 + uTime * .58) * .12
                     + sin(p.y * .72 - uTime * .42) * .08
                     + sin((p.x + p.y) * .24 + uTime * .31) * .1;
          p.z += wave;
          vWave = wave;
          vUv2 = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uDeep;
        uniform vec3 uShallow;
        varying float vWave;
        varying vec2 vUv2;
        void main() {
          float line = smoothstep(.48, .52, fract((vUv2.x + vUv2.y) * 32.0 + vWave * 2.0));
          vec3 base = mix(uDeep, uShallow, clamp(vWave * 2.0 + .48, 0.0, 1.0));
          base += line * .035;
          gl_FragColor = vec4(base, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(72, 72, 72, 72), waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.53;
    waterRef.current = water;
    scene.add(water);

    const grid = new THREE.GridHelper(40, 40, 0x6b7067, 0x9b9b8f);
    grid.position.y = -0.49;
    grid.material.transparent = true;
    grid.material.opacity = 0.14;
    scene.add(grid);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    const clock = new THREE.Clock();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      if (document.hidden) return;
      const elapsed = clock.getElapsedTime();
      const currentSpec = specRef.current;
      controls.autoRotate =
        !reducedMotion && currentSpec.autoRotate && currentSpec.environment !== "periscope";
      controls.update();
      if (shipRef.current) {
        shipRef.current.position.y =
          !reducedMotion && currentSpec.environment === "sea"
            ? -0.05 + Math.sin(elapsed * 0.62) * 0.035
            : -0.05;
        shipRef.current.rotation.z =
          !reducedMotion && currentSpec.environment === "sea"
            ? Math.sin(elapsed * 0.4) * 0.012
            : 0;
      }
      if (waterRef.current) {
        waterRef.current.material.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
        waterRef.current.visible = currentSpec.environment === "sea" || currentSpec.environment === "periscope";
      }
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const currentSpec = specRef.current;
    scene.background = new THREE.Color(
      currentSpec.environment === "periscope"
        ? 0xaeb5ad
        : currentSpec.environment === "value"
          ? 0xd8d8d2
          : 0xd8d4c8,
    );
    scene.fog = new THREE.FogExp2(
      currentSpec.environment === "periscope" ? 0xaeb5ad : 0xbac3c2,
      currentSpec.environment === "periscope" ? 0.048 : 0.018,
    );
    camera.fov = currentSpec.environment === "periscope" ? 16 : 36;
    camera.updateProjectionMatrix();
    ship.rotation.y = currentSpec.side === "port" ? -0.2 : Math.PI + 0.2;

    cleanup = () => {
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      portTexture.dispose();
      starboardTexture.dispose();
      renderer.dispose();
      threeRef.current = null;
    };

      })
      .catch(() => {
        if (cancelled) return;
        fallbackRef.current = true;
        renderShipFallback(
          canvas,
          specRef.current,
          specRef.current.side === "port"
            ? portDocumentRef.current
            : starboardDocumentRef.current,
        );
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [spec.vessel]);

  useEffect(() => {
    setModelStatus(`${VESSEL_INFO[spec.vessel].label} · mapped UV field`);
  }, [spec.vessel]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (fallbackRef.current && canvasRef.current) {
        renderShipFallback(
          canvasRef.current,
          spec,
          spec.side === "port" ? portDocument : starboardDocument,
        );
        return;
      }
      const portCanvas = portCanvasRef.current;
      const starboardCanvas = starboardCanvasRef.current;
      if (portCanvas && portTextureRef.current) {
        renderPatternTexture(portCanvas, portDocument, spec);
        portTextureRef.current.needsUpdate = true;
      }
      if (starboardCanvas && starboardTextureRef.current) {
        renderPatternTexture(starboardCanvas, starboardDocument, spec);
        starboardTextureRef.current.needsUpdate = true;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [portDocument, spec, starboardDocument]);

  useEffect(() => {
    const THREE = threeRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const ship = shipRef.current;
    if (!THREE || !scene || !camera || !controls || !ship) return;
    const grayscale = spec.environment === "value";
    scene.background = new THREE.Color(
      spec.environment === "periscope" ? 0xaeb5ad : grayscale ? 0xd8d8d2 : 0xd8d4c8,
    );
    scene.fog = new THREE.FogExp2(
      spec.environment === "periscope" ? 0xaeb5ad : 0xbac3c2,
      spec.environment === "periscope" ? 0.048 : 0.018,
    );
    camera.fov = spec.environment === "periscope" ? 16 : 36;
    camera.updateProjectionMatrix();
    const targetRotation = spec.side === "port" ? -0.2 : Math.PI + 0.2;
    ship.rotation.y = targetRotation;
    controls.target.set(0, 0.7, 0);
  }, [spec.environment, spec.side]);

  const importGLB = useCallback(async (file?: File) => {
    if (!file) return;
    const THREE = threeRef.current;
    const scene = sceneRef.current;
    const portTexture = portTextureRef.current;
    const starboardTexture = starboardTextureRef.current;
    if (!THREE || !scene || !portTexture || !starboardTexture) {
      setModelStatus("3D engine is still loading");
      return;
    }
    setModelStatus("Reading geometry…");
    try {
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const loader = new GLTFLoader();
      const arrayBuffer = await file.arrayBuffer();
      const gltf = await new Promise<{ scene: THREE.Group }>(
        (resolve, reject) => loader.parse(arrayBuffer, "", resolve, reject),
      );
      gltf.scene.updateMatrixWorld(true);

      const geometries: THREE.BufferGeometry[] = [];
      gltf.scene.traverse((object: THREE.Object3D) => {
        if (!(object instanceof THREE.Mesh) || !object.geometry) return;
        const geometry = object.geometry.clone();
        geometry.applyMatrix4(object.matrixWorld);
        if (!geometry.attributes.normal) geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometries.push(geometry);
      });
      if (!geometries.length) throw new Error("No mesh geometry found");

      const bounds = new THREE.Box3();
      geometries.forEach((geometry) => {
        if (geometry.boundingBox) bounds.union(geometry.boundingBox);
      });
      const size = bounds.getSize(new THREE.Vector3());
      const dimensions = [size.x, size.y, size.z];
      const lengthIndex = dimensions.indexOf(Math.max(...dimensions));
      const sideIndex = dimensions.indexOf(Math.min(...dimensions));
      const verticalIndex = [0, 1, 2].find(
        (index) => index !== lengthIndex && index !== sideIndex,
      ) ?? 1;
      const unitAxes = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1),
      ];
      const lengthAxis = unitAxes[lengthIndex].clone();
      const verticalAxis = unitAxes[verticalIndex].clone();
      const sideAxis = new THREE.Vector3().crossVectors(lengthAxis, verticalAxis).normalize();
      const corners = [
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z),
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z),
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z),
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z),
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z),
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z),
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z),
      ];
      const axisRange = (axis: THREE.Vector3) => {
        const values = corners.map((corner) => corner.dot(axis));
        return [Math.min(...values), Math.max(...values)] as const;
      };
      const [lengthMin, lengthMax] = axisRange(lengthAxis);
      const [verticalMin, verticalMax] = axisRange(verticalAxis);

      const mappedMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uPort: { value: portTexture },
          uStarboard: { value: starboardTexture },
          uLengthAxis: { value: lengthAxis },
          uVerticalAxis: { value: verticalAxis },
          uSideAxis: { value: sideAxis },
          uLengthMin: { value: lengthMin },
          uLengthMax: { value: lengthMax },
          uVerticalMin: { value: verticalMin },
          uVerticalMax: { value: verticalMax },
        },
        vertexShader: `
          varying vec3 vObjectPosition;
          varying vec3 vObjectNormal;
          void main() {
            vObjectPosition = position;
            vObjectNormal = normalize(normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uPort;
          uniform sampler2D uStarboard;
          uniform vec3 uLengthAxis;
          uniform vec3 uVerticalAxis;
          uniform vec3 uSideAxis;
          uniform float uLengthMin;
          uniform float uLengthMax;
          uniform float uVerticalMin;
          uniform float uVerticalMax;
          varying vec3 vObjectPosition;
          varying vec3 vObjectNormal;
          void main() {
            float u = clamp(
              (dot(vObjectPosition, uLengthAxis) - uLengthMin) /
              max(.0001, uLengthMax - uLengthMin),
              0.0,
              1.0
            );
            float v = clamp(
              (dot(vObjectPosition, uVerticalAxis) - uVerticalMin) /
              max(.0001, uVerticalMax - uVerticalMin),
              0.0,
              1.0
            );
            vec3 normal = normalize(vObjectNormal);
            float facing = dot(normal, uSideAxis);
            float sideWeight = smoothstep(.22, .62, abs(facing));
            vec3 portPaint = texture2D(uPort, vec2(u, v)).rgb;
            vec3 starboardPaint = texture2D(uStarboard, vec2(u, v)).rgb;
            vec3 dazzle = facing >= 0.0 ? portPaint : starboardPaint;
            vec3 deck = vec3(.25, .27, .24);
            vec3 color = mix(deck, dazzle, sideWeight);
            float light = .64 + max(0.0, dot(normal, normalize(vec3(-.3, .8, .5)))) * .36;
            gl_FragColor = vec4(color * light, 1.0);
          }
        `,
        side: THREE.DoubleSide,
      });

      const baked = new THREE.Group();
      geometries.forEach((geometry) => baked.add(new THREE.Mesh(geometry, mappedMaterial)));
      const center = bounds.getCenter(new THREE.Vector3());
      baked.position.copy(center).multiplyScalar(-1);

      const normalized = new THREE.Group();
      normalized.add(baked);
      const basis = new THREE.Matrix4().makeBasis(lengthAxis, verticalAxis, sideAxis);
      normalized.quaternion.setFromRotationMatrix(basis).invert();
      normalized.scale.setScalar(10 / Math.max(0.001, lengthMax - lengthMin));
      normalized.position.y = -0.06;
      normalized.rotation.y = specRef.current.side === "port" ? -0.2 : Math.PI + 0.2;

      const previous = shipRef.current;
      if (previous) {
        scene.remove(previous);
        previous.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        });
      }
      shipRef.current = normalized;
      scene.add(normalized);
      controlsRef.current?.target.set(0, 0.7, 0);
      setModelStatus(`${file.name} · normals + axis projection active`);
    } catch {
      setModelStatus("Could not read this GLB");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      exportPNG: () => {
        if (fallbackRef.current && canvasRef.current) {
          canvasRef.current.toBlob((blob) => {
            if (blob) downloadBlob(blob, `dazzle-${safeFilename(spec.seed)}-ship.png`);
          }, "image/png");
          return;
        }
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (!renderer || !scene || !camera) return;
        renderer.render(scene, camera);
        renderer.domElement.toBlob((blob) => {
          if (blob) downloadBlob(blob, `dazzle-${safeFilename(spec.seed)}-ship.png`);
        }, "image/png");
      },
    }),
    [spec.seed],
  );

  return (
    <div
      className={`canvas-host ship-host ${spec.environment === "periscope" ? "is-periscope" : ""}`}
      ref={hostRef}
    >
      <canvas ref={canvasRef} aria-label="Interactive 3D model of a WWI merchant steamer" />
      {spec.environment === "periscope" && <div className="periscope-reticle" aria-hidden="true" />}
      <div className="model-intake">
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,model/gltf-binary"
          onChange={(event) => void importGLB(event.target.files?.[0])}
        />
        <button onClick={() => fileInputRef.current?.click()}>Import GLB</button>
        <span>{modelStatus}</span>
      </div>
      <div className="canvas-label">
        <span>02 / {VESSEL_INFO[spec.vessel].label}</span>
        <span>Drag to orbit · Surface-normal mapping</span>
      </div>
    </div>
  );
});

function Icon({ name }: { name: "shuffle" | "play" | "pause" | "download" | "undo" | "redo" }) {
  const paths = {
    shuffle: "M4 7h3c4 0 4 10 8 10h5m-3-3 3 3-3 3M4 17h3c1.6 0 2.5-1.5 3.2-3M15 7h5m-3-3 3 3-3 3",
    play: "M8 5l11 7-11 7V5z",
    pause: "M8 5h3v14H8zm5 0h3v14h-3z",
    download: "M12 3v12m-5-5 5 5 5-5M5 20h14",
    undo: "M9 7 4 12l5 5M5 12h8a6 6 0 0 1 6 6",
    redo: "m15 7 5 5-5 5m4-5h-8a6 6 0 0 0-6 6",
  };
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[name]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-control">
      <span className="control-row">
        <span>{label}</span>
        <output>
          {value}
          {suffix}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function LayerToggle({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (active: boolean) => void;
}) {
  return (
    <button
      className={`layer-toggle ${active ? "active" : ""}`}
      onClick={() => onChange(!active)}
      aria-pressed={active}
    >
      <span className="layer-eye">{active ? "●" : "○"}</span>
      <span>{label}</span>
    </button>
  );
}

function VariationCanvas({
  spec,
  seed,
  onSelect,
}: {
  spec: DazzleSpec;
  seed: string;
  onSelect: (seed: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const variantSpec = { ...spec, seed };
    const document = buildPattern(variantSpec, spec.side);
    renderPlanBoard(canvasRef.current, variantSpec, document, "elevation", 0.2);
  }, [seed, spec]);

  return (
    <button className="variation-card" onClick={() => onSelect(seed)} aria-label={`Use variation ${seed}`}>
      <canvas ref={canvasRef} />
      <span>{seed.split("-").at(-1)}</span>
    </button>
  );
}

function newSeed() {
  const bytes = new Uint32Array(2);
  window.crypto.getRandomValues(bytes);
  return `${bytes[0].toString(36).toUpperCase()}-${bytes[1].toString(36).toUpperCase()}`;
}

export default function Home() {
  const [spec, setSpecRaw] = useState<DazzleSpec>(DEFAULT_SPEC);
  const [section, setSection] = useState<StudioSection>("studio");
  const [mobileView, setMobileView] = useState<MobileView>("ship");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("split");
  const [planMode, setPlanMode] = useState<PlanMode>("elevation");
  const [controlsOpen, setControlsOpen] = useState(true);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const pastRef = useRef<DazzleSpec[]>([]);
  const futureRef = useRef<DazzleSpec[]>([]);
  const planRef = useRef<ExportHandle>(null);
  const shipRef = useRef<ExportHandle>(null);

  const updateSpec = useCallback((patch: Partial<DazzleSpec>) => {
    setSpecRaw((current) => {
      pastRef.current = [...pastRef.current.slice(-39), current];
      futureRef.current = [];
      return { ...current, ...patch };
    });
  }, []);

  const undo = useCallback(() => {
    setSpecRaw((current) => {
      const previous = pastRef.current.at(-1);
      if (!previous) return current;
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [current, ...futureRef.current].slice(0, 40);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setSpecRaw((current) => {
      const next = futureRef.current[0];
      if (!next) return current;
      futureRef.current = futureRef.current.slice(1);
      pastRef.current = [...pastRef.current.slice(-39), current];
      return next;
    });
  }, []);

  const applyPreset = useCallback(
    (presetId: PresetId) => {
      const preset = PRESETS[presetId];
      updateSpec({
        preset: presetId,
        family: preset.family,
        direction: preset.direction,
        scale: preset.scale,
        fragmentation: preset.fragmentation,
        curvature: preset.curvature,
        bowAmbiguity: preset.bowAmbiguity,
        paintCount: preset.colors.length,
      });
    },
    [updateSpec],
  );

  const portDocument = useMemo(() => buildPattern(spec, "port"), [spec]);
  const starboardDocument = useMemo(() => buildPattern(spec, "starboard"), [spec]);
  const activeDocument = spec.side === "port" ? portDocument : starboardDocument;
  const preset = PRESETS[spec.preset];
  const variationSeeds = useMemo(
    () => ["A", "B", "C", "D"].map((suffix) => `${spec.seed.replace(/-[A-D]$/, "")}-${suffix}`),
    [spec.seed],
  );

  const exportJSON = useCallback(() => {
    const recipe = {
      schemaVersion: 2,
      algorithmVersion: "dazzle-v2",
      generatedAt: new Date().toISOString(),
      historicalClaim:
        spec.treatment === "archive"
          ? "Archive-informed, period-constrained study; screen colors are approximate."
          : "Expanded studio treatment. Halftone, gradients and print effects are contemporary additions.",
      spec,
      preset: PRESETS[spec.preset],
      port: portDocument,
      starboard: starboardDocument,
    };
    downloadText(
      JSON.stringify(recipe, null, 2),
      `dazzle-${safeFilename(spec.seed)}-recipe.json`,
      "application/json",
    );
  }, [portDocument, spec, starboardDocument]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key.toLowerCase() === "r") {
        updateSpec({ seed: newSeed() });
      } else if (event.code === "Space") {
        event.preventDefault();
        updateSpec({ autoRotate: !spec.autoRotate });
      } else if (event.key.toLowerCase() === "e") {
        planRef.current?.exportPNG();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, spec.autoRotate, undo, updateSpec]);

  return (
    <main className="dazzle-app">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="signal-dot" />
          <div>
            <h1>Dazzle Camo Studio</h1>
            <p>Optical disruption studies · 1917–1919</p>
          </div>
        </div>

        <nav className="section-nav" aria-label="Dazzle Studio sections">
          {(
            [
              ["studio", "Studio"],
              ["poster", "Poster Press"],
              ["archive", "Archive Room"],
              ["learn", "Field Notes"],
            ] as Array<[StudioSection, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              className={section === id ? "active" : ""}
              onClick={() => setSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="topbar-tools">
          <div className="history-tools" aria-label="History controls">
            <button className="icon-button" onClick={undo} aria-label="Undo" title="Undo">
              <Icon name="undo" />
            </button>
            <button className="icon-button" onClick={redo} aria-label="Redo" title="Redo">
              <Icon name="redo" />
            </button>
          </div>
          <button
            className="text-button"
            onClick={() => updateSpec({ autoRotate: !spec.autoRotate })}
            aria-pressed={spec.autoRotate}
          >
            <Icon name={spec.autoRotate ? "pause" : "play"} />
            {spec.autoRotate ? "Pause vessel" : "Turntable"}
          </button>
          <button className="primary-button desktop-export" onClick={() => planRef.current?.exportPNG()}>
            <Icon name="download" />
            Export plan
          </button>
        </div>
      </header>

      <div
        className={`workspace ${controlsOpen ? "" : "controls-collapsed"} ${
          section === "studio" ? "" : "section-hidden"
        }`}
      >
        <aside
          className={`control-panel ${controlsOpen ? "is-open" : ""} ${mobileControlsOpen ? "mobile-open" : ""}`}
          aria-label="Generator controls"
        >
          <div className="panel-head">
            <div>
              <span className="eyebrow">Instrument 01</span>
              <h2>Pattern</h2>
            </div>
            <button
              className="panel-close"
              onClick={() => {
                if (window.innerWidth <= 820) setMobileControlsOpen(false);
                else setControlsOpen(false);
              }}
              aria-label="Close controls"
            >
              ×
            </button>
          </div>

          <button className="new-scheme" onClick={() => updateSpec({ seed: newSeed() })}>
            <Icon name="shuffle" />
            <span>New scheme</span>
            <kbd>R</kbd>
          </button>

          <label className="field-control">
            <span>Archive-informed preset</span>
            <select value={spec.preset} onChange={(event) => applyPreset(event.target.value as PresetId)}>
              {Object.values(PRESETS).map((item) => (
                <option value={item.id} key={item.id}>
                  {item.shortName}
                </option>
              ))}
            </select>
          </label>

          <label className="field-control">
            <span>Seed / plan number</span>
            <input
              type="text"
              value={spec.seed}
              spellCheck={false}
              onChange={(event) => updateSpec({ seed: event.target.value.toUpperCase() })}
            />
          </label>

          <div className="variation-block">
            <div className="control-row">
              <span>Controlled variations</span>
              <span>Seed linked</span>
            </div>
            <div className="variation-strip">
              {variationSeeds.map((seed) => (
                <VariationCanvas
                  key={seed}
                  spec={spec}
                  seed={seed}
                  onSelect={(nextSeed) => updateSpec({ seed: nextSeed })}
                />
              ))}
            </div>
          </div>

          <div className="side-switch" role="group" aria-label="Ship side">
            <button
              className={spec.side === "port" ? "active" : ""}
              onClick={() => updateSpec({ side: "port" })}
            >
              Port
            </button>
            <button
              className={spec.side === "starboard" ? "active" : ""}
              onClick={() => updateSpec({ side: "starboard" })}
            >
              Starboard
            </button>
          </div>

          <label className="field-control vessel-select">
            <span>Vessel geometry</span>
            <select
              value={spec.vessel}
              onChange={(event) => updateSpec({ vessel: event.target.value as VesselClass })}
            >
              {(Object.entries(VESSEL_INFO) as Array<
                [VesselClass, (typeof VESSEL_INFO)[VesselClass]]
              >).map(([id, item]) => (
                <option value={id} key={id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <p className="family-note">
            {VESSEL_INFO[spec.vessel].era} · {VESSEL_INFO[spec.vessel].note}
          </p>

          <div className="treatment-switch" role="group" aria-label="Historical treatment mode">
            <button
              className={spec.treatment === "archive" ? "active" : ""}
              onClick={() =>
                updateSpec({
                  treatment: "archive",
                  halftoneEnabled: false,
                  printTexture: 0,
                })
              }
            >
              Archive / Flat
            </button>
            <button
              className={spec.treatment === "expanded" ? "active" : ""}
              onClick={() =>
                updateSpec({
                  treatment: "expanded",
                  halftoneEnabled: true,
                  printTexture: Math.max(18, spec.printTexture),
                })
              }
            >
              Expanded / Studio
            </button>
          </div>
          <p className={`mode-note ${spec.treatment}`}>
            {spec.treatment === "archive"
              ? "Period-constrained flat paint, large forms and independent sides."
              : "Contemporary halftone, gradient and print treatments are unlocked."}
          </p>

          <label className="field-control">
            <span>Pattern grammar</span>
            <select
              value={spec.family}
              onChange={(event) => updateSpec({ family: event.target.value as PatternFamily })}
            >
              {(Object.entries(FAMILY_INFO) as Array<
                [PatternFamily, (typeof FAMILY_INFO)[PatternFamily]]
              >).map(([id, info]) => (
                <option value={id} key={id}>
                  {info.label}
                </option>
              ))}
            </select>
          </label>
          <p className="family-note">{FAMILY_INFO[spec.family].note}</p>

          <div className="layer-block">
            <div className="control-row">
              <span>Procedural layers</span>
              <span>Live on ship</span>
            </div>
            <div className="layer-grid">
              <LayerToggle
                label="Masses"
                active={spec.showMasses}
                onChange={(showMasses) => updateSpec({ showMasses })}
              />
              <LayerToggle
                label="Bands"
                active={spec.showBands}
                onChange={(showBands) => updateSpec({ showBands })}
              />
              <LayerToggle
                label="Cuts"
                active={spec.showCuts}
                onChange={(showCuts) => updateSpec({ showCuts })}
              />
              <LayerToggle
                label="Halftone"
                active={spec.treatment === "expanded" && spec.halftoneEnabled}
                onChange={(halftoneEnabled) =>
                  updateSpec({
                    treatment: halftoneEnabled ? "expanded" : spec.treatment,
                    halftoneEnabled,
                  })
                }
              />
            </div>
          </div>

          <details className="control-section" open>
            <summary>Composition</summary>
            <div className="control-stack">
              <RangeControl
                label="Field scale"
                value={spec.scale}
                min={20}
                max={100}
                onChange={(scale) => updateSpec({ scale })}
              />
              <RangeControl
                label="Density"
                value={spec.density}
                min={10}
                max={100}
                onChange={(density) => updateSpec({ density })}
              />
              <RangeControl
                label="Direction"
                value={spec.direction}
                min={-75}
                max={75}
                suffix="°"
                onChange={(direction) => updateSpec({ direction })}
              />
              <RangeControl
                label="Fragmentation"
                value={spec.fragmentation}
                min={0}
                max={100}
                onChange={(fragmentation) => updateSpec({ fragmentation })}
              />
              <RangeControl
                label="Angularity"
                value={spec.angularity}
                min={0}
                max={100}
                onChange={(angularity) => updateSpec({ angularity })}
              />
              <RangeControl
                label="Asymmetry"
                value={spec.asymmetry}
                min={0}
                max={100}
                onChange={(asymmetry) => updateSpec({ asymmetry })}
              />
              <RangeControl
                label="Overlap"
                value={spec.overlap}
                min={0}
                max={100}
                onChange={(overlap) => updateSpec({ overlap })}
              />
            </div>
          </details>

          <details className="control-section">
            <summary>Deception + detail</summary>
            <div className="control-stack">
              <RangeControl
                label="Edge break"
                value={spec.edgeBreak}
                min={0}
                max={100}
                onChange={(edgeBreak) => updateSpec({ edgeBreak })}
              />
              <RangeControl
                label="Curvature"
                value={spec.curvature}
                min={0}
                max={100}
                onChange={(curvature) => updateSpec({ curvature })}
              />
              <RangeControl
                label="Bow ambiguity"
                value={spec.bowAmbiguity}
                min={0}
                max={100}
                onChange={(bowAmbiguity) => updateSpec({ bowAmbiguity })}
              />
              <RangeControl
                label="False waterline"
                value={spec.waterline}
                min={0}
                max={100}
                onChange={(waterline) => updateSpec({ waterline })}
              />
              <RangeControl
                label="Secondary detail"
                value={spec.fineDetail}
                min={0}
                max={100}
                onChange={(fineDetail) => updateSpec({ fineDetail })}
              />
              <RangeControl
                label="Upperworks coupling"
                value={spec.superstructure}
                min={0}
                max={100}
                onChange={(superstructure) => updateSpec({ superstructure })}
              />
              <RangeControl
                label="Value contrast"
                value={spec.contrast}
                min={35}
                max={100}
                onChange={(contrast) => updateSpec({ contrast })}
              />
            </div>
          </details>

          {spec.treatment === "expanded" && (
            <details className="control-section experimental-section" open>
              <summary>Halftone gradient</summary>
              <div className="inline-fields">
                <label className="field-control">
                  <span>Screen</span>
                  <select
                    value={spec.halftoneStyle}
                    onChange={(event) =>
                      updateSpec({ halftoneStyle: event.target.value as HalftoneStyle })
                    }
                  >
                    <option value="dots">Dots</option>
                    <option value="lines">Lines</option>
                    <option value="crosshatch">Crosshatch</option>
                  </select>
                </label>
                <label className="field-control">
                  <span>Gradient</span>
                  <select
                    value={spec.halftoneGradient}
                    onChange={(event) =>
                      updateSpec({ halftoneGradient: event.target.value as HalftoneGradient })
                    }
                  >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                    <option value="vignette">Vignette</option>
                    <option value="noise">Noise field</option>
                  </select>
                </label>
              </div>
              <div className="control-stack">
                <RangeControl
                  label="Screen scale"
                  value={spec.halftoneScale}
                  min={5}
                  max={100}
                  onChange={(halftoneScale) => updateSpec({ halftoneScale })}
                />
                <RangeControl
                  label="Ink density"
                  value={spec.halftoneDensity}
                  min={5}
                  max={100}
                  onChange={(halftoneDensity) => updateSpec({ halftoneDensity })}
                />
                <RangeControl
                  label="Screen angle"
                  value={spec.halftoneAngle}
                  min={0}
                  max={90}
                  suffix="°"
                  onChange={(halftoneAngle) => updateSpec({ halftoneAngle })}
                />
                <RangeControl
                  label="Registration jitter"
                  value={spec.halftoneJitter}
                  min={0}
                  max={100}
                  onChange={(halftoneJitter) => updateSpec({ halftoneJitter })}
                />
                <RangeControl
                  label="Print grain"
                  value={spec.printTexture}
                  min={0}
                  max={100}
                  onChange={(printTexture) => updateSpec({ printTexture })}
                />
              </div>
            </details>
          )}

          <div className="palette-block">
            <RangeControl
              label="Paint count"
              value={spec.paintCount}
              min={2}
              max={preset.colors.length}
              onChange={(paintCount) => updateSpec({ paintCount })}
            />
            <div className="control-row">
              <span>Paint set</span>
              <span>{spec.paintCount} colors</span>
            </div>
            <div className="swatches" aria-label="Current approximate color palette">
              {preset.colors.slice(0, spec.paintCount).map((color, index) => (
                <span key={`${color}-${index}`} style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
            <p>Archive-informed screen approximations, not official Admiralty paint specifications.</p>
          </div>
        </aside>

        {!controlsOpen && (
          <button className="open-controls" onClick={() => setControlsOpen(true)}>
            Pattern controls
          </button>
        )}

        <section className="stage">
          <div className="stage-toolbar">
            <div className="view-control-cluster">
              <div className="workspace-view-switch" role="group" aria-label="Workspace layout">
                {(
                  [
                    ["compose", "2D Compose"],
                    ["split", "Split"],
                    ["ship", "3D Preview"],
                  ] as Array<[WorkspaceView, string]>
                ).map(([view, label]) => (
                  <button
                    key={view}
                    className={workspaceView === view ? "active" : ""}
                    onClick={() => {
                      setWorkspaceView(view);
                      if (view === "compose") setMobileView("plan");
                      if (view === "ship") setMobileView("ship");
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {workspaceView !== "ship" && (
                <div className="plan-mode-switch" role="group" aria-label="2D composition view">
                  <button
                    className={planMode === "elevation" ? "active" : ""}
                    onClick={() => setPlanMode("elevation")}
                  >
                    Ship mask
                  </button>
                  <button
                    className={planMode === "field" ? "active" : ""}
                    onClick={() => setPlanMode("field")}
                  >
                    Artwork
                  </button>
                </div>
              )}
              <div className="mobile-view-switch" role="group" aria-label="Canvas view">
                <button
                  className={mobileView === "plan" ? "active" : ""}
                  onClick={() => {
                    setMobileView("plan");
                    setWorkspaceView("compose");
                  }}
                >
                  2D plan
                </button>
                <button
                  className={mobileView === "ship" ? "active" : ""}
                  onClick={() => {
                    setMobileView("ship");
                    setWorkspaceView("ship");
                  }}
                >
                  3D ship
                </button>
              </div>
            </div>
            <div className="environment-switch" role="group" aria-label="Evaluation mode">
              {(["studio", "sea", "periscope", "value"] as Environment[]).map((environment) => (
                <button
                  key={environment}
                  className={spec.environment === environment ? "active" : ""}
                  onClick={() => updateSpec({ environment })}
                >
                  {environment === "value" ? "Value check" : environment}
                </button>
              ))}
            </div>
            <div className="scheme-status">
              <span className="status-pulse" />
              {spec.treatment === "archive" ? "Archive constrained" : "Expanded studio"}
            </div>
          </div>

          <div className={`visual-grid view-${workspaceView} mobile-${mobileView}`}>
            <PlanCanvas ref={planRef} spec={spec} document={activeDocument} mode={planMode} />
            <ShipCanvas
              ref={shipRef}
              spec={spec}
              portDocument={portDocument}
              starboardDocument={starboardDocument}
            />
          </div>

          <div className="readout-strip">
            <div>
              <span>Scheme</span>
              <strong>{preset.shortName}</strong>
            </div>
            <div>
              <span>Grammar</span>
              <strong>{FAMILY_INFO[spec.family].label}</strong>
            </div>
            <div>
              <span>Major forms</span>
              <strong>{activeDocument.majorMasses}</strong>
            </div>
            <div>
              <span>Secondary marks</span>
              <strong>{activeDocument.secondaryMarks}</strong>
            </div>
            <div>
              <span>Dominant edge</span>
              <strong>{activeDocument.dominantAngle}°</strong>
            </div>
            <div className="readout-note">
              <span>Mode / side logic</span>
              <strong>
                {spec.treatment === "archive" ? "Flat paint" : "Studio treatment"} · Independent sides
              </strong>
            </div>
          </div>

          <section className={`archive-panel ${archiveOpen ? "is-open" : ""}`}>
            <button className="archive-toggle" onClick={() => setArchiveOpen(!archiveOpen)} aria-expanded={archiveOpen}>
              <span>
                <span className="eyebrow">Method + historical boundary</span>
                <strong>
                  {preset.name} · {FAMILY_INFO[spec.family].label}
                </strong>
              </span>
              <span>{archiveOpen ? "Close" : "Open notes"} ↗</span>
            </button>
            {archiveOpen && (
              <div className="archive-content">
                <div>
                  <h3>What the generator enforces</h3>
                  <p>
                    Large silhouette-breaking masses, 2–5 flat colors, false bow and waterline cues,
                    counter-raked upperworks, and independently generated port and starboard plans.
                  </p>
                </div>
                <div>
                  <h3>Historical boundary</h3>
                  <p>
                    {spec.treatment === "archive"
                      ? "This is an archive-informed study, not a reconstruction of one documented vessel. Dazzle was intended to confuse course, range and speed estimates—not make ships invisible."
                      : "Halftone, gradients and print texture are contemporary studio treatments. They are intentionally separated from the period-constrained flat-paint generator."}
                  </p>
                </div>
                <div>
                  <h3>Archive trail</h3>
                  <p>
                    <a href="https://unwritten-record.blogs.archives.gov/2017/09/05/now-you-see-me-now-you-still-see-me-hand-painted-british-dazzle-camouflage-templates-from-wwi/" target="_blank" rel="noreferrer">
                      U.S. National Archives
                    </a>
                    {" · "}
                    <a href="https://digitalcommons.risd.edu/dazzleprints/" target="_blank" rel="noreferrer">
                      RISD Shipping Board plans
                    </a>
                    {" · "}
                    <a href="https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-.html" target="_blank" rel="noreferrer">
                      Naval History Command
                    </a>
                  </p>
                </div>
                <p className="archive-note">
                  {preset.note} {FAMILY_INFO[spec.family].note}
                </p>
              </div>
            )}
          </section>
        </section>
      </div>

      {section === "poster" && (
        <PosterPress
          seed={spec.seed}
          side={spec.side}
          familyLabel={FAMILY_INFO[spec.family].label}
          pattern={activeDocument}
        />
      )}
      {section === "archive" && (
        <ArchiveRoom
          seed={spec.seed}
          side={spec.side}
          familyLabel={FAMILY_INFO[spec.family].label}
          pattern={activeDocument}
        />
      )}
      {section === "learn" && (
        <FieldNotes
          seed={spec.seed}
          side={spec.side}
          familyLabel={FAMILY_INFO[spec.family].label}
          pattern={activeDocument}
        />
      )}

      {section === "studio" && (
        <>
          <nav className="mobile-actions" aria-label="Mobile actions">
            <button onClick={() => updateSpec({ seed: newSeed() })}>
              <Icon name="shuffle" />
              New
            </button>
            <button
              onClick={() => {
                const next = mobileView === "plan" ? "ship" : "plan";
                setMobileView(next);
                setWorkspaceView(next === "plan" ? "compose" : "ship");
              }}
            >
              {mobileView === "plan" ? "3D" : "2D"}
            </button>
            <button
              onClick={() => updateSpec({ side: spec.side === "port" ? "starboard" : "port" })}
            >
              {spec.side === "port" ? "Port" : "Starboard"}
            </button>
            <button onClick={undo}>
              <Icon name="undo" />
              Undo
            </button>
            <button onClick={() => setMobileControlsOpen(true)}>Tune</button>
          </nav>

          <div className="export-dock" aria-label="Export options">
            <span>Output</span>
            <button onClick={() => planRef.current?.exportPNG()}>
              {planMode === "field" ? "Artwork PNG" : "Plan PNG"}
            </button>
            <button onClick={() => exportPlanSVG(spec, activeDocument)}>Vector SVG</button>
            <button onClick={() => shipRef.current?.exportPNG()}>3D still</button>
            <button onClick={exportJSON}>Recipe JSON</button>
          </div>
        </>
      )}
    </main>
  );
}
