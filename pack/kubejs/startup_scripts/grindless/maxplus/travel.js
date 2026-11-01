// priority: -5639
// MAX+ travel (package XP-F1, docs/eras/maxplus.md "Places"): the four tier-14 places beyond the MAX ones, reached by the warp gate.
// c16 (30 Doradus) leaves from Sgr A*'s orbit, c17 (the Magellanic Stream) and c18 (the M31 nucleus) from 30 Doradus, c19 (the
// Local Group filament) from the M31 nucleus. No item, gate row, recipe or grant is written here. The places are data: their
// planet rows are data/grindless/gcyr/planets/*.json and their relay platforms rows of tables/relay_platforms.json.
// Published as global.grindless.maxPlusTravel. The dimension ids are final once shipped.
(function () {
  var G = global.grindless || (global.grindless = {})
  var T = G.maxPlusTravel || (G.maxPlusTravel = {})

  // key -> the place: dimension id (world and orbit are the same), warp gate circuit, the jump row's name and the place's temperature (K)
  T.places = {
    lmc: { dimension: 'grindless:tarantula_orbit', circuit: 16, jump: 'hold_tarantula', temperature: 100, source: 'gcyr:black_hole_orbit' },
    stream: { dimension: 'grindless:magellanic_stream', circuit: 17, jump: 'hold_magellanic_stream', temperature: 100, source: 'grindless:tarantula_orbit' },
    m31: { dimension: 'grindless:m31_nucleus_orbit', circuit: 18, jump: 'hold_m31_nucleus', temperature: 100, source: 'grindless:tarantula_orbit' },
    void: { dimension: 'grindless:local_group_filament', circuit: 19, jump: 'hold_local_group_filament', temperature: 3, source: 'grindless:m31_nucleus_orbit' }
  }
  T.tier = 14
  T.ids = {
    igRelayProbe: 'grindless:ig_relay_probe',
    launchedIgProbe: 'grindless:launched_ig_probe',
    boundProbePair: 'grindless:bound_probe_pair'
  }
})()
