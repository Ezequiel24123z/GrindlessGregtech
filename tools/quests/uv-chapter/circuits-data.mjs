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
    key: 'UC_WCOMP', kind: 'circuit', title: 'Wetware Computer', icon: 'gtceu:wetware_processor_computer',
    deps: ['START'], x: 4, y: 0,
    teach: {
      for: 'The &6Wetware Processor Computer&r is the first UV circuit, and the assembly line is the only machine that builds it. The living part comes from Pluto: its ices and the ark and the vat grow organoids, which become stem cells and neuro processing units. The chain runs wetware processor, assembly, computer.',
      needs: 'Several wetware processor assemblies, wetware boards, RAM and NOR chips, and an assembly line with ZPM hatches. The stem cells and neuro processing units come from the organoid line, not from a recipe of their own.',
      unlocks: 'The wetware mainframe, and through it the UV assembler.',
      automate: 'Assemblies come from the ZPM line by ME; the assembly line draws them on demand.',
    },
    desc: [],
    tasks: [it('gtceu:wetware_processor_computer')],
    rewards: [xp(120)],
  },
  {
    key: 'UC_MAIN', kind: 'circuit', title: 'Wetware Mainframe', icon: 'gtceu:wetware_processor_mainframe',
    deps: ['UC_WCOMP'], x: 6, y: 0,
    teach: {
      for: 'The &6Wetware Processor Mainframe&r is a UHV-tier circuit, and the UV assembler is built around it. It comes out of the assembly line, not out of a circuit assembler.',
      needs: 'Wetware computers, tritanium frames and advanced SMD parts by the stack, and an assembly line with UV hatches. Photonic chips play no part in it.',
      unlocks: 'The UV circuit assembler, and the UHV hulls after it.',
      automate: 'Make it from stocked parts; ME keeps the mainframes in a dedicated chest.',
    },
    desc: [],
    tasks: [it('gtceu:wetware_processor_mainframe')],
    rewards: [xp(180)],
  },
  {
    key: 'UC_ASM', kind: 'machine', title: 'UV Circuit Assembler', icon: 'gtceu:uv_circuit_assembler',
    deps: ['UC_MAIN'], x: 2, y: 0,
    teach: {
      for: 'The &6UV Circuit Assembler&r builds the circuits UV machines are made of, and it is the only place the wetware processor is made from Highly Advanced SoCs.',
      needs: 'UV components for its hull, the cleanroom you already run, and a UHV-tier circuit: the Wetware Processor Mainframe, or a UHV universal circuit.',
      unlocks: 'Wetware processors from Highly Advanced SoCs, and the circuits the controllers of this era ask for.',
      automate: 'Boards and chips arrive by ME from the cleanroom; keep a stock of what it returns.',
    },
    desc: [],
    tasks: [it('gtceu:wetware_processor_mainframe'), it('gtceu:uv_circuit_assembler')],
    rewards: [xp(100)],
  },
  {
    key: 'UC_GAAS', kind: 'process', title: 'Gallium Arsenide Boule', icon: 'grindless:gallium_arsenide_boule',
    deps: ['START'], x: 2, y: -3,
    teach: {
      for: 'Gallium arsenide dust melts in a blast furnace under argon and grows into a &6Gallium Arsenide Boule&r, the seed stock of the photonic chips. A cutter slices it into wafers.',
      needs: 'Gallium arsenide dust, argon, an electric blast furnace that reaches 1600 K, and a cutter with lubricant.',
      unlocks: 'The gallium arsenide wafer, the InGaAs diodes, and the neutronium boule that grows from it.',
      automate: 'One boule yields eight wafers. Keep a furnace growing and send the wafers on by ME.',
    },
    desc: [],
    tasks: [it('grindless:gallium_arsenide_boule')],
    rewards: [xp(60)],
  },
  {
    key: 'UC_NBOULE', kind: 'process', title: 'Neutronium Boule', icon: 'gtceu:neutronium_boule',
    deps: ['UC_GAAS'], x: 2, y: -1.5,
    teach: {
      for: 'Neutronium, silicon and gallium arsenide grow into a &6Neutronium Boule&r in a blast furnace under xenon. The cutter slices it into &6Neutronium Wafers&r.',
      needs: 'Neutronium ingots, silicon blocks, the gallium arsenide boule from the quest before, xenon, a blast furnace that reaches the temperature, and a cutter with lubricant or water.',
      unlocks: 'The Highly Advanced SoC wafer, and the neutronium wafer the Starchip is cut from.',
      automate: 'The boule is slow and one boule yields a great many wafers. Keep one growing and stock the wafers by ME.',
    },
    desc: [],
    tasks: [it('gtceu:neutronium_boule'), it('gtceu:neutronium_wafer')],
    rewards: [xp(80)],
  },
  {
    key: 'UC_HASOC', kind: 'wafer', title: 'Highly Advanced SoC', icon: 'gtceu:highly_advanced_soc_wafer',
    deps: ['UC_NBOULE', 'UC_ASM'], x: 4, y: -1.5,
    teach: {
      for: 'A neutronium wafer under a black lens becomes the &6Highly Advanced SoC Wafer&r, and the cutter turns it into &6Highly Advanced SoCs&r.',
      needs: 'A neutronium wafer, a black lens, a laser engraver, a cutter with lubricant or water, and a cleanroom.',
      unlocks: 'Wetware processors in the UV assembler, with neuro processing units.',
      automate: 'A wafer in, chips out. Send the chips on by ME to the UV assembler.',
    },
    desc: [],
    tasks: [it('gtceu:highly_advanced_soc_wafer'), it('gtceu:highly_advanced_soc')],
    rewards: [xp(100)],
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
      needs: 'The Synchrotron from further up, a mask, and PMMA-coated wafers.',
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
      unlocks: 'The starchip at the end of this row. No wetware circuit needs it.',
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
      needs: 'Germanium tetrachloride from the photonics line and the zone refining tower from further up.',
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
      needs: 'The Starchip Fab from further up, and every part on the light row above.',
      unlocks: 'The sailcraft, and with it the launch and the long coast to Proxima.',
      automate: 'The fab dices in batches and wastes only kerf. Send the chips on by ME to the sail line.',
    },
    desc: [],
    tasks: [it('grindless:starchip'), it('grindless:sailcraft')],
    rewards: [xp(150)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
