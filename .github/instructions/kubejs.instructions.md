---
applyTo: "pack/kubejs/**,tools/test/overlay/kubejs/**,tools/analysis/lib/kubejs_static.mjs"
---
# KubeJS and GTM 7.5.3 rules

## Structure
- Registrations (items, blocks, recipe types, machines): `pack/kubejs/startup_scripts/grindless/<era>/`. Recipes, integration and events: `server_scripts/grindless/<era>/` and `server_scripts/grindless/integration/`. Names: `client_scripts/grindless/<era>_<machine>_lang.js`. Find every touchpoint of a machine with `git grep -n "<id>" -- pack tools/test tools/analysis/tiers`.
- Multiblocks are always defined through the pattern helper `startup_scripts/grindless/lib/patterns.js`. When GTM 8.0 arrives, the helper changes, not each multiblock.
- Shared helpers (`startup_scripts/grindless/lib/*.js`, `server_scripts/grindless/lib/*.js`) belong to the integrator; a change there is its own package.
- Tables (veins, crops...) live in data files (`pack/kubejs/data/grindless/tables/`) and recipes are generated from them. Repetitive recipes are not written by hand.
- Recipes from other mods that break progression are redone so they go through GregTech machines.
- Every name or tooltip gets `en_us` and `es_es` (in the machine's `*_lang.js`). Quests are English only.

## EMI
- Every item, block, fluid and machine we register shows in EMI how it is obtained and, unless it is an end product, what it is used for (`node tools/analysis/emi-coverage.mjs`, part of the Node suite).
- A recipe of ours must not carry a stack hidden with its recipes (`grindless:hidden_with_recipes`): EMI drops the whole recipe.
- What has no recipe (right-click actions, structure blocks, what an item is kept for) gets an EMI info page in `kubejs/assets/emi/recipe/additions/grindless/`, with its text in `client_scripts/grindless/emi_info_lang.js` (shared: edit only when the package contract lists it).
- Dimension markers stay enabled in EMI: GTM shows one in every recipe with a dimension condition, and hiding them removed every planet recipe. They are `keepRecipes` (index only).
- EMI never shows `gtceu:electric_furnace` recipes (GTM does not register that category). A route that only exists there needs an EMI info page.

## Rhino and KubeJS 2001.6.5
- Script load order: never write or edit `// priority:` by hand (line 1 of every script is a generated header). To make a script load earlier or later, set a band in `tools/analysis/script_order.json`; the integrator stamps the headers (`Update-PackIndex.ps1`). A `// requires:`/`// ignored:`/`// priority` comment anywhere else is a KubeJS property: avoid it. `script-order.mjs --check` is part of T0.
- Inside functions, callbacks or loop bodies that run more than once, use `var`, not `const`/`let` ("redeclaration of var"; in a loop Rhino keeps the first iteration's `const`, which turned 13 pattern builders into solid cuboids).
- Renamed members (the Mojang name does not exist): `getYRot`/`getXRot` -> `getYaw`/`getPitch`, `getStringUUID` -> `getStringUuid`, `tickCount` -> `age`, `Level#getGameTime` -> `getTime`, `ItemStack#getTag` -> `getNbt`; `Entity#level()` is hidden (use `getLevel()`). Full list in `tools/test/README.md`. Anything that uses a player is tested in the `client` suite.
- An empty `ItemStack` (`ItemStack.EMPTY` included) compares `=== null`. Test stacks with `isEmpty()`, never against null.
- `Math.PI` is undefined (code using it silently becomes NaN); `Math.cos`, `Math.floor`, `Math.round` work. Use a literal or precomputed bounds.
- `new Integer(7)` picks `Integer(String)` with `"7.0"` and throws. Use `Integer['valueOf(int)'](n)` and `IntStream['of(int)'](n)`.
- KubeJS's `global` is a Java HashMap: a stored number comes back as `java.lang.Double` and `global.x === 1` is false. Store booleans or strings; read strings with `String(...)`.
- `charCodeAt` returns a Java `Character`; arithmetic on it gives NaN. Use `charAt` with `indexOf` over a known table.
- NightConfig: concatenated paths are `ConsString`s that match `get(String)` and `get(List)`. Call `config['get(java.lang.String)'](path)` / `config['getOptional(java.lang.String)'](path)`, fixtures included.
- Overloads Rhino can't pick: `RecipeDB#find(holder, predicate)` with a JS function is "ambiguous". Call `db['find(com.gregtechceu.gtceu.api.capability.recipe.IRecipeCapabilityHolder,java.util.function.Predicate)'](ctrl, fn)`.
- `scannerResearch` is overloaded `(UnaryOperator)`/`(ItemStack)`: a JS callback becomes an empty stack ("Research recipe must have an item or fluid stack") and aborts every later recipe in the same try. Pass `scannerResearch(Item.of(stack))` (T0 forbids the callback; `stationResearch(fn)` is fine). Research a stack only we research: a GTM component's id (`1x_gtceu_zpm_robot_arm`) is GTM's own research for the next tier, and our scanner recipe would unlock it.

## GTM 7.5.3 traps (each one cost a bench run)
- Recipe ids: the GT builder prefixes the recipe type: `event.recipes.gtceu.assembler('grindless:x')` is saved as `grindless:assembler/x`.
- Generator multiblocks go through `startup_scripts/grindless/lib/generators.js`. `.regressWhenWaiting(false)` is mandatory (otherwise the same fuel pays EU twice). Standard dynamo hatches are 2 A.
- Multi-mode controllers veto recipes of an inactive mode in their modifier (`alwaysTryModifyRecipe`); GTM does not drop the cached recipe when the mode changes. See `mv/leisure_factories.js`.
- Conditions of the same type OR together: `.dimension(a).dimension(b)` means a or b. "Not a and not b" needs an allowlist.
- `SizedIngredient#getItems()` and `FluidIngredient#getStacks()` are unreachable from Rhino. Use `RecipeHelper.getInputItems` / `getInputFluids` / `getRealEUt`.
- Weather is shared: every dimension with sky light takes the Overworld's rain and thunder, and full rain makes `Level#isNight()` true at noon (GTM's daytime condition). `space/airless_weather.js` keeps the other planets in `planets.json` dry.
- Recipe conditions are checked on every tick of a run, so a day/night condition can stall a run halfway. Price time of day with a run-start modifier (`alwaysTryModifyRecipe`, see `ev/cryogenic_plant.js`) plus `.afterWorking(G.freshRun.afterWorking(name))` (`lib/fresh_run.js`): GTM restarts a just-finished recipe for one tick without the modifier.
- A modifier alone doesn't stop a run: GTM restarts an idle machine's cached recipe without the modifier and, with voiding on, skips the room check for voided outputs. A machine that must keep its outputs uses `lib/no_voiding.js` twice: `G.noVoiding.modifier(opts, next)` and `.beforeWorking(G.noVoiding.beforeWorking(opts))`.
- One recipe per lookup path: two recipes of one type with the same inputs collide even with different conditions (the loser never runs, EMI still shows it; log: `failed to add recipe from staging into lookup DB`). A recipe whose inputs are a prefix of another's can hide it. Give each its own circuit or input, or one recipe with ORed conditions. `gg_test_recipe_lookup` fails on any collision of ours.
