// Quest data for opv_age ("OpV: The Galactic Bulge"), the journey chapter: the bulge relay, SGR 1806-20, Cygnus X-1 again, Terzan 5 and the gate
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/opv.md, "Route", "Places and site rules", "Quests", "Gate to MAX").
// The era's machines, circuits, wafers and components are in opv_machines and opv_circuits (RF-5Q-OpVb); the power plants, the parallel hatch,
// the network and the older machines' new modes are in opv_integration. A quest that asked for a machine and its product stays here as a product
// step under its old key, and the machine has a new key in opv_machines.
// The journey does not depend on the other OpV chapters, as UEV's does not.
// Fixed keys (other chapters link to them): START, LOOK, RELAY, LAUNCH, J_SGR, BCHART, STRAND, J_CYG, STACK, ANTIH, KCORE, TETRON, J_TERZ, NODE, MAX.
// Positions: columns every 2, rows every 2. The spine runs along y = 0; SGR is above it, Cygnus below, and Terzan 5 closes the way to the gate.
const it = (item, count) => ({ type: 'item', item, count });
const dim = (dimension) => ({ type: 'dimension', dimension });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.quests,
  order: 0,
  icon: 'gtceu:opv_machine_casing',
  autofocus: 'START',
  title: 'OpV: The Galactic Bulge',
  subtitle: ['Chain strand cables, a beam of antiprotons, a Kugelblitz and a fleet of probes: the way to the heart of the Milky Way.'],
};

export const QUESTS = [
  // ------------------------------------------------------------------ arrival and the relay
  {
    key: 'START', kind: 'start', title: 'The Galactic Bulge', icon: 'gtceu:opv_machine_casing',
    deps: ['X:3D7C8C36A2896D4E'], x: 0, y: 0,
    desc: [
      'The &6OpV Machine Casing&r is an assembly-line recipe researched with the Bulge Chart. The hull waits for parts nobody has made yet.',
      'The bulge is crowded and very old. Terzan 5 is a fossil of the early galaxy, and Sagittarius A* sits at its centre.',
    ],
    tasks: [it('gtceu:opv_machine_casing')],
    rewards: [xp(50)],
  },
  {
    key: 'LOOK', kind: 'reading', title: 'The Way In', icon: 'gtceu:opv_machine_casing',
    deps: ['START'], x: 2, y: 0,
    desc: [
      'Three places lie ahead: a magnetar for chain matter, Cygnus X-1 for the jet and a black hole\'s beam, and a globular cluster for probes.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },
  {
    key: 'RELAY', kind: 'step', title: 'Bulge Relay', icon: 'grindless:bulge_relay_seed',
    deps: ['LOOK'], x: 4, y: 0,
    desc: [
      'A relay seed is the first thing you send to the bulge. A pasta-strand magsail brakes it on the thin gas between the stars. The seed is made from UXV parts only.',
    ],
    tasks: [it('grindless:bulge_relay_seed')],
    rewards: [xp(100)],
  },
  {
    key: 'LAUNCH', kind: 'step', title: 'Seed Away', icon: 'grindless:launched_bulge_seed',
    deps: ['RELAY'], x: 6, y: 0,
    desc: [
      'The ring at Cygnus X-1 holds the relay seed, with the Bulge Chart kept in its store, and throws it across the dark between the arm and the bulge. The launched seed comes back out of the ring; keep it, because the final gate spends it.',
      'The gate is fiction. The magsail braking it uses is real physics.',
    ],
    tasks: [it('grindless:launched_bulge_seed')],
    rewards: [xp(150)],
  },
  {
    key: 'J_SGR', kind: 'step', title: 'SGR 1806-20', icon: 'grindless:launched_bulge_seed',
    deps: ['LAUNCH'], x: 8, y: -2,
    desc: [
      'When the hold completes, a platform appears in orbit round a magnetar, and the ring\'s output bus gets its &6Relay Coordinates&r: put them in a holding ring and stand inside to ride there, and step out of the platform\'s ring and back in to come home.',
      'The field here is about a thousand trillion times Earth\'s, strong enough to bend atoms into chains. Chain matter, field-frozen plate and positron cells come from here and nowhere else.',
    ],
    tasks: [dim('grindless:sgr1806_orbit')],
    rewards: [xp(200)],
  },
  {
    key: 'BCHART', kind: 'reading', title: 'Bulge Chart', icon: 'grindless:bulge_chart',
    deps: ['LAUNCH'], x: 8, y: 0,
    desc: [
      'The &6Bulge Chart&r you wrote at the last gate is already in hand. It is the research for the OpV casing, and the ring keeps it in store for every hold that leaves for the bulge, so leave it there. Tick this once it is in the ring.',
    ],
    tasks: [ck()],
    rewards: [xp(25)],
  },

  // ------------------------------------------------------------------ SGR 1806-20
  {
    key: 'STRAND', kind: 'step', title: 'Chain Strand', icon: 'gtceu:chain_strand_ingot',
    deps: ['J_SGR'], x: 10, y: -2,
    desc: [
      'The pasta machines skim the magnetar\'s crust, cage each phase and draw it into an &6ingot&r of chain-like matter. Chain strand is fiction. The crust and its field are real.',
    ],
    tasks: [it('gtceu:chain_strand_ingot')],
    rewards: [xp(150)],
  },
  {
    key: 'CABLE', kind: 'step', title: 'Chain Strand Cable', icon: 'gtceu:chain_strand_single_cable',
    deps: ['STRAND'], x: 12, y: -2,
    desc: [
      'The strand is drawn into wire, braided in PBO and sheathed. The &6Chain Strand Cable&r carries OpV power.',
    ],
    tasks: [it('gtceu:chain_strand_single_cable')],
    rewards: [xp(100)],
  },
  {
    key: 'LAMINA', kind: 'step', title: 'Chain Lamina', icon: 'grindless:chain_lamina_stack',
    deps: ['STRAND'], x: 12, y: -4,
    desc: [
      'Sheets of strand lattice are laminated with lasagna plate into a &6Chain Lamina Stack&r for the hull plates.',
    ],
    tasks: [it('grindless:chain_lamina_stack')],
    rewards: [xp(100)],
  },
  {
    key: 'HULL', kind: 'step', title: 'OpV Hull', icon: 'gtceu:opv_machine_hull',
    deps: ['CABLE', 'LAMINA'], x: 14, y: -4,
    desc: [
      'The &6OpV Machine Hull&r joins the casing, the cable and the lamina stack. Every OpV machine starts from one.',
    ],
    tasks: [it('gtceu:opv_machine_hull')],
    rewards: [xp(150)],
  },
  {
    key: 'POS', kind: 'step', title: 'Dense Positron Cell', icon: 'grindless:dense_positron_cell',
    deps: ['CABLE'], x: 14, y: -2,
    desc: [
      'A magnetar\'s field is strong enough to turn gamma rays into pairs of electrons and positrons. The magnetic pair converter here catches the positrons in a trap cell, and the electron beam furnace seals it into a &6Dense Positron Cell&r. The antihydrogen line needs it.',
    ],
    tasks: [it('grindless:dense_positron_cell')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ home
  {
    key: 'TETRON', kind: 'step', title: 'Tetron Array', icon: 'grindless:tetron_array',
    deps: ['BCHART'], x: 10, y: 2,
    desc: [
      'Dies are bumped, bonded and tested near absolute zero, then put together as a &6Tetron Array&r. The gate keeps one.',
    ],
    tasks: [it('grindless:tetron_array')],
    rewards: [xp(150)],
  },

  // ------------------------------------------------------------------ Cygnus X-1
  {
    key: 'J_CYG', kind: 'step', title: 'Back to Cygnus X-1', icon: 'gtceu:annihilation_engine',
    deps: ['BCHART'], x: 10, y: 0,
    desc: [
      'Back at Cygnus X-1, only the jet itself has to be tapped here: the jet beam line works at this orbit. The antiproton complex, the antihydrogen foundry and the Kugelblitz forge behind it can stand at home.',
    ],
    tasks: [dim('grindless:cygnus_x1_orbit')],
    rewards: [xp(100)],
  },
  {
    key: 'WINDOW', kind: 'step', title: 'Beam Window', icon: 'grindless:be_beam_window',
    deps: ['J_CYG'], x: 12, y: 0,
    desc: [
      'A thin beryllium foil lets the proton beam out and keeps the vacuum in. Brazed and tested, it is the &6Beryllium Beam Window&r.',
    ],
    tasks: [it('grindless:be_beam_window')],
    rewards: [xp(100)],
  },
  {
    key: 'STACK', kind: 'step', title: 'Antiproton Stack', icon: 'grindless:antiproton_stack_opv',
    deps: ['WINDOW'], x: 14, y: 0,
    desc: [
      'Protons strike an iridium target, and a decelerator slows what comes out until a trap can hold it. The trap stacks the antiprotons into an &6OpV Antiproton Stack&r. Half of them are lost to annihilation, so handle the stack with care.',
    ],
    tasks: [it('grindless:antiproton_stack_opv')],
    rewards: [xp(200)],
  },
  {
    key: 'ANTIH', kind: 'step', title: 'Antihydrogen Ice', icon: 'grindless:antihydrogen_ice_cell',
    deps: ['STACK', 'POS'], x: 16, y: 0,
    desc: [
      'An antiproton and a positron make antihydrogen, and a magnetic trap keeps it off the walls. Cooled by a Lyman-alpha laser, it freezes into an &6Antihydrogen Ice Cell&r.',
    ],
    tasks: [it('grindless:antihydrogen_ice_cell')],
    rewards: [xp(250)],
  },
  {
    key: 'DISTIL', kind: 'step', title: 'Strangelet Seed', icon: 'grindless:strangelet_seed',
    deps: ['J_CYG', 'TETRON'], x: 12, y: 2,
    desc: [
      'A lead beam fired into a target gives a fireball, and the distiller picks the seed of a strangelet out of it. A strangelet is a hypothesis. The seed is fiction.',
    ],
    tasks: [it('grindless:strangelet_seed')],
    rewards: [xp(200)],
  },
  {
    key: 'EXOTIC', kind: 'step', title: 'Stable Exotic Matter', icon: 'grindless:stable_exotic_matter',
    deps: ['DISTIL'], x: 14, y: 2,
    desc: [
      'The vault grows the seed by feeding it neutrons until it is stable. A stable strangelet is not observed. In this pack it is a fuel, and the gate keeps one.',
    ],
    tasks: [it('grindless:stable_exotic_matter')],
    rewards: [xp(250)],
  },
  {
    key: 'KCORE', kind: 'step', title: 'Kugelblitz Core', icon: 'grindless:kugelblitz_core',
    deps: ['EXOTIC', 'ANTIH'], x: 18, y: 0,
    desc: [
      'Light so dense it collapses into a black hole. The forge holds the seed, and the result is the &6Kugelblitz Core&r. A real Kugelblitz is only a prediction of general relativity. Here it is made on purpose, and the gate consumes it.',
    ],
    tasks: [it('grindless:kugelblitz_core')],
    rewards: [xp(300)],
  },
  {
    key: 'HAWK', kind: 'step', title: 'Hawking Drive', icon: 'grindless:hawking_drive',
    deps: ['KCORE'], x: 20, y: 0,
    desc: [
      'A black hole radiates, and the drive points that radiation one way. Globular clusters hold too little gas for a magsail, so the probe to Terzan 5 brakes on this drive.',
    ],
    tasks: [it('grindless:hawking_drive')],
    rewards: [xp(250)],
  },
  {
    key: 'CENSUS4', kind: 'step', title: 'Superheavy Census IV', icon: 'grindless:superheavy_census_iv',
    deps: ['HAWK'], x: 22, y: 2,
    desc: [
      'Nickel-64 from the magnetar and californium make elements 124 and 126, and the superheavy lab records them. Element 126 is fiction here: the real island of stability has not been found.',
    ],
    tasks: [it('grindless:superheavy_census_iv')],
    rewards: [xp(300)],
  },

  // ------------------------------------------------------------------ Terzan 5
  {
    key: 'PATH', kind: 'step', title: 'The Pathfinder', icon: 'grindless:launched_pathfinder',
    deps: ['HAWK', 'CENSUS4'], x: 22, y: 0,
    desc: [
      'A probe with a tetron array, an XNAV unit and a Hawking drive brakes into the cluster by itself. The Cygnus ring holds it and throws it; when the hold completes, a platform appears in the core of Terzan 5 and the ring\'s output bus gets its &6Relay Coordinates&r.',
    ],
    tasks: [it('grindless:launched_pathfinder')],
    rewards: [xp(250)],
  },
  {
    key: 'J_TERZ', kind: 'step', title: 'Terzan 5', icon: 'grindless:probe_seed',
    deps: ['PATH'], x: 24, y: 0,
    desc: [
      'Ride the coordinates there as before. Terzan 5 is a globular cluster, a ball of very old stars packed tight at the galaxy\'s centre. Its core is the last place before Sagittarius A*. Debris, metal and starlight are all here.',
    ],
    tasks: [dim('grindless:terzan5_core')],
    rewards: [xp(300)],
  },
  {
    key: 'DEBRIS', kind: 'step', title: 'Bulge Debris', icon: 'grindless:bulge_debris',
    deps: ['J_TERZ'], x: 26, y: 0,
    desc: [
      'The core is strewn with debris that no atmosphere has weathered. The debris harvester collects it as feed for the probes.',
    ],
    tasks: [it('grindless:bulge_debris')],
    rewards: [xp(150)],
  },
  {
    key: 'PSEED', kind: 'step', title: 'Probe Seed', icon: 'grindless:probe_seed',
    deps: ['DEBRIS'], x: 28, y: 0,
    desc: [
      'A probe that copies itself. The von Neumann foundry builds it from metal feedstock, a sinter casing and a kit from home that supplies what the cluster cannot. Self-replication is fiction here; a real one is far away.',
    ],
    tasks: [it('grindless:probe_seed')],
    rewards: [xp(250)],
  },
  {
    key: 'SINTER', kind: 'step', title: 'Sinter Casing', icon: 'grindless:cluster_sinter_casing',
    deps: ['PSEED'], x: 30, y: 0,
    desc: [
      'Every copy needs a shell. The replication refinery sinters cluster silicon into a &6Cluster Sinter Casing&r: the foundry is built with them, and no copy leaves without one.',
    ],
    tasks: [it('grindless:cluster_sinter_casing')],
    rewards: [xp(200)],
  },
  {
    key: 'NODE', kind: 'step', title: 'Deployed Node Packs', icon: 'grindless:deployed_node_pack',
    deps: ['SINTER'], x: 32, y: 0,
    desc: [
      'Each seed carries collector nodes out into the swarm, where they unfold and begin to collect starlight. A pack is consumed as it degrades, so the supply must never stop.',
    ],
    tasks: [it('grindless:deployed_node_pack')],
    rewards: [xp(250)],
  },
  {
    key: 'CENSUS3', kind: 'step', title: 'Bulge Light Census', icon: 'grindless:bulge_light_census',
    deps: ['NODE'], x: 34, y: 0,
    desc: [
      'With enough nodes running, the bulge collector records how much starlight the swarm gathers. The &6Bulge Light Census&r is the proof of a Kardashev III civilisation that the gate keeps.',
    ],
    tasks: [it('grindless:bulge_light_census')],
    rewards: [xp(300)],
  },

  // ------------------------------------------------------------------ the gate
  {
    key: 'MAX', kind: 'exit', title: 'Gate to MAX', icon: 'gtceu:max_machine_casing',
    deps: ['CENSUS3'], x: 36, y: 0,
    desc: [
      'The Sagittarius A* chart is not on any shelf yet. When your power is ready, the warp gate waits for the Kugelblitz core, the launched bulge seed, the light census, the stable exotic matter, a tetron array, census IV, the bulge chart and OpV-tier circuit tags.',
      'It writes the chart and researches the &6MAX Machine Casing&r. Charge your SMES bank first.',
    ],
    tasks: [it('gtceu:max_machine_casing')],
    rewards: [xp(400)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
