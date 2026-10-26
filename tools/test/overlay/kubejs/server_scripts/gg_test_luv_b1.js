// TEST-ONLY B1 fixture (LuV travel: the level 4 tank, the places, the bridges); prepared for the single integrated LuV validation
// owner, not a standalone launch. Only the properties of B1's final content that spikes S0-1/S0-2 (disposable ids) left unproven.
// Command: kubejs custom_command gg_test_luv_b1
// Marker: GGTEST|luv_b1|DONE (owner's marker wait: at most 180 seconds; about 3-25 s of game time after the 10 s reload quiet).
// Requires B1's registrations: global.grindless.luvTravel (startup luv/travel.js: tank, planets; server luv/travel.js: done),
// G.places (tables/places.json), G.orbits (tables/orbits.json), G.planets (tables/planets.json), G.airlessWeather. Every dimension id
// comes from those tables; this file names none of the new ones.
// Band: X 18176..18239, Z 0..63.
//   Overworld Y 98..112   a rocket scanner facing north, controller at X 18181 Y 100 Z 4, footprint X 18180..18182, Z 4..8 (Y 98..102),
//                         one owned chunk ticket (chunk X 18176..18191, Z 0..15). Owned blocks only: an occupied cell fails rocket_placed.
//   each new surface      read only: chunk X 18176..18191, Z 0..15 is generated and 16 columns (X/Z offsets 0, 5, 10, 15) are read
//                         from Y 197 down; Y 198..214 must be air. Nothing is built or force-loaded off-world.
// Checks (GGTEST|luv_b1|<check>|PASS|FAIL|NOTE|SKIPPED|<detail>):
//   shared_registrations   B1's globals are published (luvTravel tank/planets/done, places, orbits, planets, airlessWeather)
//   dimension_tables       planets.json's belt/jupiter/io/europa/ganymede pair one surface with one orbit; the surfaces are G.places', the
//                          orbits G.orbits'
//   planet_<key>           GCYR's PlanetData: world, orbit, parent world and rocket tier (belt 4, Jupiter 5 with no parent, Io/Europa/
//                          Ganymede 4 under Jupiter's world), equal to luvTravel.planets
//   proxima_tier           gcyr:proxima_centauri_b is rocket tier 5
//   levels                 server.getLevel answers for all ten new dimensions
//   pair_tags              planets.json: pairTag io/europa/ganymede/belt, none for jupiter
//   tank_block             grindless:cryogenic_fuel_tank is GCYR's FuelTankBlock, getTier() 5, getTankProperties().getFuelStorage() 16000
//   tank_recipe            grindless:assembler/cryogenic_fuel_tank exists and makes the tank
//   recipes_done           every B1 recipe id below is in luvTravel.done
//   seed_<key>             grindless:chemical_reactor/<adj>_quantum_seed exists, only on that moon (its surface, or its orbit)
//   pair_<key>             grindless:transform/<adj>_entangled_singularity: 2 entangled singularities marked grindless_planet=<key>,
//                          from the seed. The AE2 ritual itself is proven since EV and is not run.
//   truss_recipe           grindless:assembler/station_truss_casing exists
//   stations               SKIPPED while tables/stations.json says enabled=false (station stages wait for spike S0-3); FAIL if enabled
//                          (this fixture must then be extended) or missing
//   terrain_<key>          the generated ground's top blocks belong to that place's surface rules (belt also: a floor surface at Y 50..80)
//   offworld_air_<key>     Y 198..214 is air in every sampled column
//   terrain_export         NOTE: kubejs/exported/luv_b1_terrain.json holds the observed blocks and heights
//   weather_registry       G.airlessWeather lists the ten new dimensions and Earth orbit
//   weather_earth_rain     40 ticks of a thunderstorm on Earth: Overworld rain > 0.9
//   weather_dry            the ten new dimensions and Earth orbit read rain and thunder <= 0.011 meanwhile
//   weather_restored       the Overworld's weather flags, timers and levels are put back exactly as they were before
//   rocket_placed / rocket_formed / rocket_build      two cryogenic tanks + six elite motors + a seat on a scanned pad, captured whole
//   rocket_level4          floor((weakest motor tier + weakest tank tier) / 2) = 4 over the captured blocks; >= every moon's tier,
//                          below Jupiter's
//   rocket_capacity        the rocket entity holds 32000 mB
//   rocket_europa_fuel     GCYR's required fuel to Europa fits the capacity
//   level4_flight          NOTE: the real level 4 launch/landing/return was proven natively by S0-2 on the identical builder call
//   cleanup                owned blocks, the rocket, items and the owned ticket removed; weather restored
// Deadlines: 1200 ticks and 150 seconds from the command; no retries.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var SCOPE = 'luv_b1'
  var REQUEST = 'ggTestLuvB1Request'
  var LOADED_AT = Date.now()
  var REQUESTED_AT = 0
  var QUIET_MS = 10000
  var S = null
  var J = null
  var BAND = { x0: 18176, x1: 18239, z0: 0, z1: 63 }
  var OVERWORLD_Y = { y0: 98, y1: 112 }
  var OFFWORLD_Y = { y0: 198, y1: 214 }
  var EARTH = 'minecraft:overworld'
  var PROXIMA = 'gcyr:proxima_centauri_b'
  var PAIR_KEY = 'grindless_planet'
  var ENTANGLED = 'ae2:quantum_entangled_singularity'
  // planets.json keys -> what B1 decided (b1-ids.md); `place` is the tables/places.json key of the surface, `parent` a planets.json key
  var NEW_PLANETS = ['belt', 'jupiter', 'io', 'europa', 'ganymede']
  var EXPECT = {
    belt: { tier: 4, parent: null, pairTag: 'belt', place: 'asteroid_belt' },
    jupiter: { tier: 5, parent: null, pairTag: null, place: null },
    io: { tier: 4, parent: 'jupiter', pairTag: 'io', place: 'io' },
    europa: { tier: 4, parent: 'jupiter', pairTag: 'europa', place: 'europa' },
    ganymede: { tier: 4, parent: 'jupiter', pairTag: 'ganymede', place: 'ganymede' }
  }
  var BRIDGES = { io: 'ionian', europa: 'europan', ganymede: 'ganymedean' }
  var TANK_RECIPE = 'grindless:assembler/cryogenic_fuel_tank'
  var TRUSS_RECIPE = 'grindless:assembler/station_truss_casing'
  var STATIONS_TABLE = 'kubejs/data/grindless/tables/stations.json'
  var EXPORT = 'kubejs/exported/luv_b1_terrain.json'
  // the blocks each surface's noise settings can put on top (ores are reported, never failed)
  var GROUND = {
    belt: ['minecraft:tuff', 'minecraft:gravel', 'minecraft:cobbled_deepslate', 'minecraft:deepslate'],
    io: ['biomesoplenty:brimstone', 'biomesoplenty:brimstone_fumarole', 'minecraft:basalt', 'minecraft:smooth_basalt', 'minecraft:magma_block',
      'biomesoplenty:black_sand', 'minecraft:lava'],
    europa: ['minecraft:packed_ice', 'minecraft:blue_ice', 'minecraft:ice', 'minecraft:snow', 'minecraft:snow_block', 'minecraft:deepslate'],
    ganymede: ['minecraft:tuff', 'minecraft:packed_ice', 'minecraft:gravel']
  }
  var BELT_FLOOR = { y0: 50, y1: 80 }
  var TERRAIN_KEYS = ['belt', 'io', 'europa', 'ganymede']
  var COLUMNS = [0, 5, 10, 15]
  var SCAN_TOP = OFFWORLD_Y.y0 - 1
  var BELT_SCAN_BOTTOM = 40
  var WEATHER_WAIT = 40
  var FORM_TIMEOUT = 400
  var BUILD_WAIT = 5
  // the rocket scanner (gg_test_gcyr_flight.js's flight pad): controller facing north, rows behind it to the south, columns -1..1
  var CTRL = { x: 18181, y: 100, z: 4 }
  var PAD_ROWS = 3
  var TOWER = 2
  var IDS = {
    scanner: 'gcyr:rocket_scanner',
    pad: 'gcyr:launch_pad',
    frame: 'gtceu:stainless_steel_frame',
    seat: 'gcyr:seat',
    motor: 'gcyr:elite_rocket_motor',
    floor: 'minecraft:smooth_stone'
  }
  var FULL_CAPACITY = 32000

  // ---------------------------------------------------------------- output
  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 2200)
  }
  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = 'GGTEST|' + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }
  function check(name, ok, detail) {
    if (S) S[ok ? 'passed' : 'failed']++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }
  function note(name, detail) { emit(name, 'NOTE', detail) }

  // ---------------------------------------------------------------- Java
  function lazy() {
    if (J === null) J = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      AL: Java.loadClass('java.util.ArrayList'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Machine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      Rocket: Java.loadClass('argent_matter.gcyr.common.entity.RocketEntity'),
      FuelTank: Java.loadClass('argent_matter.gcyr.common.block.FuelTankBlock'),
      Motor: Java.loadClass('argent_matter.gcyr.common.block.RocketMotorBlock'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function array(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  // a JS array kept in KubeJS's global (published by another script) as plain strings
  function strings(a) {
    var out = []
    if (a === null || a === undefined) return out
    for (var i = 0; i < a.length; i++) out.push(String(a[i]))
    return out
  }
  // KubeJS renames some vanilla members; the tables list the KubeJS name first, then the Mojang name, then the SRG name
  function jcall(obj, names, args) {
    var a = args || []
    for (var i = 0; i < names.length; i++) {
      var n = names[i]
      if (typeof obj[n] !== 'function') continue
      if (a.length === 0) return obj[n]()
      return obj[n](a[0])
    }
    throw new Error('no method ' + names.join('/') + ' on ' + obj)
  }
  var V = {
    discard: ['discard', 'm_146870_'],
    blockPosition: ['blockPosition', 'm_20183_'],
    serializedName: ['getSerializedName', 'm_7912_']
  }
  function levelOf(id) {
    // KubeJS adds getLevel(ResourceLocation) next to vanilla's getLevel(ResourceKey): a dimension id string is not ambiguous
    try { return S.server.getLevel(String(id)) } catch (e) { return null }
  }
  function blockAt(level, x, y, z) { return String(level.getBlock(x, y, z).id) }
  function blockKey(block) { return String(lazy().Forge.BLOCKS.getKey(block)) }

  // ---------------------------------------------------------------- tables (every dimension id comes from here)
  function tables() {
    var G = S.G
    var T = G.luvTravel
    var planets = G.planets.table.planets
    var orbits = strings(G.orbits.dimensions)
    var D = { surface: {}, orbit: {}, all: [], planetId: {}, problems: [] }
    NEW_PLANETS.forEach(function (key) {
      var row = planets[key]
      if (!row) {
        D.problems.push('planets.json has no ' + key)
        return
      }
      var dims = strings(row.dimensions)
      var inOrbit = dims.filter(function (d) { return orbits.indexOf(d) >= 0 })
      var onGround = dims.filter(function (d) { return orbits.indexOf(d) < 0 })
      if (dims.length !== 2 || inOrbit.length !== 1 || onGround.length !== 1) {
        D.problems.push(key + ' dimensions [' + dims.join(', ') + '] are not one surface + one G.orbits orbit')
        return
      }
      D.surface[key] = onGround[0]
      D.orbit[key] = inOrbit[0]
      D.all.push(onGround[0], inOrbit[0])
      var place = EXPECT[key].place
      if (place !== null && String(G.places.surface(place)) !== onGround[0]) {
        D.problems.push(key + ' surface ' + onGround[0] + ' is not G.places.surface(' + place + ') = ' + G.places.surface(place))
      }
    })
    Object.keys(T.planets).forEach(function (id) {
      var k = String(T.planets[id].planets)
      if (EXPECT[k]) D.planetId[k] = String(id)
    })
    NEW_PLANETS.forEach(function (key) {
      if (!D.planetId[key]) D.problems.push('luvTravel.planets has no entry for planets.json key ' + key)
    })
    return D
  }

  // ---------------------------------------------------------------- registry
  function planetSummary(p) {
    if (p === null || p === undefined) return null
    var parent = p.parentWorld()
    if (parent !== null && parent !== undefined && typeof parent.isPresent === 'function') parent = parent.isPresent() ? parent.get() : null
    return {
      world: String(p.level().location()),
      orbit: String(p.orbitWorld().location()),
      parent: parent === null || parent === undefined ? null : String(parent.location()),
      tier: Number(p.rocketTier())
    }
  }
  function registryChecks() {
    var D = S.D
    var T = S.G.luvTravel
    var PD = lazy().PlanetData
    check('dimension_tables', D.problems.length === 0 && D.all.length === 10, D.problems.length > 0 ? D.problems.join('; ') :
      NEW_PLANETS.map(function (k) { return k + ' ' + D.surface[k] + ' + ' + D.orbit[k] }).join('; ') + ' (surfaces = G.places, orbits in G.orbits)')
    NEW_PLANETS.forEach(function (key) {
      var e = EXPECT[key]
      var id = D.planetId[key]
      var got = id ? planetSummary(PD.getPlanet(rl(id))) : null
      var parentWorld = e.parent === null ? null : D.surface[e.parent]
      var meta = id ? T.planets[id] : null
      var ok = got !== null && got.world === D.surface[key] && got.orbit === D.orbit[key] && got.parent === parentWorld &&
        got.tier === e.tier && meta !== null && Number(meta.tier) === e.tier
      check('planet_' + key, ok, (id || '(no planet id)') + ': ' + (got === null ? 'not in PlanetData' : 'world=' + got.world + ' orbit=' +
        got.orbit + ' parent=' + got.parent + ' rocket_tier=' + got.tier) + '; want world=' + D.surface[key] + ' orbit=' + D.orbit[key] +
        ' parent=' + parentWorld + ' tier=' + e.tier + ' (luvTravel tier ' + (meta ? meta.tier : 'missing') + ')')
    })
    var proxima = planetSummary(PD.getPlanet(rl(PROXIMA)))
    check('proxima_tier', proxima !== null && proxima.tier === 5, PROXIMA + ' rocket_tier=' + (proxima === null ? 'missing' : proxima.tier) + ' (want 5)')
    var missing = D.all.filter(function (d) { var l = levelOf(d); return l === null || l === undefined })
    check('levels', D.all.length === 10 && missing.length === 0, D.all.length + ' new dimensions; server.getLevel missing for [' + missing.join(', ') + ']')
    var planets = S.G.planets.table.planets
    var tags = NEW_PLANETS.map(function (k) {
      var row = planets[k]
      return { key: k, tag: row && row.pairTag !== undefined && row.pairTag !== null ? String(row.pairTag) : null }
    })
    check('pair_tags', tags.every(function (t) { return t.tag === EXPECT[t.key].pairTag }),
      tags.map(function (t) { return t.key + '=' + (t.tag === null ? 'none' : t.tag) }).join(', ') + ' (jupiter keeps no pair)')
  }

  // ---------------------------------------------------------------- recipes
  function liveRecipe(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }
  function contentJson(list) {
    return array(list).map(function (c) {
      try { return String(c.content.toJson()) } catch (e) { return '?' }
    }).join(' ')
  }
  function itemIdsIn(text) {
    var out = []
    var re = /"item"\s*:\s*"([^"]+)"/g
    var m = re.exec(text)
    while (m !== null) {
      out.push(m[1])
      m = re.exec(text)
    }
    return out
  }
  function dimensionsOf(recipe) {
    var dims = []
    array(recipe.conditions).forEach(function (c) {
      try {
        if (c.getDimension) dims.push({ dim: String(c.getDimension().location()), reverse: !!c.isReverse() })
      } catch (e) { /* not a dimension condition */ }
    })
    return dims
  }
  function resultOf(r) { return r.getResultItem(S.server.registryAccess()) }
  function itemIdOf(stack) { return String(lazy().Forge.ITEMS.getKey(stack.getItem())) }
  function markOf(stack) {
    var tag = stack.getNbt()
    return tag !== null && tag !== undefined && tag.contains(PAIR_KEY) ? String(tag.getString(PAIR_KEY)) : ''
  }
  function expectedRecipes() {
    var ids = [TANK_RECIPE, TRUSS_RECIPE]
    Object.keys(BRIDGES).forEach(function (k) {
      ids.push('grindless:chemical_reactor/' + BRIDGES[k] + '_quantum_seed', 'grindless:transform/' + BRIDGES[k] + '_entangled_singularity')
    })
    return ids
  }
  function tankChecks() {
    var L = lazy()
    var T = S.G.luvTravel
    var block = L.Forge.BLOCKS.getValue(rl(T.tank.id))
    var isTank = block !== null && block !== undefined && block instanceof L.FuelTank
    var tier = isTank ? Number(block.getTier()) : -1
    var fuel = isTank ? Number(block.getTankProperties().getFuelStorage()) : -1
    var type = '?'
    try { if (isTank) type = String(jcall(block.getTankProperties(), V.serializedName)) } catch (e) { type = 'unreadable' }
    check('tank_block', isTank && tier === 5 && fuel === 16000 && Number(T.tank.tier) === 5 && Number(T.tank.fuel) === 16000,
      T.tank.id + ': FuelTankBlock=' + isTank + ' (' + (block ? blockKey(block) : 'none') + ') getTier()=' + tier + ' getFuelStorage()=' + fuel +
      ' properties=' + type + ' (want tier 5, 16000 mB)')
    var r = liveRecipe(TANK_RECIPE)
    var out = r ? contentJson(r.getOutputContents(L.ItemCap)) : ''
    check('tank_recipe', r !== null && itemIdsIn(out).indexOf(String(T.tank.id)) >= 0, TANK_RECIPE + (r ? ' -> ' + out : ' missing'))
  }
  function bridgeChecks() {
    var L = lazy()
    var planets = S.G.planets.table.planets
    var done = strings(S.G.luvTravel.done)
    var want = expectedRecipes()
    var notDone = want.filter(function (id) { return done.indexOf(id) < 0 })
    check('recipes_done', notDone.length === 0, 'luvTravel.done has ' + done.length + ' ids; missing [' + notDone.join(', ') + ']')
    Object.keys(BRIDGES).forEach(function (key) {
      var seedId = 'grindless:chemical_reactor/' + BRIDGES[key] + '_quantum_seed'
      var pairId = 'grindless:transform/' + BRIDGES[key] + '_entangled_singularity'
      var own = strings(planets[key] ? planets[key].dimensions : [])
      var surface = String(S.G.places.surface(EXPECT[key].place))
      var seed = liveRecipe(seedId)
      var seedItems = []
      if (seed === null) check('seed_' + key, false, seedId + ' missing')
      else {
        var dims = dimensionsOf(seed)
        var names = dims.map(function (d) { return d.dim })
        var outText = contentJson(seed.getOutputContents(L.ItemCap))
        seedItems = itemIdsIn(outText)
        check('seed_' + key, dims.length > 0 && names.indexOf(surface) >= 0 && dims.every(function (d) { return !d.reverse && own.indexOf(d.dim) >= 0 }) &&
          seedItems.length > 0, seedId + ' -> ' + outText + '; dimension conditions ' + JSON.stringify(dims) + ' (want ' + surface + ', only ' +
          own.join('/') + ')')
      }
      var pair = liveRecipe(pairId)
      if (pair === null) {
        check('pair_' + key, false, pairId + ' missing')
        return
      }
      var res = resultOf(pair)
      var ins = array(pair.getIngredients()).map(function (ing) {
        try { return String(ing.toJson()) } catch (e) { return '?' }
      }).join(' ')
      var fromSeed = seedItems.length > 0 && seedItems.every(function (id) { return ins.indexOf(id) >= 0 })
      check('pair_' + key, itemIdOf(res) === ENTANGLED && Number(res.getCount()) === 2 && markOf(res) === EXPECT[key].pairTag &&
        ins.indexOf('ae2:singularity') >= 0 && fromSeed, pairId + ': ' + ins + ' -> ' + res.getCount() + 'x ' + itemIdOf(res) + ' ' +
        PAIR_KEY + '=' + markOf(res) + ' (want ' + EXPECT[key].pairTag + ', from ' + seedItems.join('/') + ')')
    })
    var truss = liveRecipe(TRUSS_RECIPE)
    check('truss_recipe', truss !== null, TRUSS_RECIPE + (truss ? ' -> ' + contentJson(truss.getOutputContents(L.ItemCap)) : ' missing'))
  }
  function stationChecks() {
    var table = null
    try { table = S.G.readJsonTable(STATIONS_TABLE) } catch (e) { table = null }
    if (table === null || table === undefined) {
      check('stations', false, STATIONS_TABLE + ' missing: the station gate is required')
    } else if (table.enabled === true) {
      check('stations', false, STATIONS_TABLE + ' says enabled=true, but this fixture has no station stage yet: extend it with spike S0-3\'s proof')
    } else {
      emit('stations', 'SKIPPED', 'station stages wait for spike S0-3 (' + STATIONS_TABLE + ' enabled=' + table.enabled + '); not a failure')
    }
  }

  // ---------------------------------------------------------------- terrain (read only)
  function isGround(key, id) { return GROUND[key].indexOf(id) >= 0 || /ore/.test(id) }
  function terrainOf(key) {
    var dim = S.D.surface[key]
    var level = levelOf(dim)
    if (level === null || level === undefined) {
      check('terrain_' + key, false, dim + ' is not loaded')
      return
    }
    level.getChunk(BAND.x0 >> 4, BAND.z0 >> 4)
    var cols = []
    var notAir = []
    COLUMNS.forEach(function (dx) {
      COLUMNS.forEach(function (dz) {
        var x = BAND.x0 + dx
        var z = BAND.z0 + dz
        for (var y = OFFWORLD_Y.y0; y <= OFFWORLD_Y.y1; y++) {
          var above = blockAt(level, x, y, z)
          if (above !== 'minecraft:air') notAir.push(x + ',' + y + ',' + z + '=' + above)
        }
        var col = { x: x, z: z, top: null, topBlock: null, surfaces: [] }
        var bottom = key === 'belt' ? BELT_SCAN_BOTTOM : -64
        var prev = blockAt(level, x, SCAN_TOP, z)
        for (var yy = SCAN_TOP - 1; yy >= bottom; yy--) {
          var id = blockAt(level, x, yy, z)
          if (id !== 'minecraft:air' && prev === 'minecraft:air') {
            if (col.top === null) {
              col.top = yy
              col.topBlock = id
            }
            col.surfaces.push({ y: yy, block: id })
            if (key !== 'belt') break
          }
          prev = id
        }
        cols.push(col)
      })
    })
    var bad = cols.filter(function (c) { return c.top === null || !isGround(key, c.topBlock) })
    var tops = cols.filter(function (c) { return c.top !== null }).map(function (c) { return c.top })
    var seen = {}
    cols.forEach(function (c) { if (c.topBlock) seen[c.topBlock] = (seen[c.topBlock] || 0) + 1 })
    var detail = dim + ' chunk ' + (BAND.x0 >> 4) + ',' + (BAND.z0 >> 4) + ': top Y ' + (tops.length ? Math.min.apply(null, tops) + '..' +
      Math.max.apply(null, tops) : 'none') + ', blocks ' + JSON.stringify(seen)
    var ok = bad.length === 0
    if (key === 'belt') {
      var floors = []
      cols.forEach(function (c) {
        c.surfaces.forEach(function (s) {
          if (s.y >= BELT_FLOOR.y0 && s.y <= BELT_FLOOR.y1 && isGround(key, s.block)) floors.push(s.y)
        })
      })
      ok = ok && floors.length > 0
      detail += '; floor surfaces in Y ' + BELT_FLOOR.y0 + '..' + BELT_FLOOR.y1 + ': ' + floors.length +
        (floors.length ? ' (Y ' + Math.min.apply(null, floors) + '..' + Math.max.apply(null, floors) + ')' : '') + '; asteroid surfaces above: ' +
        cols.reduce(function (n, c) { return n + c.surfaces.filter(function (s) { return s.y > BELT_FLOOR.y1 }).length }, 0)
    }
    check('terrain_' + key, ok, detail + (bad.length ? '; not ' + key + ' ground: ' + bad.map(function (c) {
      return c.x + ',' + c.z + '=' + c.topBlock + '@' + c.top
    }).join(' ') : '') + ' (allowed ' + GROUND[key].join(', ') + ', ores)')
    check('offworld_air_' + key, notAir.length === 0, 'Y ' + OFFWORLD_Y.y0 + '..' + OFFWORLD_Y.y1 + ' in ' + cols.length + ' columns: ' +
      (notAir.length ? 'not air ' + notAir.slice(0, 12).join(' ') : 'all air'))
    S.terrain[key] = { dimension: dim, chunk: [BAND.x0 >> 4, BAND.z0 >> 4], columns: cols }
  }

  // ---------------------------------------------------------------- weather (the Overworld's, saved and put back exactly)
  function weatherState() {
    var d = S.ow.getLevelData()
    return {
      raining: !!d.isRaining(), thundering: !!d.isThundering(), clear: Number(d.getClearWeatherTime()), rain: Number(d.getRainTime()),
      thunder: Number(d.getThunderTime()), rainLevel: Number(S.ow.getRainLevel(1)), thunderLevel: Number(S.ow.getThunderLevel(1))
    }
  }
  function weatherText(w) {
    return 'raining=' + w.raining + ' thundering=' + w.thundering + ' clear=' + w.clear + ' rainTime=' + w.rain + ' thunderTime=' + w.thunder +
      ' levels=' + w.rainLevel.toFixed(2) + '/' + w.thunderLevel.toFixed(2)
  }
  function startWeather() {
    var aw = S.G.airlessWeather
    var listed = aw ? strings(aw.dimensions) : []
    S.weatherDims = S.D.all.concat([String(S.G.orbits.earth)])
    var missing = S.weatherDims.filter(function (d) { return listed.indexOf(d) < 0 })
    check('weather_registry', aw !== undefined && aw !== null && missing.length === 0, S.weatherDims.length + ' dimensions expected dry; not in ' +
      'G.airlessWeather: [' + missing.join(', ') + ']')
    S.weather = { before: weatherState(), restored: false, at: S.tick }
    S.server.runCommandSilent('weather thunder 6000')
    S.ow.setRainLevel(1)
    S.ow.setThunderLevel(1)
  }
  function finishWeather() {
    var owRain = Number(S.ow.getRainLevel(1))
    check('weather_earth_rain', owRain > 0.9, 'Overworld rain=' + owRain.toFixed(2) + ' after ' + WEATHER_WAIT + ' ticks of /weather thunder (Earth keeps it)')
    var wet = []
    var seen = []
    S.weatherDims.forEach(function (d) {
      var l = levelOf(d)
      if (l === null || l === undefined) {
        wet.push(d + ' not loaded')
        return
      }
      var rain = Number(l.getRainLevel(1))
      var thunder = Number(l.getThunderLevel(1))
      seen.push(d + ' ' + rain.toFixed(3) + '/' + thunder.toFixed(3))
      if (rain > 0.011 || thunder > 0.011) wet.push(d + ' rain=' + rain.toFixed(3) + ' thunder=' + thunder.toFixed(3))
    })
    check('weather_dry', wet.length === 0, (wet.length ? 'wet: ' + wet.join('; ') + ' | ' : '') + 'rain/thunder ' + seen.join(', '))
    restoreWeather()
  }
  function restoreWeather() {
    if (!S || !S.weather || S.weather.restored) return
    S.weather.restored = true
    var w = S.weather.before
    try {
      var d = S.ow.getLevelData()
      d.setClearWeatherTime(w.clear)
      d.setRainTime(w.rain)
      d.setThunderTime(w.thunder)
      d.setRaining(w.raining)
      d.setThundering(w.thundering)
      S.ow.setRainLevel(w.rainLevel)
      S.ow.setThunderLevel(w.thunderLevel)
      var now = weatherState()
      var same = now.raining === w.raining && now.thundering === w.thundering && now.clear === w.clear && now.rain === w.rain &&
        now.thunder === w.thunder && Math.abs(now.rainLevel - w.rainLevel) < 0.0001 && Math.abs(now.thunderLevel - w.thunderLevel) < 0.0001
      check('weather_restored', same, 'before ' + weatherText(w) + '; now ' + weatherText(now))
    } catch (e) {
      S.server.runCommandSilent('weather clear')
      check('weather_restored', false, 'could not put the saved weather back (' + e + '); fell back to /weather clear')
    }
  }

  // ---------------------------------------------------------------- level 4 rocket (Overworld)
  // cell (b rows behind the controller = south, s columns to its right = east, y above the controller's Y)
  function at(b, s, y) { return { x: CTRL.x + s, y: CTRL.y + y, z: CTRL.z + b } }
  function rocketBlocks() {
    var out = []
    for (var b = 1; b <= 2; b++) {
      for (var s = -1; s <= 1; s++) out.push({ p: at(b, s, 0), id: IDS.motor })
    }
    out.push({ p: at(1, 0, 1), id: String(S.G.luvTravel.tank.id) })
    out.push({ p: at(2, 0, 1), id: String(S.G.luvTravel.tank.id) })
    out.push({ p: at(1, 0, 2), id: IDS.seat })
    return out
  }
  function key(p) { return p.x + ',' + p.y + ',' + p.z }
  function cmd(text) { return Number(S.server.runCommandSilent('execute in ' + EARTH + ' run ' + text)) }
  function inside(p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.y < OVERWORLD_Y.y0 || p.y > OVERWORLD_Y.y1 || p.z < BAND.z0 || p.z > BAND.z1) {
      throw new Error('out-of-band coordinate ' + key(p))
    }
  }
  function ticket(p) {
    var x = Math.floor(p.x / 16) * 16
    var z = Math.floor(p.z / 16) * 16
    var k = x + ',' + z
    if (S.chunks[k]) return
    S.chunks[k] = true
    S.ow.getChunk(x >> 4, z >> 4)
    if (cmd('forceload query ' + x + ' ' + z) > 0) return
    S.tickets.push({ x: x, z: z })
    if (cmd('forceload add ' + x + ' ' + z) < 1) throw new Error('cannot acquire chunk ticket ' + k)
  }
  function put(p, id, state) {
    inside(p)
    ticket(p)
    if (!S.owned[key(p)]) {
      if (blockAt(S.ow, p.x, p.y, p.z) !== 'minecraft:air') throw new Error('refusing to replace unowned block ' + blockAt(S.ow, p.x, p.y, p.z) + ' at ' + key(p))
      S.owned[key(p)] = true
      S.order.push(p)
    }
    cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + (state || '') + ' replace')
    if (blockAt(S.ow, p.x, p.y, p.z) !== id) throw new Error('setblock did not place ' + id + ' at ' + key(p))
  }
  function areaBox() {
    return new (lazy().AABB)(CTRL.x - 2, OVERWORLD_Y.y0, CTRL.z - 1, CTRL.x + 3, OVERWORLD_Y.y1 + 1, CTRL.z + PAD_ROWS + 3)
  }
  function rocketsIn() {
    return array(S.ow.getEntitiesOfClass(lazy().Rocket, areaBox())).filter(function (e) { return !e.isRemoved() })
  }
  function machine() { return lazy().Machine.getMachine(S.ow, new (lazy().Pos)(CTRL.x, CTRL.y, CTRL.z)) }
  function placeRocket() {
    var R = { blocks: rocketBlocks(), rocket: null, at: S.tick }
    S.rocket = R
    // the floor goes under the whole footprint only where there is air; existing ground is left alone and not owned
    for (var b = 0; b <= PAD_ROWS + 1; b++) {
      for (var s = -1; s <= 1; s++) {
        var f = at(b, s, -2)
        inside(f)
        ticket(f)
        if (blockAt(S.ow, f.x, f.y, f.z) === 'minecraft:air') put(f, IDS.floor)
      }
    }
    var plan = []
    for (var row = 1; row <= PAD_ROWS; row++) {
      for (var col = -1; col <= 1; col++) plan.push({ p: at(row, col, -1), id: IDS.pad })
    }
    for (var k = 0; k < TOWER; k++) plan.push({ p: at(PAD_ROWS + 1, 0, k), id: IDS.frame })
    plan = plan.concat(R.blocks)
    // the whole footprint is checked before anything is placed
    plan.concat([{ p: at(0, 0, 0) }]).forEach(function (c) {
      inside(c.p)
      if (blockAt(S.ow, c.p.x, c.p.y, c.p.z) !== 'minecraft:air') throw new Error('rocket footprint occupied at ' + key(c.p))
    })
    plan.forEach(function (c) { put(c.p, c.id) })
    // the controller last, so its first structure check already sees the whole structure
    put(at(0, 0, 0), IDS.scanner, '[facing=north]')
    var m = machine()
    if (m !== null && m !== undefined && String(m.getFrontFacing()) !== 'north') m.setFrontFacing(lazy().Direction.NORTH)
    check('rocket_placed', true, 'scanner at ' + key(at(0, 0, 0)) + ' facing north, ' + PAD_ROWS + 'x3 pad, ' + TOWER + ' frames, 6 ' + IDS.motor +
      ', 2 ' + S.G.luvTravel.tank.id + ', 1 seat; ' + S.order.length + ' owned blocks')
  }
  function measuredPartsTier(r) {
    var motor = 999
    var tank = 999
    array(r.getBlocks()).forEach(function (pws) {
      var block = pws.state().getBlock()
      if (block instanceof lazy().Motor) motor = Math.min(motor, Number(block.getTier()))
      if (block instanceof lazy().FuelTank) tank = Math.min(tank, Number(block.getTier()))
    })
    if (motor === 999 || tank === 999) throw new Error('scanned rocket has no native motor or tank')
    return { motor: motor, tank: tank, level: Math.floor((motor + tank) / 2) }
  }
  function capturedMap(r) {
    var origin = jcall(r, V.blockPosition)
    var out = {}
    array(r.getBlocks()).forEach(function (pws) {
      var p = pws.pos()
      out[(origin.getX() + p.getX()) + ',' + (origin.getY() + p.getY()) + ',' + (origin.getZ() + p.getZ())] = blockKey(pws.state().getBlock())
    })
    return out
  }
  function rocketForm() {
    var m = machine()
    if (m !== null && m !== undefined && m.isFormed()) {
      check('rocket_formed', true, 'formed after ' + (S.tick - S.rocket.at) + ' ticks')
      m.setRocketBuilt(true)
      phase('rocket_build')
      return
    }
    if (S.tick - S.rocket.at > FORM_TIMEOUT) {
      check('rocket_formed', false, 'scanner not formed after ' + FORM_TIMEOUT + ' ticks (machine ' + (m ? 'present' : 'missing') + ')')
      phase('cleanup')
    }
  }
  function rocketBuild() {
    if (S.tick - S.phaseAt < BUILD_WAIT) return
    var rockets = rocketsIn()
    var r = rockets.length > 0 ? rockets[0] : null
    S.rocket.rocket = r
    var expected = {}
    S.rocket.blocks.forEach(function (b) { expected[key(b.p)] = b.id })
    var captured = r ? capturedMap(r) : {}
    var missing = Object.keys(expected).filter(function (k) { return captured[k] !== expected[k] })
    var extra = Object.keys(captured).filter(function (k) { return expected[k] === undefined })
    var left = S.rocket.blocks.filter(function (b) { return blockAt(S.ow, b.p.x, b.p.y, b.p.z) !== 'minecraft:air' })
    var popped = array(S.ow.getEntitiesOfClass(lazy().ItemEntity, areaBox())).length
    check('rocket_build', rockets.length === 1 && missing.length === 0 && extra.length === 0 && left.length === 0 && popped === 0,
      'rockets=' + rockets.length + ', captured ' + (Object.keys(expected).length - missing.length) + '/' + Object.keys(expected).length +
      (missing.length ? ', not captured ' + missing.join(' ') : '') + (extra.length ? ', unexpected ' + extra.join(' ') : '') +
      ', left in the world ' + left.length + ', items dropped ' + popped)
    if (r === null) {
      phase('cleanup')
      return
    }
    var PD = lazy().PlanetData
    var tiers = measuredPartsTier(r)
    var moonTiers = ['io', 'europa', 'ganymede', 'belt'].map(function (k) { return Number(PD.getPlanet(rl(S.D.planetId[k])).rocketTier()) })
    var jupiter = Number(PD.getPlanet(rl(S.D.planetId.jupiter)).rocketTier())
    check('rocket_level4', tiers.level === 4 && tiers.tank === 5 && moonTiers.every(function (t) { return t <= tiers.level }) && jupiter > tiers.level,
      'weakest motor ' + tiers.motor + ', weakest tank ' + tiers.tank + ' -> level ' + tiers.level + '; belt/moons rocket_tier ' + moonTiers.join('/') +
      ', Jupiter ' + jupiter + ' stays out of reach')
    var cap = Number(r.getFuelCapacity())
    check('rocket_capacity', cap === FULL_CAPACITY, 'two ' + S.G.luvTravel.tank.id + ': rocket capacity ' + cap + ' mB (want ' + FULL_CAPACITY + ')')
    var europa = PD.getPlanet(rl(S.D.planetId.europa))
    var need = Number(r.computeRequiredFuelAmountForDestination(europa))
    check('rocket_europa_fuel', need > 0 && need <= cap, 'GCYR requires ' + need + ' mB to launch for ' + S.D.planetId.europa + ' (capacity ' + cap + ')')
    note('level4_flight', 'not flown here: spike S0-2 (run 20261026-050727-client-7a0, 34 PASS) launched, landed and returned the same ' +
      'gcyr:fuel_tank builder call (tier 5, 16000 mB) on elite motors to a tier 4 Jupiter moon; this run proves the final id\'s tier and capacity')
    phase('cleanup')
  }

  // ---------------------------------------------------------------- driver
  function phase(name) {
    S.phase = name
    S.phaseAt = S.tick
  }
  function step() {
    if (!S || S.finished) return
    S.tick = Number(S.server.getTickCount()) - S.tick0
    if (Date.now() - S.requestedAt > 150000 || S.tick > 1200) throw new Error('overall deadline in ' + S.phase)
    if (S.phase === 'terrain') {
      var k = TERRAIN_KEYS[S.terrainIndex]
      S.terrainIndex++
      try { terrainOf(k) } catch (e) { check('terrain_' + k, false, 'exception: ' + e) }
      if (S.terrainIndex >= TERRAIN_KEYS.length) {
        try {
          JsonIO.write(EXPORT, { band: BAND, columns: COLUMNS, places: S.terrain })
          note('terrain_export', EXPORT)
        } catch (e) { note('terrain_export', 'could not write ' + EXPORT + ': ' + e) }
        phase('weather')
      }
    } else if (S.phase === 'weather') {
      if (S.tick - S.weather.at < WEATHER_WAIT) return
      finishWeather()
      phase(S.rocket && S.rocket.blocks ? 'rocket_form' : 'cleanup')
    } else if (S.phase === 'rocket_form') rocketForm()
    else if (S.phase === 'rocket_build') rocketBuild()
    else if (S.phase === 'cleanup') finish()
  }
  function finish() {
    if (!S || S.finished) return
    S.finished = true
    var problems = []
    try { restoreWeather() } catch (e) { problems.push('weather: ' + e) }
    try {
      if (S.order.length > 0) rocketsIn().forEach(function (r) { jcall(r, V.discard) })
    } catch (e) { problems.push('rocket: ' + e) }
    S.order.slice().reverse().forEach(function (p) {
      try {
        cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' minecraft:air replace')
        if (blockAt(S.ow, p.x, p.y, p.z) !== 'minecraft:air') problems.push('block remains ' + key(p))
      } catch (e) { problems.push('block ' + key(p) + ': ' + e) }
    })
    if (S.order.length > 0) {
      try {
        cmd('kill @e[type=minecraft:item,x=' + BAND.x0 + ',y=' + OVERWORLD_Y.y0 + ',z=' + BAND.z0 + ',dx=' + (BAND.x1 - BAND.x0) + ',dy=' +
          (OVERWORLD_Y.y1 - OVERWORLD_Y.y0) + ',dz=' + (BAND.z1 - BAND.z0) + ']')
      } catch (e) { problems.push('items: ' + e) }
    }
    S.tickets.forEach(function (t) {
      try {
        cmd('forceload remove ' + t.x + ' ' + t.z)
        if (cmd('forceload query ' + t.x + ' ' + t.z) > 0) problems.push('ticket remains ' + t.x + ',' + t.z)
      } catch (e) { problems.push('ticket: ' + e) }
    })
    check('cleanup', problems.length === 0, problems.length ? problems.join('; ') : S.order.length + ' owned blocks and ' + S.tickets.length +
      ' owned tickets removed, no rocket left; ' + S.passed + ' PASS / ' + S.failed + ' FAIL before cleanup')
    console.info('GGTEST|' + SCOPE + '|DONE')
  }
  function start(server) {
    var G = global.grindless
    S = { server: server, G: G, requestedAt: REQUESTED_AT || Date.now(), tick0: Number(server.getTickCount()), tick: 0, phase: 'setup', phaseAt: 0,
      passed: 0, failed: 0, owned: {}, order: [], chunks: {}, tickets: [], terrain: {}, terrainIndex: 0, weather: null, rocket: null,
      finished: false, D: null, ow: server.getLevel(EARTH) }
    var T = G ? G.luvTravel : null
    var ready = !!(G && T && T.tank && T.planets && T.done && G.places && G.orbits && G.planets && G.planets.table && G.airlessWeather &&
      typeof G.readJsonTable === 'function' && S.ow)
    if (!check('shared_registrations', ready, 'luvTravel(tank, planets, done), places, orbits, planets.table, airlessWeather, readJsonTable, ' +
      'Overworld; no fixture substitutions')) {
      finish()
      return
    }
    S.D = tables()
    registryChecks()
    tankChecks()
    bridgeChecks()
    stationChecks()
    try { placeRocket() } catch (e) {
      check('rocket_placed', false, String(e))
      S.rocket = null
    }
    startWeather()
    phase('terrain')
  }
  ServerEvents.customCommand('gg_test_luv_b1', function () {
    if ((S && !S.finished) || global[REQUEST] === true) {
      emit('request', 'NOTE', 'already requested/running; no second instance')
      return
    }
    REQUESTED_AT = Date.now()
    global[REQUEST] = true
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && (!S || S.finished) && Date.now() - LOADED_AT >= QUIET_MS) {
        global[REQUEST] = false
        start(event.server)
      }
      step()
    } catch (e) {
      emit('exception', 'FAIL', (S ? S.phase : 'setup') + ': ' + e)
      if (S) finish()
      else {
        global[REQUEST] = false
        console.info('GGTEST|' + SCOPE + '|DONE')
      }
    }
  })
})()
