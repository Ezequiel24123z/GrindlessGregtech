// priority: 7140
// Gregtech Grindless - EMI information pages of the LV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in lv_multis_lang.js, lv_mega_wire_works_lang.js and wireless_energy_lang.js; every key is in en_us.
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
    add('emi.grindless.info.wireless_energy_tower.1', "Wireless dynamo hatches and covers put EU in; wireless energy hatches and covers at or below the network's tier (its strongest cell) take it out. With no tower formed, nothing moves. Swapping a cell unforms the tower; the stored EU stays.")
    add('emi.grindless.info.wireless_energy_tower.2', 'The store of the wireless network: one network for every world. Each formed tower adds what its capacitor cells hold, and towers add up.')
    add('emi.grindless.info.wireless_energy_tower.3', 'Its 32 cell slots take capacitor cells of any tier, or its steel casing for an empty slot. The network sends EU out at the tier of the strongest cell in any formed tower: one MAX cell feeds every hatch and cover of every tier.')
    add('emi.grindless.info.wireless_energy_tower.4', 'Wireless dynamo hatches and covers put EU in (5% is lost on the way in); wireless energy hatches and covers at or below the network\'s tier take it out. With no tower formed, nothing moves.')
    add('emi.grindless.info.wireless_energy_tower.5', 'Swapping a cell unforms the tower; the stored EU stays in the network. No hatches: everything comes and goes wirelessly.')

    add('emi.grindless.info.wireless_energy_hatch.0', "The Wireless Energy Hatch is an energy input for multiblocks with no cable: the wireless network fills it, as long as a formed tower holds a cell of its tier or higher (a MAX cell feeds every tier). It comes in every tier from LV to UIV, at 2 A (the plain one), 4 A, 16 A and 64 A.")
    add('emi.grindless.info.wireless_energy_hatch.1', "The network is one for every world, stored in Wireless Energy Towers; with no tower formed, nothing moves. Its chunk must be loaded. Shift + right-click with an empty hand reads the network's EU and flow.")

    add('emi.grindless.info.wireless_dynamo_hatch.0', "The Wireless Dynamo Hatch is the energy output of generator multiblocks with no cable: everything it gets goes into the wireless network, with 5% lost on the way in. It comes in every tier from LV to UIV, at 2 A (the plain one), 4 A, 16 A and 64 A.")
    add('emi.grindless.info.wireless_dynamo_hatch.1', "The 64 A ones go in any generator multiblock. The EU is stored in Wireless Energy Towers, and wireless energy hatches and covers take it out. With no tower formed, nothing moves.")

    add('emi.grindless.info.creature_simulator.0', "The Creature Simulator yields a creature's drops without a creature. Put the creature model (never used up), the creature's mineral and biomass in; the programmed circuit picks the drops, circuit 1 being all of them. Nobody gets hurt.")
    add('emi.grindless.info.creature_simulator.1', "It comes in LV, MV, HV and EV. A creature of a higher tier needs a simulator of that tier or better. Models are printed from a blank model in an assembler.")
})

