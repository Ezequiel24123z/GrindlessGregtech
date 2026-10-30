// priority: 8200
// Gregtech Grindless - names and tooltips of LuV B5, the asteroid belt (startup_scripts/grindless/luv/asteroid_belt.js): the harpoon
// anchor drill, the asteroid processor, the optical miner, their recipe types and lines, and the belt's vein samples.
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.harpoon_anchor_drill': 'Harpoon Anchor Drill',
    'block.gtceu.asteroid_processor': 'Asteroid Processor',
    'block.gtceu.optical_miner': 'Optical Miner',
    'gtceu.asteroid_processing': 'Asteroid Processing',
    'gtceu.optical_mining': 'Optical Mining',
    'grindless.machine.harpoon_anchor_drill.tooltip.0': '§7Drills asteroid veins, anchored to the rock with harpoons.',
    'grindless.machine.asteroid_processor.tooltip.0': '§7Splits asteroid metal into iron, nickel and cobalt (Mond process).',
    'grindless.machine.asteroid_processor.no_voiding': 'The asteroid processor keeps its PGM concentrate. Disable item voiding.',
    'grindless.machine.optical_miner.tooltip.0': '§7Spalls asteroid boulders with concentrated sunlight.',
    'grindless.machine.optical_miner.no_voiding': 'The optical miner keeps its water, gases and extract. Disable item and fluid voiding.',
    'grindless.machine.optical_miner.no_sun': 'Optical mining needs the sun on the receiver and every mirror under open sky',
    'grindless.machine.optical_miner.sun.sun': 'In full sun: optical mining can start',
    'grindless.machine.optical_miner.sun.night': 'Night: optical mining waits for the sun',
    'grindless.machine.optical_miner.sun.shaded': 'Shaded: %s of the receiver and the 8 mirrors do not see the sky',
    'gtceu.recipe.grindless_optical_sun.boulder': 'Starts only in full sun on the receiver and all 8 mirrors',
    'tooltip.grindless.vein_sample.drill_harpoon': 'Put it in the input bus of the harpoon anchor drill. It is never used up.',
    'tooltip.grindless.vein_sample.asteroid_belt': 'The asteroid belt: craft it with an empty vein probe and two raw ores of the vein, brought back by hand on the first visit.',
    'item.grindless.vein_sample_m_type_belt': 'M-type Asteroid Vein Sample',
    'item.grindless.vein_sample_s_type_belt': 'S-type Asteroid Vein Sample',
    'item.grindless.vein_sample_c_type_belt': 'C-type Asteroid Vein Sample'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})

ClientEvents.lang('es_es', function (event) {
  var entries = {
    'block.gtceu.harpoon_anchor_drill': 'Perforadora anclada con arpones',
    'block.gtceu.asteroid_processor': 'Procesador de asteroides',
    'block.gtceu.optical_miner': 'Minero óptico',
    'gtceu.asteroid_processing': 'Procesado de asteroides',
    'gtceu.optical_mining': 'Minería óptica',
    'grindless.machine.harpoon_anchor_drill.tooltip.0': '§7Perfora vetas de asteroides, anclado a la roca con arpones.',
    'grindless.machine.asteroid_processor.tooltip.0': '§7Separa el metal de asteroide en hierro, níquel y cobalto (proceso Mond).',
    'grindless.machine.asteroid_processor.no_voiding': 'El procesador de asteroides conserva su concentrado de MGP. Desactiva la destrucción de objetos.',
    'grindless.machine.optical_miner.tooltip.0': '§7Fragmenta rocas de asteroide con luz solar concentrada.',
    'grindless.machine.optical_miner.no_voiding': 'El minero óptico conserva su agua, sus gases y su extracto. Desactiva la destrucción de objetos y fluidos.',
    'grindless.machine.optical_miner.no_sun': 'La minería óptica necesita el sol en el receptor y todos los espejos bajo el cielo abierto',
    'grindless.machine.optical_miner.sun.sun': 'A pleno sol: la minería óptica puede empezar',
    'grindless.machine.optical_miner.sun.night': 'Noche: la minería óptica espera al sol',
    'grindless.machine.optical_miner.sun.shaded': 'A la sombra: %s entre el receptor y los 8 espejos no ven el cielo',
    'gtceu.recipe.grindless_optical_sun.boulder': 'Solo empieza a pleno sol en el receptor y los 8 espejos',
    'tooltip.grindless.vein_sample.drill_harpoon': 'Ponla en el bus de entrada de la perforadora anclada con arpones. No se gasta.',
    'tooltip.grindless.vein_sample.asteroid_belt': 'El cinturón de asteroides: se hace con una sonda de vetas vacía y dos menas en bruto de la veta traídas a mano en la primera visita.',
    'item.grindless.vein_sample_m_type_belt': 'Muestra de veta de asteroide de tipo M',
    'item.grindless.vein_sample_s_type_belt': 'Muestra de veta de asteroide de tipo S',
    'item.grindless.vein_sample_c_type_belt': 'Muestra de veta de asteroide de tipo C'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})
