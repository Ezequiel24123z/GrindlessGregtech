// priority: 9650
// Gregtech Grindless - names and tooltips of the HV Coil Chemical Plant (startup_scripts/grindless/hv/mega_coil_chemical_plant.js).
//
//   gtceu:coil_chemical_plant   (machine name + 3 tooltip lines, en_us and es_es)
//
// It runs GTM's large chemical reactor recipes, so the recipe type name (gtceu.large_chemical_reactor) is GTM's own; GTM 7.5.3 ships no
// es_es, so it shows in English in both languages, like every other GTM name.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.coil_chemical_plant', 'Coil Chemical Plant')
    add('grindless.machine.coil_chemical_plant.tooltip.0', '§7A large chemical reactor whose copies grow with its heating coil.')
    add('grindless.machine.coil_chemical_plant.tooltip.1', 'Copies: 2^(coil temperature / 900 K), up to 64.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.coil_chemical_plant', 'Planta Química de Bobinas')
    add('grindless.machine.coil_chemical_plant.tooltip.0', '§7Un reactor químico grande cuyas copias crecen con su bobina calefactora.')
    add('grindless.machine.coil_chemical_plant.tooltip.1', 'Copias: 2^(temperatura de la bobina / 900 K), hasta 64.')
})
