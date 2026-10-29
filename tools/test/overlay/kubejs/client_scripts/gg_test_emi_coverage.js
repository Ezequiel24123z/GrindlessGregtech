// priority: 12600
// Gregtech Grindless - EMI coverage, client half (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the
// pack). No world band, clicks or placement; the optional named render proof only opens and restores a screen. Once EMI loads it asks
// EMI's recipe manager (EmiApi) for the
// recipes and uses of every item, block item, fluid and machine the pack registers, against the static audit's expectations in
// kubejs/config/gg_test_emi_coverage_expect.json (written by `node tools/analysis/emi-coverage.mjs --expect`; the Node suite fails when
// it is stale).
//
// Two ways to run it:
//   standalone   kubejs/config/gg_test_emi_coverage.json = {"enabled": true} (the default);
//                keeps mc-runtime-test in the world until the mandatory audit is done.
//   integrated   a serial dispatcher (like gg_test_v071_integration.js) adds the stage ['emi_coverage', 'ggEmiCoverage',
//                'ggTestEmiCoverageStart']: the server half's hook arms this script through global.ggEmiCoverage and marks serverDone; this
//                half sets clientDone (and failed) when it is through, and stops on the dispatcher's `cancel`. The dispatcher holds the
//                client meanwhile. No individual marker is needed.
//
// GGTEST|emi_coverage|<check>|PASS|FAIL|NOTE:
//   emi_loaded     EMI finished loading
//   expectations   NOTE: the expectation file (items, pages, legacy items)
//   registry       every grindless: item of the game is audited (or a legacy item), and every audited id exists
//   acquisition    every audited item, block and fluid has at least one EMI recipe or page that makes it
//   use            every one that is not an end product (machines, tools) has at least one EMI recipe or page that uses it
//   routes         every route the audit expects shows in its EMI category (GT categories, crafting, EMI info)
//   plugins, workstations, processes, previews: hard failures against the live GTM and EMI registries. A machine EMI disables
//                  (exp.disabledTags, grindless:hidden_with_recipes) is exempt; a multiblock whose definition turns its preview off
//                  (renderXEIPreview false) is listed, not failed.
//   preview_routes NOTE: the blocks the audit expects in GTM's multiblock previews that EMI does not list (the audit's model of the
//                  preview, BlockPattern#getPreview; those blocks also have pages)
//   pages          our info pages are in EMI (emi:/generated/recipe/additions/grindless/...)
//   machine_info   every machine of ours that is not hidden has a what-it-does page
//   known          NOTE: workstations, previews, use, routes and machine_info gaps listed in exp.known
//                  (tools/analysis/emi_runtime_known.json) do not fail; this line counts them and lists the fixed ones (a ratchet:
//                  only new gaps fail, and the list only shrinks)
//   legacy         the old items kept for saves are out of EMI's index and keep their conversion recipe
//   all            the verdict; then DONE
// The details go to kubejs/exported/gg_emi_coverage_report.json (per item: the EMI categories that make and use it).
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var MARKER = 'kubejs/config/gg_test_emi_coverage.json'
  var EXPECT = 'kubejs/config/gg_test_emi_coverage_expect.json'
  var REPORT = 'kubejs/exported/gg_emi_coverage_report.json'
  var PAGE_PREFIX = 'emi:/generated/recipe/additions/grindless/'
  var T = 'GGTEST|emi_coverage|'
  var HOLD_MAX_MS = 8 * 60 * 1000
  var MAX_LISTED = 30
  var c = { standalone: null, since: 0, done: false, ageField: null, waitedLog: 0, renderPreview: false, preview: null, report: null }

  function log(check, status, detail) {
    var line = T + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
    console.info(line)
  }

  // the pack's own way to read a JSON table into plain JS values (startup_scripts/grindless/lib/tables.js)
  function readJson(path) {
    try {
      var j = JsonIO.readJson(path)
      if (j === null || j === undefined) return null
      return JSON.parse(String(JsonIO.toPrettyString(j)))
    } catch (e) {
      return null
    }
  }

  function standalone() {
    if (c.standalone === null) {
      var m = readJson(MARKER)
      c.standalone = m !== null && String(m.enabled) === 'true'
      c.renderPreview = m !== null && String(m.renderPreview) === 'true'
      if (m !== null && m.holdTimeoutSec !== undefined) {
        var hold = Number(m.holdTimeoutSec)
        if (hold < 1 || hold > 1800 || Math.floor(hold) !== hold) throw new Error('holdTimeoutSec must be an integer between 1 and 1800')
        HOLD_MAX_MS = hold * 1000
      }
    }
    return c.standalone
  }

  function shared() {
    return global.ggEmiCoverage ? global.ggEmiCoverage : null
  }

  // values in global come back wrapped (KubeJS's global is a Java map): compare their text
  function requested() {
    var S = shared()
    return S !== null && String(S.get('requested')) === 'true'
  }

  function listed(list) {
    return list.slice(0, MAX_LISTED).join(', ') + (list.length > MAX_LISTED ? ' (+' + (list.length - MAX_LISTED) + ' more)' : '')
  }

  // mc-runtime-test reads Entity#tickCount; KubeJS calls it `age`
  function windBack(p) {
    if (c.ageField === null) {
      var names = ['age', 'tickCount', 'f_19797_']
      c.ageField = ''
      for (var i = 0; i < names.length; i++) {
        var v = p[names[i]]
        if (v !== undefined && v !== null && typeof v !== 'function') {
          c.ageField = names[i]
          break
        }
      }
      if (c.ageField === '') throw new Error('cannot hold the test player: no accessible age field')
    }
    if (c.ageField !== '' && Number(p[c.ageField]) >= 80) p[c.ageField] = 20
  }

  // the GT categories, crafting, EMI's pages and GTM's multiblock info have known ids; other mods' categories are only reported
  function checkable(cat) {
    return cat.indexOf('gtceu:') === 0 || cat.indexOf('emi:') === 0 || cat === 'minecraft:crafting'
  }

  function check() {
    var exp = readJson(EXPECT)
    if (exp === null || !exp.items) {
      log('expectations', 'FAIL', 'cannot read ' + EXPECT + ' (node tools/analysis/emi-coverage.mjs --expect writes it)')
      return false
    }
    var hidden = exp.hidden || []
    // known runtime gaps (tools/analysis/emi_runtime_known.json, through --expect): a listed gap is a NOTE, a new one FAILs
    var known = exp.known || {}
    var knownOpen = []
    var knownFixed = []
    var ratchet = function (kind, list, keyOf) {
      var listedKeys = known[kind] || []
      var keys = list.map(function (x) { return keyOf ? keyOf(x) : x })
      var fresh = list.filter(function (x, i) { return listedKeys.indexOf(keys[i]) < 0 })
      keys.forEach(function (k) { if (listedKeys.indexOf(k) >= 0) knownOpen.push(kind + ' ' + k) })
      listedKeys.forEach(function (k) { if (keys.indexOf(k) < 0) knownFixed.push(kind + ' ' + k) })
      return fresh
    }
    var machineOf = function (w) { return String(w).split(':').slice(0, 2).join(':').trim() }
    log('expectations', 'NOTE', exp.items.length + ' audited, ' + exp.pages.length + ' pages, ' + exp.legacy.length + ' legacy, ' + hidden.length +
      ' disabled until their era (' + exp.format + ')')

    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var ItemEmiStack = Java.loadClass('dev.emi.emi.api.stack.ItemEmiStack')
    var FluidEmiStack = Java.loadClass('dev.emi.emi.api.stack.FluidEmiStack')
    var EmiApi = Java.loadClass('dev.emi.emi.api.EmiApi')
    var EmiStackList = Java.loadClass('dev.emi.emi.registry.EmiStackList')
    var ArrayList = Java.loadClass('java.util.ArrayList')
    // EMI hands out JDK immutable lists (ImmutableCollections$ListN); Rhino cannot call their methods (module access): copy them
    var jlist = function (x) { return new ArrayList(x) }
    var rm = EmiApi.getRecipeManager()
    var ok = true

    // 1) registry
    var audited = {}
    exp.items.forEach(function (e) { audited[e.kind + ':' + e.id] = true })
    exp.legacy.forEach(function (l) { audited['item:' + l.id] = true })
    hidden.forEach(function (id) { audited[(id.indexOf('fluid:') === 0 ? '' : 'item:') + id] = true })
    var unaudited = []
    var keys = jlist(BI.ITEM.keySet())
    for (var i = 0; i < keys.size(); i++) {
      var key = String(keys.get(i))
      if (key.indexOf('grindless:') === 0 && audited['item:' + key] !== true) unaudited.push(key)
    }
    var fluidKeys = jlist(BI.FLUID.keySet())
    for (var fi = 0; fi < fluidKeys.size(); fi++) {
      var fluidKey = String(fluidKeys.get(fi))
      if (fluidKey.indexOf('grindless:') === 0 && audited['fluid:' + fluidKey] !== true) unaudited.push('fluid:' + fluidKey)
    }
    var unknown = exp.items.filter(function (e) {
      return !(e.kind === 'fluid' ? BI.FLUID.containsKey(new RL(e.id)) : BI.ITEM.containsKey(new RL(e.id)))
    }).map(function (e) { return e.id })
    var regOk = unaudited.length === 0 && unknown.length === 0
    ok = ok && regOk
    log('registry', regOk ? 'PASS' : 'FAIL', 'grindless items not audited: ' + (listed(unaudited) || 'none') + '; audited ids not registered: ' + (listed(unknown) || 'none') +
      (regOk ? '' : ' (regenerate the expectations with node tools/analysis/emi-coverage.mjs --expect)'))

    // EMI catches plugin exceptions and still declares itself loaded: loaded alone is not a verdict.
    var warnings = jlist(Java.loadClass('dev.emi.emi.runtime.EmiReloadLog').warnings)
    var pluginErrors = []
    for (var w = 0; w < warnings.size(); w++) {
      var warning = String(warnings.get(w))
      if (/exception|critical error|recipe loss|illegally self-mutated/i.test(warning)) pluginErrors.push(warning)
    }
    // The harness checks raw log exceptions too: JEMI's per-recipe catches do not enter this warning list.
    ok = ok && pluginErrors.length === 0
    log('plugins', pluginErrors.length ? 'FAIL' : 'PASS', pluginErrors.length ? listed(pluginErrors) : 'no reload exceptions or recipe-loss warnings')

    var categories = {}
    var stations = {}
    var liveCategories = jlist(rm.getCategories())
    for (var ci = 0; ci < liveCategories.size(); ci++) {
      var category = liveCategories.get(ci)
      var categoryId = String(category.getId())
      categories[categoryId] = { displays: jlist(rm['getRecipes(dev.emi.emi.api.recipe.EmiRecipeCategory)'](category)).size() }
      stations[categoryId] = {}
      var workstations = jlist(rm.getWorkstations(category))
      for (var wi = 0; wi < workstations.size(); wi++) {
        var alternatives = jlist(workstations.get(wi).getEmiStacks())
        for (var ai = 0; ai < alternatives.size(); ai++) stations[categoryId][String(alternatives.get(ai).getId())] = true
      }
    }
    var GTR = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    var MBD = Java.loadClass('com.gregtechceu.gtceu.api.machine.MultiblockMachineDefinition')
    // every machine in a tag EMI disables (grindless:hidden_with_recipes: ours and the addons' we hide) drops its workstations and
    // preview with it, on purpose
    var disabledMachine = {}
    var tagErrors = []
    ;(exp.disabledTags || []).forEach(function (tag) {
      try {
        var ids = jlist(Ingredient.of('#' + tag).getItemIds())
        for (var di = 0; di < ids.size(); di++) disabledMachine[String(ids.get(di))] = true
      } catch (e) {
        tagErrors.push(tag + ': ' + e)
      }
    })
    if (tagErrors.length) {
      ok = false
      log('disabled_tags', 'FAIL', 'cannot read ' + tagErrors.join('; '))
    }
    var machines = jlist(GTR.MACHINES.values())
    var machineReport = []
    var workstationMissing = []
    var previewsMissing = []
    var previewsOff = []
    for (var mi = 0; mi < machines.size(); mi++) {
      var definition = machines.get(mi)
      var machineId = String(definition.getId())
      var machineHidden = hidden.indexOf(machineId) >= 0 || disabledMachine[machineId] === true
      var expectedCategories = []
      var missingCategories = []
      var types = definition.getRecipeTypes()
      for (var ti = 0; ti < types.length; ti++) {
        var typeCategories = jlist(types[ti].getCategories())
        for (var tci = 0; tci < typeCategories.size(); tci++) {
          var tc = typeCategories.get(tci)
          // Respect GTM's intentional non-XEI categories; its furnace uses vanilla smelting.
          if (!tc.isXEIVisible()) continue
          var catId = String(tc.registryKey)
          if (catId === 'gtceu:electric_furnace') catId = 'minecraft:smelting'
          if (expectedCategories.indexOf(catId) < 0) expectedCategories.push(catId)
          if (!machineHidden && (!stations[catId] || stations[catId][machineId] !== true)) missingCategories.push(catId)
        }
      }
      var multiblock = definition instanceof MBD
      var preview = !multiblock ? null : rm.getRecipe(new RL(machineId))
      var hasPreview = preview !== null && String(preview.getCategory().getId()) === 'gtceu:multiblock_info'
      // GTM's EMI preview category skips a definition whose renderXEIPreview is off (MultiblockInfoEmiCategory#registerDisplays)
      var xeiPreview = null
      if (multiblock) {
        try { xeiPreview = definition.isRenderXEIPreview() === true } catch (e) { xeiPreview = null }
      }
      if (multiblock && !machineHidden && !hasPreview) (xeiPreview === false ? previewsOff : previewsMissing).push(machineId)
      if (missingCategories.length) workstationMissing.push(machineId + ': ' + missingCategories.join(', '))
      machineReport.push({ id: machineId, tier: Number(definition.getTier()), hidden: machineHidden, categories: expectedCategories,
        missingCategories: missingCategories, multiblock: multiblock, preview: multiblock ? hasPreview : null, xeiPreview: xeiPreview })
    }
    var processReport = []
    var processesMissing = []
    var nativeCategories = jlist(GTR.RECIPE_CATEGORIES.values())
    for (var nci = 0; nci < nativeCategories.size(); nci++) {
      var nc = nativeCategories.get(nci)
      if (!nc.shouldRegisterDisplays()) continue
      var nativeCount = jlist(nc.getRecipeType().getRecipesInCategory(nc)).size()
      var ncid = String(nc.registryKey)
      var displayCount = categories[ncid] ? categories[ncid].displays : 0
      var users = machineReport.filter(function (m) { return m.categories.indexOf(ncid) >= 0 })
      var processHidden = users.length > 0 && users.every(function (m) { return m.hidden })
      if (!processHidden && nativeCount > 0 && displayCount === 0) processesMissing.push(ncid)
      processReport.push({ id: ncid, type: String(nc.getRecipeType().registryName), recipes: nativeCount, displays: displayCount, hidden: processHidden })
    }
    var workstationNew = ratchet('workstations', workstationMissing, machineOf)
    var previewsNew = ratchet('previews', previewsMissing)
    ok = ok && workstationNew.length === 0 && previewsNew.length === 0 && processesMissing.length === 0
    log('workstations', workstationNew.length ? 'FAIL' : 'PASS', machines.size() + ' machines; missing: ' + (listed(workstationNew) || 'none') +
      (workstationMissing.length > workstationNew.length ? ' (+' + (workstationMissing.length - workstationNew.length) + ' known)' : ''))
    log('processes', processesMissing.length ? 'FAIL' : 'PASS', processReport.length + ' GT categories; no displays: ' + (listed(processesMissing) || 'none'))
    log('previews', previewsNew.length ? 'FAIL' : 'PASS', 'multiblocks without preview: ' + (listed(previewsNew) || 'none') +
      (previewsMissing.length > previewsNew.length ? ' (+' + (previewsMissing.length - previewsNew.length) + ' known)' : '') +
      (previewsOff.length ? '; preview off by definition (renderXEIPreview false): ' + listed(previewsOff) : ''))

    // 2) every audited stack
    var categoriesOf = function (recipes) {
      var out = []
      for (var k = 0; k < recipes.size(); k++) {
        var cat = String(recipes.get(k).getCategory().getId())
        if (out.indexOf(cat) < 0) out.push(cat)
      }
      return out
    }
    var noMade = []
    var noUse = []
    var routeMissing = []
    var previewMissing = []
    var report = []
    // a missing GTM multiblock preview route only says the audit's model of the preview is off (the blocks also have pages): a NOTE
    var miss = function (id, verb, cat) {
      if (cat === 'gtceu:multiblock_info') previewMissing.push(id + ' ' + verb)
      else routeMissing.push(id + ' ' + verb + ' in ' + cat)
    }
    exp.items.forEach(function (e) {
      if (unknown.indexOf(e.id) >= 0) return
      // the constructors, not EmiStack.of: Rhino finds of(ItemStack) and of(ItemLike) equally good for a KubeJS item stack
      var stack = e.kind === 'fluid' ? new FluidEmiStack(BI.FLUID.get(new RL(e.id))) : new ItemEmiStack(Item.of(e.id))
      var made = jlist(rm.getRecipesByOutput(stack))
      var used = jlist(rm.getRecipesByInput(stack))
      var madeIn = categoriesOf(made)
      var usedIn = categoriesOf(used)
      if (e.needMade && made.size() === 0) noMade.push(e.id)
      if (e.needUse && used.size() === 0) noUse.push(e.id)
      e.made.filter(checkable).forEach(function (cat) { if (madeIn.indexOf(cat) < 0) miss(e.id, 'made', cat) })
      e.used.filter(checkable).forEach(function (cat) { if (usedIn.indexOf(cat) < 0) miss(e.id, 'used', cat) })
      report.push({ id: e.id, kind: e.kind, made: made.size(), used: used.size(), madeIn: madeIn, usedIn: usedIn, expectedMade: e.made, expectedUsed: e.used })
    })
    var needUse = exp.items.filter(function (e) { return e.needUse }).length
    var noUseNew = ratchet('noUse', noUse)
    var routeNew = ratchet('routes', routeMissing)
    ok = ok && noMade.length === 0 && noUseNew.length === 0 && routeNew.length === 0
    log('acquisition', noMade.length === 0 ? 'PASS' : 'FAIL', (exp.items.length - noMade.length) + ' of ' + exp.items.length + ' have a recipe or page that makes them' +
      (noMade.length ? '; none for: ' + listed(noMade) : ''))
    log('use', noUseNew.length === 0 ? 'PASS' : 'FAIL', (needUse - noUse.length) + ' of ' + needUse + ' intermediates have a recipe or page that uses them' +
      (noUseNew.length ? '; none for: ' + listed(noUseNew) : '') + (noUse.length > noUseNew.length ? ' (+' + (noUse.length - noUseNew.length) + ' known)' : ''))
    log('routes', routeNew.length === 0 ? 'PASS' : 'FAIL', routeMissing.length === 0 ? 'every expected GT, crafting and info route is in EMI'
      : routeNew.length + ' expected routes missing: ' + listed(routeNew) + (routeMissing.length > routeNew.length ? ' (+' + (routeMissing.length - routeNew.length) + ' known)' : ''))
    log('preview_routes', 'NOTE', previewMissing.length === 0 ? 'GTM\'s multiblock previews list every block the audit expects'
      : previewMissing.length + ' multiblock-preview routes the audit expects are not in EMI (fix previewBlocks in lib/emi_coverage.mjs): ' + listed(previewMissing))

    // 3) our pages
    var pagesMissing = exp.pages.filter(function (id) { return rm.getRecipe(new RL(id)) === null })
    var ours = 0
    var allRecipes = jlist(rm.getRecipes())
    for (var r = 0; r < allRecipes.size(); r++) {
      var rid = allRecipes.get(r).getId()
      if (rid !== null && String(rid).indexOf(PAGE_PREFIX) === 0) ours++
    }
    ok = ok && pagesMissing.length === 0
    log('pages', pagesMissing.length === 0 ? 'PASS' : 'FAIL', ours + ' grindless info pages in EMI; expected ' + exp.pages.length +
      (pagesMissing.length ? '; missing: ' + listed(pagesMissing) : ''))
    var machineInfoMissing = []
    machineReport.forEach(function (m) {
      var uses = jlist(rm.getRecipesByInput(new ItemEmiStack(Item.of(m.id))))
      var makes = jlist(rm.getRecipesByOutput(new ItemEmiStack(Item.of(m.id))))
      m.made = makes.size()
      m.used = uses.size()
      m.madeIn = categoriesOf(makes)
      m.usedIn = categoriesOf(uses)
      m.info = categoriesOf(uses).indexOf('emi:info') >= 0
      if (!m.hidden && !m.info && exp.items.some(function (e) { return e.id === m.id })) machineInfoMissing.push(m.id)
    })
    var machineInfoNew = ratchet('machineInfo', machineInfoMissing)
    ok = ok && machineInfoNew.length === 0
    log('machine_info', machineInfoNew.length ? 'FAIL' : 'PASS', 'our machines without what-it-does pages: ' + (listed(machineInfoNew) || 'none') +
      (machineInfoMissing.length > machineInfoNew.length ? ' (+' + (machineInfoMissing.length - machineInfoNew.length) + ' known)' : ''))
    log('known', 'NOTE', knownOpen.length + ' known gaps still open' + (knownFixed.length
      ? '; ' + knownFixed.length + ' fixed, shrink tools/analysis/emi_runtime_known.json (emi-coverage.mjs --known-from <this report>): ' + listed(knownFixed) : ''))

    // 4) legacy items: out of the index, conversion in view
    var index = {}
    var stacks = jlist(EmiStackList.stacks)
    for (var s = 0; s < stacks.size(); s++) index[String(stacks.get(s).getId())] = true
    var legacyBad = []
    exp.legacy.forEach(function (l) {
      if (index[l.id] === true) legacyBad.push(l.id + ' is in the index')
      l.conversions.forEach(function (id) { if (rm.getRecipe(new RL(id)) === null) legacyBad.push(l.id + ': conversion ' + id + ' not in EMI') })
    })
    ok = ok && legacyBad.length === 0
    log('legacy', legacyBad.length === 0 ? 'PASS' : 'FAIL', exp.legacy.map(function (l) { return l.id }).join(', ') + (legacyBad.length ? '; ' + legacyBad.join('; ') : ''))

    try {
      var doc = { format: 'gg-emi-coverage-report-2', expectations: exp.format, recipes: allRecipes.size(), pages: ours, items: report,
        pluginErrors: pluginErrors, categories: categories, machines: machineReport, processes: processReport,
        workstationMissing: workstationMissing, previewsMissing: previewsMissing, previewsOff: previewsOff, processesMissing: processesMissing, machineInfoMissing: machineInfoMissing,
        knownOpen: knownOpen, knownFixed: knownFixed,
        noMade: noMade, noUse: noUse, routeMissing: routeMissing, previewMissing: previewMissing, unaudited: unaudited, unknown: unknown,
        pagesMissing: pagesMissing, legacy: legacyBad }
      c.report = doc
      // a fresh instance has no kubejs/exported yet (native run 20261026-024353-client-44b); same call as gg_test_recipe_lookup.js
      Java.loadClass('net.minecraft.FileUtil').createDirectoriesSafe('kubejs/exported')
      JsonIO.write(REPORT, Java.loadClass('com.google.gson.JsonParser').parseString(JSON.stringify(doc)))
    } catch (e) {
      log('report', 'FAIL', 'could not write ' + REPORT + ': ' + e)
      ok = false
    }
    return ok
  }

  function finish(ok, detail) {
    if (c.preview !== null) {
      Client.setScreen(c.preview.oldScreen)
      c.preview = null
    }
    c.done = true
    var S = shared()
    if (S !== null) {
      if (!ok) S.put('failed', true)
      S.put('clientDone', true)
    }
    log('all', ok ? 'PASS' : 'FAIL', detail || (ok ? 'EMI shows how every audited item is obtained and used' : 'see the FAIL lines above'))
    console.info(T + 'DONE')
  }

  // Optional named T1 proof: open the shipped module machine on the real renderer, not during other UI fixtures.
  function renderStep() {
    c.preview.ticks++
    var screen = Client.screen || Client.f_91080_
    if (String(screen).indexOf('RecipeScreen') < 0) throw new Error('MEGA preview screen did not open: ' + screen)
    if (c.preview.ticks === 20) {
      var dir = Client.gameDirectory || Client.f_91069_
      var target = typeof Client.getMainRenderTarget === 'function' ? Client.getMainRenderTarget() : Client.m_91385_()
      Java.loadClass('net.minecraft.client.Screenshot').grab(dir, '../kubejs/exported/gg_emi_mega_factory.png', target, function (msg) {})
    }
    if (c.preview.ticks < 40) return
    c.report.previewRender = { id: 'gtceu:mega_factory', screen: String(screen), screenshot: 'gg_emi_mega_factory.png' }
    JsonIO.write(REPORT, Java.loadClass('com.google.gson.JsonParser').parseString(JSON.stringify(c.report)))
    log('preview_render', 'PASS', 'gtceu:mega_factory displayed for 40 client ticks; screenshot gg_emi_mega_factory.png')
    finish(c.preview.ok)
  }

  function tick() {
    var integrated = requested()
    if (c.done) {
      if (!integrated || String(shared().get('clientDone')) === 'true') return
      c.done = false
      c.since = 0
    }
    if (!integrated && !standalone()) return
    var p = Client.player
    if (p === null || p === undefined) return
    if (c.since === 0) {
      c.since = Date.now()
      log('client_hold', 'NOTE', integrated ? 'integrated stage: waiting for EMI to load' : 'keeping mc-runtime-test in the world until EMI has loaded')
    }
    if (!integrated) windBack(p)
    var S = shared()
    if (integrated && S.get('cancel')) {
      finish(false, 'cancelled by the dispatcher: ' + S.get('cancel'))
      return
    }
    if (c.preview !== null) {
      renderStep()
      return
    }
    var ERM = Java.loadClass('dev.emi.emi.runtime.EmiReloadManager')
    if (!ERM.isLoaded()) {
      if (Date.now() - c.since > HOLD_MAX_MS) {
        log('emi_loaded', 'FAIL', 'EMI did not finish loading in ' + (HOLD_MAX_MS / 60000) + ' min')
        finish(false, 'EMI never loaded')
      } else if (Date.now() - c.waitedLog > 60000) {
        c.waitedLog = Date.now()
        log('client_wait', 'NOTE', 'EMI still loading after ' + Math.round((Date.now() - c.since) / 1000) + ' s')
      }
      return
    }
    c.done = true
    log('emi_loaded', 'PASS', 'EMI loaded ' + Math.round((Date.now() - c.since) / 1000) + ' s after joining')
    var ok = false
    try {
      ok = check()
    } catch (e) {
      log('script', 'FAIL', 'exception: ' + e)
    }
    if (c.renderPreview && c.report !== null) {
      var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
      var EmiApi = Java.loadClass('dev.emi.emi.api.EmiApi')
      var recipe = EmiApi.getRecipeManager().getRecipe(new RL('gtceu:mega_factory'))
      if (recipe === null || String(recipe.getCategory().getId()) !== 'gtceu:multiblock_info') {
        log('preview_render', 'FAIL', 'no preview display for gtceu:mega_factory')
        finish(false)
        return
      }
      c.preview = { oldScreen: Client.screen || Client.f_91080_ || null, ticks: 0, ok: ok }
      c.done = false
      EmiApi.displayRecipe(recipe)
      return
    }
    finish(ok)
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      log('client_script', 'FAIL', 'exception: ' + e)
      finish(false, 'client fixture could not complete')
    }
  })
})()
