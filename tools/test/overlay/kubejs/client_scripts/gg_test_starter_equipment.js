// priority: 11900
// TEST-ONLY: paired real-client proof, asleep unless the marker-enabled server holds it.
// Right-click the gifted GTM prospector: its prospecting GUI must open, scan, and reveal the
// fixture vein on the map mod's ore layer. No packet injection, fake GUI or direct use call.
;(function () {
  var TAG = 'GGTEST|starter_equipment|'
  var c = { since: 0, ticks: 0, token: '', releaseNext: false, plan: null, renderer: null, layer: '',
    pending: false, phase: '', openedAt: 0, closedAt: 0, shot: false, shotDone: false, shotOk: false,
    allVisible: true, stopped: false }

  function val(key) {
    var value = global.ggStarterEquipment.get(key)
    return value === null || value === undefined ? '' : String(value)
  }

  function check(name, ok, detail) {
    if (!ok) throw new Error(name + ': ' + detail)
    console.info(TAG + name + '|PASS|' + detail)
  }

  function release(mc) {
    var pressed = c.releaseNext
    c.releaseNext = false
    if (pressed) mc.options.keyUse.setDown(false)
  }

  function abort(mc, error) {
    if (c.stopped) return
    c.stopped = true
    global.ggStarterEquipment.put('failed', true)
    global.ggStarterEquipment.put('clientAborted', String(error))
    global.ggStarterEquipment.put('hold', false)
    var detail = String(error)
    cleanup(mc)
    console.info(TAG + 'client_exception|FAIL|' + detail)
    if (global.ggStarterEquipment.putIfAbsent('doneLogged', true) === null) console.info(TAG + 'DONE')
  }

  function cleanup(mc) {
    c.stopped = true
    var errors = []
    try { release(mc) } catch (e) { errors.push('use key: ' + e) }
    try { mc.setScreen(null) } catch (e) { errors.push('screen: ' + e) }
    if (errors.length) global.ggStarterEquipment.put('failed', true)
    console.info(TAG + 'client_cleanup|' + (errors.length ? 'FAIL|' + errors.join('; ') : 'PASS|use key and screen released'))
    global.ggStarterEquipment.put('clientDone', true)
  }

  function markerId(entry) {
    return 'ore_veins@[' + entry.x + ',' + entry.y + ',' + entry.z + ']'
  }

  function row(mc) {
    return Java.loadClass('com.gregtechceu.gtceu.integration.map.xaeros.XaerosRenderer')
      .oreElements.row(mc.player.getLevel().getDimensionKey())
  }

  function screenName(mc) {
    return mc.screen === null ? '' : String(mc.screen.getClass().getName())
  }

  function setup(mc) {
    c.plan = JSON.parse(val('plan'))
    check('client_dimension', String(mc.player.getLevel().getDimensionKey().location()) === c.plan.dimension,
      'real client is in planned dimension ' + c.plan.dimension)
    var renderers = Java.loadClass('com.gregtechceu.gtceu.integration.map.GroupingMapRenderer')
      .getInstance().getRenderers().values().iterator()
    while (renderers.hasNext()) {
      var renderer = renderers.next()
      if (String(renderer.getClass().getName()).indexOf('XaerosRenderer') >= 0) c.renderer = renderer
    }
    check('xaero_renderer', c.renderer !== null, 'installed native GroupingMapRenderer contains Xaero')
    var keys = Java.loadClass('com.gregtechceu.gtceu.integration.map.layer.Layers').allKeys().iterator()
    while (keys.hasNext()) if (String(keys.next()) === 'ore_veins') c.layer = 'ore_veins'
    check('ore_layer_registered', c.layer !== '', 'native Ore Veins layer registered')
    c.renderer.setLayerActive(c.layer, true)
    check('ore_layer_visible', c.renderer.doShowLayer(c.layer), 'native Xaero Ore Veins layer enabled')
  }

  function fixtureVisible(mc) {
    var marker = row(mc).get(markerId(c.plan.entries[0]))
    if (marker === null) return false
    var label = String(marker.getName())
    if (label.trim() === '' || label.indexOf('gtceu.') >= 0) throw new Error('unusable marker label: ' + label)
    return true
  }

  function click(mc, token) {
    var player = mc.player
    player.getInventory().selected = 0
    var stack = player.getMainHandItem()
    if (mc.screen !== null || mc.getOverlay() !== null || stack.isEmpty() ||
        String(stack.getId()) !== 'gtceu:prospector.hv') return
    var origin = player.blockPosition()
    check('click_origin_' + token, origin.getX() === c.plan.center.x && origin.getZ() === c.plan.center.z,
      'keyUse origin matches the planned player chunk')
    var removed = row(mc).remove(markerId(c.plan.entries[0]))
    check('fixture_hidden_' + token, !row(mc).containsKey(markerId(c.plan.entries[0])),
      'fixture marker removed before the scan; wasKnown=' + (removed !== null))
    player.setPitch(-90)
    c.token = token
    c.pending = true
    c.phase = 'opening'
    c.openedAt = c.ticks
    mc.options.keyUse.setDown(true) // Minecraft sends the real use-item packet on its next tick.
    c.releaseNext = true
    global.ggStarterEquipment.put('clicked', token)
  }

  function finishScan(ok, detail) {
    console.info(TAG + 'client_scan_' + c.token + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
    global.ggStarterEquipment.put('scanResult', JSON.stringify({ ok: ok, detail: detail }))
    global.ggStarterEquipment.put('scanResultToken', c.token)
    c.pending = false
    c.phase = ''
  }

  function capture(mc) {
    c.shot = true
    var Client = Java.loadClass('net.minecraft.client.Minecraft').getInstance()
    var target = typeof Client.getMainRenderTarget === 'function' ? Client.getMainRenderTarget() : Client.m_91385_()
    Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported')
    Java.loadClass('net.minecraft.client.Screenshot').grab(Client.gameDirectory,
      '../kubejs/exported/gg_starter_prospector.png', target, function (msg) {
        // screenshot.success is emitted only after the PNG was written.
        c.shotOk = String(msg.getContents().getKey()) === 'screenshot.success'
        global.ggStarterEquipment.put('mapDetail', screenName(mc) + '; kubejs/exported/gg_starter_prospector.png; ' + msg)
        c.shotDone = true
      })
  }

  function inspect(mc) {
    if (!c.pending) return
    var waited = c.ticks - c.openedAt
    if (c.phase === 'opening') {
      if (screenName(mc).indexOf('ModularUI') >= 0) {
        check('gui_open_' + c.token, true, 'right-click opened GTM prospecting GUI ' + screenName(mc))
        c.phase = 'scanning'
        c.openedAt = c.ticks
      } else if (waited > 60) throw new Error('prospector right-click did not open GTM GUI; screen=' + screenName(mc))
      return
    }
    if (c.phase === 'scanning') {
      if (screenName(mc).indexOf('ModularUI') < 0) throw new Error('prospecting GUI closed early (energy ran out?)')
      // HV radius 4 scans 7x7 chunks, one per tick; allow the client queue to drain.
      if (waited < 70) return
      var seen = fixtureVisible(mc)
      c.allVisible = c.allVisible && seen
      if (!seen) {
        if (waited > 200) throw new Error('fixture vein never reached the map layer after the GUI scan')
        return
      }
      if (c.token === '1' && !c.shot) capture(mc)
      if (c.token === '1' && !c.shotDone) return
      mc.setScreen(null)
      c.phase = 'closing'
      c.closedAt = c.ticks
      return
    }
    if (c.phase === 'closing' && c.ticks - c.closedAt >= 6) {
      finishScan(true, 'GUI opened, scanned and revealed the fixture vein on the Xaero ore layer')
    }
  }

  function map(mc) {
    global.ggStarterEquipment.put('mapResult', c.shotOk ? 'PASS' : 'FAIL')
    global.ggStarterEquipment.put('codecDone', c.allVisible)
    global.ggStarterEquipment.put('mapDone', true)
  }

  ClientEvents.tick(function () {
    if (!global.ggStarterEquipment || c.stopped) return
    var mc = null
    try {
      mc = Client
      release(mc)
      if (val('hold') !== 'true') {
        if (c.since || val('serverDone') === 'true') cleanup(mc)
        return
      }
      if (!c.since) c.since = Date.now()
      if (Date.now() - c.since > 120000) throw new Error('120s client proof timeout')
      c.ticks++
      if (mc.player && mc.player.age >= 80) mc.player.age = 20
      if (!mc.player || val('plan') === '') return
      if (c.plan === null) setup(mc)
      inspect(mc)
      var token = val('scanToken')
      if (token !== '' && token !== c.token) click(mc, token)
      if (val('mapRequested') === 'true' && val('mapDone') !== 'true') map(mc)
    } catch (e) {
      abort(mc, e)
    }
  })
})()
