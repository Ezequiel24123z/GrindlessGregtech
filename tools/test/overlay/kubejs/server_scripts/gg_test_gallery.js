// Gregtech Grindless - test overlay (not shipped with the pack)
//
// REAL-CLIENT gallery of our machines and check of our items' names and models (client suite only):
//   - the machines: every machine our startup scripts create, read from GTM's own KubeJS builder registry
//     (GTRegistryInfo.MACHINE: one builder per event.create(...) in GTCEuStartupEvents.registry('gtceu:machine'); a tiered
//     builder such as 'simple' or 'generator' makes gtceu:<tier>_<id> for each of its tiers). PANELS below orders them by era
//     and is checked against that registry: a machine of the table that is not registered fails, a registered one that is not
//     in the table is noted and shown on an extra panel;
//   - the gallery (this half): the band is cleared, a cyan wall goes up at Z 2 and every machine is set at Z 3 facing south
//     (GTM's machine block, not formed: a controller's front overlay shows on its casing either way), lit by invisible light
//     blocks at Z 4. One panel of 6 x 3 machines per era (steam to IV), one for the single-block machines, one for the wireless
//     energy tower and hatches (8 panels: the band's room is full); the player, in
//     spectator mode, is put 4.75 blocks in front of each panel and the client half takes one screenshot of it,
//     kubejs/exported/gg_gallery_<n>.png (HUD hidden). The panel_<n> NOTE lines give each panel's machines, top row first,
//     left to right;
//   - the client half (client_scripts/gg_test_gallery.js) checks names (en_us), item models (not the missing model, no missing
//     texture) and the controllers' front overlays, and writes kubejs/exported/gg_gallery_report.json.
//
// HOW TO RUN (client suite only; -Commands and -WaitForLog do not apply to it). Copy tools\test\overlay to a scratch folder,
// add kubejs\config\gg_test_gallery.json = {"enabled": true} to it, then
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite client -OverlayDir <that folder>
// One marker per run: the tests drive the same player.
//
// MARKERS: GGTEST|gallery|<check>|PASS|FAIL|NOTE|<detail>; one FAIL line per item with a problem; the last line is
// GGTEST|gallery|DONE.
// TEST AREA: Overworld band X 12800-12863, Y 98-112, Z 0-15 (cleared and force-loaded while the test runs; floor Y 98, wall Z 2,
// machines Z 3, light blocks Z 4); cleared again at the end, and the player goes back to where it was, in its game mode.
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var TAG = 'GGTEST|gallery|'
  var MARKER = 'kubejs/config/gg_test_gallery.json'
  var REQ = 'ggTestGalleryRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var BAND = { x0: 12800, x1: 12863, y0: 98, y1: 112, z0: 0, z1: 15 }
  var FLOOR_Y = 98
  var WALL_Z = 2
  var MACHINE_Z = 3
  var LIGHT_Z = 4
  // at FOV 70 on the 854x480 test screen, 4.75 blocks from the controllers' faces (Z 4) show 11.8 x 6.7 blocks there: one panel
  // (11 x 5 blocks), none of its neighbours (15 blocks apart, the other row 2 blocks above or below)
  var CAMERA_Z = 8.75
  var EYE = 1.62
  var COLS = 6
  var LEVELS = 3
  var PANEL_X0 = 12802
  var PANEL_DX = 15
  var PANELS_PER_ROW = 4
  var ROW_BASES = [99, 106]
  var WALL_BLOCK = 'minecraft:cyan_concrete'
  var FLOOR_BLOCK = 'minecraft:smooth_stone'
  var LIGHT_BLOCK = 'minecraft:light[level=15]'
  var PREFIXES = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max', 'lp_steam', 'hp_steam']
  // ids without the gtceu: namespace, as the startup scripts create them (fc85db5)
  var PANELS = [
    { name: 'steam', title: 'Steam age controllers', ids: ['steam_vein_drill', 'steam_greenhouse', 'coking_battery', 'steam_blast_furnace',
      'steam_observatory', 'steam_forge_hammer', 'steam_compressor', 'steam_alloy_smelter', 'steam_mixer', 'steam_chemical_bath',
      'steam_ore_washer', 'large_steam_macerator', 'large_steam_thermal_centrifuge', 'large_steam_ore_washer', 'large_steam_chemical_bath',
      'large_steam_centrifuge'] },
    { name: 'lv', title: 'LV controllers', ids: ['lv_vein_drill', 'lv_greenhouse', 'submerged_arc_furnace', 'sulfide_roaster', 'heliostat_tower',
      'optical_observatory', 'generator_array'] },
    { name: 'mv', title: 'MV controllers', ids: ['mv_vein_drill', 'mv_greenhouse', 'ore_plant', 'biorefinery', 'radio_telescope', 'engine_test_stand',
      'advanced_multi_smelter', 'lava_furnace', 'weather_controller', 'universal_processing_factory', 'universal_assembly_factory',
      'universal_separation_factory', 'universal_mixing_factory'] },
    { name: 'hv', title: 'HV controllers', ids: ['hv_vein_drill', 'hv_greenhouse', 'refinery', 'reformer', 'syngas_plant', 'composite_autoclave',
      'lunar_drill'] },
    { name: 'ev', title: 'EV controllers', ids: ['ev_vein_drill', 'sealed_dome', 'regolith_cell', 'platinum_plant', 'atmosphere_processor',
      'lunar_solar_array', 'deep_space_antenna', 'extraction_cascade', 'cryogenic_plant', 'combined_cycle_plant', 'hot_strip_mill'] },
    { name: 'iv', title: 'IV controllers', ids: ['pressurized_vein_drill', 'venus_heat_engine', 'venus_acid_works', 'mercury_vein_drill',
      'mercury_solar_works', 'mercury_solar_field', 'interferometer', 'isr_wellfield', 'fuel_fabrication_plant', 'fission_reactor', 'hot_cell',
      'heavy_water_plant', 'fluorspar_kiln', 'tritium_removal_facility'] },
    { name: 'single', title: 'single-block machines', ids: ['lv_creature_simulator', 'mv_creature_simulator', 'hv_creature_simulator',
      'ev_creature_simulator', 'ev_rtg'] },
    { name: 'wireless', title: 'wireless energy: the tower, every amperage at LV, every tier at 2 A', ids: wirelessIds() }
  ]

  // the Wireless Energy Tower and its 40 hatches (LV-IV, 2/4/16/64 A, energy and dynamo): the panel sets out the first 18 (one
  // panel); the rest are in the list, so the registry check still covers them
  function wirelessIds() {
    var ids = ['wireless_energy_tower', 'lv_wireless_energy_hatch', 'lv_wireless_energy_hatch_4a', 'lv_wireless_energy_hatch_16a',
      'lv_wireless_energy_hatch_64a', 'mv_wireless_energy_hatch', 'lv_wireless_dynamo_hatch', 'lv_wireless_dynamo_hatch_4a',
      'lv_wireless_dynamo_hatch_16a', 'lv_wireless_dynamo_hatch_64a', 'mv_wireless_dynamo_hatch', 'hv_wireless_energy_hatch',
      'hv_wireless_dynamo_hatch', 'ev_wireless_energy_hatch', 'ev_wireless_dynamo_hatch', 'iv_wireless_energy_hatch',
      'iv_wireless_dynamo_hatch', 'iv_wireless_energy_hatch_64a']
    ;['lv', 'mv', 'hv', 'ev', 'iv'].forEach(function (t) {
      ;['energy', 'dynamo'].forEach(function (k) {
        ;['', '_4a', '_16a', '_64a'].forEach(function (a) {
          var id = t + '_wireless_' + k + '_hatch' + a
          if (ids.indexOf(id) < 0) ids.push(id)
        })
      })
    })
    return ids
  }
  var START_TICKS = 40
  var FIRST_SHOT_TICKS = 300
  var SHOT_TICKS = 60
  var CHECK_TIMEOUT = 1800
  var SHOT_TIMEOUT = 900
  var TEST_TIMEOUT = 9000

  var T = null

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  function emit(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    if (!ok) T.failed.push(name)
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function shared() {
    if (!global.ggGallery) global.ggGallery = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggGallery
  }

  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function enabledByMarker() {
    try {
      var m = JsonIO.read(MARKER)
      return m !== null && m !== undefined && String(m.get('enabled')) === 'true'
    } catch (e) {
      return false
    }
  }

  function testPlayer(server) {
    var list = new (Java.loadClass('java.util.ArrayList'))(server.getPlayerList().getPlayers())
    for (var i = 0; i < list.size(); i++) {
      var p = list.get(i)
      if (T.playerName === '' || String(p.getName().getString()) === T.playerName) return p
    }
    return null
  }

  function cmd(text) {
    return Number(T.server.runCommandSilent(text))
  }

  function short(id) {
    return String(id).replace(/^gtceu:/, '')
  }

  // ---------------------------------------------------------------- the machines

  // a builder's own id; Rhino may hand a field that shares its name with a method back as one callable object, so the first-tier
  // definition's id (minus its tier prefix) is the fallback
  function builderId(b, defId) {
    var id = ''
    try { id = String(b.id) } catch (e) { id = '' }
    if (/^[a-z0-9_.\-]+:[a-z0-9_.\-\/]+$/.test(id)) return id
    return defId.replace(new RegExp('^([a-z0-9_.\\-]+:)(' + PREFIXES.join('|') + ')_'), '$1')
  }

  function registeredMachines() {
    var GRI = Java.loadClass('com.gregtechceu.gtceu.integration.kjs.GTRegistryInfo')
    var MMD = Java.loadClass('com.gregtechceu.gtceu.api.machine.MultiblockMachineDefinition')
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var found = []
    var odd = []
    var builders = 0
    var it = GRI.MACHINE.objects.values().iterator()
    while (it.hasNext()) {
      var b = it.next()
      builders++
      var def = null
      try { def = b.get() } catch (e) { def = null }
      if (def === null || def === undefined) {
        odd.push(String(b) + ' has no definition')
        continue
      }
      var defId = String(def.getId())
      var bid = builderId(b, defId)
      if (defId === bid) {
        found.push({ id: bid, kind: def instanceof MMD ? 'multiblock' : 'single' })
        continue
      }
      var ns = bid.split(':')[0]
      var path = bid.split(':')[1]
      var tiers = 0
      PREFIXES.forEach(function (t) {
        var rl = new RL(ns, t + '_' + path)
        if (BI.ITEM.containsKey(rl)) {
          found.push({ id: String(rl), kind: 'single' })
          tiers++
        }
      })
      if (tiers === 0) odd.push(bid + ': tiered builder without a registered tier (first definition ' + defId + ')')
    }
    return { found: found, odd: odd, builders: builders }
  }

  // the test table itself, if GTM's builder registry cannot be read: every id of it that is a registered item
  function tableMachines(error) {
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var found = []
    PANELS.forEach(function (pd) {
      pd.ids.forEach(function (path) {
        if (BI.ITEM.containsKey(new RL('gtceu', path))) found.push({ id: 'gtceu:' + path, kind: pd.name === 'single' ? 'single' : 'multiblock' })
      })
    })
    return { found: found, odd: [], builders: 0, error: String(error) }
  }

  function panelCamera(n) {
    var row = Math.floor(n / PANELS_PER_ROW)
    var x0 = PANEL_X0 + PANEL_DX * (n % PANELS_PER_ROW)
    var base = ROW_BASES[row]
    return { x0: x0, base: base, cam: { x: x0 + COLS - 0.5, y: base + LEVELS - 0.5 - EYE, z: CAMERA_Z } }
  }

  // panels in PANELS order, then the registered machines missing from PANELS on extra panels; slot s of a panel: row
  // floor(s / COLS) counted from the top, column s % COLS from the left as seen by the camera (west to east)
  function layout(reg) {
    var byId = {}
    reg.found.forEach(function (m) { byId[m.id] = m })
    var used = {}
    var missing = []
    var groups = []
    PANELS.forEach(function (pd) {
      var ids = []
      pd.ids.forEach(function (path) {
        var id = 'gtceu:' + path
        if (byId[id]) {
          ids.push(id)
          used[id] = true
        } else {
          missing.push(id)
        }
      })
      groups.push({ name: pd.name, title: pd.title, ids: ids })
    })
    var extra = reg.found.filter(function (m) { return !used[m.id] }).map(function (m) { return m.id })
    for (var i = 0; i < extra.length; i += COLS * LEVELS) {
      groups.push({ name: 'other', title: 'registered machines missing from the test table', ids: extra.slice(i, i + COLS * LEVELS) })
    }
    var panels = []
    var machines = []
    var maxPanels = PANELS_PER_ROW * ROW_BASES.length
    groups.forEach(function (g, n) {
      if (n >= maxPanels) {
        g.ids.forEach(function (id) { missing.push(id + ' (no room for panel ' + (n + 1) + ')') })
        return
      }
      var pc = panelCamera(n)
      var panel = { n: n + 1, name: g.name, title: g.title, file: 'gg_gallery_' + (n + 1) + '.png', cam: pc.cam, rows: [] }
      for (var r = 0; r < LEVELS; r++) panel.rows.push([])
      g.ids.slice(0, COLS * LEVELS).forEach(function (id, s) {
        var level = Math.floor(s / COLS)
        var col = s % COLS
        var m = { id: id, kind: byId[id].kind, panel: n + 1, row: level + 1, col: col + 1,
          x: pc.x0 + 2 * col, y: pc.base + 2 * (LEVELS - 1 - level), z: MACHINE_Z }
        panel.rows[level].push(id)
        machines.push(m)
      })
      panels.push(panel)
    })
    return { panels: panels, machines: machines, missing: missing, extra: extra }
  }

  // ---------------------------------------------------------------- the band

  function box(y0, y1, z0, z1) {
    return BAND.x0 + ' ' + y0 + ' ' + z0 + ' ' + BAND.x1 + ' ' + y1 + ' ' + z1
  }

  function killStrays() {
    return cmd('kill @e[type=!minecraft:player,x=' + BAND.x0 + ',y=' + BAND.y0 + ',z=' + BAND.z0 + ',dx=' + (BAND.x1 - BAND.x0) + ',dy=' +
      (BAND.y1 - BAND.y0) + ',dz=' + (BAND.z1 - BAND.z0) + ']')
  }

  function build(level) {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
    }
    T.areaTouched = true
    var loaded = cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + box(BAND.y0, BAND.y1, BAND.z0, BAND.z1) + ' minecraft:air')
    var floor = cmd('fill ' + box(FLOOR_Y, FLOOR_Y, BAND.z0, BAND.z1) + ' ' + FLOOR_BLOCK)
    var wall = cmd('fill ' + box(FLOOR_Y + 1, BAND.y1, WALL_Z, WALL_Z) + ' ' + WALL_BLOCK)
    var lights = cmd('fill ' + box(FLOOR_Y + 1, BAND.y1, LIGHT_Z, LIGHT_Z) + ' ' + LIGHT_BLOCK)
    note('area', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ': generated, forceload ' +
      loaded + ', cleared ' + cleared + ', floor ' + floor + ', wall ' + wall + ' (' + WALL_BLOCK + '), light blocks ' + lights)

    var bad = []
    var turned = []
    T.layout.machines.forEach(function (m) {
      var at = m.x + ' ' + m.y + ' ' + m.z + ' '
      var r = cmd('setblock ' + at + m.id + '[facing=south] replace')
      if (r < 1) {
        r = cmd('setblock ' + at + m.id + ' replace')
        turned.push(short(m.id) + ' (no facing=south)')
      }
      var block = level.getBlock(m.x, m.y, m.z)
      var got = String(block.getId())
      var facing = '?'
      try { facing = String(block.getProperties().get('facing')) } catch (e) { facing = '?' }
      if (got !== m.id) bad.push(short(m.id) + ' at ' + m.x + ' ' + m.y + ' ' + m.z + ' is ' + got)
      else if (facing !== 'south') turned.push(short(m.id) + ' faces ' + facing)
    })
    bad.forEach(function (b) { check('placed', false, b) })
    if (turned.length > 0) note('facing', 'not facing the camera: ' + turned.join(', '))
    if (bad.length === 0) check('placed', true, T.layout.machines.length + ' machines on the wall, ' + (T.layout.machines.length - turned.length) + ' facing south')
    killStrays()
  }

  function clearBand() {
    if (!T.areaTouched) return
    T.areaTouched = false
    var cleared = cmd('fill ' + box(BAND.y0, BAND.y1, BAND.z0, BAND.z1) + ' minecraft:air')
    var killed = killStrays()
    var released = cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('cleanup', 'cleared ' + cleared + ' blocks of the band, ' + killed + ' stray entities removed, forceload remove ' + released)
  }

  // ---------------------------------------------------------------- the player

  function gameModeOf(p) {
    try {
      var gm = p.gameMode
      if (gm === undefined || gm === null || typeof gm.getGameModeForPlayer !== 'function') gm = p.f_8941_
      return String(gm.getGameModeForPlayer().getName())
    } catch (e) {
      try { return p.isCreative() ? 'creative' : 'survival' } catch (e2) { return 'survival' }
    }
  }

  function remember(p) {
    var o = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, mode: gameModeOf(p) }
    try {
      o.x = Number(p.getX())
      o.y = Number(p.getY())
      o.z = Number(p.getZ())
      o.yaw = Number(p.getYaw())
      o.pitch = Number(p.getPitch())
    } catch (e) {
      var spawn = p.getLevel().getSharedSpawnPos()
      o.x = Number(spawn.getX()) + 0.5
      o.y = Number(spawn.getY()) + 1
      o.z = Number(spawn.getZ()) + 0.5
    }
    return o
  }

  function toCamera(p, panel) {
    p.teleportTo('minecraft:overworld', panel.cam.x, panel.cam.y, panel.cam.z, 180, 0)
  }

  function restorePlayer(server) {
    if (T.origin === null) return
    var p = testPlayer(server)
    if (p === null) return
    var o = T.origin
    T.origin = null
    try {
      p.teleportTo('minecraft:overworld', o.x, o.y, o.z, o.yaw, o.pitch)
    } catch (e) {
      note('restore', 'teleport back failed: ' + e)
    }
    var r = cmd('gamemode ' + o.mode + ' ' + T.playerName)
    note('restore', 'player back at ' + Math.round(o.x) + ' ' + Math.round(o.y) + ' ' + Math.round(o.z) + ' in ' + o.mode + ' (gamemode result ' + r + ')')
  }

  // ---------------------------------------------------------------- the steps

  function go(phase) {
    T.phase = phase
    T.since = T.t
  }

  function setup(server, p) {
    T.playerName = String(p.getName().getString())
    var reg = null
    try {
      reg = registeredMachines()
    } catch (e) {
      reg = tableMachines(e)
    }
    reg.odd.forEach(function (o) { note('registry', o) })
    T.layout = layout(reg)
    var multis = reg.found.filter(function (m) { return m.kind === 'multiblock' }).length
    if (reg.error) {
      check('machine_list', false, 'GTM\'s builder registry (GTRegistryInfo.MACHINE) could not be read (' + reg.error + '): the gallery and the checks use the ' +
        reg.found.length + ' registered machines of the test table')
    }
    T.layout.missing.forEach(function (id) { check('machine_list', false, id + ' is in the test table but not a registered machine of ours') })
    if (T.layout.extra.length > 0) {
      note('machine_list', 'registered machines missing from the test table (shown on the extra panel): ' + T.layout.extra.map(short).join(', '))
    }
    if (T.layout.missing.length === 0 && !reg.error) {
      check('machine_list', reg.found.length > 0, reg.builders + ' machine builders of our scripts (GTRegistryInfo.MACHINE) give ' + reg.found.length +
        ' machines: ' + multis + ' controllers and ' + (reg.found.length - multis) + ' single-block machines, every one of the test table registered')
    }
    T.layout.panels.forEach(function (panel) {
      var names = ['top', 'middle', 'bottom']
      note('panel_' + panel.n, panel.file + ': ' + panel.title + ' (' + panel.rows.reduce(function (a, r) { return a + r.length }, 0) + '); ' +
        panel.rows.map(function (r, i) { return names[i] + ': ' + (r.length > 0 ? r.map(short).join(', ') : '-') }).join('; ') +
        '; eye at ' + panel.cam.x + ' ' + Math.round((panel.cam.y + EYE) * 100) / 100 + ' ' + panel.cam.z + ', looking north')
    })
    shared().put('machines', JSON.stringify(T.layout.machines))
    shared().put('panels', JSON.stringify(T.layout.panels))
    shared().put('checkResult', '')
    shared().put('checkToken', 'c' + T.t)

    T.origin = remember(p)
    var level = p.getLevel()
    build(level)
    cmd('time set 6000')
    cmd('weather clear')
    T.cycle = cmd('gamerule doDaylightCycle false')
    var spec = cmd('gamemode spectator ' + T.playerName)
    if (T.layout.panels.length > 0) toCamera(p, T.layout.panels[0])
    note('setup', 'player ' + T.playerName + ' (was ' + T.origin.mode + ' at ' + Math.round(T.origin.x) + ' ' + Math.round(T.origin.y) + ' ' +
      Math.round(T.origin.z) + ') in spectator mode (result ' + spec + '), noon, clear weather, daylight cycle stopped; ' + T.layout.panels.length + ' panels')
    T.shot = 0
    T.shots = []
  }

  function requestShot(p) {
    var panel = T.layout.panels[T.shot]
    var probe = null
    T.layout.machines.forEach(function (m) { if (probe === null && m.panel === panel.n) probe = m })
    killStrays()
    shared().put('shotResult', '')
    shared().put('shotRequest', JSON.stringify({ name: 'gg_gallery_' + panel.n, n: panel.n, cam: panel.cam,
      probe: probe === null ? null : { x: probe.x, y: probe.y, z: probe.z, id: probe.id } }))
    shared().put('shotToken', 's' + T.t)
  }

  function step(server) {
    var p = testPlayer(server)
    if (p === null) {
      check('player_present', false, 'the test player left during ' + T.phase)
      finish(server)
      return
    }
    var age = T.t - T.since

    if (T.phase === 'start') {
      if (age < START_TICKS) return
      setup(server, p)
      go('checks')
      return
    }
    if (T.phase === 'checks') {
      var r = sval('checkResult')
      if (r === '' && age < CHECK_TIMEOUT) return
      check('client_checks', r.indexOf('PASS') === 0, r === '' ? 'the client never answered' : r)
      go(T.layout.panels.length > 0 ? 'aim' : 'cleanup')
      return
    }
    if (T.phase === 'aim') {
      if (T.aimed !== T.shot) {
        toCamera(p, T.layout.panels[T.shot])
        T.aimed = T.shot
      }
      // the first panel waits for the client to load and draw the band
      if (age < (T.shot === 0 ? FIRST_SHOT_TICKS : SHOT_TICKS)) return
      requestShot(p)
      go('shot')
      return
    }
    if (T.phase === 'shot') {
      var s = sval('shotResult')
      if (s === '' && age < SHOT_TIMEOUT) return
      var file = T.layout.panels[T.shot].file
      if (s.indexOf('PASS') === 0) T.shots.push(file)
      else T.shotFails.push(s === '' ? file + ': the client never answered' : s.replace(/^FAIL /, ''))
      T.shot++
      go(T.shot < T.layout.panels.length ? 'aim' : 'cleanup')
      return
    }
    if (T.phase === 'cleanup') {
      check('screenshots', T.shotFails.length === 0 && T.shots.length === T.layout.panels.length, T.shots.length + ' of ' + T.layout.panels.length +
        ' panels in kubejs/exported: ' + T.shots.join(', ') + (T.shotFails.length > 0 ? '; failed: ' + T.shotFails.join('; ') : ''))
      finish(server)
    }
  }

  function finish(server) {
    if (T === null || T.finished) return
    T.finished = true
    try { restorePlayer(server) } catch (e) { note('restore', 'failed: ' + e) }
    try { clearBand() } catch (e2) { note('cleanup', 'failed: ' + e2) }
    if (T.cycle !== null) cmd('gamerule doDaylightCycle true')
    check('all', T.failed.length === 0, T.failed.length === 0 ? 'names, models and overlays of our items and machines are fine, every panel photographed'
      : 'failed: ' + T.failed.filter(function (f, i) { return T.failed.indexOf(f) === i }).join(', '))
    shared().put('hold', false)
    global[REQ + 'Done'] = true
    console.info(TAG + 'DONE')
  }

  function onTick(server) {
    if (global[REQ] && T === null && Date.now() - LOADED_AT >= QUIET_MS && Date.now() >= Number(global[REQ + 'At'] || 0)) {
      global[REQ] = false
      T = { t: 0, tick0: server.getTickCount(), phase: 'start', since: 0, failed: [], finished: false, playerName: '', server: server,
        layout: null, origin: null, areaTouched: false, cycle: null, shot: 0, aimed: -1, shots: [], shotFails: [] }
    }
    if (T === null || T.finished) return
    T.server = server
    T.t = server.getTickCount() - T.tick0
    if (T.t > TEST_TIMEOUT) {
      check('timeout', false, 'the test ran ' + T.t + ' ticks; phase ' + T.phase)
      finish(server)
      return
    }
    try {
      step(server)
    } catch (e) {
      check('step', false, 'exception in ' + T.phase + ': ' + e)
      finish(server)
    }
  }

  ServerEvents.tick(function (event) {
    onTick(event.server)
  })

  PlayerEvents.loggedIn(function (event) {
    if (global[REQ + 'Done'] || T !== null || !enabledByMarker()) return
    global[REQ + 'At'] = Date.now() + 5000
    global[REQ] = true
    shared().put('hold', true)
    shared().put('checkToken', '')
    shared().put('shotToken', '')
    note('armed', 'player ' + event.player.getName().getString() + ' joined and ' + MARKER + ' is present: the gallery test starts in a few seconds')
  })
})()
