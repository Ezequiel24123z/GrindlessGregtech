// priority: 2700
// Gregtech Grindless - names and tooltips of UV's Heat Source Works and the four items only it makes
// (startup_scripts/grindless/uv/heat_sources.js):
//
//   gtceu:heat_source_works   machine name + tooltips + no-voiding refusal
//   gtceu:heat_source         recipe type name
//   grindless:probe_rtg / americium_micro_source / curium_rtg_pellet / heavy_curium_oxide
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.heat_source_works', 'Heat Source Works')
    add('gtceu.heat_source', 'Heat Source')

    add('grindless.machine.heat_source_works.tooltip.0', '§7Makes curium-244 heat sources behind hot cell walls.')
    add('grindless.machine.heat_source_works.no_voiding', 'Set the controller to not void items: the heavy curium must be kept.')

    add('item.grindless.probe_rtg', 'Probe RTG')
    add('tooltip.grindless.probe_rtg.0', 'Four GPHS modules and a thermocouple stack in one frame: the probe\'s power for decades.')
    add('tooltip.grindless.probe_rtg.1', 'Made in the Heat Source Works (circuit 3).')
    add('item.grindless.americium_micro_source', 'Americium Micro Source')
    add('tooltip.grindless.americium_micro_source.0', 'A sealed grain of americium-241, a smoke detector\'s source in miniature.')
    add('tooltip.grindless.americium_micro_source.1', 'Made in the Heat Source Works (circuit 4).')
    add('item.grindless.curium_rtg_pellet', 'Curium RTG Pellet')
    add('tooltip.grindless.curium_rtg_pellet.0', 'IV\'s RTG cell burns it 3 times as long as a plutonium pellet.')
    add('tooltip.grindless.curium_rtg_pellet.1', 'Made in the Heat Source Works (circuit 5).')
    add('item.grindless.heavy_curium_oxide', 'Heavy Curium Oxide')
    add('tooltip.grindless.heavy_curium_oxide.0', 'Curium-245 and curium-246: too heavy and too hot to throw away. Keep it contained.')
    add('tooltip.grindless.heavy_curium_oxide.1', 'Stored for UHV.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.heat_source_works', 'Planta de Fuentes de Calor')
    add('gtceu.heat_source', 'Fuente de calor')

    add('grindless.machine.heat_source_works.tooltip.0', '§7Fabrica fuentes de calor de curio-244 tras muros de celda caliente.')
    add('grindless.machine.heat_source_works.no_voiding', 'Configura el controlador para no anular objetos: el curio pesado debe conservarse.')

    add('item.grindless.probe_rtg', 'RTG de sonda')
    add('tooltip.grindless.probe_rtg.0', 'Cuatro modulos GPHS y una pila de termopares en un marco: la energia de la sonda durante decadas.')
    add('tooltip.grindless.probe_rtg.1', 'Se hace en la Planta de Fuentes de Calor (circuito 3).')
    add('item.grindless.americium_micro_source', 'Microfuente de americio')
    add('tooltip.grindless.americium_micro_source.0', 'Un grano sellado de americio-241, la fuente de un detector de humo en miniatura.')
    add('tooltip.grindless.americium_micro_source.1', 'Se hace en la Planta de Fuentes de Calor (circuito 4).')
    add('item.grindless.curium_rtg_pellet', 'Pastilla RTG de curio')
    add('tooltip.grindless.curium_rtg_pellet.0', 'La celda RTG de IV la quema 3 veces mas que una pastilla de plutonio.')
    add('tooltip.grindless.curium_rtg_pellet.1', 'Se hace en la Planta de Fuentes de Calor (circuito 5).')
    add('item.grindless.heavy_curium_oxide', 'Oxido de curio pesado')
    add('tooltip.grindless.heavy_curium_oxide.0', 'Curio-245 y curio-246: demasiado pesado y caliente para tirarlo. Mantenlo contenido.')
    add('tooltip.grindless.heavy_curium_oxide.1', 'Guardado para UHV.')
})
