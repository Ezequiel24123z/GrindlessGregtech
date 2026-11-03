// Quest data for uxv_integration ("UXV: Power and Older Machines"): the Mk6 burns and their ash, the two generators, the UXV cell and network,
// the parallel hatch, the stellar fractionation hall and the older machines' new modes (docs/reforge/05_quest_design.md, sections 2 and 3.2;
// docs/eras/uxv.md, "Older machines, new modes", "Power", "Fusion", "Nothing one at a time", "AE2").
// BZ, TAP, CELL, PAR, HALL and MK6C4 moved here from uxv_age and keep their keys and ids; the power chart points at BZ, TAP and CELL by id.
// The Mk6 ring and the other machines of the era are taught in uxv_machines; the older-machine rows here ask only for controllers the
// player already owns. AE2 has no new step at UXV (the arrival platforms seed it as at UIV), so there is no AE2 quest.
// Every row starts at a link to the uxv_age quest that opens it, and its first quest depends on that key.
// Positions: columns every 2, rows every 2 or more.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.integration,
  filename: 'uxv_integration',
  era: 'uxv',
  role: 'integration',
  order: 3,
  icon: 'gtceu:uxv_fusion_reactor',
  autofocus: 'FUSC1',
  title: 'UXV: Power and Older Machines',
  subtitle: ['A star\'s burning stages in a ring, a black hole and a pulsar as power plants, a wider hatch and older machines with new tricks.'],
};

export const LINKS = [
  { key: 'I_L_FUS', ref: 'J_FUSION', x: 0, y: 0 },
  { key: 'I_L_BZ', ref: 'FRC', x: 0, y: 3 },
  { key: 'I_L_TAP', ref: 'JUMPV', x: 0, y: 5 },
  { key: 'I_L_PAR', ref: 'START', x: 0, y: 8 },
  { key: 'I_L_NET', ref: 'START', x: 0, y: 10 },
  { key: 'I_L_OM1', ref: 'START', x: 0, y: 13 },
  { key: 'I_L_OM2', ref: 'J_SUPER', x: 0, y: 15 },
  { key: 'I_L_OM3', ref: 'J_SPIN', x: 0, y: 17 },
  { key: 'I_L_OM4', ref: 'J_SPIN', x: 0, y: 19 },
  { key: 'I_L_OM5', ref: 'J_SUPER', x: 0, y: 21 },
  { key: 'I_L_OM6', ref: 'ARM', x: 0, y: 23 },
  { key: 'I_L_OM7', ref: 'SEED', x: 0, y: 25 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ Mk6 burns and ash
  {
    key: 'FUSC1', kind: 'process', title: 'Hot CNO', icon: 'gtceu:cno_ash_plasma_bucket',
    deps: ['J_FUSION'], x: 2, y: 0,
    teach: {
      for: 'The first burn of the &6Mk6 Fusion Reactor&r runs on the stellar hydrogen and CNO cuts and gives CNO ash plasma, which the converter takes as current.',
      needs: 'A formed Mk6 ring on UXV hatches and both cuts from Cygnus X-1. The ring refuses a run when its start energy is above what it stores.',
      unlocks: 'Current for the gate, and a little CNO cut back from the converter for the next run.',
      automate: 'Cuts arrive over AE2 from the filter; the ash goes straight to the converter.',
    },
    desc: [],
    tasks: [it('gtceu:cno_ash_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'FUSC2', kind: 'process', title: 'Triple Alpha', icon: 'gtceu:helium_burning_ash_plasma_bucket',
    deps: ['FUSC1'], x: 4, y: 0,
    teach: {
      for: 'Three helium nuclei make carbon, and carbon takes a fourth to make oxygen. The ring burns triple-alpha fuel, which the cryogenic plant on the Moon makes from the stellar helium cut.',
      needs: 'Triple-alpha fuel from the Moon\'s cryogenic plant, and the same ring and converter as before.',
      unlocks: 'Carbon-12 and oxygen-16, the fuels of the next two burns.',
      automate: 'Send the carbon and oxygen to their own lines. Both are fuel, not waste.',
    },
    desc: [],
    tasks: [it('gtceu:helium_burning_ash_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'FUSC3', kind: 'process', title: 'Carbon Burning', icon: 'gtceu:carbon_burning_ash_plasma_bucket',
    deps: ['FUSC2'], x: 6, y: 0,
    teach: {
      for: 'The third burn lights carbon vapour from the electron beam furnace and leaves neon, sodium and magnesium once the converter is done.',
      needs: 'Carbon-12 vapour by pipe, and a quench caster to catch the ash.',
      unlocks: 'Ordinary neon, sodium and magnesium for stock.',
      automate: 'Ash goes to storage; nothing in it is dangerous.',
    },
    desc: [],
    tasks: [it('gtceu:carbon_burning_ash_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'MK6C4', kind: 'process', title: 'Oxygen Burning', icon: 'gtceu:oxygen_burning_ash_plasma_bucket',
    deps: ['FUSC3'], x: 8, y: 0,
    teach: {
      for: 'The fourth burn is the last stage the ring runs. Its ash leaves silicon, sulfur and phosphorus once the converter and the quench caster are done with it.',
      needs: 'Oxygen-16 fuel, liquefied by the cryogenic plant on the Moon, and a ring that has survived the stages before.',
      unlocks: 'Silicon-28 for the next era and the biggest plasma payout of the ring.',
      automate: 'Keep oxygen on its own line from the plant, and send the silicon to storage.',
    },
    desc: [],
    tasks: [it('gtceu:oxygen_burning_ash_plasma_bucket')],
    rewards: [xp(250)],
  },
  {
    key: 'I_OM_DEC', kind: 'process', title: 'Ash Into Power', icon: 'gtceu:direct_energy_converter',
    deps: ['MK6C4'], x: 10, y: 0,
    teach: {
      for: 'The &6Direct Energy Converter&r takes four Mk6 plasmas and returns current plus ash, and the &6Plasma Quench Caster&r splits that ash into stock. Both are older machines with new rows.',
      needs: 'The plasma buckets of the four burns. The converter\'s output is not doubled by a generator array.',
      unlocks: 'Current from the Mk6 burns, and ash for stock.',
      automate: 'Plasma by pipe from the ring; leave the converter\'s hatches free of anything else.',
    },
    desc: [],
    tasks: [it('gtceu:direct_energy_converter'), it('gtceu:plasma_quench_caster')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ the two generators
  {
    key: 'I_BZ', kind: 'plant', title: 'Spin Down a Black Hole', icon: 'gtceu:bz_dynamo',
    deps: ['FRC'], x: 2, y: 3,
    teach: {
      for: 'A spinning black hole threaded by a magnetic field drives a current, and the hole slows to pay for it. The &6BZ Dynamo&r burns flux-loaded plasma, which the FRC former makes from filtered disk plasma, at Cygnus X-1 only.',
      needs: 'Flux-loaded plasma from the FRC former and a 16 A UXV dynamo hatch. It works in orbit at Cygnus X-1 and nowhere else.',
      unlocks: 'The largest single source of the era, a good part of the gate\'s draw.',
      automate: 'Cartridges and plasma come from the same line at Cygnus; the power rides the wireless network home.',
    },
    desc: [
      'The dynamo is fiction: nobody has tapped a black hole\'s spin. The Blandford-Znajek process it is named for is real.',
    ],
    tasks: [it('gtceu:flux_loaded_plasma_bucket')],
    rewards: [xp(250)],
  },
  {
    key: 'I_TAP', kind: 'plant', title: 'Tap the Polar Cap', icon: 'gtceu:polar_cap_tap',
    deps: ['JUMPV'], x: 2, y: 5,
    teach: {
      for: 'Above a pulsar\'s magnetic poles the field tears charges off the surface. The &6Polar Cap Tap&r lowers a &6Lasagna Electrode&r into that current and burns through it, at Vela only.',
      needs: 'A fresh electrode for each run, and a place on the Vela platform. It has no sunlight to spare and does not need any.',
      unlocks: 'The second source of the gate\'s draw, and one that costs no fuel but the electrode.',
      automate: 'Electrodes are laminated on the spot; the output rides the wireless network.',
    },
    desc: [],
    tasks: [it('grindless:lasagna_electrode')],
    rewards: [xp(250)],
  },

  // ------------------------------------------------------------------ hatch and hall
  {
    key: 'PAR', kind: 'process', title: 'Parallel Control', icon: 'gtceu:uxv_parallel_hatch',
    deps: ['START'], x: 2, y: 8,
    teach: {
      for: 'The &6Extreme Parallel Control Hatch&r lets a machine that takes parallel hatches run up to 65,536 copies of one recipe at once, each at its own EU/t. It is the most expensive hatch of the era.',
      needs: 'A UXV hull, UXV circuits, a field generator, an emitter, metallic hydrogen cable, RHEA plates and FFKM seals on the assembly line, researched on the Insane hatch. Then power for every copy.',
      unlocks: 'The stellar fractionation hall at full width.',
      automate: 'Give the machine a bus wide enough for the copies it will run.',
    },
    desc: [],
    tasks: [it('gtceu:uxv_parallel_hatch')],
    rewards: [xp(200)],
  },
  {
    key: 'HALL', kind: 'plant', title: 'Stellar Fractionation Hall', icon: 'gtceu:stellar_fractionation_hall',
    deps: ['PAR'], x: 4, y: 8,
    teach: {
      for: 'The &6Stellar Fractionation Hall&r runs distillation tower and distillery recipes, one mode at a time, and is the UXV member of the mega family.',
      needs: 'About 1,820 gum metal and 200 pulsed field casings, a parallel hatch behind it and the power for its width. Pick the mode in the controller. The shape is about 61 by 21 by 21 and about 3,270 blocks: GTM\'s Terminal places about 2,300 blocks per pass, so a structure this large takes two.',
      unlocks: 'Every distillation line of the pack on a single machine.',
      automate: 'One input bus per fluid, one output hatch per cut.',
    },
    desc: [],
    tasks: [it('gtceu:stellar_fractionation_hall')],
    rewards: [xp(250)],
  },

  // ------------------------------------------------------------------ cell and network
  {
    key: 'CELL', kind: 'machine', title: 'The UXV Cell', icon: 'grindless:uxv_smes_cell',
    deps: ['START'], x: 2, y: 10,
    teach: {
      for: 'The nitride magnet works winds the &6UXV SMES Cell&r from four UIV cells, strand tape and superfluid helium.',
      needs: 'Four UIV SMES Cells, strand tape, superfluid helium and a UXV-tier circuit, in the nitride magnet works.',
      unlocks: 'The UXV wireless tier.',
      automate: 'Nothing to feed. Size the towers for your busiest hour.',
    },
    desc: [],
    tasks: [it('grindless:uxv_smes_cell')],
    rewards: [xp(200)],
  },
  {
    key: 'NETUXV', kind: 'process', title: 'The Network Goes UXV', icon: 'gtceu:uxv_wireless_energy_hatch',
    deps: ['CELL'], x: 4, y: 10,
    teach: {
      for: 'Move your towers onto &6UXV SMES Cells&r and the wireless network carries UXV to every platform, Cygnus X-1, Vela and Cassiopeia A included. The &6Pasta Strand Repeater&r, pasta strand wire on a pulsar-timed repeater and an MTJ die, links the wireless hatches and goes into the 2 A UXV dynamo hatch.',
      needs: 'One formed tower holding a UXV cell: the network runs at its strongest cell, so until then it stays at UIV.',
      unlocks: 'The wireless hatches at UXV.',
      automate: 'Add cells when the network dips at your busiest hour.',
    },
    desc: [],
    tasks: [it('gtceu:uxv_wireless_energy_hatch'), it('gtceu:uxv_wireless_dynamo_hatch'), it('grindless:pasta_strand_repeater')],
    rewards: [xp(200)],
  },
  {
    key: 'I_GATELOAD', kind: 'milestone', title: 'Sixteen Amps of UXV', icon: 'gtceu:uxv_wireless_energy_hatch',
    deps: ['NETUXV'], x: 6, y: 10,
    desc: [
      'The gate to OpV holds the full UXV load for a minute; EMI shows the draw. A BZ dynamo and two polar cap taps make about that much before the network takes its cut, so add a source or let a charged UXV cell carry the rest. Tick this box once your sources are in place.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ older machines
  {
    key: 'I_OM_EV', kind: 'process', title: 'Separations and Strip', icon: 'gtceu:cryogenic_plant',
    deps: ['START'], x: 2, y: 13,
    teach: {
      for: 'The &6Cryogenic Plant&r, &6Rare Earth Extraction Cascade&r, &6Platinum Plant&r, &6Hot Strip Mill&r, &6Syngas and Shift Plant&r and &6Fluorspar Kiln&r each take a new mode: stellar helium and oxygen fuels, knot dust and flux dross, sputter-grade platinum, foils and laminations, platform syngas and fluorine.',
      needs: 'The controllers you already own, and cuts and dust from the stars.',
      unlocks: 'The Mk6 fuels, the titanium-44 line and the targets of the spintronic lane.',
      automate: 'Each plant hands its product on by pipe. Return the nitrogen and the water.',
    },
    desc: [],
    tasks: [
      it('gtceu:cryogenic_plant'), it('gtceu:extraction_cascade'), it('gtceu:platinum_plant'),
      it('gtceu:hot_strip_mill'), it('gtceu:syngas_plant'), it('gtceu:fluorspar_kiln'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_NUC', kind: 'process', title: 'Heavier Cuts', icon: 'gtceu:hot_cell',
    deps: ['J_SUPER'], x: 2, y: 15,
    teach: {
      for: 'The &6Fuel Fabrication Plant&r, &6Hot Cell&r, &6Actinide Partitioning Plant&r, &6Waste Retrieval Plant&r and &6Transuranium Facility&r take an ion-source charge, a sealed core, new fragments, recovered curium and plated targets.',
      needs: 'The reactors you already own and the debris of the heavy-ion lanes.',
      unlocks: 'The feed of the collider and the targets of element 121 and 122.',
      automate: 'Targets and cuts move by bus; the spent core gives back its calcium.',
    },
    desc: [],
    tasks: [
      it('gtceu:fuel_fabrication_plant'), it('gtceu:hot_cell'), it('gtceu:actinide_partitioning_plant'),
      it('gtceu:waste_retrieval_plant'), it('gtceu:transuranium_facility'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_MAG', kind: 'process', title: 'Strands, Rotors and Targets', icon: 'gtceu:hts_magnet_works',
    deps: ['J_SPIN'], x: 2, y: 17,
    teach: {
      for: 'The &6HTS Magnet Works&r, &6Coated Conductor Line&r, &6Naquadria Magnet Works&r, &6Nitride Magnet Works&r and &6Powder Bed Printer&r each take a row for the era: strand stators, strand tape, rotors, field anneals and sputter targets.',
      needs: 'The UEV and older controllers, and strand wire from Vela for the first two.',
      unlocks: 'The motor, the conveyor, the field generator and every spintronic target.',
      automate: 'Targets by bus; give back the copper backing plates of spent ones.',
    },
    desc: [],
    tasks: [
      it('gtceu:hts_magnet_works'), it('gtceu:coated_conductor_line'), it('gtceu:naquadria_magnet_works'),
      it('gtceu:nitride_magnet_works'), it('gtceu:powder_bed_printer'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_WAFER', kind: 'process', title: 'Films and Crystals', icon: 'gtceu:photonic_foundry',
    deps: ['J_SPIN'], x: 2, y: 19,
    teach: {
      for: 'The &6Ion Implanter&r, &6MOCVD Reactor&r, &6Zone Refining Tower&r, &6Synchrotron&r, &6Crystal Growth Furnace&r and &6Photonic Foundry&r take rows for oxide crystals, etched stacks, seven-nines tellurium and germanium, a charged beam and the MESO die.',
      needs: 'The UV and UHV controllers you already own, and the new purities.',
      unlocks: 'The substrates, the spintronic dies and the mainframe\'s inputs.',
      automate: 'Boules and films by bus; recycle what the tower rejects.',
    },
    desc: [],
    tasks: [
      it('gtceu:ion_implanter'), it('gtceu:mocvd_reactor'), it('gtceu:zone_refining_tower'),
      it('gtceu:synchrotron'), it('gtceu:crystal_growth_furnace'), it('gtceu:photonic_foundry'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_UEV', kind: 'process', title: 'Heavy Ions and Beams', icon: 'gtceu:calutron',
    deps: ['J_SUPER'], x: 2, y: 21,
    teach: {
      for: 'The &6Calutron&r, &6Heavy Ion Cyclotron&r (the Superheavy Factory), &6Superheavy Chemistry Lab&r, &6Electron Beam Furnace&r, &6Megabar Press&r, &6CVI Furnace&r and &6Photonic Integration Hall&r each take a UXV row: targets, elements 121 and 122, pure metals, boron nitride, a tungsten preform and the spintronic mainframe.',
      needs: 'The UEV controllers you already own.',
      unlocks: 'Census III, the Mk6 casing and the mainframe.',
      automate: 'Recoils and targets by bus. The spent beam is an output, so route it.',
    },
    desc: [],
    tasks: [
      it('gtceu:calutron'), it('gtceu:heavy_ion_cyclotron'),
      it('gtceu:superheavy_chemistry_lab'), it('gtceu:electron_beam_furnace'), it('gtceu:megabar_press'),
      it('gtceu:cvi_furnace'), it('gtceu:photonic_integration_hall'),
    ],
    rewards: [xp(150)],
  },
  {
    key: 'I_OM_DATA', kind: 'process', title: 'Records for the Arm Chart', icon: 'gtceu:matrioshka_computer',
    deps: ['ARM'], x: 2, y: 23,
    teach: {
      for: 'The &6Gravitational Wave Detector&r, &6Deep Space Network&r, &6Event Horizon Interferometer&r and &6X-Ray Pulse Profiler&r each take a row that writes one record, and the &6Matrioshka Computer&r joins the four into the arm chart.',
      needs: 'The controllers from LuV to UIV, and samples from Vela and Cassiopeia A.',
      unlocks: 'The arm chart and, with it, the gate to OpV.',
      automate: 'Records are data orbs: hand them to the computer through a bus.',
    },
    desc: [],
    tasks: [
      it('gtceu:gravitational_wave_detector'), it('gtceu:deep_space_network'), it('gtceu:event_horizon_interferometer'),
      it('gtceu:xray_pulse_profiler'), it('gtceu:matrioshka_computer'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_SKY', kind: 'process', title: 'Sling, Cage and Gate', icon: 'gtceu:ergosphere_probe_bay',
    deps: ['SEED'], x: 2, y: 25,
    teach: {
      for: 'The &6Ergosphere Probe Bay&r slings a relay seed, the &6Neutronium Cage&r makes a cage for each pasta phase, and the &6Warp Gate&r takes two new destinations and a heavier hold. The &6Antimatter Trap&r, &6Tether Ribbon Works&r, &6Europium Reductor&r, &6R-Process Decompressor&r and &6Levitation Melter&r take their own rows.',
      needs: 'Every controller from earlier eras, and the seed and shield from the sling.',
      unlocks: 'The two jumps, caged phases, positron stacks, Whipple shields and the spintronic melts.',
      automate: 'Seeds, shields and cages ride the relay between sites.',
    },
    desc: [],
    tasks: [
      it('gtceu:ergosphere_probe_bay'), it('gtceu:neutronium_cage'), it('gtceu:warp_gate'),
      it('gtceu:antimatter_trap'), it('gtceu:tether_ribbon_works'), it('gtceu:europium_reductor'),
      it('gtceu:r_process_decompressor'), it('gtceu:levitation_melter'),
    ],
    rewards: [xp(150)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
