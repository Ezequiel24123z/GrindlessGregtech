// Quest data for uv_circuits: the UV circuit assembler and the ladder to the wetware mainframe, the photonic chip, the starchip, and the HPGe and
// SNSPD parts that are components (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uv.md, "Our multiblocks" and "Family steps").
// STARCHIP and SNSPD moved here from uv_age and keep their keys and ids; every row starts at a link to the quest that opens it. Charts own the
// line intermediates, so these quests ask for machines and line ends only.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.circuits,
  filename: 'uv_circuits',
  era: 'uv',
  role: 'circuits',
  order: 1,
  icon: 'gtceu:wetware_processor_mainframe',
  autofocus: 'UC_ASM',
  title: 'UV: Circuits',
  subtitle: ['Light that prints finer than a lens, grown neurons on a board, and a chip the weight of a paperclip.'],
};

export const LINKS = [
  { key: 'C_L_ST', ref: 'START', x: 0, y: 0 },
  { key: 'C_L_LIGHT', ref: 'START', x: 0, y: 1.5 },
  { key: 'C_L_PARTS', ref: 'START', x: 0, y: 3 },
  { key: 'C_L_SAIL', ref: 'START', x: 0, y: 4.5 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ the assembler and the ladder
  {
    key: 'UC_ASM', kind: 'machine', title: 'UV Circuit Assembler', icon: 'gtceu:uv_circuit_assembler',
    deps: ['START'], x: 2, y: 0,
    teach: {
      for: 'The &6UV Circuit Assembler&r is the first assembler that can build the circuits UV machines are made of.',
      needs: 'UV components for its hull, the cleanroom you already run, and the ZPM circuits that feed it.',
      unlocks: 'The wetware computer and mainframe on this row, and every controller of this era.',
      automate: 'Boards and chips arrive by ME from the cleanroom; keep a stock of what it returns.',
    },
    desc: [],
    tasks: [it('gtceu:uv_circuit_assembler')],
    rewards: [xp(100)],
  },
  {
    key: 'UC_WCOMP', kind: 'circuit', title: 'Wetware Computer', icon: 'gtceu:wetware_processor_computer',
    deps: ['UC_ASM'], x: 4, y: 0,
    teach: {
      for: 'Neuro processing units on a larger board make the &6Wetware Processor Computer&r, the first UV circuit.',
      needs: 'Several neuro processing units for each, the UV assembler, and the vat that grows them in the machines chapter.',
      unlocks: 'UV hulls and the controllers of this era that ask for a circuit.',
      automate: 'Neuro processing units come out of the vat by ME; let the assembler draw them on demand.',
    },
    desc: [],
    tasks: [it('gtceu:wetware_processor_computer')],
    rewards: [xp(120)],
  },
  {
    key: 'UC_MAIN', kind: 'circuit', title: 'Wetware Mainframe', icon: 'gtceu:wetware_processor_mainframe',
    deps: ['UC_WCOMP', 'UC_PCHIP'], x: 6, y: 0,
    teach: {
      for: 'The &6Wetware Processor Mainframe&r is the biggest circuit UV builds, and the one the UHV hulls and the research stations lean on.',
      needs: 'Wetware computers and photonic chips by the stack, and the UV assembler to put them together.',
      unlocks: 'UV machine hulls and the hatches that open the gate to UHV.',
      automate: 'Make it from stocked parts; ME keeps the mainframes in a dedicated chest.',
    },
    desc: [],
    tasks: [it('gtceu:wetware_processor_mainframe')],
    rewards: [xp(180)],
  },

  // ------------------------------------------------------------------ light: the photonic chip
  {
    key: 'UC_XMASK', kind: 'process', title: 'X-ray Mask', icon: 'grindless:x_ray_mask',
    deps: ['START'], x: 2, y: 1.5,
    teach: {
      for: 'An &6X-ray Mask&r is the stencil the synchrotron exposes a wafer through. Its lines are far finer than any lens can print.',
      needs: 'A cleanroom, the lithography you already run, and a gold absorber pattern on a thin membrane.',
      unlocks: 'The patterned wafer, and through it the photonic chip.',
      automate: 'A mask is not consumed in one exposure. Keep a few spares by ME and let the exposures draw them.',
    },
    desc: [],
    tasks: [it('grindless:x_ray_mask')],
    rewards: [xp(80)],
  },
  {
    key: 'UC_PWAF', kind: 'wafer', title: 'Patterned Wafer', icon: 'grindless:patterned_wafer',
    deps: ['UC_XMASK'], x: 4, y: 1.5,
    teach: {
      for: 'A wafer coated in resist, exposed to the synchrotron through the mask and developed is a &6Patterned Wafer&r.',
      needs: 'The Synchrotron from the machines chapter, a mask, and PMMA-coated wafers.',
      unlocks: 'The photonic chip.',
      automate: 'Coating and developing run in plain machines by ME; only the exposure waits for the beam.',
    },
    desc: [],
    tasks: [it('grindless:patterned_wafer')],
    rewards: [xp(100)],
  },
  {
    key: 'UC_PCHIP', kind: 'circuit', title: 'Photonic Chip', icon: 'grindless:photonic_chip',
    deps: ['UC_PWAF'], x: 6, y: 1.5,
    teach: {
      for: 'Cut from the patterned wafer, the &6Photonic Chip&r moves light instead of electrons and does the work of a wafer of ordinary logic.',
      needs: 'A patterned wafer, silicon nitride film and a cleanroom.',
      unlocks: 'The wetware mainframe, and the starchip at the end of this row.',
      automate: 'One wafer, many chips: keep a stock by ME so the assembler never waits.',
    },
    desc: [],
    tasks: [it('grindless:photonic_chip')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ parts that are components: germanium and the photon counter
  {
    key: 'UC_HPGE', kind: 'wafer', title: 'High-Purity Germanium', icon: 'grindless:hpge_crystal',
    deps: ['START'], x: 2, y: 3,
    teach: {
      for: 'The &6HPGe Crystal&r is germanium refined past thirteen nines. It is the detector eye that probes and the interferometer carry.',
      needs: 'Germanium tetrachloride from the photonics line and the zone refining tower from the machines chapter.',
      unlocks: 'The SNSPD array beside it and the detector parts of the Starshot.',
      automate: 'The tower is slow; keep its feed topped up by ME and stock the crystals.',
    },
    desc: [],
    tasks: [it('grindless:hpge_crystal')],
    rewards: [xp(100)],
  },
  {
    key: 'SNSPD', kind: 'wafer', title: 'Counting Photons', icon: 'grindless:snspd_array',
    deps: ['UC_HPGE'], x: 4, y: 3,
    teach: {
      for: 'A superconducting nanowire turns resistive the moment a single photon lands on it. The &6SNSPD Array&r is a grid of them on a niobium nitride film.',
      needs: 'An NbN-coated wafer from the MOCVD reactor, and the qubit fab with its helium-3 fridge.',
      unlocks: 'The optical ground station, the one reader of the Starshot.',
      automate: 'Tested arrays come out of the fab one wafer at a time; stock them by ME.',
    },
    desc: [],
    tasks: [it('grindless:snspd_array')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ the starchip
  {
    key: 'STARCHIP', kind: 'circuit', title: 'Starchip', icon: 'grindless:starchip',
    deps: ['START', 'UC_PCHIP', 'SNSPD'], x: 8, y: 3,
    teach: {
      for: 'A photonic chip, a diamond qubit, an americium source and a neutronium wafer become one &6Starchip&r. Mounted on a sail it is a probe about as heavy as a paperclip.',
      needs: 'The Starchip Fab from the machines chapter, and every part on the light row above.',
      unlocks: 'The sailcraft, and with it the launch and the long coast to Proxima.',
      automate: 'The fab dices in batches and wastes only kerf. Send the chips on by ME to the sail line.',
    },
    desc: [],
    tasks: [it('grindless:starchip'), it('grindless:sailcraft')],
    rewards: [xp(150)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
