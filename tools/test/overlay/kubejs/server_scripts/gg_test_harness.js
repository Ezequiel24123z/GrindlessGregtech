// GG test harness (TEST-ONLY overlay: copied over the instance on the test PC, never shipped in the pack).
// Markers are parsed by tools/test/Invoke-GGTest.ps1: any log line containing "GGTEST|" is reported.
ServerEvents.loaded(event => {
  console.info('GGTEST|READY')
})

// Triggered through RCON: kubejs custom_command gg_ping
ServerEvents.customCommand('gg_ping', event => {
  console.info('GGTEST|PING|PASS')
  return 1
})
