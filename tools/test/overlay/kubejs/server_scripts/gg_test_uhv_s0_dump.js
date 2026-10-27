// TEST ONLY, UHV-S0. Command: kubejs custom_command gg_test_uhv_s0_dump
// Disposable read-only spikes, never shipped. Places nothing (band X 27904-27967 is not touched by this file).
//   s0_1_*   which of the UHV design's ids exist in the live registries (items, fluids, blocks) with highTierContent off, the
//            circuit tags, the parallel hatches, the UEV casing, GT--'s optical parts, GCYR's Dyson and Proxima blocks
//   s0_6_*   every gtceu:fusion_reactor recipe that makes oganesson (the Mk3's rate as loaded), and the fusion rows
//   s0_8_*   GTCA's space elevator and modules: machine ids, recipe types, preview shape sizes, recipes of those types
//   s0_9_*   Proxima b as GCYR loads it (PlanetData)
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUhvS0DumpRequest'
  var LOADED = Date.now()
  var NAME = 'uhv_s0'

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
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
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
  function ids(registry, re, limit) {
    var out = []
    array(registry.getKeys()).forEach(function (k) {
      var s = String(k)
      if (re.test(s)) out.push(s)
    })
    out.sort()
    return out.length > limit ? out.slice(0, limit).concat(['... +' + (out.length - limit)]) : out
  }

  // ---------------------------------------------------------------- S0-1
  // [label, id regex, item limit]
  var WANT = [
    ['uhv_hull', /^gtceu:uhv_machine_(hull|casing)$/, 5],
    ['uhv_parts', /^gtceu:uhv_/, 120],
    ['uev_casing', /^gtceu:uev_machine_(casing|hull)$/, 5],
    ['uev_parts', /^gtceu:uev_/, 60],
    ['parallel_hatch', /parallel_hatch/, 20],
    ['wetware_mainframe', /wetware/, 20],
    ['berkelium', /berkelium/, 30], ['californium', /californium/, 30], ['curium', /curium/, 30],
    ['thorium', /thorium/, 40], ['uranium_233', /uranium_233|u233/, 30], ['nickel', /:nickel($|_dust|_ingot|_plate)/, 10],
    ['oganesson', /oganesson/, 30], ['zirconia', /zirconi(a|um_dioxide|um_oxide)|zirconium/, 30],
    ['indium_phosphide', /indium_phosphide|inp\b/, 20], ['niobium_oxide', /niobium_(pent)?oxide|niobium_oxide/, 20],
    ['lead_fluoride', /lead_fluoride|lead_ii_fluoride/, 20], ['silicon_carbide', /silicon_carbide|carborundum/, 20],
    ['gtnn_optical', /^gtnn:.*optical/, 30], ['dyson', /dyson/, 20], ['proxima', /proxima/, 40], ['gcyr_alien', /^gcyr:.*(alien|xeno)/, 30],
    ['neutronium', /neutronium/, 30], ['americium', /americium/, 30]
  ]
  function idDump() {
    var R = classes().Registries
    WANT.forEach(function (w) {
      var it = ids(R.ITEMS, w[1], w[2])
      var fl = ids(R.FLUIDS, w[1], 25)
      var bl = ids(R.BLOCKS, w[1], 25)
      var present = it.length + fl.length + bl.length > 0
      check('s0_1_' + w[0], true, (present ? 'present' : 'MISSING') + ' / items ' + it.length + ' [' + it.join(', ') + '] / fluids ' + fl.length +
        ' [' + fl.join(', ') + '] / blocks ' + bl.length + ' [' + bl.join(', ') + ']')
    })
    ;['uhv', 'uev'].forEach(function (t) {
      try {
        var tag = Ingredient.of('#gtceu:circuits/' + t).getItemIds()
        note('s0_1_circuits_' + t, array(tag).map(String).join(', ') || 'empty')
      } catch (e) { note('s0_1_circuits_' + t, 'unreadable ' + e) }
    })
    var mach = []
    array(classes().GTRegistries.MACHINES.keys()).forEach(function (k) {
      var s = String(k)
      if (/^gtceu:(uhv|uev)_/.test(s)) mach.push(s)
    })
    mach.sort()
    note('s0_1_uhv_uev_machines', mach.length + ': ' + mach.join(', '))
    try {
      var cfg = Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder').INSTANCE
      note('s0_1_high_tier_content', 'machines.highTierContent = ' + cfg.machines.highTierContent)
    } catch (e) { note('s0_1_high_tier_content', 'unreadable ' + e) }
  }

  // ---------------------------------------------------------------- S0-6: the Mk3's oganesson rows
  function fusion() {
    var rows = []
    var og = 0
    array(S.server.getRecipeManager().getRecipes()).forEach(function (rec) {
      var id = String(rec.getId())
      if (id.indexOf('gtceu:fusion_reactor/') !== 0) return
      var outs = ''
      try { outs = fluids(classes().Helper.getOutputFluids(rec)) } catch (e) { outs = '?' }
      if (outs.indexOf('oganesson') >= 0 || id.indexOf('oganesson') >= 0) { og++; check('s0_6_oganesson_row', true, describe(rec)) }
      rows.push(id.substring(21) + ' eut ' + inEUt(rec) + ' x ' + Number(rec.duration) + ' start ' + start(rec) + ' -> ' + outs)
    })
    rows.sort()
    check('s0_6_oganesson_found', og > 0, og + ' fusion rows make oganesson')
    note('s0_6_fusion_rows', rows.length + ' rows: ' + rows.join(' ; '))
    var gens = []
    array(S.server.getRecipeManager().getRecipes()).forEach(function (rec) {
      var id = String(rec.getId())
      if (id.indexOf('oganesson') >= 0 && id.indexOf('fusion_reactor/') < 0) gens.push(id)
    })
    note('s0_6_other_oganesson_recipes', gens.length + ': ' + gens.slice(0, 40).join(', '))
  }

  // ---------------------------------------------------------------- S0-8: GTCA's space elevator
  function shapeSize(def) {
    try {
      var shapes = array(def.getMatchingShapes())
      if (shapes.length === 0) return 'no preview shape'
      var b = shapes[0].getBlocks()
      var counts = {}
      for (var x = 0; x < b.length; x++) for (var y = 0; y < b[x].length; y++) for (var z = 0; z < b[x][y].length; z++) {
        var info = b[x][y][z]
        if (info === null || info === undefined) continue
        var id = String(Block.getId(info.getBlockState().getBlock()))
        if (id === 'minecraft:air') continue
        counts[id] = (counts[id] || 0) + 1
      }
      return shapes.length + ' shapes; first ' + b.length + ' x ' + b[0].length + ' x ' + b[0][0].length + ' (x,y,z) blocks ' + JSON.stringify(counts)
    } catch (e) { return 'shape unreadable ' + e }
  }
  function elevator() {
    var found = []
    array(classes().GTRegistries.MACHINES.keys()).forEach(function (k) {
      var s = String(k)
      if (s.indexOf('gtca:space_') === 0) found.push(s)
    })
    found.sort()
    check('s0_8_machines', found.indexOf('gtca:space_elevator') >= 0, found.join(', '))
    var types = {}
    found.forEach(function (id) {
      var def = classes().GTRegistries.MACHINES.get(new (classes().RL)(id))
      var rts = []
      try { array(def.getRecipeTypes()).forEach(function (t) { if (t !== null) { rts.push(String(t.registryName)); types[String(t.registryName)] = true } }) } catch (e) { rts.push('? ' + e) }
      note('s0_8_machine_' + id.substring(5), 'types [' + rts.join(', ') + '] tier ' + def.getTier() + ' / ' + shapeSize(def) + ' / class ' + String(def.createMetaMachine ? '' : ''))
    })
    Object.keys(types).forEach(function (t) {
      var n = 0
      var sample = []
      array(S.server.getRecipeManager().getRecipes()).forEach(function (rec) {
        try { if (String(rec.getType()) === t || String(rec.recipeType && rec.recipeType.registryName) === t) { n++; if (sample.length < 5) sample.push(describe(rec)) } } catch (e) { }
      })
      note('s0_8_type_' + t.replace(':', '_'), n + ' recipes' + (sample.length ? ': ' + sample.join(' ;; ') : ''))
    })
  }

  // ---------------------------------------------------------------- S0-9: Proxima b
  function proxima() {
    var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    var pl = PD.getPlanet(new (classes().RL)('gcyr:proxima_centauri_b'))
    check('s0_9_planet', pl !== null && pl !== undefined, String(pl))
    var keys = array(PD.planets().keySet()).map(String)
    keys.sort()
    note('s0_9_planets', keys.join(', '))
    try {
      var fs = pl.getClass().getDeclaredFields()
      var names = []
      for (var i = 0; i < fs.length; i++) names.push(String(fs[i].getName()))
      note('s0_9_fields', names.join(', '))
    } catch (e) { note('s0_9_fields', 'unreadable ' + e) }
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    console.info('GGTEST|' + NAME + '|DUMP|DONE|failures=' + S.failed)
  }
  function guarded(label, fn) {
    try { fn() } catch (e) { check(label + '_exception', false, String(e)) }
  }
  ServerEvents.customCommand('gg_test_uhv_s0_dump', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        S = { server: event.server, failed: 0, finished: false }
        guarded('s0_1_ids', idDump)
        guarded('s0_6_fusion', fusion)
        guarded('s0_8_elevator', elevator)
        guarded('s0_9_proxima', proxima)
        finish()
      }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
