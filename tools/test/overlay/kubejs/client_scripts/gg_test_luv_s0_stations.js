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
  function val(map, key) {
    var v = map.get(key)
    return v === null || v === undefined ? '' : String(v)
  }
  ClientEvents.tick(function () {
    var map = global.ggGcyrFlight
    if (!map || val(map, 'hold') !== 'true' || Client.player === null) return
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
