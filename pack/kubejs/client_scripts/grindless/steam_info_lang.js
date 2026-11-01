// priority: 5450
// Gregtech Grindless - EMI information pages of the Steam era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Names and tooltips live in steam_small_family_lang.js, steam_large_family_lang.js and steam_content_lang.js; every key is in en_us.
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

