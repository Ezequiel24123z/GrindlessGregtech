// -----------------------------------------------------------------------------------------------
// The three electric multiblocks of the LV era (every pattern goes through global.grindless.patterns, lib/patterns.js):
//
//   gtceu:lv_vein_drill            steel derrick, 3x6x3, runs gtceu:vein_drilling (the type of the Steam Vein Drill)
//   gtceu:lv_greenhouse            5x5x5 steel and glass house, runs gtceu:greenhouse (the type of the Steam Greenhouse)
//   gtceu:submerged_arc_furnace    3x5x3 heat-proof furnace with a muffler chimney, runs the new gtceu:arc_smelting
//
// The two shared types are WIDENED here (they were registered by the steam scripts with no fluid inputs and 2 item inputs):
// vein_drilling gets 1 fluid input (drilling fluid), greenhouse gets 3 item inputs (catalyst + fertilizer + circuit) and 1
// fluid input (water). The steam recipes are untouched. Widening is just GTRecipeType#setMaxIOSize on the registered type;
// the recipe viewer UI is built lazily, so it sees the new sizes.
//
// Electric multiblocks in GTM 7.5.3 do NOT speed up 8 EU/t recipes: the overclock logic treats ULV like LV, so a plain
// LV multiblock would run the steam drill recipes slower than the steam drill (which runs 4 at once). The drill and the
// greenhouse therefore use `bores`, a recipe modifier of ours: it runs as many copies of the recipe at once as the energy
// hatches allow (hatch voltage / EU per run, at most 8: 4 with an LV energy hatch, 8 with two) and then lets GTM's own
// overclock do the rest. It also makes the "better" recipe win when two recipes fit the inputs (GTM's lookup returns
// whichever it meets first): a base recipe waits while drilling fluid is in the hatch (drill) or while a circuit
// of 2 or more is in a bus (greenhouse), so the fluid / fertilizer variant is the one that runs.
//
// Lookup note (GTM's RecipeDB): a recipe whose ingredient list is a prefix of another recipe's list makes one of the two
// disappear. The generated LV recipes therefore list the ingredient that the steam recipe does NOT start with first
// (drill: drill bit before sample; greenhouse: fertilizer before catalyst). See server_scripts/grindless/lv/*.js.
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

  const ARC_FURNACE_SPEC = {
    slices: [
      // back
      ['XXX', 'XXX', 'XXX', 'XXX', '   '],
      // middle: the furnace chamber (2 air cells), a flue pipe on the roof and the muffler chimney on top of it
      ['XXX', 'X#X', 'X#X', 'XPX', ' M '],
      // front (controller)
      ['XXX', 'XSX', 'XXX', 'XXX', '   ']
    ],
    symbols: {
      S: Pat.controller(),
      // 32 body cells: 6 are parts (2 energy hatches = 2 A each, input bus, fluid input hatch for the quench water,
      // output bus, fluid output hatch for the CO2 / CO)
      X: Pat.oneOf(
        Pat.block(HEAT_CASING, { min: 20 }),
        Pat.part('energy_input', { exact: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('input_hatch', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 }),
        Pat.part('output_hatch', { exact: 1 })
      ),
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

  // recipes generated for the LV machines live under <type>/lv/..., the steam ones directly under <type>/
  function recipePath(recipe) {
    return String(recipe.id.getPath())
  }

  function isLvRecipe(recipe) {
    return recipePath(recipe).indexOf('/lv/') >= 0
  }

  function isFertilizerRecipe(recipe) {
    var path = recipePath(recipe)
    return path.indexOf('/lv/') >= 0 && /_fertilizer$/.test(path)
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

  function drillVeto(machine, recipe) {
    return !isLvRecipe(recipe) && machineHasFluid(machine, 'gtceu:drilling_fluid')
  }

  function greenhouseVeto(machine, recipe) {
    return !isFertilizerRecipe(recipe) && machineCircuit(machine) >= 2
  }

  function bores(veto) {
    return function (machine, recipe) {
      try {
        if (veto(machine, recipe)) return ModifierFunction.NULL
        var c = lazy()
        var runs = c.ParallelLogic.getParallelAmount(machine, recipe, MAX_PARALLELS)
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
    widen('greenhouse', 3, 6, 1, 0)

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
