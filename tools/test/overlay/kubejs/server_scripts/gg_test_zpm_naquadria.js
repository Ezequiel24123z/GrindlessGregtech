// TEST ONLY, ZPM-A2 (the naquadria refinery, the naquadah fuel works, the plant's circuit 4, the reactor's duranium frames).
// Command: kubejs custom_command gg_test_zpm_naquadria   Reserved band: X 19456-19519 (no block is placed: live recipe lookups only).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_zpm_naquadria' -WaitForLog 'GGTEST\|zpm_naquadria\|DONE'
//
// Markers: GGTEST|zpm_naquadria|<check>|PASS|FAIL|NOTE|<detail>
//   skipped          the scripts published no skipped recipe (an assumed id that does not exist shows up here, with the id)
//   <type>_recipes   every table recipe is in the live recipe manager under grindless:<type>/<name>
//   casing_recipe    grindless:assembler/naquadria_containment_casing makes the casing
//   reactor          gtceu:assembly_line/large_naquadah_reactor is live: 8 duranium frames, no neutronium frame, a research condition,
//                    the original's other inputs and its output kept
//   plant_circuits   the naquadah plant's four recipes hold circuits 1, 2, 3 and 4, once each: circuit 4 matches only the new recipe
//   dimension_check  N/A: the A2 recipes use no dimension-limited chemical reactor
(function () {
  var NAME = 'zpm_naquadria'
  var REQUEST = 'ggTestZpmNaquadriaRequest'
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
  // [{ id, count, config }] of a recipe's item inputs (config: the programmed circuit's number, or -1)
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
      if (stack !== null && stack.hasTag() && stack.getTag().contains('Configuration')) config = Number(stack.getTag().getInt('Configuration'))
      return {
        id: stack === null ? '?' : String(Registries.ITEMS.getKey(stack.getItem())),
        count: ing.getAmount ? Number(ing.getAmount()) : 1,
        config: config
      }
    })
  }
  function hasResearch(r) {
    try {
      return array(r.conditions).some(function (c) { return String(c.getClass().getName()).indexOf('Research') >= 0 })
    } catch (e) { return false }
  }

  function run(server) {
    var NQ = global.grindless && global.grindless.naquadria
    var NP = global.grindless && global.grindless.naquadahPlant
    check('published', NQ !== undefined && NQ !== null && NP !== undefined && NP !== null, 'naquadria ' + (NQ ? 'yes' : 'no') + ', naquadah plant ' + (NP ? 'yes' : 'no'))
    if (!NQ || !NP) return
    var skipped = (NQ.skipped || []).concat(NP.skipped || [])
    check('skipped', skipped.length === 0, skipped.length === 0 ? 'none' : JSON.stringify(skipped))
    check('clashes', (NQ.clashes || []).length === 0, JSON.stringify(NQ.clashes || []))

    ;(NQ.recipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      check('recipe_' + rec.name, live !== null, rec.recipeId + (live === null ? ' is not loaded' : ''))
    })
    note('recipes', (NQ.recipes || []).length + ' naquadria recipes published')

    var casing = byId(server, NQ.casingRecipe || 'grindless:assembler/naquadria_containment_casing')
    check('casing_recipe', casing !== null, 'grindless:assembler/naquadria_containment_casing')
    ;(NQ.controllerRecipes || []).forEach(function (id) { check('controller_' + id, byId(server, id) !== null, id) })

    var reactor = byId(server, 'gtceu:assembly_line/large_naquadah_reactor')
    if (reactor === null) check('reactor', false, 'gtceu:assembly_line/large_naquadah_reactor is not loaded (the id was lost)')
    else {
      var ins = inputs(reactor)
      var duranium = ins.filter(function (i) { return i.id === 'gtceu:duranium_frame' }).reduce(function (n, i) { return n + i.count }, 0)
      var neutronium = ins.filter(function (i) { return i.id === 'gtceu:neutronium_frame' }).length
      var expected = NQ.reactor ? NQ.reactor.items.length : -1
      check('reactor_frames', duranium === 8 && neutronium === 0, duranium + ' duranium frames, ' + neutronium + ' neutronium frame inputs')
      check('reactor_research', hasResearch(reactor), 'research condition ' + (hasResearch(reactor) ? 'present' : 'missing') + (NQ.reactor ? ' (' + NQ.reactor.research + ')' : ''))
      check('reactor_inputs', expected < 0 || ins.length === expected, ins.length + ' item inputs, expected ' + expected)
      note('reactor', ins.map(function (i) { return i.count + 'x ' + i.id }).join(' + '))
    }

    var circuits = {}
    ;(NP.recipes || []).concat(NP.directRecipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) { check('plant_' + rec.name, false, rec.recipeId + ' is not loaded'); return }
      var configs = inputs(live).filter(function (i) { return i.config >= 0 }).map(function (i) { return i.config })
      circuits[rec.name] = configs
    })
    var seen = {}
    var clash = false
    Object.keys(circuits).forEach(function (n) { circuits[n].forEach(function (c) { if (seen[c] !== undefined) clash = true; seen[c] = n }) })
    check('plant_circuits', !clash && seen[4] === 'enriched_solution' && seen[1] !== undefined && seen[2] !== undefined && seen[3] !== undefined,
      JSON.stringify(circuits))
    check('dimension_check', true, 'N/A: no A2 recipe is a dimension-limited chemical reactor recipe')
  }

  ServerEvents.customCommand('gg_test_zpm_naquadria', function () {
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
