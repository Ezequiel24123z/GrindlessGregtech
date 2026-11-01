// priority: 6594
// Gregtech Grindless - names and tooltips of MAX's Rydberg array works (startup_scripts/grindless/max/rydberg.js; package MAX-B3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.rydberg_array_works', 'Rydberg Array Works'],
        ['gtceu.rydberg_assembly', 'Rydberg Assembly'],
        ['grindless.machine.rydberg_array_works.tooltip.0', '\u00a77Traps Rb atoms in tweezers and wires them into a logic array.'],
        ['emi.grindless.info.rydberg_array_works.0', 'A tweezer array holds single rubidium-87 atoms from a cartridge, excites them to Rydberg states and links them with the laser die, memory node, microcomb and AOD pair. The cartridge is spent: it comes back as getter scrap, which the calutron strips back to Rb-87 (circuit 19). Circuit 2 refurbishes a spent array with a fresh cartridge.'],
        ['emi.grindless.info.rydberg_array_works.1', 'The memory node, UV fibre harness, crossed AOD pair and the cold-qualified cell are made on older machines (crystal growth, cutter, hole burning, fibre draw, MOCVD, sputtering, helium refrigerator).'],
        ['emi.grindless.info.max_optical_table_casing.0', 'A structure block: a damped slab of the optical tables of the MAX interferometer and Rydberg array. Made in the assembler.'],
        ['gtceu.recipe.grindless_rydberg_assembly.rydberg_logic_array', 'Circuit 1: a tweezer die, an Rb-87 cartridge, a laser die, a squeezed-light chip, a memory node, a locked microcomb, a UV harness and a crossed AOD pair in a superfluid He-3 bath; the cartridge comes back as getter scrap.'],
        ['gtceu.recipe.grindless_rydberg_assembly.rydberg_array_refurbish', 'Circuit 2: a spent array is reloaded with a fresh Rb-87 cartridge.'],
        ['gtceu.recipe.grindless_calutron_separation.rubidium_87', 'Circuit 18: lepidolite is ionised and separated; the lithium comes back as dust.'],
        ['gtceu.recipe.grindless_calutron_separation.rb_getter_scrap', 'Circuit 19: the getter scrap of a spent Rb cartridge is stripped back to Rb-87.'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.atom_cartridge_rb87', 'Circuit 6: Rb-87 is laser cooled in a cavity (kept) and loaded into a cartridge.'],
        ['gtceu.recipe.grindless_crystal_growth.eu_yso_boule', 'Circuit 30: Eu:YSO is grown in an iridium crucible (31 % wear).'],
        ['gtceu.recipe.grindless_crystal_growth.teo2_boule', 'Circuit 32: paratellurite is grown under oxygen in an iridium crucible (31 % wear).'],
        ['gtceu.recipe.grindless_spectral_hole_burning.burned_memory_crystal', 'Circuit 26: a spectral hole comb is burned into an Eu:YSO slab in superfluid helium.'],
        ['gtceu.recipe.grindless_nuclear_clock.lock_microcomb', 'Circuit 7: a packaged microcomb is locked to the nuclear clock (kept).'],
        ['gtceu.recipe.grindless_beuv_lithography.microring_wafer', 'Circuit 12: a nitride film is exposed with the microring pattern.'],
        ['gtceu.recipe.grindless_femtosecond_writing.trimmed_microring', 'Circuit 9: a microring is trimmed to the comb spacing under a silica cladding.'],
        ['gtceu.recipe.grindless_femtosecond_writing.endcapped_hc_fibre', 'Circuit 11: a hollow-core fibre is sealed with a silica end cap.'],
        ['gtceu.recipe.grindless_femtosecond_writing.laser_welded_glass_cell', 'Circuit 12: two silica plates are laser-welded around a spacer into a vacuum cell.'],
        ['gtceu.recipe.grindless_photonic_foundry.packaged_microcomb', 'Circuit 23: a trimmed microring is soldered onto a glass interposer.'],
        ['gtceu.recipe.grindless_ion_slicing.ln_transducer_bonded_blank', 'Circuit 13: a lithium niobate wafer is sliced onto an AOD blank.'],
        ['gtceu.recipe.grindless_mtj_sputtering.ar_coated_glass_cell', 'Circuit 22: magnesium fluoride is sputtered onto an annealed cell; most of the argon is recovered.'],
        ['gtceu.recipe.grindless_mtj_sputtering.electroded_aod', 'Circuit 23: titanium and gold are sputtered onto a bonded transducer; most of the argon is recovered.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
