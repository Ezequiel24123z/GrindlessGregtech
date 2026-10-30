// priority: 2350
// Gregtech Grindless - names and tooltips of the UV Mega Factory and its five module blocks (startup_scripts/grindless/uv/mega_factory.js).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mega_factory', 'Mega Factory')
    add('block.grindless.separation_module', 'Separation Module')
    add('block.grindless.forming_module', 'Forming Module')
    add('block.grindless.cutting_module', 'Cutting Module')
    add('block.grindless.mixing_module', 'Mixing Module')
    add('block.grindless.heat_module', 'Heat Module')
    add('tooltip.grindless.separation_module.0', 'Mega Factory module: centrifuge, electrolyzer, sifter.')
    add('tooltip.grindless.forming_module.0', 'Mega Factory module: bender, extruder, forming press, wiremill.')
    add('tooltip.grindless.cutting_module.0', 'Mega Factory module: cutter, lathe, laser engraver.')
    add('tooltip.grindless.mixing_module.0', 'Mega Factory module: mixer, chemical bath, autoclave.')
    add('tooltip.grindless.heat_module.0', 'Mega Factory module: arc furnace, alloy smelter.')
    add('grindless.machine.mega_factory.tooltip.0', '§7A UV frame that runs 15 machine types in module sockets.')
    add('emi.grindless.info.mega_factory.0', 'A UV casing frame with four module sockets that runs 15 machine types, as long as the module for the type sits in a socket. Choose the machine in the controller\'s machine mode tab: one mode at a time, with the single blocks\' own recipes. A recipe whose module is missing does not start and says which one.')
    add('emi.grindless.info.mega_factory.1', 'Up to 256 times the parallel hatch\'s figure (UV hatch: 65536). Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t), up to the ceiling. Spare voltage overclocks, and batch mode is on. No speed or energy bonus.')
    add('emi.grindless.info.mega_factory.2', 'Upkeep: every installed module adds 250 mB of PCB coolant to each run, taken from the input hatches once per run (not per copy). Without it the run does not start. More modules, more logistics.')
    add('emi.grindless.info.mega_factory.3', 'Needs, in any casing cell: 1 maintenance hatch, 1 to 2 energy hatches, 2 to 6 input buses, 2 to 6 output buses, 2 to 4 input hatches, 2 to 4 output hatches and optionally 1 parallel hatch. Modules go in the four sockets on the side walls; a socket may stay empty. It is 15 wide, 12 high and 21 deep.')
    add('emi.grindless.info.mega_factory_modules.0', 'The Mega Factory\'s module blocks, made in the assembler from the UV machines they stand for. Each one goes in any of the four sockets on the factory\'s side walls (the preview shows only the separation module, but every socket takes any of the five, or stays empty) and lets the factory run its machine types: separation (centrifuge, electrolyzer, sifter), forming (bender, extruder, forming press, wiremill), cutting (cutter, lathe, laser engraver), mixing (mixer, chemical bath, autoclave), heat (arc furnace, alloy smelter). Every installed module adds 250 mB of PCB coolant to each run.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mega_factory', 'Mega Fábrica')
    add('block.grindless.separation_module', 'Módulo de Separación')
    add('block.grindless.forming_module', 'Módulo de Conformado')
    add('block.grindless.cutting_module', 'Módulo de Corte')
    add('block.grindless.mixing_module', 'Módulo de Mezcla')
    add('block.grindless.heat_module', 'Módulo de Calor')
    add('tooltip.grindless.separation_module.0', 'Módulo de la Mega Fábrica: centrifugadora, electrolizador, tamiz.')
    add('tooltip.grindless.forming_module.0', 'Módulo de la Mega Fábrica: curvadora, extrusora, prensa de formas, trefiladora.')
    add('tooltip.grindless.cutting_module.0', 'Módulo de la Mega Fábrica: cortadora, torno, grabador láser.')
    add('tooltip.grindless.mixing_module.0', 'Módulo de la Mega Fábrica: mezcladora, baño químico, autoclave.')
    add('tooltip.grindless.heat_module.0', 'Módulo de la Mega Fábrica: horno de arco, fundidor de aleaciones.')
    add('grindless.machine.mega_factory.tooltip.0', '§7Un marco UV que ejecuta 15 tipos de máquina con módulos.')
    add('emi.grindless.info.mega_factory.0', 'Un marco de carcasas UV con cuatro ranuras de módulo que ejecuta 15 tipos de máquina, siempre que el módulo del tipo esté en una ranura. Elige la máquina en la pestaña de modo del controlador: un modo a la vez, con las recetas de las máquinas individuales. Una receta cuyo módulo falta no empieza e indica cuál.')
    add('emi.grindless.info.mega_factory.1', 'Hasta 256 veces la cifra de la escotilla de paralelos (escotilla UV: 65536). Cada copia paga su EU/t completo, así que las escotillas de energía fijan cuántas corren: floor(voltaje de la escotilla / EU/t de la receta), hasta el techo. El voltaje sobrante sobrecarga y el modo por lotes está activo. Sin bonus de velocidad ni de energía.')
    add('emi.grindless.info.mega_factory.2', 'Mantenimiento: cada módulo instalado añade 250 mB de refrigerante de PCB a cada ejecución, tomados una vez por ejecución de las escotillas de entrada (no por copia). Sin él la ejecución no empieza. Más módulos, más logística.')
    add('emi.grindless.info.mega_factory.3', 'Necesita, en cualquier celda de carcasa: 1 escotilla de mantenimiento, 1 a 2 escotillas de energía, 2 a 6 buses de entrada, 2 a 6 buses de salida, 2 a 4 escotillas de entrada, 2 a 4 escotillas de salida y opcionalmente 1 escotilla de paralelos. Los módulos van en las cuatro ranuras de las paredes laterales; una ranura puede quedar vacía. Mide 15 de ancho, 12 de alto y 21 de fondo.')
    add('emi.grindless.info.mega_factory_modules.0', 'Los bloques de módulo de la Mega Fábrica, hechos en el ensamblador con las máquinas UV que representan. Cada uno va en cualquiera de las cuatro ranuras de las paredes laterales de la fábrica (la vista previa solo muestra el módulo de separación, pero cada ranura acepta cualquiera de los cinco, o queda vacía) y deja a la fábrica ejecutar sus tipos de máquina: separación (centrifugadora, electrolizador, tamiz), conformado (curvadora, extrusora, prensa de formas, trefiladora), corte (cortadora, torno, grabador láser), mezcla (mezcladora, baño químico, autoclave), calor (horno de arco, fundidor de aleaciones). Cada módulo instalado añade 250 mB de refrigerante de PCB a cada ejecución.')
})
