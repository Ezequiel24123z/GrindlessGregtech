// -----------------------------------------------------------------------------------------------
// Two EV multiblocks of "Raising EV to the target" (docs/eras/ev.md), both on Earth, and the recipe types they run:
//
//   gtceu:combined_cycle_plant   5x8x7 gas turbine hall of stable titanium casing with a heat-recovery boiler (firebricks around titanium
//                                pipes, with a stack) on its back. A generator: runs the new gtceu:combined_cycle
//   gtceu:hot_strip_mill         3x3x9 line of rolling stands of stable titanium casing, steel frames and titanium gearboxes, with water
//                                sprays (titanium pipes) and a steam hood. Runs the new gtceu:hot_rolling
//
// COMBINED-CYCLE PLANT. What it gains: MORE ENERGY FROM THE SAME FUEL, THROUGH A MORE COMPLEX PLANT (AGENTS.md rule 8). The gas
// turbine's exhaust is still hot; a heat-recovery boiler turns it into steam for a steam turbine, as real combined-cycle plants do. Every
// gtceu:combined_cycle recipe is generated from a live gtceu:gas_turbine recipe (server_scripts/grindless/ev/combined_cycle_and_hot_mill.js):
// the same fuel, the same EU/t and the same duration (so the same EU per mB as the gas turbine, after the x2 of power/generators.js), plus
// distilled water in and steam out, worth 40 % of the fuel's EU at the pack's 1 EU per mB of steam. The steam is the only gain, and only a
// second plant (a steam turbine) turns it into power. The plant is a generator built with lib/generators.js: n parallel copies of the
// recipe, n = min(256, what the dynamo hatches carry / 32 EU/t, the fuel and water in the hatches, the room for the steam), no overclock,
// .regressWhenWaiting(false). 256 runs of 32 EU/t are 8 192 EU/t, two EV dynamo hatches (2 x 2 048 V x 2 A).
//
// HOT STRIP MILL. What it gains: SEVERAL STEPS IN ONE, AND ENERGY BACK. A hot ingot goes straight from the blast furnace to a plate, rods or
// foil, without the vacuum freezer and the bender or extruder, and the water that quenches it comes out as steam. Every gtceu:hot_rolling
// recipe is generated from the live freezer recipe of a hot ingot that asks only for EU (the ones that need liquid helium, 5 000 K and up,
// keep the freezer) and the live bender or extruder recipe of the product: the same ratios and the sum of both energies, no discount. Plain
// electric multiblock with GTM's overclock, no parallels.
//
// Steam has to go somewhere (both machines): every steam output is real and goes to the steam output hatch. If that hatch has no room the
// machine does not start a run (GTM checks the room for every output, the parallels of the plant included), and the controller's fluid
// voiding is refused (the recipe modifier cancels the run with grindless.steam_outputs.no_voiding): the steam is never thrown away.
//
// Site: a fuel burns in the plant where it burns in a gas turbine (ev.md site rules, power/generators.js): fuels that need air only
// where there is air (each plant recipe copies its gas turbine recipe's dimension conditions, or gets power.burnsInAir), methalox and the
// other fuels that carry their own oxidizer anywhere. The mill has no site rule.
//
// Geometry (slices back -> front, rows bottom -> top, columns left -> right as seen from the front; the controller is in the front slice):
//   plant  back three slices: the heat-recovery boiler, 5 wide and 6 high: stable casing base, firebrick walls around a 3x4 bank of
//          titanium pipe casings, a duct from the turbine (pipe casing in its front wall) and a two-block pipe stack on top. Front four
//          slices: the turbine hall, 5 wide and 4 high: titanium turbine casings around a titanium gearbox shaft and generator, stable
//          casing walls and roof. Row 0 of the hall (20 cells, symbol X) is the only place for parts: 1-2 dynamo hatches, 1-2 fluid input
//          hatches (fuel and distilled water) and exactly 1 fluid output hatch (the steam); at least 15 X cells stay casing. The
//          controller sits in the front face, middle column, row 1.
//   mill   front slice (controller in the middle) and the entry slice behind it: rings of X cells; four rolling stands: a titanium
//          gearbox above and below the strip (the work rolls) between two steel frames (the housings); two spray slices: titanium pipe
//          casings under and beside the strip and a hood row of X cells over it; the exit slice: a ring of X cells. The strip path in the
//          middle is air. X cells (30) take 1 input bus, 1 output bus, 1 fluid input hatch (water), 1 fluid output hatch (steam) and 1-2
//          energy hatches; at least 24 stay casing.
//
// Textures: overlay dirs grindless:block/multiblock/combined_cycle_plant and .../hot_strip_mill (tools/assets/
// Build-CombinedCycleHotMillTextures.ps1), base casing GTM's stable titanium machine casing. Names / tooltips:
// client_scripts/grindless/ev_combined_cycle_and_hot_mill_lang.js. Recipes and controller recipes: server_scripts/grindless/ev/
// combined_cycle_and_hot_mill.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const Gen = G.generators
  const CC = G.combinedCycle || (G.combinedCycle = {})
  const HM = G.hotStripMill || (G.hotStripMill = {})

  const PLANT = 'gtceu:combined_cycle_plant'
  const MILL = 'gtceu:hot_strip_mill'

  const CASING = 'gtceu:stable_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_stable_titanium'
  const TURBINE = 'gtceu:titanium_turbine_casing'
  const GEARBOX = 'gtceu:titanium_gearbox'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const FIREBRICKS = 'gtceu:firebricks'

  // 256 runs of 32 EU/t = 8 192 EU/t: two EV dynamo hatches
  const PLANT_MAX_PARALLELS = 256
  const NO_VOIDING = 'grindless.steam_outputs.no_voiding'

  // published for the recipe script and the smoke test
  CC.machine = PLANT
  CC.recipeType = 'gtceu:combined_cycle'
  CC.maxParallels = PLANT_MAX_PARALLELS
  CC.maxIO = { itemsIn: 0, itemsOut: 0, fluidsIn: 2, fluidsOut: 1 }
  CC.parts = { energy_output: { min: 1, max: 2 }, input_hatch: { min: 1, max: 2 }, output_hatch: { exact: 1 } }
  HM.machine = MILL
  HM.recipeType = 'gtceu:hot_rolling'
  // items in: the hot ingot and the programmed circuit; out: the product. Fluids: water in, steam out
  HM.maxIO = { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }
  HM.parts = { input_bus: { exact: 1 }, output_bus: { exact: 1 }, input_hatch: { exact: 1 }, output_hatch: { exact: 1 }, energy_input: { min: 1, max: 2 } }

  // ---------------------------------------------------------------- patterns

  const PLANT_SPEC = {
    slices: [
      // heat-recovery boiler: back wall
      ['CCCCC', 'FFFFF', 'FFFFF', 'FFFFF', 'FFFFF', 'FFFFF', '     ', '     '],
      // heat-recovery boiler: the bank of titanium pipes, and the stack
      ['CCCCC', 'FPPPF', 'FPPPF', 'FPPPF', 'FPPPF', 'FFPFF', '  P  ', '  P  '],
      // heat-recovery boiler: front wall, with the duct from the turbine's exhaust
      ['CCCCC', 'FFPFF', 'FFFFF', 'FFFFF', 'FFFFF', 'FFFFF', '     ', '     '],
      // turbine hall: the turbine's exhaust end
      ['XXXXX', 'CTTTC', 'CTTTC', 'CCCCC', '     ', '     ', '     ', '     '],
      // turbine hall: the turbine around its shaft
      ['XXXXX', 'CTGTC', 'CTTTC', 'CCCCC', '     ', '     ', '     ', '     '],
      // turbine hall: the generator
      ['XXXXX', 'CGGGC', 'CTTTC', 'CCCCC', '     ', '     ', '     ', '     '],
      // front face
      ['XXXXX', 'CCSCC', 'CCCCC', 'CCCCC', '     ', '     ', '     ', '     ']
    ],
    symbols: {
      S: Pat.controller(),
      // 20 cells: 3 to 5 are parts, the rest stable titanium casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 15 }),
        Pat.part('energy_output', CC.parts.energy_output),
        Pat.part('input_hatch', CC.parts.input_hatch),
        Pat.part('output_hatch', CC.parts.output_hatch)
      ),
      C: Pat.block(CASING),
      T: Pat.block(TURBINE),
      G: Pat.block(GEARBOX),
      P: Pat.block(PIPE),
      F: Pat.block(FIREBRICKS)
    }
  }

  const MILL_RING = ['XXX', 'X#X', 'XXX']
  const MILL_STAND = ['CGC', 'F#F', 'CGC']
  const MILL_SPRAY = ['CPC', 'P#P', 'XXX']
  const MILL_SPEC = {
    // exit, two spray slices under the hood, four rolling stands, the entry table, the front face
    slices: [MILL_RING, MILL_SPRAY, MILL_SPRAY, MILL_STAND, MILL_STAND, MILL_STAND, MILL_STAND, MILL_RING, ['XXX', 'XSX', 'XXX']],
    symbols: {
      S: Pat.controller(),
      // 30 cells: 5 or 6 are parts, the rest stable titanium casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 24 }),
        Pat.part('input_bus', HM.parts.input_bus),
        Pat.part('output_bus', HM.parts.output_bus),
        Pat.part('input_hatch', HM.parts.input_hatch),
        Pat.part('output_hatch', HM.parts.output_hatch),
        Pat.part('energy_input', HM.parts.energy_input)
      ),
      C: Pat.block(CASING),
      G: Pat.block(GEARBOX),
      F: Pat.frame(['steel']),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- steam has to go somewhere

  var fluidCap = null
  var noVoiding = null

  // true while the controller is set to void fluids (GTM's IVoidable): the steam would be thrown away instead of stopping the machine
  function voidsFluids(machine) {
    if (fluidCap === null) fluidCap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    return machine.canVoidRecipeOutputs(fluidCap) === true
  }

  function refusal() {
    if (noVoiding === null) noVoiding = ModifierFunction.cancel(Text.translate(NO_VOIDING))
    return noVoiding
  }

  // the plant: the generator helper's own modifier (lib/generators.js) behind the voiding refusal
  function plantModifier() {
    var generator = Gen.modifier({ maxParallels: PLANT_MAX_PARALLELS, name: 'combined_cycle_plant' })
    var failed = false
    return function (machine, recipe) {
      try {
        if (voidsFluids(machine)) return refusal()
      } catch (e) {
        if (!failed) {
          failed = true
          console.error('[grindless/ev] combined-cycle plant voiding check failed: ' + e)
        }
        return ModifierFunction.NULL
      }
      return generator(machine, recipe)
    }
  }

  // the mill: the voiding refusal, then GTM's own overclock (the default modifier of an electric multiblock)
  function millModifier() {
    var failed = false
    return function (machine, recipe) {
      try {
        if (voidsFluids(machine)) return refusal()
        return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
      } catch (e) {
        if (!failed) {
          failed = true
          console.error('[grindless/ev] hot strip mill recipe modifier failed: ' + e)
        }
        return ModifierFunction.NULL
      }
    }
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // a generator type (lib/generators.js): EU out, recipes at .EUt(-x). Fluids in: the fuel and distilled water; out: steam
    event.create('combined_cycle')
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(CC.maxIO.itemsIn, CC.maxIO.itemsOut, CC.maxIO.fluidsIn, CC.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_GAS_COLLECTOR, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.TURBINE)

    event.create('hot_rolling')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(HM.maxIO.itemsIn, HM.maxIO.itemsOut, HM.maxIO.fluidsIn, HM.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_BENDING, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MOTOR)
  })

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(PLANT, PLANT_SPEC)
    Pat.register(MILL, MILL_SPEC)

    // configure() sets .generator(true), .regressWhenWaiting(false) and the controller lines; the recipe modifier it sets is then
    // replaced by the same helper modifier behind the voiding refusal
    Gen.configure(event.create('combined_cycle_plant', 'multiblock'), { maxParallels: PLANT_MAX_PARALLELS, name: 'combined_cycle_plant' })
      .recipeModifier(plantModifier(), true)
      // GTM restarts a cached recipe without the modifier: refuse steam voiding at every start too (lib/no_voiding.js, IV-A4's finding)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'fluids', reason: NO_VOIDING, name: 'combined-cycle plant' }))
      .langValue('Combined-Cycle Plant')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('combined_cycle')
      .appearanceBlock(GTBlocks.CASING_TITANIUM_STABLE)
      .pattern(function (def) { return Pat.build(def, PLANT_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.combined_cycle_plant.tooltip.0'),
        Text.translate('grindless.machine.combined_cycle_plant.tooltip.1'),
        Text.translate('grindless.machine.combined_cycle_plant.tooltip.2'),
        Text.translate('grindless.machine.combined_cycle_plant.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/combined_cycle_plant')

    event.create('hot_strip_mill', 'multiblock')
      .langValue('Hot Strip Mill')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('hot_rolling')
      .recipeModifier(millModifier(), true)
      .beforeWorking(G.noVoiding.beforeWorking({ which: 'fluids', reason: NO_VOIDING, name: 'hot strip mill' }))
      .appearanceBlock(GTBlocks.CASING_TITANIUM_STABLE)
      .pattern(function (def) { return Pat.build(def, MILL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.hot_strip_mill.tooltip.0'),
        Text.translate('grindless.machine.hot_strip_mill.tooltip.1'),
        Text.translate('grindless.machine.hot_strip_mill.tooltip.2'),
        Text.translate('grindless.machine.hot_strip_mill.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/hot_strip_mill')
  })
})()
