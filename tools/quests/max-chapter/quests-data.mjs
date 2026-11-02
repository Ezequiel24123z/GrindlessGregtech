// Quest data for max_age ("MAX: The Galactic Centre"), the journey chapter: the way in, the probe, Sagittarius A*, the belt and the exit to the horizon
// (docs/reforge/05_quest_design.md; docs/eras/max.md, "Route", "Places", "Bridges", "Quests").
// The era's machines, circuits and components are in max_machines and max_circuits (MX-C2b); the strand repeater, the MAX cell and network, the
// parallel hatch, the power plants and the older machines' modes are in max_integration; the shell and the last recipe are in max_horizon.
// Quests that moved there keep their keys and ids (REPEAT and SMES in integration; GRAD, CRYO, SHELL, SEG1 to SEG4, WAVE and LOCK in horizon).
// Fixed keys (other chapters link to them): START, HULL, STRAND, SGRCHART, GATE14, GATE15, SPIN, EPHEM, J_EXIT.
// START depends on the OpV gate quest, which keeps its key and id. The chart comes from that gate.
// Named fiction is marked in one line: the horizon strand, Sagittarius A*'s spin and the NSC belt.
// Gate quests never reward the gate product: each is a dimension task.
// Positions: columns every 2 along y = 0.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const dim = (dimension) => ({ type: 'dimension', dimension });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.quests,
  order: 0,
  icon: 'gtceu:max_machine_casing',
  autofocus: 'START',
  title: 'MAX: The Galactic Centre',
  subtitle: ['A probe to Sagittarius A*, a platform on the black hole\'s orbit and a belt of planetesimals: the way to the last recipe.'],
};

export const QUESTS = [
  {
    key: 'START', kind: 'start', title: 'The Galactic Centre', icon: 'gtceu:max_machine_casing',
    deps: ['X:3E3C190F1A77EB6D'], x: 0, y: 0,
    desc: [
      'You hold the &6MAX Machine Casing&r. It is an assembly-line recipe, researched with the Sagittarius A* chart that the OpV warp gate wrote. The hull needs horizon strand cable, so the strand comes first.',
      'Sagittarius A* is four million suns folded into a point. Everything here is a way to reach it, feed it and use it.',
    ],
    tasks: [it('gtceu:max_machine_casing')],
    rewards: [xp(50)],
  },
  {
    key: 'HULL', kind: 'step', title: 'MAX Hull', icon: 'gtceu:max_machine_hull',
    deps: ['START'], x: 2, y: 0,
    desc: [
      'The &6MAX Machine Hull&r is the first thing every MAX machine needs. It is an assembly-line recipe from MAX casings, horizon strand cable and chain lamina stacks.',
    ],
    tasks: [it('gtceu:max_machine_hull')],
    rewards: [xp(100)],
  },
  {
    key: 'LOOK', kind: 'reading', title: 'The Way In', icon: 'gtceu:max_machine_hull',
    deps: ['HULL'], x: 4, y: 0,
    desc: [
      'Four ways lead out of the hull: the strand, the circuits and components, the home machines, and the probe to Sagittarius A*. This one follows the probe. The Machines, Circuits and Integration sections of this chapter have the rest.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'STRAND', kind: 'step', title: 'Horizon Strand', icon: 'gtceu:horizon_strand_single_cable',
    deps: ['LOOK'], x: 6, y: 0,
    desc: [
      'A strand of matter that never crosses the horizon. &oFiction:&r a cable that carries MAX power, with no real counterpart. The hull and the repeater both need it. The strand preform is drawn at SGR 1806-20.',
    ],
    tasks: [it('gtceu:horizon_strand_single_cable')],
    rewards: [xp(100)],
  },
  {
    key: 'SGRCHART', kind: 'step', title: 'Sagittarius A* Chart', icon: 'grindless:sgr_a_chart',
    deps: ['STRAND'], x: 8, y: 0,
    desc: [
      'The warp gate from OpV wrote the first chart of the centre. It names where the relay probe must go.',
    ],
    tasks: [it('grindless:sgr_a_chart')],
    rewards: [xp(100)],
  },
  {
    key: 'PROBE', kind: 'step', title: 'Relay Probe', icon: 'grindless:gc_relay_probe',
    deps: ['SGRCHART'], x: 10, y: 0,
    desc: [
      'A relay probe for the Galactic Centre. It is an assembly-line recipe researched at the Hawking drive, and it takes metal feedstock, so make that first. Nothing comes back from it: it is thrown from the Cygnus X-1 gate, and the gate takes it in.',
    ],
    tasks: [it('grindless:gc_relay_probe')],
    rewards: [xp(150)],
  },
  {
    key: 'LAUNCH', kind: 'step', title: 'Probe Away', icon: 'grindless:launched_gc_probe',
    deps: ['PROBE'], x: 12, y: 0,
    desc: [
      'The launched probe crosses twenty-six thousand light years. The gate does the rest.',
    ],
    tasks: [it('grindless:launched_gc_probe')],
    rewards: [xp(100)],
  },
  {
    key: 'GATE14', kind: 'step', title: 'Black Hole Orbit', icon: 'gtceu:max_machine_casing',
    deps: ['LAUNCH'], x: 14, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      'The warp gate opens on the orbit of Sagittarius A*.       Machines for the orbit start here.',
    ],
    tasks: [dim('gcyr:black_hole_orbit')],
          rewards: [],
  },

  // ------------------------------------------------------------------ Sagittarius A*
  {
    key: 'J_SGRA', kind: 'reading', title: 'Platforms at the Hole', icon: 'grindless:sgr_a_star_image',
    deps: ['GATE14'], x: 16, y: 0,
    desc: [
      'The platforms hang at the orbit of Sagittarius A*, in the light of the disc. Imaging, spin and the belt are worked from here; the machines for each are in the Machines section of this chapter.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'SPIN', kind: 'step', title: 'Spin Map', icon: 'grindless:sgr_a_spin_map',
    deps: ['J_SGRA'], x: 18, y: 0,
    desc: [
      'The spin of the hole, measured from the ring of light around it. &oFiction:&r this pack gives it a spin a = 0.9.',
    ],
    tasks: [it('grindless:sgr_a_spin_map')],
    rewards: [xp(100)],
  },
  {
    key: 'EPHEM', kind: 'step', title: 'Cluster Ephemeris', icon: 'grindless:nsc_ephemeris',
    deps: ['SPIN'], x: 20, y: 0,
    desc: [
      'Where every rock of the nuclear star cluster will be, and when. The imager writes it from the same ring of light.',
    ],
    tasks: [it('grindless:nsc_ephemeris')],
    rewards: [xp(100)],
  },
  {
    key: 'J_WARP', kind: 'step', title: 'The Gate at the Hole', icon: 'gtceu:warp_gate',
    deps: ['EPHEM'], x: 22, y: 0,
    desc: [
      'The warp gate takes a heavier load here. Build the &6Warp Gate&r at the orbit so the belt seed has somewhere to leave from.',
    ],
    tasks: [it('gtceu:warp_gate')],
    rewards: [xp(100)],
  },
  {
    key: 'NSCSEED', kind: 'step', title: 'Belt Seed', icon: 'grindless:nsc_belt_seed',
    deps: ['J_WARP'], x: 24, y: 0,
    desc: [
      'A seed for a belt of planetesimals at the centre. It is an assembly-line recipe researched with the cluster ephemeris, and it takes metal feedstock. The gate takes it in.',
    ],
    tasks: [it('grindless:nsc_belt_seed')],
    rewards: [xp(150)],
  },
  {
    key: 'J_LAUNCH', kind: 'reading', title: 'Seed Away', icon: 'grindless:nsc_belt_seed',
    deps: ['NSCSEED'], x: 26, y: 0,
    desc: [
      'The gate slings the seed toward the cluster; what was thrown does not come back. When it arrives, the gate can follow it.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ the belt
  {
    key: 'GATE15', kind: 'step', title: 'The Belt Opens', icon: 'gtceu:max_machine_casing',
    deps: ['J_LAUNCH'], x: 28, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      'The warp gate opens on the nuclear star cluster belt. &oFiction:&r a belt of planetesimals the pack makes up for the centre.',
    ],
    tasks: [dim('grindless:nsc_belt')],
    rewards: [],
  },
  {
    key: 'J_BELT', kind: 'reading', title: 'Rock to Shell', icon: 'grindless:nsc_planetesimal',
    deps: ['GATE15'], x: 30, y: 0,
    desc: [
      'The belt is the shell\'s quarry. Rock is melted and cut into truss billets for the segments. The Machines section of this chapter has each step.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_PLANET', kind: 'step', title: 'Planetesimal', icon: 'grindless:nsc_planetesimal',
    deps: ['J_BELT'], x: 32, y: 0,
    desc: [
      'A &6NSC Planetesimal&r from the belt, caught at the cluster. It is the raw rock of the segments.',
    ],
    tasks: [it('grindless:nsc_planetesimal')],
    rewards: [xp(100)],
  },
  {
    key: 'J_FEED', kind: 'step', title: 'Metal Feedstock', icon: 'grindless:metal_feedstock',
    deps: ['J_PLANET'], x: 34, y: 0,
    desc: [
      '&6Metal Feedstock&r is sintered in the replication refinery from carbonyl iron-nickel. Both relay probes and the belt seed take it, so make it before the probe.',
    ],
    tasks: [it('grindless:metal_feedstock')],
    rewards: [xp(100)],
  },
  {
    key: 'J_EXIT', kind: 'exit', title: 'To the Horizon', icon: 'gtceu:mirror_shell',
    deps: ['J_FEED'], x: 36, y: 0,
    desc: [
      'The belt feeds the shell. The shell, the four horizon machines and the last recipe wait in The Horizon section of this chapter.',
    ],
    tasks: [ck()],
    rewards: [xp(200)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
