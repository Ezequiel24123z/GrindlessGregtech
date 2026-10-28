// Gregtech Grindless - names and tooltips of the MV Polymer Works (startup_scripts/grindless/mv/mega_polymer_works.js).
//
//   gtceu:polymer_works / gtceu.polymer_works   (machine name + 3 tooltip lines, recipe type name; en_us and es_es)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.polymer_works', 'Polymer Works')
    add('gtceu.polymer_works', 'Polymer Works')
    add('grindless.machine.polymer_works.tooltip.0', 'A steel hall that runs two whole lines in one pass: polyethylene plates (ethanol + sulfuric acid -> ethylene, + oxygen -> polyethylene, -> plate) and rubber plates (raw rubber + sulfur -> rubber -> plate). Up to 16 recipes at once. The diluted sulfuric acid is the byproduct: send it back to the sulfuric acid recipes.')
    add('grindless.machine.polymer_works.tooltip.1', 'Each recipe takes the energy of every stage of its line, at 128 EU/t, and each copy pays that in full: the energy hatches set how many run, floor(hatch voltage / recipe EU/t), up to 16. Spare voltage overclocks, and batch mode is on. The coil row only completes the structure: no speed or energy bonus.')
    add('grindless.machine.polymer_works.tooltip.2', 'Needs, in any casing cell: 1 maintenance hatch, 1 or 2 energy hatches, 1 or 2 input buses, 1 to 3 input hatches, 1 or 2 output buses and 1 or 2 output hatches; at least 85 steel solid casings, aluminium frames in the corners, tempered glass in the sides and a row of 5 heating coils (Cupronickel or better, all of one type) inside.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.polymer_works', 'Taller de Polímeros')
    add('gtceu.polymer_works', 'Taller de Polímeros')
    add('grindless.machine.polymer_works.tooltip.0', 'Una nave de acero que ejecuta dos líneas completas de una vez: placas de polietileno (etanol + ácido sulfúrico -> etileno, + oxígeno -> polietileno, -> placa) y placas de caucho (caucho crudo + azufre -> caucho -> placa). Hasta 16 recetas a la vez. El ácido sulfúrico diluido es el subproducto: devuélvelo a las recetas de ácido sulfúrico.')
    add('grindless.machine.polymer_works.tooltip.1', 'Cada receta lleva la energía de todas las etapas de su línea, a 128 EU/t, y cada copia la paga completa: los hatches de energía fijan cuántas corren, floor(voltaje del hatch / EU/t de la receta), hasta 16. El voltaje sobrante sobrecarga y el modo por lotes está activo. La fila de bobinas solo completa la estructura: sin bonus de velocidad ni de energía.')
    add('grindless.machine.polymer_works.tooltip.2', 'Necesita, en cualquier celda de carcasa: 1 hatch de mantenimiento, 1 o 2 hatches de energía, 1 o 2 buses de entrada, 1 a 3 hatches de entrada, 1 o 2 buses de salida y 1 o 2 hatches de salida; al menos 85 carcasas sólidas de acero, marcos de aluminio en las esquinas, vidrio templado en los lados y una fila de 5 bobinas calefactoras (Cuproníquel o mejor, todas del mismo tipo) dentro.')
})
