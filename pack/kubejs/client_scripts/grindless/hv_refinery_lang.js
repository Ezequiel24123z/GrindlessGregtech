// priority: 9600
// Gregtech Grindless - names and tooltips of the HV refining line.
//
//   gtceu:refinery, gtceu:reformer              (machine names + tooltips)
//   gtceu:refining, gtceu:reforming             (recipe type names)
//   grindless:hydrotreating_catalyst            (catalyst of the Refinery)
//   grindless:reforming_catalyst                (catalyst of the Catalytic Reformer)
//
// Same approach as mv_plant_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.refinery', 'Refinery')
    add('gtceu.refining', 'Refining')

    add('grindless.machine.refinery.tooltip.0', '§7A petrochemical complex: crude oil to fuels, naphtha and refinery gas.')
    add('grindless.machine.refinery.tooltip.1', 'Needs a Hydrotreating Catalyst in the input bus.')

    add('block.gtceu.reformer', 'Catalytic Reformer')
    add('gtceu.reforming', 'Reforming')

    add('grindless.machine.reformer.tooltip.0', '§7Turns desulfurized naphtha into benzene, toluene and hydrogen.')
    add('grindless.machine.reformer.tooltip.1', 'Needs a Reforming Catalyst in the input bus.')

    add('item.grindless.hydrotreating_catalyst', 'Hydrotreating Catalyst')
    add('tooltip.grindless.hydrotreating_catalyst', 'Cobalt and molybdenum on silica. Goes in the input bus of the Refinery; used up in about 0.05% of the runs.')
    add('item.grindless.reforming_catalyst', 'Reforming Catalyst')
    add('tooltip.grindless.reforming_catalyst', 'Platinum on silica. Goes in the input bus of the Catalytic Reformer; used up in about 0.05% of the runs.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.refinery', 'Refinería')
    add('gtceu.refining', 'Refino')

    add('grindless.machine.refinery.tooltip.0', '§7Un complejo petroquímico: del crudo a combustibles, nafta y gas de refinería.')
    add('grindless.machine.refinery.tooltip.1', 'Pide un catalizador de hidrotratamiento en el bus.')

    add('block.gtceu.reformer', 'Reformador catalítico')
    add('gtceu.reforming', 'Reformado')

    add('grindless.machine.reformer.tooltip.0', '§7Convierte nafta desulfurada en benceno, tolueno e hidrógeno.')
    add('grindless.machine.reformer.tooltip.1', 'Pide un catalizador de reformado en el bus de entrada.')

    add('item.grindless.hydrotreating_catalyst', 'Catalizador de hidrotratamiento')
    add('tooltip.grindless.hydrotreating_catalyst', 'Cobalto y molibdeno sobre sílice. Va en el bus de entrada de la refinería; se gasta en cerca del 0,05 % de los ciclos.')
    add('item.grindless.reforming_catalyst', 'Catalizador de reformado')
    add('tooltip.grindless.reforming_catalyst', 'Platino sobre sílice. Va en el bus de entrada del reformador catalítico; se gasta en cerca del 0,05 % de los ciclos.')
})
