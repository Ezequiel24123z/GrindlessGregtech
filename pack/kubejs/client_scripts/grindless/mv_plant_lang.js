// Gregtech Grindless - names and tooltips of the MV Ore Plant and Biorefinery.
//
//   gtceu:ore_plant, gtceu:biorefinery            (machine names + tooltips)
//   gtceu:ore_processing, gtceu:bio_distillation  (recipe type names)
//
// Same approach as lv_multis_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ore_plant', 'Ore Plant')
    add('gtceu.ore_processing', 'Ore Processing')

    add('grindless.machine.ore_plant.tooltip.0', 'Does GTM\'s whole ore chain in one pass: macerate, wash, heat-centrifuge, macerate. A raw ore and water in; dust, every byproduct of the chain and the rubble out. Gem ores keep the sifter.')
    add('grindless.machine.ore_plant.tooltip.1', 'Same output and same energy per ore as the loose machines, no discount: it saves steps, buses and room. It runs as many ores at once as its energy hatches can pay (hatch voltage / 40 EU/t, up to 6): 3 with one MV hatch, 6 with two.')
    add('grindless.machine.ore_plant.tooltip.2', 'Programmed circuit 2 and distilled water: washing twice as fast. The reagent of the ore (mercury, sodium persulfate) in a second fluid hatch switches to the chemical bath, with its extra byproduct.')
    add('grindless.machine.ore_plant.tooltip.3', 'Needs 1 or 2 MV energy hatches, 1 input bus, 2 output buses and 2 input hatches. 4 stone dust of rubble per ore: if the buses fill up the plant stops, so give it somewhere to go (mud, stone separation).')

    add('block.gtceu.biorefinery', 'Biorefinery')
    add('gtceu.bio_distillation', 'Bio Distillation')

    add('grindless.machine.biorefinery.tooltip.0', 'A distillation column for organic fluids: wood tar, vinegar and gas, charcoal byproducts, biomass, fermented biomass, coal tar and gas, oils, creosote and diluted acids. Every fraction comes out in one pass.')
    add('grindless.machine.biorefinery.tooltip.1', 'Same ratios and same energy as GTM\'s Distillation Tower, at up to 120 EU/t: a recipe that draws more runs longer instead of drawing more. Crude oil and liquid air still need the HV tower.')
    add('grindless.machine.biorefinery.tooltip.2', 'Output N of the recipe leaves through the output hatch on layer N, counting up from the controller. Every layer needs exactly one hatch: no fraction is voided.')
    add('grindless.machine.biorefinery.tooltip.3', 'Needs 1 or 2 MV energy hatches, 1 input hatch, 1 output bus (dusts, fertilizer) and 7 output hatches, one on each layer.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ore_plant', 'Planta de mineral')
    add('gtceu.ore_processing', 'Procesado de menas')

    add('grindless.machine.ore_plant.tooltip.0', 'Hace la cadena completa de menas de GTM en una pasada: macerar, lavar, centrifugar con calor y macerar. Entra una mena en bruto con agua; salen polvo, todos los subproductos de la cadena y el ripio. Las menas de gema siguen en el tamiz.')
    add('grindless.machine.ore_plant.tooltip.1', 'Misma salida y misma energía por mena que las máquinas sueltas, sin descuento: ahorra pasos, buses y espacio. Procesa tantas menas a la vez como puedan pagar sus escotillas de energía (tensión de la escotilla / 40 EU/t, hasta 6): 3 con una escotilla MV, 6 con dos.')
    add('grindless.machine.ore_plant.tooltip.2', 'Circuito programado 2 y agua destilada: lavado el doble de rápido. El reactivo de la mena (mercurio, persulfato de sodio) en una segunda escotilla de fluidos activa el baño químico, con su subproducto extra.')
    add('grindless.machine.ore_plant.tooltip.3', 'Necesita 1 o 2 escotillas de energía MV, 1 bus de entrada, 2 buses de salida y 2 escotillas de entrada. 4 polvos de piedra de ripio por mena: si los buses se llenan la planta se para, así que dale destino (lodo, separación de piedra).')

    add('block.gtceu.biorefinery', 'Biorrefinería')
    add('gtceu.bio_distillation', 'Biodestilación')

    add('grindless.machine.biorefinery.tooltip.0', 'Una columna de destilación para fluidos orgánicos: alquitrán, vinagre y gas de madera, subproductos del carbón vegetal, biomasa (también fermentada), alquitrán y gas de carbón, aceites, creosota y ácidos diluidos. Todas las fracciones salen en una pasada.')
    add('grindless.machine.biorefinery.tooltip.1', 'Mismas proporciones y misma energía que la torre de destilación de GTM, con un máximo de 120 EU/t: una receta que gastaría más dura más en vez de consumir más. El crudo y el aire líquido siguen pidiendo la torre de HV.')
    add('grindless.machine.biorefinery.tooltip.2', 'La salida N de la receta sale por la escotilla de la capa N, contando desde el controlador hacia arriba. Cada capa lleva exactamente una escotilla: ninguna fracción se pierde.')
    add('grindless.machine.biorefinery.tooltip.3', 'Necesita 1 o 2 escotillas de energía MV, 1 escotilla de entrada, 1 bus de salida (polvos, fertilizante) y 7 escotillas de salida, una por capa.')
})
