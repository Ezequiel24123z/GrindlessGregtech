// pl_steam: the steam age's lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
import { I, F, M, n } from './pl-lib.mjs';

export default {
  file: 'pl_steam',
  order: 0,
  title: 'Steam Lines',
  subtitle: 'Coal turns into coke and steel, and ore and wood start arriving without a pickaxe.',
  icon: 'gtceu:coke_oven',
  focus: 'coal',
  bands: [['coke', 'steel', 'sky'], ['drill', 'rubber'], ['glass'], ['ore']],
  clusters: {
    coke: {
      name: 'Coke and coal gas',
      nodes: [
        n('coal', 0, 0, I('minecraft:coal'), 'Coal', { kind: 'raw', desc: 'All the steel of the steam age starts as a lump of coal.' }),
        n('oven', 2, -1.5, M('gtceu:coke_oven'), 'Coke Oven', {
          from: ['coal'], sub: 'Coke and creosote; logs give charcoal',
          desc: 'The old faithful. One coal at a time, and the gas goes up the chimney.',
        }),
        n('battery', 2, 1.5, M('gtceu:coking_battery'), 'Coke Battery', {
          kind: 'ours', from: ['coal'],
          desc: ['Three chambers that coke like six ovens and keep the gas the oven loses.', 'It runs on steam and stops if the gas has nowhere to go.'],
        }),
        n('coke', 4, -1.5, I('gtceu:coke_gem'), 'Coke', { kind: 'product', from: ['oven', 'battery'], sub: 'Steel, and later the arc furnace' }),
        n('creosote', 4, 0, F('gtceu:creosote'), 'Creosote', { from: ['battery'], sub: 'Both ovens make it' }),
        n('coalgas', 4, 1.5, F('gtceu:coal_gas'), 'Coal Gas', {
          kind: 'by', from: ['battery'], end: 'tanks until LV',
          desc: 'Flammable and poisonous, so it goes in a tank. LV burns it in the gas turbine or splits it in the distillery.',
        }),
        n('planks', 6, -0.75, I('gtceu:treated_wood_planks'), 'Treated Planks', { kind: 'dest', from: ['creosote'], sub: 'Planks soaked in creosote' }),
        n('boiler', 6, 0.75, M('gtceu:lp_steam_liquid_boiler'), 'Liquid Boiler', { from: ['creosote'], sub: 'Creosote is boiler fuel' }),
      ],
    },
    steel: {
      name: 'Steel, two ways',
      nodes: [
        n('ingot', 0, -1.5, I('minecraft:iron_ingot'), 'Iron Ingot', { kind: 'raw' }),
        n('coke2', 0, 0, I('gtceu:coke_gem'), 'Coke', { kind: 'raw', sub: 'From the ovens' }),
        n('rawiron', 0, 1.5, I('minecraft:raw_iron'), 'Raw Iron', { kind: 'raw', sub: 'Or magnetite, hematite, goethite, limonite' }),
        n('calcite', 0, 3, I('gtceu:calcite_dust'), 'Calcite', { kind: 'raw', sub: 'The flux: raw, dust or block' }),
        n('pbf', 2, -0.75, M('gtceu:primitive_blast_furnace'), 'Primitive Blast Furnace', {
          from: ['ingot', 'coke2'],
          desc: 'Iron and coke in, steel out, one ingot at a time. Slow, but it never asks for steam.',
        }),
        n('sbf', 2, 2.25, M('gtceu:steam_blast_furnace'), 'Steam Blast Furnace', {
          kind: 'ours', from: ['coke2', 'rawiron', 'calcite'],
          desc: 'Takes the ore straight from the vein and hands back steel, four loads at once. It drinks a lot of steam for the favour.',
        }),
        n('steel', 4, 0.75, I('gtceu:steel_ingot'), 'Steel', { kind: 'product', from: ['pbf', 'sbf'] }),
        n('ash', 4, 2.75, I('gtceu:ash_dust'), 'Ash', {
          kind: 'by', from: ['sbf'], end: 'inert slag; LV fertilizer',
          desc: 'Lime from the flux and ash from the coke. Void it, or keep it: LV mixes it into fertilizer.',
        }),
      ],
    },
    sky: {
      name: 'The first Moon chart',
      nodes: [
        n('paper', 0, -0.75, I('minecraft:paper'), 'Paper', { kind: 'raw' }),
        n('coaldust', 0, 0.75, I('gtceu:coal_dust'), 'Coal Dust', { kind: 'raw', sub: 'The ink' }),
        n('obs', 2, 0, M('gtceu:steam_observatory'), 'Clockwork Observatory', {
          kind: 'ours', from: ['paper', 'coaldust'],
          desc: 'A clear night, the controller at Y 100 or higher, and it draws the Moon. Daylight or rain just make it wait.',
        }),
        n('chart', 4, 0, I('grindless:lunar_chart_draft'), 'Lunar Chart (Draft)', {
          kind: 'product', from: ['obs'], sub: 'LV\'s optical observatory reads it',
          desc: 'It\'s never used up. Copy it by hand if you want a spare.',
        }),
      ],
    },
    drill: {
      name: 'Ore without a pickaxe',
      nodes: [
        n('goethite', 0, -0.75, I('gtceu:raw_goethite'), 'Raw Goethite', { kind: 'raw', sub: 'Mined once, by hand', desc: 'Two raw ores from the iron vein, a probe, and that is the last time you swing a pickaxe at it.' }),
        n('probe', 0, 0.75, I('grindless:empty_vein_probe'), 'Empty Vein Probe', { kind: 'raw' }),
        n('sample', 2, 0, I('grindless:vein_sample_iron'), 'Iron Vein Sample', { from: ['goethite', 'probe'] }),
        n('bplate', 0, 2.25, I('gtceu:bronze_plate'), 'Bronze Plate', { kind: 'raw' }),
        n('bit', 2, 2.25, I('grindless:bronze_drill_bit'), 'Bronze Drill Bit', { from: ['bplate'], sub: 'Wears out now and then' }),
        n('drill', 4, 0.75, M('gtceu:steam_vein_drill'), 'Steam Vein Drill', {
          kind: 'ours', from: ['sample', 'bit'],
          desc: 'It drills the vein the sample names, forever, wherever you build it. The bit wears out; the sample never does.',
        }),
        n('goethite2', 6, 0, I('gtceu:raw_goethite'), 'Raw Goethite, Forever', { kind: 'ret', from: ['drill'], sub: 'With the vein\'s other ores' }),
        n('cobble', 6, 1.5, I('minecraft:cobblestone'), 'Cobblestone', { kind: 'by', from: ['drill'], end: 'inert', sub: 'Inert: void it, or crush it later' }),
      ],
    },
    rubber: {
      name: 'Rubber',
      nodes: [
        n('sapling', 0, 0, I('gtceu:rubber_sapling'), 'Rubber Sapling', { kind: 'raw', sub: 'Never used up' }),
        n('greenhouse', 2, 0, M('gtceu:steam_greenhouse'), 'Steam Greenhouse', {
          kind: 'ours', from: ['sapling'],
          desc: 'A sapling in, logs and resin out, and the sapling stays. Chopping trees was never the fun part.',
        }),
        n('log', 4, -1.25, I('gtceu:rubber_log'), 'Rubber Log', { kind: 'by', from: ['greenhouse'], end: 'planks, charcoal', sub: 'Planks, or charcoal in the coke oven' }),
        n('resin', 4, 0.25, I('gtceu:sticky_resin'), 'Sticky Resin', { from: ['greenhouse'] }),
        n('rawrubber', 6, 0.25, I('gtceu:raw_rubber_dust'), 'Raw Rubber', { from: ['resin'], sub: 'Steam extractor', by: ['gtceu:extractor'] }),
        n('rawsulfur', 4, 1.75, I('gtceu:raw_sulfur'), 'Raw Sulfur', { kind: 'raw', sub: 'From the Nether', desc: 'The steam age has no other sulfur. Pack a flint and steel.' }),
        n('sulfur', 6, 1.75, I('gtceu:sulfur_dust'), 'Sulfur', { from: ['rawsulfur'], sub: 'Any furnace' }),
        n('rubber', 8, 1, I('gtceu:rubber_ingot'), 'Rubber', { kind: 'product', from: ['rawrubber', 'sulfur'], sub: 'Steam alloy smelter', by: ['gtceu:alloy_smelter'], desc: 'Pressed into sheets, it insulates the cable that leaves the steam age.' }),
      ],
    },
    glass: {
      name: 'Glass and firebricks',
      nodes: [
        n('sand', 0, -1.5, I('minecraft:sand'), 'Sand', { kind: 'raw' }),
        n('qsand', 2, -1.5, I('gtceu:quartz_sand_dust'), 'Quartz Sand', { from: ['sand'], sub: 'Mortar or macerator' }),
        n('flint', 0, 0, I('minecraft:flint'), 'Flint', { kind: 'raw' }),
        n('flintdust', 2, 0, I('gtceu:flint_dust'), 'Flint Dust', { from: ['flint'] }),
        n('glassdust', 4, -0.75, I('gtceu:glass_dust'), 'Glass Dust', { from: ['qsand', 'flintdust'] }),
        n('mold', 4, 0.75, I('gtceu:block_casting_mold'), 'Block Casting Mold', { kind: 'raw', sub: 'Hammered from a steel mold', desc: 'Sand won\'t melt into glass here: the glass dust has to be cast. The mold is why glass waits for steel.' }),
        n('glass', 6, 0, I('minecraft:glass'), 'Glass', { kind: 'product', from: ['glassdust', 'mold'], sub: 'Steam alloy smelter', by: ['gtceu:alloy_smelter'] }),
        n('clay', 0, 2.25, I('minecraft:clay'), 'Clay', { kind: 'raw' }),
        n('brick', 0, 3.75, I('minecraft:brick'), 'Brick', { kind: 'raw' }),
        n('claydust', 2, 2.25, I('gtceu:clay_dust'), 'Clay Dust', { from: ['clay'] }),
        n('brickdust', 2, 3.75, I('gtceu:brick_dust'), 'Brick Dust', { from: ['brick'] }),
        n('fireclay', 4, 3, I('gtceu:fireclay_dust'), 'Fireclay Dust', { from: ['claydust', 'brickdust'] }),
        n('cfire', 6, 3, I('gtceu:compressed_fireclay'), 'Compressed Fireclay', { from: ['fireclay'], sub: 'Steam compressor', by: ['gtceu:compressor'] }),
        n('firebrick', 8, 3, I('gtceu:firebrick'), 'Firebrick', { from: ['cfire'], sub: 'Any furnace' }),
        n('firebricks', 10, 3, I('gtceu:firebricks'), 'Firebricks', { kind: 'product', from: ['firebrick'], sub: 'The blast furnaces are built from these' }),
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
