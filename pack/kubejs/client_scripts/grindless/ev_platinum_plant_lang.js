// Gregtech Grindless - names and tooltips of the EV Platinum Plant and its electrode.
//
//   gtceu:platinum_plant                 (machine name + tooltips)
//   gtceu:pgm_refining                   (recipe type name)
//   grindless:platinum_electrode         (item name + tooltip)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.platinum_plant', 'Platinum Plant')
    add('gtceu.pgm_refining', 'PGM Refining')

    add('grindless.machine.platinum_plant.tooltip.0', 'The platinum-group line of a dozen standalone machines in one, with its loops closed inside. Programmed circuit 1, attack: 9 purified pentlandite or chalcopyrite give 1 platinum group sludge, 18 nickel or copper dust, oxygen and sulfuric acid (the solution is electrolyzed inside and gives the acid back, with a surplus).')
    add('grindless.machine.platinum_plant.tooltip.1', 'Circuit 2, separation: the plant runs the recipe its inputs fit. Sludge with calcium, nitration mixture and ammonium chloride gives 6 platinum, gold, silicon dioxide, calcium chloride and platinum slag (and palladium-rich ammonia, nitrogen dioxide and diluted sulfuric acid). Rich ammonia with palladium metal dust, ammonia and formic acid gives palladium. Slag with potassium pyrosulfate, saltpeter, sodium nitrate, zinc, hydrochloric acid, salt water and steam gives rhodium and ruthenium. Earth\'s platinum ores hold no iridium or osmium: those come from Mercury.')
    add('grindless.machine.platinum_plant.tooltip.2', 'Same ratios and same energy as the standalone machines (6 platinum cost about 4.4 million EU), no discount and no parallels of its own. Everything the line makes and uses itself stays inside, the toxic ruthenium tetroxide included. Needs a platinum electrode in the input bus (used up in 0.1% of the runs).')
    add('grindless.machine.platinum_plant.tooltip.4', 'Circuit 3 (IV), iridosmine: 10 iridosmine from Mercury with 10 saltpeter, 3 calcium, salt water, hydrochloric acid and hydrogen give 3 iridium and 1 osmium, the fusion of the Mercury Solar Works and the iridium and osmium line in one pass. The osmium tetroxide, the chlorine and the ammonia stay inside; calcium chloride, platinum sludge residue, metal sludge, water and steam come out.')
    add('grindless.machine.platinum_plant.tooltip.3', 'Needs 1 or 2 EV energy hatches, 1 input bus, 1 output bus, 3 input hatches and 4 output hatches. ME buses and hatches fit. Every output needs somewhere to go: if a bus or a hatch fills up, the plant stops.')

    add('item.grindless.platinum_electrode', 'Platinum Electrode')
    add('tooltip.grindless.platinum_electrode', 'Platinum on titanium. Goes in the input bus of the Platinum Plant, which needs one for every recipe; it wears out by chance (about 0.1% of the runs). Assemble it from a titanium rod and platinum foil.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.platinum_plant', 'Planta de platino')
    add('gtceu.pgm_refining', 'Refinado de PGM')

    add('grindless.machine.platinum_plant.tooltip.0', 'La línea del grupo del platino, una docena de máquinas sueltas en una, con sus bucles cerrados por dentro. Circuito programado 1, ataque: 9 de pentlandita o calcopirita purificada dan 1 de lodo del grupo del platino, 18 de polvo de níquel o cobre, oxígeno y ácido sulfúrico (la solución se electroliza dentro y devuelve el ácido, con un sobrante).')
    add('grindless.machine.platinum_plant.tooltip.1', 'Circuito 2, separación: la planta ejecuta la receta que encajan sus entradas. Lodo con calcio, mezcla nitrante y cloruro de amonio da 6 de platino, oro, dióxido de silicio, cloruro de calcio y escoria de platino (y amoníaco rico en paladio, dióxido de nitrógeno y ácido sulfúrico diluido). Amoníaco rico con polvo metálico de paladio, amoníaco y ácido fórmico da paladio. Escoria con pirosulfato de potasio, salitre, nitrato de sodio, cinc, ácido clorhídrico, agua salada y vapor da rodio y rutenio. Las menas de platino de la Tierra no llevan iridio ni osmio: esos vienen de Mercurio.')
    add('grindless.machine.platinum_plant.tooltip.2', 'Mismas proporciones y misma energía que las máquinas sueltas (6 de platino cuestan unos 4,4 millones de EU), sin descuento y sin paralelos propios. Todo lo que la línea hace y gasta ella misma se queda dentro, el tetróxido de rutenio tóxico incluido. Pide un electrodo de platino en el bus de entrada (se gasta en el 0,1 % de las ejecuciones).')
    add('grindless.machine.platinum_plant.tooltip.4', 'Circuito 3 (IV), iridosmina: 10 de iridosmina de Mercurio con 10 de salitre, 3 de calcio, agua salada, ácido clorhídrico e hidrógeno dan 3 de iridio y 1 de osmio, la fusión de la planta solar de Mercurio y la línea del iridio y el osmio en una pasada. El tetróxido de osmio, el cloro y el amoníaco se quedan dentro; salen cloruro de calcio, residuo de lodo de platino, lodo metálico, agua y vapor.')
    add('grindless.machine.platinum_plant.tooltip.3', 'Necesita 1 o 2 escotillas de energía EV, 1 bus de entrada, 1 bus de salida, 3 escotillas de entrada y 4 de salida. Valen buses y escotillas ME. Cada salida necesita un destino: si un bus o una escotilla se llena, la planta se para.')

    add('item.grindless.platinum_electrode', 'Electrodo de platino')
    add('tooltip.grindless.platinum_electrode', 'Platino sobre titanio. Va en el bus de entrada de la planta de platino, que pide uno para cada receta; se desgasta por probabilidad (en torno al 0,1 % de las ejecuciones). Se ensambla con una varilla de titanio y lámina fina de platino.')
})
