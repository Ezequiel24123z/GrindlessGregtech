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

