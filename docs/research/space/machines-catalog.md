# Machine catalog for the Earth → galactic-core spine

Research note, 2026-10-24, for the era redesign: the pack becomes a journey from Earth to Sagittarius A*, and the last project (the largest multiblock of the pack) reaches the black hole and blows it up. Fixed points: the end of HV is the first rocket and the Moon, and the Moon gives something EV needs.

Sources: `research/content/*.md` (GTL first, then GTNH, Star Technology, Monifactory, GCYS/Supersymmetry, other packs, TFG, Nomifactory), the GTM 7.5.3 and GCYR sources in `files/gtm-src/`, and the live HV recipe dump (`scratch/reachability/hv-final/dump`, 77 600 recipes). Figures quoted for GTM or addons were read in that dump. Everything else is a proposal, and figures marked *(tune)* still need balancing.

**Legend**
- **KJS (feasibility):**
  - **K**: recipe type plus a pattern through `lib/patterns.js`, plus GTM recipe conditions.
  - **K+**: K plus at least one of: a JS recipe modifier, a machine hook (`beforeWorking`, `onWorking`, `afterWorking`) or a new predicate in the helper (coils, parallel hatch).
  - **J**: needs Java (own machine class, persistent state, custom rendering, a true cross-dimension capability).
- **Licence:**
  - **MIT** or **LGPL**: code and data can be adapted, with attribution.
  - **idea**: re-implement only. This covers GTL (licence unclear), the GTNH pack (CC BY-NC-SA; its Java is 1.7.10 anyway), GT++, Susy-Core and legacy Gregicality (GPL), GTO (PolyForm-NC) and GTQT (AGPL).
  - **real**: real physics or engineering, free to use.

## 0. What the pack already has

- **Planet rules are cheap.** The GTM 7.5.3 recipe schema (`GTRecipeSchema`) exposes these conditions from KubeJS:
  - `dimension`, `biome`/`biomeTag`, `posY`, `rain`, `thunder` and `daytime(isNight)`;
  - `adjacentFluids` and `adjacentBlocks`;
  - `environmentalHazard`: chunk hazards such as carcinogen, poison, chemical burns and CO poisoning (GTM's `air_scrubber` already uses it);
  - `cleanroom`, `CWUt`/`totalCWU`, `research` and `fusionStartEU`;
  - `addCondition`, which takes any condition, including GCYR's `{"type":"orbit"}` and `{"type":"dyson_sphere"}` used in its Dyson recipes.

  So "a machine that only works there" is just recipes with `.dimension(...)`. "The environment changes how machines work" is one data table, `planets.json` (light, atmosphere, temperature, gravity, radiation), read by a JS recipe modifier from the machine's level (K+).
- **GCYR 0.2.9 (LGPL, installed).**
  - **Places:** dimensions `gcyr:luna`, `gcyr:mars`, `gcyr:venus` and `gcyr:mercury`, plus the Proxima Centauri b blocks (regolith, turf, `prb_underground_bulb`, `prb_underground_mushroom`).
  - **Veins (12),** waiting in `veins_excluded.json` "until space":
    - Moon: bauxite, ilmenite, aluminium.
    - Mars: scheelite/tungstate; iron/hematite/pyrite; nickel/garnierite/pentlandite/cobaltite; monazite/molybdenite/bastnasite/neodymium; copper; zinc.
    - Venus: tungstate/scheelite/bauxite; sulfur; copper; iron.
    - Mercury: redstone, cinnabar, ruby.
  - **Machines:**
    - rockets built from blocks (basic, advanced and elite motor and tank, seat, launch pad), checked by the rocket scanner (an EV-class multiblock);
    - space station packager (LuV), oxygen spreaders (IV–UHV) and satellites (GPS, laser, ore finder, Dyson swarm);
    - space elevator: a pattern about 25 wide and 31 rows high. Its recipe type makes the Dyson parts at 122 880 EU/t.
    - Dyson system controller (UV): −524 288 EU/t in orbit and −131 072 elsewhere, with build and repair recipes;
    - drone hangar, regolith items (`lunar_mare_regolith`, `mars_regolith`, `venusian_regolith`, `moon_sand`) and a thermal upgrade for the space suit.
- **Planet-only resources still have to be made.** GCYR's planet veins are Earth materials. Today He-3 comes only from helium separation (80 mB of He → 5 mB, 80 EU/t) and liquid nether air (EV). The exclusive outputs have to be ours (regolith chemistry, volatiles, atmospheres, deuterium-rich ice…), and the few Earth sources have to be cut.
- **Cross-dimension links are already installed.** Unless they are gated, interplanetary transport is free:
  - GTM ender item, fluid and redstone link covers (GT-- adds item and fluid ones; range across dimensions to verify);
  - EnderChests and EnderTanks (MV);
  - the AE2 quantum link and ring (LV);
  - the gtmutils WEB hub and receiver (energy; cross-dimension not verified);
  - Extended Features wireless data (LuV–UV).
- **Late machines already in the pack (do not duplicate):**
  - GT-- rocket engines EV–LuV (−2 048 EU/t; RP-1 mix 4 mB/3 t, UDMH 1 mB/6 t, dense hydrazine 2 mB/3 t, MMH nitrate 1 mB/3 t), naquadah reactors and the neutron activator;
  - GTCA Comet (protons, neutrons and electrons from H₂, 30 720 EU/t), Tegmark Forge (matter from particles, with research), Nano Forge and PCB factories;
  - GTCA purification units and space miner/pump/elevator: structures with placeholder recipes and no controller recipe.
- **Limits.**
  - `lib/patterns.js` caps a slice at 16 rows, so the giant structures need a 32- or 64-row extension.
  - KubeJS cannot subclass machine classes. Persistent state (integrity, saturation, decay timers) is J. The pack's usual stand-in is non-consumed catalyst items that wear by chance, like vein samples and drill bits.

## (a) Earth-side machines per era

The best of the earlier expansion pass, rethought for the spine. Every era also keeps its existing multiblocks (vein drill, greenhouse, arc furnace, ore plant, biorefinery, refinery, reformer, platinum plant, naquadah plant).

| Era | Machine (`gtceu:` id) | What it wins | Source · licence | KJS |
|---|---|---|---|---|
| Steam | **Steam blast furnace** (`steam_blast_furnace`) | Raw iron ores + coke + calcite + a steam blast → steel + ash. Wins steps (smelting and PBF in one) and speed: GTM's PBF takes 1 500 t per steel ingot with coke (600 t from wrought iron) and needs ingots. Steel bits for the drill stop being the bottleneck. | Star Tech Solid Blast Furnace (MIT); Cosmic Frontiers IPBF (LGPL) | K (GTM steam multiblock class, ≤ 32 EU/t) |
| Steam | **By-product coke battery** (`coking_battery`) | Coal + steam → coke + creosote + coal gas. The coke oven keeps only creosote (500 mB per coal, 900 t); the gas is recovered only by MV pyrolysis (16 coal + 1 000 mB of steam → 16 coke + 4 000 mB of coal gas). Wins yield. Coal gas → LV gas turbine (96 EU/mB) or the biorefinery (coal tar, NH₃, ethylbenzene). | Supersymmetry coking tower (idea); real | K |
| Steam | **Clockwork observatory** (`steam_observatory`) | Night, clear sky and high ground → the first lunar chart (data item, not consumed). The spine's first step: navigation data only comes from looking. | real; Star Tech Dimensional Finder (MIT) | K (`daytime(true)`, `rain` reverse, `posY`) |
| LV | **Sulfide roaster with contact acid plant** (`sulfide_roaster`) | Runs GTM's EBF roasts with **air** instead of separated O₂: sphalerite → zincite + 1 000 mB of SO₂; pyrite → hematite + 2 000; galena → massicot + 6 silver nuggets; also stibnite and tetrahedrite (each 120 EU/t, 1 200 K, 3 000 mB of O₂). Then SO₂ + air + water → H₂SO₄ + steam (in GTM, two chemical-reactor steps). Wins steps, heat back to the turbines and silver at LV. | GCYS Roaster (MIT); real | K (2 LV hatches = 120 EU/t) |
| LV | **Heliostat tower** (`heliostat_tower`) | Mirror field + receiver: water → steam by day, stored in GTM multiblock tanks for the night. The first solar plant, and the rule that will govern Moon and Mercury bases. | GTNH Solar Tower (idea); TFG large solar panel (LGPL, a pure-KubeJS generator) | K (`daytime`) |
| LV | **Optical observatory** (`optical_observatory`) | Tracking refractor: ephemerides and a detailed Moon map (the Steam draft becomes the HV launch chart). | real | K |
| MV | **Engine test stand** (`engine_test_stand`) | Static fire: untested motor (GCYR basic motor) + fuel → qualified motor + exhaust (CO₂, water). No rocket flies an untested engine, and it uses the refinery fuels. | GTO rocket assembler (idea); real | K |
| MV | **Radio telescope** (`radio_telescope`) | Dish array: deep-space tracking and the landing site for the HV launch. | real | K |
| MV | Silicon works (option) | SiO₂ + C → silicon → boule, with its CO (2 000 mB per ingot, 64 000 per boule) reduced to methanol inside (takes H₂). | own | K |
| HV | **Composite autoclave** (`composite_autoclave`) | GCYR fiberglass, para-aramid or kapton K + epoxy → heat-shield tiles, fairings, pressure tanks. A pressure-and-heat cure that no small machine does. | Supersymmetry layup machine (idea); real | K |
| HV | **Syngas and shift plant** (`syngas_plant`) | Coal, coke or heavy residue + steam → CO + H₂; then shift: CO + steam → H₂ + CO₂. GTM has no water-gas shift (CO only goes to methanol, acetic acid or electrolysis). Turns the CO from silicon and Kroll into H₂ for rockets and the refinery. | real | K |
| HV | **Launch complex** | GCYR rocket scanner and launch pad, re-gated from EV to HV: the HV exit (first rocket, Moon). | GCYR (LGPL) | J (exists) + K recipes |
| EV | **Ostwald tower** (`ostwald_tower`) | Air + H₂ → NH₃ → HNO₃ in one pass, on a Pt-Rh gauze from the platinum plant that wears by chance. Closes a loop with the plant (which eats HNO₃) and feeds N₂O₄, UDMH and hydrazine propellants (GT--). In GTM: `ammonia_from_elements` (384 EU/t) + `nitric_acid_from_ammonia` in the LCR. | real | K |
| EV | **Cryogenic plant** (`cryo_plant`) | Air → LN₂, LOX and LAr, and H₂ → LH₂, in one structure. In GTM: liquid air at 480 EU/t × 80 t, LOX at 1 920 EU/t × 240 t per bucket, then the tower. Same energy, fewer steps. LOX and LH₂ feed the rockets and the IV extreme engines. | real; GTL liquid-air line (idea) | K |
| EV | **Combined-cycle plant** (`combined_cycle_plant`) | Burns refinery gas at turbine value and boils water with the exhaust → extra steam for the large turbines (+≈ 40 % per mB, *(tune)*). If nobody uses the steam, it stops. | real (CCGT); GTNH large heat exchanger (idea) | K (EU out + steam out) |
| EV | Hot strip mill (option) | Hot ingots + water → plates and rods + steam (freezer and bender in one). | real | K |
| IV | **Hot cell** (`hot_cell`) | Radiochemistry behind lead glass: radon with the Pu-239 kept inside (no smelting loop through AE2), U-235/Th split, and **RTG pellets** for outer-system bases. | legacy Gregicality PUREX (idea); real | K |
| IV | **Rare-earth extractor** (`rare_earth_extractor`) | Monazite or bastnasite (Mars) → Nd, Sm…, with an extractant loop. Samarium for the LuV magnets. | Supersymmetry mixer-settler (idea); GTNH Lanthanides (idea) | K |
| IV | **Sintering press** (`sintering_press`) | W, WC and HSS-G from powder + binder under H₂ or Ar, without the 3 600–5 400 K EBF and the freezer. | Supersymmetry HIP (idea); real | K |
| LuV+ | Heavy-water tower, Czochralski puller (`roadmap-luv-plus.md`); decay hastener (GTL, idea); beam line (GTNH, idea) | Home industry while the frontier moves out; Mars deuterium-rich ice can feed the tower. | as noted | K |

## (b) Planet-site machines

### Destinations and rules (proposal, *(tune)*)

| Era | Destination | Rules (air · temperature · gravity · radiation · light) | Exclusive resources | Local power |
|---|---|---|---|---|
| HV → EV | Moon | vacuum (no combustion, free vacuum) · ±150 °C day/night · 0.17 g · unshielded · light ×1.4 | regolith O₂ and metals, He-3, meteoritic PGM, sintered regolith. **EV hook options:** titanium from ilmenite regolith, PGM that seed the platinum plant, or vacuum-deposited thin films (wafers, solar cells) | solar + batteries; RTG later |
| EV | Mars | thin CO₂ (no O₂ to burn) · −60 °C · 0.38 g · dust storms · light ×0.43 | Martian air; ice with ≈ 5× deuterium (real); perchlorates; GCYR W and rare-earth veins (→ IV) | methalox; weak solar |
| EV/IV | Venus | 92 bar CO₂ + H₂SO₄ clouds · 460 °C (coolant tax) · 0.9 g · dark surface | cloud H₂SO₄ and SO₂, sulfur, GCYR W | heat engine |
| IV | Mercury | vacuum · 430 / −180 °C · light ×6.7 | cinnabar (Hg), polar ice | solar ×6.7 |
| IV | Asteroid belt, Ceres | microgravity (worked from orbit, see (c)) · light ×0.13 | Fe-Ni with bulk Ir/Os (answers the IV iridium wall); NH₃ clays and brines (Ceres) | solar; RTG |
| LuV | Jupiter: Io, Europa, Ganymede | extreme radiation (shielded casings) · cold · Io volcanism | Io sulfur and lava heat; Europa ocean brine and life; Ganymede ice | Io geothermal; RTG, fission |
| LuV/ZPM | Saturn: Titan, Enceladus | Titan: 1.5 bar N₂/CH₄ at −180 °C (free cold, cheaper superconductors) · Enceladus geysers | CH₄/C₂H₆ lakes, tholins, geyser organics | methane + imported O₂; RTG |
| ZPM | Ice giants (from orbit), Pluto/Kuiper | deep cold · light ×0.001 | diamond rain, He-3/D from orbit; N₂ and CO ices | RTG, fission, beamed power |
| UV | Proxima b (GCYR) | red-dwarf flares (radiation spikes) · tidally locked | alien flora → bioware | solar on the day side |
| UHV | Nearby stars, white dwarf | degenerate matter, no landing | white-dwarf matter | Dyson swarm |
| UEV | Neutron star, pulsar, kilonova remnant | orbital only · crushing gravity | neutronium; r-process Eu, Au, Pt | pulsar beam |
| UIV | Stellar black hole (Cygnus X-1 type) | tidal stress · accretion X-rays | accretion plasma | Penrose / Blandford–Znajek |
| UXV–OpV | Galactic bulge → Sgr A* | star crowding · S-stars | disk plasma, stellar matter | star lifting |
| MAX | Sgr A* | — | — | the final project, see (e) |

### Machines built on site (their recipes carry `.dimension(...)`)

| Machine (id) | Where, era | What it wins | Source · licence | KJS |
|---|---|---|---|---|
| **Regolith electrolysis cell** (`regolith_cell`) | Moon, EV | Molten regolith → O₂ + Fe/Si/Al/Ti. The only O₂ without air: life support and LOX. Its second mode sinters regolith into bricks, the casing of every lunar base (made only there). | real (NASA/MIT molten regolith electrolysis) | K |
| **Volatiles oven** (`regolith_oven`) | Moon, EV | Heated regolith → He-3 + H₂ + N₂ + traces of water. He-3 becomes Moon-only. | real | K |
| **Solar array field** (`solar_array`) | Moon (EV) onwards | Generator gated by `daytime`. Output × the profile's light (Moon ×1.4, Mercury ×6.7, Mars ×0.43…). | TFG large solar panel (LGPL) | K / K+ |
| **Atmosphere processor** (`atmosphere_processor`) | Mars, EV | Martian air (a collector recipe with `.dimension`) → O₂ + CO (MOXIE), and CO₂ + H₂ → CH₄ + H₂O (Sabatier): local methalox and breathable O₂. | real (MOXIE, Sabatier) | K |
| **Ice miner** (`ice_miner`) | Mars, EV/IV | Buried ice → water with ≈ 5× deuterium → heavy water for the LuV tower and fusion. | real | K |
| **Cloud harvester** (aerostat, `cloud_harvester`) | Venus, IV | High altitude (`posY`) → H₂SO₄ + SO₂ + CO₂ in bulk. | GTL Venus acid (idea); real | K |
| **Venus heat engine** (`venus_heat_engine`) | Venus, IV | Hot surface against a cloud-cooled radiator loop → EU. Impossible anywhere cooler. | real | K |
| **Solar foundry** (`solar_foundry`) | Mercury, IV | Sunlight ×6.7 runs smelting and EBF-type recipes up to a set temperature with no EU by day. | Supersymmetry solar furnace (idea) | K |
| **Volcanic tap** (`volcanic_tap`) | Io, LuV | Adjacent lava (`adjacentFluids`) + low `posY` → steam or EU + sulfur. | real | K |
| **Cryobot** (melt probe, `cryobot`) | Europa/Enceladus, LuV | RTG-heated probe melts down to the ocean → brine, organics and biological samples (non-consumed catalysts for the bio lines). | real | K |
| **Lake pump and tholin harvester** | Titan, ZPM | Free CH₄ and C₂H₆; tholins → polymer and bioware feedstock. The cold makes superconducting machines cheaper (modifier). | GTL Titan fluids (idea); real | K / K+ |
| **RTG pack** (`rtg`) | any base, IV onwards | Hot-cell pellets → small, steady EU where solar fails. The pellet wears by chance. | real | K |
| **Life support** (`life_support`) | every base | CO₂ → O₂ (with the greenhouse) and water recycling; GCYR oxygen spreaders fill the rooms. | real; GCYR (LGPL) | K |

Planet drills and greenhouses are the family steps in (f): same tables, local veins and crops, and a shape that only forms with local casings.

**Environment rules** (one modifier fed by `planets.json`, K+):
- **Vacuum:** combustion recipes are refused; degassing and vacuum recipes run faster.
- **Heat:** coolant consumption is multiplied.
- **Cold:** cryogenic recipes cost less EU.
- **Low gravity:** crystal growth runs faster.
- **Radiation:** structures need shielded casings; GTM `environmentalHazard` for zones (how chunks get seeded, verify).
- **Light:** solar factor by distance.

## (c) Orbital stations and transport

| Machine (id) | Era | What it wins | Source · licence | KJS |
|---|---|---|---|---|
| Station core (GCYR packager) | LuV | Orbital base that hosts the modules below. | GCYR (LGPL) | J (exists) |
| **Orbital survey** (`orbital_survey`) | EV/IV | Ore-finder satellite + spectrometer → remote vein samples: a planet drill starts without anyone landing. | GCYR satellites (LGPL) | K |
| **Orbital mining laser** (`orbital_mining_laser`) | ZPM | Remote sample + EU → that planet's veins from orbit. No base, no landing. | GCYR laser satellite (not implemented; idea); GTNH void miner (idea) | K (`orbit`) |
| **Gas-giant siphon** (`gas_giant_siphon`) | LuV–ZPM | Orbit of Jupiter, Saturn, Uranus or Neptune: the circuit sets the depth → H₂, He, He-3, CH₄, NH₃; the ice giants also give diamonds. | GTNH planetary gas siphon (idea); real | K |
| **Asteroid processor** (`asteroid_processor`) | IV–LuV | Drone-captured chunks (drones not consumed, they wear) → Fe-Ni + bulk PGM + volatiles. | GTL resource module (idea); Monifactory microminer (LGPL/idea); real | K |
| **Microgravity foundry** (`microgravity_lab`) | LuV | Zero g: boules and crystals faster, ZBLAN fibre, foam metals, perfect bearings. | GTO orbital facilities (idea); GTL gravity hatch (idea); real | K (`orbit`) |
| **Orbital shipyard** (`orbital_shipyard`) | ZPM | Assembles ships and probes too big to launch. | GTNH space-elevator assembler (idea) | K |
| Cargo rockets and shuttles (GCYR) | HV onwards | The first link, in person. | GCYR | J (exists) |
| **Entangled freight** (AE2 quantum bridge, re-gated) | EV onwards | Each half of the singularity is made only at its own end of the link and travels once by rocket: visit once, then automate. | AE2 + own recipes | K |
| **Mass driver and catcher** (`mass_driver`) | EV/IV | Electromagnetic launcher: EU + capsule → freight off low-gravity bodies (the Moon first); capsules come back. | real (O'Neill) | K+ (push into the paired catcher with `server.getLevel`, chunks force-loaded) / J |
| Space elevator (GCYR) | ZPM | Surface ↔ orbit in bulk without rockets; hosts modules. | GCYR | J (exists) |
| **Propellant depot** (`propellant_depot`) | EV onwards | Stores LOX and LH₂, with boil-off unless a cryocooler runs. | real | K+ |
| **Beamed power: emitter + rectenna** (`rectenna`) | LuV onwards | Power from orbital solar and Dyson stations to the bases (GCYR beam-receiver casing). | real; GCYR (LGPL) | J for a true EU link; K+ over gtmutils WEB (verify cross-dimension) |
| **Laser-sail array** (`laser_sail_array`) | UV | Launches gram-scale probes to Proxima; arrival unlocks the far gate. | real (Breakthrough Starshot) | K |
| **Warp gate pair** (`warp_gate`) | UHV onwards | Interstellar link once a probe arrives; the exotic-matter stabiliser wears by chance per transfer. | Star Tech stargates (MIT, without Stargate Journey); legacy Gregicality wormhole chain (idea); GTNH Stargate (idea) | K (crafting chain) / J (travel) |

The progression goes visit → automated, linked bases → orbit without landing:
- **Visit:** rocket plus suit (HV–EV).
- **Linked bases:** entangled freight, mass driver and beamed power (EV–LuV).
- **Orbit without landing:** survey, mining laser and siphons (LuV–ZPM).

## (d) Star and system scale

| Machine (id) | Era | What it wins | Source · licence | KJS |
|---|---|---|---|---|
| Dyson sphere (GCYR) | UV | −524 288 EU/t in orbit; parts from the space elevator; repair recipe. | GCYR (LGPL) | J (exists) |
| **Dyson swarm** (`dyson_swarm`) | UHV | GCYR covers only the Sun. Ours works for every star: swarm segments are non-consumed items that wear by chance (the drill-bit idiom); output × the star's class. | GTNH Dyson swarm ground unit (idea); GTL Dyson sphere control system (idea) | K |
| **Stellar forge** (`stellar_forge`) | UEV | Uses a star's heat: parallels from the temperature margin, plus a catalyst bonus. | Star Tech Hell Forge (MIT); GTL and legacy Gregicality Stellar Forge (idea) | K+ |
| **Star lifter** (`star_lifter`) | UXV | Magnetic heating lifts stellar plasma (H, He, C, O, Fe) → fusion feed and exotic metals. | real; roadmap's "stellar lifting" | K |
| Bussard scoop (`nebula_scoop`) | UEV | Interstellar or nebula gas → H/He and exotic gases. | real | K |
| Pulsar timing station | UEV | Navigation fixes for the jump to the core (observatory family). | real | K |
| Matrioshka computer | UIV | Star-powered computation for the last research. | real | J (CWU provider) / K (data items) |

## (e) Black-hole project candidates

| Candidate | What it wins | Source · licence | KJS |
|---|---|---|---|
| Pseudostable black-hole containment field ("black-hole compressor") | A black hole made from a seed item; it decays 1 %/s, a collapser closes it, spacetime halts the decay. A hazard you manage. | GTNH (idea) | K+ (decay = a containment catalyst that wears by chance) / J (timer) |
| Eye of Harmony | A pocket universe whose recipes are planets; three casing axes (spacetime compression, time dilation, stabilisation); makes almost every dust and stellar plasma. | GTNH, GTL (idea) | J |
| Forge of the Gods (Godforge) | Rings with module slots around a star, an upgrade tree, wireless power only. | GTNH TecTech (MIT, but 1.7.10: reading only) | J |
| Artificial star, Dyson sphere control system, door of creation | Antimatter rods → huge EU; damage per launch; a MAX portal. Flagged as absurd numbers. | GTL (idea) | J |
| K.O.M.A.R.U. | Frame with 20 basic + 4 advanced modules; upkeep grows exponentially unless filaments stabilise it (scale against stability). | Star Tech (its Java core is LGPL: re-implement) | K+ (modules as separate multiblocks) / J |
| Wormhole generator chain | Reissner–Nordström → Kerr–Newman → Kerr singularity → exotic matter → stabilised wormhole; 63 of 64 containment units come back. | legacy Gregicality (idea) | K (recipe chain) |
| Hyperbolic projector, Heart of a Universe, antimatter collider | Harvests a whole microverse; a stateful integrity loop. | Monifactory (LGPL KubeJS; Java ideas) | K / J |
| Harmony machine, Kerr–Newman homogeniser | The tier rises on its own after N runs. | GTO (idea) | J |
| **Superradiant mirror shell** ("black-hole bomb", `sagittarius_shell`) | A mirror around a rotating black hole amplifies a seed wave until the cavity detonates. The shell is the largest multiblock of the pack. | real (Press & Teukolsky 1972; Penrose 1969; Blandford–Znajek 1977) | K (logic) / J (rendering) |

**Recommendation: one project in four stages, all K for logic, each one a multiblock that wins something:**
1. **Penrose / Blandford–Znajek engine** (`penrose_engine`, UIV): sits at a stellar black hole as a rehearsal and draws power from its spin. Rule: magnetic-coil catalysts wear by tidal stress.
2. **Accretion-disk skimmer** (`disk_skimmer`, UXV): turns disk plasma into exotic matter and heavy elements.
3. **Kugelblitz forge** (`kugelblitz_forge`, OpV): focused light → contained micro black holes (the roadmap's Hawking engine). Its shape comes from the GTNH compressor: a seed, a decay that wears a catalyst, a stabiliser.
4. **Mirror shell** (`sagittarius_shell`, MAX): placed around Sgr A*. The segment blocks are the structure; a damaged segment stops it.

The final recipe needs:
- the stored energy (EU-to-start: a modifier check, K+);
- a seed wave from the stage-3 forge;
- every segment in place.

It triggers the ending and gives a "new universe seed" for New Game+. The helper's row limit has to be lifted first.

## (f) Families that change shape and parts era by era

Each step is a separate multiblock with its own pattern and the same recipe type and table, like `lv_vein_drill` and `mv_vein_drill` today. The rules change through conditions and modifiers.

Every step is K: one new pattern spec per era plus conditions; the rotating ring is only a ring-shaped pattern. Sources: own design; Star Tech hydroponic garden and tree synthesizer (MIT); GTL large greenhouse (idea); real habitats and observatories.

| Era | Vein drill | Greenhouse | Observatory (spine data) |
|---|---|---|---|
| Steam | bronze derrick, 3×3×5–7, bronze/steel bit | 5×5×5 glass house, dirt floor | clockwork refractor (brass) |
| LV | steel lattice tower + mud pump | steel frame, sprinklers, fertiliser | tracking refractor, photographic plates |
| MV | aluminium tower + mud shaker tank + gearboxes | CO₂ injection (exists) | radio dish array |
| HV | stainless rotary rig: drawworks, mud pit, End samples | stainless hydroponics (nutrient solution, no soil) | deep-space antenna that tracks the rocket |
| EV (Moon) | **lander drill**: tripod legs on sintered regolith, solar wings, dry drilling (bit wears ×2 unless LN₂-cooled) | **sealed lunar dome**: airlock, LEDs for the 14-day night, CO₂ in → O₂ out, regolith + compost soil | telescope launched to orbit |
| IV (Mars, Venus, Mercury) | Mars: pressurised rig with dust filters; Venus: coolant-jacketed rig in inert casing; Mercury: night-side rig | Mars dome: free CO₂, heated, light ×0.43 | interferometer array across two bodies |
| LuV (asteroids, Jupiter) | harpoon-anchored asteroid drill, or an orbital laser instead; cryobot on the icy moons | rotating hydroponic ring (gravity by spin; a ring-shaped pattern) | gravitational-wave detector: L-shaped laser arms |
| ZPM (Saturn, outer system) | the atmospheric scoop replaces the drill at gas giants | photobioreactor (algae) | neutrino tank filled with Mars heavy water |
| UV (Proxima) | terminator-line rig: solar on the day side, ice on the night side | alien-biome vat (GCYR flora) | laser-sail telemetry |
| UHV–UEV | degenerate-crust breaker (field generators instead of bits) | xenobiology vat (flare shielding) | pulsar timing array |
| UIV–MAX | accretion-disk skimmer: the last "drill" | ark biosphere for the voyage | interplanetary event-horizon telescope that images Sgr A* (gives the target data of the final project) |

The same applies to the power family: heliostat tower (LV) → lunar solar field (EV) → orbital solar station with beamed power (LuV) → Dyson sphere (UV) → Dyson swarms at other stars (UHV) → star lifter (UXV) → Penrose engine (UIV).

## (g) Suggested picks per era

At least two truly new multiblocks per era from EV on. The rest of each era is family steps.

| Era | Picks |
|---|---|
| Steam | steam blast furnace, coke battery, clockwork observatory |
| LV (reinforced) | sulfide roaster, heliostat tower, optical observatory |
| MV | engine test stand, radio telescope |
| HV | composite autoclave, syngas plant, launch complex |
| EV | Ostwald tower, cryogenic plant, regolith cell (Moon), atmosphere processor (Mars) |
| IV | hot cell, cloud harvester (Venus), solar foundry (Mercury), asteroid processor |
| LuV | microgravity foundry, gas-giant siphon, cryobot, rectenna |
| ZPM | orbital mining laser, orbital shipyard, Titan pump |
| UV | laser-sail array, Proxima vat |
| UHV | warp gate, Dyson swarm |
| UEV | stellar forge, nebula scoop |
| UIV | Penrose engine |
| UXV | star lifter, disk skimmer |
| OpV | Kugelblitz forge |
| MAX | mirror shell |
