// Quest data for uiv_age ("UIV: Dead Stars"), the journey chapter: home, Mercury, RX J1856.5-3754, PSR J0437-4715, Cygnus X-1 and the gate
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uiv.md, "Quests", "Gate to UXV").
// The era's machines, components and circuits are in uiv_machines and uiv_circuits (RF-5Q-UIVb); the Mk5 burns, the parallel hatch, the UIV
// cell and the older machines' new modes are in uiv_integration. Quests that moved there keep their keys and ids (CELL).
// The journey depends on journey quests only. Fixed keys (other chapters link to them): START, J_HOME, J_MH, J_LIGHT, J_FUSION, J_MERC,
// TPV, JUMP1, JUMP2, JUMP3, N_PELLET, R_CENSUS, E120, P_TIMED, EOS, NAV, GAMMA, KERR, SLED, C_HALF, HOLD, STORE, UXV.
// Positions: columns every 2.5, rows every 2. The spine runs along y = 0: home, Mercury, then one place after another.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'Gate to UXV', origin: { x: 0, y: 0 } },
  order: 0,
  icon: 'gtceu:uiv_machine_casing',
  autofocus: 'START',
  title: 'UIV: Dead Stars',
  subtitle: ['Metallic hydrogen, light and a fusion ring at home, then Mercury, a neutron star, a pulsar and a black hole, and a gate held open.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ home
  {
    key: 'START', kind: 'start', title: 'Dead Stars', icon: 'gtceu:uiv_machine_hull',
    deps: ['X:5316E435F8496672'], x: 0, y: 0,
    desc: [
      'The warp gate left you the &6UIV Machine Hull&r and a stack of casings. The stars you can reach now are the ones that already died: a neutron star, a pulsar and a black hole.',
      'Home first. Nothing out there is built without metallic hydrogen and a very hard alloy.',
    ],
    tasks: [it('gtceu:uiv_machine_hull'), it('gtceu:uiv_machine_casing')],
    rewards: [xp(50)],
  },
  {
    key: 'J_HOME', kind: 'reading', title: 'Home First', icon: 'gtceu:uiv_machine_hull',
    deps: ['START'], x: 2.5, y: 0,
    desc: [
      'Most of UIV is built at home. The jumps, the stations and the gate all need what three home lanes make, so the machine tabs come before the rockets.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_MH', kind: 'reading', title: 'Squeezed and Alloyed', icon: 'gtceu:ramp_compression_pulser',
    deps: ['J_HOME'], x: 5, y: -2,
    desc: [
      'Hydrogen squeezed until it conducts, a melt held in the air so nothing touches it, and a heavier element for the census. The metals and the cable come first; the parts follow.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_LIGHT', kind: 'reading', title: 'Computers of Light', icon: 'gtceu:beuv_scanner',
    deps: ['J_HOME'], x: 5, y: 2,
    desc: [
      'A crystal that keeps data for ever, a scanner for a shorter wavelength and a chip cold enough to think. They end in the optical mainframe, the UIV circuit.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_FUSION', kind: 'reading', title: 'A Polarised Ring', icon: 'gtceu:uiv_fusion_reactor',
    deps: ['J_HOME'], x: 5, y: 4,
    desc: [
      'Fuse nuclei with their spins lined up and you get about half as much again. The Mk5 ring burns polarised fuel, and a direct converter turns its plasma into the current the gate asks for.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ Mercury
  {
    key: 'J_MERC', kind: 'step', title: 'Mercury Orbit', icon: 'gtceu:matrioshka_computer',
    deps: ['J_HOME'], x: 7.5, y: 0,
    desc: [
      'The planet nearest the Sun gets nine times Earth\'s light. Park in &6Mercury&r orbit: the Matrioshka computer writes its charts here.',
    ],
    tasks: [dim('gcyr:mercury_orbit')],
    rewards: [xp(200)],
  },
  {
    key: 'M_SHELL', kind: 'reading', title: 'A Computer in Shells', icon: 'gtceu:droplet_radiator_works',
    deps: ['J_MERC'], x: 10, y: -2,
    desc: [
      'Each shell of the computer runs on the heat of the one inside it. Heat has nowhere to go in space but out, so the radiators are as big as the logic.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'TPV', kind: 'step', title: 'Thermophotovoltaic Shell', icon: 'grindless:matrioshka_tpv_shell',
    deps: ['J_MERC'], x: 10, y: 0,
    desc: [
      'A tile of indium gallium arsenide antimonide turns hot glow into power. Enough of them wrapped round a computer make the &6Matrioshka TPV Shell&r.',
    ],
    tasks: [it('grindless:tpv_tile'), it('grindless:matrioshka_tpv_shell')],
    rewards: [xp(200)],
  },
  {
    key: 'J_JUMP', kind: 'reading', title: 'Jumps Are Fiction', icon: 'gtceu:warp_gate',
    deps: ['TPV'], x: 12.5, y: 0,
    desc: [
      'The three stars are hundreds of light years away and no drive crosses that. A seed rides the warp gate along the chart, one jump to each place, and the orbit is real only in the game.',
    ],
    tasks: [ck()],
    rewards: [xp(50)],
  },

  // ------------------------------------------------------------------ RX J1856.5-3754
  {
    key: 'JUMP1', kind: 'step', title: 'RX J1856.5-3754', icon: 'grindless:neutron_star_site_casing',
    deps: ['J_JUMP'], x: 15, y: 0,
    desc: [
      'The first jump. A seed carries a probe to a lone neutron star and opens a ring there.',
      'The jump is fiction, as every jump is. The star, a cold X-ray emitter, is real.',
    ],
    tasks: [dim('grindless:rx_j1856_orbit')],
    rewards: [xp(250)],
  },
  {
    key: 'R_STAR', kind: 'reading', title: 'A Star Gone Out', icon: 'gtceu:crust_lift',
    deps: ['JUMP1'], x: 17.5, y: -2,
    desc: [
      'A neutron star packs a Sun into a ball a few miles wide. Its crust is the thinnest skin of matter anywhere, and the crust lift takes its matter from it. The crust lift and the neutronium pellet are fiction, and say so.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'N_PELLET', kind: 'step', title: 'Neutronium Pellet', icon: 'grindless:neutronium_pellet',
    deps: ['JUMP1'], x: 17.5, y: 0,
    desc: [
      'A spoonful of neutron matter held at ordinary pressure by a field is fiction: it is not the neutronium of the other mods. A &6Neutronium Pellet&r goes in the stored proof at the gate.',
    ],
    tasks: [it('grindless:neutronium_pellet')],
    rewards: [xp(300)],
  },
  {
    key: 'R_CENSUS', kind: 'step', title: 'Census II', icon: 'grindless:superheavy_census_ii',
    deps: ['JUMP1'], x: 17.5, y: 2,
    desc: [
      'Neutrons leaking out of the crust build the heavy elements, as in a kilonova. The &6Element 119 Recoil&r and &6Census II&r are the proof that the chain made new atoms.',
    ],
    tasks: [it('grindless:element_119_recoil'), it('grindless:superheavy_census_ii')],
    rewards: [xp(300)],
  },
  {
    key: 'E120', kind: 'step', title: 'Element 120', icon: 'grindless:element_120_recoil',
    deps: ['R_CENSUS'], x: 20, y: 2,
    desc: [
      'A titanium beam on a californium wheel leaves a few atoms of something new. The &6Element 120 Recoil&r is one more entry for the census. Real element 120 has never been made, so this one is a recipe and a hope.',
    ],
    tasks: [it('grindless:element_120_recoil')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ PSR J0437-4715
  {
    key: 'JUMP2', kind: 'step', title: 'PSR J0437-4715', icon: 'grindless:rad_hard_controller',
    deps: ['N_PELLET'], x: 20, y: 0,
    desc: [
      'The second jump: a pulsar close enough to time. A seed rides there on a course worked out with the neutron star, and the jump is fiction here too.',
    ],
    tasks: [dim('grindless:psr_j0437_orbit')],
    rewards: [xp(250)],
  },
  {
    key: 'P_PULSAR', kind: 'reading', title: 'A Lighthouse', icon: 'gtceu:pulsar_wind_trap',
    deps: ['JUMP2'], x: 22.5, y: -2,
    desc: [
      'A pulsar blinks hundreds of times a second, steadier than a clock, and blows a wind of electrons and positrons. The wind makes positronium; the blinks make a position.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'P_TIMED', kind: 'step', title: 'A Timed Profile', icon: 'grindless:xray_pulse_timed',
    deps: ['JUMP2'], x: 22.5, y: 0,
    desc: [
      'A pulse profile folded from the blinks and timed against a clock at home. Four of them fix a place in space.',
    ],
    tasks: [it('grindless:xray_pulse_timed')],
    rewards: [xp(250)],
  },
  {
    key: 'GAMMA', kind: 'step', title: 'Gamma Laser Cavity', icon: 'grindless:gamma_laser_cavity',
    deps: ['P_TIMED'], x: 26.25, y: 2,
    desc: [
      'Let a positronium condensate annihilate all at once and you get a gamma-ray laser. It is fiction: nobody has built one. The &6Gamma Laser Cavity&r is the core of the UIV emitter.',
    ],
    tasks: [it('grindless:gamma_laser_cavity')],
    rewards: [xp(300)],
  },
  {
    key: 'EOS', kind: 'step', title: 'Equation of State', icon: 'grindless:ns_eos_chart',
    deps: ['P_TIMED'], x: 25, y: 0,
    desc: [
      'Pulse profiles go into the Matrioshka, and the &6Neutron Star EOS Chart&r comes out. It tells you how hard a star pushes back. The computer decides on a long run.',
    ],
    tasks: [it('grindless:ns_eos_chart')],
    rewards: [xp(250)],
  },
  {
    key: 'NAV', kind: 'step', title: 'Navigation Solution', icon: 'grindless:pulsar_navigation_solution',
    deps: ['EOS'], x: 27.5, y: 0,
    desc: [
      'Four timed profiles and the equation of state give a position in space. The &6Pulsar Navigation Solution&r is what points the seed at the black hole.',
    ],
    tasks: [it('grindless:pulsar_navigation_solution')],
    rewards: [xp(300)],
  },

  // ------------------------------------------------------------------ Cygnus X-1
  {
    key: 'JUMP3', kind: 'step', title: 'Cygnus X-1', icon: 'grindless:probe_bay_casing',
    deps: ['NAV', 'GAMMA'], x: 30, y: 0,
    desc: [
      'The last jump: a black hole of many Suns, spinning fast enough to matter. The jump is fiction, and the black hole is real.',
    ],
    tasks: [dim('grindless:cygnus_x1_orbit')],
    rewards: [xp(300)],
  },
  {
    key: 'C_HOLE', kind: 'reading', title: 'The Spinning Hole', icon: 'gtceu:ergosphere_probe_bay',
    deps: ['JUMP3'], x: 32.5, y: -2,
    desc: [
      'A spinning black hole drags space round with it, and inside that skin, the ergosphere, a falling object can leave with more energy than it brought. The hole spins a little slower for it.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'KERR', kind: 'step', title: 'Kerr Chart', icon: 'grindless:kerr_chart',
    deps: ['JUMP3'], x: 32.5, y: 0,
    desc: [
      'The probe data goes home, and the gravitational-wave detector and the interferometer correlate it. The Matrioshka turns it into a &6Kerr Chart&r.',
    ],
    tasks: [it('grindless:correlated_kerr_data'), it('grindless:kerr_chart')],
    rewards: [xp(300)],
  },
  {
    key: 'SLED', kind: 'step', title: 'Split-Charge Sled', icon: 'grindless:split_charge_sled',
    deps: ['JUMP3'], x: 32.5, y: 2,
    desc: [
      'A compacted waste canister, a charge of cg-N and a hull. Every era\'s waste goes in: it is the last place anything is put.',
    ],
    tasks: [it('grindless:split_charge_sled')],
    rewards: [xp(250)],
  },
  {
    key: 'C_HALF', kind: 'step', title: 'Half a Sled Back', icon: 'grindless:recovered_half_sled',
    deps: ['SLED'], x: 35, y: 2,
    desc: [
      'Drop a sled into the ergosphere and it splits: one half falls in, the other comes out with more energy than it took. The &6Recovered Half-Sled&r goes back to the bay for a refit.',
    ],
    tasks: [it('grindless:recovered_half_sled')],
    rewards: [xp(300)],
  },

  // ------------------------------------------------------------------ the gate
  {
    key: 'HOLD', kind: 'exit', title: 'Open the Cygnus Gate', icon: 'gtceu:warp_gate',
    deps: ['KERR', 'C_HALF'], x: 37.5, y: 0,
    desc: [
      'Hold the warp gate open at the UIV load for sixty seconds in Cygnus X-1 orbit, then tick this box. Take care of your power first: the Penrose engine is the cheaper way to pay for it, not the only one.',
      'The gate\'s casing is never a reward: it is a product of the run.',
    ],
    tasks: [ck()],
    rewards: [xp(300)],
  },
  {
    key: 'STORE', kind: 'step', title: 'Stored Proof', icon: 'grindless:neutronium_pellet',
    deps: ['HOLD'], x: 40, y: 0,
    desc: [
      'Keep a neutronium pellet, census II, the equation of state chart, a half-sled and four UIV circuits in the store. The gate looks for them before it opens further.',
    ],
    tasks: [
      it('grindless:neutronium_pellet'), it('grindless:superheavy_census_ii'), it('grindless:ns_eos_chart'),
      it('grindless:recovered_half_sled'), it('gtnn:optical_mainframe', 4),
    ],
    rewards: [xp(300)],
  },
  {
    key: 'UXV', kind: 'step', title: 'Gate to UXV', icon: 'gtceu:uxv_machine_casing', size: 1.5,
    deps: ['STORE'], x: 42.5, y: 0,
    desc: [
      'The &6Kerr Chart&r is the research for the UXV machine casing. Build it and the next voltage is open.',
    ],
    tasks: [it('gtceu:uxv_machine_casing'), it('grindless:kerr_chart')],
    rewards: [xp(400)],
  },
];
