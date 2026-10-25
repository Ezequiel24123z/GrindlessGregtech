// -----------------------------------------------------------------------------------------------
// The Lunar Drill (gtceu:lunar_drill), the Moon step of the Vein Drill family (docs/journey.md, "The families change shape and
// parts, not just color"): not a recoloured derrick but a lander. Three stainless steel legs stand on regolith pads, the body is a 3x3x2 block of
// clean stainless steel casing with the hatches, two solar wings of daylight detectors stick out of its sides and a short drill
// string (steel pipe casings) goes down through the body into the ground; a frame on top is the antenna mast. 7 wide, 5 high and
// 5 deep, controller on the front face of the body.
//
// It runs its own recipe type, gtceu:lunar_drilling (so no Earth drill can run a lunar vein and the lunar drill no Earth one), and
// every lunar recipe carries .dimension('gcyr:luna'): the drill forms anywhere it is built, but it only works on the Moon. The
// recipes come from data/grindless/tables/veins_moon.json (server_scripts/grindless/moon/lunar_drilling.js):
//   ilmenite_moon   the mare basalt vein: ilmenite (the only titanium of the pack), olivine, chromite and iron, dry drilling with the
//                   HV drill bit, same numbers as the HV bit without fluid (3.75 raw ores per run, wear 0.5 %), 8 EU/t, 200 ticks
//   regolith_moon   the regolith itself: scooped and baked by the sun (the wings), helium-3 out (kept minimal: the EV regolith cell
//                   takes the regolith over), only by lunar day (GTM's daytime condition), 8 EU/t, 200 ticks
// It uses `bores` (global.grindless.lv.bores, startup_scripts/grindless/lv/multis.js) with the HV cap of 32 runs: one HV energy
// hatch (512 V) runs 32 at once. No veto: the type has only lunar recipes.
//
// Power on the Moon: nothing burns in vacuum, so the first drill runs on batteries brought from Earth (an HV battery buffer); once
// the Earth-Moon quantum bridge is up (server_scripts/grindless/moon/quantum_bridge.js), Earth power comes through AE2 (EU P2P
// tunnel of eup2p, or Applied Flux FE and a GT energy converter).
//
// Textures: overlay dir grindless:block/multiblock/lunar_drill (tools/assets/Build-MoonTextures.ps1). Names / tooltips:
// client_scripts/grindless/moon_lang.js.
(function () {
  const Pat = global.grindless.patterns

  const CASING = 'gtceu:clean_machine_casing'
  const CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  // the ground of the Moon: the pads of the legs (GCYR's surface blocks and the stone under them)
  const REGOLITH = ['gcyr:lunar_mare_regolith', 'gcyr:moon_sand', 'gcyr:moon_stone', 'gcyr:moon_cobblestone']
  const PANEL = 'minecraft:daylight_detector'

  const MAX_PARALLELS = 32
  const DRILL = 'gtceu:lunar_drill'

  // ---------------------------------------------------------------- pattern (see lib/patterns.js: slices back -> front, rows bottom -> top)
  //
  //   R regolith pad   F stainless steel frame (legs, strut, mast)   X body: casing or hatch   S controller
  //   P steel pipe casing (the drill string, into the ground)        W solar wing (daylight detector)
  const DRILL_SPEC = {
    slices: [
      // back: the back leg on its pad
      ['   R   ', '   F   ', '   F   ', '       ', '       '],
      // the strut from the back leg to the body
      ['       ', '       ', '   F   ', '       ', '       '],
      // body, back row, with the wings
      ['       ', '       ', '  XXX  ', 'WWXXXWW', '       '],
      // body, middle row: the drill string goes through it into the ground; the antenna mast on top
      ['   P   ', '   P   ', '  XPX  ', 'WWXXXWW', '   F   '],
      // front: the two front legs on their pads, the body's front row with the controller, the wings
      [' R   R ', ' F   F ', ' FXXXF ', 'WWXSXWW', '       ']
    ],
    symbols: {
      S: Pat.controller(),
      // 16 body cells: 3 to 6 are parts (energy 1-2, one input bus for the sample and the bit, 1-2 output buses, one output hatch
      // for the helium-3 of the regolith), the rest clean stainless steel casing
      X: Pat.oneOf(
        Pat.block(CASING, { min: 8 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('output_hatch', { max: 1 })
      ),
      P: Pat.block('gtceu:steel_pipe_casing'),
      F: Pat.frame(['stainless_steel']),
      R: Pat.block(REGOLITH),
      W: Pat.block(PANEL)
    }
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // in: sample + drill bit; out: stone + up to 4 ores (whole amount + chanced remainder); fluid out: the helium-3 of the regolith
    event.create('lunar_drilling')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 8, 0, 1)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MINER)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var lv = global.grindless.lv

    Pat.register(DRILL, DRILL_SPEC)

    event.create('lunar_drill', 'multiblock')
      .langValue('Lunar Drill')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('lunar_drilling')
      .recipeModifier(lv.bores(null, MAX_PARALLELS), true)
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, DRILL_SPEC) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.lunar_drill.tooltip.0'),
        Text.translate('grindless.machine.lunar_drill.tooltip.1'),
        Text.translate('grindless.machine.lunar_drill.tooltip.2'),
        Text.translate('grindless.machine.lunar_drill.tooltip.3')
      ])
      .workableCasingModel(CASING_TEXTURE, 'grindless:block/multiblock/lunar_drill')
  })
})()
