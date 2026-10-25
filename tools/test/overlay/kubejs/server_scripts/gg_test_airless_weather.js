// Gregtech Grindless - Earth's weather stays on Earth (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with
// the pack). Script under test: pack/kubejs/server_scripts/grindless/space/airless_weather.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_airless_weather' -WaitForLog 'GGTEST\|airless_weather\|DONE@@300'
//
// It sets a thunderstorm on Earth for a while, so run it apart from the tests that read Earth's weather or sky (observatory,
// lv_content, leisure_utility). It builds nothing and does not set the time.
// Markers: GGTEST|airless_weather|<check>|PASS|FAIL|NOTE|<detail>, last line GGTEST|airless_weather|DONE
//   registry     global.grindless.airlessWeather lists the dimensions of the other planets (gcyr:luna and gcyr:mars among them) and
//                none of Earth's
//   earth_rain   after WAIT ticks of a thunderstorm on Earth, the Overworld's rain level is up (the storm really happened)
//   shared       NOTE: Earth dimensions with sky light take the Overworld's rain (vanilla shares the weather flags)
//   luna_dry, mars_dry       on the Moon and Mars the rain and thunder levels stay at 0.01 or less
//   luna_clock, mars_clock   Level#isNight() there agrees with the clock (vanilla's sky formula with no weather), which is what GTM's
//                            daytime condition reads; NOTE instead of a check within 0.05 of the dusk/dawn threshold
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var SCOPE = 'airless_weather'
  var WAIT = 200
  var PLANETS = ['gcyr:luna', 'gcyr:mars']
  var EARTH_SKY = ['grindless:void', 'grindless:flat']
  var EARTH = ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end', 'grindless:void', 'grindless:flat', 'gcyr:overworld_orbit']
  var PI = 3.141592653589793 // Math.PI is undefined in this Rhino
  var state = null

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = 'GGTEST|' + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function done() {
    console.info('GGTEST|' + SCOPE + '|DONE')
    state = null
  }

  function skyLight(level) {
    try {
      return String(level.dimensionType().hasSkyLight())
    } catch (e) {
      return '?'
    }
  }

  // vanilla 1.20.1, DimensionType#timeOfDay and Level#updateSkyBrightness with no rain or thunder: night when skyDarken >= 4
  function clockDarkness(dayTime) {
    var d0 = dayTime / 24000 - 0.25
    d0 = d0 - Math.floor(d0)
    var d1 = 0.5 - Math.cos(d0 * PI) / 2
    var timeOfDay = (d0 * 2 + d1) / 3
    var d2 = 0.5 + 2 * Math.max(-0.2, Math.min(0.2, Math.cos(timeOfDay * PI * 2)))
    return (1 - d2) * 11
  }

  function start(server) {
    var aw = global.grindless.airlessWeather
    var dims = aw ? aw.dimensions.map(function (d) { return String(d) }) : []
    var missing = PLANETS.filter(function (d) { return dims.indexOf(d) < 0 })
    var earthly = dims.filter(function (d) { return EARTH.indexOf(d) >= 0 })
    check('registry', aw !== undefined && missing.length === 0 && earthly.length === 0, 'dimensions=' + dims.join(',') +
      (missing.length > 0 ? ' missing ' + missing.join(',') : '') + (earthly.length > 0 ? ' Earth dimensions listed: ' + earthly.join(',') : ''))
    var ow = server.getLevel('minecraft:overworld')
    server.runCommandSilent('weather thunder 6000')
    try {
      ow.setRainLevel(1)
      ow.setThunderLevel(1)
    } catch (e) {
      note('earth_rain', 'could not set the Overworld rain level directly (' + e + '): waiting for the weather to ramp')
    }
    state = { server: server, ow: ow, ticks: 0 }
  }

  function finish() {
    var server = state.server
    var ow = state.ow
    var owRain = Number(ow.getRainLevel(1))
    check('earth_rain', owRain > 0.9, 'Overworld rain=' + owRain.toFixed(2) + ' thunder=' + Number(ow.getThunderLevel(1)).toFixed(2) +
      ' after ' + WAIT + ' ticks of /weather thunder')
    EARTH_SKY.forEach(function (id) {
      var l = server.getLevel(id)
      if (l === null) {
        note('shared', id + ' is not loaded')
        return
      }
      note('shared', id + ' skylight=' + skyLight(l) + ' rain=' + Number(l.getRainLevel(1)).toFixed(2) + ' (Earth keeps the shared weather)')
    })
    PLANETS.forEach(function (id) {
      var name = id.replace(/^gcyr:/, '')
      var l = server.getLevel(id)
      if (l === null) {
        check(name + '_dry', false, id + ' is not loaded')
        return
      }
      var rain = Number(l.getRainLevel(1))
      var thunder = Number(l.getThunderLevel(1))
      check(name + '_dry', rain <= 0.011 && thunder <= 0.011, 'rain=' + rain.toFixed(3) + ' thunder=' + thunder.toFixed(3) + ' skylight=' + skyLight(l))
      var dayTime = Number(l.getDayTime())
      var dark = clockDarkness(dayTime)
      var expected = Math.floor(dark) >= 4
      var night = Boolean(l.isNight())
      var detail = 'time=' + (dayTime % 24000) + ' clock darkness=' + dark.toFixed(2) + ' isNight=' + night + ' expected=' + expected
      if (Math.abs(dark - 4) < 0.05) note(name + '_clock', 'at the dusk/dawn threshold: ' + detail)
      else check(name + '_clock', night === expected, detail)
    })
    server.runCommandSilent('weather clear 6000')
    try {
      ow.setRainLevel(0)
      ow.setThunderLevel(0)
    } catch (e) { /* the clear weather ramps down by itself */ }
    done()
  }

  ServerEvents.customCommand('gg_test_airless_weather', function (event) {
    try {
      start(event.getLevel().getServer())
    } catch (e) {
      check('run', false, 'exception: ' + e)
      done()
    }
  })

  ServerEvents.tick(function () {
    if (state === null) return
    state.ticks++
    if (state.ticks < WAIT) return
    try {
      finish()
    } catch (e) {
      check('finish', false, 'exception: ' + e)
      done()
    }
  })
})()
