// priority: -400
// Gregtech Grindless - test overlay (not shipped with the pack): what the quantum bridge card test (server_scripts/gg_test_qbc.js) needs
// from Forge events, which KubeJS server and client scripts cannot listen to (a startup script; the client event is guarded):
//   - client: every action-bar and chat message the client receives while the test holds the client (AE2's "Wireless Out Of Range.",
//     "Linked network cannot be found", our quantum link chamber's notice...);
//   - server (the integrated server of the client suite): every menu the server opens and closes for the player, with the server tick.
// Both go into global.ggQbc as <kind>Seq and <kind>_<n> (kind msg or menu), only while the test holds the client ('hold').
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  function store(kind, text) {
    var S = global.ggQbc
    if (!S || String(S.get('hold')) !== 'true') return false
    var seq = Number(S.get(kind + 'Seq') || 0)
    if (isNaN(seq)) seq = 0
    seq++
    S.put(kind + '_' + seq, String(text))
    S.put(kind + 'Seq', String(seq))
    return true
  }

  function clean(text) {
    return String(text).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
  }

  if (Platform.isClientEnvironment()) {
    ForgeEvents.onEvent('net.minecraftforge.client.event.ClientChatReceivedEvent$System', function (event) {
      try {
        var line = (event.isOverlay() ? 'action bar "' : 'chat "') + String(event.getMessage().getString()) + '"'
        if (store('msg', line)) console.info('GGTEST|qbc|client_message|NOTE|' + clean(line))
      } catch (e) {
        console.info('GGTEST|qbc|client_message|NOTE|could not read the message (' + e + ')')
      }
    })
  }

  function onMenu(kind, event) {
    try {
      var srv = event.getEntity().getServer()
      if (srv === null || srv === undefined) return
      var line = kind + ' ' + event.getContainer().getClass().getSimpleName() + ' @' + srv.getTickCount()
      if (store('menu', line)) console.info('GGTEST|qbc|server_menu|NOTE|' + clean(line))
    } catch (e) {
      console.info('GGTEST|qbc|server_menu|NOTE|could not read the menu event (' + e + ')')
    }
  }

  ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerContainerEvent$Open', function (event) { onMenu('open', event) })
  ForgeEvents.onEvent('net.minecraftforge.event.entity.player.PlayerContainerEvent$Close', function (event) { onMenu('close', event) })
})()
