// Quest data for max_horizon ("MAX: The Horizon"), the capstone: the shell's gradient map and cryocooler, the mirror shell and its four quarters,
// the four horizon machines, the wave packet and the last recipe (docs/reforge/05_quest_design.md; docs/eras/max.md, "Machine 8",
// "Machines 11 to 14", "The ending").
// SHELL, SEG1 to SEG4, GRAD, CRYO, WAVE and LOCK moved here from max_age and keep their keys and ids.
// The era's other machines, circuits and components are in max_machines and max_circuits. The horizon lock opens MAX+ and rolls no credits.
// Fixed keys (other chapters link to them): SHELL, LOCK.
// Named fiction is marked in one line: the stationary horizon, Sagittarius A*'s spin and the mirror shell.
// The row starts at a link to the max_age exit quest, and its first quest depends on the same age quest.
// Positions: columns every 2, rows every 2 or more; the four horizon machines stand in a column at x = 16 and their products one column on.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.horizon,
  filename: 'max_horizon',
  era: 'max',
  role: 'horizon',
  order: 4,
  icon: 'gtceu:mirror_shell',
  autofocus: 'SHELL',
  title: 'MAX: The Horizon',
  subtitle: ['A shell of mirrors around the black hole, four machines that hold its horizon still and the last recipe of the pack.'],
};

export const LINKS = [
  { key: 'I_L_IN', ref: 'J_EXIT', x: 0, y: 0 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ the shell
  {
    key: 'GRAD', kind: 'step', title: 'Shell Gradient Map', icon: 'grindless:shell_gradient_map',
    deps: ['J_EXIT'], x: 2, y: 0,
    desc: [
      'The &6Shell Gradient Map&r shows where on the shell the field is steepest, so the first segments go where they are needed. Once the shell stands, its second recipe joins this map to the spin map into the final spin map that the last recipe wants.',
    ],
    tasks: [it('grindless:shell_gradient_map')],
    rewards: [xp(100)],
  },
  {
    key: 'CRYO', kind: 'step', title: 'Shell Cryocooler', icon: 'grindless:shell_cryocooler',
    deps: ['GRAD'], x: 4, y: 0,
    desc: [
      'A cooler the size of a house keeps the shell below the temperature of the sky. The &6Shell Cryocooler&r goes into the shell\'s controller and into every segment, so it is made by the thousand.',
    ],
    tasks: [it('grindless:shell_cryocooler')],
    rewards: [xp(100)],
  },
  {
    key: 'SHELL', kind: 'machine', title: 'Mirror Shell', icon: 'gtceu:mirror_shell',
    deps: ['CRYO'], x: 6, y: 0,
    teach: {
      for: 'The &6Mirror Shell&r wraps the black hole in mirrors and sends its light back in. &oFiction:&r a shell like this cannot be built; the hole and its light are real. It is the largest structure in the pack.',
      needs: 'A two-layer sphere in a 35-block box at Sgr A* orbit, about 7,060 blocks: mirror shell segments inside, a tensegrity truss outside with two stream bundle belts, and 26 cleanroom glass ports ringed by shell window coil casings. Two MAX 16 A input hatches and one or two dynamo hatches sit round the controller, at the equator of the front. Every segment is a swarm-segment craft with a cooler of its own. The Terminal needs 4 passes (a pass places up to 2,300 blocks): 2,922 truss blocks, 3,072 segments, 459 glass, 398 window coil casings and 208 stream bundle blocks.',
      unlocks: 'The segments, the four horizon machines and the last recipe.',
      automate: 'Segments leave the line on a belt; plan the bus before you place the controller.',
    },
    desc: [],
    tasks: [it('gtceu:mirror_shell')],
    rewards: [xp(150)],
  },
  {
    key: 'SEG1', kind: 'step', title: 'A Quarter of the Shell', icon: 'grindless:mirror_shell_segment',
    deps: ['SHELL'], x: 8, y: 0,
    desc: [
      'About a quarter of the shell\'s segments are cut. The tether lines hold.',
    ],
    tasks: [it('grindless:mirror_shell_segment', 871)],
    rewards: [xp(100)],
  },
  {
    key: 'SEG2', kind: 'step', title: 'Half the Shell', icon: 'grindless:mirror_shell_segment',
    deps: ['SEG1'], x: 10, y: 0,
    desc: [
      'Half the segments of the mirror shell are cut. The shell is the reflector around the black hole seed, and it is built a segment at a time, so each half way is a reason to check the line.',
      'Segments are cut in a long batch job. The cryocoolers hold the shell cold while it is cut, so charge them before each run and keep them charged. Send the segments into the frame by ME as they come; the count is large, so the check is the task below.',
    ],
    tasks: [it('grindless:mirror_shell_segment', 1742)],
    rewards: [xp(100)],
  },
  {
    key: 'SEG3', kind: 'step', title: 'Three Quarters', icon: 'grindless:mirror_shell_segment',
    deps: ['SEG2'], x: 12, y: 0,
    desc: [
      'Three quarters of the segments are cut and most of them are set in the frame. That is more than any inventory can hold, so check this off once the frame is that far along.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },
  {
    key: 'PORT1', kind: 'process', title: 'Shell Window Coils', icon: 'grindless:shell_window_coil_casing',
    deps: ['SHELL'], x: 6, y: 2,
    teach: {
      for: 'The shell has 26 ports where light goes in and out and where the hatches sit. Each port is a cleanroom glass pane ringed by a loop of coil and membrane, which keeps the opening shielded and tuned. The ports stand on the faces, the edges and the corners of the box, in the same pattern as the Terminal\'s ghost.',
      needs: 'The 398 &6Shell Window Coil Casings&r of the shell, from the casing quest of the Sagittarius casings section: two per batch, so about two hundred batches. Place them first with the Terminal, then the glass.',
      unlocks: 'The glass ports and the closed shell.',
      automate: 'Run a dedicated line for the casing; its coil and membrane inputs come from the cold-metrology and membrane lines.',
    },
    desc: [],
    tasks: [it('grindless:shell_window_coil_casing', 398)],
    rewards: [xp(100)],
  },
  {
    key: 'PORT2', kind: 'process', title: 'Cleanroom Glass Ports', icon: 'gtceu:cleanroom_glass',
    deps: ['PORT1'], x: 8, y: 2,
    teach: {
      for: 'The panes of the 26 ports are &6Cleanroom Glass&r, the same glass as a cleanroom wall. They let the controller and the hatches see through the shell while the rest of it stays closed. The controller itself sits in the middle of the front port.',
      needs: '459 cleanroom glass blocks, set inside the rings of window coil casings: the Terminal places them in the same four passes as the segments. Hatches go in the two rows beside the controller.',
      unlocks: 'A shell that can form: the last segments close it.',
      automate: 'Glass is a common GTM block; keep a stack in ME and let the Terminal draw it.',
    },
    desc: [],
    tasks: [it('gtceu:cleanroom_glass', 64)],
    rewards: [xp(100)],
  },
  {
    key: 'SEG4', kind: 'step', title: 'The Shell Is Closed', icon: 'grindless:mirror_shell_segment',
    deps: ['SEG3', 'PORT2'], x: 14, y: 0,
    desc: [
      'Every segment is set and the last gap in the frame is closed. Check it off once the controller says the shell has formed.',
    ],
    tasks: [ck()],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ the horizon machines
  {
    key: 'H_INTERF', kind: 'machine', title: 'Horizon Interferometer', icon: 'gtceu:horizon_interferometer',
    deps: ['SEG4'], x: 16, y: -4,
    teach: {
      for: 'The &6Horizon Interferometer&r reads the light that the closed shell returns and maps the cloud of phases around the hole. Its second mode calibrates oscillators against that map.',
      needs: 'A closed shell that has run its first recipe, and the casings and parts new to this machine.',
      unlocks: 'The cloud phase map and the calibrated oscillator bank of the last recipe.',
      automate: 'Maps and banks leave by bus; keep the oscillators on their own line.',
    },
    desc: [],
    tasks: [it('gtceu:horizon_interferometer')],
    rewards: [xp(150)],
  },
  {
    key: 'H_CLOUD', kind: 'step', title: 'Cloud Phase Map', icon: 'grindless:cloud_phase_map',
    deps: ['H_INTERF'], x: 18, y: -4,
    desc: [
      'The &6Cloud Phase Map&r holds the phase of the light at every point of the shell. The &6Calibrated Oscillator Bank&r keeps a clock against it. The last recipe wants both.',
    ],
    tasks: [it('grindless:cloud_phase_map'), it('grindless:calibrated_oscillator_bank')],
    rewards: [xp(150)],
  },
  {
    key: 'H_SYNC', kind: 'machine', title: 'Ergoregion Synchroniser', icon: 'gtceu:ergoregion_synchroniser',
    deps: ['SEG4'], x: 16, y: -2,
    teach: {
      for: 'The &6Ergoregion Synchroniser&r locks a clock to the spin of the hole. &oFiction:&r the hole is held still long enough to be measured. The second mode relocks a spent lock so it can be used again.',
      needs: 'The oscillator bank, a closed shell and the casings and parts new to this machine.',
      unlocks: 'The horizon phase lock of the last recipe.',
      automate: 'Send each spent lock back in by bus; it never leaves the line.',
    },
    desc: [],
    tasks: [it('gtceu:ergoregion_synchroniser')],
    rewards: [xp(150)],
  },
  {
    key: 'H_LOCKP', kind: 'step', title: 'Horizon Phase Lock', icon: 'grindless:horizon_phase_lock',
    deps: ['H_SYNC'], x: 18, y: -2,
    desc: [
      'A &6Horizon Phase Lock&r holds a clock to the spin of the hole. It wears out, and a spent one goes back to the synchroniser.',
    ],
    tasks: [it('grindless:horizon_phase_lock')],
    rewards: [xp(150)],
  },
  {
    key: 'WAVE', kind: 'step', title: 'Seed Wave Packet', icon: 'grindless:seed_wave_packet',
    deps: ['SEG4'], x: 16, y: 0,
    desc: [
      'A packet of waves tuned to the shell. One of them runs the shell vent for a long while.',
    ],
    tasks: [it('grindless:seed_wave_packet')],
    rewards: [xp(100)],
  },
  {
    key: 'H_CLAMP', kind: 'machine', title: 'Horizon Flux Clamp', icon: 'gtceu:horizon_flux_clamp',
    deps: ['SEG4'], x: 16, y: 2,
    teach: {
      for: 'The &6Horizon Flux Clamp&r winds the field of the shell into a winding and, in its second mode, catches a plasmoid thrown by a reconnecting field line.',
      needs: 'A closed shell and the casings and parts new to this machine.',
      unlocks: 'The winding that the last recipe needs, and a plasmoid for the lines that use one.',
      automate: 'Windings leave by bus. A plasmoid is a hot output, so contain it and route it.',
    },
    desc: [],
    tasks: [it('gtceu:horizon_flux_clamp')],
    rewards: [xp(150)],
  },
  {
    key: 'H_CLAMPW', kind: 'step', title: 'Flux Clamp Winding', icon: 'grindless:horizon_flux_clamp',
    deps: ['H_CLAMP'], x: 18, y: 2,
    desc: [
      'The &6Horizon Flux Clamp&r winding goes into the last recipe. The &6Reconnection Plasmoid&r is its second product, and it has a use of its own.',
    ],
    tasks: [it('grindless:horizon_flux_clamp'), it('grindless:reconnection_plasmoid')],
    rewards: [xp(150)],
  },
  {
    key: 'H_RECL', kind: 'machine', title: 'Segment Reclamation Works', icon: 'gtceu:segment_reclamation_works',
    deps: ['SEG4'], x: 16, y: 4,
    teach: {
      for: 'The &6Segment Reclamation Works&r strips an ablated shell segment into scrap streams. Nothing the shell wears out is thrown away.',
      needs: 'Ablated segments from the shell, and the casings and parts new to this machine.',
      unlocks: 'Scrap that goes back into the segment, cooler and coupler lines.',
      automate: 'Each scrap stream goes to its own line by bus.',
    },
    desc: [],
    tasks: [it('gtceu:segment_reclamation_works')],
    rewards: [xp(150)],
  },
  {
    key: 'H_SCRAP', kind: 'step', title: 'Scrap Back to the Lines', icon: 'grindless:mirror_shell_scrap',
    deps: ['H_RECL'], x: 18, y: 4,
    desc: [
      'Shell scrap, membrane scrap, cooler scrap, coupler scrap and electronics scrap each go back to the line that made the part.',
    ],
    tasks: [
      it('grindless:mirror_shell_scrap'), it('grindless:stripped_membrane_scrap'), it('grindless:cryocooler_scrap'),
      it('grindless:coupler_scrap'), it('grindless:segment_electronics_scrap'),
    ],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ the last recipe
  {
    key: 'LOCK', kind: 'exit', title: 'The Horizon Lock', icon: 'grindless:horizon_lock',
    deps: ['WAVE', 'H_CLOUD', 'H_LOCKP', 'H_CLAMPW', 'H_SCRAP'], x: 20, y: 0,
    desc: [
      'The shell\'s last recipe holds the horizon still. &oFiction:&r a rotating black hole\'s horizon, held long enough to be measured and sealed in a reference.',
      'The first lock opens MAX+. The shell stays, and the recipe can run again.',
    ],
    tasks: [it('grindless:horizon_lock')],
    rewards: [xp(200)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
