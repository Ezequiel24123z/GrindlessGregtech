// XP-Z1b: opens the epilogue as a vanilla written-book screen. The server right-click handler (server_scripts/grindless/maxplus/ending.js) sends the
// 'grindless_epilogue_open' data packet; the stack here is client-built and never exists in the world. Pages are lang keys (maxplus_ending_lang.js).
;(function () {
  var PAGES = 6
  var failed = false

  NetworkEvents.dataReceived('grindless_epilogue_open', function (event) {
    try {
      var pages = []
      for (var i = 1; i <= PAGES; i++) pages.push(JSON.stringify({ translate: 'grindless.ending.book.page.' + i }))
      var stack = Item.of('minecraft:written_book', {
        title: 'Epilogue',
        author: 'The road to the end',
        pages: pages,
        resolved: true
      })
      var Screen = Java.loadClass('net.minecraft.client.gui.screens.inventory.BookViewScreen')
      var Mc = Java.loadClass('net.minecraft.client.Minecraft')
      var Access = Java.loadClass('net.minecraft.client.gui.screens.inventory.BookViewScreen$BookAccess')
      Mc.getInstance().setScreen(new Screen(Access.fromItem(stack)))
    } catch (e) {
      if (!failed) {
        failed = true
        console.error('[grindless/ending] epilogue book failed: ' + e)
      }
    }
  })
})()
