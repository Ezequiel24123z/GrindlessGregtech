// Quest data for uv_integration ("UV: Power and Scale"): the third fusion ring and its metals, the era's fuel chains, the network tier and the
// parallel hatch, the older machines' new modes and the AE2 step (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uv.md, "Route",
// "Older machines, new modes", "Power on the wireless network", "Nothing one at a time", "AE2 between planets: the UV step").
// MK3, AMLP, NEUT, GRAVI, NETUV, PAR, B11, CAPS and N15 moved here from uv_age and keep their keys and ids; the power chart still points at MK3.
// The plants themselves (ADR, ALPHA, MUCF) are taught in uv_machines; the quests here teach their fuel chains and ask only for the controller.
// Every row starts at a link to the uv_age quest that opens it, and its first quest depends on that quest.
// Positions: columns every 2, rows every 2.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uv_integration',
  era: 'uv',
  role: 'integration',
  order: 3,
  icon: 'gtceu:uv_fusion_reactor',
  autofocus: 'MK3',
  title: 'UV: Power and Scale',
  subtitle: ['A third ring and its neutronium, three fuel chains for three plants, the network at UV, six older machines with new tricks and two more stations on AE2.'],
};

export const LINKS = [
  { key: 'I_L_FUS', ref: 'START', x: 0, y: 0 },
  { key: 'I_L_PW', ref: 'START', x: 0, y: 2 },
  { key: 'I_L_OM', ref: 'START', x: 0, y: 4 },
  { key: 'I_L_AE1', ref: 'STN5', x: 0, y: 6 },
  { key: 'I_L_AE2', ref: 'STN6', x: 0, y: 8 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ the third ring and the network
  {
    key: 'MK3', kind: 'signature', title: 'Third Ring', icon: 'gtceu:uv_fusion_reactor',
    deps: ['I_L_FUS'], x: 2, y: 0,
    teach: {
      for: 'The &6Fusion Reactor Mk3&r is a bigger ring that lights plasmas the Mk2 cannot start.',
      needs: 'Sixteen UV energy hatches on the network for a 640 M start, and four wetware mainframes in the build.',
      unlocks: 'Americium, neutronium and the UV wireless tier.',
      automate: 'Feed it from tanks by pipe, and keep the hatches topped from the network.',
    },
    desc: [],
    tasks: [it('gtceu:uv_fusion_reactor'), it('gtceu:uv_energy_input_hatch', 16)],
    rewards: [xp(150)],
  },
  {
    key: 'AMLP', kind: 'process', title: 'Americium Loop', icon: 'gtceu:americium_plasma_bucket',
    deps: ['MK3'], x: 4, y: 0,
    teach: {
      for: 'Plutonium-241 and hydrogen fuse into &6Americium&r plasma, and a plasma turbine turns the heat into power on the way out.',
      needs: 'Plutonium-241 from IV, and a turbine on the Mk3\'s plasma output.',
      unlocks: 'Neutronium, and the americium the next ring also asks for.',
      automate: 'The cooled metal goes straight back in: pipe the plasma out, the ingots to ME.',
    },
    desc: [],
    tasks: [it('gtceu:plutonium_241_ingot'), it('gtceu:americium_plasma_bucket'), it('gtceu:americium_ingot')],
    rewards: [xp(100)],
  },
  {
    key: 'NEUT', kind: 'step', title: 'Neutronium', icon: 'gtceu:neutronium_ingot',
    deps: ['AMLP'], x: 6, y: 0,
    desc: [
      "Americium and naquadria start the hottest burn the Mk3 runs, and &6Neutronium&r comes out. It's the densest metal you'll handle, and UV's parts are full of it.",
    ],
    tasks: [it('gtceu:neutronium_ingot')],
    rewards: [xp(120)],
  },
  {
    key: 'GRAVI', kind: 'step', title: 'Gravi Star', icon: 'gtceu:gravi_star',
    deps: ['NEUT'], x: 8, y: 0,
    desc: [
      "A &6Gravi Star&r is a nether star wrapped in neutronium. It's the link the UV wireless network is built on.",
    ],
    tasks: [it('gtceu:gravi_star')],
    rewards: [xp(100)],
  },
  {
    key: 'NETUV', kind: 'machine', title: 'The Network Goes UV', icon: 'grindless:uv_smes_cell',
    deps: ['GRAVI'], x: 10, y: 0,
    teach: {
      for: 'Move your towers onto &6UV SMES Cells&r and the wireless network carries UV. The new hatches draw from it wherever the network reaches, out to the stations too.',
      needs: 'The gravi star as the link, and every formed tower holding UV cells: until then the network stays at ZPM.',
      unlocks: 'Stations at Neptune and Pluto that run on power made at home.',
      automate: 'Nothing to feed: size the cells for your busiest hour and add more when it dips.',
    },
    desc: [],
    tasks: [it('grindless:uv_smes_cell'), it('gtceu:uv_wireless_energy_hatch')],
    rewards: [xp(150)],
  },
  {
    key: 'PAR', kind: 'machine', title: 'Wider Still', icon: 'gtceu:uv_parallel_hatch', size: 0.75, optional: true,
    deps: ['NETUV'], x: 12, y: 0,
    teach: {
      for: 'The &6UV Parallel Hatch&r runs far more recipes side by side in the plants that take one. The big generators and the single-shot probe bays do not.',
      needs: 'A machine that accepts one, and power to match: full parallel is a network job.',
      unlocks: 'Throughput without another hall.',
      automate: 'Bigger batches need bigger input buffers: check that your pipes keep up.',
    },
    desc: [],
    tasks: [it('gtceu:uv_parallel_hatch')],
    rewards: [xp(60)],
  },

  // ------------------------------------------------------------------ three fuel chains
  {
    key: 'I_THOR', kind: 'process', title: 'The Thorium Burn', icon: 'grindless:thorium_oxide_fuel_assembly',
    deps: ['I_L_PW'], x: 2, y: 2,
    teach: {
      for: 'Thorium assemblies feed the accelerator-driven reactor: about six an hour, four and a half on nitride. IV\'s stored thorium and its live output decide how many reactors run.',
      needs: 'The reactor from the machines chapter, and assemblies from the fuel fabrication plant.',
      unlocks: 'The biggest steady power of the era, with fission products as the only waste.',
      automate: 'Spent assemblies go to the pyroprocessing cell and come back as fuel: close the loop before you scale.',
    },
    desc: [],
    tasks: [it('gtceu:accelerator_driven_reactor'), ck()],
    rewards: [xp(100)],
  },
  {
    key: 'I_U233', kind: 'process', title: 'Back to Uranium-233', icon: 'gtceu:fuel_fabrication_plant',
    deps: ['I_THOR'], x: 4, y: 2,
    teach: {
      for: "The IV &6Fuel Fabrication Plant&r learns three thorium rows, and a U-233 rod for IV's fission reactor.",
      needs: 'Thorium dust, oxygen, carbon and nitrogen-15, and the uranium-233 the pyroprocessing cell hands back.',
      unlocks: 'Thorium oxide and nitride assemblies, and a fission reactor that burns what the thorium bred.',
      automate: 'Send the bred metal straight to the plant and the spent rods back to the cell.',
    },
    desc: [],
    tasks: [it('gtceu:fuel_fabrication_plant'), it('gtceu:uranium_233_ingot')],
    rewards: [xp(100)],
  },
  {
    key: 'I_MUON', kind: 'process', title: 'Tritium Comes Back', icon: 'grindless:lithium_breeder_blanket',
    deps: ['I_L_PW'], x: 6, y: 2,
    teach: {
      for: 'A &6Muon Fusion Cell&r burns liquid deuterium and tritium, and its lithium blanket breeds most of the tritium back. The rest is IV\'s tritium removal facility\'s work.',
      needs: 'The cell from the machines chapter, deuterium and tritium by pipe, and a linac behind it.',
      unlocks: 'Power with no fission and almost no waste. The cell is an extrapolation: real muons are lost too soon.',
      automate: 'Watch the make-up tritium: when the facility lags, the cell starves.',
    },
    desc: [],
    tasks: [it('gtceu:muon_fusion_cell'), ck()],
    rewards: [xp(100)],
  },
  {
    key: 'I_LASER', kind: 'process', title: 'A Capsule a Shot', icon: 'gtceu:laser_fusion_chamber',
    deps: ['CAPS'], x: 8, y: 2,
    teach: {
      for: 'The &6Laser Fusion Chamber&r burns one fuel capsule per shot, about 180 an hour, and helium-4 is the only exhaust.',
      needs: 'Capsules from the lattice fab, and fibre laser modules that wear by about two percent a shot.',
      unlocks: 'The largest single plant of the era, and a reason to scale the lattice fab.',
      automate: 'The fab\'s throughput is the cap by design: store capsules in ME and keep spare modules.',
    },
    desc: [],
    tasks: [it('gtceu:laser_fusion_chamber'), ck()],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ older machines, new modes
  {
    key: 'B11', kind: 'process', title: 'Boron-11', icon: 'gtceu:hot_cell',
    deps: ['I_L_OM'], x: 2, y: 4,
    teach: {
      for: "The IV &6Hot Cell&r learns a boron mode: four boron trifluoride in, one boron-11 trifluoride and a little boron-10 out.",
      needs: 'Boron trifluoride from the centrifuges and the next free circuit in the cell.',
      unlocks: 'Decaborane for the capsules, and boron-10 for the nanotube reactor.',
      automate: 'The fluorine leaves as acid the rest of your chemistry takes: pipe the boron-10 on.',
    },
    desc: [],
    tasks: [it('gtceu:hot_cell'), it('gtceu:boron_11_trifluoride_bucket')],
    rewards: [xp(80)],
  },
  {
    key: 'CAPS', kind: 'process', title: 'Diamond Capsules', icon: 'grindless:pb11_capsule',
    deps: ['B11'], x: 4, y: 4,
    teach: {
      for: 'The ZPM &6Diamond Lattice Fab&r grows a fuel capsule round decaborane, or round deuterium and helium-3 for the other burn.',
      needs: 'Decaborane from the hot cell, or deuterium and helium-3 from Neptune, plus the new circuits in the fab.',
      unlocks: 'Every shot of the laser chamber.',
      automate: 'Every shot spends one: automate the capsules first and let ME hold a day\'s worth.',
    },
    desc: [],
    tasks: [it('gtceu:diamond_lattice_fab'), it('grindless:pb11_capsule'), it('grindless:d_he3_capsule')],
    rewards: [xp(100)],
  },
  {
    key: 'N15', kind: 'process', title: 'Nitrogen-15', icon: 'gtceu:cryogenic_plant',
    deps: ['CAPS'], x: 6, y: 4,
    teach: {
      for: "The EV &6Cryogenic Plant&r splits nitric oxide into nitrogen-15 and nitrogen-14 oxide, and Kuiper noble gas into argon, krypton and xenon.",
      needs: "Nitric oxide from Triton's nitrogen, and the two UV rows in the plant.",
      unlocks: 'Thorium nitride, which breeds better, and the krypton for the thrusters.',
      automate: 'The pyroprocessing cell hands the nitrogen back: loop it to the plant.',
    },
    desc: [],
    tasks: [it('gtceu:cryogenic_plant'), it('gtceu:nitrogen_15_bucket')],
    rewards: [xp(100)],
  },
  {
    key: 'I_YB', kind: 'process', title: 'Ytterbium Strip', icon: 'gtceu:extraction_cascade',
    deps: ['N15'], x: 8, y: 4,
    teach: {
      for: 'The EV &6Extraction Cascade&r strips ytterbium oxide out of the mixed rare-earth chloride and sends the chloride back.',
      needs: 'Mixed rare-earth chloride from the monazite line, and the next free circuit in the cascade.',
      unlocks: 'The fibre draw tower and every laser built on its fibre.',
      automate: 'Loop the chloride back to the monazite line and send the oxide to ME.',
    },
    desc: [],
    tasks: [it('gtceu:extraction_cascade'), it('gtceu:ytterbium_oxide_dust')],
    rewards: [xp(100)],
  },
  {
    key: 'I_AERO', kind: 'process', title: 'Carbon Shell', icon: 'grindless:carbon_carbon_aeroshell',
    deps: ['I_YB'], x: 10, y: 4,
    teach: {
      for: 'The HV &6Composite Autoclave&r bakes carbon fibre and pitch into a &6Carbon-Carbon Aeroshell&r, the skin a probe needs where a heat shield melts.',
      needs: "Carbon fibre from ZPM's tholin reformer and pitch, and the next free circuit in the autoclave.",
      unlocks: 'The thruster works and the probes that fly to the heliopause.',
      automate: 'Shells are bulky: let ME hold them and the probe bays pull what they need.',
    },
    desc: [],
    tasks: [it('gtceu:composite_autoclave'), it('grindless:carbon_carbon_aeroshell')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ AE2 between planets
  {
    key: 'I_AE1', kind: 'step', title: 'Neptune on the Network', icon: 'grindless:station_truss_casing',
    deps: ['I_L_AE1'], x: 2, y: 6,
    desc: [
      "Neptune orbit gets its own &6AE2 pair&r, so what the station makes goes home and what it needs comes out. Power doesn't need it: the wireless network already carries that.",
    ],
    tasks: [ck()],
    rewards: [xp(80)],
  },
  {
    key: 'I_AE2', kind: 'step', title: 'Pluto on the Network', icon: 'grindless:station_truss_casing',
    deps: ['I_AE1', 'I_L_AE2'], x: 2, y: 8,
    desc: [
      'Same again at Pluto orbit. Both stations send hydrogen, helium, nitrogen and noble gases by the tankful, so fluid cells and extra coprocessors matter more than item storage. Chunk-load them both: the far machines only run while their chunks are loaded.',
    ],
    tasks: [ck()],
    rewards: [xp(80)],
  },
];
