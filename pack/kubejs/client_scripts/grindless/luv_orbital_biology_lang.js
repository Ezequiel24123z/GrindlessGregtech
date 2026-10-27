// priority: 7300
// B4 controller names, recipe categories and operating/containment instructions.
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.zero_g_crystal_grower': 'Zero-G Crystal Grower',
    'gtceu.microgravity_crystal_growth': 'Microgravity Crystal Growth',
    'block.gtceu.hydroponic_ring': 'Rotating Hydroponic Ring',
    'block.gtceu.organoid_lab': 'Organoid Lab',
    'gtceu.organoid_assembly': 'Organoid Assembly',
    'grindless.machine.zero_g_crystal_grower.tooltip.0': 'Orbit only. Circuits 1-5 grow raw crystal chips with 100% certainty in 3,000 ticks, at GregTech\'s original dopant doses. Circuit 6 grows a sapphire test mass.',
    'grindless.machine.zero_g_crystal_grower.tooltip.1': '5x5x5 station module; inert 3x3x3 growth core and laminated ports. Requires a cleanroom or cleaning maintenance hatch in its maintenance cell. 1-2 energy hatches, input/output buses and input hatches.',
    'grindless.machine.hydroponic_ring.tooltip.0': 'Orbit-only molecular farming, not a crop multiplier. Circuit 5: kept barley seed, water and CO2 to neurotrophic factor. Circuit 6: kept tobacco seed to plant collagen. Both also make biomass and oxygen.',
    'grindless.machine.hydroponic_ring.tooltip.1': '15x15x3 annular soil bed under tempered glass; titanium spokes join a 3x3x3 hub with four magnetic bearings. Docking controller on the near rim. Hub: 1-2 energy hatches, input/output buses, 1-2 input hatches and 2 output hatches. Biomass feeds the biofoundry; oxygen supports the station. No ordinary crop mode; no voiding.',
    'grindless.machine.hydroponic_ring.no_voiding': 'Keep biomass and oxygen for the biofoundry and station. Disable item and fluid voiding.',
    'grindless.machine.organoid_lab.tooltip.0': 'Orbit only, with a cleanroom or cleaning maintenance hatch. Circuit 1 grows a neural organoid from stem cells, sterile medium and the ring\'s neurotrophic factor. Circuit 2 assembles a neuro processing unit at 30,720 EU/t for 1,563 ticks.',
    'grindless.machine.organoid_lab.tooltip.1': '5x5x5 sealed plascrete/cleanroom-glass module, laminated incubator, four filter casings and a maintenance cell, docked to station truss. 1-2 energy hatches, input/output buses and input hatches. Keeps all products: no voiding.',
    'grindless.machine.organoid_lab.no_voiding': 'The organoid lab keeps its cultures and processors. Disable item and fluid voiding.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})

ClientEvents.lang('es_es', function (event) {
  var entries = {
    'block.gtceu.zero_g_crystal_grower': 'Cultivador de cristales en gravedad cero',
    'gtceu.microgravity_crystal_growth': 'Crecimiento cristalino en microgravedad',
    'block.gtceu.hydroponic_ring': 'Anillo hidropónico giratorio',
    'block.gtceu.organoid_lab': 'Laboratorio de organoides',
    'gtceu.organoid_assembly': 'Ensamblaje de organoides',
    'grindless.machine.zero_g_crystal_grower.tooltip.0': 'Solo en órbita. Los circuitos 1-5 producen chips de cristal en bruto con certeza del 100% en 3000 ticks, con las dosis originales de dopante de GregTech. El circuito 6 produce una masa de prueba de zafiro.',
    'grindless.machine.zero_g_crystal_grower.tooltip.1': 'Módulo de estación de 5x5x5; núcleo inerte de 3x3x3 y ventanas laminadas. Requiere sala limpia o escotilla de mantenimiento con limpieza. 1-2 escotillas de energía, buses de entrada/salida y escotillas de entrada.',
    'grindless.machine.hydroponic_ring.tooltip.0': 'Agricultura molecular solo en órbita, no un multiplicador de cultivos. Circuito 5: semilla de cebada conservada, agua y CO2 para factor neurotrófico. Circuito 6: semilla de tabaco conservada para colágeno vegetal. Ambos producen biomasa y oxígeno.',
    'grindless.machine.hydroponic_ring.tooltip.1': 'Lecho anular de tierra de 15x15x3 bajo vidrio templado; radios de titanio hasta un núcleo de 3x3x3 con cuatro cojinetes magnéticos. Controlador de atraque en el borde cercano. Núcleo: 1-2 escotillas de energía, buses de entrada/salida, 1-2 escotillas de entrada y 2 de salida. Biomasa para la biofactoría y oxígeno para la estación. Sin modo de cultivos ordinarios ni descarte.',
    'grindless.machine.hydroponic_ring.no_voiding': 'Conserva la biomasa y el oxígeno para la biofactoría y la estación. Desactiva el descarte de objetos y fluidos.',
    'grindless.machine.organoid_lab.tooltip.0': 'Solo en órbita, con sala limpia o escotilla de mantenimiento con limpieza. Circuito 1: células madre, medio estéril y factor neurotrófico del anillo para un organoide neuronal. Circuito 2: unidad de procesamiento neuronal a 30 720 EU/t durante 1563 ticks.',
    'grindless.machine.organoid_lab.tooltip.1': 'Módulo sellado de 5x5x5 de plascreta y vidrio de sala limpia, incubadora laminada, cuatro filtros y celda de mantenimiento, unido a la estructura de estación. 1-2 escotillas de energía, buses de entrada/salida y escotillas de entrada. Conserva todos los productos: sin descarte.',
    'grindless.machine.organoid_lab.no_voiding': 'El laboratorio conserva sus cultivos y procesadores. Desactiva el descarte de objetos y fluidos.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})
