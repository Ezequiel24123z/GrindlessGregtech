// Quest data for uev_ladder: the superheavy ladder (E2 of pl_uev, docs/eras/lines-uev-uxv.md, section 8). The Calutron makes the bullet, the Superheavy Factory
// fires it at a target and picks the atoms out on the same line, and the chemistry lab counts them. The machines and the two isotope products keep their quests
// in uev_machines; these five follow the ladder itself. Recipes checked against the dump (804cc913d48a).
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UEV Superheavy Ladder', origin: { x: 31, y: -24 } },
  filename: 'uev_ladder',
  era: 'uev',
  role: 'ladder',
  order: 11,
  icon: 'gtceu:heavy_ion_cyclotron',
  autofocus: 'L_BEAM',
  title: 'UEV: Superheavy Ladder',
  subtitle: ['Five steps from a calcium-48 beam to the superheavy census.'],
};

export const LINKS = [];

const l = (key, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
  ...(deps.some((d) => !d.startsWith('L_')) ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  l('L_BEAM', 'The Calcium-48 Beam', 'grindless:ca48_beam', ['CA48'], 0, 0, {
    for: 'Calcium-48 is the bullet of every run. It is so rare that the &6Calutron&r needs two passes to enrich it.',
    needs: 'Calcium chloride through the Calutron twice (circuits 1 and 2); a mixer with tantalum foil for the crucible load; an assembler with platinum foil and argon for the oven charge; a reactor with helium for the plasma bunch (two per charge); and an assembler with a UV emitter and an SRF cryomodule for the beam charges.',
    unlocks: 'The Superheavy Factory runs: every irradiation recipe takes a beam charge (the heaviest runs use a titanium-50 charge or nickel-64 instead).',
    automate: 'The Calutron is slow, so run several and recycle the depleted chloride.',
  }, [it('grindless:ca48_oven_charge'), it('grindless:ca48_beam')], 140),
  l('L_PU', 'The Plutonium-244 Target', 'grindless:plutonium_244_target', ['PU', 'HIC'], 3.5, 2, {
    for: 'The beam needs something to hit. Plutonium-244 is plated onto a target that the Superheavy Factory holds in the beam.',
    needs: 'Plutonium-244 oxide dissolved in nitric acid into a glass ampoule (chemical reactor), then argon, two aluminium foils and a duranium plate in an assembler (circuit 22).',
    unlocks: 'Flerovium: calcium-48 on plutonium-244 is the first irradiation recipe of the ladder.',
    automate: 'The Calutron separates the plutonium; keep ampoules and targets by ME. The target is used in the run, so plan one per irradiation.',
  }, [it('grindless:pu244_plating_ampoule'), it('grindless:plutonium_244_target')], 120),
  l('L_WHEEL', 'The Berkelium Target Wheel', 'grindless:target_wheel', ['CAL'], 3.5, 4, {
    for: 'A heavier target than plutonium makes a heavier element, and it does not hold still: a rotating wheel spreads the heat of the beam. This one carries berkelium.',
    needs: 'Berkelium nitrate and oxygen in a chemical reactor (circuit 22) for berkelium oxide and recovered nitric acid; a target wheel blank from titanium plates and foils in an assembler (circuit 21); both in an assembler for the wheel.',
    unlocks: 'Tennessine. The run gives back an activated wheel, and the hot cell returns the blank, so the wheel is a loop and not a cost per run.',
    automate: 'Return activated wheels to the hot cell by ME and refill them; keep two wheels so one cools while the other runs.',
  }, [it('grindless:target_wheel_blank'), it('grindless:target_wheel')], 140),
  l('L_FLE', 'Flerovium Atoms', 'grindless:flerovium_atoms', ['L_BEAM', 'L_PU'], 7, 1, {
    for: 'The beam hits the plutonium and a few flerovium atoms recoil out in a gas. The Superheavy Factory, which also runs the recoil separation, picks them out of it through a membrane.',
    needs: 'Helium, the plutonium-244 target, a calcium-48 beam charge and a Nb3Sn SRF cavity (circuit 1) for the recoil gas; then the gas and an etched membrane (circuit 1) for the atoms. The membrane is a polycarbonate foil ion-tracked with californium-252 and etched with hydrochloric acid and sodium hydroxide.',
    unlocks: 'Flerovium for the superheavy census, and the same two-step pattern (irradiate, then separate) for every heavier element.',
    automate: 'Membranes and foils by ME; the output is a handful of atoms per run, so send them directly to the chemistry lab.',
  }, [it('grindless:ion_tracked_foil'), it('grindless:etched_membrane'), it('grindless:flerovium_atoms')], 160),
  l('L_CEN', 'Tennessine and the Census', 'grindless:superheavy_census', ['L_FLE', 'L_WHEEL', 'SHL'], 10.5, 2.5, {
    for: 'Tennessine comes from the berkelium wheel, flerovium from the plutonium target. The chemistry lab seals the tennessine atoms in a capsule and records all of them in the census.',
    needs: 'Tennessine atoms, a sealed capsule and silica aerogel (circuit 1) for the sample; flerovium, livermorium, moscovium and oganesson atoms with gold foil (circuit 2) for the census.',
    unlocks: 'The tennessine sample that the Warp Gate hold keeps stored, and the census that later lines spend.',
    automate: 'Sort atoms by element, one chest each; keep capsules and aerogel stocked. The census is a one-off per use, so brew it when a line asks.',
  }, [it('grindless:tennessine_sample'), it('grindless:superheavy_census')], 180),
];
