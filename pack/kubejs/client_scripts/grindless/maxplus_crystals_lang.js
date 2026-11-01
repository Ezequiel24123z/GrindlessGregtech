// priority: 7018
// Gregtech Grindless - names and tooltips of MAX+'s multi-plasma blender and horizon crystal furnace (startup_scripts/grindless/maxplus/crystals.js;
// package XP-H2):
//
//   gtceu.recipe.grindless_<type>.<recipe>   the EMI line of each keyed row of the package: the blender's and the furnace's rows and the T8, T9
//                                            and T10 steps on machines whose type carries a data key
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. English only.
(function () {
    var T = {
        blender: 'Eight plasmas, 1,000 mB each (stellar, lifted, filtered, very-massive-star, p-process, jet, hot flow) and kerr condensate, blended into 1,000 mB of horizon crystal slurry at V[MAX] x 64 A.',
        core: 'Circuit 1: a sapphire seed plate and condensate-doped dust grown in 4,000,000 mB of slurry, lined with kerr strange plate, at V[MAX] x 256 A (line T9). Kerr condensate carries the heat.',
        controller: 'Circuit 2: a controller seed and condensate-doped dust grown in 1,000,000 mB of slurry, lined with kerr strange plate, at V[MAX] x 256 A (line T10).',
        lifted: 'Circuit 5: stellar plasma lifted out of the star at Cygnus X-1 (line T8).',
        filtered: 'Circuit 8: lifted stellar plasma split by mass at Cygnus X-1 (line T8).',
        seedPlate: 'Circuit 32: sapphire plates grown in a crucible under argon into seed plates (line T9).',
        doped: 'Circuit 6: sapphire dust doped with settled condensate at Sgr A* (line T9).',
        femto: 'Circuit 22: the core crystal boule written with the void crystal lattice under argon (line T9).',
        cryo: 'Circuit 12: the inscribed core crystal cooled to the horizon core crystal in liquid helium (line T9).',
        melter: 'Circuit 25: kerr strange ingots levitation-melted under argon (line T10).',
        seed: 'Circuit 32: a sapphire seed plate grown in molten kerr strange into a controller seed (line T10).',
        beuv: 'Circuit 23: the controller crystal boule patterned into a horizon controller crystal under argon (line T10).'
    }
    // [key, en]
    var ENTRIES = [
        ['gtceu.multi_plasma_blender', 'Multi-Plasma Blender'],
        ['block.gtceu.multi_plasma_blender', 'Multi-Plasma Blender'],
        ['grindless.machine.multi_plasma_blender.tooltip.0', '\u00a77Blends eight plasmas into horizon crystal slurry at Sgr A* orbit.'],
        ['gtceu.horizon_crystal_furnace', 'Horizon Crystal Furnace'],
        ['block.gtceu.horizon_crystal_furnace', 'Horizon Crystal Furnace'],
        ['grindless.machine.horizon_crystal_furnace.tooltip.0', '\u00a77Grows core and controller crystals in slurry at Sgr A* orbit.'],
        ['gtceu.recipe.grindless_multi_plasma_blender.horizon_crystal_slurry', T.blender],
        ['gtceu.recipe.grindless_horizon_crystal_furnace.core_crystal_boule', T.core],
        ['gtceu.recipe.grindless_horizon_crystal_furnace.controller_crystal_boule', T.controller],
        ['gtceu.recipe.grindless_star_lifting.lifted_stellar_plasma', T.lifted],
        ['gtceu.recipe.grindless_plasma_mass_filtering.filtered_stellar_plasma', T.filtered],
        ['gtceu.recipe.grindless_crystal_growth.sapphire_seed_plate', T.seedPlate],
        ['gtceu.recipe.grindless_condensate_refinery.condensate_doped_dust', T.doped],
        ['gtceu.recipe.grindless_femtosecond_writing.inscribed_core_crystal', T.femto],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.horizon_core_crystal', T.cryo],
        ['gtceu.recipe.grindless_levitation_melting.molten_kerr_strange', T.melter],
        ['gtceu.recipe.grindless_crystal_growth.controller_seed', T.seed],
        ['gtceu.recipe.grindless_beuv_lithography.horizon_controller_crystal', T.beuv]
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
