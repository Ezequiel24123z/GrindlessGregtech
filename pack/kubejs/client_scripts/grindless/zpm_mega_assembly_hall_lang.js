// Gregtech Grindless - names and tooltips of the ZPM Assembly Hall (startup_scripts/grindless/zpm/mega_assembly_hall.js).
//
//   gtceu:assembly_hall   (machine name + 4 tooltip lines, en_us and es_es)
//
// The mode names in the machine mode tab are GTM's own recipe type names (gtceu.assembler, gtceu.circuit_assembler), already translated by GTM.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.assembly_hall', 'Assembly Hall')
    add('grindless.machine.assembly_hall.tooltip.0', 'An assembly line casing hall that runs the assembler and the circuit assembler: up to 64 recipes at once, 64 times the parallel hatch\'s figure with one (ZPM hatch: 4096). Choose the machine in the controller\'s machine mode tab: one mode at a time, with the single blocks\' own recipes. The assembly line itself is not included.')
    add('grindless.machine.assembly_hall.tooltip.1', 'Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t), up to the ceiling. Spare voltage overclocks, and batch mode is on. No speed or energy bonus: it saves machines and buses, not power.')
    add('grindless.machine.assembly_hall.tooltip.2', 'Circuit assembler recipes that need a cleanroom still do: the hall must stand inside a formed cleanroom. It is 11 wide, 9 high and 12 deep, so it fits the largest cleanroom (13 x 13 x 13 inside); leave one block between its front and the cleanroom wall.')
    add('grindless.machine.assembly_hall.tooltip.3', 'Needs, in any casing cell: 1 maintenance hatch, 1 to 4 energy hatches, 1 to 6 input buses, 1 to 6 output buses, 1 to 4 input hatches (solder) and optionally 1 parallel hatch. Assembly line unit casings in the corners, laminated glass in the side bands, an empty hall inside.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.assembly_hall', 'Sala de Ensamblaje')
    add('grindless.machine.assembly_hall.tooltip.0', 'Una nave de carcasas de línea de ensamblaje que ejecuta el ensamblador y el ensamblador de circuitos: hasta 64 recetas a la vez, 64 veces la cifra del hatch de paralelo si lo hay (hatch ZPM: 4096). Elige la máquina en la pestaña de modo del controlador: un modo a la vez, con las recetas de las máquinas individuales. La línea de ensamblaje no está incluida.')
    add('grindless.machine.assembly_hall.tooltip.1', 'Cada copia paga su EU/t completo, así que los hatches de energía fijan cuántas corren: floor(voltaje del hatch / EU/t de la receta), hasta el techo. El voltaje sobrante sobrecarga y el modo por lotes está activo. Sin bonus de velocidad ni de energía: ahorra máquinas y buses, no energía.')
    add('grindless.machine.assembly_hall.tooltip.2', 'Las recetas del ensamblador de circuitos que piden sala blanca la siguen pidiendo: la sala debe estar dentro de una sala blanca formada. Mide 11 de ancho, 9 de alto y 12 de fondo, así que cabe en la mayor sala blanca (13 x 13 x 13 por dentro); deja un bloque entre su frente y la pared de la sala blanca.')
    add('grindless.machine.assembly_hall.tooltip.3', 'Necesita, en cualquier celda de carcasa: 1 hatch de mantenimiento, 1 a 4 hatches de energía, 1 a 6 buses de entrada, 1 a 6 buses de salida, 1 a 4 hatches de entrada (soldadura) y opcionalmente 1 hatch de paralelo. Carcasas unidad de línea de ensamblaje en las esquinas, cristal laminado en las franjas laterales y un salón vacío dentro.')
})
