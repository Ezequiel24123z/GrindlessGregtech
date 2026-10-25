# How we work in this repo

Gregtech Grindless is a GregTech Modern pack (Minecraft 1.20.1, Forge) in which nothing is gathered by hand. Before touching anything, read this file, `DECISIONS.md` and the latest note in `docs/sessions/`.

## Structure

| Path | Contents |
|---|---|
| `pack/` | packwiz root: `pack.toml`, `index.toml`, `mods/*.pw.toml`, `config/`, `defaultconfigs/`, `kubejs/`. |
| `pack/kubejs/startup_scripts/grindless/` | Registrations: items, blocks, recipe types and machines. |
| `pack/kubejs/server_scripts/grindless/` | Recipes, integration with other mods and events. |
| `pack/kubejs/data/grindless/` | Datapack: dimensions, tags and loot. |
| `pack/kubejs/assets/grindless/` | Own textures, models and languages. |
| `pack/config/ftbquests/quests/` | Quest book. |
| `docs/eras/` | Short design of each era. |
| `docs/sessions/` | Closing note of each session. |
| `tools/test/` | Remote test bench (see its `README.md`). |

## Pack rules

1. No resource that progression requires repeatedly is gathered by hand out of obligation. Mining by hand only serves to get started.
2. Difficulty rises through complexity (steps, conditions, multiblocks, crossing production lines), never through raw quantity or inflated times.
3. Every byproduct has an honest destination. Inert ones can be thrown away, dangerous ones are contained, and what will be useful later is stated as such. No silly recipes.
4. Each era has at least one of our multiblocks that gains something: speed, throughput, a recipe that is impossible on a small scale, or several steps in one.
5. Quests are short, in English, give a small reward, and never block recipes. Before writing a chapter, look at how other packs solve it. Copy and adapt only from packs whose license allows it (see `CREDITS.md`), always with attribution.
6. If this file conflicts with what GTM 7.5.3 does, GTM takes precedence.
7. Each era is clearly bigger and more complex than the one before. It has more of our progression multiblocks (about ×1.35 per era from EV on: EV ended with 11, so IV about 15 and LuV about 20…), more process lines, and more crossings with lines from two or more eras back.
   - Progression multiblocks add a recipe, route or line that did not exist.
   - Parallel versions of machines that already exist do not count toward the target, such as the steam families and Leisure's other convenience multiblocks. They are quality of life.
   - Steam Age to HV is not redone; it only gets small additions. Targets and audit are in `docs/research/complexity.md`.
8. Power is generous but never free. Boilers make ×8 steam and every generator gets twice the EU per unit of fuel (in the style of GregTech Leisure, see `DECISIONS.md`). Later eras, post-UHV included, keep that generosity with the same fuels, or with better fuels and more complex plants. No energy from nothing.

## KubeJS

- **IDs:** our own items and blocks use `grindless:`. Machines and recipe types use `gtceu:`, because that is how GTM registers them.
- **Patterns:** multiblocks are always defined through the pattern helper in `pack/kubejs/startup_scripts/grindless/`. When GTM 8.0 arrives, the helper is changed, not each multiblock.
- **Data:** tables (veins, crops…) live in data files, and recipes are generated from them. Repetitive recipes are not written by hand.
- **Text:** item and machine names go in `en_us` (English) and `es_es` (Spanish). Quests are in English only.
- **Repository language:** everything in the repository is in English: docs, code comments, tool messages, data notes and commit messages (requested by the user). The only Spanish allowed is the `es_es` game translation (lang files and the `es_es` blocks of `*_lang.js`).
- **Integration:** recipes from other mods that break progression are redone so that they go through GregTech machines.
- **Rhino (KubeJS 6):** inside functions or callbacks that run more than once, use `var`, not `const`/`let`. Otherwise you get "redeclaration of var".
- **Vanilla names (KubeJS 2001.6.5):** some members are renamed for the scripts, and the Mojang name does not exist: `getYRot`/`getXRot` are `getYaw`/`getPitch`, `getStringUUID` is `getStringUuid`, `tickCount` is `age` and `Level#getGameTime` is `getTime`; `Entity#level()` is hidden (use `getLevel()`). Full list in `tools/test/README.md`. Anything that uses a player is tested in the `client` suite.
- **GTM 7.5.3 traps** (each one cost a bench run):
  - **Recipe ids:** the GT recipe builder puts the recipe type in front of the id you pass: `event.recipes.gtceu.assembler('grindless:x')` is saved as `grindless:assembler/x`.
  - **Generator multiblocks** go through `startup_scripts/grindless/lib/generators.js`.
    - `.regressWhenWaiting(false)` is mandatory: with GTM's default, a waiting run regresses and the same fuel pays EU twice.
    - Standard dynamo hatches are 2 A.
  - **Multi-mode controllers** veto recipes of an inactive mode in their modifier (`alwaysTryModifyRecipe`), because GTM does not drop the cached recipe when the mode changes. See `mv/leisure_factories.js`.
  - **Conditions of the same type OR together:** `.dimension(a).dimension(b)` means a or b. "Not a and not b" can't be written with reversed conditions, so use an allowlist.
  - **Unreachable from Rhino:** `SizedIngredient#getItems()` and `FluidIngredient#getStacks()`. Use `RecipeHelper.getInputItems` / `getInputFluids` / `getRealEUt`.
  - **`Math.PI` is undefined in this Rhino** (KubeJS 2001.6.5); `Math.cos`, `Math.floor` and `Math.round` work. Code that uses it silently becomes NaN, so use a numeric literal or precomputed bounds.
  - **Weather is shared.** Every dimension with sky light takes the Overworld's rain and thunder (vanilla shares the flags), and full rain alone makes `Level#isNight()` true at noon, which is GTM's daytime condition. Earth's dimensions keep the weather; `space/airless_weather.js` keeps every dimension of the other planets in `planets.json` dry.
  - **Overloads Rhino can't pick.** `RecipeDB#find(holder, predicate)` with a JS function throws "the choice of Java method ... is ambiguous". Call the overload by its signature: `db['find(com.gregtechceu.gtceu.api.capability.recipe.IRecipeCapabilityHolder,java.util.function.Predicate)'](ctrl, fn)`.
  - **Recipe conditions are checked on every tick of a run.** A day or night condition can stall a run halfway, so use a run-start modifier (`alwaysTryModifyRecipe`) for time-of-day pricing. See `ev/cryogenic_plant.js`.

## packwiz

- **Binary:** packwiz has no releases; it is downloaded from `https://nightly.link/packwiz/packwiz/workflows/go/main/Windows%2064-bit.zip`.
- **Adding a pinned mod:** `packwiz mr add <version URL>`. Then check the `side` in its `.pw.toml`.
- **Index:** after changing files inside `pack/`, run `packwiz refresh`. `index.toml` is not edited by hand.
- **CurseForge:** only mods that allow distribution, or that have an official download URL, are added.

## Testing

- **Bench:** `tools/test/Invoke-GGTest.ps1`. It uploads the pack to the home PC, starts a clean server or client and returns the logs.
- **Home PC:**
  - Access: `ezequiel@192.168.1.150`.
  - Writes only happen inside `D:\GregtechGrindless`.
  - Never touch the user's PrismLauncher folder, `D:\Grindless` or their `.minecraft`.
  - Only one JVM at a time; the bench uses a lock.
  - Test clients start with all sound at zero (`Set-GGClientOptions` in `tools/test/remote/gg-client.ps1`). Otherwise, the user would hear them.
- **What to test per tier (2-3 tests):**
  1. The pack starts and creates a world.
  2. Our multiblocks form and process.
  3. Integration: the recipes exist, automatic generation works, and the gate to the next tier can be crafted.
- **If a test fails:** fix it and repeat that one, not all of them.
- **Do not retest what has already been tested:**
  - If a mechanism has already passed its in-game test (a multiblock that forms and processes, a recipe type, a table that generates recipes), new content that only uses it is not tested in-game again. For example: more recipes in a multiblock or more rows in a table.
  - That content is validated at low cost: the recipe validator (`tools/analysis`), the static checks, and that the pack starts without KubeJS errors.
  - Only new things, things that change the mechanism, or things that already failed before are tested in-game.
  - Before launching an expensive test, you must be able to say which new doubt it resolves.
  - When tagging a version, run the tests for what has changed and the ones for the new tier, not the whole battery.
- **Test scripts:** they go in `tools/test/overlay/` and are not published with the pack.
- **Test zones:** tests are launched almost at the same time on the same server, so each one builds and cleans up only its band of the Overworld (Y 98–112). The bands are 64 blocks wide in X and start at Z 0:

  | Test | X |
  |---|---|
  | steam | 0–31 |
  | creatures | 64–95 |
  | AE2 | 64–79, but at Z 64–79 |
  | LV multiblocks | 256–319 |
  | MV plant | 512–575 |
  | MV multiblocks | 768–831 |
  | HV multiblocks | 1024–1087 |
  | HV refinery | 1280–1343 (Y 98–113) |
  | EV plant | 1536–1599 (the 2026-10-24 scratch test; the platinum plant now uses 5888–5951) |
  | EV multiblocks | 1792–1855 |
  | IV plant | 2048–2111 |
  | IV multiblocks | 2304–2367 |
  | GCYR flight | 2560–2623 |
  | Moon | 2816–2879; on the Moon (`gcyr:luna`), the same X and Z at Y 198–214 |
  | new steam multiblocks | 3072–3135 |
  | new LV multiblocks | 3328–3391 |
  | observatories | 3584–3647 |
  | syngas plant | 3840–3903 |
  | path to the rocket | 4096–4159 |
  | travel keys | 4352–4415 |
  | quest book (client) | 4608–4671 |
  | energy | 4864–4927 |
  | small steam family | 5120–5183 |
  | Large Steam family | 5376–5439 |
  | EV foundation (registrations only) | 5632–5695 |
  | EV platinum plant | 5888–5951 |
  | power generators (generator array) | 6144–6207 (controllers at Z 2 and Z 9) |
  | universal factories | 6400–6463 |
  | Leisure utility | 6656–6719 |
  | EV tripod | 6912–6975 (Moon) |
  | regolith cell | 7168–7231 (Moon) |
  | cryogenic plant | 7424–7487 (Moon) |
  | lunar solar array and deep space antenna | 7680–7743 (Moon) |
  | Mars travel | 7936–7999 (Mars) |
  | Mars site rules | 8192–8255: the Overworld and `grindless:void` at Y 98–112, the Moon and Mars at Y 198–214 |
  | AE2 between planets | 8448–8511 (Earth and Moon) |
  | combined-cycle plant and hot strip mill | 8704–8767 |
  | sealed dome | 8960–9023 (Moon) |
  | rare-earth extraction cascade | 9216–9279 |

  For a new test, keep going in steps of 256.

## Licenses

- Before copying anything, check its license in `CREDITS.md`.
  - MIT or LGPL: can be used with attribution.
  - GPL, non-commercial, or all rights reserved: ideas only.
- Every new idea, multiblock or asset is noted in `CREDITS.md`.

## Project memory

- `DECISIONS.md`: one line per important decision.
- `CREDITS.md`: source and license of each idea, multiblock or asset.
- `docs/sessions/YYYY-MM-DD.md`: when closing a session, what works, what is broken and what comes next.

## Git

- Personal account `Ezequiel24123z`, never the corporate one.
- Small commits with a clear message.
- **Versions:** before tagging (`vX.Y.Z`), bump `version` in `pack/pack.toml` and run `tools/Update-PackIndex.ps1`. Only what has passed the tier's tests gets tagged.

## Playable channel

The user plays while development goes on.
- **`jugable` branch:** this is their channel. It only advances to a `vX.Y.Z` tag that has passed the tests: `git push origin vX.Y.Z^{commit}:refs/heads/jugable`.
- **When moving it:** send them a short summary of what is new and what changes in their game.
- **GitHub release (requested by the user):** every `vX.Y.Z` tag is published as a GitHub release. It has short notes in English (what is new and what changes in the game) and the Prism zip pinned to that version (`Build-PrismInstance.ps1 -Channel vX.Y.Z`). The `canal-jugable` note is also updated.
- **Prism instance:** it is generated by `tools/prism/Build-PrismInstance.ps1` and lives in the GitHub release `canal-jugable`. It updates itself on launch through packwiz-installer-bootstrap, so it is only rebuilt if the channel URL or the bootstrap changes.
- **Compatible saves:**
  - A registered item, block or fluid is not removed. It stays registered and hidden in EMI, with a recipe that converts it 1:1 into its replacement (like the Titanium Drill Bit (old)).
  - Dimensions do not change their id.
  - If the shape of a multiblock changes, the release notes say so, because the player has to rebuild it.
  - Changes to veins and world generation only affect new chunks or recipes.
