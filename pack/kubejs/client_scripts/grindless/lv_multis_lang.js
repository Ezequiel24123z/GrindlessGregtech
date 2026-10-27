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

    add('grindless.machine.lv_vein_drill.tooltip.0', 'Drills the vein marked by the vein sample, over and over. It runs every Steam Vein Drill recipe and adds more.')
    add('grindless.machine.lv_vein_drill.tooltip.1', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 8): 4 with one LV hatch, 8 with two.')
    add('grindless.machine.lv_vein_drill.tooltip.2', 'Drilling fluid in the fluid hatch: +50% ore and half the drill bit wear. Nether veins only drill with it.')
    add('grindless.machine.lv_vein_drill.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 2 output buses and 1 input hatch.')

    add('grindless.machine.lv_greenhouse.tooltip.0', 'Grows trees, rubber trees, crops, mushrooms, berries, vines and flowers with a plant that is never used up.')
    add('grindless.machine.lv_greenhouse.tooltip.1', 'Runs as many crops at once as its energy hatches allow (voltage / 4 EU/t, up to 8). Water in the fluid hatch unlocks the extra plants.')
    add('grindless.machine.lv_greenhouse.tooltip.2', 'Programmed circuit 2 + fertilizer in the input bus (and water): double output in half the time. Circuit 1 or none: base recipes.')
    add('grindless.machine.lv_greenhouse.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 1 or 2 output buses and 1 input hatch.')

    add('grindless.machine.submerged_arc_furnace.tooltip.0', 'Reduces and melts in an electric arc: silicon and sky dust for AE2, and obsidian from cobblestone and water. No small machine can.')
    add('grindless.machine.submerged_arc_furnace.tooltip.1', 'Draws 2 A at LV (64 EU/t) from its two energy hatches and needs a graphite electrode in the input bus (it wears out by chance, about 3% of the runs).')
    add('grindless.machine.submerged_arc_furnace.tooltip.2', 'The muffler hatch needs free space in front of it. Carbon dioxide comes out of the fluid output hatch: set the controller to void fluids to vent it. The water for the obsidian goes in the input hatch.')
    add('grindless.machine.submerged_arc_furnace.tooltip.3', 'Needs 2 energy hatches, 1 input bus, 1 input hatch, 1 output bus, 1 output hatch and 1 muffler hatch.')

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

    add('grindless.machine.lv_vein_drill.tooltip.0', 'Perfora la veta que marca la muestra, una y otra vez. Hace todas las recetas de la perforadora de vapor y añade más.')
    add('grindless.machine.lv_vein_drill.tooltip.1', 'Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 8): 4 con una escotilla LV, 8 con dos.')
    add('grindless.machine.lv_vein_drill.tooltip.2', 'Con lodo de perforación en la escotilla de fluidos: +50 % de mineral y la mitad de desgaste de la broca. Las vetas del Nether solo se perforan con él.')
    add('grindless.machine.lv_vein_drill.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 2 buses de salida y 1 escotilla de entrada.')

    add('grindless.machine.lv_greenhouse.tooltip.0', 'Cultiva árboles, árboles de caucho, cosechas, setas, bayas, enredaderas y flores con una planta que no se gasta.')
    add('grindless.machine.lv_greenhouse.tooltip.1', 'Hace tantos cultivos a la vez como permitan sus escotillas de energía (voltaje / 4 EU/t, hasta 8). Con agua en la escotilla de fluidos se abren las plantas extra.')
    add('grindless.machine.lv_greenhouse.tooltip.2', 'Circuito programado 2 + fertilizante en el bus de entrada (y agua): doble de producción en la mitad de tiempo. Circuito 1 o ninguno: recetas base.')
    add('grindless.machine.lv_greenhouse.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 o 2 buses de salida y 1 escotilla de entrada.')

    add('grindless.machine.submerged_arc_furnace.tooltip.0', 'Reduce y funde con un arco eléctrico: silicio y polvo del cielo para AE2, y obsidiana a partir de adoquín y agua. Ninguna máquina pequeña puede.')
    add('grindless.machine.submerged_arc_furnace.tooltip.1', 'Consume 2 A a LV (64 EU/t) de sus dos escotillas de energía y necesita un electrodo de grafito en el bus de entrada (se desgasta por probabilidad, en torno al 3 % de los ciclos).')
    add('grindless.machine.submerged_arc_furnace.tooltip.2', 'La escotilla silenciadora necesita espacio libre delante. El dióxido de carbono sale por la escotilla de fluidos de salida: pon el controlador en vaciar fluidos para ventearlo. El agua de la obsidiana entra por la escotilla de entrada.')
    add('grindless.machine.submerged_arc_furnace.tooltip.3', 'Necesita 2 escotillas de energía, 1 bus de entrada, 1 escotilla de entrada, 1 bus de salida, 1 escotilla de salida y 1 escotilla silenciadora.')

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
