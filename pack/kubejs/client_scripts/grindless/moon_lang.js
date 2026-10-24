// Gregtech Grindless - names and tooltips of the Moon (end of HV):
//
//   gtceu:lunar_drill, gtceu:lunar_drilling          (machine name + tooltips, recipe type)
//   grindless:vein_sample_<lunar vein>               (ilmenite_moon, regolith_moon: data/grindless/tables/veins_moon.json)
//   grindless:lunar_quantum_seed                     (the Moon's half of an Earth-Moon quantum pair)
//   ae2:quantum_entangled_singularity                (an extra line on the Earth-Moon pairs)
//   messages of moon/quantum_bridge.js
//
// Kept out of pack/kubejs/assets/grindless/lang/*, like the other *_lang.js scripts: Minecraft merges lang entries from every
// namespace/script, so ClientEvents.lang works fine wherever it is declared. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.lunar_drill', 'Lunar Drill')
    add('gtceu.lunar_drilling', 'Lunar Drilling')
    add('grindless.machine.lunar_drill.tooltip.0', 'The vein drill of the Moon: a lander on three legs standing on the regolith, with two solar wings and a short drill string. It only works on the Moon (every lunar recipe asks for it).')
    add('grindless.machine.lunar_drill.tooltip.1', 'Lunar ilmenite vein: ilmenite (the only titanium), olivine, chromite and iron, 3.75 raw ores per run. Regolith: helium-3, only by lunar day (the wings bake it). HV drill bit, about 0.5% wear per run.')
    add('grindless.machine.lunar_drill.tooltip.2', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 32). Nothing burns in vacuum: bring charged batteries from Earth, then send Earth power through the AE2 quantum bridge.')
    add('grindless.machine.lunar_drill.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 1 or 2 output buses and, for the helium-3, 1 output hatch. The three legs stand on lunar ground.')

    add('item.grindless.vein_sample_ilmenite_moon', 'Lunar Ilmenite Vein Sample')
    add('item.grindless.vein_sample_regolith_moon', 'Lunar Regolith Sample')
    add('tooltip.grindless.vein_sample.drill_lunar', 'Put it in the input bus of the Lunar Drill, on the Moon, with an HV drill bit. It is never used up.')
    add('tooltip.grindless.vein_sample.volatiles', 'Gives: %s')
    add('tooltip.grindless.vein_sample.daytime', 'Only by lunar day: the solar wings of the drill bake the regolith.')
    add('tooltip.grindless.vein_sample.moon', 'Moon: craft it with an empty vein probe and two things of the vein brought back by hand on the first visit.')

    add('item.grindless.lunar_quantum_seed', 'Lunar Quantum Seed')
    add('tooltip.grindless.lunar_quantum_seed.0', 'The Moon\'s half of an Earth-Moon quantum pair. Made only on the Moon: chemical reactor, ender pearl + helium-3.')
    add('tooltip.grindless.lunar_quantum_seed.1', 'Throw it into an explosion with an AE2 singularity (the Earth half): two entangled singularities that also link the Earth and the Moon.')
    add('tooltip.grindless.entangled_planet.moon', 'Earth-Moon pair: one end may sit on the Moon.')

    add('planet.grindless.moon', 'the Moon')
    add('message.grindless.quantum_link_earth_pair', 'This singularity was entangled on Earth. A quantum link on %s needs a pair made with a seed from there.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.lunar_drill', 'Perforadora lunar')
    add('gtceu.lunar_drilling', 'Perforación lunar')
    add('grindless.machine.lunar_drill.tooltip.0', 'La perforadora de vetas de la Luna: un módulo de aterrizaje sobre tres patas apoyadas en el regolito, con dos alas solares y una sarta de perforación corta. Solo funciona en la Luna (todas las recetas lunares lo piden).')
    add('grindless.machine.lunar_drill.tooltip.1', 'Veta lunar de ilmenita: ilmenita (el único titanio), olivino, cromita y hierro, 3,75 menas en bruto por ciclo. Regolito: helio-3, solo de día lunar (las alas lo hornean). Broca HV, cerca del 0,5 % de desgaste por ciclo.')
    add('grindless.machine.lunar_drill.tooltip.2', 'Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 32). En el vacío nada arde: lleva baterías cargadas de la Tierra y después manda la energía de la Tierra por el puente cuántico de AE2.')
    add('grindless.machine.lunar_drill.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 o 2 buses de salida y, para el helio-3, 1 escotilla de salida. Las tres patas se apoyan en suelo lunar.')

    add('item.grindless.vein_sample_ilmenite_moon', 'Muestra de veta de ilmenita lunar')
    add('item.grindless.vein_sample_regolith_moon', 'Muestra de regolito lunar')
    add('tooltip.grindless.vein_sample.drill_lunar', 'Ponla en el bus de entrada de la perforadora lunar, en la Luna, con una broca HV. No se gasta.')
    add('tooltip.grindless.vein_sample.volatiles', 'Da: %s')
    add('tooltip.grindless.vein_sample.daytime', 'Solo de día lunar: las alas solares de la perforadora hornean el regolito.')
    add('tooltip.grindless.vein_sample.moon', 'Luna: se hace con una sonda de vetas vacía y dos cosas de la veta traídas a mano en la primera visita.')

    add('item.grindless.lunar_quantum_seed', 'Semilla cuántica lunar')
    add('tooltip.grindless.lunar_quantum_seed.0', 'La mitad lunar de un par cuántico Tierra-Luna. Solo se hace en la Luna: reactor químico, perla de ender + helio-3.')
    add('tooltip.grindless.lunar_quantum_seed.1', 'Échala a una explosión con una singularidad de AE2 (la mitad de la Tierra): salen dos singularidades entrelazadas que también unen la Tierra y la Luna.')
    add('tooltip.grindless.entangled_planet.moon', 'Par Tierra-Luna: un extremo puede estar en la Luna.')

    add('planet.grindless.moon', 'la Luna')
    add('message.grindless.quantum_link_earth_pair', 'Esta singularidad se entrelazó en la Tierra. Un enlace cuántico en %s necesita un par hecho con una semilla de allí.')
})

// the Earth-Moon pairs carry grindless_planet in their NBT (server_scripts/grindless/moon/crafting.js)
ItemEvents.tooltip(event => {
    event.addAdvanced('ae2:quantum_entangled_singularity', (item, advanced, text) => {
        var nbt = item.nbt
        if (nbt == null || !nbt.contains('grindless_planet')) return
        text.add(1, Text.translate('tooltip.grindless.entangled_planet.' + nbt.getString('grindless_planet')).aqua())
    })
})
