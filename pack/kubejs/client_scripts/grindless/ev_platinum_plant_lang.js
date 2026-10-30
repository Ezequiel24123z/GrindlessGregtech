// priority: 10300
// Gregtech Grindless - names and tooltips of the EV Platinum Plant and its electrode.
//
//   gtceu:platinum_plant                 (machine name + tooltips)
//   gtceu:pgm_refining                   (recipe type name)
//   grindless:platinum_electrode         (item name + tooltip)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.platinum_plant', 'Platinum Plant')
    add('gtceu.pgm_refining', 'PGM Refining')

    add('grindless.machine.platinum_plant.tooltip.0', '§7The whole platinum-group line in one plant.')
    add('grindless.machine.platinum_plant.no_voiding', 'Circuit 4 keeps everything it makes: the asteroid platinum metals are too scarce to throw away. Turn output voiding off.')

    add('item.grindless.platinum_electrode', 'Platinum Electrode')
    add('tooltip.grindless.platinum_electrode', 'Platinum on titanium. Goes in the input bus of the Platinum Plant, which needs one for every recipe; it wears out by chance (about 0.1% of the runs). Assemble it from a titanium rod and platinum foil.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.platinum_plant', 'Planta de platino')
    add('gtceu.pgm_refining', 'Refinado de PGM')

    add('grindless.machine.platinum_plant.tooltip.0', '§7Toda la línea del grupo del platino en una planta.')
    add('grindless.machine.platinum_plant.no_voiding', 'El circuito 4 guarda todo lo que produce: los metales del platino de los asteroides son demasiado escasos para tirarlos. Desactiva el desecho de salidas.')

    add('item.grindless.platinum_electrode', 'Electrodo de platino')
    add('tooltip.grindless.platinum_electrode', 'Platino sobre titanio. Va en el bus de entrada de la planta de platino, que pide uno para cada receta; se desgasta por probabilidad (en torno al 0,1 % de las ejecuciones). Se ensambla con una varilla de titanio y lámina fina de platino.')
})
