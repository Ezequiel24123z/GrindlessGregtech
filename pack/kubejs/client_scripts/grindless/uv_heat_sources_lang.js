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

    add('grindless.machine.heat_source_works.tooltip.0', 'Curium-244 heat sources behind hot cell walls. Programmed circuit 1: 4 curium oxide -> 1 curium-244 pellet + 1 heavy curium oxide (stored for UHV). Circuit 2: 1 pellet + 1 iridium foil + 1 carbon-carbon aeroshell -> 1 GPHS module (+ iridium scrap, 25%).')
    add('grindless.machine.heat_source_works.tooltip.1', 'Circuit 3: 4 GPHS modules + 8 silicon dust + 8 germanium dust + 1 UV machine hull -> 1 probe RTG. Circuit 4: 1 americium dust -> 8 americium micro sources.')
    add('grindless.machine.heat_source_works.tooltip.2', 'Circuit 5: 1 curium-244 pellet -> 2 curium RTG pellets; IV\'s RTG cell burns one for 3 times as long as a plutonium pellet. The scrap melts back into the iridium foil route.')
    add('grindless.machine.heat_source_works.tooltip.3', 'Needs, in the front and back rows: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, and 4 or more radiation proof casings among them. Refuses to run while it voids.')
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

    add('grindless.machine.heat_source_works.tooltip.0', 'Fuentes de calor de curio-244 tras muros de celda caliente. Circuito programado 1: 4 de oxido de curio -> 1 pastilla de curio-244 + 1 oxido de curio pesado (guardado para UHV). Circuito 2: 1 pastilla + 1 lamina de iridio + 1 aerocasco de carbono-carbono -> 1 modulo GPHS (+ chatarra de iridio, 25%).')
    add('grindless.machine.heat_source_works.tooltip.1', 'Circuito 3: 4 modulos GPHS + 8 de polvo de silicio + 8 de polvo de germanio + 1 casco de maquina UV -> 1 RTG de sonda. Circuito 4: 1 de polvo de americio -> 8 microfuentes de americio.')
    add('grindless.machine.heat_source_works.tooltip.2', 'Circuito 5: 1 pastilla de curio-244 -> 2 pastillas RTG de curio; la celda RTG de IV quema una durante 3 veces lo que una pastilla de plutonio. La chatarra vuelve a fundirse en la ruta de la lamina de iridio.')
    add('grindless.machine.heat_source_works.tooltip.3', 'Necesita, en las filas delantera y trasera: 1 o 2 escotillas de energia (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida y 4 o mas carcasas a prueba de radiacion entre ellos. Se niega a funcionar mientras anula.')
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
