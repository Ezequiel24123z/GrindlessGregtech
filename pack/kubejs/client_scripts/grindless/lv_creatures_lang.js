// priority: 7152
// Gregtech Grindless - LV era: names and tooltips of the Creature Simulator, its recipe type and the creature models.
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent): Minecraft merges the lang entries of every
// namespace and script, so ClientEvents.lang works the same (see dimensions_lang.js). The names of the creatures come
// from the creature table (kubejs/data/grindless/tables/mobs.json, loaded by the startup script into
// global.grindless.tables.mobs): the client runs the startup scripts too.
(function () {
  const G = global.grindless || {}
  const T = (G.tables && G.tables.mobs) ||
    (typeof G.readJsonTable === 'function' ? G.readJsonTable('kubejs/data/grindless/tables/mobs.json') : null)
  const MOBS = T ? T.mobs : []
  if (!T) console.error('[grindless/creatures] lang: the creature table is not available, creature models stay unnamed')

  // GTM colours its tier names: Advanced = aqua, Advanced II = gold, Advanced III = dark purple
  const SECTION = '\u00a7'

  ClientEvents.lang('en_us', function (event) {
    event.add('gtceu', 'block.gtceu.lv_creature_simulator', 'Basic Creature Simulator')
    event.add('gtceu', 'block.gtceu.mv_creature_simulator', SECTION + 'bAdvanced Creature Simulator')
    event.add('gtceu', 'block.gtceu.hv_creature_simulator', SECTION + '6Advanced Creature Simulator II')
    event.add('gtceu', 'block.gtceu.ev_creature_simulator', SECTION + '5Advanced Creature Simulator III')
    event.add('gtceu', 'gtceu.creature_simulation', 'Creature Simulation')

    event.add('grindless', 'grindless.machine.creature_simulator.tooltip.0',
      'Simulates a creature from its model and yields its drops. Nobody gets hurt.')
    event.add('grindless', 'grindless.machine.creature_simulator.tooltip.1',
      'Model (never used up) + biomass + the creature\'s mineral. The programmed circuit picks the drops: 1 = all of them.')
    event.add('grindless', 'grindless.machine.creature_simulator.tooltip.2',
      'Creatures of a higher tier need a simulator of that tier or better.')

    event.add('grindless', 'item.grindless.blank_creature_model', 'Blank Creature Model')
    event.add('grindless', 'tooltip.grindless.blank_creature_model',
      'Print it in an assembler with the creature\'s print items (8 units, see the recipe viewer) to make a creature model. Nobody gets hurt.')
    event.add('grindless', 'tooltip.grindless.creature_model', 'Put it in a Creature Simulator. It is never used up.')
    event.add('grindless', 'tooltip.grindless.creature_model.mineral', 'Each cycle: %s mB of biomass and %s x %s.')
    event.add('grindless', 'tooltip.grindless.creature_model.biomass_only', 'Each cycle: %s mB of biomass.')
    event.add('grindless', 'tooltip.grindless.creature_model.tier', 'Needs a %s Creature Simulator or better.')

    MOBS.forEach(function (mob) {
      event.add('grindless', 'item.grindless.creature_model_' + mob.id, 'Creature Model: ' + mob.name.en_us)
    })
  })

})()
