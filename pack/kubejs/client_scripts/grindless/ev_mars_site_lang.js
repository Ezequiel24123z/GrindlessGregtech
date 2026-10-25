// Gregtech Grindless - names and tooltips of the EV Atmosphere Processor (the Mars base).
//
//   gtceu:atmosphere_processor           (machine name + tooltips)
//   gtceu:atmosphere_processing          (recipe type name)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.atmosphere_processor', 'Atmosphere Processor')
    add('gtceu.atmosphere_processing', 'Atmosphere Processing')

    add('grindless.machine.atmosphere_processor.tooltip.0', 'Works only on Mars. Draws the thin CO2 air through its dust filters, electrolyzes water and joins the hydrogen to the CO2 in a Sabatier reactor: three machines in one. Circuit 1: 2,000 mB of water -> 1,000 mB of methane + 4,000 mB of oxygen (CO2 + 2 H2O -> CH4 + 2 O2). Circuit 2: 10,000 mB of carbon dioxide from the air.')
    add('grindless.machine.atmosphere_processor.tooltip.1', 'Energy is the sum of GTM\'s stages, no discount: the intake (5,120 EU), water electrolysis (180,000 EU) and methanation (72,000 EU, GTM\'s methane reforming run backwards): 1,920 EU/t for 6.7 s. Burning the methane gives back less than that: Mars power comes from home through the bridge or from the light, and methane and methalox carry and store it.')
    add('grindless.machine.atmosphere_processor.tooltip.2', 'Circuit 1 needs a Ruthenium Catalyst in the input bus (used up in about 0.1% of the runs). Use water from home: the ice of Mars is rich in deuterium and is kept for IV. Oxygen goes to suits and methalox; methane to methalox (fuel that carries its own oxygen, so it burns on Mars) or home. CO2 feeds a sealed dome, or is vented.')
    add('grindless.machine.atmosphere_processor.tooltip.3', 'Needs, in the edge of the floor: 1 or 2 EV energy hatches, 1 input bus (catalyst and circuit), 1 input hatch (water) and 2 output hatches (each holds one gas). ME buses and hatches fit. If a hatch is full, the processor stops.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.atmosphere_processor', 'Procesador atmosférico')
    add('gtceu.atmosphere_processing', 'Procesado atmosférico')

    add('grindless.machine.atmosphere_processor.tooltip.0', 'Solo funciona en Marte. Aspira el aire tenue de CO2 a través de sus filtros de polvo, electroliza agua y une el hidrógeno al CO2 en un reactor de Sabatier: tres máquinas en una. Circuito 1: 2000 mB de agua -> 1000 mB de metano + 4000 mB de oxígeno (CO2 + 2 H2O -> CH4 + 2 O2). Circuito 2: 10 000 mB de dióxido de carbono del aire.')
    add('grindless.machine.atmosphere_processor.tooltip.1', 'La energía es la suma de las etapas de GTM, sin descuento: la toma de aire (5120 EU), la electrólisis del agua (180 000 EU) y la metanación (72 000 EU, el reformado de metano de GTM al revés): 1920 EU/t durante 6,7 s. Quemar el metano devuelve menos que eso: la energía de Marte llega de casa por el puente o de la luz, y el metano y el metalox la transportan y la guardan.')
    add('grindless.machine.atmosphere_processor.tooltip.2', 'El circuito 1 pide un catalizador de rutenio en el bus de entrada (se gasta en cerca del 0,1 % de los ciclos). Usa agua de casa: el hielo de Marte es rico en deuterio y se guarda para IV. El oxígeno va a los trajes y al metalox; el metano, al metalox (un combustible que lleva su propio oxígeno, así que arde en Marte) o a casa. El CO2 alimenta una cúpula sellada o se ventila.')
    add('grindless.machine.atmosphere_processor.tooltip.3', 'Necesita, en el borde del suelo: 1 o 2 escotillas de energía EV, 1 bus de entrada (catalizador y circuito), 1 escotilla de entrada (agua) y 2 escotillas de salida (cada una guarda un gas). Valen buses y escotillas ME. Si una escotilla se llena, el procesador se para.')
})
