// Gregtech Grindless - names and tooltips of the HV step of the Vein Drill / Greenhouse family.
//
//   gtceu:hv_vein_drill, gtceu:hv_greenhouse   (machine names + tooltips)
//   grindless:titanium_drill_bit               (drill bit)
//   grindless:vein_sample_<end vein>           (5 End vein samples)
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent), like lv_multis_lang.js and mv_family_lang.js:
// Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine wherever it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hv_vein_drill', 'HV Vein Drill')
    add('block.gtceu.hv_greenhouse', 'HV Greenhouse')

    add('grindless.machine.hv_vein_drill.tooltip.0', 'Drills the vein marked by the vein sample, over and over. It runs every Steam, LV and MV Vein Drill recipe, up to 32 at once, and the End veins no smaller drill can take (with drilling fluid).')
    add('grindless.machine.hv_vein_drill.tooltip.1', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 32): one HV hatch fills all 32, a second one is a voltage tier up and halves the time.')
    add('grindless.machine.hv_vein_drill.tooltip.2', 'The titanium bit only works here and in better drills: it wears out in about 0.5% of the runs (0.25% with drilling fluid). End veins drill with the vanadium steel or the titanium bit. Drilling fluid in the fluid hatch: +50% ore.')
    add('grindless.machine.hv_vein_drill.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 2 output buses and 1 input hatch.')

    add('grindless.machine.hv_greenhouse.tooltip.0', 'Grows trees, rubber trees, crops, mushrooms, berries, vines and flowers with a plant that is never used up. It runs every Steam, LV and MV Greenhouse recipe.')
    add('grindless.machine.hv_greenhouse.tooltip.1', 'Runs as many crops at once as its energy hatches allow (voltage / 4 EU/t, up to 32). Water in an input hatch unlocks the extra plants.')
    add('grindless.machine.hv_greenhouse.tooltip.2', 'Programmed circuit 2 + fertilizer in the input bus (and water): double output in half the time. Carbon dioxide in a second input hatch (200 mB per run) adds +50% and 100 mB of oxygen comes back out.')
    add('grindless.machine.hv_greenhouse.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 1 or 2 output buses, 1 or 2 input hatches (water, carbon dioxide) and 1 output hatch (oxygen).')

    add('item.grindless.titanium_drill_bit', 'Titanium Drill Bit')
    add('tooltip.grindless.titanium_drill_bit', 'Wears out by chance: about 0.5% of the runs, 0.25% with drilling fluid. Only the HV Vein Drill and better take it.')

    add('tooltip.grindless.vein_sample.drill_hv', 'Put it in the input bus of the HV Vein Drill, with a vanadium steel or titanium drill bit in the bus and drilling fluid in its fluid hatch. It is never used up.')
    add('tooltip.grindless.vein_sample.end', 'End vein: it only drills with drilling fluid, and only in the HV Vein Drill and better. Craft it with an empty vein probe and two raw ores of the vein: one trip to the End is enough.')

    add('item.grindless.vein_sample_bauxite_end', 'End Bauxite Vein Sample')
    add('item.grindless.vein_sample_magnetite_end', 'End Magnetite Vein Sample')
    add('item.grindless.vein_sample_scheelite', 'End Scheelite Vein Sample')
    add('item.grindless.vein_sample_sheldonite', 'End Sheldonite Vein Sample')
    add('item.grindless.vein_sample_zirconium', 'End Zirconium Vein Sample')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hv_vein_drill', 'Perforadora de vetas HV')
    add('block.gtceu.hv_greenhouse', 'Invernadero HV')

    add('grindless.machine.hv_vein_drill.tooltip.0', 'Perfora la veta que marca la muestra, una y otra vez. Hace todas las recetas de las perforadoras de vapor, LV y MV, hasta 32 a la vez, y las vetas del End que ninguna perforadora menor admite (con lodo de perforación).')
    add('grindless.machine.hv_vein_drill.tooltip.1', 'Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 32): una escotilla HV llena los 32 y una segunda sube un escalón de voltaje y reduce el tiempo a la mitad.')
    add('grindless.machine.hv_vein_drill.tooltip.2', 'La broca de titanio solo funciona aquí y en perforadoras mejores: se gasta en cerca del 0,5 % de los ciclos (0,25 % con lodo de perforación). Las vetas del End se perforan con la broca de acero vanádico o la de titanio. Con lodo en la escotilla de fluidos: +50 % de mineral.')
    add('grindless.machine.hv_vein_drill.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 2 buses de salida y 1 escotilla de entrada.')

    add('grindless.machine.hv_greenhouse.tooltip.0', 'Cultiva árboles, árboles de caucho, cosechas, setas, bayas, enredaderas y flores con una planta que no se gasta. Hace todas las recetas de los invernaderos de vapor, LV y MV.')
    add('grindless.machine.hv_greenhouse.tooltip.1', 'Hace tantos cultivos a la vez como permitan sus escotillas de energía (voltaje / 4 EU/t, hasta 32). Con agua en una escotilla de entrada se abren las plantas extra.')
    add('grindless.machine.hv_greenhouse.tooltip.2', 'Circuito programado 2 + fertilizante en el bus de entrada (y agua): doble de producción en la mitad de tiempo. Con dióxido de carbono en una segunda escotilla de entrada (200 mB por ciclo) suma +50 % y vuelven 100 mB de oxígeno.')
    add('grindless.machine.hv_greenhouse.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 o 2 buses de salida, 1 o 2 escotillas de entrada (agua, dióxido de carbono) y 1 escotilla de salida (oxígeno).')

    add('item.grindless.titanium_drill_bit', 'Broca de titanio')
    add('tooltip.grindless.titanium_drill_bit', 'Se desgasta por probabilidad: cerca del 0,5 % de los ciclos, 0,25 % con lodo de perforación. Solo la admiten la perforadora de vetas HV y las mejores.')

    add('tooltip.grindless.vein_sample.drill_hv', 'Ponla en el bus de entrada de la perforadora de vetas HV, con una broca de acero vanádico o de titanio en el bus y lodo de perforación en su escotilla de fluidos. No se gasta.')
    add('tooltip.grindless.vein_sample.end', 'Veta del End: solo se perfora con lodo de perforación, y solo con la perforadora de vetas HV y las mejores. Se hace con una sonda de vetas vacía y dos menas en bruto de la veta: basta un viaje al End.')

    add('item.grindless.vein_sample_bauxite_end', 'Muestra de veta de bauxita del End')
    add('item.grindless.vein_sample_magnetite_end', 'Muestra de veta de magnetita del End')
    add('item.grindless.vein_sample_scheelite', 'Muestra de veta de scheelita del End')
    add('item.grindless.vein_sample_sheldonite', 'Muestra de veta de sheldonita del End')
    add('item.grindless.vein_sample_zirconium', 'Muestra de veta de circonio del End')
})
