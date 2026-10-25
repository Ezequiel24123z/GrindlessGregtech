// Gregtech Grindless - text of IV's mass-production kit (package IV-B6; startup_scripts/grindless/lib/parallel_hatch.js and
// server_scripts/grindless/iv/mass_production.js).
//
//   grindless.machine.parallel_hatch.tooltip   the tooltip line of each plant of ours that takes GTM's Parallel Control Hatch (the hot cell,
//                                              the fuel fabrication plant and the heavy-water plant)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('grindless.machine.parallel_hatch.tooltip', 'Takes one Parallel Control Hatch in a part cell: up to 4 runs at once with the IV hatch. Each copy costs the recipe\'s own EU/t, so the energy hatches must carry the sum; a charge that is never used up is needed once.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('grindless.machine.parallel_hatch.tooltip', 'Admite una escotilla de control paralelo en una celda de piezas: hasta 4 recetas a la vez con la de IV. Cada copia cuesta el EU/t de la receta, así que las escotillas de energía deben llevar la suma; una carga que nunca se gasta hace falta una sola vez.')
})
