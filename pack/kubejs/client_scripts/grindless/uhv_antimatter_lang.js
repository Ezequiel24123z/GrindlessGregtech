// priority: 4846
// Gregtech Grindless - names and tooltips of UHV's antimatter and Casimir machines (startup_scripts/grindless/uhv/antimatter.js;
// package UHV-A6):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N, .no_voiding            controller tooltips; the accumulator's refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe (also the synchrotron's sodium_22 and the
//                                                                 antimatter trap's antihydrogen rows, server_scripts/grindless/uv/accelerators.js)
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items (the F1 items are in uhv_foundation_lang.js)
//   material.gtceu.high_purity_neon                               the cryogenic plant's 99.999 % neon
//   emi.grindless.info.casimir_array_fiction.0                    the array's EMI page (assets/emi/recipe/additions/grindless/
//                                                                 uhv_antimatter_casimir_fiction.json): what is real and what is fiction
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.positron_accumulator', 'Positron Accumulator', 'Acumulador de positrones'],
        ['gtceu.positron_accumulation', 'Positron Accumulation', 'Acumulación de positrones'],
        ['block.gtceu.casimir_array', 'Casimir Array', 'Matriz de Casimir'],
        ['gtceu.casimir_cavity', 'Casimir Cavities', 'Cavidades de Casimir'],

        ['grindless.machine.positron_accumulator.tooltip.0',
            'Sodium-22 emits positrons; a film of solid neon slows them and a Surko buffer-gas trap stacks them by the billion into a Penning trap (CERN\'s ALPHA and AEgIS). The only maker of positron cartridges.',
            'El sodio-22 emite positrones; una película de neón sólido los frena y una trampa de gas amortiguador de Surko los apila por miles de millones en una trampa de Penning (ALPHA y AEgIS del CERN). El único fabricante de cartuchos de positrones.'],
        ['grindless.machine.positron_accumulator.tooltip.1',
            'Circuit 1: moderated source (sodium-22 target under 99.999 % neon). 2: fill an empty Penning trap; the nitrogen buffer gas stays, the source wears out 1 run in 16. 3: strip a spent source: the neon back, the sodium-22 as radioactive waste.',
            'Circuito 1: fuente moderada (blanco de sodio-22 bajo neón al 99,999 %). 2: llena una trampa de Penning vacía; el nitrógeno amortiguador se queda, la fuente se gasta 1 vez de cada 16. 3: desmonta una fuente gastada: el neón vuelve, el sodio-22 sale como residuo radiactivo.'],
        ['grindless.machine.positron_accumulator.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, 1-2 output buses, an output hatch. Never voids its outputs. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, 1-2 buses de salida, una escotilla de salida. Nunca destruye sus salidas. Acepta una escotilla paralela.'],
        ['grindless.machine.positron_accumulator.no_voiding',
            'The spent source\'s radioactive waste and neon must leave through the output bus and hatch: turn output voiding off.',
            'El residuo radiactivo y el neón de la fuente gastada tienen que salir por el bus y la escotilla de salida: desactiva el vaciado de salidas.'],
        ['grindless.machine.casimir_array.tooltip.0',
            'Mirrors nanometres apart feel the Casimir force (measured by Lamoreaux in 1997). Harvesting it as exotic matter is fiction. Works only in Earth orbit. The only maker of exotic matter cells.',
            'Espejos a nanómetros de distancia sienten la fuerza de Casimir (medida por Lamoreaux en 1997). Cosecharla como materia exótica es ficción. Solo funciona en órbita terrestre. El único fabricante de celdas de materia exótica.'],
        ['grindless.machine.casimir_array.tooltip.1',
            'Circuit 1: a cavity stack of 7 NbN-coated SiC plates under helium II (the helium back). 2: harvest; a nuclear clock locks the phase, 16 stacks wear out together 1 run in 32. 3: strip a worn stack to its 7 mirror blanks for the MOCVD reactor.',
            'Circuito 1: una pila de cavidades de 7 placas de SiC recubiertas de NbN bajo helio II (el helio vuelve). 2: cosecha; un reloj nuclear fija la fase, 16 pilas se gastan juntas 1 vez de cada 32. 3: desmonta una pila gastada en sus 7 bloques de espejo para el reactor MOCVD.'],
        ['grindless.machine.casimir_array.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, an output bus, an output hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, un bus de salida, una escotilla de salida. Acepta una escotilla paralela.'],

        ['gtceu.recipe.grindless_positron_accumulation.moderated_source', 'Moderated positron source', 'Fuente de positrones moderada'],
        ['gtceu.recipe.grindless_positron_accumulation.accumulate', 'Accumulate positrons in a Penning trap', 'Acumular positrones en una trampa de Penning'],
        ['gtceu.recipe.grindless_positron_accumulation.strip_source', 'Strip a spent source', 'Desmontar una fuente gastada'],
        ['gtceu.recipe.grindless_casimir_cavity.cavity_stack', 'Build a cavity stack', 'Montar una pila de cavidades'],
        ['gtceu.recipe.grindless_casimir_cavity.harvest', 'Harvest exotic matter (fiction)', 'Cosechar materia exótica (ficción)'],
        ['gtceu.recipe.grindless_casimir_cavity.strip_stack', 'Strip a worn stack', 'Desmontar una pila gastada'],
        ['gtceu.recipe.grindless_synchrotron.sodium_22', 'Sodium-22 from magnesium-24 (d,α)', 'Sodio-22 a partir de magnesio-24 (d,α)'],
        ['gtceu.recipe.grindless_antimatter_storage.antihydrogen', 'Merge antiprotons and positrons into antihydrogen', 'Unir antiprotones y positrones en antihidrógeno'],

        ['item.grindless.magnesium_target', 'Magnesium-24 Target', 'Blanco de magnesio-24'],
        ['tooltip.grindless.magnesium_target.0',
            'Magnesium pressed on a copper backing; natural magnesium is 79 % magnesium-24.',
            'Magnesio prensado sobre un soporte de cobre; el magnesio natural es un 79 % magnesio-24.'],
        ['tooltip.grindless.magnesium_target.1',
            'The synchrotron\'s deuteron beam turns it into sodium-22.',
            'El haz de deuterones del sincrotrón lo convierte en sodio-22.'],
        ['item.grindless.sodium_22_target', 'Sodium-22 Target', 'Blanco de sodio-22'],
        ['tooltip.grindless.sodium_22_target.0',
            'A positron emitter with a 2.6-year half-life, the source of every positron trap.',
            'Un emisor de positrones con un periodo de 2,6 años, la fuente de toda trampa de positrones.'],
        ['tooltip.grindless.sodium_22_target.1',
            'The positron accumulator coats it with solid neon.',
            'El acumulador de positrones lo recubre de neón sólido.'],
        ['item.grindless.moderated_positron_source', 'Moderated Positron Source', 'Fuente de positrones moderada'],
        ['tooltip.grindless.moderated_positron_source.0',
            'Sodium-22 under a few microns of solid neon, which slows its positrons to a few electronvolts.',
            'Sodio-22 bajo unas micras de neón sólido, que frena sus positrones a unos pocos electronvoltios.'],
        ['tooltip.grindless.moderated_positron_source.1',
            'Fills Penning traps until it wears out (1 run in 16).',
            'Llena trampas de Penning hasta que se gasta (1 vez de cada 16).'],
        ['item.grindless.spent_positron_source', 'Spent Positron Source', 'Fuente de positrones gastada'],
        ['tooltip.grindless.spent_positron_source.0',
            'The moderator has crept away and the sodium-22 has decayed.',
            'El moderador se ha deslizado y el sodio-22 ha decaído.'],
        ['tooltip.grindless.spent_positron_source.1',
            'Strip it in the accumulator: the neon back, the rest as radioactive waste.',
            'Desmóntala en el acumulador: el neón vuelve, el resto sale como residuo radiactivo.'],
        ['item.grindless.empty_penning_trap', 'Empty Penning Trap', 'Trampa de Penning vacía'],
        ['tooltip.grindless.empty_penning_trap.0',
            'Gold electrodes inside a niobium-titanium solenoid, in a titanium can.',
            'Electrodos de oro dentro de un solenoide de niobio-titanio, en una lata de titanio.'],
        ['tooltip.grindless.empty_penning_trap.1',
            'The positron accumulator fills it.',
            'El acumulador de positrones la llena.'],
        ['item.grindless.casimir_cavity_stack', 'Casimir Cavity Stack', 'Pila de cavidades de Casimir'],
        ['tooltip.grindless.casimir_cavity_stack.0',
            'Seven superconducting mirrors held nanometres apart at 2 K.',
            'Siete espejos superconductores separados nanómetros a 2 K.'],
        ['tooltip.grindless.casimir_cavity_stack.1',
            'The Casimir array harvests sixteen at a time.',
            'La matriz de Casimir cosecha dieciséis a la vez.'],
        ['item.grindless.worn_casimir_cavity_stack', 'Worn Casimir Cavity Stack', 'Pila de cavidades de Casimir gastada'],
        ['tooltip.grindless.worn_casimir_cavity_stack.0',
            'The niobium nitride coating has pitted.',
            'El recubrimiento de nitruro de niobio se ha picado.'],
        ['tooltip.grindless.worn_casimir_cavity_stack.1',
            'Strip it in the array: the seven mirror blanks go back to the MOCVD reactor.',
            'Desmóntala en la matriz: los siete bloques de espejo vuelven al reactor MOCVD.'],

        ['material.gtceu.high_purity_neon', '99.999 % Neon', 'Neón al 99,999 %'],

        ['emi.grindless.info.casimir_array_fiction.0',
            'Real: the Casimir force between mirrors nanometres apart (predicted in 1948, measured by Lamoreaux in 1997). Fiction: harvesting it as exotic matter with negative energy density in quantities that could hold a wormhole open (Morris and Thorne, 1988). The array is the one labelled fiction of the UHV era.',
            'Real: la fuerza de Casimir entre espejos a nanómetros de distancia (predicha en 1948, medida por Lamoreaux en 1997). Ficción: cosecharla como materia exótica con densidad de energía negativa en cantidades que mantendrían abierto un agujero de gusano (Morris y Thorne, 1988). La matriz es la ficción declarada de la era UHV.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
