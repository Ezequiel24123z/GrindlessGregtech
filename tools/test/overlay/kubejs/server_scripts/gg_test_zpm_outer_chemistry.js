// priority: -11124
// TEST ONLY, ZPM-A8 (the methane pyrolyser, the vent bioreactor, the aerogel works).
// Command: kubejs custom_command gg_test_zpm_outer_chemistry   Reserved band: X 20992-21055 (no block is placed: live recipe lookups only).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -Commands 'kubejs custom_command gg_test_zpm_outer_chemistry' `
//     -WaitForLog 'GGTEST\|zpm_outer_chemistry\|DONE'
//
// Markers: GGTEST|zpm_outer_chemistry|<check>|PASS|FAIL|NOTE|<detail>
//   skipped / clashes   the scripts published no skipped recipe and no lookup clash
//   recipe_<name>       each of the five recipes is live under grindless:<name> with its programmed circuit (none for the aerogel run)
//   controller_<name>   the controller's crafting recipe is live
//   casing_<block>      the casings the patterns name are real blocks
//   mixer_kept          GTM's gtceu:mixer/raw_growth_medium is still live and none of its inputs is ours (the broth is another type)
//   bacteria            the culture recipe is the only recipe of ours with gtceu:bacteria as an input (the cut holds)
(function () {
  var NAME = 'zpm_outer_chemistry'
  var REQUEST = 'ggTestZpmOuterChemistryRequest'
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

  function run(server) {
    var OC = global.grindless && global.grindless.outerChemistry
    check('published', OC !== undefined && OC !== null, 'outerChemistry ' + (OC ? 'yes' : 'no'))
    if (!OC) return
    check('skipped', (OC.skipped || []).length === 0, (OC.skipped || []).length === 0 ? 'none' : JSON.stringify(OC.skipped))
    check('clashes', (OC.clashes || []).length === 0, JSON.stringify(OC.clashes || []))

    ;(OC.recipes || []).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) { check('recipe_' + rec.name, false, rec.recipeId + ' is not loaded'); return }
      var configs = inputs(live).filter(function (i) { return i.config >= 0 }).map(function (i) { return i.config })
      var ok = rec.circuit > 0 ? (configs.length === 1 && configs[0] === rec.circuit) : configs.length === 0
      check('recipe_' + rec.name, ok, rec.recipeId + ' circuit ' + JSON.stringify(configs))
    })
    note('recipes', (OC.recipes || []).length + ' recipes published')

    ;(OC.crafting || []).forEach(function (c) {
      check('controller_' + c.output, byId(server, c.id) !== null, c.id)
    })

    ;['gtceu:heatproof_machine_casing', 'gtceu:plascrete', 'gtceu:stable_machine_casing', 'gtceu:tungstensteel_pipe_casing'].forEach(function (b) {
      check('casing_' + b.substring(6), Item.exists(b), b)
    })

    var mixer = byId(server, 'gtceu:mixer/raw_growth_medium')
    if (mixer === null) check('mixer_kept', false, 'gtceu:mixer/raw_growth_medium is not loaded')
    else {
      var min = ids(inputs(mixer))
      var broth = byId(server, 'grindless:chemosynthesis/growth_medium_broth')
      var bin = broth === null ? [] : ids(inputs(broth))
      check('mixer_kept', broth !== null && min.indexOf('grindless:tholin') < 0 && bin.indexOf('gtceu:meat_dust') < 0, 'GTM mixer ' + min.join(',') + ' | broth ' + bin.join(','))
    }

    var withBacteria = (OC.recipes || []).filter(function (r) {
      return r.fluidsIn.concat(r.notConsumedFluids).some(function (f) { return f.id === 'gtceu:bacteria' })
    }).map(function (r) { return r.name })
    check('bacteria', withBacteria.length === 1 && withBacteria[0] === 'archaeal_culture', JSON.stringify(withBacteria))
  }

  ServerEvents.customCommand('gg_test_zpm_outer_chemistry', function () {
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
