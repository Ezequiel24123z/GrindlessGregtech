// -----------------------------------------------------------------------------------------------
// Recipes of UV's thorium front end (docs/eras/lines-uv-uhv.md, V1 rows 1-8; package D3-TH-FRONT), generated at every server load from
// data/grindless/tables/thorium_refining.json: n-butanol, TBP, the THOREX solvent, dissolution, extraction, strip, oxalate and thoria.
// Recipes are GTM's own types, id grindless:<type>/<name>. Ids: startup_scripts/grindless/uv/thorium_refining.js.
//
// Destinations: the lanthanide nitrate of the extraction -> GTM's rare-earth uses; the raffinate and oxalate-step nitric acid -> back
// into the dissolution; the NO2 -> GTM's nitric acid; thoria -> the fuel fabrication plant (tables/thorium_fabrication.json).
// Lookup safety: a row whose ingredients are a subset of another's of its type can hide it; checked at load (a clash is an error).
// Published for the smoke test: global.grindless.thoriumRefiningRecipes { rows, clashes, problems, loadRows(rows), clashesOf(rows) }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var TR = G.thoriumRefiningRecipes || (G.thoriumRefiningRecipes = {})
  var TABLE = TR.table || 'kubejs/data/grindless/tables/thorium_refining.json'

  function list(x) {
    return Array.isArray(x) ? x : []
  }

  function loadRows(rows) {
    var problems = []
    var out = []
    var names = {}
    rows.forEach(function (r) {
      var n = r.name
      if (!n || names[n]) {
        problems.push('row without a unique name: ' + n)
        return
      }
      names[n] = true
      if (typeof r.type !== 'string' || !(r.eut > 0) || !(r.duration > 0)) {
        problems.push(n + ': needs type, eut and duration')
        return
      }
      if (r.circuit !== 0 && !(r.circuit >= 1 && r.circuit <= 32)) {
        problems.push(n + ': circuit ' + r.circuit + ' outside 0..32')
        return
      }
      if (list(r.fluidsOut).length + list(r.itemsOut).length === 0) {
        problems.push(n + ': no output')
        return
      }
      out.push({
        name: n, type: r.type, circuit: r.circuit || 0, eut: r.eut, duration: r.duration, temp: r.temp || 0,
        itemsIn: list(r.itemsIn), kept: list(r.kept), fluidsIn: list(r.fluidsIn), itemsOut: list(r.itemsOut), fluidsOut: list(r.fluidsOut)
      })
    })
    TR.problems = (TR.problems || []).concat(problems)
    if (problems.length > 0) console.error(LOG + 'thorium refining: ' + problems.join('; '))
    return out
  }

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.kept.forEach(function (x) { keys['k:' + x.id] = true })
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    keys['circuit:' + r.circuit] = true
    return keys
  }

  function clashesOf(rows) {
    var out = []
    var keys = rows.map(keysOf)
    function subset(a, b) {
      return Object.keys(a).every(function (k) { return b[k] === true })
    }
    for (var i = 0; i < rows.length; i++) {
      for (var j = i + 1; j < rows.length; j++) {
        if (rows[i].type !== rows[j].type) continue
        if (subset(keys[i], keys[j]) || subset(keys[j], keys[i])) out.push(rows[i].name + ' / ' + rows[j].name)
      }
    }
    return out
  }

  TR.loadRows = loadRows
  TR.clashesOf = clashesOf
  TR.problems = []
  TR.rows = loadRows(list(G.readJsonTable(TABLE).rows)).map(function (r) {
    r.recipeId = 'grindless:' + r.type + '/' + r.name
    return r
  })
  TR.clashes = clashesOf(TR.rows)
  if (TR.clashes.length > 0) console.error(LOG + 'thorium refining: rows whose ingredients are a subset of another\'s: ' + TR.clashes.join('; '))

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error(LOG + 'thorium refining recipes failed: ' + e)
    }
  })

  function addRecipes(event) {
    var added = 0
    TR.rows.forEach(function (r) {
      var missing = r.itemsIn.concat(r.kept, r.itemsOut).filter(function (x) { return !Item.exists(x.id) }).map(function (x) { return x.id })
        .concat(r.fluidsIn.concat(r.fluidsOut).filter(function (f) { return !Fluid.exists(f.id) }).map(function (f) { return f.id }))
      if (missing.length > 0) {
        console.error(LOG + 'thorium refining row ' + r.name + ' skipped, unknown id(s): ' + missing.join(', '))
        return
      }
      added++
      var recipe = event.recipes.gtceu[r.type](r.recipeId)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.kept.forEach(function (x) { recipe.notConsumable(x.count + 'x ' + x.id) })
      if (r.circuit > 0) recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.EUt(r.eut).duration(r.duration)
      if (r.temp > 0) recipe.blastFurnaceTemp(r.temp)
    })
    console.info(LOG + 'thorium refining recipes added: ' + added)
  }
})()
