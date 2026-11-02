// Quest data for maxplus_age_2 ("MAX+: The Local Group"), stage II: gate c18 to Andromeda, gate c19 to the Local Group filament and scale
// (docs/reforge/05_quest_design.md; docs/eras/maxplus.md, "Route" 7 to 9, "Places and site rules", "Bridges and first arrivals").
// Scale is taught here as journey steps only: the meta-materials of the loom. Its AE2 lesson and the parallel hatch are in maxplus_integration,
// the Hyperfactory is in maxplus_machines (XP-C2b), the creative items are in stage III (XP-C2c).
// Fixed keys (other chapters link to them): STAGE2, M31, VOID, STAGE2_END.
// Keys for XP-C2b to hang from: PNUC (photonuclear isotopes, blueshift forge), TETHER (deep horizon tether), VDIA (void crystal fab),
// SCALE (scale, Hyperfactory and the hatch), META_A and META_B (meta-material loom).
// Gate quests never reward the gate product: each is a dimension task and gives XP only.
// Positions: columns every 2, rows every 2 along y = 0.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const dim = (dimension) => ({ type: 'dimension', dimension });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'maxplus_age_2',
  era: 'maxplus',
  role: 'age',
  order: 1,
  icon: 'grindless:optical_nav_core',
  autofocus: 'STAGE2',
  section: { name: 'Stage II: The Local Group', origin: { x: 22, y: 0 } },
  title: 'MAX+: The Local Group',
  subtitle: ['A probe to Andromeda, another to the dark between the galaxies and the first meta-materials of the loom.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ Andromeda
  {
    key: 'STAGE2', kind: 'start', title: 'Stage II Begins', icon: 'grindless:optical_nav_core',
    deps: ['STREAM'], x: 0, y: 0,
    desc: [
      'The Stream and the Tarantula are running. Andromeda is next, then the dark between the galaxies. Both gates start from places you already own.',
    ],
    tasks: [ck()],
    rewards: [xp(100)],
  },
  {
    key: 'NAV18', kind: 'step', title: 'A Course for Andromeda', icon: 'grindless:optical_nav_core',
    deps: ['STAGE2'], x: 2, y: 0,
    desc: [
      'The gate to Andromeda is built at 30 Doradus. Its probe gets a navigation core cut for a nucleus that is coming toward us, and so for a different sky. It is the same item as before: if you hold one, that is all this step needs.',
    ],
    tasks: [ck()],
    rewards: [xp(200)],
  },
  {
    key: 'PROBE18', kind: 'step', title: 'Probe for M31', icon: 'grindless:ig_relay_probe',
    deps: ['NAV18'], x: 4, y: 0,
    desc: [
      'Build another intergalactic relay probe, the same recipe as before. The gate\'s hold at the Tarantula takes the finished probe, so keep it unlaunched. Check this off once it is in hand.',
    ],
    tasks: [ck()],
    rewards: [xp(200)],
  },
  {
    key: 'M31', kind: 'step', title: 'The Nucleus of M31', icon: 'grindless:launched_ig_probe',
    deps: ['PROBE18'], x: 6, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      'The gate opens on the nucleus of Andromeda, bathed in gamma light.',
    ],
    tasks: [dim('grindless:m31_nucleus_orbit')],
    rewards: [],
  },
  {
    key: 'J_M31', kind: 'reading', title: 'The Platform at M31', icon: 'gtceu:blueshift_forge',
    deps: ['M31'], x: 8, y: 0,
    desc: [
      'The horizon here is gentle enough to hang a factory from, and the light is hot enough to split nuclei. Bring a tether, and bring targets.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'TETHER', kind: 'process', title: 'A Deep Horizon Tether', icon: 'grindless:deep_horizon_tether',
    deps: ['J_M31'], x: 8.5, y: 1.5,
    teach: {
      for: 'The &6Deep Horizon Tether&r holds the blueshift forge at the right depth in the nucleus\'s pull. Too shallow and it burns; too deep and it never comes back.',
      needs: 'Kerr ribbon from the strand line, condensate for the coating, and a stellar elevator for the proof load.',
      unlocks: 'The blueshift forge\'s photonuclear recipes.',
      automate: 'Build the tether once per forge.',
    },
    desc: [],
    tasks: [it('grindless:proof_loaded_kerr_ribbon'), it('grindless:bound_coated_ribbon'), it('grindless:cured_bound_ribbon'), it('grindless:deep_horizon_tether')],
    rewards: [xp(250)],
  },
  {
    key: 'PNUC', kind: 'process', title: 'Photonuclear Isotopes', icon: 'gtceu:photonuclear_mix_bucket',
    deps: ['J_M31'], x: 8, y: -1.5,
    teach: {
      for: 'In the nucleus\'s photon bath a target is cracked into a mix of rare isotopes; the stellar forge then burns the mix into p-process plasma.',
      needs: 'The forge on its tether, and a calutron\'s enriched targets from home.',
      unlocks: 'Plasmas for stage III\'s tree.',
      automate: 'Targets in, isotopes out, and the light is free.',
    },
    desc: [],
    tasks: [it('gtceu:photonuclear_mix_bucket'), it('gtceu:p_process_plasma_bucket')],
    rewards: [xp(250)],
  },

  // ------------------------------------------------------------------ the filament
  {
    key: 'NAV19', kind: 'step', title: 'A Course for the Filament', icon: 'grindless:optical_nav_core',
    deps: ['J_M31'], x: 10, y: 0,
    desc: [
      'The last gate leaves from M31 and aims at the thin web of gas between the galaxies. Its navigation core is cut for a sky with almost nothing in it; it is the same item as before.',
    ],
    tasks: [ck()],
    rewards: [xp(250)],
  },
  {
    key: 'PROBE19', kind: 'step', title: 'Probe for the Filament', icon: 'grindless:ig_relay_probe',
    deps: ['NAV19'], x: 12, y: 0,
    desc: [
      'One more intergalactic relay probe, kept unlaunched: the gate\'s hold at M31 takes it. The platform here builds the gate; you carry the controller. Check this off once the probe is in hand.',
    ],
    tasks: [ck()],
    rewards: [xp(250)],
  },
  {
    key: 'VOID', kind: 'step', title: 'The Local Group Filament', icon: 'grindless:void_grown_diamond',
    deps: ['PROBE19'], x: 14, y: 0, shape: 'rsquare', size: 1.5,
    desc: [
      'Almost nothing here: cold, clean and dark.',
    ],
    tasks: [dim('grindless:local_group_filament')],
    rewards: [],
  },
  {
    key: 'J_VOID', kind: 'reading', title: 'The Platform in the Dark', icon: 'gtceu:void_crystal_fab',
    deps: ['VOID'], x: 16, y: 0,
    desc: [
      'No dust, no warmth, no light worth the name. Crystals grow slowly and without a flaw, which is why you came this far.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'VDIA', kind: 'process', title: 'Void-Grown Diamond', icon: 'grindless:void_grown_diamond',
    deps: ['J_VOID'], x: 18.5, y: -1.5,
    teach: {
      for: 'A diamond grown in the dark has no flaws to speak of. The fab grows it on a seed plate cut at home from older stock.',
      needs: 'The lattice fab at home for the plate, and the void crystal fab here.',
      unlocks: 'The engineered lattice, and with it the end of the stage.',
      automate: 'Seed plates travel by chest; the fab does the rest.',
    },
    desc: [],
    tasks: [it('grindless:c12_seed_plate'), it('grindless:void_grown_diamond')],
    rewards: [xp(250)],
  },
  {
    key: 'VLAT', kind: 'step', title: 'Void Crystal Lattice', icon: 'grindless:void_crystal_lattice',
    deps: ['VDIA'], x: 20, y: -1.5,
    desc: [
      'An implanter dopes the diamond and a femtosecond writer cuts the lattice. Home work again; the diamond only had to come from the dark.',
    ],
    tasks: [it('grindless:nv_engineered_diamond'), it('grindless:void_crystal_lattice')],
    rewards: [xp(300)],
  },

  // ------------------------------------------------------------------ scale
  {
    key: 'SCALE', kind: 'reading', title: 'Scale', icon: 'gtceu:hyperfactory',
    deps: ['J_VOID'], x: 18, y: 0,
    desc: [
      'The stage after this one wants millions of parts, and no one builds millions by hand. A bigger factory, a wider hatch and a grid that can hold the plan are coming. The Machines and Integration sections of this chapter have them.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },
  {
    key: 'META_A', kind: 'process', title: 'Meta-Materials: Shield and Guide', icon: 'grindless:horizon_shielding',
    deps: ['SCALE'], x: 20, y: 0,
    teach: {
      for: 'The meta-material loom weaves &6Horizon Shielding&r from a graded laminate, and a waveguide that the mK cryostat then chills.',
      needs: 'Gadolinium cermet from the ZPM line, and kerr strand for the waveguide.',
      unlocks: 'The tree\'s heat-proof parts.',
      automate: 'Keep the laminate and the tube on separate belts.',
    },
    desc: [],
    tasks: [it('grindless:horizon_shielding'), it('grindless:cold_horizon_waveguide')],
    rewards: [xp(250)],
  },
  {
    key: 'META_B', kind: 'process', title: 'Meta-Materials: Conduit and Valve', icon: 'grindless:horizon_valve',
    deps: ['SCALE'], x: 21.5, y: 4,
    teach: {
      for: 'The loom\'s other two weaves: a conduit for current and a valve that lets only helium through.',
      needs: 'Coated tape from the HTS line, and the aerogel works for the superleak plug.',
      unlocks: 'The tree\'s plumbing and wiring.',
      automate: 'The valve wants a cryostat of its own.',
    },
    desc: [],
    tasks: [it('grindless:cold_horizon_conduit'), it('grindless:horizon_valve')],
    rewards: [xp(250)],
  },
  {
    key: 'STAGE2_END', kind: 'exit', title: 'The Local Group Is Yours', icon: 'grindless:void_crystal_lattice',
    deps: ['VLAT', 'META_A', 'META_B'], x: 22, y: 0,
    desc: [
      'You have crystals from the dark and meta-materials from the loom. The last stage turns them into a gate, and into a great many creative parts.',
    ],
    tasks: [ck()],
    rewards: [xp(300)],
  },
];
