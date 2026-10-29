// priority: -22986
// -----------------------------------------------------------------------------------------------
// Recipes of UEV's Barnard b (machines and recipe type: startup_scripts/grindless/uev/barnard.js; docs/eras/uev.md, machines 21 and 22,
// lines 10 and 15; package UEV-B3), generated at every server load from data/grindless/tables/barnard.json, plus the two controllers.
//
//   gtceu:barnard_core_drilling  the drill's own type: grindless:barnard_core_rock, Barnard b only. The survey is kept
//                          (core_survey, no circuit); with only the bit and circuit 1 the drill cores a small pilot (the bootstrap: the
//                          survey itself needs 4 rock, earth_orbit.json).
//   gtceu:carbonyl_refining  circuit 1: the Mond process, Barnard rock + CO -> Fe(CO)5, nickel, cobalt, residue. Barnard b only.
//   gtceu:chemical_reactor / compressor / electric_blast_furnace   GTM rows (circuit 0), Barnard b only: crude ammonium perrhenate ->
//                          ammonium perrhenate -> gtceu:rhenium_dust -> pellet -> gtceu:rhenium_ingot. The platinum plant's circuit 9
//                          row (ev/platinum_plant.js) makes the crude salt from the residue.
//   crafting               the controllers: UEV hull + 2 optical computers + 2 UEV parts, shaped recipes grindless:crafting/<machine>.
//
// No load-order line: nothing here reads another script's data at load, only inside the recipe callback.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the tests: global.grindless.barnard.recipes, .skipped, .clashes, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uev] '
  var G = global.grindless || (global.grindless = {})
  var BA = G.barnard || (G.barnard = {})
  var TABLE = BA.table || 'kubejs/data/grindless/tables/barnard.json'
  var GTM_TYPES = ['chemical_reactor', 'compressor', 'electric_blast_furnace']
  var HOSTED = []
  var SITES = ['barnard_b']
  var MAX_CHANCE = 10000

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var circuits = {}
      var gtm = GTM_TYPES.indexOf(type) >= 0
      var hosted = HOSTED.indexOf(type) >= 0
      var def = t.types[type]
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var site = String(r.site || '')
        var temp = r.temp === undefined ? 0 : Number(r.temp)
        var zeroOk = gtm || def.circuitOptional === true
        var circuitOk = (zeroOk && circuit === 0) || (circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit])
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0 ||
          SITES.indexOf(site) < 0 || !(temp >= 0) || (temp > 0 && type !== 'electric_blast_furnace')) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration + ', site ' + site)
          return
        }
        var bad = false
        var stack = function (x) {
          var chance = x.chance === undefined ? MAX_CHANCE : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(chance >= 1 && chance <= MAX_CHANCE) ||
            (chance < MAX_CHANCE && Number(x.count) !== 1)) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, site: site, temp: temp, hosted: hosted,
          dataKey: def.dataKey ? String(def.dataKey) : '', idPrefix: def.idPrefix ? String(def.idPrefix) : '',
          itemsIn: list(r.itemsIn).map(stack), kept: list(r.kept).map(stack), fluidsIn: list(r.fluidsIn).map(fluid),
          itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) || (rec.itemsIn.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        if (circuit > 0) circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'barnard: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.kept, rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (GTM_TYPES.indexOf(rec.type) >= 0) return null
    var io = null
    Object.keys(BA.machines || {}).forEach(function (k) { if (BA.machines[k].type === rec.type) io = BA.machines[k].maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.kept.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    if (rec.fluidsOut.length > io.fluidsOut) return rec.fluidsOut.length + ' fluid outputs (the type holds ' + io.fluidsOut + ')'
    return null
  }

  function add(event, rec) {
    // GTM's builder puts the type in front: grindless:<name> becomes grindless:<type>/<name>
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.idPrefix + rec.name)
    rec.itemsIn.forEach(function (x) {
      if (x.chance < MAX_CHANCE) recipe.chancedInput('1x ' + x.id, x.chance, 0)
      else recipe.itemInputs(x.count + 'x ' + x.id)
    })
    rec.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance < MAX_CHANCE) recipe.chancedOutput('1x ' + x.id, x.chance, 0)
      else recipe.itemOutputs(x.count + 'x ' + x.id)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.temp > 0) recipe.blastFurnaceTemp(rec.temp)
    G.places.allow(recipe, rec.site)
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.kept).forEach(function (x) { keys['i:' + x.id] = true })
    rec.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
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
    BA.recipes = []
    BA.skipped = []
    BA.clashes = []
    function skip(name, reason) {
      BA.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'barnard skipped ' + name + ': ' + reason)
    }
    loadTable().forEach(function (rec) {
      rec.recipeId = 'grindless:' + rec.type + '/' + rec.idPrefix + rec.name
      var missing = missingIds(rec)
      if (missing.length > 0) return skip(rec.type + '/' + rec.name, 'unknown id(s): ' + missing.join(', '))
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) return skip(rec.type + '/' + rec.name, tooBig)
      try {
        add(event, rec)
      } catch (e) {
        return skip(rec.type + '/' + rec.name, 'the builder failed: ' + e)
      }
      BA.recipes.push(rec)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    BA.clashes = clashesOf(BA.recipes)
    if (BA.clashes.length > 0) console.error(LOG + 'barnard: recipes whose ingredients are a subset of another\'s: ' + BA.clashes.join('; '))
    console.info(LOG + 'barnard: ' + BA.recipes.length + ' recipes; skipped ' + BA.skipped.length)
  }

  function addControllers(event) {
    var HULL = 'gtceu:uev_machine_hull'
    var O = 'gtnn:optical_computer'
    var PISTON = 'grindless:uev_electric_piston'
    var PUMP = 'grindless:uev_electric_pump'
    var C = '4x #gtceu:circuits/uhv'
    var M = BA.machines || {}
    // QR-R6: assembly line with station research, the era fluid and domain inputs; the refinery follows the drill
    var defs = [
      { key: 'drill', research: 'grindless:ffkm_seal', era: 'gtceu:neutronium',
        ins: [HULL, '2x ' + O, '2x ' + PISTON, C, '2x grindless:ffkm_seal', 'grindless:tantalum_pentoxide_dust', 'grindless:rhenium_pellet'] },
      { key: 'refinery', research: 'gtceu:barnard_core_drill', era: 'gtceu:neutronium',
        ins: [HULL, '2x ' + O, '2x ' + PUMP, C, '2x grindless:ffkm_seal', 'grindless:tantalum_pentoxide_dust'] }
    ]
    BA.controllerRecipes = []
    defs.forEach(function (d) {
      var m = M[d.key]
      if (!m) {
        console.error(LOG + 'barnard controller ' + d.key + ' skipped: no machine')
        return
      }
      var ids = d.ins.map(function (s) { return s.replace(/^[0-9]+x /, '') }).filter(function (id) { return id.charAt(0) !== '#' }).concat([m.machine, d.research])
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + m.name + ' controller recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + m.name)
      b.itemInputs(d.ins)
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 1000), Fluid.of(d.era, 576))
      b.itemOutputs(m.machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(2400)
      BA.controllerRecipes.push('grindless:assembly_line/' + m.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'barnard ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
