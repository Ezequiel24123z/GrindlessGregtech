# Era IV

IV is nuclear and opens the inner planets. Up to EV, power was almost always burned; in IV it is designed. Uranium from the End is enriched in the hot cell and assembled into cores, and the reactor burns them without smoke, breeds plutonium and leaves tritium for fusion. That takes the place of the first fusion reactor, which stays in LuV. With the level 3 rocket and the thermal suit, IV goes to Venus and Mercury at the same time: naquadah comes only from Venus's deep veins, at 90 bar, and iridium and osmium only from Mercury's crust. Both feed LuV. IV also brings the kit for mass production: the assembly line that draws from AE2, the parallel hatch and the GCYM cubes. The user put it this way: "Tungsten, naquadah if it exists, and the first fusion reactor or whatever takes its place. If the player keeps crafting one at a time, the pack is wrong." (translated from Spanish)

IV starts with what EV leaves behind (`ev.md`): an IV hull in Tungstensteel (tungsten only comes from Mars), the automatic lunar base (titanium), the Mars outpost (tungsten, rare earths, ice with deuterium), the platinum plant, the cryogenic plant, the level 2 rocket and the HV suit, the Earth–Moon–Mars quantum bridge, stored Nether Stars from the Wither, Nanoprocessor Supercomputers and a 32,768 EU/t power plant with an EV→IV transformer.

## Route

1. **IV grid and HSS-G.** IV cutter in a cleanroom → HPIC chips → IV hatches (IV hull, 2 W cables, 2 HPIC, IV voltage coil and NaK; two of the same step go up one tier). HSS-G: EV mixer (5 TS + Cr + 2 Mo + V → 9) → 4,200 K EBF with RTM coil → `hssg_coil_block` coil (IV assembler: 8 double HSS-G wires, 8 WC plates and 144 mB of W) → 5,400 K EBF.
2. **Uranium.** With the Tungstensteel drill bit (`grindless:tungsten_steel_drill_bit`, which `ev.md` moves to IV), the home drills open `pitchblende_vein_end`: pitchblende → uraninite, thorium and lead.
3. **Hot cell.** Enrichment (UF₆ in one pass) and radon with the plutonium inside → Quantum Star (Nether Star + 1,250 mB of Rn) → IV field generator (SmFeAsO, with samarium from Mars).
4. **Reactor.** LEU cores with light water; with heavy water from Mars, double the power and tritium. The power plant no longer runs at the limit.
5. **Thermal suit and level 3 rocket.** PBI (IV reactor) → insulating fabrics from GCYR → thermal upgrade for the suit (IV assembler); without it, Venus (737 K) and Mercury (440 K) kill. Level 3 engine and tank in Tungstensteel and the EV antenna chart.
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
- **Cryogenic plant and Ostwald tower.** Liquid Nitrogen (Mercury drill by day), LOX and LH₂ (rocket), HNO₃ (reprocessing).
- **Wither, nano, antenna and AE2.** Nether Stars → Quantum Stars; Nanoprocessor Supercomputers → LuV mainframes; the deep space antenna (`gtceu:deep_space_antenna`) writes the Venus and Mercury chart; the EV network (P2P trunk, power as FE and the pairs the base sets up) is where the IV network grows from.

## Venus and Mercury

- **Level 3 rocket.** GCYR sets Venus and Mercury at level 2, like Mars (verified in the jar); `ev.md` raises them to 3 with a datapack so the Mars rocket cannot reach them. GCYR works out the level as (engine + tank) / 2, and IV makes the two level 3 parts with GCYR's KubeJS plugin (`grindless:iv_rocket_motor` and `grindless:iv_fuel_tank`, to verify): tank = 2 Tungstensteel drums + 6 Kapton K plates + TS frame (what GCYR asked for the advanced one); engine = 4 advanced thrusters + 2 IV motors + 6 Kapton K plates + TS frame. IV assembler, with the antenna chart as catalyst. GCYR's elite tier (ZPM) is left for later.
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
| Iridium and osmium | Mercury iridosmine vein (`gtceu:iridosmine`, new material, to verify) | Mercury drill → platinum plant |
| Uranium, thorium and lead | `pitchblende_vein_end` with a Tungstensteel drill bit; thorium also from Nether beryllium | home drills |
| Heavy Water and deuterium | Mars ice (`ev.md`) | GTM distillation tower (our recipe) |
| Pu-239, tritium, Xe, Kr, Cs and Nd | breeding, moderator and reprocessing | reactor and hot cell |
| Radon | uranium + air, with the plutonium inside; also air from the End | hot cell; Extended Features' large collector |
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
- **Numbers to tune:** an LEU with heavy water gives about 2.6 G EU, against what it costs to build. If it does not balance, the channels go down and the extreme combustion engines complete the power plant.

### Hot cell: `gtceu:hot_cell`

What it gains: **radioactive material never passes through hands, and it makes two recipes that are impossible at small scale.** GTM flags uranium, plutonium, radon and tritium as radioactive; here they enter through buses and leave to the network. The circuit selects the mode. Modes 1 and 4 are composed from the live recipes, with the same energy and yield, like the EV platinum plant; modes 2 and 3 are ours.

1. **Enrichment:** 3 uraninite + 4,000 mB of HF → 0.1 U-235 + 0.9 U-238 + 2,000 mB of water + 4,000 mB of F₂ (steps `uranium_hexafluoride`, `uranium_hexafluoride_separation` and the two electrolyses). The UF₆ does not leave and the fluorine comes back: the hot cell returns more F₂ than it needs.
2. **Fuel:** LEU assemblies (U-235 + U-238 + O₂, with a TS plate cladding), MOX (Pu + U-238) and breeder; RTG pellets (plutonium oxide); Pu-Be neutron source (`grindless:pube_neutron_source`, with Nether beryllium).
3. **Reprocessing** (PUREX): spent fuel + HNO₃ → U-238 and Pu-239 back + Xe, Kr, Cs and Nd + NOₓ for the Ostwald tower + vitrified waste (`gtnn:radioactive_waste`, a GT-- item with no use).
4. **Radon:** U-238 + 10,000 mB of air → 1,000 mB of Rn (`radon_from_uranium_238`). The 8 plutonium ingots that GTM returns as dust stay inside as a catalyst, and the dust → ingot loop is closed.

- **Structure:** radiation-proof casing cells, laminated glass windows and manipulators; 1 or 2 IV hatches; accepts ME.
- **Built with:** IV hull, centrifuge, chemical reactor and IV electrolyzer, 2 IV robot arms and 4 IV circuits.
- **By-products:** F₂ → the HF for the naquadah plant. Xe → enriched naquadah. Kr and Nd → noble gases and magnets. Cs → stored for naquadria (ZPM). Waste → stored contained and never emptied. Thorium → stored; lead → casings.
- **Cut-down option:** without reprocessing or the breeder, the essentials remain: enrichment, LEU and radon.

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
- **Mercury drill** (`gtceu:mercury_vein_drill`): low-profile, under a heat-shield sunshade and with radiators. At night it drills dry and the Tungstensteel drill bit wears out twice as fast; by day it only works with Liquid Nitrogen (verify that GCYR's Mercury has a night; if not, it always needs it). Iridosmine vein.
- **On-site power** (builds on the LV solar mirror tower and the EV lunar solar field, `gtceu:lunar_solar_array`):
  - **Venus heat engine** (`gtceu:venus_heat_engine`): a hot plate on the ground and a 16-block radiator chimney up into the clouds, which is the cold side. With `.dimension('gcyr:venus')`, 200 mB of Distilled Water per 20 s cycle → 8,192 EU/t, by day and by night. Outside Venus there is no such heat.
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

EV leaves the ME P2P tunnel trunk, power as FE with GTM converters (32,768 EU/t crossing) and the pairs the base sets up. IV goes up one step:

- **Two more pairs,** Earth–Venus and Earth–Mercury. Their far half is built there on the first visit, and both sides run with loaded chunks (FTB Chunks).
- **EU without conversion:** EU P2P tunnels (`eup2p`) across the bridge instead of FE with converters, without AE2's tax and at IV amperage (verify that they cross dimensions). Target: 131,072 EU/t crossing. The heat engine sends home what is left over, and the reactor covers Mercury's night.
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
| Heavy water | Mars ice → water (five times more deuterium) → distillation tower (our recipe) → heavy water (`grindless:heavy_water`, verify) → reactor; electrolysis → deuterium | Light water: to the network. O₂: air. Reactor tritium: fusion |
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

- **Startup:** types `fission_core`, `hot_cell` and `naquadah_refining`; machines `fission_reactor`, `hot_cell`, `naquadah_plant`, `pressurized_vein_drill`, `mercury_vein_drill`, `venus_heat_engine`, `mercury_solar_field`, `interferometer` (the multiblocks, with the pattern helper) and `rtg`; material `gtceu:iridosmine` and fluid `grindless:heavy_water` (check whether EV already has it); level 3 engine and tank (GCYR plugin); items for assemblies, spent fuel, RTG pellet, Pu-Be source, site casings and samples; reactor channel modifier.
- **Server:** recipes composed from the live ones (hot cell, modes 1 and 4; naquadah plant; platinum, mode 3) and ours in tables. Veins: `naquadah_vein` to Venus, iridosmine on Mercury, GCYR's veins on Venus and Mercury removed, `veins_venus.json` and `veins_mercury.json`, and pitchblende with the Tungstensteel drill bit. Platline without Ir/Os, bees removed, and dimension, altitude and night conditions.
- **Config:** nothing new. Venus and Mercury go into EV's planet table.
- **Tests:** (1) it starts; (2) reactor, hot cell and naquadah plant form and process (plant and IV multiblock strips); (3) on Venus and Mercury (new strips after EV's: Venus X 3072–3135 and Mercury X 3328–3391, Y 98–112) the drills, heat engine and solar field form and only work there, and the level 3 rocket arrives; and `-Tier iv` with no orphans.

## Risks and open questions

- **Fission in KubeJS.** The multiblock generator, the 16 A dynamo hatches and the channel parallel are untested, and the EU balance per assembly is ours. Plan B: the extreme combustion engines carry the power plant.
- **The GT-- line.** Composing the activator without its window, the cleanroom step of mode 2 and the antimony and fluorine use. Plan B: mode 1 only, or the loose line with the activator.
- **GCYR on Venus and Mercury.** The heat and the thermal upgrade, the level 3 parts through the KubeJS plugin, the launch and dimension-change failures (#91 and #122), moving veins and removing GCYR's, and knowing whether Mercury has a night. It must be tested in an actual game before IV is closed.
- **Iridium and osmium only from Mercury.** The new material and the platline cut change EV's platinum plant. Plan B: GTM's iridium and osmium ores in the vein and the ore plant, without mode 3.
- **Five loaded worlds.** Bases with loaded chunks on the Moon, Mars, Venus and Mercury, plus EU P2P between dimensions: watch the TPS with spark.

Credits to note in `CREDITS.md`: designed-core reactor (Grindless campaign, T5, MIT, from the user; real physics: PWR, CANDU, MOX and breeders); hot cell (idea from Gregicality legacy's PUREX, idea only; real physics); naquadah plant (GT--'s live line, license to be checked; GTNH idea); iridosmine, Venus heat engine, RTG and interferometer (real physics and history: Sagittarius A*, 1974); suit and rockets (GCYR, LGPL-3.0); solar smelting and prospecting satellite as deferred alternatives.

## Proposed decisions

1. **IV is the nuclear era.** Our fission reactor, with designed cores, takes the place of the first fusion, which stays in LuV (GTM's). The extreme combustion engines remain as the alternative. It replaces the previous version's power plant of 4 extreme engines.
2. **Three new multiblocks:** reactor, hot cell and naquadah plant. The plant reads GT--'s live recipes and swaps the activator's window for a Pu-Be source; its mode 2 (enriched) is a LuV recipe with two IV hatches.
3. **Family steps:** pressurized drill (Venus, and Mars with dust filters) and Mercury drill (night side), with a Tungstensteel drill bit and a cap of 128; Venus heat engine and Mercury solar field; RTG cell; interferometer; and the platinum plant's mode 3. At home there is no IV drill: the Tungstensteel drill bit opens the pitchblende in the older drills.
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

- **The fission reactor depends on KubeJS generators.** This was checked on 2026-10-25: a KubeJS generator multiblock outputs EU through dynamo hatches on GTM 7.5.3 (`lib/generators.js`, run `a3-power-generators-run2`). What is still unproven is a custom generator recipe type of ours. The EV lunar solar array is the first one; if it fails, the reactor feeds steam to GTM's large turbines: same place on the route, different output.
- **The `iridosmine` material is registered with KubeJS** (`gtceu:iridosmine`) and only appears in Mercury's vein table. The validator checks that iridium and osmium do not come out on Earth.
- **`journey.md` is adjusted.** In the IV row, solar smelting moves to plan B, the prospecting satellite moves to LuV, and the reactor, hot cell and naquadah plant come in.
- **IV is built after EV.** This document is the guide until then.
