// priority: -12600
// -----------------------------------------------------------------------------------------------
// LuV B9, Ganymede (docs/eras/luv.md, machines 19 and 20). Recipes: server_scripts/grindless/luv/ganymede.js.
//
//   gtceu:gravitational_wave_detector  type gtceu:gravitational_wave_astronomy (observatory step 6). A buried L, 33 x 5 x 33:
//     a 5x5x5 vertex station of frostproof casing (controller, hatches, two sapphire test masses in the walls where the arms
//     start); two 3x3 vacuum tubes of clean stainless steel casing, 25 long, hollow; a 3x3x3 frostproof end station on each arm
//     with the third and fourth test masses on the face toward the vertex. Ice (packed or blue: Ganymede's ground) lies
//     on every tube and end station: the arms are dug into the crust and stay covered (spike S0-7).
//   gtceu:coilgun_launcher  type gtceu:probe_launch. A horizontal barrel of 33 rings of eight grindless:coilgun_coil_casing
//     around an open bore, a 5x5x4 breech of robust tungstensteel casing (controller on the rear face, hatches, loading
//     chamber) and a 3x3x3 tungstensteel pulse bank beside it. 8 x 5 x 37.
// Both keep every output (G.noVoiding in the modifier and in beforeWorking) and run only on Ganymede (G.places, server side).
// No parallel hatch: one catalogue is one observing run, and one probe is one launch.
// Published as global.grindless.ganymede (machines, types, specs, blocks) for the server script and the tests.
(function () {
  var G = global.grindless
  var Pat = G.patterns
  var GY = G.ganymede = {}

  var FROST = 'gtceu:frostproof_machine_casing'
  var CLEAN = 'gtceu:clean_machine_casing'
  var ROBUST = 'gtceu:robust_machine_casing'
  var MASS = 'grindless:sapphire_test_mass'
  var COIL = 'grindless:coilgun_coil_casing'
  var PIPE = 'gtceu:tungstensteel_pipe_casing'
  var GLASS = 'gtceu:borosilicate_glass_block'
  // packed and blue ice only: plain ice melts under block light, and a torch would unform the L
  var ICE = ['minecraft:packed_ice', 'minecraft:blue_ice']

  GY.blocks = { frost: FROST, clean: CLEAN, robust: ROBUST, testMass: MASS, coil: COIL, ice: ICE }
  GY.machines = { detector: 'gtceu:gravitational_wave_detector', launcher: 'gtceu:coilgun_launcher' }
  GY.types = { detector: 'gravitational_wave_astronomy', launcher: 'probe_launch' }

  function hatches(casing, min, fluids) {
    var choices = [Pat.block(casing, { min: min }),
      Pat.part('energy_input', { min: 1, max: 2 }),
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 2 }),
      Pat.part('maintenance', { exact: 1 })]
    if (fluids) choices.push(Pat.part('input_hatch', { min: 1, max: 2 }))
    return Pat.oneOf.apply(null, choices)
  }

  // a grid[s][y] of strings, filled cell by cell; s back -> front, y bottom -> top, x left -> right
  function grid(slices, height, width) {
    var g = []
    for (var s = 0; s < slices; s++) {
      var rows = []
      for (var y = 0; y < height; y++) rows.push(new Array(width + 1).join(' ').split(''))
      g.push(rows)
    }
    return {
      set: function (x, y, s, ch) { g[s][y][x] = ch },
      slices: function () { return g.map(function (rows) { return rows.map(function (r) { return r.join('') }) }) }
    }
  }
  function inside(v, lo, hi) { return v >= lo && v <= hi }

  // ---------------------------------------------------------------- the buried L
  // vertex x 0-4, s 28-32, y 0-4; Z arm along s at x 1-3, y 1-3; X arm along x at s 29-31, y 1-3
  var L = grid(33, 5, 33)
  for (var s = 0; s < 33; s++) {
    for (var x = 0; x < 33; x++) {
      for (var y = 0; y < 5; y++) {
        var ch = ' '
        if (inside(x, 0, 4) && inside(s, 28, 32)) {
          var wall = x === 0 || x === 4 || y === 0 || y === 4 || s === 28 || s === 32
          ch = wall ? 'X' : '#'
        } else if (inside(x, 1, 3) && inside(s, 0, 27)) {
          // ring i along the arm (s 27 is the vertex side): every sixth ring is a pipe ring (vacuum pumps), the others are
          // stainless frame posts on the four corners with clean panels between them and a glass viewport every sixth ring
          var ringZ = 27 - s
          if (y === 4) ch = 'I'
          else if (y >= 1) {
            if (s <= 2) ch = 'F'
            else if (x === 2 && y === 2) ch = '#'
            else if (ringZ % 6 === 0) ch = 'P'
            else if (x !== 2 && y !== 2) ch = 'T'
            else ch = ringZ % 6 === 3 && y === 2 ? 'G' : 'C'
          }
        } else if (inside(s, 29, 31) && inside(x, 5, 32)) {
          var ringX = x - 5
          if (y === 4) ch = 'I'
          else if (y >= 1) {
            if (x >= 30) ch = 'F'
            else if (s === 30 && y === 2) ch = '#'
            else if (ringX % 6 === 0) ch = 'P'
            else if (s !== 30 && y !== 2) ch = 'T'
            else ch = ringX % 6 === 3 && y === 2 ? 'G' : 'C'
          }
        }
        L.set(x, y, s, ch)
      }
    }
  }
  L.set(2, 2, 32, 'S')
  L.set(2, 2, 28, 'M')
  L.set(4, 2, 30, 'M')
  L.set(2, 2, 2, 'M')
  L.set(30, 2, 30, 'M')
  var detector = {
    slices: L.slices(),
    symbols: { S: Pat.controller(), X: hatches(FROST, 60, true), F: Pat.block(FROST), C: Pat.block(CLEAN), M: Pat.block(MASS),
      I: Pat.block(ICE), P: Pat.block(PIPE), T: Pat.frame(['stainless_steel']), G: Pat.block(GLASS), '#': Pat.air() }
  }

  // ---------------------------------------------------------------- the coilgun
  // barrel x 1-3, y 1-3, s 0-32; breech x 0-4, y 0-4, s 33-36; pulse bank x 5-7, y 0-2, s 34-36
  var K = grid(37, 5, 8)
  for (var s2 = 0; s2 < 37; s2++) {
    for (var x2 = 0; x2 < 8; x2++) {
      for (var y2 = 0; y2 < 5; y2++) {
        var c = ' '
        var bore = x2 === 2 && y2 === 2
        if (s2 <= 32) {
          if (inside(x2, 1, 3) && inside(y2, 1, 3)) {
            // every third ring is a full accelerating coil; between them tungsten-steel frame posts with glass or robust panels
            var ringK = s2 % 3
            if (bore) c = '#'
            else if (ringK === 0) c = 'K'
            else if (x2 !== 2 && y2 !== 2) c = 'R'
            else c = ringK === 1 ? 'G' : 'T'
          }
        } else if (inside(x2, 0, 4)) {
          var shell = x2 === 0 || x2 === 4 || y2 === 0 || y2 === 4 || s2 === 33 || s2 === 36
          c = shell ? (bore && s2 === 33 ? '#' : 'X') : '#'
        } else if (inside(s2, 34, 36) && inside(y2, 0, 2)) {
          c = 'T'
        }
        K.set(x2, y2, s2, c)
      }
    }
  }
  K.set(2, 2, 36, 'S')
  var launcher = {
    slices: K.slices(),
    symbols: { S: Pat.controller(), X: hatches(ROBUST, 50, false), T: Pat.block(ROBUST), K: Pat.block(COIL),
      R: Pat.frame(['tungsten_steel']), G: Pat.block(GLASS), '#': Pat.air() }
  }

  GY.specs = { detector: detector, launcher: launcher }

  function keep(name) {
    // neither machine has fluid outputs: only item voiding would throw the catalogue, the survey or the chart away
    return { which: 'items', name: name, reason: 'grindless.machine.' + name + '.no_voiding' }
  }

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // circuit + data orb + the Sagittarius A* signal (kept); liquid helium for the cryostats
    event.create(GY.types.detector).category('multiblock').setEUIO('in').setMaxIOSize(3, 1, 1, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
    // circuit + probe
    event.create(GY.types.launcher).category('multiblock').setEUIO('in').setMaxIOSize(2, 1, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var defs = [
      { name: 'gravitational_wave_detector', key: 'detector', casing: FROST,
        texture: 'gtceu:block/casings/solid/machine_casing_frost_proof' },
      { name: 'coilgun_launcher', key: 'launcher', casing: ROBUST,
        texture: 'gtceu:block/casings/solid/machine_casing_robust_tungstensteel' }
    ]
    defs.forEach(function (d) {
      var spec = GY.specs[d.key]
      Pat.register(GY.machines[d.key], spec)
      event.create(d.name, 'multiblock')
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(GY.types[d.key])
        .recipeModifier(G.noVoiding.modifier(keep(d.name), G.parallelHatch.overclock), true)
        .beforeWorking(G.noVoiding.beforeWorking(keep(d.name)))
        .appearanceBlock(function () { return Block.getBlock(d.casing) })
        .pattern(function (def) { return Pat.build(def, spec) })
        ['tooltips(net.minecraft.network.chat.Component[])']([
          Text.translate('grindless.machine.' + d.name + '.tooltip.0'),
          Text.translate('grindless.machine.' + d.name + '.tooltip.1')
        ])
        .workableCasingModel(d.texture, 'grindless:block/multiblock/' + d.name)
    })
  })
})()
