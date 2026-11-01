// priority: 2985
// Gregtech Grindless - names and tooltips of RX J1856.5-3754's crust lift, neutron drip separator, neutronium cage, r-process decompressor and
// decay heat vault (startup_scripts/grindless/uiv/rx_j1856.js; package UIV-B2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe, and of each row the package appends to an older table
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//   material.gtceu.<n>                                 the package's own fluids
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.crust_lift', 'Crust Lift'],
        ['block.gtceu.neutron_drip_separator', 'Neutron Drip Separator'],
        ['block.gtceu.neutronium_cage', 'Neutronium Cage'],
        ['block.gtceu.r_process_decompressor', 'R-Process Decompressor'],
        ['block.gtceu.decay_heat_vault', 'Decay Heat Vault'],
        ['gtceu.crust_lifting', 'Crust Lifting'],
        ['gtceu.neutron_drip_separation', 'Neutron Drip Separation'],
        ['gtceu.neutronium_caging', 'Neutronium Caging'],
        ['gtceu.r_process_decompression', 'R-Process Decompression'],
        ['gtceu.decay_heat', 'Decay Heat'],

        ['grindless.machine.crust_lift.tooltip.0', '\u00a77Lifts neutron-star crust up a tether and a polar-cap electrode.'],
        ['grindless.machine.neutron_drip_separator.tooltip.0', '\u00a77Splits the crust at the neutron drip line behind a nickel-58 guide.'],
        ['grindless.machine.neutronium_cage.tooltip.0', '\u00a77Cools drip neutrons in superfluid helium and cages them.'],
        ['grindless.machine.r_process_decompressor.tooltip.0', '\u00a77Lets crust nuclei swell in a flood of neutrons: the r-process.'],
        ['grindless.machine.decay_heat_vault.tooltip.0', '\u00a77Holds a kilonova capsule while its heat decays into electricity.'],
        ['grindless.machine.decay_heat_vault.tooltip.1', 'One run at a time, through its own UIV dynamo hatch.'],

        ['emi.grindless.info.uiv_rx_j1856_crust.0',
            'The crust lift pulls neutron-star crust up a tether. The polar-cap electrode stays in the machine; one tether in ten wears out and goes back to the elevator as scrap.'],
        ['emi.grindless.info.uiv_rx_j1856_pellet.0',
            'A neutronium pellet is neutron superfluid caged in a nickel-58 cage part. It is not GregTech\'s neutronium.'],
        ['emi.grindless.info.uiv_rx_j1856_capsule.0',
            'The kilonova capsule burns in the decay heat vault for 12,000 ticks; the aged capsule is opened for its ash.'],
        ['emi.grindless.info.uiv_rx_j1856_target.0',
            'A uranium-238 target flashed with neutrons gives einsteinium and fermium debris. Einsteinium-254 makes the element 119 target.'],
        ['emi.grindless.info.uiv_rx_j1856_site_casing.0',
            'A structure block: the crust lift (52), the neutron drip separator (28), the r-process decompressor (28) and the decay heat vault (20) are built of it. The assembler seals a rad-hard controller in osmiridium plates with neutron reflectors and PBI.'],

        ['gtceu.recipe.grindless_crust_lifting.crust_lift', 'Circuit 1: crust lifted up the tether; the tether wears, the electrode is kept'],
        ['gtceu.recipe.grindless_neutron_drip_separation.inner_crust', 'Circuit 1: crust split into inner-crust matter and outer-crust ions'],
        ['gtceu.recipe.grindless_neutron_drip_separation.drip_neutrons', 'Circuit 2: inner-crust matter boiled into drip neutrons and crust nuclei'],
        ['gtceu.recipe.grindless_neutronium_caging.neutron_superfluid', 'Circuit 1: drip neutrons cooled into a neutron superfluid; the leak decays to protium'],
        ['gtceu.recipe.grindless_neutronium_caging.neutronium_pellet', 'Circuit 2: neutron superfluid caged in a cage part as a neutronium pellet'],
        ['gtceu.recipe.grindless_r_process_decompression.hot_r_process_mix', 'Circuit 1: crust nuclei swollen by drip neutrons into a hot r-process mix'],
        ['gtceu.recipe.grindless_r_process_decompression.flash_target', 'Circuit 2: a uranium-238 target flashed with drip neutrons'],
        ['gtceu.recipe.grindless_decay_heat.kilonova_decay', 'Circuit 1: a sealed kilonova capsule ages for 12,000 ticks and gives 33,554,432 EU/t'],
        ['gtceu.recipe.grindless_decay_heat.capsule_opening', 'Circuit 2: the aged capsule opened into r-process ash and helium-4'],
        ['gtceu.recipe.grindless_decay_heat.fragment_burn', 'Circuit 3: fission fragments burn down to iron and helium-4'],
        ['gtceu.recipe.grindless_decay_heat.ion_burn', 'Circuit 4: outer-crust ions burn down to iron and helium-4'],

        ['gtceu.recipe.grindless_hot_cell.es_fm_debris', 'Mode 13: the flashed target dissolved in nitric acid into an einsteinium and fermium liquor'],
        ['gtceu.recipe.grindless_hot_cell.ash_actinide_cut', 'Mode 14: the actinide cut of the r-process ash'],
        ['gtceu.recipe.grindless_transuranium_processing.es254_extraction', 'Circuit 9: einsteinium-254 pulled out of the actinide liquor with HDEHP; the solvent is kept'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.es254_bombard', 'Circuit 8: a calcium-48 beam on the einsteinium-254 target; the wheel comes back activated'],
        ['gtceu.recipe.grindless_recoil_separation.element_119_recoil', 'Circuit 7: element 119 caught from its recoil gas on the membrane'],
        ['gtceu.recipe.grindless_superheavy_chemistry.census_ii', 'Circuit 3: elements 119 and 120 counted in a sealed capsule']
    ]

    // [name, en, tooltip 0 en, tooltip 1 en]
    var ITEMS = [
        ['neutron_star_crust', 'Neutron-Star Crust', 'Lifted from RX J1856.5-3754.', 'Split at the neutron drip line.'],
        ['inner_crust_matter', 'Inner-Crust Matter', 'Nuclei swimming in free neutrons.', 'Boils its neutrons off.'],
        ['crust_nuclei', 'Crust Nuclei', 'Neutron-rich nuclei left when the drip neutrons are gone.', 'Swell in the r-process decompressor.'],
        ['outer_crust_ions', 'Outer-Crust Ions', 'A lattice of iron-group ions.', 'Burned in the decay heat vault.'],
        ['fission_fragments', 'Fission Fragments', 'Medium-mass nuclei, still hot.', 'Burned in the decay heat vault.'],
        ['bn_coated_cnt_yarn', 'BN-Coated Nanotube Yarn', 'Carbon nanotube yarn under a boron nitride coat.', 'Laminated with metallic hydrogen.'],
        ['mh_laminated_yarn', 'Metallic-Hydrogen Laminated Yarn', 'Coated yarn wrapped in metallic-hydrogen foil.', 'Four braid into a tether strand.'],
        ['braided_mh_tether', 'Braided Metallic-Hydrogen Strand', 'Four laminated yarns braided together.', 'Made into a tether at the elevator works.'],
        ['mh_tether', 'Metallic-Hydrogen Tether', 'Light, strong and cold enough to hang from a star.', 'Makes the polar-cap electrode and the crust lift tether.'],
        ['polar_cap_electrode', 'Polar-Cap Electrode', 'Grounds the tether in the neutron star\'s magnetic pole.', 'Never used up by the crust lift.'],
        ['crust_lift_tether', 'Crust Lift Tether', 'The cable the crust is lifted on.', 'Wears out slowly.'],
        ['worn_crust_lift_tether', 'Worn Crust Lift Tether', 'A tether worn thin by the lift.', 'Goes back to the elevator works as scrap.'],
        ['kilonova_capsule', 'Kilonova Capsule', 'A sealed capsule of hot r-process matter.', 'Ages in the decay heat vault.'],
        ['aged_kilonova_capsule', 'Aged Kilonova Capsule', 'A capsule whose heat has gone to the grid.', 'Opened for its ash.'],
        ['r_process_ash', 'R-Process Ash', 'Platinum metals, lanthanides and actinides in one dust.', 'Cut in the platinum plant, the europium reductor and the hot cell.'],
        ['flashed_target', 'Flashed Uranium Target', 'A uranium-238 target hit by a neutron flood.', 'Dissolved in the hot cell.'],
        ['es254_target', 'Einsteinium-254 Target Wheel', 'A target wheel loaded with einsteinium-254.', 'Bombarded with calcium-48 it gives element 119.']
    ]

    var MATERIALS = [
        ['drip_neutrons', 'Drip Neutrons'],
        ['neutron_superfluid', 'Neutron Superfluid'],
        ['hot_r_process_mix', 'Hot R-Process Mix'],
        ['element_119_recoil_gas', 'Element 119 Recoil Gas'],
        ['es_fm_liquor', 'Einsteinium-Fermium Liquor'],
        ['es_254_solution', 'Einsteinium-254 Solution']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
