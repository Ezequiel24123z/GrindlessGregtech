// priority: 3300
// Gregtech Grindless - names and tooltips of UIV's BEUV scanner and STM lithography cell (startup_scripts/grindless/uiv/beuv_stm.js; package UIV-A5):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each scanner and cell recipe
//   material.gtceu.phosphine                           the doping gas
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.beuv_scanner', 'BEUV Scanner'],
        ['block.gtceu.stm_lithography_cell', 'STM Lithography Cell'],
        ['gtceu.beuv_lithography', 'BEUV Lithography'],
        ['gtceu.stm_lithography', 'STM Lithography'],

        ['material.gtceu.phosphine', 'Phosphine'],

        ['grindless.machine.beuv_scanner.tooltip.0',
            '\u00a77Exposes resist at 6.7 nm: the only maker of BEUV driver ASICs.'],
        ['grindless.machine.stm_lithography_cell.tooltip.0',
            '\u00a77Moves single hydrogen atoms: patterns and doses Si-28 wafers.'],

        ['gtceu.recipe.grindless_beuv_lithography.exposure',
            'Circuit 1: a terbium droplet is lit at 6.7 nm and exposes the HfO2 resist; the collector mirror comes out fouled by terbium debris.'],
        ['gtceu.recipe.grindless_beuv_lithography.driver_asic',
            'Circuit 2: the exposed film is developed in an ethanol bath (not consumed) and cut into driver ASICs.'],
        ['gtceu.recipe.grindless_beuv_lithography.mirror_cleaning',
            'Circuit 3: the fouled mirror is cleaned and the terbium debris is recovered as metal.'],
        ['gtceu.recipe.grindless_stm_lithography.h_terminate',
            'Circuit 1: hydrogen passivates the surface of a Si-28 SOI wafer.'],
        ['gtceu.recipe.grindless_stm_lithography.stm_pattern',
            'Circuit 2: the tip removes single hydrogen atoms in the pattern; liquid helium cools the stage and boils off as helium.'],
        ['gtceu.recipe.grindless_stm_lithography.ph3_dose',
            'Circuit 3: phosphine adsorbs on the bare silicon; the excess gas goes to the phosphine scrubber, which makes phosphoric acid.'],

        ['gtceu.recipe.grindless_molecular_beam_epitaxy.la_b4c_multilayer',
            'Circuit 5: lanthanum and boron carbide are deposited in alternating layers on glass; the B4C offcuts return to stock.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.psi_overgrowth',
            'Circuit 6: a Si-28 overgrowth buries the phosphorus-dosed pattern into a P:Si die.'],
        ['gtceu.recipe.grindless_photonic_foundry.hfo2_resist',
            'Circuit 12: a hafnia film is spun on a silicon wafer to make the BEUV resist.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['tb_droplet_target', 'Terbium Droplet Target', 'Terbium on a tin carrier, fired as droplets into the BEUV source.', 'Each exposure uses one; the debris comes back as terbium.'],
        ['hfo2_resist_wafer', 'HfO2 Resist Wafer', 'A silicon wafer under a thin hafnia film.', 'Exposed in the BEUV scanner (circuit 1).'],
        ['beuv_exposed_wafer', 'BEUV-Exposed Wafer', 'The resist carries a latent 6.7 nm pattern.', 'Developed into driver ASICs (circuit 2).'],
        ['fouled_beuv_mirror', 'Fouled BEUV Mirror', 'Coated with terbium debris and no longer reflective.', 'Cleaned in the scanner (circuit 3), which returns the terbium.'],
        ['beuv_driver_asic', 'BEUV Driver ASIC', 'A control chip printed at 6.7 nm.', 'Only the BEUV scanner makes it.'],
        ['b4c_target', 'Boron Carbide Target', 'A sintered B4C sputtering target.', 'Coats a mirror in the MBE reactor (circuit 5).'],
        ['la_b4c_multilayer', 'La/B4C Multilayer', 'Alternating lanthanum and boron carbide layers on glass.', 'Gets a LaN barrier in the chemical reactor.'],
        ['lan_barrier_mirror', 'LaN-Barrier Mirror', 'A multilayer with a lanthanum nitride diffusion barrier.', 'Capped with ruthenium in the assembler.'],
        ['beuv_mirror', 'BEUV Mirror', 'A ruthenium-capped La/B4C mirror for 6.7 nm light.', 'Fouls on every exposure and is cleaned, not replaced.'],
        ['si28_fz_ingot', 'Si-28 Float-Zone Ingot', 'Isotopically pure silicon, zone-refined.', 'Cut into wafers; donor wafers regrow it.'],
        ['si28_fz_wafer', 'Si-28 Wafer', 'A polished wafer of isotopically pure silicon.', 'Implanted with hydrogen in the ion implanter (circuit 6).'],
        ['h_terminated_wafer', 'H-Terminated Wafer', 'A Si-28 SOI surface capped with hydrogen.', 'Patterned atom by atom in the STM cell.'],
        ['stm_patterned_wafer', 'STM-Patterned Wafer', 'Bare silicon where the hydrogen was removed.', 'Dosed with phosphine (circuit 3).'],
        ['ph3_dosed_wafer', 'PH3-Dosed Wafer', 'Phosphorus atoms placed in the pattern.', 'Buried under Si-28 in the MBE reactor (circuit 6).']
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
