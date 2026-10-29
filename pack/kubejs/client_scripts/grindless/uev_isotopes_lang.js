// priority: 5002
// Gregtech Grindless - names and tooltips of UEV's isotope separation (startup_scripts/grindless/uev/isotopes.js; package UEV-A1):
//
//   block.gtceu.calutron, gtceu.calutron_separation               machine and recipe type names
//   grindless.machine.calutron.tooltip.N / .no_voiding            controller tooltips and the refusal to void
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1                the four items
//   material.gtceu.<n>                                            the new GT materials
//   gtceu.recipe.grindless_calutron_separation.<recipe>           the EMI line of each calutron recipe (and of the older HFIR and
//                                                                 facility rows the package adds)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [kind, id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]] for items; [kind, id, [en], [es]] for materials
    var ITEMS = [
        ['item', 'ca48_oven_charge',
            ['Calcium-48 Oven Charge', 'Calcium-48 metal pressed on platinum foil, for the ion source of a heavy-ion accelerator.', 'Made from the calutron\'s calcium-48.'],
            ['Carga de horno de calcio-48', 'Calcio-48 metálico prensado sobre lámina de platino, para la fuente de iones de un acelerador de iones pesados.', 'Hecha con el calcio-48 del calutrón.']],
        ['item', 'plutonium_oxide_target',
            ['Plutonium-242 Oxide Target', 'Plutonium-242 oxide in a zircaloy tube; it breeds plutonium-244 in the high flux reactor.', 'The plutonium-242 comes from the calutron.'],
            ['Blanco de óxido de plutonio-242', 'Óxido de plutonio-242 en un tubo de zircaloy; cría plutonio-244 en el reactor de alto flujo.', 'El plutonio-242 sale del calutrón.']],
        ['item', 'irradiated_plutonium_target',
            ['Irradiated Plutonium Target', 'A plutonium target out of the high flux reactor, hot and rich in plutonium-244.', 'Dissolve it in the transuranium facility.'],
            ['Blanco de plutonio irradiado', 'Un blanco de plutonio fuera del reactor de alto flujo, caliente y rico en plutonio-244.', 'Disuélvelo en la instalación de transuránidos.']],
        ['item', 'plutonium_244_target',
            ['Plutonium-244 Target', 'Plutonium-244 oxide electrodeposited on aluminium foil.', 'Feeds the superheavy facility.'],
            ['Blanco de plutonio-244', 'Óxido de plutonio-244 electrodepositado sobre lámina de aluminio.', 'Alimenta la instalación de superpesados.']]
    ]

    var MATERIALS = [
        ['calcium_48_enriched', 'Enriched Calcium (40% Ca-48)', 'Calcio enriquecido (40 % Ca-48)'],
        ['calcium_48_enriched_chloride', 'Enriched Calcium Chloride', 'Cloruro de calcio enriquecido'],
        ['plutonium_oxide_feed', 'Plutonium Oxide Feed', 'Óxido de plutonio de alimentación'],
        ['plutonium_242_oxide', 'Plutonium-242 Oxide', 'Óxido de plutonio-242'],
        ['plutonium_244_rich_oxide', 'Plutonium-244-Rich Oxide', 'Óxido rico en plutonio-244'],
        ['plutonium_244_rich_chloride', 'Plutonium-244-Rich Chloride', 'Cloruro rico en plutonio-244'],
        ['plutonium_244_oxide', 'Plutonium-244 Oxide', 'Óxido de plutonio-244'],
        ['depleted_plutonium_oxide', 'Depleted Plutonium Oxide', 'Óxido de plutonio empobrecido'],
        ['mox_blend_powder', 'MOX Blend Powder', 'Polvo de mezcla MOX'],
        ['plutonium_nitrate', 'Plutonium Nitrate', 'Nitrato de plutonio'],
        ['curium_californium_nitrate', 'Curium-Californium Nitrate', 'Nitrato de curio y californio'],
        ['berkelium_californium_nitrate', 'Berkelium-Californium Nitrate', 'Nitrato de berkelio y californio'],
        ['curium_nitrate', 'Curium Nitrate', 'Nitrato de curio'],
        ['californium_nitrate', 'Californium Nitrate', 'Nitrato de californio'],
        ['berkelium_nitrate', 'Berkelium Nitrate', 'Nitrato de berkelio']
    ]

    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.calutron', 'Calutron', 'Calutrón'],
        ['gtceu.calutron_separation', 'Calutron Separation', 'Separación en calutrón'],

        ['grindless.machine.calutron.tooltip.0',
            'Y-12\'s calutron: an electromagnetic racetrack in a vacuum tank, a superconducting coil round the track and collector pockets. The ionised chloride splits by mass. The only route to calcium-48, potassium-40, lithium-6 and plutonium-244.',
            'El calutrón de Y-12: una pista electromagnética en un tanque de vacío, una bobina superconductora alrededor de la pista y bolsillos colectores. El cloruro ionizado se separa por masa. La única vía al calcio-48, potasio-40, litio-6 y plutonio-244.'],
        ['grindless.machine.calutron.tooltip.1',
            'Circuit 1: calcium pass 1 (40 %). 2: calcium pass 2 (97 %). 3: potassium-40. 4: lithium-6. 5: plutonium-244. 6: plutonium-242 for the high flux reactor. The depleted stream comes out as stock.',
            'Circuito 1: calcio, paso 1 (40 %). 2: calcio, paso 2 (97 %). 3: potasio-40. 4: litio-6. 5: plutonio-244. 6: plutonio-242 para el reactor de alto flujo. La corriente empobrecida sale como existencias.'],
        ['grindless.machine.calutron.tooltip.2',
            'It uses energy. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-3 output buses.',
            'Consume energía. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-3 buses de salida.'],
        ['grindless.machine.calutron.no_voiding',
            'Voiding is off: the depleted streams and the actinides must never be thrown away.',
            'El desecho está desactivado: las corrientes empobrecidas y los actínidos nunca deben tirarse.'],

        ['gtceu.recipe.grindless_calutron_separation.calcium_pass_1',
            'Circuit 1: calcium chloride to 40 % calcium-48; the depleted calcium chloride comes back as stock',
            'Circuito 1: cloruro de calcio a calcio-48 al 40 %; el cloruro de calcio empobrecido vuelve como existencias'],
        ['gtceu.recipe.grindless_calutron_separation.calcium_pass_2',
            'Circuit 2: second pass to 97 % calcium-48; the tail comes back as stock',
            'Circuito 2: segundo paso a calcio-48 al 97 %; la cola vuelve como existencias'],
        ['gtceu.recipe.grindless_calutron_separation.potassium_40',
            'Circuit 3: potassium-40 from potassium chloride; potassium-39 comes back as stock',
            'Circuito 3: potasio-40 del cloruro de potasio; el potasio-39 vuelve como existencias'],
        ['gtceu.recipe.grindless_calutron_separation.lithium_6',
            'Circuit 4: lithium-6 from lithium chloride; lithium-7 comes back as stock',
            'Circuito 4: litio-6 del cloruro de litio; el litio-7 vuelve como existencias'],
        ['gtceu.recipe.grindless_calutron_separation.plutonium_244',
            'Circuit 5: plutonium-244 from the 244-rich chloride; the depleted plutonium goes to the MOX blend',
            'Circuito 5: plutonio-244 del cloruro rico en 244; el plutonio empobrecido va a la mezcla MOX'],
        ['gtceu.recipe.grindless_calutron_separation.plutonium_242',
            'Circuit 6: plutonium-242 from plutonium oxide for the high flux reactor targets; the depleted plutonium goes to the MOX blend',
            'Circuito 6: plutonio-242 del óxido de plutonio para los blancos del reactor de alto flujo; el plutonio empobrecido va a la mezcla MOX'],

        ['gtceu.recipe.grindless_high_flux_irradiation.plutonium_target',
            'Circuit 4: a plutonium-242 oxide target irradiated by 6 uranium-233 drivers; the pool water is never used up',
            'Circuito 4: un blanco de óxido de plutonio-242 irradiado por 6 impulsores de uranio-233; el agua de la piscina nunca se gasta'],
        ['gtceu.recipe.grindless_transuranium_processing.plutonium_dissolve',
            'Circuit 7: the irradiated plutonium target dissolved in nitric acid; the fission products go apart',
            'Circuito 7: el blanco de plutonio irradiado se disuelve en ácido nítrico; los productos de fisión se apartan'],
        ['gtceu.recipe.grindless_transuranium_processing.curium_californium_cut',
            'Circuit 8: the transcurium liquor cut by HDEHP into curium-californium and berkelium-californium nitrate; the solvent is never used up',
            'Circuito 8: el licor de transcurio cortado con HDEHP en nitrato de curio-californio y de berkelio-californio; el disolvente nunca se gasta']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[1], i[2][0], i[3][0]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.0', i[2][1], i[3][1]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.1', i[2][2], i[3][2]])
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
