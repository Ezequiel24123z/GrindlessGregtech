// priority: -10752
// -----------------------------------------------------------------------------------------------
// UXV's Cassiopeia A machine and the emitter's gamma source (docs/eras/uxv.md, machines 21 and 8, process line 25; package UXV-B5): the ejecta
// knot sweeper and the annihilation laser works, and their recipe types. The recipes come from data/grindless/tables/cas_a.json
// (server_scripts/grindless/uxv/cas_a.js). Three new items: grindless:moderated_ps_cell (the laser works' own intermediate),
// grindless:spent_ti44_core (the worn core, on its way to the hot cell) and grindless:ejecta_ti_fraction_dust (the cascade's titanium cut);
// every other id is F1's (uxv/foundation.js).
//
//   gtceu:ejecta_knot_sweeper       13 x 7 x 15 scoop ship, UXV. Recipe type gtceu:ejecta_sweeping (circuit 1 sweep); locked to Cassiopeia A.
//   gtceu:annihilation_laser_works  15 x 13 x 27 positron stack and gamma cavity, UXV. Recipe type gtceu:annihilation_lasing (circuit 1 moderate, 2 lase); Earth.
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
  const SIC = 'grindless:sic_composite_casing'
  const SIC_TEXTURE = 'grindless:block/uev/sic_composite_casing'
  const CRYO = 'grindless:cryostat_casing'
  const COIL = 'gtceu:superconducting_coil'
  const GLASS = 'gtceu:fusion_glass'
  const PIPE = 'gtceu:tungstensteel_pipe_casing'
  const FILTER = 'gtceu:filter_casing'
  const SHIELD = 'gtceu:robust_machine_casing'
  const MAGNET = 'grindless:superhydride_magnet_casing'

  CA.table = 'kubejs/data/grindless/tables/cas_a.json'
  CA.site = 'grindless:cas_a_remnant'

  // items in include the programmed circuit
  // BOOTSTRAP MACHINES (D4-SHAPE-UXV-A): both machines make products that feed the gum-metal and mu-metal casing chains (the sweeper's Ti-44 and
  // the laser works' gamma source feed the UXV emitter and sensor line), so their bodies are the UEV family (SiC composite, superhydride
  // magnet), never the UXV casings whose recipes need those products.
  CA.machines = [
    {
      name: 'ejecta_knot_sweeper', machine: 'gtceu:ejecta_knot_sweeper', type: 'ejecta_sweeping', dataKey: 'grindless_ejecta_sweeping', lang: 'Ejecta Knot Sweeper',
      maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, width: 13, height: 7, depth: 15, casing: SIC, texture: SIC_TEXTURE,
      pal: { F: SIC, W: WHIPPLE, N: MAGNET, C: COIL, P: PIPE, M: FILTER, L: GLASS, Q: 'tungsten_steel' },
      parts: function () {
        return [Pat.part('input_bus', { min: 1, max: 1 }), Pat.part('output_bus', { min: 1, max: 1 }), Pat.part('energy_input', { min: 1, max: 2 }), G.parallelHatch.part()]
      }
    },
    {
      name: 'annihilation_laser_works', machine: 'gtceu:annihilation_laser_works', type: 'annihilation_lasing', dataKey: 'grindless_annihilation_lasing', lang: 'Annihilation Laser Works',
      maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }, width: 15, height: 13, depth: 27, casing: SIC, texture: SIC_TEXTURE,
      pal: { F: SIC, N: MAGNET, W: SHIELD, K: CRYO, A: 'gtceu:stable_machine_casing', C: COIL, L: GLASS, P: PIPE, Q: 'tungsten_steel' },
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
    if (z === 2) return abs(dx) <= 4 ? 'C' : 'N'
    if (z === 3 || z === 6) return 'N'
    if (abs(dx) + 2 * abs(dy) === 9) return z % 3 === 0 ? 'Q' : 'N'
    if (abs(dx) >= 5 && abs(dy) <= 1 && z % 2 === 0) return 'L'
    return (x + z) % 5 === 0 ? 'W' : 'F'
  }

  // A tungsten-shielded line (15 x 13 x 27), the source end at the front: the positron source vault under the booth, the Penning trap (one
  // superconducting coil ring) and the positron stack (superhydride magnet rings) on a 9-wide tunnel, the solid-neon Ps moderator (cryostat
  // rings), shield ribs of robust tungstensteel casing along it, and at the nose the wider gamma cavity with its glass beam line and two
  // mirror rings, on a bed of stable casing.
  function laserWorks() {
    var s = G.uevShapes.scene(15, 13, 27)
    s.box(2, 0, 0, 12, 0, 26, 'A').box(2, 0, 0, 4, 0, 26, 'F').box(10, 0, 0, 12, 0, 26, 'F')
    s.cyl('z', 7, 6, 4, 0, 26, 'F', true)
    s.cyl('z', 7, 6, 6, 1, 9, 'F', true)
    s.cyl('z', 7, 6, 6, 1, 1, 'N', true).cyl('z', 7, 6, 6, 9, 9, 'N', true)
    s.cyl('z', 7, 6, 6, 5, 5, 'Q', true)
    s.box(7, 6, 1, 7, 6, 9, 'L')
    ;[11, 12, 13].forEach(function (z) { s.cyl('z', 7, 6, 4, z, z, 'N', true) })
    ;[15, 16].forEach(function (z) { s.cyl('z', 7, 6, 4, z, z, 'K', true) })
    s.cyl('z', 7, 6, 4, 21, 21, 'C', true)
    ;[11, 14, 17, 20, 23].forEach(function (z) { s.cyl('z', 7, 6, 5, z, z, 'W', true, null) })
    s.box(7, 6, 10, 7, 6, 24, 'P')
    ;[2, 12].forEach(function (x) { s.box(x, 1, 3, x, 1, 24, 'Q') })
    s.box(1, 6, 22, 2, 6, 22, 'Q').box(12, 6, 22, 13, 6, 22, 'Q')
    return s.booth('F', 3).fn()
  }

  // built in the machine registry callback: uev/shapes.js may load after this file
  function spec(m) {
    return G.uevShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: m.name === 'ejecta_knot_sweeper' ? sweepCell : laserWorks() })
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
          Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type)),
          Text.translate('gtceu.multiblock.parallelizable.tooltip'),
          m.name === 'ejecta_knot_sweeper' ? Text.translate('grindless.tooltip.site', Text.translate('dimension.grindless.cas_a_remnant')) : null
        ].filter(Boolean))
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
