// pl_steam: the steam age's lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// S1 ironworks (ore to Bessemer steel, 6 steps), S2 refractories (5), S3 ore dressing (4); the glass chain is short and stays.
import { I, F, M, n } from './pl-lib.mjs';

export default {
  file: 'pl_steam',
  order: 0,
  title: 'Steam Lines',
  subtitle: 'Coal turns into coke and steel, and ore arrives without a pickaxe.',
  icon: 'gtceu:coke_oven',
  focus: 'coal',
  bands: [['ironworks'], ['fireclay', 'glass'], ['ore']],
  clusters: {
    ironworks: {
      name: 'Ironworks: ore to Bessemer steel',
      nodes: [
        n('coal', 0, -3, I('minecraft:coal'), 'Coal', { kind: 'raw', desc: 'All the steel of the steam age starts as a lump of coal.' }),
        n('oven', 2, -4.5, M('gtceu:coke_oven'), 'Coke Oven', {
          from: ['coal'], sub: 'Coke and creosote; logs give charcoal',
          desc: 'The old faithful. One coal at a time, and the gas goes up the chimney.',
        }),
        n('battery', 2, -1.5, M('gtceu:coking_battery'), 'Coke Battery', {
          kind: 'ours', from: ['coal'],
          desc: ['Three chambers that coke like six ovens and keep the gas the oven loses.', 'It runs on steam and stops if the gas has nowhere to go.'],
        }),
        n('coke', 4, -3, I('gtceu:coke_gem'), 'Coke', { from: ['oven', 'battery'], sub: 'Fuel and reducing agent of the steelworks' }),
        n('creosote', 4, -6, F('gtceu:creosote'), 'Creosote', { from: ['battery'], sub: 'Both ovens make it' }),
        n('coalgas', 4, 0, F('gtceu:coal_gas'), 'Coal Gas', {
          kind: 'by', from: ['battery'], end: 'tanks until LV',
          desc: 'Flammable and poisonous, so it goes in a tank. LV burns it in the gas turbine or splits it in the distillery.',
        }),
        n('planks', 6, -6.5, I('gtceu:treated_wood_planks'), 'Treated Planks', { kind: 'dest', from: ['creosote'], sub: 'Planks soaked in creosote' }),
        n('boiler', 6, -5, M('gtceu:lp_steam_liquid_boiler'), 'Liquid Boiler', { from: ['creosote'], sub: 'Creosote is boiler fuel' }),
        n('sample', 4, 3, I('grindless:vein_sample_iron'), 'Iron Vein Sample', { kind: 'raw', sub: 'A probe on the iron vein', desc: 'Two raw ores from the iron vein and an empty probe make it. After that nobody swings a pickaxe at iron again.' }),
        n('bit', 4, 4.5, I('grindless:bronze_drill_bit'), 'Bronze Drill Bit', { kind: 'raw', sub: 'Wears out now and then' }),
        n('drill', 6, 3.75, M('gtceu:steam_vein_drill'), 'Steam Vein Drill', {
          kind: 'ours', from: ['sample', 'bit'],
          desc: 'It drills the vein the sample names, forever, wherever you build it. The bit wears out; the sample never does.',
        }),
        n('cobble', 8, 5.25, I('minecraft:cobblestone'), 'Cobblestone', { kind: 'by', from: ['drill'], end: 'inert', sub: 'Inert: void it, or crush it later' }),
        n('raw', 8, 3.75, I('gtceu:raw_goethite'), 'Raw Goethite, Forever', { from: ['drill'], sub: 'With the vein\'s other ores' }),
        n('crushed', 10, 3.75, I('gtceu:crushed_goethite_ore'), 'Crushed Goethite', { from: ['raw'], sub: 'Macerator', by: ['gtceu:macerator'] }),
        n('purified', 12, 3.75, I('gtceu:purified_goethite_ore'), 'Purified Goethite', { from: ['crushed'], sub: 'Ore washer', by: ['gtceu:ore_washer'] }),
        n('cokedust', 10, -1.5, I('gtceu:coke_dust'), 'Coke Dust', { from: ['coke'], sub: 'Macerator', by: ['gtceu:macerator'] }),
        n('sinter', 14, 2, I('grindless:iron_sinter'), 'Iron Sinter', {
          from: ['purified', 'cokedust'], sub: 'Alloy smelter', by: ['gtceu:alloy_smelter'],
          desc: 'Purified ore and coke dust baked into lumps the furnace can swallow. Any iron ore sinters the same way.',
        }),
        n('calcite', 14, -1, I('gtceu:calcite_dust'), 'Calcite', { kind: 'raw', sub: 'The flux: raw, dust or block' }),
        n('pig', 16, 1, I('grindless:pig_iron'), 'Pig Iron', {
          from: ['sinter', 'coke', 'calcite'], sub: 'Steam blast furnace', by: ['gtceu:steelmaking'],
          desc: 'Sinter, coke and flux in the steam blast furnace: four loads at once, and it drinks a lot of steam for the favour.',
        }),
        n('steel', 18, 1, I('gtceu:steel_ingot'), 'Steel', { kind: 'product', from: ['pig'], sub: 'Bessemer blow, same furnace', by: ['gtceu:steelmaking'] }),
        n('ash', 18, 2.5, I('gtceu:ash_dust'), 'Ash', {
          kind: 'by', from: ['pig'], end: 'inert slag; LV fertilizer',
          desc: 'Lime from the flux and ash from the coke. Void it, or keep it: LV mixes it into fertilizer.',
        }),
      ],
    },
    fireclay: {
      name: 'Refractories: clay to firebricks',
      nodes: [
        n('clay', 0, 0, I('minecraft:clay'), 'Clay', { kind: 'raw' }),
        n('brick', 0, 1.5, I('minecraft:brick'), 'Brick', { kind: 'raw' }),
        n('claydust', 2, 0, I('gtceu:clay_dust'), 'Clay Dust', { from: ['clay'] }),
        n('brickdust', 2, 1.5, I('gtceu:brick_dust'), 'Brick Dust', { from: ['brick'] }),
        n('fireclay', 4, 0.75, I('gtceu:fireclay_dust'), 'Fireclay Dust', { from: ['claydust', 'brickdust'] }),
        n('cfire', 6, 0.75, I('gtceu:compressed_fireclay'), 'Compressed Fireclay', { from: ['fireclay'], sub: 'Steam compressor', by: ['gtceu:compressor'] }),
        n('firebrick', 8, 0.75, I('gtceu:firebrick'), 'Firebrick', { from: ['cfire'], sub: 'Any furnace' }),
        n('firebricks', 10, 0.75, I('gtceu:firebricks'), 'Firebricks', { kind: 'product', from: ['firebrick'], sub: 'The blast furnaces are built from these' }),
      ],
    },
    glass: {
      name: 'Glass',
      nodes: [
        n('sand', 0, -1.5, I('minecraft:sand'), 'Sand', { kind: 'raw' }),
        n('qsand', 2, -1.5, I('gtceu:quartz_sand_dust'), 'Quartz Sand', { from: ['sand'], sub: 'Mortar or macerator' }),
        n('flint', 0, 0, I('minecraft:flint'), 'Flint', { kind: 'raw' }),
        n('flintdust', 2, 0, I('gtceu:flint_dust'), 'Flint Dust', { from: ['flint'] }),
        n('glassdust', 4, -0.75, I('gtceu:glass_dust'), 'Glass Dust', { from: ['qsand', 'flintdust'] }),
        n('mold', 4, 0.75, I('gtceu:block_casting_mold'), 'Block Casting Mold', { kind: 'raw', sub: 'Hammered from a steel mold', desc: 'Sand won\'t melt into glass here: the glass dust has to be cast. The mold is why glass waits for steel.' }),
        n('glass', 6, 0, I('minecraft:glass'), 'Glass', { kind: 'product', from: ['glassdust', 'mold'], sub: 'Steam alloy smelter', by: ['gtceu:alloy_smelter'] }),
      ],
    },
    ore: {
      name: 'Ore at plant scale',
      nodes: [
        n('rawcopper', 0, 0, I('minecraft:raw_copper'), 'Raw Copper', { kind: 'raw', sub: 'Or any other raw ore' }),
        n('lmac', 2, 0, M('gtceu:large_steam_macerator'), 'Large Steam Macerator', {
          from: ['rawcopper'],
          desc: 'The Large Steam family runs GregTech\'s whole ore chain on steam, every byproduct included. Give each byproduct a chest, or the line backs up.',
        }),
        n('crushed', 4, 0, I('gtceu:crushed_copper_ore'), 'Crushed Copper Ore', { from: ['lmac'] }),
        n('cobalt', 4, 1.5, I('gtceu:cobalt_dust'), 'Cobalt', { kind: 'by', from: ['lmac'], end: 'LV cobalt brass', sub: 'Saved for LV\'s cobalt brass' }),
        n('lwash', 6, 0, M('gtceu:large_steam_ore_washer'), 'Large Steam Ore Washer', { from: ['crushed'] }),
        n('purified', 8, 0, I('gtceu:purified_copper_ore'), 'Purified Copper Ore', { from: ['lwash'] }),
        n('stone', 8, 1.5, I('gtceu:stone_dust'), 'Stone Dust', { kind: 'by', from: ['lwash'], end: 'inert', sub: 'Inert: void it' }),
        n('lthermal', 10, 0, M('gtceu:large_steam_thermal_centrifuge'), 'Large Steam Thermal Centrifuge', { from: ['purified'] }),
        n('refined', 12, 0, I('gtceu:refined_copper_ore'), 'Refined Copper Ore', { from: ['lthermal'] }),
        n('gold', 12, 1.5, I('gtceu:gold_dust'), 'Gold', { kind: 'by', from: ['lthermal'], end: 'electrum, circuits', sub: 'Electrum and circuits later' }),
        n('copper', 14, 0, I('gtceu:copper_dust'), 'Copper Dust', { kind: 'product', from: ['refined'], sub: 'Back through the macerator', by: ['gtceu:macerator'] }),
        n('nickel', 14, 1.5, I('gtceu:nickel_dust'), 'Nickel', { kind: 'by', from: ['refined'], end: 'LV cupronickel', sub: 'Cupronickel coils at LV' }),
      ],
    },
  },
};
