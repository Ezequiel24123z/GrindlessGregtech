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

export const CHAPTER = {
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
      for: 'The &6Horizon Strand Repeater&r keeps the wireless network in step across the galaxy. Without one in each tower the MAX tier cannot reach the platforms at the centre.',
      needs: 'Horizon strand from the way in, and the assembly hall on two OpV hatches.',
      unlocks: 'The MAX cell and the MAX wireless tier.',
      automate: 'Nothing to feed: build the repeaters once and add one per new tower.',
    },
    desc: [],
    tasks: [it('grindless:horizon_strand_repeater')],
    rewards: [xp(100)],
  },
  {
    key: 'SMES', kind: 'machine', title: 'The MAX Cell', icon: 'grindless:max_smes_cell',
    deps: ['REPEAT'], x: 4, y: 0,
    teach: {
      for: 'The &6MAX SMES Cell&r is the store of the last tier. The last recipe of the shell draws from the wireless network, and this cell is what lets a tower hold that load.',
      needs: 'A repeater for each tower, and strand from the way in.',
      unlocks: 'The MAX wireless hatches and the shell\'s last recipe.',
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
      needs: 'Every formed tower holding MAX cells. Until then the network stays at the tier below.',
      unlocks: 'The MAX wireless hatches, and the load of the shell and its machines.',
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
      for: 'The &6MAX Parallel Hatch&r is the widest in the pack. Behind it a mega machine runs a whole hall of recipes at once.',
      needs: 'A mega machine that takes parallel hatches, and the power for the width you ask for.',
      unlocks: 'Every mega machine of the pack at its full width.',
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
      for: 'The &6Geroch Winch&r lowers a tether over the horizon and takes power from the spin of the hole. It wears its tether as it works.',
      needs: 'A formed winch at the black hole orbit and a stock of tethers.',
      unlocks: 'The first MAX power that is not a fuel.',
      automate: 'Spare tethers arrive over AE2; a worn one goes back to its line.',
    },
    desc: [],
    tasks: [it('gtceu:geroch_winch')],
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
    tasks: [it('gtceu:mirror_shell')],
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
      for: 'The &6Droplet Radiator Works&r and &6Femtosecond Writer&r each take a MAX mode: nozzle plates for the shell radiator, and writes on the new die.',
      needs: 'The UIV controllers you already own.',
      unlocks: 'The shell radiator and the MAX die.',
      automate: 'Plates by bus; return what the writer rejects.',
    },
    desc: [],
    tasks: [it('gtceu:droplet_radiator_works'), it('gtceu:femtosecond_writer')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_UEV', kind: 'process', title: 'Press and Harvest', icon: 'gtceu:degenerate_harvester',
    deps: ['START'], x: 2, y: 14,
    teach: {
      for: 'The &6Megabar Press&r and &6Degenerate Harvester&r each take a MAX row: the press shapes the heavy plates of the shell and the harvester gathers degenerate matter for the engine\'s slug.',
      needs: 'The UEV controllers you already own and matter from the orbit.',
      unlocks: 'The plates of the shell and the slug of the Penrose payload.',
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
      for: 'The &6Spark Plasma Sinterer&r takes a row that sinters the cores of the shell segments.',
      needs: 'The UHV controller you already own and the powders of the belt.',
      unlocks: 'The segment cores.',
      automate: 'Powders by bus; the cores go straight to the segment line.',
    },
    desc: [],
    tasks: [it('gtceu:spark_plasma_sinterer')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_UV', kind: 'process', title: 'Cavities for the Drivers', icon: 'gtceu:srf_cavity_works',
    deps: ['SPIN'], x: 2, y: 18,
    teach: {
      for: 'The &6SRF Cavity Works&r takes a row for the cavities of the drivers and the coil. Fiction: the drivers and the coil are built at the scale of the solar system.',
      needs: 'The UV controller you already own and the niobium of the platforms.',
      unlocks: 'The driver modules and the coil.',
      automate: 'Cavities by bus; a rejected one goes back to the melt.',
    },
    desc: [],
    tasks: [it('gtceu:srf_cavity_works')],
    rewards: [xp(120)],
  },
  {
    key: 'I_OM_EV', kind: 'process', title: 'Cascade of the Belt', icon: 'gtceu:extraction_cascade',
    deps: ['EPHEM'], x: 2, y: 20,
    teach: {
      for: 'The &6Extraction Cascade&r takes a row that sorts belt rock into its metals before the furnace takes it.',
      needs: 'The EV controller you already own and rock from the belt.',
      unlocks: 'The metal feedstock of the segments.',
      automate: 'Rock in by bus; each metal leaves on its own line.',
    },
    desc: [],
    tasks: [it('gtceu:extraction_cascade')],
    rewards: [xp(120)],
  },
];
