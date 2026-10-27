// priority: -1224
// Gregtech Grindless - EMI coverage, server half (TEST-ONLY overlay, never shipped with the pack). EMI lives on the client, so this
// half only arms the client one for a serial integrated run: a dispatcher like gg_test_v071_integration.js adds the stage
// ['emi_coverage', 'ggEmiCoverage', 'ggTestEmiCoverageStart'] and waits for serverDone and clientDone in global.ggEmiCoverage (failed
// when a check failed; the dispatcher's `cancel` stops the client half). Nothing here touches the world: no band, no player moves.
// Standalone runs need no server half: client_scripts/gg_test_emi_coverage.js reads its own marker.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  function shared() {
    if (!global.ggEmiCoverage) global.ggEmiCoverage = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggEmiCoverage
  }

  global.ggTestEmiCoverageStart = function (player) {
    var S = shared()
    S.put('requested', true)
    S.put('serverDone', true)
    console.info('GGTEST|emi_coverage|armed|NOTE|integrated stage: the client half asks EMI once it has loaded (read-only, no world band)')
  }
})()
