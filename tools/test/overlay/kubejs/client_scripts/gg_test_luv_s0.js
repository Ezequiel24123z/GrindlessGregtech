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
    if (nav.screen !== screen) nav = { screen: screen, step: 0, wait: 0 }
    if (++nav.wait % 10 !== 0) return
    var list = screen.children()
    var buttons = []
    for (var i = 0; i < list.size(); i++) {
      var button = list.get(i)
      if (button.visible && typeof button.onPress === 'function') {
        buttons.push({ button: button, text: String(button.getMessage().getString()) })
      }
    }
    log('visible_' + nav.step, 'NOTE', buttons.map(function (b) { return b.text + '(active=' + b.button.active + ')' }).join('; '))
    var earth = want === 'gcyr:earth'
    var parent = String(Text.translate(earth ? 'level.overworld' : 'level.grindless.s0_jupiter').getString())
    var pick = null
    if (nav.step === 0) {
      pick = buttons.filter(function (b) { return /solar/i.test(b.text) })[0]
    } else if (nav.step === 1) {
      pick = buttons.filter(function (b) {
        return b.text === parent
      })[0]
    } else {
      var target = earth || want === 'grindless:s0_jupiter' ? parent : String(Text.translate('level.grindless.s0_moon').getString())
      pick = buttons.filter(function (b) { return b.text === target })[0]
      if (pick) {
        log('hierarchy_' + target.replace(/ /g, '_'), pick.button.active ? 'PASS' : 'FAIL',
          'target is an actual visible teleport widget after solar-system and parent navigation')
        map.put('selected', want)
        map.put('select', '')
      }
    }
    if (pick && pick.button.active) {
      pick.button.onPress()
      nav.step++
    } else if (nav.wait > 160) {
      log('navigation', 'FAIL', 'no active widget for step ' + nav.step + ', target ' + want)
      map.put('select', '')
      screen.onClose()
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
      p.setDeltaMovement(0, 0, 0)
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
