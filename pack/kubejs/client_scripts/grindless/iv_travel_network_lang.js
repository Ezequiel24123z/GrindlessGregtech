// priority: 8700
// Gregtech Grindless - names and tooltips of IV-B5, travel and network (startup_scripts/grindless/iv/travel_network.js):
//
//   gtceu:ev_rtg, gtceu.radioisotope_decay                the RTG cell (machine name and tooltips) and its recipe type
//   gtceu.recipe.grindless_rtg_hours                      the EMI line of the RTG's recipe (how long a pellet lasts)
//   grindless:venusian_quantum_seed, hermean_quantum_seed the far halves of the Earth-Venus and Earth-Mercury quantum pairs
//   tooltip.grindless.entangled_planet.venus / mercury    the extra line on the marked pairs (moon_lang.js adds it to every marked pair)
//   gtceu.recipe.grindless_sky.inner_planets              the EMI line of the deep space antenna's inner planets chart (the observatories' key)
//
// The machine's name is GTM's (namespace gtceu), coloured like GTM's EV tier names. Kept out of pack/kubejs/assets/grindless/lang/* like the
// other *_lang.js scripts. Quests are English only; names go in en_us and es_es.
(function () {
  // GTM colours an EV machine's name dark purple
  const SECTION = '\u00a7'

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }

    event.add('gtceu', 'block.gtceu.ev_rtg', SECTION + '5RTG Cell')
    event.add('gtceu', 'gtceu.radioisotope_decay', 'Radioisotope Decay')
    add('grindless.machine.ev_rtg.tooltip.0', 'A radioisotope thermoelectric generator: a plutonium oxide pellet heats a thermopile behind a lead shield, and radiator fins carry the rest of the heat away.')
    add('grindless.machine.ev_rtg.tooltip.1', 'Burns nothing, so it works on every world, day and night. Put RTG pellets in its slot: each one lasts about an hour of running and is used up at random.')
    add('grindless.machine.ev_rtg.tooltip.2', 'It starts a new base and carries Mercury\'s night. Its EV power fits EV cables and any IV hatch.')
    add('gtceu.recipe.grindless_rtg_hours', 'A pellet lasts about %s h of running, used up at random: %s EU per pellet')

    add('item.grindless.venusian_quantum_seed', 'Venusian Quantum Seed')
    add('tooltip.grindless.venusian_quantum_seed.0', 'The Venusian half of an Earth-Venus quantum pair. Made only on Venus: chemical reactor, Venusian regolith + ender pearl + helium-3.')
    add('tooltip.grindless.venusian_quantum_seed.1', 'Throw it into an explosion with an AE2 singularity (the Earth half): two entangled singularities that also link the Earth and Venus.')
    add('tooltip.grindless.entangled_planet.venus', 'Earth-Venus pair: one end may sit on Venus.')

    add('item.grindless.hermean_quantum_seed', 'Hermean Quantum Seed')
    add('tooltip.grindless.hermean_quantum_seed.0', 'The Hermean half of an Earth-Mercury quantum pair. Made only on Mercury: chemical reactor, Hermean regolith dust + ender pearl + helium-3.')
    add('tooltip.grindless.hermean_quantum_seed.1', 'Throw it into an explosion with an AE2 singularity (the Earth half): two entangled singularities that also link the Earth and Mercury.')
    add('tooltip.grindless.entangled_planet.mercury', 'Earth-Mercury pair: one end may sit on Mercury.')

    add('gtceu.recipe.grindless_sky.inner_planets', 'Sky: lunar night, on the Moon; IV power (an IV energy hatch, or two EV ones)')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }

    event.add('gtceu', 'block.gtceu.ev_rtg', SECTION + '5Celda RTG')
    event.add('gtceu', 'gtceu.radioisotope_decay', 'Desintegración de radioisótopos')
    add('grindless.machine.ev_rtg.tooltip.0', 'Un generador termoeléctrico de radioisótopos: una pastilla de óxido de plutonio calienta una termopila tras un blindaje de plomo, y unas aletas de radiador se llevan el resto del calor.')
    add('grindless.machine.ev_rtg.tooltip.1', 'No quema nada, así que funciona en todos los mundos, de día y de noche. Pon pastillas de RTG en su ranura: cada una dura cerca de una hora de marcha y se gasta al azar.')
    add('grindless.machine.ev_rtg.tooltip.2', 'Arranca una base nueva y aguanta la noche de Mercurio. Su energía EV vale para cables EV y para cualquier escotilla IV.')
    add('gtceu.recipe.grindless_rtg_hours', 'Una pastilla dura cerca de %s h de marcha y se gasta al azar: %s EU por pastilla')

    add('item.grindless.venusian_quantum_seed', 'Semilla cuántica venusiana')
    add('tooltip.grindless.venusian_quantum_seed.0', 'La mitad venusiana de un par cuántico Tierra-Venus. Solo se hace en Venus: reactor químico, regolito venusiano + perla de ender + helio-3.')
    add('tooltip.grindless.venusian_quantum_seed.1', 'Échala a una explosión con una singularidad de AE2 (la mitad de la Tierra): salen dos singularidades entrelazadas que también unen la Tierra y Venus.')
    add('tooltip.grindless.entangled_planet.venus', 'Par Tierra-Venus: un extremo puede estar en Venus.')

    add('item.grindless.hermean_quantum_seed', 'Semilla cuántica de Mercurio')
    add('tooltip.grindless.hermean_quantum_seed.0', 'La mitad de Mercurio de un par cuántico Tierra-Mercurio. Solo se hace en Mercurio: reactor químico, polvo de regolito de Mercurio + perla de ender + helio-3.')
    add('tooltip.grindless.hermean_quantum_seed.1', 'Échala a una explosión con una singularidad de AE2 (la mitad de la Tierra): salen dos singularidades entrelazadas que también unen la Tierra y Mercurio.')
    add('tooltip.grindless.entangled_planet.mercury', 'Par Tierra-Mercurio: un extremo puede estar en Mercurio.')

    add('gtceu.recipe.grindless_sky.inner_planets', 'Cielo: noche lunar, en la Luna; energía IV (una escotilla de energía IV, o dos EV)')
  })
})()
