// Quest data for maxplus_integration ("MAX+: Integration"): what the older machines become at MAX+ scale, the power chain from nickel-56 and
// fusion to the wireless network, and the AE2 lesson for storage, crafting and patterns (docs/eras/maxplus.md, "Older machines",
// "Power", "AE2").
// Every row starts at an I_L_* link to a stage quest; the age chapters do not link back.
// The parallel hatch (PAR) teaches scale at the machine level. The Hyperfactory and the circuits are in XP-C2b's chapters.
// Positions and dependencies: layout.mjs.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  filename: 'maxplus_integration',
  era: 'maxplus',
  role: 'integration',
  order: 5,
  icon: 'gtceu:max_wireless_dynamo_hatch_16a',
  autofocus: 'OM_SHELL',
  section: SECTIONS.integration,
  title: 'MAX+: Integration',
  subtitle: ['Older machines at MAX+ scale, power from nickel-56 and fusion, and the grid that holds the plan.'],
};

export const LINKS = [
  { key: 'I_L_OM1', ref: 'START', x: 0, y: 0 },
  { key: 'I_L_OM2', ref: 'LMC', x: 0, y: 3 },
  { key: 'I_L_OM3', ref: 'START', x: 0, y: 6 },
  { key: 'I_L_PWR1', ref: 'CASK', x: 0, y: 9 },
  { key: 'I_L_PWR2', ref: 'PD', x: 0, y: 12 },
  { key: 'I_L_AE2', ref: 'SCALE', x: 0, y: 15 },
  { key: 'I_L_PAR', ref: 'SCALE', x: 0, y: 18 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ older machines at the shell
  {
    key: 'OM_SHELL', kind: 'machine', title: 'The Shell and Its Tenants', icon: 'gtceu:mirror_shell',
    deps: ['START'], x: 2.5, y: 2,
    teach: {
      for: 'The &6Mirror Shell&r is the one place the horizon is tapped; the old c4 row sits in its shadow and feeds it.',
      needs: 'The shell and the c4 machines of the hole row.',
      unlocks: 'Everything bound in stage I.',
      automate: 'One lane per machine, all ending at the shell.',
    },
    desc: [],
    tasks: [it('gtceu:mirror_shell'), ck()],
    rewards: [xp(100)],
  },
  {
    key: 'OM_OPV', kind: 'machine', title: 'The Hole Row: Forges and Vaults', icon: 'gtceu:kugelblitz_forge',
    deps: ['OM_SHELL'], x: 4, y: 2,
    teach: {
      for: 'The Kugelblitz forge, strangelet vault, debris harvester and replication refinery were the last of the hole row. At this scale they feed packets, strange matter, debris and copies.',
      needs: 'The four controllers.',
      unlocks: 'Packets, kerr strange alloy, and the probe\'s parts.',
      automate: 'Packets are the busiest lane; give them a belt of their own.',
    },
    desc: [],
    tasks: [it('gtceu:kugelblitz_forge'), it('gtceu:strangelet_vault'), it('gtceu:debris_harvester'), it('gtceu:replication_refinery')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_OPV2', kind: 'machine', title: 'The Hole Row: Beams and Pairs', icon: 'gtceu:jet_beam_line',
    deps: ['OM_OPV'], x: 4, y: 3.5,
    teach: {
      for: 'The jet beam line, gamma optics works and magnetic pair converter shape the light and matter the shell needs.',
      needs: 'The three controllers.',
      unlocks: 'Probe navigation parts, and the stage\'s antimatter side.',
      automate: 'Pairs leave by pipe, light by beam; do not mix the lanes.',
    },
    desc: [],
    tasks: [it('gtceu:jet_beam_line'), it('gtceu:gamma_optics_works'), it('gtceu:magnetic_pair_converter')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_DOR', kind: 'machine', title: 'The Plasma Pair', icon: 'gtceu:plasma_mass_filter',
    deps: ['LMC'], x: 17, y: 0,
    teach: {
          for: 'The plasma mass filter and the FRC former turn the lift\'s raw plasma into confined plasma, the same way at this scale as before. Neither is tied to a place: only the lift is.',
          needs: 'Both controllers, anywhere you like.',
      unlocks: 'Nickel-56 and every plasma line after it.',
      automate: 'The filter\'s waste leaves in its own pipe.',
    },
    desc: [],
    tasks: [it('gtceu:plasma_mass_filter'), it('gtceu:frc_former')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ home rows
  {
    key: 'OM_UXV', kind: 'machine', title: 'Home Rows: UXV', icon: 'gtceu:pasta_phase_sorter',
    deps: ['START'], x: 1, y: 1.5,
    teach: {
      for: 'The UXV controllers at home, and the MAX+ row each one takes:       the Spintronic Cluster Tool makes coated tapes, x-ray mirrors and the logic and storage dies; the stellar elevator loads the ribbon of the deep horizon tether. The Pasta Mill and the shequid works join those lines.',
            needs: 'All four controllers: Pasta Mill, Spintronic Cluster Tool, shequid works and stellar elevator.',
      unlocks: 'The ribbon, tether and conduit lines of stage II.',
      automate: 'They share one hub; lay it out once.',
    },
    desc: [],
    tasks: [it('gtceu:pasta_phase_sorter'), it('gtceu:mtj_sputter_cluster'), it('gtceu:shequid_works'), it('gtceu:stellar_elevator')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_UIV', kind: 'machine', title: 'Home Rows: UIV', icon: 'gtceu:levitation_melter',
    deps: ['OM_UXV'], x: 1, y: 3,
    teach: {
      for: 'The UIV controllers at home, and the MAX+ row each one takes: the millikelvin cryostat chills the waveguide, resonance chamber, field cell and core crystal; the femtosecond writer inscribes crystals and interposer waveguides; the BEUV scanner patterns wafers for the chevron cores and the controller crystal; the TFLN fab makes the modulator chips; the levitation melter melts the strange alloy; the spectral hole burner burns the store block.',
      needs: 'All seven controllers: Neutron Drip Works, levitation melter, TFLN fab, femtosecond writer, BEUV scanner, mK cryostat and spectral hole burner.',
      unlocks: 'Lattices, waveguides, and the stage\'s precise parts.',
      automate: 'The cryostat wants the cold plant next to it.',
    },
    desc: [],
    tasks: [it('gtceu:neutronium_cage'), it('gtceu:levitation_melter'), it('gtceu:tfln_fab'), it('gtceu:femtosecond_writer'), it('gtceu:beuv_scanner'), it('gtceu:millikelvin_cryostat_works'), it('gtceu:spectral_hole_burner')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_UEV', kind: 'machine', title: 'Home Rows: UEV', icon: 'gtceu:calutron',
    deps: ['OM_UIV'], x: 1.5, y: 4.5,
    teach: {
      for: 'The UEV controllers at home, and the MAX+ row each one takes: the calutron makes the silicon-28 feed of the logic die, the stellar forge makes the plasma of the crystal slurry, the CVI furnace makes waveguide tubes and chamber flanges, the nitride magnet works braces the SMES toroid and the SNSPD foundry makes the phase sensor die.',
      needs: 'All eight controllers: megabar press, degenerate harvester, calutron, CVI furnace, single-crystal foundry, nitride magnet works, SNSPD foundry and stellar forge.',
      unlocks: 'The calutron\'s isotopes, which both stages ask for.',
      automate: 'The calutron is the slow one; build several.',
    },
    desc: [],
    tasks: [it('gtceu:megabar_press'), it('gtceu:degenerate_harvester'), it('gtceu:calutron'), it('gtceu:cvi_furnace'), it('gtceu:single_crystal_foundry'), it('gtceu:nitride_magnet_works'), it('gtceu:snspd_foundry'), it('gtceu:stellar_forge')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_UHV', kind: 'machine', title: 'Home Rows: UHV and UV', icon: 'gtceu:superfluid_helium_plant',
    deps: ['OM_UEV'], x: 3, y: 5,
    teach: {
      for: 'The UHV and UV controllers at home, and the MAX+ row each one takes: the crystal growth furnace grows seed plates and boules, the photonic foundry makes the frequency divider and the photonic engine, the MBE reactor grows the piezo layer, the MOCVD reactor the laser arrays, the SRF works the resonance cells and cavities, and the ribbon works draws the tether ribbon.',
      needs: 'All ten controllers: PBO plant, crystal growth furnace, photonic foundry, MBE reactor, ribbon works, helium plant, SRF works, zone tower, MOCVD and fibre tower.',
      unlocks: 'The superfluid helium and fibres that the stream and the dark both ask for.',
      automate: 'Helium returns by the same pipe that fed it.',
    },
    desc: [],
    tasks: [it('gtceu:pbo_plant'), it('gtceu:crystal_growth_furnace'), it('gtceu:photonic_foundry'), it('gtceu:mbe_reactor'), it('gtceu:tether_ribbon_works'), it('gtceu:superfluid_helium_plant'), it('gtceu:srf_cavity_works'), it('gtceu:zone_refining_tower'), it('gtceu:mocvd_reactor'), it('gtceu:fibre_draw_tower')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_OLD', kind: 'machine', title: 'Home Rows: ZPM Down to EV', icon: 'gtceu:hts_magnet_works',
    deps: ['OM_UHV'], x: 4.5, y: 5,
    teach: {
      for: 'The older rows still make parts MAX+ needs: the diamond lattice fab makes the photonic plate, the HTS magnet works winds the SMES toroid and the fault-current coil, the coated conductor line draws tapes, and the helium refrigerator chills toroids, coils and conduits. The implanter, aerogel works, hot cell, rare earth extraction cascade, cryogenic plant and hot strip mill take smaller parts.',
      needs: 'The ten controllers: diamond fab, implanter, aerogel works, coated conductor line, HTS magnet works, helium refrigerator, hot cell, rare earth extraction cascade, cryogenic plant and hot strip mill.',
      unlocks: 'Conductors, aerogel, and a cold chain for the stage.',
      automate: 'Give each its own chest on the network.',
    },
    desc: [],
    tasks: [it('gtceu:diamond_lattice_fab'), it('gtceu:ion_implanter'), it('gtceu:aerogel_works'), it('gtceu:coated_conductor_line'), it('gtceu:hts_magnet_works'), it('gtceu:helium_refrigerator'), it('gtceu:hot_cell'), it('gtceu:extraction_cascade'), it('gtceu:cryogenic_plant'), it('gtceu:hot_strip_mill')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ power
  {
    key: 'PW_NI', kind: 'plant', title: 'Power from Nickel-56', icon: 'grindless:co56_cask',
    deps: ['CASK'], x: 24.5, y: -8.5,
    teach: {
      for: 'The burner takes a shielded nickel-56 cask and returns a cobalt-56 cask, then burns that again into a spent iron-56 cask. Each decay is heat, and the heat becomes EU wherever the burner stands: it is not tied to the Tarantula.',
      needs: 'Casks from the crucible, and a dynamo hatch on the burner.',
      unlocks: 'The era\'s first power plant, and the way to send its power to the network.',
      automate: 'Casks move by belt; run the cobalt casks through a second time before they go to the hot cell.',
    },
    desc: [],
    tasks: [it('grindless:co56_cask')],
    rewards: [xp(150)],
  },
  {
    key: 'PW_TORUS', kind: 'plant', title: 'Power from Fusion Fuel', icon: 'gtceu:helium_4_ash_bucket',
    deps: ['PD'], x: 24.5, y: -6,
    teach: {
      for: 'Primordial deuterium and pristine helium-3 burn in the torus, and the converter stack turns their charged products straight into EU. The torus runs only in the Stream, where its fuel comes from.',
      needs: 'Both fuels in bulk, and a formed torus with its injector and stack.',
      unlocks: 'A second source for the network.',
      automate: 'The fuels travel in separate pipes. The helium-4 ash and the hydrogen that come out go home to the gas lines.',
    },
    desc: [],
    tasks: [it('gtceu:helium_4_ash_bucket')],
    rewards: [xp(150)],
  },
  {
    key: 'PW_DYN', kind: 'machine', title: 'Wireless Dynamo', icon: 'gtceu:max_wireless_dynamo_hatch_16a',
    deps: ['PW_NI', 'PW_TORUS'], x: 28, y: -8.5,
    teach: {
      for: 'A wireless dynamo hatch feeds the network from each plant, wherever it stands. A fraction is lost on the way, so build more than you need.',
      needs: 'A MAX wireless dynamo hatch on every plant.',
      unlocks: 'The network at home.',
      automate: 'Power flows without a cable, but not without cost.',
    },
    desc: [],
    tasks: [it('gtceu:max_wireless_dynamo_hatch_16a')],
    rewards: [xp(150)],
  },
  {
    key: 'PW_STORE', kind: 'machine', title: 'A Store That Holds It', icon: 'grindless:max_smes_cell',
    deps: ['PW_DYN'], x: 29.5, y: -8.5,
    teach: {
      for: 'Wireless energy hatches draw from the network, and a MAX+ store smooths out the dips between plants.',
      needs: 'The 4096-amp and 1024-amp wireless hatches, the MAX+ hatch and an SMES cell.',
      unlocks: 'Steady power for the machines that never stop.',
      automate: 'Size the store for the longest outage of the weakest plant.',
    },
    desc: [],
    tasks: [it('gtceu:max_wireless_energy_hatch_4096a'), it('gtceu:max_wireless_energy_hatch_1024a'), it('gtceu:max_maxplus_energy_hatch_1024a'), it('grindless:max_smes_cell')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ AE2
  {
    key: 'AE_A1', kind: 'process', title: '256M Storage', icon: 'megacells:item_storage_cell_256m',
    deps: ['SCALE'], x: 40, y: 1,
    teach: {
      for: 'The 256M cell component and a horizon storage die make cells that hold the stage\'s item and fluid counts.',
      needs: 'The &6Horizon Storage Die&r from the Circuits section, and the 256M component.',
      unlocks: 'Storage that does not run out at a million of anything.',
      automate: 'One cell type per network; fluids get their own.',
    },
    desc: [],
    tasks: [it('megacells:cell_component_256m'), it('megacells:item_storage_cell_256m'), it('megacells:fluid_storage_cell_256m'), it('grindless:horizon_storage_die')],
    rewards: [xp(150)],
  },
  {
    key: 'AE_LASER', kind: 'wafer', title: 'Laser Array Wafer', icon: 'grindless:laser_array_wafer',
    deps: ['AE_A1'], x: 38, y: 4.5,
    teach: {
      for: 'A wafer of grown laser emitters is the light source of the &6Photonic Coprocessor&r, and of the creative cores of the last stage. The &6Laser Array Wafer&r is made two at a time.',
      needs: 'The MOCVD reactor with a circuit of the last tier, and the gallium, indium and arsenic feed it grows from. It draws MAX+ power.',
      unlocks: 'The photonic coprocessor of the next quest and the creative cores of the end of the era.',
      automate: 'Feed the metal-organic precursors by pipe and take the wafers by ME; the coprocessor takes one wafer each, so keep a small stock.',
    },
    desc: [],
    tasks: [it('grindless:laser_array_wafer')],
    rewards: [xp(150)],
  },
  {
    key: 'AE_A2', kind: 'process', title: 'Crafting at a Billion', icon: 'megacells:256m_crafting_storage',
    deps: ['AE_A1'], x: 40.5, y: 4.5,
    teach: {
      for: 'A crafting CPU of 256M storage, with enough accelerators and a photonic coprocessor, can plan a job of a billion items without losing track.',
      needs: 'The crafting storage, the accelerators and the &6Photonic Coprocessor&r.',
      unlocks: 'Plans that stage III asks for.',
      automate: 'Split a huge plan into several CPUs, one for each line.',
    },
    desc: [],
    tasks: [it('megacells:256m_crafting_storage'), it('megacells:mega_crafting_accelerator'), it('grindless:photonic_coprocessor')],
    rewards: [xp(150)],
  },
  {
    key: 'AE_A3', kind: 'process', title: 'Patterns by the Thousand', icon: 'expatternprovider:assembler_matrix_crafter',
    deps: ['AE_A2'], x: 42, y: 4.5,
    teach: {
      for: 'The assembler matrix keeps hundreds of patterns in one block, and two pattern providers push them out. A pattern memory unit holds the plan.',
      needs: 'The matrix crafter, frame and walls, an extended provider, an expanded provider and the memory unit.',
      unlocks: 'Autocrafting of every item of the era.',
      automate: 'Group patterns by line, and name them.',
    },
    desc: [],
    tasks: [it('expatternprovider:assembler_matrix_crafter'), it('expatternprovider:assembler_matrix_frame'), it('expatternprovider:assembler_matrix_wall'), it('expatternprovider:ex_pattern_provider'), it('expandedae:exp_pattern_provider'), it('grindless:pattern_memory_unit')],
    rewards: [xp(150)],
  },
  {
    key: 'PAR', kind: 'machine', title: 'The Parallel Hatch', icon: 'gtceu:max_maxplus_parallel_hatch',
    deps: ['SCALE'], x: 41, y: 3,
    teach: {
      for: 'The MAX+ parallel hatch lets one machine run a very large batch at once. It does not make a recipe faster; it makes the plan fit.',
      needs: 'The &6MAX+ Parallel Control Hatch&r, on a controller that accepts it.',
      unlocks: 'The scale of the final stage.',
      automate: 'A batch needs its inputs together, so size the buffer for it.',
    },
    desc: [],
    tasks: [it('gtceu:max_maxplus_parallel_hatch')],
    rewards: [xp(150)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
