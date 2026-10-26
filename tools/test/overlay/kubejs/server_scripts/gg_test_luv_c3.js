// Test-only (harness overlay). LuV's integrated run (C3): `kubejs custom_command gg_test_luv_c3_require`, sent BEFORE the
// fixtures it affects, turns their optional stages into required ones now that every package they wait for has landed:
//   global.ggTestLuvIoSurfaceRequireIo         gg_test_luv_io_surface: B1's Io must exist (a missing Io stage fails)
//   global.ggTestLuvOrbitalSolarRequireWireless gg_test_luv_orbital_solar: A4's wireless stage must run (missing proof fails)
// Booleans, not numbers: KubeJS's `global` is a Java HashMap and the fixtures read these with `=== true`.
ServerEvents.customCommand('gg_test_luv_c3_require', function (event) {
  global.ggTestLuvIoSurfaceRequireIo = true
  global.ggTestLuvOrbitalSolarRequireWireless = true
  var ok = global.ggTestLuvIoSurfaceRequireIo === true && global.ggTestLuvOrbitalSolarRequireWireless === true
  console.info('GGTEST|luv_c3|require|' + (ok ? 'PASS' : 'FAIL') + '|requireIo=' + global.ggTestLuvIoSurfaceRequireIo +
    ', requireWireless=' + global.ggTestLuvOrbitalSolarRequireWireless)
  return 1
})
