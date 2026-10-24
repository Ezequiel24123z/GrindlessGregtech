// Test-only (harness overlay, never part of the player pack).
// Answers Minecraft's "experimental settings" confirm screen when the test client creates its world: the pack ships
// worldgen datapack content, so Minecraft asks for confirmation and mc-runtime-test would wait for a click forever.
// KubeJS's own ClientEvents.tick does not fire before a world exists, hence the Forge client tick event.
;(() => {
  if (!Platform.isClientEnvironment()) return
  var ConfirmScreen = Java.loadClass('net.minecraft.client.gui.screens.ConfirmScreen')
  var Button = Java.loadClass('net.minecraft.client.gui.components.Button')
  var answered = 0

  // plain `var` on purpose: this Rhino fails with "redeclaration of var" when a handler with const/let locals runs twice
  ForgeEvents.onEvent('net.minecraftforge.event.TickEvent$ClientTickEvent', function (event) {
    if (answered >= 5) return
    try {
      var screen = Client.currentScreen
      if (!screen || !(screen instanceof ConfirmScreen)) return
      var kids = screen.children()
      for (var i = 0; i < kids.size(); i++) {
        var widget = kids.get(i)
        if (widget instanceof Button) {
          answered++
          console.info('GGTEST|CLIENT-CONFIRM|answering yes to "' + screen.getTitle().getString() + '"')
          widget.onPress()
          return
        }
      }
    } catch (e) {
      answered = 99
      console.warn('GGTEST|CLIENT-CONFIRM|unavailable (' + e + ')')
    }
  })
})()
