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

    add('grindless.machine.waste_retrieval_plant.tooltip.0', 'IV\'s stored waste is dissolved again, as at Hanford and Sellafield. Programmed circuit 1: 4 radioactive waste + 1,000 mB nitric acid -> 1 radium dust + 1,000 mB actinide raffinate + 2 synroc block + 500 mB nitrogen dioxide.')
    add('grindless.machine.waste_retrieval_plant.tooltip.1', 'Circuit 2: 1 radium capsule (worn 1% a run) + 1,000 mB helium (not used up) -> 250 mB radon; a worn capsule leaves 4 lead dust. Circuit 3: 4 radium dust + 1 platinum foil -> 1 radium capsule.')
    add('grindless.machine.waste_retrieval_plant.tooltip.2', 'The raffinate goes to the Actinide Partitioning Plant, the nitrogen dioxide to nitric acid, the radon to the Mk2 fuel and plasma lines. Synroc is the sealed waste form: keep it. GT--\'s own waste recipes stay as they are.')
    add('grindless.machine.waste_retrieval_plant.tooltip.3', 'Needs, in the front and back rows: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches and 1 to 3 output hatches, and 4 or more radiation proof casings among them. Refuses to run while it voids.')
    add('grindless.machine.waste_retrieval_plant.no_voiding', 'Set the controller to not void items or fluids: the waste must be kept.')

    add('grindless.machine.actinide_partitioning_plant.tooltip.0', 'TRUEX and SANEX in mixer-settler banks. Programmed circuit 1: 1,000 mB actinide raffinate (+ 100 mB kerosene solvent charge, not used up) -> 1,000 mB minor actinide strip + 1,000 mB lanthanide nitrate.')
    add('grindless.machine.actinide_partitioning_plant.tooltip.1', 'Circuit 2: 1,000 mB minor actinide strip -> 2 americium dust + 1 curium oxide + 1 synroc block.')
    add('grindless.machine.actinide_partitioning_plant.tooltip.2', 'Americium is the Mk3 fuel\'s, curium oxide is stored for UV, synroc is the sealed waste form. The lanthanide nitrate goes back to the extraction cascade through a chemical reactor with hydrochloric acid (leach liquor, circuit 2).')
    add('grindless.machine.actinide_partitioning_plant.tooltip.3', 'Needs, in the front and back rows: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches and 1 to 3 output hatches, and 4 or more radiation proof casings among them. Refuses to run while it voids.')
    add('grindless.machine.actinide_partitioning_plant.no_voiding', 'Set the controller to not void items or fluids: the actinides must be kept.')

    add('material.gtceu.minor_actinide_strip', 'Minor Actinide Strip')
    add('material.gtceu.lanthanide_nitrate', 'Lanthanide Nitrate')
    add('tooltip.grindless.minor_actinide_strip', 'The americium and curium stripped from the raffinate. Split it in the Actinide Partitioning Plant (circuit 2).')
    add('tooltip.grindless.lanthanide_nitrate', 'Left behind by the partitioning. A chemical reactor with hydrochloric acid turns it into rare earth chloride solution for the extraction cascade.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.waste_retrieval_plant', 'Planta de recuperación de residuos')
    add('block.gtceu.actinide_partitioning_plant', 'Planta de partición de actínidos')
    add('gtceu.waste_retrieval', 'Recuperación de residuos')
    add('gtceu.actinide_partitioning', 'Partición de actínidos')

    add('grindless.machine.waste_retrieval_plant.tooltip.0', 'Los residuos almacenados de IV se disuelven de nuevo, como en Hanford y Sellafield. Circuito programado 1: 4 de residuo radiactivo + 1 000 mB de ácido nítrico -> 1 de polvo de radio + 1 000 mB de refinado de actínidos + 2 de bloque de synroc + 500 mB de dióxido de nitrógeno.')
    add('grindless.machine.waste_retrieval_plant.tooltip.1', 'Circuito 2: 1 cápsula de radio (se desgasta un 1 % por ciclo) + 1 000 mB de helio (no se gasta) -> 250 mB de radón; una cápsula gastada deja 4 de polvo de plomo. Circuito 3: 4 de polvo de radio + 1 de lámina de platino -> 1 cápsula de radio.')
    add('grindless.machine.waste_retrieval_plant.tooltip.2', 'El refinado va a la Planta de partición de actínidos, el dióxido de nitrógeno al ácido nítrico y el radón a las líneas de combustible y plasma del Mk2. El synroc es la forma sellada del residuo: guárdalo. Las recetas de residuos de GT-- se quedan como están.')
    add('grindless.machine.waste_retrieval_plant.tooltip.3', 'Necesita, en las filas delantera y trasera: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada y de 1 a 3 de salida, y 4 o más carcasas antirradiación entre ellos. Se niega a funcionar si anula.')
    add('grindless.machine.waste_retrieval_plant.no_voiding', 'Configura el controlador para no anular objetos ni fluidos: el residuo debe conservarse.')

    add('grindless.machine.actinide_partitioning_plant.tooltip.0', 'TRUEX y SANEX en bancos de mezcla-decantación. Circuito programado 1: 1 000 mB de refinado de actínidos (+ 100 mB de queroseno como disolvente, no se gasta) -> 1 000 mB de extracto de actínidos menores + 1 000 mB de nitrato de lantánidos.')
    add('grindless.machine.actinide_partitioning_plant.tooltip.1', 'Circuito 2: 1 000 mB de extracto de actínidos menores -> 2 de polvo de americio + 1 de óxido de curio + 1 de bloque de synroc.')
    add('grindless.machine.actinide_partitioning_plant.tooltip.2', 'El americio es del combustible Mk3, el óxido de curio se guarda para UV y el synroc es la forma sellada del residuo. El nitrato de lantánidos vuelve a la cascada de extracción por un reactor químico con ácido clorhídrico (lixiviado, circuito 2).')
    add('grindless.machine.actinide_partitioning_plant.tooltip.3', 'Necesita, en las filas delantera y trasera: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada y de 1 a 3 de salida, y 4 o más carcasas antirradiación entre ellos. Se niega a funcionar si anula.')
    add('grindless.machine.actinide_partitioning_plant.no_voiding', 'Configura el controlador para no anular objetos ni fluidos: los actínidos deben conservarse.')

    add('material.gtceu.minor_actinide_strip', 'Extracto de actínidos menores')
    add('material.gtceu.lanthanide_nitrate', 'Nitrato de lantánidos')
    add('tooltip.grindless.minor_actinide_strip', 'El americio y el curio extraídos del refinado. Sepáralos en la Planta de partición de actínidos (circuito 2).')
    add('tooltip.grindless.lanthanide_nitrate', 'Lo que deja la partición. Un reactor químico con ácido clorhídrico lo convierte en solución de cloruros de tierras raras para la cascada de extracción.')
})
