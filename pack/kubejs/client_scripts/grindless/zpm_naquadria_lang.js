// priority: 900
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

    add('grindless.machine.naquadria_refinery.tooltip.0', '§7Refines impure naquadria solution in one tower.')

    add('grindless.machine.naquadah_fuel_works.tooltip.0', '§7Runs the whole naquadah fuel loop in one plant.')

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

    add('grindless.machine.naquadria_refinery.tooltip.0', '§7Refina solución de naquadria impura en una sola torre.')

    add('grindless.machine.naquadah_fuel_works.tooltip.0', '§7Ejecuta todo el ciclo de combustible de naquadah en una planta.')

    add('gtceu.recipe.grindless_naquadria_refining.naquadria', 'Circuito 1: solución impura de naquadria refinada a naquadria; la carga de ácido sulfúrico nunca se gasta')
    add('gtceu.recipe.grindless_naquadria_refining.naquadria_waste', 'Circuito 2: residuo de naquadria almacenado separado; el ácido sulfúrico vuelve a la carga')
    add('gtceu.recipe.grindless_naquadah_fuel.fuel_mix', 'Circuito 1: naquadria mezclada con un reemplazo de cerio y neodimio da combustible líquido de naquadah')
    add('gtceu.recipe.grindless_naquadah_fuel.fuel_depleted', 'Circuito 2: combustible agotado de vuelta a naquadah, europio y xenón')
    add('emi.grindless.info.naquadria_containment_casing.0', 'Una carcasa de aleación de naquadah y acero de tungsteno, rellena de naquadria. Construye la Refinería de naquadria y la Planta de combustible de naquadah.')
})
