// priority: 10350
// Gregtech Grindless - names and tooltips of the EV Ore Refinery (startup_scripts/grindless/ev/mega_ore_refinery.js).
//
//   gtceu:ore_refinery / gtceu.ore_refinery   (machine name + 3 tooltip lines, recipe type name; en_us and es_es)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ore_refinery', 'Ore Refinery')
    add('gtceu.ore_refinery', 'Ore Refinery')
    add('grindless.machine.ore_refinery.tooltip.0', 'A titanium hall that takes a raw ore (what the drills deliver) through the whole ore line in one pass: macerator -> ore washer -> thermal centrifuge -> macerator, ending in dust. One recipe per ore, with every byproduct of the four steps in the outputs. Up to 64 recipes at once.')
    add('grindless.machine.ore_refinery.tooltip.1', 'Each recipe takes the energy of all four steps of its line, at 512 EU/t, and each copy pays that in full: the energy hatches set how many run, floor(hatch voltage / recipe EU/t), up to 64. Spare voltage overclocks, and batch mode is on. The water comes in through the input hatch: 1 bucket per washing run, 2 per raw ore.')
    add('grindless.machine.ore_refinery.tooltip.2', 'Needs, in any casing cell: 1 or 2 energy hatches, 1 or 2 input buses, 1 or 2 output buses, 1 input hatch and 1 muffler; at least 257 stable titanium casings, and 21 steel gearbox casings in three rows on the floor of the hall.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ore_refinery', 'Refinería de Menas')
    add('gtceu.ore_refinery', 'Refinería de Menas')
    add('grindless.machine.ore_refinery.tooltip.0', 'Una nave de titanio que lleva una mena en bruto (la que entregan los taladros) por toda la línea de menas de una vez: macerador -> lavador de menas -> centrifugadora térmica -> macerador, hasta el polvo. Una receta por mena, con todos los subproductos de los cuatro pasos entre las salidas. Hasta 64 recetas a la vez.')
    add('grindless.machine.ore_refinery.tooltip.1', 'Cada receta lleva la energía de los cuatro pasos de su línea, a 512 EU/t, y cada copia la paga completa: las escotillas de energía fijan cuántas corren, floor(voltaje de la escotilla / EU/t de la receta), hasta 64. El voltaje sobrante sobrecarga y el modo por lotes está activo. El agua entra por la escotilla de entrada: 1 cubo por lavado, 2 por mena en bruto.')
    add('grindless.machine.ore_refinery.tooltip.2', 'Necesita, en cualquier celda de carcasa: 1 o 2 escotillas de energía, 1 o 2 buses de entrada, 1 o 2 buses de salida, 1 escotilla de entrada y 1 silenciador; al menos 257 carcasas estables de titanio y 21 cajas de engranajes de acero en tres filas en el suelo de la nave.')
})
