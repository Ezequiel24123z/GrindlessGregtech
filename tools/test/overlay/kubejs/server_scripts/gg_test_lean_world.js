// priority: -3124
// Test-only (harness overlay). Off unless kubejs/config/gg_test_lean_world.json says {"enabled": true} (see
// startup_scripts/gg_test_lean_world.js): the integrated server's saved world must have structures off.
ServerEvents.loaded(function (event) {
  var marker = JsonIO.read('kubejs/config/gg_test_lean_world.json')
  if (marker === null || String(marker.get('enabled')) !== 'true') return
  try {
    var structures = event.server.getWorldData().worldGenOptions().generateStructures()
    console.info('GGTEST|lean_world|structures|' + (String(structures) === 'false' ? 'PASS' : 'FAIL') +
      '|saved WorldOptions.generateStructures=' + structures + ' (disposable test save only)')
  } catch (err) {
    console.info('GGTEST|lean_world|structures|FAIL|' + err)
  }
})
