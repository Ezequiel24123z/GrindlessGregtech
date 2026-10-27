// priority: -4600
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var CASING = 'grindless:station_truss_casing'
  var slices = []
  // Two 8x4 wings around a three-wide spine, ending in a 3x3x3 service hub.
  for (var z = 0; z < 9; z++) {
    var spine = z >= 6 ? 'XXX' : ' T '
    slices.push([
      '        ' + spine + '        ',
      'FFFFFFFF' + (z === 8 ? 'XSX' : spine) + 'FFFFFFFF',
      (z >= 1 && z <= 4 ? 'PPPPPPPP' : '        ') +
        (z >= 6 ? 'XXX' : ' T ') +
        (z >= 1 && z <= 4 ? 'PPPPPPPP' : '        ')
    ])
  }
  var spec = {
    slices: slices,
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(CASING, { min: 18 }),
        Pat.part('input_bus', { exact: 1 }),
        Pat.part('energy_output', { min: 1, max: 4 })),
      T: Pat.block(CASING),
      F: Pat.frame('titanium'),
      P: Pat.block('grindless:orbital_solar_panel')
    }
  }
  var cells = []
  slices.forEach(function (rows, si) {
    rows.forEach(function (row, ri) {
      for (var ci = 0; ci < row.length; ci++) {
        if (row.charAt(ci) === 'P') cells.push({ up: ri - 1, back: 8 - si, side: ci - 9 })
      }
    })
  })
  if (cells.length !== 64) throw new Error('[grindless/orbital_solar] expected 64 panels')
  var steps = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }
  function litPanels(machine) {
    var level = machine.getLevel()
    if (level == null) throw new Error('[grindless/orbital_solar] controller has no level')
    var step = steps[String(machine.getFrontFacing()).toLowerCase()]
    if (!step) throw new Error('[grindless/orbital_solar] invalid controller facing')
    var pos = machine.getPos()
    var lit = 0
    cells.forEach(function (p) {
      if (level.canSeeSky(pos.offset(-step[0] * p.back + step[1] * p.side, p.up,
        -step[1] * p.back - step[0] * p.side).above())) lit++
    })
    return lit
  }
  G.orbitalSolar = {
    machine: 'gtceu:orbital_solar_station',
    panelCells: cells,
    panels: 64,
    duration: 400,
    baseEuPerPanel: 300,
    junctionMultiplier: 1.5,
    litPanels: litPanels
  }
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('orbital_solar').category('multiblock').setEUIO('out')
      .setMaxIOSize(1, 0, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
  })
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    Pat.register(G.orbitalSolar.machine, spec)
    var opts = { name: 'orbital_solar_station', maxParallels: litPanels }
    G.generators.configure(event.create('orbital_solar_station', 'multiblock'), opts)
      .langValue('Orbital Solar Station')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType('orbital_solar')
      .afterWorking(G.freshRun.afterWorking('orbital_solar_station'))
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, spec) })
      .allowExtendedFacing(false)
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.orbital_solar_station.tooltip.0'),
        Text.translate('grindless.machine.orbital_solar_station.tooltip.1'),
        Text.translate('grindless.machine.orbital_solar_station.tooltip.2')
      ])
      .workableCasingModel('grindless:block/luv/station_truss_casing', 'grindless:block/multiblock/orbital_solar_station')
  })
})()
