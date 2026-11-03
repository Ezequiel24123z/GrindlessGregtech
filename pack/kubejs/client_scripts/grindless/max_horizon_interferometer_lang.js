// priority: 6732
// Gregtech Grindless - names and tooltips of MAX's horizon interferometer (startup_scripts/grindless/max/horizon_interferometer.js; package MX-S1):
//
//   gtceu.<type>                                       the recipe type name (the machine's own name is F1's, max_foundation_lang.js)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type and of its older rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.horizon_interferometry', 'Horizon Interferometry'],

        ['grindless.machine.horizon_interferometer.tooltip.0',
            '\u00a77Three free-falling test masses at Sgr A*: the cloud phase map.'],

        ['gtceu.recipe.grindless_horizon_interferometry.cloud_phase_map', 'Circuit 1: three sensors, three optical benches, three lasers, twelve FEEP thrusters and two phasemeter boards fly the triangle; the spin map is kept. Most parts return.'],
        ['gtceu.recipe.grindless_horizon_interferometry.calibrated_oscillator_bank', 'Circuit 2: four phase-lock oscillator banks are calibrated against the cloud phase map (kept).'],
        ['gtceu.recipe.grindless_horizon_interferometry.cloud_phase_map_reuse', 'Circuit 3: the used sensors and optical benches are flown again with one fresh sensor; the final spin map is kept. Nothing is returned.'],

        ['gtceu.recipe.grindless_zone_refining.six_n_indium', 'Circuit 15: indium sulfate is reduced in hydrogen and zone-refined to 6N indium; the sulfuric acid comes back.'],
        ['gtceu.recipe.grindless_zone_refining.fz_silicon_rod', 'Circuit 16: silicon dust is float-zoned under argon into a rod.'],
        ['gtceu.recipe.grindless_crystal_growth.nd_yag_boule', 'Circuit 32: Nd:YAG is pulled from yttrium, aluminium and neodymium in an iridium crucible (31 % wear).'],
        ['gtceu.recipe.grindless_electron_beam.porous_tungsten_crown', 'Circuit 31: tungsten powder is sintered under the beam into the porous tungsten crown of a FEEP emitter; most of the argon purge is recovered.'],
        ['gtceu.recipe.grindless_electron_beam.spent_feep_crown_resinter', 'Circuit 32: four spent FEEP crowns are re-sintered into three porous crowns; the indium they carried left as thrust.'],
        ['gtceu.recipe.grindless_levitation_melting.au_pt_ingot', 'Circuit 22: gold is melted with platinum sponge under helium into the Au-Pt ingot of the test masses; the oxide skin leaves as dross.'],
        ['gtceu.recipe.grindless_mtj_sputtering.coated_test_mass', 'Circuit 24: gold is sputtered onto the lathe-turned Au-Pt test mass, its low-loss coat; most of the argon is recovered.'],
        ['gtceu.recipe.grindless_mtj_sputtering.coated_bench_optics', 'Circuit 25: gold is sputtered onto the zero-expansion baseplate, the coated bench optics; most of the argon is recovered.'],
        ['gtceu.recipe.grindless_beuv_lithography.rad_hard_fpga_wafer', 'Circuit 15: the SIMOX SOI wafer is exposed with the FPGA pattern; the fouled mirror goes to circuit 3.'],
        ['gtceu.recipe.grindless_photonic_foundry.bonded_optical_bench', 'Circuit 25: the hydroxide-bonded bench gets its gold-foil reference traces and is packaged into the bonded optical bench.'],
        ['gtceu.recipe.grindless_photonic_foundry.stabilised_npro_laser', 'Circuit 26: the NPRO crystal, the 808 nm pump bar and the ytterbium fibre are packaged into the stabilised NPRO laser.'],

        ['emi.grindless.info.test_mass_enclosure_casing.0', 'A structure block: a test mass station of the Horizon Interferometer. Made in the assembler.'],
        ['emi.grindless.info.laser_link_casing.0', 'A structure block: a laser link arm of the Horizon Interferometer. Made in the assembler.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
