// priority: 7500
// LuV B7 names: the flux-tube tether and its fallback, the sulfur-iodine plant (startup_scripts/grindless/luv/io_orbit.js). Only one of
// the two is registered (tables/stations.json); the other's keys are unused.
ClientEvents.lang('en_us', function (event) {
  function add(k, v) { event.add('grindless', k, v) }
  add('block.gtceu.flux_tube_tether', 'Flux-Tube Tether')
  add('block.gtceu.sulfur_iodine_plant', 'Sulfur-Iodine Plant')
  add('gtceu.electrodynamic_tether', 'Electrodynamic Tether')
  add('gtceu.thermochemical_hydrogen', 'Thermochemical Hydrogen')
  add('grindless.machine.flux_tube_tether.tooltip.0', '§7Draws power from Jupiter\'s spin with a tether at Io.')
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
  add('grindless.machine.flux_tube_tether.tooltip.0', '§7Obtiene energía del giro de Júpiter con un cable en Ío.')
  add('grindless.machine.flux_tube_tether.off_orbit', 'Fuera de la órbita de Ío: no hay toro de plasma con el que trabajar')
  add('grindless.machine.sulfur_iodine_plant.tooltip.0', 'Hidrógeno con el calor de Ío, sin electrólisis: el ciclo azufre-yodo descompone el agua sobre el magma de la pátera, y el azufre y el yodo dan vueltas. Solo en Ío.')
  add('grindless.machine.sulfur_iodine_plant.tooltip.1', 'Circuito 1: 1000 mB de agua sobre una carga de 2000 mB de ácido sulfúrico y 8 de polvo de yodo (ambos se conservan) -> 2000 mB de hidrógeno + 1000 mB de oxígeno, 30 EU/t durante 20 s, un paralelo por módulo descomponedor completo (hasta 4: 20 mB de hidrógeno por tick).')
  add('grindless.machine.sulfur_iodine_plant.tooltip.2', 'Guarda todo lo que produce: no funciona si está puesta a tirar. Sin overclock: el calor marca el ritmo.')
  add('grindless.machine.sulfur_iodine_plant.tooltip.3', '11x14x5: 5x5 bloques de magma bajo una placa caliente de hogares de acero de tungsteno; una sala de bóveda (1-2 escotillas de energía, 1-2 buses de entrada, 1-3 escotillas de entrada y de salida); un reactor Bunsen de 3x3x3 de carcasa inerte de PTFE bajo una columna de HI de 3x3x6 (con núcleo de carcasa de tubería de PTFE); módulos descomponedores de 3x3x3 de carcasa robusta de acero de tungsteno a ambos lados, el primero obligatorio.')
  add('grindless.machine.sulfur_iodine_plant.no_voiding', 'La planta guarda lo que produce: desactiva el vaciado')
  add('grindless.machine.sulfur_iodine_plant.off_io', 'Aquí no hay calor volcánico: la planta solo funciona en Ío')
})
