// Quest data for uxv_age ("UXV: Spin and Strange Stars"), the journey chapter: Cygnus X-1 again, the Kerr sling, Vela, Cassiopeia A and the gate
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uxv.md, "Route", "Places and site rules", "Quests", "Gate to OpV").
// UIV's journey ends with the arrival at Cygnus X-1; this one starts at the elevator there and does not teach the arrival again.
// The era's machines, circuits, wafers and components are in uxv_machines and uxv_circuits (RF-5Q-UXVb); the Mk6 burns, the two generators,
// the UXV cell and network, the parallel hatch, the fractionation hall and the older machines' new modes are in uxv_integration.
// Quests that moved there keep their keys and ids (BZ, TAP, CELL, PAR, HALL, MK6C4 in integration; MK6 and the rest in machines and circuits).
// Fixed keys (other chapters link to them): START, J_FUSION, J_SPIN, J_SUPER, LIFT, FRC, SEED, JUMPV, JUMPC, ARM, HOLD, OPV.
// Positions: columns every 2, rows every 2. The spine runs along y = 0; Cassiopeia A is above it, the home lanes sit at the left, above and below.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.quests,
  order: 0,
  icon: 'gtceu:uxv_machine_casing',
  autofocus: 'START',
  title: 'UXV: Spin and Strange Stars',
  subtitle: ['Logic that runs on spin, and three strange places: a black hole\'s companion star, a pulsar\'s crust and a supernova\'s ashes.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ start and home
  {
    key: 'START', kind: 'start', title: 'Spin and Strange Stars', icon: 'gtceu:uxv_machine_casing',
    deps: ['X:1433B6EB4860DF3C'], x: 0, y: 0,
    desc: [
      'The &6UXV Machine Casing&r is an assembly-line recipe researched with the Kerr chart. The hull waits for parts nobody has made yet.',
      'Home builds logic that runs on electron spin. Out there, Cygnus X-1\'s companion is lifted, a pulsar\'s crust is mined and a supernova\'s ashes are swept.',
    ],
    tasks: [it('gtceu:uxv_machine_casing')],
    rewards: [xp(50)],
  },
  {
    key: 'J_SPIN', kind: 'reading', title: 'Logic From Spin', icon: 'gtnn:spintronic_mainframe',
    deps: ['START'], x: 2, y: -4,
    desc: [
      'Magnets a few atoms thick make memory that keeps its bits with the power off, and a sensor made of superfluid feels the Earth turn. They lead to the spintronic mainframe, the UXV circuit.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_FUSION', kind: 'reading', title: 'A Star\'s Whole Life', icon: 'gtceu:uxv_fusion_reactor',
    deps: ['START'], x: 2, y: -2,
    desc: [
      'The Mk6 ring burns as a massive star does: hydrogen, helium, carbon and oxygen, one after another, each fed by the ash of the last. A ring that runs these stages on demand is fiction; the stages are real.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'J_SUPER', kind: 'reading', title: 'Past the Last Element', icon: 'gtceu:heavy_ion_cyclotron',
    deps: ['START'], x: 2, y: 4,
    desc: [
      'Fermium and einsteinium targets and a beam of titanium reach elements 121 and 122. They last moments, so the chemistry is built around speed. Census III and the island chart close the lane, and the gate keeps both.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'FM257', kind: 'step', title: 'Fermium-257 Target', icon: 'grindless:fm257_target',
    deps: ['J_SUPER'], x: 4, y: 4,
    desc: [
      'The calutron picks fermium-257 out of the fermium, the transuranium facility plates it, and the spark plasma sinterer fuses it into an &6Fm-257 Target&r.',
    ],
    tasks: [it('grindless:fm257_target')],
    rewards: [xp(150)],
  },
  {
    key: 'ES254', kind: 'step', title: 'Einsteinium-254 Target', icon: 'grindless:es254_target',
    deps: ['FM257'], x: 4, y: 6,
    desc: [
      'Einsteinium-254 is extracted from its solution and set into a target wheel. The &6Einsteinium-254 Target Wheel&r is the heavier half of element 121.',
    ],
    tasks: [it('grindless:es254_target')],
    rewards: [xp(150)],
  },
  {
    key: 'E121', kind: 'step', title: 'Element 121', icon: 'grindless:element_121_recoil',
    deps: ['ES254'], x: 6, y: 6,
    desc: [
      'Titanium-50 on einsteinium in the heavy ion cyclotron. The recoil is caught in the same Superheavy Factory and the superheavy lab seals them as an &6Element 121 Recoil&r.',
    ],
    tasks: [it('grindless:element_121_recoil')],
    rewards: [xp(200)],
  },
  {
    key: 'E122', kind: 'step', title: 'Element 122', icon: 'grindless:superheavy_census_iii',
    deps: ['FM257', 'E121'], x: 6, y: 4,
    desc: [
      'The same beam on the fermium target makes element 122. With both atoms in hand, the superheavy lab writes &6Superheavy Census III&r, which the gate keeps.',
    ],
    tasks: [it('grindless:element_122_recoil'), it('grindless:superheavy_census_iii')],
    rewards: [xp(250)],
  },
  {
    key: 'ISLAND', kind: 'step', title: 'Island Chart', icon: 'grindless:island_chart',
    deps: ['E122'], x: 8, y: 4,
    desc: [
      'Collide uranium on curium and the two swap nucleons, leaving neutron-rich nuclei near the island of stability. Weigh them by flight time and the &6Island Chart&r comes out.',
    ],
    tasks: [it('grindless:island_nuclide'), it('grindless:island_chart')],
    rewards: [xp(250)],
  },

  // ------------------------------------------------------------------ Cygnus X-1
  {
    key: 'LIFT', kind: 'step', title: 'Lift the Star', icon: 'gtceu:stellar_plasma_bucket',
    deps: ['START'], x: 2, y: 0,
    desc: [
      'Back at Cygnus X-1 the black hole already pulls its companion apart. The stellar elevator heats the surface where the pull is strongest and catches the stream as &6Stellar Plasma&r. It works here and nowhere else.',
    ],
    tasks: [it('gtceu:stellar_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'CUTS', kind: 'step', title: 'Stellar Cuts', icon: 'gtceu:stellar_cno_cut_bucket',
    deps: ['LIFT'], x: 4, y: 0,
    desc: [
      'A spinning plasma flings its heavy ions outward. The plasma mass filter cuts the star into hydrogen, helium, carbon-nitrogen-oxygen and heavy cuts. Take the &6Stellar CNO Cut&r home for the Mk6 and send the heavy one to the condensation tower.',
    ],
    tasks: [it('gtceu:stellar_cno_cut_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'DISK', kind: 'step', title: 'Skim the Disk', icon: 'gtceu:filtered_disk_plasma_bucket',
    deps: ['CUTS'], x: 6, y: 0,
    desc: [
      'The gas falling into the hole spins in a disk hot enough to glow in X-rays. The accretion disk skimmer takes its edge, and the mass filter turns the catch into &6Filtered Disk Plasma&r.',
    ],
    tasks: [it('gtceu:filtered_disk_plasma_bucket')],
    rewards: [xp(200)],
  },
  {
    key: 'FRC', kind: 'step', title: 'FRC Cartridge', icon: 'grindless:frc_cartridge',
    deps: ['DISK'], x: 8, y: 0,
    desc: [
      'A field-reversed configuration is a smoke ring of plasma that holds its own field. The FRC former shoots one into a &6FRC Cartridge&r and keeps it there. Vela travel needs one, and so does the gate.',
      'FRCs are real; one that sits in a cartridge until you need it is fiction.',
    ],
    tasks: [it('grindless:frc_cartridge')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ the Kerr sling
  {
    key: 'SEED', kind: 'step', title: 'The Kerr Sling', icon: 'grindless:launched_relay_seed',
    deps: ['FRC'], x: 10, y: 0,
    desc: [
      'Swing a relay seed through the ergosphere and it leaves with some of the hole\'s spin. The ergosphere probe bay launches it as a &6Launched Relay Seed&r. The laser sail on the Moon launches the same seed, and either one opens the way.',
      'The sling is fiction: nothing survives that close a pass, and no seed is this fast.',
    ],
    tasks: [it('grindless:launched_relay_seed')],
    rewards: [xp(200)],
  },
  {
    key: 'WHIPPLE', kind: 'step', title: 'Whipple Shield', icon: 'grindless:cnt_whipple_shield',
    deps: ['SEED'], x: 12, y: -2,
    desc: [
      'A thin bumper in front of a wall breaks up whatever hits it, so the wall only meets a spray. The &6CNT Whipple Shield&r carries a seed through the dust of a supernova remnant.',
      'Whipple shields are real; one that survives that crossing at that speed is fiction.',
    ],
    tasks: [it('grindless:cnt_whipple_shield')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ Vela
  {
    key: 'JUMPV', kind: 'step', title: 'Vela Pulsar', icon: 'grindless:vela_glitch_timing',
    deps: ['SEED'], x: 12, y: 0,
    desc: [
      'The first jump. The ring at Cygnus X-1 holds a launched seed and an FRC cartridge, and when the hold completes a platform appears at the Vela pulsar, a neutron star that spins eleven times a second and now and then speeds up.',
      'The ring\'s output bus gets the platform\'s &6Relay Coordinates&r. Put them in the input bus of a ring that is holding and stand inside to ride there; step out of the platform\'s ring and back in to come home.',
      'The jump is fiction, as every jump is. The pulsar and its glitches are real.',
    ],
    tasks: [dim('grindless:vela_pulsar_orbit')],
    rewards: [xp(300)],
  },
  {
    key: 'PASTA', kind: 'step', title: 'Raw Pasta', icon: 'grindless:raw_pasta',
    deps: ['JUMPV'], x: 14, y: 0,
    desc: [
      'Deep in a neutron star\'s crust the nuclei melt into rods, sheets and holes that physicists call pasta. A glitch shakes the crust loose; the pasta extractor times it and grows &6Raw Pasta&r from a neutronium pellet.',
    ],
    tasks: [it('grindless:raw_pasta')],
    rewards: [xp(250)],
  },
  {
    key: 'PHASE', kind: 'step', title: 'Caged Phases', icon: 'grindless:lasagna_phase',
    deps: ['PASTA'], x: 16, y: 0,
    desc: [
      'The pasta phase sorter separates the rods from the sheets inside a cage that keeps each one squeezed. You get &6Spaghetti Phase&r and &6Lasagna Phase&r, and the anti-phase residue goes to the core sample the gate keeps.',
    ],
    tasks: [it('grindless:spaghetti_phase'), it('grindless:lasagna_phase')],
    rewards: [xp(250)],
  },
  {
    key: 'V_FIC', kind: 'reading', title: 'Pasta as Cable', icon: 'gtceu:pasta_strand_single_wire',
    deps: ['PHASE'], x: 16, y: 2,
    desc: [
      'The Pasta Mill draws spaghetti into wire and presses lasagna into plate: the UXV cable and the UXV hull. Outside a neutron star both would fly apart at once. That is fiction; the crust is real.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ Cassiopeia A
  {
    key: 'JUMPC', kind: 'step', title: 'Cassiopeia A', icon: 'grindless:ejecta_knot_dust',
    deps: ['WHIPPLE'], x: 14, y: -2,
    desc: [
      'The second jump: the Cygnus ring holds a launched seed behind a Whipple shield, and when the hold completes a platform appears among the ejecta of one of the youngest supernova remnants in the galaxy. Ride its &6Relay Coordinates&r there as before. The jump is fiction; the remnant is real.',
    ],
    tasks: [dim('grindless:cas_a_remnant')],
    rewards: [xp(300)],
  },
  {
    key: 'KNOT', kind: 'step', title: 'Knot Dust', icon: 'grindless:ejecta_knot_dust',
    deps: ['JUMPC'], x: 16, y: -2,
    desc: [
      'The star\'s core was thrown out in clumps still rich in what it made as it died. The ejecta knot sweeper gathers &6Ejecta Knot Dust&r, and the X-ray pulse profiler maps its titanium-44.',
    ],
    tasks: [it('grindless:ejecta_knot_dust')],
    rewards: [xp(250)],
  },
  {
    key: 'TI44', kind: 'step', title: 'Titanium-44 Core', icon: 'grindless:ti44_core',
    deps: ['KNOT'], x: 18, y: -2,
    desc: [
      'Titanium-44 decays into a positron emitter and lives for decades. The cascade and the calutron take it out of the dust, and the hot cell seals it into a &6Ti-44 Core&r.',
    ],
    tasks: [it('grindless:ti44_core')],
    rewards: [xp(200)],
  },

  // ------------------------------------------------------------------ the gate
  {
    key: 'ARM', kind: 'step', title: 'Arm Chart', icon: 'grindless:arm_chart',
    deps: ['TI44', 'PHASE'], x: 20, y: 0,
    desc: [
      'The Matrioshka computing array puts the elevator log, the Vela glitch record, the titanium-44 map and the Cygnus radio record together into the &6Arm Chart&r: our arm of the galaxy, mapped toward the centre.',
      'The glitch record is read on Ganymede, where the gravitational-wave array listens against the Vela glitch timing the observatory decodes.',
    ],
    tasks: [it('grindless:arm_chart')],
    rewards: [xp(300)],
  },
  {
    key: 'HOLD', kind: 'milestone', title: 'Open the Bulge Gate', icon: 'gtceu:warp_gate',
    deps: ['ARM'], x: 22, y: 0,
    desc: [
      'Hold the warp gate open at the full UXV load for sixty seconds in Cygnus X-1 orbit, then tick this box. Plan your power first: a BZ dynamo and two polar cap taps come close, and a charged UXV cell covers the rest.',
      'The gate burns an FRC cartridge and keeps census III, the island chart, the arm chart, a pasta core sample and UXV-tier circuits in its store.',
    ],
    tasks: [ck()],
    rewards: [],
  },
  {
    key: 'BULGE', kind: 'step', title: 'Chart the Bulge', icon: 'grindless:bulge_chart',
    deps: ['HOLD'], x: 24, y: 0,
    desc: [
      'Through the open gate the seed looks at the crowded centre of the galaxy. The run gives the &6Bulge Chart&r.',
    ],
    tasks: [it('grindless:bulge_chart')],
    rewards: [xp(450)],
  },
  {
    key: 'OPV', kind: 'exit', title: 'Gate to OpV', icon: 'gtceu:opv_machine_casing',
    deps: ['BULGE'], x: 26, y: 0,
    desc: [
      'The &6Bulge Chart&r is the research for the OpV machine casing. Build it and the next voltage is open.',
    ],
    tasks: [it('gtceu:opv_machine_casing')],
    rewards: [xp(400)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
