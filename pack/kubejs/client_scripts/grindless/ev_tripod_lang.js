// priority: 10000
// Gregtech Grindless - names and tooltips of the EV Tripod Drill (the EV step of the Vein Drill family, ev/tripod.js).
//
//   gtceu:ev_vein_drill            (machine name + tooltips)
//   grindless:solar_wing_panel     (the block of its solar wings)
//
// The titanium drill bit keeps its keys in hv_family_lang.js (the item was registered in HV). Minecraft merges lang entries from
// every namespace/script, so ClientEvents.lang works fine wherever it is declared. Quests are English only; names go in en_us and
// es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ev_vein_drill', 'EV Tripod Drill')
    add('grindless.machine.ev_vein_drill.tooltip.0', 'The vein drill of the Moon and Mars: a raised titanium body on three legs, with two solar wings and a drill string down into the ground. It only drills the lunar and Martian veins, each only in its own world, and never an Earth vein.')
    add('grindless.machine.ev_vein_drill.tooltip.1', 'Titanium drill bit: 3.75 raw ores per run drilling dry, with the bit worn out in about 1% of the runs. With 50 mB of liquid nitrogen per run in the input hatch: 5.625 raw ores and about 0.25% wear.')
    add('grindless.machine.ev_vein_drill.tooltip.2', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 64, one bit per bore): one EV hatch fills all 64 and halves the time. By day the solar wings pay half of the energy on the Moon and about 15% on Mars.')
    add('grindless.machine.ev_vein_drill.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus (sample and bits), 1 or 2 output buses and 1 input hatch; ME buses and hatches fit. The three legs and the drill string stand on Sintered Regolith Bricks.')

    add('block.grindless.solar_wing_panel', 'Solar Wing Panel')
    add('tooltip.grindless.solar_wing_panel', 'Silicon cells on a titanium frame: the wings of the EV Tripod Drill. By day they pay part of its energy.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ev_vein_drill', 'Perforadora trípode EV')
    add('grindless.machine.ev_vein_drill.tooltip.0', 'La perforadora de vetas de la Luna y de Marte: un cuerpo de titanio elevado sobre tres patas, con dos alas solares y una sarta de perforación hasta el suelo. Solo perfora las vetas lunares y marcianas, cada una en su mundo, y nunca una veta de la Tierra.')
    add('grindless.machine.ev_vein_drill.tooltip.1', 'Broca de titanio: 3,75 menas en bruto por ciclo en seco, y la broca se gasta en cerca del 1 % de los ciclos. Con 50 mB de nitrógeno líquido por ciclo en la escotilla de entrada: 5,625 menas en bruto y cerca del 0,25 % de desgaste.')
    add('grindless.machine.ev_vein_drill.tooltip.2', 'Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 64, una broca por ciclo): una escotilla EV llena los 64 y reduce el tiempo a la mitad. De día las alas solares pagan la mitad de la energía en la Luna y cerca del 15 % en Marte.')
    add('grindless.machine.ev_vein_drill.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada (muestra y brocas), 1 o 2 buses de salida y 1 escotilla de entrada; valen los buses y escotillas ME. Las tres patas y la sarta se apoyan en ladrillos de regolito sinterizado.')

    add('block.grindless.solar_wing_panel', 'Panel de ala solar')
    add('tooltip.grindless.solar_wing_panel', 'Células de silicio sobre un bastidor de titanio: las alas de la perforadora trípode EV. De día pagan parte de su energía.')
})
