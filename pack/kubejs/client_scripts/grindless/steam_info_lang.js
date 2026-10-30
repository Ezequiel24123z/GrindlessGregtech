// priority: 5450
// Gregtech Grindless - EMI information pages of the Steam era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Names and tooltips live in steam_small_family_lang.js, steam_large_family_lang.js and steam_content_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.coking_battery.0', "The By-product Coke Battery cokes coal like the coke oven, but keeps the gas: coal in, coke, creosote and coal gas out, four chambers at a time, on steam.")
    add('emi.grindless.info.coking_battery.1', "Coal gas is poisonous: keep it in tanks. From LV it fuels gas turbines and the distillery. If the gas hatch is full, the battery stops.")
    add('emi.grindless.info.coking_battery.2', 'Cokes coal like the coke oven but keeps the gas: 1 coal -> 1 coke + 500 mB creosote + 125 mB coal gas.')
    add('emi.grindless.info.coking_battery.3', 'Runs 4 chambers at once, as fast as 6 or 7 coke ovens, for about 28 mB/t of steam.')
    add('emi.grindless.info.coking_battery.4', 'Coal gas is poisonous: keep it in tanks. From LV it fuels gas turbines and the distillery. When its hatch is full, the battery stops.')
    add('emi.grindless.info.coking_battery.5', 'Needs 1 steam input hatch and 1 or 2 steam output buses in the base, and 1 steam input bus and 2 fluid output hatches in the roof.')

    add('emi.grindless.info.large_steam_macerator.0', "The Large Steam Macerator runs the macerator recipes on steam, many at a time: ore to crushed ore, crushed ore to dust, with every chance byproduct. No electricity.")
    add('emi.grindless.info.large_steam_macerator.1', "It is the reward for finishing Steam: the first step of every ore line. Like every steam multiblock it only runs recipes of LV voltage or below.")
    add('emi.grindless.info.large_steam_macerator.2', 'Runs GTM\'s own macerator recipes on steam, up to 64 in parallel: ore to crushed ore, crushed ore to dust, every chance byproduct included.')
    add('emi.grindless.info.large_steam_macerator.3', 'The reward for finishing Steam: one block crushes as much ore as dozens of macerators, no electricity needed.')
    add('emi.grindless.info.large_steam_macerator.4', 'Needs 1 steam input hatch, 1 steam input bus and 2 steam output buses somewhere in the shell.')

    add('emi.grindless.info.large_steam_ore_washer.0', "The Large Steam Ore Washer runs the ore washer recipes on steam, many at a time: crushed ore and water in, purified ore and stone dust out, with a chance byproduct.")
    add('emi.grindless.info.large_steam_ore_washer.1', "Water goes in any fluid input hatch. It comes after the macerator and before the thermal centrifuge. Only recipes of LV voltage or below run.")
    add('emi.grindless.info.large_steam_ore_washer.2', 'Runs GTM\'s own ore washer recipes on steam, up to 64 in parallel: crushed ore and water in, purified ore and stone dust out, with a chance byproduct.')
    add('emi.grindless.info.large_steam_ore_washer.3', 'Takes any fluid input hatch, water included: the distilled water recipes need no integrated circuit at all.')
    add('emi.grindless.info.large_steam_ore_washer.4', 'Needs 1 steam input hatch, 1 steam input bus, 2 steam output buses and 1 fluid input hatch (any tier) in the shell.')

    add('emi.grindless.info.large_steam_thermal_centrifuge.0', "The Large Steam Thermal Centrifuge runs the thermal centrifuge recipes on steam, many at a time: purified or crushed ore to its centrifuged form, with the stone and the byproduct dust.")
    add('emi.grindless.info.large_steam_thermal_centrifuge.1', "It is the last step of the steam ore line, after the washer. Only recipes of LV voltage or below run: the hotter ones wait for electricity.")
    add('emi.grindless.info.large_steam_thermal_centrifuge.2', 'Runs GTM\'s own thermal centrifuge recipes on steam, up to 64 in parallel: purified or crushed ore straight to its centrifuged form, with the stone and the byproduct dust.')
    add('emi.grindless.info.large_steam_thermal_centrifuge.3', 'Pairs with the ore washer below it: wash first, then centrifuge what is left for every last byproduct.')
    add('emi.grindless.info.large_steam_thermal_centrifuge.4', 'Needs 1 steam input hatch, 1 steam input bus and 2 steam output buses somewhere in the shell.')

    add('emi.grindless.info.large_steam_centrifuge.0', "The Large Steam Centrifuge runs the centrifuge recipes on steam, many at a time: it splits dusts and ore byproducts into their parts.")
    add('emi.grindless.info.large_steam_centrifuge.1', "Only recipes of LV voltage or below run, so the dust separations that need more energy stay out of reach until LV. It needs a fluid input hatch and a fluid output hatch.")
    add('emi.grindless.info.large_steam_centrifuge.2', 'Runs GTM\'s own centrifuge recipes on steam, up to 64 in parallel: dust separations and ore byproducts, anything at LV voltage or below.')
    add('emi.grindless.info.large_steam_centrifuge.3', 'GTM never blocks the type outright: most dust separations already sit at or under 32 EU/t. Only the hotter ones (uranium, glowstone...) stay out of reach.')
    add('emi.grindless.info.large_steam_centrifuge.4', 'Needs 1 steam input hatch, 1 steam input bus, 2 steam output buses, 1 fluid input hatch and 1 or 2 fluid output hatches (any tier) in the shell.')

    add('emi.grindless.info.large_steam_chemical_bath.0', "The Large Steam Chemical Bath runs the chemical bath recipes on steam, many at a time: paper from wood dust, treated planks, and ore bathed in a fluid.")
    add('emi.grindless.info.large_steam_chemical_bath.1', "Only recipes of LV voltage or below run. Most hot-ingot baths need more, so they wait for electricity.")
    add('emi.grindless.info.large_steam_chemical_bath.2', 'Runs GTM\'s own chemical bath recipes on steam, up to 64 in parallel: paper from wood dust, treated planks, and ore bathed in whatever fluid the vein needs.')
    add('emi.grindless.info.large_steam_chemical_bath.3', 'Most of its hot-ingot baths run too far above LV for steam: this reaches only what the steam cap allows.')
    add('emi.grindless.info.large_steam_chemical_bath.4', 'Needs 1 steam input hatch, 1 steam input bus, 2 steam output buses, 1 fluid input hatch and 1 fluid output hatch (any tier) in the shell.')

    add('emi.grindless.info.steam_alloy_smelter.0', "The Steam Alloy Smelter runs the alloy smelter recipes on steam, eight at a time: two ingots or dusts into one alloy ingot.")
    add('emi.grindless.info.steam_alloy_smelter.1', "It replaces the single steam alloy smelter with the same steam limit and eight times the throughput. It needs a steam hatch, an input bus and an output bus.")
    add('emi.grindless.info.steam_alloy_smelter.2', 'Runs the Alloy Smelter recipe type with 8 parallels: two ingots or dusts straight into an alloy ingot, eight at a time.')
    add('emi.grindless.info.steam_alloy_smelter.3', 'Replaces the single-block Low/High Pressure Steam Alloy Smelter: same steam limit, same LV-tier cap, eight times the throughput.')
    add('emi.grindless.info.steam_alloy_smelter.4', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus.')

    add('emi.grindless.info.steam_blast_furnace.0', "The Steam Blast Furnace turns iron straight into steel: iron ore, ingots or dust with coke and calcite flux in, steel and ash out, four batches at a time.")
    add('emi.grindless.info.steam_blast_furnace.1', "It is the first source of steel in bulk. The hot blast runs on steam. The ash is slag: void it, or keep it for fertilizer at LV.")
    add('emi.grindless.info.steam_blast_furnace.2', 'Turns iron ore straight into steel: the furnace and the Primitive Blast Furnace in one. Takes raw or crushed iron ores, iron ingots and iron dust.')
    add('emi.grindless.info.steam_blast_furnace.3', '4 iron + 4 coke + 1 calcite flux (raw, dust or block) -> 4 steel + 1 ash. Runs 4 batches at once: about 5 steel a minute, as much as 6 or 7 Primitive Blast Furnaces.')
    add('emi.grindless.info.steam_blast_furnace.4', 'The hot blast is driven by steam: about 57 mB/t while it works. The ash is the slag: void it, or keep it for fertilizer at LV.')
    add('emi.grindless.info.steam_blast_furnace.5', 'Needs 1 steam input hatch, 1 steam input bus and 1 or 2 steam output buses in the hearth. Keep the shaft empty.')

    add('emi.grindless.info.steam_chemical_bath.0', "The Steam Chemical Bath runs the chemical bath recipes on steam, eight at a time: paper from wood dust or sugar cane, treated planks from creosote, dark concrete.")
    add('emi.grindless.info.steam_chemical_bath.1', "GTM has no single steam chemical bath, so this multiblock is the only way to use the type before LV. It needs a fluid input hatch.")
    add('emi.grindless.info.steam_chemical_bath.2', 'Runs the Chemical Bath recipe type with 8 parallels: paper from wood dust or sugar cane, treated planks from creosote, dark concrete.')
    add('emi.grindless.info.steam_chemical_bath.3', 'No single-block Steam Chemical Bath exists in GTM: this is the only way to use one before LV.')
    add('emi.grindless.info.steam_chemical_bath.4', 'Needs 1 steam input hatch, 1 steam input bus, 1 steam output bus and 1 fluid input hatch.')

    add('emi.grindless.info.steam_compressor.0', "The Steam Compressor runs the compressor recipes on steam, eight at a time: dusts into plates, items into blocks.")
    add('emi.grindless.info.steam_compressor.1', "It replaces the single steam compressor with the same steam limit and eight times the throughput. It needs a steam hatch, an input bus and an output bus.")
    add('emi.grindless.info.steam_compressor.2', 'Runs the Compressor recipe type with 8 parallels: dusts into plates, blocks from the base item, eight at a time.')
    add('emi.grindless.info.steam_compressor.3', 'Replaces the single-block Low/High Pressure Steam Compressor: same steam limit, same LV-tier cap, eight times the throughput.')
    add('emi.grindless.info.steam_compressor.4', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus.')

    add('emi.grindless.info.steam_forge_hammer.0', "The Steam Forge Hammer runs the forge hammer recipes on steam, eight at a time: ingots into plates, ore crushing.")
    add('emi.grindless.info.steam_forge_hammer.1', "It replaces the single steam forge hammer with the same steam limit and eight times the throughput. It needs a steam hatch, an input bus and an output bus.")
    add('emi.grindless.info.steam_forge_hammer.2', 'Runs the Forge Hammer recipe type with 8 parallels: ingots into plates, ore crushing, eight at a time.')
    add('emi.grindless.info.steam_forge_hammer.3', 'Replaces the single-block Low/High Pressure Steam Forge Hammer: same steam limit, same LV-tier cap, eight times the throughput.')
    add('emi.grindless.info.steam_forge_hammer.4', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus.')

    add('emi.grindless.info.steam_greenhouse.0', "The Steam Greenhouse grows trees, rubber trees and crops on steam: put a sapling or seed in the input bus and the harvest comes out. The plant is never used up.")
    add('emi.grindless.info.steam_greenhouse.1', "It runs several crops at once, with no planting and no felling. It is the hand-free source of wood, rubber and seeds before electricity. It needs a steam hatch, an input bus and an output bus.")

    add('emi.grindless.info.steam_mixer.0', "The Steam Mixer runs the mixer recipes on steam, eight at a time: bronze, brass, invar and the other dust alloys need no fluid at all.")
    add('emi.grindless.info.steam_mixer.1', "Add fluid hatches for glue, salt water or concrete. GTM has no single steam mixer, so this is the only way to mix before LV.")
    add('emi.grindless.info.steam_mixer.2', 'Runs the Mixer recipe type with 8 parallels: bronze, brass, invar and the other dust alloys need no fluid at all.')
    add('emi.grindless.info.steam_mixer.3', 'Add 1 or 2 fluid input hatches for glue, salt water, concrete or drilling fluid, and 1 fluid output hatch if the recipe gives one back.')
    add('emi.grindless.info.steam_mixer.4', 'No single-block Steam Mixer exists in GTM: this is the only way to mix before LV.')
    add('emi.grindless.info.steam_mixer.5', 'Needs 1 steam input hatch, 1 steam input bus and 1 steam output bus; the fluid hatches are optional.')

    add('emi.grindless.info.steam_ore_washer.0', "The Steam Ore Washer runs the ore washer recipes on steam, eight at a time: crushed ore washed clean with water.")
    add('emi.grindless.info.steam_ore_washer.1', "GTM has no single steam ore washer, so this is the only way to wash ore before LV. It needs a fluid input hatch for the water.")
    add('emi.grindless.info.steam_ore_washer.2', 'Runs the Ore Washer recipe type with 8 parallels: crushed ore washed clean with water, eight at a time.')
    add('emi.grindless.info.steam_ore_washer.3', 'No single-block Steam Ore Washer exists in GTM: this is the only way to wash ore before LV.')
    add('emi.grindless.info.steam_ore_washer.4', 'Needs 1 steam input hatch, 1 steam input bus, 1 steam output bus and 1 fluid input hatch.')

    add('emi.grindless.info.steam_vein_drill.0', "The Steam Vein Drill drills the vein marked by the vein sample, over and over: put the sample and drill bits in the input bus and raw ore comes out. The vein never runs dry.")
    add('emi.grindless.info.steam_vein_drill.1', "It runs several bores at once, one drill bit per run; the bits wear out by chance. It is where ore comes from in the steam age, with no hand mining.")
    add('emi.grindless.info.steam_vein_drill.2', "It needs 1 steam hatch, 1 steam input bus and 2 steam output buses.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.coking_battery.0', "La batería de coque con subproductos coquiza el carbón como el horno de coque, pero conserva el gas: entra carbón y salen coque, creosota y gas de hulla, cuatro cámaras a la vez, con vapor.")
    add('emi.grindless.info.coking_battery.1', "El gas de hulla es venenoso: guárdalo en tanques. Desde LV alimenta turbinas de gas y la destilería. Si su cubo de gas se llena, la batería se detiene.")
    add('emi.grindless.info.coking_battery.2', 'Coquiza el carbón como el horno de coque, pero se queda el gas: 1 de carbón -> 1 de coque + 500 mB de creosota + 125 mB de gas de hulla.')
    add('emi.grindless.info.coking_battery.3', 'Trabaja con 4 cámaras a la vez, tan rápido como 6 o 7 hornos de coque, y gasta unos 28 mB/t de vapor.')
    add('emi.grindless.info.coking_battery.4', 'El gas de hulla es venenoso: guárdalo en tanques. Desde LV alimenta las turbinas de gas y la destiladora. Si su escotilla se llena, la batería se para.')
    add('emi.grindless.info.coking_battery.5', 'Necesita 1 escotilla de vapor y 1 o 2 buses de salida de vapor en la base, y 1 bus de entrada de vapor y 2 escotillas de salida de fluidos en el techo.')

    add('emi.grindless.info.large_steam_macerator.0', "El macerador de vapor grande procesa las recetas del macerador con vapor, muchas a la vez: mena a mena triturada, mena triturada a polvo, con todos los subproductos por probabilidad. Sin electricidad.")
    add('emi.grindless.info.large_steam_macerator.1', "Es la recompensa por terminar la era del vapor: el primer paso de toda línea de minerales. Como todo multibloque de vapor, solo ejecuta recetas de voltaje LV o menos.")
    add('emi.grindless.info.large_steam_macerator.2', 'Corre las recetas de macerador de GTM con vapor, hasta 64 a la vez: mena a mena triturada, triturada a polvo, con todo subproducto por probabilidad incluido.')
    add('emi.grindless.info.large_steam_macerator.3', 'La recompensa por terminar vapor: un solo bloque tritura tanta mena como decenas de maceradores, sin electricidad.')
    add('emi.grindless.info.large_steam_macerator.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 2 buses de salida de vapor en algún punto de la carcasa.')

    add('emi.grindless.info.large_steam_ore_washer.0', "El lavador de menas de vapor grande procesa las recetas del lavador de menas con vapor, muchas a la vez: mena triturada y agua entran; salen mena purificada y polvo de piedra, con un subproducto por probabilidad.")
    add('emi.grindless.info.large_steam_ore_washer.1', "El agua entra por cualquier escotilla de entrada de fluido. Va después del macerador y antes de la centrifugadora térmica. Solo ejecuta recetas de voltaje LV o menos.")
    add('emi.grindless.info.large_steam_ore_washer.2', 'Corre las recetas de lavadora de mena de GTM con vapor, hasta 64 a la vez: mena triturada y agua entran, mena purificada y polvo de piedra salen, con un subproducto por probabilidad.')
    add('emi.grindless.info.large_steam_ore_washer.3', 'Admite cualquier escotilla de entrada de fluido, agua incluida: las recetas con agua destilada no piden ni un circuito.')
    add('emi.grindless.info.large_steam_ore_washer.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 2 buses de salida de vapor y 1 escotilla de entrada de fluido (de cualquier escalón) en la carcasa.')

    add('emi.grindless.info.large_steam_thermal_centrifuge.0', "La centrifugadora térmica de vapor grande procesa las recetas de la centrifugadora térmica con vapor, muchas a la vez: mena purificada o triturada pasa a su forma centrifugada, con la piedra y el polvo del subproducto.")
    add('emi.grindless.info.large_steam_thermal_centrifuge.1', "Es el último paso de la línea de minerales de vapor, tras el lavador. Solo ejecuta recetas de voltaje LV o menos: las más calientes esperan a la electricidad.")
    add('emi.grindless.info.large_steam_thermal_centrifuge.2', 'Corre las recetas de centrífuga térmica de GTM con vapor, hasta 64 a la vez: mena purificada o triturada directa a su forma centrifugada, con la piedra y el polvo subproducto.')
    add('emi.grindless.info.large_steam_thermal_centrifuge.3', 'Hace pareja con la lavadora de mena de al lado: primero se lava, luego se centrifuga lo que queda para no perder ningún subproducto.')
    add('emi.grindless.info.large_steam_thermal_centrifuge.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 2 buses de salida de vapor en algún punto de la carcasa.')

    add('emi.grindless.info.large_steam_centrifuge.0', "La centrifugadora de vapor grande procesa las recetas de la centrifugadora con vapor, muchas a la vez: separa polvos y subproductos de mena en sus componentes.")
    add('emi.grindless.info.large_steam_centrifuge.1', "Solo ejecuta recetas de voltaje LV o menos, así que las separaciones que piden más energía quedan fuera hasta LV. Necesita una escotilla de entrada y otra de salida de fluido.")
    add('emi.grindless.info.large_steam_centrifuge.2', 'Corre las recetas de centrífuga de GTM con vapor, hasta 64 a la vez: separaciones de polvo y subproductos de mena, lo que esté a voltaje LV o menos.')
    add('emi.grindless.info.large_steam_centrifuge.3', 'GTM no bloquea el tipo entero: casi todas las separaciones de polvo ya están en 32 EU/t o menos. Solo las más calientes (uranio, piedra luminosa...) quedan fuera de alcance.')
    add('emi.grindless.info.large_steam_centrifuge.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 2 buses de salida de vapor, 1 escotilla de entrada de fluido y 1 o 2 escotillas de salida de fluido (de cualquier escalón) en la carcasa.')

    add('emi.grindless.info.large_steam_chemical_bath.0', "El baño químico de vapor grande procesa las recetas del baño químico con vapor, muchas a la vez: papel de serrín, tablones tratados y menas bañadas en un fluido.")
    add('emi.grindless.info.large_steam_chemical_bath.1', "Solo ejecuta recetas de voltaje LV o menos. La mayoría de los baños de lingotes calientes piden más, así que esperan a la electricidad.")
    add('emi.grindless.info.large_steam_chemical_bath.2', 'Corre las recetas de baño químico de GTM con vapor, hasta 64 a la vez: papel desde polvo de madera, madera tratada y mena bañada en el fluido que pida la veta.')
    add('emi.grindless.info.large_steam_chemical_bath.3', 'Casi todos sus baños de lingote caliente piden mucho más que LV: aquí solo llegan los que el tope de vapor deja pasar.')
    add('emi.grindless.info.large_steam_chemical_bath.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 2 buses de salida de vapor, 1 escotilla de entrada de fluido y 1 escotilla de salida de fluido (de cualquier escalón) en la carcasa.')

    add('emi.grindless.info.steam_alloy_smelter.0', "El horno de aleaciones de vapor procesa las recetas del horno de aleaciones con vapor, ocho a la vez: dos lingotes o polvos se funden en un lingote de aleación.")
    add('emi.grindless.info.steam_alloy_smelter.1', "Sustituye al horno de aleaciones de vapor simple, con el mismo límite de vapor y ocho veces el rendimiento. Necesita una escotilla de vapor, un bus de entrada y uno de salida.")
    add('emi.grindless.info.steam_alloy_smelter.2', 'Corre el tipo de receta de la fundición de aleación con 8 paralelos: dos lingotes o polvos directos a un lingote de aleación, de ocho en ocho.')
    add('emi.grindless.info.steam_alloy_smelter.3', 'Sustituye a la fundición de aleación de vapor de un bloque (baja o alta presión): mismo límite de vapor, mismo tope de LV, ocho veces el rendimiento.')
    add('emi.grindless.info.steam_alloy_smelter.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor.')

    add('emi.grindless.info.steam_blast_furnace.0', "El alto horno de vapor convierte el hierro directamente en acero: entran mena, lingotes o polvo de hierro con coque y fundente de calcita, y salen acero y ceniza, cuatro lotes a la vez.")
    add('emi.grindless.info.steam_blast_furnace.1', "Es la primera fuente de acero en cantidad. El soplado caliente funciona con vapor. La ceniza es escoria: elimínala, o guárdala como fertilizante en LV.")
    add('emi.grindless.info.steam_blast_furnace.2', 'Convierte la mena de hierro directamente en acero: el horno y el alto horno primitivo en una sola máquina. Admite menas de hierro en bruto o trituradas, lingotes y polvo de hierro.')
    add('emi.grindless.info.steam_blast_furnace.3', '4 de hierro + 4 de coque + 1 de calcita como fundente (en bruto, en polvo o en bloque) -> 4 de acero + 1 de ceniza. Hace 4 cargas a la vez: unos 5 lingotes por minuto, lo mismo que 6 o 7 altos hornos primitivos.')
    add('emi.grindless.info.steam_blast_furnace.4', 'El viento caliente lo mueve el vapor: unos 57 mB/t mientras trabaja. La ceniza es la escoria: tírala o guárdala para el fertilizante de LV.')
    add('emi.grindless.info.steam_blast_furnace.5', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 o 2 buses de salida de vapor en el crisol. El hueco de dentro tiene que quedar vacío.')

    add('emi.grindless.info.steam_chemical_bath.0', "El baño químico de vapor procesa las recetas del baño químico con vapor, ocho a la vez: papel de serrín o caña de azúcar, tablones tratados con creosota, hormigón oscuro.")
    add('emi.grindless.info.steam_chemical_bath.1', "GTM no tiene un baño químico de vapor simple, así que este multibloque es la única forma de usar el tipo antes de LV. Necesita una escotilla de entrada de fluido.")
    add('emi.grindless.info.steam_chemical_bath.2', 'Corre el tipo de receta del baño químico con 8 paralelos: papel desde polvo de madera o caña de azúcar, madera tratada desde creosota, hormigón oscuro.')
    add('emi.grindless.info.steam_chemical_bath.3', 'GTM no tiene baño químico de vapor de un bloque: es la única forma de usarlo antes de LV.')
    add('emi.grindless.info.steam_chemical_bath.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 1 bus de salida de vapor y 1 escotilla de entrada de fluido.')

    add('emi.grindless.info.steam_compressor.0', "El compresor de vapor procesa las recetas del compresor con vapor, ocho a la vez: polvos a placas, objetos a bloques.")
    add('emi.grindless.info.steam_compressor.1', "Sustituye al compresor de vapor simple, con el mismo límite de vapor y ocho veces el rendimiento. Necesita una escotilla de vapor, un bus de entrada y uno de salida.")
    add('emi.grindless.info.steam_compressor.2', 'Corre el tipo de receta del compresor con 8 paralelos: polvos a chapas, bloques desde el objeto base, de ocho en ocho.')
    add('emi.grindless.info.steam_compressor.3', 'Sustituye al compresor de vapor de un bloque (baja o alta presión): mismo límite de vapor, mismo tope de LV, ocho veces el rendimiento.')
    add('emi.grindless.info.steam_compressor.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor.')

    add('emi.grindless.info.steam_forge_hammer.0', "El martillo de forja de vapor procesa las recetas del martillo de forja con vapor, ocho a la vez: lingotes a placas, trituración de menas.")
    add('emi.grindless.info.steam_forge_hammer.1', "Sustituye al martillo de forja de vapor simple, con el mismo límite de vapor y ocho veces el rendimiento. Necesita una escotilla de vapor, un bus de entrada y uno de salida.")
    add('emi.grindless.info.steam_forge_hammer.2', 'Corre el tipo de receta del martillo de forja con 8 paralelos: lingotes a chapas, triturado de mena, de ocho en ocho.')
    add('emi.grindless.info.steam_forge_hammer.3', 'Sustituye al martillo de forja de vapor de un bloque (baja o alta presión): mismo límite de vapor, mismo tope de LV, ocho veces el rendimiento.')
    add('emi.grindless.info.steam_forge_hammer.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor.')

    add('emi.grindless.info.steam_greenhouse.0', "El invernadero de vapor cultiva árboles, árboles de caucho y cultivos con vapor: pon un brote o una semilla en el bus de entrada y sale la cosecha. La planta nunca se gasta.")
    add('emi.grindless.info.steam_greenhouse.1', "Cultiva varias plantas a la vez, sin plantar ni talar. Es la fuente de madera, caucho y semillas sin trabajo manual antes de la electricidad. Necesita una escotilla de vapor, un bus de entrada y uno de salida.")

    add('emi.grindless.info.steam_mixer.0', "La mezcladora de vapor procesa las recetas de la mezcladora con vapor, ocho a la vez: el bronce, el latón, el invar y las demás aleaciones de polvo no necesitan fluido.")
    add('emi.grindless.info.steam_mixer.1', "Añade escotillas de fluido para pegamento, agua salada u hormigón. GTM no tiene una mezcladora de vapor simple, así que es la única forma de mezclar antes de LV.")
    add('emi.grindless.info.steam_mixer.2', 'Corre el tipo de receta del mezclador con 8 paralelos: el bronce, el latón, el invar y el resto de aleaciones en polvo no piden ningún fluido.')
    add('emi.grindless.info.steam_mixer.3', 'Añade 1 o 2 escotillas de entrada de fluido para la cola, el agua salada, el hormigón o el lodo de perforación, y 1 escotilla de salida si la receta devuelve un fluido.')
    add('emi.grindless.info.steam_mixer.4', 'GTM no tiene mezclador de vapor de un bloque: es la única forma de mezclar antes de LV.')
    add('emi.grindless.info.steam_mixer.5', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 bus de salida de vapor; las escotillas de fluido son opcionales.')

    add('emi.grindless.info.steam_ore_washer.0', "El lavador de menas de vapor procesa las recetas del lavador de menas con vapor, ocho a la vez: la mena triturada se lava con agua.")
    add('emi.grindless.info.steam_ore_washer.1', "GTM no tiene un lavador de vapor simple, así que es la única forma de lavar menas antes de LV. Necesita una escotilla de entrada de fluido para el agua.")
    add('emi.grindless.info.steam_ore_washer.2', 'Corre el tipo de receta de la lavadora de mineral con 8 paralelos: mena triturada lavada con agua, de ocho en ocho.')
    add('emi.grindless.info.steam_ore_washer.3', 'GTM no tiene lavadora de mineral de vapor de un bloque: es la única forma de lavar mena antes de LV.')
    add('emi.grindless.info.steam_ore_washer.4', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 1 bus de salida de vapor y 1 escotilla de entrada de fluido.')

    add('emi.grindless.info.steam_vein_drill.0', "La perforadora de vetas a vapor perfora la veta que marca la muestra, una y otra vez: pon la muestra y las brocas en el bus de entrada y sale mena en bruto. La veta nunca se agota.")
    add('emi.grindless.info.steam_vein_drill.1', "Trabaja con varias perforaciones a la vez, una broca por ciclo; las brocas se desgastan por probabilidad. Es de donde sale la mena en la era del vapor, sin minar a mano.")
    add('emi.grindless.info.steam_vein_drill.2', "Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 2 buses de salida de vapor.")
})
