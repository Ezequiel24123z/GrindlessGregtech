// priority: 9900
// -----------------------------------------------------------------------------------------------
// Hologram Projector, client side: the hologram.
//
// It is GTM 7.5.3's own in-world multiblock preview (MultiblockInWorldPreviewRenderer, what GTM draws on a sneak + empty-hand
// click on an unformed controller): the blocks of the definition's first matching shape drawn at 80 % of their size where they go,
// turned to the controller's facing and upwards facing, hatches and buses included where GTM's preview puts them. The first shape
// is the structure at its minimum repetitions (the size the projector builds) or, for machines with designed shapes such as the
// EBF, GTM's first design (the first coil). GTM's renderer ignores the controller's flip; GTM clears the flip when a structure
// breaks, so only a controller that formed mirrored and was then turned with a wrench shows the unmirrored design.
//
// The server (server_scripts/grindless/steam/hologram_projector.js) sends each right-click on an unformed controller here; a click
// on the controller whose hologram is showing hides it, any other click shows that controller's for 30 s.
// Published for the client test (tools/test/overlay/kubejs/client_scripts/gg_test_projector.js): global.grindless.projectorClient
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHANNEL = 'grindless_projector'
  var G = global.grindless || (global.grindless = {})
  var C = (G.projectorClient = { shown: 0, hidden: 0, last: '', lastAt: 0, errors: 0, error: '' })
  var showing = { pos: '', until: 0 }
  var J = null

  function lazy() {
    if (J === null) {
      J = {
        Renderer: Java.loadClass('com.gregtechceu.gtceu.client.renderer.MultiblockInWorldPreviewRenderer'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        Controller: Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.MultiblockControllerMachine')
      }
    }
    return J
  }

  function status(player, text) {
    if (player !== null && player !== undefined) player.setStatusMessage(text)
  }

  NetworkEvents.dataReceived(CHANNEL, function (event) {
    try {
      var j = lazy()
      var mc = Client
      var d = event.getData()
      var x = d.getInt('x')
      var y = d.getInt('y')
      var z = d.getInt('z')
      var ticks = d.getInt('ticks')
      var key = x + ',' + y + ',' + z
      var now = Date.now()
      if (showing.pos === key && now < showing.until) {
        j.Renderer.cleanPreview()
        showing.pos = ''
        showing.until = 0
        C.hidden++
        C.last = 'hidden ' + key
        C.lastAt = now
        status(mc.player, Text.translate('message.grindless.projector.hologram_off'))
        return
      }
      var pos = new BlockPos(x, y, z)
      var machine = j.MetaMachine.getMachine(mc.level, pos)
      if (machine === null || machine === undefined || !(machine instanceof j.Controller)) {
        C.last = 'no controller at ' + key
        return
      }
      var def = machine.getDefinition()
      var machineName = Text.translate(String(def.getDescriptionId()))
      if (def.isRenderWorldPreview() !== true) {
        C.last = 'no preview for ' + def.getId()
        status(mc.player, Text.translate('message.grindless.projector.no_hologram', machineName))
        return
      }
      // GTM steps through the layers when the same controller is previewed again: start from the whole structure
      j.Renderer.cleanPreview()
      j.Renderer.showPreview(pos, machine, ticks)
      showing.pos = key
      showing.until = now + ticks * 50
      C.shown++
      C.last = 'shown ' + key + ' ' + def.getId()
      C.lastAt = now
      status(mc.player, Text.translate('message.grindless.projector.hologram_on', machineName, String(Math.round(ticks / 20))))
    } catch (e) {
      C.errors++
      C.error = String(e)
      console.error('[grindless/projector] hologram: ' + e)
    }
  })
})()
