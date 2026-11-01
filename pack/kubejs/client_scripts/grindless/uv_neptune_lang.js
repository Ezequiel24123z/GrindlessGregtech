// priority: 2300
// Gregtech Grindless - names and tooltips of UV's Neptune orbit machines (startup_scripts/grindless/uv/neptune.js):
// gtceu:neptune_deep_siphon (on ZPM's gtceu:ice_giant_siphon type), gtceu:triton_geyser_sampler and its recipe type gtceu:triton_plume.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neptune_deep_siphon', 'Neptune Deep Siphon')
    add('block.gtceu.triton_geyser_sampler', 'Triton Geyser Sampler')
    add('gtceu.triton_plume', 'Triton Geyser Sampling')

    add('grindless.machine.neptune_deep_siphon.tooltip.0', '§7Siphons Neptune\'s deep methane layers on a long tether.')
    add('grindless.machine.neptune_deep_siphon.no_voiding', 'The deep siphon keeps its gases. Disable voiding.')

    add('grindless.machine.triton_geyser_sampler.tooltip.0', '§7Samples Triton\'s nitrogen geysers with an aerogel cartridge.')
    add('grindless.machine.triton_geyser_sampler.no_voiding', 'The sampler keeps its ice cores and gases. Disable voiding.')
})

