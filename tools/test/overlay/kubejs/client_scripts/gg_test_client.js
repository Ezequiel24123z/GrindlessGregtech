// Test-only (harness overlay, never part of the player pack): records which OpenGL implementation the client uses
// once the player has joined the world. See also startup_scripts/gg_test_client.js.
// Plain `var` on purpose: this Rhino throws "redeclaration of var" for const/let locals inside event handlers.
ClientEvents.loggedIn(function (event) {
  try {
    var gl = Java.loadClass('com.mojang.blaze3d.platform.GlUtil')
    console.info('GGTEST|CLIENT-GL|renderer=' + gl.getRenderer() + '|version=' + gl.getOpenGLVersion())
  } catch (e) {
    console.warn('GGTEST|CLIENT-GL|unavailable (' + e + ')')
  }
})