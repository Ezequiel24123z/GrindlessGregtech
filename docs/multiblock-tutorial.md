# Making a multiblock in Gregtech Grindless

A short, practical guide for anyone who wants to add a multiblock or make an existing one look better. You should know
GregTech Modern as a player and be able to read JavaScript. Everything below is how the pack already does it; the real
example is the LV **Submerged Arc Furnace**, so you can open its files and compare.

## 1. The pieces of a multiblock

A GregTech Modern (GTM 7.5.3) multiblock is five things:

| Piece | What it is | Where it lives |
|---|---|---|
| Shape | Which block goes in each cell, and where the hatches may go | the machine's startup script, as a `SPEC` |
| Machine | The controller block: its name, recipe type, shape and look | the same startup script |
| Recipe type | The list of recipes it runs (a new one, or one GTM already has) | the same startup script |
| Looks | The casing it shows when formed, plus the textures of the controller's front face | `appearanceBlock`, `workableCasingModel`, `pack/kubejs/assets/grindless/textures/` |
| Recipes | The controller's own crafting recipe and the recipes it runs | `pack/kubejs/server_scripts/grindless/<era>/` |

Names and tooltips go in `pack/kubejs/client_scripts/grindless/<era>_<machine>_lang.js`, in English.

The arc furnace's files:

- `pack/kubejs/startup_scripts/grindless/lv/multis.js`: the shape (`ARC_FURNACE_SPEC`), the recipe type (`arc_smelting`) and the machine.
- `pack/kubejs/server_scripts/grindless/lv/crafting_multis.js`: the controller recipe.
- `pack/kubejs/server_scripts/grindless/lv/arc_furnace.js`: the recipes it runs.
- `pack/kubejs/client_scripts/grindless/lv_multis_lang.js` and `lv_info_lang.js`: the name, tooltips and EMI info text.
- `pack/kubejs/assets/grindless/textures/block/multiblock/submerged_arc_furnace/`: the controller face.

To find every file that touches a machine: `git grep -n "submerged_arc_furnace" -- pack tools`.

## 2. Trying changes in game

Install the pack in Prism, then edit the scripts in the instance's `minecraft/kubejs/` folder and copy them back into the
repo's `pack/kubejs/` when they work.

- **Startup scripts** (shapes, machines, recipe types, blocks) load once: **restart the game** after every change.
- **Server scripts** (recipes): `/reload`.
- **Client scripts** (names): `/kubejs reload client_scripts`, or F3+T.
- **EMI** shows each multiblock's shape: open the controller and look at its structure preview.
- **GTM's Terminal** builds the whole structure from your inventory (use creative to test).
- Errors go to `minecraft/logs/kubejs/startup.log` and `server.log`. Read them after every restart.

## 3. Step 1: draw the shape

Every shape goes through the pack's pattern helper, `pack/kubejs/startup_scripts/grindless/lib/patterns.js` (`Pat`). Never
call GTM's pattern API directly: when GTM 8 arrives, only that helper has to change.

A shape is plain data:

- **`slices`** go from the **back** of the machine to the **front**. The controller must sit in the **last** (front) slice.
- Each slice is a list of **rows**, from the **bottom** to the **top**.
- Each row is a string with **one character per column**. Every row has the same length.
- A space means "any block". Every other character is a symbol you define.

This is the arc furnace (5 wide, 6 tall, 5 deep). Read each line as one vertical slice, from the floor up:

```js
const ARC_FURNACE_SPEC = {
  slices: [
    // back wall
    ['XXXXX', 'FXXXF', 'FXXXF', 'FXXXF', 'XXXXX', '     '],
    // electrode 1: coil tip (C), steel frame stem (F) through the roof
    ['XBBBX', 'X###X', 'X#C#X', 'X#F#X', 'XXFXX', '  F  '],
    // flue pipe (P) in the roof and the muffler (M) on top
    ['XBBBX', 'X###X', 'X###X', 'X###X', 'XXPXX', '  M  '],
    // electrodes 2 and 3
    ['XBBBX', 'X###X', 'XC#CX', 'XF#FX', 'XFXFX', ' F F '],
    // front wall with the controller (S)
    ['XXXXX', 'FXSXF', 'FXXXF', 'FXXXF', 'XXXXX', '     ']
  ],
  symbols: {
    S: Pat.controller(),
    X: Pat.oneOf(                                   // the body: casing OR one of the hatches
      Pat.block(HEAT_CASING, { min: 66 }),
      Pat.part('energy_input', { exact: 2 }),
      Pat.part('input_bus', { exact: 1 }),
      Pat.part('input_hatch', { exact: 1 }),
      Pat.part('output_bus', { exact: 1 }),
      Pat.part('output_hatch', { exact: 1 })
    ),
    B: Pat.block('gtceu:firebricks'),
    C: Pat.block('gtceu:cupronickel_coil_block'),
    F: Pat.frame(['steel']),
    P: Pat.block('gtceu:steel_pipe_casing'),
    M: Pat.part('muffler', { exact: 1 }),
    '#': Pat.air()
  }
}
```

The predicates:

| Predicate | Meaning |
|---|---|
| `Pat.controller()` | The controller. Exactly one cell. |
| `Pat.block(id or [ids], {min, max, exact})` | One of these blocks. Limits work only with a single id. |
| `Pat.frame(['steel'])` | GT frame blocks of these materials. Material ids use underscores: `stainless_steel`, `tungsten_steel`. |
| `Pat.part(name, {min, max, exact})` | A hatch or bus. Names: `input_bus`, `output_bus`, `input_hatch`, `output_hatch`, `energy_input`, `energy_output`, `muffler`, `maintenance`, and `steam`, `steam_input_bus`, `steam_output_bus` for steam machines. |
| `Pat.oneOf(a, b, ...)` | Any of these. The usual "casing or hatch" cell. |
| `Pat.air()` / `Pat.any()` | Must be air / anything. |

How to write one:

1. Sketch it on paper or in a creative world first, one layer at a time. Then type the slices.
2. Give the body symbol (`X`) a `min` on the casing, so a player can't build the whole body out of hatches. Count the `X` cells
   and subtract the hatches.
3. Put `exact` or `max` on every hatch the recipes need. The arc furnace needs exactly 2 energy hatches because its recipes draw 2 A.
4. Keep every hatch cell on the outside, where a player can reach it.

## 4. Step 2: register the recipe type and the machine

If no recipe type fits, register a new one. Most multiblocks reuse one GTM already has.

```js
GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
  event.create('arc_smelting')
    .category('multiblock')
    .setEUIO('in')
    .setMaxIOSize(4, 3, 1, 2)          // item in, item out, fluid in, fluid out
    .setProgressBar(GuiTextures.PROGRESS_BAR_ARC_FURNACE, FillDirection.LEFT_TO_RIGHT)
    .setSound(GTSoundEntries.ARC)
})
```

Then the machine. Record the shape with `Pat.register` first: the test tools read it from there.

```js
GTCEuStartupEvents.registry('gtceu:machine', function (event) {
  Pat.register('gtceu:submerged_arc_furnace', ARC_FURNACE_SPEC)

  event.create('submerged_arc_furnace', 'multiblock')
    .langValue('Submerged Arc Furnace')
    .rotationState(RotationState.NON_Y_AXIS)
    .recipeType('arc_smelting')
    .appearanceBlock(GTBlocks.CASING_INVAR_HEATPROOF)
    .pattern(function (def) { return Pat.build(def, ARC_FURNACE_SPEC) })
    ["tooltips(net.minecraft.network.chat.Component[])"]([
      Text.translate('grindless.machine.submerged_arc_furnace.tooltip.0'),
      Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.arc_smelting'))
    ])
    .workableCasingModel('gtceu:block/casings/solid/machine_casing_heatproof',
      'grindless:block/multiblock/submerged_arc_furnace')
})
```

IDs: our machines and recipe types are `gtceu:...`. Our items and blocks, casings included, are `grindless:...`.

Copy one of these patterns when your machine needs more than plain recipes:

- `lib/generators.js`: generators. They must use `.regressWhenWaiting(false)`.
- `lib/mega.js` and `lib/parallel_hatch.js`: parallels and parallel hatches. `uev/electron_beam.js` is a late-era example.
- `lib/coils.js`: coil-tier machines.
- `lib/no_voiding.js` and `lib/fresh_run.js`: machines that must not void outputs, or that are priced by time of day.

Files under `lib/` are shared. Use them, but don't change them in the same pull request as a machine.

## 5. Step 3: make it look good

- **`appearanceBlock`** is the casing the hatches and controller copy when formed. Use the body's main casing.
- **`workableCasingModel(casingTexture, overlayDir)`** draws the controller: the casing texture plus the face from `overlayDir`.
  It needs `overlay_front.png`, `overlay_front_active.png` and `overlay_front_active_emissive.png` (only the pixels that glow),
  each with its `.png.mcmeta` when animated.
- Our textures are procedural 16x16 pixel art made by the `tools/assets/Build-*Textures.ps1` scripts. Nothing is copied from GTM
  or other mods. To add a face, add a generator (or extend your era's) and run it. Don't hand-edit the PNGs.
- **New casings** are blocks registered in the era's `casings.js`, like `uev/casings.js`. From UEV on, a multiblock's body is
  made of its era's own casing family, and each family casing needs something only that era makes.

## 6. Step 4: names, tooltips and EMI info

In the era's lang file (for example `client_scripts/grindless/lv_multis_lang.js`):

```js
add('block.gtceu.submerged_arc_furnace', 'Submerged Arc Furnace')
add('gtceu.arc_smelting', 'Arc Smelting')
add('grindless.machine.submerged_arc_furnace.tooltip.0', '§7Reduces and melts in an electric arc: silicon, sky dust, obsidian.')
```

Every machine also gets an EMI info page saying what it is for and what it needs (`emi.grindless.info.<machine>.N` in
`<era>_info_lang.js`). Use English only: the checks fail on any other language.

## 7. Step 5: recipes

The controller recipe (`server_scripts/grindless/lv/crafting_multis.js`):

```js
event.recipes.gtceu.shaped('gtceu:submerged_arc_furnace', ['ESE', 'CHC', 'BBB'], {
  E: 'grindless:graphite_electrode',
  S: '#forge:plates/steel',
  C: '#gtceu:circuits/lv',        // always the circuit tag, never one specific circuit
  H: 'gtceu:lv_machine_hull',
  B: 'gtceu:heatproof_machine_casing'
}).id('grindless:crafting/submerged_arc_furnace')
```

The recipes it runs (`server_scripts/grindless/lv/arc_furnace.js`) are wrapped in `global.grindless.recipes('<era>/<file>', fn)`,
so one broken script can't stop the others:

```js
global.grindless.recipes('lv/arc_furnace', function (event) {
  event.recipes.gtceu.arc_smelting('grindless:silicon')      // saved as grindless:arc_smelting/silicon
    .itemInputs('3x gtceu:quartz_sand_dust', '2x gtceu:coke_dust')
    .chancedInput('grindless:graphite_electrode', 300, 0)
    .circuit(1)
    .itemOutputs('1x ae2:silicon')
    .outputFluids(Fluid.of('gtceu:carbon_dioxide', 2000))
    .EUt(32, 2).duration(200)
})
```

Pack rules for recipes:

- Every input must be automatable.
- Every byproduct needs a place to go.
- Cost comes from steps and quantity, never from a longer recipe time.

## 8. Step 6: test it

In game:

1. The game starts, and the logs are clean.
2. EMI shows the structure preview and the recipes.
3. The Terminal builds it, and the controller forms.
4. A recipe runs.
5. The controller face lights up while it works.

With the repo's checks:

- `node tools/analysis/structure-quality.mjs --static --top 20` scores the shapes (about 80 s). See section 10.
- `tools\Check-Fast.ps1` runs all the fast checks (T0). GitHub Actions also runs it on every push and pull request.
- The maintainer runs the in-game test bench, which builds and forms every multiblock (`docs/testing/usage.md`, form sweep).

## 9. Reshaping an existing multiblock

This is the easiest way to start: improve how a machine looks without changing what it does.

1. Find its `SPEC` with `git grep -n "<machine id>" -- pack/kubejs/startup_scripts`.
2. Change only `slices` and `symbols`. Keep the machine id and the hatches the recipes need.
3. If the hatch counts change, update the tooltips and the EMI info text that list them.
4. Restart, then check the EMI preview, the Terminal build and forming.
5. Rewrite the shape baseline: `node tools/analysis/structure-quality.mjs --static --write-baseline`.
6. Say in the pull request that the shape changed. Players have to rebuild the machine.

## 10. Design checklist

T0 enforces the first four. Read `docs/quality/structures.md` for the full rules.

- [ ] Not a solid box, and not a hollow box of one casing.
- [ ] No block is more than 70% of the cells.
- [ ] At least 3 kinds of block.
- [ ] At least 2 kinds of detail that show the process: glass windows, pipes, frames, coils, gearboxes.
- [ ] The silhouette says what it does: a tower for a column, a ring for a ring, a long hall for a line.
- [ ] The size fits the tier and the job (field unit, workhorse, plant or hall, flagship). From UV on, machines are big. Never
      pad a shape just to reach a size.
- [ ] From UEV on, the body is the era's own casings. A machine never contains a casing that needs that machine's own product,
      or the era deadlocks.
- [ ] The controller face lights up: `appearanceBlock` plus `workableCasingModel`.
- [ ] The Terminal can build it.
- [ ] At most 264 active blocks (such as coils) per structure.

## 11. Traps

- **`var`, not `const` or `let`, inside functions, callbacks and loops.** The script engine (Rhino) keeps the first loop
  iteration's `const`. Once, that turned 13 shapes into solid boxes.
- **Wrong frame material.** An unknown `Pat.frame` material throws at startup and stops every later registration in the pack.
- **Two recipes of one type with the same inputs** collide, and one never runs. Give each its own circuit or input.
- **IDs get the recipe type in front.** `event.recipes.gtceu.assembler('grindless:x')` is saved as `grindless:assembler/x`.
- **Don't use `Java.to`** in a `Predicates.custom` preview. It once broke EMI's whole GTM integration.
- **Don't write `// priority:` headers by hand.** A tool generates them.
- More traps: `.github/instructions/kubejs.instructions.md`.

## 12. Sending your work

1. Fork the repo and branch from the integration branch (`docs/STATUS.md` names it; it is not `main`).
2. Keep one machine, or one reshape, per pull request.
3. Open the pull request against the integration branch. Say what changed and how you tested it.
4. Write everything in English: code, comments, names and docs.
5. Licences: read `CREDITS.md` before copying anything from another mod. MIT or LGPL code needs credit. GPL, non-commercial or
   all-rights-reserved code is ideas only.
6. Don't touch generated files (`pack/index.toml`, the generated quest chapters, `hidden_until.json`): the maintainer
   regenerates them. The quest book's Multiblocks chapter picks up a new controller on its own.
