// priority: 6836
// Gregtech Grindless - names and tooltips of MAX+'s meta-material loom (startup_scripts/grindless/maxplus/loom.js; package XP-H1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the loom's four rows, the press's
//                                                      c4 row and the T4 to T7 steps on older machines whose type carries a data key)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var MACHINES = [
        ['block.gtceu.meta_material_loom', 'Meta-Material Loom']
    ]
    var ENTRIES = [
        ['gtceu.meta_material_loom', 'Meta-Material Loom'],
        ['grindless.machine.meta_material_loom.tooltip.0', '\u00a77Weaves bound plates and Kerr strand into horizon meta-materials.'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_shielding', 'Circuit 1: graded laminate and horizon plates woven under Kerr condensate into horizon shielding; the boil-off goes to the refinery (line T4).'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_waveguide', 'Circuit 2: niobium-lined tubes, Kerr strand and Kerr strange plates woven under condensate into a horizon waveguide; the boil-off goes to the refinery (line T5).'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_conduit', 'Circuit 3: cabled conductors, Kerr braid sleeves and horizon plates woven under condensate into a horizon conduit; the boil-off goes to the refinery (line T6).'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_valve_body', 'Circuit 4: calibrated condensate leaks, Kerr strange plates and horizon plates woven under condensate into a horizon valve body; the boil-off goes to the refinery (line T7).'],
        ['gtceu.recipe.grindless_bound_matter_press.graded_horizon_laminate', 'Circuit 4: horizon plates and Gd-HfB2 cermet pressed into graded horizon laminate; the press flash is Kerr condensate for the refinery (line T4).'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_waveguide_tube', 'Circuit 20: SiC tow infiltrated from methyltrichlorosilane and hydrogen into a waveguide tube; the hydrochloric acid goes to its users (line T5).'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_lined_tube', 'Circuit 32: the polished tube lined with niobium sputtered from a target; most of the argon is recovered (line T5).'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cold_horizon_waveguide', 'Circuit 27: the horizon waveguide cooled to millikelvin on a superfluid helium charge that is not consumed (line T5).'],
        ['gtceu.recipe.grindless_coated_conductor.conduit_tape', 'Circuit 12: nickel-tungsten tape and Kerr strand wire coated into conduit tape (line T6).'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.thick_conduit_tape', 'Circuit 9: gadolinium-doped layers laser-deposited on the conduit tape in oxygen; the laser is not consumed (line T6).'],
        ['gtceu.recipe.grindless_magnet_winding.cabled_conductor', 'Circuit 19: thick conduit tape and Kerr strand wound into a cabled conductor on a liquid helium charge that is not consumed (line T6).'],
        ['gtceu.recipe.grindless_closed_loop.cold_horizon_conduit', 'The woven horizon conduit run cold until it holds its critical current (line T6).'],
        ['gtceu.recipe.grindless_shequid_assembly.horizon_valve', 'Circuit 12: the woven valve body fitted and sealed on liquid helium, with the rotation reference not consumed; the boil-off helium is kept (line T7).'],
        ['gtceu.recipe.grindless_shequid_assembly.calibrated_condensate_leak', 'Circuit 9: the condensate superleak plug calibrated against Josephson wafers and a rotation reference on liquid helium; the boil-off helium is kept (line T7).']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
        // the controller's block name (GTM reads block.gtceu.<id>)
        MACHINES.forEach(function (e) {
            event.add('gtceu', e[0], e[1])
        })
    })
})()
