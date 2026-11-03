// priority: -8050
// -----------------------------------------------------------------------------------------------
// UHV's gate and edge (docs/eras/uhv.md, machines 18 and 25, lines 483-495 and 570-585; package UHV-B7): the warp gate, built at both
// ends (Earth orbit and Proxima b's orbit), and the baseline astrometer, with their recipe types. The recipes come from
// data/grindless/tables/gate.json (server_scripts/grindless/uhv/gate.js). Every item and block they use is F1's (uhv/foundation.js)
// or older; this file registers machines only.
//
//   gtceu:warp_gate           type gtceu:warp_gate. A 25 x 9 x 20 gate: a 15 x 15 ring of grindless:warp_gate_casing round open air (tungsten steel
//                             posts, a fusion-glass window band and a superconducting coil band), with six modulator mounts
//                             (UHV casing, where the thin-film lithium niobate modulators sit) on its top row, in a stepped berm. c1
//                             opens the gate and makes the Proxima gate seed; c2 holds it open for a minute: while it runs, a player
//                             standing in the ring is carried to the ring a relay coordinates stick in its input bus names, else to
//                             the other holding ring (the transit lives in server_scripts/.../gate.js; beforeWorking below records each
//                             ring, afterWorking hands each completed run to lib/relay_platforms.js). Items do not cross: they go by AE2.
//   gtceu:baseline_astrometer type gtceu:baseline_astrometry (observatory step 9). 29 x 12 x 7: a truss boom with a clean-casing control hut and a
//                             gearbox-driven fusion-glass mirror tower at each end. Proxima b's orbit only: the chart is made where the baseline is.
//
// Geometry (lib/patterns.js: slices back -> front, rows bottom -> top; S is the controller on the front face).
// Published: global.grindless.warpGate (.machines, .gates (the rings, see "The rings"), .order, .ids, .ringKey, .ringOf, .saveRing, .forgetRing,
// .loadRings, .finishRun; .onFinished is set by server lib/relay_platforms.js).
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
      width: 25, depth: 20, height: 9
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
      width: 29, depth: 7, height: 12
    }
  }

  // The gate, 25 wide x 9 high x 20 deep (D3-SIZE-UHV1). The 15 x 15 ring of old is its heart: the wall at distance 7 from the centre (X the floor
  // of the wall, S the controller on the front middle, row 1) round open air, as before, because the jump (server uhv/gate.js, lib/relay_platforms.js)
  // reads the player's place from the controller (RING_HALF 7). Around it a stepped berm of 5 bands (distance 8 to 12, BAND by row, bottom up) rises to
  // the wall, wider at the back and the sides (the front stops at the controller's face), with nine frame chevrons (CHEVRONS) standing on it.
  //   B the gate casing   T station truss (deck)   R field ring casing (the field band)   G fusion glass (the step tops)
  //   K superconducting coil (the wall's band, 48 in all)   F tungsten steel frames   M the six modulator mounts   X casing or a part
  var RING = 7
  var BAND = { 8: 'TBBRRBG', 9: 'TBRBBG', 10: 'TTBBBG', 11: 'TTBBG', 12: 'XXBG' }
  var CHEVRONS = [[2, 2], [12, 2], [22, 2], [2, 6], [22, 6], [2, 12], [22, 12], [2, 18], [22, 18]]

  function chevron(c, si) {
    var onSide = c === 2 || c === 22
    for (var i = 0; i < CHEVRONS.length; i++) {
      var p = CHEVRONS[i]
      if (p[0] === c && p[1] === si) return 3
      var near = onSide ? (p[0] === c && Math.abs(p[1] - si) === 1) : (p[1] === si && Math.abs(p[0] - c) === 1)
      if (near) return 2
    }
    return 0
  }

  function gateSlices(m) {
    var slices = []
    var last = m.depth - 1
    var cx = (m.width - 1) / 2
    var cz = last - RING
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var dx = Math.abs(c - cx)
          var dz = Math.abs(si - cz)
          var d = Math.max(dx, dz)
          var ch
          if (d > RING) {
            var col = BAND[d]
            ch = col && r < col.length ? col.charAt(r) : ' '
            if (ch === ' ' && r >= 6 && d === 10) {
              var h = chevron(c, si)
              if (h > 0 && r < 6 + h) ch = 'F'
            }
            // a relay platform sets a wireless dynamo hatch 9 east of the controller and an AE2 controller and drive 12 east (lib/relay_platforms.js)
            if (si === last && ((dx === 9 && r === 1) || (dx === 12 && (r === 1 || r === 2)))) ch = ' '
          } else if (d < RING) ch = r < 5 ? '#' : ' '
          else if (r > 4) ch = ' '
          else {
            var corner = dx === RING && dz === RING
            var sideMid = dz === 0 && dx === RING
            var post = corner || sideMid || (dx === 0 && dz === RING)
            if (r === 0) ch = 'X'
            else if (r === 1 && si === last && c === cx) ch = 'S'
            else if (r === 4 && (corner || sideMid)) ch = 'M'
            else if (post) ch = 'F'
            else if (r === 2) ch = 'G'
            else if (r === 3) ch = 'K'
            else ch = 'B'
          }
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }

  // The astrometer, 29 wide x 12 high x 7 deep (D3-SIZE-UHV1): a long truss baseline (the boom: deck, pipe rail, side posts) with the control hut
  // in the middle (clean machine casing, laminated-glass windows, S on its front wall) and a mirror tower at each end: four frame corners
  // round a gearbox drive, truss rings, a stepped fusion-glass dish. X: deck casing or a part on the boom's rim. ' ' is anything.
  function astroSlices(m) {
    var slices = []
    var last = m.depth - 1
    var mid = (m.width - 1) / 2
    var towers = [4, m.width - 5]
    for (var si = 0; si < m.depth; si++) {
      var rows = []
      for (var r = 0; r < m.height; r++) {
        var row = ''
        for (var c = 0; c < m.width; c++) {
          var ch = ' '
          var hx = Math.abs(c - mid)
          var inHut = hx <= 3
          var onBoom = si >= 2 && si <= 4
          var tower = -1
          for (var k = 0; k < towers.length; k++) if (Math.abs(c - towers[k]) <= 2) tower = k
          var tx = tower < 0 ? 9 : Math.abs(c - towers[tower])
          var tz = Math.abs(si - 3)
          if (inHut) {
            var wall = hx === 3 || si === 0 || si === last
            if (r === 0) ch = 'B'
            else if (r === 1 && si === last && c === mid) ch = 'S'
            else if (r <= 3 && wall) ch = r === 2 && (hx === 3 || si === 0 || si === last) && (si + c) % 2 === 0 ? 'L' : 'C'
            else if (r === 4) ch = 'C'
            else if (r <= 3) ch = '#'
          } else if (r === 0 && onBoom) ch = (c === 0 || c === m.width - 1 || si === 2 || si === 4) ? 'X' : 'B'
          else if (r === 1 && onBoom && tower < 0) ch = si === 3 ? 'P' : (c % 4 === 0 ? 'F' : ' ')
          else if (tower >= 0 && tx <= 1 && tz <= 1) {
            var corner = tx === 1 && tz === 1
            if (r === 1 && tx === 0 && tz === 0) ch = 'D'
            else if (r >= 1 && r <= 8 && corner) ch = 'F'
            else if (r >= 1 && r <= 8 && tx === 0 && tz === 0) ch = 'F'
            else if ((r === 4 || r === 7) && !(tx === 0 && tz === 0)) ch = 'B'
          } else if (tower >= 0 && tx <= 2 && tz <= 2) {
            var rg = Math.max(tx, tz)
            if (r === 9 && rg === 2) ch = 'B'
            else if (r === 10 && rg === 2) ch = 'W'
            else if (r === 9 && rg <= 1) ch = 'B'
            else if (r === 10 && rg === 1 && tz <= 1 && tx <= 1) ch = ' '
            else if (r === 11 && rg === 2) ch = 'W'
          }
          row += ch
        }
        rows.push(row)
      }
      slices.push(rows)
    }
    return slices
  }  var M = WG.machines
  M.gate.spec = {
    slices: gateSlices(M.gate),
    symbols: {
      S: Pat.controller(),
      X: Pat.oneOf(Pat.block(GATE_CASING),
        Pat.part('input_bus', { min: 1, max: 2 }),
        Pat.part('output_bus', { min: 1, max: 2 }),
        Pat.part('energy_input', { min: 1, max: 4 })),
      B: Pat.block(GATE_CASING),
      T: Pat.block(STATION),
      R: Pat.block('grindless:field_ring_casing'),
      M: Pat.block(MOUNT),
      F: Pat.frame(['tungsten_steel']),
      G: Pat.block('gtceu:fusion_glass'),
      K: Pat.block('gtceu:superconducting_coil'),
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
      C: Pat.block('gtceu:clean_machine_casing'),
      L: Pat.block('gtceu:laminated_glass'),
      F: Pat.frame(['stainless_steel']),
      D: Pat.block(GEARBOX),
      P: Pat.block('gtceu:tungstensteel_pipe_casing'),
      W: Pat.block('gtceu:fusion_glass'),
      '#': Pat.air()
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

  // The rings (AF-1). Every gate that starts a run is a ring the transit knows: WG.gates (key dim|x|y|z) is this boot's copy, and the world's
  // persistent data keeps the positions (RINGS_KEY, "dim|x|y|z|fx|fz" entries joined by ';'), because GTM resumes a running recipe after a
  // restart without calling beforeWorking. `sustain` and `until` describe the run that started last; nothing decides on them: whether a ring
  // holds is read from the machine itself (server uhv/gate.js, transit).
  var RINGS_KEY = 'grindless_warp_rings'
  var STEPS = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }
  WG.ringsKey = RINGS_KEY

  function ringKey(dim, x, y, z) {
    return dim + '|' + x + '|' + y + '|' + z
  }

  // the ring of a gate controller: dimension, controller position and front direction (fx, fz), or null when its front is not horizontal
  function ringOf(machine) {
    var level = machine.getLevel()
    var pos = machine.getPos()
    var f = String(machine.getFrontFacing()).toLowerCase()
    var step = STEPS[f]
    if (!step) return null
    var d = level.dimension
    var dim = String(typeof d === 'function' ? level.dimension().location() : d)
    return { dim: dim, x: Number(pos.getX()), y: Number(pos.getY()), z: Number(pos.getZ()), fx: step[0], fz: step[1] }
  }

  function savedRings(server) {
    var data = server && server.persistentData
    if (!data || !data.contains(RINGS_KEY)) return []
    return String(data.getString(RINGS_KEY)).split(';').filter(function (s) { return s.split('|').length === 6 })
  }

  // keeps a ring's position in persistent data (once; a ring turned round replaces its old entry)
  function saveRing(server, rec) {
    var data = server && server.persistentData
    if (!data) return
    var key = ringKey(rec.dim, rec.x, rec.y, rec.z)
    var entry = key + '|' + rec.fx + '|' + rec.fz
    var list = savedRings(server)
    if (list.indexOf(entry) >= 0) return
    list = list.filter(function (s) { return s.split('|').slice(0, 4).join('|') !== key })
    list.push(entry)
    data.putString(RINGS_KEY, list.join(';'))
  }

  function forgetRing(server, key) {
    delete WG.gates[key]
    var data = server && server.persistentData
    if (!data) return
    var list = savedRings(server)
    var kept = list.filter(function (s) { return s.split('|').slice(0, 4).join('|') !== key })
    if (kept.length !== list.length) data.putString(RINGS_KEY, kept.join(';'))
  }

  // a new world (or the first tick after a restart): WG.gates becomes the saved rings
  function loadRings(server) {
    WG.gates = {}
    savedRings(server).forEach(function (s) {
      var p = s.split('|')
      WG.gates[ringKey(p[0], p[1], p[2], p[3])] = { dim: p[0], x: Number(p[1]), y: Number(p[2]), z: Number(p[3]), fx: Number(p[4]), fz: Number(p[5]),
        sustain: false, until: 0 }
    })
    return WG.gates
  }

  WG.ringKey = ringKey
  WG.ringOf = ringOf
  WG.saveRing = saveRing
  WG.forgetRing = forgetRing
  WG.loadRings = loadRings

  // beforeWorking: the gate records every run as it starts. A run is the sustain row when its id ends in /sustain.
  function recordRun(machine, recipe) {
    try {
      var ring = ringOf(machine)
      if (!ring) {
        console.error(LOG + 'warp gate: front facing "' + String(machine.getFrontFacing()) + '" is not horizontal; run not recorded')
        return true
      }
      var id = String(recipe.id)
      ring.sustain = id.indexOf('/sustain') >= 0
      ring.until = Number(machine.getLevel().getTime()) + Number(recipe.duration)
      WG.gates[ringKey(ring.dim, ring.x, ring.y, ring.z)] = ring
      saveRing(machine.getLevel().getServer(), ring)
    } catch (e) {
      console.error(LOG + 'warp gate: could not record a run: ' + e)
    }
    return true
  }

  // afterWorking: GTM calls it when a run completes and also when one is interrupted (RecipeLogic#interruptRecipe), before it resets the
  // progress. Only a run that reached its full duration counts, so a paused, starved or broken jump never pays out. WG.onFinished
  // (server lib/relay_platforms.js) gets the completed run's recipe id.
  function finishRun(machine) {
    try {
      var logic = machine.getRecipeLogic()
      var last = logic.getLastRecipe()
      if (last === null || last === undefined) return
      var duration = Number(logic.getDuration())
      if (!(duration > 0) || Number(logic.getProgress()) < duration) return
      if (typeof WG.onFinished === 'function') WG.onFinished(machine, String(last.id))
    } catch (e) {
      console.error(LOG + 'warp gate: after a run: ' + e)
    }
  }
  WG.finishRun = finishRun

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
      if (k === 'gate') {
        b = b.beforeWorking(function (machine, recipe) { return recordRun(machine, recipe) })
          .afterWorking(function (machine) { finishRun(machine) })
      }
      b["tooltips(net.minecraft.network.chat.Component[])"]([
        Text.translate('grindless.machine.' + m.name + '.tooltip.0'),
        Text.translate('grindless.machine.' + m.name + '.tooltip.1'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + m.type))
      ])
        .workableCasingModel(m.texture, 'grindless:block/multiblock/' + m.name)
    })
  })
})()
