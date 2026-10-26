// Render-thread observations for the disposable planet proof.
;(function () {
  ClientEvents.lang('en_us', function (event) {
    event.add('grindless', 'level.grindless.s0_jupiter', 'S0 Jupiter')
    event.add('grindless', 'level.grindless.s0_moon', 'S0 Moon')
    event.add('grindless', 'block.grindless.s0_cryogenic_fuel_tank', 'S0 Cryogenic Fuel Tank')
  })
  ClientEvents.lang('es_es', function (event) {
    event.add('grindless', 'level.grindless.s0_jupiter', 'S0 Jupiter')
    event.add('grindless', 'level.grindless.s0_moon', 'S0 Luna')
    event.add('grindless', 'block.grindless.s0_cryogenic_fuel_tank', 'S0 Tanque de combustible criogenico')
  })
  var fall = null
  var sceneTicks = 0
  var nav = { screen: null, step: 0, wait: 0 }
  function log(name, status, detail) {
    console.info('GGTEST|luv_s0_menu|' + name + '|' + status + '|' + String(detail).replace(/\|/g, '/'))
  }
  global.ggLuvS0Navigate = function (mc, screen, want, map) {
    if (nav.screen !== screen) nav = { screen: screen, step: 0, wait: 0, since: Date.now() }
    if (++nav.wait % 10 !== 0) return
    var list = screen.children()
    var buttons = []
    for (var i = 0; i < list.size(); i++) {
      var button = list.get(i)
      if (String(button.visible) === 'true' && typeof button.onPress === 'function') {
        buttons.push({ button: button, text: String(button.getMessage().getString()) })
      }
    }
    log('visible_' + nav.step, 'NOTE', buttons.map(function (b) {
      return b.text + '(active=' + b.button.active + ',x=' + b.button.getX() + ',y=' + b.button.getY() + ')'
    }).join('; '))
    var earth = want === 'gcyr:earth'
    var parent = String(Text.translate(earth ? 'level.overworld' : 'level.grindless.s0_jupiter').getString())
    var pick = null
    if (nav.step === 0) {
      var solar = String(Text.translate('gcyr.solar_system').getString())
      pick = buttons.filter(function (b) { return b.text === solar })[0]
    } else if (nav.step === 1) {
      pick = buttons.filter(function (b) {
        return b.text === parent
      })[0]
    } else {
      var target = earth || want === 'grindless:s0_jupiter' ? parent : String(Text.translate('level.grindless.s0_moon').getString())
      pick = buttons.filter(function (b) { return b.text === target })[0]
      var station = String(map.get('stationSelect')) === 'true'
      if (pick && station) {
        var surface = pick.button
        var stationText = String(Java.loadClass('argent_matter.gcyr.client.gui.screen.PlanetSelectionScreen').SPACE_STATION_TEXT.getString())
        var matches = buttons.filter(function (b) {
          return b.text === stationText && b.button.getY() === surface.getY() && b.button.getX() > surface.getX()
        })
        pick = matches.length === 1 ? matches[0] : null
      }
      if (pick) {
        if (!nav.captured) {
          nav.captured = true
          map.put('shot', 's0_' + map.get('luvProbe') + '_menu_' + target.replace(/ /g, '_') + (station ? '_station' : ''))
          return
        }
        log('hierarchy_' + target.replace(/ /g, '_'), String(pick.button.active) === 'true' ? 'PASS' : 'FAIL',
          'target is an actual visible ' + (station ? 'station' : 'surface') + ' widget after solar-system and parent navigation')
        map.put('selected', want)
        map.put('select', '')
      }
    }
    if (pick && String(pick.button.active) === 'true') {
      pick.button.onPress()
      nav.step++
    } else if (nav.wait > 160 || Date.now() - nav.since > 8000) {
      var detail = 'no active widget for step ' + nav.step + ', target ' + want
      log('navigation', 'FAIL', detail)
      map.put('navigationError', detail)
      map.put('select', '')
      // GCYR deliberately refuses onClose in survival. Unpause the failed test
      // so its server owner can record the failure and release the client hold.
      mc.setCurrentScreen(null)
    }
  }
  ClientEvents.tick(function () {
    var map = global.ggGcyrFlight
    var p = Client.player
    if (!map || p === null || String(map.get('hold')) !== 'true') return
    if (String(map.get('s0Scene')) === 'moon') {
      p.setYaw(0)
      p.setPitch(-25)
      if (++sceneTicks === 30) {
        map.put('shot', 's0_jupiter_sky')
        map.put('s0Scene', '')
      }
    }
    if (String(map.get('s0Fall')) === 'start') {
      map.put('s0Fall', '')
      p.setDeltaMovement(Java.loadClass('net.minecraft.world.phys.Vec3').ZERO)
      fall = { y: p.getY(), positions: [Number(p.getY())] }
      return
    }
    if (fall !== null) {
      fall.positions.push(Number(p.getY()))
      if (fall.positions.length === 11) {
        map.put('s0FallResult', JSON.stringify({ drop: fall.y - p.getY(), positions: fall.positions }))
        fall = null
      }
    }
  })
})()
