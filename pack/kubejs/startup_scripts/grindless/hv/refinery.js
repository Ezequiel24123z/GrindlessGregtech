// priority: -1900
// -----------------------------------------------------------------------------------------------
// The Refinery, the flagship multiblock of the HV era, and the recipe type it runs.
//
//   gtceu:refinery    7x7x3 reactor base with a 3x3 column of twelve output layers on top (16 blocks tall), runs the new gtceu:refining
//
// What it wins: STEPS IN ONE and YIELD. GTM spreads the oil over four tower passes, four desulfurization reactors and a cracker, and with
// HV circuits only the distillery is available (one fraction per pass: the other three never get made). The Refinery takes crude oil and
// hydrogen in and gives the four desulfurized fractions and the hydrogen sulfide out in one pass; it also cracks and separates what comes
// out. The programmed circuit picks the mode:
//   1  refining        crude (oil, raw oil, light oil, heavy oil) + H2 -> heavy fuel, light fuel, naphtha, refinery gas + H2S
//   2  hydro-cracking  naphtha, light fuel, heavy fuel or refinery gas + H2 -> the separated gases (GTM's lightly_hydro_crack_* + distill_*)
//   3  steam cracking  the same feeds + steam -> olefins, aromatics, fuels and carbon (lightly_steam_crack_* + distill_*)
// Every recipe is generated from GTM's own recipes (server_scripts/grindless/hv/refinery.js): same ratios, and the energy and the time of
// all their stages ADDED. No discount of any kind, no parallels. Its condition is a hydrotreating catalyst in the input bus
// (grindless:hydrotreating_catalyst: cobalt, molybdenum and silica, used up by chance) and a destination for every fraction.
//
// It is GTM's own tower machine class (DistillationTowerMachine), so it keeps the layered output: output N of the recipe leaves through the
// fluid output hatch N layers above the first layer. Differences from GTM's tower, forced by the pattern helper (lib/patterns.js builds
// fixed-size patterns): the column has a fixed height of 12 layers (the most outputs a recipe has: GCYR adds para-xylene to the steam
// cracking of naphtha) instead of 2-12, and every layer needs exactly one output hatch, so no fraction is ever voided. Tower specifics
// kept: the parts are sorted by height (the class reads the hatches bottom to top) and no extended facing (the layers stay vertical).
//
// QR-S1: the column is a framed tower, a steel frame post on each corner, a glass sight strip down the front and the pipe up the middle;
// 3 casing cells per layer take its output hatch.
//
// Geometry (slices are listed back -> front, rows bottom -> top; the controller is in the front slice, middle column, row 1):
//   row 0        floor, 7x7
//   row 1        walls of the reactor hall around a 5x5 empty chamber; a steel pipe column rises from its centre
//   row 2        roof, 7x7
//   rows 3-14    the column: 8 casing cells around the pipe per layer, one of them the output hatch of that layer (symbols a-l)
//   row 15       cap
// The tower class counts the layers from the controller: the first layer is 2 rows above it (yOffset 2).
//
// Textures: overlay dir grindless:block/multiblock/refinery, base casing GTM's clean stainless steel casing.
// Names / tooltips: client_scripts/grindless/hv_refinery_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const REF = G.refinery || (G.refinery = {})

  const MACHINE = 'gtceu:refinery'
  const TYPE = 'gtceu:refining'

  const LAYERS = 12
  const LETTERS = 'abcdefghijkl'
  const WIDTH = 7
  const FIRST_LAYER_ROW = 3
  const ROWS = FIRST_LAYER_ROW + LAYERS + 1
  const CONTROLLER_ROW = 1
  const Y_OFFSET = FIRST_LAYER_ROW - CONTROLLER_ROW

  const CLEAN = 'gtceu:clean_machine_casing'
  const CLEAN_TEXTURE = 'gtceu:block/casings/solid/machine_casing_clean_stainless_steel'
  const PIPE = 'gtceu:steel_pipe_casing'

  // published for the recipe scripts and the smoke test
  REF.machine = MACHINE
  REF.recipeType = TYPE
  REF.layers = LAYERS
  REF.yOffset = Y_OFFSET
  REF.maxFluidOutputs = LAYERS
  REF.catalyst = 'grindless:hydrotreating_catalyst'
  REF.catalystWear = 5

  // ---------------------------------------------------------------- pattern

  // one row of one slice: si 0 = back ... 6 = front (controller), ri 0 = bottom
  function patternRow(si, ri) {
    if (ri === 0) return 'XXXXXXX'
    if (ri === 1) {
      if (si === 0) return 'FXGXGXF'
      if (si === 6) return 'FGXSXGF'
      if (si === 3) return 'X##P##X'
      return si === 2 || si === 4 ? 'G#####G' : 'X#####X'
    }
    if (ri === 2) return si === 3 ? 'XXXPXXX' : 'XXXXXXX'
    if (si < 2 || si > 4) return '       '
    if (ri === ROWS - 1) return si === 3 ? '  CPC  ' : '  FCF  '
    var layer = LETTERS.charAt(ri - FIRST_LAYER_ROW)
    if (si === 3) return '  ' + layer + 'P' + layer + '  '
    return si === 2 ? '  F' + layer + 'F  ' : '  FGF  '
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
      // 108 cells of floor, hall walls and roof (corner posts are frames, the walls have glass windows): 5 or 6 are parts (1-2 energy hatches, the catalyst bus, the carbon bus, the crude and the
      // hydrogen / steam hatches), the rest clean casing
      X: Pat.oneOf(
        Pat.block(CLEAN, { min: 100 }),
        Pat.part('energy_input', { min: 1, max: 2 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('output_bus', { exact: 1 }),
        Pat.part('input_hatch', { exact: 2 })
      ),
      P: Pat.block(PIPE),
      F: Pat.frame(['steel']),
      G: Pat.block('minecraft:glass'),
      C: Pat.block(CLEAN),
      '#': Pat.air()
    }
    // one output hatch on every layer of the column
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
    // items in: the catalyst and the programmed circuit; item out: the carbon of the steam cracking. Fluids in: the feed and the hydrogen
    // (or the steam). Fluids out: one per layer, up to twelve (steam cracking of naphtha); the crude refining uses five
    event.create('refining')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 1, 2, LAYERS)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, SPEC)
    var Tower = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.DistillationTowerMachine')

    event.create('refinery', 'multiblock')
      .langValue('Refinery')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return new Tower(holder, Y_OFFSET) })
      .recipeType('refining')
      .appearanceBlock(GTBlocks.CASING_STAINLESS_CLEAN)
      .pattern(function (def) { return Pat.build(def, SPEC) })
      .allowExtendedFacing(false)
      ["partSorter(java.util.Comparator)"](function (a, b) { return a.self().getPos().getY() - b.self().getPos().getY() })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.refinery.tooltip.0'),
        Text.translate('grindless.machine.refinery.tooltip.1'),
        Text.translate('grindless.machine.refinery.tooltip.2'),
        Text.translate('grindless.machine.refinery.tooltip.3')
      ])
      .workableCasingModel(CLEAN_TEXTURE, 'grindless:block/multiblock/refinery')
  })
})()
