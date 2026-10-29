// priority: 1520
// Gregtech Grindless - names and tooltips of UXV's superheavies III (startup_scripts/grindless/uxv/superheavy.js; package UXV-A1):
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1               the four items
//   material.gtceu.<n>                                           the two recoil gases
//   gtceu.recipe.grindless_<type>.<recipe>                       the EMI line of each older row the package adds
//   emi.grindless.info.uxv_superheavy_stock.0                    the info page of the stock outputs
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    var ITEMS = [
        ['element_121_atoms',
            ['Element 121 Atoms', 'A few atoms of element 121 caught on a membrane.', 'A sealed capsule keeps them.'],
            ['Átomos del elemento 121', 'Unos pocos átomos del elemento 121 recogidos en una membrana.', 'Una cápsula sellada los conserva.']],
        ['element_122_atoms',
            ['Element 122 Atoms', 'A few atoms of element 122 caught on a membrane.', 'A sealed capsule keeps them.'],
            ['Átomos del elemento 122', 'Unos pocos átomos del elemento 122 recogidos en una membrana.', 'Una cápsula sellada los conserva.']],
        ['fm257_plated_blank',
            ['Fermium-257 Plated Blank', 'Fermium-257 plated on a titanium backing from a nitric bath.', 'Sintered under argon it becomes a target.'],
            ['Pieza chapada de fermio-257', 'Fermio-257 chapado sobre un soporte de titanio desde un baño nítrico.', 'Sinterizada bajo argón se vuelve un blanco.']],
        ['cm248_plated_blank',
            ['Curium-248 Plated Blank', 'Curium-248 plated on a titanium backing from a nitric bath.', 'Sintered under argon it becomes a target.'],
            ['Pieza chapada de curio-248', 'Curio-248 chapado sobre un soporte de titanio desde un baño nítrico.', 'Sinterizada bajo argón se vuelve un blanco.']]
    ]

    var MATERIALS = [
        ['element_121_recoil_gas', 'Element 121 Recoil Gas', 'Gas de retroceso del elemento 121'],
        ['element_122_recoil_gas', 'Element 122 Recoil Gas', 'Gas de retroceso del elemento 122']
    ]

    var ENTRIES = [
        ['gtceu.recipe.grindless_calutron_separation.fermium_257',
            'Circuit 10: fermium split by mass; the fermium-255 rest goes back to stock',
            'Circuito 10: fermio separado por masa; el resto de fermio-255 vuelve al almacén'],
        ['gtceu.recipe.grindless_calutron_separation.tungsten_184',
            'Circuit 13: tungsten split by mass; the other isotopes go back to stock as tungsten',
            'Circuito 13: wolframio separado por masa; los otros isótopos vuelven al almacén como wolframio'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.element_121',
            'Circuit 9: a titanium-50 beam on the einsteinium-254 target; the spent target goes to waste retrieval',
            'Circuito 9: un haz de titanio-50 sobre el blanco de einstenio-254; el blanco gastado va a la recuperación de residuos'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.element_122',
            'Circuit 10: a titanium-50 beam on the fermium-257 target; the spent target goes to waste retrieval',
            'Circuito 10: un haz de titanio-50 sobre el blanco de fermio-257; el blanco gastado va a la recuperación de residuos'],
        ['gtceu.recipe.grindless_recoil_separation.element_121_atoms',
            'Circuit 8: element 121 caught from its recoil gas on the membrane',
            'Circuito 8: el elemento 121 recogido de su gas de retroceso en la membrana'],
        ['gtceu.recipe.grindless_recoil_separation.element_122_atoms',
            'Circuit 9: element 122 caught from its recoil gas on the membrane',
            'Circuito 9: el elemento 122 recogido de su gas de retroceso en la membrana'],
        ['gtceu.recipe.grindless_superheavy_chemistry.element_121_catch',
            'Circuit 8: element 121 sealed in a capsule',
            'Circuito 8: el elemento 121 sellado en una cápsula'],
        ['gtceu.recipe.grindless_superheavy_chemistry.element_122_catch',
            'Circuit 9: element 122 sealed in a capsule',
            'Circuito 9: el elemento 122 sellado en una cápsula'],
        ['gtceu.recipe.grindless_superheavy_chemistry.census_iii',
            'Circuit 10: elements 121 and 122 counted together in one capsule',
            'Circuito 10: los elementos 121 y 122 contados juntos en una cápsula'],
        ['gtceu.recipe.grindless_transuranium_processing.fm257_plating',
            'Circuit 10: fermium-257 plated on titanium from nitric acid; most of the bath is recovered',
            'Circuito 10: fermio-257 chapado sobre titanio desde ácido nítrico; casi todo el baño se recupera'],
        ['gtceu.recipe.grindless_transuranium_processing.cm248_plating',
            'Circuit 11: curium-248 plated on titanium from nitric acid; most of the bath is recovered',
            'Circuito 11: curio-248 chapado sobre titanio desde ácido nítrico; casi todo el baño se recupera'],
        ['emi.grindless.info.uxv_superheavy_stock.0',
            'Census III is stock for the next tier. A spent beam target goes to waste retrieval: its synroc is cast and its actinides go on to partitioning. The fermium and tungsten isotopes leave their rest in stock.',
            'El censo III es existencia para el siguiente nivel. Un blanco gastado va a la recuperación de residuos: su synroc se moldea y sus actínidos siguen a la partición. Los isótopos de fermio y wolframio dejan su resto en el almacén.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1][0], i[2][0]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[1][1], i[2][1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[1][2], i[2][2]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1], m[2]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
