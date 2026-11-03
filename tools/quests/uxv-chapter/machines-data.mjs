// Quest data for uxv_machines: the 21 UXV multiblocks of ours and the stellar fractionation hall, in the order a player meets them (docs/eras/uxv.md,
// "Our multiblocks"; docs/reforge/05_quest_design.md, sections 2 and 3.2). Each machine quest asks for the controller and the casing that
// carries it; the hull, components and hatches belong to uxv_circuits, and line intermediates to the UXV Lines chart, so the product quests ask for
// end products only. Rows start at a link to a uxv_age quest: START for home and Cygnus X-1 (the elevator is reached from there), the Vela and Cas A jumps.
// Moved here from uxv_age with their keys: MTJ (the Spintronic Cluster Tool, which absorbed the racetrack fab and the oxide PLD chamber), WEAK, ISLAND, LIFT, CUTS, TOWER, DISK, FRC, BZ, PASTA, PHASE, WIRE,
// PLATE, TAP, KNOT, GLASER, MK6, HALL. New: VDWC and YIG (their machines were taught inside other quests) and the product quests.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.machines,
  filename: 'uxv_machines',
  era: 'uxv',
  role: 'machines',
  order: 2,
  icon: 'gtceu:uxv_fusion_reactor',
  autofocus: 'MTJ',
  title: 'UXV: Machines',
  subtitle: ['Spin-based fabs at home, then a lifted star, a pulsar\'s crust and a supernova\'s ashes: twenty-one machines and a fractionation hall.'],
};

export const LINKS = [
  { key: 'M_L_MTJ', ref: 'START', x: 0, y: 0 },
  { key: 'M_L_YIG', ref: 'START', x: 0, y: 4.5 },
  { key: 'M_L_SHQ', ref: 'START', x: 0, y: 6 },
  { key: 'M_L_MNT', ref: 'START', x: 0, y: 7.5 },
  { key: 'M_L_LIFT', ref: 'START', x: 0, y: 10 },
  { key: 'M_L_COMP', ref: 'COMP', x: 2, y: 13 },
  { key: 'M_L_PASTA', ref: 'JUMPV', x: 0, y: 15 },
  { key: 'M_L_KNOT', ref: 'JUMPC', x: 0, y: 20 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const gear = (key, id, title, deps, x, y, teach, extra = [], xpN = 120) => ({
  key, kind: 'machine', title, icon: 'gtceu:' + id, deps: deps_(deps), x, y, teach, desc: [],
  tasks: [it('gtceu:' + id), ...extra], rewards: [xp(xpN)],
});

const prod = (key, title, icon, deps, x, y, desc, xpN = 80) => ({
  key, kind: 'step', title, icon, deps: deps_(deps), x, y, desc, tasks: [it(icon)], rewards: [xp(xpN)],
});

const PLASCRETE = it('gtceu:plascrete');
const ROBUST = it('gtceu:robust_machine_casing');
const CLEAN = it('gtceu:clean_machine_casing');
const POWER = it('gtceu:high_power_casing');
const UXVC = it('gtceu:uxv_machine_casing');
const CRYO = it('grindless:cryostat_casing');
const SITE = it('grindless:neutron_star_site_casing');
const GUM = it('grindless:gum_metal_casing');
const PULSE = it('grindless:pulsed_field_casing');
const MU = it('grindless:mu_metal_shield_casing');
const TWO_PASS = 'GTM\'s Terminal places about 2,300 blocks per pass, so a structure this large takes two.';

export const QUESTS = [
  // ------------------------------------------------------------------ home: spintronics
  gear('MTJ', 'mtj_sputter_cluster', 'Spintronic Cluster Tool', ['M_L_MTJ'], 2, 0, {
    for: 'The &6Spintronic Cluster Tool&r lays magnetic layers a few atoms thick, with a magnesia barrier between them that nothing older can deposit.',
    needs: 'A UIV hull, about 1,350 gum metal and 870 mu-metal shield casings, the magnetron parts, and sputter targets from the melter. The shape is about 31 by 11 by 31 and about 2,350 blocks: ' + TWO_PASS,
    unlocks: 'The magnetic tunnel junction die, and through it the MRAM wafer, the racetrack chip and the multiferroic films of the MESO logic die. It also replaces the old racetrack fab and oxide laser chamber.',
    automate: 'Targets and silicon-28 by ME; the dies come out in a chest.',
  }, [GUM, MU]),
  gear('YIG', 'yig_lpe_furnace', 'YIG LPE Furnace', ['M_L_YIG'], 2, 4.5, {
    for: 'The &6YIG LPE Furnace&r dips a wafer into a molten bath and draws it out coated in a garnet film that carries spin waves almost without loss.',
    needs: 'A UIV hull, the robust casing, three heater bands and a platinum crucible.',
    unlocks: 'The magnonic bus the spintronic mainframe is wired with.',
    automate: 'Wafers and charge by ME; films take time, so run it in a stack of machines.',
  }, [ROBUST]),
  gear('VDWC', 'vdw_stacker', 'Van der Waals Stacker', ['YIG'], 2, 5.25, {
    for: 'The &6Van der Waals Stacker&r from UEV also takes the UXV work: it peels flakes of tungsten ditelluride, Fe3GeTe2 and boron nitride and presses them into a heterostack, and its assembly mode builds the magnetoelectric and MESO layers of the spintronic wafer.',
    needs: 'The UEV stacker: about 290 silicon carbide composite and 280 photonic casings, with stable casings and trinium coils. The shape is about 1,000 blocks. Nothing new is built for UXV; the stacking mode is selected by recipe.',
    unlocks: 'The SOT heterostack, the ME-on-spin layer and the MESO die.',
    automate: 'Flakes by ME; the stack is delicate, so output into a dedicated chest.',
  }, []),
  gear('WEAK', 'shequid_works', 'SHeQUID Works', ['M_L_SHQ'], 2, 6, {
    for: 'The &6SHeQUID Works&r fills two baths of superfluid helium, joins them through an array and seals the pair as a weak link.',
    needs: 'A UIV hull, the cryostat casing and a supply of superfluid helium.',
    unlocks: 'The weak link cell and the gyro the UXV sensor is built from.',
    automate: 'Helium by pipe; keep the nanoaperture arrays stocked by ME.',
  }, [CRYO]),
  gear('MNT', 'mnt_collider', 'MNT Collider', ['M_L_MNT'], 2, 7.5, {
    for: 'Collide uranium on curium and the two swap nucleons, leaving neutron-rich nuclei near the island of stability. The &6MNT Collider&r stops them in gas and weighs them by flight time.',
    needs: 'A UIV hull, about 2,000 gum metal and 800 pulsed field casings, a long beamline and a gas catcher. The shape is about 91 by 13 by 15 and about 3,550 blocks: ' + TWO_PASS,
    unlocks: 'Island nuclides, and with them the island chart the OpV research asks for.',
    automate: 'Targets and ion sources by ME; the yield is a trickle, so send it straight to the chart.',
  }, [GUM, PULSE]),

  // ------------------------------------------------------------------ Cygnus X-1
  gear('ELEV', 'stellar_elevator', 'Stellar Elevator', ['M_L_LIFT'], 2, 10, {
    for: 'The black hole already pulls its companion apart. The &6Stellar Elevator&r heats the star\'s surface where the pull is strongest and catches the stream as plasma. It works at Cygnus X-1 only.',
    needs: 'A UIV hull, about 740 pulsed field casings, silicon carbide composite for the shaft and a stack of coil rings, with power for the heating. The shape is about 23 by 57 by 23 and about 4,070 blocks: ' + TWO_PASS,
    unlocks: 'Stellar plasma, which the mass filter cuts and the condensation tower cools.',
    automate: 'The plasma goes by pipe to the filter; a tank in between keeps the lift steady.',
  }, [PULSE], 150),
  gear('PMF', 'plasma_mass_filter', 'Plasma Mass Filter', ['ELEV'], 4.5, 10, {
    for: 'A spinning plasma flings its heavy ions outward. The &6Plasma Mass Filter&r cuts the star into hydrogen, helium, carbon-nitrogen-oxygen and heavy cuts, and cleans disk plasma the same way.',
    needs: 'A UIV hull, about 260 pulsed field casings, silicon carbide composite for the drum and the radial ports. The shape is about 37 by 15 by 15 and about 1,440 blocks.',
    unlocks: 'The cuts that feed the Mk6 ring and the condensation tower.',
    automate: 'One tank per cut, each on its own pipe; the filter does not forgive a mixed line.',
  }, [PULSE], 150),
  gear('SKIM', 'accretion_disk_skimmer', 'Accretion Disk Skimmer', ['PMF'], 7, 10, {
    for: 'The gas falling into the hole spins in a disk hot enough to glow in X-rays. The &6Accretion Disk Skimmer&r skims its edge and sends the catch to the mass filter.',
    needs: 'A UIV hull, about 190 pulsed field casings, silicon carbide composite for the bowl and a rim of coils round it. The shape is about 19 by 9 by 19 and about 580 blocks.',
    unlocks: 'Filtered disk plasma, the fuel of the FRC former and the BZ dynamo.',
    automate: 'Route the catch by pipe to the filter and keep the surplus in a tank.',
  }, [PULSE], 150),
  gear('TOWER', 'stellar_condensation_tower', 'Stellar Condensation Tower', ['PMF'], 7, 11.5, {
    for: 'Cool a star slowly and its metals come out in the order a young solar system makes them. The &6Stellar Condensation Tower&r draws off refractory, metal and silicate condensates, and lets the volatiles out as gas.',
    needs: 'A UIV hull, about 860 gum metal and 180 pulsed field casings, and a draw-off pipe for every stage. The shape is about 13 by 31 by 13 and about 1,480 blocks.',
    unlocks: 'The condensates that go to the heavy cut, and syngas for the plants at home.',
    automate: 'A chest or tank per draw-off; the volatile gas needs somewhere to go.',
  }, [GUM, PULSE], 150),
  prod('CONDP', 'Refractory Condensate', 'grindless:refractory_condensate', ['TOWER'], 9.5, 11.5, ['The first thing to come out of the tower, and the hardest to melt. The UXV Lines chart shows what it becomes.']),
  gear('FRCF', 'frc_former', 'FRC Former', ['SKIM'], 9.5, 10, {
    for: 'A field-reversed configuration is a smoke ring of plasma that holds its own field. The &6FRC Former&r shoots one into a cartridge and keeps it there.',
    needs: 'A UIV hull, about 690 gum metal and 460 pulsed field casings, a formation tube and a capacitor bank. The shape is about 41 by 13 by 13 and about 1,540 blocks.',
    unlocks: 'The FRC cartridge: travel to Vela, the field generator and the gate all use one.',
    automate: 'Disk plasma by pipe; cartridges are consumed, so stock a generous chest.',
  }, [GUM, PULSE], 150),
  gear('BZ', 'bz_dynamo', 'BZ Dynamo', ['FRCF'], 12, 10, {
    for: 'A spinning black hole threaded by a magnetic field drives a current, and the hole slows down to pay for it. The &6BZ Dynamo&r burns flux-loaded plasma that way.',
    needs: 'A UIV hull, about 1,400 gum metal and 790 pulsed field casings, and a flux loop inside the torus. The shape is about 41 by 9 by 41 and about 2,470 blocks: ' + TWO_PASS,
    unlocks: 'Power at Cygnus X-1, with no fuel but the plasma.',
    automate: 'Feed flux-loaded plasma by pipe and ship the power home over the wireless link.',
  }, [GUM, PULSE], 200),
  gear('MK6', 'uxv_fusion_reactor', 'Mk6 Fusion Reactor', ['M_L_COMP', 'PMF'], 4.5, 13, {
    for: 'The &6Mk6 Fusion Reactor&r burns as a star does: hot CNO, then helium, carbon and oxygen. A direct converter takes the power off each ash, and one burn\'s ash is quenched into the next one\'s fuel.',
    needs: 'A UXV hull, UXV components, about 250 UXV fusion casings, 2,000 gum metal and 1,300 pulsed field casings, the Mk5 coil and fusion glass. The shape is about 45 by 11 by 45 and about 4,100 blocks: ' + TWO_PASS,
    unlocks: 'The plasma and burn quests that follow.',
    automate: 'Fuel and coolant by pipe; a ring that runs a star\'s burning stages on demand is fiction, so plan the ash chain first.',
  }, [it('grindless:uxv_fusion_casing'), GUM, PULSE, it('gtceu:fusion_glass')], 250),

  // ------------------------------------------------------------------ Vela
  gear('PEX', 'pasta_extractor', 'Pasta Extractor', ['M_L_PASTA'], 2, 15, {
    for: 'Deep in a neutron star\'s crust the nuclei melt into rods, sheets and holes that physicists call pasta. A glitch shakes the crust loose, and the &6Pasta Extractor&r times it.',
    needs: 'A UIV hull, about 260 pasta containment and 80 pulsed field casings, and a receiver cage. The shape is about 21 by 11 by 11 and about 490 blocks.',
    unlocks: 'Raw pasta, the start of every pasta item.',
    automate: 'Neutronium pellets by ME; wait for a glitch and collect the haul.',
  }, [PULSE]),
  gear('SORT', 'pasta_phase_sorter', 'Pasta Mill', ['PEX'], 4.5, 15, {
    for: 'The &6Pasta Mill&r separates rods from sheets in a squeezing cage, pulls spaghetti phase through aerogel into strand wire and presses lasagna phase onto a tungsten-fibre billet as plate. The residue goes to the core sample. Outside a neutron star, pasta would fly apart.',
    needs: 'A UIV hull, about 1,670 pasta containment and 810 pulsed field casings. It replaces the draw bench and laminator. About 55 by 13 by 19 and 2,850 blocks: ' + TWO_PASS,
    unlocks: 'Pasta strand wire, which the motor, the field generator and the SMES cell are wound with, and lasagna plate for the UXV hull.',
    automate: 'Raw pasta by ME; each phase to its own line.',
  }, [GUM, PULSE]),
  prod('LASP', 'Lasagna Plate', 'grindless:lasagna_plate', ['SORT'], 9.5, 16.5, [
  'The &6Lasagna Plate&r is the structural plate of the UXV hull and of every UXV part: a tungsten-fibre billet with a lasagna phase pressed onto it.',
  'The Pasta Mill makes it from the phase and a billet, which the sorting row supplies. It unlocks the UXV hull and, through it, every UXV machine. Plates stack quickly, so feed phase and billets by ME and send the plates on to the hull line.']),
  gear('TAP', 'polar_cap_tap', 'Polar Cap Tap', ['SORT'], 9.5, 15, {
    for: 'Above a pulsar\'s magnetic poles the field tears charges off the surface. The &6Polar Cap Tap&r lowers an electrode into that current and burns through it, at Vela only.',
    needs: 'A UIV hull, about 270 gum metal and 65 pulsed field casings, and a mast of insulator rings. The shape is about 13 by 17 by 13 and about 485 blocks.',
    unlocks: 'Power at Vela, for the gate hold and the machines out there.',
    automate: 'Electrodes by ME; the voltage is real, a way to collect it is not.',
  }, [GUM, PULSE]),

  // ------------------------------------------------------------------ Cassiopeia A and the laser
  gear('SWEEP', 'ejecta_knot_sweeper', 'Ejecta Knot Sweeper', ['M_L_KNOT'], 2, 20, {
    for: 'The star\'s core was thrown out in clumps still rich in what it made as it died. The &6Ejecta Knot Sweeper&r sweeps them up, behind a shield bow.',
    needs: 'A UIV hull, the Whipple shield casing and a filter collector.',
    unlocks: 'Ejecta knot dust, and titanium-44 from it.',
    automate: 'Shield weave by ME; the dust comes back by hopper.',
  }, [it('grindless:whipple_shield_casing')]),
  gear('GLASER', 'annihilation_laser_works', 'Annihilation Laser Works', ['SWEEP'], 7, 20, {
    for: 'Slow a core\'s positrons into positronium, cool it, then let it annihilate all at once into a beam. The &6Annihilation Laser Works&r makes the gamma laser module.',
    needs: 'A UIV hull, the robust casing as a gamma shield and a Penning trap.',
    unlocks: 'The gamma laser module, and the UXV emitter built round it.',
    automate: 'Titanium-44 cores by ME; the modules are few, so keep them in a chest.',
  }, [ROBUST]),
  prod('GAMMA', 'Gamma Laser Module', 'grindless:gamma_laser_module', ['GLASER'], 9.5, 20, ['A gamma-ray laser is fiction: nobody has built one. This one goes into the UXV emitter.']),
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
