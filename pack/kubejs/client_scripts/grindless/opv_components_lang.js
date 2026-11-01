// priority: 5794
// Gregtech Grindless - names and tooltips of the OpV components' intermediates (startup_scripts/grindless/opv/components.js) and the EMI
// lines of the rows OpV-A1 adds to older machines:
//
//   grindless:<item>                    item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   grindless:<material> (GT material)  material.grindless.<n>
//   gtceu.recipe.<dataKey>.<row>        the EMI line of each new row of a custom machine
//
// The gtceu:opv_* component names are GTM's own. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
// Names go in en_us.
(function () {
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['chain_sic_preform', 'Chain SiC Preform', 'SiC fibre wound around chain strand wire, not yet densified.', 'Densified in the CVI furnace.'],
        ['densified_chain_preform', 'Densified Chain Preform', 'The chain preform with its pores filled with SiC from methyltrichlorosilane.', 'Sintered into chain composite rods and rotors.'],
        ['superleak_plug', 'Superleak Plug', 'Silica aerogel that lets only the superfluid through.', 'The heart of the superfluid He-3 seal.'],
        ['welded_mesh_belt', 'Welded Mesh Belt', 'The chain mesh weave with its edges welded by electron beam.', 'Accepted at 4 K in the helium refrigerator.'],
        ['pbo_belt_trim', 'PBO Belt Trim', 'The PBO selvedge cut off the welded belt.', 'Dissolved back into PBO dope in the PBO plant.'],
        ['chain_flexspline_cup', 'Chain Flexspline Cup', 'Gum metal and chain lamina pressed into a thin-walled cup at megabar pressure.', 'Its teeth are written by the femtosecond laser.'],
        ['toothed_flexspline_cup', 'Toothed Flexspline Cup', 'The flexspline with its teeth cut by femtosecond pulses, no heat-affected zone.', 'Sintered into the OpV harmonic drive.'],
        ['gum_metal_swarf', 'Gum Metal Swarf', 'The gum metal ablated from the flexspline teeth.', 'Atomised back to gum metal blend.'],
        ['rebco_pancake', 'REBCO Pancake', 'Coated conductor tape wound into a flat double pancake with chain wire terminals.', 'Potted in epoxy in the CVI furnace.'],
        ['potted_rebco_pancake', 'Potted REBCO Pancake', 'The pancake vacuum-impregnated with epoxy so no turn can move.', 'Trained to full current in the HTS magnet works.'],
        ['trained_rebco_pancake', 'Trained REBCO Pancake', 'The pancake ramped through its quenches until it holds full current.', 'Assembled into the chain field coil.'],
        ['thorium_229_nitrate', 'Thorium-229 Nitrate', 'Th-229 dissolved in nitric acid behind the hot cell glass.', 'Fluorinated into laser-grade ThF4.'],
        ['laser_grade_thf4', 'Laser-Grade ThF4', 'Thorium-229 tetrafluoride with no oxygen and no water.', 'The dopant of the lasing CaF2 boule.'],
        ['th_caf2_lasing_boule', 'Th:CaF2 Lasing Boule', 'Calcium fluoride grown with thorium-229 in its lattice.', 'Coated against the VUV in the MOCVD reactor.'],
        ['coated_th_caf2_crystal', 'Coated Th:CaF2 Crystal', 'The boule faces coated with VUV-transparent MgF2.', 'Checked for lasing in the nuclear clock.'],
        ['thirteen_n_germanium', '13N Germanium', 'Germanium zone-refined to one impurity in ten trillion.', 'Pulled into a high-purity germanium boule.'],
        ['hpge_compton_boule', 'HPGe Compton Boule', 'A high-purity germanium crystal pulled under argon.', 'Given boron contacts in the ion implanter.'],
        ['contacted_hpge_crystal', 'Contacted HPGe Crystal', 'The germanium crystal with implanted boron contacts.', 'Tested at 77 K in the helium refrigerator.']
    ]

    // kind, id, name
    var NAMES = [
        ['gmaterial', 'liquid_helium_3', 'Liquid Helium-3'],
        ['gmaterial', 'pure_germanium_tetrachloride', 'Pure Germanium Tetrachloride']
    ]

    var PREFIX = { material: 'material.gtceu.', gmaterial: 'material.grindless.' }

    // key, text
    var RECIPES = [
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.chain_preform_densify', 'Circuit 6: the chain SiC preform densified from methyltrichlorosilane; the HCl goes back to stock'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.superfluid_he3', 'Circuit 4: liquid helium-3 cooled below 1 mK into the superfluid'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.superleak_plug', 'Circuit 5: an aerogel plug qualified on the He-3/He-4 mixture; the helium-4 superflows through and goes to the helium refrigerator'],
        ['gtceu.recipe.grindless_electron_beam.mesh_belt_weld', 'Circuit 21: the chain mesh weave edge-welded under argon; the PBO trim goes back to the PBO plant'],
        ['gtceu.recipe.grindless_megabar.flexspline_cup', 'Circuit 7: gum metal and chain lamina pressed into the flexspline cup; the anvil sometimes cracks'],
        ['gtceu.recipe.grindless_femtosecond_writing.flexspline_teeth', 'Circuit 5: the flexspline teeth written by femtosecond pulses; the swarf is atomised back to gum metal blend'],
        ['gtceu.recipe.grindless_magnet_winding.rebco_pancake', 'Circuit 7: REBCO coated conductor wound into a double pancake with chain wire terminals'],
        ['gtceu.recipe.grindless_magnet_winding.rebco_training', 'Circuit 8: the potted pancake trained through its quenches to full current, with 4 niobium-titanium foil'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.rebco_potting', 'Circuit 7: the REBCO pancake vacuum-impregnated with epoxy'],
        ['gtceu.recipe.grindless_hot_cell.thorium_229_nitrate', 'Circuit 21: thorium-229 dissolved in nitric acid; the hydrogen goes back to stock'],
        ['gtceu.recipe.grindless_fluorspar_kiln.laser_grade_thf4', 'Thorium-229 nitrate fluorinated to laser-grade ThF4; the nitric acid goes back to the hot cell'],
        ['gtceu.recipe.grindless_crystal_growth.th_caf2_lasing', 'Circuit 19: a CaF2 boule grown with laser-grade ThF4 under argon; the lead fluoride scavenger stays'],
        ['gtceu.recipe.grindless_crystal_growth.hpge_compton', 'Circuit 20: 13N germanium pulled into a high-purity boule under argon'],
        ['gtceu.recipe.grindless_nuclear_clock.lasing_check', 'Circuit 4: the coated Th:CaF2 crystal pumped by the VUV comb until the nuclear line lases in 1,000 mB xenon']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ITEMS.forEach(function (e) {
            add('item.grindless.' + e[0], e[1])
            add('tooltip.grindless.' + e[0] + '.0', e[2])
            add('tooltip.grindless.' + e[0] + '.1', e[3])
        })
        NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2]) })
        RECIPES.forEach(function (e) { add(e[0], e[1]) })
    })
})()
