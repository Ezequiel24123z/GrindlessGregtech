# EV era

EV is titanium, platinum and fine chemistry. Here multiblocks become the normal way to produce. Recipes reach 1,920 EU/t, they need acids, gases and a cleanroom at the same time, and the standalone machine falls short. Titanium only comes from the Moon, so EV's first job is to make the lunar base work on its own and connected to home: a tripod drill, a solar array that powers it, a cell that extracts oxygen from regolith and Titanium from Ilmenite without chlorine, and a plant that liquefies gases with the lunar cold, all linked by AE2. On Earth, the platinum plant closes out fine chemistry, and nano circuits are the wall. At the end, an antenna on the far side of the Moon charts the route to **Mars**, the only place with tungsten. Without it there is no Tungsten Steel and no IV. EV brings together seven of our multiblocks (six new ones and the platinum plant), four family steps and the GTM ones. That makes eleven of ours, the ×1.35 target of rule 7 in `AGENTS.md` (see *Raising EV to the target*).

You enter EV with what HV's end leaves you. On Earth: EV hull of lunar Titanium, an 8,192 EU/t power station, cleanroom, freezer, tower, large chemical reactor and an AE2 network with 256k. On the Moon: the tier 1 rocket, the suit, the lunar drill, the stored Helium-3, the Waystones and the first Earth–Moon AE2 bridge.

## Route

1. **EV network.** HV→EV transformer, buffers and EV hatches (the 4, 16 and 64 A ones start here). Large gas turbines (`gtceu:gas_large_turbine`: EV hull, 2 EV circuits, 4 gears and 2 large Stainless Steel pipes; 4,096 EU/t with the rotor at 100%) running on refinery gas, and large Titanium boilers, up to the gate's 32,768 EU/t.
2. **ME hatches.** `gtceu:me_input_bus`, `me_output_bus`, `me_input_hatch` and `me_output_hatch` (EV; the stocking ones and the pattern buffer are LuV). Each multiblock requests from the network and returns to it, on the Moon too.
3. **Moon base I.** Lunar solar array and buffers. The EV tripod replaces HV's lunar drill and sends Ilmenite home through an ME bus.
4. **Moon base II.** Regolith cell (volatiles, O₂ and metals from the regolith, chlorine-free Titanium from the Ilmenite, and the sintered brick for lunar structures) and cryogenic plant (liquid oxygen, nitrogen and helium, using the cold of the lunar night).
5. **Interplanetary network.** P2P tunnel trunk, power over the bridge, and new pairs with no trip (see *The AE2 network*).
6. **Fine chemistry.** Nitric Acid in one step (`nitric_acid_from_elements`, large chemical reactor), HCl and the nitration mix from GT--'s platinum line (verify id). The metal mixture is separated in the EV centrifuge (900 EU/t), now without Ilmenite.
7. **Platinum.** Platinum plant: sulfide ores → Pt, Pd, Rh and Ru, with the closed loops inside.
8. **Nano circuits.** Phosphorus boule (EBF, 2,484 K) → wafers → NOR chips; nano wafer (CPU wafer + 16 carbon fibers + 576 mB of Glowstone, EV reactor, cleanroom) → nano computer (`gtceu:nano_processor_computer`). It is the wall.
9. **The wither.** Wither Skeleton model (HV) → wither (EV): Nether Star, which is saved for IV.
10. **The route to Mars.** Deep space antenna (Moon) → Mars chart → tier 2 rocket with Titanium parts.
11. **Mars, by hand.** First visit by rocket: waystone, 2 ores per vein and the Martian half of the bridge. Then the atmosphere processor and the Martian tripod.
12. **Tungsten and the way out.** Scheelite from Mars → Tungsten → Tungsten Steel and RTM coil, and the *Gate to IV*.

## Inherited from HV

All of this arrives already done in the end-of-HV version:

- **Tier 1 rocket.** GCYR's basic parts with Stainless Steel and Kapton K; rocket pad and scanner in HV. It flies the lunar kit up; Mars needs tier 2.
- **Spacesuit.** The HV one, with 16 buckets of O₂ in the chestplate (about 40 minutes). GCYR sets its limit at 60 to 363 K: it works for the Moon (113 K) and Mars (208 K), not for Venus or Mercury.
- **Lunar drill.** It only drills on the Moon. EV swaps it for the tripod and uses it in the tripod's recipe.
- **Titanium.** The first Titanium comes out of the Kroll on Earth, using lunar Ilmenite (Mg/Cl₂ loop and freezer). EV spends it on hulls, casings, pipes and drums; the cell makes it later on the Moon.
- **Helium-3.** It is saved for fusion; the cell adds its own. In EV only the quantum seeds spend it: 250 mB per lunar or Martian seed.
- **Waystones and FTB /home.** After the first visit, people travel for free. On Mars, the first-visit waystone is the way back.
- **Earth–Moon AE2 bridge.** One pair, with one half built at each end; it carries items and fluids. EV turns it into a trunk.
- **The rest:** refinery and reformer, cleanroom, freezer, tower, large chemical reactor with PTFE, nichrome coil, the End veins (now MV, with their Platinum) and the HV drill (cap 32, Stainless Steel bit).

## The Moon base

In EV the Moon goes from a place you visit to a factory that runs on its own. Its machines only produce there: all their recipes carry `.dimension('gcyr:luna')`, and their structures require sintered regolith brick, which is only made on the Moon. They can be built elsewhere, but they will not work.

### Moon rules

- **Vacuum: nothing burns.** Fuels for generators, gas turbines and large boilers carry `.dimension('gcyr:luna', true)` (small boilers do not use recipes: verify).
- **Cold: cheap cryogenics.** The cryogenic plant dumps heat into the black sky: at night it liquefies at half the energy of GTM's freezer.
- **Light ×1.4, daytime only.** Solar power by day; at night, buffers or Earth through the bridge.
- **No liquid water: no mud.** The tripod drills dry (the bit wears out twice as fast) or cooled with Liquid Nitrogen.

### The AE2 network: EV step

AE2 is the backbone between planets (the user's decision), and improving it is a goal of this era.

- **Starting point.** HV left an Earth–Moon pair: a quantum bridge that joins the two networks into one (32 channels and shared AE2 energy).
- **ME hatches on the Moon.** The tripod, cell and cryogenic plant request from and deliver to the home network: Titanium reaches Earth without anyone moving it.
- **Trunk.** ME P2P tunnels over the bridge (32 channels each): the Moon base has a full network without more pairs.
- **Power** (measured on 2026-10-25, run `20261025-055851-ae2-interplanetary`).
  - **Main route:** EU P2P tunnels (`eup2p`, available since LV) carry 32,768 EU/t per pair across the bridge with no converters. FE P2P with GTM's 16 A EV converters (`gtceu:ev_16a_energy_converter`) carries the same, and stays for FE devices.
  - **AE2's toll** is the same for both: 2.5% of the energy, paid in AE (0.05 AE per EU, 1,638.4 AE/t at full rate). It never blocks a transfer, but an unpowered network stops the tunnels.
  - **Bridge upkeep:** 22 AE/t per bridge block, about 405 AE/t for a linked pair with its tunnels.
  - Earth covers the lunar night, and the daytime solar surplus flows home.
- **Trunk:** an ME P2P pair uses 1 of the bridge's 32 channels and carries 32.
- **Pairs without travel.** The base builds the lunar half of each new pair itself (with a cell part; it matches the HV recipe), so the network grows on its own.
- **Mars.** The first Earth–Mars pair comes at the end of the era. Its Martian half is the Martian Quantum Seed (`grindless:martian_quantum_seed`), which is made only on Mars: chemical reactor, merrillite dust + ender pearl + 250 mB helium-3. AE2's ritual then marks the pair for Mars. No charged energy cell is needed: AE2 links quantum bridges without power, and the linked halves run on home's energy.
- **Goal of the era:** a second Earth–Moon pair built by the base, a trunk of 64 channels or more, 32,768 EU/t crossing, and the Mars pair.

## Mars, end of EV

- **How to get there.** Mars requires a tier 2 rocket (`rocket_tier` 2 on its GCYR planet, which works out the tier as (engine + tank) / 2). GCYR makes the advanced tank and engine in IV with Tungsten Steel, which comes from Mars: impossible. They are remade in EV with Titanium: tank = 2 Titanium drums (`gtceu:titanium_drum`) + 6 Kapton K plates + Titanium Frame; engine = 4 advanced thrusters (`gtceu:advanced_power_thruster`, HV motor) + 6 Kapton K plates + Titanium Frame. EV Assembler, with the Mars chart as catalyst. Fuel: 14 buckets, whichever fuel (GCYR asks for the same from Earth as from the Moon).
- **The first visit, by hand.** Outbound by rocket with the kit in your backpack: waystone, parts for the Martian half of the bridge, a charged AE2 energy cell, sintered brick footings, and the tripod and processor controllers. There: the waystone (the return trip is through it), 2 ores from each vein for samples (ice too: verify that Mars generates it) and the bridge.
- **What gets built first.** The bridge (power and parts come from home), the atmosphere processor (O₂ for the suit and methane, run on the site's power) and the tripod with the samples. From there, the Scheelite comes down on its own.
- **What only Mars gives.** Tungsten (Scheelite and Tungstate), rare earths (a material of its own with ore, made in KubeJS, that yields Samarium; Neodymium stays in the Nether because the EV motor calls for it from HV) and ice with about five times more Deuterium than Earth's water, which IV turns into Heavy Water. `veins_mars.json` has only those three veins, and only they generate in the Mars world: GCYR's iron, nickel, copper and zinc veins are removed (Mars is not "more of the same").
- **Mars rules.** Thin air of CO₂ with no O₂: combustion only works with oxygen (methalox = methane + O₂ in the mixer, burned in a gas turbine with `.dimension('gcyr:mars')`; other fuels get the inverse). Light ×0.43: solar barely produces. 0.38 g and 208 K: the HV suit is enough. Dust and pressurized equipment are IV.

## Automatic resource generation

### EV tripod: `gtceu:ev_vein_drill` (Moon and Mars)

- **New shape and parts.** Three Titanium Frame legs on sintered brick footings, a stable Titanium casing body raised up high, a Titanium pipe run between the legs, and two solar panel wings. Input bus (bit and sample), 2 output buses (one ME), 1 fluid hatch (Liquid Nitrogen) and 1–2 EV hatches.
- **Registration.** Type `gtceu:vein_drilling`, the spec, the LV-to-HV veto and the scratch code (`ev/family_multis.js`, `bores` with a cap of 64, tested on server): they change the pattern and the bit.
- **Veins.** The lunar ones from HV (`.dimension('gcyr:luna')`) and, at the end, the three Martian ones (`.dimension('gcyr:mars')`). None from Earth: the HV drill still handles that.
- **Rules.** Dry, the bit wears out twice as fast; with 50 mB of Liquid Nitrogen per run, same as with mud. By day, the wings cover half the energy on the Moon and almost none on Mars (modifier by dimension and time; verify that it can lower EU/t).
- **Titanium Drill Bit** (`grindless:titanium_drill_bit`: HV left it registered and hidden for old worlds, with a 1:1 conversion into the Stainless Steel one; in EV it is a drill bit again and the conversion is removed): ~1% per run dry and ~0.25% with Liquid Nitrogen (figures to be tuned). The Titanium it extracts pays for it. The Tungsten Steel one moves to IV.
- **Beats the lunar drill:** cap of 64, direct output home, and it drills Mars. It is crafted with the lunar drill inside, plus an EV hull, 2 motors and 1 EV pump, 2 EV circuits and Titanium plates.

### The rest

- **Earth.** The HV drill still covers the Overworld, Nether and End, and there is no EV drill on Earth (ore is plentiful: the bottleneck is processing). HV fluid drill (EV hull, ×16) for crude and gas. Air, noble gases, chlorine and acids, as in HV.
- **Moon.** The regolith comes out of the tripod (the stone it drops, ground up; verify the material), and the cell converts it into O₂, metals and volatiles; the cryogenic plant liquefies whatever is needed.
- **Mars.** CO₂ from the air, for the processor; the ice goes to the network for IV.
- **Creatures.** `mobs.json` gains two rows (2026-10-25):
  - **Wither skeleton,** at HV: 480 EU/t, 10 s, 100 mB of biomass + 1 tricalcium phosphate, printed from 8 nether bricks + 8 bone blocks. Circuit 1 gives bones, coal and a skull at 10%; circuit 2 gives only the skull.
  - **The wither,** at EV: 1,920 EU/t, 30 s, 400 mB of biomass, printed from 3 wither skeleton skulls. It gives 1 Nether Star per cycle, saved for IV.
- **Closing the loop:** crude, air, salt and Earth ores come from drills; Ilmenite and regolith come from the lunar tripod; Scheelite, rare earths and ice come from the Martian one. The rest is EU.

## Our multiblocks

### Regolith cell: `gtceu:regolith_cell` (Moon, this era's)

What it gains: **recipes that do not exist on Earth.** Oxygen on a world with no air, Titanium without chlorine or magnesium, and the brick the whole Moon base is built from.

- **Recipe type:** `gtceu:regolith_processing` (new, check for an id clash), all with `.dimension('gcyr:luna')`. The circuit picks the mode:
  1. **Volatiles** (circuit 1): heated regolith → He, He-3, H₂, N₂ and some water, in real-world proportion: lots of H₂ and He, a pinch of He-3 (figures to be tuned).
  2. **Electrolysis** (circuit 2): molten regolith → O₂ + Iron + Silicon. With Ilmenite and the electrolyte charge → Titanium ingot + Iron + O₂ (reduction in molten salt, like the FFC process). Energy: the sum of the Kroll stages it replaces (Rutile, TiCl₄, EBF and freezer), with no discount (verify).
  3. **Sintering** (circuit 3): regolith → sintered regolith brick (`grindless:sintered_regolith`). The first ones, which are slow, come from an electric furnace on the Moon under the same condition.
- **Own condition:** platinum anode (`grindless:platinum_electrode`, the one from the platinum plant; the first ones use Platinum from the End), which is used up in ~0.1% of batches, and a CaCl₂ electrolyte charge (`grindless:molten_salt_charge`), which is not used up. The CaCl₂ comes from the Solvay loop on Earth and, at the end, from Tungsten.
- **Structure:** 5×5×4 hall of sintered brick, a crucible of stable Titanium casing with nichrome coils and a tempered glass roof; input bus, output bus, 5 fluid output hatches and 1–2 EV hatches. Accepts ME hatches.
- **Crafted with:** EV hull + EV electrolyzer + EV electric furnace + 2 EV pumps + 4 EV circuits.
- **Why it is not a big cube:** (1) its recipes do not exist on Earth and only run on the Moon; (2) chlorine-free Titanium is a process GTM does not have, and it pays for it with the same energy; (3) it needs anodes from the platinum plant, an electrolyte charge and a destination for each output: if a hatch fills up, it stops.
- **Byproducts:** O₂ and N₂ → cryogenic plant, suit or network. Iron → steel for the base. Silicon → solar array panels. He → cryogenic plant (Liquid Helium for IV). He-3 → fusion reserve. H₂ → home network (refinery). Water: inert, voided.
- **Scaled-back option:** without the Titanium mode, O₂, volatiles and the brick remain; Titanium still comes from Kroll.

### Cryogenic plant: `gtceu:cryogenic_plant` (Moon)

What it gains: **liquids GTM does not make, and the site's cold.** GTM liquefies air, O₂ and helium in the freezer (`liquid_air`, `liquid_oxygen`, `liquid_helium`: 1,920 EU/t, 240 t per bucket for the last two), but it has no Liquid Nitrogen or Liquid Hydrogen. On the Moon, at night, radiators dump heat into a black sky: the plant liquefies several gases in one structure and uses half the energy.

- **Recipe type:** `gtceu:cryogenic_processing` (new, verify id), with `.dimension('gcyr:luna')`. One recipe per gas: O₂ → Liquid Oxygen, He → Liquid Helium, N₂ → Liquid Nitrogen (a new fluid in KubeJS: GTM 7.5.3 does not have it) and H₂ → Liquid Hydrogen (only if IV gives it a use). At night (`.daytime(true)`, verify), half the freezer's energy; by day, the same.
- **Own condition:** the site and the time of day. There is no catalyst: the advantage is the cold.
- **Structure:** 3×3×7 tower of frostproof casing (`gtceu:frostproof_machine_casing`) on sintered brick, with a wing of radiators facing the sky; 2 input hatches, 4 output hatches and 1–2 EV hatches. Accepts ME hatches.
- **Crafted with:** EV hull + GTM Vacuum Freezer + 2 EV pumps + 4 EV circuits.
- **Why it is not a big cube:** it makes a liquid GTM does not have (nitrogen; hydrogen, if IV requires it), it only gains energy from its site and time of day (it does not run on Earth), and each liquid has a named consumer.
- **Destinations:** Liquid Nitrogen → coolant for the tripod (EV) and the Mercury drill (IV). Liquid Oxygen → IV extreme engines (their alternative to fission). Liquid Helium → ingots at 5,000 K or more (IV). Liquid Hydrogen: GCYR asks for 14 buckets of any fuel, so hydrolox only comes in if IV makes it mandatory.

### Atmosphere processor: `gtceu:atmosphere_processor` (Mars)

What it gains: **a recipe that exists only on Mars, and three machines in one.** It takes CO₂ from the air, makes hydrogen from water and combines it with CO₂ (Sabatier): oxygen and methane, the base's oxidizer and fuel. It is the first thing built on Mars after the bridge.

- **Recipe type:** `gtceu:atmosphere_processing` (new, verify id), with `.dimension('gcyr:mars')`. It takes air from outside, like the gas collector. One recipe: water → CH₄ + O₂ (net of electrolysis and Sabatier: CO₂ + 2 H₂O → CH₄ + 2 O₂), using the energy of GTM's two stages (figures to be set).
- **Own condition:** Ruthenium catalyst (`grindless:ruthenium_catalyst`), with Ruthenium from the platinum plant, which is used up by chance.
- **Structure:** 5×5×6 of stable Titanium casing: air intake with dust filters on top, electrolysis stack and reactor; input hatch (water), 2 output hatches (CH₄ and O₂), catalyst bus and 1–2 EV hatches.
- **Crafted with:** EV hull + EV gas collector + EV electrolyzer + EV chemical reactor + 4 EV circuits.
- **Why it is not a big cube:** Martian air only exists there, it combines three machines that GTM has separately, and it crosses two planets (Ruthenium from Earth, water from home).
- **Byproducts:** O₂ → suits and methalox. CH₄ → methalox for the Martian turbines or the home network. The water from the ice, rich in Deuterium, is saved for IV: the processor uses the one from home.

### Platinum plant: `gtceu:platinum_plant` (Earth)

In the pack since 2026-10-25 (`startup_scripts` and `server_scripts/grindless/ev/platinum_plant.js`, `ev_platinum_plant_lang.js`; bench run `20261025-ev-platinum-plant-1`). What it gains: **several steps in one and closed loops.** The live line is GT--'s (GTNH style; it replaces GTM's): about forty recipes in a dozen machines, with dust, ammonia and Ruthenium tetroxide (toxic) loops between them. The plant turns them into five recipes, composed when the world loads.

Per batch:
- **Attack:** 54 ticks at 1,903 EU/t.
- **Platinum:** 2,314 ticks at 1,920 EU/t.
  - Outputs: 6 Pt, 3 Au, 3 SiO₂, 9 CaCl₂, 6 slag.
  - Chanced: Pd metal dust, the rarest mixture, iridium residue.
  - Fluids: Pd-rich ammonia, NO₂, dilute H₂SO₄.
- **Palladium:** 891 ticks at 1,919 EU/t.
- **Rh/Ru:** 517 ticks at 1,920 EU/t.

Per 9 ores: 6 Pt, about 4.2 Pd, about 1.35 Rh and about 4.5 Ru. The CaCl₂ (9 per sludge) is a third source for the regolith cell's molten salt charge, the NO₂ goes back to nitric acid, and the dilute H₂SO₄ goes to the distillery.

- **Type `gtceu:pgm_refining`,** built when the world loads from GT--'s recipes (if they change, it is rebuilt; if any are missing, the log says so). Circuit 1, leach: 9 purified pentlandite or chalcopyrite ores → platinum sludge + Ni or Cu + O₂ + H₂SO₄, with electrolysis inside. Circuit 2, separation: Platinum, Palladium, and Rhodium with Ruthenium. Same proportions and same energy as the standalone line, with no parallels.
- **Condition:** platinum electrode (`grindless:platinum_electrode`, Platinum on Titanium, 0.1%).
- **Structure:** a hall 5 wide × 5 high × 7 deep of inert casing (≥ 24), Titanium pipes and tempered glass; 1–2 EV hatches, 1 input bus and 1 output bus, 3 input hatches and 4 output hatches. Accepts ME hatches.
- **Outputs:** Pt, Pd, Rh, Ru and whatever the standalone line makes, each with a destination. The Ir/Os mixture and the iridium residue are stored (the journey puts Ir and Os on Mercury: see *Decisions*).
- **New with the journey:** its electrodes are the anodes of the lunar cell, and its Ruthenium is the catalyst for the Martian processor and the RTM.

### Family steps

- **Drill:** the EV tripod (above).
- **Power: lunar solar array** (`gtceu:lunar_solar_array`). The next step after LV's mirror tower: no mirrors, no boiler and no water; silicon panels from the cell on Titanium frames over sintered brick, with radiators. A generator with no inputs, daytime only, on the Moon (×1.4) or on Mars (×0.43); power per panel to be tuned. Made like TFG's large solar panel (idea only). At night, buffers and the bridge.
- **Observatory: deep space antenna** (`gtceu:deep_space_antenna`, Moon). Step up from MV's radio telescope: a dish on the far side, safe from Earth's radio noise. With power, it writes the Mars chart onto a `gtceu:data_stick` (`grindless:mars_chart`, catalyst for the tier 2 parts), and its quest opens with the first signal from Sagittarius A\*.
- **Greenhouse: sealed dome** (added on 2026-10-25, see *Raising EV to the target*). The earlier "no EV step" is reversed: the wither needs biomass and the bases need O₂, and the dome grows both without sky.
- **From GTM:** EBF, large chemical reactor, tower, freezer, cleanroom and large turbines, as they are.

### Discarded

- **Ostwald tower:** GTM's large chemical reactor already makes `nitric_acid_from_elements` (N₂ + 3 H₂ + 4 O₂ → HNO₃) in one step at HV, and NOₓ (including from IV reprocessing) returns to nitric acid with `nitric_acid_from_dioxide_1` and `_2`. It would be a big cube.
- **Crystal puller on the Moon** (boules with fewer defects): crystals in microgravity belong to LuV's orbital smelting (`journey.md`), and an EBF with a good coil already runs just as fast.
- **Mass cannon:** AE2 already moves everything between planets; it would be duplicate transport. The idea is kept for when the network hits a limit the cannon could beat.
- **Propellant tank:** evaporation would be a penalty that wastes work; tanks and AE2 store the fluids.
- **EV drill on Earth** (the scratch one, 3×6×3): HV already does the job. Its code moves to the tripod.
- **GCYM cubes and parallel hatch:** IV, as before.

### Raising EV to the target (orchestrator, 2026-10-25)

With 7 multiblocks of ours, EV fell short of the ×1.35 target (rule 7 of `AGENTS.md`: HV has 7, so EV needs 10 or more). Four are added, which makes 11. They were picked from the machine catalog (`docs/research/space/machines-catalog.md`) and Leisure's ideas (`docs/research/leisure.md`). Each one gains something, and each byproduct has a destination. Figures marked *(tune)* are set when the machine is built.

#### Combined-cycle plant: `gtceu:combined_cycle_plant` (Earth)

What it gains: **more energy from the same fuel, through a more complex plant** (rule 8). A gas turbine's exhaust is still hot. A heat-recovery boiler turns that heat into steam for a steam turbine, which is how real combined-cycle plants beat simple turbines.

- **Recipe type:** `gtceu:combined_cycle` (new, check for an id clash), a generator.
  - It takes the fuels of GTM's gas turbine, read when the world loads, like the platinum plant reads GT--'s line.
  - Each fuel gives the same EU per mB as the gas turbine after the ×2 of `power/generators.js`. On top of that, distilled water → steam, worth about +40% of the fuel's EU in a large steam turbine *(tune)*.
- **Own condition:** the steam needs a destination. If its hatch fills up, the plant stops, fuel and all.
- **Structure:** a turbine hall of stable Titanium casing with a heat-recovery boiler of Titanium pipes and firebricks on its back. It has 1 fuel input hatch, 1 water input hatch, 1 steam output hatch and 1–2 EV dynamo hatches. There is no rotor: it is a generator with its own recipes, not a GTM turbine.
- **Crafted with:** EV hull + large gas turbine controller (`gtceu:gas_large_turbine`) + 2 EV pumps + 4 EV circuits.
- **Why it is not a big cube:** it only gains if a second plant (the steam turbines) takes its steam, so the energy comes from building more, not from a free bonus.
- **Generator mechanism (resolved 2026-10-25):** it is a KubeJS multiblock that outputs EU, the same mechanism as the lunar solar array. The spike passed: `lib/generators.js` gives EU through dynamo hatches on GTM 7.5.3 (LV generator array, run `a3-power-generators-run2`), so the steam-only fallback is not needed.

#### Hot strip mill: `gtceu:hot_strip_mill` (Earth)

What it gains: **several steps in one, and energy back.** Hot ingots go straight from the EBF to rolled products, without the vacuum freezer and the bender, and the water that cools them comes out as steam. This is real hot rolling.

- **Recipe type:** `gtceu:hot_rolling` (new). Its recipes are generated when the world loads from every GTM material with a hot ingot whose freezer recipe asks only for EU. The ones that need Liquid Helium (5,000 K or more) keep the freezer.
  - The circuit picks the product: plate, rods or foil, at the bender's and extruder's ratios.
  - Energy: the sum of the freezer and the bender, with no discount.
  - Steam per ingot grows with the blast temperature *(tune)*.
- **Own condition:** water in, steam out. If the steam has no destination, it stops.
- **Structure:** a 3×3×9 line of rolling stands. It has stable Titanium casing, steel frames, water sprays and a steam hood, plus an input bus, an output bus, a water hatch, a steam output hatch and 1–2 EV hatches.
- **Crafted with:** EV hull + EV bender + GTM vacuum freezer controller + 2 EV pumps + 4 EV circuits.
- **Why it is not a big cube:** it is a route GTM does not have (no freezer), and it gives back part of the EBF's energy as steam, which needs a turbine.
- **Byproducts:** steam → large steam turbine or the combined-cycle plant's steam line.

#### Sealed dome: `gtceu:sealed_dome` (Moon and Mars, greenhouse family step)

What it gains: **crops where there is no sky, no soil and no air.** LED panels grow plants through the 14-day lunar night, and the plants turn CO₂ into O₂. The idea comes from Leisure's large greenhouse (no sky needed) and the catalog's sealed lunar dome. The physics is real: BIOS-3 and Lunar Palace 1.

- **Recipe type:** `gtceu:greenhouse`, the family's own type. It was checked on 2026-10-25 (run `b8-sealed-dome-2`, on the Moon): neither the type nor any of its old recipes checks sky, daytime or dimension.
  - **Programmed circuit 4 is the sealed mode,** off-world only. Each plant + 100 mB water + 200 mB CO₂ (Moon, `.dimension('gcyr:luna')`), or water alone (Mars, `.dimension('gcyr:mars')`, CO₂ from the air), gives ×3 the base output + 100 mB O₂, at 8 EU/t for 200 ticks. That is the HV greenhouse's best yield, with LEDs and no fertilizer. There are two recipes per plant (86 in all), because the Mars one has no CO₂ input.
  - Circuits 0–3 work as in the HV greenhouse. The cap is 64 runs.
  - Lower greenhouses never run the sealed recipes, which have `/ev/` ids and need circuit 4.
- **CO₂:** on Mars, it comes straight from the outside air, like the gas collector. On the Moon, it comes from home through the bridge. Home sources include the engine test stand's exhaust (MV), which gives that CO₂ a destination two eras later.
- **Structure:** 7×5×7.
  - Two rings of sintered regolith (the hatches plus at least 38 bricks) and a 3×3 soil bed in a brick floor.
  - A tempered glass wall stepping into a 5×5 ring, under a 3×3 cap of GT lamps (the LED panels).
  - An iron door as the airlock, next to the controller.
  - Parts: 1–2 energy hatches, 1 input bus, 1–2 output buses, 1–2 input hatches and 1 output hatch. ME parts fit.
  - On Mars, the brick has to come from the Moon, because only the Moon makes it.
- **Crafted with:** HV greenhouse controller + EV hull + 2 EV pumps + 4 EV circuits, with a wrench.
- **Byproducts:** O₂ → suits, the cryogenic plant or the network. Crops → home, where the brewery turns them into biomass for the wither (400 mB per Nether Star), and food.

#### Rare-earth extraction cascade: `gtceu:extraction_cascade` (Earth)

What it gains: **a separation GTM does not do.** Martian rare earths (the KubeJS material from the Mars vein) only come apart here. Samarium only comes from Mars, because EV removes it from `rare_earth_separation`. Real separation plants work this way, with a long cascade of mixer-settlers and an organic solvent.

- **Recipe type:** `gtceu:solvent_extraction` (built on 2026-10-25, run `b9-extraction-cascade-2`). The circuit picks the mode; both modes are EV recipes at 1,920 EU/t:
  1. **Leach** (circuit 1): 4 merrillite dust + 3,000 mB HCl → 1,000 mB rare-earth chloride solution + 1,000 mB phosphoric acid + 3 tricalcium phosphate, in 40 ticks.
  2. **Extraction** (circuit 2): 1,000 mB solution + 3,000 mB HCl (the strip) + 1,000 mB kerosene → 1 samarium chloride + 1 neodymium chloride + 2 mixed rare-earth chloride + 950 mB kerosene + 6,000 mB diluted HCl, in 200 ticks.
  - GTM 7.5.3 has no rare-earth chlorides, so they are materials of ours. GTM's own electrolyzer decomposition turns each one (4 dust) into its metal + 3,000 mB of chlorine. The mixed chloride gives GTM's rare earth dust, which goes on to GTM's centrifuge.
  - About 1.84 M EU per samarium. The 1:1:2 split and the 95% kerosene return are *(tune)*.
- **Structure:** a 3×3×7 line of mixer-settler stages in inert casing with glass sides: three titanium gearboxes (the mixers) between two settlers, under a PTFE pipe header. Parts: an input bus, an output bus (the chlorides and the phosphate are dusts), 1–3 fluid input hatches, 1–4 fluid output hatches and 1–2 EV hatches. Accepts ME hatches.
- **Crafted with:** EV hull + EV mixer + EV centrifuge + EV chemical reactor + 4 EV circuits, in a crafting table.
- **Why it is not a big cube:** its input exists only on Mars, it crosses three eras (MV kerosene, EV HCl, Mars ore), and it sends Samarium two eras ahead.
- **Byproducts:**
  - Samarium → reserve for the LuV motors' magnets.
  - Neodymium → motors, alongside the Nether's.
  - Diluted HCl → GTM's distillation tower (2,000 mB → 1,000 HCl + 1,000 water), then back to the leach.
  - Chlorine from the electrolyzer → HCl again with hydrogen.
  - Kerosene → recycled, apart from the small loss.
  - Phosphoric acid → GTM's cumene and phenol chemistry; the surplus is inert and voidable.
  - Tricalcium phosphate → GTM's fertilizer; inert and voidable.
- **Samarium on Earth to cut (C1):**
  - GTM's `rare_earth_separation` centrifuge;
  - GTCA's samarium line: `gtceu:sifter/residue_to_smgd`, `gtceu:electric_blast_furnace/flsamaric_to_ho`, and `smtb_to_nitrosmtb` and `nitrosmtb_to_tnd_and_srd` (chemical reactor and large chemical reactor).

## New process lines

| Line | Steps | Byproducts → destination |
|---|---|---|
| Lunar titanium | tripod → Ilmenite → cell, mode 2 (CaCl₂ charge, Platinum anode) → Titanium ingot. On Earth, HV's Kroll with Ilmenite coming down the bridge | O₂: cryogenic plant, suit or network. Iron: steel for the base. CaCl₂: not used up |
| Regolith and volatiles | regolith → cell: mode 1 → He, He-3, H₂, N₂ and water; mode 2 → O₂, Fe and Si; mode 3 → sintered brick | He-3: fusion reserve. He and N₂: cryogenic plant. H₂: home network. Water: voided. Si: solar panels |
| Lunar cryogenics | O₂, N₂ and He from the cell (or from home through the bridge) → cryogenic plant, at night at half the energy → liquid oxygen, nitrogen and helium | Liquid Nitrogen: tripod (EV) and Mercury drill (IV). Liquid Oxygen: extreme engines (IV). Liquid Helium: 5,000 K ingots (IV) |
| Platinum | sulfide ore → macerator → washer → purified ore → plant, leach → sludge → plant, separation → Pt, Pd, Rh and Ru; EBF and freezer for the hot ingots | Ni and Cu: ore plant. H₂SO₄: sulfuric loop. Ir/Os and iridium residue: stored |
| Nitric acid and chlorine | N₂ + 3 H₂ + 4 O₂ → HNO₃ (`nitric_acid_from_elements`, large chemical reactor); Cl₂ + H₂ → HCl; nitric + sulfuric → nitration mix (GT--) | Water: network. The line's chlorine goes back into the plant |
| Nano circuits | phosphorus boule (EBF) → wafers → etching and cutting in cleanroom → NOR chips; CPU → nano wafer (EV reactor, 1,200 t) → processor, assembly and nano computer | Epoxy, acids and persulfate: HV loops. The parts leave no leftovers |
| Martian atmosphere | Martian air + water → processor (ruthenium) → CH₄ + O₂ → mixer → methalox → gas turbine on Mars | Spare O₂: suits. Spare CH₄: home network |
| Tungsten (final) | scheelite + 2,000 mB of HCl → tungstic acid (bath, 960 EU/t) → electrolysis (W + 2,000 mB of H₂ + 4,000 of O₂) → EBF with nichrome at 3,600 K → freezer. Tungsten Steel: W + steel (EV mixer) → EBF 3,000 K → freezer. RTM: Ru + W + Mo → EBF 3,000 K → 4,500 K coil | CaCl₂: cell charge. LiCl (from the tungstate): lithium. H₂ and O₂: network |
| Metal mixture | stone dust → `stone_dust_separation` → mixture → `metal_mixture_separation` (900 EU/t) → hematite, bauxite, pyrolusite, barite and chromite | Each one to its own line; the barite is stored. The Ilmenite is removed from the recipe |
| Combined cycle | refinery gas or any gas turbine fuel + distilled water → combined-cycle plant → EU + steam → large steam turbine | Steam: turbine, or the plant stops |
| Hot rolling | EBF → hot ingot → hot strip mill (circuit picks plate, rods or foil) + water → product + steam | Steam: turbines |
| Martian rare earths | Martian tripod → merrillite ore → dust → cascade: HCl leach → chloride solution + phosphoric acid + tricalcium phosphate → solvent extraction with kerosene (MV) and an HCl strip → samarium, neodymium and mixed chlorides → GTM electrolyzer → Sm, Nd, rare earth dust + Cl₂ | Samarium: LuV magnets (reserve). Neodymium: motors. Diluted HCl: distillation tower, back to the leach. Cl₂: HCl. Kerosene: recycled, small loss. Phosphoric acid and the phosphate: inert, voidable |
| Off-world crops | seeds + water + CO₂ (Martian air, or CO₂ from home: engine test stand exhaust, MV) → sealed dome → crops + O₂ | Crops: biomass for the wither. O₂: suits, cryogenic plant |

## Storage and logistics

- **ME hatches (EV)** on all our machines, with the same capabilities as the normal buses. On the Moon and Mars they are the link to home.
- **Super chest and EV tank** (MV field generator): stock outside the network.
- **AE2:** the base stays complete from LV; the large co-processors from the addons, with EV circuits (already decided). Ender items cross planets with no limit (the user's decision).

## Gate to IV

| What gets built | What it tests |
|---|---|
| IV hull (`gtceu:iv_machine_hull`: casing of Tungsten Steel plates, Platinum cables, PTFE) | Martian Tungsten and the plant's Platinum, in batch |
| 8 nano computers (`gtceu:nano_processor_computer`) | the whole nano line |
| RTM coil (`gtceu:rtm_alloy_coil_block`) | Ruthenium from the plant, Martian Tungsten and Nether Molybdenum |
| IV motor and IV pump | Tungsten Steel and Tungsten cable from Mars, Nether Neodymium and graphene |
| Moon base runs 10 minutes untouched: tripod, cell, cryogenic plant and solar array sending Titanium and liquids home | the Moon runs automatically |
| Mars base with the processor and the tripod sending Scheelite through the Earth–Mars pair | Mars runs automatically |
| EV interplanetary network: second lunar pair built by the base, a trunk of 64 channels or more, 32,768 EU/t crossing and the Mars pair | AE2 as the backbone of the journey |
| 32,768 EU/t power station, 2 buffers and EV→IV transformer | "not cutting it close" |
| Platinum plant formed and running with ME hatches | fine chemistry and the multiblock as the normal way to produce |

It opens IV: IV hull and hatches; IV motor, pump, piston, arm and belt; the tier 3 rocket to Venus and Mercury and the suit's thermal upgrade; Mars rare earths and deuterium; radioactives, radon and quantum stars; EV sensors, emitters and field generators (they need radon and uranium); the assembly line and the parallel hatch.

## Validator

New rules in `tools/analysis/tiers/ev.json`:

- **Titanium only from the Moon.** Nothing outside the lunar chain yields Ilmenite, Rutile, TiCl₄ or Titanium. Leaks to cut: the Ilmenite from `bauxite_vein_end` (it stays in v0.4.1 and is removed when the Moon arrives) and the Rutile from `bauxite_sludge_centrifuge` (decided), the ore byproducts of bauxite (Rutile) and of Aluminium (Ilmenite, Rutile), and a new one, the Ilmenite (5.75%) from `metal_mixture_separation`. No other GTM ore yields them (checked). The Titanium from naquadah (Venus, IV) does not break the rule: it comes later and is not from Earth.
- **Tungsten only from Mars.** Scheelite and Tungstate, only in `veins_mars.json`: the End vein (decided) and GCYR's Venus vein are removed. No GTM ore yields Tungsten as a byproduct (checked); review GT-- and GTCA.
- **Helium-3 from the Moon; Samarium and Deuterium from Mars.** Removed from Earth: `helium_separation` and the He-3 from Nether air (with HV's Moon), and now the Samarium from `rare_earth_separation` and the Deuterium from `hydrogen_separation` and from ender air. In GTM only fusion spends D, T and He-3 (verify addons, such as GTCA's thermal reactor).
- **Nothing in EV requires anything from IV.** No Tungsten before Mars (the tier 2 rocket, the suit, the tripod and its bit, the antenna and the Martian half go without it), no radioactives or Quantum Eyes (EV sensors, emitters and field generator stay in IV), no IV circuits, no naquadah, Iridium or Osmium.
- **EV in two substages.** The validator splits the era into *Moon* and *Mars*: nothing on the way to Mars can require Tungsten, Samarium or Deuterium.
- **Site machines.** Every recipe for the cell, the cryogenic plant, the solar array, the antenna and the lunar veins carries `.dimension('gcyr:luna')`; those for the processor and the Martian veins carry `.dimension('gcyr:mars')`.

## Registered ids (wave A, 2026-10-25)

`ev/foundation.js` (startup and server) registers what several EV machines share, with no machines of its own:
- `grindless:sintered_regolith`: the brick of every lunar structure. Its first source is GTM's electric furnace on the Moon only: 4 lunar regolith dust → 1, 120 EU/t, 20 s.
- `gtceu:lunar_regolith_dust`: any macerator makes it from GCYR's moon cobblestone (the drills' stone), moon stone, mare regolith and moon sand. It is the input of all three regolith cell modes, and it has no decomposition.
- `gtceu:liquid_nitrogen`: a liquid at 77 K of GTM's own nitrogen. Only the cryogenic plant makes it.
- `gtceu:methalox`: a gas. EV mixer: 1,000 methane + 2,000 oxygen → 3,000 mB.
- `gtceu:merrillite`: the rare earths of Mars, a phosphate that dissolves in HCl.
  - Its ore is `gtceu:mars_merrillite_ore`, in GCYR's Martian rock.
  - Apatite and tricalcium phosphate are byproducts.
  - It has no decomposition, so only the extraction cascade splits it.
- `grindless:molten_salt_charge` (never used up), `grindless:ruthenium_catalyst` (used up by chance) and `grindless:mars_chart` (written by the antenna).
- `grindless:platinum_electrode`, made by the platinum plant's own script.

## Mods and integration

| Mod | Slug | Use in EV |
|---|---|---|
| GCYR | `gcyr` | advanced tank and motor remade in EV with Titanium (`integration/gcyr.js` left them untouched in HV); our Mars veins; Venus and Mercury go up to `rocket_tier` 3 via datapack (otherwise the Mars rocket reaches them, and only heat stops them, which potions can handle: verify) |
| AE2 | `ae2` | no changes to the base: quantum bridge and ME and FE P2P tunnels |
| GT-- | `gtnn` | its live platinum line is the one the plant is built from |
| Waystones, FTB Essentials, FTB Chunks | `waystones`, `ftb-essentials`, `ftb-chunks-forge` | travel between planets (verify that it crosses dimensions) and force-loading both ends of each bridge |
| ExtendedAE, Expanded AE | `extended-ae`, `expanded-ae` | large co-processors with EV circuits (already decided) |

No new mods: machines, recipe types, items, fluids and rules are all KubeJS and datapack.

- **Startup:** types `pgm_refining`, `regolith_processing`, `cryogenic_processing`, `atmosphere_processing`, `combined_cycle`, `hot_rolling` and `solvent_extraction`; machines `platinum_plant`, `regolith_cell`, `cryogenic_plant`, `atmosphere_processor`, `ev_vein_drill` (tripod), `lunar_solar_array`, `deep_space_antenna`, `combined_cycle_plant`, `hot_strip_mill`, `sealed_dome` and `extraction_cascade`, using the pattern helper; blocks and items `sintered_regolith`, `molten_salt_charge`, `mars_chart`, `ruthenium_catalyst`, `platinum_electrode`, the wing panel, the Mars rare earth material and the Mars samples; fluids `liquid_nitrogen`, `methalox` and, if IV requires it, `liquid_hydrogen`; texts in `en_us` and `es_es`.
- **Server:** recipes for the new types; `veins_mars.json` with its samples; GCYR advanced parts; combustion bans (Moon, Mars) and methalox; the cuts from the *Validator*; two rows in `mobs.json`.
- **Data:** `pack/kubejs/data/gcyr/gcyr/planets/venus.json` and `mercury.json` with `rocket_tier` 3, and Mars generation with only our three veins.
- **Tests:** GCYR's dimensions, the dimension and time conditions, the solar generator and interplanetary P2P are new mechanisms. They are tested in-game in new strips: the next free X bands of the table in `AGENTS.md` (from X 5632, in steps of 256), Z 0–15, Y 98–112. On the Moon and Mars, use the same X and Z. The old figures here (Moon X 2560–2623, Mars X 2816–2879) clashed with the GCYR flight and Moon bands. The rest is covered by the `-Tier ev` validator, split into Moon and Mars.

## Quests

Chapter **"EV — Moonbase"** in the eras tab, written in English: about 25 short quests, with small rewards and no recipe locks. It is the step where you first hear the center of the galaxy:

- **Opens** with the Moon already visited: "Titanium only exists up here. Make the Moon work without you."
- **The base:** solar array, tripod, cell, sintered brick and cryogenic plant, with Ilmenite reaching home through an ME bus.
- **One network, two worlds:** ME hatches, trunk, power over the bridge and the second pair built by the base.
- **Fine chemistry:** nitric acid, platinum plant, nano computer and wither, based on the draft `scratch/ev-quests/ev_age.snbt` (its texts change: Tungsten no longer comes from the End and the metal mixture no longer yields Ilmenite).
- **The far side:** the antenna. "With Earth's noise blocked by 3,474 km of rock, the antenna hears a steady hiss from Sagittarius: the heart of the galaxy, 26,000 light-years away. You will go there. Mars first."
- **Red Horizon:** Mars chart, tier 2 rocket, landing (dimension quest `gcyr:mars`), waystone, bridge, processor and Martian tripod.
- **Closes** with the IV hull: "Mars gave you tungsten. Venus and Mercury burn. That's next."
- No quest names a multiblock that does not exist yet.

## Risks

- **GCYR in-game.** Open bugs on launch and on changing dimension (#91, #122), being tested now; Mars depends on a second flight. Plan B: a travel key to Mars, like the End's, with the same rules.
- **AE2 across dimensions.** Each bridge needs both ends loaded, and three loaded worlds are a heavy load; power over P2P pays an AE2 tax. If performance cannot keep up, fewer pairs and higher-amperage converters.
- **Moon base balance.** Chlorine-free Titanium at the Kroll's energy, and liquids at half price at night. If they make the Kroll or the home freezer pointless, they get cut back (the titanium mode yields less; the night discount goes down). Recipe time is never changed.
- **Leaks when removing resources from Earth.** Ti, W, He-3, Sm and D come out of recipes, ore byproducts and addons. A leak breaks the journey without showing in-game: only the validator sees it.
- **Iridium, osmium, Venus and Mercury.** The standalone plant releases the Ir/Os mixture, and the journey puts Ir and Os on Mercury; and the tier 2 rocket reaches Venus and Mercury if they do not go up to tier 3. IV closes this; here the mixture is stored and tier 3 is proposed.

Credits to note in `CREDITS.md`: regolith cell (NASA and MIT molten-regolith electrolysis, and Cambridge's FFC process: real physics), cryogenic plant (radiators to the night sky: real physics), atmosphere processor (MOXIE and the Sabatier reaction: real), solar array (TFG's large solar panel, idea only), antenna (far-side radio telescopes: real), advanced parts and planets (GCYR, LGPL-3.0). Also the four 2026-10-25 additions:
- combined-cycle plant: real combined-cycle gas plants; the catalog's `combined_cycle_plant`; GTNH's large heat exchanger, idea only;
- hot strip mill: real hot rolling; the catalog's hot strip mill option;
- sealed dome: Leisure's large greenhouse, idea only; the catalog's sealed lunar dome; BIOS-3 and Lunar Palace 1, real;
- extraction cascade: real solvent extraction of rare earths. The Ostwald tower, the crystal puller, the mass cannon and the propellant tank remain as discarded alternatives.

## Proposed decisions

1. **EV = automatic Moon and Mars at the end.** Titanium and Helium-3 only from the Moon; Tungsten, Samarium and ice with Deuterium only from Mars. The gate to IV is Tungsten Steel.
2. **Three new multiblocks:** regolith cell and cryogenic plant (Moon) and atmosphere processor (Mars). The platinum plant stays as it is in the scratch and lends electrodes and Ruthenium to the others.
3. **Removed from the EV row of `journey.md`:** Ostwald tower (GTM already makes nitric acid in one step), mass cannon (AE2 already transports) and propellant tank (it would be a penalty). The volatiles furnace is a mode of the cell. The crystal puller is discarded: it belongs to LuV.
4. **Family steps:** EV tripod (`gtceu:ev_vein_drill`: Moon and Mars, cap 64, titanium drill bit, dry or with Liquid Nitrogen, solar wings), lunar solar array and deep space antenna. No EV greenhouse or EV drill on Earth. The Tungsten Steel drill bit moves to IV.
5. **AE2 network, EV step:** ME hatches on the Moon, ME P2P trunk, power over FE P2P with 16 A EV converters, lunar halves built by the base and the first Earth–Mars pair.
6. **Mars with a tier 2 rocket in EV:** GCYR's advanced tank and engine remade with Titanium, Mars chart as catalyst, 14 buckets and the HV suit; the return trip is by waystone. Venus and Mercury go up to `rocket_tier` 3 (and Proxima b, which is already 3, further up); IV makes its parts with GCYR's KubeJS plugin.
7. **Mars only gives its own:** three veins (Tungsten, rare earths with a material of their own, and ice); GCYR's common veins are removed from Mars.
8. **Site rules in EV:** on the Moon nothing burns, night cryogenics use half the energy, light is ×1.4 and there is no mud (Liquid Nitrogen); on Mars, fuel only burns with O₂ (methalox) and light is ×0.43.
9. **Cuts on Earth:** the Ilmenite from `metal_mixture_separation`, the Samarium from `rare_earth_separation` and the Deuterium from `hydrogen_separation` and from ender air.
10. **Iridium and osmium:** the Ir/Os mixture and the iridium residue from the plant are stored; their refining on Earth is removed or requires something from Mercury (IV sets it).
11. **Staying in IV:** radioactives, radon and quantum stars; EV sensors, emitters and field generator; GCYM and parallel; large combustion engine (IV circuits). The wither is made in EV and its star is saved.
12. **Power and tests:** large gas turbines up to 32,768 EU/t on Earth, solar array with Earth at night on the Moon, and methalox on Mars. Whatever changes the mechanism is tested in-game in new strips; the rest with the validator split into Moon and Mars.

## Decisions taken (orchestrator, 2026-10-24)

The twelve proposals are approved, with these details:

- **Titanium drill bit.** In `v0.4.1` it stays hidden and converts 1:1 into the Stainless Steel one, because HV has no Titanium. EV shows it again as the EV tripod's drill bit, made with lunar Titanium, and removes the conversion. The old bits work again.
- **The HV lunar drill and the EV tripod are in the same family.** The EV tripod changes shape and parts compared to the HV one, not just the bit.
- **`journey.md` is adjusted.** In the EV row, the Ostwald tower, the mass cannon and the propellant tank come out, and the cryogenic plant goes in.
- **EV is built once the Moon works in-game** (the user asked for this). What is in the scratch is reused: the platinum plant, the EV drill and the EV quests.

## Decisions taken (orchestrator, 2026-10-25)

- **EV goes from 7 to 11 multiblocks of ours** (rule 7 of `AGENTS.md`: ×1.35 per era). The four additions are in *Raising EV to the target*, and their lines are in *New process lines*.
- **The sealed dome is the greenhouse family's EV step.** The earlier "no EV greenhouse" is reversed.
- **Test strips** follow the band table in `AGENTS.md` (from X 5632), not the old Moon and Mars figures of this document.
