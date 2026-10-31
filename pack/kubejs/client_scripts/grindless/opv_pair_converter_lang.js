// priority: 5724
// Gregtech Grindless - names and tooltips of OpV's magnetic pair converter, its item and the package's older rows
// (startup_scripts/grindless/opv/pair_converter.js; package OpV-E1):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's one item
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.magnetic_pair_converter', 'Magnetic Pair Converter', 'Convertidor de pares magnético'],
        ['gtceu.magnetic_pair_production', 'Magnetic Pair Production', 'Producción de pares magnética'],

        ['grindless.machine.magnetic_pair_converter.tooltip.0',
            '\u00a77Converts gamma photons into dense positron plasma in a magnetar\'s field.',
            '\u00a77Convierte fotones gamma en positrones en el campo de un magnetar.'],
        ['grindless.machine.magnetic_pair_converter.tooltip.1',
            'Electrons to magnetosphere; split photons leave no item.',
            'Electrones a la magnetosfera; fotones sin objeto.'],
        ['grindless.machine.magnetic_pair_converter.tooltip.2',
            'Accepts wireless energy hatches.',
            'Acepta escotillas de energía inalámbrica.'],

        ['item.grindless.unsealed_positron_cell', 'Unsealed Positron Cell', 'Celda de positrones sin sellar'],
        ['tooltip.grindless.unsealed_positron_cell.0', 'A positron cell cooled out of the magnetar\'s hot pair plasma.', 'Una celda de positrones enfriada a partir del plasma de pares caliente del magnetar.'],
        ['tooltip.grindless.unsealed_positron_cell.1', 'Sealed with a fresh getter in the electron beam furnace (circuit 23).', 'Se sella con un captador nuevo en el horno de haz de electrones (circuito 23).'],

        ['emi.grindless.info.magnetic_pair_converter.0',
            'The seed plasma is UHV-A6\'s accumulator packed under a magnetar\'s field (circuit 5, positron accumulator): the converter runs only at SGR 1806-20 orbit. The gamma laser module times the field\'s pulse and wears out one run in sixteen; what the trap misses condenses back as an empty Penning trap nine times in ten.',
            'El plasma semilla es del acumulador de UHV-A6 empaquetado bajo el campo de un magnetar (circuito 5, acumulador de positrones): el convertidor solo funciona en la órbita de SGR 1806-20. El módulo láser gamma cronometra el pulso del campo y se desgasta una ejecución de cada dieciséis; lo que la trampa no retiene condensa de nuevo como una trampa de Penning vacía nueve veces de cada diez.'],
        ['emi.grindless.info.magnetic_pair_converter.2',
            'SGR 1806-20 has no absorber tile: the escaping electrons and the split gamma photons have no item here and are not voided into one, they simply leave the frame with the field\'s own losses.',
            'SGR 1806-20 no tiene loseta absorbente: los electrones que escapan y los fotones gamma divididos no tienen un objeto aquí y no se convierten en uno; simplemente salen del armazón con las propias pérdidas del campo.'],
        ['emi.grindless.info.magnetic_pair_converter.1',
            'The electron beam furnace seals the unsealed cell with a fresh zirconium getter (circuit 23). Dense positron cells feed the antihydrogen foundry (B3) and replication forge lines (D3); their consumers return traps at 90%.',
            'El horno de haz de electrones sella la celda con un captador nuevo de circonio (circuito 23). Las celdas densas alimentan la fundición de antihidrógeno (B3) y las líneas de la forja de replicación (D3); sus consumidores devuelven las trampas al 90%.'],

        ['emi.grindless.info.field_frozen_casing.0',
            'The Magnetic Pair Converter\'s structure block: field-frozen plate on a tungstensteel frame. Two come from the field-frozen press (circuit 3, OpV-A3) at SGR 1806-20 orbit. The converter is its only user for now; the kugelblitz forge (D3) will use it too.',
            'El bloque de estructura del Convertidor de Pares Magnético: placa congelada en campo sobre un armazón de acero de wolframio. Salen dos de la prensa de congelación en campo (circuito 3, OpV-A3) en la órbita de SGR 1806-20. Por ahora solo lo usa el convertidor; la forja kugelblitz (D3) también lo usará.'],

        ['gtceu.recipe.grindless_positron_accumulation.seed_plasma',
            'Circuit 5: a positron cartridge and an empty Penning trap are packed into a seed positron plasma for the magnetic pair converter.',
            'Circuito 5: un cartucho de positrones y una trampa de Penning vacía se empaquetan en un plasma de positrones semilla para el convertidor de pares magnético.'],
        ['gtceu.recipe.grindless_electron_beam.positron_cell_seal',
            'Circuit 23: an unsealed positron cell is sealed with a fresh zirconium getter into a dense positron cell.',
            'Circuito 23: una celda de positrones sin sellar se sella con un captador de circonio nuevo en una celda de positrones densa.'],
        ['gtceu.recipe.grindless_magnetic_pair_production.boil_seed_plasma',
            'Circuit 1: the magnetar\'s field boils a seed plasma into hot pair plasma; the gamma laser module wears out one run in sixteen. An empty Penning trap condenses back nine times in ten.',
            'Circuito 1: el campo del magnetar hierve un plasma semilla en plasma de pares caliente; el módulo láser gamma se desgasta una ejecución de cada dieciséis. Una trampa de Penning vacía condensa de vuelta nueve veces de cada diez.'],
        ['gtceu.recipe.grindless_magnetic_pair_production.seal_positron_cell',
            'Circuit 2: the hot pair plasma is loaded into an empty Penning trap and cooled into an unsealed positron cell.',
            'Circuito 2: el plasma de pares caliente se carga en una trampa de Penning vacía y se enfría en una celda de positrones sin sellar.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
