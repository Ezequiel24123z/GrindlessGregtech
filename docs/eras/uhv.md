# UHV (T9): Proxima Centauri b, the Dyson swarm and the gate

UHV arrives. A level 8 rocket lands on Proxima Centauri b, 4.24 light years out, where the Starshot's approach data said it would be. Alien flora grows under a red dwarf, and its chemistry comes home through a planetary-protection facility. Mercury's orbit becomes the seventh station and the foundry of a Dyson swarm around the Sun: Kardashev II, generous but never free. A pair of warp gates joins Earth orbit and Proxima b's orbit, and GTCA's space elevator finally gets its recipes.

At home, the era is isotopes, light and life:
- a high-flux isotope reactor and a transuranium facility breed berkelium and californium from UV's heavy curium;
- thorium-229, milked from UV's aged uranium-233, becomes a nuclear clock;
- lithium niobate, quantum cascade lasers, silicon carbide and phase-change memory make the photonic circuits GTM does not give;
- organoid arrays turn the neural culture vat's cells into UHV circuits in batches;
- positrons meet UV's antiprotons as antihydrogen, the gate's charge.

The network goes UHV on the nuclear clock.

**Size (rule 7, and the user's 2026-10-27 direction: "much more, above all processing lines"):** the targets are a guideline, not a quota. No machine or line was added to hit a number.

| | UV (as designed) | UHV (this design) | Growth | Guideline |
|---|---|---|---|---|
| Progression multiblocks | 31 | **31** | ×1.0 | about 42 (×1.35) |
| New process lines | 22 | **32** | ×1.45 | about 33 (×1.5) |
| Steps per line, average (items between arrows, counted the same way for both eras) | 6.9 | **7.0** (none under 6) | ×1.01 | at least 4 each, average at least UV's |
| Crossings with lines two or more eras back (ZPM and older) | 24 | **40** | ×1.67 | about 36 (×1.5) |

- **Why 31 and not 42:** UHV's growth goes into lines and crossings, as the user asked, and into three systems that are not counted under rule 7: GTCA's space elevator with its modules, the warp gate's second end, and the UHV wireless tier. The machines that would close the gap were each a convenience version, a second machine for one chain, or content that belongs to UEV:
  - a calutron for calcium-48 (superheavy targets are UEV's; IV dropped a calutron already, `docs/eras/iv.md:632`);
  - a separate antihydrogen trap (UV's antimatter trap takes a mode);
  - a solar power satellite with a rectenna (LuV dropped the beam ledger, `docs/eras/luv.md:1473`: the wireless network carries the power);
  - a Mercury mass driver (ZPM dropped it, `docs/eras/zpm.md:758`: AE2 moves the mass);
  - a free-electron laser (the UV synchrotron's lithography is enough for UHV dies);
  - a neutron-transmutation-doped silicon line (the SiC fab covers UHV's power devices);
  - a superconducting SFQ foundry and an atomically precise fab (no UHV item needs them);
  - a Proxima flare monitor, a Proxima d flyby, an Alpha Centauri AB probe (data with no product).

  They are listed under *Considered and dropped*. The count matches UV's because UV's was itself a large step (×1.15) and UHV's places are fewer and deeper: two new stations, one new surface.
- **`docs/research/complexity.md:97`'s ×1.5 for lines from UV on** is met within one line, and crossings exceed it.
- **The UHV era in four sentences:**
  1. Heavy curium becomes berkelium and californium in a high-flux reactor, and aged uranium-233 gives thorium-229 for a nuclear clock that links the network at UHV.
  2. Mercury's regolith, vaporised by the Sun it orbits, becomes the swarm's reflectors; segments with multijunction cells, fibre lasers and nickel-63 cells feed the network from Mercury's orbit.
  3. A level 8 rocket reaches Proxima b; its flora, ices and regolith are worked by machines that only run there, and its life comes home through a BSL-4 facility.
  4. Exotic matter from a Casimir array, antihydrogen and the nuclear clock open the warp gate pair; an astrometer with a 4.24 light-year baseline maps the stellar neighbourhood, the key to UEV.

## Route

1. **The breeding loop** (lines 1 and 2):
   - UV's uranium-233 becomes HFIR driver elements in IV's fuel fabrication plant;
   - UV's stored heavy curium oxide and ZPM's americium-243 become targets → the high-flux isotope reactor (1) → the transuranium processing facility (2) → **berkelium-249** (stored for UEV) and **californium-252** (neutron sources);
   - nickel-62 from IV's hot cell (a centrifuge row on nickel tetracarbonyl, as ZPM's silicon-28 row) is irradiated beside the targets → nickel-63.
2. **The nuclear clock** (lines 3 and 8):
   - the transuranium facility milks thorium-229 from UV's aged uranium-233;
   - the crystal growth furnace (4) grows Th:CaF₂ and VUV-grade CaF₂;
   - the nuclear clock lab (3) locks a VUV comb to the thorium-229 isomer → `grindless:nuclear_clock`, **the UHV link** of the wireless network.
3. **Photonics and power devices** (lines 5, 6, 7, 9, 10, 11):
   - lithium niobate on insulator, phase-change memory and Eu:YSO quantum memory in the photonic foundry (6), on ultrapure water (10);
   - quantum cascade lasers from the MBE reactor (5) on InP;
   - SiC power modules from the SiC device fab (7).
4. **Circuits** (lines 12, 13, 14): the organoid array (11) makes UHV circuits (GTM's wetware mainframe) in batches from UV's neural culture vat; Proxima's chitosan and radioprotectants improve its medium.
5. **Mercury, the seventh station** (substage `uhv-mercury`):
   - the regolith excavator (drill step 12) and the solar vapour furnace on `gcyr:mercury` (lines 19, 20);
   - in `gcyr:mercury_orbit`: the swarm segment foundry, the swarm control station (Kardashev II, a generator) and the solar probe bay (lines 21, 22, 23, 30).
6. **Level 8 rocket:** UV's thruster works builds the ICAN motor (`grindless:ican_rocket_motor`, GCYR motor tier 6) with a UHTC nozzle from the spark plasma sinterer (16) and UV's ICAN pellets. With UV's tier 11 BNNT tank: floor((6 + 11) / 2) = 8 *(S0-2: GCYR 0.2.9's KubeJS motor builder makes a fuel tank, so the motor is a startup `createCustom` `RocketMotorBlock` with its own motor type, tier 6; proven to Proxima b orbit in run 20261027-130053)*.
7. **Proxima Centauri b** (substage `uhv-proxima`):
   - the eighth station in a new orbit dimension: the baseline astrometer (observatory step 9) and the gate's far end;
   - on the surface: the rover bay, the xenobotany greenhouse (greenhouse step 8), the xenobiochemistry plant, the cold-trap drill (drill step 13), the radiotrophic vat and the biomining heap (lines 13 to 18, 32);
   - samples go home through the sample receiving facility (12).
8. **The space elevator** (line 24): PBO (14) and the tether ribbon works (15) braid ZPM's nanotube yarn, UV's BNNT yarn and PBO into the ribbon; GTCA's elevator gets our recipes. GTCA 2.2.0's assembler modules don't form with buses or hatches and the elevator never feeds them *(S0-8)*, so they stay hidden with the miner and pump modules (UEV).
9. **The warp gate pair** (lines 27, 28): exotic matter (Casimir array, 17), antihydrogen (positron accumulator, 13, and UV's trap), the nuclear clock and the Proxima approach data → the warp gate (18), built in Earth orbit and again in Proxima b's orbit: the AE2 bridge to Proxima and a transit for players.
10. **The gate to UEV:** the stellar neighbourhood chart from the astrometer, with the swarm carrying a 33.5 M EU/t load.

## Inherited as built

- **From UV (v0.10.0):**
  - the Mk3 and its audit (`tables/fusion_mk3.json`); neutronium only from the Mk3; the gravi star;
  - the pyroprocessing cell and the accelerator-driven reactor (`uv/thorium.js`): uranium-233, stored and live;
  - the heat source works: **heavy curium oxide, stored for UHV** (`uv.md:833-842`);
  - the synchrotron (X-ray lithography, antiprotons) and the antimatter trap in Earth orbit (`uv/accelerators.js:72`, `:95`): antiproton cartridges, ICAN pellets;
  - the superfluid helium plant, the SRF cavity works, the muon fusion cell, the laser fusion chamber;
  - the fibre draw tower (Yb fibre), the MOCVD reactor (InGaAs, NbN), the zone refining tower (HPGe) (`uv/photonics.js`, `uv/detectors.js`);
  - the boron nitride reactor (BNNT yarn), the powder-in-tube line, the powder bed printer, the cryotank winder (tier 11 tank), the thruster works (`uv/materials.js`);
  - the ark biosphere and the neural culture vat (`uv/life.js`);
  - the light sail fab (sail film), the laser sail launcher, the starchip fab, the optical ground station (`uv/starshot.js`);
  - Neptune's two and Pluto's six station machines.
- **Data and samples UV leaves:** the Proxima approach data, the heliopause data, the Sgr A* image.
- **Travel:**
  - level 7 rockets (elite motor + tier 11 BNNT tank);
  - six stations (`tables/stations.json`: Earth orbit, Io orbit and four `more` rows);
  - Proxima b as a GCYR planet, tier 8, with no orbit dimension (`docs/research/uv-s0.md`).
- **Power:** the wireless network at UV (`tables/wireless_energy.json`, tier 8, link gravi star, `grindless:uv_smes_cell`); hatches capped at their rated amperage per window; the two-hatch rule.
- **From ZPM and older, still running:** the partitioning plant (americium-243), the waste retrieval plant (synroc), the ion implanter, the diamond lattice fab, the isotope column, the pyrolyser (`grindless:carbon_nanotube_yarn`), the tholin reformer, the europium reductor, the magnet works; LuV's organoid lab, biofoundry, algae bioreactor, Io's germanium and indium, the cryobot; IV's fuel fabrication plant, heavy-water plant, fluorspar kiln, hot cell, Mercury's solar field, drill and heat-shield casing (`docs/eras/iv.md:36-50`); EV's platinum plant, extraction cascade, cryogenic plant, regolith cell and Mars lithium; HV's syngas plant and composite autoclave; MV's gallium and biorefinery.

## Places and site rules

| Place | Dimension id | GCYR tier | Reached by | Role in UHV |
|---|---|---|---|---|
| Earth | `minecraft:overworld` | — | — | 16 of the 31 machines |
| Earth orbit | as built | 1 | — | Casimir array, warp gate (first end), ZBLAN draw tower; UV's antimatter trap takes the antihydrogen row |
| Mercury | `gcyr:mercury` | 3 | level 3 (IV) | regolith excavator, solar vapour furnace |
| Mercury orbit | `gcyr:mercury_orbit` (`tables/orbits.json:8`) | 3 | level 3 | the seventh station: segment foundry, swarm control station, solar probe bay |
| Proxima b orbit | `grindless:proxima_b_orbit` (new) *(S0-3)* | 8 | level 8 rocket | the eighth station: baseline astrometer, warp gate (second end) |
| Proxima Centauri b | `gcyr:proxima_centauri_b` (as built) | 8 | level 8 rocket | six surface machines |
| The Sun's corona, the stellar neighbourhood | none | — | probes, the astrometer | targets, never places |

- **The Proxima b orbit:** GCYR's planet file has no orbit (`docs/research/uv-s0.md`). B1 adds `data/grindless/dimension/proxima_b_orbit.json` and points the planet at it through a datapack override of GCYR's planet entry *(S0-3)*. `gcyr:proxima_centauri_b` keeps its id; only an orbit is added. If the override fails, both station machines go on the surface (fallback in S0-3).
- **Site rules:**
  - each station and surface machine's controller accepts only its dimension (`G.dimensionLock`, the ZPM pattern);
  - Mercury surface: vacuum, no combustion, day-side heat (IV's rules, `docs/eras/iv.md:40-42`); the furnace runs only in daylight, like IV's solar field;
  - Proxima b: assumed no breathable air until S0-9 prints GCYR's figures: no combustion; the greenhouse and the vat are sealed; the planet is tidally locked, so the cold-trap drill works the night side and the greenhouse the terminator;
  - Earth orbit for the Casimir array (vibration-free, cold), the ZBLAN tower (microgravity suppresses crystallisation, as Flawless Photonics showed on the ISS in 2024) and the gate (no atmosphere to tear);
  - everything else at home; Proxima life only enters Earth through the sample receiving facility.
- **Why Mercury:** the swarm's mass is aluminium, magnesium and silicon, and Mercury's surface gives them under 6.7 suns with no gravity well worth the name (proposals by Armstrong and Sandberg, 2013). The segments are built in Mercury's orbit, where their sunlight is highest.
- **Mercury and Proxima are parallel substages:** both follow `uhv` home; neither needs the other. The gate and the UEV gate need both.

## Sunlight

| Place | Distance | Sunlight vs Earth orbit | Rows in `tables/sunlight.json` |
|---|---|---|---|
| Mercury orbit | 0.387 AU | 667 % | one row: the swarm's segments are rated here |
| Mercury | 0.387 AU | 667 % by day (IV's row) | unchanged |
| Proxima b orbit | 0.049 AU from Proxima | 65 %, mostly near-infrared | one row |
| Proxima Centauri b | as above | 65 % on the day side, 0 on the night side | one row (day side) |

- The swarm control station is a generator with its own figure, not a solar panel: the row only rates the segment's recipe *(tune)*.
- On Proxima b, EV's lunar solar field (`gtceu:lunar_solar_array`) takes a Proxima row at 65 % with arrays tuned to the red (*Older machines*), and the base draws the rest from the wireless network.
- Proxima's flares (UV-class, several a day) are why the base needs melanin shielding (line 15) and why the radiotrophic vat works there.

## Bridges and first arrivals

- **AE2 pairs:**
  - a Mercury orbit seed in ZPM's pattern (`tables/planets.json`, the existing `mercury` pair tag, `planets.json:14`); its catalyst is the first swarm segment;
  - a Proxima b seed made only by the warp gate (18): the gate is the bridge. Its catalyst is the first Proxima flora sample.
- **Station kits:**
  - the seventh slot (Mercury orbit) and the eighth (Proxima b orbit) come from `tables/stations.json` `more` rows (B1), proven for four in UV;
  - the kits need a UHV hull, so UHV opens before both.
- **First arrival:** nothing is gathered by hand. The first rover run, the first cold-trap core and the first excavator pass use the kit's starter charge: one rover, one drill head, one excavator bucket. Mercury's surface is already a place (IV): the first visit there was IV's.

## Automatic resource generation

| Resource | Machine | Place | Catalyst (not consumed) |
|---|---|---|---|
| Mercury regolith (graphite-, sulfur-rich, low FeO, as MESSENGER found) | regolith excavator (20) | Mercury | IV's iridosmine sample |
| Na–K, magnesium, silicon monoxide, iron, alumina–calcia | solar vapour furnace (21) | Mercury | — (sunlight; the crucible wears) |
| Coronal field map | solar probe bay (24) | Mercury orbit | the heliopause data (UV) |
| Proxima flora samples, regolith survey | xenoflora rover bay (26) | Proxima b | the Proxima approach data |
| Night-side ice core, cold-trap regolith | cold-trap drill (29) | Proxima b | the regolith survey |
| Xeno biomass, mushrooms, far-red pigments | xenobotany greenhouse (27) | Proxima b | a characterised strain |
| Melanised biomass | radiotrophic vat (30) | Proxima b | Proxima's flares (the dimension) |
| PGM and REE leach liquors, biocement | biomining heap (31) | Proxima b | a lithotroph culture |
| Stellar neighbourhood chart | baseline astrometer (25) | Proxima b orbit | the Sgr A* image (UV; the reference frame) |
| Berkelium-249, californium-252, nickel-63, thorium-229 | HFIR (1) and transuranium facility (2) | Earth | — |

Every item above is a recipe output. Nothing is mined by hand, and nothing comes from nothing: each run pays EU, a worn part, a spent probe or a fuel.

## Only from there, and cuts

| Only from | What |
|---|---|
| Mercury | the regolith fractions (Na–K, Mercury magnesium, silicon monoxide, the alumina–calcia residue that gives the swarm's aluminium) |
| Mercury orbit | swarm segments in service, the coronal field map |
| Proxima b orbit | the stellar neighbourhood chart |
| Proxima Centauri b | xeno biomass, xeno mushrooms, far-red pigment, radioprotective protein, melanised biomass, the night-side ice core, Proxima leach liquors, biocemented regolith |
| Earth orbit | exotic matter, ZBLAN fibre, antihydrogen (UV's trap) |
| The HFIR and the transuranium facility | berkelium-249, californium-252, nickel-63, thorium-229 |
| The nuclear clock lab | the nuclear clock |

- **Cuts on Earth:** none new. GTM's californium (the Mk2's plutonium + beryllium row) stays as it is; only the isotopes Cf-252 and Bk-249 are claimed here.
- **Oganesson:** stays voidable in the Mk3 audit; UHV adds its first use (line 30) and its policy becomes **kept** where the cryogenic plant's row runs.
- **GCYR's Dyson swarm items** (`gcyr:dyson_swarm_satellite`, `gcyr:drone_hangar`) stay hidden: our swarm is our machines. `gcyr:dyson_system_controller` (S0-1) and the other `gcyr:dyson_*` blocks stay hidden.
- **GT--'s optical circuits:** `gtnn:optical_processor` and `gtnn:optical_assembly` get our recipes in the photonic foundry and unhide at `uhv`; the computer and mainframe stay hidden (UEV and up) *(S0-1 prints the ids)*.

## Our multiblocks

| Place | Count | Machines |
|---|---|---|
| Earth | 16 | 1–16 |
| Earth orbit | 3 | 17 Casimir array, 18 warp gate, 19 ZBLAN draw tower |
| Mercury | 2 | 20 regolith excavator, 21 solar vapour furnace |
| Mercury orbit | 3 | 22–24 |
| Proxima b orbit | 1 | 25 baseline astrometer |
| Proxima Centauri b | 6 | 26–31 |
| **Total** | **31** | UV 31 → UHV 31 |

**Not counted (rule 7):**
- the warp gate's second end (one machine, built twice);
- GTCA's space elevator and its modules (GTCA's machines, our recipes);
- the wireless tier and its hatches, the UHV cell;
- older machines' new modes, the level 8 rocket;
- GTM's Mk3 and its parallel hatches.

### Audit: the route only each one gives, its recipe keys, its output policy

The policies are UV's (`docs/eras/uv.md:221`): **kept**, **contained**, **voidable** and **generator**.

| # | Machine | Route only it gives (rules 4 and 7) | Keys | Policy |
|---|---|---|---|---|
| 1 | High flux reactor | transcurium targets irradiated to berkelium and californium; nickel-63 | c1–c3 | contained |
| 2 | Transuranium facility | Bk/Cf/Cm separated; thorium-229 milked from aged U-233 | c1–c3 | contained + kept |
| 3 | Nuclear clock lab | the thorium-229 nuclear clock | c1, c2 | kept (xenon) |
| 4 | Crystal growth furnace | oxide and fluoride crystals GTM cannot grow (LiNbO₃, CaF₂, Eu:YSO) and InP | c1–c5 | kept (iridium crucible) |
| 5 | MBE reactor | quantum cascade lasers | c1, c2 | contained (arsenic) |
| 6 | Photonic foundry | LNOI, phase-change memory, quantum memory, GT--'s optical circuits | c1–c6 | kept (fluoride loop) |
| 7 | SiC device fab | SiC boules, power modules, mirror blanks | c1–c5 | kept |
| 8 | Solar array fab | inverted metamorphic multijunction arrays | c1–c3 | kept (GaAs substrate) |
| 9 | Betavoltaic fab | nickel-63 cells on diamond diodes | c1, c2 | contained |
| 10 | Ultrapure water plant | 18 MΩ·cm water | c1 | voidable (RO concentrate) |
| 11 | Organoid array | organoid processors; UHV circuits in batches | c1, c2 | kept |
| 12 | Sample receiving facility | the only door for Proxima life to Earth | c1–c3 | contained |
| 13 | Positron accumulator | trapped positrons | c1, c2 | contained (activated target) |
| 14 | PBO plant | PBO fibre (Zylon) | c1–c4 | kept (phosphoric acid loop) |
| 15 | Tether ribbon works | the elevator ribbon and climber | c1, c2 | kept |
| 16 | Spark plasma sinterer | ZrB₂–SiC and TaC ultra-high-temperature ceramics | c1–c3 | kept |
| 17 | Casimir array | exotic matter (fiction, stated) | c1, c2 | kept |
| 18 | Warp gate | the Proxima bridge and transit | c1, c2 | kept |
| 19 | ZBLAN draw tower | fluoride fibre drawn in microgravity | c1, c2 | kept |
| 20 | Regolith excavator | Mercury regolith in bulk | the family's | the drill family's |
| 21 | Solar vapour furnace | regolith fractions by vacuum vaporisation | c1, c2 | kept |
| 22 | Swarm segment foundry | swarm segments; refurbishment | c1, c2 | kept |
| 23 | Swarm control station | Kardashev II power | the segment count | generator + kept |
| 24 | Solar probe bay | the coronal field map | c1 + probe | voidable (the probe) |
| 25 | Baseline astrometer | the stellar neighbourhood chart | c1 | kept |
| 26 | Xenoflora rover bay | Proxima flora samples, regolith survey | c1 + rover | kept |
| 27 | Xenobotany greenhouse | xeno biomass, mushrooms, far-red pigment | c1–c3 | kept |
| 28 | Xenobiochemistry plant | radioprotectant, IR pigment, chitosan | c1–c3 | kept |
| 29 | Cold-trap drill | the night-side ice core | the family's | the drill family's |
| 30 | Radiotrophic vat | melanised biomass | c1 | kept |
| 31 | Biomining heap | PGM and REE liquors; biocement | c1–c3 | kept |
| — | Older machines' UHV modes | *Older machines, new modes* | c5 and up | as listed |

Every recipe has a programmed circuit or an input no other recipe of its type shares. Every new type goes through `gg_test_recipe_lookup`. The figures marked *(tune)* are placeholders that the owning package fixes against the S0-1 dump.

Voltages: VA[UHV] = 1,966,080 EU/t, VA[UV] = 491,520 EU/t.

Controllers: GTM 7.5.3 registers a UHV hull and UHV hatches but, with `highTierContent` off, no UHV robot arm, sensor or field generator. Every UHV controller therefore takes a UHV hull + two UV components + two UHV circuits (GTM's wetware mainframe) *(tune; S0-1: none exist, and there is no UHV parallel hatch)*. No controller takes a UEV item.

### 1. High flux reactor: `gtceu:high_flux_reactor`, type `gtceu:high_flux_irradiation` (Earth)

- **What it gains:**
  - UV stored heavy curium oxide for UHV (`docs/eras/uv.md:833`) and GTM has no route past curium;
  - a flux trap at 2.5 × 10¹⁵ n/cm²·s takes curium and americium-243 through successive captures to berkelium-249 and californium-252, as ORNL's HFIR has since 1965;
  - the same flux turns nickel-62 into nickel-63.
- **Recipes:**
  - c1 transcurium cycle: 1 transcurium target (`grindless:transcurium_target`: heavy curium oxide + americium-243 oxide in aluminium cermet) + 6 HFIR driver elements (UV's uranium-233, IV's fuel fabrication plant, *Older machines*) → 1 irradiated transcurium target + 6 spent driver elements, VA[UHV] × 2,400 t *(tune)*;
  - c2 nickel target: 4 nickel-62 targets (IV's hot cell) + the driver load → 4 nickel-63 targets + spent drivers;
  - c3 source: 1 californium-252 charge (from 2) → 1 sealed `grindless:californium_252_source`.
- **Byproducts:**
  - spent driver elements → UV's pyroprocessing cell, its uranium-233 row *(contained)*;
  - activated aluminium cladding → ZPM's waste retrieval plant *(contained)*;
  - heat is a cost, not a product: the reactor is not a generator (its 85 MW in reality are rejected; GTM's fission generators already exist).
- **Structure:** 9×9×11: a light-water pool around a flux-trap core, beryllium reflector casing (EV), hot-cell casing for the target hoist.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** IV fuel fabrication plant (drivers), IV hot cell (Ni-62); ZPM partitioning plant (Am-243), ZPM waste retrieval plant.
- **Risks:** berkelium and californium isotopes are not GTM materials: S0-1 checks; F1 registers `grindless:berkelium_249` and `grindless:californium_252` as items if needed (GTM's `californium` element stays as it is).
- **Source:** real: HFIR and its transcurium campaigns (ORNL); the Bk-249 shipped for tennessine (2009).

### 2. Transuranium facility: `gtceu:transuranium_facility`, type `gtceu:transuranium_processing` (Earth)

- **What it gains:**
  - irradiated targets have no GTM chemistry;
  - the facility dissolves them and separates curium, berkelium and californium by HDEHP extraction and cation exchange, ORNL's REDC route;
  - it also milks thorium-229 from UV's aged uranium-233, the only source of the nuclear clock's isotope.
- **Recipes:**
  - c1 dissolve: 1 irradiated transcurium target + 1,000 mB nitric acid → 1,000 mB transcurium liquor + 250 mB fission product liquor;
  - c2 separate: 1,000 mB transcurium liquor + 100 mB HDEHP solvent (line 25; not consumed but worn 1 %) → 1 berkelium-249 (stored, *Reserve*) + 2 californium-252 charges + 1 heavy curium oxide back (into the next target) *(tune)*;
  - c3 milk: 8 uranium-233 (UV's pyroprocessing cell), held in the facility's decay store (a long run, VA[UV] × 24,000 t *(tune)*, stands for the years of ingrowth) and stripped by ion exchange → 1 thorium-229 + 8 uranium-233 back.
- **Byproducts:**
  - fission product liquor → ZPM's waste retrieval plant as synroc *(contained)*;
  - spent HDEHP → incinerated in the facility, phosphoric acid back *(kept)*;
  - nitric acid → recovered by evaporation *(kept)*.
- **Structure:** 9×7×9 hot cell casing (IV's) with a shielded cave, glovebox train and ion-exchange columns.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** ZPM partitioning plant (the same extraction family, one tier on), ZPM waste retrieval plant; IV hot cell; HV syngas plant (the solvent's oxo syngas, line 25).
- **Risks:** c3's long time is ingrowth, not inflated difficulty (rule 2): it runs once per clock and in parallel with everything else.
- **Source:** real: REDC (ORNL); the thorium-229 stock milked from U-233 at ORNL and Karlsruhe.

### 3. Nuclear clock lab: `gtceu:nuclear_clock_lab`, type `gtceu:nuclear_clock` (Earth)

- **What it gains:**
  - the thorium-229 isomer at 8.4 eV is the only nuclear transition a laser can reach;
  - in 2024, JILA locked a VUV frequency comb to it in Th:CaF₂, the first nuclear clock;
  - its product is the UHV link of the wireless network (*Power*) and the warp gate's timebase.
- **Recipes:**
  - c1 comb: 1 ytterbium fibre laser module (UV's fibre draw tower) + 1,000 mB xenon (IV's hot cell; high harmonic generation) + 2 VUV CaF₂ optics (4) → 1 `grindless:vuv_frequency_comb`;
  - c2 clock: 1 Th:CaF₂ crystal (4) + 1 VUV frequency comb + 1 UHV circuit → 1 `grindless:nuclear_clock`.
- **Byproducts:** xenon → back to the network *(kept)*.
- **Structure:** 7×5×9 vibration-isolated clean room casing (ZPM's) around a vacuum chamber.
- **Controller:** UHV hull + 2 UV sensors + 2 UHV circuits *(tune)*.
- **Crossings:** IV hot cell (xenon), UV fibre draw tower.
- **Source:** real: Zhang et al. (JILA, 2024), Tiedau et al. (Vienna, 2024).

### 4. Crystal growth furnace: `gtceu:crystal_growth_furnace`, type `gtceu:crystal_growth` (Earth)

- **What it gains:**
  - GTM grows silicon boules only; it has no route for oxide or fluoride single crystals, nor for indium phosphide;
  - Czochralski in an iridium crucible (LiNbO₃, Eu:YSO), vertical gradient freeze (CaF₂ and Th:CaF₂) and liquid-encapsulated Czochralski (InP) in one furnace;
  - EV dropped a crystal puller (`docs/eras/ev.md:445`) because GTM's boules were enough for silicon; here there is no GTM route at all.
- **Recipes:**
  - c1 LiNbO₃: lithium carbonate (EV's Mars lithium) + niobium oxide → 1 LiNbO₃ boule;
  - c2 VUV CaF₂: fluorite (IV's fluorspar kiln) + lead fluoride scavenger → 1 VUV CaF₂ boule (cut to optics in GTM's cutter);
  - c3 Th:CaF₂: as c2 + 1 thorium-229 (2) → 1 Th:CaF₂ crystal;
  - c4 Eu:YSO: yttrium oxide (EV's extraction cascade) + silica + europium oxide (ZPM's europium reductor) → 1 Eu:YSO boule;
  - c5 InP: indium (LuV, Io) + red phosphorus under a boron oxide cap → 1 InP boule.
- **Byproducts:**
  - iridium crucible (a catalyst, worn 1 in 32 runs) → EV's platinum plant *(kept)*;
  - lead fluoride → back to c2 *(kept)*; boron oxide → back to c5 *(kept)*.
- **Structure:** 5×5×9 induction furnace casing with an iridium hearth and an argon atmosphere.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** EV Mars lithium, EV extraction cascade (Y), IV fluorspar kiln, EV platinum plant (Ir), ZPM europium reductor, LuV Io indium.
- **Risks:** niobium oxide, lead fluoride and InP may not be GTM materials *(S0-1)*.
- **Source:** real: Czochralski LiNbO₃ (Crystal Technology), Bridgman CaF₂ for 193 nm lithography.

### 5. MBE reactor: `gtceu:mbe_reactor`, type `gtceu:molecular_beam_epitaxy` (Earth)

- **What it gains:** a quantum cascade laser is hundreds of InGaAs/AlInAs layers a few atoms thick on InP; MOCVD (UV) cannot grow them sharp enough; molecular beam epitaxy in ultra-high vacuum can. QCLs are the mid-infrared sources the astrometer's nuller and the swarm's thermal sensors need.
- **Recipes:**
  - c1 superlattice: 1 InP wafer (4, cut) + indium, gallium (MV), aluminium, arsenic → 1 QCL superlattice wafer, VA[UHV] × 1,600 t *(tune)*;
  - c2 laser: 1 QCL superlattice wafer + gold → 8 `grindless:quantum_cascade_laser`.
- **Byproducts:** arsenic deposits on the cryoshrouds → scraped and stored *(contained)*, as UV's MOCVD.
- **Structure:** 5×5×7 UHV chamber casing (UV's) with effusion cells and a cryoshroud.
- **Controller:** UHV hull + 2 UV sensors + 2 UHV circuits *(tune)*.
- **Crossings:** LuV Io indium, MV gallium.
- **Source:** real: Faist et al. (Bell Labs, 1994).

### 6. Photonic foundry: `gtceu:photonic_foundry`, type `gtceu:photonic_foundry` (Earth)

- **What it gains:**
  - thin-film lithium niobate on insulator (LNOI) is the fastest electro-optic platform; phase-change GST gives non-volatile photonic weights; Eu:YSO stores light for hours;
  - with them the foundry makes GT--'s optical processor and optical assembly, which GT-- registers and the pack hides (`hidden_until.json`, `never` rows 380-393; F2 moves two of them to `uhv`).
- **Recipes:**
  - c1 LNOI: 1 LiNbO₃ wafer + helium-4 implant (ZPM's ion implanter, *Older machines*) + 1 oxidised silicon wafer → 1 LNOI wafer (smart-cut; the rest of the LN wafer back as a thinner wafer, twice);
  - c2 GST: germanium (LuV, Io) + antimony + tellurium → 1 GST target, sputtered onto c1 → 1 PCM photonic die;
  - c3 quantum memory: 1 Eu:YSO boule → 4 `grindless:quantum_memory_chip`;
  - c4 optical processor: LNOI + PCM dies + QCL + UHV circuit → `gtnn:optical_processor` *(S0-1)*;
  - c5 optical assembly: optical processors + quantum memory chips → `gtnn:optical_assembly` *(S0-1)*;
  - c6 modulators: LNOI → 16 `grindless:thin_film_ln_modulator` (warp gate, astrometer).
  All take 1,000 mB ultrapure water (10).
- **Byproducts:** hydrofluoric etch → calcium fluoride → IV's fluorspar kiln *(kept)*; implanted LN offcuts → back to c1 *(kept)*.
- **Structure:** 9×5×9 clean room casing (ZPM's) with a wafer bonder and sputter chamber.
- **Controller:** UHV hull + 2 UV emitters + 2 UHV circuits *(tune)*.
- **Crossings:** ZPM ion implanter, LuV Io germanium, IV fluorspar kiln.
- **Risks:** if GT--'s ids differ, c4 and c5 make grindless items and the gtnn items stay hidden *(S0-1)*.
- **Source:** real: HyperLight/Harvard LNOI, IBM PCM photonic tensor cores, ANU Eu:YSO six-hour memory (2015).

### 7. SiC device fab: `gtceu:sic_device_fab`, type `gtceu:silicon_carbide` (Earth)

- **What it gains:** silicon carbide switches kilovolts at 200 °C; the swarm's power conditioning and the gate's pulsed drivers need it. GTM has a silicon carbide material (*S0-1*) but no single crystal or device.
- **Recipes:**
  - c1 boule: SiC powder → 1 SiC boule by physical vapour transport at 2,500 °C;
  - c2 epi: SiC wafer + silane + propane + hydrogen → 1 SiC epi wafer;
  - c3 implant: + aluminium implant (ZPM's ion implanter) + 1,700 °C anneal → 1 SiC device wafer;
  - c4 module: device wafer + copper + silver sinter → 4 `grindless:sic_power_module`;
  - c5 mirror: SiC powder (reaction-bonded) → 1 `grindless:sic_mirror_blank` (the astrometer).
- **Byproducts:** HCl and hydrogen → the network *(kept)*.
- **Structure:** 7×5×7 furnace casing with an epi chamber.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** ZPM ion implanter.
- **Source:** real: Cree/Wolfspeed PVT, Herschel's SiC mirror.

### 8. Solar array fab: `gtceu:solar_array_fab`, type `gtceu:space_photovoltaics` (Earth)

- **What it gains:** inverted metamorphic multijunction cells (GaInP/GaAs/InGaAs, 33 % at AM0) grown upside down, lifted off and bonded; the substrate is reused. They are the swarm's cells and, tuned to the red, Proxima's.
- **Recipes:**
  - c1 lift-off: 1 IMM epi wafer (UV's MOCVD, *Older machines*) + hydrofluoric acid → 1 IMM film + 1 GaAs substrate back (worn 1 in 8);
  - c2 array: 4 IMM films + cerium-doped coverglass + SiC power module → 1 `grindless:imm_solar_array`;
  - c3 red array: as c2 with a red-tuned film (InGaAs-rich) → 1 `grindless:red_tuned_solar_array` (EV's lunar solar field on Proxima b).
- **Byproducts:** worn GaAs substrate → gallium and arsenic recovered *(kept; arsenic contained)*.
- **Structure:** 7×5×7 clean room casing with a lamination press.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** MV gallium, LuV Io indium.
- **Source:** real: NREL IMM cells, Rocket Lab/SolAero arrays.

### 9. Betavoltaic fab: `gtceu:betavoltaic_fab`, type `gtceu:betavoltaic` (Earth)

- **What it gains:** nickel-63 (half-life 100 years) on diamond p–i–n diodes gives microwatts for a century; segments, rovers and probes keep their electronics alive through eclipses and nights without a battery.
- **Recipes:**
  - c1 plate: 4 nickel-63 targets (1) + nitric acid → nickel-63 plating liquor;
  - c2 cell: plating liquor + 8 diamond diodes (ZPM's diamond lattice fab, *Older machines*) → 8 `grindless:betavoltaic_cell`.
- **Byproducts:** depleted plating liquor → back to c1 (nickel-62 leftover → IV's hot cell) *(contained)*.
- **Structure:** 5×5×5 glovebox casing with a plating bath.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** ZPM diamond lattice fab, IV hot cell (nickel-62).
- **Source:** real: City Labs NanoTritium, Betavolt BV100 (Ni-63 on diamond, 2024).

### 10. Ultrapure water plant: `gtceu:ultrapure_water_plant`, type `gtceu:ultrapure_water` (Earth)

- **What it gains:** 18.2 MΩ·cm water with parts-per-trillion metals; GTM's distilled water is not it. UHV's wafer, crystal and organoid steps take it.
- **Recipes:** c1: 8,000 mB water → reverse osmosis → electrodeionisation → 185 nm UV and ozone (organics) → membrane degassing → ultrafiltration → 6,000 mB `gtceu:ultrapure_water`.
- **Byproducts:** 2,000 mB RO concentrate → voidable (salt water) *(voidable)*; spent resin → regenerated with HCl and NaOH *(kept)*.
- **Structure:** 9×5×5 water treatment casing (MV's) with membrane racks.
- **Controller:** UHV hull + 2 UV pumps + 2 UHV circuits *(tune)*.
- **Crossings:** none two eras back (HCl and NaOH are network chemicals).
- **Source:** real: SEMI F63 fab waterlines; GT Leisure's and GTNH's water purification tiers inspired the line (ideas only).

### 11. Organoid array: `gtceu:organoid_array`, type `gtceu:organoid_computing` (Earth)

- **What it gains:**
  - UV's neural culture vat makes stem cells and neuro processing units; the array grows them into cortical organoids on microelectrode arrays (Cortical Labs' CL1, FinalSpark's Neuroplatform, 2024–2025);
  - an organoid processor is the warp gate's and the astrometer's adaptive controller;
  - it makes GTM's UHV circuit (the wetware mainframe) four at a time from organoid processors, a route GTM's assembly line does not have.
- **Recipes:**
  - c1 organoid: 4 stem cells (UV's vat) + 1 chitosan scaffold (28) + 1,000 mB ultrapure water + 1,000 mB sterilised growth medium → 1 `grindless:organoid_processor`, VA[UHV] × 1,200 t *(tune)*;
  - c2 mainframe: 4 organoid processors + 4 neuro processing units + SiC power module + optical assembly → 4 wetware mainframes *(tune)*.
- **Byproducts:** spent medium → LuV's biofoundry as feed *(kept)*.
- **Structure:** 7×5×7 sterile casing (LuV's) with perfusion racks.
- **Controller:** UHV hull + 2 UV sensors + 2 UHV circuits *(tune)*. The first array needs the UHV circuits GTM's assembly line makes.
- **Crossings:** LuV organoid lab (its medium), LuV biofoundry.
- **Source:** real: Cortical Labs CL1, FinalSpark.

### 12. Sample receiving facility: `gtceu:sample_receiving_facility`, type `gtceu:sample_receiving` (Earth)

- **What it gains:** Proxima b's life comes to Earth only through a BSL-4 facility with a planetary-protection protocol, the one NASA and ESA designed for Mars Sample Return. It characterises what the rover brings and releases strains, genes and sterilised extracts.
- **Recipes:**
  - c1 receive: 1 Proxima flora sample + 1,000 mB hydrogen peroxide vapour → 1 sterilised flora extract + 1 `grindless:xeno_genome_data`;
  - c2 isolate: 1 Proxima flora sample → 1 `grindless:characterised_xeno_strain` (the greenhouse's catalyst; one sample, many crops);
  - c3 extremophile: 1 night-side ice core → 1 sterilised ice organics extract.
- **Byproducts:** autoclaved waste → incinerated in the facility *(contained)*.
- **Structure:** 9×5×9 BSL-4 casing (new, F1) with an airlock train.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** LuV biofoundry (the genome data).
- **Risks:** built on Earth but needs Proxima samples: wave B.
- **Source:** real: the MSR Sample Receiving Facility study (NASA/ESA).

### 13. Positron accumulator: `gtceu:positron_accumulator`, type `gtceu:positron_accumulation` (Earth)

- **What it gains:** antihydrogen needs positrons; UV has antiprotons. Sodium-22 emits positrons, a solid neon moderator slows them, and a Surko buffer-gas trap stacks them by the billion, as CERN's ALPHA does.
- **Recipes:**
  - c1 source: 1 sodium-22 target (UV's synchrotron, *Older machines*) + 1,000 mB neon (EV's cryogenic plant) → 1 moderated positron source (decays: worn 1 in 16 runs);
  - c2 accumulate: the source (catalyst) + 100 mB nitrogen buffer gas + an empty Penning trap → 1 `grindless:positron_cartridge`.
- **Byproducts:** spent sodium-22 → ZPM's waste retrieval plant *(contained)*; neon and nitrogen → back *(kept)*.
- **Structure:** 9×3×5 beamline casing (UV's) with a solenoid.
- **Controller:** UHV hull + 2 UV electric pumps + 2 UHV circuits *(tune)*.
- **Crossings:** EV cryogenic plant (neon), ZPM waste retrieval plant.
- **Source:** real: ALPHA and AEgIS positron accumulators (CERN), Surko traps.

### 14. PBO plant: `gtceu:pbo_plant`, type `gtceu:pbo_synthesis` (Earth)

- **What it gains:** poly(p-phenylene benzobisoxazole) (Zylon) is twice Kevlar's strength; the ribbon needs it to bind nanotube and nitride yarns. Its monomer, 4,6-diaminoresorcinol, is a four-step synthesis.
- **Recipes:**
  - c1 nitrate: 1,2,3-trichlorobenzene (from benzene and chlorine, network) + nitric and sulfuric acid → 4,6-dinitro-1,2,3-trichlorobenzene;
  - c2 hydrolyse: + sodium hydroxide → 4,6-dinitroresorcinol (one chlorine stays on, removed in c3);
  - c3 reduce: + hydrogen on palladium → 4,6-diaminoresorcinol dihydrochloride;
  - c4 polymerise and spin: + terephthalic acid in polyphosphoric acid (phosphoric acid from EV's extraction cascade + phosphorus pentoxide) → PBO dope → dry-jet wet spinning → `grindless:pbo_fibre`.
- **Byproducts:** HCl, NaCl → the network *(kept)*; diluted phosphoric acid → back to c4 by evaporation *(kept)*; spent sulfuric acid → GTM's dilute route *(kept)*.
- **Structure:** 7×5×9 chemical plant casing with a spinneret tower.
- **Controller:** UHV hull + 2 UV pumps + 2 UHV circuits *(tune)*.
- **Crossings:** EV extraction cascade (phosphoric acid).
- **Source:** real: Dow/Toyobo PBO (Wolfe's DAR route).

### 15. Tether ribbon works: `gtceu:tether_ribbon_works`, type `gtceu:tether_ribbon` (Earth)

- **What it gains:** GTCA registers a space elevator and modules but no recipes reach them in this pack (`hidden_until.json` rows 50-77, `until: uhv`). The works braids the ribbon (nanotube yarn for strength, BNNT yarn for heat and radiation, PBO for the matrix) and builds the laser-powered climber.
- **Recipes:**
  - c1 ribbon: 8 carbon nanotube yarn (ZPM's pyrolyser) + 4 BNNT yarn (UV) + 4 PBO fibre → 1 `grindless:tether_ribbon_segment`;
  - c2 climber: InGaAs laser receiver (UV's MOCVD) + SiC power modules + betavoltaic cells → 1 `grindless:tether_climber`.
- **Byproducts:** trim → back to c1 *(kept)*.
- **Structure:** 11×5×5 braiding casing with a tension frame.
- **Controller:** UHV hull + 2 UV conveyors + 2 UHV circuits *(tune)*.
- **Crossings:** ZPM pyrolyser (nanotube yarn).
- **Source:** real: LiftPort and the ISEC elevator studies; the NASA Centennial Challenge laser-powered climbers.

### 16. Spark plasma sinterer: `gtceu:spark_plasma_sinterer`, type `gtceu:spark_plasma_sintering` (Earth)

- **What it gains:** ZrB₂–SiC and TaC survive 3,000 °C; pulsed current through a graphite die densifies them in minutes. They make the ICAN motor's nozzle (the level 8 rocket) and the solar probe's shield face. GTM has no hafnium (`docs/eras/iv.md:580`), so no HfC.
- **Recipes:**
  - c1 ZrB₂–SiC: zirconium dioxide + boron carbide + carbon (carbothermal) + SiC powder → 1 `grindless:uhtc_tile`;
  - c2 TaC: tantalum + carbon → 1 `grindless:tantalum_carbide_liner`;
  - c3 nozzle: 4 UHTC tiles + 1 TaC liner → 1 `grindless:uhtc_nozzle`.
- **Byproducts:** carbon monoxide → HV's syngas plant *(kept)*; graphite die wear → back as carbon *(kept)*.
- **Structure:** 5×5×7 press casing with water-cooled rams.
- **Controller:** UHV hull + 2 UV pistons + 2 UHV circuits *(tune)*.
- **Crossings:** HV syngas plant (CO back).
- **Risks:** zirconium dioxide may not be a GTM material *(S0-1)*.
- **Source:** real: NASA Ames UHTC (SHARP), SPS (Sumitomo).

### 17. Casimir array: `gtceu:casimir_array`, type `gtceu:casimir_cavity` (Earth orbit)

- **What it gains:** the gate needs negative energy density. The Casimir effect between plates nanometres apart is real (Lamoreaux, 1997); harvesting it as "exotic matter" is **fiction, stated in its EMI page** and named the era's weakest claim (*New process lines*). It runs in orbit because the stacks must be vibration-free and cold.
- **Recipes:**
  - c1 stack: NbN-coated SiC plates (UV's MOCVD on SiC mirror blanks, 7) + 1,000 mB helium II (UV's superfluid helium plant) → 1 `grindless:casimir_cavity_stack`;
  - c2 harvest: 16 cavity stacks (catalyst, worn 1 in 32 runs) + 1 nuclear clock (catalyst; phase lock) → 1 `grindless:exotic_matter_cell`, VA[UHV] × 2,000 t *(tune)*.
- **Byproducts:** helium → back to UV's plant *(kept)*; worn stacks → plates re-coated in c1 *(kept)*.
- **Structure:** 7×7×7 station casing (ZPM's) around a cryostat.
- **Controller:** UHV hull + 2 UV field generators + 2 UHV circuits *(tune)*.
- **Crossings:** none two eras back (UV's helium, our SiC).
- **Source:** Lamoreaux (1997) for the force; the exotic matter is fiction (Morris–Thorne wormhole requirement), as in Star Technology's gate (idea).

### 18. Warp gate: `gtceu:warp_gate`, type `gtceu:warp_gate` (Earth orbit and Proxima b orbit; built twice, counted once)

- **What it gains:** UV saw Proxima b through a gram-scale probe; a level 8 rocket takes a crew there once. The gate pair makes Proxima part of the network: the AE2 bridge for Proxima b and its orbit, and a transit for players while it runs. It is the era's showpiece and the only fiction in the route besides the exotic matter.
- **Recipes:**
  - c1 open: 4 exotic matter cells + 4 antihydrogen cartridges (UV's antimatter trap, *Older machines*) + the Proxima approach data (catalyst) + 1 nuclear clock (catalyst) + 1 organoid processor (catalyst) → 1 `grindless:proxima_gate_seed` (the AE2 pair for `proxima`), VA[UHV] × 1,200 t *(tune)*;
  - c2 sustain: 1 exotic matter cell → nothing (a 60 s window of transit), 16 A UHV × 1,200 t: the UEV gate's load (*Gate to UEV*).
- **Byproducts:** spent cartridges → back to UV's trap *(kept)*.
- **Structure:** 15×15×3 ring of gate casing (new, F1) with thin-film LN modulators (6) on its frame; the far end is the same structure in `grindless:proxima_b_orbit`.
- **Controller:** UHV hull + 2 UV field generators + 2 UHV circuits *(tune)*; the far controller needs the same, carried by the level 8 rocket.
- **Transit:** while c2 runs, a player standing in the ring is teleported to the paired ring's dimension at its centre (one server-side call, `gg_test_uhv_gate`); no items move this way, AE2 moves them.
- **Crossings:** none two eras back (UV's antimatter, our clock).
- **Risks:** teleporting players across dimensions from KubeJS: S0-7.
- **Source:** idea: Star Technology's stargate (MIT); the far end is built, never conjured.

### 19. ZBLAN draw tower: `gtceu:zblan_draw_tower`, type `gtceu:zblan_draw` (Earth orbit)

- **What it gains:** ZBLAN fluoride glass transmits from the UV to 7 µm with a hundredth of silica's loss, but crystallises when drawn under gravity. Flawless Photonics drew 12 km of it aboard the ISS in 2024. ZBLAN carries the astrometer's mid-infrared beams and the QCLs' light.
- **Recipes:**
  - c1 glass: zirconium tetrafluoride + barium fluoride + lanthanum fluoride (EV's extraction cascade) + aluminium fluoride + sodium fluoride (hydrogen fluoride from IV's fluorspar kiln) → 1 ZBLAN preform;
  - c2 draw: 1 ZBLAN preform → 8 `grindless:zblan_fibre`.
- **Byproducts:** HF off-gas → captured as calcium fluoride → IV's fluorspar kiln *(kept)*.
- **Structure:** 3×3×11 draw tower casing (UV's) in a station module.
- **Controller:** UHV hull + 2 UV motors + 2 UHV circuits *(tune)*.
- **Crossings:** IV fluorspar kiln (HF), EV extraction cascade (La).
- **Source:** real: Flawless Photonics on the ISS (2024); FOMS and Made In Space's earlier ZBLAN flights.

### 20. Regolith excavator: `gtceu:regolith_excavator`, type `gtceu:regolith_excavation` (Mercury; drill family step 12)

- **What it gains:** IV's Mercury drill works veins; the swarm needs bulk regolith by the thousand tonnes. Counter-rotating bucket drums (NASA's RASSOR) dig in vacuum with no net reaction force.
- **Recipes:** the drill family's: 1 bucket drum (worn) + IV's iridosmine sample (catalyst) → 64 `grindless:mercury_regolith` *(tune)*.
- **Byproducts:** none (the regolith is the product).
- **Structure:** the drill family's frame on IV's heat-shield casing (`docs/eras/iv.md:45`).
- **Controller:** UHV hull + 2 UV motors + 2 UHV circuits *(tune)*.
- **Crossings:** IV Mercury drill and heat-shield casing (the site).
- **Source:** real: RASSOR (NASA KSC Swamp Works); MESSENGER's regolith chemistry.

### 21. Solar vapour furnace: `gtceu:solar_vapour_furnace`, type `gtceu:solar_vaporisation` (Mercury, daylight only)

- **What it gains:** under 6.7 suns a concentrator vaporises regolith in vacuum, and its oxides boil off in order; the condenser plates catch each fraction at its own temperature. No reagent, no electrolysis: the Sun is the furnace.
- **Recipes:**
  - c1 low: 16 Mercury regolith at 1,400 K → sodium–potassium + sulfur + 12 partly stripped regolith;
  - c2 high: 12 stripped regolith at 2,300 K → magnesium + silicon monoxide + iron + 4 alumina–calcia residue + graphite.
- **Byproducts:**
  - alumina–calcia residue → aluminium through GTM's electrolyser (the swarm's reflector film) *(kept)*;
  - sulfur → the network *(kept)*; graphite → the network *(kept)*;
  - a regolith crucible lining (worn 1 in 16 runs) is sintered from the residue itself *(kept)*.
- **Structure:** 9×9×5 concentrator with condenser plates on heat-shield casing.
- **Controller:** UHV hull + 2 UV sensors + 2 UHV circuits *(tune)*.
- **Crossings:** IV Mercury site (daylight rule, casing).
- **Risks:** IV discarded solar smelting on Mercury (`docs/eras/iv.md:159`) because it would skip LuV's osmium; this furnace makes no osmium, iridium or any metal GTM gates by tier, only light-element fractions.
- **Source:** real: vacuum pyrolysis of regolith (Senior; Matchett, NASA); Mercury's composition from MESSENGER.

### 22. Swarm segment foundry: `gtceu:swarm_segment_foundry`, type `gtceu:swarm_segment` (Mercury orbit)

- **What it gains:** a swarm segment is a reflector, a power array and a laser link in one; built where it will fly, it never climbs out of a well.
- **Recipes:**
  - c1 segment: 4 aluminium reflector film (UV's light sail fab, *Older machines*) + 2 IMM solar arrays + 1 ytterbium fibre laser module (UV) + 1 C-12 diamond spreader (ZPM's diamond lattice fab) + 1 SiC power module + 2 betavoltaic cells + 1 sodium–potassium heat pipe → 1 `grindless:swarm_segment`;
  - c2 refurbish: 1 worn swarm segment + 1 aluminium reflector film + 1 IMM solar array → 1 swarm segment.
- **Byproducts:** stripped film → aluminium back *(kept)*.
- **Structure:** 9×7×9 station casing with an assembly gantry.
- **Controller:** UHV hull + 2 UV robot arms + 2 UHV circuits *(tune)*.
- **Crossings:** ZPM diamond lattice fab and isotope column (C-12 spreader, line 22).
- **Source:** real: Armstrong and Sandberg (2013) on Mercury-built swarms; idea: GTNH-Intergalactic's Dyson swarm (MIT).

### 23. Swarm control station: `gtceu:swarm_control_station`, type `gtceu:dyson_swarm` (Mercury orbit, generator)

- **What it gains:** Kardashev II, generous but never free (rule 8). The station keeps segments in formation and receives their laser links; segments are the wearing catalyst, propellant is the fuel.
- **Recipes:**
  - c1: 16 swarm segments (catalyst; each run turns 1 into a worn segment) + 100 mB oganesson propellant (line 30; or 1,000 mB krypton, half the run time) → 2,097,152 EU/t (1 A UHV) for 6,000 t *(tune, S0-6)*;
  - c2: 64 swarm segments (catalyst; each run turns 4 into worn segments) + 1 coronal field map (catalyst; the station dodges coronal mass ejections) + 400 mB oganesson propellant → 8,388,608 EU/t (4 A UHV) for 6,000 t *(tune, S0-6)*.
- **Rule 8:** the figure is written final and not doubled; a c2 station wears 48 segments an hour, each refurbished with a reflector film and an IMM array; the propellant is spent; the station reaches the bank only through UHV hatches. GCYR's `gcyr:dyson_system_controller` stays hidden.
- **Byproducts:** worn segments → the foundry's c2 *(kept)*.
- **Structure:** 11×11×5 station casing with a laser receiver array.
- **Controller:** UHV hull + 2 UV field generators + 2 UHV circuits *(tune)*.
- **Crossings:** EV cryogenic plant (oganesson purification row).
- **Source:** idea: GTNH-Intergalactic's swarm formula (MIT, adapted: linear in segments, no exponent).

### 24. Solar probe bay: `gtceu:solar_probe_bay`, type `gtceu:solar_probe` (Mercury orbit)

- **What it gains:** Parker Solar Probe flew to 9.86 solar radii in 2024 behind a carbon–carbon shield. Our probe adds a UHTC face and maps the corona's field, so the swarm can ride out its storms.
- **Recipes:** c1: 1 `grindless:solar_probe` (assembled here from C–C shield (HV's composite autoclave) + UHTC tiles + SiC power module + betavoltaic cells + 1 HPGe detector (UV)) + the heliopause data (catalyst) → 1 `grindless:coronal_field_map`.
- **Byproducts:** the probe burns in the corona *(voidable: nothing returns)*.
- **Structure:** 7×5×7 station casing with a launch rail.
- **Controller:** UHV hull + 2 UV sensors + 2 UHV circuits *(tune)*.
- **Crossings:** HV composite autoclave (C–C shield).
- **Source:** real: Parker Solar Probe (NASA/APL).

### 25. Baseline astrometer: `gtceu:baseline_astrometer`, type `gtceu:baseline_astrometry` (Proxima b orbit; observatory family step 9)

- **What it gains:** a parallax baseline of 4.24 light years instead of 2 AU (×130,000) maps every star within 50 light years in three dimensions, and a mid-infrared nulling interferometer finds their planets. The chart is the key to UEV.
- **Recipes:** c1: the Sgr A* image (UV's event horizon interferometer; the reference frame, catalyst) + 4 SiC mirror blanks + 8 ZBLAN fibre + 4 QCLs + 4 thin-film LN modulators + 1 organoid processor (catalyst) → 1 `grindless:stellar_neighbourhood_chart`.
- **Byproducts:** none.
- **Structure:** the observatory family's frame on station casing.
- **Controller:** UHV hull + 2 UV sensors + 2 UHV circuits *(tune)*.
- **Crossings:** none two eras back (UV's catalogue, our optics).
- **Source:** real: Gaia; LIFE and Darwin nulling interferometer studies.

### 26. Xenoflora rover bay: `gtceu:xenoflora_rover_bay`, type `gtceu:xenoflora_rover` (Proxima b)

- **What it gains:** the first contact with Proxima's surface: rovers powered by a curium heat source and betavoltaics (no sun on the night side) bring back flora and a regolith survey.
- **Recipes:** c1: 1 rover (`grindless:proxima_rover`: UV's Am-241 micro source + betavoltaic cells + HPGe detector) + the Proxima approach data (catalyst) → 4 `grindless:proxima_flora_sample` + 1 `grindless:proxima_regolith_survey`; the rover wears 1 in 8 runs.
- **Byproducts:** worn rover → parts back *(kept)*.
- **Structure:** 7×5×7 hangar casing (new, F1).
- **Controller:** UHV hull + 2 UV motors + 2 UHV circuits *(tune)*.
- **Crossings:** none two eras back.
- **Source:** real: Perseverance's sampling; Proxima b's red-dwarf flora predictions (Kiang et al., 2007).

### 27. Xenobotany greenhouse: `gtceu:xenobotany_greenhouse`, type `gtceu:xenobotany` (Proxima b; greenhouse family step 8)

- **What it gains:** Proxima's light peaks at 1 µm; its plants (in the model) photosynthesise with far-red pigments like Earth's chlorophyll f. The greenhouse grows them at the terminator from a characterised strain, Proxima ice water and cold-trap CO₂.
- **Recipes:**
  - c1 biomass: the characterised xeno strain (catalyst) + 1,000 mB water (cold-trap ice, melted) + 500 mB carbon dioxide → 8 `grindless:xeno_biomass`;
  - c2 mushrooms: as c1 with a dark chamber → 8 `grindless:xeno_mushroom`;
  - c3 pigment: 8 xeno biomass → 1,000 mB `grindless:far_red_pigment` + 4 biomass residue.
- **Byproducts:** residue → MV's biorefinery *(kept)*; oxygen → the base's air *(kept)*.
- **Structure:** the greenhouse family's frame, sealed.
- **Controller:** UHV hull + 2 UV pumps + 2 UHV circuits *(tune)*.
- **Crossings:** MV biorefinery.
- **Risks:** GCYR's Proxima blocks (`hidden_until` rows, `until: uhv`) become the greenhouse's decorative output only if S0-1 finds them registered.
- **Source:** real: chlorophyll f (Chen, 2010); Kiang's red-dwarf photosynthesis models.

### 28. Xenobiochemistry plant: `gtceu:xenobiochem_plant`, type `gtceu:xenobiochemistry` (Proxima b)

- **What it gains:** life under Proxima's flares makes radioprotective proteins (like tardigrades' Dsup), infrared pigments and chitin; the plant extracts them where they grow.
- **Recipes:**
  - c1 radioprotectant: 16 xeno biomass + buffer → 1 `grindless:xeno_radioprotectant`;
  - c2 IR pigment: 1,000 mB far-red pigment + solvent → 1 `grindless:infrared_pigment` (the astrometer's and the clock's coatings; *(tune)*);
  - c3 chitosan: 8 xeno mushrooms + sodium hydroxide → chitin → deacetylated → 2 `grindless:chitosan_scaffold`.
- **Byproducts:** spent caustic → the network *(kept)*; residue → MV's biorefinery *(kept)*.
- **Structure:** 7×5×7 sealed chemical casing.
- **Controller:** UHV hull + 2 UV pumps + 2 UHV circuits *(tune)*.
- **Crossings:** MV biorefinery.
- **Source:** real: Dsup (Hashimoto, 2016); fungal chitosan.

### 29. Cold-trap drill: `gtceu:cold_trap_drill`, type `gtceu:cold_trap_drilling` (Proxima b night side; drill family step 13)

- **What it gains:** a tidally locked planet freezes its volatiles on the night side; the ice there is enriched in deuterium and holds organics cooked by flares. A californium-252 source logs the ice by neutrons before the drill bites.
- **Recipes:** the drill family's: 1 drill head (worn) + the regolith survey (catalyst) + 1 californium-252 source (catalyst) → 1 `grindless:proxima_ice_core` + 16 cold-trap regolith.
- **Byproducts:** none (the core and the regolith are products).
- **Structure:** the drill family's frame on biocement casing (31).
- **Controller:** UHV hull + 2 UV motors + 2 UHV circuits *(tune)*.
- **Crossings:** none in the drill itself; the core feeds IV's heavy water plant and ZPM's tholin reformer (line 18).
- **Source:** real: neutron spectrometers on LRO/Mars Odyssey; tidally locked climate models (Turbet et al., 2016).

### 30. Radiotrophic vat: `gtceu:radiotrophic_vat`, type `gtceu:radiotrophic` (Proxima b)

- **What it gains:** *Cladosporium sphaerospermum* grows faster under radiation and its melanin shields what lies behind it (ISS experiment, 2018). Under Proxima's flares, the vat grows melanised biomass for the base's flare shielding.
- **Recipes:** c1: 1 Cladosporium culture (LuV's biofoundry, *Older machines*; catalyst) + 4 xeno biomass + 1,000 mB water → 8 `grindless:melanised_biomass`.
- **Byproducts:** spent medium → MV's biorefinery *(kept)*.
- **Structure:** 5×5×5 sealed vat with a flare window.
- **Controller:** UHV hull + 2 UV pumps + 2 UHV circuits *(tune)*.
- **Crossings:** LuV biofoundry.
- **Source:** real: Shunk et al. (2020), the ISS Cladosporium experiment.

### 31. Biomining heap: `gtceu:biomining_heap`, type `gtceu:biomining` (Proxima b)

- **What it gains:** microbes leach metals from regolith without reagents brought 4 light years: BioRock (ISS, 2019) showed *Sphingomonas desiccabilis* leaching rare earths in microgravity. The heap also cements the regolith into the base's casing with urease bacteria.
- **Recipes:**
  - c1 PGM: 16 cold-trap regolith + a cyanogenic culture (*Chromobacterium violaceum*, LuV's biofoundry; catalyst) → 1,000 mB `gtceu:proxima_pgm_liquor`;
  - c2 REE: 16 cold-trap regolith + a *Sphingomonas* culture (catalyst) → 1,000 mB `gtceu:proxima_ree_liquor`;
  - c3 biocement: 8 cold-trap regolith + urea + calcium (from c2's tailings) + a *Sporosarcina pasteurii* culture (catalyst) → 8 `grindless:biocemented_regolith` (Proxima site casing).
- **Byproducts:** leached tailings → c3 *(kept)*; spent cyanide → biodegraded in the heap *(contained)*.
- **Structure:** 9×3×9 heap pad with irrigation.
- **Controller:** UHV hull + 2 UV pumps + 2 UHV circuits *(tune)*.
- **Crossings:** EV platinum plant (PGM liquor), EV extraction cascade (REE liquor), LuV biofoundry (cultures), EV regolith cell (it stays on the Moon, `docs/eras/ev.md:117`; its Proxima regolith row takes the leached tailings, sent by AE2, for oxygen and iron).
- **Source:** real: BioRock (Cockell et al., 2020); MICP biocement (Dosier, bioMASON).

### Older machines, new modes

| Machine (era) | Mode | Recipe | Feeds |
|---|---|---|---|
| Fuel fabrication plant (IV) | HFIR driver, next free circuit | uranium-233 + aluminium → 1 HFIR driver element (`grindless:hfir_driver_element`) | machine 1 |
| Hot cell (IV) | nickel-62, a row of `tables/hot_cell.json` (ZPM's silicon-28 row is the precedent) | nickel tetracarbonyl (nickel + carbon monoxide, Mond; toxic, so contained in the hot cell) → gas centrifuge → nickel-62 carbonyl + depleted carbonyl → 1 nickel-62 target | machines 1, 9 |
| Platinum plant (EV) | Proxima liquor, next free circuit | 1,000 mB Proxima PGM liquor → platinum, palladium, ruthenium, iridium *(proportions S0-1)* | lines 16, 29; the iridium crucible |
| Heavy water plant (IV) | Proxima ice, next free circuit | 1,000 mB deuterium-enriched water (the ice core, melted) → heavy water at four times the Earth-water yield | line 18 |
| Lunar solar field (EV) | Proxima b row | accepts `gcyr:proxima_centauri_b` with red-tuned arrays (8) at ×0.65, day side only | Proxima base power |
| Extraction cascade (EV) | Proxima REE liquor | 1,000 mB Proxima REE liquor → rare-earth chloride solution, then its existing route | line 16 |
| Cryogenic plant (EV) | two UHV rows | neon → 99.999 % neon (the moderator grade); crude oganesson (the Mk3's) → oganesson propellant | machine 13; line 30 |
| Regolith cell (EV) | Proxima regolith | leached tailings (biomining heap, sent to the Moon by AE2) → oxygen + iron + silica | line 16's tailings; the network |
| Biofoundry (LuV) | xeno rows | xeno genome data → far-red gene cassette; and four cultures: *Cladosporium*, *Chromobacterium*, *Sphingomonas*, *Sporosarcina* | machines 30, 31; line 32 |
| Organoid lab (LuV) | UHV medium | its growth medium + 1 xeno radioprotectant → sterilised growth medium | machine 11 |
| Algae bioreactor (LuV) | far-red, Proxima b | engineered far-red algae under Proxima's light → algal biomass + oxygen; accepts `gcyr:proxima_centauri_b` | line 32 |
| Ion implanter (ZPM) | two rows | LiNbO₃ wafer + helium-4 → implanted LN wafer; SiC epi wafer + aluminium → implanted SiC wafer | machines 6, 7 |
| Isotope column (ZPM) | carbon-12 | carbon monoxide → ¹²CO + ¹³CO (the ¹³C to its existing use) | line 22 |
| Diamond lattice fab (ZPM) | c5, c6 | CVD diamond → p–i–n diamond diodes; ¹²CH₄ → C-12 diamond spreader | machines 9, 22 |
| Magnet works (ZPM) | UHV cell, c5 | RTAN wire + UV cells → `grindless:uhv_smes_cell` *(S0-5)* | the network |
| MOCVD reactor (UV) | two rows | GaInP/GaAs/InGaAs inverted on GaAs → IMM epi wafer; NbN on a SiC mirror blank → NbN-coated plate | machines 8, 17 |
| Synchrotron (UV) | sodium-22 | magnesium-24 target + deuteron beam → sodium-22 target | machine 13 |
| Antimatter trap (UV) | antihydrogen | 1 antiproton cartridge + 1 positron cartridge → 1 `grindless:antihydrogen_cartridge` | machine 18 |
| Powder-in-tube line (UV) | two rows | RTAN dust in a silver sheath → RTAN wire; MgB₂ powder in iron → MgB₂ wire | lines 29, 20 |
| Thruster works (UV) | two rows | ICAN pellet cartridge + UHTC nozzle + SiC power modules → `grindless:ican_rocket_motor` (GCYR motor tier 6); oganesson → propellant pod | the level 8 rocket; machine 23 |
| Light sail fab (UV) | reflector | aluminium (Mercury) → aluminium reflector film | machine 22 |
| Pyroprocessing cell (UV) | HFIR driver | spent HFIR driver → uranium-233 + fission product waste | line 2 |
| GTM chemical reactor and assembler | rows keyed by our items | the oxo route to HDEHP (line 25); 1,2,3-trichlorobenzene (line 24); zirconium tetrafluoride (line 31); MgB₂ powder (line 20); ¹²CO methanation; melanin–chitosan flare panel (line 15) | the lines named |
| GTM electrolyser | alumina–calcia | alumina–calcia residue → aluminium + calcium + oxygen | line 19 |

- Each mode is one row in the older machine's table or script, owned by the package whose contract lists that file.
- Where two packages add rows to the same older file, they run in order: `zpm/qubits.js` (A3, then A4), `ev/cryogenic_plant.js` (A6, then B3), `uv/materials.js` (A9, then B2) (*Parallel and serial*).
- ZPM is two eras back from UHV, so the ZPM modes count as crossings when a UHV line runs through them.
- Dimension rows (the lunar solar field, the algae bioreactor) widen an existing `G.dimensionLock` list; they never remove a dimension.

## Family steps

- **Vein drill, step 12:** the regolith excavator on Mercury. IV's iridosmine sample is the catalyst; the bucket drum is the worn bit.
- **Vein drill, step 13:** the cold-trap drill on Proxima b's night side. The regolith survey is the catalyst, the drill head the bit, a californium-252 source logs the ice.
- **Greenhouse, step 8:** the xenobotany greenhouse, the first greenhouse that grows a biology from another star.
- **Observatory, step 9:** the baseline astrometer. The solar probe and the rover are the family's outward eyes, not steps.
- **Power on site:** Mercury orbit is fed by its own swarm station; Proxima b by the lunar solar field's Proxima row, IV's RTG cell and, after the gate, the network.

## Reserve, and what was dropped

### What UHV reserves for UEV

| Reserved | Why it waits | What UHV leaves for it |
|---|---|---|
| Superheavy targets and calcium-48 | a calutron and a heavy-ion linac are UEV-scale | berkelium-249 (stored) |
| The Mk4 fusion ring | GTM 7.5.3 has three rings; a fourth is ours (`registerFusionTier`, Monifactory's pattern, LGPL) and needs UEV parts | neutronium, RTAN, the UHV cell |
| GTCA's elevator miner and pump modules | they mine the sky; UEV's | the elevator, its ribbon and climber |
| The rest of the stellar neighbourhood | the chart names the targets | the stellar neighbourhood chart |
| GT--'s optical computer and mainframe | UEV circuits | the optical processor and assembly |
| Alpha Centauri A and B | UEV's journey | the gate's far end, 0.2 light years away |

### Considered and dropped

These would have taken UHV from 31 towards the guideline's 42. Each failed rule 4 or rule 7's "convenience versions do not count", or belongs to UEV.
- **A calcium-48 calutron:** IV dropped one (`docs/eras/iv.md:632`); calcium-48 only matters for superheavies (UEV).
- **A bulk antimatter factory:** UV's synchrotron makes antiprotons; a second source would be the same chain at a larger scale.
- **A separate antihydrogen trap:** a second machine for one step; UV's trap takes a mode.
- **A Proxima flare monitor, a Proxima d flyby and an Alpha Centauri AB probe:** data with no product; the radiotrophic vat uses the flares, and Alpha Centauri is UEV's.
- **A Mercury polar ice drill:** the swarm needs no water; Mercury's ice would be a third water source.
- **A mass driver on Mercury:** ZPM dropped it (`docs/eras/zpm.md:758`); AE2 moves the mass.
- **A xenogenome sequencer:** the sample receiving facility and the biofoundry's rows do it.
- **An atomically precise fab and an SFQ foundry:** no UHV item needs them.
- **Fullerenes and N@C₆₀ clocks:** the thorium clock is better and has a line.
- **Neutron-transmutation-doped silicon:** the SiC fab covers UHV's power devices.
- **An Am-242m fission-fragment reactor:** a non-turbine conversion is ZPM's direct energy converter.
- **A Proxima terminator heat engine:** IV's Venus heat engine would be the same machine with another place.
- **A reflector foil mill:** UV's light sail fab takes the row.
- **Our own space elevator:** GTCA's exists and is hidden until `uhv`; building ours would leave two.
- **A solar power satellite and rectenna:** LuV dropped beamed power (`docs/eras/luv.md:1473`); the network carries it.
- **A free-electron laser:** the synchrotron's X-ray lithography is enough for UHV dies.

## Power on the wireless network

- **The UHV tier** (package A9, with LuV-A4's mechanism and the table's rule):
  - UHV wireless energy and dynamo hatches at 2, 4, 16 and 64 A (`gtceu:uhv_wireless_energy_hatch` and `gtceu:uhv_wireless_dynamo_hatch`, with `_4a`, `_16a` and `_64a`) and UHV covers (`grindless:uhv_wireless_energy_cover`, `grindless:uhv_wireless_dynamo_cover`);
  - the UHV cell, `grindless:uhv_smes_cell`, wound by the magnet works' c5 with RTAN wire: four UV cells' worth, about 62.9 G EU *(tune; S0-5)*;
  - the tier's link is the **nuclear clock** (`grindless:nuclear_clock`): the gravi star moves down to UV's row, as the table's rule asks *(S0-5 checks the table accepts a grindless item as a link)*;
  - hatches stay capped at their rated amperage per window;
  - **the jump:** the network outputs UHV only when every formed tower holds UHV cells;
  - **before the jump:** two UV wireless hatches give UHV voltage (the two-hatch rule).
- **Sources** (ours are written final):

| Source | Where | EU/t | Into the bank (−5 %) | Fuel and wear | Doubled by `generators.js`? |
|---|---|---|---|---|---|
| Swarm control station, c1 (23) | Mercury orbit | 2,097,152 | 1,992,294 | 100 mB oganesson (or 1,000 mB krypton) a run; 1 segment worn a run | no (written final) |
| Swarm control station, c2 (23) | Mercury orbit | 8,388,608 | 7,969,178 | 400 mB oganesson a run; 4 segments worn a run; the coronal field map | no |
| UV's three plants | Earth | UV's table (`docs/eras/uv.md:873`) | −5 % | as UV | no |
| Lunar solar field, Proxima row | Proxima b | ×0.65 of its Moon figure | −5 % | red-tuned arrays | as EV |
| Everything older | as built | UV's table | — | — | as built |

- **Segments:** one c2 station wears 48 segments an hour; the foundry's c2 refurbishes each with one reflector film and one IMM array, so Mercury's regolith, the MOCVD and the light sail fab all keep running for the swarm to stay up.
- **Propellant:** one c2 station burns 4,800 mB oganesson an hour. The Mk3's oganesson row is the source; krypton (UV's Kuiper noble gas, EV's cryogenic plant) is the fallback at half the run time. *(tune: S0-6 prints the Mk3's oganesson rate.)*
- **The gate's 33,554,432 EU/t out of the bank needs at least 35,320,455 in.** For example:

  | Source | EU/t |
  |---|---|
  | UV's gate mix (`docs/eras/uv.md:889-898`) | 9,960,496 |
  | 4 swarm control stations on c2 | 33,554,432 |
  | **In** | **43,514,928** |
  | **Into the bank (−5 %)** | **41,339,182** |

  The swarm carries the era, but not alone: four c2 stations give 31.9 M into the bank, under the 33.5 M load, so UV's plants keep running.
- **Rule 8:**
  - the swarm station is written at its final figure (not in `generators.js`);
  - it costs a chain: segments from five lines, refurbishment, propellant and a probe's field map;
  - no UHV source is fuel-free: sunlight is the fuel, and the segments that catch it wear.

## Fusion, and what is not fusion

- **The Mk3 stays GTM's;** UHV adds no ring. GTM 7.5.3 has three, and the fourth (`registerFusionTier`, Monifactory's pattern) is reserved for UEV.
- **Kept recipes:** UV's Mk3 audit (`tables/fusion_mk3.json`) with one change: oganesson becomes **kept** (line 30). Neutronium stays Mk3-only.
- **The Sun is UHV's fusion:** the swarm catches a star's output instead of building one.
- **What is not fusion:** the HFIR (fission, not a generator), betavoltaics (decay, microwatts), the Casimir array (fiction, consumes power).

## Nothing one at a time

- **The UV parallel hatch (×256)** is the top: GTM 7.5.3 registers no UHV parallel hatch with `highTierContent` off *(S0-1)*.
  - **Who takes it:** every UHV machine of ours except the generator (23), the single-shot bays (24, 26), the astrometer (25) and the gate (18).
  - 256 copies of a 1,966,080 EU/t recipe need about 503 M EU/t, so full parallel stays a network job.
- **The assembly line from AE2** builds the UHV hatches, the UHV cell's controller parts and the UEV hatch at the gate.
- **Research:** the UEV energy hatch's research scans the stellar neighbourhood chart (*Gate to UEV*), as UV scanned the Sgr A* image.
- **Circuits in batches:** the organoid array makes wetware mainframes four at a time.

## AE2 between planets: the UHV step

- **Two new pairs:** Mercury orbit (a seed, ZPM's pattern; Mercury's surface already has IV's half bridge) and Proxima b (the warp gate's seed, covering its orbit and surface).
- **Power doesn't need them:** the wireless network carries it, and reaches Proxima b once the gate's seed exists *(S0-7: does the network cross to a dimension with no planet pair? if not, the Proxima base runs on site power until B7)*.
- **Capacity:** Proxima sends samples, liquors and biomass; Mercury sends regolith fractions and receives films and arrays.
- **Time:** the stations and bases run unattended while their chunks are loaded (FTB Chunks).

## New process lines

UHV adds **32 lines** (UV added 22: ×1.45).

**What counts as a line:** UV's rules (`docs/eras/uv.md:949-955`): a real chain from a feedstock to a product with honest byproduct destinations; at least four arrows; one chain counts once; assemblies with no feedstock of their own (the tether ribbon, the swarm segment's assembly, the solar probe, the UHV cell) and data chains (the coronal field map, the stellar neighbourhood chart) are not counted.

**Steps** is the number of items and machines between arrows, as for UV's table (UV averages 6.9).

| # | Line | Steps | By-products → destination |
|---|---|---|---|
| 1 | Transcurium breeding: heavy curium oxide + Am-243 → transcurium target → HFIR → irradiated target → transcurium liquor → HDEHP separation → Bk-249 + Cf-252 → sealed Cf-252 source | 8 | fission products → synroc (ZPM); curium back to the next target |
| 2 | Uranium-233 driver fuel: U-233 → fuel fabrication plant → HFIR driver → HFIR → spent driver → pyroprocessing cell → U-233 | 7 | fission product waste → synroc |
| 3 | The nuclear clock: U-233 → decay store → thorium-229 → crystal growth furnace → Th:CaF₂ → nuclear clock lab → nuclear clock | 7 | U-233 back |
| 4 | Nickel-63 betavoltaics: nickel → nickel tetracarbonyl → hot cell centrifuge → nickel-62 target → HFIR → nickel-63 → plating liquor → betavoltaic cell | 8 | depleted carbonyl → nickel back; spent liquor → c1 |
| 5 | Lithium niobate photonics: Mars lithium carbonate → LiNbO₃ boule → LN wafer → helium implant → LNOI wafer → thin-film modulator → optical processor | 7 | LN offcuts → c1 |
| 6 | Phase-change memory: Io germanium + antimony + tellurium → GST target → sputtered film → PCM die → optical processor → optical assembly | 6 | target scrap → remelted |
| 7 | Quantum memory: europium oxide + yttrium oxide + silica → Eu:YSO melt → boule → wafer → quantum memory chip → optical assembly | 7 | kerf → remelted |
| 8 | VUV fluoride optics: fluorspar → fluorite → CaF₂ + PbF₂ scavenger → VUV CaF₂ boule → VUV optics → xenon HHG cell → VUV frequency comb | 7 | PbF₂ back; xenon back |
| 9 | Quantum cascade lasers: Io indium + phosphorus → InP boule → InP wafer → MBE superlattice → QCL wafer → QCL → astrometer | 7 | arsenic *(contained)*; B₂O₃ back |
| 10 | Silicon carbide power: SiC powder → PVT boule → wafer → epi wafer → aluminium implant → device wafer → SiC power module | 7 | HCl, H₂ → network |
| 11 | Ultrapure water: water → RO permeate → EDI water → UV-ozone water → degassed water → ultrafiltered water → ultrapure water | 7 | RO concentrate *(voidable)*; resin regenerated |
| 12 | Organoid processors: LuV medium → sterilised medium → stem cells → cortical organoid → MEA mount → organoid processor → wetware mainframes (×4) | 7 | spent medium → biofoundry |
| 13 | Xeno radioprotectant: flora sample → sample receiving facility → characterised strain → greenhouse → xeno biomass → clarified lysate → radioprotectant | 7 | residue → biorefinery |
| 14 | Chitosan scaffolds: xeno mushroom → chitin → deacetylation → chitosan → freeze-cast scaffold → organoid | 6 | spent caustic → network |
| 15 | Melanin flare shielding: *Cladosporium* culture → radiotrophic vat → melanised biomass → melanin extract → melanin–chitosan composite → flare shield panel → Proxima base casing | 7 | spent medium → biorefinery |
| 16 | Proxima biomining: cold-trap regolith → biomining heap → PGM liquor → platinum plant → PGM salts → ruthenium + iridium → RTAN and the crucible | 7 | tailings → line 17 and EV's regolith cell; no cyanide (bioleaching) |
| 17 | Proxima biocement: leached tailings → calcium liquor + urea → *Sporosarcina* culture → MICP heap → biocemented regolith → site casing | 6 | ammonium → the greenhouse's fertiliser |
| 18 | Proxima ices: ice core → melt and sublimation → carbon dioxide split off → deuterium-rich water → heavy water plant → heavy water → deuterium (UV's muon cell) | 7 | CO₂ → greenhouse; flare organics → tholin reformer |
| 19 | Mercury regolith fractions: regolith → vapour furnace (low) → Na–K + sulfur → stripped regolith → vapour furnace (high) → alumina–calcia → electrolyser → aluminium reflector film | 8 | sulfur, graphite → network |
| 20 | MgB₂ links: Mercury magnesium + boron → MgB₂ powder → PIT billet → drawn wire → reacted wire → MgB₂ cable (gate ring, swarm station) | 6 | iron sheath scrap → recycled |
| 21 | Space photovoltaics: gallium + indium + arsenic + phosphorus → IMM epi → lift-off → IMM film → coverglass laminate → IMM array → swarm segment | 7 | worn substrate → Ga recovered; arsenic *(contained)* |
| 22 | Carbon-12 spreaders: syngas CO → isotope column → ¹²CO → methanation → ¹²CH₄ → CVD diamond → C-12 spreader | 7 | ¹³CO → its ZPM use; water → network |
| 23 | Swarm segments and their wear: Mercury aluminium → reflector film → segment → swarm station → worn segment → refurbishment → stripped film → aluminium | 7 | none (a loop) |
| 24 | PBO fibre: benzene + chlorine → 1,2,3-trichlorobenzene → dinitrotrichlorobenzene → dinitroresorcinol → diaminoresorcinol → PBO dope (in PPA) → PBO fibre | 7 | HCl, NaCl → network; PPA → back |
| 25 | HDEHP extractant: propene + syngas → butyraldehyde → 2-ethylhexenal → 2-ethylhexanol → HDEHP (with POCl₃) → kerosene solvent → transuranium facility | 7 | spent solvent → incinerated, phosphoric acid back |
| 26 | Ultra-high-temperature ceramics: zirconia + boron carbide → ZrB₂ powder → ZrB₂–SiC blend → spark plasma sinterer → UHTC tile → UHTC nozzle → ICAN motor | 7 | CO → syngas plant |
| 27 | Positrons to antihydrogen: magnesium-24 → synchrotron → sodium-22 → moderated source → Surko trap → positron cartridge → antimatter trap → antihydrogen cartridge | 8 | spent Na-22 → synroc |
| 28 | Casimir exotic matter (fiction): SiC mirror blank → NbN film → coated plate → cavity stack → harvest → exotic matter cell → warp gate | 7 | helium back |
| 29 | RTAN superconductor: ruthenium + americium + neutronium + trinium → RTAN dust → EBF ingot → PIT billet → RTAN wire → UHV cell | 7 | silver sheath → recycled |
| 30 | Oganesson propellant: Mk3 off-gas → crude oganesson → cryogenic plant → pure oganesson → propellant pod → swarm station | 6 | light noble gases → network |
| 31 | ZBLAN fibre: zirconia + HF → ZrF₄ → fluoride batch (Ba, La, Al, Na) → melt → preform → microgravity draw → ZBLAN fibre | 7 | HF → fluorspar kiln |
| 32 | Far-red photosynthesis: xeno genome data → biofoundry → far-red gene cassette → engineered algae → algae bioreactor (Proxima) → algal biomass → biorefinery fuel | 7 | oxygen → the base's air |

- **Total steps 223; average 7.0** (UV 6.9); none under 6.
- **The weakest claims are named:**
  - line 28 is fiction (exotic matter); it is labelled so in EMI and the quest, and it is the only fiction besides the gate it feeds;
  - line 30 relies on GTM's oganesson being a stable gas; real oganesson lives milliseconds (rule 6: GTM wins);
  - line 23 is a loop, counted because its feedstock (Mercury aluminium) and its wear are real;
  - lines 6, 14, 17, 20 and 30 are the shortest (6 steps).
- **No line is a split of another:** lines 5, 6 and 7 make three different dies from three different feedstocks; lines 16 and 17 share the heap but not their product.

**Crossings with lines two or more eras back** (ZPM and older; the guideline is about 36; UV had 24; UHV has **40**):

| UHV machine or line | Older line | Era |
|---|---|---|
| Line 2, HFIR | fuel fabrication plant (U-233 driver) | IV |
| Line 4 | hot cell (nickel-62 centrifuge) | IV |
| Line 18 | heavy water plant (Proxima ice) | IV |
| Line 8, crystal growth furnace | fluorspar kiln | IV |
| Line 31 | fluorspar kiln (HF) | IV |
| Nuclear clock lab | hot cell (xenon) | IV |
| Crystal growth furnace | platinum plant (iridium crucible) | EV |
| Line 16 | platinum plant (Proxima PGM liquor) | EV |
| Line 29 | platinum plant (ruthenium) | EV |
| Regolith excavator, solar vapour furnace | the Mercury site (drill, heat-shield casing) | IV |
| Transuranium facility, line 1 | waste retrieval plant (synroc) | ZPM |
| HFIR, line 1 | partitioning plant (americium-243) | ZPM |
| Line 29 | partitioning plant (americium) | ZPM |
| Line 5 | ion implanter (helium smart-cut) | ZPM |
| Line 10 | ion implanter (aluminium) | ZPM |
| Line 7 | europium reductor | ZPM |
| Line 18 | tholin reformer (flare organics) | ZPM |
| Line 22 | isotope column (carbon-12) | ZPM |
| Line 4, betavoltaic fab | diamond lattice fab (diodes) | ZPM |
| Line 22 | diamond lattice fab (C-12 CVD) | ZPM |
| Tether ribbon works | pyrolyser (nanotube yarn) | ZPM |
| Line 29, UHV cell | magnet works (c5) | ZPM |
| Line 5 | Mars lithium | EV |
| Line 7 | extraction cascade (yttrium) | EV |
| Line 31 | extraction cascade (lanthanum) | EV |
| Line 16 | extraction cascade (Proxima REE liquor) | EV |
| Line 24 | extraction cascade (its surplus phosphoric acid, `docs/eras/ev.md:294`) | EV |
| Line 27 | cryogenic plant (neon) | EV |
| Line 30 | cryogenic plant (oganesson) | EV |
| Line 16 | regolith cell (Proxima tailings) | EV |
| Proxima base | lunar solar field (Proxima row) | EV |
| Line 6 | Io's germanium | LuV |
| Line 9, line 21 | Io's indium | LuV |
| Line 12 | the organoid lab | LuV |
| Lines 13, 15, 16, 17 | the biofoundry (strains and cultures) | LuV |
| Line 32 | the algae bioreactor | LuV |
| Line 21 | the gallium line | MV |
| Greenhouse, xenobiochemistry plant, radiotrophic vat | the biorefinery | MV |
| Solar probe bay | the composite autoclave (C–C) | HV |
| Line 22, line 25 | the syngas plant (CO, oxo syngas) | HV |

## Quests

Chapter **"UHV — Proxima and the Swarm"**: in English, about 56 small-reward quests that never block recipes.
- **It opens** with the Proxima approach data and the stored heavy curium oxide (UV's gate rows).
- **It closes** with the stellar neighbourhood chart and the step through the gate.
- No quest promises a machine that does not exist yet.

| Part | Quests |
|---|---|
| Isotopes | *High Flux*, *Berkelium*, *A Californium Source*, *Back to the Driver* (U-233), *Thorium-229*, *A Clock in a Nucleus*, *Nickel-63*, *Fifty Years of Current* |
| Light | *Lithium Niobate*, *Phase Change*, *Memory of Light* (Eu:YSO), *Vacuum Ultraviolet*, *Cascade* (QCL), *Optical Processor*, *Glass from Orbit* (ZBLAN) |
| Power devices and water | *Silicon Carbide*, *Inverted Cells* (IMM), *Eighteen Megohms* |
| Life at home | *Organoids*, *Four Mainframes*, *Planetary Protection* |
| Materials | *PBO*, *Ribbon*, *Climber*, *Up the Elevator*, *Three Thousand Degrees* (UHTC), *ICAN*, *Level Eight* |
| Antimatter and the gate | *Positrons*, *Antihydrogen*, *Casimir* (fiction, stated), *The Gate Opens*, *Step Through* |
| Mercury | *Seventh Station*, *Mercury's Ground*, *Vaporised by the Sun*, *Segments*, *The Swarm*, *Coronal Map*, *Kardashev II*, *Noble Thrust* (oganesson, with GTM's stable oganesson stated) |
| Proxima b | *Eighth Station*, *Landing on Proxima b*, *Rover*, *Under a Red Sun*, *Xenobiochemistry*, *Night-Side Ice*, *Black Fungi*, *Biomining*, *Bricks by Bacteria*, *Far-Red*, *Four Light Years of Baseline*, *Gate to UEV* |
| Network | *RTAN*, *The UHV Cell*, *The Network Goes UHV* |

- `tools/quests/uhv-chapter/` generates the chapter from a source file (C2); `es_es` titles come with it.
- **References:** Star Technology (MIT) and Monifactory (LGPL) space quests, adapted with attribution; GTNH, GT Leisure and GTNH-Intergalactic ideas only for the swarm and the elevator.

## Gate to UEV

No passive waits: every row is something built or run.

| What is built or run | What it tests |
|---|---|
| The UEV machine casing (`gtceu:uev_machine_casing`: GTM registers it without a recipe even with `highTierContent` off, `docs/research/space/gtm-tiers.md:49`) on GTM's assembly line, after its research with the stellar neighbourhood chart as the scanned item (the pattern of UV's UHV hatch and the Sgr A* image) | the astrometer, Proxima orbit, the research chain |
| The warp gate pair: c1 opened once, then c2 sustained at 16 A UHV for 60 s | the gate, the exotic matter, the antihydrogen, the clock |
| The nuclear clock; the network at UHV (every formed tower on UHV cells) and a calibrated load: 33,554,432 EU/t for 60 s through a 64 A UHV wireless energy hatch into a GTM power substation | the power plan and the jump |
| One swarm control station run on c2 | the segments (five lines), the propellant, the coronal field map |
| Stored: 1 berkelium-249 | transcurium breeding (UEV's superheavy targets) |
| One representative run at each site: an excavation and a vaporisation (Mercury surface); a segment and a probe launch (Mercury orbit); an astrometry run (Proxima orbit); a rover run, a greenhouse harvest, a cold-trap run, a heap run (Proxima surface) | the stations and the base work |
| 4 UHV circuits from the organoid array | the batch route |
| GTCA's space elevator formed and running our recipe | the ribbon, the climber, GTCA's machine with our recipe |
| A level 8 rocket flown to Proxima b | the ICAN motor, the UHTC nozzle |

The ten-minute run of every base, untouched, lives only in the bench's integration test (C3).

**It unlocks UEV:**
- the stellar neighbourhood's destinations (the chart names them);
- the reserves (*Reserve*): berkelium-249's superheavy targets, the Mk4, the elevator's miner and pump modules.

**What it cannot unlock alone:** UEV hulls and hatches. GTM 7.5.3 registers them only with `highTierContent` on (`docs/research/space/gtm-tiers.md:32-33`). Turning it on, or generating UEV parts through KubeJS (`gtm-tiers.md:156`), is UEV's first decision; UHV leaves it off (*Decisions proposed*).

## Validator (`-Tier uhv`)

- **Neutronium only from the Mk3** (unchanged).
- **Berkelium-249, californium-252, nickel-63 and thorium-229 only from the HFIR and the transuranium facility** (thorium-229 through the facility's decay store).
- **Exotic matter only from the Casimir array; antihydrogen only from UV's antimatter trap with a positron cartridge.**
- **The stellar neighbourhood chart only from the astrometer, in Proxima b orbit.**
- **Proxima samples, ice cores, regolith, liquors and cultures only from the Proxima machines; Mercury regolith and its fractions only from the excavator and the vapour furnace; the coronal field map only from the solar probe bay; swarm segments only from the foundry.**
- **The UHV circuits:** GTM's assembly line recipe stays; the organoid array is a second route.
- **Three substages:**
  1. `uhv`: home and Earth orbit (with Mercury's surface already reachable since IV, but no UHV machine there);
  2. `uhv-mercury`: Mercury surface and orbit (after `uhv`: the swarm needs the IMM arrays, the C-12 spreaders and the nickel-63 cells);
  3. `uhv-proxima`: Proxima b orbit and surface (after `uhv`: the level 8 rocket);
  - `uhv-mercury` and `uhv-proxima` are parallel; the gate needs both.
  - Nothing on the way to a substage asks for its materials. The organoid array and the gate need the chitosan scaffold and the approach data, so they sit after `uhv-proxima`.
- **Nothing in UHV asks for UEV**; the gate's UEV casing is the only UEV item, and it is the gate's own output.
- **The gate is built** only with UHV and earlier things, research included.
- **Model:**
  - the swarm control station is an EU source into the wireless network, with its fuel and wear as inputs;
  - the network's tier is a synthetic step: UHV when the UHV cells and the nuclear clock exist.
- **As built (C1):**
  - `tools/analysis/tiers/uhv.json`, with the three substages;
  - dimension ids from `tables/orbits.json` and `tables/places.json`;
  - each package's targets warn until a dump carries it (`packages`);
  - C1 also re-counts the lines' arrows and the crossings (*New process lines*).

## Mods and integration

| Mod | Slug | Use in UHV |
|---|---|---|
| GCYR | `gcyr` | Proxima Centauri b (tier 8) gains an orbit by datapack override; two more stations; the ICAN motor as a startup `createCustom` GCYR motor, tier 6 (S0-2); its Dyson swarm items stay hidden |
| GTCA | `gtca` | the space elevator gets our recipes; the assembler, miner and pump modules stay hidden (UEV) *(S0-8)* |
| GTM | `gtceu` | UHV hull and hatches, the wetware mainframe, the Mk3 (oganesson kept), the UEV casing's research, the UV parallel hatch |
| GT-- | `gtnn` | `gtnn:optical_processor` and `gtnn:optical_assembly` get recipes and unhide; the computer and mainframe stay hidden |
| EU P2P Tunnel, MEGA Cells, Expanded AE | `eup2p`, `mega`, `expanded-ae` | the AE2 route and capacity, and the Proxima gate seed |
| FTB Chunks | `ftb-chunks-forge` | the stations' and the base's loaded chunks |

No new mods.

- **Startup:**
  - the 31 machines through the pattern helper and their types; the BSL-4, gate and hangar casings;
  - items: isotopes and targets, the clock, the crystals and wafers, the dies, the cartridges, the cells and arrays, the samples, strains and data, the segments, the ribbon and climber, the motor, the chart, the gate seed, the UHV cell;
  - fluids: Proxima PGM and REE liquors, ultrapure water, sterilised medium, HDEHP and its solvent, PBO dope, oganesson propellant, the deuterium-enriched water, the alumina–calcia melt *(S0-1 decides which are GTM materials)*;
  - the UHV wireless tier.
- **Server:**
  - the composed recipes (older modes) and the Mk3 kept list's one change (oganesson);
  - the UEV casing's research registration;
  - the seeds and `sunlight.json` rows;
  - dimension allowlists and `G.noVoiding` where kept;
  - the swarm station's fuels.
- **Data:**
  - `data/grindless/gcyr/planets/proxima_centauri_b.json` (the override, *S0-3*);
  - `dimension/proxima_b_orbit.json`, `dimension_type/` (1); a sky renderer for the orbit;
  - `tables/planets.json` (the Mercury orbit and Proxima pair tags); `tables/stations.json` (two slots);
  - `hidden_until.json` (integrator).

## Save compatibility

- **Additive only:** new items, blocks, fluids, machines, one dimension id (`grindless:proxima_b_orbit`). Nothing registered is removed or renamed.
- **No dimension id changes:** `gcyr:proxima_centauri_b` keeps its id and tier 8; the override adds an orbit and changes nothing on the surface. Mercury's ids stay IV's.
- **Stations:** the six slots keep their ids, plots and positions; slots seven and eight only append (B1).
- **Older machines' new rows** use unused circuits or unique inputs; no existing recipe changes. Dimension lists only widen.
- **GTM recipes re-registered** (the UEV casing's research) keep their ids.
- **Machine shapes:** all new; no older multiblock changes shape.
- **The wireless table:** one row added. The UV row's link becomes "the tier below's" only in the docs; the gravi star stays UV's link.
- **GCYR's swarm items** stay registered and hidden; nothing a player owns disappears.
- **GTCA's elevator:** its `until: uhv` rows (UV's F2) unhide; the miner and pump modules move to `until: uev` (F2), so they never appear without a recipe.

## Risks

| Risk | Where | Answer |
|---|---|---|
| The ICAN motor (tier 5) and the tier 11 tank do not make a level 8 rocket, or GCYR clamps motor tiers | A8 | S0-2, before any Proxima package; resolved by S0-2: the motor is a `createCustom` tier 6 motor |
| GCYR's planet override for Proxima b's orbit breaks the planet | B1 | S0-3; the fallback puts the astrometer and the gate's far end on the surface |
| Two more station slots | B1 | S0-4; data-driven since ZPM, proven for six in UV |
| The UHV cell overflows, or the table refuses a grindless link | A9 | S0-5 |
| The swarm station doubled by mistake, or its item wear not consumed | B3 | S0-6 prints the figure and the wear |
| The gate's player transit (cross-dimension teleport from KubeJS) | B7 | S0-7; the fallback is the AE2 seed only, with the rocket for players |
| GTCA's elevator does not form or run with `highTierContent` off | A7 | S0-8; the fallback keeps the elevator hidden and the ribbon as a gate item (orchestrator) |
| Proxima b's air and gravity as GCYR loads them | B1, B4 | S0-9; gravity is never claimed |
| GTM lacks berkelium, californium-252, nickel-63, thorium-229, zirconia, InP or another id | A1–A10 | S0-1; register `grindless:` ids where missing |
| The Casimir array is fiction | A6 | named in the doc, EMI and the quest; the only fiction with the gate it feeds |
| Oganesson as propellant relies on GTM's stable oganesson | B3 | stated (rule 6); krypton is the fallback fuel |
| Same-save reopen after the orbit dimension adds | B1 | C3 does one save and reopen and reports |
| The era is too long | all | 32 lines, each with a reason; Mercury and Proxima run in parallel substages |

## Build order

UHV is built in packages after v0.10.0, as UV was. Each package below is one work-package issue (`.github/ISSUE_TEMPLATE/work-package.yml`). Its id, objective, allowed and prohibited files, references, dependencies, invariants, acceptance, tests, agent and commits are written so the issue can be filled from this section alone. Each package's rationale is the machine sections it cites.

**Test bands** are assigned by the integrator when it opens each issue (`tools\test\Get-GGTestZone.ps1 -Next` after UV-C3's row); the worker adds only that row to `tools/test/zones.json`. F1, F2, C1 and C2 have no native test and no band.

### Common to every package

UV's *Common to every package* (`docs/eras/uv.md:1170-1185`) applies with `uv` replaced by `uhv` in every path. Each contract below lists only what differs. The changes for UHV:

- **Allowed, always:** `pack/kubejs/startup_scripts/grindless/uhv/<name>.js`, `pack/kubejs/server_scripts/grindless/uhv/<name>.js`, `pack/kubejs/client_scripts/grindless/uhv_<name>_lang.js`, new tables `pack/kubejs/data/grindless/tables/<name>*.json`, `tools/assets/Build-UHV<Name>Textures.ps1` and its outputs, `pack/kubejs/assets/emi/recipe/additions/grindless/uhv_<name>_*.json`, `tools/analysis/test/uhv-<name>.test.mjs`, `tools/test/overlay/kubejs/server_scripts/gg_test_uhv_<name>.js` and the package's row in `tools/test/zones.json`.
- **Prohibited, always:** `pack/index.toml`, `pack/pack.toml`, `hidden_until.json`, `pack/kubejs/*/grindless/lib/**`, `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md`, `CREDITS.md`, every `.snbt`, and any older file the contract does not list.
- **Older machines:** each contract lists the one older file or table row it may touch. That file belongs to that package until it merges (*Parallel and serial*).
- **Invariants, always:**
  - no UHV recipe takes a UEV-only input (a UEV hull, hatch or circuit, GT--'s optical computer, GTCA's miner or pump module);
  - no UHV recipe takes a UHV output before the machine that makes it, and no Earth recipe takes a Proxima or Mercury product before its substage;
  - neutronium only from the Mk3; berkelium, californium, nickel-63 and thorium-229 only from the HFIR and the facility;
  - the swarm control station is written at its final figure and is not added to `power/generators.js`'s list;
  - UV's invariants hold: one recipe per lookup path, written byproduct destinations, no removed or renamed id, *(tune)* figures free and routes, catalysts and sites fixed.
- **Tests:** T0 is `powershell -NoProfile -ExecutionPolicy Bypass -File tools\Check-Fast.ps1`. T1 is the one native test named in the contract, run once in its band. The bench runs one JVM at a time.
- **Repairs and agent:** at most 2 repairs, then escalate with the triage output, the suspected `path:line` and the attempts. Implementer (Sonnet) unless the contract says otherwise. Opus only for a cross-system contradiction.
- **Proof reuse:** a plain recipe multiblock through `lib/patterns.js` with no new mechanism needs no T1 beyond the recipe lookup check. LuV, ZPM and UV proved the helper, the dimension allowlist, the station chunks, the wireless hatches, the written-final generators and the research re-registration. The T1s below name only what is new.

### Spikes (S0): disposable, before any permanent id

Spikes run one after another in the S0 band, before F1. Their files stay in the bench overlay and in the S0 row of `tools/test/zones.json`, and they register nothing in `pack/`. Each answers one question and returns pass or fail with its run id. A fail changes the named package's contract before it opens. The results go to `docs/research/uhv-s0.md` (the S0 worker writes it).

| Spike | Question | If it fails | Changes |
|---|---|---|---|
| **S0-1** | An id dump: UHV hull, hatches and components that exist with `highTierContent` off; `gtceu:uev_machine_casing`; the parallel hatch's top tier; wetware mainframe; berkelium, californium, curium, thorium, U-233, nickel, oganesson, zirconia, InP, niobium oxide, lead fluoride, silicon carbide; `gtnn:optical_processor`, `gtnn:optical_assembly`; `gcyr:dyson_controller`; GCYR's Proxima blocks; the Mk3's oganesson recipe | every missing material is registered as `grindless:` in F1; a missing UEV casing moves the gate's first row to a grindless research item | F1, every A package |
| **S0-2** | A KubeJS `gcyr:rocket_motor` tier 5 with UV's tier 11 tank builds a level 8 rocket that launches to Proxima b and returns | a tier 13 tank, or the motor at tier 6 (orchestrator decision) | A8, B1 |
| **S0-3** | A datapack override of `gcyr:proxima_centauri_b` adds `grindless:proxima_b_orbit` (void, sky renderer) and keeps the surface, its tier and its id | the astrometer and the gate's far end go on the surface | B1, B7 |
| **S0-4** | A seventh and an eighth `more` row in `tables/stations.json` deploy two stations that keep across a disk save | escalation: `lib/stations.js` changes in F2 | F2, B1 |
| **S0-5** | A UHV SMES cell of about 62.9 G is stored and reported; tier 9 hatches register with the per-window cap; the table accepts `grindless:nuclear_clock` as a link | the cell is the largest safe value, recorded; the link becomes a GTM item | A9 |
| **S0-6** | `G.generatorMultiblock` accepts item catalysts that wear (an output of worn segments) and a fluid fuel at 2 to 8.4 M EU/t, not doubled; the Mk3's oganesson rate as loaded | segments wear as a consumed input with a refurbished return; krypton becomes the main fuel | B3 |
| **S0-7** | A server-side call teleports a player standing in a formed ring to the paired dimension while a recipe runs; the wireless network reaches a dimension with no planet pair | the gate is AE2 only; the rocket carries players | B7, B4 |
| **S0-8** | GTCA's space elevator and assembler module form and run a KubeJS recipe with `highTierContent` off; their ids and recipe types | the elevator stays hidden; the ribbon becomes a gate item | A7, F2 |
| **S0-9** | Proxima b's atmosphere, temperature and gravity as GCYR loads them | figures recorded; the site rules keep "no combustion, sealed machines" | B1, B4 |

Order: S0-1 first (it fixes F1's list), then S0-2, S0-3 and S0-4 (they fix B1), then S0-5, S0-6, S0-7, S0-8 and S0-9.

### Foundation (serial)

#### F1. Registrations

- **Objective:** every UHV material, item and shared block that more than one package uses exists, with names and textures and no recipe.
- **`<name>`:** `foundation`.
- **What:**
  - materials and fluids missing from S0-1's dump: berkelium-249, californium-252, nickel-62, nickel-63, thorium-229, zirconia, ZrB₂, InP, niobium oxide, lead fluoride, the Proxima liquors, ultrapure water, sterilised medium, HDEHP, PBO dope, oganesson propellant, the deuterium-enriched water;
  - items made by one package and used by another: HFIR driver elements and targets, the Cf-252 source, the nuclear clock, the crystals and wafers, the QCL, the SiC power module and mirror blank, the IMM and red-tuned arrays, the betavoltaic cell, the C-12 spreader, the positron and antihydrogen cartridges, the exotic matter cell, the ZBLAN fibre, PBO fibre, the ribbon and climber, the UHTC tile and nozzle, the ICAN motor, the organoid processor, the Proxima samples, strains, genome data, ice core and regolith, the chitosan scaffold, the radioprotectant, the reflector film, the swarm segment and its worn form, the coronal field map, the chart, the gate seed, the UHV cell;
  - shared blocks: the BSL-4 casing (12, 27, 28), the gate casing (18, built twice), the hangar casing (24, 26), and a UHV casing if S0-1 finds none to use.
- **Allowed:** the common set, plus `startup_scripts/grindless/uhv/foundation.js`, `client_scripts/grindless/uhv_foundation_lang.js`, `tools/assets/Build-UHVFoundationTextures.ps1` and its outputs.
- **References:** *Our multiblocks* (the audit, `uhv.md:187`) and each machine's *Recipes*; pattern `startup_scripts/grindless/uv/foundation.js` and `tools/analysis/test/uv-foundation.test.mjs`.
- **Depends on:** S0-1, S0-2 (the motor's id).
- **Invariants:** no recipe and no machine; ids exactly as in this file (a changed id is an escalation).
- **Acceptance:** every cross-package id is registered once, with `en_us` and `es_es`, and listed by `emi-coverage.mjs` as expected-unobtained until its package.
- **Tests:** T0; `tools/analysis/test/uhv-foundation.test.mjs`. T1: none.
- **Commits:** 2 (registrations; textures).
- **Serial:** alone; every other package depends on it.

#### F2. Integrator step

- **Objective:**
  - `hidden_until.json`: GTCA's elevator miner, pump and assembler modules (`gtca:space_assembler_mki/ii/iii`) move to `until: uev`, and GTCA's test recipes `gtceu:space_miner/ha` and `gtceu:space_pump/test` are removed; `gtnn:optical_processor` and `gtnn:optical_assembly` move from `never` to `uhv`; UHV's new ids get their substages;
  - `lib/stations.js` changes only if S0-4 failed.
- **Allowed:** `pack/kubejs/data/grindless/tables/hidden_until.json`; `pack/kubejs/startup_scripts/grindless/lib/stations.js` only after a failed S0-4.
- **References:** *Only from there, and cuts* (`uhv.md:151`); *Save compatibility*; `docs/eras/uv.md:1222-1231` (UV's F2).
- **Acceptance:** the miner, pump and assembler modules stay hidden in a UHV game; the two GT-- circuits appear at `uhv`; with S0-4 passed, no lib change.
- **Tests:** T0. T1: none.
- **Commits:** 1. The integrator runs it; it may overlap wave A.

### Wave A: home and Earth orbit

Wave A packages depend on F1 plus the spikes named. They run two at a time, in the pairs of *Parallel and serial*.

#### A1. Transcurium

- **Objective:** machines 1 (high flux reactor) and 2 (transuranium facility, with its decay store); line 25 (the oxo route to HDEHP and POCl₃, as GTM chemical reactor rows); the fuel fabrication plant's U-233 driver row; the hot cell's nickel-62 row; the pyroprocessing cell's spent-driver row.
- **`<name>`:** `transcurium`.
- **Allowed (extra):**
  - `server_scripts/grindless/iv/uranium_cycle.js` (the fuel fabrication plant's one row);
  - `pack/kubejs/data/grindless/tables/hot_cell.json` (one row);
  - `server_scripts/grindless/uv/thorium.js` (the pyroprocessing cell's one row).
- **References:** machines 1–2 (`uhv.md:232`, `uhv.md:252`); *Older machines, new modes* (`uhv.md:650`); lines 1, 2, 3 and 25 (*New process lines*, `uhv.md:784`). Patterns: `startup_scripts/grindless/uv/thorium.js:64` (a UV machine through the helper), `server_scripts/grindless/zpm/actinides.js` (actinide rows), ZPM's silicon-28 row in `tables/hot_cell.json`.
- **Depends on:** F1, S0-1.
- **Invariants:** curium returns to the next target; fission products go to synroc; the decay store's time is real ingrowth, not inflated difficulty.
- **Acceptance:** Bk-249 and Cf-252 come only from the facility; U-233 closes its loop (driver → spent → pyroprocessing → U-233); Th-229 comes only from the decay store; HDEHP's spent solvent returns phosphoric acid.
- **Tests:** T0; recipe lookup only (proof reuse). T1: none.
- **Commits:** 2 (machines; older rows).

#### A2. Clock and crystals

- **Objective:** machines 3 (nuclear clock lab) and 4 (crystal growth furnace, with the iridium crucible's wear).
- **`<name>`:** `crystals`.
- **References:** machines 3–4 (`uhv.md:272`, `uhv.md:287`); lines 3, 7 and 8. Pattern `startup_scripts/grindless/uv/detectors.js:160` (the zone refining tower).
- **Depends on:** F1, A1 merged (thorium-229).
- **Acceptance:** the nuclear clock comes only from the lab; the crucible returns to EV's platinum plant when worn; the five boules each have their own circuit.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 2.

#### A3. Water and betavoltaics

- **Objective:** machines 10 (ultrapure water plant) and 9 (betavoltaic fab); the diamond lattice fab's c5 (diodes) and c6 (C-12 spreader) rows; the isotope column's ¹²CO row; the methanation row (line 22).
- **`<name>`:** `betavoltaics`.
- **Allowed (extra):**
  - `startup_scripts/grindless/zpm/qubits.js` and `server_scripts/grindless/zpm/qubits.js` (the diamond lattice fab's two rows only);
  - `server_scripts/grindless/zpm/saturn_siphon.js` (the isotope column's one row).
- **References:** machines 9–10 (`uhv.md:368`, `uhv.md:380`); lines 4, 11 and 22; *Older machines*. Pattern `server_scripts/grindless/zpm/qubits.js` (its existing rows).
- **Depends on:** F1, A1 merged (nickel-63).
- **Acceptance:** ultrapure water comes only from the plant; the betavoltaic cell holds nickel-63 on diamond diodes; ¹³CO keeps its ZPM use.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 2.

#### A4. Photonics

- **Objective:** machines 5 (MBE reactor) and 6 (photonic foundry, c1–c6, including GT--'s optical processor and assembly); the ion implanter's helium smart-cut and SiC aluminium rows; line 6's GST target row.
- **`<name>`:** `photonics`.
- **Allowed (extra):** `startup_scripts/grindless/zpm/qubits.js` and `server_scripts/grindless/zpm/qubits.js` (the ion implanter's two rows only, after A3).
- **References:** machines 5–6 (`uhv.md:308`, `uhv.md:320`); lines 5, 6, 7 and 9; pattern `startup_scripts/grindless/uv/photonics.js:186`. S0-1 (the gtnn ids).
- **Depends on:** F1, A2 and A3 merged (boules, ultrapure water; `zpm/qubits.js`).
- **Invariants:** GT--'s computer and mainframe stay hidden.
- **Acceptance:** the optical processor and assembly come only from the foundry; every foundry recipe takes ultrapure water.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 2.

#### A5. Power devices and photovoltaics

- **Objective:** machines 7 (SiC device fab, c1–c5) and 8 (solar array fab, c1–c3); the MOCVD reactor's IMM and NbN rows.
- **`<name>`:** `power_devices`.
- **Allowed (extra):** `server_scripts/grindless/uv/photonics.js` (the MOCVD reactor's two rows).
- **References:** machines 7–8 (`uhv.md:340`, `uhv.md:355`); lines 10 and 21; pattern `startup_scripts/grindless/uv/photonics.js:187` (the MOCVD reactor).
- **Depends on:** F1, A4 merged (the SiC implant row).
- **Acceptance:** SiC power modules and mirror blanks come only from the fab; the IMM lift-off returns the GaAs substrate.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 2.

#### A6. Antimatter and Casimir

- **Objective:** machines 13 (positron accumulator) and 17 (Casimir array); the synchrotron's sodium-22 row, the antimatter trap's antihydrogen row, the cryogenic plant's 99.999 % neon row.
- **`<name>`:** `antimatter`.
- **Allowed (extra):**
  - `server_scripts/grindless/uv/accelerators.js` (the synchrotron's and the trap's rows);
  - `server_scripts/grindless/ev/cryogenic_plant.js` (one row; B3 adds the second later).
- **References:** machines 13 and 17 (`uhv.md:419`, `uhv.md:471`); lines 27 and 28; patterns `startup_scripts/grindless/uv/accelerators.js:72` and `:95`.
- **Depends on:** F1, A5 merged (NbN-coated plates).
- **Invariants:** the Casimir array is labelled fiction in EMI (`emi_info` row in its own lang file).
- **Acceptance:** antihydrogen comes only from the trap with a positron cartridge; exotic matter only from the array.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 2.

#### A7. Fibres and the elevator

- **Objective:** machines 14 (PBO plant) and 15 (tether ribbon works); line 24's GTM chemical reactor rows (1,2,3-trichlorobenzene); recipes for GTCA's space elevator (type `gtceu:space_elevator`; S0-8: it forms as `SpaceElevatorMachine` and runs a KubeJS recipe; GTCA's assembler modules are dropped).
- **`<name>`:** `elevator`.
- **References:** machines 14–15 (`uhv.md:431`, `uhv.md:445`); line 24; *Route* step 8 (`uhv.md:41`); S0-8.
- **Depends on:** F1, S0-8.
- **Invariants:** the miner, pump and assembler modules get no recipe.
- **Acceptance:** PBO comes only from the plant; the elevator forms with a ribbon and a climber and runs its own recipe.
- **Tests:** T0; T1: `gg_test_uhv_elevator` in the band the integrator assigns. Doubt: a GTCA machine with our recipe and `highTierContent` off (S0-8's mechanism with the real recipe).
- **Commits:** 2.

#### A8. Ceramics and the level 8 rocket

- **Objective:** machine 16 (spark plasma sinterer); line 26's ZrB₂ row; the thruster works' ICAN motor and oganesson pod rows; the motor as a GCYR tier 6 motor registered with `createCustom` (`RocketMotorBlock` and its own motor type; reference `tools/test/uhv-s0/kubejs/startup_scripts/gg_test_uhv_s0_parts.js`).
- **`<name>`:** `propulsion`.
- **Allowed (extra):** `server_scripts/grindless/uv/propulsion.js` (the thruster works' two rows).
- **References:** machine 16 (`uhv.md:457`); *Route* step 6 (`uhv.md:41`); line 26; UV-A11's contract (`docs/eras/uv.md:1369`; `uv/propulsion.js` lands with UV-A11, so A8 starts after it merges); S0-2.
- **Depends on:** F1, S0-2, A5 merged (SiC power modules).
- **Acceptance:** a level 8 rocket builds from the ICAN motor and the tier 11 tank and reaches Proxima b.
- **Tests:** T0; T1: `gg_test_uhv_propulsion` in the band the integrator assigns. Doubt: the motor's tier in the real recipe.
- **Commits:** 2.

#### A9. The UHV network

- **Objective:** the UHV wireless tier (hatches, covers, the UHV cell, the nuclear clock as link); the naquadria magnet works' c5; the powder-in-tube line's RTAN row.
- **`<name>`:** `wireless`.
- **Allowed (extra):**
  - `pack/kubejs/data/grindless/tables/wireless_energy.json` (one row);
  - `startup_scripts/grindless/zpm/magnet_works.js`, `server_scripts/grindless/zpm/magnet_works.js` and `tables/magnet_works.json` (the c5 row);
  - `server_scripts/grindless/uv/materials.js` (the PIT line's RTAN row; B2 adds MgB₂ later).
- **References:** *Power* (`uhv.md:725`); line 29; UV-A9's contract (`docs/eras/uv.md:1345-1356`); `startup_scripts/grindless/lv/wireless_energy.js`; S0-5.
- **Depends on:** F1, S0-5, A2 merged (the nuclear clock).
- **Acceptance:** the network goes UHV only when every formed tower holds UHV cells; hatches keep the per-window cap; the clock is the link.
- **Tests:** T0; T1: `gg_test_uhv_wireless` in the band the integrator assigns. Doubt: the cell's capacity and the jump with tier 9 hatches.
- **Commits:** 2.

#### A10. ZBLAN

- **Objective:** machine 19 (ZBLAN draw tower, Earth orbit); line 31's ZrF₄ row.
- **`<name>`:** `zblan`.
- **References:** machine 19 (`uhv.md:497`); line 31; pattern `startup_scripts/grindless/uv/photonics.js:186` (the fibre draw tower).
- **Depends on:** F1.
- **Acceptance:** ZBLAN fibre is drawn only in Earth orbit; HF returns to the fluorspar kiln.
- **Tests:** T0; recipe lookup and the orbit allowlist (proof reuse). T1: none.
- **Commits:** 1.

### Wave B: Mercury and Proxima b

#### B1. Travel and stations

- **Objective:**
  - the Proxima b orbit (override, dimension, sky renderer);
  - two `more` station slots (Mercury orbit, Proxima b orbit: the 5th and 6th `more` rows, the 7th and 8th slots);
  - the AE2 seeds for Mercury orbit; `sunlight.json` rows; the lunar solar field's Proxima b row.
- **`<name>`:** `travel`.
- **Allowed (extra):**
  - `data/gcyr/gcyr/planets/proxima_centauri_b.json` (S0-3's path; it replaces the pack's `orbit_world` `gcyr:proxima_centauri_b_orbit`, which doesn't exist), `data/grindless/dimension/proxima_b_orbit.json`, `dimension_type/` (1);
  - `tables/planets.json`, `tables/orbits.json`, `tables/places.json`, `tables/stations.json`, `tables/sunlight.json` (UHV rows only);
  - `server_scripts/grindless/ev/lunar_power_and_antenna.js` (the Proxima row);
  - `pack/kubejs/client_scripts/grindless/emi_info_lang.js` (UHV travel rows).
- **References:** *Places and site rules* (`uhv.md:89`), *Sunlight* (`uhv.md:111`), *Bridges* (`uhv.md:124`), *AE2* (`uhv.md:777`); UV-B1 (`docs/eras/uv.md:1392-1408`); S0-2, S0-3, S0-4, S0-9.
- **Depends on:** F1, A8 merged (the level 8 rocket), S0-2 to S0-4, S0-9.
- **Invariants:** no existing dimension id changes; `gcyr:proxima_centauri_b` keeps its id and tier; gravity is never claimed.
- **Acceptance:** level 8 reaches Proxima b orbit and surface; both stations deploy and keep across a disk save; older stations are unchanged.
- **Tests:** T0; T1: `gg_test_uhv_travel` in the band the integrator assigns. Doubt: the override and stations seven and eight.
- **Commits:** 2.
- **Serial:** alone.

#### B2. Mercury's ground

- **Objective:** machines 20 (regolith excavator, drill step 12) and 21 (solar vapour furnace); the electrolyser's alumina–calcia row; the PIT line's MgB₂ row (line 20).
- **`<name>`:** `mercury`.
- **Allowed (extra):** `server_scripts/grindless/uv/materials.js` (one row, after A9's).
- **References:** machines 20–21 (`uhv.md:509`, `uhv.md:519`); lines 19 and 20; IV's Mercury site (`docs/eras/iv.md:32-50`); pattern `server_scripts/grindless/iv/mercury.js`.
- **Depends on:** B1, A9 merged.
- **Invariants:** the furnace runs on Mercury's day side only and makes no osmium or iridium (`docs/eras/iv.md:159`).
- **Acceptance:** Mercury regolith comes only from the excavator; aluminium reaches the light sail fab's reflector row.
- **Tests:** T0; recipe lookup and the daylight rule (proof reuse: IV's Mercury rule). T1: none.
- **Commits:** 2.

#### B3. The swarm

- **Objective:** machines 22 (swarm segment foundry), 23 (swarm control station, generator) and 24 (solar probe bay); the light sail fab's reflector row; the cryogenic plant's oganesson row (line 30).
- **`<name>`:** `swarm`.
- **Allowed (extra):**
  - `server_scripts/grindless/uv/starshot.js` (the light sail fab's one row);
  - `server_scripts/grindless/ev/cryogenic_plant.js` (one row, after A6's).
- **References:** machines 22–24 (`uhv.md:535`, `uhv.md:547`, `uhv.md:560`); *Power* (`uhv.md:725`); lines 23 and 30; pattern UV's written-final generators (`startup_scripts/grindless/uv/thorium.js:75`); S0-6.
- **Depends on:** B2, A3, A5 and A6 merged.
- **Invariants:** the station's figure is final and not doubled; each run wears segments; GCYR's swarm items stay hidden; the dynamo holds 8,388,608 EU/t (S0-6: `lib` `dynamoCapacity` at parallel 1 is exactly that; check the hatch amperage).
- **Acceptance:** a c2 run gives 8,388,608 EU/t into the network, consumes 400 mB oganesson and returns 4 worn segments; the foundry refurbishes them.
- **Tests:** T0; T1: `gg_test_uhv_swarm` in the band the integrator assigns. Doubt: a generator whose catalysts wear into an output, at its final figure.
- **Commits:** 2.

#### B4. Proxima life

- **Objective:** machines 26 (xenoflora rover bay), 27 (xenobotany greenhouse, greenhouse step 8), 28 (xenobiochemistry plant), 30 (radiotrophic vat) and 12 (sample receiving facility, on Earth); the biofoundry's xeno rows (genes, the four cultures, the far-red cassette); the algae bioreactor's Proxima mode; line 15's composite and panel rows.
- **`<name>`:** `proxima_life`.
- **Allowed (extra):**
  - `pack/kubejs/data/grindless/tables/biofoundry.json` (UHV rows);
  - `server_scripts/grindless/luv/europa.js` (the algae bioreactor's Proxima row).
- **References:** machines 12, 26–28 and 30 (`uhv.md:405`, `uhv.md:580`, `uhv.md:590`, `uhv.md:604`, `uhv.md:627`); lines 13, 14, 15 and 32; pattern `startup_scripts/grindless/uv/life.js:197` (the ark biosphere); S0-9.
- **Depends on:** B1.
- **Acceptance:** Proxima samples come only from the rover; the sample receiving facility is the only path from a sample to Earth; the algae bioreactor's far-red row runs only on Proxima b.
- **Tests:** T0; recipe lookup and the Proxima allowlists (proof reuse). T1: none.
- **Commits:** 2 (machines; older rows).

#### B5. Proxima ground

- **Objective:** machines 29 (cold-trap drill, drill step 13) and 31 (biomining heap); the platinum plant's, heavy water plant's, extraction cascade's, regolith cell's and tholin reformer's Proxima rows.
- **`<name>`:** `proxima_ground`.
- **Allowed (extra):**
  - `server_scripts/grindless/ev/platinum_plant.js`, `server_scripts/grindless/ev/extraction_cascade.js`, `server_scripts/grindless/ev/regolith_cell.js` (one row each);
  - `pack/kubejs/data/grindless/tables/heavy_water_plant.json` (one row);
  - `server_scripts/grindless/zpm/titan_probes.js` (the tholin reformer's one row).
- **References:** machines 29 and 31 (`uhv.md:617`, `uhv.md:637`); lines 16, 17 and 18; pattern `server_scripts/grindless/uv/` drill steps (UV-B3's penetrator).
- **Depends on:** B4 merged (the cultures).
- **Acceptance:** Proxima PGM and REE liquors come only from the heap; deuterium-rich water only from the cold-trap ice; the tailings reach the regolith cell on the Moon by AE2.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 2.

#### B6. Wetware

- **Objective:** machine 11 (organoid array); the organoid lab's sterilised medium row.
- **`<name>`:** `organoids`.
- **Allowed (extra):** `server_scripts/grindless/luv/orbital_biology.js` (one row).
- **References:** machine 11 (`uhv.md:390`); line 12; pattern `startup_scripts/grindless/uv/life.js:198` (the neural culture vat).
- **Depends on:** B4 and A4 merged (the chitosan scaffold, the optical assembly).
- **Invariants:** GTM's wetware recipe stays.
- **Acceptance:** the array makes four wetware mainframes per run from organoid processors.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 1.

#### B7. The gate and the edge

- **Objective:** machines 18 (warp gate, both ends) and 25 (baseline astrometer, observatory step 9); the AE2 Proxima seed; the UEV casing's research with the chart.
- **`<name>`:** `gate`.
- **References:** machines 18 and 25 (`uhv.md:483`, `uhv.md:570`); *Gate to UEV*; *AE2* (`uhv.md:777`); UV-B5 (`docs/eras/uv.md:1444-1456`); S0-7.
- **Depends on:** B6, A6 and A10 merged.
- **Invariants:** GTM's UEV casing keeps its id; only our recipe and research are added.
- **Acceptance:** the chart comes only from Proxima orbit; c1 makes the gate seed; c2 holds 16 A UHV for 60 s; a player in the ring crosses (if S0-7 passed).
- **Tests:** T0; T1: `gg_test_uhv_gate` in the band the integrator assigns. Doubt: the player transit and the c2 load.
- **Commits:** 2.

### Wave C

#### C1. Validator (`-Tier uhv`)

- **Objective:** `tools/analysis/tiers/uhv.json` with substages `uhv`, `uhv-mercury` and `uhv-proxima`, the checks in *Validator*, and the re-count of the lines' arrows and the crossings.
- **Allowed:** `tools/analysis/tiers/uhv.json` (new), `tools/analysis/test/uhv-validator.test.mjs`, `tools/analysis/tiers/obtain.json` (UHV rows only).
- **References:** *Validator*, *Gate to UEV*, *New process lines*; pattern `tools/analysis/tiers/uv.json` (UV-C1; `zpm.json` until it lands).
- **Depends on:** every A and B package merged.
- **Acceptance:** the validator passes on the integrated pack. It fails on planted cases: berkelium outside the facility, a UEV item in a UHV recipe, a Proxima product before `uhv-proxima`, and a doubled swarm station.
- **Tests:** T0. **Commits:** 1.

#### C2. Quests

- **Objective:** the chapter *UHV — Proxima and the Swarm* and the UHV rows of the processing-line and power chapters, as data.
- **Allowed:** `tools/quests/uhv-chapter/` (new, from UV-C2's `uv-chapter`, or `zpm-chapter` if UV-C2 has not landed), `tools/quests/processing-lines/pl-data-uhv.mjs` (new), `tools/quests/processing-lines/power-data.mjs` (UHV rows), `GG_QUESTS_EXPECTED` in `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js`.
- **Prohibited (extra):** every `.snbt` under `pack/config/ftbquests/`, `tools/quests/lint-config.json`.
- **References:** *Quests*; `docs/quests.md`; `.github/instructions/quests.instructions.md`.
- **Depends on:** every A and B package merged.
- **Acceptance:** `node tools/quests/lint.mjs` with 0 errors and 0 warnings; the Casimir and oganesson quests state the fiction and the caveat.
- **Tests:** T0. **Commits:** 1.

#### C3. Integrated validation

- **Objective:** one run with every package, all eight stations and the Proxima base loaded, a v0.10.0 save, and the release notes.
- **Allowed:** `tools/test/overlay/kubejs/server_scripts/gg_test_uhv_c3.js`, its zones row, the release notes file the integrator names.
- **References:** *Save compatibility*, *Gate to UEV*, *Power* (the gate example); pattern `gg_test_uv_c3.js`.
- **Depends on:** C1, C2 and the integrator's regeneration (index, `hidden_until.json`, chapters, `emi-coverage --expect`).
- **Acceptance:**
  - the gate example runs (35,320,455 EU/t or more into the bank, 33,554,432 out for 60 s);
  - a v0.10.0 save opens with its stations, network and machines, and one save and reopen is reported;
  - the validator, the Node suite, `gg_test_recipe_lookup` and the quest tests pass.
- **Tests:** T0; T2 by the integrator in its band. **Commits:** 1. **Then v0.11.0.**

### Parallel and serial

At most two implementation workers at a time; one bench JVM.

| Step | Packages | How | Why |
|---|---|---|---|
| 1 | S0-1, then S0-2 … S0-9 | serial | one JVM; they fix ids |
| 2 | F1 | serial, alone | everything reads its ids |
| 3 | F2 | integrator; may overlap step 4 | `hidden_until.json` only |
| 4 | A1 ‖ A10, then A2 ‖ A3, then A4 ‖ A7, then A5 ‖ A9, then A6 ‖ A8 | two at a time | disjoint files: uranium cycle, hot cell table and `uv/thorium.js` A1; `zpm/qubits.js` A3 then A4; `uv/photonics.js` A5 (after A4); `uv/accelerators.js` and the cryogenic plant A6 (after A5); wireless table, magnet works and `uv/materials.js` A9 (after A2); `uv/propulsion.js` A8 (after A5) |
| 5 | B1 | serial, alone | travel, station, place and sunlight tables, the lunar solar field, `emi_info_lang.js` |
| 6 | B2 ‖ B4, then B3 ‖ B5, then B6, then B7 | two at a time | B2 owns `uv/materials.js` after A9; B4 owns the biofoundry table and `luv/europa.js`; B3 needs B2's aluminium and A6's cryogenic row; B5 needs B4's cultures; B6 needs B4's scaffold; B7 needs B6's organoid processor |
| 7 | C1, then C2 | serial | they read every final id |
| 8 | C3 | integrator | the batch's one T2 |

The `tools/assets/README.md` and `zones.json` rows are appended by parallel packages; the integrator resolves those one-line merges.

**Every cut lands with its replacement:**
- the elevator's miner and pump `until` move (F2) lands before the elevator's recipes (A7);
- GT--'s two optical circuits unhide (F2) in the same batch as the foundry that makes them (A4);
- the UEV casing's research (B7) lands with the astrometer that makes the chart.

## Decisions proposed (architect; for the orchestrator)
## Decisions (accepted by the orchestrator, 2026-10-27; recorded in `DECISIONS.md`)
The design above follows these. None is in `DECISIONS.md` yet; the orchestrator accepts, changes or rejects each. Each line is in the `DECISIONS.md` form.
All eleven were accepted as proposed, with the architect's recommended answers to the open questions (high-tier content off, no Mk4 until UEV, our Dyson swarm, gate = AE2 seed + player transit, GTCA elevator with our recipes, landing on Proxima b, gtnn optical unhidden, ICAN motor as GCYR tier 5, 31 machines). After S0 (2026-10-27): the ICAN motor is tier 6 and GTCA's assembler modules are dropped (`docs/research/uhv-s0.md`).
1. `- 2026-10-27 · UHV size: 31 progression machines (~42 guided; growth went into lines), 32 new lines (avg 7.0 steps, none under 6), 40 crossings two or more eras back; no padding.`
2. `- 2026-10-27 · UHV route: level 8 = GCYR motor tier 6 (our ICAN motor, createCustom; S0-2) + UV's tier 11 tank; Proxima b (tier 8) gains an orbit dimension grindless:proxima_b_orbit by override; stations 7 (Mercury orbit) and 8 (Proxima b orbit).`
3. `- 2026-10-27 · UHV highTierContent stays off; GTM's UEV casing (registered without recipe) is the gate's research item; UEV hulls and hatches are UEV's first decision.`
4. `- 2026-10-27 · UHV Dyson swarm is ours (swarm control station, written final, 2.1 M / 8.4 M EU/t, segments wear, oganesson or krypton fuel); GCYR's swarm items stay hidden.`
5. `- 2026-10-27 · UHV wireless: UHV cell ~62.9 G from the magnet works c5 with RTAN wire; the nuclear clock is the UHV link, the gravi star stays UV's.`
6. `- 2026-10-27 · UHV warp gate: an AE2 seed for Proxima plus player transit while sustained; no item teleport; Casimir exotic matter is named fiction.`
7. `- 2026-10-27 · UHV uses GTCA's space elevator with our recipes; its assembler (S0-8: doesn't form with buses), miner and pump modules move to until: uev.`
8. `- 2026-10-27 · UHV unhides gtnn:optical_processor and gtnn:optical_assembly (our recipes); GT--'s optical computer and mainframe stay hidden.`
9. `- 2026-10-27 · UHV Mk3 keeps oganesson (line 30); no fourth fusion ring until UEV (registerFusionTier, Monifactory's LGPL pattern).`
10. `- 2026-10-27 · UHV nickel-62 is a hot cell row (IV's enrichment cascade stayed a reserve); the platinum plant rows are EV's.`
11. `- 2026-10-27 · UHV substages: uhv, then uhv-mercury and uhv-proxima in parallel; the gate needs both.`

## Components (TP-C)

- `gtceu:uhv_<family>` (nine): assembly line, station research of the UV part, 491,520 EU/t, UHV materials (`data/grindless/tables/uhv_components.json`, `server_scripts/grindless/uhv/components.js`).
- Fluid regulators UHV-UXV: assembler, the tier's pump plus its circuits, at VA of the tier below.
- UEV-UXV components are raised to VA of the tier below and take the tier below's same part.
- UHV basic machines, laser hatches and muffler hatch, the UEV-UXV 4x/9x hatches, quantum chests and tanks, and the UXV circuit assembler and scanner (`#gtceu:circuits/uxv`): assembly lines in `integration/high_tier_machines.js`, researched on the tier below's same machine. The rotor holders stay held.
