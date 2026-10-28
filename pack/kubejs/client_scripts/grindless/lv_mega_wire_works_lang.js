// Gregtech Grindless - names and tooltips of the LV Wire Works (startup_scripts/grindless/lv/mega_wire_works.js).
//
//   gtceu:wire_works   (machine name + 3 tooltip lines, en_us and es_es)
//
// The mode names in the machine mode tab are GTM's own recipe type names (gtceu.wiremill, gtceu.bender), already translated by GTM.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.wire_works', 'Wire Works')
    add('grindless.machine.wire_works.tooltip.0', 'A steel hall that runs the wiremill and the bender: up to 8 recipes at once. Choose the machine in the controller\'s machine mode tab: one mode runs at a time, with the single blocks\' own recipes.')
    add('grindless.machine.wire_works.tooltip.1', 'Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t), up to 8. With LV hatches only cheap recipes reach 8; two hatches of one tier count as the next tier. Spare voltage overclocks, and batch mode is on. No speed or energy bonus: it saves machines and buses, not power.')
    add('grindless.machine.wire_works.tooltip.2', 'Needs, in any casing cell: 1 maintenance hatch, 1 or 2 energy hatches, 1 to 4 input buses and 1 or 2 output buses; at least 64 steel solid casings, the rest of the walls. Four steel frames in the corners, an empty 3 x 3 x 2 hall inside.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.wire_works', 'Taller de Cables')
    add('grindless.machine.wire_works.tooltip.0', 'Una nave de acero que ejecuta el laminador de cables y la dobladora: hasta 8 recetas a la vez. Elige la máquina en la pestaña de modo del controlador: un modo a la vez, con las recetas de las máquinas individuales.')
    add('grindless.machine.wire_works.tooltip.1', 'Cada copia paga su EU/t completo, así que los hatches de energía fijan cuántas corren: floor(voltaje del hatch / EU/t de la receta), hasta 8. Con hatches LV solo las recetas baratas llegan a 8; dos hatches del mismo nivel cuentan como el nivel siguiente. El voltaje sobrante sobrecarga y el modo por lotes está activo. Sin bonus de velocidad ni de energía: ahorra máquinas y buses, no energía.')
    add('grindless.machine.wire_works.tooltip.2', 'Necesita, en cualquier celda de carcasa: 1 hatch de mantenimiento, 1 o 2 hatches de energía, 1 a 4 buses de entrada y 1 o 2 buses de salida; al menos 64 carcasas sólidas de acero, el resto de las paredes. Cuatro marcos de acero en las esquinas y un salón vacío de 3 x 3 x 2 dentro.')
})
