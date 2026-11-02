// Quest data for maxplus_age_1 ("MAX+: Out of the Galaxy"), stage I: the horizon lock as a key, horizon-bound matter, the Hills slingshot to
// 30 Doradus, the Tarantula, and gate c17 to the Magellanic Stream (docs/reforge/05_quest_design.md; docs/eras/maxplus.md, "Route" 1 to 6,
// "Places and site rules", "Bridges and first arrivals").
// Stage I asks for place products only. The machines (controllers), the kerr strand, the nine components and the horizon processor are in
// maxplus_machines and maxplus_circuits (XP-C2b); stage II is maxplus_age_2; older machines, power and AE2 are in maxplus_integration.
// Fixed keys (other chapters link to them): START, LMC, STREAM.
// Keys for XP-C2b to hang from: TAP (condensate), SETTLED (condensate refinery), BN (bound-matter press), KS (kerr strange alloy),
// BDEG (bound degenerate billet), CW (counterweight), PROBE (relay probe), PAIR (slingshot), LAUNCH, RAW (stellar lift), NI56 (crucible),
// CASK (nickel-56 cask and burner), NAV17, PD (gas works and torus), PHE3 (primordial helium-3).
// START depends on max:LOCK. No link to pl_maxplus yet (XP-PL). Travel uses the relay platforms; the platform chest holds the substage book.
// Gate quests never reward the gate product: each is a dimension task and gives XP only.
// Positions: columns every 2, rows every 2 along y = 0.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const dim = (dimension) => ({ type: 'dimension', dimension });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'maxplus_age_1',
  era: 'maxplus',
  role: 'age',
  order: 0,
  icon: 'grindless:horizon_lock',
  autofocus: 'START',
  section: { name: 'Stage I: Out of the Galaxy', origin: { x: 0, y: 0 } },
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
      'Neutronium bound into an ingot, then pressed. The &6Horizon Compressed Plate&r is the densest plate in the pack, and only the bound-matter press makes it.',
    ],
    tasks: [it('grindless:bound_neutronium_ingot'), it('grindless:horizon_compressed_plate')],
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
      'A canned counterweight of dense planetesimal core. The black hole keeps it, which is the honest ending for anything that heavy.',
    ],
    tasks: [it('grindless:dense_counterweight_core'), it('grindless:canned_counterweight')],
    rewards: [xp(150)],
  },
  {
    key: 'PROBE', kind: 'step', title: 'Intergalactic Relay Probe', icon: 'grindless:ig_relay_probe',
    deps: ['CW'], x: 8, y: 0,
    desc: [
      'The old galactic-centre probe will not leave the Galaxy. This one carries a Hawking drive and its own navigation. The Circuits section says how it gets its brains.',
    ],
    tasks: [it('grindless:probe_seed'), it('grindless:hawking_drive'), it('grindless:ig_relay_probe')],
    rewards: [xp(200)],
  },
  {
    key: 'PAIR', kind: 'step', title: 'A Bound Pair', icon: 'grindless:bound_probe_pair',
    deps: ['PROBE'], x: 10, y: 0,
    desc: [
      'Probe and counterweight go in together. The hole\'s tide splits them, keeps one and throws the other out of the Galaxy.',
    ],
    tasks: [it('grindless:bound_probe_pair')],
    rewards: [xp(150)],
  },
  {
    key: 'LAUNCH', kind: 'step', title: 'Probe Away', icon: 'grindless:launched_ig_probe',
    deps: ['PAIR'], x: 12, y: 0,
    desc: [
      'The probe is on its way. The gate catches it at the far end, timed against the still horizon, and the gate\'s hold takes a Horizon Lock as a catalyst.',
    ],
    tasks: [it('grindless:launched_ig_probe')],
    rewards: [xp(150)],
  },
  {
    key: 'LMC', kind: 'step', title: '30 Doradus', icon: 'grindless:launched_ig_probe',
    deps: ['LAUNCH'], x: 14, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      '      The gate opens in the Tarantula Nebula, beside the heaviest stars known.',
    ],
    tasks: [dim('grindless:tarantula_orbit')],
          rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ the Tarantula
  {
    key: 'J_TAR', kind: 'reading', title: 'The Platform at 30 Doradus', icon: 'gtceu:tarantula_stellar_lift',
    deps: ['LMC'], x: 16, y: 0,
    desc: [
      'A platform with a ring for the network, a deck and a chest holding the book for this place. Everything else you carry in.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'RAW', kind: 'process', title: 'Plasma from the Heaviest Stars', icon: 'gtceu:confined_vms_plasma_bucket',
    deps: ['J_TAR', 'MA_LIFT'], x: 18, y: -5,
    teach: {
      for: 'The &6stellar lift&r draws raw plasma from R136\'s very massive stars, and only here at the Tarantula. A filter and a former, which run anywhere, turn it into confined core plasma.',
      needs: 'A nozzle coil for the lift, and the lift itself at this platform; the filter and former can stand at home.',
      unlocks: 'Nickel-56, and the platform\'s first power.',
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
    tasks: [it('grindless:ni56_slug'), it('grindless:ime_ash')],
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
      'The next gate is built here, at 30 Doradus. It throws a probe with a navigation core of its own, pointed at the Magellanic Stream.',
    ],
    tasks: [it('grindless:optical_nav_core')],
    rewards: [xp(200)],
  },
  {
    key: 'STREAM', kind: 'step', title: 'The Magellanic Stream', icon: 'gtceu:pristine_gas_bucket',
    deps: ['NAV17'], x: 20, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      '      A river of gas torn from the Clouds, older than any star here.',
    ],
    tasks: [dim('grindless:magellanic_stream')],
          rewards: [xp(25)],
  },
  {
    key: 'J_STR', kind: 'reading', title: 'The Platform in the Stream', icon: 'gtceu:pristine_gas_works',
    deps: ['STREAM'], x: 20.5, y: -2,
    desc: [
      'Gas this pristine has never been inside a star. A magnetic scoop sweeps it up, and what it holds is worth carrying home.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'PD', kind: 'process', title: 'Primordial Deuterium', icon: 'gtceu:primordial_deuterium_bucket',
    deps: ['J_STR', 'MA_GAS'], x: 23, y: -3.5,
    teach: {
      for: 'Deuterium from the first minutes of the universe, left in the Stream\'s gas. The works sweeps it up, a tower fractionates it and a calutron picks the heavy half.',
      needs: 'The gas works here, then the cryogenic plant and the calutron.',
      unlocks: 'The fusion torus, and the next stage\'s isotopes.',
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
      needs: 'The plant at home, and a calutron to finish.',
      unlocks: 'The fusion torus, with the deuterium.',
      automate: 'Send the helium-4 back out; the condensate side wants it.',
    },
    desc: [],
    tasks: [it('gtceu:pristine_helium_bucket'), it('gtceu:he3_enriched_helium_bucket'), it('gtceu:crude_helium_3_bucket'), it('gtceu:pristine_helium_3_bucket')],
    rewards: [xp(200)],
  },
];
