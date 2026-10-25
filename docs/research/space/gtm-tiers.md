# GTM 7.5.3 tier fact sheet, ULV → MAX (for the Earth → galactic-centre spine)

Facts only, checked 2026-10-24. **src** = GTM 7.5.3 source (`files\scratch\quest-book-writer\gtm_src\GregTech-Modern-7.5.3-1.20.1`). **dump** = live registry/recipe dump `files\scratch\reachability\hv-final\dump` (77 600 recipes; GT-- 1.3.10, GTCA 2.2.0, GTM Extended Features 3.0.0, GCYR 0.2.9, GTMU 2.10.2; taken before the addon-audit scripts removed some machines, see §10). **jar** = `files\scratch\mod-batches\jarcache`. **cat** = `files\research\content\*.md`. "No recipe" = registered, but nothing in the dump makes it. AL = assembly line. Temperatures in K. *(to verify)* = not checked.

## 1. Ladder (src `GTValues`)

| Campaign | Tier | GTM long name | V = 8·4ⁿ (EU/t per amp) | VA (recipe cap) | 4 A of the tier |
|---|---|---|---|---|---|
| T0 | ULV | Ultra Low Voltage | 8 | 7 | 32 |
| T1 | LV | Low Voltage | 32 | 30 | 128 |
| T2 | MV | Medium Voltage | 128 | 120 | 512 |
| T3 | HV | High Voltage | 512 | 480 | 2 048 |
| T4 | EV | Extreme Voltage | 2 048 | 1 920 | 8 192 |
| T5 | IV | Insane Voltage | 8 192 | 7 680 | 32 768 |
| T6 | LuV | Ludicrous Voltage | 32 768 | 30 720 | 131 072 |
| T7 | ZPM | ZPM Voltage | 131 072 | 122 880 | 524 288 |
| T8 | UV | Ultimate Voltage | 524 288 | 491 520 | 2 097 152 |
| T9 | UHV | Ultra High Voltage | 2 097 152 | 1 966 080 | 8 388 608 |
| T10 | UEV | Ultra Excessive Voltage | 8 388 608 | 7 864 320 | 33 554 432 |
| T11 | UIV | Ultra Immense Voltage | 33 554 432 | 31 457 280 | 134 217 728 |
| T12 | UXV | Ultra Extreme Voltage | 134 217 728 | 125 829 120 | 536 870 912 |
| T13 | OpV | Overpowered Voltage | 536 870 912 | 503 316 480 | 2 147 483 648 |
| T14 | MAX | Maximum Voltage | 2 147 483 648 | 2 013 265 920 | 8 589 934 592 |
| T15 | — | — | 8 589 934 592 (= 4 A MAX) | — | — |

- GTM has 15 tiers (index 0–14); `V`, `VA`, `VN` end at MAX. There is no T15 in GTM: anything past MAX must be amperage of MAX or a custom mechanic. `V` is `long[]`; `VA` is `int[]` and VA[MAX] is close to the `int` ceiling.
- Multiblocks: ≥ 2 energy hatches of the highest tier raise the machine one tier (`WorkableElectricMultiblockMachine.getMaxVoltage`). Fusion caps itself at V[own tier].

## 2. `highTierContent` (src `GTCEuAPI.initializeHighTier`, `GTMachineUtils`, `GTItems`, `GTCraftingComponents`)

- On if `machines.highTierContent`, OR any addon's `requiresHighTier()`, OR dev environment. Live pack log: **"High-Tier is Disabled."** Among GCYR/GTCA/GT--/EF/GTMU only GCYR's `GCYRGTAddon` references `requiresHighTier` (jar), and the dump has no UEV hull or UHV single block.
- **OFF (now):** hulls, 1 A energy hatches, buses and hatches ULV–UHV; 4/16/64 A and 4×/9× fluid hatches EV–UHV; dual hatches LuV–UHV; quantum chest/tank and laser hatches IV–UHV; single-block machines and components (motor, pump, piston, arm, conveyor, emitter, sensor, field generator, regulator) LV–UV; rotor holders HV–UV; parallel hatch IV–UV only (×4^(tier−EV) = 4/16/64/256, also with ON). Machine casings exist ULV–MAX, but UEV–MAX are hidden and have no recipe.
- **ON:** hulls, energy/substation, item/fluid and dual hatches → MAX; single blocks, components, mufflers/passthroughs/diodes, rotor holders, quantum storage and laser hatches → OpV. Nothing else: no UEV+ circuit, cable, superconductor, coil, material or fusion. Machine recipes come from `GTCraftingComponents`, whose UEV+ rows are empty except HULL/CASING (and components up to OpV), so other ingredients fall back to each component's default; UEV+ casings still have no recipe. `MetaTileEntityLoader`: "Leaves UHV+ machine recipes to be implemented by addons." KubeJS hook: `GTCEuStartupEvents.craftingComponents`.

## 3. GTM per tier (src + dump)

| Tier | Hull = casing plate · 2 cables · polymer | Superconductor (EBF) | GTM circuits (`#gtceu:circuits/<t>`) | EBF coil (made at) | First available (verified) |
|---|---|---|---|---|---|
| ULV | wrought iron · red alloy · wood/PE | — | vacuum tube, NAND chip | — | ULV hull, hatches, buses; no electric single blocks |
| LV | steel · tin · PE | MnP (1 200) | basic electronic, basic integrated, microchip processor | cupronickel 1 800 (LV) | single blocks; EBF (LV circuits) |
| MV | aluminium · copper · PE | MgB₂ (2 500) | good electronic, good integrated, micro processor | kanthal 2 700 (MV) | fluid drilling rig MV |
| HV | stainless steel · gold · PE | HgBaCaCuO (3 300) | advanced integrated, micro processor assembly, nano processor | nichrome 3 600 (HV) | cleanroom, large chemical reactor, large steam turbine, fluid rig HV (EV-hull recipe) |
| EV | titanium · aluminium · PE | U-Pt₃ (4 400) | micro processor computer, nano processor assembly, quantum processor | RTM alloy 4 500 (EV) | vacuum freezer, distillation tower (EV circuits), large combustion engine, large gas turbine, large miner EV, fluid rig EV (LuV-hull recipe), 4/16/64 A hatches |
| IV | tungstensteel · platinum · PTFE | SmFeAsO (5 200) | micro processor mainframe, nano processor computer, quantum processor assembly, crystal processor | HSS-G 5 400 (IV) | assembly line (IV hull), extreme combustion engine, large plasma turbine, large miner IV, parallel ×4, quantum chest/tank, laser hatches |
| LuV | rhodium-plated palladium · NbTi · PTFE | ITBTC (6 000) | nano processor mainframe, quantum processor computer, crystal processor assembly, wetware processor | naquadah 7 200 (LuV) | fusion MK1, active transformer, power substation, data bank, large miner LuV, parallel ×16 |
| ZPM | naquadah alloy · vanadium gallium · PBI | URhNq₂ (9 000) | quantum processor mainframe, crystal processor computer, wetware processor assembly | trinium 9 001 (ZPM) | fusion MK2, research station, object holder, HPCA, data module, sterile-cleanroom recipes, parallel ×64 |
| UV | darmstadtium · YBCO · PBI | EnTED (9 900) | crystal processor mainframe, wetware processor computer | tritanium 10 800 (UV) | fusion MK3, network switch, parallel ×256 |
| UHV | neutronium · europium · PBI | RTAN (10 800) | wetware processor mainframe (only one) | none | hull, hatches (incl. laser 256/1 024/4 096 A), quantum chest/tank, battery buffers; **no** UHV single block, component, coil or fusion |
| UEV–OpV | casing only (no recipe); hull/hatches with ON | none | none | none | components and single blocks only with ON |
| MAX | casing only; hull/hatches with ON | none | none | none | no single block or component even with ON; creative energy/computation/data hatch only |

Superconductors: ITBTC = indium tin barium titanium cuprate; URhNq₂ = uranium rhodium dinaquadide; EnTED = enriched naquadah trinium europium duranide; RTAN = ruthenium trinium americium neutronate. Normal cables top out at europium (V[UHV], EBF 6 000).

## 4. Key materials and intermediates (src + dump)

- **Boules and wafers:** silicon (MV), phosphorus boule (EBF, 480 EU/t), naquadah boule (EBF, 1 920; needs a naquadah ingot), neutronium boule (EBF, 7 680; needs neutronium). HPIC wafer (reactor, 7 680), UHPIC wafer (30 720).
- **Stars:** quantum eye/star (chemical bath with radon, 480 EU/t), gravi-star (autoclave from a quantum star, 7 680). The "star" component is the quantum star at IV–ZPM and the gravi-star at UV.
- **LuV:** RPP, NbTi, ruridit, osmiridium, iridium, osmium (EBF 4 500); HSS-S/HSS-E (5 000); ITBTC (6 000); enriched naquadah (7 000). Europium: fusion (Nd + H); in this pack also GTCA's monazite froth (ZPM-gated) and depleted naquadah liquid fuel (GT--). LuV motor: samarium magnet + HSS-S + 64 ruridit fine wire + NbTi (AL 6 000 EU/t, data stick).
- **ZPM:** naquadah alloy and trinium (7 200), naquadria and URhNq₂ (9 000). ZPM motor: osmiridium + europium fine wire + VaGa (AL 24 000, data stick); ZPM field generator/sensor (AL 24 000, data orb). Stem cells (reactor 30 720, sterile cleanroom), neuro processing unit (circuit assembler 80 000), quantum mainframe at 7 680 EU/t in a cleanroom.
- **UV:** darmstadtium, duranium and americium come only from fusion; tritanium also from depleted plutonium liquid fuel (GT--); neutronium from fusion MK3 or an addon mixer route (neutronium mixture + He plasma at 122 880; mixture source to verify). None of them has an EBF recipe. YBCO (4 500), EnTED (9 900). UV motor: tritanium + americium fine wire (AL 100 000, data orb); UV field generator/sensor (AL 100 000, data module; gravi-star, naquadria foil). Crystal mainframe (AL 30 720, data orb).
- **UHV:** RTAN (10 800), neutronium (fusion MK3); wetware mainframe (AL 300 000, data module); UHV energy hatch (AL 1 966 080, data module, RTAN wire).
- **Energy hatches:** IV in an assembler (7 680); LuV, ZPM, UV, UHV in the AL with stick / orb / module / module research.

## 5. Fusion (src `FusionReactorMachine`, `FusionLoader`, `AssemblyLineLoader`; all 24 GTM recipes live in the dump)

| MK | Id | Storage per hatch (16 max) | Built with (AL) | Research | Runs recipes up to |
|---|---|---|---|---|---|
| MK1 | `gtceu:luv_fusion_reactor` | 10 M (160 M) | superconducting coil, 4 ZPM circuits, Pu-241 + osmiridium double plates, 2 IV field gens, 64 UHPIC, 32 ITBTC wire; 800 t at 30 720 | scanner (stick), 7 680 | 160 M to start |
| MK2 | `gtceu:zpm_fusion_reactor` | 20 M (320 M) | fusion coil, 4 UV circuits, naquadria + europium double plates, 2 LuV field gens, 96 UHPIC, 32 URhNq₂ wire; 1 000 t at 61 440 | station 16 CWU/t (orb) | 320 M |
| MK3 | `gtceu:uv_fusion_reactor` | 40 M (640 M) | fusion coil, **4 UHV circuits**, quantum star, Am double plate, 2 ZPM field gens, 128 UHPIC, 32 EnTED wire; 1 000 t at 122 880 | station 96 CWU/t (module) | 640 M |

- Ring 15×15×3; it accepts only energy hatches from its own tier up to UV (`INPUT_ENERGY.getBlockRange(tier, UV)`). Overclock is perfect (×2 EU/t, ÷2 time) up to V[tier].
- MK1 (≤ 160 M): D+T → He plasma (40 M; 125 + 125 mB → 125 mB in 16 t at 4 096 EU/t), La+Si → Lu (80 M), Xe+Zn → Pu-239 (120 M), H+V → Cr, Hg+Mg → U-235, Au+Al → U-238, Ga+Rn → duranium (140 M each), Nd+H → Eu, Ag+Cu → Os (150 M).
- MK2 (≤ 320 M): C+He-3 → O plasma, C+Mg → Ar plasma (180 M), Lu+Cr → Am, Ti+duranium → tritanium, Au+Hg → Rn, As+Ru → darmstadtium (200 M), Kr+Ce → Pu-241 (240 M), Be+D → N plasma, Ag+Li → In, Ag+He-3 → Sn plasma (280 M).
- MK3 (≤ 640 M): Si+Mg → Fe plasma (360 M), enriched naquadah + Rn → naquadria (400 M), K+F → Ni plasma (480 M), Pu-241+H → Am plasma (500 M), Am + naquadria → neutronium (600 M).
- Addon fusion recipes (dump): S, Ti, Ca, Zn plasmas (GTCA), californium (120 M), oganesson (600 M), excitation of U/Pu/naquadah liquid fuels (200/220/320 M).
- Large plasma turbine (`gtceu:plasma_large_turbine`, IV): base 2·V[IV] × rotor power. EU per mB: He 81 920, O 98 304, N 131 072, Ar 196 608, Fe 229 376, Sn 262 144, Ni 393 216, Am 655 360; addons: H 20 480, S 169 984, Ca 188 416, Ti 196 608, Zn 225 280.
- There is no MK4. `FusionReactorMachine.registerFusionTier(tier, name)` is public, and storage = hatches·2^(tier−LuV)·10 M (UHV: 80 M per hatch, 1.28 G). A MK4 needs its own pattern, because the GTM ring only takes hatches up to UV (Monifactory's Helical Fusion does this).

## 6. Research and computation (src `ResearchManager`, `HPCAComputationPartMachine`; dump)

- Scanner research → **data stick**. Research-station research → **data orb** if ≤ 32 CWU/t, **data module** if > 32. Dump: 72 AL recipes (30 stick, 21 orb, 17 module, 4 none) and 41 research-station recipes (sampled at 32 CWU/t).
- Data bank: AL 6 000 EU/t, stick, LuV circuits, ITBTC wire. Research station, object holder and HPCA: AL 100 000, stick, ZPM circuits, URhNq₂ wire. Network switch: AL 100 000, orb, UV circuits, EnTED wire.
- HPCA computation component: 4 CWU/t (assembler 30 720, ZPM circuits); advanced: 16 CWU/t (122 880, UV circuits). Data module: circuit assembler 38 400, sterile cleanroom.
- Cleanrooms: normal (HV controller); sterile (23 dump recipes: stem cells, bacterial sludge, data module, gelatin/collagen…).

## 7. Mining, fluids and veins

- Large miners EV/IV/LuV: 3×3, 5×5 and 7×7 chunks, drilling fluid; controllers at 1 920 (EV hull, IV circuits), 7 680 and 30 720.
- Fluid drilling rigs MV/HV/EV: output ×1/×16/×64, depletion 1/1, 1/2, 1/8 (src). Recipes use MV / EV / LuV hulls (dump). 8 bedrock fluid veins: oil ×4, gas and salt water in the Overworld + our flat/void dims; lava and gas in the Nether. Infinite in our config.
- Bedrock ore miners MV–EV are registered, but our config has `doBedrockOres: false`.
- Ore veins (dump): GTM 42 (Overworld, Nether, End); GCYR 12 (space, §11); GT-- 16 (14 `*_tf` never generate); GTCA none. GTCA's raw space ores (adamantium, bedrockium, cosmic neutronium, endium, mytryl, orundum, ohriharukon, vinteum, thaumium, strange crystal) have no vein.
- **Space in GTM itself:** no dimensions or space mechanics. GCYR builds on GTM items: power thruster (MV motor, assembler), advanced power thruster (HV motor), gravitation engine unit (crafted: LuV emitters, iridium double plates, osmium quad wire, lapotronic energy orb), quantum star / gravi-star.

## 8. Addons per tier (dump + jar; tier = controller recipe unless noted)

| Tier | GT-- (`gtnn`) | GTCA (`gtca`) | Extended Features / GTMU | GCYR |
|---|---|---|---|---|
| ULV–LV | neutron accelerators ULV–UV (1 EU → 10–20 eV of neutron energy) | recyclers LV–UHV; drones LV–UEV (no recipe) | EF universal circuits ULV–OpV; GTMU 64 A converters ULV–UHV | — |
| MV | ExxonMobil chemical plant (coil +50 % speed/tier, pipe +2 parallels and −20 % catalyst/tier, casing = recipe tier); dehydrators MV–ZPM | — | — | — |
| HV | — | steam pressurizer | EF configurable cleaning hatch (no recipe) | basic rocket motor/tank (480 EU/t) → rocket tier 1; launch pad; space station package |
| EV | rocket engines EV–LuV (RP-1, dense hydrazine, MMH nitrate, UDMH; 2 048 EU/t); naquadah reactors EV–UV (enriched naquadah/naquadria bolts and rods, 2 048 → 524 288 EU/t) | thermal reactor (bastnäsite rare earths); UU fabricators EV–UHV (≈ 8.4 M EU per mB); chemical generators, polymerizer, industrial coke oven | — | rocket scanner (EV hull); space suit (space fabric at HV, EV-circuit helmet) |
| IV | neutron activator (precision assembly 7 680; naquadah steps at 2.3 / 4.8 / 11 MeV; excites liquid nuclear fuels); catalyst hatch; maceration stack | COMET particle machine (7 680: H → protons, neutrons, electrons, unknown particles; He plasma → He ions; quantum anomaly at 491 520); mega LCR and cracker; extreme heat exchanger | EF large gas collector (air, nether air, ender air) | advanced motor/tank (7 680) → tier 2; space upgrade template; oxygen spreaders IV–UHV |
| LuV | circuit assembly line (AL 30 720; research imprinted once; 16 mainframes per run, same yield); large dehydrator | advanced EBF (crafted); IsaMill and flotation cell (AL 30 720); SHD turbine | EF wireless data transmitter/receptor LuV–UV (no recipe); GTMU ME tag stocking | space station packager (LuV hull) |
| ZPM | large naquadah reactor (AL 122 880; excited fuels: thorium 2 200, uranium 12 960, plutonium 32 400, naquadah 975 000 EU/t; 2 400 L/s liquid air; coolant → 150 %) | Tegmark forge recipes run here (particles + molten Ti/W/Pd → orundum, adamantium, ohriharukon) | EF data access hatches ZPM–UHV (no recipe); GTMU expanded ME pattern buffer | elite motor/tank (122 880) → tier 3; space-elevator recipes (Dyson parts); Dyson construction drone (AL); trinaquadalloy (EBF 8 747) |
| UV | — | nano forge (AL 491 520); PCB factory MkI–MkII (AL 491 520; 90 board recipes incl. wetware) | — | Dyson System Controller (machine tier UV); bisalloy-400 (EBF 10 800) |
| UHV | — | space elevator (AL 1 966 080; miner, pump and assembler modules MkI–III have no controller recipe); Tegmark forge and PCB factory MkIII (AL 1 966 080) | GTMU WEB hub/receiver: wireless energy bank (AL 1 600 000) | space elevator and Dyson controller (both UHV hull) |
| UEV | — | UEV drone (no recipe); nanite recipes run at 7 864 320 | — | — |
| ZPM–MAX | circuit families, processor → assembly → computer → mainframe: gooware ZPM→UEV, optical UV→UIV, spintronic UHV→UXV, cosmic UEV→OpV, supracausal UIV→MAX (tagged, **no recipes**) | optical circuits/SMDs, NPIC/PPIC wafers (no recipes); piko wafer IC only feeds the space elevator | EF universal circuits stop at OpV | — |

## 9. Addon numbers worth knowing (dump)

- With GT-- installed, every tier ULV–MAX has at least one circuit tag (MAX: only `gtnn:supracausal_mainframe`). Every GT-- circuit family is a recipeless placeholder, and from UEV up they are the only circuits. Nothing makes their SMDs or boards either; only "wrap" recipes use them.
- GTCA space family (`space_elevator`, `space_miner/pump/assembler_mk1–3`, `*_drone`) is a skeleton: the miner and pump types hold one test recipe each. The 7 water-purification units (GTNH water line) also have no controller recipe.
- GTCA nano forge burns 200 000–300 000 mB of UU matter per nanite batch at 7 864 320 EU/t: GTNH-scale numbers.

## 10. Removed or re-gated by our scripts (not in the tiers above)

- **Removed:** GTCA green house, recyclers and scrap box, UU amplifiers, polymerizer, industrial coke oven, steam pressurizer, chemical generators, extreme heat exchanger + SHD turbine (3.4–3.7× GTM's plasma EU). EF industrial greenhouse, advanced conservatory, rock processing plant, synthesis vessel, universal disassembly, robust alloy materializer. GT-- `pgs_from_*` taps.
- **Re-gated:** GT-- maceration stack and GTCA mega LCR/cracker → IV; IsaMill and flotation → ZPM. Kept uncraftable on purpose: GT-- component assembly line (casings LV–MAX, 83 recipes), homemade bedrock ore machine. GT--'s harder platinum and naquadah lines are on; the EV platinum plant reads them live (the IV naquadah plant is meant to).

## 11. GCYR 0.2.9 (jar + dump)

| Body | Rocket tier | Gravity | Air | Temp | Solar (ground/orbit) | GCYR veins (all common ores) |
|---|---|---|---|---|---|---|
| Earth orbit | 1 | — | — | — | 13 | — |
| Moon `gcyr:luna` | 1 | 1.625 | none | 113 | 15 | bauxite (+ilmenite, aluminium) |
| Mars | 2 | 3.72 | thin, no O₂ | 208 | 11/13 | iron, copper, nickel, zinc, tungstate, rare earth (Nd, monazite, molybdenite, bastnäsite) |
| Mercury | 2 | 3.7 | none | 440 | 19/21 | "mercury" (ruby, cinnabar, redstone) |
| Venus | 2 | 8.87 | yes, no O₂ | 737 | 6/18 | iron, copper, sulfur, tungstotitanate |
| Proxima b | 3 | 9.806 | yes, O₂ | 303 | 13 | none (its orbit dimension is named but not shipped, to verify) |
| `gcyr:black_hole_orbit` | — | space dimension with a black-hole sky shader; no planet file points to it (how to reach it: to verify) | | | | |

- **Rockets:** tier = parts. Basic motor = 4 power thrusters, tank = 2 stainless drums (HV, 480); advanced = advanced power thrusters / tungstensteel drums (IV, 7 680); elite = gravitation engine units / ZPM quantum tanks + naquadah-alloy frame (ZPM, 122 880); all with kapton K plates. Rocket fuels: hydrogen, gasoline, diesel, rocket fuel, hydrogen plasma. Launch pad (HV), rocket scanner multiblock (EV hull), ID chips, keycards. Satellites (GPS, laser, ore finder, Dyson swarm, empty) have no recipe.
- **Life support:** space suit (space fabric = PTFE + para-aramid + PBI foils + fiberglass), thermal upgrade templates, oxygen spreaders IV–UHV, airlock door. Space stations: package (HV) + packager (LuV hull).
- **Space elevator** `gcyr:space_elevator`: crafted from a UHV hull, UHV circuits, trinaquadalloy dense plates and robust casings; ≈ 25×31×25. Its recipe type makes the Dyson parts at 122 880 EU/t.
- **Dyson System Controller:** crafted from a UHV hull, UHV circuits, darmstadtium and atomic casings; 7×12×7 with RTAN hex wire, HSS-S blocks and a UV power transformer; ≥ 90 atomic casings. It must stand in an orbit dimension. Build (32 000 t at 491 520): 160 casings, 48 solar cells, 32 maintenance ports, 32 construction drones. Then **524 288 EU/t** in orbit (131 072 if not in orbit). A repair recipe exists; one sphere per dimension (to verify).
- **Materials:** kapton K, bisalloy-400 (EBF 10 800), trinaquadalloy (EBF 8 747), para-aramid, fiberglass, fluorite. Its 12 veins sit in `veins_excluded.json` until "space".

## 12. UHV+ in other GTM 1.20.1 packs (cat)

| Pack (license) | UHV+ circuits | Materials, coils, superconductors | Megastructures and power |
|---|---|---|---|
| GregTech Leisure (GTM 1.4.4 + GTLCore Java; re-implement only) | UHV optical, UEV exotic, UIV cosmic, UXV supracausal, OpV/MAX suprachronal | hulls: UEV quantanium + mithril cable, UIV adamantium/neutronium/zylon, UXV vibranium/taranium, OpV draconium/crystal matrix, MAX chaos/cosmic neutronium/radox. Coils: abyssal 12 600 (UV), titansteel 14 400 (UHV), adamantine 16 200 and naquadria-taranium 18 900 (UEV), starmetal 21 600 (UXV), infinity 36 000 / hypogen 62 000 / eternity 96 000 (OpV). SC: UEV enderite, UXV legendarium, MAX spacetime/hypogen | Space Elevator (UV, 35×43×35, power modules MK1–5, drones MK1–6); Stellar Forge (UHV); SPS (UEV); Cosmic Probe unit and DT Plasma Forge (UIV); Dyson Sphere Control System, QFT, Nano Core, Element Copier (UXV); Eye of Harmony, Annihilate Generator, Door of Creation (OpV/MAX). Rockets T1 HV (Moon) … T8 UV (Barnard C) |
| Star Technology (MIT; `highTierContent: true`) | Runic, Draconic and Abyssal processor families; Abyssal Mainframe = UXV top; universal circuits ULV–UXV | SC: LuV twinite, ZPM dragonsteel, UV prismalium/melodium, UHV stellarium, UEV ancient runicalium / enriched pallarovium, UIV rhenium super-composite. Coils: zalloy (UHV), magmada (UEV), abyssal (UIV). UHV+ component costs linearised twice | Stargates instead of rockets: Abydos (UV), Abydos II (UHV), Nether (UEV), End (UIV), K.O.M.A.R.U. module frame (UXV); Hell Forge (UEV), Abyssal Harvester (UIV), Fusion MK4 (UEV), Supreme/Nyinsane plasma turbines. OpV/MAX only as helix and universal-circuit tiers |
| Monifactory (LGPL-3.0; CosmicCore-derived code needs permission) | Optical (UV+), Extradimensional (UEV); universal circuits ULV–UEV | `Post_UV_Components.js` generates UHV/UEV/MAX hulls, casings, components, hatches and quantum storage. UEV+ cables use meta-null; Monium, Eltz, necrosiderite | Microverse projectors with microminer missions T1–T12 for resources; Helical Fusion (UEV, `registerFusionTier(UHV)`), Antimatter Collider (UHV), Prismatic Crucible (UHV), Omnic Synthesizer (ZPM, diversity), Transdimensional Energy Singularity (UIV recipe, MAX age) |

## 13. Useful ideas from the partial roadmap (`docs/eras/roadmap-luv-plus.md`, previous agent; item 10 is new)

1. **Fusion is infrastructure.** The MK1 burns D+T from water (40 M start; 65 536 EU per batch → 125 mB He plasma ≈ 10.2 M EU in plasma turbines), and the 15×15×3 ring is visible from afar.
2. **Fusion transmutation replaces a LuV drill:** Eu, Lu, Os, Cr, U-235/238, duranium, Pu-239 come from the MK1.
3. **LuV multiblock drafts:** heavy-water tower (Girdler–sulfide, 5×5×25: water → D → T and He → He-3 in one pass, wins steps) and Czochralski puller (raw crystal chip time set by the coil instead of the 12 000 t autoclave wait; GCYS crucible, MIT).
4. **Gate per era:** hull, energy hatch and circuit of the new tier; a power plant sustaining 4 A of that tier (4·V); the era multiblock running 10 min untouched.
5. **"Only there":** era multiblocks accept only energy hatches of their tier or higher (as fusion does), so two hatches of the tier below cannot unlock them.
6. **One new mechanic and one power source per UHV+ era:** forge temperature, beam energy, tide, vacuum window, critical field, diversity; Dyson + MK4, annihilation, Penrose engine, corona tap, Hawking engine, star lifting. The last three fit a black-hole finale.
7. **UEV+ content through KubeJS** (`craftingComponents`), at linear cost: the previous tier plus one era part (Star Technology had to linearise twice).
8. **No waiting as difficulty:** where GTM only waits, our machine wins the speed with a condition.
9. **Resources:** planet ores through the vein drill + sample (one trip); site-bound resources (atmosphere, orbit, ergosphere, corona) through an outpost built once that runs alone; the creature simulator ends at EV.
10. **Hooks found while checking:** public `registerFusionTier` for MK4+; GCYR's `black_hole_orbit` dimension; the Dyson only pays in orbit; GT-- circuit names through MAX need only recipes; GTCA ships a recipeless space-elevator module family to rebuild or hide.
