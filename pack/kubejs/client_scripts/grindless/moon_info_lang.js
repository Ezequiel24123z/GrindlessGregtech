// priority: 6550
// Gregtech Grindless - EMI information page of the Moon multiblock (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Its recipes show in EMI under the controller itself.
// Tooltips live in moon_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.lunar_drill.0', "The Lunar Drill is the vein drill of the Moon and works only there. The lunar ilmenite vein gives ilmenite (the only titanium), olivine, chromite and iron, 3.75 raw ores a run. Regolith gives helium-3, only by lunar day.")
    add('emi.grindless.info.lunar_drill.1', "It needs an HV drill bit (about 0.5% wear a run) and a helium-3 output hatch. It runs as many bores as its energy hatches allow (voltage / 8 EU/t, up to 32). Nothing burns in vacuum: bring charged batteries from Earth.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.lunar_drill.0', "La perforadora lunar es la perforadora de vetas de la Luna y solo funciona allí. La veta lunar de ilmenita da ilmenita (el único titanio), olivino, cromita y hierro, 3,75 menas en bruto por ciclo. El regolito da helio-3, solo de día lunar.")
    add('emi.grindless.info.lunar_drill.1', "Necesita una broca HV (cerca del 0,5 % de desgaste por ciclo) y una escotilla de salida para el helio-3. Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 32). En el vacío nada arde: lleva baterías cargadas desde la Tierra.")
})
