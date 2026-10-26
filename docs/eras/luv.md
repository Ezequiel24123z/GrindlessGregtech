# Era LuV

LuV is cryogenics and the outer system. IV made power by design and reached the inner planets. LuV puts a first station in Earth orbit and goes past Mars, to the asteroid belt and to three of Jupiter's moons: Io, Europa and Ganymede.
- Out there, everything is cold and dark, and near Io the radiation kills electronics.
- The cold becomes a tool:
  - helium runs in a closed loop;
  - superconductors come as tape;
  - on Ganymede, an HV superconductor works with no cryostat at all.

Two things exist only out there: asteroid metals and life. Europa's ocean holds the only living matter in the pack, and it becomes the wetware circuits. GTM's first fusion reactor arrives, but as a materials machine: it makes the europium that ZPM needs.

Power comes from:
- fission and naquadah reactors at home;
- sunlight in orbit;
- Io's volcanoes;
- Jupiter's spin, if a second station proves sound.

Every base draws that power from the global wireless network.

IV leaves, as built:
- naquadah from Venus, and iridium and osmium from Mercury;
- the naquadah plant's mode 1 and the platinum plant's mode 3;
- the fission reactor and the hot cell;
- the assembly line fed from AE2 and the IV parallel hatch;
- the level 3 rocket and the thermal suit;
- the Outer System Chart;
- since v0.7.x, the wireless energy network from LV to IV.

## Route

1. **LuV grid.**
   - The IV assembly line makes the LuV components.
   - With them come the LuV mixer and assembler (single blocks, on an IV→LuV transformer): osmiridium (1 Os + 3 Ir), the LuV voltage coil and ITBTC.
   - The assembly line makes the LuV energy hatches at 30,720 EU/t on two IV hatches.
   - Then the naquadah coil and the 7,200 K EBF.
   - Until the network goes LuV (step 3), LuV machines draw from it through two IV wireless energy hatches (GTM's two-hatch rule).
2. **Trinium and naquadah power.** The naquadah plant's mode 2 (IV's machine; LuV builds the mode) runs GT--'s live chain with full recovery: xenon, gold, antimony and Pd/C stay inside, and fluorine, hydrogen and enriched oxide are used up. It gives:
   - enriched naquadah sulfate (→ ingot → GT--'s reactor III);
   - trinium sulfide (→ trinium at 7,200 K);
   - the impure naquadria solution, stored for ZPM.
3. **Cryogenics at home:**
   - the helium refrigerator (closed-loop cooling of hot ingots);
   - the coated conductor line (ITBTC tape on Ni-W);
   - the HTS magnet works: HTS coils at 144 mB of trinium *(tune)*, and the SMES cells that take the wireless network to LuV.
4. **The first station.**
   - GCYR's packager (LuV) and a real launch to Earth orbit.
   - The suit gets freeze protection: a second pass of IV's thermal template, with insulating fabric.
   - The orbital solar station feeds the network through a wireless dynamo hatch.
   - Then the microgravity smelter, the wake shield facility and the zero-g crystal grower.
5. **Level 4 rocket:** cryogenic fuel tanks (KubeJS `gcyr:fuel_tank`, tier 5) and elite motors.
6. **The belt.**
   - The first-landing kit (*Bridges and first landings*) and the belt's quantum seed.
   - Then the harpoon anchor drill and the asteroid processor (Mond) → iron, nickel, cobalt, tetrataenite and the PGM concentrate → the platinum plant's mode 4.
   - The optical miner bags C-type boulders: water, CO₂ (→ the Mond process's CO) and the chondritic extract.
7. **Io.**
   - The kit and seed.
   - The fumarole condenser on a brought wireless hatch → germanium, indium, SO₂ and sulfur concrete.
   - Then the volcanic intake.
   - Then, if spike S0-3 holds, a second station in Io orbit with the flux-tube tether. If it doesn't, the sulfur–iodine hydrogen plant on Io's surface takes that slot.
8. **Europa and living circuits.**
   - On Europa: the kit and seed; the cryobot's probe (the ocean sample), then brine; the algae bioreactor's Europan culture (brine, H₂O₂, H₂ and the belt's extract) → the only bacteria.
   - At home, the biofoundry: collagen, gelatin and agar → growth medium; mutagen; stem cells; engineered seeds.
   - In Earth orbit:
     - the ring (molecular farm) grows the neurotrophic factor;
     - the organoid lab makes neural organoids and neuro processing units;
     - GT--'s circuit assembly line turns them into wetware processors;
     - crystal CPUs come from the grower's chips.
9. **Ganymede:** the kit and seed, then the GW detector (the catalogue) and the coilgun probe launcher (the Jovian survey and the Saturn chart).
10. **Fusion.**
    - The Mk1 is built with HTS coils and 15 LuV energy hatches.
    - Nd + H → Eu gives the ZPM motor's europium.
    - GTCA's calcium plasma gives a little fusion power (its net figure is checked in B10); D + T stays small.
11. **Research:**
    - computer casings and the data bank;
    - the HPCA and the research station (assembly line at 100,000 EU/t on two LuV hatches; URhNq₂ dust from the large mixer on two LuV hatches, its ingot from a trinium-coil blast furnace at 9,000 K, its double wire from the Universal Assembly Factory on two LuV hatches);
    - the ZPM energy hatch's data orb.
12. **Exit:** *Gate to ZPM*.

## Inherited from IV (as built)

- **Naquadah plant** (`gtceu:naquadah_plant`, type `gtceu:naquadah_refining`).
  - Mode 1 is composed at every load from GT--'s live line (`lib/compose.js`, `tables/naquadah_plant.json`): 4 naquadah oxide mixture + 15 Sb₂O₃ + 40,500 mB HF + the Pu-Be source (1 %) → 2 naquadah dust + Ti and Ga at 50 % + 10,500 mB H₂ + 9,000 mB water, 7,678 EU/t × 149 t.
  - It takes the IV parallel hatch, and its activator stage pays the accelerators' upkeep at 240 EU/t.
  - **Mode 2 is not built.**
- **Platinum plant** (`gtceu:pgm_refining`).
  - Modes 1 and 2 (Earth's sulfides) yield no Ir or Os: that is IV-B3's Earth cut.
  - Mode 3: 10 iridosmine + 10 saltpeter + 3 Ca + 1,000 mB brine + 12,500 mB HCl + 7,000 mB H₂ → 3 Ir + 1 Os + 3 platinum sludge residue + 3 metal sludge + 12 CaCl₂, 1,919 EU/t × 1,034 t.
- **Mass production** (IV-B6):
  - the assembly line fed from AE2 (proven);
  - the IV parallel hatch in our plants (`lib/parallel_hatch.js`; each copy pays its EU/t);
  - GCYM at IV.
- **Power:**
  - fission at 131,072 EU/t per full heavy-water reactor;
  - the RTG cell `gtceu:ev_rtg` (2,048 EU/t; a pellet an hour);
  - from v0.7.x, **the global wireless network**, LV to IV. It has one server-wide bank, a tower whose weakest cell sets the output tier, wireless energy and dynamo hatches at 2, 4, 16 and 64 A, covers for single blocks, and a 5 % loss on entry.
- **Hot cell:** xenon from reprocessing, Pu-241, radon (Quantum Stars) and RTG pellets.
- **Other plants:**
  - the fluorspar kiln (HF and F₂);
  - the heavy-water plant (deuterium);
  - the tritium removal facility (720 mB of tritium an hour per full reactor).
- **Travel** (IV-B5):
  - elite tank and motor (12 B a tank; a trip is 14 B, so two tanks);
  - the thermal template (four for a suit);
  - the far halves made on site: chemical reactor, local regolith + ender pearl + 250 mB helium-3, 480 EU/t × 10 s;
  - the Outer System Chart and the Sagittarius A* signal (interferometer).

## The belt and Jupiter's moons

Five GCYR entries (datapack JSON, no Java) and ten dimensions. The ids are final (B1, from spikes S0-1 and S0-2): `data/grindless/gcyr/planets/*.json`, and every package reads them only through `tables/places.json` (surfaces) and `tables/orbits.json` (orbits).

| Entry | `world` / `orbit_world` | Tier | Gravity (m/s², menu only) | Temp (K) | Radiation (real dose) |
|---|---|---|---|---|---|
| Asteroid belt | `grindless:asteroid_belt` / `…_orbit` | 4 | 0.6 | 165 | low |
| Jupiter (menu placeholder) | `grindless:jupiter` / `…_orbit`, both `gcyr:space` voids | 5 | 24.79 | 165 | — |
| Io | `grindless:io` / `…_orbit`, parent Jupiter | 4 | 1.796 | 110 | about 36 Sv a day |
| Europa | `grindless:europa` / `…_orbit`, parent Jupiter | 4 | 1.315 | 102 | about 5.4 Sv a day |
| Ganymede | `grindless:ganymede` / `…_orbit`, parent Jupiter | 4 | 1.428 | 110 | about 0.08 Sv a day |

- **Jupiter exists for the menu:** GCYR only gives a navigation button to planets with no parent. Tier 5 keeps it closed in LuV.
- **Gravity is not simulated:** GCYR 0.2.9 shows a planet's `gravity` in its menu, but no entity physics reads it. On S0-1's test moon (1.315 m/s²) a player fell at vanilla speed. The pack adds no physics of its own: the column is real-world data for the menu, and no rule, recipe or quest relies on low gravity.
- **Worlds** (as built in B1: `data/grindless/dimension/`, `dimension_type/`, `worldgen/noise_settings/`, `worldgen/biome/`; the shapes are ours, the file structure adapted from GCYR's `luna` and `mercury`, LGPL-3.0, credited):
  - Every surface is Y −64 to 320 like the Moon, with no terrain at Y 176 and above (test fixtures build at Y 198–214), no aquifers, caves, features, mobs or precipitation.
  - The belt is a tuff rubble floor at about Y 59–69 (gravel and cobbled deepslate patches) with tuff asteroids at Y 90–170 (GCYR drops the rocket at the same X and Z). Tuff is B5's ore layer target. It keeps a day cycle, for the optical miner.
  - Io has brimstone plains at Y 90–110 over basalt, paterae sunk into a lava sea at Y 78 with basalt and magma floors, fumarole fields (Biomes O' Plenty's brimstone fumaroles in clusters) and black sand.
  - Europa has 9–15 blocks of packed ice over blue ice, at Y 91–106.
  - Ganymede has tuff hills at Y 84–116 with packed ice caps and patches.
  - Skies use GCYR's own sun, `jupiter.png` and glow textures by path: Jupiter is large from Io, smaller from Europa and Ganymede, and small from the belt.
  - Jupiter and the five orbits are GCYR's `gcyr:space` void.

| | Earth orbit (station) | Belt | Io | Io orbit (station) | Europa | Ganymede |
|---|---|---|---|---|---|---|
| Rules | vacuum, 3 K, no night, 0 g | vacuum, micrometeoroids | no water, no combustion, radiation, heat only from lava | radiation (plasma torus), 3 K | radiation, ice, the ocean 20 km down | 110 K (Hg-1223 superconducts by itself), seismically quiet |
| Site power | orbital solar station | the wireless network; RTG cells | volcanic intake | flux-tube tether | the wireless network | the wireless network |
| Only from there | — (it makes things) | asteroid metals; chondritic extract | germanium; sulfur concrete | — | living matter | — |
| Made there | — | asteroid regolith casing | sulfur concrete casing | — | — | — |

- **Travel:**
  - level 4 = elite motors and only cryogenic tanks (GCYR: floor((weakest motor tier 3 + weakest tank tier 5) / 2)); one elite tank drops the rocket to level 3;
  - GCYR asks for 14 B in the tanks to launch from Earth to any LuV place (its solar-system amount), and for its moon amount between a moon and its parent; Jupiter is tier 5, so that leg stays closed in LuV;
  - one cryogenic tank holds 16 B, two make 32 B. S0-2's level 4 round trip to a test moon burned 5,126 mB out and 4,952 mB home: the launch requirement, not the burn, is what needs the second tank.
  - Proxima Centauri b goes to tier 5 (it was 4 while no part reached level 4).
- **Stations** (wait for spike S0-3; `tables/stations.json` stays `"enabled": false` until it passes natively):
  - GCYR's packager (a LuV hull, GCYR's recipe) and package, the ID chip and the keycard. The keycard stays hidden until the flag flips.
  - The station lands on a 512 × 512 plot in the planet's orbit.
  - GT machines are built after arrival.
- **Suit:**
  - The moons and the belt (102–165 K) are inside the suit's 60–363 K.
  - Orbits (3 K) need freeze protection: GCYR's thermal template writes `gcyr:freeze_protected` when the addition is insulating fabric (GCYR's `SmithingThermalUpgradeRecipe`).
  - Spike S0-8 checks that a piece keeps both tags.
- **Radiation:** machine-only. Patterns on Io, on Europa and in Io orbit include `grindless:radiation_vault_casing` (graded-Z: titanium then tantalum, like Juno's vault).
- **Weather and time:**
  - `space/airless_weather.js` dries every dimension of the other planets in `tables/planets.json` (so all ten new ones) and its `dryOnEarth` list, Earth orbit, which stays Earth's for AE2 pairs and air.
  - Orbits are always midnight, so no orbital machine uses a daytime condition.

### Sunlight: one authoritative table

`data/grindless/tables/sunlight.json`, read by the whole solar family. New airless places use the Moon's ×1.4 at 1 AU, divided by the square of the distance in AU; as-built values stay as built.

| Dimension | Factor | When | Status |
|---|---|---|---|
| Earth's surface | 1.0 | by day, clear sky | the family's reference |
| `gcyr:luna` | 1.4 | by day | as built (EV) |
| `gcyr:mars` | 0.43 | by day | as built (EV) |
| `gcyr:mercury` | 6.7 | by day | as built (IV); the rule would give 9.3 |
| `gcyr:venus` | — | — | no solar machine (heat engine) |
| `gcyr:overworld_orbit` | 1.4 | always: sky exposure only (`fixed_time` 18000) | new |
| `grindless:asteroid_belt` | 0.19 | by day | new (1.4 / 2.7²) |
| `grindless:io`, `europa`, `ganymede` | 0.052 | by day | new (1.4 / 5.2²) |
| any other orbit | its planet's factor by the rule | always | for later stations |

### Bridges and first landings

| Place | Pair tag | Far half (made only there, chemical reactor 480 EU/t × 10 s, + ender pearl + 250 mB helium-3) | Local input, mined by hand |
|---|---|---|---|
| Belt | `belt` | `grindless:asteroid_quantum_seed` | raw meteoric iron (the M-type sample) |
| Io | `io` | `grindless:ionian_quantum_seed` | Biomes O' Plenty brimstone, with `.dimension('grindless:io')` |
| Europa | `europa` | `grindless:europan_quantum_seed` | blue ice, with `.dimension('grindless:europa')` |
| Ganymede | `ganymede` | `grindless:ganymedean_quantum_seed` | tuff, with `.dimension('grindless:ganymede')` |

- **`tables/planets.json`** gets five entries (`belt`, `jupiter`, `io`, `europa`, `ganymede`), each with its world and its orbit.
  - Io orbit belongs to `io`, so an Io pair also works in the Io-orbit station.
  - Jupiter gets no pair tag, so it keeps no pair.
  - AE2's ritual and the chamber's ejection of foreign pairs are proven since EV.
  - **As built:** B1 writes the Io, Europa and Ganymede seeds and pairs (`server_scripts/grindless/luv/travel.js`, the dimension from `G.places`); the belt's seed is B5's, since its raw meteoric iron is.
- **The first-landing kit** (every place):
  - an IV wireless energy cover for the chemical reactor;
  - an IV wireless energy hatch for the first multiblock;
  - two RTG cells (4,096 EU/t) as the fallback;
  - a Waystone and the chamber's parts.
  - The network crosses dimensions, so nothing on site waits for a local generator.
- **Order on Io:** fumarole condenser (7,680 EU/t on the brought hatch) → SO₂ and sulfur concrete → volcanic intake → the tether in orbit.
- **Order on Europa:** cryobot probe (sample) → brine → culture. The culture needs the belt's extract, carried over AE2 or in an ender chest.

## Automatic resource generation

| Resource | Source | Machine |
|---|---|---|
| Iron, nickel, cobalt; tetrataenite; asteroid PGM concentrate | belt M-type veins | harpoon anchor drill → asteroid processor → platinum plant mode 4 |
| Olivine (seed gems), chromite, magnetite | belt S-type veins | harpoon anchor drill → GTM ore processing |
| Water, CO₂, carbon, chondritic extract | belt C-type boulders | optical miner |
| Europan brine and the ocean sample | Europa's ocean | cryobot |
| Bacteria (`gtceu:bacteria`), the only living matter | Europan culture | algae bioreactor (Europa) |
| Germanium, indium, sulfur, SO₂, sulfur concrete | Io's fumaroles | fumarole condenser |
| Enriched naquadah, trinium sulfide, impure naquadria solution | Venus naquadah, and reactor III's spent rods | naquadah plant mode 2 |
| Europium | Mars neodymium + hydrogen | fusion reactor Mk1 |
| Stem cells, growth medium, agar, engineered seeds | bacteria + the sterile bootstrap | biofoundry |
| Neurotrophic factor, plant collagen | engineered crops under spin gravity | rotating hydroponic ring |
| Neural organoids and neuro processing units | 0 g | organoid lab |
| Raw crystal chips, sapphire test masses | 0 g | zero-g crystal grower |
| Optical pipes (ZBLAN), Whipple shield casing, naquadah alloy | 0 g | microgravity smelter |
| UHPIC, HPIC and triple-junction wafers | the wake's vacuum | wake shield facility |
| HTS coils, SMES cells, coilgun coils, magnetic bearings | Earth | HTS magnet works |
| Power | the Sun in orbit; Io's heat; Jupiter's spin; fission and naquadah; fusion | orbital solar station, volcanic intake, flux-tube tether, reactors, Mk1 |

## Only from there, and the cuts

- **Asteroid metals only from the belt:**
  - meteoric iron (`gtceu:meteoric_iron`), tetrataenite (`gtceu:tetrataenite`) and the asteroid PGM concentrate (`grindless:asteroid_pgm_concentrate`), found only in `veins_belt.json`;
  - the chondritic extract, too.
- **Iridium and osmium only off Earth:** Mercury (IV) or the belt.
- **Living matter only from Europa:**
  - `gtceu:brewery/bacteria` is cut by package B8, beside its replacement. It needs GTM's sterile cleanroom, a ZPM build, so at LuV there are no other bacteria anyway; the cut keeps Europa the only source after ZPM too.
  - The dump has nine recipes that take `gtceu:bacteria` or the sludge made from it, all in GTM's wetware and crystal chain:
    - bacterial sludge and stem cells (two machines each) take the bacteria;
    - the three enriched sludges and the crystal chip from sludge take the sludge;
    - mutagen takes the enriched sludge.
- **Germanium only from Io** (GTCA's froth stays ZPM). **Sulfur concrete only on Io.**
  - GTCA's Nether germanite (drilled since LV) keeps its electrolysis without the germanium (`grindless:electrolyzer/germanite`, B6): nothing before LuV asks for germanium; the dump's only other user is UV's quantum alloy.
- **The neuro processing unit at LuV only from the organoid lab.**
  - GTM's `circuit_assembler/neuro_processor` (80,000 EU/t) stays a ZPM-voltage recipe. From LuV the biofoundry makes its stem cells and sterile medium, so every machine that could run it on LuV power was checked (spike S0-4, GT-- 1.3.10 bytecode):
    - GT--'s line has a single energy-hatch cell (`GTPPMachines.kt:58-105`). Its `CircuitAssemblyLineMachine.getRealRecipe` (`.kt:78-86`) refuses a circuit-assembler recipe whose EU tier is at or above the tier of the hatch's combined voltage (2 A: the hatch's tier; 4 A: one up; 16 A: two up), and GTM refuses anything above the hatch's own tier. So the NPU is refused on every LuV hatch and on a ZPM 2 A hatch, and runs from a ZPM 4 A hatch.
    - GTM's large circuit assembler takes exactly one energy hatch.
    - Our Universal Assembly Factory takes two, and GTM lets two hatches of a tier run the next tier's recipes. Its modifier refuses the NPU unless one hatch alone reaches ZPM (`mv/leisure_factories.js`, `HATCH_VOLTAGE_LOCKED`, LuV-A5).
- **Europium only from the Mk1** until ZPM.
- **Optical pipes:** GTM's two recycling recipes go (decision 18; machine 6).
- **GCYR's satellites** have no recipe and no deploy: they stay hidden.
- **The Mk1, checked against every recipe it can run** in the dump: tier ≤ LuV (`FusionReactorMachine.java:185`) and a start of ≤ 160 M EU (16 hatches × 10 M).

  | Recipe (`gtceu:fusion_reactor/…`) | EU/t | Start | Fate |
  |---|---|---|---|
  | `neodymium_and_hydrogen_to_europium_plasma` | 24,576 | 150 M | keep: europium |
  | `deuterium_and_tritium_to_helium_plasma` | 4,096 | 40 M | keep |
  | `lantanum_and_silicon_to_lutetium_plasma` | 7,680 | 80 M | keep |
  | `hydrogen_and_vanadium_to_chromium_plasma` | 24,576 | 140 M | keep: chromium is common |
  | `calcium_plasma` (GTCA; Mg + O) | 7,680 | 120 M | keep: fusion power (*Power*) |
  | `silver_and_copper_to_osmium_plasma` | 24,578 | 150 M | **cut:** osmium comes from Mercury or the belt |
  | `mercury_and_magnesium_to_uranium_235_plasma` | 24,576 | 140 M | **cut:** U-235 comes from the End through the hot cell |
  | `gold_and_aluminium_to_uranium_238_plasma` | 24,576 | 140 M | **cut:** uranium comes from the End |
  | `gallium_and_radon_to_duranium_plasma` | 16,384 | 140 M | **to the Mk2:** re-registered with a 200 M start, since ZPM's tritanium needs duranium |

  - **Not Mk1 recipes** (B10's audit of the dump, all 33 recipes of the type: `data/grindless/tables/fusion_mk1.json`), because of their tier or start, untouched:
    - EU/t above LuV: Xe + Zn → Pu-239, Kr + Ce → Pu-241, Ag + He-3 → Sn, Lu + Cr → Am, enriched naquadah + Rn → naquadria, Pu-241 + H → Am plasma, Am + naquadria → neutronium, californium, oganesson, and GTCA's titanium and zinc plasmas;
    - a start above 160 M EU: the plasmas of N, O, Fe, Ar and Ni, GTCA's sulfur plasma, Ag + Li → In, Au + Hg → Rn, As + Ru → Ds, Ti + Du → tritanium, and the three excited fuels (uranium, plutonium and naquadah based).
  - `server_scripts/grindless/luv/fusion.js` logs an error for any recipe of the type that the Mk1 could run and the audit does not list.
  - **Other producers of the cut products, checked:**
    - osmium: the platinum plant's mode 3 and the Mercury solar works, which GTM's osmium chain depends on;
    - U-235: the hot cell's enrichment and GTM's UF₆ electrolysis (the hot cell's line);
    - duranium: fusion only.

## Our multiblocks

`AGENTS.md` rule 7: IV ended with 15, so LuV needs about **20** that each add a recipe, route or line that did not exist. Shared rules:
- Recipes are LuV ones (30,720 EU/t) unless a composed GTM stage sets another figure.
- Structures go through the pattern helper and are at most 16 high.
- Parts are ME-ready.
- Names go in `en_us` and `es_es`.
- Site rules are `.dimension(...)` allowlists, and patterns on Io, Europa and Io orbit carry radiation vault casings.
- Machines with a run-start check close it with `lib/fresh_run.js` in `afterWorking`.

**Shared blocks** (A1):
- station truss casing (titanium frame + 4 aluminium plates → 2, 1,920 EU/t × 100 t *(tune)*);
- radiation vault casing (2 dense titanium + 2 tantalum plates + an HSS-S frame → 2, 7,680 EU/t × 100 t *(tune)*);
- Whipple shield casing (machine 6);
- asteroid regolith casing (belt rubble, only on the belt *(tune)*);
- sulfur concrete casing (machine 14);
- orbital solar panel (machine 5);
- magnetic bearing and coilgun coil casing (machine 3);
- sapphire test mass (machine 7).

| Site | Ours in LuV | Count |
|---|---|---|
| Earth | 1 helium refrigerator, 2 coated conductor line, 3 HTS magnet works, 4 biofoundry | 4 |
| Earth orbit (first station) | 5 orbital solar station, 6 microgravity smelter, 7 zero-g crystal grower, 8 wake shield facility, 9 rotating hydroponic ring, 10 organoid lab | 6 |
| Asteroid belt | 11 harpoon anchor drill, 12 asteroid processor, 13 optical miner | 3 |
| Io | 14 fumarole condenser, 15 volcanic intake | 2 |
| Io orbit (second station) | 16 flux-tube tether, if spike S0-3 holds; if not, 16b, the sulfur–iodine plant on Io | 1 |
| Europa | 17 cryobot, 18 algae bioreactor | 2 |
| Ganymede | 19 gravitational-wave detector, 20 coilgun probe launcher | 2 |
| | | **20** |

Not counted:
- the new modes of older machines: naquadah plant mode 2 (IV's) and platinum plant mode 4 (EV's);
- GCYR's station packager;
- the cryogenic fuel tank;
- the LuV wireless tier.

### Audit: the route only each one gives, its recipe keys, its output policy

Policies:
- **Kept:** mandatory-kept, with `G.noVoiding.modifier(opts, next)` as the modifier **and** `.beforeWorking(G.noVoiding.beforeWorking(opts))` (AGENTS, "A modifier alone doesn't stop a run").
- **Contained:** kept, and radioactive (GTM's hazard), stored in a quantum tank.
- **Voidable:** the player's choice.

Every recipe has a programmed circuit (c*n*) or an input that no other recipe of its type shares, and every new type goes through `gg_test_recipe_lookup`.

| # | Machine | Route only it gives (rules 4 and 7) | Keys | Policy |
|---|---|---|---|---|
| 1 | Helium refrigerator | hot ingots cooled in a closed loop: 25 mB of helium make-up instead of 250 lost | the hot ingot (the molten variants add the mold) | voidable (nitrogen gas) |
| 2 | Coated conductor line | ITBTC as deposited tape: no 6,000 K EBF and no helium | c1 substrate, c2 tape | voidable |
| 3 | HTS magnet works | the HTS coil at 144 mB of trinium; the network's LuV cells; wound Hg-1223 coils; magnetic bearings | c1–c4 | voidable |
| 4 | Biofoundry | GTM's whole sterile chain at LuV with no ZPM sterile cleanroom; engineered seeds | c1–c10 | kept |
| 5 | Orbital solar station | sunlight with no night, into the network | c1 | EU only |
| 6 | Microgravity smelter | optical pipes with no silver; Whipple casing; containerless naquadah alloy | c1–c3 | voidable |
| 7 | Zero-g crystal grower | chips at 100 % and four times the speed; sapphire test masses | c1–c6 | voidable |
| 8 | Wake shield facility | UHPIC and HPIC at half the source and time; triple-junction wafers | c1–c3 | voidable |
| 9 | Rotating hydroponic ring | the neurotrophic factor that the LuV NPU needs; plant collagen | c5 + barley seed, c6 + tobacco seed (seeds not consumed) | kept |
| 10 | Organoid lab | the NPU at LuV voltage, through a neural organoid | c1 organoid, c2 NPU | kept |
| 11 | Harpoon anchor drill | the belt's veins | the family's: the vein sample (not consumed), bit and harpoon | the drill family's |
| 12 | Asteroid processor | Mond metals; the only PGM concentrate | c1 Mond, c2 magnetic split | concentrate kept |
| 13 | Optical miner | C-type volatiles and the only chondritic extract | c1 + capture bag, c2 Boudouard | kept |
| 14 | Fumarole condenser | the only germanium before ZPM; sulfur concrete | c1–c3 | kept |
| 15 | Volcanic intake | Io's heat as power | c1 + SO₂ charge | EU only |
| 16 | Flux-tube tether | Jupiter's spin as power | c1 + spool + argon | EU only |
| 16b | Sulfur–iodine plant (only if no second station) | bulk hydrogen and oxygen from Io's heat, with no electrolysis | c1 + iodine and acid charges | kept |
| 17 | Cryobot | the ocean: sample and brine | c1 + probe, c2 + melt head | kept |
| 18 | Algae bioreactor | the only bacteria | c1 algae, c2 culture | kept |
| 19 | GW detector | the gravitational-wave catalogue | c1 | kept |
| 20 | Coilgun probe launcher | ZPM's gas-giant sample and the Saturn chart | c1 Jupiter probe, c2 Saturn probe | kept |
| — | Naquadah plant, mode 2 (IV's) | trinium and enriched naquadah with full recovery; spent rods re-enriched | c2 enriched oxide, c3 spent naquadah | kept + contained (naquadria) |
| — | Platinum plant, mode 4 (EV's) | asteroid platinum metals | c4 + concentrate | kept |

**Spent fuel:** reactor III returns a long naquadah rod (`gtceu:naquadah_reactor/naquadah_reactor_iii`). The rod is macerated into naquadah dust → mode 2, circuit 3 (*Older machines, new modes*).

### 1. Helium refrigerator: `gtceu:helium_refrigerator`, type `gtceu:closed_loop_cooling` (Earth)

- **What it gains:** helium cooling in a closed loop. It turns a wall of raw quantity (rule 2) into energy.
  - GTM's hot ingots take 500 mB of Liquid Helium each and give back 250 mB of helium gas, so half is lost every time.
  - At LuV, about 60 recipes do that: HSS-S, HSS-E, naquadah, enriched naquadah, trinium, naquadah alloy, ITBTC, SmFeAsO, samarium, europium and others.
  - One Mk1's trinium with GTM's coil (about 1,032 ingots) alone would lose about 258,000 mB, the helium of about 16,500 regolith dust in the Moon's oven (250 mB per 16). With the HTS coil (43 ingots) it is far less, but every LuV hot ingot still loses 250 mB.
  - Real cryoplants (the LHC's and ITER's Claude-cycle refrigerators) lose a few percent of their inventory a year, not half per use.
- **Recipes:** they are generated from GTM's own `vacuum_freezer/cool_hot_*_ingot` and molten-metal recipes that take Liquid Helium, through a table that a tool builds from the dump (repetitive recipes are not written by hand).
  - **In:** the hot ingot (or 144 mB of molten metal and the mold, not consumed) + 25 mB of Liquid Helium as make-up (5 % *(tune)*) + 50 mB of Liquid Nitrogen as precooling (it leaves as nitrogen gas) + a helium charge (4,000 mB of Liquid Helium in its own hatch, not consumed: IV-A5's `notConsumableFluid`).
  - **Out:** the cold ingot + 50 mB of nitrogen.
  - **EU:** the freezer's own step + the re-liquefaction of the 475 mB that circulates, at GTM's `vacuum_freezer/liquid_helium` rate (1,920 EU/t × 240 t per 1,000 mB), halved by the precooling *(tune)*.
  - **Example:** `cool_hot_naquadah_alloy_ingot` is 7,680 EU/t × 300 t (2.30 M EU). Adding 109,440 EU of re-liquefaction gives 7,680 EU/t × 314 t a cooled ingot, with 25 mB of helium spent instead of 250.
  - It accepts the LuV parallel hatch.
- **Byproducts:**
  - The nitrogen goes back to the cryogenic plant (EV), which liquefies it again, or into the air.
  - The helium never leaves.
- **Structure:**
  - a 5×5×9 cold box of frostproof machine casing, with two columns of titanium turbine casing inside (the turbo-expanders);
  - a 5×3×4 compressor house of clean stainless steel casing (`gtceu:clean_machine_casing`) beside it;
  - a 3×3×3 helium gas holder of laminated glass.
- **Controller:** LuV hull + 2 LuV pumps + 2 LuV motors (the expanders) + 4 LuV circuits *(tune)*.
- **Crossings:** EV (the cryogenic plant's Liquid Nitrogen and the Moon's helium), IV (naquadah's hot ingots), LuV (trinium and ITBTC) and ZPM (more hot ingots).
- **Risks:** building the table needs `RecipeHelper.getInputFluids`, since `FluidIngredient#getStacks()` can't be reached from Rhino, or a tool-made table from the dump. Each hot ingot is its own input, so the lookup has one recipe per path.
- **Source:** real: the Claude cycle (1902), Collins's helium liquefier (1947), and the cryoplants at CERN and ITER.

### 2. Coated conductor line: `gtceu:coated_conductor_line`, type `gtceu:coated_conductor` (Earth)

- **What it gains:** second-generation superconducting tape.
  - GTM's ITBTC wire is cast metal: a 6,000 K EBF, then a 30,720 EU/t freezer step with Liquid Helium.
  - Real 2G tape (RABiTS) is a film of a micron or two on a textured nickel-tungsten substrate.
  - The tape feeds the HTS magnet works: HTS coils and the network's SMES cells.
- **Recipes:**
  1. **Substrate** (c1): 19 nickel dust + 1 tungsten dust (Mars) → 20 `grindless:nickel_tungsten_tape` (Ni-5at.%W, rolled and annealed to a cube texture), 7,680 EU/t × 400 t *(tune)*.
  2. **Tape** (c2): 16 nickel-tungsten tape + 1 ITBTC dust + 1,000 mB oxygen + 36 mB molten silver (the cap layer) → 16 `grindless:itbtc_coated_conductor`, 30,720 EU/t × 300 t *(tune: an eighth of a cast single wire's superconductor per tape)*.
  - The tape is its own item and carries no GTM material info, so GTM makes no recycling for it: the eighth can't be undone into ITBTC (spike S0-5 checks it).
- **Byproducts:** none (voidable).
- **Structure:** a reel-to-reel line, about 21 × 3 × 4: a payoff reel, a 4-high rolling stand, an annealing furnace (HSS-G coil blocks), a 3×3×3 deposition chamber of PTFE inert casing with a laser port, an oxygen anneal tube, a silver sputter cell and a take-up reel.
- **Controller:** LuV hull + LuV emitter (the deposition laser) + 2 LuV conveyors + 4 LuV circuits *(tune)*.
- **Crossings:**
  - EV: Mars tungsten, and the Moon's titanium inside ITBTC;
  - IV: Earth's indium;
  - LuV: Io's indium and the magnet works.
- **Source:** real: ORNL's RABiTS (1996), industrial REBCO tape.

### 3. HTS magnet works: `gtceu:hts_magnet_works`, type `gtceu:magnet_winding` (Earth)

- **What it gains:** magnets as their own industry.
  - Tape makers and magnet makers are different trades (tape: SuperOx and Faraday Factory; magnets: the SPARC magnet factory of CFS and MIT).
  - A magnet is wound, vacuum-impregnated with epoxy and tested cold before it is used.
  - Two things that nobody else makes:
    - a superconducting coil with a twenty-fourth of GTM's trinium (the Mk1's trinium wall);
    - the LuV cell of the wireless network. Superconducting magnetic energy storage is real grid storage in a coil's field.
- **Recipes** (each with a cold-test charge: 1,000 mB of Liquid Helium in its own hatch, not consumed):
  1. **HTS coil** (c1): 16 coated conductor + 16 NbTi foils + 144 mB molten trinium + 144 mB epoxy → 1 `gtceu:superconducting_coil` (GTM's block), 30,720 EU/t × 400 t *(tune)*.
     - GTM's own ladder is `gtceu:assembler/superconducting_coil_luv` (3,456 mB of trinium + 32 ITBTC double wires), `…_zpm` (2,304 mB + 16 URhNq₂) and `…_uv` (1,152 mB + 8 EnNqTrEuDu): better wire, less trinium.
     - The tape goes further, as SPARC's did. 144 mB is set by the target: one Mk1's 43 coils in under an hour of one ×4 naquadah plant (*Older machines, new modes*: 43 ingots in about 54 min).
     - The dump has no recycling for the coil (recycling included, its only consumers are the fusion casing, the Mk1 and the Mk2's fusion coil), so a cheap coil duplicates nothing.
  2. **SMES cell** (c2): 32 coated conductor + 8 NbTi foils + 4 frostproof machine casings + 1 LuV machine hull + 144 mB epoxy → 1 `grindless:luv_smes_cell`, 30,720 EU/t × 600 t *(tune)*. Its capacity is the LuV row of `tables/wireless_energy.json` (983,040,000 EU, the table's rule of six of the tier's batteries).
  3. **Coilgun coil** (c3): 16 Hg-1223 (`gtceu:mercury_barium_calcium_cuprate`) single wires + 1 HSS-S frame + 72 mB epoxy → 2 `grindless:coilgun_coil_casing`, 7,680 EU/t × 200 t *(tune)*.
  4. **Magnetic bearing** (c4): 4 tetrataenite rods (belt) + 1 HSS-S ring + 2 titanium plates → 1 `grindless:magnetic_bearing`, 1,920 EU/t × 200 t *(tune)*. Tetrataenite (L1₀ FeNi) is a rare-earth-free permanent magnet that forms only in meteorites.
- **Byproducts:** none (voidable).
- **Why it is not part of the coated conductor line:** a different process (winding, impregnation, cold test) and different products: coils, cells and bearings, not tape.
- **Structure:** about 11 × 5 × 5: a 3×3×5 winding mandrel on a turntable of stainless gearbox casing, a 3×3×3 impregnation tank of laminated glass and PTFE pipe casing, and a 3×3×4 test cryostat of frostproof casing with the helium hatch.
- **Controller:** LuV hull + 2 LuV motors + LuV sensor (the quench detector) + 4 LuV circuits *(tune)*.
- **Crossings:**
  - HV: Hg-1223;
  - EV: the Moon's helium, through the refrigerator;
  - IV: NbTi;
  - LuV: tape, trinium and tetrataenite;
  - ZPM: the network's next cells.
- **Risks:**
  - the cell's capacity lives in the wireless package's table;
  - 144 mB of trinium is decision 13, *(tune)* until A4's bench run.
- **As built (A4):**
  - `luv/hts_magnet_works.js` (startup and server), recipes from `tables/hts_magnet_works.json`: ids `grindless:magnet_winding/<name>`, circuits 1–4, the 1,000 mB Liquid Helium charge as `notConsumableFluid` on all four, and an EMI line per recipe. A recipe whose ids the game lacks is skipped with an error in the log.
  - The bearing takes `gtceu:tetrataenite_rod` (A1 gives tetrataenite its rod).
  - EMI, with A1's hidden groups: the coilgun coil casings show now, with a page saying they are kept for Ganymede's coilgun; the bearing and its recipe show now (B4's ring needs it), with a page, because tetrataenite's B5 group is index-only (`keepRecipes`) until the belt; the SMES cell and the HTS coil recipe show when A3's tape does (the SMES cell has its own group until then, and `hts_magnet_works.test.mjs` fails if it outlives A3's).
  - The structure is 11 × 5 × 5 on a frostproof base: the cryostat (3×3×4, hollow), the impregnation tank (3×3×3: PTFE pipe casing floor and lid, laminated glass around the bath) and the mandrel (3×3×4 tungstensteel frame cage around a stainless gearbox spindle, on a gearbox turntable). The parts go in the base's front and back rows and in two cells of the cryostat's front wall: 1–2 energy hatches, 1–3 input buses, 1–3 input hatches, 1–2 output buses and the parallel hatch.
  - Controller: crafting grid, LuV hull + 2 LuV motors + LuV sensor + 4 LuV circuits (`grindless:crafting/hts_magnet_works`).
- **Source:** real: the CFS and MIT SPARC toroidal field model coil (20 T, 2021), SMES (BPA's 30 MJ unit, 1980s), and vacuum-pressure impregnation and cold testing in magnet manufacturing.

### 4. Biofoundry: `gtceu:biofoundry`, type `gtceu:sterile_culture` (Earth)

- **What it gains:** GTM's whole sterile chain at LuV in one sealed hall, from its bootstrap (collagen, gelatin and agar) up.
  - Every step needs GTM's sterile cleanroom, which is a ZPM build.
  - GTM's cleaning maintenance hatch only gives a normal cleanroom.
  - Extended Features' configurable hatch has no recipe (`hidden_until.json`: "never").
  - So this hall is the only LuV route.
- **Recipes** (GTM's own figures; when steps merge, their EU is summed):

  | c | Step | In → out | EU/t × t | GTM source |
  |---|---|---|---|---|
  | 1 | Collagen, from bone | 1,000 mB H₂SO₄ + 2 meat + 1 bone → 2 collagen + 1,000 mB diluted H₂SO₄ | 480 × 1,600 | `chemical_reactor/collagen_from_bone` |
  | 2 | Collagen, from bone meal | 500 mB H₂SO₄ + 1 meat + 1 bone meal → 1 collagen + 500 mB diluted H₂SO₄ | 480 × 800 | `…/collagen_from_bone_meal` |
  | 3 | Gelatin | 6 collagen + 1,500 mB phosphoric acid + 4,500 mB water → 4 gelatin + 1 phosphorus | 480 × 4,800 | `mixer/gelatin_mixture` (×1.5) + `centrifuge/gelatin` |
  | 4 | Agar | 1 gelatin + 1,000 mB distilled water → 1 agar | 480 × 600 | `autoclave/agar` |
  | 5 | Bacterial sludge | 1,000 mB biomass + 1,000 mB bacteria → 1,000 mB sludge | 1,920 × 600 | `large_chemical_reactor/bacterial_sludge` |
  | 6 | Mutagen | 1,000 mB sludge + 1 tiny U-235 → 100 mB mutagen | 7,610 × 101 | `brewery/enriched_bacterial_sludge_from_u235` + `distillery/mutagen` |
  | 7 | Sterile medium | 4,000 mB mutagen + 4 meat + 4 salt + 4 calcium + 4 agar → 4,000 mB sterilized growth medium | 7,680 × 2,000 | `mixer/raw_growth_medium` + 40 × `fluid_heater/sterile_growth_medium` |
  | 8 | Stem cells | 500 mB bacteria + 500 mB medium + 1 osmiridium dust → 32 stem cells + 500 mB sludge | 30,720 × 300 | `large_chemical_reactor/stem_cells` |
  | 9 | Engineered barley seed | 1 wheat seeds + 250 mB bacteria → 1 `grindless:engineered_barley_seed` | 1,920 × 600 | ours: the bacteria as the vector (Agrobacterium, real) |
  | 10 | Engineered tobacco seed | 1 beetroot seeds (the stand-in) + 250 mB bacteria → 1 `grindless:engineered_tobacco_seed` | 1,920 × 600 | ours |

- **Byproducts** (kept: `G.noVoiding` in both places):
  - diluted sulfuric acid → back to sulfuric acid (the pack's usual reconcentration);
  - phosphorus → phosphoric acid for the next gelatin;
  - the stem cells' sludge → back to mutagen.
- **Bacteria per NPU:**
  - One NPU takes about 1,000 mB of medium: 250 for the NPU, 250 for the organoid, 250 for the stem cells and 250 for its share of boards.
  - That medium needs 1,000 mB of mutagen, which needs 10,000 mB of sludge.
  - So about 10,000 mB of bacteria per NPU: 10 culture runs on Europa.
  - Plant collagen from the ring (its c6) can replace c1–c2.
- **Structure:** a sealed hall, 9 × 6 × 9 (as built, `startup_scripts/grindless/luv/biofoundry.js`):
  - plascrete with cleanroom glass;
  - four fermenter columns of laminated glass and clean stainless steel casing;
  - an autoclave bay (heat-proof casings under a steel pipe header);
  - GT lamps (any colour) as the UV ceiling;
  - an iron-door airlock;
  - every part on the back wall (21 cells: 1–2 energy hatches, buses, hatches and the parallel hatch).
- **As built:** steps 1–8 are composed at every load from GTM's live recipes (`tables/biofoundry.json`, `lib/compose.js`), each spent at the highest EU/t of its stages with the stages' energy; steps 9–10 are the table's own. Every recipe has its own circuit.
- **Controller:** LuV hull + 2 LuV pumps + LuV sensor + 4 LuV circuits, assembler 7,680 EU/t × 600 t (`grindless:assembler/biofoundry`).
- **Crossings:**
  - LV: the creature simulator's meat and bones;
  - HV and EV: salt and calcium;
  - IV: U-235 and osmiridium;
  - LuV: Europa's bacteria, the ring and the organoid lab.
- **Risk:** GTM's sterile condition is dropped by registering the steps again under our type, the way the platinum plant composes GT--'s.

### 5. Orbital solar station: `gtceu:orbital_solar_station`, generator type `gtceu:orbital_solar` (Earth orbit)

- **What it gains:** sunlight with no night, the next step of the solar family (LV's mirror tower, EV's lunar array, IV's Mercury field). It is built from GCYR's own LuV cell, which leads to GCYR's Dyson sphere at UV.
- **Panels** (`grindless:orbital_solar_panel`, a block):
  - Route A: 1 `gcyr:photovoltaic_cell` (2 naquadah wafers + tempered glass + 4 gold fine wires + 2 LuV circuits) + a titanium frame + 2 aluminium foils → 1 panel, 7,680 EU/t × 200 t *(tune)*.
  - Route B, after Io: 4 triple-junction cells (machine 8) + 1 LuV circuit + tempered glass + 4 gold fine wires + a titanium frame → 2 panels *(tune)*. That is a quarter of the LuV circuits per panel.
- **Output:**
  - One run of 400 t per lit panel, the lunar array's proven way. A panel counts if its top sees open sky (`canSeeSky`); there is no daytime check, because orbits are always midnight.
  - Per lit panel: 300 EU/t (the family's base) × 1.4 (the sunlight table, Earth orbit) × 1.5 (multi-junction cells against the EV wing panel's silicon) = **630 EU/t** *(tune: the 1.5)*.
  - 64 panels give **40,320 EU/t**.
  - It burns no fuel, so it is not doubled.
- **Key:** c1 with `.dimension('gcyr:overworld_orbit')`. A station in another orbit would get its own circuit at its table factor.
- **Out:**
  - into the global network through a LuV wireless dynamo hatch (2 A: 65,536 ≥ 40,320), with the network's 5 % taken on entry;
  - or through ordinary dynamo hatches for the station's own grid.
  - There is no beam mode and no ledger (decision 10).
- **Structure:** about 19 × 3 × 9: two wings of 32 panels (8 × 4) on a spine of station truss casing, with a 3×3×3 hub holding the controller and the parts.
- **Controller:** LuV hull + 4 photovoltaic cells + 2 LuV sensors (sun tracking) + 2 LuV circuits *(tune)*.
- **Crossings:**
  - IV: Venus naquadah wafers;
  - the solar family from LV to IV;
  - LuV: Io's germanium (route B).
- **Risk:** an orbital generator into a wireless dynamo hatch (spike S0-10).
- **Source:** real: Glaser's solar power satellite (1968), the NASA/DOE reference system (1979) and Caltech's MAPLE (2023). GCYR's cell (LGPL-3.0) is used by id.

### 6. Microgravity smelter: `gtceu:microgravity_smelter`, type `gtceu:microgravity_processing` (any orbit)

- **What it gains:** three things that gravity spoils.
- **Recipes** (the circuit picks):
  1. **ZBLAN fibre → optical pipes.**
     - On the ground, ZBLAN glass crystallizes while it is drawn. In microgravity it stays glassy: Flawless Photonics drew more than 5 km on the ISS in 2024.
     - **ZBLAN at home:** a mixer, 7,680 EU/t × 200 t *(tune)*, takes zirconium (the End's zircon), barium, sodium, aluminium and lanthanum (Mars rare earths) with the fluorspar kiln's fluorine, in the real ratio (53 ZrF₄ · 20 BaF₂ · 4 LaF₃ · 3 AlF₃ · 20 NaF, mol %), and gives `gtceu:zblan` dust (a KubeJS glass material).
     - **In orbit** (circuit 1): 1 ZBLAN dust + 72 mB PTFE → 4 `gtceu:normal_optical_pipe`, 7,680 EU/t × 400 t, with GTM's cleanroom condition kept (a cleaning maintenance hatch in the smelter's maintenance cell meets it) *(tune)*.
     - GTM's `assembler/optical_pipe` makes one `gtceu:normal_optical_pipe` from 8 borosilicate glass fine wires, 8 silver foils (2 ingots) and 144 mB of PTFE, at 7,680 EU/t × 100 t in a cleanroom.
     - The EU per pipe is the same. The pipe needs no silver and an eighth of the PTFE.
     - **No dupe:**
       - The two recycling recipes of the pipe are removed for every route: `gtceu:arc_furnace/arc_normal_optical_pipe` (→ 2 silver ingots + 1 borosilicate glass ingot) and `gtceu:macerator/macerate_normal_optical_pipe`.
       - They are its only recycling in the dump (checked with recycling included: no extractor or decomposition entry).
       - A custom pipe item was rejected: only GTM's block carries computation when placed, and that is where most pipes go.
     - **Who uses them:**
       - the research station and the HPCA (16 each);
       - the data bank (4);
       - the data hatches and the HPCA bridge (2 each);
       - every placed computation link.
       - That is the ZPM gate's research chain (*Gate to ZPM*).
  2. **Metal foam → Whipple shield casing** (circuit 2).
     - On the ground, the bubbles rise and the foam drains. In microgravity the pores stay even (ESA's FOAM experiments).
     - 4 aluminium ingots + 1 titanium dust (the foaming agent, TiH₂ in reality) + 100 mB hydrogen + 2 para-aramid foils (`gcyr:para_aramid_foil`, IV's suit line) → 2 `grindless:whipple_shield_casing`, 7,680 EU/t × 200 t *(tune)*.
     - The casing goes into the wake shield's disc, the harpoon drill's sunward side and the tether's end mass.
  3. **Containerless naquadah alloy** (circuit 3).
     - Electromagnetic levitation (the ISS's EML furnace) melts a metal with no crucible, and in orbit it cools by radiation to the 3 K sky.
     - 2 naquadah dust + 1 osmiridium dust + 1 trinium dust → 4 naquadah alloy ingots (cold), 30,720 EU/t × 2,000 t *(tune)*.
     - **GTM's route** is the mixer (7,680 EU/t × 400 t for 4 dust), the 7,200 K EBF (30,720 EU/t × 1,000 t each) and the freezer (7,680 EU/t × 300 t each, with 500 mB of Liquid Helium, 250 back). That is about 135 M EU for 4 ingots.
     - **Ours** is 61 M EU, with no coil and no helium: speed and several steps in one.
     - The trinium still needs a 7,200 K EBF, so the naquadah coil is built anyway.
- **Byproducts:** none. The helium of the alloy route is never used.
- **Structure:**
  - a 3×3×7 pressurized module of station truss casing;
  - a 3×3×3 levitation furnace core of 8 HSS-G coil blocks around an empty centre;
  - a 1×1×6 fibre drawing tower above it (titanium frames and borosilicate glass).
- **Controller:** LuV hull + LuV field generator (levitation) + 2 LuV pumps + 4 LuV circuits *(tune)*.
- **Crossings:**
  - MV: the End's zircon;
  - HV: PTFE;
  - EV: Mars lanthanum;
  - IV: the fluorspar kiln's fluorine, Venus naquadah and Mercury's osmiridium;
  - LuV: trinium;
  - ZPM: naquadah alloy (the ZPM hull) and optical pipes (research).
- **Risks:**
  - Registering ZBLAN.
  - Removing the pipe's recycling must survive GTM's recycling generator: spike S0-5 checks it on a fresh dump.
- **Source:** real: Poulain and Lucas's ZBLAN (Rennes, 1975), Made In Space and Flawless Photonics (ISS, 2017–2024), ESA's FOAM and the ISS's EML furnace.

### 7. Zero-g crystal grower: `gtceu:zero_g_crystal_grower`, type `gtceu:microgravity_crystal_growth` (any orbit)

- **What it gains:** two benefits, and no more (decision 11).
  - **Speed:** four times faster, 3,000 t instead of 12,000 t. It is the journey's own rule: "in low gravity, crystals grow faster."
  - **Certainty:** 100 %. With no convection there are no striations, so the seed route stops being a 25 % gamble.
- **Not taken:**
  - The dopant stays at GTM's dose (16 mB of europium, or 250 mB of sludge or mutagen), so the Mk1's europium and Europa's sludge keep their weight.
  - GTM's cleanroom condition stays: any multiblock meets it with a cleaning maintenance hatch, so it was never a real benefit.
- **Recipes** (GTM's cleanroom condition kept; the grower has a maintenance cell for the hatch):

  | c | In | Out | EU/t × t | GTM (`gtceu:autoclave/…`) |
  |---|---|---|---|---|
  | 1 | 1 exquisite olivine (belt) + 16 mB europium | 1 raw crystal chip, 100 % | 320 × 3,000 | `raw_crystal_chip_olivine`: 25 %, 12,000 t |
  | 2 | 1 exquisite emerald + 16 mB europium | 1 raw crystal chip, 100 % | 320 × 3,000 | `raw_crystal_chip_emerald`: 25 %, 12,000 t |
  | 3 | 1 raw crystal chip part + 16 mB europium | 1 raw crystal chip | 480 × 3,000 | `…_from_part_europium`: 100 %, 12,000 t |
  | 4 | 1 part + 250 mB bacterial sludge | 1 raw crystal chip, 100 % | 480 × 3,000 | `…_from_part_bacterial_sludge`: 85 %, 12,000 t |
  | 5 | 1 part + 250 mB mutagen | 1 raw crystal chip, 100 % | 480 × 3,000 | `…_from_part_mutagen`: 85 %, 12,000 t |
  | 6 | 64 sapphire dust + 1 exquisite sapphire (seed) | 1 `grindless:sapphire_test_mass` | 7,680 × 6,000 *(tune)* | — |

- **Benchmark against the gate's crystal needs:**
  - **Four crystal processor assemblies:** GTM's `circuit_assembler/crystal_assembly_luv` makes 2 from 2 crystal processors. So 4 assemblies take 4 processors, 2 crystal CPUs and 2 raw chips: 32 mB of europium or 500 mB of sludge, the same as GTM.
  - **The wetware processors' crystal CPUs:** GT--'s line takes 16 per 32 processors, so 16 more chips per batch.
  - **Time:** 18 chips take 54,000 t in one grower (45 min). In one GTM autoclave they take 216,000 t, plus the seed's 25 % gamble.
- **Structure:** a 5×5×5 module of station truss casing around a 3×3×3 growth core of inert machine casing, with laminated glass ports.
- **Controller:** LuV hull + 2 LuV pumps + LuV sensor + 4 LuV circuits *(tune)*.
- **Crossings:**
  - the belt's olivine and Earth's emerald;
  - the Mk1's europium;
  - Europa's sludge and mutagen, through the biofoundry;
  - GTM's crystal line;
  - the GW detector (the test masses).
- **Source:** real: crystal growth on Skylab (1973) and Spacelab, protein crystals on the ISS; KAGRA's sapphire.

### 8. Wake shield facility: `gtceu:wake_shield_facility`, type `gtceu:wake_epitaxy` (any orbit)

- **What it gains:** free vacuum ("vacuum processes are free," `journey.md`). Behind a disc flying through orbit, the wake reaches about 10⁻¹⁴ torr, emptier than any chamber. NASA's WSF grew GaAs films there by molecular-beam epitaxy on three Shuttle flights (1994–1996).
  - The gain is material and time: a molecular beam lands on the wafer, where chemical vapour deposition wastes most of its source. Freedom from the cleanroom is not claimed.
  - GTM's own cleaning maintenance hatch (`gtceu:cleaning_maintenance_hatch`, `CleaningMaintenanceHatchPartMachine`; the pack's HV recipe `grindless:assembler/cleaning_maintenance_hatch`) already gives any multiblock a cleanroom. The facility keeps GTM's cleanroom condition and takes that hatch.
- **Recipes:**
  1. **UHPIC wafer** (circuit 1): 1 HPIC wafer + 288 mB molten naquadah + 4 indium gallium phosphide dust → 1 UHPIC wafer, 30,720 EU/t × 600 t *(tune: half the source and half the time)*. GTM: 576 mB + 8 IGP, 1,200 t.
  2. **HPIC wafer** (circuit 2): 1 MPIC wafer + 144 mB molten vanadium gallium + 1 IGP → 1 HPIC wafer, 7,680 EU/t × 600 t *(tune)*. GTM: 288 mB + 2 IGP, 1,200 t.
  3. **Triple-junction wafer** (circuit 3): 1 germanium plate (Io) + 1 gallium arsenide dust + 1 IGP dust → 1 `grindless:triple_junction_wafer`, 7,680 EU/t × 400 t *(tune)*.
     - GTM's cutter (in a cleanroom) gives 4 `grindless:triple_junction_cell` from it.
     - Real: GaInP/GaAs/Ge cells are grown on germanium; Juno flies them at 5 AU.
- **Demand:** the Mk1 takes 64 UHPIC chips (32 wafers), and each LuV and ZPM energy hatch takes 2 chips.
- **Structure:**
  - a 9×9 octagonal disc of Whipple shield casing, one block thick, facing the direction of flight;
  - behind it, a 3×3×3 epitaxy carousel of PTFE inert casing with the controller and the parts (a maintenance cell for the cleaning hatch).
- **Controller:** LuV hull + 2 LuV emitters (the beam sources) + 4 LuV circuits *(tune)*.
- **Crossings:**
  - MV: gallium (bauxite) and vanadium (the End);
  - IV: Venus naquadah;
  - indium from Earth's galena and sphalerite, then Io;
  - LuV: Io's germanium, the orbital solar station (route B) and the probes.
- **Source:** NASA and the University of Houston's Wake Shield Facility (STS-60, STS-69, STS-80).

### 9. Rotating hydroponic ring: `gtceu:hydroponic_ring`, type `gtceu:greenhouse` (greenhouse step 4; any orbit): a molecular farm

- **What it gains:** a route, not throughput (decisions 8 and 15): **molecular farming.** Engineered crops make human proteins. Both are real:
  - ORF Genetics grows human growth factors in barley, in Iceland;
  - CollPlant makes recombinant human collagen in tobacco.
- **Why the orbit:** the ring gives what this pack's farms can't:
  - gravity from spin, because plants grow poorly in 0 g (Veggie, the Advanced Plant Habitat);
  - sunlight all the time;
  - **biocontainment:** transgenic crops sealed in orbit can't escape into the wild.
- **Recipes** (programmed circuits 5 and 6, ids under `greenhouse/luv/`, which lower greenhouses skip by the family veto; orbits only):
  - **Neurotrophic factor** (c5): 1 engineered barley seed (not consumed: the crop replants) + 1,000 mB water + 500 mB CO₂ → 1 `grindless:neurotrophic_factor` + 250 mB biomass + 200 mB O₂, 480 EU/t × 1,200 t *(tune)*. The organoid lab needs one per organoid.
  - **Plant collagen** (c6): 1 engineered tobacco seed (not consumed) + 1,000 mB water + 500 mB CO₂ → 2 `gtceu:collagen_dust` + 250 mB biomass + 200 mB O₂, 480 EU/t × 1,200 t *(tune)*. It replaces the biofoundry's bone collagen: no meat and no bone.
  - It has no ×4 crop mode. Crops stay with the sealed dome (×3).
- **Byproducts** (kept: `G.noVoiding` in both places):
  - O₂ → the station's oxygen spreader (the player's bubble at 3 K);
  - biomass → the biofoundry's sludge.
  - The CO₂ comes from home through Earth orbit's AE2 link, for example the MV engine test stand's exhaust, as for the dome.
- **Structure:** a ring 15 across and 3 high:
  - a 3-wide channel with a soil bed under tempered glass;
  - spokes of titanium frames to a 3×3×3 hub with the controller and the parts;
  - 4 `grindless:magnetic_bearing` blocks in the hub (machine 3, the belt's tetrataenite).
- **Controller:** LuV hull + 2 LuV motors (the spin) + 4 LuV circuits *(tune)*.
- **Crossings:**
  - the greenhouse family from the Steam Age;
  - MV: the CO₂;
  - EV: the sealed dome;
  - LuV: the belt (bearings), the biofoundry (seeds) and the organoid lab (the factor).
- **Risk:** a seed held as a 0 % chanced input in the family's type. GTM supports those (circuits are the same mechanism).
- **Source:** real: ORF Genetics (barley-made growth factors), CollPlant (rhCollagen from tobacco), Veggie and APH on the ISS, von Braun's wheel and the Stanford torus.

### 10. Organoid lab: `gtceu:organoid_lab`, type `gtceu:organoid_assembly` (any orbit)

- **What it gains:** the neuro processing unit at LuV voltage, the only LuV route to it.
  - GTM's `circuit_assembler/neuro_processor` runs at 80,000 EU/t. That needs a ZPM single block, because GTM's large circuit assembler takes exactly one energy hatch (`GCYMMachines.java:338`), GT--'s line refuses it on every LuV hatch, and our Universal Assembly Factory refuses it unless one hatch reaches ZPM (spike S0-4).
  - GT--'s circuit assembly line can't run it below UV hatches, and its own wetware recipes consume NPUs.
  - In 0 g, neural organoids grow in three dimensions without a scaffold. Brain organoids have flown to the ISS since 2019, and FinalSpark's living-neuron processors (2024) compute.
- **Recipes** (GTM's cleanroom condition kept, with a cleaning maintenance hatch; outputs kept with `G.noVoiding` in both places):
  1. **Neural organoid** (c1): 16 stem cells + 250 mB sterilized growth medium + 1 neurotrophic factor (machine 9) → 1 `grindless:neural_organoid`, 30,720 EU/t × 600 t *(tune)*.
  2. **NPU** (c2): GTM's NPU inputs with the organoid in place of the 16 stem cells → 1 `gtceu:neuro_processing_unit`, 30,720 EU/t × 1,563 t. That is GTM's 80,000 EU/t × 600 t (48 M EU) at LuV voltage. The inputs:
     - 1 wetware printed circuit board and 1 neural organoid;
     - 250 mB sterilized growth medium;
     - 8 PBI small fluid pipes, 8 electrum plates, 16 silicone rubber foils and 8 HSS-E bolts.
- **What it leaves to others:**
  - Wetware processors come from GT--'s line: 16 NPUs + 16 crystal CPUs → 32, at 30,720 EU/t × 750 t on one LuV energy hatch on GT--'s circuit assembly line (`grindless:circuit_assembly_line/wetware_processor_luv`: GT--'s 38,400 × 600 recipe re-registered at LuV voltage with the same 23.04 M EU and its research; the line has one energy-hatch cell, spike S0-4).
  - Wetware boards come from GTM's LuV circuit assembler (30,720 EU/t) with a cleaning hatch.
- **Structure:**
  - a sealed 5×5×5 module of plascrete and cleanroom glass;
  - a 3×3×3 incubator core of laminated glass;
  - 4 GTM filter casings and a maintenance cell;
  - all docked to station truss casing.
- **Controller:** LuV hull + 2 LuV robot arms + LuV sensor + 4 LuV circuits *(tune)*.
- **Crossings:**
  - HV and EV: fiber boards, through the wetware board;
  - IV: PBI;
  - LuV: Europa (through the biofoundry), the ring, and the grower (through GT--'s line).
- **Validator:** this lab is the only LuV path to the NPU.
- **Risk:** spike S0-4.

### 11. Harpoon anchor drill: `gtceu:harpoon_anchor_drill`, type `gtceu:vein_drilling` (vein drill step 7a; asteroid belt)

- **What it gains:**
  - It drills where there is almost no gravity. A drill pushes itself off the rock, so harpoons hold it down; this is real (Philae's harpoons and anchoring studies for asteroid sampling).
  - The belt's veins are drilled only here.
- **Recipes:** `vein_drilling/luv/harpoon_<vein>_hss_s`. The family veto keeps lower drills off them.
  - **Yield:** 11.25 ores a run, twice IV's 5.625 *(tune)*.
  - **Wear:** the LuV bit (`grindless:hss_s_drill_bit`, HSS-S) at 0.25 % a run, the family's rate, and the harpoons (`grindless:anchor_harpoon`: an HSS-S rod with a tungsten carbide tip) at 1 % a run *(tune)*.
  - **Fluid:** none. It is vacuum, as on Mercury.
  - **Cap:** 256 in `bores` *(tune; IV's 128)*.
- **Belt veins** (`veins_belt.json`, on a new world gen layer over `minecraft:tuff`, limited to `grindless:asteroid_belt`; weights *(tune)*):

  | Vein | Ores | Real basis |
  |---|---|---|
  | M-type metal | meteoric iron (`gtceu:meteoric_iron`, new: Fe-Ni-Co), tetrataenite (`gtceu:tetrataenite`, new: L1₀ FeNi), pentlandite | iron meteorites (kamacite, taenite, tetrataenite) |
  | S-type stony | olivine, chromite, magnetite | ordinary chondrites |
  | C-type | magnetite, graphite | carbonaceous chondrites |

  - Meteoric iron's GTM byproducts are only iron, nickel and cobalt. The PGM concentrate comes from the asteroid processor alone.
- **Structure:** a low spider, about 7 × 7 × 8:
  - a 5×5 base of sintered asteroid regolith casing, clamped by 4 angled harpoon legs;
  - a 3×3 drill head and a short derrick;
  - Whipple shield casing on the sunward side.
- **Controller:** LuV hull + 2 LuV pistons (the harpoon guns) + LuV motor + 4 LuV circuits *(tune)*.
- **Crossings:**
  - EV: the platinum plant, through the concentrate;
  - IV: the drill family's bits;
  - LuV: Mercury's Ir and Os in HSS-S, and the Whipple casing.
- **Risks:**
  - The KubeJS world gen layer is untested in this pack. One bench run is needed: a fresh belt chunk with the vein.
  - Low gravity has not been tried for playability.
- **Source:** real: Rosetta's Philae (2014) and OSIRIS-REx's touch-and-go sampler; iron meteorite mineralogy.
- **As built (B5, `luv/asteroid_belt.js`):**
  - 7 × 8 × 7: a 5 × 6 pad of regolith casing, four HSS-S harpoon legs, a 3 × 3 × 3 body with the Whipple casing on its back face, a titanium derrick over a tungstensteel drill string.
  - The veins sit at Y 20–200 *(tune after S0-1)*, weights 40 / 30 / 20. The vein drilling type takes three item inputs (sample, bit, harpoon).
  - The bit: LuV lathe, a long HSS-S rod, 30,720 EU/t × 200 t. The harpoons: IV assembler, 2 HSS-S rods + a tungsten carbide plate → 2.
  - The regolith casing: alloy smelter on the belt only, 4 tuff (the drill's stone) + 1 titanium dust → 2.
  - The belt's seed: chemical reactor on the belt, raw meteoric iron + ender pearl + 250 mB helium-3; `planets.json` gets `belt`.

### 12. Asteroid processor: `gtceu:asteroid_processor`, type `gtceu:asteroid_processing` (anywhere; built at the belt base)

- **What it gains:**
  - The Mond process: several steps in one, with no acid and no water.
    - Metal + CO at about 50 °C gives the gases Ni(CO)₄ and Fe(CO)₅; they are distilled apart and broken down at about 230 °C into pure metal, and the CO comes back.
    - It is Inco's real process (Clydach, 1902) and the classic plan for M-type asteroid metal (J. S. Lewis, *Mining the Sky*).
  - It is also the only source of the asteroid PGM concentrate: the platinum metals don't form carbonyls and stay behind. Clydach's carbonyl residue really was a feedstock for PGM refining.
- **Recipes:**
  1. **Mond** (circuit 1): 16 crushed meteoric iron + a CO charge (1,000 mB `gtceu:carbon_monoxide` in its own hatch, not consumed) → 24 iron dust + 4 nickel dust + 1 cobalt dust + 1 `grindless:asteroid_pgm_concentrate`, 1,920 EU/t × 400 t *(tune)*. The optical miner tops up the CO (Boudouard step).
  2. **Magnetic split** (circuit 2): 16 crushed tetrataenite → 12 tetrataenite dust + 4 meteoric iron dust (the kamacite around it) *(tune)*. Carbonyl would break the ordered FeNi, so it is split by magnet first.
- **Byproducts:**
  - iron, nickel and cobalt go to the network (voidable);
  - the CO stays in the machine;
  - the concentrate goes home: mandatory-kept, `G.noVoiding` in the modifier and in `beforeWorking`.
- **Platinum plant, mode 4** (EV's machine, not counted): the absolute balance is in *Older machines, new modes*. 22 concentrate → 1 platinum group sludge + 3 Ir + 3 Os, which the plant's existing circuit-2 recipes split into about 22 units of six PGMs, close to the CI-chondrite ratio. It is the second off-Earth source of iridium and osmium, and the first of platinum metals in bulk.
- **Structure:** a 5×5×6 carbonyl column of steel pipe casing (the reactor and the decomposer), a 3×3×3 magnetic separator of steel casing, and a CO gas holder of laminated glass.
- **Controller:** LuV hull + 2 LuV pumps + LuV robot arm + 4 LuV circuits *(tune)*.
- **Crossings:**
  - EV: the platinum plant;
  - MV and HV: GTM's CO from wood gas or the syngas plant (the charge);
  - IV: GT--'s line;
  - LuV: the ring's magnetic bearings (tetrataenite, through the HTS magnet works), and the optical miner's CO.
- **Risks:** a KubeJS ore material must keep its GTM byproducts free of PGMs, so that the concentrate stays exclusive.
- **Source:** real: Ludwig Mond (1890) and the Clydach refinery; carbonyl metallurgy for asteroids (Lewis, 1996).
- **As built (B5):**
  - A third recipe, circuit 3: the same Mond from 16 meteoric iron dust. GTM's ore line and the magnetic split leave that dust, and it has no other use.
  - The magnetic split: 1,920 EU/t × 200 t. It stays voidable; circuits 1 and 3 refuse item voiding.
  - Hollow 5 × 5 × 6 column, 3 × 3 × 3 separator (the parts and the parallel hatch), a 3 × 2 × 3 glass holder.

### 13. Optical miner: `gtceu:optical_miner`, type `gtceu:optical_mining` (asteroid belt)

- **What it gains:** the belt's volatiles, and the only chondritic extract.
  - The harpoon drill takes solid veins. C-type boulders are crumbly rubble, rich in water, carbon and organics.
  - Optical mining bags a boulder and spalls it with concentrated sunlight, and a cold trap catches what boils off (TransAstra's APIS, tested on asteroid simulant).
  - The extract (nitrogen, phosphorus and organics) is what the Europan culture needs. Europa's ocean is thought to be short of both nutrients, and carbonaceous-chondrite extracts feed microbes and algae (Mautner, 2002; the ammonia and phosphates of Bennu's samples, 2025).
- **Recipes:**
  1. **Optical mining** (c1): 1 `grindless:capture_bag` (used up at 5 % a run *(tune)*) → 4,000 mB water + 1,000 mB CO₂ + 2 carbon dust + 1 `grindless:chondritic_extract`, 1,920 EU/t × 1,200 t *(tune)*.
     - A run starts only with the sun on the receiver and every mirror under open sky. That is the Mercury solar works' proven check, closed by `lib/fresh_run.js`.
     - The belt keeps a day cycle, and its sunlight factor (0.19) is why the mirror field is big.
  2. **Boudouard** (c2): 1,000 mB CO₂ + 1 carbon dust → 2,000 mB CO, 480 EU/t × 200 t *(tune)*. This is the asteroid processor's CO charge, made on the belt.
- **Capture bag:** assembler, 8 para-aramid foils (`gcyr:para_aramid_foil`) + 4 Kapton K plates (`gcyr:kapton_k_plate`) + 2 titanium rods → 1 *(tune)*.
- **Byproducts** (kept: `G.noVoiding` in both places):
  - water → the belt base and the network;
  - CO₂ and carbon → c2.
- **Structure:** about 13 × 6 × 13:
  - eight heliostat mirrors (laminated glass on titanium frames) on the rubble floor;
  - a 3×3×3 capture chamber at their focus;
  - a 1×1×5 cold-trap column of frostproof casing;
  - a controller hut of asteroid regolith casing.
- **Controller:** LuV hull + 2 LuV sensors (sun tracking) + LuV pump + 4 LuV circuits *(tune)*.
- **Crossings:**
  - IV: the Mercury solar works' heliostat check, and GCYR's aramid and Kapton (the suit line);
  - LuV: the Europan culture and the asteroid processor's CO.
- **Source:** real: TransAstra's optical mining (Sercel; NASA NIAC, 2016–2019); Mautner, "Planetary bioresources and astroecology" (2002); the OSIRIS-REx samples of Bennu (2025).
- **As built (B5):**
  - 13 × 5 × 13. The capture chamber is robust casing with a laminated glass receiver on top; the cold trap is a frostproof column; the hut is 3 × 3 × 3.
  - Both recipes are belt-only. The capture bag: IV assembler, 7,680 EU/t × 200 t.
  - The extract's use (the Europan culture) is B8's; until then it is an EMI coverage exception.

### 14. Fumarole condenser: `gtceu:fumarole_condenser`, type `gtceu:fumarole_condensing` (Io)

- **What it gains:**
  - the only germanium before ZPM;
  - the Jovian site casing.
  - Volcanic gases drop rare metals in bands as they cool: the fumaroles of Kudryavy (Kuril Islands) deposit rhenium, indium and germanium. Io's sublimates are taken by analogy *(design)*.
- **Recipes:**
  1. **Collect** (circuit 1, the lookup key, as the lunar array's circuit is): over a fumarole field (3 `biomesoplenty:brimstone_fumarole` blocks in the floor of the pattern) → 4,000 mB SO₂ + 8 sulfur dust + 1 `grindless:ionian_sublimate`, 7,680 EU/t × 400 t *(tune)*.
  2. **Separate** (circuit 2): 4 Ionian sublimate + 2,000 mB hydrogen, with an HCl charge (1,000 mB, not consumed) → 2 germanium dust + 1 indium dust + 1,000 mB water *(tune)*.
     - Real: GeCl₄ is distilled off, hydrolysed back to HCl and GeO₂, and the oxide is reduced with hydrogen.
  3. **Sulfur concrete** (circuit 3): 8 sulfur dust + 8 Ionian rock (Biomes O' Plenty's black sand or basalt) → 8 `grindless:sulfur_concrete_casing`, 1,920 EU/t × 200 t, only on Io *(tune)*.
     - Sulfur concrete needs no water, which makes it the leading building material for in-situ use on the Moon and Mars. On the icy moons, water-based concrete can't cure.
- **Byproducts** (the condenser refuses voiding, `G.noVoiding` in both places):
  - SO₂ fills the volcanic intake's charge, and the rest goes home over the Io pair to sulfuric acid (GTM's contact line, the LV acid plant's chemistry).
  - Sulfur goes into concrete and home.
  - Germanium, indium and the sublimate are kept.
- **First on Io:** it runs at 7,680 EU/t on a brought IV wireless energy hatch from the first day, so it comes before the volcanic intake, which needs its SO₂ and its sulfur concrete (*Bridges and first landings*).
- **Structure:**
  - a 3×3 intake over the fumarole field;
  - a column of four condenser zones, from hot to cold: tungsten steel, stainless steel, aluminium and frostproof casing, up to 14 high;
  - vault casings.
  - *As built (B6):* 5×15×5. Three fumaroles in a line under the column; a 5×5×2 vault housing that takes every hatch and bus and the parallel hatch; four 3-block zones of robust tungstensteel, clean stainless steel, aluminium frames and frostproof casing. No maintenance hatch (maintenance is off pack-wide). The Ionian rock is basalt (GTM's rock breaker) or black sand, one recipe each.
- **Controller:** LuV hull + 2 LuV pumps + 4 LuV circuits *(tune)*.
- **Crossings:**
  - LV: sulfuric acid;
  - IV: indium for IGP (UHPIC) and ITBTC, which until now came only from Earth's galena and sphalerite;
  - LuV: germanium for the wake shield's cells (orbital solar station, probes) and sulfur concrete for every Jovian base.
- **Risks:** Biomes O' Plenty's fumarole block in a pattern. Io's surface rules place fields of it, and BOP's own world generation is untouched.
- **Source:** real: Kudryavy's rhenium and the volatile metals of fumaroles; sulfur concrete for the Moon and Mars (NASA MSFC studies).

### 15. Volcanic intake: `gtceu:volcanic_intake`, generator type `gtceu:volcanic_heat` (Io)

- **What it gains:** power from Io's tidal heat, the machine the journey names.
  - Io radiates about 10¹⁴ W in all; Loki Patera alone, about 10 TW. It is Jupiter's gravity, worked through Io's orbit, not energy from nothing.
  - Io is dry, so the engine runs a closed Rankine loop with sulfur dioxide, Io's own volatile, as the working fluid.
- **Recipe:**
  - In: a charge of at least 4,000 mB SO₂ in its own hatch, not consumed (IV-A5's `notConsumableFluid`), with programmed circuit 1 as the lookup key.
  - Out: 32,768 EU/t × 400 t, one parallel per turbine module (up to 4), so up to **131,072 EU/t** *(tune)*. The EU leaves through a LuV wireless dynamo hatch (4 A) into the global network, which takes its 5 % on entry, or through ordinary dynamo hatches for a local grid.
  - Only on Io (`.dimension('grindless:io')`).
  - It burns no fuel, so it is not doubled.
- **Order on Io:**
  1. the fumarole condenser, on a brought wireless energy hatch;
  2. SO₂ and sulfur concrete (the bundle's frame);
  3. this intake;
  4. the tether in orbit.
- **Wear:** the heat exchanger erodes in hot sulfur. `grindless:heat_exchanger_bundle` (tungsten steel tubes in a sulfur concrete frame) is used up at random, about one an hour per module *(tune)*.
- **Structure:**
  - a 3×3 hot plate that must stand on magma blocks (the patera's crust; lava sources if the helper accepts fluid blocks, *test*);
  - a 5×5×10 heat-exchanger tower of sulfur concrete and vault casing;
  - up to 4 turbine modules (3×3×3, titanium turbine casing);
  - radiator fins to Io's 110 K sky.
  - *As built (B6):* 11×12×5. Magma blocks only (a fluid block in a pattern would also match flowing lava); the vault room is the tower's foot (1 input bus, 1 input hatch, 1–4 dynamo hatches). Module slot 1 is required; slots 2–4 are a whole module or air, and complete modules are counted in the world at every run start. Bundle wear: 56/10,000 a run per module.
- **Controller:** LuV hull + 2 LuV pumps + LuV motor + 4 LuV circuits *(tune)*.
- **Crossings:**
  - EV: the Moon's titanium, in the vault;
  - IV: the Venus heat engine (the family of site heat);
  - LuV: the fumarole condenser's SO₂ and sulfur concrete.
- **Rule 8:**
  - **Costs:** the trip, the vault casings, the SO₂ charge and the bundles.
  - **Never free:** nothing comes out without a patera under it.
- **Source:** real: Io's heat flow (Veeder and others; Galileo and Juno), Loki Patera; SO₂ studied as a Rankine working fluid.

### 16. Flux-tube tether: `gtceu:flux_tube_tether`, generator type `gtceu:electrodynamic_tether` (Io orbit; conditional on spike S0-3)

- **What it gains:** power from Jupiter's spin.
  - Io orbits inside the plasma torus, which turns with Jupiter at about 74 km/s while Io moves at 17 km/s. A bare tether there collects electrons and drives a current; the natural Io–Jupiter flux tube carries about 1 TW.
  - Outside synchronous orbit, the Lorentz force pushes the tether forward, so it needs no reboost (Sanmartín and Lorenzini).
- **Why it earns its place** (decisions 3 and 17):
  - It is LuV's only power that needs neither a surface nor a fuel. That is the second station's reason to exist, and the journey's "orbital stations that exploit without landing" (LuV to UV).
  - With the network it needs no beam: its wireless dynamo hatch serves every base, so the Jovian bases need no local generator once it runs.
  - Its crossings are its own: Mars argon (EV) and GCYR's aramid (IV).
  - If spike S0-3 shows a second station is unreliable, the tether and the Io-orbit station are not built, and the sulfur–iodine plant (16b) takes the slot. LuV keeps twenty.
- **Recipe:**
  - c1 + a `grindless:tether_spool` (used up at random, about one an hour *(tune)*) + 50 mB argon a run (the hollow cathode) *(tune)*;
  - → 65,536 EU/t × 400 t per spool cell (2 cells), up to 131,072 EU/t, into the network through a LuV wireless dynamo hatch (4 A) *(tune)*.
  - Only in Io orbit. It burns no fuel, so it is not doubled.
- **Spool:** assembler 7,680 EU/t × 400 t: 64 aluminium foils + 8 para-aramid foils + 1 Whipple shield casing (the end mass) *(tune)*.
- **Structure:** a 5×5×5 deployer of station truss and vault casing, two reel cells, a hollow-cathode port and a 1×1×10 stub of tether.
- **Controller:** LuV hull + 2 LuV motors (the reels) + LuV sensor + 4 LuV circuits *(tune)*.
- **Crossings:**
  - EV: Mars argon, and the Moon's titanium in the vault;
  - IV: GCYR's aramid;
  - LuV: the Whipple casing.
- **Source:** real: Sanmartín, Lorenzini and others, *Bare-tether power generation and propulsion at Jupiter* (2005–2008); the Io flux tube (Bigg, 1964; Voyager).
- **As built (B7):**
  - One switch: `tables/stations.json` (`lib/stations.js`). The tether is registered only in its mode (`enabled` true, `second` = `grindless:io_orbit`); in the `pending` mode (S0-3 not concluded) neither 16 nor 16b is registered, and the spool stays hidden (its hidden-table group says `unless: tether`).
  - 5×15×5: a 5×5×5 deployer with station truss edges and radiation vault faces (1–4 dynamo or wireless dynamo hatches, 1 input bus), two reels of three tungstensteel gearboxes inside, an input hatch on the roof as the hollow-cathode port, and a 10-block aluminium-frame stub from the roof's centre.
  - The two reels are two parallels through `lib/generators.js`: 65,536 EU/t each, 131,072 on a 4 A LuV hatch. Each reel takes 25 mB argon and a spool at 28/10,000 a run: one spool an hour at full power. Recipe `grindless:electrodynamic_tether/plasma_torus`, only in the second station's orbit.
  - Controller: `MSM / CHC / C C` (motors, sensor, LuV circuits, hull); the magnet works already uses `CSC / MHM / C C`.

### 16b. If a second station fails: Io sulfur–iodine hydrogen plant: `gtceu:sulfur_iodine_plant`, type `gtceu:thermochemical_hydrogen` (Io)

This plant takes slot 16 only if spike S0-3 shows that a second station can't be trusted (decision 17). Then the Io-orbit station isn't built, and the power plan loses the tether. The intake alone still clears the gate.

- **What it gains:** hydrogen and oxygen from Io's volcanic heat, with no electrolysis.
  - The sulfur–iodine cycle is real:
    1. sulfuric acid splits at about 850 °C into SO₂, water and oxygen;
    2. the Bunsen reaction turns iodine, SO₂ and water into HI and sulfuric acid;
    3. HI splits at about 450 °C into hydrogen and iodine.
  - Water goes in, hydrogen and oxygen come out, and the sulfur and iodine go round. General Atomics designed it in the 1970s, and JAEA ran it continuously for 150 hours in 2019.
  - Hydrogen is LuV's bulk reagent:
    - mode 2 takes 6,625 mB a batch;
    - the Mk1 takes 375 mB per 16 mB of europium;
    - the Europan culture takes 500 mB a run.
  - GTM's electrolyzer (`gtceu:electrolyzer/water_electrolysis`) splits 1,000 mB of water at 30 EU/t × 1,500 t. Mode 2 at ×4 alone needs about 18 mB of hydrogen a tick, the output of about thirteen electrolyzers running nonstop.
  - This plant gives 20 mB a tick with four modules, enough for mode 2 at ×4, at about a quarter of the EU per mB *(tune)*: the heat is Io's. That is throughput, and three reactions in one.
- **Recipe** (c1, only on Io; the hot plate stands on magma, like the intake's):
  - 1,000 mB water + the charges (2,000 mB sulfuric acid and 8 iodine dust, not consumed) → 2,000 mB hydrogen + 1,000 mB oxygen.
  - 30 EU/t × 400 t: the pumps; the heat is Io's *(tune)*.
  - One parallel per decomposer module, up to 4 *(tune)*.
- **Water:** Europa's (the cryobot's melt and its ice), over AE2 or in an ender tank.
- **Byproducts** (kept: `G.noVoiding` in both places):
  - hydrogen → mode 2, the Mk1 and the culture;
  - oxygen → the bases' oxygen spreaders.
- **Structure:**
  - a 5×5 hot plate on magma;
  - up to four 3×3×3 decomposer modules of tungsten steel casing around it;
  - a 3×3×3 Bunsen reactor of PTFE inert casing;
  - a 3×3×6 HI column of inert casing;
  - vault casings.
- **Controller:** LuV hull + 2 LuV pumps + LuV sensor + 4 LuV circuits *(tune)*.
- **Crossings:**
  - MV: iodine from kelp (`gtceu:chemical_reactor/iodine`);
  - LuV: Europa's water, Io's heat, and the hydrogen of mode 2 and fusion.
- **Source:** real: the sulfur–iodine cycle (General Atomics; JAEA's continuous run, 2019).
- **As built (B7, written and registered only when `tables/stations.json` has `second: null`):**
  - 11×14×5: a 5×5 of magma under a tungstensteel firebox hot plate; a vault room (1–2 energy hatches, 1–2 input buses, 1–3 input and output hatches); a 3×3×3 Bunsen reactor of PTFE inert casing under a 3×3×6 HI column (inert casing round a PTFE pipe casing core); four 3×3×3 robust tungstensteel decomposer slots, the first required.
  - One parallel per complete module, counted in the world at every run start, capped by the energy hatches' voltage; no overclock. Recipe `grindless:thermochemical_hydrogen/sulfur_iodine`; controller `PSP / CHC / C C`.

### 17. Cryobot: `gtceu:cryobot`, type `gtceu:vein_drilling` (vein drill step 7b; Europa)

- **What it gains:** the only way to Europa's ocean, under 15–25 km of ice, and so to its brine and its life.
  - A cryobot is a melt probe with a heat source of tens of kilowatts, which pays out its tether as it sinks.
  - Real: Philberth's probes (1960s), Stone Aerospace's VALKYRIE (it melted through glacier ice by laser, Alaska, 2015) and JPL's nuclear cryobot studies.
- **Recipes** (only on Europa; ids under `vein_drilling/luv/cryobot_*`. The family veto keeps lower drills off them, and each LuV drill runs only its own prefix, as IV's two drills do):
  1. **Ocean sample** (circuit 1): 1 `grindless:cryobot_probe` (consumed: a melt head, an RTG pellet, a LuV sensor and a tether reel, made at home *(tune)*) → 1 `grindless:europan_ocean_sample` (the living sample; the algae bioreactor keeps it as a catalyst) + 1,000 mB Europan brine, 7,680 EU/t × 6,000 t *(tune)*.
     - Nobody reaches that ocean by hand, so the sample comes from the probe.
     - Each sample costs a probe, so "first" needs no flag, and a second bioreactor just costs another probe.
  2. **Brine** (circuit 2, no probe): 8,000 mB `gtceu:europan_brine` + 2,000 mB water (the melt) a run, 7,680 EU/t × 400 t *(tune)*.
     - The melt head (`grindless:melt_head`: tungsten carbide over an RTG heat source) wears at 0.25 % a run, the family's bit rate.
     - Its RTG pellet (IV's hot cell) is used up at random, about one an hour *(tune)*.
  - The two recipes differ by circuit and by the probe, so GTM's lookup holds both.
  - The brine is water with magnesium sulfate and sodium chloride. Hubble saw the salt at the surface in 2019.
- **Byproducts:**
  - The sample and the brine are mandatory-kept: `G.noVoiding` in the modifier and in `beforeWorking`.
  - The brine goes to the culture first.
  - In GTM's electrolyzer and centrifuge, the rest of it gives magnesium, sulfur, sodium and chlorine: all common, all with a use.
  - The water goes to the network.
- **Structure:**
  - a 5×5 base of sulfur concrete and vault casing on the ice;
  - a 3×3×10 tower above it (the hoist and the tether drum);
  - in the pattern, a 1×1×5 shaft of packed or blue ice under the base.
- **Controller:** LuV hull + 2 LuV pumps + LuV sensor + 4 LuV circuits *(tune)*.
- **Crossings:**
  - IV: the hot cell's RTG pellets, and the drill family's heat tax;
  - LuV: Io's sulfur concrete and the vault.
- **Source:** real: cryobot studies (Philberth; VALKYRIE; JPL's PRIME and SESAME), Europa's salt (Trumbo, Brown and Hand, 2019).
- **As built** (B8, `startup_scripts/grindless/luv/europa.js`):
  - 5 × 5 × 16: the ice shaft (rows 1–5, packed or blue ice), a sulfur concrete base around a 3 × 3 vault core with the tether opening, a tungsten steel frame derrick and a vault head with a tungstensteel gearbox drum. Base: 1–2 energy hatches, buses and 1–2 output hatches.
  - GTM's overclock, no parallel: one probe, one sample. The family type is widened (never narrowed) to 3 item inputs and 2 fluid outputs.
  - The RTG pellet is a 0.56 % chanced input (400 t of the hour's 72,000).
  - The brine's surplus: a centrifuge splits 1,000 mB into 1,000 mB water, 6 magnesium sulfate (`gtceu:magnesium_sulfate`, new) and 2 salt dust; GTM's generated electrolysis splits both.
  - Controller: shaped, LuV hull + 2 LuV pumps + LuV sensor + 4 LuV circuits + a tungstensteel gearbox (the drum), so it never matches the zero-g grower's grid. Probe: assembler, melt head + RTG pellet + LuV sensor + 8 optical fibres (the tether) + 4 HSS-S plates, 7,680 EU/t × 600 t. Melt head: 4 tungsten carbide + 2 HSS-S plates + an IV pump, 7,680 EU/t × 400 t.

### 18. Algae bioreactor: `gtceu:algae_bioreactor`, type `gtceu:bioreactor` (greenhouse step 5; the culture only on Europa)

- **What it gains:** living matter.
- **Recipes:**
  1. **Algae** (circuit 1, anywhere): 1,000 mB water + 500 mB CO₂ → 250 mB biomass + 400 mB O₂, 480 EU/t × 400 t *(tune)*, under LED lamps with no sky. It is the air and the biomass of the bases where no crop grows. Real: Chlorella and Spirulina photobioreactors, ESA's MELiSSA loop.
  2. **Europan culture** (circuit 2, only on Europa): 1,000 mB Europan brine + 250 mB H₂O₂ + 500 mB hydrogen + 1 `grindless:chondritic_extract` + the Europan ocean sample (not consumed) → 1,000 mB `gtceu:bacteria` + 100 mB biomass, 1,920 EU/t × 600 t *(tune)*.
     - The culture is chemosynthetic. It lives on hydrogen and on oxidants, the leading hypothesis for life in Europa's ocean (Hand and Chyba, 2007; Vance, 2016).
     - The oxidant comes from GTM's own `chemical_reactor/hydrogen_peroxide` (2,000 mB H₂ + 2,000 mB O₂ → 1,000 mB, 240 EU/t × 3,000 t).
     - The nitrogen and phosphorus come from the belt's optical miner: Europa's ocean is thought to be short of both, and carbonaceous-chondrite extracts feed microbes (Mautner, 2002).
     - The cut GTM recipe, `brewery/bacteria`, made 1,000 mB from 4 bio chaff and 1,000 mB distilled water at 480 EU/t × 300 t, in a sterile cleanroom. The cut lands with this package (B8), after the biofoundry and spike S0-4.
- **Byproducts:**
  - The machine refuses voiding (`G.noVoiding` in both places): the bacteria are the pack's only living matter.
  - The bacteria go home, to the biofoundry, through the Europa pair or ender tanks.
  - O₂ goes to the bases' oxygen spreaders.
  - The biomass goes to the sludge.
- **Structure:**
  - three 1×1×10 photobioreactor tubes of laminated glass, with GT lamps between them;
  - a 5×5×3 sealed base of sulfur concrete;
  - vault casing on the roof.
- **Controller:** LuV hull + 2 LuV pumps + 4 LuV circuits *(tune)*.
- **Crossings:**
  - the greenhouse family from the Steam Age (EV's dome gave the LED idea);
  - GTM's peroxide chemistry;
  - LuV's cryobot, optical miner (belt), biofoundry and sulfur concrete.
- **Source:** real: ESA's MELiSSA; Europan habitability (Hand and Chyba, 2007; Vance and others, 2016).
- **As built** (B8): 5 × 5 × 13, the three tubes with lamps between them on a sulfur concrete hall under a vault roof; GTM's overclock; ids `grindless:bioreactor/luv/algae` and `…/europan_culture`. `gtceu:brewery/bacteria` is removed in the same script. The culture takes B5's chondritic extract, so B8 merges after B5.

### 19. Gravitational-wave detector: `gtceu:gravitational_wave_detector`, type `gtceu:gravitational_wave_astronomy` (observatory step 6; Ganymede)

- **What it gains:** the pack hears space-time for the first time, the observatory's step 6. Ganymede suits it:
  - **Quiet:** no plate tectonics. KAGRA is buried in the Kamioka mine to escape seismic noise.
  - **Cold:** 110 K, so the cryostats of its sapphire mirrors work less.
  - **Shielded** by its own magnetosphere.
  - **Covered** by deep ice to bury the arms.
- **Recipes:**
  1. **Catalogue** (circuit 1; the orb is mandatory-kept, `G.noVoiding` in both places): 1 data orb + 100 mB Liquid Helium (the cryostats' make-up), 30,720 EU/t × 12,000 t *(tune: an observing run)* → 1 `grindless:gravitational_wave_catalogue`.
     - The orb holds a black hole merger heard as a chirp from 35 to 250 Hz, as GW150914 was in 2015.
  2. **Copy** (crafting): catalogue + data orb → 2 catalogues, like the outer-system chart.
- **Use:**
  - In LuV, a gate item and the quest that closes the chapter.
  - Stored for the observatory's step 7 (the telescope that photographs Sagittarius A*) and for the MAX project's wave (`journey.md`).
- **Structure:** an L, about 33 × 5 × 33:
  - two 3×3×29 arms of clean stainless steel casing (the vacuum tubes);
  - a 5×5×5 vertex station of frostproof casing with the controller, the laser and the beam splitter;
  - a 3×3×3 end station on each arm.
  - Four `grindless:sapphire_test_mass` blocks are part of the pattern: two at the vertex, one at each end.
  - The pattern wants ice over the arms (buried) *(tune)*.
- **Controller:** LuV hull + 2 LuV emitters (the lasers) + 2 LuV sensors (the photodetectors) + 4 LuV circuits *(tune)*.
- **Crossings:**
  - EV: the Moon's helium, through the refrigerator;
  - IV: the interferometer (the family) and the Sagittarius A* signal's story;
  - LuV: the zero-g grower's test masses.
- **Risks:** the whole L must stay loaded while it runs.
- **Source:** real: LIGO and GW150914 (2015), Virgo, KAGRA (underground, sapphire mirrors at 20 K).
- **As built (B9):** 33 × 5 × 33: two hollow 3×3 tubes 25 long and a 3×3×3 end station on each arm, one layer of packed or blue ice over every tube and end station, hatches only on the vertex. The catalogue run also keeps the Sagittarius A* signal (`notConsumable`), the IV crossing above. Spike S0-7's buried L: `gg_test_luv_ganymede`.

### 20. Coilgun probe launcher: `gtceu:coilgun_launcher`, type `gtceu:probe_launch` (Ganymede)

- **What it gains:** probes launched with no rocket.
  - Ganymede has no air, and its escape velocity is 2.74 km/s.
  - At 110 K, GTM's HV superconductor (mercury barium calcium cuprate, `gtceu:mercury_barium_calcium_cuprate`) works with no cryostat. Hg-1223 superconducts below about 133 K, the record at ambient pressure, so the coils are passive.
  - An HV material does a LuV job because of the place's cold.
- **Recipes** (only on Ganymede; the outputs are mandatory-kept, `G.noVoiding` in both places):
  1. **Jupiter entry probe** (circuit 1): 1 `grindless:jupiter_entry_probe` → 1 `grindless:jovian_atmosphere_survey`, 30,720 EU/t × 400 t *(tune)*.
     - The probe is made in the assembler from 4 heat-shielding fabrics (`gcyr:heat_shielding_fabric`), a LuV sensor (the mass spectrometer), a battery and titanium plates *(tune)*.
     - The survey is a data orb: hydrogen, helium and the ³He/⁴He ratio, which Galileo's probe measured in 1995.
     - It is the sample that ZPM's gas giant siphon needs (drill step 8): nobody mines a gas giant by hand.
  2. **Saturn flyby probe** (circuit 2): 1 `grindless:saturn_flyby_probe` → after a long flight, 1 `grindless:saturn_transfer_chart`, 30,720 EU/t × 12,000 t *(tune)*.
     - The probe carries 2 RTG pellets, a LuV sensor and a LuV emitter (the radio) *(tune)*.
     - It flies a Jupiter gravity assist, like Pioneer 11, the Voyagers and Cassini.
     - The chart is the ZPM trip.
- **Structure:**
  - a horizontal 3×3×33 barrel of `grindless:coilgun_coil_casing`, wound by the HTS magnet works (circuit 3: 16 Hg-1223 single wires + an HSS-S frame + 72 mB epoxy → 2 *(tune)*);
  - a 5×5×4 breech with the controller and the loading bus;
  - a 3×3×3 pulse bank of tungstensteel casing.
- **Controller:** LuV hull + LuV field generator + 2 LuV emitters + 4 LuV circuits *(tune)*.
- **Crossings:**
  - HV: Hg-1223, three eras back;
  - IV: RTG pellets and the outer-system chart's family;
  - LuV: the magnet works;
  - ZPM: the survey and the chart.
- **Source:** real: O'Neill's mass drivers (1970s), Galileo's entry probe (1995), gravity assists, and Hg-1223 (Schilling and others, 1993).
- **As built (B9):** 37 × 5 × 8: 33 rings of eight coil casings (264) around an open bore, a 5×5×4 tungstensteel breech with the controller on its rear face, a 3×3×3 tungstensteel pulse bank beside it. Probes in the LuV assembler (30,720 EU/t × 200 t): Jupiter entry = 4 heat-shielding fabrics + LuV sensor + HV lithium battery + 4 titanium plates; Saturn flyby = 2 RTG pellets + LuV sensor + LuV emitter + 4 titanium plates. The Saturn chart copies with a data orb, like every chart.

## Older machines, new modes (not counted)

### Naquadah plant, mode 2: the exact balance

`lib/compose.js` composes the mode at every load from GT--'s live recipes, pinned by id, as mode 1 is. A pinned recipe that comes back empty (no inputs and no outputs) stops the mode with an error. GT-- empties four GTM placeholders (`NaquadahLine#remove`), and all are rejected:
- `gtceu:centrifuge/impure_enriched_naquadah_solution_separation`;
- `gtceu:centrifuge/acidic_enriched_naquadah_separation`;
- `gtceu:centrifuge/acidic_naquadria_solution_separation`;
- `gtceu:centrifuge/impure_naquadria_solution_separation`.

They are 5 EU/t × 100 t with nothing in and nothing out.

**Pinned recipes** (from the dump; amounts as the recipe states them):

| Key | Recipe id | EU/t × t | In → out |
|---|---|---|---|
| A | `gtceu:large_chemical_reactor/enriched_naquadah_oxide_mixture` | 1,920 × 200 | 2 enriched naquadah oxide mixture + 3,000 mB HSbF₆ → 2,000 mB impure enriched naquadah solution + 2 Sb₂O₃ + 7 TiF₃ |
| B | `gtceu:large_chemical_reactor/hexafluoride_enriched_naquadah_solution` | 7,680 × 400 | 1,000 mB impure solution + 6,000 mB fluorine → 1,000 mB hexafluoride solution |
| C | `gtceu:large_chemical_reactor/xenon_hexafluoro_enriched_naquadate` (cleanroom) | 480 × 200 | 1,000 mB hexafluoride + 1,000 mB xenon → 1,000 mB xenon hexafluoro enriched naquadate (XeHFN) |
| D | `gtceu:chemical_plant/enriched_naquadah_residue_solution` | 30,720 × 1,200 | 1,000 mB XeHFN + 1,000 mB HSbF₆ + 9,000 mB H₂ + 1 Pd/C + 4 AuF₃ → 1,000 mB enriched solution + 1,000 mB residue + 8,000 mB HF |
| E | `gtceu:mixer/enriched_naquadah_solution_separation` | 480 × 100 | 1,000 mB enriched solution + 2,000 mB H₂SO₄ → 3,000 mB acidic solution |
| F | `gtceu:neutron_activator/enriched_naquadah` (window 460–480 MeV) | 120 t; upkeep 240 EU/t (IV-B3) | 16,000 mB acidic → 1,000 mB impure naquadria solution + 15 enriched naquadah sulfate |
| H | `gtceu:dehydrator/xenoauric_fluoroantimonic_acid` | 1,920 × 240 | 2,000 mB residue → 1,000 mB xenoauric acid + 1 trinium sulfide |
| I | `gtceu:electrolyzer/xenoauric_fluoroantimonic_acid` | 7,680 × 1,200 | 1,000 mB xenoauric acid → 1,000 mB xenon + 3,000 mB HF + 1 gold + 1 SbF₃ |
| R1 | `gtceu:large_chemical_reactor/fluoroantimonic_acid` | 480 × 300 | 4,000 mB HF + 4 SbF₃ → 1,000 mB HSbF₆ + 2,000 mB H₂ |
| R2 | `gtceu:large_chemical_reactor/antimony_trifluoride` | 30 × 60 | 6,000 mB HF + 5 Sb₂O₃ → 8 SbF₃ + 3,000 mB water |
| R3a | `gtceu:electrolyzer/gold_chloride` | 120 × 360 | 6,000 mB chlorine + 2 gold → 1,000 mB gold chloride |
| R3b | `gtceu:large_chemical_reactor/bromine_trifluoride` | 30 × 120 | 1,000 mB bromine + 3,000 mB fluorine → 1,000 mB BrF₃ |
| R3c | `gtceu:large_chemical_reactor/gold_chloride` | 120 × 200 | 1,000 mB gold chloride + 2,000 mB BrF₃ → 8 AuF₃ + 2,000 mB bromine + 6,000 mB chlorine |
| R4 | `gtceu:mixer/palladium_on_carbon` | 480 × 160 | 1 palladium + 1 carbon → 1 Pd/C |
| T | `gtceu:electric_blast_furnace/titanium_trifluoride_separation` (1,941 K) | 480 × 900 | 4 TiF₃ + 3,000 mB H₂ → 1 hot titanium + 3,000 mB HF |
| S | `gtceu:large_chemical_reactor/naquadah_separation` (circuit 3 only) | 30,720 × 600 | 6 naquadah + 1,000 mB HSbF₆ → 2,000 mB impure enriched solution + 2,000 mB impure naquadria solution + 4 TiF₃ |
| G | `gtceu:electric_blast_furnace/enriched_naquadah_sulfate_separation` (7,000 K; outside the plant) | 7,680 × 500 | 6 sulfate + 2,000 mB H₂ → 1 hot enriched naquadah ingot + 1,000 mB H₂SO₄ |
| J | `gtceu:electric_blast_furnace/trinium_sulfide_separation` (7,200 K; outside) | 30,720 × 750 | 2 trinium sulfide + 1 zinc → 1 hot trinium ingot + 2 ZnS |
| K | `gtceu:vacuum_freezer/cool_hot_trinium_ingot` (outside) | 7,680 × 300 | + 500 mB Liquid Helium → trinium ingot + 250 mB helium |
| L | `gtceu:vacuum_freezer/cool_hot_enriched_naquadah_ingot` (outside) | 1,920 × 150 | + 500 mB Liquid Helium → ingot + 250 mB helium |

**Per chemical-plant batch** (1,000 mB of XeHFN through D, which takes ½ A, B, C, D, E, 3⁄16 F, ½ H, ½ I, 2½ R1, ½ R3c with its R3a and R3b, and ⅞ T):

| | GT-- as it runs (its own regeneration) | Mode 2 with full recovery |
|---|---|---|
| Enriched naquadah oxide mixture | 1 | 1 |
| Fluorine | 9,000 mB (B 6,000 + AuF₃ through BrF₃ 3,000) | 9,000 mB |
| Hydrogen, net | 6,625 mB (D 9,000 + T 2,625 − R1 5,000) | 6,625 mB |
| Sulfuric acid | 2,000 mB (E; G returns 469 mB outside) | 2,000 mB |
| HF, net | 5,000 mB consumed (R1 10,000 and R2 7,125 against D 8,000, I 1,500 and T 2,625) | **2,125 mB produced** (no R2: antimony comes back) |
| Xenon | 500 mB lost (1,000 in, 500 back from I) | 0: a 1,000 mB charge |
| Gold | 0.5 lost (4 AuF₃ from 1 Au; 0.5 back) | 0: a 4 AuF₃ charge |
| Antimony | 4.94 Sb₂O₃ lost (10 SbF₃ needed; 0.5 back from I and 1.6 from A's Sb₂O₃) | 0: a 2,500 mB HSbF₆ charge |
| Pd/C | 1 lost (1 Pd + 1 C) | 0: a catalyst, 1 % wear *(tune)* |
| Pu-Be source | 0.19 % | 0.19 % |
| Out | 2.8125 sulfate, 0.5 TS, 187.5 mB impure naquadria, 0.875 Ti | the same, + 2,125 mB HF |
| EU | 45.97 M | **45.89 M** |

- **Why the recovery is honest:**
  - D reduces the xenon compound with 9,000 mB of hydrogen, and xenon is inert, so it leaves as gas.
  - AuF₃ is made again from the gold with fluorine (paid: 3,000 mB a batch).
  - The antimony stays as SbF₅/HSbF₆.
  - So only fluorine, hydrogen and the oxide are used up. The fluorine comes from the fluorspar kiln, and the surplus HF goes to mode 1, which takes 40,500 mB a run.
- **One mode-2 run** (circuit 2; 4 batches, so one trinium's worth):
  - **In:** 4 enriched naquadah oxide mixture + 36,000 mB fluorine + 26,500 mB hydrogen + 8,000 mB sulfuric acid + the Pu-Be source (0.75 %).
  - **Charges, not consumed:** 1,000 mB xenon, 2,500 mB HSbF₆, 4 AuF₃ and 1 Pd/C (4 % wear a run *(tune)*).
  - **Out:** 11 enriched naquadah sulfate + 1 at 25 %; 2 trinium sulfide; 750 mB impure naquadria solution (contained); 3 titanium ingots + 1 at 50 %; 8,500 mB HF.
  - **EU:** 183.6 M, that is 30,720 EU/t × 5,976 t.
  - **Policy:** it refuses voiding (`G.noVoiding` in both places).
- **Per trinium ingot,** with G, J, K and L outside: 216.6 M EU. Alongside it come 1.875 enriched naquadah ingots (about 1.9 G EU in reactor III), 750 mB of naquadria, 3.5 titanium and 8.5 B of HF.
- **Per Mk1** (43 HTS coils, so 43 trinium):
  - 172 batches, 43 runs;
  - ×4 parallel on two LuV hatches (122,880 EU/t): 10.75 runs × 5,976 t = 64,242 t, **about 54 minutes**;
  - J needs 43 × 750 t in a 7,200 K EBF (about 27 minutes, alongside).
  - As GT-- runs it, the same 43 trinium would lose 86,000 mB of xenon, 86 gold, 850 Sb₂O₃ and 172 Pd. With GTM's coil (1,032 trinium), that is 2.06 M mB of xenon.
- **Circuit 3, spent fuel** (reactor III's long naquadah rods, macerated):
  - **In:** 6 naquadah dust + 18,000 mB fluorine + about 15,000 mB H₂ + 4,000 mB H₂SO₄, through S and then B to I (2 batches).
  - **Out:** 5 enriched naquadah sulfate + 1 at 62.5 %; 1 trinium sulfide; 2,375 mB impure naquadria solution; 1 titanium ingot; about 10,000 mB HF.
  - **EU:** about 109 M *(composed when built)*.
  - **What it means:** six rods that gave 6 G EU come back as 0.94 enriched ingot. The fuel cycle returns about 16 %, so reactor III is never a perpetual engine (rule 8).
- **As built (A2, spike S0-11 static):** `tables/naquadah_plant.json` (circuits 2 and 3), `iv/naquadah_plant.js`, `lib/compose.js` (`recovered` keys and `tagItems`), checked by `tools/analysis/test/naquadah-mode2.test.mjs` on the pinned recipes (`tools/analysis/fixtures/gtnn-1.3.10-naquadah-line.json`; jar and dump agree).
  - **Circuit 2** composes to exactly the run above: 4 oxide + 36,000 mB F₂ + 26,500 mB H₂ + 8,000 mB H₂SO₄ + Pu-Be at 75 of 10,000 → 11 sulfate + 1 at 25 %, 2 trinium sulfide, 3 Ti + 1 at 50 %, 750 mB impure naquadria, 8,500 mB HF. Held: 1,000 mB xenon, 2,500 mB HSbF₆, 4 AuF₃, 1 Pd/C at 400 of 10,000. **30,717 EU/t × 5,984 t = 183.8 M EU**: 0.2 M over the figure above, the vacuum freezer that cools the batch's 0.875 hot titanium (mode 1 counts it too).
  - **Circuit 3** (6 naquadah dust; one spent long rod macerates to one dust, `gtceu:macerator/macerate_long_naquadah_rod`): + 18,000 mB F₂ + 15,000 mB H₂ + 4,000 mB H₂SO₄ + Pu-Be at 38 → 5 sulfate + 1 at 62.5 %, 1 trinium sulfide, 1 Ti, 2,375 mB naquadria, 10,000 mB HF. Pd/C at 200. **30,716 EU/t × 3,558 t = 109.3 M EU.**
  - Recovered per circuit-2 run (what GT-- as it runs would lose): 2,000 mB xenon, 2 gold, 38 SbF₃ against 4 Sb₂O₃ given, 4 Pd/C.

### Platinum plant, mode 4: asteroid platinum metals, absolute

- **Circuit 4:**
  - **In:** 22 asteroid PGM concentrate + 18,750 mB HCl + 10,500 mB H₂ + 1,500 mB salt water + 15 saltpeter + 5 calcium + the platinum electrode (0.1 %).
  - **Out:** 1 platinum group sludge dust + 3 iridium dust + 3 osmium dust + 2 metal sludge dust + 18 CaCl₂ + 7,050 mB water + 1,500 mB steam.
  - **EU:** 1,919 EU/t × 1,605 t *(composed when built: mode 3's live chemistry ×1.5 for the Ir and Os, plus mode 1's attack for the sludge)*.
  - **Policy:** it refuses voiding.
- **The plant's existing circuit-2 recipes split the sludge:** `grindless:pgm_refining/ev/platinum` → 6 Pt + 3 Au + 3 SiO₂ + 6 platinum slag + palladium-rich ammonia; `…/palladium` → 4.2 Pd; `…/rhodium_ruthenium` (6 slag) → 1.35 Rh + 4.49 Ru.
- **The sum per 22 concentrate:** Pt 6 + Pd 4.20 + Ru 4.49 + Rh 1.35 + Ir 3 + Os 3 = **22.04 units**. One concentrate is one unit of platinum metal, so the balance closes.
  - The split is 27 / 19 / 20 / 6 / 14 / 14 %, against the CI chondrites' 30 / 17 / 21 / 4 / 14 / 15 %.
- **Yield:** 22 concentrate ← 352 crushed meteoric iron, about 16 harpoon-drill runs.
- **As built (A2):** the list above (mode 3 ×1.5) cannot give 3 Ir + 3 Os, so the mode is composed: our opening stage (`tables/asteroid_pgm.json`: 22 concentrate + 15 saltpeter + 1,500 mB salt water → 1 sludge + 6 rarest metal mixture + 2,700 mB OsO₄ + 1,500 mB steam; 138,720 EU, 1.5 × the Mercury fusion's plus one sludge through mode 1's attack), then mode 3's live GT-- chain. `grindless:pgm_refining/luv/asteroid`, checked by `tools/analysis/test/platinum-asteroid.test.mjs`:
  - **In:** 22 concentrate + 15 saltpeter + 3 calcium + 1,500 mB salt water + 10,500 mB HCl + 21,000 mB H₂ + the electrode (0.1 %).
  - **Out:** 1 platinum group sludge + 3 Ir + 3 Os + 3 platinum sludge residue + 3 metal sludge + 12 CaCl₂ + 8,700 mB water + 1,500 mB steam.
  - **EU:** 1,920 EU/t × 1,106 t (2.12 M EU). It refuses voiding (`grindless_pgm_keep`); modes 1–3 stay voidable.
  - The sum per 22 concentrate stays 22.04 units. Until B5 removes A1's EMI hiding of the concentrate, EMI drops this recipe with it.

### Cryogenic fuel tank

`grindless:cryogenic_fuel_tank` (final; B1, `startup_scripts/grindless/luv/travel.js`):
- the KubeJS block type `gcyr:fuel_tank`, with `.tier(5)` and `.fuelStorage(16000)`, the builder S0-2 launched natively;
- LuV assembler, 30,720 EU/t × 400 t: GCYR's elite fuel tank + 6 HSS-S plates + 8 Kapton K plates + a LuV pump, with the Outer System Chart as a catalyst (`grindless:assembler/cryogenic_fuel_tank`).
- Its model is a vertical column (`models/block/luv/cryogenic_fuel_tank.json`, textures from `tools/assets/Build-LuVTravelTextures.ps1`), as rocket tanks stand.

## Family steps

- **Vein drill, step 7:** the harpoon anchor drill (belt) and the cryobot (Europa).
- **Greenhouse, step 4:** the rotating hydroponic ring, a molecular farm.
- **Greenhouse, step 5:** the algae bioreactor (the Europan culture).
- **Observatory, step 6:** the gravitational-wave detector. The coilgun's probes write the next chart.
- **Power on site:** the orbital solar station, the volcanic intake and the tether, all into the wireless network. RTG cells are the first-landing kit's fallback.
- **Platinum plant:** mode 4. **Naquadah plant:** mode 2 (circuits 2 and 3).

## Reserve, and what was dropped

### Reserve

- **Ganymede cryoplant:** Liquid Helium made cheaper in Ganymede's 110 K. It is a discount, not a route, so it stays in reserve.
- **The sulfur–iodine plant** is not in reserve: it is slot 16's written fallback (16b).

### Considered and dropped

- **The rectenna and its beam ledger:** the wireless network carries power to every base (decision 10).
- **The radiolysis harvester:** replaced by the optical miner.
- **The orbital assembly bay:** in-space assembly of big structures. GCYR's rocket has no size limit, so it would be an artificial gate.
- **A third station** (belt orbit): stations are the riskiest piece (decision 14).
- **Asteroid trinium:** it would bypass GTM's naquadah line. Mode 2's recovery fixes the wall instead.
- **Tritium-producing absorber rods in the fission reactor:** real, but tritium bred for D + T loses energy.
- **The mass driver:** AE2 already moves the mass.
- **The gas giant siphon and the dilution-fridge qubit fab:** ZPM.
- **GCYR's satellites:** not implemented in GCYR 0.2.9.

## Power on the wireless network

- **How it flows:**
  - Generators put their EU into the global network: multiblocks through wireless dynamo hatches, single blocks (reactor III, RTG cells) through wireless dynamo covers. The network takes 5 % on entry.
  - Every base draws through wireless energy hatches and covers, in any dimension.
  - The output tier is the lowest cell tier among the formed towers.
  - EU P2P over AE2 stays as the alternative (a 2.5 % toll).
- **The LuV tier** (package A4, with the wireless package's own mechanism):
  - LuV wireless energy and dynamo hatches at 2, 4, 16 and 64 A (`gtceu:luv_wireless_energy_hatch` and `gtceu:luv_wireless_dynamo_hatch`, with `_4a`, `_16a` and `_64a`) and LuV covers (`grindless:luv_wireless_energy_cover` and `grindless:luv_wireless_dynamo_cover`);
  - the LuV cell, `grindless:luv_smes_cell`, a superconducting magnetic-energy-storage coil from the HTS magnet works. It is the LuV row of `tables/wireless_energy.json`, and its capacity follows the table's rule: six LuV vanadium batteries (`gtceu:luv_vanadium_battery`, 163,840,000 EU each), so 983,040,000 EU.
  - **The jump:** the network outputs LuV only when every formed tower holds LuV cells.
  - **Before the jump:** a multiblock with two IV wireless energy hatches reaches LuV voltage (two-hatch rule; spike S0-10 checks that wireless hatches count).
    - *Static answer (A4, GTM 7.5.3 source):* they count. A wireless energy hatch is GTM's own `EnergyHatchPartMachine` with `INPUT_ENERGY`, so its container joins the controller's `EnergyContainerList`, and `WorkableElectricMultiblockMachine#getMaxVoltage` gives one tier more when `getNumHighestInputContainers() > 1`. The bench's `TWO_HATCH` check runs the HTS coil (30,720 EU/t) on two IV wireless hatches and refuses it on one.
    - *Does an orbital generator feed a wireless dynamo hatch?* Statically yes: the settlement reads every tracked block through `server.getLevel(dimension)` and `isLoaded`, with no dimension rule (the Moon is natively proven), and `gcyr:overworld_orbit` is an ordinary datapack level (`gcyr:space`, Y 0–255). The station's chunks must stay loaded (FTB Chunks) for its generators to run unattended. The bench's `ORBIT` check runs the generator array there.
  - **The LuV cell's recipe** is the magnet works' (circuit 2), not the assembler's: the table's LuV row says `cellMadeBy: gtceu:hts_magnet_works`, and the wireless script skips the assembler cell recipe for it.
  - The gate's assembly-line recipes at 100,000–122,880 EU/t need two LuV hatches, so the jump is a gate step.
  - **ZPM's jump:** the ZPM cells are ZPM's first recipe after the gate. They need the ZPM parts the gate proves.

| Source | Where | EU/t | Into the bank (−5 %) | Fuel and wear | Doubled by `generators.js`? |
|---|---|---|---|---|---|
| Fission reactor (IV) | Earth | 131,072 per full heavy-water reactor | 124,518 | LEU or MOX assemblies | no (it is ours) |
| Naquadah reactor III (GT--) | Earth | 32,768 each | 31,130 | a long enriched naquadah rod per 30,516 t; the spent rod → mode 2, circuit 3 | yes |
| Orbital solar station | Earth orbit | 630 a lit panel; 40,320 for 64 | 38,304 | the panels | no |
| Volcanic intake | Io | up to 131,072 | 124,518 | SO₂ charge; a bundle about every hour per module | no |
| Flux-tube tether | Io orbit | up to 131,072 | 124,518 | a spool about every hour; 50 mB argon a run | no |
| Mk1 calcium plasma (GTCA) → GTM's plasma turbine | Earth | about 78,800 net per Mk1 (one fusion overclock; *the bench confirms*) | about 74,900 | 256 mB Mg + 256 mB O₂ every 128 t | yes |
| Mk1 D + T | Earth | about 1,640 on average per full reactor's tritium | — | tritium | yes |
| RTG cell (IV) | anywhere | 2,048 | 1,946 | a pellet an hour | no |

- **The calcium plasma, from the dump** (decision 19: the net figure is checked on the bench in B10):
  - A run is 7,680 EU/t × 128 t (983,040 EU) for 16 mB of plasma.
  - `gtceu:plasma_generator/calcium_plasma` gives 2,048 EU/t × 184 t per mB, already doubled: 6.03 M EU.
  - Net, 5.05 M EU a run, paid in magnesium. It is LuV's only fusion power that is not tied to tritium.
  - **B10, from GTM 7.5.3's code:** the Mk1 caps its voltage at LuV (`FusionReactorMachine#getMaxVoltage`), and its overclock doubles the EU/t and halves the time (`FUSION_OC`). The recipe is IV, so it gets one overclock: 15,360 EU/t × 64 t, the same 983,040 EU a run. Back to back, that is about **78,800 EU/t net per Mk1**, twice the first estimate of 39,400, which left the overclock out. Nd + H → Eu is a LuV recipe and gets none. The bench fixture `gg_test_luv_fusion` measures the real run.
- **The gate's 524,288 EU/t out of the bank needs at least 551,882 in.** For example:

  | Source | EU/t |
  |---|---|
  | 2 fission reactors | 262,144 |
  | 6 reactor III | 196,608 |
  | 2 arrays of 64 panels | 80,640 |
  | the Io intake | 131,072 |
  | **In** | **670,464** |
  | **Into the bank (−5 %)** | **636,941** |

  - The tether, if built, adds 124,518.
  - Six reactor III burn about 14 rods an hour, about 30 mode-2 batches: under 10 minutes of a ×4 plant an hour.
- **Rule 8:**
  - fuels and plasma stay doubled; the fuel-free sources are not;
  - the network's 5 % applies to all;
  - every fuel-free source pays with its trip, its build and its wear parts.

## Fusion, and what is not fusion

- **The Mk1 is GTM's** (`gtceu:luv_fusion_reactor`), and in LuV it is a materials machine first.
  - **Kept recipes:** Nd + H → Eu (the ZPM motor needs 12 europium ingots, at about 14.2 M EU an ingot), D + T, La + Si → Lu, H + V → Cr, and GTCA's calcium plasma (*Power*).
  - **Cut or moved:** see *Only from there, and the cuts*.
- **What one ring costs:**
  - 15 LuV energy hatches, since Nd + H needs 150 M EU to start and a Mk1 holds 10 M per hatch;
  - 78 fusion casings, that is 39 crafts, each with a superconducting coil, a neutron reflector and a LuV pump;
  - 4 coil blocks;
  - 31 glass, with about 62 more reflectors.
  - With the magnet works' HTS coils, the 43 coils take **43 trinium ingots**, about 54 minutes of one ×4 naquadah plant.
- **In game:** package B10 forms and runs it, and measures the calcium plasma's net power.
- **D + T is small:** tritium comes only from the Moon's removal facility, 720 mB an hour per full reactor, about 1,640 EU/t on average. Bulk deuterium and helium-3 come with Saturn (ZPM).
- **GT--'s naquadah reactor III** (`gtnn:luv_naquadah_reactor`, 32,768 EU/t, a long enriched naquadah rod per 30,516 t) is LuV's fuel-burning nuclear power. Its spent rod goes to mode 2's circuit 3. The large naquadah reactor is ZPM.

## Nothing one at a time

- **LuV parallel hatch (×16):** GTM's recipe as it is (`gtceu:shaped/parallel_hatch_mk2`; its ZPM circuits are quantum mainframes, which run at 7,680 EU/t).
  - **Who takes it** (`lib/parallel_hatch.js`):
    - IV's plants, the naquadah and platinum plants included;
    - LuV's helium refrigerator, coated conductor line, magnet works, biofoundry, smelter, grower, wake shield facility, organoid lab, asteroid processor and fumarole condenser.
  - Every copy pays its EU/t, and the total is capped by the overclock voltage: two 2 A LuV hatches run four copies of a 30,720 EU/t recipe.
  - Multi-amp hatches lift that cap, as in GTM. GTM 7.5.3 folds V × A of all the energy hatches into the overclock voltage (`EnergyContainerList.calculateVoltageAmperage`, `WorkableElectricMultiblockMachine#getOverclockVoltage`), and that voltage caps both the parallels (`EURecipeCapability#getMaxParallelByInput`) and the overclocks. GTM's own 4 A and 16 A hatches do it too. Two 64 A LuV wireless hatches (2,097,152 V at 2 A) fit all 16 copies of the LuV hatch. The recipe-tier gate stays the hatch tier, plus one for two hatches (`getMaxVoltage`). S0-10's `MULTI_AMP` check reads it on the bench.
- **The assembly line from AE2** builds:
  - the Mk1's parts (15 LuV hatches, 39 LuV pumps, the field generators);
  - the ZPM motor and energy hatch;
  - the research station and the HPCA.
- **Research, explicit.** The chain in the dump:
  - **Computer casings:**
    - `gtceu:assembler/computer_casing`, 30,720 EU/t × 200 t: an iridium frame + 6 iridium plates + a LuV circuit + cobalt and copper fine wires + 2 vanadium-gallium wires;
    - the advanced computer casing, at the same EU/t, adds a ZPM circuit.
  - **Data bank:** `gtceu:assembly_line/data_bank`, 6,000 EU/t × 1,200 t: 4 optical pipes, 16 ITBTC double wires, 8 LuV circuits.
  - **HPCA components** (all with PCB coolant):
    - the empty, heat-sink and active-cooler components (7,680 EU/t);
    - the computation component (30,720 EU/t: 4 ZPM circuits + a LuV field generator).
    - The advanced computation and bridge components need UV circuits: beyond LuV.
  - **HPCA:** `gtceu:assembly_line/high_performance_computing_array`, 100,000 EU/t × 1,200 t: a data bank, 4 ZPM circuits, 8 LuV field generators, 64 URhNq₂ double wires, 16 optical pipes and 4,000 mB PCB coolant.
  - **Research station:** `gtceu:assembly_line/research_station`, 100,000 EU/t × 1,200 t: a data bank, 8 LuV sensors, 8 ZPM circuits, 2 LuV field generators, 2 ZPM motors, 32 URhNq₂ double wires, 32 trinium foils and 16 optical pipes.
  - **URhNq₂:** `gtceu:mixer/uranium_rhodium_dinaquadide`, 122,880 EU/t × 150 t: uranium + rhodium + 2 naquadah. GCYM's large mixer takes it on two LuV hatches (`Predicates.autoAbilities` allows two energy hatches, `Predicates.java:159–160`). The dust is not the end: the ingot needs a 9,000 K blast (an EBF with trinium coils), and the 122,880 EU/t double-wire assembler recipe runs on our Universal Assembly Factory on two LuV hatches (checked by the LuV integrated run's validator).
  - **The goal:** the data orb for `gtceu:assembly_line/energy_hatch_zpm`.
  - The 100,000 EU/t recipes need two LuV hatches. From the network, that means its LuV tier.
- **GCYM at LuV:** the large mixer (an osmiridium rotor), now essential for URhNq₂ dust (then a trinium-coil EBF and the Universal Assembly Factory). The mega blast furnace and the mega vacuum freezer stay ZPM.
- **Circuits in batches:**
  - NPUs from the organoid lab;
  - wetware processors from GT--'s line (32 a run, one LuV energy hatch on GT--'s circuit assembly line);
  - crystal chips from the grower, then GTM's engraver and circuit assembler.

## AE2 between planets: the LuV step

- **Four new pairs:** belt, Io, Europa and Ganymede (the seeds and pair tags are under *Bridges and first landings*).
  - Earth orbit is already Earth.
  - Io orbit uses Io's tag.
- **Power doesn't need them:** the wireless network carries it, and EU P2P stays as an option.
- **Capacity:** the next MEGA cells and Expanded AE's larger coprocessors.
- **The line from the network:** the assembly line's export buses draw from nine worlds and two stations.

## New process lines

| Line | Steps | By-products → destination |
|---|---|---|
| Asteroid metals | belt M-type → harpoon drill → asteroid processor (Mond, its CO from the optical miner) → Fe, Ni, Co + PGM concentrate → platinum plant mode 4 → Pt, Pd, Rh, Ru, Ir, Os | Fe, Ni, Co: network. CO: a charge. Tetrataenite: the magnet works' bearings |
| Living circuits | belt optical miner (extract) + Europa (cryobot brine and sample; GTM's H₂O₂) → algae bioreactor → bacteria → biofoundry (collagen → gelatin → agar → medium; mutagen; stem cells; seeds) → ring (neurotrophic factor; plant collagen) → organoid lab (organoid → NPU) → GT--'s line (wetware processors) | sludge → mutagen and crystal chips; diluted H₂SO₄ → acid; phosphorus → phosphoric acid |
| Trinium and naquadah power | Venus naquadah → mode 2 (charges; fluorine used up) → sulfate → enriched naquadah → reactor III → spent rods → mode 2, circuit 3; trinium sulfide → trinium → HTS coils (magnet works) → Mk1 | naquadria solution: contained, stored for ZPM. HF → mode 1. Ti → the titanium loop |
| Cryogenics and magnets | Moon helium + Liquid Nitrogen → helium refrigerator; nickel + Mars tungsten → tape → magnet works → HTS coils, SMES cells (the network's LuV tier), coilgun coils, bearings | nitrogen → the cryogenic plant |
| Power and the network | Venus wafers or Io germanium cells → panels → orbital solar station; Io's heat → intake; Jupiter's spin → tether; reactors; all into the wireless network (5 %) → every base | — |
| Io | fumaroles → SO₂, sulfur, sublimate → germanium, indium, sulfur concrete | SO₂ → the intake's charge and home sulfuric acid |
| Orbital industry | ZBLAN → optical pipes; foam → Whipple casing; naquadah alloy; crystal chips; sapphire; wafers | — |
| Research and charts | computer casings → data bank → HPCA and research station (URhNq₂, optical pipes) → ZPM data orbs; the GW catalogue; probes → the Jovian survey and the Saturn chart | — |

**Crossings with lines two or more eras back** (the target is at least 6):

| LuV machine | Older line | Era |
|---|---|---|
| Biofoundry | creature simulator (meat and bones) | LV |
| Fumarole condenser | acid plant (SO₂ → sulfuric acid) | LV |
| Rotating ring | engine test stand's CO₂, the greenhouse family | MV |
| Microgravity smelter | the End's zircon; Mars lanthanum | MV, EV |
| Wake shield facility | gallium and vanadium | MV |
| HTS magnet works, coilgun | Hg-1223 | HV |
| Helium refrigerator, magnet works, GW detector | the Moon's helium; the cryogenic plant's Liquid Nitrogen | EV |
| Coated conductor line | Mars tungsten; lunar titanium in ITBTC | EV |
| Asteroid processor | platinum plant (mode 4) | EV |
| Flux-tube tether | Mars argon | EV |
| Every Jovian machine | lunar titanium in the vault casing | EV |

## Quests

Chapter **"LuV — The Outer System"**: in English, about 40 small-reward quests that never block recipes.
- **It opens** with the interferometer's chart: the belt and Jupiter's four large moons.
- **It closes** with two things:
  - the gravitational-wave catalogue: the first black hole merger heard;
  - the Saturn transfer chart: the next trip, from orbit, without landing.
- No quest promises a machine that does not exist yet.

| Part | Quests |
|---|---|
| Home | *Osmiridium*, *Naquadah Coil*, *Full Recovery* (mode 2), *Trinium*, *Closed Loop* (refrigerator), *Tape*, *Winding* (an HTS coil), *The Network Goes LuV* (every tower on SMES cells), *Reactor III*, *Sixteen at Once* |
| Orbit | *Packed and Launched*, *First Station*, *Endless Day*, *Fibre from Nothing* (ZBLAN), *In the Wake*, *Perfect Crystal*, *Molecular Farm*, *Organoid* |
| Belt | *Level Four*, *Harpoon*, *Mond*, *Star Metal* (mode 4), *Sunlight on a Boulder* (optical miner) |
| Io | *Behind the Vault*, *Fumarole*, *Patera*, *Riding the Torus* (the tether) or *Iodine Loop* (the sulfur–iodine plant) |
| Europa | *Under the Ice*, *Something Alive*, *Biofoundry*, *Living Circuits* (a wetware processor) |
| Ganymede | *Quiet Moon*, *Chirp*, *Coilgun*, *Into the Clouds*, *Slingshot* |
| Exit | *Fusion*, *Europium*, *First Data Orb* (research station), *Gate to ZPM* |

**References:**
- the space and fusion quests of Star Technology (MIT) and Monifactory (LGPL), adapted with attribution;
- GTNH and GT Leisure: ideas only.

## Gate to ZPM

No passive waits (decision 12): every row is something built or run.

| What is built or run | What it tests |
|---|---|
| ZPM hull | trinium (mode 2) and naquadah alloy (the smelter or the 7,200 K EBF) |
| ZPM motor, made by the assembly line from the network | the Mk1's europium (96 fine wires), Mars samarium, osmiridium |
| HPCA and research station formed, with computation components | computer casings, the data bank, URhNq₂ (large mixer, trinium-coil EBF, Universal Assembly Factory, all on two LuV hatches), ZBLAN optical pipes, PCB coolant |
| The ZPM energy hatch's data orb, written by the research station; then the hatch, made by the assembly line on two LuV hatches (122,880 EU/t) | research; UHPIC (the wake shield); ZPM voltage coils (a ZPM assembler, its parts from the line, on a transformer); NaK |
| Mk1 formed with HTS coils, one Nd + H → Eu run | the magnet works, trinium, 15 LuV hatches, the neutron reflectors |
| 4 wetware processors and 4 crystal processor assemblies on the network | the organoid lab (NPU), GT--'s line (one LuV energy hatch on GT--'s circuit assembly line), the grower |
| The network at LuV (every formed tower on LuV SMES cells) and a calibrated load: 524,288 EU/t for 60 s, through a 16 A LuV wireless energy hatch (exactly 524,288 EU/t) into a GTM power substation (its display shows the input) | the power plan and the network-tier jump |
| One representative run at each site: Mond and optical mining (belt), fumarole separation and an intake run (Io), a tether run (Io orbit) or, in its place, a sulfur–iodine run (Io), a Europan culture (Europa), the catalogue and a probe (Ganymede), one recipe each of the smelter, wake shield, grower, ring and organoid lab (orbit) | the bases work |
| Stored: helium-3 (the Moon, since HV), deuterium, tritium, impure naquadria solution | ZPM's fusion as infrastructure |
| LuV parallel hatch in one of our plants | mass production |
| Saturn transfer chart, Jovian atmosphere survey, GW catalogue | the next trip |

The ten-minute run of every base, untouched, lives only in the bench's integration test (C3).

**It unlocks ZPM:**
- ZPM hulls, hatches and components;
- the ZPM assembler and mixer;
- GTM's sterile cleanroom, for the rest of wetware;
- the Mk2, and duranium with it;
- GT--'s reactor IV and the large naquadah reactor;
- **the network's ZPM cells** (the next tier jump, ZPM's first recipe);
- the trip to Saturn's orbit.

## Validator (`-Tier luv`)

- **Asteroid metals and the chondritic extract only from the belt.** Iridium and osmium only off Earth: Mercury or the belt.
- **Living matter only from Europa:** `gtceu:bacteria` comes only from the algae bioreactor's Europa recipe once B8 lands; everything downstream follows.
- **The NPU at LuV only from the organoid lab.** Wetware processors come from one LuV energy hatch on GT--'s circuit assembly line (its wetware recipe re-registered at 30,720 EU/t, the same energy). GTM's ZPM circuit assembler counts as ZPM, and our Universal Assembly Factory refuses GTM's NPU recipe unless one hatch reaches ZPM.
- **Germanium and sulfur concrete only from Io.** Europium only from the Mk1.
- **Trinium only from mode 2** (Venus naquadah, or spent rods).
- **The Mk1:** no osmium or uranium from fusion; duranium only from the Mk2 (a 200 M EU start).
- **No optical-pipe recycling.**
- **Three sub-stages:**
  1. home and Earth orbit;
  2. the belt;
  3. the Jovian system: Io, Io orbit, Europa and Ganymede.
  - Nothing on the way to a sub-stage asks for its materials.
  - The ring's bearings and the grower's olivine seed put those machines after the belt.
  - The organoid lab sits after Europa and the belt.
- **Nothing in LuV asks for ZPM:**
  - no naquadria beyond the impure solution;
  - no tritanium;
  - no sterile-cleanroom recipe except ours.
- **The gate is built** only with LuV and earlier things, including the research chain.
- **Model:**
  - our generator types are EU sources into the wireless network (`gtceu:orbital_solar`, `gtceu:volcanic_heat`, `gtceu:electrodynamic_tether`);
  - the network's tier is a synthetic step: LuV when the SMES cells exist.
- **As built (C1):** `tools/analysis/tiers/luv.json`, with seven substages (`luv`, `luv-orbit`, `luv-belt`, then `luv-io`, `luv-europa` and `luv-ganymede` as siblings, then `luv-io-orbit`; the way to the moons is crafted after the belt). Dimension ids come from `tables/orbits.json` and `tables/places.json`. Each package's targets warn until a dump carries it (`packages`), so the config holds the whole design before every package lands. Mode 2 on two IV hatches is in `tiers/iv.json`.

## Mods and integration

| Mod | Slug | Use in LuV |
|---|---|---|
| GCYR | `gcyr` | five datapack planets and ten dimensions; the station packager and package; photovoltaic cells; the KubeJS fuel tank for level 4; satellites hidden |
| GT-- | `gtnn` | naquadah reactor III; the live naquadah line (mode 2 composes it); the circuit assembly line (wetware processors from NPUs; its own recipe takes 1,440 mB of molten cerrobase 140, made by `grindless:fluid_heater/molten_cerrobase_140` from GTM's liquid cerrobase at the price of GTM's melting of an ingot) |
| GTCA | `gtca` | calcium plasma (Mk1 power); its germanium froth stays ZPM |
| Biomes O' Plenty | `biomesoplenty` | Io's blocks, by id |
| EU P2P Tunnel, MEGA Cells, Expanded AE | `eup2p`, `mega`, `expanded-ae` | the AE2 route and capacity |
| GTM Extended Features | `gtm-extended-features` | its configurable cleaning hatch stays hidden (no recipe) |
| Waystones, FTB Chunks, FTB Essentials | `waystones`, `ftb-chunks-forge`, `ftb-essentials` | travel and loaded bases |

No new mods. LuV builds on the pack's own wireless network (v0.7.x).

- **Startup:**
  - the twenty machines through the pattern helper, and their types (the sulfur–iodine plant instead of the tether if S0-3 fails);
  - materials `gtceu:meteoric_iron`, `gtceu:tetrataenite` and `gtceu:zblan`, and the fluid `gtceu:europan_brine`;
  - the shared blocks;
  - items: samples, probes, seeds, bags, spools, bundles, charts, the catalogue, the extract, the sublimate, the concentrate, tape, the factor and the organoid;
  - the LuV wireless tier (hatches, covers and `grindless:luv_smes_cell`);
  - the cryogenic tank;
  - the belt's world gen layer.
- **Server:**
  - composed recipes: mode 2 (circuits 2 and 3), mode 4, the biofoundry and the refrigerator's table;
  - `veins_belt.json`, the seeds and `sunlight.json`;
  - the cuts: bacteria (with B8), the Mk1 cuts (with B10) and the pipe's recycling (with B3);
  - dimension allowlists and `G.noVoiding` where kept.
- **Data:**
  - `data/grindless/gcyr/planets/*.json` (5);
  - `dimension/` (10), `dimension_type/` (4), `worldgen/noise_settings/` (4) and biomes;
  - sky renderers (4);
  - `tables/planets.json` (four pair tags);
  - `space/airless_weather.js`;
  - `hidden_until.json`.

## Risks and open questions

- **GCYR beyond the inner planets** (spikes S0-1 to S0-3): datapack planets and the Jupiter group, and level 4 with tier 5 KubeJS tanks, passed natively; the deployment of two stations (S0-3) is still open. GCYR's configured gravity is not applied (S0-1), so the pack claims no low gravity. GCYR's launch issues #91 and #122 still apply.
- **The wireless network's LuV tier** (S0-10): LuV is built on a package still in progress (LV to IV). Do wireless hatches count for the two-hatch rule, and does an orbital generator feed it? A4 answers both from GTM's source (yes, and yes with the chunks loaded; *Power on the wireless network*); the integrated run confirms them.
- **World generation:** the belt's floor and its new KubeJS layer (S0-6); Io's paterae and fumaroles, the cryobot's ice shaft and the GW detector's buried L (S0-7).
- **The composed mode 2** depends on GT--'s recipe ids staying put. The pins fail loudly (S0-11).
- **TPS:** ten new dimensions, four bases and two stations loaded. Watch it with spark (C3).
- **Design choices that change GTM's pacing:**
  - wetware at LuV (the organoid lab);
  - the grower's ×4 speed and certainty;
  - the HTS coil's 1/24 of GTM's trinium.
- **Unknowns:**
  - whether one suit piece keeps both thermal tags (S0-8);
  - GT--'s total EU per circuit-3 run;
  - the wireless package's scripts know five tiers, LV to IV; A4 extends them to LuV (the table drives the tiers).
- **Credits:** each package notes its sources in `CREDITS.md`: GCYR's `luna` noise (LGPL-3.0) for the belt, quests adapted from Star Technology (MIT) and Monifactory (LGPL), and each machine's real-world sources. GTNH and GT Leisure stay ideas only.

## Build order

LuV is built in packages after v0.7.x, as IV was. Test bands start at X 13568 and go in steps of 256; X 16384 belongs to the hologram projector, so LuV skips it.

**Spikes come first (S0):** disposable tests that run before any permanent id is registered. Their files stay in the bench overlay.
- **S0-1:** a datapack Jupiter with one moon: the menu, the worlds, the sky, the weather and the flight back (passed; it also showed that GCYR's gravity value is not applied).
- **S0-2:** a tier 5 KubeJS fuel tank in a real level 4 launch and return.
- **S0-3:** a station packed, launched and used in Earth orbit, then a second one in a moon's orbit.
- **S0-4:** GT--'s circuit assembly line refusing GTM's NPU recipe on LuV hatches.
- **S0-5:** every new recipe through the live lookup, and no recycling for the new items.
- **S0-6:** a world gen layer over tuff in one test dimension.
- **S0-7:** the patterns that need world blocks: fumaroles, magma, the ice shaft and the buried L.
- **S0-8:** both thermal tags on one suit piece.
- **S0-9:** a far half made on site, powered by a brought wireless cover.
- **S0-10:** the wireless network's LuV tier, and the two-hatch rule with wireless hatches.
- **S0-11:** mode 2's balance printed from the pinned recipes.
- S0-1, S0-2 and S0-3 run first, then S0-10, S0-4 and S0-11.

**Wave A, home:**
- **A1:** registrations only: materials, items, the shared blocks and the sunlight table. Each later package registers its own machines.
- **A2:** the naquadah plant's mode 2 and the platinum plant's mode 4, and the LuV parallel hatch.
- **A3:** the helium refrigerator and the coated conductor line.
- **A4:** the HTS magnet works and the network's LuV tier.
- **A5:** the biofoundry.

**Wave B, the sites:**
- **B1:** travel and stations: the level 4 tank, the places, the bridges and the first station.
- **B2:** the orbital solar station.
- **B3:** the microgravity smelter and the wake shield facility, with the pipe's recycling cut.
- **B4:** the zero-g crystal grower, the ring and the organoid lab.
- **B5:** the belt: the world gen layer, the harpoon drill, the asteroid processor and the optical miner.
- **B6:** Io's surface: the fumarole condenser and the volcanic intake.
- **B7:** Io orbit: the second station and the tether, or the sulfur–iodine plant on Io.
- **B8:** Europa: the cryobot and the algae bioreactor, with the bacteria cut.
- **B9:** Ganymede: the GW detector and the coilgun.
- **B10:** fusion and research, with the Mk1 cuts and duranium's move.

**Wave C:**
- **C1:** the validator (`-Tier luv`).
- **C2:** the quests.
- **C3:** a full integration run with every base and both stations loaded, a v0.7.x save, and the release notes.
- **Then v0.8.0.**

**Every cut lands with its replacement:**
- the bacteria cut with Europa (B8);
- the Mk1 cuts with fusion (B10);
- the pipe's recycling with the smelter (B3).

## Decisions taken (orchestrator, 2026-10-25)

The design above follows these. The first twelve came with the design review; the last ten closed the questions it left open.

1. **Places:**
   - five GCYR entries and ten dimensions: the belt, Jupiter, Io, Europa and Ganymede, each with its orbit;
   - Jupiter is a tier 5 placeholder, there only for the menu;
   - the ids are final after the planet spike (S0-1): fixed in B1.
2. **Level 4 rocket:**
   - GCYR's elite motors with tier 5 tanks, registered through GCYR's KubeJS `gcyr:fuel_tank` builder; no Java;
   - the tank's id is final after a real level 4 launch and return (S0-2): `grindless:cryogenic_fuel_tank`, fixed in B1.
3. **Stations:** the first in Earth orbit; a second, in Io orbit, only for the tether (decision 17).
4. **Living circuits at LuV:**
   - bacteria come only from Europa;
   - the biofoundry holds GTM's whole sterile chain, bootstrap included;
   - GTM's own bacteria recipe is cut only when the biofoundry and the GT-- check (S0-4) are done, beside its replacement.
5. **Trinium:**
   - the naquadah plant's mode 2, with full recovery of xenon, gold, antimony and the Pd/C catalyst;
   - fluorine, hydrogen and the enriched oxide are used up;
   - no asteroid trinium;
   - the balance is exact, from pinned recipes.
6. **The Mk1's transmutations:** Ag + Cu → Os, Hg + Mg → U-235 and Au + Al → U-238 are cut. Everything the Mk1 can run, addons included, was checked.
7. **Radiation:** a machine rule only (vault casings on Io, Europa and Io orbit); no player radiation.
8. **The twenty:**
   - the organoid lab stays, for the NPU;
   - the optical miner replaces the radiolysis harvester;
   - the ring becomes a molecular farm;
   - the HTS magnet works takes the rectenna's place.
9. **Sunlight:** one table, `tables/sunlight.json`, for the whole solar family.
10. **No beam ledger and no rectenna:**
    - generators feed the global wireless network, and bases draw from it;
    - the tower's cells set the tier, and the network keeps 5 % on entry;
    - EU P2P stays as the AE2 route;
    - ZPM's first step is the next tier jump, the ZPM cells.
11. **Crystal growth in orbit:**
    - two benefits only: certainty and four times the speed;
    - the dopant stays at GTM's dose, and GTM's cleanroom condition stays.
12. **Gate to ZPM:** the 524,288 EU/t milestone and the material gate, with the HPCA and the research station explicit, and no passive waits.
13. **The HTS coil:** 144 mB of trinium, so one Mk1's trinium takes under an hour of one naquadah plant at ×4. *(tune)* until A4's bench run.
14. **The optical miner** stands on the belt's surface. No third station: stations are the riskiest piece.
15. **The ring is a molecular farm,** and the LuV NPU needs its neurotrophic factor.
16. **The HTS magnet works** is its own machine, and the network's LuV cells are its SMES coils.
17. **The tether and the Io-orbit station:**
    - they stay if spike S0-3 shows a second station works;
    - if not, the Io sulfur–iodine hydrogen plant takes the slot;
    - both are written into the Io-orbit package, so the swap needs no redesign.
18. **Optical pipes:** GTM's two recycling recipes for `gtceu:normal_optical_pipe` are removed.
19. **GTCA's calcium plasma** stays as LuV's fusion power. Its net figure is checked on the bench in B10.
20. **Duranium moves to the Mk2:** Ga + Rn → duranium gets a 200 M EU start.
21. **Spent naquadah rods** are re-enriched in mode 2's circuit 3.
22. **The gate's power test:** 524,288 EU/t for 60 s into a power substation.
