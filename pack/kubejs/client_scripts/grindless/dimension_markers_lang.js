// priority: 11150
// Gregtech Grindless - EMI-1: names of the dimension markers (startup_scripts/grindless/integration/dimension_markers.js) and the air line
ClientEvents.lang('en_us', event => {
  var names = {
    'grindless.flat': 'Flat',
    'grindless.void': 'Void',
    'grindless.horizon_city': 'Horizon City',
    'gcyr.overworld_orbit': 'Earth Orbit',
    'gcyr.luna_orbit': 'Lunar Orbit',
    'gcyr.mars_orbit': 'Martian Orbit',
    'gcyr.venus_orbit': 'Venus Orbit',
    'gcyr.mercury_orbit': 'Mercury Orbit',
    'grindless.asteroid_belt': 'Asteroid Belt',
    'grindless.asteroid_belt_orbit': 'Asteroid Belt Orbit',
    'grindless.jupiter': 'Jupiter',
    'grindless.jupiter_orbit': 'Jupiter Orbit',
    'grindless.io': 'Io',
    'grindless.io_orbit': 'Io Orbit',
    'grindless.europa': 'Europa',
    'grindless.europa_orbit': 'Europa Orbit',
    'grindless.ganymede': 'Ganymede',
    'grindless.ganymede_orbit': 'Ganymede Orbit',
    'grindless.saturn': 'Saturn',
    'grindless.saturn_orbit': 'Saturn Orbit',
    'grindless.uranus': 'Uranus',
    'grindless.uranus_orbit': 'Uranus Orbit',
    'grindless.neptune': 'Neptune',
    'grindless.neptune_orbit': 'Neptune Orbit',
    'grindless.pluto': 'Pluto',
    'grindless.pluto_orbit': 'Pluto Orbit',
    'gcyr.proxima_centauri_b': 'Proxima b',
    'grindless.proxima_b_orbit': 'Proxima b Orbit',
    'grindless.alpha_centauri_orbit': 'Alpha Centauri Orbit',
    'grindless.barnard_b': 'Barnard b',
    'grindless.barnard_b_orbit': 'Barnard b Orbit',
    'grindless.sirius_b_orbit': 'Sirius B Orbit',
    'grindless.rx_j1856_orbit': 'RX J1856 Orbit',
    'grindless.psr_j0437_orbit': 'PSR J0437 Orbit',
    'grindless.cygnus_x1_orbit': 'Cygnus X-1 Orbit',
    'gcyr.black_hole_orbit': 'Black Hole Orbit',
    'grindless.vela_pulsar_orbit': 'Vela Pulsar Orbit',
    'grindless.cas_a_remnant': 'Cassiopeia A Remnant',
    'grindless.sgr1806_orbit': 'SGR 1806-20 Orbit',
    'grindless.terzan5_core': 'Terzan 5 Core',
    'grindless.nsc_belt': 'Nuclear Star Cluster Belt',
    'grindless.m31_nucleus_orbit': 'Andromeda Nucleus Orbit',
    'grindless.tarantula_orbit': 'Tarantula Nebula Orbit',
    'grindless.magellanic_stream': 'Magellanic Stream',
    'grindless.local_group_filament': 'Local Group Filament'
  }
  Object.keys(names).forEach(function (k) {
    event.add('grindless', 'dimension_marker.' + k, names[k])
  })
  event.add('grindless', 'gtceu.recipe.grindless_needs_air', 'Needs air: Overworld, Nether, End, Flat or Void only.')
})
