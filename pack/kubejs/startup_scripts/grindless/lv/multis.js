// priority: -5000
// -----------------------------------------------------------------------------------------------
// The three electric multiblocks of the LV era (every pattern goes through global.grindless.patterns, lib/patterns.js):
//
//   gtceu:lv_vein_drill            steel derrick, 3x6x3, runs gtceu:vein_drilling (the type of the Steam Vein Drill)
//   gtceu:lv_greenhouse            5x5x5 steel and glass house, runs gtceu:greenhouse (the type of the Steam Greenhouse)
//   gtceu:submerged_arc_furnace    3x5x3 heat-proof furnace with a muffler chimney, runs the new gtceu:arc_smelting
//
// The two shared types are WIDENED here (they were registered by the steam scripts with no fluid inputs and 2 item inputs):
// vein_drilling gets 1 fluid input (drilling fluid), greenhouse gets 3 item inputs (catalyst + fertilizer + circuit), 2 fluid
// inputs (water + the CO2 of the MV greenhouse) and 1 fluid output (its O2). The steam recipes are untouched. Widening is just
// GTRecipeType#setMaxIOSize on the registered type; the recipe viewer UI is built lazily, so it sees the new sizes.
//
// Electric multiblocks in GTM 7.5.3 do NOT speed up 8 EU/t recipes: the overclock logic treats ULV like LV, so a plain
// LV multiblock would run the steam drill recipes slower than the steam drill (which runs 4 at once). The drill and the
// greenhouse therefore use `bores`, a recipe modifier of ours: it runs as many copies of the recipe at once as the energy
// hatches allow (hatch voltage / EU per run, at most 8: 4 with an LV energy hatch, 8 with two) and then lets GTM's own
// overclock do the rest. It also makes the "better" recipe win when two recipes fit the inputs (GTM's lookup returns
// whichever it meets first): a base recipe waits while drilling fluid is in the hatch (drill) or while a circuit
// of 2 or more is in a bus (greenhouse), so the fluid / fertilizer variant is the one that runs.
// `bores(veto, cap)` is shared as global.grindless.lv.bores (with the recipe-name rules in global.grindless.lv.rules) for the
// MV machines (cap 16, startup_scripts/grindless/mv/), the HV ones (cap 32, startup_scripts/grindless/hv/), the EV Tripod Drill
// (cap 64, startup_scripts/grindless/ev/tripod.js) and the ore plant (cap 6).
// Tier folders: a family recipe of a machine above steam lives under <type>/<tier>/ (lv, mv, hv, ev, iv...), and every electric
// machine of the family skips the recipes of the tiers above its own (rules.isAboveTier), so a new era only adds a folder and no
// lower machine needs a new rule (the steam machines have no veto hook: see the soft spot in hv/family_vein_drilling.js, server
// side). Today: the vanadium steel bit, with it the End veins, and the CO2 variants are the MV machines'
// (<type>/mv/), the stainless steel bit the HV drill's (<type>/hv/), the titanium bit and the lunar and Martian veins the EV
// Tripod Drill's (<type>/ev/); the sealed dome's crops will be <type>/ev/ too.
// The Lunar Drill (startup_scripts/grindless/moon/lunar_drill.js) uses `bores` too, with no veto: its type has only lunar recipes.
//
// Lookup note (GTM's RecipeDB): a recipe whose ingredient list is a prefix of another recipe's list makes one of the two
// disappear. The generated LV recipes therefore list the ingredient that the steam recipe does NOT start with first
// (drill: drill bit before sample; greenhouse: fertilizer before catalyst, the CO2 boosters: circuit before catalyst).
// See server_scripts/grindless/lv/*.js.
//
// Textures: overlay dirs grindless:block/multiblock/<machine> (drawn separately), base casings from GTM:
// steel solid machine casing for the drill and the greenhouse, heat-proof machine casing for the arc furnace.
// Names / tooltips: client_scripts/grindless/lv_multis_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const STEEL_CASING = 'gtceu:solid_machine_casing'
  const STEEL_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const HEAT_CASING = 'gtceu:heatproof_machine_casing'
  const HEAT_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_heatproof'

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  const GLASS = ['minecraft:glass', 'minecraft:tinted_glass', 'gtceu:tempered_glass'].concat(
    DYES.map(function (dye) { return 'minecraft:' + dye + '_stained_glass' }))
  const SOIL = ['minecraft:dirt', 'minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:podzol',
    'minecraft:rooted_dirt', 'minecraft:farmland', 'minecraft:moss_block', 'minecraft:mud']

  const MAX_PARALLELS = 8

  const DRILL = 'gtceu:lv_vein_drill'
  const GREENHOUSE = 'gtceu:lv_greenhouse'
  const ARC_FURNACE = 'gtceu:submerged_arc_furnace'

  // ---------------------------------------------------------------- patterns
  // Specs are plain data + predicate descriptors (see lib/patterns.js): registered at startup so the structure
  // description (global.grindless.structures) exists without building anything; GTM builds the pattern lazily.

  const DRILL_SPEC = {
    slices: [
      // back
      ['XXX', 'XXX', 'F F', 'F F', 'F F', '   '],
      // middle: the pipe goes through the house and ends in a frame mast
      ['XPX', 'XPX', ' F ', ' F ', ' F ', ' F '],
      // front (controller)
      ['XXX', 'XSX', 'F F', 'F F', 'F F', '   ']
    ],
    symbols: {
      S: Pat.controller(),
      // 15 house cells: 5 or 6 are parts, the rest steel casing
      X: Pat.oneOf(
        Pat.block(STEEL_CASING, { min: 9 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 2 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      P: Pat.block('gtceu:steel_pipe_casing'),
      F: Pat.frame(['steel'])
    }
  }

  const GREENHOUSE_SPEC = {
    slices: [
      // back wall
      ['XXXXX', 'XGGGX', 'XGGGX', 'XGGGX', 'XGGGX'],
      // three slices: floor ring + soil, glass walls on both sides, empty interior, glass roof
      ['XDDDX', 'G   G', 'G   G', 'G   G', 'GGGGG'],
      ['XDDDX', 'G   G', 'G   G', 'G   G', 'GGGGG'],
      ['XDDDX', 'G   G', 'G   G', 'G   G', 'GGGGG'],
      // front wall (controller in the middle, eye level)
      ['XXXXX', 'XGGGX', 'XGSGX', 'XGGGX', 'XGGGX']
    ],
    symbols: {
      S: Pat.controller(),
      // 32 skeleton cells (4 corner posts + floor ring): 4 to 6 are parts, the rest steel casing
      X: Pat.oneOf(
        Pat.block(STEEL_CASING, { min: 26 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      G: Pat.block(GLASS),
      D: Pat.block(SOIL)
    }
  }

  // QR-S1: a smelter hall instead of a 3x5x3 heatproof block: a firebrick hearth, a three-block-high furnace chamber between steel
  // corner posts, three electrode columns (coil tip, steel frame stem) that go through the roof, the flue pipe in the roof centre
  // and the muffler chimney on top. 72 'X' cells (floor ring, walls, roof) take the casing and the parts.
  const ARC_FURNACE_SPEC = {
    slices: [
      // back
      ['XXXXX', 'FXXXF', 'FXXXF', 'FXXXF', 'XXXXX', '     '],
      // electrode 1 rises from the middle of the left side of the chamber
      ['XBBBX', 'X###X', 'X#C#X', 'X#F#X', 'XXFXX', '  F  '],
      // middle: the flue pipe and the muffler chimney above the molten pool
      ['XBBBX', 'X###X', 'X###X', 'X###X', 'XXPXX', '  M  '],
      // electrodes 2 and 3
      ['XBBBX', 'X###X', 'XC#CX', 'XF#FX', 'XFXFX', ' F F '],
      // front (controller)
      ['XXXXX', 'FXSXF', 'FXXXF', 'FXXXF', 'XXXXX', '     ']
    ],
    symbols: {
      S: Pat.controller(),
      // 72 body cells: 6 are parts (2 energy hatches = 2 A each, input bus, fluid input hatch for the quench water,
      // output bus, fluid output hatch for the CO2 / CO)
      X: Pat.oneOf(
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
  // ---------------------------------------------------------------- recipe modifiers (see the header)

  var LC = null
  function lazy() {
    if (LC === null) {
      LC = {
        IO: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        ContentModifier: Java.loadClass('com.gregtechceu.gtceu.api.recipe.content.ContentModifier'),
        ParallelLogic: Java.loadClass('com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return LC
  }

  // recipes generated for the LV machines live under <type>/lv/..., the MV ones under <type>/mv/, the HV ones under <type>/hv/,
  // the steam ones directly under <type>/
  function recipePath(recipe) {
    return String(recipe.id.getPath())
  }

  function isMvRecipe(recipe) {
    return recipePath(recipe).indexOf('/mv/') >= 0
  }

  function isHvRecipe(recipe) {
    return recipePath(recipe).indexOf('/hv/') >= 0
  }

  // GTM's voltage tiers, lowest first
  const TIERS = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max']

  // the tier a family recipe is filed under: the highest tier named by a folder of its id path ('' = none, the steam recipes)
  function recipeTier(recipe) {
    var parts = recipePath(recipe).split('/')
    var best = -1
    for (var i = 0; i < parts.length - 1; i++) {
      var t = TIERS.indexOf(parts[i])
      if (t > best) best = t
    }
    return best < 0 ? '' : TIERS[best]
  }

  // true for a recipe of a tier above `tier`: the lower machines of a family skip the better ones' recipes
  function isAboveTier(recipe, tier) {
    var t = recipeTier(recipe)
    return t !== '' && TIERS.indexOf(t) > TIERS.indexOf(tier)
  }

  // drilling recipes that use drilling fluid (LV and MV): .../<vein>_<bit>_fluid
  function isFluidRecipe(recipe) {
    return /_fluid$/.test(recipePath(recipe))
  }

  // greenhouse fertilizer variants: LV .../lv/<crop>_fertilizer, MV .../mv/<crop>_fertilizer_co2
  function isFertilizerRecipe(recipe) {
    return /\/(lv|mv)\/.+_fertilizer(_co2)?$/.test(recipePath(recipe))
  }

  function isCo2Recipe(recipe) {
    return /\/mv\/.+_co2$/.test(recipePath(recipe))
  }

  // greenhouse boosters, programmed circuit 3: LV .../lv/<crop>_co2 (CO2), MV .../mv/<crop>_biomass (fermented biomass)
  function isBoosterRecipe(recipe) {
    return /\/(lv\/.+_co2|mv\/.+_biomass)$/.test(recipePath(recipe))
  }

  // the MV vanadium steel recipe without fluid: the sulfuric acid (leaching) variant replaces it while acid is in the hatch
  function isVanadiumBaseRecipe(recipe) {
    return /\/mv\/.+_vanadium_steel$/.test(recipePath(recipe))
  }

  function machineHasFluid(machine, fluidId) {
    var c = lazy()
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.FluidCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (stack.getAmount() > 0 && String(c.Registries.FLUIDS.getKey(stack.getFluid())) === fluidId) return true
      }
    }
    return false
  }

  // highest programmed-circuit configuration found in the machine's item inputs (0 = no circuit)
  function machineCircuit(machine) {
    var c = lazy()
    var best = 0
    var handlers = machine.getCapabilitiesFlat(c.IO.IN, c.ItemCap)
    for (var i = 0; i < handlers.size(); i++) {
      var contents = handlers.get(i).getContents()
      for (var j = 0; j < contents.size(); j++) {
        var stack = contents.get(j)
        if (c.Circuit.isIntegratedCircuit(stack)) {
          var config = c.Circuit.getCircuitConfiguration(stack)
          if (config > best) best = config
        }
      }
    }
    return best
  }

  // the LV machines do not take the recipes of a higher tier (MV: vanadium bit, End veins, CO2 variants; HV: stainless steel bit;
  // EV: titanium bit, lunar and Martian veins...)
  function drillVeto(machine, recipe) {
    return isAboveTier(recipe, 'lv') || (!isFluidRecipe(recipe) && machineHasFluid(machine, 'gtceu:drilling_fluid'))
  }

  function greenhouseVeto(machine, recipe) {
    return isAboveTier(recipe, 'lv') ||
      (!isFertilizerRecipe(recipe) && !isBoosterRecipe(recipe) && machineCircuit(machine) >= 2)
  }

  // Runs as many copies of the recipe as the energy hatches allow (hatch voltage / EU per run), at most `cap` (8 by default;
  // the MV machines pass 16, the HV ones 32, the ore plant 6), and then GTM's own overclock. `veto(machine, recipe)` = true skips
  // a recipe.
  function bores(veto, cap) {
    var limit = cap || MAX_PARALLELS
    return function (machine, recipe) {
      try {
        if (veto && veto(machine, recipe)) return ModifierFunction.NULL
        var c = lazy()
        var runs = c.ParallelLogic.getParallelAmount(machine, recipe, limit)
        if (runs < 1) return ModifierFunction.NULL
        var parallel = ModifierFunction.IDENTITY
        var scaled = recipe
        if (runs > 1) {
          parallel = ModifierFunction.builder()
            .modifyAllContents(c.ContentModifier.multiplier(runs))
            .eutMultiplier(runs)
            .parallels(runs)
            .build()
          scaled = parallel.apply(recipe)
          if (scaled == null) return ModifierFunction.NULL
        }
        return parallel.andThen(GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, scaled))
      } catch (e) {
        console.error('[grindless/lv] recipe modifier failed: ' + e)
        return ModifierFunction.IDENTITY
      }
    }
  }

  // shared with the MV machines (startup_scripts/grindless/mv/*.js read it inside their registry callbacks, which run after
  // every startup script has been evaluated)
  var shared = global.grindless.lv || (global.grindless.lv = {})
  shared.bores = bores
  shared.rules = {
    recipePath: recipePath,
    isMvRecipe: isMvRecipe,
    isHvRecipe: isHvRecipe,
    tiers: TIERS.slice(),
    recipeTier: recipeTier,
    isAboveTier: isAboveTier,
    isFluidRecipe: isFluidRecipe,
    isFertilizerRecipe: isFertilizerRecipe,
    isCo2Recipe: isCo2Recipe,
    isBoosterRecipe: isBoosterRecipe,
    isVanadiumBaseRecipe: isVanadiumBaseRecipe,
    machineHasFluid: machineHasFluid,
    machineCircuit: machineCircuit
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('arc_smelting')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(4, 3, 1, 2)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARC_FURNACE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  // vein_drilling and greenhouse come from the steam scripts; the recipe type event is over by the time machines are
  // registered, so they are widened from the machine event
  function widen(name, itemsIn, itemsOut, fluidsIn, fluidsOut) {
    var type = GTRecipeTypes.get(name)
    if (type == null) throw new Error('[grindless/lv] recipe type gtceu:' + name + ' is not registered')
    type.setMaxIOSize(itemsIn, itemsOut, fluidsIn, fluidsOut)
  }

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    // 10 item outputs: stone + up to 4 ores, each as a whole amount plus a chanced remainder (the 1.5x yields need more entries)
    widen('vein_drilling', 2, 10, 1, 0)
    // greenhouse: 2 fluid inputs (water + the CO2 of the MV greenhouse) and 1 fluid output (its O2)
    widen('greenhouse', 3, 6, 2, 1)

    Pat.register(DRILL, DRILL_SPEC)
    Pat.register(GREENHOUSE, GREENHOUSE_SPEC)
    Pat.register(ARC_FURNACE, ARC_FURNACE_SPEC)

    event.create('lv_vein_drill', 'multiblock')
      .langValue('LV Vein Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('vein_drilling')
      .recipeModifier(bores(drillVeto), true)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, DRILL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.lv_vein_drill.tooltip.0'),
        Text.translate('grindless.machine.lv_vein_drill.tooltip.1'),
        Text.translate('grindless.machine.lv_vein_drill.tooltip.2'),
        Text.translate('grindless.machine.lv_vein_drill.tooltip.3')
      ])
      .workableCasingModel(STEEL_CASING_TEXTURE, 'grindless:block/multiblock/lv_vein_drill')

    event.create('lv_greenhouse', 'multiblock')
      .langValue('LV Greenhouse')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('greenhouse')
      .recipeModifier(bores(greenhouseVeto), true)
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, GREENHOUSE_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.lv_greenhouse.tooltip.0'),
        Text.translate('grindless.machine.lv_greenhouse.tooltip.1'),
        Text.translate('grindless.machine.lv_greenhouse.tooltip.2'),
        Text.translate('grindless.machine.lv_greenhouse.tooltip.3')
      ])
      .workableCasingModel(STEEL_CASING_TEXTURE, 'grindless:block/multiblock/lv_greenhouse')

    event.create('submerged_arc_furnace', 'multiblock')
      .langValue('Submerged Arc Furnace')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('arc_smelting')
      .appearanceBlock(GTBlocks.CASING_INVAR_HEATPROOF)
      .pattern(function (def) { return Pat.build(def, ARC_FURNACE_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.submerged_arc_furnace.tooltip.0'),
        Text.translate('grindless.machine.submerged_arc_furnace.tooltip.1'),
        Text.translate('grindless.machine.submerged_arc_furnace.tooltip.2'),
        Text.translate('grindless.machine.submerged_arc_furnace.tooltip.3')
      ])
      .workableCasingModel(HEAT_CASING_TEXTURE, 'grindless:block/multiblock/submerged_arc_furnace')
  })
})()
