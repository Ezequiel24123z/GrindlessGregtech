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
//   crafting                  the two controllers: UHV hull + 3 UHV component families (3 of each) + UHV circuits + 3 domain items, assembly lines grindless:assembly_line/<machine>.
//   transit (tick)            while a gate holds (formed, WORKING on its c2 run), a player standing inside the ring is teleported to the
//                             centre of the ring that the relay coordinates in its input bus name, else to another holding ring
//                             (player.teleportTo, server side: spike S0-7). One trip per stay: the player is not carried back until
//                             they have left the ring they arrived in. Placed relay platforms (lib/relay_platforms.js) wake for one
//                             sustain when a player steps in.
// Published for the tests: global.grindless.warpGate.recipes, .skipped, .clashes, .controllerRecipes, .pair, .casing, .transit.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var WG = G.warpGate || (G.warpGate = {})
  var TABLE = WG.table || 'kubejs/data/grindless/tables/gate.json'
  var PLANETS = 'kubejs/data/grindless/tables/planets.json'
  var SITES = { orbits: ['gcyr:overworld_orbit', 'grindless:proxima_b_orbit', 'grindless:alpha_centauri_orbit', 'grindless:sirius_b_orbit'],
    proxima_b_orbit: ['grindless:proxima_b_orbit'], sirius_b_orbit: ['grindless:sirius_b_orbit'] }
  // UIV-B1: the three far rings run the c2 sustain (the ride home) and c1 open like any orbit; cygnus_x1_orbit is the site key B5 uses
  ;['grindless:rx_j1856_orbit', 'grindless:psr_j0437_orbit', 'grindless:cygnus_x1_orbit'].forEach(function (d) { SITES.orbits.push(d) })
  SITES.cygnus_x1_orbit = ['grindless:cygnus_x1_orbit']
  // UXV-B1 (integrator): the Vela and Cas A rings run the c2 sustain (the ride home) and c1 open like the UIV far rings
  ;['grindless:vela_pulsar_orbit', 'grindless:cas_a_remnant'].forEach(function (d) { SITES.orbits.push(d) })
  // OpV (integrator): the SGR 1806-20 and Terzan 5 rings run the c2 sustain (the ride home) and c1 open like the UXV far rings
  ;['grindless:sgr1806_orbit', 'grindless:terzan5_core'].forEach(function (d) { SITES.orbits.push(d) })
  // MAX-T2: the Sgr A* ring (gcyr:black_hole_orbit, F1's relay platform) runs c1 open, c2 sustain and the c15 throw to the NSC belt
  SITES.orbits.push('gcyr:black_hole_orbit')
  SITES.sgr_a_orbit = ['gcyr:black_hole_orbit']
  // XP-T2: the four MAX+ rings run c1 open and c2 sustain; 30 Doradus and the M31 nucleus are the sites of c17-c19
  ;['grindless:tarantula_orbit', 'grindless:magellanic_stream', 'grindless:m31_nucleus_orbit', 'grindless:local_group_filament'].forEach(function (d) { SITES.orbits.push(d) })
  SITES.tarantula_orbit = ['grindless:tarantula_orbit']
  SITES.m31_nucleus_orbit = ['grindless:m31_nucleus_orbit']
  // UEV-B5, c3 "hold" (docs/eras/uev.md "Gate to UIV"): 16 A x V[UEV] = 134,217,728 EU/t for 60 s at Sirius B's orbit. The stored items are
  // held (catalysts, never consumed: no UEV recipe uses up the stored items). Nothing comes out.
  var UEV_HOLD = { name: 'hold', circuit: 3, eut: 134217728, duration: 1200, site: 'sirius_b_orbit',
    itemsIn: [],
    kept: [{ id: 'grindless:tennessine_sample', count: 1 }, { id: 'grindless:degenerate_pellet', count: 1 },
      { id: 'grindless:degenerate_eos_model', count: 1 }, { id: '#gtceu:circuits/uev', count: 4 }],
    itemsOut: [] }
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
    if (t && t.types && t.types.warp_gate && !(t.types.warp_gate.recipes || []).some(function (r) { return r.name === UEV_HOLD.name })) {
      t.types.warp_gate.recipes = list(t.types.warp_gate.recipes).concat([UEV_HOLD])
    }
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
        if (bad || (rec.itemsIn.length === 0 && rec.kept.length === 0)) {
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

  // a '#tag' (any circuit of a tier: AGENTS.md principle 11) is not an item id; GTM resolves it
  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (x.id.charAt(0) !== '#' && !Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
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
    var FIELD = 'gtceu:uhv_field_generator'
    var SENSOR = 'gtceu:uhv_sensor'
    var EMITTER = 'gtceu:uhv_emitter'
    var MOTOR = 'gtceu:uhv_electric_motor'
    var M = WG.machines || {}
    var defs = [
      { key: 'gate', parts: [HULL, FIELD, EMITTER, MOTOR], research: 'grindless:warp_gate_casing', domain: ['4x grindless:empty_antiproton_cartridge', '2x grindless:srf_cryomodule', '2x grindless:uv_electromagnet'] },
      { key: 'astrometer', parts: [HULL, SENSOR, EMITTER, FIELD], research: 'grindless:hpge_crystal', domain: ['4x grindless:sapphire_wafer', '2x grindless:fused_silica_tube', '2x grindless:gallium_arsenide_wafer'] }
    ]
    WG.controllerRecipes = []
    defs.forEach(function (d) {
      var m = M[d.key]
      if (!m) {
        console.error(LOG + 'gate controller ' + d.key + ' skipped: no machine')
        return
      }
      var missing = d.parts.concat([m.machine, d.research], d.domain.map(function (s) { return s.replace(/^\d+x /, '') })).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + m.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + m.name)
      d.parts.forEach(function (s, i) { b.itemInputs(i === 0 ? s : '3x ' + s) })
      b.itemInputs('4x #gtceu:circuits/uhv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of('gtceu:tritanium', 1152))
      b.itemOutputs(m.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(1966080) })
      b.EUt(1966080).duration(1500)
      WG.controllerRecipes.push('grindless:assembly_line/' + m.name)
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
      { planet: 'sirius', seed: 'grindless:degenerate_pellet', name: 'sirius_entangled_singularity' },
      // UIV-B1: the three UIV platforms, one distinct seed each
      { planet: 'rx_j1856', seed: 'grindless:relay_seed', name: 'rx_j1856_entangled_singularity' },
      { planet: 'psr_j0437', seed: 'grindless:launched_relay_seed', name: 'psr_j0437_entangled_singularity' },
      { planet: 'cygnus_x1', seed: 'grindless:neutronium_pellet', name: 'cygnus_x1_entangled_singularity' },
      // UXV-B1 (integrator): the Vela and Cas A platforms; each seed is one of B1's own items (cage_part stays table-only, uiv-isotopes)
      { planet: 'vela_pulsar', seed: 'grindless:cnt_bumper_weave', name: 'vela_pulsar_entangled_singularity' },
      { planet: 'cas_a', seed: 'grindless:cnt_whipple_shield', name: 'cas_a_entangled_singularity' },
      // OpV (integrator): the SGR and Terzan 5 platforms; each seed is a product made only at that place (opv.md "Places and site rules")
      { planet: 'sgr1806', seed: 'grindless:field_frozen_plate', name: 'sgr1806_entangled_singularity' },
      { planet: 'terzan5', seed: 'grindless:cluster_sinter_casing', name: 'terzan5_entangled_singularity' },
      // AF-X: the last six places (M1-03); each seed is a product of that place or its line, distinct from every jump and gate input
      { planet: 'sgra', seed: 'grindless:reconnection_plasmoid', name: 'sgra_entangled_singularity' },
      { planet: 'nsc', seed: 'grindless:metal_rich_bloom', name: 'nsc_entangled_singularity' },
      { planet: 'tarantula', seed: 'grindless:ni56_slug', name: 'tarantula_entangled_singularity' },
      { planet: 'magellanic_stream', seed: 'grindless:scoop_coil', name: 'magellanic_stream_entangled_singularity' },
      { planet: 'm31', seed: 'grindless:p_nuclide_concentrate', name: 'm31_entangled_singularity' },
      { planet: 'local_group_filament', seed: 'grindless:void_grown_diamond', name: 'local_group_filament_entangled_singularity' }
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
    var inputs = ['2x gtceu:uhv_machine_casing', '2x gtceu:uhv_field_generator', '4x grindless:thin_film_ln_modulator', '2x #gtceu:circuits/uhv']
    var missing = [CASING, CHART, 'gtceu:uhv_machine_casing', 'gtceu:uhv_field_generator', 'grindless:thin_film_ln_modulator']
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
    b.inputFluids(Fluid.of('gtceu:lubricant', 250)).circuit(6).itemOutputs('2x grindless:warp_gate_casing').EUt(VA_UHV).duration(200)
    WG.ringCasing = { id: 'grindless:assembler/warp_gate_casing', items: inputs, output: '2x grindless:warp_gate_casing', eut: VA_UHV,
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

  // ---------------------------------------------------------------- transit (AF-1, issue #203)

  // A ring holds while its controller is formed and WORKING on the sustain row. That is read from the machine, so a paused or starved sustain
  // carries nobody, and a sustain GTM resumed after a restart does. The rings are WG.gates (every ring that started a run, kept in persistent
  // data by the startup hook) and the placed relay platforms (lib/relay_platforms.js). A player standing in a holding ring who has not just
  // arrived is carried, paid by that ring's sustain alone:
  //   - to the ring that the first relay coordinates in its input buses name;
  //   - else to another holding ring in another dimension, the first by key (the Earth - Proxima pairing; always the same choice).
  // A placed platform starts paused: a player stepping into it wakes it for one sustain (its stocked cell and the network's EU), after which it
  // carries them by its coordinates and pauses again. One trip per stay: a carried player is not carried again until they have left every
  // ring. The flag is also kept in the player's persistent data, so a restart does not send anyone back.
  var GATE_ID = 'gtceu:warp_gate'
  var MOVED_KEY = 'grindlessWarpMoved'
  var T = WG.transit = { moved: {}, woke: {}, trips: 0, wakes: 0 }
  var TC = null

  function transitClasses() {
    if (TC !== null) return TC
    TC = { Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'), Pos: Java.loadClass('net.minecraft.core.BlockPos') }
    return TC
  }

  function keyOf(rec) {
    return rec.dim + '|' + rec.x + '|' + rec.y + '|' + rec.z
  }

  function centreOf(rec) {
    return { x: rec.x - rec.fx * RING_HALF + 0.5, y: rec.y, z: rec.z - rec.fz * RING_HALF + 0.5 }
  }

  function inside(player, rec) {
    var c = centreOf(rec)
    return Math.abs(player.getX() - c.x) <= RING_HALF - 0.5 && Math.abs(player.getZ() - c.z) <= RING_HALF - 0.5 &&
      player.getY() >= rec.y - 1 && player.getY() <= rec.y + 3
  }

  // every known ring in key order; placed platforms carry `platform`
  function rings(server) {
    var byKey = {}
    Object.keys(WG.gates || {}).forEach(function (k) { byKey[k] = WG.gates[k] })
    var R = G.relayPlatforms
    if (R && typeof R.placedRings === 'function') R.placedRings(server).forEach(function (r) { byKey[keyOf(r)] = r })
    return Object.keys(byKey).sort().map(function (k) { return byKey[k] })
  }

  // the ring's controller if its chunk is loaded; a loaded block that is no longer a warp gate is forgotten (placed platforms excepted)
  function controllerOf(server, rec) {
    var level = server.getLevel(rec.dim)
    if (!level) return null
    var pos = new (transitClasses().Pos)(rec.x, rec.y, rec.z)
    if (!level.isLoaded(pos)) return null
    var m = transitClasses().Meta.getMachine(level, pos)
    if (!m || String(m.getDefinition().getId()) !== GATE_ID) {
      if (!rec.platform && server.persistentData && typeof WG.forgetRing === 'function') WG.forgetRing(server, keyOf(rec))
      return null
    }
    return m
  }

  function holding(server, rec) {
    var m = controllerOf(server, rec)
    if (!m || !m.isFormed()) return null
    var logic = m.getRecipeLogic()
    if (!logic.isWorking()) return null
    var last = logic.getLastRecipe()
    if (last === null || last === undefined || String(last.id).indexOf('/sustain') < 0) return null
    return m
  }

  function persistentOf(player) {
    try {
      return player.persistentData || null
    } catch (e) {
      return null
    }
  }

  function wasMoved(player, uuid) {
    if (T.moved[uuid]) return true
    var pd = persistentOf(player)
    return !!pd && pd.getBoolean(MOVED_KEY)
  }

  function setMoved(player, uuid, on) {
    if (on) T.moved[uuid] = true
    else delete T.moved[uuid]
    var pd = persistentOf(player)
    if (!pd) return
    if (on) pd.putBoolean(MOVED_KEY, true)
    else if (pd.contains(MOVED_KEY)) pd.remove(MOVED_KEY)
  }

  function nameOf(player) {
    try {
      return String(player.getName().getString())
    } catch (e) {
      return '?'
    }
  }

  function tell(player, key) {
    try {
      if (typeof player.displayClientMessage === 'function') player.displayClientMessage(Text.translate(key), true)
    } catch (e) {
      console.error(LOG + 'warp gate: could not tell ' + nameOf(player) + ' ' + key + ': ' + e)
    }
  }

  // where a holding ring sends a player: its coordinates (or { bad } when they name no warp gate), else the first other holding ring
  function destination(server, here, m, all, holds) {
    var R = G.relayPlatforms
    var sel = R && typeof R.selectorIn === 'function' ? R.selectorIn(m) : null
    if (sel !== null) {
      if (keyOf(sel) === keyOf(here)) return null
      var level = server.getLevel(sel.dim)
      if (!level || String(level.getBlock(sel.x, sel.y, sel.z).id) !== GATE_ID) return { bad: keyOf(sel) }
      return sel
    }
    for (var i = 0; i < all.length; i++) if (all[i].dim !== here.dim && holds(all[i])) return all[i]
    return null
  }

  // a paused placed platform under a player wakes for one sustain (once per stay)
  function wake(server, player, uuid, mine) {
    if (T.woke[uuid]) return
    for (var i = 0; i < mine.length; i++) {
      var rec = mine[i]
      if (!rec.platform) continue
      var m = controllerOf(server, rec)
      if (!m || !m.isFormed()) continue
      var logic = m.getRecipeLogic()
      if (!logic.isSuspend()) continue
      logic.setWorkingEnabled(true)
      logic.setSuspendAfterFinish(true)
      T.woke[uuid] = keyOf(rec)
      T.wakes++
      tell(player, 'grindless.warp_gate.waking')
      console.info(LOG + 'warp gate: ' + nameOf(player) + ' woke the relay ring at ' + keyOf(rec))
      return
    }
  }

  function transit(server) {
    var all = rings(server)
    var seen = {}
    function holds(rec) {
      var k = keyOf(rec)
      if (seen[k] === undefined) seen[k] = holding(server, rec) || false
      return seen[k]
    }
    var inAny = {}
    var online = []
    server.getPlayers().forEach(function (player) {
      var uuid = String(player.getUuid())
      online.push({ p: player, u: uuid })
      var dim = String(player.getLevel().getDimension())
      var mine = all.filter(function (rec) { return rec.dim === dim && inside(player, rec) })
      if (mine.length === 0) return
      inAny[uuid] = true
      if (wasMoved(player, uuid)) return
      var here = null
      mine.forEach(function (rec) { if (here === null && holds(rec)) here = rec })
      if (here === null) {
        wake(server, player, uuid, mine)
        return
      }
      var there = destination(server, here, holds(here), all, holds)
      if (there === null) return
      setMoved(player, uuid, true)
      if (there.bad) {
        tell(player, 'grindless.warp_gate.no_ring')
        console.info(LOG + 'warp gate: the coordinates in the ring at ' + keyOf(here) + ' name no warp gate (' + there.bad + ')')
        return
      }
      var c = centreOf(there)
      try {
        player.teleportTo(there.dim, c.x, c.y, c.z, player.getYaw(), player.getPitch())
        T.trips++
        console.info(LOG + 'warp gate: ' + nameOf(player) + ' ' + keyOf(here) + ' -> ' + keyOf(there))
      } catch (e) {
        setMoved(player, uuid, false)
        console.error(LOG + 'warp gate transit failed: ' + e)
      }
    })
    // a player who left every ring may be carried (and wake a ring) again
    online.forEach(function (o) { if (!inAny[o.u]) setMoved(o.p, o.u, false) })
    Object.keys(T.moved).forEach(function (u) { if (!inAny[u]) delete T.moved[u] })
    Object.keys(T.woke).forEach(function (u) { if (!inAny[u]) delete T.woke[u] })
  }
  T.step = transit

  ServerEvents.tick(function (event) {
    var server = event.server
    if (server.getTickCount() % PERIOD !== 0) return
    try {
      // the first tick of a world (a restart, or another world in the same game): the rings come back from persistent data
      if (T.server !== server) {
        T.server = server
        if (typeof WG.loadRings === 'function') WG.loadRings(server)
      }
      transit(server)
    } catch (e) {
      console.error(LOG + 'warp gate transit tick failed: ' + e)
    }
  })
})()
