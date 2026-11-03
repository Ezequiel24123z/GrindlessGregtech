// Quest data for opv_integration ("OpV: Power and Older Machines"): the annihilation engine, the Hawking collector, the bulge collector and the
// Kardashev III proof, the parallel hatch and the assembly line array, the OpV cell and network, and the older machines' new modes
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/opv.md, "Older machines, new modes", "Power", "Nothing one at a time", "AE2").
// The era's other machines, circuits and components are taught in opv_machines and opv_circuits; the rows here ask only for controllers the
// player already owns, plus the casings and parts that are new to a plant. OpV has no fusion ring and no new AE2 step.
// Every row starts at a link to the opv_age quest that opens it, and its first quest depends on that key.
// Positions: columns every 2, rows every 2 or more.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.integration,
  filename: 'opv_integration',
  era: 'opv',
  role: 'integration',
  order: 3,
  icon: 'gtceu:annihilation_engine',
  autofocus: 'I_ENGINE',
  title: 'OpV: Power and Older Machines',
  subtitle: ['Antimatter, a black hole and a swarm of starlight collectors as power plants, a hatch that runs a machine many times over, and older machines with new tricks.'],
};

export const LINKS = [
  { key: 'I_L_ENGINE', ref: 'ANTIH', x: 0, y: 0 },
  { key: 'I_L_HAWK', ref: 'KCORE', x: 0, y: 3 },
  { key: 'I_L_BULGE', ref: 'NODE', x: 0, y: 5 },
  { key: 'I_L_PAR', ref: 'START', x: 0, y: 8 },
  { key: 'I_L_NET', ref: 'START', x: 0, y: 10 },
  { key: 'I_L_OM1', ref: 'START', x: 0, y: 13 },
  { key: 'I_L_OM2', ref: 'DEBRIS', x: 0, y: 15 },
  { key: 'I_L_OM3', ref: 'STRAND', x: 0, y: 17 },
  { key: 'I_L_OM4', ref: 'BCHART', x: 0, y: 19 },
  { key: 'I_L_OM5', ref: 'J_CYG', x: 0, y: 21 },
  { key: 'I_L_OM6', ref: 'TETRON', x: 0, y: 23 },
  { key: 'I_L_OM7', ref: 'STACK', x: 0, y: 25 },
  { key: 'I_L_OM8', ref: 'J_SGR', x: 0, y: 27 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ antimatter power
  {
    key: 'I_ENGINE', kind: 'plant', title: 'Annihilation Engine', icon: 'gtceu:annihilation_engine',
    deps: ['ANTIH'], x: 2, y: 0,
    teach: {
      for: 'Matter and antimatter turned entirely into energy. The &6Annihilation Engine&r burns antihydrogen ice or an ACMF pellet with an antiproton stack. Gamma rays stop in &6Gamma Absorber Tiles&r, and a wall of &6TPV Panels&r turns the heat into current.',
      needs: 'The engine, a ring of absorber tiles and a TPV wall, with OpV dynamo hatches. About half the energy leaves as neutrinos and is lost.',
      unlocks: 'The largest source at home, and a share of the gate\'s draw.',
      automate: 'Ice and stacks arrive by bus. Worn tiles go back to the hot cell for their metal.',
    },
    desc: [],
    tasks: [it('gtceu:annihilation_engine'), it('grindless:gamma_absorber_tile'), it('grindless:tpv_panel')],
    rewards: [xp(300)],
  },
  {
    key: 'I_ACMF', kind: 'process', title: 'ACMF Pellet', icon: 'grindless:acmf_pellet',
    deps: ['I_ENGINE'], x: 4, y: 0,
    teach: {
      for: 'An antimatter-catalysed pellet starts the second burn of the engine. Curium-245 from the actinide plant, a tungsten-rhenium hohlraum and a deuterium-tritium fill make one.',
      needs: 'The fuel fabrication plant and its new row, and curium from the partition line.',
      unlocks: 'The engine\'s heavier burn, with an antiproton stack beside the pellet.',
      automate: 'Make pellets in batches. The spent hohlraum goes back to the hot cell.',
    },
    desc: [],
    tasks: [it('grindless:acmf_pellet')],
    rewards: [xp(200)],
  },
  {
    key: 'I_HAWK', kind: 'plant', title: 'Hawking Collector', icon: 'gtceu:hawking_collector',
    deps: ['KCORE', 'I_ENGINE'], x: 2, y: 3,
    teach: {
      for: 'A black hole radiates as it shrinks. The &6Hawking Collector&r takes the power and leaves the shell, burning stable exotic matter or stellar plasma and wearing the core a little each run.',
      needs: 'A Kugelblitz core and OpV dynamo hatches.',
      unlocks: 'The strongest single source of the era, and the second leg of the gate\'s supply.',
      automate: 'Exotic matter and plasma come from their own lines. The power rides the wireless network home.',
    },
    desc: [
      'Evaporation is real physics. A black hole you can feed on demand is fiction.',
    ],
    tasks: [it('gtceu:hawking_collector')],
    rewards: [xp(300)],
  },
  {
    key: 'I_BULGE', kind: 'plant', title: 'Bulge Collector', icon: 'gtceu:bulge_collector',
    deps: ['NODE', 'I_HAWK'], x: 2, y: 5,
    teach: {
      for: 'The &6Bulge Collector&r turns the light gathered by the deployed node packs into current, at Terzan 5 only. One, four or sixteen packs set its output.',
      needs: 'Node packs from the probe line and OpV dynamo hatches. Packs degrade as they work, so they are consumed.',
      unlocks: 'The third source for the wireless network and the Kardashev III proof.',
      automate: 'Keep the probe line running and the packs flowing. A stopped line stops the power.',
    },
    desc: [],
    tasks: [it('gtceu:bulge_collector')],
    rewards: [xp(300)],
  },
  {
    key: 'I_K3', kind: 'milestone', title: 'Kardashev III', icon: 'grindless:bulge_light_census',
    deps: ['I_BULGE'], x: 4, y: 5,
    desc: [
      'A civilisation that uses the light of a whole galaxy\'s stars is Kardashev III. The Bulge Light Census is your proof, and the gate to MAX keeps it in store. Tick this once the census is in hand.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ hatch, array, cell and network
  {
    key: 'I_PAR', kind: 'process', title: 'Parallel Control', icon: 'gtceu:opv_parallel_hatch',
    deps: ['START'], x: 2, y: 8,
    teach: {
      for: 'The &6Overpowered Parallel Control Hatch&r lets a machine that takes parallel hatches run up to 262,144 copies of one recipe at once, each at its own EU/t: the widest hatch yet.',
      needs: 'An OpV hull, field generators, robot arms, sensors, OpV circuits and tetron arrays on the assembly line, cooled with superfluid helium-3 and researched on the Extreme hatch. Then power for every copy.',
      unlocks: 'The assembly line array at full width.',
      automate: 'Give the machine a bus wide enough for the copies it will run.',
    },
    desc: [],
    tasks: [it('gtceu:opv_parallel_hatch')],
    rewards: [xp(250)],
  },
  {
    key: 'I_ARRAY', kind: 'plant', title: 'Assembly Line Array', icon: 'gtceu:assembly_line_array',
    deps: ['I_PAR'], x: 4, y: 8,
    teach: {
      for: 'The &6Assembly Line Array&r runs assembly line recipes in parallel, side by side in one structure. It is where OpV\'s component-hungry recipes stop running one at a time.',
      needs: 'A parallel hatch behind it, the research data for each recipe and the power for its width.',
      unlocks: 'Components and mainframes at the rate a factory needs.',
      automate: 'One input bus per stack of parts, with the ordered inputs in the order the recipe lists them.',
    },
    desc: [],
    tasks: [it('gtceu:assembly_line_array')],
    rewards: [xp(300)],
  },
  {
    key: 'I_CELL', kind: 'machine', title: 'The OpV Cell', icon: 'grindless:opv_smes_cell',
    deps: ['START'], x: 2, y: 10,
    teach: {
      for: 'The &6OpV SMES Cell&r is wound from chain strand wire and lamina stacks around a pair of field generators. It holds four times what a UXV cell does.',
      needs: 'Chain strand wire and lamina from the magnetar, and OpV field generators.',
      unlocks: 'The OpV wireless tier.',
      automate: 'Nothing to feed. Size the towers for your busiest hour.',
    },
    desc: [],
    tasks: [it('grindless:opv_smes_cell')],
    rewards: [xp(250)],
  },
  {
    key: 'I_NET', kind: 'process', title: 'The Network Goes OpV', icon: 'gtceu:opv_wireless_energy_hatch',
    deps: ['I_CELL'], x: 4, y: 10,
    teach: {
      for: 'Move your towers onto &6OpV SMES Cells&r and the wireless network carries OpV to every platform, the magnetar and the cluster included. The chain strand repeater goes into the wireless hatches.',
            needs: 'One formed tower holding an OpV cell: the network runs at its strongest cell, so until then it stays at UXV.',
            unlocks: 'The wireless hatches at OpV.',
      automate: 'Add cells when the network dips at your busiest hour.',
    },
    desc: [],
    tasks: [it('gtceu:opv_wireless_energy_hatch'), it('gtceu:opv_wireless_dynamo_hatch'), it('grindless:chain_strand_repeater')],
    rewards: [xp(250)],
  },
  {
    key: 'I_GATELOAD', kind: 'milestone', title: 'Eight Sources', icon: 'gtceu:opv_wireless_energy_hatch',
    deps: ['I_NET', 'I_K3'], x: 6, y: 7.5,
    desc: [
      'The gate to MAX holds the largest load yet for a minute; EMI shows the draw. Add up what your engines, collectors and older generators feed the wireless network, keep a charged OpV cell behind them, then tick this box.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ older machines
  {
    key: 'I_OM_EV', kind: 'process', title: 'Cold and Strip', icon: 'gtceu:cryogenic_plant',
    deps: ['START'], x: 2, y: 13,
    teach: {
      for: 'The &6Cryogenic Plant&r, &6Rare Earth Extraction Cascade&r, &6Hot Strip Mill&r and &6Platinum Plant&r each take a new mode: liquid helium-3 and tests at 77 K, germanium and silicon chlorides, beryllium foil and iridium of five nines.',
      needs: 'The controllers you already own, and the cuts and dust from the stars.',
      unlocks: 'The tetron cryostat, the beam window and the iridium target.',
      automate: 'Each plant hands its product on by pipe. Return the nitrogen and the water.',
    },
    desc: [],
    tasks: [it('gtceu:cryogenic_plant'), it('gtceu:extraction_cascade'), it('gtceu:hot_strip_mill'), it('gtceu:platinum_plant')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_NUC', kind: 'process', title: 'Heavier Cuts', icon: 'gtceu:hot_cell',
    deps: ['DEBRIS'], x: 2, y: 15,
    teach: {
      for: 'The &6Hot Cell&r, &6Fluorspar Kiln&r, &6Fuel Fabrication Plant&r, &6Tritium Removal Facility&r, &6Actinide Partitioning Plant&r and &6Methane Pyrolyser&r take rows for spent tiles and targets, thorium and beryllium fluorides, the ACMF pellet, spent shields, curium and pyrolytic graphite.',
      needs: 'The reactors and plants you already own and the spent parts of the new lines.',
      unlocks: 'The pellet, the shield tiles and the graphite anodes.',
      automate: 'Spent parts return by bus. Nothing in the tailings is dangerous once sorted.',
    },
    desc: [],
    tasks: [
      it('gtceu:hot_cell'), it('gtceu:fluorspar_kiln'), it('gtceu:fuel_fabrication_plant'),
      it('gtceu:tritium_removal_facility'), it('gtceu:actinide_partitioning_plant'), it('gtceu:methane_pyrolyser'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_MAG', kind: 'process', title: 'Windings and Preforms', icon: 'gtceu:hts_magnet_works',
    deps: ['STRAND'], x: 2, y: 17,
    teach: {
      for: 'The &6HTS Magnet Works&r, &6Helium Refrigerator&r, &6Nitride Magnet Works&r, &6CVI Furnace&r, &6Spark Plasma Sinterer&r and &6Megabar Press&r each take a row: pancakes, quench training, nitride powder, chain composites and rotors, and strain-wave splines.',
      needs: 'The older controllers and chain strand from the magnetar.',
      unlocks: 'The motor, the arm, the field generator and the trap magnet.',
      automate: 'Rotors and splines by bus; give back the backing plates of spent parts.',
    },
    desc: [],
    tasks: [
      it('gtceu:hts_magnet_works'), it('gtceu:helium_refrigerator'), it('gtceu:nitride_magnet_works'),
      it('gtceu:cvi_furnace'), it('gtceu:spark_plasma_sinterer'), it('gtceu:megabar_press'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_WAFER', kind: 'process', title: 'Films and Crystals', icon: 'gtceu:mocvd_reactor',
    deps: ['BCHART'], x: 2, y: 19,
    teach: {
      for: 'The &6Ion Implanter&r, &6MOCVD Reactor&r, &6Zone Refining Tower&r, &6Crystal Growth Furnace&r, &6MBE Reactor&r, &6SiC Device Fab&r and &6Fibre Draw Tower&r each take rows for cryogenic gate stacks, float-zone silicon-28, nine boules, quantum wells, power dies and polycapillaries.',
      needs: 'The UV and UHV controllers you already own, and the new purities.',
      unlocks: 'The silicon-28 wafer, the cryo-CMOS die and the mainframe\'s inputs.',
      automate: 'Boules and films by bus; recycle what the tower rejects.',
    },
    desc: [],
    tasks: [
      it('gtceu:ion_implanter'), it('gtceu:mocvd_reactor'), it('gtceu:zone_refining_tower'),
      it('gtceu:crystal_growth_furnace'), it('gtceu:mbe_reactor'), it('gtceu:sic_device_fab'), it('gtceu:fibre_draw_tower'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_BEAM', kind: 'process', title: 'Heavy Ions and Beams', icon: 'gtceu:calutron',
    deps: ['J_CYG'], x: 2, y: 21,
    teach: {
      for: 'The &6Calutron&r, &6Superheavy Factory&r (the Heavy Ion Cyclotron, which runs both the irradiation and the recoil separation), &6Superheavy Chemistry Lab&r, &6Synchrotron&r and &6Electron Beam Furnace&r take rows: nickel-64, lead-208 and boron-10, the new beams, elements 124 and 126, census IV, mirror metrology and brazes.',
      needs: 'The UEV and UV controllers you already own.',
      unlocks: 'Census IV, the beam cells and the sealed parts of the antiproton line.',
      automate: 'Targets and etched membranes by bus. The recoil gas goes from the irradiation row to the separation row inside the factory, and the spent beam is an output, so route it.',
    },
    desc: [],
    tasks: [
      it('gtceu:calutron'), it('gtceu:heavy_ion_cyclotron'),
      it('gtceu:superheavy_chemistry_lab'), it('gtceu:synchrotron'), it('gtceu:electron_beam_furnace'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_CHIP', kind: 'process', title: 'Cryostat and Bonding', icon: 'gtceu:millikelvin_cryostat_works',
    deps: ['TETRON'], x: 2, y: 23,
    teach: {
      for: 'The &6Millikelvin Cryostat Works&r, &6Femtosecond Writer&r, &6TFLN Fab&r, &6BEUV Scanner&r, &6STM Lithography Cell&r, &6SNSPD Foundry&r, &6Levitation Melter&r and &6Photonic Integration Hall&r take rows for superfluid helium-3, tetron tests, smart cuts, six masks and the cosmic mainframe join.',
      needs: 'The UIV and UEV controllers you already own, and silicon-28 from the implanter.',
      unlocks: 'The tetron array, the bonded die and the cosmic mainframe.',
      automate: 'Dies and wafers by bus. Failed tetron dies go back through the cascade for indium and niobium.',
    },
    desc: [],
    tasks: [
      it('gtceu:millikelvin_cryostat_works'), it('gtceu:femtosecond_writer'), it('gtceu:tfln_fab'),
      it('gtceu:beuv_scanner'), it('gtceu:stm_lithography_cell'), it('gtceu:snspd_foundry'),
      it('gtceu:levitation_melter'), it('gtceu:photonic_integration_hall'),
    ],
    rewards: [xp(150)],
  },
  {
    key: 'I_OM_ANTI', kind: 'process', title: 'Traps, Clocks and Gates', icon: 'gtceu:antimatter_trap',
    deps: ['STACK'], x: 2, y: 25,
    teach: {
      for: 'The &6Antimatter Trap&r, &6Positron Accumulator&r, &6SRF Cavity Works&r, &6Nuclear Clock Lab&r, &6X-Ray Pulse Profiler&r, &6PBO Plant&r and &6Warp Gate&r each take a row: antiproton stacking, seed plasma, RRR niobium, a thorium lock, an XNAV calibration, chain braid and the three OpV gates.',
      needs: 'The controllers you already own, and the cold antiprotons.',
      unlocks: 'Stacks, the pathfinder, the chain cable and the gates to the places and to MAX.',
      automate: 'Stacks and cells ride the relay between sites.',
    },
    desc: [],
    tasks: [
      it('gtceu:antimatter_trap'), it('gtceu:positron_accumulator'), it('gtceu:srf_cavity_works'),
      it('gtceu:nuclear_clock_lab'), it('gtceu:xray_pulse_profiler'), it('gtceu:pbo_plant'), it('gtceu:warp_gate'),
    ],
    rewards: [xp(150)],
  },
  {
    key: 'I_OM_PASTA', kind: 'process', title: 'Pasta Gains a Magnetar', icon: 'gtceu:pasta_extractor',
    deps: ['J_SGR'], x: 2, y: 27,
    teach: {
      for: 'The &6Pasta Extractor&r and &6Pasta Mill&r, built for the pulsar, take a magnetar site and rows for chain crust, caged phases, chain strand and lamina. The &6Spintronic Cluster Tool&r takes eight films.',
      needs: 'The UXV controllers you already own, and a platform at the magnetar.',
      unlocks: 'Chain strand, the hull plates and every sputtered film of the circuit lines.',
      automate: 'Cages return from the sorter. Targets arrive by bus.',
    },
    desc: [],
    tasks: [
      it('gtceu:pasta_extractor'), it('gtceu:pasta_phase_sorter'), it('gtceu:mtj_sputter_cluster'),
    ],
    rewards: [xp(150)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
