// priority: -23474
// -----------------------------------------------------------------------------------------------
// Recipes and the transit of UHV's gate and edge (machines and recipe types: startup_scripts/grindless/uhv/gate.js; docs/eras/uhv.md,
// machines 18 and 25, lines 483-495 and 570-585, "Gate to UEV" 902-935; package UHV-B7), generated at every server load from
// data/grindless/tables/gate.json, plus the controllers, the AE2 Proxima pair, the UEV casing's research and the transit tick.
//
//   gtceu:warp_gate           in Earth orbit or Proxima b's orbit only (the gate's two ends). c1 "open": exotic matter cells and
//                             antihydrogen cartridges burn (the approach data, the nuclear clock and the organoid processor are
//                             kept) -> one Proxima gate seed; the cartridge shells come back (empty antiproton cartridges, to UV's
//                             trap). c2 "sustain": one exotic matter cell and 16 A UHV for 60 s hold the gate: nothing comes out.
//   gtceu:baseline_astrometry Proxima b's orbit only: the Sgr A* image (kept), SiC mirror blanks, ZBLAN fibre, QCLs, modulators and
//                             one dose of infrared pigment (the IR coating renewed each exposure, consumed) -> the chart.
//   ae2:transform             explosion: an AE2 singularity + the Proxima gate seed -> 2 quantum entangled singularities tagged
//                             grindless_planet = proxima (the Earth - Proxima b pair; planets.json's pairTag), grindless:transform/
//                             proxima_entangled_singularity.
//   gtceu:assembly_line       the UEV machine casing (GTM registers it without a recipe), after the station research of the chart.
//   gtceu:assembler           the ring's gate casing (F1's block): neutronium plates and frame, MgB2 wire, circuit 6.
//   crafting                  the two controllers: UHV hull + 2 UV parts + 2 UHV circuits, grindless:crafting/<machine>.
//   transit (tick)            while a gate's c2 run lasts and the other end's c2 run lasts too, a player standing inside the ring is
//                             teleported to the other ring's centre (player.teleportTo, server side: spike S0-7). One trip per
//                             stay: the player is not carried back until they have left the ring they arrived in.
// Published for the tests: global.grindless.warpGate.recipes, .skipped, .clashes, .controllerRecipes, .pair, .casing, .transit.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var WG = G.warpGate || (G.warpGate = {})
  var TABLE = WG.table || 'kubejs/data/grindless/tables/gate.json'
  var PLANETS = 'kubejs/data/grindless/tables/planets.json'
  var SITES = { orbits: ['gcyr:overworld_orbit', 'grindless:proxima_b_orbit', 'grindless:alpha_centauri_orbit', 'grindless:sirius_b_orbit'],
    proxima_b_orbit: ['grindless:proxima_b_orbit'] }
  var VA_UV = 491520
  var VA_UHV = 1966080
  var CHART = 'grindless:stellar_neighbourhood_chart'
  var CASING = 'gtceu:uev_machine_casing'
  var CWUT = 128
  var RING_HALF = 7
  var PERIOD = 10

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    Object.keys((t && t.types) || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      var def = t.types[type]
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var site = String(r.site || '')
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !(circuit >= 1 && circuit <= 32 && circuit % 1 === 0) || circuits[circuit] ||
          !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0 || !SITES[site]) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration + ', site ' + site)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, site: site,
          dataKey: String(def.dataKey || ''), itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack),
          itemsOut: list(r.itemsOut).map(stack) }
        if (bad || rec.itemsIn.length === 0) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'gate: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var io = null
    Object.keys(WG.machines || {}).forEach(function (k) { if (WG.machines[k].type === rec.type) io = WG.machines[k].maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    if (rec.itemsIn.length + rec.kept.length + 1 > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    return null
  }

  function add(event, rec) {
    // GTM's builder puts the type in front: grindless:<name> becomes grindless:<type>/<name>
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    recipe.circuit(rec.circuit)
    rec.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    SITES[rec.site].forEach(function (dim) { recipe.dimension(dim) })
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept).forEach(function (x) { keys['i:' + x.id] = true })
    keys['circuit:' + rec.circuit] = true
    return keys
  }

  function clashesOf(recs) {
    var out = []
    var keys = recs.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < recs.length; i++) {
      for (var j = i + 1; j < recs.length; j++) {
        if (recs[i].type !== recs[j].type) continue
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(recs[i].type + '/' + recs[i].name + ' / ' + recs[j].name)
      }
    }
    return out
  }

  function generate(event) {
    WG.recipes = []
    WG.skipped = []
    WG.clashes = []
    function skip(name, reason) {
      WG.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'gate skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      WG.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    WG.clashes = clashesOf(WG.recipes)
    if (WG.clashes.length > 0) console.error(LOG + 'gate: recipes whose ingredients are a subset of another\'s: ' + WG.clashes.join('; '))
    console.info(LOG + 'gate: ' + WG.recipes.length + ' recipes; skipped ' + WG.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uhv_machine_hull'
    var C = '#gtceu:circuits/uhv'
    var FIELD = 'gtceu:uv_field_generator'
    var SENSOR = 'gtceu:uv_sensor'
    var M = WG.machines || {}
    // the other UHV controllers' shapes: grep "pattern: [" in server_scripts/grindless/uhv/*.js (mirrors match too)
    var defs = [
      { key: 'gate', parts: [HULL, FIELD], pattern: ['F C', 'CHF'], ingredients: { C: C, F: FIELD, H: HULL } },
      { key: 'astrometer', parts: [HULL, SENSOR], pattern: ['SCS', 'CH '], ingredients: { C: C, S: SENSOR, H: HULL } }
    ]
    WG.controllerRecipes = []
    defs.forEach(function (d) {
      var m = M[d.key]
      if (!m) {
        console.error(LOG + 'gate controller ' + d.key + ' skipped: no machine')
        return
      }
      var missing = d.parts.concat([m.machine]).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + m.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.machine, d.pattern, d.ingredients).id('grindless:crafting/' + m.name)
      WG.controllerRecipes.push('grindless:crafting/' + m.name)
    })
  }

  // the Earth - Proxima b pair: the same transform as every other pair (iv/travel_network.js), the gate seed in place of a chemical seed
  function addPair(event) {
    var id = 'grindless:transform/proxima_entangled_singularity'
    var table = G.readJsonTable(PLANETS)
    var def = table && table.planets ? table.planets.proxima : null
    if (!def || !def.pairTag) throw new Error('planets.json has no proxima pairTag')
    var ids = ['ae2:singularity', 'ae2:quantum_entangled_singularity', WG.ids.seed]
    var missing = ids.filter(function (x) { return !Item.exists(x) })
    if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))
    event.custom({
      type: 'ae2:transform',
      circumstance: { type: 'explosion' },
      ingredients: [{ item: ids[0] }, { item: ids[2] }],
      result: { item: ids[1], count: 2, nbt: { grindless_planet: String(def.pairTag) } }
    }).id(id)
    WG.pair = { id: id, tag: String(def.pairTag), seed: ids[2] }
    // UEV-B1: the Alpha Centauri and Sirius pairs; the seed differs per pair so no AE2 transform matches two recipes (Barnard b shares Alpha's pair)
    WG.pairs = [WG.pair]
    var uev = [
      { planet: 'alpha', seed: 'grindless:quantum_repeater_node', name: 'alpha_entangled_singularity' },
      { planet: 'sirius', seed: 'grindless:degenerate_pellet', name: 'sirius_entangled_singularity' }
    ]
    uev.forEach(function (p) {
      var d = table.planets[p.planet]
      if (!d || !d.pairTag) { console.error(LOG + 'planets.json has no ' + p.planet + ' pairTag: relay pair skipped'); return }
      if (!Item.exists(p.seed)) { console.error(LOG + p.planet + ' relay pair skipped, unknown item: ' + p.seed); return }
      var pid = 'grindless:transform/' + p.name
      event.custom({
        type: 'ae2:transform',
        circumstance: { type: 'explosion' },
        ingredients: [{ item: ids[0] }, { item: p.seed }],
        result: { item: ids[1], count: 2, nbt: { grindless_planet: String(d.pairTag) } }
      }).id(pid)
      WG.pairs.push({ id: pid, tag: String(d.pairTag), seed: p.seed })
    })
  }

  // GTM registers the UEV casing without a recipe; ours stands on the station research of the chart (UV's UHV hatch pattern)
  function addCasing(event) {
    var inputs = ['2x gtceu:uhv_machine_casing', '2x gtceu:uv_field_generator', '4x grindless:thin_film_ln_modulator', '2x #gtceu:circuits/uhv']
    var missing = [CASING, CHART, 'gtceu:uhv_machine_casing', 'gtceu:uv_field_generator', 'grindless:thin_film_ln_modulator']
      .filter(function (x) { return !Item.exists(x) })
    if (!Fluid.exists('gtceu:soldering_alloy')) missing.push('gtceu:soldering_alloy')
    if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))
    var b = event.recipes.gtceu.assembly_line('grindless:uev_machine_casing')
    inputs.forEach(function (s) { b.itemInputs(s) })
    b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152))
    b.itemOutputs('2x ' + CASING).EUt(VA_UHV).duration(600)
    b.stationResearch(function (r) { return r.researchStack(Item.of(CHART)).CWUt(CWUT).EUt(VA_UV) })
    WG.casing = { id: 'grindless:assembly_line/uev_machine_casing', items: inputs, output: '2x ' + CASING, research: CHART, cwut: CWUT,
      researchEUt: VA_UV, eut: VA_UHV, duration: 600 }
  }

  // F1 registers the ring's casing block (both ends); neutronium shell, Mercury's MgB2 wire for the confinement field
  function addRingCasing(event) {
    var inputs = ['6x gtceu:neutronium_plate', '1x gtceu:neutronium_frame', '4x gtceu:magnesium_diboride_single_wire']
    var missing = [WG.ids && WG.ids.casing ? WG.ids.casing : 'grindless:warp_gate_casing'].concat(inputs.map(function (s) {
      return s.substring(s.indexOf(' ') + 1)
    })).filter(function (x) { return !Item.exists(x) })
    if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))
    var b = event.recipes.gtceu.assembler('grindless:warp_gate_casing')
    inputs.forEach(function (s) { b.itemInputs(s) })
    b.circuit(6).itemOutputs('2x grindless:warp_gate_casing').EUt(VA_UV).duration(200)
    WG.ringCasing = { id: 'grindless:assembler/warp_gate_casing', items: inputs, output: '2x grindless:warp_gate_casing', eut: VA_UV,
      duration: 200 }
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers], ['pair', addPair], ['casing', addCasing],
      ['ring casing', addRingCasing]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'gate ' + s[0] + ' failed: ' + e)
      }
    })
  })

  // ---------------------------------------------------------------- transit

  var T = WG.transit = { moved: {}, trips: 0 }

  function centreOf(rec) {
    return { x: rec.x - rec.fx * RING_HALF + 0.5, y: rec.y, z: rec.z - rec.fz * RING_HALF + 0.5 }
  }

  function inside(player, rec) {
    var c = centreOf(rec)
    return Math.abs(player.getX() - c.x) <= RING_HALF - 0.5 && Math.abs(player.getZ() - c.z) <= RING_HALF - 0.5 &&
      player.getY() >= rec.y - 1 && player.getY() <= rec.y + 3
  }

  // the runs that still last at game time `now` (the sustain row), by dimension; expired records are dropped
  function liveGates(server) {
    var live = []
    Object.keys(WG.gates || {}).forEach(function (k) {
      var rec = WG.gates[k]
      var level = server.getLevel(rec.dim)
      if (!level || !rec.sustain || Number(level.getTime()) >= rec.until) {
        if (level && Number(level.getTime()) >= rec.until) delete WG.gates[k]
        return
      }
      live.push(rec)
    })
    return live
  }

  function transit(server) {
    var live = liveGates(server)
    var inAny = {}
    server.getPlayers().forEach(function (player) {
      var uuid = String(player.getUuid())
      var dim = String(player.getLevel().getDimension())
      var here = null
      live.forEach(function (rec) { if (here === null && rec.dim === dim && inside(player, rec)) here = rec })
      if (here !== null) inAny[uuid] = true
      if (here === null || T.moved[uuid]) return
      var there = null
      live.forEach(function (rec) { if (there === null && rec.dim !== here.dim) there = rec })
      if (there === null) return
      var c = centreOf(there)
      T.moved[uuid] = true
      try {
        player.teleportTo(there.dim, c.x, c.y, c.z, player.getYaw(), player.getPitch())
        T.trips++
        console.info(LOG + 'warp gate: ' + player.getName().getString() + ' ' + here.dim + ' -> ' + there.dim)
      } catch (e) {
        delete T.moved[uuid]
        console.error(LOG + 'warp gate transit failed: ' + e)
      }
    })
    // a player who left every live ring may be carried again
    Object.keys(T.moved).forEach(function (u) {
      var stillIn = false
      server.getPlayers().forEach(function (p) {
        if (String(p.getUuid()) === u && inAny[u]) stillIn = true
      })
      if (!stillIn) delete T.moved[u]
    })
  }
  T.step = transit

  ServerEvents.tick(function (event) {
    var server = event.server
    if (server.getTickCount() % PERIOD !== 0) return
    try {
      transit(server)
    } catch (e) {
      console.error(LOG + 'warp gate transit tick failed: ' + e)
    }
  })
})()
