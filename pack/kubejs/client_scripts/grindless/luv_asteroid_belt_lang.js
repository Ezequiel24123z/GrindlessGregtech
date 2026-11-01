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

