// priority: 5849
// Gregtech Grindless - names and tooltips of OpV's collector nodes and bulge collector (startup_scripts/grindless/opv/bulge_collector.js; package OpV-R3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe (and refinery c7)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.collector_node_works', 'Collector Node Works', 'Taller de nodos colectores'],
        ['gtceu.collector_node_assembly', 'Collector Node Assembly', 'Montaje de nodos colectores'],
        ['grindless.machine.collector_node_works.tooltip.0',
            '\u00a77Makes collector nodes and packs them with a probe seed.',
            '\u00a77Hace nodos colectores y los empaqueta con una semilla.'],
        ['emi.grindless.info.collector_node_works.0',
            'The works runs only at Terzan 5 core. Circuits 1 and 2 draw Si alloy powder into ribbon and lay it on a silicate fraction as a PV film; circuit 3 joins two films, a node power transmitter and a cluster casing into a collector node.',
            'El taller funciona solo en el n\u00facleo de Terzan 5. Los circuitos 1 y 2 estiran polvo de aleaci\u00f3n de Si en cinta y la depositan sobre una fracci\u00f3n silicatada como pel\u00edcula PV; el circuito 3 une dos pel\u00edculas, un transmisor de energ\u00eda de nodo y una carcasa de c\u00famulo en un nodo colector.'],
        ['emi.grindless.info.collector_node_works.1',
            'Circuit 4 packs four nodes and one probe seed into a deployed node pack. The pack is used up by the bulge collector; the spent nodes come back as Si alloy powder in the replication refinery (circuit 7), half of what they held.',
            'El circuito 4 empaqueta cuatro nodos y una semilla de sonda en un paquete de nodos desplegado. El colector del bulbo lo consume; los nodos gastados vuelven como polvo de aleaci\u00f3n de Si en la refiner\u00eda de replicaci\u00f3n (circuito 7), la mitad de lo que ten\u00edan.'],

        ['item.grindless.si_ribbon', 'Si Ribbon', 'Cinta de Si'],
        ['tooltip.grindless.si_ribbon.0', 'A thin ribbon drawn from Si alloy powder.', 'Una cinta fina estirada de polvo de aleaci\u00f3n de Si.'],
        ['tooltip.grindless.si_ribbon.1', 'Two of them make one PV collector film.', 'Dos de ellas hacen una pel\u00edcula colectora PV.'],
        ['item.grindless.pv_collector_film', 'PV Collector Film', 'Pel\u00edcula colectora PV'],
        ['tooltip.grindless.pv_collector_film.0', 'Ribbon laid on a silicate fraction to catch bulge light.', 'Cinta depositada sobre una fracci\u00f3n silicatada para captar la luz del bulbo.'],
        ['tooltip.grindless.pv_collector_film.1', 'Two films make one collector node.', 'Dos pel\u00edculas hacen un nodo colector.'],

        ['gtceu.recipe.grindless_collector_node_assembly.node_si_ribbon', 'Circuit 1: Si alloy powder drawn into ribbon.', 'Circuito 1: polvo de aleaci\u00f3n de Si estirado en cinta.'],
        ['gtceu.recipe.grindless_collector_node_assembly.node_pv_film', 'Circuit 2: two ribbons laid on a silicate fraction make a PV film.', 'Circuito 2: dos cintas sobre una fracci\u00f3n silicatada hacen una pel\u00edcula PV.'],
        ['gtceu.recipe.grindless_collector_node_assembly.collector_node_assembly', 'Circuit 3: two films, a transmitter and a casing make a collector node.', 'Circuito 3: dos pel\u00edculas, un transmisor y una carcasa hacen un nodo colector.'],
        ['gtceu.recipe.grindless_collector_node_assembly.node_pack_deploy', 'Circuit 4: four nodes and a probe seed make a deployed node pack.', 'Circuito 4: cuatro nodos y una semilla de sonda hacen un paquete de nodos desplegado.'],
        ['gtceu.recipe.grindless_replication_refining.spent_node_recovery', 'Circuit 7: four spent nodes give back eight Si alloy powder, half of their silicon.', 'Circuito 7: cuatro nodos gastados devuelven ocho polvos de aleaci\u00f3n de Si, la mitad de su silicio.'],

        ['block.gtceu.bulge_collector', 'Bulge Collector', 'Colector del bulbo'],
        ['gtceu.bulge_light_collection', 'Bulge Light Collection', 'Captaci\u00f3n de luz del bulbo'],
        ['grindless.machine.bulge_collector.tooltip.0',
            '\u00a77Turns deployed node packs into power; the packs are used up.',
            '\u00a77Convierte paquetes de nodos en energ\u00eda; se consumen.'],
        ['grindless.machine.bulge_collector.tooltip.1',
            '\u00a77Needs one OpV 4 A dynamo hatch.',
            '\u00a77Necesita un hatch din\u00e1mo OpV de 4 A.'],
        ['emi.grindless.info.bulge_collector.0',
            'One, four or sixteen deployed node packs (circuits 1 to 3) give 2^26, 2^28 or 2^30 EU/t over the same long run on one OpV 4 A dynamo hatch. Each pack costs a whole probe seed, four nodes and their silicon, so the run pays back about one and a half times what a pack cost; the spent nodes return half of their silicon (refinery circuit 7).',
            'Uno, cuatro o diecis\u00e9is paquetes de nodos desplegados (circuitos 1 a 3) dan 2^26, 2^28 o 2^30 EU/t durante la misma tirada larga en un hatch din\u00e1mo OpV de 4 A. Cada paquete cuesta una semilla de sonda entera, cuatro nodos y su silicio, as\u00ed que la tirada devuelve unas una vez y media lo que cost\u00f3 un paquete; los nodos gastados devuelven la mitad de su silicio (refiner\u00eda, circuito 7).'],
        ['emi.grindless.info.bulge_collector.1',
            'Sixteen packs at once also yield one bulge light census, the survey a later site needs. Runs only at Terzan 5 core.',
            'Diecis\u00e9is paquetes a la vez dan adem\u00e1s un censo de luz del bulbo, el estudio que necesita un sitio posterior. Solo funciona en el n\u00facleo de Terzan 5.'],
        ['gtceu.recipe.grindless_bulge_light_collection.bulge_light_1', 'Circuit 1: one pack, 2^26 EU/t; four spent nodes return.', 'Circuito 1: un paquete, 2^26 EU/t; vuelven cuatro nodos gastados.'],
        ['gtceu.recipe.grindless_bulge_light_collection.bulge_light_4', 'Circuit 2: four packs, 2^28 EU/t; sixteen spent nodes return.', 'Circuito 2: cuatro paquetes, 2^28 EU/t; vuelven diecis\u00e9is nodos gastados.'],
        ['gtceu.recipe.grindless_bulge_light_collection.bulge_light_16', 'Circuit 3: sixteen packs, 2^30 EU/t; a bulge light census and sixty-four spent nodes.', 'Circuito 3: diecis\u00e9is paquetes, 2^30 EU/t; un censo de luz del bulbo y sesenta y cuatro nodos gastados.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
