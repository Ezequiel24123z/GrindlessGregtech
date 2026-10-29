// priority: 6350
// Gregtech Grindless - EMI information pages of the MV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the mv_*_lang.js files; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.advanced_multi_smelter.0', "The Advanced Multi Smelter smelts different items in the same run: every smeltable item in its input buses with the same cooking time joins the batch, up to its parallel limit.")
    add('emi.grindless.info.advanced_multi_smelter.1', "The heating coils set the parallels, from 4 with cupronickel up to 64 with HSS-G. Each parallel costs one electric furnace. For a single item in bulk, GTM's HV Multi Smelter is faster.")

    add('emi.grindless.info.biorefinery.0', "The Biorefinery is a distillation column for organic fluids: wood tar, vinegar, biomass, fermented biomass, coal tar, oils, creosote and diluted acids come apart into every fraction in one pass.")
    add('emi.grindless.info.biorefinery.1', "Same ratios and energy as GTM's Distillation Tower. Each fraction leaves through the output hatch on its own layer, so every layer needs a hatch and nothing is voided. Crude oil and liquid air still need the HV tower.")

    add('emi.grindless.info.lava_furnace.0', "The Lava Furnace is a furnace heated by lava instead of electricity: it has no energy hatch. It smelts any furnace recipe, several items at once, mixed kinds of the same cooking time in the same run.")
    add('emi.grindless.info.lava_furnace.1', "Every item takes a little lava from a fluid input hatch in the hearth. It never makes lava: it is the compact way to smelt with lava pumped from the Nether.")

    add('emi.grindless.info.mv_greenhouse.0', "The MV Greenhouse grows trees, rubber trees, crops, mushrooms, berries, vines and flowers with a plant that is never used up. It runs every Steam and LV Greenhouse recipe, with more crops at once.")
    add('emi.grindless.info.mv_greenhouse.1', "Water unlocks the extra plants; circuit 2 plus fertilizer doubles the output. Carbon dioxide in a second input hatch adds output and gives oxygen back.")

    add('emi.grindless.info.mv_vein_drill.0', "The MV Vein Drill drills the vein marked by the vein sample, over and over. It runs every Steam and LV Vein Drill recipe, up to 16 bores at once.")
    add('emi.grindless.info.mv_vein_drill.1', "The vanadium steel bit only works here and in better drills. Drilling fluid gives more ore and less wear; Nether and End veins only drill with it.")

    add('emi.grindless.info.ore_plant.0', "The Ore Plant does the whole ore chain in one pass: macerate, wash, heat-centrifuge, macerate. A raw ore and water go in; dust, every byproduct of the chain and the rubble come out. Gem ores keep the sifter.")
    add('emi.grindless.info.ore_plant.1', "Same output and energy per ore as the loose machines: it saves steps, buses and room. The rubble is stone dust, so give it somewhere to go. Programmed circuit 2 with distilled water washes faster; the ore's reagent switches it to the chemical bath.")

    add('emi.grindless.info.polymer_works.0', "The Polymer Works runs two whole lines in one pass: polyethylene plates (ethanol and sulfuric acid to ethylene, then polyethylene, then plate) and rubber plates (raw rubber and sulfur to rubber, then plate).")
    add('emi.grindless.info.polymer_works.1', "The diluted sulfuric acid is its byproduct: send it back to the sulfuric acid recipes. The coil row only completes the structure; the energy hatches set how many recipes run at once.")

    add('emi.grindless.info.universal_assembly_factory.0', "The Universal Assembly Factory is two machines in one: assembler and circuit assembler. Choose the machine in the controller's machine mode tab: one mode runs at a time, with the single blocks' own recipes.")
    add('emi.grindless.info.universal_assembly_factory.1', "Solder, glue or plastic goes in an input hatch. Input buses set to distinct keep different circuits apart. Cleanroom recipes still need a cleanroom.")

    add('emi.grindless.info.universal_mixing_factory.0', "The Universal Mixing Factory is four machines in one: mixer, chemical reactor, chemical bath and ore washer. Choose the machine in the controller's machine mode tab: one mode runs at a time, with the single blocks' own recipes.")
    add('emi.grindless.info.universal_mixing_factory.1', "Dust-only mixer recipes need no hatch. The chemical reactor takes up to three fluids and gives up to two, each in its own hatch.")

    add('emi.grindless.info.universal_processing_factory.0', "The Universal Processing Factory is eleven machines in one: bender, wiremill, lathe, cutter, extruder, compressor, forge hammer, forming press, polarizer, laser engraver and fluid solidifier. Choose the machine in the controller's machine mode tab; one mode runs at a time, with the single blocks' own recipes.")
    add('emi.grindless.info.universal_processing_factory.1', "Input buses set to distinct keep different circuits, molds and lenses apart. The cutter's water or lubricant and the solidifier's fluid go in the input hatch. A new mode starts when the run in progress ends.")

    add('emi.grindless.info.universal_separation_factory.0', "The Universal Separation Factory is seven machines in one: centrifuge, electrolyzer, thermal centrifuge, macerator, sifter, extractor and electromagnetic separator. Choose the machine in the controller's machine mode tab; one mode runs at a time, with the single blocks' own recipes.")
    add('emi.grindless.info.universal_separation_factory.1', "Each output hatch holds one fluid, so a recipe that gives two gases needs two hatches. Add output buses for the byproducts of long recipes. A new mode starts when the run in progress ends.")

    add('emi.grindless.info.weather_controller.0', "The Weather Controller seeds the clouds from the ground. Circuit 1: a clear sky for a day (calcium chloride). Circuit 2: rain for half a day (salt). Circuit 3: a thunderstorm for five minutes (salt and copper wire).")
    add('emi.grindless.info.weather_controller.1', "It works on Earth only. If the same weather still has more than half of its time left, it waits instead of seeding again. Use it for clear nights for the observatories and dry days for the heliostat tower.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.advanced_multi_smelter.0', "El multihorno avanzado funde objetos distintos en la misma pasada: todo objeto fundible de sus buses de entrada con el mismo tiempo de cocción entra en el lote, hasta su límite de paralelos.")
    add('emi.grindless.info.advanced_multi_smelter.1', "Las bobinas calefactoras fijan los paralelos, desde 4 con cuproníquel hasta 64 con HSS-G. Cada paralelo cuesta un horno eléctrico. Para un solo objeto en cantidad, el multihorno HV de GTM es más rápido.")

    add('emi.grindless.info.biorefinery.0', "La biorrefinería es una columna de destilación para fluidos orgánicos: alquitrán de madera, vinagre, biomasa, biomasa fermentada, alquitrán de hulla, aceites, creosota y ácidos diluidos se separan en todas sus fracciones de una sola pasada.")
    add('emi.grindless.info.biorefinery.1', "Mismas proporciones y energía que la torre de destilación de GTM. Cada fracción sale por el hatch de su capa, así que cada capa necesita un hatch y nada se elimina. El petróleo crudo y el aire líquido siguen pidiendo la torre HV.")

    add('emi.grindless.info.lava_furnace.0', "El horno de lava es un horno calentado con lava en lugar de electricidad: no tiene hatch de energía. Funde cualquier receta de horno, varios objetos a la vez, de tipos mezclados con el mismo tiempo de cocción en la misma pasada.")
    add('emi.grindless.info.lava_furnace.1', "Cada objeto gasta algo de lava de un hatch de entrada de fluido en el hogar. Nunca produce lava: es la forma compacta de fundir con lava bombeada del Nether.")

    add('emi.grindless.info.mv_greenhouse.0', "El invernadero MV cultiva árboles, árboles de caucho, cultivos, setas, bayas, enredaderas y flores con una planta que nunca se gasta. Ejecuta todas las recetas de los invernaderos de vapor y LV, con más cultivos a la vez.")
    add('emi.grindless.info.mv_greenhouse.1', "El agua desbloquea las plantas extra; el circuito 2 con fertilizante duplica la producción. El dióxido de carbono en un segundo hatch de entrada suma producción y devuelve oxígeno.")

    add('emi.grindless.info.mv_vein_drill.0', "La perforadora de vetas MV perfora la veta que marca la muestra, una y otra vez. Ejecuta todas las recetas de las perforadoras de vapor y LV, hasta 16 perforaciones a la vez.")
    add('emi.grindless.info.mv_vein_drill.1', "La broca de acero de vanadio solo funciona aquí y en perforadoras mejores. El fluido de perforación da más mena y menos desgaste; las vetas del Nether y del End solo se perforan con él.")

    add('emi.grindless.info.ore_plant.0', "La planta de menas hace toda la cadena de menas de una pasada: tritura, lava, centrifuga con calor y vuelve a triturar. Entran una mena en bruto y agua; salen polvo, todos los subproductos de la cadena y los escombros. Las menas de gema conservan el tamiz.")
    add('emi.grindless.info.ore_plant.1', "Misma producción y energía por mena que las máquinas sueltas: ahorra pasos, buses y espacio. Los escombros son polvo de piedra, así que dales salida. El circuito programado 2 con agua destilada lava más rápido; el reactivo de la mena la pasa al baño químico.")

    add('emi.grindless.info.polymer_works.0', "La planta de polímeros ejecuta dos líneas completas de una pasada: placas de polietileno (etanol y ácido sulfúrico a etileno, luego polietileno, luego placa) y placas de caucho (caucho crudo y azufre a caucho, luego placa).")
    add('emi.grindless.info.polymer_works.1', "El ácido sulfúrico diluido es su subproducto: devuélvelo a las recetas de ácido sulfúrico. La fila de bobinas solo completa la estructura; los hatches de energía fijan cuántas recetas corren a la vez.")

    add('emi.grindless.info.universal_assembly_factory.0', "La fábrica de ensamblaje universal son dos máquinas en una: ensambladora y ensambladora de circuitos. Elige la máquina en la pestaña de modo del controlador: corre un modo cada vez, con las recetas de los bloques simples.")
    add('emi.grindless.info.universal_assembly_factory.1', "El soldador, el pegamento o el plástico entran por un hatch de entrada. Los buses de entrada en modo distinto mantienen separados los circuitos. Las recetas de sala limpia siguen necesitando una sala limpia.")

    add('emi.grindless.info.universal_mixing_factory.0', "La fábrica de mezclas universal son cuatro máquinas en una: mezcladora, reactor químico, baño químico y lavador de menas. Elige la máquina en la pestaña de modo del controlador: corre un modo cada vez, con las recetas de los bloques simples.")
    add('emi.grindless.info.universal_mixing_factory.1', "Las recetas de mezcladora solo de polvos no necesitan hatch. El reactor químico admite hasta tres fluidos y da hasta dos, cada uno en su hatch.")

    add('emi.grindless.info.universal_processing_factory.0', "La fábrica de procesado universal son once máquinas en una: dobladora, laminador de cables, torno, cortadora, extrusora, compresor, martillo de forja, prensa de formas, polarizador, grabadora láser y solidificador de fluidos. Elige la máquina en la pestaña de modo del controlador; corre un modo cada vez, con las recetas de los bloques simples.")
    add('emi.grindless.info.universal_processing_factory.1', "Los buses de entrada en modo distinto mantienen separados circuitos, moldes y lentes. El agua o lubricante de la cortadora y el fluido del solidificador entran por el hatch de entrada. Un modo nuevo empieza cuando termina la pasada en curso.")

    add('emi.grindless.info.universal_separation_factory.0', "La fábrica de separación universal son siete máquinas en una: centrifugadora, electrolizador, centrifugadora térmica, macerador, tamiz, extractor y separador electromagnético. Elige la máquina en la pestaña de modo del controlador; corre un modo cada vez, con las recetas de los bloques simples.")
    add('emi.grindless.info.universal_separation_factory.1', "Cada hatch de salida guarda un solo fluido, así que una receta que da dos gases necesita dos hatches. Añade buses de salida para los subproductos de las recetas largas. Un modo nuevo empieza cuando termina la pasada en curso.")

    add('emi.grindless.info.weather_controller.0', "El controlador del clima siembra las nubes desde el suelo. Circuito 1: cielo despejado un día (cloruro de calcio). Circuito 2: lluvia medio día (sal). Circuito 3: tormenta de cinco minutos (sal y cable de cobre).")
    add('emi.grindless.info.weather_controller.1', "Solo funciona en la Tierra. Si el mismo clima aún tiene más de la mitad de su tiempo, espera en lugar de sembrar otra vez. Sirve para noches despejadas en los observatorios y días secos para la torre de heliostatos.")
})
