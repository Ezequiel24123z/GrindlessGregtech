// priority: -5634
// -----------------------------------------------------------------------------------------------
// MAX+ machine 18, the polarized fusion stellarator (docs/eras/maxplus.md "Polarized fusion stellarator (machine 18, B13-PWRD)"; package B13-STEL): the
// multiblock and its recipe type. Every item it uses is foundation.js's. The recipes, with line P26, are in server_scripts/grindless/maxplus/stellarator.js.
//
//   gtceu:polarized_fusion_stellarator  37 x 13 x 37 (D5-SHAPE-MAXP-B1), a GENERATOR (lib/generators.js) running up to 64 copies of its row at once, limited by its dynamo hatches
//                                       (up to 8: eight 64 A wireless dynamo hatches carry 2^40 EU/t) and by its fuel. A hall of bound lattice casing and Kerr coil
//                                       casing round a ring of atomic casing (the vessel) threaded by 36 frames of superconducting coils.
//                                       c1 burns 4 polarized HD pellets and 1,000 mB of polarized helium-3 into helium-4 ash and hydrogen at 2^34 EU/t out per run
//
// Rows run at the machine's own site: none (rule 10, the fuel ships). Names: client_scripts/grindless/maxplus_stellarator_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.maxPlusStellarator || (G.maxPlusStellarator = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:bound_lattice_casing'
  const MAX_COILS = 136

  MS.machine = {
    name: 'polarized_fusion_stellarator', machine: 'gtceu:polarized_fusion_stellarator', type: 'polarized_fusion', dataKey: 'grindless_polarized_fusion',
    lang: 'Polarized Fusion Stellarator', maxIO: { itemsIn: 5, itemsOut: 0, fluidsIn: 1, fluidsOut: 2 }, casing: CASING,
    texture: 'grindless:block/maxplus/bound_lattice_casing', overlay: 'grindless:block/multiblock/primordial_fusion_torus',
    width: 37, height: 13, depth: 37, maxParallels: 64, maxCoils: MAX_COILS,
    pal: {
      F: CASING, K: 'grindless:kerr_coil_casing', E: 'grindless:fe56_shield_casing', Y: 'grindless:primordial_cryostat_casing',
      L: 'gtceu:laminated_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil'
    },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('input_hatch', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }),
        Pat.part('energy_output', { min: 1, max: 8 })]
    }
  }

  var TWO_PI = 6.283185307179586
  var STRANDS = 5
  var TWIST = 2

  // x left to right, y bottom to top, z back to front. A bound lattice plinth carries a torus of major radius 10.5 about the hall axis: the plasma
  // (air) in an atomic casing vessel, a Fe-56 blanket round it, five Kerr coil strands wound twice round the ring (the twist that makes it a stellarator),
  // and eight cryostat pods outside, between lattice pylons. A superconducting solenoid stands in the hole of the ring; a lattice wall rings the plinth
  // and a front booth holds the controller and the hatches.
  function stellaratorCell(x, y, z) {
    var m = MS.machine
    var cx = (m.width - 1) / 2
    var cz = (m.depth - 1) / 2
    var dx = x - cx
    var dz = z - cz
    var r = Math.sqrt(dx * dx + dz * dz)
    if (y === 0) return r <= 18.4 ? 'F' : ' '
    var du = r - 10.5
    var dv = y - 6
    var u = Math.sqrt(du * du + dv * dv)
    var phi = Math.atan2(dz, dx)
    if (phi < 0) phi += TWO_PI
    if (r <= 1.6 && y >= 2 && y <= 10) return 'C'
    if (r <= 2.4 && y >= 1 && y <= 11) return 'F'
    if (u < 2) return '#'
    if (u < 2.6) return 'A'
    if (u < 3.3) return 'E'
    if (u >= 4.4 && u < 5.7) {
      var a = Math.atan2(dv, du) - TWIST * phi
      var step = TWO_PI / STRANDS
      var k = Math.round(a / step)
      if (Math.abs(a - k * step) * u <= 1.2) return 'K'
    }
    if (u >= 6.1 && u < 6.9) {
      var pod = TWO_PI / 8
      var pk = Math.round(phi / pod)
      if (Math.abs(phi - pk * pod) * r <= 1.3) return 'Y'
    }
    if (r >= 17.4 && y <= 1) return 'F'
    return ' '
  }

  // the drawn shape in one piece, for the registry and the static tools
  MS.shapes = function () {
    return { polarized_fusion_stellarator: { w: MS.machine.width, h: MS.machine.height, d: MS.machine.depth, pal: MS.machine.pal, fn: shapeFn() } }
  }

  // the cells painted into a scene so the front booth (controller wall and floor hatch cells) goes over them
  function shapeFn() {
    var m = MS.machine
    var s = G.uevShapes.scene(m.width, m.height, m.depth)
    for (var z = 0; z < m.depth; z++) for (var y = 0; y < m.height; y++) for (var x = 0; x < m.width; x++) {
      var ch = stellaratorCell(x, y, z)
      if (ch !== ' ') s.set(x, y, z, ch)
    }
    s.booth('F', 3)
    return s.fn()
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: shapeFn() })
  }

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

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    var m = MS.machine
    event.create(m.type)
      .category('generator')
      .setEUIO('out')
      .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.TURBINE)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var m = MS.machine
    var type = GTRecipeTypes.get(m.type)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
    type.addDataInfo(infoOf(m.dataKey))
    m.spec = spec(m)
    Pat.register(m.machine, m.spec)

    // lib/generators.js: .generator(true), .regressWhenWaiting(false), the dynamo-limited modifier (up to 64 runs) and the controller lines
    G.generators.configure(event.create(m.name, 'multiblock'), { maxParallels: m.maxParallels, name: m.name })
      .langValue(m.lang)
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(m.type)
      .appearanceBlock(function () { return Block.getBlock(m.casing) })
      .pattern(function (def) { return Pat.build(def, m.spec) })
      ["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
      ])
      .workableCasingModel(m.texture, m.overlay)
  })
})()
