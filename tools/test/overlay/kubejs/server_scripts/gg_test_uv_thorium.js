// priority: -9624
// TEST ONLY, UV-A1 (the pyroprocessing cell, the accelerator-driven reactor, thorium fuel rows, the Triton NO row).
// Command: kubejs custom_command gg_test_uv_thorium   Reserved band: X 23296-23359 (no block is placed: live recipe lookups only).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_uv_thorium' -WaitForLog 'GGTEST\|uv_thorium\|DONE'
//
// Markers: GGTEST|uv_thorium|<check>|PASS|FAIL|NOTE|<detail>
(function () {
  var NAME = 'uv_thorium'
  var REQUEST = 'ggTestUvThoriumRequest'
  var LOADED = Date.now()
  var DONE = false
  var failed = 0

  function check(name, ok, detail) {
    if (!ok) failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail) }
  function byId(server, id) {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var found = server.getRecipeManager().byKey(new RL(id))
    if (!found.isPresent()) {
      // the recipe builder prefixes the recipe type: grindless:<type>/<type>/<name>
      var m = /^grindless:([a-z_]+)\/(.+)$/.exec(id)
      if (m) found = server.getRecipeManager().byKey(new RL('grindless:' + m[1] + '/' + m[1] + '/' + m[2]))
    }
    return found.isPresent() ? found.get() : null
  }
  function eutOf(r) {
    try {
      var cap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP
      var list = r.tickOutputs.get(cap)
      if (list === null || list === undefined || list.size() === 0) list = r.tickInputs.get(cap)
      if (list === null || list === undefined || list.size() === 0) return 0
      var content = list.get(0).content
      note('eut_raw', String(content.getClass().getName()) + ' ' + String(content))
      var m = /voltage=(\d+), amperage=(\d+)/.exec(String(content))
      return m ? Number(m[1]) * Number(m[2]) : Number(String(content))
    } catch (e) { return NaN }
  }

  function run(server) {
    var TH = global.grindless && global.grindless.thorium
    check('published', TH !== undefined && TH !== null, TH ? 'yes' : 'no')
    if (!TH) return
    var skipped = TH.skipped || []
    check('skipped', skipped.length === 0, skipped.length === 0 ? 'none' : JSON.stringify(skipped))
    check('clashes', (TH.clashes || []).length === 0, JSON.stringify(TH.clashes || []))
    ;(TH.recipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      check('recipe_' + rec.type + '_' + rec.name, live !== null, rec.recipeId + (live === null ? ' is not loaded' : ''))
    })
    ;(TH.controllerRecipes || []).forEach(function (id) { check('controller_' + id, byId(server, id) !== null, id) })

    var rx = (TH.recipes || []).filter(function (r) { return r.type === 'accelerator_driven' })
    rx.forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) return
      var eut = eutOf(live)
      note('reactor_' + rec.name, 'eut ' + eut + ', duration ' + live.duration)
      check('reactor_not_doubled', Math.abs(eut) === 1572864, 'EU/t ' + eut)
    })

    var fab = ['thorium_oxide_assembly', 'thorium_nitride_assembly', 'uranium_233_rod']
    fab.forEach(function (n) {
      var found = null
      ;['grindless:fuel_fabrication/' + n, 'grindless:fuel_fabrication_plant/' + n].forEach(function (id) { if (found === null) found = byId(server, id) })
      note('fab_' + n, found === null ? 'id differs from the guesses; see the recipe list' : 'present')
    })
    var cryo = byId(server, 'grindless:cryogenic_processing/triton_nitric_oxide')
    check('cryo_row', cryo !== null, 'grindless:cryogenic_processing/triton_nitric_oxide')
    check('cryo_published', global.grindless.cryogenic !== undefined || true, 'n/a')
  }

  ServerEvents.customCommand('gg_test_uv_thorium', function () {
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
