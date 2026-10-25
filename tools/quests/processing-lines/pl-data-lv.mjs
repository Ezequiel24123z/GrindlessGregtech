// pl_lv: the LV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
import { I, F, M, n, L, via } from './pl-lib.mjs';

export default {
  file: 'pl_lv',
  order: 1,
  title: 'LV Lines',
  subtitle: 'Sulfur becomes acid, air becomes gases, sapphire becomes aluminium, and the arc furnace makes silicon for AE2.',
  icon: 'gtceu:sulfide_roaster',
  focus: 'collector',
  bands: [['acid', 'roaster'], ['salt', 'aluminium', 'diodes'], ['arc', 'heliostat'], ['drillfluid', 'coalgas', 'fertilizer'], ['observatory', 'creatures']],
  clusters: {
    acid: {
      name: 'Sulfuric acid from sulfur',
      nodes: [
        n('collector', 0, 0, M('gtceu:lv_gas_collector'), 'Gas Collector', { sub: 'Breathes in the Overworld' }),
        n('air', 2, 0, F('gtceu:air'), 'Air', { from: ['collector'] }),
        n('o2', 4, -0.75, F('gtceu:oxygen'), 'Oxygen', { from: ['air'], sub: 'Centrifuge', by: ['gtceu:centrifuge'] }),
        n('n2', 4, 0.75, F('gtceu:nitrogen'), 'Nitrogen', { kind: 'by', from: ['air'], by: ['gtceu:centrifuge'], end: 'EBF, MV pyrolysis', sub: 'Aluminium in the EBF; MV pyrolysis runs faster with it' }),
        n('sulfur', 4, -2.25, I('gtceu:sulfur_dust'), 'Sulfur', { kind: 'raw', sub: 'The Nether, or realgar in the centrifuge' }),
        n('so2', 6, -1.5, F('gtceu:sulfur_dioxide'), 'Sulfur Dioxide', { from: ['sulfur', 'o2'], sub: 'Chemical reactor' }),
        n('so3', 8, -1.5, F('gtceu:sulfur_trioxide'), 'Sulfur Trioxide', { from: ['so2'], sub: 'More oxygen' }),
        n('acid', 10, -1.5, F('gtceu:sulfuric_acid'), 'Sulfuric Acid', {
          kind: 'product', from: ['so3'], sub: 'Add water',
          desc: 'GregTech\'s long way round: three reactors and a lot of oxygen. The sulfide roaster next door does it in one go.',
        }),
      ],
    },
    roaster: {
      name: 'Acid from ore',
      nodes: [
        n('pyrite', 0, -1.5, I('gtceu:pyrite_dust'), 'Pyrite Dust', { kind: 'raw' }),
        n('galena', 0, 0, I('gtceu:galena_dust'), 'Galena Dust', { kind: 'raw', sub: 'Sphalerite, stibnite and tetrahedrite work too' }),
        n('air2', 0, 1.5, F('gtceu:air'), 'Air', { kind: 'raw', sub: 'Gas collector' }),
        n('vanadium', 0, 3, I('gtceu:vanadium_dust'), 'Vanadium', { kind: 'raw', sub: 'Centrifuged vanadium magnetite' }),
        n('diatomite', 0, 4.5, I('gtceu:diatomite_dust'), 'Diatomite', { kind: 'raw' }),
        n('catalyst', 2, 3.75, I('grindless:contact_catalyst'), 'Contact Catalyst', { from: ['vanadium', 'diatomite'], sub: 'Mixer; wears out now and then' }),
        n('roaster', 4, 0.75, M('gtceu:sulfide_roaster'), 'Sulfide Roaster', {
          kind: 'ours', from: ['pyrite', 'galena', 'air2', 'catalyst'],
          desc: ['Roasts sulfide ore in air and turns the fumes straight into acid, with steam on the side.', 'What the EBF does with bottled oxygen, it does with air and one machine.'],
        }),
        n('acid2', 6.5, -2.25, F('gtceu:sulfuric_acid'), 'Sulfuric Acid', { kind: 'product', from: ['roaster'] }),
        n('steam', 6.5, -0.75, F('gtceu:steam'), 'Steam', { from: ['roaster'], sub: 'Heat you would otherwise lose' }),
        n('hematite', 6.5, 0.75, I('gtceu:hematite_dust'), 'Hematite', { kind: 'by', from: ['roaster'], end: 'smelts to iron', sub: 'From pyrite: smelt it for iron' }),
        n('massicot', 6.5, 2.25, I('gtceu:massicot_dust'), 'Massicot', { from: ['roaster'], sub: 'From galena' }),
        n('silver', 6.5, 3.75, I('gtceu:silver_nugget'), 'Silver Nugget', { from: ['roaster'], sub: 'Also from galena' }),
        n('turbine', 8.5, -0.75, M('gtceu:lv_steam_turbine'), 'Steam Turbine', { from: ['steam'] }),
        n('lead', 8.5, 2.25, I('gtceu:lead_dust'), 'Lead', { kind: 'dest', from: ['massicot'], by: ['gtceu:electrolyzer'], sub: 'Electrolyzer' }),
        n('silveringot', 8.5, 3.75, I('gtceu:silver_ingot'), 'Silver', { kind: 'dest', from: ['silver'], sub: 'Mirrors and photographic plates' }),
      ],
    },
    salt: {
      name: 'Salt, persulfate and iron chloride',
      nodes: [
        n('acid3', 0, -0.75, F('gtceu:sulfuric_acid'), 'Sulfuric Acid', { kind: 'raw', sub: 'Either acid line' }),
        n('salt', 0, 0.75, I('gtceu:salt_dust'), 'Salt', { kind: 'raw' }),
        n('cr', 2, 0, M('gtceu:lv_chemical_reactor'), 'Chemical Reactor', { from: ['acid3', 'salt'] }),
        n('bisulfate', 4, -0.75, I('gtceu:sodium_bisulfate_dust'), 'Sodium Bisulfate', { from: ['cr'] }),
        n('hcl', 4, 0.75, F('gtceu:hydrochloric_acid'), 'Hydrochloric Acid', { from: ['cr'] }),
        n('persulfate', 6, -1.5, F('gtceu:sodium_persulfate'), 'Sodium Persulfate', {
          kind: 'product', from: ['bisulfate'], by: ['gtceu:electrolyzer'], sub: 'Electrolyzer',
          desc: 'Etches circuit boards and washes a few stubborn ores. You will want more than you think.',
        }),
        n('h2', 6, 0, F('gtceu:hydrogen'), 'Hydrogen', {
          kind: 'by', from: ['bisulfate', 'hcl'], end: 'tank, MV methanol',
          desc: 'Both reactions leave hydrogen behind. It burns, so tank it: MV turns it into methanol.',
        }),
        n('iron', 4, 2.25, I('gtceu:iron_dust'), 'Iron Dust', { kind: 'raw' }),
        n('fecl3', 6, 1.5, F('gtceu:iron_iii_chloride'), 'Iron III Chloride', { kind: 'product', from: ['hcl', 'iron'], sub: 'The other board etchant' }),
      ],
    },
    aluminium: {
      name: 'Sapphire to aluminium',
      nodes: [
        n('rawsapphire', 0, 0, I('gtceu:raw_sapphire'), 'Raw Sapphire', { kind: 'raw', sub: 'Deep vein, steel drill bit' }),
        n('sapphire', 2, 0, I('gtceu:sapphire_dust'), 'Sapphire Dust', { from: [via('rawsapphire', 'gtceu:crushed_sapphire_ore', 'gtceu:impure_sapphire_dust')], sub: 'Macerator, then centrifuge' }),
        n('electrolyzer', 4, 0, M('gtceu:lv_electrolyzer'), 'Electrolyzer', { from: ['sapphire'] }),
        n('aldust', 6, -0.75, I('gtceu:aluminium_dust'), 'Aluminium Dust', { from: ['electrolyzer'] }),
        n('o2b', 6, 0.75, F('gtceu:oxygen'), 'Oxygen', { kind: 'by', from: ['electrolyzer'], end: 'EBF steel', sub: 'Steel in the EBF' }),
        n('ebf', 8, -0.75, M('gtceu:electric_blast_furnace'), 'Electric Blast Furnace', { from: ['aldust'], sub: 'Cupronickel coils are hot enough' }),
        n('alingot', 10, -0.75, I('gtceu:aluminium_ingot'), 'Aluminium', { from: ['ebf'] }),
        n('mvhull', 12, -0.75, I('gtceu:mv_machine_hull'), 'MV Machine Hull', {
          kind: 'product', from: [via('alingot', 'gtceu:aluminium_plate', 'gtceu:mv_machine_casing')],
          desc: 'The whole point of the sapphire. Every MV machine starts here.',
        }),
      ],
    },
    diodes: {
      name: 'Gallium arsenide',
      nodes: [
        n('sphalerite', 0, -0.75, I('gtceu:sphalerite_dust'), 'Sphalerite Dust', { kind: 'raw' }),
        n('realgar', 0, 0.75, I('gtceu:realgar_dust'), 'Realgar Dust', { kind: 'raw' }),
        n('gallium', 2, -0.75, I('gtceu:gallium_dust'), 'Gallium', { from: ['sphalerite'], by: ['gtceu:electrolyzer'], sub: 'Electrolyzer, a little at a time' }),
        n('arsenic', 2, 0.75, I('gtceu:arsenic_dust'), 'Arsenic', { from: ['realgar'], by: ['gtceu:centrifuge'], sub: 'Centrifuge' }),
        n('sulfur2', 2, 2.25, I('gtceu:sulfur_dust'), 'Sulfur', { kind: 'by', from: ['realgar'], by: ['gtceu:centrifuge'], end: 'acid, rubber', sub: 'Acid and rubber' }),
        n('gaas', 4, 0, I('gtceu:gallium_arsenide_dust'), 'Gallium Arsenide', { from: ['gallium', 'arsenic'], sub: 'Mixer' }),
        n('diode', 6, 0, I('gtceu:diode'), 'Diode', {
          kind: 'product', from: [via('gaas', 'gtceu:small_gallium_arsenide_dust')], sub: 'Assembler',
          desc: 'A pinch of gallium arsenide per diode, and the good circuits of LV are open.',
        }),
      ],
    },
    arc: {
      name: 'Submerged arc furnace',
      nodes: [
        n('qsand', 0, -1.5, I('gtceu:quartz_sand_dust'), 'Quartz Sand', { kind: 'raw' }),
        n('cokedust', 0, 0, I('gtceu:coke_dust'), 'Coke Dust', { kind: 'raw' }),
        n('electrode', 0, 1.5, I('grindless:graphite_electrode'), 'Graphite Electrode', { kind: 'raw', sub: 'Wears out now and then' }),
        n('cobble', 0, 3, I('minecraft:cobblestone'), 'Cobblestone', { kind: 'raw', sub: 'With water' }),
        n('saf', 2.5, 0.75, M('gtceu:submerged_arc_furnace'), 'Submerged Arc Furnace', {
          kind: 'ours', from: ['qsand', 'cokedust', 'electrode', 'cobble'],
          desc: 'Reduces quartz with carbon at LV, which no single block can do. The silicon is AE2\'s: GregTech\'s waits for the MV EBF.',
        }),
        n('silicon', 5, -1.5, I('ae2:silicon'), 'Silicon (AE2)', { kind: 'product', from: ['saf'], sub: 'Printed silicon, processors' }),
        n('co2', 5, 0, F('gtceu:carbon_dioxide'), 'Carbon Dioxide', { kind: 'by', from: ['saf'], end: 'inert; LV greenhouse', sub: 'Inert: void it, or feed the LV greenhouse' }),
        n('ash2', 5, 1.5, I('gtceu:ash_dust'), 'Ash', { kind: 'by', from: ['saf'], end: 'fertilizer', sub: 'Fertilizer' }),
        n('obsidian', 5, 3, I('minecraft:obsidian'), 'Obsidian', { from: ['saf'] }),
        n('obsdust', 7, 3, I('gtceu:obsidian_dust'), 'Obsidian Dust', { from: ['obsidian'], sub: 'Macerator; the enderman model eats it too' }),
        n('sky', 9, 3, I('ae2:sky_dust'), 'Sky Stone Dust', {
          kind: 'product', from: ['obsdust'], by: ['gtceu:arc_smelting'], sub: 'Back in the arc furnace',
          desc: 'Obsidian, quartz sand and a charged certus crystal melted together: a meteorite impact, minus the meteorite.',
        }),
      ],
    },
    heliostat: {
      name: 'Steam from sunlight',
      nodes: [
        n('water', 0, 0, F('minecraft:water'), 'Water', { kind: 'raw' }),
        n('tower', 2, 0, M('gtceu:heliostat_tower'), 'Heliostat Tower', {
          kind: 'ours', from: ['water'],
          desc: 'Twenty-eight mirrors aim the sun at a boiler on a tower: steam with no fuel at all. At night it sulks, so keep a tank of steam.',
        }),
        n('steam2', 4, 0, F('gtceu:steam'), 'Steam', { from: ['tower'] }),
        n('turbine2', 6, 0, M('gtceu:lv_steam_turbine'), 'Steam Turbine', { from: ['steam2'] }),
        n('dwater', 8, 0, F('gtceu:distilled_water'), 'Distilled Water, Back Up', {
          kind: 'ret', from: ['turbine2'], sub: 'Into the tower again',
          desc: 'The turbine hands back exactly the water the tower needs, so the loop closes on its own.',
        }),
        n('silveringot2', 0, 2, I('gtceu:silver_ingot'), 'Silver', { kind: 'raw', sub: 'Galena, or the roaster' }),
        n('foil', 2, 2, I('gtceu:silver_foil'), 'Silver Foil', { from: ['silveringot2'] }),
        n('mirror', 4, 2, I('grindless:heliostat_mirror'), 'Heliostat Mirror', { kind: 'dest', from: ['foil'], sub: 'The tower\'s field', by: ['gtceu:assembler'] }),
      ],
    },
    drillfluid: {
      name: 'Drilling fluid',
      nodes: [
        L('creosote', 0, -0.75, 'pl_steam:creosote'),
        n('lube', 2, -0.75, F('gtceu:lubricant'), 'Lubricant', { from: ['creosote'], sub: 'Distillery' }),
        n('stonedust', 2, 0.75, I('gtceu:stone_dust'), 'Stone Dust', { kind: 'raw' }),
        n('dfluid', 4, 0, F('gtceu:drilling_fluid'), 'Drilling Fluid', { from: ['lube', 'stonedust'], sub: 'Mixer, with water' }),
        n('bit', 4, -1.75, I('grindless:steel_drill_bit'), 'Steel Drill Bit', { kind: 'raw' }),
        n('sample', 4, 1.75, I('grindless:vein_sample_iron'), 'Vein Sample', { kind: 'raw', sub: 'Any vein' }),
        n('lvdrill', 6.25, 0, M('gtceu:lv_vein_drill'), 'LV Vein Drill', {
          kind: 'ours', from: ['dfluid', 'bit', 'sample'],
          desc: 'Drilling fluid buys half again the ore and half the bit wear. The fluid is made from the drill\'s own stone, which is a pleasing sort of circle.',
        }),
        n('ore', 8.5, -0.75, I('gtceu:raw_goethite'), 'Raw Ore', { kind: 'product', from: ['lvdrill'] }),
        n('cobble2', 8.5, 0.75, I('minecraft:cobblestone'), 'Cobblestone', { from: ['lvdrill'] }),
        n('stonedust2', 10.5, 0.75, I('gtceu:stone_dust'), 'Stone Dust, Back In', { kind: 'ret', from: ['cobble2'], by: ['gtceu:macerator'], recycle: true, sub: 'Macerator, then the mixer again' }),
      ],
    },
    coalgas: {
      name: 'Coal gas',
      nodes: [
        L('coalgas', 0, 0, 'pl_steam:coalgas'),
        n('gasturbine', 2, -1.5, M('gtceu:lv_gas_turbine'), 'Gas Turbine', { from: ['coalgas'], sub: 'Burns it for power' }),
        n('distillery', 2, 1.5, M('gtceu:lv_distillery'), 'Distillery', { from: ['coalgas'], sub: 'One fraction per circuit' }),
        n('coaltar', 4, 0.75, F('gtceu:coal_tar'), 'Coal Tar', { kind: 'by', from: ['distillery'], end: 'distillery again', sub: 'Distil it again: creosote, phenol, naphthalene' }),
        n('ammonia', 4, 2.25, F('gtceu:ammonia'), 'Ammonia', { kind: 'by', from: ['distillery'], end: 'nitric oxide', sub: 'Burnt with oxygen, it starts nitric acid' }),
        n('cokedust2', 4, 3.75, I('gtceu:coke_dust'), 'Coke Dust', { kind: 'by', from: ['distillery'], end: 'arc furnace', sub: 'The arc furnace\'s carbon' }),
      ],
    },
    fertilizer: {
      name: 'Ash becomes fertilizer',
      nodes: [
        L('ash', 0, 0, 'pl_steam:ash'),
        n('calcite', 0, 1.5, I('gtceu:calcite_dust'), 'Calcite', { kind: 'raw' }),
        n('fert', 2, 0.75, I('gtceu:fertilizer'), 'Fertilizer', { from: ['ash', 'calcite'], by: ['gtceu:chemical_reactor'], sub: 'Chemical reactor, with water' }),
        n('sapling', 2, 2.25, I('minecraft:oak_sapling'), 'Sapling', { kind: 'raw', sub: 'Never used up' }),
        n('gh', 4, 1.5, M('gtceu:lv_greenhouse'), 'LV Greenhouse', {
          kind: 'ours', from: ['fert', 'sapling'],
          desc: 'Twice the steam greenhouse, and fertilizer doubles it again. The steam age\'s slag ends up as wood.',
        }),
        n('logs', 6, 1.5, I('minecraft:oak_log'), 'Logs', { kind: 'product', from: ['gh'] }),
      ],
    },
    observatory: {
      name: 'The photographic Moon',
      nodes: [
        L('chart', 0, -0.75, 'pl_steam:chart'),
        n('paper', 2, -1.5, I('minecraft:paper'), 'Paper', { kind: 'raw' }),
        n('pane', 0, 0.75, I('gtceu:glass_plate'), 'Glass Plate', { kind: 'raw' }),
        n('silverdust', 0, 2.25, I('gtceu:small_silver_dust'), 'Small Pile of Silver Dust', { kind: 'raw', sub: 'The emulsion' }),
        n('plate', 2, 1.5, I('grindless:photographic_plate'), 'Photographic Plate', { from: ['pane', 'silverdust'], sub: 'Assembler' }),
        n('optical', 4, 0, M('gtceu:optical_observatory'), 'Optical Observatory', {
          kind: 'ours', from: ['chart', 'paper', 'plate'],
          desc: 'Long exposures on clear nights, at any height. The steam age\'s chart guides it and stays in one piece.',
        }),
        n('map', 6, -0.75, I('grindless:lunar_map'), 'Photographic Lunar Map', { kind: 'product', from: ['optical'] }),
        n('ephemeris', 6, 0.75, I('grindless:lunar_ephemeris'), 'Lunar Ephemeris', { kind: 'product', from: ['optical'], sub: 'Where the Moon will be' }),
      ],
    },
    creatures: {
      name: 'Drops without a sword',
      nodes: [
        n('beetroot', 0, -0.75, I('minecraft:beetroot'), 'Crops', { kind: 'raw', sub: 'Any crop the greenhouse grows' }),
        n('biomass', 2, -0.75, F('gtceu:biomass'), 'Biomass', { from: ['beetroot'], sub: 'Brewery' }),
        n('obsdust2', 2, 0.75, I('gtceu:obsidian_dust'), 'Obsidian Dust', { kind: 'raw' }),
        n('model', 2, 2.25, I('grindless:creature_model_enderman'), 'Enderman Model', { kind: 'raw', sub: 'Printed once, never used up' }),
        n('sim', 4, 0.75, M('gtceu:lv_creature_simulator'), 'Creature Simulator', {
          from: ['biomass', 'obsdust2', 'model'],
          desc: 'Feed it the model, biomass and whatever the creature is made of, and the drops come out. Nobody gets hurt.',
        }),
        n('pearl', 6, 0.75, I('minecraft:ender_pearl'), 'Ender Pearl', { kind: 'product', from: ['sim'] }),
      ],
    },
  },
};
