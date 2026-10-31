// priority: 5696
// Gregtech Grindless - names and tooltips of OpV's replication chain (startup_scripts/grindless/opv/replication.js; package OpV-R2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's items
//   material.grindless.<id>                            the package's fluid
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.debris_harvester', 'Debris Harvester', 'Cosechadora de escombros'],
        ['gtceu.debris_harvesting', 'Debris Harvesting', 'Cosecha de escombros'],
        ['grindless.machine.debris_harvester.tooltip.0',
            '\u00a77Gathers bulge debris around Terzan 5 and sorts it into fractions.',
            '\u00a77Recoge escombros del bulbo en Terzan 5 y los separa en fracciones.'],

        ['item.grindless.metal_debris_fraction', 'Metal Debris Fraction', 'Fracción metálica de escombros'],
        ['tooltip.grindless.metal_debris_fraction.0', 'The iron and nickel grains sorted out of bulge debris.', 'Los granos de hierro y níquel separados de los escombros del bulbo.'],
        ['tooltip.grindless.metal_debris_fraction.1', 'Refined through carbonyl in the replication refinery.', 'Se refina como carbonilo en la refinería de replicación.'],

        ['emi.grindless.info.debris_harvester.0',
            'The harvester runs only at Terzan 5 core. Its first run needs no input: a sensor head is its only tool and is never used up, so the first debris is gathered without any supply from home. Harvesting debris from a bulge is named fiction.',
            'La cosechadora funciona solo en el núcleo de Terzan 5. Su primera pasada no necesita entrada: un cabezal sensor es su única herramienta y no se gasta, así que los primeros escombros se recogen sin suministro desde casa. Cosechar escombros de un bulbo es ficción declarada.'],
        ['emi.grindless.info.debris_harvester.1',
            'Circuit 2 sorts four bulge debris into two metal and two silicate fractions; the refinery turns them into feedstock and casings.',
            'El circuito 2 separa cuatro escombros del bulbo en dos fracciones metálicas y dos silicatadas; la refinería las convierte en materia prima y carcasas.'],

        ['gtceu.recipe.grindless_debris_harvesting.bulge_debris_harvest',
            'Circuit 1: four bulge debris gathered with a sensor head that is not consumed.',
            'Circuito 1: cuatro escombros del bulbo recogidos con un cabezal sensor que no se consume.'],
        ['gtceu.recipe.grindless_debris_harvesting.debris_fractions',
            'Circuit 2: four bulge debris sorted into two metal and two silicate fractions.',
            'Circuito 2: cuatro escombros del bulbo separados en dos fracciones metálicas y dos silicatadas.'],

        ['block.gtceu.replication_refinery', 'Replication Refinery', 'Refinería de replicación'],
        ['gtceu.replication_refining', 'Replication Refining', 'Refinado de replicación'],
        ['grindless.machine.replication_refinery.tooltip.0',
            '\u00a77Turns debris fractions into feedstock and casings: Mond carbonyl and FFC salt.',
            '\u00a77Escombros a materia prima y carcasas: carbonilo Mond y sal FFC.'],
        ['material.grindless.metal_carbonyl', 'Metal Carbonyl', 'Carbonilo metálico'],

        ['item.grindless.carbonyl_iron_nickel', 'Carbonyl Iron-Nickel Powder', 'Polvo carbonilo de hierro y níquel'],
        ['tooltip.grindless.carbonyl_iron_nickel.0', 'Fine powder from the decomposed metal carbonyl.', 'Polvo fino del carbonilo metálico descompuesto.'],
        ['tooltip.grindless.carbonyl_iron_nickel.1', 'Sintered into metal feedstock for the foundry.', 'Se sinteriza en materia prima metálica para la fundición.'],
        ['item.grindless.ffc_pellet', 'FFC Pellet', 'Pellet FFC'],
        ['tooltip.grindless.ffc_pellet.0', 'Pressed silicate debris, ready for the molten salt bath.', 'Escombros silicatados prensados, listos para el baño de sal fundida.'],
        ['tooltip.grindless.ffc_pellet.1', 'Reduced to silicon alloy powder at the anode.', 'Se reduce a polvo de aleación de silicio en el ánodo.'],
        ['item.grindless.spent_graphite_anode', 'Spent Graphite Anode', 'Ánodo de grafito gastado'],
        ['tooltip.grindless.spent_graphite_anode.0', 'A worn anode from the FFC salt bath.', 'Un ánodo desgastado del baño de sal FFC.'],
        ['tooltip.grindless.spent_graphite_anode.1', 'The methane pyrolyser cracks it back into graphene.', 'El pirolizador de metano lo craquea de nuevo en grafeno.'],

        ['emi.grindless.info.replication_refinery.0',
            'Two cells in one plant. The carbonyl cell binds metal fractions with carbon monoxide, then decomposes the carbonyl into powder and returns 90% of the gas; the powder sinters into feedstock.',
            'Dos celdas en una planta. La celda de carbonilo une las fracciones metálicas con monóxido de carbono y luego descompone el carbonilo en polvo devolviendo el 90% del gas; el polvo se sinteriza en materia prima.'],
        ['emi.grindless.info.replication_refinery.1',
            'The salt cell presses silicate pellets, turns them into silicon alloy powder at graphite anodes (oxygen is the by-product, the spent anodes go to the methane pyrolyser) and sinters cluster casings.',
            'La celda de sal prensa pellets silicatados, los convierte en polvo de aleación de silicio en ánodos de grafito (el oxígeno es subproducto, los ánodos gastados van al pirolizador de metano) y sinteriza carcasas de cúmulo.'],

        ['gtceu.recipe.grindless_replication_refining.metal_carbonyl_synthesis', 'Circuit 1: metal fraction and carbon monoxide bound into carbonyl.', 'Circuito 1: fracción metálica y monóxido de carbono unidos en carbonilo.'],
        ['gtceu.recipe.grindless_replication_refining.carbonyl_decomposition', 'Circuit 2: carbonyl decomposed into powder; 90% of the gas returns.', 'Circuito 2: carbonilo descompuesto en polvo; vuelve el 90% del gas.'],
        ['gtceu.recipe.grindless_replication_refining.metal_feedstock_sinter', 'Circuit 3: iron-nickel powder sintered into metal feedstock.', 'Circuito 3: polvo de hierro y níquel sinterizado en materia prima metálica.'],
        ['gtceu.recipe.grindless_replication_refining.ffc_pellet_press', 'Circuit 4: silicate fractions pressed into FFC pellets.', 'Circuito 4: fracciones silicatadas prensadas en pellets FFC.'],
        ['gtceu.recipe.grindless_replication_refining.ffc_salt_bath', 'Circuit 5: pellets reduced at graphite anodes into silicon alloy powder, oxygen and spent anodes.', 'Circuito 5: pellets reducidos en ánodos de grafito a polvo de aleación de silicio, oxígeno y ánodos gastados.'],
        ['gtceu.recipe.grindless_replication_refining.cluster_casing_sinter', 'Circuit 6: silicon alloy powder sintered into cluster casings.',         'Circuito 6: polvo de aleación de silicio sinterizado en carcasas de cúmulo.'],

        ['block.gtceu.von_neumann_foundry', 'Von Neumann Foundry', 'Fundición de von Neumann'],
        ['gtceu.self_replication', 'Self-Replication', 'Autorreplicación'],
        ['grindless.machine.von_neumann_foundry.tooltip.0',
        '\u00a77Builds probe seeds from Terzan 5 feedstock; the seed itself is never used up.',
        '\u00a77Crea semillas de sonda con materia prima; la semilla no se gasta.'],
        ['emi.grindless.info.von_neumann_foundry.0',
        'A probe copies itself only with real material: 16 metal feedstock, 8 cluster casings and a vitamin kit from home. The seed is kept in circuit 1 and two seeds come out; nothing is copied from nothing.',
        'Una sonda solo se copia con material real: 16 de materia prima metálica, 8 carcasas de cúmulo y un kit de vitaminas del origen. La semilla se conserva en el circuito 1 y salen dos semillas; nada se copia de la nada.'],
        ['emi.grindless.info.von_neumann_foundry.1',
        'Circuit 2 turns a pathfinder probe core and the same feedstock into one seed.',
        'El circuito 2 convierte un núcleo de sonda exploradora y la misma materia prima en una semilla.'],
        ['gtceu.recipe.grindless_self_replication.probe_self_copy', 'Circuit 1: the seed is kept; feedstock, casings and a vitamin kit make a second seed.', 'Circuito 1: la semilla se conserva; materia prima, carcasas y un kit de vitaminas hacen una segunda semilla.'],
        ['gtceu.recipe.grindless_self_replication.probe_core_seed', 'Circuit 2: a pathfinder probe core and the same feedstock make one seed.', 'Circuito 2: un núcleo de sonda exploradora y la misma materia prima hacen una semilla.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
