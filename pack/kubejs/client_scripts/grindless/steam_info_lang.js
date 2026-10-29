// priority: 5450
// Gregtech Grindless - EMI information pages of the Steam era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Names and tooltips live in steam_small_family_lang.js, steam_large_family_lang.js and steam_content_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.coking_battery.0', "The By-product Coke Battery cokes coal like the coke oven, but keeps the gas: coal in, coke, creosote and coal gas out, four chambers at a time, on steam.")
    add('emi.grindless.info.coking_battery.1', "Coal gas is poisonous: keep it in tanks. From LV it fuels gas turbines and the distillery. If the gas hatch is full, the battery stops.")

    add('emi.grindless.info.large_steam_macerator.0', "The Large Steam Macerator runs the macerator recipes on steam, many at a time: ore to crushed ore, crushed ore to dust, with every chance byproduct. No electricity.")
    add('emi.grindless.info.large_steam_macerator.1', "It is the reward for finishing Steam: the first step of every ore line. Like every steam multiblock it only runs recipes of LV voltage or below.")

    add('emi.grindless.info.large_steam_ore_washer.0', "The Large Steam Ore Washer runs the ore washer recipes on steam, many at a time: crushed ore and water in, purified ore and stone dust out, with a chance byproduct.")
    add('emi.grindless.info.large_steam_ore_washer.1', "Water goes in any fluid input hatch. It comes after the macerator and before the thermal centrifuge. Only recipes of LV voltage or below run.")

    add('emi.grindless.info.large_steam_thermal_centrifuge.0', "The Large Steam Thermal Centrifuge runs the thermal centrifuge recipes on steam, many at a time: purified or crushed ore to its centrifuged form, with the stone and the byproduct dust.")
    add('emi.grindless.info.large_steam_thermal_centrifuge.1', "It is the last step of the steam ore line, after the washer. Only recipes of LV voltage or below run: the hotter ones wait for electricity.")

    add('emi.grindless.info.large_steam_centrifuge.0', "The Large Steam Centrifuge runs the centrifuge recipes on steam, many at a time: it splits dusts and ore byproducts into their parts.")
    add('emi.grindless.info.large_steam_centrifuge.1', "Only recipes of LV voltage or below run, so the dust separations that need more energy stay out of reach until LV. It needs a fluid input hatch and a fluid output hatch.")

    add('emi.grindless.info.large_steam_chemical_bath.0', "The Large Steam Chemical Bath runs the chemical bath recipes on steam, many at a time: paper from wood dust, treated planks, and ore bathed in a fluid.")
    add('emi.grindless.info.large_steam_chemical_bath.1', "Only recipes of LV voltage or below run. Most hot-ingot baths need more, so they wait for electricity.")

    add('emi.grindless.info.steam_alloy_smelter.0', "The Steam Alloy Smelter runs the alloy smelter recipes on steam, eight at a time: two ingots or dusts into one alloy ingot.")
    add('emi.grindless.info.steam_alloy_smelter.1', "It replaces the single steam alloy smelter with the same steam limit and eight times the throughput. It needs a steam hatch, an input bus and an output bus.")

    add('emi.grindless.info.steam_blast_furnace.0', "The Steam Blast Furnace turns iron straight into steel: iron ore, ingots or dust with coke and calcite flux in, steel and ash out, four batches at a time.")
    add('emi.grindless.info.steam_blast_furnace.1', "It is the first source of steel in bulk. The hot blast runs on steam. The ash is slag: void it, or keep it for fertilizer at LV.")

    add('emi.grindless.info.steam_chemical_bath.0', "The Steam Chemical Bath runs the chemical bath recipes on steam, eight at a time: paper from wood dust or sugar cane, treated planks from creosote, dark concrete.")
    add('emi.grindless.info.steam_chemical_bath.1', "GTM has no single steam chemical bath, so this multiblock is the only way to use the type before LV. It needs a fluid input hatch.")

    add('emi.grindless.info.steam_compressor.0', "The Steam Compressor runs the compressor recipes on steam, eight at a time: dusts into plates, items into blocks.")
    add('emi.grindless.info.steam_compressor.1', "It replaces the single steam compressor with the same steam limit and eight times the throughput. It needs a steam hatch, an input bus and an output bus.")

    add('emi.grindless.info.steam_forge_hammer.0', "The Steam Forge Hammer runs the forge hammer recipes on steam, eight at a time: ingots into plates, ore crushing.")
    add('emi.grindless.info.steam_forge_hammer.1', "It replaces the single steam forge hammer with the same steam limit and eight times the throughput. It needs a steam hatch, an input bus and an output bus.")

    add('emi.grindless.info.steam_greenhouse.0', "The Steam Greenhouse grows trees, rubber trees and crops on steam: put a sapling or seed in the input bus and the harvest comes out. The plant is never used up.")
    add('emi.grindless.info.steam_greenhouse.1', "It runs several crops at once, with no planting and no felling. It is the hand-free source of wood, rubber and seeds before electricity. It needs a steam hatch, an input bus and an output bus.")

    add('emi.grindless.info.steam_mixer.0', "The Steam Mixer runs the mixer recipes on steam, eight at a time: bronze, brass, invar and the other dust alloys need no fluid at all.")
    add('emi.grindless.info.steam_mixer.1', "Add fluid hatches for glue, salt water or concrete. GTM has no single steam mixer, so this is the only way to mix before LV.")

    add('emi.grindless.info.steam_ore_washer.0', "The Steam Ore Washer runs the ore washer recipes on steam, eight at a time: crushed ore washed clean with water.")
    add('emi.grindless.info.steam_ore_washer.1', "GTM has no single steam ore washer, so this is the only way to wash ore before LV. It needs a fluid input hatch for the water.")

    add('emi.grindless.info.steam_vein_drill.0', "The Steam Vein Drill drills the vein marked by the vein sample, over and over: put the sample and drill bits in the input bus and raw ore comes out. The vein never runs dry.")
    add('emi.grindless.info.steam_vein_drill.1', "It runs several bores at once, one drill bit per run; the bits wear out by chance. It is where ore comes from in the steam age, with no hand mining.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.coking_battery.0', "La batería de coque con subproductos coquiza el carbón como el horno de coque, pero conserva el gas: entra carbón y salen coque, creosota y gas de hulla, cuatro cámaras a la vez, con vapor.")
    add('emi.grindless.info.coking_battery.1', "El gas de hulla es venenoso: guárdalo en tanques. Desde LV alimenta turbinas de gas y la destilería. Si su cubo de gas se llena, la batería se detiene.")

    add('emi.grindless.info.large_steam_macerator.0', "El macerador de vapor grande procesa las recetas del macerador con vapor, muchas a la vez: mena a mena triturada, mena triturada a polvo, con todos los subproductos por probabilidad. Sin electricidad.")
    add('emi.grindless.info.large_steam_macerator.1', "Es la recompensa por terminar la era del vapor: el primer paso de toda línea de minerales. Como todo multibloque de vapor, solo ejecuta recetas de voltaje LV o menos.")

    add('emi.grindless.info.large_steam_ore_washer.0', "El lavador de menas de vapor grande procesa las recetas del lavador de menas con vapor, muchas a la vez: mena triturada y agua entran; salen mena purificada y polvo de piedra, con un subproducto por probabilidad.")
    add('emi.grindless.info.large_steam_ore_washer.1', "El agua entra por cualquier hatch de entrada de fluido. Va después del macerador y antes de la centrifugadora térmica. Solo ejecuta recetas de voltaje LV o menos.")

    add('emi.grindless.info.large_steam_thermal_centrifuge.0', "La centrifugadora térmica de vapor grande procesa las recetas de la centrifugadora térmica con vapor, muchas a la vez: mena purificada o triturada pasa a su forma centrifugada, con la piedra y el polvo del subproducto.")
    add('emi.grindless.info.large_steam_thermal_centrifuge.1', "Es el último paso de la línea de minerales de vapor, tras el lavador. Solo ejecuta recetas de voltaje LV o menos: las más calientes esperan a la electricidad.")

    add('emi.grindless.info.large_steam_centrifuge.0', "La centrifugadora de vapor grande procesa las recetas de la centrifugadora con vapor, muchas a la vez: separa polvos y subproductos de mena en sus componentes.")
    add('emi.grindless.info.large_steam_centrifuge.1', "Solo ejecuta recetas de voltaje LV o menos, así que las separaciones que piden más energía quedan fuera hasta LV. Necesita un hatch de entrada y otro de salida de fluido.")

    add('emi.grindless.info.large_steam_chemical_bath.0', "El baño químico de vapor grande procesa las recetas del baño químico con vapor, muchas a la vez: papel de serrín, tablones tratados y menas bañadas en un fluido.")
    add('emi.grindless.info.large_steam_chemical_bath.1', "Solo ejecuta recetas de voltaje LV o menos. La mayoría de los baños de lingotes calientes piden más, así que esperan a la electricidad.")

    add('emi.grindless.info.steam_alloy_smelter.0', "El horno de aleaciones de vapor procesa las recetas del horno de aleaciones con vapor, ocho a la vez: dos lingotes o polvos se funden en un lingote de aleación.")
    add('emi.grindless.info.steam_alloy_smelter.1', "Sustituye al horno de aleaciones de vapor simple, con el mismo límite de vapor y ocho veces el rendimiento. Necesita un hatch de vapor, un bus de entrada y uno de salida.")

    add('emi.grindless.info.steam_blast_furnace.0', "El alto horno de vapor convierte el hierro directamente en acero: entran mena, lingotes o polvo de hierro con coque y fundente de calcita, y salen acero y ceniza, cuatro lotes a la vez.")
    add('emi.grindless.info.steam_blast_furnace.1', "Es la primera fuente de acero en cantidad. El soplado caliente funciona con vapor. La ceniza es escoria: elimínala, o guárdala como fertilizante en LV.")

    add('emi.grindless.info.steam_chemical_bath.0', "El baño químico de vapor procesa las recetas del baño químico con vapor, ocho a la vez: papel de serrín o caña de azúcar, tablones tratados con creosota, hormigón oscuro.")
    add('emi.grindless.info.steam_chemical_bath.1', "GTM no tiene un baño químico de vapor simple, así que este multibloque es la única forma de usar el tipo antes de LV. Necesita un hatch de entrada de fluido.")

    add('emi.grindless.info.steam_compressor.0', "El compresor de vapor procesa las recetas del compresor con vapor, ocho a la vez: polvos a placas, objetos a bloques.")
    add('emi.grindless.info.steam_compressor.1', "Sustituye al compresor de vapor simple, con el mismo límite de vapor y ocho veces el rendimiento. Necesita un hatch de vapor, un bus de entrada y uno de salida.")

    add('emi.grindless.info.steam_forge_hammer.0', "El martillo de forja de vapor procesa las recetas del martillo de forja con vapor, ocho a la vez: lingotes a placas, trituración de menas.")
    add('emi.grindless.info.steam_forge_hammer.1', "Sustituye al martillo de forja de vapor simple, con el mismo límite de vapor y ocho veces el rendimiento. Necesita un hatch de vapor, un bus de entrada y uno de salida.")

    add('emi.grindless.info.steam_greenhouse.0', "El invernadero de vapor cultiva árboles, árboles de caucho y cultivos con vapor: pon un brote o una semilla en el bus de entrada y sale la cosecha. La planta nunca se gasta.")
    add('emi.grindless.info.steam_greenhouse.1', "Cultiva varias plantas a la vez, sin plantar ni talar. Es la fuente de madera, caucho y semillas sin trabajo manual antes de la electricidad. Necesita un hatch de vapor, un bus de entrada y uno de salida.")

    add('emi.grindless.info.steam_mixer.0', "La mezcladora de vapor procesa las recetas de la mezcladora con vapor, ocho a la vez: el bronce, el latón, el invar y las demás aleaciones de polvo no necesitan fluido.")
    add('emi.grindless.info.steam_mixer.1', "Añade hatches de fluido para pegamento, agua salada u hormigón. GTM no tiene una mezcladora de vapor simple, así que es la única forma de mezclar antes de LV.")

    add('emi.grindless.info.steam_ore_washer.0', "El lavador de menas de vapor procesa las recetas del lavador de menas con vapor, ocho a la vez: la mena triturada se lava con agua.")
    add('emi.grindless.info.steam_ore_washer.1', "GTM no tiene un lavador de vapor simple, así que es la única forma de lavar menas antes de LV. Necesita un hatch de entrada de fluido para el agua.")

    add('emi.grindless.info.steam_vein_drill.0', "La perforadora de vetas a vapor perfora la veta que marca la muestra, una y otra vez: pon la muestra y las brocas en el bus de entrada y sale mena en bruto. La veta nunca se agota.")
    add('emi.grindless.info.steam_vein_drill.1', "Trabaja con varias perforaciones a la vez, una broca por ciclo; las brocas se desgastan por probabilidad. Es de donde sale la mena en la era del vapor, sin minar a mano.")
})
