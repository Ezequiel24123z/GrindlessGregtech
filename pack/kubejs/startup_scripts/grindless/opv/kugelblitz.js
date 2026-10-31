// priority: -6791
// -----------------------------------------------------------------------------------------------
// OpV's Kugelblitz forge and Hawking collector (docs/eras/opv.md, machines 10 and 11, process line 37; package OpV-D3): two multiblocks at
// Cygnus X-1 orbit, their recipe types and the three intermediates that only they use. The recipes come from
// data/grindless/tables/kugelblitz.json (server_scripts/grindless/opv/kugelblitz.js). Every cross-package id (kugelblitz_core,
// hawking_drive, the gamma optics, dense positron cells, absorber tiles) is F1's (opv/foundation.js) or older.
//
//   gtceu:kugelblitz_forge     15 x 15 x 15 sphere, OpV. Recipe type gtceu:kugelblitz_forming: gamma pulses pumped by positron annihilation are
//                              focused by Laue lenses and mirrors in an FRC cartridge into a Kugelblitz (Crane & Westmoreland 2009: named
//                              fiction). The hole never spins (Schwarzschild); it is charged with positrons and held electrostatically in the
//                              absorber shell. Locked to the Cygnus X-1 orbit.
//   gtceu:hawking_collector    11 x 11 x 11 sphere, OpV, a GENERATOR (Gen.configure) on OpV dynamo hatches (two 1 A or one 4 A), one run at a
//                              time. Recipe type gtceu:hawking_power: a Kugelblitz core is fed and its Hawking radiation collected (Hawking 1974,
//                              Page 1976; the feed rate is named fiction). Locked to the orbit.
//   grindless:gamma_pump_charge, kugelblitz_seed, evaporated_core_shell   the forge's intermediates and the collector's spent core.
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): a sphere clipped by the front and back plates, so the controller sits in the middle
// of the front disc, with the hatches in a ring round it. Orbit has no up.
// Textures: tools/assets/Build-OpVKugelblitzTextures.ps1. Names: client_scripts/grindless/opv_kugelblitz_lang.js.
// Published for the recipe script: global.grindless.kugelblitz.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const KB = G.kugelblitz || (G.kugelblitz = {})
  const LOG = '[grindless/opv] '

  const FIELD_FROZEN = 'grindless:field_frozen_casing'
  const SHIELD = 'grindless:annihilation_shield_casing'
  const FIELD_TEXTURE = 'grindless:block/opv/field_frozen_casing'
  const SHIELD_TEXTURE = 'grindless:block/opv/annihilation_shield_casing'

  KB.table = 'kubejs/data/grindless/tables/kugelblitz.json'
  KB.site = 'grindless:cygnus_x1_orbit'
  KB.items = { gamma_pump_charge: { stack: 16 }, kugelblitz_seed: { stack: 16 }, evaporated_core_shell: { stack: 16 } }

  // items in include the programmed circuit
  KB.machines = [
    {
      name: 'kugelblitz_forge', machine: 'gtceu:kugelblitz_forge', type: 'kugelblitz_forming', dataKey: 'grindless_kugelblitz_forming',
      lang: 'Kugelblitz Forge', maxIO: { itemsIn: 6, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, casing: FIELD_FROZEN, texture: FIELD_TEXTURE,
      generator: false, size: 15,
      pal: { F: FIELD_FROZEN, A: SHIELD, G: 'gtceu:fusion_glass', C: 'gtceu:fusion_coil', M: 'gtceu:opv_machine_casing' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }),
          G.parallelHatch.part()
        ]
      }
    },
    {
      // written final: two OpV 1 A dynamo hatches (2^29 each) hold c1's 2^30 EU/t; one 4 A hatch holds it alone
      name: 'hawking_collector', machine: 'gtceu:hawking_collector', type: 'hawking_power', dataKey: 'grindless_hawking_power',
      lang: 'Hawking Collector', maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: SHIELD, texture: SHIELD_TEXTURE,
      generator: true, size: 11,
      pal: { F: SHIELD, K: FIELD_FROZEN, V: 'gtceu:heat_vent', L: 'gtceu:fusion_glass', C: 'gtceu:superconducting_coil' },
      parts: function () {
        return [
          Pat.part('input_bus', { min: 1, max: 1 }),
          Pat.part('input_hatch', { min: 1, max: 1 }),
          Pat.part('output_bus', { min: 1, max: 1 }),
          Pat.part('energy_output', { min: 1, max: 2 })
        ]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }

  // the forge: centre (7, 7, 7), outer radius 7.5. Cavity r <= 5.5 (air, eight glass Laue arms along the cube diagonals), inner shell r <= 6.5
  // (coil rings at every third latitude, shield and field-frozen casing), outer shell (field-frozen casing, shield speckle, a machine-casing
  // belt at the equator, glass windows where the arms end). The front and back plates are discs of radius 2.7.
  function forgeCell(x, y, z) {
    var dx = x - 7
    var dy = y - 7
    var dz = z - 7
    var d2 = dx * dx + dy * dy + dz * dz
    if (d2 > 56.25) return ' '
    var r2 = dx * dx + dy * dy
    if (z === 14) {
      if (r2 === 0) return 'S'
      return r2 >= 4 ? 'X' : 'A'
    }
    if (z === 0) return r2 >= 4 ? 'A' : 'F'
    var diag = abs(dx) === abs(dy) && abs(dy) === abs(dz)
    if (d2 <= 30.25) return diag && abs(dx) >= 2 ? 'G' : '#'
    if (d2 <= 42.25) return dy % 3 === 0 ? 'C' : ((x + y * 2 + z) % 3 === 0 ? 'F' : 'A')
    if (diag) return 'G'
    if (dy === 0 && (x + z) % 2 === 0) return 'M'
    return (x + y + z) % 3 === 0 ? 'A' : 'F'
  }

  // the collector: centre (5, 5, 5), outer radius 5.5. Core cage (a hollow 3-cube of field-frozen casing on six struts) at the centre, a ring
  // of coils round the equator of the absorber layer, a TPV wall of shield casing with heat vents and six glass ports on the axes.
  function collectorCell(x, y, z) {
    var dx = x - 5
    var dy = y - 5
    var dz = z - 5
    var d2 = dx * dx + dy * dy + dz * dz
    if (d2 > 30.25) return ' '
    var r2 = dx * dx + dy * dy
    if (z === 10) {
      if (r2 === 0) return 'S'
      return r2 >= 4 ? 'X' : 'F'
    }
    if (d2 <= 12.25) {
      if (abs(dx) <= 1 && abs(dy) <= 1 && abs(dz) <= 1) return d2 === 0 ? '#' : 'K'
      var zeros = (dx === 0 ? 1 : 0) + (dy === 0 ? 1 : 0) + (dz === 0 ? 1 : 0)
      return zeros === 2 ? 'K' : '#'
    }
    if (d2 <= 20.25) return dy === 0 ? 'C' : (abs(dy) === 2 ? 'F' : 'K')
    var axis = (dx === 0 ? 1 : 0) + (dy === 0 ? 1 : 0) + (dz === 0 ? 1 : 0) === 2
    if (axis) return 'L'
    return (x + y + z) % 4 === 0 ? 'V' : 'F'
  }

  function slices(n, fn) {
    var out = []
    for (var z = 0; z < n; z++) {
      var rows = []
      for (var y = 0; y < n; y++) {
        var row = ''
        for (var x = 0; x < n; x++) {
          var ch = fn(x, y, z)
          row += ch === undefined || ch === null || ch === '' ? ' ' : ch
        }
        rows.push(row)
      }
      out.push(rows)
    }
    return out
  }

  // built in the machine registry callback
  function spec(m) {
    var casing = Pat.block(m.pal.F)
    var symbols = { S: Pat.controller(), X: Pat.oneOf.apply(null, [casing].concat(m.parts())), '#': Pat.air() }
    Object.keys(m.pal).forEach(function (ch) { symbols[ch] = Pat.block(m.pal[ch]) })
    return { slices: slices(m.size, m.name === 'kugelblitz_forge' ? forgeCell : collectorCell), symbols: symbols }
  }

  // one EMI line per recipe, read from its data
  function infoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        return String(Text.translate('gtceu.recipe.' + dataKey + '.' + name).getString())
      } catch (e) {
        return ''
      }
    }
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(KB.items).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(KB.items[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    KB.machines.forEach(function (m) {
      event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    KB.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      if (m.generator) builder = G.generators.configure(builder, { maxParallels: 1, name: m.name })
      else builder = builder.recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
      builder
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cygnus_x1_orbit'))
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
