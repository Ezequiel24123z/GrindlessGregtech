// Gregtech Grindless - names and tooltips of UV's thorium line (startup_scripts/grindless/uv/thorium.js; package UV-A1):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.u233_fuel_rod, tooltip.grindless.u233_fuel_rod.0/.1
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.pyroprocessing_cell', 'Pyroprocessing Cell', 'Celda de pirorrefinado'],
        ['gtceu.pyroprocessing', 'Pyroprocessing', 'Pirorrefinado'],
        ['block.gtceu.accelerator_driven_reactor', 'Accelerator-Driven Reactor', 'Reactor impulsado por acelerador'],
        ['gtceu.accelerator_driven', 'Accelerator-Driven Reactor', 'Reactor impulsado por acelerador'],

        ['grindless.machine.pyroprocessing_cell.tooltip.0',
            'The molten-salt pyroprocess of EBR-II: spent thorium fuel is reduced with lithium in a LiCl bath and the uranium-233 is collected on a cathode.',
            'El pirorrefinado en sal fundida de EBR-II: el combustible de torio gastado se reduce con litio en un baño de LiCl y el uranio-233 se recoge en un cátodo.'],
        ['grindless.machine.pyroprocessing_cell.tooltip.1',
            'Circuit 1: spent oxide fuel to thorium-uranium metal. 2: the metal to uranium-233 and thorium. 3: spent nitride fuel to uranium-233, thorium and nitrogen-15 (5 % N-14 make-up). 4: the loaded salt cleaned; its waste goes to the waste retrieval plant.',
            'Circuito 1: combustible de óxido gastado a metal de torio y uranio. 2: el metal a uranio-233 y torio. 3: combustible de nitruro gastado a uranio-233, torio y nitrógeno-15 (reemplazo del 5 % de N-14). 4: la sal cargada se limpia; su residuo va a la planta de recuperación de residuos.'],
        ['grindless.machine.pyroprocessing_cell.tooltip.2',
            'The salt and the lithium are charges that are never used up. Parts go in the bottom layer: 1-2 energy hatches, an input bus, 1-2 input hatches, 1-2 output buses, 1-2 output hatches.',
            'La sal y el litio son cargas que nunca se gastan. Las piezas van en la capa inferior: 1-2 escotillas de energía, un bus de entrada, 1-2 escotillas de entrada, 1-2 buses de salida, 1-2 escotillas de salida.'],
        ['grindless.machine.pyroprocessing_cell.no_voiding',
            'Voiding is off: the waste and the salt must never be thrown away.',
            'El desecho está desactivado: el residuo y la sal nunca deben tirarse.'],

        ['grindless.machine.accelerator_driven_reactor.tooltip.0',
            'A subcritical thorium core driven by a proton beam on a lead-bismuth target, as in MYRRHA and Rubbia\'s energy amplifier. It gives 1,572,864 EU/t and cannot run away: with the beam off, it stops.',
            'Un núcleo subcrítico de torio impulsado por un haz de protones sobre un blanco de plomo-bismuto, como en MYRRHA y el amplificador de energía de Rubbia. Da 1 572 864 EU/t y no puede desbocarse: sin el haz, se detiene.'],
        ['grindless.machine.accelerator_driven_reactor.tooltip.1',
            'One thorium oxide assembly burns for 12,000 ticks; a nitride one for 16,000. The lead-bismuth charge is never used up; the target\'s polonium-210 stays in the output hatch. Four SRF cryomodules in the back wall carry the beam.',
            'Un ensamblaje de óxido de torio arde 12 000 ticks; uno de nitruro, 16 000. La carga de plomo-bismuto nunca se gasta; el polonio-210 del blanco se queda en la escotilla de salida. Cuatro criomódulos SRF en la pared trasera llevan el haz.'],
        ['grindless.machine.accelerator_driven_reactor.tooltip.2',
            'The spent assembly goes to the pyroprocessing cell. Parts go in the bottom layer: 1-4 energy output hatches, an input bus, an input hatch, an output bus, an output hatch.',
            'El ensamblaje gastado va a la celda de pirorrefinado. Las piezas van en la capa inferior: 1-4 escotillas de salida de energía, un bus de entrada, una escotilla de entrada, un bus de salida, una escotilla de salida.'],
        ['grindless.machine.accelerator_driven_reactor.no_voiding',
            'Voiding is off: the spent fuel and the polonium must never be thrown away.',
            'El desecho está desactivado: el combustible gastado y el polonio nunca deben tirarse.'],

        ['gtceu.recipe.grindless_pyroprocessing.reduce',
            'Circuit 1: spent oxide fuel reduced with lithium to thorium-uranium metal; the LiCl and the lithium are never used up',
            'Circuito 1: combustible de óxido gastado reducido con litio a metal de torio y uranio; el LiCl y el litio nunca se gastan'],
        ['gtceu.recipe.grindless_pyroprocessing.refine',
            'Circuit 2: the metal electrorefined to uranium-233 and thorium; the salt takes up the rest',
            'Circuito 2: el metal se electrorrefina a uranio-233 y torio; la sal retiene el resto'],
        ['gtceu.recipe.grindless_pyroprocessing.nitride',
            'Circuit 3: spent nitride fuel to uranium-233, thorium and nitrogen-15, with a 5 % nitrogen-14 make-up',
            'Circuito 3: combustible de nitruro gastado a uranio-233, torio y nitrógeno-15, con un reemplazo del 5 % de nitrógeno-14'],
        ['gtceu.recipe.grindless_pyroprocessing.salt',
            'Circuit 4: the loaded salt cleaned back to LiCl; its waste goes to the waste retrieval plant',
            'Circuito 4: la sal cargada se limpia a LiCl; su residuo va a la planta de recuperación de residuos'],
        ['gtceu.recipe.grindless_accelerator_driven.thorium_oxide',
            'A thorium oxide assembly burns for 12,000 ticks; the lead-bismuth charge is never used up',
            'Un ensamblaje de óxido de torio arde 12 000 ticks; la carga de plomo-bismuto nunca se gasta'],
        ['gtceu.recipe.grindless_accelerator_driven.thorium_nitride',
            'A thorium nitride assembly burns for 16,000 ticks; the lead-bismuth charge is never used up',
            'Un ensamblaje de nitruro de torio arde 16 000 ticks; la carga de plomo-bismuto nunca se gasta'],

        ['item.grindless.u233_fuel_rod', 'Uranium-233 Fuel Rod', 'Barra de combustible de uranio-233'],
        ['tooltip.grindless.u233_fuel_rod.0', 'Uranium-233 slugs sodium-bonded in zircaloy tubes.', 'Pastillas de uranio-233 unidas con sodio en tubos de zircaloy.'],
        ['tooltip.grindless.u233_fuel_rod.1', 'Made by the fuel fabrication plant (circuit 6). The fission reactor can burn it once its core table lists it.', 'La fabrica la planta de fabricación de combustible (circuito 6). El reactor de fisión podrá quemarla cuando su tabla de núcleos la incluya.'],

        ['material.gtceu.triton_nitric_oxide', 'Triton Nitric Oxide', 'Óxido nítrico de Tritón'],
        ['material.gtceu.lead_bismuth_eutectic', 'Lead-Bismuth Eutectic', 'Eutéctico de plomo y bismuto'],
        ['material.gtceu.polonium_210', 'Polonium-210', 'Polonio-210'],
        ['material.gtceu.thorium_uranium_metal', 'Thorium-Uranium Metal', 'Metal de torio y uranio'],
        ['material.gtceu.licl_salt', 'Molten Lithium Chloride', 'Cloruro de litio fundido'],
        ['material.gtceu.loaded_licl_salt', 'Loaded Lithium Chloride Salt', 'Sal de cloruro de litio cargada']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
