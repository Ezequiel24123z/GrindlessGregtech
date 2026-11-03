// priority: -4500
// LuV B3: docs/eras/luv.md, sections 6 and 8. A1 owns the materials and structure blocks.
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var PH = G.parallelHatch
  var STATION = 'grindless:station_truss_casing'
  var INERT = 'gtceu:inert_machine_casing'

  function ports(casing, minimum) {
    return Pat.oneOf(Pat.block(casing, { min: minimum }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('input_hatch', { min: 1, max: 2 }), PH.part())
  }

  var smelter = []
  // A 5x5x9 titanium-truss hall (about 180 cells): station panels between four frame posts, two heating-coil bands round the
  // levitation chamber, glass viewing bands at its middle, and a drawing tower that rises from the chamber roof's glass port.
  for (var z = 0; z < 9; z++) {
    var rows = []
    for (var y = 0; y < 5; y++) {
      var row = ''
      for (var x = 0; x < 5; x++) {
        var edgeX = x === 0 || x === 4
        var edgeY = y === 0 || y === 4
        var ch = ' '
        if (z === 0 || z === 8) {
          ch = edgeX && edgeY ? 'F' : 'X'
          if (z === 0 && x === 2 && y === 2) ch = 'G'
          if (z === 8 && x === 2 && y === 2) ch = 'S'
          if (z === 8 && x === 3 && y === 2) ch = 'M'
        } else if (edgeX || edgeY) {
          if (edgeX && edgeY) ch = 'F'
          else if (z === 3 || z === 5) ch = 'K'
          else if (z === 4 && edgeX) ch = 'G'
          else if (z === 4 && y === 4 && x === 2) ch = 'G'
          else ch = 'X'
        } else {
          ch = 'A'
        }
        row += ch
      }
      rows.push(row)
    }
    // The tower base: a station-panel collar round the roof port, then the drawing column of alternating frame and glass.
    rows.push(z === 4 ? ' CGC ' : z === 3 || z === 5 ? ' CCC ' : '     ')
    for (var t = 0; t < 6; t++) rows.push(z === 4 ? '  ' + (t % 2 === 0 ? 'F' : 'G') + '  ' : '     ')
    smelter.push(rows)
  }
  var smelterSpec = {
    slices: smelter,
    symbols: {
      S: Pat.controller(), X: ports(STATION, 6), M: Pat.part('maintenance', { exact: 1 }),
      C: Pat.block(STATION), K: Pat.block('gtceu:hssg_coil_block'), A: Pat.air(),
      G: Pat.block('gtceu:borosilicate_glass_block'), F: Pat.frame(['titanium'])
    }
  }
  var disc = ['  WWWWW  ', ' WWWWWWW ', 'WWWWWWWWW', 'WWWWWWWWW', 'WWWWWWWWW',
    'WWWWWWWWW', 'WWWWWWWWW', ' WWWWWWW ', '  WWWWW  ']
  // The shield is a dish: titanium frame rim, whipple panels, and a 3x3 glass window at the centre where the wake is made.
  var discRows = []
  for (var dy = 0; dy < 9; dy++) {
    var discRow = ''
    for (var dx = 0; dx < 9; dx++) {
      var dch = disc[dy].charAt(dx)
      if (dch === 'W') {
        var rim = disc[dy].charAt(dx - 1) !== 'W' || disc[dy].charAt(dx + 1) !== 'W' ||
          dy === 0 || dy === 8 || disc[dy - 1].charAt(dx) !== 'W' || disc[dy + 1].charAt(dx) !== 'W'
        dch = rim ? 'F' : (Math.abs(dx - 4) <= 1 && Math.abs(dy - 4) <= 1 ? 'G' : 'W')
      }
      discRow += dch
    }
    discRows.push(discRow)
  }
  var wake = [discRows]
  for (var depth = 0; depth < 3; depth++) {
    var carousel = []
    for (var height = 0; height < 9; height++) {
      carousel.push(height < 3 || height > 5 ? '         ' :
        height !== 4 ? '   XXX   ' : depth === 2 ? '   MSX   ' :
          depth === 1 ? '   XAX   ' : '   XXX   ')
    }
    wake.push(carousel)
  }
  var wakeSpec = {
    slices: wake,
    symbols: {
      S: Pat.controller(), X: ports(INERT, 12), M: Pat.part('maintenance', { exact: 1 }),
      A: Pat.air(), W: Pat.block('grindless:whipple_shield_casing'), F: Pat.frame(['titanium']),
      G: Pat.block('gtceu:borosilicate_glass_block')
    }
  }
  var machines = [
    { name: 'microgravity_smelter', title: 'Microgravity Smelter', type: 'microgravity_processing',
      io: [4, 1, 1, 0], spec: smelterSpec, casing: STATION, texture: 'grindless:block/luv/station_truss_casing' },
    { name: 'wake_shield_facility', title: 'Wake Shield Facility', type: 'wake_epitaxy',
      io: [4, 1, 1, 0], spec: wakeSpec, casing: INERT,
      texture: 'gtceu:block/casings/solid/machine_casing_inert_ptfe' }
  ]
  G.orbitalIndustry = { machines: machines }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    machines.forEach(function (m) {
      event.create(m.type).category('multiblock').setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
    })
  })
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    machines.forEach(function (m) {
      Pat.register('gtceu:' + m.name, m.spec)
      event.create(m.name, 'multiblock').langValue(m.title)
        .rotationState(RotationState.NON_Y_AXIS).recipeType(m.type)
        .recipeModifier(PH.modifier(PH.overclock), true)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        .allowExtendedFacing(false)
        ['tooltips(net.minecraft.network.chat.Component[])'](({
          microgravity_smelter: [
            Text.translate('grindless.machine.microgravity_smelter.tooltip.0'),
            Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.microgravity_processing')),
            Text.translate('gtceu.multiblock.parallelizable.tooltip')
          ],
          wake_shield_facility: [
            Text.translate('grindless.machine.wake_shield_facility.tooltip.0'),
            Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.wake_epitaxy')),
            Text.translate('gtceu.multiblock.parallelizable.tooltip')
          ]
        })[m.name])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
