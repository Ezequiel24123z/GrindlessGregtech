(function () {
  var G = global.grindless
  var Pat = G.patterns
  var A = G.antimatterCygnus = {
    table: 'kubejs/data/grindless/tables/antimatter_cygnus.json',
    site: 'grindless:cygnus_x1_orbit'
  }
  var HPC = 'gtceu:high_power_casing'
  var SHIELD = 'grindless:annihilation_shield_casing'
  A.machines = [
    { name: 'jet_beam_line', type: 'jet_beam_extraction', w: 5, h: 5, d: 21, io: [3, 0, 1, 1],
      casing: HPC, texture: 'gtceu:block/casings/hpca/high_power_casing',
      pal: { F: HPC, C: 'gtceu:superconducting_coil', K: 'grindless:srf_cryomodule_block', L: 'gtceu:fusion_glass' } },
    { name: 'spallation_target_station', type: 'antiproton_production', w: 9, h: 7, d: 13, io: [3, 2, 1, 1],
      casing: SHIELD, texture: 'grindless:block/opv/annihilation_shield_casing',
      pal: { F: SHIELD, C: 'gtceu:superconducting_coil', P: 'gtceu:tungstensteel_pipe_casing', L: 'gtceu:fusion_glass' } },
    { name: 'antiproton_decelerator', type: 'beam_cooling', w: 13, h: 5, d: 13, io: [4, 1, 1, 1],
      casing: HPC, texture: 'gtceu:block/casings/hpca/high_power_casing',
      pal: { F: HPC, C: 'gtceu:superconducting_coil', V: 'grindless:neg_xhv_casing', K: 'grindless:srf_cryomodule_block' } }
  ]

  function abs(x) { return x < 0 ? -x : x }
  function jet(x, y, z) {
    var dx = abs(x - 2)
    var dy = abs(y - 2)
    var r = Math.max(dx, dy)
    if (y === 0 && dx <= 1) return 'X'
    if (z === 0 || z === 20) return r <= 1 ? 'L' : 'F'
    if (r === 0) return '#'
    if (z >= 12 && z <= 16) return r === 1 ? 'K' : (dx === 2 && dy === 2 ? ' ' : 'F')
    if (z % 5 === 2 || z % 5 === 3) return r === 1 ? 'C' : (dx === 2 && dy === 2 ? ' ' : 'F')
    return r === 1 ? 'L' : (dx === 2 && dy === 2 ? ' ' : 'F')
  }
  function target(x, y, z) {
    var dx = abs(x - 4)
    var rim = x === 0 || x === 8 || z === 0 || z === 12
    if (y === 0) return rim ? 'F' : 'X'
    if (y === 6) return rim ? 'F' : ((x + z) % 3 === 0 ? 'L' : 'P')
    if (rim) return y === 1 || y === 5 || x % 4 === 0 ? 'F' : 'P'
    // Target wheel in the rear shielded pit, then a narrowing collecting horn.
    if (z >= 3 && z <= 5) {
      var r = dx * dx + (y - 3) * (y - 3)
      if (r >= 2 && r <= 5) return 'P'
      if (r < 2) return 'F'
    }
    if (z >= 7 && z <= 10) {
      var radius = z <= 8 ? 2 : 1
      if (Math.max(dx, abs(y - 3)) === radius) return 'C'
    }
    if (y === 1 && (x === 1 || x === 7)) return 'P'
    return '#'
  }
  function decelerator(x, y, z) {
    var dx = abs(x - 6)
    var dz = abs(z - 6)
    var r = Math.max(dx, dz)
    if (r < 3 || r > 6 || dx + dz > 9) return ' '
    if (y === 0) return r === 5 ? 'X' : 'F'
    if (y === 4) return r === 4 || r === 5 ? 'V' : 'F'
    if (r === 5 && y === 2) return '#'
    if (r === 4 && z >= 4 && z <= 8 && x === 2) return 'K'
    if (r === 6 && y === 2) return 'V'
    if (r === 5 && (y === 1 || y === 3)) return (x + z) % 3 === 0 ? 'K' : 'C'
    return (dx === dz || (x + z) % 4 === 0) ? 'C' : 'F'
  }
  A.spec = function (m) {
    var parts = [Pat.part('input_bus', { min: 1, max: 1 }),
      Pat.part('input_hatch', { min: m.io[2] ? 1 : 0, max: 1 }),
      Pat.part('output_hatch', { min: 1, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
    if (m.io[1]) parts.push(Pat.part('output_bus', { min: 1, max: 1 }))
    return G.uivShapes.spec(Pat, { w: m.w, h: m.h, d: m.d, pal: m.pal, parts: parts,
      fn: m.name === 'jet_beam_line' ? jet : m.name === 'spallation_target_station' ? target : decelerator })
  }
  StartupEvents.registry('item', function (event) {
    event.create('grindless:spent_li6_shield').maxStackSize(16).texture('grindless:item/spent_li6_shield')
      .tooltip(Text.translate('tooltip.grindless.spent_li6_shield.0'))
  })
  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    ;[['hot_antiproton_beam', 0xFF80C8], ['stochastically_cooled_beam', 0x809CFF]].forEach(function (s) {
      event.create('grindless:' + s[0]).gas().color(s[1]).formula('p(-)')
        .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    A.machines.forEach(function (m) {
      event.create(m.type).category('multiblock').setEUIO('in')
        .setMaxIOSize(m.io[0], m.io[1], m.io[2], m.io[3])
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT).setSound(GTSoundEntries.MOTOR)
    })
  })
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    A.machines.forEach(function (m) {
      var spec = A.spec(m)
      Pat.register('gtceu:' + m.name, spec)
      event.create(m.name, 'multiblock').rotationState(RotationState.NON_Y_AXIS).recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, spec) })
        ['tooltips(net.minecraft.network.chat.Component[])']([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('gtceu.multiblock.parallelizable.tooltip'),
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit'))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
