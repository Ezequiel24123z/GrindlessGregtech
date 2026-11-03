// priority: 3090
// Gregtech Grindless - names and tooltips of UIV's PSR J0437-4715 machines (startup_scripts/grindless/uiv/j0437.js; package UIV-B3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe, and of each row the package appends to an older table
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items; material.gtceu.<n> its gases
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.pulsar_wind_trap', 'Pulsar Wind Trap'],
        ['block.gtceu.positronium_condensate_lab', 'Positronium Condensate Lab'],
        ['block.gtceu.xray_pulse_profiler', 'X-ray Pulse Profiler'],
        ['gtceu.pulsar_wind_trapping', 'Pulsar Wind Trapping'],
        ['gtceu.positronium_condensation', 'Positronium Condensation'],
        ['gtceu.xray_pulse_profiling', 'X-ray Pulse Profiling'],
        ['material.gtceu.pair_plasma', 'Pair Plasma'],
        ['material.gtceu.wind_electrons', 'Wind Electrons'],
        ['material.gtceu.neon_6n', '6N Neon'],
        ['material.gtceu.purified_neon', 'Purified Neon'],

        ['grindless.machine.pulsar_wind_trap.tooltip.0',
            '\u00a77Catches the electron-positron wind of a pulsar as pair plasma.'],
        ['grindless.machine.positronium_condensate_lab.tooltip.0',
            '\u00a77Condenses positronium and makes it annihilate in step: a gamma laser core.'],
        ['grindless.machine.xray_pulse_profiler.tooltip.0',
            '\u00a77Folds pulsar X-ray pulses into a timing solution for seed navigation.'],

        ['gtceu.recipe.grindless_pulsar_wind_trapping.pair_plasma',
            'Circuit 1: the coil traps pair plasma; gamma rays heat the lining (voided); the spare electrons are vented back to the wind (nothing uses them).'],
        ['gtceu.recipe.grindless_positronium_condensation.ps_in_aerogel',
            'Circuit 1: moderated positrons form positronium in the pores of the Ps-converter aerogel.'],
        ['gtceu.recipe.grindless_positronium_condensation.laser_cooled_ps',
            'Circuit 2: the 243 nm cooling laser (not consumed) cools the positronium.'],
        ['gtceu.recipe.grindless_positronium_condensation.gamma_laser_cavity',
            'Circuit 3: the Ps BEC between two gamma Bragg mirrors is a gamma-ray laser cavity.'],
        ['gtceu.recipe.grindless_xray_pulse_profiling.j0437_pulse_raw',
            'Circuit 1: the UEV navigation chart (not consumed) points the profiler; four raw J0437 pulse profiles come out.'],
        ['gtceu.recipe.grindless_xray_pulse_profiling.pulsar_navigation_solution',
            'Circuit 2: four timed pulse profiles and the neutron-star EOS chart give the navigation solution.'],
        ['gtceu.recipe.grindless_positron_accumulation.pair_plasma_cooling',
            'Circuit 4, at J0437 only: the Penning trap cools pair plasma into cooled positrons; the 500 mB of electrons are vented to the wind (nothing uses them).'],
        ['gtceu.recipe.grindless_antimatter_storage.ps_bec',
            'Circuit 4, at PSR J0437-4715 only: laser-cooled positronium condenses in a superfluid helium bath into a Ps BEC.'],
        ['gtceu.recipe.grindless_megabar.c12_hpht',
            'Circuit 4: high-pressure, high-temperature annealing heals the C-12 CVD plate. Anvil wear: 10 % per run.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['cooled_positron_bunch', 'Cooled Positron Bunch', 'Positrons cooled in a Penning trap at J0437.', 'Goes into the positronium condensate lab (circuit 1).'],
        ['ps_converter_aerogel', 'Ps-Converter Aerogel', 'Mesoporous silica whose pores stop positrons as positronium.', 'Made in the aerogel works (circuit 1).'],
        ['ps_in_aerogel', 'Positronium in Aerogel', 'Positronium trapped in the pores of the aerogel.', 'Cooled by the 243 nm laser in the positronium lab (circuit 2).'],
        ['laser_cooled_ps', 'Laser-Cooled Positronium', 'Positronium cooled to a few kelvin.', 'Condensed in the antimatter trap (circuit 4).'],
        ['ps_bec', 'Positronium BEC', 'A Bose-Einstein condensate of positronium: a proposal, not yet made.', 'Goes between two gamma mirrors (positronium lab, circuit 3).'],
        ['gamma_laser_cavity', 'Gamma Laser Cavity', 'A Ps BEC between two Bragg mirrors, ready to lase in step.', 'The core of the UIV emitter.'],
        ['c12_hpht_plate', 'HPHT C-12 Plate', 'A C-12 CVD plate annealed under megabar pressure.', 'Cut along the (004) plane.'],
        ['c12_004_plate', '(004) C-12 Blank', 'A thin diamond blank cut along the (004) plane.', 'Ion-milled flat.'],
        ['c12_ion_milled_plate', 'Ion-Milled C-12 Plate', 'A (004) blank milled flat and strain-free.', 'Four make a pair of gamma Bragg mirrors.'],
        ['gamma_bragg_mirror', 'Gamma Bragg Mirror', 'Diamond and tungsten layers that reflect gamma rays.', 'A pair closes the gamma laser cavity.'],
        ['solid_neon_cone', 'Solid Neon Cone', 'Purified neon frozen on a cooled cone.', 'Annealed in the vacuum freezer.'],
        ['annealed_neon_cone', 'Annealed Neon Cone', 'A solid-neon cone without grain boundaries.', 'Sealed into a moderator cartridge.'],
        ['neon_moderator_cartridge', 'Neon Moderator Cartridge', 'A film of solid neon that slows positrons to a stop.', 'Used up in the positronium condensate lab (circuit 1).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
