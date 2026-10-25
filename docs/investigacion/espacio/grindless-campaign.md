# Grindless: the campaign, summarized as a script for Gregtech Grindless

Source: the *Grindless* repo by Ezequiel24123z (MIT, the user's own), cloned into `research/space/grindless-earlygame/`, commit `30226c2` (main, 2026-10-23). I read it without modifying it.

The citations `file:line` are relative to that clone: **R** `README.md` · **D** `docs/DECISIONS.md` · **M** `docs/MACHINES.md` · **P** `docs/PROCESSES.md` · **B** `docs/BUILD-OUT.md` · **J/** `common/src/main/java/io/github/ezequiel24123z/grindless/` · **RES/** `common/src/main/resources/`. **GG:** is this repo and **S:** is the session's `files/` folder.

**Status in the source.** From T3 to T15 everything is design. The Moon, the Drift, Sagittarius, the rocket and the station exist as registered prototypes, but without a survival recipe (D:4952-4958, R:1182-1187). No tier is accepted (R:2229-2232).

**⚑ = change already decided for GG that is not in Grindless.** The Moon and the first rocket arrive at the end of HV. The ending is reaching the black hole and making it explode, and with it the universe (GG:DECISIONS.md:46).

---

## 1. The T0–T15 ladder

- **Energy.** Technology, controller and energy rise together with `F(n) = 8 × 4ⁿ` (R:253-256, R:274). It is GT's voltage ladder: LV–IV are aliases of F1–F5 (R:1332-1333). So T0 = ULV … T13 = OpV, T14 ≈ MAX, and T15 sits above GT.
- **Four lines.** Each tier braids materials, chemistry, control and energy. They cross during the tier and converge on the next tier's Control Matrix (R:8-10, P:368-371, P:424-433). From T2 on, no line closes its product without another (D:4930-4931).
- **Shape of each tier.** «an entry bootstrap, several interacting route expansions, a logistics or scaling problem, a signature project and a frontier matrix» (P:394-395). It grows through new decisions, not through quantities or times (D:4933-4935).
- **Matrix architectures.** Relay T1–T3, Integrated T4–T6, Superconducting T7–T9, Photonic T10–T12 (zero-g crystals, lasers, optics) and Causal T13–T15 (exotic matter, distributed clocks, relativistic control). Each one makes older ratings cheaper to fabricate (D:4908-4918).

Sources for the table: theme (R:1450-1467), lines M · Q · C · E (P:375-390) and ending (B:475-490). The rest is cited in the cell. The ending is always the next tier's Matrix or, at T15, the final goal (D:5016).

| Tier (F, GT) | Theme | Braided lines: M · Q · C · E | Signature | Places | Exclusive resource | Milestone | How it ends |
|---|---|---|---|---|---|---|---|
| **T0 Bootstrap** (8, ULV) | Escape velocity | M geological aggregate and metal fractions · Q ceramics, biomass and glass · C redstone and Data Core calibration · E F0 source and workshop | Connected workshop: Quern, Clay Mixer, Firing Chamber, Settling Trough, Geological Collector, Biocultivator, Biomass Dynamo (M:49-58) | Base world, Superflat first (R:3-4) | — | Hand-mining ends (R:1480) | 5 Relay Matrix T1, made by hand |
| **T1 Voltaic** (32, LV) | Basic families | M grinding, reduction, plates, rods, gears and renewable glass · Q water, roasting gases and ceramic insulator · C copper wire, coils, relays and Assembler · E thermal generator and first pylon | Thermal Generator, Pulverizer, Arc Furnace, Press and Assembler (P:439-440); the basic machine families (D:8174) | + optional Factory World, flat and with no free resources (R:2294-2299) | — | The Assembler ends hand crafting (R:1480-1481) | Relay Matrix T2 |
| **T2 Industrial** (128, MV) | Closed loops | M steel, B2/B3 washing, melting and casting · Q sulfur, synthetic redstone, electrolysis, air, brine and resin · C motors, pumps and hardwired logic · E steam and solar | Contact process (Chemical Reactor), Wire Mill, Chemical Washer, Electrolysis Cell and Atmospheric Intake (R:2369-2372) | Base world | — | — | Matrix T3 |
| **T3 Arc** (512, HV) | Powered construction | M refractories, hot fluids and hard alloys · Q first hydrocarbons and the Arc Cell's medium · C controllers, logistics boxes and Construction Drones · E Arc Reactor, fed | Direct-FU Arc Reactor with Arc Cells, and the Arc Exosuit with the same miniature reactor (R:967-984); drones up to ~15³ (M:593-596) | Base world. ⚑ GG: Moon and rocket | — | First multiblock designed (P:378) | Matrix T4, with drones and Arc Reactor running |
| **T4 Precision** (2 048, EV) | Purity and control | M electronic silicon, technical ceramics and recovered noble metals · Q high-pressure chemistry, nitric acid and HCl, etchant, polymers and ultrapure water · C lithography, Integrated Matrices, circuits and patterns · E power conditioning; campus with several lines | Lithography Unit (R:1801); Research Station, whose patterns are catalysts and not unlocks (R:1475-1478); Replicator (R:1833) | Base world | — | — | First Integrated frontier |
| **T5 Nuclear** (8 192, IV) | Designed cores | M cladding, moderators, reflectors and anti-radiation alloys · Q UF6, heavy water, coolant cleaning and reprocessing · C hardened controllers and sensors · E fission, exchangers and turbine halls | Parametric Fission Reactor that SCRAMs instead of exploding (R:1056-1070, M:633); centrifuge cascades (P:923-930); Deep Core Drill with «weighted planetary pool» (R:442-444) | Base world | — | — | Full fuel cycle and designed core |
| **T6 Cryogenic** (32 768, LuV) | Deep cold | M superconducting alloys and high-field magnets · Q liquid helium, cryogens and fusion fuel separation · C low-noise control and superconducting interconnect · E pulse banks and cryogenic grid | Cryogenic Plant and Superconductor (R:1803, R:1672) | Base world | — (deuterium enters here, R:1920; later it is Kryos's signature) | — | Cryogens, magnets and pulse ready for fusion |
| **T7 Fusion** (131 072, ZPM) | Sustained plasma | M antineutron walls, blankets and Containment Rings · Q D-T, D-D breeding and helium recovery · C plasma diagnostics · E sustained fusion; drones up to ~32³ | Fusion Reactor: the old grid pays for ignition and, if it loses containment, shuts down without damage (R:1072-1084); cycles D-T → D-D → D-³He → p-¹¹B (M:680-687) | Base world | — | — | Closed D-T loop with its blanket |
| **T8 Particle** (524 288, UV) | Custom nuclei | M isotopes, target foils and exotic precursors · Q target preparation and radionuclide separation · C beam timing and detectors · E the ring size decides the reactions | Particle Accelerator: transmutation, exotic synthesis (antimatter, exotic isotopes, strange matter), matter creation and research (R:1088-1095, M:672-674) | Base world | — (exotic isotopes enter here, R:1920; later they are Erebus's signature) | Scarcity becomes an energy problem (R:1097-1100) | Frontier exotics |
| **T9 Quantum** (2 097 152, UHV) | Programmable matter | M coherent substrates, metamaterials and programmable Matter · Q nanochemical deposition and quantum coolants · C Quantum Cores, replication and Quantum Assembler · E phase storage and aneutronic fusion | Quantum Assembler and Matter Condenser (R:1115-1116) | Base world | — (strange matter enters here, R:1920; later it is Erebus's signature) | The terrestrial factory is a campus (P:384) | Terrestrial campus with quantum control |
| **T10 Orbital** (8 388 608, UEV) | Ground and orbit | M composites, ablatives, vacuum alloys and zero-g crystals · Q propellants, life support and orbital cryogenics · C guidance, satellite buses, relays and Photonic Matrices · E rockets, Mass Driver and orbital solar; factory across two sites | Launch Pad and rocket, Mass Driver and Orbital Catcher, Orbital Platform, satellites and Rectenna, vacuum industry, Orbital Assembly Bay (R:1863-1892); Assembly Field (R:616-617); Exotic Exosuit (R:948) | Orbit and Moon; local flight does not leave the star (R:263-265, M:770) | Helium-3 (R:1199, R:1920) and vacuum and microgravity products (R:1170-1174) | First large-scale passive energy: the solar satellite (R:1154) | Ground and orbit form a supplied network |
| **T11 Planetary** (33 554 432, UIV) | Worlds as infrastructure | M regolith and construction materials of each world · Q atmospheric ISRU, closed life support and local fuels · C telepresence, Colony Cores, Deep Survey and interplanetary routes · E several worlds, Space Elevator and Horizon Gates | Telepresence Terminal and Proxy Frame, Colony Core, Drop Pod Bay, Interplanetary Router, Space Elevator, Horizon Gate and Deep Survey Satellite (R:1877-1893) | The six backup worlds or those from the space mod (§2.3) | Each world's signature resource (R:1197-1205) | **Kardashev I** (R:260-261) | Several worlds form an industrial system that recovers |
| **T12 Stellar** (134 217 728, UXV) | A star as infrastructure | M matter pulled from the star and Stellar Forge materials · Q stellar plasma separation and extreme media · C stellar photonic control and swarm coordination · E Dyson network and system industry | Stellar Forge and Dyson Network; Planetary Engine in T11–T12 (M:774-779) | The home star | Star-lifted matter (P:387) | **Kardashev II** | Stellar processing and Dyson at Type II scale |
| **T13 Interstellar** (536 870 912, OpV) | Several systems | M materials brought from several systems · Q long-life fuels, cryogens and closed-loop travel chemistry · C Causal Matrices, distributed clocks and process-state transport · E supraluminal station, the Drift and multi-system factory | Supraluminal Station and Causal Buffer (M:776-777) | The Drift and other systems | Components from other systems (P:388); the Drift gives nothing (D:4202-4203) | Leaving the home star (R:1465) | Several systems trade production over the supraluminal route |
| **T14 Galactic** (2 147 483 648, ≈MAX) | Industry that expands on its own | M industrial antimatter, stable exotic matter and singularity structures · Q annihilation media and galactic recovery · C self-replicating probes, causal routes and distributed computing · E singularity energy and abstract expansion | Singularity Reactor (R:1102-1106); Fusion Lance and Singularity Charge (R:1037-1040) | The galaxy, in the abstract | Industrial antimatter and stable exotic matter (P:389) | **Kardashev III** | Self-expansion, antimatter and singularity at Type III scale |
| **T15 Event Horizon** (8 589 934 592, no GT) | The galactic center | M relativistic shielding and anti-accretion structures · Q final cryogenic, plasma and antimatter loops · C galactic navigation, time and horizon telemetry · E the route to Sagittarius | Horizon infrastructure: approach, shielding and extraction (M:780) | Sagittarius | Accretion resources, already in the postgame (D:4947-4949) | Arriving is the victory. ⚑ GG: arrive and detonate | The full route reaches Sagittarius |

- **Multiblock scale.** Hand-built 3³–5³ (T2), drones ~15³ (T3–T5), swarms ~32³ (T6–T9), Assembly Field with chunk structures (T10–T12) and abstract construction fleets across worlds and systems (T13–T15) (M:593-599).
- **Late manufacturing.** In T10–T12 the orbital and field processes yield components, controllers and structural sections. In T13–T15 there is distributed production of huge systems, with no normal automatic machines (R:1621-1622).
- **⚑ Moon in HV.** In Grindless the Moon is in T10, which is numerically UEV. GG moves it forward seven tiers. Grindless's Launch Pad asks for «Particle-era materials, Quantum guidance and an Orbital Matrix» (R:1133), that is, parts from T8–T10 that do not yet exist at HV.

---

## 2. Space and places

### 2.1 How you travel

| Tier | Means | What it does | Source |
|---|---|---|---|
| T10 | Launch Pad + Rocket | The multiblock assembles and launches rockets. The rocket comes off a line and is used up at launch. It serves the first trip and anything that carries crew | R:1133-1134, R:1139 |
| T10 | Mass Driver | Sends cargo to orbit on energy alone. Cheap per kg and useless for anything fragile or alive. Turns space «from an event into infrastructure» | R:1135, R:1139-1141 |
| T10 | Orbital Platform | The station: launched modules that grow into a base | R:1136 |
| T11 | Space Elevator | Permanent ground-to-orbit link, high throughput and energy only. Makes the Mass Driver obsolete | R:1295 |
| T11 | Horizon Gate | A pair of rings. The far one is handed over once (rocket, Mass Driver or colony package). People pass cheaply; cargo can pass too, but costs more per kg than the Mass Driver. The addresses come from the Deep Survey. Nether and End only via datapack | R:1272-1284, D:2735-2748, M:704-711 |
| T13 | Supraluminal Station | The station is the interstellar trip: neither link nor rocket | M:777, D:4301-4303 |
| T15 | Final route | Galactic navigation and relativistic shielding to Sagittarius | P:390, D:4945 |

- **How the prototype does it.** The rocket rises one block per tick to the world's ceiling and opens a landing map with the base world and Moon. Nether, End, Drift and black hole are not on the map (D:4282-4290). The outbound trip costs 102 400 FU and the return is free, so the player is not left stranded in a world with no network (D:4291-4296).
- **The prototype station.** It rises to the ceiling and reaches the Drift (6 553 600 FU outbound). From the Drift to Sagittarius is free, and from Sagittarius you return for free to the saved bed (D:4384-4396, D:4470-4475, D:4489-4495).
- **Old links.** The Lunar Link and the Starward Link remain as test markers, not as shortcuts (R:1186-1187; RES/assets/grindless/lang/en_us.json:182-183).
- **Historical idea, not built.** Teleport orbs made from a magical material, just before space flight, to return to a planet already visited. «Not implemented. Not next.» (B:727).

### 2.2 Moon

- **Design.** «Airless, low gravity, close». Hazard: vacuum. Signature resource: helium-3, «premium fusion fuel» (R:1199). You reach it with the T10 local flight program, not with a teleport recipe (R:263-265, D:4079-4081).
- **Prototype.** Dimension `grindless:luna`, flat: 1 layer of bedrock and 64 of `grindless:lunar_regolith` (RES/data/grindless/dimension/luna.json:9-12, J/planet/PlanetCatalogue.java:30-33). End sky and fixed night (RES/data/grindless/dimension_type/luna.json:13, 25). No spawns or ores, and no vacuum damage or life support (D:4113-4117).
- **Helium-3.** All the Moon's veins are helium-3. It is the reagent `grindless:helium_3`, not an ore or a `forge:raw_materials`, so it cannot be mined with a pickaxe or appear in the Overworld (D:4100-4102, D:4119-4124, J/planet/PlanetCatalogue.java:14-16). The gas form is left for later (P:348).
- **What it is for.** D-³He fusion, aneutronic, «tying fusion to the orbital layer» (M:686, P:944). Together with Kryos deuterium it improves mature fusion (R:1309). The regolith benefits in T11 (P:386).
- **⚑ GG.** The Moon arrives at the end of HV, seven tiers earlier than in Grindless.

### 2.3 Backup worlds (if there is no space mod)

| World | Character | Hazard | Signature resource | What it is for, per the source |
|---|---|---|---|---|
| Moon | Airless, low gravity, close | Vacuum | Helium-3 | D-³He fusion (M:686) |
| Tharsis | Cold desert, thin atmosphere | Cold, dust storms | Very rich iron veins | Iron the Overworld already has (D:4090-4092) |
| Vulcan | Volcanic, hot, dense | Heat, ash | Heavy metals, geothermal energy | — |
| Kryos | Ice moon with an inner ocean | Extreme cold | Deuterium, cryogenic volatiles | Mature fusion (R:1309) |
| Erebus | Rogue planet, no star, dark | Darkness, radiation | Exotic isotopes, strange matter | «the strange-matter world» (D:2752) |
| Thalassa | Ocean, thick air | Pressure, corrosion | High-pressure chemistry, dissolved volatiles | Process conditions, not ores (D:2749-2751) |
| Helios | Tidally locked | Heat by day, cold by night | Extreme conditions, «not a second ore list» | Ditto |

Table from R:1197-1205. Thalassa and Helios were added with the Horizon Gate (D:2749-2751). The source names no other worlds; the other places are the base world, the Factory World, orbit, the Drift and Sagittarius.

- **Different planets, same materials.** Each world has its own distribution of veins over the same material registry: «Planets are not reskins» (R:1207-1211). «Do not invent unique untaggable ores that only exist there» (D:2752-2753).
- **Where you build matters.** Solar power depends on the distance to the star, each hazard needs its own life support, and gravity changes the cost of the Mass Driver (R:1213-1214).
- **Space mods.** The README says that, if there is a space mod, its planets are used (R:1189-1195). ADR-0088 reverses this (§5.3).

### 2.4 The Drift

- «the dark between the home star and the galactic centre» (J/star/DriftCatalogue.java:6-8). It is a single stop: a `grindless:drift_deck` surface over bedrock, with no veins. «It is not a planet and not a mining dimension» (D:4198-4203, RES/data/grindless/dimension/drift.json:9-12).
- It belongs to T13 and you reach it through the Supraluminal Station (R:1185-1186, D:4172-4173). A chain of named stars was rejected: «One hop is the route.» (D:4224).

### 2.5 Sagittarius, the galactic center

- **The place.** Dimension `grindless:sagittarius`: a solid mass of `grindless:horizon_shell`, 16 blocks thick, with no sky and a ceiling (D:4476-4478, RES/data/grindless/dimension_type/sagittarius.json:8-9, 16).
- **The room.** On arrival a 7×4×7 room is carved out, with the bed at (0, 2, 0), an Arrival Mark with light 15 and a 3×3 shaft to leave. That makes 286 cells. The shell and the mark are unbreakable and have no item. The room is carved again on every arrival, «so the room cannot be kept as a base» (D:4479-4488, J/centre/CentreChamber.java:15-16).
- **Arrival.** The message says «The galactic centre. Arriving is the victory.» (RES/assets/grindless/lang/en_us.json:358). Leaving returns you for free to the saved bed. The rocket never flies there (D:4489-4495).
- **Status.** The room is «a prototype destination, not the final amount of gameplay at the centre» (D:4949-4950). There is no black hole recipe before T15 (D:4958).

### 2.6 Stations and other places

- **Orbital Platform (T10).** «Your space station. Built from launched modules; expands into a real base.» (R:1136). The modules come out of the Orbital Assembly Bay (R:1174).
- **Supraluminal Station (T13).** A seat on a Station Berth. Reaching the ceiling is arriving, with no menu (D:4378-4383).
- **Factory World.** A flat world fixed at noon for building, with normal finite veins; it is not a resource shortcut (R:2294-2299, D:5417).

### 2.7 Satellites (T10; Deep Survey in T11)

- **No maintenance.** They are permanent: «no orbital decay, no refuelling, no maintenance minigame». They cost energy and launch mass (R:1147-1149, D:437-442).
- **Survey.** A vein map from orbit, «the single most useful object in the mod» (R:1153).
- **Solar Power.** Light without night, beamed to a Rectenna (R:1154).
- **Relay.** It carries the network to other dimensions and gives bandwidth, which telepresence and colonies use up (R:1155).
- **Sentinel.** Resonance map, warning of swarms and targets for orbital strikes (R:1156).
- **Logistics.** Drop pods and item routes between ground, station and colonies (R:1157).
- **Deep Survey.** Studies other planets; you need it to exploit one you have not visited (R:1158).
- The constellation is a design in itself: coverage, bandwidth and consumption (R:1160-1161).

### 2.8 Four ways to exploit a world (R:1216-1284)

1. **In person.** Fly, land and build, with the life support the hazard demands: exosuit or pressurized base (R:1221-1227). Exotic Exosuit with anti-radiation shielding and orbital life support (R:948); vacuum, heat and radiation modules in T10 (R:1919).
2. **Telepresence.** A Proxy Frame in the other world and a Telepresence Terminal at home. It uses bandwidth and energy, and latency grows with distance. If the body is destroyed, you lose the body, not the inventory: «Failure costs materials, never progress» (R:1229-1244).
3. **Colonies.** A Colony Core lands and works on its own. Its output depends on modules, vein richness and energy. It ships goods home by Mass Driver to an Orbital Catcher or by drop pod. Its integrity falls with the hazard and is restored with automatable supplies. It is simulated in the abstract, without force-loading chunks (R:1246-1270, D:415-421). In T11 Operator Drone routines run in colonies (R:692-693).
4. **Horizon Gate.** Walk through after the far ring is delivered (R:1272-1284).

### 2.9 Orbital logistics

Orbital Catcher (receives the Mass Driver capsules), Drop Pod Bay and Landing Beacon (surface delivery), Rectenna (beamed energy), Interplanetary Router (items between ground, station and colonies) and Space Elevator in T11 (R:1286-1295). «Presence is the gate; bulk is the driver.» (R:1306).

### 2.10 Orbital industry

- **Machines.** Vacuum Furnace (no oxidation, more purity), Zero-G Crystallizer (perfect crystals, «the only source of the substrates advanced circuits need»), Orbital Cryo Plant (space is already cold: liquefying costs a fraction), Vacuum Deposition Chamber (thin films and exotic alloys) and Orbital Assembly Bay (what gravity does not let you build) (R:1163-1174).
- **Why go up.** Vacuum and zero gravity are process conditions, and orbit is «a manufacturing necessity rather than a victory lap» (M:696-698). Orbital industry does not emit Resonance to the surface (R:1176-1178).
- **Routes.** The fourth route to electronic silicon is orbital: «A player in orbit stops thinking about it» (M:743-746, P:995). Ultrapure water has a vacuum route in T10 (P:1000). Photonic Matrices come from zero-g crystals (D:4912).
- **Every system gains something.** The network reaches other dimensions, satellites map veins, logistics become interplanetary, the suit is life support, and helium-3 and deuterium improve fusion (R:1297-1309).

---

## 3. Megastructures and ending

### 3.1 Kardashev

Type I is the energy of a planet (T11), Type II that of a star (T12), and Type III that of a galaxy (T14). They are named milestones: «A Flux Unit is not a physical watt» (R:258-261, D:3584-3587).

### 3.2 Megastructures and signature projects

| Project | Tier | What it does | Why it is not just a bigger machine |
|---|---|---|---|
| Ground Array | No tier | 3×3 ring that stores 6 553 600 FU | Prototype retired until the route places it (D:3978-3980, D:4025-4039) |
| Assembly Field | T10 | Materializes a whole blueprint | Structures measured in chunks (R:616-617, M:598) |
| Space Elevator | T11 | Permanent ground-to-orbit link | Orbit becomes part of the factory (M:773) |
| Horizon Gate | T11 | Pair of rings | «a milestone on the way, not the victory» (D:3590-3591) |
| Planetary Engine | T11–T12 | Long-term orbit control | Changes insolation and what a colony can process (M:779) |
| Dyson Network | T12 | Stellar capture | Type II scaling up an orbital system, «not one trophy block» (M:774) |
| Stellar Forge | T12 | Process at stellar temperature and pressure | Materials that no terrestrial or orbital chamber can withstand (M:775) |
| Causal Buffer | T13 | Stores process state, not objects | Large batches migrate between systems (M:776) |
| Supraluminal Station | T13 | Trip to the Drift | Interstellar transport (M:777) |
| Singularity Reactor | T14 | Microsingularity fed with Matter | The limit becomes carrying and coordinating energy. It supports Type III and the final route, but it is not the victory (R:1102-1106, M:778) |
| Horizon infrastructure | T15 | Approach, shielding and postgame extraction | Arriving is the victory; accretion and rotational energy stay useful afterwards (M:780) |

Before ADR-0107 the Dyson was a solar «Dyson Collector» in an orbital ring at F8–F9, «the source that outruns a singularity». The Stellar Forge was «necessarily orbital» and the Planetary Engine «moves a colony» (D:3988-3993).

### 3.3 Late-game energy, antimatter and self-replication

- **Energy.** F10 gives 8 388 608 FU/t and F15 8 589 934 592 FU/t (R:1347-1352). F15 is the last name. After arriving, the black hole infrastructure scales within T15 up to `Long.MAX_VALUE` FU/t, with no F16–F30 (R:1370-1372, D:4892-4897).
- **Antimatter.** It first comes out of the accelerator in T8 (R:1093). In T14 it is industrial, with annihilation media (P:389), and in T15 there are antimatter service loops (P:390).
- **Containment.** Liquid helium serves «later singularity containment» (P:345). The Containment Ring goes to «particle, singularity and horizon systems later» (R:1674).
- **Self-replication.** Galactic expansion is «abstract and self-replicating» and T14 brings «self-replicating probes» (P:401-402, P:389). But ADR-0188 corrects this: «The earlier self-replicating-factory interpretation overextended automation» (D:9121). Normal machines are assembled by hand (R:1575-1578, M:133). What replicates is probes and abstract expansion, not machines.
- **Final navigation and shielding.** Relativistic shielding and structures against accretion; galactic navigation, time and horizon telemetry (P:390, R:1467, R:2276).

### 3.4 Arriving, and what comes after

- **Goal.** «The goal is to reach the black hole at the centre of the Milky Way in T15. Arriving is the victory, and the way there is the station, not a link» (R:269-270).
- **A finite ending.** The interior is «a finite finale» (D:3593). «An empty "you arrived" anecdote» and «An endless second game inside the hole» are rejected (D:3637-3638).
- **Postgame T15.** «accretion resources, rotational-energy extraction and the climb toward the absolute Flux rate» (D:4947-4949). It is not one more tier, and you do not need it to win (R:271-272). «Making black-hole extraction the victory condition» was explicitly rejected (D:4976-4977).
- **The shortcut that was removed.** With Industrial recipes you could reach the centre at T2, skipping T3–T6 and all the Kardashev levels. «A survival victory at T2 makes the actual campaign optional.» (D:4846-4849, D:4974-4975).
- **⚑ GG.** Our ending replaces «arriving = victory» with arriving at and detonating the black hole, and with it the universe. It is still a finite ending, neither empty nor infinite. A possible reading that is not in Grindless: exploiting the black hole (accretion and rotational energy) stops being postgame and becomes the path to the detonation.

---

## 4. Design principles for space

- **Reward, not trophy.** «going to space must be a payoff, not a trophy»: every orbital object works for the base (R:1126-1127).
- **Space opens up the game.** «Factorio launches a rocket and the game ends. Here it is where the game opens up.» (R:1122).
- **No maintenance chores.** «no orbital decay, no refuelling, no maintenance minigame» (R:1147-1148). «Orbital upkeep would be a recurring chore» (D:441-442).
- **Infrastructure, not an event.** The Mass Driver «converts space from an event into infrastructure» (R:1140-1141).
- **Killing repeated travel.** «The Horizon Gate is what kills the commute» (R:1141-1142). Telepresence «deletes the commute» (R:1244). «gates remove repeated travel» (R:1482).
- **People through the gate, cargo through the launcher.** «Presence is the gate; bulk is the driver.» (R:1306). «People cheap, bulk expensive» (D:2742).
- **The gate is earned.** The far ring is handed over once: «That is the factory payoff, not a free portal.» (D:2739-2741).
- **Never a world just to mine.** «A Horizon Gate never opens a world whose only job is "more ore."» (D:2745-2746).
- **Planets as resource distributions.** «Planets are not reskins» (R:1209). No unique ores without a tag (D:2752-2753).
- **Location is a decision.** «*where* you build is a genuine engineering decision» (R:1213-1214).
- **Abstract colonies.** «Colonies are simulated abstractly, not tick-by-tick» (R:1259). «Force-loading remote bases is how servers die» (D:418).
- **Attention rhythm.** «a colony wants attention every few hours, not every few minutes», and that attention can be automated (R:1268-1270).
- **Failure costs material, not progress.** «Failure costs materials, never progress.» (R:1238-1239). Reactors shut down instead of exploding (R:1067-1070, R:1082-1083).
- **Returning is free.** The return costs nothing, so the player is not left stranded without a network (D:4293-4294, D:4394-4395).
- **Orbit is necessary.** «a manufacturing necessity rather than a victory lap» (M:698).
- **No trophies.** «Every endgame system has a real use. Nothing here is a trophy block.» (M:787-788).
- **You always have to build.** «Post-scarcity in *materials* is not post-scarcity in *throughput*.» (M:786).
- **Physics, not machines.** «at the end, the factory stops being made of machines and starts being made of physics.» (M:763-764).
- **Complexity yes, chores no.** «Complexity rises; chores do not.» (P:402). «Solving a larger problem is progression; repeating a solved action is grind.» (D:4938-4939).
- **Each automation removes a repetition.** The extractor removes hand mining, the Assembler removes crafting, the drones remove placing, the satellites remove prospecting, the gates remove travel and the colonies remove remote ticking (R:1480-1483).
- **No shortcuts.** «A survival victory at T2 makes the actual campaign optional.» (D:4974-4975).
- **Quests that do not block.** The book follows the route and never blocks a machine (R:280-281, D:4547-4553).
- **Old pacing.** «orbit is 25+ hours in» (R:2007), written for the old seven-tier ladder.

---

## 5. What happens to a GregTech pack, and what does not

### 5.1 Grindless mod systems that do not carry over

| System | Where | Why it does not carry over | What stays as an idea or GT piece |
|---|---|---|---|
| Flux Network: pylons, FU, proportional blackouts, soft undervoltage | R:295-347, R:1313-1413 | GT has EU, cables and its own voltage rules | The 8×4ⁿ ladder, which is already GT's |
| Control Matrices, five architectures, Research Station | R:1415-1483 | GT already scales with circuits and voltage | Each tier ends in an output item, and new technology makes the old one cheaper (like GT's circuit generations) |
| Veins per chunk, depletion, Deep Bore, Deep Core Drill | R:349-446 | GT has its own veins and drills | The beat where the satellite gives you the vein map |
| Matter replication: Scanner, Deconstructor, Replicator, Matter Condenser | R:448-482, R:1827-1834 | Its own system | Surplus material does not mean surplus production (M:784-786) |
| Belts, drones, Operator Drones, Flux Conduits, Phase Network | R:484-788 | GG uses GT pipes and AE2 | Multiblocks that grow with each era (M:593-599) |
| Fluids with temperature and pressure | R:790-910 | A different fluid model | — |
| Modular exosuits and miniature Arc Reactor | R:935-984 | GT has its own armor | «The Exosuit becomes life support» (R:1307). GCYR ships an Oxygen Spreader (S:gtm-src/GCYR_Machines.java:66) |
| Resonance, Aberrations, turrets and weapons | R:986-1046 | The mod's own system | Taking dirty industry to orbit (R:1176-1178), only if GG had something similar |
| Parametric multiblocks simulated before building | M:567-617 | GT uses fixed patterns | The size that grows with each era |
| Own quest book | D:4542-4553 | GG uses FTB Quests | That it blocks nothing |
| Registration by tags and integration with space mods | R:1925-1990 | The mod's infrastructure | «If a space mod is already installed, Grindless uses its planets» (R:1189-1193): GCYR already ships veins on the Moon and Mars (S:gtm-src/GCYR_Ores.java:22-27, 41-48) |
| Telepresence, Proxy Frame, simulated Colony Core, Horizon Gate, Interplanetary Router, drop pods | R:1216-1295 | They need their own code; they do not come out of GT parts or KubeJS alone | The beats of §5.2: rebuilt or left out |
| FU tolls, links and the rocket that rises to the ceiling | D:4127-4134, D:4282-4296 | The mod's numbers and blocks | Pay only the outbound trip and return for free |

### 5.2 What does carry over: campaign, beats and ideas

- **The arc.** The 16 named tiers with their themes, and the four lines that converge on an output item (R:1450-1467, P:373-390).
- **The milestones.** Kardashev I at Planetary, II at Stellar and III at Galactic (R:260-261), with the megastructures of §3.2 in between.
- **The places and their resources.** The Moon with helium-3, the six worlds with their signatures, the empty Drift and the sealed Sagittarius (§2).
- **The transport ladder.** Rocket, Mass Driver, station, elevator, gate, supraluminal station and final route (§2.1).
- **The satellites.** Map, beamed energy, relay, sentinel, logistics and remote survey, with no maintenance (§2.7).
- **The four ways to exploit a world**, as beats (§2.8).
- **Orbital industry as a reason to go up:** vacuum, zero gravity and cold (§2.10). GTM recipes accept `.dimension(...)` (S:gtm-src/ChemistryRecipes.java:102), so a process can require orbit and a resource can require its world.
- **GCYR pieces that already cover beats.** Dyson System Controller (S:gtm-src/GCYR_Machines.java:177), Space Elevator (:204), Space Station Packager (:125) and Drone Hangar (:248). Note: GCYR is frozen until the space design is reworked (GG:DECISIONS.md:50).
- **The prototype dimensions.** They are flat, MIT-licensed datapacks by the user (RES/data/grindless/dimension/{luna,drift,sagittarius}.json). They can be ported to `pack/kubejs/data/` by registering their blocks with KubeJS and rebuilding the Sagittarius room as a script (J/centre/CentreChamber.java). The attribution goes in `CREDITS.md`.
- **The principles of §4.**

### 5.3 Contradictions and gaps in the source

- **Planets.** R:1189-1195 and R:1979-1983 say «If a space mod is already installed, Grindless uses its planets». ADR-0088 reverses this («Planets are original», D:3588-3590), and R:1974-1977 keeps those rows as design on hold.
- **Horizon Gate.** ADR-0068 put it in T6 (D:2735); ADR-0107 moves it to T11 (D:4941-4945, R:1137).
- **Matrix name.** The Launch Pad asks for «an Orbital Matrix» (R:1133), but the T10 architecture is called Photonic (R:1436).
- **Dyson.** Collector at F8–F9 before ADR-0107 (D:3988-3990), versus the T12 Dyson Network (M:774).
- **Self-replication.** P:389, P:401-402 and R:1473 keep it; ADR-0188 trims it for normal machines (D:9121, R:1575-1578).
- **Moon.** The design has a vacuum hazard (R:1199), but the prototype has no vacuum damage or life support (D:4116-4117).
- **Black hole.** The interior must be «a finite finale» (D:3593), but the current room is only a test destination (D:4949-4950).
- **Open in the source.** The address format and the cost of the Horizon Gate (M:854-856). Also where the orbital line crosses the GT ending: «Grindless should complement rather than duplicate» (M:852-853).
