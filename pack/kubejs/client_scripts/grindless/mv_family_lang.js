// priority: 6400
// Gregtech Grindless - names and tooltips of the MV step of the Vein Drill / Greenhouse family.
//
//   gtceu:mv_vein_drill, gtceu:mv_greenhouse   (machine names + tooltips)
//   grindless:vanadium_steel_drill_bit         (drill bit)
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent), like lv_multis_lang.js and dimensions_lang.js:
// Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine wherever it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mv_vein_drill', 'MV Vein Drill')
    add('block.gtceu.mv_greenhouse', 'MV Greenhouse')

    add('grindless.machine.mv_vein_drill.tooltip.0', 'Drills the vein marked by the vein sample, over and over. It runs every Steam and LV Vein Drill recipe, up to 16 at once.')
    add('grindless.machine.mv_vein_drill.tooltip.1', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 16): one MV hatch fills all 16, a second one is a voltage tier up and halves the time.')
    add('grindless.machine.mv_vein_drill.tooltip.2', 'The vanadium steel bit only works here: it wears out in about 1% of the runs (0.5% with drilling fluid). Drilling fluid in the fluid hatch: +50% ore. Nether and End veins only drill with it.')
    add('grindless.machine.mv_vein_drill.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 2 output buses and 1 input hatch.')

    add('grindless.machine.mv_greenhouse.tooltip.0', 'Grows trees, rubber trees, crops, mushrooms, berries, vines and flowers with a plant that is never used up. It runs every Steam and LV Greenhouse recipe.')
    add('grindless.machine.mv_greenhouse.tooltip.1', 'Runs as many crops at once as its energy hatches allow (voltage / 4 EU/t, up to 16). Water in an input hatch unlocks the extra plants.')
    add('grindless.machine.mv_greenhouse.tooltip.2', 'Programmed circuit 2 + fertilizer in the input bus (and water): double output in half the time. Carbon dioxide in a second input hatch (200 mB per run) adds +50% and 100 mB of oxygen comes back out.')
    add('grindless.machine.mv_greenhouse.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 1 or 2 output buses, 1 or 2 input hatches (water, carbon dioxide) and 1 output hatch (oxygen).')

    add('item.grindless.vanadium_steel_drill_bit', 'Vanadium Steel Drill Bit')
    add('tooltip.grindless.vanadium_steel_drill_bit', 'Wears out by chance: about 1% of the runs, 0.5% with drilling fluid. Only the MV Vein Drill takes it.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mv_vein_drill', 'Perforadora de vetas MV')
    add('block.gtceu.mv_greenhouse', 'Invernadero MV')

    add('grindless.machine.mv_vein_drill.tooltip.0', 'Perfora la veta que marca la muestra, una y otra vez. Hace todas las recetas de las perforadoras de vapor y LV, hasta 16 a la vez.')
    add('grindless.machine.mv_vein_drill.tooltip.1', 'Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 16): una escotilla MV llena los 16 y una segunda sube un escalón de voltaje y reduce el tiempo a la mitad.')
    add('grindless.machine.mv_vein_drill.tooltip.2', 'La broca de acero vanádico solo funciona aquí: se gasta en cerca del 1 % de los ciclos (0,5 % con lodo de perforación). Con lodo en la escotilla de fluidos: +50 % de mineral. Las vetas del Nether y del End solo se perforan con él.')
    add('grindless.machine.mv_vein_drill.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 2 buses de salida y 1 escotilla de entrada.')

    add('grindless.machine.mv_greenhouse.tooltip.0', 'Cultiva árboles, árboles de caucho, cosechas, setas, bayas, enredaderas y flores con una planta que no se gasta. Hace todas las recetas de los invernaderos de vapor y LV.')
    add('grindless.machine.mv_greenhouse.tooltip.1', 'Hace tantos cultivos a la vez como permitan sus escotillas de energía (voltaje / 4 EU/t, hasta 16). Con agua en una escotilla de entrada se abren las plantas extra.')
    add('grindless.machine.mv_greenhouse.tooltip.2', 'Circuito programado 2 + fertilizante en el bus de entrada (y agua): doble de producción en la mitad de tiempo. Con dióxido de carbono en una segunda escotilla de entrada (200 mB por ciclo) suma +50 % y vuelven 100 mB de oxígeno.')
    add('grindless.machine.mv_greenhouse.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 o 2 buses de salida, 1 o 2 escotillas de entrada (agua, dióxido de carbono) y 1 escotilla de salida (oxígeno).')

    add('item.grindless.vanadium_steel_drill_bit', 'Broca de acero vanádico')
    add('tooltip.grindless.vanadium_steel_drill_bit', 'Se desgasta por probabilidad: cerca del 1 % de los ciclos, 0,5 % con lodo de perforación. Solo la admite la perforadora de vetas MV.')
})
