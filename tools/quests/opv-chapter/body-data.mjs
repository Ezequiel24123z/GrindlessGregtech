// Quest data for the six Bulge casings, the body of every large OpV structure (recipes read from the VM dump, dump 14 of 9f6c31872, not from the design doc).
// One quest per casing: what it is for, how it is made, which machines are built from it and how to automate it. The big structures say how many Terminal
// passes they take (a pass places up to 2,300 blocks), in the machine quests.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: {
    name: 'Bulge casings',
    origin: { x: 10, y: 31 },
    heading: {
      key: 'H_OPV_BODY', x: 0, y: 0, deps: ['BCHART'], icon: 'grindless:chain_lamina_casing',
      desc: ['The six casings of the Galactic Bulge: lamina, field-frozen, annihilation shield, NEG XHV, TPV wall and Kugelblitz cavity. They wall every large OpV structure, and each needs a part that only this era makes.'],
    },
  },
};

const c = (key, title, icon, deps, x, teach, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y: 0, teach, desc: [], tasks: [it(icon, 4)], rewards: [xp(xpN)],
});

export const QUESTS = [
  c('B_LAM', 'Chain Lamina Casing', 'grindless:chain_lamina_casing', ['H_OPV_BODY'], 2.5, {
    for: 'A casing of laminated strand lattice over neutronium and tungsten plate, cooled by superfluid helium-3. It is the plain, strong wall of the era.',
    needs: 'An assembler, 200 ticks: chain lamina stacks, single-wire strands, neutronium plate and frame, tungsten and stainless plates, a UXV sensor and superfluid helium-3, for four casings.',
    unlocks: 'The hulls and walls of the OpV structures, and the base of the casings that follow.',
    automate: 'Stacks and strands by ME; the helium-3 by pipe.',
  }, 80),
  c('B_FFC', 'Field-Frozen Casing', 'grindless:field_frozen_casing', ['B_LAM'], 5, {
    for: 'A casing of field-frozen plate, held still by a field so that nothing inside can touch it. The strangelet vault and the press are lined with it.',
    needs: 'The field freezing machine, 400 ticks: field-frozen plates, two UXV sensors and a programmed circuit, for three casings.',
    unlocks: 'The Strangelet Vault, the Field-Frozen Press and the Kugelblitz cavity casing.',
    automate: 'Plates from the press by ME; sensors by ME.',
  }, 80),
  c('B_SHD', 'Annihilation Shield Casing', 'grindless:annihilation_shield_casing', ['B_FFC'], 7.5, {
    for: 'A casing of gamma absorber tiles over a lithium-6 hydride shield, which stops gammas, neutrons and debris. Whatever holds antimatter is lined with it.',
    needs: 'An assembler, 400 ticks: gamma absorber tiles, a lithium-6 hydride shield, chain lamina stacks, tungsten plate, UXV sensors and a UXV motor, with superfluid helium-3, for four casings.',
    unlocks: 'The Antihydrogen Foundry, the Antiproton Complex, the Strangelet Vault and the Kugelblitz cavity casing.',
    automate: 'Tiles and shields by ME; keep a stock, since every antimatter machine takes many.',
  }, 100),
  c('B_NEG', 'NEG XHV Casing', 'grindless:neg_xhv_casing', ['B_SHD'], 10, {
    for: 'A casing lined with a non-evaporable getter that soaks up the last stray gas and holds an extreme-high vacuum. The foundry and the decelerator need it.',
    needs: 'An assembler, 400 ticks: an activated NEG chamber, chain lamina stacks, a stainless frame and two UXV pumps, with nitrogen, for four casings.',
    unlocks: 'The Antihydrogen Foundry and the Antiproton Complex.',
    automate: 'Chambers by ME; nitrogen by pipe.',
  }, 100),
  c('B_TPV', 'TPV Wall Casing', 'grindless:tpv_wall_casing', ['B_NEG'], 12.5, {
    for: 'A wall of thermophotovoltaic panels that turns the glow of a hot core back into current. It is what lets a Hawking collector or an annihilation engine feed itself.',
    needs: 'An assembler, 400 ticks: TPV panels, a gamma absorber tile, a chain lamina stack, copper, tungsten and stainless plate and two UXV sensors, with superfluid helium-3, for three casings.',
    unlocks: 'The Annihilation Engine and the Hawking Collector.',
    automate: 'Panels by ME; the helium-3 by pipe.',
  }, 100),
  c('B_KUG', 'Kugelblitz Cavity Casing', 'grindless:kugelblitz_cavity_casing', ['B_TPV'], 15, {
    for: 'The cavity that holds a Kugelblitz: a gamma mirror and field-frozen plate around an annihilation shield casing. It is the hardest casing of the age.',
    needs: 'The assembly line, 600 ticks: a gamma multilayer mirror, field-frozen plates, an annihilation shield casing, strand wires and a UXV field generator, for three casings.',
    unlocks: 'The Kugelblitz Forge and, through it, the gate to MAX.',
    automate: 'Build it from a dedicated line: every part is a product of an earlier casing or line.',
  }, 150),
].map((q) => ({ ...q, tasks: [it(q.icon, q.key === 'B_FFC' || q.key === 'B_TPV' || q.key === 'B_KUG' ? 3 : 4)] }));
