// priority: 1100
// Gregtech Grindless - names and tooltips of ZPM's plasma quench caster and direct energy converter (startup_scripts/grindless/zpm/fusion.js),
// their recipe types, and the EMI line of each recipe.
//
//   gtceu:plasma_quench_caster / gtceu.plasma_quench          (machine name + tooltips, recipe type name)
//   gtceu:direct_energy_converter / gtceu.direct_conversion   (machine name + tooltips, recipe type name)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.plasma_quench_caster', 'Plasma Quench Caster')
    add('gtceu.plasma_quench', 'Plasma Quenching')
    add('block.gtceu.direct_energy_converter', 'Direct Energy Converter')
    add('gtceu.direct_conversion', 'Direct Energy Conversion')

    add('grindless.machine.plasma_quench_caster.tooltip.0', 'Casts the Mk2\'s molten duranium, tritanium and darmstadtium straight into plate (circuit 1) or four foils (circuit 2) in one step, under an argon shroud, in a water-cooled mold.')
    add('grindless.machine.plasma_quench_caster.tooltip.1', 'Each cast takes 144 mB of metal and a 1,000 mB argon shroud; 950 mB of argon come back (5% make-up). Darmstadtium makes plate only.')
    add('grindless.machine.plasma_quench_caster.tooltip.2', 'The heat of the cast leaves as 2,000 mB of steam: send it to a turbine. Turn fluid voiding off.')

    add('grindless.machine.direct_energy_converter.tooltip.0', 'Turns the Mk2\'s plasma into electricity without a turbine: the charged particles are slowed across three grids and their energy is taken directly.')
    add('grindless.machine.direct_energy_converter.tooltip.1', 'Helium plasma and tin plasma give 1.25 times what the plasma turbine makes from them; the cooled gas or molten tin comes out of the output hatch.')
    add('grindless.machine.direct_energy_converter.tooltip.2', 'Needs one or more energy output hatches (wireless ones too) and runs up to 128 runs at once. Turn fluid voiding off.')

    add('gtceu.recipe.grindless_plasma_quench.duranium_plate', 'Circuit 1: a duranium plate cast under argon')
    add('gtceu.recipe.grindless_plasma_quench.duranium_foil', 'Circuit 2: four duranium foils cast under argon')
    add('gtceu.recipe.grindless_plasma_quench.tritanium_plate', 'Circuit 1: a tritanium plate cast under argon')
    add('gtceu.recipe.grindless_plasma_quench.tritanium_foil', 'Circuit 2: four tritanium foils cast under argon')
    add('gtceu.recipe.grindless_plasma_quench.darmstadtium_plate', 'Circuit 1: a darmstadtium plate cast under argon')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.plasma_quench_caster', 'Fundidora de temple de plasma')
    add('gtceu.plasma_quench', 'Temple de plasma')
    add('block.gtceu.direct_energy_converter', 'Convertidor directo de energía')
    add('gtceu.direct_conversion', 'Conversión directa de energía')

    add('grindless.machine.plasma_quench_caster.tooltip.0', 'Cuela el duranio, el tritanio y el darmstadtio fundidos del Mk2 directamente en placa (circuito 1) o cuatro láminas (circuito 2) en un solo paso, bajo un escudo de argón, en un molde refrigerado por agua.')
    add('grindless.machine.plasma_quench_caster.tooltip.1', 'Cada colada toma 144 mB de metal y un escudo de 1000 mB de argón; vuelven 950 mB de argón (5 % de reposición). El darmstadtio solo da placa.')
    add('grindless.machine.plasma_quench_caster.tooltip.2', 'El calor de la colada sale como 2000 mB de vapor: llévalo a una turbina. Desactiva el vaciado de fluidos.')

    add('grindless.machine.direct_energy_converter.tooltip.0', 'Convierte el plasma del Mk2 en electricidad sin turbina: las partículas cargadas se frenan en tres rejillas y su energía se toma directamente.')
    add('grindless.machine.direct_energy_converter.tooltip.1', 'El plasma de helio y el de estaño dan 1,25 veces lo que produce la turbina de plasma con ellos; el gas enfriado o el estaño fundido sale por la escotilla de salida.')
    add('grindless.machine.direct_energy_converter.tooltip.2', 'Necesita una o más escotillas de salida de energía (también las inalámbricas) y hace hasta 128 ejecuciones a la vez. Desactiva el vaciado de fluidos.')

    add('gtceu.recipe.grindless_plasma_quench.duranium_plate', 'Circuito 1: una placa de duranio colada bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.duranium_foil', 'Circuito 2: cuatro láminas de duranio coladas bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.tritanium_plate', 'Circuito 1: una placa de tritanio colada bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.tritanium_foil', 'Circuito 2: cuatro láminas de tritanio coladas bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.darmstadtium_plate', 'Circuito 1: una placa de darmstadtio colada bajo argón')
})
