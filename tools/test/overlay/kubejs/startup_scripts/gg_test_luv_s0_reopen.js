// TEST ONLY. One real Save/Quit -> same-save open in the existing client JVM.
// Dormant unless the flight owner's ConcurrentHashMap has hold=true and a
// nonempty s0sReopenPending. Never starts a test, clears pending, releases hold,
// changes sound options, or calls the server's ggLuvS0Stations.resume.
//
// Owner: preserve this map across server-script reloads; publish the driver's
// plain JSON s0sReopenSnapshot; suppress normal loggedIn auto-start; rebind fresh
// server/player/tick/rocket context on login, then resume(ctx, pendingToken).
// Observe s0sReopenError even while the integrated server is absent.
//
// Public Mojmap 1.20.1 contracts verified at https://mappings.dev/1.20.1/:
// Minecraft#getSingleplayerServer(), #getLevelSource(), #createWorldOpenFlows(),
// #clearLevel(Screen); MinecraftServer#getWorldPath(LevelResource.ROOT);
// LevelStorageSource#getBaseDir(), #levelExists(String);
// PauseScreen(boolean), Screen#children(), Button#onPress();
// WorldOpenFlows#loadLevel(Screen, String). WorldListEntry's normal loadWorld
// uses that last public API with its summary's folder id (not its display name).
// PauseScreen#onDisconnect is PRIVATE: use its widget, never invoke it.
// KubeJS's proven Client.setCurrentScreen is the screen-setting bridge.
//
// The normal open flow may show BackupConfirmScreen for experimental worldgen.
// Only its recognized experimental prompt's real "Proceed without backup"
// widget is allowed here, once; no recovery/safe-mode or arbitrary confirmation.
// One 45 s wall-clock deadline includes snapshot publication, closing and open.
// Vanilla clearLevel/loadLevel can block the client thread; check the deadline
// around them and on reentrant ticks, but do not interrupt vanilla save IO.
//
// mc-runtime-test 1.20.1-5.0.1 MixinMinecraft.tickHook runs at tick HEAD, before
// Forge END. Its auto-create latches are initialized once per Minecraft instance,
// set by the initial harness-created world and NEVER reset by clearLevel. Keep
// that same client, including across the distinct worldless tick. With no player
// or level the hook cannot auto-exit; native Pause/Title/loading/backup screens
// protect the transition ticks. Refuse CLOSE_ANY_SCREEN and RUN_GAME_TESTS:
// those public final controls would defeat this fixture's existing client hold.
// No private latch access, reflection, system-property mutation or new client.
;(function () {
  if (!Platform.isClientEnvironment()) return
  var bridge = null
  var state = null
  var J = null
  var busy = false
  var MAX_MS = 45000

  function value(key) {
    var v = bridge.get(key)
    return v === null || v === undefined ? '' : String(v)
  }
  function absent(v) { return v === null || v === undefined }
  function need(ok, message) { if (!ok) throw new Error(message) }
  function note(message) {
    console.info('GGTEST|luv_s0_reopen|lifecycle|NOTE|' + message)
  }
  function fail(error) {
    if (state.done) return
    state.done = true // Terminal, even if the token remains published.
    var detail = state.token + ' (' + state.phase + '): ' +
      String(error).replace(/[\r\n|]+/g, '/')
    bridge.put('s0sReopenError', detail)
    console.error('GGTEST|luv_s0_reopen|lifecycle|FAIL|' + detail)
  }
  function java() {
    if (J !== null) return J
    J = {
      Pause: Java.loadClass('net.minecraft.client.gui.screens.PauseScreen'),
      Button: Java.loadClass('net.minecraft.client.gui.components.Button'),
      Backup: Java.loadClass('net.minecraft.client.gui.screens.BackupConfirmScreen'),
      Dirt: Java.loadClass('net.minecraft.client.gui.screens.GenericDirtMessageScreen'),
      Title: Java.loadClass('net.minecraft.client.gui.screens.TitleScreen'),
      Component: Java.loadClass('net.minecraft.network.chat.Component'),
      LevelResource: Java.loadClass('net.minecraft.world.level.storage.LevelResource'),
      RuntimeTest: Java.loadClass('me.earth.mc_runtime_test.McRuntimeTest')
    }
    return J
  }
  function text(key) { return String(java().Component.translatable(key).getString()) }
  function button(screen, key) {
    var kids = screen.children()
    var found = null
    for (var i = 0; i < kids.size(); i++) {
      var widget = kids.get(i)
      if (!(widget instanceof java().Button) || String(widget.getMessage().getString()) !== text(key)) continue
      need(found === null, 'ambiguous native widget for ' + key)
      found = widget
    }
    if (found === null || String(found.active) !== 'true' || String(found.visible) !== 'true') return null
    return found
  }
  function root(server) {
    return server.getWorldPath(java().LevelResource.ROOT).toAbsolutePath().normalize()
  }
  function worldless(mc) {
    return absent(mc.player) && absent(mc.level) && absent(mc.getSingleplayerServer())
  }
  function captureAndQuit(mc, snapshot) {
    var server = mc.getSingleplayerServer()
    need(!absent(mc.player) && !absent(mc.level) && !absent(server) &&
      String(mc.isLocalServer()) === 'true', 'not a loaded integrated-client save')
    need(String(server.isPublished()) === 'false', 'refusing a LAN-published save')
    need(String(java().RuntimeTest.RUN_GAME_TESTS) === 'false' &&
      String(java().RuntimeTest.CLOSE_ANY_SCREEN) === 'false',
    'runtime-test HEAD hook is incompatible with the existing client hold')
    state.clientIdentity = String(mc.hashCode())
    var save = root(server)
    var base = mc.getLevelSource().getBaseDir().toAbsolutePath().normalize()
    need(save.getParent() !== null && save.getParent().equals(base),
      'current save is not one direct folder in the native level source')
    need(String(save) === String(snapshot.saveRoot), 'snapshot is not for the current save')
    state.saveRoot = String(save)
    state.base = String(base)
    state.folder = String(save.getFileName())
    state.serverIdentity = String(server.hashCode())
    state.playerUuid = String(mc.player.getStringUuid()) // Identity only; never logged.
    need(state.folder !== '' && String(mc.getLevelSource().levelExists(state.folder)) === 'true',
      'current save folder does not exist')
    // All identities above are captured BEFORE any disconnect. Retain no world,
    // server or player handle in the startup state or shared map.
    state.phase = 'closing'
    var pause = new (java().Pause)(true)
    mc.setCurrentScreen(pause)
    need(mc.currentScreen === pause, 'native PauseScreen did not open')
    var quit = button(pause, 'menu.returnToMenu')
    if (quit !== null) {
      note('pressing the native integrated Save and Quit widget')
      quit.onPress()
    } else {
      // Exact integrated branch of PauseScreen.onDisconnect, without accessing
      // its private method/field. No fallback after a failed onPress.
      note('no viable quit widget; using the normal integrated clearLevel flow')
      mc.level.disconnect()
      mc.clearLevel(new (java().Dirt)(java().Component.translatable('menu.savingLevel')))
      mc.setCurrentScreen(new (java().Title)())
    }
  }
  function advance(mc) {
    if (state.clientIdentity !== undefined) {
      need(String(mc.hashCode()) === state.clientIdentity,
        'Minecraft instance changed; runtime-test auto-create latches cannot be reused')
    }
    if (state.phase !== 'opening') {
      need(value('s0sReopenPending') === state.token && value('hold') === 'true',
        'owner withdrew/changed the pending request or hold before opening')
    } else {
      // The server owns pending/hold and may finish its resume before the
      // client's first loaded-world tick. An empty token is not a new request.
      need(value('s0sReopenPending') === '' || value('s0sReopenPending') === state.token,
        'owner replaced the token during opening')
    }
    need(value('s0sReopenError') === '', 'owner/client already reported a reopen error')
    if (state.phase === 'snapshot') {
      var raw = value('s0sReopenSnapshot')
      if (raw === '') return // Pending may be published just before the JSON put.
      var snapshot = JSON.parse(raw)
      need(snapshot !== null && String(snapshot.reopenToken) === state.token,
        'snapshot token is missing or mismatched')
      need(isFinite(Number(snapshot.atMs)), 'snapshot has no original reopen deadline')
      state.since = Math.min(state.since, Number(snapshot.atMs))
      need(Date.now() - state.since < MAX_MS, '45 s reopen deadline expired before disconnect')
      captureAndQuit(mc, snapshot)
      return
    }
    if (state.phase === 'closing') {
      if (!worldless(mc)) return
      // This marker is written ONLY by a worldless Forge tick after the actual
      // disconnect returns; never inferred from a screen or a logout event.
      bridge.put('s0sReopenClosed', state.token)
      state.phase = 'closed'
      note('observed player, client level and integrated server all absent')
      return // Leave a distinct worldless tick before the one native open.
    }
    if (state.phase === 'closed') {
      need(worldless(mc), 'a world appeared before the requested native open')
      var storage = mc.getLevelSource()
      need(String(storage.getBaseDir().toAbsolutePath().normalize()) === state.base &&
        String(storage.levelExists(state.folder)) === 'true',
      'captured save folder is no longer available in the same level source')
      state.phase = 'opening' // Latch BEFORE native calls can pump client ticks.
      note('opening the captured folder through the native world-entry load API')
      mc.setCurrentScreen(new (java().Dirt)(java().Component.translatable('selectWorld.data_read')))
      mc.createWorldOpenFlows().loadLevel(new (java().Title)(), state.folder)
      return
    }
    if (state.phase === 'opening') {
      var server = mc.getSingleplayerServer()
      if (!absent(server)) {
        need(String(root(server)) === state.saveRoot, 'native open selected a different save')
        need(String(server.hashCode()) !== state.serverIdentity, 'old integrated server was reused')
      }
      if (!absent(mc.player) && !absent(mc.level) && !absent(server)) {
        need(String(mc.player.getStringUuid()) === state.playerUuid, 'reopened a different player')
        need(Date.now() - state.since < MAX_MS, '45 s same-save lifecycle deadline exceeded before client handback')
        state.done = true
        note('same-save client reopened in ' + (Date.now() - state.since) +
          ' ms; station resume/verification belongs to the server owner')
        return
      }
      var screen = mc.currentScreen
      if (!absent(screen) && screen instanceof java().Backup) {
        need(String(screen.getTitle().getString()) === text('selectWorld.backupQuestion.experimental'),
          'refusing a non-experimental backup/upgrade prompt')
        if (state.backupClicked) return
        need(value('hold') === 'true' && value('s0sReopenPending') === state.token,
          'owner withdrew the request before the experimental prompt')
        var skip = button(screen, 'selectWorld.backupJoinSkipButton')
        need(skip !== null, 'experimental prompt has no viable native skip-backup widget')
        state.backupClicked = true
        note('pressing the disposable save experimental prompt without backup/cache erasure')
        skip.onPress()
      }
    }
  }
  ForgeEvents.onEvent('net.minecraftforge.event.TickEvent$ClientTickEvent', function (event) {
    if (String(event.phase) !== 'END' || (state !== null && state.done)) return
    if (state === null) {
      var map = global.ggGcyrFlight
      if (absent(map) || String(map.get('hold')) !== 'true') return
      var pending = map.get('s0sReopenPending')
      if (absent(pending) || String(pending) === '') return
      bridge = map
      state = { token: String(pending), since: Date.now(), phase: 'snapshot',
        done: false, backupClicked: false }
    }
    try {
      // A synchronous vanilla operation may pump another Forge tick. The
      // deadline still applies there, but never issue a second lifecycle action.
      need(Date.now() - state.since < MAX_MS, '45 s same-save lifecycle deadline exceeded; no retry')
      if (busy) return
      busy = true
      try { advance(Client) } finally { busy = false }
      need(state.done || Date.now() - state.since < MAX_MS,
        '45 s same-save lifecycle deadline exceeded inside vanilla IO; no retry')
    } catch (error) {
      fail(error)
    }
  })
})()
