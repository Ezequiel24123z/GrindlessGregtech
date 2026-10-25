# Era IV

IV is nuclear and opens the inner planets. Up to EV, power was almost always burned; in IV it is designed. Uranium from the End is enriched in the hot cell and assembled into cores, and the reactor burns them without smoke, breeds plutonium and leaves tritium for fusion. That takes the place of the first fusion reactor, which stays in LuV. With the level 3 rocket and the thermal suit, IV goes to Venus and Mercury at the same time: naquadah comes only from Venus's deep veins, at 90 bar, and iridium and osmium only from Mercury's crust. Both feed LuV. IV also brings the kit for mass production: the assembly line that draws from AE2, the parallel hatch and the GCYM cubes. The user put it this way: "Tungsten, naquadah if it exists, and the first fusion reactor or whatever takes its place. If the player keeps crafting one at a time, the pack is wrong." (translated from Spanish)

IV starts with what EV leaves behind (`ev.md`): an IV hull in Tungstensteel (tungsten only comes from Mars), the automatic lunar base (titanium), the Mars outpost (tungsten, rare earths, ice with deuterium), the platinum plant, the cryogenic plant, the level 2 rocket and the HV suit, the Earth–Moon–Mars quantum bridge, stored Nether Stars from the Wither, Nanoprocessor Supercomputers and a 32,768 EU/t power plant with an EV→IV transformer.

## Route

1. **IV grid and HSS-G.** IV cutter in a cleanroom → HPIC chips → IV hatches (IV hull, 2 W cables, 2 HPIC, IV voltage coil and NaK; two of the same step go up one tier). HSS-G: EV mixer (5 TS + Cr + 2 Mo + V → 9) → 4,200 K EBF with RTM coil → `hssg_coil_block` coil (IV assembler: 8 double HSS-G wires, 8 WC plates and 144 mB of W) → 5,400 K EBF.
2. **Uranium.** The in-situ leach field in the End (`gtceu:isr_wellfield`, decision 2) dissolves uraninite from GTM's `pitchblende_vein_end` in place: the vein's sample (raw pitchblende + raw uraninite, mined once by hand), sulfuric acid, oxygen and an ion-exchange resin. No drill takes that vein. Fluorite from the new Earth vein (drilled from steam on) goes through the fluorspar kiln for the HF.
3. **Hot cell.** Enrichment (UF₆ in one pass, the HF's fluorine back as F₂) and radon with no plutonium stock → Quantum Star (Nether Star + 1,250 mB of Rn) → IV field generator (SmFeAsO, with samarium from Mars).
4. **Reactor.** LEU assemblies from the fuel fabrication plant (UO₂ pellets in Zircaloy tubes, with the Moon's helium), first with light water; with heavy water from the heavy-water plant (Mars ice), double the power. The tritiated heavy water goes to the Moon's tritium removal facility, which returns the heavy water and stores the tritium. Spent fuel goes back to the hot cell for MOX and the breeder. The power plant no longer runs at the limit.
5. **Thermal suit and level 3 rocket.** PBI (IV reactor) → insulating fabrics from GCYR → thermal upgrade for the suit (IV assembler); without it, Venus (737 K) and Mercury (440 K) kill. GCYR's elite motor and tank, remade in the IV assembler with tungsten steel and the antenna's inner-planets chart: a rocket's level is the floor of its average motor and tank tiers, so level 3 needs every motor and tank elite, and two elite tanks for the trip's fuel.
6. **Venus, by hand.** Naquadah sample, starter RTG cell, casings made there, half of the bridge and the heat engine. Then, the pressurized drill.
7. **Mercury, by hand.** Iridosmine sample, solar field and RTG cell, half of the bridge and the night-side drill.
8. **Naquadah.** Naquadah plant → dust → 5,000 K EBF → ingot → boule (5,400 K EBF) → Naquadah-doped Wafers (8 CPU Wafers each, in a cleanroom).
9. **Iridium and osmium.** Platinum plant, mode 3 → Ir (4,500 K EBF) and Os (EBF at 30,720 EU/t: two IV hatches). Then ruridit, HSS-S, NbTi and Rhodium Plated Palladium.
10. **Mass production.** IV sensor and emitter (iridium + Quantum Star) → control casings → assembly line fed by AE2; parallel hatch and GCYM.
11. **Exit.** The interferometer gives the outer-system chart. LuV hull, LuV motor made by the line and *Gate to LuV*.

## Inherited from EV

- **Tungsten (Mars).** Tungstensteel in hulls, casings, drums and HSS-G. Without the Mars outpost, IV stops.
- **Titanium (Moon base).** NbTi and the thermal-upgrade plates. The base runs on its own.
- **Deuterium ice (Mars).** IV turns it into heavy water (`ev.md`): reactor moderator. The deuterium, which no longer comes out on Earth, is stored for fusion.
- **Helium from the Moon.** Liquid Helium to cool the hot naquadah ingots (5,000 K).
- **Rare earths (Mars).** Samarium: SmFeAsO, the IV superconductor, and LuV magnets.
- **Platinum plant.** Pt, Pd, Rh and Ru as before, and it gains mode 3. The Pd makes the Pd/C for enriched naquadah.
- **Cryogenic plant.** Liquid Nitrogen (Mercury drill by day), LOX and LH₂ (rocket). The nitric acid for reprocessing comes from GTM's chemical reactors (decision 10: no Ostwald tower).
- **Wither, nano, antenna and AE2.** Nether Stars → Quantum Stars; Nanoprocessor Supercomputers → LuV mainframes; the deep space antenna (`gtceu:deep_space_antenna`) writes the Venus and Mercury chart; the EV network (P2P trunk, power as FE and the pairs the base sets up) is where the IV network grows from.

## Venus and Mercury

- **Level 3 rocket.** GCYR sets Venus and Mercury at level 2, like Mars (verified in the jar); `ev.md` raises them to 3 with a datapack so the Mars rocket cannot reach them. GCYR works out a rocket's level as the floor of (average motor tier + average tank tier) / 2, so level 3 needs every motor and every tank elite (research, 2026-10-25). IV remakes GCYR's elite parts (`gcyr:elite_fuel_tank`, `gcyr:elite_rocket_motor`, whose only recipes are ZPM assembler ones) in the IV assembler with tungsten steel and the antenna's inner-planets chart, as EV remade the advanced ones (decision 10). GCYR's KubeJS motor builder creates a fuel tank (a GCYR bug), so no parts of our own are registered. A trip to Venus or Mercury takes 14,000 mB of fuel and an elite tank holds 12,000: the rocket needs two elite tanks.
- **Suit.** The gate to the trip is GCYR's thermal upgrade (`gcyr:space_suit_thermal_upgrade_smithing_template`, assembler at 7,680 EU/t: 3 heat shield fabrics, 3 insulating fabrics with PBI, 2 titanium plates and 2 Kapton K plates). On the first visit, the chestplate tank alone is enough. At the bases, GCYR's IV oxygen spreader (`gcyr:iv_oxygen_spreader`, verify recipe).
- **First visit, by hand.** You go down with an RTG cell, an IV assembler and home parts. Two ores are mined from the vein for the sample, the site casings and half of the bridge are made there, and a Waystone is left behind. After that, travel is free.

| | Venus | Mercury |
|---|---|---|
| Environment (GCYR) | 737 K, CO₂ at 92 bar, H₂SO₄ clouds, no O₂, dark surface (light 6) | 440 K by day, vacuum, light 19 (×6.7 in the planet table) |
| Rules | no combustion; heat multiplies the coolant; solar yields little | no combustion or Drilling Fluid (vacuum); by day the drill burns out without Liquid Nitrogen |
| Site power | heat engine: ground heat against a tall radiator | solar field by day; RTG cell or buffers at night |
| Only comes from there | naquadah (deep vein) | iridosmine: iridium and osmium |
| Parts made there | Venusian regolith pressurized casing (`gcyr:venusian_regolith`) | Mercury rock heat shield casing (`gcyr:mercury_rock`) |
| Also | gas collector: CO₂ at the bottom and Sulfuric Acid in the clouds (altitude condition) | interferometer antenna |

Site casings come from recipes with `.dimension(...)`: you have to go there and build them. GCYR's veins on Venus and Mercury are removed from generation (the tungstotitanate one would give tungsten outside Mars), and `gtceu:naquadah_vein` moves from the End to Venus (`GTCEuServerEvents.oreVeins`).

What is built there, and works only there: on Venus, the pressurized drill (which also works on Mars), the heat engine, the gas collector (its Venus recipes) and one half of the bridge; on Mercury, the night-side drill, the solar field, the interferometer antenna and the other half of the bridge. RTG cells work anywhere. The details are in *Family steps*.

## Automatic resource generation

| Resource | Source | Machine |
|---|---|---|
| Naquadah (and Pu-239 from the same vein) | deep vein on Venus | pressurized drill |
| Iridium and osmium | Mercury iridosmine vein (`gtceu:iridosmine`, registered by IV-A1) | Mercury drill → platinum plant |
| Uranium (uraninite) | the End's pitchblende vein, leached in place (decision 2); thorium and lead stay in the ground | in-situ leach field |
| Hydrofluoric acid | the Earth fluorite vein (fluorite, barite, galena, sphalerite), drilled from steam on | fluorspar kiln |
| Heavy Water and deuterium | Mars ice (`ev.md`); the reactor's moderator comes back from the Moon | heavy-water plant; tritium removal facility; electrolysis for deuterium |
| Pu-239, Xe, Kr, Cs and Nd | breeding and reprocessing | reactor and hot cell |
| Tritium | the reactor's heavy-water moderator | tritium removal facility (Moon), the only source |
| Radon | uranium + air, with the plutonium kept inside, so no plutonium stock is needed | hot cell; GTM's large chemical reactor with plutonium |
| CO₂ and H₂SO₄ | air and clouds of Venus | GTM gas collector |

It closes the loop: samples, drill bits and water, with no more trips. The five worlds feed the same network. There is no IV greenhouse and no new creature: the simulator ends at EV.

## Our multiblocks

### Designed-core reactor: `gtceu:fission_reactor` (the era's)

What it gains: **IV's energy without burning anything, with a reactor that GTM does not have.** GTM 7.5.3 has no fission and DeaFission does not load. The reactor turns a fuel cycle (enrich, assemble, burn and reprocess) into constant power, breeds plutonium and leaves tritium for fusion.

- **Type:** `gtceu:fission_core`, a generator (check `generator(true)` in KubeJS and the 16 A IV dynamo hatches). Each recipe is one designed core: a fuel and moderator pair. Cycles are 20 s. The assembly is used up at random (0.5% per cycle, about 67 min) and the spent fuel comes out with the same probability. The cooling water (2,000 mB per channel and cycle) is lost in the tower.

| Core | Input, besides water | EU/t per channel | Output |
|---|---|---|---|
| LEU, light water | LEU assembly | 16,384 | spent fuel |
| LEU, heavy water | LEU assembly + 5 mB of heavy water per cycle (the moderator activates) | 32,768 | spent fuel + 5 mB of tritium |
| MOX, heavy water | MOX assembly (burns plutonium) + 5 mB of heavy water | 32,768 | spent fuel + 5 mB of tritium |
| Breeder | Pu core with a U-238 blanket | 8,192 | spent fuel, with more Pu than went in |

- **Channels:** up to 4 at a time (our parallel, like `bores`). A reactor full of heavy water gives 131,072 EU/t: the gate's power plant.
- **SCRAM, not explosion:** if water runs out or the spent-fuel bus is full, it stops when the cycle ends. Failing costs material, never progress (the Grindless campaign).
- **Structure:** vessel of radiation-proof machine casing (`gtnn:radiation_proof_machine_casing`: dense lead, TS frame and concrete; IV assembler), 4 TS pipe channels, turbine room (`gtceu:tungstensteel_turbine_casing`) and vents; assembly and spent-fuel buses, water hatches, moderator and tritium hatches, and IV dynamo hatches. Accepts ME hatches.
- **Built with:** IV hull, IV field generator (the hot cell comes first), 2 IV pumps and 4 IV circuits.
- **By-products:** spent fuel → hot cell. Tritium → stored for fusion. Water → tower.
- **Balance (as built, IV-A2):** an assembly lasts 200 channel-cycles of 400 ticks and gives 1.31 G EU (LEU in light water), 2.62 G (LEU or MOX in heavy water) or 0.66 G (breeder). An LEU assembly costs 3.63 M EU (IV-A4's real figure, with the hot cell's enrichment) plus 30 uraninite, 2 Zircaloy ingots and 100 mB of helium, so it returns 361× in light water and 722× in heavy water. A full heavy-water reactor (131,072 EU/t, 9.4 G EU an hour) uses 3.6 LEU assemblies an hour. It balances: the rate the player feels is set by channels and dynamo hatches, not by fuel scarcity. If the fuel's final cost comes out far above 10 M EU per assembly, the lever is the wear chance (50 → 25 of 10,000 doubles an assembly's life), not the channels. The extreme combustion engines stay the uranium-free alternative.
- **As built (IV-A2):**
  - The programmed circuit picks the core (1 LEU in light water, 2 LEU in heavy water, 3 MOX in heavy water, 4 breeder), because GTM's lookup would hide the light-water core behind the heavy-water one. The cores live in `data/grindless/tables/fission_cores.json`; cycles are 400 ticks.
  - Wear and spent fuel are GTM's chanced input and output (50 of 10,000 each, two rolls). GTM 7.5.3's OR chance logic is deterministic per machine: exactly one assembly per 200 channel-cycles, not a random lifetime.
  - Channels are the generator helper's parallel copies (`lib/generators.js`), capped at 4 and limited by assemblies, water, room for the outputs and the dynamo hatches' V×A. A heavy-water channel needs 32,768 EU/t of dynamo capacity; one 16 A IV dynamo hatch (or four 4 A ones) carries the full 131,072 EU/t.
  - The moderator is a second fluid input hatch; the tritiated heavy water leaves through the optional fluid output hatch. The vents are GTM's computer heat vents, and the four tungstensteel pipe channels stand two high around a tungstensteel frame control rod.
  - SCRAM is GTM's own start check (inputs, and room for every output); the controller shows a SCRAM line while it is shut down with fuel loaded. Voiding items or fluids is refused.
  - Its recipes are not doubled by `power/generators.js`: `gtceu:fission_core` must stay out of that file's list.

### Hot cell: `gtceu:hot_cell`

What it gains: **radioactive material never passes through hands, and it makes two recipes that are impossible at small scale.** GTM flags uranium, plutonium, radon and tritium as radioactive; here they enter through buses and leave to the network. The circuit selects the mode. Modes 1 and 4 are composed from the live recipes, with the same energy and yield, like the EV platinum plant; modes 2 and 3 are ours.

1. **Enrichment:** 30 uraninite + 40,000 mB of HF → 1 U-235 + 9 U-238 + 20,000 mB of water + 40,000 mB of F₂ (steps `uranium_hexafluoride`, `uranium_hexafluoride_separation` and the two electrolyses), one LEU assembly's uranium. The UF₆ does not leave, and the HF's fluorine comes back as F₂, no more (decision 10).
2. **Fuel:** MOX (oxide: 2 Pu + 8 U-238 + O₂) and breeder (metal: a Pu ingot core in 9 U-238 ingots), both in Zircaloy tubes with helium; RTG pellets (PuO₂ in Pt-Rh foil); Pu-Be neutron source (`grindless:pube_neutron_source`, PuBe₁₃ with Nether beryllium, in stainless steel foil). Fresh LEU is made by the fuel fabrication plant (decision 7).
3. **Reprocessing** (PUREX): a spent assembly + 4,000 mB HNO₃ → U-238 and Pu-239 back + Xe and Kr, Cs and Nd (10 % chances) + 4,000 mB NO₂ for GTM's nitric acid recipes + one vitrified waste (`gtnn:radioactive_waste`, a GT-- item with no use: the fission products and the chopped cladding).
4. **Radon:** U-238 + 10,000 mB of air → 1,000 mB of Rn (`radon_from_uranium_238`). The 8 plutonium ingots that GTM returns as dust stay inside as a catalyst, so the first radon needs no plutonium: radon → Quantum Star → IV field generator → reactor works before any plutonium exists.

- **Structure:** radiation-proof casing cells, laminated glass windows and manipulators; 1 or 2 IV hatches; accepts ME.
- **Built with:** IV hull, IV centrifuge, IV chemical reactor and an **EV electrolyzer** (GTM's IV one needs osmium wire, which is Mercury's), 2 IV robot arms and 4 IV circuits.
- **By-products:** F₂ → the HF for the naquadah plant. Xe → enriched naquadah. Kr and Nd → noble gases and magnets. Cs → stored for naquadria (ZPM). Waste → stored contained and never emptied. Thorium → stored; lead → casings.
- **Cut-down option:** without reprocessing or the breeder, the essentials remain: enrichment, LEU and radon.
- **As built (IV-A3):**
  - The circuit is the mode (1 enrichment, 2 fuel, 3 reprocessing, 4 radon); the recipes live in `data/grindless/tables/hot_cell.json`. Modes 1 and 4 are composed at every load by `server_scripts/grindless/lib/compose.js`, the platinum plant's composer as a library, and spend the stages' energy at 7,680 EU/t.
  - Structure: 7 wide × 5 high × 4 deep, two 2×2×2 cells of radiation-proof casing on a light concrete floor, two laminated glass windows, tungstensteel frame manipulators, PTFE pipe vessels and filter casings on the roof. Voiding items or fluids is refused, so the waste stays contained.
  - Every recipe of the type has its own ingredient set: MOX and the breeder differ by form (oxide dust and O₂ against metal ingots), the RTG pellet by its Pt-Rh foil, the Pu-Be source by beryllium.
- **Plutonium balance (IV-A3, next to the reactor's EU):**

  | Fuel | EU per assembly | Pu in | Pu back from its spent assembly | Net Pu |
  |---|---|---|---|---|
  | LEU (light or heavy water) | 1.31 or 2.62 G | 0 | 1 | +1 |
  | MOX (heavy water) | 2.62 G | 2 | 1 | −1 |
  | Breeder | 0.66 G | 1 | 2 | +1 |
  | RTG pellet, Pu-Be source | — | 1 | — | −1 |

  One spent LEU assembly pays for one MOX. A breeder and a MOX together are plutonium-neutral and burn 2 U-238 for 3.28 G EU: the closed cycle runs on enrichment tails. The hot cell spends 3.07 M EU to make a MOX or breeder assembly, 4.61 M to reprocess one and 1.02 M to enrich one LEU's uranium, against 0.66–2.62 G per assembly.

### Naquadah plant: `gtceu:naquadah_plant`

What it gains: **the hands-free neutron window and the superacid inside.** The live line is GT--'s, in the GTNH style: naquadah oxide only yields naquadah in GT--'s neutron activator, which needs the neutron energy kept in a window (220–230 MeV for naquadah, 460–480 for enriched, and 1,050–1,100 for naquadria) with accelerators and graphite or beryllium dust. The plant composes the live steps and swaps the window for the Pu-Be source on the bus (used up at random, ≈ 1% per batch) plus the EU of the accelerators (numbers to tune).

1. **Naquadah** (circuit 1): `neutron_activator/naquadah` (4 oxide + 6,000 mB of HSbF₆ → 2 naquadah + 2 TiF₃ + Ga at 50%), `fluoroantimonic_acid`, `antimony_trifluoride` and `titanium_trifluoride_separation` (1,941 K EBF → titanium + HF). For every 2 naquadah, about 15 Sb₂O₃ dust (6 antimony) and about 40,000 mB of fluorine as HF go in; the H₂ and HF from the steps come back inside.
2. **Enriched** (circuit 2; LuV recipe, with two IV hatches and a cleanroom; verify that GTM assigns it to a multiblock): enriched oxide → Enriched Naquadah Sulfate. Steps: reactor (1,920 EU/t), hexafluoride (7,680), xenon (cleanroom), GT--'s chemical plant (30,720, with Pd/C and AuF₃), mixer with H₂SO₄ and activator. The residue goes through the dehydrator and electrolysis, which return Xe, Au, SbF₃ and HF.

- **Structure:** inert casing (PTFE) ≥ 40, PTFE pipes, activation chamber of radiation-proof casing and laminated glass; input bus (oxide, Sb₂O₃ and source), output bus, 3 input hatches (HF, H₂ and H₂SO₄) and 1 or 2 IV hatches; accepts ME.
- **Built with:** IV hull, chemical reactor, IV mixer and centrifuge, 2 IV pumps and 4 IV circuits.
- **By-products:** titanium → into the titanium loop (see *Proposed decisions*). Gallium → Gallium Arsenide for the boule. Enriched sulfate and Trinium Sulfide → stored for the 7,000 and 7,200 K EBFs (LuV). Naquadria Solution (radioactive) → stored contained until ZPM.
- **Why it is not one big cube:** no GTM machine combines activator, reactors and EBF; the power is the sum of the steps, and it needs fluorine, antimony and the hot cell's source.
- **Cut-down option:** mode 2 moves to LuV; without the plant, the loose GT-- line with its activator remains.

### Family steps

- **Pressurized vein drill** (`gtceu:pressurized_vein_drill`): a closed shaft against pressure, a TS pipe jacket, inert casing against acid and pressurized regolith casing. On Venus (`.dimension('gcyr:venus')`) it runs the naquadah vein with a Tungstensteel drill bit; instead of Drilling Fluid it uses Distilled Water, which comes out as steam: it is the heat tax (four times what the Drilling Fluid requires), and the steam is inert (it is discarded or moves a turbine). On Mars it runs its three veins with dust filters: it is the pressurized kit that `ev.md` left for IV. Cap of 128 in `bores` (the tripod, 64).
  - *As built (IV-B1):* it runs only `vein_drilling/iv/pressurized_<vein>_tungsten_steel` recipes (Venus: naquadah; Mars: scheelite, merrillite and ice), 5.625 ores a run, the IV bit (`grindless:tungsten_steel_drill_bit`, IV-B2's) at 0.25 %. The heat tax is 200 mB of distilled water a run, which leaves as 1,600 mB of steam, the run's own energy at 1 EU per mB, so the drill never makes energy; Mars is dry. 5 × 9 × 4: a regolith pad, a 3 × 3 × 3 inert casing pressure housing, a filter casing deck and a tungstensteel pipe string. GCYR's `gcyr:venusian_regolith` is a falling block, so it is the ground row of every Venus structure; Venus cobblestone hammers into it, only on Venus.
- **Mercury drill** (`gtceu:mercury_vein_drill`): low-profile, under a heat-shield sunshade and with radiators. At night it drills dry and the Tungstensteel drill bit wears out twice as fast; by day it only works with Liquid Nitrogen (GCYR's Mercury has a day and night cycle: its dimension type has no fixed time). Iridosmine vein.
- **On-site power** (builds on the LV solar mirror tower and the EV lunar solar field, `gtceu:lunar_solar_array`):
  - **Venus heat engine** (`gtceu:venus_heat_engine`): a hot plate on the ground and a 16-block radiator chimney up into the clouds, which is the cold side. With `.dimension('gcyr:venus')`, 200 mB of Distilled Water per 20 s cycle → 8,192 EU/t, always: GCYR's Venus is fixed at noon (`fixed_time` 6000), so day and night don't matter there. Outside Venus there is no such heat.
    - *As built (IV-B1):* generator type `gtceu:venus_heat` (kept out of `power/generators.js`'s list): 200 mB of distilled water a 20 s cycle → 8,192 EU/t and 32,000 mB of steam (GTM's 160:1), the water's destination (decision 10). 16 high, the pattern helper's limit: a footing, a 3-high engine house over a firebox hot plate, a roof and an 11-block riser of Night-Sky Radiators.
  - **Mercury solar field** (`gtceu:mercury_solar_field`): the lunar field with a heat-shield sunshade. By day it yields ×6.7 (the Moon, ×1.4); at night, nothing.
  - **RTG cell** (`gtceu:rtg`, single-block machine; verify the simple KubeJS generator): plutonium oxide pellet that is used up at random (≈ 1 per hour) → 2,048 EU/t constant. It starts every base and covers Mercury's night.
- **Observatory, step 5: interferometer** (`gtceu:interferometer`): the Mercury antenna (night and vacuum) combines its data with the Moon's deep space antenna over the network. It gives the outer-system chart (the belt and Jupiter, the LuV trip) and the first signal from Sagittarius A*.
- **Platinum plant, mode 3** (circuit 3): iridosmine → Ir + Os with GT--'s live chain (`rarest_metal_residue_ebf`, OsO₄ distillation and `osmium_dust_completion`; `iridium_metal_residue_process` → IrO₂ → iridium acid → `iridium_chloride` → `iridium_chloride_separation` with calcium). The input step is ours: iridosmine + saltpeter + brine (775 K EBF) → Rarest Metal Mixture, like `rarest_metal_residue`, tuned to give 3 Ir per Os. The OsO₄ and Cl₂ do not leave, and the CaCl₂ goes to electrolysis. Accepts the parallel hatch.

### Discarded

- **Solar smelting on Mercury** (`journey.md`): smelting osmium with sunlight would skip LuV's osmium recipe. Iridium and osmium are refined at home. It stays as plan B if the Mercury base falls short.
- **Cloud collector as a multiblock:** GTM's gas collector does it, with an altitude condition.
- **Prospecting satellite:** moves to LuV, where orbits without landing begin. In IV the sample is mined by hand.
- **Sealed dome on Mars** (proposal from `ev.md`): no IV base asks for plants; it waits for the one that does.
- **External fission and our own activator:** DeaFission does not load, and GT--'s activator stays loose.
- **Component factory** (Star Technology, MIT; GT--'s component line): synthesis in one box. Plan B for LuV.

## Fission, and what is not fission

- **Our fission is IV's power** and takes the place of the first fusion reactor. GTM's Mk1 (`gtceu:luv_fusion_reactor`: 4 ZPM circuits, 64 UHPIC, double plates of Pu-241 and osmiridium, and 2 IV field generators) stays in LuV; IV stores its fuel.
- **GT--'s naquadah reactors** (`gtnn:*_naquadah_reactor`, from EV to UV): they stay as they are. They burn enriched naquadah or naquadria (from I at 2,048 EU/t to V at 524,288), which come out of 7,000 K or hotter EBFs, so in practice they are the nuclear power from LuV onward. The big one (ZPM) burns excited liquid fuels.
- **Extreme Combustion Engines (GTM):** the uranium-free alternative (LuV circuit, LOX and High Octane Gasoline).
- **Radiation:** the anti-radiation suit is still mandatory (MV rule); with the hot cell and AE2, nothing else needs touching.

## Nothing one at a time

- **Assembly line from AE2.** The controller has an IV hull, 2 IV robot arms, 4 control casings and 2 IV circuits. Each control casing has an IV sensor and emitter (iridium and Quantum Star), and the line casing takes a ruridit gear: without Mercury there is no line. The item buses are ULV, one slot, and must be placed in order (verified in `GTMultiMachines`). That is why each cut has an AE2 export bus locked to its ingredient and held back by a level emitter; fluids enter through 1× hatches (up to 4) and the output goes to an ME bus. Each line makes one product continuously. Research uses the scanner (Data Stick).
- **IV parallel hatch (×4):** sensor, emitter, 4 IV circuits (decided: GTM's recipe asks for LuV), IV hull and 2 double platinum cables. GCYM, addon cubes and our plants accept it (hot cell, naquadah plant and platinum plant). The reactor already has its channels.
- **GCYM at IV:** IV circuits, the IV machine of the same type and TS or WC parts (verified in `GCYMRecipes`). `large_packer` and `alloy_blast_smelter` move up to IV; the large mixer asks for an osmiridium rotor (LuV). GTCA's megareactor and megacracker and GT--'s Maceration Stack arrive at IV (decided).
- **Two IV hatches = LuV:** osmium, UHPIC wafer and naquadah mode 2. GCYM's large assemblers have only one hatch.
- **Plan B:** Extended Features' Expanded Assembly Line (accepts ME buses) with a GCYM-type controller. GT--'s component line still has no recipe.
- **Quantum Chest V and Quantum Tank V (IV):** the lines' stock, off the network.

## AE2 between planets: the IV step

EV leaves the ME P2P tunnel trunk, power over EU P2P (or FE P2P with GTM converters for FE devices; 32,768 EU/t crossing, measured with EV parts: the tunnel itself has no cap) and the pairs the base sets up. IV goes up one step:

- **Two more pairs,** Earth–Venus and Earth–Mercury. Their far half is built there on the first visit, and both sides run with loaded chunks (FTB Chunks).
- **More amperage:** EU P2P tunnels (`eup2p`) already cross dimensions and carry EV power since EV, and they pay the same toll as FE (2.5% of the energy, in AE). The IV step is amperage. Target: 131,072 EU/t crossing. eup2p's laser P2P tunnel (`LaserP2PTunnelPart`, id to verify) is the candidate. The heat engine sends home what is left over, and the reactor covers Mercury's night.
- **Capacity:** MEGA (the IV circuit assembler's processor) and the 32k coprocessors of Expanded AE. The network stores and manufactures with what arrives from five worlds.
- **The network feeds the line:** the export buses of each cut request from all planets at once.

## New process lines

| Line | Steps | By-products → destination |
|---|---|---|
| Uranium cycle | pitchblende → centrifuge (uraninite, thorium and lead) → hot cell: UF₆ and cascade → U-235 and U-238 → assemblies → reactor → spent fuel → reprocessing | F: loop inside the hot cell. Pu and U: return. Xe, Kr, Cs and Nd: see the hot cell. Waste: contained |
| Radon and star | hot cell, mode 4 → radon → chemical bath: Nether Star + 1,250 mB → Quantum Star; Ender Eye + 250 mB → Quantum Eye | Pu: does not leave the hot cell |
| Naquadah | Venus → ore plant → oxide → naquadah plant → dust → 5,000 K EBF → ingot → boule (5,400 K EBF) → wafers; UHPIC (large reactor, two IV hatches, 576 mB of molten naquadah) | Ti and Ga: see the plant. Enriched oxide (28% of the ore): mode 2, or stored |
| Iridium and osmium | Mercury → iridosmine → platinum plant, mode 3 → Ir (4,500 K EBF) and Os (EBF, two IV hatches) → ruridit (2 Ru + Ir), HSS-S (6 HSS-G + 2 Ir + Os) and osmiridium (LuV) | OsO₄ and Cl₂: stay inside. Platinum Sludge Residue: gold and Silicon Dioxide |
| IV superconductors | samarium (Mars) → SmFeAsO (IV mixer); niobium (pyrochlore and tantalite) + titanium → NbTi; 3 Pd + Rh → Rhodium Plated Palladium | — |
| Heavy water | Mars ice → the heavy-water plant (dual-temperature exchange with an H₂S charge, then finishing) → heavy water (`gtceu:heavy_water`) → reactor; electrolysis → deuterium | Light water: to the network. O₂: air. The reactor's tritiated heavy water: the Moon's removal facility, which returns the heavy water and stores the tritium for fusion |
| Suit | PBI (IV reactor; the phenol returns), Kapton K and para-aramid (GCYR), fiberglass → fabrics → thermal upgrade | Phenol and HCl from the aramid: loops |
| Venus | gas collector: CO₂ at the bottom and Sulfuric Acid in the clouds | CO₂: greenhouses. H₂SO₄: enriched naquadah and platinum plant |

## Quests

Chapter **"IV — Inner Planets"**, in English, with about 22 small-reward quests that do not block recipes. It opens with what EV's observatory sees: Mercury's glare close to the Sun and Venus's clouds. It closes with the interferometer, which gives the belt and Jupiter chart and, for the first time, a radio source at the centre of the galaxy: Sagittarius A* (that is how it was discovered in 1974). The final goal appears in the sky, and no quest promises a machine that does not exist yet.

- **Home:** *Hotter Steel* (HSS-G coil), *Yellowcake* (pitchblende), *Behind Lead Glass* (hot cell), *Cascade* (U-235), *First Core*, *Criticality* (reactor), *Heavy Water* (tritium) and *Quantum Star*.
- **Travel:** *Heat Shield* (thermal upgrade), *Under the Clouds* and *Ninety Bar* (Venus and its drill), *Heat Engine*, *Day of Fire* and *Night Shift* (Mercury) and *Five Worlds, One Network* (bridges).
- **Exit:** *Naquadah*, *Iridium and Osmium*, *Sensors and Emitters*, *The Line* (LuV motor from AE2), *Parallel*, *The Dark Heart* (Sagittarius A*) and *Gate to LuV*.
- **References:** the assembly-line and nuclear quests from Star Technology (MIT) and Monifactory (LGPL) are adapted with attribution; from GTNH, only ideas.

## Gate to LuV

| What is built | What it tests |
|---|---|
| LuV hull (`gtceu:luv_machine_hull`: Rhodium Plated Palladium casing, 2 NbTi cables and PTFE) | Pd and Rh from the platinum plant, niobium and lunar titanium |
| LuV motor made by the assembly line from the network, without touching anything | Mercury (HSS-S and ruridit), Mars (samarium magnet), AE2 and research |
| UHPIC wafer (large reactor with two IV hatches, in a cleanroom) and a naquadah ingot | Venus and the two-hatch trick |
| One osmium ingot (EBF at 30,720 EU/t) | Mercury and the LuV recipe |
| 4 Nanoprocessor Mainframes on the network | the nanoprocessor line, in batches |
| 131,072 EU/t sustained (one full reactor, or reactor and extreme combustion engines), 2 buffers and an IV→LuV transformer | fission takes the place of fusion |
| Stored: tritium (moderator), deuterium (Mars), Pu-241 (plutonium centrifuge) and 2 IV field generators | the LuV Mk1 fusion |
| IV parallel hatch in one of our plants | mass production |
| Venus and Mercury bases running 10 minutes without touching them, with their power and bridges | the bases sustain themselves |
| Outer-system chart (interferometer) | the next trip |

It unlocks LuV: hulls, hatches and LuV components (assembly line); LuV mixer and assembler (osmiridium, and a 7,200 K naquadah coil with naquadah wire and osmium plates); enriched naquadah and trinium; parallel ×16 and large mixer; the Mk1 fusion; GT--'s naquadah reactors; and the trip to the asteroid belt and Jupiter's moons.

## Validator (`-Tier iv`)

- **Naquadah only from Venus.** Every recipe that yields naquadah, enriched naquadah, naquadria or their oxides comes from the Venus vein: no vein in the End and no bee (the naquadah honeycomb and the bee made in the EBF with a naquadah block are removed). The GTCA alloys that decompose into naquadah require it first: they are loops.
- **Iridium and osmium only from Mercury.** Earth's platline stops giving `iridium_metal_residue` and `rarest_metal_mixture` (in centrifuging the sludge and in `rarest_metal_residue`, which keeps the ruthenate). No osmium bee. GTCA's platinum foam is ZPM tier. The decompositions (HSS-S, ruridit, osmiridium and Naquadah Alloy) are loops.
- **Tungsten only from Mars:** without the tungstotitanate vein on Venus.
- **Titanium:** from the Moon and, from IV on, also the titanium from the TiF₃ of Venus's naquadah (declared exception).
- **IV in three sub-stages:** home, Venus and Mercury, as EV is split into Moon and Mars. Nothing on the way to Venus and Mercury (level 3 rocket, thermal upgrade, site casings and bridge halves) asks for naquadah, iridium or osmium.
- **Nothing in IV asks for anything from LuV:** no asteroid metals, no Europa crops, no products of 7,000 K or hotter EBFs (enriched naquadah, trinium), nor anything from fusion (europium, americium).
- **The gate is built** only with what IV and the earlier eras give.

## Mods and integration

| Mod | Slug | Use in IV |
|---|---|---|
| GCYR | `gcyr` | level 3 engine and tank with its KubeJS plugin (Venus and Mercury at level 3: `ev.md` datapack), thermal upgrade (IV) and IV oxygen spreader; Venus and Mercury veins removed |
| GT-- | `gtnn` | live naquadah line (the plant composes it), loose activator, naquadah reactors (LuV), radiation-proof casing and radioactive waste |
| Productive Bees | `productivebees` | naquadah and osmium bees removed |
| MEGA Cells, Expanded AE | `mega`, `expanded-ae` | IV (decided) |
| EU P2P Tunnel | `eup2p` | power between planets as EU, no converters |
| GTM Extended Features | `gtm-extended-features` | large collector (End air: Rn and Xe); Expanded Assembly Line as plan B |
| Waystones, FTB Chunks, FTB Essentials | `waystones`, `ftb-chunks-forge`, `ftb-essentials` | free travel and loaded bases |

No new mods.

- **Startup:** types `fission_core`, `hot_cell` and `naquadah_refining`; machines `fission_reactor`, `hot_cell`, `naquadah_plant`, `pressurized_vein_drill`, `mercury_vein_drill`, `venus_heat_engine`, `mercury_solar_field`, `interferometer` (the multiblocks, with the pattern helper) and `rtg`; material `gtceu:iridosmine` and fluid `gtceu:heavy_water` (both registered by IV-A1); level 3 engine and tank (GCYR plugin); items for assemblies, spent fuel, RTG pellet, Pu-Be source, site casings and samples; reactor channel modifier.
- **Server:** recipes composed from the live ones (hot cell, modes 1 and 4; naquadah plant; platinum, mode 3) and ours in tables. Veins: `naquadah_vein` to Venus, iridosmine on Mercury, GCYR's veins on Venus and Mercury removed, `veins_venus.json` and `veins_mercury.json`, and the End's pitchblende vein read by the leach field (no drill takes it). Platline without Ir/Os, bees removed, and dimension, altitude and night conditions.
- **Config:** nothing new. Venus and Mercury go into EV's planet table.
- **Tests:** (1) it starts; (2) reactor, hot cell and naquadah plant form and process (plant and IV multiblock strips); (3) on Venus and Mercury (new strips after EV's: Venus X 3072–3135 and Mercury X 3328–3391, Y 98–112) the drills, heat engine and solar field form and only work there, and the level 3 rocket arrives; and `-Tier iv` with no orphans.

## Risks and open questions

- **Fission in KubeJS.** The multiblock generator, the 16 A dynamo hatches and the channel parallel are untested, and the EU balance per assembly is ours. Plan B: the extreme combustion engines carry the power plant.
- **The GT-- line.** Composing the activator without its window, the cleanroom step of mode 2 and the antimony and fluorine use. Plan B: mode 1 only, or the loose line with the activator.
- **GCYR on Venus and Mercury.** The heat and the thermal upgrade, the level 3 parts through the KubeJS plugin, the launch and dimension-change failures (#91 and #122), moving veins and removing GCYR's, and knowing whether Mercury has a night (settled by IV-A1: it does; Venus is fixed at noon). It must be tested in an actual game before IV is closed.
- **Iridium and osmium only from Mercury.** The new material and the platline cut change EV's platinum plant. Plan B: GTM's iridium and osmium ores in the vein and the ore plant, without mode 3.
- **Five loaded worlds.** Bases with loaded chunks on the Moon, Mars, Venus and Mercury, plus EU P2P between dimensions: watch the TPS with spark.

Credits to note in `CREDITS.md`: designed-core reactor (Grindless campaign, T5, MIT, from the user; real physics: PWR, CANDU, MOX and breeders); hot cell (idea from Gregicality legacy's PUREX, idea only; real physics); naquadah plant (GT--'s live line, license to be checked; GTNH idea); iridosmine, Venus heat engine, RTG and interferometer (real physics and history: Sagittarius A*, 1974); suit and rockets (GCYR, LGPL-3.0); solar smelting and prospecting satellite as deferred alternatives.

## Proposed decisions

1. **IV is the nuclear era.** Our fission reactor, with designed cores, takes the place of the first fusion, which stays in LuV (GTM's). The extreme combustion engines remain as the alternative. It replaces the previous version's power plant of 4 extreme engines.
2. **Three new multiblocks:** reactor, hot cell and naquadah plant. The plant reads GT--'s live recipes and swaps the activator's window for a Pu-Be source; its mode 2 (enriched) is a LuV recipe with two IV hatches.
3. **Family steps:** pressurized drill (Venus, and Mars with dust filters) and Mercury drill (night side), with a Tungstensteel drill bit and a cap of 128; Venus heat engine and Mercury solar field; RTG cell; interferometer; and the platinum plant's mode 3. At home there is no IV drill: the End's pitchblende is leached in place (decision 2).
4. **Naquadah only from Venus:** `gtceu:naquadah_vein` moves from the End to Venus (generation and table), and the naquadah bees are removed.
5. **Iridium and osmium only from Mercury:** new material `gtceu:iridosmine` in a Mercury vein. Earth's platline stops releasing the Ir/Os mixture and the iridium residue, so open question 10 in `ev.md` is closed: there is nothing to refine on Earth. The osmium bees are removed.
6. **Travel:** Venus and Mercury at level 3 (`ev.md` datapack), with the level 3 engine and tank made in IV with GCYR's KubeJS plugin and the antenna chart; GCYR's thermal upgrade (IV) is the other half of the gate. The first visit is by hand, with an RTG cell and casings made there; after that, Waystones. GCYR's veins on Venus and Mercury are removed.
7. **AE2 in IV:** pairs to Venus and Mercury, power as EU over P2P (`eup2p`) instead of FE with converters, 131,072 EU/t crossing, MEGA and Expanded AE's 32k coprocessors.
8. **Mass production:** assembly line with one AE2 export bus per cut, IV parallel with IV circuits, and GCYM at IV (with `large_packer` and `alloy_blast_smelter`). Plan B: the Expanded Assembly Line.
9. **Titanium from naquadah (TiF₃) is accepted from IV on:** it comes from Venus, not Earth, and the Moon rule still holds for EV.
10. **GT--'s naquadah reactors:** left untouched; they are the nuclear power from LuV onward.
11. **Changes to `journey.md`:** solar smelting moves to plan B, and the prospecting satellite moves to LuV.
12. **Gate to LuV:** LuV hull, LuV motor from the line via the network, UHPIC and osmium with two IV hatches, 131,072 EU/t of fission, stored fusion fuel, Venus and Mercury bases running on their own, and the outer-system chart.

## Decisions taken (orchestrator, 2026-10-24)

The twelve proposals are approved, with these clarifications:

- **The fission reactor depends on KubeJS generators.** This was checked on 2026-10-25: a KubeJS generator multiblock outputs EU through dynamo hatches on GTM 7.5.3 (`lib/generators.js`, run `a3-power-generators-run2`). Custom generator recipe types of ours work too: EV's lunar solar array (`gtceu:lunar_solar`, run `b4-lunar-power-1`) and combined-cycle plant (`gtceu:combined_cycle`, run `b7-combined-cycle-hot-mill-3`) put their EU into real EV battery buffers. The reactor's output needs no plan B.
- **The `iridosmine` material is registered with KubeJS** (`gtceu:iridosmine`) and only appears in Mercury's vein table. The validator checks that iridium and osmium do not come out on Earth.
- **`journey.md` is adjusted.** In the IV row, solar smelting moves to plan B, the prospecting satellite moves to LuV, and the reactor, hot cell and naquadah plant come in.
- **IV is built after EV.** This document is the guide until then.

## What the EV build leaves for IV (orchestrator, 2026-10-25)

What changed while EV was built, and what the IV design has to take into account before IV is built:

- **Growth (rule 7 of `AGENTS.md`).** EV ended with 11 multiblocks of ours, so IV needs about 15. This document predates the rule: the reactor, the hot cell, the naquadah plant and the family steps fall short. IV needs a "Raising IV to the target" pass, as EV had, before its packages are written.
- **Radioactives really start in IV.** EV now enforces "no radioactives before IV":
  - GTM's thorium ore (the Nether's beryllium vein) gives lead and rare earth instead of uraninite.
  - Liquid ender air in GTM's distillation tower gives no radon (nor deuterium).
  - The EV creature simulator and GTM's EV circuit assembler take HV emitters.
  - So uranium comes only from the pitchblende vein. Radon comes from the hot cell, GTM's uranium-238 recipe and Extended Features' large collector.
- **Deuterium has no Earth source left** (`hydrogen_separation` removed, ender air stripped). IV's heavy water from the Martian ice is the first source of all.
- **Power by site.** Fuels only burn in the dimensions with air (`data/grindless/tables/site_fuels.json`, an allowlist that GTM ORs), so "no combustion" on Venus and Mercury needs no more code. An IV machine that burns fuel in a script-added recipe calls `global.grindless.power.burnsInAir(builder)`. A byproduct that must have a destination can refuse fluid voiding, like the combined-cycle plant (`grindless.steam_outputs.no_voiding`).
- **Weather.** `space/airless_weather.js` keeps every dimension of the other planets dry, Venus and Mercury included. If Venus's clouds should ever be weather, Venus has to be exempted there.
- **Family veto.** A family recipe of a tier lives under `<type>/<tier>/`, and every lower machine skips the folders above its own tier; the steam machines skip every tier folder. The Tungstensteel-bit recipes that the older home drills should run (the pitchblende vein, *Route* step 2) therefore cannot live under `vein_drilling/iv/`. They go in the folder of the lowest drill meant to run them, or the veto gets an explicit exception. (Superseded by decision 2: the leach field takes the pitchblende, so no drill needs an exception.)
- **AE2.** EU P2P is the main power route between planets. The tunnel has no cap of its own (EUP2P passes the voltage and splits the amperage), so 16 A IV hatches at each end carry the reactor's 131,072 EU/t; AE2 takes its 2.5 % toll. The laser tunnel (`eup2p:laser_p2p_tunnel`) exists, but in stock GTM only LuV machines take laser hatches, so IV doesn't need it.
- **GTM's HV fluid drilling rig** arrives with Mars (tungsten carbide gears), at the end of EV.

## Raising IV to the target (orchestrator, 2026-10-25)

Rule 7 of `AGENTS.md`: EV ended with 11 multiblocks of ours, so IV needs about 15. As designed above, IV has 8:
- the reactor, the hot cell and the naquadah plant;
- the pressurized and Mercury drills;
- the Venus heat engine;
- the Mercury solar field;
- the interferometer.

The RTG is a single block and the platinum plant's mode 3 belongs to an EV machine, so neither counts. Seven are added, which makes 15. They come from a design pass on 2026-10-25: the machine catalog, the Leisure ideas (ideas only) and real engineering. Each closes a hole the design already had:
- deuterium had no source;
- fluorine was a wall of raw quantity;
- Venus had no water or oxygen of its own;
- Mercury had no site parts;
- the reactor's tritium had no contained route;
- the family veto blocked the Tungstensteel-bit route to uranium;
- the fuel cladding made no physical sense.

All of them are IV recipes (7,680 EU/t unless a composed GTM stage sets another figure) through the pattern helper, with ME parts and names in `en_us` and `es_es`. Every id was checked against the dump, GTM's source and `pack/kubejs`, with no clash. Figures marked *(tune)* are set when the machine is built.

| Site | Ours in IV after the raise |
|---|---|
| Earth | fission reactor, hot cell, naquadah plant, heavy-water plant, fluorspar kiln, fuel fabrication plant |
| The End | uranium in-situ leach field |
| Moon | tritium removal facility |
| Venus (and Mars) | pressurized drill, heat engine, acid works |
| Mercury | Mercury drill, solar field, interferometer, solar works |

### The seven added

#### Heavy-water plant: `gtceu:heavy_water_plant`, type `gtceu:isotope_exchange` (Earth)

- **What it gains:**
  - A separation GTM does not have: deuterium enrichment by dual-temperature exchange.
  - Several steps in one: melting, exchange and finishing.
  - The pack's only deuterium source, since EV removed `hydrogen_separation`.
  - It replaces `iv.md`'s "distillation tower (our recipe)": the distillation tower only does the last step in reality.
- **Recipes** (the circuit picks the mode):
  1. **Exchange, a batch of 16:**
     - In: 16 `gtceu:deuterium_rich_ice_dust` + 25,600 mB steam + an H₂S charge (≥ 1,000 mB in its own hatch, not consumed).
     - Out: 3,200 mB heavy-water concentrate (`gtceu:heavy_water_concentrate`, about 20 % D₂O, the real GS product) + 12,800 mB depleted water + 160 mB distilled water (the condensed steam, at GTM's 160:1).
     - EU per ice: the melt at GTM's `extractor/snow_block_extraction` rate (512 EU per 1,000 mB) + the exchange at the removed `centrifuge/hydrogen_separation` rate (3,200 EU per 40 mB of D, so 80 EU per mB of D; 80 mB here) = 6,912 EU.
     - The batch is 110,592 EU: 1,920 EU/t for 58 t. The steam per ice is *(tune)*.
  2. **Finishing:** 1,000 mB concentrate → 200 mB heavy water (`gtceu:heavy_water`) + 800 mB distilled water, at `distillation_tower/distill_water_large`'s rate (19,200 EU per 576 mB): 33,333 EU, 480 EU/t for 70 t.
  - **Yield:** 1 ice → 40 mB D₂O → 80 mB D in GTM's electrolyzer (`gtceu:heavy_water`, decision 10). The reactor full of heavy water (4 channels, 5 mB per 20 s cycle) needs 3,600 mB/h, which is about 90 ice an hour and 17 EU/t on average.
- **Byproducts:**
  - Depleted water is inert: it goes to the network or is voided.
  - The distilled water goes to the network.
  - The H₂S stays in the plant: it is a charge, not a cost.
  - The heavy water goes to the reactor and to electrolysis (deuterium for LuV, and O₂).
- **Structure** (≤ 16 high): a cold tower (3×3×10) and a hot tower (3×3×14) of inert machine casing, two blocks apart, joined at mid-height by a bridge of titanium pipe casings (the heat exchanger). Beside them stands a 1×1×8 vacuum column of tungstensteel pipe casing. Parts go at the towers' feet.
- **Controller:** IV hull + distillation tower controller + IV fluid heater + 2 IV pumps + 4 IV circuits.
- **Why it is not a big cube:** two towers of different heights show the hot-cold cycle. It needs another plant's steam and the refinery's H₂S.
- **Crossings:**
  - EV: Mars ice from the tripod, and steam from the combined-cycle plant and hot strip mill, which refuse to void it.
  - HV: the refinery's H₂S.
  - IV: the reactor and the tritium removal facility.
  - LuV: deuterium for fusion.
- **Risks:**
  - A non-consumed fluid input from KubeJS (`notConsumableFluid`) was proven on the bench by IV-A5: the plant refuses to start below 1,000 mB of H₂S, never drains it, and takes it once under overclock. No run-start check is needed.
  - LuV's D-T fusion burns 125 mB of D every 16 ticks, so LuV needs a bigger source (Saturn, as `journey.md` says).
- **Source and licence:**
  - Real: the Girdler sulfide process (Spevack, 1943; Savannah River, 1952; Bruce Heavy Water Plant), with vacuum distillation to finish; Vemork's electrolytic enrichment as history.
  - The catalog's "heavy-water tower" (our own idea).
- **As built (IV-A5):**
  - Circuit 1 exchange, circuit 2 finishing; the recipes live in `data/grindless/tables/heavy_water_plant.json`.
  - EU: each step at GTM's own price, summed and spent under the design's caps: exchange 1,907 EU/t × 58 t (110,606 EU), finishing 477 EU/t × 70 t (33,390 EU). Both run on an EV hatch and overclock above it.
  - The depleted water is plain `minecraft:water` (inert; the plant allows voiding); the distilled water is the condensed steam (GTM's 160:1). Any steam works, GTM's boilers' too.
  - Structure: a 3×3×10 cold tower and a 3×3×14 hot tower of inert PTFE casing, a 2×2 titanium pipe bridge, a 1×1×8 tungstensteel vacuum column, 14 part cells in the towers' feet. No dimension condition: it burns nothing.
  - **Yield next to the reactor:** 340 EU, 0.025 ice and 40 mB of steam per mB of heavy water. A full heavy-water reactor needs 3,600 mB an hour: 90 ice an hour (9 with the tritium removal facility), 17 EU/t on average, 79 s of one plant an hour.

#### Venus acid works: `gtceu:venus_acid_works`, type `gtceu:acid_cracking` (Venus)

- **What it gains:** a recipe that exists only on Venus. It makes water and oxygen from the clouds, and the planet's 737 K does the acid's dehydration step. The base stops needing shipped water for the pressurized drill's heat tax and for the heat engine.
- **Recipe** (`.dimension('gcyr:venus')`):
  - In: 1,000 mB sulfuric acid (GTM's gas collector, cloud recipe) + a platinum gauze (`grindless:platinum_gauze`, 0.1 % wear *(tune)*).
  - Out: 1,000 mB distilled water + 1,000 mB O₂ (+ 1,000 mB SO₂, see byproducts).
  - The stoichiometry is GTM's `sulfur_trioxide` and `sulfuric_acid_from_trioxide` run backwards.
  - The EU is that of `electrolyzer/distilled_water_electrolysis` (45,000 EU per 1,000 mB): cracking the acid costs what splitting water costs. 7,680 EU/t for 6 t is about 46,080 EU. There is no discount: Venus's heat is the recipe's condition, not a price cut.
- **Byproducts:**
  - Water goes to the drill, the heat engine and the network.
  - O₂ goes to the IV oxygen spreader and the suits; the surplus goes home as LOX.
  - SO₂, in circuit 1, goes back into the Venusian air inside the recipe. It is Venus's own gas: below the clouds the planet does this same decomposition.
  - SO₂, in circuit 2, is kept in a hatch (voiding refused) for GTM's chemical reactor at home: sulfur trioxide, then sulfuric acid. (The LV sulfide roaster takes no SO₂ as an input, so it is not the destination; IV-B1.)
  - Which circuit the base uses is a decision to take.
- **Structure:**
  - a 5×5 hot plate of Venusian regolith casing (the site casing) on the ground;
  - a 3×3×6 bayonet decomposer of titanium pipe casings, with the gauze inside;
  - a 3×3×10 condenser stack with heat vents beside it.
  
  Parts go at the edge of the plate.
- **Controller:** IV hull + IV chemical reactor + IV fluid heater + 2 platinum gauzes + 4 IV circuits.
- **Why it is not a big cube:** a plate, a decomposer and a stack. It works only on Venus and is fed by a collector up in the clouds.
- **Crossings:**
  - GTM's gas collector (Venus recipes);
  - EV: the platinum plant (gauze) and the Moon's cryogenic plant (LOX);
  - LV: GTM's chemical reactor turns the kept SO₂ into sulfur trioxide and sulfuric acid (circuit 2);
  - IV: the pressurized drill and heat engine.
- **Risks:**
  - AE2 moves water for free, so the gain is the site recipe and the oxygen, like the regolith cell's.
  - The gas collector's altitude condition was verified on the bench by IV-B1: the cloud base is Y 240 (*tune*); CO₂ on circuit 4 below it and sulfuric acid on circuit 5 at or above it, 1,024 EU/t, 10,000 mB per 10 s. The ground at the Venus band sits at Y 156–161.
- **Source and licence:**
  - Real: Venus cloud ISRU (Mogul et al., *JGR Planets* 2025; Landis, "Colonization of Venus", 2003); the acid decomposition section of the sulfur–iodine cycle (General Atomics) and the hybrid sulfur cycle (Westinghouse); Sandia's bayonet decomposer.
  - The catalog's cloud harvester (GTL's Venus acid): idea only.
- **As built (IV-B1):** 7,500 EU/t for 6 ticks, GTM's 45,000 EU per 1,000 mB electrolysis; the gauze wears 0.1 %. Mode 2 is marked by the recipe data `grindless_keep_fluids`, and only it refuses fluid voiding (`lib/no_voiding.js`). The condenser stands beside the 5×5 plate on its own regolith footing (8 × 11 × 5 in all). All the Venus figures live in `data/grindless/tables/venus.json`.

#### Fluorspar kiln: `gtceu:fluorspar_kiln`, type `gtceu:fluorspar_digestion` (Earth)

- **What it gains:** the pack's only fluorine route that is not silicate electrolysis.
  - The naquadah plant uses about 40,500 mB of F per 2 naquadah. GT--'s live chain was checked in the dump: 42,000 mB HF in and 1,500 back through `titanium_trifluoride_separation`.
  - Today's sources are electrolyses: mica (19 dust → 2,000 mB F), lepidolite (20 → 2,000), topaz (10 → 1,000), pyrochlore (11 → 1,000) and biotite (22 → 2,000).
  - That means about 385 mica dust per 2 naquadah, a wall of raw quantity (rule 2). The kiln turns it into a line (decision 10, the fluorine budget).
- **Recipe:**
  - In: 3 fluorite dust (`gcyr:fluorite`, CaF₂) + 1,000 mB sulfuric acid + 2,000 mB water (the quench that turns the anhydrite into gypsum).
  - Out: 2,000 mB HF + 8 gypsum dust (one CaSO₄·2H₂O in GTM's units; GTM's apatite attack gives 8 per 1,000 mB of acid and takes 2,000 mB of water).
  - EU: 30 EU/t for 64 ticks per charge (1,920 EU), the apatite attack's own figures (`phosphoric_acid_from_apatite`); up to 256 charges at once with no overclock, so one IV hatch draws 7,680 EU/t at full feed.
  - About 61 fluorite then replace the 385 mica per 2 naquadah.
- **Fluorite source:** a new Earth vein of fluorite, barite, galena and sphalerite (a Mississippi Valley-type deposit), drilled by the existing drills from steam on (IV-A1). Fluorite shows in EMI from then on: nothing uses it before the kiln, and it is inert (it can be voided until IV).
- **Byproducts:**
  - Gypsum goes to GTM's concrete (`mixer/concrete_from_calcite`) and from there to the radiation-proof casing of the reactor and the hot cell.
  - HF goes to the naquadah plant, the UF₆ and PTFE.
  - Unreacted fluorite goes back to the feed.
- **Structure:** a 3×3×13 rotary kiln of heatproof machine casing on 3 roller stands (steel frames), turned by a gearbox, with a 3×3×6 HF scrubber and condenser of inert machine casing at its hot end.
- **Controller:** IV hull + IV electric furnace + IV chemical reactor + 2 IV pumps + 4 IV circuits.
- **Why it is not a big cube:** a long kiln and a tower. It needs a new ore and LV's acid.
- **Crossings:**
  - LV: the roaster's acid (or Venus's);
  - Steam and LV: the vein's galena and sphalerite;
  - IV: the naquadah plant, the UF₆, and the reactor's casing through concrete.
- **Risks:**
  - A new vein (it generates only in new chunks; the drill recipes appear at once) and the hidden-items table.
  - GCYR's fluorite gives CaF₂ components, so GTM gave it an automatic electrolysis (3 dust → Ca + 2,000 mB F₂ at 30 EU/t); IV-A1 disabled its decomposition, so the kiln is the only fluorine route from fluorite.
- **Source and licence:** real: industrial HF from fluorspar and sulfuric acid in rotary kilns at about 200–250 °C. GCYR 0.2.9's fluorite material (LGPL-3.0).
- **As built (IV-A6):**
  - One recipe, `grindless:fluorspar_digestion/hydrofluoric_acid_from_fluorite`. CaF₂ + H₂SO₄ + 2 H₂O → CaSO₄·2H₂O + 2 HF balances: GTM's electrolysis of 8 gypsum gives back exactly a charge's calcium, sulfur and water.
  - Charges in parallel, not overclock: as many as the inputs, the room and the hatches allow, up to 256, each at the recipe's EU/t and duration, so a charge always costs 1,920 EU. It is our drills' `bores` pattern without the overclock step; the fluorite supply is the real limit.
  - Fluid voiding is refused (the scrubber keeps the HF); item voiding is allowed (gypsum is inert). No dimension condition.
  - Structure: 4 × 6 × 16, 170 blocks: the scrubber (inert casing with PTFE pipe packing), the kiln (a heatproof casing ring round an air bore, roller stands of steel frames, a steel gearbox drive) and the feed head with the controller at the cold end (1–4 input hatches for the acid and the water). The controller is a crafting-grid recipe.
  - Balance: 20 charges (60 fluorite, 40,000 mB water) give one LEU enrichment's 40,000 mB HF and 160 gypsum (about 140 radiation-proof casings' worth of concrete); about 61 fluorite give the naquadah plant's fluorine for 2 naquadah, against about 385 mica.

#### Uranium in-situ leach field: `gtceu:isr_wellfield`, type `gtceu:in_situ_leaching` (the End)

- **What it gains:** uranium with no drill bit and no crushing: a leaching solution dissolves it in place. It replaces step 2 of `iv.md`'s route (the Tungstensteel bit in the older drills), which the family veto blocks (`iv.md`'s last section).
- **Recipe** (`.dimension('minecraft:the_end')`):
  - In: the pitchblende vein sample (not consumed) + 100 mB sulfuric acid + 50 mB O₂ + an ion-exchange resin (`grindless:ion_exchange_resin`, 1 % wear *(tune)*).
  - Out: 2 uraninite dust + `gtnn:radioactive_waste` at 1 % (the radium in the eluate).
  - EU: the ore plant's pitchblende run (`grindless:ore_processing/mv/pitchblende_water`, 39,200 EU) + one bore of the HV drill *(tune)*.
- **Byproducts:**
  - Thorium and lead stay in the ground: the solution does not take them.
  - The barren solution is re-injected inside the recipe; that is the 100 mB loss.
  - The radium sludge goes to the hot cell's store and is contained.
- **Structure:** a 7×7 five-spot pattern: four injection wellheads at the corners and one production wellhead in the middle, as tungstensteel pipe columns that go 3 blocks into the ground, and a header house with two ion-exchange columns on one side.
- **Controller:** IV hull + HV fluid drilling rig controller + 2 IV pumps + IV chemical bath + 4 IV circuits.
- **Why it is not a big cube:** a flat pattern of wells. It works by chemistry, not with a bit.
- **Crossings:** MV (the End vein), LV (the acid), Earth or the Moon (the O₂), and IV (the hot cell and the reactor).
- **Risks:**
  - Decision 2 picked the leach field as uranium's only route: no drill takes the vein.
  - The resin needs a recipe (GTM has no polystyrene; styrene + sulfuric acid, *(tune)*).
- **Source and licence:** real: in-situ recovery of uranium, about 55–56 % of the world's mine output in 2022–24 (World Nuclear Association), with the five-spot pattern, ion exchange and peroxide yellowcake.
- **As built (IV-A4):**
  - The recipe as designed, one per vein of `veins_leach.json`, End only: the sample (not consumed), 100 mB acid, 50 mB oxygen and the resin (1 %) give 2 uraninite and contained waste (1 %). The EU is the ore plant's pitchblende run plus one HV bore, 40,800 a batch, spent at IV (6 ticks at 6,800 EU/t). A batch is fast: throughput is bounded by acid, oxygen and resin, and one field outruns any number of reactors.
  - The five wells are real pattern rows three blocks deep: the player digs five 3-deep holes. Outside the End the controller says why it does not run.
  - Voiding is refused with `lib/no_voiding.js`, in the modifier and in `beforeWorking`. The second matters: GTM 7.5.3 restarts an idle machine's cached recipe without calling the modifier, and with voiding on its start check skips the room for the voided outputs.
  - The resin is IV-A1's sulfonated polystyrene (a cation resin); real acid ISR uses strong-base anion resins, and the recipe can change if realism matters.
  - All the figures live in `data/grindless/tables/uranium_cycle.json`, with each energy stage naming its source.

#### Mercury solar works: `gtceu:mercury_solar_works`, type `gtceu:solar_processing` (Mercury)

- **What it gains:** Mercury's site workshop, as the regolith cell is the Moon's: recipes that only exist under concentrated sunlight and free vacuum.
- **Recipes** (`.dimension('gcyr:mercury')`):
  1. **Solar sintering:** 16 Hermean regolith dust (`gtceu:hermean_regolith_dust`, macerated GCYR `mercury_cobblestone` or `mercury_rock`) → 4 heat-shield bricks (`grindless:hermean_heat_shield_brick`), the casing of the Mercury drill, the solar field and the interferometer. The EU is the electric furnace's 48,000 per brick, as in EV.
  2. **Thin-film panels (vacuum evaporation):** 1 gallium arsenide dust + 1 silicon wafer + tempered glass + a tungsten steel frame → 1 Hermean thin-film panel (`grindless:hermean_thin_film_panel`). It is the Mercury field's panel and the step after EV's Solar Wing Panel (48,000 EU in the HV assembler) *(tune)*.
  3. **Iridosmine fusion (optional):** the input step of the platinum plant's mode 3, moved to the site. 10 iridosmine + 10 saltpeter + 1,000 mB salt water → rarest metal mixture + steam, at the figures of GT--'s `rarest_metal_residue` (775 K, 120 EU/t for 200 t).
  - **Sun rule:** a run that starts by day pays 0.25 of the EU/t, with a run-start modifier like the tripod's wings: cheaper, never faster *(tune)*.
- **Byproducts:** slag is inert and dumped; the steam goes to a turbine or is vented (inert); the mixture goes home.
- **Structure:** 8 heliostat mirrors on frames around a 3×3×3 focal furnace on a pad of the bricks, with a 3×3 glass evaporation bell beside it.
- **Controller:** IV hull + heliostat tower controller (LV, ours) + IV electric furnace + IV assembler + 4 IV circuits.
- **Why it is not a big cube:** a mirror field around a focus. It works only on Mercury.
- **Crossings:**
  - LV: the heliostat family, the Nether's saltpeter and the GaAs line;
  - EV: the Solar Wing Panel;
  - IV: the naquadah activator's gallium (to GaAs), and Mercury's iridosmine (to the platinum plant).
- **Risks:**
  - The sintering alone would be a furnace recipe with a dimension, which is convenience: the panels are what make it ours.
  - GCYR's Mercury has a day and night cycle (IV-A1 read its dimension type), so the sun rule works as written.
- **Source and licence:**
  - Real: DLR and ESA's solar sintering of lunar regolith (2017); the Odeillo solar furnace; solar cells evaporated in place on the Moon (Ignatiev and Freundlich, NASA); the Wake Shield Facility (1994–96).
  - The catalog's solar foundry (Supersymmetry's solar furnace, GPL): idea only.

#### Tritium removal facility: `gtceu:tritium_removal_facility`, type `gtceu:detritiation` (Moon)

- **What it gains:** it gives the reactor's activated moderator a destination that keeps it contained, recycles the heavy water and turns tritium into a product.
- **Reactor change:** with heavy water, an LEU or MOX core turns 5 mB of heavy water into 5 mB of tritiated heavy water (`gtceu:tritiated_heavy_water`, radioactive, voiding refused), instead of 5 mB of tritium.
- **Recipe** (`.dimension('gcyr:luna')`):
  - In: 1,000 mB tritiated heavy water, with a 100 mB deuterium charge in an input hatch (the exchange carrier: GTM's non-consumed fluid input, needed to start and never drained).
  - Out: 900 mB heavy water + 200 mB tritium.
  - EU: GTM's `centrifuge/deuterium_separation` per mB of tritium (12,800 EU per 40 mB, so 320 EU/mB: 64,000) + liquefying the 100 mB carrier at the vacuum freezer's 460,800 EU per 1,000 mB (1,920 EU/t for 240 t): 46,080 = 110,080 EU, spent as 6,880 EU/t for 16 ticks.
  - At night, with the radiators seeing the sky, it costs half: 3,440 EU/t (55,040 EU), the cryogenic plant's run-start rule.
- **Byproducts:**
  - The heavy water goes back to the reactor. At full power the make-up drops from 3,600 to 360 mB/h.
  - The tritium is stored for LuV fusion (voiding refused): 720 mB/h from a full heavy-water reactor.
  - The deuterium charge stays in the facility.
- **Structure:** a 3×3×12 frost-proof cold box on sintered regolith, two 1×1×6 catalytic exchange columns of titanium pipe casing, and two 2×3 wings of Night-Sky Radiators. Parts go in the lowest ring.
- **Controller:** IV hull + cryogenic plant controller + **EV** electrolyzer (GTM's IV one needs Mercury's osmium) + 2 IV pumps + 4 IV circuits.
- **Why it is not a big cube:** columns, a cold box and radiator wings. It works only on the Moon, takes the reactor's water and gives it back.
- **Crossings:**
  - EV: the Moon base's radiators, brick and night rule;
  - IV: the reactor and the heavy-water plant;
  - LuV: the tritium.
- **Risks:** tritium is cheap through GTM's `deuterium_separation` (160 mB D → 40 mB T at 80 EU/t) and still leaks from liquid ender air. Decision 4 settles both: tritium comes only through this facility.
- **Source and licence:** real: the Darlington Tritium Removal Facility (Ontario Hydro, 1990: vapour-phase catalytic exchange, cryogenic distillation, tritium stored on titanium) and ITER's isotope separation system.
- **As built (IV-B4):**
  - One recipe, `grindless:detritiation/tritiated_heavy_water`, Moon only; off the Moon it forms and the controller says it only works there.
  - The night price is a run-start modifier: a run keeps the price it started with (all 12 radiators must see the sky). A run restarted from GTM's cache keeps the previous run's price, which only matters if new feed arrives in the very tick a run ends; the cryogenic plant behaves the same.
  - Fluid voiding is refused with `lib/no_voiding.js`, in the modifier and in `beforeWorking`.
  - Structure: 7 × 13 × 3, 143 blocks; parts in the cold box's lowest ring (1–2 energy, 1–2 input and 1–2 output hatches). The facility works 58 ticks an hour behind a full reactor.

#### Fuel fabrication plant: `gtceu:fuel_fabrication_plant`, type `gtceu:fuel_fabrication` (Earth)

- **What it gains:**
  - Real fuel: UO₂ pellets in Zircaloy tubes, backfilled with helium.
  - It takes the LEU part of the hot cell's mode 2. Fresh LEU needs no hot cell; MOX, the breeder, the RTG pellets and the Pu-Be source stay in the hot cell.
  - It replaces the "TS plate cladding", which makes no physical sense: tungsten absorbs neutrons.
- **Recipes:**
  1. **Pellets:** 1 U-235 + 9 U-238 + 20,000 mB O₂ → 10 LEU pellets (`grindless:leu_pellet`), pressed and then sintered in 500 mB of hydrogen, which comes back. The EU is GTM's forming press plus a 2,000 K EBF stage *(tune)*.
  2. **Zircaloy tube:** 1 Zircaloy ingot (`gtceu:zircaloy`, new: Zr with about 1.5 % Sn as in real Zircaloy-4; the game ratio is *(tune)*) → 2 cladding tubes, by pilgering, at the EU of GTM's small-pipe extrusion for an alloy of that mass.
  3. **Assembly:** 10 pellets + 4 tubes + 100 mB helium → 1 LEU assembly, the reactor's item, at one IV assembler stage.
- **Byproducts:** grinding swarf goes back to the press, tube crops are remelted and the hydrogen loops. Nothing leaves.
- **Structure:** a 3×4×13 line:
  - a pellet press bay;
  - a sintering tunnel with a coil ring;
  - a pilger stand (two gearboxes on a tungsten steel frame bed);
  - a rod-loading glovebox of laminated glass with the helium hatch.
- **Controller:** IV hull + IV forming press + IV extruder + IV assembler + 4 IV circuits.
- **Why it is not a big cube:** a line. It needs the End's zirconium and the Moon's helium.
- **Crossings:**
  - MV: the End's zirconium vein (GTCA's red zircon, then GTM's electrolysis, gives Zr). Zirconium has almost no use today: 6 recipes, all GTCA zirconium carbide in the alloy blast smelter and packing.
  - Steam and LV: tin.
  - EV: the Moon's helium.
  - IV: enrichment and the reactor.
- **Risks:**
  - A new material and a new recipe for `iv.md`'s LEU assembly.
  - GTM has no hafnium, so the "nuclear-grade" zirconium skips the hafnium removal: the documents should say so.
- **Source and licence:** real: Zircaloy (US Naval Reactors, 1950s), cold pilgering of cladding tubes and the helium backfill of light-water fuel rods.
- **As built (IV-A4):** the three recipes of the design on circuits 1–3, their energy from GTM's stages, spent at IV:
  - pellets: ten `form_glass` pressings and the 2,000 K blast stage of UO₂, 456,000 EU; the 500 mB of hydrogen is a non-consumed fluid input (never used up, not an output);
  - tube: the small-pipe extrusion of Zircaloy's mass, 3,822 EU (a 1-tick IV recipe);
  - assembly: one IV assembler stage, 1,536,000 EU.
  - **Balance:** 3.63 M EU per LEU assembly (with the hot cell's enrichment), so the reactor returns 361× in light water and 722× in heavy water. Zirconium keeps up: about 2.5 HV drill runs on the End zircon vein per assembly.

### Reserve

#### Enrichment cascade: `gtceu:enrichment_cascade`, type `gtceu:isotope_enrichment` (Earth). Reserve.

- **What it gains:**
  - It takes the hot cell's mode 1: UF₆ is not a hot-cell material.
  - It adds what one GTM centrifuge cannot do: stripping the tails, set by the cascade's length.
- **Recipe:** composed from GTM's live recipes:
  - `uranium_hexafluoride`: 3 uraninite + 4,000 HF + 2,000 F₂ → 1,000 UF₆ + 2,000 water, 30 EU/t for 200 t;
  - `uranium_hexafluoride_separation`: 100 enriched / 900 depleted, 480 EU/t for 160 t;
  - the two electrolyses, 120 EU/t for 160 t each.
  
  Per 30 uraninite: 1,020,000 EU → 1 U-235 + 9 U-238 + 20,000 mB water + 40,000 mB F₂, against 40,000 mB HF in.
- **Stripping:** the centrifuge rows are counted after the structure forms (2 to 6), the way the lunar array counts panels. Each row above 2 moves 0.025 of the U-238 output into U-235 and pays one more separation stage *(tune)*.
- **Byproducts:**
  - Depleted uranium goes to the MOX and breeder blankets and to radon (hot cell mode 4).
  - F₂ becomes HF again; the water goes to the network.
- **Structure:** a hall 5 wide × 6 high × up to 15 deep: rows of 1×1×4 centrifuge columns on clean machine casing under a UF₆ header.
- **Controller:** IV hull + 2 HV centrifuges + IV electrolyzer + IV chemical reactor + 4 IV circuits.
- **Why it is not a big cube:** its length is its yield.
- **Crossings:** MV (the End's pitchblende), the fluorspar kiln (fluorine), the hot cell and the reactor.
- **Risks:** without the stripping rule it is GCYM's large centrifuge with parallels, which is convenience. The row count needs a modifier.
- **Source and licence:**
  - Real: Zippe-type gas centrifuge cascades (Urenco), and the trade-off between tails assay and separative work.
  - GTM's recipes (LGPL), composed.

#### Superconductor line: `gtceu:superconductor_line`, type `gtceu:superconductor_drawing` (Earth). Reserve.

- **What it gains:** powder-in-tube wire. SmFeAsO dust becomes wire with no hot ingot, and the helium gas goes back to the Moon.
- **Recipe:**
  - In: 4 SmFeAsO dust + 2 silver foil (the sheath) + 2,000 mB liquid helium.
  - Out: 2 quadruple wires + 1,000 mB helium.
  - EU: 17,672,880, the sum of GTM's stages with no discount: 4 EBF runs at 5,200 K (1,920 EU/t for 1,500 t), 4 vacuum freezer runs (7,680 EU/t for 200 t, 500 mB of liquid helium → 250 mB of helium each) and 2 wiremill runs (30 EU/t for 148 t).
- **Byproducts:** the helium gas goes back to the Moon's cryogenic plant; the silver stays in the wire, like a real sheath.
- **Structure:** a 3×4×13 drawing line: dies, a tube furnace with a ring of 5,400 K coils, and a laminated-glass cryostat test bay.
- **Controller:** IV hull + IV wiremill + vacuum freezer controller + IV mixer + 4 IV circuits.
- **Crossings:** EV (Mars's samarium, the Moon's helium) and LV (silver, arsenic).
- **Risks:** it overlaps GCYM's alloy blast smelter (mixer and EBF), mega vacuum freezer and large wiremill, so it is close to convenience.
- **Source and licence:** real: powder-in-tube iron-based superconducting wires (Y. Ma's group at IEE-CAS since 2008; the review in *Supercond. Sci. Technol.* 25, 2012), and the same method for Nb₃Sn, MgB₂ and Bi-2223.

#### Considered and dropped

- **A second reactor** (the GTNH/GT++ liquid fluoride thorium reactor, idea only): it duplicates the fission reactor, and thorium already has GT--'s liquid fuels at LuV and ZPM.
- **A waste repository** (Onkalo): a sink that gains nothing (rule 4).
- **A calutron:** it duplicates the enrichment cascade.
- **A Czochralski puller for the naquadah boule:** EV discarded it (it belongs to LuV's microgravity).
- **Venus CO₂ electrolysis for O₂** (MOXIE-like): the acid works already gives O₂ and water.
- **Venus molten-carbonate CO₂ → carbon:** no exclusive gain, since graphite is plentiful.
- **A spent-fuel cooling pond:** a time sink (rule 2).
- **Leisure's IV multiblocks** (ideas only):
  - the Chemical Energy Devourer, which is convenience;
  - the Heat Exchanger, which is energy from nothing (the GTCA equivalent was removed);
  - the Digestion and Dissolving Tanks, since EV's cascade already separates the rare earths;
  - the 24 "Large X" machines, which are convenience.

### Decisions taken with the raise (orchestrator, 2026-10-25)

1. **The seven above are added**, so IV has 15 multiblocks of ours. The enrichment cascade and the superconductor line stay in reserve: without the stripping rule, the first is convenience, and the second is close to GCYM's machines.
2. **In-situ leaching replaces drilling pitchblende with a Tungstensteel bit.** *Route* step 2 changes: the leach field on the End's pitchblende vein is the uranium source. The home drills get no Tungstensteel-bit recipes, so the family veto needs no exception.
3. **The reactor's heavy water comes out tritiated**, and the tritium removal facility on the Moon recycles it.
4. **Tritium comes only from the reactor, through the facility.** In IV's build, liquid ender air loses its tritium (with the radon and deuterium EV removed), and GTM's `centrifuge/deuterium_separation` is removed. Until then nothing uses tritium (fusion is LuV).
5. **A new Earth vein of fluorite, barite, galena and sphalerite** (Mississippi Valley type) feeds the fluorspar kiln. It generates only in new chunks; the drill recipes appear at once. GCYR's `gcyr:fluorite` is the material.
6. **The Venus acid works has both modes.** Circuit 1 returns the SO₂ to Venus's air (the planet's own gas). Circuit 2 keeps it, refusing voiding, for GTM's chemical reactor at home (sulfur trioxide, then sulfuric acid; IV-B1 found that the LV sulfide roaster takes no SO₂).
7. **Fresh LEU fuel leaves the hot cell** for the fuel fabrication plant: UO₂ pellets in Zircaloy, backfilled with Moon helium. The hot cell keeps enrichment, MOX, the breeder, RTG pellets, the Pu-Be source, reprocessing and radon. The new material is `gtceu:zircaloy`. GTM has no hafnium, so "nuclear-grade" zirconium skips its removal.
8. **The Mercury solar field takes the solar works' thin-film panels**, so it is not a Mercury circuit of the lunar array.
9. **GTM's large miners stay** as world-digging automation of finite ore, on every planet. The site drills remain the infinite source.
10. **Corrections to the design above:**
    - **No Ostwald tower:** EV discarded it, and GTM's LCR makes nitric acid.
    - **No liquid hydrogen in IV** unless a consumer appears (GCYR burns any fuel).
    - **Radon** comes from GTM's `radon_from_uranium_238` and the hot cell. Extended Features' large collector makes ender air, whose radon EV removed.
    - **Heavy water** is a KubeJS GT material, `gtceu:heavy_water` (D₂O, decomposition by electrolysis); the Martian ice is melted in the heavy-water plant.
    - **The fluorine budget:** the hot cell converts HF into F₂ and creates none. The naquadah plant needs about 40,500 mB of fluorine per 2 naquadah, and the fluorspar kiln is its source.
    - **The inner-planets chart:** an IV recipe of the deep space antenna writes `grindless:inner_planets_chart`.
    - **The level 3 rocket:** its parts are GCYR's elite fuel tank and motor (`gcyr:elite_fuel_tank`, `gcyr:elite_rocket_motor`), remade in the IV assembler with tungsten steel and the chart, as EV remade the advanced ones. Verify in `RocketEntity` that they average to tier 3.
    - **`planets.json`:** Venus and Mercury get pair tags and names, and seeds made on site, like Mars's merrillite seed.
    - **The heat engine's water** has a destination: steam to a turbine, or vented as inert. It comes from the acid works.
    - **Test bands** go on from X 9472 in steps of 256, with the same X and Z on each planet. Bands 3072 and 3328 belong to the steam and LV multiblocks.

## As built: shared registrations (IV-A1)

The shared ids of `PACKAGES-IV.md` are registered in `startup_scripts/grindless/iv/foundation.js` and `server_scripts/grindless/iv/foundation.js` and published as `global.grindless.ivFoundation`.

- **Heavy water:** `gtceu:heavy_water`, with no automatic decomposition. Its electrolysis is written by hand at GTM's water numbers (`grindless:electrolyzer/heavy_water_electrolysis`: 1,000 mB → 2,000 mB deuterium + 1,000 mB oxygen, 30 EU/t, 75 s), so "1 ice → 40 mB D₂O → 80 mB D" holds. The concentrate and tritiated heavy water (GTM's radioactive hazard) never decompose.
- **Zircaloy:** `gtceu:zircaloy`, Zircaloy-4 at 63 Zr : 1 Sn: EV mixer, then GTM's EBF at 2,100 K (argon optional) and the vacuum freezer. Zirconium dust comes from GTCA's End zircon; an LEU assembly needs about 2 Zr dust (4 tubes = 2 ingots).
- **Iridosmine and the Mercury vein:** `gtceu:iridosmine`, (Ir,Os), the only iridium and osmium carrier: no decomposition and no ore smelting. Mercury's vein `grindless:iridosmine_vein_mercury` (Y 0–60): iridosmine 3, graphite 2, sulfur 1; sample raw iridosmine + raw graphite. GCYR places Mercury's and Proxima b's ores on the same stone, so the ore block may be either `gtceu:mercury_iridosmine_ore` or `gtceu:proxima_centauri_b_iridosmine_ore`; both drop raw iridosmine, and the drills use raw ores.
- **Naquadah on Venus:** `grindless:naquadah_vein_venus` (Y −40 to 10, under the lava seas): naquadah 7 : plutonium 1; sample raw naquadah + raw plutonium. GTM's End naquadah vein no longer generates, and GCYR's five Venus and Mercury veins are removed.
- **Pitchblende:** GTM's End vein generates as before and gets a sample (`grindless:vein_sample_pitchblende_end`, raw pitchblende + raw uraninite, `veins_leach.json`) that no drill takes: the leach field reads it.
- **Fluorite:** `grindless:fluorite_vein` (Overworld and `grindless:flat`, Y 10–60): fluorite 4, barite 2, galena 1, sphalerite 1; sample raw fluorite + raw barite. Every Earth drill from steam up drills it, and it generates only in chunks made after v0.7.0. GCYR's fluorite has its decomposition disabled. Up to v0.6.1 the hidden table removed its ore chain as junk; the audit now treats it as B IV until a dump has the chain, and then the chain is simply obtainable.
- **Tritium:** only from the reactor through the Moon's removal facility. Liquid ender air no longer gives it and GTM's `deuterium_separation` is removed; until IV-B4 nothing makes it (fusion, its consumer, is LuV), and GTCA's zinc plasma (fusion of copper and tritium) is B LuV.
- **Radiation-proof casing:** GT--'s own IV assembler recipe (6 dense lead plates, a tungsten steel frame and 1,296 mB concrete), unchanged.
- **Ion-exchange resin:** sulfonated polystyrene (styrene + sulfuric acid). Real acid in-situ leaching uses strong-base anion resins; that could become styrene + chloromethane + dimethylamine if realism matters.
- **Productive Bees:** the naquadah, osmium and radioactive combs keep no recipe for good. PB's own EBF recipe for the naquadah bee (osmium bee egg + naquadah block) still exists and is a dead end; IV-B3 removes it.
