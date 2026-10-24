// Gregtech Grindless - names and tooltips of the HV refining line.
//
//   gtceu:refinery, gtceu:reformer              (machine names + tooltips)
//   gtceu:refining, gtceu:reforming             (recipe type names)
//   grindless:hydrotreating_catalyst            (catalyst of the Refinery)
//   grindless:reforming_catalyst                (catalyst of the Catalytic Reformer)
//
// Same approach as mv_plant_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.refinery', 'Refinery')
    add('gtceu.refining', 'Refining')

    add('grindless.machine.refinery.tooltip.0', 'A petrochemical complex in one machine. Programmed circuit 1: crude oil + hydrogen in; heavy fuel, light fuel, naphtha and refinery gas (all desulfurized) and hydrogen sulfide out. Circuit 2: hydro-cracking (feed + hydrogen). Circuit 3: steam cracking (feed + steam). Feeds: naphtha, light fuel, heavy fuel, refinery gas.')
    add('grindless.machine.refinery.tooltip.1', 'Built from GTM\'s own recipes: the same ratios as the loose machines, and the energy and time of all their stages added up. No discount, no parallels: it saves steps, pipes and machines, not energy. Every run needs a Hydrotreating Catalyst in the input bus (used up in about 0.05% of the runs).')
    add('grindless.machine.refinery.tooltip.2', 'Output N of the recipe leaves through the output hatch on layer N, counting up from the first layer of the column (12 layers). Every layer needs exactly one hatch: no fraction is voided and every one needs a destination. Overclock as GTM does it (four times the power, half the time, per step): one HV hatch (2 A) takes a recipe of up to 128 EU/t one step; two HV hatches count as an EV supply and take it two steps. Medium crude: about 92 mB/s with one hatch, 185 with two. Heavy oil (226 EU/t) and steam cracking (168 EU/t) are HV recipes: one step, with two hatches.')
    add('grindless.machine.refinery.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus (catalyst), 1 output bus (carbon), 2 input hatches (crude or feed, and hydrogen or steam) and 12 output hatches, one on each layer.')

    add('block.gtceu.reformer', 'Catalytic Reformer')
    add('gtceu.reforming', 'Reforming')

    add('grindless.machine.reformer.tooltip.0', 'GTM has no reforming; this is ours. Desulfurized naphtha over a platinum catalyst becomes benzene, toluene and hydrogen. Circuit 1: 1,000 mB naphtha -> 300 benzene + 150 toluene + 1,200 hydrogen. Circuit 2 favours toluene, circuit 3 hydrogen.')
    add('grindless.machine.reformer.tooltip.1', 'The hydrogen is what the Refinery spends: all the naphtha of a medium crude, reformed in mode 1, gives back about 105% of it. Heavy crude comes up short and needs hydrogen from the electrolyzer. No parallels, no discount.')
    add('grindless.machine.reformer.tooltip.2', 'A Reforming Catalyst (platinum on silica) in the input bus, used up in about 0.05% of the runs. Output N leaves through the output hatch on layer N, counting up from the controller: benzene, toluene, hydrogen. One hatch per layer, none voided.')
    add('grindless.machine.reformer.tooltip.3', 'Needs 1 HV energy hatch, 1 input bus (catalyst), 1 input hatch (naphtha) and 3 output hatches, one on each layer.')

    add('item.grindless.hydrotreating_catalyst', 'Hydrotreating Catalyst')
    add('tooltip.grindless.hydrotreating_catalyst', 'Cobalt and molybdenum on silica. Goes in the input bus of the Refinery; used up in about 0.05% of the runs.')
    add('item.grindless.reforming_catalyst', 'Reforming Catalyst')
    add('tooltip.grindless.reforming_catalyst', 'Platinum on silica. Goes in the input bus of the Catalytic Reformer; used up in about 0.05% of the runs.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.refinery', 'Refinería')
    add('gtceu.refining', 'Refino')

    add('grindless.machine.refinery.tooltip.0', 'Un complejo petroquímico en una máquina. Circuito programado 1: entra crudo e hidrógeno; salen combustible pesado, combustible ligero, nafta y gas de refinería (todos desulfurados) y sulfuro de hidrógeno. Circuito 2: craqueo con hidrógeno (materia + hidrógeno). Circuito 3: craqueo con vapor (materia + vapor). Materias: nafta, combustible ligero, combustible pesado, gas de refinería.')
    add('grindless.machine.refinery.tooltip.1', 'Hecha con las recetas de GTM: las mismas proporciones que las máquinas sueltas, y la energía y el tiempo de todas sus etapas sumados. Sin descuento y sin paralelos: ahorra pasos, tuberías y máquinas, no energía. Cada ciclo pide un catalizador de hidrotratamiento en el bus de entrada (se gasta en cerca del 0,05 % de los ciclos).')
    add('grindless.machine.refinery.tooltip.2', 'La salida N de la receta sale por la escotilla de la capa N, contando desde la primera capa de la columna (12 capas). Cada capa lleva exactamente una escotilla: ninguna fracción se pierde y cada una necesita destino. Sobrecarga como la hace GTM (cuatro veces la potencia y la mitad de tiempo por escalón): una escotilla HV (2 A) sube una receta de hasta 128 EU/t un escalón; dos escotillas HV cuentan como una fuente EV y la suben dos. Crudo medio: unos 92 mB/s con una escotilla y 185 con dos. El crudo pesado (226 EU/t) y el craqueo con vapor (168 EU/t) son recetas HV: un escalón, con dos escotillas.')
    add('grindless.machine.refinery.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada (catalizador), 1 bus de salida (carbono), 2 escotillas de entrada (crudo o materia, e hidrógeno o vapor) y 12 escotillas de salida, una por capa.')

    add('block.gtceu.reformer', 'Reformador catalítico')
    add('gtceu.reforming', 'Reformado')

    add('grindless.machine.reformer.tooltip.0', 'GTM no reforma; esto es nuestro. La nafta desulfurada sobre un catalizador de platino se convierte en benceno, tolueno e hidrógeno. Circuito 1: 1 000 mB de nafta -> 300 de benceno + 150 de tolueno + 1 200 de hidrógeno. El circuito 2 favorece el tolueno y el 3 el hidrógeno.')
    add('grindless.machine.reformer.tooltip.1', 'El hidrógeno es el que gasta la refinería: toda la nafta de un crudo medio, reformada en el modo 1, devuelve cerca del 105 % de él. El crudo pesado se queda corto y pide hidrógeno de la electrólisis. Sin paralelos y sin descuento.')
    add('grindless.machine.reformer.tooltip.2', 'Un catalizador de reformado (platino sobre sílice) en el bus de entrada, que se gasta en cerca del 0,05 % de los ciclos. La salida N sale por la escotilla de la capa N, contando desde el controlador: benceno, tolueno, hidrógeno. Una escotilla por capa, ninguna se pierde.')
    add('grindless.machine.reformer.tooltip.3', 'Necesita 1 escotilla de energía HV, 1 bus de entrada (catalizador), 1 escotilla de entrada (nafta) y 3 escotillas de salida, una por capa.')

    add('item.grindless.hydrotreating_catalyst', 'Catalizador de hidrotratamiento')
    add('tooltip.grindless.hydrotreating_catalyst', 'Cobalto y molibdeno sobre sílice. Va en el bus de entrada de la refinería; se gasta en cerca del 0,05 % de los ciclos.')
    add('item.grindless.reforming_catalyst', 'Catalizador de reformado')
    add('tooltip.grindless.reforming_catalyst', 'Platino sobre sílice. Va en el bus de entrada del reformador catalítico; se gasta en cerca del 0,05 % de los ciclos.')
})
