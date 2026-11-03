// Quest data for uiv_ladder: the superheavy ladder II (I2 of pl_uiv, docs/eras/lines-uev-uxv.md, section 8). The Superheavy Factory (the heavy ion cyclotron) irradiates a
// target and separates the recoil on the same line, as in the UEV ladder; these two quests follow the two heaviest runs. Element 120 and Census II keep their
// quests in the journey chapter. Recipes checked against the dump (fb65632509ee).
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UIV Superheavy Ladder II', origin: { x: 17.5, y: 2 } },
  filename: 'uiv_ladder',
  era: 'uiv',
  role: 'ladder',
  order: 6,
  icon: 'gtceu:heavy_ion_cyclotron',
  autofocus: 'L2_WHEEL',
  title: 'UIV: Superheavy Ladder II',
  subtitle: ['Two heavier runs for the Superheavy Factory: element 120 and element 119.'],
};

export const LINKS = [];

const l = (key, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
  ...(deps.some((d) => !d.startsWith('L2_')) ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  l('L2_WHEEL', 'Californium Wheel and Titanium Beam', 'grindless:activated_target_wheel', ['JUMP1'], 0, 0, {
    for: 'Element 120 needs a heavier target and bullet: californium on a wheel, hit by a titanium-50 beam. The &6Superheavy Factory&r irradiates the wheel, then picks the atoms out of the gas.',
    needs: 'A wheel blank (titanium plates and foils, circuit 21) and californium dust in the hot cell (circuit 12) for the wheel; titanium dust in an assembler (circuit 29) for the oven charge. The factory takes both, an Nb3Sn SRF cavity and helium (circuit 7) for the recoil gas, then an etched membrane (circuit 6) for the atoms.',
    unlocks: 'The Element 120 Recoil Record; the wheel is a loop, not a cost per run.',
    automate: 'Return activated wheels to the hot cell (circuit 11) by ME; keep two wheels.',
  }, [it('grindless:cf249_target_wheel'), it('grindless:ti50_oven_charge'), it('grindless:activated_target_wheel')], 220),
  l('L2_119', 'Einsteinium Target and Element 119', 'grindless:element_119_recoil', ['L2_WHEEL'], 3.5, 2, {
    for: 'Element 119 takes einsteinium on a wheel blank, struck by a calcium-48 beam. It is the other half of Census II.',
    needs: 'Einsteinium dust and a wheel blank in an assembler for the target; in the factory, the target, a calcium-48 beam charge, an SRF cavity and helium (circuit 8) make the gas, and a membrane (circuit 7) separates the atoms. The chemistry lab then seals them in a capsule for Census II (circuit 3).',
    unlocks: 'The Element 119 Recoil Record and Census II, which the journey chapter asks for.',
    automate: 'Einsteinium by ME from the decompressor; send the atoms straight to the chemistry lab.',
  }, [it('grindless:es254_target'), it('grindless:element_119_recoil')], 240),
];
