// Gregtech Grindless - EMI information pages of the LV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in lv_multis_lang.js, lv_mega_wire_works_lang.js and wireless_energy_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.heliostat_tower.0', "The Heliostat Tower boils water with sunlight and no fuel: a field of mirrors focuses the sun on a receiver at the top. Water in, steam out, as much as a Large Bronze Boiler at full fire.")
    add('emi.grindless.info.heliostat_tower.1', "It works only by day, with open sky over the tower and the mirrors and no rain. Store the day's steam in a multiblock tank for the night. The mirror drives use a little EU, so it needs an energy hatch.")

    add('emi.grindless.info.lv_greenhouse.0', "The LV Greenhouse grows trees, rubber trees, crops, mushrooms, berries, vines and flowers: put the plant in the input bus and the harvest comes out. The plant is never used up.")
    add('emi.grindless.info.lv_greenhouse.1', "Water in the fluid hatch unlocks the extra plants. Programmed circuit 2 plus fertilizer gives double output in half the time.")

    add('emi.grindless.info.lv_vein_drill.0', "The LV Vein Drill drills the vein marked by the vein sample, over and over: sample and drill bits in the input bus, raw ore out. It runs every Steam Vein Drill recipe and adds more.")
    add('emi.grindless.info.lv_vein_drill.1', "Its energy hatches set how many bores run at once. Drilling fluid in the fluid hatch gives more ore and less bit wear; Nether veins only drill with it.")

    add('emi.grindless.info.submerged_arc_furnace.0', "The Submerged Arc Furnace reduces and melts in an electric arc, which no small machine can: silicon and sky dust for AE2, and obsidian from cobblestone and water.")
    add('emi.grindless.info.submerged_arc_furnace.1', "It needs a graphite electrode in the input bus; the electrode wears out by chance. Carbon dioxide comes out of the fluid output hatch: vent it by setting the controller to void fluids.")

    add('emi.grindless.info.sulfide_roaster.0', "The Sulfide Roaster roasts sulfide ores with air and turns their sulfur dioxide into sulfuric acid in the same run: ore, air and water in; acid, steam and the metal out. Galena gives silver, and plain sulfur burns into acid.")
    add('emi.grindless.info.sulfide_roaster.1', "It replaces a blast furnace fed with oxygen and two chemical reactors. A vanadium contact catalyst in the input bus wears out by chance.")

    add('emi.grindless.info.wire_works.0', "The Wire Works runs the wiremill and the bender in one hall, several recipes at a time. Choose the machine in the controller's machine mode tab: one mode runs at a time, with the single blocks' own recipes.")
    add('emi.grindless.info.wire_works.1', "It saves machines and buses, not power: each copy pays its full energy, so the energy hatches set how many run.")

    add('emi.grindless.info.wireless_energy_tower.0', "The Wireless Energy Tower is the store of the wireless network. It has no recipes: its 32 slots take capacitor cells of any tier, and every formed tower adds what its cells hold to the network, which is shared by every world.")
    add('emi.grindless.info.wireless_energy_tower.1', "Wireless dynamo hatches and covers put EU in; wireless energy hatches and covers at or below the network's tier take it out. With no tower formed, nothing moves. Swapping a cell unforms the tower; the stored EU stays.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.heliostat_tower.0', "La torre de heliostatos hierve agua con luz solar y sin combustible: un campo de espejos enfoca el sol en un receptor en lo alto. Entra agua y sale vapor, como una caldera grande de bronce a pleno fuego.")
    add('emi.grindless.info.heliostat_tower.1', "Solo funciona de día, con cielo abierto sobre la torre y los espejos y sin lluvia. Guarda el vapor del día en un tanque multibloque para la noche. Los motores de los espejos gastan algo de EU, así que necesita un hatch de energía.")

    add('emi.grindless.info.lv_greenhouse.0', "El invernadero LV cultiva árboles, árboles de caucho, cultivos, setas, bayas, enredaderas y flores: pon la planta en el bus de entrada y sale la cosecha. La planta nunca se gasta.")
    add('emi.grindless.info.lv_greenhouse.1', "El agua en el hatch de fluido desbloquea las plantas extra. El circuito programado 2 con fertilizante da el doble de producción en la mitad de tiempo.")

    add('emi.grindless.info.lv_vein_drill.0', "La perforadora de vetas LV perfora la veta que marca la muestra, una y otra vez: muestra y brocas en el bus de entrada, mena en bruto a la salida. Ejecuta todas las recetas de la perforadora de vapor y añade más.")
    add('emi.grindless.info.lv_vein_drill.1', "Sus hatches de energía fijan cuántas perforaciones corren a la vez. El fluido de perforación en el hatch de fluido da más mena y menos desgaste de broca; las vetas del Nether solo se perforan con él.")

    add('emi.grindless.info.submerged_arc_furnace.0', "El horno de arco sumergido reduce y funde con un arco eléctrico, algo que ninguna máquina pequeña puede: silicio y polvo celeste para AE2, y obsidiana a partir de adoquín y agua.")
    add('emi.grindless.info.submerged_arc_furnace.1', "Necesita un electrodo de grafito en el bus de entrada, que se desgasta por probabilidad. El dióxido de carbono sale por el hatch de salida de fluido: ventéalo poniendo el controlador en eliminar fluidos.")

    add('emi.grindless.info.sulfide_roaster.0', "El tostador de sulfuros tuesta menas sulfuradas con aire y convierte su dióxido de azufre en ácido sulfúrico en la misma pasada: entran mena, aire y agua; salen ácido, vapor y el metal. La galena da plata, y el azufre simple arde y da ácido.")
    add('emi.grindless.info.sulfide_roaster.1', "Sustituye a un alto horno alimentado con oxígeno y dos reactores químicos. Un catalizador de contacto de vanadio en el bus de entrada se desgasta por probabilidad.")

    add('emi.grindless.info.wire_works.0', "La fábrica de cables ejecuta el laminador de cables y la dobladora en un mismo salón, varias recetas a la vez. Elige la máquina en la pestaña de modo del controlador: corre un modo cada vez, con las recetas de los bloques simples.")
    add('emi.grindless.info.wire_works.1', "Ahorra máquinas y buses, no energía: cada copia paga su energía completa, así que los hatches de energía fijan cuántas corren.")

    add('emi.grindless.info.wireless_energy_tower.0', "La torre de energía inalámbrica es el almacén de la red inalámbrica. No tiene recetas: sus 32 ranuras admiten celdas de condensador de cualquier tier, y cada torre formada suma a la red lo que guardan sus celdas; la red es la misma en todos los mundos.")
    add('emi.grindless.info.wireless_energy_tower.1', "Los hatches y cubiertas dinamo inalámbricos meten EU; los hatches y cubiertas de energía inalámbricos del tier de la red o inferior lo sacan. Sin torre formada, no se mueve nada. Cambiar una celda desforma la torre; el EU guardado se conserva.")
})
