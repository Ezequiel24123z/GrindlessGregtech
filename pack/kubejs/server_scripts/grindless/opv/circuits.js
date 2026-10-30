// -----------------------------------------------------------------------------------------------
// OpV circuits (package OpV-A2, docs/eras/opv.md 'A2. Circuits', process lines 11-18): the line steps that run on GTM's cutter and
// assembler and on LuV's helium refrigerator, generated at every server load from data/grindless/tables/circuits.json. Items and fluids:
// startup_scripts/grindless/opv/circuits.js.
//
//   gtceu:cutter / assembler          one recipe per table entry, id grindless:<type>/<name>; circuit 0 = none (GTM's own types)
//   gtceu:closed_loop_cooling         the 4 K test of the cryo-CMOS die and the Nb TSV interposer, keyed by the one item input (no circuit),
//                                     with the refrigerator's own make-up, pre-cool and charge (tables/helium_refrigerator.json) and its
//                                     EMI line (data key grindless_closed_loop), like the rows luv/helium_refrigerator.js generates
//
// The other steps of the lines are rows of older machines, marked OpV-A2 in their own files: EV extraction cascade (c24, c26-27), EV
// platinum plant (c17), UV zone refining (c11), UV SRF cavity works (c8), UV MOCVD (c17-19, c21) and fibre draw (c17), UV/ZPM ion
// implanter (c12-14), UHV crystal growth (c21), MBE (c9-10), SiC device fab (c6), UEV CVI (c8), SNSPD foundry (c6), UIV ion slicing
// (c5-6), femtosecond writer (c6), BEUV scanner (c4-8), STM lithography (c4), UXV MTJ sputtering (c5-8). The join is the UEV photonic
// integration hall's c8 (tables/photonics_uev.json): cryo_cmos_die + nb_tsv_interposer + cryo_optical_link + hemt_amplifier ->
// gtnn:cosmic_mainframe, the only recipe that makes it (GT-- 1.3.10 ships no recipe for it, checked in its jar; OpV-F2 cuts its cosmic SMDs).
//
// Published for the tests: global.grindless.opvCircuits.recipes, .skipped, .fridgeRecipes (the closed_loop_cooling ids this script adds).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv_circuits] '
  var G = global.grindless || (global.grindless = {})
  var OC = G.opvCircuits || (G.opvCircuits = {})
  var TABLE = 'kubejs/data/grindless/tables/circuits.json'
  var GTM_TYPES = { cutter: true, assembler: true }
  var FRIDGE = 'closed_loop_cooling'
  var FRIDGE_KEY = 'grindless_closed_loop'
  // the refrigerator's slots (startup_scripts/grindless/luv/helium_refrigerator.js, HR.maxIO)
  var FRIDGE_IO = { itemsIn: 1, itemsOut: 1, fluidsIn: 4, fluidsOut: 1 }
  OC.table = TABLE
  OC.joinRecipe = 'grindless:photonic_integration/cosmic_mainframe'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadTable() {
    var t = G.readJsonTable(TABLE)
    var problems = []
    var out = []
    Object.keys(t.types || {}).forEach(function (type) {
      var names = {}
      var fridge = type === FRIDGE
      if (!fridge && GTM_TYPES[type] !== true) {
        problems.push(type + ': not a type of this table')
        return
      }
      list(t.types[type].recipes).forEach(function (r) {
        var n = String(r.name || '')
        var eut = Number(r.eut)
        var duration = Number(r.duration)
        var circuit = Number(r.circuit || 0)
        if (!/^[a-z0-9_]+$/.test(n) || names[n] || !(circuit >= 0 && circuit <= 32 && circuit % 1 === 0) || (fridge && circuit !== 0) ||
          !(eut > 0) || eut % 1 !== 0 || !(duration > 0) || duration % 1 !== 0) {
          problems.push(type + '/' + n + ': name, circuit ' + r.circuit + ', eut ' + r.eut + ', duration ' + r.duration)
          return
        }
        var bad = false
        var stack = function (x) {
          var chance = x.chance === undefined ? 10000 : Number(x.chance)
          if (String(x.id || '').indexOf(':') < 0 || !(Number(x.count) >= 1) || !(chance >= 1 && chance <= 10000) || chance % 1 !== 0) bad = true
          return { id: String(x.id), count: Number(x.count), chance: chance }
        }
        var fluid = function (f) {
          if (String(f.id || '').indexOf(':') < 0 || !(Number(f.amount) >= 1)) bad = true
          return { id: String(f.id), amount: Number(f.amount) }
        }
        var rec = { type: type, name: n, circuit: circuit, eut: eut, duration: duration, recipeId: 'grindless:' + type + '/' + n,
          itemsIn: list(r.itemsIn).map(stack), fluidsIn: list(r.fluidsIn).map(fluid), itemsOut: list(r.itemsOut).map(stack), fluidsOut: list(r.fluidsOut).map(fluid) }
        if (bad || rec.itemsIn.length === 0 || (rec.itemsOut.length === 0 && rec.fluidsOut.length === 0) ||
          (fridge && (rec.itemsIn.length !== 1 || rec.itemsOut.length !== 1 || rec.fluidsIn.length > 0 || rec.fluidsOut.length > 0))) {
          problems.push(type + '/' + n + ': contents')
          return
        }
        names[n] = true
        out.push(rec)
      })
    })
    if (out.length === 0) problems.push('no recipe')
    if (problems.length > 0) console.error(LOG + TABLE + ': ' + problems.join('; '))
    return out
  }

  // the refrigerator's own loop (its table, read by its startup script; the same defaults if that is missing)
  function fridgeLoop() {
    var cfg = (G.heliumRefrigerator && G.heliumRefrigerator.config) || {}
    return {
      makeUp: cfg.makeUp || { id: 'gtceu:liquid_helium', amount: 25 },
      precoolIn: cfg.precoolIn || { id: 'gtceu:liquid_nitrogen', amount: 50 },
      precoolOut: cfg.precoolOut || { id: 'gtceu:nitrogen', amount: 50 },
      charge: cfg.charge || { id: 'gtceu:liquid_helium', amount: 4000 }
    }
  }

  function withLoop(rec, loop) {
    if (rec.type !== FRIDGE) return rec
    rec.fluidsIn = [{ id: String(loop.makeUp.id), amount: Number(loop.makeUp.amount) }, { id: String(loop.precoolIn.id), amount: Number(loop.precoolIn.amount) }]
    rec.charge = [{ id: String(loop.charge.id), amount: Number(loop.charge.amount) }]
    rec.fluidsOut = [{ id: String(loop.precoolOut.id), amount: Number(loop.precoolOut.amount) }]
    return rec
  }

  function missingIds(rec) {
    var missing = []
    rec.itemsIn.concat(rec.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    rec.fluidsIn.concat(rec.charge || [], rec.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function sizeProblem(rec) {
    if (rec.type !== FRIDGE) return null
    if (rec.itemsIn.length > FRIDGE_IO.itemsIn) return 'too many item inputs'
    if (rec.fluidsIn.length + rec.charge.length > FRIDGE_IO.fluidsIn) return 'too many fluid inputs'
    if (rec.itemsOut.length > FRIDGE_IO.itemsOut || rec.fluidsOut.length > FRIDGE_IO.fluidsOut) return 'too many outputs'
    return null
  }

  function add(event, rec) {
    // GTM prefixes the type itself: grindless:<name> becomes grindless:<type>/<name>
    var recipe = event.recipes.gtceu[rec.type]('grindless:' + rec.name)
    rec.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (rec.circuit > 0) recipe.circuit(rec.circuit)
    rec.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    ;(rec.charge || []).forEach(function (x) { recipe.notConsumableFluid(Fluid.of(x.id, x.amount)) })
    rec.itemsOut.forEach(function (x) {
      if (x.chance >= 10000) recipe.itemOutputs(x.count + 'x ' + x.id)
      else recipe.chancedOutput(x.count + 'x ' + x.id, x.chance, 0)
    })
    rec.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (rec.type === FRIDGE) recipe.addDataString(FRIDGE_KEY, rec.recipeId)
    recipe.EUt(rec.eut).duration(rec.duration)
  }

  function generate(event) {
    OC.recipes = []
    OC.skipped = []
    OC.fridgeRecipes = []
    var loop = fridgeLoop()
    loadTable().forEach(function (rec) {
      withLoop(rec, loop)
      var missing = missingIds(rec)
      if (missing.length > 0) {
        OC.skipped.push({ name: rec.recipeId, reason: 'unknown id(s): ' + missing.join(', ') })
        console.error(LOG + rec.recipeId + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      var tooBig = sizeProblem(rec)
      if (tooBig !== null) {
        OC.skipped.push({ name: rec.recipeId, reason: tooBig })
        console.error(LOG + rec.recipeId + ' skipped: ' + tooBig)
        return
      }
      try {
        add(event, rec)
      } catch (e) {
        OC.skipped.push({ name: rec.recipeId, reason: 'the builder failed: ' + e })
        console.error(LOG + rec.recipeId + ' skipped, the builder failed: ' + e)
        return
      }
      OC.recipes.push(rec)
      if (rec.type === FRIDGE) OC.fridgeRecipes.push(rec.recipeId)
    })
    console.info(LOG + 'circuit line recipes: ' + OC.recipes.length + '; skipped ' + OC.skipped.length)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      generate(event)
    } catch (e) {
      console.error(LOG + 'circuit line recipes failed: ' + e)
    }
  })
})()
