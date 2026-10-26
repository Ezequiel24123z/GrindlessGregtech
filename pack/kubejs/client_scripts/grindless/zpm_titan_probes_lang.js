// Gregtech Grindless - names and tooltips of ZPM's Titan probes (startup_scripts/grindless/zpm/titan_probes.js):
// gtceu:entry_probe_bay, gtceu:tholin_reformer, their recipe types, grindless:titan_probe_recording and the material gtceu:titan_nitriles.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.entry_probe_bay', 'Entry Probe Bay')
    add('block.gtceu.tholin_reformer', 'Tholin Reformer')
    add('gtceu.titan_entry', 'Titan Entry')
    add('gtceu.tholin_reforming', 'Tholin Reforming')
    add('item.grindless.titan_probe_recording', 'Titan Probe Recording')
    add('material.gtceu.titan_nitriles', 'Titan Nitrile Mix')
    add('emi.grindless.info.probe_bay_casing.0', 'A shielded casing with a heat-resistant lining. It builds the walls, roof and floor of the Entry Probe Bay.')
    add('tooltip.grindless.titan_probe_recording.0', 'The telemetry of a probe that fell through Titan\'s haze.')
    add('tooltip.grindless.titan_probe_recording.1', 'Decode it in the deep space network (circuit 4) into a lake sampler.')

    add('grindless.machine.entry_probe_bay.tooltip.0', 'A launch rail and a canister dock behind a shielded wall. Only works in Saturn orbit. Circuit 1: an entry probe + 8,000 mB nitrogen -> 8 tholin + a Titan probe recording (the haze descent).')
    add('grindless.machine.entry_probe_bay.tooltip.1', 'Circuit 2: an entry probe + a lake sampler -> 4,000 mB methane + 2,000 mB ethane (the lake run). The probe is used up. 122,880 EU/t (ZPM), 200 t.')
    add('grindless.machine.entry_probe_bay.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 input hatches, 1 or 2 output buses, 1 to 3 output hatches, and 12 or more probe bay casings in the floor. A titanium frame rail runs down the middle.')

    add('grindless.machine.tholin_reformer.tooltip.0', 'A PTFE column that breaks the haze organics back into chemistry. Only works in Saturn orbit. Circuit 1: 4 tholin + 1,000 mB water -> 1,000 mB nitrile mix.')
    add('grindless.machine.tholin_reformer.tooltip.1', 'Circuit 2: nitrile mix -> 8 carbon fibres + 500 mB ammonia. Circuit 3: nitrile mix + 2,000 mB ammonia + zinc dust (not used up) -> 1,000 mB diaminobenzidine. The hydrogen cyanide never leaves the column. 122,880 EU/t (ZPM).')
    add('grindless.machine.tholin_reformer.tooltip.2', 'Needs: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 input hatches, 1 or 2 output buses, 1 or 2 output hatches, and 8 or more station truss casings in the deck.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.entry_probe_bay', 'Bahía de sondas de entrada')
    add('block.gtceu.tholin_reformer', 'Reformador de tolinas')
    add('gtceu.titan_entry', 'Entrada en Titán')
    add('gtceu.tholin_reforming', 'Reformado de tolinas')
    add('item.grindless.titan_probe_recording', 'Registro de sonda de Titán')
    add('material.gtceu.titan_nitriles', 'Mezcla de nitrilos de Titán')
    add('emi.grindless.info.probe_bay_casing.0', 'Una carcasa blindada con un forro resistente al calor. Construye las paredes, el techo y el suelo de la Bahía de sondas de entrada.')
    add('tooltip.grindless.titan_probe_recording.0', 'La telemetría de una sonda que cayó a través de la bruma de Titán.')
    add('tooltip.grindless.titan_probe_recording.1', 'Descífrala en la red de espacio profundo (circuito 4) para obtener un muestreador de lagos.')

    add('grindless.machine.entry_probe_bay.tooltip.0', 'Un raíl de lanzamiento y un muelle de cápsulas tras una pared blindada. Solo funciona en la órbita de Saturno. Circuito 1: una sonda de entrada + 8 000 mB de nitrógeno -> 8 de tolina + un registro de sonda de Titán (el descenso por la bruma).')
    add('grindless.machine.entry_probe_bay.tooltip.1', 'Circuito 2: una sonda de entrada + un muestreador de lagos -> 4 000 mB de metano + 2 000 mB de etano (la pasada por los lagos). La sonda se consume. 122 880 EU/t (ZPM), 200 t.')
    add('grindless.machine.entry_probe_bay.tooltip.2', 'Necesita: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 escotillas de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de salida y 12 o más carcasas de bahía de sondas en el suelo. Un raíl de marcos de titanio recorre el centro.')

    add('grindless.machine.tholin_reformer.tooltip.0', 'Una columna de PTFE que devuelve a la química los orgánicos de la bruma. Solo funciona en la órbita de Saturno. Circuito 1: 4 de tolina + 1 000 mB de agua -> 1 000 mB de mezcla de nitrilos.')
    add('grindless.machine.tholin_reformer.tooltip.1', 'Circuito 2: mezcla de nitrilos -> 8 de fibra de carbono + 500 mB de amoníaco. Circuito 3: mezcla de nitrilos + 2 000 mB de amoníaco + polvo de zinc (no se gasta) -> 1 000 mB de diaminobencidina. El cianuro de hidrógeno nunca sale de la columna. 122 880 EU/t (ZPM).')
    add('grindless.machine.tholin_reformer.tooltip.2', 'Necesita: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 escotillas de entrada, 1 o 2 buses de salida, 1 o 2 escotillas de salida y 8 o más carcasas de armazón de estación en la cubierta.')
})
