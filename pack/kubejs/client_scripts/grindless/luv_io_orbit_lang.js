// priority: 7500
// LuV B7 names: the flux-tube tether and its fallback, the sulfur-iodine plant (startup_scripts/grindless/luv/io_orbit.js). Only one of
// the two is registered (tables/stations.json); the other's keys are unused.
ClientEvents.lang('en_us', function (event) {
  function add(k, v) { event.add('grindless', k, v) }
  add('block.gtceu.flux_tube_tether', 'Flux-Tube Tether')
  add('block.gtceu.sulfur_iodine_plant', 'Sulfur-Iodine Plant')
  add('gtceu.electrodynamic_tether', 'Electrodynamic Tether')
  add('gtceu.thermochemical_hydrogen', 'Thermochemical Hydrogen')
  add('grindless.machine.flux_tube_tether.tooltip.0', 'Jupiter\'s spin as power: a bare tether paid out from a station into Io\'s plasma torus, which sweeps past it at about 57 km/s and drives a current through it. It burns nothing. Only in Io orbit.')
  add('grindless.machine.flux_tube_tether.tooltip.1', 'Each 20 s run needs circuit 1, 50 mB of argon (the hollow cathode, 25 mB per reel) and two tether spools in the bus, and makes 65,536 EU/t per reel cell: 131,072 EU/t with both. A spool wears out about once an hour.')
  add('grindless.machine.flux_tube_tether.tooltip.2', 'Its EU leaves through 1-4 dynamo hatches, or a LuV wireless dynamo hatch into the network; both reels need 131,072 EU/t of room (a 4 A LuV hatch).')
  add('grindless.machine.flux_tube_tether.tooltip.3', '5x15x5: a 5x5x5 deployer with station truss casing edges and radiation vault casing faces (1-4 dynamo hatches, 1 input bus), two reels of three tungstensteel gearboxes inside, an input hatch (the hollow-cathode port) on the roof beside the tether, and a tether of aluminium frames from the roof\'s centre 10 blocks up.')
  add('grindless.machine.flux_tube_tether.off_orbit', 'Not in Io orbit: no plasma torus to work in')
  add('grindless.machine.sulfur_iodine_plant.tooltip.0', 'Hydrogen from Io\'s heat, with no electrolysis: the sulfur-iodine cycle splits water over the patera\'s magma, and the sulfur and the iodine go round. Only on Io.')
  add('grindless.machine.sulfur_iodine_plant.tooltip.1', 'Circuit 1: 1,000 mB of water over a 2,000 mB sulfuric acid charge and 8 iodine dust (both kept) -> 2,000 mB of hydrogen + 1,000 mB of oxygen, 30 EU/t for 20 s, one parallel per complete decomposer module (up to 4: 20 mB of hydrogen a tick).')
  add('grindless.machine.sulfur_iodine_plant.tooltip.2', 'It keeps everything it makes: it refuses to run while set to void. No overclock: the heat sets the pace.')
  add('grindless.machine.sulfur_iodine_plant.tooltip.3', '11x14x5: a 5x5 of magma under a tungstensteel firebox hot plate; a vault room (1-2 energy hatches, 1-2 input buses, 1-3 input and output hatches); a 3x3x3 Bunsen reactor of PTFE inert casing under a 3x3x6 HI column (a PTFE pipe casing core); 3x3x3 decomposer modules of robust tungstensteel casing on both sides, the first one required.')
  add('grindless.machine.sulfur_iodine_plant.no_voiding', 'The plant keeps what it makes: switch voiding off')
  add('grindless.machine.sulfur_iodine_plant.off_io', 'No volcanic heat here: the plant only works on Io')
})
ClientEvents.lang('es_es', function (event) {
  function add(k, v) { event.add('grindless', k, v) }
  add('block.gtceu.flux_tube_tether', 'Cable del tubo de flujo')
  add('block.gtceu.sulfur_iodine_plant', 'Planta de azufre-yodo')
  add('gtceu.electrodynamic_tether', 'Cable electrodinámico')
  add('gtceu.thermochemical_hydrogen', 'Hidrógeno termoquímico')
  add('grindless.machine.flux_tube_tether.tooltip.0', 'El giro de Júpiter como energía: un cable desnudo desplegado desde una estación en el toro de plasma de Ío, que lo barre a unos 57 km/s y hace pasar una corriente por él. No quema nada. Solo en la órbita de Ío.')
  add('grindless.machine.flux_tube_tether.tooltip.1', 'Cada ciclo de 20 s necesita el circuito 1, 50 mB de argón (el cátodo hueco, 25 mB por carrete) y dos carretes de cable en el bus, y da 65 536 EU/t por celda de carrete: 131 072 EU/t con las dos. Un carrete se gasta más o menos una vez por hora.')
  add('grindless.machine.flux_tube_tether.tooltip.2', 'Su energía sale por 1-4 escotillas dínamo, o por una escotilla dínamo inalámbrica LuV hacia la red; los dos carretes necesitan sitio para 131 072 EU/t (una escotilla LuV de 4 A).')
  add('grindless.machine.flux_tube_tether.tooltip.3', '5x15x5: un desplegador de 5x5x5 con aristas de carcasa de armazón de estación y caras de carcasa de bóveda antirradiación (1-4 escotillas dínamo, 1 bus de entrada), dos carretes de tres cajas de engranajes de acero de tungsteno dentro, una escotilla de entrada (el puerto del cátodo hueco) en el techo junto al cable, y un cable de marcos de aluminio desde el centro del techo 10 bloques hacia arriba.')
  add('grindless.machine.flux_tube_tether.off_orbit', 'Fuera de la órbita de Ío: no hay toro de plasma con el que trabajar')
  add('grindless.machine.sulfur_iodine_plant.tooltip.0', 'Hidrógeno con el calor de Ío, sin electrólisis: el ciclo azufre-yodo descompone el agua sobre el magma de la pátera, y el azufre y el yodo dan vueltas. Solo en Ío.')
  add('grindless.machine.sulfur_iodine_plant.tooltip.1', 'Circuito 1: 1000 mB de agua sobre una carga de 2000 mB de ácido sulfúrico y 8 de polvo de yodo (ambos se conservan) -> 2000 mB de hidrógeno + 1000 mB de oxígeno, 30 EU/t durante 20 s, un paralelo por módulo descomponedor completo (hasta 4: 20 mB de hidrógeno por tick).')
  add('grindless.machine.sulfur_iodine_plant.tooltip.2', 'Guarda todo lo que produce: no funciona si está puesta a tirar. Sin overclock: el calor marca el ritmo.')
  add('grindless.machine.sulfur_iodine_plant.tooltip.3', '11x14x5: 5x5 bloques de magma bajo una placa caliente de hogares de acero de tungsteno; una sala de bóveda (1-2 escotillas de energía, 1-2 buses de entrada, 1-3 escotillas de entrada y de salida); un reactor Bunsen de 3x3x3 de carcasa inerte de PTFE bajo una columna de HI de 3x3x6 (con núcleo de carcasa de tubería de PTFE); módulos descomponedores de 3x3x3 de carcasa robusta de acero de tungsteno a ambos lados, el primero obligatorio.')
  add('grindless.machine.sulfur_iodine_plant.no_voiding', 'La planta guarda lo que produce: desactiva el vaciado')
  add('grindless.machine.sulfur_iodine_plant.off_io', 'Aquí no hay calor volcánico: la planta solo funciona en Ío')
})
