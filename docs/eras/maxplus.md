# MAX+ (T14, beyond the last tier): the Local Group and the Hyperstargate

MAX+ is the last era of the pack. The player leaves the Milky Way with the horizon MAX stabilised, works the Magellanic Clouds, the Magellanic Stream, Andromeda's nucleus and the intergalactic medium, comes back to Sagittarius A\* and builds the **Hyperstargate**, the only feasible way through the stabilised horizon (DECISIONS.md:702). Crossing it leads to a final dimension of ruined futuristic cities; arriving rolls the credits and ends the pack. The era makes four things the pack has never had:

- **intergalactic travel**: a probe flung out of the Galaxy by Sgr A\*'s own tides (the Hills mechanism; Hills 1988, Nature 331:687; S5-HVS1 left the Galactic Centre at 1,755 km/s, Koposov 2020, MNRAS 491:2465), caught by a warp gate in another galaxy;
- **horizon-bound matter**: the Kerr condensate tapped from the stationary cloud round Sgr A\* (*pack fiction*), and the materials made by binding older eras' degenerate, neutron and strange matter in it;
- **creative items crafted at enormous cost**, consumed only as Hyperstargate ingredients;
- **the Hyperstargate**: the GTNH Stargate process at about 10x scale (docs/research/gtnh-stargate.md section 7; DECISIONS.md:704) on huge MAX amperage.

Places (named fiction only where marked):

- **Sgr A\* orbit** (`gcyr:black_hole_orbit`, MAX's place): the condensate tap, the Hyperstargate and its machines.
- **30 Doradus orbit** (`grindless:tarantula_orbit`, new) in the Large Magellanic Cloud, 49.6 kpc (Pietrzyński 2019, Nature 567:200): the Tarantula Nebula round R136, whose stars reach about 200 solar masses (Crowther 2016, MNRAS 458:624). The stellar lift and the pair-instability crucible work here.
- **Magellanic Stream** (`grindless:magellanic_stream`, new): a 200-degree trail of gas torn from the Clouds, about 2e9 solar masses with a tenth of solar metallicity (Fox 2014, ApJ 787:147; Fox 2013, ApJ 772:110): the least processed gas the player can reach. The pristine gas works and the primordial fusion torus stand here.
- **M31 nucleus orbit** (`grindless:m31_nucleus_orbit`, new) at 765 kpc: Andromeda's central black hole, 1.4e8 solar masses (Bender 2005, ApJ 631:280), thirty times Sgr A\*. Tides at a horizon fall as 1/M², so a factory can hang far closer to this horizon than to Sgr A\*'s: the blueshift forge.
- **Local Group filament** (`grindless:local_group_filament`, new): the warm-hot intergalactic medium between the Milky Way and Andromeda (Nicastro 2018, Nature 558:406), the emptiest and darkest place in the pack (2.7 K sky, no starlight, no dust). The void crystal fab grows its crystals here. That a station holds there is *named fiction*.
- **Home**: the meta-material loom and the hyper assembly array; AE2's top storage, CPUs and pattern providers.

**Hard limit: there is no voltage above MAX.** In GTM 7.5.3 `V[]` ends at V[MAX] = 2^31 = 2,147,483,648 (GTValues.java:60-61) and the tier list ends at `MAX` (`ALL_TIERS`, GTValues.java:107-108; `MAX = 14`, :104). `GTUtil.getTierByVoltage` returns `MAX` for anything above `Integer.MAX_VALUE` (GTUtil.java:234-236), so a recipe at 2^43 EU/t still shows as MAX. The `VEX` table (GTValues.java:84-88) and `MAX_TRUE = 30` (:105) only label voltages above MAX; no hatch, cable, machine or circuit exists for them. MAX+ therefore runs **at MAX voltage with huge amperage** (DECISIONS.md:702): every row is V[MAX] x amps, written as `GTValues.V[GTValues.MAX] * amps`, never as a literal. *MAX+* is a name for an era, not a tier.

**State.** Designed by RF-7A (2026-11-01, Reforge Phase 7). Nothing is built. MAX hands over `grindless:horizon_lock`, the `maxplus` stage and the shell's c4 row (max.md *The ending*, *Reserve for MAX+*). The rules are AGENTS.md's as revised on 2026-10-31.

| | MAX (max.md, RF-7A) | MAX+ (this design) | Guideline (rule 7) |
|---|---|---|---|
| Progression multiblocks (ours) | 14 | **17** (the Hyperstargate included) | 19 (x1.35 of MAX as built); 32 (x1.35 of MAX's guide) |
| Mega members (counted apart, mega.md 4.1 rule 8) | 0 | 1 (the Hyperfactory) | — |
| Process lines (at least 4 steps each) | 57 (292 steps) | **58** (265 steps, average 4.6) | 86 (x1.5 of 57) |
| Crossings with lines two or more eras back | 204 (UXV and older) | **185** (OpV and older, 56 machines) | 306 (x1.5 of 204) |
| Places | 2 new + Cygnus + SGR + home | 4 new + Sgr A\* + home | — |
| Recipe types in the Hyperstargate tree | — | about 120 | 100-150 (gtnh-stargate.md 7.1) |
| Components | 9 `grindless:max_*` | **9** `grindless:maxplus_*` | — |
| Circuit | `gtnn:supracausal_mainframe` | **1** `grindless:horizon_processor` | — |
| Cost index target (DECISIONS.md:708, x5 per era) | 178,814 | stage I 894,070; II 4,470,350; III 22,351,750 | — |

**Why 17.** Each machine has a route only it gives: three use the stabilised horizon (condensate refinery, bound-matter press, Hills slingshot); three exist only at the most massive stars known (stellar lift, pair-instability crucible, nickel-56 burner); two need the Stream's pristine gas (gas works, primordial fusion torus); one needs a horizon gentle enough to hang a factory at (blueshift forge); one needs the intergalactic dark (void crystal fab); six make the Hyperstargate's tree (meta-material loom, multi-plasma blender, horizon crystal furnace, condensate assembler, hyper assembly array, horizon capacitor bank); one is the Hyperstargate. Two short of the x1.35 guide; *Considered and dropped* names the candidates.

**Why 58, and the gap.** MAX+ is bigger than MAX in machines, places, recipe types and, above all, quantity: rule 2 makes each stage x5 the last and the Hyperstargate is 10x GTNH's Stargate in crafts and parts. In lines it only matches MAX (58 against 57), and crossings fall (185 against 204) because MAX+ can only cross OpV and older (its own two-eras-back rule) and the OpV era has fewer machines to cross than UXV. The gap to the x1.5 guide (28 lines, 121 crossings) is real; *Considered and dropped* lists what was rejected and open question 2 asks whether a second line pass should run after stage I is built, when bottlenecks are measured instead of guessed.

## Route

**Stage I: out of the Galaxy** (`maxplus`, `maxplus-lmc`, `maxplus-stream`).

1. **The key.** MAX's last recipe makes `horizon_lock` and grants `maxplus` (max.md *The ending*). With a lock kept as catalyst, the mirror shell's c4 taps `kerr_condensate` from the stationary cloud (P1).
2. **Horizon-bound matter.** The condensate refinery binds UIV neutronium, OpV strange matter and UEV degenerate matter into condensate (P2, P3, P5) and clads horizon strand into `gtceu:kerr_strand`, the MAX+ cable (P4). The bound-matter press makes `horizon_compressed_plate`, the pack's superdense plate.
3. **Components and circuit.** Nine `grindless:maxplus_*` components from seven core lines (C1-C7) and the horizon processor (Q1, Q2) close the family. MAX+ hatches are GTM's MAX hatches in bulk (*Voltages*).
4. **The slingshot.** At Sgr A\* the Hills slingshot binds an `ig_relay_probe` to a counterweight (P15, P16) on a plunging orbit; the hole's tide splits the pair and throws the probe out of the Galaxy. Gate c16 catches it at 30 Doradus: `maxplus-lmc`.
5. **The Tarantula.** The stellar lift draws core plasma from R136's very massive stars (P6); the pair-instability crucible burns it into nickel-56 (P7) and intermediate-mass ash (P8); the nickel-56 burner is stage I's power.
6. **The Stream.** Gate c17 from 30 Doradus to the Magellanic Stream: `maxplus-stream`. The pristine gas works separates primordial deuterium and helium-3 (P9, P10); the primordial fusion torus burns them.

**Stage II: the Local Group** (`maxplus-m31`, `maxplus-void`).

7. **Andromeda.** Gate c18 from 30 Doradus to M31's nucleus: `maxplus-m31`. The blueshift forge hangs on a deep horizon tether (P13) and makes photonuclear isotopes (P12).
8. **The filament.** Gate c19 from M31 to the Local Group filament: `maxplus-void`. The void crystal fab grows defect-free crystals in the dark (P14).
9. **Scale.** The Hyperfactory (mega), MAX+ parallel hatch and AE2's top tier (MEGA 256M cells and crafting storage, ExtendedAE assembler matrix and pattern providers, Expanded AE coprocessors) re-gated with MAX+ parts (A1-A3). The meta-material loom makes the four meta-materials (T4-T7).
10. **Creative items.** On the hyper assembly array, each creative item is crafted from its core line (K1-K4) and enormous quantities of everything above; they are ingredients only (*Creative items*).

**Stage III: the Hyperstargate** (`maxplus-gate`).

11. **The tree.** At Sgr A\*: the multi-plasma blender (T8), the horizon crystal furnace (T9, T10), the condensate assembler (T1-T3), the horizon capacitor bank (T14). At home: 1,212 grid crafts on the hyper assembly array (*The Hyperstargate*).
12. **The gate.** The Hyperstargate forms round its dial at Sgr A\* orbit: 160 ring blocks, 9 chevron blocks, the base, 4 power units, the iris and the controller with a kept `horizon_lock`. Its dial recipe consumes the genome archive and opens the horizon for 1,200 ticks on V[MAX] x 4,096 A.
13. **The crossing.** A player who steps through the open ring arrives in the final dimension; the credits, the epilogue and the ending text roll (*The ending*).

## Inherited, as built

| Inherited | From | State |
|---|---|---|
| `horizon_lock`, the `maxplus` grant, shell c3 | MAX (MX-E1) | to come |
| Mirror shell controller (c4 is a MAX+ row on it) | MAX-G1 | shipped v0.17.0 |
| `gtceu:horizon_strand`, the MAX hull, the 29 `gtceu:max_*` parts, nine `grindless:max_*` components, `gtnn:supracausal_mainframe` | MAX | shipped |
| Wireless case 14 (V[MAX] x A x 10 caps as long), `max_smes_cell` | MAX-W | shipped |
| MAX parallel hatch x1,048,576 (`lib/parallel_hatch.js`) | MAX-M1 | shipped |
| Warp gate and `tables/gate.json` c1-c15; relay platforms (`tables/relay_platforms.json`) | UHV to MAX | shipped |
| The `WIN_GAME` packet path, proven on a client (gg_test_max_credits, bench i39; DECISIONS.md:693) | MAX-C3 | shipped; moved by MX-E1/XP-Z1 |
| OpV machines MAX+ crosses: Kugelblitz forge, strangelet vault, debris harvester, replication refinery, field press, jet beam line, gamma optics works, magnetic pair converter | OpV | shipped |
| AE2 addons: `mega` (MEGA Cells), `extended-ae`, `expanded-ae`, `appflux` | pack | installed (DECISIONS.md:42) |

MAX ids are consumed, never redefined. A MAX+ change to a MAX file is a MAX+ package that names the file in its contract.

## Places and site rules

| Place | Id | GCYR tier | Substage | How the player arrives | What only it gives |
|---|---|---|---|---|---|
| Sgr A\* orbit | `gcyr:black_hole_orbit` | 14 | `maxplus` | MAX | Kerr condensate (shell c4); the Hyperstargate site |
| 30 Doradus orbit | `grindless:tarantula_orbit` | 14 | `maxplus-lmc` | gate c16, Hills slingshot | very-massive-star core plasma, nickel-56 |
| Magellanic Stream | `grindless:magellanic_stream` | 14 | `maxplus-stream` | gate c17 from 30 Doradus | primordial deuterium and helium-3 |
| M31 nucleus orbit | `grindless:m31_nucleus_orbit` | 14 | `maxplus-m31` | gate c18 from 30 Doradus | a horizon gentle enough to hang a factory at: the MeV photon bath |
| Local Group filament | `grindless:local_group_filament` | 14 | `maxplus-void` | gate c19 from M31 | the 2.7 K, dust-free dark: void-grown crystals |

**Site rules.** As MAX: every far machine row carries `recipe.dimension(...)`; older machines gain a site as a string row (OpV-S0-12); fluids and plasmas are processed where they are made unless they travel in AE2 fluid storage; controllers are built at home and carried; no home recipe takes a far product before its substage. All four new places are GCYR datapack planets at tier 14 that no rocket offers, with a relay platform row each (the `max/travel.js` pattern: `G.maxPlusTravel`). Stage III adds no place: the Hyperstargate stands at Sgr A\* orbit. The final dimension (*The ending*) is not a GCYR planet and has no substage.

## Bridges and first arrivals

**c16, Sgr A\* to 30 Doradus.** The Hills mechanism: a tight binary on a plunging orbit is split by the hole's tide; one member is captured, the other leaves at up to a few thousand km/s, above the Galaxy's escape speed (Hills 1988; Brown 2015, ARA&A 53:15).

- `ig_relay_probe` (P16; GTM `assembly_line` at VA[MAX], MAX parts): 1 `probe_seed` (OpV), 1 `hawking_drive` (OpV), 1 `optical_nav_core` (P16), 4 `maxplus_sensor`, 2 `maxplus_robot_arm`, 32 `metal_feedstock` *(tune)*.
- Hills slingshot c1: probe + `canned_counterweight` (P15) → `bound_probe_pair`; c2 at V[MAX] x 16 A for 1,200 t → `launched_ig_probe`. The counterweight is captured by the hole (an honest destination).
- Gate c16 in `tables/gate.json`: `launched_ig_probe` → 2^37 EU/t (V[MAX] x 64 A) for 1,200 t *(tune)* on one 1,024 A MAX+ hatch (`gtceu:max_maxplus_energy_hatch_1024a`; XP-B1's T1 ran it) at Sgr A\* orbit, keeping a `horizon_lock` (the probe's departure is timed against the still horizon). The relay row places the platform at 30 Doradus and grants `maxplus-lmc`. Real flight time at 3,000 km/s would be 16 million years: the warp-gate catch is the pack's fiction since UHV.
- **c17, c18, c19** are warp gates built at the place they start from (controller carried), each throwing a probe of the same recipe with its own navigation core: c17 30 Doradus → Magellanic Stream (`maxplus-stream`), c18 30 Doradus → M31 nucleus (`maxplus-m31`, 765 kpc), c19 M31 → Local Group filament (`maxplus-void`). Each is a second hop from a relay-reached place (MAX-S0-11 path; proof reused).

**First arrival** at each place: the platform holds an ME far ring, a 9 x 9 deck, one wireless anchor and a chest with the substage book. Nothing else is given. People come back by Waystones or FTB home (journey.md, user decision 6).

## Automatic resource generation

Rule 1 at MAX+: every MAX+ base resource is renewable and automatic.

- **Kerr condensate**: the shell's c4, as long as seed wave packets arrive (OpV Kugelblitz forge, automated since OpV).
- **Very-massive-star plasma**: the stellar lift draws it continuously; R136's stars lose mass at about 1e-5 solar masses a year by wind alone (Crowther 2016), so a lift takes nothing the star would keep.
- **Pristine gas**: the gas works' magnetic scoop sweeps the Stream (P23).
- **Photonuclear isotopes**: the blueshift forge runs on target feed and the ambient light.
- **Void crystals**: grown from seed plates made at home.
- **Older matter** (neutronium, degenerate matter, strange matter, planetesimals): the older eras' automated lines.

Nothing is mined by hand; no platform deck is a quarry.

## Only from there, and cuts

| Only from | Products |
|---|---|
| Sgr A\* orbit | `kerr_condensate` and everything bound in it (P1-P5); `launched_ig_probe`; the crystal slurry, core and controller crystals; condensate-assembled parts; the Hyperstargate |
| 30 Doradus | `raw_vms_plasma`, `vms_core_plasma`, `ni56_slug`, `ime_ash` |
| Magellanic Stream | `pristine_gas`, `primordial_deuterium`, `pristine_helium_3` |
| M31 nucleus | `photonuclear_mix`, `p_process_plasma` |
| Local Group filament | `void_grown_diamond`, `void_holographic_block` |
| Home | meta-materials, components, processors, grid crafts, creative items |

**Cuts (XP-F2).** Every recipe that makes a creative item in vanilla, GTM or AE2 (none exist in survival; the obtain table keeps them `until: "never"` today, `tables/hidden_until.json:277-281`) is replaced by ours; `hidden_until` moves them to `maxplus-gate`. The five GTM creative blocks and AE2's creative cells are ingredient-only: placing one outside creative mode is cancelled (*Creative items*).

## Audit of the design against the rules

| Rule | How MAX+ meets it |
|---|---|
| 1 Nothing by hand | condensate, lift plasma, pristine gas, photonuclear mix and void crystals are all machine-made and renewable |
| 2 Complexity and expensive quantity | x5 per stage (DECISIONS.md:708); the Hyperstargate at 10x GTNH in crafts and parts; times stay 600-4,800 t *(tune)*, never inflated; capacity overflow is solved by more steps, then bigger machines |
| 3 Honest byproducts | ime ash back to silicon and sulfur (P8); spent nickel casks to iron; counterweights accreted; plasmoid, boil-off and helium fractions to named rows |
| 4 A multiblock that gains | each of the 17 (*Why 17*); the Hyperstargate is the era's goal |
| 5 Quests | six chapters per stage, process-line quests, the arrival as the last quest; never gating (*Quests*) |
| 6 GTM wins | no tier above MAX; amperage only (GTValues.java:60-61, :107-108; GTUtil.java:234-236) |
| 7 Bigger | more machines, places and quantity than MAX; lines level and crossings fewer, stated (*Why 58*) |
| 8 Power | nickel-56 burner, primordial fusion torus and the older Sgr A\* generators, each on a stated fuel; creative energy is never placed |
| 9 Meaningful complexity | every line is a real chain of at least 4 transformations; assemblies are not lines |

## Voltages, hull, hatches and controllers

**Voltages.** One voltage: V[MAX] = 2,147,483,648, VA[MAX] = 2,013,265,920 (GTValues.java:60-73). MAX+ rows run at VA[MAX] (machine rows, int) or V[MAX] x A (long rows):

| Row kind | EU/t | How it is fed |
|---|---|---|
| Machine rows (lines, components) | ≤ VA[MAX] | two MAX 4 A hatches (as MAX; the wireless ones draw on the network) |
| Stage I big rows (refinery, slingshot, gate c16) | V[MAX] x 16-64 A (2^35-2^37) | one 1,024 A hatch in our multiblocks: the wireless MAX+ one (`gtceu:max_wireless_energy_hatch_1024a`, XP-W2) from the network, or XP-F1's `gtceu:max_maxplus_energy_hatch_1024a` on a cable; a gate row takes what the warp gate's pattern accepts |
| Stage II-III rows (condensate assembler, blender, crystal furnace, creative items) | V[MAX] x 256 A (2^39) | one 1,024 A hatch, as above |
| Hyperstargate dial | V[MAX] x 4,096 A (2^43 = 8,796,093,022,208 EU/t) for 1,200 t = 10,555,311,626,649,600 EU (1.06e16) | one 4,096 A wireless MAX+ hatch (`gtceu:max_wireless_energy_hatch_4096a`, XP-W2) in the base's one energy cell, drawing on the network's store, which the horizon capacitor bank holds (machine 15; S0-11) |

**One feeding path (XP-D1).** Every MAX+ row takes its EU through an `energy_input` cell (`INPUT_ENERGY`). GTM's 64 A substation hatches carry `SUBSTATION_INPUT_ENERGY`, which that cell does not take (batch 7): they serve GTM's power substation only and stay ingredients. The MAX+ feed is the pack's wireless network (case 14): XP-W2 registers wireless MAX+ energy hatches at 1,024 and 4,096 A, tier 14 only, from the `maxplusCaps` rows of `tables/wireless_energy.json` (no MAX+ row needs the 2,048 A row), with the wireless hatch builder of `lv/wireless_energy.js` (GTM's `EnergyHatchPartMachine`, `INPUT_ENERGY`). Every MAX+ multiblock's energy cell takes them, and the settlement fills them like any MAX wireless hatch, while the network's tier is 14 (its weakest cell a MAX one).

**The dial's hatch.** One 4,096 A wireless hatch buffers V x 16 x 4,096 = 2^47 EU, 16 ticks of the dial. Every settlement (10 ticks) tops it up by at most V x 4,096 x 10 = 87,960,930,222,080 EU (the 4,096 A `maxplusCaps` row), exactly what the dial draws in 10 ticks, so a full hatch swings between 16 and 6 ticks of charge for as long as the store lasts. Four 1,024 A hatches carry the same 2^43, but GTM draws a row's EU/t from its hatches in order and each refills by at most its own cap, so in steady state they keep 1.5 ticks in hand against the single hatch's 6, in four cells instead of one. S0-11 (`docs/research/maxplus-s0.md`) proved the path on the pack's own settlement: one 4,096 A wireless hatch, registered as XP-W2 will, in an `energy_input` cell ran a 2^43 EU/t row for all 60 of its ticks at exactly 2^43 a tick; the steady settlements handed out exactly the cap, the hatch never read below 6 ticks (52,776,558,133,248 EU), and store, hatch, draws and settlements balanced to the EU as exact longs.

**The store.** When the dial starts, the network must hold its 1,200 ticks: 10,555,311,626,649,600 EU, more than 2^53 = 9,007,199,254,740,992, the largest whole number a JS double holds exactly. The settlement keeps its store as a double (`server_scripts/grindless/lv/wireless_energy.js:208-214`, `:406-457`) and the block list checks its long fields against 2^53 - 1 (`server_scripts/grindless/lib/wireless_registry.js:33`, `:52`), so XP-W2 makes both exact: the store becomes a `java.math.BigInteger` (GTNH's wireless network keeps its store that way, `WirelessNetworkManager`; GTM's power substation totals its bank with one), written back with `putLong(big.longValue())`, which S0-11 showed keeps 2^53 + 1 exact where `Number(getLong(...))` rounds it to 2^53. Amounts per block stay doubles: the largest, a 4,096 A hatch's buffer, is 2^47. The horizon capacitor bank (machine 15) holds the dial's charge, and the dial starts only on a full one (*The Hyperstargate*, the dial row).

**No fallback.** The 2^39 x 19,200 t fallback of open question 6 is retired: power, not cost, limits the dial, and it limits only how often the gate can dial (the bank's recharge, *Power*), never the dial's 1,200 ticks.

**Hull.** MAX+ machines use GTM's `gtceu:max_machine_hull` with a MAX+ casing (`grindless:horizon_machine_casing`: MAX casing + 4 `horizon_compressed_plate` + 2 `gtceu:kerr_strand_single_cable`). There is no MAX+ hull id: GTM's builder key is the base id and a second hull at the same tier crashes the boot (DECISIONS.md:526).

**Cable.** `gtceu:kerr_strand` (P4; KubeJS material, single cable at V[MAX], 256 A, loss 0 *(tune)*; S0-3). Fallback: power by wireless only.

**Components.** `grindless:maxplus_*` (XP-F1, the `uiv_components.js` pattern), at VA[MAX] on GTM's assembly line:

| Component | Core | Line |
|---|---|---|
| `maxplus_electric_motor` | 2 `kerr_field_coil` + `bound_matter_rotor` + `max_electric_motor` | C1, C2 |
| `maxplus_electric_pump` | motor + `bound_matter_rotor` + `horizon_valve` | C2, T7 |
| `maxplus_electric_piston` | motor + `horizon_actuator_stack` | C7 |
| `maxplus_robot_arm` | 2 motor + piston + 2 `horizon_processor` | — |
| `maxplus_emitter` | `horizon_photonic_engine` + `max_emitter` + 2 `horizon_processor` | C3 |
| `maxplus_sensor` | `horizon_phase_sensor_core` + `max_sensor` + 2 `horizon_processor` | C4 |
| `maxplus_field_generator` | `condensate_field_cell` + emitter + 2 `kerr_field_coil` | C5, C1 |
| `maxplus_conveyor_module` | 2 motor + `horizon_belt` | C6 |
| `maxplus_fluid_regulator` | pump + `horizon_valve` + 2 `horizon_processor` | T7 |

Each takes its MAX counterpart where one exists, so MAX's lines stay loaded.

**Circuit.** `grindless:horizon_processor` (tag `#grindless:circuits/maxplus`; GTM has no circuit tag above MAX): joined on UEV's photonic integration hall at VA[MAX] from 2 `horizon_logic_die` (Q1) + 1 `horizon_interposer` (Q2) + 1 `quantum_memory_node` (MAX L23) + 1 `rydberg_logic_array` (MAX) + 2 `gtnn:supracausal_mainframe` + 1,000 mB `kerr_condensate`.

**Controllers.** Assembly line at VA[MAX], 4,800 t *(tune)*; base: MAX hull, 2 `horizon_machine_casing`, 8 `horizon_processor` (16 for the Hyperstargate), 2,000 mB `kerr_condensate`, at least 8 MAX+ components from at least 3 families, plus the domain inputs named in each machine section. *As built:* the loom, the condensate assembler and the Hills slingshot take this base (the loom without `maxplus_electric_pump` and `maxplus_fluid_regulator`, which take its own `horizon_valve`); the condensate refinery and the bound-matter press are the bootstrap exceptions (MAX parts plus 4 `stream_bundle`, see *Bootstrap check*), because the MAX+ components need their bound matter and condensate cells (`tools/analysis/test/maxplus-controllers.test.mjs`).

## Machines

Format as in max.md, shortened: gains, recipes, byproducts, structure, crossings, risks and sources. Numbers are *(tune)*; Phase 2's cost row sets the counts.

### 1. Condensate refinery (Sgr A\* orbit)

**Gains.** The only machine that handles `kerr_condensate` (*pack fiction*: the stationary cloud's field tapped as a bulk medium). It binds older exotic matter into it and makes the MAX+ base materials. **Recipes.** c1 settle (P1); c2 neutronium bind (P2); c3 strange bind (P3); c4 strand cladding (P4); c5 degenerate bind (P5); c6 crystal doping (T9); c7 field cell loading (C5); c8 cloud core (K1); c9 tank core (K3); each VA[MAX] to V[MAX] x 16 A, 600-2,400 t. **Byproducts.** `condensate_boil_off` → c1 again (recompressed; nothing vented); empty `condensate_cell` shells → superfluid helium plant (UV) recharge row. **Structure.** 15 x 11 x 15, `grindless:condensate_vessel_casing` round a superfluid core. **Crossings.** P1-P5, T9, C5, K1, K3. **Risks.** The whole material family is pack fiction on real superradiance physics; quest text marks it. **Source.** East and Pretorius 2017; Herdeiro and Radu 2014 (the cloud); the bound materials are pack fiction.

### 2. Bound-matter press (Sgr A\* orbit)

**Gains.** GTNH's superdense plates come from a black-hole containment field; ours come from the only place with a stationary horizon: condensate-bound ingots pressed under the shell's field. Only source of `horizon_compressed_plate` (10,000-20,000 needed). **Recipes.** c1 bound neutronium → plate (P2); c2 strange plate (P3); c3 containment core (T1); c4 graded laminate (T4); V[MAX] x 16 A, 1,200 t. **Byproducts.** Press flash → c1 feed. **Structure.** 13 x 13 x 13 press of `grindless:bound_press_casing`. **Crossings.** P2, P3, T1, T4. **Risks.** Pack fiction; GTNH is ideas only. **Source.** docs/research/gtnh-stargate.md 3.3 (the role, not the numbers).

### 3. Hills slingshot (Sgr A\* orbit)

**Gains.** Out of the Galaxy without a rocket: it binds a probe and a counterweight into a tight pair and drops them on a plunging orbit; the tide splits them (Hills 1988; Koposov 2020). Only launcher for c16. **Recipes.** c1 bind (probe + `canned_counterweight` → `bound_probe_pair`); c2 release (V[MAX] x 16 A, 1,200 t → `launched_ig_probe`). **Byproducts.** The counterweight falls into the hole. **Structure.** 17 x 9 x 17 capture ring of `grindless:slingshot_coil_casing`. **Crossings.** P15, P16. **Risks.** Real speeds are 1-4e3 km/s; intergalactic arrival relies on the warp catch (named fiction since UHV). **Source.** Hills 1988; Brown 2015; Koposov 2020.

### 4. Tarantula stellar lift (30 Doradus)

**Gains.** Stellar lifting (Criswell 1985, in *Interstellar Migration and the Human Experience*): magnetic fields heat and funnel a star's outer layers off. At R136's very massive stars, whose winds already shed about 1e-5 solar masses a year (Crowther 2016), it reaches CNO-processed core plasma no smaller star exposes. **Recipes.** c1 → `raw_vms_plasma` (P6 step 1), 2^35 EU/t, 2,400 t; wears `vms_lift_nozzle` (P20) 1/32. **Byproducts.** `he_rich_fraction` (via the mass filter) → P25. **Structure.** 21 x 15 x 21 of `grindless:lift_nozzle_casing`. **Crossings.** P6, P20, P25. **Risks.** Lifting rates are fiction; the stars and their winds are measured. **Source.** Crowther 2016; Criswell 1985.

### 5. Pair-instability crucible (30 Doradus)

**Gains.** Stars above about 140 solar masses end in pair-instability explosions that make up to tens of solar masses of nickel-56 (Heger and Woosley 2002, ApJ 567:532; SN 2007bi, Gal-Yam 2009, Nature 462:624). The crucible forces that burning on lifted core plasma in a magnetic pinch (*named fiction*): the only source of `ni56_slug`. **Recipes.** c1 `confined_vms_plasma` → `ni56_slug` + `ime_ash`; V[MAX] x 16 A, 1,200 t; liner (P21) worn 1/16. **Byproducts.** `ime_ash` → P8 (silicon, sulfur, calcium, argon back). **Structure.** 15 x 15 x 15 sphere of `grindless:crucible_liner_casing`. **Crossings.** P6, P8, P21. **Source.** Heger and Woosley 2002; Gal-Yam 2009.

### 6. Nickel-56 burner (30 Doradus, generator)

**Gains.** Supernova light curves run on nickel-56 → cobalt-56 → iron-56 decay (half-lives 6.1 and 77 days; Arnett 1982, ApJ 253:785). The burner turns that decay heat into power through supercritical CO2 turbines (P17). **Recipes.** c1 `shielded_ni56_cask` → 2^34 EU/t out, 4,800 t, → `co56_cask`; c2 `co56_cask` → 2^33 EU/t, 4,800 t, → `spent_fe56_cask` (→ hot cell, iron back). **Balance.** About 1.8x along P6-P7 *(tune)*. **Structure.** 15 x 9 x 15. **Crossings.** P7, P17. **Risks.** Output above 2^30 per machine needs S0-4 (MAX generators stopped at 2^30). **Source.** Arnett 1982.

### 7. Pristine gas works (Magellanic Stream)

**Gains.** The Stream's gas has a tenth of solar metallicity (Fox 2013): the closest thing to primordial gas in reach, with deuterium close to its Big Bang abundance (D/H about 2.5e-5; Cooke 2018, ApJ 855:102) and helium-3 never cycled through stars. A magnetic scoop (P23) gathers it. **Recipes.** c1 → `pristine_gas` (P9, P10), V[MAX] x 4 A, 2,400 t. **Byproducts.** Protium → GTM hydrogen (AE2 to home). **Structure.** 25 x 7 x 25 scoop ring. **Crossings.** P9, P10, P23. **Source.** Fox 2013, 2014; Cooke 2018.

### 8. Primordial fusion torus (Magellanic Stream, generator)

**Gains.** D-He3 fusion, mostly aneutronic, with direct conversion of its charged products (Moir and Barr 1973, Nucl Fusion 13:35). A KubeJS generator multiblock, not a GTM fusion tier (max.md *Fusion*). **Recipes.** c1 1,000 mB `primordial_deuterium` + 1,000 mB `pristine_helium_3` → 2^34 EU/t, 2,400 t; NBI (P22) worn 1/64, direct converter (P11) 1/128. **Balance.** About 2.0x *(tune)*. **Structure.** 23 x 9 x 23 torus. **Crossings.** P9-P11, P22. **Source.** Moir and Barr 1973.

### 9. Blueshift forge (M31 nucleus)

**Gains.** Light falling to a factory held near a horizon is blueshifted by 1/√(1 − r_s/r); close enough, Andromeda's bulge light arrives as MeV gamma rays, a photon bath for photonuclear reactions (the gamma process of p-nuclei, Arnould and Goriely 2003, Phys Rep 384:1). Only M31\*'s 1.4e8 solar-mass hole is gentle enough at its horizon to hang a factory there. **Recipes.** c1 `enriched_mo_target` → `photonuclear_mix` (P12), V[MAX] x 16 A, 1,200 t; tether (P13) and window (P24) worn 1/32. **Structure.** 13 x 31 x 13 tower over a tether well. **Crossings.** P12, P13, P24. **Risks.** Buoyancy and tether strength (Unruh and Wald 1982) are not modelled; the tether's reach is named fiction. **Source.** Arnould and Goriely 2003; Bender 2005; Unruh and Wald 1982.

### 10. Void crystal fab (Local Group filament)

**Gains.** The emptiest place in the pack: a 2.7 K radiative sink, no dust, almost no cosmic-ray secondaries. Deep-space experiments are proposed there for exactly that (MAQRO, Kaltenbaek 2016, EPJ Quantum Technol 3:5). The fab grows crystals with no thermal or dust defects (*named fiction* in degree). **Recipes.** c1 diamond growth (P14); c2 holographic block (K2); VA[MAX], 2,400 t. **Structure.** 15 x 15 x 15 open frame. **Crossings.** P14, K2. **Source.** Kaltenbaek 2016; Nicastro 2018.

### 11. Meta-material loom (home)

**Gains.** The four meta-materials (GTNH's Shielding, Waveguide, Conduit, Valve: idea only) in one machine, from bound plates, kerr strand and condensate: several steps in one, and the only route. **Recipes.** c1 `horizon_shielding` (T4), c2 `horizon_waveguide` (T5), c3 `horizon_conduit` (T6), c4 `horizon_valve` (T7); V[MAX] x 4 A, 600 t (about 380,000 of each are needed: *The Hyperstargate*). **Structure.** 21 x 9 x 9. **Crossings.** T4-T7.

### 12. Multi-plasma blender (Sgr A\* orbit)

**Gains.** GTNH's crystal slurry mixes 14 plasmas (idea only). Ours blends one plasma from each place the pack has worked: stellar (UEV forge), lifted (UXV elevator), filtered (UXV mass filter), very-massive-star (P6), p-process (P12), jet (OpV), plus hot flow and kerr condensate. Only source of `horizon_crystal_slurry`. **Recipes.** c1 eight fluids, 1,000 mB each → 1,000 mB slurry, V[MAX] x 64 A, 100 t. **Crossings.** T8. **Structure.** 11 x 11 x 11.

### 13. Horizon crystal furnace (Sgr A\* orbit)

**Gains.** GTNH grows its stargate crystals for two weeks at heat 100,000; we refuse the time (rule 2) and pay in slurry and parallels: 2.56e8 mB of slurry for 64 core crystals (4,000,000 mB each, the most one MAX fluid hatch holds: the capacity lint's rule; *As built* XP-H2), in many parallel runs of 2,400 t. Heat from condensate, not coils (GTM's coils stop at 10,800 K). **Recipes.** c1 core crystal (T9), c2 controller crystal (T10); V[MAX] x 256 A, 2,400 t. **Structure.** 15 x 17 x 15.

### 14. Condensate assembler (Sgr A\* orbit)

**Gains.** GTNH's BEC assembler (idea only), without its nanite and slowdown system: a condensate-bath assembler whose recipes take 30-60 inputs and 1e5-1e6 mB of condensate each. Only source of containment plates, chevron cores, frame parts and meshes. **Recipes.** c1 containment plate (T1), c2 chevron core (T2), c3 horizon mesh (T3), c4 `horizon_frame_part` (assembly of T4-T7, mesh, plates); V[MAX] x 256 A, 1,200-2,400 t. **Structure.** 19 x 13 x 19.

### 15. Horizon capacitor bank (Sgr A\* orbit)

**Gains.** The dial draws 10,555,311,626,649,600 EU (1,200 ticks at 2^43) through one wireless hatch, and the network must hold all of it when the dial starts: the bank holds it. It is a superconducting magnetic storage ring of `grindless:horizon_capacitor` (T14) blocks, each 2^48 = 281,474,976,710,656 EU *(tune)*: 32 ticks of the dial, about 4.4 MAX SMES cells in one slot. Like the Wireless Energy Tower it is a network store, not a machine with hatches: formed at Sgr A\* orbit (it counts nowhere else: the gate's site), its capacitors add their capacity to the network at tier 14 (MAX voltage, so it never lowers the network's tier); EU comes in from the network's generators, 5% lost on the way in, and leaves through wireless hatches. Horizon capacitors fit no tower, and towers do not count for the dial: the dial starts only when the formed banks have at least one dial of capacity and the store holds the dial's charge (*The Hyperstargate*, the dial row). Storage only: it makes no energy (rule 8; *Power* says what charges it and how fast). **Structure.** 25 x 5 x 25 ring of 40 capacitor slots *(tune)*, each a capacitor or the casing (an empty slot, as in the tower). **Capacity.** 40 x 2^48 = 11,258,999,068,426,240 EU = 1,280 ticks of the dial: one dial and 80 ticks (6.7%) for the rest of the base while it runs. **Crossings.** T14 (the toroids) and P18 (the fault-current limiters), through the capacitor's grid craft.

### 16. Hyper assembly array (home)

**Gains.** GTNH's 9 x 9 grid recipes (idea only) as a GTM multiblock: recipes with 40-90 distinct inputs, which no GTM single machine can take (multiblock item slots are unbounded; RF-1A capacity lint). Makes all 1,212 grid crafts and the creative items. **Recipes.** One row per grid item (*The Hyperstargate*) and per creative item; V[MAX] x 64-256 A, 1,200-2,400 t. **Structure.** 27 x 11 x 27 with 81 input buses.

### 17. The Hyperstargate (Sgr A\* orbit)

The final multiblock: *The Hyperstargate* below.

### Mega member (counted apart)

**Hyperfactory** (home): the mega family's top member (mega.md 4.1): assembler, circuit assembler, assembly line (unordered), forming press and laser engraver at `4,096 x hatch` parallels with the MAX+ parallel hatch (`grindless:maxplus_parallel_hatch`, x4,194,304 = 4^11, int-safe; S0-5). Quality of life for the millions of components the tree needs; counted apart from rule 7.

## Older machines in MAX+

Rows are added to each machine's own table by the named package, at a circuit read from `tables/maxplus_ids.json` (XP-F1 records the first free circuit `f` of every type, as MAX-F1 did). Far rows carry their site as a string row.

| Machine (era) | Rows (line) | Site |
|---|---|---|
| Mirror shell (MAX) | c4 condensate tap: 1 `seed_wave_packet` + `horizon_lock` (kept) → 16,000 mB `kerr_condensate`, V[MAX] x 16 A, 1,200 t *(tune)*; wears a `horizon_phase_lock` 1/32 (P1) | Sgr A\* |
| Cluster-light furnace (MAX); membrane line (MAX); Rydberg works (MAX) | P15 bloom; C6 horizon belt; arrays for the processor | belt; home |
| Kugelblitz forge, strangelet vault, debris harvester, replication refinery (OpV) | P1, P16, K1; P3, K1; P15; P16 | their OpV sites |
| Field press, jet beam line, gamma optics works, magnetic pair converter (OpV) | P23; P22, T8 (jet plasma row); T2; K1 | their OpV sites |
| Plasma mass filter, FRC former (UXV) | P6 (30 Doradus string row), P25, T8; P6 (30 Doradus) | 30 Doradus, Sgr A\* |
| Pasta draw bench, MTJ, oxide PLD, SHeQUID, racetrack fab, stellar elevator (UXV) | P4; P4, P19, P23, P24, T2, T5, T13, T17, C2, C5, C7, Q1, A1; P18, T6, T14; P19, T7, C2, K3; Q1, A1; P13, T8 | home, SGR, Cygnus |
| Neutron drip separator, levitation melter, TFLN, femto, BEUV, mK cryostat, spectral hole burner (UIV) | P2; P3, P24, T10; T12, C3, Q2, A2, K4; P14, T9, T12, Q2, A3, K2; T2, T10, C3, C4, Q1, A1; T5, T9, T12, T13, C4, C5, Q2, K1, K2, K4; A3, K2 | home |
| Megabar, degenerate harvester, calutron, CVI, EB furnace, single crystal foundry, nitride works, SNSPD foundry, photonic hall, stellar forge (UEV) | P2, P5, P15, P21, T11, T16; P5; P9, P10, P12, Q1; P20, P21, T3, T5, T13, C1; P11, P17, P21, T3, T11, T16, C6; P17, T11; T15; C4, K4; A2, K4; P12, T8 | home, Sirius B |
| PBO plant, SPS, crystal growth, clock lab, photonic foundry, MBE, tether ribbon works (UHV) | P4, P23, T3, C6; P5, P11, P17, T1, T4; T9, T10, C7, Q1, A3; P16, T12; P16, T12, T17, C3, C4, A2; Q2; P13 | home |
| Superfluid He plant, SRF works, zone refining, MOCVD, fibre draw (UV) | P1, P10, P19, P25, T7, K3; P22, T13, C5; P8, P19, P22; T17, C3, A2; T17, A3 | home |
| Diamond lattice fab, ion implanter, aerogel works, magnet works (ZPM) | P14, C3; P14; T7, K3; T14 | home |
| Coated conductor, HTS works, He refrigerator (LuV) | P18, P20, T6; P18, P20, P23, T6, T14, T15, C1; P18, P20, P23, T6, T14, T15, C1 | home |
| Hot cell (IV) | P7, T1 | home |
| Extraction cascade, cryogenic plant, hot strip mill (EV) | P8, P11, P12, P22, P24, T4, C7; P9, P10, P25; P17, P24, T15 | home; the cryogenic plant's rows on the Moon (every recipe of that plant does, `tiers/ev.json` site-moon-machines) |

## Power

Generous, never free (rule 8). MAX+ needs a sustained supply in the 2^37-2^39 EU/t range and, for each dial, one 1.06e16 EU discharge held in the horizon capacitor bank.

| Generator | Place | Fuel | Output | Balance |
|---|---|---|---|---|
| Nickel-56 burner c1, c2 | 30 Doradus | `shielded_ni56_cask` (P7), then `co56_cask` | 2^34 then 2^33 EU/t x 4,800 t | ~1.8x *(tune)* |
| Primordial fusion torus | Magellanic Stream | primordial D + pristine He-3 (P9, P10) | 2^34 EU/t x 2,400 t | ~2.0x *(tune)* |
| MAX's Sgr A\* generators (winch, feeder, BZ, Penrose, shell vent) | Sgr A\* | as max.md *Power* | 2^29-2^30 each, in parallel | as MAX |

**Output.** A generator multiblock emits above 2^30, up to its dynamo hatch's V x A (S0-4): the burner and the torus at 2^34 each take one MAX 16 A dynamo hatch (V x A = 2^35), and the wireless one (`gtceu:max_wireless_dynamo_hatch_16a`, case 14) puts that straight into the network.

**One path, generator to gate.** Generators → MAX wireless dynamo hatches → the network's store, 5% lost on the way in (`tables/wireless_energy.json` `loss`, 19/20) → held by the horizon capacitor bank (machine 15) → one 4,096 A wireless MAX+ hatch → the dial (*Voltages, hull, hatches and controllers*). Storage makes nothing: every EU the dial spends was generated first, and a twentieth more was lost on the way in.

**One dial's charge.** 10,555,311,626,649,600 EU in the store takes 10,555,311,626,649,600 x 20/19 ≈ 1.111e16 EU generated: about 90 nickel-56 casks through the burner (c1 then c2, 1.237e14 EU each) or 270 torus runs (4.123e13 EU each; 270,000 mB each of primordial deuterium and pristine helium-3) *(tune with the balance)*. Filling an empty bank takes about 1.185e16 EU generated.

**Recharge time.** Power, not cost, sets how often the gate can dial. The dial spends in 1,200 ticks what a 2^39 EU/t plant (32 primordial fusion tori) makes in 19,200 ticks; with the loss, that plant refills the bank for one dial in about 20,211 ticks (16.8 minutes), a 2^40 plant in about 10,105 ticks (8.4 minutes), one burner alone (1.5 x 2^33 EU/t on average) in about 12 hours. The dial's own 1,200 ticks never stretch, and no recipe time is inflated. MAX's Sgr A\* generators add to the same store. `gtceu:creative_energy` is never a source: it is an ingredient and cannot be placed (*Creative items*).

## AE2

The Hyperstargate's crafting plan moves about 1e9-1e10 items and 1e10-1e13 mB (*The Hyperstargate*), so MAX+ scales AE2 from the addons already in the pack, no new mod (S0-6 checks each id in the registry):

- **Storage:** MEGA Cells' top item and fluid cells (256M) and bulk cells, their components re-gated with `horizon_storage_die` (A1). The Hyperstargate base consumes one 256M item cell and one 256M fluid cell (GTNH's universe cells, idea only).
- **Crafting CPUs:** MEGA's top crafting storage and accelerators, re-gated with `photonic_coprocessor` (A2). One crafting job for the base needs a CPU of about 2^30 bytes *(tune)*.
- **Pattern providers:** ExtendedAE's extended pattern provider and assembler matrix, Expanded AE's 72-slot provider, re-gated with `pattern_memory_unit` (A3). The hyper assembly array's 81 buses are fed by pattern providers.
- **Far rings** at the four new places (relay platforms), as MAX.

The quest book teaches the sizing (*Quests*). No item is made by AE2 alone: every component comes from a MAX+ line.

## Lines

Each step is a real transformation; a line counts with at least 4 transformations besides any final assembly or cold qualification (the MAX rule). **Cr** counts crossings with OpV-and-older machines (two or more eras back from MAX+); MAX, MAX+ and GTM generic machines are steps, not crossings. This table is authoritative; *Older machines in MAX+* is its index.

| # | Line | Steps (machine → product) | Steps | Cr | Package |
|---|---|---|---|---|---|
| P1 | Kerr condensate | Kugelblitz forge (OpV, Cygnus) → `seed_wave_packet`; mirror shell c4 (MAX) → `kerr_condensate`; condensate refinery c1 → `settled_condensate`; superfluid He plant → `jacketed_condensate_cell` (the travel form) | 4 | 2 | XP-A1 |
| P2 | Horizon-bound neutronium | neutron drip separator (UIV) → `neutronium_pellet`; megabar → `compressed_neutronium_core`; refinery c2 → `bound_neutronium_ingot`; bound-matter press c1 → `horizon_compressed_plate` | 4 | 2 | XP-A1 |
| P3 | Kerr strange alloy | strangelet vault (OpV) → `fed_strangelet`; levitation melter → `strange_alloy_charge`; refinery c3 → `kerr_strange_ingot`; press c2 → `kerr_strange_plate` | 4 | 2 | XP-A1 |
| P4 | Kerr strand (MAX+ cable) | refinery c4 (on MAX horizon strand wire) → `kerr_clad_strand`; pasta draw bench (UXV, SGR) → `kerr_strand_wire`; MTJ (oxide interlayer) → `insulated_kerr_wire`; PBO plant → `kerr_braid_sleeve`; GTM assembler → `gtceu:kerr_strand_single_cable` | 5 | 3 | XP-A1 |
| P5 | Bound degenerate billet | degenerate harvester (UEV, Sirius B) → `degenerate_matter_slug`; megabar → `degenerate_compact`; refinery c5 → `bound_degenerate_powder`; SPS → `bound_degenerate_billet` | 4 | 3 | XP-A1 |
| P6 | Very-massive-star plasma | stellar lift c1 → `raw_vms_plasma`; plasma mass filter (30 Dor row) → `vms_core_plasma`; FRC former (30 Dor row) → `confined_vms_plasma`; crucible c1 → `ni56_slug` + `ime_ash` | 4 | 2 | XP-B1 |
| P7 | Nickel-56 cask | GTM canner (+ `chain_lamina_stack`) → `canned_ni56`; hot cell → `shielded_ni56_cask`; burner c1 → EU + `co56_cask`; burner c2 → EU + `spent_fe56_cask` | 4 | 1 | XP-B1 |
| P8 | Ime ash return | crucible c1 → `ime_ash`; extraction cascade → `ime_leach_fractions`; GTM electric blast furnace → `recovered_silicon`; zone refining → `electronic_grade_silicon` (into older lines) | 4 | 2 | XP-B1 |
| P9 | Primordial deuterium (Cooke 2018) | gas works c1 → `pristine_gas`; cryogenic plant → `liquid_pristine_hydrogen`; GTM distillation tower → `hd_fraction`; calutron → `primordial_deuterium` | 4 | 2 | XP-B2 |
| P10 | Pristine helium-3 | cryogenic plant → `pristine_helium`; superfluid He plant (superleak: He-4 flows, He-3 stays) → `he3_enriched_helium`; GTM distillation tower → `crude_helium_3`; calutron → `pristine_helium_3` | 4 | 3 | XP-B2 |
| P11 | Direct converter (Moir and Barr 1973) | extraction cascade → `molybdenum_oxide`; GTM electric blast furnace (hydrogen reduction) → `mo_powder`; SPS → `mo_grid_billet`; EB furnace → `refined_mo_grid`; GTM assembler → `direct_converter_stack` | 5 | 3 | XP-B2 |
| P12 | p-process plasma (Arnould and Goriely 2003) | calutron → `enriched_mo_target`; blueshift forge c1 → `photonuclear_mix`; extraction cascade → `p_nuclide_concentrate`; stellar forge → `p_process_plasma` | 4 | 3 | XP-B3 |
| P13 | Deep horizon tether | tether ribbon works (on P4 wire) → `kerr_ribbon`; stellar elevator (UXV, Cygnus) → `proof_loaded_kerr_ribbon`; GTM chemical bath (+ condensate) → `bound_coated_ribbon`; GTM autoclave → `cured_bound_ribbon`; GTM assembler → `deep_horizon_tether` | 5 | 2 | XP-B3 |
| P14 | Void-grown diamond | diamond lattice fab → `c12_seed_plate`; void crystal fab c1 → `void_grown_diamond`; ion implanter → `nv_engineered_diamond`; femto writer → `void_crystal_lattice` | 4 | 3 | XP-B4 |
| P15 | Slingshot counterweight | debris harvester (OpV, NSC belt) → `nsc_planetesimal`; cluster-light furnace (MAX) → `metal_rich_bloom`; megabar → `dense_counterweight_core`; GTM canner → `canned_counterweight` | 4 | 2 | XP-T1 |
| P16 | Intergalactic relay probe | replication refinery (OpV) → `probe_seed`; Kugelblitz forge (OpV) → `hawking_drive`; clock lab → `thorium_nav_clock`; photonic foundry → `optical_nav_core`; GTM assembly line → `ig_relay_probe` | 5 | 4 | XP-T1 |
| P17 | sCO2 turbine module | single crystal foundry → `sx_turbine_blade`; EB furnace → `tbc_coated_blade`; SPS → `turbine_disc`; hot strip mill → `pche_recuperator_foil`; GTM assembler → `sco2_turbine_module` | 5 | 4 | XP-B1 |
| P18 | Kerr fault-current limiter | GTM bender → `fcl_substrate_strip`; coated conductor → `kerr_fcl_buffer_tape`; oxide PLD → `thick_kerr_fcl_tape`; HTS works → `kerr_fcl_coil`; He refrigerator → `cold_kerr_fcl` (→ the 1,024 A hatch row, capacitor bank; the MAX 64 A substation hatches keep MAX's rows) | 5 | 4 | XP-W |
| P19 | Kerr gyroscope (Everitt 2011, PRL 106:221101) | zone refining → `fused_quartz_sphere_blank`; GTM lathe (lapped to Gravity Probe B sphericity) → `lapped_quartz_sphere`; MTJ → `nb_coated_sphere`; SHeQUID → `calibrated_gyro`; superfluid He plant → `cold_kerr_gyro` (→ chevron upgrade) | 5 | 4 | XP-H4 |
| P20 | Lift nozzle coil | CVI → `sic_nozzle_former`; coated conductor → `nozzle_tape`; HTS works → `nozzle_winding`; GTM chemical reactor (impregnation) → `impregnated_nozzle`; He refrigerator → `vms_lift_nozzle` | 5 | 4 | XP-B1 |
| P21 | Crucible liner | CVI (on P5 billet) → `infiltrated_liner`; EB furnace → `sealed_liner`; megabar → `densified_liner`; GTM lathe → `crucible_liner` | 4 | 3 | XP-B1 |
| P22 | Neutral beam injector | extraction cascade → `caesium_chloride`; zone refining → `six_n_caesium`; SRF works → `rfq_cavity`; jet beam line (OpV) → `beam_neutraliser`; GTM assembler → `neutral_beam_injector` | 5 | 4 | XP-B2 |
| P23 | Magnetic scoop | PBO plant (chain strand braid) → `scoop_web`; field press (OpV, SGR) → `field_frozen_hoop`; MTJ → `insulated_hoop`; HTS works → `scoop_coil`; He refrigerator → `cold_scoop_coil`; GTM assembler → `magnetic_scoop_module` | 6 | 5 | XP-B2 |
| P24 | Beryllium gamma window | extraction cascade → `beryllium_hydroxide`; GTM electric blast furnace → `be_pebbles`; levitation melter → `be_ingot`; hot strip mill → `be_foil`; MTJ → `coated_be_window` | 5 | 4 | XP-B3 |
| P25 | Helium-4 supply | plasma mass filter (30 Dor) → `he_rich_fraction`; cryogenic plant → `liquid_helium_4`; superfluid He plant → `superfluid_helium_4`; GTM canner → `he4_dewar` (→ condensate assembler) | 4 | 3 | XP-H3 |
| T1 | Containment plate core | hot cell → `gd_absorber_tile`; SPS → `graded_z_billet`; press c3 (+ P2 plate) → `laminated_containment_core`; condensate assembler c1 → `horizon_containment_plate` | 4 | 2 | XP-H3 |
| T2 | Chevron core | BEUV → `zone_plate_wafer`; MTJ → `multilayer_xray_mirror`; gamma optics works (OpV) → `gamma_focus_element`; condensate assembler c2 → `chevron_core` | 4 | 3 | XP-H3 |
| T3 | Horizon mesh | PBO plant (P4 wire) → `kerr_mesh_preform`; CVI → `infiltrated_mesh`; EB furnace → `coated_mesh`; condensate assembler c3 → `horizon_mesh` | 4 | 3 | XP-H3 |
| T4 | Horizon shielding | ZPM's europium line (c7) → `gtceu:gadolinium_oxide_dust`; SPS → `gd_hfb2_cermet`; press c4 → `graded_horizon_laminate`; loom c1 → `horizon_shielding` | 4 | 2 | XP-H1 |
| T5 | Horizon waveguide | CVI → `sic_waveguide_tube`; GTM chemical bath (electropolish) → `polished_waveguide_tube`; MTJ → `nb_lined_tube`; loom c2 (+ kerr strand) → `horizon_waveguide`; mK cryostat → `cold_horizon_waveguide` | 5 | 3 | XP-H1 |
| T6 | Horizon conduit | coated conductor → `conduit_tape`; oxide PLD → `thick_conduit_tape`; HTS works → `cabled_conductor`; loom c3 → `horizon_conduit`; He refrigerator → `cold_horizon_conduit` | 5 | 4 | XP-H1 |
| T7 | Horizon valve | GTM chemical reactor (TEOS sol-gel) → `condensate_alcogel`; aerogel works → `condensate_superleak_plug`; SHeQUID → `calibrated_condensate_leak`; loom c4 → `horizon_valve_body`; SHeQUID c12 (the superfluid He plant has no item slots) → `horizon_valve` | 5 | 3 | XP-H1 |
| T8 | Horizon crystal slurry | stellar forge → `stellar_plasma`; stellar elevator (Cygnus) → `lifted_stellar_plasma`; plasma mass filter → `filtered_stellar_plasma`; blender c1 (+ P6, P12, jet plasma, hot flow, condensate) → `horizon_crystal_slurry` | 4 | 3 | XP-H2 |
| T9 | Horizon core crystal | crystal growth → `sapphire_seed_plate`; refinery c6 → `condensate_doped_dust`; crystal furnace c1 (+ slurry) → `core_crystal_boule`; femto writer → `inscribed_core_crystal`; mK cryostat → `horizon_core_crystal` | 5 | 3 | XP-H2 |
| T10 | Controller crystal | levitation melter (P3 ingot) → `molten_kerr_strange`; crystal growth → `controller_seed`; crystal furnace c2 → `controller_crystal_boule`; BEUV → `horizon_controller_crystal` | 4 | 3 | XP-H2 |
| T11 | Iris blade | single crystal foundry (P3 plate) → `oriented_blade_blank`; megabar → `densified_blade`; GTM lathe → `edged_blade`; EB furnace → `coated_iris_blade`; hyper assembly array → `iris_blade` | 5 | 3 | XP-H4 |
| T12 | Alignment matrix | clock lab → `nuclear_clock_reference`; photonic foundry → `optical_frequency_divider`; TFLN → `phase_modulator_chip`; femto writer (on P14 lattice) → `inscribed_reference_crystal`; mK cryostat → `cold_reference_assembly`; hyper assembly array → `horizon_alignment_matrix` | 6 | 5 | XP-H4 |
| T13 | Resonance chamber | CVI → `sic_chamber_flange`; SRF works → `large_resonance_cell`; GTM chemical bath → `polished_resonance_cell`; MTJ → `coated_resonance_cell`; mK cryostat → `resonance_chamber` (→ power units) | 5 | 4 | XP-H4 |
| T14 | Kerr SMES toroid | oxide PLD (on P4 strand) → `kerr_coated_tape`; HTS works → `kerr_smes_winding`; GTM chemical reactor (vacuum impregnation) → `impregnated_kerr_winding`; magnet works → `braced_kerr_toroid`; He refrigerator → `cold_kerr_toroid` (→ `horizon_capacitor`) | 5 | 4 | XP-H3 |
| T15 | Flux absorber casing | nitride magnet works → `fe16n2_absorber_ring`; hot strip mill → `laminated_absorber_sheet`; GTM chemical bath (insulating coat) → `coated_absorber_sheet`; HTS works → `shielded_absorber`; He refrigerator → `flux_absorber_casing` | 5 | 4 | XP-H3 |
| T16 | Frame truss | cluster-light furnace c2 (MAX) → `segment_truss_billet`; megabar → `densified_truss_billet`; EB furnace → `coated_truss_billet`; GTM extruder → `horizon_frame_truss` | 4 | 2 | XP-H3 |
| T17 | Gate comm terminal | MOCVD → `inp_1550_laser_die`; fibre draw → `er_amplifier_fibre`; photonic foundry → `laser_comm_engine`; MTJ → `coated_telescope_optic`; GTM assembler → `horizon_comm_terminal` (→ interface) | 5 | 4 | XP-H4 |
| C1 | Kerr field coil (motor, field generator) | GTM chemical bath (copper stabiliser on P4 wire) → `stabilised_kerr_wire`; CVI → `cmc_coil_former`; HTS works → `kerr_coil_winding`; GTM chemical reactor → `impregnated_kerr_coil`; He refrigerator → `kerr_field_coil` | 5 | 3 | XP-A2 |
| C2 | Bound-matter rotor (motor, pump) | SHeQUID (on P5 billet) → `balanced_bound_billet`; GTM lathe → `bound_rotor_blank`; MTJ → `wear_coated_rotor`; GTM forming press → `bound_matter_rotor` | 4 | 2 | XP-A2 |
| C3 | Photonic engine (emitter) | diamond lattice fab → `c12_photonic_plate`; TFLN → `ln_on_diamond`; MOCVD → `gan_laser_array`; BEUV → `patterned_engine_wafer`; photonic foundry → `horizon_photonic_engine` | 5 | 5 | XP-A2 |
| C4 | Phase sensor core (sensor) | SNSPD foundry → `snspd_array_die`; BEUV → `readout_wafer`; GTM cutter → `readout_die`; mK cryostat → `cold_snspd_module`; photonic foundry → `horizon_phase_sensor_core` | 5 | 4 | XP-A2 |
| C5 | Condensate field cell (field generator) | SRF works → `confinement_cavity`; MTJ → `nb_coated_cavity`; refinery c7 → `condensate_loaded_cavity`; GTM canner (seal) → `sealed_field_cavity`; mK cryostat → `condensate_field_cell` | 5 | 3 | XP-A2 |
| C6 | Horizon belt (conveyor) | PBO plant (P4 wire) → `kerr_braided_web`; GTM chemical bath (primer) → `primed_kerr_web`; EB furnace → `refractory_coated_web`; membrane line (MAX) → `horizon_belt` | 4 | 2 | XP-A2 |
| C7 | PMN-PT actuator (piston) | extraction cascade → `pmn_precursor_oxides`; crystal growth → `pmn_pt_boule`; GTM cutter → `pmn_pt_plate`; MTJ → `electroded_pmn_stack`; GTM assembler → `horizon_actuator_stack` | 5 | 3 | XP-A2 |
| Q1 | Horizon logic die | calutron → `si28_feed`; crystal growth → `si28_boule`; BEUV → `horizon_logic_wafer`; MTJ → `spin_interconnect_wafer`; racetrack fab → `stacked_logic_wafer`; GTM cutter → `horizon_logic_die` | 6 | 5 | XP-A3 |
| Q2 | Horizon interposer | TFLN → `ln_on_insulator_plus`; femto writer → `interposer_waveguides`; MBE → `piezo_transducer_layer`; GTM cutter → `interposer_die`; mK cryostat → `horizon_interposer` | 5 | 4 | XP-A3 |
| A1 | Horizon storage die | MTJ → `mram_stack_plus`; BEUV → `patterned_mram`; racetrack fab → `racetrack_3d_stack`; GTM cutter → `horizon_storage_die` | 4 | 3 | XP-AE |
| A2 | Photonic coprocessor | MOCVD → `laser_array_wafer`; TFLN → `ln_modulator_array`; photonic foundry → `optical_matrix_die`; photonic integration hall → `photonic_coprocessor` | 4 | 4 | XP-AE |
| A3 | Pattern memory (Fe:LiNbO3 holography) | crystal growth → `fe_ln_boule`; GTM cutter → `holographic_slab`; femto writer → `addressed_holo_slab`; spectral hole burner → `burned_pattern_crystal`; fibre draw → `pattern_memory_unit` | 5 | 4 | XP-AE |
| K1 | Cloud core (creative energy) | Kugelblitz forge → `caged_kugelblitz`; strangelet vault → `strange_cage_lining`; magnetic pair converter → `pair_confined_cage`; refinery c8 → `cloud_loaded_cage`; mK cryostat → `horizon_cloud_core` | 5 | 4 | XP-K |
| K2 | Store core (creative chest) | void crystal fab c2 → `void_holographic_block`; femto writer → `addressed_holo_block`; spectral hole burner → `burned_store_block`; mK cryostat → `bottomless_store_core` | 4 | 3 | XP-K |
| K3 | Tank core (creative tank) | aerogel works → `condensate_aerogel`; SHeQUID → `superfluid_reservoir_core`; refinery c9 → `condensate_wetted_core`; superfluid He plant → `bottomless_tank_core` | 4 | 3 | XP-K |
| K4 | Computation core (creative computation provider, data access hatch) | TFLN → `photonic_qpu_wafer`; SNSPD foundry → `detector_layer_wafer`; photonic integration hall → `photonic_qpu`; mK cryostat → `horizon_computation_core` | 4 | 4 | XP-K |
| | **Total** | | **265** | **185** | |

**Fiction marks.** *Pack fiction*: Kerr condensate and everything bound in it (P1-P5, T1-T10, C5, K1-K3), the stationary horizon, the Hyperstargate and the final dimension. *Named fiction*: the pair-instability pinch (P6), lifting rates, the deep tether's reach (P13), the filament station and void-crystal perfection (P14), intergalactic warp catches, creative "bottomless" cores (K2, K3). Everything else cites a paper or a real process; each package checks its older-machine row against that machine's real recipe type first (max.md S0-12 rule).

## Crossings

| Era | Crossings | Machines |
|---|---|---|
| OpV | 11 | Kugelblitz forge 3, strangelet vault 2, debris harvester 1, replication refinery 1, jet beam line 1, field press 1, gamma optics works 1, magnetic pair converter 1 (8) |
| UXV | 29 | MTJ 13, SHeQUID 4, oxide PLD 3, plasma mass filter 3, stellar elevator 2, racetrack fab 2, pasta draw bench 1, FRC former 1 (8) |
| UIV | 33 | mK cryostat 10, femto writer 6, BEUV 6, TFLN 5, levitation melter 3, spectral hole burner 2, neutron drip separator 1 (7) |
| UEV | 33 | EB furnace 7, megabar 6, CVI 6, calutron 4, stellar forge 2, single crystal foundry 2, SNSPD foundry 2, photonic integration hall 2, degenerate harvester 1, nitride magnet works 1 (10) |
| UHV | 24 | photonic foundry 6, SPS 5, crystal growth 5, PBO plant 4, clock lab 2, tether ribbon works 1, MBE 1 (7) |
| UV | 17 | superfluid He plant 6, zone refining 3, SRF works 3, MOCVD 3, fibre draw 2 (5) |
| ZPM | 6 | diamond lattice fab 2, aerogel works 2, ion implanter 1, magnet works 1 (4) |
| LuV | 17 | HTS works 7, He refrigerator 7, coated conductor 3 (3) |
| IV | 2 | hot cell (1) |
| EV | 13 | extraction cascade 7, cryogenic plant 3, hot strip mill 3 (3) |
| **Total** | **185** | **56 machines** |

Recomputed from the *Lines* table by machine name (RF-7A; the integrator re-sums it). The weight sits in UIV, UEV and UXV, the eras whose fabs make the pack's finest parts; OpV is thin (11) because OpV built few process machines.

## Creative items

**The owner's brief:** "Creative items crafted at enormous cost, used as Hyperstargate ingredients." This supersedes the "creative ending left out" of DECISIONS.md:102 for these items only (DECISIONS.md:450 already opened the door for the postgame). It is still not a creative ending: no recipe or event changes game mode, and the pack ends on arrival, not on a creative unlock.

| Item | Core line | Where it goes | Count |
|---|---|---|---|
| `gtceu:creative_energy` | K1 cloud core | one per Hyperstargate power unit | 4 |
| `gtceu:creative_chest` | K2 store core | the base | 1 |
| `gtceu:creative_tank` | K3 tank core | the base | 1 |
| `gtceu:creative_computation_provider` | K4 computation core | the controller | 1 |
| `gtceu:creative_data_access_hatch` | K4 computation core + A3 pattern memory | the interface | 1 |
| `ae2:creative_energy_cell` *(id checked by S0-6)* | K1 cloud core | one per horizon capacitor | 40 |

**Cost.** Each creative item is a hyper assembly array row of 60-90 distinct inputs at V[MAX] x 256 A for 2,400 t *(tune)*. Target: each GTM creative block costs at least 1,000 times the stage III core index (about 2.2e10 base units each, DECISIONS.md:708 row extended by x5 per stage); each AE2 creative cell about a tenth of that. Example, `gtceu:creative_energy`: 1 `horizon_cloud_core` + 64 `maxplus_field_generator` + 64 `kerr_field_coil` + 16 `cold_kerr_toroid` + 256 `horizon_processor` + 64 `horizon_containment_plate` + 64 `horizon_conduit` + 1,000,000 mB `kerr_condensate` + 250,000 mB `superfluid_helium_3` + 64 MAX 64 A substation hatches *(tune)*. Every input is automatable; none is a quantity of one raw item standing in for complexity.

**Ingredient only.** A crafted creative block placed outside creative mode is cancelled with a message (a KubeJS `BlockEvents.placed` check by id and game mode; S0-7), so it never runs as a source: creative energy would be energy from nothing (rule 8), and a creative chest or tank would void MAX+'s own logistics. The AE2 creative cell is likewise refused by drives (S0-7). Open question 4 asks whether the owner wants them placeable after the arrival.

## The Hyperstargate

**Model.** The GTNH Stargate process (docs/research/gtnh-stargate.md sections 2-5; ideas and numbers only, section 8) at about 10x in crafts, parts and recipe types (section 7.1; DECISIONS.md:704), never in recipe time, on MAX amperage only. GTNH gives the shape: grid crafts fed by a condensate assembler, a plasma mixer and a crystal furnace, on top of superdense plates and exotic matter. Every step here is a GTM recipe on one of our multiblocks, fed by AE2: automatable and scalable.

**Structure** (Sgr A\* orbit, about 45 x 45 x 9 *(tune)*, needs MAX_ROWS 64 as the shell; S0-8): a vertical ring of 160 `hyperstargate_ring_block` and 9 `hyperstargate_chevron_block`; the base below it with one energy cell (`energy_input`, exactly one) for the 4,096 A wireless MAX+ hatch, 4 `hyperstargate_power_unit` and the `horizon_iris`; the controller at the base holds one `horizon_lock` as its dial. The horizon capacitor bank (machine 15) stands beside it at Sgr A\* orbit and holds the dial's charge on the network.

**The grid layer** (hyper assembly array; counts from the structure and recipe multipliers *(tune)*):

| Craft | Placed | Consumed by other crafts | Total crafts | Main inputs per craft |
|---|---|---|---|---|
| Ring block | 160 | 36 chevron blocks x 4, base 144, power units 4 x 16, controller 8, interface 8 | 528 | 20 frame part, 10 containment plate, 6 MAX+ field generator, 8 compressed plate, 8 flux absorber casing (T15), 4 kerr strange plate, 2 chevron core, 4 waveguide, 2 horizon frame truss (T16) |
| Chevron upgrade | — | 36 chevron blocks x 9, base 36 | 360 | 24 compressed plate, 8 frame part, 4 chevron core, 2 field generator, 2 piston, 1 sensor, 1 emitter, 2 kerr gyroscope (P19) |
| Chevron block | 9 | base 27 | 36 | 4 ring block, 9 chevron upgrade, 16 containment plate, 4 field generator, 16 of each meta-material; the 9 placed in the ring also take 1 `horizon_lock` each (a second row) |
| Iris blade | — | iris 240 | 240 | 1 `coated_iris_blade` (T11), 12 compressed plate, 8 kerr strange plate, 2 MAX+ piston, 1 MAX+ conveyor |
| Horizon iris | 1 | — | 1 | 240 blades, 12 shielding, 12 condensate field cell |
| Horizon capacitor | 40 (bank) | — | 40 | 4 `cold_kerr_toroid` (T14), 4 field generator, 2 `cold_kerr_fcl` (P18), 1 `ae2:creative_energy_cell` |
| Power unit | 4 | — | 4 | 16 ring block, 8 resonance chamber (T13), 10 conduit x 64, 1 `gtceu:creative_energy` |
| Base | 1 | — | 1 | 27 chevron blocks, 144 ring blocks, 36 upgrades, 4 alignment matrix (T12), 1 `gtceu:creative_chest`, 1 `gtceu:creative_tank`, 1 MEGA 256M item cell, 1 MEGA 256M fluid cell, 4 `gtceu:max_maxplus_energy_hatch_1024a` (the power units' couplers: the 4,096 A the 64 substation hatches carried, at MAX+ cost) |
| Controller | 1 | — | 1 | 8 ring block, 1 `horizon_controller_crystal`, 1 `gtceu:creative_computation_provider`, 16 `horizon_processor`, 1 interface |
| Interface | — | controller 1 | 1 | 8 ring block, 1 `gtceu:creative_data_access_hatch`, 4 `horizon_comm_terminal` (T17), 64 `pattern_memory_unit` |
| **Total** | | | **1,212** | GTNH: about 140 (section 5); x8.7 |

**Totals** (from the multipliers; guidance, section 7.1 targets in brackets):

| Item | Count | Target (about 10x GTNH) |
|---|---|---|
| Horizon frame part | 13,440 (ring 528 x 20 + upgrades 360 x 8) | 10,000-14,000 |
| Horizon compressed plate | 15,744 (upgrades 8,640 + ring 4,224 + iris blades 2,880) | 10,000-20,000 |
| MAX+ field generator | 4,192 | 4,000-4,500 |
| Horizon containment plate | about 6,000 | about 6,000 (GTNH 601) |
| Horizon processor (direct, through parts) | about 155,000 (8 per frame part, 8 per plate) | 100,000-200,000 |
| Meta-materials (shielding, waveguide, conduit, valve) | about 380,000 each (25 of each per frame part, plus chevron blocks) | GTNH about 378,000 total |
| Core crystals | 64 (2.56e8 mB of slurry: 4,000,000 mB each, one MAX fluid hatch) | GTNH 1 (128M L) x10 runs, without the two weeks |
| Fluids | kerr condensate about 2e10 mB; superfluid He-3 about 5e9 mB; molten kerr strange about 1e9 mB; crystal slurry about 2.6e8 mB; eight plasmas about 2.6e8 mB each | 1e10-1e13 L, split over many fluids |
| Horizon locks | 9 consumed (chevrons) + 1 kept (dial) | — |
| Creative items | 48 | GTNH 40 chaotic capacitors |

**Recipe types in the tree** (about 120): 12 grid rows; 4 condensate assembler, 4 loom, 1 blender, 2 crystal furnace, 4 press, 9 refinery rows; 58 line recipes (several steps each, about 265); creative rows 6; gate and dial rows. GTNH has about 32 (section 5): about x4 in types, x8.7 in grid crafts, x10 in key parts. Upstream lines: 58, each of 4 or more real steps (section 7.1 asks at least 10).

**Infrastructure** (GTNH section 4 mapping, section 7.3): AE2 extreme crafting → the hyper assembly array; BEC assembler → condensate assembler (no nanite or slowdown system); transcendent plasma mixer → multi-plasma blender; crystal blast furnace → horizon crystal furnace (no two-week runs); BHC superdense plates → bound-matter press; Eye of Harmony and Godforge matter → condensate refinery and the MAX+ places; creative capacitor bank → *Creative items*.

**Power and time.** Building rows run at 2^35-2^39 EU/t for 600-2,400 t. The dial row: V[MAX] x 4,096 A (2^43) for 1,200 t = 10,555,311,626,649,600 EU (1.06e16), about 256 times MAX's last recipe, through one 4,096 A wireless hatch from the network's store, which the horizon capacitor bank holds; a 2^39 EU/t plant recharges it for the next dial in about 20,211 ticks (*Power*). Time is never the cost: with parallels on the Hyperfactory and several condensate assemblers, the critical path is set by condensate output and AE2 throughput, not by tick counts.

**The dial row.** Controller c1: 1 `genome_archive` (MAX gene ark: the one thing that crosses with the player) + 1 `cloud_phase_map` (MAX machine 11) + 16 `horizon_phase_lock` + 64 `jacketed_condensate_cell` + the kept `horizon_lock` → the gate opens for 1,200 ticks and outputs `spent_dial_charge` (→ refinery recharge row). Repeatable: each opening needs a new archive and charge, so a second player or a second crossing pays again.

**The dial's power (XP-G1).** The row runs at `GTValues.V[GTValues.MAX] * 4096` EU/t (a long) on the 4,096 A wireless hatch, as written: no overclock, no parallels (IDENTITY). A run-start check (the `ev/cryogenic_plant.js` pattern with `lib/fresh_run.js`) lets it start only when the formed horizon capacitor banks on the network have at least 1,200 x 2^43 EU of capacity and the store holds 1,200 x 2^43 EU less what the hatch already holds, so a dial never starts on a charge it cannot finish. Other draws on the network during its 1,200 ticks come out of the same store; the bank's 80 spare ticks are their margin.

## Quests

Reforge rule 5 (DECISIONS.md:698) and docs/research/quest-books.md section 5: six chapters per stage (what's new; materials processing; wafers and circuits; machines and multiblocks; integration; capstone), so 18 chapters, about 60-80 age quests each stage *(tune)*, plus one tracked-item quest per line intermediate (about 265 for P1-K4, the Star Technology pattern). Every machine, material and the Hyperstargate tree is taught: what it is for, how it is made, what it needs, what it unlocks and how to automate it, with AE2 sizing quests (cells, CPUs, providers) before the grid layer. Rewards are proportionate and never skip a line. Sources: Star Technology (MIT) and Monifactory (LGPL-3.0) late chapters may be adapted with CREDITS rows (DECISIONS.md:705); GTNH's Stargate questline is ideas only. The last quest is the arrival; it completes on entering the final dimension and gives nothing.

## The ending

**The crossing.** While the dial row runs, the ring's interior plane is open. A player who walks into it is moved to `grindless:horizon_city` at a fixed arrival point (a KubeJS player tick check against the ring's box at Sgr A\* orbit, then a teleport; S0-9). Nothing else crosses.

**Arrival.** On a player's first arrival: the vanilla `WIN_GAME` packet (the credits, the same path MAX-C3 proved on a client: gg_test_max_credits, bench i39, DECISIONS.md:693; the player stays alive and in place), a title *Beyond the Horizon*, the book `grindless:epilogue` (the renamed `max_epilogue`) and the last quest. Game mode never changes. The world goes on: people travel home by Waystones or FTB home, as they always have.

**The final dimension** (`grindless:horizon_city`): a vanilla datapack dimension (dimension type, a void or flat generator with no ores and no caves, one custom biome with fixed dusk light, fog and a dark sky; no weather, no mob spawns, no loot tables) and hand-built ruined futuristic cities placed as jigsaw structures from NBT templates: monumental towers broken mid-height, bridges that end in air, plazas of glass and pale stone, a striking skyline against a sky that holds the lensed ring of the horizon. Built from blocks already in the pack (vanilla, Architect's Palette, Rechiseled, Chipped, Macaw's). **No mechanics, research or blueprints inside**: no machines, no recipes with this dimension as a site, no ores, no loot, no quests but the arrival, no text in the world beyond the epilogue. It is a place to look at, not to use.

**The ending text** (the epilogue book; English; Phase 6 may set it in type):

> The gate held. On the far side of a horizon that should have had no far side, there was ground, and on the ground a city. It was older than anything you had built, and it had been built by someone who had done what you did: the drills, the furnaces, the long lines of machines, the stars harvested one by one, the last hole in the middle of everything held still for one moment of crossing. Whoever they were, they had arrived, and stayed, and gone quiet. Their towers still stand. Nothing here needs you. Nothing here can be made. You brought one thing across: an archive of every living line you ever grew, sealed in silica, waiting. What you do now is not written in any recipe. Look up. That is the way you came.

**Built (XP-Z1b, `server_scripts/grindless/maxplus/ending.js`).** Every 5 ticks, if a player is online, the script reads `global.grindless.hyperstargate.gates()` (XP-G1) and records each gate's openings in the world's persistentData (`grindless_ending_gates`: per gate a run counter, an open flag and a used flag). The first player (not a spectator) inside an open, unused gate's box in its dimension crosses; that opening then admits no one, and a restart keeps it used. A new opening (closed, then open) is a new run. The plaza (`arrival_plaza` at the table's origin) is placed once by `/place template` after a `forceload` of its chunks, before the first teleport (world flag `grindless_ending_plaza`). First arrival per player (flag `grindless_ending_arrived`): title *Beyond the Horizon*, one `grindless:epilogue`, and 110 ticks later `WIN_GAME` 1.0 (flag `grindless_ending_credits`; a player who logs out first gets it on the next login). Later arrivals only teleport. The book is path (a): the server right-click handler sends the KubeJS data packet `grindless_epilogue_open`, and `client_scripts/grindless/maxplus_epilogue_book.js` opens a vanilla `BookViewScreen` from a client-built written book whose six pages are lang keys (`maxplus_ending_lang.js`; joined they are the text above).

**Why this ending is not a creative ending.** Nothing is unlocked and no game rule changes; the reward is a place and an ending (journey.md *What other packs do*: avoid "creative" endings that cancel the logistics).

## Validator

XP-C1 adds `tools/analysis/tiers/maxplus.json` and `-Tier maxplus` as a pseudo-tier 15 in our tools only (`kubejs_static.mjs` `TIER_NAMES`/`TIER_PREFIX` gain `maxplus`; GTM is untouched). Checks: MAX+ controllers take at least 8 `maxplus_*` components from 3 families and 4 `horizon_processor`; no MAX+ recipe takes a lower-tier circuit as its highest; every row is ≤ VA[MAX] or written as V[MAX] x A; the only rows above 2^39 are the dial; every generator 1.3-2.5x; no recipe outputs a creative item except the six hyper assembly rows; nothing in `grindless:horizon_city` is a recipe site; re-count 17 / 58 (265 steps) / 185 on 56 machines; the *Bootstrap check*. Exemptions with reasons: `ig_relay_probe` (travel item), the casings and structure blocks, the creative items (their own rule).

## Mods and evidence

**No new mod.** GTM 7.5.3, GCYR (four datapack planets at tier 14), KubeJS, AE2 with MEGA Cells, ExtendedAE, Expanded AE (installed, DECISIONS.md:42), and decorative mods already in the pack for the city. Reuse stance: GTNH (NewHorizonsCoreMod GPL-3.0, GT5U LGPL-3.0, modpack CC BY-NC-SA 4.0) is ideas and numbers only (gtnh-stargate.md section 8; CREDITS.md rules); nothing is copied. Star Technology (MIT) has stargates but no traced recipe (gtnh-stargate.md section 9); not used.

| GTM 7.5.3 fact | Source |
|---|---|
| V[] ends at 2^31 (long); VA[MAX] = 2,013,265,920 | GTValues.java:60-73 |
| `ALL_TIERS` ends at MAX; `MAX = 14` | GTValues.java:104, :107-108 |
| `VEX` and `MAX_TRUE = 30` only label voltages above MAX | GTValues.java:84-88, :105 |
| A voltage above `Integer.MAX_VALUE` is tier MAX | GTUtil.java:234-236 |
| `gtceu:max_substation_input_hatch_64a` exists | `tables/opv_ids.json:14` (registry dump) |
| Hatch buffer V x 16 x A, long | EnergyHatchPartMachine.java:54-60 (max.md *Mods and evidence*) |
| Parallel hatch `(int) Math.pow(4, tier - EV)` | ParallelHatchPartMachine.java:37 |

## Risks

- **Huge amperage (S0-1, S0-2, S0-11).** Settled for the dial (XP-D1): one 4,096 A wireless MAX+ hatch carries 2^43 from the capacitor bank's store, and big rows run on 1,024 A MAX+ hatches. Open until XP-W2's T1: a 1,200 t dial with the store above 2^53 (the store becomes a BigInteger), and other draws sharing the store during a dial (80-tick margin).
- **Generators above 2^30 (S0-4).** Fallback: more generators at 2^30.
- **Server cost.** The Hyperstargate (about 45 x 45 x 9) and the 33-cube shell in one dimension; the hyper assembly array's 81 buses. S0-8 measures structure checks; AE2 crafting plans of 1e9 items need the CPU sizes of *AE2*.
- **Creative items as blocks.** A missed placement path would let one run as a source. S0-7 covers block placement and AE2 drives; XP-C1 checks no recipe outputs them except the six rows.
- **The final dimension.** Large jigsaw cities may be slow to generate; S0-10 picks a structure size. Hand-built NBT is asset work (Phase 6 assets package).
- **Pack fiction load.** Kerr condensate, bound matter and the stationary horizon are fiction; every quest marks it; real physics anchors each machine.
- **Size against rule 7.** Lines level with MAX and crossings below it (*Why 58*); open question 2.
- **Unverified GTNH numbers** (gtnh-stargate.md section 9): BEC speed, BHC plates, nanites and singularities. We use only the counts in sections 3.1 and 5, which come from code at tag 2.9.99.

## Bootstrap check

| Needs | Input | First made by | Before? |
|---|---|---|---|
| Shell c4 | `horizon_lock`, seed wave packet | MAX c3; OpV forge | yes (`maxplus` grant) |
| Refinery, press controllers | MAX parts, `horizon_lock`-free inputs, `stream_bundle` | MAX | yes; built at home, carried to Sgr A\* |
| MAX+ components | P4 strand, C1-C7, T7 valve (fluid regulator), processors (Q1, Q2) | stage I lines at home and Sgr A\* | yes: no stage II product (the processor takes MAX's quantum memory node, not the void crystal) |
| Hills slingshot, `ig_relay_probe` | P15 (belt, MAX furnace), P16 (OpV, UHV) | MAX and older | yes |
| Gate c16 | 64 A hatch, kept lock | GTM, MAX c3 | yes |
| Lift, crucible, burner controllers | MAX+ components, P20, P21, P17 | stage I | yes; carried to 30 Doradus |
| Gas works, torus | P23, P22, P11 | stage I lines; field press (OpV) | yes |
| Blueshift forge | P13 tether (P4 + Cygnus elevator), P24 window | stage I | yes |
| Void crystal fab | MAX+ components | stage I | yes |
| Blender | P6, P12, jet plasma, stellar plasmas | stages I-II | yes (stage III) |
| Crystal furnace | slurry, P3, P14 | stage II-III | yes |
| Condensate assembler, loom | P2, P3, P4, T4-T7 | stages I-II | yes |
| Creative items | K1-K4, A3, MAX+ parts | stages I-II | yes |
| Hyperstargate | grid crafts, crystals, creative items, 9 + 1 locks, archive | stage III | yes |

No controller consumes its own product; no home recipe takes a far product before its substage.

## Considered and dropped

Machines (2 short of 19):

1. **SN 1987A remnant harvester** (LMC). Titanium-44 and fresh ejecta dust are real (Boggs 2015, Science 348:670; Matsuura 2015, ApJ 800:50) but have no MAX+ consumer that is not a second route.
2. **Second mirror shell at M31\*.** A second route to the condensate.
3. **Magellanic H I cold-cloud harvester.** A second route to the gas works.
4. **Giant Stellar Stream quarry** (M31; Ibata 2001, Nature 412:49). Metal-rich debris: a second route to the belt.
5. **Component nexus** (a MAX+ component assembler). Assembly; GTM's assembly line and the Hyperfactory do it.
6. **Dial computer.** GTM's own computation (HPCA) and the creative computation provider cover it; data only.
7. **Fermi bubble collector, PeVatron.** Energy with no fuel (rule 8).
8. **M87\* or other distant galaxies.** Each would be a place with no product the Local Group lacks.

Lines (28 short of 86, as guidance): separate refinery rows per older exotic matter beyond P2, P3, P5 (second routes); per-blade iris variants (assemblies); a MAX+ battery cell (the capacitor bank stores); per-place navigation cores for c17-c19 (one recipe); a WHIM oxygen line (O VII has no use); ime-ash sulfur and calcium as separate lines (P8 returns them); more creative cores (the six items share four cores honestly). Open question 2.

## Build order

One Sonnet session per package, AGENTS.md *Work packages*; at most two implementation workers at once in the efficiency pilot; T1 only where a mechanism is new. MAX's route fixes (max.md MX-R1, MX-R2) and MX-E1 come first: MAX+ cannot be priced or opened without them.

| # | Id | Scope | Likely files | Depends on | Tests |
|---|---|---|---|---|---|
| 1 | **XP-R0** Cost row | Add the MAX+ stage rows (894,070; 4,470,350; 22,351,750) to Phase 2's factor table and price the nine MAX+ components and the creative items against them. | Phase 2's cost table (`tools/analysis/cost_matrix.json` or its successor) | MX-R2 | T0 |
| 2 | **XP-S0** Spikes | S0-1 to S0-10 below, one branch, no shipped content. | bench overlay only | MX-E1 | T1 per spike |
| 3 | **XP-F1** Ids, places, materials | `tables/maxplus_ids.json` (every id here, `circuits` block), four GCYR planets and relay rows, `G.maxPlusTravel`, `gtceu:kerr_strand`, nine components, `horizon_processor`, casings, fluids, lang en_us/es_es. | `startup_scripts/grindless/maxplus/foundation.js`, `travel.js`, `data/grindless/gcyr/planets/`, lang | XP-S0 | T0; T1 places load |
| 4 | **XP-F2** Obtain and cuts (integrator) | `hidden_until` (`maxplus` substages, creative items to `maxplus-gate`), placement guard, `tiers/obtain.json`. | integrator files | XP-F1 | T0 |
| 5 | **XP-W** Power plumbing | 64 A substation rows with `cold_kerr_fcl` (P18), custom 1,024 A hatch if S0-2 passes, case 14 cap rows for 1,024-4,096 A, kerr strand cable. | `maxplus/power.js`, `tables/wireless_energy.json` | XP-F1 | T0; T1 one 2^37 row |
| 6 | **XP-A1** Condensate | Shell c4, machines 1-2, P1-P5. | `maxplus/condensate.js`, MAX `shell.js` (c4 only), older tables | XP-F1, MX-E1 | T0; T1 c4 with kept lock |
| 7 | **XP-A2** Components | C1-C7 and the nine components. | `maxplus/components.js`, older tables | XP-A1 | T0 |
| 8 | **XP-A3** Processor | Q1, Q2, the photonic hall join. | `maxplus/circuits.js`, older tables | XP-F1 | T0 |
| 9 | **XP-T1** Slingshot and c16 | Machine 3, P15, P16, gate c16, `maxplus-lmc`. | `maxplus/slingshot.js`, `tables/gate.json` (1 row) | XP-A2, XP-A3, XP-W | T0; T1 throw and arrival |
| 10 | **XP-B1** Tarantula | Machines 4-6, P6-P8, P17, P20, P21; mass filter and FRC former site rows. | `maxplus/tarantula.js`, `tables/cygnus_lift.json`, `tables/cygnus_disk.json` | XP-T1 | T0; T1 burner output (S0-4) |
| 11 | **XP-T2** Gates c17-c19 | Warp gate rows from 30 Doradus and M31; three platforms. | `tables/gate.json`, `uhv/gate.js` (sites) | XP-T1 | T0; T1 second hop |
| 12 | **XP-B2** Stream | Machines 7-8, P9-P11, P22, P23. | `maxplus/stream.js` | XP-T2 | T0; T1 torus output |
| 13 | **XP-B3** Andromeda | Machine 9, P12, P13, P24. | `maxplus/blueshift.js` | XP-T2 | T0 |
| 14 | **XP-B4** Filament | Machine 10, P14. | `maxplus/void_fab.js` | XP-T2 | T0 |
| 15 | **XP-M1** Hyperfactory and parallel hatch (lib, integrator-run) | x4,194,304 hatch; the mega member. | `lib/parallel_hatch.js`, `maxplus/hyperfactory.js` | XP-A2 | T0; T1 parallel count |
| 16 | **XP-AE** AE2 scaling | A1-A3; MEGA, ExtendedAE, Expanded AE re-gates. | `integration/` AE2 scripts | XP-A3 | T0 |
| 17 | **XP-H1** Meta-materials | Machine 11, T4-T7. | `maxplus/loom.js` | XP-A1 | T0 |
| 18 | **XP-H2** Crystals | Machines 12-13, T8-T10. | `maxplus/crystals.js` | XP-B1, XP-B3 | T0 |
| 19 | **XP-H3** Condensate assembler and bank | Machines 14-15, T1-T3, T14-T16, P25. *As built:* XP-H3 built machine 14 and its lines; machine 15, the horizon capacitor bank, is its own package after XP-W2 (XP-D1: it is a network store, so it needs XP-W2's exact store; it runs beside XP-H4a, whose grid row makes `horizon_capacitor` under the same id). | `maxplus/assembler.js`; the bank: `maxplus/capacitor_bank.js` and the wireless files | XP-H1; the bank: XP-W2 | T0; T1 bank capacity |
| 20 | **XP-K** Creative items | K1-K4, the six rows, the placement guard test. *As built:* the four cores only (#144); the six rows move to XP-H4a with the array they run on, and the guard test is moot (S0-7: stand-ins). | `maxplus/creative_cores.js` | XP-B4, XP-AE, XP-H3 | T0 |
| 21 | **XP-H4** Grid layer | Machine 16, T11-T13, T17, P19, the twelve grid rows. Split by the integrator: **XP-H4a** (#150: machine 16, the Hyperstargate's parts, which XP-F1 had not registered, the grid rows but the controller's, and the six creative rows) and **XP-H4b** (#149: the five lines' older-machine steps). Neither needs XP-H2: the crystals feed only the controller row, which moves to XP-G1. | `maxplus/grid.js` (XP-H4a), `maxplus/grid_lines.js` (XP-H4b) | XP-H3 (both); XP-H4a's creative rows take XP-K's cores | T0; T1 the array runs its widest row (XP-H4a) |
| 22 | **XP-G1** Hyperstargate | Machine 17, structure, dial row; the controller's grid row (moved from XP-H4). | `maxplus/hyperstargate.js` | XP-H2, XP-H4a, XP-H4b, XP-K, the bank | T0; T1 forms and dials (S0-8, S0-11) |
| 23 | **XP-Z1** Final dimension and ending | `grindless:horizon_city` datapack, crossing teleport, `WIN_GAME`, title, `epilogue` book; structures from the assets package. Split by the integrator: **XP-Z1a** (the dimension, its generated city and sky, the arrival plaza template; no dependency) and **XP-Z1b** (the crossing and the arrival, after XP-G1). | `data/grindless/dimension*`, `worldgen/`, `structures/horizon_city/` (XP-Z1a); `maxplus/ending.js` (XP-Z1b) | XP-Z1a: none; XP-Z1b: XP-G1, MX-E1, XP-Z1a | T0; T1 the city generates (XP-Z1a); T1 arrival rolls credits (XP-Z1b, proof reuse of i39 for the packet) |
| 24 | **XP-C1** Validator | *Validator*. | `tools/analysis/tiers/maxplus.json`, test | all | T0 |
| 25 | **XP-C2** Quests data | *Quests* as data for Phase 5. | `tools/quests/maxplus-chapter/` | XP-C1 | T0 |

Serial: `lib/` (XP-M1), `tables/gate.json` (XP-T1 then XP-T2), the integrator files. Assets (city NBT, textures, sounds) are a Phase 6 package that XP-Z1 waits for.

## S0 spikes

| Spike | Question | If it fails |
|---|---|---|
| S0-1 | Does a recipe at V[MAX] x 4,096 A (2^43) run on 64 MAX 64 A substation hatches, long end to end? | dial at 2^39 for 19,200 t (open question 6) |
| S0-2 | Can KubeJS register a MAX energy hatch with 1,024 A? | 64 substation hatches |
| S0-3 | Does a KubeJS `kerr_strand` cable carry 256 A at V[MAX]? | item only; wireless |
| S0-4 | Does a KubeJS generator multiblock emit above 2^30? | several 2^30 generators |
| S0-5 | Does a custom parallel hatch report x4,194,304 with long EU/t? | x1,048,576 (MAX's) |
| S0-6 | Do `ae2:creative_energy_cell` and MEGA's 256M cells and crafting storage exist with those ids in the pack? | replace with what the registry has |
| S0-7 | Does a `BlockEvents.placed` cancel stop every creative block outside creative mode, and do AE2 drives refuse the creative cell? | keep creative items as non-block ingredient items (`grindless:` stand-ins) |
| S0-8 | Does a 45 x 45 x 9 structure with 64 hatches form and re-check within the tick budget beside the shell? | smaller ring, same craft counts |
| S0-9 | Does a player tick check plus teleport into a datapack dimension work on a dedicated server? | a right-click key item at the open gate |
| S0-10 | How large can the city's jigsaw structures be before generation stalls? | fewer, smaller districts |
| S0-11 | Does one 4,096 A wireless MAX+ hatch in an `energy_input` cell carry 2^43 EU/t from the network store, exact as longs? | four 1,024 A wireless hatches |

**Result (XP-S0a, `docs/research/maxplus-s0.md`).** S0-1 yes: 2^37, 2^39 and 2^43 EU/t run as longs on 1, 4 and 64 substation hatches, but 2^43 sits exactly on the 64 x V x A cap. S0-2 yes: a 1,024 A hatch (buffer 2^45) carries 2^41. S0-3 inconclusive: the cable properties are accepted, but no cable flowed in the overlay, controls included (fixture); keep the fallback. S0-4 yes: generators emit 2^33 to 2^41, capped by the dynamo hatch's V x A (2^35 on 16 A, 2^37 on 64 A, 2^41 on 1,024 A). S0-5 yes by reflection (`Java.extend` is unavailable); 4,194,304 copies run, capped at `floor(supply voltage / EU/t)`.

**Result (XP-S0b, `docs/research/maxplus-s0-world.md`).** S0-6 yes: every id named here exists; GTM's widest MAX hatch is the 64 A substation hatch (S0-2's custom 1,024 A hatch is ours), and three more creative cells exist (`creative_item_cell`, `creative_fluid_cell`, AppFlux's `fe_creative_cell`), which XP-F2 hides. S0-7 no: a formation plane and a dispenser place every creative block without `BlockEvents.placed`, and AE2 drives refuse only the creative energy cell, so the fallback stands: the creative items are `grindless:` stand-ins that cannot be placed. S0-8 yes: the 45 x 45 x 9 ring with 64 hatches forms cold in 155 ms and re-checks in 74-85 ms; a raw block change does not re-check it, so the gate calls `checkPatternWithLock` itself. S0-9 yes on a dedicated server (106 ms, then about 6 ms a trip). S0-10 yes: plots up to 48 x 12 x 48, radius at most 128; no smaller fallback needed.

**Result (XP-D1, `docs/research/maxplus-s0.md`).** S0-11 yes (run vm-20261101-165330-3c0627e7): a 4,096 A wireless MAX+ hatch registered with the wireless builder (tier 14, `INPUT_ENERGY`) forms in `energy_input`, buffers 2^47 and ran a 2^43 EU/t row for all 60 of its ticks at exactly 2^43 from a 1.0555e15 store; steady settlements hand out exactly the `maxplusCaps` cap and every value balances as an exact long. Still unproven until XP-W2's T1: a full 1,200 t run with the store above 2^53.

## Decisions proposed

- 2026-11-01 MAX+ design (RF-7A): one era in three stages (out of the Galaxy; the Local Group; the Hyperstargate) with substages `maxplus`, `-lmc`, `-stream`, `-m31`, `-void`, `-gate`; four new GCYR places at tier 14 (30 Doradus, Magellanic Stream, M31 nucleus, Local Group filament); 17 multiblocks, 58 lines (265 steps), 185 crossings with OpV-and-older lines on 56 machines; the gap to the x1.5 line guide is stated, not padded.
- 2026-11-01 MAX+ voltage: no tier above MAX (GTValues.java:60-61, :107-108; GTUtil.java:234-236); MAX+ rows are V[MAX] x amps: machine rows ≤ VA[MAX], big rows 2^35-2^39 on 1,024 A MAX+ hatches, the dial 2^43 on one 4,096 A wireless MAX+ hatch fed from the horizon capacitor bank (XP-D1, S0-11; the 64-hatch path and the 2^39 x 19,200 t fallback are retired).
- 2026-11-01 MAX+ cost: x5 per stage on DECISIONS.md:708's row (894,070; 4,470,350; 22,351,750); each GTM creative block at least 1,000 stage III core indexes.
- 2026-11-01 MAX+ travel: the Hills slingshot at Sgr A\* throws the first intergalactic probe (gate c16); warp gates c17-c19 hop from there.
- 2026-11-01 MAX+ creative items: six kinds, 48 crafts, ingredients of the Hyperstargate only, never placeable outside creative mode; supersedes DECISIONS.md:102's "creative ending left out" for these items only; no game-mode change anywhere.
- 2026-11-01 Hyperstargate: GTNH's Stargate shape at about 10x (1,212 grid crafts, 13,440 frame parts, 15,744 compressed plates, about 155,000 processors, 64 core crystals), no inflated times, at Sgr A\* orbit; its dial consumes the genome archive and keeps a horizon lock.
- 2026-11-01 Ending: crossing the open Hyperstargate moves the player to `grindless:horizon_city` (ruined futuristic cities; no mechanics, research or blueprints); first arrival sends `WIN_GAME`, a title and the `epilogue` book; the world continues.

**CREDITS lines proposed:** "Hyperstargate (shape and order of magnitude) | GTNH Stargate (NewHorizonsCoreMod 2.9.99 `ScriptSGCraft.java`, GT5-Unofficial BEC recipes) | GPL-3.0 / LGPL-3.0 (ideas and numbers only) | The idea of a final gate built from grid crafts, a condensate assembler, a plasma mixer and a crystal furnace, and its scale as a reference; recipes, items, names and code are ours." No mod, asset or text is copied; the city is built in-house from blocks already in the pack.

## Open questions

1. **One era in three stages, or three eras?** **Default: one era, three stages,** each stage priced as one x5 step. If one era: one chapter set, one validator tier, the x1.35/x1.5 guide applies once (19 / 86 / 306). If three eras: each stage must be clearly bigger than the last (rule 7), so the guide compounds three times (about 26 / 194 / 690 by the third): far more lines than the Local Group's real processes support without padding.
2. **Accept 58 lines and 185 crossings, below the x1.5 guide?** **Default: yes, and run a second line pass after stage I is built**, from measured bottlenecks. If yes: the era is bigger than MAX in machines, places and quantity, level in lines. If no now: the next lines would be the dropped candidates, most of them second routes or assemblies.
3. **Cost per stage x5, or x5 for the whole era?** **Default: x5 per stage** (22,351,750 at stage III). If per era: stage III costs 894,070, only x5 of MAX, which the brief's "far beyond MAX" rules out.
4. **Creative items placeable after the arrival?** **Default: never placeable outside creative mode.** If placeable after arrival: harmless to progression (the pack has ended) but a player could carry one home and run free energy, which rule 8 forbids while the world continues.
5. **Can the player return through the gate, and does the dial repeat?** **Default: one-way; the dial repeats** with a new archive. If two-way: the final dimension becomes a place with a route home, which invites "using" it. If the dial runs once: a second player in the same world can never arrive.
6. **If S0-1 fails, the dial at 2^39 for 19,200 t?** **Closed (XP-D1, S0-11): no fallback.** The dial draws 2^43 for 1,200 t through one 4,096 A wireless MAX+ hatch from the network store the horizon capacitor bank holds; power limits how often the gate dials, never the dial's time (*Voltages, hull, hatches and controllers*, *No fallback*).
7. **The final dimension's name and title?** **Default: `grindless:horizon_city`, "Beyond the Horizon".** Any other is a rename before XP-F1 only.
8. **Does MAX's genome archive cross with the player?** **Default: yes** (the dial consumes it; the epilogue names it). If no: the gene ark keeps no role after MAX (max.md machine 4) and needs one, or goes.
9. **The ending text as written?** **Default: yes, owner edits welcome.** It states no fact about who built the cities.
