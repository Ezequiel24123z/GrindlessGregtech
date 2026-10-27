// priority: -200
// Test-only (harness overlay, never part of the player pack). Off unless kubejs/config/gg_test_lean_world.json says
// {"enabled": true, "viewers": "absent" | "present"} in a private overlay.
// A lean client world for the integrated client stages: the 4 GB test client ran out of heap when EMI's indexing, YUNG's jigsaw
// structures and a big world loaded together. This turns structures off through the real creation screen before mc-runtime-test
// creates the world (the LuV travel spikes' proven setter, gg_test_luv_s0_memory.js), and checks that the recipe viewers are
// absent or present as the stage expects (-ClientExclude removes them from the copied test instance only, never from pack/).
// server_scripts/gg_test_lean_world.js checks the saved WorldOptions.generateStructures on the integrated server.
;(function () {
  if (!Platform.isClientEnvironment()) return
  var marker = JsonIO.read('kubejs/config/gg_test_lean_world.json')
  if (marker === null || String(marker.get('enabled')) !== 'true') return
  var want = String(marker.get('viewers'))
  var Create = Java.loadClass('net.minecraft.client.gui.screens.worldselection.CreateWorldScreen')
  function emit(name, ok, detail) {
    console.info('GGTEST|lean_world|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  var loaded = { emi: Platform.isLoaded('emi'), jei: Platform.isLoaded('jei'), emi_loot: Platform.isLoaded('emi_loot') }
  var absent = !loaded.emi && !loaded.jei && !loaded.emi_loot
  var present = loaded.emi && loaded.jei
  emit('viewers', want === 'absent' ? absent : (want === 'present' ? present : false),
    'expected ' + want + '; loaded ' + JSON.stringify(loaded))
  ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$Init$Post', function (event) {
    var screen = event.getScreen()
    if (!(screen instanceof Create)) return
    try {
      var ui = screen.getUiState()
      if (String(ui.isGenerateStructures()) !== 'false') ui.setGenerateStructures(false)
      var off = String(ui.isGenerateStructures()) === 'false'
      emit('world_creation', off, 'creation screen generateStructures=' + ui.isGenerateStructures())
    } catch (err) {
      emit('world_creation', false, String(err))
    }
  })
})()
