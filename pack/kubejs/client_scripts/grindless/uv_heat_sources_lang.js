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

