// priority: 6700
// Gregtech Grindless - names and tooltips of the LV multiblocks and their items.
//
//   gtceu:lv_vein_drill, gtceu:lv_greenhouse, gtceu:submerged_arc_furnace   (machine names + tooltips)
//   gtceu:arc_smelting                                                      (recipe type name)
//   grindless:graphite_electrode                                            (electrode)
//   grindless:vein_sample_<nether vein>                                     (13 Nether vein samples)
//   grindless:vein_sample_<extra overworld vein>                            (kaolinite, wollastonite: GT-- veins)
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent) - Minecraft merges lang entries from every
// namespace/script, so ClientEvents.lang works fine regardless of where it is declared (same approach as dimensions_lang.js).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.lv_vein_drill', 'LV Vein Drill')
    add('block.gtceu.lv_greenhouse', 'LV Greenhouse')
    add('block.gtceu.submerged_arc_furnace', 'Submerged Arc Furnace')
    add('gtceu.arc_smelting', 'Arc Smelting')

    add('grindless.machine.lv_vein_drill.tooltip.0', '§7Drills the vein marked by the vein sample, up to 8 bores at once.')

    add('grindless.machine.lv_greenhouse.tooltip.0', '§7Grows trees, crops, mushrooms and flowers, up to 8 at once.')

    add('grindless.machine.submerged_arc_furnace.tooltip.0', '§7Reduces and melts in an electric arc: silicon, sky dust, obsidian.')
    add('grindless.machine.submerged_arc_furnace.tooltip.1', 'Needs a graphite electrode in the input bus.')

    add('item.grindless.graphite_electrode', 'Graphite Electrode')
    add('tooltip.grindless.graphite_electrode', 'Wears out by chance in the Submerged Arc Furnace (about 3% of the runs). Press it from graphite dust and a steel rod.')

    add('tooltip.grindless.vein_sample.drill_lv', 'Put it in the input bus of the LV Vein Drill, with a drill bit and drilling fluid in its fluid hatch. It is never used up.')
    add('tooltip.grindless.vein_sample.nether', 'Nether vein: it only drills with drilling fluid, so the Steam Vein Drill cannot take it.')

    add('item.grindless.vein_sample_banded_iron', 'Nether Banded Iron Vein Sample')
    add('item.grindless.vein_sample_beryllium', 'Nether Beryllium Vein Sample')
    add('item.grindless.vein_sample_certus_quartz', 'Nether Certus Quartz Vein Sample')
    add('item.grindless.vein_sample_germanite', 'Nether Germanite Vein Sample')
    add('item.grindless.vein_sample_manganese', 'Nether Manganese Vein Sample')
    add('item.grindless.vein_sample_molybdenum', 'Nether Molybdenum Vein Sample')
    add('item.grindless.vein_sample_monazite', 'Nether Monazite Vein Sample')
    add('item.grindless.vein_sample_nether_quartz', 'Nether Quartz Vein Sample')
    add('item.grindless.vein_sample_redstone', 'Nether Redstone Vein Sample')
    add('item.grindless.vein_sample_saltpeter', 'Nether Saltpeter Vein Sample')
    add('item.grindless.vein_sample_sulfur', 'Nether Sulfur Vein Sample')
    add('item.grindless.vein_sample_tetrahedrite', 'Nether Tetrahedrite Vein Sample')
    add('item.grindless.vein_sample_topaz', 'Nether Topaz Vein Sample')

    // Overworld veins of other mods (GT--), drilled by the Steam Vein Drill like the ones of the steam table
    add('item.grindless.vein_sample_kaolinite', 'Kaolinite Vein Sample')
    add('item.grindless.vein_sample_wollastonite', 'Wollastonite Vein Sample')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.lv_vein_drill', 'Perforadora de vetas LV')
    add('block.gtceu.lv_greenhouse', 'Invernadero LV')
    add('block.gtceu.submerged_arc_furnace', 'Horno de arco sumergido')
    add('gtceu.arc_smelting', 'Fundición por arco')

    add('grindless.machine.lv_vein_drill.tooltip.0', '§7Perfora la veta que marca la muestra, hasta 8 perforaciones a la vez.')

    add('grindless.machine.lv_greenhouse.tooltip.0', '§7Cultiva árboles, cosechas, setas y flores, hasta 8 a la vez.')

    add('grindless.machine.submerged_arc_furnace.tooltip.0', '§7Reduce y funde con arco eléctrico: silicio, polvo celeste, obsidiana.')
    add('grindless.machine.submerged_arc_furnace.tooltip.1', 'Pide un electrodo de grafito en el bus de entrada.')

    add('item.grindless.graphite_electrode', 'Electrodo de grafito')
    add('tooltip.grindless.graphite_electrode', 'Se desgasta por probabilidad en el horno de arco sumergido (en torno al 3 % de los ciclos). Se prensa con polvo de grafito y una varilla de acero.')

    add('tooltip.grindless.vein_sample.drill_lv', 'Ponla en el bus de entrada de la perforadora de vetas LV, con una broca y lodo de perforación en su escotilla de fluidos. No se gasta.')
    add('tooltip.grindless.vein_sample.nether', 'Veta del Nether: solo se perfora con lodo de perforación, así que la perforadora de vapor no la admite.')

    add('item.grindless.vein_sample_banded_iron', 'Muestra de veta de hierro bandeado del Nether')
    add('item.grindless.vein_sample_beryllium', 'Muestra de veta de berilio del Nether')
    add('item.grindless.vein_sample_certus_quartz', 'Muestra de veta de cuarzo certus del Nether')
    add('item.grindless.vein_sample_germanite', 'Muestra de veta de germanita del Nether')
    add('item.grindless.vein_sample_manganese', 'Muestra de veta de manganeso del Nether')
    add('item.grindless.vein_sample_molybdenum', 'Muestra de veta de molibdeno del Nether')
    add('item.grindless.vein_sample_monazite', 'Muestra de veta de monacita del Nether')
    add('item.grindless.vein_sample_nether_quartz', 'Muestra de veta de cuarzo del Nether')
    add('item.grindless.vein_sample_redstone', 'Muestra de veta de redstone del Nether')
    add('item.grindless.vein_sample_saltpeter', 'Muestra de veta de salitre del Nether')
    add('item.grindless.vein_sample_sulfur', 'Muestra de veta de azufre del Nether')
    add('item.grindless.vein_sample_tetrahedrite', 'Muestra de veta de tetraedrita del Nether')
    add('item.grindless.vein_sample_topaz', 'Muestra de veta de topacio del Nether')

    // vetas del Overworld de otros mods (GT--), que perfora la perforadora de vetas de vapor igual que las de la tabla de vapor
    add('item.grindless.vein_sample_kaolinite', 'Muestra de veta de caolinita')
    add('item.grindless.vein_sample_wollastonite', 'Muestra de veta de wollastonita')
})
