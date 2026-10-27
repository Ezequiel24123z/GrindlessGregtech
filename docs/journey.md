# Gregtech Grindless: the journey to the black hole

The user approved this table on 2026-10-24, with the changes in the last section. It is the pack's guide. Each era is designed in detail when we reach it, in `docs/eras/`.

The supporting research is in `docs/research/space/`:
- the `grindless-earlygame` campaign (`grindless-campaign.md`);
- what other packs do (`packs-space.md`);
- the space mods (`space-mods.md`);
- what GTM 7.5.3 brings per tier (`gtm-tiers.md`);
- the catalog of candidate machines (`machines-catalog.md`).

## How Grindless and GregTech fit together

- **Energy.** Grindless climbs with `8 × 4ⁿ`, which is exactly GT's voltage ladder: T0 = steam/ULV … T14 = MAX. Its T15 (8,590 million per tick) does not exist in GT. The endgame is the MAX project with several amps (4 A of MAX = T15); no fake voltage is invented.
- **Industry.** Grindless's T0–T9 topics map 1:1 onto Steam Age–UHV, and they are exactly what GT provides there:

  | Grindless topic | GT era |
  |---|---|
  | Precision | EV |
  | Nuclear | IV |
  | Cryogenics | LuV |
  | Fusion | ZPM |
  | Particles | UV |
  | Quantum | UHV |
- **Space.** In Grindless it starts at T10 (UEV). Here it starts at the end of HV, so its stages come earlier:

  | Grindless stage | Eras here |
  |---|---|
  | Orbital (T10) | HV–LuV |
  | Planetary and Kardashev I (T11) | IV–ZPM |
  | Stellar and Kardashev II (T12) | UV–UHV |
  | Interstellar (T13) | UEV–UXV |
  | Galactic and Kardashev III (T14) | OpV |
  | Event horizon (T15) | MAX |

## The table

| Era | Journey | Only comes from there | New machines (ours) | Opens |
|---|---|---|---|---|
| **Steam Age** (T0) | Earth: Overworld, Void and Flatland. The observatory draws the first chart of the Moon. | — | steam drill and greenhouse (already there), steam blast furnace, coke battery, clockwork observatory | LV |
| **LV** (T1) | the Nether (already there) | the Nether veins | drill, greenhouse, arc furnace and creature simulator (already there); sulfide roaster with acid plant, solar mirror tower, optical observatory | MV |
| **MV** (T2) | the End (moved from HV, which should only open the Moon) | the End veins: bauxite, vanadium and chromium, platinum, zirconium | ore plant and biorefinery (already there); engine test stand, radio telescope | HV |
| **HV** (T3) | the **Moon**, at the end of the era, with the first rocket, by hand | **titanium** (lunar ilmenite) and helium-3, which is kept for fusion | refinery and reformer (already there); composite autoclave, syngas plant, launch complex, lunar drill (only forms on the Moon) | EV: without lunar titanium there is no EV hull |
| **EV** (T4) | automated lunar base, connected to home; **Mars** at the end | tungsten, rare earths, deuterium ice | platinum plant, regolith cell with volatiles furnace and cryogenic plant (Moon), atmosphere processor (Mars), EV tripod and lunar solar field; combined-cycle plant, hot strip mill and rare-earth extraction cascade (Earth), and sealed dome (Moon and Mars), added for the ×1.35 target | IV: tungsten steel |
| **IV** (T5) | **Venus and Mercury** at once | naquadah (Venus veins at 90 bar), iridium and osmium (Mercury crust) | fission reactor (designed cores), hot cell (radiochemistry and RTG pellets), naquadah plant, pressurized drill (Venus) and night-side drill (Mercury), Venus heat engine, Mercury solar field | LuV |
| **LuV** (T6) | **the asteroid belt and Jupiter's moons** (Io, Europa, Ganymede); first orbital station, in Earth orbit | living matter from Europa's ocean (wetware circuits); asteroid metals: meteoric iron, tetrataenite and the platinum-metal concentrate (belt); germanium (Io) | helium refrigerator, coated conductor line, HTS magnet works and biofoundry (Earth); orbital solar station, microgravity smelter, zero-g crystal grower, wake shield facility, rotating hydroponic ring and organoid lab (Earth orbit); harpoon anchor drill, asteroid processor and optical miner (belt); fumarole condenser and volcanic intake (Io); flux-tube tether (Io orbit) or the sulfur–iodine plant (Io); cryobot and algae bioreactor (Europa); gravitational-wave detector and coilgun probe launcher (Ganymede) | ZPM |
| **ZPM** (T7) | **Saturn** (Titan, Enceladus) and the ice giants **from orbit, without landing** | bulk helium-3 and deuterium, Titan tholins | fusion as infrastructure, orbital mining laser, gas giant siphon, orbital shipyard (the space elevator moves to UV, then UHV). **Kardashev I**: the whole solar system works | UV |
| **UV** (T8) | Pluto and the Kuiper belt from orbit; first probe to another star | exotic ices | particle accelerator, laser sail launcher | UHV |
| **UHV** (T9) | **Alpha Centauri** (Proxima b): the probe opens the first gate | alien flora | pair of warp gates, Dyson swarm around the Sun. **Kardashev II** | UEV |
| **UEV** (T10) | several stars at once (Sirius, Barnard…) | white dwarf degenerate matter | stellar forge, nebula collector | UIV |
| **UIV** (T11) | neutron stars, pulsars and the first black hole, Cygnus X-1 | neutronium, r-process metals | Penrose engine (test with a black hole), Matrioshka computer | UXV |
| **UXV** (T12) | the galactic arm: many systems at once | stellar plasma, accretion disk plasma | stellar elevator, accretion disk skimmer | OpV |
| **OpV** (T13) | the galactic bulge | industrial antimatter, stable exotic matter | Kugelblitz forge (micro black holes made of light), probes that replicate on their own. **Kardashev III** | MAX |
| **MAX** (T14–T15) | **Sagittarius A\***, the center of the galaxy | — | **the mirror shell**: the largest multiblock in the pack. It surrounds the black hole, amplifies a wave until it bursts, and the universe bursts with it | the end |

The exact materials for each row are set when each era is designed. What is approved here is the general shape.

## The Moon in HV: two options

**A. Titanium. Chosen by the user.**
- **What it is:** the ilmenite of the lunar sea (Apollo samples reach ~10% TiO₂).
- **Why EV needs it:** the EV hull and almost every EV machine use titanium, so the Moon is the gate to EV. Since EV uses a lot of titanium, automating the lunar base is EV's first job.
- **What has to change:**
  - Remove titanium from Earth: the ilmenite from the End vein and the rutile that comes from bauxite.
  - Change the titanium drill bit of the HV drill.
  - Helium-3 comes as a bonus for fusion.

**B. Platinum and palladium.**
- **What it is:** meteorite metal in the regolith.
- **Why EV needs it:** it feeds the platinum plant, EV's star piece.
- **What has to change:** the GT-- platinum line gets platinum from Earth's sulfides. Making it lunar-only forces that line to be broken, and platinum is less of a burden than titanium in EV.

## The End veins

Today HV opens the End and, with the Moon, it would open two places. Proposal: **the End moves to MV**, which opens no place today.
- **The order becomes:** the Nether (LV, downward), the End (MV, beyond the world) and the Moon (HV, upward).
- **What has to move down to MV:** the ender eye and the End key. The blaze moves from HV to MV in the simulator.
- **What comes out of the End vein:**
  - the ilmenite, which goes to the Moon under option A;
  - the scheelite, which goes to Mars.

## Each planet has its own rules

- **Machines that only work there.** GTM already supports recipes with a dimension condition. Also, multiblock structures use parts that are only made there, like the sintered regolith brick. You have to go there and build them on site.
- **Environment.** Each planet has a profile that changes the recipes:
  - In vacuum there is no combustion, and vacuum processes are free.
  - In heat, more coolant is used.
  - In cold, cryogenics costs less.
  - In low gravity, crystals grow faster.
  - With radiation, shielded casings are needed.
  - Solar power depends on the light (Mercury ×6.7, Moon ×1.4, Earth orbit ×1.4 with no night, Mars ×0.43, the asteroid belt ×0.19, Jupiter's moons ×0.052). One table, `tables/sunlight.json`, holds the factors.
- **Power on site.**
  - Solar.
  - Local fuels: methane and oxygen on Mars, heat on Venus, volcanoes on Io.
  - RTG batteries.
  - From LuV on, the orbital solar station, Io's volcanic intake and Jupiter's tether feed the global wireless network, and every base draws from it.
- **Transport (user's decision).**
  - People: the first time by rocket; after that, Waystones or FTB's /home, at no cost.
  - Materials, fluids and power: AE2, with the quantum bridge between planets built with one half at each end.
  - The interplanetary AE2 network improves with each era.
  - Ender chests, tanks and other ender items work between planets with no limit (the user, 2026-10-24: they are a quality-of-life mod precisely for that). AE2 is the industrial backbone, not the only route.
- **What comes from a planet does not exist on Earth.** The recipe validator checks this for every resource, including bees, byproducts and addons.

## From visiting to dominating

1. **In person, by hand:** HV–IV (Moon, Mars, Venus and Mercury).
2. **Connected automatic bases:** EV–LuV.
3. **Orbital stations that exploit without landing:** LuV–UV.
4. **Industry the size of a star or a system:** UHV–OpV (Dyson, stellar forge, stellar elevator; Kardashev II and III).
5. **The black hole project:** MAX.

## The end

It is a single project in four stages, and each one is a multiblock that delivers something:

| Era | Stage | What it does |
|---|---|---|
| UIV | Penrose engine | Test on a stellar black hole: extracts energy from its spin. |
| UXV | Disk skimmer | Turns accretion disk plasma into exotic matter. |
| OpV | Kugelblitz forge | Makes micro black holes from light, which must be contained. |
| MAX | Mirror shell | Surrounds Sagittarius A\* and amplifies a wave until the hole bursts. It is the largest multiblock in the pack. |

- **The final recipe** asks for the stored energy, the seed wave from the forge and every segment in place.
- **On detonation** the universe bursts: credits and a seed for a new universe, for anyone who wants to start over.
- **Where:** GCYR ships the `black_hole_orbit` dimension with a black hole sky and nothing that leads to it. It is the perfect place.
- **What has to be prepared first:** the pattern helper (16 rows today) has to accept much larger structures.

## The families change shape and parts, not just color

- **Vein drill:**
  1. bronze tower (steam);
  2. steel lattice with mud pump (LV);
  3. aluminium tower (MV);
  4. rotary stainless steel equipment (HV);
  5. lunar tripod with solar wings (EV);
  6. pressurized equipment or with a coolant jacket (IV);
  7. harpoon anchor on asteroids and cryobot on icy moons (LuV);
  8. atmospheric scoop on gas giants (ZPM);
  9. disk skimmer (UXV–MAX).
- **Greenhouse:**
  1. glass house;
  2. stainless steel hydroponics;
  3. sealed lunar dome;
  4. rotating hydroponic ring (gravity from spin), a molecular farm;
  5. algae bioreactor;
  6. ark biosphere for the trip.
- **Observatory (new family, the one that tells the story of the journey):**
  1. clockwork telescope;
  2. refractor;
  3. radio telescope;
  4. deep-space antenna;
  5. interferometer;
  6. gravitational-wave detector;
  7. the telescope that photographs Sagittarius A\*, which supplies the data for the final goal.

## Quests

In English, one chapter per era. Each chapter tells the step that brings you closer to the center of the galaxy. It opens with what is seen from the observatory and closes with the next journey. Never promise a multiblock that doesn't exist yet.

## What other packs do

- **GTNH:**
  - **Planets by tier:** the Moon in HV, Mars, Venus and Mercury in EV, etc.
  - **Space elevator (UHV):** modules that mine planets without landing (moved from UV: the UV design does not use it, `docs/eras/uv.md`).
  - **Final megastructures:** the Eye of Harmony and the Forge of the Gods.
  - **The "pseudo-stable" black hole:** it is seeded and decays if it is not tended. It is the best precedent for our ending.
  - **The real ending:** the Stellar Gate.
  - **What wears you out:** rockets and blueprints from dungeons, landings by hand, 111-hour recipes, mandatory luck and inputs that are lost if power fails. License LGPL/GPL/no license: ideas only.
- **GregTech Leisure:**
  - **Planets:** 8 rockets, each planet with its own fluid.
  - **Exploitation without going back:** space center with drones that don't wear out.
  - **Cosmic:** Dyson sphere and Eye of Harmony.
  - **The ending:** MAX ends in "creative mode", a dull ending; it has to be avoided.
  - **Absurd quantities:** machines with millions of parallels.
  - **License:** contradictory; ideas only.
- **Star Technology:**
  - **Travel:** you travel through stargates, not rockets.
  - **K.O.M.A.R.U.:** a frame of modules whose upkeep grows with its size.
  - **License:** MIT, can be copied with attribution.
- **GT Odyssey:**
  - **Planets:** uses Ad Astra.
  - **Remote mining:** you scan a dimension once and mine it from home ("finally no need to plant miners everywhere") (translated from Spanish).
  - **License:** non-commercial; ideas only.
- **Monifactory / Nomifactory:** no space content, with "microverse" quests that give fixed batches. License LGPL.
- **Cosmic Frontiers and Phoenix Forge:** they promise endings that don't exist. Avoid that.

**What works.**
- Land on the planet once, then exploit it from afar.
- Megastructures you can manage, with real inputs and outputs.
- A catalyst that isn't consumed + a cheap reagent = lots of product.
- Chapters that sum up the era.

**What wears you out.**
- Inflated timers and luck.
- Going back and forth by hand.
- Walls of quantity.
- Penalties that throw away your work.
- "Creative" endings that cancel out the logistics.
- Promising what isn't done yet.

## Space mod

**GCYR, which is already in the pack, and nothing else.** The full report is in `space-mods.md`.

**Why GCYR.**
- It's from GregTech. Rockets are built from parts made in GT assemblers and burn GT fluids.
- It brings the Moon, Mars, Mercury, Venus, their orbits and a sketch of Proxima b. Planets can be added with JSON.
- It has oxygen and temperature (copied from Ad Astra's MIT code). A machine supplies the oxygen: the oxygen spreader.
- It has a Dyson sphere and the `black_hole_orbit` dimension, with its black hole shader working.
- License LGPL-3.0: it can be included and adapted with attribution.

**Why not the others.**

| Mod | License | Why not |
|---|---|---|
| Ad Astra | MIT code and art with all rights reserved | It has no KubeJS connection at all: every pack that uses it wrote Java. With GCYR it would duplicate the oxygen, rockets and materials. |
| Northstar Redux | MIT | Built on Create and has no GT hooks, although it does have a KubeJS plugin. |
| Creating Space | MIT | Built on Create and has no KubeJS plugin. |
| Galacticraft | — | Dead on Forge. |

**What we do ourselves, without Java.**
- Machines that only work on one planet: the dimension condition of GTM recipes.
- Gravity and radiation: no mod has them, so they go in as per-planet rules in the recipes.
- Each planet's exclusive resources.
- Transport between planets.
- Orbital mining: GCYR's satellites and lasers are not built.

**What has to be fixed in GCYR.**
- Its Mars veins are Earth materials: they get swapped for ours.
- Move the first rocket and the space suit to HV. Today the rocket scanner is EV and the suit needs an IV plastic.
- It has two open bugs, on launch and on dimension change. They have to be tested in game.

## User decisions (2026-10-24)

1. **The Moon gives titanium (option A).** Titanium enters in EV and comes only from the Moon.
2. **The End moves to MV.** Check that, without the ilmenite (to the Moon) or the scheelite (to Mars), the End vein still justifies the trip.
3. **HV without titanium.** Everything in HV moves to stainless steel: machines, hulls, drill bits (the HV drill bit is stainless), multiblocks and the rocket and suit pieces of GCYR. The HV textures are redone where needed.
4. **Validator rule:** nothing in an era can require a resource that comes out in a later era.
5. **Kardashev:** I in ZPM, II in UHV and III in OpV.
6. **Travel.** The first visit to each planet is by rocket. After that, people use Waystones or FTB's /home, at no extra cost. Making travel free is intentional.
7. **AE2 is the backbone of transport between planets:** materials, fluids and power.
   - The quantum bridge between planets is built with one half made at each end, so you have to go once; after that it runs on its own.
   - The network between planets improves with the eras (more channels, more capacity, more power) and is a goal in itself.
   - Ender chests and tanks don't cross to another planet. *Changed by the user the same day: ender items work on all planets, with no limit.*
8. **Quests.**
   - One tab per era (Steam Age → MAX) that tells the journey.
   - Separate tabs for the quality-of-life mods: storage, AE2 and addons, Productive Bees, Create/Greate if they stay, Waystones/FTB…
   - Quests are reused from packs whose license allows it; otherwise they are written from scratch.
   - All in English.
9. **Post-UHV.** First, reuse what exists in external packs, Gregicality and older packs whose license allows it (textures and code included). Creating it from scratch is the last resort.
10. **Work order:**
    1. test GCYR's launch and dimension jump in game;
    2. HV to stainless steel and corrected version;
    3. Moon prototype tested in game;
    4. EV with the journey and new textures;
    5. IV designed in detail in the meantime;
    6. external-mod quest tabs in parallel;
    7. a short summary when each version closes.

The orchestrator resolves what is still open and records it in `DECISIONS.md`:
- Above UHV, GTM does not provide circuits, cables or coils.
- The pattern helper has to grow for giant multiblocks.
- `ev.md` and `iv.md` are redone with the journey. What was built in the scratch is reused.
