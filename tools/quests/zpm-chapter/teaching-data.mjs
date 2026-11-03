// Quest data for the ZPM teaching section: the ZPM multiblocks that no other quest of the era names. Rewards are XP only.
const PARENT = { key: 'ZI_HOT', x: 8.5, y: 21.5 };
const ROWS = [
  [
    ['ZPM_ISAMILL', 'Isamill', 'gtca:isamill',
      'The &6Isamill&r grinds ore into a fine mud that a plain macerator cannot reach.',
      'Its controller, with a niobium titanium wire, an Isa Mill gearbox and a ZPM hull.',
      'Milled almandine, chalcopyrite and grossular, ready for flotation.',
      'Ore in by bus, milled ore out by bus.', 80],
    ['ZPM_FLOTATION_CELL', 'Flotation Cell Regulator', 'gtca:flotation_cell_regulator',
      'The &6Flotation Cell Regulator&r floats the valuable minerals off the milled ore and leaves the rock behind.',
      'Its controller, with a hastelloy plate, yttrium barium cuprate wire and platinum foil.',
      'Monazite, almandine and chalcopyrite froth, and the metals they hold.',
      'Milled ore and reagents in, froth out by hatch.', 80],
  ],
];

export const CHAPTER = {
  section: { name: 'Ore Halls', origin: { x: 0, y: 0 }, heading: { key: 'ZPM_H_TEACHING', x: PARENT.x, y: PARENT.y + 2.5, deps: [PARENT.key], icon: 'gtca:isamill', desc: ['Two ZPM halls that treat ore before it reaches a line: milling and flotation.'] } },
};

export const QUESTS = ROWS.flatMap((row, r) => row.map(([key, title, item, f, n, u, a, xp], i) => ({
  key, kind: 'machine', title, icon: item,
  deps: [i > 0 ? row[i - 1][0] : 'ZPM_H_TEACHING'],
  x: PARENT.x + 2 + 2 * i, y: PARENT.y + 4.5 + 2 * r,
  teach: { for: f, needs: n, unlocks: u, automate: a },
  desc: [],
  tasks: [{ type: 'item', item }],
  rewards: [{ type: 'xp', xp }],
})));
