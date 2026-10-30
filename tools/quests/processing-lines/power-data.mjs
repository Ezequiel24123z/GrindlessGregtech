// The Power tab (power.snbt, in the Quality of Life group): every way to make power in the pack today, by tier, Steam to LuV, and
// what carries and stores it. Positions are relative to each cluster (pl-model.mjs places the clusters). Every number in a node's
// text is a figure (pl-lib.mjs#P) that pl-check.mjs recomputes from the dump, the pack's config or a script.
import { I, F, M, n, L, E, P, engineFluid, boilerWater, build, structure, network } from './pl-lib.mjs';
import { STATION_PACKAGES } from '../luv-stations.mjs';

// The wireless band uses the wireless energy branch's ids (ezequiel24123z-wireless-energy, bd7759a), which exist only once that
// branch is merged. false puts the marked slot back instead (GG_QUESTS_EXPECTED.power: [90, 102] with the band, [83, 93] without,
// with the LANDED set below; each package that lands adds its own nodes).
const WITH_WIRELESS = true;

// The LuV packages on this branch (docs/eras/luv.md, "Build order"; the names of tools/quests/luv-chapter/quests-data.mjs). A node
// or cluster tagged pkg: 'B6' (or ['B1', 'B6']: all of them) is left out, with every arrow into it, until its packages are here:
// when one lands, adding it to this set is the whole change. B7 lands as one of two: 'B7T' is the flux-tube tether, 'B7S' the
// sulfur-iodine plant that takes its slot if a second station fails (luv.md, 16b). The Io sites also wait for B1's places.
// S03, B7T and B7S are not listed here: they follow tables/stations.json (../luv-stations.mjs, the rule of lib/stations.js), so the
// tab never names the machine the pack leaves out. After the table flips, regenerate luv_age, pl_luv and power and lint
// (docs/quests.md, section 14).
export const LANDED = new Set(['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B8', 'B9', 'B10', ...STATION_PACKAGES]);
if (LANDED.has('B7T') && LANDED.has('B7S')) throw new Error('B7T and B7S are alternatives: only one of them lands');

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

// the chapter without what has not landed (LANDED): its clusters and nodes, the arrows into them, and bands left empty
function gate(ch) {
  const landed = (x) => [].concat(x.pkg || []).every((p) => LANDED.has(p));
  const clusters = {};
  const kept = new Set();
  for (const [ck, cl] of Object.entries(ch.clusters)) {
    if (!landed(cl)) continue;
    const nodes = cl.nodes.filter(landed);
    if (!nodes.length) continue;
    clusters[ck] = { ...cl, nodes };
    for (const nd of nodes) kept.add(nd.key);
  }
  const keyOf = (f) => (typeof f === 'string' ? f : f.k);
  for (const cl of Object.values(clusters)) cl.nodes = cl.nodes.map((nd) => ({ ...nd, from: nd.from.filter((f) => kept.has(keyOf(f))) }));
  const bands = ch.bands.map((b) => b.filter((ck) => clusters[ck])).filter((b) => b.length);
  return { ...ch, bands, clusters };
}

const ORBITAL_SOLAR = 'pack/kubejs/startup_scripts/grindless/luv/orbital_solar.js';
const IO_STARTUP = 'pack/kubejs/startup_scripts/grindless/luv/io_surface.js';
const IO_SERVER = 'pack/kubejs/server_scripts/grindless/luv/io_surface.js';

export default gate({
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
    ['luvNaq', 'luvSolar', 'luvFusion'],
    ['luvIo', 'luvTether', 'luvSI'],
    ['zpmNaq', 'zpmMk2'],
    ['uvThorium', 'uvLaser', 'uvMuon', 'uvMk3'],
    ['uhvSwarm', 'laterDyson', 'uivStars', 'uxvStars'],
    ['gHull', 'gBat', 'gCable', 'gFar', 'gBig'],
    ...(WITH_WIRELESS ? [['gWireless']] : []),
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
        E('eqRTG', 0, -0.75, 'iv_age', '503863FFACA225A8'),
        L('rtgp', 0, 0.75, 'pl_iv:rtgp'),
        n('rtg', 2.25, 0, M('gtceu:ev_rtg'), 'RTG Cell', {
          tier: 'iv', from: ['eqRTG', 'rtgp'], desc: 'Day and night, on any world, and one pellet keeps it going for a long while.',
          figs: [P.single(2048), P.fuel('grindless:rtg_pellet', '', 147456000, { unit: 'pellet' })],
        }),
      ],
    },
    ivFission: {
      name: 'Fission reactor',
      nodes: [
        E('eqFis', 0, -3, 'iv_age', '774234968F1BEB95'),
        L('leu', 0, -1.5, 'pl_iv:leu'),
        L('mox', 0, 0, 'pl_iv:mox'),
        L('breeder', 0, 1.5, 'pl_iv:breeder'),
        L('hw', 0, 3, 'pl_iv:hw2'),
        n('reactor', 2.5, 0, M('gtceu:fission_reactor'), 'Fission Reactor', {
          kind: 'ours', tier: 'iv', from: ['eqFis', 'leu', 'mox', 'breeder', 'hw'], desc: 'No smoke and no fuel line: a few assemblies run it for hours.',
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
        E('eqVen', 0, -0.75, 'iv_age', '5669D88DE37D633F'),
        L('dwv', 0, 0.75, 'pl_iv:dwv'),
        n('venus', 2.25, 0, M('gtceu:venus_heat_engine'), 'Venus Heat Engine', {
          kind: 'ours', tier: 'iv', from: ['eqVen', 'dwv'], desc: 'Venus is always at noon, so it never stops. The water leaves as steam for a turbine.',
          figs: [P.run(8192, { where: 'on Venus' })],
        }),
      ],
    },
    ivMercury: {
      name: 'Mercury solar field',
      nodes: [
        // no link to iv_age's Mercury Solar Field: it hangs off ev_age's Lunar Solar Array, linked in the EV band, and FTB would
        // draw that dependency between the two links, across the chart
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
    // ---------------------------------------------------------------- LuV (docs/eras/luv.md, "Power on the wireless network")
    luvNaq: {
      name: 'Naquadah reactor III',
      nodes: [
        E('eqRx', 0, -0.75, 'luv_age', '3D5EC5039EBDE967'),
        // the fuel and the cell come from the LuV chart (pl_luv): the peek quest that stood here is that chart's rod now
        L('naqbolt', 0, 0.75, 'pl_luv:lrod'),
        n('naqReactor', 2.25, 0, M('gtnn:luv_naquadah_reactor'), 'Naquadah Reactor III', {
          tier: 'luv', from: ['eqRx', 'naqbolt'], sub: 'GT--\'s single block; a wireless dynamo cover on it does the rest',
          desc: 'One rod keeps it humming for a long while, then comes back spent. The naquadah plant re-enriches part of it, never all of it.',
          figs: [P.single(32768), P.wnet(31130, 32768), P.fuel('gtceu:long_enriched_naquadah_rod', '', 999948288, { unit: 'rod' })],
        }),
        n('naqSpent', 4.5, 0, I('gtceu:long_naquadah_rod'), 'Spent Rod, Back', { kind: 'ret', from: ['naqReactor'], sub: 'Macerated, then back into the naquadah plant\'s mode 2' }),
      ],
    },
    luvSolar: {
      name: 'Orbital solar station',
      pkg: 'B2',
      nodes: [
        n('ospCell', 0, 0, I('gcyr:photovoltaic_cell'), 'Photovoltaic Cell', { kind: 'raw', sub: 'GCYR\'s LuV cell, on naquadah wafers' }),
        E('eqOSS', 2.25, -1.5, 'luv_age', '3F2030C8DDEDB9FF', { pkg: 'S03' }),
        n('ospPanel', 2.25, 0, I('grindless:orbital_solar_panel'), 'Orbital Solar Panel', { from: ['ospCell'], sub: 'The assembler makes it; triple-junction cells give two at once' }),
        n('orbital', 4.5, 0, M('gtceu:orbital_solar_station', 'gtceu:orbital_solar'), 'Orbital Solar Station', {
          kind: 'ours', tier: 'luv', from: ['eqOSS', structure('ospPanel')], sub: 'A LuV wireless dynamo hatch sends it home',
          desc: 'The sky up there is stuck at midnight, and the panels don\'t care: one counts while its top sees open sky. It burns nothing, so no fuel bonus either.',
          figs: [P.run(630, { per: 'a lit panel', where: 'in Earth orbit', recipe: 'grindless:orbital_solar/earth', solar: ORBITAL_SOLAR }),
            P.max(40320, 64, 630, { file: ORBITAL_SOLAR, re: 'panels: (\\d+)' }), P.wnet(38304, 40320)],
        }),
      ],
    },
    luvFusion: {
      name: 'Fusion',
      nodes: [
        E('eqFus', 0, -2.25, 'luv_age', '543F014BB97A45F4'),
        n('deut', 0, -0.75, F('gtceu:deuterium'), 'Deuterium', { kind: 'raw', sub: 'Heavy water through the electrolyzer' }),
        L('tritium', 0, 0.75, 'pl_iv:tritium'),
        n('mg', 0, 2.25, F('gtceu:magnesium'), 'Magnesium', { kind: 'raw', pkg: 'B10', sub: 'Molten, with oxygen beside it' }),
        n('fusion', 2.25, 0, M('gtceu:luv_fusion_reactor'), 'Fusion Reactor Mk1', {
          tier: 'luv', from: ['eqFus', 'deut', 'tritium', 'mg'], sub: 'A materials machine first: europium, lutetium and chromium',
          desc: 'Deuterium and tritium give a little power, and the Moon\'s tritium decides how little.',
        }),
        n('plasma', 4.5, -0.75, F('gtceu:helium_plasma'), 'Helium Plasma', { from: ['fusion'] }),
        n('caPlasma', 4.5, 0.75, F('gtca:calcium_plasma_plasma'), 'Calcium Plasma', {
          pkg: 'B10', from: ['fusion'], sub: 'GTCA\'s, and no tritium in it',
          desc: 'The fusion power that doesn\'t wait on the Moon. What it nets after paying the Mk1 gets measured on the bench before it earns a number here.',
        }),
        n('plasmaT', 6.75, 0, M('gtceu:plasma_large_turbine'), 'Large Plasma Turbine', {
          tier: 'luv', from: ['plasma', 'caPlasma'], figs: [P.turbine(65536), P.fuel('fluid:gtceu:helium_plasma', 'helium plasma', 163840)],
        }),
      ],
    },
    luvIo: {
      name: 'Volcanic intake',
      pkg: 'B6',
      nodes: [
        // no link to the book's Patera: in luv_age, Fusion depends on it, and FTB Quests would draw that line across this tab
        L('so2', 0, -0.75, 'pl_luv:so2'),
        L('bundle', 0, 0.75, 'pl_luv:bundle'),
        n('intake', 2.25, 0, M('gtceu:volcanic_intake', 'gtceu:volcanic_heat'), 'Volcanic Intake', {
          kind: 'ours', tier: 'luv', from: ['so2', 'bundle'], sub: 'Standing on a patera\'s magma',
          desc: 'Io\'s tidal heat boils a sulfur dioxide loop. Jupiter pays for it, not you, but the bundles still wear out. More turbine modules, more runs at once.',
          figs: [P.run(32768, { per: 'a turbine module', where: 'on Io', recipe: 'grindless:volcanic_heat/patera', src: { file: IO_SERVER, re: 'intake: \\{ circuit: \\d+, eut: (\\d+)' } }),
            P.max(131072, 4, 32768, { file: IO_STARTUP, re: '\\{ sym: \'\\w\', col: \\d+, row: \\d+ \\}', count: true }), P.wnet(124518, 131072),
            P.fuel('grindless:heat_exchanger_bundle', '', 2340571429, { unit: 'bundle' })],
        }),
      ],
    },
    luvTether: {
      name: 'Flux-tube tether',
      pkg: ['B1', 'B7T'],
      nodes: [
        n('spool', 0, -0.75, I('grindless:tether_spool'), 'Tether Spool', { kind: 'raw', sub: 'Used up now and then' }),
        n('argon', 0, 0.75, F('gtceu:argon'), 'Argon', { kind: 'raw', sub: 'From Mars, for the hollow cathode' }),
        n('tether', 2.25, 0, M('gtceu:flux_tube_tether', 'gtceu:electrodynamic_tether'), 'Flux-Tube Tether', {
          kind: 'ours', tier: 'luv', from: ['spool', 'argon'], sub: 'Io orbit only',
          desc: 'A long bare wire dragged through Jupiter\'s plasma torus, which spins far faster than Io moves. It needs neither ground nor fuel, and its wireless dynamo hatch feeds every base.',
          figs: [P.run(65536, { per: 'a spool cell', where: 'in Io orbit' })],
        }),
      ],
    },
    luvSI: {
      name: 'Sulfur-iodine plant',
      pkg: ['B1', 'B7S'],
      nodes: [
        n('siWater', 0, 0, F('minecraft:water'), 'Water', { kind: 'raw', sub: 'Europa\'s, carried over' }),
        n('si', 2.25, 0, M('gtceu:sulfur_iodine_plant', 'gtceu:thermochemical_hydrogen'), 'Sulfur-Iodine Plant', {
          kind: 'ours', tier: 'luv', from: ['siWater'], sub: 'Not a generator: hydrogen from Io\'s heat, on Io only',
          desc: 'Io supplies the heat, so its hydrogen costs a fraction of the electrolyzer\'s power. The sulfur and the iodine go round and round.',
          figs: [P.uses(30)],
        }),
        n('siH2', 4.5, 0, F('gtceu:hydrogen'), 'Hydrogen', { kind: 'product', from: ['si'], sub: 'For the naquadah plant, the Mk1 and the Europan culture' }),
      ],
    },
    // ---------------------------------------------------------------- ZPM (docs/eras/zpm.md, "Power"); figures wait for a bench measurement
    zpmNaq: {
      name: 'Large naquadah reactor',
      nodes: [
        E('eqBig', 0, 0, 'zpm_age', '54B43A225E11111F'),
        n('zpmReactor', 2.25, 0, M('gtnn:large_naquadah_reactor'), 'Large Naquadah Reactor', {
          kind: 'info', tier: 'zpm', from: ['eqBig'], sub: 'Excited fuel from the Mk2; the spent fuel goes back to the fuel works',
          desc: 'The era\'s main plant, on duranium frames. It only pays on fuel the Mk2 has excited.',
        }),
      ],
    },
    zpmMk2: {
      name: 'Fusion Reactor Mk2',
      nodes: [
        E('eqMk2', 0, -0.75, 'zpm_age', '38199670D4113E48'),
        E('eqDec', 0, 0.75, 'zpm_age', '7E64F29B6EE66B09'),
        n('zpmFusion', 2.25, -0.75, M('gtceu:zpm_fusion_reactor'), 'Fusion Reactor Mk2', {
          kind: 'info', tier: 'zpm', from: ['eqMk2'], sub: 'Deuterium and helium-3 from Saturn; the plasma goes to a turbine or the converter',
          desc: 'Helium-3 fusion needs no tritium. Its plasma is worth more in the direct energy converter than in a turbine.',
        }),
        n('zpmConv', 2.25, 0.75, I('gtceu:direct_energy_converter'), 'Direct Energy Converter', {
          kind: 'info', tier: 'zpm', from: ['eqDec'], sub: 'Takes the charge off the plasma with no turbine',
          desc: 'The cooled gas comes back out, so only the heat is lost.',
        }),
      ],
    },
    // ---------------------------------------------------------------- UV (docs/eras/uv.md, "Power"); figures wait for a bench measurement
    uvThorium: {
      name: 'Accelerator-driven reactor',
      nodes: [
        E('eqAdr', 0, 0, 'uv_age', '531F95CE48EB6C79'),
        n('uvAdr', 2.25, 0, M('gtceu:accelerator_driven_reactor'), 'Accelerator-Driven Reactor', {
          kind: 'info', tier: 'uv', from: ['eqAdr'], sub: 'Thorium assemblies; the spent fuel goes to the pyroprocessing cell',
          desc: 'A proton beam drives a subcritical thorium core, so it stops the moment the beam does. The lead-bismuth pool is never used up.',
        }),
      ],
    },
    uvLaser: {
      name: 'Laser fusion chamber',
      nodes: [
        E('eqAlpha', 0, 0, 'uv_age', '11FAD777A18E748F'),
        n('uvLaserF', 2.25, 0, M('gtceu:laser_fusion_chamber'), 'Laser Fusion Chamber', {
          kind: 'info', tier: 'uv', from: ['eqAlpha'], sub: 'One capsule a shot; boron or D-He3, no neutrons to speak of',
          desc: 'The fibre lasers wear out now and then; the draw tower refurbishes them. The helium goes to the network.',
        }),
      ],
    },
    uvMuon: {
      name: 'Muon fusion cell',
      nodes: [
        E('eqMucf', 0, 0, 'uv_age', '1225702AF9F2A2E4'),
        n('uvMuonF', 2.25, 0, M('gtceu:muon_fusion_cell'), 'Muon Fusion Cell', {
          kind: 'info', tier: 'uv', from: ['eqMucf'], sub: 'Liquid D-T; the blanket breeds most of the tritium back',
          desc: 'An extrapolation: real muon-catalysed fusion never broke even, because each muon is lost too soon. This machine assumes it does.',
        }),
      ],
    },
    uvMk3: {
      name: 'Fusion Reactor Mk3',
      nodes: [
        E('eqMk3', 0, 0, 'uv_age', '387E0EB82EC57EC4'),
        n('uvFusion', 2.25, 0, M('gtceu:uv_fusion_reactor'), 'Fusion Reactor Mk3', {
          kind: 'info', tier: 'uv', from: ['eqMk3'], sub: 'GregTech\'s own; its plasma goes to a turbine',
          desc: 'It lights plasmas the Mk2 can\'t even start. Feed it through UV energy hatches.',
        }),
      ],
    },
    // ---------------------------------------------------------------- UHV
    // figures wait for a bench measurement (as UV's rows): EU/t of the stations is in docs/eras/uhv.md, "Power"
    uhvSwarm: {
      name: 'The Swarm (UHV)',
      nodes: [
        E('eqSwarm', 0, 0, 'uhv_age', '7AAE7008AA466590'),
        n('uhvSwarm', 2.25, 0, M('gtceu:swarm_control_station'), 'Swarm Control Station', {
          kind: 'info', tier: 'uhv', from: ['eqSwarm'], sub: 'Mercury\'s segments beam power home; two stations feed one bank, which loses 5%',
          desc: 'The segments wear, so keep the refurbishing going: worn ones come back as film and aluminium.',
        }),
      ],
    },
    // ---------------------------------------------------------------- UIV
    // figures wait for a bench measurement (as UHV's row): EU/t of the plants is in docs/eras/uiv.md, "Power"
    uivStars: {
      name: 'Dead stars (UIV)',
      nodes: [
        E('eqUivRing', 0, -1.5, 'uiv_age', '72D797E3DDE7ED0E'),
        E('eqUivVault', 0, 0, 'uiv_age', '7AB8B56ED4A5C759'),
        E('eqUivPenrose', 0, 1.5, 'uiv_age', '773D4D794D1EA7A1'),
        n('uivRing', 2.25, -1.5, M('gtceu:uiv_fusion_reactor'), 'Mk5 Fusion Ring', {
          kind: 'info', tier: 'uiv', from: ['eqUivRing'], sub: 'Three polarised fuels, and a direct converter takes the power off the ash',
          desc: 'Each fuel is its own recipe on the ring, and the ash of one is the feed of another.',
        }),
        n('uivVault', 2.25, 0, M('gtceu:decay_heat_vault'), 'Decay Heat Vault', {
          kind: 'info', tier: 'uiv', from: ['eqUivVault'], sub: 'Aged kilonova capsules give their heat back as power',
          desc: 'It only makes power; nothing comes out of it but heat and the ash of the capsule.',
        }),
        n('uivPenrose', 2.25, 1.5, M('gtceu:penrose_engine'), 'Penrose Engine', {
          kind: 'info', tier: 'uiv', from: ['eqUivPenrose'], sub: 'A sled dropped into the ergosphere comes back lighter, and the engine keeps the difference',
          desc: 'It runs at Cygnus X-1 only; the half-sled that returns is refitted into the next charge.',
        }),
      ],
    },
    // ---------------------------------------------------------------- UXV
    // figures wait for a bench measurement (as UIV's row): EU/t of the plants is in docs/eras/uxv.md, "Power"
    uxvStars: {
      name: 'Strange stars (UXV)',
      nodes: [
        // (the links to the uxv_age quests 5CE1C18D40A0B8E2 'Mk6 Fusion Ring', 3611A4EAC7D055C3 'Spin Down a Black Hole' and
        // 50C6BE5A52F4F9A0 'Tap the Polar Cap' go in once that chapter is in the book: eqUxvRing, eqUxvBZ and eqUxvTap at x 0)
        n('uxvRing', 2.25, -1.5, M('gtceu:uxv_fusion_reactor'), 'Mk6 Fusion Ring', {
          kind: 'info', tier: 'uxv', sub: 'A star\'s burning stages, one after another, and a direct converter takes the power off each ash',
          desc: 'Hot CNO, helium, carbon and oxygen: the ash of each burn is quenched into the fuel of the next.',
        }),
        n('uxvBZ', 2.25, 0, M('gtceu:bz_dynamo'), 'BZ Dynamo', {
          kind: 'info', tier: 'uxv', sub: 'Flux-loaded plasma spins power out of the black hole',
          desc: 'It runs at Cygnus X-1 only, and the FRC former loads its plasma.',
        }),
        n('uxvTap', 2.25, 1.5, M('gtceu:polar_cap_tap'), 'Polar Cap Tap', {
          kind: 'info', tier: 'uxv', sub: 'A lasagna electrode in the pulsar\'s polar current, burned through',
          desc: 'It runs at Vela only; the pasta laminator makes the electrodes.',
        }),
      ],
    },
    // ---------------------------------------------------------------- later
    laterDyson: {
      name: 'Dyson sphere',
      nodes: [
        n('dysonCell', 0, 0, I('gcyr:dyson_solar_cell'), 'Dyson Solar Cell', { kind: 'peek' }),
        n('dyson', 2.25, 0, M('gcyr:dyson_system_controller'), 'Dyson Sphere', { kind: 'peek', from: ['dysonCell'], sub: 'UEV: a star wrapped in panels' }),
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
      name: 'Power substation',
      nodes: [
        n('lapo', 0, 0, I('gtceu:lapotron_crystal'), 'Lapotron Crystal', { kind: 'raw' }),
        n('pss', 2.25, 0, I('gtceu:power_substation'), 'Power Substation', { kind: 'info', from: ['lapo'], sub: 'One battery the size of a building; it wants a LuV circuit' }),
        // without the wireless band, the network keeps a marked place here
        ...(WITH_WIRELESS ? [] : [n('wireless', 4.5, 0, I('minecraft:lightning_rod'), 'Wireless Energy Network', { kind: 'slot', alone: true, sub: 'Coming soon, tower and all' })]),
      ],
    },
    // ---------------------------------------------------------------- the wireless network (tables/wireless_energy.json)
    ...(WITH_WIRELESS ? { gWireless: {
      name: 'Wireless energy network',
      nodes: [
        n('wbat', 0, 0, I('gtceu:lv_lithium_battery'), 'Batteries', { kind: 'raw', sub: 'Any battery of the cell\'s tier' }),
        E('eqSMES', 0, 4, 'luv_age', '5933ADF51C8949BD', { pkg: 'A4' }),
        n('wcell', 2.25, 0, I('grindless:lv_capacitor_cell'), 'Capacitor Cell', {
          kind: 'info', from: ['wbat'], sub: 'The weakest cell in any tower sets the network\'s voltage',
          desc: 'Batteries of its tier in a block. An empty slot takes the tower\'s casing.',
          figs: [P.wcell('grindless:lv_capacitor_cell', 'LV', 720000), P.wcell('grindless:mv_capacitor_cell', 'MV', 2520000),
            P.wcell('grindless:hv_capacitor_cell', 'HV', 10800000), P.wcell('grindless:ev_capacitor_cell', 'EV', 61440000),
            P.wcell('grindless:iv_capacitor_cell', 'IV', 245760000)],
        }),
        n('wtower', 4.5, 0, M('gtceu:wireless_energy_tower'), 'Wireless Energy Tower', {
          kind: 'ours', tier: 'lv', from: [structure('wcell'), structure('wsmes')], figs: [P.wslots(32), P.wloss(5)],
          sub: 'One network for every world and every player', desc: 'No tower, no network: build it before any hatch or cover.',
        }),
        // LuV's cell (package A4): wound in the HTS magnet works, not assembled from batteries (the table's cellMadeBy); the works
        // is the LuV chart's (pl_luv)
        L('hmw', 0, 2.25, 'pl_luv:mw', { pkg: 'A4' }),
        n('wsmes', 2.25, 2.25, I('grindless:luv_smes_cell'), 'LuV SMES Cell', {
          kind: 'info', pkg: 'A4', from: ['eqSMES', 'hmw'], sub: 'LuV\'s cell is a superconducting coil, wound rather than assembled',
          desc: 'The network jumps to LuV only when every formed tower holds these. Until then, a multiblock with two IV wireless energy hatches reaches LuV the usual GregTech way.',
          figs: [P.wcell('grindless:luv_smes_cell', 'LuV SMES', 983040000)],
        }),
        // UHV's cell: 24 UV naquadria batteries' worth (GTM's tier-9 battery is Long.MAX_VALUE), wound in the naquadria magnet works
        E('eqUhvCell', 0, 6, 'uhv_age', '5E6B4DEB712EECBE'),
        n('wuhv', 2.25, 6, I('grindless:uhv_smes_cell'), 'UHV SMES Cell', {
          kind: 'info', from: ['eqUhvCell'], sub: 'Twenty-four UV batteries\' worth, wound with RTAN wire',
          desc: 'The network jumps to UHV only when every formed tower holds these; the nuclear clock keeps it in step.',
          figs: [P.wcell('grindless:uhv_smes_cell', 'UHV SMES', 62914560000)],
        }),
        // UEV's cell: four UHV cells' worth, with the quantum repeater keeping the network in step
        E('eqUevCell', 0, 8, 'uev_age', '5304F9E360A95261'),
        n('wuev', 2.25, 8, I('grindless:uev_smes_cell'), 'UEV SMES Cell', {
          kind: 'info', from: ['eqUevCell'], sub: 'Ninety-six UV batteries\' worth, the UEV wireless hatches work with it',
          desc: 'The network jumps to UEV only when every formed tower holds these.',
          figs: [P.wcell('grindless:uev_smes_cell', 'UEV SMES', 251658240000)],
        }),
        // UIV's cell: four UEV cells' worth
        E('eqUivCell', 0, 10, 'uiv_age', '5FB006B879741A02'),
        n('wuiv', 2.25, 10, I('grindless:uiv_smes_cell'), 'UIV SMES Cell', {
          kind: 'info', from: ['eqUivCell'], sub: 'Three hundred and eighty-four UV batteries\' worth, wound in metallic hydrogen',
          desc: 'The network jumps to UIV only when every formed tower holds these.',
          figs: [P.wcell('grindless:uiv_smes_cell', 'UIV SMES', 1006632960000)],
        }),
        // UXV's cell: four UIV cells' worth, wound with pasta strand tape in the nitride magnet works
        // (the link to the uxv_age quest 3F5ABDEF2254EC50 'UXV SMES Cell' goes in once that chapter is in the book: eqUxvCell at 0, 12)
        n('wuxv', 2.25, 12, I('grindless:uxv_smes_cell'), 'UXV SMES Cell', {
          kind: 'info', sub: 'Fifteen hundred and thirty-six UV batteries\' worth, wound with pasta strand',
          desc: 'The network jumps to UXV only when every formed tower holds these.',
          figs: [P.wcell('grindless:uxv_smes_cell', 'UXV SMES', 4026531840000)],
        }),
        n('wdynH', 6.75, -2.25, I('gtceu:lv_wireless_dynamo_hatch'), 'Wireless Dynamo Hatch', {
          kind: 'info', from: [network('wtower')], sub: 'Generator multiblocks feed the network through it',
          desc: 'Energy goes in at any voltage; the cells only limit what comes out.', figs: [P.wamps([2, 4, 16, 64], 'lv', 'uxv')],
        }),
        n('wdynC', 6.75, -0.75, I('grindless:lv_wireless_dynamo_cover'), 'Wireless Dynamo Cover', {
          kind: 'info', from: [network('wtower')], sub: 'On a generator or a battery buffer, it feeds the network', figs: [P.wcover(2, 'lv', 'uxv')],
        }),
        n('wenH', 6.75, 0.75, I('gtceu:lv_wireless_energy_hatch'), 'Wireless Energy Hatch', {
          kind: 'info', from: [network('wtower')], sub: 'Multiblocks draw from the network through it',
          desc: 'Above the network\'s voltage it gets nothing; shift-right-click it with an empty hand to see why.', figs: [P.wamps([2, 4, 16, 64], 'lv', 'uxv')],
        }),
        n('wenC', 6.75, 2.25, I('grindless:lv_wireless_energy_cover'), 'Wireless Energy Cover', {
          kind: 'info', from: [network('wtower')], sub: 'Single machines draw through it, on any side but the front',
          desc: 'GTM machines, chargers and battery buffers, not converters or multiblock controllers; shift-right-click with an empty hand for the readout.', figs: [P.wcover(2, 'lv', 'uxv')],
        }),
      ],
    } } : {}),
  },
});
