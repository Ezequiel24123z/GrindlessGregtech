// priority: 2100
// Gregtech Grindless - names and tooltips of UV's Pluto ices (startup_scripts/grindless/uv/pluto_ices.js): gtceu:penetrator_probe_bay and
// its recipe type gtceu:penetrator_probe, gtceu:volatile_ice_fractionator and gtceu:ice_fractionation, and the item grindless:penetrator_probe.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.penetrator_probe_bay', 'Penetrator Probe Bay')
    add('block.gtceu.volatile_ice_fractionator', 'Volatile Ice Fractionator')
    add('gtceu.penetrator_probe', 'Penetrator Drop')
    add('gtceu.ice_fractionation', 'Volatile Ice Fractionation')

    add('item.grindless.penetrator_probe', 'Penetrator Probe')
    add('tooltip.grindless.penetrator_probe.0', 'A printed frame around a GPHS module, an HPGe spectrometer and a melt head. Dropped from Pluto orbit, it melts into the ice and sends a core up.')
    add('tooltip.grindless.penetrator_probe.1', 'Spent in each drop: the probe stays in the ice.')

    add('grindless.machine.penetrator_probe_bay.tooltip.0', '§7Drops a penetrator on Pluto or Charon and recovers its core.')
    add('grindless.machine.penetrator_probe_bay.no_voiding', 'The bay keeps its cores. Disable voiding.')

    add('grindless.machine.volatile_ice_fractionator.tooltip.0', '§7Sublimes a core\'s ices and anneals Kuiper samples.')
    add('grindless.machine.volatile_ice_fractionator.no_voiding', 'The fractionator keeps its ices. Disable voiding.')
})

