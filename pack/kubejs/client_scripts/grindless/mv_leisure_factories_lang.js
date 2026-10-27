// priority: 6300
// Gregtech Grindless - names and tooltips of the four MV universal factories (startup_scripts/grindless/mv/leisure_factories.js).
//
//   gtceu:universal_processing_factory, gtceu:universal_assembly_factory, gtceu:universal_separation_factory,
//   gtceu:universal_mixing_factory   (machine names + tooltips; tooltip.1 is shared by the four)
//
// The mode names in the machine mode tab are GTM's own recipe type names (gtceu.bender, gtceu.lathe...), already translated by GTM.
// Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine wherever it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.universal_processing_factory', 'Universal Processing Factory')
    add('block.gtceu.universal_assembly_factory', 'Universal Assembly Factory')
    add('block.gtceu.universal_separation_factory', 'Universal Separation Factory')
    add('block.gtceu.universal_mixing_factory', 'Universal Mixing Factory')

    add('grindless.machine.universal_factory.tooltip.1', 'Up to 4 recipes at once, each paying its full EU/t. The energy hatches set the voltage (two hatches of one tier count as the next tier) and spare voltage overclocks like a single block. No speed or energy bonus: it saves machines and buses, not power.')

    add('grindless.machine.universal_processing_factory.tooltip.0', 'Eleven machines in one: bender, wiremill, lathe, cutter, extruder, compressor, forge hammer, forming press, polarizer, laser engraver and fluid solidifier. Choose the machine in the controller\'s machine mode tab: one mode runs at a time, with the single blocks\' own recipes.')
    add('grindless.machine.universal_processing_factory.tooltip.2', 'Input buses set to distinct keep different circuits, molds and lenses apart. The cutter\'s water or lubricant and the fluid solidifier\'s fluid go in the input hatch. A new mode starts when the run in progress ends.')
    add('grindless.machine.universal_processing_factory.tooltip.3', 'Needs, in any casing cell: 1 or 2 energy hatches, 1 to 4 input buses, 1 or 2 output buses and up to 1 input hatch; the rest frost proof machine casing. Core: 3 steel gearboxes behind 2 glass windows.')

    add('grindless.machine.universal_assembly_factory.tooltip.0', 'Two machines in one: assembler and circuit assembler. Choose the machine in the controller\'s machine mode tab: one mode runs at a time, with the single blocks\' own recipes.')
    add('grindless.machine.universal_assembly_factory.tooltip.2', 'Input buses set to distinct keep different circuits apart. Solder, glue or plastic goes in an input hatch; a second hatch keeps a second fluid ready. Cleanroom recipes still need a cleanroom.')
    add('grindless.machine.universal_assembly_factory.tooltip.3', 'Needs, in any casing cell: 1 or 2 energy hatches, 1 to 4 input buses, 1 or 2 output buses and up to 2 input hatches; the rest frost proof machine casing. Core: 3 aluminium frames (the arms\' gantry) behind 2 glass windows.')

    add('grindless.machine.universal_separation_factory.tooltip.0', 'Seven machines in one: centrifuge, electrolyzer, thermal centrifuge, macerator, sifter, extractor and electromagnetic separator. Choose the machine in the controller\'s machine mode tab: one mode runs at a time, with the single blocks\' own recipes.')
    add('grindless.machine.universal_separation_factory.tooltip.2', 'Each output hatch holds one fluid, so a recipe that gives two gases needs two hatches. Four runs of a six-output recipe need room: add output buses for the byproducts. A new mode starts when the run in progress ends.')
    add('grindless.machine.universal_separation_factory.tooltip.3', 'Needs, in any casing cell: 1 or 2 energy hatches, 1 or 2 input buses, 1 to 4 output buses, up to 1 input hatch and up to 6 output hatches; the rest frost proof machine casing. Core: 3 steel pipe casings behind 2 glass windows.')

    add('grindless.machine.universal_mixing_factory.tooltip.0', 'Four machines in one: mixer, chemical reactor, chemical bath and ore washer. Choose the machine in the controller\'s machine mode tab: one mode runs at a time, with the single blocks\' own recipes.')
    add('grindless.machine.universal_mixing_factory.tooltip.2', 'Dust-only mixer recipes need no hatch. The chemical reactor takes up to 3 fluids and gives up to 2, each in its own hatch. Input buses set to distinct keep different circuits apart.')
    add('grindless.machine.universal_mixing_factory.tooltip.3', 'Needs, in any casing cell: 1 or 2 energy hatches, 1 to 4 input buses, 1 or 2 output buses, up to 3 input hatches and up to 2 output hatches; the rest frost proof machine casing. Core: 3 blocks of glass (the vats) behind 2 glass windows.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.universal_processing_factory', 'Fábrica universal de procesado')
    add('block.gtceu.universal_assembly_factory', 'Fábrica universal de ensamblaje')
    add('block.gtceu.universal_separation_factory', 'Fábrica universal de separación')
    add('block.gtceu.universal_mixing_factory', 'Fábrica universal de mezcla')

    add('grindless.machine.universal_factory.tooltip.1', 'Hasta 4 recetas a la vez, cada una paga sus EU/t enteros. Las escotillas de energía fijan el voltaje (dos escotillas de un nivel cuentan como el siguiente) y el voltaje sobrante acelera como en una máquina sencilla. Sin bonificación de velocidad ni de energía: ahorra máquinas y buses, no energía.')

    add('grindless.machine.universal_processing_factory.tooltip.0', 'Once máquinas en una: dobladora, trefiladora, torno, cortadora, extrusora, compresor, martillo de forja, prensa de conformado, polarizador, grabador láser y solidificador de fluidos. La máquina se elige en la pestaña de modo del controlador: funciona un modo a la vez, con las recetas de las máquinas sencillas.')
    add('grindless.machine.universal_processing_factory.tooltip.2', 'Los buses de entrada en modo separado mantienen aparte circuitos, moldes y lentes distintos. El agua o el lubricante de la cortadora y el fluido del solidificador van en la escotilla de entrada. Un modo nuevo empieza cuando termina el ciclo en curso.')
    add('grindless.machine.universal_processing_factory.tooltip.3', 'Necesita, en cualquier hueco de carcasa: 1 o 2 escotillas de energía, de 1 a 4 buses de entrada, 1 o 2 buses de salida y hasta 1 escotilla de entrada; el resto, carcasa de máquina a prueba de heladas. Núcleo: 3 cajas de engranajes de acero tras 2 ventanas de cristal.')

    add('grindless.machine.universal_assembly_factory.tooltip.0', 'Dos máquinas en una: ensambladora y ensambladora de circuitos. La máquina se elige en la pestaña de modo del controlador: funciona un modo a la vez, con las recetas de las máquinas sencillas.')
    add('grindless.machine.universal_assembly_factory.tooltip.2', 'Los buses de entrada en modo separado mantienen aparte circuitos distintos. La soldadura, la cola o el plástico van en una escotilla de entrada; una segunda escotilla tiene listo otro fluido. Las recetas de sala limpia siguen pidiendo una sala limpia.')
    add('grindless.machine.universal_assembly_factory.tooltip.3', 'Necesita, en cualquier hueco de carcasa: 1 o 2 escotillas de energía, de 1 a 4 buses de entrada, 1 o 2 buses de salida y hasta 2 escotillas de entrada; el resto, carcasa de máquina a prueba de heladas. Núcleo: 3 armazones de aluminio (el pórtico de los brazos) tras 2 ventanas de cristal.')

    add('grindless.machine.universal_separation_factory.tooltip.0', 'Siete máquinas en una: centrifugadora, electrolizador, centrifugadora térmica, trituradora, tamizadora, extractor y separador electromagnético. La máquina se elige en la pestaña de modo del controlador: funciona un modo a la vez, con las recetas de las máquinas sencillas.')
    add('grindless.machine.universal_separation_factory.tooltip.2', 'Cada escotilla de salida guarda un solo fluido, así que una receta que da dos gases pide dos escotillas. Cuatro ciclos de una receta de seis salidas necesitan sitio: añade buses de salida para los subproductos. Un modo nuevo empieza cuando termina el ciclo en curso.')
    add('grindless.machine.universal_separation_factory.tooltip.3', 'Necesita, en cualquier hueco de carcasa: 1 o 2 escotillas de energía, 1 o 2 buses de entrada, de 1 a 4 buses de salida, hasta 1 escotilla de entrada y hasta 6 escotillas de salida; el resto, carcasa de máquina a prueba de heladas. Núcleo: 3 carcasas de tubería de acero tras 2 ventanas de cristal.')

    add('grindless.machine.universal_mixing_factory.tooltip.0', 'Cuatro máquinas en una: mezcladora, reactor químico, baño químico y lavadora de mena. La máquina se elige en la pestaña de modo del controlador: funciona un modo a la vez, con las recetas de las máquinas sencillas.')
    add('grindless.machine.universal_mixing_factory.tooltip.2', 'Las mezclas solo de polvos no piden escotilla. El reactor químico toma hasta 3 fluidos y da hasta 2, cada uno en su escotilla. Los buses de entrada en modo separado mantienen aparte circuitos distintos.')
    add('grindless.machine.universal_mixing_factory.tooltip.3', 'Necesita, en cualquier hueco de carcasa: 1 o 2 escotillas de energía, de 1 a 4 buses de entrada, 1 o 2 buses de salida, hasta 3 escotillas de entrada y hasta 2 escotillas de salida; el resto, carcasa de máquina a prueba de heladas. Núcleo: 3 bloques de cristal (las cubas) tras 2 ventanas de cristal.')
})
