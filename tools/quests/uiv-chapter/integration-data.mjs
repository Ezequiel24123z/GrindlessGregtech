// Quest data for uiv_integration ("UIV: Power and Older Machines"): the Mk5 burns and their converter, the wider hatch, the UIV cell and
// network, the Matrioshka's research role and the older machines' new modes (docs/reforge/05_quest_design.md, sections 2 and 3.2;
// docs/eras/uiv.md, "Older machines, new modes", "Power on the wireless network", "Fusion, and what is not fusion", "Nothing one at a time").
// CELL moved here from uiv_age and keeps its key and id; the power chart points at it. The Mk5 ring, the Matrioshka computer and the
// other new machines are taught in uiv_machines; the older-machine rows here ask only for controllers the player already owns.
// Every row starts at a link to the uiv_age quest that opens it, and its first quest depends on that key.
// Positions: columns every 2, rows every 2.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uiv_integration',
  era: 'uiv',
  role: 'integration',
  order: 3,
  icon: 'gtceu:uiv_fusion_reactor',
  autofocus: 'I_FUS1',
  title: 'UIV: Power and Older Machines',
  subtitle: ['Polarised fuel in a Mk5 ring, a wider hatch, a bigger cell, a computer in shells and older machines with new tricks.'],
};

export const LINKS = [
  { key: 'I_L_FUS', ref: 'J_FUSION', x: 0, y: 0 },
  { key: 'I_L_PAR', ref: 'START', x: 0, y: 6 },
  { key: 'I_L_NET', ref: 'START', x: 0, y: 8 },
  { key: 'I_L_MAT', ref: 'J_MERC', x: 0, y: 12 },
  { key: 'I_L_OM1', ref: 'START', x: 0, y: 14 },
  { key: 'I_L_OM2', ref: 'START', x: 0, y: 16 },
  { key: 'I_L_OM3', ref: 'START', x: 0, y: 18 },
  { key: 'I_L_OM4', ref: 'J_MH', x: 0, y: 20 },
  { key: 'I_L_OM5', ref: 'J_LIGHT', x: 0, y: 22 },
  { key: 'I_L_OM6', ref: 'J_LIGHT', x: 0, y: 24 },
  { key: 'I_L_OM7', ref: 'START', x: 0, y: 26 },
  { key: 'I_L_OM8', ref: 'JUMP3', x: 0, y: 28 },
  { key: 'I_L_OM9', ref: 'J_MERC', x: 0, y: 30 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ Mk5 burns and conversion
  {
    key: 'I_FUS1', kind: 'process', title: 'First Mk5 Burn', icon: 'gtceu:he3he3_plasma_bucket',
    deps: ['J_FUSION'], x: 2, y: 0,
    teach: {
      for: 'Polarised helium-3 on helium-3 gives two protons and a helium nucleus. The plasma is the energy: a direct converter takes it as current.',
      needs: 'A formed Mk5 ring, polarised helium-3 from the polariser, and a buffer big enough for the start energy.',
      unlocks: 'The first of three Mk5 power sources for the gate to UXV.',
      automate: 'Helium-3 in by bus; the protons go back to the polarised source.',
    },
    desc: [],
    tasks: [it('gtceu:helium3_polariser'), it('gtceu:he3he3_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'I_FUS2', kind: 'process', title: 'Lithium Burn', icon: 'gtceu:pli6_plasma_bucket',
    deps: ['I_FUS1'], x: 4, y: 0,
    teach: {
      for: 'Polarised lithium hydride pellets burn to helium and a second plasma. The ash still holds helium-3, so it goes through the superfluid plant once more.',
      needs: 'The same ring and converter, and polarised lithium-6 hydride pellets.',
      unlocks: 'A second source that burns no helium-3.',
      automate: 'Pellets by bus from the polarised source; the helium-3 in the ash returns to the first burn.',
    },
    desc: [],
    tasks: [it('gtceu:pli6_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'I_FUS3', kind: 'process', title: 'Nitrogen Burn', icon: 'gtceu:pn15_plasma_bucket',
    deps: ['I_FUS2'], x: 6, y: 0,
    teach: {
      for: 'Protons on nitrogen-15 are the hottest fuel and give the most current per ring. The ash is carbon-12, which the diamond lines take.',
      needs: 'Polarised ammonia ice pellets and a ring with the full set of hatches.',
      unlocks: 'The strongest Mk5 source, and the carbon for diamond.',
      automate: 'Send the carbon-12 straight to the diamond lattice fab.',
    },
    desc: [],
    tasks: [it('gtceu:pn15_plasma_bucket')],
    rewards: [xp(250)],
  },
  {
    key: 'I_DEC', kind: 'process', title: 'Written Final', icon: 'gtceu:direct_energy_converter',
    deps: ['I_FUS3'], x: 8, y: 0,
    teach: {
      for: 'The &6Direct Energy Converter&r takes the three Mk5 plasmas as new rows. Its output is written final, so no generator array doubles it.',
      needs: 'The converter from ZPM and a plasma line for each burn.',
      unlocks: 'The Mk5 figures on the Power tab.',
      automate: 'Plasma by pipe from the ring; keep the converter\'s hatches free of anything else.',
    },
    desc: [],
    tasks: [it('gtceu:direct_energy_converter')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ hatch, cell and network
  {
    key: 'PARH', kind: 'process', title: 'Parallel Control', icon: 'gtceu:uiv_parallel_hatch',
    deps: ['START'], x: 2, y: 6,
    teach: {
      for: 'The &6UIV Parallel Control Hatch&r lets a mega machine run more copies of a recipe at once than the UEV one. Energy is still the limit: every copy pays its own EU/t.',
      needs: 'A machine with a parallel slot and the power for every copy.',
      unlocks: 'Wide runs on the Neutronium Compression Hall and the other mega machines.',
      automate: 'Feed the machine a bus wide enough for the copies it runs.',
    },
    desc: [],
    tasks: [it('gtceu:uiv_parallel_hatch')],
    rewards: [xp(150)],
  },
  {
    key: 'CELL', kind: 'machine', title: 'The UIV Cell', icon: 'grindless:uiv_smes_cell',
    deps: ['START'], x: 2, y: 8,
    teach: {
      for: 'The &6UIV SMES Cell&r holds four times what the UEV cell does, in metallic hydrogen windings.',
      needs: 'The nitride magnet works from UEV and a pulsar-timed repeater to keep the network in step.',
      unlocks: 'The UIV wireless tier.',
      automate: 'Nothing to feed. Size the towers for your busiest hour.',
    },
    desc: [],
    tasks: [it('grindless:uiv_smes_cell'), it('grindless:pulsar_timed_repeater')],
    rewards: [xp(200)],
  },
  {
    key: 'NETUIV', kind: 'process', title: 'The Network Goes UIV', icon: 'gtceu:uiv_wireless_energy_hatch',
    deps: ['CELL'], x: 4, y: 8,
    teach: {
      for: 'Move your towers onto &6UIV SMES Cells&r and the wireless network carries UIV to every station, out to the black hole.',
      needs: 'Every formed tower holding UIV cells: until then the network stays at UEV.',
      unlocks: 'The wireless hatches at UIV, and the gate\'s load for UXV.',
      automate: 'Add cells when the network dips at your busiest hour.',
    },
    desc: [],
    tasks: [it('gtceu:uiv_wireless_energy_hatch'), it('gtceu:uiv_wireless_dynamo_hatch')],
    rewards: [xp(200)],
  },
  {
    key: 'I_GATELOAD', kind: 'milestone', title: 'Sixteen Amps of UIV', icon: 'gtceu:uiv_wireless_energy_hatch',
    deps: ['NETUIV'], x: 6, y: 8,
    desc: [
      'The gate to UXV needs 536,870,912 EU/t for sixty seconds, and the bank loses five per cent on the way in. Two Mk5 rings and a Penrose engine close the sum; four rings do it without the engine. The Power tab shows each source.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ the Matrioshka
  {
    key: 'I_MATR', kind: 'milestone', title: 'Written in Shells', icon: 'gtceu:matrioshka_computer',
    deps: ['J_MERC'], x: 2, y: 12,
    desc: [
      'The &6Matrioshka Computer&r is the only place the charts of this era are written: the equation of state, the navigation solution and the Kerr chart. It runs for a long time on a lot of power, so give it its own tower and a quiet bus. Tick this box once it has made a chart.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ older machines
  {
    key: 'I_OM_METAL', kind: 'process', title: 'Melts, Powders and Fibres', icon: 'gtceu:hot_strip_mill',
    deps: ['START'], x: 2, y: 14,
    teach: {
      for: 'The &6Hot Strip Mill&r, &6Powder Bed Printer&r, &6Electron-Beam Furnace&r, &6Plasma Quench Caster&r, &6Megabar Press&r and &6CVI Furnace&r each take a mode: a canned RHEA slab, an impeller, refined niobium and tin, a sprayed first wall, compacted canisters and a tungsten fibre preform.',
      needs: 'The controllers you already own and the new alloys.',
      unlocks: 'The RHEA parts, the Mk5 first wall and the sleds.',
      automate: 'Slabs and preforms by bus; recycle the powder that is not sintered.',
    },
    desc: [],
    tasks: [
      it('gtceu:hot_strip_mill'), it('gtceu:powder_bed_printer'), it('gtceu:electron_beam_furnace'),
      it('gtceu:plasma_quench_caster'), it('gtceu:megabar_press'), it('gtceu:cvi_furnace'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_CHEM', kind: 'process', title: 'Separations and Syngas', icon: 'gtceu:extraction_cascade',
    deps: ['START'], x: 2, y: 16,
    teach: {
      for: 'The &6Extraction Cascade&r, &6Platinum Plant&r, &6Syngas Plant&r, &6Methane Pyrolyser&r, &6Europium Reductor&r, &6Aerogel Works&r and &6Fluorspar Kiln&r take a new mode each: niobium split, r-process ash cuts, methanation of fusion ash, shock graphite, rare-earth oxides, positronium aerogel and thorium fluoride.',
      needs: 'The controllers you own and the ash from the fusion burns.',
      unlocks: 'The platinum-group cut, the carbon for diamond and the lanthanides.',
      automate: 'Each plant hands its product on by pipe; send the spent ash back to its plant.',
    },
    desc: [],
    tasks: [
      it('gtceu:extraction_cascade'), it('gtceu:platinum_plant'), it('gtceu:syngas_plant'), it('gtceu:methane_pyrolyser'),
      it('gtceu:europium_reductor'), it('gtceu:aerogel_works'), it('gtceu:fluorspar_kiln'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_ISO', kind: 'process', title: 'Heavy Water and Cold Helium', icon: 'gtceu:superfluid_helium_plant',
    deps: ['START'], x: 2, y: 18,
    teach: {
      for: 'The &6Cryogenic Plant&r, &6Heavy Water Plant&r, &6Tritium Removal Facility&r, &6Superfluid Helium Plant&r, &6Calutron&r and &6Pyroprocessing Cell&r take a mode each: para hydrogen, depleted protium, a polish, a solid target, new isotopes and titanium sponge.',
      needs: 'The older controllers and the isotope feeds.',
      unlocks: 'The polarised fuels, the titanium-50 bullet and the cold targets.',
      automate: 'Isotopes by bus; return the helium ash to the plant.',
    },
    desc: [],
    tasks: [
      it('gtceu:cryogenic_plant'), it('gtceu:heavy_water_plant'), it('gtceu:tritium_removal_facility'),
      it('gtceu:superfluid_helium_plant'), it('gtceu:calutron'), it('gtceu:pyroprocessing_cell'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_NUC', kind: 'process', title: 'Heavier Cuts', icon: 'gtceu:hot_cell',
    deps: ['J_MH'], x: 2, y: 20,
    teach: {
      for: 'The &6Fuel Fabrication Plant&r, &6Hot Cell&r, &6Actinide Partitioning Plant&r, &6Transuranium Facility&r, &6Waste Retrieval Plant&r, &6Heavy-Ion Cyclotron&r, &6Recoil Separator&r and &6Superheavy Chemistry Lab&r take new rows: zirconium and flash targets, canisters, einsteinium cuts, synroc and the elements 119 and 120.',
      needs: 'The UEV superheavy chain and the hot-cell feeds.',
      unlocks: 'The californium wheel, census II and the sled canisters.',
      automate: 'Targets and cuts move by bus; the waste canisters go to the sled line.',
    },
    desc: [],
    tasks: [
      it('gtceu:fuel_fabrication_plant'), it('gtceu:hot_cell'), it('gtceu:actinide_partitioning_plant'), it('gtceu:transuranium_facility'),
      it('gtceu:waste_retrieval_plant'), it('gtceu:heavy_ion_cyclotron'), it('gtceu:recoil_separator'), it('gtceu:superheavy_chemistry_lab'),
    ],
    rewards: [xp(150)],
  },
  {
    key: 'I_OM_WAFER', kind: 'process', title: 'Films and Wafers', icon: 'gtceu:diamond_lattice_fab',
    deps: ['J_LIGHT'], x: 2, y: 22,
    teach: {
      for: 'The &6Diamond Lattice Fab&r, &6Ion Implanter&r, &6Zone Refining Tower&r, &6Synchrotron&r, &6MOCVD Reactor&r and &6Boron Nitride Reactor&r each take a mode: C-12 diamond, implants, float-zone silicon, trench lithography, an InGaAsSb film and a coated yarn.',
      needs: 'The UV versions you own, and the new purities.',
      unlocks: 'The silicon-28 chips, the TPV tiles and the nanotube yarn.',
      automate: 'Boules and films by bus; recycle what the tower rejects.',
    },
    desc: [],
    tasks: [
      it('gtceu:diamond_lattice_fab'), it('gtceu:ion_implanter'), it('gtceu:zone_refining_tower'),
      it('gtceu:synchrotron'), it('gtceu:mocvd_reactor'), it('gtceu:boron_nitride_reactor'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_OPT', kind: 'process', title: 'Fibres and Crystals', icon: 'gtceu:fibre_draw_tower',
    deps: ['J_LIGHT'], x: 2, y: 24,
    teach: {
      for: 'The &6Fibre Draw Tower&r, &6MBE Reactor&r, &6Photonic Foundry&r, &6Crystal Growth Furnace&r, &6Spark Plasma Sinterer&r, &6Nuclear Clock Lab&r, &6SNSPD Foundry&r and &6Photonic Integration Hall&r take new modes for the era.',
      needs: 'The UHV and UEV controllers and the iridium crucible.',
      unlocks: 'The erbium fibre, the junction wafer, the tensor core and the optical mainframe.',
      automate: 'Crystals and chips by bus; recycle the flux.',
    },
    desc: [],
    tasks: [
      it('gtceu:fibre_draw_tower'), it('gtceu:mbe_reactor'), it('gtceu:photonic_foundry'), it('gtceu:crystal_growth_furnace'),
      it('gtceu:spark_plasma_sinterer'), it('gtceu:nuclear_clock_lab'), it('gtceu:snspd_foundry'), it('gtceu:photonic_integration_hall'),
    ],
    rewards: [xp(150)],
  },
  {
    key: 'I_OM_MAG', kind: 'process', title: 'Magnets and Wire', icon: 'gtceu:hts_magnet_works',
    deps: ['START'], x: 2, y: 26,
    teach: {
      for: 'The &6Coated Conductor Line&r, &6HTS Magnet Works&r, &6Naquadria Magnet Works&r and &6Nitride Magnet Works&r take a mode each: a gadolinium precursor, a seeded bulk magnet, a metallic hydrogen winding and a field-cooled coil.',
      needs: 'The older magnet controllers and the new windings.',
      unlocks: 'The Mk5 coils, the metallic hydrogen cable and the UIV cell.',
      automate: 'Windings by bus; keep the cooling lines separate.',
    },
    desc: [],
    tasks: [
      it('gtceu:coated_conductor_line'), it('gtceu:hts_magnet_works'), it('gtceu:naquadria_magnet_works'), it('gtceu:nitride_magnet_works'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_SENSE', kind: 'process', title: 'Listening to Black Holes', icon: 'gtceu:event_horizon_interferometer',
    deps: ['JUMP3'], x: 2, y: 28,
    teach: {
      for: 'The &6Gravitational-Wave Detector&r, &6Event Horizon Interferometer&r, &6Deep Space Network&r and &6Pulsar Timing Station&r take a row each: a ringdown record, a correlated Kerr record, timed pulse profiles and a clock discipline.',
      needs: 'The probe data from Cygnus X-1 and the profiles from the pulsar.',
      unlocks: 'The Kerr chart and the navigation solution.',
      automate: 'Records come home by ME; the Matrioshka takes them from there.',
    },
    desc: [],
    tasks: [
      it('gtceu:gravitational_wave_detector'), it('gtceu:event_horizon_interferometer'), it('gtceu:deep_space_network'), it('gtceu:pulsar_timing_station'),
    ],
    rewards: [xp(150)],
  },
  {
    key: 'I_OM_LAUNCH', kind: 'process', title: 'Seeds, Ribbons and Rows', icon: 'gtceu:laser_sail_launcher',
    deps: ['J_MERC'], x: 2, y: 30,
    teach: {
      for: 'The &6Laser Sail Launcher&r, &6Starchip Fab&r, &6Antimatter Trap&r, &6Positron Accumulator&r, &6Tether Ribbon Works&r, &6Swarm Control Station&r and &6Warp Gate&r take a row for the era: relay seeds, probes, stored positronium, a crust tether, a Mercury swarm and the jumps.',
      needs: 'The stations you built for UHV and UEV.',
      unlocks: 'The jumps to the three dead stars and the swarm power at Mercury.',
      automate: 'Seeds and probes ride the relay; keep the bank sized for the gate\'s hold.',
    },
    desc: [],
    tasks: [
      it('gtceu:laser_sail_launcher'), it('gtceu:starchip_fab'), it('gtceu:antimatter_trap'), it('gtceu:positron_accumulator'),
      it('gtceu:tether_ribbon_works'), it('gtceu:swarm_control_station'), it('gtceu:warp_gate'),
    ],
    rewards: [xp(150)],
  },
];
