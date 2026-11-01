// priority: 6574
// Gregtech Grindless - names and tooltips of MAX's mirror shell (startup_scripts/grindless/max/shell.js; package MAX-G1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.mirror_shell', 'Mirror Shell', 'Envoltura de espejos'],
        ['gtceu.black_hole_bomb', 'Black Hole Bomb', 'Bomba de agujero negro'],
        ['grindless.machine.mirror_shell.tooltip.0', '\u00a77A mirror shell round Sgr A*: its last recipe stabilises the horizon.', '\u00a77Envoltura de espejos en Sgr A*: su \u00faltima receta estabiliza el horizonte.'],
        ['emi.grindless.info.epilogue.0', 'The epilogue book. It is given at the arrival at the end of MAX+; it is not crafted.', 'El libro del ep\u00edlogo. Se entrega en la llegada al final de MAX+; no se fabrica.'],
        ['emi.grindless.info.mirror_shell_segment.0', 'A structure block: one segment of the mirror shell. Made in the swarm segment foundry; it takes no circuit.', 'Un bloque de estructura: un segmento de la envoltura de espejos. Se fabrica en la fundici\u00f3n de segmentos de enjambre; no lleva circuito.'],
        ['emi.grindless.info.stream_bundle_block.0', 'A structure block: the stream bundle block rings of the mirror shell (two rings, y 8 and 24). Made in the assembler.', 'Un bloque de estructura: los anillos de bloques de haz de corrientes de la envoltura de espejos (dos anillos, y 8 y 24). Se fabrica en el ensamblador.'],
        ['emi.grindless.info.mirror_shell.0', 'A hollow shell 33 blocks across of mirror shell segments with stream bundle block rings, built at Sgr A* (black hole orbit). The controller sits in the middle of the front face; the hatches are in the two rows beside it: two MAX energy input hatches (16 A), one or two dynamo hatches and the item buses.', 'Una c\u00e1scara hueca de 33 bloques de segmentos de envoltura de espejos con anillos de haces de corrientes, construida en Sgr A* (\u00f3rbita del agujero negro). El controlador est\u00e1 en el centro de la cara frontal; las escotillas van en las dos filas junto a \u00e9l: dos escotillas de entrada de energ\u00eda MAX (16 A), una o dos de dinamo y los buses de objetos.'],
        ['emi.grindless.info.mirror_shell.1', 'Circuit 1 vents a seed wave packet into 2^30 EU/t for 4,800 ticks; the spent packet is inert (the wave leaves as light). Circuit 2 charts the final spin map. The segments are made on the swarm segment foundry; the shell takes none of its own products.', 'El circuito 1 libera un paquete de ondas semilla como 2^30 EU/t durante 4.800 ticks; el paquete agotado es inerte (la onda se va como luz). El circuito 2 traza el mapa de esp\u00edn final. Los segmentos se hacen en la fundici\u00f3n de segmentos del enjambre; la envoltura no toma ninguno de sus productos.'],
        ['emi.grindless.info.mirror_shell.2', 'Circuit 3 is the last recipe of MAX, the horizon stabilisation: 2^35 EU/t for 1,200 ticks on two MAX 16 A hatches turns 4 seed wave packets, 64 stream bundles, the final spin map, the cloud phase map, 16 horizon phase locks, 8 horizon flux clamps and a Rydberg logic array into the horizon lock, the spent array and 16 spent phase locks. Its first output opens MAX+ (the maxplus stage). The shell stays and the recipe can be repeated: MAX+ consumes more locks.', 'El circuito 3 es la \u00faltima receta de MAX, la estabilizaci\u00f3n del horizonte: 2^35 EU/t durante 1.200 ticks con dos escotillas MAX de 16 A convierte 4 paquetes de ondas semilla, 64 haces de corrientes, el mapa de esp\u00edn final, el mapa de fase de la nube, 16 bloqueos de fase del horizonte, 8 abrazaderas de flujo del horizonte y una matriz l\u00f3gica de Rydberg en el cerrojo del horizonte, la matriz agotada y 16 bloqueos de fase agotados. Su primera salida abre MAX+ (la etapa maxplus). La envoltura permanece y la receta se puede repetir: MAX+ consume m\u00e1s cerrojos.'],
        ['gtceu.recipe.grindless_black_hole_bomb.vent_wave_packet', 'Circuit 1: a seed wave packet grows between the mirrors and is vented as 2^30 EU/t; the spent packet is inert.', 'Circuito 1: un paquete de ondas semilla crece entre los espejos y se libera como 2^30 EU/t; el paquete agotado es inerte.'],
        ['gtceu.recipe.grindless_black_hole_bomb.final_spin_map', 'Circuit 2: the Sgr A* spin map and the shell gradient map are joined into the final spin map.', 'Circuito 2: el mapa de esp\u00edn de Sgr A* y el mapa de gradiente de la envoltura se unen en el mapa de esp\u00edn final.'],
        ['gtceu.recipe.grindless_black_hole_bomb.horizon_lock', 'Circuit 3: the last recipe of MAX. 2^35 EU/t on two MAX 16 A hatches; the structure stays and the first lock opens MAX+.', 'Circuito 3: la \u00faltima receta de MAX. 2^35 EU/t con dos escotillas MAX de 16 A; la estructura permanece y el primer cerrojo abre MAX+.'],
        ['gtceu.recipe.grindless_nuclear_clock.thorium_clock_reference', 'Circuit 6: a thorium-229 sample and a VUV optic are read against the nuclear clock (kept) into a frequency reference.', 'Circuito 6: una muestra de torio-229 y una \u00f3ptica VUV se leen contra el reloj nuclear (se conserva) para dar una referencia de frecuencia.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cooled_cavity_mode', 'Circuit 10: a polished SRF cavity is cooled in the mK module and its mode characterised (the module and He-3/He-4 mixture are kept).', 'Circuito 10: una cavidad de SRF pulida se enfr\u00eda en el m\u00f3dulo de mK y se caracteriza su modo (el m\u00f3dulo y la mezcla He-3/He-4 se conservan).'],
        ['gtceu.recipe.grindless_kugelblitz_forming.write_seed_wave_packet', 'Circuit 6: at Cygnus X-1 a Kugelblitz seed pumps a cooled cavity mode into a seed wave packet.', 'Circuito 6: en Cygnus X-1 una semilla de Kugelblitz bombea un modo de cavidad enfriado y lo convierte en un paquete de ondas semilla.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
