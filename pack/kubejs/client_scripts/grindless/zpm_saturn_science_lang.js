// priority: 500
// Gregtech Grindless - names and tooltips of ZPM's Saturn science machines (startup_scripts/grindless/zpm/saturn_science.js):
// gtceu:plume_sampler, gtceu:ring_seismometer and their recipe types.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.plume_sampler', 'Plume Sampler')
    add('block.gtceu.ring_seismometer', 'Ring Seismometer')
    add('gtceu.plume_sampling', 'Plume Sampling')
    add('gtceu.kronoseismology', 'Kronoseismology')

    add('grindless.machine.plume_sampler.tooltip.0', 'Flies an aerogel capture cartridge through Enceladus\'s plume, as Cassini did in 2015. Only works in Saturn orbit.')
    add('grindless.machine.plume_sampler.tooltip.1', '1 aerogel cartridge (used up) -> 2,000 mB Enceladus brine + 4 silica nanograins + 250 mB hydrogen. 122,880 EU/t (ZPM), 400 t. The grains make aerogel, and aerogel makes more cartridges.')
    add('grindless.machine.plume_sampler.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 output hatches, and 14 or more probe bay casings in the floor and the first ring. The capture boom stands in the middle.')
    add('grindless.machine.plume_sampler.no_voiding', 'The sampler keeps its grains and brine. Disable voiding.')

    add('grindless.machine.ring_seismometer.tooltip.0', 'Reads Saturn\'s interior from the waves its oscillations raise in the C ring. Only works in Saturn orbit.')
    add('grindless.machine.ring_seismometer.tooltip.1', 'Circuit 1: a data orb + the Saturn transfer chart (kept) + 100 mB liquid helium -> the Saturn interior model. Circuit 2: the interior model (kept) + a data orb -> the Uranus transfer chart. 122,880 EU/t (ZPM), 600 t.')
    add('grindless.machine.ring_seismometer.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 input hatches, 1 or 2 output buses, and 10 or more station truss casings in the floor. The photometer column stands in the middle.')
    add('grindless.machine.ring_seismometer.no_voiding', 'The seismometer keeps its data. Disable voiding.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.plume_sampler', 'Muestreador de penacho')
    add('block.gtceu.ring_seismometer', 'Sismómetro de anillos')
    add('gtceu.plume_sampling', 'Muestreo de penacho')
    add('gtceu.kronoseismology', 'Cronosismología')

    add('grindless.machine.plume_sampler.tooltip.0', 'Hace pasar un cartucho de captura de aerogel por el penacho de Encélado, como hizo Cassini en 2015. Solo funciona en la órbita de Saturno.')
    add('grindless.machine.plume_sampler.tooltip.1', '1 cartucho de aerogel (se gasta) -> 2 000 mB de salmuera de Encélado + 4 nanogranos de sílice + 250 mB de hidrógeno. 122 880 EU/t (ZPM), 400 t. Los granos hacen aerogel, y el aerogel hace más cartuchos.')
    add('grindless.machine.plume_sampler.tooltip.2', 'Necesita: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de salida y 14 o más carcasas de bahía de sondas en el suelo y el primer anillo. El brazo de captura va en el centro.')
    add('grindless.machine.plume_sampler.no_voiding', 'El muestreador conserva sus granos y su salmuera. Desactiva el descarte.')

    add('grindless.machine.ring_seismometer.tooltip.0', 'Lee el interior de Saturno en las ondas que sus oscilaciones levantan en el anillo C. Solo funciona en la órbita de Saturno.')
    add('grindless.machine.ring_seismometer.tooltip.1', 'Circuito 1: una esfera de datos + la carta de transferencia a Saturno (se conserva) + 100 mB de helio líquido -> el modelo interior de Saturno. Circuito 2: el modelo interior (se conserva) + una esfera de datos -> la carta de transferencia a Urano. 122 880 EU/t (ZPM), 600 t.')
    add('grindless.machine.ring_seismometer.tooltip.2', 'Necesita: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 escotillas de entrada, 1 o 2 buses de salida y 10 o más carcasas de armazón de estación en el suelo. La columna del fotómetro va en el centro.')
    add('grindless.machine.ring_seismometer.no_voiding', 'El sismómetro conserva sus datos. Desactiva el descarte.')
})
