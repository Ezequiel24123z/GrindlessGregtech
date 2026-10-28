// priority: -8050
// -----------------------------------------------------------------------------------------------
// UHV's gate and edge (docs/eras/uhv.md, machines 18 and 25, lines 483-495 and 570-585; package UHV-B7): the warp gate, built at both
// ends (Earth orbit and Proxima b's orbit), and the baseline astrometer, with their recipe types. The recipes come from
// data/grindless/tables/gate.json (server_scripts/grindless/uhv/gate.js). Every item and block they use is F1's (uhv/foundation.js)
// or older; this file registers machines only.
//
//   gtceu:warp_gate           type gtceu:warp_gate. A 15 x 15 x 3 ring of grindless:warp_gate_casing round open air, with six
//                             modulator mounts (UHV casing, where the thin-film lithium niobate modulators sit) on its top row. c1
//                             opens the gate and makes the Proxima gate seed; c2 holds it open for a minute: while it runs, a player
//                             standing in the ring is carried to the other ring (the transit lives in server_scripts/.../gate.js;
//                             beforeWorking below records each run). Items do not cross: they go by AE2.
//   gtceu:baseline_astrometer type gtceu:baseline_astrometry (observatory step 9). 7 x 5 x 7: a station truss deck and roof on four
//                             frame posts round a gearbox dish drive. Proxima b's orbit only: the chart is made where the baseline is.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top; S is the controller on the front face).
// Published: global.grindless.warpGate (.machines, .gates (runs recorded by beforeWorking), .order, .ids).
(function () {
  const G = global.grindless
  const Pat = G.patterns
  const WG = G.warpGate || (G.warpGate = {})
  const LOG = '[grindless/uhv] '

  const GATE_CASING = 'grindless:warp_gate_casing'
  const GATE_TEXTURE = 'grindless:block/uhv/warp_gate_casing'
  const MOUNT = 'gtceu:uhv_machine_casing'
  const STATION = 'grindless:station_truss_casing'
  const STATION_TEXTURE = 'grindless:block/luv/station_truss_casing'
  const GEARBOX = 'gtceu:tungstensteel_gearbox'

  WG.table = 'kubejs/data/grindless/tables/gate.json'
  WG.ringHalf = 7
  WG.gates = WG.gates || {}
  WG.ids = { seed: 'grindless:proxima_gate_seed', chart: 'grindless:stellar_neighbourhood_chart' }

  WG.machines = {
    gate: {
      name: 'warp_gate',
      machine: 'gtceu:warp_gate',
      type: 'warp_gate',
      dataKey: 'grindless_warp_gate',
      lang: 'Warp Gate',
      casing: GATE_CASING,
      texture: GATE_TEXTURE,
      // items in: the exotic matter cells, the cartridges, the approach data, the clock, the processor and the circuit
      maxIO: { itemsIn: 6, itemsOut: 2, fluidsIn: 0, fluidsOut: 0 },
      width: 15, depth: 15, height: 3
    },
    astrometer: {
      name: 'baseline_astrometer',
      machine: 'gtceu:baseline_astrometer',
      type: 'baseline_astrometry',
      dataKey: 'grindless_baseline_astrometry',
      lang: 'Baseline Astrometer',
      casing: STATION,
      texture: STATION_TEXTURE,
      // items in: the Sgr A* image, mirror blanks, fibre, lasers, modulators, the processor, the pigment and the circuit
      maxIO: { itemsIn: 8, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 },
      width: 7, depth: 7, height: 5
    }
  }

  // The ring: row 0 the floor of the ring wall (X: casing or a part), rows 1-2 the wall (B), S the controller (front middle, row 1);
  // M the six modulator mounts on the top row: the four corners and the middle of both sides. The inside is air.
  function gateSlices(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var edge = si === 0 || si === last || c === 0 || c === m.width - 1
          var corner = (si === 0 || si === last) && (c === 0 || c === m.width - 1)
          var sideMid = si === mid && (c === 0 || c === m.width - 1)
          var ch
          if (!edge) ch = '#'
          else if (r === 0) ch = 'X'
          else if (r === 1 && si === last && c === mid) ch = 'S'
          else if (r === 2 && (corner || sideMid)) ch = 'M'
          else ch = 'B'
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // The astrometer: row 0 the deck (X: station casing or a part; S the controller, front middle), rows 1-3 four frame posts (F) and
  // a gearbox dish drive (D) in the middle of row 1, row 4 the roof ring (B). ' ' is anything.
  function astroSlices(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var edge = si === 0 || si === last || c === 0 || c === m.width - 1
          var corner = (si === 0 || si === last) && (c === 0 || c === m.width - 1)
          var ch
          if (r === 0) ch = si === last && c === mid ? 'S' : 'X'
          else if (r === m.height - 1) ch = edge ? 'B' : ' '
          else if (r === 1 && si === mid && c === mid) ch = 'D'
          else ch = corner ? 'F' : ' '
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  var M = WG.machines
  M.gate.spec = {
    slices: gateSlices(M.gate),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(GATE_CASING),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 4 })),
      B: Pat.block(GATE_CASING),
      M: Pat.block(MOUNT),
      '#': Pat.air()
    }
  }
  M.astrometer.spec = {
    slices: astroSlices(M.astrometer),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(STATION),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 1 }),
        Pat.part('energy_input', { min: 1, max: 2 })),
      B: Pat.block(STATION),
      F: Pat.frame(['stainless_steel']),
      D: Pat.block(GEARBOX)
    }
  }
  WG.order = ['gate', 'astrometer']

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

  // The gate records every run as it starts; the transit tick (server script) reads these. A run is the sustain row when its id ends
  // in /sustain; it lasts until the game time `until`.
  function recordRun(machine, recipe) {
    try {
      var level = machine.getLevel()
      var pos = machine.getPos()
      var f = String(machine.getFrontFacing()).toLowerCase()
      var steps = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }
      var step = steps[f]
      if (!step) {
        console.error(LOG + 'warp gate: front facing "' + f + '" is not horizontal; run not recorded')
        return true
      }
      var id = String(recipe.id)
      var duration = Number(recipe.duration)
      var d = level.dimension
      var dim = String(typeof d === 'function' ? level.dimension().location() : d)
      WG.gates[dim + '|' + pos.getX() + '|' + pos.getY() + '|' + pos.getZ()] = {
        dim: dim, x: pos.getX(), y: pos.getY(), z: pos.getZ(),
        fx: step[0], fz: step[1],
        sustain: id.indexOf('/sustain') >= 0,
        until: Number(level.getTime()) + duration
      }
    } catch (e) {
      console.error(LOG + 'warp gate: could not record a run: ' + e)
    }
    return true
  }

  // ---------------------------------------------------------------- recipe types

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    WG.order.forEach(function (k) {
      var m = WG.machines[k]
      event.create(m.type)
        .category('multiblock')
        .setEUIO('in')
        .setMaxIOSize(m.maxIO.itemsIn, m.maxIO.itemsOut, m.maxIO.fluidsIn, m.maxIO.fluidsOut)
        .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW_MULTIPLE, FillDirection.LEFT_TO_RIGHT)
        .setSound(k === 'gate' ? GTSoundEntries.ARC : GTSoundEntries.COMPUTATION)
    })
  })

  // The sustain load (16 A UHV) and the hold load (16 A UEV) are above one hatch's voltage tier, which GTM's overclock refuses
  // ("insufficient voltage"): both are fixed loads, so they take the recipe as it is (the energy hatches still have to supply
  // them); c1 overclocks as usual.
  function gateOverclock(machine, recipe) {
    var id = String(recipe.id)
    if (id.indexOf('/sustain') >= 0 || id.indexOf('/hold') >= 0) return ModifierFunction.IDENTITY
    return GTRecipeModifiers.OC_NON_PERFECT.getModifier(machine, recipe)
  }

  // ---------------------------------------------------------------- machines

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    WG.order.forEach(function (k) {
      var m = WG.machines[k]
      var type = GTRecipeTypes.get(m.type)
      if (type == null) throw new Error(LOG + 'recipe type gtceu:' + m.type + ' is not registered')
      type.addDataInfo(infoOf(m.dataKey))
      Pat.register(m.machine, m.spec)

      var b = event.create(m.name, 'multiblock')
        .langValue(m.lang)
        .rotationState(RotationState.NON_Y_AXIS)
        .recipeType(m.type)
        .recipeModifier(G.parallelHatch.modifier(k === 'gate' ? gateOverclock : G.parallelHatch.overclock))
        .appearanceBlock(function () { return Block.getBlock(m.casing) })
        .pattern(function (def) { return Pat.build(def, m.spec) })
      if (k === 'gate') b = b.beforeWorking(function (machine, recipe) { return recordRun(machine, recipe) })
      b["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
        Text.translate('grindless.machine.' + m.name + '.tooltip.2')
      ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
