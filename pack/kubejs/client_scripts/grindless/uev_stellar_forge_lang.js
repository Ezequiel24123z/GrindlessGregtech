// priority: 4918
// Gregtech Grindless - names and tooltips of the UEV Stellar Forge (startup_scripts/grindless/uev/stellar_forge.js), and the text of its EMI
// info card (assets/emi/recipe/additions/grindless/uev_stellar_forge.json).
//
//   gtceu:stellar_forge   (machine name + 4 tooltip lines, en_us and es_es)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.stellar_forge', 'Stellar Forge')
    add('grindless.machine.stellar_forge.tooltip.0', 'The massive electric blast furnace: runs every electric blast furnace recipe, many copies at once. A recipe hotter than the coil is refused.')
    add('grindless.machine.stellar_forge.tooltip.1', 'Copies at once: 2^((heat - recipe temperature) / 450 K) times the parallel hatch, never above 2^31-1. Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t).')
    add('grindless.machine.stellar_forge.tooltip.2', 'Optional plasma: with 250 mB of Helium-3 Deuterium plasma in a fluid input hatch, a run takes it once, returns 250 mB of helium-4 ash and heats 900 K above the coil. Without it nothing is drained.')
    add('grindless.machine.stellar_forge.tooltip.3', 'Needs, in a 7 x 16 x 7 shell of heatproof casings: 4 rings of 8 heating coils of one type (the lowest sets the tier); in any casing cell 1 maintenance hatch, 1 or 2 energy hatches, 1 parallel hatch, up to 2 input and 2 output buses, up to 4 fluid input and 4 fluid output hatches.')
    add('emi.grindless.info.stellar_forge.0', 'The Stellar Forge runs electric blast furnace recipes. Copies: 2^((heat - recipe temperature) / 450 K) times the parallel hatch, bounded by the energy hatches. Plasma is optional: 250 mB of Helium-3 Deuterium plasma per run adds 900 K and returns 250 mB of helium-4 ash.')
    add('emi.grindless.info.uev_parallel_hatch.0', 'The Ultimate Parallel Control Hatch lets a machine that takes parallel hatches run up to 4096 copies of a recipe at once, each at its own EU/t.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.stellar_forge', 'Forja Estelar')
    add('grindless.machine.stellar_forge.tooltip.0', 'El horno de arco eléctrico masivo: ejecuta todas las recetas del horno de arco eléctrico, muchas copias a la vez. Una receta más caliente que la bobina se rechaza.')
    add('grindless.machine.stellar_forge.tooltip.1', 'Copias a la vez: 2^((calor - temperatura de la receta) / 450 K) por el hatch paralelo, sin pasar de 2^31-1. Cada copia paga su EU/t completo, así que los hatches de energía fijan cuántas corren: floor(voltaje del hatch / EU/t de la receta).')
    add('grindless.machine.stellar_forge.tooltip.2', 'Plasma opcional: con 250 mB de plasma de helio-3 y deuterio en un hatch de fluido de entrada, la ejecución lo toma una vez, devuelve 250 mB de ceniza de helio-4 y calienta 900 K sobre la bobina. Sin él no se drena nada.')
    add('grindless.machine.stellar_forge.tooltip.3', 'Necesita, en una carcasa de 7 x 16 x 7 de carcasas termorresistentes: 4 anillos de 8 bobinas calefactoras del mismo tipo (la más baja fija el nivel); en cualquier celda de carcasa 1 hatch de mantenimiento, 1 o 2 hatches de energía, 1 hatch paralelo, hasta 2 buses de entrada y 2 de salida, hasta 4 hatches de fluido de entrada y 4 de salida.')
    add('emi.grindless.info.stellar_forge.0', 'La Forja Estelar ejecuta recetas del horno de arco eléctrico. Copias: 2^((calor - temperatura de la receta) / 450 K) por el hatch paralelo, limitadas por los hatches de energía. El plasma es opcional: 250 mB de plasma de helio-3 y deuterio por ejecución suman 900 K y devuelven 250 mB de ceniza de helio-4.')
    add('emi.grindless.info.uev_parallel_hatch.0', 'La escotilla de control paralelo definitiva deja que una máquina que acepta hatches paralelos ejecute hasta 4096 copias de una receta a la vez, cada una con su EU/t.')
})
