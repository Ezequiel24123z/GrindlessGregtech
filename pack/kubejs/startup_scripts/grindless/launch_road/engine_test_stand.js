// -----------------------------------------------------------------------------------------------
// The Engine Test Stand (gtceu:engine_test_stand), MV, the first step of the road to the first rocket (docs/viaje.md: MV builds the
// test stand and the radio telescope, HV flies to the Moon), and the recipe type it runs, gtceu:static_fire.
//
// A static fire: the engine is clamped to the stand, fed from the run tanks and fired into the flame bucket; it comes out qualified, or it
// does not fly. No small machine does that, and nothing else makes the parts it qualifies (server_scripts/grindless/launch_road/
// static_fire.js has the recipes and the numbers):
//   MV  the four power thrusters of one motor fire together on RP-1 (kerosene refined from MV diesel) and oxygen -> four qualified
//       power thrusters. Its first job is MV work that the HV rocket motor needs later.
//   HV  an untested rocket motor (the assembler builds it from the qualified thrusters, a base heat shield and Kapton K) fires on GTM's
//       rocket fuel -> gcyr:basic_rocket_motor, the block GCYR's rocket is built from. GCYR's own assembler recipe for that block is gone
//       (server_scripts/grindless/integration/gcyr_launch_road.js): no rocket flies an untested engine.
// The exhaust is CO2 and water, each in its own output hatch: the CO2 goes to the greenhouse or to methanol, the water back to the pumps.
//
// Shape (5 wide, 6 high, 5 deep; slices back -> front, rows bottom -> top, controller in the front slice, middle column, row 1):
//   rows 0-1   the base: an aluminium casing ring around a firebrick flame bucket; the trench under the engine runs across the stand and
//              vents the exhaust through both sides (air); the controller and every hatch but the propellant ones are in the base
//   rows 1-3   four aluminium frame legs standing in the bucket, the engine mount (heat-proof casing) hanging between them over the
//              trench, and the feed line (steel pipe casing) coming down from the tanks
//   rows 4-5   the run tanks (aluminium casing, cryogenic like a LOX tank) with the fuel and oxidizer input hatches
// Energy: one MV hatch runs the MV test; the HV static fire (480 EU/t) needs an HV hatch or two MV hatches (GTM: two hatches of a tier
// count one tier up).
//
// Textures: overlay dir grindless:block/multiblock/engine_test_stand (tools/assets/Build-LaunchRoadTextures.ps1), base casing GTM's
// aluminium frost-proof casing. Names / tooltips: client_scripts/grindless/launch_road_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const LR = G.launchRoad || (G.launchRoad = {})

  const MACHINE = 'gtceu:engine_test_stand'
  const TYPE = 'gtceu:static_fire'

  const CASING = 'gtceu:frostproof_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_frost_proof'
  const FIREBRICK = 'gtceu:firebricks'
  const MOUNT = 'gtceu:heatproof_machine_casing'
  const PIPE = 'gtceu:steel_pipe_casing'

  // ---------------------------------------------------------------- pattern (see lib/patterns.js)
  //
  //   X base: aluminium casing or a hatch   B firebrick (the flame bucket)   F aluminium frame (legs)   E engine mount
  //   P feed line                           T run tank: aluminium casing or a propellant input hatch       # air (plume and vents)
  const SPEC = {
    slices: [
      // back: the back wall of the base
      ['XXXXX', 'XXXXX', '     ', '     ', '     ', '     '],
      // the back legs stand in the bucket; tanks on top
      ['XBBBX', 'XF#FX', ' F F ', ' F F ', ' TTT ', ' TTT '],
      // the middle: the trench crosses the stand and vents on both sides; the engine mount over it, the feed line down the middle
      ['XBBBX', '#####', '  E  ', '  P  ', ' TPT ', ' TTT '],
      // the front legs
      ['XBBBX', 'XF#FX', ' F F ', ' F F ', ' TTT ', ' TTT '],
      // front: the front wall of the base with the controller
      ['XXXXX', 'XXSXX', '     ', '     ', '     ', '     ']
    ],
    symbols: {
      S: Pat.controller(),
      // 29 base cells: 5 or 6 are parts (energy 1-2, the test article's input bus, the output bus, the CO2 and the water hatches)
      X: Pat.oneOf(
        Pat.block(CASING, { min: 20 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 }),
        Pat.part('output_hatch', { exact: 2 })
      ),
      // 17 tank cells: 1 or 2 are the propellant hatches (fuel and oxidizer for the MV test; the HV rocket fuel comes premixed)
      T: Pat.oneOf(
        Pat.block(CASING, { min: 12 }),
        Pat.part('input_hatch', { min: 1, max: 2 })
      ),
      B: Pat.block(FIREBRICK),
      F: Pat.frame(['aluminium']),
      E: Pat.block(MOUNT),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }

  // published for the recipe scripts and the smoke test
  LR.testStand = {
    machine: MACHINE,
    recipeType: TYPE,
    casing: CASING,
    blocks: [CASING, FIREBRICK, MOUNT, PIPE, 'gtceu:aluminium_frame']
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // item in: the test article; item out: the qualified article; fluids in: fuel and oxidizer; fluids out: CO2 and water
    event.create('static_fire')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(1, 1, 2, 2)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.COMBUSTION)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('engine_test_stand', 'multiblock')
      .langValue('Engine Test Stand')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('static_fire')
      .appearanceBlock(GTBlocks.CASING_ALUMINIUM_FROSTPROOF)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.engine_test_stand.tooltip.0'),
        Text.translate('grindless.machine.engine_test_stand.tooltip.1'),
        Text.translate('grindless.machine.engine_test_stand.tooltip.2'),
        Text.translate('grindless.machine.engine_test_stand.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/engine_test_stand')
  })
})()
