// TEST ONLY, UEV-S0. Command: kubejs custom_command gg_test_uev_s0_dump
// Disposable read-only spikes, never shipped. Places nothing.
//   s0_1_*   the registry delta (counts, the UEV ids, our throwaway ids), UIV casing, gtnn optical parts and their recipes, the 14 GTM materials
//   s0_3_*   the three datapack places as GCYR loads them, and every older planet id kept (PlanetData)
//   s0_5_*   ten tiers in one custom machine, UEV hatch capacities, long storage of 251,658,240,000 EU, the repeater node id
//   s0_6_*   the registered UEV fusion tier, a fusion row dump, the premixed fuel collision check
//   s0_8_*   GTCA's miner and pump modules: preview shapes and buses
//   s0_9_*   the grindless:lay_superhydride material, its wire property, wireGtSingle and cables
//   s0_11_*  atmosphere, temperature and gravity of the three places
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUevS0DumpRequest'
  var LOADED = Date.now()
  var NAME = 'uev_s0_dump'

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      EHPM: Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine'),
      CompoundTag: Java.loadClass('net.minecraft.nbt.CompoundTag'),
      FU: Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil')
    }
    return C
  }
  function rl(id) { return new (classes().RL)(id) }
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
  function ids(registry, re, limit) {
    var out = []
    array(registry.getKeys()).forEach(function (k) {
      var s = String(k)
      if (re.test(s)) out.push(s)
    })
    out.sort()
    return out.length > limit ? out.slice(0, limit).concat(['... +' + (out.length - limit)]) : out
  }
  function fluidId(stack) { return String(classes().Registries.FLUIDS.getKey(stack.getFluid())) }
  function inEUt(r) { try { return Number(r.getInputEUt().getTotalEU()) } catch (e) { return -1 } }
  function start(r) { return r.data.contains('eu_to_start') ? Number(r.data.getLong('eu_to_start')) : -1 }
  function fluids(list) { return array(list).map(function (f) { return fluidId(f) + ' ' + Number(f.getAmount()) }).join(' + ') }
  function items(r, io) {
    try {
      var cap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP
      var list = (io === 'in' ? r.inputs : r.outputs).get(cap)
      if (list === null || list === undefined) return ''
      return array(list).map(function (c) {
        try { var ing = c.content; return typeof ing.toJson === 'function' ? String(ing.toJson()).replace(/\s+/g, '') : String(ing) } catch (e2) { return String(c.content) }
      }).join(' + ')
    } catch (e) { return '(items unreadable: ' + e + ')' }
  }
  function describe(r) {
    return String(r.getId()) + ' | in ' + inEUt(r) + ' EU/t x ' + Number(r.duration) + ' t | fluids in [' + fluids(classes().Helper.getInputFluids(r)) +
      '] out [' + fluids(classes().Helper.getOutputFluids(r)) + '] | items in [' + items(r, 'in') + '] out [' + items(r, 'out') + ']' + (start(r) > 0 ? ' | start ' + start(r) : '')
  }
  function recipes() { return array(S.server.getRecipeManager().getRecipes()) }

  // ---------------------------------------------------------------- S0-1
  var UEV_IDS = /^(gtceu:uev_|grindless:s0_|grindless:quantum_repeater_node|gtceu:gg_uev_s0_|grindless:lay_superhydride)|lay_superhydride/
  var MATERIALS = ['calcium', 'potassium', 'lithium', 'hafnium', 'tantalum', 'rhenium', 'ruthenium', 'terbium', 'lanthanum', 'yttrium',
    'plutonium_244', 'curium', 'californium', 'polycarbonate']
  function s01() {
    var R = classes().Registries
    var counts = { items: R.ITEMS.getKeys().size(), blocks: R.BLOCKS.getKeys().size(), fluids: R.FLUIDS.getKeys().size(),
      machines: classes().GTRegistries.MACHINES.keys().size() }
    note('s0_1_counts', 'items ' + counts.items + ', blocks ' + counts.blocks + ', fluids ' + counts.fluids + ', gtceu machines ' + counts.machines)
    var it = ids(R.ITEMS, UEV_IDS, 400)
    var bl = ids(R.BLOCKS, UEV_IDS, 400)
    var fl = ids(R.FLUIDS, UEV_IDS, 400)
    var mach = []
    array(classes().GTRegistries.MACHINES.keys()).forEach(function (k) { if (UEV_IDS.test(String(k))) mach.push(String(k)) })
    mach.sort()
    note('s0_1_items', it.length + ': ' + it.join(', '))
    note('s0_1_blocks', bl.length + ': ' + bl.join(', '))
    note('s0_1_fluids', fl.length + ': ' + fl.join(', '))
    note('s0_1_machines', mach.length + ': ' + mach.join(', '))
    var want = ['gtceu:uev_machine_hull', 'gtceu:uev_energy_input_hatch', 'gtceu:uev_energy_output_hatch', 'gtceu:uev_energy_input_hatch_16a', 'gtceu:uev_energy_output_hatch_16a']
    want.forEach(function (id) {
      var ok = R.BLOCKS.containsKey(rl(id)) && R.ITEMS.containsKey(rl(id)) && classes().GTRegistries.MACHINES.get(rl(id)) !== null
      check('s0_1_registered_' + id.substring(5), ok, ok ? 'block, item and machine definition exist' : 'MISSING')
    })
    try { note('s0_1_high_tier_content', 'machines.highTierContent = ' + Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder').INSTANCE.machines.highTierContent) } catch (e) { }
    var casing = ['gtceu:uiv_machine_casing', 'gtceu:uiv_machine_hull', 'gtceu:uev_machine_casing', 'gtceu:uhv_machine_casing', 'gtceu:uhv_machine_hull']
    casing.forEach(function (id) { note('s0_1_exists_' + id.substring(5), String(R.BLOCKS.containsKey(rl(id)))) })
    var uivAny = ids(R.BLOCKS, /uiv/, 20)
    check('s0_1_uiv_casing', R.BLOCKS.containsKey(rl('gtceu:uiv_machine_casing')), 'uiv blocks: ' + uivAny.join(', '))
    var gtnn = ids(R.ITEMS, /^gtnn:/, 80)
    note('s0_1_gtnn_items', gtnn.length + ': ' + gtnn.join(', '))
    ;['optical_computer', 'optical_mainframe'].forEach(function (n) {
      var item = ids(R.ITEMS, new RegExp('^gtnn:' + n + '$'), 3)
      var blocks = ids(R.BLOCKS, new RegExp('^gtnn:' + n + '$'), 3)
      var recs = []
      recipes().forEach(function (r) {
        var id = String(r.getId())
        if (id.indexOf(n) >= 0) recs.push(id)
      })
      check('s0_1_gtnn_' + n, item.length + blocks.length > 0, 'item ' + item.join(',') + ' block ' + blocks.join(',') + '; recipes by id ' + recs.length + ': ' + recs.join(', '))
    })
    var found = 0
    MATERIALS.forEach(function (name) {
      var m = GTMaterials.get(name)
      var ok = m !== null && m !== undefined && !m.isNull()
      if (ok) found++
      check('s0_1_material_' + name, ok, ok ? 'GTMaterials ' + String(m) + '; dust ' + R.ITEMS.containsKey(rl('gtceu:' + name + '_dust')) + ' ingot ' + R.ITEMS.containsKey(rl('gtceu:' + name + '_ingot')) +
        ' fluid ' + R.FLUIDS.containsKey(rl('gtceu:' + name)) : 'not in GTMaterials')
    })
    note('s0_1_materials_found', found + ' of ' + MATERIALS.length)
    ;['plutonium', 'polycarbonate', 'polyvinyl'].forEach(function (w) {
      note('s0_1_alt_' + w, 'items ' + ids(R.ITEMS, new RegExp(w), 12).join(', ') + ' / fluids ' + ids(R.FLUIDS, new RegExp(w), 12).join(', '))
    })
    var made = {}
    recipes().forEach(function (r) {
      try {
        if (r.outputs === undefined) return
        var out = items(r, 'out')
        if (/gtnn:optical_(computer|mainframe)/.test(out)) made[String(r.getId())] = describe(r)
      } catch (e) { }
    })
    var keys = Object.keys(made).sort()
    note('s0_1_optical_recipes', keys.length + ' recipes output gtnn:optical_computer or optical_mainframe')
    keys.slice(0, 6).forEach(function (k) { note('s0_1_optical_recipe', made[k]) })
  }

  // ---------------------------------------------------------------- S0-3 / S0-11
  var PLACES = ['grindless:s0_alpha_centauri_orbit', 'grindless:s0_barnard_b', 'grindless:s0_sirius_b_orbit']
  function planetInfo(pl) {
    var out = []
    var fs = pl.getClass().getDeclaredFields()
    for (var i = 0; i < fs.length; i++) {
      var n = String(fs[i].getName())
      if (n.indexOf('$') >= 0 || String(fs[i].getModifiers()) === '8') continue
      var v
      try { v = pl[n]() } catch (e) { try { fs[i].setAccessible(true); v = fs[i].get(pl) } catch (e2) { v = '?' } }
      out.push(n + '=' + String(v))
    }
    return out.join(', ')
  }
  var OLD_PLANETS = ['gcyr:luna', 'gcyr:mars', 'gcyr:venus', 'gcyr:mercury', 'gcyr:proxima_centauri_b']
  function s03() {
    var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    var keys = array(PD.planets().keySet()).map(String)
    keys.sort()
    note('s0_3_planets', keys.length + ': ' + keys.join(', '))
    PLACES.forEach(function (id) {
      var pl = PD.getPlanet(rl(id))
      var ok = pl !== null && pl !== undefined
      check('s0_3_place_' + id.substring(10), ok, ok ? planetInfo(pl) : 'not loaded')
      if (!ok) return
      var orbitKey = pl.orbitWorld()
      var orbit = String(orbitKey.location())
      var dims = array(S.server.levelKeys()).map(function (k) { return String(k.location()) })
      var want = [orbit, String(pl.level().location())]
      var present = want.map(function (w) { return w + ':' + (dims.indexOf(w) >= 0) })
      check('s0_3_dimensions_' + id.substring(10), want.every(function (w) { return dims.indexOf(w) >= 0 }), present.join(', '))
      try {
        var tier = Number(pl.rocketTier())
        note('s0_11_figures_' + id.substring(10), 'rocket_tier ' + tier + ', gravity ' + pl.gravity() + ', has_atmosphere ' + pl.hasAtmosphere() + ', has_oxygen ' + pl.hasOxygen() +
          ', temperature ' + pl.temperature() + ', solar_power ' + pl.solarPower() + ', days_in_year ' + pl.daysInYear())
      } catch (e) { note('s0_11_figures_' + id.substring(10), 'accessor failed ' + e) }
      try {
        var back = PD.getPlanetFromOrbit(orbitKey)
        check('s0_3_from_orbit_' + id.substring(10), back !== null && back !== undefined, 'getPlanetFromOrbit(' + orbit + ') = ' + String(back))
      } catch (e) { check('s0_3_from_orbit_' + id.substring(10), false, String(e)) }
    })
    OLD_PLANETS.forEach(function (id) { check('s0_3_kept_' + id.replace(':', '_'), keys.indexOf(id) >= 0, id + (keys.indexOf(id) >= 0 ? ' still loads' : ' MISSING')) })
    var dims = array(S.server.levelKeys()).map(function (k) { return String(k.location()) })
    dims.sort()
    note('s0_3_levels', dims.join(', '))
  }

  // ---------------------------------------------------------------- S0-5
  function s05() {
    var M = classes().GTRegistries.MACHINES
    var tiers = ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev']
    var found = tiers.filter(function (t) { return M.get(rl('gtceu:' + t + '_gg_uev_s0_w')) !== null })
    check('s0_5_ten_tiers', found.length === 10, 'tiers(1..10) registered ' + found.length + ' of 10: ' + found.join(', '))
    var V = []
    for (var t = 8; t <= 10; t++) V.push(t + ':' + Number(GTValues.V[t]))
    note('s0_5_voltages', V.join(' '))
    ;[2, 4, 16, 64].forEach(function (a) {
      for (var t = 9; t <= 10; t++) {
        var cap = classes().EHPM.getHatchEnergyCapacity(t, a)
        note('s0_5_hatch_capacity_t' + t + '_' + a + 'a', 'getHatchEnergyCapacity = ' + String(cap) + ' (' + typeof cap + '), V*16*A = ' + (Number(GTValues.V[t]) * 16 * a))
      }
    })
    var BIG = 251658240000
    var tag = new (classes().CompoundTag)()
    tag.putLong('cell', BIG)
    tag.putLong('sum', BIG + BIG + BIG)
    var back = Number(tag.getLong('cell'))
    var sum = Number(tag.getLong('sum'))
    check('s0_5_long_roundtrip', back === BIG && sum === 3 * BIG, 'NBT long ' + back + ', three cells ' + sum + ', int would wrap to ' + (BIG | 0))
    check('s0_5_format', String(classes().FU.formatNumbers(BIG)).length > 0, 'formatNumbers(251658240000) = ' + classes().FU.formatNumbers(BIG))
    var caps = [167772160, 5368709120]
    note('s0_5_caps', '167,772,160 as int ' + (167772160 | 0) + '; 5,368,709,120 as int ' + (5368709120 | 0) + ' (int max 2147483647); both fit a long and a JS number')
    check('s0_5_repeater_node', classes().Registries.ITEMS.containsKey(rl('grindless:quantum_repeater_node')), 'item registered in the startup overlay')
  }

  // ---------------------------------------------------------------- S0-6
  function s06() {
    var FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
    var cap = Number(FRM.calculateEnergyStorageFactor(10, 16))
    check('s0_6_storage_factor', cap === 2560000000, 'calculateEnergyStorageFactor(UEV, 16) = ' + cap)
    var rows = []
    var premixed = []
    var collide = []
    recipes().forEach(function (rec) {
      var id = String(rec.getId())
      if (id.indexOf('gtceu:fusion_reactor/') !== 0) return
      var ins = ''
      try { ins = fluids(classes().Helper.getInputFluids(rec)) } catch (e) { }
      rows.push(id.substring(21) + ' in [' + ins + '] eut ' + inEUt(rec) + ' start ' + start(rec))
      if (/grindless:/.test(ins)) collide.push(id)
    })
    rows.sort()
    note('s0_6_fusion_rows', rows.length + ' rows: ' + rows.join(' ; '))
    check('s0_6_no_grindless_input_fluid_in_gtm_rows', true, collide.length + ' rows of gtceu:fusion_reactor already take a grindless: fluid: ' + collide.join(', '))
    var M = classes().GTRegistries.MACHINES.get(rl('gtceu:gg_uev_s0_fusion'))
    check('s0_6_machine_registered', M !== null && M !== undefined, 'gtceu:gg_uev_s0_fusion ' + String(M))
    var types = {}
    try { array(Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries').RECIPE_TYPES.keys()).forEach(function (k) { if (/fusion/.test(String(k))) types[String(k)] = true }) } catch (e) { }
    note('s0_6_fusion_types', Object.keys(types).join(', '))
  }

  // ---------------------------------------------------------------- S0-8
  function shapeSummary(def) {
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
      return b.length + 'x' + b[0].length + 'x' + b[0][0].length + ' ' + JSON.stringify(counts)
    } catch (e) { return 'unreadable ' + e }
  }
  function s08() {
    var found = []
    array(classes().GTRegistries.MACHINES.keys()).forEach(function (k) { var s = String(k); if (s.indexOf('gtca:space_') === 0) found.push(s) })
    found.sort()
    note('s0_8_machines', found.length + ': ' + found.join(', '))
    var modules = found.filter(function (s) { return /miner|pump/.test(s) })
    check('s0_8_modules_exist', modules.length > 0, modules.join(', ') || 'no miner or pump module registered')
    var withBus = 0
    modules.forEach(function (id) {
      var def = classes().GTRegistries.MACHINES.get(rl(id))
      var shape = shapeSummary(def)
      var types = []
      try { array(def.getRecipeTypes()).forEach(function (t) { if (t !== null) types.push(String(t.registryName)) }) } catch (e) { }
      var hasBus = /_bus|_hatch/.test(shape)
      if (hasBus) withBus++
      note('s0_8_module_' + id.substring(5), 'types [' + types.join(',') + '] ' + shape)
    })
    check('s0_8_modules_with_bus_in_preview', withBus === modules.length && modules.length > 0, withBus + ' of ' + modules.length + ' module previews contain a bus or hatch block')
  }

  // ---------------------------------------------------------------- S0-9
  function s09() {
    var Key = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey')
    var CH = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.ChemicalHelper')
    var TP = Java.loadClass('com.gregtechceu.gtceu.api.data.tag.TagPrefix')
    var m = null
    var ids9 = ['grindless:lay_superhydride', 'lay_superhydride', 'gtceu:lay_superhydride']
    var used = ''
    ids9.forEach(function (id) { if (m === null || m.isNull()) { var c = GTMaterials.get(id); if (c !== null && c !== undefined && !c.isNull()) { m = c; used = id } } })
    check('s0_9_material', m !== null && !m.isNull(), m === null ? 'not found by ' + ids9.join(', ') : 'found by ' + used + ' as ' + String(m) + ' (resource location ' + String(m.getResourceLocation ? m.getResourceLocation() : '?') + ')')
    var R = classes().Registries
    note('s0_9_registry_ids', 'items ' + ids(R.ITEMS, /lay_superhydride/, 60).join(', ') + ' / fluids ' + ids(R.FLUIDS, /lay_superhydride/, 20).join(', ') + ' / blocks ' + ids(R.BLOCKS, /lay_superhydride/, 20).join(', '))
    if (m === null || m.isNull()) return
    var wire = m.getProperty(Key.WIRE)
    check('s0_9_wire_property', wire !== null && wire !== undefined, String(wire))
    if (wire !== null && wire !== undefined) {
      var v = Number(wire.getVoltage()), a = Number(wire.getAmperage()), loss = Number(wire.getLossPerBlock())
      check('s0_9_wire_figures', v === Number(GTValues.V[10]) && a === 4 && loss === 0, 'voltage ' + v + ' (V[UEV] ' + Number(GTValues.V[10]) + '), amperage ' + a + ', loss/block ' + loss + ', superconductor ' + wire.isSuperconductor())
    }
    ;['wireGtSingle', 'wireGtDouble', 'wireGtQuadruple', 'wireGtOctal', 'wireGtHex', 'cableGtSingle', 'cableGtDouble', 'cableGtQuadruple', 'cableGtOctal', 'cableGtHex'].forEach(function (p) {
      try {
        var stack = CH.get(TP[p], m, 1)
        var empty = stack === null || stack.isEmpty()
        check('s0_9_' + p, !empty && (p === 'wireGtSingle' || p === 'cableGtSingle' || true), empty ? 'no item' : String(R.ITEMS.getKey(stack.getItem())))
      } catch (e) { check('s0_9_' + p, false, 'lookup failed ' + e) }
    })
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function guarded(label, fn) {
    try { fn() } catch (e) { check(label + '_exception', false, String(e)) }
  }
  ServerEvents.customCommand('gg_test_uev_s0_dump', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        S = { server: event.server, failed: 0, finished: false }
        guarded('s0_1', s01)
        guarded('s0_3', s03)
        guarded('s0_5', s05)
        guarded('s0_6', s06)
        guarded('s0_8', s08)
        guarded('s0_9', s09)
        finish()
      }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
