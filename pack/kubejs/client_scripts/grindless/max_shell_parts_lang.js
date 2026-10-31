// Gregtech Grindless - EMI lines of MAX-H1's rows on older machines (lines 30 and 38, package MAX-H1):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_levitation_melting.er3ni_ingot', 'Er3Ni ingot: erbium-holmium oxide, nickel and calcium', 'Lingote de Er3Ni: óxido de erbio-holmio, níquel y calcio'],
        ['gtceu.recipe.grindless_crystal_growth.sic_substrate_wafer', 'SiC substrate wafer from SiC powder', 'Oblea sustrato de SiC desde polvo de SiC'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_cmos_wafer', 'SiC CMOS wafer', 'Oblea CMOS de SiC'],
        ['gtceu.recipe.grindless_mtj_sputtering.mram_stack_sic', 'MRAM stack on a SiC CMOS wafer', 'Pila MRAM sobre oblea CMOS de SiC'],
        ['gtceu.recipe.grindless_racetrack_patterning.racetrack_memory_die', 'Racetrack memory die', 'Chip de memoria racetrack']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
