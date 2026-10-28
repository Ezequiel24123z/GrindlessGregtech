// priority: 4525
// Gregtech Grindless - names and tooltips of the UHV Quantum Fabricator and its field ring casing (startup_scripts/grindless/uhv/mega_quantum_fabricator.js).
//
//   gtceu:quantum_fabricator      (machine name + 4 tooltip lines, en_us and es_es)
//   grindless:field_ring_casing   (block name + 1 tooltip line)
//
// The mode names in the machine mode tab are GTM's own recipe type names, already translated by GTM.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.quantum_fabricator', 'Quantum Fabricator')
    add('block.grindless.field_ring_casing', 'Field Ring Casing')
    add('tooltip.grindless.field_ring_casing.0', 'Field generator ring of the Quantum Fabricator.')
    add('emi.grindless.info.field_ring_casing.0', 'The Quantum Fabricator\'s structure block: the ring of field generators round its walls. Two come from the assembler with a UV field generator, a UHV machine casing and a neutronium plate (UHV). Only the fabricator uses it.')
    add('grindless.machine.quantum_fabricator.tooltip.0', 'A UHV casing hall that runs the assembler, circuit assembler, forming press, laser engraver and cutter: up to 1,024 recipes at once, 1,024 times the parallel hatch\'s figure with one (UV hatch: 262,144; UHV hatch: 1,048,576). Choose the machine in the controller\'s machine mode tab: one mode at a time, with the single blocks\' own recipes.')
    add('grindless.machine.quantum_fabricator.tooltip.1', 'Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t), up to the ceiling. Spare voltage overclocks perfectly (every step is twice as fast for four times the power per copy, so the energy per item does not change) and batch mode is on. No energy discount: it saves machines and buses, and time, not power.')
    add('grindless.machine.quantum_fabricator.tooltip.2', 'Circuit assembler recipes that need a cleanroom still do (the sterile one where a recipe says so): the fabricator must stand inside a formed cleanroom. It is 11 wide, 10 high and 12 deep, so it fits the largest cleanroom (13 x 13 x 13 inside); leave one block between its front and the cleanroom wall.')
    add('grindless.machine.quantum_fabricator.tooltip.3', 'Needs, in any casing cell: 1 maintenance hatch, 1 to 2 energy hatches, 2 to 6 input buses, 1 to 4 output buses, 1 to 4 input hatches (the circuit assembler adds molten tin) and optionally 1 parallel hatch. A ring of field ring casings round the walls, laminated glass above it in the side walls, an empty hall inside.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.quantum_fabricator', 'Fabricador Cuántico')
    add('block.grindless.field_ring_casing', 'Carcasa de Anillo de Campo')
    add('tooltip.grindless.field_ring_casing.0', 'Anillo generador de campo del Fabricador Cuántico.')
    add('emi.grindless.info.field_ring_casing.0', 'El bloque de estructura del Fabricador Cuántico: el anillo de generadores de campo alrededor de sus paredes. Salen dos del ensamblador con un generador de campo UV, una carcasa de máquina UHV y una placa de neutronio (UHV). Solo lo usa el fabricador.')
    add('grindless.machine.quantum_fabricator.tooltip.0', 'Una nave de carcasas UHV que ejecuta el ensamblador, el ensamblador de circuitos, la prensa de formado, el grabador láser y el cortador: hasta 1.024 recetas a la vez, 1.024 veces la cifra del hatch de paralelo si lo hay (hatch UV: 262.144; hatch UHV: 1.048.576). Elige la máquina en la pestaña de modo del controlador: un modo a la vez, con las recetas de las máquinas individuales.')
    add('grindless.machine.quantum_fabricator.tooltip.1', 'Cada copia paga su EU/t completo, así que los hatches de energía fijan cuántas corren: floor(voltaje del hatch / EU/t de la receta), hasta el techo. El voltaje sobrante sobrecarga a la perfección (cada paso es el doble de rápido por cuatro veces la potencia de cada copia, así que la energía por objeto no cambia) y el modo por lotes está activo. Sin descuento de energía: ahorra máquinas, buses y tiempo, no energía.')
    add('grindless.machine.quantum_fabricator.tooltip.2', 'Las recetas del ensamblador de circuitos que piden sala blanca la siguen pidiendo (la estéril donde la receta lo diga): el fabricador debe estar dentro de una sala blanca formada. Mide 11 de ancho, 10 de alto y 12 de fondo, así que cabe en la mayor sala blanca (13 x 13 x 13 por dentro); deja un bloque entre su frente y la pared de la sala blanca.')
    add('grindless.machine.quantum_fabricator.tooltip.3', 'Necesita, en cualquier celda de carcasa: 1 hatch de mantenimiento, 1 a 2 hatches de energía, 2 a 6 buses de entrada, 1 a 4 buses de salida, 1 a 4 hatches de entrada (el ensamblador de circuitos añade estaño fundido) y opcionalmente 1 hatch de paralelo. Un anillo de carcasas de anillo de campo alrededor de las paredes, cristal laminado encima en los lados y un salón vacío dentro.')
})
