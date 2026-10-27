// TEST ONLY, UV-S0. Command: kubejs custom_command gg_test_uv_s0_dump
// Disposable read-only spikes, never shipped. Places nothing (band X 23040-23103 is not touched by this file).
//   s0_8_*   which of the UV design's ids exist in the live registries (items, fluids, materials, blocks), the Mk3 recipe and the
//            Mk3's recipe set: every fusion_reactor recipe with its EU/t tier and eu_to_start
//   s0_7_*   GTCA's COMET recipes and the proton fluids as loaded
//   s0_6_*   the plasma generator's figures (EU per mB) as loaded
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUvS0DumpRequest'
  var LOADED = Date.now()
  var NAME = 'uv_s0'

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail) }
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(new (classes().RL)(id))
    return found.isPresent() ? found.get() : null
  }
  function fluidId(stack) { return String(classes().Registries.FLUIDS.getKey(stack.getFluid())) }
  function inEUt(r) { try { return Number(r.getInputEUt().getTotalEU()) } catch (e) { return -1 } }
  function outEUt(r) { try { return Number(r.getOutputEUt().getTotalEU()) } catch (e) { return -1 } }
  function start(r) { return r.data.contains('eu_to_start') ? Number(r.data.getLong('eu_to_start')) : -1 }
  function fluids(list) {
    return array(list).map(function (f) { return fluidId(f) + ' ' + Number(f.getAmount()) }).join(' + ')
  }
  function items(r, io) {
    try {
      var cap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
      var map = io === 'in' ? r.inputs : r.outputs
      var list = map.get(cap)
      if (list === null || list === undefined) return ''
      return array(list).map(function (c) {
        try {
          var ing = c.content
          if (typeof ing.toJson === 'function') return String(ing.toJson()).replace(/\s+/g, '')
          return String(ing)
        } catch (e2) { return String(c.content) }
      }).join(' + ')
    } catch (e) { return '(items unreadable: ' + e + ')' }
  }
  function describe(r) {
    return String(r.getId()) + ' | in ' + inEUt(r) + ' out ' + outEUt(r) + ' EU/t x ' + Number(r.duration) + ' t | fluids in [' +
      fluids(classes().Helper.getInputFluids(r)) + '] out [' + fluids(classes().Helper.getOutputFluids(r)) + '] | items in [' + items(r, 'in') +
      '] out [' + items(r, 'out') + ']' + (start(r) > 0 ? ' | start ' + start(r) : '')
  }
  function ids(registry, token, limit) {
    var out = []
    array(registry.getKeys()).forEach(function (k) {
      var s = String(k)
      if (s.indexOf(token) >= 0 && out.length < limit) out.push(s)
    })
    out.sort()
    return out
  }

  // ---------------------------------------------------------------- S0-8
  // [label, token searched in the id, registry, what the design wants]
  var WANT = [
    ['neutronium', 'neutronium', 'both'], ['gravi_star', 'gravi_star', 'items'], ['americium', 'americium', 'both'],
    ['plutonium_241', 'plutonium_241', 'both'], ['oganesson', 'oganesson', 'both'], ['uhpic', 'uhpic', 'items'],
    ['enriched_naquadah_trinium_europium_duranide', 'enriched_naquadah_trinium_europium_duranide', 'items'],
    ['wetware_mainframe', 'wetware_mainframe', 'items'], ['ytterbium', 'ytterbium', 'both'], ['indium', 'indium', 'both'],
    ['niobium', 'niobium', 'both'], ['thorium', 'thorium', 'both'], ['uranium_233', 'uranium_233', 'both'],
    ['arsine', 'arsine', 'both'], ['uv_machine_casing', 'uv_machine_casing', 'items'], ['uv_machine_hull', 'uv_machine_hull', 'items'],
    ['uv_hatches', 'uv_', 'items'], ['quantum_star', 'quantum_star', 'items'], ['proton', 'proton', 'both'],
    ['uhv_circuit', 'uhv', 'items'], ['wetware', 'wetware', 'items'], ['ytterb', 'ytterb', 'both'], ['uranium', 'uranium_2', 'both'],
    ['arsen', 'arsen', 'both'], ['yttrium', 'yttrium', 'both'], ['phosph', 'phosph', 'fluids']
  ]
  function idDump() {
    var R = classes().Registries
    WANT.forEach(function (w) {
      var it = ids(R.ITEMS, w[1], w[0] === 'uv_hatches' || w[0] === 'uhv_circuit' ? 80 : 40)
      var fl = ids(R.FLUIDS, w[1], 25)
      var bl = ids(R.BLOCKS, w[1], 25)
      var present = it.length + fl.length + bl.length > 0
      check('s0_8_' + w[0], true, (present ? 'present' : 'MISSING') + ' | items ' + it.length + ' [' + it.join(', ') + '] | fluids ' + fl.length +
        ' [' + fl.join(', ') + '] | blocks ' + bl.length + ' [' + bl.join(', ') + ']')
    })
    ;['neutronium', 'americium', 'plutonium_241', 'oganesson', 'ytterbium', 'indium', 'niobium', 'thorium', 'uranium_233', 'arsine'].forEach(function (m) {
      var mat = null
      try { mat = classes().GTRegistries.MATERIALS.get(new (classes().RL)('gtceu', m)) } catch (e) { mat = null }
      note('s0_8_material_' + m, mat === null || mat === undefined ? 'absent' : 'registered: ' + String(mat))
    })
  }
  function mk3() {
    var r = byId('gtceu:assembly_line/fusion_reactor_mk3')
    if (r === null) { check('s0_8_mk3_recipe', false, 'gtceu:assembly_line/fusion_reactor_mk3 absent'); return }
    check('s0_8_mk3_recipe', true, describe(r))
    try { note('s0_8_mk3_research', String(r.data)) } catch (e) { note('s0_8_mk3_research', 'unreadable ' + e) }
    var reactors = 0
    var rows = []
    array(S.server.getRecipeManager().getRecipes()).forEach(function (rec) {
      var id = String(rec.getId())
      if (id.indexOf('gtceu:fusion_reactor/') !== 0) return
      reactors++
      rows.push(id.substring(21) + ' eut ' + inEUt(rec) + ' start ' + start(rec))
    })
    rows.sort()
    check('s0_8_fusion_recipes', reactors > 0, reactors + ' gtceu:fusion_reactor/* recipes')
    rows.forEach(function (row) { note('s0_8_fusion_row', row) })
  }

  // ---------------------------------------------------------------- S0-7
  function comet() {
    var n = 0
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      var id = String(r.getId())
      if (!/comet|proton|antiproton|collider|synchrotron|ioniz|ioniser/.test(id)) return
      var gt = null
      try { gt = r.getInputEUt ? r : null } catch (e) { gt = null }
      if (gt === null) return
      n++
      if (n <= 120) note('s0_7_recipe', describe(r))
    })
    check('s0_7_recipes_found', n > 0, n + ' recipes matched comet/proton/collider/synchrotron/ioniser')
    var R = classes().Registries
    note('s0_7_fluids', ids(R.FLUIDS, 'proton', 20).join(', '))
    note('s0_7_items', ids(R.ITEMS, 'comet', 30).join(', '))
    var mach = []
    array(classes().GTRegistries.MACHINES.keys()).forEach(function (k) {
      if (/comet|collider|synchrotron|ioniz/.test(String(k))) mach.push(String(k))
    })
    note('s0_7_machines', mach.join(', '))
  }

  // ---------------------------------------------------------------- S0-6
  function plasma() {
    var n = 0
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      var id = String(r.getId())
      if (id.indexOf('gtceu:plasma_generator/') !== 0) return
      n++
      var gin = array(classes().Helper.getInputFluids(r))
      var mb = gin.length > 0 ? Number(gin[0].getAmount()) : 0
      var out = outEUt(r)
      var total = out * Number(r.duration)
      note('s0_6_plasma', id.substring(23) + ' | ' + out + ' EU/t x ' + Number(r.duration) + ' t = ' + total + ' EU per ' + mb + ' mB = ' + (mb > 0 ? total / mb : 0) + ' EU/mB')
    })
    check('s0_6_plasma_found', n > 0, n + ' plasma generator recipes')
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    console.info('GGTEST|' + NAME + '|DUMP|DONE|failures=' + S.failed)
  }
  function guarded(label, fn) {
    try { fn() } catch (e) { check(label + '_exception', false, String(e)) }
  }
  ServerEvents.customCommand('gg_test_uv_s0_dump', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        S = { server: event.server, failed: 0, finished: false }
        guarded('s0_8_ids', idDump)
        guarded('s0_8_mk3', mk3)
        guarded('s0_7', comet)
        guarded('s0_6', plasma)
        finish()
      }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
