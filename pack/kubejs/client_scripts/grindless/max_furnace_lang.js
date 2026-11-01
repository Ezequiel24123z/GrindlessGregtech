// priority: 6716
// Gregtech Grindless - names and tooltips of MAX's cluster-light furnace (startup_scripts/grindless/max/furnace.js; package MAX-R1):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   item.grindless.nsc_planetesimal, tooltip.grindless.nsc_planetesimal.N   the item R1 registers (missed in F1's id list)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.cluster_light_furnace', 'Cluster-Light Furnace'],
        ['gtceu.cluster_light_smelting', 'Cluster-Light Smelting'],
        ['item.grindless.nsc_planetesimal', 'NSC Planetesimal'],
        ['tooltip.grindless.nsc_planetesimal.0', 'A metal-rich body from the belt of the nuclear star cluster.'],
        ['tooltip.grindless.nsc_planetesimal.1', 'Collected by the debris harvester at the NSC belt; smelted in the cluster-light furnace.'],

        ['grindless.machine.cluster_light_furnace.tooltip.0',
            '\u00a77Smelts planetesimals in starlight. Only at the NSC belt.'],

        ['emi.grindless.info.cluster_light_furnace.0',
            'Starlight from the cluster is focused into a bowl of mirror segments and smelts sixteen planetesimals into a metal-rich bloom, silicate slag and a little platinum-group residue. The residue goes to the platinum plant, the slag to the kiln, the bloom to the carbonyl refinery and the pellet line.'],
        ['emi.grindless.info.cluster_light_furnace.1',
            'The hearth liner wears: each smelting has a 1 in 32 chance of consuming one sealed hearth liner. A worn liner can be relined into tantalum dust (circuit 5). Truss billets are also made from mirror shell scrap (circuit 4).'],

        ['gtceu.recipe.grindless_cluster_light_smelting.metal_rich_bloom', 'Circuit 1: sixteen planetesimals become a metal-rich bloom, silicate slag and PGM residue; 1 in 32 consumes a hearth liner.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.segment_truss_billet', 'Circuit 2: segment alloy ingots are light-heated into truss billets.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.pellet_blank', 'Circuit 3: the bloom is cast into pellet blanks.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.mirror_scrap_billet', 'Circuit 4: mirror shell scrap is remelted into a truss billet.'],
        ['gtceu.recipe.grindless_cluster_light_smelting.hearth_relining', 'Circuit 5: a worn hearth liner is relined; its tantalum is recovered.'],
        ['gtceu.recipe.grindless_closed_loop.cryo_milled_core', 'An iron core fragment is chilled to the brittle range and milled cold.'],
        ['gtceu.recipe.grindless_levitation_melting.segment_alloy_ingot', 'Circuit 19: carbonyl powder and cobalt are levitation-melted into segment alloy.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.halbach_segment_coupler', 'Circuit 20: cold-pressed tetrataenite and a Fe16N2 ring are bonded into a Halbach segment coupler.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sealed_hearth_liner', 'Circuit 15: a TaHfC billet is infiltrated with methane into a sealed hearth liner.'],
        ['gtceu.recipe.grindless_carbonyl_refining.bloom_carbonyl', 'Circuit 2: the bloom is carbonylated into Fe-Ni carbonyl powder; the CO is recycled.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
