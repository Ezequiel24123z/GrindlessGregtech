// TEST ONLY, OpV-A2. Command: kubejs custom_command gg_test_opv_circuits
// Read-only; places nothing. The doubt (opv.md, A2 tests): the cosmic mainframe from our join satisfies
// #gtceu:circuits/opv in a GTM assembly-line recipe, and GT--'s route is gone in game (S0-4 only read the tag offline).
//   join      grindless:photonic_integration/cosmic_mainframe is loaded: photonic hall type, c8, the four parts in, the mainframe out
//   parts     each of the four parts has a producer in the recipe manager (the older-machine rows loaded)
//   tag       plain gtnn:cosmic_mainframe matches #gtceu:circuits/opv
//   assembly  at least one gtceu:assembly_line recipe takes #gtceu:circuits/opv as an item input
//   only_join no recipe other than our join makes gtnn:cosmic_mainframe (GT-- 1.3.10 ships none; OpV-F2 cuts any)
//   loader    global.grindless.opvCircuits reports no skipped row
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestOpvCircuitsRequest'
  var LOADED = Date.now()
  var NAME = 'opv_circuits'
  var MF = 'gtnn:cosmic_mainframe'
  var JOIN = 'grindless:photonic_integration/cosmic_mainframe'
  var HALL = 'gtceu:photonic_integration'
  var TAG = 'gtceu:circuits/opv'
  var PARTS = ['grindless:cryo_cmos_die', 'grindless:nb_tsv_interposer', 'grindless:cryo_optical_link', 'grindless:hemt_amplifier']

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
      ITEM: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
    }
    return C
  }
  function array(collection) {
    if (collection === null || collection === undefined) return []
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function isGT(r) { return r instanceof classes().GTRecipe }
  function typeOf(r) { return isGT(r) ? String(r.recipeType.registryName) : String(r.getType()) }

  // GT recipe item contents as JSON text through GTM's own serializer (scripts cannot see SizedIngredient's overrides)
  function itemJson(r, io) {
    var cap = classes().ITEM
    var list = io === 'in' ? r.getInputContents(cap) : r.getOutputContents(cap)
    return array(list).map(function (c) { return String(cap.serializer.toJson(cap.of(c.content))).replace(/\s+/g, '') })
  }
  function outputIds(r) {
    var ids = []
    if (isGT(r)) {
      itemJson(r, 'out').forEach(function (j) {
        ;(j.match(/"item":"[^"]+"/g) || []).forEach(function (m) { ids.push(m.substring(8, m.length - 1)) })
      })
    } else {
      try {
        var res = r.getResultItem(S.server.registryAccess())
        if (res !== null && !res.isEmpty()) ids.push(String(classes().BI.ITEM.getKey(res.getItem())))
      } catch (e) { }
    }
    return ids
  }

  function scan() {
    var want = {}
    want[MF] = []
    PARTS.forEach(function (p) { want[p] = [] })
    var assembly = []
    var unreadable = 0
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      try {
        outputIds(r).forEach(function (id) { if (want[id] && want[id].indexOf(String(r.getId())) < 0) want[id].push(String(r.getId())) })
        if (isGT(r) && typeOf(r) === 'gtceu:assembly_line' && itemJson(r, 'in').some(function (j) { return j.indexOf('"tag":"' + TAG + '"') >= 0 })) assembly.push(String(r.getId()))
      } catch (e) { unreadable++ }
    })
    return { producers: want, assembly: assembly, unreadable: unreadable }
  }

  function run() {
    var rm = S.server.getRecipeManager()
    var opt = rm.byKey(new (classes().RL)(JOIN))
    var r = opt.isPresent() ? opt.get() : null
    if (r === null || !isGT(r)) {
      check('join', false, JOIN + (r === null ? ' is not in the recipe manager' : ' is not a GT recipe: ' + r.getClass().getName()))
    } else {
      var ins = itemJson(r, 'in')
      var text = ins.join(' ')
      var missing = PARTS.filter(function (p) { return text.indexOf('"' + p + '"') < 0 })
      var c8 = /"configuration":8\b/.test(text)
      var outs = outputIds(r)
      var ok = typeOf(r) === HALL && missing.length === 0 && c8 && outs.length === 1 && outs[0] === MF
      check('join', ok, JOIN + ': type ' + typeOf(r) + ', missing parts [' + missing.join(', ') + '], circuit 8 ' + c8 + ', out [' + outs.join(', ') + '], in ' + text)
    }

    var tagOk = false
    try { tagOk = Ingredient.of('#' + TAG).test(Item.of(MF)) } catch (e) { note('tag_error', String(e)) }
    var members = []
    try { members = Ingredient.of('#' + TAG).getStacks().toArray().map(function (s) { return String(s.getId()) }) } catch (e) { members = ['unreadable: ' + e] }
    check('tag', tagOk, 'plain ' + MF + ' matches #' + TAG + ': ' + tagOk + '; members ' + members.join(', '))

    var s = scan()
    if (s.unreadable > 0) note('unreadable_recipes', s.unreadable + ' recipes could not be read')
    var noMaker = PARTS.filter(function (p) { return s.producers[p].length === 0 })
    check('parts', noMaker.length === 0, PARTS.map(function (p) { return p + ' <- ' + (s.producers[p].join(', ') || 'NONE') }).join('; '))
    check('assembly', tagOk && s.assembly.length > 0, s.assembly.length + ' gtceu:assembly_line recipes take #' + TAG + ' (mainframe in the tag: ' + tagOk + '): ' + s.assembly.slice(0, 12).join(', ') + (s.assembly.length > 12 ? ' ...' : ''))
    var makers = s.producers[MF]
    check('only_join', makers.length === 1 && makers[0] === JOIN, 'makers of ' + MF + ': ' + (makers.join(', ') || 'none'))

    var OC = global.grindless && global.grindless.opvCircuits
    if (!OC) check('loader', false, 'global.grindless.opvCircuits is not published')
    else {
      var skipped = array(OC.skipped)
      check('loader', skipped.length === 0 && String(OC.joinRecipe) === JOIN, 'skipped ' + skipped.length + (skipped.length ? ': ' + skipped.join('; ') : '') + ', joinRecipe ' + OC.joinRecipe + ', table rows ' + array(OC.recipes).length)
    }
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_opv_circuits', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        S = { server: event.server, failed: 0, finished: false }
        try { run() } catch (e) { check('exception', false, String(e)) }
        finish()
      }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
