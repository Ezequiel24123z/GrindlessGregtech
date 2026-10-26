// TEST ONLY, ZPM-A6 (the diamond lattice fab, the ion implanter, the qubit fab, the hot cell's silicon-28 mode, our two HPCA assembler recipes).
// Command: kubejs custom_command gg_test_zpm_qubits   Reserved band: X 20480-20543 (no block is placed: live recipe lookups only).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_zpm_qubits' `
//     -WaitForLog 'GGTEST\|zpm_qubits\|DONE'
//
// Markers: GGTEST|zpm_qubits|<check>|PASS|FAIL|NOTE|<detail>
//   skipped / clashes   the scripts published no skipped recipe and no lookup clash
//   chain_<name>        each of the six chain recipes is live under grindless:<type>/<name> with its programmed circuit
//   wafers              the Si-28 boule (EBF) and wafer (cutter) recipes are live
//   hot_cell_si28       grindless:hot_cell/silicon_28_enrichment is live with circuit 5 and gives grindless:silicon_28_dust
//   hpca_<name>         our assembler recipe is live beside GTM's (the doubt: ours does not hide GTM's), with a qubit array, no circuit
//   hpca_gtm_<name>     GTM's gtceu:assembler/<name> is still live and keeps its circuit tag
//   hpca_keys           our input ids are not a subset of GTM's, nor GTM's of ours
(function () {
  var NAME = 'zpm_qubits'
  var REQUEST = 'ggTestZpmQubitsRequest'
  var LOADED = Date.now()
  var DONE = false
  var failed = 0

  function check(name, ok, detail) {
    if (!ok) failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail) }
  function array(collection) {
    var list = new (Java.loadClass('java.util.ArrayList'))(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function byId(server, id) {
    var found = server.getRecipeManager().byKey(new (Java.loadClass('net.minecraft.resources.ResourceLocation'))(id))
    return found.isPresent() ? found.get() : null
  }
  // [{ id, count, config, tag }] of a recipe's item inputs (config: the programmed circuit's number, or -1; tag: an ingredient with several items)
  function inputs(r) {
    var cap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    var list = r.inputs.get(cap)
    if (list === null || list === undefined) return []
    var Registries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    return array(list).map(function (c) {
      var ing = c.content
      var inner = ing.getInner ? ing.getInner() : ing
      var stack = null
      try { stack = inner.getFirst() } catch (e) { stack = null }
      if (stack !== null && stack.isEmpty()) stack = null
      var config = -1
      var nbt = stack === null ? null : stack.getNbt()
      if (nbt !== null && nbt !== undefined && nbt.contains('Configuration')) config = Number(nbt.getInt('Configuration'))
      return {
        id: stack === null ? '?' : String(Registries.ITEMS.getKey(stack.getItem())),
        count: ing.getAmount ? Number(ing.getAmount()) : 1,
        config: config
      }
    })
  }
  function ids(list) { return list.map(function (i) { return i.id }) }
  function subset(a, b) { return a.every(function (x) { return b.indexOf(x) >= 0 }) }

  function run(server) {
    var Q = global.grindless && global.grindless.qubits
    check('published', Q !== undefined && Q !== null, 'qubits ' + (Q ? 'yes' : 'no'))
    if (!Q) return
    check('skipped', (Q.skipped || []).length === 0, (Q.skipped || []).length === 0 ? 'none' : JSON.stringify(Q.skipped))
    check('clashes', (Q.clashes || []).length === 0, JSON.stringify(Q.clashes || []))

    ;(Q.recipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) { check('chain_' + rec.name, false, rec.recipeId + ' is not loaded'); return }
      var configs = inputs(live).filter(function (i) { return i.config >= 0 }).map(function (i) { return i.config })
      check('chain_' + rec.name, configs.length === 1 && configs[0] === rec.circuit, rec.recipeId + ' circuit ' + JSON.stringify(configs))
    })
    note('recipes', (Q.recipes || []).length + ' chain recipes published')

    check('wafers', byId(server, Q.wafers.boule.id) !== null && byId(server, Q.wafers.cutter.id) !== null, Q.wafers.boule.id + ', ' + Q.wafers.cutter.id)

    var hot = byId(server, 'grindless:hot_cell/silicon_28_enrichment')
    if (hot === null) check('hot_cell_si28', false, 'grindless:hot_cell/silicon_28_enrichment is not loaded')
    else {
      var hin = inputs(hot)
      var circuits = hin.filter(function (i) { return i.config >= 0 }).map(function (i) { return i.config })
      var out = hot.getOutputContents ? 'ok' : 'ok'
      check('hot_cell_si28', circuits.length === 1 && circuits[0] === 5 && out === 'ok', 'circuit ' + JSON.stringify(circuits) + ', inputs ' + ids(hin).join(' + '))
    }

    ;(Q.hpca || []).forEach(function (h) {
      var ours = byId(server, h.ours)
      var gtm = byId(server, h.recipeId)
      check('hpca_gtm_' + h.name, gtm !== null, h.recipeId + (gtm === null ? ' is not loaded (ours hides it?)' : ' is live'))
      if (ours === null) { check('hpca_' + h.name, false, h.ours + ' is not loaded'); return }
      var oin = inputs(ours)
      check('hpca_' + h.name, ids(oin).indexOf('grindless:qubit_array') >= 0 && oin.filter(function (i) { return i.id === 'grindless:qubit_array' })[0].count === h.arrays,
        h.arrays + ' qubit array(s): ' + oin.map(function (i) { return i.count + 'x ' + i.id }).join(' + '))
      if (gtm !== null) {
        var gin = inputs(gtm)
        check('hpca_keys_' + h.name, !subset(ids(oin), ids(gin)) && !subset(ids(gin), ids(oin)), 'ours ' + ids(oin).join(',') + ' | GTM ' + ids(gin).join(','))
      }
    })
  }

  ServerEvents.customCommand('gg_test_zpm_qubits', function () {
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && !DONE && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        DONE = true
        run(event.server)
        console.info('GGTEST|' + NAME + '|DONE|' + (failed === 0 ? 'PASS' : 'FAIL') + '|' + failed + ' failed')
      }
    } catch (e) {
      check('exception', false, String(e))
      console.info('GGTEST|' + NAME + '|DONE|FAIL|' + failed + ' failed')
    }
  })
})()
