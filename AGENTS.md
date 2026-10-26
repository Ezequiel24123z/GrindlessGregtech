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
- **EMI coverage:** every item, block, fluid and machine we register shows in EMI how it is obtained and, unless it is an end product, what it is used for (`node tools/analysis/emi-coverage.mjs`, part of the Node suite). A recipe of ours must not carry a stack hidden with its recipes (`grindless:hidden_with_recipes`): EMI drops the whole recipe. What has no recipe (right-click actions, structure blocks, what an item is kept for) gets an EMI info page in `kubejs/assets/emi/recipe/additions/grindless/`, with its text in `client_scripts/grindless/emi_info_lang.js`.
- **Rhino (KubeJS 6):** inside functions or callbacks that run more than once, use `var`, not `const`/`let`. Otherwise you get "redeclaration of var".
- **Vanilla names (KubeJS 2001.6.5):** some members are renamed for the scripts, and the Mojang name does not exist: `getYRot`/`getXRot` are `getYaw`/`getPitch`, `getStringUUID` is `getStringUuid`, `tickCount` is `age`, `Level#getGameTime` is `getTime` and `ItemStack#getTag` is `getNbt`; `Entity#level()` is hidden (use `getLevel()`). Full list in `tools/test/README.md`. Anything that uses a player is tested in the `client` suite.
- **Empty stacks (KubeJS 2001.6.5):** an empty `ItemStack`, `ItemStack.EMPTY` included, compares `=== null` in scripts (KubeJS's stack equality). Test stacks with `isEmpty()`, never against null.
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
  - **NightConfig paths:** concatenated paths are Rhino `ConsString`s and can ambiguously match `get(String)` and `get(List)`. Select `config['get(java.lang.String)'](path)` or `config['getOptional(java.lang.String)'](path)` explicitly, including in fixtures.
  - **Boxing a Java Integer:** `new Integer(7)` from a JS number picks `Integer(String)` with `"7.0"` and throws `NumberFormatException`. Use `Integer['valueOf(int)'](n)` (and `IntStream['of(int)'](n)`, which otherwise competes with `of(int...)`).
  - **KubeJS's `global` is a Java HashMap.** A number stored in it comes back as a wrapped `java.lang.Double`, and Rhino's interpreter takes `global.x === 1` (a number literal) as false (`Interpreter#doShallowEquals`). Store booleans or strings, and read strings with `String(...)`. See `gg_test_wireless_restart.js`.
  - **`charCodeAt` returns a Java `Character`** in this Rhino, and arithmetic on it gives NaN. Use `charAt` with `indexOf` over a known table (see the fingerprint in `gg_test_wireless_restart.js`).
  - **Dimension markers stay enabled in EMI.** GTM shows a dimension marker in every recipe with a dimension condition, and EMI drops any recipe with a disabled stack (`grindless:hidden_with_recipes`). Hiding the markers that way removed every planet recipe from EMI; they are `keepRecipes` (index only).
  - **Recipe conditions are checked on every tick of a run.** A day or night condition can stall a run halfway, so use a run-start modifier (`alwaysTryModifyRecipe`) for time-of-day pricing. See `ev/cryogenic_plant.js`. GTM also restarts a just-finished recipe without the modifier for one tick, so a run-start price needs `.afterWorking(G.freshRun.afterWorking(name))` (`lib/fresh_run.js`) to be fresh at every start.
  - **A modifier alone doesn't stop a run.** GTM 7.5.3 restarts an idle machine's cached last recipe without calling the recipe modifier, and with voiding on its start check skips the room for the voided outputs. A machine that must keep its outputs refuses voiding with `lib/no_voiding.js` in both places: `G.noVoiding.modifier(opts, next)` as the modifier and `.beforeWorking(G.noVoiding.beforeWorking(opts))`.
  - **One recipe per lookup path.** GTM's recipe lookup keeps one recipe per ingredient path, so two recipes of one type with the same inputs collide even when their conditions differ: the one left out never runs, though EMI shows it (the log says `failed to add recipe from staging into lookup DB`). A recipe whose inputs are a prefix of another's can hide it too. Give every recipe its own circuit or input, or make one recipe with ORed conditions when the result is the same. The bench test `gg_test_recipe_lookup` asks GTM's lookup for every recipe and fails on any collision of ours.
  - **EMI never shows `gtceu:electric_furnace` recipes** (GTM does not register that category; the dummy type is hidden too). A route that only exists there needs an EMI info page, like the Moon's first sintered regolith.

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
  - Only one Minecraft test JVM globally, across all agents/worktrees; the bench enforces this even for legacy slot requests. Updated runners retain a global OS mutex through native cleanup, independently of metadata files.
  - Client and server use `-Xms1G -Xmx4G`. This caps Java heap, not total process/native RAM. Available RAM is not a launch condition: there is no minimum-memory threshold, and unreadable memory counters do not block a run.
  - Finish and integrate the tier's implementations first, then validate the complete candidate in one coordinated run owned by a single agent/session. Include pending cross-cutting improvements in that candidate; do not launch separate native tests from each feature workstream or enqueue speculative probes. Required stages run serially, never with overlapping Minecraft JVMs.
  - The shared native budget remains at most 600 seconds (startup included), with 30 seconds for server shutdown. Commands are capped at 60 seconds and marker waits at 180 seconds. These are failure ceilings, not target durations.
  - Do necessary source/static validation here, not on the personal PC. Reuse valid prior proof; never raise heap/time/concurrency limits or automatically retry a resource failure.
  - Before using an older worktree, merge the current bench resource-policy changes; do not use a historical launcher to bypass the limits.
  - Test clients start with all sound at zero (`Set-GGClientOptions` in `tools/test/remote/gg-client.ps1`). Otherwise, the user would hear them.
- **Coverage in the tier's single integrated run:**
  1. The pack starts and creates a world.
  2. Our multiblocks form and process.
  3. Integration: the recipes exist, automatic generation works, and the gate to the next tier can be crafted.
- **Small, low-risk changes:** no additional test or native run is required unless there is concrete evidence of a possible failure, a known regression or an affected unproven mechanism. Do not add testing ceremony to straightforward changes.
- **If a check fails:** fix it and repeat only the affected check, not the whole tier. The same validation owner coordinates the rerun.
- **Do not retest what has already been tested:**
  - If a mechanism has already passed its in-game test (a multiblock that forms and processes, a recipe type, a table that generates recipes), new content that only uses it is not tested in-game again. For example: more recipes in a multiblock or more rows in a table.
  - Use the existing recipe validator (`tools/analysis`) and static contracts where relevant; startup without KubeJS errors is covered by the integrated run, not a fresh smoke for each content edit.
  - Put genuinely new execution mechanisms, changed contracts and known regressions into the integrated candidate's coverage; do not repeat equivalent native proofs for every content instance.
  - Before the integrated run, identify the concrete unresolved properties it covers. One run may cover several features; no separate run is required just because they have different authors.
  - When tagging a version, use that tier's integrated evidence and valid prior proof, not a rerun of the whole historical battery.
- **Test scripts:** they go in `tools/test/overlay/` and are not published with the pack.
- **Test zones:** each test builds and cleans up only its reserved band of the Overworld (Y 98–112). Keep these bands disjoint even for explicitly approved integration probes. The bands are 64 blocks wide in X and start at Z 0:

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
  | IV foundation (registrations only) | 9728–9791 |
  | fission reactor | 9984–10047 |
  | hot cell | 10240–10303 |
  | uranium cycle | 10496–10559: the Overworld at Y 98–112 and the End at Y 198–214 |
  | heavy-water plant | 10752–10815 (roof at Y 112) |
  | fluorspar kiln | 11008–11071 |
  | Venus | 11264–11327: on Venus (`gcyr:venus`) from one block above the highest ground (Y 162 for ground Y 156–161) up 19 blocks, and a gas collector at Y 250; on Mars (`gcyr:mars`) the same X and Z (slab at Y 163) |
  | Mercury | 11520–11583 on Mercury (`gcyr:mercury`), built on Y 200 (the band's highest ground is Y 173) |
  | naquadah plant | 11776–11839 (roof at Y 111) |
  | tritium removal facility | 12032–12095: the Moon at Y 198–214 and the Overworld at Y 98–112 |
  | travel and network | 12288–12351: the Overworld at Y 98–112 and Venus (`gcyr:venus`) at Y 198–214 |
  | mass production | 12544–12607 (roof at Y 112) |
  | gallery (client) | 12800–12863 |
  | QBC terminal (client) | 13056–13119: the Overworld at Y 98–112 (all of Z 0–63, force-loaded while it runs); on the Moon (`gcyr:luna`) and Mars (`gcyr:mars`) X 13084–13092, Z 28–36, Y 198–214 (7×7 floor at Y 198); the 1,000+ block case only stands the player on natural ground at X 13088, Z 1104+ |
  | wireless energy | 13312–13375, Z 0–63: Overworld Y 98–112 and Moon Y 198–214; restart fixtures use unloaded End metadata only, never blocks or chunk loading. Wireless fixtures take turns on this shared band. |
  | LuV biofoundry and GT--'s circuit line (S0-4) | 15616–15679, Z 0–15: the biofoundry at X 15616–15647, the circuit assembly line check at X 15648–15679 |
  | LuV cryogenics (helium refrigerator, coated conductor line) | 15104–15167, Z 0–63 |
  | LuV biofoundry and GT--'s circuit line (S0-4) | 15616–15679: the biofoundry at X 15616–15647, Z 0–15; the circuit assembly line check and the Universal Assembly Factory at X 15648–15679, Z 0–31 |
  | LuV A2: naquadah mode 2, platinum mode 4, LuV parallel hatch | 14848–14911, Z 0–63 (Overworld, Y 98–112) |
  | HTS magnet works and LuV wireless (LuV-A4) | 15360–15423, Z 0–63: Overworld Y 98–112 (the magnet works and the two-hatch checks at X 15360–15391, the towers and the LuV jump at X 15392–15423); Earth orbit (`gcyr:overworld_orbit`) X 15392–15423, Y 98–112. It takes its turn with the wireless fixtures. |
  | hologram projector | 16384–16447, Z 0–63 (client: X 16416–16447, Z 40–55; LuV bands skip it) |
  | LuV orbital solar station | 15872–15935, Z 0–63; Earth orbit Y 198–214 |
  | LuV microgravity smelter and wake shield | 16128–16191, Z 0–63; Earth orbit Y 198–214 |
  | LuV crystal grower, hydroponic ring and organoid lab | 16640–16703, Z 0–63; Earth orbit Y 198–214 |
  | LuV fusion and research | 17920–17983, Z 0–63 (Overworld, Y 98–112): the Mk1 at X 17925–17939, the HPCA and the research station at X 17950+ |
  | LuV Io surface: fumarole condenser and volcanic intake (S0-7) | 17152–17215, Z 0–63: the Overworld at Y 98–112 and Io (`G.places.surface('io')`) at Y 198–214 |
  | LuV Ganymede: GW detector (S0-7, buried L) and coilgun | 17664–17727, Z 0–63: the Overworld at Y 98–112; on Ganymede (`G.places.surface('ganymede')`) Y 198–214 (rows at Y 200–204), or, where the ground under the two machines reaches Y 200, five rows from one block above the highest ground |
  | LuV asteroid belt (B5) | 16896–16959, Z 0–63: Overworld Y 98–112; the stand-in belt (`grindless:asteroid_belt`) at the same X and Z, Y 198–214, and fresh world gen chunks at Z 1024+ |
  | LuV Europa: cryobot and algae bioreactor (S0-7 ice shaft) | 17408–17471, Z 0–15: the Overworld at Y 98–113 (the cryobot is 16 high); on Europa (`places.json`, once B1 registers it) the same X and Z |
  | chests and furnaces (client) | 18688–18751 (uses X 18688–18703, Z 0–15, Y 98–112) |

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
- **No `git stash` in parallel work:** the stash is shared by every worktree of the repository, so one session can pop another's. Use a WIP commit on your own branch.
- **Versions:** before tagging (`vX.Y.Z`), bump `version` in `pack/pack.toml` and run `tools/Update-PackIndex.ps1`. Only what has passed the tier's tests gets tagged.

## Playable channel

The user plays while development goes on.
- **`playable` branch:** this is their channel. It only advances to a `vX.Y.Z` tag that has passed the tests: `git push origin vX.Y.Z^{commit}:refs/heads/playable`.
  - Until the user confirms their Prism instance points at `playable`, also move the old `jugable` branch to the same commit (`...:refs/heads/jugable`), so their instance keeps updating. Delete `jugable` once they confirm.
- **When moving it:** send them a short summary of what is new and what changes in their game.
- **GitHub release (requested by the user):** every `vX.Y.Z` tag is published as a GitHub release. It has short notes in English (what is new and what changes in the game) and the Prism zip pinned to that version (`Build-PrismInstance.ps1 -Channel vX.Y.Z`). The `playable-channel` note is also updated.
- **Prism instance:** it is generated by `tools/prism/Build-PrismInstance.ps1` and lives in the GitHub release `playable-channel` (`Gregtech-Grindless-playable.zip`). It updates itself on launch through packwiz-installer-bootstrap, so it is only rebuilt if the channel URL or the bootstrap changes.
- **Compatible saves:**
  - A registered item, block or fluid is not removed. It stays registered and hidden in EMI, with a recipe that converts it 1:1 into its replacement (like the Titanium Drill Bit (old)).
  - Dimensions do not change their id.
  - If the shape of a multiblock changes, the release notes say so, because the player has to rebuild it.
  - Changes to veins and world generation only affect new chunks or recipes.
