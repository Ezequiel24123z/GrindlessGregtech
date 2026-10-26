// S0-a: X 13568..13631. Extends the proven GCYR flight, not its executor.
;(function () {
  var state = null
  var counts = { pass: 0, fail: 0 }
  var TAG = 'GGTEST|luv_s0_environment|'
  function check(name, ok, detail) {
    counts[ok ? 'pass' : 'fail']++
    console.info(TAG + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + String(detail).replace(/\|/g, '/'))
  }
  function value(map, key) {
    var v = map.get(key)
    return v === null ? '' : String(v)
  }
  function hits(fl, id, since) {
    return fl.hits.filter(function (h) { return h.t >= since && h.id === id }).length
  }
  function restore(p) {
    p.setHeadArmorItem(Item.of('gcyr:space_helmet'))
    p.setChestArmorItem(Item.of('gcyr:space_chestplate', '{Fluid:{FluidName:"gtceu:oxygen",Amount:16000}}'))
    p.setHealth(20)
  }
  global.ggLuvS0 = {
    summary: function () { return { pass: counts.pass, fail: counts.fail } },
    onMoon: function (p, tick, fl, server, map) {
      var level = p.getLevel()
      if (state === null) {
        var PD = Java.loadClass('argent_matter.gcyr.data.loader.PlanetData')
        var planet = PD.getPlanet(new ResourceLocation('grindless:s0_moon'))
        var orbit = server.getLevel('grindless:s0_moon_orbit')
        state = { phase: 'weather', at: tick, start: tick, x: p.getX(), y: p.getY(), z: p.getZ(), samples: [] }
        var marker = JsonIO.read('kubejs/config/gg_test_luv_s0_planet.json')
        state.reusedEnvironment = marker !== null && String(marker.get('resumeAfterEnvironment')) === 'true'
        if (state.reusedEnvironment) {
          console.info(TAG + 'prior_environment|NOTE|reusing 20261026-043657-client-69a terrain/sky/orbit/weather/suit/oxygen/cold proof; observing only unresolved fall and reboarding')
          p.stopRiding()
          p.teleportTo('grindless:s0_moon', state.x + 5, state.y + 20, state.z, 0, 0)
          state.phase = 'fall_settle'
          return false
        }
        check('landing_coordinates', p.getX() >= 13568 && p.getX() <= 13632 && p.getZ() >= 0 && p.getZ() < 64,
          'natural landing at ' + state.x + ',' + state.y + ',' + state.z)
        var ground = Math.floor(state.y) - 1
        while (ground > 0 && String(level.getBlock(Math.floor(state.x), ground, Math.floor(state.z)).getId()) === 'minecraft:air') ground--
        var floor = String(level.getBlock(Math.floor(state.x), ground, Math.floor(state.z)).getId())
        check('natural_terrain', ground > 0 && (floor === 'gcyr:moon_sand' || floor === 'gcyr:moon_stone'),
          'generated terrain at Y' + ground + ': ' + floor)
        check('environment_codec', Math.abs(Number(planet.gravity()) - 1.315) < 0.0001 &&
          Number(PD.getWorldTemperature(level)) === 102 && !planet.hasOxygen(),
          'gravity=' + planet.gravity() + ' m/s2, temperature=' + PD.getWorldTemperature(level) + 'K, oxygen=' + planet.hasOxygen())
        check('orbit_loads', orbit !== null && orbit.getChunk(848, 0) !== null,
          'orbit dimension=' + (orbit === null ? 'missing' : orbit.getDimension()))
        server.runCommandSilent('weather rain 120')
        map.put('s0Scene', 'moon')
        return false
      }
      var age = tick - state.at
      if (state.phase === 'weather') {
        if (age < 160) return false
        check('dry_during_earth_rain', server.overworld().getRainLevel(1) > 0.5 && level.getRainLevel(1) <= 0.011,
          'Earth=' + server.overworld().getRainLevel(1) + ', moon=' + level.getRainLevel(1))
        check('suited_survival', fl.hits.filter(function (h) { return h.t >= state.start }).length === 0,
          'full suit, 102K vacuum, 160 ticks; health=' + p.getHealth())
        state.phase = 'oxygen'
        state.at = tick
        p.setChestArmorItem(Item.of('gcyr:space_chestplate'))
        return false
      }
      if (state.phase === 'oxygen') {
        p.setHealth(20)
        if (age < 35) return false
        check('oxygen_hazard', hits(fl, 'drown', state.at) > 0,
          'full suit without oxygen: drown hits=' + hits(fl, 'drown', state.at))
        restore(p)
        p.setHeadArmorItem(Item.of('minecraft:air'))
        state.phase = 'cold'
        state.at = tick
        state.maxFrozen = 0
        return false
      }
      if (state.phase === 'cold') {
        p.setHealth(20)
        state.maxFrozen = Math.max(state.maxFrozen, Number(p.getTicksFrozen()))
        if (age < 35) return false
        // Oxygen damage can suppress a same-tick freeze hit; the native frost counter still records exposure.
        check('temperature_hazard', state.maxFrozen > 0,
          'helmet removed at 102K: freeze hits=' + hits(fl, 'freeze', state.at) + ', max frozen ticks=' + state.maxFrozen)
        restore(p)
        p.stopRiding()
        p.teleportTo('grindless:s0_moon', state.x + 5, state.y + 20, state.z, 0, 0)
        state.phase = 'fall_settle'
        state.at = tick
        return false
      }
      if (state.phase === 'fall_settle') {
        if (age < 5) return false
        map.put('s0Fall', 'start')
        state.phase = 'fall'
        state.at = tick
        return false
      }
      if (state.phase === 'fall') {
        var data = value(map, 's0FallResult')
        if (data === '') {
          if (age > 120) throw new Error('client fall observation timed out')
          return false
        }
        var sample = JSON.parse(data)
        state.samples = sample
        check('configured_gravity_fall', sample.drop > 0.2 && sample.drop < 1.2,
          '10 client physics ticks at JSON gravity 1.315 m/s2: drop=' + sample.drop +
          ' blocks; expected roughly 0.45, vanilla roughly 3.35; positions=' + sample.positions.join(','))
        JsonIO.write('kubejs/exported/luv_s0_environment.json', {
          gravity: 1.315, temperature: 102, fall: sample, landing: { x: state.x, y: state.y, z: state.z },
          checks: { pass: counts.pass, fail: counts.fail }, reusedEnvironment: state.reusedEnvironment
        })
        p.teleportTo('grindless:s0_moon', state.x, state.y, state.z, 0, 0)
        state.phase = 'reboard'
        state.at = tick
        return false
      }
      if (state.phase === 'reboard') {
        if (age < 20) return false
        var Hand = Java.loadClass('net.minecraft.world.InteractionHand')
        p.setMainHandItem(Item.of('minecraft:air'))
        p.interactOn(fl.rocket, Hand.MAIN_HAND)
        check('reboard_after_surface_work', p.getVehicle() !== null, 'real rocket interaction after environment probes')
        server.runCommandSilent('weather clear')
        state.phase = 'done'
        return true
      }
      return state.phase === 'done'
    }
  }
})()
