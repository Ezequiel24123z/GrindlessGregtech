// priority: 400
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

    add('grindless.machine.gas_giant_siphon.tooltip.0', '§7Dips a tethered probe into Saturn\'s cloud deck.')

    add('grindless.machine.isotope_column.tooltip.0', '§7A cryogenic column that separates helium-3.')

    add('grindless.machine.ring_harvester.tooltip.0', '§7Harvests ring ice with net booms and a melt tank.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.gas_giant_siphon', 'Sifón de gigante gaseoso')
    add('block.gtceu.isotope_column', 'Columna de isótopos')
    add('block.gtceu.ring_harvester', 'Cosechadora de anillos')
    add('gtceu.gas_giant_siphon', 'Sifón de gigante gaseoso')
    add('gtceu.cryogenic_isotope_separation', 'Separación criogénica de isótopos')
    add('gtceu.ring_harvesting', 'Cosecha de anillos')

    add('grindless.machine.gas_giant_siphon.tooltip.0', '§7Sumerge una sonda con cable en las nubes de Saturno.')

    add('grindless.machine.isotope_column.tooltip.0', '§7Una columna criogénica que separa helio-3.')

    add('grindless.machine.ring_harvester.tooltip.0', '§7Recoge hielo de los anillos con redes y un tanque de fusión.')
})
