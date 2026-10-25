// The Power tab (power.snbt, in the Quality of Life group): every way to make power in the pack today, by tier, Steam to IV, and
// what carries and stores it. Positions are relative to each cluster (pl-model.mjs places the clusters). Every number in a node's
// text is a figure (pl-lib.mjs#P) that pl-check.mjs recomputes from the dump, the pack's config or a script.
import { I, F, M, n, L, E, P, engineFluid, boilerWater, build } from './pl-lib.mjs';

// fuel figures, EU per mB, from the dump's recipes (they already carry the pack's x2, power/generators.js)
const COMBUSTION = [
  ['fluid:gtceu:high_octane_gasoline', 'high-octane gasoline', 6400], ['fluid:gtceu:gasoline', 'gasoline', 3200],
  ['fluid:gtceu:cetane_boosted_diesel', 'cetane-boosted diesel', 1440], ['fluid:gtceu:diesel', 'diesel', 960],
  ['fluid:gtceu:light_fuel', 'light fuel', 640], ['fluid:gtceu:naphtha', 'naphtha', 640], ['fluid:gtceu:toluene', 'toluene', 640],
  ['fluid:gtceu:bio_diesel', 'biodiesel', 512], ['fluid:gtceu:rocket_fuel', 'rocket fuel', 500], ['fluid:gtceu:ethanol', 'ethanol', 384],
  ['fluid:gtceu:octane', 'octane', 160], ['fluid:gtceu:methanol', 'methanol', 128], ['fluid:gtceu:sulfuric_light_fuel', 'sulfuric light fuel', 80],
  ['fluid:gtceu:oil_medium', 'raw oil', 15], ['fluid:gtceu:oil_light', 'light oil', 10],
];
const GAS = [
  ['fluid:gtceu:nitrobenzene', 'nitrobenzene', 2560], ['fluid:gtceu:benzene', 'benzene', 704], ['fluid:gtceu:lpg', 'LPG', 640],
  ['fluid:gtceu:butane', 'butane', 592], ['fluid:gtceu:phenol', 'phenol', 576], ['fluid:gtceu:butene', 'butene', 512],
  ['fluid:gtceu:propane', 'propane', 464], ['fluid:gtceu:butadiene', 'butadiene', 408], ['fluid:gtceu:propene', 'propene', 384],
  ['fluid:gtceu:ethane', 'ethane', 336], ['fluid:gtceu:refinery_gas', 'refinery gas', 320], ['fluid:gtceu:ethylene', 'ethylene', 256],
  ['fluid:gtceu:methane', 'methane', 224], ['fluid:gtceu:coal_gas', 'coal gas', 192], ['fluid:gtceu:sulfuric_naphtha', 'sulfuric naphtha', 80],
  ['fluid:gtceu:methalox', 'methalox', 74.67], ['fluid:gtceu:sulfuric_gas', 'sulfuric gas', 50], ['fluid:gtceu:wood_gas', 'wood gas', 48],
  ['fluid:gtceu:natural_gas', 'natural gas', 40],
];
const fuels = (table, keys) => table.filter(([k]) => !keys || keys.includes(k)).map(([k, name, eu]) => P.fuel(k, name, eu));
const pick = (table, ...names) => fuels(table, names.map((s) => 'fluid:gtceu:' + s));

// buckets of steam per fuel in a large boiler: the same burn time in any of them, so the steam scales with the boiler
const LAVA_ONLY = [['fluid:minecraft:lava', 'lava']];
const largeBoiler = (k) => [
  P.steamFuel('minecraft:coal', 'coal', 2560 * k), P.steamFuel('gtceu:coke_gem', 'coke', 5120 * k),
  P.steamFuel('fluid:minecraft:lava', 'a bucket of lava', 14400 * k), P.steamFuel('fluid:gtceu:creosote', 'a bucket of creosote', 896 * k),
  P.steamFuel('fluid:gtceu:biomass', 'a bucket of biomass', 13600 * k), P.steamFuel('fluid:gtceu:heavy_fuel', 'a bucket of heavy fuel', 36000 * k),
  P.anywhere('gtceu:large_boiler', LAVA_ONLY),
];
// nothing burns in a vacuum (docs/eras/ev.md): the fuels that carry their own oxidizer are the exception
const COMBUSTION_ANYWHERE = P.anywhere('gtceu:combustion_generator', [['fluid:gtceu:rocket_fuel', 'rocket fuel']]);
const GAS_ANYWHERE = P.anywhere('gtceu:gas_turbine', [['fluid:gtceu:methalox', 'methalox']]);

const coal = (key, x, y) => n(key, x, y, I('minecraft:coal'), 'Coal', { kind: 'raw', sub: 'Coke and charcoal work too' });
const steam = (key, x, y) => n(key, x, y, F('gtceu:steam'), 'Steam', { kind: 'raw', sub: 'From any boiler' });

export default {
  file: 'power',
  group: 'Quality of Life',
  order: 5,
  title: 'Power',
  subtitle: 'Every way to make power, tier by tier, and what carries it and stores it.',
  icon: 'gtceu:lv_steam_turbine',
  focus: 'lpSolid',
  bands: [
    ['stSolid', 'stLiquid', 'stSolar'],
    ['lvSteam', 'lvBoiler', 'lvSun', 'lvArray', 'lvGas'],
    ['mvSteam', 'mvComb', 'mvGas', 'mvSolar'],
    ['hvSteam', 'hvComb', 'hvGas', 'hvBoiler', 'hvSolar'],
    ['evGas', 'evCC', 'evBoiler', 'evSolar', 'evRocket'],
    ['ivEngines', 'ivBoiler', 'ivRocket', 'ivRTG'],
    ['ivFission', 'ivVenus', 'ivMercury', 'ivSolar'],
    ['laterFusion', 'laterNaq', 'laterDyson'],
    ['gHull', 'gBat', 'gCable', 'gFar', 'gBig'],
  ],
  clusters: {
    // ---------------------------------------------------------------- Steam
    stSolid: {
      name: 'Solid fuel boilers',
      nodes: [
        E('eqLPB', 0, -1.5, 'steam_age', '6D923ADC90127182'),
        L('coke', 0, 0, 'pl_steam:coke'),
        coal('coal', 0, 1.5),
        n('lpSolid', 2.25, 0, M('gtceu:lp_steam_solid_boiler'), 'Low-Pressure Solid Boiler', {
          tier: 'steam', from: ['eqLPB', 'coke', 'coal'], desc: 'Burns anything a furnace burns.',
          figs: [P.steam(48), P.steamFuel('minecraft:coal', 'coal', 76.8), P.steamFuel('minecraft:charcoal', 'charcoal', 76.8), P.steamFuel('gtceu:coke_gem', 'coke', 153.6)],
        }),
        n('hpSolid', 2.25, 1.5, M('gtceu:hp_steam_solid_boiler'), 'High-Pressure Solid Boiler', {
          tier: 'steam', from: ['coal'], desc: 'Steel walls: more steam from the same coal, and it burns faster.',
          figs: [P.steam(120), P.steamFuel('minecraft:coal', 'coal', 96), P.steamFuel('minecraft:charcoal', 'charcoal', 96), P.steamFuel('gtceu:coke_gem', 'coke', 192)],
        }),
      ],
    },
    stLiquid: {
      name: 'Liquid fuel boilers',
      nodes: [
        L('creosote', 0, 0, 'pl_steam:creosote'),
        n('lava', 0, 1.5, F('minecraft:lava'), 'Lava', { kind: 'raw', sub: 'Pumped in the Nether' }),
        n('lpLiquid', 2.25, 0, M('gtceu:lp_steam_liquid_boiler'), 'Low-Pressure Liquid Boiler', {
          tier: 'steam', from: ['creosote', 'lava'],
          figs: [P.steam(96), P.steamFuel('fluid:minecraft:lava', 'a bucket of lava', 864), P.steamFuel('fluid:gtceu:creosote', 'a bucket of creosote', 134.4), P.anywhere('gtceu:steam_boiler', LAVA_ONLY)],
        }),
        n('hpLiquid', 2.25, 1.5, M('gtceu:hp_steam_liquid_boiler'), 'High-Pressure Liquid Boiler', {
          tier: 'steam', from: ['lava'],
          figs: [P.steam(240), P.steamFuel('fluid:minecraft:lava', 'a bucket of lava', 1080), P.steamFuel('fluid:gtceu:creosote', 'a bucket of creosote', 168), P.anywhere('gtceu:steam_boiler', LAVA_ONLY)],
        }),
      ],
    },
    stSolar: {
      name: 'Solar boilers',
      nodes: [
        n('water0', 0, 0.75, F('minecraft:water'), 'Water', { kind: 'raw', sub: 'Every boiler drinks it' }),
        n('lpSolar', 2.25, 0, M('gtceu:lp_steam_solar_boiler'), 'Low-Pressure Solar Boiler', {
          tier: 'steam', from: [boilerWater('water0')], figs: [P.steam(48)], sub: 'By day, under open sky',
        }),
        n('hpSolar', 2.25, 1.5, M('gtceu:hp_steam_solar_boiler'), 'High-Pressure Solar Boiler', {
          tier: 'steam', from: [boilerWater('water0')], figs: [P.steam(144)], sub: 'By day, under open sky',
        }),
      ],
    },
    // ---------------------------------------------------------------- LV
    lvSteam: {
      name: 'Steam turbine',
      nodes: [
        E('eqLVT', 0, -0.75, 'steam_age', '4996827E4BFC339E'),
        steam('steam1', 0, 0.75),
        n('lvTurbine', 2.25, 0, M('gtceu:lv_steam_turbine'), 'Steam Turbine', {
          tier: 'lv', from: ['eqLVT', 'steam1'], desc: 'A little of the steam comes back as distilled water.',
          figs: [P.single(32), P.fuel('fluid:gtceu:steam', 'steam', 1)],
        }),
      ],
    },
    lvBoiler: {
      name: 'Large Bronze Boiler, and biomass',
      nodes: [
        E('eqLBB', 0, -3, 'steam_age', '36B68B4C2B1E0DBA'),
        coal('coal2', 0, -1.5),
        // pl_mv's ethanol hangs off pl_lv's biomass, so FTB draws that line between the two links: biomass -> ethanol
        L('biomass', 0, 0, 'pl_lv:biomass'),
        n('bronzeLB', 2.25, -1.5, M('gtceu:bronze_large_boiler'), 'Large Bronze Boiler', {
          tier: 'lv', from: ['eqLBB', 'coal2', 'biomass'],
          desc: 'A fuel burns just as long in any large boiler; a bigger boiler only makes more steam from it.',
          figs: [P.steam(6400), ...largeBoiler(1)],
        }),
        L('ethanol', 2.25, 0.75, 'pl_mv:ethanol'),
        n('lvComb', 4.5, 0.75, M('gtceu:lv_combustion'), 'Combustion Generator', {
          tier: 'lv', from: ['ethanol'], desc: 'Every fuel it takes, best first; most of them come with MV.',
          figs: [P.single(32), ...fuels(COMBUSTION), COMBUSTION_ANYWHERE],
        }),
      ],
    },
    lvSun: {
      name: 'Heliostat tower',
      nodes: [
        E('eqHel', 0, -0.75, 'lv_age', '3A7E2C5F1B9D4061'),
        n('water1', 0, 0.75, F('minecraft:water'), 'Water', { kind: 'raw' }),
        n('heliostat', 2.25, 0, M('gtceu:heliostat_tower'), 'Heliostat Tower', {
          kind: 'ours', tier: 'lv', from: ['eqHel', 'water1'], figs: [P.steam(800), P.uses(16)], sub: 'By day, under an open, dry sky',
        }),
      ],
    },
    lvArray: {
      name: 'Generator array',
      nodes: [
        E('eqArr', 0, -0.75, 'lv_age', '1CE11DDA27E5B778'),
        steam('steam2', 0, 0.75),
        n('array', 2.25, 0, M('gtceu:generator_array'), 'Generator Array', {
          kind: 'ours', tier: 'lv', from: ['eqArr', 'steam2'], desc: 'LV generators stacked behind one controller: the same EU per mB, far less cable.',
          figs: [P.run(32, { per: 'a generator' }), P.max(512, 16, 32, { file: 'pack/kubejs/startup_scripts/grindless/power/generator_array.js', re: 'MAX_PARALLELS = (\\d+)' })],
        }),
      ],
    },
    lvGas: {
      name: 'Gas turbine',
      nodes: [
        L('coalgas', 0, 0, 'pl_steam:coalgas'),
        n('lvGas', 2.25, 0, M('gtceu:lv_gas_turbine'), 'Gas Turbine', {
          tier: 'lv', from: ['coalgas'], desc: 'Every gas it takes, best first.',
          figs: [P.single(32), ...fuels(GAS), GAS_ANYWHERE],
        }),
      ],
    },
    // ---------------------------------------------------------------- MV
    mvSteam: {
      name: 'MV steam turbine',
      nodes: [
        steam('steam3', 0, 0),
        n('mvTurbine', 2.25, 0, M('gtceu:mv_steam_turbine'), 'Steam Turbine', { tier: 'mv', from: ['steam3'], figs: [P.single(128)], sub: 'Same steam, more of it at once' }),
      ],
    },
    mvSolar: {
      name: 'Solar panel cover',
      nodes: [
        L('wafer', 0, 0, 'pl_mv:wafer'),
        n('solarCover', 2.25, 0, I('gtceu:solar_panel'), 'Solar Panel', {
          kind: 'info', tier: 'mv', from: ['wafer'], figs: [P.cover(1)], sub: 'A cover: it goes on top of a machine and feeds it',
        }),
      ],
    },
    mvComb: {
      name: 'MV combustion generator',
      nodes: [
        L('diesel', 0, -2.25, 'pl_mv:diesel'),
        L('lightmv', 0, -0.75, 'pl_mv:light'),
        L('methanol', 0, 0.75, 'pl_mv:methanol'),
        n('rawoil', 0, 2.25, F('gtceu:oil_medium'), 'Raw Oil', { kind: 'raw', sub: 'Pumped by the fluid drilling rig' }),
        n('mvComb', 2.25, 0, M('gtceu:mv_combustion'), 'Combustion Generator', {
          tier: 'mv', from: ['diesel', 'lightmv', 'methanol', 'rawoil'], desc: 'Diesel is the first fuel worth the trouble.',
          figs: [P.single(128), ...pick(COMBUSTION, 'diesel', 'light_fuel', 'methanol', 'oil_medium'), COMBUSTION_ANYWHERE],
        }),
      ],
    },
    mvGas: {
      name: 'MV gas turbine',
      nodes: [
        L('woodgas', 0, -1.5, 'pl_mv:woodgas'),
        L('benzenemv', 0, 0, 'pl_mv:benzene'),
        n('natgas', 0, 1.5, F('gtceu:natural_gas'), 'Natural Gas', { kind: 'raw', sub: 'From a gas deposit, by fluid drill' }),
        n('mvGas', 2.25, 0, M('gtceu:mv_gas_turbine'), 'Gas Turbine', {
          tier: 'mv', from: ['woodgas', 'benzenemv', 'natgas'],
          figs: [P.single(128), ...pick(GAS, 'benzene', 'wood_gas', 'natural_gas'), GAS_ANYWHERE],
        }),
      ],
    },
    // ---------------------------------------------------------------- HV
    hvSteam: {
      name: 'HV steam turbines',
      nodes: [
        steam('steam4', 0, 0.75),
        n('hvTurbine', 2.25, 0, M('gtceu:hv_steam_turbine'), 'Steam Turbine', { tier: 'hv', from: ['steam4'], figs: [P.single(512)] }),
        n('lst', 2.25, 1.5, M('gtceu:steam_large_turbine'), 'Large Steam Turbine', {
          tier: 'hv', from: ['steam4'], desc: 'The rotor\'s power sets the output, and its efficiency how far each mB goes.',
          figs: [P.turbine(1024), P.fuel('fluid:gtceu:steam', 'steam', 1)],
        }),
      ],
    },
    hvBoiler: {
      name: 'Large Steel Boiler',
      nodes: [
        L('heavy', 0, 0, 'pl_hv:heavy'),
        coal('coal3', 0, 1.5),
        n('steelLB', 2.25, 0.75, M('gtceu:steel_large_boiler'), 'Large Steel Boiler', {
          tier: 'hv', from: ['heavy', 'coal3'], figs: [P.steam(12800), ...largeBoiler(2)],
        }),
      ],
    },
    hvComb: {
      name: 'HV combustion generator',
      nodes: [
        L('gasoline', 0, -1.5, 'pl_hv:gasoline'),
        L('naphtha', 0, 0, 'pl_hv:naphtha'),
        L('toluene', 0, 1.5, 'pl_hv:toluene'),
        n('hvComb', 2.25, 0, M('gtceu:hv_combustion'), 'Combustion Generator', {
          tier: 'hv', from: ['gasoline', 'naphtha', 'toluene'], desc: 'Gasoline goes much further than light fuel.',
          figs: [P.single(512), ...pick(COMBUSTION, 'gasoline', 'naphtha', 'toluene'), COMBUSTION_ANYWHERE],
        }),
      ],
    },
    hvGas: {
      name: 'HV gas turbine',
      nodes: [
        L('refgas', 0, -2.25, 'pl_hv:gas'),
        L('ethylene', 0, -0.75, 'pl_hv:ethylene'),
        L('propene', 0, 0.75, 'pl_hv:propene'),
        L('butadiene', 0, 2.25, 'pl_hv:butadiene'),
        n('hvGas', 2.25, 0, M('gtceu:hv_gas_turbine'), 'Gas Turbine', {
          tier: 'hv', from: ['refgas', 'ethylene', 'propene', 'butadiene'],
          figs: [P.single(512), ...pick(GAS, 'butadiene', 'propene', 'refinery_gas', 'ethylene'), GAS_ANYWHERE],
        }),
      ],
    },
    hvSolar: {
      name: 'ULV solar panel',
      nodes: [
        n('phwafer', 0, 0, I('gtceu:phosphorus_wafer'), 'Phosphorus Wafer', { kind: 'raw', sub: 'Cut from a phosphorus boule, in the cleanroom' }),
        n('ulvSolar', 2.25, 0, I('gtceu:ulv_solar_panel'), 'ULV Solar Panel', {
          kind: 'info', tier: 'hv', from: ['phwafer'], figs: [P.cover(8)], sub: 'Graphene wire and gallium arsenide go into it',
        }),
      ],
    },
    // ---------------------------------------------------------------- EV
    evGas: {
      name: 'Large gas turbine',
      nodes: [
        L('methane', 0, -0.75, 'pl_ev:methane'),
        L('methalox', 0, 0.75, 'pl_ev:methalox'),
        n('lgt', 2.25, 0, M('gtceu:gas_large_turbine'), 'Large Gas Turbine', {
          tier: 'ev', from: ['methane', 'methalox'], desc: 'Methalox brings its own oxygen.',
          figs: [P.turbine(4096), ...pick(GAS, 'methane', 'methalox'), GAS_ANYWHERE],
        }),
      ],
    },
    evBoiler: {
      name: 'Large Titanium Boiler',
      nodes: [
        coal('coal4', 0, 0),
        n('tiLB', 2.25, 0, M('gtceu:titanium_large_boiler'), 'Large Titanium Boiler', { tier: 'ev', from: ['coal4'], figs: [P.steam(25600), ...largeBoiler(4)] }),
      ],
    },
    evCC: {
      name: 'Combined-cycle plant',
      nodes: [
        E('eqCC', 0, -1.5, 'ev_age', '1DD071239194961D'),
        n('dw', 0, 0, F('gtceu:distilled_water'), 'Distilled Water', { kind: 'raw' }),
        n('refgas2', 0, 1.5, F('gtceu:refinery_gas'), 'Refinery Gas', { kind: 'raw', sub: 'Or any gas turbine fuel' }),
        n('cc', 2.25, 0, M('gtceu:combined_cycle_plant'), 'Combined-Cycle Plant', {
          kind: 'ours', tier: 'ev', from: ['eqCC', 'dw', 'refgas2'], desc: 'The gas turbine\'s EU per mB, plus steam from its own exhaust for a Large Steam Turbine.',
          figs: [P.run(32, { per: 'a run' }), P.max(8192, 256, 32, { file: 'pack/kubejs/startup_scripts/grindless/ev/combined_cycle_and_hot_mill.js', re: 'PLANT_MAX_PARALLELS = (\\d+)' }),
            P.ccSteam('fluid:gtceu:benzene', 'benzene', 282), P.ccSteam('fluid:gtceu:lpg', 'LPG', 256), P.ccSteam('fluid:gtceu:refinery_gas', 'refinery gas', 128),
            P.ccSteam('fluid:gtceu:methane', 'methane', 89.5), P.ccSteam('fluid:gtceu:methalox', 'methalox', 29.83)],
        }),
      ],
    },
    evSolar: {
      name: 'Lunar solar array',
      nodes: [
        E('eqLSA', 0, 0, 'ev_age', '734B97375A3121C4'),
        n('lunar', 2.25, 0, M('gtceu:lunar_solar_array'), 'Lunar Solar Array', {
          kind: 'ours', tier: 'ev', from: ['eqLSA'], desc: 'By day only, and nothing burns.',
          figs: [P.run(420, { per: 'a panel', where: 'on the Moon', recipe: 'grindless:lunar_solar/moon' }), P.run(129, { per: 'a panel', where: 'on Mars', recipe: 'grindless:lunar_solar/mars' }),
            P.max(15120, 36, 420, { file: 'pack/kubejs/startup_scripts/grindless/ev/lunar_power_and_antenna.js', re: 'PANELS !== (\\d+)' })],
        }),
      ],
    },
    evRocket: {
      name: 'Rocket engine',
      nodes: [
        L('rp1', 0, 0, 'pl_mv:rp1'),
        n('rp1mix', 2, 0, F('gtceu:rp_1_mixed_fuel'), 'RP-1 Mixed Fuel', { from: ['rp1'], sub: 'GT--\'s chemical plant, with oxygen' }),
        n('evRocket', 4.25, 0, M('gtnn:ev_rocket_engine'), 'Rocket Engine', {
          tier: 'ev', from: ['rp1mix'], desc: 'A rocket motor, bolted to the floor.',
          figs: [P.single(2048), P.fuel('fluid:gtceu:methylhydrazine_nitrate_rocket_fuel', 'methylhydrazine nitrate', 12288),
            P.fuel('fluid:gtceu:dense_hydrazine_mixed_fuel', 'dense hydrazine', 6144), P.fuel('fluid:gtceu:rp_1_mixed_fuel', 'RP-1 mixed fuel', 3072),
            P.anywhere('gtceu:rocket_engine', [['fluid:gtceu:rp_1_mixed_fuel', 'RP-1 mixed fuel'], ['fluid:gtceu:methylhydrazine_nitrate_rocket_fuel', 'methylhydrazine nitrate']])],
        }),
      ],
    },
    // ---------------------------------------------------------------- IV
    ivEngines: {
      name: 'Large combustion engines',
      nodes: [
        n('lube', 0, -1.5, F('gtceu:lubricant'), 'Lubricant', { kind: 'raw', sub: 'From creosote or seed oil' }),
        L('o2', 0, 0, 'pl_lv:o2'),
        n('hog', 0, 1.5, F('gtceu:high_octane_gasoline'), 'High-Octane Gasoline', { kind: 'raw', sub: 'Gasoline with additives, in the large chemical reactor' }),
        L('lox', 0, 3, 'pl_ev:lox'),
        n('lce', 2.25, 0, M('gtceu:large_combustion_engine'), 'Large Combustion Engine', {
          tier: 'iv', from: [engineFluid('lube'), engineFluid('o2'), 'hog'], sub: 'It wants an IV circuit',
          desc: 'Lubricant keeps it turning, and oxygen boosts it.',
          figs: [P.engine(2048, 6144, 1.5), ...pick(COMBUSTION, 'high_octane_gasoline', 'gasoline', 'cetane_boosted_diesel', 'diesel')],
        }),
        n('ece', 2.25, 3, M('gtceu:extreme_combustion_engine'), 'Extreme Combustion Engine', {
          tier: 'iv', from: [engineFluid('lox')], sub: 'It wants a LuV circuit',
          desc: 'Same fuels and lubricant as the large engine; liquid oxygen boosts it.',
          figs: [P.engine(8192, 32768, 2)],
        }),
      ],
    },
    ivBoiler: {
      name: 'Large Tungstensteel Boiler',
      nodes: [
        coal('coal5', 0, 0),
        n('tsLB', 2.25, 0, M('gtceu:tungstensteel_large_boiler'), 'Large Tungstensteel Boiler', { tier: 'iv', from: ['coal5'], figs: [P.steam(51200), ...largeBoiler(8)] }),
      ],
    },
    ivRocket: {
      name: 'IV rocket engine',
      nodes: [
        n('rp1mix2', 0, 0, F('gtceu:rp_1_mixed_fuel'), 'RP-1 Mixed Fuel', { kind: 'raw' }),
        n('ivRocket', 2.25, 0, M('gtnn:iv_rocket_engine'), 'Rocket Engine', { tier: 'iv', from: ['rp1mix2'], figs: [P.single(8192)], sub: 'Same fuels as the EV one' }),
      ],
    },
    ivRTG: {
      name: 'RTG cell',
      nodes: [
        L('rtgp', 0, 0, 'pl_iv:rtgp'),
        n('rtg', 2.25, 0, M('gtceu:ev_rtg'), 'RTG Cell', {
          tier: 'iv', from: ['rtgp'], desc: 'Day and night, on any world, and one pellet keeps it going for a long while.',
          figs: [P.single(2048), P.fuel('grindless:rtg_pellet', '', 147456000, { unit: 'pellet' })],
        }),
      ],
    },
    ivFission: {
      name: 'Fission reactor',
      nodes: [
        L('leu', 0, -2.25, 'pl_iv:leu'),
        L('mox', 0, -0.75, 'pl_iv:mox'),
        L('breeder', 0, 0.75, 'pl_iv:breeder'),
        L('hw', 0, 2.25, 'pl_iv:hw2'),
        n('reactor', 2.5, 0, M('gtceu:fission_reactor'), 'Fission Reactor', {
          kind: 'ours', tier: 'iv', from: ['leu', 'mox', 'breeder', 'hw'], desc: 'No smoke and no fuel line: a few assemblies run it for hours.',
          figs: [P.max(131072, 4, 32768, { file: 'pack/kubejs/data/grindless/tables/fission_cores.json', json: 'channels' }),
            P.run(16384, { line: true, label: 'A channel', name: 'LEU in light water', recipe: 'grindless:fission_core/leu_light_water' }),
            P.run(32768, { line: true, label: 'A channel', name: 'LEU in heavy water', recipe: 'grindless:fission_core/leu_heavy_water' }),
            P.run(32768, { line: true, label: 'A channel', name: 'MOX', recipe: 'grindless:fission_core/mox_heavy_water' }),
            P.run(8192, { line: true, label: 'A channel', name: 'breeder', recipe: 'grindless:fission_core/breeder' }),
            P.fuel('grindless:leu_fuel_assembly', 'LEU in light water', 1310720000, { unit: 'assembly', recipe: 'grindless:fission_core/leu_light_water' }),
            P.fuel('grindless:leu_fuel_assembly', 'LEU in heavy water', 2621440000, { unit: 'assembly', recipe: 'grindless:fission_core/leu_heavy_water' }),
            P.fuel('grindless:mox_fuel_assembly', 'MOX', 2621440000, { unit: 'assembly', recipe: 'grindless:fission_core/mox_heavy_water' }),
            P.fuel('grindless:breeder_fuel_assembly', 'breeder', 655360000, { unit: 'assembly', recipe: 'grindless:fission_core/breeder' })],
        }),
      ],
    },
    ivVenus: {
      name: 'Venus heat engine',
      nodes: [
        L('dwv', 0, 0, 'pl_iv:dwv'),
        n('venus', 2.25, 0, M('gtceu:venus_heat_engine'), 'Venus Heat Engine', {
          kind: 'ours', tier: 'iv', from: ['dwv'], desc: 'Venus is always at noon, so it never stops. The water leaves as steam for a turbine.',
          figs: [P.run(8192, { where: 'on Venus' })],
        }),
      ],
    },
    ivMercury: {
      name: 'Mercury solar field',
      nodes: [
        L('panel', 0, 0, 'pl_iv:panel'),
        n('mercury', 2.25, 0, M('gtceu:mercury_solar_field'), 'Mercury Solar Field', {
          kind: 'ours', tier: 'iv', from: [build('panel')], desc: 'Nothing at night: an RTG cell or a buffer carries the base till sunrise.',
          figs: [P.run(2010, { per: 'a panel', where: 'by day' }), P.max(72360, 36, 2010, { file: 'pack/kubejs/startup_scripts/grindless/iv/mercury.js', re: 'PANELS !== (\\d+)' })],
        }),
      ],
    },
    ivSolar: {
      name: 'LV solar panel',
      nodes: [
        L('nqwafer', 0, 0, 'pl_iv:wafer'),
        n('lvSolar', 2.25, 0, I('gtceu:lv_solar_panel'), 'LV Solar Panel', {
          kind: 'info', tier: 'iv', from: ['nqwafer'], figs: [P.cover(32)], sub: 'It wants a LuV circuit',
        }),
      ],
    },
    // ---------------------------------------------------------------- later
    laterFusion: {
      name: 'Fusion (LuV)',
      nodes: [
        n('deut', 0, -0.75, F('gtceu:deuterium'), 'Deuterium', { kind: 'raw', sub: 'Heavy water through the electrolyzer' }),
        L('tritium', 0, 0.75, 'pl_iv:tritium'),
        n('fusion', 2.25, 0, M('gtceu:luv_fusion_reactor'), 'Fusion Reactor', { kind: 'peek', from: ['deut', 'tritium'], sub: 'LuV: the tritium you keep in IV goes in here' }),
        n('plasma', 4.5, 0, F('gtceu:helium_plasma'), 'Helium Plasma', { kind: 'peek', from: ['fusion'] }),
        n('plasmaT', 6.75, 0, M('gtceu:plasma_large_turbine'), 'Large Plasma Turbine', { kind: 'peek', from: ['plasma'], sub: 'LuV: plasma turned into power' }),
      ],
    },
    laterNaq: {
      name: 'Naquadah reactors',
      nodes: [
        n('naqbolt', 0, 0, I('gtceu:enriched_naquadah_bolt'), 'Enriched Naquadah', { kind: 'peek', sub: 'It wants naquadah coils in the blast furnace' }),
        n('naqReactor', 2.25, 0, M('gtnn:ev_naquadah_reactor'), 'Naquadah Reactor', { kind: 'peek', from: ['naqbolt'], sub: 'LuV: enriched naquadah first, naquadria later' }),
      ],
    },
    laterDyson: {
      name: 'Dyson sphere',
      nodes: [
        n('dysonCell', 0, 0, I('gcyr:dyson_solar_cell'), 'Dyson Solar Cell', { kind: 'peek' }),
        n('dyson', 2.25, 0, M('gcyr:dyson_system_controller'), 'Dyson Sphere', { kind: 'peek', from: ['dysonCell'], sub: 'UHV: a star wrapped in panels' }),
      ],
    },
    // ---------------------------------------------------------------- what carries and stores it
    gHull: {
      name: 'Transformers and buffers',
      nodes: [
        E('eqTr', 0, -1.5, 'lv_age', '39A5A5CC76591697'),
        n('hull', 0, 0, I('gtceu:lv_machine_hull'), 'LV Machine Hull', { kind: 'raw' }),
        n('transformer', 2.25, -0.75, I('gtceu:lv_transformer_1a'), 'Transformer', { kind: 'info', from: ['eqTr', 'hull'], sub: 'Steps power up or down one tier' }),
        n('buffer', 2.25, 0.75, I('gtceu:lv_battery_buffer_4x'), 'Battery Buffer', { kind: 'info', from: ['hull'], sub: 'Batteries in a box, wired into the grid' }),
      ],
    },
    gBat: {
      name: 'Batteries',
      nodes: [
        n('bathull', 0, 0, I('gtceu:lv_battery_hull'), 'Battery Hull', { kind: 'raw' }),
        n('batteries', 2.25, 0, I('gtceu:lv_lithium_battery'), 'Batteries', {
          kind: 'info', from: ['bathull'], desc: 'Battery buffers and your electric tools both run on these.',
          figs: [P.battery('gtceu:lv_sodium_battery', 'LV sodium', 80000), P.battery('gtceu:lv_cadmium_battery', 'LV cadmium', 100000),
            P.battery('gtceu:lv_lithium_battery', 'LV lithium', 120000), P.battery('gtceu:mv_lithium_battery', 'MV lithium', 420000),
            P.battery('gtceu:hv_lithium_battery', 'HV lithium', 1800000), P.battery('gtceu:energy_crystal', 'energium crystal', 6400000),
            P.battery('gtceu:ev_vanadium_battery', 'EV vanadium', 10240000), P.battery('gtceu:lapotron_crystal', 'lapotron crystal', 25000000),
            P.battery('gtceu:iv_vanadium_battery', 'IV vanadium', 40960000)],
        }),
      ],
    },
    gCable: {
      name: 'Cables',
      nodes: [
        n('tinwire', 0, 0, I('gtceu:tin_single_wire'), 'Tin Wire', { kind: 'raw' }),
        n('cables', 2.25, 0, I('gtceu:tin_single_cable'), 'Cables', {
          kind: 'info', from: ['tinwire'], desc: 'Insulated cable loses less than bare wire, and a superconductor loses nothing.',
          figs: [P.cable('gtceu:tin', 'tin', 'lv', 1, 1), P.cable('gtceu:copper', 'copper', 'mv', 1, 2), P.cable('gtceu:gold', 'gold', 'hv', 3, 2),
            P.cable('gtceu:aluminium', 'aluminium', 'ev', 1, 1), P.cable('gtceu:platinum', 'platinum', 'iv', 2, 1),
            P.cable('gtceu:manganese_phosphide', 'manganese phosphide (superconductor)', 'lv', 2, 0)],
        }),
      ],
    },
    gFar: {
      name: 'Across worlds',
      nodes: [
        E('eqP2Pae', 2.25, -0.75, 'applied_energistics', '1DFC0C1A50793CB7'),
        E('eqBridge', 0, 0.75, 'ev_age', '366AB48E5BF50431'),
        E('eqP2P', 2.25, 0.75, 'ev_age', '42BF2F77456F8773'),
        n('p2p', 4.5, 0, I('eup2p:eu_p2p_tunnel'), 'EU P2P Tunnel', {
          kind: 'info', from: ['eqP2Pae', 'eqP2P'], figs: [P.toll(2.5)],
          desc: 'Any voltage, any distance, and over the quantum bridge, any planet.',
        }),
        n('bridge', 2.25, 2.25, I('ae2:quantum_link'), 'Quantum Bridge', { kind: 'info', from: ['eqBridge'], sub: 'It carries the network, and the tunnels on it, to the other worlds' }),
      ],
    },
    gBig: {
      name: 'Substation and what comes next',
      nodes: [
        n('lapo', 0, 0, I('gtceu:lapotron_crystal'), 'Lapotron Crystal', { kind: 'raw' }),
        n('pss', 2.25, 0, I('gtceu:power_substation'), 'Power Substation', { kind: 'info', from: ['lapo'], sub: 'One battery the size of a building; it wants a LuV circuit' }),
        n('wireless', 4.5, 0, I('minecraft:lightning_rod'), 'Wireless Energy Network', {
          kind: 'slot', alone: true, sub: 'Coming soon, tower and all',
        }),
      ],
    },
  },
};
