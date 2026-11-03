// pl_luv: the LuV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
//
// LuV lands in packages (docs/eras/luv.md, "Build order"). Every cluster or node tagged pkg: '<package>' stays out of the chart,
// arrows and all, until that package is in LANDED; its place in the layout is kept, so landing a package moves nothing else.
// pending: { <package>: { ...opts } } is what a node says while that package is still out. Landing one is adding it to LANDED.
// The pending clusters sit in the bands below the landed ones; their ids follow luv.md and are checked when their package lands.
// S03, B7T and B7S are not listed by hand: they follow tables/stations.json (../luv-stations.mjs, the rule of lib/stations.js). Io
// orbit's slot holds one of two, never both: the flux-tube tether (B7T) or, if a second station fails, the sulfur-iodine plant on
// Io (B7S). After the table flips, regenerate luv_age, pl_luv and power and lint (docs/quests.md, section 14).
import { I, F, M, n, L, via, build, structure, network, R, rateText } from './pl-lib.mjs';
import { STATION_PACKAGES } from '../luv-stations.mjs';

// The carbonyl line's rate cards (AUD3-RATES): every figure is recomputed from the recipe dump by pl-check.mjs
const LCR = 'grindless:large_chemical_reactor/';
const MOND_CARD = R.rate(LCR + 'mond_crushed', { tier: 'luv' }, {
  title: 'One Mond reactor', eut: 1920, ticks: 400,
  ins: { 'fluid:gtceu:carbon_monoxide': 108000, 'gtceu:crushed_meteoric_iron_ore': 48 },
  outs: { 'fluid:gtceu:crude_metal_carbonyl': 24000, 'gtceu:iron_dust': 60, 'gtceu:cobalt_dust': 3, 'grindless:asteroid_pgm_concentrate': 3 },
  hatch: { 'fluid:gtceu:carbon_monoxide': 36000, 'fluid:gtceu:crude_metal_carbonyl': 8000 },
  note: 'The iron, cobalt and concentrate leave by the output bus.',
});
const SPLIT_CARD = R.ratio({ recipe: LCR + 'mond_crushed', tier: 'luv' }, { recipe: 'grindless:distillation_tower/crude_carbonyl_split', tier: 'luv' }, 'fluid:gtceu:crude_metal_carbonyl', 2, 1, {
  title: 'Bottleneck', make: 24000, take: 48000, prodName: 'Mond reactors', consName: 'distillation tower',
  note: 'The Mond reactor is the slow step, so two feed one tower.',
});
const FEED_CARD = R.ratio({ recipe: 'grindless:distillation_tower/crude_carbonyl_split', tier: 'luv' }, { recipe: LCR + 'nickel_carbonyl_decomposition', tier: 'luv' }, 'fluid:gtceu:nickel_tetracarbonyl', 1, 1, {
  title: 'Tower to decomposers', make: 24000, take: 24000, prodName: 'distillation tower', consName: 'nickel decomposers',
  note: 'The iron half needs one more decomposer. Both halves together return 36,000 mB of carbon monoxide per run, which is exactly one Mond charge.',
});
const FE_CO = { 'fluid:gtceu:iron_pentacarbonyl': 1000 };
const IRON_CARD = R.cmp('gtceu:iron_dust', 1, 'Iron from iron pentacarbonyl', { tier: 'luv' }, [
  { label: 'Decomposition', recipe: LCR + 'iron_carbonyl_decomposition', perMin: 24, eu: 96000, ins: FE_CO, out: { 'fluid:gtceu:carbon_monoxide': 5000 } },
  { label: 'Large-reactor powder', recipe: LCR + 'carbonyl_iron_powder', key: 'grindless:carbonyl_iron_powder', perMin: 6, eu: 1536000, ins: FE_CO, out: { 'fluid:gtceu:carbon_monoxide': 5000 } },
  { label: 'Small-reactor powder', recipe: 'grindless:chemical_reactor/carbonyl_iron_powder', key: 'grindless:carbonyl_iron_powder', perMin: 6, eu: 1536000, ins: FE_CO, out: { 'fluid:gtceu:carbon_monoxide': 5000 } },
], {
  what: 'one iron unit', dominates: [['Decomposition', 'Large-reactor powder'], ['Decomposition', 'Small-reactor powder']],
  verdict: 'The powder is its own item, not iron dust, so nothing replaces it; but it costs 16 times the EU per unit at a quarter of the rate, and the small and large reactor give the same figures. Proposed balance decision for the owner.',
});

export const LANDED = new Set(['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B8', 'B9', 'B10', ...STATION_PACKAGES]);
if (LANDED.has('B7T') && LANDED.has('B7S')) throw new Error('B7T and B7S are alternatives: only one of them lands');

export default {
  file: 'pl_luv',
  order: 6,
  title: 'LuV Lines',
  subtitle: 'Trinium and enriched naquadah, superconducting tape and magnets, living circuits, and the first factories in orbit.',
  icon: 'gtceu:hts_magnet_works',
  focus: 'enox',
  landed: LANDED,
  bands: [['naquadah', 'reactor'], ['tape', 'magnets', 'network'], ['biofoundry', 'organoid'], ['pedot'], ['optics'], ['wake', 'grower'], ['germanium'], ['fusion', 'research'],
    ['io', 'ioorbit'], ['belt', 'miner'], ['europa', 'ganymede'], ['travel']],
  clusters: {
    // ---------------------------------------------------------------- A2 (naquadah plant mode 2) and A3 (helium refrigerator)
    naquadah: {
      name: 'Trinium and enriched naquadah',
      line: 'trinium',
      nodes: [
        L('nqore', 0, -2.25, 'pl_iv:rawnq'),
        n('enox', 2, -2.25, I('gtceu:enriched_naquadah_oxide_mixture_dust'), 'Enriched Naquadah Oxide', {
          from: ['nqore'], by: ['gtceu:ore_processing'], sub: 'Ore plant: the Venus ore carries a little',
        }),
        n('fluorine', 2, -0.75, F('gtceu:fluorine'), 'Fluorine', { kind: 'raw', sub: 'The fluorspar kiln\'s acid, split in the electrolyzer' }),
        L('xe', 2, 0.75, 'pl_iv:xe'),
        L('pube', 2, 2.25, 'pl_iv:pube'),
        n('plant', 4.5, 0, M('gtceu:naquadah_plant'), 'Naquadah Plant, Mode 2', {
          kind: 'ours', from: ['enox', 'fluorine', 'xe', 'pube'], sub: 'Circuit 2',
          desc: ['GT--\'s enriched line in one hall, and nothing leaks out of it.', 'The xenon, gold and antimony go in once and stay put. Only the fluorine, the hydrogen and the oxide get used up.'],
        }),
        n('sulfate', 7, -2.25, I('gtceu:enriched_naquadah_sulfate_dust'), 'Enriched Naquadah Sulfate', { from: ['plant'] }),
        n('tsulf', 7, -0.75, I('gtceu:trinium_sulfide_dust'), 'Trinium Sulfide', { from: ['plant'] }),
        n('naquadria', 7, 0.5, F('gtceu:impure_naquadria_solution'), 'Impure Naquadria Solution', {
          kind: 'by', from: ['plant'], end: 'contained for ZPM', sub: 'Radioactive: tanked and kept for ZPM',
        }),
        n('hfb', 7, 1.75, F('gtceu:hydrofluoric_acid'), 'Hydrofluoric Acid', { kind: 'by', from: ['plant'], end: 'mode 1', sub: 'Back to mode 1, which drinks it' }),
        n('tib', 7, 3, I('gtceu:titanium_ingot'), 'Titanium', { kind: 'by', from: ['plant'], end: 'titanium', sub: 'Into the titanium you already use' }),
        n('hotenq', 9.25, -2.25, I('gtceu:hot_enriched_naquadah_ingot'), 'Hot Enriched Naquadah', {
          from: ['sulfate'], by: ['gtceu:electric_blast_furnace'], sub: 'EBF at 7,000 K, with hydrogen',
        }),
        n('hottr', 9.25, -0.75, I('gtceu:hot_trinium_ingot'), 'Hot Trinium', {
          from: ['tsulf'], by: ['gtceu:electric_blast_furnace'], sub: 'EBF at 7,200 K, with zinc',
        }),
        L('lhe', 9.25, 0.75, 'pl_ev:lhe'),
        L('ln2', 9.25, 2.25, 'pl_ev:ln2'),
        n('refrig', 11.75, -0.75, M('gtceu:helium_refrigerator', 'gtceu:closed_loop_cooling'), 'Helium Refrigerator', {
          kind: 'ours', from: ['hotenq', 'hottr', 'lhe', 'ln2'],
          desc: ['Cools hot ingots and keeps the helium. The vacuum freezer throws half of it away every time; this loses a sip.', 'Liquid nitrogen does the first part of the chill.'],
        }),
        n('enq', 14.25, -2.25, I('gtceu:enriched_naquadah_ingot'), 'Enriched Naquadah', { kind: 'product', from: ['refrig'], sub: 'Reactor rods, below' }),
        n('trin', 14.25, -0.75, I('gtceu:trinium_ingot'), 'Trinium', { kind: 'product', from: ['refrig'], sub: 'The magnet works\' coils, and the naquadah coil' }),
        n('n2', 14.25, 0.75, F('gtceu:nitrogen'), 'Nitrogen', { kind: 'by', from: ['refrig'], end: 'cryogenic plant', sub: 'Back to the cryogenic plant, or the air' }),
      ],
    },
    reactor: {
      name: 'Reactor III and the spent rods',
      role: 'power',
      nodes: [
        n('enq2', 0, 0, I('gtceu:enriched_naquadah_ingot'), 'Enriched Naquadah', { kind: 'raw', sub: 'From the refrigerator' }),
        n('lrod', 2, 0, I('gtceu:long_enriched_naquadah_rod'), 'Long Enriched Naquadah Rod', {
          from: [via('enq2', 'gtceu:enriched_naquadah_rod')], sub: 'Lathe, then the forge hammer',
        }),
        n('r3', 4.25, 0, M('gtnn:luv_naquadah_reactor', 'gtceu:naquadah_reactor'), 'Naquadah Reactor III', { from: ['lrod'], sub: 'GT--\'s; its power goes to the network' }),
        n('spent', 6.5, 0, I('gtceu:long_naquadah_rod'), 'Spent Naquadah Rod', { from: ['r3'] }),
        n('nqd', 8.5, 0, I('gtceu:naquadah_dust'), 'Naquadah Dust', { from: ['spent'], by: ['gtceu:macerator'], recycle: true, sub: 'Macerator' }),
        n('back', 10.5, 0, M('gtceu:naquadah_plant'), 'Naquadah Plant, Circuit 3', {
          kind: 'ret', from: ['nqd'], sub: 'Re-enriched, partly',
          desc: 'The plant pulls what\'s left of the enriched naquadah back out of a spent rod. It\'s only a fraction, so the reactor still wants fresh fuel.',
        }),
      ],
    },
    // ---------------------------------------------------------------- A3 (coated conductor line), A4 (HTS magnet works), B2 and A4's network
    tape: {
      name: 'Mond process and coated conductor',
      line: 'hts',
      nodes: [
        n('cmi2', 0, -0.75, I('gtceu:crushed_meteoric_iron_ore'), 'Crushed Meteoric Iron', { kind: 'raw', sub: 'The belt\'s, macerated (or its meteoric iron dust)' }),
        n('co', 0, 0.75, F('gtceu:carbon_monoxide'), 'Carbon Monoxide', { kind: 'raw', sub: 'A charge; the optical miner tops it up' }),
        n('mond', 2.25, 0, M('gtceu:large_chemical_reactor', 'gtceu:large_chemical_reactor'), 'Mond Process', {
          from: ['cmi2', 'co'], sub: 'Large chemical reactor: 16 ore, 36,000 mB carbon monoxide', figs: [MOND_CARD],
          desc: ['Carbon monoxide carries the iron, nickel and cobalt off as gas. The platinum metals stay behind as a concentrate.', rateText(MOND_CARD)],
        }),
        n('crude', 4.5, 0, F('gtceu:crude_metal_carbonyl'), 'Crude Metal Carbonyl', { from: ['mond'] }),
        n('conc', 4.5, 2.25, I('grindless:asteroid_pgm_concentrate'), 'Asteroid PGM Concentrate', { from: ['mond'] }),
        n('dist', 6.75, 0, M('gtceu:distillation_tower', 'gtceu:distillation_tower'), 'Distillation Tower', { from: ['crude'], sub: 'Nickel and iron carbonyl boil apart', figs: [SPLIT_CARD, FEED_CARD], desc: [rateText(SPLIT_CARD), rateText(FEED_CARD)] }),
        n('pplant', 7.5, 3, M('gtceu:platinum_plant'), 'Platinum Plant, Mode 4', {
          kind: 'ours', from: ['conc'], sub: 'Circuit 4',
          desc: 'The EV plant learns a fourth trick. Everything the concentrate holds comes out, and the leftover sludge splits into the other four metals.',
        }),
        n('nico', 9, -0.75, F('gtceu:nickel_tetracarbonyl'), 'Nickel Tetracarbonyl', { from: ['dist'] }),
        n('feco', 9, 0.75, F('gtceu:iron_pentacarbonyl'), 'Iron Pentacarbonyl', { from: ['dist'] }),
        n('ir', 10, 2.25, I('gtceu:iridium_dust'), 'Iridium', { kind: 'product', from: ['pplant'] }),
        n('os', 10, 3.75, I('gtceu:osmium_dust'), 'Osmium', { kind: 'product', from: ['pplant'] }),
        n('pgs', 10, 5, I('gtceu:platinum_group_sludge_dust'), 'Platinum Group Sludge', {
          kind: 'by', role: 'resource', from: ['pplant'], end: 'circuit 2', sub: 'Circuit 2: platinum, palladium, rhodium, ruthenium',
        }),
        n('decomp', 11.25, 0, M('gtceu:large_chemical_reactor', 'gtceu:large_chemical_reactor'), 'Carbonyl Decomposition', {
          from: ['nico', 'feco'], sub: 'Heated, they fall apart into metal and carbon monoxide', figs: [IRON_CARD], desc: [rateText(IRON_CARD)],
        }),
        n('ni', 13.5, -0.75, I('gtceu:nickel_dust'), 'Nickel', { from: ['decomp'], sub: 'Four dust a run' }),
        n('fe', 13.5, 0.75, I('gtceu:iron_dust'), 'Iron', { kind: 'by', role: 'resource', from: ['decomp'], end: 'network', sub: 'With the cobalt: to the network' }),
        n('cob', 13.5, 2.25, F('gtceu:carbon_monoxide'), 'Carbon Monoxide, Back', { kind: 'ret', from: ['decomp'], sub: 'Back into the Mond process' }),
        L('w', 15.75, -2.25, 'pl_ev:wdust'),
        n('niw', 15.75, -0.75, I('gtceu:nickel_tungsten_dust'), 'Nickel-Tungsten Alloy', { from: ['ni', 'w'], by: ['gtceu:mixer'], sub: 'Mixer: 19 nickel to 1 tungsten' }),
        n('ccl', 18, 0, M('gtceu:coated_conductor_line', 'gtceu:coated_conductor'), 'Coated Conductor Line', {
          kind: 'ours', from: ['niw'],
          desc: 'Superconductor as tape, a thin film on textured nickel-tungsten. It skips the blast furnace and the liquid helium that GTM\'s wire wants.',
        }),
        n('strip', 20.25, 0, I('grindless:nickel_tungsten_tape'), 'Nickel-Tungsten Tape', { from: ['ccl'], sub: 'Circuit 1 rolls it' }),
        n('tex', 22.25, 0, I('grindless:textured_nickel_tungsten_tape'), 'Textured Tape', { from: ['strip'], by: ['gtceu:coated_conductor'], sub: 'Hydrogen and argon' }),
        n('yo', 24.25, -1.5, I('grindless:yttrium_oxide_dust'), 'Yttrium Oxide', { kind: 'raw' }),
        n('seedt', 24.25, 0, I('grindless:seeded_tape'), 'Seeded Tape', { from: ['tex', 'yo'], by: ['gtceu:coated_conductor'] }),
        n('ysz', 26.25, 1.5, I('grindless:ysz_powder'), 'YSZ Powder', { kind: 'raw', sub: 'Mixer: zirconia and yttrium oxide' }),
        n('bar', 26.25, 0, I('grindless:barrier_tape'), 'Barrier Tape', { from: ['seedt', 'ysz'], by: ['gtceu:coated_conductor'] }),
        n('ce', 28.25, -1.5, I('gtceu:cerium_dust'), 'Cerium', { kind: 'raw' }),
        n('buf', 28.25, 0, I('grindless:buffered_tape'), 'Buffered Tape', { from: ['bar', 'ce'], by: ['gtceu:coated_conductor'] }),
        n('itbtc', 30.25, 1.5, I('gtceu:indium_tin_barium_titanium_cuprate_dust'), 'ITBTC Dust', { kind: 'raw', sub: 'LuV mixer' }),
        n('coat', 30.25, 0, I('grindless:coated_tape'), 'Coated Tape', { from: ['buf', 'itbtc'], by: ['gtceu:coated_conductor'], sub: 'With oxygen' }),
        n('cap', 32.25, 0, I('grindless:capped_tape'), 'Capped Tape', { from: ['coat'], by: ['gtceu:coated_conductor'], sub: 'A thin silver cap, with oxygen' }),
        n('cuf', 34.25, -1.5, I('gtceu:copper_foil'), 'Copper Foil', { kind: 'raw' }),
        n('cc', 34.25, 0, I('grindless:itbtc_coated_conductor'), 'ITBTC Coated Conductor', {
          kind: 'product', from: ['cap', 'cuf'], by: ['gtceu:coated_conductor'], sub: 'Wound in the magnet works',
        }),
      ],
    },
    magnets: {
      name: 'HTS magnet works',
      line: 'hts',
      nodes: [
        n('cc2', 0, -3, I('grindless:itbtc_coated_conductor'), 'ITBTC Coated Conductor', { kind: 'raw', sub: 'The coated conductor line\'s tape' }),
        n('trin2', 0, -1.5, F('gtceu:trinium'), 'Molten Trinium', { kind: 'raw', sub: 'Mode 2\'s trinium, melted down' }),
        L('epoxy', 0, 0, 'pl_hv:epoxy'),
        n('hg', 0, 1.5, I('gtceu:mercury_barium_calcium_cuprate_single_wire'), 'Hg-1223 Wire', { kind: 'raw', sub: 'HV\'s superconductor' }),
        n('lhe2', 0, 3, F('gtceu:liquid_helium'), 'Liquid Helium', { kind: 'raw', sub: 'The cold-test charge: it never drains' }),
        n('tetra', 0, 4.5, I('gtceu:tetrataenite_rod'), 'Tetrataenite Rod', { kind: 'raw', pkg: 'B5', sub: 'The belt\'s meteoric magnet' }),
        n('mw', 2.75, 0.75, M('gtceu:hts_magnet_works', 'gtceu:magnet_winding'), 'HTS Magnet Works', {
          kind: 'ours', from: ['cc2', 'trin2', 'epoxy', 'hg', 'lhe2', 'tetra'],
          desc: ['Wound, potted in epoxy and tested cold before anything leaves.', 'A coil wound from tape takes a sliver of the trinium GTM\'s own coil wants.'],
        }),
        n('coil', 5.5, -1.5, I('gtceu:superconducting_coil'), 'Superconducting Coil', { kind: 'product', from: ['mw'], sub: 'The fusion reactor\'s coils' }),
        n('smes', 5.5, 0, I('grindless:luv_smes_cell'), 'LuV SMES Cell', { kind: 'product', from: ['mw'], sub: 'The network\'s LuV cell' }),
        n('coilgun', 5.5, 1.5, I('grindless:coilgun_coil_casing'), 'Coilgun Coil Casing', {
          kind: 'product', from: ['mw'], sub: 'The coilgun\'s barrel, on Ganymede', pending: { B9: { sub: 'Stored for now' } },
        }),
        n('bearing', 5.5, 3, I('grindless:magnetic_bearing'), 'Magnetic Bearing', { kind: 'product', from: ['mw'], sub: 'The hydroponic ring\'s hub' }),
      ],
    },
    network: {
      name: 'Orbital solar and the network',
      role: 'power',
      nodes: [
        L('nqwafer', 0, -1.5, 'pl_iv:wafer'),
        n('pvcell', 2.25, -1.5, I('gcyr:photovoltaic_cell'), 'Photovoltaic Cell', { from: ['nqwafer'], sub: 'GCYR\'s cell, at the crafting table' }),
        n('tjc', 2.25, 0, I('grindless:triple_junction_cell'), 'Triple-Junction Cell', { kind: 'raw', sub: 'The wake shield\'s wafer, cut' }),
        n('panel', 4.5, -0.75, I('grindless:orbital_solar_panel'), 'Orbital Solar Panel', {
          from: ['pvcell', 'tjc'], by: ['gtceu:assembly_line'], sub: 'Assembly line; triple-junction cells go further',
        }),
        n('station', 7, -0.75, M('gtceu:orbital_solar_station', 'gtceu:orbital_solar'), 'Orbital Solar Station', {
          kind: 'ours', from: [structure('panel')],
          desc: 'Two wings of panels in Earth orbit, where night never comes. Its power goes straight into the network through a wireless dynamo hatch.',
        }),
        n('smes2', 4.5, 1.5, I('grindless:luv_smes_cell'), 'LuV SMES Cell', { kind: 'raw', sub: 'The magnet works winds it' }),
        n('tower', 7, 1.5, M('gtceu:wireless_energy_tower'), 'Wireless Energy Tower', {
          kind: 'ours', from: [structure('smes2')], sub: 'Every tower on SMES cells, and the network goes LuV',
        }),
        n('weh', 9.5, 0.75, I('gtceu:luv_wireless_energy_hatch'), 'LuV Wireless Energy Hatch', { kind: 'info', from: [network('tower')], sub: 'Every LuV base draws through it' }),
        n('wdh', 9.5, 2.25, I('gtceu:luv_wireless_dynamo_hatch'), 'LuV Wireless Dynamo Hatch', {
          kind: 'info', from: [network('tower')], sub: 'Stations and generators feed the network through it',
        }),
      ],
    },
    // ---------------------------------------------------------------- A5 (biofoundry, GT--'s circuit line) and B4 (ring, organoid lab)
    biofoundry: {
      name: 'The biofoundry',
      line: 'living',
      nodes: [
        n('bone', 0, -0.75, I('minecraft:bone'), 'Bone', { kind: 'raw', sub: 'The creature simulator, with the meat' }),
        n('bact', 0, 2.25, F('gtceu:bacteria'), 'Bacteria', {
          kind: 'raw', sub: 'Europa\'s culture: the only living matter', pending: { B8: { sub: 'GTM brews it in a sterile cleanroom' } },
        }),
        n('bf', 2.25, -0.75, M('gtceu:biofoundry', 'gtceu:sterile_culture'), 'Biofoundry', {
          kind: 'ours', from: ['bone', 'bact'],
          desc: ['GTM\'s whole sterile chain in one sealed hall, long before its sterile cleanroom.', 'The acid and the phosphorus it leaves go back to be used again.'],
        }),
        n('barley', 2.25, 1.5, I('grindless:engineered_barley_seed'), 'Engineered Barley Seed', {
          kind: 'product', from: ['bact'], by: ['gtceu:sterile_culture'], sub: 'Circuit 9; up to the ring',
        }),
        n('tobacco', 2.25, 3, I('grindless:engineered_tobacco_seed'), 'Engineered Tobacco Seed', {
          kind: 'product', from: ['bact'], by: ['gtceu:sterile_culture'], sub: 'Circuit 10; up to the ring',
        }),
        n('dil', 4.5, -3.5, F('gtceu:diluted_sulfuric_acid'), 'Diluted Sulfuric Acid', { kind: 'by', from: ['bf'], end: 'sulfuric acid', sub: 'Distillery: sulfuric acid again' }),
        n('collagen', 4.5, -2.25, I('gtceu:collagen_dust'), 'Collagen', { from: ['bf'] }),
        n('sludge', 4.5, -0.75, F('gtceu:bacterial_sludge'), 'Bacterial Sludge', { from: ['bf'] }),
        n('u235', 4.5, 0.75, I('gtceu:tiny_uranium_235_dust'), 'Tiny Uranium-235 Dust', { kind: 'raw', sub: 'A pinch of the hot cell\'s U-235' }),
        n('phos', 6.5, -3.5, I('gtceu:phosphorus_dust'), 'Phosphorus', {
          kind: 'by', from: ['collagen'], by: ['gtceu:sterile_culture'], end: 'phosphoric acid', sub: 'Phosphoric acid for the next batch',
        }),
        n('gelatin', 6.5, -2.25, I('gtceu:gelatin_dust'), 'Gelatin', { from: ['collagen'], by: ['gtceu:sterile_culture'] }),
        n('mutagen', 6.5, -0.75, F('gtceu:mutagen'), 'Mutagen', { from: ['sludge', 'u235'], by: ['gtceu:sterile_culture'], sub: 'Sludge and a tiny pile of uranium-235' }),
        n('agar', 8.5, -2.25, I('gtceu:agar_dust'), 'Agar', { from: ['gelatin'], by: ['gtceu:sterile_culture'] }),
        n('medium', 10.5, -1.5, F('gtceu:sterilized_growth_medium'), 'Sterilized Growth Medium', {
          from: ['agar', 'mutagen'], by: ['gtceu:sterile_culture'], sub: 'With meat, salt and calcium',
        }),
        n('osm', 10.5, 0, I('gtceu:osmiridium_dust'), 'Osmiridium Dust', { kind: 'raw', sub: 'LuV mixer' }),
        n('sludgeback', 12.5, -2.25, F('gtceu:bacterial_sludge'), 'Bacterial Sludge, Back', {
          kind: 'ret', from: ['medium'], by: ['gtceu:sterile_culture'], sub: 'Back into mutagen',
        }),
        n('stem', 12.5, -0.75, I('gtceu:stem_cells'), 'Stem Cells', {
          kind: 'product', from: ['medium', 'osm'], by: ['gtceu:sterile_culture'], sub: 'Up to the organoid lab',
        }),
      ],
    },
    organoid: {
      name: 'Living circuits, in orbit',
      line: 'living',
      nodes: [
        n('barley2', 0, -0.75, I('grindless:engineered_barley_seed'), 'Engineered Barley Seed', { kind: 'raw', sub: 'The crop replants: it\'s never used up' }),
        n('tobacco2', 0, 0.75, I('grindless:engineered_tobacco_seed'), 'Engineered Tobacco Seed', { kind: 'raw' }),
        L('co2', 0, 2.25, 'pl_mv:co2'),
        n('ring', 2.5, 0.75, M('gtceu:hydroponic_ring', 'gtceu:greenhouse'), 'Rotating Hydroponic Ring', {
          kind: 'ours', from: ['barley2', 'tobacco2', 'co2'],
          desc: 'A spinning ring of soil under glass, with the sun always up. Engineered barley and tobacco grow human proteins here, sealed away from any field at home.',
        }),
        n('factor', 5, -0.75, I('grindless:neurotrophic_factor'), 'Neurotrophic Factor', { from: ['ring'] }),
        n('collb', 5, 0.75, I('gtceu:collagen_dust'), 'Plant Collagen, Back', { kind: 'ret', from: ['ring'], sub: 'To the biofoundry: no meat, no bone' }),
        n('biomass', 5, 2, F('gtceu:biomass'), 'Biomass', { kind: 'by', from: ['ring'], end: 'bacterial sludge', sub: 'Into bacterial sludge' }),
        n('o2', 5, 3, F('gtceu:oxygen'), 'Oxygen', { kind: 'by', from: ['ring'], end: 'station air', sub: 'The station\'s oxygen spreader' }),
        n('stem2', 5, -3.75, I('gtceu:stem_cells'), 'Stem Cells', { kind: 'raw', sub: 'From the biofoundry' }),
        n('medium2', 5, -2.25, F('gtceu:sterilized_growth_medium'), 'Sterilized Growth Medium', { kind: 'raw', sub: 'From the biofoundry' }),
        n('mea', 7.5, -4, I('grindless:pedot_microelectrode_array'), 'PEDOT Microelectrode Array', { kind: 'raw', sub: 'The PEDOT line\'s: the NPU\'s electrodes' }),
        n('lab', 7.5, -2.25, M('gtceu:organoid_lab', 'gtceu:organoid_assembly'), 'Organoid Lab', {
          kind: 'ours', from: ['stem2', 'medium2', 'factor', 'mea'],
          desc: 'Stem cells and the ring\'s factor grow into neural organoids. The lab then builds a neuro processing unit around one and the microelectrode array that reads it, on LuV power instead of ZPM\'s.',
        }),
        n('org', 10, -3, I('grindless:neural_organoid'), 'Neural Organoid, Back', { kind: 'ret', from: ['lab'], sub: 'Circuit 2 builds the NPU around it' }),
        n('npu', 10, -1.5, I('gtceu:neuro_processing_unit'), 'Neuro Processing Unit', { from: ['lab'] }),
        n('cpu', 10, 0, I('gtceu:crystal_cpu'), 'Crystal CPU', { kind: 'raw', sub: 'The grower\'s chips, engraved' }),
        n('cal', 12.5, -0.75, M('gtnn:circuit_assembly_line', 'gtceu:circuit_assembly_line'), 'Circuit Assembly Line', {
          from: ['npu', 'cpu'], sub: 'GT--\'s, on one LuV energy hatch',
        }),
        n('wet', 15, -0.75, I('gtceu:wetware_processor'), 'Wetware Processor', { kind: 'product', from: ['cal'], sub: 'A whole batch a run, at LuV' }),
      ],
    },
    pedot: {
      name: 'PEDOT:PSS and the microelectrode array',
      line: 'living',
      nodes: [
        n('bu', 0, -0.75, F('gtceu:butane'), 'Butane', { kind: 'raw' }),
        n('sul', 0, 0.75, I('gtceu:sulfur_dust'), 'Sulfur', { kind: 'raw' }),
        n('thio', 2.25, 0, F('gtceu:thiophene'), 'Thiophene', { from: ['bu', 'sul'], by: ['gtceu:chemical_reactor'], sub: 'Sulfurisation: four sulfur to a butane' }),
        n('br', 4.5, -1.5, F('gtceu:bromine'), 'Bromine', { kind: 'raw' }),
        n('tbt', 4.5, 0, I('gtceu:tetrabromothiophene_dust'), 'Tetrabromothiophene', { from: ['thio', 'br'], by: ['gtceu:chemical_reactor'], sub: 'Bromination' }),
        n('zn', 6.75, -1.5, I('gtceu:zinc_dust'), 'Zinc', { kind: 'raw', sub: 'With acetic acid: it comes back as zinc bromide' }),
        n('dbt', 6.75, 0, F('gtceu:dibromothiophene'), 'Dibromothiophene', { from: ['tbt', 'zn'], by: ['gtceu:chemical_reactor'], sub: 'Debromination' }),
        n('meoh', 6.75, -3, F('gtceu:methanol'), 'Methanol', { kind: 'raw', sub: 'MV methanol line' }),
        n('na', 9, -3, I('gtceu:sodium_dust'), 'Sodium', { kind: 'raw' }),
        n('meo', 9, -1.5, F('gtceu:sodium_methoxide'), 'Sodium Methoxide', { from: ['meoh', 'na'], by: ['gtceu:chemical_reactor'] }),
        n('dmt', 9, 0, F('gtceu:dimethoxythiophene'), 'Dimethoxythiophene', { from: ['dbt', 'meo'], by: ['gtceu:large_chemical_reactor'], sub: 'Methoxylation' }),
        n('eth', 6.75, 1.5, F('gtceu:ethylene'), 'Ethylene', { kind: 'raw' }),
        n('eo', 9, 1.5, F('gtceu:ethylene_oxide'), 'Ethylene Oxide', { from: ['eth'], by: ['gtceu:chemical_reactor'], sub: 'Oxygen, over a silver catalyst' }),
        n('eg', 11.25, 1.5, F('gtceu:ethylene_glycol'), 'Ethylene Glycol', { from: ['eo'], by: ['gtceu:chemical_reactor'], sub: 'Hydration' }),
        n('meohb', 11.25, -1.5, F('gtceu:methanol'), 'Methanol, Back', { kind: 'ret', from: ['dmt'], sub: 'Back into sodium methoxide' }),
        n('edot', 11.25, 0, F('gtceu:edot'), 'EDOT', { from: ['dmt', 'eg'], by: ['gtceu:large_chemical_reactor'], sub: 'Transetherification' }),
        n('sty', 11.25, 3.75, F('gtceu:styrene'), 'Styrene', { kind: 'raw' }),
        n('ps', 13.5, 3.75, I('gtceu:polystyrene_dust'), 'Polystyrene', { from: ['sty'], by: ['gtceu:chemical_reactor'] }),
        n('pss', 13.5, 1.5, F('gtceu:polystyrene_sulfonate'), 'Polystyrene Sulfonate', { from: ['ps'], by: ['gtceu:chemical_reactor'], sub: 'Sulfonation, with sulfur trioxide' }),
        n('pers', 13.5, -1.5, F('gtceu:sodium_persulfate'), 'Sodium Persulfate', { kind: 'raw', sub: 'LV\'s' }),
        n('pedotpss', 13.5, 0, F('gtceu:pedot_pss'), 'PEDOT:PSS', { from: ['edot', 'pss', 'pers'], by: ['gtceu:large_chemical_reactor'], sub: 'Polymerisation' }),
        n('plate', 16, -1.5, I('gtceu:sapphire_plate'), 'Sapphire Plate', { kind: 'raw' }),
        n('au', 16, 1.5, I('gtceu:gold_foil'), 'Gold Foil', { kind: 'raw', sub: 'With platinum and silver foil' }),
        n('meap', 16, 0, I('grindless:pedot_microelectrode_array'), 'PEDOT Microelectrode Array', {
          kind: 'product', from: ['pedotpss', 'plate', 'au'], by: ['gtceu:assembler'], sub: 'Assembler: up to the organoid lab',
        }),
        n('h2so4', 16, -3, F('gtceu:sulfuric_acid'), 'Sulfuric Acid', { kind: 'by', from: ['pers'], end: 'sulfuric acid', sub: 'Back into the acid you already use' }),
      ],
    },
    // ---------------------------------------------------------------- B3 (microgravity smelter, wake shield facility) and B4 (crystal grower)
    optics: {
      name: 'Optical pipe and the microgravity smelter',
      line: 'optics',
      nodes: [
        n('rz', 0, -3.75, I('gtca:red_zircon_dust'), 'Red Zircon', { kind: 'raw', sub: 'The End\'s zircon' }),
        n('zro', 2.25, -3.75, I('gtceu:zirconia_dust'), 'Zirconia', { from: ['rz'], by: ['gtceu:electric_blast_furnace'], sub: 'EBF: the silica goes' }),
        n('zrf', 4.5, -3.75, I('gtceu:zirconium_tetrafluoride_dust'), 'Zirconium Tetrafluoride', { from: ['zro'], by: ['gtceu:chemical_reactor'], sub: 'With hydrofluoric acid from the fluorspar kiln' }),
        n('bad', 2.25, -2.25, I('gtceu:barium_dust'), 'Barium', { kind: 'raw' }),
        n('baf', 4.5, -2.25, I('gtceu:barium_fluoride_dust'), 'Barium Fluoride', { from: ['bad'], by: ['gtceu:fluorspar_digestion'], sub: 'Fluorspar kiln, with hydrofluoric acid' }),
        n('lao', 2.25, -0.75, I('gtceu:lanthanum_oxide_dust'), 'Lanthanum Oxide', { kind: 'raw', sub: 'EV\'s solvent extraction' }),
        n('la', 4.5, -0.75, I('gtceu:lanthanum_fluoride_dust'), 'Lanthanum Fluoride', { from: ['lao'], by: ['gtceu:fluorspar_digestion'], sub: 'Fluorspar kiln' }),
        n('sapz', 2.25, 0.75, I('gtceu:sapphire_dust'), 'Sapphire Dust', { kind: 'raw' }),
        n('alf', 4.5, 0.75, I('gtceu:aluminium_fluoride_dust'), 'Aluminium Fluoride', { from: ['sapz'], by: ['gtceu:fluorspar_digestion'], sub: 'Fluorspar kiln' }),
        n('naoh', 2.25, 2.25, I('gtceu:sodium_hydroxide_dust'), 'Sodium Hydroxide', { kind: 'raw' }),
        n('naf', 4.5, 2.25, I('gtceu:sodium_fluoride_dust'), 'Sodium Fluoride', { from: ['naoh'], by: ['gtceu:fluorspar_digestion'], sub: 'Fluorspar kiln' }),
        n('blend', 6.75, 0.75, I('gtceu:zblan_dopant_blend_dust'), 'ZBLAN Dopant Blend', {
          from: ['la', 'alf', 'naf'], by: ['gtceu:large_chemical_reactor'], sub: 'Large chemical reactor: 4 lanthanum, 4 aluminium, 8 sodium',
        }),
        n('zblan', 9, -2.25, I('gtceu:zblan_dust'), 'ZBLAN', { from: ['zrf', 'baf', 'blend'], by: ['gtceu:large_chemical_reactor'], sub: 'Large chemical reactor: a fluoride glass batch' }),        L('ptfe', 9, -0.75, 'pl_hv:ptfe'),
        L('aramid', 9, 0.75, 'pl_hv:aramid'),
        L('nqdust', 9, 2.25, 'pl_iv:nqdust'),
        n('smelter', 11.5, 0, M('gtceu:microgravity_smelter', 'gtceu:microgravity_processing'), 'Microgravity Smelter', {
          kind: 'ours', from: ['zblan', 'ptfe', 'aramid'],
          desc: 'ZBLAN fibre, metal foam and naquadah alloy, each made better in orbit than on the ground. The alloy skips the coil and the liquid helium altogether.',
        }),
        n('pipe', 14, -2.25, I('gtceu:normal_optical_pipe'), 'Optical Pipe', { kind: 'product', from: ['smelter'], sub: 'No silver in it: research, below' }),
        n('whipple', 14, -0.75, I('grindless:whipple_shield_casing'), 'Whipple Shield Casing', {
          kind: 'product', from: ['smelter'], role: 'infrastructure', sub: 'The wake shield\'s hull',
        }),
        n('osm2', 9, 3.75, I('gtceu:osmiridium_dust'), 'Osmiridium Dust', { kind: 'raw' }),
        n('trd', 9, 5.25, I('gtceu:trinium_dust'), 'Trinium Dust', { kind: 'raw' }),
        n('smelter2', 11.5, 3.75, M('gtceu:microgravity_smelter', 'gtceu:microgravity_processing'), 'Microgravity Smelter', {
          kind: 'ours', from: ['nqdust', 'osm2', 'trd'], sub: 'The alloy skips the coil and the liquid helium',
        }),
        n('nqa', 14, 3.75, I('gtceu:naquadah_alloy_ingot'), 'Naquadah Alloy', {
          kind: 'product', from: ['smelter2'], extends: 'pl_luv:naquadah', sub: 'Comes out cold; ZPM wants it',
        }),
      ],
    },
    wake: {
      name: 'Wake shield wafers',
      line: 'wake',
      nodes: [
        n('indr', 0, -1.5, I('gtceu:indium_dust'), 'Indium', { kind: 'raw', sub: 'Io\'s fumaroles' }),
        n('gal', 0, 0, I('gtceu:gallium_dust'), 'Gallium', { kind: 'raw', sub: 'MV\'s' }),
        n('wphos', 0, 1.5, I('gtceu:phosphorus_dust'), 'Phosphorus', { kind: 'raw' }),
        n('ingap', 2.5, 0, I('gtceu:indium_gallium_phosphide_dust'), 'Indium Gallium Phosphide', { from: ['indr', 'gal', 'wphos'], by: ['gtceu:mixer'], sub: 'Mixer' }),
        n('mpic', 2.5, 1.5, I('gtceu:mpic_wafer'), 'MPIC Wafer', { kind: 'raw', sub: 'GTM\'s own wafer' }),
        n('vga', 2.5, 3, F('gtceu:molten_vanadium_gallium'), 'Molten Vanadium Gallium', { kind: 'raw', sub: 'Circuit 2 only' }),
        n('whip', 2.5, 4.5, I('grindless:whipple_shield_casing'), 'Whipple Shield Casing', { kind: 'raw', sub: 'The microgravity smelter\'s' }),
        n('gew', 2.5, 6, I('grindless:germanium_wafer'), 'Germanium Wafer', { kind: 'raw', sub: 'Cut from the boule: the triple-junction cell\'s substrate' }),
        L('gaas', 2.5, 7.5, 'pl_lv:gaas'),
        n('wsf', 5, 3.75, M('gtceu:wake_shield_facility', 'gtceu:wake_epitaxy'), 'Wake Shield Facility', {
          kind: 'ours', from: [structure('whip'), 'mpic', 'ingap', 'vga', 'gew', 'gaas'],
          desc: 'A disc flying through orbit leaves a wake emptier than any vacuum chamber. Wafers grown in it waste less of their source and take less time.',
        }),
        n('hpic', 7.5, 2.25, I('gtceu:hpic_wafer'), 'HPIC Wafer', { from: ['wsf'], sub: 'Circuit 2' }),
        n('tjw', 7.5, 5.25, I('grindless:triple_junction_wafer'), 'Triple-Junction Wafer', { from: ['wsf'], sub: 'Circuit 3' }),
        n('nqm', 7.5, -0.75, F('gtceu:naquadah'), 'Molten Naquadah', { kind: 'raw', sub: 'IV\'s' }),
        n('ingap2', 7.5, 0.75, I('gtceu:indium_gallium_phosphide_dust'), 'Indium Gallium Phosphide', { kind: 'raw', sub: 'Again' }),
        n('wsf2', 10, 2.25, M('gtceu:wake_shield_facility', 'gtceu:wake_epitaxy'), 'Wake Shield Facility, Circuit 1', {
          kind: 'ours', from: ['hpic', 'ingap2', 'nqm'], sub: 'The same facility, a second pass',
        }),
        n('uhpic', 12.5, 2.25, I('gtceu:uhpic_wafer'), 'UHPIC Wafer', { from: ['wsf2'], sub: 'Every LuV hatch' }),
        n('wchip', 15, 2.25, I('gtceu:uhpic_chip'), 'UHPIC Chip', { kind: 'product', from: ['uhpic'], by: ['gtceu:cutter'], sub: 'Cutter; the fusion reactor\'s chips' }),
        n('tjc2', 10, 5.25, I('grindless:triple_junction_cell'), 'Triple-Junction Cell', {
          kind: 'product', role: 'infrastructure', from: ['tjw'], by: ['gtceu:cutter'], sub: 'Cutter; the orbital solar panels take it',
        }),
      ],
    },
    grower: {
      name: 'Crystals in orbit',
      line: 'crystals',
      nodes: [
        n('emerald', 0, -0.75, I('gtceu:exquisite_emerald_gem'), 'Exquisite Emerald', {
          kind: 'raw', sub: 'Or the belt\'s olivine', pending: { B5: { sub: 'Or exquisite olivine' } },
        }),
        n('eu', 0, 0.75, F('gtceu:europium'), 'Europium', { kind: 'raw', sub: 'The fusion reactor\'s; GTM\'s dose, no less' }),
        n('sapph', 0, 2.25, I('gtceu:sapphire_dust'), 'Sapphire Dust', { kind: 'raw', sub: 'With an exquisite sapphire as the seed' }),
        n('grower', 2.5, 0.75, M('gtceu:zero_g_crystal_grower', 'gtceu:microgravity_crystal_growth'), 'Zero-G Crystal Grower', {
          kind: 'ours', from: ['emerald', 'eu', 'sapph'],
          desc: 'Crystal chips grow without striations up here, so every seed takes. They grow faster, too.',
        }),
        n('chip', 5, -0.75, I('gtceu:raw_crystal_chip'), 'Raw Crystal Chip', { from: ['grower'] }),
        n('mass', 5, 1.5, I('grindless:sapphire_test_mass'), 'Sapphire Test Mass', {
          kind: 'product', role: 'infrastructure', from: ['grower'], sub: 'The detector\'s mirrors, on Ganymede', pending: { B9: { sub: 'Stored for now' } },
        }),
        n('cpu2', 7.25, -0.75, I('gtceu:crystal_cpu'), 'Crystal CPU', {
          kind: 'product', from: [via('chip', 'gtceu:engraved_crystal_chip')], keepShort: 'the grower folds GTM\'s autoclave chip step in orbit; GTM\'s route stays because IV crystal processors need chips before LuV, LD-LV3', sub: 'EBF with an emerald plate, then the laser engraver',
        }),
      ],
    },
    // ---------------------------------------------------------------- B10 (fusion and research)
    fusion: {
      name: 'Fusion, Mk1',
      line: 'crystals',
      nodes: [
        n('coil2', 2, -2.25, I('gtceu:superconducting_coil'), 'Superconducting Coil', { kind: 'raw', sub: 'Wound in the magnet works' }),
        n('uhchip', 2, -0.75, I('gtceu:uhpic_chip'), 'UHPIC Chip', { kind: 'raw', sub: 'The wake shield\'s wafers, cut' }),
        L('nd0', 0, -0.75, 'pl_ev:nd'),
        n('nd1', 0, 0.75, I('gtceu:neodymium_ingot'), 'Neodymium Ingot', { kind: 'by', from: ['nd0'], by: ['gtceu:electric_blast_furnace'], end: 'extractor, then the Mk1', sub: 'EBF' }),
        n('ndf', 2, 0.75, F('gtceu:neodymium'), 'Molten Neodymium', { kind: 'raw', sub: 'Mars neodymium, extracted' }),
        L('deut', 2, 2.25, 'pl_iv:deut'),
        L('tritium', 2, 3.75, 'pl_iv:tritium'),
        n('mg', 2, 5.25, F('gtceu:magnesium'), 'Molten Magnesium', { kind: 'raw', sub: 'With oxygen, for GTCA\'s calcium plasma' }),
        n('mk1', 4.5, 1.5, M('gtceu:luv_fusion_reactor', 'gtceu:fusion_reactor'), 'Fusion Reactor Mk1', {
          from: [build('coil2'), build('uhchip'), 'ndf', 'deut', 'tritium', 'mg'],
          desc: ['GTM\'s ring, and here it\'s mostly a materials machine: ZPM\'s europium comes from nowhere else.', 'The recipes that made osmium or uranium are gone; those come from their planets.'],
        }),
        n('eu2', 7, 0, F('gtceu:europium'), 'Europium', { kind: 'product', from: ['mk1'], sub: 'ZPM\'s motor, and the crystal grower' }),
        n('heplasma', 7, 1.5, F('gtceu:helium_plasma'), 'Helium Plasma', { from: ['mk1'] }),
        n('caplasma', 7, 3, F('gtca:calcium_plasma_plasma'), 'Calcium Plasma', { from: ['mk1'] }),
        n('turbine', 9.5, 2.25, M('gtceu:plasma_large_turbine', 'gtceu:plasma_generator'), 'Large Plasma Turbine', {
          from: ['heplasma', 'caplasma'], sub: 'Its power goes to the network',
        }),
      ],
    },
    research: {
      name: 'Research toward ZPM',
      nodes: [
        n('pipe2', 0, -0.75, I('gtceu:normal_optical_pipe'), 'Optical Pipe', { kind: 'raw', sub: 'The microgravity smelter\'s' }),
        n('ccase', 0, 0.75, I('gtceu:computer_casing'), 'Computer Casing', { kind: 'raw', sub: 'Iridium, from Mercury' }),
        n('bank', 2.25, 0, I('gtceu:data_bank'), 'Data Bank', { from: ['pipe2', 'ccase'], by: ['gtceu:assembly_line'], sub: 'Assembly line' }),
        n('urh', 2.25, 1.5, I('gtceu:uranium_rhodium_dinaquadide_double_wire'), 'URhNq2 Wire', { kind: 'raw', sub: 'The large mixer, on two LuV hatches' }),
        n('hpca', 4.5, -0.75, I('gtceu:high_performance_computation_array'), 'HPCA', { kind: 'product', role: 'infrastructure', from: [build('bank')], sub: 'Computation for the research station' }),
        n('rs', 4.5, 0.75, M('gtceu:research_station', 'gtceu:research_station'), 'Research Station', { from: [build('bank'), build('urh')] }),
        n('orb', 6.75, 0.75, I('gtceu:data_orb'), 'Data Orb', { kind: 'product', role: 'research', from: ['rs'], sub: 'The station writes it: the research for ZPM\'s energy hatch' }),
      ],
    },
    // ---------------------------------------------------------------- pending: B5 (the belt)
    belt: {
      name: 'Asteroid metals',
      line: 'asteroid',
      pkg: 'B5',
      nodes: [
        n('bit', 0, -0.75, I('grindless:hss_s_drill_bit'), 'HSS-S Drill Bit', { kind: 'raw' }),
        n('harpoon', 0, 0.75, I('grindless:anchor_harpoon'), 'Anchor Harpoon', { kind: 'raw', sub: 'Worn down a little every run' }),
        n('hdrill', 2.5, 0, M('gtceu:harpoon_anchor_drill', 'gtceu:vein_drilling'), 'Harpoon Anchor Drill', {
          kind: 'ours', from: ['bit', 'harpoon'],
          desc: 'Harpoons hold it to the rock while it drills. The belt\'s veins are drilled here and nowhere else.',
        }),
        n('rawmi', 5, -0.75, I('gtceu:raw_meteoric_iron'), 'Raw Meteoric Iron', { from: ['hdrill'] }),
        n('rawtt', 5, 0.75, I('gtceu:raw_tetrataenite'), 'Raw Tetrataenite', { from: ['hdrill'] }),
        n('cmi', 7, -0.75, I('gtceu:crushed_meteoric_iron_ore'), 'Crushed Meteoric Iron', {
          kind: 'product', keepShort: 'the drill and the macerator are the whole route; the Mond process in the conductor line takes the ore from here', from: ['rawmi'], by: ['gtceu:macerator'], sub: 'Macerator: the coated conductor line\'s Mond process takes it',
        }),
        n('ctt', 7, 0.75, I('gtceu:crushed_tetrataenite_ore'), 'Crushed Tetrataenite', { from: ['rawtt'], by: ['gtceu:macerator'], sub: 'Macerator' }),
        n('aproc', 9.5, 0.75, M('gtceu:asteroid_processor', 'gtceu:asteroid_processing'), 'Asteroid Processor', {
          kind: 'ours', from: ['ctt'], sub: 'Circuit 2',
          desc: 'The magnetic split: crushed tetrataenite comes apart into tetrataenite and meteoric iron. The Mond process that carries the iron and nickel off lives in the coated conductor line.',
        }),
        n('ttd', 12, 0.75, I('gtceu:tetrataenite_dust'), 'Tetrataenite', { kind: 'product', from: ['aproc'], keepShort: 'three real steps (drill, macerator, processor split); the magnetic split is the processor\'s circuit 2, not a separate machine, and a fourth step would be padding', sub: 'Circuit 2 splits it out: rods for the magnet works' }),
        n('midback', 12, 2.25, I('gtceu:meteoric_iron_dust'), 'Meteoric Iron Dust, Back', { kind: 'ret', from: ['aproc'], sub: 'From the split and the ore line: the Mond process takes it too' }),
      ],
    },
    miner: {
      name: 'Boulders and sunlight',
      line: 'asteroid',
      pkg: 'B5',
      nodes: [
        n('bag', 0, 0.5, I('grindless:capture_bag'), 'Capture Bag', { kind: 'raw', sub: 'Worn out a little every run' }),
        n('om', 2.5, 0.5, M('gtceu:optical_miner', 'gtceu:optical_mining'), 'Optical Miner', {
          kind: 'ours', from: ['bag'],
          desc: 'Mirrors bake a bagged boulder with sunlight, and a cold trap catches what boils off. It only starts with the sun on it.',
        }),
        n('water', 5, -1.5, F('minecraft:water'), 'Water', { kind: 'by', from: ['om'], end: 'network', sub: 'The belt base, and the network' }),
        n('co2b', 5, -0.25, F('gtceu:carbon_dioxide'), 'Carbon Dioxide', { from: ['om'] }),
        n('carbon', 5, 1, I('gtceu:carbon_dust'), 'Carbon', { from: ['om'] }),
        n('extract', 5, 2.5, I('grindless:chondritic_extract'), 'Chondritic Extract', { kind: 'product', role: 'resource', from: ['om'], sub: 'Europa\'s culture needs it' }),
        n('co3', 7.5, 0.25, F('gtceu:carbon_monoxide'), 'Carbon Monoxide', {
          kind: 'product', from: ['co2b', 'carbon'], by: ['gtceu:optical_mining'], sub: 'Circuit 2: the Mond process\'s charge',
        }),
      ],
    },
    // ---------------------------------------------------------------- B6 (Io's surface); pending: B7T or B7S (Io orbit), B8 (Europa), B9 (Ganymede), B1 (travel)
    io: {
      name: 'Io: fumaroles and heat',
      line: 'wake',
      pkg: 'B6',
      nodes: [
        n('cond', 2.5, 0, M('gtceu:fumarole_condenser', 'gtceu:fumarole_condensing'), 'Fumarole Condenser', {
          kind: 'ours', sub: 'Over a fumarole field, on Io',
          desc: 'Volcanic gas drops its rare metals in bands as it cools. The sulfur it leaves makes a concrete that needs no water.',
        }),
        n('bundle', 5, -3.75, I('grindless:heat_exchanger_bundle'), 'Heat Exchanger Bundle', { kind: 'raw', sub: 'Hot sulfur wears it away' }),
        n('so2', 5, -2.25, F('gtceu:sulfur_dioxide'), 'Sulfur Dioxide', { from: ['cond'] }),
        n('sulfur', 5, -0.75, I('gtceu:sulfur_dust'), 'Sulfur', { kind: 'by', from: ['cond'], end: 'concrete, home', sub: 'Concrete, or sulfuric acid at home' }),
        n('subl', 5, 0.75, I('grindless:ionian_sublimate'), 'Ionian Sublimate', { kind: 'product', from: ['cond'], sub: 'Germanium and indium chlorides, below' }),
        n('rock', 2.5, 2.25, I('minecraft:basalt'), 'Basalt', { kind: 'raw', sub: 'The rock breaker\'s, or Io\'s black sand' }),
        n('concrete', 5, 2.25, I('grindless:sulfur_concrete_casing'), 'Sulfur Concrete Casing', {
          kind: 'product', role: 'infrastructure', from: ['cond', 'rock'], by: ['gtceu:fumarole_condensing'], sub: 'Circuit 3; the Jovian bases are built of it',
        }),
        n('intake', 7.5, -3, M('gtceu:volcanic_intake', 'gtceu:volcanic_heat'), 'Volcanic Intake', {
          kind: 'ours', from: ['bundle', 'so2'],
          desc: 'Io\'s own heat, run through a sulfur dioxide loop and into the network. Nothing comes out of it without a patera underneath.',
        }),
      ],
    },
    germanium: {
      name: 'Germanium and indium from the fumaroles',
      line: 'wake',
      pkg: 'B6',
      nodes: [
        n('subl2', 0, -0.75, I('grindless:ionian_sublimate'), 'Ionian Sublimate', { kind: 'raw', sub: 'The condenser\'s' }),
        n('cl2', 0, 0.75, F('gtceu:chlorine'), 'Chlorine', { kind: 'raw', sub: 'A charge: it comes back' }),
        n('gecl', 2.25, 0, F('gtceu:germanium_tetrachloride'), 'Germanium Tetrachloride', { from: ['subl2', 'cl2'], by: ['gtceu:fumarole_condensing'], sub: 'Circuit 2: chlorine takes the germanium out' }),
        n('incl', 2.25, -1.5, I('gtceu:indium_chloride_dust'), 'Indium Chloride', { from: ['subl2'], by: ['gtceu:fumarole_condensing'], sub: 'Left in the same run' }),
        n('indium', 4.5, -1.5, I('gtceu:indium_dust'), 'Indium', { kind: 'product', from: ['incl'], by: ['gtceu:electrolyzer'], sub: 'ITBTC and indium gallium phosphide' }),
        n('cl2c', 4.5, -3, F('gtceu:chlorine'), 'Chlorine, Back', { kind: 'ret', from: ['incl'], by: ['gtceu:electrolyzer'], sub: 'Back to the condenser' }),
        n('pure', 4.5, 0, F('gtceu:pure_germanium_tetrachloride'), 'Pure Germanium Tetrachloride', { from: ['gecl'], by: ['gtceu:solvent_extraction'], sub: 'Scrubbed with hydrochloric acid' }),
        n('geo2', 6.75, 0, I('gtceu:germanium_dioxide_dust'), 'Germanium Dioxide', { from: ['pure'], by: ['gtceu:chemical_reactor'], sub: 'Hydrolysis' }),
        n('hcl', 6.75, 1.5, F('gtceu:hydrochloric_acid'), 'Hydrochloric Acid', { kind: 'by', from: ['pure'], by: ['gtceu:chemical_reactor'], end: 'electrolyzer', sub: 'The electrolyzer returns the chlorine and the hydrogen' }),
        n('gedust', 9, 0, I('gtceu:germanium_dust'), 'Germanium', { from: ['geo2'], by: ['gtceu:electric_blast_furnace'], sub: 'EBF, in hydrogen' }),
        n('boule', 11.25, 0, I('grindless:germanium_boule'), 'Germanium Boule', { from: ['gedust'], by: ['gtceu:electric_blast_furnace'], sub: 'EBF, in argon' }),
        n('gewafer', 13.5, 0, I('grindless:germanium_wafer'), 'Germanium Wafer', { kind: 'product', from: ['boule'], by: ['gtceu:cutter'], sub: 'Cutter: the wake shield\'s substrate' }),
      ],
    },    // the Io-orbit slot (B7): the tether (B7T) or the sulfur-iodine plant on Io's surface (B7S), whichever tables/stations.json
    // lands; both sit in the same place, and pl-model.mjs keeps the slot's room in the layout while neither has landed
    ioorbit: {
      name: 'Io orbit, or the sulfur-iodine plant',
      role: 'power',
      nodes: [
        n('spool', 0, -0.75, I('grindless:tether_spool'), 'Tether Spool', { kind: 'raw', pkg: 'B7T', sub: 'Used up now and then: about one an hour' }),
        n('argon', 0, 0.75, F('gtceu:argon'), 'Argon', { kind: 'raw', pkg: 'B7T', sub: 'Mars argon for the hollow cathode, 50 mB a run' }),
        n('tether', 2.5, 0, M('gtceu:flux_tube_tether', 'gtceu:electrodynamic_tether'), 'Flux-Tube Tether', {
          kind: 'ours', pkg: 'B7T', from: ['spool', 'argon'], sub: 'Io orbit only: 65,536 EU/t a spool cell, two cells, 131,072 EU/t',
          desc: 'A bare tether through Jupiter\'s plasma torus drives a current, paid for by the planet\'s spin. Its power goes into the network.',
        }),
        n('siWater', 0, -0.75, F('minecraft:water'), 'Water', { kind: 'raw', pkg: 'B7S', sub: 'Europa\'s, carried over' }),
        n('siAcid', 0, 0.75, F('gtceu:sulfuric_acid'), 'Sulfuric Acid', { kind: 'raw', pkg: 'B7S', sub: 'A 2,000 mB charge: it stays in' }),
        n('siIodine', 0, 2.25, I('gtceu:iodine_dust'), 'Iodine', { kind: 'raw', pkg: 'B7S', sub: 'A charge of eight dust: it stays in' }),
        n('si', 2.5, 0.75, M('gtceu:sulfur_iodine_plant', 'gtceu:thermochemical_hydrogen'), 'Sulfur-Iodine Plant', {
          kind: 'ours', pkg: 'B7S', from: ['siWater', 'siAcid', 'siIodine'], sub: 'On Io only: 30 EU/t, up to four decomposer modules at once',
          desc: 'Io\'s heat splits the acid, and the iodine carries the hydrogen out of the loop. The acid and the iodine go round, so only the water is used up.',
        }),
        n('siH2', 5, 0, F('gtceu:hydrogen'), 'Hydrogen', {
          kind: 'product', pkg: 'B7S', from: ['si'], sub: '2,000 mB for each 1,000 mB of water: the naquadah plant, the Mk1, the culture',
        }),
        n('siO2', 5, 1.5, F('gtceu:oxygen'), 'Oxygen', {
          kind: 'by', pkg: 'B7S', from: ['si'], end: 'home', sub: '1,000 mB a run, home for the engines and the chemistry',
        }),
      ],
    },
    europa: {
      name: 'Europa: something alive',
      line: 'living',
      pkg: 'B8',
      nodes: [
        n('probe', 0, -0.75, I('grindless:cryobot_probe'), 'Cryobot Probe', { kind: 'raw', sub: 'Made at home, spent on the first dive' }),
        n('head', 0, 0.75, I('grindless:melt_head'), 'Melt Head', { kind: 'raw', sub: 'Wears like a drill bit' }),
        n('cryobot', 2.5, 0, M('gtceu:cryobot', 'gtceu:vein_drilling'), 'Cryobot', {
          kind: 'ours', from: ['probe', 'head'],
          desc: 'A melt probe sinks through the ice and pays out its tether on the way down. The ocean underneath is the only place with anything alive in it.',
        }),
        n('sample', 5, 0.75, I('grindless:europan_ocean_sample'), 'Europan Ocean Sample', { from: ['cryobot'] }),
        n('brine', 5, -0.75, F('gtceu:europan_brine'), 'Europan Brine', { from: ['cryobot'] }),
        n('mgso4', 7.5, -0.75, I('gtceu:magnesium_sulfate_dust'), 'Magnesium Sulfate', { kind: 'by', from: ['brine'], by: ['gtceu:centrifuge'], end: 'electrolyzer', sub: 'Centrifuged with salt and water; the electrolyzer splits it' }),
        n('h2o2', 5, 2.25, F('gtceu:hydrogen_peroxide'), 'Hydrogen Peroxide', { kind: 'raw', sub: 'GTM\'s chemical reactor' }),
        n('ext2', 5, 3.75, I('grindless:chondritic_extract'), 'Chondritic Extract', { kind: 'raw', sub: 'From the belt' }),
        n('bioreactor', 7.5, 1.5, M('gtceu:algae_bioreactor', 'gtceu:bioreactor'), 'Algae Bioreactor', {
          kind: 'ours', from: ['sample', 'brine', 'h2o2', 'ext2'],
          desc: 'A culture that lives on hydrogen and oxidants, the way life in that ocean might. The sample stays inside as the seed.',
        }),
        n('bact2', 10, 1, F('gtceu:bacteria'), 'Bacteria', { kind: 'product', from: ['bioreactor'], sub: 'Home to the biofoundry' }),
        n('biomass2', 10, 2.5, F('gtceu:biomass'), 'Biomass', { kind: 'by', from: ['bioreactor'], end: 'bacterial sludge', sub: 'Into bacterial sludge' }),
      ],
    },
    ganymede: {
      name: 'Ganymede: listening and launching',
      pkg: 'B9',
      nodes: [
        L('sgr2', 0, -2.25, 'pl_iv:sgr'),
        n('orb2', 0, -0.75, I('gtceu:data_orb'), 'Data Orb', { kind: 'raw' }),
        n('mass2', 0, 0.75, I('grindless:sapphire_test_mass'), 'Sapphire Test Mass', { kind: 'raw', sub: 'The crystal grower\'s' }),
        n('lhe3', 0, 2.25, F('gtceu:liquid_helium'), 'Liquid Helium', { kind: 'raw', sub: 'Make-up for the cryostats' }),
        n('gw', 2.5, 0.75, M('gtceu:gravitational_wave_detector', 'gtceu:gravitational_wave_astronomy'), 'Gravitational-Wave Detector', {
          kind: 'ours', from: ['sgr2', 'orb2', structure('mass2'), 'lhe3'],
          desc: 'Two long arms buried in quiet ice, listening for space itself to stretch. The Sagittarius A* signal stays in its bus, and the first catalogue holds a black hole merger, heard as a chirp.',
        }),
        n('catalogue', 5, 0.75, I('grindless:gravitational_wave_catalogue'), 'Gravitational-Wave Catalogue', { kind: 'product', role: 'research', from: ['gw'] }),
        n('coilc', 0, 4, I('grindless:coilgun_coil_casing'), 'Coilgun Coil Casing', { kind: 'raw', sub: 'Wound in the magnet works' }),
        n('jprobe', 0, 5.5, I('grindless:jupiter_entry_probe'), 'Jupiter Entry Probe', { kind: 'raw' }),
        n('sprobe', 0, 7, I('grindless:saturn_flyby_probe'), 'Saturn Flyby Probe', { kind: 'raw' }),
        n('coilgunl', 2.5, 5.5, M('gtceu:coilgun_launcher', 'gtceu:probe_launch'), 'Coilgun Probe Launcher', {
          kind: 'ours', from: [structure('coilc'), 'jprobe', 'sprobe'],
          desc: 'Ganymede\'s cold lets an HV superconductor work with no cryostat at all. The barrel throws probes off the moon without a rocket.',
        }),
        n('survey', 5, 4.75, I('grindless:jovian_atmosphere_survey'), 'Jovian Atmosphere Survey', { kind: 'product', role: 'travel', from: ['coilgunl'], sub: 'Kept for ZPM' }),
        n('chart', 5, 6.25, I('grindless:saturn_transfer_chart'), 'Saturn Transfer Chart', { kind: 'product', role: 'travel', from: ['coilgunl'], sub: 'The next trip: kept for ZPM' }),
      ],
    },
    travel: {
      name: 'Getting there',
      role: 'travel',
      pkg: 'B1',
      nodes: [
        n('pearl', 0, -0.75, I('minecraft:ender_pearl'), 'Ender Pearl', { kind: 'raw' }),
        n('he3', 0, 0.75, F('gtceu:helium_3'), 'Helium-3', { kind: 'raw', sub: 'The Moon\'s' }),
        // the belt's own rock: the seed waits for the landing (A1b); Io, Europa and Ganymede seeds take theirs the same way
        n('metrock', 0, -2.25, I('gtceu:raw_meteoric_iron'), 'Raw Meteoric Iron', { kind: 'raw', sub: 'The belt\'s rock: the harpoon drill' }),
        n('seed', 2.5, 0, I('grindless:asteroid_quantum_seed'), 'Quantum Seeds', {
          kind: 'product', from: ['metrock', 'pearl', 'he3'], by: ['gtceu:chemical_reactor'], sub: 'Made on site, from the local rock',
        }),
        n('tiframe', 0, 2.25, I('gtceu:titanium_frame'), 'Titanium Frame', { kind: 'raw' }),
        n('truss', 2.5, 2.25, I('grindless:station_truss_casing'), 'Station Truss Casing', {
          kind: 'product', from: ['tiframe'], by: ['gtceu:assembler'], sub: 'Every station module is built of it',
        }),
        n('kapton', 0, 3.75, I('gcyr:kapton_k_plate'), 'Kapton K Plate', { kind: 'raw' }),
        n('cryotank', 2.5, 3.75, I('grindless:cryogenic_fuel_tank'), 'Cryogenic Fuel Tank', {
          kind: 'product', from: ['kapton'], by: ['gtceu:assembler'], sub: 'The level 4 rocket\'s tanks',
        }),
      ],
    },
  },
};
