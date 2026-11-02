// Quest data for max_integration ("MAX: Power and Older Machines"): the strand repeater, the MAX cell and network, the parallel hatch, the
// AE2 note, the three power plants of the centre and the older machines' Sagittarius A* modes (docs/reforge/05_quest_design.md;
// docs/eras/max.md, "Older machines in MAX", "Power", "Nothing one at a time", "AE2").
// REPEAT and SMES moved here from max_age and keep their keys and ids. The machines of the era are taught in max_machines, the shell and the
// horizon machines in max_horizon. AE2 has no new tier at MAX: the far rings of the platforms seed it, so its quest is a note.
// Every row starts at a link to the max_age quest that opens it, and its first quest depends on the same age quest.
// Positions: columns every 2, rows every 2 or more.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.integration,
  filename: 'max_integration',
  era: 'max',
  role: 'integration',
  order: 3,
  icon: 'gtceu:max_wireless_energy_hatch',
  autofocus: 'REPEAT',
  title: 'MAX: Power and Older Machines',
  subtitle: ['A repeater and a cell for the wireless network, a hatch of enormous width, three plants at the black hole and older machines with new modes.'],
};

export const LINKS = [
  { key: 'I_L_NET', ref: 'STRAND', x: 0, y: 0 },
  { key: 'I_L_PAR', ref: 'START', x: 0, y: 3 },
  { key: 'I_L_AE2', ref: 'GATE14', x: 0, y: 5 },
  { key: 'I_L_PWR', ref: 'SPIN', x: 0, y: 7 },
  { key: 'I_L_OM1', ref: 'GATE14', x: 0, y: 10 },
  { key: 'I_L_OM2', ref: 'GATE14', x: 0, y: 12 },
  { key: 'I_L_OM3', ref: 'START', x: 0, y: 14 },
  { key: 'I_L_OM4', ref: 'START', x: 0, y: 16 },
  { key: 'I_L_OM5', ref: 'SPIN', x: 0, y: 18 },
  { key: 'I_L_OM6', ref: 'EPHEM', x: 0, y: 20 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ cell and network
  {
    key: 'REPEAT', kind: 'machine', title: 'Strand Repeater', icon: 'grindless:horizon_strand_repeater',
    deps: ['STRAND'], x: 2, y: 0,
    teach: {
      for: 'The &6Horizon Strand Repeater&r is the link part of the MAX wireless hatches: the energy hatch and the dynamo hatch each take repeaters in their recipe.',
      needs: 'Horizon strand wire, a chain strand repeater and a MAX sensor, with solder and lubricant, in an assembler at MAX voltage.',
      unlocks: 'The MAX wireless energy and dynamo hatches.',
      automate: 'Nothing to feed: make a stock of repeaters for the hatches.',
    },
    desc: [],
    tasks: [it('grindless:horizon_strand_repeater')],
    rewards: [xp(100)],
  },
  {
    key: 'SMES', kind: 'machine', title: 'The MAX Cell', icon: 'grindless:max_smes_cell',
    deps: ['REPEAT'], x: 4, y: 0,
    teach: {
      for: 'The &6MAX SMES Cell&r is the store of the last tier. A tower that holds one lifts the whole wireless network to MAX.',
      needs: 'Horizon strand wire, cold SMES toroids and MAX field generators, in an assembler at MAX voltage.',
      unlocks: 'The network at MAX tier.',
      automate: 'Nothing to feed. Size the towers for your busiest hour.',
    },
    desc: [],
    tasks: [it('grindless:max_smes_cell')],
    rewards: [xp(200)],
  },
  {
    key: 'NETMAX', kind: 'process', title: 'The Network Goes MAX', icon: 'gtceu:max_wireless_energy_hatch',
    deps: ['SMES'], x: 6, y: 0,
    teach: {
      for: 'Move your towers onto &6MAX SMES Cells&r and the wireless network carries MAX to every platform, the black hole orbit and the belt included.',
      needs: 'One formed tower holding a MAX cell: the network runs at its strongest cell, so until then it stays at OpV.',
      unlocks: 'The MAX wireless hatches.',
      automate: 'Add cells when the network dips at your busiest hour.',
    },
    desc: [],
    tasks: [it('gtceu:max_wireless_energy_hatch'), it('gtceu:max_wireless_dynamo_hatch')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ the parallel hatch
  {
    key: 'PARMAX', kind: 'machine', title: 'The MAX Parallel Hatch', icon: 'gtceu:max_parallel_hatch',
    deps: ['START'], x: 2, y: 3,
    teach: {
      for: 'The &6Maximum Parallel Control Hatch&r is the widest hatch of the MAX tier; the MAX+ chapter has one wider still. Behind it a mega machine runs many recipes at once.',
      needs: 'A MAX hull, field generators and robot arms, in an assembly line researched with the OpV parallel hatch, and a mega machine that takes parallel hatches.',
      unlocks: 'The MAX+ parallel hatch, and mega machines at a wider run.',
      automate: 'Feed it by wide buses and watch the network, since the load grows with the width.',
    },
    desc: [],
    tasks: [it('gtceu:max_parallel_hatch')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ AE2
  {
    key: 'I_AE2', kind: 'milestone', title: 'AE2 at the Centre', icon: 'ae2:controller',
    deps: ['GATE14'], x: 2, y: 5,
    desc: [
      'AE2 has no new tier at MAX. The far rings of the platforms around the hole seed a network of their own, and the wireless network carries it home.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },

  // ------------------------------------------------------------------ power at the centre
  {
    key: 'I_WINCH', kind: 'process', title: 'Power From the Spin', icon: 'gtceu:geroch_winch',
    deps: ['SPIN'], x: 2, y: 7,
    teach: {
      for: 'The &6Geroch Winch&r lowers a tether over the horizon and takes power from the spin of the hole. Each run uses up a canister and wears the tether.',
      needs: 'A formed winch at the black hole orbit, a Geroch canister and a tether for each run.',
      unlocks: 'The first MAX power from the spin of the hole.',
      automate: 'Canisters and tethers arrive over AE2; the worn tether segment is an output, so route it.',
    },
    desc: [],
    tasks: [it('grindless:horizon_tether')],
    rewards: [xp(150)],
  },
  {
    key: 'I_PEN', kind: 'process', title: 'The Penrose Engine', icon: 'gtceu:penrose_engine',
    deps: ['I_WINCH'], x: 4, y: 7,
    teach: {
      for: 'The &6Penrose Engine&r drops a payload into the ergosphere and collects more energy than it spent. The excess comes from the rotation of the hole.',
      needs: 'A formed engine and payloads from the payload line.',
      unlocks: 'A big, steady supply of MAX power for the platforms.',
      automate: 'One payload per cycle by bus; the spent casing goes back to the line.',
    },
    desc: [],
    tasks: [it('gtceu:penrose_engine'), it('grindless:max_penrose_payload')],
    rewards: [xp(150)],
  },
  {
    key: 'I_VENT', kind: 'process', title: 'The Shell Vent', icon: 'gtceu:mirror_shell',
    deps: ['I_PEN'], x: 6, y: 7,
    teach: {
      for: 'Once the &6Mirror Shell&r is up it has a power mode of its own, the vent, which lets back out part of the light the shell returned to the hole.',
      needs: 'A closed shell and a seed wave packet to start it.',
      unlocks: 'Power drawn from the shell instead of fuel, for as long as the packet lasts.',
      automate: 'Packets arrive by bus; watch the network at the start of each one.',
    },
    desc: [],
    tasks: [it('grindless:spent_wave_packet')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ older machines
  {
    key: 'I_OM_UXV', kind: 'process', title: 'Disc and Plasma', icon: 'gtceu:accretion_disk_skimmer',
    deps: ['GATE14'], x: 2, y: 10,
    teach: {
      for: 'The &6Accretion Disk Skimmer&r, &6Plasma Mass Filter&r, &6FRC Former&r and &6BZ Dynamo&r each take a mode that works on matter from the disc: hot flow, filtered flow, flux-loaded plasma and a dynamo fed by it.',
      needs: 'The UXV controllers you already own, and the hot flow from the black hole orbit.',
      unlocks: 'The fuels and feeds of the machines of the era.',
      automate: 'Flow by pipe from the orbit; send filtered cuts to their own lines.',
    },
    desc: [],
    tasks: [
      it('gtceu:accretion_disk_skimmer'), it('gtceu:plasma_mass_filter'), it('gtceu:frc_former'), it('gtceu:bz_dynamo'),
    ],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_UIV', kind: 'process', title: 'Radiators and Writers', icon: 'gtceu:femtosecond_writer',
    deps: ['GATE14'], x: 2, y: 12,
    teach: {
      for: 'The &6Droplet Radiator Works&r and &6Femtosecond Writer&r each take a MAX row: the radiator works builds the shell droplet radiator, and the writer makes the squeezer waveguide and the droplet nozzle plate.',
      needs: 'The UIV controllers you already own.',
      unlocks: 'The shell radiator and the parts the squeezed-light line uses.',
      automate: 'Plates by bus; send each output to its own line.',
    },
    desc: [],
    tasks: [it('gtceu:droplet_radiator_works'), it('gtceu:femtosecond_writer')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_UEV', kind: 'process', title: 'Press and Harvest', icon: 'gtceu:degenerate_harvester',
    deps: ['START'], x: 2, y: 14,
    teach: {
      for: 'The &6Megabar Press&r and &6Degenerate Harvester&r each take a MAX row: the press makes the payload core and the dense pellet, and the harvester gathers the degenerate matter slug at Sagittarius A*.',
      needs: 'The UEV controllers you already own. The harvester runs at the black hole orbit.',
      unlocks: 'The payload core, the dense pellet and the slug.',
      automate: 'Matter and plates by bus. The spent slug is an output, so route it.',
    },
    desc: [],
    tasks: [it('gtceu:megabar_press'), it('gtceu:degenerate_harvester')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_UHV', kind: 'process', title: 'Sinter the Segments', icon: 'gtceu:spark_plasma_sinterer',
    deps: ['START'], x: 2, y: 16,
    teach: {
      for: 'The &6Spark Plasma Sinterer&r takes rows that sinter the composite billet, the collector shell and the payload casing.',
      needs: 'The UHV controller you already own.',
      unlocks: 'The composite billet, the collector shell and the payload casing.',
      automate: 'Powders by bus; the billets go straight to the next line.',
    },
    desc: [],
    tasks: [it('gtceu:spark_plasma_sinterer')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_UV', kind: 'process', title: 'Cavities for the Drivers', icon: 'gtceu:srf_cavity_works',
    deps: ['SPIN'], x: 2, y: 18,
    teach: {
      for: 'The &6SRF Cavity Works&r takes rows for the superconducting-jacketed pellet and the MAX SRF cavity.',
      needs: 'The UV controller you already own and niobium scrap.',
      unlocks: 'The jacketed pellet and the MAX cavity.',
      automate: 'Cavities by bus; send each output to its own line.',
    },
    desc: [],
    tasks: [it('gtceu:srf_cavity_works')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_EV', kind: 'process', title: 'Cascade of the Belt', icon: 'gtceu:extraction_cascade',
    deps: ['EPHEM'], x: 2, y: 20,
    teach: {
      for: 'The &6Rare Earth Extraction Cascade&r takes rows for hafnia and the tin-lithium eutectic.',
      needs: 'The EV controller you already own.',
      unlocks: 'Hafnia and the eutectic for the later lines.',
      automate: 'Feeds by bus; each product leaves on its own line.',
    },
    desc: [],
    tasks: [it('gtceu:extraction_cascade')],
    rewards: [xp(120)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
