# UV (T8): Pluto, the Kuiper Belt and the first probe to another star

UV leaves the planets behind. Neptune's orbit and Pluto's orbit become the fifth and sixth stations. Probes fall into Pluto's ice and catch a Kuiper Belt object on the way out. A gram-scale probe is pushed toward Proxima Centauri by a laser on the Moon.

At home, the era is accelerators and isotopes:
- a synchrotron;
- an accelerator-driven thorium reactor;
- a muon-catalysed fusion cell;
- a laser fusion chamber burning boron-11;
- GTM's third fusion ring (the Mk3), with americium and neutronium.

The network goes UV on the gravi star.

**Size (rule 7, and the user's 2026-10-27 direction: "much more, above all processing lines"):** the targets are a guideline, not a quota. No machine or line was added to hit a number.

| | ZPM (as built) | UV (this design) | Growth | Guideline |
|---|---|---|---|---|
| Progression multiblocks | 27 | **31** | ×1.15 | about 36 (×1.35) |
| New process lines | 14 | **22** | ×1.57 | about 21 (×1.5) |
| Steps per line, average (items between arrows, counted the same way for both eras) | 4.6 | **6.9** (none under 5) | ×1.5 | at least 4 each, average at least ZPM's |
| Crossings with lines two or more eras back | 13 | **24** | ×1.85 | about 20 (×1.5) |

- **Why 31 and not 36:** UV's growth goes into lines and crossings, as the user asked. The five or so machines that would close the gap were each either a convenience version of something that exists or a second machine for one chain:
  - a COLEX lithium cascade (tritium already comes from IV);
  - an MHD generator (the ZPM direct energy converter's job);
  - an oganesson cyclotron (oganesson has no use before UHV);
  - a polymer train for PBI (the ZPM tholin reformer already makes its diaminobenzidine);
  - a dilution refrigerator (the ZPM qubit fab already runs a He-3 fridge);
  - a lunar far-side radio array (a second machine for one observation);
  - a Charon lander apart from Pluto's penetrator.

  They are listed under *Considered and dropped*.
- **`docs/research/complexity.md:105` is superseded.** Its UV row ("4-6 lines", "≥8") predates ZPM as built. This document's table is UV's target.
- **The UV era in four sentences:**
  1. Neutronium comes from the Mk3 fed by plutonium-241, and the gravi star turns the network UV.
  2. Thorium, boron-11, deuterium–tritium and americium become power, each in a plant with its own chain.
  3. Neptune gives helium-3, deuterium and nitrogen-15; Pluto and Charon give ices; a Kuiper Belt object gives noble gases.
  4. Fibre lasers, diodes, a nanometre sail and a gram-scale chip make the Starshot. Its telemetry from Proxima's approach is the key to UHV, where the arrival is.

## Route

1. **The Mk3** (`gtceu:uv_fusion_reactor`, GTM's recipe):
   - it needs 4 UHV circuits (GTM's wetware mainframe), a quantum star, an americium double plate, 128 UHPIC and 32 EnTED wires;
   - its 16 UV hatches start 640 M;
   - the wetware is made cheaper by the neural culture vat (20), and the UHPIC by the synchrotron's X-ray lithography (7).
2. **The americium loop** (line 1):
   - plutonium-241 from IV's plutonium centrifuge goes into the Mk3 → americium plasma → plasma turbine → americium;
   - americium + naquadah in the Mk3 → **neutronium** → the gravi star → the UV wireless tier.
3. **Accelerators** (lines 13, 18, 22):
   - superfluid helium (5) and SRF cavities (6) build cryomodules;
   - cryomodules build the synchrotron (antiprotons, X-ray lithography), the accelerator-driven reactor and the muon fusion cell.
4. **Power plants:**
   - the accelerator-driven reactor burns IV's stored thorium (line 2);
   - the muon fusion cell burns IV's deuterium and tritium (line 5);
   - the laser fusion chamber burns boron-11 capsules (line 6).

   Each is written at its final figure.
5. **Photonics** (lines 8, 9, 10, 21):
   - Yb-doped fibre (fibre draw tower) pumped by InGaAs diodes (MOCVD reactor);
   - high-purity germanium (zone refining tower);
   - superconducting nanowire detectors for the optical ground station.
6. **Materials** (lines 11, 14, 15):
   - boron nitride nanotubes;
   - EnTED wire by powder-in-tube;
   - UV parts printed from atomised powder.
7. **Neptune orbit, the fifth station** (substage `uv-neptune`):
   - the level 6 rocket already reaches tier 6, so the new step is the station;
   - the deep siphon (drill step 10) gives HD-rich hydrogen and Neptune helium (He-3);
   - the Triton geyser sampler gives nitrogen-15-rich nitrogen and the Triton ice core.
8. **Level 7 rocket:**
   - the BNNT cryotank (`grindless:bnnt_fuel_tank`, tier 11, from the cryotank winder) with an elite motor gives level 7: floor((3 + 11) / 2) = 7;
   - the Pluto–Kuiper chart (ZPM) is the winder's catalyst.
9. **Pluto orbit, the sixth station** (substage `uv-pluto`):
   - the penetrator probe bay (drill step 11) takes the Sputnik Planitia and Charon cores; the ice fractionator splits them;
   - the Kuiper interceptor bay brings a planetesimal back, and the amorphous ice annealer releases its krypton and xenon;
   - the precursor probe bay flies to the heliopause;
   - the event horizon interferometer (observatory step 8) uses Pluto's baseline.
10. **The Starshot:**
    - sail film (Earth orbit), starchip (Earth) → laser sail launcher (the Moon) → probe in flight;
    - the optical ground station decodes its telemetry → **Proxima approach data**, the key item of the gate to UHV.

## Inherited as built

- **From ZPM:**
  - the Mk2 and its audit; the large naquadah reactor (re-registered with duranium frames);
  - the naquadria refinery, the fuel works, the europium reductor;
  - the waste retrieval and partitioning plants: americium; curium as `grindless:curium_oxide`, stored;
  - the magnet works (URhNq₂, ZPM cells);
  - the quench caster, the direct energy converter;
  - the pyrolyser (graphene; `grindless:carbon_nanotube_yarn`, kept for UV);
  - the diamond lattice fab, the ion implanter (NV diamond), the qubit fab (He-3 fridge);
  - the vent bioreactor (archaeal culture), the aerogel works, the neutrino observatory, the deep space network, the Kuiper survey telescope;
  - Saturn's seven and Uranus's three station machines.
- **Charts and samples ZPM leaves:**
  - the Pluto–Kuiper chart;
  - the multimessenger catalogue, the solar-core survey;
  - the flyby's Neptune deep gas sample and Triton nitrogen.
- **Travel:**
  - level 6 rockets (aerogel tank, tier 9; `startup_scripts/grindless/zpm/travel.js:22-23`);
  - four stations (`tables/stations.json`, `lib/stations.js`);
  - planets Saturn tier 5, Uranus tier 6, Proxima b tier 8.
- **Power:**
  - the wireless network at ZPM (`tables/wireless_energy.json`, tier 7, link quantum star);
  - hatches capped at their rated amperage per window.
- **From IV and earlier, still running and still stored:**
  - IV's thorium from the pitchblende centrifuge (`docs/eras/iv.md:220`);
  - tritium (the tritium removal facility) and heavy water;
  - Pu-241 from the plutonium centrifuge (`iv.md:243`);
  - the hot cell's spare circuits;
  - Mercury's iridium (platinum plant mode 3);
  - Io's germanium and indium (`luv.md:57`);
  - MV gallium;
  - the EV cryogenic plant and the extraction cascade.

## Places and site rules

| Place | Dimension id | GCYR tier | Reached by | Role in UV |
|---|---|---|---|---|
| Earth | `minecraft:overworld` | — | — | 20 of the 31 machines |
| Earth orbit | as built | 1 | — | light sail fab, antimatter trap |
| The Moon | `gcyr:luna` | 1 | — | laser sail launcher |
| Neptune orbit | `grindless:neptune_orbit` (new) | 6 (planet `grindless:neptune`) | level 6 rocket (ZPM) | the fifth station: deep siphon, Triton geyser sampler |
| Pluto orbit | `grindless:pluto_orbit` (new) | 7 (planet `grindless:pluto`) | level 7 rocket (BNNT tank) | the sixth station: six machines |
| Triton, Charon, Arrokoth-like KBOs | none | — | probes | sample targets, never registered as places |
| Proxima Centauri b | as built | 8 | UHV | the Starshot's target; arrival in UHV |

- **Planet files:**
  - `data/grindless/gcyr/planets/neptune.json` and `pluto.json`;
  - `data/grindless/dimension/neptune.json`, `neptune_orbit.json`, `pluto.json`, `pluto_orbit.json`, as ZPM did for Saturn and Uranus.
  - The surface dimensions exist so GCYR's planet schema is whole; nothing in UV lands. Dimension ids never change afterwards.
- **Site rules:**
  - each station machine's controller accepts only its dimension (`G.dimensionLock`, the ZPM pattern);
  - the launcher only on `gcyr:luna`: no air, so no adaptive optics, and a long night is irrelevant to a network-fed array;
  - the light sail fab and the antimatter trap only in Earth orbit: microgravity for a 1 m², 100 nm film, and a vacuum better than any lab's for the trap;
  - everything else at home.
- **Why Neptune before Pluto:** the penetrator's catalyst is the Triton ice core. Triton is a captured Kuiper Belt object, Pluto's twin, so its core is the calibration for Pluto's ices. The validator orders the substages through that catalyst.

## Sunlight

| Place | Distance | Sunlight vs Earth orbit | Rows in `tables/sunlight.json` |
|---|---|---|---|
| Neptune orbit | 30.1 AU | 0.11 % | one row, so no solar machine builds by accident |
| Pluto orbit | 39.5 AU | 0.064 % | one row, as above |

Both stations draw from the wireless network. The precursor probe and the penetrator carry curium heat sources (line 4): that is the honest answer to no sunlight.

## Bridges and first arrivals

- **AE2 pairs:**
  - a Neptune orbit seed and a Pluto orbit seed, in ZPM's pattern (`tables/planets.json`, two pair tags);
  - each seed needs the place's first product as its catalyst (Neptune deep gas, the Sputnik ice core), so a pair follows the first automated run.
- **Station kits:**
  - the fifth and sixth slots come from `tables/stations.json` `more` (F2), proven for four slots in ZPM;
  - the kit needs a UV hull, so UV opens before Neptune.
- **First arrival:** nothing on either station is gathered by hand. The first siphon and penetrator runs use the station's starter charge from the kit: one scoop head, one penetrator body.

## Automatic resource generation

| Resource | Machine | Place | Catalyst (not consumed) |
|---|---|---|---|
| Neptune deep gas → HD-rich hydrogen, Neptune helium, methane | deep siphon (24) | Neptune orbit | the ZPM flyby's Neptune deep gas sample |
| Triton nitrogen (¹⁵N-rich), dark plume particles, Triton ice core | Triton geyser sampler (25) | Neptune orbit | the ZPM flyby's Triton nitrogen sample |
| Sputnik ice core, Charon core | penetrator probe bay (26) | Pluto orbit | the Triton ice core |
| Planetesimal sample | Kuiper interceptor bay (28) | Pluto orbit | the Pluto–Kuiper chart |
| Heliopause data | precursor probe bay (30) | Pluto orbit | — (the probe is spent) |
| Sgr A* image | event horizon interferometer (31) | Pluto orbit | the multimessenger catalogue |
| Antiprotons | synchrotron (7) → antimatter trap (22) | Earth, Earth orbit | — |
| Proxima approach data | optical ground station (12) | Earth | — |

Every item above is a recipe output. Nothing is mined by hand, and nothing comes from nothing: each run pays EU, a worn part or a spent probe.

## Only from there, and cuts

| Only from | What |
|---|---|
| Neptune orbit | Neptune helium (the UV He-3 source in bulk), HD-rich hydrogen, ¹⁵N-rich Triton nitrogen, the Triton ice core |
| Pluto orbit | the Sputnik ice core, the Charon core, the planetesimal sample, heliopause data, the Sgr A* image |
| Earth orbit | the sail film, trapped antiprotons |
| The Moon | the probe in flight |
| The Mk3 | americium plasma from Pu-241, neutronium, oganesson, iron and nickel plasma |

- **Cuts on Earth:** none new. Helium-3 left Earth in EV; Neptune adds a bulk source and does not replace the Moon's.
- **Naquadria:** the Mk3's enriched naquadah + radon → naquadria (400 M) is kept as GTM has it. ZPM's "naquadria only from the stored solution" was a ZPM rule while the Mk3 was out of reach. UV opens a second route that costs a Mk3 start. The validator moves the rule to "naquadria from the stored solution or the Mk3".

### The Mk3 audit (`tables/fusion_mk3.json`)

The pattern of ZPM's Mk2 audit (`docs/eras/zpm.md:184`). EU/t and ids come from the S0-8 dump; the starts are GTM's.

| GTM recipe (Mk3 only, start above 320 M) | Start | Fate |
|---|---|---|
| plutonium-241 + hydrogen → americium plasma | 500 M | **keep**: line 1, the americium loop |
| americium + naquadah → neutronium | 600 M | **keep**: line 1; neutronium is Mk3-only |
| oganesson | 600 M | keep as GTM has it; oganesson is a noble gas with no use before UHV: **voidable** (inert) |
| silicon + magnesium → iron plasma | 360 M | keep: plasma turbine fuel |
| enriched naquadah + radon → naquadria | 400 M | keep: the second naquadria route (above) |
| potassium + fluorine → nickel plasma | 480 M | keep: plasma turbine fuel |
| every Mk1 and Mk2 recipe | ≤ 320 M | as audited in LuV and ZPM |

- **Ours on the Mk3:** none. Our own fusion goes into the laser fusion chamber and the muon fusion cell, which are not tokamaks.
- **S0-4** proves a start of 640 M on 16 UV hatches (40 M each) and that the audit table loads.

## Our multiblocks

| Place | Count | Machines |
|---|---|---|
| Earth | 20 | 1–20 |
| Earth orbit | 2 | 21 light sail fab, 22 antimatter trap |
| The Moon | 1 | 23 laser sail launcher |
| Neptune orbit | 2 | 24 deep siphon, 25 Triton geyser sampler |
| Pluto orbit | 6 | 26–31 |
| **Total** | **31** | ZPM 27 → UV 31 |

**Not counted (rule 7):**
- GTM's Mk3, GTM's UV parallel hatches;
- the wireless tier and its hatches;
- older machines' new modes, the tier 11 tank;
- GCYR's rocket.

### Audit: the route only each one gives, its recipe keys, its output policy

The policies are LuV's and ZPM's (`docs/eras/zpm.md:264`): **kept**, **contained** and **voidable**. A **generator** is a GTM generator multiblock (`G.generatorMultiblock`, the ZPM direct energy converter's pattern). Its fuel is the recipe input, and its EU/t is written at the final figure (rule 8; *Power*).

| # | Machine | Route only it gives (rules 4 and 7) | Keys | Policy |
|---|---|---|---|---|
| 1 | Pyroprocessing cell | spent thorium fuel back to uranium-233, nitrogen-15 recovered, in molten salt | c1 reduce, c2 refine, c3 nitride, c4 salt | contained |
| 2 | Accelerator-driven reactor | IV's stored thorium as power, subcritical, driven by a proton beam | the fuel assembly | generator + contained |
| 3 | Heat source works | curium-244 heat sources, the probe RTG, the Am-241 micro source | c1–c4 | contained + kept |
| 4 | Laser fusion chamber | aneutronic proton–boron-11 fusion; D–He-3 capsules | the capsule | generator + kept (helium-4) |
| 5 | Superfluid helium plant | helium II at 1.9 K; Neptune helium split by a superleak | c1, c2 | kept |
| 6 | SRF cavity works | niobium cavities and the cryomodule | c1–c4 | kept (niobium and acid loops) |
| 7 | Synchrotron | X-ray lithography (UHPIC, photonic chips); antiprotons | c1–c3 | contained (activated target) |
| 8 | Muon fusion cell | muon-catalysed D–T fusion | the D–T charge | generator + kept |
| 9 | Fibre draw tower | ytterbium-doped fibre and the fibre laser module | c1–c4 | kept (chlorine loop) |
| 10 | MOCVD reactor | InGaAs pump diodes; NbN film | c1–c4 | contained (arsenic) |
| 11 | Zone refining tower | high-purity germanium | c1–c3 | kept |
| 12 | Optical ground station | the only reader of the Starshot | c1 | kept |
| 13 | Boron nitride reactor | hexagonal BN and BN nanotubes | c1–c3 | kept |
| 14 | Powder-in-tube line | EnTED wire at four per GTM ingot | c1–c3 | kept (silver sheath) |
| 15 | Powder bed printer | atomised powder, printed and pressed UV parts | c1–c3 | kept (argon, powder) |
| 16 | Cryotank winder | the tier 11 tank (level 7 rockets) | c1 | voidable (resin trim) |
| 17 | Thruster works | gridded ion and Hall thrusters | c1–c3 | kept |
| 18 | Starchip fab | the gram-scale probe and the sail-chip | c1, c2 | voidable (dicing kerf) |
| 19 | Ark biosphere | a closed ecosystem fed by Pluto's ices | c1, c2 | kept |
| 20 | Neural culture vat | stem cells and neuro processing units in one run | c1, c2 | kept |
| 21 | Light sail fab | the 100 nm sail film | c1–c3 | kept (xenon, SiF₄) |
| 22 | Antimatter trap | stored antiprotons, ICAN pellets | c1, c2 | contained |
| 23 | Laser sail launcher | the probe in flight | c1 + the heliopause data | kept |
| 24 | Neptune deep siphon | Neptune's deep gas | the family's | the drill family's |
| 25 | Triton geyser sampler | Triton's nitrogen, dark particles and ice core | c1 + cartridge | kept |
| 26 | Penetrator probe bay | Sputnik Planitia's and Charon's cores | the family's | the drill family's |
| 27 | Volatile ice fractionator | the cores split into their ices | c1, c2 | kept |
| 28 | Kuiper interceptor bay | a planetesimal sample | c1 + probe | kept |
| 29 | Amorphous ice annealer | the noble gases trapped in primordial ice | c1 | kept (dust voidable) |
| 30 | Precursor probe bay | heliopause data | c1 + probe | kept |
| 31 | Event horizon interferometer | the Sgr A* image | c1 + catalogue | kept |
| — | Older machines' UV modes | *Older machines, new modes* | c5 and up | as listed |

Every recipe has a programmed circuit or an input no other recipe of its type shares. Every new type goes through `gg_test_recipe_lookup`. The figures marked *(tune)* are placeholders that the owning package fixes against the S0-8 dump.

Voltages: VA[UV] = 491,520 EU/t, VA[ZPM] = 122,880 EU/t.

### 1. Pyroprocessing cell: `gtceu:pyroprocessing_cell`, type `gtceu:pyroprocessing` (Earth)

- **What it gains:**
  - spent thorium fuel has no GTM route back;
  - the cell turns the accelerator-driven reactor's spent fuel back into uranium-233 and thorium in molten salt, with no aqueous waste stream;
  - from nitride fuel it recovers the nitrogen-15, which is expensive (line 3).

  This is the ANL/INL electrometallurgical process (EBR-II) applied to thorium.
- **Recipes:**
  - c1 reduce: spent thorium oxide fuel + 1 lithium (in a LiCl charge, not consumed) → thorium–uranium metal + lithium oxide; lithium oxide is electrolysed back to lithium + oxygen inside *(tune)*, VA[UV] × 400 t;
  - c2 refine: thorium–uranium metal in LiCl–KCl → uranium-233 (cathode) + thorium (back as dust) + 250 mB loaded salt;
  - c3 nitride: spent thorium nitride fuel → as c2 + 500 mB nitrogen-15 (recovered as gas) + 5 % nitrogen-14 make-up loss;
  - c4 salt: 1,000 mB loaded salt → clean salt (back) + fission product waste (zeolite-bound).
- **Byproducts:**
  - fission product waste → ZPM's waste retrieval plant as synroc *(contained)*;
  - oxygen → the network;
  - protactinium-233 is not an item: it decays to uranium-233 inside the cell's decay tank (27 days in reality, folded into c2's time).
- **Structure:** 7×7×7 hot cell casing (IV's) around an argon glovebox, an electrorefiner and a salt furnace.
- **Controller:** UV hull + 2 UV robot arms + UV sensor + 4 UV circuits *(tune)*.
- **Crossings:**
  - IV: the fuel fabrication plant's uranium-233 assembly mode, and the uranium cycle's thorium through the reactor;
  - ZPM: the waste retrieval plant.
- **Risks:** U-233 may not be a GTM material, so S0-8 registers `grindless:uranium_233` if needed.
- **Source:** real: the EBR-II pyroprocess (Argonne), the thorium cycle (Shippingport, LFTR studies).

### 2. Accelerator-driven reactor: `gtceu:accelerator_driven_reactor`, type `gtceu:accelerator_driven` (Earth, generator)

- **What it gains:**
  - thorium has piled up since IV with no fuel use: the pitchblende centrifuge gives it (`docs/eras/iv.md:220`);
  - a subcritical core cannot run away: a proton beam on a lead–bismuth spallation target makes the neutrons;
  - the beam costs power, so the net figure below is after the beam.
- **Recipes:**
  - c1: 1 thorium oxide fuel assembly (`grindless:thorium_oxide_fuel_assembly`, IV's fuel fabrication plant) → 1,572,864 EU/t (3 A UV) for 12,000 t *(tune, S0-6)* + 1 spent thorium oxide fuel;
  - c2: 1 thorium nitride fuel assembly (nitrogen-15 nitride, line 3) → the same EU/t for 16,000 t + 1 spent thorium nitride fuel. Nitride is denser and conducts heat better, so it lasts longer; the ¹⁵N avoids carbon-14 from ¹⁴N.
- **Coolant:** 1,000 mB lead–bismuth eutectic charge (not consumed).
  - Each run adds 1 mB polonium-210 to it (bismuth-209 activation).
  - The polonium is contained and decays to lead-206, which the reactor's make-up step takes back.
  - Nothing leaves the loop.
- **Byproducts:** spent fuel → the pyroprocessing cell.
- **Structure:**
  - an 11×11×13 core of IV's reactor casing;
  - a lead–bismuth pool (UV heat exchangers);
  - an SRF linac of 4 cryomodules (`grindless:srf_cryomodule`, machine 6), as structure blocks, not inputs.
- **Controller:** UV hull + 2 UV field generators + 4 UV circuits *(tune)*.
- **Crossings:**
  - IV: the uranium cycle's thorium, the fuel fabrication plant (assemblies);
  - LuV: the helium refrigerator (the linac's 4 K stage);
  - UV: machine 6.
- **Risks:** generator multiblocks with a beam input are new. S0-6 proves the figure and that `G.generatorMultiblock` accepts a fuel item.
- **Source:** real: MYRRHA (SCK CEN), Rubbia's energy amplifier.

### 3. Heat source works: `gtceu:heat_source_works`, type `gtceu:heat_source` (Earth)

- **What it gains:**
  - curium has been stored since ZPM (`grindless:curium_oxide`) with no use;
  - curium-244 (18 years) is a denser heat source than plutonium-238, which GTM does not separate;
  - its uses are the probe RTG for the stations and probes past the sunlight (*Sunlight*), and the Am-241 micro source for the starchip.
- **Recipes:**
  - c1 pellet: 4 curium oxide → 1 Cm-244 pellet (pressed, sintered) + curium-245/246 fraction, VA[ZPM] × 600 t;
  - c2 clad: 1 Cm-244 pellet + 1 iridium foil (Mercury's iridium, the platinum plant's mode 3) + 1 carbon–carbon aeroshell (HV composite autoclave, UV mode) → 1 general-purpose heat source (`grindless:gphs_module`);
  - c3 RTG: 4 GPHS + 8 silicon–germanium thermocouples (germanium from machine 11) + 1 UV hull → 1 probe RTG (`grindless:probe_rtg`);
  - c4 micro source: 1 americium dust → 8 Am-241 micro sources (`grindless:americium_micro_source`);
  - c5 RTG pellet: 1 Cm-244 pellet → 2 curium RTG pellets for IV's `gtceu:ev_rtg`, at the same EU per tick as the plutonium pellet and three times the duration *(tune)*.
- **Byproducts:**
  - curium-245/246 fraction → stored for UHV (`grindless:heavy_curium_oxide`): the UHV design breeds berkelium and californium from it (stated future use, rule 3) *(contained)*;
  - iridium scrap → the platinum plant.
- **Structure:** 5×5×7 hot cell casing with a press, a sintering furnace and a welding cell.
- **Controller:** ZPM hull + 2 UV robot arms + 4 UV circuits *(tune)*.
- **Crossings:**
  - IV: the platinum plant's iridium, the RTG cell (`gtceu:ev_rtg`);
  - HV: the composite autoclave;
  - ZPM: the partitioning plant's curium.
- **Source:** real: the GPHS-RTG (Cassini, New Horizons); Cm-244 heat source studies (ORNL, ESA's Am-241 RPS).

### 4. Laser fusion chamber: `gtceu:laser_fusion_chamber`, type `gtceu:laser_fusion` (Earth, generator)

- **What it gains:**
  - proton–boron-11 fusion, which gives three alpha particles and almost no neutrons;
  - fuel no tokamak in GTM burns, in a machine that is not a tokamak;
  - the drivers are the era's fibre lasers, so the chamber is where photonics turns into power.
- **Recipes:**
  - c1: 1 p–B11 capsule (`grindless:pb11_capsule`, the diamond lattice fab's UV mode) → 2,621,440 EU/t (5 A UV) for 400 t *(tune, S0-6)* + 3,000 mB helium;
  - c2: 1 D–He-3 capsule (Neptune He-3 via ZPM's isotope column + deuterium) → the same EU/t for 600 t + 1,000 mB helium + 1,000 mB hydrogen.
- **Worn part:** 2 % chance per run to use 1 fibre laser module (machine 9) → 1 spent laser module, refurbished by the fibre draw tower's c4.
- **Byproducts:** helium → LuV's helium refrigerator, then machine 5.
- **Structure:** a 13×13×13 target chamber of UV casing, a ring of 32 laser module beamlines (structure blocks) and a capsule injector.
- **Controller:** UV hull + 4 UV emitters + 4 UV circuits *(tune)*.
- **Crossings:**
  - IV: the hot cell's boron-11 mode;
  - ZPM: the diamond lattice fab (the capsule's diamond shell, as at NIF);
  - UV: machines 9, 10.
- **Risks:** the "few neutrons" claim. Real p–B11 also makes some neutrons from side reactions; the chamber's casing takes that, and nothing is activated as an item.
- **Source:** real: NIF's diamond ablator capsules (2022 ignition), HB11 Energy's laser p–B11 studies.

### 5. Superfluid helium plant: `gtceu:superfluid_helium_plant`, type `gtceu:superfluid_helium` (Earth)

- **What it gains:**
  - helium II at 1.9 K, below the lambda point, which LuV's 4 K refrigerator cannot reach;
  - it cools the SRF cavities (machine 6) and the SNSPD receiver (machine 12).
- **Recipes:**
  - c1: 1,000 mB liquid helium (LuV's helium refrigerator) → 1,000 mB superfluid helium (`grindless:superfluid_helium`), VA[ZPM] × 200 t;
  - c2 superleak: 1,000 mB Neptune helium (machine 24) → 990 mB superfluid helium + 10 mB helium-3 concentrate (`grindless:helium_3_concentrate`) *(tune)*. Only helium-4 passes a superleak.
- **Byproducts:**
  - helium-3 concentrate → ZPM's isotope column for the last step;
  - superfluid helium that warms in use comes back as helium → c1 (a loop, 2 % make-up per run in the consumers *(tune)*).
- **Structure:** 7×7×9 cryostat casing (LuV's), cold compressors (UV pumps) and a superleak stage.
- **Controller:** UV hull + 4 UV pumps + 4 UV circuits *(tune)*.
- **Crossings:** LuV (the helium refrigerator), ZPM (the isotope column).
- **Source:** real: CERN LHC's 1.9 K plants, the superleak (Kapitza), ESS and European XFEL cryoplants.

### 6. SRF cavity works: `gtceu:srf_cavity_works`, type `gtceu:srf_cavity` (Earth)

- **What it gains:** the superconducting radio-frequency cryomodule, the building block of every UV accelerator (machines 2, 7, 8). Line 13 is a six-step chain in one shop.
- **Recipes:**
  - c1 RRR: 4 niobium ingots → 3 RRR niobium sheets (`grindless:rrr_niobium_sheet`, electron-beam melted five times) + 1 niobium scrap;
  - c2 cavity: 9 RRR sheets → 1 bare nine-cell cavity (deep drawn, electron-beam welded);
  - c3 surface: 1 bare cavity + 500 mB electropolish acid (HF + sulfuric acid) + 100 mB nitrogen → 1 N-doped cavity (`grindless:srf_cavity`) + 500 mB spent acid;
  - c4 cryomodule: 8 cavities + 4,000 mB superfluid helium + 2 UV field generators + 1 mu-metal shield → 1 SRF cryomodule (`grindless:srf_cryomodule`).
- **Byproducts:**
  - niobium scrap → c1;
  - spent acid → niobium fluoride recovered as niobium, then lime-neutralised to calcium fluoride and back to HF with sulfuric acid (GTM's HF recipe);
  - the cryomodule's helium returns on deconstruction only.
- **Structure:** 7×7×9 clean room casing with an electron-beam furnace, a press, an electropolish bath and a vacuum furnace.
- **Controller:** UV hull + 2 UV robot arms + UV electric pump + 4 UV circuits *(tune)*.
- **Crossings:** LuV (the helium refrigerator, via machine 5), UV (machine 5).
- **Source:** real: TESLA/European XFEL cavities, Fermilab nitrogen doping (2013).

### 7. Synchrotron: `gtceu:synchrotron`, type `gtceu:synchrotron` (Earth)

- **What it gains:**
  - **X-ray lithography (LIGA):** UHPIC at twice GTM's yield per wafer, and the only route to the photonic chip (line 22);
  - **antiprotons from GTCA's COMET protons (line 18):** the only antimatter in the pack.
- **Recipes:**
  - c1 expose: 1 PMMA-coated wafer (`grindless:pmma_coated_wafer`) + 1 gold X-ray mask (not consumed) → 1 exposed wafer, VA[UV] × 200 t;
  - c2 LIGA: 1 exposed wafer + 250 mB developer → 1 patterned wafer → (in GTM's cutter) 2 UHPIC dies per GTM's one *(tune)*, or with c3 below the photonic chip;
  - c3 photonic: 1 patterned wafer + 1 silicon nitride film → 4 photonic chips (`grindless:photonic_chip`);
  - c4 antiprotons: 1,000 mB COMET protons (GTCA, S0-7) + 1 tungsten target (2 % wear) → 1 antiproton cartridge (`grindless:antiproton_cartridge`, a magnetic bottle that the trap empties) + 1,000 mB hydrogen, 4 A UV for 2,000 t *(tune)*.
- **Byproducts:**
  - activated tungsten target → contained; it cools in a quantum tank's slot and comes back as tungsten (`G.decay`, the ZPM pattern);
  - developer → back.
- **Structure:** a 23×23×5 ring (UV casing) with 16 dipole blocks (LuV HTS magnet works' magnets), 2 SRF cryomodules (machine 6) and 2 beamlines.
- **Controller:** UV hull + 4 UV field generators + 4 UV sensors + 4 UV circuits *(tune)*.
- **Crossings:**
  - LuV: the HTS magnet works;
  - GTCA: COMET;
  - UV: machine 6.
- **Risks:** the COMET proton ids. S0-7 pins them, or the antiproton row falls back to protons from our own hydrogen ioniser recipe in the synchrotron.
- **Source:** real: LIGA (KIT, Karlsruhe); CERN's antiproton decelerator.

### 8. Muon fusion cell: `gtceu:muon_fusion_cell`, type `gtceu:muon_catalysed_fusion` (Earth, generator)

- **What it gains:**
  - fusion at liquid-hydrogen temperature, with IV's deuterium and tritium, which until UV were spent only on the Mk1;
  - a muon replaces the electron in a hydrogen molecule and pulls two nuclei close enough to fuse; one muon catalyses about 150 fusions before it sticks to helium.
- **Recipes:**
  - c1: 500 mB liquid deuterium–tritium (D from IV's heavy water plant, T from IV's tritium removal facility) → 786,432 EU/t (1.5 A UV) for 1,200 t *(tune, S0-6)* + 500 mB helium;
  - the lithium-6 blanket (charge, not consumed) returns 60 % of the tritium *(tune)*, and the other 40 % is make-up from IV.
- **Byproducts:** helium → the helium refrigerator. The neutrons go into the blanket, and nothing is activated as an item.
- **Structure:** 9×9×11 cryostat casing with its own SRF linac (2 cryomodules), a pion production target and a muon decay channel.
- **Controller:** UV hull + 2 UV field generators + 4 UV circuits *(tune)*.
- **Crossings:**
  - IV: the heavy water plant, the tritium removal facility;
  - LuV: the helium refrigerator;
  - UV: machine 6.
- **Risks:**
  - the real energy balance of muon-catalysed fusion is still below break-even (the muon costs about 5 GeV);
  - the game figure assumes a better sticking fraction, so the docs say so and the quest text calls it an extrapolation.
- **Source:** real: Alvarez (1956), Jones et al. (LAMPF, 1980s), J-PARC μCF experiments.

### 9. Fibre draw tower: `gtceu:fibre_draw_tower`, type `gtceu:fibre_draw` (Earth)

- **What it gains:** ytterbium-doped double-clad fibre and the fibre laser module. Fibre lasers are the era's light source for the laser fusion chamber, the launcher and the powder bed.
- **Recipes:**
  - c1 preform: 1,000 mB silicon tetrachloride + 100 mB germanium tetrachloride (machine 11's c1) + 1 ytterbium oxide dust (the extraction cascade's Yb strip) + 1 aluminium dust → 1 Yb-doped preform + 2,000 mB chlorine, VA[ZPM] × 600 t;
  - c2 draw: 1 preform → 16 Yb fibre spools (`grindless:ytterbium_fibre`) + 250 mB acrylate coating used;
  - c3 module: 4 fibre spools + 4 InGaAs pump modules (machine 10) + 1 fibre Bragg grating → 1 fibre laser module (`grindless:fibre_laser_module`);
  - c4 refurbish: 1 spent laser module + 1 fibre spool → 1 fibre laser module.
- **Byproducts:**
  - chlorine → hydrogen chloride → back to silicon tetrachloride;
  - silica soot → glass dust (GTM).
- **Structure:** a 5×5×15 tower (clean room casing) with an MCVD lathe at the base.
- **Controller:** UV hull + 2 UV motors + UV sensor + 4 UV circuits *(tune)*.
- **Crossings:** EV (the extraction cascade's ytterbium), UV (machines 10, 11).
- **Source:** real: MCVD (Bell Labs, 1974), IPG's ytterbium fibre lasers.

### 10. MOCVD reactor: `gtceu:mocvd_reactor`, type `gtceu:mocvd` (Earth)

- **What it gains:** compound semiconductors grown atom layer by atom layer:
  - InGaAs quantum-well pump diodes for the fibre lasers;
  - niobium nitride film for the SNSPD.
- **Recipes:**
  - c1 organometallics: 1 gallium + 1 indium + 3,000 mB chloromethane + 3 sodium → 1,000 mB trimethylgallium + 1,000 mB trimethylindium + 3 salt *(tune)*;
  - c2 epi: 1 gallium arsenide wafer + 250 mB trimethylgallium + 250 mB trimethylindium + 500 mB arsine → 1 InGaAs epi wafer + 750 mB methane, VA[UV] × 800 t;
  - c3 bars: 1 epi wafer → 8 diode bars → 2 InGaAs pump modules (`grindless:ingaas_pump_module`);
  - c4 NbN: 1 sapphire wafer + 1 niobium dust + 100 mB nitrogen → 1 NbN-coated wafer (`grindless:nbn_film_wafer`).
- **Byproducts:**
  - methane → ZPM's methane pyrolyser;
  - unreacted arsine → arsenic, contained and returned as arsenic dust;
  - salt → GTM's salt uses.
- **Structure:** 7×7×7 clean room casing with a showerhead reactor and a gas cabinet.
- **Controller:** UV hull + 2 UV pumps + UV sensor + 4 UV circuits *(tune)*.
- **Crossings:**
  - MV: the bauxite gallium line;
  - LuV: Io's indium (the fumarole condenser);
  - UV: machine 12.
- **Risks:** arsine's id. S0-8 checks GTM's `arsine` or registers it.
- **Source:** real: Manasevit (1968), the InGaAs/GaAs 9xx nm pump diodes of fibre lasers.

### 11. Zone refining tower: `gtceu:zone_refining_tower`, type `gtceu:zone_refining` (Earth)

- **What it gains:**
  - high-purity germanium (thirteen nines), the only crystal that resolves gamma lines;
  - it lets the heat source works check isotopes and the precursor probe read the heliopause;
  - its intermediate germanium tetrachloride feeds the fibre preform.
- **Recipes:**
  - c1 chlorinate: 1 germanium dust (Io's) + 2,000 mB chlorine → 1,000 mB germanium tetrachloride (distilled);
  - c2 reduce: 1,000 mB germanium tetrachloride + 2,000 mB water → germanium dioxide; then + 4,000 mB hydrogen → 1 germanium ingot + 4,000 mB hydrogen chloride;
  - c3 refine: 4 germanium ingots → 1 HPGe crystal (`grindless:hpge_crystal`) + 1 germanium dust (the impure ends, back to c1), VA[ZPM] × 2,400 t.
- **Byproducts:** hydrogen chloride → chlorine (GTM electrolysis) → c1.
- **Structure:** a 3×3×13 tower (clean room casing) with 8 RF coils and a Czochralski puller at the top.
- **Controller:** UV hull + UV motor + 2 UV emitters + 4 UV circuits *(tune)*.
- **Crossings:** LuV (Io's germanium, the fumarole condenser), UV (machines 3, 9, 30).
- **Source:** real: Pfann's zone refining (Bell Labs, 1952), Hall and Haller's HPGe (LBL).

### 12. Optical ground station: `gtceu:optical_ground_station`, type `gtceu:optical_downlink` (Earth)

- **What it gains:**
  - the only reader of the Starshot;
  - a gram-scale probe light years away sends photons, not radio, and only a superconducting nanowire detector at 1.9 K counts them.
- **Recipe:** c1: 1 probe in flight (machine 23) + 100 mB superfluid helium → 1 Proxima approach data (`grindless:proxima_approach_data`) + 100 mB helium.
  - The probe in flight is consumed: one probe, one data set.
  - 2 A UV for 6,000 t *(tune)*.
- **Byproducts:** helium → machine 5.
- **Structure:**
  - a 9×9×9 telescope dome (UV casing) with a 5×5 mirror;
  - an adaptive optics bench;
  - an SNSPD array block (`grindless:snspd_array`, ZPM qubit fab's UV mode).
- **Controller:** UV hull + 2 UV sensors + 4 UV circuits *(tune)*.
- **Crossings:** ZPM (the qubit fab, the deep space network's pattern), UV (machines 5, 10).
- **Source:** real: NASA's DSOC (Psyche, Palomar, 2023), SNSPD arrays (JPL/NIST).

### 13. Boron nitride reactor: `gtceu:boron_nitride_reactor`, type `gtceu:boron_nitride` (Earth)

- **What it gains:** hexagonal boron nitride and boron nitride nanotubes. BNNT are as strong as carbon nanotubes, stable to 900 °C in air, and boron-10 absorbs neutrons.
- **Recipes:**
  - c1 hBN: 2 boron trioxide dust (borax → boric acid → boron trioxide; GTM's borax) + 2,000 mB ammonia → 2 hexagonal boron nitride dust + 3,000 mB steam, VA[ZPM] × 400 t;
  - c2 BNNT: 1 hBN dust + 500 mB hydrogen → 1 BNNT dust (RF induction plasma) + 500 mB hydrogen back;
  - c3 yarn: 4 BNNT dust → 1 BNNT yarn (`grindless:bnnt_yarn`).
- **Byproducts:**
  - steam → water;
  - unreacted ammonia → back;
  - hBN fines → c1.
- **Structure:** 7×7×9 UV casing with an induction plasma torch and a spinning bench.
- **Controller:** UV hull + 2 UV emitters + UV pump + 4 UV circuits *(tune)*.
- **Crossings:** UV (machines 16, 17, 21; Charon's ammonia from machine 27).
- **Source:** real: NRC Canada's induction plasma BNNT (2014), NASA Langley's BNNT.

### 14. Powder-in-tube line: `gtceu:powder_in_tube_line`, type `gtceu:powder_in_tube` (Earth)

- **What it gains:**
  - EnTED wire (GTM's UV superconductor) at four wires per ingot of reacted powder;
  - the Mk3's 32 EnTED wires and the UV cell come from here.
- **Recipes:**
  - c1 powder: enriched naquadah + trinium + europium + duranium dusts in GTM's ratio → EnTED powder (`grindless:ented_powder`) *(S0-8 pins GTM's composition)*;
  - c2 billet: 4 EnTED powder + 1 silver tube → 1 PIT billet;
  - c3 draw and heat treat: 1 billet → 16 EnTED wires (GTM's `single_wire`) + 1 silver dust (the sheath, back to tubes), VA[UV] × 600 t.
- **Byproducts:** silver → c2.
- **Structure:** a 3×5×15 line (UV casing): powder filler, swaging and drawing benches, heat-treat furnace.
- **Controller:** UV hull + 2 UV motors + UV conveyor + 4 UV circuits *(tune)*.
- **Crossings:** LuV (the coated conductor line's draw bench and heat-treat pattern; its silver), ZPM (the europium reductor).
- **Source:** real: powder-in-tube Nb₃Sn and Bi-2212 wire (CERN, Bruker).

### 15. Powder bed printer: `gtceu:powder_bed_printer`, type `gtceu:powder_bed_fusion` (Earth)

- **What it gains:**
  - UV parts in one piece with less material: gears and rotors of neutronium, darmstadtium and tritanium at 75 % of GTM's ingots;
  - parts with no GTM recipe: the thruster's regeneratively cooled chamber, the launcher's array mount and the probe frames.
- **Recipes:**
  - c1 atomise (EIGA): 4 ingots + 1,000 mB argon (Mars, EV's atmosphere processor) → 4 powder (`grindless:<metal>_am_powder` for the metals listed in `tables/am_powders.json`) + 950 mB argon back;
  - c2 print: powder + 1 fibre laser module (2 % wear) → near-net part + unsintered powder (back);
  - c3 press (HIP): near-net part + 1,000 mB argon → the part + argon back, VA[UV] × 400 t.
- **Byproducts:** spatter → c1.
- **Structure:** 7×7×7 UV casing with an EIGA tower, a print chamber and a hot isostatic press.
- **Controller:** UV hull + 2 UV emitters + 2 UV robot arms + 4 UV circuits *(tune)*.
- **Crossings:** EV (Mars argon), UV (machine 9).
- **Risks:** the cheaper GTM parts are a convenience route (not counted for rule 7). The printer counts for its own parts.
- **Source:** real: EIGA atomisers (ALD), laser powder bed fusion, NASA's RAMPT printed chambers.

### 16. Cryotank winder: `gtceu:cryotank_winder`, type `gtceu:cryotank_winding` (Earth)

- **What it gains:**
  - the tier 11 tank and so the level 7 rocket: floor((3 + 11) / 2) = 7;
  - a liner of hexagonal boron nitride, the best 2D barrier to hydrogen, overwrapped with BNNT and ZPM's carbon nanotube yarn.
- **Recipe:** c1: 1 aerogel tank (ZPM, tier 9) + 16 BNNT yarn + 16 carbon nanotube yarn (ZPM's pyrolyser) + 4 hBN dust + 1,000 mB epoxy + the Pluto–Kuiper chart (the mission specification, not consumed) → 1 BNNT fuel tank (`grindless:bnnt_fuel_tank`, tier 11), VA[UV] × 1,200 t.
- **Byproducts:** resin trim → voidable (inert cured epoxy).
- **Structure:** 7×7×9 UV casing with a mandrel, a winding head and a curing oven.
- **Controller:** UV hull + 2 UV robot arms + UV motor + 4 UV circuits *(tune)*.
- **Crossings:** ZPM (the aerogel tank, the pyrolyser, the chart), UV (machine 13).
- **Risks:** the KubeJS tier 11 tank (S0-1).
- **Source:** real: NASA's composite cryotank (2014), BNNT for space structures (NASA).

### 17. Thruster works: `gtceu:thruster_works`, type `gtceu:thruster_assembly` (Earth)

- **What it gains:**
  - electric propulsion: the precursor probe and the interceptor need a delta-v no chemical stage gives;
  - xenon and krypton finally have a destination of their own.
- **Recipes:**
  - c1 gridded ion: 2 molybdenum grids + 1 lanthanum hexaboride cathode (EV cascade lanthanum + boron) + 1 printed chamber (machine 15) + 4,000 mB xenon (the qualification firing; 90 % back as gas) → 1 gridded ion thruster (`grindless:ion_thruster`);
  - c2 Hall: 1 BN discharge channel (machine 13, hBN) + 4 UV electromagnets + 1 LaB₆ cathode + 4,000 mB krypton (90 % back) → 1 Hall thruster (`grindless:hall_thruster`);
  - c3 pod: 2 thrusters + 1 power processing unit (UV circuit) + 1 propellant tank → 1 thruster pod (`grindless:thruster_pod`).
- **Byproducts:** the firing's gas → back (the 10 % is the propellant loss).
- **Structure:** 7×7×9 UV casing with an assembly bay and a vacuum test cell.
- **Controller:** UV hull + 2 UV robot arms + UV pump + 4 UV circuits *(tune)*.
- **Crossings:** EV (the extraction cascade's lanthanum), UV (machines 13, 15, 29).
- **Source:** real: NSTAR and NEXT (NASA), Hall thrusters (Fakel SPT, Starlink's krypton Hall thrusters).

### 18. Starchip fab: `gtceu:starchip_fab`, type `gtceu:starchip` (Earth)

- **What it gains:**
  - the gram-scale probe:
    - a photonic chip for the laser link;
    - an NV-diamond magnetometer and clock;
    - an Am-241 micro source for heat and power;
    - a CCD camera;
  - then the sail-chip: the probe bonded to its sail.
- **Recipes:**
  - c1 chip: 1 photonic chip (machine 7) + 1 NV diamond (ZPM's ion implanter) + 1 Am-241 micro source (machine 3) + 1 UV wafer → 1 starchip (`grindless:starchip`) + silicon dust (kerf), VA[UV] × 1,600 t;
  - c2 sail-chip: 1 starchip + 1 light sail (machine 21) → 1 sail-chip (`grindless:sailcraft`).
- **Byproducts:** kerf → silicon dust → GTM's silicon.
- **Structure:** 5×5×5 clean room casing (ISO 1) with a bonder.
- **Controller:** UV hull + 2 UV robot arms + 4 UV circuits *(tune)*.
- **Crossings:** ZPM (the ion implanter), UV (machines 3, 7, 21).
- **Source:** real: Breakthrough Starshot (2016), Lubin's "A Roadmap to Interstellar Flight".

### 19. Ark biosphere: `gtceu:ark_biosphere`, type `gtceu:closed_ecosystem` (Earth, greenhouse step 7)

- **What it gains:**
  - the greenhouse family's step 7: a closed ecosystem that lives on Pluto's ices;
  - its growth medium feeds machine 20 and its oxygen and food leave the loop only as products.
- **Recipes:**
  - c1 cycle: 1,000 mB carbon dioxide (Pluto's CO, shifted) + 250 mB ammonia (Charon) + 1,000 mB water + algae culture (LuV's algae bioreactor, not consumed) + archaeal culture (ZPM, not consumed) → 500 mB oxygen + 500 mB growth medium + 1 biomass, VA[ZPM] × 1,200 t *(tune)*;
  - c2 seed: 1 algae culture + 1 archaeal culture + 4 biomass → a second of each (the bank's copy).
- **Byproducts:** biomass → MV's biorefinery; oxygen → the network.
- **Structure:** 11×11×9 glass dome casing (the greenhouse family's) with a photobioreactor ring and an anaerobic core.
- **Controller:** UV hull + 2 UV pumps + 4 UV circuits *(tune)*.
- **Crossings:**
  - MV: the biorefinery;
  - LuV: the algae bioreactor;
  - ZPM: the vent bioreactor;
  - UV: machine 27.
- **Source:** real: MELiSSA (ESA), Biosphere 2.

### 20. Neural culture vat: `gtceu:neural_culture_vat`, type `gtceu:neural_culture` (Earth)

- **What it gains:**
  - stem cells and neuro processing units in one run, for GTM's wetware: the Mk3's 4 UHV wetware mainframes and the era's circuits;
  - GTM's route is split across several machines and its stem cells come one at a time.
- **Recipes:**
  - c1 stem cells: 1,000 mB growth medium (machine 19) + 1 organoid (LuV's organoid lab, not consumed) + 1 enzyme charge (LuV's biofoundry) → 16 stem cells (GTM's) *(tune)*, VA[UV] × 1,200 t;
  - c2 neuro: 8 stem cells + 1 wetware circuit board + 1,000 mB sterilised growth medium → 4 neuro processing units (GTM's).
- **Byproducts:**
  - spent medium → biomass → MV's biorefinery;
  - failed cultures → autoclaved, voidable (inert once sterile).
- **Structure:** 7×7×7 sterile casing with incubators and a bioprinter.
- **Controller:** UV hull + 2 UV pumps + UV sensor + 4 UV circuits *(tune)*.
- **Crossings:** LuV (the organoid lab, the biofoundry), MV (the biorefinery), UV (machine 19).
- **Risks:** GTM's wetware ids (S0-8).
- **Source:** GTM (wetware); real: brain organoids (Lancaster and Knoblich, 2013).

### 21. Light sail fab: `gtceu:light_sail_fab`, type `gtceu:light_sail` (Earth orbit)

- **What it gains:** a 100 nm silicon nitride sail with a hBN-backed metasurface. It reflects the 1,064 nm laser and radiates its heat. It is too thin to survive gravity and air during release, hence orbit.
- **Recipes:**
  - c1 film: 1 silicon wafer carrier (LuV's wake shield facility epitaxial wafer) + 500 mB silane + 500 mB ammonia → 1 Si₃N₄-coated carrier + 1,500 mB hydrogen;
  - c2 pattern: 1 coated carrier + 1 hBN dust + the metasurface mask (machine 7's c1, not consumed) → 1 patterned carrier;
  - c3 release: 1 patterned carrier + 500 mB xenon difluoride → 1 light sail (`grindless:light_sail`) + 250 mB silicon tetrafluoride + 500 mB xenon.
- **Byproducts:**
  - xenon → back to xenon difluoride (GTM's fluorine);
  - silicon tetrafluoride → IV's hot cell feed (its Si-28 mode takes SiF₄);
  - hydrogen → the station.
- **Structure:** 7×7×7 station truss casing with a film deposition bay behind a wake shield.
- **Controller:** UV hull + 2 UV robot arms + UV emitter + 4 UV circuits *(tune)*.
- **Site:** Earth orbit (`G.dimensionLock`).
- **Crossings:** LuV (the wake shield facility), IV (the hot cell's SiF₄), UV (machines 7, 13).
- **Source:** real: Atwater et al., "Materials challenges for the Starshot lightsail" (2018); Caltech's Si₃N₄ sail membranes.

### 22. Antimatter trap: `gtceu:antimatter_trap`, type `gtceu:antimatter_storage` (Earth orbit)

- **What it gains:**
  - stored antiprotons;
  - the ICAN pellet, a fission–fusion microexplosion triggered by antiprotons for the precursor probe;
  - orbit's vacuum is the trap's best wall.
- **Recipes:**
  - c1 stack: 4 antiproton cartridges (machine 7) + 100 mB superfluid helium → 1 charged Penning trap (`grindless:antiproton_trap`) + 4 empty cartridges (back to machine 7) + 100 mB helium, 2 A UV for 2,000 t *(tune)*;
  - c2 ICAN: 1 charged trap + 4 uranium-238 dust + 500 mB deuterium–tritium → 4 ICAN pellets (`grindless:ican_pellet`) + 1 empty trap (back).
- **Byproducts:**
  - helium → machine 5;
  - lost antiprotons annihilate (the EU cost; nothing to dispose of).
- **Structure:** 5×5×9 station truss casing with an HTS solenoid (LuV's magnet works) and an electron cooler.
- **Controller:** UV hull + 2 UV field generators + 4 UV circuits *(tune)*.
- **Site:** Earth orbit.
- **Crossings:** LuV (the HTS magnet works), UV (machines 5, 7).
- **Source:** real: CERN's AD/ELENA and BASE trap, Penn State's ICAN-II (Lewis et al., 1990s).

### 23. Laser sail launcher: `gtceu:laser_sail_launcher`, type `gtceu:laser_sail_launch` (the Moon)

- **What it gains:**
  - the probe in flight: a phased array of fibre lasers pushes a sail-chip to a fifth of light speed in minutes;
  - on the Moon, no air spoils the beam.
- **Recipe:**
  - c1: 1 sail-chip + 64 fibre laser modules (as structure blocks) + the heliopause data (machine 30, not consumed: the interstellar medium's density sets the trajectory) → 1 probe in flight (`grindless:starshot_probe`);
  - the launch draws 16 A UV for 200 t *(tune)*, the era's single largest draw, from the network.
- **Byproducts:** none. Each module has a 1 % chance to become a spent module → machine 9's c4.
- **Structure:** a 15×15×3 phased array (UV casing) of 64 laser module blocks, a beam director and a cooling loop.
- **Controller:** UV hull + 4 UV emitters + 4 UV circuits *(tune)*.
- **Site:** `gcyr:luna`.
- **Crossings:** EV (the lunar base's site), UV (machines 9, 18, 30).
- **Source:** real: Breakthrough Starshot's 100 GW array concept.

### 24. Neptune deep siphon: `gtceu:neptune_deep_siphon`, type `gtceu:ice_giant_siphon` (Neptune orbit, drill step 10)

- **What it gains:**
  - Neptune's deep gas, below the methane cloud deck;
  - GTM's helium has no isotopes, so the siphon gives `grindless:neptune_helium` with He-3 in it.
- **Recipes:** the ZPM flyby's Neptune deep gas sample (not consumed) + scoop head (worn: the family's bit, ZPM's `grindless:scoop_head`) +
  - c4: → 16,000 mB HD-rich hydrogen (`grindless:neptune_hydrogen`) + 4,000 mB Neptune helium;
  - c5: → 4,000 mB methane + 500 mB hydrogen sulfide;
  - c6 (first run only): the Neptune bridge sample.

  These are circuits 4–6 so the shared type with ZPM's ice-giant siphon keeps its keys apart.
- **Byproducts:**
  - HD-rich hydrogen → ZPM's isotope column (deuterium);
  - methane → ZPM's pyrolyser;
  - hydrogen sulfide → GTM's sulfur.
- **Structure:** ZPM's ice-giant siphon shape with a longer tether: 7×7×15 station truss casing.
- **Controller:** UV hull + 2 UV pumps + 2 UV motors + 4 UV circuits *(tune)*.
- **Site:** `grindless:neptune_orbit`.
- **Crossings:** ZPM (the flyby sample, the isotope column, the pyrolyser).
- **Source:** real: Voyager 2 (1989); the Neptune Odyssey mission concept.

### 25. Triton geyser sampler: `gtceu:triton_geyser_sampler`, type `gtceu:triton_plume` (Neptune orbit)

- **What it gains:** Triton's nitrogen geysers, caught by a cartridge on a flyby:
  - nitrogen enriched in nitrogen-15 (modelled on Titan's measured 14N/15N of 167 against Earth's 272; Triton's is unmeasured, so this is a design convention);
  - dark plume particles;
  - the Triton ice core.
- **Recipes:** the ZPM flyby's Triton nitrogen sample (not consumed) + 1 plume cartridge (`grindless:plume_cartridge`, ZPM's) +
  - c1: → 8,000 mB Triton nitrogen (`grindless:triton_nitrogen`) + 1 dark plume particles;
  - c2: → 1 Triton ice core (`grindless:triton_ice_core`) + 2,000 mB Triton nitrogen.
- **Byproducts:** dark plume particles → ZPM's tholin reformer (nitriles).
- **Structure:** 7×7×7 station truss casing with a probe hangar.
- **Controller:** UV hull + 2 UV robot arms + 4 UV circuits *(tune)*.
- **Site:** `grindless:neptune_orbit`.
- **Crossings:** ZPM (the flyby sample, the plume cartridge, the tholin reformer).
- **Source:** real: Voyager 2's Triton geysers; the Trident mission concept.

### 26. Penetrator probe bay: `gtceu:penetrator_probe_bay`, type `gtceu:penetrator_probe` (Pluto orbit, drill step 11)

- **What it gains:**
  - the drill family's step 11: a probe falls into Sputnik Planitia's nitrogen glacier or onto Charon and sends a core up;
  - the probe carries a curium heat source to melt into the ice, as a cryobot does.
- **Recipes:** the Triton ice core (not consumed: it calibrates the probe for Kuiper ices) + 1 penetrator (`grindless:penetrator_probe`: a printed frame, a GPHS module, a HPGe spectrometer, a LuV cryobot head) +
  - c1: → 1 Sputnik ice core (`grindless:sputnik_ice_core`);
  - c2: → 1 Charon core (`grindless:charon_core`);
  - c3 (first run only): the Pluto bridge sample.
- **Byproducts:** none (the probe stays in the ice; its heat source is the cost).
- **Structure:** 7×7×9 station truss casing with a probe rail and an ascent canister catcher.
- **Controller:** UV hull + 2 UV robot arms + 4 UV circuits *(tune)*.
- **Site:** `grindless:pluto_orbit`.
- **Crossings:** LuV (the cryobot head), UV (machines 3, 11, 15, 25).
- **Source:** real: New Horizons (2015); the Lunar-A and DS2 penetrators; JPL's cryobot.

### 27. Volatile ice fractionator: `gtceu:volatile_ice_fractionator`, type `gtceu:ice_fractionation` (Pluto orbit)

- **What it gains:** Pluto's and Charon's ices split by warming them slowly. Each ice sublimes at its own temperature: nitrogen at 63 K, carbon monoxide at 68 K, methane at 91 K, ammonia hydrate far above.
- **Recipes:**
  - c1: 1 Sputnik ice core → 16,000 mB nitrogen + 2,000 mB carbon monoxide + 1,000 mB methane + 1 tholin residue, VA[ZPM] × 600 t;
  - c2: 1 Charon core → 8,000 mB water + 2,000 mB ammonia + 1 silicate dust.
- **Byproducts:**
  - carbon monoxide → HV's syngas plant, UV shift mode → hydrogen + carbon dioxide → the ark;
  - methane → ZPM's pyrolyser;
  - tholin residue → ZPM's tholin reformer;
  - silicate dust → voidable (inert).
- **Structure:** 7×7×7 station truss casing with a stepped cold finger column.
- **Controller:** UV hull + 2 UV pumps + 4 UV circuits *(tune)*.
- **Site:** `grindless:pluto_orbit`.
- **Crossings:** HV (the syngas plant), ZPM (the tholin reformer), UV (machines 13, 19).
- **Source:** real: New Horizons' LEISA ice maps of Sputnik Planitia.

### 28. Kuiper interceptor bay: `gtceu:kuiper_interceptor_bay`, type `gtceu:kuiper_intercept` (Pluto orbit)

- **What it gains:** a small cold classical Kuiper Belt object (Arrokoth's kind), untouched since the Solar System formed, visited by an ion-propelled interceptor that brings a sample back to the station.
- **Recipe:** c1: the Pluto–Kuiper chart (not consumed) + 1 interceptor (`grindless:kuiper_interceptor`: a thruster pod, a probe RTG, a sample canister) → 1 planetesimal sample (`grindless:planetesimal_sample`) + 1 empty canister (back), 1 A UV for 4,000 t *(tune)*.
- **Byproducts:** none.
- **Structure:** 7×7×9 station truss casing with a probe hangar and a sample airlock.
- **Controller:** UV hull + 2 UV robot arms + 4 UV circuits *(tune)*.
- **Site:** `grindless:pluto_orbit`.
- **Crossings:** ZPM (the chart, the Kuiper survey telescope's targets), UV (machines 3, 17).
- **Source:** real: New Horizons' flyby of Arrokoth (2019), Hayabusa2's sample return.

### 29. Amorphous ice annealer: `gtceu:amorphous_ice_annealer`, type `gtceu:ice_annealing` (Pluto orbit)

- **What it gains:**
  - the noble gases trapped in amorphous ice that never warmed above 40 K;
  - warmed through its crystallisation at about 140 K, the ice lets go of argon, krypton and xenon in one pulse;
  - this is the pack's bulk krypton and xenon.
- **Recipe:** c1: 1 planetesimal sample → 4,000 mB water + 1,000 mB carbon monoxide + 500 mB nitrogen + 250 mB Kuiper noble gas mix (`grindless:kuiper_noble_gas`, Ar/Kr/Xe) + 1 refractory dust, VA[ZPM] × 800 t *(tune)*.
- **Byproducts:**
  - the noble gas mix → EV's cryogenic plant, UV mode → argon + krypton + xenon;
  - carbon monoxide → the syngas plant;
  - refractory dust → voidable (inert silicates and carbon).
- **Structure:** 5×5×7 station truss casing with a cryostat and a gas collection manifold.
- **Controller:** UV hull + 2 UV pumps + 4 UV circuits *(tune)*.
- **Site:** `grindless:pluto_orbit`.
- **Crossings:** EV (the cryogenic plant), HV (the syngas plant), UV (machine 17).
- **Source:** real: Bar-Nun's laboratory gas trapping in amorphous ice; Rosetta's 67P noble gases.

### 30. Precursor probe bay: `gtceu:precursor_probe_bay`, type `gtceu:precursor_probe` (Pluto orbit)

- **What it gains:** the first probe to the heliopause. Launched from Pluto's orbit with an ICAN kick and ion thrusters, it reaches 150 AU and reports the interstellar medium that the Starshot will cross.
- **Recipe:** c1: 1 precursor probe (`grindless:precursor_probe`: 2 probe RTGs, 1 thruster pod, 1 HPGe spectrometer, 1 printed frame) + 4 ICAN pellets → 1 heliopause data (`grindless:heliopause_data`), 2 A UV for 6,000 t *(tune)*. The probe is spent.
- **Byproducts:** none.
- **Structure:** 7×7×11 station truss casing with a launch rail and a DSN relay.
- **Controller:** UV hull + 2 UV robot arms + 4 UV circuits *(tune)*.
- **Site:** `grindless:pluto_orbit`.
- **Crossings:** UV (machines 3, 11, 17, 22).
- **Source:** real: Voyager 1's heliopause crossing (2012); JHU/APL's Interstellar Probe study (2021).

### 31. Event horizon interferometer: `gtceu:event_horizon_interferometer`, type `gtceu:event_horizon_imaging` (Pluto orbit, observatory step 8)

- **What it gains:**
  - the observatory family's step 8: a baseline from Pluto's orbit to Earth resolves Sgr A*'s shadow at millimetre wavelengths;
  - the Earth-sized EHT baseline cannot, so this is a fictional extrapolation of space VLBI, labelled as such in the quest.
- **Recipe:** c1: the multimessenger catalogue (ZPM, not consumed) + 1 HPGe crystal (the receiver's front end, *tune*) + 4 data orbs → 1 Sgr A* image (`grindless:sgr_a_star_image`), 1 A UV for 8,000 t *(tune)*.
- **Byproducts:** none.
- **Structure:** 9×9×5 station truss casing with a 7×7 dish and a maser clock.
- **Controller:** UV hull + 2 UV sensors + 4 UV circuits *(tune)*.
- **Site:** `grindless:pluto_orbit`.
- **Crossings:** ZPM (the catalogue), UV (machine 11).
- **Source:** real: the Event Horizon Telescope's Sgr A* image (2022); space VLBI (RadioAstron).

### Older machines, new modes

| Machine (era) | Mode | Recipe | Feeds |
|---|---|---|---|
| Hot cell (IV) | B-11, next free circuit | 4 boron trifluoride in the centrifuges → 1 boron-11 trifluoride + 0.25 boron-10 trifluoride *(tune)* | decaborane → the p–B11 capsule; boron-10 → the BN reactor (the isotope does not matter for hBN, and BNNT with B-10 shields neutrons better) |
| Fuel fabrication plant (IV) | thorium, three rows | thorium dust + oxygen → thorium oxide fuel assembly; thorium oxide + carbon + nitrogen-15 → thorium nitride fuel assembly + carbon monoxide; uranium-233 → U-233 fuel rod for IV's fission reactor | machine 2; IV's fission reactor |
| Extraction cascade (EV) | Yb strip, next free circuit | mixed rare-earth chloride → ytterbium oxide dust + the chloride back *(S0-8 verifies the chloride carries ytterbium)* | machine 9 |
| Cryogenic plant (EV) | two UV rows | nitric oxide → nitrogen-15 oxide + nitrogen-14 oxide (cryogenic NO distillation); Kuiper noble gas → argon + krypton + xenon | line 3; machine 17 |
| Syngas plant (HV) | shift, next free circuit | carbon monoxide + steam → hydrogen + carbon dioxide (water–gas shift) | the ark (CO₂), the network (H₂) |
| Composite autoclave (HV) | C-C aeroshell, next free circuit | carbon fibre (ZPM tholin reformer's PAN) + pitch → carbon–carbon aeroshell (`grindless:carbon_carbon_aeroshell`) | machine 3 |
| Diamond lattice fab (ZPM) | capsules, c3 and c4 | diamond shell + decaborane → p–B11 capsule; diamond shell + deuterium + helium-3 → D–He-3 capsule | machine 4 |
| Qubit fab (ZPM) | SNSPD, c3 | 1 NbN-coated wafer → 1 SNSPD array (`grindless:snspd_array`), tested in its He-3 fridge | machine 12 |
| Naquadria magnet works (ZPM) | UV cell, c4 | EnTED wire + darmstadtium plates + UV capacitors → `grindless:uv_smes_cell` *(S0-5)* | the network |
| GTM chemical reactor | rows keyed by our fluids | Triton nitrogen + oxygen → nitric oxide; nitrogen-15 oxide + hydrogen → nitrogen-15 + water; boron-11 trifluoride + sodium hydride → diborane → decaborane | lines 3 and 6 |

- Each mode is one row in the older machine's table or script, owned by the package whose contract lists that file.
- The hot cell row goes in `tables/hot_cell.json`, keyed by its circuit and an input no other row shares.
- The cryogenic plant's two rows share one file, so A1 and B4 run serially.
- ZPM is one era back, so the ZPM modes are older machines' modes but not crossings.

## Family steps

- **Vein drill, step 10:** the Neptune deep siphon. ZPM's flyby sample is the catalyst; the scoop head is the worn bit; the circuit picks the depth.
- **Vein drill, step 11:** the penetrator probe bay. It drills by falling: the probe is the bit, and the Triton ice core is the catalyst.
- **Greenhouse, step 7:** the ark biosphere, a closed ecosystem fed by Pluto's ices. It is the first greenhouse that keeps its own air.
- **Observatory, step 8:** the event horizon interferometer (Sgr A*). The precursor probe and the optical ground station are the family's outward eyes, not steps.
- **Power on site:** none. Sunlight is 0.11 % at Neptune and 0.064 % at Pluto; the stations draw from the network, and the probes carry curium.

## Reserve, and what was dropped

### What UV reserves for UHV

| Reserved | Why it waits | What UV leaves for it |
|---|---|---|
| Arrival at Proxima Centauri b (tier 8, level 8 rocket) | UHV's journey (`docs/journey.md:49`) | the Proxima approach data, the heliopause data |
| The Dyson swarm and the first Dyson swarm module | UHV infrastructure (`docs/research/space/gtm-tiers.md`) | the sail film, the fibre lasers, the network at UV |
| Berkelium and californium | need a high-flux reactor | heavy curium oxide (machine 3) |
| Uses for oganesson | none before UHV | the Mk3 row stays; oganesson is voidable |
| GTCA's space elevator and its modules | GTCA gives them no recipe (`docs/journey.md:164`); a tether from Earth is UHV-scale | ZPM's nanotube yarn, the BNNT yarn |
| UHV circuits beyond the Mk3's four | GTM's UHV | the neural culture vat |

### Considered and dropped

These are the machines that would have taken UV from 31 to the guideline's 36. Each one failed rule 4 or rule 7's "convenience versions do not count".
- **A COLEX lithium cascade (lithium-6):** tritium comes from IV's tritium removal facility, and the muon cell's blanket is a charge, not a stream. It would be a second tritium source with nothing new behind it.
- **A dilution refrigerator:** ZPM's qubit fab already runs a He-3/He-4 fridge, and the SNSPD array is tested there (*Older machines*).
- **An MHD generator:** a non-turbine conversion of plasma heat is ZPM's direct energy converter. Two of them would be the same machine with another name.
- **An oganesson cyclotron:** oganesson has no use until UHV, and GTM's Mk3 row already makes it.
- **A PBI polymer train:** ZPM's tholin reformer already makes diaminobenzidine.
- **A Mond carbonyl plant (nickel, cobalt):** GTM's nickel route suffices, and there is no UV consumer that needs carbonyl purity.
- **A thruster test stand:** the thruster works fires its thrusters in its own vacuum cell.
- **A radiation-hard foundry:** no UV item needs a separate rad-hard chip; the starchip's photonic chip is the hard part, and the synchrotron makes it.
- **A lunar far-side radio array:** a second machine for one observation; the interferometer at Pluto does the step.
- **A third Neptune machine or a Charon lander:** the penetrator's c2 already takes Charon's core; Neptune's two machines cover its gas and its moon.
- **Our own space elevator:** GTCA's exists and is hidden; building ours would leave two (*Open questions*).
- **Landing on Pluto, Triton or a Kuiper Belt object:** probes give the products as machine outputs (LuV decision 2, ZPM decision 2).

## Power on the wireless network

- **The UV tier** (package A9, with LuV-A4's mechanism and the table's rule):
  - UV wireless energy and dynamo hatches at 2, 4, 16 and 64 A (`gtceu:uv_wireless_energy_hatch` and `gtceu:uv_wireless_dynamo_hatch`, with `_4a`, `_16a` and `_64a`) and UV covers (`grindless:uv_wireless_energy_cover`, `grindless:uv_wireless_dynamo_cover`);
  - the UV cell, `grindless:uv_smes_cell`, wound by the naquadria magnet works' c4: six of GTM's UV reference battery, about 15.7 G EU *(tune; S0-5)*;
  - the tier's link is the **gravi star** (`gtceu:gravi_star`, neutronium-based, so after line 1): ZPM's quantum star moves down a tier, as the table's rule asks;
  - hatches stay capped at their rated amperage per window (ZPM's rule);
  - **the jump:** the network outputs UV only when every formed tower holds UV cells;
  - **before the jump:** two ZPM wireless hatches give UV voltage (the two-hatch rule).
- **Sources** (EU/t; GTM fuels from the dump carry `generators.js`'s ×2 where the type is listed; ours are written final):

| Source | Where | EU/t | Into the bank (−5 %) | Fuel and wear | Doubled by `generators.js`? |
|---|---|---|---|---|---|
| Accelerator-driven reactor (2) | Earth | 1,572,864 | 1,494,221 | 1 thorium assembly every 12,000 t (16,000 nitride) | no (written final) |
| Laser fusion chamber (4) | Earth | 2,621,440 | 2,490,368 | 1 p–B11 capsule every 400 t (180 an hour); 2 % module wear | no |
| Muon fusion cell (8) | Earth | 786,432 | 747,110 | 500 mB D–T every 1,200 t; 40 % tritium make-up | no |
| Mk3 + plasma turbine, americium, iron or nickel plasma (GTM) | Earth | from the dump *(S0-6)* | −5 % | Pu-241, Si + Mg, K + F | yes (the turbine's recipe) |
| IV's RTG cell on curium pellets | Earth | IV's figure | −5 % | 1 pellet, 3× the plutonium pellet's time | as IV's |
| Everything older | as built | ZPM's table | — | — | as in ZPM |

- **Thorium:**
  - one reactor burns 6 assemblies an hour (oxide), or 4.5 (nitride);
  - IV's stored thorium and its live centrifuge output decide how many reactors run;
  - every spent assembly comes back as uranium-233 to the fission reactor, so the cycle pays twice and the waste is fission products only.
- **Boron-11:**
  - a chamber burns 180 capsules an hour: each is a diamond shell (the lattice fab) and decaborane (the hot cell's B-11);
  - the lattice fab's throughput is the cap, by design;
  - helium-4 is the only exhaust.
- **D–T:** one cell burns 15,000 mB D–T an hour; the blanket returns 9,000 mB of tritium, and the 6,000 mB make-up is IV's tritium removal facility's work *(tune)*.
- **The gate's 8,388,608 EU/t out of the bank needs at least 8,830,114 in.** For example:

  | Source | EU/t |
  |---|---|
  | ZPM's gate mix (2 large naquadah reactors, LuV's mix) | 2,620,464 |
  | 2 accelerator-driven reactors | 3,145,728 |
  | 1 laser fusion chamber | 2,621,440 |
  | 2 muon fusion cells | 1,572,864 |
  | **In** | **9,960,496** |
  | **Into the bank (−5 %)** | **9,462,471** |

  Every new plant has to run: no single UV fuel carries the gate alone, so the era's three fuel chains (thorium, boron-11, D–T) all matter.
- **Rule 8:**
  - our three plants are written at their final figures (not in `generators.js`, never doubled twice);
  - each costs a chain: thorium assemblies and pyroprocessing, capsules and diamond shells, tritium and a linac;
  - the beam, the lasers and the muon production are paid inside the figure;
  - no source is fuel-free in UV.

## Fusion, and what is not fusion

- **The Mk3 is GTM's** (`gtceu:uv_fusion_reactor`, from `gtceu:assembly_line/fusion_reactor_mk3`, researched):
  - 4 UHV circuits (GTM's wetware mainframe), a quantum star, an americium double plate, 128 UHPIC and 32 EnTED single wires *(S0-8 prints the exact list)*;
  - **GTM wins (rule 6):** UV builds a ring that asks for UHV circuits. The neural culture vat makes that reachable in UV; the validator allows these four as GTM's exception.
- **What one ring costs:**
  - 16 UV energy hatches for a 640 M start (40 M per hatch);
  - Mk3 fusion casings and fusion coils as GTM has them *(S0-8)*;
  - americium is the ring's real cost, and it comes from ZPM's partitioning plant until line 1 runs: the Mk3 then makes its own.
- **Kept recipes:** the audit under *Only from there*. Neutronium is Mk3-only.
- **What is not fusion, or not a tokamak:**
  - the laser fusion chamber (inertial, p–B11 and D–He-3);
  - the muon fusion cell (catalysed, cold);
  - the accelerator-driven reactor (fission, subcritical).

  None makes a fusion-only material; they make power.

## Nothing one at a time

- **UV parallel hatch (×256):** GTM's recipe as it is.
  - **Who takes it:** every UV machine of ours except the generators (2, 4, 8), the single-shot probe bays (26, 28, 30), the launcher, the ground station and the interferometer.
  - The overclock voltage caps the copies: 256 copies of a 491,520 EU/t recipe need about 126 M EU/t, so full parallel is a network job.
- **The assembly line from AE2** builds:
  - the Mk3's controller;
  - the UHV energy hatch and field generator;
  - the gravi star's parts.
- **Research:** UV's research is paid in qubit arrays (ZPM) as before, plus the UHV hatch's research with the Sgr A* image (*Gate to UHV*).
- **Circuits in batches:**
  - the neural culture vat turns wetware from one-at-a-time into batches;
  - X-ray lithography doubles the UHPIC per wafer.

## AE2 between planets: the UV step

- **Two new pairs:** Neptune orbit and Pluto orbit (*Bridges and first arrivals*).
- **Power doesn't need them:** the wireless network carries it.
- **Capacity:**
  - the stations send fluids in bulk (hydrogen, helium, nitrogen, carbon monoxide, noble gases);
  - the probes' data are single items, so fluid cells matter most.
- **Time:** the stations run unattended while their chunks are loaded (FTB Chunks).

## New process lines

UV adds **22 lines** (ZPM added 14: ×1.57).

**What counts as a line (the user's rule):**
- a real chain, feedstock → intermediates → product, with honest byproduct destinations;
- at least four arrows;
- one chain counts once, however many machines it crosses;
- not counted: assemblies with no feedstock of their own (the precursor probe, the UV cell, the tier 11 tank) and data chains (charts, the Sgr A* image).

**Steps** is the number of items and machines between arrows, as for ZPM's table: ZPM averages **4.6**.

| # | Line | Steps | By-products → destination |
|---|---|---|---|
| 1 | Americium and neutronium | plutonium-241 (IV) → Mk3 → americium plasma → plasma turbine → americium → Mk3 (+ naquadah) → neutronium → gravi star | hydrogen back; oganesson voidable |
| 2 | Thorium cycle | IV's thorium → thorium oxide → fuel fabrication plant → thorium assembly → accelerator-driven reactor (2) → spent fuel → pyroprocessing cell (1) → uranium-233 → IV's fission reactor | fission products → ZPM's waste retrieval plant (synroc); polonium-210 contained → lead back to the coolant; oxygen → network |
| 3 | Nitrogen-15 | Triton nitrogen (25) → nitric oxide → EV cryogenic plant (NO distillation) → nitrogen-15 oxide → nitrogen-15 → thorium nitride → nitride assembly | nitrogen-14 oxide → nitric acid (GTM); water; ¹⁵N recovered by the pyroprocessing cell's c3 |
| 4 | Curium heat | curium oxide (ZPM) → Cm-244 pellet → iridium-clad pellet → GPHS module (C-C aeroshell) → probe RTG (SiGe) → penetrator, interceptor, precursor probe | heavy curium → stored for UHV (contained); iridium scrap → platinum plant |
| 5 | Muon-catalysed fusion | heavy water (IV) → deuterium + tritium (IV) → D–T mix → liquid D–T → muon fusion cell (8) → EU + helium | helium → the helium refrigerator; tritium partly bred back |
| 6 | Boron-11 | borax → boric acid → boron trifluoride → hot cell (B-11) → boron-11 trifluoride → decaborane → p–B11 capsule (lattice fab) → laser fusion chamber (4) | boron-10 → the BN reactor; helium-4 → the helium refrigerator |
| 7 | Neptune helium-3 | Neptune deep gas → deep siphon (24) → Neptune helium → superleak (5) → helium-3 concentrate → isotope column (ZPM) → helium-3 → D–He-3 capsule → laser fusion chamber | helium-4 → superfluid helium; HD-rich hydrogen → deuterium |
| 8 | Ytterbium fibre | rare-earth chloride (EV cascade) → ytterbium oxide → MCVD preform (9) → Yb fibre → fibre laser module (InGaAs pumps) → lasers (4, 15, 23) | chlorine → HCl → silicon tetrachloride; spent modules refurbished (c4) |
| 9 | InGaAs diodes | gallium (MV) + indium (Io) → trimethylgallium, trimethylindium (10) → InGaAs epi wafer (+ arsine) → diode bars → pump modules → fibre laser modules | methane → the pyrolyser; arsenic contained and back; salt |
| 10 | High-purity germanium | Io's germanium → germanium tetrachloride → distilled tetrachloride → germanium dioxide → germanium ingot → zone refining (11) → HPGe crystal → spectrometers, SiGe thermocouples | HCl → chlorine → back; impure ends → back to c1 |
| 11 | Boron nitride nanotubes | borax → boric acid → boron trioxide → hBN (+ Charon ammonia) → BNNT (13) → BNNT yarn → BNNT tank (16) | steam; ammonia back; hBN fines back |
| 12 | Sail film | silane + ammonia → Si₃N₄ film on a wake-shield wafer (21) → patterned film (X-ray mask, hBN) → release (XeF₂) → light sail → sail-chip | SiF₄ → IV's hot cell; xenon → back to XeF₂; hydrogen → station |
| 13 | SRF accelerators | niobium → RRR sheet → nine-cell cavity → electropolished, N-doped cavity → cryomodule (6) → linacs (2, 7, 8) | niobium scrap back; spent acid → niobium + CaF₂ → HF |
| 14 | EnTED wire | enriched naquadah + trinium + europium + duranium → EnTED powder → PIT billet → drawn wire → heat-treated EnTED wire (14) → the Mk3, the UV cell | silver sheath → back |
| 15 | Printed parts | UV metal ingots → atomised powder (Mars argon) → printed near-net part → pressed part (15) → thruster chambers, probe frames, UV gears | argon looped; powder and spatter back |
| 16 | Pluto's and Charon's ices | penetrator (26) → Sputnik and Charon cores → fractionator (27) → nitrogen, CO, methane, water, ammonia → syngas shift (HV) → hydrogen + carbon dioxide → the ark | methane → the pyrolyser; tholins → the tholin reformer; silicates voidable |
| 17 | Kuiper noble gases | interceptor (28) → planetesimal sample → annealer (29) → Kuiper noble gas → EV cryogenic plant → krypton, xenon → thruster works (17) → thrusters | argon → the printer; CO → the syngas plant; dust voidable |
| 18 | Antiprotons | hydrogen → COMET protons (GTCA) → synchrotron target (7) → antiproton cartridge → antimatter trap (22) → charged trap → ICAN pellets → precursor probe (30) | activated tungsten contained → tungsten; cartridges back |
| 19 | Closed life and wetware | Pluto CO₂ + Charon ammonia + cultures → ark (19) → growth medium → neural culture vat (20) → stem cells → neuro processing units → wetware mainframes | oxygen → network; biomass → MV's biorefinery |
| 20 | Starshot | NV diamond + Am-241 source + photonic chip → starchip (18) → sail-chip → laser sail launcher (23) → probe in flight → optical ground station (12) → Proxima approach data | spent laser modules refurbished |
| 21 | Superconducting nanowire detectors | niobium → NbN film on sapphire (10) → qubit fab (SNSPD mode) → SNSPD array → optical ground station | the fridge's helium looped |
| 22 | X-ray lithography | wafer → PMMA-coated wafer → X-ray exposure (7) → developed wafer → UHPIC dies, photonic chips → the Mk3, the starchip | developer back; gold mask kept |

- **Every line has at least four arrows, and the average is 6.9 steps against ZPM's 4.6.** The table is checked by counting its arrows; the C1 package re-counts them.
- **The weakest claims are named:**
  - line 20 ends in data, but its sail-chip and probe are consumed and its chain starts from three products;
  - line 21 is the shortest (5 steps).

  Neither is a split of another line: lines 12, 21 and 22 make different feedstocks into different products, and line 20 consumes them.

**Crossings with lines two or more eras back** (the guideline is about 20; ZPM had 13; UV has **24**):

| UV machine or line | Older line | Era |
|---|---|---|
| Accelerator-driven reactor, pyroprocessing cell | the uranium cycle's thorium (pitchblende centrifuge) | IV |
| Pyroprocessing cell, accelerator-driven reactor | fuel fabrication plant (thorium and U-233 assemblies) | IV |
| Line 1 (the Mk3's americium loop) | plutonium centrifuge (Pu-241) | IV |
| Muon fusion cell | heavy water plant, tritium removal facility | IV |
| Laser fusion chamber | hot cell (B-11 mode) | IV |
| Heat source works | Mercury's iridium (vein drill → platinum plant) | IV |
| Heat source works | the RTG cell (`gtceu:ev_rtg`) | IV |
| Light sail fab | hot cell (Si-28 mode takes the SiF₄) | IV |
| Fibre draw tower, thruster works | extraction cascade (ytterbium, lanthanum) | EV |
| Line 3, amorphous ice annealer | cryogenic plant (NO distillation, noble gases) | EV |
| Powder bed printer | Mars atmosphere processor (argon) | EV |
| MOCVD reactor | the gallium line | MV |
| Ark biosphere, neural culture vat | the biorefinery | MV |
| MOCVD reactor | Io's indium (fumarole condenser) | LuV |
| Zone refining tower | Io's germanium (fumarole condenser) | LuV |
| Superfluid helium plant, accelerator-driven reactor, muon cell | the helium refrigerator | LuV |
| Powder-in-tube line | the coated conductor line | LuV |
| Synchrotron, antimatter trap | the HTS magnet works | LuV |
| Ark biosphere | the algae bioreactor | LuV |
| Neural culture vat | the organoid lab, the biofoundry | LuV |
| Penetrator probe bay | the cryobot | LuV |
| Light sail fab | the wake shield facility | LuV |
| Heat source works | the composite autoclave (C-C mode) | HV |
| Volatile ice fractionator, amorphous ice annealer | the syngas plant (shift mode) | HV |

## Quests

Chapter **"UV — Pluto and the Edge"**: in English, about 50 small-reward quests that never block recipes.
- **It opens** with the Pluto–Kuiper chart and the multimessenger catalogue.
- **It closes** with the Proxima approach data and the Sgr A* image.
- No quest promises a machine that does not exist yet.

| Part | Quests |
|---|---|
| Fusion and neutronium | *Third Ring* (Mk3), *Americium Loop*, *Neutronium*, *Gravi Star*, *The Network Goes UV* |
| Power | *Thorium at Last*, *Back to Uranium-233*, *Nitrogen-15*, *Cold Fusion That Works* (µCF, with the extrapolation stated), *Boron-11*, *Three Alphas* (laser chamber), *Diamond Capsules* |
| Cold and accelerators | *Below Lambda* (He-II), *Superleak*, *Cavities*, *Cryomodule*, *Synchrotron Light*, *Antimatter* |
| Light | *Ytterbium Fibre*, *Pump Diodes*, *Thirteen Nines* (HPGe), *Counting Photons* (SNSPD) |
| Materials | *Nanotubes of Boron*, *Powder in Tube*, *Printed in Metal*, *Wound Tank* |
| Life | *The Ark*, *Grown Neurons* |
| Neptune | *Fifth Station*, *Deep Neptune*, *Triton's Geysers* |
| Pluto | *Level Seven*, *Sixth Station*, *Into the Heart* (Sputnik), *Charon*, *Ices Apart*, *Arrokoth's Kin*, *Trapped Since the Beginning* (annealer), *Krypton for Thrust*, *Curium Heat*, *Heliopause*, *The Shadow* (Sgr A*) |
| Starshot | *The Sail*, *Starchip*, *Launch*, *Light from Proxima*, *Gate to UHV* |

- `tools/quests/uv-chapter/` generates the chapter from a source file (C2); `es_es` titles come with it.
- **References:** Star Technology (MIT) and Monifactory (LGPL) space quests, adapted with attribution; GTNH and GT Leisure ideas only.

## Gate to UHV

No passive waits: every row is something built or run.

| What is built or run | What it tests |
|---|---|
| UHV hull and the UHV energy hatch (GTM's assembly line), after its research with the Sgr A* image as the scanned item (the pattern of ZPM's UV hatch and the solar-core survey) | the interferometer, Pluto, the research chain |
| Mk3 formed, with one americium run and one neutronium run | 16 UV hatches, EnTED, the four wetware mainframes |
| The gravi star; the network at UV (every formed tower on UV cells) and a calibrated load: 8,388,608 EU/t for 60 s through a 16 A UV wireless energy hatch into a GTM power substation | the power plan and the jump |
| One run of each new plant: an accelerator-driven reactor on a nitride assembly, a muon fusion cell, a laser fusion chamber on a p–B11 capsule | lines 2, 3, 5, 6 |
| The Proxima approach data | the Starshot (lines 8, 9, 12, 18 to 22) and the Moon |
| One representative run at each site: a deep siphon run and a geyser pass (Neptune orbit); a penetrator run, a fractionation, an interception and an anneal, a precursor launch (Pluto orbit); a sail and a trap charge (Earth orbit) | the stations work |
| 4 UHV circuits on the network | the neural culture vat and X-ray lithography |
| UV parallel hatch in one of our plants | mass production |
| Stored: heavy curium oxide, uranium-233 | UHV's breeding |

The ten-minute run of every base, untouched, lives only in the bench's integration test (C3).

**It unlocks UHV:**
- UHV hulls, hatches and components;
- the trip to Proxima Centauri b (tier 8, level 8 rocket);
- the Dyson swarm.

## Validator (`-Tier uv`)

- **Neutronium only from the Mk3.** No GT-- or GTM alternative is left open.
- **Naquadria from the stored impure solution or the Mk3** (the rule widens; see *Only from there*).
- **Nitrogen-15 only from Triton nitrogen** (line 3), or recovered by the pyroprocessing cell.
- **Neptune helium and HD-rich hydrogen only from the deep siphon; the Sputnik and Charon cores only from the penetrator; the planetesimal only from the interceptor; Kuiper noble gas only from the annealer.**
- **Antiprotons only from the synchrotron; the probe in flight only from the launcher; the Proxima approach data only from the ground station.**
- **Curium heat sources only from the heat source works; ytterbium oxide only from the cascade's Yb strip** *(S0-8)*.
- **Three substages:**
  1. `uv`: home, Earth orbit and the Moon;
  2. `uv-neptune`: Neptune orbit;
  3. `uv-pluto`: Pluto orbit (after Neptune: the penetrator's catalyst is the Triton ice core; the level 7 tank comes from UV home).
  - The Starshot's data needs `uv-pluto` (the launcher's catalyst is the heliopause data).
  - Nothing on the way to a substage asks for its materials.
- **Nothing in UV asks for UHV**, except the Mk3's four UHV wetware mainframes (GTM's recipe, rule 6), which the validator lists as an allowed exception, reachable through the neural culture vat.
- **The gate is built** only with UV and earlier things, research included.
- **Model:**
  - the three generators are EU sources into the wireless network;
  - the network's tier is a synthetic step: UV when the UV cells and the gravi star exist.
- **As built (C1):**
  - `tools/analysis/tiers/uv.json`, with the three substages;
  - dimension ids from `tables/orbits.json` and `tables/places.json`;
  - each package's targets warn until a dump carries it (`packages`);
  - C1 also re-counts the lines' arrows and the crossings (*New process lines*).

## Mods and integration

| Mod | Slug | Use in UV |
|---|---|---|
| GCYR | `gcyr` | two datapack planets (Neptune, Pluto) and four dimensions; two more stations; KubeJS fuel tank tier 11 (BNNT); no new motor |
| GTCA | `gtca` | COMET's protons (the synchrotron's c4) *(S0-7)*; its space elevator stays hidden |
| GTM | `gtceu` | the Mk3, the UV parallel hatch, wetware, the gravi star, the UHV energy hatch, EnTED |
| GT-- | `gtnn` | the large naquadah reactor (as in ZPM) |
| EU P2P Tunnel, MEGA Cells, Expanded AE | `eup2p`, `mega`, `expanded-ae` | the AE2 route and capacity |
| FTB Chunks | `ftb-chunks-forge` | the stations' loaded chunks |

No new mods.

- **Startup:**
  - the 31 machines through the pattern helper and their types; the shared blocks;
  - items: probes, cores, samples, data, the RTG and GPHS, the sail, the chip, the traps, the pellets, the fibre and modules, the crystals, the yarn, the tank;
  - fluids: `grindless:neptune_helium`, `grindless:neptune_hydrogen`, `grindless:triton_nitrogen`, `grindless:kuiper_noble_gas`, `grindless:superfluid_helium`, `grindless:helium_3_concentrate`, nitrogen-15, its oxide;
  - the UV wireless tier.
- **Server:**
  - the Mk3 audit (`tables/fusion_mk3.json`) and the composed recipes (older modes);
  - the UHV hatch's research re-registration;
  - the seeds and `sunlight.json` rows;
  - dimension allowlists and `G.noVoiding` where kept;
  - the generators' fuels.
- **Data:**
  - `data/grindless/gcyr/planets/{neptune,pluto}.json`;
  - `dimension/` (4) and `dimension_type/` (2); sky renderers (2);
  - `tables/planets.json` (two pair tags); `tables/stations.json` (two slots); `tables/am_powders.json`;
  - `hidden_until.json` (integrator).

## Save compatibility

- **Additive only:** new items, blocks, fluids, machines, two planets and four dimension ids. Nothing registered is removed or renamed.
- **Proxima Centauri b stays tier 8.** No planet moves.
- **Stations:** the four slots keep their ids, plots and positions; slots five and six only append (F2).
- **Older machines' new rows** use unused circuits or unique inputs; no existing recipe changes.
- **The naquadria rule widens** (the Mk3 route). Nothing a player built changes.
- **GTM recipes re-registered** (the UHV energy hatch's research) keep their ids, so data modules already written stay valid.
- **Machine shapes:** all new; no older multiblock changes shape.
- **The wireless table:** one row added. The ZPM row's link changes from "the tier's" to "the tier below's" only in the docs; the quantum star stays the ZPM link.
- **GTCA's space elevator:** stays hidden; its `until` moves from `uv` to `uhv` (integrator, `hidden_until.json`), so it does not appear without a recipe.

## Risks

| Risk | Where | Answer |
|---|---|---|
| A tier 11 KubeJS tank and a level 7 rocket do not fly to tier 7 | B1 | S0-1, before any Pluto package |
| Two more station slots break `lib/stations.js` | B1 | S0-3; the table is data-driven since ZPM |
| The Mk3 custom audit or a 640 M start fails | A3 | S0-4, the Mk2 pattern |
| The UV cell's capacity overflows | A9 | S0-5; the ZPM cell already stores above 2³¹ |
| Generators with item fuels, or our final figures doubled by mistake | A1, A3, A5 | S0-6 prints every generator's EU per fuel |
| COMET's ids or recipes differ in GTCA | A5 | S0-7; the fallback is our own proton source in the synchrotron |
| GTM lacks U-233, arsine, ytterbium in the chloride, or another id | A1, A6 | S0-8; register `grindless:` ids where missing |
| Muon-catalysed fusion as net power overstates real physics | A5 | named as an extrapolation in the doc and the quest |
| The Pluto–Earth interferometer is fiction | B5 | named as an extrapolation of space VLBI in the doc and the quest |
| GCYR gravity on Neptune or Pluto | B1 | never claimed: configured gravity is menu-only |
| Same-save reopen after the dimension adds | B1 | untested on the bench since ZPM; C3 does one save and reopen and reports |
| The era is too long | all | 22 lines, each with a reason; the stations are optional until the gate's site runs |

## Build order

UV is built in packages after v0.9.0, as ZPM was. Each package below is one work-package issue (`.github/ISSUE_TEMPLATE/work-package.yml`). Its id, objective, allowed and prohibited files, references, dependencies, invariants, acceptance, tests, agent and commits are written so the issue can be filled from this section alone. Each package's rationale is the machine sections it cites.

**Test bands** start at X 23040 (`tools\test\Get-GGTestZone.ps1 -Next` after ZPM-C3's 22784 row) and go in steps of 256. They are proposals: the integrator assigns each band when it opens the issue, and the worker adds only that row to `tools/test/zones.json`.

| Package | Proposed band (X) | Package | Proposed band (X) |
|---|---|---|---|
| S0 (all spikes, one after another) | 23040 | A10 | 25600 |
| A1 | 23296 | A11 | 25856 |
| A2 | 23552 | A12 | 26112 |
| A3 | 23808 | B1 | 26368 |
| A4 | 24064 | B2 | 26624 |
| A5 | 24320 | B3 | 26880 |
| A6 | 24576 | B4 | 27136 |
| A7 | 24832 | B5 | 27392 |
| A8 | 25088 | C3 | 27648 |
| A9 | 25344 | | |

F1, F2, C1 and C2 have no native test and no band.

### Common to every package

ZPM's *Common to every package* (`docs/eras/zpm.md:1016-1037`) applies with `zpm` replaced by `uv` in every path. Each contract below lists only what differs. The changes for UV:

- **Allowed, always:** `pack/kubejs/startup_scripts/grindless/uv/<name>.js`, `pack/kubejs/server_scripts/grindless/uv/<name>.js`, `pack/kubejs/client_scripts/grindless/uv_<name>_lang.js`, new tables `pack/kubejs/data/grindless/tables/<name>*.json`, `tools/assets/Build-UV<Name>Textures.ps1` and its outputs, `pack/kubejs/assets/emi/recipe/additions/grindless/uv_<name>_*.json`, `tools/analysis/test/uv-<name>.test.mjs`, `tools/test/overlay/kubejs/server_scripts/gg_test_uv_<name>.js` and the package's row in `tools/test/zones.json`.
- **Older machines:** each contract lists the one older file or table row it may touch. That file belongs to that package for the whole wave (*Parallel and serial*).
- **Invariants, always:**
  - no UV recipe takes a UHV-only input (a UHV circuit other than the Mk3's four wetware mainframes, a UHV hull, a Dyson swarm part, Proxima samples);
  - no UV recipe takes a UV output before the machine that makes it;
  - neutronium is made only by the Mk3; naquadria only from the stored solution or the Mk3;
  - our three generators are written at their final figures and are not added to `power/generators.js`'s list;
  - ZPM's invariants hold: one recipe per lookup path, written byproduct destinations, no removed or renamed id, *(tune)* figures free and routes, catalysts and sites fixed.
- **Tests:** T0 is `powershell -NoProfile -ExecutionPolicy Bypass -File tools\Check-Fast.ps1`. T1 is the one native test named in the contract, run once in its band. The bench runs one JVM at a time.
- **Repairs and agent:** at most 2 repairs, then escalate with the triage output, the suspected `path:line` and the attempts. Implementer (Sonnet) unless the contract says otherwise. Opus only for a cross-system contradiction.
- **Proof reuse:** a package whose machine is a plain recipe multiblock through `lib/patterns.js` with no new mechanism needs no T1 beyond the recipe lookup check. LuV and ZPM proved the helper, the dimension allowlist, the station chunks and the wireless hatches. The T1s below name only what is new.

### Spikes (S0): disposable, before any permanent id

Spikes run one after another in band 23040, before F1. Their files stay in the bench overlay and in the S0 row of `tools/test/zones.json`, and they register nothing in `pack/`. Each answers one question and returns pass or fail with its run id. A fail changes the named package's contract before it opens. The results go to `docs/research/uv-s0.md` (the S0 worker writes it).

| Spike | Question | If it fails | Changes |
|---|---|---|---|
| **S0-1** | A KubeJS `gcyr:fuel_tank` tier 11 with GCYR's elite motor builds a level 7 rocket that launches, reaches a tier 7 datapack planet's orbit and returns (ZPM-S0-1 proved tier 7 tanks build) | tank tiers above 10 are clamped: level 7 comes from a tier 9 tank and a second tank block, or Pluto drops to tier 6 with a gate item (orchestrator decision) | A11, B1 |
| **S0-2** | Two parentless datapack planets (Neptune tier 6, Pluto tier 7), each a void orbit with a sky renderer, register beside Saturn, Uranus and Proxima b (tier 8) and stay unreachable above their level | one button with two orbits, as ZPM's fallback | B1 |
| **S0-3** | A fifth and a sixth `more` row in `tables/stations.json` deploy two stations that keep across a disk save | escalation: `lib/stations.js` changes in F2 | F2, B1 |
| **S0-4** | `tables/fusion_mk3.json` loads with ZPM's audit code, and a custom `gtceu:fusion_reactor` recipe with `eu_to_start` 640 M runs on a formed Mk3 with 16 UV hatches and not on a Mk2 | the audit stays GTM's untouched and line 1 is re-scoped (orchestrator) | A3 |
| **S0-5** | A UV SMES cell of about 15.7 G is stored and reported; tier 8 wireless hatches register with ZPM's per-window cap | the cell is the largest safe value, recorded | A9 |
| **S0-6** | `G.generatorMultiblock` accepts an item fuel and a fluid fuel at 1.5 to 2.6 M EU/t, and `power/generators.js` does not double a type outside its list; the Mk3's plasma turbine figures as loaded | the three generators run on fluid fuel only (assemblies dissolved first) | A1, A3, A5 |
| **S0-7** | GTCA's COMET recipes and proton fluid ids as loaded | the synchrotron's c4 takes protons from our own ioniser row | A5 |
| **S0-8** | An id dump: neutronium, gravi star, americium, plutonium-241, oganesson, UHPIC, EnTED, wetware mainframe, ytterbium, indium, niobium, thorium, U-233, arsine, UV casings, the Mk3's recipe and its kept list | every missing id is registered as `grindless:` in F1 | F1, every A package |

Order: S0-8 first (it fixes F1's list), then S0-1, S0-2 and S0-3 (they fix B1), then S0-6, S0-4, S0-5 and S0-7.

### Foundation (serial)

#### F1. Registrations

- **Objective:** every UV material, item and shared block that more than one package uses exists, with names and textures and no recipe.
- **`<name>`:** `foundation`.
- **What:**
  - materials and fluids missing from S0-8's dump: uranium-233, thorium nitride, nitrogen-15 and its oxide, boron-11 and boron-10 trifluoride, decaborane, `grindless:neptune_helium`, `grindless:neptune_hydrogen`, `grindless:triton_nitrogen`, `grindless:kuiper_noble_gas`, `grindless:superfluid_helium`, `grindless:helium_3_concentrate`, liquid D–T, EnTED powder;
  - items made by one package and used by another: fuel assemblies, Cm-244 pellets and the GPHS, the C-C aeroshell, p–B11 and D–He-3 capsules, the SRF cryomodule, the antiproton cartridge, Yb fibre, InGaAs bars, HPGe crystals, SNSPD arrays, BNNT yarn, hBN dust, the EnTED wire, AM powders, the BNNT fuel tank, the sail, the starchip, the probe in flight, the Triton ice core, the Sputnik and Charon cores, the planetesimal, the heliopause data, the Proxima approach data, the Sgr A* image, the UV cell;
  - shared blocks: the laser module block (machines 4 and 23), the SRF cryomodule block (made by 6, a structure block in 7 and 8), and the UV casing if S0-8 finds no GTM casing to use.
- **Allowed:** the common set, plus `startup_scripts/grindless/uv/foundation.js`, `client_scripts/grindless/uv_foundation_lang.js`, `tools/assets/Build-UVFoundationTextures.ps1` and its outputs.
- **References:** *Our multiblocks* (the audit, `uv.md:219`) and each machine's *Recipes*; pattern `startup_scripts/grindless/zpm/foundation.js` and `tools/analysis/test/zpm-foundation.test.mjs`.
- **Depends on:** S0-8, S0-1 (the tank's id).
- **Invariants:** no recipe and no machine; ids exactly as in this file (a changed id is an escalation).
- **Acceptance:** every cross-package id is registered once, with `en_us` and `es_es`, and listed by `emi-coverage.mjs` as expected-unobtained until its package.
- **Tests:** T0; `tools/analysis/test/uv-foundation.test.mjs`. T1: none.
- **Commits:** 2 (registrations; textures).
- **Serial:** alone; every other package depends on it.

#### F2. Integrator step

- **Objective:**
  - `hidden_until.json`: GTCA's space elevator and its modules move from `until: uv` to `until: uhv`, and UV's new ids get their substages;
  - `lib/stations.js` changes only if S0-3 failed.
- **Allowed:** `pack/kubejs/data/grindless/tables/hidden_until.json`; `pack/kubejs/startup_scripts/grindless/lib/stations.js` only after a failed S0-3.
- **References:** *Save compatibility*; `docs/journey.md:164`; `startup_scripts/grindless/lib/stations.js:10`; `tables/stations.json:7`.
- **Acceptance:** the elevator stays hidden in a UV game; with S0-3 passed, no lib change.
- **Tests:** T0. T1: none.
- **Commits:** 1. The integrator runs it; it may overlap wave A.

### Wave A: home, Earth orbit and the Moon

Wave A packages depend on F1 plus the spikes named. They run two at a time, in the pairs of *Parallel and serial*.

#### A1. Thorium

- **Objective:** machines 1 (pyroprocessing cell) and 2 (accelerator-driven reactor); the fuel fabrication plant's three thorium rows; the cryogenic plant's NO distillation row; the chemical reactor rows of line 3 (Triton nitrogen → NO, ¹⁵NO → ¹⁵N).
- **`<name>`:** `thorium`.
- **Allowed (extra):**
  - `startup_scripts/grindless/iv/uranium_cycle.js` and `server_scripts/grindless/iv/uranium_cycle.js` (the fuel fabrication plant's rows only);
  - `server_scripts/grindless/ev/cryogenic_plant.js` (one row; B4 adds the second later).
- **References:** machines 1–2 (`uv.md:262`, `uv.md:287`); *Older machines, new modes* (`uv.md:803`); *Power* (`uv.md:860`); lines 2 and 3 (*New process lines*). Patterns: `zpm/naquadria.js` (a generator multiblock and its fuel loop) and `startup_scripts/grindless/iv/hot_cell.js` (hot cell casing). S0-6's run.
- **Depends on:** F1, S0-6.
- **Acceptance:**
  - the thorium loop closes (assembly → reactor → spent assembly → pyroprocessing → U-233 + fission products + ¹⁵N back);
  - the reactor gives 1,572,864 EU/t into the network and is not doubled;
  - the NO row runs only with Triton nitrogen's oxide.
- **Tests:** T0; T1: `gg_test_uv_thorium` in band 23296. Doubt: an item-fuelled generator multiblock with a beam input, at its final figure.
- **Commits:** 2 (machines; older rows).

#### A2. Heat sources

- **Objective:** machine 3 (heat source works) and the composite autoclave's C-C aeroshell row.
- **`<name>`:** `heat_sources`.
- **Allowed (extra):** `server_scripts/grindless/launch_road/composite_autoclave.js` (one row).
- **References:** machine 3 (`uv.md:313`); line 4; IV's RTG cell (the curium pellet's time); pattern `server_scripts/grindless/zpm/actinides.js`.
- **Depends on:** F1.
- **Acceptance:** Cm-244 comes only from the heat source works; the GPHS holds a pellet, iridium foil and the aeroshell; IV's RTG cell burns the curium pellet at 3× the plutonium pellet's time.
- **Tests:** T0; recipe lookup only (proof reuse: a plain recipe multiblock). T1: none.
- **Commits:** 1.

#### A3. Fusion Mk3 and boron-11

- **Objective:**
  - the Mk3 audit (`tables/fusion_mk3.json`) and line 1 (americium → neutronium, Pu-241 back);
  - machine 4 (laser fusion chamber);
  - the hot cell's B-11 row and the chemical reactor rows to decaborane;
  - the diamond lattice fab's capsule rows (c3, c4).
- **`<name>`:** `fusion`.
- **Allowed (extra):**
  - `pack/kubejs/data/grindless/tables/fusion_mk3.json` (new) and `hot_cell.json` (one row);
  - `startup_scripts/grindless/zpm/qubits.js` and `server_scripts/grindless/zpm/qubits.js` (the lattice fab's two rows only).
- **References:**
  - *The Mk3 audit* (`uv.md:185`), machine 4 (`uv.md:336`), *Fusion* (`uv.md:907`), lines 1 and 6;
  - pattern `server_scripts/grindless/zpm/fusion.js` and `tables/fusion_mk2.json` (ZPM's audit);
  - S0-4 and S0-6 runs.
- **Depends on:** F1, S0-4, S0-6.
- **Invariants:** GTM's Mk3 recipe keeps its id and research; neutronium is only the Mk3's.
- **Acceptance:**
  - the audit table loads and every row is kept or re-registered as written;
  - the chamber gives 2,621,440 EU/t from one capsule per 400 t;
  - B-11 and decaborane come only through the hot cell row.
- **Tests:** T0; T1: `gg_test_uv_fusion` in band 23808. Doubt: a 640 M custom recipe on a formed Mk3 (S0-4's mechanism with the real table).
- **Commits:** 3 (audit; chamber; older rows).
- **Never paired with A7:** they share `zpm/qubits.js`.

#### A4. Cold

- **Objective:** machines 5 (superfluid helium plant) and 6 (SRF cavity works).
- **`<name>`:** `cold`.
- **References:** machines 5–6 (`uv.md:356`, `uv.md:372`); line 7 (Neptune He-3, whose concentrate goes to ZPM's isotope column unchanged); line 13. Pattern: `server_scripts/grindless/luv/hts_magnet_works.js`.
- **Depends on:** F1.
- **Acceptance:** He-II needs liquid helium and the cryostat; the superleak row takes only `grindless:neptune_helium`; the cryomodule needs He-II, niobium and the electropolish.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 1.

#### A5. Accelerators

- **Objective:** machines 7 (synchrotron), 8 (muon fusion cell) and 22 (antimatter trap).
- **`<name>`:** `accelerators`.
- **References:** machines 7, 8 and 22 (`uv.md:389`, `uv.md:411`, `uv.md:648`); line 5 (µCF, a labelled extrapolation); line 18 (antiprotons); line 22 (X-ray lithography). S0-6 and S0-7 runs.
- **Depends on:** F1, S0-6, S0-7.
- **Invariants:** the trap is an Earth-orbit machine only (dimension allowlist); antiprotons come only from the synchrotron.
- **Acceptance:**
  - the cell gives 786,432 EU/t, with its tritium make-up written;
  - the synchrotron's c4 uses COMET protons or S0-7's fallback;
  - the trap refuses to run in the Overworld.
- **Tests:** T0; T1: `gg_test_uv_accelerators` in band 24320. Doubt: the trap's dimension veto, plus the µCF figure (S0-6's mechanism).
- **Commits:** 2.

#### A6. Photonics

- **Objective:** machines 9 (fibre draw tower) and 10 (MOCVD reactor), and the extraction cascade's Yb strip.
- **`<name>`:** `photonics`.
- **Allowed (extra):** `startup_scripts/grindless/ev/extraction_cascade.js` and `server_scripts/grindless/ev/extraction_cascade.js` (the Yb strip only).
- **References:** machines 9–10 (`uv.md:431`, `uv.md:447`); lines 8 and 9. Pattern: the cascade's ZPM europium rows (`server_scripts/grindless/ev/extraction_cascade.js:16`). S0-8 (Yb in the chloride, arsine).
- **Depends on:** F1, S0-8.
- **Acceptance:** ytterbium oxide comes only from the strip; the arsine byproduct has its written scrubber; InGaAs needs indium and the gas cabinet.
- **Tests:** T0; recipe lookup (the cascade's circuit row). T1: none.
- **Commits:** 2.

#### A7. Detectors

- **Objective:** machines 11 (zone refining tower) and 12 (optical ground station), and the qubit fab's SNSPD row.
- **`<name>`:** `detectors`.
- **Allowed (extra):** `startup_scripts/grindless/zpm/qubits.js` and `server_scripts/grindless/zpm/qubits.js` (the SNSPD row only).
- **References:** machines 11–12 (`uv.md:470`, `uv.md:486`); lines 10 and 21. Pattern: `server_scripts/grindless/zpm/qubits.js:73` (the He-3 fridge row).
- **Depends on:** F1, A3 merged (the shared file).
- **Acceptance:** HPGe needs the zone tower's thirteen nines; the ground station turns the probe in flight into the Proxima approach data only with SNSPD arrays.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 2.

#### A8. Materials

- **Objective:** machines 13 (boron nitride reactor), 14 (powder-in-tube line) and 15 (powder bed printer), and `tables/am_powders.json`.
- **`<name>`:** `materials`.
- **References:** machines 13–15 (`uv.md:503`, `uv.md:519`, `uv.md:534`); lines 11, 14 and 15. Pattern: a table-driven machine (`luv/hts_magnet_works.js` + `tables/hts_magnet_works.json`). S0-8 (EnTED composition).
- **Depends on:** F1, S0-8.
- **Acceptance:** BNNT yarn comes only from the BN reactor; EnTED wire comes only from the line; each AM powder row has its argon and its powder recycling.
- **Tests:** T0; `tools/analysis/test/uv-materials.test.mjs` (the table's rows against registered metals). T1: none.
- **Commits:** 2.

#### A9. The UV network

- **Objective:** the UV wireless tier (hatches, covers, the UV cell, the gravi star as link) and the naquadria magnet works' c4.
- **`<name>`:** `wireless`.
- **Allowed (extra):**
  - `pack/kubejs/data/grindless/tables/wireless_energy.json` (one row);
  - `startup_scripts/grindless/zpm/magnet_works.js` and `server_scripts/grindless/zpm/magnet_works.js` with `tables/magnet_works.json` (the c4 row).
- **References:** *Power* (`uv.md:860`); pattern ZPM's A5 and LuV's A4 (the tier mechanism, `startup_scripts/grindless/lv/wireless_energy.js`); S0-5.
- **Depends on:** F1, S0-5, A8 merged (the EnTED wire's recipe, for the acceptance run).
- **Acceptance:** the network goes UV only when every formed tower holds UV cells; hatches keep the per-window cap; the gravi star is the link.
- **Tests:** T0; T1: `gg_test_uv_wireless` in band 25344. Doubt: the cell's capacity and the jump with tier 8 hatches.
- **Commits:** 2.

#### A10. Life

- **Objective:** machines 19 (ark biosphere, greenhouse step 7) and 20 (neural culture vat).
- **`<name>`:** `life`.
- **References:** machines 19–20 (`uv.md:596`, `uv.md:614`); line 19. Pattern: ZPM's archaeal broth (`server_scripts/grindless/zpm/outer_chemistry.js`). S0-8 (wetware ids).
- **Depends on:** F1, S0-8.
- **Invariants:** GTM's wetware recipes stay; the vat adds a batch route and does not replace them.
- **Acceptance:** the ark closes its air (CO₂ from the syngas shift, O₂ back); the vat makes UHV wetware mainframes in batches from the ark's broth.
- **Tests:** T0; recipe lookup only. T1: none.
- **Commits:** 1.

#### A11. Propulsion

- **Objective:** machines 16 (cryotank winder) and 17 (thruster works), and the tier 11 BNNT tank.
- **`<name>`:** `propulsion`.
- **References:** machines 16–17 (`uv.md:550`, `uv.md:563`); *Route* (`uv.md:70`); ZPM's aerogel tank (`startup_scripts/grindless/zpm/travel.js`); S0-1.
- **Depends on:** F1, S0-1, A8 merged (BNNT yarn).
- **Acceptance:** a level 7 rocket builds from the BNNT tank and an elite motor; the thruster works takes krypton from the Kuiper row (registered in F1, made in B4).
- **Tests:** T0; T1: `gg_test_uv_propulsion` in band 25856. Doubt: the tier 11 tank's level in the real recipe.
- **Commits:** 2.

#### A12. Starshot

- **Objective:** machines 21 (light sail fab), 18 (starchip fab) and 23 (laser sail launcher on the Moon).
- **`<name>`:** `starshot`.
- **References:** machines 18, 21 and 23 (`uv.md:578`, `uv.md:631`, `uv.md:666`); line 20; *Gate to UHV*.
- **Depends on:** F1, A6 and A7 merged (fibre, diodes, SNSPD).
- **Invariants:** the launcher's catalyst is the heliopause data (made in B5), so a launch is UV-Pluto only; the trip to Proxima is UHV.
- **Acceptance:** the launcher runs only on the Moon; one run gives one probe in flight.
- **Tests:** T0; recipe lookup and the Moon allowlist (proof reuse: LuV's dimension veto). T1: none.
- **Commits:** 2.

### Wave B: Neptune and Pluto

#### B1. Travel and stations

- **Objective:**
  - Neptune (tier 6) and Pluto (tier 7) as GCYR datapack planets, with four dimensions and two sky renderers;
  - two `more` station slots;
  - the AE2 pairs' seeds and the `sunlight.json` rows.
- **`<name>`:** `travel`.
- **Allowed (extra):**
  - `data/grindless/gcyr/planets/{neptune,pluto}.json`, `data/grindless/dimension/` (4 files) and `dimension_type/` (2);
  - `tables/planets.json`, `tables/orbits.json`, `tables/places.json`, `tables/stations.json`, `tables/sunlight.json` (UV rows only);
  - `pack/kubejs/client_scripts/grindless/emi_info_lang.js` (UV travel rows).
- **References:** *Places and site rules* (`uv.md:115`), *Bridges* (`uv.md:147`), *AE2* (`uv.md:938`); pattern ZPM-B1 (`startup_scripts/grindless/zpm/travel.js`, `server_scripts/grindless/zpm/travel.js`); S0-1, S0-2, S0-3.
- **Depends on:** F1, A11 merged (the level 7 rocket), S0-1 to S0-3.
- **Invariants:** no existing dimension id changes; Proxima b stays tier 8 and unreachable; gravity is never claimed.
- **Acceptance:** level 6 reaches Neptune orbit and level 7 reaches Pluto orbit; both stations deploy and keep across a disk save; LuV's and ZPM's stations are unchanged.
- **Tests:** T0; T1: `gg_test_uv_travel` in band 26368. Doubt: the two flights and stations five and six.
- **Commits:** 2.
- **Serial:** alone.

#### B2. Neptune

- **Objective:** machines 24 (Neptune deep siphon, drill step 10, on ZPM's `gtceu:ice_giant_siphon` type with c4–c6) and 25 (Triton geyser sampler).
- **`<name>`:** `neptune`.
- **References:** machines 24–25 (`uv.md:681`, `uv.md:702`); lines 3, 7 and 16; pattern `server_scripts/grindless/zpm/uranus.js` (the siphon's c1–c3).
- **Depends on:** B1.
- **Invariants:** ZPM's c1–c3 siphon rows unchanged; the new rows run only in Neptune orbit.
- **Acceptance:** Neptune helium and hydrogen come only from the deep siphon; the Triton ice core comes only from the sampler.
- **Tests:** T0; T1: `gg_test_uv_neptune` in band 26624. Doubt: a shared recipe type with a per-dimension circuit split.
- **Commits:** 1.

#### B3. Pluto's ices

- **Objective:** machines 26 (penetrator probe bay, drill step 11) and 27 (volatile ice fractionator), and the syngas plant's shift row.
- **`<name>`:** `pluto_ices`.
- **Allowed (extra):** `server_scripts/grindless/hv/syngas_plant.js` (one row).
- **References:** machines 26–27 (`uv.md:718`, `uv.md:734`); line 16; pattern `server_scripts/grindless/zpm/titan_probes.js` (a probe bay).
- **Depends on:** B1, B2 merged (the Triton ice core is the penetrator's catalyst; F1 registers it, but the acceptance run uses B2's recipe).
- **Acceptance:** the Sputnik and Charon cores come only from the penetrator; CO from the fractionator reaches the shift row.
- **Tests:** T0; T1: `gg_test_uv_pluto_ices` in band 26880.
- **Commits:** 2.

#### B4. Kuiper

- **Objective:** machines 28 (Kuiper interceptor bay) and 29 (amorphous ice annealer), and the cryogenic plant's Kr/Xe row.
- **`<name>`:** `kuiper`.
- **Allowed (extra):** `server_scripts/grindless/ev/cryogenic_plant.js` (one row, after A1's).
- **References:** machines 28–29 (`uv.md:751`, `uv.md:762`); line 17.
- **Depends on:** B1, A1 merged.
- **Acceptance:** Kuiper noble gas comes only from the annealer; krypton reaches the thruster works.
- **Tests:** T0; T1: `gg_test_uv_kuiper` in band 27136.
- **Commits:** 2.

#### B5. The edge

- **Objective:**
  - machines 30 (precursor probe bay, heliopause data) and 31 (event horizon interferometer, observatory step 8);
  - the UHV energy hatch's research re-registered with the Sgr A* image.
- **`<name>`:** `edge`.
- **References:** machines 30–31 (`uv.md:779`, `uv.md:790`); *Gate to UHV* (`uv.md:1042`); pattern ZPM's UV-hatch research (`server_scripts/grindless/zpm/observatory.js`).
- **Depends on:** B1, A7 merged (the ground station, a structure input).
- **Invariants:** GTM's UHV hatch recipe keeps its id and every input; only its research item changes.
- **Acceptance:** the heliopause data and the Sgr A* image come only from Pluto orbit; the UHV hatch needs the image's research.
- **Tests:** T0; T1: `gg_test_uv_edge` in band 27392. Doubt: the re-registered research on an assembly line recipe (ZPM-A9's proof, new item).
- **Commits:** 2.

### Wave C

#### C1. Validator (`-Tier uv`)

- **Objective:** `tools/analysis/tiers/uv.json` with substages `uv`, `uv-neptune` and `uv-pluto`, the checks in *Validator*, and the re-count of the lines' arrows and the crossings.
- **Allowed:** `tools/analysis/tiers/uv.json` (new), `tools/analysis/test/uv-validator.test.mjs`, `tools/analysis/tiers/obtain.json` (UV rows only).
- **References:** *Validator* (`uv.md:1065`), *Gate to UHV*, *New process lines*; pattern `tools/analysis/tiers/zpm.json`.
- **Depends on:** every A and B package merged.
- **Acceptance:** the validator passes on the integrated pack. It fails on planted cases: neutronium outside the Mk3, a UHV circuit in a UV recipe other than the Mk3's four, a Pluto product before `uv-pluto`, and a doubled generator.
- **Tests:** T0. **Commits:** 1.

#### C2. Quests

- **Objective:** the chapter *UV — Pluto and the Edge* and the UV rows of the processing-line and power chapters, as data.
- **Allowed:** `tools/quests/uv-chapter/` (new, from `zpm-chapter`), `tools/quests/processing-lines/pl-data-uv.mjs` (new), `tools/quests/processing-lines/power-data.mjs` (UV rows), `GG_QUESTS_EXPECTED` in `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js`.
- **Prohibited (extra):** every `.snbt` under `pack/config/ftbquests/`, `tools/quests/lint-config.json`.
- **References:** *Quests* (`uv.md:1020`); `docs/quests.md`; `.github/instructions/quests.instructions.md`.
- **Depends on:** every A and B package merged.
- **Acceptance:** `node tools/quests/lint.mjs` with 0 errors and 0 warnings; the µCF and Pluto VLBI quests state the extrapolation.
- **Tests:** T0. **Commits:** 1.

#### C3. Integrated validation

- **Objective:** one run with every package, all six stations loaded, a v0.9.0 save, and the release notes.
- **Allowed:** `tools/test/overlay/kubejs/server_scripts/gg_test_uv_c3.js`, its zones row, the release notes file the integrator names.
- **References:** *Save compatibility*, *Gate to UHV*, *Power* (the gate example); pattern `gg_test_zpm_c3.js`.
- **Depends on:** C1, C2 and the integrator's regeneration (index, `hidden_until.json`, chapters, `emi-coverage --expect`).
- **Acceptance:**
  - the gate example runs (9,462,471 EU/t or more into the bank, 8,388,608 out for 60 s);
  - a v0.9.0 save opens with its stations, network and machines, and one save and reopen is reported;
  - the validator, the Node suite, `gg_test_recipe_lookup` and the quest tests pass.
- **Tests:** T0; T2 by the integrator in band 27648. **Commits:** 1. **Then v0.10.0.**

### Parallel and serial

At most two implementation workers at a time; one bench JVM.

| Step | Packages | How | Why |
|---|---|---|---|
| 1 | S0-8, S0-1 … S0-7 | serial | one JVM; they fix ids |
| 2 | F1 | serial, alone | everything reads its ids |
| 3 | F2 | integrator; may overlap step 4 | `hidden_until.json` only |
| 4 | A1 ‖ A2, then A3 ‖ A4, then A5 ‖ A6, then A8 ‖ A10, then A7 ‖ A9, then A11 ‖ A12 | two at a time | disjoint files: uranium cycle and cryogenic plant A1, autoclave A2, hot cell and `zpm/qubits.js` A3, cascade A6, `zpm/qubits.js` A7 (after A3), wireless table and magnet works A9 (after A8), A11 after A8, A12 after A6 and A7 |
| 5 | B1 | serial, alone | travel, station, place and sunlight tables, `emi_info_lang.js` |
| 6 | B2, then B3 ‖ B4, then B5 | B3 ‖ B4 in parallel | B3 needs B2's ice core; B4's cryogenic row follows A1's; neither touches `emi_info_lang.js` |
| 7 | C1, then C2 | serial | they read every final id |
| 8 | C3 | integrator | the batch's one T2 |

The `tools/assets/README.md` and `zones.json` rows are appended by parallel packages; the integrator resolves those one-line merges.

**Every cut lands with its replacement:**
- the Mk3's kept list (A3) lands with the americium loop that feeds it;
- the space elevator's `until` move (F2) lands before any UV id unhides;
- the UHV hatch's research (B5) lands with the interferometer that makes the image.

## Decisions proposed (architect; for the orchestrator)

The design above follows these. None is in `DECISIONS.md` yet; the orchestrator accepts, changes or rejects each. Each line is in the `DECISIONS.md` form.

1. `- 2026-10-27 · UV size: 31 progression machines (~36 guided), 22 new lines (avg 6.9 steps, none under 5), 24 crossings two or more eras back; complexity.md:105 superseded; no padding.`
2. `- 2026-10-27 · UV route: Neptune (tier 6) and Pluto (tier 7) are orbit-only stations 5 and 6; level 7 = elite motor + tier 11 BNNT tank; Proxima b stays tier 8 and opens in UHV.`
3. `- 2026-10-27 · UV wireless: UV cell ~15.7 G from the magnet works c4; the gravi star is the UV link, the quantum star stays ZPM's.`
4. `- 2026-10-27 · UV Mk3: GTM's ring with a custom audit (tables/fusion_mk3.json); neutronium only from the Mk3; naquadria from the stored solution or the Mk3.`
5. `- 2026-10-27 · UV Mk3 asks for four UHV wetware mainframes (GTM wins); the validator allows them; the neural culture vat makes them reachable in UV.`
6. `- 2026-10-27 · UV generators (accelerator-driven, laser fusion, muon fusion) are written at final figures and are not in generators.js's doubling list.`
7. `- 2026-10-27 · UV keeps GTCA's space elevator hidden: its until moves from uv to uhv (no recipe from GTCA).`
8. `- 2026-10-27 · UV Starshot: the probe launches in UV and its approach data gate UHV; the arrival at Proxima is UHV.`
9. `- 2026-10-27 · UV extrapolations named in the doc and quests: net-power muon-catalysed fusion and Pluto–Earth VLBI.`
