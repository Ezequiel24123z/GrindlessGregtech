// priority: -22024
// -----------------------------------------------------------------------------------------------
// GCYR Rocket Scanner (gcyr:rocket_scanner, GCYR 0.2.9): what the pack does when a player right-clicks the controller, before
// "Build" can be pressed in its UI. Two GCYR bugs behind issue #122 ("the rocket disappears or builds partway"), both reproduced in
// game by tools/test/overlay/kubejs/server_scripts/gg_test_gcyr_flight.js:
//
// 1. Stale height. GCYR measures the pad and the stainless steel frame tower (lDist, rDist, bDist, hDist) only while GTM checks the
//    structure, and "Build" scans the rows of the pad up to the tower height. Once the scanner has formed, GTM only checks it again
//    when a block of the formed pattern changes; frames added on top of the tower and everything on the pad are "any" positions of
//    that pattern, so a tower that grows after forming is never measured again: "Build" scans the old height, the top of the rocket
//    stays behind and a seat standing on a scanned block pops off as an item. Fix: the click re-checks the structure (the same check
//    GTM runs when a block of the pattern changes), so the scan area is the real one.
// 2. Asymmetric pad. GCYR's pattern lays the pad out mirrored from what it measures and swaps the two sides only for east/west
//    controllers: a pad that sticks out further on one side never forms facing north/south, and forms facing east/west but "Build"
//    then scans the mirrored area and leaves part of the rocket behind. Fix: the click is refused with a message until the pad sticks
//    out the same on both sides (GCYR's own preview is a symmetric 3x3 pad).
//
// Without a player the test calls global.grindless.space.refreshRocketScanner / rocketScannerPadSides.
(function () {
  var MetaMachine = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
  var MultiblockWorldSavedData = Java.loadClass('com.gregtechceu.gtceu.api.pattern.MultiblockWorldSavedData')
  var SCANNER = 'gcyr:rocket_scanner'
  var PAD = 'gcyr:launch_pad'
  var MAX_SIDE = 8
  var STEPS = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }
  var OPPOSITE = { north: 'south', south: 'north', east: 'west', west: 'east' }
  var LEFT = { north: 'west', west: 'south', south: 'east', east: 'north' }

  // re-checks a formed scanner; GTM's own async check already handles the ones that are not formed
  function refreshRocketScanner(level, pos) {
    var machine = MetaMachine.getMachine(level, pos)
    if (machine === null || machine === undefined || !machine.isFormed()) return 'not formed'
    var state = machine.getMultiblockState()
    var saved = MultiblockWorldSavedData.getOrCreate(level)
    saved.removeMapping(state)
    if (machine.checkPatternWithLock()) {
      machine.setFlipped(state.isNeededFlip())
      machine.onStructureFormed()
      saved.addMapping(state)
      return 'refreshed'
    }
    machine.setFlipped(false)
    machine.onStructureInvalid()
    saved.addAsyncLogic(machine)
    return 'invalid'
  }

  // launch pad blocks on each side of the first pad row, measured as GCYR does (from the block behind and below the controller);
  // null when that block is not a launch pad (the structure is not there yet)
  function rocketScannerPadSides(level, x, y, z, facing) {
    var back = STEPS[OPPOSITE[facing]]
    var left = STEPS[LEFT[facing]]
    if (!back || !left) return null
    var x0 = x + back[0]
    var z0 = z + back[1]
    if (String(level.getBlock(x0, y - 1, z0).getId()) !== PAD) return null
    function count(sign) {
      var n = 0
      for (var i = 1; i <= MAX_SIDE; i++) {
        if (String(level.getBlock(x0 + sign * left[0] * i, y - 1, z0 + sign * left[1] * i).getId()) !== PAD) break
        n++
      }
      return n
    }
    return { left: count(1), right: count(-1) }
  }

  var G = global.grindless || (global.grindless = {})
  var SPACE = G.space || (G.space = {})
  SPACE.refreshRocketScanner = refreshRocketScanner
  SPACE.rocketScannerPadSides = rocketScannerPadSides

  BlockEvents.rightClicked(SCANNER, function (event) {
    var refuse = null
    try {
      var block = event.block
      var machine = MetaMachine.getMachine(event.level, block.pos)
      if (machine === null || machine === undefined) return
      var sides = rocketScannerPadSides(event.level, block.x, block.y, block.z, String(machine.getFrontFacing()))
      if (sides !== null && sides.left !== sides.right) {
        refuse = sides
      } else {
        refreshRocketScanner(event.level, block.pos)
      }
    } catch (e) {
      console.error('[grindless space] rocket scanner right-click at ' + event.block.pos + ': ' + e)
    }
    if (refuse !== null) {
      event.player.setStatusMessage(Text.translate('message.grindless.rocket_scanner.asymmetric_pad', String(refuse.left), String(refuse.right)))
      // outside the try: KubeJS's cancel() ends the handler by throwing
      event.cancel()
    }
  })
})()
