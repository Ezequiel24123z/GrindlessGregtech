// priority: 5852
// Gregtech Grindless - names and tooltips of OpV's collector nodes and bulge collector (startup_scripts/grindless/opv/bulge_collector.js; package OpV-R3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controller
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe (and refinery c7)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.collector_node_works', 'Collector Node Works'],
        ['gtceu.collector_node_assembly', 'Collector Node Assembly'],
        ['grindless.machine.collector_node_works.tooltip.0',
            '\u00a77Makes collector nodes and packs them with a probe seed.'],
        ['emi.grindless.info.collector_node_works.0',
            'Only node deployment needs Terzan 5 core. Circuits 1 and 2 draw Si alloy powder into ribbon and lay it on a silicate fraction as a PV film; circuit 3 joins two films, a node power transmitter and a cluster casing into a collector node.'],
        ['emi.grindless.info.collector_node_works.1',
            'Circuit 4 packs four nodes and one probe seed into a deployed node pack. The pack is used up by the bulge collector; the spent nodes come back as Si alloy powder in the replication refinery (circuit 7), half of what they held.'],

        ['item.grindless.si_ribbon', 'Si Ribbon'],
        ['tooltip.grindless.si_ribbon.0', 'A thin ribbon drawn from Si alloy powder.'],
        ['tooltip.grindless.si_ribbon.1', 'Two of them make one PV collector film.'],
        ['item.grindless.pv_collector_film', 'PV Collector Film'],
        ['tooltip.grindless.pv_collector_film.0', 'Ribbon laid on a silicate fraction to catch bulge light.'],
        ['tooltip.grindless.pv_collector_film.1', 'Two films make one collector node.'],

        ['gtceu.recipe.grindless_collector_node_assembly.node_si_ribbon', 'Circuit 1: Si alloy powder drawn into ribbon.'],
        ['gtceu.recipe.grindless_collector_node_assembly.node_pv_film', 'Circuit 2: two ribbons laid on a silicate fraction make a PV film.'],
        ['gtceu.recipe.grindless_collector_node_assembly.collector_node_assembly', 'Circuit 3: two films, a transmitter and a casing make a collector node.'],
        ['gtceu.recipe.grindless_collector_node_assembly.node_pack_deploy', 'Circuit 4: four nodes and a probe seed make a deployed node pack.'],
        ['gtceu.recipe.grindless_replication_refining.spent_node_recovery', 'Circuit 7: four spent nodes give back eight Si alloy powder, half of their silicon.'],

        ['block.gtceu.bulge_collector', 'Bulge Collector'],
        ['gtceu.bulge_light_collection', 'Bulge Light Collection'],
        ['grindless.machine.bulge_collector.tooltip.0',
            '\u00a77Turns deployed node packs into power; the packs are used up.'],
        ['grindless.machine.bulge_collector.tooltip.1',
            '\u00a77Needs one OpV 4 A dynamo hatch.'],
        ['emi.grindless.info.bulge_collector.0',
            'One, four or sixteen deployed node packs (circuits 1 to 3) give 2^26, 2^28 or 2^30 EU/t over the same long run on one OpV 4 A dynamo hatch. Each pack costs a whole probe seed, four nodes and their silicon, so the run pays back about one and a half times what a pack cost; the spent nodes return half of their silicon (refinery circuit 7).'],
        ['emi.grindless.info.bulge_collector.1',
            'Sixteen packs at once also yield one bulge light census, the survey a later site needs. Runs only at Terzan 5 core.'],
        ['gtceu.recipe.grindless_bulge_light_collection.bulge_light_1', 'Circuit 1: one pack, 2^26 EU/t; four spent nodes return.'],
        ['gtceu.recipe.grindless_bulge_light_collection.bulge_light_4', 'Circuit 2: four packs, 2^28 EU/t; sixteen spent nodes return.'],
        ['gtceu.recipe.grindless_bulge_light_collection.bulge_light_16', 'Circuit 3: sixteen packs, 2^30 EU/t; a bulge light census and sixty-four spent nodes.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
