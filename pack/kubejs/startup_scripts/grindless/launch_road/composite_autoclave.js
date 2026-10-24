// -----------------------------------------------------------------------------------------------
// The Composite Autoclave (gtceu:composite_autoclave), HV, and the recipe type it runs, gtceu:composite_curing.
//
// Composites for the first rocket are laid up from fibre plies and epoxy and cured under heat and nitrogen pressure in a vessel big enough
// for the part. No small machine does that cure (GTM's autoclave crystallises gems; it holds one fluid and no part this size), so the
// rocket parts it makes come only from here (server_scripts/grindless/launch_road/composite_curing.js has the recipes and the numbers):
//   ablative heat shield tile         glass-fibre foils (GCYR fiberglass) + epoxy: the base heat shield of a rocket motor, under the
//                                     tanks, against the plume. Two of them go into every untested rocket motor
//   composite overwrapped tank        a stainless steel drum (the liner) overwrapped with para-aramid foils in epoxy: two of them make a
//                                     basic fuel tank of GCYR instead of the two bare drums
// The nitrogen pressurises the vessel and is vented after the cure (it is inert: venting it is its honest end), the epoxy is the resin.
//
// Shape (5 wide, 7 high, 4 deep; slices back -> front, rows bottom -> top): a horizontal pressure vessel lying on two stainless steel
// saddles, its axis pointing at the player. A 5x5 octagonal shell of clean stainless steel casing around a 3x3 chamber that runs through
// the two middle slices, closed by the back head and by the door at the front (the controller is in the middle of the door), with the
// nitrogen line (a steel pipe casing) on top. Every hatch and bus sits on the shell. HV: one HV energy hatch (or two).
//
// Textures: overlay dir grindless:block/multiblock/composite_autoclave (tools/assets/Build-LaunchRoadTextures.ps1), base casing GTM's
// clean stainless steel casing. Names / tooltips: client_scripts/grindless/launch_road_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const Pat = G.patterns
  const LR = G.launchRoad || (G.launchRoad = {})

  const MACHINE = 'gtceu:composite_autoclave'
  const TYPE = 'gtceu:composite_curing'

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const PIPE = 'gtceu:steel_pipe_casing'

  // ---------------------------------------------------------------- pattern (see lib/patterns.js)
  //
  //   C shell: clean stainless steel casing or a hatch   F stainless steel frame (saddles)   P nitrogen line   # the chamber (air)
  const SPEC = {
    slices: [
      // back head
      ['     ', ' CCC ', 'CCCCC', 'CCCCC', 'CCCCC', ' CCC ', '     '],
      // shell on its saddles, the nitrogen line on top
      [' F F ', ' CCC ', 'C###C', 'C###C', 'C###C', ' CCC ', '  P  '],
      // shell on its saddles
      [' F F ', ' CCC ', 'C###C', 'C###C', 'C###C', ' CCC ', '     '],
      // the door, with the controller in the middle
      ['     ', ' CCC ', 'CCCCC', 'CCSCC', 'CCCCC', ' CCC ', '     ']
    ],
    symbols: {
      S: Pat.controller(),
      // 65 shell cells: 5 or 6 are parts (energy 1-2, the input bus for fibres and liners, the output bus, the epoxy and the nitrogen
      // hatches), the rest clean stainless steel casing
      C: Pat.oneOf(
        Pat.block(CLEAN, { min: 50 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 }),
        Pat.part('input_hatch', { exact: 2 })
      ),
      F: Pat.frame(['stainless_steel']),
      P: Pat.block(PIPE),
      '#': Pat.air()
    }
  }

  // published for the recipe scripts and the smoke test
  LR.autoclave = {
    machine: MACHINE,
    recipeType: TYPE,
    casing: CLEAN,
    blocks: [CLEAN, PIPE, 'gtceu:stainless_steel_frame']
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // items in: fibre plies (and the liner of a tank); item out: the cured part; fluids in: epoxy and nitrogen; nothing out (vented)
    event.create('composite_curing')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 1, 2, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.FURNACE)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)

    event.create('composite_autoclave', 'multiblock')
      .langValue('Composite Autoclave')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('composite_curing')
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.composite_autoclave.tooltip.0'),
        Text.translate('grindless.machine.composite_autoclave.tooltip.1'),
        Text.translate('grindless.machine.composite_autoclave.tooltip.2'),
        Text.translate('grindless.machine.composite_autoclave.tooltip.3')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/composite_autoclave')
  })
})()
