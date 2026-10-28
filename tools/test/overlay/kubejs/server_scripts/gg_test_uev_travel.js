// priority: -7779
// TEST ONLY, UEV-B1. Command: kubejs custom_command gg_test_uev_travel
// Band ONLY: X 32768-32831, Z 0-63, Overworld Y 60-120 (nothing is placed there: the checks are registry and SavedData reads).
// Doubts: the datapack places load with the final ids, the DFD motors register at GCYR tiers 7 and 9, and stations nine and ten
// (Alpha Centauri AB orbit, Sirius B orbit) deploy through GCYR's holder, survive a disk save, and the eight older stations are unchanged.
//   motor_*     both DFD motor blocks exist
//   place_*     the three planets, their levels and the Barnard b surface and orbit
//   slots_*     global.grindless.stations.slots: ten orbits, the first eight unchanged
//   station_*   deploy, save, read back; older orbits' station counts unchanged
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUevTravelRequest'
  var LOADED = Date.now()
  var NAME = 'uev_travel'
  var ALPHA = 'grindless:alpha_centauri_orbit'
  var SIRIUS = 'grindless:sirius_b_orbit'
  var BARNARD = 'grindless:barnard_b'
  var BARNARD_ORBIT = 'grindless:barnard_b_orbit'
  var STATIONS_FILE = 'gcyr_space_stations'
  var DATA_VERSION = 3465
  var OLDER = ['gcyr:overworld_orbit', 'grindless:io_orbit', 'grindless:saturn_orbit', 'grindless:uranus_orbit', 'grindless:neptune_orbit',
    'grindless:pluto_orbit', 'gcyr:mercury_orbit', 'grindless:proxima_b_orbit']
  var SLOTS_WANT = OLDER.concat([ALPHA, SIRIUS])
  var NEW = [
    { key: 'alpha', orbit: ALPHA, planet: ALPHA },
    { key: 'sirius', orbit: SIRIUS, planet: SIRIUS }
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Integer: Java.loadClass('java.lang.Integer'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
      Stations: Java.loadClass('argent_matter.gcyr.api.capability.GCYRCapabilityHelper'),
      StationData: Java.loadClass('argent_matter.gcyr.api.space.station.StationWorldSavedData')
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
  function clean(s) { return String(s).replace(/\|/g, '/').replace(/\s+/g, ' ').substring(0, 2000) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function jcall(obj, names, args) {
    var a = args || []
    for (var i = 0; i < names.length; i++) {
      var n = names[i]
      if (typeof obj[n] !== 'function') continue
      if (a.length === 0) return obj[n]()
      if (a.length === 1) return obj[n](a[0])
      return obj[n](a[0], a[1])
    }
    throw new Error('no method ' + names.join('/') + ' on ' + obj)
  }
  function levelOf(id) { return S.server.getLevel(String(id)) }
  function dimKey(level) {
    var d = level.dimension
    var id = typeof d === 'function' ? String(level.dimension().location()) : String(d)
    var RK = Java.loadClass('net.minecraft.resources.ResourceKey')
    var Registries = Java.loadClass('net.minecraft.core.registries.Registries')
    return RK.create(Registries.DIMENSION, rl(id))
  }
  function holderOf(id) { return classes().Stations.getSpaceStations(levelOf(id)) }
  function countOf(id) { return Number(holderOf(id).getFreeStationId()) }
  function planetName(p) { return p === null || p === undefined ? 'none' : String(p.level().location()) }
  function unwrap(o) {
    if (o === null || o === undefined) return null
    if (typeof o.isPresent === 'function') return o.isPresent() ? o.get() : null
    return o
  }
  function fromOrbit(level) { return unwrap(classes().PlanetData.getPlanetFromOrbit(dimKey(level))) }

  function motors() {
    ;['grindless:dfd_mk1_motor', 'grindless:dfd_mk2_motor'].forEach(function (id) {
      check('motor_' + id.split(':')[1], Item.exists(id), id + ' ' + Item.exists(id))
    })
  }

  function places() {
    var PD = classes().PlanetData
    var wantTier = {}; wantTier[ALPHA] = 9; wantTier[BARNARD] = 9; wantTier[SIRIUS] = 10
    var parts = []
    var ok = true
    Object.keys(wantTier).forEach(function (id) {
      var p = unwrap(PD.getPlanet(rl(id)))
      var tier = p === null ? -1 : Number(p.rocketTier())
      var orbit = p === null ? 'none' : String(p.orbitWorld().location())
      parts.push(id + ': tier ' + tier + ', orbit ' + orbit)
      if (tier !== wantTier[id]) ok = false
    })
    check('place_planets', ok, parts.join('; '))
    var lv = [ALPHA, SIRIUS, BARNARD, BARNARD_ORBIT].map(function (id) { return id + ' ' + (levelOf(id) !== null) })
    check('place_levels', lv.every(function (s) { return /true$/.test(s) }), lv.join(', '))
    var back = []
    var mapOk = true
    NEW.concat([{ orbit: BARNARD_ORBIT, planet: BARNARD }]).forEach(function (n) {
      var level = levelOf(n.orbit)
      if (level === null) { mapOk = false; back.push(n.orbit + ' no level'); return }
      var got = planetName(fromOrbit(level))
      if (got !== n.planet) mapOk = false
      back.push(n.orbit + ' -> ' + got)
    })
    check('place_orbits_map_back', mapOk, back.join('; '))
  }

  function slots() {
    var orbits = []
    try {
      var sl = global.grindless.stations.slots
      for (var i = 0; i < sl.length; i++) orbits.push(String(sl[i].orbit))
    } catch (e) { orbits = ['unreadable (' + e + ')'] }
    check('slots_ten', orbits.join(',') === SLOTS_WANT.join(','), orbits.join(', '))
    check('slots_first_eight_unchanged', orbits.slice(0, 8).join(',') === OLDER.join(','), orbits.slice(0, 8).join(', '))
  }

  function stations() {
    var L = classes()
    var before = {}
    OLDER.forEach(function (o) { before[o] = levelOf(o) === null ? -1 : countOf(o) })
    var made = {}
    NEW.forEach(function (n) {
      try {
        var lv = levelOf(n.orbit)
        var holder = L.Stations.getSpaceStations(lv)
        var pl = fromOrbit(lv)
        if (pl === null) throw new Error('no planet for this orbit')
        var pair = holder.allocateStation(pl)
        var id = Number(pair.getFirst())
        holder.addStation(id | 0, pair.getSecond())
        try { jcall(holder, ['setDirty', 'm_77762_']) } catch (e) { note('station_dirty_' + n.key, String(e)) }
        var st = holder.getStation(L.Integer.valueOf(String(id | 0)))
        made[n.key] = id
        check('station_deploy_' + n.key, st !== null && st !== undefined && Number(holder.getFreeStationId()) !== id,
          n.orbit + ': station ' + id + ' for ' + planetName(pl))
      } catch (e) {
        check('station_deploy_' + n.key, false, n.orbit + ': ' + e)
      }
    })
    var saved = []
    NEW.forEach(function (n) {
      if (made[n.key] === undefined) return
      try {
        jcall(levelOf(n.orbit).getDataStorage(), ['save', 'm_78151_'], [])
        saved.push(n.orbit)
      } catch (e) { saved.push(n.orbit + ' failed: ' + e) }
    })
    note('station_save', 'DimensionDataStorage.save() for ' + saved.join(', '))
    NEW.forEach(function (n) {
      if (made[n.key] === undefined) return
      var ok = false
      var detail = ''
      try {
        var lv = levelOf(n.orbit)
        var tag = jcall(lv.getDataStorage(), ['readTagFromDisk', 'm_78158_'], [STATIONS_FILE, DATA_VERSION])
        var data = tag.getCompound('data')
        var keys = array(data.getCompound('stations').getAllKeys()).map(String)
        var fresh = new L.StationData(lv, data)
        var back = fresh.getStation(L.Integer.valueOf(String(made[n.key] | 0)))
        ok = keys.indexOf(String(made[n.key])) >= 0 && back !== null && back !== undefined
        detail = n.orbit + ' stations {' + keys.join(', ') + '}; reloaded ' + made[n.key] + ': ' + (back === null || back === undefined ? 'none' : String(back))
      } catch (e) { detail = 'unreadable: ' + e }
      check('station_saved_' + n.key, ok, detail)
    })
    var changed = []
    OLDER.forEach(function (o) {
      var now = levelOf(o) === null ? -1 : countOf(o)
      if (now !== before[o]) changed.push(o + ' ' + before[o] + ' -> ' + now)
    })
    check('station_older_unchanged', changed.length === 0 && OLDER.every(function (o) { return before[o] >= 0 }),
      changed.length === 0 ? 'eight older orbits unchanged' : changed.join(', '))
  }

  function run(server) {
    S = { server: server, failed: 0 }
    try { motors() } catch (e) { check('motor_exception', false, String(e)) }
    try { places() } catch (e) { check('place_exception', false, String(e)) }
    try { slots() } catch (e) { check('slots_exception', false, String(e)) }
    try { stations() } catch (e) { check('station_exception', false, String(e)) }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_uev_travel', function () {
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    if (global[REQUEST] !== true || Date.now() - LOADED < 10000) return
    global[REQUEST] = false
    try { run(event.server) } catch (e) {
      if (S === null) S = { server: event.server, failed: 0 }
      check('exception', false, String(e))
      console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    }
  })
})()
