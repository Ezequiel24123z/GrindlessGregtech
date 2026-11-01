// priority: -5640
// -----------------------------------------------------------------------------------------------
// MAX+ machines 7 and 8 at the Magellanic Stream (docs/eras/maxplus.md "Machines" 7-8; package XP-B2): two multiblocks and their recipe types. Every item
// they use is XP-F1's (maxplus/foundation.js). The recipes, with lines P9, P10, P11, P22 and P23's older-machine rows, are in
// server_scripts/grindless/maxplus/stream.js.
//
//   gtceu:pristine_gas_works        25 x 7 x 25, a scoop ring round a gas hall. c1 scoops 64,000 mB of pristine gas (wears a magnetic scoop module 1 in 64)
//   gtceu:primordial_fusion_torus   23 x 9 x 23, a GENERATOR (lib/generators.js; S0-4): c1 burns 1,000 mB deuterium and 1,000 mB helium-3 into helium-4 ash and
//                                   hydrogen at 2^34 EU/t out, on one MAX 16 A dynamo hatch (V x A = 2^35). GTM's 64 A substation hatches do not fit the
//                                   multiblock's energy slot, so no 64 A hatch is used. Wears a neutral beam injector (1 in 64) and a direct converter stack (1 in 128)
//
// The gas works runs at V[MAX] x 4 (2^33 EU/t) on the 1,024 A MAX+ energy hatch (INPUT_ENERGY). Rows run as written: no overclock, no parallels. Both machines
// run only at the Magellanic Stream (rows carry the dimension). Names: client_scripts/grindless/maxplus_stream_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MS = G.maxPlusStream || (G.maxPlusStream = {})
  const LOG = '[grindless/maxplus] '

  const WORKS_CASING = 'gtceu:atomic_casing'
  const TORUS_CASING = 'gtceu:atomic_casing'

  MS.works = {
    name: 'pristine_gas_works', machine: 'gtceu:pristine_gas_works', type: 'pristine_gas_works', dataKey: 'grindless_pristine_gas_works',
    lang: 'Pristine Gas Works', maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 1 }, casing: WORKS_CASING,
    texture: 'gtceu:block/casings/solid/machine_casing_atomic', overlay: 'grindless:block/multiblock/positronium_condensate_lab',
    width: 25, height: 7, depth: 25, generator: false,
    pal: { F: WORKS_CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 })]
    }
  }
  MS.torus = {
    name: 'primordial_fusion_torus', machine: 'gtceu:primordial_fusion_torus', type: 'primordial_fusion_torus', dataKey: 'grindless_primordial_fusion_torus',
    lang: 'Primordial Fusion Torus', maxIO: { itemsIn: 3, itemsOut: 0, fluidsIn: 2, fluidsOut: 2 }, casing: TORUS_CASING,
    texture: 'gtceu:block/casings/solid/machine_casing_atomic', overlay: 'grindless:block/multiblock/fission_reactor',
    width: 23, height: 9, depth: 23, generator: true,
    pal: { F: TORUS_CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('input_hatch', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }),
        Pat.part('energy_output', { min: 1, max: 2 })]
    }
  }
  MS.machines = [MS.works, MS.torus]

  function abs(n) { return n < 0 ? -n : n }

  // x left to right, y bottom to top, z back to front; the floor carries the part cells at the front edge
  // the gas works: a glass-banded hall with a scoop ring of coils at mid height round an open gas well
  function worksCell(x, y, z) {
    var m = MS.works
    if (y === 0) return z === m.depth - 1 && abs(x - 12) <= 3 ? 'X' : 'B'
    if (y === m.height - 1) return 'B'
    if (x === 0 || x === m.width - 1 || z === 0 || z === m.depth - 1) {
      var along = x === 0 || x === m.width - 1 ? z : x
      return y >= 2 && y <= 4 && along >= 3 && along <= 21 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 12
    var dz = z - 12
    var r2 = dx * dx + dz * dz
    if (y === 3 && r2 >= 64 && r2 <= 100) return 'C'
    return '#'
  }

  // the torus: a low hall with a doughnut of coils round the fusion ring
  function torusCell(x, y, z) {
    var m = MS.torus
    if (y === 0) return z === m.depth - 1 && abs(x - 11) <= 3 ? 'X' : 'B'
    if (y === m.height - 1) return 'B'
    if (x === 0 || x === m.width - 1 || z === 0 || z === m.depth - 1) {
      var along = x === 0 || x === m.width - 1 ? z : x
      return y >= 3 && y <= 5 && along >= 3 && along <= 19 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 11
    var dz = z - 11
    var r2 = dx * dx + dz * dz
    if (y === 4 && r2 >= 49 && r2 <= 81) return 'C'
    return '#'
  }

  var CELLS = { pristine_gas_works: worksCell, primordial_fusion_torus: torusCell }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: CELLS[m.name] })
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
    MS.machines.forEach(function (m) {
      var t = event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      t.setSound(m.generator ? GTSoundEntries.TURBINE : GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MS.machines.forEach(function (m) {
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      m.spec = spec(m)
      Pat.register(m.machine, m.spec)

      var builder = event.create(m.name, 'multiblock')
      if (m.generator) {
        // lib/generators.js: .generator(true), .regressWhenWaiting(false), the dynamo-limited modifier and the controller lines (one run at a time)
        builder = G.generators.configure(builder, { maxParallels: 1, name: m.name })
      } else {
        builder = builder.recipeModifier(function (machine, recipe) { return ModifierFunction.IDENTITY }, true)
      }
      builder
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
  })
})()
