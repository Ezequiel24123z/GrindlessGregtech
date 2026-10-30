// priority: 1400
// Gregtech Grindless - names and tooltips of ZPM's Waste Retrieval Plant and Actinide Partitioning Plant and the GT materials of
// the partitioning line (startup_scripts/grindless/zpm/actinides.js):
//
//   gtceu:waste_retrieval_plant / gtceu:actinide_partitioning_plant   (machine names + tooltips + no-voiding refusals)
//   gtceu:waste_retrieval / gtceu:actinide_partitioning               (recipe type names)
//   material.gtceu.<minor_actinide_strip / lanthanide_nitrate>
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.waste_retrieval_plant', 'Waste Retrieval Plant')
    add('block.gtceu.actinide_partitioning_plant', 'Actinide Partitioning Plant')
    add('gtceu.waste_retrieval', 'Waste Retrieval')
    add('gtceu.actinide_partitioning', 'Actinide Partitioning')

    add('grindless.machine.waste_retrieval_plant.tooltip.0', '§7Dissolves the stored radioactive waste again.')
    add('grindless.machine.waste_retrieval_plant.no_voiding', 'Set the controller to not void items or fluids: the waste must be kept.')

    add('grindless.machine.actinide_partitioning_plant.tooltip.0', '§7Splits actinide raffinate by TRUEX and SANEX.')
    add('grindless.machine.actinide_partitioning_plant.no_voiding', 'Set the controller to not void items or fluids: the actinides must be kept.')

    add('material.gtceu.minor_actinide_strip', 'Minor Actinide Strip')
    add('material.gtceu.lanthanide_nitrate', 'Lanthanide Nitrate')
    add('material.gtceu.radium', 'Radium')
    add('tooltip.grindless.minor_actinide_strip', 'The americium and curium stripped from the raffinate. Split it in the Actinide Partitioning Plant (circuit 2).')
    add('tooltip.grindless.lanthanide_nitrate', 'Left behind by the partitioning. A chemical reactor with hydrochloric acid turns it into rare earth chloride solution for the extraction cascade.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.waste_retrieval_plant', 'Planta de recuperación de residuos')
    add('block.gtceu.actinide_partitioning_plant', 'Planta de partición de actínidos')
    add('gtceu.waste_retrieval', 'Recuperación de residuos')
    add('gtceu.actinide_partitioning', 'Partición de actínidos')

    add('grindless.machine.waste_retrieval_plant.tooltip.0', '§7Disuelve de nuevo los residuos radiactivos almacenados.')
    add('grindless.machine.waste_retrieval_plant.no_voiding', 'Configura el controlador para no anular objetos ni fluidos: el residuo debe conservarse.')

    add('grindless.machine.actinide_partitioning_plant.tooltip.0', '§7Separa el refinado de actínidos mediante TRUEX y SANEX.')
    add('grindless.machine.actinide_partitioning_plant.no_voiding', 'Configura el controlador para no anular objetos ni fluidos: los actínidos deben conservarse.')

    add('material.gtceu.minor_actinide_strip', 'Extracto de actínidos menores')
    add('material.gtceu.lanthanide_nitrate', 'Nitrato de lantánidos')
    add('material.gtceu.radium', 'Radio')
    add('tooltip.grindless.minor_actinide_strip', 'El americio y el curio extraídos del refinado. Sepáralos en la Planta de partición de actínidos (circuito 2).')
    add('tooltip.grindless.lanthanide_nitrate', 'Lo que deja la partición. Un reactor químico con ácido clorhídrico lo convierte en solución de cloruros de tierras raras para la cascada de extracción.')
})
