# GTNH Stargate: real crafting path, endgame references and Hyperstargate 10x target

Work package RF-4A (issue #34). Research only. No GTNH code, text or assets are copied: all figures below are
paraphrased numbers and mechanics. Where a figure comes from code it is labelled with the exact tag.

## 1. Versions and sources

| Source | Version | Used for |
|---|---|---|
| GTNewHorizons/NewHorizonsCoreMod | tag `2.9.99` (commit 9f108160f88f7d6ba7e20d830eeee760d7198144, 2026-10-30) | Stargate grid recipes (`dreammaster/scripts/ScriptSGCraft.java`), BEC recipes (`gthandler/recipes/BECRecipes.java`, `addSGRecipes`), crystal blast furnace and mixer recipes |
| GTNewHorizons/GT5-Unofficial | tag `5.09.54.265` | BEC assembler machine, meta-material recipes, Transcendent Plasma Mixer, Plasma Forge, voltage constants |
| GTNewHorizons/SGCraft | latest tag `1.4.14-GTNH` | Gate structure (MIT fork of gcewing's SGCraft) |
| GTNH modpack | 2.9.0 (2026-10-31) | The code above ships in this pack |
| GTNH wiki, page "Stargate" | written for 2.9 | Structure, high-level cost; its low-level (raw) list is dated 2.7-2.8 |

Rule used: the code at the tags above is authoritative. The wiki lags it in places (see the capacitor in 3.1).

## 2. Structure and upgrades

- Vertical hollow 5x5 square: 8 Ring Blocks, 7 Chevron Blocks, 1 Base, plus 1 Controller and 1 RF Power Unit.
- Chevron Upgrade: 9-symbol dialling and interdimensional travel on both ends. Iris Upgrade: closeable shield.
- Portals are one-way and last 5 minutes. The OpenComputers interface is optional for play but the Controller recipe consumes one OC Interface.
- Every component is a 9x9 "Extreme Crafting" grid (AE2 Extreme Crafting Table). Grids are fed by subcomponents made in
  three machines: Bose-Einstein Condensate (BEC) Assembler, Transcendent Plasma Mixer and Blast Furnace.

## 3. Crafting tree

### 3.1 Final 9x9 grids (per craft, from `ScriptSGCraft.java` at 2.9.99)

All grids are crafted in the AE2 Extreme Crafting Table (no voltage, no research). "Field Gen/Piston/Sensor/Emitter" are UXV tier.

| Output | Inputs (count x item) |
|---|---|
| Ring Block | 19 Frame Part, 11 Radiation-Containment Plate, 10 Field Energy Absorber Casing, 9 Dark Matter Block, 9 Field Gen, 5 Magmatter Block, 3 Precision Field Sync Casing, 3 Chevron, 2 Waveguide3 |
| Chevron Upgrade | 22 Superdense Magmatter plate, 15 Frame Part, 4 Chevron, 3 Piston, 2 Field Gen, 2 Waveguide3, 1 Sensor, 1 Emitter |
| Chevron Block | 1 Ring Block, 4 Chevron Upgrade, 16 Plate, 8 Absorber Casing, 8 Dark Matter Block, 4 Sync Casing, 4 Magmatter Block, 4 Waveguide3, 4 Field Gen, 4 Graviton Flow Modulator T3 |
| Base | 8 Chevron Block, 16 Plate, 16 Magnetic Chassis T3, 6 Astral Array Fabricator, 4 Transdimensional Alignment Matrix, 4 Energy Conduit3, 4 Magmatter Nanite, 4 Graviton Modulator, 4 Mega Ultimate Battery (ZPM6), 4 Universal Collapser, 4 Electrograviticvalve3, 2 Mining Drone, 2 Space Elevator Assembler Module T3, 1 AE2 universe cell, 1 universe fluid cell, 1 Stargate Core Crystal |
| Ridiculously Large Capacitor | 16 Plate, 10 chaotic (creative) capacitor bank, 9 UMV Lapotronic Supercap, 8 Stellar Energy Siphon Casing, 4 Chassis, 4 Field Gen, 1 LSC, 1 wireless tunnel. The wiki's 2.9 table differs (about 16 Field Gen and 64 Plate); code wins |
| Iris Blade (x24) | 26 White Dwarf plate, 12 Magmatter plate, 7 Black Dwarf plate, 4 Piston, 1 ZPM6, 1 Condensate Transformative Coil |
| Iris Upgrade | 24 Iris Blade, 12 Absorber Casing, 12 Magmatter Nanite, 4 Dark Matter Block, 1 Chassis |
| RF Power Unit | 16 Absorber, 11 Chassis, 10 Transformative Coil, 6 Dark Matter Block, 6 Magmatter Nanite, 4 Large Capacitor, 3 Sync Casing, 2 GigaChad, 2 Resonance Chamber T4, 1 Ring Block, 1 ZPM6 |
| OC Interface | RF-Power-Unit layout with 4 Singularity Crafting Storage, 1 wireless data hatch, 2 Energy Conduit3 |
| Controller | 9 Sync Casing, 8 OC keyboards, 8 Frame Part, 6 Absorber, 6 Plate, 4 Dark Matter Block, 2 Field Manipulator T4, 1 Field Gen, 1 ZPM6, 1 Controller Crystal, 1 OC Interface, 1 universe fluid cell, 1 Arithmetic combined singularity |

"Plate" = Radiation-Containment Plate. Craft multipliers (derived): 25 Ring Blocks (8 structure + 15 consumed by Chevron Blocks + 1 RF + 1 OC),
15 Chevron Blocks (7 + 8 for the Base), 61 Chevron Upgrades (15x4 + 1), 4 Large Capacitors, 24 Iris Blades.

### 3.2 Subcomponents (the real work)

| Output | Machine, tier | Inputs | Notes |
|---|---|---|---|
| Radiation-Containment Plate | BEC Assembler, UXV recipe | 64 each: EOH Temporal Casing, EOH Spatial Casing, Harmonic Phonon Conduit, Coherence Plasma Conduit, combined singularity; 16 Eternity + 16 Spacetime + 8 Universium + 8 MHDCSM superdense plates; 16 MAX circuits; 32 Sensor; 32 Emitter; nanites 32 WD, 16 BD, 8 Universium, 4 Magmatter; fluids 1.024M L QGP condensate, 256k L Phonon condensate, 4,096 ingots Magmatter, 1,024 ingots MHDCSM | base time 8,000,000 s |
| Chevron | BEC, UXV | 64 each: Fine Structure Constant Manipulator, Wave Focus T4, exquisite Amalgatite, Shielding3, Waveguide3, Conduit3, Valve3, Piston, Robot Arm; 4 Astral Array; 16 Magmatter frames, 16 MHDCSM frames; 8 Magmatter + 8 MHDCSM sd plates; 32 Field Gen; 32 MAX circuits; fluids 1.024M L QGP, 256k L Phonon, 4,096 ingots Magmatter, 256k L Cosmic Solder | 8,000,000 s |
| Frame Part | BEC, UXV | 4x64 Shielding3, 4x64 Valve3, 4x64 Conduit3, 4 Material Mesh; 512k L QGP, 128k L Phonon, 2,048 ingots Magmatter, 1,024 ingots Eternity | /2 of base |
| Multi-Material Mesh | BEC, UXV | 16 long-rod types x 64; 128k L QGP, 32k L Phonon, 512 ingots Magmatter, 128 ingots Universium | /8 of base |
| Shielding3, Waveguide3, Conduit3, Valve3 | BEC meta-material recipes (UIV/UMV/UXV), 300 s base | Chromatic Glass and Transcendent Metal condensates; Valve also Dimensionally Shifted Superfluid | GT5U `BECMetaMaterialRecipes` |
| Stargate Crystal Dust | Mixer, UXV, 3 min | 64 each: Stable Adhesive, Superconductor Composite, Naquadria Supersolid, Timepiece; 8 each of 4 Stable Containment Units; 4 Graviton Shard; 1e9 L Grade-8 water | NHCM MixerRecipes |
| Stargate Crystal Slurry | Transcendent Plasma Mixer, 1e9 EU/t x1000 multiplier, 100 ticks | 14 plasmas, 1,000 L each (Infinity, Neutronium, Hypogen, Draconium family, Bedrockium, etc.) | 1,000 L per run |
| Core Crystal | Blast Furnace, MAX power, coil heat 100,000, 2 weeks | 64 Crystal Dust + 128,000,000 L Slurry | needs 128,000 mixer runs, about 1.8e9 L plasma inputs |
| Controller Crystal | same | 64 dust + 128M L molten MHDCSM | |

### 3.3 Upstream chain (named, not traced to raw)

Superdense plates (Magmatter, White Dwarf, Black Dwarf, Universium, Eternity, Spacetime): Pseudostable Black Hole Containment Field (UIV).
White/Black Dwarf Matter, Universium: Eye of Harmony (UMV). Magmatter, Eternity, MHDCSM, QGP: Godforge modules.
Superconductors: Plasma Forge (UEV). Components: Component Assembly Line. Circuits to MAX: PCB Factory, Space Elevator assembler modules.
Nanites, combined singularities, dark matter, UXV components: not traced (API rate limit); marked unverified.

## 4. Infrastructure with tiers

| Infrastructure | Tier | Role |
|---|---|---|
| AE2 Extreme Crafting Table | none | the 10 grids |
| BEC Assembler (up to 30,720 nanites, IO nodes) | UXV recipes | Plate, Chevron, Frame Part, Mesh |
| Transcendent Plasma Mixer | UXV-class (1e9 EU/t) | Slurry |
| Blast Furnace, heat 100,000 | MAX power | 2 week crystal runs |
| Eye of Harmony | UMV | stellar matter, wireless EU only |
| Pseudostable BHC | UIV | superdense plates; about 3,667 casings, 950 absorbent, 144 frames, 64 focus |
| Godforge | UIV | Magmatter, Eternity; wireless EU, rings of thousands of casings |
| Plasma Forge | UEV | superconductors, plasmas |
| Space Elevator + modules, PCB Factory, Component Assembly Line | UEV-UXV | circuits, batteries, components |

## 5. Rough total cost

High-level counts, summed from the code multipliers above: 1,630 Superdense Magmatter plate; 1,398 Frame Part; 624 White Dwarf plate;
601 Plate (wiki 537); 424 Field Gen (wiki 408); 420 Absorber; 365 Dark Matter Block; 319 Chevron; 279 Piston; 232 Waveguide3; 185 Magmatter Block;
168 Black Dwarf plate; 150 Sync Casing; 64 Graviton Modulator; 61 Sensor and Emitter each; 55 Chassis; 44 Transformative Coil;
40 chaotic capacitor; 36 UMV LSC; 32 Siphon Casing; 30 ZPM6; 28 Magmatter Nanite; small items (6 Astral, 4 Alignment, 4 Collapser, 4 Valve, 4 GigaChad, 2 Drone, 2 Assembler Module).

Derived BEC demand for the 1,398 Frame + 601 Plate + 319 Chevron + Meshes: condensates 2.4e9 L QGP, 5.9e8 L Phonon, 1.4e9 L Magmatter,
2.1e8 L Eternity, 1.0e8 L Universium; about 378,000 each of Shielding3, Valve3 and Conduit3; 19,800 MAX circuits; 19,200 Sensors and Emitters;
about 38,000 each of EOH casings and conduits. BEC base time summed is 1.9e10 s (about 590 years sequential), 1.9e20 EU at OpV power. Those times are
only workable through the BEC machine's distributed nanite/slowdown model, whose real speed I did not trace (risk).

Wiki 2.7-2.8 raw list (dated, since changed): fluids 1.68T L Iron, 458B UU-Matter, 447B Bedrockium, 378B Neutronium, 277B Naquadria, 160B Infinity,
135B Dimensionally Shifted Superfluid, 128B Grade-8 water, 35.6B Spacetime, 9.7B Stellar Plasma Mixture, 9.2B Hypogen, 1.2B Universium, 887M Eternity,
699M Magmatter, 146M White Dwarf, 138M Black Dwarf; items 3.3B Lapis dust, 2.7B Redstone, 464M Transcendent Metal; circuits 110M UV, 48M UHV, 46M UEV,
22M ZPM, 3.5M Pico, 1.2M Quantum, 503k UIV; 512 Graviton Shards.

| Metric | Value |
|---|---|
| Distinct grid recipes | 10 (plus 2 crystals) |
| Distinct subcomponent recipe types | about 10 (BEC x4 + 4 meta + mixer + plasma mixer) |
| Upstream machines | 8 multiblocks (section 4) |
| Total craft count in the grid layer | about 140 crafts (25 + 15 + 61 + 24 + 4 + others) |
| Energy | tens of EU/t-years; the BEC figure above is an upper bound, real use depends on slowdowns |

## 6. Other endgame references (what informs a Hyperstargate)

Sources: wiki pages and repo licence fields checked via a bounded research subagent; recipe numbers beyond these are not verified.

- **Eye of Harmony (GTNH, LGPL-3.0, GT5U):** UMV multiblock, no energy hatch (wireless EU only). Sole source of dwarf matter and Universium. Recipe-selector item plus about 1e9 L hydrogen/helium/stellar plasma per tier. Lesson: a gating machine fed by a wireless network and a selector item.
- **Godforge (GTNH):** UIV, wireless EU, expandable rings (T1 to T3) of thousands of casings with pluggable modules that auto-connect. Lesson: incremental gating of one final structure.
- **Pseudostable BHC (GTNH):** UIV; needs a consumable black hole seed, decays 1%/s, held open with spacetime at cost doubling every 30 s. Lesson: a resource-pressure mechanic. Directly relevant to the MAX ending (Sgr A* horizon).
- **Plasma Forge (DTPF, GTNH):** UEV; only source of tesseracts for UIV; coil tier caps recipe tier; 8 h continuous halves catalyst. Lesson: warm-up reward.
- **GregTech Leisure (GTLAdditions, MIT):** endgame past UXV to OPV/MAX with named final multiblocks (Stellar Forge, Interdimensional Plasma Forge, Dragon Processor, Space Scaling Instrument). Only module names verified, no quantities.
- **Star Technology (pack MIT; GTM fork and StarT-Core LGPL-3.0):** has stargates per `docs/research/space/gtm-tiers.md:145`; recipes not located in the two repos, community descriptions only.
- **Monifactory (LGPL-3.0, plus MoniLabs LGPL-3.0):** a Stargate could not be verified (wiki pages 404); not a design reference.

## 7. Hyperstargate 10x target

### 7.1 Baseline and scaled ranges (guidance, not quotas)

| Quantity | GTNH baseline | Hyperstargate target (about 10x) |
|---|---|---|
| Distinct recipe types, whole tree | about 12 grid + 12 sub + 8 upstream machines | 100 to 150 recipe types; at least 10 upstream lines each of 4+ real steps (`AGENTS.md` principle 7) |
| Total crafts in the grid layer | about 140 | 1,200 to 1,600 |
| Final-layer components | 10 grid recipes, up to 22 of one item | 10 to 15 grid-type crafts with 40 to 90 distinct inputs each (or tiered assembly of intermediate megablocks) |
| Superdense / key plates | about 1,630 | 10,000 to 20,000 |
| Frame Part / UXV Field Gen | 1,398 / 424 | 10,000 to 14,000 / 4,000 to 4,500 |
| Circuits (top tier, direct) | 19,800 MAX | 100,000 to 200,000 |
| Raw fluids | 1e9 to 1e12 L | 1e10 to 1e13 L, never as one inflated bucket; split over many fluids |
| Power | MAX amperage | MAX amperage with huge amp counts; no tier above MAX |
| Time | 8e6 s base (BEC), 2 week crystal | no inflated recipe times (owner rule): time stays reasonable, cost comes from quantity and chain depth |

### 7.2 GTM 7.5.3 and Grindless limits and analogues

- MAX = 2,147,483,648 EU/t is the last tier; there is no T15. Anything beyond must be MAX amperage or a custom mechanic (`docs/research/space/gtm-tiers.md:23-27`).
- Hulls, energy hatches and dual hatches reach MAX with the ON flag (`gtm-tiers.md:33`). GTM has no MAX single-block components (`gtm-tiers.md:50`). The pack adds 9 MAX components, 1 circuit, 1 parallel hatch, 1 cable (`docs/eras/max.md:568,808`).
- Wireless: case 14, V[MAX] x A x 10 caps (`docs/eras/max.md:58,154,653,840`; `docs/eras/opv.md:63,621,711`). This is the analogue of GTNH EOH/Godforge wireless-only.
- UEV+ circuits, space elevator and GTMU wireless are recipeless in GTM and must be ours (`gtm-tiers.md:107-115`).
- Mirror shell over Sgr A* is the analogue of the Black Hole Containment seed and horizon (`docs/eras/max.md:3,7,46,191,193,335-350`). Per the owner decision, its final recipe stabilises or opens the horizon and outputs the key MAX+ needs.
- Previous space and endgame notes: `docs/research/space/packs-space.md:10,26,46,128-137`. Reuse stance: `docs/research/reuse.md:71,95`.
- Era sizing: progression multiblocks grow about x1.35 per era (`docs/research/complexity.md`); MAX has 10 multiblocks and 46 lines (`docs/eras/max.md`).

### 7.3 GTNH step to Grindless mapping

| GTNH step | Hyperstargate analogue |
|---|---|
| AE2 Extreme Crafting 9x9 grids | AE2 pattern-based crafting of 9x9-style assemblies; every input automatable via AE2 scaling |
| BEC Assembler | an original multiblock line with huge counts, not time; no nanite/slowdown system |
| Stargate Crystal (2 weeks, 128M L) | crystal made in many parallel runs with realistic times, cost in plasma volume |
| Superdense plates from BHC | from the MAX mirror shell or its output seed |
| EOH / Godforge matter | MAX+ intergalactic materials and chains |
| Creative capacitor bank | creative items crafted at enormous cost, Hyperstargate ingredients (owner decision) |

Do not copy GTNH numbers directly; use them for shape (grid depth, subcomponent fan-out, crystal gate) and multiply. BEC base durations are unusable for us.

## 8. Licences

| Project | Licence | LICENSE URL | What we may do |
|---|---|---|---|
| NewHorizonsCoreMod | GPL-3.0 | https://github.com/GTNewHorizons/NewHorizonsCoreMod/blob/master/LICENSE | Ideas and numbers only; no code (we are not GPL) |
| GT5-Unofficial | LGPL-3.0 | https://github.com/GTNewHorizons/GT5-Unofficial/blob/master/LICENSE.txt | Ideas only; no code or assets |
| SGCraft (GTNH fork) | MIT (c) 2016 gcewing | https://github.com/GTNewHorizons/SGCraft/blob/master/LICENSE.txt | Reusable with attribution; 1.7.10 mod, not directly usable |
| GT-New-Horizons-Modpack | CC BY-NC-SA 4.0 | https://github.com/GTNewHorizons/GT-New-Horizons-Modpack/blob/master/LICENSE | Ideas only (non-commercial, share-alike) |
| GTNH wiki | CC BY-SA 4.0 (site footer, wiki.gtnewhorizons.com) | https://creativecommons.org/licenses/by-sa/4.0/ | Facts and numbers cited; no text copied |
| GTLAdditions | MIT | https://github.com/Dragonators/GTLAdditions | Reusable with attribution (not needed) |
| Star Technology (pack) | MIT | https://github.com/StarT-Dev-Team/Star-Technology | Attribution if reused |
| GTM-StarT-Fork, StarT-Core | LGPL-3.0 | https://github.com/StarT-Dev-Team | Ideas only |
| Monifactory, MoniLabs | LGPL-3.0 | https://github.com/Omicron-Industries/Monifactory | Ideas only |

GitHub reports NOASSERTION for the modpack repo; the LICENSE file was read directly at tag 2.9.0 and begins "Attribution-NonCommercial-ShareAlike 4.0 International".

## 9. Gaps

BEC machine effective speed, BHC superdense plate recipes, nanite and combined-singularity chains, and the GTL/Star Technology recipe numbers were not traced
(GitHub search rate limit hit, subagent could not locate Star Technology stargate code). Treat those as unverified before relying on them in MAX+ design.
