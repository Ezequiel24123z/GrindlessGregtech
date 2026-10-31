// -----------------------------------------------------------------------------------------------
// Recipes of OpV's Kugelblitz forge and Hawking collector (machines and recipe types: startup_scripts/grindless/opv/kugelblitz.js;
// docs/eras/opv.md, machines 10 and 11, process line 37; package OpV-D3), generated at every server load from
// data/grindless/tables/kugelblitz.json, plus the two controllers' assembly lines.
//
//   gtceu:kugelblitz_forming   forge: c1 charge (2 dense positron cells + a gamma laser module worn 1/8 -> gamma pump charge), c2 seed (4 charges
//                              + FRC cartridge, Laue lens and multilayer mirror worn 1/64 -> kugelblitz_seed, 5% of the runs fail and the seed is
//                              thrown into Cygnus X-1), c3 core, c4 hawking_drive, c5 core from a spent shell (half the absorber tiles).
//   gtceu:hawking_power        collector, a generator: c1 1 stable exotic matter -> 2^30 EU/t for 14,800 t, core worn 1/64; c2 4,000 mB stellar
//                              plasma -> 2^29 EU/t for 4,600 t, core worn 1/32. Each run wears 1/8 absorber tile; the spent core comes back as
//                              an evaporated_core_shell with the same chance.
//   assembly_line              the two controllers (OpV hull + OpV parts + OpV circuits + the era fluid + domain items, behind station research).
//
// Exact wear: GTM's builder counts chances in ten-thousandths, which holds 1/8 but not 1/64 (156.25) or 1/32 (312.5). A row with such a fraction is
// written as a plain recipe JSON (event.custom) whose content carries chance 1 and maxChance 64 (the recipe JSON of GTM keeps chance and maxChance
// per content); the others use the builder. The row keys are documented in the table's _how_it_is_used.
// Lookup safety: a recipe whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.kugelblitz.recipes, .skipped, .clashes, .custom, .controllerRecipes.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var KB = G.kugelblitz || (G.kugelblitz = {})
  var TABLE = KB.table || 'kubejs/data/grindless/tables/kugelblitz.json'
  var SITE = KB.site || 'grindless:cygnus_x1_orbit'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function fraction(c) {
    var ok = Array.isArray(c) && c.length === 2 && Number(c[0]) >= 1 && Number(c[1]) >= Number(c[0]) && Number(c[0]) % 1 === 0 && Number(c[1]) % 1 === 0
    return ok ? [Number(c[0]), Number(c[1])] : null
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    var seen = {}
    Object.keys(t.types || {}).forEach(function (type) {
      var circuits = {}
      var def = t.types[type]
      list(def.recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit)
        var circuitOk = circuit >= 1 && circuit <= 32 && circuit % 1 === 0 && !circuits[circuit]
        if (!/^[a-z0-9_]+$/.test(n) || seen[type + '/' + n] || !circuitOk || !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1)) bad = true
          return { id: String(x.id), count: Number(x.count) }
        }
        var worn = function (x) {
          var f = fraction(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || f === null) bad = true
          return { id: String(x.id), count: Number(x.count), chance: f }
        }
        var made = function (x) {
          var f = x.chance === undefined ? null : fraction(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || (x.chance !== undefined && f === null)) bad = true
          return { id: String(x.id), count: Number(x.count), chance: f }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, dataKey: def.dataKey ? String(def.dataKey) : '',
          site: r.site === true, generator: r.generator === true, itemsIn: list(r.itemsIn).map(stack), wear: list(r.wear).map(worn),
          fluidsIn: list(r.fluidsIn).map(fluid), itemsOut: list(r.itemsOut).map(made) }
        if (bad || rec.itemsOut.length === 0 && !rec.generator || (rec.itemsIn.length === 0 && rec.wear.length === 0 && rec.fluidsIn.length === 0)) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        seen[type + '/' + n] = true
        circuits[circuit] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + 'kugelblitz: ' + TABLE + ': ' + problems.join('; '))
    return out
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.wear, rec.itemsOut).forEach(function (x) {
      if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    rec.fluidsIn.forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    var io = null
    ;(KB.machines || []).forEach(function (m) { if (m.type === rec.type) io = m.maxIO })
    if (io === null) return 'no slots known for type ' + rec.type
    var circuit = rec.circuit > 0 ? 1 : 0
    if (rec.itemsIn.length + rec.wear.length + circuit > io.itemsIn) return 'too many item inputs (the type holds ' + io.itemsIn + ')'
    if (rec.fluidsIn.length > io.fluidsIn) return 'too many fluid inputs (the type holds ' + io.fluidsIn + ')'
    if (rec.itemsOut.length > io.itemsOut) return rec.itemsOut.length + ' item outputs (the type holds ' + io.itemsOut + ')'
    return null
  }

  // a chance GTM's builder can hold: a whole number of ten-thousandths
  function inTenThousandths(f) {
    return (f[0] * 10000) % f[1] === 0 ? f[0] * 10000 / f[1] : -1
  }

  function needsJson(rec) {
    var exact = true
    rec.wear.concat(rec.itemsOut).forEach(function (x) { if (x.chance !== null && inTenThousandths(x.chance) < 0) exact = false })
    return !exact
  }

  function content(c, chance, max) {
    return { content: c, chance: chance, maxChance: max, tierChanceBoost: 0 }
  }

  // the recipe as GTM's recipe JSON: inputs, outputs, tick EU, data and the site condition
  function jsonOf(rec) {
    var item = function (x) { return { type: 'gtceu:sized', count: x.count, ingredient: { item: x.id } } }
    var inItems = []
    rec.itemsIn.forEach(function (x) { inItems.push(content(item(x), 10000, 10000)) })
    rec.wear.forEach(function (x) { inItems.push(content(item(x), x.chance[0], x.chance[1])) })
    if (rec.circuit > 0) inItems.push(content({ type: 'gtceu:circuit', configuration: rec.circuit }, 0, 10000))
    var outItems = []
    rec.itemsOut.forEach(function (x) { outItems.push(x.chance === null ? content(item(x), 10000, 10000) : content(item(x), x.chance[0], x.chance[1])) })
    var inputs = { item: inItems }
    if (rec.fluidsIn.length > 0) {
      inputs.fluid = rec.fluidsIn.map(function (f) { return content({ amount: f.amount, value: [{ fluid: f.id }] }, 10000, 10000) })
    }
    var data = {}
    if (rec.dataKey !== '') data[rec.dataKey] = rec.name
    var eu = [content(rec.eut, 10000, 10000)]
    var json = { type: 'gtceu:' + rec.type, duration: rec.duration, inputs: inputs, data: data }
    if (outItems.length > 0) json.outputs = { item: outItems }
    if (rec.generator) json.tickOutputs = { eu: eu }
    else json.tickInputs = { eu: eu }
    if (rec.site) json.recipeConditions = [{ type: 'dimension', dimension: SITE, reverse: false }]
    return json
  }

  function addBuilt(event, rec) {
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    rec.wear.forEach(function (x) { recipe.chancedInput(x.count + 'x ' + x.id, inTenThousandths(x.chance), 0) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance === null) recipe.itemOutputs(x.count + 'x ' + x.id)
      else recipe.chancedOutput(x.count + 'x ' + x.id, inTenThousandths(x.chance), 0)
    })
    if (rec.dataKey !== '') recipe.addDataString(rec.dataKey, rec.name)
    if (rec.site) recipe.dimension(SITE)
    recipe.EUt(rec.generator ? -rec.eut : rec.eut).duration(rec.duration)
  }

  function add(event, rec) {
    if (needsJson(rec)) {
      // GTM prefixes the type itself on the builder path: the same id here
      event.custom(jsonOf(rec)).id('grindless:' + rec.type + '/' + rec.name)
      rec.custom = true
    } else {
      addBuilt(event, rec)
      rec.custom = false
    }
  }

  function keysOf(rec) {
    var keys = {}
    rec.itemsIn.concat(rec.wear).forEach(function (x) { keys['i:' + x.id] = true })
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
    KB.recipes = []
    KB.skipped = []
    KB.clashes = []
    KB.custom = []
    function skip(name, reason) {
      KB.skipped.push({ name: name, reason: reason })
      console.error(LOG + 'kugelblitz skipped ' + name + ': ' + reason)
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
      KB.recipes.push(rec)
      if (rec.custom) KB.custom.push(rec.recipeId)
      console.info(LOG + rec.type + ' ' + rec.name + ': ' + rec.duration + ' t x ' + rec.eut + ' EU/t')
    })
    KB.clashes = clashesOf(KB.recipes)
    if (KB.clashes.length > 0) console.error(LOG + 'kugelblitz: recipes whose ingredients are a subset of another\'s: ' + KB.clashes.join('; '))
    console.info(LOG + 'kugelblitz: ' + KB.recipes.length + ' recipes; skipped ' + KB.skipped.length)
  }

  // docs/eras/opv.md, Voltages and controllers: OpV hull + components + 8 OpV circuits + 1,000 mB superfluid helium-3 + three domain inputs, at
  // VA[OpV] for 2,400 t, behind station research
  function addControllers(event) {
    var HULL = 'gtceu:opv_machine_hull'
    var FLUID = 'gtceu:superfluid_helium_3'
    var defs = [
      { name: 'kugelblitz_forge', research: 'grindless:laue_lens',
        parts: ['8x gtceu:opv_emitter', '4x gtceu:opv_field_generator', '4x gtceu:opv_sensor'],
        domain: ['grindless:gamma_multilayer_mirror', 'grindless:tetron_array', 'grindless:frc_cartridge'] },
      { name: 'hawking_collector', research: 'grindless:kugelblitz_core',
        parts: ['4x gtceu:opv_field_generator', '4x gtceu:opv_sensor', '4x gtceu:opv_electric_pump'],
        domain: ['grindless:gamma_absorber_tile', 'grindless:tpv_panel', 'grindless:stable_exotic_matter'] }
    ]
    KB.controllerRecipes = []
    defs.forEach(function (d) {
      var machine = 'gtceu:' + d.name
      var strip = function (s) { return s.replace(/^\d+x /, '') }
      var ids = [HULL, d.research].concat(d.parts.map(strip), d.domain.map(strip))
      var missing = ids.concat([machine]).filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(FLUID)) missing.push(FLUID)
      if (missing.length > 0) {
        console.error(LOG + d.name + ' controller recipe skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + d.name)
      b.itemInputs(HULL)
      d.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs('8x #gtceu:circuits/opv')
      d.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of(FLUID, 1000))
      b.itemOutputs(machine)
      b.stationResearch(function (r) { return r.researchStack(Item.of(d.research)).dataStack(Item.of('gtceu:data_module')).CWUt(128).EUt(503316480) })
      b.EUt(503316480).duration(2400)
      KB.controllerRecipes.push('grindless:assembly_line/' + d.name)
    })
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    var steps = [['recipes', generate], ['controllers', addControllers]]
    steps.forEach(function (s) {
      try {
        s[1](event)
      } catch (e) {
        console.error(LOG + 'kugelblitz ' + s[0] + ' failed: ' + e)
      }
    })
  })
})()
