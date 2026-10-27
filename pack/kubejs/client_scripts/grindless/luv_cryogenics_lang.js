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

    add('grindless.machine.helium_refrigerator.tooltip.0', 'A Claude-cycle helium refrigerator: a cold box with two turbo-expanders, a compressor house and a helium gas holder. It cools every hot ingot, and every molten metal in an ingot mold, that the vacuum freezer cools with liquid helium.')
    add('grindless.machine.helium_refrigerator.tooltip.1', 'The helium runs in a closed loop: a run spends 25 mB of liquid helium instead of the freezer\'s 250 mB, and pays in EU to liquefy the rest again. 50 mB of liquid nitrogen precools the loop and leaves as nitrogen gas.')
    add('grindless.machine.helium_refrigerator.tooltip.2', 'It needs a 4,000 mB liquid helium charge in its input hatches on top of the make-up. The charge is never used up; with a parallel hatch it is still 4,000 mB, plus 25 mB for each copy.')
    add('grindless.machine.helium_refrigerator.tooltip.3', 'The cold box\'s floor ring takes 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-4 input hatches and 1-2 output hatches; ME parts fit. The nitrogen goes back to the cryogenic plant, or is voided.')

    add('grindless.machine.helium_refrigerator.charge.ok', 'Helium loop: %s mB of liquid helium (a %s mB charge that stays, and %s mB spent a run)')
    add('grindless.machine.helium_refrigerator.charge.low', 'Helium loop: %s mB of liquid helium. A run needs the %s mB charge plus %s mB of make-up in the input hatches')

    add('gtceu.recipe.grindless_closed_loop', 'Closed loop: %s mB of liquid helium spent; the %s mB charge stays in the machine')

    add('grindless.machine.coated_conductor_line.tooltip.0', 'A reel-to-reel line for second-generation superconducting tape: payoff reel, rolling stand, annealing furnace, laser deposition chamber, oxygen anneal tube, silver sputter cell and take-up reel. The programmed circuit picks the step: 1 substrate, 2 tape.')
    add('grindless.machine.coated_conductor_line.tooltip.1', 'Substrate: 19 nickel dust and 1 tungsten dust give 20 nickel-tungsten tape. Tape: 16 of it, 1 ITBTC dust, 1,000 mB of oxygen and 36 mB of molten silver give 16 ITBTC coated conductor, with no 6,000 K blast furnace and no liquid helium.')
    add('grindless.machine.coated_conductor_line.tooltip.2', 'The bed\'s front and back rows take 1-2 energy hatches, 1-3 input buses, 1-2 input hatches and 1-2 output buses; ME parts fit. The coated conductor feeds the HTS magnet works.')

    add('gtceu.recipe.grindless_coated_conductor.nickel_tungsten_substrate', 'Step 1: nickel and tungsten, 19 to 1, rolled and annealed to a cube texture')
    add('gtceu.recipe.grindless_coated_conductor.itbtc_coated_conductor', 'Step 2: a micron of ITBTC laser-deposited on the tape, annealed in oxygen and capped with silver')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.helium_refrigerator', 'Refrigerador de helio')
    add('gtceu.closed_loop_cooling', 'Refrigeración en circuito cerrado')
    add('block.gtceu.coated_conductor_line', 'Línea de conductor recubierto')
    add('gtceu.coated_conductor', 'Conductor recubierto')

    add('grindless.machine.helium_refrigerator.tooltip.0', 'Un refrigerador de helio de ciclo Claude: una caja fría con dos turboexpansores, una sala de compresores y un gasómetro de helio. Enfría cada lingote caliente, y cada metal fundido en un molde de lingote, que el congelador al vacío enfría con helio líquido.')
    add('grindless.machine.helium_refrigerator.tooltip.1', 'El helio circula en un circuito cerrado: cada receta gasta 25 mB de helio líquido en vez de los 250 mB del congelador, y paga en EU volver a licuar el resto. 50 mB de nitrógeno líquido preenfrían el circuito y salen como nitrógeno gaseoso.')
    add('grindless.machine.helium_refrigerator.tooltip.2', 'Necesita una carga de 4000 mB de helio líquido en sus escotillas de entrada, además de la reposición. La carga nunca se gasta; con una escotilla de paralelo sigue siendo de 4000 mB, más 25 mB por cada copia.')
    add('grindless.machine.helium_refrigerator.tooltip.3', 'El anillo del suelo de la caja fría admite 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, 1-4 escotillas de entrada y 1-2 escotillas de salida; valen las piezas ME. El nitrógeno vuelve a la planta criogénica, o se tira.')

    add('grindless.machine.helium_refrigerator.charge.ok', 'Circuito de helio: %s mB de helio líquido (una carga de %s mB que se queda, y %s mB gastados por receta)')
    add('grindless.machine.helium_refrigerator.charge.low', 'Circuito de helio: %s mB de helio líquido. Una receta necesita la carga de %s mB más %s mB de reposición en las escotillas de entrada')

    add('gtceu.recipe.grindless_closed_loop', 'Circuito cerrado: se gastan %s mB de helio líquido; la carga de %s mB se queda en la máquina')

    add('grindless.machine.coated_conductor_line.tooltip.0', 'Una línea de bobina a bobina para cinta superconductora de segunda generación: bobina de salida, tren de laminación, horno de recocido, cámara de depósito por láser, tubo de recocido en oxígeno, celda de pulverización de plata y bobina de recogida. El circuito programado elige el paso: 1 sustrato, 2 cinta.')
    add('grindless.machine.coated_conductor_line.tooltip.1', 'Sustrato: 19 de polvo de níquel y 1 de polvo de wolframio dan 20 de cinta de níquel-wolframio. Cinta: 16 de ella, 1 de polvo de ITBTC, 1000 mB de oxígeno y 36 mB de plata fundida dan 16 de conductor recubierto de ITBTC, sin alto horno de 6000 K ni helio líquido.')
    add('grindless.machine.coated_conductor_line.tooltip.2', 'Las filas delantera y trasera de la bancada admiten 1-2 escotillas de energía, 1-3 buses de entrada, 1-2 escotillas de entrada y 1-2 buses de salida; valen las piezas ME. El conductor recubierto alimenta el taller de imanes HTS.')

    add('gtceu.recipe.grindless_coated_conductor.nickel_tungsten_substrate', 'Paso 1: níquel y wolframio, 19 a 1, laminados y recocidos con textura cúbica')
    add('gtceu.recipe.grindless_coated_conductor.itbtc_coated_conductor', 'Paso 2: una micra de ITBTC depositada por láser sobre la cinta, recocida en oxígeno y cubierta de plata')
})
