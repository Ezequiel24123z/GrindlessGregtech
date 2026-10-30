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


    add('grindless.machine.universal_processing_factory.tooltip.0', '§7Eleven machines in one, chosen in the machine mode tab.')

    add('grindless.machine.universal_assembly_factory.tooltip.0', '§7Assembler and circuit assembler in one, chosen in the machine mode tab.')

    add('grindless.machine.universal_separation_factory.tooltip.0', '§7Seven machines in one, chosen in the machine mode tab.')

    add('grindless.machine.universal_mixing_factory.tooltip.0', '§7Mixer, chemical reactor, chemical bath and ore washer in one.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.universal_processing_factory', 'Fábrica universal de procesado')
    add('block.gtceu.universal_assembly_factory', 'Fábrica universal de ensamblaje')
    add('block.gtceu.universal_separation_factory', 'Fábrica universal de separación')
    add('block.gtceu.universal_mixing_factory', 'Fábrica universal de mezcla')


    add('grindless.machine.universal_processing_factory.tooltip.0', '§7Once máquinas en una, a elegir en la pestaña de modo de máquina.')

    add('grindless.machine.universal_assembly_factory.tooltip.0', '§7Ensambladora y ensambladora de circuitos en una, a elegir en la pestaña de modo.')

    add('grindless.machine.universal_separation_factory.tooltip.0', '§7Siete máquinas en una, a elegir en la pestaña de modo de máquina.')

    add('grindless.machine.universal_mixing_factory.tooltip.0', '§7Mezcladora, reactor químico, baño químico y lavadora de mena en una.')
})
