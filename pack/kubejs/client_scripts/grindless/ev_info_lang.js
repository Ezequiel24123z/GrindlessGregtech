// priority: 10550
// Gregtech Grindless - EMI information pages of the EV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the ev_*_lang.js files; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.atmosphere_processor.0', "The Atmosphere Processor works only on Mars. It filters the thin CO2 air, electrolyzes water and joins the hydrogen to the CO2 in a Sabatier reactor. Circuit 1: water into methane and oxygen. Circuit 2: carbon dioxide from the air.")
    add('emi.grindless.info.atmosphere_processor.1', "Oxygen goes to suits and methalox; methane to methalox, the fuel that carries its own oxygen, or home; CO2 feeds a sealed dome. Circuit 1 needs a ruthenium catalyst in the input bus. Use water from home: Mars ice is kept for IV.")

    add('emi.grindless.info.combined_cycle_plant.0', "The Combined-Cycle Plant is a gas turbine whose hot exhaust boils water: it burns the gas turbine fuels for the same EU as the gas turbine and turns distilled water into steam that a steam turbine turns into more energy.")
    add('emi.grindless.info.combined_cycle_plant.1', "The steam needs somewhere to go: if its hatch is full, the plant stops and refuses to void fluids. Its EU leaves through dynamo hatches. It has no rotor.")

    add('emi.grindless.info.cryogenic_plant.0', "The Cryogenic Plant liquefies gases on the Moon: oxygen into liquid oxygen, helium into liquid helium and nitrogen into liquid nitrogen, which GTM cannot make. It only works on the Moon.")
    add('emi.grindless.info.cryogenic_plant.1', "In the lunar night, with the radiators open to the sky, a run costs half the energy of the vacuum freezer. Liquid nitrogen cools the EV tripod drill; liquid oxygen and helium are kept for IV.")

    add('emi.grindless.info.deep_space_antenna.0', "The Deep Space Antenna is a dish on the Moon, far from Earth's radio noise, that listens to Mars and the deep sky. It writes charts onto data sticks and orbs: it is the only source of the Mars Transfer Chart, and later of the Inner Planets Chart and the Lunar VLBI Recording.")
    add('emi.grindless.info.deep_space_antenna.1', "It works only on the Moon, at night; if dawn comes mid-run it waits and keeps its progress. The chart before each one calibrates the dish and is never used up.")

    add('emi.grindless.info.ev_vein_drill.0', "The EV Tripod Drill is the vein drill of the Moon and Mars: it drills the lunar and Martian veins, each only in its own world, and never an Earth vein. Put the sample and titanium drill bits in the input bus.")
    add('emi.grindless.info.ev_vein_drill.1', "Liquid nitrogen in the input hatch gives more ore and less bit wear. It stands on sintered regolith bricks, and its solar wings pay part of the energy by day.")

    add('emi.grindless.info.extraction_cascade.0', "The Rare Earth Extraction Cascade takes the rare earths of Mars out of merrillite and splits them with mixer-settler stages. Circuit 1, leach: merrillite and hydrochloric acid into a rare earth chloride solution. Circuit 2, solvent extraction: the solution into samarium, neodymium and mixed rare earth chlorides.")
    add('emi.grindless.info.extraction_cascade.1', "Only this machine splits merrillite, so samarium only comes from Mars. The acids come back: distill the diluted acid and make hydrochloric acid with the chlorine. Circuit 5 is its ZPM mode for europium.")

    add('emi.grindless.info.hot_strip_mill.0', "The Hot Strip Mill rolls hot ingots straight from the blast furnace into plates, rods or foil, without the vacuum freezer and the bender. The water that quenches them comes out as steam. Programmed circuit: 1 plate, 2 rods, 3 foil.")
    add('emi.grindless.info.hot_strip_mill.1', "Ingots that need liquid helium still go to the vacuum freezer. If the steam has nowhere to go, the mill stops and refuses to void fluids.")

    add('emi.grindless.info.lunar_solar_array.0', "The Lunar Solar Array turns sunlight straight into EU with 36 solar panels: no mirrors, no boiler, no water. Put programmed circuit 1 in the input bus on the Moon or 2 on Mars.")
    add('emi.grindless.info.lunar_solar_array.1', "It works only by day, on the Moon or Mars; at night it waits and loses nothing. Each panel with open sky above it adds a run. Its EU leaves through dynamo hatches.")

    add('emi.grindless.info.ore_refinery.0', "The Ore Refinery takes a raw ore, what the drills deliver, through the whole ore line in one pass: macerator, ore washer, thermal centrifuge and macerator again, ending in dust with every byproduct of the four steps.")
    add('emi.grindless.info.ore_refinery.1', "One recipe per ore, with many copies at once. Each copy pays the energy of all four steps, so the energy hatches set how many run. Water comes in through the input hatch.")

    add('emi.grindless.info.platinum_plant.0', "The Platinum Plant is the platinum-group line of a dozen standalone machines in one, with its loops closed inside. Circuit 1 attacks pentlandite or chalcopyrite into platinum group sludge; circuit 2 separates the sludge into platinum, palladium and gold.")
    add('emi.grindless.info.platinum_plant.1', "Circuit 3 refines Mercury's iridosmine (IV) and circuit 4 the asteroid concentrate (LuV). Same ratios and energy as the standalone machines. A platinum electrode goes in the input bus; every output needs somewhere to go.")

    add('emi.grindless.info.regolith_cell.0', "The Regolith Cell is the chemistry of the Moon base and only works on the Moon. Circuit 1: lunar regolith heated until the solar wind comes out (hydrogen, helium, nitrogen, helium-3). Circuit 2: electrolysis into oxygen, silicon and iron, and ilmenite into titanium. Circuit 3: sintered regolith bricks.")
    add('emi.grindless.info.regolith_cell.1', "Electrolysis needs a platinum electrode in the input bus; titanium also needs a molten salt charge that is never used up. Each output hatch holds one gas, and if a bus or hatch fills up the cell stops.")

    add('emi.grindless.info.sealed_dome.0', "The Sealed Dome is a greenhouse sealed against the vacuum: it runs every Steam, LV, MV and HV Greenhouse recipe, many plants at once.")
    add('emi.grindless.info.sealed_dome.1', "Programmed circuit 5 (Moon) or 6 (Mars) works only there: every plant grows from water and carbon dioxide with triple output and oxygen back. On the Moon the CO2 comes from home; on Mars the dome breathes it from the air.")

    add('emi.grindless.info.ev_rtg.0', "The EV RTG is a radioisotope cell: put RTG pellets in its slot and it makes EV power for about an hour per pellet, with no fuel line and no sunlight.")
    add('emi.grindless.info.ev_rtg.1', "It works on every world, which makes it the steady power source for outposts such as Mercury's night.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.atmosphere_processor.0', "El procesador de atmósfera solo funciona en Marte. Filtra el aire fino de CO2, electroliza agua y une el hidrógeno al CO2 en un reactor Sabatier. Circuito 1: agua a metano y oxígeno. Circuito 2: dióxido de carbono del aire.")
    add('emi.grindless.info.atmosphere_processor.1', "El oxígeno va a los trajes y al metalox; el metano, al metalox, el combustible que lleva su propio oxígeno, o a casa; el CO2 alimenta una cúpula sellada. El circuito 1 necesita un catalizador de rutenio en el bus de entrada. Usa agua de casa: el hielo de Marte se reserva para IV.")

    add('emi.grindless.info.combined_cycle_plant.0', "La central de ciclo combinado es una turbina de gas cuyo escape caliente hierve agua: quema los combustibles de la turbina de gas con el mismo EU que ella y convierte agua destilada en vapor, que una turbina de vapor transforma en más energía.")
    add('emi.grindless.info.combined_cycle_plant.1', "El vapor necesita adónde ir: si su escotilla está llena, la central se detiene y se niega a eliminar fluidos. Su EU sale por escotillas dinamo. No lleva rotor.")

    add('emi.grindless.info.cryogenic_plant.0', "La planta criogénica licúa gases en la Luna: oxígeno en oxígeno líquido, helio en helio líquido y nitrógeno en nitrógeno líquido, que GTM no puede fabricar. Solo funciona en la Luna.")
    add('emi.grindless.info.cryogenic_plant.1', "En la noche lunar, con los radiadores abiertos al cielo, cada pasada cuesta la mitad de energía que el congelador de vacío. El nitrógeno líquido enfría la perforadora trípode EV; el oxígeno y el helio líquidos se reservan para IV.")

    add('emi.grindless.info.deep_space_antenna.0', "La antena de espacio profundo es un plato en la Luna, lejos del ruido de radio de la Tierra, que escucha Marte y el cielo profundo. Escribe cartas en memorias y orbes de datos: es la única fuente de la Carta de Transferencia a Marte, y después de la Carta de Planetas Interiores y la Grabación VLBI Lunar.")
    add('emi.grindless.info.deep_space_antenna.1', "Solo funciona en la Luna, de noche; si amanece a mitad de pasada espera y conserva su progreso. La carta anterior de cada una calibra el plato y nunca se gasta.")

    add('emi.grindless.info.ev_vein_drill.0', "La perforadora trípode EV es la perforadora de vetas de la Luna y Marte: perfora las vetas lunares y marcianas, cada una solo en su mundo, y nunca una veta de la Tierra. Pon la muestra y brocas de titanio en el bus de entrada.")
    add('emi.grindless.info.ev_vein_drill.1', "El nitrógeno líquido en la escotilla de entrada da más mena y menos desgaste de broca. Se apoya en ladrillos de regolito sinterizado, y sus alas solares pagan parte de la energía de día.")

    add('emi.grindless.info.extraction_cascade.0', "La cascada de extracción de tierras raras saca las tierras raras de Marte de la merrillita y las separa con etapas de mezclador-sedimentador. Circuito 1, lixiviación: merrillita y ácido clorhídrico dan una solución de cloruros de tierras raras. Circuito 2, extracción con disolvente: la solución da cloruros de samario, neodimio y tierras raras mezcladas.")
    add('emi.grindless.info.extraction_cascade.1', "Solo esta máquina separa la merrillita, así que el samario solo viene de Marte. Los ácidos vuelven: destila el ácido diluido y haz ácido clorhídrico con el cloro. El circuito 5 es su modo ZPM para el europio.")

    add('emi.grindless.info.hot_strip_mill.0', "El tren de laminación en caliente lamina lingotes calientes directamente desde el alto horno hasta placas, varillas o láminas, sin congelador de vacío ni dobladora. El agua que los templa sale como vapor. Circuito programado: 1 placa, 2 varillas, 3 lámina.")
    add('emi.grindless.info.hot_strip_mill.1', "Los lingotes que piden helio líquido siguen yendo al congelador de vacío. Si el vapor no tiene adónde ir, el tren se detiene y se niega a eliminar fluidos.")

    add('emi.grindless.info.lunar_solar_array.0', "El campo solar lunar convierte la luz del sol directamente en EU con 36 paneles solares: sin espejos, sin caldera y sin agua. Pon el circuito programado 1 en el bus de entrada en la Luna o el 2 en Marte.")
    add('emi.grindless.info.lunar_solar_array.1', "Solo funciona de día, en la Luna o en Marte; de noche espera sin perder nada. Cada panel con cielo abierto encima suma una pasada. Su EU sale por escotillas dinamo.")

    add('emi.grindless.info.ore_refinery.0', "La refinería de menas lleva una mena en bruto, lo que entregan las perforadoras, por toda la línea de menas de una pasada: macerador, lavador de menas, centrifugadora térmica y macerador otra vez, hasta el polvo con todos los subproductos de los cuatro pasos.")
    add('emi.grindless.info.ore_refinery.1', "Una receta por mena, con muchas copias a la vez. Cada copia paga la energía de los cuatro pasos, así que las escotillas de energía fijan cuántas corren. El agua entra por la escotilla de entrada.")

    add('emi.grindless.info.platinum_plant.0', "La planta de platino es la línea del grupo del platino de una docena de máquinas sueltas en una, con sus ciclos cerrados por dentro. El circuito 1 ataca pentlandita o calcopirita y da lodo del grupo del platino; el circuito 2 separa el lodo en platino, paladio y oro.")
    add('emi.grindless.info.platinum_plant.1', "El circuito 3 refina la iridosmina de Mercurio (IV) y el 4 el concentrado de asteroide (LuV). Mismas proporciones y energía que las máquinas sueltas. Un electrodo de platino va en el bus de entrada; toda salida necesita adónde ir.")

    add('emi.grindless.info.regolith_cell.0', "La celda de regolito es la química de la base lunar y solo funciona en la Luna. Circuito 1: regolito lunar calentado hasta que sale el viento solar (hidrógeno, helio, nitrógeno, helio-3). Circuito 2: electrólisis a oxígeno, silicio y hierro, e ilmenita a titanio. Circuito 3: ladrillos de regolito sinterizado.")
    add('emi.grindless.info.regolith_cell.1', "La electrólisis necesita un electrodo de platino en el bus de entrada; el titanio pide además una carga de sal fundida que nunca se gasta. Cada escotilla de salida guarda un solo gas, y si un bus o una escotilla se llena la celda se detiene.")

    add('emi.grindless.info.sealed_dome.0', "La cúpula sellada es un invernadero sellado contra el vacío: ejecuta todas las recetas de los invernaderos de vapor, LV, MV y HV, con muchas plantas a la vez.")
    add('emi.grindless.info.sealed_dome.1', "El circuito programado 5 (Luna) o 6 (Marte) solo funciona allí: cada planta crece con agua y dióxido de carbono, con triple producción y oxígeno de vuelta. En la Luna el CO2 viene de casa; en Marte la cúpula lo respira del aire.")

    add('emi.grindless.info.ev_rtg.0', "El RTG EV es una celda de radioisótopos: pon pastillas RTG en su ranura y da energía EV durante cerca de una hora por pastilla, sin línea de combustible ni luz solar.")
    add('emi.grindless.info.ev_rtg.1', "Funciona en todos los mundos, lo que lo hace la fuente de energía constante para puestos como la noche de Mercurio.")
})
