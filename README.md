# Gregtech Grindless

GregTech progression pack for Minecraft 1.20.1 (Forge) on GregTech Modern 7.5.3. Its rule is simple: **nothing needed for progression is gathered by hand**. Starting in the Steam Age, resources are produced automatically through increasingly complex GregTech processing lines and multiblocks. Difficulty comes from steps, conditions and coordinating industry—not inflated quantities or waiting.

## Current status

The latest playable release is **v0.14.0 "UIV"**. It spans the Steam Age through UIV, with the journey extending from Earth and the solar system to neutron stars, pulsars and the black hole Cygnus X-1.

| Progress | Status |
|---|---|
| Steam Age–UIV | Playable in `v0.14.0`; each era adds automated resource production, processing lines and multiblocks. |
| UXV | In development for `v0.15.0`: the next stage of the interstellar journey. |
| OpV and MAX | Planned after UXV; the journey's final project is at Sagittarius A*. |

The UIV release adds three stellar destinations, new UIV industry and wireless power, and opens the gate to UXV. See the [v0.14.0 release notes](docs/releases/v0.14.0.md) for the full list and save-impact details. The [journey guide](docs/journey.md) describes the planned progression through MAX.

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
