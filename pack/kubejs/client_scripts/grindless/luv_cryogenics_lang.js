// priority: 8000
// Gregtech Grindless - names and tooltips of LuV's helium refrigerator and coated conductor line (startup_scripts/grindless/luv/
// helium_refrigerator.js and coated_conductor_line.js; package LuV-A3), their recipe types, the EMI line of their recipes and the
// refrigerator's controller line.
//
//   gtceu:helium_refrigerator / gtceu.closed_loop_cooling           (machine name + tooltips, recipe type name)
//   gtceu:coated_conductor_line / gtceu.coated_conductor            (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_closed_loop                              (EMI line of every refrigerator recipe; %s make-up, %s charge)
//   gtceu.recipe.grindless_coated_conductor.<recipe name>           (EMI line of each line recipe: what the step does)
//   grindless.machine.helium_refrigerator.charge.ok|low             (controller line: %s mB held, %s mB charge, %s mB make-up)
//
// The tape and the coated conductor are LuV-A1's items; their names are A1's.
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.helium_refrigerator', 'Helium Refrigerator')
    add('gtceu.closed_loop_cooling', 'Closed-Loop Cooling')
    add('block.gtceu.coated_conductor_line', 'Coated Conductor Line')
    add('gtceu.coated_conductor', 'Coated Conductor')

    add('grindless.machine.helium_refrigerator.tooltip.0', '§7Cools hot ingots with a closed helium loop.')

    add('grindless.machine.helium_refrigerator.charge.ok', 'Helium loop: %s mB of liquid helium (a %s mB charge that stays, and %s mB spent a run)')
    add('grindless.machine.helium_refrigerator.charge.low', 'Helium loop: %s mB of liquid helium. A run needs the %s mB charge plus %s mB of make-up in the input hatches')

    add('gtceu.recipe.grindless_closed_loop', 'Closed loop: %s mB of liquid helium spent; the %s mB charge stays in the machine')

    add('grindless.machine.coated_conductor_line.tooltip.0', '§7Coats second-generation superconducting tape.')

    add('gtceu.recipe.grindless_coated_conductor.nickel_tungsten_substrate', 'Step 1: nickel and tungsten, 19 to 1, rolled and annealed to a cube texture')
    add('gtceu.recipe.grindless_coated_conductor.itbtc_coated_conductor', 'Step 2: a micron of ITBTC laser-deposited on the tape, annealed in oxygen and capped with silver')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.helium_refrigerator', 'Refrigerador de helio')
    add('gtceu.closed_loop_cooling', 'Refrigeración en circuito cerrado')
    add('block.gtceu.coated_conductor_line', 'Línea de conductor recubierto')
    add('gtceu.coated_conductor', 'Conductor recubierto')

    add('grindless.machine.helium_refrigerator.tooltip.0', '§7Enfría lingotes calientes con un circuito cerrado de helio.')

    add('grindless.machine.helium_refrigerator.charge.ok', 'Circuito de helio: %s mB de helio líquido (una carga de %s mB que se queda, y %s mB gastados por receta)')
    add('grindless.machine.helium_refrigerator.charge.low', 'Circuito de helio: %s mB de helio líquido. Una receta necesita la carga de %s mB más %s mB de reposición en las escotillas de entrada')

    add('gtceu.recipe.grindless_closed_loop', 'Circuito cerrado: se gastan %s mB de helio líquido; la carga de %s mB se queda en la máquina')

    add('grindless.machine.coated_conductor_line.tooltip.0', '§7Fabrica cinta superconductora de segunda generación.')

    add('gtceu.recipe.grindless_coated_conductor.nickel_tungsten_substrate', 'Paso 1: níquel y wolframio, 19 a 1, laminados y recocidos con textura cúbica')
    add('gtceu.recipe.grindless_coated_conductor.itbtc_coated_conductor', 'Paso 2: una micra de ITBTC depositada por láser sobre la cinta, recocida en oxígeno y cubierta de plata')
})
