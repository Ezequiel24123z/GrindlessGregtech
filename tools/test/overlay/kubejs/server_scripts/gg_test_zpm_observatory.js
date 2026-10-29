// priority: -11024
// TEST ONLY, ZPM-A9 (the neutrino observatory, the deep space network, the Kuiper survey telescope, the UV energy hatch).
// Command: kubejs custom_command gg_test_zpm_observatory   Reserved band: X 21248-21311 (no block is placed: live recipe lookups only).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_zpm_observatory' -WaitForLog 'GGTEST\|zpm_observatory\|DONE'
//
// Markers: GGTEST|zpm_observatory|<check>|PASS|FAIL|NOTE|<detail>
//   skipped / clashes   nothing skipped for an unknown id, no two recipes of a type share a circuit
//   recipe_<name>       every table recipe is live under grindless:<type>/<name>
//   telescope_dimension the telescope recipe carries a dimension condition
//   casing / controllers  the casing's assembler recipe and the three controllers' crafting recipes are live
//   hatch               gtceu:assembly_line/energy_hatch_uv is live: a research condition, the survey among its inputs, the original's output
//   hatch_research      NOTE: the research condition's data item (the original used the data module; the builder default may differ)
(function () {
  var NAME = 'zpm_observatory'
  var REQUEST = 'ggTestZpmObservatoryRequest'
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
      return {
        id: stack === null ? '?' : String(Registries.ITEMS.getKey(stack.getItem())),
        count: ing.getAmount ? Number(ing.getAmount()) : 1,
        chance: Number(c.chance)
      }
    })
  }
  function conditions(r, word) {
    try {
      return array(r.conditions).filter(function (c) { return String(c.getClass().getName()).indexOf(word) >= 0 })
    } catch (e) { return [] }
  }

  function run(server) {
    var OB = global.grindless && global.grindless.zpmObservatory
    check('published', OB !== undefined && OB !== null, 'observatory ' + (OB ? 'yes' : 'no'))
    if (!OB) return
    var skipped = OB.skipped || []
    check('skipped', skipped.length === 0, skipped.length === 0 ? 'none' : JSON.stringify(skipped))
    check('clashes', (OB.clashes || []).length === 0, JSON.stringify(OB.clashes || []))

    ;(OB.recipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      check('recipe_' + rec.name, live !== null, rec.recipeId + (live === null ? ' is not loaded' : ''))
      if (live !== null && rec.orbit) {
        var dims = conditions(live, 'Dimension')
        check('telescope_dimension', dims.length === 1, dims.length + ' dimension condition(s), ' + String(dims.length ? dims[0] : ''))
      }
    })
    var diamond = byId(server, 'grindless:kuiper_survey/kuiper_target_list')
    check('diamond_plate_use', diamond !== null && inputs(diamond).some(function (i) { return i.id === 'grindless:cvd_diamond_plate' }), 'the telescope consumes grindless:cvd_diamond_plate')

    check('casing', byId(server, 'grindless:assembler/photomultiplier_casing') !== null, 'grindless:assembler/photomultiplier_casing')
    ;['neutrino_observatory', 'deep_space_network', 'kuiper_survey_telescope'].forEach(function (m) {
      check('controller_' + m, byId(server, 'grindless:assembly_line/' + m) !== null, 'grindless:assembly_line/' + m)
    })

    var hatch = byId(server, 'gtceu:assembly_line/energy_hatch_uv')
    if (hatch === null) check('hatch', false, 'gtceu:assembly_line/energy_hatch_uv is not loaded (the id was lost)' + (OB.hatchError ? ': ' + OB.hatchError : ''))
    else {
      var ins = inputs(hatch)
      var survey = ins.filter(function (i) { return i.id === 'grindless:solar_core_survey' })
      var research = conditions(hatch, 'Research')
      check('hatch_survey', survey.length === 1, survey.length + ' survey input(s); chance ' + (survey.length ? survey[0].chance : '-'))
      check('hatch_research', research.length === 1, research.length + ' research condition(s)')
      check('hatch_inputs', OB.hatch && ins.length === OB.hatch.items.length + 1, ins.length + ' item inputs, expected ' + (OB.hatch ? OB.hatch.items.length + 1 : '?'))
      note('hatch', ins.map(function (i) { return i.count + 'x ' + i.id }).join(' + '))
      try { note('hatch_research_data', String(research[0].getClass().getName()) + ' ' + String(research[0])) } catch (e) { note('hatch_research_data', 'unreadable: ' + e) }
    }
  }

  ServerEvents.customCommand('gg_test_zpm_observatory', function () {
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
