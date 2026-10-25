// -----------------------------------------------------------------------------------------------
// The Atmosphere Processor, the multiblock of the Mars base (docs/eras/ev.md, "Atmosphere processor"), and the recipe type it runs.
//
//   gtceu:atmosphere_processor     5x6x5 (5 wide, 6 high, 5 deep) of stable titanium casing: a dust-filtered air intake with its fan on
//                                  top, an electrolysis stack and a Sabatier reactor inside; runs the new gtceu:atmosphere_processing.
//                                  Every recipe of the type carries .dimension('gcyr:mars'): it can be built anywhere, but it only works
//                                  on Mars
//
// What it wins: A RECIPE THAT ONLY EXISTS ON MARS and THREE MACHINES IN ONE. It takes the thin CO2 air of Mars like GTM's gas collector,
// electrolyzes water like GTM's electrolyzer and joins the hydrogen to the CO2 over a ruthenium catalyst (the Sabatier reaction, which GTM
// does not have): water becomes the base's methane and oxygen (CO2 + 2 H2O -> CH4 + 2 O2). It is the first machine built on Mars after the
// bridge; the numbers are in server_scripts/grindless/ev/mars_site.js. Its catalyst is grindless:ruthenium_catalyst (ev/foundation.js),
// with ruthenium from the platinum plant on Earth.
//
// Machine class: GTM's plain electric multiblock (WorkableElectricMultiblockMachine), so its overclock is GTM's. Each output hatch holds one
// gas: a recipe only starts when every gas it makes has room, so nothing is voided and nothing mixes.
//
// Geometry (slices back -> front, rows bottom -> top, columns left -> right as seen from the front; the controller is in the front slice,
// middle column, row 1):
//   row 0      floor: the 16 cells of its edge are `X` (casing or a part), the 9 inside are casing
//   rows 1-2   titanium walls around the core: the electrolysis stack (a column of titanium frames, left), the gas plenum (air, middle) and
//              the Sabatier reactor (titanium pipe casings, right); the front wall has tempered glass on both sides of the controller and
//              a window above it
//   row 3      roof of the hall, with the gas manifold (titanium pipe casings) over the core
//   row 4      the intake housing, 3x3 set back one block from every side, with the titanium gearbox of the fan in its middle
//   row 5      the dust filters (GTM's filter casings), 3x3, on top of the housing
// The 16 `X` cells are casing or parts: 1-2 EV energy hatches, 1 input bus (catalyst and programmed circuit), 1 input hatch (water) and 2
// output hatches (methane and oxygen), so at least 10 are casing. ME buses and hatches have the same abilities and fit the same cells.
//
// Textures: overlay dir grindless:block/multiblock/atmosphere_processor (tools/assets/Build-MarsSiteTextures.ps1), base casing GTM's stable
// titanium casing. Names / tooltips: client_scripts/grindless/ev_mars_site_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.marsSite || (G.marsSite = {})

  const MACHINE = 'gtceu:atmosphere_processor'
  const TYPE = 'gtceu:atmosphere_processing'

  const STABLE = 'gtceu:stable_machine_casing'
  const STABLE_TEXTURE = 'gtceu:block/casings/solid/machine_casing_stable_titanium'
  const PIPE = 'gtceu:titanium_pipe_casing'
  const GEARBOX = 'gtceu:titanium_gearbox'
  const FILTER = 'gtceu:filter_casing'
  const GLASS = 'gtceu:tempered_glass'

  // published for the recipe script and the smoke test
  MS.machine = MACHINE
  MS.recipeType = TYPE
  // items in: the catalyst and the programmed circuit; no item out; fluid in: the water; fluids out: methane and oxygen (each in its hatch)
  MS.maxIO = { itemsIn: 2, itemsOut: 0, fluidsIn: 1, fluidsOut: 2 }
  MS.hatches = { energy: [1, 2], inputBus: 1, inputHatches: 1, outputHatches: 2 }

  // ---------------------------------------------------------------- pattern

  const BACK = ['XXXXX', 'CCCCC', 'CCCCC', 'CCCCC', '     ', '     ']
  const HALL = ['XCCCX', 'CT#PC', 'CT#PC', 'CPPPC', ' CCC ', ' AAA ']
  const FAN = ['XCCCX', 'CT#PC', 'CT#PC', 'CPPPC', ' CKC ', ' AAA ']
  const FRONT = ['XXXXX', 'CGSGC', 'CGGGC', 'CCCCC', '     ', '     ']
  const SPEC = {
    slices: [BACK, HALL, FAN, HALL, FRONT],
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(
        Pat.block(STABLE, { min: 10 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('input_hatch', { exact: 1 }),
        Pat.part('output_hatch', { exact: 2 })
      ),
      C: Pat.block(STABLE),
      T: Pat.frame(['titanium']),
      P: Pat.block(PIPE),
      K: Pat.block(GEARBOX),
      A: Pat.block(FILTER),
      G: Pat.block(GLASS),
      '#': Pat.air()
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('atmosphere_processing')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(MS.maxIO.itemsIn, MS.maxIO.itemsOut, MS.maxIO.fluidsIn, MS.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_GAS_COLLECTOR, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('atmosphere_processor', 'multiblock')
      .langValue('Atmosphere Processor')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('atmosphere_processing')
      .appearanceBlock(GTBlocks.CASING_TITANIUM_STABLE)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.atmosphere_processor.tooltip.0'),
        Text.translate('grindless.machine.atmosphere_processor.tooltip.1'),
        Text.translate('grindless.machine.atmosphere_processor.tooltip.2'),
        Text.translate('grindless.machine.atmosphere_processor.tooltip.3')
      ])
      .workableCasingModel(STABLE_TEXTURE, 'grindless:block/multiblock/atmosphere_processor')
  })
})()
