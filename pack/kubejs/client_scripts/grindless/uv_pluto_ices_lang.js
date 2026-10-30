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

    add('grindless.machine.volatile_ice_fractionator.tooltip.0', '§7Sublimes a core\'s ices one by one on a cold finger.')
    add('grindless.machine.volatile_ice_fractionator.no_voiding', 'The fractionator keeps its ices. Disable voiding.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.penetrator_probe_bay', 'Bah\u00eda de sondas penetradoras')
    add('block.gtceu.volatile_ice_fractionator', 'Fraccionador de hielos vol\u00e1tiles')
    add('gtceu.penetrator_probe', 'Lanzamiento de penetrador')
    add('gtceu.ice_fractionation', 'Fraccionamiento de hielos vol\u00e1tiles')

    add('item.grindless.penetrator_probe', 'Sonda penetradora')
    add('tooltip.grindless.penetrator_probe.0', 'Un armaz\u00f3n impreso con un m\u00f3dulo GPHS, un espectr\u00f3metro HPGe y un cabezal de fusi\u00f3n. Lanzada desde la \u00f3rbita de Plut\u00f3n, se hunde fundiendo el hielo y env\u00eda un n\u00facleo arriba.')
    add('tooltip.grindless.penetrator_probe.1', 'Se gasta en cada lanzamiento: la sonda se queda en el hielo.')

    add('grindless.machine.penetrator_probe_bay.tooltip.0', '§7Lanza un penetrador a Plutón o Caronte y recupera su núcleo.')
    add('grindless.machine.penetrator_probe_bay.no_voiding', 'La bah\u00eda guarda sus n\u00facleos. Desactiva la eliminaci\u00f3n.')

    add('grindless.machine.volatile_ice_fractionator.tooltip.0', '§7Sublima los hielos de un núcleo uno a uno en un dedo frío.')
    add('grindless.machine.volatile_ice_fractionator.no_voiding', 'El fraccionador guarda sus hielos. Desactiva la eliminaci\u00f3n.')
})
