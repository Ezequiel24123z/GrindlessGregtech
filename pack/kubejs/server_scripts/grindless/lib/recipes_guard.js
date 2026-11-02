// priority: 2000
// AF-K3 (audit M8-07): guarded recipe handlers. KubeJS 2001 posts ServerEvents.recipes without an exception handler (RecipesEventJS.java:359), so
// one script that throws ends the recipe handlers of every script that loads after it. Every handler of the pack registers through
//   global.grindless.recipes('<era>/<script>', function (event) { ... })
// which runs the handler inside try/catch: a failure is logged with the script's name and counted, and the next script's handler still runs.
// Read: global.grindless.recipesGuard.failures (how many handlers threw since the last reset) and .failed (their names and messages).
// tools/analysis/check-static.mjs fails on a ServerEvents.recipes handler that is neither registered through this wrapper nor a single try/catch.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var G = global.grindless || (global.grindless = {})
  var S = G.recipesGuard || (G.recipesGuard = { failures: 0, failed: [] })

  G.recipes = function (name, handler) {
    ServerEvents.recipes(function (event) {
      try {
        handler(event)
      } catch (e) {
        S.failures++
        S.failed.push(name + ': ' + e)
        console.error('[grindless/recipes] ' + name + ' failed, the other recipe scripts still run: ' + e)
      }
    })
  }
})()
