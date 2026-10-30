# Gregtech Grindless

GregTech progression pack for Minecraft 1.20.1 (Forge) on GregTech Modern 7.5.3. Its rule is simple: **nothing needed for progression is gathered by hand**. Starting in the Steam Age, resources are produced automatically through increasingly complex GregTech processing lines and multiblocks. Difficulty comes from steps, conditions and coordinating industry—not inflated quantities or waiting.

The journey starts on Earth, leaves it by rocket in HV and keeps going: the Moon, Mars, the inner planets, Jupiter's and Saturn's moons, the edge of the Solar System, nearby stars and, in UIV, neutron stars and a black hole.

**At a glance:** Minecraft 1.20.1 · Forge 47.4.28 · GregTech Modern 7.5.3 · 224 mods · 12 tiers playable (Steam to UIV) · 237 multiblocks of our own in v0.14.0.

**Contents:** [Design rules](#design-rules) · [Current status](#current-status) · [Tier by tier](#tier-by-tier) · [Our multiblocks](#our-multiblocks) · [Multiblocks from other mods](#multiblocks-from-other-mods) · [Ideas from other modpacks](#ideas-from-other-modpacks) · [Other mods](#other-mods) · [Quests](#quests) · [Known issues](#known-issues) · [How to play](#how-to-play-prism-launcher) · [For developers](#for-developers)

## Design rules

- **No hand gathering.** Hand mining only starts the game. The Horizon Collector you start with slowly makes the basics; from the Steam Age on, vein drills, greenhouses, simulators and harvesters supply everything.
- **Complexity, not quantity.** Eras get harder through more steps, conditions, multiblocks and lines that cross each other—never through inflated amounts or recipe times.
- **Honest byproducts.** Every byproduct goes somewhere: inert ones can be voided, dangerous ones must be contained, and future uses are stated.
- **Multiblocks that pay off.** Every era has multiblocks of ours that gain something: speed, throughput, a recipe impossible at small scale, or several steps in one.
- **Generous power, never free.** Boilers make ×8 steam and generators ×2 EU per fuel (GregTech Leisure style). Later eras keep that with better fuels and more complex plants; nothing makes energy from nothing.
- **Short quests.** Quests are in English, give small rewards and never block recipes.
- **GregTech Modern wins** whenever these rules conflict with it.

## Current status

The latest playable release is **v0.14.0 "UIV"**. It spans the Steam Age through UIV, with the journey extending from Earth and the solar system to neutron stars, pulsars and the black hole Cygnus X-1.

| Progress | Status |
|---|---|
| Steam Age–UIV | Playable in `v0.14.0`; each era adds automated resource production, processing lines and multiblocks. |
| UXV | In development for `v0.15.0`: the next stage of the interstellar journey. Its 22 multiblocks are already on `main`. |
| OpV and MAX | Planned after UXV; the journey's final project is at Sagittarius A*. |

The UIV release adds three stellar destinations, new UIV industry and wireless power, and opens the gate to UXV. See the [v0.14.0 release notes](docs/releases/v0.14.0.md) for the full list and save-impact details. The [journey guide](docs/journey.md) describes the planned progression through MAX.

## Tier by tier

Each era sends you somewhere new for a resource that only exists there, and each one ends at a gate that needs the era's main line running. The number after the highlights is how many multiblocks of ours the era adds. Detailed designs are in [`docs/eras/`](docs/eras/).

| Tier | Where you go | What the era is about | Some of our multiblocks |
|---|---|---|---|
| **Steam** | Earth | Coke, bricks, bronze, boilers and steel. Steam vein drills and greenhouses end hand mining before you leave. | Steam vein drill, steam greenhouse, coking battery, steam blast furnace, large steam machines (16) |
| **LV** | The Nether | The first electric factory: small chemistry, centrifuging, ore washing and circuits. AE2 unlocks in full, and a global wireless EU network opens. | Wireless energy tower, generator array, heliostat tower, submerged arc furnace, sulfide roaster, wire works (9) |
| **MV** | The End | Polymers, fuels, silicon wafers and renewable carbon; lines start to cross. One multiblock replaces ten loose machines. | Ore plant, biorefinery, polymer works, four universal factories, advanced multi smelter, weather controller (13) |
| **HV** | The Moon | Oil refining, cracking and plastics; cleanroom and EV circuits; titanium exists only on the Moon. Ends with the first rocket. | Refinery, reformer, syngas plant, coil chemical plant, engine test stand, composite autoclave, lunar drill (9) |
| **EV** | Moon base, Mars | Titanium, platinum and fine chemistry. The Moon base runs on its own; ME hatches connect multiblocks to AE2; nano circuits. | Platinum plant, regolith cell, cryogenic plant, lunar solar array, sealed dome, atmosphere processor, combined-cycle plant (12) |
| **IV** | Venus, Mercury | Nuclear power by design (uranium from the End), naquadah, iridium and osmium, and an assembly line fed by AE2. | Fission reactor, hot cell, fuel fabrication plant, heavy water plant, naquadah plant, Venus heat engine, Mercury solar field (16) |
| **LuV** | Earth orbit, asteroid belt, Io, Europa, Ganymede | Cryogenics and superconducting tape, asteroid metals, and Europa's life turned into wetware. GTM's first fusion reactor makes europium. | Helium refrigerator, coated conductor line, asteroid processor, cryobot, organoid lab, orbital solar station (21) |
| **ZPM** | Saturn, Titan, Enceladus, Uranus | Naquadria, fusion Mk2 and the large naquadah reactor. Every outer base is an orbital station; samples come up by probe and siphon. | Gas giant siphon, ring harvester, tholin reformer, naquadria refinery, direct energy converter, qubit fab (28) |
| **UV** | Neptune, Triton, Pluto, the Kuiper Belt | Accelerators and isotopes, fusion Mk3, and a laser-sail probe sent to Proxima Centauri. | Synchrotron, accelerator-driven reactor, muon fusion cell, laser fusion chamber, laser sail launcher, mega factory (32) |
| **UHV** | Proxima Centauri b, Mercury orbit | Kardashev II: a Dyson swarm around the Sun, a warp gate to Proxima, the space elevator, a nuclear clock and photonic circuits. | Swarm segment foundry, swarm control station, warp gate, high-flux reactor, nuclear clock lab, quantum fabricator (32) |
| **UEV** | Alpha Centauri A and B, Barnard b, Sirius B | Superheavy elements, megabar matter, single-photon optics, the optical computer and our fusion Mk4. | Calutron, heavy-ion cyclotron, megabar press, photonic integration hall, stellar forge, UEV fusion reactor (26) |
| **UIV** | RX J1856 neutron star, PSR J0437 pulsar, Cygnus X-1 | Reached through the warp gate. Metallic hydrogen, refractory alloys, the optical mainframe, fusion Mk5 and energy from a black hole's spin. | Penrose engine, Matrioshka computer, neutronium compression hall, ramp-compression pulser, levitation melter (23) |
| **UXV** *(in development)* | Cygnus X-1 again, Vela pulsar, Cassiopeia A | Star lifting, accretion-disk plasma, nuclear pasta, spintronics and fusion Mk6. | Stellar elevator, accretion disk skimmer, plasma mass filter, pasta extractor, Blandford–Znajek dynamo (22) |
| **OpV, MAX** *(planned)* | Kugelblitz forge, Sagittarius A* | Kardashev III, ending with a mirror shell around the galaxy's central black hole. | — |

## Our multiblocks

Every machine in this section is ours, built with KubeJS on GregTech Modern (machine ids use the `gtceu:` namespace, parts and items `grindless:`). Every one has an EMI info page that explains what it does. The complete list by era is in [`gg_test_form_sweep_ids.json`](tools/test/overlay/kubejs/config/gg_test_form_sweep_ids.json).

- **Resource production.** Vein drills from steam to IV (Steam, LV, MV, HV, EV, the lunar drill, Venus's pressurised drill and Mercury's drill) mine the vein a sample marks, indefinitely; drill bits wear out. Greenhouses run from steam to HV, then become the sealed dome on the Moon and Mars, the hydroponic ring in orbit and the xenobotany greenhouse on Proxima b. Each later destination has its own harvester: harpoon anchor drill, gas and ice giant siphons, ring harvester, regolith excavator, Barnard core drill, crust lift and more.
- **Steam families.** Small steam multiblocks with 8 parallels (alloy smelter, compressor, forge hammer, mixer, chemical bath, ore washer) and large steam machines with 64 parallels (macerator, centrifuge, ore washer, chemical bath, thermal centrifuge).
- **Plants that turn a line into one machine.** The ore plant (MV), biorefinery (MV), refinery and reformer (HV), platinum plant (EV), rare-earth extraction cascade (EV) and naquadah plant (IV) run a whole processing line with its loops closed inside.
- **Mega family.** Quality-of-life multiblocks with energy-bound parallels and batch mode:

  | Tier | Machine | What it gains |
  |---|---|---|
  | LV | Wire works | Wiremill and bender throughput |
  | MV | Polymer works | Ethylene to polyethylene sheet, three steps in one |
  | HV | Coil chemical plant | Large chemical reactor with coil-scaled parallels and perfect overclock |
  | EV | Ore refinery | Four ore-processing steps in one |
  | IV | Smelting complex | EBF and vacuum freezer in one, no hot ingots to move |
  | LuV | Mega chemical complex | The massive chemical reactor |
  | ZPM | Assembly hall | Bulk assembler and circuit assembler |
  | UV | Mega factory | Modular factory: each module adds recipe types |
  | UHV | Quantum fabricator | Assembler, circuit assembler, press, engraver and cutter with perfect overclock |

  The MV universal factories (assembly, mixing, processing and separation) and the advanced multi smelter belong to the same idea. Our parallel hatches continue GTM's IV–UV ones from UHV to UXV.
- **Power.** The generator array (up to 16 LV generators), heliostat tower, lunar solar array, combined-cycle plant, fission reactor, Venus heat engine, Mercury solar field, orbital solar station, direct energy converter, Dyson swarm and Penrose engine, plus fusion reactors Mk4–Mk6 after GTM's Mk1–Mk3. The wireless energy tower stores EU for one network shared by every dimension, with tiered wireless hatches.
- **Exploration and space.** The observatory family (steam observatory, optical observatory, radio telescope) and later antennas and telescopes (deep space antenna, interferometer, Kuiper survey telescope, gravitational wave detector and others) produce the charts that unlock each destination. The engine test stand and composite autoclave build the first rocket; probe bays, orbital stations and the warp gate take over later.

## Multiblocks from other mods

These are other mods' machines, used as they are. Every addon was audited against the era designs: anything that processes cheaper than GregTech in its era, or skips one of our plants, was removed or moved to a later tier ([`server_scripts/grindless/integration/`](pack/kubejs/server_scripts/grindless/integration/)).

| Source | Multiblocks | Tier in this pack |
|---|---|---|
| GregTech Modern | EBF, vacuum freezer, cleanroom, cracker, distillation tower, large boilers and turbines, large chemical reactor (HV), assembly line (IV), fusion reactors Mk1–Mk3 | Original tiers; fusion at LuV, ZPM and UV |
| GCYM (part of GregTech Modern) | Large machines; mega blast furnace and mega vacuum freezer | Large machines at IV (large mixer at LuV); mega ones at ZPM |
| GT Community Additions | Mega Chemical Reactor, Mega Oil Cracking Unit; Thermal Reactor; IsaMill and Flotation Cell Regulator; Space Elevator | Megas at IV; Thermal Reactor at EV; froth line with ZPM parts; Space Elevator at UHV with our recipes |
| GT-- | Chemical plant, rocket engines, neutron activator, Maceration Stack, circuit assembly line, large naquadah reactor | MV, EV, IV, IV, LuV, ZPM |
| GTM Extended Features | Large Gas Collector, Expanded Assembly Line | IV, LuV |
| Gregicality Rocketry | Rockets, space suits, space stations, and the Moon, Mars, Venus, Mercury and Proxima Centauri b | First rocket in HV; we rebuilt motors, tanks and charts per tier and added the other destinations |

Removed because they skipped lines or made energy from nothing: GTCA's green house, recyclers and scrap boxes, polymerizer, industrial coke oven, steam pressurizer, chemical generators and extreme heat exchanger; Extended Features' industrial greenhouse, advanced conservatory, rock processing plant, synthesis vessel, universal disassembly machine and robust alloy materializer. Their items are hidden in EMI.

## Ideas from other modpacks

Many of our machines start from an idea seen in another pack and are rebuilt here to fit our rules. Sources, licences and exactly what was taken are in [CREDITS.md](CREDITS.md).

| Modpack | What we built from it |
|---|---|
| GregTech Leisure | Boilers ×8 and generators ×2; small and large steam multiblocks; generator array; universal factories; advanced multi smelter; lava furnace; weather controller; HV cleaning maintenance hatch |
| Star Technology | Drill bits that wear by chance; controllers built from the machines they replace; AE2 made with GT machines; CO₂ greenhouses; steam blast furnace; observatories and charts; Processing Lines quest tab; mega factory modules; stellar forge |
| GTNH | Refinery as a petrochemical complex; platinum and naquadah plants; global wireless EU network and tower; combined-cycle plant; helium refrigerator; AE2-fed assembly line; hologram projector |
| Monifactory, Nomifactory | Vein samples that are not used up; fertiliser chosen by circuit; creature simulator; UEV–UXV components |
| Supersymmetry | Syngas plant; by-product coke battery; rare-earth extraction cascade; engine test stand; composite autoclave; solar foundry |
| Gregicality Science | Catalytic reformer; sulfide roaster with a contact acid plant |
| TerraFirmaGreg | Heliostat tower; lunar solar array |
| GTMoreOreProcessing, GTE2 | Ore plant; one vein table for all tiers |

## Other mods

The pack has 224 mods ([`pack/mods/`](pack/mods/)). Besides the GregTech addons above:

- **Storage and logistics:** Applied Energistics 2 with ExtendedAE, MEGA Cells, AppFlux and wireless terminals; Sophisticated Storage and Backpacks, Functional Storage, Storage Drawers, Laser IO, Pipez and Modular Routers. AE2 is also the interplanetary backbone: quantum bridges and EU over P2P tunnels.
- **Travel and teams:** Waystones, FTB Chunks, Teams and Essentials, Xaero's maps, and Ender Chests and Tanks that work across planets.
- **Extras:** Productive Bees, Farmer's Delight, Quark, Supplementaries and decorative mods; world generation from Biomes O' Plenty, YUNG's and several structure mods.
- **Interface:** EMI as the recipe viewer (with GregTech multiblock previews), Jade and FTB Quests.

## Quests

FTB Quests guides the whole journey: Welcome and Workshop chapters, one chapter per era (Steam Age to UIV Age), a Processing Lines flowchart for each era, and chapters for Multiblocks, Power, Storage, Applied Energistics, Productive Bees and Travel and Teams. Quest design is described in [`docs/quests.md`](docs/quests.md).

## Known issues

- Nine multiblocks still have no structure preview in EMI.
- The Expanded Assembly Line's formation and research path are not yet proven in game.
- GCYR's configured low gravity is not applied in game.
- v0.13.0 reshaped many multiblocks; rebuild them after updating from an older version.
- A Horizon Collector placed in an older version can keep one output slot and stall: break it and place it again.

## How to play (Prism Launcher)

**Releases channel (recommended).** It updates by itself and keeps your world.

1. Download `Gregtech-Grindless-releases.zip` from the [releases channel release](https://github.com/Ezequiel24123z/GrindlessGregtech/releases/tag/releases-channel).
2. In Prism: *Add instance → Import → choose the zip*.
3. Launch it. The first time, it downloads about 400 MB of mods.

Before each launch, the instance updates from the `releases` branch, which only moves to tested versions. FTB Backups 2 makes copies of the world in the instance's `backups` folder.

### Updating without starting a new world

Keep using the **same Prism instance**. Once a tested release reaches `releases`, close Minecraft and launch that instance again: packwiz updates the managed pack files, not your `saves` folder. There is no need to import another zip or start another world for each pack release.

**Versioned release zips are different.** An instance imported from `Gregtech-Grindless-v0.14.0.zip`, for example, is pinned to that tag and does not automatically follow later releases. To switch it to the releases channel without moving the world, close Minecraft, open *Edit instance → Settings → Custom commands*, and change the existing pre-launch command to:

```
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Ezequiel24123z/GrindlessGregtech/releases/pack/pack.toml
```

This is a one-time change; the release zips already include the bootstrap jar. The same change moves an instance from the older channel names: a command ending in `/playable/pack/pack.toml` (still updated during the transition) or `/jugable/pack/pack.toml` (that branch no longer exists, so the instance stops updating until changed). To stay pinned instead, keep the same instance and replace only the version tag in its existing command when choosing a newer release.

Before updating a world you care about, make a fresh backup of its folder under `saves`, with Minecraft closed. FTB Backups 2's periodic copies are useful, but the updater does not itself guarantee a fresh pre-update backup. Do not downgrade an updated world; restore a matching world backup and pack version instead.

Our releases preserve registered items, blocks, fluids and dimension ids, and announce any multiblock rebuilds. New world generation affects new chunks, not terrain already explored. These are **pack updates on Minecraft 1.20.1**, not Minecraft-version migrations: do not independently change Minecraft or Forge in Prism's version settings.

### Setting up a fixed version manually

Create a Minecraft 1.20.1 instance with Forge 47.4.28 and Java 17. Put [packwiz-installer-bootstrap.jar](https://github.com/packwiz/packwiz-installer-bootstrap/releases) in the instance's `minecraft` folder. Then, in *Edit instance → Settings → Custom commands*, set this as the pre-launch command to stay on `v0.14.0`:

```
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Ezequiel24123z/GrindlessGregtech/v0.14.0/pack/pack.toml
```

## For developers

Read [AGENTS.md](AGENTS.md) and [docs/STATUS.md](docs/STATUS.md) before contributing. Scoped rules are in `.github/instructions/`. The [testing guide](docs/testing/README.md) explains the test bench; design and integration references are in `docs/`. Decisions are in [DECISIONS.md](DECISIONS.md), and credits and licenses are in [CREDITS.md](CREDITS.md).
