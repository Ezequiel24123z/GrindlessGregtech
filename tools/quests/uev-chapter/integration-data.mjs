// Quest data for uev_integration ("UEV: Power and Older Machines"): the Mk4 plasmas, the parallel hatch, the UEV cell and network, the
// drives, AE2 between stars and the older machines' new modes (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uev.md,
// "Older machines, new modes", "Power on the wireless network", "Fusion", "Nothing one at a time", "AE2 between stars").
// PARH, CELL, BURN and PB moved here from uev_age and keep their keys and ids; the power chart points at CELL. The Mk4 ring and the other
// machines are taught in uev_machines; the older-machine rows here ask only for controllers the player already owns.
// Every row starts at a link to the uev_age quest that opens it, and its first quest depends on that key.
// Positions: columns every 2, rows every 2.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UEV Integration', origin: { x: 5, y: 46.75 }, heading: { key: 'H_POWER', x: 0, y: 0, deps: ['H_FIBRE'], icon: 'gtceu:uev_parallel_hatch', desc: [
      'The cell, the network and the deep field detector.',
    ] } },
  filename: 'uev_integration',
  era: 'uev',
  role: 'integration',
  order: 3,
  icon: 'gtceu:uev_fusion_reactor',
  autofocus: 'BURN',
  title: 'UEV: Power and Older Machines',
  subtitle: ['A hotter fusion ring and its converter, a wider hatch, a bigger cell, drives for the stars, AE2 across light years and older machines with new tricks.'],
};

export const LINKS = [];

export const QUESTS = [
  // ------------------------------------------------------------------ Mk4 plasmas and conversion
  {
    key: 'BURN', kind: 'process', title: 'First Mk4 Burn', icon: 'gtceu:uev_dhe3_plasma_bucket',
    deps: ['H_FUS'], x: 4, y: 13.25,
    teach: {
      for: 'The first fuel run on the Mk4 ring turns D-He-3 into helium plasma and protons, and the plasma is the energy: a direct converter takes it as current.',
      needs: 'A formed Mk4 ring on UEV hatches, a premixed D-He-3 fuel and a very large buffer: a run is refused when the start energy is above what the ring stores.',
      unlocks: 'The ring\'s power for the gate, and the plasma the Stellar Forge burns for extra heat.',
      automate: 'Fuel in by bus from the helium-3 and deuterium lines; the helium ash goes back to the cryogenic plant.',
    },
    desc: [],
    tasks: [it('gtceu:uev_dhe3_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'PB', kind: 'process', title: 'Aneutronic', icon: 'gtceu:uev_pb11_plasma_bucket',
    deps: ['BURN'], x: 6, y: 13.25,
    teach: {
      for: 'Proton and boron-11 fuse into three helium nuclei and almost no neutrons, so the first wall wears far less than with helium-3.',
      needs: 'Boron-11 from the isotope column, and the same Mk4 ring and converter as the first burn.',
      unlocks: 'A second source of Mk4 power with no tritium side reactions.',
      automate: 'Keep boron-11 on its own line from the column; the plasma goes straight to the converter.',
    },
    desc: [],
    tasks: [it('gtceu:uev_pb11_plasma_bucket')],
    rewards: [xp(150)],
  },
  {
    key: 'I_OM_DEC', kind: 'process', title: 'Written Final', icon: 'gtceu:direct_energy_converter',
    deps: ['PB'], x: 8, y: 13.25,
    teach: {
      for: 'The &6Direct Energy Converter&r takes three Mk4 plasmas and the &6Naquadria Magnet Works&r makes the UEV cell. Both are older machines with a new row.',
      needs: 'The Mk4 plasma buckets and the magnet works from ZPM. The converter\'s output is written final, so no generator array doubles it.',
      unlocks: 'The Mk4 figures on the Power tab and the cell below.',
      automate: 'Plasma by pipe from the ring; leave the converter\'s hatches empty of anything else.',
    },
    desc: [],
    tasks: [it('gtceu:direct_energy_converter'), it('gtceu:naquadria_magnet_works')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ hatch, cell and network
  {
    key: 'PARH', kind: 'process', title: 'Parallel Control', icon: 'gtceu:uev_parallel_hatch',
    deps: ['H_POWER'], x: 3, y: -2.75,
    teach: {
      for: 'The &6Ultimate Parallel Control Hatch&r lets a mega machine run up to 4,096 copies of a recipe at once. Energy is still the limit: every copy pays its own EU/t.',
      needs: 'A machine with a parallel slot, and the power for every copy. The first copies cost the same as the last.',
      unlocks: 'The Stellar Forge at full width, and every mega machine of the era.',
      automate: 'Feed the machine a bus wide enough for the copies it will run.',
    },
    desc: [],
    tasks: [it('gtceu:uev_parallel_hatch')],
    rewards: [xp(150)],
  },
  {
    key: 'CELL', kind: 'machine', title: 'The UEV Cell', icon: 'grindless:uev_smes_cell',
    deps: ['H_POWER'], x: 3, y: -0.75,
    teach: {
      for: 'The &6UEV SMES Cell&r holds ninety-six UV naquadria batteries, about 250 billion EU. The quantum repeater keeps the network in step.',
      needs: 'The naquadria magnet works, and the quantum repeater node from the photonic lane.',
      unlocks: 'The UEV wireless tier.',
      automate: 'Nothing to feed. Size the towers for your busiest hour.',
    },
    desc: [],
    tasks: [it('grindless:uev_smes_cell')],
    rewards: [xp(200)],
  },
  {
    key: 'NETUEV', kind: 'process', title: 'The Network Goes UEV', icon: 'gtceu:uev_wireless_energy_hatch',
    deps: ['CELL'], x: 5, y: -0.75,
    teach: {
      for: 'Move your towers onto &6UEV SMES Cells&r and the wireless network carries UEV to every station, out to Alpha Centauri and beyond.',
      needs: 'One formed tower holding a UEV cell: the network runs at its strongest cell, so until then it stays at UHV.',
      unlocks: 'The wireless hatches at UEV, and the gate\'s load at Sirius B.',
      automate: 'Add cells when the network dips at your busiest hour.',
    },
    desc: [],
    tasks: [it('gtceu:uev_wireless_energy_hatch'), it('gtceu:uev_wireless_dynamo_hatch')],
    rewards: [xp(200)],
  },
  {
    key: 'I_GATELOAD', kind: 'milestone', title: 'Sixteen Amps of UEV', icon: 'gtceu:uev_wireless_energy_hatch',
    deps: ['NETUEV'], x: 7, y: -0.75,
    desc: [
      'The gate to UIV needs 134,217,728 EU/t for sixty seconds, and the bank loses five per cent on the way in. Four Mk4 rings on the polarised fuel and two swarm stations at Alpha Centauri close the sum; the Power tab shows each source.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ the drives
  {
    key: 'I_DFD', kind: 'process', title: 'Drives for the Stars', icon: 'gtceu:thruster_works',
    deps: ['H_POWER'], x: 3, y: 1.25,
    teach: {
      for: 'The &6Thruster Works&r makes two drives now, the Mk1 and the Mk2. Neither runs a real fusion: they hold a plasma in fiction only, as blocks.',
      needs: 'The UEV emitter and motor for the antenna, and single-crystal turbine wheels for the Mk2.',
      unlocks: 'Level 9 and level 10 rockets.',
      automate: 'Motors go to ME; the Mk2 wheels come from the single-crystal foundry.',
    },
    desc: [],
    tasks: [it('gtceu:thruster_works'), it('grindless:dfd_mk1_motor'), it('grindless:dfd_mk2_motor')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ AE2 between stars
  {
    key: 'I_AE_ALPHA', kind: 'step', title: 'Alpha Centauri on AE2', icon: 'ae2:quantum_ring',
    deps: ['H_ALPHA_NET'], x: 7, y: -63.25,
    teach: {
      for: 'A &6Warp Gate&r built again in Alpha Centauri orbit seeds an AE2 bridge home, so the collectors\' gas and the dust lab\'s records reach ME without a trip.',
      needs: 'A second warp gate at station nine, with the first run as its catalyst.',
      unlocks: 'The star\'s output in your network, and the seed Barnard b is fed from.',
      automate: 'Never carry a stack: let ME move gas home and goods back.',
    },
    desc: [],
    tasks: [it('gtceu:warp_gate'), ck()],
    rewards: [xp(100)],
  },
  {
    key: 'I_AE_BARN', kind: 'step', title: 'Barnard b on AE2', icon: 'ae2:quantum_ring',
    deps: ['H_BARN'], x: 6.5, y: -40.25,
    desc: [
      'Barnard b has no gate of its own. It is fed from the Alpha Centauri relay by the same mechanism that served Proxima b, and the carbonyl refinery takes carbon monoxide from the HV syngas plant over it.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },
  {
    key: 'I_AE_SIRIUS', kind: 'step', title: 'Sirius B on AE2', icon: 'ae2:quantum_ring',
    deps: ['H_SIRIUS_NET'], x: 17, y: -61.25,
    desc: [
      'The tenth station gets its own relay from the Alpha Centauri one. Pellets and samples come home sealed, and the gate\'s hold is ordered from ME.',
    ],
    tasks: [it('gtceu:warp_gate')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ older machines
  {
    key: 'I_OM_CHEM', kind: 'process', title: 'Separations and Syngas', icon: 'gtceu:extraction_cascade',
    deps: ['H_ROWS'], x: 3.5, y: 4.25,
    teach: {
      for: 'The &6Extraction Cascade&r, &6Cryogenic Plant&r, &6Platinum Plant&r, &6Fluorspar Kiln&r, &6Syngas Plant&r and &6Methane Pyrolyser&r each take a new mode: hafnium and tantalum thiocyanate, interstellar gas distillation, barnard residue, hydrogen fluoride, CO-rich syngas and carbon nanotubes.',
      needs: 'The controllers you already own, and the gas and residue from the stars.',
      unlocks: 'Pure refractory metals, xenon and helium-3, ruthenium and iridium, the Mond route on Barnard b.',
      automate: 'Each plant hands its product on by pipe. Return the helium ash and the calcium fluoride.',
    },
    desc: [],
    tasks: [
      it('gtceu:extraction_cascade'), it('gtceu:cryogenic_plant'), it('gtceu:platinum_plant'),
      it('gtceu:fluorspar_kiln'), it('gtceu:syngas_plant'), it('gtceu:methane_pyrolyser'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_NUC', kind: 'process', title: 'Heavier Cuts', icon: 'gtceu:hot_cell',
    deps: ['H_ROWS'], x: 3.5, y: 6.25,
    teach: {
      for: 'The &6Hot Cell&r, &6Fuel Fabrication Plant&r, &6Actinide Partitioning Plant&r, &6High Flux Reactor&r, &6Transuranium Facility&r and &6Isotope Column&r take targets, a depleted-plutonium fuel, new cuts of plutonium, curium and californium, and boron-11 fluoride.',
      needs: 'The reactors from UHV and the isotope feed.',
      unlocks: 'The calutron\'s feed, the superheavy targets and the boron for the aneutronic burn.',
      automate: 'Targets and cuts move by bus; the decay store gives helium-3 back to the cryogenic plant.',
    },
    desc: [],
    tasks: [
      it('gtceu:hot_cell'), it('gtceu:fuel_fabrication_plant'), it('gtceu:actinide_partitioning_plant'),
      it('gtceu:high_flux_reactor'), it('gtceu:transuranium_facility'), it('gtceu:isotope_column'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_WAFER', kind: 'process', title: 'Films and Wafers', icon: 'gtceu:zone_refining_tower',
    deps: ['H_ROWS'], x: 3.5, y: 8.25,
    teach: {
      for: 'The &6Diamond Lattice Fab&r, &6Ion Implanter&r, &6Powder-in-Tube Line&r, &6Boron Nitride Reactor&r, &6Synchrotron&r and &6Zone Refining Tower&r each take a mode for the era: nanodiamond, drift rings, superhydride wire, a boron nitride film, silicon nitride lithography and float-zone silicon.',
      needs: 'The UV versions you own, and the new purities.',
      unlocks: 'The detectors, the fibre and the photonic chips.',
      automate: 'Boules and films by bus; recycle what the tower rejects.',
    },
    desc: [],
    tasks: [
      it('gtceu:diamond_lattice_fab'), it('gtceu:ion_implanter'), it('gtceu:powder_in_tube_line'),
      it('gtceu:boron_nitride_reactor'), it('gtceu:synchrotron'), it('gtceu:zone_refining_tower'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_OPT', kind: 'process', title: 'Fibres and Crystals', icon: 'gtceu:fibre_draw_tower',
    deps: ['H_ROWS'], x: 3.5, y: 10.25,
    teach: {
      for: 'The &6Fibre Draw Tower&r, &6MBE Reactor&r, &6Photonic Foundry&r, &6Crystal Growth Furnace&r and &6Spark Plasma Sinterer&r take a new mode each: ytterbium and hollow-core fibre, quantum dots, silicon nitride chips, a garnet and a flux crystal, and the hafnium coil ceramic.',
      needs: 'The UHV controllers and the iridium crucible.',
      unlocks: 'The cooling lasers, the quantum photonic chip and the HfTaCN coil.',
      automate: 'Crystals and chips by bus; recycle the flux.',
    },
    desc: [],
    tasks: [
      it('gtceu:fibre_draw_tower'), it('gtceu:mbe_reactor'), it('gtceu:photonic_foundry'),
      it('gtceu:crystal_growth_furnace'), it('gtceu:spark_plasma_sinterer'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_SWARM', kind: 'process', title: 'A New Star Row', icon: 'gtceu:swarm_control_station',
    deps: ['H_ALPHA_NET'], x: 7, y: -61.25,
    teach: {
      for: 'The &6Swarm Control Station&r and &6Solar Probe Bay&r take an Alpha Centauri A row, and the &6Warp Gate&r takes relay pairs and a heavier load.',
      needs: 'Segments and probes at Alpha Centauri, and the stations built above.',
      unlocks: 'Swarm power at a second star and the gate\'s load for UIV.',
      automate: 'Segments and probes ride the relay; keep the bank sized for the gate\'s hold.',
    },
    desc: [],
    tasks: [it('gtceu:swarm_control_station'), it('gtceu:solar_probe_bay'), it('gtceu:warp_gate')],
    rewards: [xp(150)],
  },
  {
    key: 'H_ALPHA_NET', kind: 'reading', title: 'Alpha Links', icon: 'ae2:quantum_ring',
    deps: ['ALPHA'], x: 4, y: -61.5,
    desc: [
      'The first link from the new star to the network, and the swarm rows.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_SIRIUS_NET', kind: 'reading', title: 'Sirius Link', icon: 'ae2:quantum_ring',
    deps: ['SIRIUS'], x: 14, y: -60.5,
    desc: [
      'The link from the dwarf to the network.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_ROWS', kind: 'reading', title: 'Rows of Chemistry', icon: 'gtceu:extraction_cascade',
    deps: ['H_POWER'], x: 0.5, y: 8,
    desc: [
      'Chemistry, nuclear, wafer and optics rows at industrial scale.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_FUS', kind: 'reading', title: 'The Hotter Ring', icon: 'gtceu:uev_dhe3_plasma_bucket',
    deps: ['H_ROWS'], x: 1, y: 14,
    desc: [
      'Burning the new fuels in the hotter ring.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
];
