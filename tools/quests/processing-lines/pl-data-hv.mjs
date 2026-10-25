// pl_hv: the HV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
import { I, F, M, n, L, via } from './pl-lib.mjs';

export default {
  file: 'pl_hv',
  order: 3,
  title: 'HV Lines',
  subtitle: 'Crude oil goes through the refinery, hydrogen comes from carbon, and the rocket\'s parts get cured and fired.',
  icon: 'gtceu:refinery',
  focus: 'oil',
  bands: [['refinery', 'aromatics'], ['syngas', 'gasoline', 'ptfe'], ['rocket', 'sbr'], ['nichrome']],
  clusters: {
    refinery: {
      name: 'Crude oil through the refinery',
      nodes: [
        n('oil', 0, -0.75, F('gtceu:oil'), 'Crude Oil', { kind: 'raw', sub: 'MV fluid drilling rig' }),
        L('h2', 0, 0.75, 'pl_lv:h2'),
        n('catalyst', 0, 2.25, I('grindless:hydrotreating_catalyst'), 'Hydrotreating Catalyst', { kind: 'raw', sub: 'Mixer: cobalt, molybdenum and silica (or syngas ash)' }),
        n('refinery', 2.5, 0.75, M('gtceu:refinery'), 'Refinery', {
          kind: 'ours', from: ['oil', 'h2', 'catalyst'],
          desc: ['One pass gives every fraction, already free of sulfur. The distillery gives one fraction a pass and throws the rest away.', 'Give each fraction a tank, or the column stops.'],
        }),
        n('heavy', 5, -1.5, F('gtceu:heavy_fuel'), 'Heavy Fuel', { from: ['refinery'], end: 'diesel, syngas', sub: 'Diesel, or the syngas plant' }),
        n('light', 5, -0.25, F('gtceu:light_fuel'), 'Light Fuel', { from: ['refinery'], end: 'diesel, cracking', sub: 'Diesel, or cracking' }),
        n('naphtha', 5, 1, F('gtceu:naphtha'), 'Naphtha', { from: ['refinery'], end: 'reformer, cracking, gasoline', sub: 'Reformer, cracking, gasoline' }),
        n('gas', 5, 2.25, F('gtceu:refinery_gas'), 'Refinery Gas', { from: ['refinery'], end: 'methane, gasoline', sub: 'Methane for PTFE; gasoline' }),
        n('h2s', 5, 3.5, F('gtceu:hydrogen_sulfide'), 'Hydrogen Sulfide', {
          kind: 'by', from: ['refinery'], end: 'roaster burner, acid',
          desc: 'The sulfur the refinery pulls out. The LV sulfide roaster burns it back into sulfuric acid.',
        }),
      ],
    },
    aromatics: {
      name: 'Naphtha into aromatics and olefins',
      nodes: [
        n('rcat', 0, -3, I('grindless:reforming_catalyst'), 'Reforming Catalyst', { kind: 'raw', sub: 'End platinum on silica' }),
        n('naphtha2', 0, 0, F('gtceu:naphtha'), 'Naphtha', { kind: 'raw', sub: 'From the refinery' }),
        n('steam', 0, 1.5, F('gtceu:steam'), 'Steam', { kind: 'raw' }),
        n('reformer', 2, -2.25, M('gtceu:reformer'), 'Catalytic Reformer', {
          kind: 'ours', from: ['rcat', 'naphtha2'],
          desc: 'Naphtha over platinum gives aromatics and more hydrogen than the refinery used to make that naphtha.',
        }),
        n('crack', 2, 1.5, M('gtceu:refinery', ['gtceu:refining']), 'Refinery, Steam Cracking', { kind: 'ours', from: ['naphtha2', 'steam'], sub: 'Circuit 3: cracked and split in one pass' }),
        n('h2back', 4, -3.5, F('gtceu:hydrogen'), 'Hydrogen, Back', { kind: 'ret', from: ['reformer'], sub: 'Back into the refinery' }),
        n('benzene', 4, -2.25, F('gtceu:benzene'), 'Benzene', { from: ['reformer'], end: 'styrene, cumene', sub: 'Styrene and cumene' }),
        n('toluene', 4, -1, F('gtceu:toluene'), 'Toluene', { from: ['reformer'], end: 'gasoline', sub: 'Gasoline wants it' }),
        n('ethylene', 4, 0.25, F('gtceu:ethylene'), 'Ethylene', { from: ['crack'], end: 'PE, PVC, styrene', sub: 'PE, PVC, styrene' }),
        n('propene', 4, 1.5, F('gtceu:propene'), 'Propene', { from: ['crack'], end: 'cumene, epoxy', sub: 'Cumene, then epoxy' }),
        n('butadiene', 4, 2.75, F('gtceu:butadiene'), 'Butadiene', { from: ['crack'], end: 'SBR', sub: 'Synthetic rubber' }),
      ],
    },
    syngas: {
      name: 'Hydrogen from carbon',
      nodes: [
        n('shiftcat', 0, -2.25, I('grindless:shift_catalyst'), 'Shift Catalyst', { kind: 'raw', sub: 'Mixer: magnetite and chrome' }),
        n('carbon', 0, -0.75, I('gtceu:coal_dust'), 'Coal Dust', { kind: 'raw', sub: 'Or coke, charcoal, carbon' }),
        n('steam2', 0, 0.75, F('gtceu:steam'), 'Steam', { kind: 'raw' }),
        n('heavyfuel', 0, 2.25, F('gtceu:heavy_fuel'), 'Heavy Fuel', { kind: 'raw', sub: 'The refinery\'s bottoms' }),
        n('plant', 2.5, 0, M('gtceu:syngas_plant'), 'Syngas Plant', {
          kind: 'ours', from: ['shiftcat', 'carbon', 'steam2', 'heavyfuel'],
          desc: ['Steam on hot carbon makes carbon monoxide and hydrogen; more steam over the catalyst turns the monoxide into more hydrogen.', 'Each gas leaves through its own hatch.'],
        }),
        n('co', 5, -1.5, F('gtceu:carbon_monoxide'), 'Carbon Monoxide', { from: ['plant'], sub: 'Methanol, or shift it' }),
        n('hydrogen', 5, 0, F('gtceu:hydrogen'), 'Hydrogen', { kind: 'product', from: ['plant'], sub: 'Refinery, ammonia, HF, the rocket' }),
        n('co2', 5, 1.5, F('gtceu:carbon_dioxide'), 'Carbon Dioxide', { kind: 'by', from: ['plant'], end: 'greenhouse, inert', sub: 'Captured: greenhouses, or void it' }),
        n('ash', 5, 3, I('gtceu:ash_dust'), 'Ash', { kind: 'by', from: ['plant'], end: 'fertilizer', sub: 'Fertilizer, or the catalyst' }),
        n('shifted', 7, -1.5, F('gtceu:hydrogen'), 'Hydrogen, Shifted', { kind: 'ret', from: ['co'], by: ['gtceu:syngas'], sub: 'Circuit 4: the monoxide goes round again' }),
      ],
    },
    gasoline: {
      name: 'Gasoline',
      nodes: [
        n('naphtha3', 0, -2.25, F('gtceu:naphtha'), 'Naphtha', { kind: 'raw' }),
        n('gas3', 0, -0.75, F('gtceu:refinery_gas'), 'Refinery Gas', { kind: 'raw' }),
        L('methanol', 0, 0.75, 'pl_mv:methanol'),
        L('acetone', 0, 2.25, 'pl_mv:acetone'),
        n('lcr', 2.5, 0, M('gtceu:large_chemical_reactor'), 'Large Chemical Reactor', {
          from: ['naphtha3', 'gas3', 'methanol', 'acetone'],
          desc: 'The MV biorefinery\'s methanol and acetone finally find their big job here.',
        }),
        n('rawgas', 5, 0, F('gtceu:raw_gasoline'), 'Raw Gasoline', { from: ['lcr'] }),
        n('toluene2', 5, 1.5, F('gtceu:toluene'), 'Toluene', { kind: 'raw', sub: 'From the reformer' }),
        n('gasoline', 7, 0.75, F('gtceu:gasoline'), 'Gasoline', { from: ['rawgas', 'toluene2'], sub: 'Chemical reactor' }),
        n('gen', 9, 0.75, M('gtceu:hv_combustion'), 'Combustion Generator', { from: ['gasoline'], sub: 'Five times the energy of naphtha' }),
      ],
    },
    ptfe: {
      name: 'PTFE',
      nodes: [
        n('lepidolite', 0, -1.5, I('gtceu:lepidolite_dust'), 'Lepidolite Dust', { kind: 'raw', sub: 'Or bastnasite, or topaz' }),
        n('fluorine', 2, -1.5, F('gtceu:fluorine'), 'Fluorine', { from: ['lepidolite'], by: ['gtceu:electrolyzer'], sub: 'Electrolyzer' }),
        n('hf', 4, -1.5, F('gtceu:hydrofluoric_acid'), 'Hydrofluoric Acid', { from: ['fluorine'], sub: 'With hydrogen' }),
        n('methane', 0, 0, F('gtceu:methane'), 'Methane', { kind: 'raw', sub: 'Refinery gas, distilled' }),
        L('cl2', 0, 1.5, 'pl_mv:cl2'),
        n('chloroform', 2, 0.75, F('gtceu:chloroform'), 'Chloroform', { from: ['methane', 'cl2'] }),
        n('tfe', 6, -0.75, F('gtceu:tetrafluoroethylene'), 'Tetrafluoroethylene', { from: ['hf', 'chloroform'] }),
        n('hcl', 4, 0.75, F('gtceu:hydrochloric_acid'), 'Hydrochloric Acid', { kind: 'by', from: ['chloroform'], end: 'PVC, epoxy', sub: 'Both steps leave it: PVC, epoxy' }),
        n('ptfe', 8, -0.75, F('gtceu:polytetrafluoroethylene'), 'PTFE', {
          kind: 'product', from: ['tfe'], sub: 'With oxygen',
          desc: 'Teflon. The large chemical reactor is lined with it, so this line comes first.',
        }),
      ],
    },
    rocket: {
      name: 'Rocket parts',
      nodes: [
        n('fiberglass', 0, -1.5, I('gcyr:fiberglass_foil'), 'Fiberglass Foil', { kind: 'raw' }),
        n('epoxy', 0, 0, F('gtceu:epoxy'), 'Epoxy', { kind: 'raw', sub: 'Large chemical reactor' }),
        n('n2', 0, 1.5, F('gtceu:nitrogen'), 'Nitrogen', { kind: 'raw', sub: 'Vented after each cure' }),
        n('drum', 0, 3, I('gtceu:stainless_steel_drum'), 'Stainless Steel Drum', { kind: 'raw', sub: 'The liner' }),
        n('aramid', 0, 4.5, I('gcyr:para_aramid_foil'), 'Para-Aramid Foil', { kind: 'raw' }),
        n('autoclave', 2.5, 1.5, M('gtceu:composite_autoclave'), 'Composite Autoclave', {
          kind: 'ours', from: ['fiberglass', 'epoxy', 'n2', 'drum', 'aramid'],
          desc: 'Cures fiber and epoxy under hot nitrogen: heat shield tiles and wrapped tanks no single machine can make.',
        }),
        L('qthruster', 5, -1.5, 'pl_mv:qthruster'),
        n('tile', 5, 0, I('grindless:ablative_heat_shield_tile'), 'Ablative Tile', { from: ['autoclave'] }),
        n('copv', 5, 3, I('grindless:composite_overwrapped_tank'), 'Overwrapped Tank', { from: ['autoclave'] }),
        n('untested', 7, -0.75, I('grindless:untested_rocket_motor'), 'Untested Rocket Motor', { from: ['qthruster', 'tile'], sub: 'Assembler, with Kapton K' }),
        n('fuel', 7, 0.75, F('gtceu:rocket_fuel'), 'Rocket Fuel', { kind: 'raw', sub: 'Dimethylhydrazine and oxygen' }),
        n('stand', 9, 0, M('gtceu:engine_test_stand'), 'Engine Test Stand', {
          kind: 'ours', from: ['untested', 'fuel'],
          desc: 'The same stand as MV, now firing whole motors on the fuel they will fly on.',
        }),
        n('motor', 11, -0.75, I('gcyr:basic_rocket_motor'), 'Basic Rocket Motor', { kind: 'product', from: ['stand'] }),
        n('exhaust', 11, 0.75, F('gtceu:carbon_dioxide'), 'Carbon Dioxide', { kind: 'by', from: ['stand'], end: 'greenhouse', sub: 'With water: both have a hatch' }),
        n('tank', 7, 3, I('gcyr:basic_fuel_tank'), 'Basic Fuel Tank', { kind: 'product', from: ['copv'], sub: 'Assembler' }),
      ],
    },
    sbr: {
      name: 'Synthetic rubber',
      nodes: [
        n('ethylene2', 0, -0.75, F('gtceu:ethylene'), 'Ethylene', { kind: 'raw' }),
        n('benzene2', 0, 0.75, F('gtceu:benzene'), 'Benzene', { kind: 'raw' }),
        n('styrene', 2, 0, F('gtceu:styrene'), 'Styrene', { from: ['ethylene2', 'benzene2'] }),
        n('butadiene2', 2, 1.5, F('gtceu:butadiene'), 'Butadiene', { kind: 'raw', sub: 'Steam cracking' }),
        n('rawsbr', 4, 0.75, I('gtceu:raw_styrene_butadiene_rubber_dust'), 'Raw SBR', { from: ['styrene', 'butadiene2'], sub: 'With oxygen' }),
        n('sulfur', 4, 2.25, I('gtceu:sulfur_dust'), 'Sulfur', { kind: 'raw' }),
        n('sbr', 6, 1.5, F('gtceu:styrene_butadiene_rubber'), 'Styrene-Butadiene Rubber', {
          kind: 'product', from: ['rawsbr', 'sulfur'], sub: 'Large chemical reactor',
          desc: 'Better rubber than the trees give. From IV on, the rings and pumps insist on it.',
        }),
      ],
    },
    nichrome: {
      name: 'Nichrome',
      nodes: [
        n('nickel', 0, -0.75, I('gtceu:nickel_dust'), 'Nickel', { kind: 'raw' }),
        n('chrome', 0, 0.75, I('gtceu:chromium_dust'), 'Chromium', { kind: 'raw' }),
        n('ndust', 2, 0, I('gtceu:nichrome_dust'), 'Nichrome Dust', { from: ['nickel', 'chrome'], sub: 'Mixer' }),
        n('ebf', 4, 0, M('gtceu:electric_blast_furnace'), 'Electric Blast Furnace', { from: ['ndust'], sub: '2,700 K: two HV hatches' }),
        n('hot', 6, 0, I('gtceu:hot_nichrome_ingot'), 'Hot Nichrome Ingot', { from: ['ebf'] }),
        n('freezer', 8, 0, M('gtceu:vacuum_freezer'), 'Vacuum Freezer', { from: ['hot'], desc: 'Two EV circuits go into it, and every hot ingot from here on comes out of it.' }),
        n('ingot', 10, 0, I('gtceu:nichrome_ingot'), 'Nichrome', { from: ['freezer'] }),
        n('coil', 12, 0, I('gtceu:nichrome_coil_block'), 'Nichrome Coil', { kind: 'product', from: [via('ingot', 'gtceu:nichrome_double_wire')], sub: 'EV\'s hotter EBF' }),
      ],
    },
  },
};
