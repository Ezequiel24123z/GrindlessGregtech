// priority: 300
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

    add('grindless.machine.entry_probe_bay.tooltip.0', '§7Launches probes into Titan\'s haze.')

    add('grindless.machine.tholin_reformer.tooltip.0', '§7Breaks Titan\'s tholins back into chemistry.')
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

    add('grindless.machine.entry_probe_bay.tooltip.0', '§7Lanza sondas a la bruma de Titán.')

    add('grindless.machine.tholin_reformer.tooltip.0', '§7Descompone las tolinas de Titán en productos químicos.')
})
