// TEST ONLY, UV-S0 (S0-1 registry half, S0-2, S0-3 table). Merged from tools/test/uv-s0 over the instance at run time; never shipped.
// Command: kubejs custom_command gg_test_uv_s0_travel
(function () {
  var NAME = 'uv_s0'
  var LOADED = Date.now()
  var S = null
  function J(n) { return Java.loadClass(n) }
  function rl(s) { return new (J('net.minecraft.resources.ResourceLocation'))(s) }
  function check(name, ok, detail) {
    if (S && !ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 2500))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 2500)) }
  function levelOf(server, id) {
    return server.getLevel(rl(id))
  }
  function guarded(label, fn) { try { fn() } catch (e) { check(label + '_exception', false, e) } }

  function registry() {
    var Forge = J('net.minecraftforge.registries.ForgeRegistries')
    var id = 'grindless:s0_uv_tank'
    var b = Forge.BLOCKS.getValue(rl(id))
    check('s0_1_tank_registered', Forge.BLOCKS.containsKey(rl(id)), id + ' registered as ' + (b ? b.getClass().getName() : 'none'))
    var tier = 'unreadable'
    try { tier = String(b.getTier()) } catch (e) { tier = 'getTier threw ' + e }
    check('s0_1_tank_tier', tier === '11', 'tier read back from the block: ' + tier)
    var et = 'unreadable'
    try { et = String(Forge.BLOCKS.getValue(rl('gcyr:elite_rocket_motor')).getTier()) } catch (e) { et = 'getTier threw ' + e }
    note('s0_1_elite_motor_tier', et + ' (floor((motor + tank 11) / 2) = ' + Math.floor((Number(et) + 11) / 2) + ' under the 0.2.9 formula ZPM-B1 observed)')
  }

  function planets(server) {
    var PD = J('argent_matter.gcyr.data.loader.PlanetData')
    var want = [['grindless:s0_neptune', 6], ['grindless:s0_pluto', 7], ['grindless:saturn', 5], ['grindless:uranus', 6], ['gcyr:proxima_centauri_b', 8]]
    var bad = []
    var lines = []
    want.forEach(function (w) {
      var p = PD.getPlanet(rl(w[0]))
      if (p === null || p === undefined) { bad.push(w[0] + ' missing'); return }
      var tier = Number(p.rocketTier())
      var world = String(p.level().location())
      var orbit = String(p.orbitWorld().location())
      if (tier !== w[1]) bad.push(w[0] + ' tier ' + tier + ' != ' + w[1])
      if (!levelOf(server, world)) bad.push(world + ' dimension missing')
      if (!levelOf(server, orbit) && w[0] !== 'gcyr:proxima_centauri_b') bad.push(orbit + ' dimension missing')
      if (!levelOf(server, orbit) && w[0] === 'gcyr:proxima_centauri_b') note('s0_2_proxima_orbit', orbit + ' has no dimension in GCYR 0.2.9: the tier 8 planet is not reachable')
      lines.push(w[0] + ' tier ' + tier + ' world ' + world + ' orbit ' + orbit)
    })
    check('s0_2_planets', bad.length === 0, bad.length ? bad.join('; ') : lines.join(' ; '))
    note('s0_2_gating', 'GCYR RocketEntity refuses when partsTier < destination.rocketTier() (rocket_not_good_enough); the sky renderer is client-side and is not exercised on a server run')
  }

  function stationTable() {
    var st = global.grindless && global.grindless.stations
    var slots = st && st.slots ? st.slots : []
    var names = []
    for (var i = 0; i < slots.length; i++) names.push(slots[i].slot + '=' + slots[i].orbit)
    var all = names.join(',')
    check('s0_3_table', all.indexOf('neptune=grindless:s0_neptune_orbit') >= 0 && all.indexOf('pluto=grindless:s0_pluto_orbit') >= 0 && slots.length === 6, slots.length + ' slots: ' + all)
  }

  function ctors() {
    var C = J('java.lang.Class').forName('argent_matter.gcyr.api.space.station.SpaceStation')
    var cs = C.getDeclaredConstructors()
    var out = []
    for (var i = 0; i < cs.length; i++) out.push(String(cs[i].toString()))
    note('s0_3_spacestation_ctors', out.join(' ;; '))
    var fs = C.getDeclaredFields()
    var fo = []
    for (var j = 0; j < fs.length; j++) fo.push(String(fs[j].getName()))
    note('s0_3_spacestation_fields', fo.join(','))
  }

  ServerEvents.customCommand('gg_test_uv_s0_travel', function () { global.ggUvS0Travel = true; return 1 })
  ServerEvents.tick(function (event) {
    if (global.ggUvS0Travel === true && Date.now() - LOADED >= 10000) {
      global.ggUvS0Travel = false
      S = { failed: 0 }
      guarded('registry', registry)
      guarded('planets', function () { planets(event.server) })
      guarded('stations', stationTable)
      // guarded('ctors', ctors) -- java.lang.Class is blocked by the class filter
      console.info('GGTEST|' + NAME + '|TRAVEL|DONE|failures=' + S.failed)
    }
  })
})()
