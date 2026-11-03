// Quest data for uxv_ladder: the superheavy ladder III (X3 of pl_uxv, docs/eras/lines-uev-uxv.md, section 8). The Superheavy Factory (the heavy ion cyclotron) irradiates a
// target with a titanium-50 beam and separates the recoil on the same line; these two quests follow the beam and the runs. The target quests (FM257, ES254), the
// two element quests (E121, E122) and the island chart keep their places in the journey. Recipes checked against the dump (9f6c318722c0).
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UXV Superheavy Ladder III', origin: { x: 15, y: -7 } },
  filename: 'uxv_ladder',
  era: 'uxv',
  role: 'ladder',
  order: 10,
  icon: 'gtceu:heavy_ion_cyclotron',
  autofocus: 'L3_TI50',
  title: 'UXV: Superheavy Ladder III',
  subtitle: ['The titanium-50 beam and the two runs of the Superheavy Factory: element 121 and element 122.'],
};

export const LINKS = [];

const l = (key, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
  ...(deps.some((d) => !d.startsWith('L3_')) ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  l('L3_TI50', 'Titanium-50 Beam Charge', 'grindless:ti50_oven_charge', ['FM257'], 0, 0, {
    for: 'Both runs of this age fire the same bullet: titanium-50, the rare isotope of titanium. The ion source burns one oven charge per run.',
    needs: 'The pyroprocessing cell turns enriched titanium-50 chloride and magnesium into sponge (circuit 6). The levitation melter melts the sponge under helium into titanium-50 dust (circuit 3). An assembler (200 ticks, circuit 29) presses the dust with a titanium foil into the oven charge.',
    unlocks: 'The Element 121 and Element 122 runs in the Superheavy Factory.',
    automate: 'Chloride and magnesium by ME; the charge is small, so make a stack at a time and stock it beside the factory.',
  }, [it('gtceu:titanium_50_dust'), it('grindless:ti50_oven_charge')], 180),
  l('L3_RUNS', 'Elements 121 and 122', 'grindless:element_122_recoil', ['L3_TI50', 'E121'], 3.5, 2, {
    for: 'An einsteinium-254 target struck by the titanium beam gives element 121; a fermium-257 target gives element 122.',
    needs: 'In the &6Superheavy Factory&r, a target, an oven charge, an Nb3Sn SRF cavity and helium (circuit 9 for 121, circuit 10 for 122) make the recoil gas; each run takes 48,000 ticks. It then separates the atoms with an etched membrane (2,400 ticks, circuits 8 and 9). The lab seals each batch in a capsule (circuit 8 and 9), and Census III joins both, with Census II (circuit 10).',
    unlocks: 'The Superheavy Census III, and with it the island chart.',
    automate: 'Run both targets in one factory on a schedule; the atoms last seconds: pipe the gas to the lab by ME, never store it.',
  }, [it('grindless:element_121_recoil'), it('grindless:element_122_recoil'), it('grindless:superheavy_census_iii')], 260),
];
