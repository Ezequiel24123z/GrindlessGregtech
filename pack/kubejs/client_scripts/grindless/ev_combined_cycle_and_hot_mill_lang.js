// Gregtech Grindless - names and tooltips of the EV Combined-Cycle Plant and Hot Strip Mill, their recipe types, and the reason both show
// when the controller is set to void fluids.
//
//   gtceu:combined_cycle_plant / gtceu:combined_cycle   (machine name + tooltips, recipe type name)
//   gtceu:hot_strip_mill / gtceu:hot_rolling            (machine name + tooltips, recipe type name)
//   grindless.steam_outputs.no_voiding                  (why the run does not start)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.combined_cycle_plant', 'Combined-Cycle Plant')
    add('gtceu.combined_cycle', 'Combined Cycle')
    add('block.gtceu.hot_strip_mill', 'Hot Strip Mill')
    add('gtceu.hot_rolling', 'Hot Rolling')

    add('grindless.machine.combined_cycle_plant.tooltip.0', 'A gas turbine whose hot exhaust boils water in a heat-recovery boiler. It burns every gas turbine fuel for the same EU per mB as the gas turbine and turns distilled water into steam worth 40% more energy in a steam turbine (more with a good rotor in a large steam turbine).')
    add('grindless.machine.combined_cycle_plant.tooltip.1', 'The steam needs somewhere to go: if its hatch has no room, the plant stops, fuel and all, and it refuses to void fluids. A fuel burns here only where it burns in a gas turbine: fuels that need air, only where there is air.')
    add('grindless.machine.combined_cycle_plant.tooltip.2', 'Runs in parallel = the fewest of 256, the fuel and water in the hatches, the room for the steam, and what the dynamo hatches carry (32 EU/t per run; an EV dynamo hatch carries 128 runs). No overclock. It pauses, losing nothing, while the dynamo hatches are full. A bigger steam hatch lets long-burning fuels run at full power.')
    add('grindless.machine.combined_cycle_plant.tooltip.3', 'Needs, in the turbine hall\'s floor: 1 or 2 dynamo hatches, 1 or 2 fluid input hatches (fuel and distilled water) and 1 fluid output hatch (the steam). No rotor.')

    add('grindless.machine.hot_strip_mill.tooltip.0', 'Hot ingots straight from the blast furnace into plates, rods or foil, without the vacuum freezer and the bender: the water that quenches them comes out as steam. Ingots that need liquid helium (5,000 K and up) still go to the vacuum freezer.')
    add('grindless.machine.hot_strip_mill.tooltip.1', 'Programmed circuit: 1 plate, 2 rods, 3 foil, at the bender\'s and extruder\'s ratios. Energy: the freezer\'s and the bender\'s (or extruder\'s) together, no discount.')
    add('grindless.machine.hot_strip_mill.tooltip.2', 'Steam per ingot grows with the blast temperature (2 mB per kelvin, 1 mB of water for every 160 mB of steam). If the steam has nowhere to go the mill stops, and it refuses to void fluids.')
    add('grindless.machine.hot_strip_mill.tooltip.3', 'Needs 1 input bus, 1 output bus, 1 fluid input hatch (water), 1 fluid output hatch (steam) and 1 or 2 energy hatches. ME buses and hatches fit.')

    add('grindless.steam_outputs.no_voiding', 'The steam must leave through its hatch: turn fluid voiding off')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.combined_cycle_plant', 'Planta de ciclo combinado')
    add('gtceu.combined_cycle', 'Ciclo combinado')
    add('block.gtceu.hot_strip_mill', 'Tren de laminación en caliente')
    add('gtceu.hot_rolling', 'Laminación en caliente')

    add('grindless.machine.combined_cycle_plant.tooltip.0', 'Una turbina de gas cuyo escape caliente hierve agua en una caldera de recuperación. Quema todos los combustibles de la turbina de gas con los mismos EU por mB que ella y convierte agua destilada en vapor que vale un 40 % más de energía en una turbina de vapor (más con un buen rotor en una turbina de vapor grande).')
    add('grindless.machine.combined_cycle_plant.tooltip.1', 'El vapor necesita un destino: si su escotilla no tiene sitio, la planta se para, combustible incluido, y no acepta tirar fluidos. Un combustible solo arde aquí donde arde en una turbina de gas: los que necesitan aire, solo donde hay aire.')
    add('grindless.machine.combined_cycle_plant.tooltip.2', 'Ciclos en paralelo = el menor de 256, el combustible y el agua de las escotillas, el sitio para el vapor y lo que llevan las escotillas dinamo (32 EU/t por ciclo; una escotilla dinamo EV lleva 128 ciclos). Sin overclock. Se detiene, sin perder nada, mientras las escotillas dinamo están llenas. Una escotilla de vapor más grande deja que los combustibles de combustión larga vayan a plena potencia.')
    add('grindless.machine.combined_cycle_plant.tooltip.3', 'Necesita, en el suelo de la nave de la turbina: 1 o 2 escotillas dinamo, 1 o 2 escotillas de entrada de fluidos (combustible y agua destilada) y 1 escotilla de salida de fluidos (el vapor). Sin rotor.')

    add('grindless.machine.hot_strip_mill.tooltip.0', 'Lingotes calientes directos del alto horno eléctrico a placas, varillas o lámina fina, sin el congelador al vacío ni la dobladora: el agua que los enfría sale como vapor. Los lingotes que piden helio líquido (5000 K o más) siguen yendo al congelador al vacío.')
    add('grindless.machine.hot_strip_mill.tooltip.1', 'Circuito programado: 1 placa, 2 varillas, 3 lámina fina, en las proporciones de la dobladora y la extrusora. Energía: la del congelador y la de la dobladora (o la extrusora) juntas, sin descuento.')
    add('grindless.machine.hot_strip_mill.tooltip.2', 'El vapor por lingote crece con la temperatura del alto horno (2 mB por kelvin, 1 mB de agua por cada 160 mB de vapor). Si el vapor no tiene adónde ir, el tren se para, y no acepta tirar fluidos.')
    add('grindless.machine.hot_strip_mill.tooltip.3', 'Necesita 1 bus de entrada, 1 bus de salida, 1 escotilla de entrada de fluidos (agua), 1 escotilla de salida de fluidos (vapor) y 1 o 2 escotillas de energía. Valen buses y escotillas ME.')

    add('grindless.steam_outputs.no_voiding', 'El vapor tiene que salir por su escotilla: desactiva el vaciado de fluidos')
})
