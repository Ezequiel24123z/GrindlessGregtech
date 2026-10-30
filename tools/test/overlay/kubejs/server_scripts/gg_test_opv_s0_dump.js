// priority: -6220
// TEST ONLY, OpV-S0. Command: kubejs custom_command gg_test_opv_s0_dump
// Disposable read-only spikes, never shipped. Places nothing.
//   s0_3_*, s0_8_*  the two throwaway datapack places as GCYR loads them: tier 13, gravity, atmosphere, dimensions, orbit lookup
//   s0_4_*          #gtceu:circuits/opv and #gtceu:circuits/max members; GT--'s cosmic mainframe and SMD recipes after the removal in this file's recipe event
//   s0_6_*          the wireless long maths at tier 13 (V[OpV] x amps x 10), thirteen tiers in one builder, hatch capacities, NBT long round trip, and, with the
//                   temp pack copy E2 (case 13 and a tier-13 table row), the OpV wireless ids
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestOpvS0DumpRequest'
  var LOADED = Date.now()
  var NAME = 'opv_s0_dump'
  var OPV = 13
  var REMOVE = ['gtnn:cosmic_mainframe', 'gtnn:cosmic_smd_capacitor', 'gtnn:cosmic_smd_diode', 'gtnn:cosmic_smd_inductor', 'gtnn:cosmic_smd_resistor', 'gtnn:cosmic_smd_transistor']

  var marker = JsonIO.read('kubejs/config/gg_test_opv_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  ServerEvents.recipes(function (event) {
    if (!ON) return
    var before = {}
    var errors = []
    REMOVE.forEach(function (id) {
      try {
        var n = 0
        event.forEachRecipe({ output: id }, function (r) { n++ })
        before[id] = n
        event.remove({ output: id })
      } catch (e) { errors.push(id + ': ' + e) }
    })
    global.ggTestOpvS0Removed = JSON.stringify({ before: before, errors: errors })
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
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
  function recipes() { return array(S.server.getRecipeManager().getRecipes()) }

  // ---------------------------------------------------------------- S0-3 and S0-8
  var PLACES = [
    { id: 'grindless:s0_sgr1806_orbit', gravity: 0.0, atmosphere: false },
    { id: 'grindless:s0_terzan5_core', gravity: 1.0, atmosphere: false }
  ]
  var OLD_PLANETS = ['gcyr:luna', 'gcyr:mars', 'grindless:cygnus_x1_orbit', 'grindless:vela_pulsar_orbit', 'grindless:cas_a_remnant']
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
  function s0308() {
    var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    var keys = array(PD.planets().keySet()).map(String)
    keys.sort()
    note('s0_3_planets', keys.length + ': ' + keys.join(', '))
    var dims = array(S.server.levelKeys()).map(function (k) { return String(k.location()) })
    dims.sort()
    PLACES.forEach(function (p) {
      var short = p.id.substring(10)
      var pl = PD.getPlanet(rl(p.id))
      var ok = pl !== null && pl !== undefined
      check('s0_3_place_' + short, ok, ok ? planetInfo(pl) : 'not loaded')
      if (!ok) return
      var orbitKey = pl.orbitWorld()
      var orbit = String(orbitKey.location())
      var want = [orbit, String(pl.level().location())]
      check('s0_3_dimensions_' + short, want.every(function (w) { return dims.indexOf(w) >= 0 }), want.map(function (w) { return w + ':' + (dims.indexOf(w) >= 0) }).join(', '))
      var tier = Number(pl.rocketTier())
      check('s0_3_tier13_' + short, tier === OPV, 'rocket_tier read back ' + tier + ' (written 13)')
      check('s0_8_atmosphere_' + short, Boolean(pl.hasAtmosphere()) === p.atmosphere && Boolean(pl.hasOxygen()) === false,
        'has_atmosphere ' + pl.hasAtmosphere() + ', has_oxygen ' + pl.hasOxygen() + ' (written ' + p.atmosphere + ', false)')
      check('s0_8_gravity_' + short, Number(pl.gravity()) === p.gravity, 'gravity read back ' + pl.gravity() + ' (written ' + p.gravity + ')')
      note('s0_8_figures_' + short, 'temperature ' + pl.temperature() + ', solar_power ' + pl.solarPower() + ', days_in_year ' + pl.daysInYear())
      try {
        var back = PD.getPlanetFromOrbit(orbitKey)
        check('s0_3_from_orbit_' + short, back !== null && back !== undefined, 'getPlanetFromOrbit(' + orbit + ') = ' + String(back))
      } catch (e) { check('s0_3_from_orbit_' + short, false, String(e)) }
    })
    OLD_PLANETS.forEach(function (id) { check('s0_3_kept_' + id.replace(':', '_'), keys.indexOf(id) >= 0, id + (keys.indexOf(id) >= 0 ? ' still loads' : ' MISSING')) })
    note('s0_3_levels', dims.join(', '))
  }

  // ---------------------------------------------------------------- S0-4
  function members(tag) {
    try { return Ingredient.of('#' + tag).getStacks().toArray().map(function (s) { return String(s.getId()) }) } catch (e) { return ['unreadable: ' + e] }
  }
  function s04() {
    var opv = members('gtceu:circuits/opv')
    var max = members('gtceu:circuits/max')
    note('s0_4_tag_opv', opv.length + ': ' + opv.join(', '))
    note('s0_4_tag_max', max.length + ': ' + max.join(', '))
    check('s0_4_cosmic_in_opv_tag', opv.indexOf('gtnn:cosmic_mainframe') >= 0, '#gtceu:circuits/opv = ' + opv.join(', '))
    var R = classes().Registries
    check('s0_4_items_kept', REMOVE.every(function (id) { return R.ITEMS.containsKey(rl(id)) }), 'the six items still register after the recipe removal: ' +
      REMOVE.map(function (id) { return id.substring(5) + ':' + R.ITEMS.containsKey(rl(id)) }).join(' '))
    var info = { before: {}, errors: [] }
    try { info = JSON.parse(String(global.ggTestOpvS0Removed || '{"before":{},"errors":["recipe event did not run"]}')) } catch (e) { info.errors.push('unparsable ' + e) }
    note('s0_4_before_removal', JSON.stringify(info.before))
    var left = []
    recipes().forEach(function (r) {
      try {
        var out = String(r.getResultItem(S.server.registryAccess()).getItem())
        REMOVE.forEach(function (id) { if (out.indexOf(id.substring(5)) >= 0) left.push(String(r.getId())) })
      } catch (e) { }
    })
    check('s0_4_removed', info.errors.length === 0 && left.length === 0, 'errors ' + JSON.stringify(info.errors) + '; vanilla-style recipes left with those outputs: ' + left.length + ' ' + left.slice(0, 6).join(', '))
    var gtnnIds = []
    recipes().forEach(function (r) {
      var id = String(r.getId())
      if (id.indexOf('cosmic') >= 0) gtnnIds.push(id)
    })
    note('s0_4_cosmic_recipe_ids_left', gtnnIds.length + ': ' + gtnnIds.slice(0, 20).join(', '))
  }

  // ---------------------------------------------------------------- S0-6
  function s06() {
    var M = classes().GTRegistries.MACHINES
    var tiers = ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv']
    var found = tiers.filter(function (t) { return M.get(rl('gtceu:' + t + '_gg_opv_s0_w')) !== null })
    check('s0_6_thirteen_tiers', found.length === 13, 'tiers(1..13) registered ' + found.length + ' of 13: ' + found.join(', '))
    var v = Number(GTValues.V[OPV])
    note('s0_6_voltages', 'V[12]=' + Number(GTValues.V[12]) + ' V[13]=' + v + ' V[14]=' + Number(GTValues.V[14]))
    var caps = {}
    ;[2, 4, 16, 64].forEach(function (a) {
      var cap = classes().EHPM.getHatchEnergyCapacity(OPV, a)
      note('s0_6_hatch_capacity_' + a + 'a', 'getHatchEnergyCapacity(13, ' + a + ') = ' + String(cap) + ' (' + typeof cap + '), V*16*A = ' + (v * 16 * a))
      caps[a] = v * a * 10
    })
    check('s0_6_cap_figures', caps[2] === 10737418240 && caps[4] === 21474836480 && caps[16] === 85899345920 && caps[64] === 343597383680,
      'V[OpV] x amps x 10: ' + caps[2] + ', ' + caps[4] + ', ' + caps[16] + ', ' + caps[64] + ' (the design table: 10,737,418,240 / 21,474,836,480 / 85,899,345,920 / 343,597,383,680); the 2 A one as int wraps to ' + (caps[2] | 0))
    var tag = new (classes().CompoundTag)()
    tag.putLong('cap64', caps[64])
    tag.putLong('stored', 3 * caps[64])
    check('s0_6_long_roundtrip', Number(tag.getLong('cap64')) === caps[64] && Number(tag.getLong('stored')) === 3 * caps[64], 'NBT long ' + tag.getLong('cap64') + ' and ' + tag.getLong('stored'))
    check('s0_6_format', String(classes().FU.formatNumbers(caps[64])).length > 0, 'formatNumbers(' + caps[64] + ') = ' + classes().FU.formatNumbers(caps[64]))
    var perTick = v * 16
    note('s0_6_amperage', 'a 16 A hatch moves ' + perTick + ' EU/t = 2^' + Math.round(Math.log(perTick) / Math.LN2) + '; a 64 A one ' + v * 64)
    var W = global.grindless && global.grindless.wireless
    if (W && W.cells) {
      var ids = []
      ;['wireless_energy_hatch', 'wireless_energy_hatch_4a', 'wireless_energy_hatch_16a', 'wireless_energy_hatch_64a', 'wireless_dynamo_hatch', 'wireless_dynamo_hatch_4a', 'wireless_dynamo_hatch_16a', 'wireless_dynamo_hatch_64a'].forEach(function (s) { ids.push('gtceu:opv_' + s) })
      var present = ids.filter(function (id) { return classes().Registries.ITEMS.containsKey(rl(id)) })
      note('s0_6_wireless_ids', present.length + ' of 8 OpV wireless hatches register: ' + present.join(', '))
      var cell = W.cells['grindless:opv_smes_cell']
      note('s0_6_wireless_cell', JSON.stringify(cell || null))
      if (present.length > 0) {
        var rate = Number(W.rate(OPV, 64)) * Number(W.settleTicks)
        check('s0_6_wireless_registered', present.length === 8 && !!cell && Number(cell.tier) === OPV, 'case 13 and the tier-13 row (E2): ' + present.length + ' hatches, cell ' + JSON.stringify(cell || null))
        check('s0_6_wireless_rate', Number(W.rate(OPV, 64)) === v * 64, 'W.rate(13, 64) = ' + W.rate(OPV, 64) + ' (expected ' + v * 64 + '), x settleTicks ' + W.settleTicks + ' = ' + rate)
      }
    } else note('s0_6_wireless', 'global.grindless.wireless is not available')
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function guarded(label, fn) {
    try { fn() } catch (e) { check(label + '_exception', false, String(e)) }
  }
  ServerEvents.customCommand('gg_test_opv_s0_dump', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        S = { server: event.server, failed: 0, finished: false }
        guarded('s0_3_s0_8', s0308)
        guarded('s0_4', s04)
        guarded('s0_6', s06)
        finish()
      }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
