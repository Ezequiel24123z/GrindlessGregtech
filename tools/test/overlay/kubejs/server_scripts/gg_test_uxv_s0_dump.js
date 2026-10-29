// priority: -9900
// TEST ONLY, UXV-S0. Command: kubejs custom_command gg_test_uxv_s0_dump
// Disposable read-only spikes, never shipped. Places nothing.
//   s0_1_*  registry (the UXV ids, counts, casing, gtnn spintronic parts, the 15 GTM materials), highTierContent, labels
//   s0_3_*  the two datapack places as GCYR loads them and every older planet id kept (also S0-9 and the S0-10 figures)
//   s0_4_*  the registered UXV fusion tier, every fusion_reactor and direct_conversion row id (collision check)
//   s0_5_*  #gtceu:circuits/uxv members and the spintronic recipe
//   s0_7_*  twelve tiers in one custom machine, UXV hatch capacities, long storage of 4,026,531,840,000 EU, the repeater id
//   s0_8_*  the gg_uxv_s0_pasta_strand material, its wire property, wireGt* and cableGt* items
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUxvS0DumpRequest'
  var LOADED = Date.now()
  var NAME = 'uxv_s0_dump'
  var UXV = 12

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
    return String(r.getId()) + ' | in ' + inEUt(r) + ' EU/t x ' + Number(r.duration) + ' t | items in [' + items(r, 'in') + '] out [' + items(r, 'out') + ']'
  }
  function recipes() { return array(S.server.getRecipeManager().getRecipes()) }

  // ---------------------------------------------------------------- S0-1
  var UXV_IDS = /^(gtceu:uxv_|gtceu:gg_uxv_s0_|grindless:gg_uxv_s0_)|gg_uxv_s0|uxv/
  var MATERIALS = ['cobalt', 'manganese', 'gallium', 'dysprosium', 'yttrium', 'scandium', 'gadolinium', 'terbium', 'ruthenium', 'iridium', 'tantalum', 'tungsten', 'curium', 'einsteinium', 'fermium']
  function s01() {
    var R = classes().Registries
    note('s0_1_counts', 'items ' + R.ITEMS.getKeys().size() + ', blocks ' + R.BLOCKS.getKeys().size() + ', fluids ' + R.FLUIDS.getKeys().size() + ', gtceu machines ' + classes().GTRegistries.MACHINES.keys().size())
    var it = ids(R.ITEMS, UXV_IDS, 600)
    var bl = ids(R.BLOCKS, UXV_IDS, 600)
    var mach = []
    array(classes().GTRegistries.MACHINES.keys()).forEach(function (k) { if (UXV_IDS.test(String(k))) mach.push(String(k)) })
    mach.sort()
    note('s0_1_items', it.length + ': ' + it.join(', '))
    note('s0_1_blocks', bl.length + ': ' + bl.join(', '))
    note('s0_1_machines', mach.length + ': ' + mach.join(', '))
    var want = ['gtceu:uxv_machine_hull', 'gtceu:uxv_energy_input_hatch', 'gtceu:uxv_energy_output_hatch', 'gtceu:uxv_energy_input_hatch_16a', 'gtceu:uxv_energy_output_hatch_16a']
    want.forEach(function (id) {
      var ok = R.BLOCKS.containsKey(rl(id)) && R.ITEMS.containsKey(rl(id)) && classes().GTRegistries.MACHINES.get(rl(id)) !== null
      check('s0_1_registered_' + id.substring(5), ok, ok ? 'block, item and machine definition exist' : 'MISSING')
    })
    try { note('s0_1_high_tier_content', 'machines.highTierContent = ' + Java.loadClass('com.gregtechceu.gtceu.config.ConfigHolder').INSTANCE.machines.highTierContent) } catch (e) { }
    var keep = []
    ;['uev', 'uiv'].forEach(function (t) {
      ;['machine_hull', 'energy_input_hatch', 'energy_output_hatch', 'energy_input_hatch_16a', 'energy_output_hatch_16a'].forEach(function (p) { keep.push('gtceu:' + t + '_' + p) })
    })
    check('s0_1_uev_uiv_kept', keep.every(function (id) { return R.BLOCKS.containsKey(rl(id)) }), 'the ten UEV and UIV ids register: ' + keep.length)
    var opv = R.BLOCKS.containsKey(rl('gtceu:opv_machine_casing'))
    check('s0_1_opv_casing', opv, 'gtceu:opv_machine_casing ' + opv + '; opv blocks: ' + ids(R.BLOCKS, /opv/, 20).join(', '))
    note('s0_1_machine_casings', ids(R.BLOCKS, /machine_casing$/, 40).join(', '))
    var labels = []
    want.forEach(function (id) {
      var def = classes().GTRegistries.MACHINES.get(rl(id))
      var s = 'n/a'
      try { s = String(Component.translatable(def.getDescriptionId()).getString()) } catch (e) { s = String(def.getDescriptionId()) }
      labels.push(id.substring(5) + ' -> ' + s)
    })
    note('s0_1_labels', 'VN[12] = ' + String(GTValues.VN[UXV]) + '; ' + labels.join(' ; '))
    var gtnn = ids(R.ITEMS, /^gtnn:/, 200)
    note('s0_1_gtnn_items', gtnn.length + ': ' + gtnn.join(', '))
    var gtnnUxv = gtnn.filter(function (s) { return /spintronic|cosmic|supracausal|uxv/.test(s) })
    check('s0_1_gtnn_uxv_items', gtnnUxv.length >= 3, gtnnUxv.join(', '))
    var spin = ids(R.ITEMS, /^gtnn:spintronic_mainframe$/, 3)
    var spinBlocks = ids(R.BLOCKS, /^gtnn:spintronic_mainframe$/, 3)
    var recs = []
    recipes().forEach(function (r) {
      var id = String(r.getId())
      if (id.indexOf('spintronic') >= 0 || (/mainframe/.test(id) && /spintronic|gtnn|circuit/.test(id))) recs.push(id)
    })
    check('s0_1_gtnn_spintronic_mainframe', spin.length + spinBlocks.length > 0, 'item ' + spin.join(',') + ' block ' + spinBlocks.join(',') + '; recipes by id ' + recs.length + ': ' + recs.join(', '))
    var ef = ids(R.ITEMS, /^extendedfeatures:/, 400).filter(function (s) { return /uxv|opv/.test(s) })
    note('s0_1_extendedfeatures_uxv_items', ef.length + ': ' + ef.join(', '))
    var gcyr = ids(R.ITEMS, /uxv/, 80).filter(function (s) { return !/^gtceu:/.test(s) && !/^grindless:/.test(s) })
    note('s0_1_other_uxv_items', gcyr.length + ': ' + gcyr.join(', '))
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
  }

  // ---------------------------------------------------------------- S0-3 / S0-9 / S0-10 figures
  var PLACES = ['grindless:s0_vela_pulsar_orbit', 'grindless:s0_cas_a_remnant']
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
  var OLD_PLANETS = ['gcyr:luna', 'gcyr:mars', 'gcyr:venus', 'gcyr:mercury', 'gcyr:proxima_centauri_b', 'grindless:sirius_b_orbit', 'grindless:alpha_centauri_orbit', 'grindless:barnard_b',
    'grindless:rx_j1856_orbit', 'grindless:psr_j0437_orbit', 'grindless:cygnus_x1_orbit']
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
      check('s0_3_dimensions_' + id.substring(10), want.every(function (w) { return dims.indexOf(w) >= 0 }), want.map(function (w) { return w + ':' + (dims.indexOf(w) >= 0) }).join(', '))
      try {
        var tier = Number(pl.rocketTier())
        check('s0_3_tier12_' + id.substring(10), tier === 12, 'rocket_tier ' + tier)
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

  // ---------------------------------------------------------------- S0-4 (static half)
  function s04() {
    var FRM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.electric.FusionReactorMachine')
    var cap = Number(FRM.calculateEnergyStorageFactor(UXV, 16))
    check('s0_4_storage_factor', cap === 10240000000, 'calculateEnergyStorageFactor(UXV, 16) = ' + cap + ' (expected 16 x 2^6 x 10,000,000 = 10,240,000,000)')
    var rows = []
    var dc = []
    recipes().forEach(function (rec) {
      var id = String(rec.getId())
      if (id.indexOf('gtceu:fusion_reactor/') === 0) {
        var ins = ''
        try { ins = fluids(classes().Helper.getInputFluids(rec)) } catch (e) { }
        rows.push(id.substring(21) + ' [' + ins + '] eut ' + inEUt(rec) + ' start ' + start(rec))
      }
      if (id.indexOf('direct_conversion/') >= 0) dc.push(id)
    })
    rows.sort()
    dc.sort()
    note('s0_4_fusion_rows', rows.length + ' rows: ' + rows.join(' ; '))
    note('s0_4_direct_conversion_rows', dc.length + ' rows: ' + dc.join(', '))
    var mk6 = ['mk6', 'uxv', 'p_ni', 'nb_gd', 'tc_cr', 'rh_ru']
    var hits = []
    rows.concat(dc).forEach(function (r) { mk6.forEach(function (w) { if (r.indexOf(w) >= 0) hits.push(w + ' in ' + r.substring(0, 60)) }) })
    note('s0_4_name_hits', hits.length + ' rows hit a Mk6-ish name: ' + hits.join(' ; '))
    var M = classes().GTRegistries.MACHINES.get(rl('gtceu:gg_uxv_s0_fusion'))
    check('s0_4_machine_registered', M !== null && M !== undefined, 'gtceu:gg_uxv_s0_fusion ' + String(M))
  }

  // ---------------------------------------------------------------- S0-5
  function s05() {
    var R = classes().Registries
    ;['uhv', 'uev', 'uiv', 'uxv'].forEach(function (t) {
      var members = []
      try { members = Ingredient.of('#gtceu:circuits/' + t).getStacks().toArray().map(function (s) { return String(s.getId()) }) } catch (e) { members = ['unreadable: ' + e] }
      note('s0_5_circuits_' + t, members.length + ': ' + members.join(', '))
      if (t === 'uxv') check('s0_5_uxv_members', members.indexOf('gtnn:spintronic_mainframe') >= 0, members.join(', '))
    })
  }

  // ---------------------------------------------------------------- S0-7
  function s07() {
    var M = classes().GTRegistries.MACHINES
    var tiers = ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv']
    var found = tiers.filter(function (t) { return M.get(rl('gtceu:' + t + '_gg_uxv_s0_w')) !== null })
    check('s0_7_twelve_tiers', found.length === 12, 'tiers(1..12) registered ' + found.length + ' of 12: ' + found.join(', '))
    var V = []
    for (var t = 10; t <= 12; t++) V.push(t + ':' + Number(GTValues.V[t]))
    note('s0_7_voltages', V.join(' '))
    ;[2, 4, 16, 64].forEach(function (a) {
      for (var t = 11; t <= 12; t++) {
        var cap = classes().EHPM.getHatchEnergyCapacity(t, a)
        note('s0_7_hatch_capacity_t' + t + '_' + a + 'a', 'getHatchEnergyCapacity = ' + String(cap) + ' (' + typeof cap + '), V*16*A = ' + (Number(GTValues.V[t]) * 16 * a))
      }
    })
    var BIG = 4026531840000
    var tag = new (classes().CompoundTag)()
    tag.putLong('cell', BIG)
    tag.putLong('sum', BIG + BIG + BIG)
    var back = Number(tag.getLong('cell'))
    var sum = Number(tag.getLong('sum'))
    check('s0_7_long_roundtrip', back === BIG && sum === 3 * BIG, 'NBT long ' + back + ', three cells ' + sum + ', int would wrap to ' + (BIG | 0))
    check('s0_7_format', String(classes().FU.formatNumbers(BIG)).length > 0, 'formatNumbers(4026531840000) = ' + classes().FU.formatNumbers(BIG))
    var v12 = Number(GTValues.V[UXV])
    note('s0_7_caps', 'V[UXV]*2*10 = ' + (v12 * 2 * 10) + '; V[UXV]*64*10 = ' + (v12 * 64 * 10) + ' (int max 2147483647; the first wraps as int to ' + ((v12 * 2 * 10) | 0) + ')')
    check('s0_7_repeater_item', classes().Registries.ITEMS.containsKey(rl('grindless:gg_uxv_s0_repeater')), 'item registered in the startup overlay')
  }

  // ---------------------------------------------------------------- S0-8
  function s08() {
    var Key = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey')
    var CH = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.ChemicalHelper')
    var TP = Java.loadClass('com.gregtechceu.gtceu.api.data.tag.TagPrefix')
    var m = GTMaterials.get('gg_uxv_s0_pasta_strand')
    check('s0_8_material', m !== null && m !== undefined && !m.isNull(), String(m))
    var R = classes().Registries
    note('s0_8_registry_ids', 'items ' + ids(R.ITEMS, /gg_uxv_s0_pasta_strand/, 60).join(', '))
    if (m === null || m === undefined || m.isNull()) return
    var wire = m.getProperty(Key.WIRE)
    check('s0_8_wire_property', wire !== null && wire !== undefined, String(wire))
    if (wire !== null && wire !== undefined) {
      var v = Number(wire.getVoltage()), a = Number(wire.getAmperage()), loss = Number(wire.getLossPerBlock())
      check('s0_8_wire_figures', v === Number(GTValues.V[UXV]) && a === 4 && loss === 0, 'voltage ' + v + ' (V[UXV] ' + Number(GTValues.V[UXV]) + '), amperage ' + a + ', loss/block ' + loss)
    }
    ;['wireGtSingle', 'wireGtDouble', 'wireGtQuadruple', 'wireGtOctal', 'wireGtHex', 'cableGtSingle', 'cableGtDouble', 'cableGtQuadruple', 'cableGtOctal', 'cableGtHex'].forEach(function (p) {
      try {
        var stack = CH.get(TP[p], m, 1)
        var empty = stack === null || stack.isEmpty()
        check('s0_8_' + p, !empty, empty ? 'no item' : String(R.ITEMS.getKey(stack.getItem())))
      } catch (e) { check('s0_8_' + p, false, 'lookup failed ' + e) }
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
  ServerEvents.customCommand('gg_test_uxv_s0_dump', function () {
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
        guarded('s0_4', s04)
        guarded('s0_5', s05)
        guarded('s0_7', s07)
        guarded('s0_8', s08)
        finish()
      }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
