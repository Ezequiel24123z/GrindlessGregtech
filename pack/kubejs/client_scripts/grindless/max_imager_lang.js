// priority: 6666
// Gregtech Grindless - names and tooltips of MAX's photon ring imager (startup_scripts/grindless/max/imager.js; package MAX-D2):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.photon_ring_imager', 'Photon Ring Imager'],
        ['gtceu.photon_ring_imaging', 'Photon Ring Imaging'],
        ['grindless.machine.photon_ring_imager.tooltip.0', '\u00a77Images Sgr A* with a ring of dishes and mK receivers.'],
        ['emi.grindless.info.photon_ring_imager.0', 'A ring of dish panels, two SIS mixers, a photonic local oscillator, two cryogenic LNA modules, a locked microcomb, a memory node and a Rydberg logic array are combined into a spin map of Sgr A*. The recipes run only at Sgr A* (gcyr:black_hole_orbit).'],
        ['emi.grindless.info.photon_ring_imager.1', 'The kept spin map and two more SIS mixers give the nuclear star cluster ephemeris. The dish panels, mixers, local oscillator and LNA modules are made on older machines (SiC fibre, infiltration, implanter, sputtering, BEUV, cryostat, MOCVD, epitaxy, foundry) and assemblers.'],
        ['gtceu.recipe.grindless_photon_ring_imaging.sgr_a_spin_map', 'Circuit 1: the dish ring, SIS mixers, local oscillator and cold LNAs image Sgr A*; the array and mixers wear out.'],
        ['gtceu.recipe.grindless_photon_ring_imaging.nsc_ephemeris', 'Circuit 2: the kept spin map and two SIS mixers give the star cluster ephemeris.'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.sic_mirror_tow', 'Circuit 19: SiC fibre is spun into a mirror tow under argon.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_dish_blank', 'Circuit 14: a mirror tow is infiltrated with methyltrichlorosilane into a dish blank; HCl comes off.'],
        ['gtceu.recipe.grindless_ion_implantation.figured_dish_blank', 'Circuit 16: a dish blank is figured with an ion beam under argon.'],
        ['gtceu.recipe.grindless_mtj_sputtering.gold_coated_dish', 'Circuit 17: a figured dish is sputtered with gold; most of the argon is recovered.'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_alox_nb_trilayer', 'Circuit 18: an Nb-AlOx-Nb trilayer is sputtered; most of the argon is recovered.'],
        ['gtceu.recipe.grindless_beuv_lithography.sis_junction_wafer', 'Circuit 11: a trilayer is exposed with the SIS junction pattern; the mirror comes back fouled.'],
        ['gtceu.recipe.grindless_beuv_lithography.utc_photodiode_wafer', 'Circuit 13: an InP wafer is exposed with the UTC photodiode pattern; the mirror comes back fouled.'],
        ['gtceu.recipe.grindless_beuv_lithography.hemt_gate_wafer', 'Circuit 14: an epitaxial wafer is exposed with the HEMT gate pattern; the mirror comes back fouled.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.tested_sis_die', 'Circuit 9: an SIS die is cooled in the mK cryostat and tested (the module and He-3/He-4 mixture are kept).'],
        ['gtceu.recipe.grindless_mocvd.inp_utc_epi_wafer', 'Circuit 28: an InP UTC epitaxy is grown by MOCVD.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.hemt_stack_epi', 'Circuit 14: an InP HEMT channel is grown on a semi-insulating wafer.'],
        ['gtceu.recipe.grindless_photonic_foundry.photonic_lo_module', 'Circuit 24: a UTC die is packaged into a photonic local oscillator module.'],
        ['gtceu.recipe.grindless_crystal_growth.semi_insulating_inp_wafer', 'Circuit 32: iron-doped InP is grown in an iridium crucible (31 % wear).'],
        ['gtceu.recipe.grindless_electron_beam.sis_scrap_niobium', 'Circuit 32: SIS scrap is stripped back to niobium dust under argon.'],
        ['gtceu.recipe.grindless_closed_loop.cryo_tested_lna', 'A HEMT die is cooled and tested at 4 K.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
