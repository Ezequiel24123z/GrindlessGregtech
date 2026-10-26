// priority: 898
// GCYR stations and the Io-orbit slot (docs/eras/luv.md, decisions 3 and 17; packages B1 and B7), from tables/stations.json. Runs after
// lib/orbits.js (priority 899): the station orbits must be in its table.
//
//   global.grindless.stations = { enabled, first, second, plot, pieces, b7, switches }
//     b7        'tether'         enabled and second is Io orbit: the flux-tube tether in Io orbit (luv/io_orbit.js, section 16)
//               'sulfur_iodine'  second is null (a second station failed spike S0-3, or no station passed): the Io sulfur-iodine plant
//               'pending'        stations are still off and second is set: S0-3 has not concluded, neither machine is registered
//     switches  { stations, tether, sulfur_iodine }: booleans, the names a hidden-table group's `unless` may use (integration/hidden.js)
//
// The table is the only switch: luv/io_orbit.js registers the machine of the active mode, its recipes follow it and the tether spool's
// hiding follows `tether`. Startup and server read the same file, so client and server agree.
(function () {
  var G = global.grindless
  var LOG = '[grindless/stations] '
  var IO_ORBIT = 'grindless:io_orbit'
  var table = G.readJsonTable('kubejs/data/grindless/tables/stations.json')
  if (!table || typeof table.enabled !== 'boolean' || typeof table.first !== 'string') throw new Error(LOG + 'invalid stations table')
  var orbits = G.orbits ? G.orbits.dimensions : []
  if (orbits.indexOf(table.first) < 0) throw new Error(LOG + 'first is not an orbit of tables/orbits.json: ' + table.first)
  var second = table.second === undefined ? null : table.second
  if (second !== null && (typeof second !== 'string' || orbits.indexOf(second) < 0 || second === table.first)) {
    throw new Error(LOG + 'second must be null or another orbit of tables/orbits.json: ' + second)
  }
  // the slot's second station is Io orbit's (decisions 3 and 17): the tether, its tooltips and its quests are written for it
  if (second !== null && second !== IO_ORBIT) throw new Error(LOG + 'second must be null or ' + IO_ORBIT + ': ' + second)
  var b7 = second === null ? 'sulfur_iodine' : table.enabled ? 'tether' : 'pending'
  G.stations = {
    enabled: table.enabled,
    first: table.first,
    second: second,
    plot: table.plot,
    pieces: table.pieces || [],
    b7: b7,
    switches: { stations: table.enabled === true, tether: b7 === 'tether', sulfur_iodine: b7 === 'sulfur_iodine' }
  }
  console.info(LOG + 'stations ' + (table.enabled ? 'on' : 'off') + '; Io-orbit slot (B7): ' + b7)
})()
