// Gregtech Grindless - names and tooltips of UV's Neptune orbit machines (startup_scripts/grindless/uv/neptune.js):
// gtceu:neptune_deep_siphon (on ZPM's gtceu:ice_giant_siphon type), gtceu:triton_geyser_sampler and its recipe type gtceu:triton_plume.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neptune_deep_siphon', 'Neptune Deep Siphon')
    add('block.gtceu.triton_geyser_sampler', 'Triton Geyser Sampler')
    add('gtceu.triton_plume', 'Triton Geyser Sampling')

    add('grindless.machine.neptune_deep_siphon.tooltip.0', 'Lowers the scoop on a longer tether, below Neptune\'s methane deck. The Neptune sample (kept) tells it how deep. Runs only the siphon type\'s Neptune rows (the Ice-Giant Siphon refuses them). Only works in Neptune orbit.')
    add('grindless.machine.neptune_deep_siphon.tooltip.1', 'Circuit 4: 16,000 mB Neptune hydrogen + 4,000 mB Neptune helium. 5: 4,000 mB methane + 500 mB hydrogen sulfide. 491,520 EU/t (UV), 100 t. The scoop head wears (0.25 % per run).')
    add('grindless.machine.neptune_deep_siphon.tooltip.2', 'Needs: 1 or 2 energy hatches (UV), 1 or 2 input buses, 1 to 3 output hatches, and 14 or more station truss casings in the floor. The tether winch stands in the middle.')
    add('grindless.machine.neptune_deep_siphon.no_voiding', 'The deep siphon keeps its gases. Disable voiding.')

    add('grindless.machine.triton_geyser_sampler.tooltip.0', 'Flies an aerogel cartridge through the nitrogen geysers of Triton. The Triton probe recording (kept) tells it where they erupt. Only works in Neptune orbit.')
    add('grindless.machine.triton_geyser_sampler.tooltip.1', 'Circuit 1: 1 aerogel cartridge -> 8,000 mB Triton nitrogen + 1 tholin. Circuit 2: 1 aerogel cartridge -> 1 Triton ice core + 2,000 mB Triton nitrogen. 491,520 EU/t (UV), 200 t.')
    add('grindless.machine.triton_geyser_sampler.tooltip.2', 'Needs: 1 or 2 energy hatches (UV), 1 or 2 input buses, 1 or 2 output buses, 1 or 2 output hatches, and 14 or more station truss casings in the floor. A titanium launch rail runs through the middle.')
    add('grindless.machine.triton_geyser_sampler.no_voiding', 'The sampler keeps its ice cores and gases. Disable voiding.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neptune_deep_siphon', 'Sif\u00f3n profundo de Neptuno')
    add('block.gtceu.triton_geyser_sampler', 'Muestreador de g\u00e9iseres de Trit\u00f3n')
    add('gtceu.triton_plume', 'Muestreo de g\u00e9iseres de Trit\u00f3n')

    add('grindless.machine.neptune_deep_siphon.tooltip.0', 'Baja el cazo con un cable m\u00e1s largo, por debajo de la capa de metano de Neptuno. La muestra de Neptuno (se conserva) le dice a qu\u00e9 profundidad. Solo hace las recetas de Neptuno del tipo sif\u00f3n (el sif\u00f3n de gigante de hielo las rechaza). Solo funciona en la \u00f3rbita de Neptuno.')
    add('grindless.machine.neptune_deep_siphon.tooltip.1', 'Circuito 4: 16.000 mB de hidr\u00f3geno de Neptuno + 4.000 mB de helio de Neptuno. 5: 4.000 mB de metano + 500 mB de sulfuro de hidr\u00f3geno. 491.520 EU/t (UV), 100 t. El cabezal del cazo se desgasta (0,25 % por ciclo).')
    add('grindless.machine.neptune_deep_siphon.tooltip.2', 'Necesita: 1 o 2 escotillas de energ\u00eda (UV), 1 o 2 buses de entrada, de 1 a 3 escotillas de salida y 14 o m\u00e1s carcasas de celos\u00eda de estaci\u00f3n en el suelo. El torno del cable est\u00e1 en el centro.')
    add('grindless.machine.neptune_deep_siphon.no_voiding', 'El sif\u00f3n profundo guarda sus gases. Desactiva la eliminaci\u00f3n.')

    add('grindless.machine.triton_geyser_sampler.tooltip.0', 'Hace volar un cartucho de aerogel a trav\u00e9s de los g\u00e9iseres de nitr\u00f3geno de Trit\u00f3n. La grabaci\u00f3n de la sonda de Trit\u00f3n (se conserva) le dice d\u00f3nde entran en erupci\u00f3n. Solo funciona en la \u00f3rbita de Neptuno.')
    add('grindless.machine.triton_geyser_sampler.tooltip.1', 'Circuito 1: 1 cartucho de aerogel -> 8.000 mB de nitr\u00f3geno de Trit\u00f3n + 1 tolina. Circuito 2: 1 cartucho de aerogel -> 1 n\u00facleo de hielo de Trit\u00f3n + 2.000 mB de nitr\u00f3geno de Trit\u00f3n. 491.520 EU/t (UV), 200 t.')
    add('grindless.machine.triton_geyser_sampler.tooltip.2', 'Necesita: 1 o 2 escotillas de energ\u00eda (UV), 1 o 2 buses de entrada, 1 o 2 buses de salida, 1 o 2 escotillas de salida y 14 o m\u00e1s carcasas de celos\u00eda de estaci\u00f3n en el suelo. Un ra\u00edl de lanzamiento de titanio cruza el centro.')
    add('grindless.machine.triton_geyser_sampler.no_voiding', 'El muestreador guarda sus n\u00facleos de hielo y sus gases. Desactiva la eliminaci\u00f3n.')
})
