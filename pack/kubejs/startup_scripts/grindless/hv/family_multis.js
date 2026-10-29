// priority: -1800
// -----------------------------------------------------------------------------------------------
// The HV step of the LV family: same recipe types and same structure shape as LV and MV, stainless steel instead of aluminium,
// 32 runs at once.
//
//   gtceu:hv_vein_drill    3x6x3 derrick, runs gtceu:vein_drilling: every steam, LV and MV recipe plus the HV ones (the stainless
//                          steel bit and the End veins, which only this drill and better can run)
//   gtceu:hv_greenhouse    5x5x5 house, runs gtceu:greenhouse: every steam, LV and MV recipe (fertilizer, CO2 and all). The HV
//                          greenhouse is only the step: no recipes of its own, HV needs no more wood or crops than MV
//
// Both use `bores` (global.grindless.lv.bores, startup_scripts/grindless/lv/multis.js) with a cap of 32 runs: one HV energy
// hatch (512 V) fills the 32 runs of a drilling recipe (8 EU/t each) and of a fertilizer / CO2 variant (8 EU/t), two hatches are
// one voltage tier up and GTM's overclock halves the time (4x the EU). Casings: GTM's clean stainless steel machine casing and
// stainless steel frames, and the steel pipe casing of LV and MV for the drill's mast. Nothing in the structure, the controllers or
// the bit needs titanium: HV has none (DECISIONS.md, 2026-10-24; titanium comes from the Moon and opens EV).
//
// The vetoes are the MV ones: the drill vetoes a base recipe while drilling fluid is present in its hatch (the fluid recipe is the
// better one) and the vanadium steel base while sulfuric acid is (the leaching variant takes its place); the greenhouse follows the
// programmed circuit (2 = the LV fertilizer variant; 3 = the boosters; 4 = the fertilizer + CO2 variant). Both run every
// recipe the lower machines run and skip the ones of the tiers above HV (<type>/ev/ and up: rules.isAboveTier, lv/multis.js): the
// titanium bit and the lunar and Martian veins are the EV Tripod Drill's.
//
// Textures: overlay dirs grindless:block/multiblock/hv_vein_drill and hv_greenhouse (drawn separately). Names / tooltips:
// client_scripts/grindless/hv_family_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const CASING = 'gtceu:clean_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'

  const DYES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray',
    'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
  const GLASS = ['minecraft:glass', 'minecraft:tinted_glass', 'gtceu:tempered_glass'].concat(
    DYES.map(function (dye) { return 'minecraft:' + dye + '_stained_glass' }))
  const SOIL = ['minecraft:dirt', 'minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:podzol',
    'minecraft:rooted_dirt', 'minecraft:farmland', 'minecraft:moss_block', 'minecraft:mud']

  const MAX_PARALLELS = 32

  const DRILL = 'gtceu:hv_vein_drill'
  const GREENHOUSE = 'gtceu:hv_greenhouse'

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
      // 15 house cells: 5 or 6 are parts, the rest stainless steel casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 9 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 2 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      P: Pat.block('gtceu:steel_pipe_casing'),
      F: Pat.frame(['stainless_steel'])
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
      // water and CO2, output hatch for the O2), the rest stainless steel casing
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
      return rules.isAboveTier(recipe, 'hv') ||
        (!rules.isFluidRecipe(recipe) && rules.machineHasFluid(machine, 'gtceu:drilling_fluid')) ||
        (rules.isVanadiumBaseRecipe(recipe) && rules.machineHasFluid(machine, 'gtceu:sulfuric_acid'))
    }

    // circuit 2 = the LV fertilizer variant, circuit 3 = boosters, circuit 4 = the fertilizer + CO2 variant
    function greenhouseVeto(machine, recipe) {
      if (rules.isAboveTier(recipe, 'hv')) return true
      if (rules.machineCircuit(machine) < 2) return false
      return !rules.isBoosterRecipe(recipe) && !rules.isFertilizerRecipe(recipe)
    }

    Pat.register(DRILL, DRILL_SPEC)
    Pat.register(GREENHOUSE, GREENHOUSE_SPEC)

    event.create('hv_vein_drill', 'multiblock')
      .langValue('HV Vein Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('vein_drilling')
      .recipeModifier(lv.bores(drillVeto, MAX_PARALLELS), true)
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, DRILL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.hv_vein_drill.tooltip.0'),
        Text.translate('grindless.machine.hv_vein_drill.tooltip.1'),
        Text.translate('grindless.machine.hv_vein_drill.tooltip.2'),
        Text.translate('grindless.machine.hv_vein_drill.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/hv_vein_drill')

    event.create('hv_greenhouse', 'multiblock')
      .langValue('HV Greenhouse')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('greenhouse')
      .recipeModifier(lv.bores(greenhouseVeto, MAX_PARALLELS), true)
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, GREENHOUSE_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.hv_greenhouse.tooltip.0'),
        Text.translate('grindless.machine.hv_greenhouse.tooltip.1'),
        Text.translate('grindless.machine.hv_greenhouse.tooltip.2'),
        Text.translate('grindless.machine.hv_greenhouse.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/hv_greenhouse')
  })
})()
