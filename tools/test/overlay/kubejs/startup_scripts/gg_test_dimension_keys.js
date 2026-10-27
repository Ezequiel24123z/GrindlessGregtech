// priority: -100
// Gregtech Grindless - test overlay (not shipped with the pack): records the action-bar messages the client receives while
// the travel-key test runs (server_scripts/gg_test_dimension_keys.js checks the "key failed" message a player sees).
// A startup script because KubeJS client scripts cannot listen to Forge events; the event is client-only, hence the guard.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  if (!Platform.isClientEnvironment()) return
  ForgeEvents.onEvent('net.minecraftforge.client.event.ClientChatReceivedEvent$System', function (event) {
    try {
      if (!event.isOverlay()) return
      var S = global.ggDimensionKeys
      if (!S || String(S.get('hold')) !== 'true') return
      var text = String(event.getMessage().getString())
      S.put('clientActionBar', text)
      console.info('GGTEST|dimension_keys|client_action_bar|NOTE|' + text.replace(/[\r\n]+/g, ' ').replace(/\|/g, '/'))
    } catch (e) {
      console.info('GGTEST|dimension_keys|client_action_bar|NOTE|could not read the message (' + e + ')')
    }
  })
})()
