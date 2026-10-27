// priority: 8400
// Gregtech Grindless - names and tooltips of IV on Venus (startup_scripts/grindless/iv/venus.js): the Pressurized Vein Drill, the Venus
// Heat Engine and the Venus Acid Works, their recipe types, and the controller lines (off site, and why the acid works refuses voiding).
//
//   gtceu:pressurized_vein_drill                                  (machine name + tooltips)
//   gtceu:venus_heat_engine / gtceu:venus_heat                    (machine name + tooltips, recipe type name)
//   gtceu:venus_acid_works / gtceu:acid_cracking                  (machine name + tooltips, recipe type name)
//   grindless.machine.pressurized_vein_drill.off_site, grindless.machine.venus_heat_engine.not_venus,
//   grindless.machine.venus_acid_works.not_venus / .no_voiding    (controller lines)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.pressurized_vein_drill', 'Pressurized Vein Drill')
    add('block.gtceu.venus_heat_engine', 'Venus Heat Engine')
    add('gtceu.venus_heat', 'Venus Heat')
    add('block.gtceu.venus_acid_works', 'Venus Acid Works')
    add('gtceu.acid_cracking', 'Acid Cracking')

    add('grindless.machine.pressurized_vein_drill.tooltip.0', 'The IV step of the vein drill family, for Venus and Mars: a closed shaft against 92 bar, jacketed in tungstensteel, under a pressure housing of inert casing and a deck of dust filters. Up to 128 runs at once, one Tungstensteel drill bit per run in the input bus (0.25% wear a run).')
    add('grindless.machine.pressurized_vein_drill.tooltip.1', 'Venus: the naquadah vein, deep under the lava seas. Each run: the vein sample (never used up) + 200 mB of distilled water, the heat tax -> 5.625 raw ores, Venus cobblestone and 1,600 mB of steam. The steam is inert: send it to a turbine through an output hatch, or set the controller to void fluids.')
    add('grindless.machine.pressurized_vein_drill.tooltip.2', 'Mars: its three veins, dry, because the dust filters keep the bit clean. Each run: the vein sample + the bit -> 5.625 raw ores and Martian cobblestone. It drills nothing anywhere else.')
    add('grindless.machine.pressurized_vein_drill.tooltip.3', '5x9x4: a 5x4 pad of Venusian regolith on solid ground round a tungstensteel pipe drill string, a 3x3x3 housing of inert casing, a 3x3 deck of filter casings and a tungsten steel frame on top of the string. Housing: 1-2 energy hatches, 1 input bus, 1-2 output buses, up to 1 input hatch and up to 1 output hatch. ME parts fit.')

    add('grindless.machine.venus_heat_engine.tooltip.0', 'Venus\'s own power: a hot plate on the 737 K ground and a radiator chimney rising towards the clouds, the cold side. Works only on Venus, and all the time: Venus is always at noon. It burns nothing.')
    add('grindless.machine.venus_heat_engine.tooltip.1', 'Each 20 s cycle: 200 mB of distilled water (the makeup of its working fluid) -> 8,192 EU/t and 32,000 mB of steam. Send the steam to a turbine through an output hatch, or set the controller to void fluids.')
    add('grindless.machine.venus_heat_engine.tooltip.2', 'Its EU leaves through dynamo hatches: one IV dynamo hatch, or two EV ones, carries it all. The Venus Acid Works makes its water from the clouds.')
    add('grindless.machine.venus_heat_engine.tooltip.3', '5x16x5: a 5x5 footing of Venusian regolith on solid ground; an engine house of robust tungstensteel casing round a 3x3 hot plate of tungstensteel fireboxes with a tungstensteel gearbox above it; a roof, and an 11-block tungstensteel pipe riser with four night-sky radiators on every block. House walls: 1-2 dynamo hatches, 1 input hatch, up to 1 output hatch.')

    add('grindless.machine.venus_acid_works.tooltip.0', 'Water and oxygen from Venus\'s clouds: their sulfuric acid is cracked over a platinum gauze, and the planet\'s 737 K does the dehydration. Works only on Venus. The programmed circuit is the mode.')
    add('grindless.machine.venus_acid_works.tooltip.1', 'Each run: 1,000 mB of sulfuric acid, and the platinum gauze wears 0.1% -> 1,000 mB of distilled water + 1,000 mB of oxygen, for the energy of splitting that much water (45,000 EU). Circuit 1 returns the 1,000 mB of sulfur dioxide to Venus\'s air.')
    add('grindless.machine.venus_acid_works.tooltip.2', 'Circuit 2 keeps the sulfur dioxide (1,000 mB a run) for chemistry at home, where a chemical reactor turns it back into sulfur trioxide and sulfuric acid, and then refuses to void fluids. Each gas needs its own output hatch, or one ME output hatch takes them all.')
    add('grindless.machine.venus_acid_works.tooltip.3', '8x11x5: a 5x5 plate of Venusian regolith on solid ground with an edge of inert casing; a 3x3x6 bayonet decomposer of titanium pipe casing round a PTFE pipe core; a desk with the controller; a 3x3x10 condenser stack of inert casing round a PTFE core, with eight heat vents, joined by a PTFE duct. Plate edge: 1-2 energy hatches, 1 input bus, 1 input hatch, 1-3 output hatches. ME parts fit.')

    add('grindless.machine.pressurized_vein_drill.off_site', 'No vein to drill here: the drill works on Venus and on Mars')
    add('grindless.machine.venus_heat_engine.not_venus', 'No heat here: the engine only works on Venus')
    add('grindless.machine.venus_acid_works.not_venus', 'No clouds here: the acid works only works on Venus')
    add('grindless.machine.venus_acid_works.no_voiding', 'Circuit 2 keeps the sulfur dioxide: turn fluid voiding off, or use circuit 1, which returns it to Venus\'s air')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.pressurized_vein_drill', 'Perforadora de vetas presurizada')
    add('block.gtceu.venus_heat_engine', 'Motor térmico de Venus')
    add('gtceu.venus_heat', 'Calor de Venus')
    add('block.gtceu.venus_acid_works', 'Planta de ácido de Venus')
    add('gtceu.acid_cracking', 'Craqueo de ácido')

    add('grindless.machine.pressurized_vein_drill.tooltip.0', 'El paso IV de la familia de perforadoras de vetas, para Venus y Marte: un pozo cerrado contra 92 bar, con camisa de acero de tungsteno, bajo una carcasa de presión de carcasa inerte y una plataforma de filtros de polvo. Hasta 128 pasadas a la vez, una broca de acero de tungsteno por pasada en el bus de entrada (un 0,25 % de desgaste por pasada).')
    add('grindless.machine.pressurized_vein_drill.tooltip.1', 'Venus: la veta de naquadah, muy honda bajo los mares de lava. Cada pasada: la muestra de la veta (no se gasta) + 200 mB de agua destilada, el impuesto del calor -> 5,625 menas en bruto, adoquín de Venus y 1600 mB de vapor. El vapor es inerte: mándalo a una turbina por una escotilla de salida, o pon el controlador a tirar fluidos.')
    add('grindless.machine.pressurized_vein_drill.tooltip.2', 'Marte: sus tres vetas, en seco, porque los filtros de polvo mantienen limpia la broca. Cada pasada: la muestra de la veta + la broca -> 5,625 menas en bruto y adoquín marciano. En ningún otro sitio perfora nada.')
    add('grindless.machine.pressurized_vein_drill.tooltip.3', '5x9x4: una base de 5x4 de regolito venusiano sobre suelo firme alrededor de una sarta de carcasa de tubería de acero de tungsteno, una carcasa de 3x3x3 de carcasa inerte, una plataforma de 3x3 de carcasas de filtro y un armazón de acero de tungsteno sobre la sarta. Carcasa: 1-2 escotillas de energía, 1 bus de entrada, 1-2 buses de salida, hasta 1 escotilla de entrada y hasta 1 de salida. Valen las piezas ME.')

    add('grindless.machine.venus_heat_engine.tooltip.0', 'La energía propia de Venus: una placa caliente sobre el suelo a 737 K y una chimenea de radiadores que sube hacia las nubes, el lado frío. Solo funciona en Venus, y a todas horas: en Venus siempre es mediodía. No quema nada.')
    add('grindless.machine.venus_heat_engine.tooltip.1', 'Cada ciclo de 20 s: 200 mB de agua destilada (la reposición de su fluido de trabajo) -> 8192 EU/t y 32 000 mB de vapor. Manda el vapor a una turbina por una escotilla de salida, o pon el controlador a tirar fluidos.')
    add('grindless.machine.venus_heat_engine.tooltip.2', 'Su energía sale por escotillas dínamo: una escotilla dínamo IV, o dos EV, la llevan toda. La planta de ácido de Venus saca su agua de las nubes.')
    add('grindless.machine.venus_heat_engine.tooltip.3', '5x16x5: una zapata de 5x5 de regolito venusiano sobre suelo firme; una casa del motor de carcasa robusta de acero de tungsteno alrededor de una placa caliente de 3x3 de hogares de acero de tungsteno con una caja de engranajes de acero de tungsteno encima; un tejado, y un tubo ascendente de 11 bloques de carcasa de tubería de acero de tungsteno con cuatro radiadores de cielo nocturno en cada bloque. Paredes: 1-2 escotillas dínamo, 1 escotilla de entrada, hasta 1 de salida.')

    add('grindless.machine.venus_acid_works.tooltip.0', 'Agua y oxígeno de las nubes de Venus: su ácido sulfúrico se craquea sobre una malla de platino, y los 737 K del planeta hacen la deshidratación. Solo funciona en Venus. El circuito programado es el modo.')
    add('grindless.machine.venus_acid_works.tooltip.1', 'Cada pasada: 1000 mB de ácido sulfúrico, y la malla de platino se desgasta un 0,1 % -> 1000 mB de agua destilada + 1000 mB de oxígeno, por la energía de partir esa misma agua (45 000 EU). El circuito 1 devuelve los 1000 mB de dióxido de azufre al aire de Venus.')
    add('grindless.machine.venus_acid_works.tooltip.2', 'El circuito 2 guarda el dióxido de azufre (1000 mB por pasada) para la química de casa, donde un reactor químico lo vuelve a convertir en trióxido de azufre y ácido sulfúrico, y entonces no acepta tirar fluidos. Cada gas necesita su propia escotilla de salida, o una escotilla de salida ME los recoge todos.')
    add('grindless.machine.venus_acid_works.tooltip.3', '8x11x5: una placa de 5x5 de regolito venusiano sobre suelo firme con un borde de carcasa inerte; un descomponedor de bayoneta de 3x3x6 de carcasa de tubería de titanio alrededor de un núcleo de tubería de PTFE; un pupitre con el controlador; una columna de condensación de 3x3x10 de carcasa inerte alrededor de un núcleo de PTFE, con ocho rejillas de calor, unida por un conducto de PTFE. Borde de la placa: 1-2 escotillas de energía, 1 bus de entrada, 1 escotilla de entrada, 1-3 escotillas de salida. Valen las piezas ME.')

    add('grindless.machine.pressurized_vein_drill.off_site', 'Aquí no hay veta que perforar: la perforadora funciona en Venus y en Marte')
    add('grindless.machine.venus_heat_engine.not_venus', 'Aquí no hay calor: el motor solo funciona en Venus')
    add('grindless.machine.venus_acid_works.not_venus', 'Aquí no hay nubes: la planta de ácido solo funciona en Venus')
    add('grindless.machine.venus_acid_works.no_voiding', 'El circuito 2 guarda el dióxido de azufre: desactiva el vaciado de fluidos, o usa el circuito 1, que lo devuelve al aire de Venus')
})
