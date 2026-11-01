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
            'A structure block: a neutronium ring segment wound with MgB2 wire to hold the exotic matter field, made in the Assembler (circuit 6). It builds the Warp Gate\'s 15x15x3 ring, once in Earth orbit and once in Proxima b\'s orbit.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
