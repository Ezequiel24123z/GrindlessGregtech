// Gregtech Grindless - EMI-1: once EMI and the recipes are loaded, fit each recipe type's info box to the text its recipes really have
// (global.ggInfoFit, startup_scripts/grindless/integration/recipe_info_wrap.js). One pass per game session.
;(function () {
  var done = false
  ClientEvents.tick(function () {
    if (done) return
    try {
      if (Client.player === null || Client.player === undefined || Client.level === null || Client.level === undefined) return
      if (!Java.loadClass('dev.emi.emi.runtime.EmiReloadManager').isLoaded()) return
      done = true
      var n = global.ggInfoFit(Client.level.getRecipeManager())
      console.info('[grindless/integration] info boxes fitted: ' + n)
    } catch (e) {
      done = true
      console.error('[grindless/integration] info box fit failed: ' + e)
    }
  })
})()
