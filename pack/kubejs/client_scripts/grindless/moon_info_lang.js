// priority: 6514
// Gregtech Grindless - EMI information page of the Moon multiblock (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Its recipes show in EMI under the controller itself.
// Tooltips live in moon_lang.js; every key is in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.lunar_drill.0', "The Lunar Drill is the vein drill of the Moon and works only there. The lunar ilmenite vein gives ilmenite (the only titanium), olivine, chromite and iron, 3.75 raw ores a run. Regolith gives helium-3, only by lunar day.")
    add('emi.grindless.info.lunar_drill.1', "It needs an HV drill bit (about 0.5% wear a run) and a helium-3 output hatch. It runs as many bores as its energy hatches allow (voltage / 8 EU/t, up to 32). Nothing burns in vacuum: bring charged batteries from Earth.")
    add('emi.grindless.info.lunar_drill.2', 'The vein drill of the Moon: a lander on three legs standing on the regolith, with two solar wings and a short drill string. It only works on the Moon (every lunar recipe asks for it).')
    add('emi.grindless.info.lunar_drill.3', 'Lunar ilmenite vein: ilmenite (the only titanium), olivine, chromite and iron, 3.75 raw ores per run. Regolith: helium-3, only by lunar day (the wings bake it). HV drill bit, about 0.5% wear per run.')
    add('emi.grindless.info.lunar_drill.4', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 32). Nothing burns in vacuum: bring charged batteries from Earth, then send Earth power through the AE2 quantum bridge.')
    add('emi.grindless.info.lunar_drill.5', 'Needs 1 or 2 energy hatches, 1 input bus, 1 or 2 output buses and, for the helium-3, 1 output hatch. The three legs stand on lunar ground.')
})

