// priority: 500
// Gregtech Grindless - names and tooltips of ZPM's Saturn science machines (startup_scripts/grindless/zpm/saturn_science.js):
// gtceu:plume_sampler, gtceu:ring_seismometer and their recipe types.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.plume_sampler', 'Plume Sampler')
    add('block.gtceu.ring_seismometer', 'Ring Seismometer')
    add('gtceu.plume_sampling', 'Plume Sampling')
    add('gtceu.kronoseismology', 'Kronoseismology')

    add('grindless.machine.plume_sampler.tooltip.0', '§7Flies a cartridge through Enceladus\'s plume.')
    add('grindless.machine.plume_sampler.no_voiding', 'The sampler keeps its grains and brine. Disable voiding.')

    add('grindless.machine.ring_seismometer.tooltip.0', '§7Reads Saturn\'s interior from its ring waves.')
    add('grindless.machine.ring_seismometer.no_voiding', 'The seismometer keeps its data. Disable voiding.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.plume_sampler', 'Muestreador de penacho')
    add('block.gtceu.ring_seismometer', 'Sismómetro de anillos')
    add('gtceu.plume_sampling', 'Muestreo de penacho')
    add('gtceu.kronoseismology', 'Cronosismología')

    add('grindless.machine.plume_sampler.tooltip.0', '§7Hace volar un cartucho por la columna de Encélado.')
    add('grindless.machine.plume_sampler.no_voiding', 'El muestreador conserva sus granos y su salmuera. Desactiva el descarte.')

    add('grindless.machine.ring_seismometer.tooltip.0', '§7Lee el interior de Saturno por las ondas de sus anillos.')
    add('grindless.machine.ring_seismometer.no_voiding', 'El sismómetro conserva sus datos. Desactiva el descarte.')
})
