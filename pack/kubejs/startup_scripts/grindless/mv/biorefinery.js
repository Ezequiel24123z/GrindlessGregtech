// priority: -5800
// -----------------------------------------------------------------------------------------------
// The Biorefinery, the second multiblock of the MV era, and the recipe type it runs.
//
//   gtceu:biorefinery    3x3x9 column with seven output layers, runs the new gtceu:bio_distillation
//
// What it wins: ALL THE FRACTIONS AT ONCE, from MV. The distillery pulls one fraction per pass; GTM's Distillation Tower (HV, EV circuits)
// is the column that takes every fraction in one pass, and its recipes draw 120 to 640 EU/t. The biorefinery is that column for the
// ORGANIC fluids only (wood tar, vinegar and gas, charcoal byproducts, biomass and fermented biomass, coal tar and gas, creosote and oils,
// diluted acids). Same ratios, same energy per recipe: when a recipe draws more than 120 EU/t it runs longer at 120 EU/t (energy equal, no bonus).
// Crude oil and liquid air stay with the HV tower. It does not simplify anything: every fraction needs somewhere to go.
//
// It is GTM's own tower machine class (DistillationTowerMachine), so it keeps the layered output: output N of the recipe leaves through the
// fluid output hatch N layers above the controller. Differences from GTM's tower, forced by the pattern helper (lib/patterns.js builds
// fixed-size patterns): the column has a fixed height (seven layers, the most fractions any organic recipe has) instead of 2-12, and
// every layer needs exactly one output hatch, so no fraction is ever voided. Tower specifics kept: parts sorted by height (the class
// reads the hatches bottom to top) and no extended facing (the layers must stay vertical).
//
// Textures: overlay dir grindless:block/multiblock/biorefinery (drawn separately), base casing GTM's steel solid machine casing.
// Names / tooltips: client_scripts/grindless/mv_plant_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const BIO = G.biorefinery || (G.biorefinery = {})

  const MACHINE = 'gtceu:biorefinery'
  const TYPE = 'gtceu:bio_distillation'
  const MAX_EUT = 120
  const LAYERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

  const STEEL_CASING = 'gtceu:solid_machine_casing'
  const STEEL_CASING_TEXTURE = 'gtceu:block/casings/solid/machine_casing_solid_steel'
  const PIPE_CASING = 'gtceu:steel_pipe_casing'

  // published for the recipe script and the smoke test
  BIO.machine = MACHINE
  BIO.recipeType = TYPE
  BIO.maxEut = MAX_EUT
  BIO.layers = LAYERS.length

  // ---------------------------------------------------------------- pattern
  // 3x3 footprint, 9 high: base (controller in the front row, energy, input hatch, output bus), seven layers of 8 casing cells around a
  // steel pipe casing column (one output hatch per layer: the layer symbols a-g have `exact 1`), and a casing cap.
  // Slices are listed back -> front, rows bottom -> top.
  function towerSlice(kind) {
    var rows = [kind === 'front' ? 'BSB' : 'BBB']
    LAYERS.forEach(function (ch) {
      rows.push(kind === 'middle' ? ch + 'P' + ch : ch + ch + ch)
    })
    rows.push('CCC')
    return rows
  }

  const TOWER_SYMBOLS = {
    S: Pat.controller(),
    // 8 base cells: 1 or 2 energy hatches, the input hatch and the output bus, the rest steel casing
    B: Pat.oneOf(
      Pat.block(STEEL_CASING, { min: 4 }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      Pat.part('input_hatch', { exact: 1 }),
      Pat.part('output_bus', { exact: 1 })
    ),
    P: Pat.block(PIPE_CASING),
    C: Pat.block(STEEL_CASING)
  }
  LAYERS.forEach(function (ch) {
    TOWER_SYMBOLS[ch] = Pat.oneOf(
      Pat.block(STEEL_CASING),
      Pat.part('output_hatch', { exact: 1 })
    )
  })

  const TOWER_SPEC = {
    slices: [towerSlice('back'), towerSlice('middle'), towerSlice('front')],
    symbols: TOWER_SYMBOLS
  }

  // ---------------------------------------------------------------- recipe type

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // the shape of GTM's distillation_tower type: no item input, one item output (a chanced dust or the fertilizer), one fluid input,
    // up to twelve fluid outputs (the organic recipes use at most seven)
    event.create('bio_distillation')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(0, 1, 1, 12)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(MACHINE, TOWER_SPEC)
    var Tower = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.DistillationTowerMachine')

    event.create('biorefinery', 'multiblock')
      .langValue('Biorefinery')
      .rotationState(RotationState.NON_Y_AXIS)
      .machine(function (holder) { return new Tower(holder) })
      .recipeType('bio_distillation')
      .appearanceBlock(GTBlocks.CASING_STEEL_SOLID)
      .pattern(function (def) { return Pat.build(def, TOWER_SPEC) })
      .allowExtendedFacing(false)
      ["partSorter(java.util.Comparator)"](function (a, b) { return a.self().getPos().getY() - b.self().getPos().getY() })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.biorefinery.tooltip.0'),
        Text.translate('grindless.machine.biorefinery.tooltip.1'),
        Text.translate('grindless.machine.biorefinery.tooltip.2'),
        Text.translate('grindless.machine.biorefinery.tooltip.3')
      ])
      .workableCasingModel(STEEL_CASING_TEXTURE, 'grindless:block/multiblock/biorefinery')
  })
})()
