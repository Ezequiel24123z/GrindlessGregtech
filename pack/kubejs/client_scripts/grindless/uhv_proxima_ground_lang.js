// priority: 4100
// Gregtech Grindless - names and tooltips of UHV's Proxima ground (startup_scripts/grindless/uhv/proxima_ground.js; package UHV-B5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, block.grindless.<n>, tooltip.grindless.<n>.0/.1   the new items and blocks
//   emi.grindless.info.proxima_base_casing.0                      the casing's EMI page (assets/emi/recipe/additions/grindless/
//                                                                 uhv_proxima_ground_base_casing.json)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.cold_trap_drill', 'Cold-Trap Drill'],
        ['gtceu.cold_trap_drilling', 'Cold-Trap Drilling'],
        ['block.gtceu.biomining_heap', 'Biomining Heap'],
        ['gtceu.biomining', 'Biomining'],

        ['grindless.machine.cold_trap_drill.tooltip.0',
            '§7Cores buried ice and cold-trap regolith with a neutron-logged drill.'],
        ['grindless.machine.cold_trap_drill.tooltip.1', 'Works on Proxima b\'s night side only.'],

        ['grindless.machine.biomining_heap.tooltip.0',
            '§7A bacterial heap that leaches platinum metals and rare earths.'],
        ['grindless.machine.biomining_heap.tooltip.1', 'Works on Proxima b only.'],

        ['gtceu.recipe.grindless_cold_trap_drilling.dig', 'Core the night-side cold trap: an ice core and cold-trap regolith'],
        ['gtceu.recipe.grindless_biomining.pgm_leach', 'Cyanide bioleach: platinum-group liquor'],
        ['gtceu.recipe.grindless_biomining.ree_leach', 'Basalt bioleach: rare-earth liquor'],
        ['gtceu.recipe.grindless_biomining.biocement', 'Microbial calcite: biocemented regolith'],
        ['gtceu.recipe.grindless_biomining.lunar_biocement', 'Microbial calcite on lunar regolith: half the yield, for the first pad'],

        ['item.grindless.leached_tailings', 'Leached Tailings'],
        ['tooltip.grindless.leached_tailings.0', 'What the bacteria leave behind: silicates, calcium and iron.'],
        ['tooltip.grindless.leached_tailings.1', 'Hydrochloric acid gives calcium chloride and silica (chemical reactor); the Moon\'s regolith cell makes oxygen, iron and silica from them (circuit 2).'],
        ['item.grindless.urea', 'Urea'],
        ['tooltip.grindless.urea.0', 'Ammonia and carbon dioxide under pressure (Bosch-Meiser), in a chemical reactor.'],
        ['tooltip.grindless.urea.1', 'Sporosarcina splits it to set calcite in the biomining heap.'],
        ['item.grindless.cold_trap_coring_head', 'Cold-Trap Coring Head'],
        ['tooltip.grindless.cold_trap_coring_head.0', 'An HSS-S bit in a naquadah alloy barrel with tungsten carbide cutters.'],
        ['tooltip.grindless.cold_trap_coring_head.1', 'The cold-trap drill wears one out every 32 runs.'],

        ['block.grindless.biocemented_regolith', 'Biocemented Regolith'],
        ['tooltip.grindless.biocemented_regolith.0', 'Regolith grains bound by bacterial calcite.'],
        ['tooltip.grindless.biocemented_regolith.1', 'Assembled with flare shield panels into Proxima base casing.'],
        ['block.grindless.proxima_base_casing', 'Proxima Base Casing'],
        ['tooltip.grindless.proxima_base_casing.0', 'A biocement pad faced with flare shield panels on a naquadah alloy frame.'],
        ['tooltip.grindless.proxima_base_casing.1', 'The pad of the cold-trap drill.'],
        ['emi.grindless.info.proxima_base_casing.0',
            'A structure block: biocemented regolith faced with flare shield panels on a naquadah alloy frame, made in the Assembler. The Cold-Trap Drill stands on a 7x7 pad of it (up to 47 blocks; the hatches take the rest). The first pad comes from lunar regolith cemented in the Biomining Heap, which is built from inert casing.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
