// Gregtech Grindless - EMI coverage, client half (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the
// pack). Read-only: no world band, no clicks, nothing placed. Once EMI has finished loading it asks EMI's recipe manager (EmiApi) for the
// recipes and uses of every item, block item, fluid and machine the pack registers, against the static audit's expectations in
// kubejs/config/gg_test_emi_coverage_expect.json (written by `node tools/analysis/emi-coverage.mjs --expect`; the Node suite fails when
// it is stale).
//
// Two ways to run it:
//   standalone   kubejs/config/gg_test_emi_coverage.json = {"enabled": true} in a scratch overlay (the committed marker is false). It
//                keeps mc-runtime-test in the world itself (the player's `age` is wound back) until it is done.
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
//   preview_routes NOTE: the blocks the audit expects in GTM's multiblock previews that EMI does not list (the audit's model of the
//                  preview, BlockPattern#getPreview; those blocks also have pages)
//   pages          our info pages are in EMI (emi:/generated/recipe/additions/grindless/...)
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
  var c = { standalone: null, since: 0, done: false, errors: 0, ageField: null, waitedLog: 0 }

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
    var unknown = exp.items.filter(function (e) {
      return !(e.kind === 'fluid' ? BI.FLUID.containsKey(new RL(e.id)) : BI.ITEM.containsKey(new RL(e.id)))
    }).map(function (e) { return e.id })
    var regOk = unaudited.length === 0 && unknown.length === 0
    ok = ok && regOk
    log('registry', regOk ? 'PASS' : 'FAIL', 'grindless items not audited: ' + (listed(unaudited) || 'none') + '; audited ids not registered: ' + (listed(unknown) || 'none') +
      (regOk ? '' : ' (regenerate the expectations with node tools/analysis/emi-coverage.mjs --expect)'))

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
    ok = ok && noMade.length === 0 && noUse.length === 0 && routeMissing.length === 0
    log('acquisition', noMade.length === 0 ? 'PASS' : 'FAIL', (exp.items.length - noMade.length) + ' of ' + exp.items.length + ' have a recipe or page that makes them' +
      (noMade.length ? '; none for: ' + listed(noMade) : ''))
    log('use', noUse.length === 0 ? 'PASS' : 'FAIL', (needUse - noUse.length) + ' of ' + needUse + ' intermediates have a recipe or page that uses them' +
      (noUse.length ? '; none for: ' + listed(noUse) : ''))
    log('routes', routeMissing.length === 0 ? 'PASS' : 'FAIL', routeMissing.length === 0 ? 'every expected GT, crafting and info route is in EMI'
      : routeMissing.length + ' expected routes missing: ' + listed(routeMissing))
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
      var doc = { format: 'gg-emi-coverage-report-1', expectations: exp.format, recipes: allRecipes.size(), pages: ours, items: report,
        noMade: noMade, noUse: noUse, routeMissing: routeMissing, previewMissing: previewMissing, unaudited: unaudited, unknown: unknown,
        pagesMissing: pagesMissing, legacy: legacyBad }
      // a fresh instance has no kubejs/exported yet (native run 20261026-024353-client-44b); same call as gg_test_recipe_lookup.js
      Java.loadClass('net.minecraft.FileUtil').createDirectoriesSafe('kubejs/exported')
      JsonIO.write(REPORT, Java.loadClass('com.google.gson.JsonParser').parseString(JSON.stringify(doc)))
    } catch (e) {
      log('report', 'NOTE', 'could not write ' + REPORT + ': ' + e)
    }
    return ok
  }

  function finish(ok, detail) {
    c.done = true
    var S = shared()
    if (S !== null) {
      if (!ok) S.put('failed', true)
      S.put('clientDone', true)
    }
    log('all', ok ? 'PASS' : 'FAIL', detail || (ok ? 'EMI shows how every audited item is obtained and used' : 'see the FAIL lines above'))
    console.info(T + 'DONE')
  }

  function tick() {
    if (c.done) return
    var integrated = requested()
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
    finish(ok)
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
