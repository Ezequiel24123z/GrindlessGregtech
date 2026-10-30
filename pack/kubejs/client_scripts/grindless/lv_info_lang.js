// priority: 6775
// Gregtech Grindless - EMI information pages of the LV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in lv_multis_lang.js, lv_mega_wire_works_lang.js and wireless_energy_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.heliostat_tower.0', "The Heliostat Tower boils water with sunlight and no fuel: a field of mirrors focuses the sun on a receiver at the top. Water in, steam out, as much as a Large Bronze Boiler at full fire.")
    add('emi.grindless.info.heliostat_tower.1', "It works only by day, with open sky over the tower and the mirrors and no rain. Store the day's steam in a multiblock tank for the night. The mirror drives use a little EU, so it needs an energy hatch.")
    add('emi.grindless.info.heliostat_tower.2', 'A field of 28 mirrors focuses sunlight on the receiver at the top of the tower and boils water with no fuel: 800 mB of steam per tick, a Large Bronze Boiler at full fire.')
    add('emi.grindless.info.heliostat_tower.3', 'Works only by day, with open sky over the tower and its mirrors and no rain falling on it (a desert never stops it). Store the day\'s steam in a multiblock tank for the night.')
    add('emi.grindless.info.heliostat_tower.4', 'The mirror drives draw 16 EU/t. Takes water, or the distilled water the steam turbines give back.')
    add('emi.grindless.info.heliostat_tower.5', 'Needs 1 energy hatch, 1 input hatch and 1 output hatch. Pipe the steam out all the time: an LV output hatch holds two runs.')

    add('emi.grindless.info.lv_greenhouse.0', "The LV Greenhouse grows trees, rubber trees, crops, mushrooms, berries, vines and flowers: put the plant in the input bus and the harvest comes out. The plant is never used up.")
    add('emi.grindless.info.lv_greenhouse.1', "Water in the fluid hatch unlocks the extra plants. Programmed circuit 2 plus fertilizer gives double output in half the time.")
    add('emi.grindless.info.lv_greenhouse.2', 'Grows trees, rubber trees, crops, mushrooms, berries, vines and flowers with a plant that is never used up.')
    add('emi.grindless.info.lv_greenhouse.3', 'Runs as many crops at once as its energy hatches allow (voltage / 4 EU/t, up to 8). Water in the fluid hatch unlocks the extra plants.')
    add('emi.grindless.info.lv_greenhouse.4', 'Programmed circuit 2 + fertilizer in the input bus (and water): double output in half the time. Circuit 1 or none: base recipes.')
    add('emi.grindless.info.lv_greenhouse.5', 'Needs 1 or 2 energy hatches, 1 input bus, 1 or 2 output buses and 1 input hatch.')

    add('emi.grindless.info.lv_vein_drill.0', "The LV Vein Drill drills the vein marked by the vein sample, over and over: sample and drill bits in the input bus, raw ore out. It runs every Steam Vein Drill recipe and adds more.")
    add('emi.grindless.info.lv_vein_drill.1', "Its energy hatches set how many bores run at once. Drilling fluid in the fluid hatch gives more ore and less bit wear; Nether veins only drill with it.")
    add('emi.grindless.info.lv_vein_drill.2', 'Drills the vein marked by the vein sample, over and over. It runs every Steam Vein Drill recipe and adds more.')
    add('emi.grindless.info.lv_vein_drill.3', 'Runs as many bores at once as its energy hatches allow (voltage / 8 EU/t, up to 8): 4 with one LV hatch, 8 with two.')
    add('emi.grindless.info.lv_vein_drill.4', 'Drilling fluid in the fluid hatch: +50% ore and half the drill bit wear. Nether veins only drill with it.')
    add('emi.grindless.info.lv_vein_drill.5', 'Needs 1 or 2 energy hatches, 1 input bus, 2 output buses and 1 input hatch.')

    add('emi.grindless.info.submerged_arc_furnace.0', "The Submerged Arc Furnace reduces and melts in an electric arc, which no small machine can: silicon and sky dust for AE2, and obsidian from cobblestone and water.")
    add('emi.grindless.info.submerged_arc_furnace.1', "It needs a graphite electrode in the input bus; the electrode wears out by chance. Carbon dioxide comes out of the fluid output hatch: vent it by setting the controller to void fluids.")
    add('emi.grindless.info.submerged_arc_furnace.2', 'Reduces and melts in an electric arc: silicon and sky dust for AE2, and obsidian from cobblestone and water. No small machine can.')
    add('emi.grindless.info.submerged_arc_furnace.3', 'Draws 2 A at LV (64 EU/t) from its two energy hatches and needs a graphite electrode in the input bus (it wears out by chance, about 3% of the runs).')
    add('emi.grindless.info.submerged_arc_furnace.4', 'The muffler hatch needs free space in front of it. Carbon dioxide comes out of the fluid output hatch: set the controller to void fluids to vent it. The water for the obsidian goes in the input hatch.')
    add('emi.grindless.info.submerged_arc_furnace.5', 'Needs 2 energy hatches, 1 input bus, 1 input hatch, 1 output bus, 1 output hatch and 1 muffler hatch.')

    add('emi.grindless.info.sulfide_roaster.0', "The Sulfide Roaster roasts sulfide ores with air and turns their sulfur dioxide into sulfuric acid in the same run: ore, air and water in; acid, steam and the metal out. Galena gives silver, and plain sulfur burns into acid.")
    add('emi.grindless.info.sulfide_roaster.1', "It replaces a blast furnace fed with oxygen and two chemical reactors. A vanadium contact catalyst in the input bus wears out by chance.")
    add('emi.grindless.info.sulfide_roaster.2', 'Roasts sulfide ores with air instead of oxygen and turns their sulfur dioxide into sulfuric acid in the same run. In GTM that takes an EBF fed with oxygen and two chemical reactors.')
    add('emi.grindless.info.sulfide_roaster.3', 'Draws 4 A at LV (120 EU/t) from its two energy hatches. A Vanadium Contact Catalyst in the input bus wears out by chance (about 2% of the runs).')
    add('emi.grindless.info.sulfide_roaster.4', 'Air and water go into the input hatches; the acid and the steam of its waste-heat boiler come out of the output hatches. Galena gives silver, and plain sulfur burns into acid.')
    add('emi.grindless.info.sulfide_roaster.5', 'Needs 2 energy hatches, 1 input bus, 2 input hatches, 1 output bus and 2 output hatches.')

    add('emi.grindless.info.wire_works.0', "The Wire Works runs the wiremill and the bender in one hall, several recipes at a time. Choose the machine in the controller's machine mode tab: one mode runs at a time, with the single blocks' own recipes.")
    add('emi.grindless.info.wire_works.1', "It saves machines and buses, not power: each copy pays its full energy, so the energy hatches set how many run.")
    add('emi.grindless.info.wire_works.2', 'A steel hall that runs the wiremill and the bender: up to 8 recipes at once. Choose the machine in the controller\'s machine mode tab: one mode runs at a time, with the single blocks\' own recipes.')
    add('emi.grindless.info.wire_works.3', 'Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t), up to 8. With LV hatches only cheap recipes reach 8; two hatches of one tier count as the next tier. Spare voltage overclocks, and batch mode is on. No speed or energy bonus: it saves machines and buses, not power.')
    add('emi.grindless.info.wire_works.4', 'Needs, in any casing cell: 1 maintenance hatch, 1 or 2 energy hatches, 1 to 4 input buses and 1 or 2 output buses; at least 64 steel solid casings, the rest of the walls. Four steel frames in the corners, an empty 3 x 3 x 2 hall inside.')

    add('emi.grindless.info.wireless_energy_tower.0', "The Wireless Energy Tower is the store of the wireless network. It has no recipes: its 32 slots take capacitor cells of any tier, and every formed tower adds what its cells hold to the network, which is shared by every world.")
    add('emi.grindless.info.wireless_energy_tower.1', "Wireless dynamo hatches and covers put EU in; wireless energy hatches and covers at or below the network's tier take it out. With no tower formed, nothing moves. Swapping a cell unforms the tower; the stored EU stays.")
    add('emi.grindless.info.wireless_energy_tower.2', 'The store of the wireless network: one network for every world. Each formed tower adds what its capacitor cells hold, and towers add up.')
    add('emi.grindless.info.wireless_energy_tower.3', 'Its 32 cell slots take capacitor cells of any tier, or its steel casing for an empty slot. The network sends EU out at the tier of the weakest cell of every formed tower: replace them all to raise it.')
    add('emi.grindless.info.wireless_energy_tower.4', 'Wireless dynamo hatches and covers put EU in (5% is lost on the way in); wireless energy hatches and covers at or below the network\'s tier take it out. With no tower formed, nothing moves.')
    add('emi.grindless.info.wireless_energy_tower.5', 'Swapping a cell unforms the tower; the stored EU stays in the network. No hatches: everything comes and goes wirelessly.')

    add('emi.grindless.info.wireless_energy_hatch.0', "The Wireless Energy Hatch is an energy input for multiblocks with no cable: the wireless network fills it, as long as the network's tier is at least the hatch's. It comes in every tier from LV to UIV, at 2 A (the plain one), 4 A, 16 A and 64 A.")
    add('emi.grindless.info.wireless_energy_hatch.1', "The network is one for every world, stored in Wireless Energy Towers; with no tower formed, nothing moves. Its chunk must be loaded. Shift + right-click with an empty hand reads the network's EU and flow.")

    add('emi.grindless.info.wireless_dynamo_hatch.0', "The Wireless Dynamo Hatch is the energy output of generator multiblocks with no cable: everything it gets goes into the wireless network, with 5% lost on the way in. It comes in every tier from LV to UIV, at 2 A (the plain one), 4 A, 16 A and 64 A.")
    add('emi.grindless.info.wireless_dynamo_hatch.1', "The 64 A ones go in any generator multiblock. The EU is stored in Wireless Energy Towers, and wireless energy hatches and covers take it out. With no tower formed, nothing moves.")

    add('emi.grindless.info.creature_simulator.0', "The Creature Simulator yields a creature's drops without a creature. Put the creature model (never used up), the creature's mineral and biomass in; the programmed circuit picks the drops, circuit 1 being all of them. Nobody gets hurt.")
    add('emi.grindless.info.creature_simulator.1', "It comes in LV, MV, HV and EV. A creature of a higher tier needs a simulator of that tier or better. Models are printed from a blank model in an assembler.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.heliostat_tower.0', "La torre de heliostatos hierve agua con luz solar y sin combustible: un campo de espejos enfoca el sol en un receptor en lo alto. Entra agua y sale vapor, como una caldera grande de bronce a pleno fuego.")
    add('emi.grindless.info.heliostat_tower.1', "Solo funciona de día, con cielo abierto sobre la torre y los espejos y sin lluvia. Guarda el vapor del día en un tanque multibloque para la noche. Los motores de los espejos gastan algo de EU, así que necesita una escotilla de energía.")
    add('emi.grindless.info.heliostat_tower.2', 'Un campo de 28 espejos concentra el sol en el receptor de lo alto de la torre y hierve agua sin combustible: 800 mB de vapor por tick, lo que una caldera grande de bronce a todo fuego.')
    add('emi.grindless.info.heliostat_tower.3', 'Solo funciona de día, con cielo abierto sobre la torre y sus espejos y sin lluvia encima (en un desierto nunca se para). Guarda el vapor del día en un tanque multibloque para la noche.')
    add('emi.grindless.info.heliostat_tower.4', 'Los motores de los espejos consumen 16 EU/t. Acepta agua, o el agua destilada que devuelven las turbinas de vapor.')
    add('emi.grindless.info.heliostat_tower.5', 'Necesita 1 escotilla de energía, 1 escotilla de entrada y 1 de salida. Saca el vapor todo el rato: en una escotilla de salida LV solo caben dos ciclos.')

    add('emi.grindless.info.lv_greenhouse.0', "El invernadero LV cultiva árboles, árboles de caucho, cultivos, setas, bayas, enredaderas y flores: pon la planta en el bus de entrada y sale la cosecha. La planta nunca se gasta.")
    add('emi.grindless.info.lv_greenhouse.1', "El agua en la escotilla de fluidos desbloquea las plantas extra. El circuito programado 2 con fertilizante da el doble de producción en la mitad de tiempo.")
    add('emi.grindless.info.lv_greenhouse.2', 'Cultiva árboles, árboles de caucho, cosechas, setas, bayas, enredaderas y flores con una planta que no se gasta.')
    add('emi.grindless.info.lv_greenhouse.3', 'Hace tantos cultivos a la vez como permitan sus escotillas de energía (voltaje / 4 EU/t, hasta 8). Con agua en la escotilla de fluidos se abren las plantas extra.')
    add('emi.grindless.info.lv_greenhouse.4', 'Circuito programado 2 + fertilizante en el bus de entrada (y agua): doble de producción en la mitad de tiempo. Circuito 1 o ninguno: recetas base.')
    add('emi.grindless.info.lv_greenhouse.5', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 o 2 buses de salida y 1 escotilla de entrada.')

    add('emi.grindless.info.lv_vein_drill.0', "La perforadora de vetas LV perfora la veta que marca la muestra, una y otra vez: muestra y brocas en el bus de entrada, mena en bruto a la salida. Ejecuta todas las recetas de la perforadora de vapor y añade más.")
    add('emi.grindless.info.lv_vein_drill.1', "Sus escotillas de energía fijan cuántas perforaciones corren a la vez. El fluido de perforación en la escotilla de fluidos da más mena y menos desgaste de broca; las vetas del Nether solo se perforan con él.")
    add('emi.grindless.info.lv_vein_drill.2', 'Perfora la veta que marca la muestra, una y otra vez. Hace todas las recetas de la perforadora de vapor y añade más.')
    add('emi.grindless.info.lv_vein_drill.3', 'Hace tantos ciclos a la vez como permitan sus escotillas de energía (voltaje / 8 EU/t, hasta 8): 4 con una escotilla LV, 8 con dos.')
    add('emi.grindless.info.lv_vein_drill.4', 'Con lodo de perforación en la escotilla de fluidos: +50 % de mineral y la mitad de desgaste de la broca. Las vetas del Nether solo se perforan con él.')
    add('emi.grindless.info.lv_vein_drill.5', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 2 buses de salida y 1 escotilla de entrada.')

    add('emi.grindless.info.submerged_arc_furnace.0', "El horno de arco sumergido reduce y funde con un arco eléctrico, algo que ninguna máquina pequeña puede: silicio y polvo celeste para AE2, y obsidiana a partir de adoquín y agua.")
    add('emi.grindless.info.submerged_arc_furnace.1', "Necesita un electrodo de grafito en el bus de entrada, que se desgasta por probabilidad. El dióxido de carbono sale por la escotilla de salida de fluido: ventéalo poniendo el controlador en eliminar fluidos.")
    add('emi.grindless.info.submerged_arc_furnace.2', 'Reduce y funde con un arco eléctrico: silicio y polvo del cielo para AE2, y obsidiana a partir de adoquín y agua. Ninguna máquina pequeña puede.')
    add('emi.grindless.info.submerged_arc_furnace.3', 'Consume 2 A a LV (64 EU/t) de sus dos escotillas de energía y necesita un electrodo de grafito en el bus de entrada (se desgasta por probabilidad, en torno al 3 % de los ciclos).')
    add('emi.grindless.info.submerged_arc_furnace.4', 'La escotilla silenciadora necesita espacio libre delante. El dióxido de carbono sale por la escotilla de fluidos de salida: pon el controlador en vaciar fluidos para ventearlo. El agua de la obsidiana entra por la escotilla de entrada.')
    add('emi.grindless.info.submerged_arc_furnace.5', 'Necesita 2 escotillas de energía, 1 bus de entrada, 1 escotilla de entrada, 1 bus de salida, 1 escotilla de salida y 1 escotilla silenciadora.')

    add('emi.grindless.info.sulfide_roaster.0', "El tostador de sulfuros tuesta menas sulfuradas con aire y convierte su dióxido de azufre en ácido sulfúrico en la misma pasada: entran mena, aire y agua; salen ácido, vapor y el metal. La galena da plata, y el azufre simple arde y da ácido.")
    add('emi.grindless.info.sulfide_roaster.1', "Sustituye a un alto horno alimentado con oxígeno y dos reactores químicos. Un catalizador de contacto de vanadio en el bus de entrada se desgasta por probabilidad.")
    add('emi.grindless.info.sulfide_roaster.2', 'Tuesta menas de sulfuro con aire en lugar de oxígeno y convierte su dióxido de azufre en ácido sulfúrico en el mismo ciclo. En GTM hacen falta un EBF con oxígeno y dos reactores químicos.')
    add('emi.grindless.info.sulfide_roaster.3', 'Consume 4 A a LV (120 EU/t) de sus dos escotillas de energía. Un catalizador de contacto de vanadio en el bus de entrada se desgasta por probabilidad (en torno al 2 % de los ciclos).')
    add('emi.grindless.info.sulfide_roaster.4', 'El aire y el agua entran por las escotillas de entrada; el ácido y el vapor de su caldera de recuperación salen por las de salida. La galena da plata, y el azufre suelto se quema en ácido.')
    add('emi.grindless.info.sulfide_roaster.5', 'Necesita 2 escotillas de energía, 1 bus de entrada, 2 escotillas de entrada, 1 bus de salida y 2 escotillas de salida.')

    add('emi.grindless.info.wire_works.0', "La fábrica de cables ejecuta el laminador de cables y la dobladora en un mismo salón, varias recetas a la vez. Elige la máquina en la pestaña de modo del controlador: corre un modo cada vez, con las recetas de los bloques simples.")
    add('emi.grindless.info.wire_works.1', "Ahorra máquinas y buses, no energía: cada copia paga su energía completa, así que las escotillas de energía fijan cuántas corren.")
    add('emi.grindless.info.wire_works.2', 'Una nave de acero que ejecuta el laminador de cables y la dobladora: hasta 8 recetas a la vez. Elige la máquina en la pestaña de modo del controlador: un modo a la vez, con las recetas de las máquinas individuales.')
    add('emi.grindless.info.wire_works.3', 'Cada copia paga su EU/t completo, así que las escotillas de energía fijan cuántas corren: floor(voltaje de la escotilla / EU/t de la receta), hasta 8. Con escotillas LV solo las recetas baratas llegan a 8; dos escotillas del mismo nivel cuentan como el nivel siguiente. El voltaje sobrante sobrecarga y el modo por lotes está activo. Sin bonus de velocidad ni de energía: ahorra máquinas y buses, no energía.')
    add('emi.grindless.info.wire_works.4', 'Necesita, en cualquier celda de carcasa: 1 escotilla de mantenimiento, 1 o 2 escotillas de energía, 1 a 4 buses de entrada y 1 o 2 buses de salida; al menos 64 carcasas sólidas de acero, el resto de las paredes. Cuatro marcos de acero en las esquinas y un salón vacío de 3 x 3 x 2 dentro.')

    add('emi.grindless.info.wireless_energy_tower.0', "La torre de energía inalámbrica es el almacén de la red inalámbrica. No tiene recetas: sus 32 ranuras admiten celdas de condensador de cualquier tier, y cada torre formada suma a la red lo que guardan sus celdas; la red es la misma en todos los mundos.")
    add('emi.grindless.info.wireless_energy_tower.1', "Las escotillas y cubiertas dinamo inalámbricas meten EU; las escotillas y cubiertas de energía inalámbricas del tier de la red o inferior lo sacan. Sin torre formada, no se mueve nada. Cambiar una celda desforma la torre; el EU guardado se conserva.")
    add('emi.grindless.info.wireless_energy_tower.2', 'El almacén de la red inalámbrica: una sola red para todos los mundos. Cada torre formada suma lo que guardan sus celdas de condensadores, y las torres se suman.')
    add('emi.grindless.info.wireless_energy_tower.3', 'Sus 32 huecos de celda aceptan celdas de condensadores de cualquier nivel, o su carcasa de acero para un hueco vacío. La red envía EU al nivel de la celda más débil de todas las torres formadas: cámbialas todas para subirlo.')
    add('emi.grindless.info.wireless_energy_tower.4', 'Las escotillas y cubiertas dinamo inalámbricas meten EU (se pierde un 5 % al entrar); las escotillas y cubiertas de energía inalámbricas de su nivel o menos la sacan. Sin ninguna torre formada no se mueve nada.')
    add('emi.grindless.info.wireless_energy_tower.5', 'Cambiar una celda deshace la torre; la EU guardada sigue en la red. Sin escotillas: todo entra y sale sin cables.')

    add('emi.grindless.info.wireless_energy_hatch.0', "La escotilla de energía inalámbrica es una entrada de energía para multibloques sin cable: la red inalámbrica la llena, siempre que el tier de la red sea al menos el de la escotilla. Existe en todos los tiers de LV a UIV, a 2 A (la normal), 4 A, 16 A y 64 A.")
    add('emi.grindless.info.wireless_energy_hatch.1', "La red es la misma en todos los mundos y se guarda en torres de energía inalámbrica; sin torre formada, no se mueve nada. Su chunk debe estar cargado. Mayús + clic derecho con la mano vacía muestra el EU y el flujo de la red.")

    add('emi.grindless.info.wireless_dynamo_hatch.0', "La escotilla dinamo inalámbrica es la salida de energía de los multibloques generadores sin cable: todo lo que recibe va a la red inalámbrica, con un 5% de pérdida al entrar. Existe en todos los tiers de LV a UIV, a 2 A (la normal), 4 A, 16 A y 64 A.")
    add('emi.grindless.info.wireless_dynamo_hatch.1', "Las de 64 A caben en cualquier multibloque generador. El EU se guarda en torres de energía inalámbrica, y las escotillas y cubiertas de energía inalámbricas lo sacan. Sin torre formada, no se mueve nada.")

    add('emi.grindless.info.creature_simulator.0', "El simulador de criaturas da el botín de una criatura sin criatura. Pon el modelo de la criatura (no se gasta), su mineral y biomasa; el circuito programado elige el botín, y el 1 es todo. Nadie sale herido.")
    add('emi.grindless.info.creature_simulator.1', "Existe en LV, MV, HV y EV. Una criatura de más tier pide un simulador de ese tier o mejor. Los modelos se imprimen a partir de un modelo en blanco en un ensamblador.")
})
