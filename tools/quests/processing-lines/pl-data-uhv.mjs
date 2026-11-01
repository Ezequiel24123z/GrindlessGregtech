// pl_uhv: the UHV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UHV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Each row is one line of docs/eras/uhv.md ("New process lines", numbers in the comments): its feedstock, its machines and
// its product, with the keys steps that carry the chain. Rows are laid out by chain(), 2.5 columns per step.
import { I, F, M, n } from './pl-lib.mjs';

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

const data = {
  file: 'pl_uhv',
  order: 9,
  title: 'UHV Lines',
  subtitle: 'Heavier isotopes and their clocks, light for computers and lasers, silicon carbide, life at home and on Proxima b, the Swarm and the gate.',
  icon: 'gtceu:high_flux_reactor',
  focus: 'hfr',
  bands: [['isotopes', 'photonics', 'optics'], ['power', 'life', 'ground'], ['mercury', 'materials', 'antimatter']],
  clusters: {
    isotopes: {
      name: 'Transuranics, clocks and betavoltaics',
      nodes: [
        // 1 transcurium breeding
        ...chain(0, [
          ['hco', I('grindless:heavy_curium_oxide'), 'Heavy Curium Oxide', 'raw', { sub: 'Kept from UV\'s heat source works' }],
          ['tt', I('grindless:transcurium_target'), 'Transcurium Target'],
          ['hfr', mach('gtceu:high_flux_reactor'), 'High Flux Reactor', 'ours', { desc: 'A small dense core with a very high neutron flux.' }],
          ['itt', I('grindless:irradiated_transcurium_target'), 'Irradiated Target'],
          ['tl', F('gtceu:transcurium_liquor'), 'Transcurium Liquor'],
          ['tf', mach('gtceu:transuranium_facility'), 'Transuranium Facility', 'ours', { desc: 'Separates berkelium and californium with HDEHP; the solvent is cleaned and reused.' }],
          ['cf', I('grindless:californium_252'), 'Californium-252'],
        ], 'the reactors that cannot start alone'),
        n('fp', 7.5, 1.5, F('gtceu:fission_product_liquor'), 'Fission Product Liquor', { kind: 'by', from: ['itt'], end: 'the synroc line, contained' }),
        n('bk', 15, -1.5, I('grindless:berkelium_249'), 'Berkelium-249', { kind: 'by', from: ['tf'], end: 'the next target' }),
        n('hdsol', 10, -1.5, F('gtceu:hdehp_solvent'), 'HDEHP Solvent', { kind: 'raw', sub: 'From the HDEHP line; cleaned and reused' }),
        // 2 U-233 driver fuel
        ...chain(3.5, [
          ['u233', I('gtceu:uranium_233_ingot'), 'Uranium-233', 'raw', { sub: 'Keep some for UHV' }],
          ['drv', I('grindless:hfir_driver_element'), 'HFIR Driver Element'],
          ['spent', I('grindless:spent_hfir_driver_element'), 'Spent Driver Element'],
          ['pyro', mach('gtceu:pyroprocessing_cell'), 'Pyroprocessing Cell', 'ours', { desc: 'Pulls the uranium-233 back out of the spent driver.' }],
          ['u233r', I('gtceu:uranium_233_ingot'), 'Uranium-233', 'ret', { sub: 'Into a fresh driver' }],
        ]),
        // 8 VUV fluoride optics: the comb the clock lab needs
        ...chain(7, [
          ['fl', I('gcyr:fluorite_dust'), 'Fluorite', 'raw'],
          ['cgf3', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours', { desc: 'Pulls a calcium fluoride boule from an iridium crucible that is reused.' }],
          ['vb', I('grindless:vuv_caf2_boule'), 'VUV CaF2 Boule'],
          ['vo', I('grindless:vuv_caf2_optic'), 'VUV Optic'],
          ['lab1', mach('gtceu:nuclear_clock_lab'), 'Nuclear Clock Lab', 'ours', { desc: 'Builds the frequency comb from two optics and a fibre laser.' }],
          ['comb', I('grindless:vuv_frequency_comb'), 'VUV Frequency Comb'],
        ]),
        n('flm', 10, 5, I('grindless:fibre_laser_module'), 'Fibre Laser Module', { kind: 'raw', sub: 'From the fibre draw', from: [] }),
        // 3 the nuclear clock
        ...chain(9, [
          ['u233c', I('gtceu:uranium_233_ingot'), 'Uranium-233', 'raw', { sub: 'The store keeps it: it only gives thorium' }],
          ['ds', mach('gtceu:transuranium_facility'), 'Transuranium Facility', 'ours', { desc: 'Its decay store holds the uranium-233 while thorium-229 grows in.' }],
          ['th229', I('grindless:thorium_229'), 'Thorium-229'],
          ['cgf2', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours', { desc: 'Grows thorium into calcium fluoride.' }],
          ['crys', I('grindless:thorium_caf2_crystal'), 'Th:CaF2 Crystal'],
          ['lab', mach('gtceu:nuclear_clock_lab'), 'Nuclear Clock Lab', 'ours', { desc: 'Pumps the nuclear transition with a VUV comb and locks a clock to it.' }],
          ['clock', I('grindless:nuclear_clock'), 'Nuclear Clock'],
        ], 'the warp gate, and the UHV SMES cell\'s link'),
        // 4 nickel-63 betavoltaics
        ...chain(11, [
          ['ni', I('gtceu:nickel_dust'), 'Nickel', 'raw'],
          ['n62', I('grindless:nickel_62_target'), 'Nickel-62 Target'],
          ['n63', I('grindless:nickel_63_target'), 'Nickel-63 Target'],
          ['pl', F('gtceu:nickel_63_plating_liquor'), 'Plating Liquor'],
          ['bfab', mach('gtceu:betavoltaic_fab'), 'Betavoltaic Fab', 'ours', { desc: 'Plates the diamond with nickel-63 and seals the cell.' }],
          ['bcell', I('grindless:betavoltaic_cell'), 'Betavoltaic Cell'],
        ], 'small, steady current for stations and probes'),
        n('dpl', 7.5, 12.5, F('gtceu:depleted_nickel_plating_liquor'), 'Depleted Liquor', { kind: 'ret', from: ['pl'], sub: 'Back to the plating bath' }),
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
        // 11 ultrapure water: the foundry drinks it in every recipe
        ...chain(-2, [
          ['w', F('minecraft:water'), 'Water', 'raw'],
          ['plant', mach('gtceu:ultrapure_water_plant'), 'Ultrapure Water Plant', 'ours', { desc: 'Reverse osmosis, deionisation, UV and ozone, degassing and ultrafiltration in one multiblock.' }],
          ['upw', F('gtceu:ultrapure_water'), 'Ultrapure Water'],
        ], undefined, 7.5),
        // the optical processor, the optical assembly and the wetware mainframe they end in
        n('opf', 14.5, 2, mach('gtceu:photonic_foundry'), 'Photonic Foundry', { kind: 'ours', from: ['mod', 'pcm', 'qcl', 'lnoi', 'upw'], desc: 'Bonds the dies, modulators and laser on an LNOI wafer.' }),
        n('oproc', 17, 2, I('gtnn:optical_processor'), 'Optical Processor', { kind: 'product', from: ['opf'] }),
        n('oaf', 19.5, 4, mach('gtceu:photonic_foundry'), 'Photonic Foundry', { kind: 'ours', from: ['oproc', 'qmc'], desc: 'Pairs two optical processors with two memory chips.' }),
        n('oasm', 22, 4, I('gtnn:optical_assembly'), 'Optical Assembly', { kind: 'product', from: ['oaf'] }),
        n('opr', 22, 7, I('grindless:organoid_processor'), 'Organoid Processor', { kind: 'raw', sub: 'Four of them; from the organoid line' }),
        n('sicr', 22, 9, I('grindless:sic_power_module'), 'SiC Power Module', { kind: 'raw', sub: 'From the silicon carbide line' }),
        n('oam', 24.5, 5.5, mach('gtceu:organoid_array'), 'Organoid Array', { kind: 'ours', from: ['oasm', 'opr', 'sicr'], desc: 'Wires four organoid processors to an optical assembly.' }),
        n('mf', 27, 5.5, I('gtceu:wetware_processor_mainframe'), 'Wetware Mainframe', { kind: 'product', from: ['oam'], end: 'every UHV machine' }),
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
    power: {
      name: 'Silicon carbide, solar arrays and the Swarm',
      nodes: [
        // 10 silicon carbide power
        ...chain(0, [
          ['sic', I('gtca:silicon_carbide_dust'), 'Silicon Carbide', 'raw'],
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
        ], undefined, 2.5),
        // 22 carbon-12 spreaders
        ...chain(5, [
          ['c12co', F('gtceu:carbon_12_monoxide'), 'Carbon-12 Monoxide', 'raw', { sub: 'From the isotope column' }],
          ['c12ch', F('gtceu:carbon_12_methane'), 'Carbon-12 Methane'],
          ['dlf', mach('gtceu:diamond_lattice_fab'), 'Diamond Lattice Fab', 'ours', { desc: 'Grows the diamond on a seed in carbon-12 methane.' }],
          ['c12', I('grindless:c12_diamond_spreader'), 'C-12 Diamond Spreader'],
        ], undefined, 5),
        // 30 oganesson propellant
        ...chain(7.5, [
          ['crude', F('gtceu:oganesson'), 'Crude Oganesson', 'raw', { sub: 'Off-gas of the Mk3 fusion ring' }],
          ['cry', mach('gtceu:cryogenic_plant'), 'Cryogenic Plant', 'ours', { desc: 'Cools the off-gas and splits the propellant from the krypton and xenon.' }],
          ['prop', F('gtceu:oganesson_propellant'), 'Oganesson Propellant'],
          ['thw', mach('gtceu:thruster_works'), 'Thruster Works', 'ours', { desc: 'Fills an empty tank with the propellant.' }],
          ['pod', I('grindless:oganesson_propellant_pod'), 'Propellant Pod'],
        ], undefined, 5),
        n('tank', 12.5, 9.5, I('grindless:propellant_tank'), 'Propellant Tank', { kind: 'raw', sub: 'The swarm station gives it back empty' }),
        // 23 swarm segments and their wear
        n('film3', 14.5, 2, I('grindless:aluminium_reflector_film'), 'Reflector Film', { kind: 'raw', sub: 'From Mercury\'s aluminium' }),
        n('flm2', 14.5, 3.5, I('grindless:fibre_laser_module'), 'Fibre Laser Module', { kind: 'raw', sub: 'From the fibre draw' }),
        n('bvc', 14.5, 5, I('grindless:betavoltaic_cell'), 'Betavoltaic Cell', { kind: 'raw', sub: 'Two of them; from the nickel-63 line' }),
        n('sf', 17, 3.5, mach('gtceu:swarm_segment_foundry'), 'Swarm Segment Foundry', { kind: 'ours', from: ['film3', 'arr', 'flm2', 'c12', 'smod', 'bvc'], desc: 'Builds a segment from films, arrays, a laser, a spreader, a power module and cells.' }),
        n('seg', 19.5, 3.5, I('grindless:swarm_segment'), 'Swarm Segment', { kind: 'product', from: ['sf'] }),
        n('scs', 19.5, 6, mach('gtceu:swarm_control_station'), 'Swarm Control Station', { kind: 'ours', from: ['seg', 'pod'], desc: 'Steers the segments round the Sun and beams the power home.' }),
        n('worn', 22, 6, I('grindless:worn_swarm_segment'), 'Worn Segment', { kind: 'product', from: ['scs'] }),
        n('refit', 24.5, 6, I('grindless:swarm_segment'), 'Refurbished Segment', { kind: 'ret', from: ['worn'], sub: 'The film and array go round again' }),
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
        // 14 chitosan scaffolds
        n('mush', 12, -2, I('grindless:xeno_mushroom'), 'Xeno Mushroom', { kind: 'product', from: ['gh'] }),
        n('xbp', 15.5, -2, mach('gtceu:xenobiochem_plant'), 'Xenobiochem Plant', { kind: 'ours', from: ['mush'], desc: 'Boils the mushrooms in lye and acid to chitosan and freeze-casts the scaffold.' }),
        n('chs', 18.5, -2, I('grindless:chitosan_scaffold'), 'Chitosan Scaffold', { kind: 'product', from: ['xbp'] }),
        // 32 far-red photosynthesis
        n('gen', 5, 2, I('grindless:xeno_genome_data'), 'Xeno Genome Data', { kind: 'product', from: ['srf'] }),
        n('cass', 7.5, 2, I('grindless:far_red_gene_cassette'), 'Far-Red Gene Cassette', { kind: 'product', from: ['gen'] }),
        n('algc', 10, 7, I('grindless:algae_culture'), 'Algae Culture', { kind: 'raw', sub: 'With agar, from the closed ecosystem' }),
        n('alg', 10, 5, I('grindless:engineered_far_red_algae'), 'Engineered Algae', { kind: 'product', from: ['cass', 'algc'] }),
        n('abr', 12.5, 5, mach('gtceu:algae_bioreactor'), 'Algae Bioreactor', { kind: 'ours', from: ['alg'], desc: 'Feeds the algae carbon dioxide and water in the red light.' }),
        n('biom', 15, 5, F('gtceu:biomass'), 'Biomass', { kind: 'product', role: 'resource', from: ['abr'], end: 'biorefinery fuel, and oxygen for the base\'s air' }),
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
          ['ring', I('gtceu:ruthenium_trinium_americium_neutronate_ingot'), 'RTAN Ingot'],
          ['rwire', I('gtceu:ruthenium_trinium_americium_neutronate_single_wire'), 'RTAN Wire'],
          ['nmw', mach('gtceu:naquadria_magnet_works'), 'Naquadria Magnet Works', 'ours', { desc: 'Winds the UHV cell with RTAN wire and UV cells.' }],
          ['cell', I('grindless:uhv_smes_cell'), 'UHV SMES Cell'],
        ], 'the wireless network'),
        n('ir', 7.5, 1.5, I('gtceu:iridium_dust'), 'Iridium', { kind: 'by', from: ['pp'], end: 'the iridium crucible' }),
        n('tail', 5, -1.5, I('grindless:leached_tailings'), 'Leached Tailings', { kind: 'by', from: ['heap'], end: 'biocement, and EV\'s regolith cell' }),
        n('uvc', 22.5, 1.75, I('grindless:uv_smes_cell'), 'UV SMES Cell', { kind: 'raw', sub: 'Four of them, with RTAN wire' }),
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
      name: 'Mercury: regolith, reflector film and MgB2',
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
        // 20 MgB2 links
        ...chain(3, [
          ['mg', I('gtceu:magnesium_dust'), 'Magnesium', 'raw', { sub: 'With boron' }],
          ['mgb2', I('gtceu:magnesium_diboride_dust'), 'MgB2 Powder'],
          ['pit', mach('gtceu:powder_in_tube_line'), 'Powder-in-Tube Line', 'ours', { desc: 'Packs the powder in an iron tube and draws it to wire.' }],
          ['wire', I('gtceu:magnesium_diboride_single_wire'), 'MgB2 Wire', 'product'],
        ], 'cables and the field generators'),
      ],
    },
    materials: {
      name: 'PBO, HDEHP and ultra-high-temperature ceramics',
      nodes: [
        // 24 PBO fibre
        ...chain(0, [
          ['bnz', F('gtceu:benzene'), 'Benzene', 'raw', { sub: 'The HV reformer\'s; chlorinated in a chemical reactor' }],
          ['tcb', F('gtceu:trichlorobenzene'), 'Trichlorobenzene'],
          ['dnt', F('gtceu:dinitrotrichlorobenzene'), 'Dinitrotrichlorobenzene'],
          ['cdr', I('gtceu:chlorodinitroresorcinol_dust'), 'Chlorodinitroresorcinol'],
          ['bz', I('gtceu:diaminoresorcinol_dust'), 'Diaminoresorcinol', 'product', { sub: 'With terephthalic acid' }],
          ['dope', F('gtceu:pbo_dope'), 'PBO Dope'],
          ['pbop', mach('gtceu:pbo_plant'), 'PBO Plant', 'ours', { desc: 'Spins the dope in polyphosphoric acid, which is recycled.' }],
          ['fib', I('grindless:pbo_fibre'), 'PBO Fibre', 'product'],
        ], 'the tether ribbon'),
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
        ], 'the probe stages'),
        n('pellet', 10, 9, I('grindless:ican_pellet'), 'ICAN Pellet', { kind: 'raw', sub: 'From the antimatter store' }),
        n('sicm', 10, 7.5, I('grindless:sic_power_module'), 'SiC Power Module', { kind: 'raw', sub: 'Two; from the silicon carbide line' }),
        n('geo', 12.5, 7, I('grindless:geo_assembled_stage'), 'Geo-Assembled Stage', { kind: 'raw', sub: 'Lifted by the space elevator' }),
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
take('isotopes', 'tf', 'hdsol');
take('photonics', 'pf', 'lnoi');
take('life', 'oa', 'chs');
take('life', 'comp', 'chs');
take('life', 'pbc', 'bcr');
take('antimatter', 'gate', 'ah', 'clk', 'opg');
take('ground', 'nmw', 'uvc');
take('power', 'thw', 'tank');
take('materials', 'thk', 'pellet', 'sicm', 'geo');
export default data;
