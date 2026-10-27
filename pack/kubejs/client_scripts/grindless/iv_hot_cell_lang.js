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

    add('grindless.machine.hot_cell.tooltip.0', 'A bank of two shielded cells: radioactive material comes in through buses and hatches and leaves to the network, never through hands. Tongs through the wall above each lead-glass window do the work. The programmed circuit picks the mode: 1 enrichment, 2 fuel, 3 reprocessing, 4 radon, 5 silicon-28, 6 boron-11.')
    add('grindless.machine.hot_cell.tooltip.1', 'Modes 1 and 4 run GregTech\'s own lines in one pass, with the same energy: enrichment turns 30 uraninite and 40,000 mB of HF into 1 U-235, 9 U-238, water and the same fluorine as F2, and the UF6 never leaves; radon needs no plutonium, because GregTech\'s plutonium catalyst stays inside.')
    add('grindless.machine.hot_cell.tooltip.2', 'Mode 2 makes MOX and breeder assemblies in Zircaloy tubes, RTG pellets and Pu-Be neutron sources. Mode 3 reprocesses spent assemblies in nitric acid: the uranium and plutonium come back, with xenon, krypton, caesium, neodymium, NO2 for nitric acid and glassed waste.')
    add('grindless.machine.hot_cell.tooltip.3', 'The waste is contained: it leaves through the output bus, and the hot cell refuses voiding. Service wall and side walls: 1-2 energy hatches, 1-3 input buses, 1-3 output buses, 1-4 input hatches and 1-4 output hatches. ME parts fit.')

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

    add('grindless.machine.hot_cell.tooltip.0', 'Un banco de dos celdas blindadas: el material radiactivo entra por buses y escotillas y sale a la red, nunca pasa por las manos. Unas pinzas que atraviesan el muro sobre cada ventana de vidrio plomado hacen el trabajo. El circuito programado elige el modo: 1 enriquecimiento, 2 combustible, 3 reprocesado, 4 radón, 5 silicio-28, 6 boro-11.')
    add('grindless.machine.hot_cell.tooltip.1', 'Los modos 1 y 4 hacen las líneas de GregTech en una pasada, con la misma energía: el enriquecimiento convierte 30 de uraninita y 40 000 mB de HF en 1 de U-235, 9 de U-238, agua y el mismo flúor como F2, y el UF6 nunca sale; el radón no pide plutonio, porque el catalizador de plutonio de GregTech se queda dentro.')
    add('grindless.machine.hot_cell.tooltip.2', 'El modo 2 hace elementos MOX y reproductores en tubos de zircaloy, pastillas de RTG y fuentes de neutrones de Pu-Be. El modo 3 reprocesa elementos gastados en ácido nítrico: vuelven el uranio y el plutonio, con xenón, kriptón, cesio, neodimio, NO2 para el ácido nítrico y residuo vitrificado.')
    add('grindless.machine.hot_cell.tooltip.3', 'El residuo queda confinado: sale por el bus de salida, y la celda no acepta tirar nada. Muro de servicio y muros laterales: 1-2 escotillas de energía, 1-3 buses de entrada, 1-3 buses de salida, 1-4 escotillas de entrada y 1-4 escotillas de salida. Valen las piezas ME.')

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
