// priority: -2100
// -----------------------------------------------------------------------------------------------
// The Catalytic Reformer, the second multiblock of the HV era (the one that can be cut), and the recipe type it runs.
//
//   gtceu:reformer    5x5x6 reactor vessel with three stacked output ports, runs the new gtceu:reforming
//
// What it wins: HYDROGEN and AROMATICS. GTM has no reforming: its benzene comes out of steam cracking (150 mB per 1 000 mB of naphtha, with
// a pile of olefins nobody asked for) and its hydrogen almost only out of the electrolyzer. The Reformer turns desulfurized naphtha into
// benzene, toluene and hydrogen over a platinum catalyst and gives back the hydrogen the Refinery used (server_scripts/grindless/hv/
// reformer.js has the numbers and the hydrogen balance). It gives the platinum of the End a use in HV.
// Its recipes are ours, not GTM's, so they are written by hand and the energy is ours to set; there are no parallels and no discount
// to look for: the vessel has to be fed (naphtha comes out of the Refinery) and the hydrogen has to be piped back.
//
// It is GTM's tower machine class too (DistillationTowerMachine), like the Refinery and the Biorefinery: output 1 (benzene) leaves through
// the lowest output hatch, output 2 (toluene) through the one above and output 3 (hydrogen) through the top one. One hatch per layer,
// exactly, so nothing is voided and nothing mixes.
//
// Geometry (slices back -> front, rows bottom -> top; the controller is in the front slice, middle column, row 1):
//   row 0      floor
//   QR-S1: steel frame posts at the corners, glass windows in the middle of each wall, a glass and pipe roof.
//   row 1      walls around a 3x3 chamber with a steel pipe column in the middle
//   rows 2-4   three layers of the same walls, one output hatch in each (symbols a, b, c)
//   row 5      roof
// The first layer is 1 row above the controller (yOffset 1).
//
// Textures: overlay dir grindless:block/multiblock/reformer, base casing GTM's clean stainless steel casing.
// Names / tooltips: client_scripts/grindless/hv_refinery_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const REFORMER = G.reformer || (G.reformer = {})

  const MACHINE = 'gtceu:reformer'
  const TYPE = 'gtceu:reforming'

  const LAYERS = 3
  const LETTERS = 'abc'
  const WIDTH = 5
  const FIRST_LAYER_ROW = 2
  const ROWS = FIRST_LAYER_ROW + LAYERS + 1
  const CONTROLLER_ROW = 1
  const Y_OFFSET = FIRST_LAYER_ROW - CONTROLLER_ROW

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const PIPE = 'gtceu:steel_pipe_casing'

  // published for the recipe scripts and the smoke test
  REFORMER.machine = MACHINE
  REFORMER.recipeType = TYPE
  REFORMER.layers = LAYERS
  REFORMER.yOffset = Y_OFFSET
  REFORMER.catalyst = 'grindless:reforming_catalyst'
  REFORMER.catalystWear = 5

  // ---------------------------------------------------------------- pattern

  // one row of one slice: si 0 = back ... 4 = front (controller), ri 0 = bottom
  function patternRow(si, ri) {
    if (ri === 0) return 'XXXXX'
    if (ri === 1) {
      if (si === 0) return 'FXXXF'
      if (si === 4) return 'FXSXF'
      return si === 2 ? 'X#P#X' : 'X###X'
    }
    if (ri === ROWS - 1) return si === 0 || si === 4 ? 'FCGCF' : (si === 2 ? 'GCPCG' : 'CCCCC')
    var layer = LETTERS.charAt(ri - FIRST_LAYER_ROW)
    if (si === 0 || si === 4) return 'F' + layer + 'G' + layer + 'F'
    return si === 2 ? 'G#P#G' : layer + '###' + layer
  }

  function patternSlices() {
    var slices = []
    for (var si = 0; si < WIDTH; si++) {
      var rows = []
      for (var ri = 0; ri < ROWS; ri++) rows.push(patternRow(si, ri))
      slices.push(rows)
    }
    return slices
  }

  function patternSymbols() {
    var symbols = {
      S: Pat.controller(),
      // 36 cells of floor and the lowest ring of walls (the corner posts are frames): 3 are parts (the energy hatch, the catalyst bus, the naphtha hatch), the rest casing
      X: Pat.oneOf(
        Pat.block(CLEAN, { min: 32 }),
        Pat.part('energy_input', { exact: 1 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('input_hatch', { exact: 1 })
      ),
      P: Pat.block(PIPE),
      F: Pat.frame(['steel']),
      G: Pat.block('minecraft:glass'),
      C: Pat.block(CLEAN),
      '#': Pat.air()
    }
    for (var i = 0; i < LAYERS; i++) {
      symbols[LETTERS.charAt(i)] = Pat.oneOf(
        Pat.block(CLEAN),
        Pat.part('output_hatch', { exact: 1 })
      )
    }
    return symbols
  }

  const SPEC = { slices: patternSlices(), symbols: patternSymbols() }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // items in: the catalyst and the programmed circuit (the mode); one fluid in (naphtha); fluids out: benzene, toluene, hydrogen
    event.create('reforming')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 0, 1, LAYERS)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)
    var Tower = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.DistillationTowerMachine')

    event.create('reformer', 'multiblock')
      .langValue('Catalytic Reformer')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return new Tower(holder, Y_OFFSET) })
      .recipeType('reforming')
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .allowExtendedFacing(false)
      ["partSorter(java.util.Comparator)"](function (a, b) { return a.self().getPos().getY() - b.self().getPos().getY() })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.reformer.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.reforming')),
        Text.translate('grindless.machine.reformer.tooltip.1')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/reformer')
  })
})()
