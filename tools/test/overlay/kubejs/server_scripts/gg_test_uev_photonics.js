// priority: -7699
// Gregtech Grindless - T1 of package UEV-A6 (TEST-ONLY overlay, never shipped): the photonics machines' live recipes.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_uev_photonics' -WaitForLog 'GGTEST\|uev_photonics\|DONE@@900'
//
// Markers: GGTEST|uev_photonics|<check>|PASS|FAIL|NOTE|<detail>
//   registration      the three machines and three recipe types exist
//   loaded            the generator skipped nothing, found no lookup clash and made the three controllers
//   optical_computer  the named doubt: GT--'s own recipe is gone and exactly one live recipe outputs gtnn:optical_computer, ours (hall circuit 3)
//   mainframe         the optical mainframe's recipes are listed (untouched by this package: none of ours outputs or consumes it)
//   only_from         snspd, qd_source and sdd have exactly one live producer each, in their own line
//   arsine            no live recipe of this package outputs gtceu:arsine; the MBE row consumes it
//   older_rows        the MBE (3), foundry (7), zone refining (4, 5), synchrotron (6) and ion implanter (5) rows are live
//   uev_parts         the five UEV parts have an assembler recipe each
// var + function (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'uev_photonics'
  var REQUEST = 'ggTestUevPhotonicsRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var classes = null
  var S = null

  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000) }
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }
  function check(name, ok, detail) { emit(name, ok ? 'PASS' : 'FAIL', detail) }
  function safely(name, fn) {
    try { fn() } catch (e) { check(name, false, 'exception: ' + e) }
  }

  function lazy() {
    if (classes === null) {
      classes = {
        ArrayList: Java.loadClass('java.util.ArrayList'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
      }
    }
    return classes
  }
  function asArray(coll) {
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function rl(id) { return new ResourceLocation(id) }
  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function itemId(st) { return String(lazy().Registries.ITEMS.getKey(st.getItem())) }
  function fluidId(st) { return String(lazy().Registries.FLUIDS.getKey(st.getFluid())) }
  // ids of one side of a recipe, items then fluids; null when the recipe is not a GT recipe
  function ids(recipe, input) {
    var h = lazy().RecipeHelper
    var items = asArray(input ? h.getInputItems(recipe) : h.getOutputItems(recipe)).map(itemId)
    var fluids = asArray(input ? h.getInputFluids(recipe) : h.getOutputFluids(recipe)).map(fluidId)
    return items.concat(fluids)
  }
  function producers(id) {
    var found = []
    asArray(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      var outs = null
      try { outs = ids(r, false) } catch (e) { return }
      if (outs.indexOf(id) >= 0) found.push(String(r.getId()))
    })
    return found
  }

  function staticChecks() {
    var UP = global.grindless.uevPhotonics
    safely('registration', function () {
      var missing = []
      ;['snspd_fabrication', 'vdw_assembly', 'photonic_integration'].forEach(function (t) {
        if (lazy().GTRegistries.RECIPE_TYPES.get(rl('gtceu:' + t)) == null) missing.push(t)
      })
      ;['snspd_foundry', 'vdw_stacker', 'photonic_integration_hall'].forEach(function (m) {
        if (!lazy().Registries.BLOCKS.containsKey(rl('gtceu:' + m))) missing.push(m)
      })
      check('registration', missing.length === 0, missing.length === 0 ? 'ok' : 'missing ' + missing.join(','))
    })
    safely('loaded', function () {
      var skipped = UP.skipped.map(function (s) { return s.name + ': ' + s.reason })
      var ok = UP.skipped.length === 0 && UP.clashes.length === 0 && UP.controllerRecipes.length === 3
      check('loaded', ok, UP.recipes.length + ' recipes; skipped [' + skipped.join('; ') + ']; clashes [' + UP.clashes.join('; ') + ']; controllers ' + UP.controllerRecipes.length)
    })
    safely('optical_computer', function () {
      var found = producers('gtnn:optical_computer')
      var ours = liveRecipe('grindless:photonic_integration/optical_computer')
      var ok = found.length === 1 && found[0] === 'grindless:photonic_integration/optical_computer' && ours !== null
      check('optical_computer', ok, 'live recipes outputting gtnn:optical_computer: ' + found.length + ' [' + found.join(', ') + ']; ours live: ' + (ours !== null))
    })
    safely('mainframe', function () {
      var found = producers('gtnn:optical_mainframe')
      var touched = found.filter(function (id) { return id.indexOf('grindless:photonic_integration/') === 0 })
      check('mainframe', touched.length === 0, 'recipes outputting gtnn:optical_mainframe: ' + found.length + ' [' + found.join(', ') + ']')
    })
    safely('only_from', function () {
      var want = { 'grindless:snspd': 'grindless:snspd_fabrication/cool_and_package', 'grindless:qd_source': 'grindless:assembler/qd_source_mount', 'grindless:sdd': 'grindless:assembler/sdd_metallise' }
      var bad = []
      Object.keys(want).forEach(function (id) {
        var found = producers(id)
        if (found.length !== 1 || found[0] !== want[id]) bad.push(id + ' <- [' + found.join(',') + ']')
      })
      check('only_from', bad.length === 0, bad.length === 0 ? 'one live producer each, in its own line' : bad.join('; '))
    })
    safely('arsine', function () {
      var found = producers('gtceu:arsine')
      var ours = found.filter(function (id) { return UP.recipes.some(function (r) { return id === 'grindless:' + r.type + '/' + r.name }) })
      var mbe = liveRecipe('grindless:molecular_beam_epitaxy/inas_quantum_dots')
      var ok = ours.length === 0 && mbe !== null && ids(mbe, true).indexOf('gtceu:arsine') >= 0 && ids(mbe, false).indexOf('gtceu:arsine') < 0
      check('arsine', ok, 'producers of arsine (not ours) [' + found.join(', ') + ']; ours ' + ours.length + '; MBE row live ' + (mbe !== null))
    })
    safely('older_rows', function () {
      var want = ['grindless:molecular_beam_epitaxy/inas_quantum_dots', 'grindless:photonic_foundry/sin_waveguide_anneal', 'grindless:zone_refining/fz_silicon',
        'grindless:zone_refining/seven_n_indium', 'grindless:synchrotron/sin_waveguide_lithography', 'grindless:ion_implantation/sdd_drift_rings']
      var missing = want.filter(function (id) { return liveRecipe(id) === null })
      check('older_rows', missing.length === 0, missing.length === 0 ? 'all six live' : 'missing ' + missing.join(','))
    })
    safely('uev_parts', function () {
      var bad = []
      ;['uev_sensor', 'uev_emitter', 'uev_electric_pump', 'uev_conveyor_module', 'uev_electric_piston'].forEach(function (n) {
        var r = liveRecipe('grindless:assembler/' + n)
        if (r === null || ids(r, false).indexOf('grindless:' + n) < 0) bad.push(n)
      })
      check('uev_parts', bad.length === 0, bad.length === 0 ? 'five assembler recipes live' : 'missing ' + bad.join(','))
    })
    safely('inputs', function () {
      var casing = liveRecipe('grindless:assembler/photonic_casing')
      var wsi = liveRecipe('grindless:electric_blast_furnace/tungsten_silicide_sinter')
      var ok = casing !== null && ids(casing, false).indexOf('grindless:photonic_casing') >= 0 &&
        wsi !== null && ids(wsi, false).indexOf('gtceu:tungsten_silicide_dust') >= 0
      check('inputs', ok, 'photonic_casing and tungsten_silicide recipes live: ' + ok)
    })
  }

  ServerEvents.tick(function (event) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    S = { server: event.server, finished: false }
    try { staticChecks() } catch (e) { check('run', false, 'exception: ' + e) }
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  })

  ServerEvents.customCommand('gg_test_uev_photonics', function (event) {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
})()
