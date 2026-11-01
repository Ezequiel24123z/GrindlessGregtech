// priority: 7020
// Gregtech Grindless - names and tooltips of MAX+'s condensate machines (startup_scripts/grindless/maxplus/condensate.js; package XP-A1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the two machines' own rows and the
//                                                      P1 to P5 steps on older machines)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var MACHINES = [
        ['block.gtceu.condensate_refinery', 'Condensate Refinery'],
        ['block.gtceu.bound_matter_press', 'Bound-Matter Press']
    ]
    var ENTRIES = [
        ['gtceu.condensate_refinery', 'Condensate Refinery'],
        ['gtceu.bound_matter_press', 'Bound-Matter Press'],
        ['grindless.machine.condensate_refinery.tooltip.0', '\u00a77Settles Kerr condensate and binds exotic matter into it.'],
        ['grindless.machine.bound_matter_press.tooltip.0', '\u00a77Presses condensate-bound ingots into plates.'],
        ['gtceu.recipe.grindless_condensate_refinery.settle', 'Circuit 1: the tapped Kerr condensate settles into a stable liquid; the boil-off it sheds is kept (line P1).'],
        ['gtceu.recipe.grindless_condensate_refinery.recompress_boil_off', 'Circuit 10: the boil-off of the other rows is recompressed into Kerr condensate and goes back to circuit 1; nothing is vented.'],
        ['gtceu.recipe.grindless_condensate_refinery.neutronium_bind', 'Circuit 2: compressed neutronium cores are bound into the settled condensate as bound neutronium ingots (line P2).'],
        ['gtceu.recipe.grindless_condensate_refinery.strange_bind', 'Circuit 3: strange alloy charges are bound into the settled condensate as Kerr strange ingots (line P3).'],
        ['gtceu.recipe.grindless_condensate_refinery.strand_cladding', 'Circuit 4: MAX horizon strand wire is clad in settled condensate into Kerr clad strand (line P4).'],
        ['gtceu.recipe.grindless_condensate_refinery.degenerate_bind', 'Circuit 5: degenerate compacts are bound into the settled condensate as bound degenerate powder (line P5).'],
        ['gtceu.recipe.grindless_bound_matter_press.bound_neutronium_plate', 'Circuit 1: bound neutronium ingots are pressed into horizon compressed plates; the press flash is Kerr condensate for the refinery (line P2).'],
        ['gtceu.recipe.grindless_bound_matter_press.strange_plate', 'Circuit 2: Kerr strange ingots are pressed into Kerr strange plates; the press flash is Kerr condensate for the refinery (line P3).'],
        ['gtceu.recipe.grindless_megabar.neutronium_core_press', 'Circuit 12: neutronium pellets pressed under the anvil into compressed neutronium cores (line P2).'],
        ['gtceu.recipe.grindless_megabar.degenerate_compact_press', 'Circuit 13: degenerate matter slugs pressed under the anvil into degenerate compacts (line P5).'],
        ['gtceu.recipe.grindless_levitation_melting.strange_alloy_charge', 'Circuit 23: fed strangelets melted with tungsten under helium into strange alloy charges; the oxide skin leaves as dross (line P3).'],
        ['gtceu.recipe.grindless_pasta_drawing.kerr_strand_drawing', 'Circuit 8: Kerr clad strand drawn into Kerr strand wire (line P4).'],
        ['gtceu.recipe.grindless_mtj_sputtering.insulated_kerr_wire', 'Circuit 27: an oxide interlayer sputtered over the Kerr strand wire as its insulation; most of the argon is recovered (line P4).'],
        ['gtceu.recipe.grindless_black_hole_bomb.condensate_tap', 'Circuit 4: a seed wave packet taps the stationary cloud while the horizon lock is held (never consumed); a horizon phase lock wears 1 time in 32. Gives 16,000 mB of Kerr condensate (line P1).']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
        // the controllers' block names (GTM reads block.gtceu.<id>)
        MACHINES.forEach(function (e) {
            event.add('gtceu', e[0], e[1])
        })
    })
})()
