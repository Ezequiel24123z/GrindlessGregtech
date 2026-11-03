// priority: 4550
// Gregtech Grindless - names and tooltips of UHV's gate and edge (startup_scripts/grindless/uhv/gate.js; package UHV-B7):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us. Every item and block these machines use is F1's and already has its name.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.warp_gate', 'Warp Gate'],
        ['gtceu.warp_gate', 'Warp Gate'],
        ['block.gtceu.baseline_astrometer', 'Baseline Astrometer'],
        ['gtceu.baseline_astrometry', 'Baseline Astrometry'],

        ['grindless.machine.warp_gate.tooltip.0',
            '§7A ring gate that carries players between two orbits.'],
        ['grindless.machine.warp_gate.tooltip.1', 'Works in Earth and Proxima b orbit only.'],

        ['grindless.machine.baseline_astrometer.tooltip.0',
            '§7Measures star distances by parallax; makes the neighbourhood chart.'],
        ['grindless.machine.baseline_astrometer.tooltip.1', 'Works in Proxima b orbit only.'],

        ['gtceu.recipe.grindless_warp_gate.open', 'Open the gate: a Proxima gate seed, the cartridge shells back'],
        ['gtceu.recipe.grindless_warp_gate.sustain', 'Hold the gate open for a minute of transit'],
        ['gtceu.recipe.grindless_baseline_astrometry.stellar_neighbourhood_chart', 'Chart the stellar neighbourhood from the baseline'],

        ['emi.grindless.info.warp_gate_casing.0',
            'A structure block: neutronium ring segments around a qualified MgB2 coil that holds the exotic matter field, made in the Assembler (circuit 6, two per coil). It builds the Warp Gate\'s 25x9x20 ring and berm, once in Earth orbit and once in Proxima b\'s orbit.'],

        // AF-1: relay coordinates (a data stick a completed jump gives; lib/relay_platforms.js) and the transit's messages
        ['grindless.relay_coordinates.name', 'Relay Coordinates: %s'],
        ['grindless.relay_coordinates.home', 'the ring that sent the jump'],
        ['grindless.relay_coordinates.rx_j1856', 'RX J1856.5-3754'],
        ['grindless.relay_coordinates.psr_j0437', 'PSR J0437-4715'],
        ['grindless.relay_coordinates.cygnus_x1', 'Cygnus X-1'],
        ['grindless.relay_coordinates.vela_pulsar', 'the Vela Pulsar'],
        ['grindless.relay_coordinates.cas_a', 'Cassiopeia A'],
        ['grindless.relay_coordinates.sgr1806', 'SGR 1806-20'],
        ['grindless.relay_coordinates.terzan5', 'Terzan 5'],
        ['grindless.relay_coordinates.sgra', 'Sagittarius A*'],
        ['grindless.relay_coordinates.nsc', 'the nuclear star cluster belt'],
        ['grindless.relay_coordinates.tarantula', '30 Doradus'],
        ['grindless.relay_coordinates.magellanic_stream', 'the Magellanic Stream'],
        ['grindless.relay_coordinates.m31', 'the M31 nucleus'],
        ['grindless.relay_coordinates.local_group_filament', 'the Local Group filament'],
        ['grindless.warp_gate.waking', 'The relay ring wakes for one hold: one exotic matter cell and the network\'s EU.'],
        ['grindless.warp_gate.no_ring', 'These relay coordinates name no warp gate.']
    ]

    ENTRIES.push(['gtceu.recipe.grindless_warp_gate.hold_sgr1806',
        'Circuit 11, Cygnus X-1: 2^31 EU/t for 2 minutes throws the bulge relay seed to SGR 1806-20; the bulge chart stays in the bus'])
    ENTRIES.push(['gtceu.recipe.grindless_warp_gate.hold_terzan5',
        'Circuit 12, Cygnus X-1: 2^30 EU/t for 2 minutes throws the pathfinder probe to Terzan 5; the probe is the whole cost'])

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
