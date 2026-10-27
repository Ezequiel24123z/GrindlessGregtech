// TEST ONLY, UV-A11 (propulsion). Command: kubejs custom_command gg_test_uv_propulsion
// Band X 25856-25919, Z 0-63, Y 98-112 (tools/test/zones.json, uv_propulsion); it builds, force-loads and clears X 25856-25871, Z 0-15.
// The doubt it settles: the level of a rocket built from the tier 11 BNNT tank the winder makes and GCYR's elite motor (tier 3).
// GCYR 0.2.9 as ZPM-B1 observed it gives floor((motor + tank) / 2) = 7; GCYR's later source takes min(parts) = 3. The contract
// wants 7. Static checks: the two machines and types, the tank block's tier read back, the winder row making that tank from A8's BNNT
// yarn, the works' Hall row taking krypton (the Kuiper row) and the ion row taking A8's printed chamber.
// Then a GCYR rocket scanner on a 3 x 3 launch pad with six elite motors, two BNNT tanks and a seat, "Build" (setRocketBuilt), the
// rocket entity's tier read back.
//
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var NAME = 'uv_propulsion'
  var BAND = { x0: 25856, x1: 25871, y0: 98, y1: 112, z0: 0, z1: 15 }
  var FLOOR_Y = 98
  var PAD_Y = 99
  var CTRL_Y = 100
  var QUIET_MS = 10000
  var FORM_TIMEOUT = 400
  var LOADED_AT = Date.now()
  var TANK = 'grindless:bnnt_fuel_tank'
  var ELITE_MOTOR = 'gcyr:elite_rocket_motor'
  var WANT_LEVEL = 7
  var IDS = { pad: 'gcyr:launch_pad', frame: 'gtceu:stainless_steel_frame', scanner: 'gcyr:rocket_scanner', seat: 'gcyr:seat' }
  var SP = { facing: 'north', x: 25858, z: 4, l: 1, r: 1, b: 3, h: 2 }
  var STEPS = { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 } }
  var OPPOSITE = { north: 'south', south: 'north', east: 'west', west: 'east' }
  var CLOCKWISE = { north: 'east', east: 'south', south: 'west', west: 'north' }

  var S = null
  var J = null

  function clean(x) { return String(x).replace(/[\r\n|]+/g, ' ').substring(0, 2500) }
  function check(name, ok, detail) {
    if (S && !ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability'),
      Rocket: Java.loadClass('argent_matter.gcyr.common.entity.RocketEntity'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
    }
    return J
  }
  function rl(id) { return new (lazy().RL)(id) }
  function array(coll) {
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function guarded(label, fn) { try { fn() } catch (e) { check(label + '_exception', false, e) } }

  // ---------------------------------------------------------------- static checks

  function recipeById(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  function fluidsOf(list) {
    return array(list).map(function (f) { return String(lazy().Forge.FLUIDS.getKey(f.getFluid())) + ' ' + Number(f.getAmount()) })
  }
  function itemsOf(r, io) {
    var list = io === 'in' ? lazy().Helper.getInputItems(r) : lazy().Helper.getOutputItems(r)
    if (list === null || list === undefined) return []
    return array(list).map(function (st) { return String(lazy().Forge.ITEMS.getKey(st.getItem())) })
  }
  function tierOf(id) {
    var b = lazy().Forge.BLOCKS.getValue(rl(id))
    try { return String(b.getTier()) } catch (e) { return 'unreadable (' + (b ? b.getClass().getName() : 'none') + ')' }
  }

  function registration() {
    var L = lazy()
    ;[['gtceu:cryotank_winder', 'gtceu:cryotank_winding'], ['gtceu:thruster_works', 'gtceu:thruster_assembly']].forEach(function (p) {
      var def = L.GTRegistries.MACHINES.get(rl(p[0]))
      var type = L.GTRegistries.RECIPE_TYPES.get(rl(p[1]))
      check('registered:' + p[0].replace('gtceu:', ''), def !== null && def !== undefined && type !== null && type !== undefined,
        p[0] + ' ' + (def ? 'registered' : 'MISSING') + ', ' + p[1] + ' ' + (type ? 'registered' : 'MISSING'))
    })
    var b = L.Forge.BLOCKS.getValue(rl(TANK))
    var cls = b ? String(b.getClass().getName()) : 'none'
    var tier = tierOf(TANK)
    check('tank_tier', cls.indexOf('FuelTankBlock') >= 0 && tier === '11', TANK + ' is ' + cls + ', tier read back ' + tier)
    note('elite_motor_tier', ELITE_MOTOR + ' tier ' + tierOf(ELITE_MOTOR))
  }

  function recipes() {
    var winder = recipeById('grindless:cryotank_winding/bnnt_fuel_tank')
    if (winder === null) {
      check('winder_row', false, 'grindless:cryotank_winding/bnnt_fuel_tank not in the recipe manager')
    } else {
      var ins = itemsOf(winder, 'in')
      var outs = itemsOf(winder, 'out')
      check('winder_row', outs.indexOf(TANK) >= 0 && ins.indexOf('grindless:bnnt_yarn') >= 0 && ins.indexOf('grindless:aerogel_fuel_tank') >= 0,
        'in [' + ins.join(', ') + '] fluids [' + fluidsOf(lazy().Helper.getInputFluids(winder)).join(', ') + '] out [' + outs.join(', ') + ']')
    }
    var hall = recipeById('grindless:thruster_assembly/hall_thruster')
    if (hall === null) {
      check('hall_krypton', false, 'grindless:thruster_assembly/hall_thruster not in the recipe manager')
    } else {
      var fin = fluidsOf(lazy().Helper.getInputFluids(hall))
      var fout = fluidsOf(lazy().Helper.getOutputFluids(hall))
      check('hall_krypton', fin.indexOf('gtceu:krypton 4000') >= 0 && fout.indexOf('gtceu:krypton 3600') >= 0,
        'in [' + itemsOf(hall, 'in').join(', ') + '] fluids in [' + fin.join(', ') + '] out [' + fout.join(', ') + ']')
    }
    var ion = recipeById('grindless:thruster_assembly/ion_thruster')
    check('ion_chamber', ion !== null && itemsOf(ion, 'in').indexOf('grindless:printed_thruster_chamber') >= 0,
      ion === null ? 'grindless:thruster_assembly/ion_thruster missing' : 'in [' + itemsOf(ion, 'in').join(', ') + ']')
    var pod = recipeById('grindless:thruster_assembly/thruster_pod')
    check('pod_row', pod !== null && itemsOf(pod, 'out').indexOf('grindless:thruster_pod') >= 0, pod === null ? 'missing' : 'out [' + itemsOf(pod, 'out').join(', ') + ']')
    // the krypton the Hall row burns comes from the Kuiper mix (B4 splits it later): report who makes krypton today
    var makers = []
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      if (!r.getInputEUt) return
      try {
        if (fluidsOf(lazy().Helper.getOutputFluids(r)).some(function (f) { return f.indexOf('gtceu:krypton ') === 0 })) makers.push(String(r.getId()))
      } catch (e) { /* not a GT recipe */ }
    })
    note('krypton_makers', makers.length + ': ' + makers.slice(0, 12).join(', '))
  }

  function planets() {
    var seen = []
    array(lazy().PlanetData.planets().keySet()).forEach(function (k) {
      var t = Number(lazy().PlanetData.getPlanet(k).rocketTier())
      if (t >= WANT_LEVEL) seen.push(String(k) + '=' + t)
    })
    note('level_7_destinations', seen.length === 0 ? 'none registered yet (Pluto and the Kuiper belt come with a later package)' : seen.join(', '))
  }

  // ---------------------------------------------------------------- the build

  function geometry(sp) {
    var back = STEPS[OPPOSITE[sp.facing]]
    var right = STEPS[CLOCKWISE[sp.facing]]
    function cell(b, s) { return { x: back.x * b + right.x * s, z: back.z * b + right.z * s } }
    var minx = 1e9
    var minz = 1e9
    for (var b = 0; b <= sp.b + 1; b++) {
      for (var s = -sp.l; s <= sp.r; s++) {
        var c = cell(b, s)
        minx = Math.min(minx, c.x)
        minz = Math.min(minz, c.z)
      }
    }
    var C = { x: sp.x - minx, y: CTRL_Y, z: sp.z - minz }
    return {
      C: C,
      at: function (b, s, y) {
        var c = cell(b, s)
        return { x: C.x + c.x, y: C.y + y, z: C.z + c.z }
      }
    }
  }

  function rocketBlocks() {
    var out = []
    for (var b = 1; b <= 2; b++) {
      for (var s = -1; s <= 1; s++) out.push({ b: b, s: s, y: 0, id: ELITE_MOTOR })
    }
    out.push({ b: 1, s: 0, y: 1, id: TANK })
    out.push({ b: 2, s: 0, y: 1, id: TANK })
    out.push({ b: 1, s: 0, y: 2, id: IDS.seat })
    return out
  }

  function setBlock(p, id) { S.level.getBlock(p.x, p.y, p.z).set(id) }
  function machineAt(p) { return lazy().MetaMachine.getMachine(S.level, new (lazy().Pos)(p.x, p.y, p.z)) }

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + (FLOOR_Y + 1) + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + FLOOR_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + FLOOR_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
  }

  function placeStructure() {
    var g = S.g
    for (var b = 1; b <= SP.b; b++) {
      for (var s = -SP.l; s <= SP.r; s++) setBlock(g.at(b, s, -1), IDS.pad)
    }
    for (var k = 0; k < SP.h; k++) setBlock(g.at(SP.b + 1, 0, k), IDS.frame)
    S.blocks.forEach(function (bl) { setBlock(g.at(bl.b, bl.s, bl.y), bl.id) })
    S.level.getBlock(g.C.x, g.C.y, g.C.z).set(IDS.scanner, { facing: SP.facing })
    var mach = machineAt(g.C)
    if (mach !== null && mach !== undefined && String(mach.getFrontFacing()) !== SP.facing) mach.setFrontFacing(lazy().Direction.byName(SP.facing))
  }

  function rocketsNear() {
    var box = new (lazy().AABB)(BAND.x0 - 1, PAD_Y - 1, BAND.z0 - 1, BAND.x1 + 2, CTRL_Y + 12, BAND.z1 + 2)
    return array(S.level.getEntitiesOfClass(lazy().Rocket, box)).filter(function (e) { return !e.isRemoved() })
  }

  // every rocket entity the level manager knows about, also the ones in sections the AABB getter skips
  function rocketsAnywhere() {
    var out = []
    var it = S.level.getAllEntities().iterator()
    while (it.hasNext()) {
      var e = it.next()
      if (e instanceof lazy().Rocket) out.push(e)
    }
    return out
  }
  function describe(e) {
    var reason = null
    try { reason = e.getRemovalReason() } catch (x) { /* older mappings */ }
    return '[' + Math.floor(e.getX()) + ',' + Math.floor(e.getY()) + ',' + Math.floor(e.getZ()) + ' removed=' + e.isRemoved() + (reason ? ' ' + reason : '') + ']'
  }

  function readLevel(r) {
    try { return String(r.getTier()) } catch (e) {
      try { return String(r.rocketTier()) } catch (e2) { return 'unreadable (' + e + ')' }
    }
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    S.server.runCommandSilent('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t++
    try {
      if (S.stage === 'form') {
        var mach = machineAt(S.g.C)
        if (mach !== null && mach !== undefined && mach.isFormed()) {
          check('scanner_formed', true, 'formed after ' + S.t + ' ticks')
          var space = global.grindless && global.grindless.space
          if (space && space.refreshRocketScanner) note('scanner_refresh', space.refreshRocketScanner(S.level, new (lazy().Pos)(S.g.C.x, S.g.C.y, S.g.C.z)))
          S.stage = 'build'
          S.wake = S.t + 10
        } else if (S.t >= FORM_TIMEOUT) {
          check('scanner_formed', false, 'not formed after ' + S.t + ' ticks (machine ' + (mach ? 'present' : 'absent') + ')')
          finish()
        }
        return
      }
      if (S.stage === 'build' && S.t >= S.wake) {
        S.before = rocketsAnywhere().length
        var m2 = machineAt(S.g.C)
        m2.setRocketBuilt(true)
        S.immediate = rocketsNear().length
        S.immediateAll = rocketsAnywhere().map(describe)
        S.stage = 'built'
        S.wake = S.t + 5
        return
      }
      if (S.stage === 'built' && S.t >= S.wake) {
        var rockets = rocketsNear()
        var all = rocketsAnywhere()
        note('rocket_search', 'in band: ' + rockets.length + ' (right after build ' + S.immediate + '); level-wide before build ' + S.before +
          ', right after ' + S.immediateAll.length + ' ' + S.immediateAll.join(' ') + ', now ' + all.length + ' ' + all.map(describe).join(' '))
        if (rockets.length !== 1 && all.length === S.before + 1) rockets = [all[all.length - 1]]
        if (rockets.length !== 1) {
          var m3 = machineAt(S.g.C)
          var diag = []
          try {
            var tag = m3.self().holder.saveWithoutMetadata()
            diag.push('formed=' + m3.isFormed() + ' rocketBuilt=' + m3.isRocketBuilt())
            ;['lDist', 'rDist', 'bDist', 'hDist'].forEach(function (k) { try { diag.push(k + '=' + m3[k]) } catch (e) { /* private */ } })
            diag.push('tagKeys=' + String(tag.getAllKeys()))
          } catch (e) { diag.push('machine read: ' + e) }
          S.blocks.forEach(function (bl) {
            var p = S.g.at(bl.b, bl.s, bl.y)
            diag.push(bl.b + '/' + bl.s + '/' + bl.y + '=' + String(S.level.getBlock(p.x, p.y, p.z).getId()))
          })
          check('rocket_built', false, rockets.length + ' rockets in the band (right after build: ' + S.immediate + '); ' + diag.join(' '))
          finish()
          return
        }
        var r = rockets[0]
        var level = readLevel(r)
        check('rocket_built', true, 'blocks=' + r.getBlocks().size() + ' seats=' + r.getSeatPositions().size() + ' thrusters=' + r.getThrusterCount() +
          ' fuel capacity=' + r.getFuelCapacity() + ' mB')
        check('rocket_level', level === String(WANT_LEVEL), 'six ' + ELITE_MOTOR + ' + two ' + TANK + ' -> level ' + level + ' (want ' + WANT_LEVEL +
          '; floor((3 + 11) / 2) = 7, min(parts) = 3)')
        try { r.unBuild() } catch (e) { note('unbuild', String(e)) }
        finish()
      }
    } catch (e) {
      check('step', false, 'exception in ' + S.stage + ': ' + e)
      finish()
    }
  }

  function run(server) {
    S = { server: server, level: server.overworld(), t: 0, failed: 0, finished: false, stage: 'static' }
    guarded('registration', registration)
    guarded('recipes', recipes)
    guarded('planets', planets)
    try {
      prepareWorld()
      S.g = geometry(SP)
      S.blocks = rocketBlocks()
      placeStructure()
      S.t = 0
      S.stage = 'form'
    } catch (e) {
      check('area', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.customCommand('gg_test_uv_propulsion', function () {
    if (S !== null && !S.finished) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global.ggTestUvPropulsion = true
    return 1
  })

  ServerEvents.tick(function (event) {
    if (global.ggTestUvPropulsion === true && Date.now() - LOADED_AT >= QUIET_MS) {
      global.ggTestUvPropulsion = false
      try { run(event.server) } catch (e) {
        S = S || { failed: 0, finished: false, server: event.server }
        check('run', false, 'exception: ' + e)
        finish()
      }
      return
    }
    onTick()
  })
})()
