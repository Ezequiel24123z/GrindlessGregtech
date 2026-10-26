// Gregtech Grindless - names and tooltips of ZPM's Naquadria Refinery and Naquadah Fuel Works (startup_scripts/grindless/zpm/naquadria.js),
// their recipe types and the EMI line of each of their recipes (package ZPM-A2).
//
//   gtceu:naquadria_refinery / gtceu.naquadria_refining           (machine name + tooltips, recipe type name)
//   gtceu:naquadah_fuel_works / gtceu.naquadah_fuel               (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_naquadria_refining.<recipe name>       (EMI line of each recipe: what the circuit does)
//   gtceu.recipe.grindless_naquadah_fuel.<recipe name>
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadria_refinery', 'Naquadria Refinery')
    add('gtceu.naquadria_refining', 'Naquadria Refining')
    add('block.gtceu.naquadah_fuel_works', 'Naquadah Fuel Works')
    add('gtceu.naquadah_fuel', 'Naquadah Fuel')

    add('grindless.machine.naquadria_refinery.tooltip.0', 'The impure naquadria solution stored since LuV becomes naquadria in one tower: a centrifuge drum and a distillation stack, where GT-- and GTM need several machines.')
    add('grindless.machine.naquadria_refinery.tooltip.1', 'Circuit 1: 1,000 mB of impure naquadria solution and 2,000 mB of hydrogen, with a 1,000 mB sulfuric acid charge that is never used up, give 6 naquadria, 2 gallium sulfide and 500 mB of enriched naquadah solution. Circuit 2: 2,000 mB of stored naquadria waste.')
    add('grindless.machine.naquadria_refinery.tooltip.2', 'Enriched naquadah solution goes to the naquadah plant (circuit 4), gallium sulfide to the gallium line, sulfuric acid back to the charge. Nothing is voided. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-4 input hatches, 1-2 output buses, 1-2 output hatches.')

    add('grindless.machine.naquadah_fuel_works.tooltip.0', 'GTM\'s naquadah-based liquid fuel loop in one plant: naquadria goes in, fuel comes out, and the depleted fuel comes back as naquadah, europium and xenon.')
    add('grindless.machine.naquadah_fuel_works.tooltip.1', 'Circuit 1: 42 naquadria and the cerium and neodymium make-up (about 5 %, the rest of the catalyst stays) give 1,000 mB of fuel. Circuit 2: 1,000 mB of depleted fuel gives 16 naquadah, a chance of europium and 144 mB of xenon.')
    add('grindless.machine.naquadah_fuel_works.tooltip.2', 'Naquadah goes to the naquadah plant (mode 2), xenon to GTM\'s xenon uses, europium to the motor line. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches.')

    add('gtceu.recipe.grindless_naquadria_refining.naquadria', 'Circuit 1: impure naquadria solution refined to naquadria; the sulfuric acid charge is never used up')
    add('gtceu.recipe.grindless_naquadria_refining.naquadria_waste', 'Circuit 2: stored naquadria waste separated; the sulfuric acid goes back to the charge')
    add('gtceu.recipe.grindless_naquadah_fuel.fuel_mix', 'Circuit 1: naquadria mixed with a cerium and neodymium make-up into naquadah-based liquid fuel')
    add('gtceu.recipe.grindless_naquadah_fuel.fuel_depleted', 'Circuit 2: depleted fuel back to naquadah, europium and xenon')
    add('emi.grindless.info.naquadria_containment_casing.0', 'A casing of naquadah alloy and tungsten steel, filled with naquadria. It builds the Naquadria Refinery and the Naquadah Fuel Works.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadria_refinery', 'Refinería de naquadria')
    add('gtceu.naquadria_refining', 'Refinado de naquadria')
    add('block.gtceu.naquadah_fuel_works', 'Planta de combustible de naquadah')
    add('gtceu.naquadah_fuel', 'Combustible de naquadah')

    add('grindless.machine.naquadria_refinery.tooltip.0', 'La solución impura de naquadria almacenada desde LuV se convierte en naquadria en una sola torre: un tambor de centrífuga y una columna de destilación, donde GT-- y GTM necesitan varias máquinas.')
    add('grindless.machine.naquadria_refinery.tooltip.1', 'Circuito 1: 1 000 mB de solución impura de naquadria y 2 000 mB de hidrógeno, con una carga de 1 000 mB de ácido sulfúrico que nunca se gasta, dan 6 de naquadria, 2 de sulfuro de galio y 500 mB de solución de naquadah enriquecido. Circuito 2: 2 000 mB de residuo de naquadria almacenado.')
    add('grindless.machine.naquadria_refinery.tooltip.2', 'La solución de naquadah enriquecido va a la planta de naquadah (circuito 4), el sulfuro de galio a la línea del galio y el ácido sulfúrico vuelve a la carga. No se desecha nada. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-4 escotillas de entrada, 1-2 buses de salida, 1-2 escotillas de salida.')

    add('grindless.machine.naquadah_fuel_works.tooltip.0', 'El ciclo del combustible líquido de naquadah de GTM en una planta: entra naquadria, sale combustible y el combustible agotado vuelve como naquadah, europio y xenón.')
    add('grindless.machine.naquadah_fuel_works.tooltip.1', 'Circuito 1: 42 de naquadria y el reemplazo de cerio y neodimio (cerca del 5 %, el resto del catalizador se queda) dan 1 000 mB de combustible. Circuito 2: 1 000 mB de combustible agotado dan 16 de naquadah, una probabilidad de europio y 144 mB de xenón.')
    add('grindless.machine.naquadah_fuel_works.tooltip.2', 'El naquadah va a la planta de naquadah (modo 2), el xenón a los usos del xenón de GTM y el europio a la línea de motores. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 buses de salida, 1-2 escotillas de salida.')

    add('gtceu.recipe.grindless_naquadria_refining.naquadria', 'Circuito 1: solución impura de naquadria refinada a naquadria; la carga de ácido sulfúrico nunca se gasta')
    add('gtceu.recipe.grindless_naquadria_refining.naquadria_waste', 'Circuito 2: residuo de naquadria almacenado separado; el ácido sulfúrico vuelve a la carga')
    add('gtceu.recipe.grindless_naquadah_fuel.fuel_mix', 'Circuito 1: naquadria mezclada con un reemplazo de cerio y neodimio da combustible líquido de naquadah')
    add('gtceu.recipe.grindless_naquadah_fuel.fuel_depleted', 'Circuito 2: combustible agotado de vuelta a naquadah, europio y xenón')
    add('emi.grindless.info.naquadria_containment_casing.0', 'Una carcasa de aleación de naquadah y acero de tungsteno, rellena de naquadria. Construye la Refinería de naquadria y la Planta de combustible de naquadah.')
})
