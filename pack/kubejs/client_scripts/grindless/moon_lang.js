// priority: 6500
// Gregtech Grindless - names and tooltips of the Moon (end of HV):
//
//   gtceu:lunar_drill, gtceu:lunar_drilling          (machine name + tooltips, recipe type)
//   grindless:vein_sample_<lunar vein>               (ilmenite_moon, regolith_moon: data/grindless/tables/veins_moon.json)
//   grindless:lunar_quantum_seed                     (the Moon's half of an Earth-Moon quantum pair)
//   ae2:quantum_entangled_singularity                (an extra line on the Earth-Moon pairs)
//   messages of moon/quantum_bridge.js
//
// Kept out of pack/kubejs/assets/grindless/lang/*, like the other *_lang.js scripts: Minecraft merges lang entries from every
// namespace/script, so ClientEvents.lang works fine wherever it is declared. Quests are English only; names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.lunar_drill', 'Lunar Drill')
    add('gtceu.lunar_drilling', 'Lunar Drilling')
    add('grindless.machine.lunar_drill.tooltip.0', '§7The vein drill of the Moon: lunar ilmenite and helium-3.')
    add('grindless.machine.lunar_drill.tooltip.1', 'Only works on the Moon.')

    add('item.grindless.vein_sample_ilmenite_moon', 'Lunar Ilmenite Vein Sample')
    add('item.grindless.vein_sample_regolith_moon', 'Lunar Regolith Sample')
    add('tooltip.grindless.vein_sample.drill_lunar', 'Put it in the input bus of the Lunar Drill (HV drill bit) or the EV Tripod Drill (titanium bit), on the Moon. It is never used up.')
    add('tooltip.grindless.vein_sample.volatiles', 'Gives: %s')
    add('tooltip.grindless.vein_sample.daytime', 'Only by lunar day: the solar wings of the drill bake the regolith.')
    add('tooltip.grindless.vein_sample.moon', 'Moon: craft it with an empty vein probe and two things of the vein brought back by hand on the first visit.')

    add('item.grindless.lunar_quantum_seed', 'Lunar Quantum Seed')
    add('tooltip.grindless.lunar_quantum_seed.0', 'The Moon\'s half of an Earth-Moon quantum pair. Made only on the Moon: chemical reactor, programmed circuit 1 + ender pearl + helium-3.')
    add('tooltip.grindless.lunar_quantum_seed.1', 'Throw it into an explosion with an AE2 singularity (the Earth half): two entangled singularities that also link the Earth and the Moon.')
    add('tooltip.grindless.entangled_planet.moon', 'Earth-Moon pair: one end may sit on the Moon.')

    add('planet.grindless.moon', 'the Moon')
    add('message.grindless.quantum_link_earth_pair', 'This singularity was entangled on Earth. A quantum link on %s needs a pair made with a seed from there.')
})

// the Earth-Moon pairs carry grindless_planet in their NBT (server_scripts/grindless/moon/crafting.js)
ItemEvents.tooltip(event => {
    event.addAdvanced('ae2:quantum_entangled_singularity', (item, advanced, text) => {
        var nbt = item.nbt
        if (nbt == null || !nbt.contains('grindless_planet')) return
        text.add(1, Text.translate('tooltip.grindless.entangled_planet.' + nbt.getString('grindless_planet')).aqua())
    })
})
