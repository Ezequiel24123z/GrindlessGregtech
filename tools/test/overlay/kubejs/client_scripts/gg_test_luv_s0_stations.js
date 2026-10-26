// TEST ONLY. World-loaded observations/real Pack button input for S0-3.
// Uses the consolidated flight map and hold; never starts a run or reconnects.
// The pinned packager UI is 176x166; its button is at (7,58), size 80x24.
// Calling Screen.mouseClicked dispatches through the real LDLib widget/network
// path to the private native onBuildButtonClick. Server output is the proof,
// not the mouseClicked return value. No private fields/reflection/packet shim.
;(function () {
  var lastPack = ''
  var lastBorder = ''
  var borderWait = 0
  var Gui = null
  var PlanetScreen = null
  var ModularMenu = null
  var PlanetMenu = null
  var menuToken = ''
  var ownedScreen = null
  var closedMenuToken = ''
  function val(map, key) {
    var v = map.get(key)
    return v === null || v === undefined ? '' : String(v)
  }
  function matchesOwnedMenu(screen, marker) {
    if (!screen || !Client.player || typeof screen.getMenu !== 'function') return false
    if (Gui === null) Gui = Java.loadClass('com.lowdragmc.lowdraglib.gui.modular.ModularUIGuiContainer')
    if (PlanetScreen === null) PlanetScreen = Java.loadClass('argent_matter.gcyr.client.gui.screen.PlanetSelectionScreen')
    if (ModularMenu === null) ModularMenu = Java.loadClass('com.lowdragmc.lowdraglib.gui.modular.ModularUIContainer')
    if (PlanetMenu === null) PlanetMenu = Java.loadClass('argent_matter.gcyr.common.gui.PlanetSelectionMenu')
    var menu = screen.getMenu()
    if (String(menu.containerId) !== marker.id ||
        String(Client.player.getLevel().getDimensionKey().location()) !== marker.dimension) return false
    if (marker.kind === 'program') return menu instanceof PlanetMenu && screen instanceof PlanetScreen &&
      menu.getPlayer().equals(Client.player)
    if (!(menu instanceof ModularMenu) || !(screen instanceof Gui)) return false
    var ui = menu.getModularUI()
    if (!ui.entityPlayer.equals(Client.player)) return false
    if (marker.kind === 'cargo') return String(ui.holder.getStringUuid()) === marker.rocket
    if (marker.kind !== 'pack') return false
    var at = ui.holder.getPos()
    return Number(at.getX()) === marker.at.x && Number(at.getY()) === marker.at.y &&
      Number(at.getZ()) === marker.at.z
  }
  function menuCleanup(map) {
    var raw = val(map, 's0sMenuOpen')
    if (!raw) return
    var marker = JSON.parse(raw)
    if (marker.token !== menuToken) {
      menuToken = marker.token
      ownedScreen = null
    }
    if (closedMenuToken === marker.token) return
    var screen = Client.currentScreen
    if (ownedScreen !== null && screen !== ownedScreen) {
      ownedScreen = null // Native close or replacement: retain no old-world GUI.
      closedMenuToken = marker.token
      return
    }
    // Once captured, a same-id replacement is NOT our screen. A late native
    // UI-open packet may first be seen after server abort/hold release.
    if (ownedScreen === null && matchesOwnedMenu(screen, marker)) ownedScreen = screen
    if (ownedScreen === null || screen !== ownedScreen) return
    var close = val(map, 's0sMenuClose')
    var requested = close && JSON.parse(close).token === marker.token
    var ceiling = marker.kind === 'program' ? 10000 : 8000
    var expired = val(map, 'hold') === 'true' && Date.now() - Number(marker.since) > ceiling
    if ((!requested && !expired) || closedMenuToken === marker.token) return
    if (expired && !requested) {
      // A planet screen pauses the integrated server. Unpause THIS owned screen
      // so its existing owner can abort, close the native menu and restore state.
      map.put('navigationError', 'owned station ' + marker.kind + ' menu exceeded its existing local ceiling')
    }
    Client.setCurrentScreen(null) // Only the exact recognized fixture screen.
    ownedScreen = null
    closedMenuToken = marker.token
    map.put('s0sMenuClosed', marker.token)
    console.info('GGTEST|luv_s0_stations|owned_client_screen_closed|NOTE|' +
      marker.kind + ', menu=' + marker.id + ', serverClose=' + !!requested)
  }
  ClientEvents.tick(function () {
    var map = global.ggGcyrFlight
    if (!map) return
    try { menuCleanup(map) } catch (cleanupError) {
      map.put('navigationError', 'owned station menu cleanup: ' + cleanupError)
    }
    if (val(map, 'hold') !== 'true' || Client.player === null) return
    var mc = Client
    var request = val(map, 's0sPackRequest')
    if (request && request !== lastPack) {
      try {
        // LDLib 1.0.40.b (embedded in GTM 7.5.3); ModularUIGui does not exist.
        if (Gui === null) Gui = Java.loadClass('com.lowdragmc.lowdraglib.gui.modular.ModularUIGuiContainer')
        var screen = mc.currentScreen
        if (screen !== null && screen instanceof Gui &&
            String(Client.player.containerMenu.containerId) === val(map, 's0sPackMenu')) {
          var x = (Number(screen.width) - 176) / 2 + 47
          var y = (Number(screen.height) - 166) / 2 + 70
          var clicked = screen.mouseClicked(x, y, 0)
          screen.mouseReleased(x, y, 0)
          lastPack = request
          console.info('GGTEST|luv_s0_stations|client_pack_input|NOTE|native UI click=' + clicked +
            ', menu=' + val(map, 's0sPackMenu'))
        }
      } catch (err) {
        lastPack = request
        map.put('s0sPackError', String(err))
      }
    }
    var raw = val(map, 's0sBorderRequest')
    if (raw) {
      try {
        var want = JSON.parse(raw)
        if (want.token !== lastBorder) {
          // Allow actual GCYR center/size packets several ticks to arrive.
          if (++borderWait < 8) return
          var level = Client.player.getLevel()
          var border = level.getWorldBorder()
          map.put('s0sBorderResult', JSON.stringify({ token: want.token,
            dimension: String(level.getDimensionKey().location()),
            bounds: { minX: Number(border.getMinX()), maxX: Number(border.getMaxX()),
              minZ: Number(border.getMinZ()), maxZ: Number(border.getMaxZ()) } }))
          lastBorder = want.token
          borderWait = 0
        }
      } catch (err2) {
        map.put('s0sBorderResult', JSON.stringify({ token: '', error: String(err2) }))
      }
    } else borderWait = 0
  })
})()
