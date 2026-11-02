# RF-5A: Phase 5 quest design

Package RF-5A (#97), Project Reforge Phase 5, 2026-11-01. This document decides the shape of the v1.0.0 quest book, era by era, and cuts Phase 5 into work packages. It changes no chapter and no generator. Every Phase 5 package reads its row in section 5, the era's row in section 2, and the rules of section 3; nothing else here is required reading.

Sources: `AGENTS.md` rules 5 and 7; `docs/quests.md` (sections cited by number); `docs/research/quest-books.md` sections 3 to 8; each era doc's *Quests*, *Our multiblocks* (MAX and MAX+: *Machines*), *Older machines, new modes*, *Power*, *AE2* and *New process lines* sections; the generators in `tools/quests/`; the quest lint of the integration branch at `c4aee05a` (run on the VM, below).

## 1. Inventory

Counts are from `node tools/quests/lint.mjs` on the VM at `c4aee05a` (run `exec-20261101-103742-1756400`, 0 errors, 10 warnings); they match `GG_QUESTS_EXPECTED` (`tools/test/overlay/kubejs/server_scripts/gg_test_quests.js:62-103`). "Hand" = the SNBT is the source, edited by hand. "Gen" = a generator in `tools/quests/` writes it from data.

### 1.1 Progression and Welcome

| Chapter | Era | Source | Quests | Deps | What it teaches today |
|---|---|---|---:|---:|---|
| `welcome` (no group) | start | hand | 16 | 15 | Arrival to bronze: wood and stone, veins, the hammer, the neutronium toolbox, copper and tin, dusts, bronze; the Void and Flatlands keys |
| `steam_age` | Steam | hand | 44 | 50 | Bricks, boilers, steam machines, compressor, firebricks, the primitive blast furnace and steel, molds, glass, Nether sulfur, rubber, LV hull and turbine; coke oven and battery; the Clockwork Observatory and draft chart; the steam blast furnace; vein drill and greenhouse; LV circuit parts |
| `lv_age` | LV | hand | 52 | 53 | Components, assembler, cupronickel and the EBF, aluminium, MV hull; the optical observatory; the ore line; generator array and heliostat tower; LV vein drill and Nether veins; chemistry to the sulfide roaster; greenhouse and mob models; good circuit board to the MV circuit; the submerged arc furnace; the AE2 branch. 3 layout warnings |
| `mv_age` | MV | hand | 50 | 61 | Chromium, Kanthal, silicon boule to wafers, ILC and RAM, the integrated circuits, the cleanroom; radio telescope; ore plant; MV vein drill and the End row; fluid rig, RP-1 and the engine test stand; biorefinery and plastics; the universal factories. 2 layout warnings |
| `hv_age` | HV | hand | 33 | 41 | Refinery, catalysts, cracking, PTFE, gasoline, rocket fuel, static fire, the rocket parts, liftoff and the Moon; HV greenhouse and drill; reformer; composite autoclave; syngas plant; *EV Workstation* (CPU wafer and microprocessor assembly merged into one quest), vacuum freezer, nichrome |
| `ev_age` | EV | gen `ev-chapter` (ids pinned in the data) | 56 | 64 | The Moon base and Mars; titanium and tungsten steel; the Earth–Moon network; the platinum plant; EV hatches; the nanoprocessor line to the supercomputer |
| `iv_age` | IV | hand | 54 | 75 | Hot cell, enrichment, the fission reactor, heavy water and tritium; Venus (naquadah) and Mercury (iridium); the assembly line; RTGs; the interferometer and the outer system chart. No circuit generation |
| `luv_age` | LuV | gen `luv-chapter` (package gate, stations modes) | 47 | 50 | Osmiridium, HTS tape and magnets, SMES; the first station; the belt, Io, Europa (living circuits), Ganymede; fusion, europium, the first data orb |
| `zpm_age` | ZPM | gen `zpm-chapter` | 45 | 45 | Naquadria fuel and the large reactor, waste, URhNq₂ wire, Mk2; graphene to qubits; Saturn and Uranus; D + He-3 and the direct converter |
| `uv_age` | UV | gen `uv-chapter` | 50 | 53 | Mk3, neutronium, thorium and U-233, µCF, He-II and accelerators, light, materials, the ark; Neptune, Pluto, Starshot |
| `uhv_age` | UHV | gen `uhv-chapter` | 58 | 60 | Isotopes, light (optical processor), power devices, organoids, the elevator, antimatter and the gate, the Mercury swarm, Proxima b, the network |
| `uev_age` | UEV | gen `uev-chapter` | 44 | 45 | `uev.md` *Quests* parts 1-9 (superheavies, pressure, light, Mk4, Alpha Centauri, Barnard b, Sirius B) |
| `uiv_age` | UIV | gen `uiv-chapter` | 54 | 56 | `uiv.md` *Quests* parts 1-10 (metallic hydrogen, RHEA, superheavy II, light and the mainframe, Mk5, Mercury, three stars) |
| `uxv_age` | UXV | gen `uxv-chapter` | 49 | 54 | `uxv.md` *Quests* parts 1-10 (spintronics, the sensor, superheavy III, Cygnus X-1, the sling, Vela, Cas A, parts and power) |
| `opv_age` | OpV | gen `opv-chapter` | 52 | 57 | `opv.md` *Quests* (bulge relay, chain strand, components, cosmic circuits, beams, antihydrogen, exotic matter, Kugelblitz, probes). 5 layout warnings |
| `max_age` | MAX | gen `max-chapter` | 52 | 52 | Way in, circuits, components, home machines, the probe and arrival, Sgr A*, the belt, the shell, the horizon lock. Machines 11 to 14 are missing |

### 1.2 Quality of Life and references

| Chapter | Source | Quests | Deps | What it teaches today |
|---|---|---:|---:|---|
| `storage` | hand | 21 | 21 | Chests, backpacks, drawers, Sophisticated, ender chests and tanks, drums and crates |
| `applied_energistics` | hand | 19 | 19 | From LV's *ME Network Access*: powering the network, wireless terminals, GT's ME hatches, the addons |
| `travel_and_teams` | hand | 16 | 15 | Hang glider, waystones and scrolls; teams, homes, claims, chunk loading |
| `workshop` | hand | 17 | 16 | Building aids, logistics mods, GT aids |
| `power` | gen `processing-lines/power-data.mjs` | 116 | 127 | Generation, fuels, storage and the wireless network, Steam to LuV; one Dyson peek row; nothing for ZPM and later |
| `multiblocks` | gen `multiblocks/` | 397 | 0 | Every craftable controller by tier band, ours as bigger gears; no text, no dependencies |

### 1.3 Processing Lines (tracked-item charts, all gen `processing-lines/pl-data-<tier>.mjs`)

| Chart | Steam | LV | MV | HV | EV | IV | LuV | ZPM | UV | UHV | UEV | UIV | UXV | OpV | MAX |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Quests | 63 | 100 | 88 | 73 | 134 | 123 | 201 | 120 | 165 | 213 | 209 | 341 | 415 | 372 | 467 |
| Deps | 57 | 93 | 91 | 70 | 133 | 125 | 199 | 116 | 175 | 201 | 193 | 312 | 369 | 327 | 408 |

**Totals.** 38 chapters, 4,438 quests: Welcome and 15 age chapters 756, Quality of Life tabs 85, Power 116, Multiblocks 397, Processing Lines 3,084.

### 1.4 What the inventory says

1. **The age chapters are flat.** 33 to 58 quests from Steam to MAX, while our progression multiblocks grow from 5 (Steam) to 31 (UV, UHV) and the design lines from 7 to 57 (`docs/reforge/03_line_audit.md`, *Current state*). Rule 5 is unmet in the progression chapters.
2. **The tracked-item half already exists.** The charts grow 63 → 467 quests: Star Technology's pattern (one quest per intermediate, short or no text) is in the book. Phase 5 does not add a second tracked-item layer.
3. **Circuit generations are taught unevenly.** Circuit, chip and wafer items asked by the age chapters today:

   | Era | Asked | Missing against rule 5 |
   |---|---|---|
   | Steam, LV | resin and phenolic boards, basic and good electronic circuits, LV circuit assembler | — |
   | MV | silicon wafer, ILC and RAM chips, basic, good and advanced integrated circuits | ULPIC if MV makes it (dump) |
   | HV | CPU wafer, microprocessor assembly and computer, in one quest | separate wafer, chip and ladder quests; NAND and NOR where HV makes them |
   | EV | nano CPU wafer and chip, MPIC, NOR, nano processor, assembly, computer, EV circuit assembler | the nano mainframe if EV makes it |
   | IV | none | the quantum generation and its wafers (naquadah boule, SoC, QBit, HPIC as the dump has them) |
   | LuV | UHPIC wafer, wetware processor, circuit assembly line | the crystal fold (LD-LV3 made crystal chips a fold), the data orb |
   | ZPM | Si-28 wafer, donor qubit wafer, NV diamond chip | the ZPM circuit step (which processor or assembly the tier makes) |
   | UV | photonic chip, starchip, wetware mainframe | — |
   | UHV | LN and InP wafers, quantum memory chip, organoid processor | the optical processor as a ladder step |
   | UEV, UIV, UXV, OpV, MAX | optical computer, optical mainframe, P:Si processor, MRAM wafer, racetrack chip, spintronic, cosmic and supracausal mainframes | the ladder steps between them; MAX's nine components |
4. **Ten near-identical generators.** `ev-chapter` pins every id in its data; `luv-chapter` adds the package gate (`pkg`, `LANDED`, `fallback`, `slot`, `--pending`, `--all`) and the stations modes; `zpm-chapter` to `max-chapter` are one file copied eight times, differing only in the id seed (`c2-<era>-quests`) and the filename. All write `quest_links: [ ]` and spell cross-chapter dependencies as `X:<hex>`.
5. **Lint.** 0 errors; 10 warnings: LV 3, MV 2, OpV 5 (crossings and lines under quests).
6. **The "before" capture is stale for the charts.** Q-0's capture (`C:\Users\EzequielC\gg-reforge\quests\before\chapters.csv`) predates the Phase 3 chart passes (`pl_ev` 106 against 134 today, `pl_luv` 178 against 201, `pl_uev` 71 against 209); the age chapters match within one quest. Each Phase 5 batch recaptures its own "before" (section 5.3).
7. **MAX is behind its era.** `max-chapter` has no quest for machines 11 to 14 and `pl-data-max.mjs` has no row of L47 to L57 (`git grep` finds none), although MX-S1 to MX-S4 and MX-E1 have merged. Its header still says the epilogue comes from a MAX credits handler, which MX-E1 removed.

## 2. The shape

### 2.1 Six roles, mapped onto chapters

Rule 5 asks each era to teach, for every new wafer, circuit generation, process and multiblock: what it is for, how it is made, what it needs, what it unlocks and how to automate it. `quest-books.md` section 5 gives six chapter roles. Phase 5 keeps the six roles in every era, but maps them onto chapters by size:

| Role | What it teaches | Where it lives |
|---|---|---|
| What's new | Where we are, the hull, what changed (power rule, place, travel) | The age chapter's left end (the start) |
| Materials processing | Every line, step by step | The era's `pl_<era>` chart, as now (`docs/quests.md` §17) |
| Wafers, circuits and components | Every new wafer, chip, circuit generation step and the era's components | Steam to HV: a row of the age chapter. From EV: `<era>_circuits` |
| Machines and multiblocks | Every multiblock of ours in the era | Steam to HV: gears in the age chapter. From EV: `<era>_machines` |
| Integration | Power plants, the network tier, the AE2 step, the parallel hatch, mega members, older machines with new modes | Steam to HV: rows of the age chapter. EV to LuV: rows of `<era>_machines`. From ZPM: `<era>_integration` |
| Capstone | The era's exit project and its gate | The age chapter's right end (the exit). MAX: `max_horizon`. MAX+: `maxplus_hyperstargate` |

Why not six chapters everywhere:

- **Materials processing already is the chart.** A second chapter would teach the same intermediates twice.
- **What's new and the capstone are the two ends of one spine.** Each age chapter runs from the previous gate to the next place (`docs/quests.md` §9); splitting the ends leaves a middle with no journey. They split only where the capstone is a project of its own (MAX's horizon lock, MAX+'s Hyperstargate).
- **Steam to HV are small.** 5 to 7 multiblocks and one circuit step each, reviewed in the 2026-10-25 voice pass: split chapters would hold 5 to 10 quests.

So the number of chapters grows with the era: one (Steam to HV), three (EV to LuV), four (ZPM to OpV), five (MAX), nine (MAX+), each plus its chart.

### 2.2 Chapters per era

| Era | Chapters | Group (open question 1) |
|---|---|---|
| Steam, LV, MV, HV | `steam_age`, `lv_age`, `mv_age`, `hv_age` | Early Ages |
| EV, IV, LuV | `<era>_age`, `<era>_circuits`, `<era>_machines` | one group per era |
| ZPM, UV, UHV, UEV, UIV, UXV, OpV | `<era>_age`, `<era>_circuits`, `<era>_machines`, `<era>_integration` | one group per era |
| MAX | `max_age`, `max_circuits`, `max_machines`, `max_integration`, `max_horizon` | MAX |
| MAX+ | `maxplus_age_1`, `maxplus_age_2`, `maxplus_age_3` (one per stage), `maxplus_circuits`, `maxplus_machines`, `maxplus_integration`, `maxplus_creative`, `maxplus_tree`, `maxplus_hyperstargate` (capstone) | MAX+ |

`maxplus_tree` (the Hyperstargate's machines and parts) folds into `maxplus_hyperstargate` if the two together stay under about 40 quests; XP-C2b decides from the built tree. Titles follow `<ERA>: <Name>` (`ZPM: Saturn and Beyond`, `ZPM: Circuits and Components`, `ZPM: Machines`, `ZPM: Power and Scale`); the UEV to MAX titles lose their " - " today.

`welcome` stays outside every group; Quality of Life and Processing Lines keep their groups.

### 2.3 What each role holds (every era)

The era docs share their section names from LuV on, so every era package reads the same sections:

- **Age chapter (journey and capstone).** Source: *Route*, *Places and site rules*, *Bridges and first arrivals*, *Gate to <next>*, and the era's *Quests* table for the places and the gate. One spine from the previous gate to the next. Per place: the arrival (dimension task), the site machine or sample, what only comes from there (*Only from there*). Charts and instruments as in Appendix A's sky row. The exit names the next place (§9).
- **Circuits chapter.** Source: *Our multiblocks* rows that make wafers, chips or circuits; the era's circuit-assembler and assembly-line rows in the dump; *Components* where the era has them (UHV *Components (TP-C)*, OpV *Wave A*, MAX *The MAX family*, MAX+ *Voltages, hull, hatches and controllers*). One quest per new wafer (wafer + lens + chip in one quest when a laser engraver makes the chip, Star Technology's chip quest); the ladder processor → assembly → computer → mainframe as four chained quests, the mainframe a gear; the circuit assembler or cleanroom requirement once, where it changes (sterile, cryogenic, vacuum).
- **Machines chapter.** Source: *Our multiblocks* (MAX, MAX+: *Machines*). One gear per multiblock of ours, 1.25, or 1.5 for the era's signature machine (at most one). Its tasks are the controller and the casings and parts that are new in this era (casing counts as in §6). Its text answers the five questions of rule 5 (section 3.2). A product quest hangs off it only when the product is why the machine exists and the chart does not already show it as an end product.
- **Integration chapter** (rows of the machines chapter in EV to LuV). Source: *Power* (*Power on the wireless network*), *Fusion*, *AE2* (*AE2 between planets / stars*), *Nothing one at a time* (the parallel hatch), *Older machines, new modes* (*Older machines in MAX/MAX+*), `docs/eras/mega.md` for mega members. One quest per new generator or plant of ours and its fuel; one for the network tier ("The Network Goes ZPM"); one for the AE2 step; one for the parallel hatch; older machines with new modes: one quest per older machine whose new mode opens a line of this era, grouped in rows by the era the machine comes from, its task the controller (optional item, already owned) plus a checkmark.

### 2.4 Era by era

Machines = our progression multiblocks (era docs, as built). Lines = design lines (`03_line_audit.md`).

| Era | Machines / lines | Journey (age chapter) | Circuits and components | Machines | Integration | Capstone and exit |
|---|---|---|---|---|---|---|
| Steam | 5 / 7 | As now (Appendix A, Steam) | Row: resin board, basic electronic circuit | Five gears, as now | Boilers and the steam plants | LV Steam Turbine |
| LV | 6 / 12 | As now; fix the 3 warnings | Row: phenolic board, good circuit, LV circuit assembler | Six gears, as now | Generator array, heliostat tower, AE2 branch | LV to MV transformer |
| MV | 6 / 9 | As now; fix the 2 warnings | Spine: boule, wafer, ILC, RAM, the three integrated circuits; ULPIC if the dump has it at MV | Six gears, as now | Fluid rig fuels, universal factories | Cleanroom |
| HV | 7 / 8 | As now | Split *EV Workstation* back into CPU wafer, microprocessor, assembly, workstation; NAND and NOR if made at HV | Seven gears; lunar drill if HV | Syngas, refinery fuels | The Moon |
| EV | 11 / 9 | Moon base, Mars, titanium, tungsten steel, IV hull | PIC and MPIC, nano CPU, NOR memory, nano processor ladder, EV circuit assembler | 11 (`ev.md` *Our multiblocks*, *Raising EV to the target*) | Rows: the vacuum rule, combined-cycle plant, lunar solar array, Earth–Moon bridge, two-hatch rule, late EV hatches | Red Horizon, IV hull |
| IV | 15 / 10 | Hot cell to Gate to LuV; Venus, Mercury | Quantum generation and its wafers (not taught today) | 15 (`iv.md` *Our multiblocks*, *Raising IV to the target*, *As built*) | Rows: fission and RTG power, Mercury solar field, AE2 IV step, parallel hatch | Day of Fire, Gate to LuV |
| LuV | 20 / 18 | Station, belt, Io, Europa, Ganymede | Wetware (living circuits), the crystal fold (LD-LV3), research station and data orb | 20 (`luv.md` *Our multiblocks*, *Family steps*) | Rows: SMES and the LuV network, Mk1 fusion, reactor III, AE2 LuV step, *Sixteen at Once* | Gate to ZPM; keeps the `LANDED` gate and stations modes |
| ZPM | 27 / 14 | Saturn, Uranus, Kuiper targets | Si-28 wafer, implanted donors, NV diamond, millikelvin, qubits; the ZPM circuit step | 27 (`zpm.md` *Our multiblocks*) | Naquadria and the large reactor, DEC, Mk2, the ZPM network, x64 hatch, AE2 ZPM step, older modes (`zpm.md` *Older machines, new modes*) | Gate to UV |
| UV | 31 / 22 | Neptune, Pluto, Starshot | Photonic chip, starchip, wetware mainframe, the HPGe and SNSPD parts that are components | 31 (`uv.md` *Our multiblocks*) | Mk3, thorium and U-233, µCF, laser fusion, the UV network, AE2 UV step, older modes | Light from Proxima, Gate to UHV |
| UHV | 31 / 32 | Mercury swarm, Proxima b, the elevator | LN and InP wafers, Eu:YSO memory, optical processor, organoid processor, four mainframes, UHV components | 31 (`uhv.md` *Our multiblocks*) | Power devices, the Dyson swarm, RTAN, the UHV cell and network, Quantum Fabricator (mega), older modes | Step through the gate, Gate to UEV |
| UEV | 25 / 40 | Alpha Centauri, Barnard b, Sirius B | Quantum photonic chip, optical computer, quantum repeater, UEV components | 25 (`uev.md` *Our multiblocks*) | Mk4 and the DEC row, DFD, AE2 between stars, UEV parallel hatch, 28 older machines | Gate to UIV |
| UIV | 22 / 46 | Mercury's Matrioshka, RX J1856, PSR J0437, Cygnus X-1 | LN-on-SiN, BEUV, 5D crystal, P:Si processor, optical mainframe, UIV components | 22 (`uiv.md` *Our multiblocks*) | Mk5, the Matrioshka computer, UIV parallel hatch, older modes | Gate to UXV |
| UXV | 21 / 49 | Cygnus X-1 elevator, the Kerr sling, Vela, Cas A | CoFeB, MTJ, MRAM, DyScO₃, MESO, racetrack, spintronic mainframe, UXV components and sensor | 21 (`uxv.md` *Our multiblocks*) | Mk6, UXV SMES, parallel hatch, stellar fractionation hall, 46 older machines | Gate to OpV |
| OpV | 18 / 45 | Bulge relay, Cygnus beams, SGR positrons, Terzan 5 | Cosmic circuits to the mainframe, tetrons, the nine OpV components | 18 (`opv.md` *Our multiblocks*) | Annihilation engine, Hawking collector, x262,144 hatch, Kardashev III census, 49 older machines | Gate to MAX |
| MAX | 14 / 57 | Way in, the probe, Sgr A*, the belt | Squeezed-light chip, tweezer die, the supracausal ladder, nine MAX components, MAX parts | Machines 1 to 10 (`max.md` *Machines*) | Sgr A* modes on older machines (D1), *Power*, *AE2*, MAX parallel hatch, wireless case 14 | `max_horizon`: the mirror shell, segments in quarters, machines 11 to 14 and their products, the last recipe, the horizon lock (points to MAX+, rolls no credits) |
| MAX+ | 17 / 58 | Stage I: the key, condensate, the slingshot, Tarantula, the Stream. Stage II: Andromeda, the filament, scale. Stage III: the gate's route at Sgr A* | Kerr strand, nine MAX+ components, the horizon processor | 17 (`maxplus.md` *Machines*) and the Hyperfactory (mega) | *Power*, *AE2* (MEGA, ExtendedAE, Expanded AE sizing before the grid layer), parallel hatch, *Older machines in MAX+* | `maxplus_creative`: the four creative items; `maxplus_hyperstargate`: the tree, the grid layer, the gate, the crossing; the last quest is the arrival and gives nothing |

### 2.5 Quest targets

Targets, not quotas: a quest exists because there is something to teach or a goal to mark (rule 5, §8 *What does not need a quest*). The package that builds a chapter may land within about 15% of its target either way and says why in its handoff. Machines = one gear per multiblock plus a product or casing quest for about half of them. Circuits = new wafers and chips, the four-step ladder, components, one assembler step. Integration = plants and fuels, network, AE2 step, parallel hatch, one quest per older machine that opens a line. Journey = about three quests per place, plus travel, charts and the gate.

| Era | Chapters | Journey | Circuits | Machines | Integration | Capstone | Progression (today) | Chart quests (tracked items) |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Steam | 1 | 46 | (row) | (gears) | (row) | (exit) | 46 (44) | 63 |
| LV | 1 | 54 | | | | | 54 (52) | 100 |
| MV | 1 | 54 | | | | | 54 (50) | 88 |
| HV | 1 | 44 | | | | | 44 (33) | 73 |
| EV | 3 | 30 | 10 | 17 | 8 (rows) | (exit) | 65 (56) | 134 |
| IV | 3 | 30 | 12 | 22 | 8 (rows) | | 72 (54) | 123 |
| LuV | 3 | 32 | 12 | 30 | 10 (rows) | | 84 (47) | 201 |
| ZPM | 4 | 28 | 12 | 38 | 14 | | 92 (45) | 120 |
| UV | 4 | 30 | 10 | 44 | 16 | | 100 (50) | 165 |
| UHV | 4 | 30 | 14 | 44 | 16 | | 104 (58) | 213 |
| UEV | 4 | 24 | 12 | 36 | 16 | | 88 (44) | 209 |
| UIV | 4 | 28 | 14 | 32 | 18 | | 92 (54) | 341 |
| UXV | 4 | 26 | 14 | 30 | 18 | | 88 (49) | 415 |
| OpV | 4 | 26 | 10 | 26 | 18 | | 80 (52) | 372 |
| MAX | 5 | 20 | 14 | 15 | 14 | 17 | 80 (52) | 467, plus about 70 for L47-L57 |
| MAX+ | 9 | 60 (three stages) | 14 | 26 | 16 | 28 (creative 8, gate 20) | 144 (0) | new `pl_maxplus`, about 265 intermediates |

Progression total: about 1,290 quests plus Welcome, against 756 today. Notes:

- **Counts follow content, not a curve.** UEV to OpV have fewer machines than UHV and more lines: their growth sits in the charts (209 to 415 quests), as their era sizes record (`uev.md:1551`, `uiv.md:1811`, `uxv.md:1632`, `opv.md:1584`).
- **MAX: 80 against `max.md`'s ~70.** `max.md` *Quests* listed no integration chapter; the Sgr A* modes, power, AE2 and the hatch are ten more things to teach.
- **MAX+: 144 against `maxplus.md`'s 180-240** (six chapters a stage, 60-80 quests each). The Hyperstargate's 1,212 grid crafts and about 120 recipe types are line content: they go on the `pl_maxplus` chart, one node per intermediate, not into prose quests. Open question 2.

### 2.6 Links between chapters: nothing taught twice

- **One place per thing.** Each wafer, circuit step, machine, plant and place is taught in exactly one progression chapter. Any other chapter that needs it shows it as a quest link (FTB `quest_links`), never as a copy.
- **Rows start at a link.** In circuits, machines and integration chapters each row begins with a link to the age-chapter quest that opens it (the arrival at a place, the hull, the gate), and the row's first quest depends on it. So no row floats, and the reader sees where it comes from. A link's own dependencies are elsewhere, so it draws no extra lines; a far requirement with no link is named in the text (§5).
- **One start per chapter.** A role chapter's first quest depends on the age chapter's start quest (shown as a link at the left).
- **Charts own the lines.** The `pl_<era>` chart owns every line intermediate. A progression quest asks for what builds a machine and for a line's end product, never for the line's intermediates; its text names the chart ("the ZPM Lines chart shows the line"). Progression quests never depend on chart quests and charts never block anything (§17).
- **The Multiblocks index owns where; the machines chapter owns how and why.** The index stays a textless map of every controller by tier (§19); the machines chapter carries the text for ours. No change to the index.
- **Power owns figures; integration owns what to build.** Power's generator nodes already import the quest that introduces each generator (§18); when a generator's quest moves into an integration chapter, the link follows it by id (RF-5L2).
- **The AE2 tab owns the mod.** An era's AE2 quest teaches only the era's step (a bridge, a cell tier, a provider count), as LV's AE2 branch does today.
- **Circuit ladders use the tracked-item pattern** (Star Technology, `quest-books.md` §4): one quest per item, short text, chained; the mainframe is a gear.

### 2.7 Gaps: what the era docs promise and the pack lacks

| Promise | Where | Gap | Who closes it |
|---|---|---|---|
| MAX chapter: machines 11 to 14, the horizon lock, 57 lines | `max.md:762-764` | No quest for machines 11-14; no chart rows for L47-L57; stale credits comment | MX-C2 (quests), PL-MX (chart) |
| MAX+ quests and one tracked quest per line intermediate | `maxplus.md:463-465` | Nothing built; `pl-model.mjs` `TIERS` ends at `max` | XP-PL, XP-C2a, XP-C2b, after XP-C1 |
| Power for every era | `docs/quests.md` §18 | Power stops at LuV (plus a Dyson peek); no ZPM to MAX generator figures | Integration chapters teach the plants; RF-5P extends Power where `pl-check` can prove a figure (open question 6) |
| `es_es` titles for the ZPM, UV and UHV chapters | `zpm.md` *Quests*, `uv.md` *Quests*, `uhv.md` *Quests* | Quests are English only (`AGENTS.md` rule 5) | Superseded; proposed line in section 7 |
| "Short quests, small rewards" | `uev.md`, `uiv.md`, `uxv.md`, `opv.md` *Quests*; `luv.md`, `zpm.md` "about 40-45 small-reward quests" | Written before Reforge rule 5 | Superseded by this design; the parts tables stay the journey's content |
| Six chapters per stage for MAX+, and six per era | `maxplus.md:465`; `docs/quests.md` §1 | Mapped to roles, not chapters (section 2.1) | Open questions 2 and 3 |
| Quantum, crystal and the ZPM circuit step taught | `AGENTS.md` rule 5 | IV teaches no circuit; crystal is a fold since LD-LV3; ZPM teaches qubit wafers but no circuit step | RF-5Q-IV, RF-5Q-LUV, RF-5Q-ZPMb read the dump's circuit rows |

## 3. Rules that carry through

### 3.1 Existing rules, by reference

Every package follows `docs/quests.md` as it stands: layout §4, dependencies §5, tasks §6, rewards §7, writing and banned phrases §8, the journey §9, ids §10, tools §11, Processing Lines §17, Power §18, Multiblocks §19, *Rendering the book*; and `.github/instructions/quests.instructions.md` (generated chapters, ids, checks). Only the additions below are new.

### 3.2 Additions

- **Teaching a new thing.** A quest for a new wafer, circuit step, process, machine or plant answers the five questions of rule 5: what it is for (first sentence), how it is made (the chained tasks, §6, not the text), what it needs (place, power, condition: night, cleanroom, sterile, cryogenic, vacuum), what it unlocks (a sentence, or its children), how to automate it (one sentence: the catch, the loop, the return). In data these are `teach: { for, needs, unlocks, automate }` (section 4.2).
- **Text limits.** 70 words and 4 paragraphs stay the default (§8). Quests in `_circuits`, `_machines`, `_integration`, `max_horizon` and the MAX+ capstone chapters may use 120 words and 5 paragraphs (RF-5L2 makes the limit per role; open question 4). Voice and banned phrases do not change.
- **Rewards are proportionate and never skip a production line.** XP for every quest. An item reward is only something the gate into this era already made the player automate (raw resources, or products of lines at least one era back), at most one craft's worth (a capstone: a few crafts' worth), or a Quality of Life item. Never a hull, component, circuit, chart, key or gate item, a catalyst kept by a structure (`horizon_lock`), a creative item, or the end product of a line of this era or later. Gate quests reward XP only (as `max-chapter` already does). The toolbox stays the one exception (§7).
- **Quests never block recipes.** No reward grants a stage, a recipe, a structure or a dimension; stages come from recipes (`maxplus` from the shell's c3, MX-E1). Tasks are item, dimension or checkmark tasks the player completes by playing, and items are never consumed (§6). A locked quest hides text, never content.
- **English only.** Titles, subtitles and text are in English; quests have no `es_es` (supersedes the era docs' "es_es titles come with it").
- **Copy only from MIT or LGPL books, with a credit row.** Star Technology (MIT), GTCP Modern (LGPL-2.1), Monifactory and Cosmic Frontiers (LGPL-3.0) may be adapted with a `CREDITS.md` row per chapter naming the source file and quest ids (`quest-books.md` §6, §8); GTNH (CC BY-NC-SA 4.0) and GT Leisure are ideas only. Copied quests take new ids and are re-checked against our dump (`quest-books.md` §7). A package proposes its rows in the handoff; it never edits `CREDITS.md`.
- **Never promise what is not built.** A quest names only ids the dump registers (`lint.mjs --items $GG_DUMP/.../items.json` on the VM); unbuilt content waits behind the package gate (section 4.3).

## 4. The generators

### 4.1 Decision

Every progression chapter from Steam to MAX+ is generated from data by one shared writer. Steam, LV, MV, HV and IV move to data; Welcome and the five Quality of Life tabs stay hand-written.

- **One writer.** `tools/quests/lib/chapter-gen.mjs` takes over what the ten `gen.mjs` files do: ids from keys, SNBT in the book's format (tabs, LF, no BOM, sorted keys), the package gate from `luv-chapter`, quest links, and per-chapter counts. One CLI, `tools/quests/gen-chapters.mjs`, writes every era chapter (or one era, or one chapter). The per-era `gen.mjs` files are removed once their output is byte-identical through the shared writer.
- **Steam to IV move to data** through a one-off importer (`tools/quests/lib/import-snbt.mjs`) that writes `quests-data.mjs` from the SNBT and keeps every id (pinned `id` fields, as EV does). The acceptance is a round trip: import, generate, and `lib/book.mjs` reads the same chapter (same quests, ids, tasks, rewards, positions). After that the data is the source. Reasons: Phase 5 changes all five (HV gets its wafer quests back, IV splits in three, LV and MV lose their layout warnings); one format means one lint path, one counts printout and cross-chapter references by key.
- **Welcome stays hand-written.** Its toolbox rewards carry the exact NBT that `gg_dump_toolbox` dumped and `gg_test_quest_book` proves on a client (§7, *Unbreakable tools*); a generator would only copy it. It changes little in Phase 5 (the bread merge, open question 8).
- **Quality of Life tabs stay hand-written.** They teach mods, not eras; they are small (12 to 21 quests), were rewritten in v0.5.1 and the voice pass, and have no era data to generate from. Power, Multiblocks and the charts keep their own generators.

### 4.2 The data format (defined once)

One folder per era, `tools/quests/<era>-chapter/` (the existing names; `maxplus-chapter` new). One data file per chapter: `quests-data.mjs` (the age chapter, as now), `circuits-data.mjs`, `machines-data.mjs`, `integration-data.mjs`, and for MAX `horizon-data.mjs`; MAX+ names its files after its chapters. Each file exports:

```js
export const CHAPTER = {
  filename: 'zpm_machines',      // the chapter file
  era: 'zpm',                    // id seed: every chapter of an era shares 'c2-<era>-quests'
  role: 'machines',              // age | circuits | machines | integration | capstone
  title: 'ZPM: Machines',
  subtitle: ['One line, in the voice of docs/quests.md section 8.'],
  icon: 'gtceu:zpm_machine_hull',
  autofocus: 'ZM_START',
  // id, group and order_index come from filename, era and role (lib/chapter-gen.mjs); the age chapter of EV keeps its pinned id
};
export const LINKS = [            // quest_links shown in this chapter
  { key: 'ZM_L_SATURN', ref: 'LEVEL5', x: 0, y: -3 },   // ref: a key of this era, '<era>:KEY', or 'X:<hex>'
];
export const QUESTS = [
  {
    key: 'ZM_DEC', kind: 'machine', title: 'Direct Conversion', icon: 'gtceu:direct_energy_converter',
    x: 4, y: 0, deps: ['ZM_START', 'luv:FUSION', 'X:2897E3EB8159710C'],
    teach: { for: '...', needs: '...', unlocks: '...', automate: '...' },   // joined into the description, in this order
    desc: ['optional extra paragraph'],
    tasks: [it('gtceu:direct_energy_converter'), it('gtceu:...casing', 16), ck(), dim('gcyr:luna')],
    rewards: [xp(150)],
    // optional: id (pinned), shape/size (override kind), optional: true, pkg: ['B6'], fallback: {...}, slot: 'x', raw: {...}
  },
];
```

- **Keys** are unique within an era, across its chapters. `deps` and `ref` take a key of the era (any of its chapters), `<era>:KEY` for another generated era, or `X:<hex>` for a hand-written chapter (Welcome, Quality of Life).
- **Ids** are `sha256('c2-<era>-quests|' + key)` with the high bit cleared and the first digit 1-7 (§10), tasks and rewards as today. Because the seed is the era's, a quest that moves between chapters of its era keeps its id. A pinned `id` wins (EV and the imported chapters).
- **`kind`** gives the shape and size of §4: `start` (rsquare 1.5), `step`, `wafer`, `circuit` and `process` (hexagon 1), `machine` and `plant` (gear 1.25), `signature` (gear 1.5), `reading` (circle 0.75), `side` (hexagon 0.75, optional), `milestone` (rsquare 1.25), `exit` (diamond 1.75). `machine`, `plant`, `signature`, `wafer`, `circuit` and `process` must carry `teach`; the writer fails without it.
- **Tasks and rewards:** `it(item, count)`, `ck()`, `dim(dimension)`, `tag(tag, title, icon)` (itemfilters), `xp(n)`, `ri(item, count)`. `raw` passes any field the writer does not model straight into the SNBT, so the importer is lossless.
- **The package gate** (`pkg`, `LANDED`, `fallback`, `slot`) is `luv-chapter`'s, unchanged, available to every era: MAX+ quest data can be written before every MAX+ package lands.

### 4.3 Running it

- Package: edit data only. On the VM: `node tools/quests/gen-chapters.mjs --era <era> --out /tmp/q && node tools/quests/lint.mjs --book /tmp/q --items <dump items.json>` (`--out <dir>` writes the chapters there, `--out -` prints them). Commit no `.snbt`. Steam to IV were imported from their hand-written SNBT by `lib/import-snbt.mjs` (RF-5L2); a task the writer does not model (a tag filter) is carried as its own SNBT in the task's `snbt` field.
- Integrator, once per batch, in this order: `gen-chapters.mjs` (all), `processing-lines/run.ps1 -Dump <dump> -Write` (charts and Power: Power links to era quests), `multiblocks/gen.mjs --dump <dump> --write`, `lint.mjs`, then `GG_QUESTS_EXPECTED`, `chapter_groups.snbt` and `lint-config.json` from what the generators print.

## 5. Phase 5 packages

### 5.1 Common to every package

- One Sonnet session, one issue, one branch from the integration branch (`AGENTS.md` *Work packages*); at most 2 repairs.
- Files: the era's data folder only, plus the files a row lists. Never `pack/config/ftbquests/**` (the integrator regenerates; RF-5T alone edits the hand-written Welcome and tab files), `GG_QUESTS_EXPECTED`, `lint-config.json`, `chapter_groups.snbt`, `CREDITS.md`, `DECISIONS.md`.
- Facts against the latest dump (`$GG_DUMP` on the VM), not memory (§16 rule 4).
- Tests: T0 (GitHub Actions); on the VM the generator and `lint.mjs` with `--items` on the generated chapters: 0 errors, 0 warnings or warnings explained in the handoff for the integrator's `lint-config.json`. T2 (`gg_test_quests`, the counts) and T3 (`gg_test_quest_book` shots) are the integrator's, per batch (§11, proven mechanisms).
- Handoff: the contract's block, plus the new counts per chapter (for `GG_QUESTS_EXPECTED`) and any `CREDITS.md` rows.

### 5.2 Package table

| # | Id | Scope (chapters) | Likely files | Depends on | Tests | Parallel |
|---|---|---|---|---|---|---|
| 1 | **RF-5L1** Shared writer | `lib/chapter-gen.mjs`, `gen-chapters.mjs`; port EV, LuV, ZPM to MAX onto it with byte-identical output; links, era seeds, `kind`, `teach`; per-era group ids and the Progression groups in one writer shared with `pl-gen.mjs` (`lib/groups.mjs`) | `tools/quests/lib/`, `tools/quests/gen-chapters.mjs`, `tools/quests/*-chapter/gen.mjs` (removed), `processing-lines/pl-gen.mjs` (groups only), `.github/instructions/quests.instructions.md` (table), `docs/quests.md` §11 | — | T0; VM: every chapter regenerates byte-identical (`git diff --exit-code` after the run) | Serial, alone (shared lib) |
| 2 | **RF-5L2** Importer, limits, links | `lib/import-snbt.mjs`; Steam, LV, MV, HV, IV imported to data (round trip); per-role text limits in `lib/checks.mjs` and `lint-config.json`; Power and chart `E()` links resolve the chapter from the id | `tools/quests/lib/`, `tools/quests/{steam,lv,mv,hv,iv}-chapter/quests-data.mjs` (new), `lint-config.json` (limits block only), `processing-lines/pl-lib.mjs`, `docs/quests.md` §11, §13 (source line) | RF-5L1 | T0; VM: round trip equal for the five; full lint unchanged | Serial |
| 3 | **RF-5Q-SL** Steam and LV | `steam_age`, `lv_age`: rule-5 review (circuit rows), LV's 3 warnings | `steam-chapter/`, `lv-chapter/` | RF-5L2, LD-T3 (#94) | Common | With 4 |
| 4 | **RF-5Q-MH** MV and HV | `mv_age` (2 warnings, ULPIC if MV), `hv_age` (wafer and microprocessor ladder split back out; HV multiblock gears with `teach`) | `mv-chapter/`, `hv-chapter/` | RF-5L2 | Common | With 3 |
| 5 | **RF-5Q-EV** EV | `ev_age` reshaped; new `ev_circuits`, `ev_machines` (integration rows) | `ev-chapter/` | RF-5L2, LD-T3 | Common | With 6 |
| 6 | **RF-5T** Welcome and tabs | Welcome's bread merge (open question 8); the five tabs: an item reward tied to the age where each opens (section 3.2) | `welcome.snbt`, the five tab `.snbt` files (hand-written; this package edits them) | RF-5L2 | Common; `gg_test_quest_book` stays green (integrator T3) | With 5 |
| 7 | **RF-5I1** Batch 1 (integrator) | Regenerate; groups (open question 1); counts; T2; T3 shots of the new EV chapters; before and after renders of Steam to EV | integrator files | 1-6 | T2 `gg_test_quests`; T3 `gg_test_quest_book`; render compare | **Owner review: the shape is approved on EV before ZPM starts** |
| 8 | **RF-5Q-IV** IV | `iv_age` reshaped; `iv_circuits` (quantum), `iv_machines` | `iv-chapter/` | RF-5I1 | Common | With 9 |
| 9 | **RF-5Q-LUV** LuV | `luv_age` reshaped; `luv_circuits`, `luv_machines`; keeps `LANDED` and the stations modes (§14 in Appendix A) | `luv-chapter/`, `luv-stations.mjs` if a key moves | RF-5I1 | Common; `tools/analysis/test/luv-quests.test.mjs`, `luv-stations-quests.test.mjs` | With 8 |
| 10 | **RF-5Q-ZPMa** ZPM journey and integration | `zpm_age` reshaped; `zpm_integration` | `zpm-chapter/quests-data.mjs`, `integration-data.mjs` | RF-5I1 | Common | With 11 (same folder, separate files; the age chapter's `START` and gate keys are fixed) |
| 11 | **RF-5Q-ZPMb** ZPM circuits and machines | `zpm_circuits`, `zpm_machines` | `zpm-chapter/circuits-data.mjs`, `machines-data.mjs` | RF-5I1 | Common | With 10 |
| 12-13 | **RF-5Q-UVa / UVb** | as 10-11 for UV | `uv-chapter/` | RF-5I1 | Common | a ∥ b |
| 14 | **RF-5I2** Batch 2 (integrator) | IV, LuV, ZPM, UV, Welcome and tabs; renders | integrator files | 8-13 | T2; render compare | Owner sees IV to UV |
| 15-16 | **RF-5Q-UHVa / UHVb** | UHV | `uhv-chapter/` | RF-5I2 | Common | a ∥ b |
| 17-18 | **RF-5Q-UEVa / UEVb** | UEV | `uev-chapter/` | RF-5I2 | Common | a ∥ b |
| 19-20 | **RF-5Q-UIVa / UIVb** | UIV | `uiv-chapter/` | RF-5I2 | Common | a ∥ b |
| 21-22 | **RF-5Q-UXVa / UXVb** | UXV | `uxv-chapter/` | RF-5I2 | Common | a ∥ b |
| 23-24 | **RF-5Q-OPVa / OPVb** | OpV (fix its 5 warnings in a) | `opv-chapter/` | RF-5I2 | Common | a ∥ b |
| 25 | **PL-MX** MAX chart rows | L47-L57 on `pl_max`, checked with `pl-check.mjs` against a dump that has machines 11-14 | `processing-lines/pl-data-max.mjs` | RF-5I2 | T0; VM `run.ps1 -Dump $GG_DUMP` (no `-Write`): `pl-check` 0 issues | With 26 |
| 26 | **MX-C2** MAX quest data | `max_age` reshaped; `max_circuits`, `max_machines`, `max_integration`, `max_horizon` (machines 11-14, the lock); the stale credits comment | `max-chapter/` | RF-5I2, MX-C1 (merged) | Common | With 25 |
| 27 | **RF-5I3** Batch 3 (integrator) | UHV to MAX; renders | integrator files | 15-26 | T2; render compare | Owner sees UHV to MAX |
| 28 | **RF-5P** Power after LuV (optional) | ZPM to MAX bands in `power-data.mjs`, figures only where `pl-check` recomputes them | `processing-lines/power-data.mjs` | RF-5I3 | T0; VM `run.ps1` | Alone (open question 6) |
| 29 | **XP-PL** MAX+ chart | `maxplus` as a pseudo tier in `pl-model.mjs` `TIERS`; `pl-data-maxplus.mjs` (P1-K4, the tree's recipe types) | `processing-lines/pl-model.mjs`, `pl-data-maxplus.mjs` | XP-C1 | T0; VM `run.ps1` | Serial on `pl-model.mjs`; with 30 |
| 30 | **XP-C2a** MAX+ stages I and II | `maxplus_age_1`, `maxplus_age_2`, `maxplus_circuits`, `maxplus_machines`, `maxplus_integration` | `maxplus-chapter/` | XP-C1, RF-5I3 | Common | With 29 |
| 31 | **XP-C2b** MAX+ stage III | `maxplus_age_3`, `maxplus_creative`, `maxplus_tree` (or folded, section 2.2), `maxplus_hyperstargate`; the arrival quest | `maxplus-chapter/` (its own files) | XP-C2a | Common | After 30 |
| 32 | **RF-5I4** Batch 4 (integrator) | MAX+; the whole book; T3 shots of the last chapters | integrator files | 29-31 | T2; T3; render compare | Release candidate input |

Sizes: each era package writes 25 to 60 new or reworked quests; a and b split every era from ZPM so no session writes more than about 60. RF-5L1 and RF-5L2 are tool packages of one session each. XP-C2 replaces `maxplus.md`'s single row 25 with XP-PL, XP-C2a and XP-C2b.

### 5.3 Order, parallelism and renders

- **Serial:** RF-5L1 → RF-5L2 (shared lib); `pl-model.mjs` (XP-PL alone); every integrator batch.
- **Parallel pairs** (efficiency pilot: two workers): 3 ∥ 4, 5 ∥ 6, 8 ∥ 9, then each era's a ∥ b, and 25 ∥ 26, 29 ∥ 30. Packages never share a file: an era's a and b own separate data files, and the age chapter's start and gate keys are fixed by a before b starts.
- **Early eras first.** Batch 1 is Steam to EV plus Welcome and the tabs: the owner sees the familiar chapters and the first split era together. ZPM work starts only after the owner approves batch 1's renders.
- **Renders.** Each batch, on the VM: capture `before` from the integration branch head before merging (`node tools/quests/render-book.mjs --out /tmp/gg-render/<batch>-before`), regenerate, capture `after`, then `--compare` the two into `/tmp/gg-render/<batch>-compare` and copy it to `C:\Users\EzequielC\gg-reforge\quests\` with `scp -r`. Images never go in the repository (DECISIONS.md:722). The integrator links the compare index in the batch handoff.

## 6. Open questions for the owner (the defaults stand until answered)

1. **Chapter groups.** One group per era from EV (EV, IV, … MAX, MAX+), Steam to HV in "Early Ages", Processing Lines and Quality of Life as now? **Default: yes.** The alternative keeps one Progression group of about 60 chapters.
2. **MAX+ size.** Nine chapters and about 144 progression quests, with the Hyperstargate tree on the `pl_maxplus` chart, instead of `maxplus.md`'s 18 chapters and 180-240 quests? **Default: nine.**
3. **Six roles, not six chapters.** Steam to HV stay one chapter each, EV to LuV get three, ZPM to OpV four (section 2.1)? **Default: yes.** `docs/quests.md` §1's "each era gets six chapters" is then read as six roles (proposed line in section 7).
4. **Longer text for teaching quests.** 120 words and 5 paragraphs in the circuits, machines, integration and capstone chapters; 70 and 4 elsewhere? **Default: yes.**
5. **The 2026-10-25 cuts.** Keep cut what any GregTech player knows (transformers, cables, HSS-G coils, GCYM machines, plain IV components), but restore every wafer and circuit step that was merged (HV's *EV Workstation*)? **Default: yes.**
6. **Power after LuV.** Extend the Power tab to MAX only with figures `pl-check` can recompute (RF-5P), and let the integration chapters teach the plants meanwhile? **Default: yes, RF-5P last and optional.**
7. **Rewards.** XP on every quest, items only from lines the gate into the era already required, at most one craft's worth (section 3.2)? **Default: yes.**
8. **Welcome's bread.** Merge the two bread rewards into one stack of 64 (§7 allows it; there are no saves)? **Default: yes.**
9. **Before captures.** Recapture `before` per batch on the VM instead of using Q-0's capture, which predates the Phase 3 charts? **Default: yes.** Q-0's capture stays as the record of the v0.17.0 book.

## 7. Proposed lines

- **DECISIONS:** `2026-11-01 · Phase 5 quest design (RF-5A, docs/reforge/05_quest_design.md): six roles per era (what's new, materials processing, wafers and circuits, machines, integration, capstone) mapped onto 1 chapter (Steam to HV), 3 (EV to LuV), 4 (ZPM to OpV), 5 (MAX) and 9 (MAX+), plus each era's Processing Lines chart, which stays the tracked-item layer; about 1,290 progression quests against 756; one shared generator with one data format, Steam to IV moved to data, Welcome and the Quality of Life tabs hand-written; MX-C2 and XP-C2 are Phase 5 packages; item rewards only from lines the era's gate already required; quests are English only (supersedes the es_es lines of zpm.md, uv.md and uhv.md).`
- **`docs/quests.md` §1 (for the integrator):** replace "Each era gets six chapters: …" with "Each era teaches six roles: …; `docs/reforge/05_quest_design.md` maps them onto chapters."
- **CREDITS:** none: this package copied nothing. Era packages propose their rows (section 3.2).

## Appendix A: the chapter plan before Phase 5 (moved from `docs/quests.md` §14)

The v0.17.0 plan for Steam to ZPM, moved here unchanged so `docs/quests.md` §14 can point to this design. It records each chapter's spine, branches, fixed blocks (MV's End row, HV's rocket block), the sky row and the LuV and ZPM regeneration orders, which stay in force until RF-5L1 replaces the per-era generators. Headings are one level down from the original.

#### The journey's spine

Each age looks at the Moon through a better instrument, and what it sees is what the next age needs. In each chapter this is the **sky row**: its own row above all the others, from left to right, ending above the chapter's exit.

| Age | Instrument (id) | What the player sees | Chart (id) | Used by |
|---|---|---|---|---|
| Steam | Clockwork Observatory (`gtceu:steam_observatory`, *Stargazing* recipes) | Through the eyepiece, at night: dark seas, bright highlands, the big craters and their rays. Clear sky, and the controller at Y 100 or higher, above the haze and the smoke of the coke ovens. | Lunar Chart (Draft) (`grindless:lunar_chart_draft`) | The optical observatory, without using it up |
| LV | Optical Observatory (`gtceu:optical_observatory`, *Astrophotography*) | On photographic plates (`grindless:photographic_plate`): cracks, chains of craters, long shadows on the terminator; flat and rugged ground told apart. And the tables of where the Moon will be each night. | Photographic Lunar Map (`grindless:lunar_map`) and Lunar Ephemeris (`grindless:lunar_ephemeris`) | The radio telescope, without using them up |
| MV | Radio Telescope (`gtceu:radio_telescope`, *Radio Astronomy*) | Radar echoes over the map: smooth seas, fields of rocks, crater walls, and an ellipse on a flat sea marked in red. It works through clouds and rain; a storm drowns out the echo. | Lunar Landing-Site Chart (`grindless:lunar_landing_chart`) | The rocket chip (HV) |
| HV | The rocket | The landing site on the chart | — | *Liftoff* → *The Moon* |
| EV | The lunar base | The Moon up close: regolith, ilmenite, lunar day and night | — | — |

Rules:

- **Never promise a machine that has not passed its test.** Until the coordinator says a machine has passed, no quest or text names it. Meanwhile the sky row stays empty; the text at the start of each chapter can mention the Moon in the sky, without machines.
- When an instrument comes in: a gear at 1.25 in the sky row, with the controller as a task; to its right, the chart (task: the chart). An age's chart is a dependency of the next instrument. Lines are not drawn between chapters, so the text says so ("the draft from the steam age guides it").
- The text says what is seen, in one sentence, plus the sky rule (night, clouds, height). The table is source material, not text to copy.
- In HV, when the launch route changes the chip recipe, *Liftoff* gains a dependency on the landing-site chart and its text changes ("the chip is written from the landing-site chart"). Its id does not change.

#### Incoming machines

They come in once their test passes and the coordinator says so; each agent leaves its list in `files/scratch/quest-needs/<agent>.md`. All five are in the book now.

| Agent | Machines | Where they go | How they hook in |
|---|---|---|---|
| steam-content | Steam blast furnace, coke battery | Steam | The battery in the coke row, after *Coke Oven*; the steam blast furnace after *Primitive Blast Furnace*, as a second route to steel |
| lv-content | Sulfide roaster, heliostat tower | LV | The roaster in the chemistry row, after the contact catalyst; the tower in the power row |
| observatory | The three observatories and their charts | Steam, LV, MV | Sky row (top) |
| launch-road | Engine test stand, RP-1, qualified thrusters (MV); composite autoclave, ablative tiles, wrapped tanks, untested engine and static fire (HV) | MV and HV | In HV they go in front of the rocket parts: *Rocket Motors* comes to depend on the static fire, and *Fuel Tanks* on the wrapped tanks. Their ids and tasks do not change |
| syngas | Syngas plant | HV | Chemistry row, after the refinery: hydrogen and CO for methanol and ammonia |

#### Steam — "Steam Age: Escape Velocity" (`steam_age.snbt`, 44 quests, 50 dependencies; done, with the sky row and the new steam machines; voice rewrite 2026-10-25)

The sky row and the steam-content machines are in. Section 13 describes the chapter.

#### LV — "LV: The First Spark" (`lv_age.snbt`, 51 quests, 52 dependencies; done in v0.5.1, voice rewrite 2026-10-25)

- **Start:** *LV Factory* (current id), depends on *LV Steam Turbine*. Journey line: first electricity; the Nether goes from a round trip to a place you work in.
- **Spine:** *LV Factory* → *LV Components* (motor, piston, pump, belt, arm) → *LV Assembler* → cupronickel coils → *Electric Blast Furnace* (gear 1.5) → *Aluminium* → *MV Machine Hull* → *LV to MV Transformer* (exit, diamond).
- **Branches:**
  - at the very top, the sky row: photographic plates → *Optical Observatory* (gear 1.5) → lunar map → ephemeris;
  - top, ore: macerator → washer → thermal centrifuge → centrifuge (with the warning that the LV and MV macerators give no byproducts);
  - above the spine, power: the generator array (*Sixteen Turbines, One Hall*), and mirror field → *Heliostat Tower* → steam for the night;
  - below the spine, the *LV Vein Drill* (gear 1.5) → drilling fluid → *Nether Veins*;
  - bottom, chemistry: gas collector → electrolyzer → chemical reactor → mixer → contact catalyst → *Sulfide Roaster* → silver from galena;
  - bottom, green: *LV Greenhouse* (gear 1.5) → fertilizer → creature simulator → first pearl → models → the creeper and blaze models (for MV);
  - bottom, circuits: good board (off the chemical reactor) → diodes → *MV Circuit* → circuit assembler;
  - bottom right: forming press → graphite electrode → *Submerged Arc Furnace* (gear 1.5) and the AE2 branch, up to *ME Network Access*.
- **Cut on 2026-10-25** (section 8): *LV Grid*. The two-hatch trick is in *Electric Blast Furnace*.
- **AE2:** the AE2 steps that live in LV today stay in LV as their branch (the user wants all of AE2 in LV). The AE2 tab starts by depending on the last of them and does not repeat them.
- **Sources:** GTCP Modern `lv__low_voltage` (*Progressing Through LV*, *Electricity Generation*, *But what are Amps?*, *Battery Buffer*, *Machine Auto-Output Behaviour*, *Cover Behaviour*, *Programmed Circuits*, *What is this Mess?: Part Two*, *Cupronickel Coils*, *Gallium Arsenide*, *First MV Circuit!*); Monifactory `genesis` (*A Primer on Power*, *Battery Buffers*, *Charging Items*); Star Technology `industrial_revolution` for tone.

#### MV — "MV: The Far End" (`mv_age.snbt`, 49 quests, 60 dependencies; done in v0.5.1, voice rewrite 2026-10-25)

- **Start:** *MV Factory*, depends on *LV to MV Transformer*. Journey line: the End, beyond the world.
- **Spine:** *MV Factory* → *MV Components* → chromium and aluminium → *Kanthal* → *Silicon Ingot* → *Silicon Boule* → *Silicon Wafers* → ILC and RAM → *Integrated Circuits* → *Advanced Integrated Circuit* → *Cleanroom* (exit, also after *HV Machine Hull* and *HV Motor and Pump*).
- **Fixed End row** (v0.5.0): *Blaze* (`3C356A1439744E15`) → *Ender Eye* (`3DDBE9267C197FEE`) → *End Key* (`756117B334515EA3`) → *End Veins* (`004525B795119B1B`, also depends on *Vanadium Steel Drill Bit*). Ids and tasks stay; the row can be moved as a whole.
- **Branches:**
  - at the very top, the sky row: *Radio Telescope* (gear 1.5) → landing-site chart, and the weather controller;
  - top, ore: *Ore Plant* (gear 1.75, the age's multiblock) → stone dust separation, and *MV Vein Drill* with the vanadium steel drill bit; the End row runs up from *Blaze* to *End Veins*;
  - above the spine: vanadium steel → *MV Cutter and Laser Engraver*, which the wafers need; *AE2 Grows Up* (optional) off the integrated circuits;
  - below the spine: *Stainless Steel* off *Kanthal*; *MV Fluid Drilling Rig* → diesel → kerosene → RP-1 → *Engine Test Stand* → qualified power thrusters (the MV launch route), and brine and chlorine;
  - bottom, carbon: *MV Greenhouse* → pyrolysis → methanol → *Biorefinery* (gear 1.5, the age's second multiblock) → ethylene and PE → transistors, PVC → hazmat suit, and *HV Machine Hull* → *HV Motor and Pump*;
  - bottom left: the four universal factories → advanced multi smelter → lava furnace.
- **Layout fixes:** done in v0.5.1 (the lines of 14 to 27 squares from *MV Grid*, *MV Components* and *Biorefinery* crossed the whole chapter and the End row).
- **Cut on 2026-10-25** (section 8): *Copper Cable*, *MV Grid*, *MV Ore Machines*, *MV Steam Turbine* and *MV to HV Transformer*.
- **Sources:** GTCP Modern `mv__medium_voltage` (*Transformers*, *Kanthal Coils*, *Stainless Steel*, *Silicon Lottery*, *Moore's Law*, *Polyethylene*, *The Church of Diesel*, *Desulfurization*, *Distillery*, *Pyrolyse Oven*, *Greenhouse*, *Sulfuric Acid*, *Hydrochloric Acid*); Monifactory `groundwork` (silicon, Kanthal) for structure.

#### HV — "HV: Moonshot" (`hv_age.snbt`, 32 quests, 40 dependencies; done in v0.5.1, voice rewrite 2026-10-25)

- **Start:** *HV Factory*, depends on *Cleanroom* (the MV exit). Journey line: the Moon, the first place off Earth.
- **Spine:** *HV Factory* → *HV Components* → *Refinery* (gear 1.5) → hydrotreating catalyst → cracking and olefins → PTFE → *Gasoline* (the large chemical reactor) → rocket fuel → *Static Fire* (gear 1.25) → rocket motors → *First Rocket* → *Liftoff* → *The Moon* (exit).
- **Fixed rocket block** (v0.5.0): *Rocket Fuel* (`76D281E9D9C6FD20`), *Rocket Motors* (`5C1D3FB96A9FB74A`), *Fuel Tanks* (`4A6E81ABD8026025`), *Launch Pad* (`7B21622AADB1E1D1`), *Space Suit* (`5615E54AF782990A`), *First Rocket* (`5151DE8D3623EDCF`, scanner and seat), *Liftoff* (`4A672DF7CF424623`, chip), *The Moon* (`2897E3EB8159710C`, dimension task `gcyr:luna`). They go piece by piece so the launch route can change recipes without breaking them. The fuel and the pad hang off *Gasoline*, the motors off the static fire and the tanks off the overwrapped tanks. The suit hangs off *Fuel Tanks*, because its fabric is the same para-aramid and Kapton. *Liftoff* also needs MV's landing-site chart, and *The Moon* needs the suit. They can be moved; ids and tasks stay.
- **No longer in HV:** Ender Eye, End Key and End Veins (MV); titanium, EV Machine Hull, HV→EV transformer, EV Motor and Pump, and Distillation Tower (all EV; since the 2026-10-25 voice pass the transformer and the tower are gone, and the motor and pump quest is *EV Components*). *Nichrome* stays in HV as a branch: EV's *Regolith Cell* depends on it, because its crucible is ringed with nichrome coils.
- **Branches:**
  - top left, ore and green: *HV Greenhouse* (gear 1.5) and *HV Vein Drill* → stainless steel drill bit;
  - top, the optional *Catalytic Reformer* (gear 1.5) → reforming catalyst, off the hydrotreating catalyst;
  - top right, the launch road: *Composite Autoclave* (gear 1.5, off cracking) → heat-shield tiles → *Untested Rocket Motor* → *Static Fire* on the spine, which also depends on MV's engine test stand; GT drums (off MV's stainless steel) and the autoclave → overwrapped tanks → *Fuel Tanks* → *Space Suit*;
  - bottom: *Cleanroom in a Hatch* off *HV Components*, and *Syngas Plant* → water-gas shift off the refinery;
  - bottom, circuits: *EV Workstation* (CPU wafer, microprocessor assembly and workstation in one quest) → *Vacuum Freezer* → *Nichrome*.
- **Cut on 2026-10-25** (section 8): *HV Grid*, *Large Steel Boiler and Turbine*, *Black Steel and Red Steel*, *HV Cutter and Laser Engraver*, *Natural Gas and Refinery Gas*, *Hydrofluoric Acid*, *Epoxy and SBR*, *Super Chest and Tank* and *AE2 at HV*. *CPU Wafer* and *Microprocessor Assembly* went into *EV Workstation*.
- **Sources:** GTCP Modern `hv__high_voltage` (*High Voltage Machines*, *The Cleanroom*, *Large Chemical Reactor*, *Ice Cold*, *Nichrome Coils*, *Polytetrafluoroethylene*, *HV Circuit Assembler*, *The End of an Era*).

#### EV — "EV: Lunar Base" (`ev_age.snbt`, 55 quests, 63 dependencies; done in v0.6.0, voice rewrite 2026-10-25)

Spine: the journey from *Lunar Base* to *Red Horizon* and the *IV Machine Hull*. Above it the Moon and Mars, below it Earth's power, platinum and nano circuits (see `docs/eras/ev.md`, "Quests"). Far requirements are named in the text, not drawn as long lines (section 5).

The chapter is generated: its source is `tools/quests/ev-chapter/quests-data.mjs` (every quest, task and reward id spelled out). Edit the data and run `node tools/quests/ev-chapter/gen.mjs`, which rewrites `ev_age.snbt` in the book's format.

#### IV — "IV: Inner Planets" (`iv_age.snbt`, 53 quests, 74 dependencies; done in v0.7.0)

Spine: the route from the hot cell and the reactor, through the Moon's tritium and the chart, to Mercury, iridium and the assembly line, ending at *Gate to LuV*. Above it uranium, fuel and Venus; below it heavy water, Mercury's solar field and the parallel hatch (see `docs/eras/iv.md`, "Quests"). Machine quests carry the machine's name; the two landings (*Under the Clouds*, *Day of Fire*) are the milestones.

#### LuV — "LuV: The Outer System" (`luv_age.snbt`; written while LuV is built, package LuV-C2)

- **Start:** *The Outer System*, after *Gate to LuV*. Journey line: superconductors at home, a station in orbit, then the belt and Jupiter's moons.
- **Spine:** *LuV Components* → *Osmiridium* → *Tape* (coated conductor line) → *Winding* (HTS magnet works, gear 1.5) → *The Network Goes LuV* (SMES cells) → *Packed and Launched* → *First Station* (Earth orbit) → *Level Four* → *Behind the Vault* (Io) → *Fumarole* → *Patera* → *Riding the Torus* or *Iodine Loop* → *Fusion* → *Europium* → *First Data Orb* → *Gate to ZPM* (exit).
- **Above:** the trinium line (*Naquadah Coil*, *Full Recovery*, *Trinium*, *Reactor III*, *Sixteen at Once*); the station's machines (*Endless Day*, *Fibre from Nothing*, *In the Wake*); the belt (*The Belt*, *Harpoon*, *Mond*, *Star Metal*, *Sunlight on a Boulder*, *Molecular Farm*).
- **Below:** *Closed Loop*, *Biofoundry*, *Engineered Seeds*, *Perfect Crystal*; Europa (*Under the Ice*, *Cryobot*, *Something Alive*, *Stem Cells*, *Organoid*, *Living Circuits*) and Ganymede (*Quiet Moon*, *Chirp*, *Coilgun*, *Into the Clouds*, *Slingshot*).
- **Generated:** `tools/quests/luv-chapter/quests-data.mjs` → `gen.mjs`. Ids are hashes of the quest keys. Each quest names the LuV packages it needs; only quests whose packages are all in `LANDED` reach the book, a dependency on a left-out quest goes to its parents, and `fallback` places fusion and research at home until Io lands. `S03` stands for spike S0-3 (`tables/stations.json` `enabled`): the station, Earth orbit's machines and what needs their products (the ring, the organoid lab, living circuits, the detector and the gate) wait for it. When a package merges: add it to `LANDED`, check its ids, run `gen.mjs --pending` (what is still waiting), `gen.mjs`, the linter, and update `GG_QUESTS_EXPECTED.luv_age`. `gen.mjs --all --out <file>` draws the finished chapter (it lints clean too). `tools/analysis/test/luv-quests.test.mjs` fails if the book names an id nothing registers or is stale.
- **The stations switch:** `S03`, `B7T` (the flux-tube tether) and `B7S` (the sulfur-iodine plant) are not listed by hand. `tools/quests/luv-stations.mjs` derives them from `tables/stations.json` with the rule of `lib/stations.js` (`enabled` gives `S03`; `second` null gives `B7S`, else `enabled` gives `B7T`, else neither), and the `LANDED` sets of `quests-data.mjs`, `pl-data-luv.mjs` and `power-data.mjs` add them, so no chapter names the machine the pack leaves out. After the table flips, regenerate in this order (Power links to `luv_age`): `node tools\quests\luv-chapter\gen.mjs`, then `powershell -File tools\quests\processing-lines\run.ps1 -Dump <kubejs-exported> -Write [-Preview]` (`pl_luv` and `power`; it lints the charts and the book), then `node tools\quests\lint.mjs`, and update `GG_QUESTS_EXPECTED` for `luv_age`, `pl_luv` and `power` with the counts the generators print. `tools/analysis/test/luv-stations-quests.test.mjs` draws all three modes from an injected table (`GG_STATIONS_TABLE`).
- **No low gravity in the text:** GCYR's gravity isn't applied in game.

#### ZPM — "ZPM: The Ringed and Ice Giants" (`zpm_age.snbt`; package ZPM-C2)

- **Start:** *Saturn and Beyond*, after *Gate to ZPM*. **Exit:** *Gate to UV* (the UV hull and energy hatch, the Pluto–Kuiper chart and the solar-core survey).
- **Parts:** home (*Naquadria* → *Fuel* → *Excited* → *The Big Reactor*, europium, the stored waste and americium, URhNq₂ wire, *The Network Goes ZPM*, the Mk2, the quench caster, the ZPM parallel hatch); carbon and qubits (*Graphene* … *Qubits Instead of Circuits*); life and cold (*Vent Life*, *Aerogel*, *Neutrinos*); Saturn (*Level Five*, *Third Station*, ring ice, the siphon, helium-3, Titan, the plume, the seismometer); Uranus (*Level Six*, *Fourth Station*, the ice-giant siphon, diamond slurry, the flyby); exit (*Listening*, *Kuiper Targets*, tritanium, darmstadtium, D + He-3, the direct energy converter, the gate).
- **Generated:** `tools/quests/zpm-chapter/quests-data.mjs` → `gen.mjs` (every package has landed, so there is no `LANDED` gate). `pl_zpm` comes from `processing-lines/pl-data-zpm.mjs` and Power's ZPM clusters from `power-data.mjs` (no EU/t figures until a bench run measures them). Regenerate in this order (Power links to `zpm_age`): `gen.mjs`, `processing-lines/run.ps1 -Write`, `lint.mjs`, then update `GG_QUESTS_EXPECTED` for `zpm_age`, `pl_zpm` and `power`.
- **Adapted ideas:** Star Technology (MIT) and Monifactory (LGPL), with attribution in `CREDITS.md`; GTNH and GT Leisure ideas only.
