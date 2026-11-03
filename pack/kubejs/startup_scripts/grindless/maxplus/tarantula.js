// priority: -5649
// -----------------------------------------------------------------------------------------------
// MAX+ machines 4 to 6 at 30 Doradus (docs/eras/maxplus.md "Machines" 4-6; package XP-B1): three multiblocks and their recipe types. The casings and every
// item they use are XP-F1's (maxplus/foundation.js). The recipes, with lines P6, P7, P8, P17, P20 and P21's older-machine rows, are in
// server_scripts/grindless/maxplus/tarantula.js.
//
//   gtceu:tarantula_stellar_lift    31 x 21 x 31 (D5-SHAPE-MAXP-B1) of bound lattice, lift nozzle and Kerr coil casing. c1 lifts raw VMS plasma off an R136 star (wears a lift nozzle 1 in 32)
//   gtceu:pair_instability_crucible 21 x 21 x 21 rounded cube of bound lattice, crucible liner and Kerr coil casing. c1 burns confined VMS plasma into a nickel-56 slug and ime ash
//                                   (wears a crucible liner 1 in 16)
//   gtceu:nickel_56_burner          25 x 13 x 25 of bound lattice, Kerr coil and droplet radiator casing, a GENERATOR (lib/generators.js; S0-4): c1 2^34 EU/t out, c2 2^33 EU/t out, each on one MAX 16 A dynamo hatch
//                                   (V x A = 2^35). GTM's 64 A substation hatches do not fit the multiblock's energy slot, so no 64 A hatch is used.
//
// The lift and the crucible run at V[MAX] x 16 (2^35 EU/t) on the 1,024 A MAX+ energy hatch (INPUT_ENERGY). Rows run as written: no overclock, no
// parallels. All three run only at 30 Doradus (rows carry the dimension). Names: client_scripts/grindless/maxplus_tarantula_lang.js.
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const MT = G.maxPlusTarantula || (G.maxPlusTarantula = {})
  const LOG = '[grindless/maxplus] '

  const LATTICE = 'grindless:bound_lattice_casing'
  const LATTICE_TEXTURE = 'grindless:block/maxplus/bound_lattice_casing'
  const KERR = 'grindless:kerr_coil_casing'

  MT.lift = {
    name: 'tarantula_stellar_lift', machine: 'gtceu:tarantula_stellar_lift', type: 'tarantula_stellar_lift', dataKey: 'grindless_tarantula_stellar_lift',
    lang: 'Tarantula Stellar Lift', maxIO: { itemsIn: 2, itemsOut: 0, fluidsIn: 0, fluidsOut: 1 }, casing: LATTICE,
    texture: LATTICE_TEXTURE, overlay: 'grindless:block/multiblock/tarantula_stellar_lift',
    width: 31, height: 21, depth: 31, generator: false,
    pal: { F: LATTICE, N: 'grindless:lift_nozzle_casing', K: KERR, L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil', P: 'gtceu:tungstensteel_pipe_casing' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_hatch', { min: 1, max: 2 }), Pat.part('energy_input', { min: 1, max: 2 })]
    }
  }
  MT.crucible = {
    name: 'pair_instability_crucible', machine: 'gtceu:pair_instability_crucible', type: 'pair_instability_crucible', dataKey: 'grindless_pair_instability_crucible',
    lang: 'Pair-Instability Crucible', maxIO: { itemsIn: 2, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, casing: LATTICE,
    texture: LATTICE_TEXTURE, overlay: 'grindless:block/multiblock/pair_instability_crucible',
    width: 21, height: 21, depth: 21, generator: false,
    pal: { F: LATTICE, G: 'grindless:crucible_liner_casing', K: KERR, A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil', L: 'gtceu:cleanroom_glass' },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('input_hatch', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 2 })]
    }
  }
  MT.burner = {
    name: 'nickel_56_burner', machine: 'gtceu:nickel_56_burner', type: 'nickel_56_burner', dataKey: 'grindless_nickel_56_burner',
    lang: 'Nickel-56 Burner', maxIO: { itemsIn: 2, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }, casing: LATTICE,
    texture: LATTICE_TEXTURE, overlay: 'grindless:block/multiblock/nickel_56_burner',
    width: 25, height: 13, depth: 25, generator: true,
    pal: {
      F: LATTICE, K: KERR, R: 'grindless:droplet_radiator_casing', A: 'gtceu:atomic_casing', P: 'gtceu:tungstensteel_pipe_casing',
      L: 'gtceu:cleanroom_glass', C: 'gtceu:superconducting_coil'
    },
    parts: function () {
      return [Pat.part('input_bus', { min: 1, max: 2 }), Pat.part('output_bus', { min: 1, max: 2 }), Pat.part('energy_output', { min: 1, max: 2 })]
    }
  }
  MT.machines = [MT.lift, MT.crucible, MT.burner]

  var TWO_PI = 6.283185307179586

  // every cell of a shape function painted into a scene, then the front booth (controller wall, glass and the floor hatch cells) over them
  function paint(w, h, d, cell) {
    var s = G.uevShapes.scene(w, h, d)
    for (var z = 0; z < d; z++) for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var ch = cell(x, y, z)
      if (ch !== ' ') s.set(x, y, z, ch)
    }
    s.booth('F', 3)
    return s.fn()
  }

  // The lift: a plinth under a funnel of lift nozzle lining in a lattice shell, 3.5 cells wide at the throat and 14.7 at the mouth (y 20). Kerr coil
  // hoops gird it every third row, and three superconducting rings at the throat drive the plasma up.
  function liftCell(x, y, z) {
    var dx = x - 15
    var dz = z - 15
    var r = Math.sqrt(dx * dx + dz * dz)
    var spoke = Math.abs(dx) <= 0.5 || Math.abs(dz) <= 0.5
    if (y === 0) return r <= 15.4 && (r >= 10.5 || spoke) ? 'F' : ' '
    if (y === 1 && r >= 13.4 && r <= 15.4) return 'F'
    if (y === 1 && spoke && r >= 4.5 && r <= 13.4) return 'P'
    var rf = y <= 2 ? 3.5 : 3.5 + (y - 2) * 0.62
    var e = r - rf
    if (e < -2.0) return e > -6 || y > 2 ? '#' : ' '
    if (e < -0.6) return 'N'
    if (e < 0.6) return y % 5 === 3 && Math.round(Math.atan2(dz, dx) * 4) % 2 === 0 ? 'L' : 'F'
    if (e < 1.2 && (y === 4 || y === 7 || y === 10)) return 'C'
    if (e < 2.4 && y >= 4 && y % 2 === 0) return 'K'
    return ' '
  }

  // The crucible: a sphere of radius 9.2 about (10, 10, 10): a liner shell inside a lattice shell, Kerr coil bands outside (three latitudes and two
  // meridians), the burning core (atomic casing) in a plasma cavity and one superconducting ring round it. A cradle disc and a corridor link it to the booth.
  function crucibleCell(x, y, z) {
    var dx = x - 10
    var dy = y - 10
    var dz = z - 10
    var p = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (y <= 1 && dx * dx + dz * dz <= 36) return 'F'
    if (y === 0 && Math.abs(dx) <= 2 && z >= 10) return 'F'
    if (p < 2.2) return 'A'
    if (p < 3.4) return '#'
    if (y === 10 && dx * dx + dz * dz >= 20 && dx * dx + dz * dz <= 31 && p < 6) return 'C'
    if (p < 6) return '#'
    if (p < 7) return 'A'
    if (p < 8.4) return 'G'
    if (p < 9.5) return 'F'
    if (p < 10.6) {
      var band = Math.abs(dy) <= 1.2 || Math.abs(Math.abs(dy) - 5) <= 1.2 || Math.abs(dx) <= 1.2 || Math.abs(dz) <= 1.2
      return band ? 'K' : ' '
    }
    return ' '
  }

  // The burner: a cask vault of lattice with cask columns (x 0 to 10) beside an sCO2 turbine hall (x 12 to 24). A pipe run carries the hot gas across; the turbine tube
  // lies along the hall with coil rings, and droplet radiator ribs stand on its roof and flanks.
  function burnerCell(x, y, z) {
    if (y === 0) return z >= 1 ? (x >= 12 ? (x % 2 === 0 ? 'R' : 'F') : ((x + z) % 4 < 2 ? 'F' : 'K')) : ' '
    if (z === 0) return ' '
    if (x <= 10) {
      if (y > 9) return ' '
      var wall = x === 0 || x === 10 || z === 1 || z === 22 || y === 9
      if (wall) return y === 5 && x === 10 ? 'P' : ((x + y + z) % 3 === 0 ? 'K' : 'F')
      var cx = (x - 2) % 4
      var cz = (z - 3) % 4
      if (cx < 3 && cz < 3 && y >= 2 && y <= 7) return 'K'
      return '#'
    }
    if (x === 11) return y === 5 && z >= 10 && z <= 14 ? 'P' : ' '
    var ex = x === 12 || x === 24
    var ez = z === 1 || z === 23
    if (y === 9) return x % 2 === 0 ? 'R' : 'F'
    if (ex || ez) return ((ex ? z : x) % 4 === 2) && y >= 3 && y <= 6 ? 'L' : 'F'
    var ty = 5
    var tz = 12
    var tr = Math.sqrt((y - ty) * (y - ty) + (z - tz) * (z - tz))
    if (tr < 1.6) return '#'
    if (tr < 2.7) return x % 3 === 0 && tr < 2.2 ? 'C' : 'A'
    return '#'
  }
  function burnerFins(x, y, z) {
    if (y >= 10 && y <= 11 && x >= 12 && x <= 24 && x % 2 === 0 && z >= 2 && z <= 22) return 'R'
    if (y >= 1 && y <= 8 && (z === 0 || z === 24) && x >= 12 && x % 2 === 0) return 'R'
    return ' '
  }

  var CELLS = {
    tarantula_stellar_lift: liftCell,
    pair_instability_crucible: crucibleCell,
    nickel_56_burner: function (x, y, z) { var c = burnerFins(x, y, z); return c !== ' ' ? c : burnerCell(x, y, z) }
  }

  MT.shapes = function () {
    var o = {}
    MT.machines.forEach(function (m) { o[m.name] = { w: m.width, h: m.height, d: m.depth, pal: m.pal, fn: paint(m.width, m.height, m.depth, CELLS[m.name]) } })
    return o
  }

  // built in the machine registry callback: uiv/shapes.js may load after this file
  function spec(m) {
    return G.uivShapes.spec(Pat, { w: m.width, h: m.height, d: m.depth, pal: m.pal, parts: m.parts(), fn: paint(m.width, m.height, m.depth, CELLS[m.name]) })
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
