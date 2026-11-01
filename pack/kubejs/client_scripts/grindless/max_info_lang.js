// priority: 6691
// Gregtech Grindless - EMI info pages of two MAX controllers that had none (P8-H1; the process audit's m_info_missing check):
// the horizon flux clamp and the horizon interferometer (kubejs/assets/emi/recipe/additions/grindless/max_<machine>.json). Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['emi.grindless.info.horizon_flux_clamp.0',
            'Winds four HTS flux pumps, eight field coils and four stream bundles into a clamp winding under flux-loaded FRC. The winding holds the magnetic flux of the shell\'s field in place and suppresses its flares; what it suppresses comes out as a reconnection plasmoid.'],
        ['emi.grindless.info.horizon_flux_clamp.1',
            'The plasmoid is not waste: the plasma mass filter sorts it again into filtered hot flow and a heavy cut. The flux pump itself is a four-step line on older machines (coated conductor, pulsed laser deposition, magnet winding, nitride magnet synthesis). Runs only at Sgr A* (black hole orbit).'],

        ['emi.grindless.info.horizon_interferometer.0',
            'Three free-falling test masses at Sgr A* fly a laser triangle: reference sensors, bonded optical benches, stabilised lasers, FEEP thrusters and phasemeter boards read the phase of the cloud around the hole and give the cloud phase map and the final spin map, which are kept.'],
        ['emi.grindless.info.horizon_interferometer.1',
            'Most of the sensors and benches come back and are flown again with one fresh sensor; the thrusters come back as spent crowns that are re-sintered. Circuit 2 calibrates oscillator banks against the phase map. Runs only at Sgr A* orbit.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
