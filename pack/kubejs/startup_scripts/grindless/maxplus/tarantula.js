// priority: -5629
// -----------------------------------------------------------------------------------------------
// MAX+ machines 4 to 6 at 30 Doradus (docs/eras/maxplus.md "Machines" 4-6; package XP-B1): three multiblocks and their recipe types. The casings and every
// item they use are XP-F1's (maxplus/foundation.js). The recipes, with lines P6, P7, P8, P17, P20 and P21's older-machine rows, are in
// server_scripts/grindless/maxplus/tarantula.js.
//
//   gtceu:tarantula_stellar_lift    21 x 15 x 21 of lift nozzle casing. c1 lifts raw VMS plasma off an R136 star (wears a lift nozzle 1 in 32)
//   gtceu:pair_instability_crucible 15 x 15 x 15 rounded cube of crucible liner casing. c1 burns confined VMS plasma into a nickel-56 slug and ime ash
//                                   (wears a crucible liner 1 in 16)
//   gtceu:nickel_56_burner          15 x 9 x 15, a GENERATOR (lib/generators.js; S0-4): c1 2^34 EU/t out, c2 2^33 EU/t out, each on one MAX 16 A dynamo hatch
//                                   (V x A = 2^35). GTM's 64 A substation hatches do not fit the multiblock's energy slot, so no 64 A hatch is used.
//
// The lift and the crucible run at V[MAX] x 16 (2^35 EU/t) on the 1,024 A MAX+ energy hatch (INPUT_ENERGY). Rows run as written: no overclock, no
// parallels. All three run only at 30 Doradus (rows carry the dimension). Names: client_scripts/grindless/maxplus_tarantula_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MT = G.maxPlusTarantula || (G.maxPlusTarantula = {})
  const LOG = '[grindless/maxplus] '

  const LIFT_CASING = 'grindless:lift_nozzle_casing'
  const LINER_CASING = 'grindless:crucible_liner_casing'
  const BURNER_CASING = 'gtceu:atomic_casing'

  MT.lift = {
    name: 'tarantula_stellar_lift', machine: 'gtceu:tarantula_stellar_lift', type: 'tarantula_stellar_lift', dataKey: 'grindless_tarantula_stellar_lift',
    lang: 'Tarantula Stellar Lift', maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 1 }, casing: LIFT_CASING,
    texture: 'grindless:block/max/mirror_shell_segment', overlay: 'grindless:block/multiblock/positronium_condensate_lab',
    width: 21, height: 15, depth: 21, generator: false,
    pal: { F: LIFT_CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 })]
    }
  }
  MT.crucible = {
    name: 'pair_instability_crucible', machine: 'gtceu:pair_instability_crucible', type: 'pair_instability_crucible', dataKey: 'grindless_pair_instability_crucible',
    lang: 'Pair-Instability Crucible', maxIO: { itemsIn: 2, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: LINER_CASING,
    texture: 'grindless:block/max/mirror_shell_segment', overlay: 'grindless:block/multiblock/positronium_condensate_lab',
    width: 15, height: 15, depth: 15, generator: false,
    pal: { F: LINER_CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })]
    }
  }
  MT.burner = {
    name: 'nickel_56_burner', machine: 'gtceu:nickel_56_burner', type: 'nickel_56_burner', dataKey: 'grindless_nickel_56_burner',
    lang: 'Nickel-56 Burner', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, casing: BURNER_CASING,
    texture: 'gtceu:block/casings/solid/machine_casing_atomic', overlay: 'grindless:block/multiblock/fission_reactor',
    width: 15, height: 9, depth: 15, generator: true,
    pal: { F: BURNER_CASING, B: 'gtceu:robust_machine_casing', L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_output', { min: 1, max: 2 })]
    }
  }
  MT.machines = [MT.lift, MT.crucible, MT.burner]

  function abs(n) { return n < 0 ? -n : n }

  // x left to right, y bottom to top, z back to front; the floor carries the part cells at the front edge
  function floorCell(x, y, z, w) {
    var mid = (w - 1) / 2
    return y === 0 && z >= 0 && abs(x - mid) <= 3
  }

  // the lift: glass-banded walls round a ring of coils at mid height, an atomic post at the axis
  function liftCell(x, y, z) {
    var m = MT.lift
    if (y === 0) return z === m.depth - 1 && abs(x - 10) <= 3 ? 'X' : 'B'
    if (y === m.height - 1) return 'B'
    if (x === 0 || x === m.width - 1 || z === 0 || z === m.depth - 1) {
      var along = x === 0 || x === m.width - 1 ? z : x
      return y >= 4 && y <= 10 && along >= 3 && along <= 17 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 10
    var dz = z - 10
    var r2 = dx * dx + dz * dz
    if (y === 7 && r2 >= 49 && r2 <= 72) return 'C'
    if (dx === 0 && dz === 0 && y >= 2 && y <= 12) return 'A'
    return '#'
  }

  // the crucible: a cube of side 15 with its corners cut (|dx| + |dy| + |dz| <= 17), shell only
  function inCrucible(x, y, z) {
    var dx = abs(x - 7)
    var dy = abs(y - 7)
    var dz = abs(z - 7)
    return dx <= 7 && dy <= 7 && dz <= 7 && dx + dy + dz <= 17
  }
  function crucibleCell(x, y, z) {
    if (!inCrucible(x, y, z)) return ' '
    var shell = !inCrucible(x - 1, y, z) || !inCrucible(x + 1, y, z) || !inCrucible(x, y - 1, z) || !inCrucible(x, y + 1, z) ||
      !inCrucible(x, y, z - 1) || !inCrucible(x, y, z + 1)
    if (shell) {
      if (y === 0 && z === 14 && abs(x - 7) <= 3) return 'X'
      if (y === 0 || y % 4 === 0) return 'B'
      return y >= 3 && y <= 11 && (x + z) % 3 === 0 ? 'L' : 'F'
    }
    var dx = x - 7
    var dz = z - 7
    if (y === 7 && dx * dx + dz * dz >= 16 && dx * dx + dz * dz <= 25) return 'C'
    if (dx === 0 && dz === 0 && y >= 5 && y <= 9) return 'A'
    return '#'
  }

  // the burner: a low hall with a ring of coils round the decay core
  function burnerCell(x, y, z) {
    var m = MT.burner
    if (y === 0) return z === m.depth - 1 && abs(x - 7) <= 3 ? 'X' : 'B'
    if (y === m.height - 1) return 'B'
    if (x === 0 || x === m.width - 1 || z === 0 || z === m.depth - 1) {
      var along = x === 0 || x === m.width - 1 ? z : x
      return y >= 3 && y <= 5 && along >= 3 && along <= 11 && along % 4 !== 1 ? 'L' : 'F'
    }
    var dx = x - 7
    var dz = z - 7
    var r2 = dx * dx + dz * dz
    if (y === 4 && r2 >= 16 && r2 <= 25) return 'C'
    return '#'
  }

  var CELLS = { tarantula_stellar_lift: liftCell, pair_instability_crucible: crucibleCell, nickel_56_burner: burnerCell }

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
    MT.machines.forEach(function (m) {
      var t = event.create(m.type)
        .category(m.generator ? 'generator' : 'multiblock')
        .setEUIO(m.generator ? 'out' : 'in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      t.setSound(m.generator ? GTSoundEntries.TURBINE : GTSoundEntries.ARC)
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    MT.machines.forEach(function (m) {
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
