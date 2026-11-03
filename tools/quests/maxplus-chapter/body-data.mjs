// Quest data for the six horizon casings that wall the MAX+ structures, and for the four of them that make up the body of the Hyperstargate.
// Recipes read from the VM dump (9f6c31872): every casing is an assembler recipe at MAX voltage that also takes two FFKM seals and 250 mB of helium-3.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: {
    name: 'Horizon casings',
    origin: { x: 38, y: 12 },
    heading: {
      key: 'H_MXB', x: 0, y: 0, deps: ['LN_PROC'], icon: 'grindless:bound_lattice_casing',
      desc: ['The six casings of the horizon age, and the body they give the Hyperstargate. The first two wall almost every MAX+ structure; the rest each need iron-56 or a part only this age makes.'],
    },
  },
};

const c = (key, title, icon, deps, x, teach, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y: 0, teach, desc: [], tasks: [it(icon, 4)], rewards: [xp(xpN)],
});
const r = (key, title, icon, deps, x, text, xpN) => ({
  key, kind: 'reading', title, icon, deps, x, y: 0, desc: [text], tasks: [ck()], rewards: [xp(xpN)],
});

export const QUESTS = [
  c('B_BOUND', 'Bound Lattice Casing', 'grindless:bound_lattice_casing', ['H_MXB'], 2.5, {
    for: 'The plain wall of the horizon age: a bound degenerate billet braced by tensegrity trusses. Every large structure of the age, from the press to the array, is mostly this.',
    needs: 'An assembler, 200 ticks: a bound degenerate billet, two Kerr strand wires, two tensegrity truss casings, a MAX sensor,     two FFKM seals and a quarter bucket of superfluid helium-3, for four casings.',
    unlocks: 'Every horizon structure, and the Kerr coil casing.',
    automate: 'Billets and wire by ME; the helium-3 by pipe. Make it by the thousand: one structure takes thousands of blocks.',
  }, 100),
  c('B_KERR', 'Kerr Coil Casing', 'grindless:kerr_coil_casing', ['B_BOUND'], 5, {
    for: 'A casing wound with a Kerr field coil, which holds the field the bound matter is shaped in. It is the second wall of the age.',
    needs: 'An assembler, 400 ticks: a Kerr field coil, a bound lattice casing, a MAX emitter, a MAX electric pump,     two FFKM seals and a quarter bucket of superfluid helium-3, for two casings.',
    unlocks: 'The slingshot, the lift, the burner, the torus and the other Kerr-field structures.',
    automate: 'Coils by ME; the casing it is built on comes from the line before.',
  }, 100),
  c('B_FE56', 'Fe-56 Shield Casing', 'grindless:fe56_shield_casing', ['B_KERR'], 7.5, {
    for: 'A casing of plate made of iron-56 with lithium-6 and tungsten, the most stable iron there is. It shields the polarised fusion stellarator and the pedestal of the Hyperstargate.',
    needs: 'An assembler, 400 ticks: six plates of iron-56, two lots of lithium-6, a tungsten plate, a MAX conveyor module, a MAX sensor, two FFKM seals and a quarter bucket of superfluid helium-3, for four casings.',
    unlocks: 'The polarised fusion stellarator and the Hyperstargate.',
    automate: 'Plates of iron-56 from the hot cell by ME; lithium-6 from its own line.',
  }, 120),
  c('B_CRYO', 'Primordial Cryostat Casing', 'grindless:primordial_cryostat_casing', ['B_FE56'], 10, {
    for: 'A casing cooled by primordial helium-3, for the parts of a structure that must stay near absolute zero.',
    needs: 'An assembler, 400 ticks: two plates of iron-56, a helium-4 dewar, a NEG XHV casing, two MAX electric pumps, a MAX sensor, an OpV fluid regulator, two FFKM seals and a quarter bucket of pristine helium-3, for two casings.',
    unlocks: 'The polarised fusion stellarator and the cold channel of the Hyperstargate.',
    automate: 'Dewars and regulators by ME; pristine helium-3 by pipe from its line.',
  }, 120),
  c('B_WIN', 'Void Diamond Window', 'grindless:void_diamond_window', ['B_CRYO'], 12.5, {
    for: 'A window of diamond grown in the void, clear to every wavelength. It lets the ring of the Hyperstargate be seen and aimed.',
    needs: 'An assembler, 200 ticks: two void-grown diamonds, a plate of iron-56, a MAX sensor, an OpV emitter, two FFKM seals and a quarter bucket of superfluid helium-3, for two windows.',
    unlocks: 'The windows of the Hyperstargate.',
    automate: 'Diamonds from the void crystal fab by ME.',
  }, 120),
  c('B_GATE', 'Horizon Gate Casing', 'grindless:horizon_gate_casing', ['B_WIN'], 15, {
    for: 'The hardest casing of the age and the jacket of the Hyperstargate: iron-56 and void diamond around a field generator. Almost half the gate is this block.',
    needs: 'The assembly line, 600 ticks, with the MAX field coil research: four plates of iron-56, a void-grown diamond, a MAX field coil, a MAX field generator, an OpV emitter, two FFKM seals and a quarter bucket of pristine helium-3, for two casings.',
    unlocks: 'The Hyperstargate.',
    automate: 'A dedicated line: the gate takes thousands of these, so every part must come from a line, never by hand.',
  }, 200),

  r('HGB_JACKET', 'The Gate Jacket', 'grindless:horizon_gate_casing', ['B_GATE'], 17.5,
    'About half of the Hyperstargate is horizon gate casing. It forms the shell that the ring sits in, so the gate line has to run long before the Terminal is put to work.', 100),
  r('HGB_COLD', 'The Cold Channel', 'grindless:primordial_cryostat_casing', ['HGB_JACKET'], 20,
    'Some 1,600 primordial cryostat casings line the channel behind the ring, with helium-3 running through them to keep the dial cold.', 100),
  r('HGB_WIN', 'The Windows', 'grindless:void_diamond_window', ['HGB_COLD'], 22.5,
    'Some 380 void diamond windows sit round the ring. They are few, but each needs two void-grown diamonds.', 100),
  r('HGB_PED', 'The Pedestal', 'grindless:fe56_shield_casing', ['HGB_WIN'], 25,
    'Some 2,700 Fe-56 shield casings form the pedestal and the frame, and the controller and its hatches are set among them. Build the gate in six Terminal passes, shell first.', 100),
];
