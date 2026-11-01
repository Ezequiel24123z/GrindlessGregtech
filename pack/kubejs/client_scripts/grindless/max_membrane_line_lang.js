// priority: 6636
// Gregtech Grindless - names and EMI lines of MAX-B1 (the membrane line, machine 3, and its feeder rows on older machines, lines L2, L3, L11 and L34):
//
//   block.gtceu.membrane_line                         the controller's name
//   gtceu.membrane_rolling                            the recipe type
//   grindless.machine.membrane_line.tooltip.0         the controller's tooltip
//   emi.grindless.info.membrane_line.<n>              the info page
//   gtceu.recipe.<dataKey>.<recipe>                   the EMI line of each recipe
//
// Same format as max_components_lang.js. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.membrane_line', 'Membrane Line'],
        ['gtceu.membrane_rolling', 'Membrane Rolling'],
        ['grindless.machine.membrane_line.tooltip.0', '\u00a77Rolls membrane, albedo panel and belt in one line.'],
        ['emi.grindless.info.membrane_line.0', 'The Membrane Line unwinds a web through an 21-block roller train: coating, etching, calendering and winding without a break.'],
        ['emi.grindless.info.membrane_line.1', 'Circuit 1: superconducting membrane. Circuit 2: albedo multilayer panel. Circuit 3: membrane belt. Scrap goes to the macerator for carbon.'],
        ['emi.grindless.info.membrane_roller_casing.0', 'A structure block: a roller wall of the Membrane Line. It builds the 21-block roller train. Made in the assembler.'],
        ['gtceu.recipe.grindless_membrane_rolling.superconducting_membrane', 'Circuit 1: pinned REBCO web and graphene film rolled and etched into the superconducting membrane'],
        ['gtceu.recipe.grindless_membrane_rolling.albedo_multilayer_panel', 'Circuit 2: HfO2/SiO2 stacks and silver foil rolled into the albedo panel'],
        ['gtceu.recipe.grindless_membrane_rolling.membrane_belt', 'Circuit 3: cryo-conditioned web and horizon strand wire wound into the membrane belt'],
        ['gtceu.recipe.grindless_vdw_stacking.graphene_hbn_film', 'Circuit 5: graphene grown on electropolished Cu(111) and capped with hBN flakes'],
        ['gtceu.recipe.grindless_mtj_sputtering.hfo2_sio2_stack', 'Circuit 15: HfO2 and SiO2 sputtered into an alternating stack'],
        ['gtceu.recipe.grindless_coated_conductor.rebco_on_pbo_web', 'Circuit 6: ITBTC coated conductor laid on the buffered PBO web'],
        ['gtceu.recipe.grindless_magnet_winding.pinned_rebco_web', 'Circuit 12: the REBCO web trained and pinned'],
        ['gtceu.recipe.grindless_electron_beam.hafnia_target', 'Circuit 30: hafnia powder fused into a sputtering target'],
        ['gtceu.recipe.grindless_electron_beam.refractory_wear_coat', 'Circuit 31: tungsten carbide fused onto the primed belt web'],
        ['gtceu.recipe.grindless_single_crystal_casting.cu111_foil', 'Circuit 26: rolled copper foil recrystallised into a Cu(111) single crystal']
    ];
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
