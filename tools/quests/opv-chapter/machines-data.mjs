// Quest data for opv_machines: the 15 OpV multiblocks of ours that are not generators, in the order a player meets them
// (docs/eras/opv.md, "Our multiblocks"; docs/reforge/05_quest_design.md, sections 2 and 3.2). The three generators, the assembly line array, the parallel hatch and the older-machine
// controllers are in opv_integration. Each machine quest asks for the controller and the casing or parts new in the age; the hull, components and hatches
// belong to opv_circuits, and the products the age keeps (tetron array, antihydrogen cell, strangelet seed, hawking drive, bulge debris, sinter casing,
// node pack) are steps in opv_age, so none is asked for twice. Rows start at a link to an opv_age quest: START for home, and the place quests for the rest.
// Moved here from opv_age with their keys: TFAB, GOPT, LAUE, SPALL, COOLER, LYMAN, VAULT, KFORGE, PRESS, FROZEN, FOUNDRY. The machine halves of ANTIH,
// DISTIL, DEBRIS, SINTER and NODE are AHF, SDIST, HARV, REFINE and NODEW. New: GATED, SHLD, NEGC, SRF, HE3, JET and MPC. PACC and the PARHATCH, REPEAT
// quests are not here: the positron accumulator is part of the antihydrogen foundry, the parallel hatch is in opv_integration, and REPEAT is a journey step.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.machines,
  filename: 'opv_machines',
  era: 'opv',
  role: 'machines',
  order: 2,
  icon: 'gtceu:kugelblitz_forge',
  autofocus: 'TFAB',
  title: 'OpV: Machines',
  subtitle: ['Qubits and antimatter at home, a black hole made of light, a magnetar press and a self-copying probe: fifteen machines.'],
};

export const LINKS = [
  { key: 'M_L_TFAB', ref: 'START', x: 0, y: 0 },
  { key: 'M_L_GOPT', ref: 'START', x: 0, y: 1.5 },
  { key: 'M_L_AHF', ref: 'START', x: 0, y: 3 },
  { key: 'M_L_VAULT', ref: 'START', x: 0, y: 4.5 },
  { key: 'M_L_JET', ref: 'J_CYG', x: 0, y: 7.5 },
  { key: 'M_L_MPC', ref: 'J_SGR', x: 0, y: 16.5 },
  { key: 'M_L_HARV', ref: 'J_TERZ', x: 0, y: 21 },
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
const CGLASS = it('gtceu:cleanroom_glass');
const LGLASS = it('gtceu:laminated_glass');
const FGLASS = it('gtceu:fusion_glass');
const COIL = it('gtceu:superconducting_coil');
const POWER = it('gtceu:high_power_casing');
const ROBUST = it('gtceu:robust_machine_casing');
const CLEAN = it('gtceu:clean_machine_casing');
const GRATING = it('gtceu:assembly_line_grating');
const NEG = it('grindless:neg_xhv_casing');
const SHIELD = it('grindless:annihilation_shield_casing');
const FROZENC = it('grindless:field_frozen_casing');
const SRFB = it('grindless:srf_cryomodule_block');

export const QUESTS = [
  // ------------------------------------------------------------------ home: qubits, gammas, antimatter
  gear('TFAB', 'tetron_fab', 'Tetron Fab', ['M_L_TFAB'], 2, 0, {
    for: 'The &6Tetron Fab&r grows two nanowires, bonds a superconducting backbone between them and tests the parity of the pair. Nothing older builds a qubit that is read that way.',
    needs: 'An OpV hull, the plascrete shell, cleanroom glass and a superconducting coil, with silicon-28 wafers to work on.',
    unlocks: 'The tetron die and the tetron array, which the chain parts need.',
    automate: 'Wafers and metals by ME; failed dies come out in their own output, so route them back to the start.',
  }, [PLASCRETE, CGLASS, COIL], 150),
  prod('GATED', 'Gated 2DEG Wafer', 'grindless:gated_2deg_wafer', ['TFAB'], 4.5, 0,
    ['The &6Gated 2DEG Wafer&r is a layered wafer whose electron sheet is switched by a gate. The tetron fab builds its nanowires from it.']),
  gear('GOPT', 'gamma_optics_works', 'Gamma Optics Works', ['M_L_GOPT'], 2, 1.5, {
    for: 'The &6Gamma Optics Works&r focuses gamma rays by Laue lensing, which nothing older can do. Gamma light of this energy only bends in a crystal.',
    needs: 'An OpV hull, the high power casing and laminated glass, and a Th-229 lasing crystal in the controller.',
    unlocks: 'The Laue lens, the gamma multilayer mirror and the gamma focus element. The lens and the mirror focus the Kugelblitz seed, and the mirror goes on into the Hawking drive and the MAX casing.',
    automate: 'Run each optic on its own circuit and keep a small stock of all three.',
  }, [POWER, LGLASS], 150),
  prod('LAUE', 'HPGE Compton Crystal', 'grindless:hpge_compton_crystal', ['GOPT'], 4.5, 1.5,
    ['The &6HPGE Compton Crystal&r is germanium pure enough to count single gamma rays, cooled in a closed helium loop. It is the eye of the OpV sensor.']),
  gear('AHF', 'antihydrogen_foundry', 'Antihydrogen Foundry', ['M_L_AHF'], 2, 3, {
    for: 'The &6Antihydrogen Foundry&r merges antiprotons and positrons in a trap, cools the atoms with a laser and freezes them into a cell. It is the first neutral antimatter in the pack.',
    needs: 'An OpV hull, the NEG XHV casing and the annihilation shield casing, a levitation trap cell and a Lyman-alpha laser, then antiprotons and positrons to work on.',
    unlocks: 'The antihydrogen ice cell, which the Kugelblitz core and the annihilation engine need.',
    automate: 'Antiprotons and positrons by the beam lines; cells are the product to chest.',
  }, [NEG, SHIELD], 200),
  prod('NEGC', 'NEG XHV Casing', 'grindless:neg_xhv_casing', ['AHF'], 4.5, 3,
    ['The &6NEG XHV Casing&r is lined with a non-evaporable getter that soaks up the last stray gas and holds an extreme-high vacuum. The foundry and the decelerator are built of it.']),
  prod('SHLD', 'Annihilation Shield Casing', 'grindless:annihilation_shield_casing', ['AHF'], 4.5, 4.5,
    ['The &6Annihilation Shield Casing&r stops gammas, neutrons and charged debris. Every machine that holds antimatter or a black hole is lined with it.']),
  prod('LYMAN', 'Th-229 Lasing Crystal', 'grindless:th229_lasing_crystal', ['NEGC'], 7, 3,
    ['The &6Th-229 Lasing Crystal&r is a thorium-doped crystal checked against the nuclear clock until it lases on the nucleus itself. The OpV emitter and the gamma optics works are built with one. The light that cools antihydrogen comes from a separate Lyman-alpha laser.']),
  gear('VAULT', 'strangelet_vault', 'Strangelet Vault', ['M_L_VAULT'], 2, 4.5, {
    for: 'The &6Strangelet Vault&r grows a strangelet seed inside a frozen field, where it cannot touch ordinary atoms, and feeds it until it is stable exotic matter. It also lines the cages and foils that strange matter needs.',
    needs: 'An OpV hull, the field-frozen casing and the annihilation shield casing, then seeds from the distiller and field-frozen plate.',
    unlocks: 'Stable exotic matter, which the Kugelblitz core and the gate to MAX need.',
    automate: 'Seeds go in by hatch and out by hatch; never keep them outside the vault.',
  }, [FROZENC, SHIELD], 150),

  // ------------------------------------------------------------------ Cygnus X-1: beam, target, cooling, black hole
  gear('JET', 'jet_beam_line', 'Jet Beam Line', ['M_L_JET'], 2, 7.5, {
    for: 'The &6Jet Beam Line&r draws protons from the base of the Cygnus X-1 jet and bunches them on superconducting cavities into a beam no Earth injector can reach.',
    needs: 'An OpV hull, the high power casing and SRF cryomodule blocks, with a chain field coil, an FRC cartridge and a field-frozen plate in the controller. Only its jet extraction is tied to Cygnus X-1.',
    unlocks: 'The proton beam for the antiproton complex, and through it every antiproton.',
    automate: 'Power and coolant by pipe; the beam is continuous, so give it a dedicated supply.',
  }, [POWER, SRFB], 200),
  prod('SRF', 'SRF Cryomodule Block', 'grindless:srf_cryomodule_block', ['JET'], 4.5, 7.5,
    ['The &6SRF Cryomodule Block&r is a niobium cavity in its own cryostat, which accelerates a beam with very little loss. The jet beam line and the antiproton decelerator are built of them, so make them first.']),
  gear('COOLER', 'antiproton_decelerator', 'Antiproton Complex', ['JET'], 2, 10.5, {
    for: 'The &6Antiproton Complex&r is four machines in one hall, one recipe row each. An iridium target and a lithium hydride shield make a hot antiproton beam; stochastic and electron cooling slow it, and ELENA, the last ring, bunches it into a Penning trap: the &6Cold Antiproton Cell&r.',
    needs: 'An OpV hull, the NEG XHV and annihilation shield casings and SRF cryomodule blocks, behind the jet beam line. Each row burns a part: target, pickup, electron cooler, or a trap.',
    unlocks: 'The cold antiproton cell for the antihydrogen foundry, and the antiproton stacks.',
    automate: 'Parts by ME; the empty traps come back from the foundry, so loop them.',
  }, [POWER, NEG, SRFB, SHIELD], 200),
  gear('SDIST', 'strangelet_distiller', 'Strangelet Distiller', ['COOLER'], 2, 12, {
    for: 'The &6Strangelet Distiller&r boils the strangeness out of a lead-208 fireball and catches it as a droplet seed, catalysed by a pasta core sample.',
    needs: 'An OpV hull, the field-frozen casing and fusion glass.',
    unlocks: 'The strangelet seed, and the exotic matter after it.',
    automate: 'Beam and sample by ME; seeds go straight to the vault.',
  }, [FROZENC, FGLASS], 200),
  gear('KFORGE', 'kugelblitz_forge', 'Kugelblitz Forge', ['SDIST'], 2, 13.5, {
    for: 'The &6Kugelblitz Forge&r crowds so much light into one point that it collapses into a black hole made of light. It is the largest machine of the age.',
    needs: 'An OpV hull, field-frozen and annihilation shield casing, and fusion coils, with the gamma optics works and a huge power supply behind it.',
    unlocks: 'The kugelblitz core, and the Hawking radiation of the collector.',
    automate: 'Feed power and gammas by hatch; build the shield first and the coils last.',
  }, [FROZENC, SHIELD, it('gtceu:fusion_coil')], 300),

  // ------------------------------------------------------------------ SGR 1806-20: a magnetar press
  gear('MPC', 'magnetic_pair_converter', 'Magnetic Pair Converter', ['M_L_MPC'], 2, 16.5, {
    for: 'The &6Magnetic Pair Converter&r turns gammas into electron and positron pairs inside the magnetar field, seeded by a positron plasma from home. Only a field this strong allows it.',
    needs: 'An OpV hull, the field-frozen casing and field-frozen plate from the press, a gamma laser and a chain field coil, then gamma light and a rotating-wall positron plasma.',
    unlocks: 'Unsealed positron cells, which the electron beam furnace seals into dense positron cells.',
    automate: 'Seed plasma by hatch; send the cells to the furnace and on to the antihydrogen foundry.',
  }, [FROZENC]),
  gear('PRESS', 'field_frozen_press', 'Field-Frozen Press', ['MPC'], 2, 18, {
    for: 'The &6Field-Frozen Press&r presses chain-matter laminae in the magnetar field so that the field stays frozen in the billet.',
    needs: 'An OpV hull, the high power casing and a tungsten steel frame, with laminae from the chain-matter line.',
    unlocks: 'The field-frozen plate and, from it, the field-frozen casing that the pair converter, the vault, the distiller and the forge are built of.',
    automate: 'Laminae by ME; plates come out stacked, so chest them for the casing.',
  }, [POWER, it('gtceu:tungsten_steel_frame')], 150),
  prod('FROZEN', 'Field-Frozen Plate', 'grindless:field_frozen_plate', ['PRESS'], 4.5, 18,
    ['The &6Field-Frozen Plate&r keeps the magnetar field it was pressed in. Pressed into the &6Field-Frozen Casing&r, it is what the vault, the distiller and the forge are built of.']),
  prod('HE3', 'Superfluid He-3 Seal', 'grindless:superfluid_he3_seal', ['FROZEN'], 7, 18,
    ['The &6Superfluid He-3 Seal&r keeps a superfluid from creeping past a moving shaft. The OpV pump and fluid regulator are built with it, and so, later, is the MAX pump.']),

  // ------------------------------------------------------------------ Terzan 5: a self-copying probe
  gear('HARV', 'debris_harvester', 'Debris Harvester', ['M_L_HARV'], 2, 21, {
    for: 'The &6Debris Harvester&r collects and sorts the debris of the core into metal and silicate, so the cluster feeds the probe with nothing from home.',
    needs: 'An OpV hull, the robust casing and a steel gearbox.',
    unlocks: 'The bulge debris, and the refinery behind it.',
    automate: 'Run it continuously and split the output by item filter into metal and silicate.',
  }, [ROBUST, it('gtceu:steel_gearbox')], 150),
  gear('REFINE', 'replication_refinery', 'Replication Refinery', ['HARV'], 2, 22.5, {
    for: 'The &6Replication Refinery&r turns local silicon and metal into probe feedstock by two real routes, and sinters the rest into the casing of the next probe.',
    needs: 'An OpV hull, the clean casing, titanium pipe casing and a heat vent.',
    unlocks: 'The cluster sinter casing, and the probe parts for the foundry.',
    automate: 'Chain it to the harvester by pipe and belt; it never needs anything from home.',
  }, [CLEAN, it('gtceu:titanium_pipe_casing'), it('gtceu:heat_vent')], 200),
  gear('NODEW', 'collector_node_works', 'Collector Node Works', ['REFINE'], 4.5, 22.5, {
    for: 'The &6Collector Node Works&r turns local silicon into thin photovoltaic nodes and packs them onto a seed, four at a time.',
    needs: 'An OpV hull, cleanroom glass, plascrete and assembly line grating.',
    unlocks: 'The deployed node pack, and the bulge collector.',
    automate: 'Silicon from the harvester line; one pack per seed, so send them straight out.',
  }, [CGLASS, PLASCRETE, GRATING]),
  gear('FOUNDRY', 'von_neumann_foundry', 'Von Neumann Foundry', ['REFINE'], 2, 24, {
    for: 'The &6Von Neumann Foundry&r builds a probe that builds a copy of itself, from feedstock and parts made on the spot. Once a seed is here, the cluster feeds its own growth.',
    needs: 'An OpV hull, the robust casing and assembly line grating, with cluster sinter casings, a tetron array and an XNAV unit in the controller, and feedstock from the refinery.',
    unlocks: 'The self-copying probe seed.',
    automate: 'Every input comes from the cluster by belt, so wire it to the refinery.',
  }, [ROBUST, GRATING], 250),
];
// Shipped shapes and Terminal passes (a pass is up to 2,300 blocks), from the structure dump.
const SIZE = {
  TFAB: ['17 by 11 by 15', 2], GOPT: ['31 by 9 by 9', 1], AHF: ['25 by 11 by 13', 2], VAULT: ['13 by 13 by 13', 1],
  JET: ['45 by 7 by 7', 1], COOLER: ['29 by 7 by 29', 2], SDIST: ['19 by 11 by 11', 1], KFORGE: ['23 by 17 by 23', 3],
  MPC: ['13 by 17 by 13', 2], PRESS: ['11 by 15 by 11', 1], HARV: ['15 by 7 by 15', 1], REFINE: ['13 by 15 by 13', 2],
  NODEW: ['21 by 9 by 13', 2], FOUNDRY: ['17 by 13 by 17', 2],
};
for (const q of QUESTS) {
  const s = SIZE[q.key];
  if (s) q.teach.needs += ` Its shape is ${s[0]}, built by the Terminal in ${s[1] === 1 ? 'one pass' : s[1] + ' passes'}.`;
}
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
