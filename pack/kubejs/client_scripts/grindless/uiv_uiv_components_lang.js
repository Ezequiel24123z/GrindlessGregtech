// priority: 2953
// Gregtech Grindless - names and tooltips of the items of UIV's pump, robot arm and motor lines (startup_scripts/grindless/uiv/uiv_components.js;
// package UIV-A8):
//
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of its rows in data-keyed types (melter c6-c8, magnet works c5,
//                                                      coated conductor c3, megabar c3, nitride magnet synthesis c6)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [name, en, tooltip 0 en, tooltip 1 en]
    var ITEMS = [
        ['rhea_am_powder', 'RHEA Powder', 'Gas-atomised refractory high-entropy alloy powder.', 'Printed into the pump impeller; the spent bed goes back to the levitation melter.'],
        ['near_net_rhea_impeller', 'Near-Net RHEA Impeller', 'A printed impeller with its blades, still porous.', 'The powder bed printer\'s press closes its pores.'],
        ['printed_rhea_impeller', 'Printed RHEA Impeller', 'A pressed impeller, near its final density.', 'Goes to the megabar press for its last densification.'],
        ['dense_rhea_impeller', 'Dense RHEA Impeller', 'A fully dense impeller with a fine grain.', 'Machined to size on a lathe.'],
        ['machined_rhea_impeller', 'Machined RHEA Impeller', 'An impeller cut to its final blade profile.', 'Needs balancing before it spins.'],
        ['balanced_rhea_impeller', 'Balanced RHEA Impeller', 'An impeller trimmed with tungsten weights.', 'The heart of the UIV electric pump.'],
        ['rhea_swarf', 'RHEA Swarf', 'Chips from machining the impeller.', 'Back to the levitation melter.'],
        ['zirconium_sponge', 'Zirconium Sponge', 'The Kroll cake: zirconium sponge with its magnesium chloride.', 'Vacuum distillation frees the metal.'],
        ['bmg_blank', 'BMG Blank', 'A suction-cast cup of bulk metallic glass.', 'Machined into a flexspline.'],
        ['bmg_gate', 'BMG Gate', 'The casting gate left on the blank.', 'Back to the levitation melter.'],
        ['bmg_flexspline', 'BMG Flexspline', 'A thin glassy cup that flexes without wear.', 'The heart of the strain-wave gear.'],
        ['strain_wave_gear', 'Strain-Wave Gear', 'A zero-backlash harmonic drive.', 'Three go into a UIV robot arm.'],
        ['ba_cu_blend', 'Barium-Copper Blend', 'Barium and copper mixed in the Gd-123 ratio.', 'Fired with gadolinium oxide in oxygen.'],
        ['bulk_gdbco', 'Bulk GdBCO', 'A single-domain superconducting block grown from a seed.', 'Oxygenate it before use.'],
        ['oxygenated_gdbco', 'Oxygenated GdBCO', 'A block annealed in oxygen so it superconducts.', 'Impregnate it against cracking.'],
        ['impregnated_gdbco', 'Impregnated GdBCO', 'A block filled with epoxy against cracking.', 'Field-cooled to trap its field.'],
        ['field_cooled_gdbco', 'Field-Cooled GdBCO', 'A superconducting block that traps a strong field.', 'The rotor magnet of the UIV electric motor.']
    ]

    // the EMI lines of the package's rows in data-keyed types (its own melter rows and the older tables' rows)
    var ENTRIES = [
        ['gtceu.recipe.grindless_levitation_melting.rhea_swarf_remelt', 'Remelts impeller swarf into RHEA ingots; the oxide skin goes to the cascade as dross.'],
        ['gtceu.recipe.grindless_levitation_melting.rhea_powder_remelt', 'Remelts the spent powder bed into RHEA ingots.'],
        ['gtceu.recipe.grindless_levitation_melting.bmg_gate_remelt', 'Remelts casting gates into metallic glass; the beryllium fume is captured as BeO.'],
        ['gtceu.recipe.grindless_magnet_winding.seeded_gdbco_growth', 'Circuit 5: a single-domain bulk GdBCO grown from a neodymium seed in the helium charge'],
        ['gtceu.recipe.grindless_coated_conductor.gd_123_precursor', 'Step 3: gadolinium oxide and the barium-copper blend fired in oxygen to the Gd-123 phase'],
        ['gtceu.recipe.grindless_megabar.rhea_impeller_hip', 'Hot isostatic pressing closes the printed impeller\'s last pores. Anvil wear: 10 % per run.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.gdbco_field_cool', 'Cools the impregnated GdBCO in liquid helium inside a field so it traps that field.']
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
