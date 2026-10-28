// TEST ONLY, UIV-S0. Command: kubejs custom_command gg_test_uiv_s0_dump
// Disposable read-only spikes, never shipped. Places nothing.
//   s0_1_*   the registry delta (counts, the UIV ids, our throwaway ids), UXV casing, gtnn optical parts and their recipes, the 18 GTM materials
//   s0_3_*   the three datapack places as GCYR loads them, and every older planet id kept (PlanetData)
//   s0_5_*   eleven tiers in one custom machine, UIV hatch capacities, long storage of 1,006,632,960,000 EU, the repeater id
//   s0_6_*   the registered UIV fusion tier, a fusion row dump, the premixed fuel collision check
//   s0_7_*   the grindless:metallic_hydrogen material, its wire property, wireGtSingle and cables
//   s0_9_*   the computation provider (gtceu:gg_uiv_s0_cwu) and the research-data recipe check
//   s0_10_*  atmosphere, temperature and gravity of the three places
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUivS0DumpRequest'
  var LOADED = Date.now()
  var NAME = 'uiv_s0_dump'

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
  var UIV_IDS = /^(gtceu:uiv_|gtceu:gg_uiv_s0_|grindless:gg_uiv_s0_|grindless:pulsar_timed_repeater|grindless:metallic_hydrogen)|metallic_hydrogen/
  var MATERIALS = ['titanium', 'silicon', 'europium', 'nickel', 'terbium', 'gadolinium', 'erbium', 'praseodymium', 'zirconium', 'beryllium',
    'molybdenum', 'germanium', 'antimony', 'tellurium', 'indium', 'einsteinium', 'fermium', 'neutronium']
  function s01() {
    var R = classes().Registries
    var counts = { items: R.ITEMS.getKeys().size(), blocks: R.BLOCKS.getKeys().size(), fluids: R.FLUIDS.getKeys().size(),
      machines: classes().GTRegistries.MACHINES.keys().size() }
    note('s0_1_counts', 'items ' + counts.items + ', blocks ' + counts.blocks + ', fluids ' + counts.fluids + ', gtceu machines ' + counts.machines)
    var it = ids(R.ITEMS, UIV_IDS, 400)
    var bl = ids(R.BLOCKS, UIV_IDS, 400)
    var fl = ids(R.FLUIDS, UIV_IDS, 400)
    var mach = []
    array(classes().GTRegistries.MACHINES.keys()).forEach(function (k) { if (UIV_IDS.test(String(k))) mach.push(String(k)) })
    mach.sort()
    note('s0_1_items', it.length + ': ' + it.join(', '))
    note('s0_1_blocks', bl.length + ': ' + bl.join(', '))
    note('s0_1_fluids', fl.length + ': ' + fl.join(', '))
    note('s0_1_machines', mach.length + ': ' + mach.join(', '))
    var want = ['gtceu:uiv_machine_hull', 'gtceu:uiv_energy_input_hatch', 'gtceu:uiv_energy_output_hatch', 'gtceu:uiv_energy_input_hatch_16a', 'gtceu:uiv_energy_output_hatch_16a']
    want.forEach(function (id) {
      var ok = R.BLOCKS.containsKey(rl(id)) && R.ITEMS.containsKey(rl(id)) && classes().GTRegistries.MACHINES.get(rl(id)) !== null
      check('s0_1_registered_' + id.substring(5), ok, ok ? 'block, item and machine definition exist' : 'MISSING')
    })
    try { note('s0_1_high_tier_content', 'machines.highTierContent = ' + Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder').INSTANCE.machines.highTierContent) } catch (e) { }
    var uevIds = ['gtceu:uev_machine_hull', 'gtceu:uev_energy_input_hatch', 'gtceu:uev_energy_output_hatch', 'gtceu:uev_energy_input_hatch_16a', 'gtceu:uev_energy_output_hatch_16a']
    check('s0_1_uev_kept', uevIds.every(function (id) { return R.BLOCKS.containsKey(rl(id)) }), 'the five UEV ids still register beside the UIV ones')
    var casing = ['gtceu:uxv_machine_casing', 'gtceu:uiv_machine_casing', 'gtceu:uev_machine_casing', 'gtceu:uxv_machine_hull', 'gtceu:uxv_energy_input_hatch']
    casing.forEach(function (id) { note('s0_1_exists_' + id.substring(5), String(R.BLOCKS.containsKey(rl(id)))) })
    check('s0_1_uxv_casing', R.BLOCKS.containsKey(rl('gtceu:uxv_machine_casing')), 'uxv blocks: ' + ids(R.BLOCKS, /uxv/, 20).join(', '))
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
    var missing = []
    MATERIALS.forEach(function (name) {
      var m = GTMaterials.get(name)
      var ok = m !== null && m !== undefined && !m.isNull()
      if (ok) found++
      else missing.push(name)
      check('s0_1_material_' + name, ok, ok ? 'GTMaterials ' + String(m) + '; dust ' + R.ITEMS.containsKey(rl('gtceu:' + name + '_dust')) + ' ingot ' + R.ITEMS.containsKey(rl('gtceu:' + name + '_ingot')) +
        ' fluid ' + R.FLUIDS.containsKey(rl('gtceu:' + name)) : 'not in GTMaterials')
    })
    note('s0_1_materials_found', found + ' of ' + MATERIALS.length + (missing.length ? '; missing ' + missing.join(', ') : ''))
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

  // ---------------------------------------------------------------- S0-3 / S0-10
  var PLACES = ['grindless:s0_rx_j1856_orbit', 'grindless:s0_psr_j0437_orbit', 'grindless:s0_cygnus_x1_orbit']
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
  var OLD_PLANETS = ['gcyr:luna', 'gcyr:mars', 'gcyr:venus', 'gcyr:mercury', 'gcyr:proxima_centauri_b', 'grindless:sirius_b_orbit', 'grindless:alpha_centauri_orbit', 'grindless:barnard_b']
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
        check('s0_3_tier11_' + id.substring(10), tier === 11, 'rocket_tier ' + tier)
        note('s0_10_figures_' + id.substring(10), 'rocket_tier ' + tier + ', gravity ' + pl.gravity() + ', has_atmosphere ' + pl.hasAtmosphere() + ', has_oxygen ' + pl.hasOxygen() +
          ', temperature ' + pl.temperature() + ', solar_power ' + pl.solarPower() + ', days_in_year ' + pl.daysInYear())
      } catch (e) { note('s0_10_figures_' + id.substring(10), 'accessor failed ' + e) }
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
    var tiers = ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv']
    var found = tiers.filter(function (t) { return M.get(rl('gtceu:' + t + '_gg_uiv_s0_w')) !== null })
    check('s0_5_eleven_tiers', found.length === 11, 'tiers(1..11) registered ' + found.length + ' of 11: ' + found.join(', '))
    var V = []
    for (var t = 9; t <= 11; t++) V.push(t + ':' + Number(GTValues.V[t]))
    note('s0_5_voltages', V.join(' '))
    ;[2, 4, 16, 64].forEach(function (a) {
      for (var t = 10; t <= 11; t++) {
        var cap = classes().EHPM.getHatchEnergyCapacity(t, a)
        note('s0_5_hatch_capacity_t' + t + '_' + a + 'a', 'getHatchEnergyCapacity = ' + String(cap) + ' (' + typeof cap + '), V*16*A = ' + (Number(GTValues.V[t]) * 16 * a))
      }
    })
    var BIG = 1006632960000
    var tag = new (classes().CompoundTag)()
    tag.putLong('cell', BIG)
    tag.putLong('sum', BIG + BIG + BIG)
    var back = Number(tag.getLong('cell'))
    var sum = Number(tag.getLong('sum'))
    check('s0_5_long_roundtrip', back === BIG && sum === 3 * BIG, 'NBT long ' + back + ', three cells ' + sum + ', int would wrap to ' + (BIG | 0))
    check('s0_5_format', String(classes().FU.formatNumbers(BIG)).length > 0, 'formatNumbers(1006632960000) = ' + classes().FU.formatNumbers(BIG))
    note('s0_5_caps', '671,088,640 = V[UIV]*2*10 -> ' + (Number(GTValues.V[11]) * 2 * 10) + '; 21,474,836,480 = V[UIV]*64*10 -> ' + (Number(GTValues.V[11]) * 64 * 10) + ' (int max 2147483647; the second wraps as int to ' + (21474836480 | 0) + ')')
    check('s0_5_repeater_item', classes().Registries.ITEMS.containsKey(rl('grindless:pulsar_timed_repeater')), 'item registered in the startup overlay')
  }

  // ---------------------------------------------------------------- S0-6
  function s06() {
    var FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
    var cap = Number(FRM.calculateEnergyStorageFactor(11, 16))
    check('s0_6_storage_factor', cap === 5120000000, 'calculateEnergyStorageFactor(UIV, 16) = ' + cap)
    var rows = []
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
    note('s0_6_grindless_input_rows', collide.length + ' rows of gtceu:fusion_reactor already take a grindless: fluid: ' + collide.join(', '))
    var dc = 0
    recipes().forEach(function (rec) { if (String(rec.getId()).indexOf('gtceu:direct_conversion/') === 0) dc++ })
    note('s0_6_direct_conversion_rows', dc + ' rows of gtceu:direct_conversion')
    var M = classes().GTRegistries.MACHINES.get(rl('gtceu:gg_uiv_s0_fusion'))
    check('s0_6_machine_registered', M !== null && M !== undefined, 'gtceu:gg_uiv_s0_fusion ' + String(M))
  }

  // ---------------------------------------------------------------- S0-7
  function s07() {
    var Key = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey')
    var CH = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.ChemicalHelper')
    var TP = Java.loadClass('com.gregtechceu.gtceu.api.data.tag.TagPrefix')
    var m = null
    var ids7 = ['grindless:metallic_hydrogen', 'metallic_hydrogen', 'gtceu:metallic_hydrogen']
    var used = ''
    ids7.forEach(function (id) { if (m === null || m.isNull()) { var c = GTMaterials.get(id); if (c !== null && c !== undefined && !c.isNull()) { m = c; used = id } } })
    check('s0_7_material', m !== null && !m.isNull(), m === null ? 'not found by ' + ids7.join(', ') : 'found by ' + used + ' as ' + String(m))
    var R = classes().Registries
    note('s0_7_registry_ids', 'items ' + ids(R.ITEMS, /metallic_hydrogen/, 60).join(', ') + ' / fluids ' + ids(R.FLUIDS, /metallic_hydrogen/, 20).join(', '))
    if (m === null || m.isNull()) return
    var wire = m.getProperty(Key.WIRE)
    check('s0_7_wire_property', wire !== null && wire !== undefined, String(wire))
    if (wire !== null && wire !== undefined) {
      var v = Number(wire.getVoltage()), a = Number(wire.getAmperage()), loss = Number(wire.getLossPerBlock())
      check('s0_7_wire_figures', v === Number(GTValues.V[11]) && a === 4 && loss === 0, 'voltage ' + v + ' (V[UIV] ' + Number(GTValues.V[11]) + '), amperage ' + a + ', loss/block ' + loss)
    }
    ;['wireGtSingle', 'wireGtDouble', 'wireGtQuadruple', 'wireGtOctal', 'wireGtHex', 'cableGtSingle', 'cableGtDouble', 'cableGtQuadruple', 'cableGtOctal', 'cableGtHex'].forEach(function (p) {
      try {
        var stack = CH.get(TP[p], m, 1)
        var empty = stack === null || stack.isEmpty()
        check('s0_7_' + p, !empty, empty ? 'no item' : String(R.ITEMS.getKey(stack.getItem())))
      } catch (e) { check('s0_7_' + p, false, 'lookup failed ' + e) }
    })
  }

  // ---------------------------------------------------------------- S0-9 (static half)
  function s09() {
    var M = classes().GTRegistries.MACHINES
    var def = M.get(rl('gtceu:gg_uiv_s0_cwu'))
    check('s0_9_cwu_registered', def !== null && def !== undefined, 'gtceu:gg_uiv_s0_cwu ' + String(def))
    ;['gtceu:hpca_computation_component', 'gtceu:advanced_hpca_computation_component', 'gtceu:computation_data_transmission_hatch', 'gtceu:creative_computation_provider', 'gtceu:research_station', 'gtceu:data_bank', 'gtceu:hpca'].forEach(function (id) {
      note('s0_9_exists_' + id.substring(5), 'machine ' + (M.get(rl(id)) !== null) + ', block ' + classes().Registries.BLOCKS.containsKey(rl(id)))
    })
    var rs = 0
    var ours = []
    recipes().forEach(function (r) {
      var id = String(r.getId())
      if (id.indexOf('gtceu:research_station/') === 0) rs++
      if (id.indexOf('gg_uiv_s0') >= 0) ours.push(id)
    })
    note('s0_9_research_station_recipes', rs + ' rows of gtceu:research_station; ours ' + ours.join(', '))
    var wrote = ours.filter(function (id) { return id.indexOf('research_station') >= 0 })
    check('s0_9_research_row_written', wrote.length > 0, 'a research_station row generated from our assembly_line recipe: ' + wrote.join(', '))
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function guarded(label, fn) {
    try { fn() } catch (e) { check(label + '_exception', false, String(e)) }
  }
  ServerEvents.customCommand('gg_test_uiv_s0_dump', function () {
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
        guarded('s0_7', s07)
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
