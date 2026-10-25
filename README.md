# Gregtech Grindless

Huge GregTech pack for Minecraft 1.20.1 (Forge) on top of GregTech Modern 7.5.3. It brings together the best of the tech packs and GregTech under one rule: **no resource is gathered by hand here**. Every basic resource that the progression asks for can be generated automatically within its era, starting from the Steam Age. Processing is still real GregTech, and difficulty rises with complexity, not with quantity or waiting.

## Status

| Era | Status |
|---|---|
| Steam Age | Playable since `v0.1.0`: coke, bronze, steam, steel, our own steam vein drill and steam greenhouse, and the gate to LV. |
| LV | Playable since `v0.2.0`: LV vein drill and greenhouse, submerged arc furnace, creature simulator, all of AE2 in LV and 150 mods. |
| MV | Playable since `v0.3.0`: ore plant, biorefinery, MV vein drill and greenhouse, infinite oil (also in the Flatland and the Void) and 207 mods. |
| HV | Playable since `v0.4.0`: refinery (distills, hydrotreats and cracks in one pass), reformer, HV vein drill with the End veins and HV greenhouse. |
| What's next | The pack becomes a journey to the black hole at the center of the galaxy. The first stop is the Moon, at the end of HV. |

## How to play (Prism Launcher)

**Playable channel (recommended).** It updates by itself and keeps your world.

1. Download `Gregtech-Grindless-jugable.zip` from the [playable channel release](https://github.com/Ezequiel24123z/GrindlessGregtech/releases/tag/canal-jugable).
2. In Prism: *Add instance → Import → choose the zip*.
3. Launch it. The first time, it downloads about 400 MB of mods.

Before each launch, the instance updates from the `jugable` branch, which only moves to tested versions. FTB Backups 2 makes copies of the world in the instance's `backups` folder.

**A fixed version.** Create a Minecraft 1.20.1 instance with Forge 47.4.28 and Java 17. Put [packwiz-installer-bootstrap.jar](https://github.com/packwiz/packwiz-installer-bootstrap/releases) in the instance's `minecraft` folder. Then, in *Edit instance → Settings → Custom commands*, set this as the pre-launch command:

```
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Ezequiel24123z/GrindlessGregtech/v0.4.0/pack/pack.toml
```
## For developers

Read [AGENTS.md](AGENTS.md). Decisions are in [DECISIONS.md](DECISIONS.md), and credits and licenses are in [CREDITS.md](CREDITS.md).
