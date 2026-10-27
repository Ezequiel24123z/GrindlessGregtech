// TEST ONLY, UHV-B1. Command: kubejs custom_command gg_test_uhv_travel
// Band ONLY: X 28928-28991, Z 0-63, Overworld Y 60-120 (nothing is placed there: the checks are registry, recipe and SavedData reads).
// Doubt: the Proxima b override (S0-3's path) and stations seven and eight in the real game: GCYR's Proxima b is tier 8 with orbit
// grindless:proxima_b_orbit, both levels exist, each new orbit maps back to its planet; a station deployed through GCYR's own holder
// (allocateStation, the station item's path) in gcyr:mercury_orbit and grindless:proxima_b_orbit survives a disk save
// (DimensionDataStorage.save, then readTagFromDisk, then a fresh StationWorldSavedData), and the six older orbits keep their stations.
//   planet_*    PlanetData: Proxima b's tier, orbit, levels; the two orbits map to their planets
//   slots_*     global.grindless.stations.slots: eight orbits, the first six unchanged
//   station_*   deploy, save, read back; older orbits' station counts unchanged
//   recipe_*    the lunar field's Proxima row (dimension + biome, no daytime) and the Mercury orbit seed load under their ids
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestUhvTravelRequest'
  var LOADED = Date.now()
  var NAME = 'uhv_travel'
  var PROXIMA = 'gcyr:proxima_centauri_b'
  var ORBIT = 'grindless:proxima_b_orbit'
  var STATIONS_FILE = 'gcyr_space_stations'
  var DATA_VERSION = 3465
  var SLOTS_WANT = ['gcyr:overworld_orbit', 'grindless:io_orbit', 'grindless:saturn_orbit', 'grindless:uranus_orbit', 'grindless:neptune_orbit',
    'grindless:pluto_orbit', 'gcyr:mercury_orbit', ORBIT]
  var NEW = [
    { key: 'mercury', orbit: 'gcyr:mercury_orbit', planet: 'gcyr:mercury' },
    { key: 'proxima', orbit: ORBIT, planet: PROXIMA }
  ]
  var SOLAR = 'grindless:lunar_solar/proxima'
  var SEED = 'grindless:chemical_reactor/hermean_quantum_seed_orbit'

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Integer: Java.loadClass('java.lang.Integer'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
      Stations: Java.loadClass('argent_matter.gcyr.api.capability.GCYRCapabilityHelper'),
      StationData: Java.loadClass('argent_matter.gcyr.api.space.station.StationWorldSavedData'),
      SpaceStation: Java.loadClass('argent_matter.gcyr.api.space.station.SpaceStation')
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
  function byId(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  // KubeJS's getLevel(String) (a ResourceKey argument is ambiguous for Rhino)
  function levelOf(id) { return S.server.getLevel(String(id)) }
  // KubeJS shows Level.dimension() as the property level.dimension (a ResourceLocation); GCYR's PlanetData wants the ResourceKey
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
  // PlanetData's lookups may hand back an Optional
  function unwrap(o) {
    if (o === null || o === undefined) return null
    if (typeof o.isPresent === 'function') return o.isPresent() ? o.get() : null
    return o
  }
  function fromOrbit(level) { return unwrap(classes().PlanetData.getPlanetFromOrbit(dimKey(level))) }

  // ---------------------------------------------------------------- planet
  function planet() {
    var PD = classes().PlanetData
    var p = unwrap(PD.getPlanet(rl(PROXIMA)))
    var tier = p === null || p === undefined ? -1 : Number(p.rocketTier())
    var orbit = p === null || p === undefined ? 'none' : String(p.orbitWorld().location())
    check('planet_proxima', tier === 8 && orbit === ORBIT, PROXIMA + ': rocket tier ' + tier + ', orbit ' + orbit)
    var surface = levelOf(PROXIMA)
    var orb = levelOf(ORBIT)
    check('planet_levels', surface !== null && orb !== null, PROXIMA + ' ' + (surface !== null) + ', ' + ORBIT + ' ' + (orb !== null))
    var back = []
    var ok = true
    NEW.forEach(function (n) {
      var lv = levelOf(n.orbit)
      if (lv === null) { ok = false; back.push(n.orbit + ' no level'); return }
      var got = planetName(fromOrbit(lv))
      if (got !== n.planet) ok = false
      back.push(n.orbit + ' -> ' + got + ', isOrbit ' + PD.isOrbitLevel(dimKey(lv)))
    })
    check('planet_orbits_map_back', ok, back.join('; '))
  }

  // ---------------------------------------------------------------- slots
  function slots() {
    var orbits = []
    try {
      var sl = global.grindless.stations.slots
      for (var i = 0; i < sl.length; i++) orbits.push(String(sl[i].orbit))
    } catch (e) { orbits = ['unreadable (' + e + ')'] }
    check('slots_eight', orbits.join(',') === SLOTS_WANT.join(','), orbits.join(', '))
    check('slots_first_six_unchanged', orbits.slice(0, 6).join(',') === SLOTS_WANT.slice(0, 6).join(','), orbits.slice(0, 6).join(', '))
  }

  // ---------------------------------------------------------------- stations
  function stations() {
    var L = classes()
    var older = SLOTS_WANT.slice(0, 6)
    var before = {}
    older.forEach(function (o) { before[o] = levelOf(o) === null ? -1 : countOf(o) })
    var made = {}
    NEW.forEach(function (n) {
      try {
        var lv = levelOf(n.orbit)
        var holder = L.Stations.getSpaceStations(lv)
        var pl = fromOrbit(lv)
        if (pl === null) throw new Error('no planet for this orbit')
        // GCYR's own deploy path (the station item): a free id, its position and the SavedData entry in one call
        var id = Number(holder.allocateStation(pl))
        try { jcall(holder, ['setDirty', 'm_77762_']) } catch (e) { note('station_dirty_' + n.key, String(e)) }
        var st = holder.getStation(L.Integer.valueOf(id))
        var pos = st === null || st === undefined ? 'none' : String(holder.getStationPos(id))
        made[n.key] = id
        check('station_deploy_' + n.key, st !== null && st !== undefined && Number(holder.getFreeStationId()) !== id,
          n.orbit + ': station ' + id + ' at ' + String(pos) + ' for ' + planetName(pl))
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
        var back = fresh.getStation(L.Integer.valueOf(made[n.key]))
        ok = keys.indexOf(String(made[n.key])) >= 0 && back !== null && back !== undefined
        detail = n.orbit + ' data/' + STATIONS_FILE + '.dat stations {' + keys.join(', ') + '}; reloaded ' + made[n.key] + ': ' +
          (back === null || back === undefined ? 'none' : String(back))
      } catch (e) { detail = 'unreadable: ' + e }
      check('station_saved_' + n.key, ok, detail)
    })
    var changed = []
    var counts = []
    older.forEach(function (o) {
      var now = levelOf(o) === null ? -1 : countOf(o)
      counts.push(o + ' ' + before[o])
      if (now !== before[o]) changed.push(o + ' ' + before[o] + ' -> ' + now)
    })
    check('station_older_unchanged', changed.length === 0 && older.every(function (o) { return before[o] >= 0 }),
      (changed.length === 0 ? 'counts ' : 'changed ') + (changed.length === 0 ? counts : changed).join(', '))
  }

  // ---------------------------------------------------------------- recipes
  function conditionNames(r) {
    return array(r.conditions).map(function (c) { return String(c.getClass().getSimpleName()) })
  }
  function recipes() {
    var solar = byId(SOLAR)
    var conds = solar === null ? [] : conditionNames(solar)
    check('recipe_proxima_solar', solar !== null && conds.indexOf('DimensionCondition') >= 0 && conds.indexOf('BiomeCondition') >= 0 &&
      conds.indexOf('DaytimeCondition') < 0, SOLAR + ' ' + (solar === null ? 'missing' : 'conditions ' + conds.join(', ')))
    if (solar !== null) {
      try { note('recipe_proxima_solar_conditions', array(solar.conditions).map(function (c) { return String(c) }).join(' ; ')) } catch (e) { note('recipe_proxima_solar_conditions', String(e)) }
    }
    var seed = byId(SEED)
    var sc = seed === null ? [] : conditionNames(seed)
    check('recipe_mercury_orbit_seed', seed !== null && sc.indexOf('DimensionCondition') >= 0, SEED + ' ' + (seed === null ? 'missing' : 'conditions ' + sc.join(', ')))
    var done = global.grindless.uhvTravel && global.grindless.uhvTravel.done
    note('recipe_published', 'uhvTravel.done ' + (done ? Array.prototype.join.call(done, ', ') : 'none') +
      '; lunarPower.recipes.solar ' + (global.grindless.lunarPower ? Array.prototype.join.call(global.grindless.lunarPower.recipes.solar, ', ') : 'none'))
  }

  function run(server) {
    S = { server: server, failed: 0 }
    try { planet() } catch (e) { check('planet_exception', false, String(e)) }
    try { slots() } catch (e) { check('slots_exception', false, String(e)) }
    try { stations() } catch (e) { check('station_exception', false, String(e)) }
    try { recipes() } catch (e) { check('recipe_exception', false, String(e)) }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  ServerEvents.customCommand('gg_test_uhv_travel', function () {
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
