// priority: 6655
// Gregtech Grindless - names and tooltips of MAX's photon ring imager (startup_scripts/grindless/max/imager.js; package MAX-D2):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.photon_ring_imager', 'Photon Ring Imager', 'Generador de im\u00e1genes del anillo de fotones'],
        ['gtceu.photon_ring_imaging', 'Photon Ring Imaging', 'Imagen del anillo de fotones'],
        ['grindless.machine.photon_ring_imager.tooltip.0', '\u00a77Images Sgr A* with a ring of dishes and mK receivers.', '\u00a77Capta Sgr A* con un anillo de platos y receptores mK.'],
        ['emi.grindless.info.photon_ring_imager.0', 'A ring of dish panels, two SIS mixers, a photonic local oscillator, two cryogenic LNA modules, a locked microcomb, a memory node and a Rydberg logic array are combined into a spin map of Sgr A*. The recipes run only at Sgr A* (gcyr:black_hole_orbit).', 'Un anillo de paneles parab\u00f3licos, dos mezcladores SIS, un oscilador local fot\u00f3nico, dos m\u00f3dulos LNA criog\u00e9nicos, un micropeine bloqueado, un nodo de memoria y una matriz l\u00f3gica de Rydberg se combinan en un mapa de esp\u00edn de Sgr A*. Las recetas solo funcionan en Sgr A* (gcyr:black_hole_orbit).'],
        ['emi.grindless.info.photon_ring_imager.1', 'The kept spin map and two more SIS mixers give the nuclear star cluster ephemeris. The dish panels, mixers, local oscillator and LNA modules are made on older machines (SiC fibre, infiltration, implanter, sputtering, BEUV, cryostat, MOCVD, epitaxy, foundry) and assemblers.', 'El mapa de esp\u00edn conservado y dos mezcladores SIS m\u00e1s dan la efem\u00e9ride del c\u00famulo estelar nuclear. Los paneles, mezcladores, oscilador local y m\u00f3dulos LNA se hacen en m\u00e1quinas anteriores (fibra de SiC, infiltraci\u00f3n, implantador, pulverizaci\u00f3n, BEUV, criostato, MOCVD, epitaxia, f\u00e1brica fot\u00f3nica) y ensambladores.'],
        ['gtceu.recipe.grindless_photon_ring_imaging.sgr_a_spin_map', 'Circuit 1: the dish ring, SIS mixers, local oscillator and cold LNAs image Sgr A*; the array and mixers wear out.', 'Circuito 1: el anillo, los mezcladores SIS, el oscilador local y los LNA fr\u00edos obtienen la imagen de Sgr A*; la matriz y los mezcladores se desgastan.'],
        ['gtceu.recipe.grindless_photon_ring_imaging.nsc_ephemeris', 'Circuit 2: the kept spin map and two SIS mixers give the star cluster ephemeris.', 'Circuito 2: el mapa de esp\u00edn conservado y dos mezcladores SIS dan la efem\u00e9ride del c\u00famulo.'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.sic_mirror_tow', 'Circuit 19: SiC fibre is spun into a mirror tow under argon.', 'Circuito 19: la fibra de SiC se hila en una mecha para espejo bajo arg\u00f3n.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_dish_blank', 'Circuit 14: a mirror tow is infiltrated with methyltrichlorosilane into a dish blank; HCl comes off.', 'Circuito 14: una mecha se infiltra con metiltriclorosilano hasta un bloque de plato; se libera HCl.'],
        ['gtceu.recipe.grindless_ion_implantation.figured_dish_blank', 'Circuit 16: a dish blank is figured with an ion beam under argon.', 'Circuito 16: un bloque de plato se perfila con un haz de iones bajo arg\u00f3n.'],
        ['gtceu.recipe.grindless_mtj_sputtering.gold_coated_dish', 'Circuit 17: a figured dish is sputtered with gold; most of the argon is recovered.', 'Circuito 17: un plato perfilado se recubre de oro por pulverizaci\u00f3n; se recupera casi todo el arg\u00f3n.'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_alox_nb_trilayer', 'Circuit 18: an Nb-AlOx-Nb trilayer is sputtered; most of the argon is recovered.', 'Circuito 18: se pulveriza una tricapa Nb-AlOx-Nb; se recupera casi todo el arg\u00f3n.'],
        ['gtceu.recipe.grindless_beuv_lithography.sis_junction_wafer', 'Circuit 11: a trilayer is exposed with the SIS junction pattern; the mirror comes back fouled.', 'Circuito 11: una tricapa se expone con el patr\u00f3n de la uni\u00f3n SIS; el espejo vuelve ensuciado.'],
        ['gtceu.recipe.grindless_beuv_lithography.utc_photodiode_wafer', 'Circuit 13: an InP wafer is exposed with the UTC photodiode pattern; the mirror comes back fouled.', 'Circuito 13: una oblea de InP se expone con el patr\u00f3n del fotodiodo UTC; el espejo vuelve ensuciado.'],
        ['gtceu.recipe.grindless_beuv_lithography.hemt_gate_wafer', 'Circuit 14: an epitaxial wafer is exposed with the HEMT gate pattern; the mirror comes back fouled.', 'Circuito 14: una oblea epitaxial se expone con el patr\u00f3n de puerta del HEMT; el espejo vuelve ensuciado.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.tested_sis_die', 'Circuit 9: an SIS die is cooled in the mK cryostat and tested (the module and He-3/He-4 mixture are kept).', 'Circuito 9: una pastilla SIS se enfr\u00eda en el criostato de mK y se prueba (se conservan el m\u00f3dulo y la mezcla He-3/He-4).'],
        ['gtceu.recipe.grindless_mocvd.inp_utc_epi_wafer', 'Circuit 28: an InP UTC epitaxy is grown by MOCVD.', 'Circuito 28: se crece una epitaxia UTC de InP por MOCVD.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.hemt_stack_epi', 'Circuit 14: an InP HEMT channel is grown on a semi-insulating wafer.', 'Circuito 14: se crece un canal HEMT de InP sobre una oblea semiaislante.'],
        ['gtceu.recipe.grindless_photonic_foundry.photonic_lo_module', 'Circuit 24: a UTC die is packaged into a photonic local oscillator module.', 'Circuito 24: una pastilla UTC se empaqueta en un m\u00f3dulo de oscilador local fot\u00f3nico.'],
        ['gtceu.recipe.grindless_crystal_growth.semi_insulating_inp_wafer', 'Circuit 32: iron-doped InP is grown in an iridium crucible (31 % wear).', 'Circuito 32: se crece InP dopado con hierro en un crisol de iridio (31 % de desgaste).'],
        ['gtceu.recipe.grindless_electron_beam.sis_scrap_niobium', 'Circuit 32: SIS scrap is stripped back to niobium dust under argon.', 'Circuito 32: la chatarra SIS se reduce a polvo de niobio bajo arg\u00f3n.'],
        ['gtceu.recipe.grindless_closed_loop.cryo_tested_lna', 'A HEMT die is cooled and tested at 4 K.', 'Una pastilla HEMT se enfr\u00eda y se prueba a 4 K.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
