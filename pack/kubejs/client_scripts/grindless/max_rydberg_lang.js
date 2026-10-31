// Gregtech Grindless - names and tooltips of MAX's Rydberg array works (startup_scripts/grindless/max/rydberg.js; package MAX-B3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_calutron_separation.rubidium_87', 'Circuit 18: lepidolite is ionised and separated; the lithium comes back as dust.', 'Circuito 18: la lepidolita se ioniza y se separa; el litio vuelve como polvo.'],
        ['gtceu.recipe.grindless_calutron_separation.rb_getter_scrap', 'Circuit 19: the getter scrap of a spent Rb cartridge is stripped back to Rb-87.', 'Circuito 19: la chatarra de getter de un cartucho de Rb gastado se reduce de nuevo a Rb-87.'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.atom_cartridge_rb87', 'Circuit 6: Rb-87 is laser cooled in a cavity (kept) and loaded into a cartridge.', 'Circuito 6: el Rb-87 se enfr\u00eda con l\u00e1ser en una cavidad (se conserva) y se carga en un cartucho.'],
        ['gtceu.recipe.grindless_crystal_growth.eu_yso_boule', 'Circuit 30: Eu:YSO is grown in an iridium crucible (31 % wear).', 'Circuito 30: el Eu:YSO se crece en un crisol de iridio (31 % de desgaste).'],
        ['gtceu.recipe.grindless_crystal_growth.teo2_boule', 'Circuit 32: paratellurite is grown under oxygen in an iridium crucible (31 % wear).', 'Circuito 32: la paratelurita se crece bajo ox\u00edgeno en un crisol de iridio (31 % de desgaste).'],
        ['gtceu.recipe.grindless_spectral_hole_burning.burned_memory_crystal', 'Circuit 26: a spectral hole comb is burned into an Eu:YSO slab in superfluid helium.', 'Circuito 26: se graba un peine de huecos espectrales en una l\u00e1mina de Eu:YSO en helio superfluido.'],
        ['gtceu.recipe.grindless_nuclear_clock.lock_microcomb', 'Circuit 7: a packaged microcomb is locked to the nuclear clock (kept).', 'Circuito 7: un micropeine empaquetado se bloquea con el reloj nuclear (se conserva).'],
        ['gtceu.recipe.grindless_beuv_lithography.microring_wafer', 'Circuit 12: a nitride film is exposed with the microring pattern.', 'Circuito 12: una pel\u00edcula de nitruro se expone con el patr\u00f3n del microanillo.'],
        ['gtceu.recipe.grindless_femtosecond_writing.trimmed_microring', 'Circuit 9: a microring is trimmed to the comb spacing under a silica cladding.', 'Circuito 9: un microanillo se ajusta al espaciado del peine bajo un revestimiento de s\u00edlice.'],
        ['gtceu.recipe.grindless_femtosecond_writing.endcapped_hc_fibre', 'Circuit 11: a hollow-core fibre is sealed with a silica end cap.', 'Circuito 11: una fibra de n\u00facleo hueco se sella con un tap\u00f3n de s\u00edlice.'],
        ['gtceu.recipe.grindless_femtosecond_writing.laser_welded_glass_cell', 'Circuit 12: two silica plates are laser-welded around a spacer into a vacuum cell.', 'Circuito 12: dos placas de s\u00edlice se sueldan con l\u00e1ser alrededor de un espaciador en una celda de vac\u00edo.'],
        ['gtceu.recipe.grindless_photonic_foundry.packaged_microcomb', 'Circuit 23: a trimmed microring is soldered onto a glass interposer.', 'Circuito 23: un microanillo ajustado se suelda sobre un interpositor de vidrio.'],
        ['gtceu.recipe.grindless_ion_slicing.ln_transducer_bonded_blank', 'Circuit 13: a lithium niobate wafer is sliced onto an AOD blank.', 'Circuito 13: una oblea de niobato de litio se corta sobre un bloque de AOD.'],
        ['gtceu.recipe.grindless_mtj_sputtering.ar_coated_glass_cell', 'Circuit 22: magnesium fluoride is sputtered onto an annealed cell; most of the argon is recovered.', 'Circuito 22: se pulveriza fluoruro de magnesio sobre una celda recocida; casi todo el arg\u00f3n se recupera.'],
        ['gtceu.recipe.grindless_mtj_sputtering.electroded_aod', 'Circuit 23: titanium and gold are sputtered onto a bonded transducer; most of the argon is recovered.', 'Circuito 23: se pulverizan titanio y oro sobre un transductor unido; casi todo el arg\u00f3n se recupera.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
