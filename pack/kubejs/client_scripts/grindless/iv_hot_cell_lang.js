// priority: 9100
// Gregtech Grindless - names and tooltips of IV's Hot Cell (startup_scripts/grindless/iv/hot_cell.js), its recipe type, the EMI line of
// each of its recipes and the reason it shows when set to void.
//
//   gtceu:hot_cell / gtceu.hot_cell                   (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_hot_cell.<recipe name>     (EMI line of each recipe: what the mode does)
//   grindless.machine.hot_cell.no_voiding             (why a run does not start)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hot_cell', 'Hot Cell')
    add('gtceu.hot_cell', 'Hot Cell')

    add('grindless.machine.hot_cell.tooltip.0', '§7Handles radioactive material behind shielding.')

    add('gtceu.recipe.grindless_hot_cell.enrichment', 'Mode 1: GregTech\'s UF6 line in one pass; the fluorine loop is closed inside')
    add('gtceu.recipe.grindless_hot_cell.radon', 'Mode 4: GregTech\'s radon from U-238; its plutonium catalyst stays inside')
    add('gtceu.recipe.grindless_hot_cell.mox_fuel_assembly', 'Mode 2: mixed oxide fuel. It takes 2 plutonium; its spent assembly gives 1 back')
    add('gtceu.recipe.grindless_hot_cell.breeder_fuel_assembly', 'Mode 2: a plutonium core in a U-238 blanket. It takes 1 plutonium; its spent assembly gives 2 back')
    add('gtceu.recipe.grindless_hot_cell.rtg_pellet', 'Mode 2: plutonium oxide in a platinum-rhodium capsule')
    add('gtceu.recipe.grindless_hot_cell.pube_neutron_source', 'Mode 2: PuBe13 in a double stainless steel capsule')
    add('gtceu.recipe.grindless_hot_cell.reprocess_spent_fuel', 'Mode 3: PUREX. An LEU or MOX assembly gives back 1 plutonium and 8 U-238')
    add('gtceu.recipe.grindless_hot_cell.reprocess_spent_breeder', 'Mode 3: PUREX. A breeder assembly gives back 2 plutonium and 7 U-238')
    add('gtceu.recipe.grindless_hot_cell.silicon_28_enrichment', 'Mode 5: silicon-28 by fluoride centrifuge; the HF comes back whole')
    add('gtceu.recipe.grindless_hot_cell.boron_11_enrichment', 'Mode 6: boron trifluoride split into boron-11 and boron-10 by exchange distillation')

    add('grindless.machine.hot_cell.no_voiding', 'The hot cell keeps all it makes: the waste, the radon and the fluorine leave through their bus and hatches. Turn voiding off')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hot_cell', 'Celda caliente')
    add('gtceu.hot_cell', 'Celda caliente')

    add('grindless.machine.hot_cell.tooltip.0', '§7Manipula material radiactivo tras un blindaje.')

    add('gtceu.recipe.grindless_hot_cell.enrichment', 'Modo 1: la línea de UF6 de GregTech en una pasada; el ciclo del flúor se cierra dentro')
    add('gtceu.recipe.grindless_hot_cell.radon', 'Modo 4: el radón del U-238 de GregTech; su catalizador de plutonio se queda dentro')
    add('gtceu.recipe.grindless_hot_cell.mox_fuel_assembly', 'Modo 2: combustible de óxidos mixtos. Pide 2 de plutonio; su elemento gastado devuelve 1')
    add('gtceu.recipe.grindless_hot_cell.breeder_fuel_assembly', 'Modo 2: un núcleo de plutonio en un manto de U-238. Pide 1 de plutonio; su elemento gastado devuelve 2')
    add('gtceu.recipe.grindless_hot_cell.rtg_pellet', 'Modo 2: óxido de plutonio en una cápsula de platino y rodio')
    add('gtceu.recipe.grindless_hot_cell.pube_neutron_source', 'Modo 2: PuBe13 en una cápsula doble de acero inoxidable')
    add('gtceu.recipe.grindless_hot_cell.reprocess_spent_fuel', 'Modo 3: PUREX. Un elemento de LEU o de MOX devuelve 1 de plutonio y 8 de U-238')
    add('gtceu.recipe.grindless_hot_cell.reprocess_spent_breeder', 'Modo 3: PUREX. Un elemento reproductor devuelve 2 de plutonio y 7 de U-238')
    add('gtceu.recipe.grindless_hot_cell.silicon_28_enrichment', 'Modo 5: silicio-28 por centrifugado del fluoruro; el HF vuelve entero')
    add('gtceu.recipe.grindless_hot_cell.boron_11_enrichment', 'Modo 6: el trifluoruro de boro se separa en boro-11 y boro-10 por destilación de intercambio')

    add('grindless.machine.hot_cell.no_voiding', 'La celda caliente guarda todo lo que hace: el residuo, el radón y el flúor salen por su bus y sus escotillas. Desactiva el vaciado')
})
