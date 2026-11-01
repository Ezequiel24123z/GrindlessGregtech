// priority: 6693
// Gregtech Grindless - names and tooltips of MAX's atom interferometer works (startup_scripts/grindless/max/interferometer.js; package MAX-B2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type and of its older rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.atom_interferometer_works', 'Atom Interferometer Works'],
        ['gtceu.atom_interferometry', 'Atom Interferometry'],

        ['grindless.machine.atom_interferometer_works.tooltip.0',
            '\u00a77Drops a Sr cloud down a shielded shaft: gradiometers and gradient maps.'],

        ['emi.grindless.info.atom_interferometer_works.0',
            'A matter-wave gradiometer splits a cloud of ultracold strontium-88 into two paths, lets both fall through the shield and reads the phase between them. The cartridge is spent: it comes back as a spent Sr cartridge, which the calutron turns back into Sr-88 (circuit 17).'],
        ['emi.grindless.info.atom_interferometer_works.1',
            'The cavity, the AlGaAs mirror pair and the silicon spacer that frame it are made on older machines (crystal growth, MBE, chemical reactor, laser engraver, helium refrigerator). Circuit 2 calibrates a gradiometer on the Sgr A* spin map and needs it from the Sgr A* route.'],

        ['gtceu.recipe.grindless_atom_interferometry.matter_wave_gradiometer', 'Circuit 1: a degenerate Sr cartridge, a squeezed-light chip, a rotation reference, a modulator and a cryo cavity in a superfluid He-3 bath; the cartridge comes back spent.'],
        ['gtceu.recipe.grindless_atom_interferometry.shell_gradient_map', 'Circuit 2: a gradiometer is calibrated against the Sgr A* spin map and yields the shell gradient map.'],

        ['gtceu.recipe.grindless_calutron_separation.strontium_88', 'Circuit 16: strontium carbonate is ionised and separated; 15 of 16 come back as carbonate.'],
        ['gtceu.recipe.grindless_calutron_separation.spent_sr_cartridge', 'Circuit 17: a spent Sr cartridge is stripped back to Sr-88.'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.degenerate_sr_cartridge', 'Circuit 5: Sr-88 is laser cooled below the condensation point in a cavity (kept).'],
        ['gtceu.recipe.grindless_shequid_assembly.shequid_rotation_ref', 'Circuit 6: a cryo-CMOS die and a niobium film are closed around a weak-link cell (kept) in superfluid helium.'],
        ['gtceu.recipe.grindless_ion_slicing.atom_optics_modulator', 'Circuit 11: a lithium niobate wafer is sliced on a float-zone silicon wafer into a beam-splitter modulator.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.algaas_bragg_stack', 'Circuit 13: AlGaAs layers are grown on a GaAs wafer in liquid nitrogen.'],
        ['gtceu.recipe.grindless_crystal_growth.silicon_cavity_spacer', 'Circuit 31: silicon is grown in an iridium crucible (31 % wear) into a cavity spacer.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
