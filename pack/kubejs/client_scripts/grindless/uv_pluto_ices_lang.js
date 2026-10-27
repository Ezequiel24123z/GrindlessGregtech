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

    add('grindless.machine.penetrator_probe_bay.tooltip.0', 'Drops a penetrator into Sputnik Planitia or onto Charon and catches the core it sends up. The Triton ice core (kept) calibrates it for Kuiper ices. Only works in Pluto orbit.')
    add('grindless.machine.penetrator_probe_bay.tooltip.1', 'Circuit 1: 1 penetrator probe -> 1 Sputnik ice core. Circuit 2: 1 penetrator probe -> 1 Charon core. 491,520 EU/t (UV), 200 t.')
    add('grindless.machine.penetrator_probe_bay.tooltip.2', 'Needs: 1 or 2 energy hatches (UV), 1 or 2 input buses, 1 or 2 output buses, and 14 or more station truss casings in the floor. A titanium probe rail runs up the middle to the canister catcher (tungstensteel gearbox).')
    add('grindless.machine.penetrator_probe_bay.no_voiding', 'The bay keeps its cores. Disable voiding.')

    add('grindless.machine.volatile_ice_fractionator.tooltip.0', 'Warms a core step by step on a cold finger: each ice sublimes at its own temperature (nitrogen, then carbon monoxide, then methane). Only works in Pluto orbit.')
    add('grindless.machine.volatile_ice_fractionator.tooltip.1', 'Circuit 1: 1 Sputnik ice core -> 16,000 mB nitrogen + 2,000 mB carbon monoxide + 1,000 mB methane + 1 tholin. Circuit 2: 1 Charon core -> 8,000 mB water + 2,000 mB ammonia + 1 silicon dioxide dust. 122,880 EU/t (ZPM), 600 t.')
    add('grindless.machine.volatile_ice_fractionator.tooltip.2', 'Needs: 1 or 2 energy hatches (UV), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 output hatches, and 14 or more station truss casings in the floor. The stepped cold finger (steel pipe casings, titanium frames) stands in the middle.')
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

    add('grindless.machine.penetrator_probe_bay.tooltip.0', 'Lanza un penetrador a Sputnik Planitia o a Caronte y recoge el n\u00facleo que env\u00eda arriba. El n\u00facleo de hielo de Trit\u00f3n (se conserva) lo calibra para los hielos de Kuiper. Solo funciona en la \u00f3rbita de Plut\u00f3n.')
    add('grindless.machine.penetrator_probe_bay.tooltip.1', 'Circuito 1: 1 sonda penetradora -> 1 n\u00facleo de hielo de Sputnik. Circuito 2: 1 sonda penetradora -> 1 n\u00facleo de Caronte. 491.520 EU/t (UV), 200 t.')
    add('grindless.machine.penetrator_probe_bay.tooltip.2', 'Necesita: 1 o 2 escotillas de energ\u00eda (UV), 1 o 2 buses de entrada, 1 o 2 buses de salida y 14 o m\u00e1s carcasas de celos\u00eda de estaci\u00f3n en el suelo. Un ra\u00edl de sonda de titanio sube por el centro hasta el recogedor de c\u00e1psulas (caja de engranajes de acero de tungsteno).')
    add('grindless.machine.penetrator_probe_bay.no_voiding', 'La bah\u00eda guarda sus n\u00facleos. Desactiva la eliminaci\u00f3n.')

    add('grindless.machine.volatile_ice_fractionator.tooltip.0', 'Calienta un n\u00facleo paso a paso en un dedo fr\u00edo: cada hielo sublima a su propia temperatura (nitr\u00f3geno, luego mon\u00f3xido de carbono, luego metano). Solo funciona en la \u00f3rbita de Plut\u00f3n.')
    add('grindless.machine.volatile_ice_fractionator.tooltip.1', 'Circuito 1: 1 n\u00facleo de hielo de Sputnik -> 16.000 mB de nitr\u00f3geno + 2.000 mB de mon\u00f3xido de carbono + 1.000 mB de metano + 1 tolina. Circuito 2: 1 n\u00facleo de Caronte -> 8.000 mB de agua + 2.000 mB de amon\u00edaco + 1 polvo de di\u00f3xido de silicio. 122.880 EU/t (ZPM), 600 t.')
    add('grindless.machine.volatile_ice_fractionator.tooltip.2', 'Necesita: 1 o 2 escotillas de energ\u00eda (UV), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de salida y 14 o m\u00e1s carcasas de celos\u00eda de estaci\u00f3n en el suelo. El dedo fr\u00edo escalonado (carcasas de tuber\u00eda de acero, marcos de titanio) est\u00e1 en el centro.')
    add('grindless.machine.volatile_ice_fractionator.no_voiding', 'El fraccionador guarda sus hielos. Desactiva la eliminaci\u00f3n.')
})
