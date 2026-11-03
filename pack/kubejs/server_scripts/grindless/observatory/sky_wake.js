// priority: -21425
// -----------------------------------------------------------------------------------------------
// Sky wake of the observatory family (machines: startup_scripts/grindless/observatory/machines.js, recipes: recipes.js).
//
// Why: GTM 7.5.3's RecipeLogic#serverTick drops its tick subscription once a machine is idle with nothing to retry
// (lastRecipe == null, no lastFailedMatches, not recipeDirty). A sky recipe that fails only on its condition (DaytimeCondition,
// RainingCondition, ThunderCondition) gives the machine nothing to notify it when the sky changes, so a ready telescope could sit idle
// for about 300 ticks after nightfall (B14-T2, #230). Fix: when the day / night, rain or thunder state of a level changes, every
// formed, non-working observatory controller in the loaded chunks near a player or force-loaded gets RecipeLogic#updateTickSubscription() and
// markLastRecipeDirty(), so its next search is fresh and it starts within a few ticks. The sky rules themselves are untouched.
//
// Cost: one check per level per second (three method calls); the scan of block entities runs only on a change, and for 5 s after it
// (inputs that arrive in the tick the sky flips can miss the first search), once per second, within 4 chunks of a player.
(function () {
  var LOG = '[grindless/observatory/sky_wake] '
  var IDS = { 'gtceu:steam_observatory': true, 'gtceu:optical_observatory': true, 'gtceu:radio_telescope': true }
  var RADIUS = 4
  var ChunkPos = Java.loadClass('net.minecraft.world.level.ChunkPos')
  var AFTER = 5
  var seen = {}
  var burst = {}
  var failed = false

  function skyKey(level) {
    // the same thresholds as the recipe conditions (rain and thunder level under 0.2)
    return (level.isDay() ? 'd' : 'n') + (level.getRainLevel(1) < 0.2 ? 'c' : 'r') + (level.getThunderLevel(1) < 0.2 ? 'c' : 't')
  }

  function scanChunk(level, cx, cz) {
    var woken = 0
    if (!level.hasChunk(cx, cz)) return 0
    var bes = level.getChunk(cx, cz).getBlockEntities().values().toArray()
    for (var i = 0; i < bes.length; i++) {
      var be = bes[i]
      if (!IDS[String(level.getBlock(be.getBlockPos()).id)]) continue
      var m = be.getMetaMachine()
      if (m == null || !m.isFormed()) continue
      var logic = m.getRecipeLogic()
      if (logic.isWorking()) continue
      logic.markLastRecipeDirty()
      logic.updateTickSubscription()
      woken++
    }
    return woken
  }

  function wake(level, server) {
    var woken = 0
    var done = {}
    function once(cx, cz) {
      var k = cx + ',' + cz
      if (done[k]) return
      done[k] = true
      woken += scanChunk(level, cx, cz)
    }
    server.getPlayers().forEach(function (p) {
      if (p.level !== level) return
      var cx = p.blockPosition().x >> 4
      var cz = p.blockPosition().z >> 4
      for (var dx = -RADIUS; dx <= RADIUS; dx++) {
        for (var dz = -RADIUS; dz <= RADIUS; dz++) once(cx + dx, cz + dz)
      }
    })
    // chunks kept loaded without a player (chunk loaders, /forceload)
    var forced = level.getForcedChunks().toLongArray()
    for (var f = 0; f < forced.length; f++) once(ChunkPos.getX(forced[f]), ChunkPos.getZ(forced[f]))
    return woken
  }

  ServerEvents.tick(function (event) {
    var server = event.server
    if (server.getTickCount() % 20 !== 7) return
    try {
      server.getAllLevels().forEach(function (level) {
        var id = String(level.dimension().location())
        var now = skyKey(level)
        if (seen[id] !== undefined && seen[id] !== now) burst[id] = AFTER
        seen[id] = now
        if (burst[id] > 0) {
          burst[id]--
          var n = wake(level, server)
          if (n > 0) console.info(LOG + n + ' observatory machine(s) woken in ' + id)
        }
      })
    } catch (e) {
      if (!failed) {
        failed = true
        console.error(LOG + 'sky wake failed: ' + e)
      }
    }
  })
})()
