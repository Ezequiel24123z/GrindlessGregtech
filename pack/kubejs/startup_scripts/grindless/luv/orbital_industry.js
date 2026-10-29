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
  for (var z = 0; z < 7; z++) {
    // A titanium truss frames the 3x3x7 hall; the station panels sit between the posts and the ports are on the end caps and the sides.
    var middle = z === 0 ? 'XXX' : z === 6 ? 'MSX' :
      z === 2 || z === 4 ? 'KKK' : z === 3 ? 'KAK' : 'XAX'
    var cap = z === 0 || z === 6 ? 'FXF' : 'FCF'
    var rows = [cap, middle, z === 3 ? 'FGF' : cap]
    // A six-block, one-cell drawing column rises from the levitation core's glass port.
    for (var y = 0; y < 6; y++) rows.push(z === 3 ? (y % 2 === 0 ? ' F ' : ' G ') : '   ')
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
        ['tooltips(net.minecraft.network.chat.Component[])']([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
