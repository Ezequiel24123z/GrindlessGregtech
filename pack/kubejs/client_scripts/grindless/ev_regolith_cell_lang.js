// priority: 10200
// Gregtech Grindless - names and tooltips of the EV Regolith Cell.
//
//   gtceu:regolith_cell            (machine name + tooltips)
//   gtceu:regolith_processing      (recipe type name)
//   grindless:platinum_electrode   (one more tooltip line: it is also the cell's anode; its name and first line are in ev_platinum_plant_lang.js)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.regolith_cell', 'Regolith Cell')
    add('gtceu.regolith_processing', 'Regolith Processing')

    add('grindless.machine.regolith_cell.tooltip.0', 'The chemistry of the Moon base: it only works on the Moon. Circuit 1, volatiles: 16 lunar regolith dust heated until the solar wind comes out: 2,000 mB hydrogen, 250 mB helium, 200 mB nitrogen and 1 mB helium-3 (the trace of water is vented). Circuit 3, sintering: 16 dust -> 4 Sintered Regolith Bricks, four times an electric furnace at a quarter of its energy.')
    add('grindless.machine.regolith_cell.tooltip.1', 'Circuit 2, electrolysis with a platinum anode: 16 molten regolith dust -> 7,000 mB oxygen, 3 silicon dust and 1 iron dust (the rest is inert slag, dumped). 5 ilmenite dust in a Molten Salt Charge -> 3 titanium ingots, 1 iron dust and 3,000 mB oxygen: no chlorine, no magnesium, no carbon, for the energy of the Kroll stages it replaces (2.7 million EU). 16 leached tailings from Proxima b -> 3 silicon dioxide dust, 1 iron dust and 1,000 mB oxygen.')
    add('grindless.machine.regolith_cell.tooltip.2', 'Electrolysis needs a Platinum Electrode in the input bus (used up in about 0.1% of the runs); titanium also needs a Molten Salt Charge, which is never used up. Every output needs somewhere to go: each output hatch holds one gas, and if a bus or a hatch fills up, the cell stops.')
    add('grindless.machine.regolith_cell.tooltip.3', 'Needs, in the brick floor and walls: 1 or 2 EV energy hatches, 1 or 2 input buses, 1 or 2 output buses and up to 5 output hatches (one per gas: hydrogen, helium, nitrogen, helium-3 and oxygen; one ME output hatch takes them all). ME buses fit.')

    add('tooltip.grindless.platinum_electrode.regolith_cell', 'Also the anode of the Regolith Cell\'s electrolysis, on the Moon.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.regolith_cell', 'Celda de regolito')
    add('gtceu.regolith_processing', 'Procesado de regolito')

    add('grindless.machine.regolith_cell.tooltip.0', 'La química de la base lunar: solo funciona en la Luna. Circuito 1, volátiles: 16 polvos de regolito lunar calentados hasta que suelta el viento solar: 2 000 mB de hidrógeno, 250 mB de helio, 200 mB de nitrógeno y 1 mB de helio-3 (el rastro de agua se ventea). Circuito 3, sinterizado: 16 polvos -> 4 ladrillos de regolito sinterizado, cuatro veces un horno eléctrico con la cuarta parte de su energía.')
    add('grindless.machine.regolith_cell.tooltip.1', 'Circuito 2, electrólisis con ánodo de platino: 16 polvos de regolito fundido -> 7 000 mB de oxígeno, 3 polvos de silicio y 1 de hierro (el resto es escoria inerte, que se tira). 5 polvos de ilmenita en una carga de sal fundida -> 3 lingotes de titanio, 1 polvo de hierro y 3 000 mB de oxígeno: sin cloro, sin magnesio y sin carbono, con la energía de las etapas del Kroll que sustituye (2,7 millones de EU). 16 relaves lixiviados de Próxima b -> 3 polvos de dióxido de silicio, 1 polvo de hierro y 1 000 mB de oxígeno.')
    add('grindless.machine.regolith_cell.tooltip.2', 'La electrólisis pide un electrodo de platino en el bus de entrada (se gasta en cerca del 0,1 % de los ciclos); el titanio pide además una carga de sal fundida, que no se gasta nunca. Cada salida necesita un destino: cada escotilla de salida guarda un gas, y si un bus o una escotilla se llena, la celda se para.')
    add('grindless.machine.regolith_cell.tooltip.3', 'Necesita, en el suelo y las paredes de ladrillo: 1 o 2 escotillas de energía EV, 1 o 2 buses de entrada, 1 o 2 buses de salida y hasta 5 escotillas de salida (una por gas: hidrógeno, helio, nitrógeno, helio-3 y oxígeno; una escotilla de salida ME se los lleva todos). Valen buses ME.')

    add('tooltip.grindless.platinum_electrode.regolith_cell', 'También es el ánodo de la electrólisis de la celda de regolito, en la Luna.')
})

ItemEvents.tooltip(event => {
    event.add('grindless:platinum_electrode', Text.translate('tooltip.grindless.platinum_electrode.regolith_cell').darkGray())
})
