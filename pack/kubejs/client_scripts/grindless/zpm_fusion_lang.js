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

    add('grindless.machine.plasma_quench_caster.tooltip.0', '§7Casts the Mk2\'s molten metals into plate or foil.')

    add('grindless.machine.direct_energy_converter.tooltip.0', '§7Turns plasma into electricity without a turbine.')

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

    add('grindless.machine.plasma_quench_caster.tooltip.0', '§7Cuela los metales fundidos del Mk2 en placa o lámina.')

    add('grindless.machine.direct_energy_converter.tooltip.0', '§7Convierte plasma en electricidad sin turbina.')

    add('gtceu.recipe.grindless_plasma_quench.duranium_plate', 'Circuito 1: una placa de duranio colada bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.duranium_foil', 'Circuito 2: cuatro láminas de duranio coladas bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.tritanium_plate', 'Circuito 1: una placa de tritanio colada bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.tritanium_foil', 'Circuito 2: cuatro láminas de tritanio coladas bajo argón')
    add('gtceu.recipe.grindless_plasma_quench.darmstadtium_plate', 'Circuito 1: una placa de darmstadtio colada bajo argón')
})
