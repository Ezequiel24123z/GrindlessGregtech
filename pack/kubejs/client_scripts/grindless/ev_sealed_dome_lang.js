// Gregtech Grindless - names and tooltips of the Sealed Dome (gtceu:sealed_dome), the EV step of the Greenhouse family
// (startup_scripts/grindless/ev/sealed_dome.js, server_scripts/grindless/ev/sealed_dome.js).
//
// The creature models of the wither skeleton and the wither take their names from the creature table (mobs.json, read by
// lv_creatures_lang.js), so they need nothing here.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.sealed_dome', 'Sealed Dome')

    add('grindless.machine.sealed_dome.tooltip.0', 'A greenhouse sealed against the vacuum: LED panels light a soil bed under a glass dome on sintered regolith. It runs every Steam, LV, MV and HV Greenhouse recipe, up to 64 at once.')
    add('grindless.machine.sealed_dome.tooltip.1', 'Programmed circuit 4, only on the Moon and Mars: every plant grows from 100 mB of water and carbon dioxide per run, with triple output and 100 mB of oxygen back. On the Moon the CO2 comes from home (200 mB per run); on Mars the dome breathes it from the air.')
    add('grindless.machine.sealed_dome.tooltip.2', 'Runs as many plants at once as its energy hatches allow (voltage / EU per run, up to 64). Circuits 1 to 3 work as in the HV Greenhouse.')
    add('grindless.machine.sealed_dome.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 1 or 2 output buses, 1 or 2 input hatches (water, carbon dioxide) and 1 output hatch (oxygen). ME buses and hatches fit too.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.sealed_dome', 'Cúpula sellada')

    add('grindless.machine.sealed_dome.tooltip.0', 'Un invernadero sellado contra el vacío: paneles LED iluminan un lecho de tierra bajo una cúpula de vidrio sobre regolito sinterizado. Hace todas las recetas de los invernaderos de vapor, LV, MV y HV, hasta 64 a la vez.')
    add('grindless.machine.sealed_dome.tooltip.1', 'Circuito programado 4, solo en la Luna y en Marte: cada planta crece con 100 mB de agua y dióxido de carbono por ciclo, con el triple de producción y 100 mB de oxígeno de vuelta. En la Luna el CO2 llega de casa (200 mB por ciclo); en Marte la cúpula lo toma del aire.')
    add('grindless.machine.sealed_dome.tooltip.2', 'Hace tantas plantas a la vez como permitan sus escotillas de energía (voltaje / EU por ciclo, hasta 64). Los circuitos 1 a 3 funcionan como en el invernadero HV.')
    add('grindless.machine.sealed_dome.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 o 2 buses de salida, 1 o 2 escotillas de entrada (agua, dióxido de carbono) y 1 escotilla de salida (oxígeno). También admite buses y escotillas ME.')
})
