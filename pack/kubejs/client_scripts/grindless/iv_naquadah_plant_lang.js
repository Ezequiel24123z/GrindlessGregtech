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
    add('grindless.machine.naquadah_plant.tooltip.2', 'Same ratios and same energy as GT--\'s machines, the accelerators\' upkeep included (about 1.14 million EU a batch), spent at up to 7,680 EU/t; modes 2 and 3 at up to 30,720 EU/t (LuV).')
    add('grindless.machine.naquadah_plant.tooltip.3', 'Superacid hall: 1-2 energy hatches (two EV hatches run it until Mercury\'s iridium makes IV hatches), 1-2 input buses, 1-2 output buses, 1-6 input hatches and 1-4 output hatches in its edges; the activation chamber of radiation-proof casing stands at its side. ME parts fit.')
    add('grindless.machine.naquadah_plant.tooltip.4', 'LuV, circuit 2: 4 enriched naquadah oxide mixture, 36,000 mB of fluorine, 26,500 mB of hydrogen and 8,000 mB of sulfuric acid give enriched naquadah sulfate, 2 trinium sulfide, impure naquadria solution, titanium and HF. Xenon, fluoroantimonic acid, gold trifluoride and the Pd/C catalyst stay in the hatches and the bus as charges. Circuit 3 does the same with 6 naquadah dust from spent reactor rods. Neither voids its outputs.')
    add('grindless.machine.naquadah_plant.no_voiding', 'Modes 2 and 3 keep everything they make: the naquadria solution must be contained. Turn output voiding off.')

    add('gtceu.recipe.grindless_naquadah_plant.naquadah', 'Mode 1: GT--\'s naquadah line in one pass; a Pu-Be source holds the neutron window')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_naquadah', 'Mode 2: GT--\'s enriched naquadah line with full recovery; xenon, gold, antimony and the Pd/C catalyst stay inside')
    add('gtceu.recipe.grindless_naquadah_plant.spent_naquadah', 'Mode 2: spent naquadah rods re-enriched through GT--\'s naquadah separation, with full recovery')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_solution', 'Mode 3: enriched naquadah solution from the naquadria refinery turned into enriched naquadah dust, with the sulfuric acid sent back')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadah_plant', 'Planta de naquadah')
    add('gtceu.naquadah_refining', 'Refinado de naquadah')

    add('grindless.machine.naquadah_plant.tooltip.0', 'La línea del naquadah de GT-- en una planta. Su activador de neutrones solo da naquadah mientras su energía de neutrones está en una ventana estrecha, que se mantiene con aceleradores y un sensor; aquí una fuente de neutrones de Pu-Be en el bus de entrada mantiene la ventana, y el ácido fluoroantimónico, el superácido más fuerte que se conoce, se hace y se gasta dentro.')
    add('grindless.machine.naquadah_plant.tooltip.1', 'Circuito 1: 4 de mezcla de óxidos de naquadah, 15 de trióxido de antimonio y 40 500 mB de ácido fluorhídrico dan 2 de polvo de naquadah, titanio y galio (cada uno en la mitad de los lotes), 10 500 mB de hidrógeno y 9 000 mB de agua. La fuente de Pu-Be se gasta en el 1 % de los lotes.')
    add('grindless.machine.naquadah_plant.tooltip.2', 'Mismas proporciones y misma energía que las máquinas de GT--, el mantenimiento de los aceleradores incluido (unos 1,14 millones de EU por lote), gastada a un máximo de 7 680 EU/t; los modos 2 y 3, a un máximo de 30 720 EU/t (LuV).')
    add('grindless.machine.naquadah_plant.tooltip.3', 'Nave del superácido: 1-2 escotillas de energía (dos escotillas EV la mueven hasta que el iridio de Mercurio permite las IV), 1-2 buses de entrada, 1-2 buses de salida, 1-6 escotillas de entrada y 1-4 escotillas de salida en sus bordes; la cámara de activación de carcasa a prueba de radiación está a su lado. Valen las piezas ME.')
    add('grindless.machine.naquadah_plant.tooltip.4', 'LuV, circuito 2: 4 de mezcla de óxidos de naquadah enriquecido, 36 000 mB de flúor, 26 500 mB de hidrógeno y 8 000 mB de ácido sulfúrico dan sulfato de naquadah enriquecido, 2 de sulfuro de trinio, solución impura de naquadria, titanio y HF. El xenón, el ácido fluoroantimónico, el trifluoruro de oro y el catalizador de Pd/C se quedan en las escotillas y el bus como cargas. El circuito 3 hace lo mismo con 6 de polvo de naquadah de barras gastadas de reactor. Ninguno de los dos desecha lo que produce.')
    add('grindless.machine.naquadah_plant.no_voiding', 'Los modos 2 y 3 guardan todo lo que producen: la solución de naquadria debe quedar contenida. Desactiva el desecho de salidas.')

    add('gtceu.recipe.grindless_naquadah_plant.naquadah', 'Modo 1: la línea del naquadah de GT-- en una pasada; una fuente de Pu-Be mantiene la ventana de neutrones')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_naquadah', 'Modo 2: la línea del naquadah enriquecido de GT-- con recuperación total; el xenón, el oro, el antimonio y el catalizador de Pd/C se quedan dentro')
    add('gtceu.recipe.grindless_naquadah_plant.spent_naquadah', 'Modo 2: barras de naquadah gastadas reenriquecidas por la separación del naquadah de GT--, con recuperación total')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_solution', 'Modo 3: solución de naquadah enriquecido de la refinería de naquadria convertida en polvo de naquadah enriquecido, devolviendo el ácido sulfúrico')
})
