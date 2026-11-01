// Quest data for uhv_integration ("UHV: Power and Scale"): the power devices, the swarm and its map, RTAN wire, the network at UHV, the
// Quantum Fabricator, the older machines' new modes and the two AE2 steps (docs/reforge/05_quest_design.md, sections 2 and 3.2;
// docs/eras/uhv.md, "Older machines, new modes", "Power", "Nothing one at a time", "AE2 between planets").
// SWARM, CORONA, KARD, NOBLE, RTAN, CELL, NETUHV and QFAB moved here from uhv_age and keep their keys and ids; the power chart points at
// SWARM and CELL. The machines and circuits themselves are taught in uhv_machines and uhv_circuits; the older-machine rows here ask only
// for controllers the player already owns.
// Every row starts at a link to the uhv_age quest that opens it, and its first quest depends on that link.
// Positions: columns every 2, rows every 2.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uhv_integration',
  era: 'uhv',
  role: 'integration',
  order: 3,
  icon: 'gtceu:swarm_control_station',
  autofocus: 'I_PWRDEV',
  title: 'UHV: Power and Scale',
  subtitle: ['Silicon carbide power, a swarm round the Sun, the network at UHV, one machine doing five jobs, older machines with new tricks and two more stations on AE2.'],
};

export const LINKS = [
  { key: 'I_L_PW', ref: 'START', x: 0, y: 0 },
  { key: 'I_L_SW', ref: 'STN7', x: 0, y: 2 },
  { key: 'I_L_NET', ref: 'START', x: 0, y: 4 },
  { key: 'I_L_QF', ref: 'START', x: 0, y: 6 },
  { key: 'I_L_AE1', ref: 'STN7', x: 0, y: 8 },
  { key: 'I_L_AE2', ref: 'STEP', x: 0, y: 10 },
  { key: 'I_L_OM1', ref: 'START', x: 0, y: 12 },
  { key: 'I_L_OM2', ref: 'START', x: 0, y: 14 },
  { key: 'I_L_OM3', ref: 'START', x: 0, y: 16 },
  { key: 'I_L_OM4', ref: 'START', x: 0, y: 18 },
  { key: 'I_L_OM5', ref: 'START', x: 0, y: 20 },
  { key: 'I_L_OM6', ref: 'START', x: 0, y: 22 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ power devices and RTAN
  {
    key: 'I_PWRDEV', kind: 'process', title: 'Power Devices', icon: 'grindless:sic_power_module',
    deps: ['I_L_PW'], x: 2, y: 0,
    teach: {
      for: 'Silicon carbide takes more heat and volts than silicon, and the &6SiC Power Module&r is what the swarm\'s control gear is built from. An inverted metamorphic array stacks a junction for every colour of light.',
      needs: 'The SiC device fab and the solar array fab, both from the machines tab, and ultrapure water for the wafers.',
      unlocks: 'Swarm segments and the UHV power gear.',
      automate: 'Boules and wafers move by bus; keep the ultrapure water on its own pipe.',
    },
    desc: [],
    tasks: [it('gtceu:sic_device_fab'), it('grindless:sic_power_module'), it('gtceu:solar_array_fab'), it('grindless:imm_solar_array')],
    rewards: [xp(120)],
  },
  {
    key: 'RTAN', kind: 'process', title: 'RTAN', icon: 'gtceu:platinum_plant',
    deps: ['I_PWRDEV'], x: 4, y: 0,
    teach: {
      for: 'The &6Platinum Plant&r turns the biomining liquor into salts, and the ruthenium, iridium and americium end up as the alloy that carries the highest currents yet: RTAN wire.',
      needs: 'Proxima leach liquor from the biomining heap, and a long afternoon on the platinum plant.',
      unlocks: 'UHV wiring for the network and the heaviest machines.',
      automate: 'Liquor by pipe from Proxima b over the gate\'s AE2 pair; the plant hands salts to the blast furnace line.',
    },
    desc: [],
    tasks: [it('gtceu:platinum_plant'), it('gtceu:ruthenium_trinium_americium_neutronate_single_wire')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ the swarm
  {
    key: 'SWARM', kind: 'plant', title: 'The Swarm', icon: 'gtceu:swarm_control_station',
    deps: ['I_L_SW'], x: 2, y: 2,
    teach: {
      for: 'The &6Swarm Control Station&r steers a cloud of segments round the Sun and sends the power down as a beam. Two stations feed one bank, and the bank loses a little on the way.',
      needs: 'Swarm segments from the foundry in Mercury orbit, and the station in the orbit itself.',
      unlocks: 'UHV power without fuel, and the swarm half of the gate to UEV.',
      automate: 'Segments ride the Mercury AE2 pair; worn ones go back to the foundry as scrap.',
    },
    desc: [],
    tasks: [it('gtceu:swarm_control_station'), it('grindless:swarm_segment')],
    rewards: [xp(200)],
  },
  {
    key: 'CORONA', kind: 'process', title: 'Coronal Map', icon: 'grindless:coronal_field_map',
    deps: ['SWARM'], x: 4, y: 2,
    teach: {
      for: 'A probe that dips into the corona comes back with the &6Coronal Field Map&r. The swarm points itself with it.',
      needs: 'The solar probe bay in Mercury orbit, and a probe for every run.',
      unlocks: 'Aimed beams, and the map the Gate to UEV asks for.',
      automate: 'The bay builds probes from ME; the map goes back to the network.',
    },
    desc: [],
    tasks: [it('gtceu:solar_probe_bay'), it('grindless:solar_probe'), it('grindless:coronal_field_map')],
    rewards: [xp(150)],
  },
  {
    key: 'KARD', kind: 'milestone', title: 'Kardashev II', icon: 'gtceu:swarm_control_station',
    deps: ['CORONA'], x: 6, y: 2,
    desc: [
      'A civilisation that uses all the power of its star is a type II on the Kardashev scale. You have a swarm, so you are on the way. It is only on the way.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ the network and the fabricator
  {
    key: 'CELL', kind: 'machine', title: 'The UHV Cell', icon: 'grindless:uhv_smes_cell',
    deps: ['I_L_NET'], x: 2, y: 4,
    teach: {
      for: 'The &6UHV SMES Cell&r holds a huge store of EU, and the nuclear clock keeps it in step with the network.',
      needs: 'The naquadria magnet works, and the nuclear clock for the sync.',
      unlocks: 'The UHV wireless tier.',
      automate: 'Nothing to feed. Size the towers for your busiest hour.',
    },
    desc: [],
    tasks: [it('gtceu:naquadria_magnet_works'), it('grindless:uhv_smes_cell')],
    rewards: [xp(200)],
  },
  {
    key: 'NETUHV', kind: 'machine', title: 'The Network Goes UHV', icon: 'gtceu:uhv_wireless_energy_hatch',
    deps: ['CELL'], x: 4, y: 4,
    teach: {
      for: 'Move your towers onto &6UHV SMES Cells&r and the wireless network carries UHV, out to the stations and now to Mercury and Proxima.',
      needs: 'Every formed tower holding UHV cells: until then the network stays at UV.',
      unlocks: 'Stations that run on power made at home, and the wireless hatches and covers at UHV.',
      automate: 'Add cells when the network dips at your busiest hour.',
    },
    desc: [],
    tasks: [it('gtceu:uhv_wireless_energy_hatch'), it('gtceu:uhv_wireless_dynamo_hatch')],
    rewards: [xp(200)],
  },
  {
    key: 'PAR', kind: 'step', title: 'Parallel Hatch', icon: 'gtceu:uv_parallel_hatch',
    deps: ['NETUHV'], x: 6, y: 4,
    desc: [
      'There is no UHV parallel hatch. The &6UV Parallel Hatch&r is the top of the line, and one more machine of the same kind is the only other way to go wider.',
    ],
    tasks: [it('gtceu:uv_parallel_hatch')],
    rewards: [xp(60)],
  },
  {
    key: 'QFAB', kind: 'machine', title: 'Quantum Fabricator', icon: 'gtceu:quantum_fabricator',
    deps: ['I_L_QF'], x: 2, y: 6,
    teach: {
      for: 'The &6Quantum Fabricator&r does the work of the assembler, circuit assembler, forming press, laser engraver and cutter in one cleanroom machine. A parallel hatch multiplies it, and it overclocks perfectly.',
      needs: 'A cleanroom, UHV power, a parallel hatch and every older recipe\'s inputs on one bus.',
      unlocks: 'Your Assembly Hall folded into one machine.',
      automate: 'One bus of inputs, one of outputs: it takes the recipes of five machines.',
    },
    desc: [],
    tasks: [it('gtceu:quantum_fabricator')],
    rewards: [xp(250)],
  },

  // ------------------------------------------------------------------ AE2
  {
    key: 'AE_MERC', kind: 'step', title: 'Mercury on AE2', icon: 'gcyr:mercury_orbit',
    deps: ['I_L_AE1'], x: 2, y: 8,
    desc: [
      'The seed for the Mercury bridge is made in Mercury orbit, with the first swarm segment as the catalyst. Once linked, the foundry\'s output reaches home through ME.',
    ],
    tasks: [it('grindless:swarm_segment')],
    rewards: [xp(100)],
  },
  {
    key: 'AE_PROX', kind: 'step', title: 'Proxima b on AE2', icon: 'grindless:proxima_gate_seed',
    deps: ['I_L_AE2'], x: 2, y: 10,
    desc: [
      'Proxima b has no bridge of its own: only the gate makes the &6Proxima Gate Seed&r, and the first flora sample is its catalyst. Samples then arrive through ME, never by hand.',
    ],
    tasks: [it('grindless:proxima_gate_seed')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ older machines
  {
    key: 'OM_ISO', kind: 'process', title: 'Isotope Chemistry', icon: 'gtceu:fuel_fabrication_plant',
    deps: ['I_L_OM1'], x: 2, y: 12,
    teach: {
      for: 'The &6Fuel Fabrication Plant&r, the &6Hot Cell&r and the &6Pyroprocessing Cell&r take on the heavier isotopes: new fuels, new reprocessing, nothing new to build.',
      needs: 'Berkelium and californium from the reactor, and the hot cell\'s shielding.',
      unlocks: 'Driver elements, targets and the thorium line.',
      automate: 'Targets in by bus; spent elements back to the pyroprocessing cell.',
    },
    desc: [],
    tasks: [it('gtceu:fuel_fabrication_plant'), it('gtceu:hot_cell'), it('gtceu:pyroprocessing_cell'), ck()],
    rewards: [xp(100)],
  },
  {
    key: 'OM_LIQ', kind: 'process', title: 'Proxima Liquors', icon: 'gtceu:heavy_water_plant',
    deps: ['I_L_OM2'], x: 2, y: 14,
    teach: {
      for: 'Heavy water, platinum salts and rare-earth liquors from Proxima b go through the &6Platinum Plant&r, &6Heavy Water Plant&r, &6Extraction Cascade&r, &6Regolith Cell&r and &6Lunar Solar Array&r. Each machine learns a new input.',
      needs: 'Proxima leach liquors, and the arrays tuned to the red.',
      unlocks: 'RTAN, UHV catalysts and the base\'s power.',
      automate: 'Liquors arrive over the Proxima AE2 pair; each plant hands its output on.',
    },
    desc: [],
    tasks: [
      it('gtceu:platinum_plant'), it('gtceu:heavy_water_plant'), it('gtceu:extraction_cascade'),
      it('gtceu:regolith_cell'), it('gtceu:lunar_solar_array'),
    ],
    rewards: [xp(100)],
  },
  {
    key: 'OM_LIFE', kind: 'process', title: 'Life at Home', icon: 'gtceu:biofoundry',
    deps: ['I_L_OM3'], x: 2, y: 16,
    teach: {
      for: 'The &6Biofoundry&r, &6Organoid Lab&r and &6Algae Bioreactor&r grow new strains: neural tissue on a scaffold, and an algae that feeds on red light.',
      needs: 'Gene cassettes, the far-red strain, and sealed rooms.',
      unlocks: 'Organoid processors and the far-red algae.',
      automate: 'Seed cultures from ME; keep every room sealed.',
    },
    desc: [],
    tasks: [it('gtceu:biofoundry'), it('gtceu:organoid_lab'), it('gtceu:algae_bioreactor'), it('grindless:engineered_far_red_algae')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_CRYS', kind: 'process', title: 'Crystals and Chips', icon: 'gtceu:ion_implanter',
    deps: ['I_L_OM4'], x: 2, y: 18,
    teach: {
      for: 'The &6Ion Implanter&r, &6Isotope Column&r, &6MOCVD Reactor&r, &6Synchrotron&r, &6Antimatter Trap&r, &6Powder-in-Tube Line&r and &6Diamond Lattice Fab&r each take a new mode in UHV, for wafers and cells at the next purity.',
      needs: 'The UV versions of each, and the new isotopes.',
      unlocks: 'The next wafers and the antimatter route.',
      automate: 'Wafers and boules by bus; recycle what the column rejects.',
    },
    desc: [],
    tasks: [
      it('gtceu:ion_implanter'), it('gtceu:isotope_column'), it('gtceu:mocvd_reactor'), it('gtceu:synchrotron'),
      it('gtceu:antimatter_trap'), it('gtceu:powder_in_tube_line'), it('gtceu:diamond_lattice_fab'),
    ],
    rewards: [xp(100)],
  },
  {
    key: 'OM_THR', kind: 'process', title: 'Thrusters and Sails', icon: 'gtceu:thruster_works',
    deps: ['I_L_OM5'], x: 2, y: 20,
    teach: {
      for: 'The &6Thruster Works&r, &6Light Sail Fab&r and &6Cryogenic Plant&r make the motors and sails for the trip, with oganesson as the propellant.',
      needs: 'Oganesson from the cryogenic plant, and film from the aluminium line.',
      unlocks: 'The ICAN motor\'s pods and the sails.',
      automate: 'Pods and sails to ME; keep oganesson in its own tank.',
    },
    desc: [],
    tasks: [it('gtceu:thruster_works'), it('gtceu:light_sail_fab'), it('gtceu:cryogenic_plant')],
    rewards: [xp(100)],
  },
  {
    key: 'OM_CHEM', kind: 'process', title: 'Chemistry Rows', icon: 'gtceu:large_chemical_reactor',
    deps: ['I_L_OM6'], x: 2, y: 22,
    teach: {
      for: 'The &6Large Chemical Reactor&r takes the era\'s new rows: solvents, propellant chemistry and the sulfide route.',
      needs: 'The raw materials from the Proxima liquors and the isotopes.',
      unlocks: 'Every liquor and solvent the machines above ask for.',
      automate: 'Pipe each product to its consumer; no tank should ever overflow.',
    },
    desc: [],
    tasks: [it('gtceu:large_chemical_reactor')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ propellant
  {
    key: 'NOBLE', kind: 'process', title: 'Noble Thrust', icon: 'grindless:oganesson_propellant_pod',
    deps: ['OM_THR'], x: 4, y: 20,
    teach: {
      for: 'Oganesson is the heaviest noble gas and the best propellant a thruster could ask for. The &6Oganesson Propellant Pod&r packs it for the ICAN motor.',
      needs: 'Oganesson from the cryogenic plant.',
      unlocks: 'The motor and the sails\' pods.',
      automate: 'One pod line off the cryogenic plant, kept in its own tank.',
    },
    desc: [
      'Real oganesson lasts milliseconds and only a few atoms exist. GregTech Modern treats it as a stable gas, and the pack goes along.',
    ],
    tasks: [it('grindless:oganesson_propellant_pod')],
    rewards: [xp(200)],
  },
];
