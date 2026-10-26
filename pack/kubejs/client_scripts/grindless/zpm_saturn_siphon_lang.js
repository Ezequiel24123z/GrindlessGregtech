// Gregtech Grindless - names and tooltips of ZPM's Saturn siphon machines (startup_scripts/grindless/zpm/saturn_siphon.js):
// gtceu:gas_giant_siphon, gtceu:isotope_column, gtceu:ring_harvester and their recipe types.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.gas_giant_siphon', 'Gas Giant Siphon')
    add('block.gtceu.isotope_column', 'Isotope Column')
    add('block.gtceu.ring_harvester', 'Ring Harvester')
    add('gtceu.gas_giant_siphon', 'Gas Giant Siphon')
    add('gtceu.cryogenic_isotope_separation', 'Cryogenic Isotope Separation')
    add('gtceu.ring_harvesting', 'Ring Harvesting')

    add('grindless.machine.gas_giant_siphon.tooltip.0', 'A tethered probe dipped into Saturn\'s cloud deck. Only works in Saturn orbit. The Jovian atmosphere survey is the catalyst (never used up) and a scoop head wears slowly.')
    add('grindless.machine.gas_giant_siphon.tooltip.1', 'Circuit 1: 16,000 mB hydrogen + 10,000 mB Saturn helium. Circuit 2: 2,000 mB methane + 500 mB ammonia. 122,880 EU/t (ZPM), 100 t.')
    add('grindless.machine.gas_giant_siphon.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 to 3 output hatches, and 12 or more station truss casings in the floor and the first ring. The tether winch stands in the middle.')

    add('grindless.machine.isotope_column.tooltip.0', 'A cryogenic column. Only works in Saturn orbit. Circuit 1: 10,000 mB Saturn helium -> 20 mB helium-3 + 9,980 mB helium.')
    add('grindless.machine.isotope_column.tooltip.1', 'Circuit 2: 16,000 mB hydrogen -> 50 mB deuterium + 15,950 mB hydrogen. The bulk source of both isotopes, with Uranus. The Moon\'s helium-3 trickle is untouched.')
    add('grindless.machine.isotope_column.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 input hatches, 1 to 3 output hatches, and 8 or more frostproof casings in the floor.')

    add('grindless.machine.ring_harvester.tooltip.0', 'Net booms and a melt tank on the ring plane. Only works in Saturn orbit. Circuit 1: a ring sail net (worn slowly) -> 4,000 mB ring ice + 1 silicon dioxide dust.')
    add('grindless.machine.ring_harvester.tooltip.1', 'Circuit 2: a glass bottle + the net -> 1 ring ice sample, the seed of the Saturnian quantum seed. 122,880 EU/t (ZPM).')
    add('grindless.machine.ring_harvester.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 output hatches, and 10 or more station truss casings in the deck.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.gas_giant_siphon', 'Sifón de gigante gaseoso')
    add('block.gtceu.isotope_column', 'Columna de isótopos')
    add('block.gtceu.ring_harvester', 'Cosechadora de anillos')
    add('gtceu.gas_giant_siphon', 'Sifón de gigante gaseoso')
    add('gtceu.cryogenic_isotope_separation', 'Separación criogénica de isótopos')
    add('gtceu.ring_harvesting', 'Cosecha de anillos')

    add('grindless.machine.gas_giant_siphon.tooltip.0', 'Una sonda con cable sumergida en las nubes de Saturno. Solo funciona en la órbita de Saturno. El estudio de la atmósfera joviana es el catalizador (no se gasta) y la cabeza de cuchara se desgasta despacio.')
    add('grindless.machine.gas_giant_siphon.tooltip.1', 'Circuito 1: 16 000 mB de hidrógeno + 10 000 mB de helio de Saturno. Circuito 2: 2 000 mB de metano + 500 mB de amoníaco. 122 880 EU/t (ZPM), 100 t.')
    add('grindless.machine.gas_giant_siphon.tooltip.2', 'Necesita: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, de 1 a 3 escotillas de salida y 12 o más carcasas de armazón de estación en el suelo y el primer anillo. El cabrestante del cable va en el centro.')

    add('grindless.machine.isotope_column.tooltip.0', 'Una columna criogénica. Solo funciona en la órbita de Saturno. Circuito 1: 10 000 mB de helio de Saturno -> 20 mB de helio-3 + 9 980 mB de helio.')
    add('grindless.machine.isotope_column.tooltip.1', 'Circuito 2: 16 000 mB de hidrógeno -> 50 mB de deuterio + 15 950 mB de hidrógeno. La fuente a granel de ambos isótopos, junto con Urano. El goteo de helio-3 de la Luna no cambia.')
    add('grindless.machine.isotope_column.tooltip.2', 'Necesita: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 escotillas de entrada, de 1 a 3 de salida y 8 o más carcasas a prueba de escarcha en el suelo.')

    add('grindless.machine.ring_harvester.tooltip.0', 'Brazos con red y un tanque de fusión en el plano de los anillos. Solo funciona en la órbita de Saturno. Circuito 1: una red de vela de anillo (se desgasta despacio) -> 4 000 mB de hielo de anillo + 1 de polvo de dióxido de silicio.')
    add('grindless.machine.ring_harvester.tooltip.1', 'Circuito 2: una botella de vidrio + la red -> 1 muestra de hielo de anillo, la semilla de la semilla cuántica saturniana. 122 880 EU/t (ZPM).')
    add('grindless.machine.ring_harvester.tooltip.2', 'Necesita: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de salida y 10 o más carcasas de armazón de estación en la cubierta.')
})
