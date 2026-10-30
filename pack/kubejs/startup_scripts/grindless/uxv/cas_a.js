// priority: -10970
// -----------------------------------------------------------------------------------------------
// UXV's Cassiopeia A machine and the emitter's gamma source (docs/eras/uxv.md, machines 21 and 8, process line 25; package UXV-B5): the ejecta
// knot sweeper and the annihilation laser works, and their recipe types. The recipes come from data/grindless/tables/cas_a.json
// (server_scripts/grindless/uxv/cas_a.js). Three new items: grindless:moderated_ps_cell (the laser works' own intermediate),
// grindless:spent_ti44_core (the worn core, on its way to the hot cell) and grindless:ejecta_ti_fraction_dust (the cascade's titanium cut);
// every other id is F1's (uxv/foundation.js).
//
//   gtceu:ejecta_knot_sweeper       13 x 7 x 15 scoop ship, UXV. Recipe type gtceu:ejecta_sweeping (circuit 1 sweep); locked to Cassiopeia A.
//   gtceu:annihilation_laser_works  9 x 9 x 15 vault and cavity, UXV. Recipe type gtceu:annihilation_lasing (circuit 1 moderate, 2 lase); Earth.
//
// Geometry (lib/patterns.js: a slice has at most 16 rows): the controller sits in the front slice (z = depth - 1), the floor of it takes the
// parts. The sweeper's front plate is its stern (winding bus, energy and dust bus); the laser works' front plate is the source end (core bus,
// coolant) and its nose, at the back, takes the module bus.
// Textures: tools/assets/Build-UXVCasATextures.ps1. Names: client_scripts/grindless/uxv_cas_a_lang.js.
// Published for the recipe script: global.grindless.casA.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const CA = G.casA || (G.casA = {})
  const LOG = '[grindless/uxv] '

  const WHIPPLE = 'grindless:whipple_shield_casing'
  const WHIPPLE_TEXTURE = 'grindless:block/luv/whipple_shield_casing'
  const ROBUST = 'gtceu:robust_machine_casing'
  const ROBUST_TEXTURE = 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel'
  const CRYO = 'grindless:cryostat_casing'
  const COIL = 'gtceu:superconducting_coil'
  const GLASS = 'gtceu:fusion_glass'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const FILTER = 'gtceu:filter_casing'

  CA.table = 'kubejs/data/grindless/tables/cas_a.json'
  CA.site = 'grindless:cas_a_remnant'

  // items in include the programmed circuit
  CA.machines = [
    {
      name: 'ejecta_knot_sweeper', machine: 'gtceu:ejecta_knot_sweeper', type: 'ejecta_sweeping', dataKey: 'grindless_ejecta_sweeping', lang: 'Ejecta Knot Sweeper',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, width: 13, height: 7, depth: 15, casing: WHIPPLE, texture: WHIPPLE_TEXTURE,
      pal: { F: WHIPPLE, C: COIL, P: PIPE, M: FILTER, L: GLASS, Q: 'tungsten_steel' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 1 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    },
    {
      name: 'annihilation_laser_works', machine: 'gtceu:annihilation_laser_works', type: 'annihilation_lasing', dataKey: 'grindless_annihilation_lasing', lang: 'Annihilation Laser Works',
      maxIO: { itemsIn: 4, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }, width: 9, height: 9, depth: 15, casing: ROBUST, texture: ROBUST_TEXTURE,
      pal: { F: ROBUST, C: COIL, K: CRYO, L: GLASS, Q: 'tungsten_steel' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('input_hatch', { min: 1, max: 1 }), Pat.part('output_hatch', { min: 1, max: 1 }),
          Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    }
  ]

  function abs(n) { return n < 0 ? -n : n }
  function max(a, b) { return a > b ? a : b }
  // a rounded cross-section of half-width 6 and half-height 3
  function inside(dx, dy) { return abs(dx) <= 6 && abs(dy) <= 3 && abs(dx) + 2 * abs(dy) <= 9 }
  function edge(dx, dy) { return inside(dx, dy) && !(inside(dx + 1, dy) && inside(dx - 1, dy) && inside(dx, dy + 1) && inside(dx, dy - 1)) }
  // an octagon: inside the square of half-width r and the diamond of radius r + r/2
  function oct(dx, dy, r) { return r >= 0 && abs(dx) <= r && abs(dy) <= r && abs(dx) + abs(dy) <= r + Math.floor(r / 2) }

  // x left to right, y bottom to top, z back (0, the bow) to front (14, the stern). A grille in the bow, coil mouth rings at z 2, 3 and 6, a
  // pipe funnel over z 7-10 narrowing into a filter-casing collector (z 11-13), hull ribs on the four ridges and glazed flanks.
  function sweepCell(x, y, z) {
    var dx = x - 6
    var dy = y - 3
    if (!inside(dx, dy)) return ' '
    var ed = edge(dx, dy)
    if (z === 14) {
      if (y === 0) return 'X'
      if (y === 1 && abs(dx) >= 2 && abs(dx) <= 4) return 'X'
      if (ed) return 'F'
      return y >= 3 && abs(dx) <= 2 ? 'L' : 'F'
    }
    if (z === 0) return !ed && abs(dx) <= 2 && abs(dy) <= 1 ? 'M' : 'F'
    if (z >= 7 && z <= 10) {
      var k = z - 7
      var hw = 4 - k
      var hh = k < 2 ? 2 : 1
      if (abs(dx) <= hw && abs(dy) <= hh) return abs(dx) === hw || abs(dy) === hh ? 'P' : '#'
    }
    if (z >= 11 && z <= 13 && abs(dx) <= 3 && abs(dy) <= 1) return abs(dx) === 3 || abs(dy) === 1 ? 'M' : '#'
    if (!ed) return z >= 7 && z <= 13 ? ' ' : '#'
    if (z === 2 || z === 3 || z === 6) return 'C'
    if (abs(dx) + 2 * abs(dy) === 9) return 'Q'
    return abs(dx) >= 5 && abs(dy) <= 1 && z % 2 === 0 ? 'L' : 'F'
  }

  // x, y 9 x 9, z back (0, the nose) to front (14, the source end). A cone nose (z 0-2) on a vault (z 3-14): the Penning trap is two coil
  // rings at z 11 and 12, the solid-neon moderator stage two cryostat rings at z 7 and 8, the cavity a glass line down the axis to the nose,
  // cradles under it; frame girders on the four diagonals of the vault, glazed flanks.
  function laserCell(x, y, z) {
    var dx = x - 4
    var dy = y - 4
    var r = z <= 1 ? 2 : z === 2 ? 3 : 4
    if (!oct(dx, dy, r)) return ' '
    var inner = oct(dx, dy, r - 1)
    if (z === 14) {
      if (y === 0) return 'X'
      if (y === 1) return abs(dx) >= 2 ? 'X' : 'F'
      return dx === 0 && dy === 0 ? 'L' : 'F'
    }
    if (z === 0) {
      if (dx === 0 && dy === 0) return 'L'
      if (dy === -2 && abs(dx) <= 1) return 'X'
      return abs(dx) <= 1 && abs(dy) <= 1 ? 'Q' : 'F'
    }
    if (!inner) {
      if (z >= 3 && abs(dx) + abs(dy) === 6) return 'Q'
      return abs(dx) === 4 && abs(dy) <= 1 && z % 2 === 1 && z >= 3 && z <= 12 ? 'L' : 'F'
    }
    if (dx === 0 && dy === 0 && z <= 9) return 'L'
    if ((z === 11 || z === 12) && max(abs(dx), abs(dy)) === 2) return 'C'
    if ((z === 7 || z === 8) && max(abs(dx), abs(dy)) === 1) return 'K'
    if (dy === -3 && abs(dx) <= 1 && z >= 3 && z <= 9 && z % 3 === 0) return 'Q'
    return '#'
  }

  var CELLS = { ejecta_knot_sweeper: sweepCell, annihilation_laser_works: laserCell }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
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
    ;['moderated_ps_cell', 'spent_ti44_core', 'ejecta_ti_fraction_dust'].forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(name === 'ejecta_ti_fraction_dust' ? 64 : 16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    CA.machines.forEach(function (m) {
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
        .setSound(GTSoundEntries.MOTOR)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    CA.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      event.create(m.name, 'multiblock')
        .recipeModifier(G.parallelHatch.modifier(G.parallelHatch.overclock))
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
        ["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
          Text.translate('grindless.machine.' + m.name + '.tooltip.2')
        ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
