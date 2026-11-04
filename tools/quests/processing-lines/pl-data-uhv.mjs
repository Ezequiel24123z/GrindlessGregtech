// pl_uhv: the UHV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UHV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Each row is one line of docs/eras/lines-uv-uhv.md (W1-W11): its feedstock, its machines and its product, with the
// keys steps that carry the chain. Rows are laid out by chain(), 2.5 columns per step.
import { I, F, M, n, L, via } from './pl-lib.mjs';

// a step is [key, resource, title, kind?, options?]: the first step is raw, machines are 'ours', the rest products
function chain(y, steps, end, x0 = 0) {
  const out = steps.map(([key, res, title, kind, opt], i) => n(key, x0 + 2.5 * i, y, res, title, {
    kind: kind || (i === 0 ? 'raw' : res.machine ? 'ours' : 'product'),
    ...(i > 0 ? { from: [steps[i - 1][0]] } : {}),
    ...(opt || {}),
  }));
  const last = out[out.length - 1];
  if (end && last.kind !== 'ours') last.end = end;
  return out;
}
const mach = (id) => M(id);
const tf = 'gtceu:transuranium_facility';

const data = {
  file: 'pl_uhv',
  order: 9,
  title: 'UHV Lines',
  subtitle: 'Heavier isotopes and their clocks, light for computers and lasers, silicon carbide, life at home and on Proxima b, the Swarm and the gate.',
  icon: 'gtceu:high_flux_reactor',
  focus: 'hfr',
  bands: [['isotopes', 'photonics', 'optics'], ['water', 'power', 'life'], ['ground', 'mercury', 'materials'], ['gate', 'antimatter']],
  clusters: {
    isotopes: {
      name: 'Transuranics, clocks and betavoltaics',
      line: 'thorium',
      nodes: [
        L('u233l', 0, 1.5, 'pl_uv:u233'),
        // 3 the nuclear clock: the decay store grows thorium-229 in, the kiln makes the laser-grade fluoride
        n('ds', 2.5, 0, mach(tf), 'Transuranium Facility', { kind: 'ours', from: ['u233l'], desc: 'Its decay store holds the uranium-233 while thorium-229 grows in.' }),
        n('th229', 5, 0, I('grindless:thorium_229'), 'Thorium-229', { kind: 'product', from: ['ds'] }),
        n('hc', 7.5, 0, mach('gtceu:hot_cell'), 'Hot Cell', { kind: 'ours', from: ['th229'], desc: 'Dissolves the thorium-229 as a nitrate behind shielding.' }),
        n('th229n', 10, 0, I('grindless:thorium_229_nitrate'), 'Thorium-229 Nitrate', { kind: 'product', from: ['hc'] }),
        n('kiln', 12.5, 0, mach('gtceu:fluorspar_kiln'), 'Fluorspar Kiln', { kind: 'ours', from: ['th229n'], desc: 'Fluorinates the nitrate to laser-grade thorium tetrafluoride.' }),
        n('thf4', 15, 0, I('grindless:laser_grade_thf4'), 'Laser-Grade ThF4', { kind: 'product', from: ['kiln'] }),
        n('cgf2', 17.5, 0, mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', { kind: 'ours', from: ['thf4'], desc: 'Grows thorium into calcium fluoride.' }),
        n('crys', 20, 0, I('grindless:thorium_caf2_crystal'), 'Th:CaF2 Crystal', { kind: 'product', from: ['cgf2'] }),
        n('lab', 22.5, 0, mach('gtceu:nuclear_clock_lab'), 'Nuclear Clock Lab', { kind: 'ours', from: ['crys'], desc: 'Pumps the nuclear transition with a VUV comb and locks a clock to it.' }),
        n('clock', 25, 0, I('grindless:nuclear_clock'), 'Nuclear Clock', { kind: 'product', from: ['lab'], end: 'the warp gate, and the UHV SMES cell\'s link' }),
        // 8 VUV fluoride optics: the comb the clock lab needs
        ...chain(-3, [
          ['fl', I('gcyr:fluorite_dust'), 'Fluorite', 'raw'],
          ['cgf3', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours', { desc: 'Pulls a calcium fluoride boule from an iridium crucible that is reused.' }],
          ['vb', I('grindless:vuv_caf2_boule'), 'VUV CaF2 Boule'],
          ['vo', I('grindless:vuv_caf2_optic'), 'VUV Optic'],
          ['lab1', mach('gtceu:nuclear_clock_lab'), 'Nuclear Clock Lab', 'ours', { desc: 'Builds the frequency comb from two optics and a fibre laser.' }],
          ['comb', I('grindless:vuv_frequency_comb'), 'VUV Frequency Comb'],
        ], undefined, 10),
        n('flm', 20, -4.5, I('grindless:fibre_laser_module'), 'Fibre Laser Module', { kind: 'raw', sub: 'From the fibre draw' }),
        // 2 U-233 driver fuel, the base of the transcurium line and of the nickel-63 line
        n('fab', 2.5, 3, mach('gtceu:fuel_fabrication_plant'), 'Fuel Fabrication Plant', { kind: 'ours', from: ['u233l'], desc: 'Casts the uranium-233 into HFIR driver elements.' }),
        n('drv', 5, 3, I('grindless:hfir_driver_element'), 'HFIR Driver Element', { kind: 'product', from: ['fab'] }),
        // 4 nickel-63 betavoltaics
        // the nickel-62 row sits between the clock row and the betavoltaic row, so its hot cell is drawn one size smaller
        n('nid', 2.5, 1.5, I('gtceu:nickel_dust'), 'Nickel', { kind: 'raw' }),
        n('hcn', 5, 1.5, mach('gtceu:hot_cell'), 'Hot Cell', { kind: 'ours', size: 1.25, from: ['nid'], desc: 'Enriches nickel-62 through carbon monoxide; the gas and the rest of the nickel come back.' }),
        n('n62', 7.5, 1.5, I('grindless:nickel_62_target'), 'Nickel-62 Target', { from: ['hcn'], sub: 'Enriched in the IV hot cell' }),
        n('hfrn', 7.5, 3, mach('gtceu:high_flux_reactor'), 'High Flux Reactor', { kind: 'ours', from: ['n62'], desc: 'Captures a neutron in the target, with a driver element beside it.' }),
        n('n63', 10, 3, I('grindless:nickel_63_target'), 'Nickel-63 Target', { kind: 'product', from: ['hfrn'] }),
        n('pl', 12.5, 3, F('gtceu:nickel_63_plating_liquor'), 'Plating Liquor', { kind: 'product', from: ['n63'] }),
        L('zplate', 12.5, 1.5, 'pl_zpm:plate'),
        n('diode', 15, 1.5, I('grindless:diamond_diode'), 'Diamond Diode', { from: ['zplate'], by: ['gtceu:diamond_cvd'], sub: 'Doped diamond grown on the CVD plate' }),
        n('bfab', 15, 3, mach('gtceu:betavoltaic_fab'), 'Betavoltaic Fab', { kind: 'ours', from: ['pl', 'diode'], desc: 'Plates the diamond with nickel-63 and seals the cell.' }),
        n('bcell', 17.5, 3, I('grindless:betavoltaic_cell'), 'Betavoltaic Cell', { kind: 'product', from: ['bfab'], end: 'small, steady current for stations and probes' }),
        n('dpl', 12.5, 4.5, F('gtceu:depleted_nickel_plating_liquor'), 'Depleted Liquor', { kind: 'ret', from: ['pl'], sub: 'Back to the plating bath' }),
        // 1 transcurium breeding
        n('hco', 0, 6, I('grindless:heavy_curium_oxide'), 'Heavy Curium Oxide', { kind: 'raw', sub: 'Kept from UV\'s heat source works' }),
        n('tf0', 2.5, 6, mach(tf), 'Transuranium Facility', { kind: 'ours', from: ['hco'], desc: 'Presses the oxide into targets in its target mode.' }),
        n('tt', 5, 6, I('grindless:transcurium_target'), 'Transcurium Target', { kind: 'product', from: ['tf0'] }),
        n('hfr', 7.5, 6, mach('gtceu:high_flux_reactor'), 'High Flux Reactor', { kind: 'ours', from: ['tt'], desc: 'A small dense core with a very high neutron flux.' }),
        n('itt', 10, 6, I('grindless:irradiated_transcurium_target'), 'Irradiated Target', { kind: 'product', from: ['hfr'] }),
        n('tfd', 12.5, 6, mach(tf), 'Transuranium Facility', { kind: 'ours', from: ['itt'], desc: 'Dissolves the irradiated target.' }),
        n('tl', 15, 6, F('gtceu:transcurium_liquor'), 'Transcurium Liquor', { kind: 'product', from: ['tfd'] }),
        n('tfs', 17.5, 6, mach(tf), 'Transuranium Facility', { kind: 'ours', from: ['tl'], desc: 'Separates berkelium and californium with HDEHP; the solvent is cleaned and reused.' }),
        n('cf', 20, 6, I('grindless:californium_252'), 'Californium-252', { kind: 'product', from: ['tfs'] }),
        n('hfr2', 22.5, 6, mach('gtceu:high_flux_reactor'), 'High Flux Reactor', { kind: 'ours', from: ['cf'], desc: 'Seals the californium with platinum foil and helium into a neutron source.' }),
        n('cfs', 25, 6, I('grindless:californium_252_source'), 'Californium-252 Source', { kind: 'product', from: ['hfr2'], end: 'the reactors that cannot start alone' }),
        n('spent', 7.5, 9, I('grindless:spent_hfir_driver_element'), 'Spent Driver Element', { kind: 'product', from: ['hfr'] }),
        n('pyro', 10, 9, mach('gtceu:pyroprocessing_cell'), 'Pyroprocessing Cell', { kind: 'ours', from: ['spent'], desc: 'Pulls the uranium-233 back out of the spent driver.' }),
        n('u233r', 12.5, 9, I('gtceu:uranium_233_ingot'), 'Uranium-233', { kind: 'ret', from: ['pyro'], sub: 'Into a fresh driver' }),
        n('fp', 10, 7.5, F('gtceu:fission_product_liquor'), 'Fission Product Liquor', { kind: 'by', from: ['itt'], end: 'the synroc line, contained' }),
        n('hdsol', 15, 7.5, F('gtceu:hdehp_solvent'), 'HDEHP Solvent', { kind: 'raw', sub: 'From the HDEHP line; cleaned and reused' }),
        n('bk', 20, 7.5, I('grindless:berkelium_249'), 'Berkelium-249', { kind: 'by', from: ['tfs'], end: 'the next target' }),
      ],
    },
    photonics: {
      name: 'Light: lithium niobate, phase change, memory, lasers and the mainframe',
      nodes: [
        // 5 lithium niobate photonics
        ...chain(0, [
          ['li', I('gtceu:lithium_dust'), 'Lithium', 'raw', { sub: 'From Mars lithium carbonate' }],
          ['lnb', I('grindless:lithium_niobate_boule'), 'LN Boule'],
          ['lnw', I('grindless:lithium_niobate_wafer'), 'LN Wafer'],
          ['lni', I('grindless:implanted_ln_wafer'), 'Implanted LN Wafer'],
          ['lnoi', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
          ['etch', I('grindless:etched_lnoi_wafer'), 'Etched LNOI Wafer'],
          ['mod', I('grindless:thin_film_ln_modulator'), 'Thin-Film Modulator'],
        ]),
        // 6 phase change memory
        ...chain(2, [
          ['ge', I('gtceu:germanium_dust'), 'Germanium', 'raw', { sub: 'With antimony and tellurium' }],
          ['gst', I('grindless:gst_target'), 'GST Target'],
          ['pf', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours', { desc: 'Sputters the chalcogenide film on an LNOI wafer and patterns the die.' }],
          ['pcm', I('grindless:pcm_photonic_die'), 'PCM Photonic Die'],
        ], undefined, 5),
        n('sgst', 10, 3.5, I('grindless:spent_gst_target'), 'Spent GST Target', { kind: 'ret', from: ['pf'], sub: 'Remelted into a fresh target' }),
        // 7 quantum memory
        ...chain(7, [
          ['eu', I('gtceu:europium_oxide_dust'), 'Europium Oxide', 'raw', { sub: 'With yttrium and silica' }],
          ['cgf', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours', { desc: 'Pulls the boule from an iridium crucible that is reused.' }],
          ['yso', I('grindless:eu_yso_boule'), 'Eu:YSO Boule'],
          ['pf2', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours', { desc: 'Cuts and mounts the boule as a memory chip.' }],
          ['qmc', I('grindless:quantum_memory_chip'), 'Quantum Memory Chip'],
        ], undefined, 7),
        // 9 quantum cascade lasers
        ...chain(5, [
          ['in', I('gtceu:indium_dust'), 'Indium', 'raw', { sub: 'With phosphorus' }],
          ['inpb', I('grindless:inp_boule'), 'InP Boule'],
          ['inpw', I('grindless:inp_wafer'), 'InP Wafer'],
          ['mbe', mach('gtceu:mbe_reactor'), 'MBE Reactor', 'ours', { desc: 'Grows the superlattice one atomic layer at a time.' }],
          ['qsw', I('grindless:qcl_superlattice_wafer'), 'Superlattice Wafer'],
          ['qcl', I('grindless:quantum_cascade_laser'), 'Quantum Cascade Laser'],
        ], undefined, 2),
        // the optical processor, the optical assembly and the wetware mainframe they end in
        n('upwp', 17.5, 0, F('gtceu:ultrapure_water'), 'Ultrapure Water', { kind: 'raw', sub: 'From the ultrapure water line' }),
        n('opf', 17.5, 2, mach('gtceu:photonic_foundry'), 'Photonic Foundry', { kind: 'ours', from: ['mod', 'pcm', 'qcl', 'upwp'], desc: 'Bonds the dies, modulators and laser on an LNOI wafer.' }),
        n('oproc', 20, 2, I('gtnn:optical_processor'), 'Optical Processor', { kind: 'product', from: ['opf'] }),
        n('oaf', 21, 5, mach('gtceu:photonic_foundry'), 'Photonic Foundry', { kind: 'ours', from: ['oproc', 'qmc'], desc: 'Pairs two optical processors with two memory chips.' }),
        n('oasm', 23.5, 5, I('gtnn:optical_assembly'), 'Optical Assembly', { kind: 'product', from: ['oaf'] }),
        n('opr', 23.5, 7.5, I('grindless:organoid_processor'), 'Organoid Processor', { kind: 'raw', sub: 'Four of them; from the organoid line' }),
        n('sicr', 23.5, 9.5, I('grindless:sic_power_module'), 'SiC Power Module', { kind: 'raw', sub: 'From the silicon carbide line' }),
        n('oam', 26, 6.5, mach('gtceu:organoid_array'), 'Organoid Array', { kind: 'ours', from: ['oasm', 'opr', 'sicr'], desc: 'Wires four organoid processors to an optical assembly.' }),
        n('mf', 28.5, 6.5, I('gtceu:wetware_processor_mainframe'), 'Wetware Mainframe', { kind: 'product', from: ['oam'], end: 'every UHV machine' }),
      ],
    },
    optics: {
      name: 'ZBLAN fibre from orbit',
      nodes: [
        // 31 ZBLAN
        ...chain(0, [
          ['zr', I('gtceu:zirconia_dust'), 'Zirconia', 'raw', { sub: 'With hydrofluoric acid' }],
          ['zf', I('gtceu:zirconium_tetrafluoride_dust'), 'Zirconium Tetrafluoride'],
          ['tw1', mach('gtceu:zblan_draw_tower'), 'ZBLAN Draw Tower', 'ours', { desc: 'Melts the fluoride batch into a preform in orbit.' }],
          ['pre', I('grindless:zblan_preform'), 'ZBLAN Preform'],
          ['draw', mach('gtceu:zblan_draw_tower'), 'ZBLAN Draw Tower', 'ours', { desc: 'Pulls fibre in microgravity, where the glass does not crystallise.' }],
          ['zbf', I('grindless:zblan_fibre'), 'ZBLAN Fibre', 'product', { keepShort: 'the zirconium fluoride is bought pure from the orbital furnace; a purification stage would be padding' }],
        ], 'the stellar neighbourhood chart; fibre lasers and the cable of the next tier'),
      ],
    },
    water: {
      name: 'Ultrapure water: five grades and the plant',
      nodes: [
        // 11 ultrapure water: the foundry drinks it in every recipe
        ...chain(0, [
          ['w', F('minecraft:water'), 'Water', 'raw'],
          ['g1', F('gtca:purified_water_grade_1'), 'Water, Grade 1'],
          ['g2', F('gtca:purified_water_grade_2'), 'Water, Grade 2'],
          ['g3', F('gtca:purified_water_grade_3'), 'Water, Grade 3'],
          ['g4', F('gtca:purified_water_grade_4'), 'Water, Grade 4'],
          ['g5', F('gtca:purified_water_grade_5'), 'Water, Grade 5'],
          ['plant', mach('gtceu:ultrapure_water_plant'), 'Ultrapure Water Plant', 'ours', { desc: 'Reverse osmosis, deionisation, UV and ozone, degassing and ultrafiltration in one multiblock.' }],
          ['upw', F('gtceu:ultrapure_water'), 'Ultrapure Water'],
        ], 'every foundry recipe'),
      ],
    },
    power: {
      name: 'Silicon carbide, solar arrays and the Swarm',
      line: 'swarm',
      nodes: [
        // 10 silicon carbide power
        ...chain(0, [
          ['ps', I('grindless:polysilicon'), 'Polysilicon', 'raw', { sub: 'With graphite and argon' }],
          ['spw', I('grindless:sic_source_powder'), 'SiC Source Powder'],
          ['boule', I('grindless:sic_boule'), 'SiC Boule'],
          ['wafer', I('grindless:sic_wafer'), 'SiC Wafer'],
          ['epi', I('grindless:sic_epi_wafer'), 'Epi Wafer'],
          ['imp', I('grindless:implanted_sic_wafer'), 'Implanted Wafer'],
          ['dev', I('grindless:sic_device_wafer'), 'Device Wafer'],
          ['smod', I('grindless:sic_power_module'), 'SiC Power Module'],
        ]),
        // 21 space photovoltaics
        ...chain(2.5, [
          ['ga', I('grindless:gallium_arsenide_wafer'), 'Gallium Arsenide Wafer', 'raw', { sub: 'With phosphorus, indium and arsine' }],
          ['iepi', I('grindless:imm_epi_wafer'), 'IMM Epi Wafer'],
          ['ifilm', I('grindless:imm_film'), 'IMM Film'],
          ['spv', mach('gtceu:solar_array_fab'), 'Solar Array Fab', 'ours', { desc: 'Laminates four films and a cerium coverglass on a SiC power module.' }],
          ['arr', I('grindless:imm_solar_array'), 'IMM Solar Array'],
        ], undefined, 5.5),
        // 22 carbon-12 spreaders
        ...chain(5, [
          ['c12co', F('gtceu:carbon_12_monoxide'), 'Carbon-12 Monoxide', 'raw', { sub: 'From the isotope column' }],
          ['c12ch', F('gtceu:carbon_12_methane'), 'Carbon-12 Methane'],
          ['dlf', mach('gtceu:diamond_lattice_fab'), 'Diamond Lattice Fab', 'ours', { desc: 'Grows the diamond on a seed in carbon-12 methane.' }],
          ['c12', I('grindless:c12_diamond_spreader'), 'C-12 Diamond Spreader'],
        ], undefined, 8),
        // 30 oganesson propellant
        ...chain(11, [
          ['crude', F('gtceu:oganesson'), 'Crude Oganesson', 'raw', { sub: 'Off-gas of the Mk3 fusion ring' }],
          ['cry', mach('gtceu:cryogenic_plant'), 'Cryogenic Plant', 'ours', { desc: 'Cools the off-gas and splits the propellant from the krypton and xenon.' }],
          ['prop', F('gtceu:oganesson_propellant'), 'Oganesson Propellant'],
          ['thw', mach('gtceu:thruster_works'), 'Thruster Works', 'ours', { desc: 'Fills an empty tank with the propellant.' }],
          ['pod', I('grindless:oganesson_propellant_pod'), 'Propellant Pod'],
        ], undefined, 10.5),
        n('tank', 17.5, 13.5, I('grindless:propellant_tank'), 'Propellant Tank', { kind: 'raw', sub: 'The swarm station gives it back empty' }),
        // 23 swarm segments and their wear
        n('film3', 20, 0.5, I('grindless:aluminium_reflector_film'), 'Reflector Film', { kind: 'raw', sub: 'From Mercury\'s aluminium' }),
        n('flm2', 17.5, 2, I('grindless:fibre_laser_module'), 'Fibre Laser Module', { kind: 'raw', sub: 'From the fibre draw' }),
        n('bvc', 20, 6.5, I('grindless:betavoltaic_cell'), 'Betavoltaic Cell', { kind: 'raw', sub: 'Two of them; from the nickel-63 line' }),
        n('sf', 20, 3.5, mach('gtceu:swarm_segment_foundry'), 'Swarm Segment Foundry', { kind: 'ours', from: ['film3', 'arr', 'flm2', 'c12', 'smod', 'bvc'], desc: 'Builds a segment from films, arrays, a laser, a spreader, a power module and cells.' }),
        n('seg', 22.5, 3.5, I('grindless:swarm_segment'), 'Swarm Segment', { kind: 'product', from: ['sf'] }),
        n('scs', 22.5, 6.5, mach('gtceu:swarm_control_station'), 'Swarm Control Station', { kind: 'ours', from: ['seg', 'pod'], desc: 'Steers the segments round the Sun and beams the power home.' }),
        n('worn', 25, 6.5, I('grindless:worn_swarm_segment'), 'Worn Segment', { kind: 'by', from: ['scs'], end: 'refurbished, then back into the foundry' }),
      ],
    },
    life: {
      name: 'Organoids, xeno-biochemistry and far-red algae',
      nodes: [
        // 13 xeno radioprotectant, then 12 organoid processors
        ...chain(0, [
          ['flora', I('grindless:proxima_flora_sample'), 'Proxima Flora Sample', 'raw'],
          ['srf', mach('gtceu:sample_receiving_facility'), 'Sample Receiving Facility', 'ours', { desc: 'Sterilises the sample and isolates its strain and its genome.' }],
          ['strain', I('grindless:characterised_xeno_strain'), 'Characterised Strain'],
          ['gh', mach('gtceu:xenobotany_greenhouse'), 'Xenobotany Greenhouse', 'ours', { desc: 'Grows the strain under a red lamp.' }],
          ['bio', I('grindless:xeno_biomass'), 'Xeno Biomass'],
          ['lys', F('gtceu:clarified_xeno_lysate'), 'Clarified Lysate'],
          ['rad', I('grindless:xeno_radioprotectant'), 'Xeno Radioprotectant'],
          ['olab', mach('gtceu:organoid_lab'), 'Organoid Lab', 'ours', { desc: 'Doses the sterile medium with the radioprotectant.' }],
          ['med', F('gtceu:sterilised_growth_medium'), 'Sterilised Medium'],
          ['oa', mach('gtceu:organoid_array'), 'Organoid Array', 'ours', { desc: 'Grows cortical organoids on a chitosan scaffold and mounts them on an electrode array.' }],
          ['op', I('grindless:organoid_processor'), 'Organoid Processor'],
        ], 'four make a wetware mainframe'),
        // 14 chitosan scaffolds: mushrooms, chitin, chitosan, the freeze-cast scaffold
        n('mush', 10.5, -2, I('grindless:xeno_mushroom'), 'Xeno Mushroom', { kind: 'product', from: ['gh'] }),
        n('chin', 13, -2, I('grindless:xeno_chitin'), 'Xeno Chitin', { kind: 'product', from: ['mush'] }),
        n('chto', 15.5, -2, I('grindless:xeno_chitosan'), 'Xeno Chitosan', { kind: 'product', from: ['chin'] }),
        n('chs', 18, -2, I('grindless:chitosan_scaffold'), 'Chitosan Scaffold', { kind: 'product', from: ['chto'] }),
        // 32 far-red photosynthesis
        n('gen', 5, 2, I('grindless:xeno_genome_data'), 'Xeno Genome Data', { kind: 'product', from: ['srf'] }),
        n('cass', 7.5, 2, I('grindless:far_red_gene_cassette'), 'Far-Red Gene Cassette', { kind: 'product', from: ['gen'] }),
        n('algc', 10, 7, I('grindless:algae_culture'), 'Algae Culture', { kind: 'raw', sub: 'With agar, from the closed ecosystem' }),
        n('alg', 10, 5, I('grindless:engineered_far_red_algae'), 'Engineered Algae', { kind: 'product', from: ['cass', 'algc'] }),
        n('abr', 12.5, 5, mach('gtceu:algae_bioreactor'), 'Algae Bioreactor', { kind: 'ours', from: ['alg'], desc: 'Feeds the algae carbon dioxide and water in the red light.' }),
        n('biom', 15, 5, F('gtceu:biomass'), 'Biomass', { kind: 'by', from: ['abr'], end: 'biorefinery fuel, and oxygen for the base\'s air' }),
        // 15 melanin flare shielding
        ...chain(-4.5, [
          ['clado', I('grindless:cladosporium_culture'), 'Cladosporium Culture', 'raw'],
          ['vat', mach('gtceu:radiotrophic_vat'), 'Radiotrophic Vat', 'ours', { desc: 'Grows black fungi that eat radiation.' }],
          ['melb', I('grindless:melanised_biomass'), 'Melanised Biomass'],
          ['mel', I('grindless:melanin_extract'), 'Melanin Extract'],
          ['comp', I('grindless:melanin_chitosan_composite'), 'Melanin-Chitosan Composite'],
          ['panel', I('grindless:flare_shield_panel'), 'Flare Shield Panel'],
          ['pbc', I('grindless:proxima_base_casing'), 'Proxima Base Casing', 'product'],
        ], 'the base on Proxima b', 9.5),
        // 17 biocement
        n('tail2', 14.5, -7, I('grindless:leached_tailings'), 'Leached Tailings', { kind: 'raw', sub: 'From the biomining heap' }),
        n('cacl', 17, -7, I('gtceu:calcium_chloride_dust'), 'Calcium Chloride', { kind: 'product', from: ['tail2'] }),
        n('cold2', 17, -9, I('grindless:cold_trap_regolith'), 'Cold-Trap Regolith', { kind: 'raw' }),
        n('sp', 19.5, -9, I('grindless:sporosarcina_culture'), 'Sporosarcina Culture', { kind: 'raw', sub: 'With urea' }),
        n('heap2', 19.5, -7, mach('gtceu:biomining_heap'), 'Biomining Heap', { kind: 'ours', from: ['cacl', 'cold2', 'sp'], desc: 'Bacteria cement the regolith with calcium carbonate.' }),
        n('bcr', 22, -7, I('grindless:biocemented_regolith'), 'Biocemented Regolith', { kind: 'product', from: ['heap2'] }),
        L('lnqa', 22, -2.25, 'pl_luv:nqa'),
      ],
    },
    ground: {
      name: 'Proxima b ground: biomining, ice and the RTAN cell',
      nodes: [
        // 16 biomining, then 29 RTAN superconductor
        ...chain(0, [
          ['cold', I('grindless:cold_trap_regolith'), 'Cold-Trap Regolith', 'raw'],
          ['heap', mach('gtceu:biomining_heap'), 'Biomining Heap', 'ours', { desc: 'Bacteria leach the metals out: no cyanide.' }],
          ['pgm', F('gtceu:proxima_pgm_liquor'), 'PGM Liquor'],
          ['pp', mach('gtceu:platinum_plant'), 'Platinum Plant', 'ours', { desc: 'Turns the liquor into salts, then ruthenium and iridium.' }],
          ['rud', I('gtceu:ruthenium_dust'), 'Ruthenium'],
          ['abs', mach('gtceu:alloy_blast_smelter'), 'Alloy Blast Smelter', 'machine', { desc: 'Melts it with trinium, americium and neutronium.' }],
          ['rmol', F('gtceu:molten_ruthenium_trinium_americium_neutronate'), 'Molten RTAN'],
          ['rwire', I('gtceu:ruthenium_trinium_americium_neutronate_single_wire'), 'RTAN Wire', 'product', { from: [via('rmol', 'gtceu:ruthenium_trinium_americium_neutronate_ingot')] }],
          ['nmw', mach('gtceu:naquadria_magnet_works'), 'Naquadria Magnet Works', 'ours', { desc: 'Winds the UHV cell with RTAN wire and UV cells.' }],
          ['cell', I('grindless:uhv_smes_cell'), 'UHV SMES Cell'],
        ], 'the wireless network'),
        n('ir', 7.5, 1.5, I('gtceu:iridium_dust'), 'Iridium', { kind: 'by', from: ['pp'], end: 'the iridium crucible' }),
        n('tail', 5, -1.5, I('grindless:leached_tailings'), 'Leached Tailings', { kind: 'by', from: ['heap'], end: 'biocement, and EV\'s regolith cell' }),
        n('uvc', 20, 1.75, I('grindless:uv_smes_cell'), 'UV SMES Cell', { kind: 'raw', sub: 'Four of them, with RTAN wire' }),
        // 18 ices
        ...chain(4, [
          ['core', I('grindless:proxima_ice_core'), 'Ice Core', 'raw'],
          ['dw', F('gtceu:deuterium_enriched_water'), 'Deuterium-Rich Water'],
          ['hwp1', mach('gtceu:heavy_water_plant'), 'Heavy Water Plant', 'ours', { desc: 'Exchanges deuterium with hydrogen sulfide.' }],
          ['hwc', F('gtceu:heavy_water_concentrate'), 'Heavy Water Concentrate'],
          ['hwp2', mach('gtceu:heavy_water_plant'), 'Heavy Water Plant', 'ours', { desc: 'Finishes the concentrate.' }],
          ['hw', F('gtceu:heavy_water'), 'Heavy Water', 'product', { role: 'resource' }],
        ], 'the fusion fuel line'),
      ],
    },
    mercury: {
      name: 'Mercury: regolith, reflector film and magnesium diboride',
      line: 'swarm',
      nodes: [
        // 19 regolith fractions
        ...chain(0, [
          ['reg', I('grindless:mercury_regolith'), 'Mercury Regolith', 'raw'],
          ['svf', mach('gtceu:solar_vapour_furnace'), 'Solar Vapour Furnace', 'ours', { desc: 'Sunlight on regolith: low heat first, then high.' }],
          ['strip', I('grindless:stripped_mercury_regolith'), 'Stripped Regolith'],
          ['svf2', mach('gtceu:solar_vapour_furnace'), 'Solar Vapour Furnace', 'ours', { desc: 'The high-heat fraction leaves alumina and calcia.' }],
          ['ac', I('grindless:alumina_calcia_residue'), 'Alumina-Calcia'],
          ['ald', I('gtceu:aluminium_dust'), 'Aluminium'],
          ['alu', I('gtceu:aluminium_ingot'), 'Aluminium Ingot'],
          ['lsf', mach('gtceu:light_sail_fab'), 'Light Sail Fab', 'ours', { desc: 'Rolls the ingot into mirror film.' }],
          ['film', I('grindless:aluminium_reflector_film'), 'Reflector Film'],
        ], 'the swarm segment foundry'),
      ],
    },
    gate: {
      name: 'The gate ring: MgB2 coils, cured and qualified',
      line: 'gate',
      nodes: [
        // 20 and 33 gate ring casings: Mercury's magnesium, MgB2 wire, then the coil is wound, reacted, impregnated and tested
        ...chain(0, [
          ['greg', I('grindless:mercury_regolith'), 'Mercury Regolith', 'raw'],
          ['gsv1', mach('gtceu:solar_vapour_furnace'), 'Solar Vapour Furnace', 'ours', { desc: 'Sunlight on regolith: the low fraction first.' }],
          ['gstr', I('grindless:stripped_mercury_regolith'), 'Stripped Regolith'],
          ['gsv2', mach('gtceu:solar_vapour_furnace'), 'Solar Vapour Furnace', 'ours', { desc: 'The high fraction gives magnesium.' }],
          ['gmg', I('gtceu:magnesium_dust'), 'Magnesium'],
          ['gmgb', I('gtceu:magnesium_diboride_dust'), 'MgB2 Powder', 'product', { sub: 'Mixer, with boron' }],
          ['gpit', mach('gtceu:powder_in_tube_line'), 'Powder-in-Tube Line', 'ours', { desc: 'Packs the powder in an iron tube and draws it to wire.' }],
          ['rwi', I('gtceu:magnesium_diboride_single_wire'), 'MgB2 Wire'],
          ['rm1', mach('gtceu:naquadria_magnet_works'), 'Naquadria Magnet Works', 'ours', { desc: 'Braids the wire into cable.' }],
          ['rcab', I('grindless:mgb2_cable'), 'MgB2 Cable'],
          ['rm2', mach('gtceu:naquadria_magnet_works'), 'Naquadria Magnet Works', 'ours', { desc: 'Winds the cable into a gate coil.' }],
          ['rwnd', I('grindless:gate_coil_winding'), 'Gate Coil Winding'],
          ['rebf', mach('gtceu:electric_blast_furnace'), 'Electric Blast Furnace', 'ours', { desc: 'Reacts the winding so the powder turns superconducting.' }],
          ['rrea', I('grindless:reacted_gate_coil'), 'Reacted Gate Coil'],
          ['rac', mach('gtceu:composite_autoclave'), 'Composite Autoclave', 'ours', { desc: 'Impregnates the coil with epoxy and cures it.' }],
          ['rimp', I('grindless:impregnated_gate_coil'), 'Impregnated Gate Coil'],
          ['rm3', mach('gtceu:naquadria_magnet_works'), 'Naquadria Magnet Works', 'ours', { desc: 'Tests the coil at field.' }],
          ['rqual', I('grindless:qualified_gate_coil'), 'Qualified Gate Coil'],
          ['rasm', mach('gtceu:uhv_assembler'), 'UHV Assembler', 'ours', { desc: 'Seats the coil in a neutronium shell.' }],
          ['rcas', I('grindless:warp_gate_casing'), 'Warp Gate Casing'],
        ], 'the ring of the warp gate'),
        n('gbor', 12.5, 1.5, I('gtceu:boron_dust'), 'Boron', { kind: 'raw', sub: 'From the borax line' }),
      ],
    },
    materials: {
      name: 'PBO, the tether and elevator, HDEHP and ultra-high-temperature ceramics',
      nodes: [
        // 24 PBO fibre, then 7 the tether ribbon and the space elevator
        ...chain(0, [
          ['bnz', F('gtceu:benzene'), 'Benzene', 'raw', { sub: 'The HV reformer\'s; chlorinated in a chemical reactor' }],
          ['tcb', F('gtceu:trichlorobenzene'), 'Trichlorobenzene'],
          ['dnt', F('gtceu:dinitrotrichlorobenzene'), 'Dinitrotrichlorobenzene'],
          ['cdr', I('gtceu:chlorodinitroresorcinol_dust'), 'Chlorodinitroresorcinol'],
          ['bz', I('gtceu:diaminoresorcinol_dust'), 'Diaminoresorcinol', 'product', { sub: 'With terephthalic acid' }],
          ['dope', F('gtceu:pbo_dope'), 'PBO Dope'],
          ['pbop', mach('gtceu:pbo_plant'), 'PBO Plant', 'ours', { desc: 'Spins the dope in polyphosphoric acid, which is recycled.' }],
          ['fib', I('grindless:pbo_fibre'), 'PBO Fibre', 'product'],
          ['rw', mach('gtceu:tether_ribbon_works'), 'Tether Ribbon Works', 'ours', { desc: 'Braids the PBO fibre with carbon nanotube and BNNT yarn.' }],
          ['rseg', I('grindless:tether_ribbon_segment'), 'Tether Ribbon Segment'],
          ['elev', mach('gtca:space_elevator'), 'Space Elevator', 'ours', { desc: 'Lifts the stage up the ribbon, one climb per stage.' }],
        ]),
        n('geo', 27.5, 2, I('grindless:geo_assembled_stage'), 'Geo-Assembled Stage', { kind: 'product', from: ['elev'] }),
        // 25 HDEHP extractant
        ...chain(2, [
          ['eh', F('gtceu:ethylhexenal'), '2-Ethylhexenal', 'raw', { sub: 'From propene and syngas' }],
          ['ol', F('gtceu:ethylhexanol'), '2-Ethylhexanol'],
          ['hd', F('gtceu:hdehp_extractant'), 'HDEHP'],
          ['sol', F('gtceu:hdehp_solvent'), 'HDEHP Solvent'],
        ], 'the transuranium facility'),
        n('spsol', 7.5, 3.5, F('gtceu:spent_hdehp_solvent'), 'Spent Solvent', { kind: 'by', from: ['sol'], end: 'incinerated; the phosphoric acid comes back' }),
        // 26 UHTC
        ...chain(5, [
          ['rz', I('gtca:red_zircon_dust'), 'Red Zircon', 'raw', { sub: 'The End\'s zircon' }],
          ['zro', I('gtceu:zirconia_dust'), 'Zirconia'],
          ['zrdb', I('gtceu:zirconium_diboride_dust'), 'Zirconium Diboride'],
          ['zrb2', I('gtceu:uhtc_blend_dust'), 'UHTC Blend', 'product', { sub: 'With silicon carbide' }],
          ['sps', mach('gtceu:spark_plasma_sinterer'), 'Spark Plasma Sinterer', 'ours', { desc: 'Presses the blend to a tile in seconds.' }],
          ['tile', I('grindless:uhtc_tile'), 'UHTC Tile'],
          ['sps2', mach('gtceu:spark_plasma_sinterer'), 'Spark Plasma Sinterer', 'ours', { desc: 'Sinters four tiles and a tantalum carbide liner into a nozzle.' }],
          ['noz', I('grindless:uhtc_nozzle'), 'UHTC Nozzle'],
          ['thk', mach('gtceu:thruster_works'), 'Thruster Works', 'ours', { desc: 'Mounts the nozzle with an antimatter pellet, power modules and a lifted stage.' }],
          ['ican', I('grindless:ican_rocket_motor'), 'ICAN Rocket Motor'],
        ], 'the probe stages', 10),
        n('pellet', 30, 8, I('grindless:ican_pellet'), 'ICAN Pellet', { kind: 'raw', sub: 'From the antimatter store' }),
        n('sicm', 27.5, 7.5, I('grindless:sic_power_module'), 'SiC Power Module', { kind: 'raw', sub: 'Two; from the silicon carbide line' }),
      ],
    },
    antimatter: {
      name: 'Positrons, the Casimir array and the gate',
      nodes: [
        // 27 positrons to antihydrogen
        ...chain(0, [
          ['mgt', I('grindless:magnesium_target'), 'Magnesium Target', 'raw'],
          ['na22', I('grindless:sodium_22_target'), 'Sodium-22 Target'],
          ['src', I('grindless:moderated_positron_source'), 'Moderated Source'],
          ['acc', mach('gtceu:positron_accumulator'), 'Positron Accumulator', 'ours', { desc: 'Traps the positrons in a Surko trap.' }],
          ['pos', I('grindless:positron_cartridge'), 'Positron Cartridge'],
          ['ah', I('grindless:antihydrogen_cartridge'), 'Antihydrogen Cartridge'],
        ]),
        n('spna', 7.5, 1.5, I('grindless:spent_positron_source'), 'Spent Source', { kind: 'by', from: ['src'], end: 'the synroc line, contained' }),
        // 28 Casimir exotic matter (fiction)
        ...chain(3, [
          ['mir', I('grindless:sic_mirror_blank'), 'SiC Mirror Blank', 'raw'],
          ['nbn', I('grindless:nbn_coated_sic_plate'), 'NbN-Coated Plate'],
          ['stack', I('grindless:casimir_cavity_stack'), 'Cavity Stack'],
          ['cas', mach('gtceu:casimir_array'), 'Casimir Array', 'ours', { desc: 'Fiction: the force is real, the exotic matter is not.' }],
          ['exo', I('grindless:exotic_matter_cell'), 'Exotic Matter Cell'],
          ['gate', mach('gtceu:warp_gate'), 'Warp Gate', 'ours', { desc: 'Opens with exotic matter and antihydrogen; the shells return.' }],
        ]),
        n('clk', 10, 5.25, I('grindless:nuclear_clock'), 'Nuclear Clock', { kind: 'raw', sub: 'From the clock lab' }),
        n('opg', 12.5, 5.25, I('grindless:organoid_processor'), 'Organoid Processor', { kind: 'raw', sub: 'From the organoid line' }),
        n('seed', 15, 3, I('grindless:proxima_gate_seed'), 'Proxima Gate Seed', { kind: 'product', from: ['gate'], end: 'the way to Proxima b' }),
      ],
    },
  },
};

// arrows a row cannot carry: an item that a machine (or a later step) also takes from another row
const take = (cluster, key, ...srcs) => { data.clusters[cluster].nodes.find((nd) => nd.key === key).from.push(...srcs); };
take('isotopes', 'lab1', 'flm');
take('isotopes', 'lab', 'comb');
take('isotopes', 'tfs', 'hdsol');
take('isotopes', 'hfr', 'drv');
take('isotopes', 'hfrn', 'drv');
take('photonics', 'pf', 'lnoi');
take('gate', 'gmgb', 'gbor');
take('life', 'oa', 'chs');
take('life', 'comp', 'chs');
take('life', 'pbc', 'bcr');
take('life', 'panel', via('lnqa', 'gtceu:naquadah_alloy_plate'));
take('antimatter', 'gate', 'ah', 'clk', 'opg');
take('ground', 'nmw', 'uvc');
take('power', 'thw', 'tank');
take('materials', 'thk', 'pellet', 'sicm', 'geo');
export default data;
