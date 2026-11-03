// Quest data for max_machines: machines 1 to 7, 9 and 10 of ours (docs/eras/max.md, "Machines"; docs/reforge/05_quest_design.md, sections 2 and 3.2), in the
// order a player meets them: four at home, three at Sgr A*, two in the belt. The mirror shell (8) and machines 11 to 14 are max_horizon's. Each machine quest
// asks for the controller and the casing that is new in MAX (casings older than MAX are named in the text); the hull, components and hatches belong to
// max_circuits, line intermediates to the MAX Lines chart, so the product quests ask for end products only. The imager's products (the spin map and the
// ephemeris) stay journey steps in max_age. Rows start at a link to a max_age quest: START for home, GATE14 for Sgr A*, GATE15 for the belt. All keys are
// new (prefix M_): the old max_age gears and products are replaced, never copied, so no key is defined twice.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.machines,
  filename: 'max_machines',
  era: 'max',
  role: 'machines',
  order: 2,
  icon: 'gtceu:gene_ark',
  autofocus: 'M_RYD',
  title: 'MAX: Machines',
  subtitle: ['Atoms in light, films one atom thick and a library of genomes at home, then a winch, an injector and a furnace at the galactic centre.'],
};

export const LINKS = [
  { key: 'M_L_RYD', ref: 'START', x: 0, y: 0 },
  { key: 'M_L_ATOM', ref: 'START', x: 0, y: 1.5 },
  { key: 'M_L_MEMB', ref: 'START', x: 0, y: 3 },
  { key: 'M_L_IMG', ref: 'GATE14', x: 0, y: 6 },
  { key: 'M_L_WINCH', ref: 'GATE14', x: 0, y: 7.5 },
  { key: 'M_L_INJ', ref: 'GATE14', x: 0, y: 9 },
  { key: 'M_L_FURN', ref: 'GATE15', x: 0, y: 11 },
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

const TABLE = it('grindless:max_optical_table_casing');
const ROLLER = it('grindless:membrane_roller_casing');
const DRUM = it('grindless:geroch_drum_casing');
const TURN = it('grindless:stream_turn_casing');
const COIL = it('grindless:feeder_coil_casing');
const SINTER = it('grindless:cluster_sinter_casing');

export const QUESTS = [
  // ------------------------------------------------------------------ home
  gear('M_RYD', 'rydberg_array_works', 'Rydberg Array Works', ['M_L_RYD'], 2.5, 0, {
    for: 'Hundreds of atoms held in light, swollen to a thousand times their size and made to compute together. The &6Rydberg Array Works&r makes the logic that the imager, the ark and the shell run on.',
    needs: 'The MAX hull, the optical table casing on atomic casing, a vacuum chamber of strand coils and a tweezer die as research. The body is 1,980 blocks (853 optical table, 733 truss, 354 membrane vacuum casings): 1 Terminal pass.',
    unlocks: 'The Rydberg logic array, which the ark, the imager and the mirror shell all consume.',
    automate: 'A spent array comes back to be refurbished, so loop it home instead of binning it.',
  }, [TABLE]),
  prod('M_RYDA', 'Rydberg Logic Array', 'grindless:rydberg_logic_array', ['M_RYD'], 5, 0, [
    'The first array is the hard one. After that, every spent array goes back into the works.',
  ]),
  gear('M_ATOM', 'atom_interferometer_works', 'Atom Interferometer Works', ['M_L_ATOM'], 2.5, 1.5, {
    for: 'Matter waves on an optical table, split and joined again to weigh gravity itself. The &6Atom Interferometer Works&r makes the gradiometer behind the MAX sensor.',
    needs: 'The MAX hull and the optical table casing, a tall drop tower with a magnetic shield, and a space of its own, because every footstep shows up as noise. The body is 1,916 blocks (817 truss, 613 membrane vacuum, 325 optical table, 144 clamp coil casings): 1 Terminal pass.',
    unlocks: 'The matter-wave gradiometer, so the MAX sensor, and with it the controllers that want one.',
    automate: 'Run it from a pattern provider; the gradiometer is the only thing it makes, so a single chest does it.',
  }, [TABLE]),
  prod('M_GRADIO', 'Matter-Wave Gradiometer', 'grindless:matter_wave_gradiometer', ['M_ATOM'], 5, 1.5, [
    'It measures how steeply gravity falls from one atom to the next. The MAX sensor and the mass stream injector both want one.',
  ]),
  gear('M_MEMB', 'membrane_line', 'Membrane Line', ['M_L_MEMB'], 2.5, 3, {
    for: 'A film one atom thick, rolled, grown and chilled along a long line. The &6Membrane Line&r makes the superconducting membrane that no older machine can.',
    needs: 'The MAX hull and a long run of roller casings through a CVD zone and a cold zone, with room for the length. The body is 2,114 blocks (939 truss casings among them): 1 Terminal pass.',
    unlocks: 'The superconducting membrane, the conveyor module, the field generator and the hatches that move fluids.',
    automate: 'The line is long but quiet: feed it by ME and send the membrane to the ark and the hall.',
  }, [ROLLER]),
  prod('M_MEMBA', 'Superconducting Membrane', 'grindless:superconducting_membrane', ['M_MEMB'], 5, 3, [
    'A skin that carries current with no loss. It shows up in the conveyor, the field generator and the hatches, so make it early.',
  ]),
  gear('M_ARK', 'gene_ark', 'Gene Ark', ['M_RYDA', 'M_MEMBA'], 7.5, 1.5, {
    for: 'A library of every genome the pack has met, written to crystal in a sealed cold vault. The &6Gene Ark&r makes the genome archive that goes into the last seed.',
    needs: 'The MAX hull, a sterilising filter casing vault with a cryogenic core, a Rydberg logic array and a superconducting membrane. The body is 1,915 blocks (884 membrane vacuum, 818 truss casings): 1 Terminal pass.',
    unlocks: 'The genome archive, which the later gates and MAX+ count on.',
    automate: 'Genomes arrive by ME; one archive is enough, so cap it.',
  }),
  prod('M_GENOME', 'Genome Archive', 'grindless:genome_archive', ['M_ARK'], 10, 1.5, [
    'The &6Genome Archive&r is every genome the pack has met, written to crystal: what is written there is what the new universe remembers.',
    'The Gene Ark makes it from the genomes you have collected on the way, in its sealed cold vault. The last seed needs it, and so do the gates and MAX+ after it. One archive is enough: bring the genomes in by ME and cap the output.',
  ]),

  // ------------------------------------------------------------------ Sgr A* orbit
  gear('M_IMG', 'photon_ring_imager', 'Photon Ring Imager', ['M_L_IMG'], 2.5, 6, {
    for: 'It looks at the light that has gone round the hole, and from the ring it reads the spin and charts the cluster. The &6Photon Ring Imager&r is the eye of the whole era.',
    needs: 'The MAX hull, a ring of dish panels on a truss and a cold core of receivers, built in orbit around Sagittarius A*, with a Rydberg logic array. The body is 2,144 blocks (1,228 truss, 690 optical table, 220 droplet radiator casings): 1 Terminal pass.',
    unlocks: 'The spin map and the cluster ephemeris, both on the journey.',
    automate: 'It works one image at a time, so give it its own array supply and leave it.',
  }, [it('grindless:max_srf_cavity')]),
  gear('M_WINCH', 'geroch_winch', 'Geroch Winch', ['M_L_WINCH'], 2.5, 7.5, {
    for: 'A tether dropped over the horizon and wound on a drum. The &6Geroch Winch&r takes power from the hole\'s spin; each run uses up a canister and wears the tether.',
    needs: 'The MAX hull, a tall tower of drum casing over a tether well, and a canister and a tether for each run. The body is 3,107 blocks (1,554 truss, 420 droplet radiator, 380 clamp coil casings): 2 Terminal passes.',
    unlocks: 'The first power the galactic centre gives back.',
    automate: 'Canisters and tethers run out, so keep a pattern provider on them.',
  }, [DRUM], 150),
  gear('M_INJ', 'mass_stream_injector', 'Mass Stream Injector', ['M_L_INJ'], 2.5, 9, {
    for: 'It shapes hot flow into streams, and the streams into bundles. The &6Mass Stream Injector&r holds a shell up with moving mass.',
    needs: 'The MAX hull, a ring of stream-turn casing round a pellet accelerator, and a matter-wave gradiometer from the atom works at home. The body is 2,125 blocks (1,177 truss, 519 clamp coil casings): 1 Terminal pass.',
    unlocks: 'The stream bundle, which the mirror shell is built round.',
    automate: 'Pellets by ME; bundles come out in a chest and go straight to the shell.',
  }, [TURN]),
  prod('M_BUNDLE', 'Stream Bundle', 'grindless:stream_bundle', ['M_INJ'], 5, 9, [
    'Bound to be laid in rings round the shell. Ask for them as the segments go up.',
  ]),

  // ------------------------------------------------------------------ the belt
  gear('M_FURN', 'cluster_light_furnace', 'Cluster-Light Furnace', ['M_L_FURN'], 2.5, 11, {
    for: 'It melts belt rock with the concentrated light of the cluster, and heats, separates and casts in one structure. The &6Cluster-Light Furnace&r is the only source of segment truss and stream pellets in quantity.',
    needs: 'The MAX hull, a bowl of albedo panels over a sinter hearth, and sealed hearth liners. It works only in the NSC belt. The body is 3,041 blocks (1,577 truss, 1,027 optical table, 420 droplet radiator casings): 2 Terminal passes.',
    unlocks: 'The silicate slag the feeder burns, and the truss and pellets for the shell.',
    automate: 'The hearth lining wears, so keep spares; its slag and its volatiles each have somewhere to go.',
  }, [SINTER]),
  prod('M_SLAG', 'Silicate Slag', 'grindless:silicate_slag', ['M_FURN'], 5, 11, [
    'What is left of the rock once the iron is out. It is not wasted: Mercury\'s solar vapour furnace bakes it by day, the regolith cell reduces it, and a compressor and the spark plasma sinterer turn the residue into slag pellets for the feeder.',
  ]),
  gear('M_FEED', 'accretion_feeder', 'Accretion Feeder', ['M_SLAG'], 7.5, 11, {
    for: 'Slag spiralling into a hole gives back more of its mass as light than anything else in the pack. The &6Accretion Feeder&r catches that light and turns it into power.',
    needs: 'The MAX hull, a ring of feeder coil casing with collector panels and Wolter mirror modules, and slag pellets. The burn itself runs in the black hole orbit, not in the belt. The body is 3,415 blocks (1,726 truss, 216 droplet radiator casings): 2 Terminal passes.',
    unlocks: 'The biggest generator of the era, and a use for the slag.',
    automate: 'It wears its panels and modules as it works: rework them in the solar array fab and the assembler.',
  }, [COIL], 150),
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
