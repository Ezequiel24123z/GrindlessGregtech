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

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.integration,
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
    deps: ['START'], x: 2, y: 0,
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
      for: 'The network runs at its strongest cell, so one &6UV SMES Cell&r makes it carry UV. The new hatches draw from it wherever the network reaches, out to the stations too.',
      needs: 'The gravi star as the link, and at least one UV cell in a formed tower: until then the network stays at ZPM.',
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
  // The thorium cycle as one story: solvent, THOREX, nitrogen-15 and the nitride, pellets and pins, the burn, pyroprocessing, the 27-day hold, uranium-233.
  {
    key: 'I_TBP', kind: 'process', title: 'Purify First', icon: 'gtceu:tbp_solvent_bucket',
    deps: ['START'], x: 4, y: 1.5,
    teach: {
      for: 'Reactor thorium cannot be used as mined: the rare earths that travel with it are neutron poisons, and they would stall the core. The cure is a solvent, &6TBP&r (tributyl phosphate) in kerosene, that carries thorium and nothing else.',
      needs: 'Propene, hydrogen and carbon monoxide in the oxo process (butyraldehyde, hydrogenated over a nickel catalyst that is kept, to n-butanol), phosphoryl chloride to esterify it, and kerosene to dilute it to 30% TBP.',
      unlocks: 'The THOREX extraction. The hydrochloric acid from the esterification goes to your chlorine chemistry.',
      automate: 'The solvent is never used up: it goes round the extraction, so make one batch and top it up by pipe.',
    },
    desc: [],
    tasks: [it('gtceu:n_butanol_bucket'), it('gtceu:tributyl_phosphate_bucket'), it('gtceu:tbp_solvent_bucket')],
    rewards: [xp(80)],
  },
  {
    key: 'I_THOREX', kind: 'process', title: 'THOREX to Thoria', icon: 'gtceu:thoria_dust',
    deps: ['I_TBP'], x: 6, y: 1.5,
    teach: {
      for: 'Thorium dissolved in nitric acid is crude thorium nitrate. The solvent takes the thorium out and the poisons stay behind in the raffinate as lanthanide nitrate; distilled water strips it back as nuclear-grade &6Thorium Nitrate&r. Oxalate precipitates it, and the EBF calcines the oxalate to &6Thoria&r.',
      needs: 'Thorium dust, nitric acid, the TBP solvent, distilled water and oxalate.',
      unlocks: 'Thoria, the oxide fuel route that needs no nitrogen-15. The lanthanide nitrate is not waste: it feeds the EV rare-earth cascade, and the nitric acid goes back to the dissolution.',
      automate: 'Two tanks and a loop: solvent in a circle, acid in a circle, thoria out by ME.',
    },
    desc: [],
    tasks: [it('gtceu:crude_thorium_nitrate_bucket'), it('gtceu:thorium_nitrate_bucket'), it('gtceu:thorium_oxalate_dust'), it('gtceu:thoria_dust')],
    rewards: [xp(100)],
  },
  {
    key: 'I_NIT', kind: 'process', title: 'Nitrogen-15 and the Nitride', icon: 'gtceu:thorium_mononitride_dust',
    deps: ['I_THOREX'], x: 8, y: 1.5,
    teach: {
      for: 'A thorium nitride core breeds better than oxide, but ordinary nitrogen-14 eats neutrons: the nitride has to be made with nitrogen-15. Triton\'s geysers are rich in it. Burn the Triton nitrogen to nitric oxide, distil the nitrogen-15 oxide out in the EV cryogenic plant and reduce it with hydrogen; the tholin comes out as a by-product for its own reformer.',
      needs: 'The Triton geyser sampler from Neptune orbit, thoria, carbon and the nitrogen-15 itself: carbothermic nitridation runs under it, and the carbon monoxide goes to the syngas plant.',
      unlocks: 'Thorium nitride dust and, with the next quest, the nitride assembly.',
      automate: 'The spent nitride gives its nitrogen-15 back at the pyroprocessing cell, so after the first fill you only top it up.',
    },
    desc: [],
    tasks: [it('gtceu:nitrogen_15_bucket'), it('gtceu:thorium_mononitride_dust')],
    rewards: [xp(100)],
  },
  {
    key: 'I_PIN', kind: 'process', title: 'Pellets, Pins, Assemblies', icon: 'grindless:thorium_nitride_fuel_pin',
    deps: ['I_NIT'], x: 10, y: 1.5,
    teach: {
      for: 'Thoria is sintered with a niobia aid into pellets and the nitride is pressed and sintered under a nitrogen-15 flush. Pellets go into &6cladding tubes&r of 15-15Ti steel, helium-bonded and welded into pins, and the pins and their grids into assemblies.',
      needs: 'Either powder, cladding tube (stainless steel and titanium), and the fuel fabrication plant. The oxide assembly breeds less and burns shorter; the nitride assembly breeds better.',
      unlocks: 'Fuel for the accelerator-driven reactor. Oxide works the moment you have thoria, so you can start before Triton.',
      automate: 'Pellets, pins and assemblies are three steps of the same plant; leave the output on ME and let the reactor draw from it.',
    },
    desc: [],
    tasks: [it('grindless:thoria_pellet'), it('grindless:thorium_nitride_pellet'), it('grindless:thorium_oxide_fuel_assembly'), it('grindless:thorium_nitride_fuel_assembly')],
    rewards: [xp(100)],
  },
  {
    key: 'I_THOR', kind: 'process', title: 'The Thorium Burn', icon: 'grindless:thorium_oxide_fuel_assembly',
    deps: ['I_PIN'], x: 12.5, y: 3,
    teach: {
      for: 'Thorium is fertile, not fissile: a core of it cannot sustain itself. The accelerator-driven reactor supplies the missing neutrons with a proton beam on a lead-bismuth pool (never used up), so the core stays subcritical and stops when the beam stops. About six assemblies an hour, four and a half on nitride; IV\'s stored thorium decides how many reactors run. Contain the polonium-210 until it decays.',
      needs: 'The reactor, and assemblies from the pin line.',
      unlocks: 'The biggest steady power of the era, with fission products as the only waste, and spent fuel for the pyroprocessing cell.',
      automate: 'Spent assemblies go to the pyroprocessing cell and come back as fuel: close the loop before you scale.',
    },
    desc: [],
    tasks: [it('gtceu:accelerator_driven_reactor'), ck()],
    rewards: [xp(100)],
  },
  {
    key: 'I_PYRO', kind: 'process', title: 'Chop and Electrorefine', icon: 'grindless:u233_cathode_deposit',
    deps: ['I_THOR'], x: 14.5, y: 4,
    teach: {
      for: 'The pyroprocessing cell works spent fuel in three hot cells behind lead glass. It chops the assemblies into fragments (the hulls are waste), reduces oxide fragments to thorium-uranium metal with lithium, and electrorefines the metal in molten lithium chloride, and the bred uranium collects on the cathode.',
      needs: 'The pyroprocessing cell, an argon supply and lithium. The nitride fragments skip the reduction and go straight to the refiner, giving back their thorium and nitrogen-15 on the way.',
      unlocks: 'The cathode deposit, which is distilled free of salt into the uranium ingots. Keep some for UHV.',
      automate: 'Fragments, salt and metal never leave the cell: feed spent fuel in by ME and take thorium and nitrogen-15 back to their dissolution and cryogenic plant.',
    },
    desc: [],
    tasks: [it('grindless:spent_oxide_fragments'), it('grindless:spent_nitride_fragments'), it('gtceu:thorium_uranium_metal_dust'), it('grindless:u233_cathode_deposit')],
    rewards: [xp(100)],
  },
  {
    key: 'I_HOLD', kind: 'process', title: 'The 27-Day Hold', icon: 'gtceu:protactinium_bismuth_bucket',
    deps: ['I_PYRO'], x: 14.5, y: 5.5,
    teach: {
      for: 'A quarter of the uranium-233 is not in the cathode: it is still protactinium-233 in the loaded salt. Lithium pulls the protactinium into bismuth, and it has to sit for 27 days while it decays to uranium-233. Rush it and you lose that quarter.',
      needs: 'The loaded salt from the refiner, and a tank that can wait. The clean salt goes back into the cell, and the radioactive waste goes to the waste store.',
      unlocks: 'The last of the uranium, smelted together with the cathode ingots. It is also the seed that grows thorium-229 in UHV.',
      automate: 'Run several holding tanks in rotation so one is always ready; the output merges with the cathode line.',
    },
    desc: [],
    tasks: [it('gtceu:protactinium_bismuth_bucket'), it('gtceu:uranium_233_dust')],
    rewards: [xp(100)],
  },
  {
    key: 'I_U233', kind: 'process', title: 'Back to Uranium-233', icon: 'gtceu:fuel_fabrication_plant',
    deps: ['I_PYRO', 'I_HOLD'], x: 16.5, y: 4,
    teach: {
      for: "The IV &6Fuel Fabrication Plant&r learns three thorium rows, and a uranium rod for IV's fission reactor: the end of the thorium cycle.",
      needs: 'The uranium ingots from the cathode and the hold, and the fuel fabrication plant.',
      unlocks: 'A fission reactor that burns what the thorium bred.',
      automate: 'Send the bred metal straight to the plant and the spent rods back to the cell.',
    },
    desc: [],
    tasks: [it('gtceu:fuel_fabrication_plant'), it('gtceu:uranium_233_ingot'), it('grindless:u233_fuel_rod')],
    rewards: [xp(100)],
  },
  {
    key: 'I_MUON', kind: 'process', title: 'Tritium Comes Back', icon: 'grindless:lithium_breeder_blanket',
    deps: ['START'], x: 6, y: 2,
    teach: {
      for: 'A &6Muon Fusion Cell&r burns liquid deuterium and tritium, and its lithium blanket breeds most of the tritium back. The rest is IV\'s tritium removal facility\'s work.',
      needs: 'The cell from further up, deuterium and tritium by pipe, and a linac behind it.',
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
      for: 'The &6Laser Fusion Chamber&r burns one fuel capsule per shot. Lead-boron capsules take 400 ticks, about 180 an hour; deuterium and helium-3 capsules take 600, about 120 an hour, and also give off hydrogen.',
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
    deps: ['START'], x: 2, y: 4,
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
    deps: ['STN5'], x: 2, y: 6,
    desc: [
      "Neptune orbit gets its own &6AE2 pair&r, so what the station makes goes home and what it needs comes out. Power doesn't need it: the wireless network already carries that.",
    ],
    tasks: [ck()],
    rewards: [xp(80)],
  },
  {
    key: 'I_AE2', kind: 'step', title: 'Pluto on the Network', icon: 'grindless:station_truss_casing',
    deps: ['I_AE1', 'STN6'], x: 2, y: 8,
    desc: [
      'Same again at Pluto orbit. Both stations send hydrogen, helium, nitrogen and noble gases by the tankful, so fluid cells and extra coprocessors matter more than item storage. Chunk-load them both: the far machines only run while their chunks are loaded.',
    ],
    tasks: [ck()],
    rewards: [xp(80)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
