// TEST ONLY, MAX-A1. Command: kubejs custom_command gg_test_max_circuits
// Read-only; places nothing. The doubt (max.md, A1 tests): the supracausal mainframe from our join satisfies #gtceu:circuits/max in a GTM
// assembly-line recipe, and GT--'s route is gone in game.
//   join      grindless:photonic_integration/supracausal_mainframe is loaded: photonic hall type, c9, the four parts in, the mainframe out
//   parts     each part of the join has a producer in the recipe manager (the older-machine rows loaded)
//   tag       plain gtnn:supracausal_mainframe matches #gtceu:circuits/max
//   consumer  every GT recipe ingredient for #gtceu:circuits/max that can be tested accepts the plain mainframe (at least one)
//   assembly  the same for gtceu:assembly_line recipes; a note while none takes the tag
//   only_join no recipe other than our join makes gtnn:supracausal_mainframe. F2-DEPENDENT: it fails until MAX-F2 cuts GT--'s route
//   loader    global.grindless.maxCircuits reports no skipped row
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestMaxCircuitsRequest'
  var LOADED = Date.now()
  var NAME = 'max_circuits'
  var MF = 'gtnn:supracausal_mainframe'
  var JOIN = 'grindless:photonic_integration/supracausal_mainframe'
  var HALL = 'gtceu:photonic_integration'
  var TAG = 'gtceu:circuits/max'
  var PARTS = ['grindless:squeezed_light_chip', 'grindless:tweezer_array_die', 'grindless:cryo_photonic_interposer', 'grindless:tetron_array']

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
      EU: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP,
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
    var consumers = []
    var unreadable = 0
    var cap = classes().ITEM
    var stack = Item.of(MF)
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      try {
        outputIds(r).forEach(function (id) { if (want[id] && want[id].indexOf(String(r.getId())) < 0) want[id].push(String(r.getId())) })
        if (!isGT(r)) return
        array(r.getInputContents(cap)).forEach(function (c) {
          if (String(cap.serializer.toJson(cap.of(c.content))).replace(/\s+/g, '').indexOf('"tag":"' + TAG + '"') < 0) return
          var accepts = null
          try { accepts = Boolean(c.content.test(stack)) } catch (e) { }
          consumers.push({ id: String(r.getId()), type: typeOf(r), accepts: accepts })
        })
      } catch (e) { unreadable++ }
    })
    return { producers: want, consumers: consumers, unreadable: unreadable }
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
      var c9 = /"configuration":9\b/.test(text)
      var outs = outputIds(r)
      var ok = typeOf(r) === HALL && missing.length === 0 && c9 && outs.length === 1 && outs[0] === MF
      var eut = 0
      try { eut = Number(r.tickInputs.get(classes().EU).get(0).content) } catch (e) { eut = -1 }
      // 2013265920 = VA[MAX]; the hall is powered with the contract's two OpV 4 A hatches
      note('join_power', 'join EU/t ' + eut + ' = VA[MAX] 2013265920 expected; power the hall with the contract\'s two OpV 4 A energy hatches')
      ok = ok && eut === 2013265920
      check('join', ok, JOIN + ': type ' + typeOf(r) + ', missing parts [' + missing.join(', ') + '], circuit 9 ' + c9 + ', out [' + outs.join(', ') + '], in ' + text)
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
    var byType = {}
    s.consumers.forEach(function (c) { byType[c.type] = (byType[c.type] || 0) + 1 })
    note('consumers', s.consumers.length + ' GT recipe inputs take #' + TAG + ': ' + Object.keys(byType).map(function (t) { return t + ' ' + byType[t] }).join(', '))
    var rejected = s.consumers.filter(function (c) { return c.accepts === false })
    var tested = s.consumers.filter(function (c) { return c.accepts !== null })
    check('consumer', tagOk && tested.length > 0 && rejected.length === 0, tested.length + ' of ' + s.consumers.length + ' GT ingredients for #' + TAG +
      ' tested with the plain mainframe, rejected by ' + rejected.length + (rejected.length ? ': ' + rejected.slice(0, 8).map(function (c) { return c.id }).join(', ') : '') +
      '; e.g. ' + tested.slice(0, 6).map(function (c) { return c.id + ' (' + c.type + ')' }).join(', '))
    var lines = s.consumers.filter(function (c) { return c.type === 'gtceu:assembly_line' })
    if (lines.length === 0) note('assembly', 'no gtceu:assembly_line recipe takes #' + TAG + ' in this pack yet; the tag is proven through the consumers above')
    else check('assembly', lines.every(function (c) { return c.accepts === true }), lines.length + ' assembly-line ingredients take #' + TAG + ', all accept the plain mainframe: ' + lines.slice(0, 10).map(function (c) { return c.id + ' ' + c.accepts }).join(', '))
    var makers = s.producers[MF]
    check('only_join', makers.length === 1 && makers[0] === JOIN, 'F2-dependent (GT--\'s route is cut or hidden by MAX-F2); makers of ' + MF + ': ' + (makers.join(', ') || 'none'))

    var MC = global.grindless && global.grindless.maxCircuits
    if (!MC) check('loader', false, 'global.grindless.maxCircuits is not published')
    else {
      var skipped = array(MC.skipped)
      check('loader', skipped.length === 0 && String(MC.joinRecipe) === JOIN, 'skipped ' + skipped.length + (skipped.length ? ': ' + skipped.join('; ') : '') + ', joinRecipe ' + MC.joinRecipe + ', recipes ' + array(MC.recipes).length)
    }
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_max_circuits', function () {
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
