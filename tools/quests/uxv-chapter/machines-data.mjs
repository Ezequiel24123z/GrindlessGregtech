// Quest data for uxv_machines: the 21 UXV multiblocks of ours and the stellar fractionation hall, in the order a player meets them (docs/eras/uxv.md,
// "Our multiblocks"; docs/reforge/05_quest_design.md, sections 2 and 3.2). Each machine quest asks for the controller and the casing that
// carries it; the hull, components and hatches belong to uxv_circuits, and line intermediates to the UXV Lines chart, so the product quests ask for
// end products only. Rows start at a link to a uxv_age quest: START for home and Cygnus X-1 (the elevator is reached from there), the Vela and Cas A jumps.
// Moved here from uxv_age with their keys: MTJ, RACE, MESO (the oxide PLD chamber), WEAK, ISLAND, LIFT, CUTS, TOWER, DISK, FRC, BZ, PASTA, PHASE, WIRE,
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
  { key: 'M_L_PLD', ref: 'START', x: 0, y: 1.5 },
  { key: 'M_L_VDW', ref: 'START', x: 0, y: 3 },
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

export const QUESTS = [
  // ------------------------------------------------------------------ home: spintronics
  gear('MTJ', 'mtj_sputter_cluster', 'MTJ Sputter Cluster', ['M_L_MTJ'], 2, 0, {
    for: 'The &6MTJ Sputter Cluster&r lays magnetic layers a few atoms thick, with a magnesia barrier between them that nothing older can deposit.',
    needs: 'A UIV hull, the plascrete shell and the magnetron parts, with sputter targets from the melter.',
    unlocks: 'The magnetic tunnel junction die, and through it the MRAM wafer and the racetrack chip.',
    automate: 'Targets and silicon-28 by ME; the dies come out in a chest.',
  }, [PLASCRETE]),
  gear('RACE', 'racetrack_fab', 'Racetrack Fab', ['MTJ'], 4.5, 0, {
    for: 'The &6Racetrack Fab&r patterns nanowires where magnetic domains slide, in a cleanroom with an electron beam over it.',
    needs: 'A UIV hull, the plascrete shell and the cleanroom parts, plus MRAM wafers to cut.',
    unlocks: 'The racetrack chip, which is the mainframe\'s storage.',
    automate: 'Wafers by ME; send chips on to the photonic hall.',
  }, [PLASCRETE]),
  gear('MESO', 'oxide_pld_chamber', 'Oxide PLD Chamber', ['M_L_PLD'], 2, 1.5, {
    for: 'The &6Oxide PLD Chamber&r fires a laser at a ceramic target and grows the plume as a crystal film, one oxide layer after another.',
    needs: 'A UIV hull, the plascrete shell, a heater under the chamber and a scandate substrate to grow on.',
    unlocks: 'The multiferroic films of the MESO logic die.',
    automate: 'Targets by ME and oxygen by pipe; films are fragile, so keep them in the chamber until the foundry needs them.',
  }, [PLASCRETE, it('gtceu:tritanium_coil_block')], 150),
  gear('VDWC', 'vdw_stacking_cell', 'vdW Stacking Cell', ['M_L_VDW'], 2, 3, {
    for: 'The &6vdW Stacking Cell&r picks single atomic layers with a stamp and presses them into a stack, in a glovebox that is flushed with argon.',
    needs: 'A UIV hull, the clean casing and a filter column for the argon.',
    unlocks: 'The spin-orbit readout of the MESO logic die.',
    automate: 'Layers by ME; stacks come out one at a time, so run two cells.',
  }, [CLEAN]),
  gear('YIG', 'yig_lpe_furnace', 'YIG LPE Furnace', ['M_L_YIG'], 2, 4.5, {
    for: 'The &6YIG LPE Furnace&r dips a wafer into a molten bath and draws it out coated in a garnet film that carries spin waves almost without loss.',
    needs: 'A UIV hull, the robust casing, three heater bands and a platinum crucible.',
    unlocks: 'The magnonic bus the spintronic mainframe is wired with.',
    automate: 'Wafers and charge by ME; films take time, so run it in a stack of machines.',
  }, [ROBUST]),
  gear('WEAK', 'shequid_works', 'SHeQUID Works', ['M_L_SHQ'], 2, 6, {
    for: 'The &6SHeQUID Works&r fills two baths of superfluid helium, joins them through an array and seals the pair as a weak link.',
    needs: 'A UIV hull, the cryostat casing and a supply of superfluid helium.',
    unlocks: 'The weak link cell and the gyro the UXV sensor is built from.',
    automate: 'Helium by pipe; keep the nanoaperture arrays stocked by ME.',
  }, [CRYO]),
  gear('MNT', 'mnt_collider', 'MNT Collider', ['M_L_MNT'], 2, 7.5, {
    for: 'Collide uranium on curium and the two swap nucleons, leaving neutron-rich nuclei near the island of stability. The &6MNT Collider&r stops them in gas and weighs them by flight time.',
    needs: 'A UIV hull, the high power casing, a long beamline and a gas catcher.',
    unlocks: 'Island nuclides, and with them the island chart the OpV research asks for.',
    automate: 'Targets and ion sources by ME; the yield is a trickle, so send it straight to the chart.',
  }, [POWER]),

  // ------------------------------------------------------------------ Cygnus X-1
  gear('ELEV', 'stellar_elevator', 'Stellar Elevator', ['M_L_LIFT'], 2, 10, {
    for: 'The black hole already pulls its companion apart. The &6Stellar Elevator&r heats the star\'s surface where the pull is strongest and catches the stream as plasma. It works at Cygnus X-1 only.',
    needs: 'A UIV hull, the UXV machine casing and a stack of coil rings, with power for the heating.',
    unlocks: 'Stellar plasma, which the mass filter cuts and the condensation tower cools.',
    automate: 'The plasma goes by pipe to the filter; a tank in between keeps the lift steady.',
  }, [UXVC], 150),
  gear('PMF', 'plasma_mass_filter', 'Plasma Mass Filter', ['ELEV'], 4.5, 10, {
    for: 'A spinning plasma flings its heavy ions outward. The &6Plasma Mass Filter&r cuts the star into hydrogen, helium, carbon-nitrogen-oxygen and heavy cuts, and cleans disk plasma the same way.',
    needs: 'A UIV hull, the high power casing and the radial ports.',
    unlocks: 'The cuts that feed the Mk6 ring and the condensation tower.',
    automate: 'One tank per cut, each on its own pipe; the filter does not forgive a mixed line.',
  }, [POWER], 150),
  gear('SKIM', 'accretion_disk_skimmer', 'Accretion Disk Skimmer', ['PMF'], 7, 10, {
    for: 'The gas falling into the hole spins in a disk hot enough to glow in X-rays. The &6Accretion Disk Skimmer&r skims its edge and sends the catch to the mass filter.',
    needs: 'A UIV hull, the UXV machine casing and a rim of coils round the bowl.',
    unlocks: 'Filtered disk plasma, the fuel of the FRC former and the BZ dynamo.',
    automate: 'Route the catch by pipe to the filter and keep the surplus in a tank.',
  }, [UXVC], 150),
  gear('TOWER', 'stellar_condensation_tower', 'Stellar Condensation Tower', ['PMF'], 7, 11.5, {
    for: 'Cool a star slowly and its metals come out in the order a young solar system makes them. The &6Stellar Condensation Tower&r draws off refractory, metal and silicate condensates, and lets the volatiles out as gas.',
    needs: 'A UIV hull, the UXV machine casing and a draw-off pipe for every stage.',
    unlocks: 'The condensates that go to the heavy cut, and syngas for the plants at home.',
    automate: 'A chest or tank per draw-off; the volatile gas needs somewhere to go.',
  }, [UXVC], 150),
  prod('CONDP', 'Refractory Condensate', 'grindless:refractory_condensate', ['TOWER'], 9.5, 11.5, ['The first thing to come out of the tower, and the hardest to melt. The UXV Lines chart shows what it becomes.']),
  gear('FRCF', 'frc_former', 'FRC Former', ['SKIM'], 9.5, 10, {
    for: 'A field-reversed configuration is a smoke ring of plasma that holds its own field. The &6FRC Former&r shoots one into a cartridge and keeps it there.',
    needs: 'A UIV hull, the high power casing, a formation tube and a capacitor bank.',
    unlocks: 'The FRC cartridge: travel to Vela, the field generator and the gate all use one.',
    automate: 'Disk plasma by pipe; cartridges are consumed, so stock a generous chest.',
  }, [POWER, CRYO], 150),
  gear('BZ', 'bz_dynamo', 'BZ Dynamo', ['FRCF'], 12, 10, {
    for: 'A spinning black hole threaded by a magnetic field drives a current, and the hole slows down to pay for it. The &6BZ Dynamo&r burns flux-loaded plasma that way.',
    needs: 'A UIV hull, the UXV machine casing and a flux loop inside the torus.',
    unlocks: 'Power at Cygnus X-1, with no fuel but the plasma.',
    automate: 'Feed flux-loaded plasma by pipe and ship the power home over the wireless link.',
  }, [UXVC], 200),
  gear('MK6', 'uxv_fusion_reactor', 'Mk6 Fusion Ring', ['M_L_COMP', 'PMF'], 4.5, 13, {
    for: 'The &6Mk6 Fusion Ring&r burns as a star does: hot CNO, then helium, carbon and oxygen. A direct converter takes the power off each ash, and one burn\'s ash is quenched into the next one\'s fuel.',
    needs: 'A UXV hull, UXV components, the UXV fusion casing, the Mk5 coil and fusion glass.',
    unlocks: 'The plasma and burn quests that follow.',
    automate: 'Fuel and coolant by pipe; a ring that runs a star\'s burning stages on demand is fiction, so plan the ash chain first.',
  }, [it('grindless:uxv_fusion_casing'), it('gtceu:fusion_glass')], 250),

  // ------------------------------------------------------------------ Vela
  gear('PEX', 'pasta_extractor', 'Pasta Extractor', ['M_L_PASTA'], 2, 15, {
    for: 'Deep in a neutron star\'s crust the nuclei melt into rods, sheets and holes that physicists call pasta. A glitch shakes the crust loose, and the &6Pasta Extractor&r times it.',
    needs: 'A UIV hull, the neutron star site casing and a receiver cage.',
    unlocks: 'Raw pasta, the start of every pasta item.',
    automate: 'Neutronium pellets by ME; wait for a glitch and collect the haul.',
  }, [SITE]),
  gear('SORT', 'pasta_phase_sorter', 'Pasta Phase Sorter', ['PEX'], 4.5, 15, {
    for: 'The &6Pasta Phase Sorter&r separates the rods from the sheets inside a cage that keeps each one squeezed. The anti-phase residue goes to the core sample the gate keeps.',
    needs: 'A UIV hull, the neutron star site casing and five cryostat cage bays.',
    unlocks: 'Spaghetti phase for wire and lasagna phase for plate.',
    automate: 'Raw pasta by ME; send each phase to its own line.',
  }, [SITE, CRYO]),
  gear('WIRE', 'pasta_draw_bench', 'Pasta Draw Bench', ['SORT'], 7, 15, {
    for: 'The &6Pasta Draw Bench&r pulls spaghetti phase through aerogel into strand wire, the UXV wire. Pasta as wire is fiction: outside a neutron star it would fly apart at once.',
    needs: 'A UIV hull, the neutron star site casing and a long, straight bed.',
    unlocks: 'Pasta strand wire, which the motor, the field generator and the SMES cell are wound with.',
    automate: 'Spaghetti phase by ME; wire leaves on a spool, so stock a few.',
  }, [SITE]),
  gear('PLATE', 'pasta_laminator', 'Pasta Laminator', ['SORT'], 7, 16.5, {
    for: 'The &6Pasta Laminator&r presses lasagna phase onto a tungsten-fibre billet as a plate, the plate of the UXV hull and parts. Pasta as plate is fiction, for the same reason as the wire.',
    needs: 'A UIV hull, the neutron star site casing and a robust platen.',
    unlocks: 'Lasagna plate, then the UXV hull.',
    automate: 'Phase and billets by ME; plates stack up, so send them on.',
  }, [SITE, ROBUST]),
  prod('LASP', 'Lasagna Plate', 'grindless:lasagna_plate', ['PLATE'], 9.5, 16.5, ['The plate every UXV hull and part is cut from.']),
  gear('TAP', 'polar_cap_tap', 'Polar Cap Tap', ['WIRE'], 9.5, 15, {
    for: 'Above a pulsar\'s magnetic poles the field tears charges off the surface. The &6Polar Cap Tap&r lowers an electrode into that current and burns through it, at Vela only.',
    needs: 'A UIV hull, the neutron star site casing and a mast of insulator rings.',
    unlocks: 'Power at Vela, for the gate hold and the machines out there.',
    automate: 'Electrodes by ME; the voltage is real, a way to collect it is not.',
  }, [SITE]),

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
