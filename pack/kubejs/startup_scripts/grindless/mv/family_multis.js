// -----------------------------------------------------------------------------------------------
// The MV step of the LV family: same recipe types and same structure shape as LV, aluminium instead of steel, 16 runs at once.
//
//   gtceu:mv_vein_drill    3x6x3 derrick, runs gtceu:vein_drilling: every steam and LV recipe plus the vanadium steel bit's own
//   gtceu:mv_greenhouse    5x5x5 house, runs gtceu:greenhouse: every steam and LV recipe plus the fertilizer + CO2 variants
//
// Both use `bores` (global.grindless.lv.bores, startup_scripts/grindless/lv/multis.js) with a cap of 16 runs instead of 8: one
// MV energy hatch (128 V) fills the 16 runs of a drilling recipe (8 EU/t each) and of a fertilizer variant (8 EU/t), two hatches
// are one voltage tier up and GTM's overclock halves the time (4x the EU). Casings: GTM's aluminium frostproof machine casing
// and aluminium frames (aluminium is already there for the MV motors, stainless steel is not).
//
// The drill vetoes a base recipe while drilling fluid is in its hatch (the fluid recipe is the better one, like the LV drill).
// The greenhouse works like the LV one with programmed circuit 2 (fertilizer variants); with CO2 in a hatch as well the
// fertilizer + CO2 variant runs instead of the fertilizer one: x1.5 output on top and 100 mB of O2 back per run. Circuit 1 or no
// circuit: CO2 is ignored and the base recipe runs. The greenhouse needs a fluid OUTPUT hatch for that O2 and takes one or two
// input hatches (water, CO2).
//
// Textures: overlay dirs grindless:block/multiblock/mv_vein_drill and mv_greenhouse (drawn separately). Names / tooltips:
// client_scripts/grindless/mv_family_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const CASING = 'gtceu:frostproof_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  const GLASS = ['minecraft:glass', 'minecraft:tinted_glass', 'gtceu:tempered_glass'].concat(
    DYES.map(function (dye) { return 'minecraft:' + dye + '_stained_glass' }))
  const SOIL = ['minecraft:dirt', 'minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:podzol',
    'minecraft:rooted_dirt', 'minecraft:farmland', 'minecraft:moss_block', 'minecraft:mud']

  const MAX_PARALLELS = 16

  const DRILL = 'gtceu:mv_vein_drill'
  const GREENHOUSE = 'gtceu:mv_greenhouse'

  // ---------------------------------------------------------------- patterns (see lib/patterns.js)

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
      // 15 house cells: 5 or 6 are parts, the rest aluminium casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 9 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 2 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      P: Pat.block('gtceu:steel_pipe_casing'),
      F: Pat.frame(['aluminium'])
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
      // 32 skeleton cells (4 corner posts + floor ring): 5 to 8 are parts (energy, input bus, output bus, input hatches for
      // water and CO2, output hatch for the O2), the rest aluminium casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 24 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('output_hatch', { exact: 1 })
      ),
      G: Pat.block(GLASS),
      D: Pat.block(SOIL)
    }
  }

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var lv = global.grindless.lv
    var rules = lv.rules

    function drillVeto(machine, recipe) {
      return !rules.isFluidRecipe(recipe) && rules.machineHasFluid(machine, 'gtceu:drilling_fluid')
    }

    // circuit 2 = fertilizer mode; with CO2 in a hatch too the fertilizer + CO2 variant is the one that runs
    function greenhouseVeto(machine, recipe) {
      if (rules.machineCircuit(machine) < 2) return false
      if (!rules.isFertilizerRecipe(recipe)) return true
      return !rules.isCo2Recipe(recipe) && rules.machineHasFluid(machine, 'gtceu:carbon_dioxide')
    }

    Pat.register(DRILL, DRILL_SPEC)
    Pat.register(GREENHOUSE, GREENHOUSE_SPEC)

    event.create('mv_vein_drill', 'multiblock')
      .langValue('MV Vein Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('vein_drilling')
      .recipeModifier(lv.bores(drillVeto, MAX_PARALLELS), true)
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, DRILL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mv_vein_drill.tooltip.0'),
        Text.translate('grindless.machine.mv_vein_drill.tooltip.1'),
        Text.translate('grindless.machine.mv_vein_drill.tooltip.2'),
        Text.translate('grindless.machine.mv_vein_drill.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/mv_vein_drill')

    event.create('mv_greenhouse', 'multiblock')
      .langValue('MV Greenhouse')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('greenhouse')
      .recipeModifier(lv.bores(greenhouseVeto, MAX_PARALLELS), true)
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, GREENHOUSE_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.mv_greenhouse.tooltip.0'),
        Text.translate('grindless.machine.mv_greenhouse.tooltip.1'),
        Text.translate('grindless.machine.mv_greenhouse.tooltip.2'),
        Text.translate('grindless.machine.mv_greenhouse.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/mv_greenhouse')
  })
})()
