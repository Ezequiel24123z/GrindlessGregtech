// priority: 6700
// Gregtech Grindless - names and tooltips of MAX's cluster-light furnace (startup_scripts/grindless/max/furnace.js; package MAX-R1):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   item.grindless.nsc_planetesimal, tooltip.grindless.nsc_planetesimal.N   the item R1 registers (missed in F1's id list)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.cluster_light_furnace', 'Cluster-Light Furnace', 'Horno de luz de cúmulo'],
        ['gtceu.cluster_light_smelting', 'Cluster-Light Smelting', 'Fundición con luz de cúmulo'],
        ['item.grindless.nsc_planetesimal', 'NSC Planetesimal', 'Planetesimal del NSC'],
        ['tooltip.grindless.nsc_planetesimal.0', 'A metal-rich body from the belt of the nuclear star cluster.', 'Un cuerpo rico en metal del cinturón del cúmulo estelar nuclear.'],
        ['tooltip.grindless.nsc_planetesimal.1', 'Collected by the debris harvester at the NSC belt; smelted in the cluster-light furnace.', 'Lo recoge el recolector de escombros en el cinturón del NSC; se funde en el horno de luz de cúmulo.'],

        ['grindless.machine.cluster_light_furnace.tooltip.0',
            '\u00a77Smelts planetesimals in starlight. Only at the NSC belt.',
            '\u00a77Funde planetesimales con luz estelar. Solo en el cinturón NSC.'],

        ['emi.grindless.info.cluster_light_furnace.0',
            'Starlight from the cluster is focused into a bowl of mirror segments and smelts sixteen planetesimals into a metal-rich bloom, silicate slag and a little platinum-group residue. The residue goes to the platinum plant, the slag to the kiln, the bloom to the carbonyl refinery and the pellet line.',
            'La luz estelar del cúmulo se enfoca en un cuenco de segmentos de espejo y funde dieciséis planetesimales en una colada rica en metal, escoria de silicato y algo de residuo del grupo del platino. El residuo va a la planta de platino, la escoria al horno, la colada al refinador de carbonilos y a la línea de pellets.'],
        ['emi.grindless.info.cluster_light_furnace.1',
            'The hearth liner wears: each smelting has a 1 in 32 chance of consuming one sealed hearth liner. A worn liner can be relined into tantalum dust (circuit 5). Truss billets are also made from mirror shell scrap (circuit 4).',
            'El revestimiento del hogar se desgasta: cada fundición tiene una probabilidad de 1 entre 32 de consumir un revestimiento de hogar sellado. Un revestimiento gastado puede reciclarse a polvo de tántalo (circuito 5). Los tochos de cercha también se hacen con chatarra de casco de espejo (circuito 4).'],

        ['gtceu.recipe.grindless_cluster_light_smelting.metal_rich_bloom', 'Circuit 1: sixteen planetesimals become a metal-rich bloom, silicate slag and PGM residue; 1 in 32 consumes a hearth liner.',
            'Circuito 1: dieciséis planetesimales dan una colada rica en metal, escoria de silicato y residuo de PGM; 1 de cada 32 consume un revestimiento.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.segment_truss_billet', 'Circuit 2: segment alloy ingots are light-heated into truss billets.',
            'Circuito 2: los lingotes de aleación de segmento se calientan con luz hasta tochos de cercha.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.pellet_blank', 'Circuit 3: the bloom is cast into pellet blanks.',
            'Circuito 3: la colada se funde en pellets en bruto.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.mirror_scrap_billet', 'Circuit 4: mirror shell scrap is remelted into a truss billet.',
            'Circuito 4: la chatarra de casco de espejo se refunde en un tocho de cercha.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.hearth_relining', 'Circuit 5: a worn hearth liner is relined; its tantalum is recovered.',
            'Circuito 5: se rehace un revestimiento de hogar gastado; se recupera su tántalo.'],
        ['gtceu.recipe.grindless_closed_loop.cryo_milled_core', 'An iron core fragment is chilled to the brittle range and milled cold.',
            'Un fragmento de núcleo de hierro se enfría hasta quedar quebradizo y se muele en frío.'],
        ['gtceu.recipe.grindless_levitation_melting.segment_alloy_ingot', 'Circuit 19: carbonyl powder and cobalt are levitation-melted into segment alloy.',
            'Circuito 19: polvo carbonilo y cobalto se funden por levitación en aleación de segmento.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.halbach_segment_coupler', 'Circuit 20: cold-pressed tetrataenite and a Fe16N2 ring are bonded into a Halbach segment coupler.',
            'Circuito 20: tetrataenita prensada en frío y un anillo de Fe16N2 se unen en un acoplador de segmento Halbach.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sealed_hearth_liner', 'Circuit 15: a TaHfC billet is infiltrated with methane into a sealed hearth liner.',
            'Circuito 15: un tocho de TaHfC se infiltra con metano hasta un revestimiento de hogar sellado.'],
        ['gtceu.recipe.grindless_carbonyl_refining.bloom_carbonyl', 'Circuit 2: the bloom is carbonylated into Fe-Ni carbonyl powder; the CO is recycled.',
            'Circuito 2: la colada se carbonila en polvo carbonilo de Fe-Ni; el CO se recicla.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
