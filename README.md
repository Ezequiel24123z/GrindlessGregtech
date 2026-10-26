# Gregtech Grindless

Huge GregTech pack for Minecraft 1.20.1 (Forge) on top of GregTech Modern 7.5.3. It brings together the best of the tech packs and GregTech under one rule: **no resource is gathered by hand here**. Every basic resource that the progression asks for can be generated automatically within its era, starting from the Steam Age. Processing is still real GregTech, and difficulty rises with complexity, not with quantity or waiting.

## Status

| Era | Status |
|---|---|
| Steam Age | Playable since `v0.1.0`: coke, bronze, steam, steel, our own steam vein drill and steam greenhouse, and the gate to LV. |
| LV | Playable since `v0.2.0`: LV vein drill and greenhouse, submerged arc furnace, creature simulator, all of AE2 in LV and 150 mods. |
| MV | Playable since `v0.3.0`: ore plant, biorefinery, MV vein drill and greenhouse, infinite oil (also in the Flatland and the Void) and 207 mods. |
| HV | Playable since `v0.4.0`: refinery (distills, hydrotreats and cracks in one pass), reformer, HV vein drill with the End veins and HV greenhouse. |
| EV | Playable since `v0.6.0`: the automatic Moon base, Mars, platinum processing and the gate to IV. |
| IV | Playable since `v0.7.0`: fission and its fuel cycle, Venus and Mercury, naquadah, iridium and osmium, and the assembly line. |
| LuV | Playable since `v0.8.0`: space stations, the asteroid belt, Io, Europa and Ganymede, trinium, fusion, living circuits and the wireless network's LuV tier. |
| What's next | ZPM: the space elevator and the road past Saturn, continuing the journey to the black hole at the center of the galaxy. |

## How to play (Prism Launcher)

**Playable channel (recommended).** It updates by itself and keeps your world.

1. Download `Gregtech-Grindless-playable.zip` from the [playable channel release](https://github.com/Ezequiel24123z/GrindlessGregtech/releases/tag/playable-channel).
2. In Prism: *Add instance → Import → choose the zip*.
3. Launch it. The first time, it downloads about 400 MB of mods.

Before each launch, the instance updates from the `playable` branch, which only moves to tested versions. FTB Backups 2 makes copies of the world in the instance's `backups` folder.

### Updating without starting a new world

Keep using the **same Prism instance**. Once a tested release reaches `playable`, close Minecraft and launch that instance again: packwiz updates the managed pack files, not your `saves` folder. There is no need to import another zip or start another world for each pack release.

**Versioned release zips are different.** An instance imported from `Gregtech-Grindless-v0.7.0.zip`, for example, is pinned to that tag and does not automatically follow later releases. To switch it to the playable channel without moving the world, close Minecraft, open *Edit instance → Settings → Custom commands*, and change the existing pre-launch command to:

```
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Ezequiel24123z/GrindlessGregtech/playable/pack/pack.toml
```

This is a one-time change; the release zips already include the bootstrap jar. The same change moves an instance imported before the channel was renamed from `jugable` to `playable` (its command ends in `/jugable/pack/pack.toml`). To stay pinned instead, keep the same instance and replace only the version tag in its existing command when choosing a newer release.

Before updating a world you care about, make a fresh backup of its folder under `saves`, with Minecraft closed. FTB Backups 2's periodic copies are useful, but the updater does not itself guarantee a fresh pre-update backup. Do not downgrade an updated world; restore a matching world backup and pack version instead.

Our releases preserve registered items, blocks, fluids and dimension ids, and announce any multiblock rebuilds. New world generation affects new chunks, not terrain already explored. These are **pack updates on Minecraft 1.20.1**, not Minecraft-version migrations: do not independently change Minecraft or Forge in Prism's version settings.

### Setting up a fixed version manually

Create a Minecraft 1.20.1 instance with Forge 47.4.28 and Java 17. Put [packwiz-installer-bootstrap.jar](https://github.com/packwiz/packwiz-installer-bootstrap/releases) in the instance's `minecraft` folder. Then, in *Edit instance → Settings → Custom commands*, set this as the pre-launch command:

```
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Ezequiel24123z/GrindlessGregtech/v0.7.0/pack/pack.toml
```

## For developers

Read [AGENTS.md](AGENTS.md). Decisions are in [DECISIONS.md](DECISIONS.md), and credits and licenses are in [CREDITS.md](CREDITS.md).
