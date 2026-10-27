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

export default {
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
          ['cf', I('grindless:californium_252_source'), 'Californium-252 Source'],
        ], 'the reactors that cannot start alone'),
        n('fp', 15, 1.5, F('gtceu:fission_product_liquor'), 'Fission Product Liquor', { kind: 'by', from: ['tf'], end: 'the synroc line, contained' }),
        n('bk', 15, -1.5, I('grindless:berkelium_249'), 'Berkelium-249', { kind: 'by', from: ['tf'], end: 'the next target' }),
        // 2 U-233 driver fuel
        ...chain(3.5, [
          ['u233', I('gtceu:uranium_233_ingot'), 'Uranium-233', 'raw', { sub: 'Keep some for UHV' }],
          ['drv', I('grindless:hfir_driver_element'), 'HFIR Driver Element'],
          ['spent', I('grindless:spent_hfir_driver_element'), 'Spent Driver Element'],
          ['pyro', mach('gtceu:pyroprocessing_cell'), 'Pyroprocessing Cell', 'ours', { desc: 'Pulls the uranium-233 back out of the spent driver.' }],
          ['u233r', I('gtceu:uranium_233_ingot'), 'Uranium-233', 'ret', { sub: 'Into a fresh driver' }],
        ]),
        // 3 the nuclear clock
        ...chain(5.5, [
          ['th229', I('grindless:thorium_229'), 'Thorium-229', 'raw', { sub: 'Decayed out of the U-233 store' }],
          ['crys', I('grindless:thorium_caf2_crystal'), 'Th:CaF2 Crystal'],
          ['lab', mach('gtceu:nuclear_clock_lab'), 'Nuclear Clock Lab', 'ours', { desc: 'Pumps the nuclear transition with a VUV comb and locks a clock to it.' }],
          ['clock', I('grindless:nuclear_clock'), 'Nuclear Clock'],
        ], 'the UHV SMES cell\'s link'),
        // 4 nickel-63 betavoltaics
        ...chain(7.5, [
          ['ni', I('gtceu:nickel_dust'), 'Nickel', 'raw'],
          ['n62', I('grindless:nickel_62_target'), 'Nickel-62 Target'],
          ['n63', I('grindless:nickel_63_target'), 'Nickel-63 Target'],
          ['pl', F('gtceu:nickel_63_plating_liquor'), 'Plating Liquor'],
          ['bfab', mach('gtceu:betavoltaic_fab'), 'Betavoltaic Fab', 'ours', { desc: 'Plates the diamond with nickel-63 and seals the cell.' }],
          ['bcell', I('grindless:betavoltaic_cell'), 'Betavoltaic Cell'],
        ], 'small, steady current for stations and probes'),
        n('dpl', 7.5, 9, F('gtceu:depleted_nickel_plating_liquor'), 'Depleted Liquor', { kind: 'ret', from: ['pl'], sub: 'Back to the plating bath' }),
      ],
    },
    photonics: {
      name: 'Lithium niobate, phase change and memory',
      nodes: [
        // 5 lithium niobate photonics
        ...chain(0, [
          ['li', I('gtceu:lithium_dust'), 'Lithium', 'raw', { sub: 'From Mars lithium carbonate' }],
          ['lnb', I('grindless:lithium_niobate_boule'), 'LN Boule'],
          ['lnw', I('grindless:lithium_niobate_wafer'), 'LN Wafer'],
          ['lnoi', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
          ['mod', I('grindless:thin_film_ln_modulator'), 'Thin-Film Modulator'],
        ], 'the optical processor'),
        // 6 phase change memory
        ...chain(2, [
          ['ge', I('gtceu:germanium_dust'), 'Germanium', 'raw', { sub: 'With antimony and tellurium' }],
          ['gst', I('grindless:gst_target'), 'GST Target'],
          ['pf', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours', { desc: 'Sputters the chalcogenide film and patterns the die.' }],
          ['pcm', I('grindless:pcm_photonic_die'), 'PCM Photonic Die'],
        ], 'the optical processor'),
        n('sgst', 7.5, 3.5, I('grindless:spent_gst_target'), 'Spent GST Target', { kind: 'ret', from: ['pf'], sub: 'Remelted into a fresh target' }),
        // 7 quantum memory
        ...chain(5, [
          ['eu', I('gtceu:europium_dust'), 'Europium', 'raw', { sub: 'With yttrium oxide and silica' }],
          ['yso', I('grindless:eu_yso_boule'), 'Eu:YSO Boule'],
          ['cgf', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours', { desc: 'Pulls the boule from an iridium crucible that is reused.' }],
          ['qmc', I('grindless:quantum_memory_chip'), 'Quantum Memory Chip'],
        ], 'the optical processor'),
      ],
    },
    optics: {
      name: 'Vacuum ultraviolet, cascade lasers and ZBLAN',
      nodes: [
        // 8 VUV fluoride optics
        ...chain(0, [
          ['fl', I('gtceu:fluorite_dust'), 'Fluorite', 'raw'],
          ['vb', I('grindless:vuv_caf2_boule'), 'VUV CaF2 Boule'],
          ['vo', I('grindless:vuv_caf2_optic'), 'VUV Optic'],
          ['comb', I('grindless:vuv_frequency_comb'), 'VUV Frequency Comb'],
        ], 'the nuclear clock lab'),
        // 9 quantum cascade lasers
        ...chain(2, [
          ['in', I('gtceu:indium_dust'), 'Indium', 'raw', { sub: 'With phosphorus' }],
          ['inpb', I('grindless:inp_boule'), 'InP Boule'],
          ['inpw', I('grindless:inp_wafer'), 'InP Wafer'],
          ['mbe', mach('gtceu:mbe_reactor'), 'MBE Reactor', 'ours', { desc: 'Grows the superlattice one atomic layer at a time.' }],
          ['qcl', I('grindless:quantum_cascade_laser'), 'Quantum Cascade Laser'],
        ], 'the baseline astrometer'),
        n('ars', 7.5, 3.5, F('gtceu:arsenic_trioxide'), 'Arsenic', { kind: 'by', from: ['mbe'], end: 'contained: never vented' }),
        // 31 ZBLAN
        ...chain(5, [
          ['zf', F('gtceu:zirconium_tetrafluoride'), 'Zirconium Tetrafluoride', 'raw'],
          ['pre', I('grindless:zblan_preform'), 'ZBLAN Preform'],
          ['draw', mach('gtceu:zblan_draw_tower'), 'ZBLAN Draw Tower', 'ours', { desc: 'Pulls fibre in microgravity, where the glass does not crystallise.' }],
          ['zbf', I('grindless:zblan_fibre'), 'ZBLAN Fibre'],
        ], 'fibre lasers and the cable of the next tier'),
      ],
    },
    power: {
      name: 'Silicon carbide, water and solar arrays',
      nodes: [
        // 10 silicon carbide power
        ...chain(0, [
          ['sic', I('gtceu:silicon_carbide_dust'), 'Silicon Carbide', 'raw'],
          ['boule', I('grindless:sic_boule'), 'SiC Boule'],
          ['wafer', I('grindless:sic_wafer'), 'SiC Wafer'],
          ['epi', I('grindless:sic_epi_wafer'), 'Epi Wafer'],
          ['imp', I('grindless:implanted_sic_wafer'), 'Implanted Wafer'],
          ['dev', I('grindless:sic_device_wafer'), 'Device Wafer'],
          ['smod', I('grindless:sic_power_module'), 'SiC Power Module'],
        ], 'the power hatches and the wireless cell'),
        // 11 ultrapure water
        ...chain(2, [
          ['w', F('minecraft:water'), 'Water', 'raw'],
          ['plant', mach('gtceu:ultrapure_water_plant'), 'Ultrapure Water Plant', 'ours', { desc: 'Reverse osmosis, deionisation, UV and ozone, degassing and ultrafiltration in one multiblock.' }],
          ['upw', F('gtceu:ultrapure_water'), 'Ultrapure Water'],
        ], 'the fabs'),
        n('ro', 5, 3.5, F('minecraft:water'), 'RO Concentrate', { kind: 'by', from: ['plant'], end: 'voided: it is only salty water' }),
        // 21 space photovoltaics
        ...chain(5, [
          ['ga', I('gtceu:gallium_dust'), 'Gallium', 'raw', { sub: 'With indium, arsenic and phosphorus' }],
          ['iepi', I('grindless:imm_epi_wafer'), 'IMM Epi Wafer'],
          ['ifilm', I('grindless:imm_film'), 'IMM Film'],
          ['arr', I('grindless:imm_solar_array'), 'IMM Solar Array', 'product', { sub: 'With a cerium coverglass' }],
          ['pseg', I('grindless:swarm_segment'), 'Swarm Segment'],
        ], 'the swarm control station'),
        // 22 carbon-12 spreaders
        ...chain(7, [
          ['c12co', F('gtceu:carbon_12_monoxide'), 'Carbon-12 Monoxide', 'raw', { sub: 'From the isotope column' }],
          ['c12ch', F('gtceu:carbon_12_methane'), 'Carbon-12 Methane'],
          ['c12', I('grindless:c12_diamond_spreader'), 'C-12 Diamond Spreader'],
        ], 'the stations\' heat spreaders'),
      ],
    },
    life: {
      name: 'Organoids, xeno-biochemistry and far-red algae',
      nodes: [
        // 12 organoid processors
        ...chain(0, [
          ['med', F('gtceu:sterilised_growth_medium'), 'Sterilised Medium', 'raw'],
          ['oa', mach('gtceu:organoid_array'), 'Organoid Array', 'ours', { desc: 'Grows cortical organoids on a chitosan scaffold and mounts them on an electrode array.' }],
          ['op', I('grindless:organoid_processor'), 'Organoid Processor'],
        ], 'four make a wetware mainframe'),
        // 13 xeno radioprotectant
        ...chain(2, [
          ['flora', I('grindless:proxima_flora_sample'), 'Proxima Flora Sample', 'raw'],
          ['strain', I('grindless:characterised_xeno_strain'), 'Characterised Strain'],
          ['gh', mach('gtceu:xenobotany_greenhouse'), 'Xenobotany Greenhouse', 'ours', { desc: 'Grows the strain under a red lamp.' }],
          ['bio', I('grindless:xeno_biomass'), 'Xeno Biomass'],
          ['lys', F('gtceu:clarified_xeno_lysate'), 'Clarified Lysate'],
          ['rad', I('grindless:xeno_radioprotectant'), 'Xeno Radioprotectant'],
        ], 'organoid and mainframe housings'),
        // 14 chitosan scaffolds
        ...chain(4, [
          ['mush', I('grindless:xeno_mushroom'), 'Xeno Mushroom', 'raw'],
          ['chs', I('grindless:chitosan_scaffold'), 'Chitosan Scaffold'],
        ], 'the organoid array'),
        // 15 melanin flare shielding
        ...chain(6, [
          ['clado', I('grindless:cladosporium_culture'), 'Cladosporium Culture', 'raw'],
          ['vat', mach('gtceu:radiotrophic_vat'), 'Radiotrophic Vat', 'ours', { desc: 'Grows black fungi that eat radiation.' }],
          ['melb', I('grindless:melanised_biomass'), 'Melanised Biomass'],
          ['mel', I('grindless:melanin_extract'), 'Melanin Extract'],
          ['comp', I('grindless:melanin_chitosan_composite'), 'Melanin-Chitosan Composite'],
          ['panel', I('grindless:flare_shield_panel'), 'Flare Shield Panel'],
          ['pbc', I('grindless:proxima_base_casing'), 'Proxima Base Casing'],
        ], 'the base on Proxima b'),
        // 32 far-red photosynthesis
        ...chain(8, [
          ['gen', I('grindless:xeno_genome_data'), 'Xeno Genome Data', 'raw'],
          ['cass', I('grindless:far_red_gene_cassette'), 'Far-Red Gene Cassette'],
          ['alg', I('grindless:engineered_far_red_algae'), 'Engineered Algae'],
        ], 'biorefinery fuel, and oxygen for the base\'s air'),
      ],
    },
    ground: {
      name: 'Proxima b ground: biomining, biocement and ice',
      nodes: [
        // 16 biomining
        ...chain(0, [
          ['cold', I('grindless:cold_trap_regolith'), 'Cold-Trap Regolith', 'raw'],
          ['heap', mach('gtceu:biomining_heap'), 'Biomining Heap', 'ours', { desc: 'Bacteria leach the metals out: no cyanide.' }],
          ['pgm', F('gtceu:proxima_pgm_liquor'), 'PGM Liquor'],
          ['pp', mach('gtceu:platinum_plant'), 'Platinum Plant', 'ours', { desc: 'Turns the liquor into salts, then ruthenium and iridium.' }],
        ], 'RTAN and the iridium crucible'),
        n('tail', 5, 1.5, I('grindless:leached_tailings'), 'Leached Tailings', { kind: 'by', from: ['heap'], end: 'biocement, and EV\'s regolith cell' }),
        // 17 biocement
        ...chain(3.5, [
          ['lt', I('grindless:leached_tailings'), 'Leached Tailings', 'raw'],
          ['sp', I('grindless:sporosarcina_culture'), 'Sporosarcina Culture'],
          ['bcr', I('grindless:biocemented_regolith'), 'Biocemented Regolith'],
        ], 'the site casing'),
        // 18 ices
        ...chain(7, [
          ['core', I('grindless:proxima_ice_core'), 'Ice Core', 'raw'],
          ['dw', F('gtceu:deuterium_enriched_water'), 'Deuterium-Rich Water'],
          ['d2', F('gtceu:deuterium'), 'Deuterium'],
        ], 'UV\'s muon fusion cell'),
      ],
    },
    mercury: {
      name: 'Mercury: regolith, mirrors and the Swarm',
      nodes: [
        // 19 regolith fractions
        ...chain(0, [
          ['reg', I('grindless:mercury_regolith'), 'Mercury Regolith', 'raw'],
          ['svf', mach('gtceu:solar_vapour_furnace'), 'Solar Vapour Furnace', 'ours', { desc: 'Sunlight on regolith: low heat first, then high.' }],
          ['strip', I('grindless:stripped_mercury_regolith'), 'Stripped Regolith'],
          ['ac', I('grindless:alumina_calcia_residue'), 'Alumina-Calcia'],
          ['film', I('grindless:aluminium_reflector_film'), 'Reflector Film'],
        ], 'swarm segments'),
        // 23 swarm segments and their wear
        ...chain(2, [
          ['film2', I('grindless:aluminium_reflector_film'), 'Reflector Film', 'raw'],
          ['sf', mach('gtceu:swarm_segment_foundry'), 'Swarm Segment Foundry', 'ours', { desc: 'Builds a segment from a film, an array and a controller.' }],
          ['seg', I('grindless:swarm_segment'), 'Swarm Segment'],
          ['scs', mach('gtceu:swarm_control_station'), 'Swarm Control Station', 'ours', { desc: 'Steers the segments round the Sun and beams the power home.' }],
          ['worn', I('grindless:worn_swarm_segment'), 'Worn Segment'],
        ]),
        n('refit', 12.5, 3.5, I('grindless:aluminium_reflector_film'), 'Stripped Film', { kind: 'ret', from: ['worn'], sub: 'Refurbished: the aluminium goes round again' }),
        // 20 MgB2 links
        ...chain(5, [
          ['mg', I('gtceu:magnesium_dust'), 'Magnesium', 'raw', { sub: 'With boron' }],
          ['mgb2', I('gtceu:magnesium_diboride_dust'), 'MgB2 Powder'],
          ['wire', I('gtceu:magnesium_diboride_single_wire'), 'MgB2 Wire'],
          ['cable', I('gtceu:magnesium_diboride_single_cable'), 'MgB2 Cable'],
        ], 'the gate ring and the swarm station'),
        // 30 oganesson propellant
        ...chain(7, [
          ['crude', F('gtceu:oganesson_propellant'), 'Crude Oganesson', 'raw', { sub: 'Off-gas of the Mk3 fusion ring' }],
          ['pod', I('grindless:oganesson_propellant_pod'), 'Propellant Pod'],
        ], 'the swarm control station, and the ICAN motor'),
      ],
    },
    materials: {
      name: 'PBO, HDEHP and ultra-high-temperature ceramics',
      nodes: [
        // 24 PBO fibre
        ...chain(0, [
          ['bz', F('gtceu:benzene'), 'Benzene', 'raw', { sub: 'With chlorine' }],
          ['dope', F('gtceu:pbo_dope'), 'PBO Dope'],
          ['pbop', mach('gtceu:pbo_plant'), 'PBO Plant', 'ours', { desc: 'Spins the dope in polyphosphoric acid, which is recycled.' }],
          ['fib', I('grindless:pbo_fibre'), 'PBO Fibre'],
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
          ['zr', I('gtceu:zirconia_dust'), 'Zirconia', 'raw', { sub: 'With boron carbide' }],
          ['zrb2', I('gtceu:zirconium_diboride_dust'), 'ZrB2 Powder'],
          ['sps', mach('gtceu:spark_plasma_sinterer'), 'Spark Plasma Sinterer', 'ours', { desc: 'Presses the blend to a tile in seconds.' }],
          ['tile', I('grindless:uhtc_tile'), 'UHTC Tile'],
          ['noz', I('grindless:uhtc_nozzle'), 'UHTC Nozzle'],
          ['ican', I('grindless:ican_rocket_motor'), 'ICAN Rocket Motor'],
        ], 'the probe stages'),
      ],
    },
    antimatter: {
      name: 'Positrons, the Casimir array and RTAN',
      nodes: [
        // 27 positrons to antihydrogen
        ...chain(0, [
          ['mgt', I('grindless:magnesium_target'), 'Magnesium Target', 'raw'],
          ['na22', I('grindless:sodium_22_target'), 'Sodium-22 Target'],
          ['src', I('grindless:moderated_positron_source'), 'Moderated Source'],
          ['acc', mach('gtceu:positron_accumulator'), 'Positron Accumulator', 'ours', { desc: 'Traps the positrons in a Surko trap.' }],
          ['pos', I('grindless:positron_cartridge'), 'Positron Cartridge'],
          ['ah', I('grindless:antihydrogen_cartridge'), 'Antihydrogen Cartridge'],
        ], 'the warp gate'),
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
        // 29 RTAN superconductor
        ...chain(5, [
          ['ru', I('gtceu:ruthenium_dust'), 'Ruthenium', 'raw', { sub: 'From Proxima\'s biomining' }],
          ['nmw', mach('gtceu:naquadria_magnet_works'), 'Naquadria Magnet Works', 'ours', { desc: 'Winds the UHV cell with RTAN wire and UV cells.' }],
          ['cell', I('grindless:uhv_smes_cell'), 'UHV SMES Cell'],
        ], 'the wireless network'),
      ],
    },
  },
};
