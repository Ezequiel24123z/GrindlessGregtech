// Quest data for maxplus_age_1 ("MAX+: Out of the Galaxy"), stage I: the horizon lock as a key, horizon-bound matter, the Hills slingshot to
// 30 Doradus, the Tarantula, and gate c17 to the Magellanic Stream (docs/reforge/05_quest_design.md; docs/eras/maxplus.md, "Route" 1 to 6,
// "Places and site rules", "Bridges and first arrivals").
// Stage I asks for place products only. The machines (controllers), the kerr strand, the nine components and the horizon processor are in
// maxplus_machines and maxplus_circuits (XP-C2b); stage II is maxplus_age_2; older machines, power and AE2 are in maxplus_integration.
// Fixed keys (other chapters link to them): START, LMC, STREAM.
// Keys for XP-C2b to hang from: TAP (condensate), SETTLED (condensate refinery), BN (bound-matter press), KS (kerr strange alloy),
// BDEG (bound degenerate billet), CW (counterweight), PROBE (relay probe), PAIR (slingshot), LAUNCH, RAW (stellar lift), NI56 (crucible),
// CASK (nickel-56 cask and burner), NAV17, PD (gas works and torus), PHE3 (primordial helium-3).
// START depends on max:LOCK. No link to pl_maxplus yet (XP-PL). Travel (AF-1, server lib/relay_platforms.js): a completed jump places its place's
// relay platform once and leaves the place's Relay Coordinates in the jump ring's output bus; a holding ring with them in its input bus carries a
// player standing in it there, and the platform's paused ring wakes for one hold to carry them home.
// Gate quests never reward the gate product: each arrival is a dimension task and gives XP only; the course and probe steps are checkmarks.
// Positions and dependencies: layout.mjs.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const dim = (dimension) => ({ type: 'dimension', dimension });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  filename: 'maxplus_age_1',
  era: 'maxplus',
  role: 'age',
  order: 0,
  icon: 'grindless:horizon_lock',
  autofocus: 'START',
  section: SECTIONS.age1,
  title: 'MAX+: Beyond the Galaxy',
  subtitle: ['A kept lock that taps the stilled horizon, a slingshot past the Galaxy\'s rim, the Tarantula Nebula and the Magellanic Stream.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ the key and the condensate
  {
    key: 'START', kind: 'start', title: 'MAX+ Begins', icon: 'grindless:horizon_lock',
    deps: ['max:LOCK'], x: 0, y: 0,
    desc: [
      'The last recipe of MAX left you a &6Horizon Lock&r. It is no ticket home: the shell keeps it as a catalyst, and every tap of the horizon from here on wants one.',
      'Make more as you go. The gate that leaves the Galaxy keeps one, every locked chevron of the last gate swallows one, and its dial keeps another.',
      '&oFiction:&r a horizon held still, and a lock that holds it. The Galaxy ends at the next gate.',
    ],
    tasks: [it('grindless:horizon_lock')],
    rewards: [xp(100)],
  },
  {
    key: 'TAP', kind: 'process', title: 'Tapping the Horizon', icon: 'gtceu:kerr_condensate_bucket',
    deps: ['START'], x: 2, y: 0,
    teach: {
      for: 'The &6Mirror Shell&r can now tap &6Kerr Condensate&r from the still cloud around the hole, with a wave packet to seed it and the lock kept as catalyst.',
      needs: 'The shell, and a Kugelblitz forge sending packets.',
      unlocks: 'Every horizon-bound material.',
      automate: 'Packets come in by belt, and the lock never leaves the shell.',
    },
    desc: [],
    tasks: [it('grindless:seed_wave_packet'), it('gtceu:kerr_condensate_bucket')],
    rewards: [xp(100)],
  },
  {
    key: 'SETTLED', kind: 'step', title: 'Settled Condensate', icon: 'gtceu:settled_condensate_bucket',
    deps: ['TAP'], x: 4, y: 0,
    desc: [
      'Raw condensate will not hold still in a pipe. The refinery settles it, and everything bound is made from this fluid.',
    ],
    tasks: [it('gtceu:settled_condensate_bucket')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ horizon-bound matter
  {
    key: 'KS', kind: 'step', title: 'Kerr Strange Alloy', icon: 'grindless:kerr_strange_plate',
    deps: ['SETTLED'], x: 4, y: -1.5,
    desc: [
      'Strange matter from the strangelet vault, melted and bound in condensate. The &6Kerr Strange Plate&r is the hardest sheet you will press.',
    ],
    tasks: [it('grindless:kerr_strange_ingot'), it('grindless:kerr_strange_plate')],
    rewards: [xp(150)],
  },
  {
    key: 'BN', kind: 'step', title: 'Horizon-Bound Neutronium', icon: 'grindless:horizon_compressed_plate',
    deps: ['SETTLED'], x: 13, y: 4,
    desc: [
      'The refinery\'s bound ingots, pressed. The &6Horizon Compressed Plate&r is the densest plate in the pack, and only the bound-matter press makes it.',
    ],
    tasks: [it('grindless:horizon_compressed_plate')],
    rewards: [xp(150)],
  },
  {
    key: 'BDEG', kind: 'step', title: 'Bound Degenerate Billet', icon: 'grindless:bound_degenerate_billet',
    deps: ['SETTLED'], x: 16, y: 4.5,
    desc: [
      'A white dwarf\'s matter, ground and bound. It feeds the older lines that still ask for degenerate stock.',
    ],
    tasks: [it('grindless:bound_degenerate_powder'), it('grindless:bound_degenerate_billet')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ the slingshot
  {
    key: 'CW', kind: 'step', title: 'Slingshot Counterweight', icon: 'grindless:canned_counterweight',
    deps: ['SETTLED'], x: 6, y: 0,
    desc: [
      'A canned counterweight of dense planetesimal core. The black hole keeps it, which is the honest ending for anything that heavy. The slingshot\'s coil casing is wound round the same core.',
    ],
    tasks: [it('grindless:dense_counterweight_core'), it('grindless:canned_counterweight')],
    rewards: [xp(150)],
  },
  {
    key: 'NAVCORE', kind: 'step', title: 'Optical Nav Core', icon: 'grindless:optical_nav_core',
    deps: ['SETTLED'], x: 6, y: -1.5,
    desc: [
      'An intergalactic probe steers by an &6Optical Nav Core&r, built in the photonic foundry round a thorium nuclear clock. Every probe swallows one whole, so each gate you open from here costs another.',
    ],
    tasks: [it('grindless:optical_nav_core')],
    rewards: [xp(200)],
  },
  {
    key: 'PROBE', kind: 'step', title: 'Intergalactic Relay Probe', icon: 'grindless:ig_relay_probe',
    deps: ['CW'], x: 8, y: 0,
    desc: [
      'The old galactic-centre probe will not leave the Galaxy. This one carries a Hawking drive, the navigation core, and MAX+ sensors and arms from the Circuits section.',
    ],
    tasks: [it('grindless:probe_seed'), it('grindless:hawking_drive'), it('grindless:ig_relay_probe')],
    rewards: [xp(200)],
  },
  {
    key: 'PAIR', kind: 'step', title: 'A Bound Pair', icon: 'grindless:bound_probe_pair',
    deps: ['PROBE'], x: 10, y: 0,
    desc: [
      'Probe and counterweight go into the slingshot together, at Sgr A* orbit, the only place it runs. The hole\'s tide splits them, keeps one and throws the other out of the Galaxy.',
    ],
    tasks: [it('grindless:bound_probe_pair')],
    rewards: [xp(150)],
  },
  {
    key: 'LAUNCH', kind: 'step', title: 'Probe Away', icon: 'grindless:launched_ig_probe',
    deps: ['PAIR'], x: 12, y: 0,
    desc: [
      'The probe is on its way. The warp gate at Sgr A* catches it at the far end: its hold burns the launched probe and keeps a Horizon Lock as a catalyst.',
    ],
    tasks: [it('grindless:launched_ig_probe')],
    rewards: [xp(150)],
  },
  {
    key: 'LMC', kind: 'step', title: '30 Doradus', icon: 'grindless:launched_ig_probe',
    deps: ['LAUNCH'], x: 14, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      'When that hold completes, a platform appears in the Tarantula Nebula, beside the heaviest stars known, and the ring\'s output bus gets its &6Relay Coordinates&r. Put them in the input bus of a ring that is holding, stand inside and it carries you there.',
    ],
    tasks: [dim('grindless:tarantula_orbit')],
    rewards: [xp(250)],
  },

  // ------------------------------------------------------------------ the Tarantula
  {
    key: 'J_TAR', kind: 'reading', title: 'The Platform at 30 Doradus', icon: 'gtceu:tarantula_stellar_lift',
    deps: ['LMC'], x: 16, y: 0,
    desc: [
      'A warp ring on a floor, a wireless hatch pair and an AE2 controller with a drive. Everything else you carry in. The ring waits paused with cells of its own: step out of it and back in, and it wakes for one hold, paid by those cells and the network\'s power, and carries you home.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'RAW', kind: 'process', title: 'Plasma from the Heaviest Stars', icon: 'gtceu:confined_vms_plasma_bucket',
    deps: ['J_TAR', 'MA_LIFT'], x: 18, y: -5,
    teach: {
      for: 'The &6Tarantula Stellar Lift&r draws raw plasma from R136\'s very massive stars, and only here at the Tarantula. A filter and a former, which run anywhere, turn it into confined core plasma.',
      needs: 'Lift nozzles and the lift itself at this platform. The plasma mass filter and the FRC former can stand at home.',
      unlocks: 'Nickel-56 and the burner that eats it.',
      automate: 'The wind never stops, so the lift never starves.',
    },
    desc: [],
    tasks: [it('gtceu:raw_vms_plasma_bucket'), it('gtceu:vms_core_plasma_bucket'), it('gtceu:confined_vms_plasma_bucket')],
    rewards: [xp(150)],
  },
  {
    key: 'NI56', kind: 'process', title: 'Nickel-56', icon: 'grindless:ni56_slug',
    deps: ['MA_CRUC'], x: 20, y: -6.5,
    teach: {
      for: 'The &6pair-instability crucible&r burns the core plasma into nickel-56 slugs and ash from the star\'s heavier half.',
      needs: 'A liner for the crucible, and confined plasma in bulk.',
      unlocks: 'The nickel-56 cask, and the burner that eats it.',
      automate: 'The ash goes home to the older lines. Do not let it pile up. The crucible can run anywhere.',
    },
    desc: [],
    tasks: [it('grindless:ni56_slug')],
    rewards: [xp(150)],
  },
  {
    key: 'CASK', kind: 'step', title: 'Shielded Nickel-56 Cask', icon: 'grindless:shielded_ni56_cask',
    deps: ['NI56'], x: 21.5, y: -7,
    desc: [
      'Nickel-56 decays within weeks, so the slug is canned and shielded the day it is made. The burner takes the finished cask.',
    ],
    tasks: [it('grindless:canned_ni56'), it('grindless:shielded_ni56_cask')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ the Stream
  {
    key: 'NAV17', kind: 'step', title: 'A Course for the Stream', icon: 'grindless:optical_nav_core',
    deps: ['J_TAR'], x: 18, y: 0,
    desc: [
      'The gate to the Magellanic Stream leaves from the ring here at 30 Doradus. Its hold takes a whole intergalactic relay probe, unlaunched, with a fresh navigation core inside. Check this off once that probe is in hand.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'STREAM', kind: 'step', title: 'The Magellanic Stream', icon: 'gtceu:pristine_gas_bucket',
    deps: ['NAV17'], x: 20, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      'When that hold completes, a platform appears in the Magellanic Stream, a river of gas torn from the Clouds and older than any star here. The ring at 30 Doradus gets its &6Relay Coordinates&r: ride there as before.',
    ],
    tasks: [dim('grindless:magellanic_stream')],
    rewards: [xp(250)],
  },
  {
    key: 'J_STR', kind: 'reading', title: 'The Platform in the Stream', icon: 'gtceu:pristine_gas_works',
    deps: ['STREAM'], x: 20.5, y: -2,
    desc: [
      'Gas this pristine has never been inside a star. A magnetic scoop sweeps it up, and what it holds is worth carrying home. The platform\'s ring takes you back the same way: step out of it and back in.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'PD', kind: 'process', title: 'Primordial Deuterium', icon: 'gtceu:primordial_deuterium_bucket',
    deps: ['J_STR', 'MA_GAS'], x: 23, y: -3.5,
    teach: {
      for: 'Deuterium from the first minutes of the universe, left in the Stream\'s gas. The works sweeps the gas up; a cold plant, a tower and a calutron pick out the heavy half.',
      needs: 'The gas works here. Then the cryogenic plant on the Moon, which liquefies the gas, a distillation tower and the calutron.',
      unlocks: 'Fuel for the fusion torus, and the beam injector that heats it.',
      automate: 'The gas never runs out. The calutron sets the pace.',
    },
    desc: [],
    tasks: [it('gtceu:pristine_gas_bucket'), it('gtceu:liquid_pristine_hydrogen_bucket'), it('gtceu:hd_fraction_bucket'), it('gtceu:primordial_deuterium_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'PHE3', kind: 'process', title: 'Pristine Helium-3', icon: 'gtceu:pristine_helium_3_bucket',
    deps: ['J_STR', 'MA_GAS'], x: 24.5, y: -3.5,
    teach: {
      for: 'Helium-3 from the same gas. The superfluid plant lets helium-4 flow through its leak and keeps the lighter isotope behind.',
      needs: 'The helium the Moon\'s cryogenic plant splits off, the superfluid helium plant, a distillation tower and a calutron to finish.',
      unlocks: 'The other half of the torus\'s fuel, and the converter stack that catches its charged products.',
      automate: 'Send the leftover helium back into your helium lines.',
    },
    desc: [],
    tasks: [it('gtceu:pristine_helium_bucket'), it('gtceu:he3_enriched_helium_bucket'), it('gtceu:crude_helium_3_bucket'), it('gtceu:pristine_helium_3_bucket')],
    rewards: [xp(200)],
  },
];
// Shipped shapes and Terminal passes (a pass is up to 2,300 blocks), from the structure dump.
const SIZE = { J_TAR: ['31 by 21 by 31', 4], J_STR: ['41 by 9 by 41', 3] };
for (const q of QUESTS) {
  const s = SIZE[q.key];
  if (s && q.teach) q.teach.needs += ` Its shape is ${s[0]}, built by the Terminal in ${s[1]} passes.`;
}
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
