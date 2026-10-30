// priority: 7300
// B4 controller names, recipe categories and operating/containment instructions.
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.zero_g_crystal_grower': 'Zero-G Crystal Grower',
    'gtceu.microgravity_crystal_growth': 'Microgravity Crystal Growth',
    'block.gtceu.hydroponic_ring': 'Rotating Hydroponic Ring',
    'block.gtceu.organoid_lab': 'Organoid Lab',
    'gtceu.organoid_assembly': 'Organoid Assembly',
    'grindless.machine.zero_g_crystal_grower.tooltip.0': '§7Grows crystals in orbit, in zero gravity.',
    'grindless.machine.hydroponic_ring.tooltip.0': '§7Grows neurotrophic factor and plant collagen in orbit.',
    'grindless.machine.hydroponic_ring.no_voiding': 'Keep biomass and oxygen for the biofoundry and station. Disable item and fluid voiding.',
    'grindless.machine.organoid_lab.tooltip.0': '§7Grows and assembles neural organoids in orbit.',
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
    'grindless.machine.zero_g_crystal_grower.tooltip.0': '§7Cultiva cristales en órbita, sin gravedad.',
    'grindless.machine.hydroponic_ring.tooltip.0': '§7Cultiva factor neurotrófico y colágeno vegetal en órbita.',
    'grindless.machine.hydroponic_ring.no_voiding': 'Conserva la biomasa y el oxígeno para la biofactoría y la estación. Desactiva el descarte de objetos y fluidos.',
    'grindless.machine.organoid_lab.tooltip.0': '§7Cultiva y ensambla organoides neurales en órbita.',
    'grindless.machine.organoid_lab.no_voiding': 'El laboratorio conserva sus cultivos y procesadores. Desactiva el descarte de objetos y fluidos.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})
