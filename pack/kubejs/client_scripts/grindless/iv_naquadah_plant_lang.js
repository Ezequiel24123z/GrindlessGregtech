// Gregtech Grindless - names and tooltips of IV's Naquadah Plant (startup_scripts/grindless/iv/naquadah_plant.js), its recipe type and
// the EMI line of each of its recipes.
//
//   gtceu:naquadah_plant / gtceu.naquadah_refining          (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_naquadah_plant.<recipe name>     (EMI line of each recipe: what the mode does)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadah_plant', 'Naquadah Plant')
    add('gtceu.naquadah_refining', 'Naquadah Refining')

    add('grindless.machine.naquadah_plant.tooltip.0', 'GT--\'s naquadah line in one plant. Its neutron activator only makes naquadah while its neutron energy sits in a narrow window, kept with accelerators and a sensor; here a Pu-Be neutron source on the input bus holds the window, and the fluoroantimonic acid, the strongest superacid known, is made and used inside.')
    add('grindless.machine.naquadah_plant.tooltip.1', 'Circuit 1: 4 naquadah oxide mixture, 15 antimony trioxide and 40,500 mB of hydrofluoric acid give 2 naquadah dust, titanium and gallium (each in half the batches), 10,500 mB of hydrogen and 9,000 mB of water. The Pu-Be source wears out in 1% of the batches.')
    add('grindless.machine.naquadah_plant.tooltip.2', 'Same ratios and same energy as GT--\'s machines, the accelerators\' upkeep included (about 1.14 million EU a batch), spent at up to 7,680 EU/t. Enriched naquadah (circuit 2) is LuV work.')
    add('grindless.machine.naquadah_plant.tooltip.3', 'Superacid hall: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-6 input hatches and 1-4 output hatches in its edges; the activation chamber of radiation-proof casing stands at its side. ME parts fit.')

    add('gtceu.recipe.grindless_naquadah_plant.naquadah', 'Mode 1: GT--\'s naquadah line in one pass; a Pu-Be source holds the neutron window')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadah_plant', 'Planta de naquadah')
    add('gtceu.naquadah_refining', 'Refinado de naquadah')

    add('grindless.machine.naquadah_plant.tooltip.0', 'La línea del naquadah de GT-- en una planta. Su activador de neutrones solo da naquadah mientras su energía de neutrones está en una ventana estrecha, que se mantiene con aceleradores y un sensor; aquí una fuente de neutrones de Pu-Be en el bus de entrada mantiene la ventana, y el ácido fluoroantimónico, el superácido más fuerte que se conoce, se hace y se gasta dentro.')
    add('grindless.machine.naquadah_plant.tooltip.1', 'Circuito 1: 4 de mezcla de óxidos de naquadah, 15 de trióxido de antimonio y 40 500 mB de ácido fluorhídrico dan 2 de polvo de naquadah, titanio y galio (cada uno en la mitad de los lotes), 10 500 mB de hidrógeno y 9 000 mB de agua. La fuente de Pu-Be se gasta en el 1 % de los lotes.')
    add('grindless.machine.naquadah_plant.tooltip.2', 'Mismas proporciones y misma energía que las máquinas de GT--, el mantenimiento de los aceleradores incluido (unos 1,14 millones de EU por lote), gastada a un máximo de 7 680 EU/t. El naquadah enriquecido (circuito 2) es trabajo de LuV.')
    add('grindless.machine.naquadah_plant.tooltip.3', 'Nave del superácido: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, 1-6 escotillas de entrada y 1-4 escotillas de salida en sus bordes; la cámara de activación de carcasa a prueba de radiación está a su lado. Valen las piezas ME.')

    add('gtceu.recipe.grindless_naquadah_plant.naquadah', 'Modo 1: la línea del naquadah de GT-- en una pasada; una fuente de Pu-Be mantiene la ventana de neutrones')
})
