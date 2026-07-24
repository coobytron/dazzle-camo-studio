# Dazzle Camo Studio

> A historically grounded, real-time dazzle camouflage design instrument with synchronized 2D composition and 3D ship visualization.

## Project Links

- **Live GitHub Pages build:** https://coobytron.github.io/dazzle-camo-studio/
- **GitHub repository:** https://github.com/coobytron/dazzle-camo-studio
- **Alternate live deployment:** https://dazzle-camo-studio.coobytron.chatgpt.site
- **Repository branch:** `main`
- **V2 source publish commit:** `5551844`

## Portfolio Card Copy

### Short

A WebGL design tool for building historically informed WWI dazzle camouflage across linked 2D and 3D canvases.

### Medium

Dazzle Camo Studio transforms First World War naval deception principles into a responsive generative design system. Independent port and starboard compositions, nine procedural pattern grammars, live geometric tuning, and contemporary print treatments all drive the same 2D artwork and 3D vessel in real time.

### Disciplines

`Art Direction` · `Creative Coding` · `Generative Systems` · `WebGL` · `Interaction Design` · `Historical Research`

## Intent

The goal was not to make a random black-and-white “zebra” texture. Authentic dazzle camouflage was designed around a specific vessel: its hull, waterline, superstructure, bow, stern, apparent heading, scale, and silhouette.

The generator therefore treats a dazzle scheme as a structured design document rather than a decorative texture. A single deterministic scheme drives both the flat composition and the mapped 3D ship, while port and starboard remain independently generated.

## V3 North Star — Historical, Then Art

V3 should feel like entering a digital version of the wartime model room, testing a scheme through a periscope, and then taking the result into a contemporary print studio.

The experience has three clearly labeled modes:

1. **Archive Reconstruction** — reproduces a documented pattern plate on a matching or closely related hull. No contemporary effects.
2. **Historically Informed** — generates a new vessel-specific scheme from documented deception principles, period-rooted palettes, and ship geometry.
3. **Contemporary Art** — unlocks Helvetica-led poster systems, pattern escape, halftones, gradients, animation, and more aggressive abstraction.

The separation is important. Helvetica dates to 1957 and is not a First World War face, but it is an excellent contemporary editorial frame for the work. The poster generator should present it as a deliberate modern interpretation rather than as period-authentic typography.

### Product Promise

> Design a dazzle scheme, understand the visual deception behind it, test it on a historically credible vessel, and leave with a museum-grade poster plus a documented scheme card.

### Experience Arc

1. **Briefing** — a concise explanation of concealment versus confusion.
2. **Model Room** — choose a documented ship type, an archive plate, or import a custom model.
3. **Dazzle Desk** — build the scheme in side elevation with deception-driven controls.
4. **Viewing Tank** — evaluate heading, speed, distance, silhouette, haze, and periscope conditions.
5. **Poster Press** — transform the same scheme into a typographic artifact.
6. **Debrief** — export the artwork and a short explanation of what the design attempted to distort.

## Core Principles

1. **Ship-specific deception**

   Pattern masses respond to the vessel instead of being applied as an arbitrary repeating texture.

2. **Independent sides**

   Port and starboard schemes can differ, reflecting the asymmetry found in historical applications.

3. **Large silhouette-breaking forms**

   Major diagonals, wedges, interruptions, false structural cues, and waterline shifts carry the composition.

4. **One source of truth**

   The 2D artwork and 3D preview are synchronized representations of the same seeded pattern system.

5. **Archive and expanded modes stay distinct**

   Historically constrained schemes are clearly separated from contemporary halftone, gradient, and print experiments.

6. **Responsive by design**

   The instrument is intended to remain usable across desktop, tablet, and mobile layouts.

## Current Feature Set

### View Modes

- **2D Compose** — a dedicated flat composition workspace
- **Split View** — simultaneous 2D and 3D evaluation
- **3D Preview** — an orbitable procedural WWI-era merchant steamer
- **Ship-mask and full-field artwork views**
- **Sea, periscope, and value-check evaluation modes**
- **Pan, zoom, and fit controls**

### Pattern Engine

- Nine procedural pattern grammars
- Deterministic seed-based generation
- Independent port and starboard schemes
- Controlled variation strip
- Live density, asymmetry, overlap, angularity, waterline, detail, and upperworks controls
- Semantic layer toggles
- Large-scale hull masses plus smaller structural accents
- Shared pattern state across 2D and 3D

### Expanded Print Lab

- Dot halftones
- Line halftones
- Crosshatch halftones
- Linear gradient fields
- Radial gradient fields
- Vignette fields
- Noise fields

These treatments are intentionally labeled as expanded contemporary features rather than presented as WWI-authentic camouflage methods.

### Output

- PNG export
- SVG export
- JSON scheme export
- Repeatable results through deterministic seeds

## Interaction Model

The user can begin with an archive-informed pattern grammar, alter its deception logic through high-level controls, compare controlled variations, and evaluate the result as both flat artwork and a mapped vessel.

The experience is designed to move fluidly between:

1. **Generate** — choose a grammar and seed.
2. **Compose** — tune form, density, asymmetry, hierarchy, and layers.
3. **Evaluate** — inspect the scheme in 2D, in value, at sea, or from a periscope-like viewpoint.
4. **Expand** — optionally introduce halftone, gradient, noise, and print treatments.
5. **Export** — save the artwork or its underlying scheme document.

## Technical Notes

- WebGL powers the interactive 3D view.
- Three.js/WebGL initialization must remain browser-only. Initializing the renderer during server startup previously caused the hosted app to fail before the page rendered.
- A functional 2D fallback keeps the generator usable when GPU/WebGL access is unavailable.
- The GitHub Pages target uses a static build.
- Pushes to `main` automatically redeploy the GitHub Pages site.
- Pattern generation should remain deterministic: the same seed and parameters should reproduce the same scheme.
- 2D and 3D must continue to read from the same pattern state rather than maintaining separate visual logic.

## Historical Guardrails

Future work should preserve the distinction between historically informed dazzle logic and modern visual experimentation.

### Preserve

- Vessel-aware composition
- Large non-repeating pattern masses
- Strong directional ambiguity
- False bow, stern, waterline, and structural cues
- Independent port and starboard designs
- Period-appropriate ship proportions in archive-oriented modes
- Limited, high-contrast palettes where historically appropriate

### Avoid

- Treating dazzle as a seamless zebra print
- Mirroring one side of the vessel onto the other by default
- Using only small, evenly distributed stripes
- Presenting halftones or gradients as historically documented WWI techniques
- Letting surface detail overpower the major silhouette-breaking structure

## Historical Research Findings

### What Dazzle Was Trying to Do

Dazzle was not designed primarily to hide a ship. Its purpose was to make an observer misread the vessel—especially its heading, speed, range, bow, stern, and silhouette—long enough to produce a poor firing solution.

The most useful historical principles for the generator are:

- **Contradict the true course.** Diagonals and false structural lines should imply an alternate direction of travel.
- **Confuse bow and stern.** High-contrast masses can create a false bow, truncate a stern, or visually reverse the vessel.
- **Distort speed cues.** A painted false bow wave or displaced waterline can suggest a different speed.
- **Break class recognition.** Major shapes should cross actual structural divisions instead of politely following them.
- **Work at observation distance.** Large masses survive haze, sea glare, low contrast, and a periscope-sized view; decorative detail does not.
- **Design each side independently.** Port and starboard were separate compositions because the observed problem changed with viewpoint.
- **Treat uncertainty honestly.** Historical evidence for dazzle’s overall effectiveness is mixed. The learning layer should explain the theory and testing process without presenting it as settled science.

### Historically Grounded Generation Order

The procedural engine should build a scheme in the same strategic order an art director would:

1. Set the actual waterline, bow, stern, funnels, bridge, and dominant silhouette.
2. Choose one deception objective: false course, false bow, false stern, false speed, rangefinder disruption, or class confusion.
3. Place two to five dominant masses that operate at full-ship scale.
4. Cut those masses across real structural boundaries.
5. Add one explicit false cue: bow wave, waterline, funnel direction, or deck break.
6. Add secondary counter-lines and interruptions.
7. Apply a historically constrained palette.
8. Test at reduced scale, in grayscale, through haze, and from an oblique periscope viewpoint.

This replaces “pattern density” as the primary logic with a readable cause-and-effect system.

### Archive Scheme Families

Archive mode should be organized around documented scheme families rather than invented style names:

- **United States Navy type/design plates** — use the Naval History and Heritage Command’s surviving Type 2, Type 6, Type 11, and related port/starboard drawings as direct references.
- **British Ministry of Shipping designs** — use surviving painted plans and model photographs where rights allow.
- **Named-vessel studies** — USS Nebraska, HMT Olympic, RMS/HMT Mauretania, USS West Mahomet, and other ships with strong photographic documentation.
- **Model-room studies** — recreate the workflow of a painted scale model viewed on a turntable through a periscope.

Every archive preset should store:

- Source institution and URL
- Vessel or ship type
- Approximate date
- Port/starboard designation
- Palette transcription
- Reconstruction confidence
- Known liberties or missing information
- Image/model rights and required credit

### A Note on the Supplied Visual References

The supplied references suggest four distinct visual languages that should remain available without collapsing into one style:

1. **Painted working models** — tactile, imperfect, and instructional; the strongest reference for the model-room interface.
2. **Full-scale wartime photography** — proof that dominant geometry must survive distance, haze, water reflection, and real superstructure.
3. **Wadsworth-era print language** — black/ivory compression, extreme perspective, radiating line systems, and image fields that exceed the ship.
4. **Experimental Jetset** — disciplined scale, white space, Helvetica, and compact metadata that make the historical image feel contemporary.

The architecture references add a fifth idea: map one continuous field across many separate volumes so the surface system can visually reorganize the object.

### Close Reading of the Additional Design Plates

The additional Type 2, 3, 8, 11, 14, and 17 plates sharpen the project considerably. They show that “dazzle” is not one repeatable look. It is a family of ship-specific compositions with radically different edge languages, mass distributions, and palette roles.

| Supplied reference | Visual lesson | Generator implication |
| --- | --- | --- |
| Type 17, black/salmon/blue angular plate | Large black structural masses dominate; pale color is used as a counter-cue rather than equal decoration. | Add **dominant mass ratio** and **counter-color area** instead of distributing every color evenly. |
| Type 17, black ribbon with blue/salmon arcs | The same type can support a very different design; long curves and isolated color loops work against the literal hull structure. | Store **Type** and **Design** as separate metadata. A type is not a single preset image. |
| Type 14, blue/black fractured waves | Visual activity is clustered rather than uniform, with a severe dark bow and repeated forms concentrated across the lower hull. | Add **activity center**, **quiet zone**, and **frequency falloff** controls. |
| Type 11, black and burnt-orange serpentine field | One calligraphic mass can carry the whole composition while sharp counter-shapes imply another direction. | Add a **ribbon/serpent grammar** with editable spine, width, pinch, crossing, and terminal shape. |
| Type 8, black and ochre field | Negative space is an active shape. Black behaves like a continuous ground cut by large ochre voids and short directional bars. | Add **field/void inversion** and let the user design the empty areas, not only the painted ones. |
| Type 3, black field with mint zigzag | A near-solid dark hull can be fractured by one highly directional colored intervention. | Add **single intervention** mode: one dominant ground plus one disruptive vector. |
| Type 2, lavender/blue/black organic plate | Lower-contrast color families can still contain decisive black anchors; broad curves coexist with abrupt geometric cuts. | Separate **edge vocabulary** from **palette contrast** so soft color does not force soft geometry. |
| “Direction of ship reversed” watercolor | The deception can be legible as a specific claim: the apparent bow, stern, or direction is intentionally displaced. | Make the selected visual lie explicit and show **true direction** versus **designed direction**. |
| Multi-ship comparison sheets | Schemes become more understandable when viewed as a family at the same scale and orientation. | Add a **Fleet Wall** comparison mode with shared zoom, waterline, value, and metadata alignment. |
| Detail/callout sheets | Hull sides, ends, funnels, deckhouses, and smaller structures received related but separately considered treatments. | Add an **Exploded Paint Plan** showing side, bow, stern, funnels, and superstructure as linked semantic surfaces. |

### Procedural Visual Grammar Derived from the Plates

The archive engine should describe a scheme through compositional dimensions, not through names such as “zebra,” “waves,” or “random angular.”

#### Edge Vocabulary

- Straight cut
- Chevron
- Sawtooth
- Stepped fracture
- Hook
- Scallop
- S-curve
- Long wave
- Tapered spear
- Block termination
- Soft watercolor contour

#### Mass Topology

- **Field** — one dominant ground covering most of the hull
- **Ribbon** — a continuous path with changing width
- **Island** — isolated mass separated from the dominant field
- **Fracture** — a sharp interruption cutting through another mass
- **Nested band** — parallel or inset contours
- **Void** — untouched hull color used as a designed form
- **Bridge** — a mass that crosses hull and superstructure to contradict their separation
- **Terminal** — a bow- or stern-specific ending that changes apparent length/direction

#### Spatial Distribution

- Activity center along the ship length
- Quiet-zone size and position
- Bow complexity
- Stern complexity
- Waterline displacement
- Upperworks carry
- Macro/mid/detail frequency balance
- Port/starboard divergence

#### Directional Behavior

- True-course aligned
- Counter-course
- Bow-seeking
- Stern-seeking
- Radial from false structural point
- Alternating contradiction
- Parallel flow
- Broken flow

#### Palette Roles

The period plates suggest role-based color assignment:

- **Hull ground** — warm white, pale gray, or pale blue-gray
- **Dominant mass** — usually black or a very dark neutral
- **Counter mass** — muted blue, green, ochre, lavender, salmon, or oxide red
- **Directional accent** — a smaller high-information color
- **Structural bridge** — a color repeated across hull, funnel, or superstructure to create a false continuity

Archive palettes should be sampled and normalized from documented plates while retaining a **scan view** that shows paper aging and a **paint view** that estimates the intended paint color. Do not mistake yellowed paper, faded pigment, scanner white balance, or JPEG compression for an original naval color.

### The Archive Plate as Interface Design

The newly supplied plans suggest an interface language more distinctive than a conventional dark creative-coding panel:

- Long panoramic side elevation on a warm-white drawing field
- Hairline ship construction drawing beneath opaque painted masses
- Small uppercase **TYPE** and **DESIGN** identifiers
- Scale, port/starboard, vessel dimensions, and color notes treated as real information
- Narrow margins and large calm paper areas
- Detail callouts for funnels, end elevations, and superstructure
- Pencil, watercolor, gouache, and hand-ink texture available as material previews
- Paper wear shown only in scan/reproduction mode, never baked into clean scheme data

This can become the app’s visual identity: a living technical plate whose annotations update as the scheme changes.

### New Archive-Facing Views

1. **Long Plate**

   A 3:1 to 5:1 panoramic side elevation with sparse technical labeling and the full ship at a consistent scale.

2. **Port / Starboard Pair**

   Two aligned elevations with independent compositions and linked waterlines.

3. **Fleet Wall**

   Four to twelve schemes stacked vertically for comparison, all normalized to the same visual length.

4. **Exploded Paint Plan**

   Hull, bow, stern, funnels, bridge, and deck structures separated into callouts while retaining one shared pattern document.

5. **Direction Reversed**

   A teaching card showing the actual silhouette, designed false cue, apparent direction, and how the result changes at periscope scale.

6. **Archive / Reconstruction Overlay**

   The scanned source plate and the procedural reconstruction can be faded over one another to reveal interpretation, missing information, and geometry mismatch.

### Expanded Art and Design Lineage

The art mode should operate as a series of clearly credited lenses:

| Lens | Reference | What to borrow | What not to claim |
| --- | --- | --- | --- |
| Vorticist dockyard | Edward Wadsworth, *Dazzleships in Dry Dock at Liverpool* (1919) | Compressed perspective, industrial rhythm, hard black/ivory geometry, workers and ship treated as one graphic system | Do not present a Wadsworth-derived poster as an operational paint plan |
| Painted harbor | Arthur Lismer, *Olympic with Returned Soldiers* and *Dazzle Ships in Harbour* | Atmospheric color, harbor depth, smoke, water reflection, and dazzle as a shifting mosaic | Do not let painterly atmosphere replace source-linked reconstruction |
| BLAST broadside | The 1914 Vorticist journal and manifesto | Violent scale shifts, abrupt alignment, large type, energetic diagonals, early-modernist tension | This is an avant-garde editorial lens, not Admiralty typography |
| Jetset index | Experimental Jetset’s 2003 Dazzle Ship work | Helvetica, white space, small metadata, one precise image, disciplined scale | Helvetica is a contemporary historical frame, not a 1917 typeface |
| Chromatic induction | Carlos Cruz-Diez’s *Induction Chromatique à Double Fréquence* | Color as an unstable event changed by movement, viewpoint, and light | Keep this in contemporary/kinetic mode |
| Environmental field | Tobias Rehberger’s *Dazzle Ship London* | A graphic system that crosses hull, superstructure, and real architectural volume | Do not use it as evidence for WWI palette or scheme construction |
| Pop vessel | Peter Blake’s *Everybody Razzle Dazzle* | Emblems, circles, stripes, pop color, and the moving ship as public artwork | Keep the pop iconography separate from archive mode |
| Signal / screenprint | Ciara Phillips’s *Every Woman* | Social history, text as signal, reflective color, editioned print language, and acknowledgment of women’s labor | Avoid flattening the work into a generic pattern preset |
| Op-art study | 1960s optical art | Interference, afterimage, vibration, and motion-aware bands | Label it as a later optical-art extension |
| Architectural wrap | Supplied striped building studies | One field reorganizing multiple volumes and edges | Treat as a spatial-mapping reference rather than naval history |

### Art Mode Controls

- **Lens** — archive plate, Wadsworth, Lismer, BLAST, Jetset, Cruz-Diez, Rehberger, Blake, Phillips, or custom
- **Representation** — plan, model, drydock, harbor, periscope, poster, or architectural volume
- **Material** — flat paint, gouache, watercolor, woodcut/linocut, screenprint, newsprint, vinyl wrap, or clean vector
- **Field behavior** — contained, silhouette break, environmental spill, contour echo, reflection, or type integration
- **Historical distance** — archive reconstruction → interpretive study → contemporary response
- **Citation block** — artist/work/date/institution/reference note generated automatically for named lenses

Named artist lenses should use compositional principles, not copy a protected artwork or reproduce a signature motif one-for-one.

## Historically Credible 3D Ship Strategy

### Recommendation

Do not make an unverified marketplace mesh the historical default. The most credible path is to create a small, optimized in-house fleet from archival general arrangements, body plans, measurements, and photographs, then allow community and commercial models as clearly labeled imports.

Use three provenance levels:

| Level | Label | Standard |
| --- | --- | --- |
| A | Archive Reconstruction | Built or corrected against naval plans and period photographs; configuration date is known. |
| B | Historically Informed | Correct ship class and period proportions, but some fittings or geometry are generalized. |
| C | Visual Sandbox | Useful imported model with unknown or mixed historical accuracy. Never presented as archival truth. |

### Recommended Default Fleet

| Vessel archetype | Why it belongs | Recommended route |
| --- | --- | --- |
| 1917 merchant steamer | Merchant shipping was central to the British dazzle program and its broad hull is ideal for understanding heading deception. | Build a clean 60k–120k triangle house model from archival plans; use it as the performance baseline. |
| USS Nebraska (BB-14), 1918 fit | The U.S. Naval History and Heritage Command has a strong period photograph showing its elaborate scheme. It creates a dramatic pre-dreadnought silhouette. | Commission or construct a dated reconstruction from plans and photographs. |
| HMT Olympic or RMS/HMT Mauretania | The long ocean-liner hull makes false bow waves, reversed direction cues, and funnel contradictions especially legible. | License or rebuild an optimized model; preserve the distinction between liner, troopship, and exact wartime fit. |
| Early dreadnought or light cruiser | Adds turrets, casemates, bridge volumes, and more complex silhouette-breaking behavior. | Build from a selected class with surviving plans; avoid a generic “WWI battleship” label. |
| User-imported GLB | Lets the surface intelligence become a creative platform rather than a closed demo. | Analyze automatically, show confidence, and provide manual correction tools. |

### Current Off-the-Shelf Model Findings

These are useful candidates or pipeline tests, not automatically approved historical assets:

| Model | Availability found | Usefulness | Accuracy/licensing caution |
| --- | --- | --- | --- |
| Mauretania on Sketchfab | Downloadable, CC BY, about 529.5k triangles | Strong silhouette and period relevance; good high-detail stress test | Listing provides no provenance or configuration date. Must be compared with plans/photos and decimated before bundling. |
| USS Texas (BB-35) on Sketchfab | Downloadable, CC BY, about 484.2k triangles | Detailed warship geometry; useful for mapper testing | The listing identifies a game-derived model but not its fit. USS Texas changed heavily; a WWII configuration cannot stand in for 1918. |
| USS Olympia (C-6) on Sketchfab | About 26.9k triangles | Browser-friendly survivor with an excellent pre-dreadnought silhouette | Listing does not expose a download license in the research result. Visual proportions still require plan comparison. |
| HMS Dreadnought (1906) on Sketchfab | About 654.1k triangles | Good complexity test and recognizable early battleship | A university project with no visible download/license statement in the listing. Too heavy as-is. |
| HMS Dreadnought marketplace model | glTF/other formats listed commercially | Convenient format for WebGL evaluation | Marketplace title and render are not proof of a correct year/configuration. License must explicitly permit redistribution in a public web app. |
| Low-poly merchant ship on Sketchfab | Downloadable, CC BY, about 7.6k triangles | Excellent auto-analysis and mobile fallback test | Creator describes it as a work in progress. It is not an archive-grade ship. |

### Acquisition and Verification Checklist

Before a model can receive Level A or B status:

- Confirm vessel name, class, and represented year.
- Compare length-to-beam ratio, sheer, freeboard, bow and stern profiles, funnel count, mast placement, bridge position, and armament against plans.
- Compare port and starboard period photographs where available.
- Remove later refits that fall outside the selected date.
- Verify that the license permits modification, web delivery, poster output, and repository distribution.
- Record creator, source URL, license, modifications, date fit, and verification notes in an asset manifest.
- Produce desktop and mobile LODs while retaining silhouette-critical geometry.
- Preserve separate logical groups for hull, superstructure, funnels, turrets, decks, boats, and masts where possible.

### Recommended Asset Manifest

```json
{
  "id": "uss-nebraska-bb14-1918",
  "label": "USS Nebraska (BB-14)",
  "configurationYear": 1918,
  "provenanceLevel": "A",
  "sourceModel": "commissioned-reconstruction",
  "sourcePlans": [],
  "sourcePhotos": [],
  "license": "project-owned",
  "credit": "",
  "units": "meters",
  "forwardAxis": "+X",
  "upAxis": "+Y",
  "waterline": 0.31,
  "triangleCount": 118000,
  "semanticGroups": true,
  "verificationNotes": []
}
```

## Surface-Aware Mapping for Imported 3D Models

### Short Answer

Yes—normals and signed distance fields can materially improve mapping, but they should do different jobs.

- **Object-space position and surface normals** should drive the paint on the 3D ship.
- **A 2D silhouette SDF** should drive poster spill, contour echoes, bleed, and “camo leaving the ship.”
- **A full volumetric 3D SDF** should remain an optional advanced tool, not the first-line mapper. Many imported ship meshes are open, non-manifold, composed of hundreds of disconnected parts, or contain extremely thin masts and railings; those conditions make reliable inside/outside distance fields expensive and fragile.

### Proposed Import Pipeline

1. **Load**

   Accept `.glb` first, then `.gltf`. Offer OBJ conversion as a secondary workflow. Keep import local in the browser.

2. **Normalize**

   Compute a bounding box and principal axes. Assume the longest axis is bow-to-stern, the second is vertical or lateral, then ask the user to confirm **Bow**, **Up**, and **Port** with three one-click orientation controls.

3. **Clean and inspect**

   Merge safe static geometry for analysis, compute missing normals, flag non-manifold or degenerate meshes, and retain the original scene graph for rendering.

4. **Estimate semantic regions**

   - Lower, largest, elongated mass → hull candidate
   - Up-facing surfaces → decks
   - Volumes above the hull and near centerline → superstructure
   - Tall thin components → masts/rigging
   - Vertical cylindrical or box-like masses → funnels
   - Outboard small components → boats/secondary fittings

5. **Estimate waterline**

   Analyze horizontal occupancy slices through the lower half of the model and propose the strongest transition between the main hull body and underside. Show the result as an editable plane.

6. **Create canonical ship coordinates**

   ```text
   u = longitudinal position from stern (0) to bow (1)
   v = vertical position from keel (0) to highest point (1)
   s = signed lateral position: port (-) / starboard (+)
   ```

   These coordinates let one deterministic scheme map to models with unrelated UV layouts.

7. **Project independent sides**

   Render port and starboard orthographic position/normal/depth buffers. The 2D generator composes in canonical `u/v` space and the shader samples the correct side using the signed lateral coordinate.

8. **Gate by normals**

   Side-facing hull surfaces receive the main scheme at full strength. Deck-facing surfaces, near-horizontal fittings, and very thin structures can receive reduced, alternate, or excluded treatment.

9. **Let the user correct the analysis**

   Automatic detection must expose confidence and never become a black box. Provide a simple semantic brush with:

   - Hull
   - Superstructure
   - Deck
   - Funnel
   - Turret/fitting
   - Mast/rigging
   - Exclude

10. **Cache the result**

    Save orientation, waterline, semantic masks, and model attribution alongside the scheme JSON so the import only needs to be analyzed once.

### Normal-Driven Shader Logic

Normals make the pattern react to surface orientation without relying on a perfect UV map.

```glsl
vec3 n = normalize(objectNormal);
float sideFacing = smoothstep(0.15, 0.72, abs(dot(n, lateralAxis)));
float deckFacing = smoothstep(0.55, 0.92, dot(n, upAxis));

vec2 shipUV = vec2(
  dot(objectPosition - shipCenter, longitudinalAxis) / shipLength + 0.5,
  dot(objectPosition - shipMin, upAxis) / shipHeight
);

float sideSelector = step(0.0, dot(objectPosition - shipCenter, lateralAxis));
vec4 scheme = mix(samplePort(shipUV), sampleStarboard(shipUV), sideSelector);
```

Use the normal masks to control where the scheme is painted, but do not shade the color itself so strongly that lighting destroys the graphic read. Archive mode should support a mostly unlit, scale-model material with optional subtle ambient occlusion.

### Triplanar Mapping

Triplanar projection is useful for imported components whose UVs are missing or broken:

```glsl
vec3 weights = pow(abs(n), vec3(triplanarSharpness));
weights /= max(weights.x + weights.y + weights.z, 0.0001);
```

However, pure triplanar mapping is not enough for historical dazzle. It can make a stripe wrap around the bow, deck, and hull in visually neat but strategically meaningless ways. The main historical pattern should use the longitudinal/vertical ship field; triplanar projection is a seam-fixing and secondary-surface technique.

### Curvature and Structural Breaks

Use normal variation and screen-space derivatives to estimate sharp geometric changes:

- Strong curvature can attenuate or deliberately snap a graphic mass.
- Hard edges can become candidate anchors for false structural cues.
- `dFdx`, `dFdy`, and `fwidth` can anti-alias procedural edges and estimate local normal change in WebGL.
- A mesh BVH can accelerate raycasts, closest-point queries, side projections, and semantic correction brushes on dense models.

### SDF Plan

#### 2D Silhouette SDF — Recommended for V3

Render the selected ship or canonical side mask to a high-resolution binary texture, then compute a signed distance field.

Use it for:

- Pattern escape beyond the silhouette
- Controlled exterior bleed
- Multiple contour echoes
- A soft or hard cutout edge
- Distance-based type avoidance
- Poster crop and overscan systems
- Animated “construction” reveals
- A print-safe vector contour derived from the same silhouette

Conceptually:

```glsl
float d = sampleSilhouetteSDF(posterUV); // negative inside, positive outside
float exteriorBand = 1.0 - smoothstep(escapeStart, escapeEnd, d);
float shipMask = 1.0 - smoothstep(-edgeSoftness, edgeSoftness, d);
float fieldMask = mix(shipMask, exteriorBand, escapeAmount);
```

This directly enables the supplied reference in which the dazzle field exceeds the ship while remaining compositionally attached to it.

#### 3D SDF — Optional Research Track

A voxel SDF can support true surface-distance effects, volumetric halos, nearest-surface queries, and procedural booleans. It is appropriate only after:

- The mesh is watertight or has a reliable generalized winding/inside test.
- Thin parts are separated from the main hull field.
- Resolution and memory are bounded, such as a 96³ or 128³ half-float volume.
- Generation runs in a worker or on the GPU without freezing the interface.

For this project, a 2.5D pair of port/starboard fields plus normals will produce more controllable and historically meaningful results than a full 3D SDF at much lower cost.

### Failure Modes and Fallbacks

| Failure | Likely cause | Fallback |
| --- | --- | --- |
| Port and starboard are swapped | Imported axis metadata is unreliable | One-click **Flip Sides** control |
| Pattern paints the decks | Incorrect normal/up axis or low threshold | Adjust deck exclusion and repaint semantic mask |
| Pattern breaks across separate meshes | Independent object transforms or inconsistent scale | Convert samples into one normalized ship coordinate frame |
| Railings become solid stripes | Thin geometry inherits hull material | Exclude by semantic group, thickness, or component size |
| Waterline is too high/low | Complex hull or display stand included | Editable waterline plane |
| SDF leaks through openings | Non-watertight mesh | Use 2D silhouette SDF instead of volumetric sign |
| Imported model stalls mobile | Excessive triangles/materials/textures | LOD, meshopt/Draco, KTX2, material consolidation |

## Poster Generator

### Creative Direction

The poster generator should not feel like an export dialog. It is a second creative instrument fed by the exact same ship, scheme, seed, camera, metadata, and historical source record.

The default should be quiet and exact:

- White or warm uncoated-paper field
- Large black Helvetica title
- Compact project metadata
- Small ship image or orthographic render
- Strong negative space
- No decorative frame unless selected

The “spicy” behavior comes from scale, cropping, field continuation, and typographic tension—not from adding UI decoration.

### Poster Systems

1. **Jetset Index**

   A contemporary Helvetica system inspired by the restraint of the supplied Experimental Jetset reference: oversized title, severe line breaks, small top and bottom metadata, generous white space, and one precise ship image.

2. **Silhouette Break**

   The 2D SDF allows the dazzle composition to continue beyond the vessel. Controls determine whether the pattern escapes at the bow, stern, selected structural breaks, or across the full silhouette.

3. **Admiralty Docket**

   A plan-room composition using side elevations, port/starboard labels, design/type codes, palette chips, scale bars, waterline marks, and factual source notes. This is interpretive, but visually rooted in technical drawing and painted plan formats.

4. **Model Room**

   A tactile presentation with a scale model on a neutral stand, turntable angle, periscope crop, handwritten-style test notation, and a small reconstruction note.

5. **Vorticist Field**

   Black/ivory compression, hard diagonals, radiating infrastructure, and a dramatic ship perspective. Label this an art-historical interpretation, not an Admiralty document.

6. **Typographic Vessel**

   Type can clip into the ship silhouette, become a pattern layer, follow the waterline, or occupy the negative space created by the SDF—while preserving a readable metadata block.

7. **Archive Plate**

   A clean reproduction view with the documented scheme, source title, institution, date, and reconstruction confidence. Contemporary effects are disabled.

### Type Library

| Typeface option | Date/context | Role in the tool |
| --- | --- | --- |
| Helvetica / Helvetica Neue / Helvetica Now | Original Helvetica released in 1957 | Default contemporary editorial mode; explicitly not WWI-authentic |
| League Gothic | Open revival of Alternate Gothic No. 1 (1903) | Period-rooted condensed display option |
| Libre Franklin | Open interpretation of a 1912 Morris Fuller Benton classic | Period-rooted American grotesque option with a broad web-ready family |
| Johnston-inspired licensed face | Johnston was completed for the Underground in 1916 | British period-context option; not represented as a naval typeface |
| Custom uploaded font | User-provided WOFF2/OTF/TTF | Art-direction mode; embed only when licensing permits |
| System mono / technical labeling | Contemporary neutral tool face | Plan identifiers, measurements, coordinates, and export metadata |

Do not include Futura or Gill Sans inside a “1914–1918 authentic” filter: their original releases came later. They can appear in expanded modernism mode with dates shown.

### Type Controls

- Editable title, subtitle, vessel, class, year, scheme, source, caption, and footer
- Size, weight, width, optical size, tracking, leading, baseline shift, case, and alignment
- Variable-font axes where available
- Grid columns, margins, gutters, and baseline grid
- Line-break lock and per-line scale
- Type rotation and vertical setting
- Solid, outline, knock-out, overprint simulation, and halftone type
- Fit-to-box, fit-to-line, and controlled overflow
- Type inside ship, outside ship, along waterline, or avoiding the silhouette SDF
- Live missing-glyph and license warnings for uploaded fonts

### Pattern Escape Controls

- **Escape amount** — how far the field travels outside the vessel
- **Escape origin** — bow, stern, waterline, superstructure, full silhouette, or manual point
- **Direction** — radial, longitudinal, perspective, camera-facing, or pattern-driven
- **Contour echoes** — repeated SDF bands outside the hull
- **Cutout** — preserve the ship, invert it, or let the poster field replace it
- **Bleed** — crop to trim or continue through document bleed
- **Occlusion** — keep type above, below, or woven through the escaped field
- **Decay** — hard edge, linear fade, halftone breakup, noise erosion, or no decay

### Print Output

- Presets: A0–A4, 18×24, 24×36, 4:5, square, story, and custom
- 300 DPI raster export with tiled rendering for large sizes
- SVG/PDF vector export for type, silhouette, and procedural geometry where possible
- CMYK-friendly palette preview and total-ink warning, while acknowledging browser output remains RGB unless converted downstream
- 3 mm / 0.125 in bleed options
- Crop marks, registration marks, and metadata slug
- Optional paper grain/print simulation in preview only; clean art remains exportable
- Credit line generated from the asset and archive manifests

## Archive Room — Searchable Gallery and Catalog

### Intent

The gallery should be a core workspace, not a decorative carousel. It should feel like a cross between a museum study room, naval plan archive, and design catalog.

The catalog connects five kinds of evidence:

1. **Paint plans** — port/starboard elevations, type/design sheets, palette notes, and component callouts.
2. **Ship plans** — general arrangements, body plans, profiles, deck plans, and dimensions used to verify or construct 3D geometry.
3. **Wartime photographs** — evidence of how a plan looked at scale, at sea, in harbor, under haze, and after real-world painting.
4. **Models and artworks** — painted test models, Wadsworth/Lismer-era works, later scholarship, and public-art reinterpretations.
5. **Contemporary responses** — Experimental Jetset, 14–18 NOW commissions, architectural wraps, poster studies, and user-created results.

The important object is not only the image. It is the relationship:

```text
VESSEL
  ├── ship plan / blueprint
  ├── port paint plan
  ├── starboard paint plan
  ├── detail paint callouts
  ├── wartime photograph
  ├── physical test model
  ├── verified 3D reconstruction
  └── related artwork / contemporary response
```

### Launch Target

- **250+ reviewed catalog records**
- **100+ rights-cleared high-resolution images stored locally**
- Additional restricted items represented by metadata, an institution-approved thumbnail where permitted, and a direct source link
- At least 25 vessel clusters that connect two or more evidence types
- At least 12 archive paint-plan families with port/starboard or design variants
- Every public item carries a source, rights status, and confidence level

The crawler can discover far more than the launch set, but a human-reviewed 250 records is more valuable than thousands of unverified duplicates.

### Gallery Views

1. **Contact Sheet**

   Dense thumbnail grid with persistent metadata and no decorative cards. Optimized for fast scanning.

2. **Long Plate**

   Panoramic side-elevation viewer for the extremely wide paint plans. Supports deep zoom without forcing the plan into a tiny contain-fit thumbnail.

3. **Fleet Wall**

   Normalizes multiple ships to the same apparent length and waterline. Users can compare edge vocabulary, palette, activity center, and bow/stern treatment.

4. **Evidence Stack**

   Shows a paint plan, ship blueprint, photograph, model, and reconstruction aligned around the same vessel.

5. **Light Table**

   Compare any two records with swipe, opacity, difference, edge, and silhouette overlays.

6. **Timeline**

   1914–1919 operational development, interwar/Second World War use, postwar art, 2003 Experimental Jetset, and the 2014–2018 14–18 NOW commissions.

7. **Palette Map**

   Groups records by extracted dark/light structure and period paint families while retaining a warning when colors come from aged or uncalibrated scans.

8. **Visual Grammar Map**

   Browse by ribbon, field, fracture, wave, chevron, false bow, false waterline, terminal, and structural bridge.

9. **Source Shelf**

   Browse institution by institution so provenance remains visible.

### Filters

- Record type
- Institution/collection
- Country/navy/service
- Date or date range
- Vessel name and aliases
- Ship class/archetype
- Type and design code
- Port/starboard/end/detail view
- Palette role and dominant color
- Edge vocabulary
- Mass topology
- Deception objective
- Creator/designer where known
- Provenance confidence
- Rights: public domain, CC0, CC BY, licensed, link-only, unknown
- High-resolution available
- 3D model available
- Reconstruction available

### Catalog Item Page

Every item should include:

- Deep-zoom image or institution-approved preview
- Exact title and catalog identifier
- Institution and collection
- Source link
- Date and represented configuration year
- Vessel name, aliases, class, and dimensions
- Port/starboard/detail designation
- Type/design labels transcribed from the sheet
- Creator, drafter, painter, or office where known
- Original medium and physical dimensions
- Rights/license/credit
- OCR transcription with uncertain text visibly marked
- Extracted palette with scan-color warning
- Visual grammar tags
- Related records
- **Open in Scheme Studio**
- **Compare**
- **Add to Board**
- **Report metadata issue**

### Curated Catalogs

- Dominant Black
- False Bows and Reversed Direction
- Ribbon and Serpent Schemes
- Type 2 / 3 / 8 / 11 / 14 / 17
- Port and Starboard Are Not Twins
- Standard Ships and Merchant Steamers
- Funnels as False Direction Cues
- Model Room and Viewing Tank
- Women of the Dazzle Section
- Wadsworth and Vorticist Afterlives
- Dazzle in Canadian War Art
- 14–18 NOW
- Contemporary Graphic Design and Architecture
- User Reference Board

### User-Supplied S.S. War Penguin Record

The new S.S. **War Penguin** sheet is an ideal seed cluster rather than a standalone mood image.

Research identifies the ship as an American freighter completed in 1917 and later renamed **Lakeport**. The Naval History and Heritage Command catalogs a completion-era photograph as **NH 94487**. Additional ship-history research places it as a precursor to Emergency Fleet Corporation Design 1020, the “Laker Type A,” which gives the project a route toward matching dimensions and geometry.

The supplied composite appears to contain:

- A purple/black design with component callouts
- A pale green/black/ochre design on a technical elevation
- A red/black/pale gray alternative
- Hand annotations, color information, ship number/design identifiers, and detail views

Catalog actions:

1. Split the composite into separate child records without destroying the parent scan.
2. OCR and manually verify vessel, design, view, and color notes.
3. Link it to NHHC photograph NH 94487.
4. Link it to the War Penguin/Lakeport alias record.
5. Link it to EFC Design 1020 precursor dimensions and related Laker ships.
6. Mark the current scan’s owning institution and reuse rights as **unresolved** until the original catalog record is found.
7. Create a reconstruction study only after the source/rights record is resolved.

### Catalog Data Model

```json
{
  "id": "nhhc-nh-94487",
  "recordType": "photograph",
  "title": "S.S. War Penguin",
  "institution": "U.S. Naval History and Heritage Command",
  "collectionId": "NH 94487",
  "canonicalUrl": "",
  "date": "1917-10",
  "vesselId": "war-penguin-1917",
  "vesselAliases": ["Lakeport", "USS Lakeport"],
  "classOrDesign": "EFC Design 1020 precursor",
  "view": "unknown",
  "side": "unknown",
  "schemeType": null,
  "schemeDesign": null,
  "creator": null,
  "rights": {
    "status": "review-required",
    "license": null,
    "credit": "",
    "localMediaAllowed": false
  },
  "media": {
    "thumbnail": "",
    "image": "",
    "iiifManifest": null,
    "width": null,
    "height": null
  },
  "visualGrammar": [],
  "palette": [],
  "ocr": {
    "text": "",
    "confidence": 0
  },
  "related": [],
  "review": {
    "status": "needs-review",
    "notes": []
  }
}
```

## Archive Crawler

### Architecture

Run the crawler as a build-time or editorial tool, not inside every visitor’s browser.

```text
Source adapters
    ↓
Raw metadata/media references
    ↓
Normalization
    ↓
Rights gate
    ↓
OCR + palette + perceptual hash
    ↓
Entity matching and deduplication
    ↓
Human review queue
    ↓
Static catalog index + search data
    ↓
Archive Room
```

This avoids CORS problems, protects API keys, respects institutional rate limits, and makes the public gallery fast and deterministic.

### Source Priority

| Source | Best material | Access route | Media policy |
| --- | --- | --- | --- |
| U.S. Naval History and Heritage Command | Primary WWI paint plans and ship photographs | Curated collection pages and item metadata | Review the rights/credit statement for each item before caching |
| U.S. National Archives | Navy photographs, plans, maps, charts, and related records | Catalog API with API key | Ingest rights metadata; public federal records are promising but not assumed automatically |
| Library of Congress | Photographs, prints, drawings, posters, and engineering material | Public JSON API plus IIIF image services | Respect each item’s rights advisory; API has published rate limits |
| Wikimedia Commons | Broad discovery set and reusable media | MediaWiki API: category members + image info + `extmetadata` | Cache only records whose machine-readable license is compatible |
| Smithsonian Open Access | Public-domain 2D/3D collection records | Open Access API | Prefer records explicitly marked CC0 |
| Historic Naval Ships Association / Maritime.org | General arrangements and ship plans | Curated index crawl | Treat plan-page terms and individual source credit as authoritative |
| Imperial War Museums | Painted models, model-room process, photographs, and art | Curated metadata/source links | Default to link-only unless a reuse license explicitly permits local media |
| Canadian War Museum | Arthur Lismer, Olympic, harbor works, and related records | Curated collection links | Default to link-only pending item-specific rights |
| National Gallery of Canada | Edward Wadsworth and related art | Curated collection links | Metadata/source link; artwork image rights reviewed separately |
| Liverpool Biennial / Tate / Edinburgh Art Festival | Rehberger, Cruz-Diez, Blake, Phillips, 14–18 NOW | Curated project pages | Contemporary copyrighted works remain link-first |
| User reference board | Supplied scans, screenshots, and research images | Manual ingestion | Mark **needs-source** until institution, identifier, and rights are resolved |

### Initial Search Vocabulary

The crawler should query more than “dazzle camouflage”:

- dazzle ship
- dazzle painting
- razzle dazzle ship
- ship camouflage design
- camouflage plan ship
- camouflage drawing vessel
- disruptive ship camouflage
- type design port copy
- type design starboard copy
- Ministry of Shipping camouflage
- Bureau of Construction and Repair camouflage
- submarine periscope camouflage test
- painted ship model
- camouflage viewing tank
- vessel name + dazzle/camouflage
- known identifiers such as NH 94487
- ship aliases before and after naval service

### Source Adapters

Each adapter implements the same contract:

```ts
interface CatalogSourceAdapter {
  sourceId: string;
  search(query: string, cursor?: string): Promise<SearchPage>;
  fetchRecord(id: string): Promise<RawRecord>;
  normalize(record: RawRecord): CatalogRecord;
  getRights(record: RawRecord): RightsAssessment;
  throttle: {
    requestsPerMinute: number;
    concurrent: number;
  };
}
```

Recommended first adapters:

1. `wikimedia-commons`
2. `library-of-congress`
3. `nhhc-curated`
4. `nara-catalog`
5. `smithsonian-open-access`
6. `manual-reference`

The first three can establish the catalog shape. NARA and Smithsonian add depth after API credentials and record matching are in place.

### Enrichment Pipeline

1. **OCR**

   Extract Type, Design, Port Copy, Starboard Copy, vessel names, dimensions, scale, dates, paint notes, and handwritten annotations. Preserve the uncorrected OCR and reviewer correction separately.

2. **Palette extraction**

   Use perceptual LAB clustering, but sample both painted areas and paper independently. Store scan colors and interpreted paint colors as different fields.

3. **Silhouette extraction**

   Detect the long ship outline for normalized Fleet Wall comparison and SDF generation.

4. **Perceptual hash**

   Find duplicate scans, crops, color-shifted reposts, and low-resolution copies.

5. **Entity matching**

   Match ship names, prefixes, spelling variants, later names, hull numbers, and class/design identifiers.

6. **Visual grammar suggestion**

   Suggest ribbon, field, fracture, wave, chevron, terminal, and dominant-mass tags. A curator confirms or rejects them.

7. **Rights gate**

   No image reaches the public media bundle until license/rights and required attribution pass review.

### Rights States

| State | Gallery behavior |
| --- | --- |
| Public domain / CC0 | Cache full-resolution media and allow reconstruction/derivative tools |
| CC BY | Cache only with complete creator/source/license credit |
| Licensed for project | Cache according to agreement |
| Thumbnail/educational display permitted | Store/display the permitted derivative only |
| Link-only | Show metadata, source link, and permitted preview if provided by the institution |
| Unknown / needs source | Keep in private review board; do not publish |

### Review Queue

Every discovered record should have one of these statuses:

- `new`
- `duplicate-suspected`
- `metadata-incomplete`
- `rights-review`
- `historical-review`
- `visual-tags-review`
- `approved-link-only`
- `approved-media`
- `rejected`

Review actions should be quick:

- Confirm/merge vessel
- Confirm date
- Confirm side/view
- Confirm type/design
- Confirm rights
- Correct OCR
- Approve palette
- Link related records
- Publish

### Search Index

Generate a static search index with:

- Exact identifiers and vessel names weighted highest
- Aliases and OCR text
- Institution, creator, class, type, and design
- Visual grammar and palette tags
- Rights and media availability
- Related-record graph

The public site should not need a live database for the first release. A versioned `catalog.json`, small search index, and media manifest keep GitHub Pages deployment possible.

### Crawler Safety and Etiquette

- Prefer official APIs and IIIF over HTML scraping.
- Honor `robots.txt`, API terms, rights statements, and published rate limits.
- Use a descriptive user agent and contact address.
- Cache responses and support incremental updates.
- Back off on `429` and `5xx` responses.
- Never bypass authentication, paywalls, download controls, or technical restrictions.
- Do not hotlink full-resolution images unless the institution explicitly supports it.
- Keep API keys on the build side and out of the public repository.
- Preserve canonical source URLs even when media is cached.
- Make deletion/takedown straightforward by source ID.

## Learning Experience and Takeaway

### Make Every Control Explain Itself

Historical controls should state both action and consequence:

- **False course** — rotates dominant diagonals away from the real heading.
- **False bow** — builds a high-contrast termination inside the true hull length.
- **False speed** — displaces the bow-wave cue and compresses or stretches the apparent waterline.
- **Range disruption** — increases conflicting alignments near high-information edges.
- **Class confusion** — crosses or visually relocates funnels, bridge, turrets, and deck breaks.

Each control can reveal a one-sentence archival note, a diagram, and a “show me” animation that isolates the affected layer.

### Viewing-Tank Tests

1. **True vs apparent heading**

   Show the actual heading and let the user mark the heading they perceive before revealing the difference.

2. **Bow/stern identification**

   Flash the vessel briefly at low resolution and ask which direction it is traveling.

3. **Distance collapse**

   Reduce the ship to realistic periscope scale and blur until only major masses remain.

4. **Coincidence rangefinder**

   Split the image into two halves and let the user align them, demonstrating how conflicting edges affect the task.

5. **Sea conditions**

   Evaluate against haze, cloud, sea glare, low sun, fog, grayscale, and moving water.

6. **Before/after**

   Compare unpainted, archive scheme, generated scheme, and poster interpretation without changing the camera.

### Exported Scheme Card

Every finished design can generate a second takeaway in addition to the poster:

- Vessel and configuration year
- Archive/historical/contemporary mode
- Deception objective
- Real and apparent heading result
- Port and starboard thumbnails
- Palette with names/values
- Seed and key parameters
- Source institutions and links
- Model creator/license/credit
- Reconstruction confidence
- Short plain-language explanation

This turns the export into evidence of learning rather than only an attractive image.

## Data Model Additions

```json
{
  "mode": "archive | historical | contemporary",
  "vessel": {
    "assetId": "",
    "configurationYear": 1918,
    "provenanceLevel": "A",
    "orientation": {},
    "waterline": 0.31,
    "semanticMaskId": ""
  },
  "deception": {
    "objective": "false-course",
    "actualHeading": 72,
    "impliedHeading": 38,
    "falseBow": 0.64,
    "falseSpeed": 0.18,
    "rangeDisruption": 0.42
  },
  "poster": {
    "system": "jetset-index",
    "format": "A2",
    "typeface": "Helvetica Neue",
    "typeMode": "contemporary",
    "escape": 0.35,
    "escapeOrigin": "bow",
    "bleed": true
  },
  "sources": [],
  "credits": []
}
```

## V3 Interface Architecture

Keep the existing settings, but reorganize them around intent:

| Workspace | Primary controls |
| --- | --- |
| Archive | Search, catalog filters, Contact Sheet, Long Plate, Fleet Wall, Evidence Stack, Light Table, boards |
| Ship | Default vessel, import, orientation, waterline, semantic masks, geometry debug |
| Scheme | Archive plate, deception objective, dominant masses, false cues, palette, seed |
| Evaluate | Port/starboard, heading, distance, haze, periscope, value, rangefinder, sea state |
| Surface | Projection mode, normal gates, side bleed, deck behavior, superstructure behavior, mapping debug |
| Poster | Template, format, type, grid, pattern escape, paper/print preview |
| Learn | Layer construction, historical notes, source comparison, test results |
| Export | Poster, scheme card, PNG, SVG, PDF, GLB preview, JSON |

### Expert Debug Views

- Object-space coordinates
- Surface normals
- Port/starboard selector
- Semantic classification
- Waterline mask
- Curvature estimate
- Projected position/depth buffers
- 2D SDF
- Pattern field before masking
- Final material contribution

## V3 Implementation Sequence

### Phase 0 — Archive Foundation

- Build the normalized catalog schema, rights gate, and manual-reference adapter.
- Add Wikimedia Commons, Library of Congress, and curated NHHC source adapters.
- Establish the vessel/alias graph and related-record system.
- Ingest the supplied reference board as private `needs-source` records.
- Curate the first 250 records and 25 vessel evidence clusters.
- Ship Contact Sheet, Long Plate, Fleet Wall, Evidence Stack, and item-detail views.

### Phase 1 — Historical Core

- Add the three-mode historical boundary.
- Replace style-first generation with deception objectives.
- Add archive-source metadata and reconstruction confidence.
- Create one verified merchant steamer default.
- Build periscope, low-resolution, grayscale, and before/after tests.

### Phase 2 — Surface Intelligence

- Add GLB import and orientation confirmation.
- Generate canonical ship coordinates.
- Add port/starboard side projections and normal-gated mapping.
- Add editable waterline and semantic correction brush.
- Add mapping debug views and cached import profiles.

### Phase 3 — Poster Press

- Build Jetset Index, Silhouette Break, Admiralty Docket, Model Room, and Vorticist Field systems.
- Add Helvetica contemporary mode plus period-rooted type options.
- Add 2D silhouette SDF and pattern escape.
- Add large-format tiled PNG and vector-first SVG/PDF export.
- Add complete credit/source slugs.

### Phase 4 — Learning Layer

- Add construction timeline and isolated layer playback.
- Add apparent-heading, bow/stern, and coincidence-rangefinder interactions.
- Add the exported scheme card and historical debrief.
- Add side-by-side archive reference studies.

### Phase 5 — Polish and Performance

- Add desktop/mobile LODs, worker-based mesh analysis, compressed geometry/textures, and Safari QA.
- Add animation and turntable export.
- Add saved projects, comparison boards, and remixable source-linked presets.

## Acceptance Criteria for V3

- A first-time visitor can explain in one sentence why dazzle was different from concealment.
- Every archive preset exposes a source and confidence level.
- The Archive Room launches with at least 250 reviewed records and no unknown-rights media in the public bundle.
- Search can connect a vessel’s paint plan, ship plan, photograph, model, and related artwork.
- Restricted records remain useful as credited metadata/source links without copying unlicensed full-resolution media.
- The generator can articulate what false cue it is trying to create.
- Port and starboard remain independent across editing, mapping, testing, and export.
- One imported GLB with poor or missing UVs can receive a coherent longitudinal/vertical scheme.
- The user can correct orientation, waterline, and semantic classification without leaving the browser.
- Main patterns do not automatically flood decks, railings, or masts.
- Poster escape is driven by the actual ship silhouette and remains synchronized with the 3D scheme.
- Helvetica is labeled contemporary; period-rooted options show their dates and context.
- The poster and scheme card contain automatic source/model credits.
- The experience runs on Safari and offers an appropriate mobile LOD/fallback.
- Deterministic JSON restores ship mapping, scheme, evaluation, poster, type, and source state.

## Research Sources and Working Links

### History and Archives

- [Dazzle camouflage — Wikipedia](https://en.wikipedia.org/wiki/Dazzle_camouflage) — useful overview of intended purposes, possible mechanisms, Wilkinson’s model-room process, and the mixed evidence of effectiveness.
- [Dazzle Paint Ship Camouflage Designs — U.S. Naval History and Heritage Command](https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-.html) — primary institutional collection of surviving U.S. and British pattern plates.
- [Type 2 Design L — NHHC](https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-/type-2-design-l-camouflage.html)
- [Type 6 Design T, port side — NHHC](https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-/type-6-design-t-port-side-camouflage.html)
- [British Type 11 Design JX — NHHC](https://www.history.navy.mil/our-collections/art/exhibits/conflicts-and-operations/wwi/dazzle-paint-ship-camouflage-designs-/british-dazzle-camouflage-for-type-11--design-jx--ministry-shipp.html)
- [USS Nebraska, circa June–July 1918 — NHHC](https://www.history.navy.mil/our-collections/photography/us-navy-ships/battleships/nebraska-bb-14/NH-50066.html)
- [Dazzle Ship — Imperial War Museums](https://www.iwm.org.uk/partnerships/mapping-the-centenary/projects/dazzle-ship)
- [IWM First World War Galleries large-print guide](https://www.iwm.org.uk/sites/default/files/files/2023-10/first_world_war_large_print_guide.pdf) — includes the model-testing context.
- [Booklets of General Plans — Historic Naval Ships Association / Maritime.org](https://maritime.org/doc/plans/)
- [Sources of Ship Plans — NHHC](https://www.history.navy.mil/research/histories/ship-histories/sources-of-ship-plans.html)

### Art Direction

- [Dazzle Ship — Experimental Jetset](https://www.jetset.nl/archive/dazzleship)
- [Experimental Jetset scale models](https://www.jetset.nl/archive/scale)
- [Dazzle Ship Camouflage — ISO50](https://blog.iso50.com/30771/dazzle-ship-camouflage/)
- [Dazzleships in Dry Dock at Liverpool — Edward Wadsworth, National Gallery of Canada](https://www.gallery.ca/collection/artwork/dazzleships-in-dry-dock-at-liverpool)
- [Olympic with Returned Soldiers — Arthur Lismer, Canadian War Museum](https://www.warmuseum.ca/firstworldwar/objects-and-photos/art-and-culture/official-art/olympic-with-returned-soldiers/)
- [Dazzle Ship London — Tobias Rehberger](https://www.biennial.com/project/tobias-rehberger-dazzle-ship-london/)
- [Everybody Razzle Dazzle — Peter Blake](https://www.biennial.com/project/sir-peter-blake-dazzle-ferry/)
- [Every Woman — Ciara Phillips](https://edinburghartfestival.com/edinburgh-art-festival-and-14-18-now-unveil-every-woman-by-ciara-phillips/)
- [Vorticism — Tate](https://www.tate.org.uk/art/art-terms/v/vorticism)
- [BLAST: the Vorticist manifesto — Tate](https://www.tate.org.uk/art/art-terms/v/vorticism/blast-radical-vorticist-manifesto)
- [Op art — Tate](https://www.tate.org.uk/art/art-terms/o/op-art)

### Archive and Catalog APIs

- [National Archives for Developers](https://www.archives.gov/developer)
- [National Archives Catalog API: getting started](https://www.archives.gov/research/catalog/help/api-getting-started)
- [Library of Congress APIs](https://www.loc.gov/apis/)
- [Library of Congress JSON/YAML requests](https://www.loc.gov/apis/json-and-yaml/requests/)
- [Library of Congress rate limits](https://www.loc.gov/apis/json-and-yaml/working-within-limits/)
- [Smithsonian Open Access](https://www.si.edu/openaccess)
- [Smithsonian Open Access developer tools](https://www.si.edu/openaccess/devtools)
- [MediaWiki category members API](https://www.mediawiki.org/wiki/API:Categorymembers)
- [S.S. War Penguin, NH 94487 — NHHC](https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/NH-94000/NH-94487.html)

### Candidate 3D Models

- [Mauretania — Sketchfab](https://sketchfab.com/3d-models/mauretania-b280e915c2554a3cbc9bf0eada9a8a1b)
- [USS Texas (War Thunder) — Sketchfab](https://sketchfab.com/3d-models/uss-texas-war-thunder-442bbf0fbe784c17abb3f6394f1a3d94)
- [USS Olympia (C-6) — Sketchfab](https://sketchfab.com/3d-models/uss-olympia-c-6-019b83efbdd84c80baede4ded67d8b51)
- [HMS Dreadnought (1906) — Sketchfab](https://sketchfab.com/3d-models/dreadnought-3efda34ffa704458b137eca87cb315d2)
- [Low-poly merchant ship — Sketchfab](https://sketchfab.com/3d-models/merchant-ship-c45b1fa4090a44bca0318091f7fb4476)
- [Commercial Dreadnought listings — Free3D](https://free3d.com/premium-3d-models/dreadnought)

### Type

- [League Gothic — The League of Moveable Type](https://www.theleagueofmoveabletype.com/league-gothic)
- [Libre Franklin — Google Fonts](https://fonts.google.com/specimen/Libre%2BFranklin)
- [Edward Johnston and the Underground lettering — London Transport Museum](https://www.ltmuseum.co.uk/collections/stories/people/edward-johnston-man-behind-londons-lettering)
- [Helvetica Now Variable — Monotype](https://www.monotype.com/resources/font-stories/helvetica-now-variable)

### WebGL and Geometry

- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) — accelerated raycasting and spatial queries for Three.js meshes.
- [OES_standard_derivatives — MDN](https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives) — `dFdx`, `dFdy`, and `fwidth`; built into WebGL 2.
- [Distance functions — NVIDIA GPU Gems 2](https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-8-pixel-displacement-mapping-distance-functions)

## Future-Agent Handoff

When modifying the project:

1. Do not break the shared document that links 2D and 3D.
2. Do not initialize WebGL or Three.js in a server environment.
3. Keep archive-informed and expanded treatments visibly separated.
4. Test port and starboard independently.
5. Verify deterministic seeds after changing generation logic.
6. Test the no-WebGL fallback.
7. Test the live GitHub Pages path, not only a local development server.
8. Check Safari and narrow mobile layouts before considering a release complete.
9. Preserve SVG, PNG, and JSON export behavior.
10. Favor meaningful deception controls over adding undirected visual noise.

## Potential Next Phase

- Execute the V3 implementation sequence above.
- Commission the first Level A merchant steamer and USS Nebraska reconstruction.
- Clear redistribution rights for any third-party model before it enters the public repository.
- Prototype the canonical ship-coordinate shader and 2D silhouette SDF before attempting a volumetric SDF.
- Produce the Jetset Index and Silhouette Break poster systems first; they establish the strongest contemporary art direction.

## Case Study Structure

For a future portfolio page, present the project in this order:

1. **The premise** — Can a century-old optical-deception system become a contemporary generative design instrument?
2. **The correction** — Dazzle is vessel-specific visual strategy, not random striping.
3. **The system** — One deterministic document drives linked 2D and 3D outputs.
4. **The controls** — High-level art-direction parameters shape procedural grammars.
5. **The historical boundary** — Archive-informed tools remain distinct from the expanded print lab.
6. **The outcome** — A responsive browser-based instrument that generates, evaluates, and exports repeatable schemes.

## Project Status

**V2 is built, committed, deployed, and live on GitHub Pages.**

The current release includes the linked 2D/3D generator, nine pattern grammars, independent side generation, deep composition controls, expanded halftone and gradient systems, evaluation modes, and SVG/PNG/JSON export.

**The first V3 experience layer is implemented in the current hosted build.**

It adds the four-room Studio / Poster Press / Archive Room / Field Notes structure, source-aware archive records, four vessel studies, local GLB import, surface-normal-aware mapping, silhouette-SDF pattern spill, and a borderless poster generator with raw-field and mesh-wrap treatments. The poster vessel grammar currently includes 20 hull profiles, 10 abstract gun configurations, 13 mast configurations, and 20 optional fittings.

The larger specification remains intentionally ahead of the prototype. The 250-record reviewed archive, production crawler pipeline, commissioned historically exact models, full evidence-cluster coverage, and final preservation/export systems are still future work.
