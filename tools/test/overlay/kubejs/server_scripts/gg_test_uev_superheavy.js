// Gregtech Grindless - T1 of package UEV-A2 (TEST-ONLY overlay, never shipped): the superheavy machines' live recipes.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_uev_superheavy' -WaitForLog 'GGTEST\|uev_superheavy\|DONE@@900'
//
// Markers: GGTEST|uev_superheavy|<check>|PASS|FAIL|NOTE|<detail>
//   registration      the three machines and three recipe types exist
//   chamber_kept      the cyclotron's helium charge and the Nb3Sn cavity are in the live recipes with chance 0 (GTM does not consume
//                     a chance-0 input: it is the non-consumed input of the design), every other input has its full chance
//   only_from         tennessine_sample and superheavy_census have exactly one live producer, in gtceu:superheavy_chemistry
//   decay_chain       hot cell: Cf-252 -> Cm-248 dust and Bk-249 -> Cf-249 dust, and both dusts are inputs of a live cyclotron recipe
//   wheel_tritium     the activated wheel returns to the hot cell as the blank, and tritium goes to helium-3
//   xenon_row         the cryogenic plant's xenon row is live
// var + function (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'uev_superheavy'
  var REQUEST = 'ggTestUevSuperheavyRequest'
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
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
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

  // [{ id, chance, maxChance }] of one side of a recipe, items then fluids
  function contents(recipe, input) {
    var c = lazy()
    var out = []
    var ic = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var is = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    is.forEach(function (st, i) { out.push({ id: itemId(st), chance: Number(ic[i].chance), maxChance: Number(ic[i].maxChance) }) })
    var fc = asArray(input ? recipe.getInputContents(c.FluidCap) : recipe.getOutputContents(c.FluidCap))
    var fs = asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe))
    fs.forEach(function (st, i) { out.push({ id: fluidId(st), chance: Number(fc[i].chance), maxChance: Number(fc[i].maxChance) }) })
    return out
  }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]
    return null
  }

  function staticChecks() {
    safely('registration', function () {
      var missing = []
      ;['heavy_ion_irradiation', 'recoil_separation', 'superheavy_chemistry'].forEach(function (t) {
        if (lazy().GTRegistries.RECIPE_TYPES.get(rl('gtceu:' + t)) == null) missing.push(t)
      })
      ;['heavy_ion_cyclotron', 'recoil_separator', 'superheavy_chemistry_lab'].forEach(function (m) {
        if (!lazy().Registries.BLOCKS.containsKey(rl('gtceu:' + m))) missing.push(m)
      })
      check('registration', missing.length === 0, missing.length === 0 ? 'ok' : 'missing ' + missing.join(','))
    })
    safely('chamber_kept', function () {
      var bad = []
      ;['flerovium', 'livermorium', 'tennessine', 'oganesson', 'moscovium', 'ion_track'].forEach(function (n) {
        var r = liveRecipe('grindless:heavy_ion_irradiation/' + n)
        if (r === null) { bad.push(n + ' missing'); return }
        var ins = contents(r, true)
        var cav = find(ins, 'grindless:nb3sn_srf_cavity')
        if (cav === null || cav.chance !== 0) bad.push(n + ' cavity not chance 0')
        if (n !== 'ion_track') {
          var he = find(ins, 'gtceu:helium')
          if (he === null || he.chance !== 0) bad.push(n + ' helium not chance 0')
        }
        ins.forEach(function (x) {
          if (x.id !== 'gtceu:programmed_circuit' && x.id !== 'grindless:nb3sn_srf_cavity' && !(x.id === 'gtceu:helium' && n !== 'ion_track') && x.chance !== x.maxChance) bad.push(n + ' ' + x.id + ' not fully consumed')
        })
      })
      check('chamber_kept', bad.length === 0, bad.length === 0 ? 'cavity and helium chamber are chance 0 in all six rows' : bad.join('; '))
    })
    safely('only_from', function () {
      var rs = asArray(S.server.getRecipeManager().getRecipes())
      var bad = []
      ;['grindless:tennessine_sample', 'grindless:superheavy_census'].forEach(function (id) {
        var found = []
        rs.forEach(function (r) {
          var outs = null
          try { outs = contents(r, false) } catch (e) { return }
          if (find(outs, id) !== null) found.push(String(r.getId()))
        })
        if (found.length !== 1 || found[0].indexOf('grindless:superheavy_chemistry/') !== 0) bad.push(id + ' <- ' + found.join(','))
      })
      check('only_from', bad.length === 0, bad.length === 0 ? 'one producer each, in superheavy_chemistry' : bad.join('; '))
    })
    safely('decay_chain', function () {
      var cm = liveRecipe('grindless:hot_cell/californium_252_store')
      var cf = liveRecipe('grindless:hot_cell/berkelium_249_store')
      var ok = cm !== null && cf !== null && find(contents(cm, false), 'gtceu:curium_248_dust') !== null &&
        find(contents(cf, false), 'gtceu:californium_249_dust') !== null
      var cyc2 = liveRecipe('grindless:heavy_ion_irradiation/livermorium')
      var cyc4 = liveRecipe('grindless:heavy_ion_irradiation/oganesson')
      ok = ok && cyc2 !== null && cyc4 !== null && find(contents(cyc2, true), 'gtceu:curium_248_dust') !== null &&
        find(contents(cyc4, true), 'gtceu:californium_249_dust') !== null
      check('decay_chain', ok, 'Cf-252 -> Cm-248 -> cyclotron c2; Bk-249 -> Cf-249 -> cyclotron c4')
    })
    safely('wheel_tritium', function () {
      var w = liveRecipe('grindless:hot_cell/target_wheel_return')
      var t = liveRecipe('grindless:hot_cell/tritium_store')
      var ok = w !== null && t !== null && find(contents(w, true), 'grindless:activated_target_wheel') !== null &&
        find(contents(w, false), 'grindless:target_wheel_blank') !== null && find(contents(t, true), 'gtceu:tritium') !== null &&
        find(contents(t, false), 'gtceu:helium_3') !== null
      check('wheel_tritium', ok, 'activated wheel -> blank; tritium -> helium-3')
    })
    safely('xenon_row', function () {
      var r = liveRecipe('grindless:cryogenic_processing/xenon_cut')
      check('xenon_row', r !== null && find(contents(r, false), 'gtceu:xenon') !== null, r === null ? 'missing' : 'ok')
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

  ServerEvents.customCommand('gg_test_uev_superheavy', function (event) {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
})()
