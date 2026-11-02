// priority: -5634
// -----------------------------------------------------------------------------------------------
// MAX+ machine 18, the polarized fusion stellarator (docs/eras/maxplus.md "Polarized fusion stellarator (machine 18, B13-PWRD)"; package B13-STEL): the
// multiblock and its recipe type. Every item it uses is foundation.js's. The recipes, with line P26, are in server_scripts/grindless/maxplus/stellarator.js.
//
//   gtceu:polarized_fusion_stellarator  31 x 11 x 31, a GENERATOR (lib/generators.js) running up to 64 copies of its row at once, limited by its dynamo hatches
//                                       (up to 8: eight 64 A wireless dynamo hatches carry 2^40 EU/t) and by its fuel. A hall of horizon machine casing with
//                                       laminated glass bands round a ring of atomic casing (the vessel) threaded by 20 frames of superconducting coils.
//                                       c1 burns 4 polarized HD pellets and 1,000 mB of polarized helium-3 into helium-4 ash and hydrogen at 2^34 EU/t out per run
//
// Rows run at the machine's own site: none (rule 10, the fuel ships). Names: client_scripts/grindless/maxplus_stellarator_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.maxPlusStellarator || (G.maxPlusStellarator = {})
  const LOG = '[grindless/maxplus] '

  const CASING = 'grindless:horizon_machine_casing'
  const MAX_COILS = 192

  MS.machine = {
    name: 'polarized_fusion_stellarator', machine: 'gtceu:polarized_fusion_stellarator', type: 'polarized_fusion', dataKey: 'grindless_polarized_fusion',
    lang: 'Polarized Fusion Stellarator', maxIO: { itemsIn: 5, itemsOut: 0, fluidsIn: 1, fluidsOut: 2 }, casing: CASING,
    texture: 'grindless:block/maxplus/horizon_machine_casing', overlay: 'grindless:block/multiblock/primordial_fusion_torus',
    width: 31, height: 11, depth: 31, maxParallels: 64, maxCoils: MAX_COILS,
    pal: { F: CASING, L: 'gtceu:laminated_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('input_hatch', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }),
        Pat.part('energy_output', { min: 1, max: 8 })]
    }
  }

  var TWO_PI = 6.283185307179586
  var FRAMES = 20
  var RING = 10

  // x left to right, y bottom to top, z back to front. The floor carries the 15 part cells at the front edge; the walls are casing with glass bands;
  // the vessel is a ring of atomic casing at mid height and 20 coil frames stand round it, one coil shell cell deep
  function stellaratorCell(x, y, z) {
    var m = MS.machine
    if (y === 0) return z === m.depth - 1 && Math.abs(x - 15) <= 7 ? 'X' : 'F'
    if (y === m.height - 1) return 'F'
    if (x === 0 || x === m.width - 1 || z === 0 || z === m.depth - 1) {
      var along = x === 0 || x === m.width - 1 ? z : x
      return y >= 3 && y <= 7 && along >= 3 && along <= 27 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 15
    var dz = z - 15
    var r = Math.sqrt(dx * dx + dz * dz)
    var u = r - RING
    var v = y - 5
    var d2 = u * u + v * v
    if (d2 <= 1.5) return 'A'
    if (d2 >= 3.4 && d2 <= 5.0) {
      var step = TWO_PI / FRAMES
      var a = Math.atan2(dz, dx)
      if (a < 0) a += TWO_PI
      var k = Math.round(a / step)
      if (Math.abs(a - k * step) * r <= 0.5) return 'C'
    }
    return '#'
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: stellaratorCell })
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
