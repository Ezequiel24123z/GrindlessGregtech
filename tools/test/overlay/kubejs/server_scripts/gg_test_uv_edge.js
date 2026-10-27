// priority: -8824
// TEST ONLY, UV-B5 (the precursor probe bay, the event horizon interferometer, the UHV energy hatch's research).
// Command: kubejs custom_command gg_test_uv_edge   Reserved band: X 27392-27455 (no block is placed: live recipe lookups only).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_uv_edge' -WaitForLog 'GGTEST\|uv_edge\|DONE'
//
// Open question it answers: the re-registered station research on GTM's UHV energy hatch (ZPM-A9 proved it for the UV hatch with a kept
// input; here the research item itself changes): the live hatch recipe keeps its id and inputs, its research condition names the
// Sgr A* image's research, and that research recipe exists at the station. Also: the two rows keep their Pluto orbit condition and the
// bay's 2 A, and only those rows make the heliopause data and the image.
// Markers: GGTEST|uv_edge|<check>|PASS|FAIL|NOTE|<detail>
(function () {
  var NAME = 'uv_edge'
  var REQUEST = 'ggTestUvEdgeRequest'
  var ORBIT = 'grindless:pluto_orbit'
  var IMAGE = 'grindless:sgr_a_star_image'
  var HELIOPAUSE = 'grindless:heliopause_data'
  var HATCH = 'gtceu:assembly_line/energy_hatch_uhv'
  var LOADED = Date.now()
  var DONE = false
  var failed = 0
  var C = null

  function classes() {
    if (C === null) {
      C = {
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        ArrayList: Java.loadClass('java.util.ArrayList'),
        Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function iter(iterable) {
    var out = []
    var it = iterable.iterator()
    while (it.hasNext()) out.push(it.next())
    return out
  }
  function check(name, ok, detail) {
    if (!ok) failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail) }
  function byId(server, id) {
    var found = server.getRecipeManager().byKey(new (classes().RL)(id))
    if (!found.isPresent()) {
      // the recipe builder prefixes the recipe type: grindless:<type>/<type>/<name>
      var m = /^grindless:([a-z_]+)\/(.+)$/.exec(id)
      if (m) found = server.getRecipeManager().byKey(new (classes().RL)('grindless:' + m[1] + '/' + m[1] + '/' + m[2]))
    }
    return found.isPresent() ? found.get() : null
  }
  function itemIds(list) {
    return array(list).map(function (st) { return String(classes().Registries.ITEMS.getKey(st.getItem())) + ':' + Number(st.getCount()) })
  }
  function dimsOf(recipe) {
    return array(recipe.conditions)
      .filter(function (c) { return String(c.getClass().getSimpleName()) === 'DimensionCondition' })
      .map(function (c) { return String(c.getDimension().location()) })
  }
  function circuitsOf(recipe) {
    return array(classes().Helper.getInputItems(recipe))
      .filter(function (st) { return classes().Circuit.isIntegratedCircuit(st) })
      .map(function (st) { return Number(classes().Circuit.getCircuitConfiguration(st)) })
  }
  function euOf(recipe) { return Number(classes().Helper.getRealEUt(recipe).getTotalEU()) }
  // GTM's ResearchCondition holds a ResearchData (an Iterable of ResearchEntry: researchId, dataItem)
  function researchOf(recipe) {
    var out = []
    array(recipe.conditions).forEach(function (c) {
      if (String(c.getClass().getSimpleName()) !== 'ResearchCondition') return
      var data = c.data !== undefined && c.data !== null ? c.data : c.getData()
      iter(data).forEach(function (e) { out.push(String(e.getResearchId())) })
    })
    return out
  }
  function gtRecipes(server) {
    return array(server.getRecipeManager().getRecipes()).filter(function (r) { return String(r.getClass().getSimpleName()) === 'GTRecipe' })
  }

  function run(server) {
    var E = global.grindless && global.grindless.uvEdge
    check('published', E !== undefined && E !== null, E ? 'yes' : 'no')
    if (!E) return
    check('skipped', (E.skipped || []).length === 0, JSON.stringify(E.skipped || []))
    check('clashes', (E.clashes || []).length === 0, JSON.stringify(E.clashes || []))
    ;['gtceu:precursor_probe_bay', 'gtceu:event_horizon_interferometer', 'grindless:precursor_probe'].forEach(function (id) {
      check('registered', Item.exists(id), id)
    })

    ;(E.recipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) { check('live_' + rec.name, false, rec.recipeId + ' is not loaded'); return }
      var dims = dimsOf(live)
      var circuits = circuitsOf(live)
      var eu = euOf(live)
      var want = Number(rec.eut) * Number(rec.amps)
      // element by element: KubeJS's JSON.stringify does not print these arrays as plain JS (the UV-B4 run failed on equal values)
      check('live_' + rec.name, dims.length === 1 && dims[0] == ORBIT && circuits.length === 1 && circuits[0] == 1 && Math.abs(eu - want) < 0.5,
        rec.recipeId + '; dims=' + dims.join(',') + '; circuits=' + circuits.join(',') + '; EU/t=' + eu + ' (want ' + want + ')')
    })
    ;(E.support || []).forEach(function (rec) { check('support_' + rec.name, byId(server, rec.recipeId) !== null, rec.recipeId) })
    Object.keys(E.crafting || {}).forEach(function (k) { check('crafting_' + k, byId(server, E.crafting[k]) !== null, E.crafting[k]) })

    // the UHV energy hatch
    check('hatch_readded', E.hatchError === null || E.hatchError === undefined, String(E.hatchError))
    var all = gtRecipes(server)
    var stations = all.filter(function (r) {
      if (String(r.getId()).indexOf('gtceu:research_station/') !== 0) return false
      try { return itemIds(classes().Helper.getInputItems(r)).some(function (s) { return s.indexOf(IMAGE + ':') === 0 }) } catch (e) { return false }
    })
    check('image_research_recipe', stations.length === 1, stations.map(function (r) { return String(r.getId()) }).join(','))
    var hatch = byId(server, HATCH)
    if (hatch === null) check('hatch_live', false, HATCH + ' is not loaded')
    else {
      var research = researchOf(hatch)
      var ins = itemIds(classes().Helper.getInputItems(hatch))
      check('hatch_research', research.length === 1 && research[0].indexOf('sgr_a_star_image') >= 0, 'research=' + research.join(','))
      if (stations.length === 1) note('image_research_id', String(stations[0].getId()) + '; hatch reads ' + research.join(','))
      var H = E.hatch || {}
      check('hatch_inputs', H.items !== undefined && ins.length === H.items.length && euOf(hatch) === Number(H.eut) &&
        Number(hatch.duration) === Number(H.duration), 'live=' + ins.join(',') + '; EU/t=' + euOf(hatch) + '; duration=' + hatch.duration +
        '; expected ' + JSON.stringify(H.items) + ' ' + H.eut + ' x ' + H.duration)
      note('hatch_old_research', JSON.stringify(E.oldResearch))
    }
    var O = E.oldResearch || {}
    if (O.id) {
      var old = byId(server, String(O.id))
      check('old_research', O.removed ? old === null : true, O.id + (old === null ? ' absent' : ' present') + '; removed=' + O.removed +
        '; found=' + O.found + '; sharedWith=' + JSON.stringify(O.sharedWith))
    }

    // only the two Pluto-orbit rows make the heliopause data and the image
    var makers = {}
    makers[HELIOPAUSE] = []
    makers[IMAGE] = []
    all.forEach(function (r) {
      try {
        itemIds(classes().Helper.getOutputItems(r)).forEach(function (s) {
          Object.keys(makers).forEach(function (id) { if (s.indexOf(id + ':') === 0) makers[id].push(String(r.getId())) })
        })
      } catch (e) { /* a recipe without item outputs */ }
    })
    check('heliopause_only_bay', makers[HELIOPAUSE].length === 1 && /heliopause_data$/.test(makers[HELIOPAUSE][0]), all.length +
      ' GT recipes scanned; makers=' + makers[HELIOPAUSE].join(','))
    check('image_only_interferometer', makers[IMAGE].length === 1 && /sgr_a_star_image$/.test(makers[IMAGE][0]),
      'makers=' + makers[IMAGE].join(','))
    note('orbit_level', server.getLevel(ORBIT) === null ? 'missing' : 'present')
  }

  ServerEvents.customCommand('gg_test_uv_edge', function () {
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
